import { Injectable } from '@angular/core';
import { HttpHeaders, HttpClient } from '@angular/common/http';
import { AppConfig } from '../../../../app.config';
import { Observable } from 'rxjs/Observable';
import { AuthenticationService } from '../../services';
import { map } from 'rxjs/operators';

const httpOption = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
};

@Injectable()
export class PasswordService {

  private wspdApi: string = AppConfig.WSPD_API;

  constructor(
    private http: HttpClient,
    private config: AppConfig,
    private authenticationService: AuthenticationService
  ) {}

  mHeaders = new HttpHeaders({
    'Content-Type': 'application/json',
  });

  verify(data: any): Observable<any> {
    const url = this.config.apiUrl + '/password/verify';

    return this.http.post(url, data, { headers: this.mHeaders }).map(
      (response) => {
        return response;
      },
      (error) => {
        console.log('error: ', error);

        return {
          success: false,
          message: 'Tuvimos un inconveniente realizando tu petición',
        };
      }
    );
  }

  sendRetrievePassword(model: any): Observable<any> {
    return this.http
      .post(
        this.config.apiUrl + '/password/send',
        {
          tipdoc: model.tipdoc,
          numdoc: model.numdoc,
        },
        { headers: this.mHeaders }
      )
      .map(
        (response) => {
          // console.log('success: ', response);

          return response;
        },
        (error) => {
          console.log('error: ', error);

          return {
            success: false,
            message: 'Tuvimos un inconveniente realizando tu petición',
          };
        }
      );
  }

  tiposDocumentos(): Observable<any> {
    return this.http
      .post(
        this.config.apiUrl + '/password/documents',
        {},
        { headers: this.mHeaders }
      )
      .map(
        (response) => {
          // console.log('success: ', response);

          return response;
        },
        (error) => {
          console.log('error: ', error);

          return {
            success: false,
            message: 'Tuvimos un inconveniente realizando tu petición',
          };
        }
      );
  }

  getTokenInfo(token: string): Observable<any> {
    return this.http
      .post(
        this.config.apiUrl + '/password/token_info',
        { idretrieve: token },
        { headers: this.mHeaders }
      )
      .map(
        (response) => {
          // console.log('success: ', response);

          return response;
        },
        (error) => {
          console.log('error: ', error);

          return {
            success: false,
            message: 'Tuvimos un inconveniente realizando tu petición',
          };
        }
      );
  }

  renewPassword(model: any): Observable<any> {
    return this.http
      .post(this.config.apiUrl + '/password/renew_pass', model, {
        headers: this.mHeaders,
      })
      .map(
        (response) => {
          // console.log('success: ', response);

          return response;
        },
        (error) => {
          console.log('error: ', error);

          return {
            success: false,
            message: 'Tuvimos un inconveniente realizando tu petición',
          };
        }
      );
  }

  changePassword(): Observable<any> {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    return this.http
      .post(
        this.config.apiUrl + '/password/changePass',
        {
          tipdoc: currentUser.tipdoc,
          numdoc: currentUser.numdoc,
          id: currentUser.id,
        },
        { headers: this.mHeaders }
      )
      .map(
        (response) => {
          // console.log('success: ', response);
          this.authenticationService.removeSession();
          return response;
        },
        (error) => {
          console.log('error: ', error);

          return {
            success: false,
            message: 'Tuvimos un inconveniente realizando tu petición',
          };
        }
      );
  }

  getToken(): Observable<string> {
    const url = `${this.wspdApi}/auth/token/480`;
    return this.http.get(url).pipe(map((response: any) => response.data.token));
  }

  removeToken(): Observable<any> {
    const url = `${this.wspdApi}/auth`;
    return this.http.delete(url).pipe(map((response: any) => response.data));
  }
}
