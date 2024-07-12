import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { AppConfig } from '@root/app.config';
import { AuthenticationService } from '../../services';
import { NgxSpinnerService } from 'ngx-spinner';
import { DatePipe } from '@angular/common';
import { BsDatepickerConfig } from 'ngx-bootstrap/datepicker';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { HttpErrorResponse } from '@angular/common/http';
import moment from 'moment';

import { Step05Service } from '../../services/step05/step05.service';
import { SessionStorageService } from '@shared/services/storage/storage-service';
import { LeadService } from '../../services/lead/lead.service';
import { ExcelService } from '@shared/services/excel/excel.service';
import { UtilsService } from '@shared/services/utils/utils.service';

@Component({
  selector: 'app-login-profile',
  templateUrl: './login-profile.component.html',
  styleUrls: ['./login-profile.component.css']
})
export class LoginProfileComponent implements OnInit {
  @ViewChild('childModalLeads', { static: true }) childModalLeads: ModalDirective;
  nombre = '';
  perfiles = AppConfig.PROFILES_LOAD_SOAT;
  msgErrorLista = '';
  searchtext = '';
  searchLeadsStart = '';
  searchLeadsEnd = '';
  Profiles: any[] = [];
  Profile: any = {};
  listaCanales: any[] = [];
  listaCanalesGlobal: any[] = [];
  fExistRegistro: any = false;
  totalItems = 0;
  Chanel: any = {};
  disabledBtn = true;
  p = 0;
  bHideBody: Boolean;
  bsRangeValue: Date[];
  bsConfig: Partial<BsDatepickerConfig>;
  colorTheme = 'theme-orange';
  leadType = '';

  excludeLeads: Array<number>;

  constructor(
    private router: Router,
    private authenticationService: AuthenticationService,
    private step05service: Step05Service,
    private spinner: NgxSpinnerService,
    public datePipe: DatePipe,
    private sessionStorageService: SessionStorageService,
    private leadService: LeadService,
    private excelService: ExcelService,
    private readonly utilsService: UtilsService
  ) {
    this.excludeLeads = [189];
    this.bsConfig = Object.assign({}, {
      dateInputFormat: 'DD/MM/YYYY',
      locale: 'es',
      rangeInputFormat: 'DD/MM/YYYY',
      containerClass: this.colorTheme
    });
  }

  ngOnInit() {
    this.spinner.show();

    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    this.nombre = currentUser && currentUser.firstName;
    this.getMenus();
    this.getListaCanales();
  }

  get enableExportLeads(): boolean {
    return !this.excludeLeads.includes(this.currentUser.profileId);
  }

  get currentUser(): any {
    return JSON.parse(localStorage.getItem('currentUser'));
  }

  getMenus() {
    if (this.perfiles.length > 0) {
      this.Profiles = [];
      this.perfiles.forEach(element => {
        this.authenticationService.getMenuProfile(element.id, element.product).toPromise().then(
          async result => {
            const item = {
              id: element.id,
              name: element.name,
              product: element.product,
              orden: element.orden,
              menu: result
            };
            this.Profiles.push(item);
            this.Profiles.sort((a, b) => (a.orden > b.orden) ? 1 : -1);
          },
          error => {
            this.spinner.hide();
          });
      });
    } else {

    }
  }

  getListaCanales() {
    this.step05service.getListaCanalesAll().subscribe(
      res => {
        const lsta = <any[]>res;
        this.totalItems = lsta.length;
        this.fExistRegistro = lsta.length > 0;
        this.msgErrorLista = lsta.length > 0 ? 'No se encontraron Registros..' : '';
        this.listaCanales = lsta;
        this.listaCanalesGlobal = [...lsta];
        this.spinner.hide();
      },
      err => {
        this.totalItems = 0;
        this.fExistRegistro = false;
        this.spinner.hide();
      }
    );
  }

  search(term: string) {
    let canalesFiltrados;
    if (!term) {
      canalesFiltrados = this.listaCanalesGlobal;
    } else {
      canalesFiltrados = this.listaCanalesGlobal.filter(x =>
        (x.cliente.trim().toLowerCase().includes(term.trim().toLowerCase()) ||
          x.codigoCanal.toString().trim().toLowerCase().includes(term.trim().toLowerCase()))
      );
    }
    this.listaCanales = canalesFiltrados;
  }

  setProfile(item) {
    this.Profile = item;
    this.disabledBtn = true;
    if (this.Profile.id > 0) {
      this.disabledBtn = false;
    }
  }

  setChanel(item) {
    if (this.Profile.id > 0) {

      const canalHistory = {
        nchannel: item.codigoCanal,
        nusercode: 0,
        sdescript: item.cliente
      };
      this.Chanel = item;
      localStorage.setItem(AppConfig.PROFILE_ADMIN_STORE, JSON.stringify(canalHistory));
      const currentUser = JSON.parse(localStorage.getItem('currentUser'));
      localStorage.setItem('channelMain', currentUser.canal);
      currentUser.canal = item;
      localStorage.setItem('currentUser', JSON.stringify(currentUser));
      // localStorage.setItem(AppConfig.PROFILE_ADMIN_GUID, '1');
      this.onLogin();
    }
  }

  onLogin() {
    this.spinner.show();

    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    localStorage.setItem('admincurrentUser', JSON.stringify(currentUser));
    currentUser.canal = this.Chanel.codigoCanal;
    currentUser.brokerId = this.Chanel.brokerId;
    currentUser.intermediaId = this.Chanel.intermedId;
    currentUser.profileId = this.Profile.id;
    currentUser.menu = this.Profile.menu;
    currentUser.indpuntoVenta = 0;
    this.sessionStorageService.setItem('canalVentaCliente', this.Chanel.codigoCanal);
    localStorage.setItem('currentUser', JSON.stringify(currentUser));

    this.router.navigate(['extranet/home'], { skipLocationChange: true });
    this.spinner.hide();
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

  getLeadsSoat() {
    this.spinner.show();
    this.leadService.getLeadsSoat(this.searchLeadsStart, this.searchLeadsEnd).subscribe(
      async result => {
        const data: any[] = <any[]>result;
        if (data.length > 0) {
          this.excelService.exportReportLeadsSoat(data, 'ReporteLeadsSoat');
        }
        this.spinner.hide();
      },
      err => {
        this.spinner.hide();
        console.log(err);
      }
    );

  }

  getLeadsVidaLey() {
    this.spinner.show();
    this.leadService.getLeadsVidaLey(this.searchLeadsStart, this.searchLeadsEnd).subscribe(
      async result => {
        const data: any[] = <any[]>result;
        if (data.length > 0) {
          this.excelService.exportReportLeadsVidaLey(data, 'ReporteLeadsVidaLey');
        }
        this.spinner.hide();
      },
      err => {
        this.spinner.hide();
        console.log(err);
      }
    );
  }

  getLeadsAP(): void {
    this.spinner.show();

    const payload: { fechaInicio: string, fechaFin: string } = {
      fechaInicio: moment(this.searchLeadsStart).format('DD/MM/YYYY'),
      fechaFin: moment(this.searchLeadsEnd).format('DD/MM/YYYY')
    };
    this.leadService.getLeadsAP(payload).subscribe({
      next: (response: any[]): void => {
        console.log(response);

        this.utilsService.exportExcel({
          fileName: 'reporte_leads_accidentes_personales',
          data: response.map((obj: any) => ({
            'Fecha y hora': obj.fechaCotizacion,
            'Razón social': obj.razonSocial ?? '-',
            'Nombre completo': obj.razonSocial ? '-' : `${obj.nombres ?? ''} ${obj.apellidoPaterno ?? ''} ${obj.apellidoMaterno ?? ''}`,
            'Correo electrónico': obj.correo,
            'Teléfono': obj.telefono ?? '-',
            'Ruc/DNI': obj.numeroDocumento,
            'Tipo de póliza': obj.tipoPoliza,
            'Tipo de producto': obj.tipoProducto,
            'Paso en el que se quedó': obj.paso,
            'Envío de comunicaciones': obj.privacidad,
            'Emitido': obj.emitido == 1 ? 'COMPRÓ' : 'NO COMPRÓ'
          }))
        });
      },
      error: (error: HttpErrorResponse): void => {
        console.error(error);
      },
      complete: (): void => {
        this.spinner.hide();
      }
    });
  }

  openModalLeads(): void {
    this.leadType = '';
    this.bsRangeValue = [];
    this.childModalLeads.show();
  }

  closeModalLeads(): void {
    this.childModalLeads.hide();
  }

  getLeads(): void {
    if (this.bsRangeValue.length > 0) {
      this.searchLeadsStart = this.bsRangeValue[0].toISOString();
      this.searchLeadsEnd = this.bsRangeValue[1].toISOString();

      switch (+this.leadType) {
        case 1:
          this.getLeadsSoat();
          break;
        case 2:
          this.getLeadsVidaLey();
          break;
        case 3:
          this.getLeadsAP();
          break;
      }
    }
  }
}
