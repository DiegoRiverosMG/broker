import { Injectable } from '@angular/core';
import { ConfigService } from '../../../../shared/services/general/config.service';
import 'rxjs/add/operator/map';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/catch';
import { ReportSalesCF } from '../../models/reportsalescf/reportsalescf';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable()
export class ReportSalesCFService {

  private headers = new HttpHeaders({'Content-Type': 'application/json'});
  list: any = [];
  _baseUrl = '';

  constructor(private http: HttpClient,
    private configService: ConfigService
  ) {
    this._baseUrl = configService.getWebApiURL();
  }

  getPostReportSalesCF(reportSalesCF: ReportSalesCF) {
    const body = JSON.stringify(reportSalesCF);

    return this.http.post(this._baseUrl + '/ReportSalesCF/', body, {headers: this.headers})
                    .map(
                      response => response,
                    error => {
                      console.log(error);
                    },
                  );
  }

}
