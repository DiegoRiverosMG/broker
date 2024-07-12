import { Component, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import {
  Validators,
  FormBuilder,
  FormGroup,
  AbstractControl,
} from '@angular/forms';
import { Router } from '@angular/router';
import { Certificado } from '../../models/certificado/certificado';
import { Poliza } from '../../models/poliza/poliza';
import { Step04Service } from '../../services/step04/step04.service';
import { UtilityService } from '../../../../shared/services/general/utility.service';
import { Prima, PrimaFilter } from '../../../client/shared/models/prima.model';
import { Auto } from '../../models/auto/auto.model';
import { Plan } from '../../models/plan/plan';
import { PlanFilter } from '../../models/plan/planfilter';
import { Cliente } from '../../models/cliente/cliente';
import { EmisionService } from '../../../client/shared/services/emision.service';
import { isDate } from 'util';
import { UtilsService } from '@shared/services/utils/utils.service';

// Validacion de Fecha Minima
function ValidateMinDate(control: AbstractControl) {
  if (control.value !== undefined) {
    const tipoCertificado2 = JSON.parse(
      sessionStorage.getItem('tipoCertificado')
    );
    const tCertificado = tipoCertificado2 && tipoCertificado2.tipoCertificado;

    if (tCertificado === 1) {
      return true;
    }
    const arrFecha = control.value.toString().split('-');
    const inputDay = +arrFecha[2];
    const inputMonth = +arrFecha[1];
    const inputYear = +arrFecha[0];
    const currDate = new Date();
    const currDay = currDate.getDate();
    const currMonth = currDate.getMonth() + 1;
    const currYear = currDate.getFullYear();

    if (inputYear < currYear) {
      // Si el año ingresado es menor
      return { minDate: true };
    } else if (inputMonth < currMonth && inputYear === currYear) {
      // Si el mes ingresado es menor al mes actual
      return { minDate: true };
    } else if (
      inputDay < currDay &&
      inputMonth === currMonth &&
      inputYear >= currYear
    ) {
      return { minDate: true };
    }
    return null;
  }
  return { minDate: true };
}

@Component({
  selector: 'app-step04',
  templateUrl: './step04.component.html',
  styleUrls: ['./step04.component.css'],
})
export class Step04Component implements OnInit, OnChanges {
  Certificado = new Certificado();
  codigoFlujo: any;
  lstPolizasFull: Poliza[] = [];
  lstPolizasFilter: Poliza[] = [];
  filter: any = {};
  claseDescripcion = '';

  mainTitle = '';
  titulos: string[];
  LittleTitle = '';
  tipoCertificado: any;
  tCertificado: number;
  NroCertificado: number;

  imagePaths: string[];
  imagePath = '';

  planes: Plan[] = [];
  tarifa = new Prima();
  auto = new Auto();

  cliente = new Cliente();

  opcionModalidad: number;
  totalSoats = 0;

  mensajeVigencia = '';

  truefalsePlan = true;
  vfr = true;

  codigoVigencia = '';

  certificadoForm: FormGroup;
  bMostrar = false;
  canal = '';
  puntoVenta = '';
  bEditPrecio = true;
  bFechaMinima = true;
  ultimaPaginaNavegada = 0;
  paginaActual = 4;

  constructor(
    private router: Router,
    private step04service: Step04Service,
    public utilityService: UtilityService,
    private emisionService: EmisionService,
    private fb: FormBuilder,
    private readonly utilsService: UtilsService
  ) {
    this.LittleTitle = 'Datos del certificado';
  }

  ngOnInit(): void {
    this.validarNavegacion();
    this.crearFormulario();

    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    this.canal = currentUser && currentUser['canal'];
    this.puntoVenta = currentUser && currentUser['puntoVenta'];

    this.tipoCertificado = JSON.parse(
      sessionStorage.getItem('tipoCertificado')
    );

    this.tCertificado =
      this.tipoCertificado && this.tipoCertificado.tipoCertificado;
    this.NroCertificado = Number(this.tCertificado) - 1;

    this.setTitle(this.NroCertificado);
    this.setImage(this.NroCertificado);

    this.auto = <Auto>JSON.parse(sessionStorage.getItem('auto'));

    this.obtenerDatosCliente();

    this.bMostrar = this.tCertificado !== 3;
    this.bEditPrecio = this.tCertificado !== 1;

    if (this.tCertificado === 1) {
      this.bFechaMinima = false;
    }

    // console.log("ss", sessionStorage);

    const certificadoSession = this.utilsService.decryptStorage('certificado');

    if (certificadoSession !== null) {
      this.Certificado = certificadoSession;
    }

    this.getPolizas(this.puntoVenta, this.canal, this.tCertificado.toString());
    this.setPlanes();
    this.getDataUserSession();

    if (this.Certificado.P_DSTARTDATE !== undefined) {
      // console.log('aqui: ', this.Certificado.P_DSTARTDATE);
      // this.Certificado.P_DSTARTDATE = new Date(this.Certificado.P_DSTARTDATE);
      // this.ValidaFecha(this.Certificado.P_DSTARTDATE.toString());
      this.ValidaFecha(this.Certificado.P_DSTARTDATE);
    }

    this.initFormulario();
  } // ngOnInit

  ngOnChanges(changes: SimpleChanges): void {
    // console.log('step04.ngOnChanges: ', changes);
  } // ngOnChanges

  onFechaVigenciaChange(fecha: any) {
    // console.log(fecha);
    this.Certificado.P_DSTARTDATE = fecha;
    this.certificadoForm.controls.fechavigencia.setValue(fecha);
    this.ValidaFecha(fecha);
  }

  private validarNavegacion() {
    const sessionUltimaPagina = sessionStorage.getItem('pagina');
    if (sessionUltimaPagina != null) {
      this.ultimaPaginaNavegada = +sessionUltimaPagina;

      if (this.paginaActual - this.ultimaPaginaNavegada > 1) {
        this.volverDatosContratante();
      }
    } else {
      this.volverValidarPlaca();
    }
  }

  private crearFormulario() {
    this.certificadoForm = this.fb.group({
      fechavigencia: ['', [Validators.required, ValidateMinDate]],
      poliza: ['', Validators.required],
      plan: ['', Validators.required],
      precio: ['', [Validators.required, Validators.min(1)]],
    });
  }

  private initFormulario() {
    if (this.Certificado.P_NIDPROCESS !== undefined) {
      this.certificadoForm.controls.fechavigencia.setValue(
        this.Certificado.P_DSTARTDATE
      );
      this.certificadoForm.controls.poliza.setValue(this.Certificado.P_NPOLICY);
      this.certificadoForm.controls.plan.setValue(this.Certificado.P_NPLAN);
    }
  }

  asignarDatosCertificado() {
    this.Certificado.P_NIDPROCESS = this.auto.V_NIDPROCESS;
    this.Certificado.P_DSTARTDATE =
      this.certificadoForm.get('fechavigencia').value;
    this.Certificado.P_NPOLICY = this.certificadoForm.get('poliza').value;
    this.Certificado.P_NPLAN = this.certificadoForm.get('plan').value;
  }

  ValidaFecha(fec: Date) {
    this.vfr = true; // this.ValidarFechaRetroactiva(fec); // valida retroactiva
    // console.log('valida retro');
    // console.log(this.vfr);

    if (this.vfr) {
      // this.validarFechaVigencia(this.convertDateToStringOracle(new Date(fec))); // valida vigencia activa
      this.validarFechaVigencia(this.convertDateToStringOracle(fec)); // valida vigencia activa
      // setTimeout(
      //   () => {
      //     this.truefalsePlan = (this.codigoVigencia === '1');
      //     console.log('this.ListaPoliza.length-->' + this.ListaPoliza.length);
      //     console.log('this.truefalsePlan-->' + this.truefalsePlan);
      //   }, 1000);
    } else {
      this.truefalsePlan = true;
      this.certificadoForm.controls.plan.setValue(undefined);
      this.certificadoForm.controls.precio.setValue('0');
    }
    // console.log('ValidaFecha this.truefalsePlan-->' + this.truefalsePlan);
  }

  soloNumeros(event: any) {
    const pattern = /[0-9\+\-\ ]/;
    const inputChar = String.fromCharCode(event.charCode);

    if (!pattern.test(inputChar)) {
      // invalid character, prevent input
      event.preventDefault();
    }
  }

  ValidarFechaRetroactiva(fec: string): boolean {
    // console.log('valida?');
    // console.log(this.bFechaMinima);
    if (!this.bFechaMinima) {
      return true;
    }

    if (isDate(new Date(fec))) {
      const tsTofec = new Date(fec);
      const hdia = tsTofec.getDate() + 1;
      const hmes = tsTofec.getMonth() + 1;
      const hanio = tsTofec.getUTCFullYear();
      const ts = new Date();
      // console.log(hdia);
      // console.log(hmes);
      // console.log(hanio);

      // console.log(ts.getDate());
      // console.log(ts.getUTCMonth() + 1);
      // console.log(tsTofec.getUTCFullYear());
      return (
        hdia >= ts.getDate() &&
        hmes >= ts.getUTCMonth() + 1 &&
        hanio >= tsTofec.getUTCFullYear()
      );
    } else {
      return false;
    }
  }

  convertDateToStringOracle(fec: Date): string {
    const tsTofec = new Date(fec);
    let hdia = tsTofec.getUTCDate().toString();
    let hmes = (tsTofec.getUTCMonth() + 1).toString();
    const hanio = tsTofec.getUTCFullYear().toString();
    if (hmes.length <= 1) {
      hmes = '0' + hmes;
    }
    if (hdia.length <= 1) {
      hdia = '0' + hdia;
    }
    return hdia + '-' + hmes + '-' + hanio;
  }

  validarFechaVigencia(fechaVigencia: string) {
    // Validar que a la fecha no existe una poliza ya ingresada
    const placaSession = sessionStorage
      .getItem('placa')
      .toString()
      .trim()
      .toUpperCase();
    this.step04service
      .validarFechaVigencia(placaSession, fechaVigencia)
      .subscribe(
        (res) => {
          this.mensajeVigencia = res['mensaje'];
          this.codigoVigencia = res['codigo'];
          // console.log('valida vigencia');
          // console.log(this.codigoVigencia);
          if (this.codigoVigencia.trim() === '1') {
            this.truefalsePlan = false;
            this.mensajeVigencia = '';
          } else {
            this.truefalsePlan = true;
          }
          // console.log('validarFechaVigencia this.truefalsePlan-->' + this.truefalsePlan);
        },
        (err) => {
          console.log(err);
        }
      );
  }

  obtenerDatosCliente() {
    const clienteSession = JSON.parse(sessionStorage.getItem('contratante'));
    if (clienteSession != null) {
      this.cliente = clienteSession;
    }
  }

  setTitle(id: number) {
    this.titulos = [
      'Crea un SOAT Manual para un tercero',
      'Crea un SOAT Láser para un tercero',
      'Crea un SOAT electrónico para un tercero',
    ];
    this.mainTitle = this.titulos[Number(id)];
  }

  setImage(id: number) {
    this.imagePaths = [
      'assets/icons/datos_certificado_manual.png',
      'assets/icons/datos_certificado_laser.png',
      'assets/icons/datos_certificado_digital.png',
    ];
    this.imagePath = this.imagePaths[id];
    this.opcionModalidad = id;
    // console.log(this.imagePath);
  }

  getPolizas(pv: string, canal: string, modalidad: string) {
    // console.log('pv-->' + pv);
    // console.log('canal-->' + canal);
    // console.log('modalidad-->' + modalidad);
    return this.step04service.getPolizas(pv, canal, modalidad).subscribe(
      (res) => {
        this.lstPolizasFull = this.lstPolizasFilter = res;
        this.totalSoats = this.lstPolizasFull.length;

        // TODO: no esta trayendo polizas
        if (this.lstPolizasFull.length > 0) {
          if (this.tCertificado === 3) {
            this.Certificado.P_NPOLICY = this.lstPolizasFull[0].npolesP_COMP;
          } else {
            this.Certificado.P_NPOLICY = this.lstPolizasFull[0].npolesP_COMP;
          }
        }
      },
      (error) => {
        console.log(<any>error);
      }
    );
  }

  getCertificado(id: string) {
    return this.step04service.getCertificado(id).subscribe(
      (res) => {
        this.Certificado = res;
      },
      (error) => {
        console.log(<any>error);
      }
    );
  }

  saveCertificado() {
    this.Certificado.P_NIDPROCESS = this.auto.V_NIDPROCESS;
    // console.log('saveCertificado');
    // console.log(this.Certificado);
    this.step04service.saveCertificado(this.Certificado).subscribe(
      (result) => {
        this.codigoFlujo = result.toString();
        this.utilsService.encryptStorage({
          name: 'certificado',
          data: this.Certificado,
        });
        this.almacenarNavegacion();
        setTimeout(() => {
          this.irAlResumen();
        }, 1500);
      },
      (error) => {
        console.log(<any>error);
      }
    );
  }

  getDataUserSession() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    // console.log(currentUser);
    this.Certificado.P_NCODCHANNEL_BO = currentUser && currentUser.canal;
    this.Certificado.P_SDESCHANNEL_BO = currentUser && currentUser.desCanal;
    this.Certificado.P_NCODNUMPOINT_BO = currentUser && currentUser.puntoVenta;
    this.Certificado.P_SDESNUMPOINT_BO =
      currentUser && currentUser.desPuntoVenta;
    this.Certificado.P_NTYPECHANNEL_BO = currentUser && currentUser.tipoCanal;
  }

  setPoliza(clase: Poliza) {
    this.Certificado.P_NPOLICY = clase.npolesP_COMP;
  }

  setTarifa() {
    this.obtenerTarifa();
  }

  obtenerTarifa() {
    const filter = new PrimaFilter();
    filter.CantidadAsientos = this.auto.p_SEATNUMBER;
    filter.Carroceria = this.auto.p_NIDCLASE;
    filter.CategoriaId = '1';
    filter.ClaseId = this.auto.p_NIDCLASE;
    filter.UsoId = this.auto.p_NIDUSO;
    filter.Departamento = this.auto.p_NAUTOZONE;
    filter.Fecha = this.Certificado.P_DSTARTDATE.toString();
    filter.MarcaId = this.auto.p_NVEHBRAND;
    filter.ModeloId = this.auto.p_NVEHMODEL;
    filter.Plan = this.Certificado.P_NPLAN;
    filter.TipoPersona = this.cliente.p_NPERSON_TYP;
    // console.log('tarifa');
    // console.log(filter);
    // this.Certificado.P_NCOMISSION = 0;
    // this.Certificado.P_NPREMIUM = this.tarifa.precio; // descomentar
    this.emisionService.obtenerTarifa(filter).subscribe(
      (res) => {
        if (res != null) {
          this.tarifa = res;
          // this.Certificado.P_NCOMISSION = this.tarifa.comision;
          this.Certificado.P_NPREMIUM = this.tarifa.precio; // descomentar
        } else {
          this.tarifa.precio = 0;
          // this.tarifa.comision = 0;
          this.Certificado.P_NCOMISSION = 0;
          this.Certificado.P_NPREMIUM = 0; // descomentar
        }
      },
      (err) => {
        this.tarifa.precio = 0;
        // this.tarifa.comision = 0;
        this.Certificado.P_NCOMISSION = 0;
        this.Certificado.P_NPREMIUM = 0; // descomentar
        console.log(err);
      }
    );
  }

  setPlan(id) {
    this.Certificado.P_NPLAN = id;
    this.obtenerTarifa();
  }

  setPlanes() {
    const filter = new PlanFilter();
    filter.poliza = this.canal;
    filter.tipomodulo = this.tCertificado.toString();
    // console.log(filter);
    this.emisionService.obtenerPlanes(filter).subscribe(
      (res) => {
        this.planes = res;
        // console.log(this.planes);
      },
      (err) => {
        console.log(err);
      }
    );
  }

  searchCertificado(search: string) {
    if (search) {
      this.lstPolizasFilter = this.lstPolizasFull.filter(
        (s) => s.npolesP_COMP.toString().indexOf(search.toLowerCase()) >= 0
      );
    } else {
      this.lstPolizasFilter = this.lstPolizasFull;
    }
  }

  Siguiente(): void {
    this.saveCertificado();
  }

  private almacenarNavegacion() {
    if (this.paginaActual > this.ultimaPaginaNavegada) {
      sessionStorage.setItem('pagina', this.paginaActual.toString());
    }
  }

  volverValidarPlaca() {
    this.router.navigate(['broker/step01']);
  }

  volverDatosContratante() {
    this.router.navigate(['broker/step03']);
  }

  irAlResumen() {
    this.router.navigate(['broker/step05']);
  }
}
