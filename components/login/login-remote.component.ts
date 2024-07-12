import { Component, OnInit, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { AppConfig } from '../../../../app.config';
import { AuthenticationService } from '../../services/authentication.service';
import { RecaptchaComponent } from 'ng-recaptcha';
import { environment } from '../../../../../environments/environment';
import { SidebarService } from '../../../../shared/services/sidebar/sidebar.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { switchMap } from 'rxjs/operators';
import { sortArray } from '../../../../shared/helpers/utils';
import { ProductByUserRQ } from '../../models/product/panel/Request/ProductByUserRQ';
import { ProductService } from '../../services/product/panel/product.service';

@Component({
  template: '',
  selector: 'app-login-remote'
})
export class LoginRemoteComponent implements OnInit {
  productByUser = new ProductByUserRQ();
  productList: any = [];
  profile_admin = AppConfig.PROFILE_ADMIN_SOAT;

  constructor(private readonly route: ActivatedRoute,
    private readonly router: Router,
    private authenticationService: AuthenticationService,
    private sidebarService: SidebarService,
    private productService: ProductService) { }

  ngOnInit() {

    this.route.queryParams.subscribe(params => {
      if (!!params.p && !!params.u) {
        this.authenticate(params.u, params.p);
      } else {
        this.gotoLogin();
      }
    });
  }
  authenticate(username, password) {
    this.authenticationService.login(username, password, true)
      .subscribe(
        result => {
          if (result === true) {
            this.getDataSctr();
          } else {
            this.gotoLogin();
          }
        },
        error => {
          this.gotoLogin();
        });
  }

  gotoLogin() {
    this.router.navigate(['extranet/login']);
  }

  async getDataSctr() {
    this.productByUser.P_NIDUSER = JSON.parse(localStorage.getItem('currentUser'))['id'];

    await this.productService.getDataSctr(this.productByUser).toPromise().then(
      async res => {
        if (res !== null) {
          // Productos configurados
          await this.getProducts(res.productList);
          // Eps Configurados
          await this.getEps(res.epsList);
          // Arma el menu
          await this.getMenu(res.productUserList);
        } else {
          // this.error = 'Usuario o clave incorrectos.';
          // this.loading = false;
          // this.spinner.hide();
        }
      }, error => {
        // this.error = 'Usuario o clave incorrectos.';
        // this.loading = false;
        // this.spinner.hide();
      });
  }

  async getEps(res: any) {
    sessionStorage.setItem('epsKuntur', JSON.stringify(res));
    localStorage.setItem('eps', JSON.stringify(res[0]));
    //sessionStorage.setItem('eps', JSON.stringify(res[0]));
  }

  async getProducts(res: any) {
    res.forEach(item => {
      if (item.TIP_PRODUCT === 'SCTR_PEN') {
        localStorage.setItem('pensionID', JSON.stringify({ id: item.COD_PRODUCT.toString() }));
      }
      if (item.TIP_PRODUCT === 'SCTR_SAL') {
        localStorage.setItem('saludID', JSON.stringify({ id: item.COD_PRODUCT.toString() }));
      }
      if (item.TIP_PRODUCT === 'VIDA_LEY') {
        localStorage.setItem('vidaleyID', JSON.stringify({ id: item.COD_PRODUCT.toString() }));
      }
      if (item.TIP_PRODUCT === 'COVID_GRUPAL') {
        localStorage.setItem('covidID', JSON.stringify({ id: item.COD_PRODUCT.toString() }));
      }
    });
  }

  async getMenu(res: any) {
    const loProducts = sortArray(<any[]>res, 'NIDPRODUCT', 1);
    localStorage.setItem('productUser', JSON.stringify({ res: loProducts }));
    this.productList = res;
    this.navigateHome();
  }

  navigateHome() {
    this.sidebarService.close();
    localStorage.setItem(AppConfig.PROFILE_ADMIN_STORE, null);
    const user = JSON.parse(localStorage.getItem('currentUser'));
    if (this.profile_admin === user.profileId) {
      localStorage.setItem(AppConfig.PROFILE_ADMIN_GUID, '1');
      this.router.navigate(['extranet/login-profile'], { skipLocationChange: true });
    } else {
      localStorage.setItem(AppConfig.PROFILE_ADMIN_GUID, '0');
      this.router.navigate(['extranet/home'], { skipLocationChange: true });
    }
  }

}
