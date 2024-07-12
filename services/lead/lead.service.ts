import { Injectable } from '@angular/core';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import { HttpClient } from '@angular/common/http';
import { AppConfig } from '@root/app.config';
import 'rxjs/add/operator/catch';
import { Features } from '../../models/features';
import { Observable } from 'rxjs/Observable';
import { map } from 'rxjs/operators';


@Injectable()
export class LeadService {
  public token: string;
  public firstName: string;
  public lastName: string;
  public canal: string;
  public puntoVenta: string;
  public desCanal: string;
  public desPuntoVenta: string;
  public tipoCanal: string;
  public menu: Features[] = [];

  private readonly wsdpAPI: string = AppConfig.WSPD_API;

  constructor(
    private http: HttpClient,
    private config: AppConfig
  ) {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    this.token = currentUser && currentUser.token;
  }


  getLeadsSoat(StartDate: string, EndDate: string) {
    return this.http
      .post(
        this.config.apiUrl + '/lead/getLeadsSoat',
        {StartDate: StartDate, EndDate: EndDate}
      )
      .map(response => response,
        error => {
          console.log(error);
        });
  }

  getLeadsVidaLey(StartDate: string, EndDate: string) {
    return this.http
      .post(
        this.config.apiUrl + '/lead/getLeadsVidaLey',
        {StartDate: StartDate, EndDate: EndDate}
      )
      .map(response => response,
        error => {
          console.log(error);
        });
  }

  getLeadsAP(payload: { fechaInicio: string, fechaFin: string }): Observable<any[]> {
    const url: string = `${this.wsdpAPI}/accidentesPersonales/getLeads`;
    return this.http.post(url, {
      ...payload,
      noBase64: true
    }).pipe(map((response: any) => response.data.listadoCotizaciones ?? []));
  }
}
