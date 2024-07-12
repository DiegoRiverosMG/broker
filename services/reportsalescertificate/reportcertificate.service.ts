import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders } from '@angular/common/http';
import {ConfigService} from '../../../../shared/services/general/config.service';
import {ReportSalesCertificate} from '../../models/reportsalescertificate/reportsalescertificate';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';

@Injectable()
export class ReportSalesCertificateService{

  private headers = new HttpHeaders({'Content-Type': 'application/json'});
list : any[];
_baseUrl = '';
constructor(private http: HttpClient,
    private configService: ConfigService){
        this._baseUrl = configService.getWebApiURL();
}

getPostReportSalesCertificate(reportSalesCertificate: ReportSalesCertificate) {
    const body = JSON.stringify(reportSalesCertificate);

    return this.http.post(this._baseUrl + '/ReportCertificate/', body, {headers: this.headers})
                    .map(
                      response => response, 
                    error => {
                      console.log(error);
                    },
                  );
  }

}
