import { Injectable } from "@angular/core";
import { AppConfig } from "../../../../app.config";
import { HttpHeaders, HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class DemandProcessService {
  private headers = new HttpHeaders({ "Content-Type": "application/json" });
  private url = AppConfig.URL_API_SCTR;
  constructor(private http: HttpClient) { }

  public updateDemandState(data: any): Observable<any> {
    const body = JSON.stringify(data);
    return this.http.post(this.url + "/DemandProcessManager/UpdateDemandState", body, {
        headers: this.headers
    });
  }

  public ExecuteServiceSunat(data: any): Observable<any> {
    const body = JSON.stringify(data);
    return this.http.post(this.url + "/DemandProcessManager/ExecuteServiceSunat", body, {
        headers: this.headers
    });
  }

  public GetDemandProcessList(data: any): Observable<any> {
    const body = JSON.stringify(data);
    return this.http.post(this.url + '/DemandProcessManager/GetDemandProcessList', body , {
        headers: this.headers
    });
}
}
