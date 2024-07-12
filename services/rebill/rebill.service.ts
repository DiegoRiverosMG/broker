import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AppConfig } from '../../../../app.config';

@Injectable({
    providedIn: 'root'
})
export class RebillService {
    private headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    private Url = AppConfig.URL_API_SCTR;

    constructor(private http: HttpClient) { }

    public getReceiptBill(data: any): Observable<any> {
        const request = JSON.stringify(data);
        return this.http.post(
            this.Url + '/Cobranzas/GetReceiptBill', request, {
            headers: this.headers
        });
    }

    public insRebill(data: any): Observable<any> {
        const request = JSON.stringify(data);
        return this.http.post(
            this.Url + '/Cobranzas/InsertRebill', request, {
            headers: this.headers
        });
    }

    public getBranchList(): Observable<any> {
        return this.http.get<any[]>(this.Url + '/Rebill/ListarRamo');
    }

    public getPerfilList(): Observable<any> {
        return this.http.get<any[]>(this.Url + '/Rebill/ListarPerfil');
    }

    public getProductList(data: any): Observable<any> {
        const body = JSON.stringify(data);
        return this.http.post(this.Url + '/Rebill/ListarProducto', data, {
            headers: this.headers,
        });
    }

    public listPerPerfil(data: any): Observable<any> {
        const body = JSON.stringify(data);
        return this.http.post(this.Url + '/Rebill/listPerPerfil', data, {
            headers: this.headers,
        });
    }

    public guardar(data: any): Observable<any> {
        const body = JSON.stringify(data);
        return this.http.post(this.Url + '/Rebill/guardar', data, {
            headers: this.headers,
        });
    }

    public permisoPerfil(idata: any): Observable<any> {
        const data = JSON.stringify(idata);
        return this.http.post(
            this.Url + '/Rebill/permisoPerfil',
            data,
            {
                headers: this.headers,
            }
        );
    }

}