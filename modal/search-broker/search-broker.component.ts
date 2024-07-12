import { Component, OnInit, Input, AfterContentInit } from '@angular/core';

//Importación de servicios
import { ClientInformationService } from '../../services/shared/client-information.service';
import { QuotationService } from '../../services/quotation/quotation.service';
import swal from 'sweetalert2';
import { CommonMethods } from '../../components/common-methods';

@Component({
    selector: 'app-search-broker',
    templateUrl: './search-broker.component.html',
    styleUrls: ['./search-broker.component.css']
})
export class SearchBrokerComponent implements OnInit {
    @Input() public formModalReference: any; //Referencia al modal creado desde el padre de este componente para ser cerrado desde aquí
    @Input() public EListClient: any;
    @Input() public listaBroker: any;
    @Input() public brokerMain: any;

    blockSearch: any = true;
    stateBrokerSalud = true;
    stateBrokerPension = true;
    statePrimaSalud = true;
    statePrimaPension = true;
    stateSalud = true;
    statePension = true;
    stateQuotation = true;
    stateTasaSalud = true;
    stateTasaPension = true;
    stateCotizador = true;
    blockDoc = true;
    stateSearch = false;
    maxlength = 8;
    minlength = 8;
    typeDocument = 0;
    InputsBroker: any = {};
    documentTypeList: any = [];
    listBroker: any = [];
    searchText = "";

    selectedBroker: string;
    currentPage = 1; //página actual
    rotate = true; //
    maxSize = 5; // cantidad de paginas que se mostrarán en el paginado
    itemsPerPage = 5; // limite de items por página
    totalItems = 0; //total de items encontrados
    listToShow: any[] = [];
    codProducto = JSON.parse(localStorage.getItem("codProducto"))["productId"]

    constructor(
        private quotationService: QuotationService,
        private clientInformationService: ClientInformationService
    ) { }

    ngOnInit() {
        this.getDocumentTypeList();

        //Datos Contratante
        this.InputsBroker.P_TYPE_SEARCH = "1";
        this.InputsBroker.P_NIDDOC_TYPE = "-1"; // Tipo de documento
        this.InputsBroker.P_SIDDOC = ""; // Nro de documento
        this.InputsBroker.P_SFIRSTNAME = ""; // Nombre
        this.InputsBroker.P_SLASTNAME = ""; // Apellido Paterno
        this.InputsBroker.P_SLASTNAME2 = ""; // Apellido Materno
        this.InputsBroker.P_SLEGALNAME = ""; // Razon social
        this.InputsBroker.P_SE_MAIL = ""; // Email
        this.InputsBroker.P_SDESDIREBUSQ = ""; // Direccion
    }

    getDocumentTypeList() {
        this.clientInformationService.getDocumentTypeList(0).subscribe(
            res => {
                this.documentTypeList = res;
            },
            err => {
            }
        );
    }

    onSelectTypeSearch() {
        switch (this.InputsBroker.P_TYPE_SEARCH) {
            case "1":
                this.blockSearch = true;
                this.InputsBroker.P_NIDDOC_TYPE = "-1";
                this.InputsBroker.P_SIDDOC = "";
                this.InputsBroker.P_PERSON_TYPE = "1";
                this.InputsBroker.P_SLEGALNAME = "";
                this.InputsBroker.P_SFIRSTNAME = "";
                this.InputsBroker.P_SLASTNAME = "";
                this.InputsBroker.P_SLASTNAME2 = "";
                this.stateSearch = false;
                this.blockDoc = true;

                break;

            case "2":
                this.blockSearch = false;
                this.InputsBroker.P_NIDDOC_TYPE = "-1";
                this.InputsBroker.P_SIDDOC = "";
                this.InputsBroker.P_PERSON_TYPE = "1";
                this.InputsBroker.P_SLEGALNAME = "";
                this.InputsBroker.P_SFIRSTNAME = "";
                this.InputsBroker.P_SLASTNAME = "";
                this.InputsBroker.P_SLASTNAME2 = "";
                this.stateSearch = true;
                this.blockDoc = true;
                break;

        }
    }

    onSelectTypeDocument(typeDocumentID) {
        let response = CommonMethods.selTipoDocumento(typeDocumentID)
        this.maxlength = response.maxlength
        this.minlength = response.minlength
        this.blockDoc = true
    }

    onSelectTypePerson(typePersonID) {
        switch (typePersonID) {
            case "1":
                this.blockDoc = true;
                this.InputsBroker.P_SLEGALNAME = "";
                this.InputsBroker.P_SFIRSTNAME = "";
                this.InputsBroker.P_SLASTNAME = "";
                this.InputsBroker.P_SLASTNAME2 = "";
                break;
            case "2":
                this.blockDoc = false;
                this.InputsBroker.P_SLEGALNAME = "";
                this.InputsBroker.P_SFIRSTNAME = "";
                this.InputsBroker.P_SLASTNAME = "";
                this.InputsBroker.P_SLASTNAME2 = "";
                break;
        }
    }

    chooseBroker(selection: any) {
        if (selection != undefined) {
            let existe: any = 0;

            // BrokerList
            if (this.listaBroker.length > 0) {
                this.listaBroker.forEach(item => {
                    if (item.SCLIENT == selection.SCLIENT) {
                        existe = 1;
                    }
                });
            }
            // BrokerMain
            if (this.brokerMain == selection.NNUMDOC) {
                existe = 1;
            }

            if (existe == 0) {
                this.formModalReference.close(selection);
            }
            else {
                swal.fire("Información", "El broker ya se encuentra agregado a la cotización", "error");
            }
        } else {
            return;
        }
    }

    chooseBrokerClk(selection: any) {
        if (selection != undefined && selection != "") {
            let existe: any = 0;
            if (this.listaBroker.length > 0) {
                this.listaBroker.forEach(element => {
                    if (element.NNUMDOC == selection) {
                        existe = 1;
                    }
                });
            }
            // BrokerMain
            if (this.brokerMain == selection) {
                existe = 1;
            }
            if (existe == 0) {
                this.listBroker.forEach(item => {
                    if (item.NNUMDOC == selection) {
                        this.formModalReference.close(item);
                    }
                });
            }
            else {
                swal.fire("Información", "El broker ya se encuentra agregado a la cotización", "error");
            }
        } else {
            return;
        }
    }

    SearchContrator() {
        let msg: string = "";

        if (this.InputsBroker.P_TYPE_SEARCH == "1") {
            if (this.InputsBroker.P_NIDDOC_TYPE == "-1") {
                msg += "Seleccionar tipo de documento <br />"
            }

            if (this.InputsBroker.P_SIDDOC.trim() == "") {
                msg += "Debe ingresar el número de documento <br />"
            } else {
                if (this.InputsBroker.P_SIDDOC.trim().length < this.minlength) {
                    msg += "El número de documento de tener como mínimo " + this.minlength + " dígitos";
                }

                if (this.InputsBroker.P_SIDDOC == "12345678") {
                    msg += "El número de documento no es válido <br />"
                }
            }

            if (this.InputsBroker.P_NIDDOC_TYPE == 1 && this.InputsBroker.P_SIDDOC.trim().length > 1) {
                if (this.InputsBroker.P_SIDDOC.substr(0, 2) != "10" && this.InputsBroker.P_SIDDOC.substr(0, 2) != "15" && this.InputsBroker.P_SIDDOC.substr(0, 2) != "17" && this.InputsBroker.P_SIDDOC.substr(0, 2) != "20") {
                    msg += "El número de RUC no es válido, debe empezar con 10, 15, 17, 20";
                }
            }
        }

        if (this.InputsBroker.P_PERSON_TYPE == "1") {
            if (this.InputsBroker.P_TYPE_SEARCH == "2") {
                if (this.InputsBroker.P_SFIRSTNAME.trim() == "" && this.InputsBroker.P_SLASTNAME.trim() == "") {
                    msg += "Debe ingresar nombre y apellido paterno <br />"
                } else {
                    if (this.InputsBroker.P_SFIRSTNAME.trim().length < 3) {
                        msg += "Debe ingresar al menos 2 caracteres en nombre <br />"
                    }
                    if (this.InputsBroker.P_SLASTNAME.trim().length < 3) {
                        msg += "Debe ingresar al menos 2 caracteres en apellido paterno <br />"
                    }
                }
            }
        }
        if (this.InputsBroker.P_PERSON_TYPE == "2") {
            if (this.InputsBroker.P_SLEGALNAME.trim().length < 2) {
                msg += "Debe ingresar al menos 2 caracteres en razón social <br />"
            }
        }

        if (msg != "") {
            swal.fire("Información", msg, "error");
            return;
        } else {
            let searchBroker: any = {};
            searchBroker.P_IS_AGENCY = '0';
            this.listBroker = [];
            switch (this.InputsBroker.P_TYPE_SEARCH) {
                case "1":
                    searchBroker.P_NTIPO_BUSQUEDA = this.InputsBroker.P_TYPE_SEARCH;
                    searchBroker.P_NTIPO_DOC = this.InputsBroker.P_NIDDOC_TYPE;
                    searchBroker.P_NNUM_DOC = this.InputsBroker.P_SIDDOC.toUpperCase();
                    searchBroker.P_SNOMBRE = "";
                    searchBroker.P_SAP_PATERNO = "";
                    searchBroker.P_SAP_MATERNO = "";
                    searchBroker.P_SNOMBRE_LEGAL = "";
                    break;
                case "2":
                    searchBroker.P_NTIPO_BUSQUEDA = this.InputsBroker.P_TYPE_SEARCH;
                    searchBroker.P_NTIPO_DOC = "";
                    searchBroker.P_NNUM_DOC = "";
                    searchBroker.P_SNOMBRE = this.InputsBroker.P_SFIRSTNAME.toUpperCase();
                    searchBroker.P_SAP_PATERNO = this.InputsBroker.P_SLASTNAME.toUpperCase();
                    searchBroker.P_SAP_MATERNO = this.InputsBroker.P_SLASTNAME2.toUpperCase();
                    searchBroker.P_SNOMBRE_LEGAL = this.InputsBroker.P_SLEGALNAME.toUpperCase();
                    break;
            }

            this.quotationService.searchBroker(searchBroker).subscribe(
                res => {
                    if (res.P_NCODE == 0) {
                        if (res.listBroker != null && res.listBroker.length > 0) {
                            this.listBroker = res.listBroker;
                            this.totalItems = this.listBroker.length;
                            this.listToShow = this.listBroker.slice(((this.currentPage - 1) * this.itemsPerPage), (this.currentPage * this.itemsPerPage));
                        } else {
                            swal.fire("Información", "No hay información con los datos ingresados", "error");
                        }
                    } else {
                        swal.fire("Información", res.P_SMESSAGE, "error");
                    }

                },
                err => {
                    swal.fire("Información", "Ocurrió un problema al solicitar su petición", "error");
                }
            );
        }
    }

    pageChanged(currentPage) {
        this.currentPage = currentPage;
        this.listToShow = this.listBroker
        this.listToShow = this.listBroker.slice(((this.currentPage - 1) * this.itemsPerPage), (this.currentPage * this.itemsPerPage));
    }

    mostrarMas() {
        this.pageChanged(1);
    }

    documentNumberKeyPress(event: any) {
        CommonMethods.validarNroDocumento(event, this.InputsBroker.P_NIDDOC_TYPE)
    }

    textValidate(event: any, type) {
        CommonMethods.textValidate(event, type)
    }

    validarSalida() {
        swal
            .fire({
                title: 'Información',
                text: '¿Estás seguro de salir sin seleccionar?',
                icon: 'question',
                showCancelButton: true,
                confirmButtonText: 'Sí',
                allowOutsideClick: false,
                cancelButtonText: 'No',
            })
            .then(async (result) => {
                if (result.value) {
                    this.formModalReference.dismiss()
                }
            });
    }

}
