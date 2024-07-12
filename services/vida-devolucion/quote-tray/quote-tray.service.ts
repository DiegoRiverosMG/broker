import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { AppConfig } from '@root/app.config';
import {
  IListadoProspectosRequest,
  IListadoProspectosResponse,
} from '../../../interfaces/vida-devolucion/listado-prospectos.interface';
import { IHistorialProspectoResponse } from '../../../interfaces/vida-devolucion/historial-prospecto.interface';
import { IDescartarProspectoRequest } from '../../../interfaces/vida-devolucion/descartar-prospecto.interface';
import { IResponse } from '../../../../../shared/interfaces/response.interface';
import { ConfigService } from '@shared/services/general/config.service';

@Injectable({
  providedIn: 'root',
})
export class QuoteTrayService {
  private headers = new HttpHeaders({ 'Content-Type': 'application/json' });
  private readonly plataformaDigitalApi: string = AppConfig.WSPD_API;
  private readonly apiURL2: string = AppConfig.WSPD_API;
  _baseUrl = '';
  constructor(
    private readonly http: HttpClient,
    private configService: ConfigService
  ) {
    this._baseUrl = configService.getWebApiURL();
  }

  getParameters(): Observable<any> {
    const url = `${this.apiURL2}/vdp/parametros`;
    return this.http.get(url).pipe(map((response: any) => response.data));
  }
  getClientData(request: any) {
    const url = `${this.plataformaDigitalApi}/cliente`;
    return this.http.post(url, request).map(
      (response) => response,
      (error) => {
        console.error(error);
      }
    );
  }
  getClientIndicator(request: any) {
    const url = `${this.plataformaDigitalApi}/cliente/indicador`;
    return this.http.post(url, request).map(
      (response) => response,
      (error) => {
        console.error(error);
      }
    );
  }

  listadoProspectos(
    payload: IListadoProspectosRequest
  ): Observable<IListadoProspectosResponse> {
    const url = `${this.plataformaDigitalApi}/vdp/prospecto/listado`;
    return this.http.post(url, payload).pipe(
      map(
        (response: any) =>
          ({
            ...response.data,
            cantidadRegistros:
              +(<Array<any>>response.data.listadoProspectos || [])[0]
                ?.cantidadRegistros || 0,
          } as IListadoProspectosResponse)
      )
    );
  }

  historial(idCliente: number): Observable<IHistorialProspectoResponse> {
    const url = `${this.plataformaDigitalApi}/vdp/prospecto/${idCliente}/historial`;
    return this.http
      .get(url)
      .pipe(
        map((response: any) => response.data as IHistorialProspectoResponse)
      );
  }

  discardLeaflet(payload: IDescartarProspectoRequest): Observable<IResponse> {
    const url = `${this.plataformaDigitalApi}/vdp/prospecto/anular`;
    return this.http
      .post(url, payload)
      .pipe(map((response: any) => response.data as IResponse));
  }
}
