import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from "@angular/common/http";
import { AppConfig } from "../../../../app.config";
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class AddressService {
    private Url = AppConfig.URL_API_SCTR;
    constructor(private http: HttpClient) { }

    public getDistrictList(_provinceId: number): Observable<any[]> {
        let data = { provinceId: _provinceId.toString() };
        return this.http.get<any[]>(this.Url + "/SharedManager/GetDistrictList", { params: data });
    }
    public getProvinceList(_departmentId: number): Observable<any[]> {
        let data = { departmentId: _departmentId.toString() };
        return this.http.get<any[]>(this.Url + "/SharedManager/GetProvinceList", { params: data });
    }
    public getDepartmentList(): Observable<any[]> {
        return this.http.get<any[]>(this.Url + "/SharedManager/GetDepartmentList");
    }
}
