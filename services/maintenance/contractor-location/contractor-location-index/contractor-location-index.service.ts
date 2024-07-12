import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Observable } from 'rxjs';
import { AppConfig } from "../../../../../../app.config";
import { ContractorForTable } from '../../../../models/maintenance/contractor-location/contractor-for-table';
import { ContractorLocationForTable } from '../../../../models/maintenance/contractor-location/contractor-location-for-table';
import { ContractorLocation } from '../../../../models/maintenance/contractor-location/contractor-location';
import { ContractorLocationContact } from '../../../../models/maintenance/contractor-location/contractor-location-contact';
import { Contractor } from '../../../../models/maintenance/contractor-location/contractor';
import { ContractorLocationREQUEST } from '../../../../models/maintenance/contractor-location/Request/contractor-location-request';
import { ContractorLocationContactREQUEST } from '../../../../models/maintenance/contractor-location/Request/contractor-location-contact-request';
import { ResponseVM } from '../../../../models/maintenance/contractor-location/ReponseVM';
import { ContractorLocationType } from '../../../../models/maintenance/contractor-location/contractor-location-type';

@Injectable({
    providedIn: 'root'
})
export class ContractorLocationIndexService {
    private headers = new HttpHeaders({ "Content-Type": "application/json" });
    private Url = AppConfig.URL_API_SCTR;
    
    constructor(private http: HttpClient) { }

    public getSuggestedLocationType(_contractorId: string, _userCode: number): Observable<ResponseVM> {
        let data = { contractorId: _contractorId, userCode: _userCode.toString() };
        return this.http.get<ResponseVM>(this.Url + "/ContractorLocationManager/GetSuggestedLocationType", { params: data });
    }
    public hasActivePrincipalLocation(_contractorId: string, _locationIdToIgnore: number, _userCode: number): Observable<ResponseVM> {
        let data = { contractorId: _contractorId, locationIdToIgnore: _locationIdToIgnore.toString(), userCode: _userCode.toString() };
        return this.http.get<ResponseVM>(this.Url + "/ContractorLocationManager/HasActivePrincipalLocation", { params: data });
    }

    public getContractorLocationList(_contractorId: string, _limitPerPage: number, _pageNumber: number): Observable<ResponseVM> {
        let data = { contractorId: _contractorId, limitPerPage: _limitPerPage.toString(), pageNumber: _pageNumber.toString() };
        return this.http.get<ResponseVM>(this.Url + "/ContractorLocationManager/GetContractorLocationList", { params: data });
    }
    public getContractorLocation(_contractorLocationId: string): Observable<any> {
        let data = { contractorLocationId: _contractorLocationId };
        return this.http.get<any>(this.Url + "/ContractorLocationManager/GetContractorLocation", { params: data });
    }
    public getContractorLocationTypeList(): Observable<ContractorLocationType[]> {
        return this.http.get<ContractorLocationType[]>(this.Url + "/ContractorLocationManager/GetContractorLocationTypeList");
    }


    public getContractorLocationContactList(_contractorLocationId: number, _limitPerPage: number, _pageNumber: number): Observable<ResponseVM> {
        let data = { contractorLocationId: _contractorLocationId.toString(), limitPerPage: _limitPerPage.toString(), pageNumber: _pageNumber.toString() };
        return this.http.get<ResponseVM>(this.Url + "/ContractorLocationManager/GetContractorLocationContactList", { params: data });
    }

    public getContractor(_contractorId: string): Observable<Contractor> {
        let data = { contractorId: _contractorId };
        return this.http.get<Contractor>(this.Url + "/ContractorLocationManager/GetContractor", { params: data });
    }
    public getContact(_contactId: string): Observable<ContractorLocationContact> {
        let data = { contractorLocationContactId: _contactId };
        return this.http.get<ContractorLocationContact>(this.Url + "/ContractorLocationManager/GetContractorLocationContact", { params: data });
    }

    public updateContractorLocation(_contractorLocation: ContractorLocationREQUEST): Observable<any> {
        const body = JSON.stringify(_contractorLocation);
        return this.http.post(this.Url + "/ContractorLocationManager/UpdateContractorLocation", body, {
            headers: this.headers
        });
    }
    public updateContractorLocationContact(_contractorLocationContact: ContractorLocationContactREQUEST): Observable<any> {
        const body = JSON.stringify(_contractorLocationContact);
        return this.http.post(this.Url + "/ContractorLocationManager/UpdateContractorLocationContact", body, {
            headers: this.headers
        });
    }

    public deleteContact(_contactId: number, _userCode: number): Observable<any> {
        let data = { contactId: _contactId.toString(), userCode: _userCode.toString() };
        return this.http.get<Contractor>(this.Url + "/ContractorLocationManager/DeleteContact", { params: data });
    }
    public deleteLocation(_locationId: number, _userCode: number): Observable<any> {
        let data = { locationId: _locationId.toString(), userCode: _userCode.toString() };
        return this.http.get<Contractor>(this.Url + "/ContractorLocationManager/DeleteClientLocation", { params: data });
    }
}