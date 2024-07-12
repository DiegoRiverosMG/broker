import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

import { AppConfig } from '../../../../app.config';

@Injectable({
  providedIn: 'root'
})
export class NotasCreditoService {
  
  private headers = new HttpHeaders({ 'Content-Type': 'application/json' });
  private url = AppConfig.URL_API_SCTR;

  constructor(private http: HttpClient) {}

  public getBranchTypesList(): Observable<any> {
    return this.http.get<any[]>(this.url + '/NotasCredito/GetBranch');
  }
  
  public postGenerateReportNotasCredito(data: any): Observable<any> {
    const body = JSON.stringify(data);
    return this.http.post(this.url + '/NotasCredito/ProcessReport', body, { headers: this.headers });  
  }

  public getReportStatusNotasCredito(data: any): Observable<any> {
    const body = JSON.stringify(data);
    return this.http.post(this.url + '/NotasCredito/GetStatusReport', body, { headers: this.headers });  
  }
 
  public getFileNotasCreditoReport(idReport: any): Observable<any>{
    const Json = { "idReport": idReport };
    const data = JSON.stringify(Json);
    return this.http.post(this.url + '/NotasCredito/GetReportBrokerXLS', data,{ headers: this.headers });
  }  
}
