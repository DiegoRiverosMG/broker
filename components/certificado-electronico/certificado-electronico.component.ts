import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { AppConfig } from '../../../../app.config';
import { AuthenticationService } from '../../services/authentication.service';
import { ClientInformationService } from '../../services/shared/client-information.service';
import { RecaptchaComponent } from 'ng-recaptcha';
import { environment } from '../../../../../environments/environment';
import { SidebarService } from '../../../../shared/services/sidebar/sidebar.service';
import { ProductService } from '../../services/product/panel/product.service';
import { ProductByUserRQ } from '../../models/product/panel/Request/ProductByUserRQ';
import { NgxSpinnerService } from 'ngx-spinner';
import { sortArray } from '../../../../shared/helpers/utils';
import { SessionStorageService } from '../../../../shared/services/storage/storage-service';
import { PasswordService } from '../../services/password/password.service';
@Component({
  selector: 'app-certificado-electronico',
  templateUrl: 'certificado-electronico.component.html',
  styleUrls: ['certificado-electronico.component.css']
})
export class CertificadoElectronicoComponent implements OnInit {
  productByUser = new ProductByUserRQ();
  model: any = {};
  loading = false;
  error = '';

  siteKey = AppConfig.CAPTCHA_KEY;
  bCaptchaValid = false;
  loginForm: FormGroup;
  productList: any = [];
  @ViewChild('captchaRef', { static: true }) recaptcha: RecaptchaComponent;

  profile_admin = AppConfig.PROFILE_ADMIN_SOAT;

  constructor(private sidebarService: SidebarService,
    private router: Router,
    private authenticationService: AuthenticationService,
    private clientService: ClientInformationService,
    private productService: ProductService,
    private formBuilder: FormBuilder,
    private sessionStorageService: SessionStorageService,
    private spinner: NgxSpinnerService,
    private appConfig: AppConfig,
    private passwordService: PasswordService) { }

  ngOnInit() {
    this.initComponent();
  }

  initComponent() {
    this.crearFormulario();
    this.sessionStorageService.clearStorage();
    this.spinner.hide();
  }

  crearFormulario() {
    this.loginForm = this.formBuilder.group({
      usuario: ['', [Validators.required]],
      clave: ['', [Validators.required]]
    });
  }

  setDatos() {
    this.model.username = this.loginForm.get('usuario').value;
    this.model.password = this.loginForm.get('clave').value;
  }

  async onLogin() {
    this.loading = true;
    this.spinner.show();
    this.setDatos();
    await this.authenticationService.login(this.model.username, this.model.password, false).toPromise().then(
      async result => {
        if (result === true) {
          if (JSON.parse(localStorage.getItem('currentUser'))['flagCambioClave']) {
            this.passwordService.changePassword().subscribe(
              rslt => {
                this.router.navigate(['extranet/renew-password'], { queryParams: { token: rslt.token } });
              },
              error => {
                this.loading = false;
                console.log('Error recuperando los tipos de documento: ', error);
              }
            );
          } else {
            await this.getDataSctr();
          }
        } else {
          this.error = 'Usuario o clave incorrectos.';
          this.loading = false;
        }
        this.spinner.hide();
      },
      error => {
        this.error = 'Usuario o clave incorrectos.';
        this.loading = false;
        this.spinner.hide();
      });
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
          this.error = 'Usuario o clave incorrectos.';
          this.loading = false;
          this.spinner.hide();
        }
      }, error => {
        this.error = 'Usuario o clave incorrectos.';
        this.loading = false;
        this.spinner.hide();
      });
  }

  async getEps(res: any) {
    sessionStorage.setItem('epsKuntur', JSON.stringify(res));
    //sessionStorage.setItem('eps', JSON.stringify(res[0]));
    localStorage.setItem('eps', JSON.stringify(res[0]));
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

  // RequestSignUp(e: any) {
  //   e.preventDefault();
  //   if (environment.production) {
  //     this.recaptcha.execute();
  //   } else {
  //     this.onLogin();
  //   }
  // }

  // validateCaptcha(response: string) {
  //   if (response.length > 0) {
  //     this.bCaptchaValid = true;
  //   }
  // }

  // resolved(token: string) {
  //   if (token === null) {
  //     this.bCaptchaValid = false;
  //     this.loginForm.enable();
  //   } else {
  //     if (this.loginForm) {
  //       this.bCaptchaValid = true;
  //       this.recaptcha.reset();
  //       this.onLogin();
  //     }
  //   }
  // }

}
