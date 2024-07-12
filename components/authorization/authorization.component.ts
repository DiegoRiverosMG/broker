import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { BsDatepickerConfig } from 'ngx-bootstrap/datepicker';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { AutorizacionService } from '../../services/autorizacion/autorizacion.service';
import * as SDto from '../../services/autorizacion/DTOs/autorizacion.dto';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { NgxSpinnerService } from 'ngx-spinner';
import { Step05Service } from '../../services/step05/step05.service';
import * as Step05Dto from '../../services/step05/DTOs/step05.dto';
import { Router } from '@angular/router';
import { Auto } from '../../models/auto/auto.model';
import { Certificado } from '../../models/certificado/certificado';
import { Cliente } from '../../models/cliente/cliente';
import { NULL_EXPR } from '@angular/compiler/src/output/output_ast';
import { UtilsService } from '@shared/services/utils/utils.service';
@Component({
  selector: 'app-authorization',
  templateUrl: './authorization.component.html',
  styleUrls: ['./authorization.component.css'],
})
export class AuthorizationComponent implements OnInit {
  FORM_SEARCH_AUTH: FormGroup;
  constructor(
    private readonly _FormBuilder: FormBuilder,
    private readonly _AutorizacionService: AutorizacionService,
    private readonly _spinner: NgxSpinnerService,
    private readonly _Step05Service: Step05Service,
    private readonly _Router: Router,
    private readonly _utilsService: UtilsService
  ) {
    this.FORM_SEARCH_AUTH = this._FormBuilder.group({
      canalVenta: [0],
      puntoVenta: [0],
      idProceso: [null],
      idUso: [0],
      idEstado: [0],
      segmento: [0],
      fechaIni: [this.bsValueIni],
      fechaFin: [this.bsValueFin],
    });
  }
  @ViewChild('skeletonLoading', { static: true, read: ElementRef })
  skeletonLoading: ElementRef;
  @ViewChild('modalHistorial', { static: true, read: ModalDirective })
  modalHistorial: ModalDirective;
  @ViewChild('modalComfirmAprobar', { static: true, read: ModalDirective })
  modalComfirmAprobar: ModalDirective;
  @ViewChild('modalComfirmRechazar', { static: true, read: ModalDirective })
  modalComfirmRechazar: ModalDirective;
  @ViewChild('modalSuccess', { static: true, read: ModalDirective })
  modalSuccess: ModalDirective;
  @ViewChild('modalResumen', { static: true, read: ModalDirective })
  modalResumen: ModalDirective;
  @ViewChild('modalDocumentosSubidos', { static: true, read: ModalDirective })
  modalDocumentosSubidos: ModalDirective;
  @ViewChild('modalComfirmAnular', { static: true, read: ModalDirective })
  modalComfirmAnular: ModalDirective;
  NSKELETON = [1, 2, 3, 4, 5];
  NROWS: number[] = [];
  bsConfig: Partial<BsDatepickerConfig>;
  fecha = new Date();
  bsValueIni: Date = new Date(this.fecha.setMonth(this.fecha.getMonth() - 6));
  bsValueFin: Date = new Date();
  DATA_AUTORIZACIONES: SDto.DocumentUsosDto[] = [];
  ID_PROCCESS: number;
  DATA_HISTORIAL_SOLICITUD: SDto.DocumentHistoryDto[] = [];
  DATA_AUTO: Auto = null;
  DATA_CERTIFICADO: Certificado = null;
  DATA_CONTRATANTE: Cliente = null;
  STATE_SOLICITUD = 0;
  COMENTARIO_SOLICITUD = '';
  ID_PROCESO_SOLICITUD = null;
  ID_USER = null;
  TITLE_MODAL_SUCCESS: string;
  BODY_MODAL_SUCCESS: string;
  DATA_USOS: any = [];
  DATA_RESUMEN: Step05Dto.ResumenDocumentEmisionDto = {
    auto: null,
    canalDeVenta: null,
    cliente: null,
    idProceso: null,
    idUsuario: null,
    poliza: null,
    token: null,
  };
  DATA_DOCUMENTOS_SUBIDOS: SDto.DocumentosSubidosDto[] = [];
  PROFILE_ID: number;
  IS_FIRST_SEARCH_DATA = false;
  IS_ADMIN: any;
  ngOnInit(): void {
    this.bsConfig = Object.assign(
      {},
      {
        dateInputFormat: 'DD/MM/YYYY',
        locale: 'es',
        containerClass: 'theme-dark-blue',
        showWeekNumbers: true,
        maxDate: new Date(),
      }
    );
    this.ID_USER = JSON.parse(localStorage.getItem('currentUser')).id;
    this.PROFILE_ID = Number.parseInt(
      JSON.parse(localStorage.getItem('currentUser')).profileId
    );
    this.IS_ADMIN = Number(JSON.parse(localStorage.getItem('profileId')));
  }
  get IsAdmin() {
    /* this.IS_ADMIN = Number(this.PROFILE_ID);

    return this.IS_ADMIN === 20 ||
      this.IS_ADMIN === 151 ||
      this.IS_ADMIN === 154 ||
      this.IS_ADMIN === 155; */
    return this._utilsService.adminsBackoffice.includes(this.PROFILE_ID);
  }
  //#region FUNCIONES
  showSkeletonLoading(): void {
    this.skeletonLoading.nativeElement.hidden = false;
  }
  hideSkeletonLoading(): void {
    this.skeletonLoading.nativeElement.hidden = true;
  }
  showHideOptionsRowGrid(id: number, index: number): void {
    const table = document.getElementById('table-scroll');
    const html = document.getElementById('actions' + id);
    if (html.hidden === true) {
      this.hideAllMenusActions();
      html.hidden = false;
      html.style.top = '0';
      document.getElementById('row' + id).style.background =
        'rgba(170, 158, 192, 0.25)';
      if (table.scrollHeight - table.clientHeight > 0 && index >= 5) {
        html.style.top = '-127px';
      } else {
        html.style.top = '0';
      }
      html.focus();
    } else {
      html.hidden = true;
      html.style.top = '0';
      document.getElementById('row' + id).style.background = '#fff';
    }
  }
  hideAllMenusActions(): void {
    this.DATA_AUTORIZACIONES.forEach((e) => {
      const el = document.getElementById('actions' + e.idProceso);
      el.hidden = true;
      el.style.top = '0';
      document.getElementById('row' + e.idProceso).style.background = '#fff';
    });
  }
  CanalVentaData(e): void {
    this.FORM_SEARCH_AUTH.get('canalVenta').setValue(e);
    if (this.IS_FIRST_SEARCH_DATA === false) {
      this.getDataAutorizaciones();
    }
    this.IS_FIRST_SEARCH_DATA = true;
  }
  PuntoVentaData(e): void {
    this.FORM_SEARCH_AUTH.get('puntoVenta').setValue(e);
  }
  resetFormSearch(): void {
    this.bsValueIni = new Date(this.fecha.setMonth(this.fecha.getMonth() - 6));
    this.bsValueFin = new Date();
    this.FORM_SEARCH_AUTH.get('fechaIni').setValue(this.bsValueIni);
    this.FORM_SEARCH_AUTH.get('fechaFin').setValue(this.bsValueFin);
  }
  searchDataFormSubmit(): void {
    this.getDataAutorizaciones();
  }
  getDataAutorizaciones(): void {
    this.DATA_AUTORIZACIONES = [];
    this.DATA_USOS = [];
    this.showSkeletonLoading();
    const data: any = {
      canal: this.FORM_SEARCH_AUTH.get('canalVenta').value,
      puntoVenta: this.FORM_SEARCH_AUTH.get('puntoVenta').value,
      idEstado: this.FORM_SEARCH_AUTH.get('idEstado').value,
      idProceso: this.FORM_SEARCH_AUTH.get('idProceso').value,
      idUso: this.FORM_SEARCH_AUTH.get('idUso').value,
      idSegmento: this.FORM_SEARCH_AUTH.get('segmento').value || 0,
      fechaInicio: this.FORM_SEARCH_AUTH.get('fechaIni').value,
      fechaFin: this.FORM_SEARCH_AUTH.get('fechaFin').value,
    };
    if (data.idProceso === null) {
      data.idProceso = 0;
    }
    const dataBase: any = {
      data: btoa(JSON.stringify(data)),
    };
    this._AutorizacionService.getDocumentsUse(dataBase).subscribe(
      (res: SDto.DocumentUsosDto[]) => {
        res.forEach((e) => {
          const usos = {
            idUso: e.codigoUso,
            nameUso: e.nombreUso,
          };
          if (
            Object.values(this.DATA_USOS.filter((x) => x.idUso === e.codigoUso))
              .length === 0
          ) {
            this.DATA_USOS.push(usos);
          }
        });
        this.hideSkeletonLoading();
        this.DATA_AUTORIZACIONES = res;
      },
      (err: any) => {
        console.log(err);
        this.hideSkeletonLoading();
      }
    );
  }
  showModalHistorial(id): void {
    this.ID_PROCCESS = id;
    this._spinner.show();
    this._AutorizacionService.getHistorialDocument(id).subscribe(
      (res: SDto.DocumentHistoryDto[]) => {
        this.hideAllMenusActions();
        this._spinner.hide();
        this.DATA_HISTORIAL_SOLICITUD = res;
        this.modalHistorial.show();
      },
      (err: any) => {
        console.log(err);
        this.hideAllMenusActions();
        this._spinner.hide();
      }
    );
  }
  hideModalHistorial(): void {
    this.modalHistorial.hide();
  }
  emitirDocumento(id): void {
    this._spinner.show();
    this._Step05Service.verResumenEmision(id).subscribe(
      (res: Step05Dto.ResumenDocumentEmisionDto) => {
        if (res.idProceso > 0) {
          this.DATA_AUTO = {
            V_NIDPROCESS: res.idProceso.toString(),
            ZONA_CIRCULACION: res.auto.idZona,
            p_NIDCLASE: res.auto.idClase.toString(),
            p_NIDFLOW: null,
            p_NIDPROCESS: res.idProceso.toString(),
            p_NIDUSO: res.auto.idUso.toString(),
            p_NREMINDER: null,
            p_NUSERCODE: null,
            p_NVEHBRAND: res.auto.idMarca.toString(),
            p_NVEHMAINMODEL: res.auto.idModelo.toString(),
            p_NYEAR: res.auto.anio.toString(),
            p_SNAMECLASE: res.auto.clase,
            p_SNAME_USO: res.auto.uso,
            p_NAUTOZONE: res.auto.zonaCirculacion,
            p_SNAME_AUTOZONE: null,
            p_SREGIST: res.auto.placa,
            p_SNAME_VEHMODEL: res.auto.modelo,
            p_NVEHMODEL: res.auto.idModelo.toString(),
            p_SEATNUMBER: res.auto.numeroAsientos.toString(),
            p_SNAME_VEHBRAND: res.auto.marca,
            p_SNAME_VEHMAINMODEL: res.auto.modelo,
            p_SNUMSERIE: res.auto.numeroSerie.toString(),
            p_STYPE_REGIST: null,
          };
          this.DATA_CERTIFICADO = {
            P_DESCRIPTARIFARIO: null,
            P_DEXPIRDAT: new Date(res.poliza.finVigencia),
            P_DFECHAENTREGADELIVERY: null,
            P_DISSUEDAT: null,
            P_DSTARTDATE: new Date(res.poliza.inicioVigencia),
            P_IDTARIFARIO: res.poliza.numeroPoliza.toString(),
            P_NCODCHANNEL_BO: null,
            P_NCODNUMPOINT_BO: null,
            P_NCOMISSION: null,
            P_NCOMISSION_BROK: null,
            P_NCOMISSION_INTERM: null,
            P_NCOMISSION_SPOINT: null,
            P_NHAVEDELIVERY: null,
            P_NIDCAMPAIGN: null,
            P_NIDPROCESS: res.idProceso.toString(),
            P_NINTERMED_BROK: null,
            P_NINTERMED_INTERM: null,
            P_NINTERMED_SPOINT: null,
            P_NLOCATDELIVERY: null,
            P_NLOCATDELIVERYDESCRIPTDELIVERY: null,
            P_NMUNICIPALITYDELIVERY: null,
            P_NPLAN: null,
            P_NPOLICY: res.poliza.numeroPoliza.toString(),
            P_NPREMIUM: res.poliza.prima,
            /*  P_NPREMIUMR: null, // */
            P_NPROVINCEDELIVERY: null,
            P_NPROVINCEDESCRIPTDELIVERY: null,
            P_NTIPOPAPEL: null,
            P_NTYPECHANNEL_BO: null,
            P_SCOMENTARIODELIVERY: null,
            P_SDESCHANNEL_BO: null,
            P_SDESNUMPOINT_BO: null,
            P_SDIRECCIONENTREGADELIVERY: null,
            P_SFORMAPAGODELIVERY: null,
            P_SFORMAPAGODESCRIPTDELIVERY: null,
            P_SMUNICIPALITYDESCRIPTDELIVERY: null,
            P_STURNOENTREGADELIVERY: null,
            P_STURNOENTREGADESCRIPTDELIVERY: null,
            V_NIDPROCESS: res.idProceso,
            IsPd: true,
          };
          this.DATA_CONTRATANTE = {
            V_NIDPROCESS: res.idProceso,
            p_NCODINEI: null,
            p_NDOCUMENT_TYP: res.cliente.idTipoDocumento,
            p_NFACTURA: null,
            p_NIDPROCESS: res.idProceso.toString(),
            p_NLOCAT: null,
            p_NMUNICIPALITY: null,
            p_NPERSON_TYP: res.cliente.idTipoPersona.toString(),
            p_NPROVINCE: res.cliente.provincia,
            p_SADDRESS: res.cliente.direccion,
            p_SCANAL: null,
            p_SCLIENT_APPMAT: res.cliente.apellidoMaterno,
            p_SCLIENT_APPPAT: res.cliente.apellidoPaterno,
            p_SCLIENT_NAME: res.cliente.nombre,
            p_SDOCUMENT: res.cliente.numeroDocumento.toString(),
            p_SLEGALNAME: res.cliente.razonSocial,
            p_SMAIL: res.cliente.email,
            p_SPHONE: res.cliente.telefono.toString(),
            v_CONTRATANTE: null,
          };
          let dataModalidad = {};
          switch (Number(res.poliza.numeroPoliza.toString().substring(0, 1))) {
            case 1:
            case 2: {
              dataModalidad = {
                tipoCertificado: 1,
              };
              break;
            }
            case 3:
            case 4: {
              dataModalidad = {
                tipoCertificado: 2,
              };
              break;
            }
            case 7: {
              dataModalidad = {
                tipoCertificado: 3,
              };
              break;
            }
          }
          sessionStorage.setItem('auto', JSON.stringify(this.DATA_AUTO));
          sessionStorage.setItem(
            'contratante',
            JSON.stringify(this.DATA_CONTRATANTE)
          );
          this._utilsService.encryptStorage({
            name: 'certificado',
            data: this.DATA_CERTIFICADO,
          });
          sessionStorage.setItem('Modalidad', JSON.stringify(dataModalidad));
          sessionStorage.setItem(
            'processResult',
            JSON.stringify(res.poliza.numeroPoliza.toString())
          );
          sessionStorage.setItem('pagina', '4');
          sessionStorage.setItem(
            'soat-summary-navigate',
            new Date().getTime().toString()
          );
          localStorage.setItem('is_emision_page', 'true');
          this._Router.navigate(['/extranet/step05'], {
            queryParams: {
              ID_PROCCESS: res.idProceso,
            },
          });
        }
        this.hideAllMenusActions();
        this._spinner.hide();
      },
      (err: any) => {
        console.log(err);
        this._spinner.hide();
      }
    );
  }
  verDocumentosSubidos(id): void {
    this._spinner.show();
    this.hideAllMenusActions();
    this.ID_PROCCESS = id;
    this._AutorizacionService.verDocumentosSubidos(id).subscribe(
      (res: SDto.DocumentosSubidosDto[]) => {
        this.DATA_DOCUMENTOS_SUBIDOS = res;
        this._spinner.hide();
        this.modalDocumentosSubidos.show();
      },
      (err: any) => {
        console.log(err);
        this._spinner.hide();
      }
    );
  }
  hideDocumentosSubidos(): void {
    this.modalDocumentosSubidos.hide();
  }
  descargarDocumento(data: SDto.DocumentosSubidosDto): void {
    let linkSource = 'data:application/pdf;base64,';
    linkSource += data.archivo;
    const a = document.createElement('a');
    a.setAttribute('href', linkSource);
    a.setAttribute('download', data.nombreArchivo);
    a.setAttribute('target', '_blank');
    a.setAttribute('style', 'display:none;');
    document.body.appendChild(a);
    a.click();
    a.remove();
  }
  showHideModalConfirmSolicitud(is_show: boolean, id?): void {
    if (is_show === true) {
      this.hideAllMenusActions();
      this.COMENTARIO_SOLICITUD = '';
      this.ID_PROCESO_SOLICITUD = id;
      this.modalComfirmAprobar.show();
    } else {
      this.COMENTARIO_SOLICITUD = '';
      this.modalComfirmAprobar.hide();
    }
  }
  confirmAprobarSolicitud() {
    this.STATE_SOLICITUD = 2;
    this.COMENTARIO_SOLICITUD = '';
    this.modalComfirmAprobar.hide();
    this._spinner.show();
    const data: any = {
      IdProceso: this.ID_PROCESO_SOLICITUD,
      IdEstado: this.STATE_SOLICITUD,
      IdUsuario: this.ID_USER,
      Comentario: this.COMENTARIO_SOLICITUD,
    };
    this._AutorizacionService.aprobarRechazarSolicitud(data).subscribe(
      (res: any) => {
        this._spinner.hide();
        if (res === true) {
          this.getDataAutorizaciones();
          this.showModalSuccess(
            'Mensaje',
            `La solicitud ${this.ID_PROCESO_SOLICITUD} fue aprobada correctamente.`
          );
        }
      },
      (err: any) => {
        console.log(err);
        this._spinner.hide();
      }
    );
  }
  showHideModalConfirmRechazarSolicitud(is_show: boolean, id?): void {
    if (is_show === true) {
      this.hideAllMenusActions();
      this.COMENTARIO_SOLICITUD = '';
      this.ID_PROCESO_SOLICITUD = id;
      this.modalComfirmRechazar.show();
    } else {
      this.COMENTARIO_SOLICITUD = '';
      this.modalComfirmRechazar.hide();
    }
  }
  confirmRechazarSolicitud() {
    this.STATE_SOLICITUD = 3;
    const data: any = {
      IdProceso: this.ID_PROCESO_SOLICITUD,
      IdEstado: this.STATE_SOLICITUD,
      IdUsuario: this.ID_USER,
      Comentario: this.COMENTARIO_SOLICITUD,
    };
    this.modalComfirmRechazar.hide();
    this._spinner.show();
    this._AutorizacionService.aprobarRechazarSolicitud(data).subscribe(
      (res: any) => {
        this._spinner.hide();
        if (res === true) {
          this.getDataAutorizaciones();
          this.showModalSuccess(
            'Mensaje',
            `La solicitud ${this.ID_PROCESO_SOLICITUD} se rechazó correctamente.`
          );
        }
        this.COMENTARIO_SOLICITUD = '';
      },
      (err: any) => {
        console.log(err);
        this.COMENTARIO_SOLICITUD = '';
        this._spinner.hide();
      }
    );
  }
  showModalSuccess(title, body): void {
    this.TITLE_MODAL_SUCCESS = title;
    this.BODY_MODAL_SUCCESS = body;
    this.modalSuccess.show();
  }
  hideModalSuccess(): void {
    this.TITLE_MODAL_SUCCESS = null;
    this.BODY_MODAL_SUCCESS = null;
    this.modalSuccess.hide();
  }
  showModalResumen(id): void {
    this._spinner.show();
    this.hideAllMenusActions();
    this._Step05Service.verResumenEmision(id).subscribe(
      (res: Step05Dto.ResumenDocumentEmisionDto) => {
        this.DATA_RESUMEN = res;
        this._spinner.hide();
        this.modalResumen.show();
      },
      (err: any) => {
        console.log(err);
        this._spinner.hide();
      }
    );
  }
  hideModalResumen(): void {
    this.modalResumen.hide();
  }
  showHideModalConfirmAnular(is_show: boolean, idProces?: number): void {
    if (is_show) {
      this.ID_PROCESO_SOLICITUD = idProces;
      this.modalComfirmAnular.show();
    } else {
      this.modalComfirmAnular.hide();
    }
  }
  confirmAnularSolicitud(): void {
    this.hideAllMenusActions();
    this.showHideModalConfirmAnular(false);
    this._spinner.show();
    this.STATE_SOLICITUD = 4;
    const data: any = {
      IdProceso: this.ID_PROCESO_SOLICITUD,
      IdEstado: this.STATE_SOLICITUD,
      IdUsuario: this.ID_USER,
      Comentario: '',
    };
    this._AutorizacionService.aprobarRechazarSolicitud(data).subscribe(
      (res: any) => {
        this._spinner.hide();
        this.showModalSuccess('', 'La solicitud fue anulada correctamente');
        this.getDataAutorizaciones();
      },
      (err: any) => {
        console.error(err);
        this._spinner.hide();
      }
    );
  }
  //#endregion
}
