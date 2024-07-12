import {
  Component,
  OnInit,
  TemplateRef,
  ViewContainerRef,
  ViewChild,
} from '@angular/core';
import {
  FormGroup,
  FormBuilder,
  Validators,
  AbstractControl,
} from '@angular/forms';
import { UtilsService } from '@shared/services/utils/utils.service';
import { BandejaTramitesService } from '../../../services/portal-tramites/bandeja-tramites.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { Router } from '@angular/router';
import { animate, style, transition, trigger } from '@angular/animations';
import { HttpErrorResponse } from '@angular/common/http';
import { ChannelSalesModel } from '@shared/models/channel-point-sales/channel-point-sale.model';
import { BsDatepickerConfig } from 'ngx-bootstrap/datepicker';
import {
  IDepartamentoModel,
  IDistritoModel,
  IProvinciaModel,
  ParametersResponse,
} from '@shared/models/ubigeo/parameters.model';
import { EmisionService } from '@root/layout/client/shared/services/emision.service';
import { EventStrings } from '@root/layout/broker/shared/events/events';
import { AppConfig } from '@root/app.config';
import moment from 'moment';

@Component({
  selector: 'app-bandeja-tramites',
  templateUrl: './bandeja-tramites.component.html',
  styleUrls: ['./bandeja-tramites.component.scss'],
  animations: [
    trigger('fade', [
      transition(':enter', [
        style({
          opacity: 0,
        }),
        animate(
          250,
          style({
            opacity: 1,
          })
        ),
      ]),
    ]),
  ],
})
export class BandejaTramitesComponent implements OnInit {
  datePickerConfig: Partial<BsDatepickerConfig>;

  form: FormGroup;
  formMotiveReject: FormGroup;

  proceduresData$: any[] = [];

  selectedProcess: any;
  selectMpGroup: number;

  dataTransactSelected$: any;
  transactTypes$: any[] = [];
  transactStates$: any[] = [];
  transactRecord$: any[] = [];
  rejectTypes$: any[] = [];

  parameters$: ParametersResponse;
  departments$: IDepartamentoModel[] = [];
  provinces$: IProvinciaModel[] = [];
  districts: IDistritoModel[] = [];

  p: number = 1;

  channelSales$: any[] = [];
  message: string;
  isMessageValid: boolean = false;
  searchAgain: boolean;

  isChildModal: boolean = false;

  private readonly operationProfiles: number[] = [20, 151, 155];

  @ViewChild('modalProcedure', { static: true, read: TemplateRef })
  _modalProcedure: TemplateRef<any>;
  @ViewChild('modalHistory', { static: true, read: TemplateRef })
  _modalHistory: TemplateRef<any>;
  @ViewChild('modalSendOperations', { static: true, read: TemplateRef })
  _modalSendOperations: TemplateRef<any>;
  @ViewChild('modalConfirmCancelTransact', { static: true, read: TemplateRef })
  _modalConfirmCancelTransact: TemplateRef<any>;
  @ViewChild('modalConfirmAceptTransact', { static: true, read: TemplateRef })
  _modalConfirmAceptTransact: TemplateRef<any>;
  @ViewChild('modalConfirmRejectTransact', { static: true, read: TemplateRef })
  _modalConfirmRejectTransact: TemplateRef<any>;
  @ViewChild('modalMessage', { static: true, read: TemplateRef })
  _modalMessage: TemplateRef<any>;
  @ViewChild('modalMotiveReject', { static: true, read: TemplateRef })
  _modalMotiveReject: TemplateRef<any>;

  constructor(
    private readonly _utilsService: UtilsService,
    private _emissionService: EmisionService,
    private readonly _builder: FormBuilder,
    private readonly _vc: ViewContainerRef,
    private readonly _BandejaTramitesService: BandejaTramitesService,
    private readonly _spinner: NgxSpinnerService,
    private readonly _Router: Router
  ) {
    this.searchAgain = false;
    this.datePickerConfig = Object.assign(
      {},
      {
        locale: 'es',
        showWeekNumbers: false,
        maxDate: new Date(),
        dateInputFormat: 'DD/MM/YYYY',
      }
    );

    this.form = this._builder.group({
      transactId: [null, Validators.pattern(this._utilsService.onlyNumbers)],
      channelCode: [0],
      policy: [null, Validators.pattern(this._utilsService.onlyNumbers)],
      startDate: [new Date('01-01-2023')],
      endDate: [new Date()],
      licensePlate: [null, Validators.pattern(this._utilsService.alphaNumeric)],
      transactTypeId: [0],
      stateId: [0],
    });

    this.formMotiveReject = this._builder.group({
      motive: [null, Validators.required],
      observation: [null, Validators.required],
    });
  }

  get currentUser(): any {
    return JSON.parse(localStorage.getItem('currentUser'));
  }

  get isOperaciones(): boolean {
    return this.operationProfiles.includes(+this.currentUser?.profileId);
  }

  set currentPage(p) {
    this.p = p;
    this.listadoTramites();
  }

  ngOnInit(): void {
    sessionStorage.removeItem('current-page-sp');
    this.getFilters();
    this.channelSales();
    this.getParameters();

    this.f['transactId'].valueChanges.subscribe((val) => {
      if (this.f['transactId'].hasError('pattern')) {
        this.f['transactId'].setValue(val.substring(0, val.length - 1));
      }
    });
    this.f['policy'].valueChanges.subscribe((val) => {
      if (this.f['policy'].hasError('pattern')) {
        this.f['policy'].setValue(val.substring(0, val.length - 1));
      }
    });

    this.f['licensePlate'].valueChanges.subscribe((val) => {
      if (this.f['licensePlate'].hasError('pattern')) {
        this.f['licensePlate'].setValue(val.substring(0, val.length - 1));
      }
    });
  }

  get f(): { [key: string]: AbstractControl } {
    return this.form.controls;
  }

  get fm(): { [key: string]: AbstractControl } {
    return this.formMotiveReject.controls;
  }

  set mpGroupSelected(val: number) {
    this.selectMpGroup = this.selectMpGroup == val ? null : val;
  }

  get mpGroupSelected(): number {
    return this.selectMpGroup;
  }

  get dataValidApeseg(): boolean {
    const newValues = this.dataTransactSelected$?.datosSolicitados;

    const dataVigencia = newValues?.fechaInicioVigencia ? true : false;
    const dataPlaca = newValues?.placa ? true : false;
    const dataUso = newValues?.uso ? true : false;
    const dataClase = newValues?.clase ? true : false;

    return dataVigencia || dataPlaca || dataUso || dataClase;
  }

  resetForm(): void {
    this.form.reset();
    this.f['channelCode'].setValue(
      this.currentUser['id'] == 3822
        ? 0
        : (this.channelSales$ || [])[0]?.id || this.currentUser.canal
    );
    this.f['startDate'].setValue(new Date('01-01-2022'));
    this.f['endDate'].setValue(new Date());
    this.f['transactTypeId'].setValue(0);
    this.f['stateId'].setValue(0);
    this.listadoTramites(true);
  }

  getParameters(): void {
    this._utilsService.parameters().subscribe(
      (response: ParametersResponse) => {
        this.parameters$ = response;
        this.departments$ = response.ubigeos;
      },
      (error: HttpErrorResponse) => {
        console.error(error);
      }
    );
  }

  resetAll(): void {
    this.searchAgain = false;
    this.mpGroupSelected = null;
    this.formMotiveReject.reset();
  }

  disableSpinner() {
    setTimeout(() => {
      this._spinner.hide();
    }, 500);
  }

  downloadPdf(fileName: string) {
    const url = `${AppConfig.PATH_PDF_FILES}/${fileName}`;
    const a = document.createElement('a');
    a.setAttribute('href', url);
    a.setAttribute('target', '_blank');
    a.setAttribute('style', 'display:none;');
    document.body.appendChild(a);
    a.click();
    a.remove();
  }

  downloadDigitalPdf(response) {
    if (response) {
      let linkSource = 'data:application/pdf;base64,';
      linkSource += response.file;
      const a = document.createElement('a');
      a.setAttribute('href', linkSource);
      a.setAttribute('download', response.id);
      a.setAttribute('target', '_blank');
      a.setAttribute('style', 'display:none;');
      document.body.appendChild(a);
      a.click();
      a.remove();
    }
  }

  onImprimir(numeroPoliza: number) {
    this._spinner.show();

    if (numeroPoliza.toString().substr(0, 1) === '7') {
      this._emissionService.generarPolizaDigitalPdf(numeroPoliza).subscribe(
        (res) => {
          this.downloadDigitalPdf(res);
          this.disableSpinner();

          this._emissionService
            .registrarEvento(
              `Descarga de constancia SOAT : ${numeroPoliza}`,
              EventStrings.HISTORIAL_IMPRIMIRDIGITAL
            )
            .subscribe();
        },
        (err) => {
          console.log(err);
          this.disableSpinner();
        }
      );
    } else {
      this._emissionService.generarPolizaPdf(numeroPoliza).subscribe(
        (res) => {
          this.downloadPdf(res.fileName);
          this.disableSpinner();
        },
        (err) => {
          console.log(err);
          this.disableSpinner();
        }
      );
    }
  }

  openModalProcedure(data): void {
    this.selectProcess = data;
    this._spinner.show();

    this._BandejaTramitesService.transactRequest(data.idTramite).subscribe(
      (response: any) => {
        if (response.data.success && response.data) {
          this.dataTransactSelected$ = response.data;
          this._vc.createEmbeddedView(this._modalProcedure);
        }
        this._spinner.hide();
      },
      (error: HttpErrorResponse) => {
        console.error(error);
        this._spinner.hide();
      }
    );

    const idTipoTramite = +data.idTipoTramite;

    this._BandejaTramitesService.filters(idTipoTramite).subscribe(
      (response: any) => {
        if (response.data.success) {
          this.rejectTypes$ = response.data.motivosRechazo;
        }
      },
      (error: HttpErrorResponse) => {
        console.error(error);
      }
    );
  }

  closeModal(): void {
    if (this.isChildModal) {
      this._vc.remove();
      this._vc.createEmbeddedView(this._modalProcedure);
      this.isChildModal = false;
      return;
    }
    this._vc.clear();
    if (this.searchAgain) {
      this.listadoTramites();
    }
    this.resetAll();
  }

  listadoTramites(restart: boolean = false) {
    if (restart) {
      this.p = 1;
    }
    const req = {
      ...this.form.getRawValue(),
      currentPage: this.p,
    };
    this.proceduresData$ = [];
    this._spinner.show();
    this._BandejaTramitesService.listadoTramites(req).subscribe(
      (response: any) => {
        if (response.data.success && response.data.tramites.length) {
          this.proceduresData$ = response.data.tramites;
          if (this.isOperaciones) {
            this.proceduresData$ = this.proceduresData$.filter(
              (x) => x.idEstadoTramite != 1
            );
          }
        }
        this._spinner.hide();
      },
      (error: any) => {
        console.log(error);
        this._spinner.hide();
      }
    );
  }

  navigateNuevoTramite(type: number) {
    if (type == 2) {
      return;
    }
    this._Router.navigate(['/extranet/portal-tramites/poliza'], {
      queryParams: {
        type: type,
      },
      queryParamsHandling: 'merge',
    });
  }

  private set selectProcess(process: any) {
    this.selectedProcess = process;
  }

  getFilters(): void {
    const idTipoTramite = 0;

    this._BandejaTramitesService.filters(idTipoTramite).subscribe(
      (response: any) => {
        if (response.data.success) {
          this.transactTypes$ = response.data.tipoTramite;
          this.transactStates$ = response.data.estadosTramite;

          this.f['transactTypeId'].setValue(1);
        }
      },
      (error: HttpErrorResponse) => {
        console.error(error);
      }
    );
  }

  channelSales(): void {
    this._utilsService.channelSales(+this.currentUser['id']).subscribe(
      (response: ChannelSalesModel) => {
        if (response.items.length) {
          this.channelSales$ = response.items;
          if (this.channelSales$.length == 1) {
            this.f['channelCode'].setValue(this.channelSales$[0].id);
          }
        }
        this.listadoTramites();
      },
      (error: HttpErrorResponse) => {
        console.error(error);
      }
    );
  }

  getRecord(_: any): void {
    this.selectedProcess = _;
    this._spinner.show();
    this._BandejaTramitesService.getRecord(_.idTramite).subscribe(
      (response: any) => {
        if (response.data.success && response.data.historial.length) {
          this.transactRecord$ = response.data.historial;
        }
        this._vc.createEmbeddedView(this._modalHistory);
        this._spinner.hide();
      },
      (error: HttpErrorResponse) => {
        console.error(error);
        this._spinner.hide();
      }
    );
  }

  downloadFileTransact(_: any): void {
    this._utilsService.downloadFile({
      /* fileName: `${_.tipoDocumento}_${_.nombreArchivo}`, */
      fileName: `${_.nombreArchivo}`,
      fileBase64: _.archivo,
    });
  }

  sendToOperations(): void {
    const payload = {
      idTramite: this.selectedProcess.idTramite,
      idUsuario: 1234,
    };
    this.closeModal();
    this.searchAgain = true;
    this._spinner.show();
    this._BandejaTramitesService.sendToOperations(payload).subscribe(
      (response: any) => {
        this._spinner.hide();
        if (response.data.success) {
          this.isMessageValid = true;
          this.message = `El trámite Nro ${this.selectedProcess.idTramite} se envió a operaciones correctamente`;
        } else {
          this.isMessageValid = false;
          this.message = `Ocurrió un problema al enviar el trámite Nro ${this.selectedProcess.idTramite} a operaciones`;
        }
        this._vc.createEmbeddedView(this._modalMessage);
      },
      (error: HttpErrorResponse) => {
        console.error(error);
        this._spinner.hide();
        this.isMessageValid = false;
        this.message = `Ocurrió un problema al enviar el trámite Nro ${this.selectedProcess.idTramite} a operaciones`;
        this._vc.createEmbeddedView(this._modalMessage);
      }
    );
  }

  openModalConfirmCancelTransact(_: any): void {
    this.selectProcess = _;
    this._vc.createEmbeddedView(this._modalConfirmCancelTransact);
  }

  cancelTransact(): void {
    const payload = {
      transactId: this.selectedProcess.idTramite,
      userId: +this.currentUser['id'],
    };
    this.closeModal();
    this.searchAgain = true;
    this._spinner.show();
    this._BandejaTramitesService.cancelTransact(payload).subscribe(
      (response: any) => {
        if (response.data.success) {
          this.isMessageValid = true;
          this.message = `Se canceló correctamente el trámite Nro ${this.selectedProcess.idTramite}`;
        } else {
          this.isMessageValid = false;
          this.message = `Ocurrió un error al cancelar el trámite Nro ${this.selectedProcess.idTramite}`;
        }
        this._vc.createEmbeddedView(this._modalMessage);
        this._spinner.hide();
      },
      (error: HttpErrorResponse) => {
        console.error(error);
        this.isMessageValid = false;
        this.message = `Ocurrió un error al cancelar el trámite Nro ${this.selectedProcess.idTramite}`;
        this._vc.createEmbeddedView(this._modalMessage);
        this._spinner.hide();
      }
    );
  }

  openModalConfirmAceptTransact(): void {
    this.isChildModal = true;
    this._vc.clear();
    this._vc.createEmbeddedView(this._modalConfirmAceptTransact);
  }

  aceptTransact(): void {
    const payload = {
      idTramite: this.selectedProcess.idTramite,
      idUsuario: +this.currentUser['id'],
    };
    this._spinner.show();
    this.searchAgain = true;
    this._BandejaTramitesService.aceptTransact(payload).subscribe(
      (response: any) => {
        if (response.data.success) {
          this.isMessageValid = true;
          this.message =
            'Se aprobó correctamente el trámite Nro: ' +
            this.selectedProcess.idTramite;

          if (this.dataValidApeseg) {
            this.sendApeseg(response.data.numeroPoliza);
          }
        } else {
          this.isMessageValid = false;
          this.message =
            'Ocurrió un error al intentar aprobar el trámite Nro: ' +
            this.selectedProcess.idTramite;
        }
        this._spinner.hide();
        this.isChildModal = false;
        this._vc.clear();
        this._vc.createEmbeddedView(this._modalMessage);
      },
      (error: HttpErrorResponse) => {
        console.error(error);
        this._spinner.hide();
        this.isChildModal = false;
        this.isMessageValid = false;
        this.message = `Ocurrió un error al intentar aprobar el trámite Nro: ${this.selectedProcess.idTramite}`;
        this._vc.remove();
        this._vc.createEmbeddedView(this._modalMessage);
      }
    );
  }

  sendApeseg(dataPolicy: string): void {
    const payload = {
      policy: dataPolicy,
      userId: +this.currentUser['id'],
      startValidity: moment(new Date()).format(),
      endValidity: moment(new Date()).format(),
    };

    this._BandejaTramitesService.sendApeseg(payload).subscribe(
      (response: any) => {
        console.log('enviado a APESEG');
      },
      (error: HttpErrorResponse) => {
        console.error('enviado a APESEG');
      }
    );

    if (this.dataTransactSelected$?.datosSolicitados?.fechaInicioVigencia) {
      this.cancelApeseg();
    }
  }

  cancelApeseg(): void {
    const data = {
      numeroPoliza: this.selectedProcess.poliza,
      idTramite: this.selectedProcess.idTramite,
    };
    this._BandejaTramitesService.cancelApeseg(data).subscribe(
      (response: any) => {
        console.log('enviado a anular APESEG');
      },
      (error: HttpErrorResponse) => {
        console.error('error al anular APESEG');
      }
    );
  }

  rejectTransact(): void {
    const payload = {
      idTramite: this.selectedProcess.idTramite,
      idUsuario: +this.currentUser['id'],
      IdMotivo: this.fm['motive'].value,
      Observacion: this.fm['observation'].value || null,
    };
    this._spinner.show();
    this.searchAgain = true;
    this._BandejaTramitesService.rejectTransact(payload).subscribe(
      (response: any) => {
        if (response.data.success) {
          this.isMessageValid = true;
          this.message =
            'Se rechazó correctamente el trámite Nro: ' +
            this.selectedProcess.idTramite;
        } else {
          this.isMessageValid = false;
          this.message =
            'Ocurrió un error al intentar rechazar el trámite Nro: ' +
            this.selectedProcess.idTramite;
        }
        this._spinner.hide();
        this.isChildModal = false;
        this._vc.clear();
        this._vc.createEmbeddedView(this._modalMessage);
      },
      (error: HttpErrorResponse) => {
        console.error(error);
        this.isMessageValid = false;
        this.message =
          'Ocurrió un error al intentar rechazar el trámite Nro: ' +
          this.selectedProcess.idTramite;
        this.isChildModal = false;
        this._spinner.hide();
        this._vc.clear();
        this._vc.createEmbeddedView(this._modalMessage);
      }
    );
  }

  openModalReject(): void {
    this._vc.clear();
    this.isChildModal = true;
    this._vc.createEmbeddedView(this._modalMotiveReject);
  }

  getDocumentDescription(id: number): string {
    switch (id) {
      case 1:
        return 'RUC';
      case 2:
        return 'DNI';
      case 4:
        return 'CE';
    }
    return '-';
  }
}
