import { Injectable } from '@angular/core';
import { ConfigService } from '../../../../shared/services/general/config.service';
import 'rxjs/add/operator/map';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/catch';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { CommissionLotAttach } from '../../models/commissionlot/commissionlotattach';
import { ApiService } from '../../../../shared/services/api.service';

@Injectable()
export class FileUploadService {

  private headers = new HttpHeaders({ 'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8' });
  //private headers = new HttpHeaders({ 'Content-Type': 'undefined' });
  list: any = [];
  _baseUrl = '';
  constructor(private http: HttpClient,
    private configService: ConfigService,
    private api: ApiService,
  ) {
    this._baseUrl = configService.getWebApiURL();
  }

}