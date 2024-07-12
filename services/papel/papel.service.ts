import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { HttpClient, HttpHeaders, HttpClientModule } from '@angular/common/http';
import { AppConfig } from '../../../../app.config';
import { AuthenticationService } from '../authentication.service';
import { Papel } from '../../models/papel/papel';


@Injectable()
export class PapelService {

  httpOption: HttpClientModule;
  headers: HttpHeaders;

  constructor(
    private http: HttpClient,
    private authenticationService: AuthenticationService,
    private config: AppConfig) {
    // Agregar encabezado de autorización con token jwt
    const httpOption = { headers: new HttpHeaders({ 'Authorization': 'Bearer ' + this.authenticationService.token }) };
    const headers = new HttpHeaders().set('content-type', 'application/json');
  }

  getVentaPapel(canal: string, puntoVenta: string): Observable<Papel> {
    const url = `${canal}/${puntoVenta}`;
    // console.log('URL : ' + this.config.apiUrl + '/Ventas/GetVentaPapel/' + url);
    return this.http.get<Papel>(this.config.apiUrl + '/Ventas/GetVentaPapel/' + url, this.httpOption);
  }




}
