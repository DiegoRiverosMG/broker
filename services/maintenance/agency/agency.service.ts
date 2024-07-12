import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Observable } from 'rxjs';
import { AppConfig } from "../../../../../app.config";
import { BrokerAgencySearch } from '../../../models/maintenance/agency/request/broker-agency-search';
import { BrokerAgency } from '../../../models/maintenance/agency/response/broker-agency';
import { Agency } from '../../../models/maintenance/agency/request/agency';
import { GenericResponse } from '../../../models/shared/generic-response';

@Injectable({
    providedIn: 'root'
})
export class AgencyService {
    private headers = new HttpHeaders({ "Content-Type": "application/json" });
    private Url = AppConfig.URL_API_SCTR;

    constructor(private http: HttpClient) { }

    public getBrokerAgencyList(_searchData: BrokerAgencySearch): Observable<any> {
        const body = JSON.stringify(_searchData);
        return this.http.post(this.Url + "/AgencyManager/GetBrokerAgencyList", body, {
            headers: this.headers
        });
    }
    public addAgency(_agencyData: Agency, _formData: FormData): Observable<any> {

        const body = JSON.stringify(_agencyData);
        console.log(body);
        _formData.append('agencyData', body);
        return this.http.post(this.Url + "/AgencyManager/AddAgency", _formData);
    }

    public getLastBrokerList(_clientId: string, _nbranch: string, _nproduct: string, _limitPerPage: number, _pageNumber: number): Observable<GenericResponse> { //obtener lista de ultimos broker por cada producto del cliente
        let data = { clientId: _clientId, nbranch: _nbranch, nproduct: _nproduct, limitPerPage: _limitPerPage.toString(), pageNumber: _pageNumber.toString() };
        return this.http.get<GenericResponse>(this.Url + "/AgencyManager/getLastBrokerList", { params: data });
    }


}
