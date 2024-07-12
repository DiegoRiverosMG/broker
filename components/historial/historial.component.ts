import { Facturacion } from './../../../client/shared/models/facturacion.model';
import { Province } from './../../../../shared/models/province/province';
import { Cliente } from './../../models/cliente/cliente';
import { ContratanteComponent } from './../contratante/contratante.component';
import { Comprobante } from './../../../client/shared/models/comprobante.model';
import { Anulacion } from './../../models/historial/anulacion';
import { FormGroup, FormBuilder, Validators, FormControl, AbstractControl } from '@angular/forms';
import { PdfDigitalReenvio } from './../../models/historial/pdfdigitalreenvio';
import { Component, ElementRef, OnInit, TemplateRef, ViewChild, ViewContainerRef } from '@angular/core';
import 'rxjs/add/observable/of';
import 'rxjs/add/operator/map';
import { isNullOrUndefined } from 'util';
import { HistorialService } from '../../services/historial/historial.service';
import { Historial } from '../../models/historial';
import { UtilityService } from '../../../../shared/services/general/utility.service';
import { ExcelService } from '../../../../shared/services/excel/excel.service';
import { EmisionService } from '../../../client/shared/services/emision.service';
import { AppConfig } from '../../../../app.config';
import { Router } from '@angular/router';
import { BsDatepickerConfig } from 'ngx-bootstrap/datepicker';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { DatePipe } from '@angular/common';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Step05Service } from '../../services/step05/step05.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { UbigeoService } from '../../../../shared/services/ubigeo/ubigeo.service';
import { Step03Service } from '../../services/step03/step03.service';
import { VehiculoService } from '../../services/vehiculo/vehiculo.service';
import { EventStrings } from '../../shared/events/events';
import { RegularExpressions } from '../../../../shared/regexp/regexp';
import { DocumentInfoResponseModel } from '../../../../shared/models/document-information/document-information.model';
import { UtilsService } from '../../../../shared/services/utils/utils.service';

@Component({
  selector: 'app-historial',
  moduleId: module.id,
  templateUrl: 'historial.component.html',
  styleUrls: ['historial.component.scss'],
})
export class HistorialComponent implements OnInit {
  @ViewChild('childModal', { static: true }) childModal: ModalDirective;
  @ViewChild('childModalConfirmasivo', { static: true })
  childModalConfirmasivo: ModalDirective;
  @ViewChild('childModalAnulacion', { static: true })
  childModalAnulacion: ModalDirective;
  @ViewChild('childModalMensaje', { static: true })
  childModalMensaje: ModalDirective;
  @ViewChild('childModalFacturar', { static: true })
  childModalFacturar: ModalDirective;
  @ViewChild('appcontrantante') appcontrantante: ContratanteComponent;

  contratante = new Cliente();
  blockContratante = false;

  // datepicker
  public bsConfig: Partial<BsDatepickerConfig>;
  // paginacion
  page: number;
  /*Variables de paginacion */
  public itemsPerPage = 20;
  public totalItems = 0;
  public currentPage = 0;
  paginacion: any = {};

  rotate = true;
  maxSize = 5;
  filter: any = {};
  fecha = new Date();
  dia = this.fecha.getDate();
  mes = this.fecha.getMonth() === 0 ? 1 : this.fecha.getMonth();
  anio = this.fecha.getFullYear();

  bsValueIni: Date = new Date();
  bsValueFin: Date = new Date();

  historial: Historial;
  resultStateSalesReport = '0';
  resultSalesModeReport = '0';
  fExistRegistro: any = false;
  historialGrilla: any[];
  historialGrillaExport: any[];
  ListSalesMode: any[];
  returnedArray: Historial[];
  tipoBuscar = '';
  primaBuscar = '';
  estadoBuscar = '';
  fechaBuscar: Date;
  resultError = true;
  listErrores = [];
  msgErrorLista = '';
  username: string;
  resultChannelSalesReport = '';
  resultChannelPointReport = '';

  canal = '';
  id = 0;
  indpuntoVenta = 0;
  numeroPoliza: string;
  message: string;
  flag: string;
  msjHeader: string;
  email: string;
  messageinfo: any;
  bHideBody: Boolean;
  tipoReporte = 0;

  anulacionForm: FormGroup;
  anulacionPolicy: number;
  anulacionSubmit = false;
  facturacionForm: FormGroup;

  masterSelected: boolean;
  invoiceList: any[];
  departamentos: Province[] = [];

  messagevalidation: string;
  showchkFacturar = false;

  minutosanulacion: number;

  emailForm: FormGroup;

  DOCUMENTTYPES = {
    '1': 'RUC',
    '2': 'DNI',
    '4': 'CE',
    '15': 'PTP'
  };
  SEARCHTYPES = {
    document: '1',
    names: '2'
  };
  PERSONTYPES = {
    natural: '1',
    business: '2'
  };
  documentNumberContractorValidations: {
    minLength: number;
    maxLength: number;
  } = {
    minLength: 8,
    maxLength: 8
  };

  formContractor: FormGroup = this.fb.group({
    searchType: [this.SEARCHTYPES.document],
    personType: [this.PERSONTYPES.natural],
    documentType: ['2', [Validators.required]],
    documentNumber: ['', [
      Validators.pattern(RegularExpressions.numbers),
      Validators.minLength(
        this.documentNumberContractorValidations.minLength
      ),
      Validators.maxLength(
        this.documentNumberContractorValidations.maxLength
    )]],
    legalName: [''],
    names: [''],
    apePat: [''],
    apeMat: ['']
  });

  listContractors$: any[] = [];
  contractorSelected: any = {};
  currentPageListContractors: number = 1;
  clientCodeContractorControl: FormControl = this.fb.control('');
  contractorControl: FormControl = this.fb.control('');
  plateControl: FormControl = this.fb.control('', [Validators.pattern(RegularExpressions.alphaNumeric)]);

  @ViewChild('modalContractor', { static: true, read: TemplateRef })
  modalContractor: TemplateRef<ElementRef>;

  constructor(
    private ubigeoService: UbigeoService,
    private step03service: Step03Service,
    private historialService: HistorialService,
    public utilityService: UtilityService,
    private excelService: ExcelService,
    private emissionService: EmisionService,
    private readonly toolService: VehiculoService,
    private router: Router,
    public datePipe: DatePipe,
    private readonly fb: FormBuilder,
    private spinner: NgxSpinnerService,
    private formBuilder: FormBuilder,
    private step05service: Step05Service,
    private readonly vcr: ViewContainerRef,
    private readonly utilsService: UtilsService
  ) {
    this.filter.StatePolicy = '';
    this.filter.TypePolicy = '';
    this.filter.NumPolicy = '';
    this.bsValueIni.setMonth(0, 1);
    this.paginacion.ItemsPerPage = this.itemsPerPage;
    this.paginacion.TotalItems = this.totalItems;
    this.paginacion.CurrentPage = this.currentPage;
    this.bsConfig = Object.assign(
      {},
      {
        dateInputFormat: 'DD/MM/YYYY',
        locale: 'es',
        showWeekNumbers: false,
      }
    );
  }

  ngOnInit() {
    this.spinner.show();
    this.msgErrorLista = 'No se encontraron Registros..';
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    this.id = currentUser && currentUser.id;
    this.canal = currentUser && currentUser.canal;
    this.indpuntoVenta = currentUser && currentUser.indpuntoVenta;
    this.crearFormularioAnulacion();
    this.listarDepartamentos();
    this.crearFormularioFacturacion();
    this.obtenerTiempoAnulacion();
    this.formContractorValidations();
    this.step05service
      .getCanalTipoPago(this.canal, AppConfig.SETTINGS_SALE)
      .subscribe(
        (res) => {
          this.tipoReporte = 0;
          if (res !== null) {
            this.tipoReporte = res.btiporeporte;
          }
          this.disableSpinner();
        },
        (err) => {
          this.disableSpinner();
          console.log(err);
        }
      );
    this.invoiceList = [];

    this.plateControl.valueChanges.subscribe((value: string) => {
      if (!value) {
        return;
      }
      if (this.plateControl.hasError('pattern')) {
        this.plateControl.setValue(value.slice(0, value.length - 1));
      }
    });

    this.emailForm = this.fb.group({
      email: [
        '',
        [Validators.required, Validators.pattern(AppConfig.CUSTOM_MAIL_DOMAIN)],
      ],
    });
    this.emissionService
      .registrarEvento('', EventStrings.HISTORIAL_INGRESAR)
      .subscribe();
  }

  get cForm() {
    return this.emailForm.controls;
  }

  get formContractorControl(): { [key: string]: AbstractControl } {
    return this.formContractor.controls;
  }

  get currentUser(): any {
    return JSON.parse(localStorage.getItem('currentUser') ?? '{}');
  }

  formContractorValidations(): void {
    this.formContractor.valueChanges.subscribe((): void => {
      this.contractorSelected = {};
      this.listContractors$ = [];
    });

    this.formContractorControl['searchType'].valueChanges.subscribe(
      (value: string): void => {
        this.resetFormContractor();

        if (value == this.SEARCHTYPES.document) {
          this.formContractorControl['documentNumber'].enable({
            emitEvent: false
          });
          this.formContractorControl['legalName'].disable({
            emitEvent: false
          });
          this.formContractorControl['names'].disable({
            emitEvent: false
          });
          this.formContractorControl['apePat'].disable({
            emitEvent: false
          });
          this.formContractorControl['apeMat'].disable({
            emitEvent: false
          });
          return;
        }

        this.formContractorControl['personType'].setValue(
          this.PERSONTYPES.natural
        );
        this.formContractorControl['documentNumber'].disable({
          emitEvent: false
        });
        this.formContractorControl['legalName'].enable({
          emitEvent: false
        });
        this.formContractorControl['names'].enable({
          emitEvent: false
        });
        this.formContractorControl['apePat'].enable({
          emitEvent: false
        });
        this.formContractorControl['apeMat'].enable({
          emitEvent: false
        });
      }
    );

    this.formContractorControl['personType'].valueChanges.subscribe(
      (value: string): void => {
        this.formContractorControl['names'].setValue('');
        this.formContractorControl['apePat'].setValue('');
        this.formContractorControl['apeMat'].setValue('');
        this.formContractorControl['legalName'].setValue('');

        const updateControlsAndValidity = (): void => {
          this.formContractorControl['names'].updateValueAndValidity();
          this.formContractorControl['apePat'].updateValueAndValidity();
          this.formContractorControl['apeMat'].updateValueAndValidity();
          this.formContractorControl['legalName'].updateValueAndValidity();
        };

        if (+value === +this.PERSONTYPES.natural) {
          this.formContractorControl['documentType'].setValue('2');

          this.formContractorControl['names'].setValidators([
            Validators.pattern(RegularExpressions.text),
            Validators.required,
            Validators.minLength(3)
          ]);
          this.formContractorControl['apePat'].setValidators([
            Validators.pattern(RegularExpressions.text),
            Validators.required,
            Validators.minLength(3)
          ]);
          this.formContractorControl['apeMat'].setValidators([
            Validators.pattern(RegularExpressions.text),
            Validators.minLength(3)
          ]);
          this.formContractorControl['legalName'].clearValidators();
          updateControlsAndValidity();
          return;
        }

        this.formContractorControl['legalName'].setValidators([
          Validators.required,
          Validators.minLength(4)
        ]);
        this.formContractorControl['names'].clearValidators();
        this.formContractorControl['apePat'].clearValidators();
        this.formContractorControl['apeMat'].clearValidators();
        updateControlsAndValidity();

        this.formContractorControl['documentType'].setValue('1');
      }
    );

    this.formContractorControl['documentType'].valueChanges.subscribe(
      (value: string): void => {
        switch (+value) {
          case 1:
            this.documentNumberContractorValidations = {
              minLength: 11,
              maxLength: 11
            };
            this.formContractorControl['documentNumber'].setValidators([
              Validators.pattern(RegularExpressions.numbers),
              Validators.minLength(11),
              Validators.maxLength(11),
              Validators.required
            ]);
            break;
          case 2:
            this.documentNumberContractorValidations = {
              minLength: 8,
              maxLength: 8
            };
            this.formContractorControl['documentNumber'].setValidators([
              Validators.pattern(RegularExpressions.numbers),
              Validators.minLength(8),
              Validators.maxLength(8),
              Validators.required
            ]);
            break;
          case 4:
            this.documentNumberContractorValidations = {
              minLength: 9,
              maxLength: 12
            };
            this.formContractorControl['documentNumber'].setValidators([
              Validators.pattern(RegularExpressions.alpha),
              Validators.minLength(9),
              Validators.maxLength(12),
              Validators.required
            ]);
            break;
        }

        this.formContractorControl['documentNumber'].updateValueAndValidity();
        this.formContractorControl['documentNumber'].setValue('');
      }
    );

    this.formContractorControl['documentNumber'].valueChanges.subscribe(
      (value: string): void => {
        if (
          this.formContractorControl['documentNumber'].hasError('pattern') ||
          this.formContractorControl['documentNumber'].hasError('maxlength')
        ) {
          this.formContractorControl['documentNumber'].setValue(
            value.slice(0, value.length - 1)
          );
        }
      }
    );

    this.formContractorControl['names'].valueChanges.subscribe(
      (value: string): void => {
        if (!value) {
          return;
        }

        if (this.formContractorControl['names'].hasError('pattern')) {
          this.formContractorControl['names'].setValue(
            value.slice(0, value.length - 1)
          );
        }
      }
    );

    this.formContractorControl['apePat'].valueChanges.subscribe(
      (value: string): void => {
        if (!value) {
          return;
        }

        if (this.formContractorControl['apePat'].hasError('pattern')) {
          this.formContractorControl['apePat'].setValue(
            value.slice(0, value.length - 1)
          );
        }
      }
    );

    this.formContractorControl['apeMat'].valueChanges.subscribe(
      (value: string): void => {
        if (!value) {
          return;
        }

        if (this.formContractorControl['apeMat'].hasError('pattern')) {
          this.formContractorControl['apeMat'].setValue(
            value.slice(0, value.length - 1)
          );
        }
      }
    );
  }

  showError(controlName: string): boolean {
    return (
      this.cForm[controlName].invalid &&
      (this.cForm[controlName].dirty || this.cForm[controlName].touched)
    );
  }

  crearFormularioAnulacion() {
    this.anulacionForm = this.formBuilder.group({
      tipoanulacion: ['', Validators.required],
      observacion: [
        '',
        [
          Validators.required,
          Validators.minLength(20),
          Validators.maxLength(250),
        ],
      ],
    });
    this.asignarValoresDefaultAnulacion();
  }

  crearFormularioFacturacion() {
    this.facturacionForm = this.formBuilder.group({});
  }

  asignarValoresDefaultAnulacion() {
    this.anulacionForm.reset();
    this.anulacionForm.get('tipoanulacion').setValue('1');
    this.anulacionForm.get('observacion').setValue('');
  }

  onVotedParentChannelSales(idChannelSales: string) {
    this.resultChannelSalesReport = idChannelSales;
    this.historialGrilla = [];
  }
  onVotedParentChannelPoint(idChannelSales: string) {
    this.resultChannelPointReport = idChannelSales;
    this.historialGrilla = [];
  }
  private getHistorial() {
    this.spinner.show();
    this.fExistRegistro = true;
    this.paginacion.CurrentPage = this.currentPage;
    this.invoiceList = [];
    this.historial = new Historial(
      this.resultStateSalesReport,
      this.resultSalesModeReport,
      this.utilityService.getValueDefault(this.filter.NumPolicy),
      this.datePipe.transform(this.bsValueIni, 'dd/MM/yyyy'),
      this.datePipe.transform(this.bsValueFin, 'dd/MM/yyyy'),
      this.resultChannelSalesReport,
      this.resultChannelPointReport === ''
        ? null
        : this.resultChannelPointReport,
      this.paginacion.CurrentPage,
      this.paginacion.ItemsPerPage,
      this.plateControl.value || null,
      this.contractorSelected.id || '0'
    );

    this.manageFacturacion(this.resultChannelSalesReport);

    this.historialService.getHistorial(this.historial).subscribe(
      (histGrilla) => {
        this.historialGrilla = <any[]>histGrilla;
        this.msgErrorLista = '';
        if (this.historialGrilla.length > 0) {
          this.fExistRegistro = true;
          this.totalItems = histGrilla[0].nrecorD_COUNT;
        } else {
          this.fExistRegistro = false;
          this.msgErrorLista = 'No se encontraron Registros..';
        }
        this.disableSpinner();
      },
      (err) => {
        console.log(err);
        this.fExistRegistro = false;
        this.msgErrorLista = 'Error de Sistemas. Comunicarse con Soporte!';
        this.disableSpinner();
      }
    );
    this.emissionService
      .registrarEvento('', EventStrings.HISTORIAL_BUSCAR)
      .subscribe();
  }

  manageFacturacion(canal) {
    this.step05service
      .getCanalTipoPago(canal, AppConfig.SETTINGS_SALE)
      .subscribe(
        (res) => {
          if (res !== null) {
            this.showchkFacturar =
              res.bfactura === 1 ? (res.blockfact === 1 ? true : false) : false;
          }
        },
        (err) => {
          console.log(err);
        }
      );
  }

  disableSpinner() {
    setTimeout(() => {
      this.spinner.hide();
    }, 500);
  }

  onImprimir(numeroPoliza: number) {
    this.spinner.show();

    if (numeroPoliza.toString().substr(0, 1) === '7') {
      this.emissionService.generarPolizaDigitalPdf(numeroPoliza).subscribe(
        (res) => {
          this.downloadDigitalPdf(res);
          this.disableSpinner();

          this.emissionService
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
      this.emissionService.generarPolizaPdf(numeroPoliza).subscribe(
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

  DownloadPolicyPdf(historial: any) {
    this.historialService.DownloadPolicyPdf(historial).subscribe(
      (data) => {
        let obj: any;
        obj = data;
      },
      (err) => {
        console.log(err);
      }
    );
  }

  openModalConfirExactus(id: string) {
    this.email = '';
    this.emailForm.setValue({
      email: '',
    });
    this.childModalConfirmasivo.show();
    this.msjHeader = 'Enviar correo electrónico';
    this.message = 'Email:';
    this.flag = 'correo';
    this.numeroPoliza = id;
  }

  confirm(): void {
    if (!this.emailForm.valid) {
      return;
    }
    this.onEmail(this.numeroPoliza, this.cForm['email'].value);
    this.spinner.show();
    this.childModalConfirmasivo.hide();
  }

  closeconfirm(): void {
    this.childModalConfirmasivo.hide();
  }

  onEmail(numeroPoliza: string, email: string) {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    this.username = currentUser && currentUser.username.toLowerCase();
    const pdfDigitalReenvio = new PdfDigitalReenvio(
      numeroPoliza,
      email,
      0,
      '1',
      this.username,
      ''
    );
    let result: any = {};
    this.historialService.InsPdfDigitalReenvio(pdfDigitalReenvio).subscribe(
      (data) => {
        result = data;
        this.messageinfo = result.mensaje;
        this.spinner.hide();
        this.childModal.show();
        this.emissionService
          .registrarEvento(
            `Reenvío de constancia SOAT : ${numeroPoliza} al correo ${email}`,
            EventStrings.HISTORIAL_REENVIARDIGITAL
          )
          .subscribe();
      },
      (error) => {
        console.log(error);
        this.spinner.hide();
      }
    );
  }

  aceptarmsginfo() {
    this.childModal.hide();
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

  buscar() {
    if (this.EventValidate() === true) {
      this.getHistorial();
    }
  }

  EventValidate() {
    this.currentPage = 0;
    this.totalItems = 0;
    this.resultError = true;
    this.fExistRegistro = false;
    this.historialGrilla = [];
    this.listErrores = [];
    this.listErrores = this.utilityService.isValidateHistorial(
      this.datePipe.transform(this.bsValueIni, 'dd/MM/yyyy'),
      this.datePipe.transform(this.bsValueFin, 'dd/MM/yyyy')
    );

    if (this.listErrores.length > 0) {
      this.resultError = false;
      return false;
    } else {
      this.resultError = true;
      return true;
    }
  }

  onVotedParentStateSales(idStateSales: string) {
    this.resultStateSalesReport = idStateSales;
  }

  onVotedParentSalesMode(idSalesMode: string) {
    this.resultSalesModeReport = idSalesMode;
  }
  setPage(pageNo: number): void {
    this.currentPage = pageNo;
  }
  pageChanged(event: any): void {
    this.page = event.page;
    this.currentPage = event.page - 1;
    this.getHistorial();
  }

  EventDownload() {
    this.spinner.show();
    this.historial = new Historial(
      this.resultStateSalesReport,
      this.resultSalesModeReport,
      this.utilityService.getValueDefault(this.filter.NumPolicy),
      this.datePipe.transform(this.bsValueIni, 'dd/MM/yyyy'),
      this.datePipe.transform(this.bsValueFin, 'dd/MM/yyyy'),
      this.resultChannelSalesReport,
      this.resultChannelPointReport === ''
        ? null
        : this.resultChannelPointReport,
      this.paginacion.CurrentPage,
      this.paginacion.ItemsPerPage
    );
    this.historial.NPAGE = '0';
    this.historial.NRECORD_PAGE = '0';

    this.historialService.getHistorial(this.historial).subscribe(
      (data) => {
        this.historialGrillaExport = <any[]>data;
        if (this.historialGrillaExport.length > 0) {
          switch (this.tipoReporte) {
            case 1: // STANDARD
              this.excelService.exportHistorial(
                this.historialGrillaExport,
                'ReporteHistorialVenta'
              );
              break;
            case 2: // DATOS DE ENTREGA
              this.excelService.exportHistorialDetail(
                this.historialGrillaExport,
                'ReporteHistorialVenta'
              );
              break;
            case 3: // FALABELLA
              this.excelService.exportHistorialFalabella(
                this.historialGrillaExport,
                'ReporteFalabella'
              );
              break;
            case 4: // ANDES
              this.excelService.exportHistorialAndes(
                this.historialGrillaExport,
                'ReporteVentas'
              );
              break;
            default:
              // STANDARD
              this.excelService.exportHistorial(
                this.historialGrillaExport,
                'ReporteHistorialVenta'
              );
              break;
          }
          this.emissionService
            .registrarEvento('', EventStrings.HISTORIAL_DESCARGAREXCEL)
            .subscribe();
        }
        this.disableSpinner();
      },
      (err) => {
        console.log(err);
        this.disableSpinner();
      }
    );
  }

  AddSales() {
    this.router.navigate(['broker/salepanel']);
  }

  onAnular(row: any) {
    this.anulacionPolicy = row.npolicy;
    this.anulacionSubmit = false;
    if (!this.showAnulacion(row)) {
      this.buscar();
    } else {
      this.childModalAnulacion.show();
    }
  }

  closeModalAnulacion(): void {
    this.childModalAnulacion.hide();
  }

  closeModalFacturacion(): void {
    this.childModalFacturar.hide();
  }

  closeModalMensaje(): void {
    this.anulacionSubmit = false;
    this.childModalMensaje.hide();
  }

  get observacion(): any {
    return this.anulacionForm.get('observacion');
  }

  anular() {
    this.anulacionSubmit = true;
    if (this.anulacionForm.valid) {
      const currentUser = JSON.parse(localStorage.getItem('currentUser'));
      const objAnulacion = new Anulacion();
      objAnulacion.tipoAnulacion =
        this.anulacionForm.get('tipoanulacion').value;
      objAnulacion.poliza = this.anulacionPolicy;
      objAnulacion.fechaAnulacion = new Date();
      objAnulacion.observaciones = this.anulacionForm.get('observacion').value;
      objAnulacion.usuario = currentUser.id;
      this.spinner.show();
      this.emissionService.anulacionPoliza(objAnulacion).subscribe(
        (res) => {
          this.finalizarAnulacion();
        },
        (err) => {
          console.log(err);
          this.finalizarAnulacion();
        }
      );
    }
  }

  isNullValue(value) {
    if (isNullOrUndefined(value)) {
      return true;
    }
    return false;
  }

  showAnulacion(row) {
    if (row.anulado === 1) {
      return false;
    }
    if (!isNullOrUndefined(row.idformapago)) {
      if (row.idformapago === '2' || row.idformapago === '3') {
        return false;
      }
    }
    const issueDate = new Date(row.dissuedat);
    issueDate.setMinutes(issueDate.getMinutes() + this.minutosanulacion);

    const isToday = new Date();
    if (issueDate <= isToday) {
      return false;
    }
    return true;
  }

  finalizarAnulacion() {
    this.anulacionSubmit = false;
    this.buscar();
    this.closeModalAnulacion();
    this.disableSpinner();
    this.asignarValoresDefaultAnulacion();
  }

  descargarComprobante(row) {
    const documentoConsulta: Comprobante = new Comprobante();
    const serialNumberOrigin = row.comprobantesunat.split('-');
    const sSerial = serialNumberOrigin[0];
    const sNumber = Number(serialNumberOrigin[1]).toString();

    documentoConsulta.tipoComprobante = this.getDocumentType(
      row.tipocomprobantecore
    );
    documentoConsulta.serie = sSerial;
    documentoConsulta.numero = sNumber;
    documentoConsulta.fecha = row.fechacomprobante;
    documentoConsulta.monto = row.namount;
    documentoConsulta.ruc = '20517207331';
    documentoConsulta.isPDF = true;

    this.spinner.show();
    this.messagevalidation = '';
    this.emissionService.validarComprobante(documentoConsulta).subscribe(
      (res) => {
        if (res.valido) {
          const comprobante = [];
          comprobante.push(documentoConsulta);
          this.obtenerComprobante(comprobante);
        } else {
          this.messagevalidation =
            'Su comprobante se encuentra en proceso de validación, por favor intente nuevamente en unos minutos.';
          this.childModalMensaje.show();
          console.log(res);
          this.disableSpinner();
        }
      },
      (err) => {
        this.messagevalidation = '';
        this.disableSpinner();
        console.log(err);
      }
    );
  }

  obtenerComprobante(comprobanteColl: Comprobante[]) {
    this.emissionService
      .descargarComprobante(comprobanteColl)
      .subscribe((res) => {
        const mFile = res as any;
        mFile.file = res.archivo;
        mFile.id = mFile.nombre;
        this.downloadDigitalPdf(mFile);
        this.disableSpinner();
      });
  }

  getDocumentType(type: number): string {
    let coreType = '';
    switch (Number(type)) {
      case 5:
        coreType = '01';
        break;
      case 6:
        coreType = '03';
        break;
      default:
        coreType = '07';
        break;
    }
    return coreType;
  }

  listarDepartamentos() {
    const filter = new Province('0', '');
    this.ubigeoService.getPostProvince(filter).subscribe(
      (res) => {
        this.departamentos = <Province[]>res;
      },
      (err) => {
        console.log(err);
      }
    );
  }

  cargarDatosContratante(collDepartamentos) {
    const datosContratante = null;
    const group = this.invoiceList.reduce((r, a) => {
      r[a.contratante] = [...(r[a.contratante] || []), a];
      return r;
    }, {});
    const result = Object.values(group);
    this.spinner.show();
    if (result.length === 1) {
      const unqContratante = result[0] as any;
      const contTipoDoc = unqContratante[0].contratante.toString().substr(0, 2);

      let tamanoTipoDocumento;
      if (Number(contTipoDoc) === 1) {
        tamanoTipoDocumento = 3;
      }
      if (Number(contTipoDoc) === 2) {
        tamanoTipoDocumento = 6;
      }
      if (Number(contTipoDoc) === 4) {
        tamanoTipoDocumento = 2;
      }

      const contDoc = unqContratante[0].contratante
        .toString()
        .substr(tamanoTipoDocumento, 14);

      this.step03service.clientePorDocumento(contTipoDoc, contDoc).subscribe(
        (res) => {
          const data = res;
          if (data.length > 0 && !isNullOrUndefined(data[0].p_SDOCUMENT)) {
            const cliente = <Cliente>data[0];
            this.appcontrantante.loadSession(this.departamentos, cliente);
          }
          this.spinner.hide();
        },
        (err) => {
          this.spinner.hide();
          console.log(err);
        }
      );
    } else {
      this.spinner.hide();
      this.appcontrantante.loadSession(this.departamentos, null);
    }
  }

  facturar() {
    this.cargarDatosContratante(this.departamentos);
    this.appcontrantante.limpiarSeccionContratante();
    this.childModalFacturar.show();
  }

  onFacturar() {
    this.appcontrantante.ValidateFormContratante();
    const isNotValid = !this.appcontrantante.contratanteForm.valid;
    if (isNotValid) {
      return;
    }
    this.spinner.show();

    const sFacturar = new Facturacion();
    sFacturar.detail = this.invoiceList;
    sFacturar.contratante = this.contratante;
    sFacturar.usercode = this.id;

    this.emissionService.facturar(sFacturar).subscribe(
      (res) => {
        console.log(res);
        this.buscar();
        this.childModalFacturar.hide();
        this.disableSpinner();
        this.emissionService
          .registrarEvento('', EventStrings.HISTORIAL_FACTURAR)
          .subscribe();
        this.messageinfo = 'Se generó el comprobante correctamente.';
        this.childModal.show();
      },
      (err) => {
        this.invoiceList = [];
        this.disableSpinner();
        console.log(err);
      }
    );
  }

  assignContratante(event): void {
    this.contratante = event.cliente;
  }

  invoiceSelected(row: any) {
    return false;
  }

  checkUncheckInvoice(event, row: any) {
    event.preventDefault();
    if (isNullOrUndefined(this.invoiceList)) {
      this.invoiceList = [];
    }
    const isChecked = event.target.checked;
    const nItem = {
      policy: row.npolicy,
      receipt: row.recibo,
      certif: row.ncertif,
      asegurado: row.sasegurado,
      contratante: row.scontratante,
    };
    const nExists = this.invoiceList.find((x) => x.policy === row.npolicy);

    if (isChecked) {
      if (this.invoiceList.length === 0) {
        this.invoiceList.push(nItem);
      } else {
        if (isNullOrUndefined(nExists)) {
          this.invoiceList.push(nItem);
        }
      }
    } else {
      this.invoiceList = this.invoiceList.filter(function (value, index, arr) {
        return value.policy !== nExists.policy;
      });
    }
  }

  obtenerTiempoAnulacion() {
    return this.toolService.ObtenerConfiguracion().subscribe((response) => {
      console.log(response);
      this.minutosanulacion = response.tiempoMaximoAnulacion;
    });
  }

  showHideModalContractor(show: boolean): void {
    if (!show) {
      this.vcr.clear();
      return;
    }

    if (this.contractorSelected.id) {
      return;
    }

    this.resetFormContractor();
    this.clientCodeContractorControl.setValue('');
    this.currentPageListContractors = 1;
    this.formContractorControl['searchType'].setValue(
      this.SEARCHTYPES.document
    );
    this.listContractors$ = [];
    this.vcr.createEmbeddedView(this.modalContractor);
  }

  removeContractorSelected(): void {
    this.contractorSelected = {};
    this.contractorControl.setValue('');
  }

  selectContractor(): void {
    this.contractorControl.setValue(this.contractorSelected.name);
    this.showHideModalContractor(false);
  }

  onChangeSelectContractor(item): void {
    this.contractorSelected = {
      id: item.clientCode,
      name: item.contractor
    };
  }

  resetFormContractor(): void {
    this.formContractor.patchValue({
      personType: this.PERSONTYPES.natural,
      documentType: '2',
      documentNumber: '',
      legalName: '',
      names: '',
      apePat: '',
      apeMat: ''
    });
  }

  getDocumentInfo(): void {
    if (this.formContractor.invalid || (!this.formContractorControl['documentNumber'].value &&
      this.formContractorControl['searchType'].value == this.SEARCHTYPES.document)) {
      return;
    }

    this.currentPageListContractors = 1;

    if (
      this.formContractorControl['searchType'].value == this.SEARCHTYPES.names
    ) {
      this.searchDocumentByNames();
      return;
    }

    const payload: any = {
      idRamo: 100,
      idTipoDocumento: this.formContractorControl['documentType'].value,
      numeroDocumento:
        this.formContractorControl['documentNumber'].value.toUpperCase(),
      token: new Date().getTime().toString()
    };
    this.spinner.show();
    this.utilsService.documentInfoResponse(payload).subscribe({
      next: (response: DocumentInfoResponseModel): void => {
        console.dir(response);

        if (!response.success) {
          this.listContractors$ = [];
          return;
        }
        const responseTransform = {
          ...response,
          contractor:
            this.formContractorControl['documentType'].value == 1
              ? response.legalName
              : `${response.names ?? ''} ${response.apePat ?? ''} ${
                response.apeMat ?? ''
              }`.trim()
        };

        this.listContractors$ = [responseTransform];

        if (this.listContractors$.length == 1) {
          this.clientCodeContractorControl.setValue(
            this.listContractors$[0].clientCode
          );
          this.onChangeSelectContractor(this.listContractors$[0]);
        }
      },
      error: (error: HttpErrorResponse): void => {
        console.error(error);
        this.spinner.hide();
      },
      complete: (): void => {
        this.spinner.hide();
      }
    });
  }

  searchDocumentByNames(): void {
    this.listContractors$ = [];
    this.spinner.show();
    const payload = {
      nombres: this.formContractorControl['names'].value || null,
      apellidoPaterno: this.formContractorControl['apePat'].value || null,
      apellidoMaterno: this.formContractorControl['apeMat'].value || null,
      razonSocial: this.formContractorControl['legalName'].value || null,
      idUsuario: +this.currentUser['id']
    };
    this.utilsService.searchDocumentByNames(payload).subscribe({
      next: (response: any[]): void => {
        console.dir(response);

        let documentTypesIncludes: number[] = [2, 4, 15];

        if (
          this.formContractorControl['personType'].value ===
          this.PERSONTYPES.business
        ) {
          documentTypesIncludes = [1];
        }

        this.listContractors$ = response
          .map((obj: any) => ({
            clientCode: obj.CodigoCliente,
            documentType: +obj.IdTipoDocumento,
            documentNumber: obj.NumeroDocumento,
            contractor:
              this.formContractorControl['personType'].value ==
              this.PERSONTYPES.natural
                ? `${obj.Nombre ?? ''} ${obj.ApellidoPaterno ?? ''} ${
                  obj.ApellidoMaterno ?? ''
                }`.trim()
                : obj.RazonSocial
          }))
          .filter(
            (item) =>
              documentTypesIncludes.includes(item.documentType) &&
              item.documentNumber
          );

        console.log(this.listContractors$);
      },
      error: (error: HttpErrorResponse): void => {
        console.error(error);
        this.spinner.hide();
      },
      complete: (): void => {
        this.spinner.hide();
      }
    });
  }
}
