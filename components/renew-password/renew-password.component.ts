import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { PasswordService } from '../../services/password/password.service';
import { SessionToken } from '../../../client/shared/models/session-token.model';
import { PasswordStrengthValidator } from '../../../../shared/helpers/password-strength-validator';

@Component({
  selector: 'app-renew-password',
  templateUrl: './renew-password.component.html',
  styleUrls: ['./renew-password.component.css'],
})
export class RenewPasswordComponent implements OnInit {
  @ViewChild('modalWindow', { static: true }) modalWindow;

  tokenID = '';
  userName = '';

  tokenMessage = '';
  message = '';
  model: any = {};
  loading = false;
  redirect = false;
  error = '';
  inputForm: FormGroup;
  documents = [];

  visibleInput = false;
  visibleMessage = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private passwordService: PasswordService,
    private formBuilder: FormBuilder
  ) {}

  ngOnInit() {
    this.initComponent();
  }

  initComponent() {
    const reg = new RegExp(/^(?=.*[!@#$%^&*])$/);
    this.inputForm = this.formBuilder.group({
      newpwd: [
        '',
        [
          Validators.required,
          Validators.minLength(8),
          Validators.maxLength(12),
          PasswordStrengthValidator,
        ],
      ],
      checkpwd: [
        '',
        [
          Validators.required,
          Validators.minLength(8),
          Validators.maxLength(12),
          PasswordStrengthValidator,
        ],
      ],
    });

    const token: string = this.route.snapshot.queryParams['token'];

    this.loading = true;

    setTimeout(() => {
      this.passwordService.getTokenInfo(token).subscribe(
        (result) => {
          this.closeLoading();
          this.visibleInput = result.success;
          this.visibleMessage = !result.success;
          this.tokenMessage = result.message;
          this.tokenID = token;
          if (result.success) {
            this.userName = result.userName;
          }
        },
        (error) => {
          this.closeLoading();
          console.log('Error Retrieve: ', error);
        }
      );
    }, 500);
  }

  onRenew() {
    this.loading = true;

    const model = {
      idRetrieve: this.tokenID,
      newpwd: this.inputForm.get('newpwd').value,
      checkpwd: this.inputForm.get('checkpwd').value,
    };

    this.passwordService.renewPassword(model).subscribe(
      (result) => {
        this.redirect = result.success;
        this.message = result.success
          ? 'Contraseña actualizada correctamente.'
          : result.message;
        this.modalWindow.show();
        this.closeLoading();

        if(result.success) {
          this.removeToken();
        }
      },
      (error) => {
        this.message = 'Tuvimos un inconveniente realizando tu petición';
        this.modalWindow.show();
        this.closeLoading();
      }
    );
  }

  removeToken() {
    this.passwordService.removeToken().subscribe(
      (result) => {
        if(!result.success) {
          return;
        }

        localStorage.removeItem('currentUser')
      },
      (error) => {
        console.log(error);
      }
    );
  }


  closeLoading() {
    setTimeout(() => {
      this.loading = false;
    }, 101);
  }

  closeMessage() {
    this.modalWindow.hide();

    if (this.redirect === true) {
      setTimeout(() => {
        this.router.navigate(['broker/login']);
      }, 250);
    }
  }
}
