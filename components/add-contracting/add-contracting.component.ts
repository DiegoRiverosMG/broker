import { Component, OnInit } from '@angular/core';
import { BsDatepickerConfig } from 'ngx-bootstrap/datepicker';
import { NgbModal, ModalDismissReasons, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { ActivatedRoute, Router } from '@angular/router';
import { DatePipe } from '@angular/common';

// Importación de servicios
import { ClientInformationService } from '../../services/shared/client-information.service';
import { ContractorLocationIndexService } from '../../services/maintenance/contractor-location/contractor-location-index/contractor-location-index.service';

// Importacion de modelos
import { DocumentType } from '../../models/shared/client-information/document-type';
import { Nacionality } from '../../models/shared/client-information/nationality-type';
import { Gender } from '../../models/shared/client-information/gender-type';
import { CivilStatus } from '../../models/shared/client-information/civilStatus-type';
import { Profession } from '../../models/shared/client-information/profession-type';
import { EconomicActivity } from '../../models/shared/client-information/economic-activity';
import { ContractorLocationContactREQUEST } from '../../models/maintenance/contractor-location/Request/contractor-location-contact-request';
import { ClientDataToSearch } from '../../models/shared/client-information/client-data-to-search';

// componentes para ser usados como MODAL
import { AddTelephoneComponent } from '../../modal/add-telephone/add-telephone.component';
import { AddAddressComponent } from '../../modal/add-address/add-address.component';
import { AddContactComponent } from '../../modal/add-contact/add-contact.component';
import { AddEmailComponent } from '../../modal/add-email/add-email.component';
import { AddCiiuComponent } from '../../modal/add-ciiu/add-ciiu.component';
import swal from 'sweetalert2';
import { AddressService } from '../../services/shared/address.service';
import { CommonMethods } from '../common-methods';


@Component({
    selector: 'app-add-contracting',
    templateUrl: './add-contracting.component.html',
    styleUrls: ['./add-contracting.component.css']
})
export class AddContractingComponent implements OnInit {
    bsValueFNac: any;
    bsConfig: Partial<BsDatepickerConfig>;
    documentTypeList: DocumentType[];
    nacionalityList: Nacionality[];
    genderList: Gender[];
    civilStatusList: CivilStatus[];
    professionList: Profession[];
    inputsContracting: any = {};
    typeContact: any = {};
    blockDoc = true;
    blockProTyp = true;
    typeDocument = 0;
    lblBirthday = 'FECHA DE NACIMIENTO (*)';
    receiverApp = '';
    codStatus = 0;
    loadingScreen = true;
    codProduct = JSON.parse(localStorage.getItem('codProducto'))['productId'];
    inputsValidate: any = {};
    //nbranch = JSON.parse(localStorage.getItem('vilpID'))['nbranch'];
    //usuario = JSON.parse(localStorage.getItem('currentUser'))['id'];
    // Datos retorno Rebill
    dataRebill: any = {};

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private modalService: NgbModal,
        private clientInformationService: ClientInformationService,
        private contractorLocationIndexService: ContractorLocationIndexService,
        private addressService: AddressService,
        private datePipe: DatePipe
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
        this.getDocumentTypeList();
        this.getNationalityList();
        this.getGenderList();
        this.getCivilStatusList();

        this.inputsValidate = CommonMethods.generarCampos(10, 0);
        this.bsValueFNac = new Date('01/01/1990');
        this.inputsContracting.EListAddresClient = [];
        this.inputsContracting.EListPhoneClient = [];
        this.inputsContracting.EListEmailClient = [];
        this.inputsContracting.EListContactClient = [];
        this.inputsContracting.EListCIIUClient = [];

        this.route.queryParams
            .subscribe(params => {
                this.inputsContracting.P_NIDDOC_TYPE = params.typeDocument;
                this.inputsContracting.P_SIDDOC = params.document;
                this.receiverApp = params.receiver;
                this.codStatus = params.code;
                //Si redireciona de rebill.component
                if (params.receiver === 'rebill') {
                    this.dataRebill = JSON.parse(params.dataRebill);
                }
            });

        if (this.inputsContracting.P_NIDDOC_TYPE != undefined &&
            this.inputsContracting.P_SIDDOC != undefined &&
            this.inputsContracting.P_NIDDOC_TYPE != '' &&
            this.inputsContracting.P_SIDDOC != '' &&
            this.receiverApp != undefined
            && this.receiverApp != '') {
            if (this.inputsContracting.P_NIDDOC_TYPE == 1 && this.inputsContracting.P_SIDDOC.trim().length > 1) {
                if (CommonMethods.validateRuc(this.inputsContracting.P_SIDDOC)) {
                    swal.fire('Información', 'El número de RUC no es válido, debe empezar con 10, 15, 17, 20', 'error');
                    return;
                }
            }

            const data = new ClientDataToSearch();
            data.P_TipOper = 'CON';
            data.P_NUSERCODE = JSON.parse(localStorage.getItem('currentUser'))['id'];
            data.P_NIDDOC_TYPE = this.inputsContracting.P_NIDDOC_TYPE;
            data.P_SIDDOC = this.inputsContracting.P_SIDDOC;

            if (this.codStatus == 3) {
                this.blockDoc = false;
                this.initializeInputs();
            } else {
                this.loadingScreen = false;
                await this.clientInformationService.getCliente360(data).toPromise().then(
                    async res => {
                        this.loadingScreen = true;
                        if (res.EListClient != null) {
                            if (res.EListClient.length > 0) {
                                if (res.EListClient[0].P_SCLIENT == null) {
                                    await this.initializeContractor(res);
                                } else {
                                    swal.fire('Información', 'El contratante ingresado ya se encuentra en nuestra base de datos.', 'question')
                                        .then((value) => {
                                            this.redirectFrom(res);
                                        });
                                }
                            } else {
                                this.initializeInputs();
                            }
                        } else {
                            this.initializeInputs();
                        }
                    },
                    err => {
                        this.loadingScreen = true;
                    }
                );
            }

            if (this.codStatus == 4) {
                this.blockProTyp = true;
            }

            this.changeDocument(this.inputsContracting.P_SIDDOC);
        } else {
            this.router.navigate(['/extranet/quotation']);
        }
    }

    initializeContractor(res: any) {
        this.inputsContracting = res.EListClient[0];
        this.inputsContracting.P_TipOper = 'INS';
        if (res.EListClient[0].P_DBIRTHDAT != null) {
            let dd = res.EListClient[0].P_DBIRTHDAT.substr(0, 2);
            let mm = res.EListClient[0].P_DBIRTHDAT.substr(3, 2);
            let yy = res.EListClient[0].P_DBIRTHDAT.substr(6, 4);
            this.bsValueFNac = new Date(mm + '/' + dd + '/' + yy);
        } else {
            this.bsValueFNac = new Date('01/01/1990');
        }
        this.inputsContracting.P_NSPECIALITY = res.EListClient[0].P_NSPECIALITY != null ? res.EListClient[0].P_NSPECIALITY : '99';
        this.inputsContracting.P_SBLOCKADE = '2';
        this.inputsContracting.P_NTITLE = res.EListClient[0].P_NTITLE != null ? res.EListClient[0].P_NTITLE : '99';
        if (this.inputsContracting.P_NIDDOC_TYPE == 1) {
            if (this.inputsContracting.P_SIDDOC.substr(0, 2) == '20') {
                this.inputsContracting.P_SSEXCLIEN = res.EListClient[0].P_SSEXCLIEN != null ? res.EListClient[0].P_SSEXCLIEN : '';
                this.inputsContracting.P_NCIVILSTA = res.EListClient[0].P_NCIVILSTA != null ? res.EListClient[0].P_NCIVILSTA : '';
            } else {
                this.inputsContracting.P_SSEXCLIEN = res.EListClient[0].P_SSEXCLIEN != null ? res.EListClient[0].P_SSEXCLIEN : '3';
                this.inputsContracting.P_NCIVILSTA = res.EListClient[0].P_NCIVILSTA != null ? res.EListClient[0].P_NCIVILSTA : '5';
            }
        } else {
            this.inputsContracting.P_SSEXCLIEN = res.EListClient[0].P_SSEXCLIEN != '' ? res.EListClient[0].P_SSEXCLIEN : '3';
            this.inputsContracting.P_NCIVILSTA = res.EListClient[0].P_NCIVILSTA != null ? res.EListClient[0].P_NCIVILSTA : '5';
        }
        this.inputsContracting.P_ORIGEN_DATA = res.EListClient[0].P_ORIGEN_DATA != null ? res.EListClient[0].P_ORIGEN_DATA : 'GESTORCLIENTE';
        this.inputsContracting.P_RESTRICCION = res.EListClient[0].P_RESTRICCION;
        this.inputsContracting.P_NNATIONALITY = res.EListClient[0].P_NNATIONALITY != null ? res.EListClient[0].P_NNATIONALITY : '1';
        this.inputsContracting.P_SBLOCKLAFT = '2'; // 1 o 2 Lavado de activos
        this.inputsContracting.P_SISCLIENT_IND = '2'; // 1 o 2 Cliente protecta
        this.inputsContracting.P_SISRENIEC_IND = res.EListClient[0].P_SISRENIEC_IND != null ? res.EListClient[0].P_SISRENIEC_IND : '2';
        this.inputsContracting.P_SPOLIZA_ELECT_IND = '2'; // 1 o 2 poliza electronica
        this.inputsContracting.P_SDIG_VERIFICACION = res.EListClient[0].P_DIG_VERIFICACION;
        this.inputsContracting.P_SISCLIENT_GBD = '2';
        this.inputsContracting.P_SPROTEG_DATOS_IND =
            res.EListClient[0].P_SPROTEG_DATOS_IND == null ? '2' : res.EListClient[0].P_SPROTEG_DATOS_IND; // 1 o 2 proteccion de datos
        this.inputsContracting.P_SISCLIENT_CONTRA = '1'; // Indicador de contratante
        this.inputsContracting.P_NUSERCODE = JSON.parse(localStorage.getItem('currentUser'))['id'];
        this.inputsContracting.P_SCONDDOMICILIO = res.EListClient[0].P_SCONDDOMICILIO;
        this.inputsContracting.P_SESTADOCONTR = res.EListClient[0].P_SESTADOCONTR;
        this.inputsContracting.EListAddresClient = res.EListClient[0].EListAddresClient == null ? [] : res.EListClient[0].EListAddresClient;
        let numdir = 1;
        if (this.inputsContracting.EListAddresClient.length > 0) {
            this.inputsContracting.EListAddresClient.forEach(async item => {
                item.P_NROW = numdir++;
                item.P_CLASS = '';
                item.P_DESTIDIRE = 'PARTICULAR';
                item.P_SRECTYPE = item.P_SRECTYPE == '' || item.P_SRECTYPE == null ? '2' : item.P_SRECTYPE;
                item.P_STI_DIRE = item.P_STI_DIRE == '' || item.P_STI_DIRE == null ? '88' : item.P_STI_DIRE;
                item.P_SNUM_DIRECCION = item.P_SNUM_DIRECCION == '' || item.P_SNUM_DIRECCION == null ? '0' : item.P_SNUM_DIRECCION;
                item.P_DESDEPARTAMENTO = item.P_DESDEPARTAMENTO == null ? item.P_SDES_DEP_DOM : item.P_DESDEPARTAMENTO;
                item.P_DESPROVINCIA = item.P_DESPROVINCIA == null ? item.P_SDES_PRO_DOM : item.P_DESPROVINCIA;
                item.P_DESDISTRITO = item.P_DESDISTRITO == null ? item.P_SDES_DIS_DOM : item.P_DESDISTRITO;
                item.P_NCOUNTRY = item.P_NCOUNTRY == null || item.P_NCOUNTRY == '' ? '1' : item.P_NCOUNTRY;
                await this.getDepartmentList(item);
                await this.getProvinceList(item);
                await this.getDistrictList(item);
                item.P_SNOM_DIRECCION = item.P_SNOM_DIRECCION == '' ? 'NO ESPECIFICADO' : item.P_SNOM_DIRECCION.replace(/[().]/g, '').replace(/[-]/g, '');
                if (this.inputsContracting.P_NIDDOC_TYPE == 1) {
                    item.P_SNOM_DIRECCION = item.P_SNOM_DIRECCION.substr(0, item.P_SNOM_DIRECCION.length - item.P_DESDISTRITO.length).trim();
                    item.P_SNOM_DIRECCION = item.P_SNOM_DIRECCION.substr(0, item.P_SNOM_DIRECCION.length - item.P_DESPROVINCIA.length).trim();
                    item.P_SNOM_DIRECCION = item.P_SNOM_DIRECCION.substr(0, item.P_SNOM_DIRECCION.length - item.P_DESDEPARTAMENTO.length).trim().substr(0, 79);
                    item.P_SDESDIREBUSQ = item.P_SDESDIREBUSQ == '' ? item.P_SDESDIREBUSQ : item.P_SDESDIREBUSQ.replace(/[().]/g, '').replace(/[-]/g, '');
                    item.P_SDESDIREBUSQ = item.P_SDESDIREBUSQ.substr(0, item.P_SDESDIREBUSQ.length - item.P_DESDISTRITO.length).trim();
                    item.P_SDESDIREBUSQ = item.P_SDESDIREBUSQ.substr(0, item.P_SDESDIREBUSQ.length - item.P_DESPROVINCIA.length).trim();
                    item.P_SDESDIREBUSQ = item.P_SDESDIREBUSQ.substr(0, item.P_SDESDIREBUSQ.length - item.P_DESDEPARTAMENTO.length).trim().substr(0, 79);
                }
            });
        }

        this.inputsContracting.EListPhoneClient = res.EListClient[0].EListPhoneClient == null ? [] : res.EListClient[0].EListPhoneClient;
        let numtel = 1;
        this.inputsContracting.EListPhoneClient.forEach(item => {
            item.P_NROW = numtel++;
            item.P_CLASS = '';
        });
        this.inputsContracting.EListEmailClient = res.EListClient[0].EListEmailClient == null ? [] : res.EListClient[0].EListEmailClient;
        let numcor = 1;
        this.inputsContracting.EListEmailClient.forEach(item => {
            item.P_NROW = numcor++;
            item.P_CLASS = '';
        });
        this.inputsContracting.EListContactClient = res.EListClient[0].EListContactClient == null ? [] : res.EListClient[0].EListContactClient;
        let numcon = 1;
        this.inputsContracting.EListContactClient.forEach(item => {
            item.P_NROW = numcon++;
            item.P_CLASS = '';
        });
        this.inputsContracting.EListCIIUClient = res.EListClient[0].EListCIIUClient == null ? [] : res.EListClient[0].EListCIIUClient;
        let numciiu = 1;
        this.inputsContracting.EListCIIUClient.forEach(item => {
            item.P_NROW = numciiu++;
            item.P_CLASS = '';
        });
        this.typeContact.P_NIDDOC_TYPE = this.inputsContracting.P_NIDDOC_TYPE;
        this.typeContact.P_SIDDOC = this.inputsContracting.P_SIDDOC;
    }

    redirectFrom(contractor) {
        switch (this.receiverApp) {
            case 'quotation':
                if(this.codProduct == 2){ //AVS - INTERCONEXION SABSA 
                    this.router.navigate(['/extranet/sctr/cotizador'], { queryParams: { typeDocument: this.inputsContracting.P_NIDDOC_TYPE, document: this.inputsContracting.P_SIDDOC } });
                    break;
                }else{
                    this.router.navigate(['/extranet/quotation'], { queryParams: { typeDocument: this.inputsContracting.P_NIDDOC_TYPE, document: this.inputsContracting.P_SIDDOC } });
                    break;
                }
            case 'quotation-covid':
                this.router.navigate(['/extranet/quotation-covid'], { queryParams: { typeDocument: this.inputsContracting.P_NIDDOC_TYPE, document: this.inputsContracting.P_SIDDOC } });
                break;
            case 'agency':
                this.router.navigate(['/extranet/agency-form'], { queryParams: { DocumentType: this.inputsContracting.P_NIDDOC_TYPE, DocumentNumber: this.inputsContracting.P_SIDDOC, ContractorId: contractor.P_SCOD_CLIENT, Sender: 'add-contractor' } });
                break;
            case 'contractor-location':
                this.router.navigate(['/extranet/contractor-location'], { queryParams: { DocumentType: this.inputsContracting.P_NIDDOC_TYPE, DocumentNumber: this.inputsContracting.P_SIDDOC, Sender: 'add-contractor' } });
                break;
            case 'mantenimiento-endosatario':
                this.router.navigate(['/extranet/desgravamen/mantenimiento-endosatario'], { queryParams: { DocumentType: this.inputsContracting.P_NIDDOC_TYPE, DocumentNumber: this.inputsContracting.P_SIDDOC, Sender: 'add-contractor' } });
                break;
            case 'rebill':
                // Retorno de datos a rebill
                const strDataRebill = JSON.stringify({
                    numBill: this.dataRebill.numBill,
                    newRuc: this.dataRebill.newRuc,
                    billData: this.dataRebill.billData,
                    stateFormRebill: this.dataRebill.stateFormRebill,
                    newClient: {
                        idClient: contractor.P_SCOD_CLIENT,
                        legalName: this.dataRebill.newClient.legalName,
                        viewFullName: contractor.P_SCOD_CLIENT + ' - ' + this.dataRebill.newClient.legalName
                    }
                });
                this.router.navigate(['/extranet/rebill'], { queryParams: { dataRebill: strDataRebill } });
                break;
            default:
                if (this.receiverApp) {
                    this.router.navigate([this.receiverApp], { queryParams: { typeDocument: this.inputsContracting.P_NIDDOC_TYPE, document: this.inputsContracting.P_SIDDOC } });
                }
                break;
        }
    }

    async getDepartmentList(itemDireccion: any) {
        await this.addressService.getDepartmentList().toPromise().then(
            res => {
                if (itemDireccion.P_NPROVINCE != null) {
                    itemDireccion.P_NPROVINCE = Number(itemDireccion.P_NPROVINCE);
                } else {
                    res.forEach(element => {
                        if (element.Name == itemDireccion.P_DESDEPARTAMENTO) {
                            itemDireccion.P_NPROVINCE = element.Id;
                        }
                    });
                }
            },
            err => { }
        );
    }

    async getProvinceList(itemDireccion: any) {
        if (itemDireccion.P_NPROVINCE != null && itemDireccion.P_NPROVINCE != '') {
            return await this.addressService.getProvinceList(itemDireccion.P_NPROVINCE).toPromise().then(
                res => {
                    if (itemDireccion.P_NLOCAL != null) {
                        itemDireccion.P_NLOCAL = Number(itemDireccion.P_NLOCAL);
                    } else {
                        res.forEach(element => {
                            if (itemDireccion.P_DESPROVINCIA.search('CALLAO') !== -1) {
                                itemDireccion.P_NLOCAL = element.Id;
                            } else {
                                if (element.Name == itemDireccion.P_DESPROVINCIA) {
                                    itemDireccion.P_NLOCAL = element.Id;
                                }
                            }
                        });
                    }
                },
                err => { }
            );
        } else {
            return itemDireccion.P_NLOCAL = null;
        }
    }

    async getDistrictList(itemDireccion: any) {
        if (itemDireccion.P_NLOCAL != null && itemDireccion.P_NLOCAL != '') {
            return await this.addressService.getDistrictList(itemDireccion.P_NLOCAL).toPromise().then(
                res => {
                    if (itemDireccion != null) {
                        if (itemDireccion.P_NMUNICIPALITY != null) {
                            itemDireccion.P_NMUNICIPALITY = Number(itemDireccion.P_NMUNICIPALITY);
                        } else {
                            res.forEach(element => {
                                if (element.Name == itemDireccion.P_DESDISTRITO) {
                                    itemDireccion.P_NMUNICIPALITY = element.Id;
                                }
                            });
                        }
                    }
                },
                err => { }
            );
        } else {
            return itemDireccion.P_NMUNICIPALITY = null;
        }
    }

    initializeInputs() {
        this.inputsContracting.P_TipOper = 'INS';
        this.inputsContracting.P_SFIRSTNAME = '';
        this.inputsContracting.P_SLASTNAME = '';
        this.inputsContracting.P_SLASTNAME2 = '';
        this.inputsContracting.P_SLEGALNAME = '';
        this.inputsContracting.P_SSEXCLIEN = '3';
        this.inputsContracting.P_DBIRTHDAT = '';
        this.inputsContracting.P_NSPECIALITY = '99';
        this.inputsContracting.P_NCIVILSTA = '5';
        this.inputsContracting.P_SBLOCKADE = '2';
        this.inputsContracting.P_NTITLE = '99';
        this.inputsContracting.P_NHEIGHT = null;
        this.inputsContracting.P_ORIGEN_DATA = 'GESTORCLIENTE';
        this.inputsContracting.P_NNATIONALITY = 1;
        this.inputsContracting.P_SBLOCKLAFT = '2'; //1 o 2 Lavado de activos
        this.inputsContracting.P_SISCLIENT_IND = '2'; //1 o 2 Cliente protecta
        this.inputsContracting.P_SISRENIEC_IND = '2';
        this.inputsContracting.P_SISCLIENT_GBD = '2';
        this.inputsContracting.P_SPOLIZA_ELECT_IND = '2'; //1 o 2 poliza electronica
        this.inputsContracting.P_SPROTEG_DATOS_IND = '2'; //1 o 2 proteccion de datos
        this.inputsContracting.P_COD_CUSPP = '';
        this.inputsContracting.P_NUSERCODE = JSON.parse(localStorage.getItem('currentUser'))['id'];
        this.typeContact.P_NIDDOC_TYPE = this.inputsContracting.P_NIDDOC_TYPE;
        this.typeContact.P_SIDDOC = this.inputsContracting.P_SIDDOC;
    }

    clearValidate(numInput) {
        this.inputsValidate[numInput] = false;
    }

    //Section Teléfono
    editPhone(row) {
        let modalRef: NgbModalRef;
        let itemTelefono: any = {};
        modalRef = this.modalService.open(AddTelephoneComponent, { size: 'lg', backdropClass: 'light-blue-backdrop', backdrop: 'static', keyboard: false });
        modalRef.componentInstance.reference = modalRef;
        this.inputsContracting.EListPhoneClient.map(function (dato) {
            if (dato.P_NROW === row) {
                itemTelefono = dato;
            }
        });
        modalRef.componentInstance.itemTelefono = itemTelefono;
        modalRef.componentInstance.listaTelefonos = this.inputsContracting.EListPhoneClient;
    }

    deletePhone(row) {
        swal.fire({
            title: 'Eliminar Teléfono',
            text: '¿Estás seguro que deseas eliminar esta teléfono?',
            icon: 'info',
            showCancelButton: true,
            confirmButtonText: 'Eliminar',
            cancelButtonText: 'Cancelar'
        })
            .then((result) => {
                if (result.value) {
                    this.inputsContracting.EListPhoneClient.splice(row, 1);
                }
            });
    }

    revertPhone(row) {
        swal.fire({
            title: 'Activar Teléfono',
            text: '¿Estás seguro que deseas activar esta teléfono?',
            icon: 'info',
            showCancelButton: true,
            confirmButtonText: 'Activar',
            cancelButtonText: 'Cancelar'
        })
            .then((result) => {
                if (result.value) {
                    this.inputsContracting.EListPhoneClient.map(function (dato) {
                        if (dato.P_NROW === row) {
                            dato.P_TipOper = '';
                            dato.P_CLASS = '';
                        }
                    });
                }
            });
    }

    //Section Correo
    editEmail(row) {
        let modalRef: NgbModalRef;
        let itemCorreo: any = {};
        modalRef = this.modalService.open(AddEmailComponent, { size: 'lg', backdropClass: 'light-blue-backdrop', backdrop: 'static', keyboard: false });
        modalRef.componentInstance.reference = modalRef;
        this.inputsContracting.EListEmailClient.map(function (dato) {
            if (dato.P_NROW === row) {
                itemCorreo = dato;
            }
        });
        modalRef.componentInstance.itemCorreo = itemCorreo;
        modalRef.componentInstance.listaCorreos = this.inputsContracting.EListEmailClient;
    }

    deleteEmail(row) {
        swal.fire({
            title: 'Eliminar Correo',
            text: '¿Estás seguro que deseas eliminar esta correo?',
            icon: 'info',
            showCancelButton: true,
            confirmButtonText: 'Eliminar',
            cancelButtonText: 'Cancelar'
        })
            .then((result) => {
                if (result.value) {
                    this.inputsContracting.EListEmailClient.splice(row, 1);
                }
            });
    }

    revertEmail(row) {
        swal.fire({
            title: 'Activar Correo',
            text: '¿Estás seguro que deseas activar esta correo?',
            icon: 'info',
            showCancelButton: true,
            confirmButtonText: 'Activar',
            cancelButtonText: 'Cancelar'
        })
            .then((result) => {
                if (result.value) {
                    this.inputsContracting.EListEmailClient.map(function (dato) {
                        if (dato.P_NROW === row) {
                            dato.P_TipOper = '';
                            dato.P_CLASS = '';
                        }
                    });
                }
            });
    }

    // Section Dirección
    editAddress(row) {
        let modalRef: NgbModalRef;
        let itemDireccion: any = {};
        modalRef = this.modalService.open(AddAddressComponent, { size: 'lg', backdropClass: 'light-blue-backdrop', backdrop: 'static', keyboard: false });
        modalRef.componentInstance.reference = modalRef;
        this.inputsContracting.EListAddresClient.map(function (dato) {
            if (dato.P_NROW === row) {
                itemDireccion = dato;
            }
        });
        modalRef.componentInstance.itemDireccion = itemDireccion;
        modalRef.componentInstance.listaDirecciones = this.inputsContracting.EListAddresClient;
    }

    deleteAddress(row) {
        swal.fire({
            title: 'Eliminar Dirección',
            text: '¿Estás seguro que deseas eliminar esta dirección?',
            icon: 'info',
            showCancelButton: true,
            confirmButtonText: 'Eliminar',
            cancelButtonText: 'Cancelar'
        })
            .then((result) => {
                if (result.value) {
                    this.inputsContracting.EListAddresClient.splice(row, 1);
                }
            });
    }

    revertAddress(row) {
        swal.fire({
            title: 'Activar Dirección',
            text: '¿Estás seguro que deseas activar esta dirección?',
            icon: 'info',
            showCancelButton: true,
            confirmButtonText: 'Activar',
            cancelButtonText: 'Cancelar'
        })
            .then((result) => {
                if (result.value) {
                    this.inputsContracting.EListAddresClient.map(function (dato) {
                        if (dato.P_NROW === row) {
                            dato.P_TipOper = '';
                            dato.P_CLASS = '';
                        }
                    });
                }
            });
    }

    // Section Contacto
    editContact(row) {
        let modalRef: NgbModalRef;
        let itemContacto: any = {};
        modalRef = this.modalService.open(AddContactComponent, { size: 'lg', backdropClass: 'light-blue-backdrop', backdrop: 'static', keyboard: false });
        modalRef.componentInstance.reference = modalRef;
        this.typeContact.P_NIDDOC_TYPE = this.inputsContracting.P_NIDDOC_TYPE;
        this.typeContact.P_SIDDOC = this.inputsContracting.P_SIDDOC;
        modalRef.componentInstance.typeContact = this.typeContact;
        this.inputsContracting.EListContactClient.map(function (dato) {
            if (dato.P_NROW === row) {
                itemContacto = dato;
            }
        });
        modalRef.componentInstance.itemContacto = itemContacto;
        modalRef.componentInstance.listaContactos = this.inputsContracting.EListContactClient;
    }

    deleteContact(row) {
        swal.fire({
            title: 'Eliminar Contacto',
            text: '¿Estás seguro que deseas eliminar esta contacto?',
            icon: 'info',
            showCancelButton: true,
            confirmButtonText: 'Eliminar',
            cancelButtonText: 'Cancelar'
        })
            .then((result) => {
                if (result.value) {
                    this.inputsContracting.EListContactClient.splice(row, 1);
                }
            });
    }

    revertContact(row) {
        swal.fire({
            title: 'Activar Contacto',
            text: '¿Estás seguro que deseas activar esta contacto?',
            icon: 'info',
            showCancelButton: true,
            confirmButtonText: 'Activar',
            cancelButtonText: 'Cancelar'
        })
            .then((result) => {
                if (result.value) {
                    this.inputsContracting.EListContactClient.map(function (dato) {
                        if (dato.P_NROW === row) {
                            dato.P_TipOper = '';
                            dato.P_CLASS = '';
                        }
                    });
                }
            });
    }

    getDocumentTypeList() {
        this.clientInformationService.getDocumentTypeList(this.codProduct).subscribe(
            res => {
                this.documentTypeList = res;
            },
            err => { }
        );
    }

    getNationalityList() {
        this.clientInformationService.getNationalityList().subscribe(
            res => {
                this.nacionalityList = res;
            },
            err => { }
        );
    }

    getGenderList() {
        this.clientInformationService.getGenderList().subscribe(
            res => {
                this.genderList = res;
            },
            err => { }
        );
    }

    getCivilStatusList() {
        this.clientInformationService.getCivilStatusList().subscribe(
            res => {
                this.civilStatusList = res;
            },
            err => { }
        );
    }

    getProfessionList() {
        this.clientInformationService.getProfessionList().subscribe(
            res => {
                this.professionList = res;
            },
            err => { }
        );
    }

    changeDocument(document) {
        if (this.inputsContracting.P_NIDDOC_TYPE == 1 && document.length > 1) {
            if (this.inputsContracting.P_SIDDOC.substr(0, 2) == '10' || this.inputsContracting.P_SIDDOC.substr(0, 2) == '15' || this.inputsContracting.P_SIDDOC.substr(0, 2) == '17') {
                this.blockDoc = true;
                this.lblBirthday = 'FECHA DE NACIMIENTO (*)';
                this.inputsContracting.P_SLEGALNAME = '';
            } else {
                this.blockDoc = false;
                this.lblBirthday = 'FECHA DE CREACIÓN';
                this.inputsContracting.P_SSEXCLIEN = null;
                this.inputsContracting.P_NCIVILSTA = null;
                this.inputsContracting.P_SFIRSTNAME = '';
                this.inputsContracting.P_SLASTNAME = '';
                this.inputsContracting.P_SLASTNAME2 = '';
            }
        } else {
            this.blockDoc = true;
        }
    }

    openModal(modalName: String) {
        let modalRef: NgbModalRef;
        switch (modalName) {
            case 'add-telephone':
                modalRef = this.modalService.open(AddTelephoneComponent, { size: 'lg', backdropClass: 'light-blue-backdrop', backdrop: 'static', keyboard: false });
                modalRef.componentInstance.reference = modalRef;
                modalRef.componentInstance.listaTelefonos = this.inputsContracting.EListPhoneClient;
                modalRef.componentInstance.itemTelefono = null;
                break;
            case 'add-email':
                modalRef = this.modalService.open(AddEmailComponent, { size: 'lg', backdropClass: 'light-blue-backdrop', backdrop: 'static', keyboard: false });
                modalRef.componentInstance.reference = modalRef;
                modalRef.componentInstance.listaCorreos = this.inputsContracting.EListEmailClient;
                modalRef.componentInstance.itemCorreo = null;
                break;
            case 'add-address':
                modalRef = this.modalService.open(AddAddressComponent, { size: 'lg', backdropClass: 'light-blue-backdrop', backdrop: 'static', keyboard: false });
                modalRef.componentInstance.reference = modalRef;
                modalRef.componentInstance.listaDirecciones = this.inputsContracting.EListAddresClient;
                modalRef.componentInstance.itemDireccion = null;
                if (this.receiverApp === 'rebill') {
                    modalRef.componentInstance.estadoModal = 'rebill';
                    modalRef.componentInstance.rebillData = this.dataRebill.billData;
                }
                break;
            case 'add-contact':
                modalRef = this.modalService.open(AddContactComponent, { size: 'lg', backdropClass: 'light-blue-backdrop', backdrop: 'static', keyboard: false });
                modalRef.componentInstance.reference = modalRef;
                this.typeContact.P_NIDDOC_TYPE = this.inputsContracting.P_NIDDOC_TYPE;
                this.typeContact.P_SIDDOC = this.inputsContracting.P_SIDDOC;
                modalRef.componentInstance.typeContact = this.typeContact;
                modalRef.componentInstance.listaContactos = this.inputsContracting.EListContactClient;
                modalRef.componentInstance.itemContacto = null;
                break;
            case 'add-ciiu':
                modalRef = this.modalService.open(AddCiiuComponent, { size: 'lg', backdropClass: 'light-blue-backdrop', backdrop: 'static', keyboard: false });
                modalRef.componentInstance.reference = modalRef;
                modalRef.componentInstance.listaCiiu = this.inputsContracting.EListCIIUClient;
                modalRef.componentInstance.itemCiiu = null;
                break;
        }
    }

    eventSave(event) {
        this.inputsContracting.P_SIDDOC = this.inputsContracting.P_SIDDOC == null ? '' : this.inputsContracting.P_SIDDOC.toUpperCase();
        this.inputsContracting.P_SFIRSTNAME = this.inputsContracting.P_SFIRSTNAME == null ? '' : this.inputsContracting.P_SFIRSTNAME.toUpperCase();
        this.inputsContracting.P_SLEGALNAME = this.inputsContracting.P_SLEGALNAME == null ? '' : this.inputsContracting.P_SLEGALNAME.toUpperCase();
        this.inputsContracting.P_SLASTNAME = this.inputsContracting.P_SLASTNAME == null ? '' : this.inputsContracting.P_SLASTNAME.toUpperCase();
        this.inputsContracting.P_SLASTNAME2 = this.inputsContracting.P_SLASTNAME2 == null ? '' : this.inputsContracting.P_SLASTNAME2.toUpperCase();
        this.inputsContracting.P_DBIRTHDAT = CommonMethods.formatDate(this.bsValueFNac);
        let messageError = '';
        if (this.inputsContracting.P_NIDDOC_TYPE == 1) { //RUC
            if (this.inputsContracting.P_SIDDOC.substr(0, 2) == '10' || this.inputsContracting.P_SIDDOC.substr(0, 2) == '15' || this.inputsContracting.P_SIDDOC.substr(0, 2) == '17') {
                if (this.inputsContracting.P_SFIRSTNAME == '' || this.inputsContracting.P_SFIRSTNAME == null) {
                    this.inputsValidate[0] = true;
                    messageError += 'El nombre del contratante es requerido <br />';
                }
                if (this.inputsContracting.P_SLASTNAME == '' || this.inputsContracting.P_SLASTNAME == null) {
                    this.inputsValidate[2] = true;
                    messageError += 'El apellido paterno del contratante es requerido <br />';
                }
                if (this.inputsContracting.P_SLASTNAME2 == '' || this.inputsContracting.P_SLASTNAME2 == null) {
                    this.inputsValidate[3] = true;
                    messageError += 'El apellido materno del contratante es requerido <br />';
                }
                if (this.inputsContracting.P_DBIRTHDAT == null) {
                    this.inputsValidate[4] = '4';
                    messageError += 'La fecha de nacimiento del contratante es requerido <br />';
                }
            } else {
                if (this.inputsContracting.P_SLEGALNAME == '' || this.inputsContracting.P_SLEGALNAME == null) {
                    this.inputsValidate[1] = true;
                    messageError += 'La razón social del contratante es requerida <br />';
                }
            }

        } else {
            if (this.inputsContracting.P_SFIRSTNAME == '' || this.inputsContracting.P_SFIRSTNAME == null) {
                this.inputsValidate[0] = true;
                messageError += 'El nombre del contratante es requerido <br />';
            }
            if (this.inputsContracting.P_SLASTNAME == '' || this.inputsContracting.P_SLASTNAME == null) {
                this.inputsValidate[2] = true;
                messageError += 'El apellido paterno del contratante es requerido <br />';
            }
            if (this.inputsContracting.P_NIDDOC_TYPE == 2) {
                if (this.inputsContracting.P_SLASTNAME2 == '' || this.inputsContracting.P_SLASTNAME2 == null) {
                    this.inputsValidate[3] = true;
                    messageError += 'El apellido materno del contratante es requerido <br />';
                }
            }
            if (this.inputsContracting.P_DBIRTHDAT == null) {
                this.inputsValidate[4] = true;
                messageError += 'La fecha de nacimiento del contratante es requerido <br />';
            }
        }

        if (this.inputsContracting.EListAddresClient.length == 0) {
            messageError += 'Debe registrar al menos una dirección <br />';
        } else {
            let count = 0;
            this.inputsContracting.EListAddresClient.forEach(dir => {
                if (dir.P_CLASS != '') {
                    count++;
                }
            });

            if (this.inputsContracting.EListAddresClient.length == count) {
                messageError += 'Debe registrar al menos una dirección <br />';
            }
        }

        if (this.inputsContracting.EListContactClient.length > 0) {
            this.inputsContracting.EListContactClient.forEach(contact => {
                if (contact.P_NTIPCONT == 0) {
                    contact.P_NTIPCONT = 99;
                }
                if (contact.P_NIDDOC_TYPE == '0') {
                    contact.P_NIDDOC_TYPE = null;
                    contact.P_SIDDOC = null;
                }
            });
        }

        if (messageError == '') {
            swal.fire({
                title: 'Información',
                text: '¿Estas seguro de crear el contratante?',
                icon: 'question',
                showCancelButton: true,
                confirmButtonText: 'Guardar',
                allowOutsideClick: false,
                cancelButtonText: 'Cancelar'
            })
                .then(async (result) => {
                    if (result.value) {
                        this.loadingScreen = false;
                        this.clientInformationService.getCliente360(this.inputsContracting).subscribe(
                            res => {
                                if (res.P_NCODE === '0') {
                                    this.loadingScreen = true;
                                    swal.fire('Información', 'Se ha realizado el registro correctamente', 'success')
                                        .then((value) => {
                                            this.redirectFrom(res);
                                        });
                                }
                                else if (res.P_NCODE === '1') {
                                    this.loadingScreen = true;
                                    swal.fire('Información', res.P_SMESSAGE, 'error');
                                }
                                else {
                                    this.loadingScreen = true;
                                    swal.fire('Información', res.P_SMESSAGE, 'warning');
                                }
                            },
                            err => {
                                this.loadingScreen = true;
                                swal.fire('Información', err.statusText, 'warning');
                            }
                        );
                    }
                });

        } else {
            swal.fire('Información', messageError, 'warning');
        }
    }

    back() {
        switch (this.receiverApp) {
            case 'quotation':
                if(this.codProduct == 2){ //AVS - INTERCONEXION SABSA 17/01/2023
                    this.router.navigate(['/extranet/sctr/cotizador']);
                    break;
                }else{
                    this.router.navigate(['/extranet/quotation']);
                    break;
                }
            case 'agency':
                this.router.navigate(['/extranet/agency-form'], { queryParams: { Sender: 'add-contractor' } });
                break;
            case 'contractor-location':
                this.router.navigate(['/extranet/contractor-location']);
                break;
            case 'mantenimiento-endosatario':
                swal.fire({
                    title: 'Regresar',
                    text: '¿Estás seguro de salir sin guardar cambios?',
                    icon: 'info',
                    showCancelButton: true,
                    confirmButtonText: 'Si',
                    cancelButtonText: 'Volver'
                })
                    .then((result) => {
                        if (result.value) {
                            this.router.navigate(['/extranet/desgravamen/mantenimiento-endosatario']);
                        }
                    });
                break;
            default:
                if (this.receiverApp) {
                    this.router.navigate([this.receiverApp]);
                }
                break;
        }
    }

    updateContact(_contact: ContractorLocationContactREQUEST) {
        this.contractorLocationIndexService.updateContractorLocationContact(_contact).subscribe(
            res => {
                if (res.P_NCODE == 0) {
                } else if (res.P_NCODE == 1) {
                }
            },
            err => { }
        );
    }

    textValidate(event: any, tipoTexto) {
        CommonMethods.textValidate(event, tipoTexto);
    }

}
