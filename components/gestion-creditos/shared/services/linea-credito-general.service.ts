import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { AppConfig } from '@root/app.config';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class LineaCreditoGeneralService {
  private readonly urlApi = AppConfig.PD_API;
  private readonly urlApiState = AppConfig.WSPD_API;

  constructor(private readonly http: HttpClient) {}

  getSalesChannels(): Observable<any> {
    const url = `${this.urlApi}/codechannel/obtenercanales`;
    return this.http.get(url);
  }

  getParametersCredit(payload: any): Observable<any> {
    const data = {
      ...payload,
      noBase64: true,
    };
    const url = `${this.urlApiState}/gestorCredito/lineaCredito/parametros`;
    return this.http
      .post(url, data)
      .pipe(map((response: any) => response.data));
  }

  getStateSalesChannels(payload: any): Observable<any> {
    const data = {
      ...payload,
      noBase64: true,
    };
    const url = `${this.urlApiState}/gestorCredito/lineaCredito/listado`;
    return this.http
      .post(url, data)
      .pipe(map((response: any) => response.data.listadoLineaCredito));
  }

  updateChannel(payload: any): Observable<any> {
    const url = `${this.urlApi}/codechannel/actualizarcanal`;
    return this.http.post(url, payload);
  }

  updateStateCredit(payload: any): Observable<any> {
    const data = {
      ...payload,
      noBase64: true,
    };
    const url = `${this.urlApiState}/gestorCredito/lineaCredito/editar`;
    return this.http
      .post(url, data)
      .pipe(map((response: any) => response.data));
  }

  createStateCredit(payload: any): Observable<any> {
    const data = {
      ...payload,
      noBase64: true,
    };
    const url = `${this.urlApiState}/gestorCredito/lineaCredito/crear`;
    return this.http
      .post(url, data)
      .pipe(map((response: any) => response.data));
  }

  changeStateActivate(payload: any): Observable<any> {
    const data = {
      ...payload,
      noBase64: true,
    };
    const url = `${this.urlApiState}/gestorCredito/lineaCredito/activo`;
    return this.http
      .post(url, data)
      .pipe(map((response: any) => response.data));
  }

  getAuthorized(idUsuario: number): Observable<any> {
    const url = `${this.urlApiState}/gestorCredito/lineaCredito/autorizar/${idUsuario}`;
    return this.http.get(url).pipe(map((response: any) => response.data));
  }

  getCreditHistory(codigoCanal: number): Observable<any> {
    const url = `${this.urlApiState}/gestorCredito/historial/general/${codigoCanal}`;
    return this.http.get(url).pipe(map((response: any) => response.data));
  }
}
