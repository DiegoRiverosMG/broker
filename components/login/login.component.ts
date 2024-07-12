import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
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
  selector: 'app-login',
  templateUrl: 'login.component.html',
  styleUrls: ['login.component.css'],
})
export class LoginComponent implements OnInit {
  productByUser = new ProductByUserRQ();
  model: any = {};
  loading = false;
  error = '';

  siteKey = AppConfig.CAPTCHA_KEY;
  bCaptchaValid = false;
  loginForm: FormGroup;
  productList: any = [];
  @ViewChild('captchaRef', { static: true }) recaptcha: RecaptchaComponent;
  @ViewChild('username', { static: true, read: ElementRef })
  username: ElementRef;

  profile_admin = AppConfig.PROFILE_ADMIN_SOAT;

  constructor(
    private sidebarService: SidebarService,
    private route: ActivatedRoute,
    private router: Router,
    private authenticationService: AuthenticationService,
    private clientService: ClientInformationService,
    private productService: ProductService,
    private formBuilder: FormBuilder,
    private sessionStorageService: SessionStorageService,
    private spinner: NgxSpinnerService,
    private appConfig: AppConfig,
    private passwordService: PasswordService
  ) {}

  ngOnInit() {
    this.initComponent();
    localStorage.setItem('showNewMenu', 'false');
  }

  initComponent() {
    this.crearFormulario();
    // this.sessionStorageService.clearStorage();
    this.spinner.hide();
  }

  crearFormulario() {
    this.loginForm = this.formBuilder.group({
      usuario: ['', [Validators.required]],
      clave: ['', [Validators.required]],
    });
    this.username.nativeElement.click();
  }

  get f(): any {
    return this.loginForm.controls;
  }
  setDatos() {
    this.model.username = this.loginForm.get('usuario').value;
    this.model.password = this.loginForm.get('clave').value;
  }

  async onLogin() {
    localStorage.setItem('currentUser', '');
    localStorage.removeItem('currentUser');
    this.loading = true;
    this.spinner.show();
    this.setDatos();
    await this.authenticationService
      .login(this.model.username, this.model.password, false)
      .toPromise()
      .then(
        async (result) => {
          if (result === true) {
            if (
              JSON.parse(localStorage.getItem('currentUser'))['flagCambioClave']
            ) {
              this.passwordService.changePassword().subscribe(
                (rslt) => {
                  this.router.navigate(['extranet/renew-password'], {
                    queryParams: { token: rslt.token },
                  });
                },
                (error) => {
                  this.loading = false;
                  console.log(
                    'Error recuperando los tipos de documento: ',
                    error
                  );
                }
              );
            } else {
              await this.getDataSctr();
            }
          } else {
            this.error =
              'No hemos podido validar tus credenciales. Por favor, inténtalo de nuevo.';
            this.loading = false;
          }
          this.spinner.hide();
        },
        (error) => {
          this.error =
            'No hemos podido validar tus credenciales. Por favor, inténtalo de nuevo.';
          this.loading = false;
          this.spinner.hide();
        }
      );
  }

  async getDataSctr() {
    this.productByUser.P_NIDUSER = JSON.parse(
      localStorage.getItem('currentUser')
    )['id'];
    localStorage.setItem('showNewMenu', 'false');
    await this.productService
      .getDataSctr(this.productByUser)
      .toPromise()
      .then(
        async (res) => {
          if (res !== null) {
            // Productos configurados
            await this.getProducts(res.productList);
            // Eps Configurados
            await this.getEps(res.epsList);
            // Arma el menu
            await this.getMenu(res.productUserList);
          } else {
            this.error =
              'No hemos podido validar tus credenciales. Por favor, inténtalo de nuevo.';
            this.loading = false;
            this.spinner.hide();
          }
        },
        (error) => {
          this.error =
            'No hemos podido validar tus credenciales. Por favor, inténtalo de nuevo.';
          this.loading = false;
          this.spinner.hide();
        }
      );
  }

  async getEps(res: any) {
    sessionStorage.setItem('epsKuntur', JSON.stringify(res));
    // sessionStorage.setItem('eps', JSON.stringify(res[0]));
    localStorage.setItem('eps', JSON.stringify(res[0]));
  }

  async getProducts(res: any) {
    res.forEach((item) => {
      if (item.TIP_PRODUCT === 'SCTR_PEN') {
        localStorage.setItem(
          'pensionID',
          JSON.stringify({
            id: item.COD_PRODUCT.toString(),
            nbranch: item.NBRANCH.toString(),
          })
        );
      }
      if (item.TIP_PRODUCT === 'SCTR_SAL') {
        localStorage.setItem(
          'saludID',
          JSON.stringify({
            id: item.COD_PRODUCT.toString(),
            nbranch: item.NBRANCH.toString(),
          })
        );
      }
      if (item.TIP_PRODUCT === 'VIDA_LEY') {
        localStorage.setItem(
          'vidaleyID',
          JSON.stringify({
            id: item.COD_PRODUCT.toString(),
            nbranch: item.NBRANCH.toString(),
          })
        );
      }
      if (item.TIP_PRODUCT === 'COVID_GRUPAL') {
        localStorage.setItem(
          'covidID',
          JSON.stringify({
            id: item.COD_PRODUCT.toString(),
            nbranch: item.NBRANCH.toString(),
          })
        );
      }
      if (item.TIP_PRODUCT === 'ACC_PERSONALES') {
        localStorage.setItem(
          'accPerID',
          JSON.stringify({
            id: item.COD_PRODUCT.toString(),
            nbranch: item.NBRANCH.toString(),
          })
        );
      }
      if (item.TIP_PRODUCT === 'VIDA_GRUPO') {
        localStorage.setItem(
          'vidaGrupoID',
          JSON.stringify({
            id: item.COD_PRODUCT.toString(),
            nbranch: item.NBRANCH.toString(),
          })
        );
      }
      if (item.TIP_PRODUCT === 'DESGRAVAMEN') {
        localStorage.setItem(
          'desgravamenID',
          JSON.stringify({
            id: item.COD_PRODUCT.toString(),
            nbranch: item.NBRANCH.toString(),
          })
        );
      }
      if (item.TIP_PRODUCT === 'VILP') {
        localStorage.setItem(
          'vilpID',
          JSON.stringify({
            id: item.COD_PRODUCT.toString(),
            nbranch: item.NBRANCH.toString(),
          })
        );
      }
    });
  }

  async getMenu(res: any) {
    const loProducts = sortArray(<any[]>res, 'NIDPRODUCT', 1);
    localStorage.setItem('productUser', JSON.stringify({ res: loProducts }));
    this.productList = res;
    this.navigateHome(res);
  }

  get isActiveSimuladorCanalVenta(): boolean {
    return false;
  }
  isEnableSimuladorCanales(user: any): void {
    // 20 150 151
    const _ = [20, 150, 151];
    const mainProduct = user.productoPerfil.find((x) => x.idProducto === 1);

    if (mainProduct && _.includes(mainProduct.idPerfil)) {
      localStorage.setItem(AppConfig.PROFILE_ADMIN_GUID, '1');
    } else {
      localStorage.setItem(AppConfig.PROFILE_ADMIN_GUID, '0');
    }
  }
  navigateHome(res: any) {
    this.sidebarService.close();
    localStorage.setItem(AppConfig.PROFILE_ADMIN_STORE, null);
    const user = JSON.parse(localStorage.getItem('currentUser'));
    const mainProduct = user.productoPerfil.filter(
      (x) => x.idPerfil === user.profileId
    )[0];
    this.isEnableSimuladorCanales(user);

    this.router.navigate(['/extranet/welcome']);
  }

  RequestSignUp(e: any) {
    e.preventDefault();
    if (environment.production) {
      this.recaptcha.execute();
    } else {
      this.onLogin();
    }
  }

  validateCaptcha(response: string) {
    if (response.length > 0) {
      this.bCaptchaValid = true;
    }
  }

  resolved(token: string) {
    if (token === null) {
      this.bCaptchaValid = false;
      this.loginForm.enable();
    } else {
      if (this.loginForm) {
        this.bCaptchaValid = true;
        this.recaptcha.reset();
        this.onLogin();
      }
    }
  }
  hasErrorInput(control: string): boolean {
    return (
      this.loginForm.get(control).invalid && this.loginForm.get(control).touched
    );
  }
}
