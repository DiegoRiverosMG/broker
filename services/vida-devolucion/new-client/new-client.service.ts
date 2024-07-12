import { String } from './../../../components/photocheck/constants/string';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';

import { AppConfig } from '@root/app.config';
import {
  ITarifarioRequest,
  ITarifarioResponse,
} from '../../../interfaces/vida-devolucion/tarifario.interface';
import { IDocumentInformationRequest } from '@shared/interfaces/document-information.interface';
import { DocumentInformationModel } from '@shared/models/document-information/document-information.model';

@Injectable({
  providedIn: 'root',
})
export class NewClientService {
  private readonly plataformaDigitalApi: string = AppConfig.PD_API;
  private readonly pdTarif: string = AppConfig.WSPD_API;
  constructor(private readonly http: HttpClient) {}

  tarifario(payload: ITarifarioRequest): Observable<ITarifarioResponse> {
    const url = `${this.plataformaDigitalApi}/VidaIndividual/cliente/tarifario`;
    // const url = `http://localhost:2085/api/VidaIndividual/cliente/tarifario`;
    // const url = `https://servicios.protectasecurity.pe/wsplataformadigitaldev/api/VidaIndividual/cliente/tarifario`;
    /*  const url = `${this.plataformaDigitalApi}/atp/cliente/tarifario`; */
    /* return this.http.post(url, payload).pipe(
      map((response: any) => response.data as ITarifarioResponse)
    ); */
    const POST$ = this.http.post(url, payload);
    const DATA$: Observable<ITarifarioResponse> = new Observable((obs) => {
      POST$.subscribe(
        (res: ITarifarioResponse) => {
          obs.next(res);
          obs.complete();
        },
        (err: any) => {
          obs.error(err);
        }
      );
    });
    return DATA$;
  }

  saveProspect(payload: any): Observable<any> {
    const url = `${this.pdTarif}/vdp/prospecto`;
    return this.http
      .post(url, payload)
      .pipe(map((response: any) => response.data));
  }

  cumulus(nDocumento: any): Observable<any> {
    const url = `${this.plataformaDigitalApi}/VidaIndividual/cliente/cumulus/${nDocumento}`;
    return this.http.get(url).pipe(map((response: any) => response));
  }

  clientAdviser(payload: any): Observable<any> {
    const url = `${this.pdTarif}/vdp/prospecto/asesor`;
    return this.http
      .post(url, payload)
      .pipe(map((response: any) => response.data));
  }
  documentInformation(
    payload: IDocumentInformationRequest
  ): Observable<DocumentInformationModel> {
    const url = `${this.plataformaDigitalApi}/cliente`;
    return this.http.post(url, payload).pipe(
      map(
        (response: any) =>
          new DocumentInformationModel({
            ...response.data,
            idTipoDocumento: payload.idTipoDocumento,
            numeroDocumento: payload.numeroDocumento,
          }) as DocumentInformationModel
      )
    );
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
