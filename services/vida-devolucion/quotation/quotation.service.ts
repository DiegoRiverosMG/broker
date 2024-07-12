import { Injectable } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { HttpClient } from '@angular/common/http';

import { AppConfig } from '@root/app.config';
import { map } from 'rxjs/operators';
import { CotizacionModel } from '../../../models/vida-devolucion/cotizacion.model';

@Injectable({
  providedIn: 'root',
})
export class QuotationService {
  private readonly plataformaDigitalApi: string = AppConfig.WSPD_API;

  constructor(private readonly http: HttpClient) {}

  quote(payload: any): Observable<any> {
    const url = `${this.plataformaDigitalApi}/atp/cotizacion`;
    return this.http.post(url, payload).pipe(
      map(
        (response: any) =>
          ({
            ...response.data,
            cotizaciones: response.data.cotizacionesVigentes?.map(
              (value: any) => new CotizacionModel(value)
            ),
            cotizacionesNoVigentes: response.data.cotizacionesNoVigentes?.map(
              (value: any) => new CotizacionModel(value)
            ),
          } || [])
      )
    );
  }

  saveDatesContratante(payload: any): Observable<any> {
    const url = `${this.plataformaDigitalApi}/vdp/contratante`;
    return this.http
      .post(url, payload)
      .pipe(map((response: any) => response.data));
  }
  sendMassiveQuotation(payload: any): Observable<any> {
    const url = `${this.plataformaDigitalApi}/vdp/prospecto/slip`;
    return this.http
      .post(url, payload)
      .pipe(map((response: any) => response.data));
  }

  saveFinalQuotation(payload: any): Observable<any> {
    const url = `${this.plataformaDigitalApi}/vdp/cotizacion/definitiva`;
    return this.http
      .post(url, payload)
      .pipe(map((response: any) => response.data));
  }

  updateState(payload: any): Observable<any> {
    const url = `${this.plataformaDigitalApi}/vdp/prospecto/actualizar/estado`;
    return this.http
      .post(url, payload)
      .pipe(map((response: any) => response.data));
  }

  saveFamiliary(payload: any): Observable<any> {
    const url = `${this.plataformaDigitalApi}/vdp/prospecto/familiares`;
    return this.http
      .post(url, payload)
      .pipe(map((response: any) => response.data));
  }

  uploadFile(payload: any): Observable<any> {
    const fd: FormData = new FormData();
    const files = [];

    payload.files.forEach((e) => {
      if (!e.file) {
        return;
      }
      files.push({
        idTipoDocumento: e.fileId,
        nombreArchivo: e.fileName,
      });
      fd.append('fileattach', e.file);
    });
    const request = {
      idCliente: payload.clientId,
      adjuntos: files,
    };
    fd.append('data', JSON.stringify(request));

    const url = `${this.plataformaDigitalApi}/vdp/prospecto/adjuntos`;
    return this.http.post(url, fd).pipe(map((response: any) => response.data));
  }

  getParams(): Observable<any> {
    const url = `${this.plataformaDigitalApi}/vdp/parametros`;
    return this.http.get(url).pipe(map((response: any) => response.data));
  }
}
