import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';

import { AuthenticationService } from './authentication.service';
import { User } from '../models';

import {HttpClient, HttpHeaders} from '@angular/common/http';

import { AppConfig } from '../../../app.config';

import { BaseService } from './base/base.service';


@Injectable()
export class UserService  extends BaseService {
    constructor(
            private http: HttpClient,
            private authenticationService: AuthenticationService,
            private config: AppConfig) {
            super();
    }

    getUsers(): Observable<User[]> {
        // Agregar encabezado de autorización con token jwt
        const  httpOption = {headers: new HttpHeaders ({'Authorization': 'Bearer ' + this.authenticationService.token})};
        return this.http.get<User[]>(this.config.apiUrl + '/user', httpOption)
                                                            .catch(this.handleError);
    }
}
