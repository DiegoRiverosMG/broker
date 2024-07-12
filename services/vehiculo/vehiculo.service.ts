import { Auto } from '../../models/auto/auto.model';
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ApiService } from '@shared/services/api.service';
import { Observable } from 'rxjs/Observable';
import { map } from "rxjs/operators";
import { AppConfig } from "@root/app.config";

@Injectable()
export class VehiculoService {
  private headers = new HttpHeaders({ 'Content-Type': 'application/json' });
  private readonly apiUrl: string = AppConfig.WSPD_API;

  constructor(private http: HttpClient,
              private api: ApiService) {
  }

  getClases(filter: any) {
    const endpoint = 'classe/classByModel';
    // const action = 'getclasse';
    const url = `${endpoint}`;
    const data = JSON.stringify(filter);

    return this.api.postHeader(url, data, this.headers);
  }

  getMarcasWithoutClass(filter: any) {
    const endpoint = 'brand';
    const url = `${endpoint}`;
    const data = JSON.stringify(filter);
    return this.api.postHeader(url, data, this.headers);
  }

  getMarcas(filter: any) {
    const endpoint = 'brand/';
    const url = `${endpoint}`;
    const data = JSON.stringify(filter);
    return this.api.postHeader(url, data, this.headers);
  }

  getModelosWithoutClass(filter: any) {
    const endpoint = 'model';
    const url = `${endpoint}`;
    const data = JSON.stringify(filter);

    return this.api.postHeader(url, data, this.headers);
  }

  getModelos(filter: any) {
    const endpoint = 'model/modelByBrand';
    // const action = 'getmodel';
    const url = `${endpoint}`; // ${action}/${marcaId}
    const data = JSON.stringify(filter);

    return this.api.postHeader(url, data, this.headers);
  }

  getZonasCirculacion(filter: any) {
    const endpoint = 'zone';
    // const action = 'getzone';
    const url = `${endpoint}`; // /${action}
    const data = JSON.stringify(filter);

    return this.api.postHeader(url, data, this.headers);
  }

  getAsientos(idClase: string) {
    const url = `${this.apiUrl}/soat/asientos/clase/${idClase}`;
    return this.http.get(url).pipe(map((response: any) => response.data));
  }

  informacionPlaca(canalVenta: string, tipo: string, placa: string) {
    const endpoint = 'emission';
    const action = 'datosplaca';
    const url = `${endpoint}/${action}/${canalVenta}/${tipo}/${placa}`;
    return this.api.get(url);
  }

  carLicensePlateInformation(plate: string) {
    const url: string = `${this.apiUrl}/soat/datos/${plate}`;
    return this.http.get(url).pipe(
      map((response: any) => response.data?.vehiculo ?? {})
    );
  }

  getPlateInfo(plate: string): Observable<any> {
    const url: string = `${this.apiUrl}/soat/datos/${plate}`;
    return this.http.get(url).pipe(map((response: any) => response.data))
  }

  validarPlaca(tipo: string, placa: string) {
    const endpoint = 'emission';
    const action = 'validarplaca';
    const url = `${endpoint}/${action}/${tipo}/${placa}`;

    return this.api.get(url);
  }

  registrar(vehiculo: any) {
    const endpoint = 'auto';
    const data = JSON.stringify(vehiculo);

    return this.api.postHeader(endpoint, data, this.headers);
  }

  obtenerVehiculo(id): Observable<Auto> {
    const endpoint = 'auto';
    const url = `${endpoint}/${id}`;

    return this.api.get(url);
  }

  validarPlacaCampaign(codchannel: string, placa: string) {
    const endpoint = 'emission';
    const action = 'validarplacacampaign';
    const url = `${endpoint}/${action}/${codchannel}/${placa}`;

    return this.api.get(url);
  }

  getModelosPrincipales(filter: any) {
    const endpoint = 'model/modelsByBrandClass';
    const url = `${endpoint}`;
    const data = JSON.stringify(filter);
    return this.api.postHeader(url, data, this.headers);
  }

  ObtenerConfiguracion() {
    const endpoint = 'tool';
    const action = 'admindata';
    const url = `${endpoint}/${action}`;
    return this.api.get(url);
  }

  validarPlacaAuto(placa: string) {
    const URL = `Documents/use/regist/${placa}`;
    return this.api.get(URL);
  }

  infoPlacaFechaInicio(placa: string) {
    const url = `${this.apiUrl}/soat/datos/${placa}`;
    return this.http.get(url).pipe(map((response: any) => response.data));
  }
}
