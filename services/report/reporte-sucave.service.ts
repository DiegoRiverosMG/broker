import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

import { AppConfig } from '../../../../app.config';

@Injectable({
  providedIn: 'root'
})
export class ReporteSucaveService {

  private headers = new HttpHeaders({ 'Content-Type': 'application/json' });
  private url = AppConfig.URL_API_SCTR;

  constructor(private http: HttpClient) {}

  public GenerateFact(
    idHeaderProc: any,
    idDetailProc: any,
    userCode: any
  ): Observable<any> {
    const _params = {
      NIDHEADERPROC: idHeaderProc,
      NIDDETAILPROC: idDetailProc,
      NUSERCODE: userCode,
    };
    return this.http.get(this.url + "/ReporteSucave/GenerateFact", {
      params: _params,
    });
  }

  /***************REPORTE SUCAVE**************/
  public getBranchTypesList(): Observable<any> {
    return this.http.get<any[]>(this.url + '/ReporteSucave/GetBranch');
  }

  public getProductTypesList(data: any): Observable<any>{
    const body = JSON.stringify(data);
    return this.http.post(this.url + '/ReporteSucave/GetProduct', body,{ headers: this.headers });
  }

  public postGenerateReporteSoat(data: any): Observable<any> {
    const body = JSON.stringify(data);
    console.log('serv', body);
    return this.http.post(this.url + '/ReporteSucave/ProcessReport', body, { headers: this.headers });
  }

  public getReportStatusSoat(data: any): Observable<any> {
    const body = JSON.stringify(data);
    return this.http.post(this.url + '/ReporteSucave/GetStatusReport', body, { headers: this.headers });
  }

  public getFileReporteSoat(idReport: any): Observable<any>{
    const Json = { "idReport": idReport };
    const data = JSON.stringify(Json);
    return this.http.post(this.url + '/ReporteSucave/getFileReporteSoat', data,{ headers: this.headers });
  }

  public postProductTypesList(data: any): Observable<any> {
    const body = JSON.stringify(data);
    return this.http.post(this.url + '/ReporteSucave/GetProduct', body, { headers: this.headers });
  }

  /***************CONSULTA REPORTE SUCAVE**************/

  public GetHeaderProcess(data: any): Observable<any> {
    const body = JSON.stringify(data);
    return this.http.post(this.url + "/ReporteSucave/ProcessHeaderList", body, {
      headers: this.headers,
    });
  }

  public GetDetailProcess(data: any): Observable<any> {
    const _params = { IdProcessHeader: data };
    return this.http.get(this.url + "/ReporteSucave/ProcessDetailList", {
      params: _params,
    });
  }

  public GetProcessLogError(data: any, opcion: any): Observable<any> {
    const _params = { IdProcessDetail: data, Opcion: opcion };
    return this.http.get(this.url + "/ReporteSucave/GetProcessLogError", {
      params: _params,
    });
  }

  public GetDataExport(data: any): Observable<any> {
    const body = JSON.stringify(data);
    return this.http.post(this.url + "/ReporteSucave/GetDataExport", body, {
      headers: this.headers,
    });
  }
  public GetDataExportCorrect(data: any): Observable<any> {
    const body = JSON.stringify(data);
    return this.http.post(
      this.url + "/ReporteSucave/GetDataExportCorrect",
      body,
      {
        headers: this.headers,
      }
    );
  }

  public UploadFileProcess(paquete: FormData): Observable<any> {
    return this.http.post(this.url + "/ReporteSucave/UploadFileProcess", paquete);
  }

  public GetConfigurationPath(data: any): Observable<any> {
    const _params = { Identity: data };
    return this.http.get(this.url + "/ReporteSucave/GetConfigurationPath", {
      params: _params,
    });
  }
  public GetConfigurationEntity(): Observable<any> {
    const _params = {};
    return this.http.get(this.url + "/ReporteSucave/GetConfigurationEntity", {
      params: _params,
    });
  }

  public GetConfigurationFiles(data: any): Observable<any> {
    const _params = { IdPath: data };
    return this.http.get(this.url + "/ReporteSucave/GetConfigurationFiles", {
      params: _params,
    });
  }
  public GenerateFacturacion(
    IdIdentity: any,
    IdProcessHeader: any
  ): Observable<any> {
    const _params = {
      IdIdentity: IdIdentity,
      IdHeaderProcess: IdProcessHeader,
    };
    return this.http.get(this.url + "/ReporteSucave/GenerateFacturacion", {
      params: _params,
    });
  }

  public InsertHeaderProc(data: any): Observable<any> {
    const body = JSON.stringify(data);
    return this.http.post(this.url + "/ReporteSucave/InsertHeaderProc", body, {
      headers: this.headers,
    });
  }
  public ProcessFiles(paquete: FormData): Observable<any> {
    return this.http.post(this.url + "/ReporteSucave/ProcessFiles", paquete);
  }

  public GetDataExportTxt(data: any): Observable<any> {
    const body = JSON.stringify(data);
    return this.http.post(this.url + "/ReporteSucave/GetDataExportTxt", body, {
      headers: this.headers,
    });
  }

}
