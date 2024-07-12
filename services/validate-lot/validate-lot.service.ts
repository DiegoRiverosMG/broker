import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { AppConfig } from '../../../../app.config';

@Injectable({
  providedIn: 'root',
})
export class ValidateLotService {
  private readonly urlApi = AppConfig.PD_API;
  private readonly urlApi2 = AppConfig.WSPD_API;

  constructor(private readonly http: HttpClient) {}

  getListValidationLot(payload: any): Observable<any> {
    const data = {
      ...payload,
      noBase64: true,
    };
    const url = `${this.urlApi2}/validacionLotes/listado`;
    return this.http.post(url, data).pipe(
      map((response: any) => ({
        ...response.data,
        cantidadRegistros:
          response.data?.listadoLotes[0]?.cantidadRegistros || 0,
      }))
    );
  }

  getLotSummary(idLote: number): Observable<any> {
    const url = `${this.urlApi2}/validacionLotes/detalle/${idLote}`;
    return this.http.get(url).pipe(map((response: any) => response.data));
  }

  downloadDataLot(idLote: number): Observable<any> {
    const url = `${this.urlApi2}/validacionLotes/descargarExcel/${idLote}`;
    return this.http.get(url).pipe(map((response: any) => response.data));
  }

  getChannelSales(payload: any): Observable<any> {
    const body = {
      data: btoa(JSON.stringify(payload)),
    };
    const url = `${this.urlApi}/ChannelSales`;
    return this.http.post(url, body).pipe(map((response: any) => response));
  }
}
