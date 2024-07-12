import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { AppConfig } from '@root/app.config';

@Injectable({
  providedIn: 'root',
})
export class MassiveChargeService {
  private readonly urlWsPdApi = AppConfig.WSPD_API;

  constructor(private readonly http: HttpClient) {}

  // *LISTA DE DATOS DE CARGA MASIVA
  onSearch(payload: any): Observable<any> {
    const url = `${this.urlWsPdApi}/vdp/cargaMasiva/listado`;
    return this.http.post(url, payload).pipe(
      map((response: any) => ({
        data: response.data.listadoCargaMasiva ?? [],
        totalItems:
          +response.data.listadoCargaMasiva[0]?.cantidadRegistros || 0,
        success: response.data.success,
        message: response.data.message,
      }))
    );
  }

  // *VALIDAR ARCHIVO DE CARGA MASIVA
  validateFileUploaded(payload: any): Observable<any> {
    const fd: FormData = new FormData();
    fd.set('file', payload.fileInfo.file);
    fd.set('idUsuario', payload.userId);

    const url = `${this.urlWsPdApi}/vdp/cargaMasiva/validar`;
    return this.http.post(url, fd).pipe(map((response: any) => response.data));
  }

  // *HISTORIAL DE CARGA MASIVA
  history(id: number): Observable<any> {
    const url = `${this.urlWsPdApi}/vdp/cargaMasiva/${id}/historial`;
    return this.http.get(url).pipe(
      map((response: any) => ({
        data: response.data.historialCargaMasiva || [],
        success: response.data.success,
        message: response.data.message,
      }))
    );
  }

  // *DETALLE DE CARGA MASIVA
  detail(id: number): Observable<any> {
    const url = `${this.urlWsPdApi}/vdp/cargaMasiva/${id}/detalle`;
    return this.http.get(url).pipe(
      map((response: any) => ({
        success: response.data.success,
        message: response.data.message,
        detail: response.data.detalleCargaMasiva || [],
        processId: response.data.detalleCargaMasiva[0]?.idProceso,
      }))
    );
  }

  // *GENERAR CARGA MASIVA
  generateMassiveCharge(processId: number): Observable<any> {
    const url = `${this.urlWsPdApi}/vdp/cargaMasiva/${processId}/emision`;
    return this.http.get(url).pipe(map((response: any) => response.data));
  }

  // *DESCARGAR EXCEL
  downloadExcel(processId: number): Observable<any> {
    const url = `${this.urlWsPdApi}/vdp/cargaMasiva/${processId}/descargar`;
    return this.http.get(url).pipe(map((response: any) => response.data));
  }

  // *DESCARGAR FORMATO TRAMA
  rasterFormat(): Observable<any> {
    const url = `${this.urlWsPdApi}/vdp/cargaMasiva/formato`;
    return this.http.get(url).pipe(map((response: any) => response.data));
  }
}
