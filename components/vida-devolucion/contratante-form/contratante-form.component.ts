import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import {
  FormGroup,
  FormBuilder,
  Validators,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { BsDatepickerConfig } from 'ngx-bootstrap/datepicker';
import moment from 'moment';
import { RecaptchaComponent } from 'ng-recaptcha';

// SERVICES
import { UtilsService } from '@shared/services/utils/utils.service';
import { VidaDevolucionService } from '../../../services/vida-devolucion/vida-devolucion.service';
import { NewClientService } from '../../../services/vida-devolucion/new-client/new-client.service';

// UTILS
import { RegularExpressions } from '@shared/regexp/regexp';

// INTERFACES
import {
  IClienteInformationRequest,
  IClienteInformationResponse,
  IDocumentInformationRequest,
} from '@shared/interfaces/document-information.interface';
import { IClienteRiesgoRequest } from '../../../../../shared/interfaces/cliente-riesgo.interface';
import { IDocumentInfoRequest } from '@shared/interfaces/document-information.interface';

// MODELS
import { DocumentInformationModel } from '@shared/models/document-information/document-information.model';
import { DocumentInfoResponseModel } from '@shared/models/document-information/document-information.model';
import { AppConfig } from '../../../../../app.config';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-contratante-form',
  templateUrl: './contratante-form.component.html',
  styleUrls: ['./contratante-form.component.scss'],
})
export class ContratanteFormComponent implements OnInit {
  @Output() contractorDataChange: EventEmitter<any> = new EventEmitter<any>();
  @Input() set contractorData(values: any) {
    this.form.patchValue(values || {}, {
      emitEvent: false,
    });

    if (values) {
      this.form.markAllAsTouched();
    }
  }
  FECHA_NAC_IS_ERROR: boolean;
  limitDate: Date;
  birthdateConfig: Partial<BsDatepickerConfig> = Object.assign(
    {},
    {
      dateInputFormat: 'DD/MM/YYYY',
      locale: 'es',
      containerClass: 'theme-dark-blue',
      showWeekNumbers: true,
      maxDate: new Date(),
    }
  );

  documentNumberLimit: { min: number; max: number } = {
    min: 8,
    max: 8,
  };

  form: FormGroup = this.builder.group({
    documentType: [{ value: 2, disabled: true }],
    documentNumber: [
      null,
      Validators.compose([
        Validators.pattern(RegularExpressions.numbers),
        Validators.required,
        Validators.minLength(this.documentNumberLimit.min),
        Validators.maxLength(this.documentNumberLimit.max),
      ]),
    ],
    email: [
      null,
      Validators.compose([
        Validators.pattern(RegularExpressions.email),
        Validators.required,
      ]),
    ],
    phoneNumber: [
      null,
      Validators.compose([
        Validators.pattern(RegularExpressions.numbers),
        Validators.required,
        Validators.minLength(9),
        Validators.maxLength(9),
      ]),
    ],
    birthdate: [null, Validators.required],
  });

  documentInformation$: any;
  riskClientInfo$: any;
  isValidFechaNacimiento: boolean;
  siteKey = AppConfig.CAPTCHA_KEY;

  isLoadedAllServices =
    this.vidaDevolucionService.storage?.isLoadedAllServices || false;

  @ViewChild('recaptchaRef', { static: true }) recaptcha: RecaptchaComponent;

  constructor(
    private readonly builder: FormBuilder,
    private readonly spinner: NgxSpinnerService,
    private readonly utilService: UtilsService,
    private readonly vidaDevolucionService: VidaDevolucionService,
    private readonly newClientService: NewClientService
  ) {
    this.isValidFechaNacimiento = true;
    this.limitDate = new Date(
      new Date().setFullYear(Number(new Date().getFullYear()) - 18)
    );
  }

  ngOnInit(): void {
    if (
      Object.keys(this.vidaDevolucionService?.storage?.rickClientInfo || [])
        .length
    ) {
      this.riskClientInfo$ = this.vidaDevolucionService.storage?.rickClientInfo;
      this.emitContractorForm();
    }
    if (
      Object.keys(
        this.vidaDevolucionService?.storage?.documentInformation || []
      ).length
    ) {
      this.documentInformation$ =
        this.vidaDevolucionService.storage?.documentInformation;
      this.emitContractorForm();
    }
    //this.getDocumentInformation();
    if (this.contractorForm['documentNumber'].valid) this.requestClientInfo();
    this.validationsForm();
  }

  get contractorForm(): { [key: string]: AbstractControl } {
    return this.form.controls;
  }

  get currentUser(): any {
    return JSON.parse(localStorage.getItem('currentUser') || '{}');
  }

  private validationsForm(): void {
    this.contractorForm['phoneNumber'].valueChanges.subscribe(
      (value: string) => {
        console.log('value: ', value);
        if (value) {
          let primerDigito = value.toString().slice(0, 1);
          if (
            this.contractorForm['phoneNumber'].hasError('pattern') ||
            +primerDigito !== 9
          ) {
            this.contractorForm['phoneNumber'].setValue(
              value.slice(0, value.length - 1)
            );
          }
        }
      }
    );

    this.contractorForm['documentNumber'].valueChanges.subscribe(
      (value: string) => {
        this.isLoadedAllServices = false;
        this.vidaDevolucionService.storage = {
          isLoadedAllServices: false,
        };
        if (value) {
          this.documentInformation$ = null;
          this.riskClientInfo$ = null;
          if (this.contractorForm['documentNumber'].hasError('pattern')) {
            this.contractorForm['documentNumber'].setValue(
              value.slice(0, value.length - 1)
            );
          }
        }
        this.getClientAdviser();
      }
    );

    this.contractorForm['birthdate'].valueChanges.subscribe((value: string) => {
      if (value) {
        if (value.toString().indexOf('/') == -1) {
          this.isValidFechaNacimiento = new Date(value) <= this.limitDate;

          this.contractorForm['birthdate'].setValue(
            moment(value).format('DD/MM/YYYY'),
            {
              emitEvent: false,
            }
          );
        }
      }
    });

    this.form.valueChanges.subscribe(() => {
      this.emitContractorForm();
    });
  }

  private getClientAdviser(): void {
    if (this.contractorForm['documentNumber'].valid) {
      const payload = {
        idAsesor: +this.currentUser.id,
        idTipoDocumento: +this.contractorForm['documentType'].value,
        numeroDocumento: this.contractorForm['documentNumber'].value,
      };
      this.spinner.show();
      this.isLoadedAllServices = false;
      this.newClientService.clientAdviser(payload).subscribe({
        next: (response: any) => {
          this.spinner.hide();
          this.vidaDevolucionService.storage = {
            cotiza: response.cotiza,
          };
          if (response.cotiza) {
            this.isLoadedAllServices = false;
            // this.getDocumentInformation();
            this.requestClientInfo();
          } else {
            this.requestClientInfo();
            // this.getDocumentInformation();
            this.isLoadedAllServices = true;
            this.vidaDevolucionService.storage = {
              isLoadedAllServices: true,
            };
          }
          this.emitContractorForm();
        },
        error: (error: HttpErrorResponse) => {
          console.error(error);
          this.spinner.hide();
          this.isLoadedAllServices = true;
          this.vidaDevolucionService.storage = {
            isLoadedAllServices: true,
          };
          this.emitContractorForm();
        },
      });
    }
  }

  private getDocumentInformation(token): void {
    if (this.contractorForm['documentNumber'].valid) {
      const payloadInformacion: IDocumentInfoRequest = {
        idRamo: 71,
        idTipoDocumento: +this.contractorForm['documentType'].value,
        numeroDocumento: this.contractorForm['documentNumber'].value,
        idUser: +this.currentUser.id,
        token: token,
      };

      const payloadCliente: IClienteInformationRequest = {
        Ramo: 71,
        Producto: 1,
        TipoDocumento: +this.contractorForm['documentType'].value,
        Documento: this.contractorForm['documentNumber'].value,
      };

      this.spinner.show();

      this.isLoadedAllServices = false;
      forkJoin([
        this.utilService.documentInfoResponse(payloadInformacion),
        this.vidaDevolucionService.getInformacion(payloadCliente),
      ]).subscribe({
        next: ([responseInformacion, responseClient]) => {
          let response = this.parseDocumentInformationModel(
            responseInformacion,
            responseClient
          );
          this.contractorForm['email'].setValue(response.email);
          this.contractorForm['phoneNumber'].setValue(response.phoneNumber);
          this.contractorForm['birthdate'].setValue(
            response.birthdate,
            (this.isValidFechaNacimiento =
              new Date(response.birthdate) <= this.limitDate)
          );
          this.spinner.hide();
          this.vidaDevolucionService.storage = {
            documentInformation: response,
          };
          this.isLoadedAllServices = true;
          this.vidaDevolucionService.storage = {
            isLoadedAllServices: true,
          };
          if (response.success) {
            this.documentInformation$ = response;
            this.form.patchValue(this.documentInformation$, {
              emitEvent: false,
            });
          }
          this.vidaDevolucionService.storage = {
            isLoadedAllServices: true,
          };

          const dayFq = response.birthdate.substring(0, 2);
          const mesFq = response.birthdate.substring(3, 5);
          const yearFq = response.birthdate.substring(6, 10);
          const fechaNacimientoFormatToValidateq = new Date(
            `${yearFq}/${mesFq}/${dayFq}`
          );
          (this.isValidFechaNacimiento =
            new Date(fechaNacimientoFormatToValidateq) <= this.limitDate),
            this.emitContractorForm();
          const dayF = response.birthdate.substring(0, 2);
          const mesF = response.birthdate.substring(3, 5);
          const yearF = response.birthdate.substring(6, 10);
          const fechaNacimientoFormatToValidate = new Date(
            `${yearF}/${mesF}/${dayF}`
          );
          this.isValidFechaNacimiento =
            fechaNacimientoFormatToValidate <= this.limitDate;
        },
        error: (error: HttpErrorResponse) => {
          console.error(error);
          this.spinner.hide();
          this.isLoadedAllServices = true;
          this.vidaDevolucionService.storage = {
            isLoadedAllServices: true,
          };
          this.emitContractorForm();
        },
      });
    }
  }

  private riskClient(payload: any): void {
    this.spinner.show();
    this.utilService.clienteRiesgo(payload).subscribe({
      next: (response: any) => {
        this.spinner.hide();
        this.riskClientInfo$ = response;
        this.vidaDevolucionService.storage = {
          riskClientInfo: response,
        };
        this.isLoadedAllServices = true;
        this.vidaDevolucionService.storage = {
          isLoadedAllServices: true,
        };
        this.emitContractorForm();
      },
      error: (error: any) => {
        console.error(error);
        this.spinner.hide();
        this.isLoadedAllServices = true;
        this.vidaDevolucionService.storage = {
          isLoadedAllServices: true,
        };
        this.emitContractorForm();
      },
    });
  }

  private emitContractorForm(): void {
    this.contractorDataChange.emit({
      ...this.documentInformation$,
      ...this.form.getRawValue(),
      isValidForm: this.form.valid,
      isGetDocumentInfo: this.documentInformation$?.success,
      isValidDocumentNumber: this.contractorForm['documentNumber'].valid,
      cotiza: this.vidaDevolucionService?.storage?.cotiza || false,
      isLoadedAllServices: this.isLoadedAllServices,
      isAged: this.isValidFechaNacimiento,
    });
  }

  requestClientInfo() {
    this.recaptcha.execute();
  }

  resolved(token: string) {
    if (token) {
      this.getDocumentInformation(token);
      this.recaptcha.reset();
      return;
    }
  }

  parseDocumentInformationModel(
    datos: DocumentInfoResponseModel,
    polizas: IClienteInformationResponse
  ): DocumentInformationModel {
    let result: DocumentInformationModel = {
      ...datos,
      polizasAnuladas: polizas.polizasAnuladas,
      clienteAnulado: polizas.clienteAnulado,
      id: polizas.id,
    };
    return result;
  }
}
