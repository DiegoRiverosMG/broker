import { Component, OnInit, ViewChild } from '@angular/core';
import {
  FormGroup,
  FormBuilder,
  Validators,
  FormControl,
} from '@angular/forms';
import { BsDatepickerConfig } from 'ngx-bootstrap/datepicker';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { NgxSpinnerService } from 'ngx-spinner';
import { AppConfig } from '@root/app.config';
import { Router } from '@angular/router';
import { CargaMasivaService } from '../../../backoffice/services/transaccion/carga-masiva/carga-masiva.service';
import { SearchCargaMasivaDto } from '../../../backoffice/services/transaccion/carga-masiva/DTOs/carga-masiva.dto';
import {
  IanularQRResponse,
  IanularQRResquest,
  IhistorialResponse,
  IlistadoQRRequest,
  IlistadoQRResponse,
  IdescargarReporteReponse,
  QRIndividualRequest,
  QRIndividualResponse,
  IdescargarQRResponse,
  IgenerarQRResponse,
} from '../../models/generacion-qr/generacion-qr.model';
import { GeneracionQrService } from '../../services/generacion-qr/generacion-qr.service';
@Component({
  selector: 'app-generacion-qr',
  templateUrl: './generacion-qr.component.html',
  styleUrls: ['./generacion-qr.component.css'],
})
export class GeneracionQrComponent implements OnInit {
  bsConfig: Partial<BsDatepickerConfig>;
  fecha: Date = new Date();
  bsValueIni: Date = new Date(this.fecha.setMonth(this.fecha.getMonth() - 6));
  bsValueFin: Date = new Date();
  nombreArchivoSubido: string;
  soloLetras: RegExp;
  /*limitNumberPhone: {min: number, max: number};*/
  guardarExcel: File;
  @ViewChild('modalqr') modalqr: ModalDirective;
  @ViewChild('modalqrgrupal') modalqrgrupal: ModalDirective;
  @ViewChild('modalqrindividual') modalqrindividual: ModalDirective;
  @ViewChild('modalConfirmacion') modalConfirmacion: ModalDirective;
  @ViewChild('modalHistorial') modalHistorial: ModalDirective;
  @ViewChild('modalConfirmarAnular') modalConfirmarAnular: ModalDirective;
  @ViewChild('modalConfirmacionAnular') modalConfirmacionAnular: ModalDirective;
  @ViewChild('modalError') modalError: ModalDirective;
  @ViewChild('modalConfirmarGenerar') modalConfirmarGenerar: ModalDirective;
  dataGeneracionQR: Array<any>;
  dataHistorialQR: Array<any>;
  dataErrorQR: Array<any>;
  formTipoQR: FormGroup;
  formQRIndi: FormGroup;
  formQRGru: FormGroup;
  formQRFiltros: FormGroup;
  ID_PROCCESS: number;
  constructor(
    private readonly spinner: NgxSpinnerService,
    private readonly _CargaMasivaService: CargaMasivaService,
    private readonly _GeneracionQrService: GeneracionQrService,
    private readonly _FormBuilder: FormBuilder,
    private readonly _Router: Router
  ) {
    this.soloLetras = /^[a-zA-ZÁÉÍÓÚáéíóú\s]$/;
    this.bsConfig = Object.assign(
      {},
      {
        dateInputFormat: 'DD/MM/YYYY',
        locale: 'es',
        containerClass: 'theme-dark-blue',
        showWeekNumbers: true,
      }
    );
    this.formTipoQR = _FormBuilder.group({
      type: ['1'],
    });
    this.formQRFiltros = _FormBuilder.group({
      idProceso: [null],
      fechaInicio: [this.bsValueIni],
      fechaFin: [this.bsValueFin],
      idEstado: [0],
    });
    this.formQRGru = _FormBuilder.group({
      archivo: [null],
    });
    this.formQRIndi = _FormBuilder.group({
      nombres: [
        null,
        Validators.compose([
          Validators.required,
          Validators.pattern(/^[a-zA-ZÁÉÍÓÚÑáéíóúñ\s]+$/),
        ]),
      ],
      apellido_paterno: [
        null,
        Validators.compose([
          Validators.required,
          Validators.pattern(/^[a-zA-ZÁÉÍÓÚÑáéíóúñ\s]+$/),
        ]),
      ],
      apellido_materno: [
        null,
        Validators.compose([Validators.pattern(/^[a-zA-ZÁÉÍÓÚÑáéíóúñ\s]+$/)]),
      ],
      telefono_fijo: [
        null,
        Validators.compose([
          Validators.required,
          Validators.pattern(/^[0-9]*$/),
          Validators.minLength(7),
          Validators.maxLength(7),
        ]),
      ],
      anexo: [
        null,
        Validators.compose([
          Validators.pattern(/^[0-9]*$/),
          Validators.minLength(5),
          Validators.maxLength(5),
        ]),
      ],
      telefono_celular: [
        null,
        Validators.compose([
          Validators.required,
          Validators.pattern(/^[0-9]*$/),
          Validators.minLength(9),
          Validators.maxLength(9),
        ]),
      ],
      email: [
        null,
        Validators.compose([
          Validators.required,
          Validators.pattern(AppConfig.CUSTOM_MAIL_DOMAIN),
        ]),
      ],
      cargo: [
        null,
        Validators.compose([
          Validators.required,
          Validators.pattern(/^[a-zA-ZÁÉÍÓÚÑ&-,."'/áéíóúñ\s]+$/),
        ]),
      ],
    });
    this.formTipoQR = _FormBuilder.group({
      type: [null],
    });
    this.nombreArchivoSubido = 'Seleccionar un archivo excel';

    /* Data de prueba
    this.dataHistorialQR = [
      {
        estado: 'Generado',
        fecha: '01/09/2021',
        usuario: 'Usuario 1',
      },
      {
        estado: 'Generado',
        fecha: '02/09/2021',
        usuario: 'Usuario 1',
      },
      {
        estado: 'Generado',
        fecha: '03/09/2021',
        usuario: 'Usuario 1',
      },
    ];*/
  }

  eliminarNumeros(control: FormControl) {
    if (control.hasError('pattern')) {
      control.setValue(
        control.value
          ?.toString()
          .substring(0, control.value?.toString().length - 1)
      );
    }
    /*if (!!control.value?.match(/\d+/)?.length) {
      control.setValue(control.value.replace(/\d+/, '').trim());
    }*/
  }
  eliminarNumeros2(val: string) {
    const control = this.fc[val];
    if (!!control.value?.match(/\d+/)?.length) {
      control.setValue(control.value.replace(/\d+/, '').trim());
    }
  }

  ngOnInit(): void {
    console.log(this.formQRIndi);
    this.listarQR();
    /*this.fc['numero_documento'].valueChanges.subscribe((val) => {
      if (this.fc['numero_documento'].hasError('pattern')) {
        this.fc['numero_documento'].setValue(val.substring(0, val.length - 1));
      }
    });*/
    /*this.formQRIndi.valueChanges.subscribe((val) => {
      console.log(this.fc);
    });*/
    this.fc['nombres'].valueChanges.subscribe((val) => {
      /*this.eliminarNumeros('nombres');*/
      console.log(val);
      if (this.fc['nombres'].hasError('pattern')) {
        this.fc['nombres'].setValue(
          val?.toString().substring(0, val?.toString().length - 1)
        );
      }
    });

    this.fc['apellido_paterno'].valueChanges.subscribe((val) => {
      if (this.fc['apellido_paterno'].hasError('pattern')) {
        this.fc['apellido_paterno'].setValue(
          val?.toString().substring(0, val?.toString().length - 1)
        );
      }
    });
    this.fc['apellido_materno'].valueChanges.subscribe((val) => {
      if (this.fc['apellido_materno'].hasError('pattern')) {
        this.fc['apellido_materno'].setValue(
          val?.toString().substring(0, val?.toString().length - 1)
        );
      }
    });
    this.fc['cargo'].valueChanges.subscribe(() => {
      this.eliminarNumeros2('cargo');
    });
    this.fc['telefono_fijo'].valueChanges.subscribe((val) => {
      if (val) {
        if (this.fc['telefono_fijo'].hasError('pattern')) {
          this.fc['telefono_fijo'].setValue(val.substring(0, val.length - 1));
        }
        const firstNumber = Number(val.substring(0, 1));
        if (firstNumber === 9) {
          this.fc['telefono_fijo'].setValue(val.substring(0, val.length - 1));
        }
      }
      this.validarTelefonoFijo();
    });
    this.fc['telefono_celular'].valueChanges.subscribe((val) => {
      if (val) {
        const newVal = val
          ?.toString()
          .substring(0, val?.toString()?.length - 1);
        if (this.fc['telefono_celular'].hasError('pattern')) {
          this.fc['telefono_celular'].setValue(newVal);
        }
        if (Number(val.toString().substring(0, 1)) !== 9) {
          this.fc['telefono_celular'].setValue(newVal);
        }
      }
      this.validarTelefonoFijo();
    });
    this.fc['anexo'].valueChanges.subscribe((val) => {
      if (val) {
        if (this.fc['anexo'].hasError('pattern')) {
          this.fc['anexo'].setValue(val.substring(0, val.length - 1));
        }
      }
      this.validarTelefonoFijo();
    });
    /*
    this.fc['tipo_documento'].valueChanges.suscribe((val) => {
      switch (Number(val)) {
        case 2:
          this.fc['numero_documento'].setValidators(
            Validators.compose([Validators.required, Validators.maxLength(7)])
          );
          this.fc['tipoDocumento'].setValue('DNI');
          break;
        case 4:
          this.fc['numero_documento'].setValidators(
            Validators.compose([Validators.required, Validators.maxLength(9)])
          );
          this.fc['tipoDocumento'].setValue('C.E.');
          break;
      }
    });*/
  }

  validarTelefonoFijo(): void {
    console.log('xF');
    if (this.fc['telefono_fijo'].value) {
      this.fc['telefono_celular'].setValidators(
        Validators.compose([
          Validators.pattern(/^[0-9]*$/),
          Validators.minLength(9),
          Validators.maxLength(9),
        ])
      );
      this.fc['anexo'].setValidators(
        Validators.compose([
          Validators.pattern(/^[0-9]*$/),
          Validators.minLength(5),
          Validators.maxLength(5),
        ])
      );
      this.fc['telefono_fijo'].setValidators(
        Validators.compose([
          Validators.required,
          Validators.pattern(/^[0-9]*$/),
          Validators.minLength(7),
          Validators.maxLength(7),
        ])
      );
    } else {
      this.fc['telefono_celular'].setValidators(
        Validators.compose([
          Validators.required,
          Validators.pattern(/^[0-9]*$/),
          Validators.minLength(9),
          Validators.maxLength(9),
        ])
      );
      if (this.fc['anexo'].value) {
        this.fc['anexo'].setValidators(
          Validators.compose([
            Validators.required,
            Validators.pattern(/^[0-9]*$/),
            Validators.minLength(5),
            Validators.maxLength(5),
          ])
        );
        this.fc['telefono_fijo'].setValidators(
          Validators.compose([
            Validators.required,
            Validators.pattern(/^[0-9]*$/),
            Validators.minLength(7),
            Validators.maxLength(7),
          ])
        );
      } else {
        this.fc['anexo'].setValidators(
          Validators.compose([
            Validators.pattern(/^[0-9]*$/),
            Validators.minLength(5),
            Validators.maxLength(5),
          ])
        );
        this.fc['telefono_fijo'].setValidators(
          Validators.compose([
            Validators.pattern(/^[0-9]*$/),
            Validators.minLength(7),
            Validators.maxLength(7),
          ])
        );
      }
    }
    this.fc['telefono_celular'].updateValueAndValidity({
      emitEvent: false,
    });
    this.fc['telefono_fijo'].updateValueAndValidity({
      emitEvent: false,
    });
    this.fc['anexo'].updateValueAndValidity({
      emitEvent: false,
    });
    this.validarTelefonoCelular();
    this.validarAnexo();
  }

  validarTelefonoCelular(): void {
    console.log('xC');
    if (this.fc['telefono_celular'].value) {
      this.fc['anexo'].setValidators(
        Validators.compose([
          Validators.pattern(/^[0-9]*$/),
          Validators.minLength(5),
          Validators.maxLength(5),
        ])
      );
      this.fc['telefono_fijo'].setValidators(
        Validators.compose([
          Validators.pattern(/^[0-9]*$/),
          Validators.minLength(7),
          Validators.maxLength(7),
        ])
      );
      this.fc['telefono_celular'].setValidators(
        Validators.compose([
          Validators.required,
          Validators.pattern(/^[0-9]*$/),
          Validators.minLength(9),
          Validators.maxLength(9),
        ])
      );
    } else {
      if (this.fc['anexo'].value) {
        this.fc['anexo'].setValidators(
          Validators.compose([
            Validators.required,
            Validators.pattern(/^[0-9]*$/),
            Validators.minLength(5),
            Validators.maxLength(5),
          ])
        );
        this.fc['telefono_fijo'].setValidators(
          Validators.compose([
            Validators.required,
            Validators.pattern(/^[0-9]*$/),
            Validators.minLength(7),
            Validators.maxLength(7),
          ])
        );
      } else {
        this.fc['anexo'].setValidators(
          Validators.compose([
            Validators.pattern(/^[0-9]*$/),
            Validators.minLength(5),
            Validators.maxLength(5),
          ])
        );
        this.fc['telefono_fijo'].setValidators(
          Validators.compose([
            Validators.pattern(/^[0-9]*$/),
            Validators.minLength(7),
            Validators.maxLength(7),
          ])
        );
      }
      if (this.fc['telefono_fijo'].value) {
        this.fc['telefono_celular'].setValidators(
          Validators.compose([
            Validators.pattern(/^[0-9]*$/),
            Validators.minLength(9),
            Validators.maxLength(9),
          ])
        );
      } else {
        this.fc['telefono_celular'].setValidators(
          Validators.compose([
            Validators.required,
            Validators.pattern(/^[0-9]*$/),
            Validators.minLength(9),
            Validators.maxLength(9),
          ])
        );
      }
    }
    this.fc['telefono_celular'].updateValueAndValidity({
      emitEvent: false,
    });
    this.fc['telefono_fijo'].updateValueAndValidity({
      emitEvent: false,
    });
    this.fc['anexo'].updateValueAndValidity({
      emitEvent: false,
    });
  }

  validarAnexo(): void {
    console.log('xA');
    if (this.fc['anexo'].value) {
      this.fc['anexo'].setValidators(
        Validators.compose([
          Validators.required,
          Validators.pattern(/^[0-9]*$/),
          Validators.minLength(5),
          Validators.maxLength(5),
        ])
      );
      this.fc['telefono_fijo'].setValidators(
        Validators.compose([
          Validators.required,
          Validators.pattern(/^[0-9]*$/),
          Validators.minLength(7),
          Validators.maxLength(7),
        ])
      );
      this.fc['telefono_celular'].setValidators(
        Validators.compose([
          Validators.pattern(/^[0-9]*$/),
          Validators.minLength(9),
          Validators.maxLength(9),
        ])
      );
    } else {
      this.fc['anexo'].setValidators(
        Validators.compose([
          Validators.pattern(/^[0-9]*$/),
          Validators.minLength(5),
          Validators.maxLength(5),
        ])
      );
      if (this.fc['telefono_fijo'].value) {
        this.fc['telefono_fijo'].setValidators(
          Validators.compose([
            Validators.required,
            Validators.pattern(/^[0-9]*$/),
            Validators.minLength(7),
            Validators.maxLength(7),
          ])
        );
      } else {
        this.fc['telefono_fijo'].setValidators(
          Validators.compose([
            Validators.pattern(/^[0-9]*$/),
            Validators.minLength(7),
            Validators.maxLength(7),
          ])
        );
      }
      if (this.fc['telefono_celular'].value) {
        this.fc['telefono_celular'].setValidators(
          Validators.compose([
            Validators.required,
            Validators.pattern(/^[0-9]*$/),
            Validators.minLength(9),
            Validators.maxLength(9),
          ])
        );
      } else {
        this.fc['telefono_celular'].setValidators(
          Validators.compose([
            Validators.pattern(/^[0-9]*$/),
            Validators.minLength(9),
            Validators.maxLength(9),
          ])
        );
      }
    }
    this.fc['telefono_celular'].updateValueAndValidity({
      emitEvent: false,
    });
    this.fc['telefono_fijo'].updateValueAndValidity({
      emitEvent: false,
    });
    this.fc['anexo'].updateValueAndValidity({
      emitEvent: false,
    });
  }

  get validarTelefonosG(): boolean {
    return !(
      !!this.fc['telefono_fijo'].value || !!this.fc['telefono_celular'].value
    );
  }

  limpiar() {
    this.formQRFiltros.get('idProceso').setValue(null);
    this.formQRFiltros.get('fechaInicio').setValue(this.bsValueIni);
    this.formQRFiltros.get('fechaFin').setValue(this.bsValueFin);
    this.formQRFiltros.get('idEstado').setValue(0);
  }
  get hasErrorEmail(): string {
    const control = this.fc['email'];
    if (control.touched) {
      if (control.hasError('required')) {
        return '*Este campo es obligatorio';
      }
      if (control.hasError('pattern')) {
        return '*El correo electrónico no es válido';
      }
    }
    return null;
  }

  get ff(): any {
    return this.formQRFiltros.controls;
  }

  listarQR() {
    this.spinner.show();
    const data: IlistadoQRRequest = {
      ...this.formQRFiltros.getRawValue(),
      idProceso: this.ff.idProceso.value ? this.ff.idProceso.value : 0,
    };
    this._GeneracionQrService.listarQR(data).subscribe(
      (response: IlistadoQRResponse) => {
        console.log(response);
        this.dataGeneracionQR = response.listado;
        this.spinner.hide();
      },
      (error: any) => {
        console.log(error);
        this.spinner.hide();
      }
    );
  }

  validarIndividual(): void { }

  /*qrIndividual() {
    this.spinner.show();
    const data: QRIndividualRequest = new QRIndividualRequest(
      this.formQRIndi.getRawValue()
    );
    this._GeneracionQrService.qrIndividual(data).subscribe(
      (response: QRIndividualResponse) => {
        console.log(response);
        this.mostrarConfirmacion();
        this.spinner.hide();
        this.listarQR();
        this.formQRIndi.reset();
      },
      (error: any) => {
        console.log(error);
        this.spinner.hide();
        this.formQRIndi.reset();
      }
    );
  }*/

  verModalConfirmarAnular(is_show: boolean, IdProceso?: number): void {
    if (is_show) {
      this.ID_PROCCESS = IdProceso;
      this.modalConfirmarAnular.show();
    } else {
      this.modalConfirmarAnular.hide();
      this.listarQR();
    }
  }

  get currentUser(): any {
    return JSON.parse(localStorage.getItem('currentUser'));
  }

  anularQR() {
    this.verModalConfirmarAnular(false);
    this.spinner.show();
    const request: IanularQRResquest = {
      /*...data, ----- trae todos los datos*/
      idProceso: this.ID_PROCCESS.toString(),
      idUsuario: this.currentUser.id,
      idEstado: '2',
    };
    console.log(request);
    this._GeneracionQrService
      .anularQR(request.idProceso, request.idUsuario)
      .subscribe(
        (response: IanularQRResponse) => {
          console.log(response);
          this.spinner.hide();
          this.modalConfirmarAnular.hide();
          this.modalConfirmacionAnular.show();
          this.listarQR();
        },
        (error: any) => {
          console.log(error);
          this.spinner.hide();
        }
      );
  }

  historialQR(idProceso: number): void {
    this.ID_PROCCESS = idProceso;
    this.hideAllMenusActions();
    this.spinner.show();
    this._GeneracionQrService.historialQR(idProceso).subscribe(
      (response: IhistorialResponse) => {
        console.log(response);
        this.dataHistorialQR = response.historial;
        this.spinner.hide();
        this.mostrarModalHistorial();
      },
      (error: any) => {
        console.log(error);
        this.spinner.hide();
      }
    );
  }

  descargarReporte(idProceso: number): void {
    this.spinner.show();
    this._GeneracionQrService.descargarReporte(idProceso).subscribe(
      (response: IdescargarReporteReponse) => {
        this.spinner.hide();
        const archivo = {
          file: response.archivo,
          id: idProceso,
          nombre: response.nombre,
        };
        if (response.success === true) {
          this.downloadArchivo(archivo);
        }
      },
      (err: any) => {
        this.spinner.hide();
        console.log(err);
      }
    );
  }

  ocultarModalConfirmarGenerar() {
    this.modalConfirmarGenerar.hide();
    this.modalqrgrupal.hide();
    this.modalqrindividual.hide();
    this.modalqr.hide();
    this.formQRIndi.reset();
    this.listarQR();
    this.formQRGru.reset();
  }

  verModalConfirmarGenerar() {
    this.modalConfirmarGenerar.show();
    this.modalqrgrupal.hide();
    this.modalqrindividual.hide();
    this.modalqr.hide();
  }
  generarQR(): void {
    this.spinner.show();
    const qrIndi: QRIndividualRequest = new QRIndividualRequest(
      this.formQRIndi.getRawValue()
    );
    const request: any = {
      tipo: this.formTipoQR.get('type').value,
      idUsuario: this.currentUser.id,
      individual: qrIndi,
      file: this.guardarExcel,
    };
    console.log(request);
    this._GeneracionQrService.generacionQR(request).subscribe(
      (response: IgenerarQRResponse) => {
        console.log(response);
        this.spinner.hide();
        this.listarQR();
        if (Number(this.formTipoQR.get('type').value) === 2) {
          if (response.success === true) {
            this.ocultarModalQRGrupal();
            this.mostrarConfirmacion();
            this.ocultarModalQr();
            this.ocultarModalConfirmarGenerar();
            this.formQRGru.reset();
            this.listarQR();
            /*this._Router.navigate(['/extranet/generacion-qr-add']); para redirigir a otra pagina*/
          } else {
            this.ocultarModalQRGrupal();
            this.ocultarModalQr();
            this.mostrarModalError();
            this.dataErrorQR = response.errores;
            this.formQRGru.reset();
            this.listarQR();
          }
        } else {
          this.formQRIndi.reset();
          this.ocultarModalQRIndividual();
          this.mostrarConfirmacion();
          this.ocultarModalQr();
          this.ocultarModalConfirmarGenerar();
          this.listarQR();
        }
        this.formQRGru.reset();
        this.ocultarModalConfirmarGenerar();
      },
      (err: any) => {
        this.spinner.hide();
        console.log(err);
        this.ocultarModalConfirmarGenerar();
      }
    );
  }

  descargarQR(idProceso: number): void {
    this.spinner.show();
    this._GeneracionQrService.descargarQR(idProceso).subscribe(
      (response: IdescargarQRResponse) => {
        this.spinner.hide();
        const archivo = {
          file: response.archivo,
          id: idProceso,
          nombre: response.nombreArchivo,
        };
        if (response.success === true) {
          this.downloadArchivo(archivo);
        }
      },
      (err: any) => {
        this.spinner.hide();
        console.log(err);
      }
    );
  }

  downloadArchivo(response) {
    if (response) {
      let linkSource = 'data:application/pdf;base64,';
      linkSource += response.file;
      const a = document.createElement('a');
      a.setAttribute('href', linkSource);
      a.setAttribute('download', response.nombre);
      a.setAttribute('target', '_blank');
      a.setAttribute('style', 'display:none;');
      document.body.appendChild(a);
      a.click();
      a.remove();
      this.spinner.hide();
    }
  }

  mostrarModalError() {
    this.modalError.show();
    this.formQRGru.reset();
  }

  ocultarModalError() {
    this.modalError.hide();
    this.formQRGru.reset();
  }

  mostrarModalQr() {
    this.formTipoQR.get('type').setValue('1');
    /*this.formTipoQR.get('Nombre del campo').setValue(null);*/
    this.modalqr.show();
  }

  ocultarModalQr() {
    this.modalqr.hide();
    this.formQRIndi.reset();
    this.formQRGru.reset();
  }

  mostrarModalQRGrupal() {
    this.nombreArchivoSubido = 'Seleccionar un archivo excel';
    this.guardarExcel = null;
    this.modalqrgrupal.show();
    this.formQRGru.reset();
  }

  ocultarModalQRGrupal() {
    this.modalqr.show();
    this.modalqrgrupal.hide();
    this.modalqrindividual.hide();
    this.formQRGru.reset();
  }

  mostrarModalQRIndividual() {
    this.modalqrindividual.show();
  }

  ocultarModalQRIndividual() {
    this.formQRIndi.reset();
    this.modalqrindividual.hide();
  }

  mostrarConfirmacion() {
    this.modalConfirmacion.show();
  }

  ocultarConfirmacion() {
    this.modalConfirmacion.hide();
    this.formQRIndi.reset();
    this.formQRGru.reset();
  }

  ocultarConfirmacionAnular() {
    this.modalConfirmacionAnular.hide();
  }

  mostrarModalHistorial() {
    this.modalHistorial.show();
  }

  ocultarModalHistorial() {
    this.modalHistorial.hide();
  }
  archivoSubido(e) {
    console.log(e);
    if (e) {
      if (
        e.target.files[0].name.indexOf('.xls') !== -1 ||
        e.target.files[0].name.indexOf('.xlsx') !== -1
      ) {
        this.nombreArchivoSubido = e.target.files[0].name;
        this.guardarExcel = e.target.files[0];
      } else {
        this.nombreArchivoSubido = 'Archivo inválido';
        this.guardarExcel = null;
      }
    }
  }

  descargarFormatoExcelQR(): void {
    let linkSource = 'data:application/pdf;base64,';
    linkSource += this.formatoExcel;
    const a = document.createElement('a');
    a.setAttribute('href', linkSource);
    a.setAttribute('download', 'Generacion_QR.xlsx');
    a.setAttribute('target', '_blank');
    a.setAttribute('style', 'display:none');
    document.body.appendChild(a);
    a.click();
    a.remove();
  }

  get formatoExcel(): string {
    // tslint:disable-next-line:max-line-length
    return `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`;
  }

  /* PARA VER LOS BOTONES EN LA TABLA */
  showActionsCargaMasiva(idProceso: any, index: any): void {
    /*const table = document.getElementById('table-scroll');
    const html = document.getElementById('actions' + idProceso);
    if (html.hidden === true) {
      this.hideAllMenusActions();
      html.hidden = false;
      html.style.top = '0';
      document.getElementById('row' + idProceso).style.background =
        'rgba(170, 158, 192, 0.25)';
      if (table.scrollHeight - table.clientHeight) {
        html.style.top = '-1px';
      } else {
        html.style.top = '0';
      }
    } else {
      html.hidden = true;
      html.style.top = '0';
      document.getElementById('row' + idProceso).style.background = '#fff';
    }*/
    const table = document.getElementById('table-scroll');
    const html = document.getElementById('actions' + idProceso);
    console.log(table);
    console.log(html);
    if (html.hidden === true) {
      this.hideAllMenusActions();
      html.hidden = false;
      document.getElementById('row' + idProceso).style.background =
        'rgba(170, 158, 192, 0.25)';
      if (index >= 5) {
        console.log('ex');
        html.style.top = '-120px';
      } else {
        html.style.top = '15px';
      }
    } else {
      html.hidden = true;
      /*html.style.top = '0';*/
      document.getElementById('row' + idProceso).style.background = '#fff';
    }
  }

  /* PARA QUE SOLO SE VEA UN BOTON*/
  hideAllMenusActions(): void {
    this.dataGeneracionQR.forEach((e) => {
      const el = document.getElementById('actions' + e.idProceso);
      el.hidden = true;
      el.style.top = '0';
      document.getElementById('row' + e.idProceso).style.background = '#fff';
    });
  }

  descargarDatosQR() {
    this._GeneracionQrService.exportarExcel(
      this.dataGeneracionQR,
      'Descarga_Generacion_QR'
    );
  }

  modalQRseleccionado() {
    if (Number(this.formTipoQR.get('type').value) === 1) {
      this.mostrarModalQRIndividual();
      this.ocultarModalQr();
    } else {
      this.mostrarModalQRGrupal();
      this.ocultarModalQr();
    }
  }

  get fc(): any {
    return this.formQRIndi.controls;
  }
}
