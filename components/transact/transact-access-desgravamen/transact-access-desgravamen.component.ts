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
  selector: 'app-transact-access-desgravamen',
  templateUrl: './transact-access-desgravamen.component.html',
  styleUrls: ['./transact-access-desgravamen.component.css']
})
export class TransactAccessDesgravamenComponent implements OnInit {

  desgravamenID = {id: "1", nbranch: "71"};
  desgravamen ={id: "1", nbranch: "71"};
  product = {productId: 4}
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
    await this.transactService.ValidateAccessDes(this.Login.value).toPromise().then(
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
              localStorage.setItem('desgravamenID', JSON.stringify(this.desgravamenID));
              //localStorage.setItem('currentUser', JSON.stringify(currentUser));
              this.tramite = {
                P_NID_COTIZACION : respuesta.P_NID_COTIZACION,
                P_NUSERCODE : respuesta.P_NUSERCODE,
              }
              sessionStorage.setItem('tramitelogin', JSON.stringify(this.tramite));
              this.router.navigate(['/extranet/transact-evaluation-desgravamen']);
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
