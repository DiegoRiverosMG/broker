import { Component, OnInit } from '@angular/core';
import 'rxjs/add/observable/of';
import 'rxjs/add/operator/map';
import { Router } from '@angular/router';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

import { Cliente } from '../../models/cliente/cliente';
import { ListaTipoCliente } from '../../models/cliente/listatipocliente';
import { Step03Service } from '../../services/step03/step03.service';
import { ListaTipoDocumento } from '../../models/documento/listatipodocumento';
import { Auto } from '../../models/auto/auto.model';
import { isNullOrUndefined } from 'util';
import { Province } from '../../../../shared/models/province/province';
import { District } from '../../../../shared/models/district/district';
import { Municipality } from '../../../../shared/models/municipality/municipality';
import { UbigeoService } from '../../../../shared/services/ubigeo/ubigeo.service';

@Component({
  selector: 'app-step03',
  moduleId: module.id,
  templateUrl: './step03.component.html',
  styleUrls: ['./step03.component.css']
})

export class Step03Component implements OnInit {

  ListaTipoCliente: ListaTipoCliente[] = [];
  ListaTipoDocumento: ListaTipoDocumento[] = [];
  Cliente = new Cliente();
  ClienteSession = new Cliente();
  resultDepReport = 0;
  resultProReport = 0;
  resultDisReport = 0;
  tipoPersona: string;
  tipoDocumento = 0;
  codigoFlujo: any;
  tipoCertificado: any;
  tCertificado = '';
  mainTitle = '';
  titulos: string[];
  LittleTitle = '';
  imagePaths: string[];
  imagePath = '';
  departamentos: Province[] = [];
  provincias: District[] = [];
  distritos: Municipality[] = [];
  auto: any;
  besEmpresa = false;
  tamanoTipoDocumento: number;

  public TIPO_DOCUMENTO_IDENTIDAD = {
    DNI: '2',
    RUC: '1'
  };

  contratanteForm: FormGroup;
  ultimaPaginaNavegada = 0;
  paginaActual = 3;

  constructor(private router: Router,
    private step03service: Step03Service,
    private ubigeoService: UbigeoService,
    private fb: FormBuilder) {
    this.LittleTitle = 'Datos del contratante';
  }

  ngOnInit() {
    this.validarNavegacion();
    this.crearFormulario();
    this.tipoCertificado = JSON.parse(sessionStorage.getItem('tipoCertificado'));
    this.tCertificado = (Number(this.tipoCertificado && this.tipoCertificado.tipoCertificado) - 1).toString();
    this.setTitle(this.tCertificado);

    this.auto = <Auto>JSON.parse(sessionStorage.getItem('auto'));

    this.ClienteSession = <Cliente>JSON.parse(sessionStorage.getItem('contratante'));

    if (!isNullOrUndefined(this.ClienteSession)) {
      // console.log(this.Cliente);
      // console.log(this.Cliente.p_NDOCUMENT_TYP);
      this.Cliente = this.ClienteSession;
      this.getListTipoDocumento(this.Cliente.p_NPERSON_TYP);
      if (this.Cliente.p_NPERSON_TYP !== undefined) {
        if (this.Cliente.p_NDOCUMENT_TYP.toString() === this.TIPO_DOCUMENTO_IDENTIDAD.RUC) { this.besEmpresa = true; }
      }
      this.subscribeRazonSocialChanges();
    }

    this.getListTipoPersona();
    this.listarDepartamentos();
    this.initFormulario();
  }

  private validarNavegacion() {
    const sessionUltimaPagina = sessionStorage.getItem('pagina');
    if (sessionUltimaPagina != null) {
      this.ultimaPaginaNavegada = +sessionUltimaPagina;

      if ((this.paginaActual - this.ultimaPaginaNavegada) > 1) {
        this.volverDatosVehiculo();
      }
    } else {
      this.volverValidarPlaca();
    }
  }

  setTitle(tc: string) {
    this.titulos = [
      'Crea un SOAT Manual para un tercero',
      'Crea un SOAT Láser para un tercero',
      'Crea un SOAT electrónico para un tercero'
    ];
    this.mainTitle = this.titulos[Number(tc)];
  }

  private crearFormulario() {
    this.contratanteForm = this.fb.group({
      tipopersona: ['', Validators.required],
      tipodocumento: ['', Validators.required],
      numdocumento: ['', [Validators.required, Validators.maxLength(12)]],
      apepaterno: ['', [Validators.required, Validators.maxLength(50)]],
      apematerno: ['', [Validators.required, Validators.maxLength(50)]],
      nombres: ['', [Validators.required, Validators.maxLength(50)]],
      razonsocial: ['', [Validators.required, Validators.maxLength(50)]],
      departamento: ['', Validators.required],
      provincia: ['', Validators.required],
      distrito: ['', Validators.required],
      direccion: ['', [Validators.required, Validators.maxLength(100), this.espaciosValidator]],
      correo: ['', [Validators.required, Validators.maxLength(100), Validators.email]],
      celular: ['', [Validators.required, Validators.maxLength(9)]],
    });
  }

  espaciosValidator(control: FormGroup) {
    const espacios = (control.value || '').trim().length === 0;
    const Valida = !espacios;
    return Valida ? null : { 'espacios': true };
  }
  private initFormulario() {
    // if (this.Cliente.P_NIDPROCESS !== undefined) {
    // this.contratanteForm.controls.tipopersona.setValue(this.Cliente.P_NPERSON_TYP);
    // this.contratanteForm.controls.tipodocumento.setValue(this.Cliente.P_NDOCUMENT_TYP);
    // this.contratanteForm.controls.numdocumento.setValue(this.Cliente.P_SDOCUMENT);
    // this.contratanteForm.controls.apepaterno.setValue(this.Cliente.P_SCLIENT_APPPAT);
    // this.contratanteForm.controls.apematerno.setValue(this.Cliente.P_SCLIENT_APPMAT);
    // this.contratanteForm.controls.nombres.setValue(this.Cliente.P_SCLIENT_NAME);
    // this.contratanteForm.controls.razonsocial.setValue(this.Cliente.P_SLEGALNAME);
    // this.contratanteForm.controls.departamento.setValue(this.Cliente.P_NPROVINCE);
    // this.contratanteForm.controls.provincia.setValue(this.Cliente.P_NLOCAT);
    // this.contratanteForm.controls.distrito.setValue(this.Cliente.P_NMUNICIPALITY);
    // this.contratanteForm.controls.direccion.setValue(this.Cliente.P_SADDRESS);
    // this.contratanteForm.controls.correo.setValue(this.Cliente.P_SMAIL);
    // this.contratanteForm.controls.celular.setValue(this.Cliente.P_SPHONE);

    // console.log(this.Cliente.p_SCLIENT_NAME);

    if (this.Cliente.p_NPERSON_TYP !== undefined) {
      this.contratanteForm.controls.tipopersona.setValue(this.Cliente.p_NPERSON_TYP);
    }
    if (this.Cliente.p_NDOCUMENT_TYP !== undefined) {
      this.contratanteForm.controls.tipodocumento.setValue(this.Cliente.p_NDOCUMENT_TYP);
      this.callTypeDocument(this.Cliente.p_NDOCUMENT_TYP);
    }
    if (this.Cliente.p_SDOCUMENT !== undefined) {
      this.contratanteForm.controls.numdocumento.setValue(this.Cliente.p_SDOCUMENT.trim());
    }
    if (this.Cliente.p_SCLIENT_APPPAT !== undefined) { this.contratanteForm.controls.apepaterno.setValue(this.Cliente.p_SCLIENT_APPPAT); }
    if (this.Cliente.p_SCLIENT_APPMAT !== undefined) { this.contratanteForm.controls.apematerno.setValue(this.Cliente.p_SCLIENT_APPMAT); }
    if (this.Cliente.p_SCLIENT_NAME !== undefined) { this.contratanteForm.controls.nombres.setValue(this.Cliente.p_SCLIENT_NAME); }
    if (this.Cliente.p_NPROVINCE !== undefined) {
      this.contratanteForm.controls.departamento.setValue(this.Cliente.p_NPROVINCE);
      this.listarProvinciasPorDepartamento(this.Cliente.p_NPROVINCE);
    }

    if (this.Cliente.p_SLEGALNAME !== undefined) { this.contratanteForm.controls.razonsocial.setValue(this.Cliente.p_SLEGALNAME); }
    if (this.Cliente.p_NLOCAT !== undefined) { this.contratanteForm.controls.provincia.setValue(this.Cliente.p_NLOCAT); }
    if (this.Cliente.p_NMUNICIPALITY !== undefined) { this.contratanteForm.controls.distrito.setValue(this.Cliente.p_NMUNICIPALITY); }
    if (this.Cliente.p_SADDRESS !== undefined) { this.contratanteForm.controls.direccion.setValue(this.Cliente.p_SADDRESS); }
    if (this.Cliente.p_SMAIL !== undefined) { this.contratanteForm.controls.correo.setValue(this.Cliente.p_SMAIL); }
    if (this.Cliente.p_SPHONE !== undefined) { this.contratanteForm.controls.celular.setValue(this.Cliente.p_SPHONE); }
    // }
  }

  private cleanFormulario() {
    this.contratanteForm.controls.apepaterno.setValue(undefined);
    this.contratanteForm.controls.apematerno.setValue(undefined);
    this.contratanteForm.controls.nombres.setValue(undefined);
    this.contratanteForm.controls.departamento.setValue(undefined);
    this.contratanteForm.controls.razonsocial.setValue(undefined);
    this.contratanteForm.controls.provincia.setValue(undefined);
    this.contratanteForm.controls.distrito.setValue(undefined);
    this.contratanteForm.controls.direccion.setValue(undefined);
    this.contratanteForm.controls.correo.setValue(undefined);
    this.contratanteForm.controls.celular.setValue(undefined);
  }

  listarDepartamentos() {
    const filter = new Province('0', '');
    this.ubigeoService.getPostProvince(filter)
      .subscribe(
        res => {
          // console.log(res);
          this.departamentos = <Province[]>res;

          if (this.Cliente.p_NPROVINCE !== undefined) {
            this.listarProvinciasPorDepartamento(this.Cliente.p_NPROVINCE);
          }
        },
        err => {
          console.log(err);
        }
      );
  }

  listarProvinciasPorDepartamento(idDepartamento) {
    const filter = new District('0', idDepartamento, '');

    this.ubigeoService.getPostDistrict(filter)
      .subscribe(
        res => {
          // console.log(res);
          this.provincias = <District[]>res;

          if (this.Cliente.p_NLOCAT !== undefined) {
            this.listarDistritosPorProvincia(this.Cliente.p_NLOCAT);
            if (this.Cliente.p_NPROVINCE !== idDepartamento) {
              this.contratanteForm.controls.provincia.setValue(undefined);
              this.contratanteForm.controls.distrito.setValue(undefined);
            }
          } else {
            this.contratanteForm.controls.provincia.setValue(undefined);
            this.contratanteForm.controls.distrito.setValue(undefined);
          }
        },
        err => {
          console.log(err);
        }
      );
  }

  listarDistritosPorProvincia(idProvincia) {
    const filter = new Municipality('0', idProvincia, '');

    this.ubigeoService.getPostMunicipality(filter)
      .subscribe(
        res => {
          // console.log(res);
          this.distritos = <Municipality[]>res;
          if (this.Cliente.p_NMUNICIPALITY !== undefined) {
            if (this.Cliente.p_NLOCAT !== idProvincia) {
              this.contratanteForm.controls.distrito.setValue(undefined);
            }
          } else {
            this.contratanteForm.controls.distrito.setValue(undefined);
          }
        },
        err => {
          console.log(err);
        }
      );
  }

  getListTipoPersona() {
    return this.step03service.getListTipoPersona()
      .subscribe(
        result => {
          // console.log(result);
          this.ListaTipoCliente = result;
        },
        error => {
          console.log(<any>error);
        }
      );
  }

  getListTipoDocumento(id: string) {
    return this.step03service.getListTipoDocumento(id, '0').subscribe(result => { this.ListaTipoDocumento = result; },
      error => {
        console.log(<any>error);
      });
  }

  getCliente(id: string) {
    return this.step03service.getCliente(id).subscribe(cli => { this.Cliente = cli; /*console.log(cli);*/ },
      error => {
        console.log(<any>error);
      });
  }

  saveCliente() {
    const auto = <Auto>JSON.parse(sessionStorage.getItem('auto'));
    // console.log(auto);
    this.asignarDatosCliente();
    this.Cliente.p_NIDPROCESS = this.auto.V_NIDPROCESS;
    this.step03service.saveCliente(this.Cliente)
      .subscribe(
        result => {
          this.Cliente.V_NIDPROCESS = result.toString();
          this.Cliente.p_NIDPROCESS = result.toString();

          sessionStorage.setItem('contratante', JSON.stringify(this.Cliente));
          this.almacenarNavegacion();
          setTimeout(
            () => {
              this.irPaso04();
            }, 1500);
        },
        error => {
          console.log(<any>error);
        }
      );
  }

  asignarDatosCliente() {
    this.Cliente.p_NIDPROCESS = this.auto.V_NIDPROCESS;
    this.Cliente.p_NPERSON_TYP = this.contratanteForm.get('tipopersona').value;
    this.Cliente.p_NDOCUMENT_TYP = this.contratanteForm.get('tipodocumento').value;
    this.Cliente.p_SDOCUMENT = this.contratanteForm.get('numdocumento').value;
    this.Cliente.p_SCLIENT_APPPAT = this.contratanteForm.get('apepaterno').value === undefined ? '' : this.contratanteForm.get('apepaterno').value;
    this.Cliente.p_SCLIENT_APPMAT = this.contratanteForm.get('apematerno').value === undefined ? '' : this.contratanteForm.get('apematerno').value;
    this.Cliente.p_SCLIENT_NAME = this.contratanteForm.get('nombres').value === undefined ? '' : this.contratanteForm.get('nombres').value;
    this.Cliente.p_SLEGALNAME = this.contratanteForm.get('razonsocial').value === undefined ? '' : this.contratanteForm.get('razonsocial').value;
    this.Cliente.p_NPROVINCE = this.contratanteForm.get('departamento').value;
    this.Cliente.p_NLOCAT = this.contratanteForm.get('provincia').value;
    this.Cliente.p_NMUNICIPALITY = this.contratanteForm.get('distrito').value;
    this.Cliente.p_SADDRESS = this.contratanteForm.get('direccion').value;
    this.Cliente.p_SMAIL = this.contratanteForm.get('correo').value;
    this.Cliente.p_SPHONE = this.contratanteForm.get('celular').value;
  }

  callTypePerson(value) {
    // console.log(value);
    if (value !== '') {
      this.tipoPersona = value;
      this.Cliente.p_NPERSON_TYP = value;
      this.getListTipoDocumento(this.tipoPersona);
      this.contratanteForm.controls.tipodocumento.setValue(undefined);
    }
  }

  callTypeDocument(value) {
    if (value !== '') {
      this.tipoDocumento = this.Cliente.p_NDOCUMENT_TYP = value;
      this.besEmpresa = this.tipoDocumento.toString() === this.TIPO_DOCUMENTO_IDENTIDAD.RUC;
      this.tamanoTipoDocumento = this.besEmpresa ? 11 : 8;
      this.subscribeRazonSocialChanges();
    }
  }

  Siguiente(): void {
    this.saveCliente();
  }

  subscribeRazonSocialChanges() {
    const pmCtrl = (<any>this.contratanteForm);
    Object.keys(pmCtrl.controls).forEach(key => {
      if (this.besEmpresa === true) {
        if (key.toString() === 'nombres' || key.toString() === 'apepaterno' || key.toString() === 'apematerno') {
          pmCtrl.controls[key].setValidators(null);
          pmCtrl.controls[key].updateValueAndValidity();
        } else if (key.toString() === 'razonsocial') {
          pmCtrl.controls[key].setValidators([Validators.required]);
          pmCtrl.controls[key].updateValueAndValidity();
        }
      } else {
        if (key.toString() === 'razonsocial') {
          pmCtrl.controls[key].setValidators(null);
          pmCtrl.controls[key].updateValueAndValidity();
        } else if (key.toString() === 'nombres' || key.toString() === 'apepaterno' || key.toString() === 'apematerno') {
          pmCtrl.controls[key].setValidators([Validators.required]);
          pmCtrl.controls[key].updateValueAndValidity();
        }
      }
    });
  }

  onBlurNumeroDocument() {
    // this.bLoading = true;
    const tipodocumento = this.contratanteForm.get('tipodocumento').value;
    const numdocumento = this.contratanteForm.get('numdocumento').value;

    this.step03service.clientePorDocumento(tipodocumento, numdocumento)
      .subscribe(
        res => {
          // this.bLoading = false;
          // console.log(res);
          const data = res;

          if (data.length > 0) {
            const persona = <Cliente>data[0];
            // console.log(persona);
            // Asignar los datos obtenidos
            this.Cliente = persona;
            this.Cliente.p_SMAIL = undefined;
            this.Cliente.p_SPHONE = undefined;
            this.Cliente.p_SADDRESS = undefined;
            // console.log(this.Cliente.p_SCLIENT_NAME);
            this.initFormulario();
          } else {
            this.cleanFormulario();
          }
        },
        err => {
          console.log(err);
          // this.bLoading = false;
        }
      );
  }

  soloNumeros(event: any) {
    const pattern = /[0-9\+\-\ ]/;
    const inputChar = String.fromCharCode(event.charCode);

    if (!pattern.test(inputChar)) { // invalid character, prevent input
      event.preventDefault();
    }
  }

  private almacenarNavegacion() {
    if (this.paginaActual > this.ultimaPaginaNavegada) {
      sessionStorage.setItem('pagina', this.paginaActual.toString());
    }
  }

  private volverValidarPlaca() {
    this.router.navigate(['broker/step01']);
  }

  private volverDatosVehiculo() {
    this.router.navigate(['broker/step02']);
  }

  irPaso04() {
    this.router.navigate(['broker/step04']);
  }

}
