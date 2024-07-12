import { Injectable } from '@angular/core';
import { HttpHeaders, HttpClient } from '@angular/common/http';
import { AppConfig } from '../../../../app.config';
import { Observable } from 'rxjs/Observable';
import * as XLSX from 'xlsx';
import * as FileSaver from 'file-saver';
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
export class RequestProformaService {
  private headers = new HttpHeaders({ "Content-Type": "application/json" });
  private Url = AppConfig.URL_API_SCTR;
  constructor(private http: HttpClient) {

  }
  //Obtener lo tipos de comprobantes
  public GetBillType(): Observable<any> {
    return this.http.get(this.Url + '/ReportKuntur/billTypeRequestProforma', {
      headers: this.headers
    });
  }
  //Invocar al servicio que obtiene serie
  public GetSerieNumber(): Observable<any> {
    return this.http.get(this.Url + '/ReportKuntur/serieNumberRequestProforma', {
      headers: this.headers
    });
  }

  //Invocar al servicio que obtiene tipos de documento
  public GetDocumentType(): Observable<any> {
    return this.http.get(this.Url + '/ReportKuntur/documentTypeRequestProforma', {
      headers: this.headers
    });
  }

  //Método para descargar los datos de la grilla a un doc Excel
  public ConvertListToExcel(json: any[], excelFileName: string): void {
    const ws = XLSX.utils.json_to_sheet(
      [
        {
          X: "POLIZA",
          A: "TIPOCOMPROBANTE",
          B: "SERIECOMPROBANTE",
          C: "NUMEROCOMPROBANTE",
          D: "PROFORMA",
          E: "TIPOSOLICITUD",
          F: "PRIMANETA",
          G: "IGV",
          H: "DERECHOEMISIÓN",
          I: "PRIMABRUTA",
          J: "FECHAFACTURA",
          K: "FECHAINIRECIBO",
          L: "FECHAFINRECIBO",
          M: "TIPODOC",
          N: "NUMDOC",
          O: "CONTRATANTE",
        }
      ],
      {
        header: ["X","A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O"],
        skipHeader: true,
      }
    );
    //Creamos un array con los datos de las columnas
    const listados = [];
    for (let i = 0; i < json.length; i++) {
      const object = {
        X: json[i].policy,
        A: json[i].billType,
        B: json[i].serieNumber,
        C: json[i].billNumber,
        D: json[i].proforma,
        E: json[i].requestType,
        F: json[i].purePremium,
        G: json[i].igv,
        H: json[i].rightIssue,
        I: json[i].grossPremium,
        J: json[i].billDate,
        K: json[i].startReceipt,
        L: json[i].endReceipt,
        M: json[i].docType,
        N: json[i].docNumber,
        O: json[i].clientName,
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
      Sheets: { reportesProformas: ws },
      SheetNames: ["reportesProformas"]
    };
    //Propiedades de las celdas
    const excelBuffer: any = XLSX.write(workbook, {
      bookType: "xlsx",
      bookSST: false,
      type: "array"
    });
    this.SaveProfAsExcelFile(excelBuffer, excelFileName);
  }

  //Guardamos el archivo excel
  private SaveProfAsExcelFile(buffer: any, fileName: string): void {
    const data: Blob = new Blob([buffer], {
      type: "application/octet-stream"
    });
    FileSaver.saveAs(
      data,
      fileName + "_consultas_proformas_" + ("0" + new Date().getDate()).slice(-2) + ("0" + (new Date().getMonth() + 1)).slice(-2) + new Date().getFullYear() +
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
    const head = [['TIPOCOMPROBANTE', 'SERIE', 'NROCOMPROBANTE', 'PROFORMA', 'TIPOSOLICITUD', 'PRIMANETA', 'IGV', 'DERECHOEMISIÓN', 'PRIMABRUTA', 'FECFACTURA', 'FECINIRECIBO', 'FECFINRECIBO', 'TIPODOC', 'NUMDOC', 'CONTRATANTE']];    //Obtenemos los datos de la grilla
    const list = [];
    for (let i = 0; i < json.length; i++) {
      const object = {
        TIPOCOMPROBANTE: json[i].billType,
        SERIE: json[i].serieNumber,
        NROCOMPROBANTE: json[i].billNumber,
        PROFORMA: json[i].proforma,
        TIPOSOLICITUD: json[i].requestType,
        PRIMANETA: json[i].purePremium,
        IGV: json[i].igv,
        DERECHOEMISIÓN: json[i].rightIssue,
        PRIMABRUTA: json[i].grossPremium,
        FECFACTURA: json[i].billDate,
        FECINIRECIBO: json[i].effecDate,
        FECFINRECIBO: json[i].expirDate,
        TIPODOC: json[i].docType,
        NUMDOC: json[i].docNumber,
        CONTRATANTE: json[i].scliename,
      };
      list.push(object);
    }
    //Seleccionamos solo los valores que usaremos para las filas
    const rows = [];
    list.forEach(element => {
      const vl = [];
      vl.push(element.TIPOCOMPROBANTE),
        vl.push(element.SERIE),
        vl.push(element.NROCOMPROBANTE),
        vl.push(element.PROFORMA),
        vl.push(element.TIPOSOLICITUD),
        vl.push(element.PRIMANETA),
        vl.push(element.IGV),
        vl.push(element.DERECHOEMISIÓN),
        vl.push(element.PRIMABRUTA),
        vl.push(element.FECFACTURA),
        vl.push(element.FECINIRECIBO),
        vl.push(element.FECFINRECIBO),
        vl.push(element.TIPODOC),
        vl.push(element.NUMDOC),
        vl.push(element.CONTRATANTE),
        rows.push(vl);
    })

    //Conteo de registros
    var countReg = 'Registros: ' + list.length 
    //Personalización de PDF
    doc.setFontSize(9)
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

  //Listar Proformas
  public GetListProformas(data: any): Observable<any> {
    const body = JSON.stringify(data);
    return this.http.post(this.Url + '/ReportKuntur/listRequestProforma', body, {
      headers: this.headers
    });
  }

  //Listar Asegurados
  public GetListInsured(data: any): Observable<any> {
    debugger;
    const body = JSON.stringify(data);
    return this.http.post(this.Url + '/ReportKuntur/listDetailRequestInsured', body, {
      headers: this.headers
    });
  }

  //Método para descargar los datos de la grilla a un doc Excel - modal
  public DownloadModalListToExcel(json: any[], excelFileName: string): void {
    const ws = XLSX.utils.json_to_sheet(
      [
        {
          A: "POLIZA",
          B: "PROFORMA",
          C: "TIP_COMPROBANTE",
          D: "NRO_COMPROBANTE",
          E: "SERIE",
          F: "TIP_SOLICITUD",          
          G: "IGV",
          H: "FECHA_FACTURA",
          I: "FEC_INI_RECIBO",
          J: "FEC_FIN_RECIBO",
          K: "CONTRATANTE",
          L: "NRO_CERTIFICADO",          
          M: "INI_VIG_CERTIF",
          N: "FIN_VIG_CERTIF",
          O: "ESTADO_CERTIF",
          P: "TIPO_DOCUMENTO",
          Q: "NRO_DOCUMENTO",
          R: "ASEGURADO",
          S: "PLANILLA",
          T: "PRIMA_NETA",
          U: "DERECHO_EMISION",
          V: "PRIMA_BRUTA",
          W: "TIPO_RIESGO",
          X: "TASA_RIESGO",
          Y: "FEC_ANULACIÓN",
        }
      ],
      {
        header: ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y"],
        skipHeader: true,
      }
    );
    //Creamos un array con los datos de las columnas
    const listados = [];
    for (let i = 0; i < json.length; i++) {
      const object = {
        A: json[i].policy,
        B: json[i].proforma,
        C: json[i].billType,
        D: json[i].billNumber,
        E: json[i].serieNumber,
        F: json[i].requestType,
        G: json[i].igv,
        H: json[i].billDate,
        I: json[i].startReceipt,
        J: json[i].endReceipt,
        K: json[i].clientName,
        L: json[i].certificatNumber,
        M: json[i].startDateValidity,
        N: json[i].endDateValidity,
        O: json[i].statusCertificat,
        P: json[i].documentType,
        Q: json[i].IdDocument,
        R: json[i].insured,
        S: json[i].payroll,
        T: json[i].purePremium,
        U: json[i].rightIssue,
        V: json[i].grossPremium,
        W: json[i].kindRisk,
        X: json[i].rateRisk,
        Y: json[i].nullDate,

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
      Sheets: { reportesAsegurados: ws },
      SheetNames: ["reportesAsegurados"]
    };
    //Propiedades de las celdas
    const excelBuffer: any = XLSX.write(workbook, {
      bookType: "xlsx",
      bookSST: false,
      type: "array"
    });
    this.SaveInsurAsExcelFile(excelBuffer, excelFileName);
  }

  //Guardamos el archivo excel - modal
  private SaveInsurAsExcelFile(buffer: any, fileName: string): void {
    const data: Blob = new Blob([buffer], {
      type: "application/octet-stream"
    });
    FileSaver.saveAs(
      data,
      fileName + "_consultas_asegurados_" + ("0" + new Date().getDate()).slice(-2) + ("0" + (new Date().getMonth() + 1)).slice(-2) + new Date().getFullYear() +
      ("0" + new Date().getHours()).slice(-2) + ("0" + new Date().getMinutes()).slice(-2) + ("0" + new Date().getSeconds()).slice(-2) + EXCEL_EXTENSION
    );
  }

  //Método para descargar los datos de la grilla a un doc PDF - modal
  public DownloadModalListToPDF(json: any[]): void {
    var doc = new jsPDF('landscape');
    //Creamos el nombre del reporte
    const nameReport = 'Reportes_consultas_asegurados_' + ("0" + new Date().getDate()).slice(-2) + ("0" + (new Date().getMonth() + 1)).slice(-2) + new Date().getFullYear() +
      ("0" + new Date().getHours()).slice(-2) + ("0" + new Date().getMinutes()).slice(-2) + ("0" + new Date().getSeconds()).slice(-2) + PDF_EXTENSION
    //Creamos la cabecera
    const head = [['NRO_CERTIFICADO', 'INI_VIG_CERTIFICADO', 'FIN_VIG_CERTIFICADO', 'ESTADO_CERTIFICADO', 'TIPO_DOC', 'NRO_DOC',
      'ASEGURADO', 'PLANILLA', 'PRIMA_NETA', 'DERECHO_EMISION', 'PRIMA_BRUTA', 'TIPO_RIESGO', 'TASA_RIESGO']];
    //Obtenemos los datos de la grilla
    const list = [];
    for (let i = 0; i < json.length; i++) {
      const object = {
        NRO_CERTIFICADO: json[i].certificatNumber,
        INI_VIG_CERTIFICADO: json[i].startDateValidity,
        FIN_VIG_CERTIFICADO: json[i].endDateValidity,
        ESTADO_CERTIFICADO: json[i].statusCertificat,
        TIPO_DOC: json[i].documentType,
        NRO_DOC: json[i].IdDocument,
        ASEGURADO: json[i].insured,
        PLANILLA: json[i].payroll,
        PRIMA_NETA: json[i].purePremium,
        DERECHO_EMISION: json[i].rightIssue,
        PRIMA_BRUTA: json[i].grossPremium,
        TIPO_RIESGO: json[i].kindRisk,
        TASA_RIESGO: json[i].rateRisk,
      };
      list.push(object);
    }
    //Seleccionamos solo los valores que usaremos para las filas
    const rows = [];
    list.forEach(element => {
      const vl = [];
      vl.push(element.NRO_CERTIFICADO),
        vl.push(element.INI_VIG_CERTIFICADO),
        vl.push(element.FIN_VIG_CERTIFICADO),
        vl.push(element.ESTADO_CERTIFICADO),
        vl.push(element.TIPO_DOC),
        vl.push(element.NRO_DOC),
        vl.push(element.ASEGURADO),
        vl.push(element.PLANILLA),
        vl.push(element.PRIMA_NETA),
        vl.push(element.DERECHO_EMISION),
        vl.push(element.PRIMA_BRUTA),
        vl.push(element.TIPO_RIESGO),
        vl.push(element.TASA_RIESGO),
        rows.push(vl);
    })

    //Conteo de registros
    var countReg = 'Registros: ' + list.length
    //Personalización de PDF
    doc.setFontSize(7)
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
