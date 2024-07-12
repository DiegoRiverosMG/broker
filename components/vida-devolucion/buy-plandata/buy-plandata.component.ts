import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  TemplateRef,
  ViewChild,
  ViewContainerRef,
} from '@angular/core';
import {
  FormGroup,
  FormBuilder,
  Validators,
  AbstractControl,
  FormArray,
} from '@angular/forms';
import { NgxSpinnerService } from 'ngx-spinner';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import moment from 'moment';
import { ActivatedRoute } from '@angular/router';

import { RegularExpressions } from '@shared/regexp/regexp';
import { VidaDevolucionService } from '../../../services/vida-devolucion/vida-devolucion.service';
import { UtilsService } from '@shared/services/utils/utils.service';
import { ParametersResponse } from '@shared/models/ubigeo/parameters.model';
import { AgesDto } from '../../../../vidaindividual-latest/models/ages.model';
import { SumaAseguradaDto } from '../../../../vidaindividual-latest/models/sumaAsegurada.model';
import { CurrencyDto } from '../../../../vidaindividual-latest/models/currency.model';
import { PercentReturnDto } from '../../../../vidaindividual-latest/models/percentReturn.model';
import { BsDatepickerConfig } from 'ngx-bootstrap/datepicker';
// tslint:disable-next-line:max-line-length
import {
  IDocumentInfoRequest,
  IDocumentInformationRequest,
  IDocumentInformationResponse,
} from '../../../../../shared/interfaces/document-information.interface';
import { Step2Service } from '@root/layout/vidaindividual-latest/services/step2/step2.service';
import { QuotationService } from '../../../services/vida-devolucion/quotation/quotation.service';
import { DocumentInformationModel } from '../../../../../shared/models/document-information/document-information.model';
import { fadeAnimation } from '@shared/animations/animations';
import { ValidarRequest } from '@root/layout/backoffice/models/anulacion-certificado/anulacion-certificado.model';
import { frecuencyPayDto } from '@root/layout/vidaindividual-latest/models/frecuencyPay.model';
import { DecimalPipe } from '@angular/common';
import { SummaryService } from '../../../services/vida-devolucion/summary/summary.service';
import { RecaptchaComponent } from 'ng-recaptcha';
import { AppConfig } from '../../../../../app.config';

@Component({
  selector: 'app-buy-plandata',
  templateUrl: './buy-plandata.component.html',
  styleUrls: ['./buy-plandata.component.scss', '../shared/styles/_style.sass'],
  animations: [fadeAnimation],
})
export class BuyPlanDataComponent implements OnInit {
  @Output() quotationChange: EventEmitter<any> = new EventEmitter<any>();
  @Output() validateQuotation: EventEmitter<any> = new EventEmitter<any>();

  Validar = true;
  ValidarError = false;
  ValidarExperian = false;

  bsConfigBirthdate: Partial<BsDatepickerConfig>;
  AlertSumaAsegurada: any;
  plans$: AgesDto[];
  sumInsured$: SumaAseguradaDto[];
  currencies$: CurrencyDto[];
  percentages$: PercentReturnDto[];
  frecuency$: frecuencyPayDto[];
  simboloMoneda: string;

  form: FormGroup;
  formBeneficiary: FormGroup;

  documentNumberCharacterLimit: {
    min: number;
    max: number;
  };

  /* servicios */
  parameters$: ParametersResponse;
  departments$: Array<any>;
  provinces$: Array<any>;
  districts$: Array<any>;
  clientId: any;
  percents: Array<number> = [];
  editMode: boolean;
  sumasuperada: any;
  numpolizascontratadas: any;
  totalsumapolizas: any;
  siteKey = AppConfig.CAPTCHA_KEY;

  @ViewChild('modalBeneficiary', { static: false, read: TemplateRef })
  _modalBeneficiary: TemplateRef<any>;
  @ViewChild('recaptchaRef', { static: true })
  recaptcha: RecaptchaComponent;

  frecuencia: any;
  @Input() validDoc: any;
  @Input() typeClients: any;
  @Input() parentescocontratantea: any;
  @Input() validarindicadores: any;

  constructor(
    private readonly _builder: FormBuilder,
    private readonly _vc: ViewContainerRef,
    private readonly _utilsService: UtilsService,
    private readonly _spinner: NgxSpinnerService,
    private readonly _DecimalPipe: DecimalPipe,
    private readonly router: Router,
    private readonly vidaDevolucionService: VidaDevolucionService,
    private readonly quotationService: QuotationService,
    private readonly summaryService: SummaryService,
    private readonly route: ActivatedRoute
  ) {
    // this.limitDate = new Date(new Date().setFullYear(Number(new Date().getFullYear()) - 18));
    this.bsConfigBirthdate = Object.assign(
      {},
      {
        locale: 'es',
        showWeekNumbers: false,
        dateInputFormat: 'DD/MM/YYYY',
        maxDate: new Date(),
        // maxDate: this.limitDate
      }
    );
    this.documentNumberCharacterLimit = {
      min: 8,
      max: 8,
    };
    this.editMode = false;
    this.form = this._builder.group({
      years: [null, Validators.required],
      currency: [null, Validators.required],
      sumAssured: [null, Validators.required],
      frecuencia: [null],
      idFrecuencia: [null],
      returnPercentage: [null, Validators.required],
      clientName: [null],
      primaMensual: [null, Validators.required],
      primaInicial: [null],
      primaAnual: [null],
      idPlan: [null],
      primaRetorno: [null],
      typeBeneficiaries: [null, Validators.required],
      descPrima: [null],
      descPrimeraCuota: [null],
      primaTotal: [null],
      beneficiaries: this._builder.array([]),
      idTarif: [null],
    });
    this.formBeneficiary = this._builder.group({
      id: [null],
      documentType: [null, Validators.required],
      documentNumber: [
        null,
        Validators.compose([
          Validators.pattern(RegularExpressions.numbers),
          Validators.required,
          Validators.minLength(this.documentNumberCharacterLimit.min),
          Validators.maxLength(this.documentNumberCharacterLimit.max),
        ]),
      ],
      names: [null, Validators.required],
      lastName: [null, Validators.required],
      lastName2: [null],
      nationality: [null, Validators.required],
      address: [null],
      email: [null],
      phone: [null],
      department: [null],
      province: [null],
      district: [null],
      birthdate: [null, Validators.required],
      sex: [null, Validators.required],
      relationship: [null, Validators.required],
      assignment: [null, Validators.required],
    });
  }
  ngOnInit(): void {
    this.numpolizascontratadas =
      this.vidaDevolucionService.storage?.cumulus.nCountPolicy;
    this.totalsumapolizas =
      this.vidaDevolucionService.storage?.cumulus.nCumulusMax -
      this.vidaDevolucionService.storage?.cumulus.nCumulusAvailble;
    this.sumasuperada =
      this.vidaDevolucionService.storage?.cumulus.nCumulusAvailble;
    if (this.vidaDevolucionService.storage?.cumulus.sExceedsCumulus == 'S') {
      this.Validar = false;
      this.ValidarError = true;
    }
    const cotizaciones = this.vidaDevolucionService.storage?.cotizaciones;
    const cotizacionesFilter = cotizaciones?.filter((x) => x.idTarifario);

    this.vidaDevolucionService.storage = {
      cotizaciones: cotizacionesFilter || [],
      cotizacionesNoVigentes: [],
    };
    this.plans$ = this.vidaDevolucionService.storage?.tariff?.plans;
    if (this.vidaDevolucionService.storage?.experian?.experianRisk) {
      if (this.vidaDevolucionService.storage?.experian?.approve) {
        this.ValidarExperian = false;
      } else {
        // this.plans$ = [];
        this.ValidarExperian = true;
      }
    }
    const buyInsurance = this.vidaDevolucionService.storage?.buyInsurance;

    if (!!Object.keys(buyInsurance || []).length) {
      this.form.patchValue(buyInsurance, {
        emitEvent: false,
      });
      this.fb.setValue([]);
      buyInsurance?.beneficiaries?.forEach((value: any) => {
        this.fb.push(this._builder.group(value));
      });
      this.setTariff();
    }
    this.f['years'].valueChanges.subscribe((val) => {
      if (val) {
        /*  this.f['currency'].setValue(null);
          this.f['sumAssured'].setValue(null);
          this.f['returnPercentage'].setValue(null);
          this.f['primaMensual'].setValue(null);
          this.simboloMoneda = '';
          this.sumInsured$ = [];
          this.percentages$ = [];
           this.frecuency$ = []; */
        this.setTariff();
      }
    });
    /* this.frecuencia = this.frecuency$?.find(
        (x) => +x.idFrecuencia == +this.f['frecuencia'].value
      )?.frecuencia; */
    this.f['currency'].valueChanges.subscribe((val) => {
      if (val) {
        this.f['sumAssured'].setValue(null);
        this.f['returnPercentage'].setValue(null);
        this.f['primaMensual'].setValue(null);
        this.f['idFrecuencia'].setValue(null);
        this.simboloMoneda = '';
        this.percentages$ = [];
        this.frecuency$ = [];

        this.setTariff();
      }
    });

    this.f['sumAssured'].valueChanges.subscribe((val) => {
      if (val) {
        /*   this.f['returnPercentage'].setValue(null);
            this.f['primaMensual'].setValue(null); */

        this.setTariff();
      }
    });

    this.f['returnPercentage'].valueChanges.subscribe((val) => {
      if (val) {
        this.setTariff();
      }
    });
    this.f['idFrecuencia'].valueChanges.subscribe((val) => {
      if (val) {
        const text = this.frecuency$?.find(
          (x) => +x.idFrecuencia == +val
        )?.frecuencia;
        this.frecuencia = text.toUpperCase();
        this.setTariff();
      }
    });

    this.textoParentesco(11);
    if (
      !Object.keys(this.vidaDevolucionService.storage?.parameters || []).length
    ) {
      this.parameters();
    } else {
      this.setParameters();
    }

    for (let i = 10; i <= 100; i += 10) {
      this.percents.push(i);
    }
    this.percents.push(25);
    this.percents.push(35);
    this.percents = this.percents.sort((x, y) => x - y);

    this.fbe['documentType'].valueChanges.subscribe((val) => {
      switch (Number(val)) {
        case 2: {
          this.fbe['lastName'].clearValidators();
          this.fbe['lastName2'].setValidators([Validators.required]);
          this.documentNumberCharacterLimit = { min: 8, max: 8 };
          this.fbe['nationality'].disable();
          break;
        }
        case 4: {
          this.documentNumberCharacterLimit = { min: 9, max: 12 };
          this.fbe['lastName'].clearValidators();
          this.fbe['lastName2'].setValidators([Validators.required]);
          this.fbe['nationality'].enable();
          break;
        }
      }

      this.fbe['documentNumber'].setValidators([
        Validators.compose([
          Validators.required,
          Validators.pattern(/^[0-9]*$/),
          Validators.minLength(this.documentNumberCharacterLimit.min),
          Validators.maxLength(this.documentNumberCharacterLimit.max),
        ]),
      ]);
      this.setIdBeneficiary();
    });

    this.fbe['documentNumber'].valueChanges.subscribe((_: string) => {
      this.setIdBeneficiary();
      if (_ && !RegularExpressions.numbers.test(_)) {
        this.fbe['documentNumber'].setValue(_.slice(0, _.length - 1));
      }
    });

    this.form.valueChanges.subscribe((values: any) => {
      let payload: any = {};
      if (this.form.valid) {
        // tslint:disable-next-line:max-line-length
        const currency: any =
          this.plans$
            ?.find((x) => +x.edad == +values.years)
            .moneda?.find((x) => +x.idMoneda == +values.currency) || {};
        payload = {
          ...values,
          simbolCurrency: currency?.simbolo,
          ...currency.sumaAsegurada
            ?.find((x) => +x.montoSumaAsegurada == +values.sumAssured)
            ?.porcentajeRetorno?.find(
              (x: any) => +x.montoPorcentaje == +values.returnPercentage
            )?.primas[0],
          returnPercentage: +values.returnPercentage,
          currencyDescription: +values.currency == 1 ? 'SOLES' : 'DÓLARES',
        };
      } else {
        payload = values;
      }
      this.vidaDevolucionService.storage = {
        buyInsurance: {
          ...payload,
          processId: this.vidaDevolucionService.storage.processId,
          estado: {
            id: 1,
            descripcion: 'PENDIENTE',
          },
          selected: false,
        },
      };
    });

    this.valueChangesUbigeos();
  }
  SelectSumaAsegurada() {
    if (this.numpolizascontratadas != 0) {
      this.ValidarError = true;
    }
  }
  currencyformat(number: any) {
    return new Intl.NumberFormat('es-MX').format(number);
  }
  setTariff(): void {
    this.currencies$ = this.plans$?.find(
      (x) => +x.edad == +this.f['years'].value
    )?.moneda;

    this.sumInsured$ = this.currencies$?.find(
      (x) => +x.idMoneda == +this.f['currency'].value
    )?.sumaAsegurada;
    this.simboloMoneda = this.currencies$?.find(
      (x) => +x.idMoneda === +this.f['currency'].value
    )?.simbolo;

    this.frecuency$ = this.sumInsured$?.find(
      (x) => +x.montoSumaAsegurada == +this.f['sumAssured'].value
    )?.frecuenciaPago;

    this.percentages$ = this.frecuency$?.find(
      (x) => +x.idFrecuencia == +this.f['idFrecuencia'].value
    )?.porcentajeRetorno;

    this.f['primaMensual'].setValue(
      this.percentages$?.find(
        (x) => +x.montoPorcentaje === +this.f['returnPercentage'].value
      )?.primas[0]?.primaMensual
    );
    this.f['descPrima'].setValue(
      this.percentages$?.find(
        (x) => +x.montoPorcentaje === +this.f['returnPercentage'].value
      )?.primas[0]?.descPrima
    );
    this.f['descPrimeraCuota'].setValue(
      this.percentages$?.find(
        (x) => +x.montoPorcentaje === +this.f['returnPercentage'].value
      )?.primas[0]?.descPrimeraCuota
    );
    this.f['primaAnual'].setValue(
      this.percentages$?.find(
        (x) => +x.montoPorcentaje === +this.f['returnPercentage'].value
      )?.primas[0]?.primaAnual
    );
    this.f['primaRetorno'].setValue(
      this.percentages$?.find(
        (x) => +x.montoPorcentaje === +this.f['returnPercentage'].value
      )?.primas[0]?.primaRetorno
    );
    this.f['idTarif'].setValue(
      this.percentages$?.find(
        (x) => +x.montoPorcentaje === +this.f['returnPercentage'].value
      )?.primas[0]?.idTarifario
    );
    this.f['idPlan'].setValue(
      this.percentages$?.find(
        (x) => +x.montoPorcentaje === +this.f['returnPercentage'].value
      )?.primas[0]?.plan
    );
    this.f['primaInicial'].setValue(
      this.percentages$?.find(
        (x) => +x.montoPorcentaje == +this.f['returnPercentage'].value
      )?.primas[0]?.primeraCuota
    );

    const text = this.frecuency$?.find(
      (x) => +x.idFrecuencia == +this.f['idFrecuencia'].value
    )?.frecuencia;
    this.frecuencia = text;
    this.f['primaTotal'].setValue(
      this.f['primaMensual'].value + this.f['descPrima'].value
    );
    this.f['frecuencia'].setValue(text);
  }

  setIdBeneficiary() {
    this.fbe['id'].setValue(
      `${this.fbe['documentType'].value}${this.fbe['documentNumber'].value}`
    );
  }

  getMonedaDesc(val): string {
    switch (Number(val)) {
      case 1: {
        return 'SOLES';
      }
      case 2: {
        return 'DÓLARES';
      }
      default: {
        return 'DESCRIPCION MONEDA';
      }
    }
  }

  get f(): { [key: string]: AbstractControl } {
    return this.form.controls;
  }

  get fb(): FormArray {
    return this.f['beneficiaries'] as FormArray;
  }

  get fbe(): { [key: string]: AbstractControl } {
    return this.formBeneficiary.controls;
  }

  get currentUser(): any {
    return JSON.parse(localStorage.getItem('currentUser') || '{}');
  }

  get beneficiaryExist(): boolean {
    if (this.editMode) {
      return false;
    }

    const document = this.fbe['id'].value;
    const beneficiaries = this.fb.getRawValue();

    return beneficiaries?.map((x) => x.id)?.includes(document);
  }

  get clientIsBeneficiary(): boolean {
    const document = this.fbe['id'].value;

    const contractor =
      this.vidaDevolucionService.storage.contractorService.asegurado;
    const documentContractor = `${contractor.idTipoDocumento}${contractor.numeroDocumento}`;

    return document == documentContractor;
  }
  get idASesor(): any {
    return JSON.parse(sessionStorage.getItem('idAsesor'));
  }

  getDocumentInfo(token): void {
    if (this.beneficiaryExist) {
      return;
    }

    if (this.fbe['documentType'].valid && this.fbe['documentNumber'].valid) {
      const req: IDocumentInfoRequest = {
        idRamo: 71,
        idTipoDocumento: +this.fbe['documentType'].value,
        numeroDocumento: this.fbe['documentNumber'].value,
        idUser: this.currentUser.id,
        token: token,
      };
      this._spinner.show();
      this._utilsService.documentInfoResponse(req).subscribe(
        (response: any) => {
          this.fbe['names'].setValue(response.names);
          this.fbe['lastName'].setValue(response.apePat);
          this.fbe['lastName2'].setValue(response.apeMat);
          this.fbe['nationality'].setValue(response.nationality);
          this.fbe['department'].setValue(response.department);
          this.fbe['province'].setValue(response.province);
          this.fbe['district'].setValue(response.district);
          this.fbe['birthdate'].setValue(response.birthdate);
          this.fbe['sex'].setValue(response.sex);

          this.setUbigeos();
          this._spinner.hide();
        },
        (error: HttpErrorResponse) => {
          console.error(error);
          this.fbe['nationality'].enable();
          this._spinner.hide();
        }
      );
    }
  }

  get beneficiariesLength(): number {
    return this.fb.getRawValue().length;
  }

  submitBeneficiary(): void {
    if (this.editMode) {
      const b = this.fb.getRawValue();
      const index = b.findIndex((x) => x.id == this.fbe['id'].value);
      const selectedBeneficiary = this.fb.at(index) as FormGroup;
      const newVal = this.formBeneficiary.getRawValue();
      selectedBeneficiary?.patchValue(newVal);
      this.closeModals();
    } else {
      this.addBeneficiary();
    }
  }

  addBeneficiary(): void {
    if (
      this.formBeneficiary.valid &&
      !this.beneficiaryExist &&
      !this.clientIsBeneficiary
    ) {
      this.fb.push(
        this._builder.group({
          ...this.formBeneficiary.getRawValue(),
          parentescoDescripcion: this.parameters$.parentescos?.find(
            (x) => +x.id == +this.fbe['relationship'].value
          )?.descripcion,
        })
      );
      this.closeModals();
    }
  }

  editBeneficiary(data: any): void {
    this.editMode = true;
    this.formBeneficiary.patchValue(data, {
      emitEvent: false,
    });
    this.fbe['documentType'].disable();
    this.fbe['documentNumber'].disable();
    this.setUbigeos();
    this._vc.createEmbeddedView(this._modalBeneficiary);
  }

  removeBeneficiary(index: number): void {
    this.fb.removeAt(index);
  }

  openModalBeneficiary(): void {
    if (this.sumPercentagesBeneficiaries < 100) {
      this.editMode = false;
      this.formBeneficiary.reset();
      this.formBeneficiary.enable();
      this.fbe['documentType'].setValue(2);
      this._vc.createEmbeddedView(this._modalBeneficiary);
    }
  }

  closeLastModal(): void {
    this._vc.remove();
  }

  closeModals(): void {
    this._vc.clear();
  }

  generarCotizacion() {
    if (this.form.valid) {
      if (+this.f['typeBeneficiaries'].value == 1) {
        this.fb.clear();
      }
      const storage = this.vidaDevolucionService.storage;

      const currency = +storage.buyInsurance.currency;
      let anualPremium = +storage.buyInsurance.primaAnual;
      if (currency == 1) {
        anualPremium =
          anualPremium / +storage.contractorService.tipoCambio.valor;
      }
      const isQuotationInvalid =
        anualPremium >= 1500 ||
        storage.worldCheck.isOtherList ||
        storage.idecon.isOtherList;
      // || this.typeClients != 1 ? storage.experian.experianRisk && storage.experian.approve == false : false;
      if (isQuotationInvalid) {
        const payload = {
          anualPremiumInvalid: anualPremium >= 1500,
          worldCheckIsOtherList: storage.worldCheck.isOtherList,
          ideconIsOtherList: storage.idecon.isOtherList,
          scoring: storage.experian.experianRisk,
          isInvalid: isQuotationInvalid,
          // excedeDeuda: storage.experian.experianRisk,
          time: new Date().getTime(),
        };
        this.validateQuotation.emit(payload);
        return;
      }

      // const request: any = {
      //   idSesion: this.vidaDevolucionService.storage?.sessionId,
      //   idFlujo: 1,
      //   canalVenta: this.currentUser['canal'],
      //   puntoVenta: this.currentUser['puntoVenta'],
      //   idTipoPersona: 1,
      //   nUserUpdate: this.currentUser['id'],
      //   idTipoDocumento: 2,
      //   numeroDocumento:
      //     storage.contractorService?.asegurado?.numeroDocumento,
      //   nombres: storage.contractorService?.asegurado?.nombres,
      //   apellidoPaterno:
      //     storage.contractorService?.asegurado?.apellidoPaterno,
      //   apellidoMaterno:
      //     storage.contractorService?.asegurado?.apellidoMaterno,
      //   idSexo: storage.contractorService?.asegurado?.idSexo,
      //   homonimo: storage.formContractor?.namesake || false ? '1' : '0',
      //   terminos: storage.terms ? '1' : '0',
      //   // idUsuario: +this.currentUser['id'],
      //   idUsuario: +this.idASesor,
      //   idTipoPeriodo: 1,
      //   cantidadAnio: +storage.buyInsurance?.years,
      //   moneda: +storage.buyInsurance?.currency,
      //   frecuencia: this.f['frecuencia'].value,
      //   idFrecuencia: +this.f['idFrecuencia'].value,
      //   fechaNacimiento:
      //     storage.contractorService?.asegurado?.fechaNacimiento,
      //   fechaInicio: moment(new Date()).format('DD/MM/YYYY'),
      //   fechaFin: moment(
      //     new Date(
      //       new Date().setFullYear(
      //         new Date().getFullYear() + +storage.buyInsurance.years
      //       )
      //     )
      //   ).format('DD/MM/YYYY'),
      //   plan: this.f['idPlan'].value,
      //   capital: +storage.buyInsurance?.sumAssured,
      //   primaMensual: +storage.buyInsurance?.primaMensual,
      //   porcentajeRetorno: storage.buyInsurance?.returnPercentage,

      //   primaInicial: +storage.buyInsurance?.primaInicial,
      //   primaAnual: +storage.buyInsurance?.primaAnual,
      //   primaRetorno: +storage.buyInsurance?.primaRetorno,
      //   descPrima: this.f['descPrima'].value,
      //   descPrimeraCuota: this.f['descPrimeraCuota'].value,
      //   beneficiarioLegal:
      //     +storage.buyInsurance?.typeBeneficiaries == 1 ? '1' : '0',
      //   idTarifario: +storage.buyInsurance?.idTarif,
      //   beneficiarios: this.fb.getRawValue().map(
      //     (value: any) =>
      //     ({
      //       idTipoPersona: 1,
      //       idTipoDocumento: value.documentType,
      //       numeroDocumento: value.documentNumber,
      //       nombres: value.names,
      //       apellidoPaterno: value.lastName,
      //       apellidoMaterno: value.lastName2,
      //       idNacionalidad: value.nationality,
      //       fechaNacimiento:
      //         (value.birthdate || '').toString()?.indexOf('/') == -1
      //           ? moment(value.birthdate).format('DD/MM/YYYY')
      //           : value.birthdate,
      //       idSexo: value.sex,
      //       relacion: this.getJsonRelationship(value.relationship),
      //       porcentajeParticipacion: value.assignment,
      //     } || [])
      //   ),
      // };

      const request: any = {
        idSesion: this.vidaDevolucionService.storage?.sessionId,
        idFlujo: 1,
        canalVenta: this.currentUser['canal'],
        puntoVenta: this.currentUser['puntoVenta'],
        nUserUpdate: this.currentUser['id'],
        idUsuario: +this.idASesor,
        idTipoPeriodo: 1,
        cantidadAnio: +storage.buyInsurance?.years,
        moneda: +storage.buyInsurance?.currency,
        frecuencia: this.f['frecuencia'].value,
        idFrecuencia: +this.f['idFrecuencia'].value,
        fechaInicio: moment(new Date()).format('DD/MM/YYYY'),
        fechaFin: moment(
          new Date(
            new Date().setFullYear(
              new Date().getFullYear() + +storage.buyInsurance.years
            )
          )
        ).format('DD/MM/YYYY'),
        plan: this.f['idPlan'].value,
        capital: +storage.buyInsurance?.sumAssured,
        primaMensual: +storage.buyInsurance?.primaMensual,
        porcentajeRetorno: storage.buyInsurance?.returnPercentage,

        primaInicial: +storage.buyInsurance?.primaInicial,
        primaAnual: +storage.buyInsurance?.primaAnual,
        primaRetorno: +storage.buyInsurance?.primaRetorno,
        descPrima: this.f['descPrima'].value,
        descPrimeraCuota: this.f['descPrimeraCuota'].value,
        asegurado: {
          idTipoPersona: 1,
          idTipoDocumento: 2,
          numeroDocumento:
            storage.contractorService?.asegurado?.numeroDocumento,
          nombres: storage.contractorService?.asegurado?.nombres,
          apellidoPaterno:
            storage.contractorService?.asegurado?.apellidoPaterno,
          apellidoMaterno:
            storage.contractorService?.asegurado?.apellidoMaterno,
          idSexo: storage.contractorService?.asegurado?.idSexo,
          homonimo: storage.formContractor?.namesake || false ? '1' : '0',
          fechaNacimiento:
            storage.contractorService?.asegurado?.fechaNacimiento,
          telefono:
            this.vidaDevolucionService.storage.formContractor?.phoneNumber,

          correo: this.vidaDevolucionService.storage.formContractor?.email,
          direccion:
            this.vidaDevolucionService.storage.formContractor?.direccion,

          idEstadoCivil:
            this.vidaDevolucionService.storage.formContractor?.estadoCivil,

          idDepartamento:
            this.vidaDevolucionService.storage.formContractor?.departamento,
          idProvincia:
            this.vidaDevolucionService.storage.formContractor?.provincia,
          idDistrito:
            this.vidaDevolucionService.storage.formContractor?.distrito,
          idOcupacion:
            this.vidaDevolucionService.storage.formContractor?.ocupacion,
          obligacionFiscal:
            this.vidaDevolucionService.storage.formContractor?.obligacionFiscal,
        },
        contratante:
          this.typeClients == 1
            ? {
                idTipoPersona: 1,
                idTipoDocumento: 2,
                numeroDocumento:
                  // storage.contractorService?.contratante?.numeroDocumento ||
                  this.vidaDevolucionService.storage
                    ?.numeroDocumentoContratante ||
                  this.vidaDevolucionService.storage
                    ?.contractorServiceContratante?.numeroDocumento ||
                  null,
                nombres:
                  // storage.contractorService?.contratante?.nombres ||
                  this.vidaDevolucionService.storage
                    .contractorServiceContratante?.names || null,
                apellidoPaterno:
                  // storage.contractorService?.contratante?.apellidoPaterno ||
                  this.vidaDevolucionService.storage
                    .contractorServiceContratante?.apePat || null,
                apellidoMaterno:
                  // storage.contractorService?.contratante?.apellidoMaterno ||
                  this.vidaDevolucionService.storage
                    .contractorServiceContratante?.apeMat || null,
                idSexo:
                  // storage.contractorService?.contratante?.idSexo ||
                  this.vidaDevolucionService.storage
                    .contractorServiceContratante?.sex || null,
                homonimo: storage.formContractor?.namesake || false ? '1' : '0',
                fechaNacimiento:
                  // storage.contractorService?.contratante?.fechaNacimiento ||
                  this.vidaDevolucionService.storage
                    .contractorServiceContratante?.birthdate || null,
                parentesco:
                  this.vidaDevolucionService.storage.parentescocontratante ||
                  this.parentescocontratantea ||
                  null,
                telefono:
                  this.vidaDevolucionService.storage.formContractorContratante
                    ?.phoneNumber,
                correo:
                  this.vidaDevolucionService.storage.formContractorContratante
                    ?.email,
                direccion:
                  this.vidaDevolucionService.storage.formContractorContratante
                    ?.direccion,
                idEstadoCivil:
                  this.vidaDevolucionService.storage.formContractorContratante
                    ?.estadoCivil,
                idDepartamento:
                  this.vidaDevolucionService.storage.formContractorContratante
                    ?.departamento,
                idProvincia:
                  this.vidaDevolucionService.storage.formContractorContratante
                    ?.provincia,
                idDistrito:
                  this.vidaDevolucionService.storage.formContractorContratante
                    ?.distrito,
                idOcupacion:
                  this.vidaDevolucionService.storage.formContractorContratante
                    ?.ocupacion,
                obligacionFiscal:
                  this.vidaDevolucionService.storage.formContractorContratante
                    ?.obligacionFiscalcontratante,
              }
            : null,
        aseguradoContratante: this.typeClients == 1 ? true : false,
        beneficiarioLegal:
          +storage.buyInsurance?.typeBeneficiaries == 1 ? '1' : '0',
        idTarifario: +storage.buyInsurance?.idTarif,
        beneficiarios: this.fb.getRawValue().map(
          (value: any) =>
            ({
              idTipoPersona: 1,
              idTipoDocumento: value.documentType,
              numeroDocumento: value.documentNumber,
              nombres: value.names,
              apellidoPaterno: value.lastName,
              apellidoMaterno: value.lastName2,
              idNacionalidad: value.nationality,
              fechaNacimiento:
                (value.birthdate || '').toString()?.indexOf('/') == -1
                  ? moment(value.birthdate).format('DD/MM/YYYY')
                  : value.birthdate,
              idSexo: value.sex,
              relacion: this.getJsonRelationship(value.relationship),
              porcentajeParticipacion: value.assignment,
            } || [])
        ),
      };

      this._spinner.show();

      this.quotationService.quote(request).subscribe({
        next: (response: any) => {
          this._spinner.hide();
          if (response.success) {
            const quotation = this.vidaDevolucionService.storage.buyInsurance;
            const quotations =
              this.vidaDevolucionService.storage.cotizaciones || [];

            if (!quotations.find((x) => x.processId == quotation.processId)) {
              quotations.unshift(quotation);
            } else {
              quotations[
                quotations
                  ?.map((x) => +x.processId)
                  ?.indexOf(+quotation.processId)
              ] = quotation;
            }

            this.vidaDevolucionService.storage = {
              cotizaciones: [...quotations, ...(response.cotizaciones || [])],
              cotizacionesNoVigentes: response.cotizacionesNoVigentes || [],
            };
            this.form.reset();
            this.fb.clear();
            this.formBeneficiary.reset();
          }
          this.quotationChange.emit({
            success: response.success,
          });
        },
        error: (error: HttpErrorResponse) => {
          console.error(error);
          this._spinner.hide();
        },
      });
    }
  }

  getJsonLocation(department: number, province: number, district: number): any {
    const departmentSelected = this.departments$?.find(
      (x) => +x.id == +department
    );
    const provinceSelected = departmentSelected?.provincias?.find(
      (x) => +x.idProvincia == province
    );
    const districtSelected = provinceSelected?.distritos?.find(
      (x) => +x.idDistrito == district
    );

    return {
      departamento: {
        id: department,
        descripcion: departmentSelected.descripcion,
      },
      provincia: {
        id: province,
        descripcion: provinceSelected.descripcion,
      },
      distrito: {
        id: district,
        descripcion: districtSelected.descripcion,
      },
    };
  }

  getJsonRelationship(id: number): any {
    return this.parameters$.parentescos.find((x) => +x.id == +id);
  }

  getNationalityDescription(id: number): string {
    return this.parameters$.nacionalidades?.find((x) => +x.id == +id)
      ?.descripcion;
  }

  parameters() {
    this._utilsService.parameters().subscribe(
      (res: ParametersResponse) => {
        this.vidaDevolucionService.storage = {
          parameters: res,
        };
        this.setParameters();
      },
      (err: any) => {
        console.log(err);
      }
    );
  }

  setParameters(): void {
    const parameters = this.vidaDevolucionService.storage?.parameters;
    this.parameters$ = parameters;
    this.departments$ = parameters?.ubigeos;
  }

  valueChangesUbigeos(): void {
    this.fbe['department'].valueChanges.subscribe((val) => {
      this.fbe['province'].setValue(null);
      this.fbe['district'].setValue(null);
      this.provinces$ = [];
      this.districts$ = [];
      this.setUbigeos();
    });
    this.fbe['province'].valueChanges.subscribe((val) => {
      this.fbe['district'].setValue(null);
      this.districts$ = [];
      const distritos = this.provinces$?.find(
        (x) => Number(x.idProvincia) === Number(val)
      )?.distritos;
      this.districts$ = distritos;
      this.setUbigeos();
    });
  }

  setUbigeos(): void {
    this.provinces$ = this.departments$?.find(
      (x) => +x.id === +this.fbe['department'].value
    )?.provincias;

    this.districts$ = this.provinces$?.find(
      (x) => +x.idProvincia === +this.fbe['province'].value
    )?.distritos;
  }

  textoParentesco(id) {
    return this.parameters$?.parentescos?.find((x) => +x.id == +id)
      ?.descripcion;
  }

  get sumPercentagesBeneficiaries(): number {
    const beneficiaries =
      (this.f['beneficiaries'] as FormArray).getRawValue() || [];
    return beneficiaries.map((x) => +x.assignment).reduce((a, b) => a + b, 0);
  }

  get isValidForm(): boolean {
    if (this.parentescocontratantea === null && this.typeClients == 1) {
      return false;
    }

    if (+this.f['typeBeneficiaries'].value == 2) {
      if (this.typeClients == 1) {
        return (
          this.form.valid &&
          this.sumPercentagesBeneficiaries == 100 &&
          this.beneficiariesLength <= 4 &&
          this.validDoc
        );
      } else {
        return (
          this.form.valid &&
          this.sumPercentagesBeneficiaries == 100 &&
          this.beneficiariesLength <= 4
        );
      }
    }
    if (this.typeClients == 1) {
      return (
        this.form.valid &&
        +this.f['typeBeneficiaries'].value == 1 &&
        this.validDoc
      );
    } else {
      return this.form.valid && +this.f['typeBeneficiaries'].value == 1;
    }
  }

  changeBeneficiaryType() {
    if (+this.f['typeBeneficiaries'].value == 1) {
      this.f['typeBeneficiaries'].setValue(2);
    } else {
      this.f['typeBeneficiaries'].setValue(1);
    }
  }

  requestClientInfo() {
    this.recaptcha.execute();
  }

  resolved(token: string) {
    if (token) {
      this.getDocumentInfo(token);
      this.recaptcha.reset();
      return;
    }
  }
}
