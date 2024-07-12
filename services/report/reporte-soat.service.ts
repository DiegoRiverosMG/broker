import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

import { AppConfig } from '../../../../app.config';

@Injectable({
  providedIn: 'root'
})
export class ReporteSoatService {

  private headers = new HttpHeaders({ 'Content-Type': 'application/json' });
  private url = AppConfig.URL_API_SCTR;

  constructor(private http: HttpClient) {}

  public getBranchTypesList(): Observable<any> {
    return this.http.get<any[]>(this.url + '/ReporteSoat/GetBranch');
  }
  
  public postGenerateReporteSoat(data: any): Observable<any> {
    const body = JSON.stringify(data);
    console.log('serv', body);
    return this.http.post(this.url + '/ReporteSoat/ProcessReport', body, { headers: this.headers });  
  }

  public getReportStatusSoat(data: any): Observable<any> {
    const body = JSON.stringify(data);
    return this.http.post(this.url + '/ReporteSoat/GetStatusReport', body, { headers: this.headers });  
  }
 
  public getFileReporteSoat(idReport: any): Observable<any>{
    const Json = { "idReport": idReport };
    const data = JSON.stringify(Json);
    return this.http.post(this.url + '/ReporteSoat/getFileReporteSoat', data,{ headers: this.headers });
  }  
}
