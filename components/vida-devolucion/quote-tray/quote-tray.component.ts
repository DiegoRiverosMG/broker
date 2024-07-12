import {
  Component,
  OnInit,
  TemplateRef,
  ViewChild,
  ViewContainerRef,
} from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { Router, ActivatedRoute } from '@angular/router';
import { BsDatepickerConfig } from 'ngx-bootstrap/datepicker';
import { NgxSpinnerService } from 'ngx-spinner';
import { UtilsService } from '@shared/services/utils/utils.service';
import { QuoteTrayService } from '../../../services/vida-devolucion/quote-tray/quote-tray.service';
import { AppConfig } from '@root/app.config';
import { RegularExpressions } from '@shared/regexp/regexp';
import {
  IListadoProspectosRequest,
  IListadoProspectosResponse,
} from '../../../interfaces/vida-devolucion/listado-prospectos.interface';
import moment from 'moment';
import { IHistorialProspectoResponse } from '../../../interfaces/vida-devolucion/historial-prospecto.interface';
import { ITrazabilidadResponse } from '../../../interfaces/vida-devolucion/trazabilidad';

import { IDescartarProspectoRequest } from '../../../interfaces/vida-devolucion/descartar-prospecto.interface';
import { IResponse } from '../../../../../shared/interfaces/response.interface';
import { VidaDevolucionService } from '../../../services/vida-devolucion/vida-devolucion.service';
import { SummaryService } from '@root/layout/broker/services/vida-devolucion/summary/summary.service';
import { SalesHistoryService } from '../../../services/vida-devolucion/sales-history/sales-history.service';
import { IReactivarAnulado } from '@root/layout/broker/interfaces/vida-devolucion/reactivar.interface';

@Component({
  selector: 'app-quote-tray',
  templateUrl: './quote-tray.component.html',
  styleUrls: ['./quote-tray.component.scss'],
})
export class QuoteTrayComponent implements OnInit {
  bsConfigValidity: Partial<BsDatepickerConfig>;
  bsConfigValidityEnd: Partial<BsDatepickerConfig>;

  FormFilter: FormGroup;
  formAsignar: FormGroup;
  formAsignarAsesorReactivar: FormGroup;
  antiguoasesor: any;
  data: any[];
  datah: any[];
  datahh: any[];
  stateType: {
    id: number;
    description: string;
  };

  /* N° DOCUMENTO */
  LimitdocumentNumber: {
    min: number;
    max: number;
  };

  idCliente: number;

  channelSales$: Array<any>;
  branches$: Array<any>;
  products$: Array<any>;

  N_DOCUMENT: number;
  N_EMAIL: String;
  N_PHONE: number;
  N_BIRTHDAY: number;
  idType: number;
  message: string;

  ejecutivos: Array<any> = [];
  estados: Array<any> = [];
  savestate: any; // almacenar datos para reasignar
  assesorSelected: any;
  idassesorSelected: any;
  listAssesors: Array<any> = [];
  listComercialEjecutives$ = new Array();
  listTypeClient$ = new Array();
  isAproval = false;

  title = '';

  prospectSelected: any;

  p = 0;
  a = '518';

  listData = [
    'Número de documento',
    'Correo',
    'Celular',
    ' Fecha de nacimiento',
  ];
  @ViewChild('modalHistory', { static: true, read: TemplateRef })
  _modalHistory: TemplateRef<any>;
  @ViewChild('modalTrazabilidad', { static: true, read: TemplateRef })
  _modalTrazabilidad: TemplateRef<any>;
  @ViewChild('modalReasign', { static: true, read: TemplateRef })
  _modalReasign: TemplateRef<any>;
  @ViewChild('modalReasignAlert', { static: true, read: TemplateRef })
  _modalReasignAlert: TemplateRef<any>;
  @ViewChild('modalReactivarAlert', { static: true, read: TemplateRef })
  _modalReactivarAlert: TemplateRef<any>;
  @ViewChild('modalAsignarReactivar', { static: true, read: TemplateRef })
  _modalAsignarReactivar: TemplateRef<any>;
  @ViewChild('modalDatasign', { static: true, read: TemplateRef })
  _modalDatasign: TemplateRef<any>;
  @ViewChild('modalRechazar', { static: true, read: TemplateRef })
  _modalRechazar: TemplateRef<any>;
  @ViewChild('modalMessage', { static: true, read: TemplateRef })
  _modalMessage: TemplateRef<any>;
  vc: any;
  clientId: any;
  asesor: any;
  clientData: any;
  createProspcet: boolean;
  clientPolicy: any;
  isDisabled: boolean;
  constructor(
    private readonly router: Router,
    private readonly activatedRoute: ActivatedRoute,
    private readonly builder: FormBuilder,
    private readonly summaryService: SummaryService,
    private readonly _vc: ViewContainerRef,
    private readonly _QuoteTrayService: QuoteTrayService,
    private readonly _spinner: NgxSpinnerService,
    private readonly utilsService: UtilsService,
    private readonly vidaDevolucionService: VidaDevolucionService,
    private readonly salesHistoryService: SalesHistoryService
  ) {
    this.createProspcet = true;
    this.LimitdocumentNumber = {
      min: 8,
      max: 8,
    };
    this.isDisabled = false;
    this.bsConfigValidity = Object.assign(
      {},
      {
        dateInputFormat: 'DD/MM/YYYY',
        locale: 'es',
        containerClass: 'theme-dark-blue',
        showWeekNumbers: true,
        maxDate: new Date(),
      }
    );
    this.assesorSelected = 0;
    this.N_DOCUMENT = null;
    this.N_EMAIL = null;
    this.N_PHONE = null;
    this.N_BIRTHDAY = null;
    this.idType = 0;
    this.bsConfigValidityEnd = Object.assign(
      {},
      {
        dateInputFormat: 'DD/MM/YYYY',
        locale: 'es',
        containerClass: 'theme-dark-blue',
        showWeekNumbers: true,
        maxDate: new Date(),
      }
    );

    this.FormFilter = this.builder.group({
      channelSale: [0],
      branch: [{ value: 71, disabled: true }],
      product: [{ value: 1, disabled: true }],
      documentType: [{ value: 2, disabled: true }],
      documentNumber: [null],
      clientId: [null],
      clientName: [null],
      quotationNumber: [null],
      validity: [new Date('01-01-2022')],
      validityEnd: [new Date()],
      state: [0],
      ejecutivo: [{ value: +this.currentUser['id'], disabled: false }],
      nombres: [null],
      PrimerApellido: [null],
      SegundoApellido: [null],
      typeClient: ['1'],
    });
    this.formAsignar = this.builder.group({
      asignar_asesor: ['', Validators.required],
    });

    this.formAsignarAsesorReactivar = this.builder.group({
      asignar_asesor_reactivar: [null, Validators.required],
    });

    this.resetFormFilters(false);

    this.isAproval =
      location.pathname.indexOf(
        'vidadevolucion/prospectos/aprobaciones-pendientes'
      ) > 0;

    this.setLimitdocumentNumber();
  }

  ngOnInit(): void {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'smooth',
    });

    this.activatedRoute.queryParams
      .filter((params) => params.cliente)
      .subscribe((params) => {
        this.clientPolicy = params.policyClient;
        this.summaryService.getState(+this.clientId).subscribe({
          next: (response: any) => {
            if (response.success) {
              if (this.clientPolicy == 1) {
                this.stateType = {
                  id: 2,
                  description: 'ASIGNADO',
                };
              } else {
                this.stateType = {
                  id: response.listaEstado.idEstado,
                  description: response.listaEstado.estado,
                };
              }
            }
          },
          error: (error: HttpErrorResponse) => {
            console.error(error);
          },
        });
      });

    sessionStorage.removeItem(AppConfig.VIDADEVOLUCION_COMERCIAL_STORAGE);
    fetch(
      `${AppConfig.DOMAIN_URL}/assets/formato-tramas/vidadevolucion/terminos-condiciones.txt`
    )
      .then((res) => res.text())
      .then((data) => {
        sessionStorage.setItem('terms-vdp', data);
      });
    this.f['documentType'].valueChanges.subscribe((_: string) => {
      switch (+_) {
        case 2:
          this.LimitdocumentNumber = {
            min: 8,
            max: 8,
          };
          break;
        default:
          this.LimitdocumentNumber = {
            min: 9,
            max: 12,
          };
          break;
      }
      this.f['documentNumber'].setValue(null, {
        emitEvent: false,
      });
      this.setLimitdocumentNumber();
    });
    this.getComercialEjecutives();
    this.f['documentNumber'].valueChanges.subscribe((_: string) => {
      if (!RegularExpressions.numbers.test(_)) {
        this.f['documentNumber'].setValue(_?.slice(0, _.length - 1) || null, {
          emitEvent: false,
        });
      }
    });

    this.f['clientId'].valueChanges.subscribe((_: string) => {
      if (!RegularExpressions.numbers.test(_)) {
        this.f['clientId'].setValue(_?.slice(0, _.length - 1) || null, {
          emitEvent: false,
        });
      }
    });

    this.f['quotationNumber'].valueChanges.subscribe((_: string) => {
      if (!RegularExpressions.numbers.test(_)) {
        this.f['quotationNumber'].setValue(_?.slice(0, _.length - 1) || null, {
          emitEvent: false,
        });
      }
    });

    this.setChannelSaleForm();
    this.buscar(true);
    this.getParameters();
    this.getBranches();
    this.channelSales();

    // const payload = {
    // tipoEvento : 'CR',
    // idCliente : '00000093834000',
    // fechaEvento : '12/09/2022',
    // dueñoProspecto : '2011',
    // ejecutorEvento : '2077',
    // description : 'prueba 2.61',
    // };
    // this.summaryService.getTablaTrazabilidad(this.a).subscribe({
    //   next: (response: any) => {
    //     console.log(response);
    //   },
    //   error: (error: HttpErrorResponse) => {
    //     console.error(error);
    //   },
    // });
    this.getComercialEjecutives();
    this.listTypeClient$ = [
      {
        cliente: 'ASEGURADO',
        idClient: '1',
      },
      {
        cliente: 'CONTRATANTE',
        idClient: '2',
      },
    ];
    this.f['typeClient'].setValue('1');
  }

  set currentPage(p) {
    this.p = p;
    this.buscar();
  }

  get f(): { [key: string]: AbstractControl } {
    return this.FormFilter.controls;
  }
  searchSuperJefe() {
    if (
      this.currentUser.profileId == '194' ||
      this.currentUser.profileId == '195'
    ) {
      this.isDisabled = true;
    }
  }

  get currentUser(): any {
    const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
    return {
      ...user,
      comercial: +user['profileId'] == 191,
      soporte: +user['profileId'] == 192,
      analista: +user['profileId'] == 193,
      supervisor: +user['profileId'] == 194,
      jefeComercial: +user['profileId'] == 195,
      gerenteComercial: +user['profileId'] == 196,
      gerenteGeneral: +user['profileId'] == 197,
    };
  }

  setChannelSaleForm(): void {
    if (this.activatedRoute.snapshot.data['type'] == 'sin-asignar') {
      this.channelSales$ = [
        {
          id: 2015000002,
          description: 'PROTECTA SA COMPAÑIA DE SEGUROS',
        },
        {
          id: 2021000004,
          description: 'VIDA DEVOLUCIÓN PROTECTA⁺',
        },
      ];
      this.f['channelSale'].enable();
      this.f['channelSale'].setValue(0);
    } else {
      this.channelSales$ = [
        {
          id: 2021000004,
          description: 'VIDA DEVOLUCIÓN PROTECTA⁺',
        },
      ];
      this.f['channelSale'].setValue(2021000004);
      // this.f['channelSale'].disable();
    }
  }

  resetFormFilters(search: boolean = true): void {
    this.setChannelSaleForm();
    this.f['documentType'].setValue(2);
    this.f['documentNumber'].setValue(null);
    this.f['clientId'].setValue(null);
    this.f['quotationNumber'].setValue(null);
    this.f['validity'].setValue(new Date('01-01-2022'));
    this.f['validityEnd'].setValue(new Date());
    this.f['state'].setValue(0);
    this.f['nombres'].setValue(null);
    this.f['PrimerApellido'].setValue(null);
    this.f['SegundoApellido'].setValue(null);
    this.setStateFormFilter();

    if (search) {
      this.buscar(true);
    }
  }
  alertReasign(item) {
    this._vc.createEmbeddedView(this._modalReasignAlert);
    this.clientData = item;
  }

  alertReactivar(item) {
    this._vc.createEmbeddedView(this._modalReactivarAlert);
    this.clientData = item;
  }

  openReasgin() {
    this._vc.clear();
    this.savestate = this.clientData.idCliente;
    this.getParametersVdp();
  }
  openReactivar() {
    this._vc.clear();
    this.savestate = this.clientData.idCliente;
    this.getParametersModalReactivarVdp();
  }

  channelSales(): void {
    this.utilsService.channelSales(this.currentUser.id).subscribe({
      next: (response: any) => {
        this.channelSales$ = response?.items || [];
        if (this.channelSales$.length == 1) {
          this.f['channelSale'].setValue(this.channelSales$[0].id);
          this.f['channelSale'].disable();
          if (+this.currentUser['profileId'] == 192) {
            this.setChannelSaleForm();
          }
        }
        this.buscar(true);
      },
      error: (error: HttpErrorResponse) => {
        console.error(error);
      },
    });
  }

  getBranches(): void {
    this.utilsService.getBranches().subscribe({
      next: (response: any) => {
        this.branches$ = response;
        this.getProducts();
      },
      error: (error: HttpErrorResponse) => {
        console.error(error);
      },
    });
  }

  getProducts(): void {
    const payload = {
      branchId: +this.f['branch'].value,
      userType: +this.currentUser['tipoCanal'],
    };
    this._spinner.show();
    this.utilsService.getProducts(payload).subscribe({
      next: (response: any) => {
        this.products$ = response;
        this._spinner.hide();
      },
      error: (error: HttpErrorResponse) => {
        console.error(error);
        this._spinner.hide();
      },
    });
  }

  getParameters(): void {
    this._QuoteTrayService.getParameters().subscribe({
      next: (response: any) => {
        console.dir(response);
        // this.ejecutivos = response?.asesores;
        this.ejecutivos = [
          {
            id: +this.currentUser['id'],
            nombre: `${this.currentUser['firstName']} ${this.currentUser['lastName']}`,
          },
        ];
        if (this.typeSearch == 1) {
          this.estados = response?.estados.filter((x: any) => +x.id == 1);
          this.setStateFormFilter();
        }
        this.estados = response?.estados;

        if (this.currentUser.profileId != 192) {
          this.estados = this.estados.filter((x: any) => x.id != '10');
        }
      },
      error: (error: any) => {
        console.error(error);
      },
    });
  }

  setStateFormFilter(): void {
    if (this.typeSearch == 1) {
      this.FormFilter.get('state').setValue((this.estados || [])[0]?.id ?? 0);
      this.FormFilter.get('state').disable();
      return;
    }
  }

  setNewCotizacion() {
    sessionStorage.removeItem(AppConfig.VIDADEVOLUCION_COMERCIAL_STORAGE);
    this.router.navigate(['broker/vidadevolucion/cliente/nuevo']);
    window.scrollTo(0, 0);
  }

  setViewCotizacion(data) {
    let params = {};
    if (this.isAproval) {
      params = {
        cliente: data.idCliente,
        cotizacion: data.idCotizacion,
      };
    } else {
      if (this.currentUser.soporte) {
        params = {
          cliente: data.idCliente,
          esSoporte: true,
        };
      } else {
        params = {
          cliente: data.idCliente,
        };
      }
    }
    this.vidaDevolucionService.storage = {
      urlPath:
        '/extranet/vidadevolucion/prospectos/' +
        this.activatedRoute.snapshot.data['path'],
      isNavigate: true,
    };
    this.router.navigate(['broker/vidadevolucion/resumen'], {
      queryParams: params,
    });
    window.scrollTo(0, 0);
  }

  setLimitdocumentNumber(): void {
    this.f['documentNumber'].setValidators(
      Validators.compose([
        Validators.pattern(RegularExpressions.numbers),
        Validators.minLength(this.LimitdocumentNumber.min),
        Validators.maxLength(this.LimitdocumentNumber.max),
      ])
    );
  }

  descartar(data: any): void {
    this.prospectSelected = data;
    this.idCliente = data.idCliente;
    this._vc.createEmbeddedView(this._modalRechazar);
  }

  aceptarDescartar(): void {
    const payload: IDescartarProspectoRequest = {
      idCliente: +this.idCliente,
      idUsuario: +this.currentUser['id'],
    };
    this._spinner.show();
    this._QuoteTrayService.discardLeaflet(payload).subscribe({
      next: (response: IResponse) => {
        this._vc.clear();
        this._spinner.hide();
        this.message = response.message;
        if (response.success) {
          this.message = 'El prospecto fue anulado correctamente';
          this.buscar(true);
        }
        this._vc.createEmbeddedView(this._modalMessage);
      },
      error: (error: HttpErrorResponse) => {
        console.error(error);
        this._spinner.hide();
        this.message = 'Ocurrió un error al intentar anular el prospecto';
        this._vc.createEmbeddedView(this._modalMessage);
      },
    });
  }
  getComercialEjecutives(): void {
    const payload = +this.currentUser['id'];
    this.salesHistoryService.getComercialEjecutives(payload).subscribe({
      next: (response: any) => {
        console.dir(response);
        this.listComercialEjecutives$ = response.listaEjecutivos;
        this.f['ejecutivo'].setValue(+this.currentUser['id']);
        if (this.listComercialEjecutives$.length == 1) {
          this.f['ejecutivo'].disable();
        }
      },
      error: (error: HttpErrorResponse) => {
        console.error(error);
      },
    });
  }
  get typeSearch(): number {
    let type = 0;

    if (location.pathname.indexOf('/sin-asignar') > 0) {
      this.title = 'Bandeja de prospectos sin asignar';
      type = 1; // SOPORTE COMERCIAL
      this.createProspcet = false;
    } else if (
      location.pathname.indexOf('/aprobaciones-pendientes-riesgo') > 0
    ) {
      this.title = 'Aprobaciones pendientes de riesgo';
      type = 6; // ANALISTA DE RIESGO
      this.createProspcet = false;
    } else if (
      location.pathname.indexOf('/aprobaciones-pendientes-bajar-score') > 0
    ) {
      this.title = 'Aprobaciones pendientes de bajar score';
      type = 9;
      this.createProspcet = false;
    } else if (location.pathname.indexOf('/aprobaciones-pendientes') > 0) {
      this.title = 'Aprobaciones pendientes';
      if (this.currentUser.soporte) {
        type = 3; // SOPORTE COMERCIAL
      } else {
        type = 8; // GERENTE GENERAL
      }
      this.createProspcet = false;
    } else {
      this.title = 'Bandeja de prospectos';
      type = 2; // ASESOR COMERCIAL
      this.createProspcet = true;
    }
    return type;
  }

  buscar(refresh = false) {
    if (refresh) {
      this.p = 1;
    }
    this.data = [];
    // IListadoProspectosRequest
    const payload: IListadoProspectosRequest = {
      canal: +this.f['channelSale'].value || 0,
      cantidadRegistros: 10,
      estado: +this.f['state'].value || 0,
      idCliente: +this.f['clientId'].value || 0,
      idCotizacion: +this.f['quotationNumber'].value || 0,
      indice: this.p,
      numeroDocumento: this.f['documentNumber'].value || null,
      ramo: +this.f['branch'].value || 0,
      producto: +this.f['product'].value || 0,
      tipoDocumento: +this.f['documentType'].value || 0,
      // usuario: +this.currentUser['id'],
      usuario: +this.f['ejecutivo'].value,
      fechaInicio: moment(this.f['validity'].value).format('DD/MM/YYYY'),
      fechaFin: moment(this.f['validityEnd'].value).format('DD/MM/YYYY'),
      idTipo: this.typeSearch,
      nombres: this.f['nombres'].value || null,
      primerApellido: this.f['PrimerApellido'].value || null,
      segundoApellido: this.f['SegundoApellido'].value || null,
      idperfil: this.currentUser.profileId || null,
      asegurado: this.f['typeClient'].value == '1' ? true : false,
    };

    this._spinner.show();
    this._QuoteTrayService.listadoProspectos(payload).subscribe(
      (response: IListadoProspectosResponse) => {
        this.data = response.listadoProspectos;
        this._spinner.hide();
      },
      (error: HttpErrorResponse) => {
        console.error(error);
        this._spinner.hide();
      }
    );
  }

  getDocumentDescription(id: number): string {
    switch (+id) {
      case 1:
        return 'RUC';
      case 2:
        return 'DNI';
      case 4:
        return 'C.E';
      default:
        return '';
    }
  }

  attend(data: any): void {
    sessionStorage.removeItem(AppConfig.VIDADEVOLUCION_COMERCIAL_STORAGE);
    this.vidaDevolucionService.storage = {
      urlPath:
        '/extranet/vidadevolucion/prospectos/' +
        this.activatedRoute.snapshot.data['path'],
      isNavigate: true,
    };
    let params = {};
    if (this.currentUser.soporte && this.typeSearch != 3) {
      params = {
        cliente: data.idCliente,
      };
    } else {
      params = {
        cliente: data.idCliente,
        cotizacion: data?.idCotizacion,
        isObserver: data.estado == 'CLIENTE OBSERVADO',
      };
    }
    this.router.navigate(['broker/vidadevolucion/resumen'], {
      queryParams: params,
    });
  }

  historial(data) {
    this.prospectSelected = data;
    this.idCliente = data.idCliente;
    this.datah = [];
    this._spinner.show();
    this._QuoteTrayService.historial(data.idCliente).subscribe(
      (response: IHistorialProspectoResponse) => {
        this.datah = response.historial;
        this._spinner.hide();
        this._vc.createEmbeddedView(this._modalHistory);
      },
      (error: HttpErrorResponse) => {
        console.error(error);
        this._spinner.hide();
      }
    );
  }

  trazabilidad(data) {
    this.prospectSelected = data;
    this.idCliente = data.idCliente;
    this.datahh = [];
    this._spinner.show();
    this.summaryService.getTablaTrazabilidad(data.idCliente).subscribe({
      next: (response: ITrazabilidadResponse) => {
        this.datahh = response.listaEventos;
        this._spinner.hide();
        this._vc.createEmbeddedView(this._modalTrazabilidad);
      },
      error: (error: HttpErrorResponse) => {
        console.error(error);
      },
    });
  }

  closeModals() {
    this.prospectSelected = null;
    this.savestate = [];
    this.asesor = '';
    this._vc.clear();
  }
  closeModal() {
    this.prospectSelected = null;
    this._vc.clear();
  }
  solicitarDatos() {
    const jRequest = {
      idRamo: +this.f['branch'].value,
      idTipoDocumento: +this.idType,
      numeroDocumento: this.N_DOCUMENT,
    };
    this._spinner.show();
    this._QuoteTrayService.getClientData(jRequest).subscribe(
      (response: any) => {
        if (response.statusDescription) {
        }
        this._spinner.hide();
      },
      (error) => {
        this._spinner.hide();
      }
    );
    this._vc.clear();
    this._vc.createEmbeddedView(this._modalDatasign);
  }
  changeAsesor(e): void {
    this.assesorSelected = e;
  }
  getParametersVdp(): void {
    this.vidaDevolucionService.getParameters().subscribe({
      next: (response: any) => {
        this.listAssesors = response.asesores || [];
        this.getclientData(this.savestate);
      },
      error: (error: HttpErrorResponse) => {
        console.error(error);
      },
    });
  }

  getParametersModalReactivarVdp(): void {
    this.vidaDevolucionService.getParameters().subscribe({
      next: (response: any) => {
        this.listAssesors = response.asesores || [];
        this.getclientDataReactivar(this.savestate);
      },
      error: (error: HttpErrorResponse) => {
        console.error(error);
      },
    });
  }

  assignAssesor(): void {
    const payload = {
      idCliente: this.savestate,
      idUsuario: this.formAsignar.get('asignar_asesor').value,
      nUserUpdate: this.currentUser['id'],
      asignado: this.clientData == 'ASIGNADO' ? true : false,
    };
    this._spinner.show();
    this.summaryService.assignAssesor(payload).subscribe({
      next: (response: any) => {
        this._spinner.hide();
        this._vc.clear();
        if (response.success) {
          this.message = 'Se asignó correctamente';
        } else {
          this.message = 'Ocurrió un error al asignar';
        }
        this._vc.createEmbeddedView(this._modalMessage);
        this.formAsignar.reset();
        this.buscar(true);
      },
      error: (error: HttpErrorResponse) => {
        console.error(error);
        this._spinner.hide();
        this.message = 'Ocurrió un error al asignar';
        this._vc.clear();
        this.formAsignar.reset();
        this._vc.createEmbeddedView(this._modalMessage);
      },
    });
  }

  assignAssesorReactivar(): void {
    const payload: IReactivarAnulado = {
      idUser: this.currentUser['id'],
      codClient: this.savestate,
      nUserCode: this.formAsignarAsesorReactivar.get('asignar_asesor_reactivar')
        .value,
    };
    this._spinner.show();
    this.summaryService.reactivar(payload).subscribe({
      next: (response: IResponse) => {
        this._vc.clear();
        this._spinner.hide();
        this.message = response.message;
        if (response.success) {
          this.message = 'El prospecto fue REACTIVADO correctamente';
          this.buscar(true);
        }
        this._vc.createEmbeddedView(this._modalMessage);
      },
      error: (error: HttpErrorResponse) => {
        console.error(error);
        this._spinner.hide();
        this.message = 'Ocurrió un error al intentar Reactivar el prospecto';
        this._vc.createEmbeddedView(this._modalMessage);
      },
    });
  }
  getclientData(idCliente): void {
    this._spinner.show();
    this.summaryService.getSummary(idCliente).subscribe({
      next: (response: any) => {
        if (
          response.success &&
          Object.keys(response.contratante || []).length
        ) {
          this.asesor = response.asesor.asesor;
          this.idassesorSelected = response.asesor.idAsesor;
          const findAsesor = this.listAssesors.find(
            (x) => +x.id == +this.idassesorSelected
          );
          if (findAsesor) {
            this.formAsignar
              .get('asignar_asesor')
              .setValue(this.idassesorSelected);
          } else {
            this.formAsignar.get('asignar_asesor').setValue('');
          }
          this._vc.createEmbeddedView(this._modalReasign);
        }
        this._spinner.hide();
      },
      error: (error: HttpErrorResponse) => {
        console.error(error);
      },
    });
  }

  getclientDataReactivar(idCliente): void {
    this._spinner.show();
    this.summaryService.getSummary(idCliente).subscribe({
      next: (response: any) => {
        if (
          response.success &&
          Object.keys(response.contratante || []).length
        ) {
          this.asesor = response.asesor.asesor;
          this.idassesorSelected = response.asesor.idAsesor;
          const findAsesor = this.listAssesors.find(
            (x) => +x.id == +this.idassesorSelected
          );

          this._vc.createEmbeddedView(this._modalAsignarReactivar);
        }
        this._spinner.hide();
      },
      error: (error: HttpErrorResponse) => {
        console.error(error);
      },
    });
  }
  showButtonNewClient(): boolean {
    return (
      (this.currentUser.comercial || this.currentUser.soporte) &&
      this.typeSearch == 2
    );
  }
}
