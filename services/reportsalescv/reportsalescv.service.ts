import { Injectable } from '@angular/core';
import { ConfigService } from '../../../../shared/services/general/config.service';
import 'rxjs/add/operator/map';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/catch';
import { ReportSalesCV } from '../../models/reportsalescv/reportsalescv';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable()
export class ReportSalesCVService {

  private headers = new HttpHeaders({'Content-Type': 'application/json'});
  list: any = [];
  _baseUrl = '';

  constructor(private http: HttpClient,
    private configService: ConfigService
  ) {
    this._baseUrl = configService.getWebApiURL();
  }

  getPostReportSalesCV(reportSalesCV: ReportSalesCV) {
    const body = JSON.stringify(reportSalesCV);

    return this.http.post(this._baseUrl + '/ReportSalesCV/', body, {headers: this.headers})
                    .map(
                      response => response,
                    error => {
                      console.log(error);
                    },
                  );
  }

}
