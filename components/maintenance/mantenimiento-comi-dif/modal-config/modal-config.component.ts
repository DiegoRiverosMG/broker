import { Component, Input, OnInit } from '@angular/core';
import { BsDatepickerConfig } from 'ngx-bootstrap/datepicker';
import swal from 'sweetalert2';

import { NgbModal, ModalDismissReasons, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { AtpReportService } from '../../../../services/atp-reports/atp-report.service';
import { ComisionesDiferenciadasService } from '../../../../services/maintenance/comisiones-diferenciadas/comisiones-diferenciadas.service';
import { LoadMassiveService } from '../../../../services/LoadMassive/load-massive.service';
//Compartido
import { AccessFilter } from './../../../access-filter'
import { CommonMethods } from '../../../common-methods';
import { Ramo } from '@root/layout/broker/models/commission-channel/commission-channel.model';


@Component({
    selector: 'modal-config',
    templateUrl: './modal-config.component.html',
    styleUrls: ['./modal-config.component.css']
})
export class MantenimientoComiDifModalConfigComponent implements OnInit {
    @Input() public reference: any;
    @Input() public nTipoVentana: number;
    @Input() public NPOLIZA: number;
    @Input() public NRAMO: number;
    @Input() public NPRODUCT: number;
    @Input() public NTIPO: number;
    @Input() public NGRUPO: number;
    @Input() public GCONFIG: any;

    mcomisionesDiferenciadasResults: any[] = [];
    mcomisionesDiferenciadasPolizaResults: any[] = [];
    mreporteProvicomisionesResults: any[] = [];
    mensaje:string="Proceso Exitoso";
    
    template: any = {}
    mtitle:string;
    validacion:string;
    msubtitle:string;
    //codProducto = JSON.parse(localStorage.getItem("codProducto"))["productId"];
    bguardo:number;

    npolizas:number=0;
    meditando:number=-1;

    mlistToShow: any = [];
    //CheckBox
    mUnselectedItemMessage: any = '';
    mStartDateSelected: any = '';
    mNBranchSelected: any = '';
    mEndDateSelected: any = '';

    mlistSA:any[]=[];
    
    mlistRoles:any[]=[];
    mlistModulos:any[]=[];
    mlistProduct: any = [];
    mlistRamo: any = [];
    mbranchTypeList: any[] = [];
    mlistTipoCom: any[] = [];
    mlistGrupo: any[] = [];
    mlistCampos: any[] = [];
    mlistValores: any = [];

    midRamo: any = '';
    midProducto: any = '';
    midTipoCom:any = '';
    midGrupo:any = '';

    mSelectedBranchId:any = '';
    mSelectedProductoId:any = '';
    mSelectedTipoComId:any = '';
    mSelectedGrupoId:any = '';

    mbranch: any = '';

    mEncontroModulo:boolean=true;

    haymlistValores:boolean=false;
    //Valores de campos de configuración
    valModulo:any = '';
    valModuloOld:any = '';
    valNIniCre:any = '';
    valNIniCreOld:any = '';
    valNFinCre:any = '';
    valNFinCreOld:any = '';
    valFIni:any = '';
    valFIniOld:any = '';
    valFFin:any = '';
    valFFinOld:any = '';
    valNTasaCli:any = '';
    valNTasaCliOld:any = '';
    valNTasaComp:any = '';
    valNTasaCompOld:any = '';
    valNComBrok:any = '';
    valNComBrokOld:any = '';
    valNComCanal:any = '';
    valNComCanalOld:any = '';
    valNMontoBrok:any = '';
    valNMontoBrokOld:any = '';
    valNMontoCanal:any = '';
    valNMontoCanalOld:any = '';
    valNCuotaMin:any = '';
    valNCuotaMinOld:any = '';
    valNCuotaMax:any = '';
    valNCuotaMaxOld:any = '';
    valNSA:any = '';
    valNSAOld:any = '';
    valNRol:any = '';
    valNRolOld:any = '';
    valNEdadMin:any = '';
    valNEdadMinOld:any = '';
    valNEdadMax:any = '';
    valNEdadMaxOld:any = '';
    
    //Valores en lista
    mhayNMODULO:boolean;
    mhayDINIVIG:boolean;
    mhayDFINVIG:boolean;
    mhaySESTADO:boolean;
    
    mhayNINIVIG:boolean;
    mhayNFINVIG:boolean;
    mhayNTASACLIENTE:boolean;
    mhayNTASACOMPANIA:boolean;
    mhayNMINCREDITO:boolean;
    mhayNMAXCREDITO:boolean;
    mhayNPORCENTAJECANAL:boolean;
    mhayNPORCENTAJEBROKER:boolean;
    mhayNMONTOCANAL:boolean;
    mhayNMONTOBROKER:boolean;
    mhayNAGE_MIN:boolean;
    mhayNAGE_MAX:boolean;
    mhayNANIOINI:boolean;
    mhayNANIOFIN:boolean;
    mhayNSUMAASEG:boolean;
    mhayNEDADMIN:boolean;
    mhayNEDADMAX:boolean;
    mhayNROL:boolean;


    //Campos configuracion
    mhaySumaAsegurada:boolean;
    mhayTasaCompania:boolean;
    mhayTasaComisionCanal:boolean;
    mhayTasaComisionBroker:boolean;
    mhayTasaCliente:boolean;
    mhayModulo:boolean;
    
    mhayAnioIni:boolean;
    mhayAnioFin:boolean;
    mhayPrimaNetaCanal:boolean;
    mhayPrimaNetaBroker:boolean;
    mhayAnioMaximo:boolean;
    
    mhayAnioMinimo:boolean;
    
    mhayFechaInicio:boolean;
    mhayFechaFin:boolean;
    
    mhayMontoCreditoFin:boolean;
    
    mhayMontoCreditoIni:boolean;
    mhayAnioFinContrato:boolean;
    mhayRol:boolean;
    

    misError: boolean = false;
    mbhabilitar: boolean=true;
    //Pantalla de carga
    misLoading: boolean = false;
    //Fechas
    mbsConfig: Partial<BsDatepickerConfig>;
    mbsValueIni: Date = new Date();
    mbsValueFin: Date = new Date();
    mbsValueFinMax: Date = new Date();
    // data: ReportAtpSearch = new ReportAtpSearch();

    disRamo: Boolean;
    disProducto: Boolean;
    disPoliza: Boolean;
    disTipoCom: Boolean;
    disGrupo: Boolean;

    public mmaxSize = 5; // cantidad de paginas que se mostrarán en el html del paginado
    public mtotalItems = 0; //total de items encontrados
    public mfoundResults: any = [];  //Lista de registros encontrados durante la búsqueda
    mgenericErrorMessage = 'Ha ocurrido un error inesperado. Por favor contáctese con soporte.'; //Mensaje de error genérico
    mnotfoundMessage: string = 'No se encontraron registros';

    //Formato de la fecha
    constructor(
        private AtpReportService: AtpReportService,
        private MassiveService: LoadMassiveService,
        private ComisionesDiferenciadasService: ComisionesDiferenciadasService

    ) {
        this.mbsConfig = Object.assign(
            {},
            {
                dateInputFormat: "DD/MM/YYYY",
                locale: "es",
                showWeekNumbers: false
            }
        );
    }

    //Funciones que se ejecutarán tras la compilación
    
  async ngOnInit() {
    this.mlistRoles=[{Id:0,Description:'0'},{Id:1,Description:'1'},{Id:2,Description:'2'},{Id:23,Description:'23'}];
    if(this.nTipoVentana==0){
        this.mtitle="Registrar Comisión Diferenciada de la Póliza";
    }
    if(this.nTipoVentana==1){
        this.mtitle="Modificar Comisión Diferenciada de la Póliza";
    }
    if(this.nTipoVentana==2){
        this.mtitle="Datos de la Comisión Diferenciada de la Póliza";
    }
    if(this.nTipoVentana==3){
        this.mtitle="Editar Comisión Diferenciada de la Póliza";
    }
    // Configuracion del Template
    //this.template = await CommonMethods.configuracionTemplate(this.codProducto, this.epsItem.NCODE)
    this.getSAList();
    this.mbsValueIni = new Date(this.mbsValueIni.getFullYear(), this.mbsValueIni.getMonth(), 1);
    this.getBranchList();
    if(this.NRAMO!==undefined && this.NRAMO!=0){
      this.mSelectedBranchId=this.NRAMO;
      
      if(this.NPRODUCT!==undefined && this.NPRODUCT!=0){
        this.getProductsListByBranch(this.NRAMO);
        this.mSelectedProductoId=this.NPRODUCT;
      }
    }
    
    this.getTypeList(undefined);
    if(this.NTIPO!==undefined && this.NTIPO!=0){
      this.mSelectedTipoComId=this.NTIPO;
      
      if(this.NGRUPO!==undefined && this.NGRUPO!==null && this.NGRUPO!=0){
        this.getGroupListByTipoCom(this.mSelectedTipoComId);
        this.mSelectedGrupoId=this.NGRUPO;
      }
    }
    
    if(this.nTipoVentana!=0){
      this.disRamo=this.NRAMO!==undefined && this.NRAMO!=0?true:false;
      this.disProducto=this.NPRODUCT!==undefined && this.NPRODUCT!=0?true:false;
      this.disPoliza=this.NPOLIZA!==undefined && this.NPOLIZA!=0?true:false;
    }
    debugger
    if(this.nTipoVentana==0 || this.nTipoVentana==2 || this.nTipoVentana==3){
      this.disTipoCom=this.NTIPO!==undefined && this.NTIPO!=0?true:false;
      this.disGrupo=this.NGRUPO!==undefined && this.NGRUPO!=0?true:false;
      this.mSelectedTipoComId=this.NTIPO!==undefined && this.NTIPO!=0?this.NTIPO:this.mSelectedTipoComId;
      this.mSelectedGrupoId=this.NGRUPO!==undefined && this.NGRUPO!=0?this.NGRUPO:this.mSelectedGrupoId;
    }else{
      this.disTipoCom=false;
      this.disGrupo=false;
    }
    this.validaCampos();
    if(this.GCONFIG===undefined){
      console.log("|GCONFIG:");
    }else{
      console.log("|GCONFIG:");
      console.log(this.GCONFIG);
    }
    if(this.GCONFIG!==undefined && this.GCONFIG!==null && (this.nTipoVentana==2 || this.nTipoVentana==3)){
      this.setCampos(this.NTIPO,this.NGRUPO,this.GCONFIG);
      this.mSelectedTipoComId=this.NTIPO;
      this.mSelectedGrupoId=this.NGRUPO;
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
        }else{
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
    if(valorActual=='0' && inputChar!='0' && (typeText=='1' || (typeText=='8' && inputChar!='.' && startPosition!=endPosition))){
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
  preventDefault(){
    //this.valModulo=this.valModuloOld;
    this.valNIniCre=this.valNIniCreOld;
    this.valNFinCre=this.valNFinCreOld;
    //this.valFIni=this.valFIniOld;
    //this.valFFin=this.valFFinOld;
    this.valNTasaCli=this.valNTasaCliOld;
    this.valNTasaComp=this.valNTasaCompOld;
    this.valNComBrok=this.valNComBrokOld;
    this.valNComCanal=this.valNComCanalOld;
    this.valNMontoBrok=this.valNMontoBrokOld;
    this.valNMontoCanal=this.valNMontoCanalOld;
    this.valNCuotaMin=this.valNCuotaMinOld;
    this.valNCuotaMax=this.valNCuotaMaxOld;
    this.valNSA=this.valNSAOld;
    //this.valNRol=this.valNRolOld;
    this.valNEdadMin=this.valNEdadMinOld;
    this.valNEdadMax=this.valNEdadMaxOld;

    console.log("|valNIniCre:"+this.valNIniCre+
      "|valNTasaCli:"+this.valNTasaCli+
      "|valNTasaComp:"+this.valNTasaComp+
      "|valNComBrok:"+this.valNComBrok+
      "|valNComCanal:"+this.valNComCanal+
      "|valNMontoBrok:"+this.valNMontoBrok+
      "|valNMontoCanal:"+this.valNMontoCanal+
      "|valNCuotaMin:"+this.valNCuotaMin+
      "|valNCuotaMax:"+this.valNCuotaMax+
      "|valNSA:"+this.valNSA+
      "|valNEdadMin:"+this.valNEdadMin+
      "|valNEdadMax:"+this.valNEdadMax);
  }
  nopreventDefault(){
    //this.valModulo=this.valModuloOld;
    //this.valModuloOld=this.valModulo;
    this.valNIniCreOld=this.valNIniCre;
    this.valNFinCreOld=this.valNFinCre;
    //this.valFIniOld=this.valFIni;
    //this.valFFinOld=this.valFFin;
    this.valNTasaCliOld=this.valNTasaCli;
    this.valNTasaCompOld=this.valNTasaComp;
    this.valNComBrokOld=this.valNComBrok;
    this.valNComCanalOld=this.valNComCanal;
    this.valNMontoBrokOld=this.valNMontoBrok;
    this.valNMontoCanalOld=this.valNMontoCanal;
    this.valNCuotaMinOld=this.valNCuotaMin;
    this.valNCuotaMaxOld=this.valNCuotaMax;
    this.valNSAOld=this.valNSA;
    //this.valNRolOld=this.valNRol;
    this.valNEdadMinOld=this.valNEdadMin;
    this.valNEdadMaxOld=this.valNEdadMax;

    console.log("|valNIniCreOld:"+this.valNIniCreOld+
      "|valNTasaCliOld:"+this.valNTasaCliOld+
      "|valNTasaCompOld:"+this.valNTasaCompOld+
      "|valNComBrokOld:"+this.valNComBrokOld+
      "|valNComCanalOld:"+this.valNComCanalOld+
      "|valNMontoBrokOld:"+this.valNMontoBrokOld+
      "|valNMontoCanalOld:"+this.valNMontoCanalOld+
      "|valNCuotaMinOld:"+this.valNCuotaMinOld+
      "|valNCuotaMaxOld:"+this.valNCuotaMaxOld+
      "|valNSAOld:"+this.valNSAOld+
      "|valNEdadMinOld:"+this.valNEdadMinOld+
      "|valNEdadMaxOld:"+this.valNEdadMaxOld);
  }

  validaCampos(){
    const isNullOrEmpty = (value: any): boolean => value === null || value === undefined || value === '';

        const { mSelectedBranchId, mSelectedProductoId, NPOLIZA, mSelectedTipoComId, mSelectedGrupoId, nTipoVentana } = this;

        const camposInvalidos = [
            mSelectedBranchId,
            mSelectedProductoId,
            mSelectedTipoComId,
            mSelectedGrupoId
        ].some(isNullOrEmpty) || NPOLIZA === null || NPOLIZA === undefined || NPOLIZA.toString() === '' || NPOLIZA <= 0;

        this.mbhabilitar = camposInvalidos && nTipoVentana !== 2;

        const subtitles = {
            0: "Registrar Configuración",
            1: "Modificar Configuración",
            2: "",
            3: "Editar Configuración"
        };

        this.msubtitle = subtitles[nTipoVentana] || "Configuración";

        console.log(`mbhabilitar: ${this.mbhabilitar}`);
        console.log(`|mSelectedBranchId: ${mSelectedBranchId}`);
        console.log(`|mSelectedTipoComId: ${mSelectedTipoComId}`);
        console.log(`|mSelectedProductoId: ${mSelectedProductoId}`);
        console.log(`|NPOLIZA: ${NPOLIZA}`);
        console.log(`|disTipoCom: ${this.disTipoCom}`);
        console.log(`|disGrupo: ${this.disGrupo}`);
        console.log(`|nTipoVentana: ${nTipoVentana}`);

        if (!isNullOrEmpty(this.mSelectedTipoComId) && !isNullOrEmpty(this.mSelectedGrupoId) && this.nTipoVentana !== 2) {
            this.getCampos(this.mSelectedTipoComId, this.mSelectedGrupoId);
            //this.getModulos(this.NPOLIZA, this.mSelectedBranchId, this.mSelectedProductoId);
        }
   /* if((this.mSelectedBranchId===null || this.mSelectedBranchId===undefined || this.mSelectedBranchId=='' || 
      this.mSelectedProductoId===null || this.mSelectedProductoId===undefined || this.mSelectedBranchId=='' || 
      this.NPOLIZA===null || this.NPOLIZA===undefined || this.NPOLIZA.toString()==''  || this.NPOLIZA<=0 || 
      this.mSelectedTipoComId===null || this.mSelectedTipoComId===undefined || this.mSelectedTipoComId=='' || 
      this.mSelectedGrupoId===null || this.mSelectedGrupoId===undefined || this.mSelectedGrupoId=='') && this.nTipoVentana!=2){
        this.mbhabilitar=true;
    }else{
        this.mbhabilitar=false;
    }

    this.msubtitle=(this.nTipoVentana==0?"Registrar ":this.nTipoVentana==1?"Modificar ":this.nTipoVentana==2?"":this.nTipoVentana==3?"Editar ":"")+"Configuración";
    console.log("mbhabilitar:"+this.mbhabilitar);
    console.log("|mSelectedBranchId:"+this.mSelectedBranchId+"|mSelectedProductoId:"+this.mSelectedProductoId+"|NPOLIZA:"+this.NPOLIZA+"|mSelectedTipoComId:"+this.mSelectedTipoComId+"|mSelectedGrupoId:"+this.mSelectedGrupoId);
    console.log("|disTipoCom:"+this.disTipoCom+"|disGrupo:"+this.disGrupo+"|nTipoVentana:"+this.nTipoVentana);

    if(!(this.mSelectedTipoComId===null || this.mSelectedTipoComId===undefined || this.mSelectedTipoComId=='') &&
       !(this.mSelectedGrupoId===null || this.mSelectedGrupoId===undefined || this.mSelectedGrupoId=='') &&
        this.nTipoVentana!=2){
      this.getCampos(this.mSelectedTipoComId,this.mSelectedGrupoId);
      this.getModulos(this.NPOLIZA,this.mSelectedBranchId,this.mSelectedProductoId);
    }*/
  }
  getProductsListByBranch(idRamo: any) {
      this.ComisionesDiferenciadasService.GetProductsList(idRamo).subscribe(
        (res) => {
          this.mlistProduct = res;
        },
              (err) => { }
      );
  }
  getGroupListByTipoCom(idTipoCom: any) {
    this.ComisionesDiferenciadasService.GetGroupByTypeComiDif(idTipoCom).subscribe(
        (res) => {
            this.mlistGrupo = res;
            
        },
        (err) => {
            console.error('Error al obtener los grupos por tipo de comisión:', err);
        }
    );
}

getGroupListByTipoCom2(idTipoCom: any) {
    this.ComisionesDiferenciadasService.GetGroupByTypeComiDif(idTipoCom).subscribe(
        (res) => {
            this.mlistGrupo = res;
            this.mSelectedGrupoId = "";
        },
        (err) => {
            console.error('Error al obtener los grupos por tipo de comisión:', err);
        }
    );
}

/* getGroupListByTipoCom2(idTipoCom: any) {
 
         console.log("|idTipoCom::" + idTipoCom + "|this.mlistGrupo[0].Id::" + this.mlistGrupo[0].Id);
         console.log("|NTIPO::" + this.NTIPO + "|NGRUPO::" + this.NGRUPO);
         //this.mSelectedGrupoId = this.NGRUPO === 0 ? this.mlistGrupo[0].Id : this.NGRUPO;
         //this.mSelectedGrupoId = this.mlistGrupo[0].Id;
         //this.mSelectedGrupoId = this.mlistGrupo[0].Id;
         //this.mbhabilitar = false;
         //validamos si es diferente a ="Datos de la Comisión Diferenciada de la Póliza" y"Editar Comisión Diferenciada de la Póliza";
         if (this.mlistGrupo && this.mlistGrupo.length > 0) {
             console.log("|idTipoCom::" + idTipoCom + "|this.mlistGrupo[0].Id::" + this.mlistGrupo[0].Id);
             console.log("|NTIPO::" + this.NTIPO + "|NGRUPO::" + this.NGRUPO);
             this.mSelectedGrupoId = this.mlistGrupo[0].Id;
         }
         this.mbhabilitar = false;
     
 
         /*if (this.nTipoVentana != 2 && this.nTipoVentana != 3) {
 
             this.mSelectedGrupoId = this.NGRUPO === 0 ? this.mlistGrupo[0].Id : this.NGRUPO;
             this.mbhabilitar = false;
             //this.getModulos(this.NPOLIZA,this.mSelectedBranchId,this.mSelectedProductoId);
         }
         this.getCampos(this.NTIPO == undefined || this.NTIPO == null ? idTipoCom : this.NTIPO, this.NGRUPO == undefined || this.NGRUPO == null ? this.mSelectedGrupoId : this.NGRUPO);
     }*/
  getBranchList() {
    this.ComisionesDiferenciadasService.GetBranchList().subscribe(
      (res) => {
        this.mbranchTypeList = res;
      },
            (err) => { }
    );
  }
  getSAList() {
    this.ComisionesDiferenciadasService.GetSAList().subscribe(
      (res) => {
        this.mlistSA = res;
      },
            (err) => { }
    );
  }
  getTypeList(nfiltro:number) {
    nfiltro=nfiltro===undefined?0:nfiltro;
    this.ComisionesDiferenciadasService.GetTypeComiDif(nfiltro).subscribe(
      (res) => {
        this.mlistTipoCom = res;
        

      },
            (err) => { }
    );
  }
  getTypeList2(nfiltro:number) {
    nfiltro=nfiltro===undefined?0:nfiltro;
    this.ComisionesDiferenciadasService.GetTypeComiDif(nfiltro).subscribe(
      (res) => {
        this.mlistTipoCom = res;
        this.mSelectedTipoComId ="";
      },
            (err) => { }
    );
  }
  getModulos(poliza:number,ramo:number,producto:number) {
    let data: any = {
                      poliza:poliza,
                      ramo:ramo,
                      producto:producto
                    };
    this.ComisionesDiferenciadasService.getModulos(data).subscribe(
      (res) => {
        this.mlistModulos = res;
        if(this.mlistModulos.length>0){
          this.mEncontroModulo=true;
        }else{
          
          this.mEncontroModulo=false;
        }
      },
      (err) => { 
        this.mEncontroModulo=false;
      }
    );
  }
  getGrupoList(tipo:number) {
    this.ComisionesDiferenciadasService.GetGroupByTypeComiDif(tipo).subscribe(
      (res) => {
        this.mlistGrupo = res;
      },
            (err) => { }
    );
    //this.validaCampos();
  }
  getCampos(tipo:number,grupo:number) {
    this.ComisionesDiferenciadasService.GetCampos(tipo,grupo).subscribe(
      (res) => {

        this.mlistCampos = res;
                console.log("lista 2: " + JSON.stringify(this.mlistCampos, null, 2));
                //Se muestran las cajas de texto segun el grupo que se selecciona
                if (tipo == 1 && grupo == 1) {
                    this.mhayModulo = true;
                    this.mhayAnioIni = true;
                    this.mhayTasaComisionCanal = true;
                    this.mhayTasaComisionBroker = true;
                    this.mhaySumaAsegurada = true;
                    this.mhayFechaInicio = false;
                    this.mhayFechaFin = false;
                    this.mhayAnioMinimo = false;
                    this.mhayAnioMaximo = false;
                    this.mhayMontoCreditoIni = false;
                    this.mhayMontoCreditoFin = false;
                    this.mhayTasaCliente = false;
                    this.mhayTasaCompania = false;
                    this.mhayAnioFin = false;
                    this.mhayRol = false;
                }
                if (tipo == 2 && grupo == 1) {
                    this.mhayFechaInicio = true;
                    this.mhayFechaFin = true;
                    this.mhayAnioMinimo = true;
                    this.mhayAnioMaximo = true;
                    this.mhayAnioIni = false
                }
                if (tipo == 2 && grupo == 2) {
                    this.mhayAnioMinimo = false;
                    this.mhayAnioMaximo = false;
                    this.mhayFechaInicio = false;
                }
                if (tipo == 2 && grupo == 3) {
                    this.mhayFechaInicio = true;
                    this.mhayTasaCliente = true;
                    this.mhayTasaCompania = true;
                    this.mhayModulo = false;
                }
                if (tipo == 2 && grupo == 4) {
                    this.mhayMontoCreditoIni = true;
                    this.mhayMontoCreditoFin = true;

                    this.mhayTasaCliente = false;
                    this.mhayTasaCompania = false;
                }
                if (tipo == 2 && grupo == 5) {
                    this.mhayModulo = true;
                    this.mhayAnioIni = true;
                    this.mhayAnioFin = true;
                    this.mhayMontoCreditoIni = false;
                    this.mhayMontoCreditoFin = false;

                }
                if (tipo == 2 && grupo == 6) {
                    this.mhayMontoCreditoIni = true;
                    this.mhayMontoCreditoFin = true;
                    this.mhayModulo = false;
                    this.mhayAnioIni = false;
                    this.mhayAnioFin = false;
                }
                if (tipo == 3 && grupo == 1) {
                    this.mhayModulo = true;
                    this.mhayRol = true;
                }
        /*this.mlistCampos = res;
        this.mhaySumaAsegurada=false;
        this.mhayTasaCompania=false;
        this.mhayTasaComisionCanal=false;
        this.mhayTasaComisionBroker=false;
        this.mhayTasaCliente=false;
        this.mhayModulo=false;
        this.mhayAnioIni=false;
        this.mhayAnioFin=false;
        this.mhayPrimaNetaCanal=false;//mhayPrimaNetaGrossUp
        this.mhayPrimaNetaBroker=false;//mhayTasaComisionPrimaNeta
        this.mhayAnioMaximo=false;
        this.mhayAnioMinimo=false;
        this.mhayFechaInicio=false;
        this.mhayFechaFin=false;
        this.mhayMontoCreditoIni=false;
        this.mhayMontoCreditoFin=false;
        //this.mhayAnioFinContrato=false;
        this.mhayRol=false;

        //NDIF_TYPE	NFLAG_GRUPO	SCAMPO
        this.mhaySumaAsegurada=true;//Para toda configuración
        this.mhayFechaInicio=true;/////////
        this.mhayFechaFin=true;/////////
        this.mhayTasaComisionBroker=true;/////////
        this.mhayTasaComisionCanal=true;/////////
        if(tipo==1 && grupo==1){console.log("getCampos||tipo:"+tipo+"|grupo:"+grupo);
          this.mhayModulo=true;
          this.mhayAnioIni=true;
          this.mhayFechaInicio=false;
          this.mhayFechaFin=false;
        }
        else if(tipo==2 && grupo==1){console.log("getCampos||tipo:"+tipo+"|grupo:"+grupo);
          this.mhayModulo=true;
          this.mhayAnioMaximo=true;
          this.mhayAnioMinimo=true;
        }
        else if(tipo==2 && grupo==2){console.log("getCampos||tipo:"+tipo+"|grupo:"+grupo);
          this.mhayModulo=true;
          this.mhayFechaInicio=false;///
        }
        else if(tipo==2 && grupo==3){console.log("getCampos||tipo:"+tipo+"|grupo:"+grupo);
          this.mhayTasaCompania=true;
          this.mhayTasaCliente=true;
        }
        else if(tipo==2 && grupo==4){console.log("getCampos||tipo:"+tipo+"|grupo:"+grupo);
          this.mhayMontoCreditoIni=true;
          this.mhayMontoCreditoFin=true;
        }
        else if(tipo==2 && grupo==5){console.log("getCampos||tipo:"+tipo+"|grupo:"+grupo);
          this.mhayModulo=true;
          this.mhayAnioIni=true;
          this.mhayAnioFin=true;
        }
        else if(tipo==2 && grupo==6){console.log("getCampos||tipo:"+tipo+"|grupo:"+grupo);
          this.mhayMontoCreditoIni=true;
          this.mhayMontoCreditoFin=true;
        }
        else if(tipo==3 && grupo==1){console.log("getCampos||tipo:"+tipo+"|grupo:"+grupo);
          this.mhayMontoCreditoIni=true;
          this.mhayMontoCreditoFin=true;
          this.mhayModulo=true;
          this.mhayRol=true;
        }*/
      
        console.log("|mhaySumaAsegurada:"+this.mhaySumaAsegurada+"|mhayTasaCompania:"+this.mhayTasaComisionCanal+"|mhayTasaComisionCanal:"+this.mhayTasaComisionCanal+"|mhayTasaComisionBroker:"+this.mhayTasaComisionBroker);
        console.log("|mhayTasaCliente:"+this.mhayTasaCliente+"|mhayModulo:"+this.mhayModulo+"|mhayAnioIni:"+this.mhayAnioIni+"|mhayPrimaNetaCanal:"+this.mhayPrimaNetaCanal);
        console.log("|mhayPrimaNetaBroker:"+this.mhayPrimaNetaBroker+"|mhayAnioMaximo:"+this.mhayAnioMaximo+"|mhayAnioMinimo:"+this.mhayAnioMinimo+"|mhayFechaInicio:"+this.mhayFechaInicio);
        console.log("|mhayFechaFin:"+this.mhayFechaFin+"|mhayMontoCreditoIni:"+this.mhayMontoCreditoIni+"|mhayMontoCreditoFin:"+this.mhayMontoCreditoFin+"|mhayAnioFin:"+this.mhayAnioFin+"|mhayRol:"+this.mhayRol);
      }
      ,
            (err) => { }
    );
  }
  
  setCampos(tipo:number,grupo:number,VALORES:any){

    console.log("valFIni"+this.valFIni);
    console.log("valFFin"+this.valFFin);
    this.valNSA=VALORES.NSUMAASEG;

    this.valFIni=(tipo==1 && grupo==1) || (tipo==2 && grupo==2) || VALORES.DINIVIG ===undefined || VALORES.DINIVIG ==null || VALORES.DINIVIG == "0001-01-01T00:00:00"/* || VALORES.DINIVIG == "1900-01-01T00:00:00"*/?this.valFIni/*FIN YVO-2023/11/19 new Date()*/:new Date(VALORES.DINIVIG);
    this.valFFin=(tipo==1 && grupo==1) || VALORES.DFINVIG ===undefined || VALORES.DFINVIG ==null || VALORES.DFINVIG == "0001-01-01T00:00:00"/* || VALORES.DFINVIG == "1900-01-01T00:00:00"*/?this.valFFin/*FIN YVO-2023/11/19 new Date()*/:new Date(VALORES.DFINVIG);
    
    this.valNComCanal=VALORES.NPORCENTAJECANAL;
    this.valNComBrok=VALORES.NPORCENTAJEBROKER;
    if(tipo==1 && grupo==1){console.log("setCampos||tipo:"+tipo+"|grupo:"+grupo);
      this.valModulo=VALORES.NMODULO;
      this.valNIniCre=VALORES.NANIOINI;
    }
    else if(tipo==2 && grupo==1){console.log("setCampos||tipo:"+tipo+"|grupo:"+grupo);
      this.valModulo=VALORES.NMODULO;
      this.valNEdadMax=VALORES.NEDADMAX;
      this.valNEdadMin=VALORES.NEDADMIN;
    }
    else if(tipo==2 && grupo==2){console.log("setCampos||tipo:"+tipo+"|grupo:"+grupo);
      this.valModulo=VALORES.NMODULO;
    }
    else if(tipo==2 && grupo==3){console.log("setCampos||tipo:"+tipo+"|grupo:"+grupo);
      this.valNTasaComp=VALORES.NTASACOMPANIA;
      this.valNTasaCli=VALORES.NTASACLIENTE;
    }
    else if(tipo==2 && grupo==4){console.log("setCampos||tipo:"+tipo+"|grupo:"+grupo);
      this.valNCuotaMin=VALORES.NMINCREDITO;
      this.valNCuotaMax=VALORES.NMAXCREDITO;
    }
    else if(tipo==2 && grupo==5){console.log("setCampos||tipo:"+tipo+"|grupo:"+grupo);
    this.valModulo=VALORES.NMODULO;
    this.valNIniCre=VALORES.NANIOINI;
    this.valNFinCre=VALORES.NANIOFIN;
    }
    else if(tipo==2 && grupo==6){console.log("setCampos||tipo:"+tipo+"|grupo:"+grupo);
    this.valNCuotaMin=VALORES.NMINCREDITO;
    this.valNCuotaMax=VALORES.NMAXCREDITO;
    }
    else if(tipo==3 && grupo==1){console.log("setCampos||tipo:"+tipo+"|grupo:"+grupo);
      this.valModulo=VALORES.NMODULO;
      this.valNCuotaMin=VALORES.NMINCREDITO;
      this.valNCuotaMax=VALORES.NMAXCREDITO;
      this.valNRol=VALORES.NROL;
    }
    this.mbhabilitar=false;
    //this.mSelectedGrupoId=this.mlistGrupo[0].Id==undefined?this.NGRUPO:this.mSelectedGrupoId;
    console.log("valFIni"+this.valFIni);
    console.log("valFFin"+this.valFFin);
    
    console.log("|mhaySumaAsegurada:"+this.mhaySumaAsegurada+"|mhayTasaCompania:"+this.mhayTasaComisionCanal+"|mhayTasaComisionCanal:"+this.mhayTasaComisionCanal+"|mhayTasaComisionBroker:"+this.mhayTasaComisionBroker);
    console.log("|mhayTasaCliente:"+this.mhayTasaCliente+"|mhayModulo:"+this.mhayModulo+"|mhayAnioIni:"+this.mhayAnioIni+"|valNMontoCanal:"+this.valNMontoCanal);
    console.log("|valNMontoBrok:"+this.valNMontoBrok+"|valNEdadMax:"+this.valNEdadMax+"|valNEdadMin:"+this.valNEdadMin+"|mhayFechaInicio:"+this.mhayFechaInicio);
    console.log("|mhayFechaFin:"+this.mhayFechaFin+"|valNCuotaMin:"+this.valNCuotaMin+"|valNCuotaMax:"+this.valNCuotaMax+"|mhayAnioFin:"+this.mhayAnioFin+"|mhayRol:"+this.mhayRol);
  }
  AgregarConfig() {
    debugger;
    this.validacion = '';
    this.validaSeteo();
    console.log('validaSeteo::' + this.validacion);
    if (this.validacion == 'validado') {
        this.disTipoCom = true;
        this.disGrupo = true;

        this.mhayNMODULO = false;
        this.mhayDINIVIG = false;
        this.mhayDFINVIG = false;
        this.mhayNANIOINI = false;
        this.mhayNANIOFIN = false;
        this.mhayNMINCREDITO = false;
        this.mhayNMAXCREDITO = false;
        this.mhayNTASACLIENTE = false;
        this.mhayNTASACOMPANIA = false;
        this.mhayNPORCENTAJECANAL = false;
        this.mhayNPORCENTAJEBROKER = false;
        this.mhayNMONTOCANAL = false;
        this.mhayNMONTOBROKER = false;
        this.mhayNAGE_MIN = false;
        this.mhayNAGE_MAX = false;
        this.mhayNROL = false;

        this.mhayNMODULO = ((this.mSelectedTipoComId == 1 || this.mSelectedTipoComId == 3) || 
                           (this.mSelectedTipoComId == 2 && (this.mSelectedGrupoId == 1 || this.mSelectedGrupoId == 2 || this.mSelectedGrupoId == 5))) ? true : this.mhayNMODULO;
        this.mhayDINIVIG = (this.mSelectedTipoComId == 1 || 
                            (this.mSelectedTipoComId == 2 && this.mSelectedGrupoId == 2)) ? this.mhayDINIVIG : true;
        this.mhayDFINVIG = (this.mSelectedTipoComId == 1) ? this.mhayDFINVIG : true;
        this.mhayNANIOINI = ((this.mSelectedTipoComId == 1) || 
                             (this.mSelectedTipoComId == 2 && this.mSelectedGrupoId == 5)) ? true : this.mhayNANIOINI;
        this.mhayNANIOFIN = ((this.mSelectedTipoComId == 2 && this.mSelectedGrupoId == 5)) ? true : this.mhayNANIOFIN;

        this.mhayNMINCREDITO = ((this.mSelectedTipoComId == 2 && 
                                (this.mSelectedGrupoId == 4 || this.mSelectedGrupoId == 6)) || 
                                (this.mSelectedTipoComId == 3)) ? true : this.mhayNMINCREDITO;
        this.mhayNMAXCREDITO = ((this.mSelectedTipoComId == 2 && 
                                (this.mSelectedGrupoId == 4 || this.mSelectedGrupoId == 6)) || 
                                (this.mSelectedTipoComId == 3)) ? true : this.mhayNMAXCREDITO;
        this.mhayNTASACLIENTE = (this.mSelectedTipoComId == 2 && this.mSelectedGrupoId == 3) ? true : this.mhayNTASACLIENTE;
        this.mhayNTASACOMPANIA = (this.mSelectedTipoComId == 2 && this.mSelectedGrupoId == 3) ? true : this.mhayNTASACOMPANIA;

        this.mhayNPORCENTAJECANAL = true;
        this.mhayNPORCENTAJEBROKER = true;
        this.mhayNROL = ((this.mSelectedTipoComId == 3)) ? true : this.mhayNROL;
        this.mhayNAGE_MIN = ((this.mSelectedTipoComId == 2 && this.mSelectedGrupoId == 1)) ? true : this.mhayNAGE_MIN;
        this.mhayNAGE_MAX = ((this.mSelectedTipoComId == 2 && this.mSelectedGrupoId == 1)) ? true : this.mhayNAGE_MAX;

        // Asegurarse de que valFIni y valFFin sean objetos Date
        let formattedFIni = '';
        let formattedFFin = '';
        
        if (this.valFIni instanceof Date) {
            formattedFIni = this.valFIni.toLocaleDateString('en-US').toString();
        }
        
        if (this.valFFin instanceof Date) {
            formattedFFin = this.valFFin.toLocaleDateString('en-US').toString();
        }

        this.mlistValores.push({
            INDICE: this.npolizas + 1,
            NMODULO: this.valModulo,
            DINIVIG: formattedFIni,
            DFINVIG: formattedFFin,
            NINIVIG: this.valNIniCre,
            NFINVIG: this.valNFinCre,
            NTASACLIENTE: this.valNTasaCli,
            NTASACOMPANIA: this.valNTasaComp,
            NMINCREDITO: this.valNCuotaMin,
            NMAXCREDITO: this.valNCuotaMax,
            NPORCENTAJECANAL: this.valNComCanal,
            NPORCENTAJEBROKER: this.valNComBrok,
            NMONTOCANAL: this.valNMontoCanal,
            NMONTOBROKER: this.valNMontoBrok,
            NAGE_MIN: this.valNEdadMin,
            NAGE_MAX: this.valNEdadMax,
            NEDADMIN: this.valNEdadMin,
            NEDADMAX: this.valNEdadMax,
            NSUMAASEG: this.valNSA,
            NROL: this.valNRol
        });

        this.haymlistValores = true;
        this.npolizas = this.mlistValores.length;
        console.log("|mlistValores: ");
        console.log(this.mlistValores);
        

        this.resetForm();
    } else {
        swal.fire('Error', this.validacion, 'error');
    }
}

resetForm() {
    this.valModulo = '';
    this.valFIni = '';
    this.valFFin = '';
    this.valNIniCre = '';
    this.valNFinCre = '';
    this.valNTasaCli = '';
    this.valNTasaComp = '';
    this.valNCuotaMin = '';
    this.valNCuotaMax = '';
    this.valNComCanal = '';
    this.valNComBrok = '';
    this.valNMontoCanal = '';
    this.valNMontoBrok = '';
    this.valNEdadMin = '';
    this.valNEdadMax = '';
    this.valNSA = '';
    this.valNRol = '';
}

  Editar(INDICE:number){
    INDICE=INDICE-1;
    this.valNSA=this.mlistValores[INDICE].NSUMAASEG;
    this.valFIni=(this.mSelectedTipoComId==1 || (this.mSelectedTipoComId==2 && this.mSelectedGrupoId==2))?this.valFIni:this.mlistValores[INDICE].DINIVIG;
    this.valFFin=(this.mSelectedTipoComId==1)?this.valFFin:this.mlistValores[INDICE].DFINVIG;
    this.valNComCanal=this.mlistValores[INDICE].NPORCENTAJECANAL;
    this.valNComBrok=this.mlistValores[INDICE].NPORCENTAJEBROKER;
    if(this.mSelectedTipoComId==1 && this.mSelectedGrupoId==1){console.log("Editar||this.mSelectedTipoComId:"+this.mSelectedTipoComId+"|this.mSelectedGrupoId:"+this.mSelectedGrupoId);
      this.valModulo=this.mlistValores[INDICE].NMODULO;
      this.valNIniCre=this.mlistValores[INDICE].NINIVIG;
    }
    else if(this.mSelectedTipoComId==2 && this.mSelectedGrupoId==1){console.log("Editar||this.mSelectedTipoComId:"+this.mSelectedTipoComId+"|this.mSelectedGrupoId:"+this.mSelectedGrupoId);
      this.valModulo=this.mlistValores[INDICE].NMODULO;
      this.valNEdadMax=this.mlistValores[INDICE].NAGE_MAX;
      this.valNEdadMin=this.mlistValores[INDICE].NAGE_MIN;
    }
    else if(this.mSelectedTipoComId==2 && this.mSelectedGrupoId==2){console.log("Editar||this.mSelectedTipoComId:"+this.mSelectedTipoComId+"|this.mSelectedGrupoId:"+this.mSelectedGrupoId);
      this.valModulo=this.mlistValores[INDICE].NMODULO;
    }
    else if(this.mSelectedTipoComId==2 && this.mSelectedGrupoId==3){console.log("Editar||this.mSelectedTipoComId:"+this.mSelectedTipoComId+"|this.mSelectedGrupoId:"+this.mSelectedGrupoId);
      this.valNTasaComp=this.mlistValores[INDICE].NTASACOMPANIA;
      this.valNTasaCli=this.mlistValores[INDICE].NTASACLIENTE;
    }
    else if(this.mSelectedTipoComId==2 && this.mSelectedGrupoId==4){console.log("Editar||this.mSelectedTipoComId:"+this.mSelectedTipoComId+"|this.mSelectedGrupoId:"+this.mSelectedGrupoId);
      this.valNCuotaMin=this.mlistValores[INDICE].NMINCREDITO;
      this.valNCuotaMax=this.mlistValores[INDICE].NMAXCREDITO;
    }
    else if(this.mSelectedTipoComId==2 && this.mSelectedGrupoId==5){console.log("Editar||this.mSelectedTipoComId:"+this.mSelectedTipoComId+"|this.mSelectedGrupoId:"+this.mSelectedGrupoId);
      this.valModulo=this.mlistValores[INDICE].NMODULO;
      this.valNIniCre=this.mlistValores[INDICE].NINIVIG;
      this.valNFinCre=this.mlistValores[INDICE].NFINVIG;
    }
    else if(this.mSelectedTipoComId==2 && this.mSelectedGrupoId==6){console.log("Editar||this.mSelectedTipoComId:"+this.mSelectedTipoComId+"|this.mSelectedGrupoId:"+this.mSelectedGrupoId);
      this.valNCuotaMin=this.mlistValores[INDICE].NMINCREDITO;
      this.valNCuotaMax=this.mlistValores[INDICE].NMAXCREDITO;
    }
    else if(this.mSelectedTipoComId==3 && this.mSelectedGrupoId==1){console.log("Editar||this.mSelectedTipoComId:"+this.mSelectedTipoComId+"|this.mSelectedGrupoId:"+this.mSelectedGrupoId);
      this.valModulo=this.mlistValores[INDICE].NMODULO;
      this.valNCuotaMin=this.mlistValores[INDICE].NMINCREDITO;
      this.valNCuotaMax=this.mlistValores[INDICE].NMAXCREDITO;
      this.valNRol=this.mlistValores[INDICE].NROL;
    }
    //this.mlistValores.splice(INDICE, 1);
    this.meditando=INDICE;
  }
  Borrar(INDICE:number){
    swal.fire({
      title: 'Información',
      text: '¿Desea quitar el registro agregado?',
      icon: 'warning',
      confirmButtonText: 'Aceptar',
      cancelButtonText:'Cancelar',
      showCloseButton: true,
      showCancelButton: true,
      allowOutsideClick: false

    }).then((result) => {
        if (result.value) {
          INDICE=INDICE-1;
          this.mlistValores.splice(INDICE, 1);
          this.npolizas=this.mlistValores.length;
          for(let i=0;i<this.mlistValores.length;i++){
            this.mlistValores[i].INDICE=i+1;
            this.resetForm();
          }
          if(this.npolizas==0){
            this.haymlistValores=false;
            this.disTipoCom = false;
            this.disGrupo = false;
            this.resetForm();
          }
        }
      });
  }
  Actualizar(){
    debugger
    this.validacion='';
    this.validaSeteo();
    console.log('validaSeteo::'+this.validacion)
    if(this.validacion=='validado'){
      swal.fire({
        title: 'Información',
        text: '¿Desea actualizar el registro agregado?',
        icon: 'warning',
        confirmButtonText: 'Aceptar',
        cancelButtonText:'Cancelar',
        showCloseButton: true,
        showCancelButton: true,
        allowOutsideClick: false

      }).then((result) => {
          if (result.value) {
          this.mlistValores[this.meditando].NMODULO=this.valModulo;
          this.mlistValores[this.meditando].DINIVIG=this.valFIni===undefined || this.valFIni===null?'':this.valFIni.toString();
          this.mlistValores[this.meditando].DFINVIG=this.valFFin===undefined || this.valFFin===null?'':this.valFFin.toString();
          this.mlistValores[this.meditando].NINIVIG=this.valNIniCre;
          this.mlistValores[this.meditando].NFINVIG=this.valNFinCre;
          this.mlistValores[this.meditando].NTASACLIENTE=this.valNTasaCli;
          this.mlistValores[this.meditando].NTASACOMPANIA=this.valNTasaComp;
          this.mlistValores[this.meditando].NMINCREDITO=this.valNCuotaMin;
          this.mlistValores[this.meditando].NMAXCREDITO=this.valNCuotaMax;
          this.mlistValores[this.meditando].NPORCENTAJECANAL=this.valNComCanal;
          this.mlistValores[this.meditando].NPORCENTAJEBROKER=this.valNComBrok;
          this.mlistValores[this.meditando].NMONTOCANAL=this.valNMontoCanal;
          this.mlistValores[this.meditando].NMONTOBROKER=this.valNMontoBrok;
          this.mlistValores[this.meditando].NAGE_MIN=this.valNEdadMin;
          this.mlistValores[this.meditando].NAGE_MAX=this.valNEdadMax;
            //NANIOINI:this.valNIniCre;
          this.mlistValores[this.meditando].NSUMAASEG=this.valNSA;
            //NEDADMIN:this.valNEdadMin;
            //NEDADMAX:this.valNEdadMax;
          this.mlistValores[this.meditando].NROL=this.valNRol;
        
        this.haymlistValores=true;
        this.npolizas=this.mlistValores.length;
        console.log("|mlistValores: ");
        console.log(this.mlistValores);
        
        this.valModulo='';
        this.valFIni='';
        this.valFFin='';
        this.valNIniCre='';
        this.valNFinCre='';
        this.valNTasaCli='';
        this.valNTasaComp='';
        this.valNCuotaMin='';
        this.valNCuotaMax='';
        this.valNComCanal='';
        this.valNComBrok='';
        this.valNMontoCanal='';
        this.valNMontoBrok='';
        this.valNEdadMin='';
        this.valNEdadMax='';
        this.valNSA='';
        this.valNRol='';
        this.meditando=-1;
        }});
    }else{
      swal.fire('Error',  this.validacion ,'error');
    }
    
  }
  ChangeRamo() {console.log(this.midRamo);console.log(this.mSelectedBranchId);
    this.midRamo=this.mSelectedBranchId;
    if (this.midRamo !== '') {
      this.getProductsListByBranch(this.midRamo);
    }
    this.validaCampos();
  }
  ChangeProducto() {console.log(this.midRamo);console.log(this.mSelectedProductoId);
    this.midProducto=this.mSelectedProductoId;
    //this.validaCampos();
  }
  ChangeTipoCom() {
    console.log(this.midTipoCom);
    console.log(this.mSelectedTipoComId);
    this.midTipoCom = this.mSelectedTipoComId;
    if (!this.NPOLIZA || this.NPOLIZA === null || this.NPOLIZA === 0 ) {
        swal.fire('Error', 'Debe colocar el número de póliza', 'error');
        //
       
        this.getTypeList2(undefined);
        this.mbhabilitar = true;
        
    return;
    }
    this.mSelectedGrupoId="";
    this.mlistGrupo=[];
    this.mbhabilitar=true;
    
    /* if (this.midTipoCom !== '') {
         console.log(this.midTipoCom);
         this.getGroupListByTipoCom(this.midTipoCom);
     }*/

    //this.getTypeList(this.midTipoCom);
    this.getGroupListByTipoCom2(this.midTipoCom);
    //this.validaCampos();
}
ChangeGrupo() {
    console.log("Verificando posicion del tipo: ",this.midTipoCom); 
    console.log("Verificando la posición 1: " + this.mSelectedGrupoId);
   /* if (!this.NPOLIZA || this.NPOLIZA === null || this.NPOLIZA === 0 ) {
        swal.fire('Error', 'Debe colocar el número de póliza', 'error');

        this.mSelectedGrupoId = "";
        console.log("Verificando la posición 2: " + this.mSelectedGrupoId);
         // reset the group selection
        this.mbhabilitar=true;
       this.isPolizaInvalid = true; // Marcar el error en la póliza
    return;
    }*/
    
    //this.midGrupo = this.mSelectedGrupoId;
    /*if (this.midTipoCom !== '') {
        console.log(this.midTipoCom);
        this.getGroupListByTipoCom2(this.midTipoCom);
    }*/

    this.validaCampos();
}
  validaSeteo(){
    console.log('this.NGRUPO::'+this.NGRUPO+'||this.NTIPO::'+this.NTIPO);
    this.validacion='';
    this.validacion+=(this.valNSA===undefined || this.valNSA===null?'LLenar tipo capital ':'');
    this.validacion+=(!(this.valNComCanal!==undefined && this.valNComCanal!==null && this.valNComCanal!=0 && this.valNComBrok!==undefined && this.valNComBrok!==null && this.valNComBrok!=0)?'Campo(s) %canal (con IGV) y/o % broker (con IGV) está vacío':'');
    console.log(this.valFIni!==undefined)
    console.log(this.valFIni!==null)
    console.log(this.valFFin!==undefined)
    console.log(this.valFFin!==null)
    if((!(this.valFIni===undefined || this.valFIni===null) && !(this.valFFin===undefined || this.valFFin===null)) && this.valFIni>this.valFFin){
      this.validacion+= 'Fecha de Inicio no puede ser mayor a Fecha Fin';
    }
    else if((this.valNEdadMin!==undefined || this.valNEdadMax!==undefined || this.valNEdadMin!==null || this.valNEdadMax!==null) && this.valNEdadMin>this.valNEdadMax){
      this.validacion+= 'Edad Mínima no puede ser mayor a edad máxima';
    }
    else if((this.valNCuotaMin!==undefined || this.valNCuotaMax!==undefined || this.valNCuotaMin!==null || this.valNCuotaMax!==null) && this.valNCuotaMin>this.valNCuotaMax){
      this.validacion+= 'Cuota Mínima no puede ser mayor a cuota máxima';
    }
    else if(this.NGRUPO==1 && this.NTIPO==1){
      this.validacion+=  
              (this.valModulo===undefined || this.valModulo===null?'LLenar modulo ':'')+
              (this.valNIniCre===undefined || this.valNIniCre===null?'LLenar Inicio crédito ':'');
    }
    else if(this.NGRUPO==2 && this.NTIPO==1){
      this.validacion+= ''+
            (this.valModulo===undefined || this.valModulo===null?'LLenar modulo ':'')+
            (this.valFIni===undefined || this.valFIni===null?'LLenar correctamente fecha de inicio ':'')+
            (this.valFFin===undefined || this.valFFin===null?'LLenar correctamente fecha de fin ':'')+
            (!(this.valNEdadMin!==undefined && this.valNEdadMin!==null && this.valNEdadMax!==undefined && this.valNEdadMax!==null && this.valNEdadMax!=0)?'Campo(s) edad minima, edad maximaestá vacío':'');
    }
    else if(this.NGRUPO==2 && this.NTIPO==2){
      this.validacion+= ''+
            (this.valModulo===undefined || this.valModulo===null?'LLenar modulo ':'')+
            (this.valFFin===undefined || this.valFFin===null?'LLenar correctamente fecha de fin ':'');
    }
    else if(this.NGRUPO==2 && this.NTIPO==3){
      this.validacion+= ''+
              (this.valFIni===undefined || this.valFIni===null?'LLenar correctamente fecha de inicio ':'')+
              (this.valFFin===undefined || this.valFFin===null?'LLenar correctamente fecha de fin ':'')+
             (!(this.valNTasaCli!==undefined && this.valNTasaCli!==null && this.valNTasaCli!=0 && this.valNTasaComp!==undefined && this.valNTasaComp!==null && this.valNTasaComp!=0)?'Campo(s) tasa neta cliente y/o tasa compañia está vacío':'');
    }
    else if(this.NGRUPO==2 && this.NTIPO==4){
      this.validacion+= ''+
              (this.valFIni===undefined || this.valFIni===null?'LLenar correctamente fecha de inicio ':'')+
              (this.valFFin===undefined || this.valFFin===null?'LLenar correctamente fecha de fin ':'')+
              (!(this.valNCuotaMin!==undefined && this.valNCuotaMin!==null && this.valNCuotaMax!==undefined && this.valNCuotaMax!==null && this.valNCuotaMax!=0)?'Campo(s) cuota mínima y/o cuota máxima está vacío ':'');
    }
    else if(this.NGRUPO==2 && this.NTIPO==5){
      this.validacion+= ''+
              (this.valModulo===undefined || this.valModulo===null?'LLenar modulo ':'')+
              (this.valFIni===undefined || this.valFIni===null?'LLenar correctamente fecha de inicio ':'')+
              (this.valFFin===undefined || this.valFFin===null?'LLenar correctamente fecha de fin ':'')+
              (this.valNIniCre===undefined || this.valNIniCre===null?'LLenar Inicio crédito ':'')+
              (this.valNFinCre===undefined || this.valNFinCre===null?'LLenar Fin de crédito ':'');
    }
    else if(this.NGRUPO==2 && this.NTIPO==6){
      this.validacion+= ''+
             (!(this.valNCuotaMin!==undefined && this.valNCuotaMin!==null && this.valNCuotaMax!==undefined && this.valNCuotaMax!==null && this.valNCuotaMax!=0)?'Campo(s) cuota mínima y/o cuota máxima está vacío ':'');
    }
    else if(this.NGRUPO==3 && this.NTIPO==1){
      this.validacion+= ''+
              (this.valModulo===undefined || this.valModulo===null?'LLenar modulo ':'')+
              (this.valFIni===undefined || this.valFIni===null?'LLenar correctamente fecha de inicio ':'')+
              (this.valFFin===undefined || this.valFFin===null?'LLenar correctamente fecha de fin ':'')+
              (!(this.valNCuotaMin!==undefined && this.valNCuotaMin!==null && this.valNCuotaMax!==undefined && this.valNCuotaMax!==null && this.valNCuotaMax!=0)?'Campo(s) cuota mínima y/o cuota máxima está vacío ':'');
    }
    if(this.validacion==''){
      this.validacion='validado';
    }
  }
  ActualizaComision(){
    debugger
    this.validacion='';
    this.validaSeteo();
    console.log('validaSeteo::'+this.validacion)
    if(this.validacion=='validado'){
      swal.fire({
        title: 'Información',
        text: '¿Desea guardar la modificación del registro?',
        icon: 'warning',
        confirmButtonText: 'Aceptar',
        cancelButtonText:'Cancelar',
        showCloseButton: true,
        showCancelButton: true,
        allowOutsideClick: false

        }).then((result) => {
        if (result.value) {
          this.mlistValores.push(
            {
              INDICE:this.npolizas+1,
              NMODULO:this.valModulo,
              DINIVIG:this.valFIni===undefined || this.valFIni===null?'':this.valFIni.toLocaleDateString('en-US').toString(),
              DFINVIG:this.valFFin===undefined || this.valFFin===null?'':this.valFFin.toLocaleDateString('en-US').toString(),
              NINIVIG:this.valNIniCre,
              NFINVIG:this.valNFinCre,
              NTASACLIENTE:this.valNTasaCli,
              NTASACOMPANIA:this.valNTasaComp,
              NMINCREDITO:this.valNCuotaMin,
              NMAXCREDITO:this.valNCuotaMax,
              NPORCENTAJECANAL:this.valNComCanal,
              NPORCENTAJEBROKER:this.valNComBrok,
              NMONTOCANAL:this.valNMontoCanal,
              NMONTOBROKER:this.valNMontoBrok,
              NAGE_MIN:this.valNEdadMin,
              NAGE_MAX:this.valNEdadMax,
              NSUMAASEG:this.valNSA,
              NORDEN:this.GCONFIG.NORDEN,//ORDEN--KEY
              NROL:this.valNRol
            }
          );

          let data: any = {
                            data:JSON.stringify(this.mlistValores),
                            ramo:parseInt(this.mSelectedBranchId),
                            producto:parseInt(this.mSelectedProductoId),
                            tipo:parseInt(this.mSelectedTipoComId),
                            grupo:parseInt(this.mSelectedGrupoId),
                            poliza:this.NPOLIZA,
                            NUSERCODE:JSON.parse(localStorage.getItem("currentUser")).id
                          };
          console.log(data);
          //(data: any, poliza :number, ramo:number,producto: number, tipo:number,grupo:number,usuario:number)   
          this.ComisionesDiferenciadasService.ActualizaComision(data).subscribe( 
            (res) => {
              this.bguardo = res[0].Id;
              if(this.bguardo!=0){
                swal.fire('Error',  this.bguardo==-1?'ERROR AL ACTUALIZAR POLIZA':
                                    this.bguardo==-2?'POLIZA NO TIENE ESE RAMO Y PRODUCTO':
                                    this.bguardo==-3?'ERROR AL ACTUALIZAR DETALLE':
                                    res[0].Description=='ok'?this.mensaje:res[0].Description
                        ,'error');
              }else{
                swal.fire('Información',res[0].Description=='ok'?this.mensaje:res[0].Description
                        ,'success');
                this.reference.close();
              }
            },
            (err) => { }
          );
          this.mlistValores=[];
        }
      });
    }else{
      swal.fire('Error',  this.validacion ,'error');
    }
  }

  Guardar(){
    swal.fire({
        title: 'Información',
        text: '¿Desea guardar la información registrada?',
        icon: 'warning',
        confirmButtonText: 'Aceptar',
        cancelButtonText: 'Cancelar',
        showCloseButton: true,
        showCancelButton: true,
        allowOutsideClick: false
    }).then((result) => {
        if (result.value) {
            let data: any = {
                data: JSON.stringify(this.mlistValores),
                ramo: parseInt(this.mSelectedBranchId),
                producto: parseInt(this.mSelectedProductoId),
                tipo: parseInt(this.mSelectedTipoComId),
                grupo: parseInt(this.mSelectedGrupoId),
                poliza: this.NPOLIZA,
                NUSERCODE: JSON.parse(localStorage.getItem("currentUser")).id
            };
            this.ComisionesDiferenciadasService.setListaComisiones(data).subscribe(
                (res) => {
                    this.bguardo = res[0].Id;
                    if (this.bguardo != 0) {
                        let mensaje = '';
                        switch (this.bguardo) {
                            case -1:
                                mensaje = 'YA EXISTE ESA POLIZA CON ESE TIPO Y GRUPO';
                                break;
                            case -2:
                                mensaje = 'POLIZA NO TIENE ESE RAMO Y PRODUCTO';
                                this.borrarTodo();
                                break;
                            case -10:
                                mensaje = 'YA EXISTE CONFIGURACIÓN TIPO - GRUPO - POLIZA';
                                break;
                            case 11:
                                mensaje = 'CRUCE ENTRE FECHAS';
                                break;
                            case 12:
                                mensaje = 'EXISTE CONFIG';
                                break;
                            default:
                                mensaje = 'ERROR';
                                break;
                        }
                        swal.fire('Error', mensaje, 'error');
                    } else {
                        swal.fire('Información', res[0].Description == 'ok' ? this.mensaje : res[0].Description, 'success');
                        this.reference.close();
                    }
                },
                (err) => {}
            );
        }
    });
}
borrarTodo() {
    this.mlistValores = [];
    this.npolizas = this.mlistValores.length;
    this.haymlistValores = false;
    this.mbhabilitar = true;
    this.disTipoCom = false;
    this.disGrupo = false;
    this.mSelectedTipoComId="";
    this.mSelectedGrupoId="";
    this.getTypeList(undefined);
    this.NPOLIZA = null;

}

//Función para procesar los reportes
ProcessBuscar() {
    console.log('ProcessBuscar');
    //comisionesDiferenciadasResults
    this.mlistToShow = [];
    this.misError = false;
    if (this.NPOLIZA == null || this.NPOLIZA==0) {
        this.misError = true;
        this.mUnselectedItemMessage = 'llenar el campo de póliza.';
    }

    if (this.misError == true) {
        swal.fire({
            title: 'Información',
            text: this.mUnselectedItemMessage,
            icon: 'warning',
            confirmButtonText: 'Continuar',
            allowOutsideClick: false

        }).then((result) => {
            if (result.value) {
            }
        });
        this.misLoading = false;
        err => {
            this.misLoading = false;
        }
    } else {
        let data={
            nBranch:this.NRAMO, 
            nProduct:this.NPRODUCT, 
            nPolicy:this.NPOLIZA
        }
        this.ComisionesDiferenciadasService.GetComisDifConfigsXPoliza(data).subscribe(
                            res => {
                                this.mcomisionesDiferenciadasResults=res;
                                if(this.mcomisionesDiferenciadasResults.length=0){
                                  this.ComisionesDiferenciadasService.ValidaPoliza(data).subscribe(
                                    res => {
                                      this.mcomisionesDiferenciadasPolizaResults=res;
                                      if(this.mcomisionesDiferenciadasPolizaResults.length=0){
                                        swal.fire('Error', 'PÓLIZA NO EXISTE', 'error');
                                      }else{
                                        swal.fire('Error', 'La póliza ingresada no tiene comisión diferenciada', 'error');
                                      }
                                      this.misLoading = false;
    
                                    },
                                    error => {
                                        this.mfoundResults = [];
                                        this.mtotalItems = 0;
                                        this.misLoading = false;
                                        swal.fire('Información', this.mgenericErrorMessage, 'error');
                                    }
                                  )
                                }
                                this.misLoading = false;

                            },
                            error => {
                                this.mfoundResults = [];
                                this.mtotalItems = 0;
                                this.misLoading = false;
                                swal.fire('Información', this.mgenericErrorMessage, 'error');
                            }
        );
    }
}
padTo2Digits(num) {
  return num.toString().padStart(2, '0');
}

formatDate(date) {
  return [
    this.padTo2Digits(date.getDate()),
    this.padTo2Digits(date.getMonth() + 1),
    date.getFullYear(),
  ].join('/');
}
}
