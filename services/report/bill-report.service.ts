import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Observable } from 'rxjs';
import { AppConfig } from "../../../../app.config";
import * as XLSX from 'xlsx';
import * as FileSaver from 'file-saver';
const EXCEL_TYPE =
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet application/vnd.ms-excel;charset=UTF-8";
const EXCEL_EXTENSION = ".xlsx";
@Injectable({
  providedIn: 'root'
})
export class BillReportService {
    private _baseUrl = AppConfig.URL_API_SCTR
    private headers = new HttpHeaders({"Content-Type": "application/json"})


    constructor(private http: HttpClient) { }

    public obtenerEstadosPago(): Observable<any> {
        return this.http.get<any[]>(this._baseUrl + "/ReportKuntur/listPayState")
    }

    public obtenerEstadosFactura(): Observable<any> {
        return this.http.get<any[]>(this._baseUrl + "/ReportKuntur/listBillState")
    }

    public obtenerReporteDeFacturas(data: any): Observable<any> {
        const body = JSON.stringify(data)
        return this.http.post(this._baseUrl + "/ReportKuntur/listBillsReceipts", body, {headers: this.headers})  
    }

    public obtenerReporteDeFacturasExcel(data: any): Observable<any> {
        const body = JSON.stringify(data)
        return this.http.post<string>(this._baseUrl + "/ReportKuntur/billReportTemplate", body, {headers: this.headers})

  }

}
