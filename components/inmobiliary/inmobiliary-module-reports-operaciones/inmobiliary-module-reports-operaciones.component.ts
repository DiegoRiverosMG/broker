
/*************************************************************************************************/
/*  NOMBRE              :   INMOBILIARY-MODULE-REPORTS-OPERACIONES.COMPONENT.TS                  */
/*  DESCRIPCIÓN         :   BROKER COMPONENTS                                                    */
/*  AUTOR               :   MATERIA GRIS - MARCOS MATEO QUIROZ                                   */
/*  FECHA               :   01-09-2022                                                           */
/*  VERSIÓN             :   1.0 - MEJORAS CONTABLES AUTOMÁTICAS                                  */
/*************************************************************************************************/

import { Component, OnInit } from '@angular/core';
import { forkJoin } from "rxjs";
import { InmobiliaryModuleReportsService } from '../../../../backoffice/services/inmobiliary-module-reports/inmobiliary-module-reports.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { GlobalValidators } from '../../global-validators';
import { BsDatepickerConfig } from 'ngx-bootstrap/datepicker';
import moment from 'moment';
import Swal from 'sweetalert2';
import * as FileSaver from 'file-saver';

export interface FiltroRamos {
    FLAG?: number;
}

export interface FiltroInterfaz {
    mvt_nnumori?: number;
}

@Component({
  selector: 'app-inmobiliary-module-reports-operaciones',
  templateUrl: './inmobiliary-module-reports-operaciones.component.html',
  styleUrls: ['./inmobiliary-module-reports-operaciones.component.css']
})
export class InmobiliaryModuleReportsOperacionesComponent implements OnInit {
    bsConfig: Partial<BsDatepickerConfig>;
    filtroRamos: FiltroRamos;
    filtroInterfaz: FiltroInterfaz;
    filterForm: FormGroup;
    submitted: boolean = false;
    productBool: boolean = false;

    diaActual = moment(new Date()).toDate();
    origen: any = [];
    interfaces: any = [];
    ramos: any = [];

    flagOperativo: boolean = true;
    flagContable: boolean = true;
    flagControlBancario: boolean = false;
    flagCheques: boolean = false;
    flagTransferencias: boolean = false;
    flagCuentasCobrar: boolean = false;
    products: any = [];

    constructor(
        private formBuilder: FormBuilder,
        private moduleReportsService: InmobiliaryModuleReportsService
    ) {
        this.bsConfig = Object.assign(
            {},
            {
                dateInputFormat: "DD/MM/YYYY",
                locale: "es",
                showWeekNumbers: false
            }
        );
    }

    ngOnInit(): void {
        this.diaActual = new Date(this.diaActual.getFullYear(), this.diaActual.getMonth(), this.diaActual.getDate());
        this.createForm();
        this.inicializarFiltros();
        this.getParams();
        this.getProducts();
    }
    private createForm(): void {
        this.filterForm = this.formBuilder.group({
            P_NNUMORI: [1, Validators.required],
            P_NCODGRU: ['', Validators.required],
            P_NBRANCH: ['', Validators.required],
            P_NPRODUCT: [''],
            P_FECHAINI: [this.diaActual, [Validators.required, GlobalValidators.notValidDate, GlobalValidators.tooOldDateValidator]],
            P_FECHAFIN: [this.diaActual, [Validators.required, GlobalValidators.notValidDate, GlobalValidators.tooOldDateValidator]],
            CHK_OPERATIVO: [false],
            CHK_CONTABLE: [false],
            CHK_CONTROL_BANCARIO: [false],
            CHK_CHEQUES: [false],
            CHK_TRANSFERENCIAS: [false],
            CHK_CUENTAS_COBRAR: [false]
        });
    }

    inicializarFiltros = () => {
        this.filtroRamos = {};
        this.filtroRamos.FLAG = 0;
        this.filtroInterfaz = {};
        this.filtroInterfaz.mvt_nnumori = 1;
        this.listarInterfaces(this.filtroInterfaz);
        this.filterForm.setValidators([GlobalValidators.dateSortR]);
    }

    getProducts = () => {
        this.moduleReportsService.listarProductosVILP().subscribe(
            res => {
                this.products = res.Result.LISTA;
            }
        )
    }

    listarInterfaces = (item) => {
        this.moduleReportsService.listarInterfaces(item).subscribe(            
            res => {
                this.interfaces = res.Result.lista;
            },
            err => {
                Swal.fire('Información', 'Ha ocurrido un error al obtener las interfaces.', 'error');
            }
        )
    }

    getParams = () => {
        let $origen = this.moduleReportsService.listarOrigen();
        let $ramos = this.moduleReportsService.listarRamos(this.filtroRamos);
        return forkJoin([$origen, $ramos]).subscribe(
            res => {
                this.origen = res[0].Result.combos;
                this.ramos = res[1].Result.combos;
            },
            err => {
                Swal.fire('Información', 'Ha ocurrido un error al obtener los parámetros.', 'error');
            }
        )
    }

    selectOrigen = (e) => {
        this.filtroInterfaz.mvt_nnumori = Number(e);
        this.listarInterfaces(this.filtroInterfaz);
        this.filterForm.controls.P_NCODGRU.setValue("");
        this.filterForm.controls.P_NBRANCH.setValue("");
        this.filterForm.controls.P_NPRODUCT.setValue("");
        this.filterForm.controls.CHK_CONTROL_BANCARIO.setValue(false);
        this.filterForm.controls.CHK_CHEQUES.setValue(false);
        this.filterForm.controls.CHK_TRANSFERENCIAS.setValue(false);
        this.flagOperativo = true;
        this.flagContable = true;
        this.flagCuentasCobrar = false;
        this.flagControlBancario = false;
        this.flagCheques = false;
        this.flagTransferencias = false;
        this.productBool = false;  
    }

    selectInterfaz = (e) => {
        switch (Number(this.filterForm.get('P_NNUMORI').value)) {
            case 1:  
                this.flagOperativo = true;
                this.flagContable = true;
                this.flagCuentasCobrar = false;
                this.flagControlBancario = false;
                this.flagCheques = false;
                this.flagTransferencias = false;
                break;            
            default:
                this.flagOperativo = true;
                this.flagContable = true;
                this.flagCuentasCobrar = false;
                this.flagControlBancario = false;
                this.flagCheques = false;
                this.flagTransferencias = false;
                break; 
        }
    }

    selectRamo = (e) => {
        switch (Number(this.filterForm.get('P_NNUMORI').value)) {
            case 1:
                if (Number(this.filterForm.get('P_NCODGRU').value) == 12 || Number(this.filterForm.get('P_NCODGRU').value) == 13 ||
                    Number(this.filterForm.get('P_NCODGRU').value) == 14 || Number(this.filterForm.get('P_NCODGRU').value) == 17 || this.filterForm.get('P_NCODGRU').value == "") {
                    if (Number(e) == 71) {
                        this.productBool = true;
                        this.filterForm.controls.P_NPRODUCT.setValidators(Validators.required);
                        this.filterForm.controls.P_NPRODUCT.updateValueAndValidity();
                    } else {
                        this.productBool = false;
                        this.filterForm.controls.P_NPRODUCT.setValue('');
                        this.filterForm.controls.P_NPRODUCT.clearValidators();
                        this.filterForm.controls.P_NPRODUCT.updateValueAndValidity();
                    }
                }
            break;
            default:
            break;
        }
    }
    
    descargarReporte = () => {
        if (this.filterForm.get('CHK_OPERATIVO').value == true) {
            this.descargarReporteOperativo();
        }
        if (this.filterForm.get('CHK_CONTABLE').value == true) {
            this.descargarReporteContable();
        }
        if (this.filterForm.get('CHK_CONTROL_BANCARIO').value == true) {
            this.descargarReporteControlBancario();
        }
        if (this.filterForm.get('CHK_CHEQUES').value == true) {
            this.descargarReporteCheques();
        }
        if (this.filterForm.get('CHK_TRANSFERENCIAS').value == true) {
            this.descargarReporteTransferencias();
        }
        if (this.filterForm.get('CHK_CUENTAS_COBRAR').value == true) {
            this.descargarReporteCuentasCobrar();
        }
        if (
            this.filterForm.get('CHK_CONTABLE').value == false && this.filterForm.get('CHK_OPERATIVO').value == false &&
            this.filterForm.get('CHK_CONTROL_BANCARIO').value == false && this.filterForm.get('CHK_CHEQUES').value == false &&
            this.filterForm.get('CHK_TRANSFERENCIAS').value == false && this.filterForm.get('CHK_CUENTAS_COBRAR').value == false
        ) {
            Swal.fire('Información', 'Seleccione al menos un tipo de reporte.', 'warning');
        }
    }

    descargarReporteOperativo = () => {
        this.submitted = true;
        if (this.filterForm.valid) {
            this.moduleReportsService.reporteOperativoXLSX(this.filterForm.getRawValue()).subscribe(
                res => {
                    let _data = res;
                    if (_data.response == 0) {
                        if (_data.Data != null) {
                            const file = new File([this.obtenerBlobFromBase64(_data.Data, '')], 'Reporte_Operativo' + '.xlsx', { type: 'text/xls' });
                            FileSaver.saveAs(file);
                        }
                    }
                    else {
                        Swal.fire({
                            title: 'Información',
                            text: _data.Data,
                            icon: 'info',
                            confirmButtonText: 'Continuar',
                            allowOutsideClick: false
                        })
                    }
                }
            )
        }
    }

    descargarReporteContable = () => {
        this.submitted = true;
        if (this.filterForm.valid) {
            this.moduleReportsService.reporteContableXLSX(this.filterForm.getRawValue()).subscribe(
                res => {
                    let _data = res;
                    if (_data.response == 0) {
                        if (_data.Data != null) {
                            const file = new File([this.obtenerBlobFromBase64(_data.Data, '')], 'Reporte_Contable' + '.xlsx', { type: 'text/xls' });
                            FileSaver.saveAs(file);
                        }
                    }
                    else {
                        Swal.fire({
                            title: 'Información',
                            text: _data.Data,
                            icon: 'info',
                            confirmButtonText: 'Continuar',
                            allowOutsideClick: false
                        })
                    }
                }
            )
        }
    }

    descargarReporteControlBancario = () => {
        this.submitted = true;
        if (this.filterForm.valid) {
            this.moduleReportsService.reporteControlBancarioXLSX(this.filterForm.getRawValue()).subscribe(
                res => {
                    let _data = res;
                    if (_data.response == 0) {
                        if (_data.Data != null) {                            
                            const file = new File([this.obtenerBlobFromBase64(_data.Data, '')], 'Reporte_Control_Bancario' + '.xlsx', { type: 'text/xls' });
                            FileSaver.saveAs(file);
                        }
                    }
                    else {
                        Swal.fire({
                            title: 'Información',
                            text: _data.Data,
                            icon: 'info',
                            confirmButtonText: 'Continuar',
                            allowOutsideClick: false
                        })
                    }
                }
            )
        }
    }

    descargarReporteCheques = () => {
        this.submitted = true;
        if (this.filterForm.valid) {
            this.moduleReportsService.reporteCheques(this.filterForm.getRawValue()).subscribe(
                res => {
                    let _data = res;
                    if (_data.response == 0) {
                        if (_data.Data != null) {                            
                            const file = new File([this.obtenerBlobFromBase64(_data.Data, '')], 'Reporte_Cheques' + '.xlsx', { type: 'text/xls' });
                            FileSaver.saveAs(file);
                        }
                    }
                    else {
                        Swal.fire({
                            title: 'Información',
                            text: _data.Data,
                            icon: 'info',
                            confirmButtonText: 'Continuar',
                            allowOutsideClick: false
                        })
                    }
                }
            )
        }
    }

    descargarReporteTransferencias = () => {
        this.submitted = true;
        if (this.filterForm.valid) {
            this.moduleReportsService.reporteTransferencias(this.filterForm.getRawValue()).subscribe(
                res => {
                    let _data = res;
                    if (_data.response == 0) {
                        if (_data.Data != null) {
                            const file = new File([this.obtenerBlobFromBase64(_data.Data, '')], 'Reporte_Transferencias' + '.xlsx', { type: 'text/xls' });
                            FileSaver.saveAs(file);
                        }
                    }
                    else {
                        Swal.fire({
                            title: 'Información',
                            text: _data.Data,
                            icon: 'info',
                            confirmButtonText: 'Continuar',
                            allowOutsideClick: false
                        })
                    }
                }
            )
        }
    }

    descargarReporteCuentasCobrar = () => {
        this.submitted = true;
        // INI MMQ 23-01-2024 RENTAS
        if (this.filterForm.valid) {
            this.moduleReportsService.reporteCuentasPorCobrar(this.filterForm.getRawValue()).subscribe(
                res => {
                    let _data = res;
                    if (_data.response == 0) {
                        if (_data.Data != null) {
                            const file = new File([this.obtenerBlobFromBase64(_data.Data, '')], 'Reporte_CtasXCobrar' + '.xlsx', { type: 'text/xls' });
                            FileSaver.saveAs(file);
                        }
                    }
                    else {
                        Swal.fire({
                            title: 'Información',
                            text: _data.Data,
                            icon: 'info',
                            confirmButtonText: 'Continuar',
                            allowOutsideClick: false
                        })
                    }
                }
            )
        }
        // FIN MMQ 23-01-2024 RENTAS
    }

    obtenerBlobFromBase64 = (b64Data: string, contentType: string) => {
        const byteCharacters = atob(b64Data);
        const byteArrays = [];
        for (let offset = 0; offset < byteCharacters.length; offset += 512) {
            const slice = byteCharacters.slice(offset, offset + 512);
            const byteNumbers = new Array(slice.length);
            for (let i = 0; i < slice.length; i++) {
                byteNumbers[i] = slice.charCodeAt(i);
            }
            const byteArray = new Uint8Array(byteNumbers);
            byteArrays.push(byteArray);
        }
        const blob = new Blob(byteArrays, { type: contentType });
        return blob;
    }
}