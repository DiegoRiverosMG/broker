import { Injectable } from '@angular/core';
import { ConfigService } from '../../../../shared/services/general/config.service';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Campaign } from '../../models/campaign/campaign';
import { CampaignFilter } from '../../models/campaign/camaign-filter';
import { CampaignAll } from '../../models/campaignall/campaignall';
import { ApiService } from '../../../../shared/services/api.service';
import { CampaignRenov } from '../../models/campaignrenov/campaignrenov';

@Injectable()
export class CampaignService {
  private headers = new HttpHeaders({ 'Content-Type': 'application/json; charset=UTF-8' });
  _baseUrl = '';
  constructor(private configService: ConfigService,
    private http: HttpClient,
    private api: ApiService) {
    this._baseUrl = configService.getWebApiURL();
  }

  getPostListCampaign(Filter: CampaignFilter) {
    const body = JSON.stringify(Filter);
    return this.http
      .post(this._baseUrl + '/Campaign/', body, { headers: this.headers })
      .map(
        response => response,
        error => {
          console.log(error);
        }
      );
  }


  addPostCampaign(Parametros: CampaignAll) {
    const body = JSON.stringify(Parametros);
    return this.http
      .post(this._baseUrl + '/Campaign/AddCampaign', body, { headers: this.headers })
      .map(
        response => response,
        error => {
          console.log(error);
        }
      );
  }

  updPostCampaign(Parametros: CampaignAll) {
    const body = JSON.stringify(Parametros);
    // return this.http
    //   .post(this._baseUrl + '/Campaign/UpdCampaign', body, { headers: this.headers })
    //   .map(
    //     response => response,
    //     error => {
    //       console.log(error);
    //     }
    //   );

    const endpoint = 'Campaign/UpdCampaign';
    return this.api.postHeader(endpoint, body, this.headers);


  }

  getPostAnularCampaign(campaign: CampaignFilter) {
    const body = JSON.stringify(campaign);
    return this.http.post(this._baseUrl + '/Campaign/AnularCampaign', body, { headers: this.headers })
      .map(
        response => response,
        error => {
          console.log(error);
        },
      );
  }

  getCampaignById(Filter: Campaign) {
    const body = JSON.stringify(Filter);
    return this.http
      .post(this._baseUrl + '/Campaign/GetCampaignById', body, { headers: this.headers })
      .map(
        response => response,
        error => {
          console.log(error);
        }
      );
  }

  getCampaignPlan(Filter: Campaign) {
    const body = JSON.stringify(Filter);
    return this.http
      .post(this._baseUrl + '/Campaign/GetCampaignPlan', body, { headers: this.headers })
      .map(
        response => response,
        error => {
          console.log(error);
        }
      );
  }

  getCampaignRenov(Filter: Campaign) {
    const body = JSON.stringify(Filter);
    return this.http
      .post(this._baseUrl + '/Campaign/GetCampaignRenov', body, { headers: this.headers })
      .map(
        response => response,
        error => {
          console.log(error);
        }
      );
  }


  ValidarDocumentos(Parametros: CampaignRenov) {
    const body = JSON.stringify(Parametros);
    const endpoint = 'Campaign/ValidarDocumentos';
    return this.api.postHeader(endpoint, body, this.headers);
  }

}
