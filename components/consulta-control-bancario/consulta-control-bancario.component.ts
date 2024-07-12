/*************************************************************************************************/
/*  NOMBRE              :   CONSULTA-CONTROL-BANCARIO.COMPONENT.TS                               */
/*  DESCRIPCIÓN         :   BROKER COMPONENTS                                                    */
/*  AUTOR               :   MATERIA GRIS - DIEGO ARMANDO GONZALES CHOCANO                        */
/*  FECHA               :   09-03-2023                                                           */
/*  VERSIÓN             :   1.0 - MEJORAS CONTABLES AUTOMÁTICAS                                  */
/*************************************************************************************************/

import { Component, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { BsDatepickerConfig } from 'ngx-bootstrap/datepicker';
import { InterfaceMonitoringCBCOService } from '../../../backoffice/services/interface-monitoring/interface-monitoring-cbco.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { GlobalValidators } from '../global-validators';
import { forkJoin } from "rxjs";
import { ActivatedRoute } from '@angular/router';
import moment from 'moment';
import Swal from 'sweetalert2';
import * as FileSaver from 'file-saver';

// CABECERA
export interface FiltroInterfaz {
    mvt_nnumori?: number;
}
export interface FiltroRamos {
  NNUMORI?: number;
  FLAG?: number;
}
export interface FiltroInterfaceCabeceraRecibo {
  NRECEIPT?: number;
}

// DETALLE PRELIMINAR
export interface FiltroInterfaceDetalle {
  NIDPROCESS?: number;
  NSTATUS?: string;
  NRECEIPT?: number;
  NTIPO?: number;

  SCODGRU_DES?: string;
  SBRANCH_DES?: string;
  
  NCODGRU?: number;
  NBRANCH?: number;
  NSTATUS_PROCESS?: number;
  JOB?: number;
}
export interface FiltroInterfaceDetalleXLSX {
  NIDPROCESS?: number;
  NSTATUS?: string;
  NRECEIPT?: number;
  NTIPO?: number;
}
export interface FiltroDetalleError {
  NIDPROCDET?: number;

  NRECEIPT?: string;
  PRODUCTO_DES?: string;
  NTYPE_DES?: string;
}

// DETALLE ASIENTOS
export interface FiltroInterfaceDetalleAsientosContables {
  NIDPROCESS?: number;
  NSTATUS?: string;

  SCODGRU_DES?: string;
  SBRANCH_DES?: string;
  
  NCODGRU?: number;
  NBRANCH?: number;
  NSTATUS_PROCESS?: number;
  JOB?: number;
}
export interface FiltroInterfaceDetalleAsientosContablesAsiento {
    NIDCBTMOVBCO?: number;

  SCONCEPTO?: string;
}
export interface FiltroInterfaceDetalleAsientosContablesError {
  NIDCBTMOVBCO?: number;

  SCONCEPTO?: string;  
}

// DETALLE EXACTUS
export interface FiltroInterfaceDetalleExactus {
  NIDPROCESS?: number;
  NSTATUS?: string;

  SCODGRU_DES?: string;
  SBRANCH_DES?: string;
  
  NCODGRU?: number;
  NBRANCH?: number;
  NSTATUS_PROCESS?: number;
  JOB?: number;
}
export interface FiltroInterfaceDetalleExactusAsiento {
  NNUMASI?: number;

  AST_CDESCRI?: string;
  MCT_CDESCRI?: string;
}
export interface FiltroInterfaceDetalleExactusError {
    NIDCBTMOVBCO?: number;

    SCONCEPTO?: string;  
}

// REPROCESOS
export interface InsertarReproceso {
  P_NIDPROCESS_ORI?: number;
  P_NIDPROCESS?: number;
  P_NNUMORI?: number;
  P_NCODGRU?: number;
  P_NBRANCH?: number;
  P_NSTATUS?: number;
  P_SPROCESS_TYPE?: string;
  P_SIDUSUREG?: string;
  P_LIST?: number[];
  P_JOB?: number;
}
// DETALLE OPERACIONES
export interface FiltroDetalleOperacion {
    NIDPROCDET?: number;
  
    NRECEIPT?: string;
    PRODUCTO_DES?: string;
    NTYPE_DES?: string;
}

@Component({
  selector: 'app-consulta-control-bancario',
  templateUrl: './consulta-control-bancario.component.html',
  styleUrls: ['./consulta-control-bancario.component.css']
})

export class ConsultaControlBancarioComponent implements OnInit {

  loading: boolean = true;
  loadingAsiento: boolean = true;
  loadingExactus: boolean = true;

  erroresMarcados: any = {};
  erroresMarcadosSend: any[] = [];
  masterSelected: boolean = false;
  masterSelectedBoolean: boolean = true;
  masterSelectedNumber: number = 1;

  erroresMarcadosAsientosContables: any = {};
  erroresMarcadosAsientosContablesSend: any[] = [];
  masterSelectedAsientosContables: boolean = false;
  masterSelectedAsientosContablesBoolean: boolean = true;
  masterSelectedAsientosContablesNumber: number = 1;

  erroresMarcadosExactus: any = {};
  erroresMarcadosExactusSend: any[] = [];
  masterSelectedExactus: boolean = false;
  masterSelectedExactusBoolean: boolean = true;
  masterSelectedExactusNumber: number = 1;

  processId: number = 0;
  reprocessId: number = 0;
  diaActual = moment(new Date()).toDate();
  bsConfig: Partial<BsDatepickerConfig>;
  submitted: boolean = false;
  filterForm: FormGroup;
  tipoBusqueda: string = "PÓLIZA";
  reciboGlobal: number;
  booleanRecibo: boolean = false;

  // CABECERA
  interfaces: any = [];
  filtroInterfaz: FiltroInterfaz;
  filtroRamos: FiltroRamos;
  filtroInterfaceCabeceraRecibo: FiltroInterfaceCabeceraRecibo;
  // DETALLE PRELIMINAR
  filtroInterfaceDetalle: FiltroInterfaceDetalle;
  filtroInterfaceDetalleXLSX: FiltroInterfaceDetalleXLSX;
  filtroDetalleError: FiltroDetalleError;
  // DETALLE ASIENTOS
  filtroInterfaceDetalleAsientosContables: FiltroInterfaceDetalleAsientosContables;
  filtroInterfaceDetalleAsientosContablesAsiento: FiltroInterfaceDetalleAsientosContablesAsiento;
  filtroInterfaceDetalleAsientosContablesError: FiltroInterfaceDetalleAsientosContablesError;
  // DETALLE EXACTUS
  filtroInterfaceDetalleExactus: FiltroInterfaceDetalleExactus;
  filtroInterfaceDetalleExactusAsiento: FiltroInterfaceDetalleExactusAsiento;
  filtroInterfaceDetalleExactusError: FiltroInterfaceDetalleExactusError;
  // REPROCESOS
  insertarReproceso: InsertarReproceso;

  // PARÁMETROS
  origen: any = [];
  ramos: any = [];
  estados: any = [];
  tipoBusquedas: any = [];
  // CABECERA
  cabeceraInterfaces: any = [];
  // DETALLE PRELIMINAR
  detalleInterfaces: any = [];
  detalleInterfacesXLSX: any = [];
  detalleErrores: any = [];
  detalleRecibos: any [];
  detalleOperAbono: any [];

  // DETALLE ASIENTOS
  detalleInterfacesAsientosContables: any = [];
  detalleInterfacesAsientosContablesAsiento: any = [];
  detalleInterfacesAsientosContablesErrores: any = [];
  // DETALLE EXACTUS
  detalleInterfacesExactus: any = [];
  detalleInterfacesExactusAsiento: any = [];
  detalleInterfacesExactusErrores: any = [];
  // DETALLE PLANILLA
  detalleInterfacesPlanilla: any = [];
  // DETALLE OPERACION 
  filtroDetalleOperacion: FiltroDetalleOperacion;



  // CABECERA
  listToShow: any = [];
  currentPage = 1;
  itemsPerPage = 15;
  totalItems = 0;
  maxSize = 10;

  // DETALLE PRELIMINAR
  listToShowDetail: any = [];
  currentPageDetail = 1;
  itemsPerPageDetail = 15;
  totalItemsDetail = 0;
  maxSizeDetail = 10;

  listToShowDetailError: any = [];
  currentPageDetailError = 1;
  itemsPerPageDetailError = 15;
  totalItemsDetailError = 0;
  maxSizeDetailError = 10;
  

  // DETALLE ASIENTOS
  listToShowDetailAsientosContables: any = [];
  currentPageDetailAsientosContables = 1;
  itemsPerPageDetailAsientosContables = 15;
  totalItemsDetailAsientosContables = 0;
  maxSizeDetailAsientosContables = 10;

  listToShowDetailAsientosContablesError: any = [];
  currentPageDetailAsientosContablesError = 1;
  itemsPerPageDetailAsientosContablesError = 15;
  totalItemsDetailAsientosContablesError = 0;
  maxSizeDetailAsientosContablesError = 10;

  listToShowDetailAsientosContablesAsiento: any = [];
  currentPageDetailAsientosContablesAsiento = 1;
  itemsPerPageDetailAsientosContablesAsiento = 15;
  totalItemsDetailAsientosContablesAsiento = 0;
  maxSizeDetailAsientosContablesAsiento = 10;

  // DETALLE EXACTUS
  listToShowDetailExactus: any = [];
  currentPageDetailExactus = 1;
  itemsPerPageDetailExactus = 15;
  totalItemsDetailExactus = 0;
  maxSizeDetailExactus = 10;

  listToShowDetailExactusError: any = [];
  currentPageDetailExactusError = 1;
  itemsPerPageDetailExactusError = 15;
  totalItemsDetailExactusError = 0;
  maxSizeDetailExactusError = 10;

  listToShowDetailExactusAsiento: any = [];
  currentPageDetailExactusAsiento = 1;
  itemsPerPageDetailExactusAsiento = 15;
  totalItemsDetailExactusAsiento = 0;
  maxSizeDetailExactusAsiento = 10;

  // DETALLE PLANILLA
  listToShowDetailPlanilla: any = [];
  currentPageDetailPlanilla = 1;
  itemsPerPageDetailPlanilla = 15;
  totalItemsDetailPlanilla = 0;
  maxSizeDetailPlanilla = 10;

  // DETALLE OPERACIONES
  detalleOperacion: any = [];
  detalleOperacionXLSX: any = [];
  listToShowDetailOperacion: any = [];
  currentPageDetailOperacion = 1;
  itemsPerPageDetailOperacion = 15;
  totalItemsDetailOperacion = 0;
  maxSizeDetailOperacion = 10;

  constructor(
      private formBuilder: FormBuilder,
      private modalService: NgbModal,
      private interfaceMonitoringCBCOService: InterfaceMonitoringCBCOService,
      private activatedRoute: ActivatedRoute
  ) {
      this.activatedRoute.params.subscribe(
          params => {
              let id: any = params['id'] || null;
              this.processId = id;
          }
      );
      this.bsConfig = Object.assign(
          {},
          {
              dateInputFormat: "DD/MM/YYYY",
              locale: "es",
              showWeekNumbers: false
          }
      );
  }

  ngOnInit(): void {
      this.diaActual = new Date(this.diaActual.getFullYear(), this.diaActual.getMonth(), this.diaActual.getDate());
      this.createForm();
      this.inicializarFiltros();
      this.getParams();      
      this.listarCabeceraInterfacesProceso();
      this.getCheckedItemListExactus();
      this.getCheckedItemListAsientosContables();
  }

  private createForm(): void {
      this.filterForm = this.formBuilder.group({
          NNUMORI: [1],
          NCODGRU: [19],
          NBRANCH: [0],
          NSTATUS_SEND: [null],
          DPROCESS_INI: [this.diaActual, [Validators.required, GlobalValidators.notValidDate, GlobalValidators.tooOldDateValidator]],
          DPROCESS_FIN: [this.diaActual, [Validators.required, GlobalValidators.notValidDate, GlobalValidators.tooOldDateValidator]],
          NIDPROCESS: ['', [Validators.pattern(/^[0-9]*$/)]],
          NRECEIPT: ['']
      });
  }

  inicializarFiltros = () => {
      this.filtroInterfaz = {};
      this.filtroRamos = {};
      this.filtroRamos.NNUMORI = 1;
      this.filtroRamos.FLAG = 0;
      this.listarRamos(this.filtroRamos);

      this.insertarReproceso = {};
      this.filtroInterfaceCabeceraRecibo = {};

      this.filtroInterfaceDetalle = {};
      this.filtroInterfaceDetalleXLSX = {};
      this.filtroDetalleError = {};

      this.filtroDetalleOperacion = {};

      this.filtroInterfaceDetalleAsientosContables = {};
      this.filtroInterfaceDetalleAsientosContablesAsiento = {};
      this.filtroInterfaceDetalleAsientosContablesError = {};

      this.filtroInterfaceDetalleExactus = {};
      this.filtroInterfaceDetalleExactusAsiento = {};
      this.filtroInterfaceDetalleExactusError = {};

      this.filtroInterfaz.mvt_nnumori = 1;      

      this.filterForm.setValidators([GlobalValidators.dateSortM]);
  }
  
  soloNumeros = (e) => {
      return e.charCode >= 48 && e.charCode <= 57;
  }

  // ERRORES MARCADOS ASIENTOS
  checkUncheckAllAsientosContables() {
      for (var i = 0; i < this.detalleInterfacesAsientosContables.length; i++) {
          if (this.detalleInterfacesAsientosContables[i].NSTATUS == 3)
              this.detalleInterfacesAsientosContables[i].IS_SELECTED = this.masterSelectedAsientosContables;
      }
      this.getCheckedItemListAsientosContables();
  }
  isAllSelectedAsientosContables() {
      this.masterSelectedAsientosContables = this.detalleInterfacesAsientosContables.every(
          function (item: any) {
              return item.IS_SELECTED == true;
          }
      )
      this.getCheckedItemListAsientosContables();
  }
  getCheckedItemListAsientosContables() {
      this.erroresMarcadosAsientosContables = [];
      this.erroresMarcadosAsientosContablesSend = [];
      for (var i = 0; i < this.detalleInterfacesAsientosContables.length; i++) {
          if (this.detalleInterfacesAsientosContables[i].IS_SELECTED)
              this.erroresMarcadosAsientosContables.push(this.detalleInterfacesAsientosContables[i].NIDMOVBCO);
      }
      this.erroresMarcadosAsientosContablesSend.push(this.erroresMarcadosAsientosContables);
  }

  // ERRORES MARCADOS EXACTUS
  checkUncheckAllExactus() {
      for (var i = 0; i < this.detalleInterfacesExactus.length; i++) {
          if (this.detalleInterfacesExactus[i].NSTATUS_SEND == 3)
              this.detalleInterfacesExactus[i].IS_SELECTED = this.masterSelectedExactus;
      }
      this.getCheckedItemListExactus();
  }
  isAllSelectedExactus() {
      this.masterSelectedExactus = this.detalleInterfacesExactus.every(
          function (item: any) {
              return item.IS_SELECTED == true;
          }
      )
      this.getCheckedItemListExactus();
  }
  getCheckedItemListExactus() {
      this.erroresMarcadosExactus = [];
      this.erroresMarcadosExactusSend = [];
      for (var i = 0; i < this.detalleInterfacesExactus.length; i++) {
          if (this.detalleInterfacesExactus[i].IS_SELECTED)
              this.erroresMarcadosExactus.push(this.detalleInterfacesExactus[i].NIDMOVBCO);
      }
      this.erroresMarcadosExactusSend.push(this.erroresMarcadosExactus);
  }

  // PAGINADO CABECERA 
  pageChanged(currentPage) {
      this.currentPage = currentPage;
      this.listToShow = this.cabeceraInterfaces.slice(
          (this.currentPage - 1) * this.itemsPerPage,
          this.currentPage * this.itemsPerPage
      );
  }

  // PAGINADO DETALLE PRELIMINAR
  pageChangedDetail(currentPageDetail) {
      this.currentPageDetail = currentPageDetail;
      this.listToShowDetail = this.detalleInterfaces.slice(
          (this.currentPageDetail - 1) * this.itemsPerPageDetail,
          this.currentPageDetail * this.itemsPerPageDetail
      );
  }
  pageChangedDetailError(currentPageDetailError) {
      this.currentPageDetailError = currentPageDetailError;
      this.listToShowDetailError = this.detalleErrores.slice(
          (this.currentPageDetailError - 1) * this.itemsPerPageDetailError,
          this.currentPageDetailError * this.itemsPerPageDetailError
      );
  }

  //PAGINADO DETALLE ASIENTOS
  pageChangedDetailAsientosContables(currentPageDetailAsientosContables) {
      this.currentPageDetailAsientosContables = currentPageDetailAsientosContables;
      this.listToShowDetailAsientosContables = this.detalleInterfacesAsientosContables.slice(
          (this.currentPageDetailAsientosContables - 1) * this.itemsPerPageDetailAsientosContables,
          this.currentPageDetailAsientosContables * this.itemsPerPageDetailAsientosContables
      );
  }
  pageChangedDetailAsientosContablesError(currentPageDetailAsientosContablesError) {
      this.currentPageDetailAsientosContablesError = currentPageDetailAsientosContablesError;
      this.listToShowDetailAsientosContablesError = this.detalleInterfacesAsientosContablesErrores.slice(
          (this.currentPageDetailAsientosContablesError - 1) * this.itemsPerPageDetailAsientosContablesError,
          this.currentPageDetailAsientosContablesError * this.itemsPerPageDetailAsientosContablesError
      );
  }
  pageChangedDetailAsientosContablesAsiento(currentPageDetailAsientosContablesAsiento) {
      this.currentPageDetailAsientosContablesAsiento = currentPageDetailAsientosContablesAsiento;
      this.listToShowDetailAsientosContablesAsiento = this.detalleInterfacesAsientosContablesAsiento.slice(
          (this.currentPageDetailAsientosContablesAsiento - 1) * this.itemsPerPageDetailAsientosContablesAsiento,
          this.currentPageDetailAsientosContablesAsiento * this.itemsPerPageDetailAsientosContablesAsiento
      );
  }

  // PAGINADO DETALLE EXACTUS
  pageChangedDetailExactus(currentPageDetailExactus) {
      this.currentPageDetailExactus = currentPageDetailExactus;
      this.listToShowDetailExactus = this.detalleInterfacesExactus.slice(
          (this.currentPageDetailExactus - 1) * this.itemsPerPageDetailExactus,
          this.currentPageDetailExactus * this.itemsPerPageDetailExactus
      );
  }
  pageChangedDetailExactusError(currentPageDetailExactusError) {
      this.currentPageDetailExactusError = currentPageDetailExactusError;
      this.listToShowDetailExactusError = this.detalleInterfacesExactusErrores.slice(
          (this.currentPageDetailExactusError - 1) * this.itemsPerPageDetailExactusError,
          this.currentPageDetailExactusError * this.itemsPerPageDetailExactusError
      );
  }
  pageChangedDetailExactusAsiento(currentPageDetailExactusAsiento) {
      this.currentPageDetailExactusAsiento = currentPageDetailExactusAsiento;
      this.listToShowDetailExactusAsiento = this.detalleInterfacesExactusAsiento.slice(
          (this.currentPageDetailExactusAsiento - 1) * this.itemsPerPageDetailExactusAsiento,
          this.currentPageDetailExactusAsiento * this.itemsPerPageDetailExactusAsiento
      );
  }

  // PAGINADO DETALLE EXACTUS
  pageChangedDetailPlanilla(currentPageDetailPlanilla) {
      this.currentPageDetailPlanilla = currentPageDetailPlanilla;
      this.listToShowDetailPlanilla = this.detalleInterfacesPlanilla.slice(
          (this.currentPageDetailPlanilla - 1) * this.itemsPerPageDetailPlanilla,
          this.currentPageDetailPlanilla * this.itemsPerPageDetailPlanilla
      );
  }

  // PARÁMETROS
  getParams = () => {
      let $origen = this.interfaceMonitoringCBCOService.listarOrigen();
      //let $ramos = this.interfaceMonitoringCBCOService.listarRamos(this.filtroRamos);
      let $estados = this.interfaceMonitoringCBCOService.listarEstados();
      let $tipoBusquedas = this.interfaceMonitoringCBCOService.listarTipoBusqueda();
      return forkJoin([$origen, $estados, $tipoBusquedas]).subscribe(
      //return forkJoin([$origen, $ramos, $estados, $tipoBusquedas]).subscribe(
          res => {
              this.origen = res[0].Result.combos;
              //this.ramos = res[1].Result.combos;
              this.estados = res[1].Result.combos;
              this.tipoBusquedas = res[2].Result.combos;
          },
          err => { Swal.fire('Información', 'Ha ocurrido un error al obtener los parámetros.', 'error'); }
      )
  }
  buscarDetallePreliminarPorRecibo(item) {
      this.filtroInterfaceDetalle.NRECEIPT = item;
      if (this.filtroInterfaceDetalle.NRECEIPT >= 0 || this.filtroInterfaceDetalle.NRECEIPT == null) {
          this.listarDetalleInterfaces(this.filtroInterfaceDetalle)
      } else {
          this.filtroInterfaceCabeceraRecibo.NRECEIPT = null;
          Swal.fire('Información', 'Ingrese un número de póliza/recibo válido.', 'info');
      }
  }  

  seleccionarOrigen = (e) => {
      this.filtroInterfaz.mvt_nnumori = e;   
      this.filtroRamos.NNUMORI = e;
      this.listarRamos(this.filtroRamos);
      this.filterForm.controls.NBRANCH.setValue(0);
  }
  listarRamos = (filtro) => {
      this.interfaceMonitoringCBCOService.listarRamos(filtro).subscribe(
          res => {
              this.ramos = res.Result.combos;
          },
          err => { Swal.fire('Información', 'Ha ocurrido un error al obtener los ramos.', 'error'); }
      )
  }   
  
  // FILTRAR DETALLES POR ESTADO
  seleccionarEstadoDetalle = (e) => {
      this.loading = false;
      this.filtroInterfaceDetalle.NSTATUS = e;
      this.filtroInterfaceDetalle.NRECEIPT = null;
      this.filtroInterfaceCabeceraRecibo.NRECEIPT = null;
      this.listarDetalleInterfaces(this.filtroInterfaceDetalle);
  }
  seleccionarEstadoDetalleAsientosContables = (e) => {
      this.loadingAsiento = false;
      this.filtroInterfaceDetalleAsientosContables.NSTATUS = e;
      this.listarDetalleInterfacesAsientosContables(this.filtroInterfaceDetalleAsientosContables);
  }
  seleccionarEstadoDetalleExactus = (e) => {
      this.loadingExactus = false;
      this.filtroInterfaceDetalleExactus.NSTATUS = e;
      this.listarDetalleInterfacesExactus(this.filtroInterfaceDetalleExactus);
  }

  // CABECERA
  listarCabeceraInterfaces(): void {
      this.submitted = true;
      this.reciboGlobal = null;
      if (this.filterForm.valid) {
          this.filterForm.controls.NRECEIPT.setValue('');
          if (this.processId) {
              this.filterForm.controls.NIDPROCESS.setValue(this.processId);
          }
          this.interfaceMonitoringCBCOService.listarCabeceraInterfaces(this.filterForm.value).subscribe(
              res => {
                  this.booleanRecibo = false;
                  this.currentPage = 1;
                  this.cabeceraInterfaces = res.Result.lista;
                  this.totalItems = this.cabeceraInterfaces.length;
                  this.listToShow = this.cabeceraInterfaces.slice(
                      (this.currentPage - 1) * this.itemsPerPage,
                      this.currentPage * this.itemsPerPage
                  );
                  if (this.cabeceraInterfaces.length == 0) {
                      Swal.fire('Información', 'No se encontraron coincidencias en la búsqueda.', 'warning');
                  }
              },
              err => { Swal.fire('Información', 'Ha ocurrido un error al obtener la Cabecera de Interfaz.', 'error'); }
          )
      }
  }
  listarCabeceraInterfacesProceso(): void {
      if (this.processId) {
          this.filterForm.controls.NIDPROCESS.setValue(this.processId);
          this.listarCabeceraInterfaces();
      }
  }
  listarCabeceraInterfacesRecibo(): void {
      this.submitted = true;
      if (this.filterForm.get('NRECEIPT').value > 0) {
          this.filterForm.controls.NIDPROCESS.setValue('');
          this.filtroInterfaceCabeceraRecibo.NRECEIPT = this.filterForm.get('NRECEIPT').value;
          this.reciboGlobal = this.filtroInterfaceCabeceraRecibo.NRECEIPT;
          this.interfaceMonitoringCBCOService.listarCabeceraInterfacesRecibo(this.filtroInterfaceCabeceraRecibo).subscribe(
              res => {
                  this.booleanRecibo = true;
                  this.currentPage = 1;
                  this.cabeceraInterfaces = res.Result.lista;
                  this.totalItems = this.cabeceraInterfaces.length;
                  this.listToShow = this.cabeceraInterfaces.slice(
                      (this.currentPage - 1) * this.itemsPerPage,
                      this.currentPage * this.itemsPerPage
                  );
                  if (this.cabeceraInterfaces.length == 0) {
                      Swal.fire('Información', 'No se encontraron coincidencias en la búsqueda.', 'warning');
                  }
              },
              err => { Swal.fire('Información', 'Ha ocurrido un error al obtener la cabecera de interfaz por recibo.', 'error'); }
          )
      } else {
          this.filterForm.controls.NRECEIPT.setValue(null)
          Swal.fire('Información', 'Ingrese un número de recibo válido.', 'info');
      }
  }

  // DETALLE PRELIMINAR
  listarDetalleInterfaces(item): void {
      this.loading = false;
      this.interfaceMonitoringCBCOService.listarDetalleInterfaces(item).subscribe(
          res => {
              this.currentPageDetail = 1;
              this.detalleInterfaces = res.Result.lista;
              this.totalItemsDetail = this.detalleInterfaces.length;
              this.listToShowDetail = this.detalleInterfaces.slice(
                  (this.currentPageDetail - 1) * this.itemsPerPageDetail,
                  this.currentPageDetail * this.itemsPerPageDetail
              );
              this.loading = true;
              for (var i = 0; i < this.detalleInterfaces.length; i++) {
                  if (this.detalleInterfaces[i].NSTATUS == 3) {
                      this.masterSelectedNumber = 1;
                  }
              }
              if (this.masterSelectedNumber == 1) {
                  this.masterSelectedBoolean = false;
              } else {
                  this.masterSelectedBoolean = true;
              }
          },
          err => { Swal.fire('Información', 'Ha ocurrido un error al obtener los detalles de interfaz preliminar.', 'error'); }
      )
  }
  listarErroresDetalle(item): void {
      this.interfaceMonitoringCBCOService.listarErroresDetalle(item).subscribe(
          res => {
              this.currentPageDetailError = 1;
              this.detalleErrores = res.Result.lista;
              this.totalItemsDetailError = this.detalleErrores.length;
              this.listToShowDetailError = this.detalleErrores.slice(
                  (this.currentPageDetailError - 1) * this.itemsPerPageDetailError,
                  this.currentPageDetailError * this.itemsPerPageDetailError
              );
          },
          err => { Swal.fire('Información', 'Ha ocurrido un error al obtener los errores de interfaz preliminar.', 'error'); }
      )
  }

  // DETALLE ASIENTOS
  listarDetalleInterfacesAsientosContables(item): void {
      this.loadingAsiento = false;
      this.interfaceMonitoringCBCOService.listarDetalleInterfacesAsientosContables(item).subscribe(
          res => {
              this.currentPageDetailAsientosContables = 1;
              this.detalleInterfacesAsientosContables = res.Result.lista;
              this.totalItemsDetailAsientosContables = this.detalleInterfacesAsientosContables.length;
              this.listToShowDetailAsientosContables = this.detalleInterfacesAsientosContables.slice(
                  (this.currentPageDetailAsientosContables - 1) * this.itemsPerPageDetailAsientosContables,
                  this.currentPageDetailAsientosContables * this.itemsPerPageDetailAsientosContables
              );
              this.loadingAsiento = true;
              for (var i = 0; i < this.detalleInterfacesAsientosContables.length; i++) {
                  if (this.detalleInterfacesAsientosContables[i].NSTATUS == 3) {
                      this.masterSelectedAsientosContablesNumber = 1;
                  }
              }
              if (this.masterSelectedAsientosContablesNumber == 1) {
                  this.masterSelectedAsientosContablesBoolean = false;
              } else {
                  this.masterSelectedAsientosContablesBoolean = true;
              }
          },
          err => { Swal.fire('Información', 'Ha ocurrido un error al obtener los detalles de interfaz asientos.', 'error'); }
      )
  }
  listarDetalleInterfacesAsientosContablesError(item): void {
      this.interfaceMonitoringCBCOService.listarDetalleInterfacesAsientosContablesError(item).subscribe(
          res => {
              this.currentPageDetailAsientosContablesError = 1;
              this.detalleInterfacesAsientosContablesErrores = res.Result.lista;
              this.totalItemsDetailAsientosContablesError = this.detalleInterfacesAsientosContablesErrores.length;
              this.listToShowDetailAsientosContablesError = this.detalleInterfacesAsientosContablesErrores.slice(
                  (this.currentPageDetailAsientosContablesError - 1) * this.itemsPerPageDetailAsientosContablesError,
                  this.currentPageDetailAsientosContablesError * this.itemsPerPageDetailAsientosContablesError
              );
          },
          err => { Swal.fire('Información', 'Ha ocurrido un error al obtener los errores de interfaz asientos.', 'error'); }
      )
  }
  listarDetalleInterfacesAsientosContablesAsiento(item): void {
      this.interfaceMonitoringCBCOService.listarDetalleInterfacesAsientosContablesAsiento(item).subscribe(
          res => {
              this.currentPageDetailAsientosContablesAsiento = 1;
              this.detalleInterfacesAsientosContablesAsiento = res.Result.lista;
              this.totalItemsDetailAsientosContablesAsiento = this.detalleInterfacesAsientosContablesAsiento.length;
              this.listToShowDetailAsientosContablesAsiento = this.detalleInterfacesAsientosContablesAsiento.slice(
                  (this.currentPageDetailAsientosContablesAsiento - 1) * this.itemsPerPageDetailAsientosContablesAsiento,
                  this.currentPageDetailAsientosContablesAsiento * this.itemsPerPageDetailAsientosContablesAsiento
              );
          },
          err => { Swal.fire('Información', 'Ha ocurrido un error al obtener los asientos de interfaz asientos.', 'error'); }
      )
  }

  // DETALLE EXACTUS
  listarDetalleInterfacesExactus(item): void {
      this.loadingExactus = false;
      this.interfaceMonitoringCBCOService.listarDetalleInterfacesExactus(item).subscribe(
          res => {
              this.currentPageDetailExactus = 1;
              this.detalleInterfacesExactus = res.Result.lista;
              this.totalItemsDetailExactus = this.detalleInterfacesExactus.length;
              this.listToShowDetailExactus = this.detalleInterfacesExactus.slice(
                  (this.currentPageDetailExactus - 1) * this.itemsPerPageDetailExactus,
                  this.currentPageDetailExactus * this.itemsPerPageDetailExactus
              );
              this.loadingExactus = true;
              for (var i = 0; i < this.detalleInterfacesExactus.length; i++) {
                  if (this.detalleInterfacesExactus[i].NSTATUS_SEND == 3) {
                      this.masterSelectedExactusNumber = 1;
                  }
              }
              if (this.masterSelectedExactusNumber == 1) {
                  this.masterSelectedExactusBoolean = false;
              } else {
                  this.masterSelectedExactusBoolean = true;
              }
          },
          err => { Swal.fire('Información', 'Ha ocurrido un error al obtener los detalles de interfaz Exactus.', 'error'); }
      )
  }
  listarDetalleInterfacesExactusError(item): void {
      this.interfaceMonitoringCBCOService.listarDetalleInterfacesExactusError(item).subscribe(
          res => {
              this.currentPageDetailExactusError = 1;
              this.detalleInterfacesExactusErrores = res.Result.lista;
              this.totalItemsDetailExactusError = this.detalleInterfacesExactusErrores.length;
              this.listToShowDetailExactusError = this.detalleInterfacesExactusErrores.slice(
                  (this.currentPageDetailExactusError - 1) * this.itemsPerPageDetailExactusError,
                  this.currentPageDetailExactusError * this.itemsPerPageDetailExactusError
              );
          },
          err => { Swal.fire('Información', 'Ha ocurrido un error al obtener los errores de interfaz Exactus.', 'error'); }
      )
  }



  // DETALLE PRELIMINAR
  mostrarModalPreliminar(content: any, item) {
      if (item.NSTATUS !== 0) {
          this.masterSelected = false;
          this.erroresMarcadosSend[0] = 0;
          this.modalService.open(content, { backdrop: 'static', size: 'xl', keyboard: false, centered: true });
          this.filtroInterfaceCabeceraRecibo.NRECEIPT = this.reciboGlobal;
          this.filtroInterfaceDetalle.NIDPROCESS = item.NIDPROCESS;
          this.filtroInterfaceDetalle.NSTATUS = null;
          this.filtroInterfaceDetalle.NRECEIPT = this.filtroInterfaceCabeceraRecibo.NRECEIPT;
          if (this.booleanRecibo == true) {
              this.filtroInterfaceDetalle.NTIPO = 2;
              this.tipoBusqueda = "RECIBO"
          } else {
              this.filtroInterfaceDetalle.NTIPO = 1;
              this.tipoBusqueda = "PÓLIZA"
          }
        
          this.filtroInterfaceDetalle.SCODGRU_DES = item.SCODGRU_DES;
          this.filtroInterfaceDetalle.SBRANCH_DES = item.SBRANCH_DES;
          
          this.filtroInterfaceDetalle.NCODGRU = item.NCODGRU;
          this.filtroInterfaceDetalle.NBRANCH = item.NBRANCH;
          this.filtroInterfaceDetalle.NSTATUS_PROCESS = item.NSTATUS;
          this.filtroInterfaceDetalle.JOB = item.ID_JOB;
          this.masterSelectedNumber = 0;
          this.listarDetalleInterfaces(this.filtroInterfaceDetalle);
      } else { return }
  }
  mostrarModalPreliminarError(content: any, item) {
      if (item.ERROR) {
          this.modalService.open(content, { backdrop: 'static', size: 'xl', keyboard: false, centered: true });
          this.filtroDetalleError.NIDPROCDET = item.NIDPROCDET;
        
          this.filtroDetalleError.NRECEIPT = item.NRECEIPT;
          this.filtroDetalleError.PRODUCTO_DES = item.PRODUCTO_DES;
          this.filtroDetalleError.NTYPE_DES = item.NTYPE_DES;
          this.listarErroresDetalle(this.filtroDetalleError);
      } else { return }
  }

  // DETALLE ASIENTOS
  mostrarModalAsientosContables(content: any, item) {
      if (item.NSTATUS_CBCO !== 0) {
          this.masterSelectedAsientosContables = false;
          this.erroresMarcadosAsientosContablesSend[0] = 0;
          this.modalService.open(content, { backdrop: 'static', size: 'xl', keyboard: false, centered: true });
          this.filtroInterfaceDetalleAsientosContables.NIDPROCESS = item.NIDPROCESS;
          this.filtroInterfaceDetalleAsientosContables.NSTATUS = null;
        
          this.filtroInterfaceDetalleAsientosContables.SCODGRU_DES = item.SCODGRU_DES;
          this.filtroInterfaceDetalleAsientosContables.SBRANCH_DES = item.SBRANCH_DES;
          
          this.filtroInterfaceDetalleAsientosContables.NCODGRU = item.NCODGRU;
          this.filtroInterfaceDetalleAsientosContables.NBRANCH = item.NBRANCH;
          this.filtroInterfaceDetalleAsientosContables.NSTATUS_PROCESS = item.NSTATUS_SEND;
          this.filtroInterfaceDetalleAsientosContables.JOB = item.ID_JOB;
          this.masterSelectedAsientosContablesNumber = 0;
          this.listarDetalleInterfacesAsientosContables(this.filtroInterfaceDetalleAsientosContables);
      } else { return }
  }
  mostrarModalAsientosContablesError(content: any, item) {
      if (item.DETALLE_ERROR) {
          this.modalService.open(content, { backdrop: 'static', size: 'xl', keyboard: false, centered: true });
          this.filtroInterfaceDetalleAsientosContablesError.NIDCBTMOVBCO = item.NIDMOVBCO;
        
          this.filtroInterfaceDetalleAsientosContablesError.SCONCEPTO = item.SCONCEPTO;        
          this.listarDetalleInterfacesAsientosContablesError(this.filtroInterfaceDetalleAsientosContablesError);
      } else { return }
  }
  mostrarModalAsientosContablesAsiento(content: any, item) {
      if (item.DETALLE_ASIENTO) {
          this.modalService.open(content, { backdrop: 'static', size: 'xl', keyboard: false, centered: true });
          this.filtroInterfaceDetalleAsientosContablesAsiento.NIDCBTMOVBCO = item.NIDMOVBCO;
        
          this.filtroInterfaceDetalleAsientosContablesAsiento.SCONCEPTO = item.SCONCEPTO;
          this.listarDetalleInterfacesAsientosContablesAsiento(this.filtroInterfaceDetalleAsientosContablesAsiento);
      } else { return }
  }

  // DETALLE EXACTUS
  mostrarModalExactus(content: any, item) {
      if (item.NSTATUS_SEND !== 0) {
          this.masterSelectedExactus = false;
          this.erroresMarcadosExactusSend[0] = 0;
          this.modalService.open(content, { backdrop: 'static', size: 'xl', keyboard: false, centered: true });
          this.filtroInterfaceDetalleExactus.NIDPROCESS = item.NIDPROCESS;
          this.filtroInterfaceDetalleExactus.NSTATUS = null;
        
          this.filtroInterfaceDetalleExactus.SCODGRU_DES = item.SCODGRU_DES;
          this.filtroInterfaceDetalleExactus.SBRANCH_DES = item.SBRANCH_DES;
          
          this.filtroInterfaceDetalleExactus.NCODGRU = item.NCODGRU;
          this.filtroInterfaceDetalleExactus.NBRANCH = item.NBRANCH;
          this.filtroInterfaceDetalleExactus.NSTATUS_PROCESS = item.NSTATUS_SEND;
          this.filtroInterfaceDetalleExactus.JOB = item.ID_JOB;
          this.masterSelectedExactusNumber = 0;
          this.listarDetalleInterfacesExactus(this.filtroInterfaceDetalleExactus);
      } else { return }
  }
  mostrarModalExactusError(content: any, item) {
      if (item.DETALLE_ERROR) {
          this.modalService.open(content, { backdrop: 'static', size: 'xl', keyboard: false, centered: true });
          this.filtroInterfaceDetalleExactusError.NIDCBTMOVBCO = item.NIDMOVBCO;
                  
          this.filtroInterfaceDetalleExactusError.SCONCEPTO = item.SCONCEPTO;
          this.listarDetalleInterfacesExactusError(this.filtroInterfaceDetalleExactusError);
      } else { return }
  }

  // REPORTES
  getReportFilters = () => {
      this.filtroInterfaceDetalleXLSX.NIDPROCESS = this.filtroInterfaceDetalle.NIDPROCESS;
      this.filtroInterfaceDetalleXLSX.NSTATUS = this.filtroInterfaceDetalle.NSTATUS;
      this.filtroInterfaceDetalleXLSX.NRECEIPT = this.filtroInterfaceDetalle.NRECEIPT;
      this.filtroInterfaceDetalleXLSX.NTIPO = this.filtroInterfaceDetalle.NTIPO;
      this.reporteDetalleInterfacesXLSX_CB(this.filtroInterfaceDetalleXLSX);
  }

  // REPROCESO EXACTUS
  insertarNuevoReprocesoAsi = () => {
    if (this.erroresMarcadosExactusSend[0].length >= 1) {
      this.insertarReproceso.P_NNUMORI = this.filterForm.get('NNUMORI').value;
      this.insertarReproceso.P_NIDPROCESS_ORI = this.filtroInterfaceDetalleExactus.NIDPROCESS;
      this.insertarReproceso.P_NIDPROCESS = null;
      this.insertarReproceso.P_NCODGRU = this.filtroInterfaceDetalleExactus.NCODGRU;
      this.insertarReproceso.P_NBRANCH = this.filtroInterfaceDetalleExactus.NBRANCH;
      this.insertarReproceso.P_NSTATUS = 1;
      this.insertarReproceso.P_SPROCESS_TYPE = "E";
      this.insertarReproceso.P_LIST = this.erroresMarcadosExactusSend[0];
      this.insertarReproceso.P_JOB = this.filtroInterfaceDetalleExactus.JOB;
      this.insertarReproceso.P_SIDUSUREG = JSON.parse(localStorage.getItem('currentUser')).username
      this.interfaceMonitoringCBCOService.insertarReprocesoAsi(this.insertarReproceso).subscribe(
        res => {
          Swal.fire('Información', 'El reproceso de asientos tardará unos segundos, actualice la página o realice nuevamente la búsqueda para visualizar el resultado.', 'success');
          this.listarCabeceraInterfaces();
        },
        err => { Swal.fire('Información', 'Ha ocurrido un error al reprocesar los asientos.', 'error'); }
      );
      this.modalService.dismissAll();
    } else {
      Swal.fire('Información', 'Seleccione al menos un error para reprocesar.', 'info');
    }
  }

  // REPROCESO ASIENTOS
  insertarNuevoReprocesoAsiInter = () => {
    if (this.erroresMarcadosAsientosContablesSend[0].length >= 1) {
      this.insertarReproceso.P_NNUMORI = this.filterForm.get('NNUMORI').value;
      this.insertarReproceso.P_NIDPROCESS_ORI = this.filtroInterfaceDetalleAsientosContables.NIDPROCESS;
      this.insertarReproceso.P_NIDPROCESS = null;
      this.insertarReproceso.P_NCODGRU = this.filtroInterfaceDetalleAsientosContables.NCODGRU;
      this.insertarReproceso.P_NBRANCH = this.filtroInterfaceDetalleAsientosContables.NBRANCH;
      this.insertarReproceso.P_NSTATUS = 1;
      this.insertarReproceso.P_SPROCESS_TYPE = "A";
      this.insertarReproceso.P_LIST = this.erroresMarcadosAsientosContablesSend[0];
      this.insertarReproceso.P_JOB = this.filtroInterfaceDetalleAsientosContables.JOB;
      this.insertarReproceso.P_SIDUSUREG = JSON.parse(localStorage.getItem('currentUser')).username
      this.interfaceMonitoringCBCOService.insertarReprocesoAsi(this.insertarReproceso).subscribe(
        res => {
          Swal.fire('Información', 'El reproceso de asientos tardará unos segundos, actualice la página o realice nuevamente la búsqueda para visualizar el resultado.', 'success');
          this.listarCabeceraInterfaces();
        },
        err => { Swal.fire('Información', 'Ha ocurrido un error al reprocesar los asientos.', 'error'); }
      );
        this.modalService.dismissAll();
    } else {
      Swal.fire('Información', 'Seleccione al menos un error para reprocesar.', 'info');
    }
  }

  // TIPO DE BÚSQUEDA
  seleccionarTipoBusqueda = (e) => {
    this.filtroInterfaceCabeceraRecibo.NRECEIPT = null;
    if (e == 1) {
      this.tipoBusqueda = "PÓLIZA"
    }
    if (e == 2) {
      this.tipoBusqueda = "RECIBO"
    }
  }

  // LISTAR DETALLE DE OPERACIONES
  mostrarModalPreliminarOperaciones(content: any, item) {
    if (item.OPERACION) {
        this.modalService.open(content, { backdrop: 'static', size: 'xl', keyboard: false, centered: true });
        this.filtroDetalleOperacion.NIDPROCDET = item.NIDPROCDET;
      
        this.filtroDetalleOperacion.NRECEIPT = item.NRECEIPT;
        this.filtroDetalleOperacion.PRODUCTO_DES = item.PRODUCTO_DES;
        this.filtroDetalleOperacion.NTYPE_DES = item.NTYPE_DES;
        this.listarDetalleOperacion(this.filtroDetalleOperacion);
    } else { return }
}
listarDetalleOperacion(item): void {
    this.interfaceMonitoringCBCOService.listarDetalleOperacion(item).subscribe(
        res => {
            this.currentPageDetailOperacion = 1;
            this.detalleOperacion = res.Result.lista;
            this.totalItemsDetailOperacion = this.detalleOperacion.length;
            this.listToShowDetailOperacion = this.detalleOperacion.slice(
                (this.currentPageDetailOperacion - 1) * this.itemsPerPageDetailOperacion,
                this.currentPageDetailOperacion * this.itemsPerPageDetailOperacion
            );
        },
        err => { Swal.fire('Información', 'Ha ocurrido un error al obtener el detalle de las operaciones bancarias.', 'error'); }
    )
}

reporteDetalleInterfacesXLSX_CB(item): void {        
    this.interfaceMonitoringCBCOService.listarDetalleInterfacesXLSX_CB(item).subscribe(                  
        res => {         
            let _data = res;
            if (_data.response == 0) {
                if (_data.Data != null) {
                const file = new File([this.obtenerBlobFromBase64(_data.Data, '')],
                'Reporte_Detalle_PreliminarCB - ' + this.filtroInterfaceDetalle.NIDPROCESS +'.xlsx', { type: 'text/xls' });
                FileSaver.saveAs(file);  
                }                                    
            }                
        },
        err => { Swal.fire('Información', 'Ha ocurrido un error al obtener el reporte con los detalles de interfaz preliminar.', 'error'); }            
    )
}

obtenerBlobFromBase64(b64Data: string, contentType: string) {
    const byteCharacters = atob(b64Data);
    const byteArrays = [];
    for (let offset = 0; offset < byteCharacters.length; offset += 512) {
        const slice = byteCharacters.slice(offset, offset + 512);
        
        const byteNumbers = new Array(slice.length);            
        for (let i = 0; i < slice.length; i++) {
            byteNumbers[i] = slice.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        byteArrays.push(byteArray);
    }
    const blob = new Blob(byteArrays, { type: contentType });
    return blob;
}


}