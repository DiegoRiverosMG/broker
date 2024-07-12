import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import { Certificado } from '../../models/certificado/certificado';
import { Poliza } from '../../models/poliza/poliza';
import { ApiService } from '../../../../shared/services/api.service';
import { HttpHeaders } from '@angular/common/http';
@Injectable()
export class Step04Service {
  private headers = new HttpHeaders({ 'Content-Type': 'application/json' });
  constructor(private api: ApiService) {}

  getPolizas(pv: string, canal: string, modalidad: string): Observable<any[]> {
    const endpoint = 'Certificado';
    const action = 'GetPolizas';
    const url = `${endpoint}/${action}/${canal}/${pv}/${modalidad}`;

    return this.api.get(url);
  }

  getCertificado(id: string): Observable<Certificado> {
    const endpoint = 'Certificado';
    const url = `${endpoint}/${id}`;

    return this.api.get(url);
  }

  saveCertificado(cer: Certificado): Observable<any> {
    const endpoint = 'Certificado';
    const data = JSON.stringify(cer);

    return this.api.postHeader(endpoint, data, this.headers);
  }

  saveCertificatePD(cer: Certificado): Observable<any> {
    const endpoint = 'certificado/certificadopd';
    const data = JSON.stringify(cer);

    return this.api.postHeader(endpoint, data, this.headers);
  }

  validarFechaVigencia(
    placa: string,
    fechaVegencia: string
  ): Observable<string> {
    const endpoint = 'emission';
    const action = 'vigencia';
    const url = `${endpoint}/${action}/${placa}/${fechaVegencia}`;
    return this.api.get(url);
  }
}
