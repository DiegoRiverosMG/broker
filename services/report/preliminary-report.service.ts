import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

import { AppConfig } from '../../../../app.config';

@Injectable({
    providedIn: 'root'
})
export class PreliminaryReportService {

    private headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    private url = AppConfig.URL_API_SCTR;

    constructor(private http: HttpClient) {}

    public getBranchTypesList(): Observable<any> {
        return this.http.get<any[]>(this.url + '/Preliminary/Branches');
    }
    
    public getProcessTypesList(): Observable<any> {
        return this.http.get<any[]>(this.url + '/Preliminary/TypeProcess');
    }
    
    public getBranchPeriod(branchId: number, ReportId: number): Observable<any> {
        return this.http.get<any[]>(this.url + '/Preliminary/BranchPeriod?branchId=' + branchId + '&ReportId='+ ReportId);
    }

    //Descarga  de reporte o reportes
    public GetFilePreliminaryReport(IDMONITOR: any): Observable<any> {
        const Json = { "IDMONITOR": IDMONITOR };
        const data = JSON.stringify(Json);
        return this.http.post(this.url + '/Preliminary/getFilePreliminaryReport', data,{ headers: this.headers });
    }

    public postGenerateMonitorProcess(data: any): Observable<any> {
        const body = JSON.stringify(data);
        return this.http.post(this.url + '/Preliminary/GetMonitorProcess', body, { headers: this.headers });
    }

    public postGeneratePreliminaryReport(data: any): Observable<any> {
        const body = JSON.stringify(data);
        return this.http.post(this.url + '/Preliminary/GenerateReports', body, { headers: this.headers });
    }

    // PRODUCTOS VILP
    public listarProductosVILP(): Observable<any> { 
        return this.http.get<any[]>(this.url + '/ModuleReports/ListarProductosVILP', { headers: this.headers });
    }
}