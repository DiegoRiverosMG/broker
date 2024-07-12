import { Component, OnInit, Input, ViewChild, ElementRef } from '@angular/core';
import { BsDatepickerConfig } from 'ngx-bootstrap/datepicker';
import { NgbModal, ModalDismissReasons, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { Router } from '@angular/router';
import { DatePipe } from '@angular/common';

//Importación de servicios
import { ClientInformationService } from '../../../../services/shared/client-information.service';
import { PolicyemitService } from '../../../../services/policy/policyemit.service';

//Compartido
import { AccessFilter } from '../../../access-filter'
import { ModuleConfig } from '../../../module.config'
import Swal from 'sweetalert2'
import { CommonMethods } from '../../../common-methods';
import { PolicyMovementDetailsComponent } from '../../../policy/policy-movement-details/policy-movement-details.component';
import { ParameterSettingsService } from '../../../../services/maintenance/parameter-settings.service';

@Component({
    selector: 'app-pd-sctr-policy-index',
    templateUrl: './pd-sctr-policy-index.component.html',
    styleUrls: ['./pd-sctr-policy-index.component.css']
})
export class PdSctrPolicyIndexComponent implements OnInit {
    //
    @ViewChild('desde') desde: any;
    @ViewChild('hasta') hasta: any;
    userType: any;
    isLoading: boolean = false;

    //Datos para configurar los datepicker
    bsConfig: Partial<BsDatepickerConfig>;
    bsValueIni: Date = new Date();
    bsValueFin: Date = new Date();
    bsValueIniMax: Date = new Date();
    bsValueFinMin: Date = new Date();
    bsValueFinMax: Date = new Date();

    //Objeto de busqueda
    inputsSearch: any = {};
    documentTypeList: any = [];
    transaccionList: any = [];
    productList: any = [];
    policyList: any = [];
    blockDoc = true;
    blockSearch = true;
    stateSearch = false;
    maxlength = 8;
    minlength = 8;
    lista = [];
    selectedPolicy: string;
    listToShow: any = [];
    canRenovate: boolean = true;
    canEndorse: boolean = true;
    canInclude: boolean = true;
    canExclude: boolean = true;
    canNetear: boolean = true;
    canNullify: boolean = true;
    currentPage = 1; //página actual
    rotate = true; //
    maxSize = 5; // cantidad de paginas que se mostrarán en el paginado
    itemsPerPage = 5; // limite de items por página
    totalItems = 0; //total de items encontrados
    //epsItem = JSON.parse(sessionStorage.getItem('eps'))
    epsItem = JSON.parse(localStorage.getItem('eps'))
    codProducto = JSON.parse(localStorage.getItem('codProducto'))['productId'];
    perfilLIST: any = [];
    Nuserpro: any;
    codProfileID: any;
    template: any = {}
    variable: any = {}
    lblProducto: string = '';
    lblFecha: string = '';
    branch: any;

    constructor(
        private clientInformationService: ClientInformationService,
        private policyemit: PolicyemitService,
        private router: Router,
        private datePipe: DatePipe,
        private modalService: NgbModal,
        private parameterSettingsService: ParameterSettingsService
    ) {
        this.bsConfig = Object.assign(
            {},
            {
                dateInputFormat: 'DD/MM/YYYY',
                locale: 'es',
                showWeekNumbers: false
            }
        );
    }
    async ngOnInit() {
        // Configuracion del Template
        this.template = await CommonMethods.configuracionTemplate(this.codProducto, this.epsItem.NCODE)
        // Configuracion del Variable
        this.variable = await CommonMethods.configuracionVariables(this.codProducto, this.epsItem.NCODE)

        this.lblProducto = CommonMethods.tituloProducto(this.variable.var_nomProducto, this.epsItem.SNAME)
        this.lblFecha = CommonMethods.tituloPantalla()

        if (this.template.ins_validaPermisos) {
            if (AccessFilter.hasPermission(ModuleConfig.ViewIdList['policy_transaction_query']) == false) this.router.navigate(['/extranet/panel']);
            this.canRenovate = AccessFilter.hasPermission('19');
            this.canEndorse = AccessFilter.hasPermission('21');
            this.canInclude = AccessFilter.hasPermission('22');
            this.canExclude = AccessFilter.hasPermission('23');
            this.canNetear = AccessFilter.hasPermission('24');
            this.canNullify = AccessFilter.hasPermission('26');
        }

        this.inputsSearch.P_NPRODUCT = '0';
        this.inputsSearch.P_NIDTRANSACCION = '0';
        this.inputsSearch.P_NPOLICY = '';

        this.inputsSearch.P_NIDDOC_TYPE = '-1';
        this.inputsSearch.P_SIDDOC = '';
        this.inputsSearch.P_PERSON_TYPE = '1';
        this.inputsSearch.P_TYPE_SEARCH = '1';
        this.inputsSearch.P_SFIRSTNAME = ''
        this.inputsSearch.P_SLEGALNAME = ''
        this.inputsSearch.P_SLASTNAME = ''
        this.inputsSearch.P_SLASTNAME2 = ''

        this.branch = await CommonMethods.branchXproduct(this.codProducto);
        this.getDocumentTypeList();
        this.getTransaccionList();
        this.getProductList();

        this.bsValueIni = ModuleConfig.StartDate
        this.bsValueFin = ModuleConfig.EndDate
        this.bsValueIniMax = ModuleConfig.EndDate
        this.bsValueFinMin = ModuleConfig.StartDate
        this.bsValueFinMax = ModuleConfig.EndDate
        this.userType = await this.getProfileProduct(); // 20230325

        CommonMethods.clearBack()
    }

    async getProfileProduct() {
        let profile = 0;

        let _data: any = {};
        _data.nUsercode = JSON.parse(localStorage.getItem('currentUser'))['id'];
        _data.nProduct = this.codProducto;
        await this.parameterSettingsService.getProfileProduct(_data).toPromise()
            .then(
                (res) => {
                    profile = res;
                },
                err => {
                    console.log(err)
                }
            );

        return profile;
    }

    getDocumentTypeList() {
        this.clientInformationService.getDocumentTypeList(this.codProducto).subscribe(
            res => {
                this.documentTypeList = res;
            },
            err => {
                console.log(err);
            }
        );
    }

    getTransaccionList() {
        this.policyemit.getTransaccionList().subscribe(
            res => {
                this.transaccionList = res;
            },
            err => {
                console.log(err);
            }
        );
    }

    getProductList() {
        this.clientInformationService.getProductList(this.codProducto, this.epsItem.NCODE, this.branch).subscribe(
            res => {
                this.productList = res;
                if (this.productList.length == 1) {
                    this.inputsSearch.P_NPRODUCT = this.productList[0].COD_PRODUCT;
                } else {
                    this.inputsSearch.P_NPRODUCT = '0'
                }
            },
            err => {
                console.log(err);
            }
        );
    }

    openModal(row: number, cotizacionID: string) {
        let modalRef: NgbModalRef;
        if (cotizacionID != '') {
            modalRef = this.modalService.open(PolicyMovementDetailsComponent, { size: 'lg', windowClass: 'modalCustom', backdropClass: 'light-blue-backdrop', backdrop: 'static', keyboard: false });
            modalRef.componentInstance.reference = modalRef;
            modalRef.componentInstance.itemTransaccionList = this.policyList;
            modalRef.componentInstance.cotizacionID = cotizacionID;
        }
    }

    onSelectTypeDocument() {
        let response = CommonMethods.selTipoDocumento(this.inputsSearch.P_NIDDOC_TYPE)
        this.maxlength = response.maxlength
        this.minlength = response.minlength
    }

    mostrarMas() {
        this.currentPage = 1;
        this.listToShow = this.policyList.slice(((this.currentPage - 1) * this.itemsPerPage), (this.currentPage * this.itemsPerPage));
        this.selectedPolicy = '';
    }

    onSelectTypePerson() {
        switch (this.inputsSearch.P_PERSON_TYPE) {
            case '1':
                this.blockDoc = true;
                break;
            case '2':
                this.blockDoc = false;
                break;
        }
    }

    onSelectTypeSearch() {
        switch (this.inputsSearch.P_TYPE_SEARCH) {
            case '1':
                this.blockSearch = true;
                this.blockDoc = true;
                this.inputsSearch.P_SFIRSTNAME = ''
                this.inputsSearch.P_SLEGALNAME = ''
                this.inputsSearch.P_SLASTNAME = ''
                this.inputsSearch.P_SLASTNAME2 = ''
                break;

            case '2':
                this.blockSearch = false;
                this.blockDoc = true;
                this.inputsSearch.P_NIDDOC_TYPE = '-1';
                this.inputsSearch.P_SIDDOC = '';
                break;

        }
    }

    changePolicy(sdoc) {
        if (sdoc.length > 0) {
            this.stateSearch = true;
            this.inputsSearch.P_NIDPRODUCT = '0';
            this.inputsSearch.P_NIDTRANSACCION = '0';
            this.inputsSearch.P_NIDDOC_TYPE = '-1';
            this.inputsSearch.P_SIDDOC = '';
            this.inputsSearch.P_PERSON_TYPE = '1';
            this.inputsSearch.P_TYPE_SEARCH = '1';
            this.inputsSearch.P_SFIRSTNAME = ''
            this.inputsSearch.P_SLEGALNAME = ''
            this.inputsSearch.P_SLASTNAME = ''
            this.inputsSearch.P_SLASTNAME2 = ''
        } else {
            this.stateSearch = false;
        }
    }

    documentNumberKeyPress(event: any) {
        CommonMethods.validarNroDocumento(event, this.inputsSearch.P_NIDDOC_TYPE)
    }

    buscarPoliza(excel: number = 0) {

        if (excel != 1) {
            this.listToShow = [];
            this.currentPage = 1; //página actual
            this.maxSize = 5; // cantidad de paginas que se mostrarán en el paginado
            this.totalItems = 0; //total de items encontrados
        }

        let msg: string = '';
        if (this.inputsSearch.P_NIDDOC_TYPE != '-1') {
            if (this.inputsSearch.P_SIDDOC == '') {
                msg = 'Debe llenar el número de documento'
            }
        }

        if (this.inputsSearch.P_SIDDOC != '') {
            if (this.inputsSearch.P_NIDDOC_TYPE == '-1') {
                msg = 'Debe llenar el tipo de documento'
            }
        }

        if (this.inputsSearch.P_SFIRSTNAME != '') {
            if (this.inputsSearch.P_SFIRSTNAME.length < 2) {
                msg += 'El campo nombre debe contener al menos 2 caracteres <br />'
            }
        }

        if (this.inputsSearch.P_SLASTNAME != '') {
            if (this.inputsSearch.P_SLASTNAME.length < 2) {
                msg += 'El campo apellido paterno debe contener al menos 2 caracteres'
            }
        }

        if (msg != '') {
            Swal.fire('Información', msg, 'error');
        } else {
            this.codProfileID = JSON.parse(localStorage.getItem('currentUser'))['profileId'];
            this.isLoading = true;
            let data: any = {};
            data.P_NPOLICY = this.inputsSearch.P_NPOLICY == '0' ? '' : this.inputsSearch.P_NPOLICY
            data.P_NPRODUCT = this.inputsSearch.P_NPRODUCT == '0' ? '' : this.inputsSearch.P_NPRODUCT
            data.P_FECHA_DESDE = CommonMethods.formatDate(this.bsValueIni); //Fecha Inicio
            data.P_FECHA_HASTA = CommonMethods.formatDate(this.bsValueFin); //Fecha fin
            data.P_NTYPE_TRANSAC = this.inputsSearch.P_NIDTRANSACCION == '0' ? '' : this.inputsSearch.P_NIDTRANSACCION;
            data.P_TIPO_DOC_CONT = this.inputsSearch.P_NIDDOC_TYPE == '-1' ? '' : this.inputsSearch.P_NIDDOC_TYPE;
            data.P_NUM_DOC_CONT = this.inputsSearch.P_SIDDOC;
            data.P_RAZON_SOCIAL_CONT = this.inputsSearch.P_SLEGALNAME;
            data.P_APE_PAT_CONT = this.inputsSearch.P_SLASTNAME;
            data.P_APE_MAT_CONT = this.inputsSearch.P_SLASTNAME2;
            data.P_NOMBRES_CONT = this.inputsSearch.P_SFIRSTNAME;
            data.P_NUSERCODE = JSON.parse(localStorage.getItem('currentUser'))['id'];
            data.CompanyLNK = this.epsItem.NCODE;
            data.P_NBRANCH = this.branch;

            if (excel == 1) {
                this.excel(data);
            } else {
                this.search(data);
            }


        }
    }

    excel(data) {
        this.isLoading = true;
        // try {
        this.policyemit.getPolicyTransListExcel(data).subscribe(res => {
            this.isLoading = false;
            if (res == "") {
                Swal.fire('Información', "Error al descargar Excel o no se encontraron resultados", 'error');
            } else {
                const blob = this.b64toBlob(res);
                const blobUrl = URL.createObjectURL(blob);
                let a = document.createElement("a")
                a.href = blobUrl
                a.download = "Reporte de pólizas.xlsx"
                a.click()
            };
        },
            err => {
                this.isLoading = false;
                Swal.fire('Información', 'Hubo un problema al generar el excel', 'warning');
                console.log(err);
            })
        // } catch (error) {
        //     this.isLoading = false;
        //     Swal.fire('Información', "Error al descargar Excel", 'error');
        // }
    }

    b64toBlob = (b64Data, contentType = '', sliceSize = 512) => {
        const byteCharacters = atob(b64Data);
        const byteArrays = [];

        for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
            const slice = byteCharacters.slice(offset, offset + sliceSize);

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

    search(data) {

        this.policyemit.getPolicyTransList(data).subscribe(
            res => {
                this.isLoading = false;
                this.policyList = res.C_TABLE;
                this.totalItems = this.policyList.length;
                this.listToShow = this.policyList.slice(((this.currentPage - 1) * this.itemsPerPage), (this.currentPage * this.itemsPerPage));
                if (this.policyList.length == 0) {
                    Swal.fire({
                        title: 'Información',
                        text: 'No se encuentran póliza(s) con los datos ingresados',
                        icon: 'error',
                        confirmButtonText: 'OK',
                        allowOutsideClick: false,
                    }).then((result) => {
                        if (result.value) {
                            return;
                        }
                    });
                }
            },
            err => {
                this.isLoading = false;
                Swal.fire('Información', 'No hay registros', 'warning');
                console.log(err);
            }
        );
    }

    pageChanged(currentPage) {
        this.currentPage = currentPage;
        this.listToShow = this.policyList.slice(((this.currentPage - 1) * this.itemsPerPage), (this.currentPage * this.itemsPerPage));
        this.selectedPolicy = '';
    }

    choosePolicyClk(evt, selection: any, idTipo: number) {
        
        if (selection != undefined && selection != '') {
            if (this.policyList.length > 0) {
                this.policyList.forEach(item => {
                    if (item.NRO_COTIZACION == selection) {
                        this.policyemit.valTransactionPolicy(item.NRO_COTIZACION, idTipo).subscribe(
                            res => {
                                if (res.P_COD_ERR == '0') {

                                    const final_date = item.FIN_VIGENCIA.split('/'); //BD FIN VIGENCIA
                                    const final_fecha_des = (final_date[1]) + '/' + final_date[0] + '/' + final_date[2]; // Mes Dia Año

                                    const parse_final_date = new Date(final_fecha_des); // BD Format Date FINAL FECHA De vigencia
                                    parse_final_date.setHours(0, 0, 0, 0);

                                    const next_final_date = new Date(final_fecha_des); // Fin Vigencia + 1 Dia
                                    next_final_date.setHours(0, 0, 0, 0);
                                    next_final_date.setDate(next_final_date.getDate() + 1);


                                    const ini_date = item.INICIO_VIGENCIA.split('/'); 
                                    const ini_fecha_des = (ini_date[1]) + '/' + ini_date[0] + '/' + ini_date[2]; // Mes Dia Año
                                    const parse_ini_date = new Date(ini_fecha_des); // BD Format Date  INICIO FECHA De vigencia
                                    parse_ini_date.setHours(0, 0, 0, 0);


                                    const current_date = new Date(); // Mes dia año
                                    current_date.setHours(0, 0, 0, 0);


                                    let validate_date;
                                    if ((current_date <= next_final_date)) {
                                        validate_date = false;
                                    } else {
                                        validate_date = true;
                                    }
                                    

                                    //Val para Operaciones
                                    let diferencia = parse_final_date.getTime() - current_date.getTime();
                                    let diasDiferencia = Math.ceil(diferencia / (1000 * 60 * 60 * 24));

                                    // Solo Renovacion Comercial Y Externo
                                    if (idTipo == 4 && (this.userType == 7 || this.userType == 134) && validate_date == true) { // AGF 15012024

                                        const parse_format_next_date = next_final_date.toLocaleString('es-ES', { year: 'numeric', month: '2-digit', day: '2-digit' });

                                        Swal.fire({
                                            title: 'Información',
                                            text: `No se encuentra dentro del día permitido para realizar la renovación. Día permitido ${parse_format_next_date}.`,
                                            icon: 'error',
                                            confirmButtonText: 'OK',
                                            allowOutsideClick: false,
                                        }).then((result) => {
                                            if (result.value) {
                                                return;
                                            }
                                        });
                                    }
                                    // else if (idTipo == 4 && this.userType == 136 && (diasDiferencia >= 15)) { // Validacion 15 dias Retroactividad
                                    else if (idTipo == 4 && this.userType == 136 && (diasDiferencia < -15) ) { // Validacion 15 dias Retroactividad
                                        console.log(diasDiferencia);
                                        const final_date_ope = new Date(final_fecha_des); // Fin Vigencia + 1 Dia
                                        final_date_ope.setHours(0, 0, 0, 0);
                                        final_date_ope.setDate(final_date_ope.getDate() + 15);
                                        let parse_final_date_ope = final_date_ope.toLocaleString('es-ES', { year: 'numeric', month: '2-digit', day: '2-digit' });

                                        Swal.fire({
                                            title: 'Información',
                                            text: `No se encuentra dentro del día permitido para realizar la renovación.`,
                                            icon: 'error',
                                            confirmButtonText: 'OK',
                                            allowOutsideClick: false,
                                        }).then((result) => {
                                            if (result.value) {
                                                return;
                                            }
                                        });
                                    }
                                    else {
                                        switch (idTipo) {
                                            case 1: // Anular
                                                this.router.navigate(['/extranet/sctr/poliza/transaccion/cancel'], { queryParams: { nroCotizacion: item.NRO_COTIZACION } });
                                                break;
                                            case 2: // Incluir
                                                this.router.navigate(['/extranet/sctr/poliza/transaccion/include'], { queryParams: { nroCotizacion: item.NRO_COTIZACION } });
                                                break;
                                            case 3: // Exluir
                                                this.router.navigate(['/extranet/sctr/poliza/transaccion/exclude'], { queryParams: { nroCotizacion: item.NRO_COTIZACION } });
                                                break;
                                            case 4: // Renovar
                                                this.router.navigate(['/extranet/sctr/poliza/transaccion/renew'], { queryParams: { nroCotizacion: item.NRO_COTIZACION } });
                                                break;
                                            case 5: //Neteo
                                                this.router.navigate(['/extranet/sctr/poliza/transaccion/netear'], { queryParams: { nroCotizacion: item.NRO_COTIZACION } });
                                                break;
                                            case 6: //Endoso
                                                this.router.navigate(['/extranet/sctr/poliza/transaccion/endosar'], { queryParams: { nroCotizacion: item.NRO_COTIZACION } });
                                                break;
                                            case 9: //Facturacion
                                                this.recibosPoliza(item);
                                                break;
                                        }
                                    }
                                } else {
                                    Swal.fire({
                                        title: 'Información',
                                        text: res.P_MESSAGE,
                                        icon: 'error',
                                        confirmButtonText: 'OK',
                                        allowOutsideClick: false,
                                    }).then((result) => {
                                        if (result.value) {
                                            return;
                                        }
                                    });
                                }
                            },
                            err => {
                                this.isLoading = false;
                            }
                        );
                    }
                });
            }
        } else {
            Swal.fire({
                title: 'Información',
                text: 'Para continuar deberá elegir una póliza',
                icon: 'error',
                confirmButtonText: 'OK',
                allowOutsideClick: false,
            }).then((result) => {
                if (result.value) {
                    return;
                }
            });
        }
        evt.preventDefault();
    }

    recibosPoliza(itemFact: any) {
        let myFormData: FormData = new FormData()
        let renovacion: any = {};
        renovacion.P_NID_COTIZACION = itemFact.NRO_COTIZACION // nro cotizacion
        renovacion.P_DEFFECDATE = null; //Fecha Inicio
        renovacion.P_DEXPIRDAT = null; // Fecha Fin
        renovacion.P_NUSERCODE = JSON.parse(localStorage.getItem('currentUser'))['id'] // Fecha hasta
        renovacion.P_NTYPE_TRANSAC = 9; // tipo de movimiento
        renovacion.P_NID_PROC = '' // codigo de proceso (Validar trama)
        renovacion.P_FACT_MES_VENCIDO = null // Facturacion Vencida
        renovacion.P_SFLAG_FAC_ANT = null // Facturacion Anticipada
        renovacion.P_SCOLTIMRE = null // Tipo de renovacion
        renovacion.P_NPAYFREQ = null // Frecuencia Pago
        renovacion.P_NMOV_ANUL = null // Movimiento de anulacion
        renovacion.P_NNULLCODE = 0 // Motivo anulacion
        renovacion.P_SCOMMENT = '' // Frecuencia Pago

        myFormData.append('transaccionProtecta', JSON.stringify(renovacion));

        Swal.fire({
            title: 'Información',
            text: '¿Deseas generar recibos de la(s) póliza(s) ' + itemFact.POLIZA + '?',
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Generar',
            allowOutsideClick: false,
            cancelButtonText: 'Cancelar'
        })
            .then((result) => {
                if (result.value) {
                    this.policyemit.transactionPolicy(myFormData).subscribe(
                        res => {
                            if (res.P_COD_ERR == 0) {
                                Swal.fire({
                                    title: 'Información',
                                    text: 'Se ha realizado la generación de recibos correctamente',
                                    icon: 'success',
                                    confirmButtonText: 'OK',
                                    allowOutsideClick: false,
                                })
                            } else {
                                Swal.fire({
                                    title: 'Información',
                                    text: res.P_MESSAGE,
                                    icon: 'error',
                                    confirmButtonText: 'OK',
                                    allowOutsideClick: false,
                                })
                            }
                        },
                        err => {
                            console.log(err);
                        }
                    );
                }
            });
    }

    valInicio(event) {
        this.bsValueFinMin = new Date(this.bsValueIni);

    }
    valFin(event) {
        this.bsValueIniMax = new Date(this.bsValueFin);
    }
}

