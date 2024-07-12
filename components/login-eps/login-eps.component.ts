import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { animate, style, transition, trigger } from '@angular/animations';

import { AuthenticationService } from '@root/layout/broker/services';
import { PasswordService } from '@root/layout/broker/services/password/password.service';
import { ProductService } from '@root/layout/broker/services/product/panel/product.service';
import { sortArray } from '@shared/helpers/utils';
import { AppConfig } from '@root/app.config';

const transitionTime: number = 500;

@Component({
  selector: 'app-login-eps',
  templateUrl: './login-eps.component.html',
  styleUrls: ['./login-eps.component.sass'],
  animations: [
    trigger('fadeIn', [
      transition(':enter', [
        style({
          opacity: 0
        }),
        animate(
          transitionTime,
          style({
            opacity: 1
          })
        )
      ])
    ]),
    trigger('fadeInY', [
      transition(':enter', [
        style({
          opacity: 0,
          transform: 'translateY(-15%)'
        }),
        animate(
          transitionTime,
          style({
            opacity: 1,
            transform: 'translateY(0)'
          })
        )
      ])
    ])
  ]
})
export class LoginEpsComponent implements OnInit {

  form: FormGroup = this.builder.group({
    username: ['', Validators.required],
    password: ['', Validators.required],
    forward: [false]
  });

  responseInfo: string = '';

  @ViewChild('inputPassword', { static: true, read: ElementRef })
  inputPassword!: ElementRef;

  constructor(
    private readonly builder: FormBuilder,
    private readonly spinner: NgxSpinnerService,
    private readonly router: Router,
    private readonly authenticationService: AuthenticationService,
    private readonly passwordService: PasswordService,
    private readonly productService: ProductService
  ) {
  }

  ngOnInit(): void {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));

    if (currentUser && currentUser.forwardAccount) {
      this.router.navigate(['/extranet/welcome']);
      return;
    }

    localStorage.removeItem('currentUser');
  }

  get formControl(): { [key: string]: AbstractControl } {
    return this.form.controls;
  }

  get currentUser(): any {
    return JSON.parse(localStorage.getItem('currentUser') ?? '{}');
  }

  toggleShowPassword(): void {
    this.inputPassword.nativeElement.type = this.inputPassword.nativeElement.type == 'password' ? 'text' : 'password';
  }

  onSubmit(): void {
    if (this.form.invalid) {
      return;
    }

    this.responseInfo = '';
    this.spinner.show();

    this.authenticationService.login(
      this.formControl['username'].value,
      this.formControl['password'].value,
      false
    ).subscribe({
      next: (response: boolean): void => {
        this.spinner.hide();

        if (!response) {
          this.responseInfo = 'No hemos podido validar tus credenciales. Por favor, inténtalo de nuevo';
          return;
        }

        const isRenewPassword: boolean = this.currentUser['flagCambioClave'];
        if (isRenewPassword) {
          this.renewPassword();
          return;
        }

        this.getDataSCTR();
      },
      error: (error: HttpErrorResponse): void => {
        console.error(error);

        this.responseInfo = 'No hemos podido validar tus credenciales. Por favor, inténtalo de nuevo';
        this.spinner.hide();
      }
    });
  }

  private renewPassword(): void {
    this.responseInfo = '';
    this.spinner.show();

    this.passwordService.changePassword().subscribe({
      next: (response: any): void => {
        console.log(response);

        this.router.navigate(['extranet/renew-password'], {
          queryParams: { token: response.token }
        });
      },
      error: (error: HttpErrorResponse): void => {
        console.error(error);
        this.spinner.hide();

        this.responseInfo = 'Ocurrió un error al intentar iniciar sesión';
      },
      complete: (): void => {
        this.spinner.hide();
      }
    });
  }

  private getDataSCTR(): void {
    this.responseInfo = '';
    this.spinner.show();

    const payload: { P_NIDUSER: number } = {
      P_NIDUSER: +this.currentUser['id']
    };
    this.productService.getDataSctr(payload).subscribe({
      next: (response: any): void => {
        console.log(response);

        if (response) {
          let urlLoginEps: string = location.pathname;

          if (urlLoginEps.includes('/ecommerce/')) {
            urlLoginEps = location.pathname.split('/ecommerce')[1];
          }

          localStorage.setItem('login-eps', urlLoginEps);
          this.setProducts(response.productList);
          this.setEPS(response.epsList);
          this.setMenu(response.productUserList);
          this.navigateHome();
          return;
        }
      },
      error: (error: HttpErrorResponse): void => {
        console.error(error);
        this.spinner.hide();
      },
      complete: (): void => {
        this.spinner.hide();
      }
    });
  }

  private setProducts(products: any[]): void {
    enum productIncludes {
      SCTR_PEN = 'pensionID',
      SCTR_SAL = 'saludID',
      VIDA_LEY = 'vidaleyID',
      COVID_GRUPAL = 'covidID',
      ACC_PERSONALES = 'accPerID',
      VIDA_GRUPO = 'vidaGrupoID',
      DESGRAVAMEN = 'desgravamenID',
      VILP = 'VILP'
    }

    products.forEach((item: any): void => {
      if (!productIncludes[item.TIP_PRODUCT]) {
        return;
      }

      localStorage.setItem(
        productIncludes[item.TIP_PRODUCT],
        JSON.stringify({
          id: item.COD_PRODUCT.toString(),
          nbranch: item.NBRANCH.toString()
        })
      );
    });
  }

  private setEPS(epsList: any[]): void {
    sessionStorage.setItem('epsKuntur', JSON.stringify(epsList));
    localStorage.setItem('eps', JSON.stringify(epsList[0]));
  }

  private setMenu(menus: any[]): void {
    const loProducts = sortArray(menus, 'NIDPRODUCT', 1);
    localStorage.setItem('productUser', JSON.stringify({ res: loProducts }));
  }

  private navigateHome(): void {
    localStorage.setItem(AppConfig.PROFILE_ADMIN_STORE, null);


    const user = JSON.parse(localStorage.getItem('currentUser'));

    if (this.formControl['forward'].value) {
      localStorage.setItem('currentUser', JSON.stringify({
        ...user,
        forwardAccount: true
      }));
    }

    this.isEnableSimuladorCanales(user);

    this.router.navigate(['/extranet/welcome']);
  }

  private isEnableSimuladorCanales(user: any): void {
    const products: number[] = [20, 150, 151];
    const mainProduct = user.productoPerfil.some((x): boolean => x.idProducto === 1);

    if (mainProduct && products.includes(mainProduct.idPerfil)) {
      localStorage.setItem(AppConfig.PROFILE_ADMIN_GUID, '1');
    } else {
      localStorage.setItem(AppConfig.PROFILE_ADMIN_GUID, '0');
    }
  }
}
