import { Injectable } from '@angular/core';
import { ConfigService } from '../../../../shared/services/general/config.service';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import { ReportSalesPRO } from '../../models/reportsalespro/reportsalespro';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable()
export class ReportSalesPROService {

  private headers = new HttpHeaders({'Content-Type': 'application/json'});
  list: any = [];
  _baseUrl = '';

  constructor(private http: HttpClient,
    private configService: ConfigService
  ) {
    this._baseUrl = configService.getWebApiURL();
  }

  getPostReportSalesPRO(reportSalesPRO: ReportSalesPRO) {
    const body = JSON.stringify(reportSalesPRO);
    return this.http.post(this._baseUrl + '/ReportSalesProtecta/', body, {headers: this.headers})
                    .map(
                      response => response,
                    error => {
                      console.log(error);
                    },
                  );
  }
}
