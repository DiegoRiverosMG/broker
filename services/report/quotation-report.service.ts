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
export class QuotationReportService {

  private _baseUrl = AppConfig.URL_API_SCTR
    private headers = new HttpHeaders({"Content-Type": "application/json"})


    constructor(private http: HttpClient) { }

    public obtenerEstadosPago(): Observable<any> {
        return this.http.get<any[]>(this._baseUrl + "/ReportKuntur/listPayState")
    }

    public obtenerEstados(): Observable<any> {
        return this.http.get<any[]>(this._baseUrl + "/ReportKuntur/listBillState")
    }

    public obtenerReporteDeCotizaciones(data: any): Observable<any> {
        const body = JSON.stringify(data)
        return this.http.post(this._baseUrl + "/ReportKuntur/listQuotationReport", body, {headers: this.headers})  
    }

    public obtenerReporteDeCotizacionesExcel(data: any): Observable<any> {
        const body = JSON.stringify(data)
        return this.http.post<string>(this._baseUrl + "/ReportKuntur/quotationReportTemplate", body, {headers: this.headers})

    }

    public GetChannelTypeAllList(): Observable<any> {
      return this.http.get<any[]>(this._baseUrl + "/ReportKuntur/GetChannelTypeAllList")
    }

    public obtenerDocumentType(): Observable<any> {
      return this.http.get<any[]>(this._baseUrl + "/ReportKuntur/documentTypeQuotationReport")
    }

    public getStatusList(certype: string, codProduct: string): Observable<any> {
      const _params = { certype: certype, codProduct: codProduct }
      return this.http.get<any[]>(this._baseUrl + '/QuotationManager/GetStatusListRQ', { params: _params });
    }
}
