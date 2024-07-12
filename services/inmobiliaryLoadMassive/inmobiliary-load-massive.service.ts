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
export class InmobiliaryLoadMassiveService {
    private headers = new HttpHeaders({ "Content-Type": "application/json" });
    private Url = AppConfig.URL_API_SCTR;
    constructor(private http: HttpClient) { }

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
        return this.http.get(this.Url + "/LoadMassiveIM/GenerateFact", {
            params: _params,
        });
    }
    public GetHeaderProcess(data: any): Observable<any> {
        const body = JSON.stringify(data);
        return this.http.post(this.Url + "/LoadMassiveIM/ProcessHeaderList", body, {
            headers: this.headers,
        });
    }

    public GetDetailProcess(data: any): Observable<any> {
        const _params = { IdProcessHeader: data };
        return this.http.get(this.Url + "/LoadMassiveIM/ProcessDetailList", {
            params: _params,
        });
    }

    public GetProcessLogError(data: any, opcion: any): Observable<any> {
        const _params = { IdProcessDetail: data, Opcion: opcion };
        return this.http.get(this.Url + "/LoadMassiveIM/GetProcessLogError", {
            params: _params,
        });
    }

    public GetDataExport(data: any): Observable<any> {
        const body = JSON.stringify(data);
        return this.http.post(this.Url + "/LoadMassiveIM/GetDataExport", body, {
            headers: this.headers,
        });
    }
    public GetDataExportCorrect(data: any): Observable<any> {
        const body = JSON.stringify(data);
        return this.http.post(
            this.Url + "/LoadMassiveIM/GetDataExportCorrect",
            body,
            {
                headers: this.headers,
            }
        );
    }

    public UploadFileProcess(paquete: FormData): Observable<any> {
        return this.http.post(this.Url + "/LoadMassiveIM/UploadFileProcess", paquete);
    }

    public GetConfigurationPath(data: any): Observable<any> {
        const _params = { Identity: data };
        return this.http.get(this.Url + "/LoadMassiveIM/GetConfigurationPath", {
            params: _params,
        });
    }
    public GetConfigurationEntity(): Observable<any> {
        const _params = {};
        return this.http.get(this.Url + "/LoadMassiveIM/GetConfigurationEntity", {
            params: _params,
        });
    }
    public GetBranchList(): Observable<any> {
        const _params = {};
        return this.http.get(this.Url + "/LoadMassiveIM/GetBranchList", {
            params: _params,
        });
    }

    public GetProductsList(data: any): Observable<any> {
        const _params = { IdBranch: data };
        return this.http.get(this.Url + "/LoadMassiveIM/GetProductsList", {
            params: _params,
        });
    }

    public GetConfigurationFiles(data: any): Observable<any> {
        const _params = { IdPath: data };
        return this.http.get(this.Url + "/LoadMassiveIM/GetConfigurationFiles", {
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
        return this.http.get(this.Url + "/LoadMassiveIM/GenerateFacturacion", {
            params: _params,
        });
    }

    public InsertHeaderProc(data: any): Observable<any> {
        const body = JSON.stringify(data);
        return this.http.post(this.Url + "/LoadMassiveIM/InsertHeaderProc", body, {
            headers: this.headers,
        });
    }
    public ProcessFiles(paquete: FormData): Observable<any> {
        return this.http.post(this.Url + "/LoadMassiveIM/ProcessFiles", paquete);
    }
    
    // CIERRE
    public ListarDocumentosCierre(): Observable<any> {
        return this.http.get(this.Url + "/MaintenanceInmobiliary/ListarDocumentosCierre", { headers: this.headers });
    }
    public ListarPorVencerCierre(): Observable<any> {
        return this.http.get(this.Url + "/MaintenanceInmobiliary/ListarPorVencerCierre", { headers: this.headers });
    }
    public ListarEstadosBillsCierre(): Observable<any> {
        return this.http.get(this.Url + "/MaintenanceInmobiliary/ListarEstadosBillsCierre", { headers: this.headers });
    }
    public GetInmobiliairyCierreReport(item: any): Observable<any> {
        const body = JSON.stringify(item);
        return this.http.post(this.Url + "/MaintenanceInmobiliary/GetInmobiliairyCierreReport", body, { headers: this.headers });
    }
    public GetDataReportInmobiliariasControlSeguimiento(item: any): Observable<any> {
        const body = JSON.stringify(item);
        return this.http.post(this.Url + "/MaintenanceInmobiliary/GetDataReportInmobiliariasControlSeguimiento", body, { headers: this.headers });
    }
    public ListarTipoServicioCierre(): Observable<any> {
        return this.http.get(this.Url + "/MaintenanceInmobiliary/ListarTipoServicioCierre", { headers: this.headers });
    }
    public GetInmobiliairyReporteCierre(item: any): Observable<any> {
        const body = JSON.stringify(item);
        return this.http.post(this.Url + "/MaintenanceInmobiliary/GetInmobiliairyReporteCierre", body, { headers: this.headers });
    }
    public GetDataInmobiliairyReporteCierre(item: any): Observable<any> {
        const body = JSON.stringify(item);
        return this.http.post(this.Url + "/MaintenanceInmobiliary/GetDataInmobiliairyReporteCierre", body, { headers: this.headers });
    }
}
