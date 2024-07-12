import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

import { AppConfig } from '../../../../app.config';
import { data } from 'jquery';

@Injectable({
  providedIn: 'root'
})
export class ReporteComisionesAutomaticasService {

  private headers = new HttpHeaders({ 'Content-Type': 'application/json' });
  private url = AppConfig.URL_API_SCTR;

  constructor(private http: HttpClient) {}

  public getBranchTypesList(data: any): Observable<any> {
    const body = JSON.stringify(data);
    console.log('serv', body);
    return this.http.get<any[]>(this.url + '/ReporteDetalleResumen/GetBranch?SREPORT='+data.SREPORT );
  }
  
  public postGenerateReporteComisionesAutomaticas(data: any): Observable<any> {
    const body = JSON.stringify(data);
    console.log('serv', body);
    return this.http.post(this.url + '/ReporteDetalleResumen/ProcessReport', body, { headers: this.headers });  
  }

  public getReportStatusComisionesAutomaticas(data: any): Observable<any> {
    const body = JSON.stringify(data);
    return this.http.post(this.url + '/ReporteDetalleResumen/GetStatusReport', body, { headers: this.headers });  
  }
 
  public getFileReporteComisionesAutomaticas(idReport: any,SREPORT:any): Observable<any>{
    const Json = { "idReport": idReport ,"SREPORT":SREPORT};
    const data = JSON.stringify(Json);
    return this.http.post(this.url + '/ReporteDetalleResumen/getFileReporteDetalleResumen', data,{ headers: this.headers });
  }  
}
