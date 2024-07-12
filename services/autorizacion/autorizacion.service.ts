import { Injectable } from '@angular/core';
import * as SDto from './DTOs/autorizacion.dto';
import { Observable } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AppConfig } from '../../../../app.config';
@Injectable({
  providedIn: 'root'
})
export class AutorizacionService {
  private API_URI: string;
  private headers = new HttpHeaders({ 'Content-Type': 'application/json' });
  constructor(private readonly _http: HttpClient) {
    this.API_URI = AppConfig.PD_API;
  }
  getHistorialDocument(id: number): Observable<SDto.DocumentHistoryDto[]> {
    const URL = `${this.API_URI}/Documents/use/historial/${id}`;
    const GET$ = this._http.get(URL);
    const DATA$: Observable<SDto.DocumentHistoryDto[]> = new Observable(obs => {
      GET$.subscribe(
        (res: SDto.DocumentHistoryDto[]) => {
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
  getDocumentsUse(data: any): Observable<SDto.DocumentUsosDto[]> {
    const URL = `${this.API_URI}/Documents/use/list`;
    const POST$ = this._http.post(URL, data, { headers: this.headers });
    const DATA$: Observable<SDto.DocumentUsosDto[]> = new Observable(obs => {
      POST$.subscribe(
        (res: SDto.DocumentUsosDto[]) => {
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
  aprobarRechazarSolicitud(data: any): Observable<any> {
    const URL = `${this.API_URI}/Documents/use/update`;
    const dataBase64 = {
      data: btoa(JSON.stringify(data))
    };
    const POST$ = this._http.post(URL, dataBase64);
    const DATA$ = new Observable(obs => {
      POST$.subscribe(
        (res: any) => {
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
  verDocumentosSubidos(id): Observable<SDto.DocumentosSubidosDto[]> {
    const URL = `${this.API_URI}/Documents/use/attachments/${id}`;
    const GET$ = this._http.get(URL);
    const DATA$: Observable<SDto.DocumentosSubidosDto[]> = new Observable(obs => {
      GET$.subscribe(
        (res: SDto.DocumentosSubidosDto[]) => {
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
  anularSolicitud(id): Observable<any> {
    const URL = `${this.API_URI}/anular/${id}`;
    const GET$ = this._http.get(URL);
    const DATA$ = new Observable(obs => {
      GET$.subscribe(
        (res: any) => {
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
}
