import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

import { AppConfig } from '../../../../app.config';

@Injectable({
  providedIn: 'root'
})
export class CtasXcobrarService {
  private headers = new HttpHeaders({ 'Content-Type': 'application/json' });
  private url = AppConfig.URL_API_SCTR;

  constructor(private http: HttpClient) { }

  public getBranchTypesList(): Observable<any> {
    return this.http.get<any[]>(this.url + '/CtasXcobrar/GetBranch');
  }
  
  public postGenerateReportBroker(data: any): Observable<any> {
    const body = JSON.stringify(data);
    return this.http.post(this.url + '/CtasXcobrar/ProcessReport', body, { headers: this.headers });  
  }

  public getReportStatusBroker(data: any): Observable<any> {
    const body = JSON.stringify(data);
    return this.http.post(this.url + '/CtasXcobrar/GetStatusReport', body, { headers: this.headers });  
  }
 
  public getFileidCtasXcobrar(idCtasXcobrar: any): Observable<any>{
    const Json = { "IdReport": idCtasXcobrar };
    const data = JSON.stringify(Json);
    return this.http.post(this.url + '/CtasXcobrar/getFileReporteCierre', data,{ headers: this.headers });
  }  
}
