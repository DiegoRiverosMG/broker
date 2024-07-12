import { Campaign } from '@shared/models/campaign/campaign';
import { Municipality } from '@shared/models/municipality/municipality';
import { Step03Service } from './../../services/step03/step03.service';
import { ListaTipoDocumento } from './../../models/documento/listatipodocumento';
import { NgxSpinnerService } from 'ngx-spinner';
import { AppConfig } from '@root/app.config';
import {
  Component,
  OnInit,
  Input,
  Output,
  EventEmitter,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import {
  FormGroup,
  FormBuilder,
  Validators,
  AbstractControl,
} from '@angular/forms';
import { Cliente } from '../../models/cliente/cliente';
import 'rxjs/add/observable/of';
import 'rxjs/add/operator/map';
import { isNullOrUndefined } from 'util';
import { District } from '@shared/models/district/district';
import { UbigeoService } from '@shared/services/ubigeo/ubigeo.service';
import { Province } from '@shared/models/province/province';
import { EmisionService } from '../../../client/shared/services/emision.service';
import { SpaceValidator } from '../../directives/input-whitespace';
import { animate, style, transition, trigger } from '@angular/animations';
import { UtilsService } from '@shared/services/utils/utils.service';
import { RegularExpressions } from '@shared/regexp/regexp';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-contrantante',
  templateUrl: './contratante.component.html',
  styleUrls: ['./contratante.component.css'],
  animations: [
    trigger('entrada', [
      transition(':enter', [
        style({
          opacity: 0.5,
          transform: 'translateY(-15px)',
        }),
        animate(
          150,
          style({
            opacity: 1,
            transform: 'translateY(0)',
          })
        ),
      ]),
      transition(':leave', [
        animate(
          50,
          style({
            opacity: 0.5,
            transform: 'translateY(-15px)',
          })
        ),
      ]),
    ]),
  ],
})
export class ContratanteComponent implements OnInit, OnChanges {
  @Input() cliente = new Cliente();
  @Output() clienteResult = new EventEmitter();
  @Input() bloqueado = true;
  @Output() clienteEstado = new EventEmitter();

  @Input() actual: string;
  @Input() titulo: string;
  @Input() showempty = false;

  @Output() contratante: EventEmitter<any>;

  bLock03 = true;
  departamentos: Province[] = [];
  provincias: District[] = [];
  distritos: Municipality[] = [];
  validaCampaign = new Campaign();
  contratanteForm: FormGroup;
  esEmpresa = false;
  tipoDocumento = 0;
  clienteDeudaEstado = false;
  tamanoTipoDocumento: number;
  TIPO_DOCUMENTO_IDENTIDAD = { DNI: '2', RUC: '1', CE: '4', PTP: '15' };
  @Input() collTipoDocumento: ListaTipoDocumento[] = [];
  canal = '';
  private ndocument = [Validators.required, Validators.maxLength(12)];
  CLIENT_OF_ESTADO: boolean;
  CHECKED_CHECKBOX_GENERATE_COMPROBANTE: boolean;
  DISABLE_CHECKBOX_GENERATE_COMPROBANTE: boolean;
  // tslint:disable-next-line:no-inferrable-types
  clientfirstsearch: boolean = false;
  // tslint:disable-next-line:no-inferrable-types
  clientfound: boolean = true;

  constructor(
    private formBuilder: FormBuilder,
    private step03service: Step03Service,
    private ubigeoService: UbigeoService,
    private emisionService: EmisionService,
    private readonly _utilsService: UtilsService,
    private spinner: NgxSpinnerService
  ) {
    this.CLIENT_OF_ESTADO = false;
    this.CHECKED_CHECKBOX_GENERATE_COMPROBANTE = false;
    this.DISABLE_CHECKBOX_GENERATE_COMPROBANTE = false;
    this.contratante = new EventEmitter();
  }

  processClient(feeSearch: boolean) {
    this.asignarTipoPersona();
    if (
      Number(this.cliente.p_NDOCUMENT_TYP) === 1 &&
      Number(this.cliente.p_NDOCUMENT_TYP) === 1 &&
      Number(this.cliente.p_NPERSON_TYP) === 2
    ) {
      this.cliente.p_SCLIENT_NAME = null;
      this.cliente.p_SCLIENT_APPMAT = null;
      this.cliente.p_SCLIENT_APPPAT = null;
    } else {
      if (
        Number(this.cliente.p_NDOCUMENT_TYP) === 1 &&
        Number(this.cliente.p_NPERSON_TYP) === 1
      ) {
        if (
          !isNullOrUndefined(this.cliente.p_SCLIENT_APPPAT) &&
          !isNullOrUndefined(this.cliente.p_SCLIENT_NAME)
        ) {
          this.cliente.p_SLEGALNAME =
            this.cliente.p_SCLIENT_APPPAT +
            (this.cliente.p_SCLIENT_APPMAT !== null ||
            this.cliente.p_SCLIENT_APPMAT !== ''
              ? ' '.concat(this.cliente.p_SCLIENT_APPMAT + ', ')
              : ', ') +
            this.cliente.p_SCLIENT_NAME;
        }
      } else {
        this.cliente.p_SLEGALNAME = null;
      }
    }
    this.clienteResult.emit({ cliente: this.cliente, feeSearch: feeSearch });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['bloqueado']) {
      this.bLock03 = this.bloqueado;
    }

    this.validateDataInput('nombres');
    this.validateDataInput('apepaterno');
    this.validateDataInput('apematerno');
  }

  ngOnInit() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    this.canal = currentUser && currentUser['canal'];
    this.crearFormularioContratante();
    // this.getListTipoDocumento();
    this.contratanteForm.get('tipodocumento').setValue(2);
  }

  get f(): any {
    return this.contratanteForm.controls;
  }
  emailSuggestion(val: string) {
    this.f['correo'].setValue(val);
  }

  loadSession(collDepartamentos, dataSession) {
    this.departamentos = collDepartamentos;
    const objClienteSession = dataSession;
    if (!isNullOrUndefined(objClienteSession)) {
      this.cliente = dataSession;
      if (dataSession.p_NDOCUMENT_TYP !== undefined) {
        this.tipoDocumento = dataSession.p_NDOCUMENT_TYP;
        const numdocumento = dataSession.p_SDOCUMENT;
        if (
          Number(this.tipoDocumento) ===
          Number(this.TIPO_DOCUMENTO_IDENTIDAD.RUC)
        ) {
          this.esEmpresa =
            isNullOrUndefined(numdocumento) ||
            numdocumento === '' ||
            numdocumento.substring(0, 2) === '20'
              ? true
              : false;
        }
        this.subscribeRazonSocialChanges();
      }
      if (dataSession.p_NPROVINCE !== undefined) {
        this.contratanteForm.controls.departamento.setValue(
          dataSession.p_NPROVINCE.toString()
        );
        this.listarProvinciasPorDepartamento(
          dataSession.p_NPROVINCE,
          dataSession.p_NLOCAT,
          dataSession.p_NMUNICIPALITY
        );
      }
    }
  }

  crearFormularioContratante() {
    this.contratanteForm = this.formBuilder.group({
      tipodocumento: ['', Validators.required],
      numdocumento: ['', this.ndocument],
      apepaterno: [
        '',
        [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(20),
          SpaceValidator.cannotBeEmpty,
        ],
      ],
      apematerno: [
        '',
        [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(20),
          SpaceValidator.cannotBeEmpty,
        ],
      ],
      nombres: [
        '',
        [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(20),
          SpaceValidator.cannotBeEmpty,
        ],
      ],
      razonsocial: [
        '',
        [
          Validators.required,
          Validators.minLength(4),
          Validators.maxLength(50),
          SpaceValidator.cannotBeEmpty,
        ],
      ],
      departamento: ['', Validators.required],
      provincia: ['', Validators.required],
      distrito: ['', Validators.required],
      direccion: [
        '',
        [
          Validators.required,
          Validators.minLength(10),
          Validators.maxLength(100),
          SpaceValidator.cannotBeEmpty,
        ],
      ],
      correo: [
        '',
        [
          Validators.required,
          Validators.maxLength(100),
          Validators.pattern(AppConfig.CUSTOM_MAIL_DOMAIN),
        ],
      ],
      celular: [
        '',
        [
          Validators.pattern(RegularExpressions.numbers),
          Validators.required,
          Validators.minLength(9),
          Validators.maxLength(9),
        ],
      ],
    });
    const control: { [key: string]: AbstractControl } =
      this.contratanteForm.controls;
    control['celular'].valueChanges.subscribe((value: string) => {
      if (value) {
        if (control['celular'].hasError('pattern') || +value.slice(0, 1) != 9) {
          control['celular'].setValue(value.slice(0, value.length - 1));
        }
      }
      this.cliente.p_SPHONE = value;
    });
  }

  getListTipoDocumento() {
    /*this.collTipoDocumento = [];
    this.collTipoDocumento.push({ niddoC_TYPE: 4, sdescript: 'CE' });
    this.collTipoDocumento.push({ niddoC_TYPE: 2, sdescript: 'DNI' });
    this.collTipoDocumento.push({ niddoC_TYPE: 1, sdescript: 'RUC' });*/
    this.contratanteForm.get('tipodocumento').setValue(2);
  }

  callTypeDocument() {
    this.contratanteForm.controls['numdocumento'].reset();
    this.cleanFormulario();

    this.tipoDocumento =
      this.contratanteForm.get('tipodocumento').value === undefined
        ? ''
        : this.contratanteForm.get('tipodocumento').value;
    this.esEmpresa =
      Number(this.tipoDocumento) === Number(this.TIPO_DOCUMENTO_IDENTIDAD.RUC);
    this.onBlurNumeroDocument(
      !isNullOrUndefined(this.contratanteForm.get('numdocumento').value)
    );
  }

  subscribeRazonSocialChanges() {
    const pmCtrl = <any>this.contratanteForm;
    if (
      Number(this.tipoDocumento) === Number(this.TIPO_DOCUMENTO_IDENTIDAD.RUC)
    ) {
      this.tamanoTipoDocumento = 11;
    }
    if (
      Number(this.tipoDocumento) === Number(this.TIPO_DOCUMENTO_IDENTIDAD.DNI)
    ) {
      this.tamanoTipoDocumento = 8;
    }
    if (
      Number(this.tipoDocumento) === Number(this.TIPO_DOCUMENTO_IDENTIDAD.CE)
    ) {
      this.tamanoTipoDocumento = 12;
    }

    if (+this.tipoDocumento === +this.TIPO_DOCUMENTO_IDENTIDAD.PTP) {
      this.tamanoTipoDocumento = 9;
    }

    Object.keys(pmCtrl.controls).forEach((key) => {
      if (this.esEmpresa === true) {
        if (
          key.toString() === 'nombres' ||
          key.toString() === 'apepaterno' ||
          key.toString() === 'apematerno'
        ) {
          this.cliente.p_SCLIENT_NAME = null;
          this.cliente.p_SCLIENT_APPMAT = null;
          this.cliente.p_SCLIENT_APPPAT = null;
          pmCtrl.controls[key].setValidators(null);
          pmCtrl.controls[key].updateValueAndValidity();
        } else if (key.toString() === 'razonsocial') {
          pmCtrl.controls[key].setValidators([
            Validators.required,
            Validators.minLength(4),
            Validators.maxLength(50),
            SpaceValidator.cannotBeEmpty,
          ]);
          pmCtrl.controls[key].updateValueAndValidity();
        } else if (key.toString() === 'numdocumento') {
          pmCtrl.controls[key].setValidators([
            Validators.required,
            Validators.minLength(this.tamanoTipoDocumento),
            Validators.maxLength(this.tamanoTipoDocumento),
            Validators.pattern(/^(20)(\d{9})$/),
            SpaceValidator.cannotBeEmpty,
          ]);
          pmCtrl.controls[key].updateValueAndValidity();
        }
      } else {
        if (key.toString() === 'razonsocial') {
          pmCtrl.controls[key].setValidators(null);
          pmCtrl.controls[key].updateValueAndValidity();
        } else if (
          key.toString() === 'nombres' ||
          key.toString() === 'apepaterno' ||
          key.toString() === 'apematerno'
        ) {
          pmCtrl.controls[key].setValidators([
            Validators.required,
            Validators.minLength(3),
            Validators.maxLength(20),
            SpaceValidator.cannotBeEmpty,
          ]);
          pmCtrl.controls[key].updateValueAndValidity();
        } else if (key.toString() === 'numdocumento') {
          if (this.tamanoTipoDocumento === 11) {
            pmCtrl.controls[key].setValidators([
              Validators.required,
              Validators.minLength(this.tamanoTipoDocumento),
              Validators.maxLength(this.tamanoTipoDocumento),
              Validators.pattern(/^(10|15|17)(\d{9})$/),
              SpaceValidator.cannotBeEmpty,
            ]);
          } else {
            if (
              Number(this.tipoDocumento) ===
              Number(this.TIPO_DOCUMENTO_IDENTIDAD.CE)
            ) {
              pmCtrl.controls[key].setValidators([
                Validators.required,
                Validators.minLength(9),
                Validators.maxLength(this.tamanoTipoDocumento),
                SpaceValidator.cannotBeEmpty,
              ]);
              pmCtrl.controls[key].updateValueAndValidity();
            } else if (
              +this.tipoDocumento === +this.TIPO_DOCUMENTO_IDENTIDAD.PTP
            ) {
              pmCtrl.controls[key].setValidators([
                Validators.required,
                Validators.minLength(9),
                Validators.maxLength(9),
                Validators.pattern(RegularExpressions.numbers),
              ]);
            } else {
              pmCtrl.controls[key].setValidators([
                Validators.required,
                Validators.minLength(this.tamanoTipoDocumento),
                Validators.maxLength(this.tamanoTipoDocumento),
                SpaceValidator.cannotBeEmpty,
              ]);
            }
          }
          pmCtrl.controls[key].updateValueAndValidity();
        }
      }
    });
  }

  cleanFormulario() {
    this.contratanteForm.controls.apepaterno.setValue(undefined);
    this.contratanteForm.controls.apepaterno.enable();
    this.contratanteForm.controls.apematerno.setValue(undefined);
    this.contratanteForm.controls.apematerno.enable();
    this.contratanteForm.controls.nombres.setValue(undefined);
    this.contratanteForm.controls.nombres.enable();
    this.contratanteForm.controls.departamento.setValue(undefined);
    this.contratanteForm.controls.razonsocial.setValue(undefined);
    this.contratanteForm.controls.provincia.setValue(undefined);
    this.contratanteForm.controls.distrito.setValue(undefined);
    this.contratanteForm.controls.direccion.setValue(undefined);
    this.contratanteForm.controls.correo.setValue(undefined);
    this.contratanteForm.controls.celular.setValue(undefined);
  }

  limpiarSeccionContratante() {
    this.contratanteForm.reset();
    this.contratanteForm.controls.tipodocumento.setValue(undefined);
    this.cleanFormulario();
    this.getListTipoDocumento();
  }

  onBlurNumeroDocument(search) {
    const tipodocumento = this.contratanteForm.get('tipodocumento').value ?? '';
    const numdocumento = this.contratanteForm.get('numdocumento').value ?? '';

    if (+this.tipoDocumento === +this.TIPO_DOCUMENTO_IDENTIDAD.RUC) {
      this.esEmpresa =
        isNullOrUndefined(numdocumento) ||
        numdocumento === '' ||
        numdocumento.substring(0, 2) === '20';
    }

    this.subscribeRazonSocialChanges();

    if (this.f.numdocumento.invalid) {
      return;
    }

    this.cleanFormulario();

    if (search && numdocumento !== '' && tipodocumento) {
      this.clientfirstsearch = true;
      this.clientfound = true;
      this.spinner.show();
      this.step03service
        .clientePorDocumento(tipodocumento, numdocumento)
        .subscribe(
          (res) => {
            console.dir(res);
            this.contratante.emit(res);
            if (Number(res?.p_SISCLIENT_GBD) === 1) {
              this.CLIENT_OF_ESTADO = true;
              this.CHECKED_CHECKBOX_GENERATE_COMPROBANTE = true;
              this.DISABLE_CHECKBOX_GENERATE_COMPROBANTE = true;
            } else {
              this.CLIENT_OF_ESTADO = false;
              this.CHECKED_CHECKBOX_GENERATE_COMPROBANTE = false;
              this.DISABLE_CHECKBOX_GENERATE_COMPROBANTE = false;
            }
            const data = res;
            if (data.length > 0 && !isNullOrUndefined(data[0].p_SDOCUMENT)) {
              this.cliente = <Cliente>data[0];
              this.initFormularioPaso03();
            } else {
              this.clientfound = false;
              this.cleanFormulario();
            }

            this.validateDataInput('nombres');
            this.validateDataInput('apepaterno');
            this.validateDataInput('apematerno');

            this.processClient(true);
            this.validaCampaignDocumento();
            if (+this.f.tipodocumento.value === 1) {
              const req = {
                numerodocumento: this.f.numdocumento.value,
                branchId: 77,
              };
              this._utilsService
                .clienteInformation(req)
                .subscribe((response: any) => {
                  this.clienteDeudaEstado = response.clienteEstado;
                  this.clienteEstado.emit(this.clienteDeudaEstado);
                  this.spinner.hide();
                });
            } else {
              this.clienteEstado.emit(false);
              this.spinner.hide();
            }
          },
          (err) => {
            this.spinner.hide();
            console.log(err);
          }
        );
    }
  }

  initFormularioPaso03() {
    if (!isNullOrUndefined(this.cliente.p_NDOCUMENT_TYP)) {
      this.contratanteForm.controls.tipodocumento.setValue(
        this.cliente.p_NDOCUMENT_TYP
      );
    }
    if (!isNullOrUndefined(this.cliente.p_SDOCUMENT)) {
      this.contratanteForm.controls.numdocumento.setValue(
        this.cliente.p_SDOCUMENT.trim()
      );
    }
    if (!isNullOrUndefined(this.cliente.p_SCLIENT_APPPAT)) {
      this.contratanteForm.controls.apepaterno.setValue(
        this.cliente.p_SCLIENT_APPPAT
      );
    }
    if (!isNullOrUndefined(this.cliente.p_SCLIENT_APPMAT)) {
      this.contratanteForm.controls.apematerno.setValue(
        this.cliente.p_SCLIENT_APPMAT
      );
    }
    if (!isNullOrUndefined(this.cliente.p_SCLIENT_NAME)) {
      this.contratanteForm.controls.nombres.setValue(
        this.cliente.p_SCLIENT_NAME
      );
    }
    if (!isNullOrUndefined(this.cliente.p_NPROVINCE)) {
      if (Number(this.cliente.p_NPROVINCE) === 0) {
        this.contratanteForm.controls.departamento.setValue(undefined);
        this.contratanteForm.controls.provincia.setValue(undefined);
        this.contratanteForm.controls.distrito.setValue(undefined);
      } else {
        if (
          this.departamentos.find(
            (x) => +x.nprovince == +this.cliente.p_NPROVINCE
          )
        ) {
          this.contratanteForm.controls.departamento.setValue(
            this.cliente.p_NPROVINCE
          );
          this.listarProvinciasPorDepartamento(
            this.cliente.p_NPROVINCE,
            this.cliente.p_NLOCAT,
            this.cliente.p_NMUNICIPALITY
          );
        }
      }
    }
    if (!isNullOrUndefined(this.cliente.p_SLEGALNAME)) {
      this.contratanteForm.controls.razonsocial.setValue(
        this.cliente.p_SLEGALNAME
      );
    }
    if (!isNullOrUndefined(this.cliente.p_SADDRESS)) {
      this.cliente.p_SADDRESS =
        this.cliente.p_SADDRESS.trim().length >= 80
          ? this.cliente.p_SADDRESS.trim().substr(0, 80)
          : this.cliente.p_SADDRESS;
      this.contratanteForm.controls.direccion.setValue(this.cliente.p_SADDRESS);
    }
    if (!isNullOrUndefined(this.cliente.p_SMAIL)) {
      this.contratanteForm.controls.correo.setValue(this.cliente.p_SMAIL);
    }
    if (!isNullOrUndefined(this.cliente.p_SPHONE)) {
      this.contratanteForm.controls.celular.setValue(this.cliente.p_SPHONE);
    }
  }

  validateDataInput(data: string): void {
    const existData = this.contratanteForm?.controls[data]?.value?.length > 0;

    if (existData) {
      this.contratanteForm.controls[data]?.disable();
    }
  }

  listarProvinciasPorDepartamento(idDepartamento, idprovincia, iddistrito) {
    const filter = new District('0', idDepartamento, '');
    this.contratanteForm.controls.provincia.setValue(undefined);
    this.contratanteForm.controls.distrito.setValue(undefined);
    this.ubigeoService.getPostDistrict(filter).subscribe(
      (res) => {
        this.provincias = <District[]>res;
        if (!isNullOrUndefined(idprovincia)) {
          if (this.provincias.find((x) => +x.nlocal == +idprovincia)) {
            this.contratanteForm.controls.provincia.setValue(idprovincia);
            this.listarDistritosPorProvincia(idprovincia, iddistrito);
          }
        } else {
          this.contratanteForm.controls.provincia.setValue(undefined);
          this.contratanteForm.controls.distrito.setValue(undefined);
        }
        this.processClient(true);
      },
      (err) => {
        console.log(err);
      }
    );
  }

  listarDistritosPorProvincia(idProvincia, idDistrito) {
    const filter = new Municipality('0', idProvincia, '');
    this.contratanteForm.controls.distrito.setValue(undefined);
    this.ubigeoService.getPostMunicipality(filter).subscribe(
      (res) => {
        this.distritos = <Municipality[]>res;
        if (!isNullOrUndefined(idDistrito)) {
          if (this.distritos.find((x) => +x.nmunicipality == +idDistrito)) {
            this.contratanteForm.controls.distrito.setValue(idDistrito);
          }
        } else {
          this.contratanteForm.controls.distrito.setValue(undefined);
        }
        this.processClient(true);
      },
      (err) => {
        console.log(err);
      }
    );
  }

  validaCampaignDocumento() {
    console.log('validaCampaignDocumento');
    const tipodocumento =
      this.contratanteForm.get('tipodocumento').value === undefined
        ? ''
        : this.contratanteForm.get('tipodocumento').value;
    const numdocumento =
      this.contratanteForm.get('numdocumento').value === undefined
        ? ''
        : this.contratanteForm.get('numdocumento').value;

    if (tipodocumento !== '' && numdocumento !== '') {
      this.emisionService
        .validarDocumentoCampaign(this.canal, tipodocumento, numdocumento)
        .subscribe(
          (res) => {
            const result = res;
            if (result != null) {
              this.validaCampaign.validaDocumentoCampaign = result['nvalida'];
              if (Number(this.validaCampaign.validaDocumentoCampaign) === 1) {
                this.validaCampaign.planCampaign = result['nplan'];
                this.validaCampaign.planDescriptCampaign =
                  result['splandescript'];
                this.validaCampaign.canalClient = result['sclientchannel'];
              } else {
                this.validaCampaign.validaDocumentoCampaign = '0';
              }
            } else {
              this.validaCampaign.validaDocumentoCampaign = '0';
            }
            sessionStorage.setItem(
              'validaCampaign',
              JSON.stringify(this.validaCampaign)
            );
          },
          (err) => {
            console.log(err);
          }
        );
    }
  }

  asignarTipoPersona() {
    switch (Number(this.cliente.p_NDOCUMENT_TYP)) {
      case 4:
        this.cliente.p_NPERSON_TYP = '1';
        break;
      case 2:
        this.cliente.p_NPERSON_TYP = '1';
        break;
      case 1:
        this.cliente.p_NPERSON_TYP = isNullOrUndefined(this.cliente.p_SDOCUMENT)
          ? '1'
          : this.cliente.p_SDOCUMENT.substr(0, 2) === '10' ||
            this.cliente.p_SDOCUMENT.substr(0, 2) === '15' ||
            this.cliente.p_SDOCUMENT.substr(0, 2) === '17'
          ? '1'
          : '2';
        break;
      default:
        this.cliente.p_NPERSON_TYP = '1';
        break;
    }
  }

  ValidateFormContratante() {
    this.contratanteForm.get('tipodocumento').markAsTouched();
    this.contratanteForm.get('numdocumento').markAsTouched();
    this.contratanteForm.get('apepaterno').markAsTouched();
    this.contratanteForm.get('apematerno').markAsTouched();
    this.contratanteForm.get('nombres').markAsTouched();
    this.contratanteForm.get('razonsocial').markAsTouched();
    this.contratanteForm.get('departamento').markAsTouched();
    this.contratanteForm.get('provincia').markAsTouched();
    this.contratanteForm.get('distrito').markAsTouched();
    this.contratanteForm.get('direccion').markAsTouched();
    this.contratanteForm.get('correo').markAsTouched();
    this.contratanteForm.get('celular').markAsTouched();
    this.contratanteForm.updateValueAndValidity();
  }

  soloNumeros(event: any) {
    let pattern = /^[\d]*$/;
    if (Number(this.f.tipodocumento.value) === 4) {
      pattern = /^[0-9a-zA-Z]*$/;
    }
    const inputChar = String.fromCharCode(event.charCode);

    if (!pattern.test(inputChar)) {
      event.preventDefault();
    }
  }

  showError(): boolean {
    return (
      !this.contratanteForm.get('numdocumento').valid &&
      this.contratanteForm.get('numdocumento').touched
    );
  }

  documentNoExists(): boolean {
    return (
      !this.clientfound &&
      this.clientfirstsearch &&
      this.contratanteForm.get('numdocumento').value
    );
  }
}
