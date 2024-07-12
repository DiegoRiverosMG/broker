import { HttpHeaders, HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { ApiService } from '@shared/services/api.service';
import { AppConfig } from '@root/app.config';
import * as SDto from './DTOs/step05.dto';
import * as CDto from '../../components/step05/DTOs/step05.dto';

@Injectable()
export class Step05Service {
  private headers = new HttpHeaders({ 'Content-Type': 'application/json' });
  private API_URI: string;
  private API_WSPD: string;

  constructor(private api: ApiService, private readonly _htpp: HttpClient) {
    this.API_URI = AppConfig.PD_API;
    this.API_WSPD = AppConfig.WSPD_API;
  }

  getCanalTipoPago(channel: string, settings: string) {
    const endpoint = 'codechannel';
    const action = 'obtenertipopagocanal';
    const url = `${endpoint}/${action}/${channel}/${settings}`;
    return this.api.get(url);
  }

  getListaCanalesAll() {
    const endpoint = 'codechannel';
    const action = 'obtenercanalesall';
    const url = `${endpoint}/${action}`;
    return this.api.get(url);
  }

  getDocumentsOfUsoAuto(
    idUso: number | string
  ): Observable<SDto.DocumentOfUsoAutoDto[]> {
    const URL = `${this.API_URI}/Documents/use/${idUso}`;
    const GET$ = this._htpp.get(URL);
    const DATA$: Observable<SDto.DocumentOfUsoAutoDto[]> = new Observable(
      (obs) => {
        GET$.subscribe(
          (res: SDto.DocumentOfUsoAutoDto[]) => {
            obs.next(res);
            obs.complete();
          },
          (err: any) => {
            obs.error(err);
          }
        );
      }
    );
    return DATA$;
  }

  enviarDocsToAprobacion(data: CDto.SendAprobacionDocsDto): Observable<any> {
    const formData = new FormData();
    data.adjuntos.forEach((e) => {
      formData.append('fileattach', e.nombreArchivo);
      e.nombreArchivo = e.nombreArchivo.name;
    });
    formData.append('data', JSON.stringify(data));
    const URL = `${this.API_URI}/Documents/use/save`;
    const POST$ = this._htpp.post(URL, formData);
    const DATA$: Observable<any> = new Observable((obs) => {
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

  verResumenEmision(id): Observable<SDto.ResumenDocumentEmisionDto> {
    const URL = `${this.API_URI}/Emission/metadata/${id}`;
    const GET$ = this._htpp.get(URL);
    const DATA$: Observable<SDto.ResumenDocumentEmisionDto> = new Observable(
      (obs) => {
        GET$.subscribe(
          (res: SDto.ResumenDocumentEmisionDto) => {
            obs.next(res);
            obs.complete();
          },
          (err: any) => {
            obs.error(err);
          }
        );
      }
    );
    return DATA$;
  }

  aceptTerms(data: any): Observable<any> {
    const URL = `${this.API_URI}/auto`;
    const dataBase64 = {
      data: btoa(data),
    };
    const POST$ = this._htpp.post(URL, data);
    const DATA$: Observable<any> = new Observable((obs) => {
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

  sendCotizacion(data: any): Observable<any> {
    return this.api.post('/Ecommerce/enviocotizacion', data);
  }
}
