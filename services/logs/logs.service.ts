import { Injectable } from '@angular/core';
import { ConfigService } from '../../../../shared/services/general/config.service';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import { TableType } from '../../models/commissionlot/tabletype';
import { ApiService } from '../../../../shared/services/api.service';
import { LogsUsuarios } from '../../models/logs/logsUsuarios';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable()
export class LogsService {
  private headers = new HttpHeaders({ 'Content-Type': 'application/json' });
  list: any = [];
  _baseUrl = '';

  constructor(
    private http: HttpClient,
    private configService: ConfigService,
    private api: ApiService
  ) {
    this._baseUrl = configService.getWebApiURL();
  }

  getUsersByChannel(table: TableType) {
    const body = JSON.stringify(table);
    return this.http
      .post(this._baseUrl + '/tracking/geteventusers', body, {
        headers: this.headers
      })
      .map(
        response => response,
        error => {
          console.log(error);
        }
      );
  }

  getPagesByUser(usuario, canal) {
    const endpoint = 'tracking';
    const action = 'geteventpage';
    const url = `${endpoint}/${action}`;

    const IdUsuario = usuario;
    const IdCanal = canal;
    const data = {
      IdUsuario,
      IdCanal
    };
    return this.api.post(url, data, this.headers);
  }

  getEventLogs(objLogEvents: LogsUsuarios) {
    // console.log('ingreso a llamar al metodo');
    const body = JSON.stringify(objLogEvents);
    // console.log(body);
    return this.http
      .post(this._baseUrl + '/tracking/geteventlogs', body, {
        headers: this.headers
      })
      .map(
        response => response,
        error => {
          console.log(error);
        }
      );
  }
}
