import { Component, OnInit, Input, AfterContentInit } from '@angular/core';

//Importación de servicios
import { ClientInformationService } from '../../services/shared/client-information.service';
import { QuotationService } from '../../services/quotation/quotation.service';
import swal from 'sweetalert2';
import { CommonMethods } from '../../components/common-methods';

@Component({
    selector: 'app-search-school',
    templateUrl: './search-school.component.html',
    styleUrls: ['./search-school.component.css']
})
export class SearchSchoolComponent implements OnInit {
    @Input() public formModalReference: any;
    @Input() public listColegios: any;

    blockSearch: any = true;
    blockDoc = true;
    stateSearch = false;
    maxlength = 8;
    minlength = 8;
    InputsColegio: any = {};
    colegioList: any = [];
    searchText = "";

    selectedColegio: string;
    currentPage = 1; //página actual
    rotate = true; //
    maxSize = 5; // cantidad de paginas que se mostrarán en el paginado
    itemsPerPage = 5; // limite de items por página
    totalItems = 0; //total de items encontrados
    listToShow: any[] = [];
    isLoading: boolean = false;

    constructor(
        private quotationService: QuotationService,
        private clientInformationService: ClientInformationService
    ) { }

    ngOnInit() {
        // this.getDocumentTypeList();

        //Datos Contratante
        this.InputsColegio.P_TYPE_SEARCH = "1";
        this.InputsColegio.P_NIDDOC_TYPE = "1"; // Tipo de documento
        this.InputsColegio.P_SIDDOC = ""; // Nro de documento
        this.InputsColegio.P_SFIRSTNAME = ""; // Nombre
        this.InputsColegio.P_SLASTNAME = ""; // Apellido Paterno
        this.InputsColegio.P_SLASTNAME2 = ""; // Apellido Materno
        this.InputsColegio.P_SLEGALNAME = ""; // Razon social
        this.InputsColegio.P_SE_MAIL = ""; // Email
        this.InputsColegio.P_SDESDIREBUSQ = ""; // Direccion

        this.onSelectTypeDocument(this.InputsColegio.P_NIDDOC_TYPE);
    }

    onSelectTypeSearch() {
        switch (this.InputsColegio.P_TYPE_SEARCH) {
            case "1":
                this.blockSearch = true;
                this.stateSearch = false;
                this.blockDoc = true;
                this.resetInputs();
                break;

            case "2":
                this.blockSearch = false;
                this.stateSearch = true;
                this.blockDoc = false;
                this.resetInputs();
                break;
        }
    }

    resetInputs() {
        this.InputsColegio.P_NIDDOC_TYPE = "1";
        this.InputsColegio.P_SIDDOC = "";
        this.InputsColegio.P_PERSON_TYPE = "2";
        this.InputsColegio.P_SLEGALNAME = "";
        this.InputsColegio.P_SFIRSTNAME = "";
        this.InputsColegio.P_SLASTNAME = "";
        this.InputsColegio.P_SLASTNAME2 = "";
        this.colegioList = [];
    }

    onSelectTypeDocument(typeDocumentID) {
        let response = CommonMethods.selTipoDocumento(typeDocumentID)
        this.maxlength = response.maxlength
        this.minlength = response.minlength
        this.blockDoc = true
    }

    chooseSchool(selection: any) {
        if (selection != undefined) {
            this.formModalReference.close(selection);
        } else {
            return;
        }
    }

    chooseSchoolClk(selection: any) {
        if (selection != undefined && selection != "") {
            let existe: any = 0;
            if (this.colegioList.length > 0) {
                this.colegioList.forEach(element => {
                    if (element.P_SIDDOC == selection) {
                        this.formModalReference.close(element);
                    }
                });
            }
        } else {
            return;
        }
    }

    validateDocumentTypeAndNumber(): string {
        let msg = "";

        if (this.InputsColegio.P_TYPE_SEARCH === "1") {
            const trimmedSidDoc = this.InputsColegio.P_SIDDOC.trim();
            if (trimmedSidDoc === "") {
                msg += "Debe ingresar el número de documento <br />";
            } else {
                if (trimmedSidDoc.length < this.minlength) {
                    msg += 'El número de documento debe tener como mínimo ' + this.minlength + ' dígitos <br />';
                }

                if (trimmedSidDoc === "12345678") {
                    msg += "El número de documento no es válido <br />";
                }

                if (
                    this.InputsColegio.P_NIDDOC_TYPE === 1 &&
                    trimmedSidDoc.length > 1 &&
                    !["10", "15", "17", "20"].includes(trimmedSidDoc.substr(0, 2))
                ) {
                    msg += "El número de RUC no es válido, debe empezar con 10, 15, 17, 20";
                }
            }
        }

        return msg;
    }

    // validateNameAndSurname(): string {
    //     let msg = "";

    //     if (this.InputsColegio.P_TYPE_SEARCH === "2") {
    //         const trimmedFirstName = this.InputsColegio.P_SFIRSTNAME.trim();
    //         const trimmedLastName = this.InputsColegio.P_SLASTNAME.trim();

    //         if (trimmedFirstName === "" && trimmedLastName === "") {
    //             msg += "Debe ingresar nombre y apellido paterno <br />";
    //         } else {
    //             if (trimmedFirstName.length < 3) {
    //                 msg += "Debe ingresar al menos 2 caracteres en nombre <br />";
    //             }
    //             if (trimmedLastName.length < 3) {
    //                 msg += "Debe ingresar al menos 2 caracteres en apellido paterno <br />";
    //             }
    //         }
    //     }

    //     return msg;
    // }

    validateLegalName(): string {
        let msg = "";

        if (this.InputsColegio.P_TYPE_SEARCH === "2") {
            if (this.InputsColegio.P_PERSON_TYPE === "2" && this.InputsColegio.P_SLEGALNAME.trim().length < 2) {
                msg += "Debe ingresar al menos 2 caracteres en razón social <br />";
            }
        }

        return msg;
    }

    SearchContrator() {
        let msg: string = "";

        msg = this.validateDocumentTypeAndNumber() + this.validateLegalName()

        if (msg != "") {
            swal.fire("Información", msg, "error");
            return;
        } else {
            this.colegioList = [];
            const data: any = {};

            data.P_TipOper = 'CON';
            data.P_NUSERCODE = JSON.parse(localStorage.getItem('currentUser'))['id'];

            switch (this.InputsColegio.P_TYPE_SEARCH) {
                case "1":
                    data.P_NIDDOC_TYPE = this.InputsColegio.P_NIDDOC_TYPE;
                    data.P_SIDDOC = this.InputsColegio.P_SIDDOC.toUpperCase();
                    break;
                case "2":
                    data.P_SFIRSTNAME = this.InputsColegio.P_SFIRSTNAME.toUpperCase();
                    data.P_SLASTNAME = this.InputsColegio.P_SLASTNAME.toUpperCase();
                    data.P_SLASTNAME2 = this.InputsColegio.P_SLASTNAME2.toUpperCase();
                    data.P_SLEGALNAME = this.InputsColegio.P_SLEGALNAME.toUpperCase();
                    break;
            }

            this.isLoading = true;

            this.clientInformationService.getCliente360(data).subscribe(
                res => {
                    this.isLoading = false;

                    if (res.P_NCODE === '0') {
                        if (res.EListClient.length > 0) {
                            this.colegioList = res.EListClient;
                            this.totalItems = this.colegioList.length;
                            this.listToShow = this.colegioList.slice(((this.currentPage - 1) * this.itemsPerPage), (this.currentPage * this.itemsPerPage));
                        } else {
                            swal.fire("Información", "No hay información con los datos ingresados", "error");
                        }
                    } else {
                        swal.fire('Información', res.P_SMESSAGE, 'error');
                    }
                },
                err => {
                }
            );
        }
    }

    pageChanged(currentPage) {
        this.currentPage = currentPage;
        this.listToShow = this.colegioList
        this.listToShow = this.colegioList.slice(((this.currentPage - 1) * this.itemsPerPage), (this.currentPage * this.itemsPerPage));
    }

    mostrarMas() {
        this.pageChanged(1);
    }

    documentNumberKeyPress(event: any) {
        CommonMethods.validarNroDocumento(event, this.InputsColegio.P_NIDDOC_TYPE)
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
