import { Component, OnInit } from '@angular/core';
import { NgbModal, ModalDismissReasons, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { BsDatepickerConfig } from 'ngx-bootstrap/datepicker';
import { ParameterSettingsService } from '../../../services/maintenance/parameter-settings.service';
import Swal from 'sweetalert2'
import { ToastrService } from 'ngx-toastr';
//import { swalDefaultsProvider } from '@sweetalert2/ngx-sweetalert2/di';
@Component({
    selector: 'app-retroactivity-dialog',
    templateUrl: './retroactivity-dialog.component.html',
    styleUrls: ['./retroactivity-dialog.component.css']
})
export class RetroactivityDialogComponent implements OnInit {
    reference: NgbModalRef;

    ActiveRegister: any;
    profile: string = "in";
    retroactivity: number = 0;
    postDays: number = 0;
    data: any = {};
    msgToast: string;
    disableFlag: number = -1
    disableFlags: any = {
        INTERNO: 1, EXTERNO: 2, RETRO_DENTRO_MES: 4, RETRO_CONFIG_DIAS: 8, DIAS_POSTERIORES: 16, SIN_LIMITE_DIAS: 32, DIAS_RETROACTIVOS: 64, COMENTARIO: 128,
        VIG_DENTRO_MES: 256, VIG_CONFIG_DIAS: 512, INICIO_VIGENCIA: 1024, NCONFIG_DIAS: 2048
    }
    vigency: number = 1

    configDaysList: any[] = []
    retroactivityList: any[] = []
    initialized: boolean = true


    messages: any[] = [];
    defaultData: any = {};

    /**
     * Variables de paginación
     */
    currentPage = 1; //página actual
    rotate = true; //
    maxSize = 5; // cantidad de paginas que se mostrarán en el paginado
    itemsPerPage = 5; // limite de items por página
    totalItems = 0; //total de items encontrados
    //public foundResults: any = [];  //Lista de registros encontrados durante la búsqueda
    filter: any = {}; //Objeto con datos de búsqueda que se llena en la primera búsqueda y que quedará en memoria para los cambios de página, el atributo PageNumber (Nro de página) está enlazado con el elemento de paginado del HTML y se actualiza automaticamente

    listToShow: any;

    profileId: number;
    userId: number;

    bsConfig: Partial<BsDatepickerConfig>;

    minDateIni;
    codProducto = JSON.parse(localStorage.getItem('codProducto'))['productId']; // 20230325

    constructor(
        private toastr: ToastrService,
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
        this.userId = JSON.parse(localStorage.getItem('currentUser'))['id'];
        this.profileId = await this.getProfileProduct(); // 20230325
        //this.disableFlag &= ~(this.disableFlags.INTERNO | this.disableFlags.EXTERNO);
        this.disableFlag = -1;
        this.getConfigDays();
        this.getRetroactivityList();
        if (this.retroactivityList.length == 0) {
            this.data.INICIO_VIGENCIA = new Date();
            this.minDateIni = undefined;
        }
        this.loadMessages();
    }

    async getProfileProduct() {
        let profile = 0;

        let _data: any = {};
        _data.nUsercode = this.userId;
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

    pageChanged(page: number) {
        this.currentPage = page;
        this.listToShow = this.retroactivityList.slice(((this.currentPage - 1) * this.itemsPerPage), (this.currentPage * this.itemsPerPage));
    }

    disable(flag: number) {
        return (this.disableFlag & flag) > 0
    }

    enableAll() {
        this.disableFlag = 0;
        if (this.retroactivityList.length > 0) {
            let defaultValues = this.retroactivityList.find(f => f.ESTADO == 'ACTIVO')
            this.setDefaultValues(defaultValues);
            try {
                let strFecha;
                if (this.retroactivityList.length > 1) {
                    strFecha = this.retroactivityList[0].DINI_VIGENCIA;
                } else {
                    strFecha = this.retroactivityList.filter(f => f.ESTADO == 'ACTIVO')[0].DINI_VIGENCIA;
                }
                var dateParts = strFecha.split("/");
                var dateObject = new Date(+dateParts[2], dateParts[1] - 1, +dateParts[0]);
                let fechaIniLate: Date = new Date(dateObject.setDate(dateObject.getDate()));
                this.data.INICIO_VIGENCIA = fechaIniLate >= new Date() ? fechaIniLate : new Date();
                this.minDateIni = fechaIniLate;
            } catch (error) {

            }
        } else {
            this.data.INICIO_VIGENCIA = new Date();
        }
        this.data.COMENTARIO = '';
    }
    async retroactivityToast(config: number) {
        let message = this.messages.find(f => f.type == 1 && f.transaction == this.data.NTYPE_TRANSAC && f.retroactivity == config).message;
        await this.toastr.info(message, 'Recuerda!', { timeOut: 20000, toastClass: 'toast-vl ngx-toastr' });
        this.data.postDays = undefined;
        this.data.reactiveDays = undefined;
    }
    async vigencyToast(config: number) {
        let message = this.messages.find(f => f.type == 2 && f.transaction == this.data.NTYPE_TRANSAC && f.retroactivity == config).message;
        await this.toastr.info(message, 'Recuerda!', { timeOut: 20000, toastClass: 'toast-vl ngx-toastr' });
        if (config == 1) {
            this.data.vigDays == undefined;
        }
    }
    checkNoLimit() {
        this.postDays = 0;
    }

    save() {
        let msg = '';
        if (this.data.INICIO_VIGENCIA == '' || this.data.INICIO_VIGENCIA == undefined) {
            msg += 'Ingrese un valor en el campo "Fecha Inicio"</br>';
        }
        if (this.data.SDESCRIPT_TRANSAC != 'Cotización') {
            if (this.data.retroactivity == 1) {
                if (this.data.postDays === undefined || this.data.postDays === '' || isNaN(this.data.postDays)) {
                    msg += 'Ingrese un valor en el campo "Días posteriores"</br>';
                }
            } else if (this.data.retroactivity == 2) {
                if (this.data.reactiveDays === undefined || this.data.reactiveDays === '' || isNaN(this.data.reactiveDays)) {
                    msg += 'Ingrese un valor en el campo "Días retroactivos"</br>';
                }
                if (this.data.postDays === undefined || this.data.postDays === '' || isNaN(this.data.postDays)) {
                    msg += 'Ingrese un valor en el campo "Días posteriores"</br>';
                }
            } else {
                msg += 'Seleccione "Retroactividad"';
            }
        }
        else {
            if (this.data.vigency == 1) {

            } else if (this.data.vigency == 2) {
                if (this.data.vigDays == undefined || this.data.vigDays == '' || this.data.vigDays == '0' || isNaN(this.data.vigDays)) {
                    msg += 'Ingrese un valor válido en el campo "Días"</br>';
                }
                if (!isNaN(this.data.vigDays)) {
                    if (parseFloat(this.data.vigDays) <= 0) {
                        msg += 'Ingrese un valor superior a 0 en el campo "Días".</br>';
                    }
                }
            } else {
                msg += 'Seleccione "Vigencia"';
            }
        }
        if (msg != '') {
            Swal.fire('Información', msg, 'info');
            return;
        } else {
            Swal.fire({
                title: '¿Desea guardar?',
                text: '¿Desea guardar la configuración para retroactividad?',
                icon: 'question',
                showCancelButton: true,
                confirmButtonText: 'Sí',
                allowOutsideClick: false,
                cancelButtonText: 'No'
            })
                .then(result => {
                    if (result.value) {
                        let iniVig = '';
                        try {
                            iniVig = this.data.INICIO_VIGENCIA.getDate().toString().padStart(2, '0') + '/' + (this.data.INICIO_VIGENCIA.getMonth() + 1).toString().padStart(2, '0') + '/' + this.data.INICIO_VIGENCIA.getFullYear(); //Fecha Inicio
                        } catch (error) {
                            iniVig = this.data.INICIO_VIGENCIA;
                        }
                        this.data.NRETROACTIVIDAD = this.data.retroactivity
                        this.data.NRETRO_DIAS_RETROACTIVOS = this.data.reactiveDays
                        this.data.NRETRO_DIAS_POSTERIORES = this.data.postDays
                        this.data.SCOMMENT = this.data.comment
                        this.data.NVIGENCIA_COTIZACION = this.data.vigency
                        this.data.NVIG_DIAS = this.data.vigDays
                        this.data.PROFILE_ID = this.profileId;
                        this.data.NUSER_CODE = this.userId;
                        this.data.INICIO_VIGENCIA = iniVig;
                        this.parameterSettingsService.insertRetroactivity(this.data).subscribe(
                            res => {
                                if (res.code == 0) {
                                    this.getRetroactivityList()
                                    Swal.fire('Información', 'Se actualizó la Retroactividad', 'info');
                                    this.disableFlag = -4
                                } else {
                                    Swal.fire('Información', res.message, 'error');
                                }
                            }, err => {
                                console.log(err)
                            }
                        )
                    }
                });
        }
    }

    getConfigDays() {
        this.parameterSettingsService.getConfigDays().subscribe(res => { this.configDaysList = res }, err => { console.log(err) })
    }
    getRetroactivityList() {
        let data: any = {
            nBranch: this.data.NBRANCH,
            nProduct: this.data.NPRODUCT,
            nTypeTransac: this.data.NTYPE_TRANSAC,
            nPerfil: this.data.NPERFIL,
            nGob: this.data.P_SISCLIENT_GBD
        }
        this.parameterSettingsService.getRetroactivityList(data).subscribe(res => {
            this.retroactivityList = res
            if (this.retroactivityList != null && this.retroactivityList.length > 0) {
                this.totalItems = this.retroactivityList.length;
                this.listToShow = this.retroactivityList.slice(((this.currentPage - 1) * this.itemsPerPage), (this.currentPage * this.itemsPerPage));
                if (this.initialized) {
                    let defaultValues = this.retroactivityList.find(f => f.ESTADO == 'ACTIVO');
                    this.setDefaultValues(defaultValues);
                }
            }
            else {
                this.totalItems = 0;
            }
        }, err => { console.log(err) })
    }

    setDefaultValues(defaultValues: any) {
        this.data.retroactivity = defaultValues.NRETROACTIVIDAD
        this.data.reactiveDays = defaultValues.NRETRO_DIAS_RETROACTIVOS
        this.data.postDays = defaultValues.NRETRO_DIAS_POSTERIORES
        this.data.comment = defaultValues.SCOMMENT
        this.data.vigency = defaultValues.NVIGENCIA_COTIZACION
        this.data.vigDays = defaultValues.NVIG_DIAS
        this.data.INICIO_VIGENCIA = defaultValues.DINI_VIGENCIA;

    }

    seeMovement(movement: number) {
        let defaultValues = this.retroactivityList.find(f => f.NUMERO == movement)
        this.setDefaultValues(defaultValues)
    }

    mostrarMas() {
        this.currentPage = 1;
        this.listToShow = this.retroactivityList.slice(((this.currentPage - 1) * this.itemsPerPage), (this.currentPage * this.itemsPerPage));
    }
    loadMessages() {
        let data: any = {
            nBranch: this.data.NBRANCH,
            nProduct: this.data.NPRODUCT
        }
        this.parameterSettingsService.GetRetroactivityMessage(data).subscribe(
            res => {
                this.messages = res;
            }, err => {
                console.log(err)
            }
        );
    }
}
