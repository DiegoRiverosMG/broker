import {
  Component,
  EventEmitter,
  OnInit,
  Output,
  TemplateRef,
  ViewChild,
  ViewContainerRef,
} from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import {
  FormGroup,
  FormBuilder,
  AbstractControl,
  Validators,
  FormArray,
  FormControl,
} from '@angular/forms';
import { NgxSpinnerService } from 'ngx-spinner';
import { HttpErrorResponse } from '@angular/common/http';

import { UtilsService } from '@shared/services/utils/utils.service';
import { VidaDevolucionService } from '../../../services/vida-devolucion/vida-devolucion.service';
import { QuotationService } from '../../../services/vida-devolucion/quotation/quotation.service';
import { SummaryService } from '../../../services/vida-devolucion/summary/summary.service';
import { Step4Service } from '../../../../../layout/vidaindividual-latest/services/step4/step4.service';
import { ParametersResponse } from '@shared/models/ubigeo/parameters.model';
import { RegularExpressions } from '@shared/regexp/regexp';
import { fadeAnimation } from '@shared/animations/animations';
import { AppConfig } from '@root/app.config';
import moment from 'moment';
import { IDocumentInformationRequest } from '../../../../../shared/interfaces/document-information.interface';
import { DocumentInformationModel } from '../../../../../shared/models/document-information/document-information.model';
import { BsDatepickerConfig } from 'ngx-bootstrap/datepicker';

@Component({
  selector: 'app-data-product',
  templateUrl: './data-product.component.html',
  styleUrls: ['./data-product.component.scss'],
  animations: [fadeAnimation],
})
export class DataProductComponent implements OnInit {
  @Output() reload: EventEmitter<boolean> = new EventEmitter();
  @Output() statusChange: EventEmitter<any> = new EventEmitter();

  formFamily: FormGroup;

  /* Adjuntar */
  formAttachments: FormGroup;

  cotizacion: number;

  form: FormGroup;
  formBen: FormGroup;
  formBeneficiary: FormGroup;
  documentNumberCharacterLimit: {
    min: number;
    max: number;
  };
  editMode: boolean;
  percents: Array<number> = [];
  formLinkContratante: FormGroup;

  showbeneficiariesSelectedQuotation$: Array<any> = [];
  /* Servicios */
  parameters$: ParametersResponse;
  parentesco$: Array<any>;
  blockEmail: boolean;
  isCopied = false;
  isCopiedAsegurado = false;
  isCopiedContratante = false;
  quotationSummary$: any = {};

  clientId: any;
  chrono: boolean;
  message: string;

  tariff = this.vidaDevolucionService.storage?.buyInsurance || {};
  contractor = this.vidaDevolucionService.storage?.contractor || {};
  idecon = this.vidaDevolucionService.storage?.idecon || {};
  worldCheck = this.vidaDevolucionService.storage?.worldCheck || {};
  scoring = this.vidaDevolucionService.storage?.scoring;
  get estadoProspecto(): any {
    return this.vidaDevolucionService.storage?.estado || {};
  }

  typeAction = 0;
  stateType: number;
  bsConfigBirthdate: Partial<BsDatepickerConfig>;
  listAttachmentsSummary = new Array();

  returnPath = null;
  beneficiariesSelectedQuotation$: Array<any>;
  editBeneficiary$: Array<any> = [];
  typeClients: any;

  finprimernombre = 4;
  isEditFamily = false;

  formFamilyErrorMessage: string = null;

  listFamily = new Array();

  @ViewChild('modalConfirmar', { static: false, read: TemplateRef })
  _modalConfirmar: TemplateRef<any>;
  @ViewChild('modalConfirmarAceptar', { static: false, read: TemplateRef })
  _modalConfirmarAceptar: TemplateRef<any>;
  @ViewChild('modalMessage', { static: true, read: TemplateRef })
  modalMessage: TemplateRef<any>;
  @ViewChild('modalConfirmUpdateState', { static: true, read: TemplateRef })
  modalConfirmUpdateState: TemplateRef<any>;
  @ViewChild('modalFamily', { static: true, read: TemplateRef })
  modalFamily: TemplateRef<any>;
  @ViewChild('modalBeneficiary', { static: false, read: TemplateRef })
  _modalBeneficiary: TemplateRef<any>;

  constructor(
    private route: ActivatedRoute,
    private readonly builder: FormBuilder,
    private readonly _vc: ViewContainerRef,
    private readonly utilsService: UtilsService,
    private readonly vidaDevolucionService: VidaDevolucionService,
    private readonly step4Service: Step4Service,
    private readonly summaryService: SummaryService,
    private readonly quotationService: QuotationService,
    private readonly spinner: NgxSpinnerService,
    private readonly router: Router
  ) {
    this.form = builder.group({
      link: [null],
    });
    this.formLinkContratante = builder.group({
      linkAsegurado: [null],
      linkContratante: [null],
    });
    this.chrono = true;
    this.blockEmail = true;
    this.formAttachments = this.builder.group({
      files: this.builder.array([]),
    });
    this.formFamily = this.builder.group({
      dni: [
        null,
        [
          Validators.required,
          Validators.pattern(RegularExpressions.numbers),
          Validators.maxLength(8),
          Validators.minLength(8),
        ],
      ],
      nombres: [
        null,
        [Validators.required, Validators.pattern(RegularExpressions.text)],
      ],
      apellidoPaterno: [
        null,
        [Validators.required, Validators.pattern(RegularExpressions.text)],
      ],
      apellidoMaterno: [
        null,
        [Validators.required, Validators.pattern(RegularExpressions.text)],
      ],
      parentesco: [null, Validators.required],
    });
    this.documentNumberCharacterLimit = {
      min: 8,
      max: 8,
    };
    this.editMode = false;
    this.formBen = this.builder.group({
      id: [null],
      clientName: [null],
      typeBeneficiaries: [null, Validators.required],
      beneficiaries: this.builder.array([]),
    });
    this.bsConfigBirthdate = Object.assign(
      {},
      {
        locale: 'es',
        showWeekNumbers: false,
        dateInputFormat: 'DD/MM/YYYY',
        maxDate: new Date(),
        // maxDate: this.limitDate
      }
    );
    this.formBeneficiary = this.builder.group({
      id: [null],
      codigoCliente: [null],
      idTipoPersona: [null],
      idTipoDocumento: [null, Validators.required],
      numeroDocumento: [
        null,
        Validators.compose([
          Validators.pattern(RegularExpressions.numbers),
          Validators.required,
          Validators.minLength(this.documentNumberCharacterLimit.min),
          Validators.maxLength(this.documentNumberCharacterLimit.max),
        ]),
      ],
      nombres: [null, Validators.required],
      apellidoPaterno: [null, Validators.required],
      apellidoMaterno: [null, Validators.required],
      idDepartamento: [null],
      departamento: [null],
      idProvincia: [null],
      provincia: [null],
      idDistrito: [null],
      distrito: [null],
      direccion: [null],
      correo: [null],
      telefono: [null],
      idParentesco: [null],
      parentesco: [null, Validators.required],
      porcentajeParticipacion: [null, Validators.required],
      idNacionalidad: [null],
      nacionalidad: [null, Validators.required],
      idSexo: [null, Validators.required],
      sexo: [null],
      fechaNacimiento: [null, Validators.required],
      estado: [null],
    });
  }

  get f(): { [key: string]: AbstractControl } {
    return this.form.controls;
  }
  get fc(): { [key: string]: AbstractControl } {
    return this.formLinkContratante.controls;
  }
  get fbcies(): { [key: string]: AbstractControl } {
    return this.formBen.controls;
  }
  get fben(): FormArray {
    return this.fbcies['beneficiaries'] as FormArray;
  }

  get listAttachments(): FormArray {
    return this.formAttachments.get('files') as FormArray;
  }

  get formFamilyControl(): any {
    return this.formFamily.controls;
  }

  get currentUser(): any {
    return this.vidaDevolucionService.currentUser;
  }

  get score(): any {
    const montoCambio = +this.vidaDevolucionService.storage?.montoCambio;
    const primaAnual = +this.quotationSummary$?.primaAnual;
    const moneda = +this.quotationSummary$?.idMoneda;

    let primaAnualTransform = primaAnual;

    if (moneda == 1) {
      primaAnualTransform = primaAnualTransform / montoCambio;
    }

    const res = {
      pep:
        this.idecon.isPep || this.worldCheck.isPep || this.worldCheck.isFamPep,
      prima: primaAnualTransform,
      primaAlta: primaAnualTransform >= 1500,
      description: this.scoring?.calificacion,
    };
    return res;
  }

  get storage(): any {
    return this.vidaDevolucionService.storage;
  }

  get ammountParseDolar(): number {
    const quote = this.vidaDevolucionService.storage.summaryQuotationSelected;
    const primaAnual = +quote?.primaAnual || 0;
    const currency = +quote?.idMoneda;
    const montoCambio = +this.contractorService?.tipoCambio?.valor || 0;

    return currency == 1 ? primaAnual / (montoCambio || 1) : primaAnual;
  }

  get contractorService(): any {
    return this.vidaDevolucionService.storage?.contractorService || {};
  }

  ngOnInit(): void {
    this.typeClients = this.vidaDevolucionService.storage?.typeClients;
    this.route.queryParams.subscribe((params) => {
      this.clientId = params?.cliente;
      this.getRelatives();
      this.getParams();
    });
    if (this.vidaDevolucionService.storage?.quotationSelected) {
      this.cotizacion = this.vidaDevolucionService.storage?.quotationSelected;
    }
    if (this.vidaDevolucionService.storage?.summaryQuotationSelected) {
      this.quotationSummary$ =
        this.vidaDevolucionService.storage?.summaryQuotationSelected;
    }
    this.f['link'].setValue(
      `${AppConfig.DOMAIN_URL}/vidadevolucion/step1?processId=${this.cotizacion}&ndoc=${this.vidaDevolucionService.storage.contractorService.asegurado.numeroDocumento}`
    );
    this.fc['linkAsegurado'].setValue(
      `${AppConfig.DOMAIN_URL}/vidadevolucion/step1?processId=${this.cotizacion}&ndoc=${this.vidaDevolucionService?.storage?.contractorService.asegurado.numeroDocumento}`
    );
    this.fc['linkContratante'].setValue(
      `${AppConfig.DOMAIN_URL}/vidadevolucion/step1?processId=${
        this.cotizacion
      }&ndoc=${
        this.vidaDevolucionService?.storage?.contractorServiceContratante
          ?.documentNumber ??
        this.vidaDevolucionService?.storage?.contractorServiceContratante
          ?.numeroDocumento
      }`
    );
    this.utilsService.parameters().subscribe(
      (res: ParametersResponse) => {
        this.parameters$ = res;
        this.parentesco$ = this.parameters$.parentescos;
      },
      (err: any) => {
        console.error(err);
      }
    );

    if (
      (this.score.primaAlta || this.score.pep) &&
      this.currentUser.comercial
    ) {
      this.typeAction = 1;
    }

    if (this.score.pep && this.currentUser.soporte) {
      this.typeAction = 2;
    }

    if (
      !this.score.pep &&
      this.currentUser.soporte &&
      this.stateTypeValue != 3
    ) {
      this.typeAction = 3;
    }
    this.getQuotationSummary();
    this.familyValidations();
    for (let i = 10; i <= 100; i += 10) {
      this.percents.push(i);
    }
    this.percents.push(25);
    this.percents.push(35);
    this.percents = this.percents.sort((x, y) => x - y);

    this.fbe['idTipoDocumento'].valueChanges.subscribe((val) => {
      switch (Number(val)) {
        case 2: {
          this.fbe['apellidoPaterno'].clearValidators();
          this.fbe['apellidoMaterno'].setValidators([Validators.required]);
          this.documentNumberCharacterLimit = { min: 8, max: 8 };
          this.fbe['nacionalidad'].disable();
          break;
        }
        case 4: {
          this.documentNumberCharacterLimit = { min: 9, max: 12 };
          this.fbe['apellidoPaterno'].clearValidators();
          this.fbe['apellidoMaterno'].setValidators([Validators.required]);
          this.fbe['nacionalidad'].enable();
          break;
        }
      }

      this.fbe['numeroDocumento'].setValidators([
        Validators.compose([
          Validators.required,
          Validators.pattern(/^[0-9]*$/),
          Validators.minLength(this.documentNumberCharacterLimit.min),
          Validators.maxLength(this.documentNumberCharacterLimit.max),
        ]),
      ]);
      this.setIdBeneficiary();
    });

    this.fbe['numeroDocumento'].valueChanges.subscribe((_: string) => {
      this.setIdBeneficiary();
      if (_ && !RegularExpressions.numbers.test(_)) {
        this.fbe['numeroDocumento'].setValue(_.slice(0, _.length - 1));
      }
    });
  }

  getParams(): void {
    this.spinner.show();
    this.quotationService.getParams().subscribe({
      next: (response: any) => {
        this.spinner.hide();
        if (response.success) {
          response.documentos?.forEach((e: any) => {
            if (!this.currentUser.analista && +e.id == 4) {
              return;
            }
            this.listAttachments.push(
              this.builder.group({
                fileId: [e.id, Validators.required],
                fileType: [e.descripcion, Validators.required],
                fileName: [null, Validators.required],
                routeFile: [null, Validators.required],
                file: [null, Validators.required],
                uploaded: [false],
                fileBase: [null],
              })
            );
          });
          if (this.clientId) {
            this.getAttachmentsSummary();
          }
        }
      },
      error: (error: HttpErrorResponse) => {
        console.error(error);
        this.spinner.hide();
      },
    });
  }

  getRelatives(): void {
    this.summaryService.getFamiliaries(this.clientId).subscribe({
      next: (response: any) => {
        if (response.success) {
          response.listadoFamiliares.forEach((e: any) => {
            const formFamily = {
              dni: e.numeroDocumento,
              nombres: e.nombres,
              apellidoPaterno: e.apellidoPaterno,
              apellidoMaterno: e.apellidoMaterno,
              parentesco: +e.codigoParentesco,
            };
            this.listFamily.push(formFamily);
          });
        }
      },
      error: (error: HttpErrorResponse) => {
        console.error(error);
      },
    });
  }

  familyValidations(): void {
    this.formFamilyControl['dni'].valueChanges.subscribe((val: string) => {
      if (val) {
        if (this.formFamilyControl['dni'].hasError('pattern')) {
          this.formFamilyControl['dni'].setValue(
            val.substring(0, val.length - 1)
          );
        }
      }
    });

    this.formFamilyControl['nombres'].valueChanges.subscribe((_: string) => {
      if (!RegularExpressions.text.test(_)) {
        this.formFamilyControl['nombres'].setValue(
          _?.slice(0, _.length - 1) || null,
          {
            emitEvent: false,
          }
        );
      }
    });
  }

  getQuotationSummary(): void {
    this.spinner.show();
    this.summaryService.getQuotationSummary(+this.cotizacion).subscribe({
      next: (response: any) => {
        this.beneficiariesSelectedQuotation$ = response.beneficiarios || [];
        this.showbeneficiariesSelectedQuotation$ =
          this.beneficiariesSelectedQuotation$;
        // for (
        //   let i = 0;
        //   i < this.beneficiariesSelectedQuotation$[0].nombres?.length;
        //   i++
        // ) {
        //   if (this.beneficiariesSelectedQuotation$[0].nombres[i] == ' ') {
        //     this.finprimernombre = i;
        //   }
        // }
        // this.finprimernombre = this.beneficiariesSelectedQuotation$[0]?.nombres.splice(' ')[0].length - 1;

        if (response.success) {
          this.quotationSummary$ = response.resumen;
        }

        this.beneficiariesSelectedQuotation$ = [];
        sessionStorage.setItem('beneficiaries', null);
        this.beneficiariesSelectedQuotation$ = response.beneficiarios || [];
        this.fben.clear();
        /* this.fben.setValue([]);
          console.log(this.beneficiariesSelectedQuotation$); */
        this.beneficiariesSelectedQuotation$?.forEach((value: any) => {
          this.fben.push(this.builder.group(value));
        });
        sessionStorage.setItem(
          'beneficiaries',
          JSON.stringify(this.beneficiariesSelectedQuotation$)
        );
        this.spinner.hide();
      },
      error: (error: HttpErrorResponse) => {
        console.error(error);
        this.spinner.hide();
      },
    });
  }

  getAttachmentsSummary(): void {
    this.spinner.show();
    this.summaryService.getAttachments(this.clientId).subscribe({
      next: (response: any) => {
        this.spinner.hide();

        if (!!response.adjuntos?.length) {
          this.listAttachmentsSummary = response.adjuntos;
          const list = this.listAttachments.getRawValue();
          response.adjuntos.forEach((e: any, index: number) => {
            if (+e.codigoTipoDocumento == 4 && this.currentUser.comercial) {
              return;
            }
            if (!list.find((x: any) => +x.fileId == +e.codigoTipoDocumento)) {
              this.listAttachments.push(
                this.builder.group({
                  fileId: [e.codigoTipoDocumento, Validators.required],
                  fileType: [e.nombreTipoDocumento, Validators.required],
                  fileName: [e.nombreArchivo, Validators.required],
                  routeFile: [null],
                  file: [null],
                  uploaded: [
                    !this.currentUser.analista && +e.codigoTipoDocumento == 4,
                  ],
                  fileBase: [null],
                })
              );
            } else {
              this.listAttachments.controls[index] = this.builder.group({
                fileId: [e.codigoTipoDocumento, Validators.required],
                fileType: [e.nombreTipoDocumento, Validators.required],
                fileName: [e.nombreArchivo, Validators.required],
                routeFile: [null],
                file: [null],
                uploaded: [
                  this.currentUser.soporte && +e.codigoTipoDocumento != 4
                    ? true
                    : this.currentUser.analista && +e.codigoTipoDocumento != 4
                    ? true
                    : this.currentUser.gerenteGeneral
                    ? true
                    : this.currentUser.gerenteComercial,
                ],
                fileBase: [e.archivo],
              });
            }
            this.listAttachments.updateValueAndValidity();
          });
        }
      },
      error: (error: HttpErrorResponse) => {
        console.error(error);
        this.spinner.hide();
      },
    });
  }

  removeFamily(index): void {
    this.listFamily = this.listFamily.filter(
      (x) => x != this.listFamily[index]
    );
  }

  attachFile(e: any, index: number): void {
    if (e.target.files.length) {
      const file: File = e.target.files[0] as File;
      const form: any = (this.listAttachments.controls[index] as FormGroup)
        .controls as any;
      form['file'].setValue(file);
      form['fileName'].setValue(file.name);
    }
  }

  removeAttachment(index: number): void {
    const form: any = (this.listAttachments.controls[index] as FormGroup)
      .controls as any;
    form['file'].setValue(null);
    form['fileName'].setValue(null);
    form['routeFile'].setValue(null);
  }

  downloadFile(form: FormGroup): void {
    const values = form.getRawValue();
    const data = {
      fileName: values.fileName,
      fileBase64: values.fileBase,
    };
    this.utilsService.downloadFile(data);
  }

  updateComplementdata() {
    const contractor = this.storage.contractorService.asegurado;
    const formContractor = this.storage.formContractor;
    const dni = contractor.numeroDocumento;
    const complementRequest: any = {
      telefono: formContractor.phoneNumber,
      correo: formContractor.email,
      direccion: formContractor.direccion,
      idEstadoCivil: formContractor.estadoCivil,
      idDepartamento: formContractor.departamento,
      idProvincia: formContractor.provincia,
      idDistrito: formContractor.distrito,
      idOcupacion: formContractor.ocupacion,
      obligacionFiscal: formContractor.obligacionFiscal,
    };
    this.spinner.show();
    this.step4Service
      .enviarComplementariosActual(dni, complementRequest)
      .subscribe({
        next: (response: any) => {
          //   console.log(response);
          //   console.log('works');
        },
        error: (error: HttpErrorResponse) => {
          console.error(error);
        },
      });
  }

  updateDataContractor() {
    const contractor = this.storage.contractorService.asegurado;
    const contractorContratante$ =
      this.vidaDevolucionService.storage.contractorServiceContratante;
    const formContractorContratante = this.storage.formContractorContratante;
    const datoscontratante: any = {
      idProcess: +this.storage.summaryQuotationSelected.idProceso,
      idClient: this.clientId,
      numeroDocumento: contractor.numeroDocumento,
      aseguradoContratante: this.typeClients == 1 ? false : true,
      definitiva: true,
      contratante:
        this.typeClients == 1
          ? {
              idTipoPersona: 1,
              idTipoDocumento: 2,
              numeroDocumento:
                contractorContratante$.documentNumber ??
                contractorContratante$.numeroDocumento,
              nombres: contractorContratante$.names,
              apellidoPaterno: contractorContratante$.apePat,
              apellidoMaterno: contractorContratante$.apeMat,
              fechaNacimiento: contractorContratante$.birthdate,
              idSexo: contractorContratante$?.sex,
              homonimo: 0,
              parentesco:
                this.vidaDevolucionService.storage.parentescocontratante,
              telefono: formContractorContratante.phoneNumber || null,
              correo: formContractorContratante.email,
              direccion: formContractorContratante.direccion,
              idEstadoCivil: formContractorContratante.estadoCivil || null,
              idDepartamento: formContractorContratante.departamento || null,
              idProvincia: formContractorContratante.provincia || null,
              idDistrito: formContractorContratante.distrito || null,
              obligacionFiscal:
                formContractorContratante.obligacionFiscalcontratante,
              idOcupacion: formContractorContratante.ocupacion || null,
            }
          : null,
    };
    this.quotationService.saveDatesContratante(datoscontratante).subscribe({
      next: (response: any) => {
        // console.log(response);
      },
      error: (error: HttpErrorResponse) => {
        console.error(error);
        this.spinner.hide();
      },
    });
  }

  copy(inputElement) {
    if (this.beneficiarie.length != 0) {
      this.sendBeneficiaries();
      this.updateComplementdata();
      this.spinner.hide();
      inputElement.select();
      document.execCommand('copy');
      inputElement.setSelectionRange(0, 0);
      this.isCopied = true;
      if (inputElement.name == 'userinputlinkAsegurado') {
        this.isCopiedAsegurado = true;
      }
      if (inputElement.name == 'userinputlinkContratante') {
        this.isCopiedContratante = true;
      }
      setTimeout(() => {
        this.isCopied = false;
      }, 1500);
    } else {
      this.sendBeneficiaries();
      this.updateComplementdata();
      this.updateDataContractor();
      this.spinner.hide();
      inputElement.select();
      document.execCommand('copy');
      inputElement.setSelectionRange(0, 0);
      if (inputElement.name == 'userinputlinkAsegurado') {
        this.isCopiedAsegurado = true;
      }
      if (inputElement.name == 'userinputlinkContratante') {
        this.isCopiedContratante = true;
      }

      this.isCopied = true;
      setTimeout(() => {
        this.isCopied = false;
        this.isCopiedContratante = false;
        this.isCopiedAsegurado = false;
      }, 1500);
      setTimeout(() => {
        this.chrono = false;
      }, 3500);
    }
  }

  closeModals() {
    this._vc.clear();
    if (this.returnPath) {
      this.router.navigate([this.returnPath]);
    }
    this.returnPath = null;
  }
  get sumPercentagesBeneficiaries(): number {
    const validBeneficiary = this.beneficiarie.filter((x) => x.estado != 'D');
    return validBeneficiary
      .map((x) => +x.porcentajeParticipacion)
      .reduce((a, b) => a + b, 0);
  }
  sendBeneficiaries(): void {
    const contractor = this.storage.contractorService.asegurado;
    const formContractor = this.storage.formContractor;
    const beneRequest: any = {
      idProcess: +this.storage.summaryQuotationSelected.idProceso,
      telefono: contractor.telefono,
      correo: formContractor.email,
      direccion: formContractor.direccion,
      idDepartamento: formContractor.departamento,
      idProvincia: formContractor.provincia,
      idDistrito: formContractor.distrito,
      beneficiarios: this.beneficiarie.map(
        (value: any) =>
          ({
            idTipoPersona: 1,
            idTipoDocumento: value.idTipoDocumento,
            numeroDocumento: value.numeroDocumento,
            nombres: value.nombres,
            apellidoPaterno: value.apellidoPaterno,
            apellidoMaterno: value.apellidoMaterno,
            idNacionalidad: value.idNacionalidad,
            fechaNacimiento:
              (value.fechaNacimiento || '').toString()?.indexOf('/') == -1
                ? moment(value.fechaNacimiento).format('DD/MM/YYYY')
                : value.fechaNacimiento,
            idSexo: value.idSexo,
            relacion: {
              id: value.idParentesco,
              descripcion: value.parentesco,
            },
            porcentajeParticipacion: value.porcentajeParticipacion,
            estado: value.estado || null,
          } || [])
      ),
    };
    if (this.beneficiariesSelectedQuotation$.length != 0) {
      if (this.sumPercentagesBeneficiaries == 100) {
        this.blockEmail = true;
        this.summaryService.sendBeneficiaries(beneRequest).subscribe({
          next: (response: any) => {
            // console.log(response);
          },
          error: (error: HttpErrorResponse) => {
            console.error(error);
          },
        });
      } else {
        this.message = 'Los beneficiarios deben sumar 100%';
        // console.log('Los beneficiarios deben sumar 100%');
        this._vc.createEmbeddedView(this.modalMessage);
      }
    }
  }
  sendEmail(): void {
    this.typeClients = this.vidaDevolucionService.storage?.typeClients;

    if (
      (this.score.pep || this.score.primaAlta) &&
      !this.currentUser.comercial
    ) {
      this.saveLists();
    }
    const contractor = this.storage.contractorService.asegurado;
    const contractorContratante$ =
      this.vidaDevolucionService.storage.contractorServiceContratante;
    const formContractor = this.storage.formContractor;
    const formContractorContratante = this.storage.formContractorContratante;

    // tslint:disable-next-line:max-line-length
    const fechaVencimiento = moment(
      new Date(
        new Date().setFullYear(
          new Date().getFullYear() +
            +this.storage.summaryQuotationSelected.cantidadAnios
        )
      )
    ).format('DD/MM/YYYY');
    const datoscontratante: any = {
      idProcess: +this.storage.summaryQuotationSelected.idProceso,
      idClient: this.clientId,
      numeroDocumento: contractor.numeroDocumento,
      aseguradoContratante: this.typeClients == 1 ? false : true,
      definitiva: true,
      contratante:
        this.typeClients == 1
          ? {
              idTipoPersona: 1,
              idTipoDocumento: 2,
              numeroDocumento: contractorContratante$.documentNumber || contractorContratante$.numeroDocumento,
              nombres: contractorContratante$.names,
              apellidoPaterno: contractorContratante$.apePat,
              apellidoMaterno: contractorContratante$.apeMat,
              fechaNacimiento: contractorContratante$.birthdate,
              idSexo: contractorContratante$?.sex,
              homonimo: 0,
              parentesco:
                this.vidaDevolucionService.storage.parentescocontratante,
              telefono: formContractorContratante.phoneNumber || null,
              correo: formContractorContratante.email,
              direccion: formContractorContratante.direccion,
              idEstadoCivil: formContractorContratante.estadoCivil || null,
              idDepartamento: formContractorContratante.departamento || null,
              idProvincia: formContractorContratante.provincia || null,
              idDistrito: formContractorContratante.distrito || null,
              obligacionFiscal:
                formContractorContratante.obligacionFiscalcontratante,
              idOcupacion: formContractorContratante.ocupacion || null,
            }
          : null,
    };
    this.quotationService.saveDatesContratante(datoscontratante).subscribe({
      next: (response: any) => {
        // console.log(response);
      },
      error: (error: HttpErrorResponse) => {
        console.error(error);
        this.spinner.hide();
      },
    });

    const sendEmailRequest: any = {
      asegurado: {
        nombre: `${contractor.nombres} ${contractor.apellidoPaterno} ${contractor.apellidoMaterno}`,
        nroDocumento: contractor.numeroDocumento,
        fechaNacimiento: contractor.fechaNacimiento,
        telefono: formContractor.phoneNumber,
        correo: formContractor.email,
        direccion: formContractor.direccion,
        idEstadoCivil: formContractor.estadoCivil,
        idDepartamento: formContractor.departamento,
        idProvincia: formContractor.provincia,
        idDistrito: formContractor.distrito,
        idOcupacion: formContractor.ocupacion,
        obligacionFiscal: formContractor.obligacionFiscal,
      },
      contratante:
        this.typeClients == 1
          ? {
              nombre: `${contractorContratante$.names} ${contractorContratante$.apePat} ${contractorContratante$.apeMat}`,
              nroDocumento: contractorContratante$.documentNumber || contractorContratante$.numeroDocumento,
              fechaNacimiento: contractorContratante$.birthdate,
              correo: formContractorContratante.email,
            }
          : null,
      aseguradoContratante: this.typeClients == 1 ? false : true,
      idTarifario: this.storage.summaryQuotationSelected?.idTarifario,
      idProcess: +this.storage.summaryQuotationSelected.idProceso,
      cantidadAnios: this.storage.summaryQuotationSelected.cantidadAnios,
      capital: this.storage.summaryQuotationSelected.capital,
      fechaFin: fechaVencimiento,
      fechaInicio: moment(new Date()).format('DD/MM/YYYY'),
      fechasolicitud: moment(new Date()).format('DD/MM/YYYY'),
      fechaNacimiento: contractor.fechaNacimiento,
      fechaVencimiento: fechaVencimiento,
      monedaDescripcion:
        +this.storage.summaryQuotationSelected.idMoneda == 1
          ? 'SOLES'
          : 'DÓLARES',
      monedaSimbolo: this.storage.summaryQuotationSelected.moneda,
      nombreAsesor: `${this.currentUser.firstName} ${this.currentUser.lastName} ${this.currentUser.lastName2}`,
      porcentajeDevolucion:
        this.storage.summaryQuotationSelected.porcentajeRetorno,
      primaFallecimiento: this.storage.summaryQuotationSelected.capital,
      primaInicial: this.storage.summaryQuotationSelected.primaInicial,
      primaMensual: this.storage.summaryQuotationSelected.primaMensual,
      primaAnual: this.storage.summaryQuotationSelected.primaAnual,
      primaRetorno:
        this.storage.summaryQuotationSelected.primaPorcentajeRetorno,
      idFrecuencia: this.storage.summaryQuotationSelected.idFrecuenciaPago,
      frecuencia: this.storage.summaryQuotationSelected.frecuenciaPago,
      descPrima: this.storage.summaryQuotationSelected.descPrima,
    };
    this.spinner.show();
    if (this.beneficiariesSelectedQuotation$.length != 0) {
      if (this.sumPercentagesBeneficiaries == 100) {
        this.sendBeneficiaries();
        this.step4Service.enviarPasarela(sendEmailRequest).subscribe({
          next: (response: any) => {
            console.log(response);
            this.spinner.hide();
            if (response) {
              this.returnPath = '/extranet/vidadevolucion/prospectos';
              if (this.typeClients == 1) {
                console.log(this.typeClients);
                this.message =
                  'Se envió el link de compra al correo ' +
                  formContractorContratante.email +
                  ' y a ' +
                  formContractor.email;
              } else {
                this.message =
                  'Se envió el link de compra al correo ' +
                  formContractor.email;
              }
            } else {
              this.message = 'Ocurrió un error al enviar el correo electrónico';
            }
            this._vc.createEmbeddedView(this.modalMessage);
          },
          error: (error: HttpErrorResponse) => {
            console.error(error);
            this.spinner.hide();
            this.message = 'Ocurrió un error al enviar el correo electrónico';
            this._vc.createEmbeddedView(this.modalMessage);
          },
        });
        this.sendUpdateState(3);
      } else {
        this.sendBeneficiaries();
        this.spinner.hide();
      }
    } else {
      this.spinner.show();
      /* this.sendBeneficiaries(); */
      this.step4Service.enviarPasarela(sendEmailRequest).subscribe({
        next: (response: any) => {
          console.log(response);
          this.spinner.hide();
          if (response) {
            this.returnPath = '/extranet/vidadevolucion/prospectos';
            if (this.typeClients == 1) {
              console.log(this.typeClients);
              this.message =
                'Se envió el link de compra al correo ' +
                formContractorContratante.email +
                ' y a ' +
                formContractor.email;
            } else {
              this.message =
                'Se envió el link de compra al correo ' + formContractor.email;
            }
          } else {
            this.message = 'Ocurrió un error al enviar el correo electrónico';
          }
          this._vc.createEmbeddedView(this.modalMessage);
        },
        error: (error: HttpErrorResponse) => {
          console.error(error);
          this.spinner.hide();
          this.message = 'Ocurrió un error al enviar el correo electrónico';
          this._vc.createEmbeddedView(this.modalMessage);
        },
      });
      this.sendUpdateState(3);
    }
  }

  sendUpdateState(state: number): void {
    const payload = {
      idCliente: this.clientId,
      idEstado: state,
      idUsuario: +this.currentUser['id'],
    };
    this.quotationService.updateState(payload).subscribe();
  }
  get beneficiarie(): any {
    return JSON.parse(sessionStorage.getItem('beneficiaries') || '{}');
  }
  backToInit(): void {
    sessionStorage.removeItem(AppConfig.VIDADEVOLUCION_COMERCIAL_STORAGE);
    this.router.navigate(['extranet/vidadevolucion/prospectos']);
  }

  setUrlPathFromCurrentUser(): void {
    this.returnPath = this.vidaDevolucionService.storage.urlPath;
  }

  openModalUpdateState(type: number): void {
    this.typeAction = type;
    if (type == 0) {
      this.message = `¿Estás seguro que desea aprobar y enviar al asesor comercial?`;
    } else if (type == 1) {
      this.message = `¿Está seguro que desea solicitar la revisión a soporte comercial?`;
    } else if (type == 2) {
      this.message = `¿Está seguro que desea solicitar la aprobación a riesgos?`;
    } else if (type == 3) {
      this.message = `¿Está seguro que desea solicitar aprobación al gerente comercial?`;
    } else if (type == 4) {
      this.message = `¿Está seguro que desea enviar correo al gerente general?`;
    } else if (type == 7) {
      if (this.currentUser.gerenteComercial) {
        this.message = `¿Está seguro que desea aprobar y enviar al asesor comercial?`;
      } else {
        this.message = `¿Está seguro que desea aprobar y enviar a soporte comercial?`;
      }
    } else if (type == 10) {
      this.message = `¿Está seguro que desea rechazar la solciitud?`;
    }
    this._vc.createEmbeddedView(this.modalConfirmUpdateState);
  }

  calculateActionType(): void {
    if (this.typeAction == 0) {
      this.stateType = 3;
    } else if (this.typeAction == 1) {
      this.stateType = 5;
    } else if (this.typeAction == 2) {
      this.stateType = 6;
    } else if (this.typeAction == 3) {
      const idecon = this.vidaDevolucionService.storage.idecon;
      const wc = this.vidaDevolucionService.storage.worldCheck;
      const scoring = this.vidaDevolucionService.storage.scoring;

      this.stateType = 8;

      if (idecon.isPep || wc.isPep || idecon.isFamPep || wc.isFamPep) {
        this.stateType = 6;
      }
      if (!idecon.isPep && wc.isPep && scoring.calificacion == ' ALTO') {
        this.stateType = 9;
      } else {
        if (!idecon.isPep && !wc.isPep && scoring.calificacion != 'ALTO') {
          this.stateType = 3;
        } else {
          this.stateType = 8;
        }
      }
    } else if (this.typeAction == 4) {
      this.stateType = 8;
    } else if (this.typeAction == 10) {
      this.stateType = 10;
    } else if (this.typeAction == 7) {
      if (
        this.currentUser.gerenteGeneral ||
        this.currentUser.gerenteComercial
      ) {
        this.stateType = 3;
      } else {
        this.stateType = 7;
      }
    }
  }

  get stateTypeValue(): number {
    if (this.typeAction == 0) {
      return (this.stateType = 3);
    } else if (this.typeAction == 1) {
      return (this.stateType = 5);
    } else if (this.typeAction == 2) {
      return (this.stateType = 6);
    } else if (this.typeAction == 3) {
      const idecon = this.vidaDevolucionService.storage.idecon;
      const wc = this.vidaDevolucionService.storage.worldCheck;
      const scoring = this.vidaDevolucionService.storage.scoring;

      this.stateType = 8;

      if (idecon.isPep || wc.isPep || idecon.isFamPep || wc.isFamPep) {
        return (this.stateType = 6);
      }
      if (!idecon.isPep && !wc.isPep && scoring.calificacion == 'ALTO') {
        return (this.stateType = 9);
      } else {
        if (!idecon.isPep && !wc.isPep && scoring.calificacion != 'ALTO') {
          return (this.stateType = 3);
        }
        return (this.stateType = 8);
      }
    } else if (this.typeAction == 4) {
      return (this.stateType = 8);
    } else if (this.typeAction == 10) {
      return (this.stateType = 10);
    } else if (this.typeAction == 7) {
      if (
        this.currentUser.gerenteGeneral ||
        this.currentUser.gerenteComercial
      ) {
        return (this.stateType = 3);
      } else {
        return (this.stateType = 7);
      }
    }
  }

  updateState(): void {
    this.calculateActionType();

    const actionsTypes = [1, 4, 7];
    if (actionsTypes.includes(this.typeAction)) {
      this.saveLists();
    }

    const payload = {
      idCliente: this.clientId,
      idEstado: this.stateTypeValue,
      idUsuario: +this.currentUser['id'],
    };

    this.spinner.show();
    this.quotationService.updateState(payload).subscribe({
      next: (response: any) => {
        console.log(response);
        this.spinner.hide();
        this._vc.clear();
        if (response.success) {
          if (this.typeAction == 0) {
            this.message = `Se envió correctamente la solicitud al asesor comercial`;
          } else if (this.typeAction == 1) {
            this.message = `Se envió correctamente la solicitud a soporte comercial`;
          } else if (this.typeAction == 2) {
            this.message = `Se envió correctamente la solicitud a riesgos`;
          } else if (this.typeAction == 3) {
            this.message = `Se envió correctamente la solicitud al gerente comercial`;
          } else if (this.typeAction == 4) {
            this.message = `Se envió correctamente la solicitud al gerente general`;
          } else if (this.typeAction == 7) {
            if (this.currentUser.gerenteComercial) {
              this.message = `Se aprobó y se envió correctamente la solicitud al asesor comercial`;
            } else {
              this.message = `Se aprobó y se envió correctamente la solicitud a soporte comercial`;
            }
          } else if (this.typeAction == 10) {
            this.message = `Se rechazó correctamente la solicitud`;
          }
          this.statusChange.emit(Math.random());
          this.setUrlPathFromCurrentUser();
        } else {
          this.message = `Ocurrió un problema al procesar tu solicitud`;
        }
        this._vc.createEmbeddedView(this.modalMessage);
      },
      error: (error: HttpErrorResponse) => {
        console.error(error);
        this.spinner.hide();
        this._vc.clear();
        this.message = `Ocurrió un problema al procesar tu solicitud`;
        this._vc.createEmbeddedView(this.modalMessage);
      },
    });
  }

  saveLists(): void {
    if (this.currentUser.comercial) {
      const relatives: Array<any> = new Array();
      this.listFamily.forEach((e: any) => {
        const payload = {
          idTipoDocumento: 2,
          numeroDocumento: e.dni,
          nombres: e.nombres,
          apellidoPaterno: e.apellidoPaterno,
          apellidoMaterno: e.apellidoMaterno,
          relacion: {
            id: e.parentesco,
            descripcion: this.parameters$?.parentescos
              ?.find((x: any) => +x.id == +e.parentesco)
              ?.descripcion?.toUpperCase()
              .trim(),
          },
        };
        relatives.push(payload);
      });
      const request = {
        idCliente: +this.clientId,
        familiares: relatives,
      };
      this.quotationService.saveFamiliary(request).subscribe();
    }

    const requestFiles = {
      clientId: this.clientId,
      files: this.listAttachments.getRawValue(),
    };
    this.quotationService.uploadFile(requestFiles).subscribe();
  }

  getDocumentInformation(form: FormGroup): void {
    this.formFamilyErrorMessage = null;
    const listFamily = this.listFamily;
    if (listFamily.find((x: any) => x.dni == form.get('dni').value)) {
      this.formFamilyErrorMessage =
        'Este documento ya se encuentra registrado en la lista de familiares';
      form.get('dni').setValue(null);
      return;
    }
    if (form.get('dni').valid) {
      const payload: IDocumentInformationRequest = {
        idTipoDocumento: 2,
        idRamo: 71,
        numeroDocumento: form.get('dni').value,
        idUser: this.currentUser.id,
      };
      this.spinner.show();
      this.utilsService.documentInformation(payload).subscribe({
        next: (response: DocumentInformationModel) => {
          console.log(response);
          if (response.success) {
            form.get('nombres').setValue(response.names);
            form.get('apellidoPaterno').setValue(response.apePat);
            form.get('apellidoMaterno').setValue(response.apeMat);
          }
          this.spinner.hide();
        },
        error: (error: any) => {
          console.error(error);
          this.spinner.hide();
        },
      });
    }
  }

  showModalFamily(edit = false): void {
    this.isEditFamily = edit;
    if (this.isEditFamily) {
      this.formFamilyControl['dni'].disable();
    }
    this._vc.clear();
    this._vc.createEmbeddedView(this.modalFamily);
  }

  addOrEditFamily(): void {
    if (this.isEditFamily) {
      const index = this.listFamily.findIndex(
        (x: any) => x.dni == this.formFamilyControl['dni'].value
      );
      this.listFamily[index] = this.formFamily.getRawValue();
    } else {
      this.listFamily.push(this.formFamily.getRawValue());
    }
    this.closeModals();
    this.formFamily.reset();
  }

  getParentescoDescription(id: number): void {
    return this.parentesco$?.find((x: any) => +x.id == +id)?.descripcion || '';
  }
  get fbc(): FormArray {
    return this.fben['beneficiaries'] as FormArray;
  }
  getJsonRelationship(id: number): any {
    return this.parameters$.parentescos.find((x) => +x.id == +id);
  }
  textoParentesco(id) {
    return this.parameters$?.parentescos?.find((x) => +x.id == +id)
      ?.descripcion;
  }
  get fbe(): { [key: string]: AbstractControl } {
    return this.formBeneficiary.controls;
  }

  /* get fbn(): FormArray {
      return this.f['beneficiaries'] as FormArray;
    } */
  get beneficiaryExist(): boolean {
    if (this.editMode) {
      return false;
    }

    const document = this.fbe['id'].value;
    const beneficiaries = this.fben.getRawValue();

    return beneficiaries?.map((x) => x.id)?.includes(document);
  }
  submitBeneficiary(): void {
    if (this.editMode) {
      const b = this.fben.getRawValue();
      console.log(b);
      const bc = this.formBeneficiary.getRawValue();
      const benf = b.findIndex(
        (x) => x.codigoCliente == this.fbe['codigoCliente'].value
      );
      console.log(benf);
      const selectedBeneficiary = this.fben.at(benf) as FormGroup;
      const newVal = this.formBeneficiary.getRawValue();
      console.log(newVal);
      selectedBeneficiary?.patchValue(newVal);
      selectedBeneficiary.addControl('estado', new FormControl('U'));
      console.log(selectedBeneficiary);
      this.beneficiariesSelectedQuotation$ = [];
      this.beneficiariesSelectedQuotation$ = this.fben.value;
      sessionStorage.setItem(
        'beneficiaries',
        JSON.stringify(this.beneficiariesSelectedQuotation$)
      );
      this.showbeneficiariesSelectedQuotation$ =
        this.beneficiariesSelectedQuotation$.filter((x) => x.estado != 'D');
      this.closeModals();
    } else {
      /* this.addBeneficiary(); */
    }
  }
  setIdBeneficiary() {
    this.fbe['id'].setValue(
      `${this.fbe['idTipoDocumento'].value}${this.fbe['numeroDocumento'].value}`
    );
  }
  editBeneficiary(data: any): void {
    this.editMode = true;
    this.formBeneficiary.patchValue(data, {
      emitEvent: false,
    });

    this.editBeneficiary$.push(data);
    const beneficiary = data;
    this.formBeneficiary.reset();
    this.formBeneficiary.enable();
    this._vc.createEmbeddedView(this._modalBeneficiary);

    this.fbe['estado'].setValue('U');
    this.fbe['idTipoDocumento'].setValue(2);
    this.fbe['numeroDocumento'].setValue(beneficiary.numeroDocumento);
    this.fbe['nombres'].setValue(beneficiary.nombres);
    this.fbe['apellidoMaterno'].setValue(beneficiary.apellidoMaterno);
    this.fbe['apellidoPaterno'].setValue(beneficiary.apellidoPaterno);
    this.fbe['idNacionalidad'].setValue(beneficiary.idNacionalidad);
    this.fbe['nacionalidad'].setValue(beneficiary.nacionalidad);
    this.fbe['idDepartamento'].setValue(beneficiary.idDepartamento);
    this.fbe['idProvincia'].setValue(beneficiary.idProvincia);
    this.fbe['idDistrito'].setValue(beneficiary.idDistrito);
    this.fbe['provincia'].setValue(beneficiary.provincia);
    this.fbe['departamento'].setValue(beneficiary.departamento);
    this.fbe['idDistrito'].setValue(beneficiary.idDistrito);
    this.fbe['idParentesco'].setValue(beneficiary.idParentesco);
    this.fbe['parentesco'].setValue(beneficiary.parentesco);
    this.fbe['idParentesco'].valueChanges.subscribe((val) => {
      const idparen = this.parameters$?.parentescos.findIndex(
        (x) => x.id == val
      );
      this.fbe['parentesco'].setValue(
        this.parameters$?.parentescos[idparen]?.descripcion
      );
    });
    this.fbe['distrito'].setValue(beneficiary.distrito);
    this.fbe['fechaNacimiento'].setValue(beneficiary.fechaNacimiento);
    this.fbe['idSexo'].setValue(beneficiary.idSexo);
    this.fbe['sexo'].setValue(beneficiary.sexo);
    this.fbe['porcentajeParticipacion'].setValue(
      beneficiary.porcentajeParticipacion
    );
    this.fbe['codigoCliente'].setValue(beneficiary.codigoCliente);
    this.fbe['idTipoPersona'].setValue(beneficiary.idTipoPersona);
    this.setIdBeneficiary();

    this.fbe['idNacionalidad'].disable();
    this.fbe['nombres'].disable();
    this.fbe['idSexo'].disable();
    this.fbe['apellidoMaterno'].disable();
    this.fbe['fechaNacimiento'].disable();
    this.fbe['apellidoPaterno'].disable();
    this.fbe['idTipoDocumento'].disable();
    this.fbe['numeroDocumento'].disable();
  }
  removeBeneficiary(data: any): void {
    if (this.showbeneficiariesSelectedQuotation$.length > 1) {
      console.log(data);
      const b = this.beneficiariesSelectedQuotation$;
      console.log(b);
      const remove = data;
      console.log(remove);
      const benf = b.findIndex(
        (x) => x.numeroDocumento == remove?.numeroDocumento
      );
      console.log(benf);
      const selectedBeneficiary = this.fben.at(benf) as FormGroup;
      console.log(selectedBeneficiary);
      selectedBeneficiary?.patchValue(remove);
      selectedBeneficiary.addControl('estado', new FormControl('D'));
      selectedBeneficiary.controls.estado.setValue('D');
      this.beneficiariesSelectedQuotation$ = [];
      this.beneficiariesSelectedQuotation$ = this.fben.value;
      sessionStorage.setItem(
        'beneficiaries',
        JSON.stringify(this.beneficiariesSelectedQuotation$)
      );
      this.deleteViewBeneficierie(benf);
    } else {
      this.message = 'Debes tener al menos 1 beneficiario';
      this._vc.createEmbeddedView(this.modalMessage);
    }
  }
  deleteViewBeneficierie(id: number) {
    /*   this.fben.removeAt(id); */
    this.showbeneficiariesSelectedQuotation$ = [];
    this.showbeneficiariesSelectedQuotation$ = this.beneficiarie.filter(
      (x) => x.estado != 'D'
    );
  }
  getDocumentInfo(): void {
    if (this.beneficiaryExist) {
      return;
    }

    if (
      this.fbe['idTipoDocumento'].valid &&
      this.fbe['numeroDocumento'].valid
    ) {
      const req: IDocumentInformationRequest = {
        idRamo: 71,
        idTipoDocumento: +this.fbe['idTipoDocumento'].value,
        numeroDocumento: this.fbe['numeroDocumento'].value,
        idUser: this.currentUser.id,
      };
      this.spinner.show();
      this.utilsService.documentInformation(req).subscribe(
        (response: DocumentInformationModel) => {
          this.fbe['estado'].setValue('U');
          this.fbe['idTipoDocumento'].setValue(2);
          this.fbe['numeroDocumento'].setValue(response.documentNumber);
          this.fbe['nombres'].setValue(response.names);
          this.fbe['apellidoMaterno'].setValue(response.apeMat);
          this.fbe['apellidoPaterno'].setValue(response.apePat);
          this.fbe['idNacionalidad'].setValue(response.nationality);
          this.fbe['idDepartamento'].setValue(response.department);
          this.fbe['idProvincia'].setValue(response.province);
          this.fbe['idDistrito'].setValue(response.district);
          this.fbe['fechaNacimiento'].setValue(response.birthdate);
          this.fbe['idSexo'].setValue(response.sex);
          this.setIdBeneficiary();

          this.spinner.hide();
        },
        (error: HttpErrorResponse) => {
          console.error(error);
          this.fbe['nacionalidad'].enable();
          this.spinner.hide();
        }
      );
    }
  }
  get clientIsBeneficiary(): boolean {
    const document = this.fbe['id'].value;

    const contractor =
      this.vidaDevolucionService.storage.contractorService.asegurado;
    const documentContractor = `${contractor.idTipoDocumento}${contractor.numeroDocumento}`;

    return document == documentContractor;
  }
}
