import { Injectable } from '@angular/core';
import { of } from 'rxjs';
import { delay, map } from 'rxjs/operators';
import { PortalTramitesService } from './portal-tramites.service';
import { AppConfig } from '@root/app.config';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class SeleccionPolizaService {
  private urlApi: string;

  constructor(
    private readonly _portalTramitesService: PortalTramitesService,
    private readonly _htpp: HttpClient
  ) {
    this.urlApi = AppConfig.PD_API;
  }

  listadoPolizas(_: any) {
    const request = {
      codigoCanal: _.channelCode || 0,
      idTipoDocumento: _.documentType || 0,
      numeroDocumento: _.documentNumber || null,
      poliza: _.policy || 0,
      placa: _.licensePlate || null,
      fechaInicio: _.startDate,
      fechaFin: _.endDate,
      pagina: _.currentPage,
      cantidadRegistros: 10,
    };
    const url = `${this.urlApi}/tramite/ventas`;
    return this._htpp.post(url, request).map((response) => response);
  }
}
