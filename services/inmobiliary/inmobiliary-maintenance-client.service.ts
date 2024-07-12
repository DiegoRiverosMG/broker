import { Injectable } from "@angular/core";
import { Observable } from "rxjs/Observable";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { AppConfig } from "../../../../app.config";
import { map } from "rxjs/operators";

@Injectable({ providedIn: "root" })

export class InmobiliaryMaintenanceClientService {

    private headers = new HttpHeaders({ "Content-Type": "application/json" });
    private Url = AppConfig.URL_API_SCTR;

    constructor(private http: HttpClient) { }

    public GetListDocument(): Observable<any> {
        const _params = {};
        return this.http.get(this.Url + "/MaintenanceInmobiliary/GetTypeDocumentsList", { params: _params });
    }
    public GetListOption(): Observable<any> {
        const _params = {};
        return this.http.get(this.Url + "/MaintenanceInmobiliary/GetOptionList", { params: _params });
    }
    public GetListBuscarPor(): Observable<any> {
        const _params = {};
        return this.http.get(this.Url + "/MaintenanceInmobiliary/GetListBuscarPor", { params: _params });
    }
    public GetContratantesList(item: any): Observable<any> {
        const body = JSON.stringify(item);
        return this.http.post(this.Url + "/MaintenanceInmobiliary/GetContratantesList", body, { headers: this.headers });
    }
    public GetConsultaClientesList(item: any): Observable<any> {
        const body = JSON.stringify(item);
        return this.http.post(this.Url + "/MaintenanceInmobiliary/GetConsultaClientesList", body, { headers: this.headers });
    }

    public GetListTipFacturacion(item: any): Observable<any> {
        const body = JSON.stringify(item);
        return this.http.post(this.Url + "/MaintenanceInmobiliary/GetListTipFacturacion", body, { headers: this.headers });
    }

    // DGC
    public ListarGeneroInmobiliaria(): Observable<any> {
        return this.http.get(this.Url + "/MaintenanceInmobiliary/ListarGeneroInmobiliaria", { headers: this.headers });
    }
    public ListarNacionalidadInmobiliaria(): Observable<any> {
        return this.http.get(this.Url + "/MaintenanceInmobiliary/ListarNacionalidadInmobiliaria", { headers: this.headers });
    }
    public ListarEstadoCivilInmobiliaria(): Observable<any> {
        return this.http.get(this.Url + "/MaintenanceInmobiliary/ListarEstadoCivilInmobiliaria", { headers: this.headers });
    }
    public ListarTipoDocumentoInmobiliaria(): Observable<any> {
        return this.http.get(this.Url + "/MaintenanceInmobiliary/ListarTipoDocumentoInmobiliaria", { headers: this.headers });
    }
    public GetClientDetInmobiliaria(item: any): Observable<any> {
        const body = JSON.stringify(item);
        return this.http.post(this.Url + "/MaintenanceInmobiliary/GetClientDetInmobiliaria", body, { headers: this.headers });
    }
    public InsertarClienteInmobiliaria(item: any): Observable<any> {
        const body = JSON.stringify(item);
        return this.http.post(this.Url + "/MaintenanceInmobiliary/InsertarClienteInmobiliaria", body, { headers: this.headers });
    }
    public ActualizarClienteInmobiliaria(item: any): Observable<any> {
        const body = JSON.stringify(item);
        return this.http.post(this.Url + "/MaintenanceInmobiliary/ActualizarClienteInmobiliaria", body, { headers: this.headers });
    }
    public GetTipoVias(): Observable<any>{
        return this.http.get(this.Url + "/MaintenanceInmobiliary/GetTipoVias", { headers: this.headers }); 
    }
    public GetDepartamentos(): Observable<any>{
        return this.http.get(this.Url + "/MaintenanceInmobiliary/GetDepartamentos", { headers: this.headers }); 
    }
    public GetProvincias(P_NPROVINCE:any): Observable<any>{
        return this.http.get(this.Url + "/MaintenanceInmobiliary/GetProvincias?P_NPROVINCE=" +P_NPROVINCE, { headers: this.headers }).pipe(
            map((response: any) => {
                response.Result.forEach((obj: any) => {
                    obj.SDESCRIPT = obj.SDESCRIPT.replace(/\¿/g, 'Ñ');
                });
                return response; 
            })
        );
    }
    public GetDistrito(P_NLOCAL: any): Observable<any>{
        return this.http.get(this.Url + "/MaintenanceInmobiliary/GetDistrito?P_NLOCAL="+P_NLOCAL, { headers: this.headers }).pipe(
            map((response: any) => {
                response.Result.forEach((obj: any) => {
                    obj.SDESCRIPT = obj.SDESCRIPT.replace(/\¿/g, 'Ñ');
                });
                return response; 
            })
        );; 
    }

    public GetExistsBills(P_NBRANCH: any, P_NPRODUCT: any, P_NPOLICY: any): Observable<any>{  // VALIDACION FACT
        return this.http.get(this.Url + "/MaintenanceInmobiliary/GetExistsBills?P_NBRANCH="+P_NBRANCH + "&P_NPRODUCT=" + P_NPRODUCT + "&P_NPOLICY=" + P_NPOLICY, { headers: this.headers }); 
    }


    public GetDetalleDireccion(P_SCLIENT:any): Observable<any>{
        return this.http.get(this.Url + "/MaintenanceInmobiliary/GetDetalleDireccion?P_SCLIENT="+P_SCLIENT, { headers: this.headers }); 
    }
    public PayDateInmob(item: any): Observable<any> {
        const body = JSON.stringify(item);
        return this.http.post(this.Url + "/MaintenanceInmobiliary/PayDateInmob", body, { headers: this.headers });
    }
}