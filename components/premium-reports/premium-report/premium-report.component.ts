import { Component, OnInit, ViewChild, ɵConsole } from '@angular/core';
import { NgbModal, ModalDismissReasons, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { BsDatepickerConfig } from 'ngx-bootstrap/datepicker';
import swal from 'sweetalert2';
import { PremiumReportService } from '../../../services/premiumReports/premium-report.service';

@Component({
    selector: 'app-premium-report',
    templateUrl: './premium-report.component.html',
    styleUrls: ['./premium-report.component.css']
})
export class PremiumReportComponent implements OnInit {

    //Llenamos los combos
    ListBranch: any = [];
    ListProduct: any = [];
    ListState: any = [];
    //Listamos la data que llenaremos para consumir los servicios del Back
    IdBranch: any = '';
    TypeReport: any = '1';
    IdProcesoOr: any = '';
    IdProduct: any = '';
    IdState: any = '';
    IdType: any = '';
    //CheckBox
    isHeader = false;
    isDetail = false;
    HeaderName: any = '';
    DetailName: any = '';
    BranchSelected: any = '';
    SelectedValue: any = '';
    UnselectedItemMessage: any = '';
    StartDateSelected: any = '';
    EndDateSelected: any = '';
    BranchNameSelected: any = '';
    ReportNameCounts: any = '';
    ReportNameAlert: any = '';
    ReportNameGen: any = '';
    //Procesar archivos
    files: File[] = [];
    IdPath: any;
    //Pantalla de carga
    isLoading: boolean = false;
    //Fechas
    bsConfig: Partial<BsDatepickerConfig>;
    bsValueIni: Date = new Date();
    bsValueFin: Date = new Date();
    bsValueFinMax: Date = new Date();
    HeaderOff = false;

    disabledFechaInicio = false;
    disabledFechaFin = false;
    disabledCabecera = false;
    disabledCabeceravfc = false;

    //Formato de la fecha
    constructor(private modalService: NgbModal, private PremiumReportService: PremiumReportService) {
        this.bsConfig = Object.assign(
            {},
            {
                dateInputFormat: "DD/MM/YYYY",
                locale: "es",
                showWeekNumbers: false
            }
        );
    }
    //Funciones que se ejecutarán tras la compilación
    ngOnInit() {
        this.IdType = 'R';
        this.getBranchesPremiumReport(this.IdType);
        this.getStatusPremiumReport();
        this.IdBranch = "0";
        this.IdProduct = "0";
        this.isHeader = false;
        this.isDetail = false;
        this.ListProduct = "-1";
        this.HeaderOff = false;
        this.bsValueIni = new Date(this.bsValueIni.getFullYear(), this.bsValueIni.getMonth(), 1);

    }

    //Checkbox para deshabilitar cabecera cuando se seleccione SOAT
    desactivateHeader(event) {
        
        let branch = this.ListBranch.find(x => x.NBRANCH == this.IdBranch).NBRANCH
        if (branch === 66) {
            this.HeaderOff = true;
            this.isHeader = false;
            this.isDetail = false;
        }
        else {
            this.HeaderOff = false;
            this.isHeader = false;
            this.isDetail = false;
        }
        //CASO SUMA ASEGURADA;
        if(branch == 998){
            this.disabledCabecera = true;
            this.disabledFechaFin = true;
            this.disabledFechaInicio = true;
        }else{
            this.disabledCabecera = false;;
            this.disabledFechaFin = false;
            this.disabledFechaInicio = false;
        }

        //CASO VDP+;
        if(branch == 71){
            this.disabledCabeceravfc = true;
            this.isDetail = true;
        }else{
            this.disabledCabeceravfc = false;
            this.isDetail = false;
        }
    }

    //Método para obtener los ramos
    getBranchesPremiumReport(data: any) {
        this.PremiumReportService.GetBranchesPremiumReport(data).subscribe(
            res => {
                this.ListBranch = res;
            },
            err => {
            }
        );
    }

    //Función para obtener los estados
    getStatusPremiumReport() {
        this.PremiumReportService.GetStatusPremiumReport().subscribe(
            res => {
                this.ListState = res;
            },
            err => {

            }
        );
    }

    //Función para procesar los reportes
    processReports() {

        if (new Date(this.bsValueIni) > new Date(this.bsValueFin) || this.IdBranch === "0" || this.isHeader == false && this.isDetail == false
                || (this.IdBranch == 998 && (this.IdProcesoOr == null || this.IdProcesoOr == ''))) {
            //Parámetro para mostrar en la alerta
            if (this.IdBranch === "0" && this.isHeader == false && this.isDetail == false) {
                this.UnselectedItemMessage = 'Debe seleccionar obligatoriamente el RAMO y el TIPO DESCARGA';
            }
            if (this.IdBranch === "0" && this.isHeader == true && this.isDetail == false || this.IdBranch === "0" && this.isHeader == false && this.isDetail == true || this.IdBranch === "0" && this.isHeader == true && this.isDetail == true) {
                this.UnselectedItemMessage = 'Debe seleccionar obligatoriamente el RAMO';
            }
            if (this.IdBranch != 0 && this.isHeader == false && this.isDetail == false) {
                this.UnselectedItemMessage = 'Debe seleccionar obligatoriamente el TIPO DESCARGA';
            }
            if (this.TypeReport != "1" && this.TypeReport != "2") {
                this.UnselectedItemMessage = 'Debe seleccionar obligatoriamente el TIPO REPORTE';
            }
            if (new Date(this.bsValueIni) > new Date(this.bsValueFin) && this.IdBranch != 0 && this.isHeader == true && this.isDetail == false || new Date(this.bsValueIni) > new Date(this.bsValueFin) && this.IdBranch != 0 && this.isHeader == false && this.isDetail == true) {
                this.UnselectedItemMessage = 'La fecha inicial no puede ser mayor a la fecha final'
            }

            if(this.IdBranch == 998 && (this.IdProcesoOr == null || this.IdProcesoOr == '')){
                this.UnselectedItemMessage = 'Debe introducir el ID_PROCESO_OR'
            }

            swal.fire({
                title: 'Información',
                text: this.UnselectedItemMessage,
                icon: 'info',
                confirmButtonText: 'Continuar',
                allowOutsideClick: false

            }).then((result) => {
                if (result.value) {
                }
            });
            this.isLoading = false;
            err => {
                this.isLoading = false;
            }
        }
        else {
            var description = this.ListBranch.find(x => x.NBRANCH == this.IdBranch).SDESCRIPT

            this.BranchNameSelected = description;

            if (this.isHeader == true && this.isDetail == false) {
                this.ReportNameCounts = 'el reporte de cabecera';
                this.ReportNameAlert = "de reporte";
                this.ReportNameGen = "Se acaba"
            }
            else if (this.isHeader == false && this.isDetail == true) {
                this.ReportNameCounts = 'el reporte de detalle';
                this.ReportNameAlert = "de reporte";
                this.ReportNameGen = "Se acaba"
            }
            else if (this.isHeader == true && this.isDetail == true) {
                this.ReportNameCounts = 'los reportes de cabecera y detalle';
                this.ReportNameAlert = "de reportes";
                this.ReportNameGen = "Se acaban"
            }

            this.StartDateSelected = this.bsValueIni.getDate().toString().padStart(2, '0') + "/" + (this.bsValueIni.getMonth() + 1).toString().padStart(2, '0') + "/" + this.bsValueIni.getFullYear();
            this.EndDateSelected = this.bsValueFin.getDate().toString().padStart(2, '0') + "/" + (this.bsValueFin.getMonth() + 1).toString().padStart(2, '0') + "/" + this.bsValueFin.getFullYear();

            swal.fire({
                title: "Advertencia",
                text: "¿ Está seguro que desea generar " + this.ReportNameCounts + " del ramo " + this.BranchNameSelected + " con el rango de fechas de producción del " + this.StartDateSelected + " al " + this.EndDateSelected + " ?",
                icon: "warning",
                showCancelButton: true,
                confirmButtonText: 'Aceptar',
                allowOutsideClick: false,
                cancelButtonText: 'Cancelar'
            }).then((result) => {
                if (result.value) {
                    this.isLoading = true;
                    //Valores para el Tipo
                    if (this.isHeader == true && this.isDetail == false) {
                        this.SelectedValue = 1;
                    }
                    else if (this.isHeader == false && this.isDetail == true) {
                        this.SelectedValue = 2;
                    }
                    else if (this.isHeader == true && this.isDetail == true) {
                        this.SelectedValue = 3;
                    }
                    let data: any = {};
                    data.codUsuario = JSON.parse(localStorage.getItem("currentUser"))["id"];
                    data.desUsuario = JSON.parse(localStorage.getItem("currentUser"))["username"];
                    data.codPerfil = JSON.parse(localStorage.getItem("currentUser"))["profileId"];
                    data.codProducto = JSON.parse(this.IdProduct) === '' ? 0 : JSON.parse(this.IdProduct);
                    data.codTipo = JSON.stringify(this.SelectedValue) === '' ? 0 : JSON.stringify(this.SelectedValue);
                    data.codRamo = JSON.parse(this.IdBranch) === '' ? 0 : JSON.parse(this.IdBranch);
                    data.typeReport = JSON.parse(this.TypeReport) === '' ? 0 : JSON.parse(this.TypeReport);
                    data.desRamo = this.BranchNameSelected === '' ? 0 : this.BranchNameSelected;
                    data.fecInicio = this.bsValueIni.getDate().toString().padStart(2, '0') + "/" + (this.bsValueIni.getMonth() + 1).toString().padStart(2, '0') + "/" + this.bsValueIni.getFullYear()
                    data.fecFin = this.bsValueFin.getDate().toString().padStart(2, '0') + "/" + (this.bsValueFin.getMonth() + 1).toString().padStart(2, '0') + "/" + this.bsValueFin.getFullYear()
                    data.idProcesoOr = this.IdProcesoOr;

                    this.PremiumReportService.ProcessReports(data).subscribe(

                        //Response del Back
                        res => {
                            let _data = res;
                            if (_data.response == 0) {
                                if (_data.Data != null || _data.Data.length > 0) {
                                    swal.fire({
                                        title: "Generación " + this.ReportNameAlert,
                                        text: "Se acaba de generar " + this.ReportNameCounts + " con el ID: " + _data.Data,
                                        icon: "success",
                                        showCancelButton: false,
                                        confirmButtonText: 'Continuar'
                                    })
                                }
                                else {
                                    swal.fire({
                                        title: 'Información',
                                        text: "No se han encontrado registros",
                                        icon: 'error',
                                        confirmButtonText: 'Continuar',
                                        allowOutsideClick: false
                                    })
                                }
                                this.isLoading = false;
                            }
                            else {
                                swal.fire({
                                    title: 'Información',
                                    text: _data,
                                    icon: 'error',
                                    confirmButtonText: 'Continuar',
                                    allowOutsideClick: false
                                })
                                this.isLoading = false;
                            }
                        },
                        err => {
                            this.isLoading = false;

                        }
                    );
                }
            });
        }
    }
}
