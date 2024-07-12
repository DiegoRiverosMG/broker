import { Injectable } from '@angular/core';
import { HttpHeaders, HttpClient } from '@angular/common/http';
import { AppConfig } from '../../../../app.config';
import * as FileSaver from 'file-saver';
import * as XLSX from 'xlsx';
const EXCEL_TYPE =
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet application/vnd.ms-excel;charset=UTF-8";
const EXCEL_EXTENSION = ".xlsx";
const PDF_EXTENSION = ".pdf";
import * as autoTable from 'jspdf-autotable';
import { Observable } from 'rxjs';
declare const require: any;
const jsPDF = require('jspdf');
require('jspdf-autotable');

@Injectable({
  providedIn: 'root'
})
export class CurrentlyInsuredService {
  private headers = new HttpHeaders({"Content-Type": "application/json"})
  private Url = AppConfig.URL_API_SCTR;
  constructor(private http: HttpClient) {

   }

   //Consulta Asegurados Vigentes
  public GetCurrentlyInsured(data: any): Observable<any> {
    const body = JSON.stringify(data); 
    return this.http.post(this.Url + '/ReportKuntur/currentlyInsured', body, {
      headers: this.headers
    });
  }
  
  //Método para descargar los datos de la grilla a un doc Excel
  public ConvertListToExcel(json: any[], excelFileName: string): void {
    const ws = XLSX.utils.json_to_sheet(
      [
        {        
          A: "PRODUCTO",
          B: "RAMOLED",
          C: "TIPOMONEDA",
          D: "COMISIONTOTAL",
          E: "FECHAEFECTO",
          F: "TIPOCOMISION",
          G: "INTERMEDIARIO",
          H: "POLIZA",
          I: "TIPOINTERMEDIARIO",
          J: "NUEVACOMISION",
          K: "TIPOCOMPROBANTE",
          L: "SERIECOMPROBANTE",
          M: "NROCOMPROBANTE",
        }
      ],
      {
        header: ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M"],
        skipHeader: true,
      }
    );
    //Creamos un array con los datos de las columnas
    const listados = [];
    for (let i = 0; i < json.length; i++) {
      const object = {     

        A: json[i].product,
        B: json[i].branch_led,
        C: json[i].currency,
        D: json[i].total_com,
        E: json[i].deffecdate,
        F: json[i].styp_comm,
        G: json[i].intermed,
        H: json[i].policy,
        I: json[i].intertyp,
        J: json[i].commnew,
        K: json[i].billtype,
        L: json[i].insur_area,
        M: json[i].billnum,

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
      Sheets: { reportesCruce: ws },
      SheetNames: ["reportesCruce"]
    };
    //Propiedades de las celdas
    const excelBuffer: any = XLSX.write(workbook, {
      bookType: "xlsx",
      bookSST: false,
      type: "array"
    });
    this.SaveAsExcelFile(excelBuffer, excelFileName);
  }

  //Guardamos el archivo excel
  private SaveAsExcelFile(buffer: any, fileName: string): void {
    const data: Blob = new Blob([buffer], {
      type: "application/octet-stream"
    });
    FileSaver.saveAs(
      data,
      fileName + "_cruces_interfaces_" + ("0" + new Date().getDate()).slice(-2) + ("0" + (new Date().getMonth() + 1)).slice(-2) + new Date().getFullYear() +
      ("0" + new Date().getHours()).slice(-2) + ("0" + new Date().getMinutes()).slice(-2) + ("0" + new Date().getSeconds()).slice(-2) + EXCEL_EXTENSION
    );
  }

  //Método para descargar los datos de la grilla a un doc PDF
  public ConvertListToPrintPDF(json: any[]): void {
    var doc = new jsPDF('landscape');
    //Creamos el nombre del reporte
    const nameReport = 'Reportes_consultas_proformas_' + ("0" + new Date().getDate()).slice(-2) + ("0" + (new Date().getMonth() + 1)).slice(-2) + new Date().getFullYear() +
      ("0" + new Date().getHours()).slice(-2) + ("0" + new Date().getMinutes()).slice(-2) + ("0" + new Date().getSeconds()).slice(-2) + PDF_EXTENSION
    //Creamos la cabecera
    const head = [['PRODUCTO', 'RAMOLED', 'TIPOMONEDA', 'COMISIONTOTAL', 'FEC_EFECTO', 'TIPOCOMISION', 'INTERMED', 'POLIZA', 'TIPOINTERMED', 'NUEVACOMISION', 'TIPOCOMPROBANTE', 'SERIE', 'NROCOMPROBANTE']];
    //Obtenemos los datos de la grilla
    const list = [];
    for (let i = 0; i < json.length; i++) {
      const object = {   

        PRODUCTO: json[i].product,
        RAMOLED: json[i].branch_led,
        TIPOMONEDA: json[i].currency,
        COMISIONTOTAL: json[i].total_com,
        FEC_EFECTO: json[i].deffecdate,
        TIPOCOMISION: json[i].styp_comm,
        INTERMED: json[i].intermed,
        POLIZA: json[i].policy,
        TIPOINTERMED: json[i].intertyp,
        NUEVACOMISION: json[i].commnew,
        TIPOCOMPROBANTE: json[i].billtype,
        SERIE: json[i].insur_area,
        NROCOMPROBANTE: json[i].billnum,

      };
      list.push(object);
    }
    //Seleccionamos solo los valores que usaremos para las filas
    const rows = [];
    list.forEach(element => {
      const vl = [];

        vl.push(element.PRODUCTO),
        vl.push(element.RAMOLED),
        vl.push(element.TIPOMONEDA),
        vl.push(element.COMISIONTOTAL),
        vl.push(element.FEC_EFECTO),
        vl.push(element.TIPOCOMISION),
        vl.push(element.INTERMED),
        vl.push(element.POLIZA),
        vl.push(element.TIPOINTERMED),
        vl.push(element.NUEVACOMISION),
        vl.push(element.TIPOCOMPROBANTE),
        vl.push(element.SERIE),
        vl.push(element.NROCOMPROBANTE),
        rows.push(vl);
    })

    //Conteo de registros
    var countReg = 'Registros: ' + list.length
    //Personalización de PDF
    doc.setFontSize(8)
    doc.text(countReg, 4, 4);
    doc.autoTable({
      head: head,
      body: rows,
      theme: 'striped',
      styles: {
        fontSize: 6,
        font: 'helvetica'
      },
    })
    //Guardamos el PDF
    doc.save(nameReport);
  }

}
