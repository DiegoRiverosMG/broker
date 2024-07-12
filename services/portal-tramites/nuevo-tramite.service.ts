import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { PortalTramitesService } from './portal-tramites.service';
import { HttpClient } from '@angular/common/http';
import { AppConfig } from '@root/app.config';
import { NuevoTramiteRequest } from '../../models/portal-tramites/nuevo-tramite.model';
import {
  ICalculateAutoPremiumRequest,
  ICalculateAutoPrmeiumResponse,
} from '../../interfaces/auto.interface';

@Injectable({
  providedIn: 'root',
})
export class NuevoTramiteService {
  private urlApi: string;
  constructor(
    private readonly _portalTramitesService: PortalTramitesService,
    private readonly _http: HttpClient
  ) {
    this.urlApi = AppConfig.PD_API;
  }

  getDocuments(request: any): Observable<any> {
    const url = `${this.urlApi}/tramite/documentos`;
    return this._http.post(url, request).map((response) => response);
  }

  getSales(_: any): Observable<any> {
    const request = {
      codigoCanal: _.channelCode,
      idTipoDocumento: _.documentType,
      numeroDocumento: _.documentNumber,
      poliza: _.policy,
      placa: _.licensePlate1,
      pagina: _.currentPage,
      cantidadRegistros: 20,
    };
    const url = `${this.urlApi}/tramite/ventas`;
    return this._http.post(url, request).map((response) => response);
  }

  generateTransact(_: any): Observable<any> {
    const fd: FormData = new FormData();
    fd.append('tramite', JSON.stringify(new NuevoTramiteRequest(_)));

    _.files.forEach((e: File) => {
      fd.append('archivo', e);
    });

    const url = `${this.urlApi}/tramite`;
    return this._http.post(url, fd).map((response) => response);
  }

  calculateAutoPremium(
    _: ICalculateAutoPremiumRequest
  ): Observable<ICalculateAutoPrmeiumResponse> {
    const url = `${this.urlApi}/emission/obtenertarifarios`;
    const payload = {
      data: btoa(JSON.stringify(_)),
    };
    return this._http
      .post(url, payload)
      .map((response) => response[0] as ICalculateAutoPrmeiumResponse);
  }
}
