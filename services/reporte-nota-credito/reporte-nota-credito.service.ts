/**********************************************************************************************/
/*  NOMBRE              :   creditNote.Service.TS                                               */
/*  DESCRIPCION         :   Capa Services                                                       */
/*  AUTOR               :   MATERIAGRIS - FRANCISCO AQUIÑO RAMIREZ                              */
/*  FECHA               :   20-12-2021                                                          */
/*  VERSION             :   1.0 - Generación de NC - PD                                         */
/*************************************************************************************************/

import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import {
    HttpClient,
    HttpHeaders,
    HttpClientModule,
} from '@angular/common/http';
import { AppConfig } from '../../../../app.config';
import { formatDate } from '@angular/common';
import { Color, defaultColors } from 'ng2-charts';

@Injectable({
    providedIn: 'root',
})
export class ReporteNotaCreditoService {
    private headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    private Url = AppConfig.URL_API_SCTR;
    constructor(private http: HttpClient) { }

    /****************************/
    public ListarRamoPay(): Observable<any> {
        return this.http.get<any[]>(this.Url + '/ReporteNotaCredito/ListarRamo');
    }

    public GetProductPremiumReport(idata: any): Observable<any> {
        const data = JSON.stringify(idata);
        return this.http.post(
            this.Url + '/ReporteNotaCredito/GetProductsListByBranch',
            data,
            {
                headers: this.headers,
            }
        );
    }

    public ListarProductoPay(idata: any): Observable<any> {
        const data = JSON.stringify(idata);
        return this.http.post(
            this.Url + '/ReporteNotaCredito/ListarProducto',
            data,
            {
                headers: this.headers,
            }
        );
    }

    public ListarTipoConsulta(): Observable<any> {
        return this.http.get<any[]>(
            this.Url + '/ReporteNotaCredito/ListarTipoConsulta'
        );
    }

    public ListarNotaCredito(idata: any): Observable<any> {
        const data = JSON.stringify(idata);
        return this.http.post(
            this.Url + '/ReporteNotaCredito/ListarNotaCredito',
            data,
            {
                headers: this.headers,
            }
        );
    }
}
