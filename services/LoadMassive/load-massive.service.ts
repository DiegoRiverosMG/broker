import { Injectable } from "@angular/core";
import { Observable } from "rxjs/Observable";
import {
  HttpClient,
  HttpHeaders,
  HttpClientModule,
} from "@angular/common/http";
import { AppConfig } from "../../../../app.config";
import { AuthenticationService } from "../authentication.service";
@Injectable({
  providedIn: "root",
})
export class LoadMassiveService {
  private headers = new HttpHeaders({ "Content-Type": "application/json" });
  private Url = AppConfig.URL_API_SCTR;
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
    return this.http.get(this.Url + "/LoadMassive/GenerateFact", {
      params: _params,
    });
  }
  public GetHeaderProcess(data: any): Observable<any> {
    const body = JSON.stringify(data);
    return this.http.post(this.Url + "/LoadMassive/ProcessHeaderList", body, {
      headers: this.headers,
    });
  }

  public GetDetailProcess(data: any): Observable<any> {
    const _params = { IdProcessHeader: data };
    return this.http.get(this.Url + "/LoadMassive/ProcessDetailList", {
      params: _params,
    });
  }

  public GetProcessLogError(data: any, opcion: any): Observable<any> {
    const _params = { IdProcessDetail: data, Opcion: opcion };
    return this.http.get(this.Url + "/LoadMassive/GetProcessLogError", {
      params: _params,
    });
  }

  public GetDataExport(data: any): Observable<any> {
    const body = JSON.stringify(data);
    return this.http.post(this.Url + "/LoadMassive/GetDataExport", body, {
      headers: this.headers,
    });
  }
  public GetDataExportCorrect(data: any): Observable<any> {
    const body = JSON.stringify(data);
    return this.http.post(
      this.Url + "/LoadMassive/GetDataExportCorrect",
      body,
      {
        headers: this.headers,
      }
    );
  }

  public UploadFileProcess(paquete: FormData): Observable<any> {
    return this.http.post(this.Url + "/LoadMassive/UploadFileProcess", paquete);
  }

  public GetConfigurationPath(data: any): Observable<any> {
    const _params = { Identity: data };
    return this.http.get(this.Url + "/LoadMassive/GetConfigurationPath", {
      params: _params,
    });
  }
  public GetConfigurationEntity(): Observable<any> {
    const _params = {};
    return this.http.get(this.Url + "/LoadMassive/GetConfigurationEntity", {
      params: _params,
    });
  }
  public GetBranchList(): Observable<any> {
    const _params = {};
    return this.http.get(this.Url + "/SharedManager/GetBranchList", {
      params: _params,
    });
  }

  public GetProductsList(data: any): Observable<any> {
    const _params = { IdBranch: data };
    return this.http.get(this.Url + "/LoadMassive/GetProductsList", {
      params: _params,
    });
  }

  public GetConfigurationFiles(data: any): Observable<any> {
    const _params = { IdPath: data };
    return this.http.get(this.Url + "/LoadMassive/GetConfigurationFiles", {
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
    return this.http.get(this.Url + "/LoadMassive/GenerateFacturacion", {
      params: _params,
    });
  }

  public InsertHeaderProc(data: any): Observable<any> {
    const body = JSON.stringify(data);
    return this.http.post(this.Url + "/LoadMassive/InsertHeaderProc", body, {
      headers: this.headers,
    });
  }
  public ProcessFiles(paquete: FormData): Observable<any> {
    return this.http.post(this.Url + "/LoadMassive/ProcessFiles", paquete);
  }
}
