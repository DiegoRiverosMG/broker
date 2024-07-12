import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { AppConfig } from '@root/app.config';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class CommissionLotService {
  private readonly apiWspd = AppConfig.WSPD_API;
  private readonly apiPd = AppConfig.PD_API;

  constructor(private readonly http: HttpClient) {}

  getParameters(): Observable<{
    typesReceipts: Array<any>;
    typesBanks: Array<any>;
    accountTypes: Array<any>;
  }> {
    const url = `${this.apiWspd}/loteComisiones/parametros`;
    return this.http.get(url).pipe(
      map((response: any) => ({
        typesReceipts: response.data.tipoComprobante ?? [],
        typesBanks: response.data.tipoBanco ?? [],
        accountTypes: response.data.tipoCuenta ?? [],
      }))
    );
  }

  getCommissionLotList(
    payload: any
  ): Observable<{ totalItems: number; items: Array<any>; success: boolean }> {
    const url = `${this.apiWspd}/loteComisiones/listado/creadas`;
    return this.http.post(url, payload).pipe(
      map((response: any) => ({
        totalItems:
          (response.data.loteComisionesCreadas || [])[0]?.cantidadRegistros ??
          0,
        items: (response.data.loteComisionesCreadas || []).map(
          (value: any) => ({
            ...value,
            selected: payload.checkedAll,
          })
        ),
        success: response.data.success,
      }))
    );
  }

  getCommissionLotListReceivable(payload: any): Observable<any> {
    const url = `${this.apiWspd}/loteComisiones/listado/porCobrar`;
    return this.http.post(url, payload).pipe(
      map((response: any) => ({
        success: response.data.success,
        data:
          response.data.loteComisionesPorCobrar?.map((obj: any) => ({
            ...obj,
            checked: payload.checked,
          })) ?? [],
        totalItems: response.data.loteComisionesPorCobrar?.length ?? 0,
      }))
    );
  }

  getCommissionDetail(payload: any): Observable<any> {
    const url = `${this.apiWspd}/loteComisiones/listado/detalle`;
    return this.http.post(url, payload).pipe(
      map((response: any) => ({
        success: response.data.success,
        data:
          response.data.loteDetalle?.map((obj: any) => ({
            ...obj,
            checked: payload.checked,
          })) ?? [],
        totalItems: response.data.loteDetalle?.length ?? 0,
      }))
    );
  }

  getCommissionLotDetail(lotId: number): Observable<any> {
    const url = `${this.apiWspd}/loteComisiones/loteGenerado/${lotId}`;
    return this.http.get(url).pipe(map((response: any) => response.data));
  }

  saveCommissionLot(payload: any): Observable<any> {
    const fd = new FormData();
    fd.set(
      'data',
      JSON.stringify({
        ...payload.data,
        adjuntosLote: payload.adjuntosLote.map((obj: any) => ({
          tipoArchivo: obj.fileType,
        })),
      })
    );

    payload.adjuntosLote.forEach((e: any) => {
      fd.append('fileattach', e.file);
    });

    const url = `${this.apiWspd}/loteComisiones/registrar`;
    return this.http.post(url, fd).pipe(map((response: any) => response.data));
  }

  removeAttachment({ lotId, fileType }): Observable<any> {
    const url = `${this.apiWspd}/loteComisiones/eliminar/archivos/${lotId}/${fileType}`;
    return this.http.get(url).pipe(map((response: any) => response.data));
  }

  cancelLot({ lotId, userId }): Observable<any> {
    const url = `${this.apiWspd}/loteComisiones/anular/${lotId}/${userId}`;
    return this.http.get(url).pipe(map((response: any) => response.data));
  }

  validateXML({ data, file }): Observable<any> {
    const fd = new FormData();
    fd.set('CAB', JSON.stringify(data));
    fd.set('fileattach', file);

    const url = `${this.apiPd}/commissionlot/xml/validar`;
    return this.http.post(url, fd).pipe(map((response: any) => response));
  }

  validateDuplicationCommissions(payload: {
    idRamo: number;
    idProducto: number;
    idCanal: number;
    idUsuario: number;
    listaPolizas: Array<any>;
  }): Observable<any> {
    const url = `${this.apiWspd}/loteComisiones/obtener/notascredito`;
    return this.http
      .post(url, payload)
      .pipe(map((response: any) => response.data));
  }

  downloadExcel(payload: any): Observable<any> {
    const url = `${this.apiWspd}/loteComisiones/descargar/excel`;
    return this.http
      .post(url, payload)
      .pipe(map((response: any) => response.data));
  }
}
