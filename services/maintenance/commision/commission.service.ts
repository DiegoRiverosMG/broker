import { Injectable } from '@angular/core';

import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AppConfig } from '../../../../../app.config';
import { BrokerAgencySearch } from '../../../models/maintenance/agency/request/broker-agency-search';
import { BrokerAgency } from '../../../models/maintenance/agency/response/broker-agency';
import { Agency } from '../../../models/maintenance/agency/request/agency';
import { GenericResponse } from '../../../models/shared/generic-response';

@Injectable({
  providedIn: 'root'
})
export class CommissionService {
  private headers = new HttpHeaders({ 'Content-Type': 'application/json' });
  private Url = AppConfig.URL_API_SCTR;
  
  constructor(private http: HttpClient) { }

  public getBrokerCommission(_searchData: any): Observable<any> {
    const body = JSON.stringify(_searchData);
    return this.http.post(this.Url + '/Commission/ListBroker', body, {
      headers: this.headers
    });
  }

  public getListIntermidary(_searchData: any): Observable<any> {
    const body = JSON.stringify(_searchData);
    return this.http.post(this.Url + '/Commission/ListIntermedary', body, {
      headers: this.headers
    });
  }

  public updateCommission(_commission: any): Observable<any> {
    const body = JSON.stringify(_commission);
    return this.http.post(this.Url + '/Commission/UpdCommission', body, {
      headers: this.headers
    });
  }

  public getLastCommission(): Observable<any> {
    return this.http.post(this.Url + '/Commission/GetLastCommission', {
      headers: this.headers
    });
  }

  public valPerfilVDP(nid_user: any): Observable<any> {
    return this.http.get(this.Url + '/Commission/ValPerfilVDP?nid_user=' + nid_user);
  }

  public InsCommissionVDP(commission: any): Observable<any> {
    const body = JSON.stringify(commission);
    return this.http.post(this.Url + '/Commission/InsCommissionVDP', body, {
      headers: this.headers
    });
  }

  public UpdCommissionVDP(commission: any): Observable<any> {
    const body = JSON.stringify(commission);
    return this.http.post(this.Url + '/Commission/UpdCommissionVDP', body, {
      headers: this.headers
    });
  }

}
