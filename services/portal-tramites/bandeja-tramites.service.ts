import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay, map } from 'rxjs/operators';
import { PortalTramitesService } from './portal-tramites.service';
import { AppConfig } from '@root/app.config';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class BandejaTramitesService {
  private urlApi: string;
  private urlApiBackOffice: string;
  constructor(private readonly http: HttpClient) {
    this.urlApi = AppConfig.PD_API;
    this.urlApiBackOffice = AppConfig.BACKOFFICE_API;
  }

  listadoTramites(payload: any): Observable<any> {
    const request = {
      placa: payload.licensePlate || null,
      poliza: payload.policy || 0,
      idTramite: payload.transactId || 0,
      codigoCanal: payload.channelCode || 0,
      idTipoTramite: payload.transactTypeId || 0,
      idEstado: payload.stateId || 0,
      fechaInicio: payload.startDate,
      fechaFin: payload.endDate,
      pagina: payload.currentPage,
      cantidadRegistros: 10,
    };
    const url = `${this.urlApi}/tramite/listado`;
    return this.http.post(url, request).map((response) => response);
  }

  transactRequest(transactId: number): Observable<any> {
    const url = `${this.urlApi}/tramite/${transactId}`;
    return this.http.get(url).map((response) => response);
  }

  filters(idTipo: number): Observable<any> {
    const url = `${this.urlApi}/tramite/parametros/${idTipo}`;
    return this.http.get(url).map((response) => response);
  }

  getRecord(idTransact: number): Observable<any> {
    const url = `${this.urlApi}/tramite/${idTransact}/historial`;
    return this.http.get(url).map((response) => response);
  }

  sendToOperations(payload: any): Observable<any> {
    const url = `${this.urlApi}/tramite/enviar`;
    return this.http.post(url, payload);
  }

  cancelTransact(payload: any): Observable<any> {
    const _ = {
      idTramite: payload.transactId,
      idUsuario: payload.userId,
    };
    const url = `${this.urlApi}/tramite/cancelar`;
    return this.http.post(url, _).map((response) => response);
  }

  aceptTransact(payload: any): Observable<any> {
    const url = `${this.urlApi}/tramite/aprobar`;
    return this.http.post(url, payload).map((response) => response);
  }

  rejectTransact(payload: any): Observable<any> {
    const url = `${this.urlApi}/tramite/rechazar`;
    return this.http.post(url, payload).map((response) => response);
  }

  sendApeseg(payload: any): Observable<any> {
    const fd: FormData = new FormData();
    fd.set('certificates[0][P_N_POLESP_COMP]', payload.policy);
    fd.set('certificates[0][P_NUSEREDIT]', payload.userId);
    fd.set('certificates[0][P_NTRANSFERSTATUS]', '');
    fd.set('certificates[0][buttonSendAPESEG]', '1');
    fd.set('parameters[P_DREGDATEINI]', payload.startValidity);
    fd.set('parameters[P_DREGDATEFIN]', payload.endValidity);
    fd.set('parameters[P_NTRANSFERSTATUS]', '5');
    fd.set('parameters[P_INDENTI]', '0');
    const url = `${this.urlApiBackOffice}/APESEGSend/Core/SendAPESEGMassive`;
    return this.http.post(url, fd).pipe(map((response: any) => response));
  }

  cancelApeseg(payload: any): Observable<any> {
    const url = `${this.urlApi}/tramite/poliza/anularApeseg`;
    return this.http.post(url, payload).pipe(map((response: any) => response));
  }
}
