import { Component, OnInit } from '@angular/core';
import { NgbModal, ModalDismissReasons, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { BsDatepickerConfig } from 'ngx-bootstrap/datepicker';
import { ParameterSettingsService } from '../../../services/maintenance/parameter-settings.service';
import Swal from 'sweetalert2'


@Component({
    selector: 'app-combination-activities-dialog',
    templateUrl: './combination-activities-dialog.component.html',
    styleUrls: ['./combination-activities-dialog.component.css']
})
export class CombinationActivitiesDialogComponent implements OnInit {
    reference: NgbModalRef;
    bsConfig: Partial<BsDatepickerConfig>;
    activityList: any[] = [];
    activityListToShow: any[] = []
    data: any
    activityFilter: string
    combActivityList: any[] = []
    initialized: boolean = true

    disableFlag: number = -1
    disableFlags: any = { INICIO_VIGENCIA: 1, COMENTARIOS: 2, CHK: 4 }


    currentPage = 1; //página actual
    rotate = true; //
    maxSize = 4; // cantidad de paginas que se mostrarán en el paginado
    itemsPerPage = 5; // limite de items por página
    totalItems = 0; //total de items encontrados

    currentPage2 = 1; //página actual
    rotate2 = true; //
    maxSize2 = 5; // cantidad de paginas que se mostrarán en el paginado
    itemsPerPage2 = 5; // limite de items por página
    totalItems2 = 0; //total de items encontrados
    public foundResults: any = [];  //Lista de registros encontrados durante la búsqueda
    filter: any = {}; //Objeto con datos de búsqueda que se llena en la primera búsqueda y que quedará en memoria para los cambios de página, el atributo PageNumber (Nro de página) está enlazado con el elemento de paginado del HTML y se actualiza automaticamente

    activityListMina: any[] = [];
    activityListAR: any[] = [];
    userId;
    mining: number = 1;
    viewMode: number = 1;
    minDate;
    
    constructor(
        private parameterSettingsService: ParameterSettingsService
    ) {
        this.bsConfig = Object.assign(
            {},
            {
                dateInputFormat: 'DD/MM/YYYY',
                locale: 'es',
                showWeekNumbers: false,
            }
        );
    }


    ngOnInit() {
        this.userId = JSON.parse(localStorage.getItem('currentUser'))['id'];
        this.data.MINING = 1;
        this.getCombActivities();
        this.getActivityList();
        //this.visualizarLista();
        if (this.foundResults.length == 0) {
            this.data.INICIO_VIGENCIA = new Date();
            this.minDate = undefined;
        }
    }

    pageChanged2(page: number) {
        this.currentPage2 = page;
        this.combActivityList = this.foundResults.slice(((this.currentPage2 - 1) * this.itemsPerPage2), (this.currentPage2 * this.itemsPerPage2));
    }
    changeStatus(item: any, type: number, e) {
        if (item.CHK == true) {
            let itemList: any = {};
            itemList.CHK = item.CHK;
            itemList.SCOD_ACTIVITY_TEC = item.SCOD_ACTIVITY_TEC;
            itemList.SDESCRIPT = item.SDESCRIPT;
            itemList.TYPE = type;
            this.activityListMina.push(itemList)
            this.activityFilter = '';
            //this.pageChanged(1);
        } else {
            this.activityListMina = this.activityListMina.filter(f => f.SCOD_ACTIVITY_TEC != item.SCOD_ACTIVITY_TEC && f.TYPE == type)
        }
    }

    getActivityList() {
        let _data: any = {};
        this.parameterSettingsService.getActivityList(_data).subscribe(res => {
            this.activityList = res;
            if (this.viewMode == 1) {
                this.visualizarLista();
            } else {
                this.activityList.forEach(e1 => {
                    e1.CHK = false;
                });
            }
            this.totalItems = this.activityList.length
            this.activityListToShow = this.activityList.slice(((this.currentPage - 1) * this.itemsPerPage), (this.currentPage * this.itemsPerPage))
        })
    }
    mostrarMas() {
        this.currentPage = 1;
        this.activityListToShow = this.activityList.slice(((this.currentPage - 1) * this.itemsPerPage), (this.currentPage * this.itemsPerPage));
    }

    pageChanged(currentPage) {
        this.currentPage = currentPage;
        this.activityListToShow = this.activityList.slice(((this.currentPage - 1) * this.itemsPerPage), (this.currentPage * this.itemsPerPage));
    }

    onFilterActivity(event: any) {
        if (this.activityFilter != '') {
            this.activityListToShow = this.activityList.filter(it => it.SDESCRIPT.toUpperCase().includes(this.activityFilter.toUpperCase()))
        } else {
            this.pageChanged(1);
        }
    }

    disable(flag: number) {
        return (this.disableFlag & flag) > 0
    }

    enableAll() {
        this.disableFlag = 0;
        this.viewMode = 0;
        this.getActivityList();
        this.activityListMina = [];
        if (this.foundResults.length > 0) {
            let item = this.foundResults.find(f => f.ESTADO == 'ACTIVO');
            this.seeMovement(item);
            try {
                let strFecha;
                if (this.foundResults.length > 1) {
                    strFecha = this.foundResults[0].DEFFECDATE;
                } else {
                    strFecha = this.foundResults.filter(f => f.ESTADO == 'ACTIVO')[0].DEFFECDATE;
                }
                var dateParts = strFecha.split("/");
                var dateObject = new Date(+dateParts[2], dateParts[1] - 1, +dateParts[0]);
                let fechaIniLate: Date = new Date(dateObject.setDate(dateObject.getDate()));
                this.data.INICIO_VIGENCIA = fechaIniLate >= new Date() ? fechaIniLate : new Date();
                this.minDate = fechaIniLate;
            } catch (error) {

            }
        } else {
            this.data.INICIO_VIGENCIA = new Date();
            this.minDate = undefined;
        }
        this.data.COMENTARIO = '';
    }

    save() {
        let msg = '';
        if (this.data.INICIO_VIGENCIA == undefined || this.data.INICIO_VIGENCIA == '') {
            msg += 'Ingrese un valor en el campo "Inicio de vigencia"\n';
        }
        if (msg != '') {
            Swal.fire('Información', msg, 'info');
            return;
        } else {
            Swal.fire({
                title: '¿Desea guardar?',
                text: '¿Desea guardar la configuración de Actividades de alto riesgo?',
                icon: 'question',
                showCancelButton: true,
                confirmButtonText: 'Sí',
                allowOutsideClick: false,
                cancelButtonText: 'No'
            }).then(result => {
                if (result.value) {
                    let _data: any = {};
                    _data.NBRANCH = this.data.NBRANCH
                    _data.NPRODUCT = this.data.NPRODUCT
                    _data.MINING = this.mining;
                    _data.SCOD_ACTIVITY = this.data.SCOD_ACTIVITY
                    _data.INICIO_VIGENCIA = this.data.INICIO_VIGENCIA.getDate().toString().padStart(2, '0') + '/' + (this.data.INICIO_VIGENCIA.getMonth() + 1).toString().padStart(2, '0') + '/' + this.data.INICIO_VIGENCIA.getFullYear(); //Fecha Inicio
                    _data.COMENTARIO = this.data.COMENTARIO
                    _data.USUARIO = this.userId;
                    _data.LIST_ACTIVITY = this.activityListMina.filter(f => f.CHK == true);
                    _data.NPERFIL = this.data.NPERFIL;
                    _data.NTYPE_TRANSAC = this.data.NTYPE_TRANSAC;
                    this.parameterSettingsService.insertActivities(_data).subscribe(
                        res => {
                            if (res.code == 0) {
                                Swal.fire('Información', 'Se ha actualizado la configuración en Actividades de alto riesgo.', 'success');
                                this.getCombActivities();
                                this.disableFlag = -1;
                                this.viewMode = 1;
                            } else {
                                Swal.fire('Información', res.message, 'error');
                            }
                        },
                        err => {
                            console.log(err)
                        }
                    );
                }
            });
        }
    }

    getCombActivities() {
        let _data: any = {};
        _data.NBRANCH = this.data.NBRANCH;
        _data.NPRODUCT = this.data.NPRODUCT;
        _data.NPERFIL = this.data.NPERFIL;
        _data.NTYPE_TRANSAC = this.data.NTYPE_TRANSAC;
        this.parameterSettingsService.getCombActivities(_data).subscribe(res => {
            this.foundResults = res
            if (this.foundResults != null && this.foundResults.length > 0) {
                this.totalItems2 = this.foundResults.length;
                this.combActivityList = this.foundResults.slice(((this.currentPage2 - 1) * this.itemsPerPage2), (this.currentPage2 * this.itemsPerPage2));
                let defaultValues = this.foundResults.find(f => f.ESTADO == 'ACTIVO');
                this.seeMovement(defaultValues);
                _data.NMOVEMENT = defaultValues.NMOVEMENT;
                this.cargarMarcados(defaultValues.NMOVEMENT);
            }
            else {
                this.totalItems2 = 0;
            }
        },
            err => { console.log(err) }
        )
    }
    cargarMarcados(movement: number) {
        let _data: any = {};
        _data.NMOVEMENT = movement;
        _data.NBRANCH = this.data.NBRANCH;
        _data.NPRODUCT = this.data.NPRODUCT;
        _data.NPERFIL = this.data.NPERFIL;
        _data.NTYPE_TRANSAC = this.data.NTYPE_TRANSAC;
        this.parameterSettingsService.GetActivityListMovement(_data).subscribe(
            res => {
                this.activityListMina = res;
                this.updateCheck();
            }
        );
    }
    insertCombActivDet() {
        let activities = this.activityList.filter(it => it.CHK == 1)
        activities.forEach(it => {
            it.SCOD_ACTIVITY = it.SCOD_ACTIVITY_TEC
            it.MINING = this.data.MINING
            this.parameterSettingsService.insertCombActivDet(it).subscribe(res => {
            }, err => { console.log(err) })
        })
        Swal.fire('Información', 'Se actualizó la Combinación de Actividades', 'info')
    }

    seeMovement(activity: any) {
        this.data.INICIO_VIGENCIA = activity.DEFFECDATE;
        this.data.COMENTARIO = activity.SCOMMENT;
        this.getActivityList();
        this.cargarMarcados(activity.NMOVEMENT);
    }

    updateCheck() {
        if (this.viewMode == 1) {
            this.getActivityList();
        } else {
            this.activityList.forEach(e1 => {
                e1.CHK = false;
            });
            this.activityList.forEach(e1 => {
                this.activityListMina.forEach(e2 => {
                    if (e2.TYPE == this.mining) {
                        if (e1.SCOD_ACTIVITY_TEC == e2.SCOD_ACTIVITY_TEC) {
                            e1.CHK = true;
                        }
                    }
                });
            });
        }
    }
    visualizarLista() {
        let listToView: any[] = [];
        this.activityList.forEach(e1 => {
            this.activityListMina.forEach(e2 => {
                if (e2.TYPE == this.mining) {
                    if (e1.SCOD_ACTIVITY_TEC == e2.SCOD_ACTIVITY_TEC) {
                        listToView.push(e1);
                    }
                }
            });
        });
        this.activityList = listToView;
        this.pageChanged(1);
        this.mostrarMas();
    }
    mostrarMas2() {
        this.currentPage2 = 1;
        this.combActivityList = this.foundResults.slice(((this.currentPage2 - 1) * this.itemsPerPage2), (this.currentPage2 * this.itemsPerPage2));
    }
}
