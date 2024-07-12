/**********************************************************************************************/
/*  NOMBRE              :   rebillReport.Service.TS                                               */
/*  DESCRIPCION         :   Capa Services                                                       */
/*  AUTOR               :   MATERIAGRIS - FRANCISCO AQUIÑO RAMIREZ                              */
/*  FECHA               :   01-11-2023                                                          */
/*  VERSION             :   1.0                                                                 */
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

export class ReporteRebillService {
    private headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    private Url = AppConfig.URL_API_SCTR;
    constructor(private http: HttpClient) { }

    public listarRamo(): Observable<any> {
        return this.http.get<any[]>(this.Url + '/ReporteRebill/listarRamo');
    }

    public permisoUser(idata: any): Observable<any> {
        const data = JSON.stringify(idata);
        return this.http.post(
            this.Url + '/ReporteRebill/permisoUser',
            data,
            {
                headers: this.headers,
            }
        );
    }

    public tipoDocumento(): Observable<any> {
        return this.http.get<any[]>(this.Url + '/ReporteRebill/tipoDocumento');
    }

    public listarProducto(idata: any): Observable<any> {
        const data = JSON.stringify(idata);
        return this.http.post(
            this.Url + '/ReporteRebill/listarProducto',
            data,
            {
                headers: this.headers,
            }
        );
    }

    public listarRefact(idata: any): Observable<any> {
        const data = JSON.stringify(idata);
        return this.http.post(
            this.Url + '/ReporteRebill/listarRefact',
            data,
            {
                headers: this.headers,
            }
        );
    }

}