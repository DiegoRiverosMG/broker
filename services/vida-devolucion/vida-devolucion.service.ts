import { Injectable } from '@angular/core';
import { AppConfig } from '@root/app.config';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import {
  IClienteInformationRequest,
  IClienteInformationResponse,
} from '../../../../shared/interfaces/document-information.interface';

@Injectable({
  providedIn: 'root',
})
export class VidaDevolucionService {
  private readonly plataformaDigitalApi: string = AppConfig.WSPD_API;

  constructor(private readonly http: HttpClient) {}

  get storage(): any {
    let session: any = sessionStorage.getItem(
      AppConfig.VIDADEVOLUCION_COMERCIAL_STORAGE
    );
    if (session) {
      try {
        session = JSON.parse(atob(session));
      } catch (error) {
        session = JSON.parse('{}');
      }
    }
    return session;
  }

  set storage(payload: any) {
    sessionStorage.setItem(
      AppConfig.VIDADEVOLUCION_COMERCIAL_STORAGE,
      btoa(
        JSON.stringify({
          ...this.storage,
          ...payload,
        })
      )
    );
  }

  get currentUser(): any {
    const user: any = JSON.parse(localStorage.getItem('currentUser') || '{}');
    return {
      ...user,
      comercial: +user['profileId'] == 191,
      soporte: +user['profileId'] == 192,
      analista: +user['profileId'] == 193,
      // supervisor: +user['profileId'] == 194,
      // jefeComercial: +user['profileId'] == 195,
      gerenteComercial: +user['profileId'] == 196,
      gerenteGeneral: +user['profileId'] == 197,
    };
  }

  getParameters(): Observable<any> {
    const url = `${this.plataformaDigitalApi}/vdp/parametros`;
    return this.http.get(url).pipe(map((response: any) => response.data));
  }

  getInformacion(
    payload: IClienteInformationRequest
  ): Observable<IClienteInformationResponse> {
    const url = `${this.plataformaDigitalApi}/vdp/informacion/cliente`;
    return this.http
      .post(url, payload)
      .pipe(map((response: any) => response.data));
  }
}
