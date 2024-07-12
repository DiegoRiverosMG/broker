import { Injectable } from '@angular/core';
import { HttpHeaders, HttpClient } from '@angular/common/http';
import { AppConfig } from '../../../../app.config';
import { Observable } from 'rxjs';
import * as FileSaver from 'file-saver';
import * as XLSX from 'xlsx';
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
export class InterfaceCrossingService {
  private headers = new HttpHeaders({ "Content-Type": "application/json" });
  private Url = AppConfig.URL_API_SCTR;
  constructor(private http: HttpClient) {

  }
  //Cruce de Interfaces
  public GetInterfacesCrossing(data: any): Observable<any> {
    const body = JSON.stringify(data);
    return this.http.post(this.Url + '/ReportKuntur/interfacesCrossing', body, {
      headers: this.headers
    });
  }
  //Convertir lista de comisiones a Excel
  public ConvertListCommissionsToExcel(json: any[], excelFileName: string): void {
    debugger;
    const wsComm = XLSX.utils.json_to_sheet(
      [
        {
          A: "PRELIMINAR",
          B: "RECIBO",
          C: "RAMO",
          D: "TIP_COMISION",
          E: "PRODUCTO",
          F: "RAMO_CONTABLE",
          G: "TIPOMONEDA",
          H: "COMISIONTOTAL",
          I: "FECHA_REGISTRO",    
          J: "INTERMEDIARIO",
          K: "POLIZA",
          L: "TIPOINTERMEDIARIO",
          M: "NUEVACOMISION",
          N: "TIPOCOMPROBANTE",
          O: "SERIECOMPROBANTE",
          P: "NROCOMPROBANTE",
        }
      ],
      {
        header: ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P"],
        skipHeader: true,
      }
    );
    //Creamos un array con los datos de las columnas
    const listComissions = [];
    for (let i = 0; i < json.length; i++) {
      const object = {
        A: json[i].preliminary,
        B: json[i].receipt,
        C: json[i].branch,
        D: json[i].styp_comm,
        E: json[i].product,
        F: json[i].branch_led,
        G: json[i].currency,
        H: json[i].total_com,
        I: json[i].deffecdate,
        J: json[i].intermed,
        K: json[i].policy,
        L: json[i].intertyp,
        M: json[i].commnew,
        N: json[i].billtype,
        O: json[i].insur_area,
        P: json[i].billnum,
      };
      listComissions.push(object);
    }
    //Construcción de Header
    XLSX.utils.sheet_add_json(wsComm, listComissions, {
      skipHeader: true,
      origin: "A2"
    });
    // LLenamos la hoja de excel con los datos
    const workbook: XLSX.WorkBook = {
      Sheets: { reportesComisiones: wsComm },
      SheetNames: ["reportesComisiones"]
    };
    //Propiedades de las celdas
    const excelBuffer: any = XLSX.write(workbook, {
      bookType: "xlsx",
      bookSST: false,
      type: "array"
    });
    this.SaveAsExcelFile(excelBuffer, excelFileName);
  }
  //Convertir lista de asesorias a Excel
  public ConvertListAdversoryToExcel(json: any[], excelFileName: string): void {
    const wsAdv = XLSX.utils.json_to_sheet(
      [
        {
          A: "PRELIMINAR",
          B: "RAMO",
          C: "PRODUCTO",
          D: "POLIZA",
          E: "RAMO_CONTABLE",
          F: "TIPOMONEDA",
          G: "COMISIONTOTAL",
          H: "FECHAEFECTO",
          I: "NTYPE",
          J: "TIPOCOMISION",
          K: "INTERMEDIARIO",
          L: "TIP_INTERMEDIARIO",
          M: "NBANK_CODE",
          N: "TIP_COMPROBANTE",
          O: "SERIE_COMPROBANTE",
          P: "NRO_COMPROBANTE",
          Q: "NOPERACION_BANCO",
          R: "TIPO",
        }
      ],
      {
        header: ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R"],
        skipHeader: true,
      }
    );
    //Creamos un array con los datos de las columnas
    const listsAdvisory = [];
    for (let i = 0; i < json.length; i++) {
      const object = {
        A: json[i].preliminary,
        B: json[i].branch,
        C: json[i].product,
        D: json[i].policy,
        E: json[i].branchLed,
        F: json[i].currency,
        G: json[i].totalComm,
        H: json[i].deffecDate,
        I: json[i].ntype,
        J: json[i].commType,
        K: json[i].intermed,
        L: json[i].intertyp,
        M: json[i].bankCode,
        N: json[i].billType,
        O: json[i].insurArea,
        P: json[i].billNum,
        Q: json[i].operBank,
        R: json[i].type,
      };
      listsAdvisory.push(object);
    }
    //Construcción de Header
    XLSX.utils.sheet_add_json(wsAdv, listsAdvisory, {
      skipHeader: true,
      origin: "A2"
    });
    // LLenamos la hoja de excel con los datos
    const workbook: XLSX.WorkBook = {
      Sheets: { reportesAsesorias: wsAdv },
      SheetNames: ["reportesAsesorias"]
    };
    //Propiedades de las celdas
    const excelBuffer: any = XLSX.write(workbook, {
      bookType: "xlsx",
      bookSST: false,
      type: "array"
    });
    this.SaveAsExcelFile(excelBuffer, excelFileName);
  }
  //Convertir lista de cobranzas a Excel
  public ConvertListCollectionsToExcel(json: any[], excelFileName: string): void {
    const wsColl = XLSX.utils.json_to_sheet(
      [
        {
          A: "PRELIMINAR",
          B: "CODIGO_AUXILIAR",
          C: "NUMERO_TRANSACCION",
          D: "TIPO_MOVIMIENTO",
          E: "RECIBO",
          F: "NRO_COMPROBANTE",
          G: "RAMO",
          H: "TIPO_REGISTROS",
          I: "PRODUCTO",
          J: "POLIZA",
          K: "TIP_MOVIMIENTO",
          L: "SERIE_COMPROBANTE",
          M: "VOUCHER",
          N: "CODIGO_TIPO_PAGO",
          O: "CODIGO_BANCO",
          P: "FECHA_CONTABILIZACION",
          Q: "CLIENTE",
          R: "MONEDA",
          S: "RAMO_CONTABLE",
          T: "NOPERACION_BANCO",
          U: "TIPOCOMPROBANTE",
          V: "NUMERO_FACTURA_GENERADA",
          W: "PRIMA_NETA",
          X: "DERECHOEMISION",
          Y: "TAX",
          Z: "MONTOTOTAL",
          AA: "NUEVACOM",
          AB: "NROCOMPROBANTE",
        }
      ],
      {
        header: ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z", "AA", "AB"],
        skipHeader: true,
      }
    );
    //Creamos un array con los datos de las columnas
    const lisCollections = [];
    for (let i = 0; i < json.length; i++) {
      const object = {
        A: json[i].preliminary,
        B: json[i].auxiliarAccount,
        C: json[i].transaction,
        D: json[i].type,
        E: json[i].receipt,
        F: json[i].billNum,
        G: json[i].branch,
        H: json[i].scertype,
        I: json[i].product,
        J: json[i].policy,
        K: json[i].stype,
        L: json[i].serie,
        M: json[i].cardNumber,
        N: json[i].cardType,
        O: json[i].codeBank,
        P: json[i].fecCont,
        Q: json[i].sclient,
        R: json[i].currency,
        S: json[i].branchLed,
        T: json[i].operBank,
        U: json[i].billType,
        V: json[i].newBill,
        W: json[i].premium,
        X: json[i].de,
        Y: json[i].tax,
        Z: json[i].totalAmmount,
        AA: json[i].newComm,
        AB: json[i].billNumber,
      };
      lisCollections.push(object);
    }
    //Construcción de Header
    XLSX.utils.sheet_add_json(wsColl, lisCollections, {
      skipHeader: true,
      origin: "A2"
    });
    // LLenamos la hoja de excel con los datos
    const workbook: XLSX.WorkBook = {
      Sheets: { reportesCobranzas: wsColl },
      SheetNames: ["reportesCobranzas"]
    };
    //Propiedades de las celdas
    const excelBuffer: any = XLSX.write(workbook, {
      bookType: "xlsx",
      bookSST: false,
      type: "array"
    });
    this.SaveAsExcelFile(excelBuffer, excelFileName);
  }
  //Convertir lista de primas a Excel
  public ConvertListPremiumsToExcel(json: any[], excelFileName: string): void {
    const wsPrem = XLSX.utils.json_to_sheet(
      [
        {
          A: "PRELIMINAR",
          B: "RECIBO",
          C: "RAMO",
          D: "TIPO_REGISTROS",
          E: "PRODUCTO",
          F: "POLIZA",
          G: "TIPO_MOVIMIENTO",
          H: "SERIE_COMPROBANTE",
          I: "VOUCHER",
          J: "CODIGO_TIPO_PAGO",
          K: "CODIGO_BANCO",
          L: "FECHA_CONTABILIZACION",
          M: "CLIENTE",
          N: "MONEDA",
          O: "RAMO_CONTABLE",
          P: "NOPERACION_BANCO",
          Q: "TIPOCOMPROBANTE",
          R: "NUEVOCOMPROBANTE",
          S: "PRIMA_NETA",
          T: "DERECHOEMISION",
          U: "MONTO_FACTURA",
          V: "MONTOTOTAL",
          W: "NUEVAPRIM",
          X: "NROCOMPROBANTE",
        }
      ],
      {
        header: ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X"],
        skipHeader: true,
      }
    );
    //Creamos un array con los datos de las columnas
    const listPremiums = [];
    for (let i = 0; i < json.length; i++) {
      const object = {
        A: json[i].preliminary,
        B: json[i].receipt,
        C: json[i].branch,
        D: json[i].scertype,
        E: json[i].product,
        F: json[i].policy,
        G: json[i].type,
        H: json[i].serie,
        I: json[i].cardNumber,
        J: json[i].cardType,
        K: json[i].codeBank,
        L: json[i].fecCont,
        M: json[i].sclient,
        N: json[i].currency,
        O: json[i].branchLed,
        P: json[i].operBank,
        Q: json[i].billType,
        R: json[i].newBill,
        S: json[i].premium,
        T: json[i].commAmmount,
        U: json[i].billAmmount,
        V: json[i].totalAmmount,
        W: json[i].newPremium,
        X: json[i].billNumber,
      };
      listPremiums.push(object);
    }
    //Construcción de Header
    XLSX.utils.sheet_add_json(wsPrem, listPremiums, {
      skipHeader: true,
      origin: "A2"
    });
    // LLenamos la hoja de excel con los datos
    const workbook: XLSX.WorkBook = {
      Sheets: { reportesPrimas: wsPrem },
      SheetNames: ["reportesPrimas"]
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
}
