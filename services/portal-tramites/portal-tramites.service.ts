import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AppConfig } from '@root/app.config';
import { Observable } from 'rxjs';
@Injectable({
  providedIn: 'root',
})
export class PortalTramitesService {
  private urlApi: string;

  constructor(private readonly _http: HttpClient) {
    this.urlApi = AppConfig.PD_API;
  }
  getSummary(policy: number): Observable<any> {
    const url = `${this.urlApi}/tramite/poliza/${policy}`;
    return this._http.get(url).map((response) => response);
  }
}
