import { Component, OnInit } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { NgxSpinnerService } from 'ngx-spinner';
import { BsDatepickerConfig } from 'ngx-bootstrap/datepicker';

import { RegularExpressions } from '@shared/regexp/regexp';
import { ChannelSalesModel } from '@shared/models/channel-point-sales/channel-point-sale.model';

import { UtilsService } from '@shared/services/utils/utils.service';
import { SalesHistoryService } from '../../../services/vida-devolucion/sales-history/sales-history.service';
import { VidaDevolucionService } from '../../../services/vida-devolucion/vida-devolucion.service';
import moment from 'moment';
import { ActivatedRoute, Router } from '@angular/router';
import { QuoteTrayService } from '@root/layout/broker/services/vida-devolucion/quote-tray/quote-tray.service';
import {
  IListadoProspectosRequest,
  IListadoProspectosResponse,
} from '../../../interfaces/vida-devolucion/listado-prospectos.interface';
import { AppConfig } from '@root/app.config';

@Component({
  selector: 'app-sales-history',
  templateUrl: './sales-history.component.html',
  styleUrls: ['./sales-history.component.scss'],
})
export class SalesHistoryComponent implements OnInit {
  bsConfigDefault: any;

  bsConfigCreationDate: Partial<BsDatepickerConfig>;
  bsConfigEmissionPolicy: Partial<BsDatepickerConfig>;
  bsConfigValidity: Partial<BsDatepickerConfig>;
  bsConfigValidityEnd: Partial<BsDatepickerConfig>;

  bsValueValidity: Date = new Date('01-01-2022');
  bsValueValidityEnd: Date = new Date();

  form: FormGroup;

  data: any[];
  title = '';
  /* N° DOCUMENTO */
  LimitdocumentNumber: {
    min: number;
    max: number;
  };

  listSalesHistory$ = new Array();

  listChannelSales$ = new Array();
  listBranches$ = new Array();
  listProducts$ = new Array();
  listComercialEjecutives$ = new Array();
  listTypeClient$ = new Array();

  // usuarioJefe-Supervisor
  userJefe: boolean;
  userSupervisor: boolean;
  available: boolean;
  p = 1;

  documentTypes = [
    {
      id: 2,
      desc: 'DNI',
    },
    {
      id: 4,
      desc: 'C.E',
    },
  ];
  nPolicy: any;

  constructor(
    private readonly formBuilder: FormBuilder,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private readonly salesHistoryService: SalesHistoryService,
    private readonly vidaDevolucionService: VidaDevolucionService,
    private readonly utilsService: UtilsService,
    private readonly spinner: NgxSpinnerService,
    private readonly _QuoteTrayService: QuoteTrayService
  ) {
    this.LimitdocumentNumber = {
      min: 8,
      max: 8,
    };
    this.available = false;
    this.userJefe = false;
    this.userSupervisor = false;
    this.bsConfigDefault = {
      dateInputFormat: 'DD/MM/YYYY',
      locale: 'es',
      containerClass: 'theme-dark-blue',
      showWeekNumbers: true,
    };

    this.bsConfigCreationDate =
      this.bsConfigEmissionPolicy =
      this.bsConfigValidity =
      this.bsConfigValidityEnd =
      Object.assign(
        {},
        {
          ...this.bsConfigDefault,
          maxDate: new Date(),
        }
      );

    this.form = this.formBuilder.group({
      idCanal: [null],
      idRamo: [null],
      idProducto: [null],
      idTipoDocumento: [{ value: 2, disabled: true }],
      numeroDocumento: [null],
      idProcess: [null],
      fechaInicio: [null],
      fechaFin: [null],
      ejecutivo: [null],
      typeClient: [null],
      nombres: [null],
      PrimerApellido: [null],
      SegundoApellido: [null],
    });

    this.resetFormFilters(false);

    this.formControl['idRamo'].disable();
    this.formControl['idProducto'].disable();

    this.setChannelSaleForm();
  }

  ngOnInit(): void {
    sessionStorage.removeItem(AppConfig.VIDADEVOLUCION_COMERCIAL_STORAGE);
    this.getUserHistory();
    this.getTypeUser();
    this.formValidations();
    this.getBranches();
    this.getComercialEjecutives();
    this.getChannelSales();
    this.listTypeClient$ = [
      {
        cliente: 'ASEGURADO',
        idClient: '1',
      },
      {
        cliente: 'CONTRATANTE',
        idClient: '2',
      },

    ];
    this.formControl['typeClient'].setValue('1');

  }

  get currentUser(): any {
    return this.vidaDevolucionService.currentUser;
  }

  set currentPage(p) {
    this.p = p;
    this.search();
  }

  get formControl(): { [key: string]: AbstractControl } {
    return this.form.controls;
  }
  getTypeUser() {
    console.log(this.currentUser.productoPerfil[0].idPerfil);
    const typeUser = this.currentUser.productoPerfil[0].idPerfil;
    if (+typeUser == 195) {
      this.userJefe = true;
      this.userSupervisor = false;
    } else if (+typeUser == 194) {
      this.userJefe = false;
      this.userSupervisor = true;
    }
  }
  getUserHistory() {
    if (!this.currentUser.comercial) {
      if (this.userJefe) {
        this.available = true;
      } else if (this.userSupervisor) {
        this.available = true;
      }
      this.available = false;
    } else {
      this.available = true;
    }
  }
  formValidations(): void {
    this.formControl['idTipoDocumento'].valueChanges.subscribe((_: string) => {
      switch (+_) {
        case 2:
          this.LimitdocumentNumber = {
            min: 8,
            max: 8,
          };
          break;
        default:
          this.LimitdocumentNumber = {
            min: 9,
            max: 12,
          };
          break;
      }
      this.formControl['numeroDocumento'].setValue(null, {
        emitEvent: false,
      });
      this.setLimitdocumentNumber();
    });
    this.formControl['numeroDocumento'].valueChanges.subscribe((_: string) => {
      if (!RegularExpressions.numbers.test(_)) {
        this.formControl['numeroDocumento'].setValue(
          _?.slice(0, _.length - 1) || null,
          {
            emitEvent: false,
          }
        );
      }
    });
    this.formControl['idProcess'].valueChanges.subscribe((_: string) => {
      if (!RegularExpressions.numbers.test(_)) {
        this.formControl['idProcess'].setValue(
          _?.slice(0, _.length - 1) || null,
          {
            emitEvent: false,
          }
        );
      }
    });

    // *OBTENER PRODUCTOS CUANDO SE CAMBIA DE RAMO
    this.formControl['idRamo'].valueChanges.subscribe((value: string) => {
      if (value) {
        this.getProducts();
      }
    });
  }

  getChannelSales(): void {
    this.utilsService.channelSales(this.currentUser['id']).subscribe({
      next: (response: ChannelSalesModel) => {
        this.listChannelSales$ = response.items;
        if (this.listChannelSales$.length == 1) {
          this.formControl['idCanal'].setValue(this.listChannelSales$[0].id);
          this.formControl['idCanal'].disable();
          if (+this.currentUser['profileId'] == 192) {
            this.setChannelSaleForm();
          }
        }
        this.search();
      },
      error: (error: HttpErrorResponse) => {
        console.error(error);
      },
    });
  }

  setChannelSaleForm(): void {
    if (+this.currentUser['profileId'] == 192) {
      this.listChannelSales$ = [
        {
          id: 2015000002,
          description: 'PROTECTA SA COMPAÑIA DE SEGUROS',
        },
        {
          id: 2021000004,
          description: 'VIDA DEVOLUCIÓN PROTECTA⁺',
        },
      ];
      this.formControl['idCanal'].setValue(0);
      this.formControl['idCanal'].enable();
    } else {
      this.listChannelSales$ = [
        {
          id: 2021000004,
          description: 'VIDA DEVOLUCIÓN PROTECTA⁺',
        },
      ];
      this.formControl['idCanal'].setValue(2021000004);
      // this.formControl['idCanal'].disable();
    }
  }

  getBranches(): void {
    this.utilsService.getBranches().subscribe({
      next: (response: any) => {
        this.listBranches$ = response;
        this.formControl['idRamo'].setValue(71);
        this.search();
      },
      error: (error: HttpErrorResponse) => {
        console.error(error);
      },
    });
  }

  getProducts(): void {
    const payload = {
      branchId: this.formControl['idRamo'].value,
      userType: this.currentUser['id'],
    };
    this.spinner.show();
    this.utilsService.getProducts(payload).subscribe({
      next: (response: any) => {
        this.spinner.hide();
        this.listProducts$ = response;
        this.formControl['idProducto'].setValue(1);
      },
      error: (error: HttpErrorResponse) => {
        console.error(error);
        this.spinner.hide();
      },
    });
  }

  getComercialEjecutives(): void {
    const payload = +this.currentUser['id'];
    this.salesHistoryService.getComercialEjecutives(payload).subscribe({
      next: (response: any) => {
        console.dir(response);
        this.listComercialEjecutives$ = response.listaEjecutivos;

        this.formControl['ejecutivo'].setValue(+this.currentUser['id']);
        console.log(+this.currentUser['id']);
        if (this.listComercialEjecutives$.length == 1) {
          this.formControl['ejecutivo'].disable();
        }

      },
      error: (error: HttpErrorResponse) => {
        console.error(error);
      },
    });
  }

  setLimitdocumentNumber(): void {
    this.formControl['numeroDocumento'].setValidators(
      Validators.compose([
        Validators.pattern(RegularExpressions.numbers),
        Validators.required,
        Validators.minLength(this.LimitdocumentNumber.min),
        Validators.maxLength(this.LimitdocumentNumber.max),
      ])
    );
  }

  resetFormFilters(search: boolean = true): void {
    this.formControl['idTipoDocumento'].setValue(2);
    this.formControl['numeroDocumento'].setValue(null);
    this.formControl['idProcess'].setValue(null);
    this.formControl['fechaInicio'].setValue(this.bsValueValidity);
    this.formControl['fechaFin'].setValue(new Date());
    this.formControl['ejecutivo'].setValue(+this.currentUser['id']);
    this.formControl['nombres'].setValue(null);
    this.formControl['PrimerApellido'].setValue(null);
    this.formControl['SegundoApellido'].setValue(null);
    this.setChannelSaleForm();
    if (search) {
      this.search(true);
    }
  }

  search(reset = false) {
    if (reset) {
      this.p = 1;
    }
    this.listSalesHistory$ = new Array();
    this.spinner.show();
    const payload = {
      idCanal: this.formControl['idCanal'].value || 0,
      idRamo: this.formControl['idRamo'].value || 0,
      idProducto: this.formControl['idProducto'].value || 0,
      idTipoDocumento: this.formControl['idTipoDocumento'].value || 0,
      numeroDocumento: this.formControl['numeroDocumento'].value || null,
      idProcess: this.formControl['idProcess'].value || 0,
      fechaInicio: moment(this.formControl['fechaInicio'].value).format(
        'DD/MM/YYYY'
      ),
      fechaFin: moment(this.formControl['fechaFin'].value).format('DD/MM/YYYY'),
      indice: this.p,
      cantidadRegistros: 10,
      usuario: +this.formControl['ejecutivo'].value || +this.currentUser['id'],
      nombres: this.formControl['nombres'].value || null,
      primerApellido: this.formControl['PrimerApellido'].value || null,
      segundoApellido: this.formControl['SegundoApellido'].value || null,
      asegurado: this.formControl['typeClient'].value == '1' ? true : false,
    };
    this.salesHistoryService.getSalesHistory(payload).subscribe({
      next: (response: any) => {
        this.spinner.hide();
        this.listSalesHistory$ = response?.listadoVentas || [];
      },
      error: (error: HttpErrorResponse) => {
        console.error(error);
        this.spinner.hide();
      },
    });
  }
  getDocumentDescription(id: number) {
    return this.documentTypes?.find((x) => x.id == +id)?.desc || '';
  }

  downloadReport(): void {
    const payload = {
      idCanal: this.formControl['idCanal'].value || 0,
      idRamo: this.formControl['idRamo'].value || 0,
      idProducto: this.formControl['idProducto'].value || 0,
      idTipoDocumento: this.formControl['idTipoDocumento'].value || 0,
      numeroDocumento: this.formControl['numeroDocumento'].value || null,
      idProcess: this.formControl['idProcess'].value || 0,
      fechaInicio: moment(this.formControl['fechaInicio'].value).format(
        'DD/MM/YYYY'
      ),
      fechaFin: moment(this.formControl['fechaFin'].value).format('DD/MM/YYYY'),
      indice: this.p,
      cantidadRegistros: this.listSalesHistory$[0]?.cantidadRegistros || 1000,
      usuario: +this.formControl['ejecutivo'].value || +this.currentUser['id'],
    };
    this.spinner.show();
    this.salesHistoryService.getSalesHistory(payload).subscribe({
      next: (response: any) => {
        console.log(response);
        this.spinner.hide();
        const data: Array<any> = response?.listadoVentas || [];
        const payloadExport = data.map((values: any) => ({
          ...values,
          tipoDocumento: this.getDocumentDescription(values.tipoDocumento),
        }));
        this.salesHistoryService.downloadReportHistory(payloadExport);
      },
      error: (error: HttpErrorResponse) => {
        console.error(error);
        this.spinner.hide();
      },
    });
  }
  setViewCotizacion(data) {
    let params = {};
    params = {
      cliente: data.idCliente,
      // viene de historial, se dirige a resumen
      policyClient: 1,
      start: true,
    };
    this.vidaDevolucionService.storage = {
      urlPath: '/extranet/vidadevolucion/historial',
      isNavigate: true,
    };
    this.router.navigate(['broker/vidadevolucion/resumen'], {
      queryParams: params,
    });
    window.scrollTo(0, 0);
  }
}
