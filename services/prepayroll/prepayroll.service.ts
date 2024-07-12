import { Injectable } from '@angular/core';
import { ApiService } from '../../../../shared/services/api.service';
import 'rxjs/add/operator/map';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/catch';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ConfigService } from '../../../../shared/services/general/config.service';
import { Prepayroll } from '../../models/prepayroll/prepayroll.model';
import { PrepayrollPayment } from '../../models/prepayroll/prepayroll-payment.model';
import { PrepayrollDetail } from '../../models/prepayroll/prepayroll-detail.model';

@Injectable()
export class PrepayrollService {
  private headers = new HttpHeaders({ 'Content-Type': 'application/json' });
  endpoint = 'prepayroll';
  _baseUrl = '';
  constructor(private api: ApiService,
    private configService: ConfigService,
    private http: HttpClient) {
    this._baseUrl = configService.getWebApiURL();
   }

  listar(filtros: any) {
    const url = `${this.endpoint}/list`;
    const data = JSON.stringify(filtros);

    return this.api.post(url, data);
  }

  registrar(preplanilla: any) {
    const url = `${this.endpoint}/register`;
    const data = JSON.stringify(preplanilla);

    return this.api.post(url, data);
  }

  GetPrePayRollGeneral(paryrollcab: Prepayroll) {
    const body = JSON.stringify(paryrollcab);
    return this.http.post(this._baseUrl + '/Prepayroll/getPrePayroll', body, { headers: this.headers })
    .map(
      response => response,
      error => {
        console.log(error);
      },
  );
}

  getPolizasPrePayroll(canal: string, pv: string, modalidad: string): Observable<any[]> {
    const endpoint = 'Certificado';
    const action = 'GetPolizasPrePayroll';
    const url = `${endpoint}/${action}/${canal}/${pv}/${modalidad}`;

    return this.api.get(url);
  }

  validar(preplanilla: any) {
    const url = `${this.endpoint}/validarPrePayRoll`;
    const data = JSON.stringify(preplanilla);

    return this.api.post(url, data);
  }


 
}
