import { Injectable } from '@angular/core';
import { ConfigService } from '../../../../shared/services/general/config.service';
import 'rxjs/add/operator/map';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/catch';
import { ReportComissCV } from '../../models/reportcomisscv/reportcomisscv';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ComisionDocument } from '../../models/reportcomisscv/comisiondocuments';

@Injectable()
export class ReportComissCVService {
  

  private headers = new HttpHeaders({'Content-Type': 'application/json'});
  list: any = [];
  _baseUrl = '';


  constructor(private http: HttpClient,
    private configService: ConfigService
  ) {
    this._baseUrl = configService.getWebApiURL();
  }
  

  
  getPostReportComissCV(reportCommisCV: ReportComissCV) {
    const body = JSON.stringify(reportCommisCV);

    return this.http.post(this._baseUrl + '/ReportComissChannel/', body, {headers: this.headers})
                    .map(
                      response => response,
                    error => {
                      console.log(error);
                    },
                  );
  }

}


