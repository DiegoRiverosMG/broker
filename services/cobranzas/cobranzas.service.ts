import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import {
  HttpClient,
  HttpHeaders,
  HttpClientModule,
} from '@angular/common/http';
import { AppConfig } from '../../../../app.config';
import { AuthenticationService } from '../authentication.service';
import { ValidateLockRequest } from '../../models/collection/validate-lock-request';
import { ValidateLockReponse } from '../../interfaces/validate-lock-response';
import { ValidateDebtRequest } from '../../models/collection/validate-debt.request';
import { ValidateDebtReponse } from '../../interfaces/validate-debt-response';
import { GenAccountStatusRequest } from '../../models/collection/gen-account-status-request';
import { GenAccountStatusResponse } from '../../interfaces/gen-account-status-response';

@Injectable({
  providedIn: 'root'
})
export class CobranzasService {
  private headers = new HttpHeaders({ 'Content-Type': 'application/json' });
  private Url = AppConfig.URL_API_SCTR;
  constructor(private http: HttpClient) { }


  public getListRisk(): Observable<any> {
    const _params = {};
    return this.http.get(this.Url + '/Cobranzas/GetTypeRisk', {
      params: _params,
    });
  }

  public getListRestric(): Observable<any> {
    const _params = {};
    return this.http.get(this.Url + '/Cobranzas/GetTypeRestric', {
      params: _params,
    });
  }

  public getListCreditPolicie(data: any): Observable<any> {
    const body = JSON.stringify(data);
    return this.http.post(this.Url + '/Cobranzas/GetCreditPoliciesList', body, {
      headers: this.headers,
    });
  }

  public getListClientRestric(data: any): Observable<any> {
    const body = JSON.stringify(data);
    return this.http.post(this.Url + '/Cobranzas/GetStatusClientList', body, {
      headers: this.headers,
    });
  }
  public getClientInfoList(data: any): Observable<any> {
    const request = JSON.stringify(data);
    return this.http
      .post(
        this.Url + '/Cobranzas/GetClientInfoList', request, {
        headers: this.headers
      });
  }
  public getPrivilegiosClient(data: any): Observable<any> {
    const body = JSON.stringify(data);
    return this.http.post(this.Url + '/Cobranzas/GetClientPrivilegiosList', body, {
      headers: this.headers,
    });
  }

  public InsertCreditPolicie(data: any): Observable<any> {
    const body = JSON.stringify(data);
    return this.http.post(this.Url + '/Cobranzas/InsertCreditPolicies', body, {
      headers: this.headers,
    });
  }
  public InsertClientRestric(data: any): Observable<any> {
    const body = JSON.stringify(data);
    return this.http.post(this.Url + '/Cobranzas/InsertClientRestric', body, {
      headers: this.headers,
    });
  }

  public validateLock(request: ValidateLockRequest): Observable<ValidateLockReponse> {
    const body = JSON.stringify(request);
    return this.http.post(this.Url + '/Cobranzas/ValidateLock', body, {
      headers: this.headers
    });
  }

  public validateDebt(data: ValidateDebtRequest): Observable<ValidateDebtReponse> {
    const body = JSON.stringify(data);
    return this.http.post(this.Url + '/Cobranzas/ValidateDebt', body, {
      headers: this.headers
    });
  }

  public generateAccountStatus(data: GenAccountStatusRequest): Observable<GenAccountStatusResponse> {
    const body = JSON.stringify(data);
    return this.http.post(this.Url + '/Cobranzas/GenerateAccountStatus', body, {
      headers: this.headers
    });
  }
  public getTramaFile(data: any): Observable<any> {
    const body = JSON.stringify(data);
    return this.http.post(this.Url + '/Cobranzas/GetTramaMovimiento', body, {
      headers: this.headers
    });
  }

  public getTramaFileSCTR(data: any): Observable<any> {
    const body = JSON.stringify(data);
    return this.http.post(this.Url + '/Cobranzas/GetTramaMovimientoSCTR', body, {
      headers: this.headers
    });
  }

  public ValidateDebtPolicy(data: ValidateDebtRequest): Observable<ValidateDebtReponse> {
    const body = JSON.stringify(data);
    return this.http.post(this.Url + '/Cobranzas/ValidateDebtPolicy', body, {
      headers: this.headers
    });
  }

  public getTramaFileEndoso(data: any): Observable<any> {
    const body = JSON.stringify(data);
    return this.http.post(this.Url + '/Cobranzas/GetTramaEndoso', body, {
      headers: this.headers
    });
  }

  public getCoverDetail(data: any): Observable<any> {
    const body = JSON.stringify(data);
    return this.http.post(this.Url + '/Cobranzas/GetCoverDetail', body, {
      headers: this.headers
    });
  }
  
}


