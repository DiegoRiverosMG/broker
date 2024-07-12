import { ApiService } from './../../../../shared/services/api.service';
import { HttpClient } from '@angular/common/http';
import { ConfigService } from './../../../../shared/services/general/config.service';
import { Injectable } from '@angular/core';
import { Turno, FormaDePago } from '../../models/delivery/delivery';

@Injectable()
export class DeliveryService {

  _baseUrl = '';

  constructor(
    private configService: ConfigService,
    private http: HttpClient) {
    this._baseUrl = this.configService.getWebApiURL();
  }

  getDatosDelivery(tipo: string) {
    const endpoint = 'codechannel';
    const action = 'obtenerdatosdelivery';
    const url = `/${endpoint}/${action}/${tipo}`;
    return this.http.get(this._baseUrl + url).map(
      response => response,
      error => {
        console.log(error);
      });
  }

}
