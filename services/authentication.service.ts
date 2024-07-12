import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AppConfig } from '../../../app.config';
import 'rxjs/add/operator/catch';
import { Features } from '../models/features';
import { isNullOrUndefined } from 'util';
import { SessionStorageService } from '../../../shared/services/storage/storage-service';
import { fromEvent, Subject } from 'rxjs';
import { filter, map } from 'rxjs/operators';

@Injectable()
export class AuthenticationService {
  public token: string;
  public firstName: string;
  public lastName: string;
  public canal: string;
  public puntoVenta: string;
  public desCanal: string;
  public desPuntoVenta: string;
  public tipoCanal: string;
  public menu: Features[] = [];
  private readonly urlApi = AppConfig.WSPD_API;

  constructor(
    private http: HttpClient,
    private config: AppConfig,
    private sessionStorageService: SessionStorageService
  ) {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    this.token = currentUser && currentUser.token;
  }

  login(
    username: string,
    password: string,
    isremote: boolean
  ): Observable<boolean> {
    return this.http
      .post(
        this.config.apiUrl +
          (isremote === true ? '/user/remotelogin' : '/user/authenticate'),
        { username: username, password: password },
        { observe: 'response' }
      )
      .map((response) => {
        const token = response.body && response.body['token'];
        const id = response.body && response.body['id'];
        const firstName = response.body && response.body['firstName'];
        const lastName = response.body && response.body['lastName'];
        const lastName2 = response.body && response.body['lastName2'];
        const email = response.body && response.body['email'];
        const canal = response.body && response.body['canal'];
        const puntoVenta = response.body && response.body['puntoVenta'];
        const indpuntoVenta = response.body && response.body['puntoVenta'];
        const desCanal = response.body && response.body['desCanal'];
        const desPuntoVenta = response.body && response.body['desPuntoVenta'];
        const tipoCanal = response.body && response.body['tipoCanal'];
        const tdocument = response.body && response.body['tipdoc'];
        const dni = response.body && response.body['numdoc'];
        const sclient = response.body && response.body['codCliente'];
        const menu = response.body && response.body['menu'];
        const brokerId = response.body && response.body['brokerId'];
        const intermediaId = response.body && response.body['intermediaId'];
        const profileId = response.body && response.body['profileId'];
        const permissionList = response.body && response.body['permissionList'];
        const flagCambioClave = response.body && +response.body['cambioClave'];
        const productoPerfil = response.body && response.body['productoPerfil'];
        const promotor = response.body && response.body['promotor'];
        const listProducts = response.body && response.body['bannerPrincipal'];
        if (token) {
          this.token = token;
          this.sessionStorageService.clearStorage();
          this.sessionStorageService.setItem('puntoVentaCliente', puntoVenta);
          this.sessionStorageService.setItem('canalVentaCliente', canal);

          localStorage.setItem(
            'currentUser',
            JSON.stringify({
              id: id,
              username: username,
              token: token,
              firstName: firstName,
              lastName: lastName,
              lastName2: lastName2,
              email: email,
              canal: canal,
              puntoVenta: puntoVenta,
              indpuntoVenta: indpuntoVenta,
              desCanal: desCanal,
              desPuntoVenta: desPuntoVenta,
              tipoCanal: tipoCanal,
              tdocument: tdocument,
              dni: dni,
              sclient: sclient,
              menu: menu,
              brokerId: brokerId,
              intermediaId: intermediaId,
              profileId: profileId,
              flagCambioClave: flagCambioClave,
              permissionList: permissionList,
              productoPerfil: productoPerfil,
              promotor: promotor,
              listProducts: listProducts,
              logoutEcommerce: true,
            })
          );
          return true;
        } else {
          return false;
        }
      });
  }

  public getToken(): string {
    let token = '';
    if (!isNullOrUndefined(JSON.parse(localStorage.getItem('currentUser')))) {
      token = JSON.parse(localStorage.getItem('currentUser'))['token'];
    }

    return token;
  }

  logout(): Observable<boolean> {
    return this.http.delete(this.urlApi + '/auth').pipe(
      map(
        (response: any) => {
          this.removeSession();
          return response.data.success;
        },
        (error: any) => {
          console.log(error);
        }
      )
    );
  }

  userStorage(): Observable<any> {
    return fromEvent<StorageEvent>(window, 'storage').pipe(
      filter((event) => event.storageArea === localStorage),
      filter((event) => event.key === 'currentUser'),
      map((event) => JSON.parse(event.newValue || '{}'))
    );
  }

  removeSession() {
    this.token = null;
    this.firstName = null;
    this.lastName = null;
    this.canal = null;
    this.puntoVenta = null;
    this.menu = null;
    this.desCanal = null;
    this.desPuntoVenta = null;
    this.tipoCanal = null;
    this.sessionStorageService.clearStorage();
  }

  getMenuProfile(NIDPROFILE: number, NIDPRODUCT: number): Observable<any> {
    return this.http
      .post(
        this.config.apiUrl + '/user/getmenuprofile',
        { NIDPROFILE: NIDPROFILE, NIDPRODUCT: NIDPRODUCT },
        { observe: 'response' }
      )
      .map((response) => {
        return response.body;
      });
  }
}
