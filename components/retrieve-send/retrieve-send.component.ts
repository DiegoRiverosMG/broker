import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { PasswordService } from '../../services/password/password.service';

@Component({
  selector: 'app-retrieve-send',
  templateUrl: './retrieve-send.component.html',
  styleUrls: ['./retrieve-send.component.css']
})
export class RetrieveSendComponent implements OnInit {
  @ViewChild('modalWindow', { static: true }) modalWindow;

  email = '';
  message = '';
  loading = false;
  redirect = false;

  constructor(
    private router: Router,
    private passwordService: PasswordService
  ) {}

  ngOnInit() {
    this.email = sessionStorage.getItem('email');

    if (
      sessionStorage.getItem('tipdoc') === null ||
      sessionStorage.getItem('numdoc') === null
    ) {
      this.router.navigate(['broker/login']);
    }
  }

  sendEmail() {
    this.loading = true;

    const model = {
      tipdoc: sessionStorage.getItem('tipdoc'),
      numdoc: sessionStorage.getItem('numdoc')
    };

    this.passwordService.sendRetrievePassword(model).subscribe(
      result => {
        if (result.success) {
          sessionStorage.removeItem('tipdoc');
          sessionStorage.removeItem('numdoc');
          sessionStorage.removeItem('email');
        }

        this.redirect = result.success;
        this.message = !result.success
          ? result.message
          : 'Por favor revise su bandeja de entrada, carpeta de correo no deseado o spam.';
        this.modalWindow.show();
        this.closeLoading();
      },
      error => {
        console.log('Error Send Retrieve: ', error);

        this.loading = false;
        this.message = 'Tuvimos un inconveniente realizando tu petición';
        this.modalWindow.show();
        this.closeLoading();
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
      }, 500);
    }
  }
}
