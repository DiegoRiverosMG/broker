import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AppConfig } from '../../../../app.config';

@Injectable({
  providedIn: 'root'
})
export class TransactService {
  private headers = new HttpHeaders({ 'Content-Type': 'application/json' });
  private Url = AppConfig.URL_API_SCTR;

  constructor(private http: HttpClient) { }

  public InsUpdTransact(data: FormData): Observable<any> {
    return this.http
      .post(
        this.Url + '/TransactManager/InsUpdTransact', data);
  }

  public GetStatusListTransact(): Observable<any> {
    return this.http.post(this.Url + '/TransactManager/GetStatusListTransact', null);
  }

  public GetTransactList(data: any): Observable<any> {
    const body = JSON.stringify(data);
    return this.http.post(this.Url + '/TransactManager/GetTransactList', body, {
      headers: this.headers
    });
  }

  public GetHistTransact(data: any): Observable<any> {
    const body = JSON.stringify(data);
    return this.http.post(this.Url + '/TransactManager/GetHistTransact', body, {
      headers: this.headers
    });
  }

  public GetUsersTransact(data: any): Observable<any> {
    const body = JSON.stringify(data);
    return this.http.post(this.Url + '/TransactManager/GetUsersTransact', body, {
      headers: this.headers
    });
  }

  public AsignarTransact(data: any): Observable<any> {
    return this.http
      .post(
        this.Url + '/TransactManager/AsignarTransact', data);
  }

  public InsertDerivarTransact(data: any): Observable<any> {
    return this.http
      .post(
        this.Url + '/TransactManager/InsertDerivarTransact', data);
  }

  public InsertHistTransact(data: any): Observable<any> {
    return this.http
      .post(
        this.Url + '/TransactManager/InsertHistTransact', data);
  }

  public GetInfoTransact(data: any): Observable<any> {
    const body = JSON.stringify(data);
    return this.http.post(this.Url + '/TransactManager/GetInfoTransact', body, {
      headers: this.headers
    });
  }
  public GetExcelTransactList(data: any): Observable<any> {
    const body = JSON.stringify(data)
    return this.http.post<string>(this.Url + "/TransactManager/GetExcelTransactList", body, { headers: this.headers })
  }
  public GetInfoLastTransact(data: any): Observable<any> {
    const body = JSON.stringify(data);
    return this.http.post(this.Url + '/TransactManager/GetInfoLastTransact', body, {
      headers: this.headers
    });
  }

  public UpdateBroker(data: FormData): Observable<any> {
    return this.http
      .post(

        this.Url + '/TransactManager/UpdateBroker', data);
  }
  public ValidateAccess(data: any): Observable<any> {
    const body = JSON.stringify(data);
    return this.http.post(this.Url + '/TransactManager/ValidateAccess', body, {
      headers: this.headers
    });
  }

  public ValidateAccessDes(data: any): Observable<any> {
    const body = JSON.stringify(data);
    return this.http.post(this.Url + '/TransactManager/ValidateAccessDes', body, {
      headers: this.headers
    });
  }

  public GetVigenciaAnterior(data: any): Observable<any> {
    const body = JSON.stringify(data);
    return this.http.post(this.Url + '/TransactManager/GetVigenciaAnterior', body, {
      headers: this.headers
    });
  }

  public FinalizarTramite(data: any): Observable<any> {
    const body = JSON.stringify(data);
    return this.http.post(this.Url + '/TransactManager/FinalizarTramite', body, {
      headers: this.headers
    });
  }

  public AnularTramite(data: any): Observable<any> {
    return this.http
      .post(
        this.Url + '/TransactManager/AnularTramite', data);
  }

  public getPerfilTramiteOpe(data: any): Observable<any> {
    const body = JSON.stringify(data);
    return this.http.post(this.Url + '/TransactManager/PerfilTramiteOpe', body, {
      headers: this.headers
    });
  }

  public getPerfilComercialEx(data: any): Observable<any> {
    const body = JSON.stringify(data);
    return this.http.post(this.Url + '/TransactManager/PerfilComercialEx', body, {
      headers: this.headers
    });
  }
  public EnvioEmail(data: any): Observable<any> {
    const body = JSON.stringify(data);
    return this.http.post(this.Url + '/TransactManager/EnvioEmail', body, {
      headers: this.headers
    });
  }
  public ReassignMail(data: any): Observable<any> {
    const body = JSON.stringify(data);
    return this.http.post(this.Url + '/TransactManager/UpdateMail', body, {
      headers: this.headers
    });
  }

  public InsReingresarTransact(data: FormData): Observable<any> {
    return this.http
      .post(
        this.Url + '/TransactManager/InsReingresarTransact', data);
  }
  public getMotivRechazoTransact() {
    const url = this.Url + '/TransactManager/MotivoRechazoTransact';
    return this.http.get(url);
  }

  public ValidarRechazoEjecutivo(data: any): Observable<any> {
    return this.http
      .post(
        this.Url + '/TransactManager/ValidarRechazoEjecutivo', data, {
          headers :this.headers
        });
  }

}
