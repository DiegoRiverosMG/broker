import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import swal from 'sweetalert2';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal, ModalDismissReasons, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { NgxSpinnerService } from 'ngx-spinner';
import { AddAddressComponent } from '../../modal/add-address/add-address.component';

// Importacion de servicios
import { RebillService } from '../../services/rebill/rebill.service';
import { ClientInformationService } from '../../services/shared/client-information.service';
import { ConsoleService } from '@ng-select/ng-select/lib/console.service';

// Util
import { DatePipe } from '@angular/common';
import { CommonMethods } from './../common-methods';
import Swal from 'sweetalert2';
import { FormControl, FormGroup, Validator } from '@angular/forms';

@Component({
    selector: 'app-rebill',
    templateUrl: './rebill.component.html',
    styleUrls: ['./rebill.component.css']
})
export class RebillComponent implements OnInit {

    // Objeto de Inputs
    inputsRebill: any = {};
    // Longitud Máxima de Input de Busqueda de Comprobante
    maxlengthNumBill = 15;
    // Objeto Recibo encontrado
    billData: any = {};
    // Estado Busqueda
    disableButtonQuery = false;
    disableTextQuery = true;
    disableButtonSearch = true;
    // Nuevo cliente
    newClientData: any = {};
    // Estado cargando
    isLoading: boolean = false;
    // Flag opciones
    flagOpcion = 0;
    // data recivida de 
    dataRebillReturn: any = {};
    // Estado Controles Opciones cambio
    disableNuevoRuc = true;
    disableButtonValRegRuc = true;
    disableButtonCambiarDir = true;
    disableButtonReFacturar = true;
    // Estado modal 
    estadoModal = 'rebill';
    // Nueva Direccion
    newAddress: any = {};
    // Control Habilitado cambiar ruc
    disableOpcionNuevoRuc = true;
    // Control Habilitado cambiar ruc
    disableOpcionCambioDir = true;
    // Control button refacturar
    disableOpcionReFacturar = true;
    // Mensaje causa por no refacturar
    mensajeNoRefactura = '';
    // Inputs Validacion
    inputsValidate: any = {};
    // Flags
    flagValRug = false;
    flagCambDir = false;
    //Div
    visibleDivDatos = false;
    visibleDivOpciones = false;
    //Estado opciones
    estadoCambioRuc = 0;
    estadoCambioDir = false;

    labelButtonConsulta = "CONSULTAR";
    labelButtonCambioRuc = "CAMBIO RUC";

    listPerUser: any[] = []; //Refacturación + RI xx/11/2023
    ListBranch: any = [];    //Refacturación + RI xx/11/2023
    ListProduct: any = [];   //Refacturación + RI xx/11/2023
    ListPerfil: any = [];   //Refacturación + RI xx/11/2023
    listPerPerfil: any = [];   //Refacturación + RI xx/11/2023
    selectedBotonNuevo = 'predefined';
    selectedBotonNuevo2 = 'predefined';
    disableButtonCambiarFech = true;
    flagTipRef = 0;

    idBranch = 0;
    idProduct = 0;
    idPerfil = 0;
    chkMotRef = 0;
    sComentario = "";
    nDiasRef = 0;


    constructor(
        private rebillService: RebillService,
        private clientInformationService: ClientInformationService,
        private router: Router,
        private route: ActivatedRoute,
        private modalService: NgbModal,
        private datepipe: DatePipe,
        private spinner: NgxSpinnerService,
    ) { }

    @ViewChild('inputComprobante', { static: false }) pRefInputComprobante: ElementRef;
    @ViewChild('inputNuevoRuc', { static: false }) pRefInputNuevoRuc: ElementRef;

    ngOnInit() {
        this.inputsRebill.P_NUMBILL = '';
        this.inputsRebill.P_NEWRUC = '';
        this.newAddress.L_ADDRESS = '';
        this.idBranch = 0;
        this.idProduct = 0;
        this.idPerfil = 0;
        this.chkMotRef = 0;
        this.sComentario = '';
        this.nDiasRef = 0;

        this.inputsRebill.P_NBRANCH = '';//Refacturación + RI xx/11/2023
        this.inputsRebill.P_NPRODUCT = '';//Refacturación + RI xx/11/2023

        this.route.queryParams
            .subscribe(params => {
                // Recarga datos desde add-contracting

                // Activa opciones
                this.activarOpcionesCambio();

                console.log('params suscribe', params);

                //if (params.dataRebill != '') {
                if (params) {
                    if (params.dataRebill) {
                        console.log('recuperacion data');

                        this.dataRebillReturn = JSON.parse(params.dataRebill);

                        // Estado formulario
                        this.visibleDivDatos = this.dataRebillReturn.stateFormRebill.visibleDivDatos;
                        this.visibleDivOpciones = this.dataRebillReturn.stateFormRebill.visibleDivOpciones;

                        this.disableOpcionNuevoRuc = this.dataRebillReturn.stateFormRebill.disableOpcionNuevoRuc;
                        this.disableOpcionCambioDir = this.dataRebillReturn.stateFormRebill.disableOpcionCambioDir;
                        this.disableOpcionReFacturar = this.dataRebillReturn.stateFormRebill.disableOpcionReFacturar;

                        this.flagValRug = this.dataRebillReturn.stateFormRebill.estadoCambioRuc;
                        this.flagCambDir = this.dataRebillReturn.stateFormRebill.estadoCambioDir;

                        this.inputsRebill.P_NUMBILL = this.dataRebillReturn.numBill;
                        this.newClientData = this.dataRebillReturn.newClient;
                        this.billData = this.dataRebillReturn.billData;
                        this.inputsRebill.P_NEWRUC = this.dataRebillReturn.newRuc;

                        this.disableTextQuery = this.dataRebillReturn.stateFormRebill.disableTextQuery;
                        this.disableButtonSearch = this.dataRebillReturn.stateFormRebill.disableButtonSearch;
                        this.estadoCambioRuc = this.dataRebillReturn.stateFormRebill.estadoCambioRuc;
                        this.estadoCambioDir = this.dataRebillReturn.stateFormRebill.estadoCambioDir;

                        this.labelButtonConsulta = this.dataRebillReturn.stateFormRebill.labelButtonConsulta;
                        this.labelButtonCambioRuc = this.dataRebillReturn.stateFormRebill.labelButtonCambioRuc;

                        //this.mensajeNoRefactura = this.dataRebillReturn.stateFormRebill.mensajeNoRefactura;

                        // Busca en cliente360 el nuevo cliente registrado
                        this.goBuscaNuevoRucRetorno();
                    } else {
                        console.log('cargar init');
                        this.goActionConsultar();
                    }

                } else {
                    console.log('cargar init');
                    this.goActionConsultar();
                }
            });

        this.inputsValidate = CommonMethods.generarCampos(30, 0);

        //console.log('json recivido desde addcontracting');
        //console.log(this.dataRebillReturn);

        //this.pRefInputComprobante.nativeElement.focus();

    }

    async goBuscaNuevoRucRetorno() {
        const self = this;
        self.isLoading = true;
        let msg = '';

        this.disableNuevoRuc = false;

        if (this.inputsRebill.P_NEWRUC.trim().length == 11) {
            const data: any = {}
            data.P_TipOper = 'CON';
            data.P_NUSERCODE = JSON.parse(localStorage.getItem('currentUser'))['id'];
            data.P_NIDDOC_TYPE = '1';
            data.P_SIDDOC = this.inputsRebill.P_NEWRUC.trim().toUpperCase();
            data.P_SFIRSTNAME = '';
            data.P_SLASTNAME = '';
            data.P_SLASTNAME2 = '';
            data.P_SLEGALNAME = '';

            // Consulta cliente en gestor360
            await this.clientInformationService.getCliente360(data).toPromise().then(
                async res => {
                    if (res.P_NCODE == 0 || res.P_NCODE == 3) {
                        if (res.EListClient.length > 0) {

                            if (res.EListClient[0].P_SCLIENT != null) {
                                // Activa flag opcion Nuevo Ruc
                                this.flagValRug = true;

                                this.newClientData.idClient = res.EListClient[0].P_SCLIENT != null ? res.EListClient[0].P_SCLIENT.trim() : '';
                                this.newClientData.legalName = res.EListClient[0].P_SLEGALNAME != null ? res.EListClient[0].P_SLEGALNAME.trim() : '';
                                this.newClientData.viewFullName = this.newClientData.idClient + ' - ' + this.newClientData.legalName;

                                this.disableNuevoRuc = true;
                                this.disableOpcionCambioDir = true;
                                this.disableButtonValRegRuc = true;
                                this.disableButtonCambiarFech = true;
                                self.isLoading = false;
                            } else {
                                // this.newClientData.idClient = '';
                                // this.newClientData.legalName = res.EListClient[0].P_SLEGALNAME != null ? res.EListClient[0].P_SLEGALNAME.trim() : '';
                                // this.newClientData.viewFullName = '';
                                msg += 'No se encontró el nuevo cliente con RUC ' + this.inputsRebill.P_NEWRUC.trim() + '. Por favor vuelva a validar el RUC.';
                            }
                        } else {
                            msg += 'No se encontró el nuevo cliente con RUC ' + this.inputsRebill.P_NEWRUC.trim() + '. Por favor vuelva a validar el RUC.';
                        }
                    } else {
                        msg += res.P_SMESSAGE.trim();
                    }
                }
            );

            if (msg != '') {
                swal.fire('Información', msg, 'error');
                self.isLoading = false;
            }
        }
    }

    async goBuscaNuevoRuc() {

        let msg = '';
        const self = this;
        self.isLoading = false;

        if (this.estadoCambioRuc == 0) {
            this.estadoCambioRuc = 1;
            this.labelButtonCambioRuc = "VALIDAR RUC";

            setTimeout(() => {
                this.pRefInputNuevoRuc.nativeElement.focus();
            }, 100);
            return;
        }

        // Flag opcion
        this.flagValRug = false;
        //  Limpiar object nuevo cliente
        this.newClientData.idClient = '';
        this.newClientData.legalName = '';
        this.newClientData.viewFullName = '';

        if (this.inputsRebill.P_NEWRUC.trim().length == 0) {
            this.inputsValidate[2] = true;
            msg += 'Ingrese un número de RUC.';
        }

        if (this.inputsRebill.P_NEWRUC.trim().length != 11) {
            this.inputsValidate[2] = true;
            msg += 'Ingrese un número de RUC válido.';
        }

        if (msg == '') {
            //if (this.inputsRebill.P_NEWRUC.trim().length == 11) {              

            const data: any = {}
            data.P_TipOper = 'CON';
            data.P_NUSERCODE = JSON.parse(localStorage.getItem('currentUser'))['id'];
            data.P_NIDDOC_TYPE = '1';
            data.P_SIDDOC = this.inputsRebill.P_NEWRUC.trim().toUpperCase();
            data.P_SFIRSTNAME = '';
            data.P_SLASTNAME = '';
            data.P_SLASTNAME2 = '';
            data.P_SLEGALNAME = '';

            // Consulta cliente en gestor360
            await this.clientInformationService.getCliente360(data).toPromise().then(
                async res => {
                    //(DEVPENDIENTE - Quitar condicion "res.P_NCODE == 3" para pase a producción, esto es solo parar pruebas en ambiente desarrollo)
                    //if (res.P_NCODE == 0) {
                    if (res.P_NCODE == 0 || res.P_NCODE == 3) {
                        if (res.EListClient.length > 0) {

                            if (res.EListClient[0].P_SCLIENT != null) {
                                this.newClientData.idClient = res.EListClient[0].P_SCLIENT != null ? res.EListClient[0].P_SCLIENT.trim() : '';
                                this.newClientData.legalName = res.EListClient[0].P_SLEGALNAME != null ? res.EListClient[0].P_SLEGALNAME.trim() : '';
                                this.newClientData.viewFullName = '';
                            } else {
                                this.newClientData.idClient = '';
                                this.newClientData.legalName = res.EListClient[0].P_SLEGALNAME != null ? res.EListClient[0].P_SLEGALNAME.trim() : '';
                                this.newClientData.viewFullName = '';
                            }

                            // Redirecciona a add-contracting
                            this.flagTipRef = 1;// por ambio de ruc
                            this.goValidaRuc();

                        } else {
                            msg += 'No se encontraró el cliente.';
                        }
                    } else {
                        msg += res.P_SMESSAGE.trim();
                    }
                }
            );

            if (msg != '') {
                swal.fire('Información', msg, 'error');
                self.isLoading = false;
                return;
            }
        } else {
            swal.fire('Información', msg, 'error');
            self.isLoading = false;
            return;
        }
    }

    openModalDireccion() {
        let modalRef: NgbModalRef;
        let itemDireccion: any = {};
        var itemDirVigente = false;
        let msg = '';

        this.isLoading = false;

        modalRef = this.modalService.open(AddAddressComponent, { size: 'lg', backdropClass: 'light-blue-backdrop', backdrop: 'static', keyboard: false });
        modalRef.componentInstance.reference = modalRef;

        // Extraer item direccion segun recibo
        let listAddress = this.billData.dataClient360.EListAddresClient;
        let key = this.billData.SKEYADDRESSCLIENT.trim();
        let sRecType = this.billData.SRECTYPE.trim();

        // Busca direccion según SKEYADDRESS
        listAddress.map(function (dato) {
            if (dato.P_SKEYADDRESS.trim() === key) {
                itemDirVigente = true;
                itemDireccion = dato;
            }
        });

        // Si no encuentra, busca direccion vigente del mismo tipo
        if (!itemDirVigente) {
            listAddress.map(function (dato) {
                if (dato.P_SRECTYPE.trim() === sRecType) {
                    itemDirVigente = true;
                    itemDireccion = dato;
                }
            });
        }

        // Limpia direcciones vigentes de cliente
        this.billData.dataClient360.EListAddresClient = [];

        if (itemDirVigente) {
            console.log('item encontrado', itemDireccion);
            // Asigna solo el item encontrado a modificar
            this.billData.dataClient360.EListAddresClient.push(itemDireccion);
            // Asigna propiedad a modificar

            modalRef.componentInstance.itemDireccion = itemDireccion;
        } else {
            console.log('item no encontrado', itemDireccion);
            modalRef.componentInstance.itemDireccion = null;
        }

        modalRef.componentInstance.listaDirecciones = this.billData.dataClient360.EListAddresClient;
        modalRef.componentInstance.estadoModal = this.estadoModal;
        modalRef.componentInstance.rebillData = this.billData;

        modalRef.result.then((result) => {
            console.log('cerrado');
            console.log('est retorno', result);

            if (result === 'modificadoRebill') {
                //Actualiza direccion en cliente360
                swal.fire({
                    title: 'Información',
                    text: '¿Estas seguro de actualizar la dirección?',
                    icon: 'question',
                    showCancelButton: true,
                    confirmButtonText: 'Aceptar',
                    allowOutsideClick: false,
                    cancelButtonText: 'Cancelar'
                })
                    .then(async (result) => {
                        if (result.value) {
                            this.isLoading = true;

                            console.log('dataclient360 retorno', this.billData.dataClient360);

                            this.billData.dataClient360.EListPhoneClient = [];
                            this.billData.dataClient360.EListEmailClient = [];
                            this.billData.dataClient360.EListContactClient = [];
                            this.billData.dataClient360.EListCIIUClient = [];
                            this.billData.dataClient360.EListHistoryClient = [];

                            let today = new Date();
                            this.billData.dataClient360.EListAddresClient[0].P_NUM_UPDATE = '1';
                            this.billData.dataClient360.EListAddresClient[0].P_TipOper = "";
                            //this.billData.dataClient360.EListAddresClient[0].P_DEFFECDATE = this.datepipe.transform(today, 'dd/MM/yyyy');
                            this.billData.dataClient360.EListAddresClient[0].P_DEFFECDATE = this.billData.DATEBEGIN;
                            this.billData.dataClient360.EListAddresClient[0].P_DCOMPDATE = this.datepipe.transform(today, 'dd/MM/yyyy');
                            this.billData.dataClient360.EListAddresClient[0].P_SSTREET = this.billData.dataClient360.EListAddresClient[0].P_SNOM_DIRECCION;
                            //this.billData.dataClient360.EListAddresClient[0].P_SSTREET
                            this.billData.dataClient360.EListAddresClient[0].P_SDESCADD = this.billData.dataClient360.EListAddresClient[0].P_SSTREET;

                            // SI GUARDA
                            this.flagCambDir = true;
                            this.newAddress.L_ADDRESS = this.billData.dataClient360.EListAddresClient[0].P_SDESDIREBUSQ.trim();

                            this.disableOpcionNuevoRuc = true;
                            this.disableButtonReFacturar = false;
                            this.disableButtonCambiarDir = true;
                            this.disableButtonCambiarFech = true;

                            this.flagTipRef = 2;//por cambio de dirección

                            this.isLoading = false;

                        }
                    });
            }
        });
    }

    async goActualizarDireccionReFacturar() {
        let msg = '';
        const self = this;
        self.isLoading = true;

        //console.log("goActualizarDireccionReFacturar, flagCambDir:",this.flagCambDir)

        if (this.flagCambDir) {
            //console.log("entro igual");

            await this.clientInformationService.getCliente360(this.billData.dataClient360).subscribe(
                res => {
                    if (res.P_NCODE === '0') {

                        // this.flagCambDir = true;
                        // this.newAddress.L_ADDRESS = this.billData.dataClient360.EListAddresClient[0].P_SDESDIREBUSQ.trim();
                        // this.disableOpcionNuevoRuc = true;
                        // this.disableButtonReFacturar = false;
                        // msg += 'Se ha realizado el registro correctamente.';
                        // this.isLoading = false;
                        //swal.fire('Información', msg, 'success');

                        self.isLoading = false;

                        this.insNewBill();
                    } else {
                        msg += res.P_SMESSAGE;
                        self.isLoading = false;
                        swal.fire('Cambio Dirección', msg, 'warning');
                    }
                },
                err => {
                    msg += err.statusText;
                    self.isLoading = false;
                    swal.fire('Cambio Dirección', msg, 'error');
                }
            );
        } else {
            self.isLoading = false;
            this.insNewBill();
        }
    }

    goValidaRuc() {

        const documentType = 1;
        const documentNumber = this.inputsRebill.P_NEWRUC.trim().toUpperCase();
        const ncode = 0;
        const receiverStr = 'rebill';

        // Si existe cliente en db
        if (this.newClientData.idClient.trim() !== '') {
            //if (false) {
            //Si cliente nuevo es distinto a cliente de recibo
            if (this.billData.IDCLIENT.trim() !== this.newClientData.idClient.trim()) {
                //swal.fire('Re-Facturación', 'El RUC ya se encuentra asociado a ' + this.newClientData.idClient + ' - ' + this.newClientData.legalName + '.', 'info');

                swal.fire({
                    title: 'Información',
                    text: 'El RUC ya se encuentra asociado a ' + this.newClientData.idClient + ' - ' + this.newClientData.legalName + '. ¿Deseas agregarlo?',
                    icon: 'question',
                    showCancelButton: true,
                    confirmButtonText: 'Aceptar',
                    allowOutsideClick: false,
                    cancelButtonText: 'Cancelar'
                }).then((result) => {
                    if (result.value) {
                        this.newClientData.viewFullName = this.newClientData.idClient + ' - ' + this.newClientData.legalName;
                        this.flagValRug = true;

                        this.disableNuevoRuc = true;
                        this.disableOpcionCambioDir = true;
                        this.disableButtonReFacturar = false;
                        this.disableButtonValRegRuc = true;
                        this.disableButtonCambiarFech = true;
                    } else {
                        this.newClientData.viewFullName = '';
                    }
                });

            } else {
                this.newClientData.viewFullName = this.newClientData.idClient + ' - ' + this.newClientData.legalName;

                this.disableNuevoRuc = true;
                this.disableOpcionCambioDir = true;
                this.disableButtonReFacturar = false;
                this.disableButtonValRegRuc = true;
                this.disableButtonCambiarFech = true;
            }
        } else {
            //Si no existe el cliente en la bd

            let stateForm: any = {};
            stateForm.visibleDivDatos = this.visibleDivDatos;
            stateForm.visibleDivOpciones = this.visibleDivOpciones;
            stateForm.disableOpcionNuevoRuc = this.disableOpcionNuevoRuc;
            stateForm.disableOpcionCambioDir = this.disableOpcionCambioDir;
            stateForm.disableOpcionReFacturar = this.disableOpcionReFacturar;
            stateForm.flagCambDir = this.flagCambDir;
            stateForm.flagValRug = this.flagValRug;
            stateForm.disableTextQuery = this.disableTextQuery;
            stateForm.disableButtonSearch = this.disableButtonSearch;
            stateForm.estadoCambioRuc = this.estadoCambioRuc;
            stateForm.estadoCambioDir = this.estadoCambioDir;
            stateForm.labelButtonConsulta = this.labelButtonConsulta;

            const strDataRebill = JSON.stringify({
                numBill: this.inputsRebill.P_NUMBILL,
                newRuc: this.inputsRebill.P_NEWRUC,
                newClient: this.newClientData,
                billData: this.billData,
                stateFormRebill: stateForm,
            });

            console.log('json envio a addcontracting');
            console.log(JSON.parse(strDataRebill));
            console.log(localStorage);

            swal.fire({
                title: 'Información',
                text: 'El cliente que estás buscando no está registrado, por favor registrarlo por el sistema 360',
                icon: 'question',
                showCancelButton: true,
                confirmButtonText: 'Aceptar',
                allowOutsideClick: false,
                cancelButtonText: 'Cancelar'
            }).then((result) => {
                // if (result.value) {
                //     this.router.navigate(['/extranet/add-contracting'], {
                //         queryParams: {
                //             typeDocument: documentType,
                //             document: documentNumber,
                //             receiver: receiverStr,
                //             code: ncode,
                //             dataRebill: strDataRebill
                //         }
                //     });
                // }
                this.goActionConsultar();

            });
        }

    }

    goCambiarDir() {
        const self = this;
        self.isLoading = true;

        //validacion si doc tiene estado ose
        if (this.billData.NEWBILL != "") {
            self.isLoading = false;
            swal.fire('Re-Facturación', 'Comprobante en SUNAT, se emitirá Nota de Crédito.', 'info');
        } else {
            self.isLoading = false;
            swal.fire('Re-Facturación', 'Comprobante aún no se encuentra en SUNAT, se anulará el recibo.', 'info');
        }
    }

    async goRefacturar() {
        const self = this;
        let continuaProceso = false;
        self.isLoading = false;
        let confirmadoProceso = false;
        let msgCon = '';

        if (this.billData.ACTIONREFAC === '1') {
            msgCon = 'Se aplicará una nota de crédito al comprobante original ' + this.billData.NUMBILL + " (" + this.billData.NUMRECEIPT + ') y se generará un nuevo comprobante.';
        } else {
            msgCon = 'Se anulará el comprobante original ' + this.billData.NUMBILL + " (" + this.billData.NUMRECEIPT + ') y se generará un nuevo comprobante.';
        }

        swal.fire({
            title: msgCon,
            text: '¿Desea proceder con la re-facturación?',
            icon: 'info',
            showCancelButton: true,
            confirmButtonText: 'Si',
            cancelButtonText: 'No'
        })
            .then((result) => {
                if (result.value) {
                    //swal.fire('Re-Facturación', 'Operación realizada.', 'success');          

                    confirmadoProceso = true;

                    if (confirmadoProceso) {

                        console.log('int cobranzas doc', this.billData.INTCOBR);
                        //if (this.billData.INTCOBR === "1") {
                            self.isLoading = false;

                            //     swal.fire({
                            //         title: 'Comprobante enviado a contabilidad.',
                            //         text: '¿Desea proceder?',
                            //         icon: 'info',
                            //         showCancelButton: true,
                            //         confirmButtonText: 'Si',
                            //         cancelButtonText: 'No'
                            //     })
                            //         .then((result) => {
                            //             if (result.value) {
                            //                 continuaProceso = true;

                            //                 //this.insNewBill();
                            //                 this.goActualizarDireccionReFacturar();
                            //             } else {
                            //                 return;
                            //             }
                            //         });
                            // } else {
                            //     //this.insNewBill();
                            this.goActualizarDireccionReFacturar();
                       // }
                    }

                } else {
                    //swal.fire('Re-Facturación', 'Operación cancelada.', 'error');
                    return;
                }
            });

    }

    async insNewBill() {
        const self = this;
        let msg = '';
        let typeMsg = 'error';

        self.isLoading = true;

        // LLENA OBJETO REQUEST INSERT COMPROBANTE
        const oReq: any = {}
        oReq.SBILLTYPE = this.billData.SBILLTYPE;
        oReq.NINSUR_AREA = this.billData.NINSUR_AREA;
        oReq.NBILLNUM = this.billData.NBILLNUM;
        oReq.SCLIENT = this.billData.IDCLIENT;
        oReq.NTIPREF = this.flagTipRef;
        if (this.newClientData.idClient != null && this.newClientData.idClient != '') {
            oReq.SCLIENT_NEW = this.newClientData.idClient.trim().toUpperCase();
            oReq.NTYPCLIENTDOC = 1;
            oReq.SCLINUMDOCU = '';
        } else {
            oReq.SCLIENT_NEW = ""
            oReq.NTYPCLIENTDOC = 0;
            oReq.SCLINUMDOCU = this.inputsRebill.P_NEWRUC.trim().toUpperCase();
        }
        if (this.billData.BILLACCOUN.trim() != '') {
            oReq.BILLACCOUN = '1';
        } else {
            oReq.BILLACCOUN = '';
        }
        oReq.NUSERCODE = JSON.parse(localStorage.getItem('currentUser'))['id'];

        console.log('json request ins', oReq);

        // INSERT COMPROBANTE
        await this.rebillService.insRebill(oReq).toPromise().then(async res => {
            console.log('json response ins', res);
            if (res.P_NCODE == 0) {
                //msg = 'Operación de re-facturación realizada correctamente. ' + res.P_SMESSAGE;
                msg = res.P_SMESSAGE;
                typeMsg = 'success';
                this.goActionConsultar();
            } else if (res.P_NCODE == 10) {//exitoso pero en periodo de suspencion
                msg = res.P_SMESSAGE;
                typeMsg = 'success';
            } else {
                msg = 'Hubo un problema al re-facturar. Detalle: ' + res.P_SMESSAGE.trim();
                typeMsg = 'error';
            }
        }).catch((error) => {
            msg = 'Hubo un problema al realizar el registro. Intentelo nuevamente. Detalle: ' + error.message.toString();
            typeMsg = 'error';
        });

        self.isLoading = false;
        if (msg != '') {
            swal.fire('Re-Facturación', msg, typeMsg === 'success' ? 'success' : 'error');
        }
    }

    async getBills() {
        const self = this;
        let billList: any = [];
        let msg = '';
        let typeMsg = '';
        let act = 0;
        let nbol = 0;

        self.isLoading = true;

        // REQUEST CONSULTA COMPROBANTE
        const oReq = {
            NUSERCODE: null,
            Bill: null
        }
        oReq.Bill = this.inputsRebill.P_NUMBILL.toUpperCase().trim();
        oReq.NUSERCODE = JSON.parse(localStorage.getItem('currentUser')).id;

        await this.rebillService.getReceiptBill(oReq).toPromise().then(async res => {
            console.log('respuesta: ' + res.nCode)
            if (res != null && res.length > 0) {
                res.forEach(element => {
                    if (element.nCode == 1) {
                        msg = element.sMessage;
                        typeMsg = 'error';
                    } else {
                        act = 1;
                        const oBill: any = {}
                        oBill.DATEBILL = element.dateBill;
                        oBill.IDBRANCH = element.idBranch;
                        oBill.DESBRANCH = element.desBranch;
                        if (element.idCertif != '') {
                            oBill.IDPOLICY = element.idPolicy + ' - ' + element.idCertif;
                        } else {
                            oBill.IDPOLICY = element.idPolicy;
                        }
                        oBill.IDCERTIF = element.idCertif;
                        oBill.DATEBEGIN = element.dateBegin;
                        oBill.DATEEND = element.dateEnd;
                        oBill.NUMRECEIPT = element.numReceipt;
                        oBill.IDSTATUSRECEIPT = element.idStatusReceipt;
                        oBill.DESSTATUSRECEIPT = element.desStatusReceipt;
                        oBill.IDINTERMED = element.idIntermed;
                        oBill.DESINTERMED = element.desIntermed;
                        oBill.IDCLIENT = element.idClient;
                        oBill.NAMECLIENT = element.nameclient;
                        oBill.NUMDOCCLIENT = element.numDocClient;
                        oBill.IDTYPEDOCCLIENT = element.idTypeDocClient;
                        oBill.SRECTYPE = element.sRecType;
                        oBill.ADDRESSCLIENT = element.addressClient;
                        oBill.SKEYADDRESSCLIENT = element.sKeyAddressClient;
                        oBill.AMOUCOM = element.amouCom;
                        oBill.AMOUDE = element.amouCom;
                        oBill.AMOUPREMIUMT = element.amouPremiumT;
                        oBill.AMOUPREMIUMN = element.amouPremiumN;
                        oBill.AMOUCAPITAL = element.amouCapital;
                        oBill.IDCURRENCY = element.idCurrency;
                        oBill.DESCURRENCY = element.desCurrency;
                        oBill.NUMBILL = oReq.Bill;
                        oBill.BILLACCOUN = element.billAccoun;
                        oBill.NEWBILL = element.newBill;
                        oBill.SBILLTYPE = element.sBillType;
                        oBill.NINSUR_AREA = element.nInsur_Area;
                        oBill.NBILLNUM = element.nBillNum;
                        oBill.STRENTAS = element.stRentas;
                        oBill.CANTRECEIPTCOB = element.cantReceiptCob;
                        oBill.DESTYPEDOCCLIENT = element.desTypeDocClient;

                        oBill.DESSTATEFAC = element.desStateFac;
                        oBill.NBILLSTAT = element.nBillStat;
                        oBill.FACTSUNAT = element.factSunat;
                        if (element.factSunat === '0') {
                            oBill.ENSUNAT = 'NO';
                        } else {
                            oBill.ENSUNAT = 'SI';
                        };
                        oBill.INTPROD = element.intProd;
                        if (element.intProd === '0') {
                            oBill.ENINTPROD = 'NO';
                        } else {
                            oBill.ENINTPROD = 'SI';
                        };
                        oBill.INTCOBR = element.intCobr;
                        if (element.intCobr === '0') {
                            oBill.ENINTCOBR = 'NO';
                        } else {
                            oBill.ENINTCOBR = 'SI';
                        };
                        oBill.IGVBILL = element.igvBill;
                        oBill.ACTIONREFAC = element.actionRefac;
                        oBill.NPRODUCT = element.nProduct;
                        oBill.DESPRODUCT = element.desProduct;

                        billList.push(oBill);

                        if (element.nCode == 7) {// no permite el cambio de ruc cuando es boleta
                            nbol = 1;
                        }
                        if (element.nCode == 9) {// no permite el cambio de ruc cuando es boleta
                            nbol = 2;
                        }

                    }
                });

                if (act === 1) {
                    // DESHABILITA CONTROLES DIV DE BUSQUEDA
                    this.disableTextQuery = true;
                    this.disableButtonSearch = true;

                    // DESHABILITA DIV DATOS Y OPCIONES
                    this.visibleDivDatos = false;
                    this.visibleDivOpciones = false;

                    // DESHABILITA OPCIONES DE REFACTURAR          
                    this.mensajeNoRefactura = '';
                    this.disableOpcionNuevoRuc = true;
                    this.disableOpcionCambioDir = true;
                    this.disableOpcionReFacturar = true;

                    if (res.length == 1) {
                        // SI COMPROBANTE RELACIONADO SOLO A UN RECIBO

                        // LLENA DATA DE RECIBO EN OBJETO
                        this.billData = billList[0];

                        // GET DATA DE TITULAR DESDE CLIENTE360
                        await this.getDataClientRecipt();

                        // VALIDACION ES CLIENTE CON PROD RENTA
                        if (this.billData.renta === '1') {
                            msg = 'El titular ' + this.billData.IDCLIENT + ' - ' + this.billData.NAMECLIENT + ' se encuentra asociado a productos de RENTAS. No es posible Re-Facturar este comprobante.';
                            typeMsg = 'info';
                            this.mensajeNoRefactura = msg;
                        } else {
                            // VALIDACION LA POLIZA YA TIENE UN RECIBO COBRADO ANTERIORMENTE
                            if (Number(this.billData.CANTRECEIPTCOB) > 0) {
                                msg = 'La póliza ya contiene recibos cobrados con anterioridad. Solo es posible cambio de dirección y fecha.';
                                typeMsg = 'info';

                                // ACTIVA OPCION CAMBIO DE DIRECCION    
                                // PERMITE          
                                this.disableOpcionCambioDir = false;
                                this.disableOpcionReFacturar = false;

                                this.visibleDivDatos = true;
                                this.visibleDivOpciones = true;
                            } else {
                                // VALIDACION SI NO HAY DIRECCION

                                if (this.billData.SKEYADDRESSCLIENT.trim() === '') {
                                    typeMsg = 'info';
                                    msg = 'No se encontró una dirección válida para el recibo consultado.';

                                    // ACTIVA OPCION CAMBIO DE CLIENTE
                                    this.disableOpcionNuevoRuc = false;
                                    this.disableOpcionReFacturar = false;


                                    this.visibleDivDatos = true;
                                    this.visibleDivOpciones = true;
                                }
                            }
                        }

                        if (msg == '') {
                            this.disableOpcionNuevoRuc = false;
                            this.disableOpcionCambioDir = false;
                            this.disableOpcionReFacturar = false;

                            this.visibleDivDatos = true;
                            this.visibleDivOpciones = true;
                        }

                        if (nbol == 1) {// no permite el cambio de ruc cuando es boleta
                            console.log('validacion de boleta: ' + nbol);
                            this.disableOpcionCambioDir = false;
                            this.disableOpcionNuevoRuc = true;
                            this.disableOpcionReFacturar = false;
                        }

                        if (nbol == 2) {// no permite el cambio de ruc cuando es boleta
                            console.log('validacion de boleta: ' + res[0].sMessage);
                            this.disableOpcionCambioDir = true;
                            this.disableOpcionNuevoRuc = true;
                            this.disableOpcionReFacturar = true;
                            msg = res[0].sMessage;
                            typeMsg = 'info';
                            this.mensajeNoRefactura = msg;
                        }

                        this.labelButtonConsulta = "LIMPIAR";

                    } else {
                        // VALIDACION MAS DE UN RECIBO                    
                        msg = 'Comprobante relacionado a más de un recibo. No es posible re-facturar este comprobante.';
                        typeMsg = 'info';
                        this.mensajeNoRefactura = msg;

                        this.disableTextQuery = false;
                        this.disableButtonSearch = false;
                    }
                }

            } else {

                msg = 'Comprobante a consultar no existe.';
                typeMsg = 'error';

            }
        }).catch(() => {
            msg = 'Hubo un problema al realizar la consulta. Intentelo nuevamente.';
            typeMsg = 'error';
        });

        // ALERTA FINAL DEL PROCESO
        self.isLoading = false;
        if (msg != '') {
            swal.fire('Información', msg, typeMsg === 'error' ? 'error' : 'info');
        }
    }

    async getDataClientRecipt() {
        const data: any = {}
        data.P_TipOper = 'CON';
        data.P_NUSERCODE = JSON.parse(localStorage.getItem('currentUser'))['id'];

        if (this.billData.NUMDOCCLIENT.trim().length == 11) {
            data.P_NIDDOC_TYPE = '1';
        } else {
            data.P_NIDDOC_TYPE = '2';
        }
        data.P_SIDDOC = this.billData.NUMDOCCLIENT.trim().toUpperCase();
        data.P_SFIRSTNAME = '';
        data.P_SLASTNAME = '';
        data.P_SLASTNAME2 = '';
        data.P_SLEGALNAME = '';

        console.log('Buscando cliente recibo');

        // Consulta cliente en gestor360
        await this.clientInformationService.getCliente360(data).toPromise().then(
            async res => {
                if (res.P_NCODE == 0) {
                    if (res.EListClient.length > 0) {
                        if (res.EListClient[0].P_SCLIENT != null) {
                            // P_SISSEACSA_IND 1 = Es de Rentas, 2 = No
                            this.billData.renta = res.EListClient[0].P_SISSEACSA_IND != null ? res.EListClient[0].P_SISSEACSA_IND.trim() : '';

                            this.billData.dataClient360 = res.EListClient[0];
                            this.billData.dataClient360.P_TipOper = 'INS';

                            let numdir = 1;
                            this.billData.dataClient360.EListAddresClient.forEach(async item => {
                                item.P_NROW = (numdir++).toString();
                                item.P_CLASS = '';
                                item.P_DESTIDIRE = 'PARTICULAR';
                                item.P_SRECTYPE = item.P_SRECTYPE == '' || item.P_SRECTYPE == null ? '2' : item.P_SRECTYPE;
                                item.P_STI_DIRE = item.P_STI_DIRE == '' || item.P_STI_DIRE == null ? '88' : item.P_STI_DIRE;
                                item.P_SNUM_DIRECCION = item.P_SNUM_DIRECCION == '' || item.P_SNUM_DIRECCION == null ? '0' : item.P_SNUM_DIRECCION;
                                item.P_DESDEPARTAMENTO = item.P_DESDEPARTAMENTO == null ? item.P_SDES_DEP_DOM : item.P_DESDEPARTAMENTO;
                                item.P_DESPROVINCIA = item.P_DESPROVINCIA == null ? item.P_SDES_PRO_DOM : item.P_DESPROVINCIA;
                                item.P_DESDISTRITO = item.P_DESDISTRITO == null ? item.P_SDES_DIS_DOM : item.P_DESDISTRITO;
                                item.P_NCOUNTRY = item.P_NCOUNTRY == null || item.P_NCOUNTRY == '' ? '1' : item.P_NCOUNTRY;
                                item.P_SNOM_DIRECCION = item.P_SNOM_DIRECCION == '' ? 'NO ESPECIFICADO' : item.P_SNOM_DIRECCION.replace(/[().]/g, '').replace(/[-]/g, '');
                                if (this.billData.IDTYPEDOCCLIENT == 1) {
                                    //if (this.billData.NUMDOCCLIENT.trim().length == 11) {
                                    item.P_SNOM_DIRECCION = item.P_SNOM_DIRECCION.substr(0, item.P_SNOM_DIRECCION.length - item.P_DESDISTRITO.length).trim();
                                    item.P_SNOM_DIRECCION = item.P_SNOM_DIRECCION.substr(0, item.P_SNOM_DIRECCION.length - item.P_DESPROVINCIA.length).trim();
                                    item.P_SNOM_DIRECCION = item.P_SNOM_DIRECCION.substr(0, item.P_SNOM_DIRECCION.length - item.P_DESDEPARTAMENTO.length).trim().substr(0, 79);
                                    item.P_SDESDIREBUSQ = item.P_SDESDIREBUSQ == '' ? item.P_SDESDIREBUSQ : item.P_SDESDIREBUSQ.replace(/[().]/g, '').replace(/[-]/g, '');
                                    item.P_SDESDIREBUSQ = item.P_SDESDIREBUSQ.substr(0, item.P_SDESDIREBUSQ.length - item.P_DESDISTRITO.length).trim();
                                    item.P_SDESDIREBUSQ = item.P_SDESDIREBUSQ.substr(0, item.P_SDESDIREBUSQ.length - item.P_DESPROVINCIA.length).trim();
                                    item.P_SDESDIREBUSQ = item.P_SDESDIREBUSQ.substr(0, item.P_SDESDIREBUSQ.length - item.P_DESDEPARTAMENTO.length).trim().substr(0, 79);
                                }
                                let today = new Date();
                                item.P_DEFFECDATE = this.billData.DATEBEGIN;
                                item.P_DCOMPDATE = this.datepipe.transform(today, 'dd/MM/yyyy');
                                //item.P_NUM_UPDATE = "";
                                //item.P_TipOper = "";
                            });
                        } else {
                            this.billData.renta = '';
                            this.billData.dataClient360 = {};
                        }
                    } else {
                        this.billData.renta = '';
                        this.billData.dataClient360 = {};
                    }
                }
            }
        );
    }

    habilitarConsulta() {
        this.disableTextQuery = false;
        this.disableButtonSearch = false;
        this.billData = {};
        this.inputsRebill.P_NUMBILL = '';
        this.inputsRebill.P_NEWRUC = '';
        this.newClientData = {};
        this.mensajeNoRefactura = '';
    }

    goActionConsultar() {
        // Limpia inputs
        this.inputsRebill.P_NUMBILL = '';
        this.inputsRebill.P_NEWRUC = '';
        // Estado controles busqueda
        this.disableTextQuery = false;
        this.disableButtonSearch = false;
        this.disableNuevoRuc = false;
        // Limpia data 
        this.billData = {};
        this.newClientData = {};
        this.newAddress = {};
        this.mensajeNoRefactura = '';
        // Estado controles formulario
        this.visibleDivDatos = false;
        this.visibleDivOpciones = false;
        this.disableOpcionNuevoRuc = true;
        this.disableOpcionCambioDir = true;
        this.disableButtonReFacturar = true;
        this.disableButtonCambiarDir = false;
        this.disableButtonValRegRuc = false;
        this.disableButtonCambiarFech = false;
        // Flags
        this.flagCambDir = false;
        this.flagValRug = false;
        this.estadoCambioRuc = 0;
        this.estadoCambioDir = false;

        this.labelButtonConsulta = "CONSULTAR";
        this.labelButtonCambioRuc = "CAMBIAR RUC";

        setTimeout(() => {
            this.pRefInputComprobante.nativeElement.focus();
        }, 100);
    }

    activarOpcionesCambio() {
        this.disableNuevoRuc = false;
        this.disableButtonValRegRuc = false;
        this.disableButtonCambiarFech = false;
        this.disableButtonCambiarDir = false;
        this.disableButtonReFacturar = false;

        this.newClientData = {};
        this.inputsRebill.P_NEWRUC = '';
    }

    desactivarOpcionesCambio() {
        this.disableNuevoRuc = true;
        this.disableButtonValRegRuc = true;
        this.disableButtonCambiarFech = true;
        this.disableButtonCambiarDir = true;
        this.disableButtonReFacturar = true;

        this.newClientData = {};
        this.inputsRebill.P_NEWRUC = '';
    }

    textValidate(event: any, type) {
        CommonMethods.textValidate(event, type)
    }

    //Refacturación + RI xx/11/2023
    confPeriodo(content) {

        const data = { NUSERCODE: null };
        data.NUSERCODE = JSON.parse(localStorage.getItem('currentUser')).id;
        console.log('NUSERCODE_permiso: ' + data.NUSERCODE);
        this.rebillService.permisoPerfil(data).subscribe(
            (s) => {
                console.log('Permiso recibido', s);
                if (s.P_EST == 1) {//permite la configuración
                    this.onPeriodo(content);
                } else {
                    console.log('respuesta de permiso user: ' + s);
                    Swal.fire(
                        'Información',
                        s.P_MENSAGE,
                        'error'
                    );
                }

                // this.idEstadoReciboSel = 0;
            },
            (e) => {
                console.log(e);
            }
        );


    }

    onPeriodo(content) {
        this.spinner.show();
        this.listPerUser = [];
        console.log('configuración de periodo');

        this.rebillService.getBranchList().subscribe(
            (res) => {
                this.ListBranch = res;
                console.log('LISTA DE RAMOS' + res);
            },
            (err) => {
                Swal.fire(
                    'Información',
                    'Ha ocurrido un error al obtener los ramos.',
                    'error'
                );
            }
        );

        this.rebillService.getPerfilList().subscribe(
            (res) => {
                this.ListPerfil = res;
                console.log('LISTA DE perfiles' + res);
            },
            (err) => {
                Swal.fire(
                    'Información',
                    'Ha ocurrido un error al obtener los perfiles.',
                    'error'
                );
            }
        );

        this.modalService.open(content, {
            size: 'xl',
            backdropClass: 'light-blue-backdrop',
            backdrop: 'static',
            keyboard: false,
        });
        this.spinner.hide();
    }

    SelectBranch() {
        console.log('ramo seleccionado: ' + this.idBranch);
        let data = {};
        data = { NBRANCH: this.idBranch };
        this.rebillService.getProductList(data).subscribe(
            (res) => {
                if (res != undefined && res.length > 0) {
                    this.ListProduct = res;
                    console.log('LISTA DE productox' + res);
                } else {
                    Swal.fire(
                        'Información',
                        'Debe selecionar el ramo, póngase en contacto con el administrador.' +
                        this.inputsRebill.value.idBranch,
                        'error'
                    );
                }
            },
            (err) => {
                Swal.fire(
                    'Información',
                    'Ha ocurrido un error ' + this.inputsRebill.value.idBranch,
                    'error'
                );
            }
        );

    }

    cambioFecha() {
        Swal.fire({
            title: '¿Esta seguro de actualizar la fecha?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Aceptar',
            allowOutsideClick: false,
            cancelButtonText: 'Cancelar',
        }).then((result) => {
            if (result.value) {
                this.flagTipRef = 3;//por cambio de fecha
                this.insNewBill();
                this.modalService.dismissAll();
            }
        });
    }

    buscarPer(content) {
        this.listPerPerfil = [];
        this.chkMotRef = 0;
        this.nDiasRef = 0;

        const data = {
            NBRANCH: null,
            NPRODUCT: null,
            NPERFIL: null
        };
        data.NBRANCH = this.idBranch;
        data.NPRODUCT = this.idProduct;
        data.NPERFIL = this.idPerfil;
        console.log('datos para busqueda: ' + data.NPERFIL);
        this.rebillService.listPerPerfil(data).subscribe(
            (res) => {
                if (res[0].P_EST == 0) {
                    this.listPerPerfil = res[0].lista;
                    //falta identificar el ultimo registro para cargar dias y check
                    for (var val of res[0].lista) {

                        if (val.estado == 'Activo') {
                            this.nDiasRef = val.diasref;
                            if (val.checkmod == 1) {
                                this.chkMotRef = 1;
                                //console.log('valor unico: ' + val.checkmod);
                            }
                            //console.log('valor unico: ' + val.diasref);
                        }


                    }
                } else {
                    Swal.fire(
                        'Información',
                        'No se encontraron registros.',
                        'error'
                    );
                }
            },
            (err) => {
                Swal.fire(
                    'Información',
                    'Ha ocurrido un error ' + this.inputsRebill.value.idBranch,
                    'error'
                );
            }
        );
    }

    nuevo(content) {
        this.listPerPerfil = [];
        this.chkMotRef = 0;
        this.nDiasRef = 0;
        this.selectedBotonNuevo = 'opentype';
        this.selectedBotonNuevo2 = 'opentype';

    }
    soloNumeros(evt) {
        var code = evt.which ? evt.which : evt.keyCode;
        if (code == 8) {
            // espacios
            return true;
        } else if (code >= 48 && code <= 57) {
            // es un numero?

            return true;
        } else {
            // otros.
            return false;
        }
    }

    filtrarDato() {
        let mensajeAdvertencia = '';

        if (this.idBranch === 0 || this.idBranch == null) {
            mensajeAdvertencia = 'Seleccione un ramo.';
        }
        if (this.idProduct === 0) {
            mensajeAdvertencia = 'Seleccione un producto.';
        }
        if (this.idPerfil === 0) {
            mensajeAdvertencia = 'Seleccione un perfil.';
        }

        if (this.nDiasRef === 0) {
            mensajeAdvertencia = 'Los días para refacturar deben ser diferente de cero (0).';
        }

        if (this.sComentario.length > 200) {
            mensajeAdvertencia = 'El comentario no debe exceder los 200 digitos';
        }

        let str: string = this.nDiasRef.toString();

        let comp1: RegExp = /[ABCDEFGHIJLMNOPQRSTUVWXYZ]/;
        let match1: RegExpMatchArray | null = str.match(comp1);
        if (match1) {
            mensajeAdvertencia = 'No se permiten letras. ';
        }

        let comp3: RegExp = /.{3,}/;
        let match3: RegExpMatchArray | null = str.match(comp3);
        if (match3) {
            mensajeAdvertencia = 'Máximo 3 cifras, menor o igual a 300 días';
        }

        let str2: string = this.sComentario;
        let comp4: RegExp = /.{4,}/;
        let match4: RegExpMatchArray | null = str2.match(comp4);
        if (!match4) {
            mensajeAdvertencia = 'Se necesita una comentario valido';
        }

        if (mensajeAdvertencia != '') {
            Swal.fire('Información', mensajeAdvertencia, 'warning');
            this.spinner.hide();
            return;
        } else {

            Swal.fire({
                title: '¿Desea guardar?',
                html: '¿Desea guardar la configuración para la refacturación.?',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Aceptar',
                allowOutsideClick: false,
                cancelButtonText: 'Cancelar',
            }).then((result) => {
                if (result.value) {
                    this.guardar();
                }
            });
        }
    }
    guardar() {
        const data = {
            NBRANCH: null,
            NPRODUCT: null,
            NPERFIL: null,
            NDIAS_REF: null,
            NCHKPERMISO: null,
            NUSERCODE: null,
            SCOMENTARIO: null
        };
        data.NBRANCH = this.idBranch;
        data.NPRODUCT = this.idProduct;
        data.NPERFIL = this.idPerfil;
        data.NDIAS_REF = this.nDiasRef;
        if (this.chkMotRef) {
            data.NCHKPERMISO = 1;
        } else {
            data.NCHKPERMISO = 0;
        }
        data.NUSERCODE = JSON.parse(localStorage.getItem('currentUser')).id;
        data.SCOMENTARIO = this.sComentario;
        // console.log('datos para guardar: ' + data.NUSERCODE + ' - ' + data.NCHKPERMISO + ' dias: ' + data.NDIAS_REF + 'coment: ' + data.SCOMENTARIO);
        this.rebillService.guardar(data).subscribe(
            (res) => {
                if (res[0].P_EST == 0) {
                    this.listPerPerfil = [];
                    this.listPerPerfil = res[0].lista;
                    this.selectedBotonNuevo2 = 'predefined';
                    //falta identificar el ultimo registro para cargar dias y check
                    for (var val of res[0].lista) {

                        if (val.estado == 'Activo') {
                            this.nDiasRef = val.diasref;
                            // console.log('valor unico: ' + val.diasref);
                        }
                        if (val.checkmod == 1) {
                            this.chkMotRef = 1;
                            // console.log('valor unico: ' + val.checkmod);
                        }

    }
                } else {
                    Swal.fire(
                        'Información',
                        res[0].P_MENSAGE,
                        'error'
                    );
                }
            },
            (err) => {
                Swal.fire(
                    'Información',
                    'Ha ocurrido un error ' + this.inputsRebill.value.idBranch,
                    'error'
                );
            }
        );
    }

    limpiar1(content) {
        this.selectedBotonNuevo = 'predefined';
        this.selectedBotonNuevo2 = 'predefined';
        this.idBranch = 0;
        this.idProduct = 0;
        this.idPerfil = 0;
        this.listPerPerfil = [];
        this.chkMotRef = 0;
        this.nDiasRef = 0;
    }

    cerrar(content) {
        Swal.fire({
            title: '¿Esta seguro de cancelar la operación?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Aceptar',
            allowOutsideClick: false,
            cancelButtonText: 'Cancelar',
        }).then((result) => {
            if (result.value) {
                this.limpiar1(content);
                this.modalService.dismissAll(content);
            }
        });
    }

}
