import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AppConfig } from '../../../../../app.config';
import { ProductByUserRQ } from '../../../models/product/panel/Request/ProductByUserRQ';

@Injectable({
    providedIn: 'root'
})
export class ProductService {
    private headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    private Url = AppConfig.URL_API_SCTR;
    constructor(private http: HttpClient) { }

    public getProductByUser(data: ProductByUserRQ): Observable<any> {
        const request = JSON.stringify(data);
        return this.http.post(this.Url + '/Product/ProductsByUser', request, { headers: this.headers });
    }

    public getEps(): Observable<any> {
        return this.http.post(this.Url + '/Product/EpsKuntur', '', { headers: this.headers });
    }

    public getDataSctr(data: any): Observable<any> {
      const request = JSON.stringify(data);
      return this.http.post(this.Url + '/Product/DataSctr', request, { headers: this.headers });
  }
}
