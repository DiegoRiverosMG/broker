import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { PolicyemitService } from '../../../services/policy/policyemit.service';
import { TransactService } from '../../../services/transact/transact.service';
import { TokenService } from '../../../../soat/shared/services/token.service';
import { AuthenticationService } from '../../../../broker/services/authentication.service';

// SweetAlert
import swal from 'sweetalert2';

@Component({
  selector: 'app-transact-access',
  templateUrl: './transact-access.component.html',
  styleUrls: ['./transact-access.component.css']
})
export class TransactAccessComponent implements OnInit {

  vidaley = {id: "1", nbranch: "73"};
  product = {productId: 3}
  Login: FormGroup;

  token ='';
  tramite = {};
  isLoading = false;

  constructor(
    private route: ActivatedRoute,
    private policyService: PolicyemitService,
    private transactService: TransactService,
    private router: Router,
    private authenticationService: AuthenticationService,
    ) { }

  ngOnInit() {
    this.isLoading =true;
    localStorage.clear();
    sessionStorage.clear();
    this.token = this.route.snapshot.paramMap.get('token');
    console.log(this.token);
    this.Login = new FormGroup({
      token: new FormControl('', Validators.required),
      documento: new FormControl('', Validators.required),
    });
    if (this.token.length < 40){
      this.router.navigate(['/']);
    }
    this.isLoading =false;
  }

  async ValidateAccess(){
    this.isLoading =true;
    let currentUser = {};
    this.Login.value.token = this.token;
    await this.transactService.ValidateAccess(this.Login.value).toPromise().then(
      async res => {
        const respuesta: any = res;
        if (respuesta.P_NID_COTIZACION === -1){
          swal.fire('Información', respuesta.P_MESSAGE, 'error');
          this.isLoading =false;
        } else {
          await this.authenticationService.login('USERECOMERCIAL','ProtectaSecurity$21',false).toPromise().then(
            async result => {
              currentUser = { id: res.P_NUSERCODE}
              localStorage.setItem('codProducto', JSON.stringify(this.product));
              localStorage.setItem('vidaleyID', JSON.stringify(this.vidaley));
              //localStorage.setItem('currentUser', JSON.stringify(currentUser));
              this.tramite = {
                P_NID_COTIZACION : respuesta.P_NID_COTIZACION,
                P_NUSERCODE : respuesta.P_NUSERCODE,
                P_NID_TRAMITE : respuesta.P_NID_TRAMITE,
                P_FLAG_RECHAZO : respuesta.P_FLAG_RECHAZO,
                P_NBRANCH : respuesta.P_NBRANCH,
                P_NPRODUCT : respuesta.P_NPRODUCT
              }
              sessionStorage.setItem('tramitelogin', JSON.stringify(this.tramite));
              this.router.navigate(['/extranet/transact-evaluation']);
              this.isLoading =false;
            },
            error => {
              this.isLoading =false;
              swal.fire('Información', "Error en el servidor.", 'error');
            });
        }
        console.log(respuesta);
      }
    );
  }

}
