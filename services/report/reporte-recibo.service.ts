/***********************************************************************************************/
/*  NOMBRE              :   reporte-recibo.Service.TS                                          */
/*  DESCRIPCION         :   Capa Services                                                      */
/*  AUTOR               :   MATERIAGRIS - JOSE ESPINOZA                                        */
/*  FECHA               :   30-12-2022                                                         */
/*  VERSION             :   1.0 - Generación de Reporte de Recibo                              */
/***********************************************************************************************/

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
    providedIn: 'root'
})
export class ReporteReciboService {

    private headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    private url = AppConfig.URL_API_SCTR;

    constructor(private http: HttpClient) {}

    public getBranchTypesList(): Observable<any> {
        return this.http.get<any[]>(this.url + '/ReceiptReport/ListarRamos');
    }

    public GenerarReporteRecibosSCTR(data: any): Observable<any> {
        const body = JSON.stringify(data);
        return this.http.post(this.url + '/ReceiptReport/GenerarReporteRecibosSCTR', body, { headers: this.headers }); 
    }

}