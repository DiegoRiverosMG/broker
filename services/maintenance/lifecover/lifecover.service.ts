import { Injectable } from '@angular/core';
import { AppConfig } from "../../../../../app.config";
import { HttpHeaders, HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})

export class LifeCoverService {
    private headers = new HttpHeaders({ "Content-Type": "application/json" });
    private url = AppConfig.URL_API_SCTR;

    constructor(private http: HttpClient){}

    public GetLifeCoverList(data: any): Observable<any> {
        const body = JSON.stringify(data);
        return this.http.post(this.url + '/LifeCoverManager/GetLifeCoverList', body , {
            headers: this.headers
        });
    }
}