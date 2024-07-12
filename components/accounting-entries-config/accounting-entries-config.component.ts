import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { forkJoin } from 'rxjs';
import { AccountingEntriesConfigService } from '../../../backoffice/services/accounting-entries-config/accounting-entries-config.service';
import Swal from 'sweetalert2';

export interface FiltroInterfaz {
  mvt_nnumori?: number;
}
export interface FiltroInterfaceDetalle {
  NIDPROCESS?: number;
  NSTATUS?: string;
  NRECEIPT?: number;
  // SOLO PARA LECTURA EN EL MODAL
  SCODGRU_DES?: string;
  SBRANCH_DES?: string;
}
export interface modeloGrid {
  NNUMORI?: number;
  NCODGRU?: number;
  NNUMASI?: number;
  NCODCON?: number;
  CDESCRI?: string;
  VESTADO?: number;
  CUSUMOD?: string;
}
export interface GrillaConfig {
  AST_NNUMORI?: number;
  AST_NCODGRU?: number;
  AST_NNUMASI?: number;
  AST_NCODCON?: number;
  AST_CDESCRI?: string;
  AST_VESTADO?: number;
  AST_CUSUMOD?: string;
  MCT_CDESCRI?: string;
}
export interface DinamicConfig {
  AST_NNUMORI?: number;
  AST_NCODGRU?: number;
  AST_NNUMASI?: number;
  AST_NCODCON?: number;
  AST_CDESCRI?: string;
  AST_VESTADO?: number;
  AST_CUSUMOD?: string;
  MCT_CDESCRI?: string;
}
export interface FormConfig {
  DIN_NNUMORI?: number;
  DIN_NCODGRU?: number;
  DIN_NCONCEPTO?: number;
  DIN_NNUMASI?: number;
  DIN_NDETASO?: number;
  DIN_CDESCRI?: string;
  DIN_CNUMCTA?: string;
  DIN_CCENCOS?: string;
  DIN_VDEBCRE?: number;
  DIN_NTERASO?: number;
  DIN_NMONEDA?: number;
  DIN_NMONASO?: number;
  DIN_CUSUCRE?: string;
  DIN_CUSUMOD?: string;
  DIN_VESTADO?: number;
  DIN_CASIDES?: string;
  FLG_CCENCOS?: number;
}
export interface FiltroConfig {
  DIN_NNUMORI?: number;
  DIN_NCODGRU?: number;
  DIN_NCODCON?: number;
  DIN_NNUMASI?: number;
  DIN_NDETASO?: number;
  DIN_CNUMCTA?: string;
}

@Component({
  selector: 'app-accounting-entries-config',
  templateUrl: './accounting-entries-config.component.html',
  styleUrls: ['./accounting-entries-config.component.css'],
})

export class AccountingEntriesConfigComponent implements OnInit {

  filtroInterfaz: FiltroInterfaz;
  filterForm: FormGroup;
  deleteForm: FormGroup;
  searchForm: FormGroup;
  modeloGrid: modeloGrid;
  filtroInterfaceDetalle: FiltroInterfaceDetalle;
  registerForm: FormGroup;
  editForm: FormGroup;
  grillaConfig: GrillaConfig;
  dinaConfig: FormConfig;
  dinamicConfig: DinamicConfig;
  dinaForm: FormGroup;
  detDinaForm: FormGroup;
  registerDetForm: FormGroup;
  filtroConfig: FiltroConfig;
  deleteDinForm: FormGroup;
  tablaDetForm: FormGroup;
  deleteDetForm: FormGroup;
  default: any = '';
  modalDinamicaContable: any = '';
  visible = 0;
  visibleCambio = '';
  listVisualizarResults: [];
  origen: [];
  interfaces: [];
  configuraciones: [];
  estados: [];
  tipoDinamica: [];
  movimientos: [];
  eliminados: [];
  montoAsociado: [];
  detalleAsociado: [];
  listaDetalle: [];
  filtroLista: any = [];
  filtroDetalle: any = [];
  filtroEliminadoDetalle: any = [];

  listToShow: any = [];
  currentPage = 1;
  itemsPerPage = 5;
  totalItems = 0;
  maxSize = 10;

  listDinamicResults: any = [];
  listToShowDn: any = [];
  currentPageDn = 1;
  itemsPerPageDn = 5;
  totalItemsDn = 0;

  listToShowDetDn: any = [];
  submitted = false;
  modoVista = '';
  alterVista: boolean = true;
  iconBuscar: '.srcassetsicons';

  tipoMovimiento: string = 'Nuevo';
  estadoMovimiento: boolean = false;
  chkCentroCostos: boolean = false;
  chkDinamicaContable: boolean = false;
  temp_centroCostos_is_checked: boolean = false;
  temp_dinamicaContable_is_checked: boolean = false;
  validador: boolean = false;
  validadorComparacion: boolean = false;
  validadorVariables: boolean = false;
  envioDetalleDinamica: any = [];
  validadorLlenado: any = [];
  arrayTabla: any = [];
  vacio1: string = 'd-none';

  constructor(
    private accountingEntriesConfigService: AccountingEntriesConfigService,
    private modalService: NgbModal,
    private formBuilder: FormBuilder
  ) {}

  ngOnInit(): void {
    this.default = '0';
    this.createForm();
    this.inicializarFiltros();
    this.getParams();
    this.modeloGrid = {};
  }

  private createForm(): void {
    this.filterForm = this.formBuilder.group({
      AST_NNUMORI: [1],
      AST_NCODGRU: [0],
    });
    this.registerForm = this.formBuilder.group({
      NNUMORI: ['', Validators.required],
      NCODGRU: ['', Validators.required],
      NCODCON: [0, Validators.required],
      CDESCRI: ['', Validators.required],
      VESTADO: [1, Validators.required],
      CUSUMOD: [''],
    });
    this.deleteForm = this.formBuilder.group({
      NNUMORI: [''],
      NCODGRU: [''],
      NNUMASI: [''],
      NCODCON: [''],
    });
    this.searchForm = this.formBuilder.group({
      AST_NNUMORI: [1],
      AST_NCODGRU: [0],
    });
    this.editForm = this.formBuilder.group({
      NNUMORI: [''],
      NNUMASI: [''],
      NCODGRU: [''],
      NCODCON: [''],
      CDESCRI: [''],
      VESTADO: [''],
      CUSUMOD: [''],
    });
    this.dinaForm = this.formBuilder.group({
      NNUMORI: [''],
      NCODGRU: [''],
      NCODCON: [''],
      NNUMASI: [''],
      NDETASO: [''],
      CDESCRI: [''],
      CNUMCTA: [''],
      CCENCOS: [''],
      VDEBCRE: [''],
      NTERASO: [''],
      NMONEDA: [''],
      NMONASO: [''],
      CUSUCRE: [''],
      CUSUMOD: [''],
      VESTADO: [''],
      CASIDES: [''],
    });
    this.detDinaForm = this.formBuilder.group({
      DNV_COBSERV: [''],
      DNV_CUSUCRE: [''],
      DNV_CVALOR: [''],
      DNV_DFECREG: [''],
      DNV_NCODEST: [''],
      DNV_NCODGRU: [''],
      DNV_NCONCEPTO: [''],
      DNV_NDETASO: [''],
      DNV_NNUMASI: [''],
      DNV_NNUMORI: [''],
      EST_CDESCRI: [''],
    });
    this.registerDetForm = this.formBuilder.group({
      COBSERV: [''],
      CUSUCRE: [''],
      CUSUMOD: ['', Validators.required],
      DFECREG: [''],
      NCODEST: [''],
      NCODGRU: [''],
      NCODCON: ['', Validators.required],
      NDETASO: ['', Validators.required],
      NNUMASI: [''],
      NNUMORI: ['', Validators.required],
      CNUMCTA: [''],
      CDESCRI: [''],
      FLGCCOS: [0],
      VDEBCRE: ['D', Validators.required],
      NMONASO: [0, Validators.required],
      CVALOR: [''],
    });
    this.deleteDetForm = this.formBuilder.group({
      NNUMORI: [''],
      NCODGRU: [''],
      NCODCON: [''],
      NNUMASI: [''],
      NDETASO: [''],
    });
    this.deleteDinForm = this.formBuilder.group({
      NNUMORI: [''],
      NCODGRU: [''],
      NCODCON: [''],
      NNUMASI: [''],
      NDETASO: [''],
    });
    this.tablaDetForm = this.formBuilder.group({
      CVALOR0: [''],
      NCODEST0: ['', Validators.required],
      Visible0: ['d-none'],
      CVALOR1: [''],
      NCODEST1: [''],
      Visible1: ['d-none'],
      CVALOR2: [''],
      NCODEST2: [''],
      Visible2: ['d-none'],
      CVALOR3: [''],
      NCODEST3: [''],
      Visible3: ['d-none'],
      CVALOR4: [''],
      NCODEST4: [''],
      Visible4: ['d-none'],
      CVALOR5: [''],
      NCODEST5: [''],
      Visible5: ['d-none'],
      CVALOR6: [''],
      NCODEST6: [''],
      Visible6: ['d-none'],
    });
  }

  get controlRegister(): { [key: string]: AbstractControl } {
    return this.registerForm.controls;
  }
  get controlRegisterDet(): { [key: string]: AbstractControl } {
    return this.registerDetForm.controls;
  }
  get controlEdit(): { [key: string]: AbstractControl } {
    return this.editForm.controls;
  }

  getParams = () => {
    let $origen = this.accountingEntriesConfigService.listarOrigen();
    let $estados = this.accountingEntriesConfigService.listarEstados();
    let $tipoDinamica =
      this.accountingEntriesConfigService.listarTipoDinamica();
    return forkJoin([$origen, $estados, $tipoDinamica]).subscribe(
      (res) => {
        this.origen = res[0].Result.combos;
        this.estados = res[1].Result.combos;
        this.tipoDinamica = res[2].Result.combos;
      },
      (err) => {
        Swal.fire(
          'Información',
          'Ha ocurrido un error al obtener los parámetros.',
          'error'
        );
      }
    );
  };

  inicializarFiltros = () => {
    this.filtroInterfaz = {};
    this.filtroInterfaceDetalle = {};
    this.filtroInterfaz.mvt_nnumori = 1;
    this.listarInterfaces(this.filtroInterfaz);
  };

  seleccionarOrigen = (e) => {
    this.filtroInterfaz.mvt_nnumori = e;
    this.filterForm.controls.AST_NCODGRU.setValue(0);
    this.listarInterfaces(this.filtroInterfaz);
  };

  listarInterfaces = (item) => {
    this.accountingEntriesConfigService.listarInterfaces(item).subscribe(
      (res) => {
        this.interfaces = res.Result.lista;
      },
      (err) => {
        Swal.fire(
          'Información',
          'Ha ocurrido un error al obtener las interfaces.',
          'error'
        );
      }
    );
  };

  listarMovimientos = (item) => {
    this.movimientos = [];
    this.accountingEntriesConfigService.listarMovimientoAsiento(item).subscribe(
      (res) => {
        this.movimientos = res.Result.lista;
      },
      (err) => {
        Swal.fire(
          'Información',
          'Ha ocurrido un error al obtener los movimientos.',
          'error'
        );
      }
    );
  };

  listarMontoAsociado = (item) => {
    this.montoAsociado = [];
    this.accountingEntriesConfigService.listarMontoAsociado(item).subscribe(
      (res) => {
        this.montoAsociado = res.Result.lista;
      },
      (err) => {
        Swal.fire(
          'Información',
          'Ha ocurrido un error al obtener los montos asociados.',
          'error'
        );
      }
    );
  };

  listarDetalleAsociado = (item) => {
    this.detalleAsociado = [];
    this.accountingEntriesConfigService.listarDetalleAsociado(item).subscribe(
      (res) => {
        this.detalleAsociado = res.Result.lista;
      },
      (err) => {
        Swal.fire(
          'Información',
          'Ha ocurrido un error al obtener los detalles asociados.',
          'error'
        );
      }
    );
  };

  pageChanged(currentPage) {
    this.currentPage = currentPage;
    this.listToShow = this.listVisualizarResults.slice(
      (this.currentPage - 1) * this.itemsPerPage,
      this.currentPage * this.itemsPerPage
    );
  }

  listarConfiguracionAsientoContable(): void {
    this.accountingEntriesConfigService
      .listarAsientosContanbles(this.filterForm.value)
      .subscribe(
        (res) => {
          this.currentPage = 1;
          this.configuraciones = res.Result.lista;
          this.listVisualizarResults = res.Result.lista;
          this.totalItems = this.listVisualizarResults.length;
          this.listToShow = this.listVisualizarResults.slice(
            (this.currentPage - 1) * this.itemsPerPage,
            this.currentPage * this.itemsPerPage
          );
        },
        (err) => {
          Swal.fire(
            'Información',
            'Ha ocurrido un error al obtener las configuraciones.',
            'error'
          );
        }
      );
  }
  /****SECCION ASIENTOS CONTABLES***/
  mostrarModalAgregar(content: any) {
    if (this.filterForm.value.AST_NCODGRU == 0) {
      Swal.fire('Información', 'Debe seleccionar una interfaz.', 'warning');
      return;
    }
    this.registerForm.controls.NCODCON.setValue(0);
    this.registerForm.controls.CDESCRI.setValue('');
    this.registerForm.controls.NNUMORI.setValue(
      this.filterForm.value.AST_NNUMORI
    );
    this.registerForm.controls.NCODGRU.setValue(
      this.filterForm.value.AST_NCODGRU
    );

    this.listarInterfaces(this.filtroInterfaz);
    this.listarMovimientos(this.registerForm.value);

    this.modalService.open(content, {
      backdrop: 'static',
      size: 'md',
      keyboard: false,
      centered: true,
    });
  }

  agregarAsientoContable() {
    this.submitted = true;
    if (this.registerForm.value.CDESCRI == '') {
      Swal.fire('Información', 'Ingrese la descripción del asiento.', 'warning');
      return;
    }
    if (this.registerForm.value.NCODCON == 0) {
      Swal.fire('Información', 'Ingrese el movimiento del asiento.', 'warning');
      return;
    }

    this.registerForm.controls.CUSUMOD.setValue(
      JSON.parse(localStorage.getItem('currentUser')).username
    ); //Usuario de Creación y Modificación

    this.accountingEntriesConfigService
      .agregarAsientosContanbles(this.registerForm.value)
      .subscribe((res) => {
        if (res.Result.P_NCODE == 0) {
          Swal.fire(
            'Información',
            'Se realizó con éxito la creación del asiento.',
            'success'
          );
          this.listarConfiguracionAsientoContable();
        } else {
          Swal.fire('Error', res.Result.P_SMESSAGE, 'error');
        }
      });
    this.modalService.dismissAll();
  }

  modificarAsientoContable(content: any, item) {
    this.grillaConfig = item;
    this.editForm.controls.NNUMORI.setValue(this.grillaConfig.AST_NNUMORI);
    this.editForm.controls.NCODGRU.setValue(this.grillaConfig.AST_NCODGRU);
    this.editForm.controls.NCODCON.setValue(this.grillaConfig.AST_NCODCON);
    this.editForm.controls.CDESCRI.setValue(this.grillaConfig.AST_CDESCRI);
    this.editForm.controls.VESTADO.setValue(this.grillaConfig.AST_VESTADO);
    this.editForm.controls.NNUMASI.setValue(this.grillaConfig.AST_NNUMASI);
    this.editForm.controls.CUSUMOD.setValue(
      JSON.parse(localStorage.getItem('currentUser')).username
    ); //Usuario de Creación y Modificación
    this.modalService.open(content, {
      backdrop: 'static',
      size: 'md',
      keyboard: false,
      centered: true,
    });
    this.listarInterfaces(this.filtroInterfaz);
    this.listarMovimientos(this.editForm.value);
  }

  modificarAsiento() {
    if (this.editForm.value.CDESCRI == '') {
      Swal.fire('Información', 'Ingrese la descripción del asiento.', 'warning');
      return;
    }
    this.accountingEntriesConfigService
      .modificarAsientosContables(this.editForm.value)
      .subscribe((res) => {
        if (res.Result.P_NCODE == 0) {
          Swal.fire(
            'Información',
            'Se realizó la modificación correctamente.',
            'success'
          );
          this.listarConfiguracionAsientoContable();
        } else {
          Swal.fire('Error', res.Result.P_SMESSAGE, 'error');
        }
      });
    this.modalService.dismissAll();
  }

  eliminarAsientoContable(item) {
    Swal.fire({
      title: 'Información',
      text: '¿Está seguro de eliminar el registro?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Aceptar',
      allowOutsideClick: false,
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.value) {
        this.eliminados = item;
        this.deleteForm.value.NNUMORI = item.AST_NNUMORI;
        this.deleteForm.value.NCODGRU = item.AST_NCODGRU;
        this.deleteForm.value.NNUMASI = item.AST_NNUMASI;
        this.deleteForm.value.NCODCON = item.AST_NCODCON;

        this.accountingEntriesConfigService
          .eliminarAsientosContanbles(this.deleteForm.value)
          .subscribe((res) => {
            if (res.Result.P_NCODE == 0) {
              Swal.fire(
                'Información',
                'Se realizó con éxito la eliminación del registro.',
                'success'
              );
              this.listarConfiguracionAsientoContable();
            } else {
              Swal.fire('Error', res.Result.P_SMESSAGE, 'error');
            }
          });
        this.modalService.dismissAll();
      }
    });
  }

  /****SECCION DINAMICAS CONTABLES***/
  mostrarModalDetalleAsiento(content: any, item): void {
    this.modalDinamicaContable = content;
    this.dinamicConfig = item;
    this.dinaForm.controls.NNUMORI.setValue(this.dinamicConfig.AST_NNUMORI);
    this.dinaForm.controls.NCODGRU.setValue(this.dinamicConfig.AST_NCODGRU);
    this.dinaForm.controls.NCODCON.setValue(this.dinamicConfig.AST_NCODCON);
    this.dinaForm.controls.NNUMASI.setValue(this.dinamicConfig.AST_NNUMASI);
    this.dinaForm.controls.VESTADO.setValue(this.dinamicConfig.AST_VESTADO);
    this.dinaForm.controls.CASIDES.setValue(this.dinamicConfig.AST_CDESCRI);

    this.listarInterfaces(this.filtroInterfaz);
    this.listarMovimientos(this.dinaForm.value);
    this.listarDinamicasContables(this.dinamicConfig);

    this.chkDinamicaContable = this.dinaForm.value.CCENCOS == 1 ? true : false;
    this.activarCentroCostos(this.chkCentroCostos);

    this.modalService.open(content, {
      backdrop: 'static',
      size: 'xl',
      keyboard: false,
      centered: true,
    });
  }

  listarDinamicasContables(item): void {
    this.listDinamicResults = [];
    this.accountingEntriesConfigService
      .listarDinamicasContables(item)
      .subscribe(
        (res) => {
          this.currentPageDn = 1;
          this.listDinamicResults = res.Result.lista;
          this.totalItemsDn = this.listDinamicResults.length;
          this.listToShowDn = this.listDinamicResults.slice(
            (this.currentPageDn - 1) * this.itemsPerPageDn,
            this.currentPageDn * this.itemsPerPageDn
          );
        },
        (err) => {
          Swal.fire(
            'Información',
            'Ha ocurrido un error al obtener las configuraciones.',
            'error'
          );
        }
      );
  }

  pageChangedDn(currentPage) {
    this.currentPageDn = currentPage;
    this.listToShowDn = this.listDinamicResults.slice(
      (this.currentPageDn - 1) * this.itemsPerPageDn,
      this.currentPageDn * this.itemsPerPageDn
    );
  }

  mostrarModalAgregarDinamica(content: any, item) {
    this.visible = 1;
    this.filtroLista = [];
    this.filtroDetalle = [];
    this.arrayTabla = [];
    this.registerDetForm.controls.CNUMCTA.setValue('');
    this.registerDetForm.controls.NDETASO.setValue('');
    this.registerDetForm.controls.NMONASO.setValue(0);

    this.registerDetForm.controls.CDESCRI.setValue('');
    this.registerDetForm.controls.NCODCON.setValue(
      this.dinamicConfig.AST_NCODCON
    );

    this.registerDetForm.controls.NNUMORI.setValue(
      this.dinamicConfig.AST_NNUMORI
    );
    this.registerDetForm.controls.NCODGRU.setValue(
      this.dinamicConfig.AST_NCODGRU
    );
    this.registerDetForm.controls.NNUMASI.setValue(
      this.dinamicConfig.AST_NNUMASI
    );
    this.registerDetForm.controls.CUSUMOD.setValue(
      JSON.parse(localStorage.getItem('currentUser')).username
    );
    this.registerDetForm.controls.FLGCCOS.setValue(2);
    this.chkCentroCostos =
      this.registerDetForm.value.FLGCCOS == 1 ? true : false;
    this.activarCentroCostos(this.chkCentroCostos);

    this.validacionDetalleDinamica();
    this.listarMontoAsociado(this.registerDetForm.value);
    this.listarDetalleAsociado(this.registerDetForm.value);
    this.listarDetalleDinamicas(this.dinaForm.value);

    // this.filtroDetalleDinamica();

    this.modalService.open(content, {
      backdrop: 'static',
      size: 'lg',
      keyboard: false,
      centered: true,
    });
  }

  filtroDetalleDinamica() {
    this.filtroDetalle = [];
    if (this.registerDetForm.value.CNUMCTA == '') {
      Swal.fire(
        'Información',
        'Ingrese la cuenta para generar el detalle.',
        'warning'
      );
      return;
    }
    this.comprobadorLlenado(this.registerDetForm.value.CNUMCTA);
    this.arrayTabla.forEach((e, i) => {
      this.filtroDetalle.push({
        CVALOR: e,
        NCODEST: '',
        Visible: 'd-lg-table-row',
      });
    });
    this.validacionDetalleDinamica();
  }

  validacionDetalleDinamica() {
    if (this.filtroDetalle[0] == undefined) {
      this.tablaDetForm.controls.CVALOR0.setValue('');
      this.tablaDetForm.controls.NCODEST0.setValue('');
      this.tablaDetForm.controls.Visible0.setValue('d-none');
    } else {
      this.tablaDetForm.controls.CVALOR0.setValue(this.filtroDetalle[0].CVALOR);
      this.tablaDetForm.controls.NCODEST0.setValue(
        this.filtroDetalle[0].NCODEST
      );
      this.tablaDetForm.controls.Visible0.setValue(
        this.filtroDetalle[0].Visible
      );
    }
    if (this.filtroDetalle[1] == undefined) {
      this.tablaDetForm.controls.CVALOR1.setValue('');
      this.tablaDetForm.controls.NCODEST1.setValue('');
      this.tablaDetForm.controls.Visible1.setValue('d-none');
    } else {
      this.tablaDetForm.controls.CVALOR1.setValue(this.filtroDetalle[1].CVALOR);
      this.tablaDetForm.controls.NCODEST1.setValue(
        this.filtroDetalle[1].NCODEST
      );
      this.tablaDetForm.controls.Visible1.setValue(
        this.filtroDetalle[1].Visible
      );
    }
    if (this.filtroDetalle[2] == undefined) {
      this.tablaDetForm.controls.CVALOR2.setValue('');
      this.tablaDetForm.controls.NCODEST2.setValue('');
      this.tablaDetForm.controls.Visible2.setValue('d-none');
    } else {
      this.tablaDetForm.controls.CVALOR2.setValue(this.filtroDetalle[2].CVALOR);
      this.tablaDetForm.controls.NCODEST2.setValue(
        this.filtroDetalle[2].NCODEST
      );
      this.tablaDetForm.controls.Visible2.setValue(
        this.filtroDetalle[2].Visible
      );
    }
    if (this.filtroDetalle[3] == undefined) {
      this.tablaDetForm.controls.CVALOR3.setValue('');
      this.tablaDetForm.controls.NCODEST3.setValue('');
      this.tablaDetForm.controls.Visible3.setValue('d-none');
    } else {
      this.tablaDetForm.controls.CVALOR3.setValue(this.filtroDetalle[3].CVALOR);
      this.tablaDetForm.controls.NCODEST3.setValue(
        this.filtroDetalle[3].NCODEST
      );
      this.tablaDetForm.controls.Visible3.setValue(
        this.filtroDetalle[3].Visible
      );
    }
    if (this.filtroDetalle[4] == undefined) {
      this.tablaDetForm.controls.CVALOR4.setValue('');
      this.tablaDetForm.controls.NCODEST4.setValue('');
      this.tablaDetForm.controls.Visible4.setValue('d-none');
    } else {
      this.tablaDetForm.controls.CVALOR4.setValue(this.filtroDetalle[4].CVALOR);
      this.tablaDetForm.controls.NCODEST4.setValue(
        this.filtroDetalle[4].NCODEST
      );
      this.tablaDetForm.controls.Visible4.setValue(
        this.filtroDetalle[4].Visible
      );
    }
  }

  validarDetalleVariables() {
    this.validadorVariables = false;
    this.submitted = true;
    this.filtroLista = [];

    if (
      this.registerDetForm.value.NDETASO == undefined ||
      this.registerDetForm.value.NDETASO == ''
    ) {
      Swal.fire('Información', 'Ingrese el código de la dinámica.', 'warning');
      return (this.validadorVariables = true);
    }
    if (
      this.registerDetForm.invalid &&
      this.registerDetForm.value.NMONASO !== 0
    ) {
      Swal.fire(
        'Información',
        'Ingrese todos los campos.',
        'warning'
      );
      return (this.validadorVariables = true);
    }
    if (this.registerDetForm.value.CNUMCTA.length !== 10) {
      Swal.fire(
        'Información',
        'El número de cuenta debe contar con 10 caracteres.',
        'warning'
      );
      return (this.validadorVariables = true);
    }
    if (this.registerDetForm.value.NMONASO == 0) {
      Swal.fire('Información', 'Seleccione un monto asociado.', 'warning');
      return (this.validadorVariables = true);
    }
    this.filtroDetalle.forEach((e, i) => {
      if (e.CVALOR == this.tablaDetForm.value.CVALOR0) {
        if (this.tablaDetForm.value.NCODEST0 == '') {
          return (this.validador = true);
        }
      }
      if (e.CVALOR == this.tablaDetForm.value.CVALOR1) {
        if (this.tablaDetForm.value.NCODEST1 == '') {
          return (this.validador = true);
        }
      }
      if (e.CVALOR == this.tablaDetForm.value.CVALOR2) {
        if (this.tablaDetForm.value.NCODEST2 == '') {
          return (this.validador = true);
        }
      }
      if (e.CVALOR == this.tablaDetForm.value.CVALOR3) {
        if (this.tablaDetForm.value.NCODEST3 == '') {
          return (this.validador = true);
        }
      }
      if (e.CVALOR == this.tablaDetForm.value.CVALOR4) {
        if (this.tablaDetForm.value.NCODEST4 == '') {
          return (this.validador = true);
        }
      }
      if (e.CVALOR == this.tablaDetForm.value.CVALOR5) {
        if (this.tablaDetForm.value.NCODEST5 == '') {
          return (this.validador = true);
        }
      }
      if (e.CVALOR == this.tablaDetForm.value.CVALOR6) {
        if (this.tablaDetForm.value.NCODEST6 == '') {
          return (this.validador = true);
        }
      }
    });
    if (this.validador) {
      Swal.fire(
        'Información',
        'Ingrese la descripción de todas las variables.',
        'warning'
      );
      return (this.validadorVariables = true);
    }
    this.registerDetForm.controls.FLGCCOS.setValue(
      this.registerDetForm.value.FLGCCOS == true ? 1 : 0
    );
  }

  comprobadorLlenado(item) {
    this.visible = 2;
    this.filtroLista = item;
    this.validadorLlenado = [];
    let ejemplo = [];
    this.arrayTabla = [];
    let val = 1;
    var validar = [
      '!',
      '#',
      '$',
      '%',
      '&',
      '/',
      '(',
      ')',
      '=',
      '*',
      '-',
      '+',
      '.',
      ',',
    ];
    var valoresRechazados = /^[0-9]#+!"$/;
    var valoresAceptados = /^[0-9]+$/;
    ejemplo = this.filtroLista.toUpperCase().split('');
    ejemplo.forEach((e, i) => {
      validar.forEach((a, b) => {
        if (a == e) {
          return (val = 0);
        }
      });
      if (ejemplo[i].match(valoresAceptados)) {
        return;
      } else {
        this.validadorLlenado.push(e);
      }
    });

    if (val == 0) {
      Swal.fire('Información', 'Solo debe ingresar números y letras.', 'warning');
      return;
    } else {
      this.validadorLlenado.forEach((e, i) => {
        let var0 = this.validadorLlenado[i - 1];
        let var1 = this.validadorLlenado[i];
        let var2 = this.validadorLlenado[i + 1];
        let var3 = this.validadorLlenado[i + 2];
        let var4 = this.validadorLlenado[i + 3];
        let var5 = this.validadorLlenado[i + 4];
        let var6 = this.validadorLlenado[i + 5];
        if (var1 == var0) {
          return;
        } else if (var1 == var2) {
          if (var2 == var3) {
            if (var3 == var4) {
              if (var4 == var5) {
                if (var5 == var6) {
                  this.arrayTabla.push(var1 + var2 + var3 + var4 + var5 + var6);
                  return;
                } else {
                  this.arrayTabla.push(var1 + var2 + var3 + var4 + var5);
                  return;
                }
              } else {
                this.arrayTabla.push(var1 + var2 + var3 + var4);
                return;
              }
            } else {
              this.arrayTabla.push(var1 + var2 + var3);
              return;
            }
          } else {
            this.arrayTabla.push(var1 + var2);
            return;
          }
        } else {
          this.arrayTabla.push(var1);
        }
      });
    }
  }
  agregarDinamica() {
    this.validador = false;
    this.validadorVariables = false;
    this.validadorComparacion = false;
    this.listDinamicResults.forEach((e, i) => {
      if (e.DIN_NDETASO == this.registerDetForm.value.NDETASO) {
        return (this.validador = true);
      }
    });
    if (this.validador) {
      Swal.fire(
        'Información',
        'El código ingresado ya está en uso.',
        'warning'
      );
      return;
    }
    if (this.visible == 1) {
      Swal.fire(
        'Información',
        'Generar la descripción de la cuenta.',
        'warning'
      );
      return;
    }
    this.validarDetalleVariables();
    if (this.validadorVariables) {
      return;
    }
    this.comprobadorLlenado(this.registerDetForm.value.CNUMCTA);
    this.arrayTabla.forEach((e, i) => {
      let m = 0;
      this.arrayTabla.forEach((x, y) => {
        if (e == x) {
          return (m = m + 1);
        }
      });
      if (m == 2) {
        return (this.validadorComparacion = true);
      }
      if (this.arrayTabla.length !== this.filtroDetalle.length) {
        return (this.validadorComparacion = true);
      }
      if (this.arrayTabla[i] == undefined) {
        return (this.validadorComparacion = true);
      }
      if (this.filtroDetalle[i].CVALOR == undefined) {
        return (this.validadorComparacion = true);
      }
      if (this.arrayTabla[i] !== this.filtroDetalle[i].CVALOR) {
        this.validadorComparacion = true;
      }
    });

    if (this.validadorComparacion) {
      Swal.fire(
        'Información',
        'La cuenta ingresada no coincide con las variables.',
        'warning'
      );
      return (this.validadorVariables = true);
    }
    this.registerDetForm.value.CNUMCTA =
      this.registerDetForm.value.CNUMCTA.toUpperCase();
    //AGREGAR DETALLE DINAMICA
    this.accountingEntriesConfigService
      .agregarDinamicasContables(this.registerDetForm.value)
      .subscribe((res) => {
        if (res.Result.P_NCODE == 0) {
          this.listarDinamicasContables(this.dinamicConfig);

          this.agregarDetalleDinamica(this.filtroDetalle);
          this.modalService.dismissAll();
          this.mostrarModalDetalleAsiento(
            this.modalDinamicaContable,
            this.dinamicConfig
          );
        } else {
          Swal.fire('Error', res.Result.P_SMESSAGE, 'error');
        }
      });
  }

  agregarDetalleDinamica(item) {
    this.envioDetalleDinamica = [];
    item.forEach((e, i) => {
      if (i == 0) {
        e.NCODEST = this.tablaDetForm.value.NCODEST0;
      }
      if (i == 1) {
        e.NCODEST = this.tablaDetForm.value.NCODEST1;
      }
      if (i == 2) {
        e.NCODEST = this.tablaDetForm.value.NCODEST2;
      }
      if (i == 3) {
        e.NCODEST = this.tablaDetForm.value.NCODEST3;
      }
      if (i == 4) {
        e.NCODEST = this.tablaDetForm.value.NCODEST4;
      }

      e.NNUMORI = this.registerDetForm.value.NNUMORI;
      e.NCODGRU = this.registerDetForm.value.NCODGRU;
      e.NCODCON = this.registerDetForm.value.NCODCON;
      e.NNUMASI = this.registerDetForm.value.NNUMASI;
      e.NDETASO = this.registerDetForm.value.NDETASO;
      e.CUSUMOD = this.registerDetForm.value.CUSUMOD;
    });
    
    this.accountingEntriesConfigService
      .agregarDetalleDinamicas(item)
      .subscribe((res) => {
        Swal.fire(
          'Información',
          'Se realizó con éxito la modificación del detalle contable.',
          'success'
        );
      });
  }

  modificarDinamicaContable(content: any, item) {
    this.visible = 1;
    this.filtroLista = [];
    this.filtroDetalle = [];
    this.arrayTabla = [];
    this.dinaConfig = item;
    this.visibleCambio = this.dinaConfig.DIN_CNUMCTA;
    this.registerDetForm.controls.VDEBCRE.setValue(this.dinaConfig.DIN_VDEBCRE);
    this.registerDetForm.controls.NDETASO.setValue(this.dinaConfig.DIN_NDETASO);
    this.registerDetForm.controls.CNUMCTA.setValue(this.dinaConfig.DIN_CNUMCTA);
    this.registerDetForm.controls.CDESCRI.setValue(this.dinaConfig.DIN_CDESCRI);
    this.registerDetForm.controls.FLGCCOS.setValue(this.dinaConfig.FLG_CCENCOS);
    this.registerDetForm.controls.NNUMORI.setValue(this.dinaConfig.DIN_NNUMORI);
    this.registerDetForm.controls.NCODGRU.setValue(this.dinaConfig.DIN_NCODGRU);
    this.registerDetForm.controls.NCODCON.setValue(
      this.dinaConfig.DIN_NCONCEPTO
    );
    this.registerDetForm.controls.NMONASO.setValue(this.dinaConfig.DIN_NMONASO);
    this.registerDetForm.controls.NNUMASI.setValue(this.dinaConfig.DIN_NNUMASI);
    this.registerDetForm.controls.CUSUMOD.setValue(
      JSON.parse(localStorage.getItem('currentUser')).username
    );
    this.chkCentroCostos =
      this.registerDetForm.value.FLGCCOS == 1 ? true : false;
    this.activarCentroCostos(this.chkCentroCostos);

    this.validacionDetalleDinamica();
    this.listarMontoAsociado(this.registerDetForm.value);
    this.listarDetalleAsociado(this.registerDetForm.value);
    this.listarDetalleDinamicas(this.registerDetForm.value);

    this.modalService.open(content, {
      backdrop: 'static',
      size: 'lg',
      keyboard: false,
      centered: true,
    });
  }

  activarCentroCostos(checked) {
    this.temp_centroCostos_is_checked = false;
    if (!checked) {
      this.temp_centroCostos_is_checked = false;
    } else {
      this.temp_centroCostos_is_checked = true;
    }
  }

  eliminarDinamicaAsiento(content: any, item) {
    Swal.fire({
      title: 'Información',
      text: '¿Está seguro de eliminar el registro?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Aceptar',
      allowOutsideClick: false,
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.value) {
        this.deleteDinForm.value.NNUMORI = item.DIN_NNUMORI;
        this.deleteDinForm.value.NCODGRU = item.DIN_NCODGRU;
        this.deleteDinForm.value.NNUMASI = item.DIN_NNUMASI;
        this.deleteDinForm.value.NCODCON = item.DIN_NCONCEPTO;
        this.deleteDinForm.value.NDETASO = item.DIN_NDETASO;

        this.accountingEntriesConfigService
          .eliminarDinamicaAsientos(this.deleteDinForm.value)
          .subscribe((res) => {
            if (res.Result.P_NCODE == 0) {
              Swal.fire(
                'Información',
                'Se realizó con éxito la eliminación del registro.',
                'success'
              );
              this.modalService.dismissAll();
              this.mostrarModalDetalleAsiento(
                this.modalDinamicaContable,
                this.dinamicConfig
              );
            } else {
              Swal.fire('Error', res.Result.P_SMESSAGE, 'error');
            }
          });
      }
    });
  }

  modificarDinamica() {
    /****/
    this.validador = false;
    this.validadorVariables = false;
    this.validadorComparacion = false;

    this.validarDetalleVariables();
    if (this.validadorVariables) {
      return;
    }
    
    this.comprobadorLlenado(this.registerDetForm.value.CNUMCTA);
    this.arrayTabla.forEach((e, i) => {
      let m = 0;
      this.arrayTabla.forEach((x, y) => {
        if (e == x) {
          return (m = m + 1);
        }
      });
      if (m == 2) {
        return (this.validadorComparacion = true);
      }
      if (this.arrayTabla.length !== this.filtroDetalle.length) {
        return (this.validadorComparacion = true);
      }
      if (this.arrayTabla[i] == undefined) {
        return (this.validadorComparacion = true);
      }
      if (this.filtroDetalle[i].CVALOR == undefined) {
        return (this.validadorComparacion = true);
      }
      if (this.arrayTabla[i] !== this.filtroDetalle[i].CVALOR) {
        this.validadorComparacion = true;
      }
    });
    if (this.validadorComparacion) {
      Swal.fire(
        'Información',
        'La cuenta ingresada no coincide con las variables.',
        'warning'
      );
      return (this.validadorVariables = true);
    }
    this.registerDetForm.value.CNUMCTA =
      this.registerDetForm.value.CNUMCTA.toUpperCase();
    
    /*****/ //
    /**** MODIFICAR DETALLE DINAMICA CONTABLE ****/
    this.accountingEntriesConfigService
      .modificarDinamicaAsientos(this.registerDetForm.value)
      .subscribe((res) => {
        this.agregarDetalleDinamica(this.filtroDetalle);

        this.modalService.dismissAll();
        this.mostrarModalDetalleAsiento(
          this.modalDinamicaContable,
          this.dinamicConfig
        );
      });
  }

  /****SECCION DINAMICAS CONTABLES***/
  listarDetalleDinamicas = (item) => {
    this.listToShowDetDn = [];
    
    this.comprobadorLlenado(item.CNUMCTA);
    this.accountingEntriesConfigService.listarDetalleDinamica(item).subscribe(
      (res) => {
        
        this.listToShowDetDn = res.Result.lista;
        this.arrayTabla.forEach((x, y) => {
          this.listToShowDetDn.forEach((e, i) => {
            if (x == e.DNV_CVALOR) {
              this.filtroDetalle.push({
                CVALOR: e.DNV_CVALOR,
                NCODEST: e.DNV_NCODEST,
                Visible: 'd-lg-table-row',
              });
              this.filtroEliminadoDetalle.push({
                CVALOR: e.DNV_CVALOR,
                NCODEST: e.DNV_NCODEST,
                Visible: 'd-lg-table-row',
              });
            }
          });
        });
        this.validacionDetalleDinamica();
      },
      (err) => {
        Swal.fire(
          'Información',
          'Ha ocurrido un error al obtener las configuraciones.',
          'error'
        );
      }
    );
  };

  soloNumeros(evt: any) {
    return evt.charCode >= 48 && evt.charCode <= 57;
  }
}
