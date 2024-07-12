import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

import { AppConfig } from '../../../../app.config';

@Injectable({
  providedIn: 'root'
})
export class AsesoriaBrokerService {
  
  private headers = new HttpHeaders({ 'Content-Type': 'application/json' });
  private url = AppConfig.URL_API_SCTR;

  constructor(private http: HttpClient) {}

  public getBranchTypesList(): Observable<any> {
    return this.http.get<any[]>(this.url + '/AsesoriaBroker/GetBranch');
  }
  
  public postGenerateReportBroker(data: any): Observable<any> {
    const body = JSON.stringify(data);
    return this.http.post(this.url + '/AsesoriaBroker/ProcessReport', body, { headers: this.headers });  
  }

  public getReportStatusBroker(data: any): Observable<any> {
    const body = JSON.stringify(data);
    return this.http.post(this.url + '/AsesoriaBroker/GetStatusReport', body, { headers: this.headers });  
  }
 
  public getFileAsesoriaReport(idReport: any): Observable<any>{
    const Json = { "idReport": idReport };
    const data = JSON.stringify(Json);
    return this.http.post(this.url + '/AsesoriaBroker/GetReportBrokerXLS', data,{ headers: this.headers });
  }  
}
