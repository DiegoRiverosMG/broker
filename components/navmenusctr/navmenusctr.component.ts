import { Component, OnInit } from "@angular/core";
import { Features } from "../../models/features";
import { GlobalEventsManager } from "../../../../shared/services/gobal-events-manager";
import { Observable } from "rxjs/Observable";
import "rxjs/add/observable/of";
import "rxjs/add/operator/map";
import { Location } from '@angular/common';
import { Router, ActivatedRoute } from "@angular/router";
import { AuthenticationService } from "../../services/authentication.service";
import { AppConfig } from "../../../../app.config";
import { SidebarService } from "../../../../shared/services/sidebar/sidebar.service";

@Component({
  selector: 'navmenusctr',
  templateUrl: './navmenusctr.component.html',
  styleUrls: ['./navmenusctr.component.css']
})
export class NavmenusctrComponent implements OnInit {

  showNavBar = false;
  featureList: Observable<Features[]>;
  menuTotal = null;
  arrayMenu = [];
  menuSCTR = null;
  rutaBase = this.config.apiUrl;
  nombre: string;
  ApellidoPat: string;
  lNombre: string;
  lApellido: string;
  Iniciales: string;
  codProducto: any;
  // Subscription for sidebar
  showSidebar = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private globalEventsManager: GlobalEventsManager,
    private authenticationService: AuthenticationService,
    private config: AppConfig,
    private sidebarService: SidebarService,
  ) {

    let productId: any;
    this.route.queryParams.subscribe(
      params => {
        if (params.id != undefined) {
          productId = params.id;
        } else {
          productId = JSON.parse(localStorage.getItem("codProducto"))["productId"];
        }
      });

    localStorage.setItem('codProducto', JSON.stringify({ productId }));

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
    const currentUser = JSON.parse(localStorage.getItem("currentUser"));
    this.nombre = currentUser && currentUser.firstName.toLowerCase();
    this.ApellidoPat = currentUser && currentUser.lastName.toLowerCase();
  }

  private getObtenerIniciales() {
    this.lNombre = this.nombre === null ? "M" : this.nombre.substr(0, 1);
    this.lApellido = this.ApellidoPat === null ? "G" : this.ApellidoPat.substr(0, 1);
    this.Iniciales = this.lNombre + this.lApellido;
  }

  private getFeatureListByLoggedInUser(): Observable<Features[]> {
    if (localStorage.getItem("currentUser") != null) {
      this.menuTotal = JSON.parse(localStorage.getItem("currentUser"))["menu"];
      this.menuTotal.forEach(element => {
        if (element.nidproduct == JSON.parse(localStorage.getItem("codProducto"))["productId"] || element.nidproduct == "99") {
          this.arrayMenu.push(element);
        }
      });
      this.menuSCTR = this.arrayMenu;
    } else {
      this.menuSCTR = null;
    }

    return this.menuSCTR;
  }

  doLogout() {
    this.authenticationService.logout().subscribe(
      result => {
        if (result) {
          this.router.navigate(["/broker/login"]);
        }
      },
      error => {
        this.router.navigate(["/broker/login"]);
      }
    );
  }

}
