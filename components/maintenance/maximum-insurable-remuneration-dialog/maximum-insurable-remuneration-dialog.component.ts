import { Component, OnInit } from '@angular/core';
import { NgbModal, ModalDismissReasons, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { BsDatepickerConfig } from 'ngx-bootstrap/datepicker';
import { ParameterSettingsService } from '../../../services/maintenance/parameter-settings.service';
import Swal from 'sweetalert2'

@Component({
    selector: 'app-maximum-insurable-remuneration-dialog',
    templateUrl: './maximum-insurable-remuneration-dialog.component.html',
    styleUrls: ['./maximum-insurable-remuneration-dialog.component.css']
})
export class MaximumInsurableRemunerationDialogComponent implements OnInit {
    reference: NgbModalRef;
    disableFlag: number = -1
    disableFlags: any = { RMA: 1, INICIO_VIGENCIA: 2, FIN_VIGENCIA: 4, COMENTARIO: 8 }
    data: any = {}
    bsConfig: Partial<BsDatepickerConfig>;
    rmaList: any[] = []
    initialized: boolean = true
    inicioVigencia: Date;
    finVigencia: Date;
    minDate;


    /**
   * Variables de paginación
   */
    currentPage = 1; //página actual
    rotate = true; //
    maxSize = 5; // cantidad de paginas que se mostrarán en el paginado
    itemsPerPage = 5; // limite de items por página
    totalItems = 0; //total de items encontrados
    public foundResults: any = [];  //Lista de registros encontrados durante la búsqueda
    filter: any = {}; //Objeto con datos de búsqueda que se llena en la primera búsqueda y que quedará en memoria para los cambios de página, el atributo PageNumber (Nro de página) está enlazado con el elemento de paginado del HTML y se actualiza automaticamente
    userId;

    constructor(
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

    ngOnInit() {
        this.userId = JSON.parse(localStorage.getItem('currentUser'))['id'];
        this.getRma();
        if (this.foundResults.length == 0) {
            this.data.INICIO_VIGENCIA = new Date();
            this.minDate = undefined;
            this.calcularFin(null);
        }
    }

    disable(flag: number) {
        return (this.disableFlag & flag) > 0
    }

    enableAll() {
        this.disableFlag = 0
        //if (this.rmaList.length > 0) this.disableFlag |= this.disableFlags.INICIO_VIGENCIA
        //this.bsConfig.minDate = new Date();
        if (this.foundResults.length > 0) {
            this.fillDefaultValues(this.foundResults[0]);
            let strFecha;
            if (this.foundResults.length > 1) {
                strFecha = this.foundResults[0];
            } else {
                strFecha = this.foundResults[0];
            }
            //let strFecha = this.foundResults[0];// this.foundResults.find(f=>f.ESTADO == 'ACTIVO');
            this.setStartDate(strFecha.FIN_VIG)
        } else {
            this.data.RMA = 0;
            this.data.COMENTARIO = '';
        }
    }

    notInicioVigencia() {
        return ~(this.disableFlags.INICIO_VIGENCIA)
    }

    save() {
        let msg = '';
        if (this.data.RMA == '' || this.data.RMA == undefined || this.data.RMA == '0' || isNaN(this.data.RMA)) {
            msg += 'Ingrese un monto valido en el campo "RMA".';
        }
        if (!isNaN(this.data.RMA)) {
            if (parseFloat(this.data.RMA) <= 0) {
                msg += 'Ingrese un monto superior a 0 por favor.';
            }
        }
        if (this.data.INICIO_VIGENCIA == '' || this.data.INICIO_VIGENCIA == undefined) {
            msg += 'Ingrese un valor en el campo "Fecha inicio"'
        }
        if (this.data.FIN_VIGENCIA == '' || this.data.FIN_VIGENCIA == undefined) {
            msg += 'Ingrese un valor en el campo "Fecha fin"'
        }
        if (this.data.INICIO_VIGENCIA > this.data.FIN_VIGENCIA) {
            msg += 'La fecha fin de vigencia no puede ser menor a la fecha de inicio';
        }
        if (msg != '') {
            Swal.fire('Información', msg, 'error');
            return;
        } else {
            Swal.fire({
                title: '¿Desea guardar?',
                text: '¿Desea guardar la configuración de RMA?',
                icon: 'question',
                showCancelButton: true,
                confirmButtonText: 'Sí',
                allowOutsideClick: false,
                cancelButtonText: 'No'
            }).then(result => {
                if (result.value) {
                    this.data.NUSERCODE = this.userId;
                    this.parameterSettingsService.insertRma(this.data).subscribe(
                        res => {
                            if (res.code == 0) {
                                this.getRma()
                                Swal.fire('Información', 'Se actualizó la Remuneración Máxima Asegurable', 'success')
                                this.disableFlag = -1;
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

    getRma() {
        let data: any = {};
        data.NTYPE_TRANSAC = this.data.NTYPE_TRANSAC
        data.NBRANCH = this.data.NBRANCH
        data.NPRODUCT = this.data.NPRODUCT
        data.NPERFIL = this.data.NPERFIL;
        this.parameterSettingsService.getRma(data).subscribe(res => {
            this.rmaList = res
            this.foundResults = res
            if (this.foundResults != null && this.foundResults.length > 0) {
                this.totalItems = this.foundResults.length;
                this.rmaList = this.foundResults.slice(((this.currentPage - 1) * this.itemsPerPage), (this.currentPage * this.itemsPerPage));
                if (this.initialized) {
                    if (this.foundResults.length > 0) {
                        let defaultValues;
                        if (this.foundResults.length > 1) {
                            defaultValues = this.foundResults.filter(f => f.ESTADO == 'ACTIVO');
                        } else {
                            defaultValues = this.foundResults;
                        }
                        this.fillDefaultValues(defaultValues[0])
                        //this.setStartDate(defaultValues)
                        this.initialized = false
                    }
                }
            } else {
                this.totalItems = 0;
            }
        },
            err => { console.log(err) })
    }

    setStartDate(strFecha) {
        let from = strFecha.split("/")
        let fecha = new Date(from[2], from[1] - 1, from[0])
        fecha.setDate(fecha.getDate() + 1)
        this.data.INICIO_VIGENCIA = fecha
        this.minDate = fecha;
        this.calcularFin(undefined);
    }

    fillDefaultValues(defaultValues: any) {
        this.data.RMA = defaultValues.RMA
        this.data.INICIO_VIGENCIA = defaultValues.INICIO_VIG
        this.data.FIN_VIGENCIA = defaultValues.FIN_VIG
        this.data.COMENTARIO = defaultValues.COMENTARIOS
    }

    calcFinVigencia(fecha: string) {
        this.parameterSettingsService.calcFinVigencia(fecha).subscribe(res => {
            this.data.FIN_VIGENCIA = res
        })
    }

    calcularFin(event: any) {
        try {
            var fecha = new Date(this.data.INICIO_VIGENCIA)
            let strfecha = `${fecha.getDate()}/${fecha.getMonth() + 1 >= 10 ? '' : '0'}${fecha.getMonth() + 1}/${fecha.getFullYear()}`
            this.calcFinVigencia(strfecha)
        } catch (e) { }
    }


    pageChanged(page: number) {
        this.currentPage = page;
        this.rmaList = this.foundResults.slice(((this.currentPage - 1) * this.itemsPerPage), (this.currentPage * this.itemsPerPage));
    }


    mostrarMas() {
        this.currentPage = 1;
        this.rmaList = this.foundResults.slice(((this.currentPage - 1) * this.itemsPerPage), (this.currentPage * this.itemsPerPage));
    }
    resetRMA() {
        if (this.foundResults.length > 0) {
            if (this.data.RMA == '' || this.data.RMA == undefined || this.data.RMA == '0') {
                let item = this.foundResults.find(f => f.ESTADO == 'ACTIVO');
                this.data.RMA = item.RMA;
            }
        }
    }

}
