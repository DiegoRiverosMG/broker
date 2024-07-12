import { VehiculoService } from '../../services/vehiculo/vehiculo.service';
import { Marca } from '../../../client/shared/models/marca.model';
import { Clase } from '../../../client/shared/models/clase.model';
import { Auto } from '../../models/auto/auto.model';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Component, OnInit } from '@angular/core';
import { UsoService } from '../../../../shared/services/uso/uso.service';
import { Uso } from '../../../../shared/models/use/use';

import { Routes, RouterModule, Router } from '@angular/router';
import { Modelo } from '../../../client/shared/models/modelo.model';
import { ZonaCirculacion } from '../../../client/shared/models/zona-circulacion.model';

@Component({
  selector: 'app-step02',
  templateUrl: './step02.component.html',
  styleUrls: ['./step02.component.css']
})
export class Step02Component implements OnInit {
  auto: Auto = new Auto();
  usos: Uso[];
  clasesFull: Clase[] = [];
  clases: Clase[] = [];
  marcasFull: Marca[] = [];
  marcas: Marca[] = [];
  zonas: ZonaCirculacion[] = [];
  modelos: Modelo[] = [];
  claseDescripcion = '';
  marcaDescripcion = '';
  modeloDescripcion = '';
  usoDescripcion = '';
  zonaDescripcion = '';
  fechaInicioVigencia = '';
  mensajeError = '';
  byear = false;
  bserie = false;
  tipoCertificado: any;
  tCertificado = '';
  mainTitle = '';
  titulos: string[];
  LittleTitle = '';
  claseSeleccionada = false;
  marcaSeleccionada = false;
  marcaDescrp: Marca[];
  vehiculoForm: FormGroup;
  ultimaPaginaNavegada = 0;
  paginaActual = 2;

  constructor(private usoService: UsoService,
    private vehiculoService: VehiculoService,
    private router: Router,
    private formBuilder: FormBuilder) { }

  ngOnInit() {
    this.validarNavegacion();
    this.crearFormulario();
    this.tipoCertificado = JSON.parse(sessionStorage.getItem('tipoCertificado'));
    this.tCertificado = (Number(this.tipoCertificado && this.tipoCertificado.tipoCertificado) - 1).toString();
    this.setTitle(this.tCertificado);
    this.getClases();
    this.getTiposUso();
    this.getMarcas();

    const autoSession = <Auto>JSON.parse(sessionStorage.getItem('auto'));
    if (autoSession !== null) {
      this.auto = autoSession;
    }
    this.initFormulario();
  }

  private validarNavegacion() {
    const sessionUltimaPagina = sessionStorage.getItem('pagina');
    if (sessionUltimaPagina != null) {
      this.ultimaPaginaNavegada = +sessionUltimaPagina;
    } else {
      this.volverValidarPlaca();
    }
  }

  crearFormulario() {
    this.vehiculoForm = this.formBuilder.group({
      clasecodigo: ['', Validators.required],
      // clasedescripcion: ['', Validators.required],
      uso: ['', Validators.required],
      marcacodigo: ['', Validators.required],
      // marcadescripcion: ['', Validators.required],
      modelo: ['', Validators.required],
      serie: ['', [Validators.required, Validators.maxLength(17)]],
      asientos: ['', [Validators.required, Validators.maxLength(2)]],
      anho: ['', [Validators.required, Validators.maxLength(4)]],
      zona: ['', Validators.required]

    });
  }

  initFormulario() {
    // console.log(this.auto.P_NIDPROCESS);
    // console.log('entro initFormulario');
    // console.log(this.auto);
    if (this.auto.p_NIDCLASE !== undefined) {
      this.vehiculoForm.controls.clasecodigo.setValue(this.auto.p_NIDCLASE.toString());
      //this.auto.P_NIDCLASE = this.auto.p_NIDCLASE;
    }
    if (this.auto.p_NIDUSO !== undefined) {
      this.vehiculoForm.controls.uso.setValue(this.auto.p_NIDUSO.toString());
      //this.auto.P_NIDUSO = this.auto.p_NIDUSO;
    }
    if (this.auto.p_NVEHBRAND !== undefined) {
      this.vehiculoForm.controls.marcacodigo.setValue(this.auto.p_NVEHBRAND.toString());
      //this.auto.P_NVEHBRAND = this.auto.p_NVEHBRAND;
    }
    if (this.auto.p_NVEHMODEL !== undefined) {
      this.vehiculoForm.controls.modelo.setValue(this.auto.p_NVEHMODEL.toString());
      //this.auto.P_NVEHMODEL = this.auto.p_NVEHMODEL;
    }
    if (this.auto.p_SNUMSERIE !== undefined) {
      this.vehiculoForm.controls.serie.setValue(this.auto.p_SNUMSERIE.trim());
      //this.auto.P_SNUMSERIE = this.auto.p_SNUMSERIE.trim();
    }
    if (this.auto.p_SEATNUMBER !== undefined) {
      this.vehiculoForm.controls.asientos.setValue(this.auto.p_SEATNUMBER.toString());
      //this.auto.P_SEATNUMBER = this.auto.p_SEATNUMBER;
    }
    if (this.auto.p_NYEAR !== undefined) {
      this.vehiculoForm.controls.anho.setValue(this.auto.p_NYEAR.toString());
      //this.getZonaCirculacion(this.auto.p_NYEAR); this.auto.P_NYEAR = this.auto.p_NYEAR;
    }
    if (this.auto.p_NAUTOZONE !== undefined) {
      this.vehiculoForm.controls.zona.setValue(this.auto.p_NAUTOZONE.toString());
      //this.auto.P_NAUTOZONE = this.auto.p_NAUTOZONE;
    }
    // console.log('fin initFormulario');
  }

  setTitle(tc: string) {
    this.titulos = ['Crea un SOAT Manual para un tercero', 'Crea un SOAT Láser para un tercero', 'Crea un SOAT electrónico para un tercero'];
    this.mainTitle = this.titulos[Number(tc)];
  }

  getClases() {
    const filter = new Clase();

    this.vehiculoService.getClases(filter)
      .subscribe(
        res => {
          this.clasesFull = this.clases = <Clase[]>res;
          if (this.auto.p_NIDCLASE !== undefined) {
            const claseDescrp = this.clases.filter(c => c.nidclase.toString() === this.auto.p_NIDCLASE.toString());
            this.auto.p_SNAMECLASE = claseDescrp.length == 0 ? '' : claseDescrp[0].sdescript;
          }
        },
        err => {
          console.log(err);
        }
      );
  }

  getTiposUso() {
    const filter = new Uso('0', '');

    this.usoService.getPostUsos(filter)
      .subscribe(
        res => {
          // console.log(res);
          this.usos = <Uso[]>res;
        },
        err => {
          console.log(err);
        }
      );
  }

  getMarcas() {
    const filter = new Marca();

    this.vehiculoService.getMarcas(filter)
      .subscribe(
        res => {
          this.marcasFull = this.marcas = <Marca[]>res;
          if (this.auto.p_NVEHBRAND !== undefined) {
            this.marcaDescrp = this.marcas.filter(c => c.nvehbrand.toString() === this.auto.p_NVEHBRAND.toString());
            this.getModelosPorMarca(this.auto.p_NVEHBRAND);
          }
        },
        err => {
          console.log(err);
        }
      );
  }

  getModelosPorMarca(id) {
    const filter = new Modelo();
    filter.nvehbrand = id;
    this.vehiculoService.getModelos(filter)
      .subscribe(
        res => {
          /*console.log(res);*/
          this.modelos = res;
          if (this.auto.p_NVEHMODEL !== undefined) {
            if (this.auto.p_NVEHBRAND !== id) {
              this.vehiculoForm.controls.modelo.setValue(undefined);
            }
          } else {
            this.vehiculoForm.controls.modelo.setValue(undefined);
          }
        },
        err => {
          console.log(err);
        }
      );
  }

  getZonaCirculacion(id: string) {
    const filter = new ZonaCirculacion();
    filter.sregist = sessionStorage.getItem('placa');
    filter.stype_vehicle = sessionStorage.getItem('TipoVehiculo'); /*true: automotor | false: liviano */
    filter.nyear = id;

    this.vehiculoService.getZonasCirculacion(filter)
      .subscribe(
        res => {
          /*console.log(res);*/
          this.zonas = <ZonaCirculacion[]>res;
          //console.log('entro');
          //console.log(this.auto.p_NAUTOZONE);
          if (this.auto.p_NAUTOZONE !== undefined) {
            this.vehiculoForm.controls.zona.setValue(this.auto.p_NAUTOZONE.toString());
          }
        },
        err => {
          console.log(err);
        }
      );
  }

  onBlurAnho() {
    const d = new Date();
    if (this.vehiculoForm.get('anho').value !== undefined) {
      this.getZonaCirculacion(this.vehiculoForm.get('anho').value);
      if (this.vehiculoForm.get('anho').value > d.getFullYear()) {
        this.byear = true;
      } else {
        this.byear = false;
      }
      this.auto.p_NYEAR = this.vehiculoForm.get('anho').value;
    }
  }

  onBlurSerie() {
    if (this.vehiculoForm.get('serie').value !== undefined) {
      //console.log(this.vehiculoForm.get('serie').toString().length);
      if (this.vehiculoForm.get('serie').value.toString().length !== 17) {
        this.bserie = true;
      } else {
        this.bserie = false;
      }
      this.auto.p_SNUMSERIE = this.vehiculoForm.get('serie').value;
    }
  }

  onBlurAsiento() {
    this.auto.p_SEATNUMBER = this.vehiculoForm.get('asientos').value;
  }

  setClase(id) {
    if (id !== '') {
      this.auto.p_NIDCLASE = id;
      this.vehiculoForm.controls.clasecodigo.setValue(id);
      const claseDescrp = this.clases.filter(c => c.nidclase.toString() === id.toString());
      this.auto.p_SNAMECLASE = claseDescrp[0].sdescript;
      this.claseSeleccionada = true;
    }
  }

  setMarca(id) {
    if (id !== '') {
      this.auto.p_NVEHBRAND = id;
      this.auto.p_NVEHMODEL = undefined;
      this.vehiculoForm.controls.marcacodigo.setValue(id);
      this.marcaDescrp = this.marcas.filter(c => c.nvehbrand.toString() === id.toString());
      this.auto.p_SNAME_VEHBRAND = this.marcaDescrp[0].sdescript;
      this.marcaSeleccionada = true;
      this.getModelosPorMarca(id);
    }
  }


  setZona(idZona) {
    this.auto.p_NAUTOZONE = idZona;
    this.vehiculoForm.controls.zona.setValue(idZona);
  }

  setModelo(id) {
    if (id !== '') {
      this.auto.p_NVEHMODEL = id;
      this.vehiculoForm.controls.modelo.setValue(id);
      const modeloDescrp = this.modelos.filter(c => c.nvehmodel.toString() === id.toString());
      this.auto.p_SNAME_VEHMODEL = modeloDescrp[0].sdescript;
    }
  }

  setUso(id) {
    if (id !== '') {
      this.auto.p_NIDUSO = id;
      this.vehiculoForm.controls.uso.setValue(id);
      if (this.auto.p_NIDUSO !== undefined) {
        const usoDescrp = this.usos.filter(c => c.niduso.toString() === id.toString());
        this.auto.p_SNAME_USO = usoDescrp[0].sdescript;
      }
    }
  }

  soloNumeros(event: any) {
    const pattern = /[0-9\+\-\ ]/;
    const inputChar = String.fromCharCode(event.charCode);

    if (!pattern.test(inputChar)) { // invalid character, prevent input
      event.preventDefault();
    }
  }

  onSave() {
    this.auto.p_SREGIST = sessionStorage.getItem('placa');
    this.auto.p_NIDFLOW = '2'; // Para clientes siempre enviar '1' PARA CANAL DE VENTAS '2'
    this.auto.p_NREMINDER = '0'; // 1: ACTIVADO (Para Cliente siempre es 1) | 0 : DESACTIVADO (Para canal de Venta 0)
    //console.log('AUTOid-->' + this.auto.p_NIDPROCESS);

    for (var i = 0; i < this.zonas.length; i++) {
      const z = this.zonas[i] as ZonaCirculacion;

      if (z.nprovince === this.auto.p_NAUTOZONE) {
        this.auto.p_SNAME_AUTOZONE = z.sdescript;
        break;
      }
    }

    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    this.auto.p_NUSERCODE = currentUser["id"];
    //console.log(this.auto);
    this.vehiculoService.registrar(this.auto)
      .subscribe(
        res => {
          //console.log(res);

          this.auto.V_NIDPROCESS = this.auto.p_NIDPROCESS = res.toString();
          if (this.auto.V_NIDPROCESS !== '0') {

            sessionStorage.setItem('auto', JSON.stringify(this.auto));
            this.almacenarNavegacion();
            setTimeout(
              () => {
                this.irPaso03();
              }, 1500);
          } else {
            this.mensajeError =
              'Ocurrio un error al intentar registrar los datos del vehiculo. Por favor, vuelva a intentarlo.';
          }
        },
        err => {
          console.log(err);
          this.mensajeError =
            'Ocurrio un error al intentar registrar los datos del vehiculo. Por favor, vuelva a intentarlo.';
        }
      );

  }

  asignarDatosVehiculo() {
    this.auto.p_SREGIST = sessionStorage.getItem('placa');
    this.auto.p_NIDFLOW = '1'; // Para clientes siempre enviar '1'
    this.auto.p_NREMINDER = '1'; // Para clientes siempre enviar '1'
    this.auto.p_NIDCLASE = this.vehiculoForm.get('clasecodigo').value;
    // this.auto.p_SNAMECLASE = this.vehiculoForm.get('clasedescripcion').value;
    this.auto.p_NIDUSO = this.vehiculoForm.get('uso').value;
    this.auto.p_NVEHBRAND = this.vehiculoForm.get('marcacodigo').value;
    // this.auto.P_SNAME_VEHBRAND = this.vehiculoForm.get('marcadescripcion').value;
    this.auto.p_NVEHMODEL = this.vehiculoForm.get('modelo').value;
    this.auto.p_SNUMSERIE = this.vehiculoForm.get('serie').value;
    this.auto.p_SEATNUMBER = this.vehiculoForm.get('asientos').value;
    this.auto.p_NYEAR = this.vehiculoForm.get('anho').value;
    this.auto.p_NAUTOZONE = this.vehiculoForm.get('zona').value;
    this.fechaInicioVigencia = this.vehiculoForm.get('vigencia').value;
  }

  searchMarcas(search: string) {
    if (search) {
      this.marcas = this.marcasFull.filter(s => s.sdescript.toLowerCase().indexOf(search.toLowerCase()) >= 0);
    } else {
      this.marcas = this.marcasFull;
    }
  }

  searchClases(search: string) {
    if (search) {
      this.clases = this.clasesFull.filter(s => s.sdescript.toLowerCase().indexOf(search.toLowerCase()) >= 0);
    } else {
      this.clases = this.clasesFull;
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

  irPaso03() {
    this.router.navigate(['broker/step03']);
  }
}
