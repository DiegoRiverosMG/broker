import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { AppConfig } from '../../../../app.config';

@Injectable({
  providedIn: 'root',
})
export class ReporteLoteCobranzasService {
  private readonly apiWspd = AppConfig.WSPD_API;

  constructor(private readonly http: HttpClient) {}

  getListReport(data: any): Observable<any> {
    const url = `${this.apiWspd}/reporteCobranzas/listado`;
    return this.http
      .post(url, data)
      .pipe(map((response: any) => response.data));
  }

  generateReport(data: any): Observable<any> {
    const url = `${this.apiWspd}/reporteCobranzas/generar`;
    return this.http
      .post(url, data)
      .pipe(map((response: any) => response.data));
  }

  downloadReport(idReporte: number): Observable<any> {
    const url = `${this.apiWspd}/reporteCobranzas/descargar/${idReporte}`;
    return this.http.get(url).pipe(map((response: any) => response.data));
  }
}
