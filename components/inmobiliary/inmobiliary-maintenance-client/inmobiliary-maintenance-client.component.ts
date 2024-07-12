import { Component, OnInit, ViewChild } from '@angular/core';
import { InmobiliaryMaintenanceClientService } from '../../../services/inmobiliary/inmobiliary-maintenance-client.service';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { forkJoin } from "rxjs";
import Swal from 'sweetalert2';
import { CommonMethods } from '../../common-methods';
import { BsDatepickerConfig } from 'ngx-bootstrap/datepicker';

@Component({
    selector: 'app-inmobiliary-maintenance-client',
    templateUrl: './inmobiliary-maintenance-client.component.html',
    styleUrls: ['./inmobiliary-maintenance-client.component.css']
})

export class InmobiliaryMaintenanceClientComponent implements OnInit {

    typeDocuments: any = [];
    searchBy: any = [];
    options: any = [];
    genders: any = [];
    nationalities: any = [];
    civilStates: any = [];
    typeDocs: any = [];

    listDetalles: any = [];
    listConsulta: any = [];

    objCons: any = {};

    personaJuridicaForm: FormGroup;
    personaNaturalForm: FormGroup;

    idTypeDoc: any = "0";
    sTipoDocumento: any = '';
    sCodigoInterno: any = '';
    idOption: any = "0";
    idBuscaPor: any = "0";
    idValor: any = "";
    itemSeleccionado: any;
    clienteSeleccionado: any;
    clienteInicial: any;

    listToShow: any = [];
    currentPage = 1;
    itemsPerPage = 15;
    totalItems = 0;
    maxSize = 10;
    loading = true;
    reference : any;
    reference2: any;
    listFact : any = [];

    montoModel : any = {};
    montoControl: FormControl;
    montoContrato = 0;

    factModel : any = {};
    factControl: FormControl;

    glosaModel : any = {};
    glosaContrato= "";
    glosaControl: FormControl;

    bsConfig: Partial<BsDatepickerConfig>;
    bsFecInicio: Date = new Date();
    @ViewChild('fechaInicio') fInicio: any;

    bsFecFin: Date = new Date();
    bsFecFact: Date = new Date(); 

    @ViewChild('fechaFin') fFin: any;
    @ViewChild('fechaFacturacion') fFactu: any;

    @ViewChild('contentDatosJuridico') contentDatosJuridico: any;
    @ViewChild('contentDatosNatural') contentDatosNatural: any;

    fechaModel : any = {};
    fInicioControl : FormControl;
    fFinControl : FormControl;
    fFactControl : FormControl;


    typeOpt = "1";
    sClient = "";
    direccionModel : any = {};
    typeVias: any[]=[];
    departamentos: any[]=[];
    provincias: any[]=[];
    distritos: any[]=[];
    direcM: any = {};
    departamentoControl: FormControl;
    provinciaControl: FormControl;
    distritoControl: FormControl;
    tipoViaControl: FormControl;
    direccionControl: FormControl;
    numeroControl:FormControl;
    interiorControl: FormControl;

    userCode = "";
    contratanteModel : any = {};
    tipoContrat = 0;
    disabledSearch = true;
    mantenimientoCliente = 0;

    bsFechaNac: Date = new Date();
    @ViewChild('fechaNac') fNac: any;
    email = '';
    pageChange = false;
    email_contact = '';
    changeContratanteInput = false;
    changeContactoInput = false;
    tManual = true


    listToShowC: any = [];
    currentPageC = 1;
    itemsPerPageC = 15;
    totalItemsC = 0;
    maxSizeC = 10;

    documentChange = "";

    validateFInicio = new Date();
    validateFFact = new Date();

    mantClientSelection = '';

    disabledFechaFin = false;

    constructor(
        private formBuilder: FormBuilder,
        private inmobiliaryMaintenanceClientService: InmobiliaryMaintenanceClientService,
        private modalService: NgbModal
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

    ngOnInit(): void {
        this.getParams();
        this.montoControl = new FormControl(null, [Validators.required]);
        this.factControl = new FormControl('', [Validators.required]);
        this.glosaControl = new FormControl('', [Validators.required]);
        this.fInicioControl = new FormControl(new Date(), [Validators.required]);
        this.fFinControl = new FormControl(new Date(), [Validators.required]);
        this.fFactControl = new FormControl(new Date(), [Validators.required]);
        this.departamentoControl = new FormControl('0', [Validators.required]);
        this.provinciaControl = new FormControl('0', [Validators.required]);
        this.distritoControl = new FormControl('0', [Validators.required]);
        this.tipoViaControl = new FormControl('', [Validators.required]);
        this.direccionControl = new FormControl('', [Validators.required]);
        this.numeroControl = new FormControl('', [Validators.required]);
        this.interiorControl = new FormControl('', [Validators.required]);

        this.userCode = JSON.parse(localStorage.getItem('currentUser'))['id'];
        this.createPersonaJuridicaForm();
        this.createPersonaNaturalForm();
        this.loading = false
    }

    createPersonaJuridicaForm(): void {
        this.personaJuridicaForm = this.formBuilder.group({
            P_NTYPCLIENTDOC: ['', Validators.required],
            P_SCLINUMDOCU: ['', Validators.required],
            P_SCLIENAME: ['', Validators.required],
            P_SPHONE: [''],
            P_SNOM_DIRECCION: [''],
            P_SE_MAIL: [''],
            P_SNAME_CONTACT: [''],
            P_SMAIL_CONTACT: [''],
            P_SPHONE_CONTACT: ['']
        });
    }

    createPersonaNaturalForm(): void {
        this.personaNaturalForm = this.formBuilder.group({
            P_NTYPCLIENTDOC: ['', Validators.required],
            P_SCLINUMDOCU: ['', Validators.required],
            P_SFIRSTNAME: ['', Validators.required],
            P_SLASTNAME: ['', Validators.required],
            P_SLASTNAME2: ['', Validators.required],
            P_DBIRTHDAT: [new Date(), Validators.required],
            P_SSEXCLIEN: ['', Validators.required],
            P_NNATIONALITY: ['', Validators.required],
            P_SNOM_DIRECCION: [''],
            P_SE_MAIL: [''],
            P_NCIVILSTA: ['', Validators.required],
            P_SPHONE: [this.objCons.SPHONE],
            P_SNAME_CONTACT: [''],
            P_SMAIL_CONTACT: [''],
            P_SPHONE_CONTACT: ['']
        });
    }

    getParams = () => {
        let $typeDocuments = this.inmobiliaryMaintenanceClientService.GetListDocument();
        let $searchBy = this.inmobiliaryMaintenanceClientService.GetListBuscarPor();
        let $options = this.inmobiliaryMaintenanceClientService.GetListOption();
        let $genders = this.inmobiliaryMaintenanceClientService.ListarGeneroInmobiliaria();
        let $nationalities = this.inmobiliaryMaintenanceClientService.ListarNacionalidadInmobiliaria();
        let $civilStates = this.inmobiliaryMaintenanceClientService.ListarEstadoCivilInmobiliaria();
        let $typeDocs = this.inmobiliaryMaintenanceClientService.ListarTipoDocumentoInmobiliaria();
        return forkJoin([ $typeDocuments, $searchBy, $options, $genders, $nationalities, $civilStates, $typeDocs ]).subscribe(
            res => {
                this.typeDocuments = res[0];
                this.searchBy = res[1];
                this.options = res[2];
                this.genders = res[3].Result.P_LIST;
                this.nationalities = res[4].Result.P_LIST;
                this.civilStates = res[5].Result.P_LIST;
                this.typeDocs = res[6].Result.P_LIST;
            },
            err => {
                Swal.fire('Información', 'Ha ocurrido un error al obtener los parámetros.', 'error');
            }
        )
    }

    seleccionarItem = (item) => {
        if (this.itemSeleccionado !== item) {
            this.itemSeleccionado = item;
        }
    }

    seleccionarCliente = (item) => {
        if (this.clienteSeleccionado !== item) {
            this.clienteSeleccionado = item;
        } else {
            this.clienteSeleccionado = undefined;
        }
    }

    closeModal(){
        this.createPersonaJuridicaForm()
        this.createPersonaNaturalForm()
        this.montoControl.setValue('');
        this.factControl.setValue('');
        this.glosaControl.setValue('');
        this.fInicioControl.reset();
        this.fInicioControl.setValue(new Date());
        this.fFinControl.setValue(new Date());
        this.fFactControl.setValue(new Date());
        this.departamentoControl.setValue('0');
        this.provinciaControl.setValue('0');
        this.distritoControl.setValue('0');
        this.tipoViaControl.setValue('');
        this.direccionControl.setValue('');
        this.numeroControl.setValue('');
        this.interiorControl.setValue('');
        this.disabledSearch = true
        this.clienteSeleccionado = null;
        this.email = '';
        this.email_contact = '';
        this.changeContratanteInput = false;
        this.changeContactoInput = false;
        this.reference.close();
        this.itemSeleccionado = null; 
        this.tManual = true;
        this.typeOpt = "1";

        this.validateFInicio = new Date();
        this.validateFFact = new Date();

        this.disabledFechaFin = false;
        this.mantClientSelection = '';
        this.resetPageConsulta()
    }

    resetPageConsulta(){
        this.listToShowC = [];
        this.currentPageC = 1;
        this.itemsPerPageC = 15;
        this.totalItemsC = 0;
        this.maxSizeC = 10;
    }

    editarCliente = (i) => {
        this.tipoContrat = i;
        if(this.mantenimientoCliente == 1){
            if((this.tipoContrat == 1 && this.personaJuridicaForm.invalid) || (this.tipoContrat == 2 && this.personaNaturalForm.invalid)){
                Swal.fire('Información','Debe completar todos los campos obligatorios (*)','warning');
                return;
            }

            if(this.email_contact.trim() != ''){
                if (/^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i.test(this.email_contact) == false) {
                    Swal.fire('Información', 'El correo de contacto es inválido', 'warning');
                    return;
                }
            }

            if (i == 1 && this.personaJuridicaForm.valid) this.ActualizarClienteInmobiliariaC(this.personaJuridicaForm.value);
            if (i == 2 && this.personaNaturalForm.valid) this.ActualizarClienteInmobiliariaC(this.personaNaturalForm.value);
        }else{

            if((this.tipoContrat == 1 && this.personaJuridicaForm.invalid) || (this.tipoContrat == 2 && this.personaNaturalForm.invalid)){
                Swal.fire('Información','Debe completar todos los campos obligatorios (*)','warning');
                return;
            }

            if (/^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i.test(this.email) == false) {
                Swal.fire('Información', 'El correo electrónico es inválido', 'warning');
                return;
            }

            if(this.email_contact.trim() != ''){
                if (/^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i.test(this.email_contact) == false) {
                    Swal.fire('Información', 'El correo de contacto es inválido', 'warning');
                    return;
                }
            }

            //console.log(this.personaNaturalForm.controls['P_DBIRTHDAT'].value);

            Swal.fire({
                title: 'Información',
                text: 'Se procederá a crear al contratante. ¿Estás seguro que desea continuar?', //'Se actualizará el contratante asignado ¿Estás seguro que desea continuar?'
                icon: 'question',
                showCancelButton: true,
                confirmButtonText: 'SÍ',
                allowOutsideClick: false,
                cancelButtonText: 'NO'
            }).then((result) => {
                if (result.value) {
                    this.loading = true;
                    let temp = {
                        P_NOPCION: this.idOption.toString(),
                        P_NIDTRXEMISION: this.contratanteModel.NIDTRXEMISION,
                        P_SCOD_INTERNO: this.contratanteModel.SCOD_INTERNO,
                        P_SCLIENT_OLD: this.contratanteModel.SCLIENT,
                        P_NTYPCLIENTDOC: this.tipoContrat == 1 ? this.personaJuridicaForm.controls['P_NTYPCLIENTDOC'].value : this.personaNaturalForm.controls['P_NTYPCLIENTDOC'].value,
                        P_SCLINUMDOCU : this.tipoContrat == 1 ? this.personaJuridicaForm.controls['P_SCLINUMDOCU'].value : this.personaNaturalForm.controls['P_SCLINUMDOCU'].value,
                        P_SCLIENAME : this.tipoContrat == 1 ? this.personaJuridicaForm.controls['P_SCLIENAME'].value : this.personaNaturalForm.controls['P_SLASTNAME'].value + ' ' + this.personaNaturalForm.controls['P_SLASTNAME2'].value + ', ' + this.personaNaturalForm.controls['P_SFIRSTNAME'].value,
                        P_SFIRSTNAME: this.tipoContrat == 2 ? this.personaNaturalForm.controls['P_SFIRSTNAME'].value : '',
                        P_SLASTNAME: this.tipoContrat == 2 ? this.personaNaturalForm.controls['P_SLASTNAME'].value : '',
                        P_SLASTNAME2: this.tipoContrat == 2 ? this.personaNaturalForm.controls['P_SLASTNAME2'].value : '',
                        P_DBIRTHDAT: this.tipoContrat == 2 ? this.personaNaturalForm.controls['P_DBIRTHDAT'].value : null,
                        P_SSEXCLIEN: this.tipoContrat == 2 ? this.personaNaturalForm.controls['P_SSEXCLIEN'].value : '',
                        P_NCIVILSTA: this.tipoContrat == 2 ? this.personaNaturalForm.controls['P_SSEXCLIEN'].value : '',
                        P_NNATIONALITY: this.tipoContrat == 2 ? this.personaNaturalForm.controls['P_NNATIONALITY'].value : 1 ,
                        P_NPROVINCE: 14, // LIMA
                        P_NLOCAL: 1401, //LIMA
                        P_NMUNICIPALITY: 140101, //LIMA
                        P_SMANZANA: '',
                        P_SLOTE: '',
                        P_SREFERENCIA: '',
                        P_STI_DIRE: '01', //AV
                        P_SNUM_DIRECCION: 1234,
                        P_SNUM_INTERIOR: 1234,
                        P_SNOM_DIRECCION: this.tipoContrat == 1 ? this.personaJuridicaForm.controls['P_SNOM_DIRECCION'].value : this.personaNaturalForm.controls['P_SNOM_DIRECCION'].value,
                        P_SPHONE: this.tipoContrat == 1 ? this.personaJuridicaForm.controls['P_SPHONE'].value : this.personaNaturalForm.controls['P_SPHONE'].value,
                        P_SE_MAIL: this.tipoContrat == 1 ? this.personaJuridicaForm.controls['P_SE_MAIL'].value : this.personaNaturalForm.controls['P_SE_MAIL'].value,
                        P_SNAME_CONTACT: this.tipoContrat == 1 ? this.personaJuridicaForm.controls['P_SNAME_CONTACT'].value : this.personaNaturalForm.controls['P_SNAME_CONTACT'].value,
                        P_SPHONE_CONTACT: this.tipoContrat == 1 ? this.personaJuridicaForm.controls['P_SPHONE_CONTACT'].value : this.personaNaturalForm.controls['P_SPHONE_CONTACT'].value,
                        P_SMAIL_CONTACT: this.tipoContrat == 1 ? this.personaJuridicaForm.controls['P_SMAIL_CONTACT'].value : this.personaNaturalForm.controls['P_SMAIL_CONTACT'].value,
                        P_NUSERCODE: this.userCode,
                        P_NCOMMIT: 1
                    }
                    //--POR RUC|DNI|CARNET
                    //IF NOPCION IN (1, 3, 5) THEN
                    this.inmobiliaryMaintenanceClientService.InsertarClienteInmobiliaria(temp).subscribe(
                        res => {
                            this.loading = false;
                            if (res.Result.P_NCODE == 0) {
                                Swal.fire('Información', 'Se crearon los datos del contratante exitosamente.', 'success');
                                this.closeModalForm();
                                let item = {
                                    NOPCION: temp.P_NTYPCLIENTDOC == 2 ? 3 : (temp.P_NTYPCLIENTDOC == 4 ? 5 : 1),
                                    SVALOR: temp.P_SCLINUMDOCU
                                };
                                this.inmobiliaryMaintenanceClientService.GetConsultaClientesList(item).toPromise().then(
                                    res => {
                                        this.listConsulta = res;
                                        this.totalItemsC = this.listConsulta.length;
                                        this.listToShowC = this.listConsulta.slice(
                                            (this.currentPageC - 1) * this.itemsPerPageC,
                                            this.currentPageC * this.itemsPerPageC
                                        );
                                    },
                                    err => {
                                        Swal.fire('Información', 'Ha ocurrido un error al obtener los registros.', 'error');
                                    }
                                )
                            } else {
                                Swal.fire('Información', res.Result.P_SMESSAGE, 'error');
                            }
                        },
                        err => {
                            this.loading = false;
                            Swal.fire('Información', 'Ha ocurrido un error al crear los datos del contratante.', 'error');
                        }
                    )
                }
            });
        }
    }

    eliminarContrat(item:any){
        Swal.fire({
            title: 'Información',
            text: '¿Estás seguro que deseas eliminar al contratante?',
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Aceptar',
            allowOutsideClick: false,
            cancelButtonText: 'Cancelar'
        }).then((result) => {
            if (result.value) {
                this.disabledSearch = false;
                this.listConsulta = [];
            }
        });
    }

    closeModalForm(){
        this.personaJuridicaForm.reset();
        this.personaNaturalForm.reset();
        this.clienteSeleccionado = null;
        this.createPersonaJuridicaForm()
        this.createPersonaNaturalForm();
        this.email = '';
        this.email_contact = '';
        this.changeContratanteInput = false;
        this.changeContactoInput = false;
        this.documentChange= '';
        this.reference2.close()
    }

    changeContratante(){
        this.changeContratanteInput = true;
    }

    changeContacto(){
        this.changeContactoInput = true;
    }

    ActualizarClienteInmobiliariaC = (item) => {
        let val : number = 0;
        let tempN = {
            P_NBRANCH: this.contratanteModel.NBRANCH,
            P_NPRODUCT: this.contratanteModel.NPRODUCT,
            P_NPOLICY: this.contratanteModel.NPOLICY
        }
        this.inmobiliaryMaintenanceClientService.PayDateInmob(tempN).subscribe(
            res => {
                val = res.Result.P_VALOR;
                let msj = 'Se está cambiando el Ruc/ Razón  del contratante.';
                if(this.changeContactoInput && !this.changeContratanteInput){
                    msj = 'Se está cambiando los datos del contacto del contratante.';
                }

                Swal.fire({
                    title: val == 1 ? msj  : 'El contratante tiene comprobantes emitidos y declarados a SUNAT. El cambio se aplicará a los futuros comprobantes.',
                    text: '¿Desea proceder con la actualización?',
                    icon: 'question',
                    showCancelButton: true,
                    confirmButtonText: 'SÍ',
                    allowOutsideClick: false,
                    cancelButtonText: 'NO'
                }).then((result) => {
                    if (result.value){
                        this.loading = true;
                        let nomDocu = (this.typeDocs.find(x => x.NTIPDOC == this.documentChange)).STIPDOC_DES;
                        let temp = {
                            P_NOPCION: this.idOption.toString(),
                            P_NIDTRXEMISION: this.contratanteModel.NIDTRXEMISION,
                            P_SCOD_INTERNO: this.contratanteModel.SCOD_INTERNO,
                            P_NUSERCODE: this.userCode,
                            P_NTYPCLIENTDOC: this.contratanteModel.NTYPCLIENTDOC,
                            P_SCLIENT_OLD: this.contratanteModel.SCLIENT,
                            P_SCLINUMDOCU : this.contratanteModel.SCLINUMDOCU,
                            P_NTYPCLIENTDOC_NEW: this.contratanteModel.NTYPCLIENTDOC,
                            P_SCLINUMDOCU_NEW : this.tipoContrat == 1 ? this.personaJuridicaForm.controls['P_SCLINUMDOCU'].value : this.personaNaturalForm.controls['P_SCLINUMDOCU'].value,
                            P_SCLIENAME_NEW: this.tipoContrat == 1 ? this.personaJuridicaForm.controls['P_SCLIENAME'].value : this.personaNaturalForm.controls['P_SLASTNAME'].value + ' ' +  this.personaNaturalForm.controls['P_SLASTNAME2'].value + ', ' + this.personaNaturalForm.controls['P_SFIRSTNAME'].value,
                            P_SFIRSTNAME_NEW: this.tipoContrat == 2 ? this.personaNaturalForm.controls['P_SFIRSTNAME'].value : '',
                            P_SLASTNAME_NEW: this.tipoContrat == 2 ? this.personaNaturalForm.controls['P_SLASTNAME'].value : '',
                            P_SLASTNAME2_NEW: this.tipoContrat == 2 ? this.personaNaturalForm.controls['P_SLASTNAME2'].value : '',
                            P_SNAME_CONTACT : this.tipoContrat == 1 ? this.personaJuridicaForm.controls['P_SNAME_CONTACT'].value : this.personaNaturalForm.controls['P_SNAME_CONTACT'].value,
                            P_SPHONE_CONTACT : this.tipoContrat == 1 ? this.personaJuridicaForm.controls['P_SPHONE_CONTACT'].value : this.personaNaturalForm.controls['P_SPHONE_CONTACT'].value,
                            P_SMAIL_CONTACT : this.tipoContrat == 1 ? this.personaJuridicaForm.controls['P_SMAIL_CONTACT'].value : this.personaNaturalForm.controls['P_SMAIL_CONTACT'].value,
                            P_SE_MAIL : this.tipoContrat == 1 ? this.personaJuridicaForm.controls['P_SE_MAIL'].value : this.personaNaturalForm.controls['P_SE_MAIL'].value,
                            P_SCLIENT_NEW: null
                        };
                        this.inmobiliaryMaintenanceClientService.ActualizarClienteInmobiliaria(temp).subscribe(
                            res => {
                                this.loading = false;
                                this.closeModalForm();
                                //SCLIENAME
                                let ce = this.listToShowC.filter(x => x.SCLIENT == this.mantClientSelection);
                                let cm = this.listToShow.filter(x => x.SCLIENT == this.mantClientSelection);
                                if (res.Result.P_NCODE == 0) {
                                    Swal.fire('Información', 'Se actualizaron los datos del cliente exitosamente.', 'success');
                                    ce.forEach(element => {
                                        element.SCLIENAME = temp.P_SCLIENAME_NEW.toUpperCase();
                                        element.P_SCLINUMDOCU_NEW = temp.P_SCLINUMDOCU_NEW.toUpperCase();
                                    });
                                    cm.forEach(element => {
                                        element.SCLIENAME = temp.P_SCLIENAME_NEW.toUpperCase();
                                        element.SCLINUMDOCU = temp.P_SCLINUMDOCU_NEW.toUpperCase();
                                    });
                                } else {
                                    Swal.fire('Información', res.Result.P_SMESSAGE, 'error');
                                }
                            },
                            err => {
                                this.loading = false;
                                Swal.fire('Información', 'Ha ocurrido un error al actualizar los datos del cliente.', 'error');
                            }
                        )
                    }
                })
            }
        )
    }


    changeDocumento(){
        let document = this.documentChange;
        this.closeModalForm();
        this.documentChange = document;
        this.seleccionarDet(this.documentChange == "1" ? this.contentDatosJuridico : this.contentDatosNatural, null, this.documentChange, 2);
    }

    CleanCtrls = () => {
        this.idTypeDoc = '0';
        this.sTipoDocumento = '';
        this.sCodigoInterno = '';
        this.listToShow = [];
        this.listDetalles = [];
        this.currentPage = 1;
        this.totalItems = 0;
        this.maxSize = 10
        this.itemsPerPage = 15;
        this.idOption = "0";

        this.listToShowC = [];
        this.listConsulta = [];
        this.currentPageC = 1;
        this.totalItemsC = 0;
        this.maxSizeC = 10
        this.itemsPerPageC = 15;
    }

    buscarContratantes = () => {
        let regexNum = /\D/;
        let regexAlf = /[^a-zA-Z0-9]/;

        let item = {
            P_NTYPCLIENTDOC: this.idTypeDoc,
            P_SCLINUMDOCU: this.sTipoDocumento,
            P_SCOD_INTERNO: this.sCodigoInterno
        }

        if(item.P_NTYPCLIENTDOC == ""){
            Swal.fire('Información', 'Seleccione el tipo de documento.', 'warning');
            return
        }

        // NO SE SELECCIONÓ TIPO DE DOCUMENTO
        if (item.P_NTYPCLIENTDOC == "0" && item.P_SCLINUMDOCU) {
            Swal.fire('Información', 'Seleccione el tipo de documento.', 'warning');
            return;
        }

        // NO SE INGRESÓ NÚMERO DE DOCUMENTO
        if (item.P_NTYPCLIENTDOC != "0" && (item.P_SCLINUMDOCU == null || item.P_SCLINUMDOCU == "")) {
            if (item.P_NTYPCLIENTDOC == 1) { // RUC
                Swal.fire('Información', 'Ingrese el RUC.', 'warning');
                return;
            }
            if (item.P_NTYPCLIENTDOC == 2) { // DNI
                Swal.fire('Información', 'Ingrese el DNI.', 'warning');
                return;
            }
            if (item.P_NTYPCLIENTDOC == 4) { // CE
                Swal.fire('Información', 'Ingrese el CE.', 'warning');
                return;
            }
        }

        // VALIDACIONES REGEX
        if (item.P_NTYPCLIENTDOC !== "0" && item.P_SCLINUMDOCU) {
            item.P_SCLINUMDOCU = item.P_SCLINUMDOCU.trim();
            if (item.P_NTYPCLIENTDOC == 1) { // RUC
                if (regexNum.test(item.P_SCLINUMDOCU)) {
                    Swal.fire('Información', 'El RUC solo puede contener números.', 'warning');
                    return;
                } else {
                    if (item.P_SCLINUMDOCU.length !== 11) {
                        Swal.fire('Información', 'El RUC debe contener 11 dígitos.', 'warning');
                        return;
                    }
                }
            }
            if (item.P_NTYPCLIENTDOC == 2) { // DNI
                if (regexNum.test(item.P_SCLINUMDOCU)) {
                    Swal.fire('Información', 'El DNI solo puede contener números.', 'warning');
                    return;
                } else {
                    if (item.P_SCLINUMDOCU.length !== 8) {
                        Swal.fire('Información', 'El DNI debe contener 8 dígitos.', 'warning');
                        return;
                    }
                }
            }
            if (item.P_NTYPCLIENTDOC == 4) { // CE
                if (regexNum.test(item.P_SCLINUMDOCU)) {
                    Swal.fire('Información', 'El CE solo puede contener números.', 'warning');
                    return;
                } else {
                    if (item.P_SCLINUMDOCU.length < 8 || item.P_SCLINUMDOCU.length > 9) {
                        Swal.fire('Información', 'El CE debe contener hasta 9 caracteres.', 'warning');
                        return;
                    }
                }
            }
        }

        this.ListarDetalleContratantes(item);
    }

    ListarDetalleContratantes = (item) => {
        this.listToShow = [];
        this.listDetalles = [];
        this.itemSeleccionado = null;
        this.inmobiliaryMaintenanceClientService.GetContratantesList(item).subscribe(
            res => {
                this.currentPage = 1;
                this.listDetalles = res;
                this.totalItems = this.listDetalles.length;
                this.listToShow = this.listDetalles.slice(
                    (this.currentPage - 1) * this.itemsPerPage,
                    this.currentPage * this.itemsPerPage
                );
                if (this.listDetalles.length == 0) {
                    Swal.fire('Información', 'No se encontraron registros en la búsqueda.', 'warning');
                }
            },
            err => {
                Swal.fire('Información', 'Ha ocurrido un error al obtener los registros.', 'error');
            }
        )
    }

    SelectUpdate = (item, contentRazonSocial, contentDireccion, contentFechaEmision, contentGlosa, contentMonto, contentTipoFacturacion) => {

        // if(item == undefined || item == null  || this.idOption.toString() != '1'){
        //    Swal.fire('Información','Debe seleccionar un contrato', 'warning');
        //    return; 
        // }

        if(item == undefined || item == null){
           Swal.fire('Información','Debe seleccionar un contrato', 'warning');
           return; 
        }

        switch (this.idOption.toString()) {
            case "0": // NO SELECCIONÓ
                Swal.fire('Información', 'Debe seleccionar una opción.', 'warning');
                break;
            case "1": // RAZÓN SOCIAL - NOMBRES
                this.contratanteModel = item;
                //console.log(this.contratanteModel);
                
                if (item !== undefined) {
                    this.idBuscaPor = "0";
                    this.idValor = "";
                    this.listConsulta = [];
                    let temp =
                    {
                        NTYPCLIENTDOC: item.NTYPCLIENTDOC,
                        SCLIENAME: item.SCLIENAME,
                        SCLIENT: item.SCLIENT,
                        SCLINUMDOCU: item.SCLINUMDOCU,
                        SDESCRIPT: item.SDOCUMENT_DESC
                    }
                    this.listConsulta.push(temp);
                    this.totalItemsC = this.listConsulta.length;
                    this.listToShowC = this.listConsulta.slice(
                        (this.currentPageC - 1) * this.itemsPerPageC,
                        this.currentPageC * this.itemsPerPageC
                        )
                    this.clienteInicial = this.listConsulta[0];
                    //console.log(this.clienteInicial);
                    
                } else {
                    this.idBuscaPor = "0";
                    this.idValor = "";
                    this.listConsulta = [];
                }
                this.reference = this.modalService.open(contentRazonSocial, { backdrop: 'static', size: 'xl', keyboard: false, centered: true });
                break;
            case "2": // DIRECCIÓN
                this.sClient = item.SCLIENT;
                this.direcM = item;
                this.getDireccion();
                this.reference = this.modalService.open(contentDireccion, { backdrop: 'static', size: 'xl', keyboard: false, centered: true });
                break;
            case "3": // FECHA EMISIÓN
                this.fechaModel = item;
                let dateInicio = this.parsearFecha(this.fechaModel.DEFFECDATE);
                let dateFin = this.parsearFecha(this.fechaModel.DEXPIRDAT);
                let dateFact = this.parsearFecha(this.fechaModel.DFEC_EMISION);
                this.fInicioControl.setValue(dateInicio);
                this.fFinControl.setValue(dateFin);
                this.fFactControl.setValue(dateFact);

                this.validateFInicio = dateInicio;
                this.validateFFact = dateFact;

                let tempN = {
                    P_NBRANCH: this.fechaModel.NBRANCH,
                    P_NPRODUCT: this.fechaModel.NPRODUCT,
                    P_NPOLICY: this.fechaModel.NPOLICY
                }
                let val : number = 0;
                this.inmobiliaryMaintenanceClientService.PayDateInmob(tempN).subscribe(res => {
                    val = res.Result.P_VALOR;
                    if(val == 2){
                        this.fInicioControl.disable();
                    }else{
                        this.fInicioControl.enable();
                    }
                })
                this.reference = this.modalService.open(contentFechaEmision, { backdrop: 'static', size: 'xl', keyboard: false, centered: true });
                break;
            case "4": // GLOSA
                this.glosaModel = item;
                this.glosaContrato = this.glosaModel.SGLOSA;
                //console.log(this.glosaModel);
                if(this.glosaModel.STIP_EMISION == 'MAN'){
                    this.tManual = false
                }
                if(this.glosaModel.STIP_EMISION == 'AUT' && this.glosaModel.SGLOSA == ''){
                    Swal.fire('Información','No tiene registro de Facturación','error');
                    return;
                }

                this.reference = this.modalService.open(contentGlosa, { backdrop: 'static', size: 'xl', keyboard: false, centered: true });
                break;
            case "5": // MONTO
                this.montoModel = item;
                this.montoContrato = this.montoModel.NPREMIUM;
                this.reference = this.reference = this.modalService.open(contentMonto, { backdrop: 'static', size: 'xl', keyboard: false, centered: true });
                break;
            case "6": // TIPO FACTURACIÓN
            let data = {
                NVALOR : item.NVALOR
            }
            this.inmobiliaryMaintenanceClientService.GetListTipFacturacion(data).subscribe(
                res =>{
                    this.listFact = res;
                    this.factModel = item;
                    this.reference = this.modalService.open(contentTipoFacturacion, { backdrop: 'static', size: 'xl', keyboard: false, centered: true });
                },
                err => {
                    Swal.fire('Información','Ha ocurrido un error al obtener los registros.', 'error')
                }
            )
            break;
        }
    }

    private parsearFecha(fechaString: string): Date {
        const partesFecha = fechaString.split('/');
        const dia = +partesFecha[0];
        const mes = +partesFecha[1] - 1;
        const año = +partesFecha[2];

        return new Date(año, mes, dia);
    }


    getDireccion(){

        this.inmobiliaryMaintenanceClientService.GetDetalleDireccion(this.sClient).subscribe(res => {
            this.direccionModel = res.Result;
            this.direccionControl.setValue(this.direccionModel.SNOM_DIRECCION);
            this.numeroControl.setValue(this.direccionModel.SNUM_DIRECCION);
            this.interiorControl.setValue(this.direccionModel.SNUM_INTERIOR);
            this.inmobiliaryMaintenanceClientService.GetTipoVias().subscribe(res => {
                this.typeVias = res.Result;
                this.tipoViaControl.setValue(this.direccionModel.STI_DIRE)
            })

            this.inmobiliaryMaintenanceClientService.GetDepartamentos().subscribe(res => {
                this.departamentos = res.Result;
                this.departamentoControl.setValue(this.direccionModel.NDEPARTMENT)
            })

            this.inmobiliaryMaintenanceClientService.GetProvincias(this.direccionModel.NDEPARTMENT).subscribe(res => {
                this.provincias = res.Result;
                this.provinciaControl.setValue(this.direccionModel.NPROVINCE);
            })
           
    
            this.inmobiliaryMaintenanceClientService.GetDistrito(this.direccionModel.NPROVINCE).subscribe(res => {
                this.distritos = res.Result;
                this.distritoControl.setValue(this.direccionModel.NDISTRITO)
            })
            

        })
    }


    changeDepartamento(){
        this.inmobiliaryMaintenanceClientService.GetProvincias(this.departamentoControl.value).subscribe(res => {
            this.provincias = res.Result;
            this.provinciaControl.setValue(0);
            this.distritoControl.setValue(0);
            this.distritos = [];
        })
    }

    changeProvincia(){
        this.inmobiliaryMaintenanceClientService.GetDistrito(this.provinciaControl.value).subscribe(res => {
            this.distritos = res.Result;
            this.distritoControl.setValue(0);
        })
    }

    GetClientDetInmobiliaria = (e, i) => {
        this.objCons = {};
        this.inmobiliaryMaintenanceClientService.GetClientDetInmobiliaria({ P_SCLIENT: e }).subscribe(
            res => {
                if (res.Result.P_NCODE == 0) {
                    this.objCons = res.Result.P_LIST[0];
                    if (i == 1){
                        this.personaJuridicaForm.controls['P_SCLINUMDOCU'].setValue(this.objCons.SCLINUMDOCU);
                        this.personaJuridicaForm.controls['P_NTYPCLIENTDOC'].setValue(this.objCons.NTYPCLIENTDOC);
                        this.personaJuridicaForm.controls['P_NTYPCLIENTDOC'].disable();
                        this.personaJuridicaForm.controls['P_SCLIENAME'].setValue(this.objCons.SCLIENAME);
                        this.personaJuridicaForm.controls['P_SPHONE'].setValue(this.objCons.SPHONE);
                        this.personaJuridicaForm.controls['P_SPHONE'].disable();
                        this.personaJuridicaForm.controls['P_SNOM_DIRECCION'].setValue(this.objCons.SSTRET);
                        this.personaJuridicaForm.controls['P_SNOM_DIRECCION'].disable();
                        this.personaJuridicaForm.controls['P_SE_MAIL'].setValue(this.objCons.SMAIL);
                        this.personaJuridicaForm.controls['P_SE_MAIL'].disable();
                        this.personaJuridicaForm.controls['P_SNAME_CONTACT'].setValue(this.objCons.SNAME_CONTACT);
                        this.personaJuridicaForm.controls['P_SMAIL_CONTACT'].setValue(this.objCons.SMAIL_CONTACT);
                        this.personaJuridicaForm.controls['P_SPHONE_CONTACT'].setValue(this.objCons.SPHONE_CONTACT);
                    };
                    if (i == 2){
                        this.personaNaturalForm.controls['P_NTYPCLIENTDOC'].setValue(this.objCons.NTYPCLIENTDOC);
                        this.personaNaturalForm.controls['P_NTYPCLIENTDOC'].disable();
                        this.personaNaturalForm.controls['P_SCLINUMDOCU'].setValue(this.objCons.SCLINUMDOCU);
                        this.personaNaturalForm.controls['P_SFIRSTNAME'].setValue(this.objCons.NAME);
                        this.personaNaturalForm.controls['P_SLASTNAME'].setValue(this.objCons.APELLIDO_P);
                        this.personaNaturalForm.controls['P_SLASTNAME2'].setValue(this.objCons.APELLIDO_M);
                        const partesFecha = this.objCons.DBIRTHDAT.split('-');
                        const dia = +partesFecha[2];
                        const mes = +partesFecha[1];
                        const anio = +partesFecha[0];
                        let fecha = dia + '/'+ mes +'/' + anio
                        this.personaNaturalForm.controls['P_DBIRTHDAT'].setValue(fecha);
                        this.personaNaturalForm.controls['P_DBIRTHDAT'].disable();
                        this.personaNaturalForm.controls['P_SSEXCLIEN'].setValue(this.objCons.SSEXCLIEN);
                        this.personaNaturalForm.controls['P_SSEXCLIEN'].disable();
                        this.personaNaturalForm.controls['P_NNATIONALITY'].setValue(this.objCons.NNATIONALITY);
                        this.personaNaturalForm.controls['P_NNATIONALITY'].disable();
                        this.personaNaturalForm.controls['P_SNOM_DIRECCION'].setValue(this.objCons.SSTRET);
                        this.personaNaturalForm.controls['P_SNOM_DIRECCION'].disable();
                        this.personaNaturalForm.controls['P_SE_MAIL'].setValue(this.objCons.SMAIL);
                        this.personaNaturalForm.controls['P_SE_MAIL'].disable();
                        this.personaNaturalForm.controls['P_NCIVILSTA'].setValue(this.objCons.NCIVILSTA);
                        this.personaNaturalForm.controls['P_NCIVILSTA'].disable();
                        this.personaNaturalForm.controls['P_SPHONE'].setValue(this.objCons.SPHONE);
                        this.personaNaturalForm.controls['P_SPHONE'].disable();
                        this.personaNaturalForm.controls['P_SNAME_CONTACT'].setValue(this.objCons.SNAME_CONTACT);
                        this.personaNaturalForm.controls['P_SMAIL_CONTACT'].setValue(this.objCons.SMAIL_CONTACT);
                        this.personaNaturalForm.controls['P_SPHONE_CONTACT'].setValue(this.objCons.SPHONE_CONTACT);

                    }
                } else {
                    Swal.fire('Información', res.Result.P_SMESSAGE, 'error');
                }
            },
            err => {
                Swal.fire('Información', 'Ha ocurrido un error al obtener el detalle.', 'error');
            }
        )
    }

    seleccionarDet = (content, item, i, origin) => {
        this.mantenimientoCliente = origin;
        this.mantClientSelection = item;
        if(origin == 1){
            this.GetClientDetInmobiliaria(item, i);
        }else{
            this.personaJuridicaForm.controls['P_SE_MAIL'].setValidators(Validators.required);
            this.personaNaturalForm.controls['P_SE_MAIL'].setValidators(Validators.required);
        }
        this.reference2 = this.modalService.open(content, { backdrop: 'static', size: 'lg', keyboard: false, centered: true });
    }

    generaBusqueda = () => {
        this.listConsulta = [];

        if(this.idValor.trim() == ''){
            Swal.fire('Información','Debe ingresar el documento','warning');
            return;
        };
        this.loading = true;
        let item = {
            NOPCION: this.idBuscaPor,
            SVALOR: this.idValor
        }

        this.inmobiliaryMaintenanceClientService.GetConsultaClientesList(item).toPromise().then(
            res => {
                this.loading = false;
                this.currentPageC = 1;
                this.listConsulta = res;
                this.totalItemsC = this.listConsulta.length;
                this.listToShowC = this.listConsulta.slice(
                    (this.currentPageC - 1) * this.itemsPerPageC,
                    this.currentPageC * this.itemsPerPageC
                );
                if (this.listConsulta.length == 0) {
                    Swal.fire({
                        title: 'Información',
                        text: 'No se encontraron registros en la búsqueda. ¿Desea crear al cliente?',
                        icon: 'question',
                        showCancelButton: true,
                        confirmButtonText: 'Aceptar',
                        allowOutsideClick: false,
                        cancelButtonText: 'Cancelar'
                    }).then((result) => {
                        if (result.value) {
                            this.seleccionarDet(this.clienteInicial.NTYPCLIENTDOC == 2 ? this.contentDatosNatural : this.contentDatosJuridico, item, this.clienteInicial.NTYPCLIENTDOC, 2);
                        }
                    });
                }
            },
            err => {
                this.loading = false;
                Swal.fire('Información', 'Ha ocurrido un error al obtener los registros.', 'error');
            }
        )
    }

    pageChanged = (currentPage) => {
        this.currentPage = currentPage;
        this.listToShow = this.listDetalles.slice(
            (this.currentPage - 1) * this.itemsPerPage,
            this.currentPage * this.itemsPerPage
        );
    }

    pageChangedC = (currentPage) => {
        this.currentPageC = currentPage;
        this.listToShowC = this.listConsulta.slice(
            (this.currentPageC - 1) * this.itemsPerPageC,
            this.currentPageC * this.itemsPerPageC
        );
    }

    textValidate(event: any, type) {
        CommonMethods.textValidate(event, type)
    }


    updateMonto(){
        if(this.montoControl.invalid || Number(this.montoControl.value) <= 0){
            Swal.fire('Información','Debe ingresar un monto válido','warning');
            return;
        }
        Swal.fire({
            title: 'Información',
            text: 'Se actualizará el monto de facturación ¿Estás seguro que desea continuar?',
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Aceptar',
            allowOutsideClick: false,
            cancelButtonText: 'Cancelar'
        }).then((result) => {
            if (result.value) {
                this.loading = true;
                let tmp = {
                    P_NOPCION: this.idOption.toString(),
                    P_NIDTRXEMISION: this.montoModel.NIDTRXEMISION,
                    P_SCOD_INTERNO: this.montoModel.SCOD_INTERNO,
                    P_NPREMIUM: this.montoControl.value,
                    P_NUSERCODE: this.userCode
                };

                this.inmobiliaryMaintenanceClientService.ActualizarClienteInmobiliaria(tmp).subscribe(
                    res => {
                        this.loading = false;
                        Swal.fire('Información', 'Monto actualizado correctamente', 'success');
                        this.closeModal()
                        this.buscarContratantes()
                        this.reference.close();
                        return;
                    },
                    err => {
                        this.loading = false;
                        Swal.fire('Información', 'Hubo un error con el servidor', 'error');
                    }
                );
            }
        });

    }

    updateTipFact(){
        //console.log(this.reference);
        if(this.factControl.invalid){
            Swal.fire('Información','Debe seleccionar un tipo de facturación','warning');
            return;
        }

        this.inmobiliaryMaintenanceClientService.GetExistsBills(this.factModel.NBRANCH, this.factModel.NPRODUCT, this.factModel.NPOLICY).subscribe(
            res => {
                let msj = '';
                let subMsj = '';
                if(res.Result.P_NVALOR == 2){
                    msj = 'Se actualizarán los datos del contratante';
                    subMsj = '¿Desea proceder con la actualización?'
                }else{
                    msj = 'El contratante tiene comprobantes emitidos y declarados a SUNAT. El cambio se aplicará a los futuros comprobantes.'
                    subMsj = '¿Desea continuar con la actualización?'
                }


                Swal.fire({
                    title: msj,
                    text: subMsj,
                    icon: 'question',
                    showCancelButton: true,
                    confirmButtonText: 'Aceptar',
                    allowOutsideClick: false,
                    cancelButtonText: 'Cancelar'
                }).then((result) => {
                    if (result.value) {
                        this.loading = true;
                        let tmp = {
                            P_NOPCION: this.idOption.toString(),
                            P_NIDTRXEMISION: this.factModel.NIDTRXEMISION,
                            P_SCOD_INTERNO: this.factModel.SCOD_INTERNO,
                            P_STIP_EMISION: this.factControl.value,
                            P_NUSERCODE: this.userCode
                        };
        
                        this.inmobiliaryMaintenanceClientService.ActualizarClienteInmobiliaria(tmp).subscribe(
                            res => {
                                this.loading = false;
                                Swal.fire('Información', 'El tipo de facturación actualizado correctamente', 'success');
                                this.closeModal()
                                this.buscarContratantes()
                                this.reference.close();
                                return;
                            },
                            err => {
                                this.loading = false;
                                Swal.fire('Información', 'Hubo un error con el servidor', 'error');
                            }
                        );
                    }
                });

            }, err => {
                Swal.fire('Error','Hubo un error con el servidor','error')
            }
        )
    }

    updateGlosa(){
        if(this.glosaControl.invalid){
            Swal.fire('Información','Debe ingresar la nueva glosa','warning');
            return;
        }
        Swal.fire({
            title: 'Información',
            text: 'Se actualizará la glosa de la facturación automática ¿Estás seguro que desea continuar?',
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Aceptar',
            allowOutsideClick: false,
            cancelButtonText: 'Cancelar'
        }).then((result) => {
            if (result.value) {
                this.loading = true;
                let tmp = {
                    P_NOPCION: this.idOption.toString(),
                    P_NIDTRXEMISION: this.glosaModel.NIDTRXEMISION,
                    P_SCOD_INTERNO: this.glosaModel.SCOD_INTERNO,
                    P_SGLOSA_COMPROB: this.glosaControl.value,
                    P_NUSERCODE: this.userCode
                };

                this.inmobiliaryMaintenanceClientService.ActualizarClienteInmobiliaria(tmp).subscribe(
                    res => {
                        this.loading = false;
                        Swal.fire('Información', 'Glosa actualizada correctamente', 'success');
                        this.buscarContratantes();
                        this.closeModal()
                        this.reference.close();
                        return;
                    },
                    err => {
                        this.loading = false;
                        Swal.fire('Información', 'Hubo un error con el servidor', 'error');
                    }
                );
            }
        });

    }

    updateFeFact(){

        // console.log(this.bsFecInicio);
        // console.log(this.bsFecFin);
        
        Swal.fire({
            title: 'Información',
            text: 'Se actualizarán las fechas ¿Estás seguro que desea continuar?',
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Aceptar',
            allowOutsideClick: false,
            cancelButtonText: 'Cancelar'
        }).then((result) => {
            if (result.value) {
                this.loading = true;
                let tmp = {
                    P_NOPCION: this.idOption.toString(),
                    P_NIDTRXEMISION: this.fechaModel.NIDTRXEMISION,
                    P_SCOD_INTERNO: this.fechaModel.SCOD_INTERNO,
                    P_DSTARTDATE: this.typeOpt == "1" ? CommonMethods.formatDate(this.bsFecInicio) : CommonMethods.formatDate(this.bsFecFact),
                    P_DEXPIRDAT: CommonMethods.formatDate(this.bsFecFin),
                    P_NTYPE_DATE: this.typeOpt,
                    P_NUSERCODE: this.userCode
                };

                this.inmobiliaryMaintenanceClientService.ActualizarClienteInmobiliaria(tmp).subscribe(
                    res => {
                        this.loading = false;
                        Swal.fire('Información', 'Se actualizaron las fechas correctamente', 'success');
                        this.buscarContratantes();
                        this.closeModal()
                        this.reference.close();
                        return;
                    },
                    err => {
                        this.loading = false;
                        Swal.fire('Información', 'Hubo un error con el servidor', 'error');
                    }
                );
            }
        });
    }

    updateDireccion(){
        if(this.departamentoControl.invalid || this.provinciaControl.invalid || this.distritoControl.invalid || this.tipoViaControl.invalid 
            || this.direccionControl.invalid || this.numeroControl.invalid || this.interiorControl.invalid){
                Swal.fire('Información','Debe completar todos los campos obligatorios (*)','warning');
                return;
            }

        Swal.fire({
            title: 'Información',
            text: 'Se actualizará la dirección ¿Estás seguro que desea continuar?',
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Aceptar',
            allowOutsideClick: false,
            cancelButtonText: 'Cancelar'
        }).then((result) => {
            if (result.value) {
                this.loading = true;
                let tmp = {
                    P_NOPCION: this.idOption.toString(),
                    P_NIDTRXEMISION: this.direcM.NIDTRXEMISION,
                    P_SCOD_INTERNO: this.direcM.SCOD_INTERNO,
                    P_NTYPCLIENTDOC : this.direcM.NTYPCLIENTDOC,
                    P_SCLINUMDOCU: this.direcM.SCLINUMDOCU,
                    P_NUSERCODE: this.userCode,
                    P_NPROVINCE: this.departamentoControl.value,
                    P_NLOCAL: this.provinciaControl.value,
                    P_NMUNICIPALITY: this.distritoControl.value,
                    P_SNOM_DIRECCION: this.direccionControl.value,
                    P_SNUM_DIRECCION: this.numeroControl.value,
                    P_SNUM_INTERIOR: this.interiorControl.value,
                    P_SMANZANA: this.direccionModel.SMANZANA,
                    P_SLOTE: this.direccionModel.SLOTE,
                    P_SREFERENCIA: this.direccionModel.SREFERENCIA,
                    P_STI_DIRE: this.tipoViaControl.value
                };

                this.inmobiliaryMaintenanceClientService.ActualizarClienteInmobiliaria(tmp).subscribe(
                    res => {
                        this.loading = false;
                        Swal.fire('Información', 'Dirección actualizada correctamente', 'success');
                        this.buscarContratantes()
                        this.closeModal()
                        return;
                    },
                    err => {
                        this.loading = false;
                        Swal.fire('Información', 'Hubo un error con el servidor', 'error');
                    }
                );
            }
        });
        
    }

    updateCliente(){

        if(this.clienteSeleccionado == null){
            Swal.fire('Información','Debe seleccionar un cliente.','warning');
            return;
        };

        if(this.clienteSeleccionado.SCLIENT == this.clienteInicial.SCLIENT ){
            Swal.fire('Información','Debe seleccionar un cliente distinto al original.','warning');
            return;
        }

        //console.log(this.clienteSeleccionado);
        
        Swal.fire({
            title: 'Información',
            text: 'Se actualizará el cliente ¿Estás seguro que desea continuar?',
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Aceptar',
            allowOutsideClick: false,
            cancelButtonText: 'Cancelar'
        }).then((result) => {
            if (result.value) {
                this.loading = true;
                let tmp = {
                    P_NOPCION: this.idOption.toString(),
                    P_NIDTRXEMISION: this.contratanteModel.NIDTRXEMISION,
                    P_SCOD_INTERNO: this.contratanteModel.SCOD_INTERNO,
                    P_SCLIENT_OLD: this.clienteInicial.SCLIENT,
                    P_SCLIENT_NEW : this.clienteSeleccionado.SCLIENT,
                    P_NUSERCODE: this.userCode,
                };

                this.inmobiliaryMaintenanceClientService.ActualizarClienteInmobiliaria(tmp).subscribe(
                    res => {
                        this.loading = false;
                        Swal.fire('Información', 'Cliente actualizado correctamente', 'success');
                        this.sTipoDocumento = this.clienteSeleccionado.SCLINUMDOCU.trim();
                        this.idTypeDoc = this.clienteSeleccionado.NTYPCLIENTDOC;
                        this.buscarContratantes()
                        this.closeModal()
                        return;
                    },
                    err => {
                        this.loading = false;
                        Swal.fire('Información', 'Hubo un error con el servidor', 'error');
                    }
                );
            }
        });
    }
}