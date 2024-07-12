import { Component, OnInit, ViewChild } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { RecaptchaComponent } from 'ng-recaptcha';
import { PasswordService } from '../../services/password/password.service';
import { AppConfig } from '../../../../app.config';

@Component({
  selector: 'app-retrieve-password',
  templateUrl: './retrieve-password.component.html',
  styleUrls: ['./retrieve-password.component.css'],
})
export class RetrievePasswordComponent implements OnInit {
  @ViewChild('recaptchaRef', { static: true }) recaptcha: RecaptchaComponent;
  @ViewChild('modalRetrieve', { static: true }) modalRetrieve;

  message = '';
  model: any = {};
  loading = false;
  redirect = false;
  error = '';
  retrieveForm: FormGroup;
  documents = [];

  siteKey = AppConfig.CAPTCHA_KEY;

  constructor(
    private router: Router,
    private passwordService: PasswordService,
    private formBuilder: FormBuilder
  ) {}

  ngOnInit() {
    this.initComponent();
    this.getToken();
  }
  initComponent() {
    this.retrieveForm = this.formBuilder.group({
      tipdoc: ['', [Validators.required]],
      numdoc: ['', [Validators.required]],
    });

    this.loading = true;

    this.passwordService.tiposDocumentos().subscribe(
      (result) => {
        this.loading = false;
        this.documents = result;
      },
      (error) => {
        this.loading = false;

        console.log('Error recuperando los tipos de documento: ', error);
      }
    );
  }

  getToken() {
    this.passwordService.getToken().subscribe({
      next: (response) => {
        const dataToken = {
          token: response,
        };
        localStorage.setItem('currentUser', JSON.stringify(dataToken));
      },
      error: (error) => {
        console.log(error);
      },
    });
  }

  get retrieveFormControl(): { [key: string]: AbstractControl } {
    return this.retrieveForm.controls;
  }

  onRetrieve(data?: string) {
    this.loading = true;
    this.model.idTipoDocumento = this.retrieveFormControl['tipdoc'].value;
    this.model.numeroDocumento = this.retrieveFormControl['numdoc'].value;
    this.model.token = data ? data : '';

    this.passwordService.verify(this.model).subscribe({
      next: (result) => {
        if (!result.success) {
          this.loading = false;
          this.message = result.message;
          this.modalRetrieve.show();
        } else {
          setTimeout(() => {
            sessionStorage.setItem('tipdoc', this.model.idTipoDocumento);
            sessionStorage.setItem('numdoc', this.model.numeroDocumento);
            sessionStorage.setItem('email', result.email);

            this.loading = false;
            this.router.navigate(['broker/retrieve-send']);
          }, 1000);
        }
      },
      error: (error) => {
        console.log('Error Retrieve: ', error);

        this.message = 'Tuvimos un inconveniente realizando tu petición';
        this.modalRetrieve.show();

        setTimeout(() => {
          this.loading = false;
        }, 101);
      },
      complete: () => {
        this.recaptcha.reset();
      },
    });
  }

  closeMessage() {
    this.modalRetrieve.hide();
  }

  requestRetrieve(e: any) {
    e.preventDefault();
    this.recaptcha.execute();
  }

  resolved(token: string) {
    if (token) {
      this.onRetrieve(token);
      return;
    }
    this.retrieveForm.enable();
  }

  soloNumeros(event: any) {
    const pattern = /[0-9\+\-\ ]/;
    const inputChar = String.fromCharCode(event.charCode);

    if (!pattern.test(inputChar)) {
      // invalid character, prevent input
      event.preventDefault();
    }
  }
}
