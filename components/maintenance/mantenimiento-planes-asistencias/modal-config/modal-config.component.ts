import { Component, Input, OnInit, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import { BsDatepickerConfig } from 'ngx-bootstrap/datepicker';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { PlanesAsistenciasService } from '../../../../services/maintenance/planes-asistencias/planes-asistencias.service';
import swal from 'sweetalert2';
import { toInteger } from '@ng-bootstrap/ng-bootstrap/util/util';
import { extend } from 'jquery';

@Component({
    selector: 'modal-config',
    templateUrl: './modal-config.component.html',
    styleUrls: ['./modal-config.component.css']
})

export class MantenimientoPlanAsistModalConfigComponent implements OnInit, AfterViewInit {
    @Input() public reference: any;
    @Input() public nTipoVentana: number;
    @Input() public NPOLIZA: number;
    @Input() public NRAMO: number;
    @Input() public NPRODUCT: number;
    @Input() public NPLAN: number;
    // @Input() public NTIPO: number;
    // @Input() public NGRUPO: number;
    @Input() public GCONFIG: any;			  

    gotNPlan: any = null;
    mplanesAsistenciasResults: any[] = [];
    mreporteProvicomisionesResults: any[] = [];
    template: any = {}
    mtitle: string;
    msubtitle: string;
    bguardo: number;
    nconfigs: number = 0;
    meditando: number = -1;
    mlistToShow: any = [];
    currentPage = 1;
    itemsPerPage = 10;
    totalItems = 0;
    maxSize = 10;
    mUnselectedItemMessage: any = '';
    mStartDateSelected: any = '';
    mNBranchSelected: any = '';
    mEndDateSelected: any = '';
    searchText: string = '';

    mlistServiciosXPlanes: any[] = [];
    mlistRoles: any[] = [];
    mlistModulos: any[] = [];
    mlistCobertura: any[] = [];
    mlistProduct: any = [];
    mlistRamo: any = [];
    mbranchTypeList: any[] = [];
    mlistTipoPlan: any[] = [];
    mlistServicio: any[] = [];
    mlistCampos: any[] = [];
    mlistValores: any = [];

    coberId: any = 0;
    coberIdSend: any = 0;
    coberText: any = '';
    coberTextSend: any = '';
    mtype: any = 'a';
    midRamo: any = '';
    midProducto: any = '';
    midTipoPlan: any = '';
    midGrupo: any = '';
    mselectedServicioId: any = '';
    mselectedCoberturaId: any = '';
    mSelectedBranchId: any = '';
    mSelectedProductoId: any = '';
    mSelectedTipoPlanId: any = '';
    mSelectedGrupoId: any = '';
    mbranch: any = '';

    mEncontroModulo: boolean = true;
    haymlistValores: boolean = false;
    valModulo: any = '';
    valModuloOld: any = '';
    valNIniCre: any = '';
    valNIniCreOld: any = '';
    valFIni: any = '';
    valFIniOld: any = '';
    valFFin: any = '';
    valFFinOld: any = '';
    valNTasaCli: any = '';
    valNTasaCliOld: any = '';
    valNTasaComp: any = '';
    valNTasaCompOld: any = '';
    valNComBrok: any = '';
    valNComBrokOld: any = '';
    valNComCanal: any = '';
    valNComCanalOld: any = '';
    valNMontoBrok: any = '';
    valNMontoBrokOld: any = '';
    valNMontoCanal: any = '';
    valNMontoCanalOld: any = '';
    valNCuotaMin: any = '';
    valNCuotaMinOld: any = '';
    valNCuotaMax: any = '';
    valNCuotaMaxOld: any = '';
    valNSA: any = '';
    valNSAOld: any = '';
    valNRol: any = '';
    valNRolOld: any = '';
    valNEdadMin: any = '';
    valNEdadMinOld: any = '';
    valNEdadMax: any = '';
    valNEdadMaxOld: any = '';

    mhayNMODULO: boolean;
    mhayDINIVIG: boolean;
    mhayDFINVIG: boolean;
    mhaySESTADO: boolean;
    mhayNINIVIG: boolean;
    mhayNFINVIG: boolean;
    mhayNTASACLIENTE: boolean;
    mhayNTASACOMPANIA: boolean;
    mhayNMINCREDITO: boolean;
    mhayNMAXCREDITO: boolean;
    mhayNPORCENTAJECANAL: boolean;
    mhayNPORCENTAJEBROKER: boolean;
    mhayNMONTOCANAL: boolean;
    mhayNMONTOBROKER: boolean;
    mhayNAGE_MIN: boolean;
    mhayNAGE_MAX: boolean;
    mhayNANIOINI: boolean;
    mhayNSUMAASEG: boolean;
    mhayNEDADMIN: boolean;
    mhayNEDADMAX: boolean;
    mhayNROL: boolean;

    mhaySumaAsegurada: boolean;
    mhayTasaCompania: boolean;
    mhayTasaComisionCanal: boolean;
    mhayTasaComisionBroker: boolean;
    mhayTasaCliente: boolean;
    mhayModulo: boolean;
    mhayAnioIni: boolean;
    mhayPrimaNetaCanal: boolean;
    mhayPrimaNetaBroker: boolean;
    mhayAnioMaximo: boolean;
    mhayAnioMinimo: boolean;
    mhayFechaInicio: boolean;
    mhayFechaFin: boolean;
    mhayMontoCreditoFin: boolean;
    mhayMontoCreditoIni: boolean;
    mhayAnioFinContrato: boolean;
    mhayRol: boolean;

    misError: boolean = false;
    mbhabilitar: boolean = true;
    misLoading: boolean = false;
    mbsConfig: Partial<BsDatepickerConfig>;
    mbsValueIni: Date = new Date();
    mbsValueFin: Date = new Date();
    mbsValueFinMax: Date = new Date();
    disRamo: Boolean;
    disProducto: Boolean;
    disPoliza: Boolean;
    disTipoPlan: Boolean;
    disGrupo: Boolean;

    public mmaxSize = 5;
    public mtotalItems = 0;
    public mfoundResults: any = [];
    public mgenericErrorMessage = 'Ha ocurrido un error inesperado. Por favor contáctese con soporte.';
    public mnotfoundMessage: string = 'No se encontraron registros';

    constructor(
        private modalService: NgbModal,
        private PlanesAsistenciasService: PlanesAsistenciasService
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

    mostrarModal = (content: any) => {
        this.modalService.open(content, { backdrop: 'static', size: 'lg', keyboard: false, centered: true });
        this.coberIdSend = 0;
        this.coberTextSend = '';
        this.searchText = '';
        this.GetCoverAdicional(this.mSelectedBranchId, this.mSelectedProductoId);
    }

    buscar = (data) => {
        this.mlistToShow = this.mlistCobertura.filter(x => x.Description.toLowerCase().includes(data.toLowerCase()));
    }

    selectCober = (item) => {
        this.coberId = item.Id;
        this.coberText = item.Description;
    }

    agregarCobertura = () => {
        this.coberIdSend = this.coberId;
        this.coberTextSend = this.coberText;
        this.coberId = 0;
        this.coberText = '';
        this.searchText = '';
    }

    pageChanged(currentPage) {
        this.currentPage = currentPage;
        this.mlistToShow = this.mlistCobertura.slice(
            (this.currentPage - 1) * this.itemsPerPage,
            this.currentPage * this.itemsPerPage
        );
    }

    @ViewChild('ida', { static: false }) ida!: ElementRef;
    @ViewChild('idb', { static: false }) idb!: ElementRef;

    // Método para simular el clic en el input
    simularClicEnInput() {
        if (this.GCONFIG === undefined || this.GCONFIG === null) {
            this.ida.nativeElement.click();
        } else {
            console.log("this.GCONFIG.NTYPEPLAN" + this.GCONFIG.NTYPEPLAN);
            if (this.GCONFIG.NTYPEPLAN == 2) {
                this.idb.nativeElement.click();
            } else {
                this.ida.nativeElement.click();
            }
        }
    }

    async ngAfterViewInit() {
        this.simularClicEnInput();
    }
    async ngOnInit() {
        this.mlistRoles = [];
        this.getServicesList();
        this.getRolesList();
        //this.valNRol=this.mlistRoles[0].Id;
        if (this.nTipoVentana == 0) {
            this.mtitle = "Registrar planes a la Póliza";
        } else if (this.nTipoVentana == 1) {
            this.mtitle = "Modificar planes a la Póliza";
        } else if (this.nTipoVentana == 2) {
            this.mtitle = "Detalle del Plan";
        }
        if (this.nTipoVentana != 2) {
            if (this.nTipoVentana != 3) {
                if (!this.esnumeronulocero(this.NPOLIZA) && !this.esnumeronulocero(this.NRAMO) && !this.esnumeronulocero(this.NPRODUCT)) {
                    this.getPlanList(this.NPOLIZA, this.NRAMO, this.NPRODUCT);
                }
            }
            // Configuracion del Template

            this.mbsValueIni = new Date(this.mbsValueIni.getFullYear(), this.mbsValueIni.getMonth(), 1);
            this.getBranchList();
            if (this.NRAMO !== undefined && this.NRAMO != 0) {
                this.mSelectedBranchId = this.NRAMO;

                if (this.NPRODUCT !== undefined && this.NPRODUCT != 0) {
                    this.getProductsListByBranch(this.NRAMO);
                    this.mSelectedProductoId = this.NPRODUCT;
                }else{
                    this.mSelectedProductoId = -1;
                }
            }else{
                this.PlanesAsistenciasService.GetBranchList().subscribe(
                    (res) => {
                        this.mbranchTypeList = res;
                        this.mSelectedBranchId = -1;
                        this.mSelectedProductoId = -1;
                    },
                            (err) => { }
                    );
            }

        }

        if (this.nTipoVentana != 0) {
            this.disRamo = this.NRAMO !== undefined && this.NRAMO != 0 ? true : false;
            this.disProducto = this.NPRODUCT !== undefined && this.NPRODUCT != 0 ? true : false;
            this.disPoliza = this.NPOLIZA !== undefined && this.NPOLIZA != 0 ? true : false;
        }

        if (this.nTipoVentana != 2) {
            this.validaCampos();
        }
        if (this.GCONFIG === undefined) {
            console.log("|GCONFIG:");
        } else {
            console.log("|GCONFIG:");
            console.log(this.GCONFIG);
        }

        if (this.nTipoVentana == 2) {
            this.gotNPlan = this.NPLAN;
            this.GetServicioXPlan();
        }

        if (this.nTipoVentana == 3) {
            this.setCampos(this.NPLAN, this.GCONFIG);
        }

    }
    esnumeronulo(number: number): boolean {
        if (number === null || number === undefined)
            return true;
        return false;
    }
    esnumeronulocero(number: number): boolean {
        console.log("esnumeronulocero:" + number);
        if (number === null || number === undefined || number == 0)
            return true;
        return false;
    }
    onPaste(event: any, typeText: string, longitud: number): any {
        const inputElement = event.target as HTMLInputElement;
        const startPosition = inputElement.selectionStart;
        const endPosition = inputElement.selectionEnd;

        console.log('Start position:', startPosition);
        console.log('End position:', endPosition);
        let regextext = '[0-9]'
        event.preventDefault();
        let pastetext = (event.clipboardData).getData("text");
        let valorNuevo;
        let valorActual = event.target.value;
        const position = event.target.selectionStart;
        const inputChar = String.fromCharCode(event.charCode);
        if (typeText == '1')
            regextext = '^([0-9]{0,' + longitud + '})?$';
        else if (typeText == '2')
            regextext = '^([0-9A-Za-zñÑÁÉÍÓÚáéíóúÄËÏÖÜäëïöü]{0,' + longitud + '})?$';
        else if (typeText == '3')
            regextext = '^([0-9A-Za-zñÑÁÉÍÓÚáéíóúÄËÏÖÜäëïöü ]{0,' + longitud + '})?$';
        else if (typeText == '4')
            regextext = '^([a-zA-ZñÑÁÉÍÓÚáéíóúÄËÏÖÜäëïöü0-9-,:()&$#\'. ]{0,' + longitud + '})?$';
        else if (typeText == '5')
            regextext = '^([A-Za-zñÑÁÉÍÓÚáéíóúÄËÏÖÜäëïöü ]{0,' + longitud + '})?$';
        else if (typeText == '6')
            regextext = '^([0-9A-Za-z._@-]{0,' + longitud + '})?$';
        else if (typeText == '7')
            regextext = '^([0-9bfBF-]{0,' + longitud + '})?$';
        else if (typeText == '8')
            regextext = '^([0-9]{0,' + longitud + '})?(.{1}[0-9]{0,6})?$';

        if (position != 0) {
            if (startPosition != endPosition) {
                if (startPosition != 0) {
                    valorNuevo = valorActual.substring(0, startPosition) + pastetext + valorActual.substring(endPosition, valorActual.length);
                } else {
                    console.log("valorActual.substring(endPosition, valorActual.length):" + valorActual.substring(endPosition, valorActual.length));
                    console.log("valorActual.length:" + valorActual.length);
                    console.log("pastetext:" + pastetext);

                    valorNuevo = '' + pastetext + valorActual.substring(endPosition, valorActual.length);
                }
            } else {
                if (pastetext == '0' && position == 0) {
                    return valorActual;
                } else {
                    if (longitud < valorActual.length) {
                        //event.target.value=valorActual;
                        console.log("valorActual:" + valorActual); return valorActual;
                    }
                    valorNuevo = valorActual.substring(0, position) + pastetext + valorActual.substring(position, valorActual.length);
                }
            }
        } else {
            if (valorActual.length == endPosition) {
                valorNuevo = pastetext;
            }
            else {
                valorNuevo = pastetext + valorActual.substring(endPosition, valorActual.length);
            }
        }
        let patron = RegExp(regextext);
        console.log(patron);
        if (!patron.test(valorNuevo)) {
            console.log("valorActual a:" + valorActual); return valorActual;
        }
        if (valorNuevo.split('.').length > 2 && typeText == '8') {
            console.log("valorActual b:" + valorActual); return valorActual;
        }
        if (longitud == 3 && valorNuevo.split('.')[0].length == longitud && valorNuevo != 100 && typeText == '8') {
            console.log("valorActual c:" + valorActual); return valorActual;
        }
        if (valorNuevo.length > longitud) {
            console.log("valorActual d:" + valorActual); return valorActual;
        }

        console.log("valorActual:" + valorActual);
        console.log("length:" + valorActual.length);
        console.log("position:" + position);
        console.log("inputChar:" + inputChar);
        console.log("valorNuevo:" + valorNuevo);
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

    onChange(e) {
        this.mtype = e.target.value;
        console.log('New Value|this.mtype::' + this.mtype);
        if (this.mtype == 'a') {
            this.valNTasaCli = '';
            this.valNTasaComp = '';
        } else {
            this.valNMontoBrok = '';
            this.valNMontoCanal = '';
        }
    }

    textValidate(event: any, typeText: string, longitud: number): any {
        const inputElement = event.target as HTMLInputElement;
        const startPosition = inputElement.selectionStart;
        const endPosition = inputElement.selectionEnd;

        console.log('Start position:', startPosition);
        console.log('End position:', endPosition);

        event.preventDefault();
        let valorNuevo;
        let valorActual = event.target.value;
        const position = event.target.selectionStart;
        const inputChar = String.fromCharCode(event.charCode);

        if (typeText == '1' || typeText == '2' || typeText == '3' || typeText == '4' || typeText == '5' || typeText == '6' || typeText == '7') {

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
                console.log("valorActual:" + valorActual); return valorActual;
            }
            //event.target.value=this.textValidate(event, typeText);
        } else {
            if (typeText == '8') {
                let pattern = new RegExp('[0-9.]');
                if (!pattern.test(inputChar)) {
                    //event.target.value=valorActual;
                    console.log("valorActual a:" + valorActual); return valorActual;
                }
                if (inputChar == '.' && valorActual.split('.').length > 1) {
                    //event.target.value=valorActual;
                    console.log("valorActual b:" + valorActual); return valorActual;
                }
            }
        }
        if (valorActual == '0' && inputChar != '0' && (typeText == '1' || (typeText == '8' && inputChar != '.' && startPosition != endPosition))) {
            valorNuevo = inputChar;
        } else {
            if (position != 0) {
                if (startPosition != endPosition) {
                    if (startPosition != 0) {
                        valorNuevo = valorActual.substring(0, startPosition) + inputChar + valorActual.substring(endPosition, valorActual.length);
                    } else {
                        console.log("valorActual.substring(endPosition, valorActual.length):" + valorActual.substring(endPosition, valorActual.length));
                        console.log("valorActual.length:" + valorActual.length);
                        console.log("inputChar:" + inputChar);

                        valorNuevo = '' + inputChar + valorActual.substring(endPosition, valorActual.length);
                    }
                } else {
                    if (inputChar == '0' && position == 0) {
                        return valorActual;
                    } else {
                        if (longitud <= valorActual.length) {
                            if (typeText != '8') {
                                console.log("valorActual c:" + valorActual); return valorActual;
                            }
                        }
                        valorNuevo = valorActual.substring(0, position) + inputChar + valorActual.substring(position, valorActual.length);
                    }
                }
            } else {
                if (valorActual.length == endPosition) {
                    valorNuevo = inputChar;
                }
                else {
                    valorNuevo = inputChar + valorActual.substring(endPosition, valorActual.length);
                }
            }
            if ((valorNuevo.split('.').length > 2 || valorNuevo.split('.')[0].length > longitud) && typeText == '8') {
                console.log("valorActual d:" + valorActual); return valorActual;
            }
            if (typeText == '8') {
                if (!RegExp('^([0-9]{0,' + longitud + '})?(.{1}[0-9]{0,6})?$').test(valorNuevo)) {
                    console.log("valorActual d:" + valorActual); return valorActual;
                }
                if (longitud == 3 && valorNuevo.split('.')[0].length == longitud && valorNuevo != 100) {
                    console.log("valorActual e:" + valorActual); return valorActual;
                }
            }

            console.log("valorActual:" + valorActual);
            console.log("length:" + valorActual.length);
            console.log("position:" + position);
            console.log("inputChar:" + inputChar);
            console.log("valorNuevo:" + valorNuevo);
            // 1|Numericos
            // 2|Alfanumericos sin espacios
            // 3|Alfanumericos con espacios
            // 4|LegalName
            // 5|Solo texto
            // 6|Email
            // 7|Comprobante rebill
            // 8|Monto Dinero|longitud 3 porcentaje
        }
        console.log("valorNuevo:" + valorNuevo);
        return valorNuevo;
    }

    validateDecimal(int: any, decimal: any, event: any/*, val: any*/) {

        console.log(event.data);
        console.log(event.target.value);
        //const int:any='1,4';

        let pattern;
        let patternb;

        let valores: any = event.data.split('.');
        console.log('|valores::' + valores);

        if ((valores != null && valores != "")) {
            //switch (textType) {
            //case 1: { // Numericos
            pattern = new RegExp('[0-9.]');
            //const expresion = new RegExp('^[0-9]{' + int + '}(\.[0-9]{' + decimal + '})?$');
            /*if (!pattern.test(String.fromCharCode(event.data.charCode))) {
              event.preventDefault();
             
          }else{console.log("preventDefault4");*/

            //let pattern;
            //let patternb;
            let patternc;
            if (valores.length > 2) {
                console.log("preventDefault1");
                event.preventDefault();
                //return val;
            }
            else {
                for (let i = 0; i < valores.length; i++) {
                    console.log(valores[i]);
                    if (valores[i] != "") {
                        let maxmin = i == 0 ? int.split(',') : decimal.split(',');
                        console.log('|' + valores[i].length + '|' + maxmin[0] + '|' + maxmin[1]);
                        if (valores[i].length >= Number.parseInt(maxmin[0]) && valores[i].length <= Number.parseInt(maxmin[1])) {
                            let patron = new RegExp('[0-9]{' + valores[i].length + '}');
                            if (!patron.test(valores[i])) {
                                console.log("preventDefault2");
                                event.preventDefault();
                                //return val;
                            } else {
                                console.log("OK");
                                //this.nopreventDefault();
                                //return event;
                            }
                        }
                        else {
                            console.log("preventDefault3");
                            event.preventDefault();
                            //return val;
                        }
                    }
                }
            }
            //}
        } else {

            console.log("preventDefault5");
            event.preventDefault();
        }

    }

    validaCampos() {
        if (!this.esnumeronulocero(this.NPOLIZA) && !this.esnumeronulocero(this.mSelectedBranchId) && !this.esnumeronulocero(this.mSelectedProductoId) && this.nTipoVentana != 3) {
            this.getPlanList(this.NPOLIZA, this.mSelectedBranchId, this.mSelectedProductoId);
        }

        if ((this.mSelectedBranchId === null || this.mSelectedBranchId === undefined || this.mSelectedBranchId == '' ||
            this.mSelectedProductoId === null || this.mSelectedProductoId === undefined || this.mSelectedProductoId == '' ||
            this.mSelectedTipoPlanId === null || this.mSelectedTipoPlanId === undefined || this.mSelectedTipoPlanId == '' ||
            this.NPOLIZA === null || this.NPOLIZA === undefined || this.NPOLIZA.toString() == '' || this.NPOLIZA <= 0) && this.nTipoVentana != 2) {
            this.mbhabilitar = true;
        } else {
            this.mbhabilitar = false;
        }

        this.msubtitle = (this.nTipoVentana == 0 ? "Registrar " : this.nTipoVentana == 1 ? "Modificar " : this.nTipoVentana == 2 ? "" : "") + "Configuración";
        console.log("mbhabilitar:" + this.mbhabilitar);
        console.log("|mSelectedBranchId:" + this.mSelectedBranchId + "|mSelectedProductoId:" + this.mSelectedProductoId + "|NPOLIZA:" + this.NPOLIZA + "|mSelectedTipoPlanId:" + this.mSelectedTipoPlanId + "|mSelectedGrupoId:" + this.mSelectedGrupoId);
        console.log("|disTipoPlan:" + this.disTipoPlan + "|disGrupo:" + this.disGrupo + "|nTipoVentana:" + this.nTipoVentana);

    }

    GetServicioXPlan() {
        if (this.NPLAN != null && this.NPLAN != undefined && this.NPLAN != 0) {
            let data = {
                nPlan: this.NPLAN,
                nUsercode: JSON.parse(localStorage.getItem("currentUser")).id,
                nBranch: this.NRAMO,
                nProduct: this.NPRODUCT,
                nPolicy: this.NPOLIZA
            }
            this.PlanesAsistenciasService.GetServicioXPlan(data).subscribe(
                (res) => {
                    console.log(res);
                    this.mlistServiciosXPlanes = res;
                    console.log(this.mlistServiciosXPlanes);
                },
                (err) => {
                    swal.fire('Información', this.mgenericErrorMessage, 'error');
                }
            );
        }
    }
    getProductsListByBranch(idRamo: any) {
        this.PlanesAsistenciasService.GetProductsList(idRamo).subscribe(
            (res) => {
                this.mlistProduct = res;
                if (res.length > 0 && !this.esnumeronulo(res[0].Id)) {
                    this.mSelectedProductoId = res[0].Id;
                }
            },
            (err) => { }
        );
    }

    getBranchList() {
        this.PlanesAsistenciasService.GetBranchList().subscribe(
            (res) => {
                this.mbranchTypeList = res;
            },
            (err) => { }
        );
    }

    getRolesList() {
        this.PlanesAsistenciasService.GetRolesList().subscribe(
            (res) => {
                this.mlistRoles = res;
                this.valNRol = this.mlistRoles[0].Id;
                console.log('this.mlistRoles[' + 0 + '].Id::' + this.mlistRoles[0].Id);
                for (let i = 0; i < this.mlistRoles.length; i++) {
                    console.log('this.mlistRoles[' + i + ']::' + this.mlistRoles[i]);
                    console.log('this.mlistRoles[' + i + '].Id::' + this.mlistRoles[i].Id);
                }
            },
            (err) => { }
        );
    }

    getServicesList() {
        this.PlanesAsistenciasService.GetServicesList().subscribe(
            (res) => {
                this.mlistServicio = res;
            },
            (err) => { }
        );
    }
    GetCoverAdicional = (ramo: number, producto: number) => {
        this.PlanesAsistenciasService.GetCoverAdicional(ramo, producto).subscribe(
            (res) => {
                this.currentPage = 1;
                this.mlistCobertura = res;
                this.totalItems = this.mlistCobertura.length;
                this.mlistToShow = this.mlistCobertura.slice(
                    (this.currentPage - 1) * this.itemsPerPage,
                    this.currentPage * this.itemsPerPage
                );
            },
            (err) => {
                swal.fire('Información', this.mgenericErrorMessage, 'error');
            }
        );
    }
    validaServicios(id: number) {
        let valor = 0;
        for (let i = 0; i < this.mlistValores.length; i++) {
            if (this.mlistValores[i].Id == id) {
                valor = 1;
            }
        }
        if (valor == 1)
            return true;
        return false;
    }
    getPlanList(poliza: number, ramo: number, producto: number) {
        this.PlanesAsistenciasService.GetPlanList(poliza, ramo, producto).subscribe(
            (res) => {
                console.log(res);
                if (!this.esnumeronulocero(res.Id)) {
                    this.mSelectedTipoPlanId = res.Id;
                    if ((!this.esnumeronulocero(this.mSelectedBranchId) && !this.esnumeronulocero(this.mSelectedProductoId) &&
                        !this.esnumeronulocero(this.mSelectedTipoPlanId) && !this.esnumeronulocero(this.NPOLIZA)) && this.nTipoVentana != 2) {
                        this.mbhabilitar = false;
                    }

                }
            },
            (err) => { }
        );
    }
    setCampos(plan: number, VALORES: any) {

        console.log("|valFIni::" + VALORES);
        console.log("|NTYPEPLAN::" + VALORES.NTYPEPLAN);

        this.mSelectedTipoPlanId = VALORES.NMODULO;
        if (VALORES.NTYPEPLAN == 1) {
            this.mtype = 'a';
        } else {
            this.mtype = 'b';
        }

        this.NPOLIZA = VALORES.NPOLICY;
        this.mselectedServicioId = VALORES.NSERVICE;
        this.valNMontoBrok = VALORES.NAMOUNT_CLIENT;
        this.valNMontoCanal = VALORES.NAMOUNT_COMPANY;
        this.valNTasaCli = VALORES.NTASACLIENTE;
        this.valNTasaComp = VALORES.NTASACOMPANIA;
        this.valNCuotaMin = VALORES.NMINCREDITO;
        this.valNCuotaMax = VALORES.NMAXCREDITO;
        this.valNRol = VALORES.NROL;
        this.coberIdSend = VALORES.NCOVER;
        this.mbhabilitar = false;
        //this.mSelectedGrupoId=this.mlistGrupo[0].Id==undefined?this.NGRUPO:this.mSelectedGrupoId;
    }
    validaConfigEnLista(item: any) {

        if (this.valNRol == item.NROL) {
            if (parseInt(item.NSERVICE) == parseInt(this.mselectedServicioId)) {
                if ((parseInt(this.valNCuotaMin) >= parseInt(item.NMINCREDITO) && parseInt(this.valNCuotaMin) <= parseInt(item.NMAXCREDITO))
                    || parseInt(this.valNCuotaMax) >= parseInt(item.NMINCREDITO) && parseInt(this.valNCuotaMax) <= parseInt(item.NMAXCREDITO)) {
                    return 1;
                }
            }
        }
        return 0;
    }
    AgregarConfig = () => {
        console.log("|mselectedServicioId:" + this.mselectedServicioId + "|valNMontoBrok:" + this.valNMontoBrok + "|valNMontoCanal:" + this.valNMontoCanal);
        console.log("|valNTasaCli:" + this.valNTasaCli + "|valNTasaComp:" + this.valNTasaComp + "|valNCuotaMin:" + this.valNCuotaMin);
        console.log("|valNCuotaMax:" + this.valNCuotaMax + "|valNRol:" + this.valNRol + "|this.mlistValores.length:" + this.mlistValores.length);
        let lengtharray = this.mlistValores.length + 1;
        let txt: string = ',';
        let aux = 0;
        for (let i = 0; i < this.mlistValores.length; i++) {
            txt += this.mlistValores[i].NSERVICE + ','; console.log('txt::' + txt)
            if (parseInt(this.mlistValores[i].NSERVICE) == parseInt(this.mselectedServicioId) - 1) {
                this.mlistValores[i].NBORRAR = false;
            }
            aux += this.validaConfigEnLista(this.mlistValores[i]);

        }

        if ((txt.indexOf(',' + this.mselectedServicioId + ',', 0) >= 0) && aux > 0) {

            swal.fire('Error', 'YA ESTÁ LISTADO EL SERVICIO', 'error');
        } else if (((this.mselectedServicioId == '1' && !(this.mselectedServicioId == '1' && this.mlistValores.length == 0)) || (this.mselectedServicioId != '1' && this.mlistValores.length == 0)) && aux > 0) {
            console.log('AgregarConfig-A');
            console.log('Val-A');
            console.log(txt.indexOf(',' + this.mselectedServicioId + ',', 0) >= 0);
            console.log('Val-B');
            console.log(!(this.mselectedServicioId == 1 && this.mlistValores.length == 0));

            swal.fire('Error', 'DEBE AGREGAR OTRO TIPO DE SERVICIO PRIMERO', 'error');/*
                          this.mselectedServicioId==2?'ERROR DEBE PRIMERO AGREGAR COBERTURA PRINCIPAL':
                          this.mselectedServicioId==3?'ERROR DEBE PRIMERO AGREGAR ASISTENCIA 1':
                          this.mselectedServicioId==4?'ERROR DEBE PRIMERO AGREGAR ASISTENCIA 2':'error','error');*/
        } else if (((this.mtype == 'a'
            && ((this.valNMontoBrok == null || this.valNMontoBrok == undefined || this.valNMontoBrok == 0)
                || (this.valNMontoCanal == null || this.valNMontoCanal == undefined || this.valNMontoCanal == 0)))
            || (this.mtype == 'b'
                && ((this.valNTasaCli == null || this.valNTasaCli == undefined || this.valNTasaCli == 0)
                    || (this.valNTasaComp == null || this.valNTasaComp == undefined || this.valNTasaComp == 0)))
        )
            || (this.valNCuotaMin == null || this.valNCuotaMin == undefined)
            || (this.valNCuotaMax == null || this.valNCuotaMax == undefined || this.valNCuotaMax == 0)
            || (this.mselectedServicioId == 4 && (this.coberIdSend == null || this.coberIdSend == undefined || this.coberIdSend == 0))
            || (this.valNRol == null || this.valNRol == undefined || this.valNRol == 0)) {
            console.log('AgregarConfig-B');
            swal.fire('Error', 'LLENAR CORRECTAMENTE LOS CAMPOS', 'error');
        } else if ((!(this.valNCuotaMin == null || this.valNCuotaMin == undefined)
            && !(this.valNCuotaMax == null || this.valNCuotaMax == undefined || this.valNCuotaMax == 0)) && Number.parseFloat(this.valNCuotaMin) > Number.parseFloat(this.valNCuotaMax)) {
            console.log('AgregarConfig-C');
            swal.fire('Error', 'CREDITO MÍNIMO NO PUEDE SER MAYOR AL MÁXIMO', 'error');
        } else {
            console.log('AgregarConfig-D');
            let sServicio = '';
            let sRol = '';
            for (let i = 0; i < this.mlistServicio.length; i++) {
                if (this.mlistServicio[i].Id == this.mselectedServicioId) {
                    sServicio = this.mlistServicio[i].Description;
                    i = this.mlistServicio.length;
                }
            }

            for (let i = 0; i < this.mlistRoles.length; i++) {
                if (this.mlistRoles[i].Id == this.valNRol) {
                    sRol = this.mlistRoles[i].Description;
                    i = this.mlistRoles.length;
                }
            }

            this.mlistValores.push(
                {
                    NTYPEPLAN: this.mtype == 'a' ? 1 : 2,
                    NMODULO: this.mSelectedTipoPlanId,
                    SSERVICE: sServicio,
                    NSERVICE: this.mselectedServicioId,
                    INDICE: lengtharray,//this.mselectedServicioId,
                    NAMOUNT_CLIENT: this.valNMontoBrok,
                    NAMOUNT_COMPANY: this.valNMontoCanal,
                    NTASACLIENTE: this.valNTasaCli,
                    NTASACOMPANIA: this.valNTasaComp,
                    NMINCREDITO: this.valNCuotaMin,
                    NMAXCREDITO: this.valNCuotaMax,
                    NROL: this.valNRol,
                    SROL: sRol,
                    NCOVER: this.coberIdSend,
                    NBORRAR: true
                }
            );
            this.nconfigs = this.mlistValores.length;
            if (this.nconfigs > 0) {
                this.haymlistValores = true;
            }
            console.log("|mlistValores: ");
            console.log(this.mlistValores);

            this.valNMontoBrok = '';
            this.valNMontoCanal = '';
            this.valNTasaCli = '';
            this.valNTasaComp = '';
            this.valNCuotaMin = '';
            this.valNCuotaMax = '';
        }
    }
    Borrar(INDICE: number) {

        console.log("INDICE: " + INDICE);
        let servicio: number = 1;
        try {
            servicio = INDICE;//parseInt(this.mselectedServicioId[INDICE-1].NSERVICE);
        } catch {
            servicio = 1;
        }
        console.log("servicio: " + servicio);
        swal.fire({
            title: 'Información',
            text: '¿Desea quitar el registro agregado?',
            icon: 'success',
            confirmButtonText: 'Aceptar',
            cancelButtonText: 'Cancelar',
            showCloseButton: true,
            showCancelButton: true,
            allowOutsideClick: false

        }).then((result) => {

            if (result.value) {
                INDICE = INDICE - 1;
                this.mlistValores.splice(INDICE, 1);
                this.nconfigs = this.mlistValores.length;
                for (let i = 0; i < this.nconfigs; i++) {
                    this.mlistValores[i].INDICE = i + 1;
                    if (parseInt(this.mlistValores[i].NSERVICE) == this.mlistValores[this.nconfigs - 1].NSERVICE) {
                        //if (parseInt(this.mlistValores[i].NSERVICE) == servicio - 1) {
                        this.mlistValores[i].NBORRAR = true;
                    }
                }
                if (this.nconfigs == 0) {
                    this.haymlistValores = false;
                }
            }
        });
    }
    ChangeRamo() {
        console.log(this.midRamo); console.log(this.mSelectedBranchId);
        this.midRamo = this.mSelectedBranchId;
        if (this.midRamo !== '') {
            this.getProductsListByBranch(this.midRamo);
        }
        this.validaCampos();
    }
    ChangeProducto() {
        console.log(this.midRamo); console.log(this.mSelectedProductoId);
        this.midProducto = this.mSelectedProductoId;
        this.validaCampos();
    }
    ChangeGrupo() {
        console.log(this.midTipoPlan); console.log(this.mSelectedGrupoId);
        this.midGrupo = this.mSelectedGrupoId;
        this.validaCampos();
    }
    ActualizaPlan() {
        //data:data,
        if (((this.mtype == 'a'
            && ((this.valNMontoBrok == null || this.valNMontoBrok == undefined || this.valNMontoBrok == 0)
                || (this.valNMontoCanal == null || this.valNMontoCanal == undefined || this.valNMontoCanal == 0)))
            || (this.mtype == 'b'
                && ((this.valNTasaCli == null || this.valNTasaCli == undefined || this.valNTasaCli == 0)
                    || (this.valNTasaComp == null || this.valNTasaComp == undefined || this.valNTasaComp == 0)))
        )
            || (this.valNCuotaMin == null || this.valNCuotaMin == undefined)
            || (this.valNCuotaMax == null || this.valNCuotaMax == undefined || this.valNCuotaMax == 0)
            || (this.mselectedServicioId == 4 && (this.coberIdSend == null || this.coberIdSend == undefined || this.coberIdSend == 0))) {
            swal.fire('Error', 'LLENAR CORRECTAMENTE LOS CAMPOS', 'error');
        } else if ((!(this.valNCuotaMin == null || this.valNCuotaMin == undefined)
            && !(this.valNCuotaMax == null || this.valNCuotaMax == undefined || this.valNCuotaMax == 0)) && parseInt(this.valNCuotaMin) > parseInt(this.valNCuotaMax)) {
            swal.fire('Error', 'CREDITO MÍNIMO NO PUEDE SER MAYOR AL MÁXIMO', 'error');
        } else {
            swal.fire({
                title: 'Información',
                text: 'Desea guardar la modificación del registro',
                icon: 'success',
                confirmButtonText: 'Aceptar',
                cancelButtonText: 'Cancelar',
                showCloseButton: true,
                showCancelButton: true,
                allowOutsideClick: false

            }).then((result) => {
                if (result.value) {
                    this.mlistValores = [];
                    this.mlistValores.push(
                        {
                            NTYPEPLAN: this.mtype == 'a' ? 1 : 2,
                            NMODULO: this.mSelectedTipoPlanId,
                            //SSERVICE:sServicio,
                            NSERVICE: this.mselectedServicioId,
                            NAMOUNT_CLIENT: this.valNMontoBrok,
                            NAMOUNT_COMPANY: this.valNMontoCanal,
                            NTASACLIENTE: this.valNTasaCli,
                            NTASACOMPANIA: this.valNTasaComp,
                            NMINCREDITO: this.valNCuotaMin,
                            NMAXCREDITO: this.valNCuotaMax,
                            NROL: this.valNRol,
                            //SROL:sRol,
                            NCOVER: this.coberIdSend
                        }
                    );

                    let data: any = {
                        data: JSON.stringify(this.mlistValores),
                        ramo: parseInt(this.mSelectedBranchId),
                        producto: parseInt(this.mSelectedProductoId),
                        // tipo:parseInt(this.mSelectedTipoPlanId),
                        // grupo:parseInt(this.mSelectedGrupoId),
                        poliza: this.NPOLIZA,
                        NUSERCODE: JSON.parse(localStorage.getItem("currentUser")).id
                    };
                    //(data: any, poliza :number, ramo:number,producto: number, tipo:number,grupo:number,usuario:number)   
                    this.PlanesAsistenciasService.ActualizaPlan(data).subscribe(
                        (res) => {
                            this.bguardo = res[0].Id;
                            if (this.bguardo != 0) {
                                swal.fire('Error',  /*this.bguardo==-1?'ERROR AL ACTUALIZAR POLIZA':
                                      this.bguardo==-2?'POLIZA NO TIENE ESE RAMO Y PRODUCTO':
                                      this.bguardo==-3?'ERROR AL ACTUALIZAR DETALLE':
                                      */res[0].Description == '' ? this.mgenericErrorMessage : res[0].Description
                                    , 'error');
                            } else {
                                swal.fire('Información', res[0].Description == '' ? this.mgenericErrorMessage : res[0].Description
                                    , 'success');
                                this.reference.close();
                            }
                        },
                        (err) => { }
                    );
                    this.mlistValores = [];
                }
            });
        }
    }
    Guardar() {
        //data:data,
        swal.fire({
            title: 'Información',
            text: 'Desea guardar la información registrada',
            icon: 'success',
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
                    // tipo:parseInt(this.mSelectedTipoPlanId),
                    // grupo:parseInt(this.mSelectedGrupoId),
                    poliza: this.NPOLIZA,
                    NUSERCODE: JSON.parse(localStorage.getItem("currentUser")).id
                };
                //(data: any, poliza :number, ramo:number,producto: number, tipo:number,grupo:number,usuario:number)
                this.PlanesAsistenciasService.setListaPlanes(data).subscribe(
                    (res) => {
                        this.bguardo = res[0].Id;
                        if (this.bguardo != 0) {
                            swal.fire('Error',  //this.bguardo==-1?'YA EXISTE ESA POLIZA CON ESE TIPO Y GRUPO':
                                res[0].Description == '' ? this.mgenericErrorMessage : res[0].Description
                                , 'error');
                        } else {
                            swal.fire('Información', res[0].Description
                                , 'success');
                            this.reference.close();
                        }
                    },
                    (err) => { }
                );
            }
        });
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
