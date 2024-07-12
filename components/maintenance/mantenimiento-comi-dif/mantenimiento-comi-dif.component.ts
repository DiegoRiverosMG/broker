import { Component, OnInit, Injectable, Type } from '@angular/core';
import { BsDatepickerConfig } from 'ngx-bootstrap/datepicker';
import swal from 'sweetalert2';

import { NgbModal, ModalDismissReasons, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { AtpReportService } from '../../../services/atp-reports/atp-report.service';
import { ComisionesDiferenciadasService } from '../../../services/maintenance/comisiones-diferenciadas/comisiones-diferenciadas.service';
import { LoadMassiveService } from '../../../services/LoadMassive/load-massive.service';
import { MantenimientoComiDifModalConfigComponent} from './modal-config/modal-config.component'
import { isNull } from '@angular/compiler/src/output/output_ast';
import { error } from 'console';

@Component({
    selector: 'app-mantenimiento-comi-dif',
    templateUrl: './mantenimiento-comi-dif.component.html',
    styleUrls: ['./mantenimiento-comi-dif.component.css']
})
export class MantenimientoComiDifComponent implements OnInit {
    comisionesDiferenciadasPolizaResults: any[] = [];
    comisionesDiferenciadasResults: any[] = [];
    comisionesDiferenciadasResultsHeader: any[] = [];

    ntipoPol:number;
    ngrupoPol:number;

    mensaje:string="Proceso Exitoso";
    hayNMODULO:boolean;
    hayDINIVIG:boolean;
    hayDFINVIG:boolean;
    haySESTADO:boolean;
    
    hayNINIVIG:boolean;
    hayNFINVIG:boolean;
    hayNTASACLIENTE:boolean;
    hayNTASACOMPANIA:boolean;
    hayNMINCREDITO:boolean;
    hayNMAXCREDITO:boolean;
    hayNPORCENTAJECANAL:boolean;
    hayNPORCENTAJEBROKER:boolean;
    hayNMONTOCANAL:boolean;
    hayNMONTOBROKER:boolean;
    hayNAGE_MIN:boolean;
    hayNAGE_MAX:boolean;
    hayNANIOINI:boolean;
    hayNANIOFIN:boolean;
    hayNSUMAASEG:boolean;
    hayNEDADMIN:boolean;
    hayNEDADMAX:boolean;
    hayNROL:boolean;


    reporteProvicomisionesResults: any[] = [];
    listToShow: any = [];
    //CheckBox
    UnselectedItemMessage: any = '';
    StartDateSelected: any = '';
    NBranchSelected: any = '';
    EndDateSelected: any = '';
    branchTypeList: any[] = [];
    idRamo: number;
    idProducto: any = '';
    branch: any = '';
    listProduct: any = [];
    listRamo: any = [];
    NPOLIZA: number;

    SelectedBranchId:any = '-';
    SelectedProductoId:any = '-';

    isError: boolean = false;
    bhabilitar: boolean;
    //Pantalla de carga
    isLoading: boolean = false;
    //Fechas
    bsConfig: Partial<BsDatepickerConfig>;
    bsValueIni: Date = new Date();
    bsValueFin: Date = new Date();
    bsValueFinMax: Date = new Date();
    // data: ReportAtpSearch = new ReportAtpSearch();

    public maxSize = 5; // cantidad de paginas que se mostrarán en el html del paginado
    public totalItems = 0; //total de items encontrados
    public foundResults: any = [];  //Lista de registros encontrados durante la búsqueda
    genericErrorMessage = 'Ha ocurrido un error inesperado. Por favor contáctese con soporte.'; //Mensaje de error genérico
    notfoundMessage: string = 'No se encontraron registros';

    //Formato de la fecha
    constructor(
        private AtpReportService: AtpReportService,
        private MassiveService: LoadMassiveService,
        private ComisionesDiferenciadasService: ComisionesDiferenciadasService,
        private modalService: NgbModal

    ) {
        this.bsConfig = Object.assign(
            {},
            {
                dateInputFormat: "DD/MM/YYYY",
                locale: "es",
                showWeekNumbers: false
            }
        );
    }

    //Funciones que se ejecutarán tras la compilación
    ngOnInit() {
        this.bsValueIni = new Date(this.bsValueIni.getFullYear(), this.bsValueIni.getMonth(), 1);
        this.getBranchList();

    }


    getProductsListByBranch(idRamo: any) {
        this.ComisionesDiferenciadasService.GetProductsList(idRamo).subscribe(
          (res) => {
            this.listProduct = res;
          },
                (err) => { }
        );
      }
      getBranchList() {
        this.ComisionesDiferenciadasService.GetBranchList().subscribe(
          (res) => {
            this.branchTypeList = res;
          },
                (err) => { }
        );
      }
    
      ChangeRamo() {console.log(this.idRamo);console.log(this.SelectedBranchId);
        this.idRamo=this.SelectedBranchId;
        if (this.idRamo !== null) {
          this.getProductsListByBranch(this.idRamo);
        }
      }
      ChangeProducto() {console.log(this.idRamo);console.log(this.SelectedProductoId);
        this.idProducto=this.SelectedProductoId;
        if (this.idProducto !== '') {
          this.getProductsListByBranch(this.idProducto);
        }
      }
      ProcessHabilitar(){
        console.log('ProcessHabilitar');
        if(this.bhabilitar!=null){
            swal.fire({
                title: "Información",
                text: "Se "+(this.bhabilitar?"habilitará":"inhabilitará")+" el cálculo para todas la comisiones diferenciadas de la póliza "+this.NPOLIZA,
                icon: "warning",
                showCancelButton: true,
                confirmButtonText: 'Aceptar',
                allowOutsideClick: false,
                cancelButtonText: 'Cancelar'
            }).then((result) => {
                if (result.value) {
                    this.isLoading = true;
                    let data: any = {};
                    if(this.bhabilitar!=null && this.bhabilitar!=undefined){
                        if(this.bhabilitar){
                            this.ComisionesDiferenciadasService.Habilitar(this.NPOLIZA).subscribe(
                              (res) => {
                                    if(res[0].Id==0){
                                      this.bhabilitar=false;
                                    }
                                },
                                (err) => {
                                }
                            );
                        }
                        else{
                            this.ComisionesDiferenciadasService.Inhabilitar(this.NPOLIZA).subscribe(
                              (res) => {
                                    if(res[0].Id==0){
                                      this.bhabilitar=true;
                                    }
                                },
                                (err) => {
                                }
                            );
                        }
                        this.isLoading = false;
                    }
                }
            });
        }
      }
      openModal(tipo:number,ntipo:number,ngrupo:number,item:any) {
        let modalRef: NgbModalRef;
        modalRef = this.modalService.open(MantenimientoComiDifModalConfigComponent, { size: 'lg', windowClass: 'modalCustom', backdropClass: 'light-blue-backdrop', backdrop: 'static', keyboard: false });
        modalRef.componentInstance.NPOLIZA= this.NPOLIZA!==undefined && this.NPOLIZA!=0?this.NPOLIZA:null;
        modalRef.componentInstance.NRAMO= this.SelectedBranchId!==undefined && this.SelectedBranchId!=0?this.SelectedBranchId:null;
        modalRef.componentInstance.NPRODUCT= this.SelectedProductoId!==undefined && this.SelectedProductoId!=0?this.SelectedProductoId:null;
        //if(tipo!=0){
            modalRef.componentInstance.NTIPO= ntipo;
            modalRef.componentInstance.NGRUPO= ngrupo;
            modalRef.componentInstance.GCONFIG=item;
        //}
        modalRef.componentInstance.reference = modalRef;
        modalRef.componentInstance.nTipoVentana= tipo;
        //modalRef.componentInstance.itemTransaccionList = this.policyList;
        //modalRef.componentInstance.cotizacionID = cotizacionID;
      }
      ProcessRegistrar(){
        let data: any = {
                            nBranch:this.SelectedBranchId, 
                            nProduct:this.SelectedProductoId, 
                            nPolicy:this.NPOLIZA
                        };
        this.ComisionesDiferenciadasService.GetComisDifConfigsXPoliza(data).subscribe(
          (res) => {
                //this.foundResults = res.POLIZAS;
                console.log("res.VALIDACIONES");
                console.log(res.VALIDACIONES);
                debugger
                if(res.VALIDACIONES.length>0){
                for(let i=0;i<res.VALIDACIONES.length;i++){
                  console.log(res.VALIDACIONES[i]);
                  if(res.VALIDACIONES[i].Description=="TIPO"){
                    this.ntipoPol=res.VALIDACIONES[i].Id;
                  }
                  if(res.VALIDACIONES[i].Description=="GRUPO"){
                    this.ngrupoPol=res.VALIDACIONES[i].Id;
                  }
                }
                  this.ntipoPol=this.ntipoPol===null||this.ntipoPol===undefined?0:this.ntipoPol;
                  this.ngrupoPol=this.ngrupoPol===null||this.ngrupoPol===undefined?0:this.ngrupoPol;
                }
                console.log(this.ntipoPol);
                console.log(this.ngrupoPol);
                this.openModal(0,this.ntipoPol,this.ngrupoPol,null);
              },
              (err) => {
                  console.log("failed");
                  this.bhabilitar=null;
                  this.comisionesDiferenciadasResults=[];
                  
                  this.foundResults = [];
                  this.totalItems = 0;
                  this.isLoading = false;
                  swal.fire('Información', this.genericErrorMessage, 'error');
                  debugger
                  this.ntipoPol=this.ntipoPol===null||this.ntipoPol===undefined?0:this.ntipoPol;
                  this.ngrupoPol=this.ngrupoPol===null||this.ngrupoPol===undefined?0:this.ngrupoPol;
                  this.openModal(0,this.ntipoPol,this.ngrupoPol,null);
              }
          );
      }
      Ver(ntipo:number,ngrupo:number,item:any){
        this.openModal(2,ntipo,ngrupo,item);
      }
      Editar(ntipo:number,ngrupo:number,item:any){
        this.openModal(3,ntipo,ngrupo,item);
      }
      Borrar(ntipo: number, ngrupo: number, item: any) {
        swal.fire({
            title: 'Información',
            text: '¿Desea eliminar el registro?',
            icon: 'warning',
            confirmButtonText: 'Aceptar',
            cancelButtonText: 'Cancelar',
            showCloseButton: true,
            showCancelButton: true,
            allowOutsideClick: false
        }).then((result) => {
            if (result.value) {
                console.log("Borrar");
                console.log(item);
                const data = {
                    nBranch: item.NBRANCH,
                    nProduct: item.NPRODUCT,
                    nPolicy: item.NPOLICY,
                    nOrden: item.NORDEN
                };
                console.log(data);
                this.ComisionesDiferenciadasService.EliminaConfig(data).subscribe(
                    (res) => {
                        this.foundResults = res;
                        console.log(this.foundResults);
                        if (this.foundResults != null && this.foundResults.length > 0) {
                            swal.fire('Información', this.foundResults.Description=='ok'?this.mensaje:'Problema al borrar configuración', 'error');
                          }else{
                            swal.fire('Información', this.foundResults.Description=='ok'?this.mensaje:'Problema al borrar configuración', 'success');
                            this.ProcessBuscar();
                          }
                    },
                    (error) => {
                        console.error('Error al borrar la configuración', error);
                        swal.fire('Error', 'Problema al borrar configuración', 'error');
                    }
                );
            }
        });
    }
    
      
    //Función de busqueda
      ProcessBuscar(){
        console.log('ProcessBuscar');
        if(!(this.SelectedBranchId===null || this.SelectedBranchId===undefined || this.SelectedBranchId=='-' || this.SelectedProductoId===null || this.SelectedProductoId===undefined || this.SelectedProductoId=='-' || this.NPOLIZA===null || this.NPOLIZA===undefined || this.NPOLIZA==0)){
        this.listToShow = [];
        
        this.hayNMODULO=false;
        this.hayDINIVIG=false;
        this.hayDFINVIG=false;
        this.haySESTADO=false;
        this.hayNINIVIG=false;
        this.hayNFINVIG=false;
        this.hayNTASACLIENTE=false;
        this.hayNTASACOMPANIA=false;
        this.hayNMINCREDITO=false;
        this.hayNMAXCREDITO=false;
        this.hayNPORCENTAJECANAL=false;
        this.hayNPORCENTAJEBROKER=false;
        this.hayNMONTOCANAL=false;
        this.hayNMONTOBROKER=false;
        this.hayNAGE_MIN=false;
        this.hayNAGE_MAX=false;
        this.hayNANIOINI=false;
        this.hayNANIOFIN=false;
        this.hayNSUMAASEG=false;
        this.hayNEDADMIN=false;
        this.hayNEDADMAX=false;
        this.hayNROL=false;
        
        this.isLoading = true;
        let data: any = {
                            nBranch:this.SelectedBranchId, 
                            nProduct:this.SelectedProductoId, 
                            nPolicy:this.NPOLIZA
                        };

        console.log(data);
        this.ComisionesDiferenciadasService.GetComisDifConfigsXPoliza(data).subscribe(
          (res) => {
                this.foundResults = res.POLIZAS;
                console.log("res.VALIDACIONES");
                console.log(res.VALIDACIONES);
                if(res.length>1){
                  this.ntipoPol=res.VALIDACIONES[1].NPOLICY;                
                  this.ngrupoPol=res.VALIDACIONES[2].NPOLICY;
                  this.ntipoPol=this.ntipoPol===null||this.ntipoPol===undefined?0:this.ntipoPol;
                  this.ngrupoPol=this.ngrupoPol===null||this.ngrupoPol===undefined?0:this.ngrupoPol;
                }
                
                console.log(this.foundResults);
                if (this.foundResults != null && this.foundResults.length > 0) {
                    this.comisionesDiferenciadasResults = res.POLIZAS;
                    this.totalItems = this.comisionesDiferenciadasResults.length;
                    console.log(this.comisionesDiferenciadasResults);
                    console.log('||ANTES|hayNMODULO'+this.hayNMODULO+'|hayDINIVIG'+this.hayDINIVIG+'|hayDFINVIG'+this.hayDFINVIG+'|haySESTADO'+this.haySESTADO+'|hayNINIVIG'+this.hayNINIVIG);
                    console.log('|hayNFINVIG'+this.hayNFINVIG+'|hayNTASACLIENTE'+this.hayNTASACLIENTE+'|hayNTASACOMPANIA'+this.hayNTASACOMPANIA+'|hayNMINCREDITO'+this.hayNMINCREDITO+'|hayNMAXCREDITO'+this.hayNMAXCREDITO);
                    console.log('|hayNPORCENTAJECANAL'+this.hayNPORCENTAJECANAL+'|hayNPORCENTAJEBROKER'+this.hayNPORCENTAJEBROKER+'|hayNMONTOCANAL'+this.hayNMONTOCANAL+'|hayNMONTOBROKER'+this.hayNMONTOBROKER+'|hayNAGE_MIN'+this.hayNAGE_MIN);
                    console.log('|hayNAGE_MAX'+this.hayNAGE_MAX+'|hayNANIOINI'+this.hayNANIOINI+'|hayNANIOFIN'+this.hayNANIOFIN+'|hayNSUMAASEG'+this.hayNSUMAASEG+'|hayNEDADMIN'+this.hayNEDADMIN+'|hayNEDADMAX'+this.hayNEDADMAX);
                    for (let index = 0; index < this.totalItems; index++) {
                        const element = this.comisionesDiferenciadasResults[index];
                        console.log(element);
                        
                        this.comisionesDiferenciadasResults[index].DINIVIG=element.DINIVIG == "0001-01-01T00:00:00"/* || element.DINIVIG == "1900-01-01T00:00:00"*/?null:element.DINIVIG;
                        this.comisionesDiferenciadasResults[index].DFINVIG=element.DFINVIG == "0001-01-01T00:00:00"/* || element.DFINVIG == "1900-01-01T00:00:00"*/?null:element.DFINVIG;
                        this.comisionesDiferenciadasResults[index].DNULLDATE=element.DNULLDATE == "0001-01-01T00:00:00"/* || element.DNULLDATE == "1900-01-01T00:00:00"*/?null:element.DNULLDATE;

                        this.hayNMODULO=((element.NMODULO === null || element.NMODULO === undefined)?this.hayNMODULO:true);
                        this.hayDINIVIG=((element.DINIVIG === null || element.DINIVIG === undefined || element.DINIVIG == "0001-01-01T00:00:00"/* || element.DINIVIG == "1900-01-01T00:00:00"*/)?this.hayDINIVIG:true);
                        this.hayDFINVIG=((element.DFINVIG === null || element.DFINVIG === undefined || element.DFINVIG == "0001-01-01T00:00:00"/* || element.DFINVIG == "1900-01-01T00:00:00"*/)?this.hayDFINVIG:true);
                        this.haySESTADO=(!(element.SESTADO === null || element.SESTADO === undefined) && element.SESTADO.trim()=="HABILITADO"?this.haySESTADO:true);
                        this.hayNINIVIG=((element.NINIVIG === null || element.NINIVIG === undefined || element.NINIVIG == 0)?this.hayNINIVIG:true);
                        this.hayNFINVIG=((element.NFINVIG === null || element.NFINVIG === undefined || element.NFINVIG == 0)?this.hayNFINVIG:true);
                        this.hayNTASACLIENTE=((element.NTASACLIENTE === null || element.NTASACLIENTE === undefined)?this.hayNTASACLIENTE:true);
                        this.hayNTASACOMPANIA=((element.NTASACOMPANIA === null || element.NTASACOMPANIA === undefined)?this.hayNTASACOMPANIA:true);
                        this.hayNMINCREDITO=((element.NMINCREDITO === null || element.NMINCREDITO === undefined || element.NMINCREDITO == 0)?this.hayNMINCREDITO:true);
                        this.hayNMAXCREDITO=((element.NMAXCREDITO === null || element.NMAXCREDITO === undefined || element.NMAXCREDITO == 0)?this.hayNMAXCREDITO:true);
                        this.hayNPORCENTAJECANAL=((element.NPORCENTAJECANAL === null || element.NPORCENTAJECANAL === undefined)?this.hayNPORCENTAJECANAL:true);
                        this.hayNPORCENTAJEBROKER=((element.NPORCENTAJEBROKER === null || element.NPORCENTAJEBROKER === undefined)?this.hayNPORCENTAJEBROKER:true);
                        this.hayNMONTOCANAL=((element.NMONTOCANAL === null || element.NMONTOCANAL === undefined)?this.hayNMONTOCANAL:true);
                        this.hayNMONTOBROKER=((element.NMONTOBROKER === null || element.NMONTOBROKER === undefined)?this.hayNMONTOBROKER:true);
                        this.hayNAGE_MIN=((element.NAGE_MIN === null || element.NAGE_MIN === undefined)?this.hayNAGE_MIN:true);
                        this.hayNAGE_MAX=((element.NAGE_MAX === null || element.NAGE_MAX === undefined)?this.hayNAGE_MAX:true);
                        this.hayNANIOINI=((element.NINIVIG === null || element.NINIVIG === undefined || element.NINIVIG == 0)?this.hayNANIOINI:true);
                        this.hayNANIOFIN=((element.NFINVIG === null || element.NFINVIG === undefined || element.NFINVIG == 0)?this.hayNANIOFIN:true);
                        this.hayNSUMAASEG=((element.NSUMAASEG === null || element.NSUMAASEG === undefined)?this.hayNSUMAASEG:true);
                        this.hayNEDADMIN=((element.NEDADMIN === null || element.NEDADMIN === undefined || element.NEDADMIN == 0)?this.hayNEDADMIN:true);
                        this.hayNEDADMAX=((element.NEDADMAX === null || element.NEDADMAX === undefined || element.NEDADMAX == 0)?this.hayNEDADMAX:true);
                        this.hayNROL=((element.NROL === null || element.NROL === undefined/* || element.NROL == 0*/)?this.hayNROL:true);
                    }
                    console.log('||DESPUES|hayNMODULO'+this.hayNMODULO+'|hayDINIVIG'+this.hayDINIVIG+'|hayDFINVIG'+this.hayDFINVIG+'|haySESTADO'+this.haySESTADO+'|hayNINIVIG'+this.hayNINIVIG);
                    console.log('|hayNFINVIG'+this.hayNFINVIG+'|hayNTASACLIENTE'+this.hayNTASACLIENTE+'|hayNTASACOMPANIA'+this.hayNTASACOMPANIA+'|hayNMINCREDITO'+this.hayNMINCREDITO+'|hayNMAXCREDITO'+this.hayNMAXCREDITO);
                    console.log('|hayNPORCENTAJECANAL'+this.hayNPORCENTAJECANAL+'|hayNPORCENTAJEBROKER'+this.hayNPORCENTAJEBROKER+'|hayNMONTOCANAL'+this.hayNMONTOCANAL+'|hayNMONTOBROKER'+this.hayNMONTOBROKER+'|hayNAGE_MIN'+this.hayNAGE_MIN);
                    console.log('|hayNAGE_MAX'+this.hayNAGE_MAX+'|hayNANIOINI'+this.hayNANIOINI+'|hayNANIOFIN'+this.hayNANIOFIN+'|hayNSUMAASEG'+this.hayNSUMAASEG+'|hayNEDADMIN'+this.hayNEDADMIN+'|hayNEDADMAX'+this.hayNEDADMAX);
                    this.listToShow = this.comisionesDiferenciadasResults;
                    this.bhabilitar=this.haySESTADO;
                    //swal.fire('Información', this.mensaje, 'success');
                }else{
                  this.bhabilitar=null;
                  this.comisionesDiferenciadasResults=[];
                  this.ComisionesDiferenciadasService.ValidaPoliza(data).subscribe(
                    res => {
                      this.comisionesDiferenciadasPolizaResults=res;
                      console.log(this.comisionesDiferenciadasPolizaResults);
                      if(this.comisionesDiferenciadasPolizaResults.length==0){
                        swal.fire('Error', 'Póliza no existe', 'error');
                      }else{
                        swal.fire('Error', 'La póliza ingresada no tiene comisión diferenciada', 'error');
                      }
                      this.isLoading = false;

                    },
                    error => {
                        this.foundResults = [];
                        this.totalItems = 0;
                        this.isLoading = false;
                        swal.fire('Información', this.genericErrorMessage, 'error');
                    }
                  )
                }
                this.isLoading = false;
            },
            (err) => {
                console.log("failed");
                this.bhabilitar=null;
                this.comisionesDiferenciadasResults=[];
                
                this.foundResults = [];
                this.totalItems = 0;
                this.isLoading = false;
                swal.fire('Información', this.genericErrorMessage, 'error');
            }
        );
      }else{
        swal.fire('Información', "Llenar correctamente los filtros", 'error');
      }
    }
  onPaste(event: any, typeText:string, longitud: number):any {
    const inputElement = event.target as HTMLInputElement;
    const startPosition = inputElement.selectionStart;
    const endPosition = inputElement.selectionEnd;
        
    console.log('Start position:', startPosition);
    console.log('End position:', endPosition);
    let regextext='[0-9]'
    event.preventDefault();
    let pastetext = (event.clipboardData).getData("text");
    let valorNuevo;
    let valorActual=event.target.value;
    const position = event.target.selectionStart;
    const inputChar = String.fromCharCode(event.charCode);
    if(typeText=='1')
      regextext='^([0-9]{0,'+longitud+'})?$';
    else if(typeText=='2')
      regextext='^([0-9A-Za-zñÑÁÉÍÓÚáéíóúÄËÏÖÜäëïöü]{0,'+longitud+'})?$';
    else if(typeText=='3')
      regextext='^([0-9A-Za-zñÑÁÉÍÓÚáéíóúÄËÏÖÜäëïöü ]{0,'+longitud+'})?$';
      else if(typeText=='4')
      regextext='^([a-zA-ZñÑÁÉÍÓÚáéíóúÄËÏÖÜäëïöü0-9-,:()&$#\'. ]{0,'+longitud+'})?$';
      else if(typeText=='5')
      regextext='^([A-Za-zñÑÁÉÍÓÚáéíóúÄËÏÖÜäëïöü ]{0,'+longitud+'})?$';
      else if(typeText=='6')
      regextext='^([0-9A-Za-z._@-]{0,'+longitud+'})?$';
      else if(typeText=='7')
      regextext='^([0-9bfBF-]{0,'+longitud+'})?$';
      else if(typeText=='8')
      regextext='^([0-9]{0,'+longitud+'})?(.{1}[0-9]{0,6})?$';
    
      if(position!=0){
        if(startPosition!=endPosition){
          if(startPosition!=0){
            valorNuevo=valorActual.substring(0, startPosition ) + pastetext + valorActual.substring(endPosition , valorActual.length);
          }else{
            console.log("valorActual.substring(endPosition, valorActual.length):"+valorActual.substring(endPosition, valorActual.length));
            console.log("valorActual.length:"+valorActual.length);
            console.log("pastetext:"+pastetext);
            
            valorNuevo=''+pastetext + valorActual.substring(endPosition, valorActual.length);
          }
        } else{
          if(pastetext=='0' && position==0){
            return valorActual;
          }else{
            if(longitud<valorActual.length){
              //event.target.value=valorActual;
              console.log("valorActual:"+valorActual);return valorActual;
            }
            valorNuevo=valorActual.substring(0, position ) + pastetext + valorActual.substring(position , valorActual.length);
          }
        }
      }else{
        if(valorActual.length==endPosition){
          valorNuevo=pastetext;
        }
        else{
          valorNuevo=pastetext + valorActual.substring(endPosition , valorActual.length);
        }
      }
      let patron=RegExp(regextext);
      console.log(patron);
      if(!patron.test(valorNuevo)){
        console.log("valorActual a:"+valorActual);return valorActual;
      }
      if(valorNuevo.split('.').length>2 && typeText=='8'){
        console.log("valorActual b:"+valorActual);return valorActual;
      }
      if(longitud==3 && valorNuevo.split('.')[0].length==longitud && valorNuevo!=100 && typeText=='8'){
        console.log("valorActual c:"+valorActual);return valorActual;
      }
      if(valorNuevo.length>longitud){
        console.log("valorActual d:"+valorActual);return valorActual;
      }
      
      console.log("valorActual:"+valorActual);
      console.log("length:"+valorActual.length);
      console.log("position:"+position);
      console.log("inputChar:"+inputChar);
      console.log("valorNuevo:"+valorNuevo);
      // 1|Numericos
      // 2|Alfanumericos sin espacios
      // 3|Alfanumericos con espacios
      // 4|LegalName
      // 5|Solo texto
      // 6|Email
      // 7|Comprobante rebill
      // 8|Monto Dinero|longitud 3 porcentaje
    /*}*/
    return valorNuevo;
  }
  textValidate(event: any, typeText:string, longitud: number):any {
    const inputElement = event.target as HTMLInputElement;
    const startPosition = inputElement.selectionStart;
    const endPosition = inputElement.selectionEnd;
    
    console.log('Start position:', startPosition);
    console.log('End position:', endPosition);

    event.preventDefault();
    let valorNuevo;
    let valorActual=event.target.value;
    const position = event.target.selectionStart;
    const inputChar = String.fromCharCode(event.charCode);

    if(typeText=='1' || typeText=='2' || typeText=='3' || typeText=='4' || typeText=='5' || typeText=='6' || typeText=='7'){
        
      let pattern = new RegExp('[0-9]');
      switch (typeText) {
          case '1': { // Numericos
              pattern = new RegExp('[0-9]');
              break; 
          }
          case '2': { // Alfanumericos sin espacios
              pattern = new RegExp('[0-9A-Za-zñÑÁÉÍÓÚáéíóúÄËÏÖÜäëïöü]');
              break; 
          }
          case '3': { // Alfanumericos con espacios
              pattern = new RegExp('[0-9A-Za-zñÑÁÉÍÓÚáéíóúÄËÏÖÜäëïöü ]');
              break; 
          }
          case '4': { // LegalName
              pattern = new RegExp('[a-zA-ZñÑÁÉÍÓÚáéíóúÄËÏÖÜäëïöü0-9-,:()&$#\'. ]');
              break; 
          }
          case '5': { // Solo texto
              pattern = new RegExp('[A-Za-zñÑÁÉÍÓÚáéíóúÄËÏÖÜäëïöü ]');
              break; 
          }
          case '6': { // Email
              pattern = new RegExp('[0-9A-Za-z._@-]');
              break; 
          }
          case '7': { // Comprobante rebill
              pattern = new RegExp('[0-9bfBF-]');
              break; 
          }
      }

      if (!pattern.test(inputChar)) {
        //event.target.value=valorActual;
        console.log("valorActual:"+valorActual);return valorActual;
      }
      //event.target.value=this.textValidate(event, typeText);
    }else{
      if(typeText=='8'){
        let pattern = new RegExp('[0-9.]');
        if (!pattern.test(inputChar)) {
          //event.target.value=valorActual;
          console.log("valorActual a:"+valorActual);return valorActual;
        }
        if(inputChar=='.' && valorActual.split('.').length>1){
          //event.target.value=valorActual;
          console.log("valorActual b:"+valorActual);return valorActual;
        }
      }
    }
    if(valorActual=='0' && inputChar!='0' && (typeText=='1' || typeText=='8')){
      valorNuevo=inputChar;
    }else{
      if(position!=0){
        if(startPosition!=endPosition){
          if(startPosition!=0){
            valorNuevo=valorActual.substring(0, startPosition ) + inputChar + valorActual.substring(endPosition , valorActual.length);
          }else{
            console.log("valorActual.substring(endPosition, valorActual.length):"+valorActual.substring(endPosition, valorActual.length));
            console.log("valorActual.length:"+valorActual.length);
            console.log("inputChar:"+inputChar);
            
            valorNuevo=''+inputChar + valorActual.substring(endPosition, valorActual.length);
          }
        }else{
          if(inputChar=='0' && position==0){
            return valorActual;
          }else{
            if(longitud<=valorActual.length){
              if(typeText!='8'){
                console.log("valorActual c:"+valorActual);return valorActual;
              }
            }
            valorNuevo=valorActual.substring(0, position ) + inputChar + valorActual.substring(position , valorActual.length);
          }
        }
      }else{
        if(valorActual.length==endPosition){
          valorNuevo=inputChar;
        }
        else{
          valorNuevo=inputChar + valorActual.substring(endPosition , valorActual.length);
        }
      }
      if((valorNuevo.split('.').length>2 || valorNuevo.split('.')[0].length>longitud) && typeText=='8'){
        console.log("valorActual d:"+valorActual);return valorActual;
      }
      if(typeText=='8'){
        if(!RegExp('^([0-9]{0,'+longitud+'})?(.{1}[0-9]{0,6})?$').test(valorNuevo)){
          console.log("valorActual d:"+valorActual);return valorActual;
        }
        if(longitud==3 && valorNuevo.split('.')[0].length==longitud && valorNuevo!=100){
          console.log("valorActual e:"+valorActual);return valorActual;
        }
      }
      
      console.log("valorActual:"+valorActual);
      console.log("length:"+valorActual.length);
      console.log("position:"+position);
      console.log("inputChar:"+inputChar);
      console.log("valorNuevo:"+valorNuevo);
      // 1|Numericos
      // 2|Alfanumericos sin espacios
      // 3|Alfanumericos con espacios
      // 4|LegalName
      // 5|Solo texto
      // 6|Email
      // 7|Comprobante rebill
      // 8|Monto Dinero|longitud 3 porcentaje
    }
    console.log("valorNuevo:"+valorNuevo);
    return valorNuevo;
  }
}
