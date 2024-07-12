import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { HttpClient, HttpHeaders, HttpClientModule } from '@angular/common/http';
import { AppConfig } from '../../../../app.config';
import * as XLSX from 'xlsx';
import { formatDate } from '@angular/common';
import * as FileSaver from 'file-saver';
import { Color, defaultColors } from 'ng2-charts';
const EXCEL_TYPE =
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet application/vnd.ms-excel;charset=UTF-8";
const EXCEL_EXTENSION = ".xlsx";
const PDF_EXTENSION = ".pdf";

import * as autoTable from 'jspdf-autotable';
declare const require: any;
const jsPDF = require('jspdf');
require('jspdf-autotable');

@Injectable({
    providedIn: 'root'
})
export class MonitoreoProviCommisionService {

    private headers = new HttpHeaders({ "Content-Type": "application/json" });
    private Url = AppConfig.URL_API_SCTR;
    constructor(private http: HttpClient) {
    }
    //Obtener Lista de Ramos
    public GetBranchesProviComisionReport(data: any): Observable<any> {
        const _params = { P_TIPO: data }
        return this.http.get(this.Url + '/ReportKuntur/branchProviComisionReport', {
            params: _params
        });
    }
    //Obtener Lista de Productos
    public GetProductProviComisionReport(data: any, IdBranch: any): Observable<any> {
        const _params = { P_TIPO: data, P_NBRANCH: IdBranch }
        return this.http.get(this.Url + '/ReportKuntur/productProviComisionReport', {
            params: _params
        });
    }
    //Obtener Estados
    public GetStatusProviComisionReport(): Observable<any> {
        return this.http.get(this.Url + '/ReportKuntur/statusProviComisionReport', {
            headers: this.headers
        });
    }
    //listar Reportes
    public GetListReports(data: any): Observable<any> {
        const body = JSON.stringify(data);
        return this.http.post(this.Url + '/ReportKuntur/listProviComisionReport', body, {
            headers: this.headers
        });
    }
    //Descarga  de reporte o reportes
    public GetFileProviComisionReport(id: any): Observable<any> {
        const Json = { "id": id };
        const data = JSON.stringify(Json);
        return this.http.post(this.Url + '/ReportKuntur/getFileProviComisionReport', data,
            {
                headers: this.headers
            });
    }

    //Método para descargar los datos de la grilla a un doc Excel
    public ConvertListToExcel(json: any[], excelFileName: string): void {
        const ws = XLSX.utils.json_to_sheet(
            [
                {
                    A: "ESTADO",
                    B: "IDREPORTE",
                    C: "RAMO",
                    D: "USUARIO",
                    E: "FECHA INICIO PRODUCCIÓN",
                    F: "FECHA FIN PRODUCCIÓN",
                    G: "TIPO",
                }
            ],
            {
                header: ["A", "B", "C", "D", "E", "F"],
                skipHeader: true,
            }
        );
        //Creamos un array con los datos de las columnas
        const listados = [];
        for (let i = 0; i < json.length; i++) {
            const object = {
                A: json[i].desEstado,
                B: json[i].id,
                C: json[i].desRamo,
                D: json[i].desUsuario,
                E: json[i].fecInicio,
                F: json[i].fecFin,
                G: json[i].codTipo,
            };
            listados.push(object);
        }
        //Construcción de Header
        XLSX.utils.sheet_add_json(ws, listados, {
            skipHeader: true,
            origin: "A2"
        });
        // LLenamos la hoja de excel con los datos
        const workbook: XLSX.WorkBook = {
            Sheets: { reportesGenerados: ws },
            SheetNames: ["reportesGenerados"]
        };
        //Propiedades de las celdas
        const excelBuffer: any = XLSX.write(workbook, {
            bookType: "xlsx",
            bookSST: false,
            type: "array"
        });
        this.saveAsExcelFile(excelBuffer, excelFileName);
    }
    //Guardamos el archivo excel
    private saveAsExcelFile(buffer: any, fileName: string): void {
        const data: Blob = new Blob([buffer], {
            type: "application/octet-stream"
        });
        FileSaver.saveAs(
            data,
            fileName + "_privision_comisiones_" + ("0" + new Date().getDate()).slice(-2) + ("0" + (new Date().getMonth() + 1)).slice(-2) + new Date().getFullYear() +
            ("0" + new Date().getHours()).slice(-2) + ("0" + new Date().getMinutes()).slice(-2) + ("0" + new Date().getSeconds()).slice(-2) + EXCEL_EXTENSION
        );
    }
    //Método para descargar los datos de la grilla a un doc PDF
    public ConvertListToPrintPDF(json: any[]): void {
        var doc = new jsPDF();
        //Creamos el nombre del reporte
        const nameReport = 'Reportes_privision_comisiones_' + ("0" + new Date().getDate()).slice(-2) + ("0" + (new Date().getMonth() + 1)).slice(-2) + new Date().getFullYear() +
            ("0" + new Date().getHours()).slice(-2) + ("0" + new Date().getMinutes()).slice(-2) + ("0" + new Date().getSeconds()).slice(-2) + PDF_EXTENSION
        //Creamos la cabecera
        const head = [['ESTADO', 'IDREPORTE', 'RAMO', 'USUARIO', 'FECHAINICIO', 'FECHAFIN', 'CODTIPO']];
        //Obtenemos los datos de la grilla
        const list = [];
        for (let i = 0; i < json.length; i++) {
            const object = {
                ESTADO: json[i].desEstado,
                IDREPORTE: json[i].id,
                RAMO: json[i].desRamo,
                USUARIO: json[i].desUsuario,
                FECINICIO: json[i].fecInicio,
                FECFIN: json[i].fecFin,
                CODTIPO: json[i].codTipo,
            };
            list.push(object);
        }
        //Seleccionamos solo los valores que usaremos para las filas
        const rows = [];
        list.forEach(element => {
            const vl = [];
            vl.push(element.ESTADO),
                vl.push(element.IDREPORTE),
                vl.push(element.RAMO),
                vl.push(element.USUARIO),
                vl.push(element.FECINICIO),
                vl.push(element.FECFIN),
                vl.push(element.CODTIPO),
                rows.push(vl);
        })

        //Conteo de registros
        var countReg = 'Registros: ' + list.length
        //Personalización de PDF
        doc.setFontSize(10)
        doc.text(countReg, 4, 4);
        doc.autoTable({
            head: head,
            body: rows,
            theme: 'striped',
            styles: {
                fontSize: 7,
                font: 'helvetica'
            },
        })
        //Guardamos el PDF
        doc.save(nameReport);
    }

    //Procesar Reportes
    public ProcessReports(data: any): Observable<any> {
        const Json = {
            "codUsuario": data.codUsuario, "desUsuario": data.desUsuario, "codTipo": data.codTipo, "codPerfil": data.codPerfil, "codProducto": data.codProducto, "codRamo": data.codRamo, "typeReport": data.typeReport, "desRamo": data.desRamo,
            "fecInicio": data.fecInicio, "fecFin": data.fecFin
        };
        return this.http.post(this.Url + '/ReportKuntur/processMonitoreoProviCommision', Json,
            {
                headers: this.headers
            });
    }
}


