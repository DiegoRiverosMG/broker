import { filter } from 'rxjs/operators';
import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Features } from '../../models/features';
import { GlobalEventsManager } from '../../../../shared/services/gobal-events-manager';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/of';
import 'rxjs/add/operator/map';
import {
  HttpClient,
  HttpHeaders,
  HttpParams,
  HttpResponse
} from '@angular/common/http';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthenticationService } from '../../services/authentication.service';
import { AppConfig } from '../../../../app.config';
import { SidebarService } from '../../../../shared/services/sidebar/sidebar.service';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'nav-menu',
  // moduleId: module.id,
  templateUrl: 'navmenu.component.html',
  styleUrls: ['./navmenu.component.css', './navmenu.component.mobile.css']
})
export class NavMenuComponent implements OnInit {
  @ViewChild('navbarToggler', { static: true }) navbarToggler: ElementRef;
  showNavBar = false;
  featureList: Observable<Features[]>;
  menu = null;
  rutaBase = this.config.apiUrl;
  nombre = '';
  ApellidoPat = '';
  lNombre = '';
  lApellido = '';
  Iniciales = '';
  showSidebar = false;
  arrayMenu: any = [];
  menuSOAT: null;
  codProducto: any;
  showProfileMenu = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private globalEventsManager: GlobalEventsManager,
    private authenticationService: AuthenticationService,
    private config: AppConfig,
    private sidebarService: SidebarService
  ) {
    let productId: any;
    if (JSON.parse(localStorage.getItem('codProducto')) == null) {
      this.route.queryParams
        .subscribe(params => {
          this.codProducto = params.id;
        });
      productId = this.codProducto
      localStorage.setItem('codProducto', JSON.stringify({ productId }));
    } else {
      this.route.queryParams
        .subscribe(params => {
          if (params.id == undefined) {
            this.codProducto = JSON.parse(localStorage.getItem('codProducto'))['productId'];
          } else {
            this.codProducto = params.id;
          }
        });
      productId = this.codProducto
      localStorage.setItem('codProducto', JSON.stringify({ productId }));
    }

    this.globalEventsManager.showNavBar.subscribe((mode: any) => {
      this.showNavBar = mode;

      if ((this.showNavBar = true)) {
        this.featureList = this.getFeatureListByLoggedInUser();
      }
    });

    this.globalEventsManager.hideNavBar.subscribe((mode: any) => {
      this.showNavBar = false;
      this.featureList = null;
    });

    this.getObtenerNombres();
    this.getObtenerIniciales();

    this.featureList = this.getFeatureListByLoggedInUser();
    this.showNavBar = true;
  }

  ngOnInit(): void {
    this.sidebarService.node$.subscribe(val => {
      this.showSidebar = val;
    });
  }

  private getObtenerNombres() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    this.nombre = currentUser && currentUser.firstName.toLowerCase();
    this.ApellidoPat = currentUser && currentUser.lastName.toLowerCase();
  }

  private getObtenerIniciales() {
    this.lNombre = this.nombre === null ? '' : this.nombre.substr(0, 1);
    this.lApellido = this.lApellido === null ? '' : this.ApellidoPat.substr(0, 1);
    this.Iniciales = this.lNombre + this.lApellido;
  }

  private getFeatureListByLoggedInUser(): Observable<Features[]> {
    if (localStorage.getItem('currentUser') != null) {

      this.menu = JSON.parse(localStorage.getItem('currentUser'))['menu'];
      this.menu.forEach(element => {
        if (element.nidproduct == JSON.parse(localStorage.getItem('codProducto'))['productId'] || element.nidproduct == '99') {
          this.arrayMenu.push(element);
        }
      });
      const isAdmin = localStorage.getItem(AppConfig.PROFILE_ADMIN_GUID);
      this.showProfileMenu = isAdmin === '1';

      this.menuSOAT = this.showProfileMenu ? this.arrayMenu.filter(x => x.sname !== 'Mis Productos') : this.arrayMenu;
    } else {
      localStorage.clear();
      this.menuSOAT = null;
    }
    return this.menuSOAT;
  }

  doLogout() {
    this.authenticationService.logout().subscribe(
      result => {
        if (result) {
          this.router.navigate(['/extranet/login']);
          localStorage.clear();
          sessionStorage.clear();
        }
      },
      error => {
        console.log('error: ', error);
      }
    );
  }


  navBarTogglerIsVisible() {
    const isVisible: boolean = this.navbarToggler.nativeElement.offsetParent !== null;
    return isVisible;
  }

  // verificarAdminProfile() {
  //   const isAdmin = localStorage.getItem(AppConfig.PROFILE_ADMIN_GUID);
  //   this.showProfileMenu = isAdmin === '1';
  // }

  gotoProfile() {
    this.router.navigate(['extranet/login-profile'], { skipLocationChange: true });
  }



}
