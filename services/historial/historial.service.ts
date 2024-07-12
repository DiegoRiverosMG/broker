import { PdfDigitalReenvio } from './../../models/historial/pdfdigitalreenvio';
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ConfigService } from '../../../../shared/services/general/config.service';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import { Historial } from '../../models/historial';
import { UtilityService } from '../../../../shared/services/general/utility.service';
import { ApiService } from '../../../../shared/services/api.service';

@Injectable()
export class HistorialService {
  private headers = new HttpHeaders({ 'Content-Type': 'application/json' });
  list: any = [];
  _baseUrl = '';

  constructor(
    private http: HttpClient,
    private configService: ConfigService,
    private api: ApiService,
    private utilityService: UtilityService
  ) {
    this._baseUrl = this.configService.getWebApiURL();
  }

  getHistorial(historial: Historial) {
    const body = JSON.stringify(historial);
    return this.http
      .post(this._baseUrl + '/Ventas', body, { headers: this.headers })
      .map(
        response => response, // .json(),
        error => {
          console.log(error);
        }
      );
  }

  getCertificadoSoatElectronico(Placa: string, NumeroDocumento: string, TipoDocumento: number) {
    return this.http
      .post(
        this._baseUrl + '/CertificadoElectronico/getCertificadoSoatElectronico',
        { Placa: Placa, NumeroDocumento: NumeroDocumento, TipoDocumento: TipoDocumento }
      )
      .map(response => response,
        error => {
          console.log(error);
        });
  }

  InsPdfDigitalReenvio(pdfDigitalReenvio: PdfDigitalReenvio) {
    const body = JSON.stringify(pdfDigitalReenvio);
    return this.http
      .post(this._baseUrl + '/Ventas/PdfDigitalReenvio', body, {
        headers: this.headers
      })
      .map(
        response => response,
        error => {
          console.log(error);
        }
      );
  }

  DownloadPolicyPdf(historial: any) {
    const body = JSON.stringify(historial);
    return this.http
      .post(this._baseUrl + '/Ventas/DownloadPolicyPdf', body, {
        headers: this.headers
      })
      .map(
        response => response,
        error => {
          console.log(error);
        }
      );
  }
}
