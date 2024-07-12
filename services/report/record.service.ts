import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { AppConfig } from "../../../../app.config";
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RecordService {
  private headers = new HttpHeaders({ "Content-Type": "application/json" });
  private Url = AppConfig.URL_API_SCTR;

  constructor(private http: HttpClient) { }

  getSaleRecordReport(data: any): Observable<any> {
    const request = JSON.stringify(data);
    return this.http.post(this.Url + "/ReportKuntur/saleRecordReport", request, { headers: this.headers });
  }

}
