import { VehiculoService } from '../../services/vehiculo/vehiculo.service';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { EmisionService } from '../../../client/shared/services/emision.service';

@Component({
  selector: 'app-step01',
  templateUrl: './step01.component.html',
  styleUrls: ['./step01.component.css']
})
export class Step01Component implements OnInit {

  bTipoVehiculo = true;
  sTipoVehiculo = '1';
  bValido = false;
  bValidado = false;
  codigo = '';
  mensaje = '';
  placa = '';
  bValidar = false;
  bLoading = false;

  tipoCertificado: any;
  tCertificado = '';
  NroCertificado: number;

  mainTitle = '';
  titulos: string[];
  LittleTitle = '';
  longitudPlaca = 6;

  ultimaPaginaNavegada = 0;
  paginaActual = 1;

  constructor(private vehiculoService: VehiculoService,
              private emisionService: EmisionService,
              private router: Router) { }

  ngOnInit() {
    this.initComponent();
  }

  initComponent() {
    this.validarNavegacion();
    this.tipoCertificado = JSON.parse(sessionStorage.getItem('tipoCertificado'));
    this.tCertificado = this.tipoCertificado && this.tipoCertificado.tipoCertificado;
    this.NroCertificado = Number(this.tCertificado) - 1;
    this.setTitle(this.NroCertificado);

    const placaSession = sessionStorage.getItem('placa');

    if (placaSession !== null) {
      this.placa = placaSession;
    }
  }

  private validarNavegacion() {
    const sessionUltimaPagina = sessionStorage.getItem('pagina');
    if (sessionUltimaPagina != null) {
      this.ultimaPaginaNavegada = +sessionUltimaPagina;
    }
  }

  setTitle(id: number) {
    this.titulos = ['Crea un SOAT Manual para un tercero', 'Crea un SOAT Láser para un tercero', 'Crea un SOAT electrónico para un tercero'];
    this.mainTitle = this.titulos[id];
  }

  onSetTipoVehiculo(tipo) {
    this.bTipoVehiculo = tipo;
    if (this.bTipoVehiculo) {
      this.sTipoVehiculo = '1';
      this.longitudPlaca = 6;
    } else {
      this.sTipoVehiculo = '2';
      this.longitudPlaca = 8;
    }
    this.placa = '';
  }

  validarPlaca() {
    this.bValidar = true;
    this.bLoading = true;
    this.bValido = false;
    this.bValidado = false;
    this.vehiculoService.validarPlaca(this.sTipoVehiculo, this.placa)
      .subscribe(
        data => {
          //console.log(data);
          this.codigo = data['codigo'];
          this.mensaje = data['mensaje'];
          // data['placa'];
          this.bLoading = false;
          this.bValidado = true;

          if (this.codigo === '1') {
            this.bValido = true;            
            // Invocar al servicio de auto por placa
            this.obtenerDatosAutoPorPlaca(this.placa);
          } else {
            this.bValidar = false;
          }
        },
        error => {
          console.log(error);
          this.bValidado = true;
          this.bValidar = false;
          this.bLoading = false;
          this.mensaje = 'No se pudo realizar la validación de la placa. Por favor vuelva a intentarlo.';
        }
      );
  }

  obtenerDatosAutoPorPlaca(placa) {
    this.emisionService.autoPorPlaca(placa)
      .subscribe(
        res => {
          //console.log(res);
          const arrAuto = res;
          if (arrAuto.length > 0) {
            const auto = arrAuto[0];
            // Almacenar los datos del auto en el session storage
            sessionStorage.setItem('auto', JSON.stringify(auto));
          }
          // Almacenar la placa en el session storage
          sessionStorage.setItem('placa', this.placa);
          sessionStorage.setItem('TipoVehiculo', this.sTipoVehiculo);
          this.almacenarNavegacion();
          // Redireccionar al paso 02
          setTimeout(() => {
            this.irPaso02();
          }, 1000);
        },
        err => {
          console.log(err);
          this.bLoading = false;
          this.bValidar = false;
          this.bLoading = false;
        }
      );
  }

  private almacenarNavegacion() {
    if (this.paginaActual > this.ultimaPaginaNavegada) {
      sessionStorage.setItem('pagina', this.paginaActual.toString());
    }
  }

  irPaso02() {
    this.router.navigate(['broker/step02']);
  }
}

