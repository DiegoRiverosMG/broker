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
  AbstractControl,
  Validators,
  FormArray,
  FormControl,
} from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { NuevoTramiteService } from '../../../services/portal-tramites/nuevo-tramite.service';
import { PortalTramitesService } from '../../../services/portal-tramites/portal-tramites.service';
import { UtilsService } from '@shared/services/utils/utils.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { HttpErrorResponse } from '@angular/common/http';
import { ChannelSalesModel } from '@shared/models/channel-point-sales/channel-point-sale.model';
import { BsDatepickerConfig } from 'ngx-bootstrap/datepicker';
import {
  IDepartamentoModel,
  IDistritoModel,
  IProvinciaModel,
  ParametersResponse,
} from '@shared/models/ubigeo/parameters.model';
import {
  DocumentFormatResponse,
  DocumentResponse,
} from '../../../../../shared/models/document/document.models';
import {
  AutoParameterModel,
  AutoUseResponse,
} from '../../../../../shared/models/utils/utils.model';
import moment from 'moment';
import {
  ICalculateAutoPremiumRequest,
  ICalculateAutoPrmeiumResponse,
} from '../../../interfaces/auto.interface';

@Component({
  selector: 'app-nuevo-tramite',
  templateUrl: './nuevo-tramite.component.html',
  styleUrls: ['./nuevo-tramite.component.scss'],
})
export class NuevoTramiteComponent implements OnInit {
  datePickerConfig: Partial<BsDatepickerConfig>;

  form: FormGroup;

  procedureData$: any;
  datosPoliza$: any;
  datosCliente$: any;
  transactData$: any;

  channelSales$: Array<any>;
  parameters$: ParametersResponse;
  departments$: Array<IDepartamentoModel>;
  provinces$: Array<IProvinciaModel>;
  districts$: Array<IDistritoModel>;

  autoBrands$: Array<AutoParameterModel>;
  autoModels$: Array<AutoParameterModel>;
  autoClass$: Array<AutoParameterModel>;
  autoUses$: Array<AutoUseResponse>;

  cardBrands$: any;
  carUses$: any;
  carModels$: any;
  carClass$: any;
  bsValueIni: Date;

  stateEdit: boolean;
  editV: boolean;
  fvalue: string;
  blockSave: boolean;
  blockerSave: boolean;
  upload: boolean;
  thirdBlocker: boolean;
  fBlock: boolean;
  btnBLockP: boolean;
  btnBlockS: boolean;

  procedureCurrentValues: any;
  procedureNewValues: any;
  endorsementType: number;
  uploadedFiles: Array<File>;

  policySelected: number;
  message: string;

  editPolicy: boolean;
  editAuto: boolean;
  editContractor: boolean;

  backToHome: boolean;

  takeDate: any;
  brandDesc: string;
  modelDesc: string;
  classDesc: string;
  useDesc: string;
  bsValueFin: Date;

  validatorPlate: boolean;

  limitDocumentNumber: { min: number; max: number };

  changePremium: number;
  responseSuccess: boolean;

  isEditValid: boolean;
  currentValueAuto: any;
  currentValueContractor: any;
  messageInvalidEdit: string[] = [];
  messageInvalidProcedure: string = '';
  messageErrorFileUploaded = '';

  isChangeAutoTariff: boolean = false;
  channelDirect: string = '2015000002';

  @ViewChild('modalProcedure', { static: true, read: TemplateRef })
  _modalProcedure: TemplateRef<any>;
  @ViewChild('modalConfirProcedure', { static: true, read: TemplateRef })
  _modalConfirProcedure: TemplateRef<any>;
  @ViewChild('modalMessage', { static: true, read: TemplateRef })
  _modalMessage: TemplateRef<any>;
  nonContinue: boolean;

  private readonly operationProfiles: number[] = [20, 151, 155];

  constructor(
    private readonly _builder: FormBuilder,
    private readonly _vc: ViewContainerRef,
    private readonly _nuevoTramiteService: NuevoTramiteService,
    private readonly _portalTramitesService: PortalTramitesService,
    private readonly _utilsService: UtilsService,
    private readonly _spinner: NgxSpinnerService,
    private readonly _router: Router,
    private readonly _route: ActivatedRoute
  ) {
    this.responseSuccess = false;
    this.changePremium = 0;
    this.limitDocumentNumber = {
      min: 8,
      max: 12,
    };
    this.nonContinue = true;
    this.backToHome = false;
    this.procedureCurrentValues = this.procedureNewValues = {};
    this.editPolicy = this.editAuto = this.editContractor = false;
    this.uploadedFiles = new Array();
    this.validatorPlate = false;

    this.channelSales$ = new Array();
    this.form = this._builder.group({
      policy: this._builder.group({
        policy: [null, Validators.required],
        validity: [null],
        startValidity: [null, Validators.required],
        endValidity: [null, Validators.required],
        premium: [null, Validators.required],
        channelSale: [null, Validators.required],
      }),
      contractor: this._builder.group({
        documentType: [{ value: null, disabled: true }, Validators.required],
        documentNumber: [
          { value: null, disabled: true },
          Validators.pattern(this._utilsService.onlyNumbers),
        ],
        legalName: [{ value: null, disabled: true }],
        names: [{ value: null, disabled: true }],
        apePat: [{ value: null, disabled: true }],
        apeMat: [{ value: null, disabled: true }],
        department: [{ value: null, disabled: true }, Validators.required],
        province: [{ value: null, disabled: true }, Validators.required],
        district: [{ value: null, disabled: true }, Validators.required],
        address: [{ value: null, disabled: true }, Validators.required],
        cellPhone: [
          null,
          [
            Validators.pattern(this._utilsService.onlyNumbers),
            Validators.required,
          ],
        ],
        email: [
          null,
          [
            Validators.pattern(this._utilsService.onlyEmail),
            Validators.required,
          ],
        ],
        isGovernment: [false, Validators.required],
      }),
      auto: this._builder.group({
        licensePlate: [
          null,
          [
            Validators.pattern(_utilsService.alphaNumeric),
            Validators.required,
            Validators.minLength(6),
            Validators.maxLength(7),
            this.inputValidator,
          ],
        ],
        brand: [null, Validators.required],
        brandDesc: [null],
        model: [null],
        modelDesc: [null, Validators.required],
        version: [null, Validators.required],
        versionDesc: [null],
        use: [null, Validators.required],
        useDesc: [null],
        class: [null, Validators.required],
        classDesc: [null],
        serialNumber: [
          null,
          [
            Validators.required,
            Validators.minLength(10),
            Validators.maxLength(30),
            this.inputValidator,
          ],
        ],
        year: [
          null,
          [
            Validators.required,
            Validators.pattern(this._utilsService.onlyNumbers),
            Validators.min(1950),
            Validators.max(new Date().getFullYear() + 1),
          ],
        ],
        seating: [
          null,
          [
            Validators.required,
            Validators.pattern(this._utilsService.onlyNumbers),
            Validators.min(1),
            Validators.max(99),
          ],
        ],
      }),
      files: this._builder.array([]),
    });
    this.stateEdit = false;
    this.blockSave = false;
    this.blockerSave = false;
    this.upload = false;
    this.editV = false;
    this.thirdBlocker = false;
    this.fBlock = false;
    this.btnBLockP = true;
    this.btnBlockS = false;

    this.getChannelSales();
  }

  ngOnInit(): void {
    this.getParameters();
    this.getAutoBrands();
  }

  paramsUrl(): void {
    this._route.queryParams.subscribe((params: any) => {
      if (params?.policy) {
        this.policySelected = params.policy;
        this.cargarDatos(+params.policy);
      }
      if (params?.type) {
        this.endorsementType = +params.type;
        this.getDocuments(+params.type);
      }
    });
  }

  setProvinces(id: number): void {
    this.provinces$ =
      this.departments$?.find((x) => +x.id == id)?.provincias || [];
  }

  setDistricts(id: number): void {
    this.districts$ =
      this.provinces$?.find((x) => +x.idProvincia == id)?.distritos || [];
  }

  get currentUser(): any {
    return JSON.parse(localStorage.getItem('currentUser'));
  }

  get isOperaciones(): boolean {
    return this.operationProfiles.includes(+this.currentUser?.profileId);
  }

  get formControl(): { [key: string]: AbstractControl } {
    return this.form.controls;
  }

  get formPolicy(): FormGroup {
    return this.formControl['policy'] as FormGroup;
  }

  get formPolicyControl(): { [key: string]: AbstractControl } {
    return this.formPolicy.controls;
  }

  get formAutoControl(): { [key: string]: AbstractControl } {
    return this.formAuto.controls;
  }

  get formContractor(): FormGroup {
    return this.formControl['contractor'] as FormGroup;
  }

  get formContractorControl(): { [key: string]: AbstractControl } {
    return this.formContractor.controls;
  }

  get formAuto(): FormGroup {
    return this.formControl['auto'] as FormGroup;
  }

  get formArrayFiles(): FormArray {
    return this.formControl['files'] as FormArray;
  }

  inputValidator(control: FormControl) {
    if (!control.value) {
      return null;
    }

    const regex = new RegExp(/^[0]+$/);

    const valid = regex.test(control.value);

    return valid ? { customError: true } : null;
  }

  valueChangesForm(): void {
    this.formContractorControl['documentType'].valueChanges.subscribe(
      (_: string) => {
        this.form.enable({
          emitEvent: false,
        });
        this.documentNumberValidators();
        if (this.formContractorControl['documentType'].dirty) {
          this.formContractorControl['documentNumber'].updateValueAndValidity();
          this.formContractorControl['documentNumber'].setValue(null);
          this.formContractorControl['legalName'].setValue(null);
          this.formContractorControl['names'].setValue(null);
          this.formContractorControl['apePat'].setValue(null);
          this.formContractorControl['apeMat'].setValue(null);
          this.formContractorControl['department'].setValue(null);
          this.formContractorControl['province'].setValue(null);
          this.formContractorControl['district'].setValue(null);
          this.formContractorControl['cellPhone'].setValue(null);
          this.formContractorControl['address'].setValue(null);
          this.formContractorControl['email'].setValue(null);
        }
      }
    );
    this.formContractorControl['documentNumber'].valueChanges.subscribe(
      (_: string) => {
        if (_) {
          if (!this._utilsService.onlyNumbers.test(_)) {
            this.formContractorControl['documentNumber'].setValue(
              _.slice(0, _.length - 1)
            );
          }
        }
      }
    );
    this.formContractorControl['department'].valueChanges.subscribe(
      (_: string) => {
        if (_) {
          this.setProvinces(+_);
          this.districts$ = [];
          this.formContractorControl['province'].setValue(null);
          this.formContractorControl['district'].setValue(null);
        }
      }
    );
    this.formContractorControl['province'].valueChanges.subscribe(
      (_: string) => {
        if (_) {
          this.setDistricts(+_);
          this.formContractorControl['district'].setValue(null);
        }
      }
    );
    this.formPolicyControl['startValidity'].valueChanges.subscribe(
      (_: string) => {
        if (_) {
          const selectedDate = new Date(_);
          const nextYear = selectedDate.getFullYear() + 1;

          if (selectedDate.getMonth() === 1 && selectedDate.getDate() === 29) {
            this.formPolicyControl['endValidity'].setValue(
              new Date(nextYear, 1, 28)
            );
          } else {
            this.formPolicyControl['endValidity'].setValue(
              new Date(new Date(_).setFullYear(new Date(_).getFullYear() + 1))
            );
          }
        }
      }
    );
    this.formAutoControl['brand'].valueChanges.subscribe((_) => {
      if (this.formAutoControl['brand'].dirty) {
        this.formAutoControl['version'].setValue(null);
        this.formAutoControl['versionDesc'].setValue(null);
        this.formAutoControl['model'].setValue(null);
        this.formAutoControl['modelDesc'].setValue(null);
        this.formAutoControl['class'].setValue(null);
        this.formAutoControl['use'].setValue(null);
        this.autoModels$ = [];
        this.autoClass$ = [];
        this.autoUses$ = [];
      }
      if (_) {
        this.getAutoModels();
        this.isChangeAutoTariff = true;
      }
    });

    this.formAutoControl['licensePlate'].valueChanges.subscribe((_: string) => {
      if (_) {
        if (!this._utilsService.alphaNumeric.test(_)) {
          this.formAutoControl['licensePlate'].setValue(
            _.slice(0, _.length - 1)
          );
        }
      }
    });

    this.formAutoControl['seating'].valueChanges.subscribe((_: string) => {
      if (_) {
        if (!this._utilsService.onlyNumbers.test(_)) {
          this.formAutoControl['seating'].setValue(_.slice(0, _.length - 1));
        }
        this.isChangeAutoTariff = true;
      }
    });

    this.formAutoControl['serialNumber'].valueChanges.subscribe((_: string) => {
      if (_) {
        const regex = new RegExp(/^[1-9A-Za-z][0-9A-Za-z]*$/);
        if (!regex.test(_)) {
          this.formAutoControl['serialNumber'].setValue(
            _.slice(0, _.length - 1)
          );
        }
      }
    });

    this.formAutoControl['year'].valueChanges.subscribe((_: string) => {
      if (_) {
        if (!this._utilsService.onlyNumbers.test(_)) {
          this.formAutoControl['year'].setValue(_.slice(0, _.length - 1));
        }

        if (
          this.formAutoControl['year'].value > 1900 &&
          this.formAutoControl['year'].value < 2024
        ) {
          this.nonContinue = false;
        } else {
          this.nonContinue = true;
        }
      }
    });

    this.formAutoControl['versionDesc'].valueChanges.subscribe(
      (value: string) => {
        if (this.formAutoControl['versionDesc'].dirty) {
          this.formAutoControl['class'].setValue(null);
          this.formAutoControl['use'].setValue(null);
          this.autoClass$ = [];
          this.autoUses$ = [];
        }
        if (value) {
          const find = this.autoModels$?.find((x) => x.desc == value);
          if (find) {
            this.formAutoControl['model'].setValue(find?.mainModelId);
            this.formAutoControl['modelDesc'].setValue(find?.desc);
          }
          this.getAutoClass();
          this.isChangeAutoTariff = true;
        }
      }
    );

    this.formAutoControl['class'].valueChanges.subscribe((value: string) => {
      if (this.formAutoControl['class'].dirty) {
        this.formAutoControl['use'].setValue(null);
        this.autoUses$ = [];
      }
      if (value) {
        const modelValue = this.autoClass$?.find((x) => +x.classId == +value);

        this.formAutoControl['model'].setValue(modelValue.mainModelId);
        this.formAutoControl['version'].setValue(modelValue.modelId);
        this.procedureNewValues.model =
          +this.formAutoControl['model'].value || null;
        this.procedureNewValues.version =
          +this.formAutoControl['version'].value || null;
        this.getAutoUses();
        this.isChangeAutoTariff = true;
      }
    });

    this.formAutoControl['use'].valueChanges.subscribe((value: string) => {
      if (value) {
        this.isChangeAutoTariff = true;
      }
    });

    this.formContractorControl['cellPhone'].valueChanges.subscribe(
      (value: string) => {
        if (value) {
          if (
            this.formContractorControl['cellPhone'].hasError('pattern') ||
            value?.toString()?.slice(0, 1) != '9'
          ) {
            this.formContractorControl['cellPhone'].setValue(
              value.substring(0, value.length - 1)
            );
          }
        }
      }
    );

    this.formContractorControl['names'].valueChanges.subscribe(
      (value: string) => {
        if (value) {
          if (!this._utilsService.onlyLetters.test(value)) {
            this.formContractorControl['names'].setValue(
              value.slice(0, value.length - 1)
            );
          }
        }
      }
    );

    this.formContractorControl['apePat'].valueChanges.subscribe(
      (value: string) => {
        if (value) {
          if (!this._utilsService.onlyLetters.test(value)) {
            this.formContractorControl['apePat'].setValue(
              value.slice(0, value.length - 1)
            );
          }
        }
      }
    );

    this.formContractorControl['apeMat'].valueChanges.subscribe(
      (value: string) => {
        if (value) {
          if (!this._utilsService.onlyLetters.test(value)) {
            this.formContractorControl['apeMat'].setValue(
              value.slice(0, value.length - 1)
            );
          }
        }
      }
    );
  }

  setAutoDescriptions(): void {
    if (this.formAutoControl['brand'].value) {
      this.formAutoControl['brandDesc'].setValue(
        this.autoBrands$?.find(
          (x) => +x.brandId == +this.formAutoControl['brand'].value
        )?.desc
      );
      this.procedureNewValues.brandDesc =
        this.formAutoControl['brandDesc'].value;
    }

    if (this.formAutoControl['modelDesc'].value) {
      this.formAutoControl['model'].setValue(
        this.autoClass$.find(
          (x) => +this.formAutoControl['class'].value == +x.classId
        ).mainModelId
      );
      this.procedureNewValues.modelDesc =
        this.formAutoControl['modelDesc'].value;
    }

    if (this.formAutoControl['class'].value) {
      this.formAutoControl['classDesc'].setValue(
        this.autoClass$?.find(
          (x) => +x.classId == +this.formAutoControl['class'].value
        )?.desc
      );
      this.procedureNewValues.classDesc =
        this.formAutoControl['classDesc'].value;
    }

    if (this.formAutoControl['use'].value) {
      this.formAutoControl['useDesc'].setValue(
        this.autoUses$?.find(
          (x) => +x.useId == +this.formAutoControl['use'].value
        )?.desc
      );
      this.procedureNewValues.useDesc = this.formAutoControl['useDesc'].value;
    }
  }

  documentNumberValidators(): void {
    switch (+this.formContractorControl['documentType'].value) {
      case 1:
        this.limitDocumentNumber = {
          min: 11,
          max: 11,
        };
        if (this.isRucPerson) {
          this.formContractorControl['legalName'].clearValidators();
          this.formContractorControl['names'].setValidators([
            Validators.pattern(this._utilsService.onlyLetters),
            Validators.required,
          ]);
          this.formContractorControl['apePat'].setValidators([
            Validators.pattern(this._utilsService.onlyLetters),
            Validators.required,
          ]);
          this.formContractorControl['apeMat'].setValidators([
            Validators.pattern(this._utilsService.onlyLetters),
            Validators.required,
          ]);
        } else {
          this.formContractorControl['names'].clearValidators();
          this.formContractorControl['apePat'].clearValidators();
          this.formContractorControl['apeMat'].clearValidators();
          this.formContractorControl['legalName'].setValidators(
            Validators.required
          );
        }
        break;
      case 2:
        this.limitDocumentNumber = {
          min: 8,
          max: 8,
        };
        this.formContractorControl['legalName'].clearValidators();
        this.formContractorControl['names'].setValidators([
          Validators.pattern(this._utilsService.onlyLetters),
          Validators.required,
        ]);
        this.formContractorControl['apePat'].setValidators([
          Validators.pattern(this._utilsService.onlyLetters),
          Validators.required,
        ]);
        this.formContractorControl['apeMat'].setValidators([
          Validators.pattern(this._utilsService.onlyLetters),
          Validators.required,
        ]);
        break;
      case 4:
        this.limitDocumentNumber = {
          min: 9,
          max: 12,
        };
        this.formContractorControl['legalName'].clearValidators();
        this.formContractorControl['names'].setValidators([
          Validators.pattern(this._utilsService.onlyLetters),
          Validators.required,
        ]);
        this.formContractorControl['apePat'].setValidators([
          Validators.pattern(this._utilsService.onlyLetters),
          Validators.required,
        ]);
        this.formContractorControl['apeMat'].setValidators([
          Validators.pattern(this._utilsService.onlyLetters),
          Validators.required,
        ]);
        break;
    }
    this.formContractorControl['documentNumber'].setValidators([
      Validators.pattern(this._utilsService.onlyNumbers),
      Validators.required,
      Validators.minLength(this.limitDocumentNumber.min),
      Validators.maxLength(this.limitDocumentNumber.max),
    ]);
    this.formContractorControl['documentNumber'].updateValueAndValidity();
    this.formContractorControl['legalName'].updateValueAndValidity();
    this.formContractorControl['names'].updateValueAndValidity();
    this.formContractorControl['apePat'].updateValueAndValidity();
    this.formContractorControl['apeMat'].updateValueAndValidity();
  }

  getParameters(): void {
    this._spinner.show();
    this._utilsService.parameters().subscribe(
      (response: ParametersResponse) => {
        this.parameters$ = response;
        this.departments$ = response.ubigeos;
        this.paramsUrl();
      },
      (error: HttpErrorResponse) => {
        console.error(error);
      }
    );
  }

  getAutoBrands(): void {
    const payload = {
      NCODCHANNEL: this.isOperaciones
        ? this.channelDirect
        : this.currentUser['canal'],
    };
    this._utilsService.getAutoBrands(payload).subscribe(
      (response: AutoParameterModel[]) => {
        this.autoBrands$ = response;
      },
      (error: HttpErrorResponse) => {
        console.error(error);
      }
    );
  }

  getAutoModels(charge: boolean = false): void {
    this._spinner.show();
    const payload = {
      brandId: +this.formAutoControl['brand'].value,
      channelCode: this.isOperaciones
        ? this.channelDirect
        : this.currentUser['canal'],
    };
    this._utilsService.getAutoModels(payload).subscribe(
      (response: AutoParameterModel[]) => {
        this.autoModels$ = response;
        this._spinner.hide();
        if (charge) {
          this.getAutoClass(true);
        }
      },
      (error: HttpErrorResponse) => {
        console.error(error);
        this._spinner.hide();
      }
    );
  }

  getAutoClass(charge: boolean = false): void {
    this._spinner.show();
    const _ = {
      brandId: +this.formAutoControl['brand'].value,
      desc: this.formAutoControl['versionDesc'].value,
      channelCode: this.isOperaciones
        ? this.channelDirect
        : this.currentUser['canal'],
    };
    this._utilsService.getAutoClass(_).subscribe(
      (response: AutoParameterModel[]) => {
        this.autoClass$ = response;
        this._spinner.hide();
        if (charge) {
          this.getAutoUses();
        }
      },
      (error: HttpErrorResponse) => {
        console.error(error);
        this._spinner.hide();
      }
    );
  }

  getAutoUses(): void {
    this._spinner.show();
    const payload = {
      classAuto: +this.formAutoControl['class'].value,
      channelCode: this.isOperaciones
        ? this.channelDirect
        : this.currentUser['canal'],
    };
    this._utilsService.getAutoUses(payload).subscribe(
      (response: AutoUseResponse[]) => {
        this.autoUses$ = response.filter((x) => x.useId !== 17);
        this._spinner.hide();
      },
      (error: HttpErrorResponse) => {
        console.error(error);
        this._spinner.hide();
      }
    );
  }

  savePolicy(): void {
    this.procedureNewValues = {
      ...this.procedureNewValues,
      ...this.formPolicy.getRawValue(),
    };
    this.editPolicy = false;
  }

  validateEditPolicy(): boolean {
    const vigencia = this.transactData$?.vigenciaPermitida;
    const recibo = this.transactData$?.reciboCobrado;
    const planilla = this.transactData$?.planillaLiquidada;
    const tramite = this.transactData$?.tramitePermitido;
    const proceso = !this.transactData$?.tramiteEnProceso;
    const tipoPoliza = this.transactData$?.tipoPolizaPermitida;

    this.messageInvalidEdit = [];

    if (!vigencia) {
      this.messageInvalidEdit.push('La póliza fue emitida hace más de 15 días');
    }

    if (!recibo) {
      this.messageInvalidEdit.push(
        'La póliza/recibo no se encuentra en estado COBRADO'
      );
    }

    if (!planilla) {
      this.messageInvalidEdit.push(
        'La planilla de la póliza no se encuentra en estado LIQUIDADO'
      );
    }

    if (!tramite) {
      this.messageInvalidEdit.push(
        'Has excedido la cantidad de trámites permitidos por día'
      );
    }

    if (!tipoPoliza) {
      this.messageInvalidEdit.push(
        'El tipo de póliza permitida debe ser digital'
      );
    }

    this.isEditValid =
      vigencia && recibo && planilla && tramite && proceso && tipoPoliza;
    return this.isEditValid;
  }

  validateProcedure(): boolean {
    if (!this.transactData$?.tramitePermitido) {
      this.messageInvalidProcedure =
        'Has excedido la cantidad de trámites permitidos por día';
    } else {
      this.messageInvalidProcedure = '';
    }

    return this.transactData$?.tramitePermitido;
  }

  cancelPolicy(): void {
    this.formPolicy.patchValue(this.procedureNewValues, { emitEvent: false });
    this.editPolicy = false;
  }

  isEditAuto(): void {
    if (!this.transactData$?.tramitePermitido) {
      return;
    }

    this.editAutoForm = true;
    this.isChangeAutoTariff = false;
  }

  set editAutoForm(val: boolean) {
    this.editAuto = val;
    this.getAutoModels(true);
  }

  saveAuto(): void {
    this.procedureNewValues = {
      ...this.procedureNewValues,
      ...this.formAuto.getRawValue(),
    };
    this.editAuto = false;
    this.setAutoDescriptions();
    this.validateChangeForTariff();
    this.validateDataAuto();
  }

  validateChangeForTariff(): void {
    if (this.isChangeAutoTariff) {
      this.calculateAutoPremium();
    }

    this.isChangeAutoTariff = false;
  }

  validateDataAuto(): void {
    const indexFiles = this.formArrayFiles.controls.findIndex(
      (control) => control.get('documentId')?.value == '2'
    );

    if (
      JSON.stringify(this.formControl['auto'].value) !==
      JSON.stringify(this.currentValueAuto)
    ) {
      this.formArrayFiles.controls[indexFiles].patchValue({
        required: true,
      });

      this.formArrayFiles.controls[indexFiles]
        .get('fileName')
        .setValidators([Validators.required]);
      this.formArrayFiles.controls[indexFiles]
        .get('fileName')
        .updateValueAndValidity();
    } else {
      this.formArrayFiles.controls[indexFiles].patchValue({
        required: false,
      });

      this.formArrayFiles.controls[indexFiles]
        .get('fileName')
        .clearValidators();
      this.formArrayFiles.controls[indexFiles]
        .get('fileName')
        .updateValueAndValidity();
    }
  }

  cancelAuto(): void {
    this.formAuto.patchValue(this.procedureNewValues, { emitEvent: false });
    this.editAuto = false;
  }

  saveContractor(): void {
    this.procedureNewValues = {
      ...this.procedureNewValues,
      ...this.formContractor.getRawValue(),
    };
    this.editContractor = false;
    this._vc.clear();
    this.validateDataContractor();
  }

  validateDataContractor(): void {
    const indexFiles = this.formArrayFiles.controls.findIndex(
      (control) => control.get('documentId')?.value == '3'
    );

    if (
      JSON.stringify(this.formControl['contractor'].value) !==
      JSON.stringify(this.currentValueContractor)
    ) {
      this.formArrayFiles.controls[indexFiles].patchValue({
        required: true,
      });

      this.formArrayFiles.controls[indexFiles]
        .get('fileName')
        .setValidators([Validators.required]);
      this.formArrayFiles.controls[indexFiles]
        .get('fileName')
        .updateValueAndValidity();
    } else {
      this.formArrayFiles.controls[indexFiles].patchValue({
        required: false,
      });

      this.formArrayFiles.controls[indexFiles]
        .get('fileName')
        .clearValidators();
      this.formArrayFiles.controls[indexFiles]
        .get('fileName')
        .updateValueAndValidity();
    }
  }

  cancelContractor(): void {
    this.formContractor.patchValue(this.procedureNewValues, {
      emitEvent: false,
    });
    this.editContractor = false;
    this._vc.clear();
    this.setUbigeo();
  }

  setUbigeo(): void {
    this.provinces$ = this.departments$?.find(
      (x) => +x.id == +this.formContractorControl['department'].value
    )?.provincias;
    this.districts$ = this.provinces$?.find(
      (x) => +x.idProvincia == this.formContractorControl['province'].value
    )?.distritos;
  }

  openModalProcedure(): void {
    if (!this.transactData$?.tramitePermitido) {
      return;
    }
    this._vc.createEmbeddedView(this._modalProcedure);
  }

  openConfirModal(): void {
    this._vc.createEmbeddedView(this._modalConfirProcedure);
  }

  closeModal(): void {
    this._vc.clear();
    if (this.backToHome) {
      this._router.navigate(['/extranet/portal-tramites']);
    }
    this.backToHome = false;
  }

  changeSet() {
    this.stateEdit = true;
  }

  changeBet() {
    this.stateEdit = false;
  }

  changeEdit() {
    this.editV = false;
    this.fBlock = false;
  }

  checkUploadFile() {
    this.blockSave = true;
  }

  checkThirdFile() {
    this.thirdBlocker = true;
    this.editV = false;
  }

  checkUploadFile_() {
    this.blockerSave = true;
    this.closeModal();
  }

  file3_() {
    this.upload = true;
    this.blockerSave = false;
  }

  changeVehicle() {
    this.editV = true;
    this.fBlock = true;
    this.btnBLockP = false;
  }

  cargarDatos(id: number) {
    this._spinner.show();
    this._portalTramitesService.getSummary(id).subscribe(
      (response: any) => {
        if (response.data.detallePoliza) {
          this.transactData$ = response.data.detallePoliza;

          let startDate = null;
          let endDate = null;

          if (this.transactData$.fechaInicio) {
            startDate = this.transactData$.fechaInicio;
            startDate = startDate.split('/');
            startDate = new Date(
              `${startDate[1]}-${startDate[0]}-${startDate[2]}`
            );
          }

          if (this.transactData$.fechaFin) {
            endDate = this.transactData$.fechaFin;
            endDate = endDate.split('/');
            endDate = new Date(`${endDate[1]}-${endDate[0]}-${endDate[2]}`);
          }
          this.valueChangesForm();
          this.formPolicyControl['policy'].setValue(id);
          this.formPolicyControl['validity'].setValue(null);
          this.formPolicyControl['startValidity'].setValue(startDate);
          this.formPolicyControl['endValidity'].setValue(endDate);
          this.formPolicyControl['premium'].setValue(this.transactData$.prima);
          this.formPolicyControl['channelSale'].setValue(
            this.transactData$.canal
          );

          this.formAutoControl['licensePlate'].setValue(
            this.transactData$.placa
          );

          this.formAutoControl['brandDesc'].setValue(this.transactData$.marca);
          this.brandDesc = this.formAutoControl['brandDesc'].value;
          this.formAutoControl['brand'].setValue(
            this.transactData$.codigoMarca,
            {
              emitEvent: false,
            }
          );
          this.formAutoControl['model'].setValue(
            +this.transactData$.codigoModelo
          );
          this.formAutoControl['modelDesc'].setValue(this.transactData$.modelo);
          this.modelDesc = this.formAutoControl['modelDesc'].value;

          this.formAutoControl['version'].setValue(
            this.transactData$.codigoVersion
          );
          this.formAutoControl['versionDesc'].setValue(
            this.transactData$.version
          );

          this.formAutoControl['classDesc'].setValue(this.transactData$.clase);
          this.classDesc = this.formAutoControl['classDesc'].value;
          this.formAutoControl['class'].setValue(
            this.transactData$.codigoClase,
            {
              emitEvent: false,
            }
          );

          this.formAutoControl['useDesc'].setValue(this.transactData$.uso);
          this.useDesc = this.formAutoControl['useDesc'].value;
          this.formAutoControl['use'].setValue(this.transactData$.codigoUso);

          this.formAutoControl['serialNumber'].setValue(
            this.transactData$.serie
          );
          this.formAutoControl['year'].setValue(this.transactData$.anio);
          this.formAutoControl['seating'].setValue(this.transactData$.asientos);

          this.formContractorControl['documentType'].setValue(
            this.getDocumentId(this.transactData$.tipoDocumento || 0),
            { emitEvent: false }
          );
          this.documentNumberValidators();
          this.formContractorControl['documentNumber'].setValue(
            this.transactData$.numeroDocumento
          );

          this.formContractorControl['legalName'].setValue(
            this.transactData$.razonSocial
          );
          this.formContractorControl['names'].setValue(
            this.transactData$.nombres
          );
          this.formContractorControl['apePat'].setValue(
            this.transactData$.apellidoPaterno
          );
          this.formContractorControl['apeMat'].setValue(
            this.transactData$.apellidoMaterno
          );

          this.formContractorControl['names'].disable();
          this.formContractorControl['apePat'].disable();
          this.formContractorControl['apeMat'].disable();

          this.formContractorControl['department'].setValue(
            this.getDepartmentId(this.transactData$.departamento),
            { emitEvent: false }
          );
          this.setProvinces(+this.formContractorControl['department'].value);
          this.formContractorControl['province'].setValue(
            this.getProvinceId(this.transactData$.provincia),
            { emitEvent: false }
          );
          this.setDistricts(+this.formContractorControl['province'].value);
          this.formContractorControl['district'].setValue(
            this.getDistrictId(this.transactData$.distrito),
            { emitEvent: false }
          );

          this.formContractorControl['email'].setValue(
            this.transactData$.correo
          );
          this.formContractorControl['address'].setValue(
            this.transactData$.direccion
          );
          this.formContractorControl['cellPhone'].setValue(
            this.transactData$.telefono
          );

          const form = this.form.getRawValue();

          const values = {
            ...form.policy,
            ...form.auto,
            ...form.contractor,
          };

          const freezeObject = Object.freeze({
            ...form.policy,
            ...form.auto,
            ...form.contractor,
          });

          this.procedureNewValues = values;
          this.procedureCurrentValues = freezeObject;

          const today = moment(new Date(), 'DD/MM/YYYY').toDate();

          const maxDate = new Date(
            new Date().setFullYear(new Date().getFullYear() + 1)
          );

          this.datePickerConfig = Object.assign(
            {},
            {
              locale: 'es',
              showWeekNumbers: false,
              dateInputFormat: 'DD/MM/YYYY',
              minDate: today,
              maxDate: maxDate,
            }
          );

          this.currentValueAuto = this.formControl['auto'].value;
          this.currentValueContractor = this.formControl['contractor'].value;

          this._spinner.hide();

          return;
        }
        this._spinner.hide();
      },
      (error: HttpErrorResponse) => {
        console.error(error);
        this._spinner.hide();
      }
    );
  }

  cancelUp() {
    this.thirdBlocker = false;
  }

  getDocuments(type: number): void {
    const data = {
      tipoTramite: type,
    };

    this._nuevoTramiteService.getDocuments(data).subscribe(
      (response: any) => {
        if (response.data.documentosTramite) {
          this.formArrayFiles.clear();
          response.data.documentosTramite.forEach((e, i) => {
            const required = e.obligatorio == 'Si';
            this.uploadedFiles.push(null);
            this.formArrayFiles.push(
              this._builder.group({
                documentId: [e.idTipoDocumento],
                description: [e.tipoDocumento],
                required: [required],
                file: [null],
                fileName: [null, required ? Validators.required : null],
              })
            );
          });
        }
      },
      (error: HttpErrorResponse) => {
        console.error(error);
      }
    );
  }

  getInfoDocument(): void {
    if (this.formContractorControl['documentNumber'].invalid) {
      return;
    }
    const payload = {
      type: this.formContractorControl['documentType'].value,
      documentNumber: this.formContractorControl['documentNumber'].value,
    };
    this._spinner.show();
    this._utilsService.documentData(payload).subscribe(
      (response: DocumentResponse) => {
        const _ = new DocumentFormatResponse(response);

        if (payload.type != 1) {
          this.formContractorControl['legalName'].setValue(null);
          this.formContractorControl['names'].setValue(_.names);
          this.formContractorControl['apePat'].setValue(_.apellidoPaterno);
          this.formContractorControl['apeMat'].setValue(_.apellidoMaterno);

          if (_.names) {
            this.formContractorControl['names'].disable();
          } else {
            this.formContractorControl['names'].enable();
          }

          if (_.apellidoPaterno) {
            this.formContractorControl['apePat'].disable();
          } else {
            this.formContractorControl['apePat'].enable();
          }

          if (_.apellidoMaterno) {
            this.formContractorControl['apeMat'].disable();
          } else {
            this.formContractorControl['apeMat'].enable();
          }
        } else {
          this.formContractorControl['legalName'].setValue(_.completeNames);
          this.formContractorControl['names'].setValue(null);
          this.formContractorControl['apePat'].setValue(null);
          this.formContractorControl['apeMat'].setValue(null);
          if (_.completeNames) {
            this.formContractorControl['legalName'].disable();
          }
        }

        this.formContractorControl['department'].setValue(_.department, {
          emitEvent: false,
        });
        this.setProvinces(+this.formContractorControl['department'].value);
        this.formContractorControl['province'].setValue(_.province, {
          emitEvent: false,
        });
        this.setDistricts(+this.formContractorControl['province'].value);
        this.formContractorControl['district'].setValue(_.district, {
          emitEvent: false,
        });

        this.formContractorControl['email'].setValue(_.email);
        this.formContractorControl['address'].setValue(_.address);
        this.formContractorControl['cellPhone'].setValue(_.phone);
        this._spinner.hide();
      },
      (error: HttpErrorResponse) => {
        console.error(error);
        this._spinner.hide();
      }
    );
  }

  dropFile(index: number) {
    const f = (this.formArrayFiles.controls[index] as FormGroup).controls;
    f['file'].setValue(null);
    f['fileName'].setValue(null);
    this.uploadedFiles[index] = null;
  }

  uploadFile(e, index): void {
    if (e.target.files.length) {
      this.messageErrorFileUploaded = '';
      const fileSize = (e.target.files[0] as File).size / 1048576;
      const file = e.target.files[0] as File;
      const f = (this.formArrayFiles.controls[index] as FormGroup).controls;

      if (fileSize > 25) {
        f['file'].setValue(null);
        this.messageErrorFileUploaded = 'El archivo no puede pesar más de 25MB';
        return;
      }

      f['fileName'].setValue(file.name);
      this.uploadedFiles[index] = file;
    }
  }

  getChannelSales(): void {
    this._utilsService.channelSales(+this.currentUser['id']).subscribe(
      (response: ChannelSalesModel) => {
        if (response.items.length) {
          this.channelSales$ = response.items;
        }
      },
      (error: HttpErrorResponse) => {
        console.error(error);
      }
    );
  }

  getDocumentId(desc: string): number {
    desc = desc.toLocaleLowerCase();
    if (desc == 'dni') {
      return 2;
    }
    if (desc == 'c.e') {
      return 4;
    }
    if (desc == 'ruc') {
      return 1;
    }
    return null;
  }

  getDocumentDesc(id: number): string {
    switch (+id) {
      case 1:
        return 'RUC';
      case 2:
        return 'DNI';
      case 4:
        return 'CE';
    }
  }

  getDepartmentId(desc: string): number {
    return this.departments$?.find((x) => x.descripcion == desc)?.id || null;
  }

  getDepartmentDesc(id: any): string {
    return this.departments$?.find((x) => +x.id == +id)?.descripcion || null;
  }

  getProvinceId(desc: string): number {
    return (
      this.provinces$?.find((x) => x.provincia == desc)?.idProvincia || null
    );
  }

  getProvinceDesc(id: any): string {
    return (
      this.provinces$?.find((x) => +x.idProvincia == +id)?.provincia || null
    );
  }

  getDistrictId(desc: string): number {
    return this.districts$?.find((x) => x.distrito == desc)?.idDistrito || null;
  }

  getDistrictDesc(id: any): string {
    return this.districts$?.find((x) => +x.idDistrito == +id)?.distrito || null;
  }

  generateTransact(): void {
    const _ = this.procedureNewValues;
    if (_.documentType !== 1) {
      _.legalName = null;
    }
    const payload = {
      ..._,
      startDate: moment(_.startDate).format('DD/MM/YYYY'),
      endDate: moment(_.endDate).format('DD/MM/YYYY'),
      branchId: 66,
      policy: this.policySelected,
      channelCode: this.isOperaciones
        ? this.channelDirect
        : this.currentUser['canal'],
      productId: 1,
      motiveId: null,
      stateId: 2,
      transactType: this.endorsementType,
      userId: +this.currentUser['id'],
      detail: this.compareChanges(),
      attachments: this.formArrayFiles.getRawValue().map((x) => ({
        documentTypeId: x.documentId,
        fileName: x.fileName,
      })),
      files: this.uploadedFiles.filter((x) => x) || [],
    };

    this._vc.clear();
    this._spinner.show();
    this._nuevoTramiteService.generateTransact(payload).subscribe(
      (response: any) => {
        if (response.data.success) {
          this.message = `Se generó correctamente el trámite N° ${response.data.idTramite}`;
          this.backToHome = true;
          this.responseSuccess = true;
        } else {
          this.message = response.data.mensajeError;
          this.responseSuccess = false;
        }
        this._spinner.hide();
        this._vc.createEmbeddedView(this._modalMessage);
      },
      (error: any) => {
        console.error(error);
        this.message = 'Ocurrió un error al generar el trámite';
        this._spinner.hide();
        this._vc.createEmbeddedView(this._modalMessage);
        this.responseSuccess = false;
      }
    );
  }

  compareChanges(): Array<any> {
    const newValues = this.procedureNewValues;
    const valuesCurrent = this.procedureCurrentValues;

    const arrayValues = [];
    Object.keys(newValues).forEach((e) => {
      if (
        e?.toLocaleLowerCase() == 'startvalidity' ||
        e?.toLocaleLowerCase() == 'endvalidity'
      ) {
        arrayValues.push({
          camp: this.formatControl(e),
          current: moment(valuesCurrent[e]).format('DD/MM/YYYY'),
          requested:
            newValues[e] !== valuesCurrent[e]
              ? moment(newValues[e]).format('DD/MM/YYYY').toLocaleUpperCase()
              : null,
        });
      } else {
        if (e == 'isGovernment') {
          const convert = newValues[e] ? 1 : null;
          arrayValues.push({
            camp: this.formatControl(e),
            current: valuesCurrent[e] ? 1 : null,
            requested:
              newValues[e] !== valuesCurrent[e]
                ? convert?.toString().toLocaleUpperCase()
                : null,
          });
        } else {
          arrayValues.push({
            camp: this.formatControl(e),
            current: valuesCurrent[e],
            requested:
              newValues[e] !== valuesCurrent[e]
                ? newValues[e]?.toString().toLocaleUpperCase()
                : null,
          });
        }
      }
    });
    const response = arrayValues
      .filter((x) => x.camp)
      .map((x) => ({
        ...x,
        requested: x.current != x.requested ? x.requested : null,
      }));
      
    return response;
  }

  get haveChanges(): boolean {
    const changes: Array<any> = this.compareChanges();
    const map = changes?.map((x) => !!x.requested).filter((x) => x);
    return map?.length > 0;
  }

  isValueChange(control: string): boolean {
    return (
      this.procedureCurrentValues[control]?.toString() !==
      this.procedureNewValues[control]?.toString()
    );
  }

  formatControl(val: string): string {
    enum validateCamp {
      'policy' = 'Poliza',
      'startvalidity' = 'InicioVigencia',
      'endvalidity' = 'FinVigencia',
      'premium' = 'Prima',
      'channelsale' = 'Canal',
      'licenseplate' = 'Placa',
      'brand' = 'Marca',
      'model' = 'Modelo',
      'version' = 'Version',
      'use' = 'Uso',
      'class' = 'Clase',
      'serialnumber' = 'Serie',
      'year' = 'Anio',
      'seating' = 'Asientos',
      'documenttype' = 'TipoDocumento',
      'documentnumber' = 'NumeroDocumento',
      'legalname' = 'RazonSocial',
      'names' = 'Nombres',
      'apepat' = 'ApellidoPaterno',
      'apemat' = 'ApellidoMaterno',
      'department' = 'Departamento',
      'province' = 'Provincia',
      'district' = 'Distrito',
      'address' = 'Direccion',
      'cellphone' = 'Celular',
      'email' = 'Correo',
      'birthdate' = 'FechaNacimiento',
      'sex' = 'Sexo',
    }

    return validateCamp[val.toLocaleLowerCase()] || null;
  }

  formatDateToISO(val: string): string {
    let date: any = val;
    date = val.split('/');
    date = `${date[1]}-${date[0]}-${date[2]}`;
    return new Date(date).toISOString();
  }

  get invalidForm(): boolean {
    const fp = (this.formControl['policy'] as FormGroup).invalid;
    const fa = (this.formControl['auto'] as FormGroup).invalid;
    const fc = (this.formControl['contractor'] as FormGroup).invalid;
    const ff = (this.formControl['files'] as FormArray).invalid;
    return (
      fp ||
      fa ||
      fc ||
      ff ||
      !this.haveChanges ||
      this.editPolicy ||
      this.editAuto ||
      +this.procedureNewValues?.premium == 0 ||
      +this.changePremium > +this.formPolicyControl['premium'].value
    );
  }

  get invalidFormContractor(): boolean {
    return (this.form.get('contractor') as FormGroup).invalid;
  }

  get invalidFormAuto(): boolean {
    return (this.form.get('auto') as FormGroup).invalid;
  }

  get isRucPerson(): boolean {
    const _ = this.formContractorControl['documentNumber'].value;
    return +_?.slice(0, 2) == 10;
  }

  back(): void {
    const type = +this._route.snapshot.queryParamMap.get('type');
    this._router.navigate(['/extranet/portal-tramites/poliza'], {
      queryParams: {
        type: type,
      },
    });
  }

  get client(): string {
    const dt =
      this.formContractorControl['documentType'].value
        ?.toString()
        ?.padStart(2, '0') || null;
    const dn =
      this.formContractorControl['documentNumber'].value
        ?.toString()
        ?.padStart(12, '0') || null;
    return dt + dn || null;
  }

  calculateAutoPremium(): void {
    const _: ICalculateAutoPremiumRequest = {
      BrokerId: this.isOperaciones
        ? this.channelDirect
        : this.currentUser['canal'],
      Canal: this.isOperaciones
        ? this.channelDirect
        : this.currentUser['canal'],
      CantidadAsientos: +this.formAutoControl['seating'].value,
      Carroceria: 0,
      CategoriaId: 1,
      ClaseId: +this.formAutoControl['class'].value,
      Cliente: this.client,
      Departamento: +this.formContractorControl['district'].value,
      Fecha: moment(new Date()).format('YYYY-MM-DD'),
      IdProcess: null,
      IntermediaId: 0,
      IsPd: true,
      MarcaId: +this.formAutoControl['brand'].value,
      ModeloId: +this.formAutoControl['model'].value,
      Moneda: 'PEN',
      Placa: this.formAutoControl['licensePlate'].value
        ?.toString()
        .toLocaleLowerCase(),
      Plan: 0,
      PuntoVenta: this.currentUser['indpuntoVenta'],
      SalesPointId: null,
      TarifaId: null,
      TipoPapel: 3,
      TipoPersona: 1,
      UsoId: +this.formAutoControl['use'].value,
    };
    this._spinner.show();
    this._nuevoTramiteService.calculateAutoPremium(_).subscribe(
      (response: ICalculateAutoPrmeiumResponse) => {
        this._spinner.hide();
        this.procedureNewValues.premium = response.precio;
        this.changePremium = +response.precio;
      },
      (error: HttpErrorResponse) => {
        console.error(error);
        this._spinner.hide();
      }
    );
  }

  setPremium(): void {
    this.formPolicyControl['premium'].setValue(
      +this.procedureNewValues.premium
    );
  }
}
