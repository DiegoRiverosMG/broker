import { IReactivarAnulado } from '@root/layout/broker/interfaces/vida-devolucion/reactivar.interface';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { AppConfig } from '@root/app.config';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class SummaryService {
  private readonly plataformaDigitalApi: string = AppConfig.WSPD_API;

  constructor(private readonly http: HttpClient) {}

  getTablaTrazabilidad(idProspecto: string): Observable<any> {
    const url = `${this.plataformaDigitalApi}/vdp/eventos/${idProspecto}`;
    return this.http.get(url).pipe(map((response: any) => response.data));
  }
  sendTrazabilidad(payload: any): Observable<any> {
    const url = 'http://localhost:2085/api/vdp/eventos';
    return this.http.post(url, payload).pipe(map((response: any) => response));
  }
  getSummary(clientId: number): Observable<any> {
    const url = `${this.plataformaDigitalApi}/vdp/prospecto/${clientId}`;
    return this.http.get(url).pipe(map((response: any) => response.data));
  }

  getQuotations(clientId: number): Observable<any> {
    const url = `${this.plataformaDigitalApi}/vdp/prospecto/${clientId}/cotizaciones`;
    return this.http.get(url).pipe(map((response: any) => response.data));
  }

  getQuotationSummary(quotationId: number): Observable<any> {
    const url = `${this.plataformaDigitalApi}/vdp/cotizacion/${quotationId}`;

    return this.http.get(url).pipe(map((response: any) => response.data));
  }

  getDpsSummary(processId: number): Observable<any> {
    const url = `${this.plataformaDigitalApi}/atp/dps/${processId}`;
    return this.http.get(url).pipe(map((response: any) => response.data));
  }
  sendBeneficiaries(payload: any): Observable<any> {
    const url = `${this.plataformaDigitalApi}/atp/cotizacion/beneficiarios`;
    return this.http
      .post(url, payload)
      .pipe(map((response: any) => response.data));
  }
  sendComment(payload: any): Observable<any> {
    const url = `${this.plataformaDigitalApi}/vdp/prospecto/comentario`;
    return this.http
      .post(url, payload)
      .pipe(map((response: any) => response.data));
  }

  getComments(payload: any): Observable<any> {
    const url = `${this.plataformaDigitalApi}/`;
    return this.http
      .post(url, payload)
      .pipe(map((response: any) => response.data));
  }

  assignAssesor(payload: any): Observable<any> {
    const url = `${this.plataformaDigitalApi}/vdp/prospecto/asignar`;

    console.log(payload);
    return this.http
      .post(url, payload)
      .pipe(map((response: any) => response.data));
  }

  reactivar(payload: IReactivarAnulado): Observable<any> {
    const url = `${this.plataformaDigitalApi}/vdp/prospecto/estado`;
    return this.http
      .post(url, payload)
      .pipe(map((response: any) => response.data));
  }

  cancelProspect(payload: any): Observable<any> {
    const url = `${this.plataformaDigitalApi}/vdp/prospecto/anular`;
    return this.http
      .post(url, payload)
      .pipe(map((response: any) => response.data));
  }

  getAttachments(clientId: number): Observable<any> {
    const url = `${this.plataformaDigitalApi}/vdp/prospecto/${clientId}/adjuntos`;
    return this.http.get(url).pipe(map((response: any) => response.data));
  }

  getState(clientId: number): Observable<any> {
    const url = `${this.plataformaDigitalApi}/vdp/prospecto/${clientId}/estado`;
    return this.http.get(url).pipe(map((response: any) => response.data));
  }

  getFamiliaries(clientId: number): Observable<any> {
    const url = `${this.plataformaDigitalApi}/vdp/prospecto/${clientId}/familiares`;
    return this.http.get(url).pipe(map((response: any) => response.data));
  }
  getNewClientIndicator(request: any) {
    const url = `${this.plataformaDigitalApi}/cliente/indicador/riesgo`;
    return this.http.post(url, request).map(
      (response) => response,
      (error) => {
        console.error(error);
      }
    );
  }
  getNewClientExperian(request: any) {
    const url = `${this.plataformaDigitalApi}/cliente/experian/riesgo`;
    return this.http.post(url, request).map(
      (response) => response,
      (error) => {
        console.error(error);
      }
    );
  }
}
