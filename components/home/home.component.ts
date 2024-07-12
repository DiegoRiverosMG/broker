import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthenticationService } from '../../services';
import { isNullOrUndefined } from 'util';
import { EmisionService } from '../../../client/shared/services/emision.service';
import { EventStrings } from '../../shared/events/events';
import { ClientInformationService } from '../../services/shared/client-information.service';
@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  id = 0;
  nombre = '';
  canal = '';
  productList: any;
  epsList = JSON.parse(sessionStorage.getItem('epsKuntur'));
  EventStrings: typeof EventStrings = EventStrings;

  constructor(
    private router: Router,
    private authenticationService: AuthenticationService,
    private eventTracker: EmisionService,
    private readonly clientInfo: ClientInformationService
  ) { }

  ngOnInit() {
    const token = this.authenticationService.getToken();
    if (isNullOrUndefined(token) || token === '') {
      this.doLogout();
      return;
    }
    this.productList = JSON.parse(localStorage.getItem('productUser'))['res'];
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    this.canal = currentUser && currentUser.canal;
    this.id = currentUser && currentUser.id;
    this.nombre = currentUser && currentUser.firstName;
  }

  goToPanel(item) {
    sessionStorage.setItem('sessionProduct', item.NIDPRODUCT);
    //sessionStorage.setItem('eps', JSON.stringify(this.epsList[0]));
    localStorage.setItem('eps', JSON.stringify(this.epsList[0]));
    const path = item.SSLUG.replace('broker', 'extranet');
    // Desarrollo de tarifario para cargas masivas

    this.eventTracker.registrarEvento('', this.getEventByAction(item.NIDPRODUCT)).subscribe(
      () => {
        this.router.navigate([path], { queryParams: { id: item.NIDPRODUCT }, skipLocationChange: false });
      });
    const codProd = item.NIDPRODUCT;
    const currentUser = JSON.parse(localStorage.getItem('currentUser')).id;
    this.clientInfo.GetUserProfile(codProd, currentUser).subscribe(
      (res: any) => {
        console.dir(res);
        localStorage.setItem('profileId', res);
      },
      (err: any) => {
        console.error(err);
      }
    );
  }

  returnImageByProduct(item: any) {
    let imagen = 'assets/icons/certificado_laser.svg';
    switch (item.NIDPRODUCT) {
      case 1:
        imagen = 'assets/icons/soat.png';
        break;
      case 2:
        imagen = 'assets/icons/sctr.png';
        break;
      case 3:
        imagen = 'assets/icons/vida-ley.png';
        break;
      case 6:
        imagen = 'assets/icons/accidentes-personales.png';
        break;
      case 7:
        imagen = 'assets/icons/sctr.png';
        break;
      case 10:
        imagen = 'assets/icons/back_office.png';
        break;
      default:
        imagen = 'assets/icons/certificado_laser.svg';
        break;
    }
    return imagen;
  }

  getEventByAction(IdProducto: any) {
    let accion = null;
    switch (IdProducto) {
      case 1:
        accion = EventStrings.HOME_IR_SOAT;
        break;
      case 2:
        accion = EventStrings.HOME_IR_SCTR;
        break;
      case 3:
        accion = EventStrings.HOME_IR_VIDALEY;
        break;
      case 6:
        accion = EventStrings.HOME_IR_AP;
        break;
      case 7:
        accion = EventStrings.HOME_IR_SCTR2;
        break;
      default:
        accion = EventStrings.HOME_IR_OTROS;
        break;
    }
    return accion;
  }

  doLogout() {
    this.authenticationService.logout().subscribe(
      result => {
        this.router.navigate(['/extranet/login']);
      },
      error => {
        console.log('error: ', error);
      }
    );
  }

}
