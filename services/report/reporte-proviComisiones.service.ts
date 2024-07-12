import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

import { AppConfig } from '../../../../app.config';

@Injectable({
  providedIn: 'root'
})
export class ProviComisionesService {

  private headers = new HttpHeaders({ 'Content-Type': 'application/json' });
  private url = AppConfig.URL_API_SCTR;

  constructor(private http: HttpClient) {}

  public getBranchTypesList(): Observable<any> {
    return this.http.get<any[]>(this.url + '/ProviComisiones/GetBranch');
  }
  
  public postGenerateProviComisiones(data: any): Observable<any> {
    const body = JSON.stringify(data);
    //console.log('serv', body);
    return this.http.post(this.url + '/ProviComisiones/ProcessReport', body, { headers: this.headers });  
  }
  //Reporte Provision de comisiones por ID
  public GetReportProviComisionesById(reportId: any): Observable<any> {
      const Json = {
          "reportId": reportId
      };
      return this.http.post(this.url + '/ProviComisiones/ReportProviComisionesById', Json,
          {
              headers: this.headers
          });
  }

  public getReportStatusProviComisiones(data: any): Observable<any> {
    const body = JSON.stringify(data);
    return this.http.post(this.url + '/ProviComisiones/GetStatusReport', body, { headers: this.headers });  
  }
 
  public getFileProviComisiones(idReport: any): Observable<any>{
    const Json = { "idReport": idReport };
    const data = JSON.stringify(Json);
    return this.http.post(this.url + '/ProviComisiones/getFileReporteProviComisiones', data,{ headers: this.headers });
  }  
}
