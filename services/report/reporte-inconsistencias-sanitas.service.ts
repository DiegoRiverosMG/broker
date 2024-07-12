import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AppConfig } from '@root/app.config';
import { Observable } from 'rxjs/Observable';

@Injectable({
  providedIn: 'root'
})
export class ReporteInconsistenciasSanitasService {

  private header = new HttpHeaders({'Content-Type':'application/json'});
  private url = AppConfig.URL_API_SCTR;

  constructor(private http: HttpClient) { }

  public listarRamos(): Observable<any>{
    return this.http.get<any[]>(this.url + '/ReporteInconsistenciasSanitas/ListarRamos');
  }

  public generarReporte(data: any): Observable<any> {
    const body = JSON.stringify(data);
    return this.http.post(this.url + '/ReporteInconsistenciasSanitas/GenerarReporte', body, { headers: this.header });
  }
}