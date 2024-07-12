import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

import { AppConfig } from '../../../../app.config';

@Injectable({
  providedIn: 'root'
})
export class ReporteCierreService {
  
  private headers = new HttpHeaders({ 'Content-Type': 'application/json' });
  private url = AppConfig.URL_API_SCTR;

  constructor(private http: HttpClient) {}

  public getBranchTypesList(): Observable<any> {
    return this.http.get<any[]>(this.url + '/ReporteCierre/GetBranch');
  }
  
  public postGenerateReporteCierre(data: any): Observable<any> {
    const body = JSON.stringify(data);
    console.log('serv', body);
    return this.http.post(this.url + '/ReporteCierre/ProcessReport', body, { headers: this.headers });  
  }

  public getReportStatusCierre(data: any): Observable<any> {
    const body = JSON.stringify(data);
    return this.http.post(this.url + '/ReporteCierre/GetStatusReport', body, { headers: this.headers });  
  }
 
  public getFileReporteCierre(idReport: any): Observable<any>{
    const Json = { "idReport": idReport };
    const data = JSON.stringify(Json);
    return this.http.post(this.url + '/ReporteCierre/getFileReporteCierre', data,{ headers: this.headers });
  }  
}
