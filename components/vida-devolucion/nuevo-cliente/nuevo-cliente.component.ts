import { ITarifarioResponse } from './../../../interfaces/vida-devolucion/tarifario.interface';
import { first } from 'rxjs/operators';
import {
  Component,
  ElementRef,
  OnInit,
  TemplateRef,
  ViewChild,
  ViewContainerRef,
} from '@angular/core';
import moment from 'moment';
import { MainService } from '../../../../vidaindividual-latest/services/main/main.service';
import { ActivatedRoute, Router } from '@angular/router';
import { v4 as uuid } from 'uuid';
import { HttpErrorResponse } from '@angular/common/http';
import { NgxSpinnerService } from 'ngx-spinner';
import { SummaryService } from '@root/layout/broker/services/vida-devolucion/summary/summary.service';

import { ITarifarioRequest } from '../../../interfaces/vida-devolucion/tarifario.interface';
import { NewClientService } from '../../../services/vida-devolucion/new-client/new-client.service';
import { VidaDevolucionService } from '../../../services/vida-devolucion/vida-devolucion.service';
import { AppConfig } from '@root/app.config';
import { IClienteRiesgoRequest } from '../../../../../shared/interfaces/cliente-riesgo.interface';
import { UtilsService } from '@shared/services/utils/utils.service';

@Component({
  selector: 'app-nuevo-cliente',
  templateUrl: './nuevo-cliente.component.html',
  styleUrls: ['./nuevo-cliente.component.scss'],
})
export class NuevoClienteComponent implements OnInit {
  message: string;
  mensaje: string;
  terms = true;
  contractor: any;
  nombreyapellido: any;
  @ViewChild('modalMessage', { static: true, read: TemplateRef })
  _modalMessage: TemplateRef<any>;
  valContinues: any;
  idCliente: any;
  nPolicy: any;
  validarspan: any;
  sumasuperada2: any;
  numpolizascontratadas: any;
  SuperCumulo: any = true;
  totalsumapolizas: any;
  Valido: any = true;
  NoValido: any = false;
  @ViewChild('modalClientNotValid', { static: true, read: TemplateRef })
  modalClientNotValid: TemplateRef<ElementRef>;
  constructor(
    private readonly router: Router,
    private readonly spinner: NgxSpinnerService,
    private activatedRoute: ActivatedRoute,
    private readonly vc: ViewContainerRef,
    private readonly newClientService: NewClientService,
    private readonly vidaDevolucionService: VidaDevolucionService,
    private readonly utilsService: UtilsService,
    private readonly summaryService: SummaryService,
    private readonly _mainService: MainService
  ) {}
  user = JSON.parse(localStorage.getItem('currentUser') || '{}');

  ngOnInit(): void {
    if (!this.vidaDevolucionService.storage?.sessionId) {
      this.vidaDevolucionService.storage = {
        sessionId: uuid(),
      };
    }
    if (
      Object.keys(this.vidaDevolucionService.storage?.contractor || []).length
    ) {
      this.contractor = this.vidaDevolucionService.storage.contractor;
      this.acceptTerms =
        this.vidaDevolucionService.storage.contractor?.terms || true;
    }
  }
  closeModal(): void {
    this.vc.clear();
  }
  private get currentUser(): any {
    return JSON.parse(localStorage.getItem('currentUser') || '{}');
  }

  contractorFormValues(event: any): void {
    this.contractor = event;
    this.vidaDevolucionService.storage = {
      contractor: this.contractor,
      terms: this.acceptTerms,
    };
    if (event.clienteAnulado == true) {
      if (this.currentUser.profileId == 192) {
        this.message =
          'No es posible continuar ya que el prospecto se encuentra en estado ANULADO';
        return;
      } else {
        this.message =
          'No es posible continuar ya que el prospecto se encuentra en estado ANULADO. Por favor, comuníquese con Soporte Comercial.';
        return;
      }
    }
    if (event.isValidDocumentNumber && event.isLoadedAllServices) {
      if (!event.cotiza) {
        // tslint:disable-next-line:max-line-length
        this.message =
          // tslint:disable-next-line:max-line-length
          'La persona se encuentra vinculada a otro asesor. Si considera que es un error por favor contactar a soporte comercial indicando los datos ingresados y su usuario.';
        return;
      }
      if (!event.isGetDocumentInfo) {
        this.message =
          'No pudimos validar los datos ingresados. Por favor verifique los datos ingresados  o vuelva a intentarlo luego.';
        return;
      }
    }

    this.message = null;
  }

  get acceptTerms(): boolean {
    return this.terms;
  }

  set acceptTerms(value: boolean) {
    this.terms = value;
  }

  get isValidForm(): boolean {
    const isInvalidForm =
      this.contractor?.isValidForm &&
      this.contractor?.isAged &&
      this.contractor?.isGetDocumentInfo &&
      this.contractor?.cotiza &&
      this.contractor?.isLoadedAllServices &&
      this.acceptTerms &&
      this.contractor?.clienteAnulado == false;
    return isInvalidForm;
  }

  onSubmit(): void {
    if (this.isValidForm) {
      const contractor = this.vidaDevolucionService.storage.contractor;
      this.nombreyapellido = `${contractor.names} ${contractor.apePat || ''} ${
        contractor.apeMat || ''
      }`;
      this.message = null;
      this.saveProspect();
    }
  }
  currencyformat(number: any) {
    return new Intl.NumberFormat('es-MX').format(number);
  }

  saveProspect(): void {
    const payload = {
      idAsesor: +this.currentUser.id,
      idTipoDocumento: +this.contractor.documentType,
      numeroDocumento: this.contractor.documentNumber,
      correo: this.contractor.email,
      telefono: this.contractor.phoneNumber,
      fechaNacimiento: this.contractor.birthdate,
      origen: 'C',
      codigoCanal:
        +this.currentUser.profileId == 192
          ? 2015000002
          : this.currentUser['canal'],
      idRamo: 71,
      idProducto: 1,
      nombres: this.contractor.names,
      apellidoPaterno: this.contractor.apePat,
      apellidoMaterno: this.contractor.apeMat,
      sexo: this.contractor.sex,
    };

    this.spinner.show();

    this.newClientService.saveProspect(payload).subscribe({
      next: (response: any) => {
        this.spinner.hide();
        if (response.success) {
          this.vidaDevolucionService.storage = {
            clientId: +response.validacionPoliza.idCliente,
          };
          const contractor = this.vidaDevolucionService.storage.contractor;
          const riskClientPayload: IClienteRiesgoRequest = {
            idTipoDocumento: +contractor.documentType,
            numeroDocumento: contractor.documentNumber,
            nombres: `${contractor.names} ${contractor.apePat || ''} ${
              contractor.apeMat || ''
            }`.trim(),
            primerApellido: contractor.apePat,
          };
          const nMensaje = response.validacionPoliza.message;
          if (!response.validacionPoliza.message) {
            this.mensaje = response.message;
            this.nPolicy = nMensaje;
            this.idCliente = response.validacionPoliza.idCliente;

            if (response.validacionPoliza.mostrarMensaje != '0') {
              const payloadtarifario = {
                idTipoDocumento: +contractor.documentType,
                numeroDocumento: contractor.documentNumber,
                fechaNacimiento: contractor.birthdate,
              };
              const numeroDocumento = contractor.documentNumber;

              this.spinner.show();

              this.newClientService.cumulus(numeroDocumento).subscribe({
                // tslint:disable-next-line:no-shadowed-variable
                next: (response: ITarifarioResponse) => {
                  this.validarspan = true;
                  this.sumasuperada2 = response.cumulus.nCumulusAvailble;
                  this.numpolizascontratadas = response.cumulus.nCountPolicy;
                  this.totalsumapolizas =
                    response.cumulus.nCumulusMax -
                    response.cumulus.nCumulusAvailble;

                  if (this.sumasuperada2 == 0) {
                    this.SuperCumulo = false;
                  }
                  this.spinner.hide();

                  this.vc.createEmbeddedView(this._modalMessage);
                },
                error: (error: HttpErrorResponse) => {
                  console.error(error);
                  this.spinner.hide();
                },
              });
            } else {
              this.newPolice();
            }
          } else {
            this.riskClient(riskClientPayload);
          }
        } else {
          this.message = 'Ocurrió un error al intentar crear el prospecto';
        }
      },
      error: (error: HttpErrorResponse) => {
        console.error(error);
        this.spinner.hide();
        this.message = 'Ocurrió un error al intentar crear el prospecto';
      },
    });
  }
  newPolice() {
    const contractor = this.vidaDevolucionService.storage.contractor;

    const riskClientPayload: IClienteRiesgoRequest = {
      idTipoDocumento: +contractor.documentType,
      numeroDocumento: contractor.documentNumber,
      nombres: `${contractor.names} ${contractor.apePat || ''} ${
        contractor.apeMat || ''
      }`.trim(),
      primerApellido: contractor.apePat,
    };
    let params = {};
    params = {
      cliente: this.idCliente,
      policyClient: this.nPolicy,
      // viene de historial, se dirige a resumen
      start: false,
    };
    this.vidaDevolucionService.storage = {
      urlPath: '/extranet/vidadevolucion/prospectos/nuevo-cliente',
      isNavigate: true,
    };
    this.riskClient(riskClientPayload);
  }
  private riskClient(payload: any): void {
    this.spinner.show();
    this.utilsService.clienteRiesgoExperian(payload).subscribe({
      next: (response: any) => {
        this.spinner.hide();
        if (response.idecon.isOtherList || response.worldCheck.isOtherList) {
          const data = {
            idProcess: 0,
            tipoNotificacion: 'PEPVidaIndividual',
            email: this.contractor.email,
            telefono: this.contractor.phoneNumber,
            asegurado: `${this.contractor.names} ${
              this.contractor.apePat || ''
            } ${this.contractor.apeMat || ''}`,
            nroDocumento: this.contractor.documentNumber,
            fechaNacimiento: this.contractor.birthdate,
            primaInicial: null,
            primaMensual: null,
            primaAnual: null,
            fechaSolicitud: moment(new Date().toDateString()).format(
              'DD/MM/YYYY'
            ),
            monedaDescripcion: null,
            monedaSimbolo: null,
            cantidadAnios: null,
            porcentajeDevolucion: null,
            capital: null,
            primaRetorno: null,
            primaFallecimiento: null,
            isIdNumber: response?.worldCheck.isIdNumber,
            isPep: response?.idecon.isPep,
            isFamPep: response?.idecon.isFamPep,
            isIdNumberFamPep: response?.idecon.isIdNumberFamPep,
            isOtherList: response?.idecon.isOtherList,
            TotalPolizas: 0,
            SumaAsegurada: 0,
            CumuloMaximo: 0,
            experianRisk: response?.experian.experianRisk,
            isOtherListWC: response?.worldCheck.isOtherList,
            isIdNumberWC: response?.worldCheck.isIdNumber,
            isPepWC: response?.worldCheck.isPep,
            correoAsesor: localStorage.currentUser.email,
            nombreAsesor: `${
              JSON.parse(localStorage.getItem('currentUser')).firstName
            } ${
              JSON.parse(localStorage.getItem('currentUser')).lastName || ''
            } ${
              JSON.parse(localStorage.getItem('currentUser')).lastName2 || ''
            }`,
          };
          this._mainService.sendNotification(data).subscribe();
          this.closeModals();
          this.vc.createEmbeddedView(this.modalClientNotValid);
          return;
        }
        this.vidaDevolucionService.storage = {
          riskClientInfo: response,
        };
        this.vidaDevolucionService.storage = {
          isLoadedAllServices: true,
        };
        if (response.success) {
          this.router.navigate(['broker/vidadevolucion/resumen'], {
            queryParams: {
              cliente: this.vidaDevolucionService.storage.clientId,
            },
          });
        } else {
          console.log('success false');
        }
      },
      error: (error: any) => {
        console.error(error);
        this.spinner.hide();
        this.vidaDevolucionService.storage = {
          isLoadedAllServices: true,
        };
      },
    });
  }

  backToInit(): void {
    sessionStorage.removeItem(AppConfig.VIDADEVOLUCION_COMERCIAL_STORAGE);
    this.router.navigate(['/extranet/vidadevolucion/prospectos']);
  }

  downloadTerms(): void {
    const payload = {
      fileName: 'terminos_condiciones.pdf',
      fileBase64: sessionStorage.getItem('terms-vdp'),
    };
    this.utilsService.downloadFile(payload);
  }

  closeModals(): void {
    this.vc.clear();
  }
}
