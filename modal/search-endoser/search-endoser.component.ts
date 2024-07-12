import { Component, OnInit, Input, AfterContentInit } from '@angular/core';

//Importación de servicios
import { ClientInformationService } from '../../services/shared/client-information.service';
import { QuotationService } from '../../services/quotation/quotation.service';
import swal from 'sweetalert2';
import { CommonMethods } from '../../components/common-methods';

@Component({
    selector: 'app-search-endoser',
    templateUrl: './search-endoser.component.html',
    styleUrls: ['./search-endoser.component.css'],
})
export class SearchEndoserComponent implements OnInit {
    @Input() public formModalReference: any; //Referencia al modal creado desde el padre de este componente para ser cerrado desde aquí
    @Input() public list: any;

    blockSearch: any = true;
    blockDoc = true;
    stateSearch = false;
    maxlength = 8;
    minlength = 8;
    typeDocument = 0;
    selectedBroker: any
    Inputs: any = {};
    documentTypeList: any = [];
    listEndoser: any = [];
    searchText = '';

    currentPage = 1; //página actual
    rotate = true; //
    maxSize = 5; // cantidad de paginas que se mostrarán en el paginado
    itemsPerPage = 5; // limite de items por página
    totalItems = 0; //total de items encontrados
    listToShow: any[] = [];
    codProducto = JSON.parse(localStorage.getItem('codProducto'))['productId'];
    branch: string;

    constructor(private clientInformationService: ClientInformationService
    ) {
        this.branch = CommonMethods.branchXproduct(
            JSON.parse(localStorage.getItem('codProducto'))['productId']
        );
    }

    ngOnInit() {
        this.getDocumentTypeList();

        //Datos Contratante
        this.Inputs.P_TYPE_SEARCH = '1';
        this.Inputs.P_NIDDOC_TYPE = '1'; // Tipo de documento
        this.Inputs.P_SIDDOC = ''; // Nro de documento
        this.Inputs.P_SLEGALNAME = ''; // Razon social
    }

    getDocumentTypeList() {
        this.clientInformationService.getDocumentTypeList(0).subscribe(
            (res) => {
                this.documentTypeList = res;
            },
            (err) => { }
        );
    }

    onSelectTypeSearch() {
        switch (this.Inputs.P_TYPE_SEARCH) {
            case '1':
                this.blockSearch = true;
                this.Inputs.P_NIDDOC_TYPE = '1';
                this.Inputs.P_SIDDOC = '';
                this.Inputs.P_PERSON_TYPE = '1';
                this.Inputs.P_SLEGALNAME = '';
                this.stateSearch = false;
                this.blockDoc = true;

                break;

            case '2':
                this.blockSearch = false;
                this.Inputs.P_NIDDOC_TYPE = '1';
                this.Inputs.P_SIDDOC = '';
                this.Inputs.P_PERSON_TYPE = '2';
                this.Inputs.P_SLEGALNAME = '';
                this.stateSearch = true;
                this.blockDoc = false;
                break;
        }
    }

    onSelectTypeDocument(typeDocumentID) {
        let response = CommonMethods.selTipoDocumento(typeDocumentID);
        this.maxlength = response.maxlength;
        this.minlength = response.minlength;
        this.blockDoc = true;
    }

    onSelectTypePerson(typePersonID) {
        switch (typePersonID) {
            case '1':
                this.blockDoc = true;
                this.Inputs.P_SLEGALNAME = '';

                break;
            case '2':
                this.blockDoc = false;
                this.Inputs.P_SLEGALNAME = '';
                break;
        }
    }

    chooseEndoser(selection: any) {
        if (selection != undefined) {
            let existe: any = 0;

            // EnodserList
            if (this.list.length > 0) {
                this.list.forEach((item) => {
                    if (item.cod_proveedor == selection.cod_proveedor) {
                        existe = 1;
                    }
                });
            }

            if (existe == 0) {
                this.formModalReference.close(selection);
            } else {
                swal.fire(
                    'Información',
                    'El endosatario ya se encuentra agregado a la cotización',
                    'error'
                );
            }
        } else {
            return;
        }
    }

    chooseEndoserClk(selection: any) {
        if (selection != undefined && selection != '') {
            let existe: any = 0;
            if (this.list.length > 0) {
                this.list.forEach((item) => {
                    if (item.documento == selection) {
                        existe = 1;
                    }
                });
            }

            if (existe == 0) {
                this.listEndoser.forEach((item) => {
                    if (item.documento == selection) {
                        this.formModalReference.close(item);
                    }
                });
            } else {
                swal.fire(
                    'Información',
                    'El endosatario ya se encuentra agregado a la cotización',
                    'error'
                );
            }
        } else {
            return;
        }

    }

    Search() {
        let msg: string = '';

        if (this.Inputs.P_TYPE_SEARCH == '1') {
            if (this.Inputs.P_SIDDOC.trim() == '') {
                msg += 'Debe ingresar el número de documento <br />';
            }
        }

        if (
            this.Inputs.P_NIDDOC_TYPE == 1 &&
            this.Inputs.P_SIDDOC.trim().length > 1
        ) {
            if (
                this.Inputs.P_SIDDOC.substr(0, 2) != '10' &&
                this.Inputs.P_SIDDOC.substr(0, 2) != '15' &&
                this.Inputs.P_SIDDOC.substr(0, 2) != '17' &&
                this.Inputs.P_SIDDOC.substr(0, 2) != '20'
            ) {
                msg += 'El número de RUC no es válido, debe empezar con 10, 15, 17, 20';
            }
        }

        if (this.Inputs.P_PERSON_TYPE == '2') {
            if (this.Inputs.P_SLEGALNAME.trim().length < 2) {
                msg += 'Debe ingresar al menos 2 caracteres en razón social <br />';
            }
        }

        if (msg != '') {
            swal.fire('Información', msg, 'error');
            return;
        } else {
            let searchBroker: any = {};

            this.listEndoser = [];
            switch (this.Inputs.P_TYPE_SEARCH) {
                case '1':
                    searchBroker.tipo_busqueda = this.Inputs.P_TYPE_SEARCH;
                    searchBroker.tipo_documento = this.Inputs.P_NIDDOC_TYPE;
                    searchBroker.documento = this.Inputs.P_SIDDOC.toUpperCase();
                    searchBroker.nombre_legal = '';
                    searchBroker.ramo = this.branch;
                    searchBroker.estado = 1;
                    break;
                case '2':
                    searchBroker.tipo_busqueda = this.Inputs.P_TYPE_SEARCH;
                    searchBroker.tipo_documento = '';
                    searchBroker.documento = '';
                    searchBroker.nombre_legal =
                        this.Inputs.P_SLEGALNAME.toUpperCase();
                    searchBroker.ramo = this.branch;
                    searchBroker.estado = 1;
                    break;
            }

            this.clientInformationService.getProviderList(searchBroker).subscribe(
                (res) => {
                    if (res.cod_error == 0) {
                        if (res.providerList != null && res.providerList.length > 0) {
                            this.listEndoser = res.providerList;
                            this.totalItems = this.listEndoser.length;
                            this.listToShow = this.listEndoser.slice(
                                (this.currentPage - 1) * this.itemsPerPage,
                                this.currentPage * this.itemsPerPage
                            );
                        } else {
                            swal.fire(
                                'Información',
                                'No hay información con los datos ingresados',
                                'error'
                            );
                        }
                    } else {
                        swal.fire('Información', res.smessage, 'error');
                    }
                },
                (err) => {
                    swal.fire(
                        'Información',
                        'Ocurrió un problema al solicitar su petición',
                        'error'
                    );
                }
            );
        }
    }

    pageChanged(currentPage) {
        this.currentPage = currentPage;
        this.listToShow = this.listEndoser;
        this.listToShow = this.listEndoser.slice(
            (this.currentPage - 1) * this.itemsPerPage,
            this.currentPage * this.itemsPerPage
        );
    }

    mostrarMas() {
        this.pageChanged(1);
    }

    documentNumberKeyPress(event: any) {
        CommonMethods.validarNroDocumento(event, this.Inputs.P_NIDDOC_TYPE);
    }

    textValidate(event: any, type) {
        CommonMethods.textValidate(event, type);
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
                    this.formModalReference.close()
                }
            });
    }

}
