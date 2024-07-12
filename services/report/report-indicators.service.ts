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
export class ReportIndicatorsService {

  private _baseUrl = AppConfig.URL_API_SCTR
  private headers = new HttpHeaders({"Content-Type": "application/json"})

  constructor(private http: HttpClient) { }

  public getUsersList(productId: string = '', branch: string = ''): Observable<any[]> {
    const params = { productId: productId, branch: branch };
    return this.http.get<any[]>(this._baseUrl + '/ReportKuntur/getUsersList', { params: params });
  }

  public obtenerReporteDeTramites(data: any): Observable<any> {
    const body = JSON.stringify(data)
    return this.http.post(this._baseUrl + "/ReportKuntur/listProcedureReport", body, {headers: this.headers})  
  }

  public obtenerReporteDeTramitesExcel(data: any): Observable<any> {
      const body = JSON.stringify(data)
      return this.http.post<string>(this._baseUrl + "/ReportKuntur/procedureReportTemplate", body, {headers: this.headers})

  }

  public getProcedureStatusList(): Observable<any> {
    
    return this.http.get<any[]>(this._baseUrl + '/ReportKuntur/GetProcedureStatusList', { });
  }

  public GetRequestAllList(): Observable<any> {
    
    return this.http.get<any[]>(this._baseUrl + '/ReportKuntur/GetRequestAllList', { });
  }

}
