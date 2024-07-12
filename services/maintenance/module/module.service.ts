import { Injectable } from "@angular/core";
import { AppConfig } from "../../../../../app.config";
import { HttpHeaders, HttpClient } from '@angular/common/http';
import { ModuleREQUEST } from '../../../models/maintenance/module/request/moduleREQUEST';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})

export class ModuleService {
    private headers = new HttpHeaders({ "Content-Type": "application/json" });
    private url = AppConfig.URL_API_SCTR;

    constructor(private http: HttpClient){}

    public updateStateModule(_module: ModuleREQUEST): Observable<any> {
        const body = JSON.stringify(_module);
        return this.http.post(this.url + "/ModuleManager/UpdateStateModule", body, {
            headers: this.headers
        });
    }

    public GetModuleList(data: any): Observable<any> {
        const body = JSON.stringify(data);
        return this.http.post(this.url + '/ModuleManager/GetModuleList', body , {
            headers: this.headers
        });
    }

    public GetModuleByCode(data: any): Observable<any> {
        const body = JSON.stringify(data);
        return this.http.post(this.url + '/ModuleManager/GetModuleByCode', body , {
            headers: this.headers
        });
    }

    public updateModule(_module: ModuleREQUEST): Observable<any> {
        const body = JSON.stringify(_module);
        return this.http.post(this.url + "/ModuleManager/UpdateModule", body, {
            headers: this.headers
        });
    }

    public getModuleCode(data: any) : Observable<any> {
        const body = JSON.stringify(data);
        return this.http.post(this.url + "/ModuleManager/GetModuleCode", body, {
            headers: this.headers
        });
    }

}