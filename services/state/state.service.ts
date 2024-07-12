import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { State } from '../../models/state/state';
import { StateChannelType } from '../../models/state/statechanneltype';
import { ConfigService } from '../../../../shared/services/general/config.service';

@Injectable()
export class StateService {

  _baseUrl = '';
  private headers = new HttpHeaders({ 'Content-Type': 'application/json' });
  constructor(private http: HttpClient,
              private configService: ConfigService) {
    this._baseUrl = configService.getWebApiURL();
  }

  getState() {
    return this.http.get<State[]>(this._baseUrl + '/State');
  }

  GetStatexChannelType(stateChannelType: StateChannelType) {
    const body = JSON.stringify(stateChannelType);
    return this.http.post(this._baseUrl + '/State/getStatexChannelType', body, { headers: this.headers })
      .map(
        response => response,
        error => {
          console.log(error);
        },
    );
  }

  GetStatexChannelTypexStateAnt(stateChannelType: StateChannelType) {
    const body = JSON.stringify(stateChannelType);
    return this.http.post(this._baseUrl + '/State/getStatexChannelTypexStateAnt', body, { headers: this.headers })
      .map(
        response => response,
        error => {
          console.log(error);
        },
    );
  }
}
