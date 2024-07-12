import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import swal from 'sweetalert2';
import { CommonMethods } from '../common-methods';
import { ToastrService } from 'ngx-toastr';
import { ClientInformationService } from '../../services/shared/client-information.service';

@Component({
  selector: 'app-panel',
  templateUrl: './panel.component.html',
  styleUrls: ['./panel.component.css']
})
export class PanelComponent implements OnInit {
  epsList: any = [];
  epsSelected: string;
  codProducto: any;
  nombre: string;
  template: any = {};

  constructor(
    private toastr: ToastrService,
    private route: ActivatedRoute,
    private clientService: ClientInformationService,
    private readonly _Router: Router,
    private readonly _ActivatedRoute: ActivatedRoute
  ) { }

  async ngOnInit() {
    if (this._Router.url === '/extranet/panel?id=10') {
      this._Router.navigate(['/backoffice/home']);
    }

    localStorage.setItem('emiPolicy', JSON.stringify({ emiPolicy: 1 }));
    // Configuracion del Template



    const transactionKey = this.route.snapshot.paramMap.get('key') || '';
    if (transactionKey !== undefined) {
      this.codProducto = transactionKey;
    } else {
      this.codProducto = JSON.parse(localStorage.getItem('codProducto'))['productId'];
    }
    localStorage.setItem('codProducto', JSON.stringify({ productId: this.codProducto }));


    // this.codProducto = JSON.parse(localStorage.getItem('codProducto'))['productId'];
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    this.nombre = currentUser && currentUser.firstName.toUpperCase();
    this.loadList();
    // await this.getUserProfile(this.codProducto, currentUser.id);
  }

  async loadList() {
    this.epsList = JSON.parse(sessionStorage.getItem('epsKuntur'));
    //this.epsSelected = JSON.parse(sessionStorage.getItem('eps'))['NCODE'];
    this.epsSelected = JSON.parse(localStorage.getItem('eps'))['NCODE'];
    this.template = await CommonMethods.configuracionTemplate(this.codProducto, this.epsSelected);
  }

  onSelectProduct(eps) {
    if (eps !== undefined) {
      //sessionStorage.setItem('eps', JSON.stringify(eps));
      localStorage.setItem('eps', JSON.stringify(eps));
      this.toastr.success('Se hizo el cambio de EPS correctamente', 'Importante!', { timeOut: 5000 });
      // swal.fire('Información', 'Se hizo el cambio de EPS correctamente', 'success');
    } else {
      swal.fire('Información', 'Ha ocurrido un error al elegir la EPS', 'warning');
    }
  }

  async getUserProfile(product, usercode) {
    await this.clientService.GetUserProfile(product, usercode).toPromise().then(
      res => {
        if (res !== 0) {
          const currentUser = JSON.parse(localStorage.getItem('currentUser'));
          currentUser.profileId = res;
          localStorage.setItem('currentUser', JSON.stringify(currentUser));
        }
      },
      err => {
      }
    );
  }
}
