import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { AppConfig } from "../../../../app.config";
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CommissionChannelReportService {
  private headers = new HttpHeaders({ "Content-Type": "application/json" });
  private Url = AppConfig.URL_API_SCTR;

  constructor(private http: HttpClient) { }

  getCommissionChannelReport(data: any): Observable<any> {
    const request = JSON.stringify(data);
    return this.http.post(this.Url + "/ReportKuntur/commissionChannelReport", request, { headers: this.headers });
  }
}
