import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { AppConfig } from '@root/app.config';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class LineaCreditoEstadoService {
  private readonly urlApi = AppConfig.WSPD_API;

  constructor(private readonly http: HttpClient) {}

  getParametersCredit(payload: any): Observable<any> {
    const data = {
      ...payload,
      noBase64: true,
    };
    const url = `${this.urlApi}/gestorCredito/lineaCredito/parametros`;
    return this.http
      .post(url, data)
      .pipe(map((response: any) => response.data));
  }

  getStateSalesChannels(payload: any): Observable<any> {
    const data = {
      ...payload,
      noBase64: true,
    };
    const url = `${this.urlApi}/gestorCredito/lineaCredito/listado`;
    return this.http
      .post(url, data)
      .pipe(map((response: any) => response.data.listadoLineaCredito));
  }

  updateStateCredit(payload: any): Observable<any> {
    const data = {
      ...payload,
      noBase64: true,
    };
    const url = `${this.urlApi}/gestorCredito/lineaCredito/editar`;
    return this.http
      .post(url, data)
      .pipe(map((response: any) => response.data));
  }

  createStateCredit(payload: any): Observable<any> {
    const data = {
      ...payload,
      noBase64: true,
    };
    const url = `${this.urlApi}/gestorCredito/lineaCredito/crear`;
    return this.http
      .post(url, data)
      .pipe(map((response: any) => response.data));
  }

  changeStateActivate(payload: any): Observable<any> {
    const data = {
      ...payload,
      noBase64: true,
    };
    const url = `${this.urlApi}/gestorCredito/lineaCredito/activo`;
    return this.http
      .post(url, data)
      .pipe(map((response: any) => response.data));
  }

  getCreditHistory(idLineaCredito: number): Observable<any> {
    const url = `${this.urlApi}/gestorCredito/lineaCredito/historial/${idLineaCredito}`;
    return this.http.get(url).pipe(map((response: any) => response.data));
  }

  getCreditSummary(idLineaCredito: number): Observable<any> {
    const url = `${this.urlApi}/gestorCredito/lineaCredito/resumen/${idLineaCredito}`;
    return this.http.get(url).pipe(map((response: any) => response.data));
  }

  cancelStateCredit(payload: any): Observable<any> {
    const data = {
      ...payload,
      noBase64: true,
    };
    const url = `${this.urlApi}/gestorCredito/lineaCredito/anular`;
    return this.http
      .post(url, data)
      .pipe(map((response: any) => response.data));
  }
}
