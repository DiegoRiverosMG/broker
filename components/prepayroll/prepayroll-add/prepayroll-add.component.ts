import { Component, OnInit, ViewContainerRef, ComponentFactoryResolver, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
//import { BsDatepickerConfig, ModalDirective } from 'ngx-bootstrap';
import { BsDatepickerConfig } from 'ngx-bootstrap/datepicker';
import { DatePipe } from '@angular/common';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { AppConfig } from '../../../../../app.config';
// Services
import { ChannelSalesService } from '../../../../../shared/services/channelsales/channelsales.service';
import { ChannelPointService } from '../../../../../shared/services/channelpoint/channelpoint.service';
import { Step04Service } from '../../../services/step04/step04.service';
import { VisaService } from '../../../../../shared/services/pago/visa.service';
import { PagoEfectivoService } from '../../../../../shared/services/pago/pago-efectivo.service';
import { PrepayrollService } from '../../../services/prepayroll/prepayroll.service';
import { UtilityService } from '../../../../../shared/services/general/utility.service';

// Components
import { ButtonVisaComponent } from '../../../../../shared/components/button-visa/button-visa.component';
import { FrameComponent } from '../../../../../shared/components/frame/frame.component';
// Models
import { ChannelSales } from '../../../../../shared/models/channelsales/channelsales';
import { ChannelPoint } from '../../../../../shared/models/channelpoint/channelpoint';
import { SessionToken } from '../../../../client/shared/models/session-token.model';
import { EspecieValorada } from '../../../models/prepayroll/especie-valorada.model';
import { GenerarCip } from '../../../../client/shared/models/generar-cip.model';
import { Prepayroll } from '../../../models/prepayroll/prepayroll.model';
import { PrepayrollDetail } from '../../../models/prepayroll/prepayroll-detail.model';
import { PrepayrollPayment } from '../../../models/prepayroll/prepayroll-payment.model';
import { EspecieValoradaDetalle } from '../../../models/prepayroll/especie-valorada-detalle.model';



@Component({
  selector: 'app-prepayroll-add',
  templateUrl: './prepayroll-add.component.html',
  styleUrls: ['./prepayroll-add.component.css']
})
export class PrePayrollAddComponent implements OnInit {
  listaEspecies: EspecieValorada[] = [];
  listaSelected: EspecieValoradaDetalle[] = [];
  especieValoradaDetalle = new EspecieValoradaDetalle('', '', false, 0, '');
  especieValorada = new EspecieValorada('', '', false, 0, '');

  canales = [];
  puntosVenta = [];
  listaPreventa: number[] = [];
  usuario: any;

  public bsConfig: Partial<BsDatepickerConfig>;
  fecha = new Date();
  dia = this.fecha.getDate();
  mes = this.fecha.getMonth() - 0;
  anho = this.fecha.getFullYear();
  dpValueIni: Date = new Date(this.anho + '-' + this.mes + '-' + this.dia);
  dpValueFin: Date = new Date();
  //#region Filtros de busqueda
  numeroEspecie = '';
  canalSelected = '0';
  puntoVentaSelected = '0';
  modalidad = '1'; // modalidad por default "1":Manual
  //#endregion
  public result: any = {};
  totalPreplanilla = 0;
  cantidadEspecies = 0;

  bBloqueo = false;
  bMostrarButtons = true;
  showbtnGenerarPlanilla = true;
  bLoading = false;
  bMostrarButtonPE = false;
  bMontoValido = false;
  bPlacaValida = false;
  bPlacaRepetida = false;
  bPlacaRepetidaBD = false;
  nCantidadPlaca = 0;
  btnVisa;
  frameResult;
  tipoPagoSelected = '';

  bValidado = false;
  selectEspeciesAll = false;
  selectAllPreplanilla = false;
  /*Liquidacion -Editar*/
  flag_grabar_preplanilla = false;
  showCheckbox = false;
  showFiltrosLiquidacion = false;
  showDatosLiquidacion = false;
  showbtnGrabarTodo = false;
  showbtnEliminardePrePlanilla = false;
  prepayroll = new Prepayroll(0, 0, 0, 0, '', '', '', '', 0, '', '', '', [], []);
  ListPrePayRollGeneral: any = {};
  // listPrepayrollPayment = [];
  public keypayment = 0;
  public totaldeclarado = 0;
  showFiltrosEnviar = false;

  public resultBank: any = {};
  public resultPaymentType: any = {};
  public resultCurrentType: any = {};
  public resultAccountBank: any = {};
  prepayrollPaymentAdd: any = {};
  listprepayrollPaymentAdd = [];
  public arrayNumerodoc = '';
  preplanillaimporte = '';
  preplanillaBuscar = '';
  bsValueFecOp: Date = new Date();
  selectedAllPayment: any;
  //#region Modales
  medioPago = '';
  mensajeConfirmacion = '';
  @ViewChild('modalConfirmacion', { static: true }) modalConfirmacion: ModalDirective;
  @ViewChild('modalResultadoPE', { static: true }) modalResultado;
  @ViewChild('childModal', { static: true }) childModal: ModalDirective;
  @ViewChild('childModalCerrar', { static: true }) childModalCerrar: ModalDirective;

  messageinfo: string;
  //#endregion

  constructor(private router: Router,
    private viewContainerRef: ViewContainerRef,
    private factoryResolver: ComponentFactoryResolver,
    private channelSalesService: ChannelSalesService,
    private salePointService: ChannelPointService,
    private polizasService: Step04Service,
    private visaService: VisaService,
    private pagoEfectivoService: PagoEfectivoService,
    private prepayrollService: PrepayrollService,
    private route: ActivatedRoute,
    public utilityService: UtilityService,
    private datePipe: DatePipe
  ) {

    // Configuracion para Date Pickers
    this.bsConfig = Object.assign({},
      {
        dateInputFormat: 'DD/MM/YYYY',
        locale: 'es',
        containerClass: 'theme-dark-blue',
        showWeekNumbers: true
      });
  }

  ngOnInit() {
    this.initComponent();

    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    this.canalSelected = currentUser.canal.toString();
    this.puntoVentaSelected = currentUser.indpuntoVenta.toString();

    const id = this.route.snapshot.paramMap.get('id') || '';
    const accion = this.route.snapshot.paramMap.get('accion') || '';
    const nidstate = this.route.snapshot.paramMap.get('nidstate') || '';

    if (accion === 'send') {
      // NOTHING
    } else if (accion === 'upd') {


      this.showDatosLiquidacion = true;
      this.showbtnGenerarPlanilla = true;



      this.bMostrarButtons = false;
      this.listarEspeciesValoradas(this.canalSelected, this.puntoVentaSelected, false);
      this.prepayroll.id = +id;
      if (this.prepayroll.id > 0) {
        this.prepayrollService.GetPrePayRollGeneral(this.prepayroll)
          .subscribe(
            data => {
              this.ListPrePayRollGeneral = <Prepayroll[]>data;

              if (this.ListPrePayRollGeneral.estado == '1') {
                this.showFiltrosLiquidacion = true;
                this.showbtnGrabarTodo = true;
                this.showCheckbox = true;
                this.showbtnEliminardePrePlanilla = true;
                this.showFiltrosEnviar = true;
              }
              // this.listaSelected = this.ListPrePayRollGeneral.detalles;
              this.ListPrePayRollGeneral.detalles.forEach(element => {
                this.listaSelected.push(new EspecieValorada(element.policy, element.ntippoldes, false, element.amount, element.regist));
              });

              this.listprepayrollPaymentAdd = this.ListPrePayRollGeneral.pagos;
              this.keypayment = this.listprepayrollPaymentAdd.length;
              // sumar el importa total del certificado
              this.cantidadEspecies = this.listaSelected.length;
              for (let e = 0; e < this.listprepayrollPaymentAdd.length; e++) {
                this.totalPreplanilla += this.listaSelected[e].precio;
              }
              // sumar el importa total del payment
              for (let i = 0; i < this.listprepayrollPaymentAdd.length; i++) {
                this.totaldeclarado += this.listprepayrollPaymentAdd[i].amount;
              }

              this.calcularTotal();
            },
            error => {
              console.log(error);
            }
          );
      }

    } else if (accion === 'add') {
      this.showCheckbox = true;
      this.showFiltrosEnviar = true;
      this.showFiltrosLiquidacion = true;
      this.showDatosLiquidacion = false;
      this.showbtnGenerarPlanilla = true;
      this.showbtnGrabarTodo = true;
      this.showbtnEliminardePrePlanilla = true;
      this.onBuscarEspecies();
    } else if (accion === 'pago') {
      this.showCheckbox = true;
      this.showFiltrosLiquidacion = true;
      this.showDatosLiquidacion = false;
      this.showbtnGenerarPlanilla = true;
      this.showbtnGrabarTodo = true;
      this.showFiltrosEnviar = true;
      this.showbtnEliminardePrePlanilla = true;
      this.onBuscarEspecies();
      this.getPrepayrollSession();
    }
  }

  initComponent() {
    const usuarioSession = localStorage.getItem('currentUser');
    if (usuarioSession !== null) {
      this.usuario = JSON.parse(usuarioSession);
    }


    this.listarCanales();
  }

  listarCanales() {
    const filtro = new ChannelSales(this.usuario.id, '0', '');
    this.channelSalesService
      .getPostChannelSales(filtro)
      .subscribe(
        res => {
          this.canales = <any[]>res;

          if (this.usuario !== undefined) {
            this.canalSelected = this.usuario.canal;
            this.listarPuntosVenta(this.canalSelected);
          }
        },
        err => {
          console.log(err);
        }
      );
  }

  onChangeCanal(nchannel) {
    this.canalSelected = nchannel;
    if (this.canalSelected === '0') {
      this.puntosVenta = [];
    } else {
      this.listarPuntosVenta(this.canalSelected);
    }
  }

  listarPuntosVenta(nchannel) {
    const filtro = new ChannelPoint(nchannel, 0);
    this.salePointService
      .getPostChannelPoint(filtro)
      .subscribe(
        res => {
          this.puntosVenta = <any[]>res;
          if (this.usuario !== undefined) {
            this.puntoVentaSelected = this.usuario.puntoVenta;
          }
          this.listarEspeciesValoradas(nchannel, this.puntoVentaSelected, false);
        },
        err => {
          console.log(err);
        }
      );
  }

  onChangePuntoVenta(nnumpoint) {
    this.puntoVentaSelected = nnumpoint;
  }

  listarEspeciesValoradas(canal: string, pv: string, clearDetalle: boolean) {
    if (canal === null || canal === undefined || canal === '' || canal === '0') {
      canal = this.usuario.canal;
    }

    if (pv === null || pv === undefined || pv === '' || pv === '0') {
      pv = this.usuario.puntoVenta;
    }
    return this.prepayrollService.getPolizasPrePayroll(canal, pv, this.modalidad)
      .subscribe(
        res => {
          this.listaEspecies = res;
        },
        err => {
          console.log(err);
        });
  }

  onVolver() {
    this.router.navigate(['broker/prepayroll']);
  }

  onBuscarEspecies() {
    this.listarEspeciesValoradas(this.canalSelected, this.puntoVentaSelected, true);
  }

  selectAllEspecies() {
    for (let i = 0; i < this.listaEspecies.length; i++) {
      this.listaEspecies[i].selected = this.selectEspeciesAll;
    }
  }

  checkIfAllSelected(item) {
    /* if(this.listaSelected!==undefined)
     {
       const elemento= this.listaSelected.filter(e=>e.npolesP_COMP.toString()===item.npolesP_COMP.toString());
       if(elemento.length==0)
       this.listaEspecies.every(function (item: EspecieValorada) { return item.selected === true; });

      // this.listaEspecies.every(function (item: EspecieValorada) { return item.selected === false; });
     }else
     {*/
    this.listaEspecies.every(function (item: EspecieValorada) { return item.selected === true; });
    // }
  }


  checkIfAllSelectedPlanilla() {
    this.listaSelected.every(function (item: EspecieValoradaDetalle) { return item.selected === true; });
  }


  onAgregarAPreplanilla() {
    this.listaPreventa = [];
    // for (let i = 0; i < this.listaEspecies.length; i++) {
    for (let i = this.listaEspecies.length - 1; i >= 0; i--) {
      const item = this.listaEspecies[i];
      let encontrado = 0;
      if (this.listaSelected !== undefined) {
        const elemento = this.listaSelected.filter(e => e.npolesP_COMP.toString() === item.npolesP_COMP.toString());
        if (elemento.length > 0) {
          encontrado = 1;
        }
      }
      if (item.selected !== undefined && item.selected === true && encontrado == 0) {
        /* item.selected = false;
         item.precio = 0.00;*/
        //
        this.especieValoradaDetalle = new EspecieValoradaDetalle(item.npolesP_COMP, item.ntippoldes, false, 0.00, '');
        this.listaSelected.push(this.especieValoradaDetalle);
        this.listaPreventa.push(i);
        // this.listaEspecies.splice(i, 1);
      }
    }
    this.listaPreventa.forEach(element => { this.listaEspecies.splice(element, 1); }
    );
    this.selectAllPreplanilla = false;
    this.cantidadEspecies = this.listaSelected.length;
  }

  selectAllEspeciesPreplanilla() {
    if (this.listaSelected !== undefined) {
      for (let i = 0; i < this.listaSelected.length; i++) {
        this.listaSelected[i].selected = this.selectAllPreplanilla;
      }
    }
  }

  onQuitarDePreplanilla() {
    if (this.listaSelected !== undefined) {
      for (let i = this.listaSelected.length - 1; i >= 0; i--) {
        const item = this.listaSelected[i];
        if (item.selected !== undefined && item.selected === true) {
          const index = this.listaSelected.indexOf(item);
          if (index > -1) {
            // this.especieValoradaDetalle
            /*this.especieValorada.npolesP_COMP=item.npolesP_COMP;
            this.especieValorada.ntippoldes=item.ntippoldes;
            this.especieValorada.selected=false;            */
            this.especieValorada = new EspecieValorada(item.npolesP_COMP, item.ntippoldes, false, 0, '');
            this.listaEspecies.push(this.especieValorada);
            this.listaSelected.splice(index, 1);
          }
        }
      }
      this.cantidadEspecies = this.listaSelected.length;
    } else {
      this.cantidadEspecies = 0;
    }

    this.selectAllPreplanilla = false;

    this.calcularTotal();
  }

  calcularTotal() {
    let total = 0;
    for (let i = 0; i < this.listaSelected.length; i++) {
      const item = this.listaSelected[i];
      total = this.sumar(total, item.precio);
    }
    this.totalPreplanilla = total;
  }

  confirmarMedioPago(tipoPago: string, flag_grabar_preplanilla: boolean) {
    switch (tipoPago) {
      case '1':
        this.medioPago = 'Visa';
        break;
      case '2':
        this.medioPago = 'Pago Efectivo';
        break;
      default:
        break;
    }
    const valido = this.validar();
    if (valido == false) { return; }
    if (flag_grabar_preplanilla === true) {
      this.flag_grabar_preplanilla = flag_grabar_preplanilla;
      this.bLoading = false;
      this.bMostrarButtons = false;
      this.showDatosLiquidacion = true;
    } else {
      if (tipoPago == '1') {
        const preplanillaValidacion = this.getDatosPreplanilla();
        this.prepayrollService.validar(preplanillaValidacion).subscribe(
          res => {
            if (!(res.mensaje == null || res.mensaje == undefined || res.mensaje == '' || res.mensaje == 'null')) {
              this.bPlacaRepetidaBD = true;
              this.messageinfo = res.mensaje;
              this.childModal.show();

            } else {
              this.bPlacaRepetidaBD = false;
              this.mensajeConfirmacion = `Esta acción no se puede deshacer. ¿Esta seguro de pagar con ${this.medioPago}?`;
              this.tipoPagoSelected = tipoPago;
              this.modalConfirmacion.show();
            }


          }
          , error => {
            console.log(error);
          });
      } else {
        const preplanillaValidacion = this.getDatosPreplanilla();
        this.prepayrollService.validar(preplanillaValidacion).subscribe(
          res => {
            // console.log(res);
            if (!(res.mensaje == null || res.mensaje == undefined || res.mensaje == '' || res.mensaje == 'null')) {
              this.bPlacaRepetidaBD = true;
              this.messageinfo = res.mensaje;
              this.childModal.show();
            } else {
              this.bPlacaRepetidaBD = false;
              this.mensajeConfirmacion = `Esta acción no se puede deshacer. ¿Esta seguro de pagar con ${this.medioPago}?`;
              this.tipoPagoSelected = tipoPago;
              this.modalConfirmacion.show();
            }
          }
          , error => {
            console.log(error);
          });
      }
    }
    /* this.mensajeConfirmacion = `Esta acción no se puede deshacer. ¿Esta seguro de pagar con ${this.medioPago}?`;
       this.tipoPagoSelected = tipoPago;
       this.modalConfirmacion.show();*/

  }

  validar() {
    this.bValidado = true;
    this.bMontoValido = true;
    this.bPlacaValida = true;
    this.bPlacaRepetida = false;
    if (this.cantidadEspecies == 0) {
      this.messageinfo = 'No existen registros para generar la Pre Planilla.';
      this.childModal.show();
      return false;
    }

    if (this.totalPreplanilla == 0) {
      this.messageinfo = 'El importe total de la Pre Planilla no puede ser cero.';
      this.childModal.show();
      return false;
    }
    this.bPlacaRepetida = false;
    for (let i = 0; i < this.listaSelected.length; i++) {
      if (!(this.listaSelected[i].precio > 0)) {
        this.bMontoValido = false;
      }
      if (this.listaSelected[i].placa == undefined || this.listaSelected[i].placa == '') {
        this.bPlacaValida = false;
      }
      this.nCantidadPlaca = 0;
      this.listaSelected.forEach(element => {
        if (element.placa.toUpperCase() == this.listaSelected[i].placa.toUpperCase()) {
          this.nCantidadPlaca = this.nCantidadPlaca + 1;
        }
      });
      if (this.nCantidadPlaca > 1) {
        this.bPlacaRepetida = true;
      }
    }

    if (this.bMontoValido == false || this.bPlacaValida == false) {
      this.messageinfo = this.bMontoValido == false ? 'No se ha ingresado el precio de todas las Pre-Ventas.' : 'No se ha ingresado la placa de todas las Pre-Ventas.';
      this.childModal.show();
      return false;
    }

    if (this.bPlacaRepetida) {
      this.messageinfo = 'Se ha ingresado una Placa repetida.';
      this.childModal.show();
      return false;
    }

    if (this.totalPreplanilla > 0 && this.cantidadEspecies > 0 && this.bMontoValido && this.bPlacaValida && this.bPlacaRepetida == false) {
      this.bValidado = true;
    } else {
      this.bValidado = false;
    }
    return this.bValidado;
  }

  cerrarConfirmacion() {
    this.modalConfirmacion.hide();
  }

  confirmarAccion() {
    this.cerrarConfirmacion();
    this.bBloqueo = true;

    sessionStorage.setItem('preplanilla', JSON.stringify(this.prepayroll));

    switch (this.tipoPagoSelected) {
      case '1': // Visa
        this.crearBotonVisa();
        break;
      case '2': // PagoEfectivo
        this.mostrarBotonPagoEfectivo();
        break;
      default:
        break;
    }
  }

  crearBotonVisa() {
    this.bMostrarButtons = false;
    const valido = this.validar();
    const preplanillaValidacion = this.getDatosPreplanilla();
    this.prepayrollService.validar(preplanillaValidacion).subscribe(
      res => {
        if (!(res.mensaje == null || res.mensaje == undefined || res.mensaje == '' || res.mensaje == 'null')) {
          this.messageinfo = res.mensaje;
          this.childModal.show();
        } else {
          this.generarSessionToken();
        }
      }
      , error => {
        console.log(error);
      });

  }

  generarSessionToken() {
    this.visaService.generarSessionToken(-1, this.totalPreplanilla, this.canalSelected, this.puntoVentaSelected, 0, 0, 0) // user Id
      .subscribe(
        res => {
          const data = <SessionToken>res;
          // Datos de la preplanilla
          const preplanilla = this.getDatosPreplanilla();
          // Guardar informacion en el session Storage
          sessionStorage.setItem('sessionToken', data.sessionToken);
          sessionStorage.setItem('preplanilla', JSON.stringify(preplanilla));
          // Inyectar el boton de Visa
          const factory = this.factoryResolver.resolveComponentFactory(ButtonVisaComponent);
          this.btnVisa = factory.create(this.viewContainerRef.parentInjector);
          this.btnVisa.instance.action = AppConfig.ACTION_FORM_VISA_PREPAYROLL;
          this.btnVisa.instance.amount = this.totalPreplanilla; // Enviar el monto total
          this.btnVisa.instance.sessionToken = data.sessionToken;
          this.btnVisa.instance.purchaseNumber = data.purchaseNumber;
          this.btnVisa.instance.merchantLogo = AppConfig.MERCHANT_LOGO_VISA;
          this.btnVisa.instance.userId = this.usuario.id; // Enviar el id del usuario
          // Agregar el componente al componente contenedor
          this.viewContainerRef.insert(this.btnVisa.hostView);
          this.bLoading = false;
        },
        error => {
          console.log(error);
        }
      );
  }
  //#endregion

  //#region Pago Efectivo

  mostrarBotonPagoEfectivo() {
    this.bMostrarButtons = false;
    this.bMostrarButtonPE = true;
    this.bLoading = false;
  }

  pagarConPagoEfectivo() {
    const valido = this.validar();
    if (valido) {
      this.bPlacaRepetida = false;
      const preplanillaValidacion = this.getDatosPreplanilla();
      this.prepayrollService.validar(preplanillaValidacion).subscribe(
        res => {
          if (!(res.mensaje == null || res.mensaje == undefined || res.mensaje == '' || res.mensaje == 'null')) {
            this.messageinfo = res.mensaje;
            this.childModal.show();
          } else {
            this.bMostrarButtonPE = false;
            this.bLoading = true;
            this.pagoEfectivoService
              .generarCip(this.usuario.firstName, // nombres del usuario
                this.usuario.lastName, // apellidos del usuario
                this.usuario.email, // correo del usuario
                this.totalPreplanilla, // monto
                '', // proceso Id
                '', // planilla Id
                AppConfig.FLUJO_PREPLANILLA,
                this.usuario.id) // usuario Id
              .subscribe(
                res => {
                  const cip = <GenerarCip>res;
                  if (cip.estado === '1') { // Cip generado correctamente
                    // Grabar Pre-planilla
                    const preplanilla = this.getDatosPreplanilla();
                    preplanilla.cipnumero = cip.cipNumero;
                    preplanilla.estado = 2;
                    this.prepayrollService
                      .registrar(preplanilla)
                      .subscribe(
                        response => {
                          // Mostrar Iframe
                          const factory = this.factoryResolver.resolveComponentFactory(FrameComponent);
                          this.frameResult = factory.create(this.viewContainerRef.parentInjector);
                          this.frameResult.instance.token = cip.token;
                          this.frameResult.instance.ancho = '100%';
                          this.frameResult.instance.alto = '100%';
                          // Agregar el componente al componente contenedor
                          this.viewContainerRef.insert(this.frameResult.hostView);
                          // Abrimos el modal
                          this.modalResultado.show();
                          this.bLoading = false;
                        },
                        err => {
                          console.error(err);
                        }
                      );
                  } else {
                    // Ocurrio un error al intentar generar el Cip. Por favor, vuelva a intentarlo
                    this.bLoading = false;
                  }
                },
                err => {
                  console.log(err);
                  this.bLoading = false;
                  // this.mostrarPE = true;
                }
              );

          }
        },
        err => {
          console.log(err);
          this.bLoading = false;
          // this.mostrarPE = true;
        }
      );
    }
  }


  getDatosPreplanilla(): Prepayroll {

    const preplanilla = new Prepayroll(0, 0, 0, 0, '', '', '', '', 0, '', '', '', [], []);
    preplanilla.cantidad = this.cantidadEspecies;
    preplanilla.estado = AppConfig.PREPAYROLL_STATUS_PENDING;
    preplanilla.monto = this.totalPreplanilla;
    preplanilla.observacion = '';
    preplanilla.usuarioid = this.usuario.id;
    preplanilla.canalcodigo = this.canalSelected;

    // agregar detalles
    preplanilla.detalles = [];

    for (let i = 0; i < this.listaSelected.length; i++) {
      const item = new EspecieValoradaDetalle(this.listaSelected[i].npolesP_COMP, this.listaSelected[i].ntippoldes, false, this.listaSelected[i].precio, this.listaSelected[i].placa);
      const detalle = new PrepayrollDetail('', 0, 0, 0, 0, 0, '', 0);
      detalle.branch = 0;
      detalle.certif = 0;
      detalle.certype = '0';
      detalle.policy = Number(item.npolesP_COMP);
      detalle.product = 0;
      detalle.receipt = 0;
      detalle.regist = item.placa;
      detalle.amount = item.precio;
      preplanilla.detalles.push(detalle);
    }

    // agregar pagos
    /*preplanilla.pagos = [];
    const detallePago = new PrepayrollPayment(0,0,0,0,'','','','','');
    detallePago.amount = this.totalPreplanilla;
    detallePago.bank = 0;
    detallePago.bankaccount = '';
    detallePago.currency = 0;
    detallePago.operationdate = '';
    detallePago.operationnumber = '';
    detallePago.paidtypeId = 0;
    detallePago.reference = '';
    detallePago.state = AppConfig.PAYMENT_DETAIL_STATUS_PAID;
    preplanilla.pagos.push(detallePago);
    */
    return preplanilla;
  }

  finalizarPE() {
    document.body.classList.remove('modal-open');
    this.onVolver();
  }

  //#endregion

  //#endregion

  //#region Util

  soloNumeros(event: any) {
    const pattern = /[0-9]/;
    const inputChar = String.fromCharCode(event.charCode);

    if (!pattern.test(inputChar)) { // invalid character, prevent input
      event.preventDefault();
    }
  }

  soloNumerosLetras(event: any) {
    const pattern = /[0-9a-zA-Z]/;
    const inputChar = String.fromCharCode(event.charCode);

    if (!pattern.test(inputChar)) { // invalid character, prevent input
      event.preventDefault();
    }
  }

  sumar(a: number, b: number) {
    const result = Number(a) + Number(b);
    return result;
  }
  aceptarmsginfo() {
    this.childModal.hide();
    // this.bBloqueo = false;
    // this.router.navigate(['broker/payroll']);
  }


  onVotedParentBank(Bank: any) {
    this.resultBank = Bank;
  }

  onVotedParentAccountBank(AccountBank: any) {
    this.resultAccountBank = AccountBank;
  }

  onVotedCurrentType(CurrentType: any) {
    this.resultCurrentType = CurrentType;
  }

  onVotedParentPaymentType(PaymentType: any) {
    this.resultPaymentType = PaymentType;
  }

  AgregarDatosLiquidacion() {
    if (this.resultCurrentType.id === undefined || this.resultCurrentType.id === null || this.resultCurrentType.id === '0') {
      this.messageinfo = 'Por favor, seleccione tipo de moneda';
      this.childModal.show();
      return;
    }
    if (this.prepayrollPaymentAdd.NAMOUNT === undefined || this.prepayrollPaymentAdd.NAMOUNT === null || this.prepayrollPaymentAdd.NAMOUNT === '') {
      this.messageinfo = 'Por favor, ingrese importe';
      this.childModal.show();
      return;
    }
    if (this.resultPaymentType.id === undefined || this.resultPaymentType.id === null || this.resultPaymentType.id === '0') {
      this.messageinfo = 'Por favor, seleccione tipo de pago';
      this.childModal.show(); // chilmodalinfo
      return;
    }
    if (this.resultBank.id === undefined || this.resultBank.id === null || this.resultBank.id === '0') {
      this.messageinfo = 'Por favor, seleccione un banco';
      this.childModal.show();
      return;
    }
    if (this.prepayrollPaymentAdd.SOPERATIONNUMBER === undefined
      || this.prepayrollPaymentAdd.SOPERATIONNUMBER === null
      || this.prepayrollPaymentAdd.SOPERATIONNUMBER === '') {
      this.messageinfo = 'Por favor, ingrese numero de operación';
      this.childModal.show();
      return;
    }
    if (this.prepayrollPaymentAdd.SREFERENCE === undefined
      || this.prepayrollPaymentAdd.SREFERENCE === null
      || this.prepayrollPaymentAdd.SREFERENCE === '') {
      this.messageinfo = 'Por favor, ingrese referencia';
      this.childModal.show();
      return;
    }

    this.keypayment++;
    const prePayrollpayment = new PrepayrollPayment(0, 0, 0, 0, 0, '', '', '', '', '', 0, '', '', '', '', false);
    prePayrollpayment.id = this.keypayment;
    prePayrollpayment.currency = this.resultCurrentType.id;
    prePayrollpayment.ncurrencytext = this.resultCurrentType.text;

    prePayrollpayment.bank = this.resultBank.id;
    prePayrollpayment.nbanktext = this.resultBank.text;

    prePayrollpayment.bankaccount = this.resultAccountBank.id;
    prePayrollpayment.nbankaccounttext = this.resultAccountBank.text;

    prePayrollpayment.paidtypeId = this.resultPaymentType.id;
    prePayrollpayment.nidpaidtypetext = this.resultPaymentType.text;

    prePayrollpayment.amount = +this.prepayrollPaymentAdd.NAMOUNT;
    prePayrollpayment.operationnumber = this.prepayrollPaymentAdd.SOPERATIONNUMBER;
    prePayrollpayment.operationdate = this.datePipe.transform(this.bsValueFecOp, 'dd/MM/yyyy');
    prePayrollpayment.reference = this.prepayrollPaymentAdd.SREFERENCE;
    prePayrollpayment.state = '2';
    prePayrollpayment.nuserregister = 9997;
    prePayrollpayment.selected = false;

    if (this.listprepayrollPaymentAdd.length > 0) {

      const objeto = this.listprepayrollPaymentAdd.find(payrollpaymentsearch =>
        payrollpaymentsearch.bank === prePayrollpayment.bank &&
        payrollpaymentsearch.operationnumber === prePayrollpayment.operationnumber &&
        payrollpaymentsearch.operationdate == prePayrollpayment.operationdate
      );
      if (objeto != null) {
        this.messageinfo = 'El número de operación ya existe';
        this.childModal.show();
        return;
      } else {
        this.listprepayrollPaymentAdd.push(prePayrollpayment);
      }
    } else {
      this.listprepayrollPaymentAdd.push(prePayrollpayment);
    }
    this.totaldeclarado += prePayrollpayment.amount;

    this.prepayrollPaymentAdd.NAMOUNT = '';
    this.prepayrollPaymentAdd.SOPERATIONNUMBER = '';
    this.prepayrollPaymentAdd.SREFERENCE = '';
  }

  QuitarDatosLiquidacion() {
    for (let i = 0; i < this.listprepayrollPaymentAdd.length; i++) {
      if (this.listprepayrollPaymentAdd[i].selected === true) {
        this.arrayNumerodoc += this.listprepayrollPaymentAdd[i].id + ',';
      }
    }
    this.EliminarPayment();
  }

  EliminarPayment() {
    this.arrayNumerodoc = this.arrayNumerodoc.slice(0, -1);
    const arrayDocaElimnar = this.arrayNumerodoc.split(',');
    for (let e = 0; e < arrayDocaElimnar.length; e++) {
      const nidpayrolldetail = +arrayDocaElimnar[e];
      const objeto = this.listprepayrollPaymentAdd.find(book => book.id === nidpayrolldetail);
      this.keypayment--;
      this.totaldeclarado -= objeto.amount;
      objeto.selected = false;
      const Index = this.listprepayrollPaymentAdd.indexOf(objeto);
      this.listprepayrollPaymentAdd.splice(Index, 1);
    }
    this.arrayNumerodoc = '';
    this.selectedAllPayment = false;
  }

  selectAllPayment() {
    for (let i = 0; i < this.listprepayrollPaymentAdd.length; i++) {
      this.listprepayrollPaymentAdd[i].selected = this.selectAllPayment;
    }
  }

  checkIfAllSelectedPayment() {
    this.listprepayrollPaymentAdd.every(function (item: PrepayrollPayment) { return item.selected === true; });
  }

  grabarTodo() {
    // let valido = this.validarLiquidacion();
    // if (valido == false) return;

    this.prepayroll.monto = this.totalPreplanilla;
    this.prepayroll.estado = 1;
    this.prepayroll.cantidad = this.cantidadEspecies;
    this.prepayroll.usuarioid = '999';
    this.prepayroll.dregister = this.datePipe.transform(new Date(), 'dd/MM/yyyy');
    this.prepayroll.canalcodigo = this.usuario.canal;
    // Detalle
    for (let i = 0; i < this.listaSelected.length; i++) {
      const item = new EspecieValoradaDetalle(this.listaSelected[i].npolesP_COMP, this.listaSelected[i].ntippoldes, false, this.listaSelected[i].precio, this.listaSelected[i].placa);
      const detalle = new PrepayrollDetail('', 0, 0, 0, 0, 0, '', 0);
      detalle.branch = 0;
      detalle.certif = 0;
      detalle.certype = '0';
      detalle.policy = Number(item.npolesP_COMP);
      detalle.product = 0;
      detalle.receipt = 0;
      detalle.regist = item.placa;
      detalle.amount = item.precio;
      this.prepayroll.detalles.push(detalle);
    }

    this.prepayroll.pagos = this.listprepayrollPaymentAdd;
    this.listaEspecies = [];
    this.listprepayrollPaymentAdd = [];
    this.cantidadEspecies = 0;
    this.totalPreplanilla = 0;
    this.totaldeclarado = 0;

    this.prepayrollService.registrar(this.prepayroll)
      .subscribe(
        data => {
          this.result = data;
          if (this.prepayroll.id === 0) {
            this.messageinfo = 'Se generó la Planilla Nro: ' + this.result.id;
            this.childModalCerrar.show();
          } else {
            this.messageinfo = 'Se actualizó los de la Planilla Nro: ' + this.result.id;
            this.childModalCerrar.show();
          }
        },
        error => {
          console.log(error);
        }
      );
  }
  //#endregion

  //#region Pagos
  aceptarCerrar() {
    this.childModalCerrar.hide();
    this.router.navigate(['broker/prepayroll']);
  }


  getPrepayrollSession() {


    const pagoprePlanilla = JSON.parse(sessionStorage.getItem('preplanilla'));
    this.ListPrePayRollGeneral = <Prepayroll[]>pagoprePlanilla;
    if (this.ListPrePayRollGeneral.estado == '1') {
      this.showFiltrosLiquidacion = true;
      this.showCheckbox = true;
      this.showbtnEliminardePrePlanilla = true;
      this.showFiltrosEnviar = true;
    }
    // this.listaSelected = pagoprePlanilla.detalles;
    this.ListPrePayRollGeneral.detalles.forEach(element => {
      this.listaSelected.push(new EspecieValorada(element.policy, element.ntippoldes, false, element.amount, element.regist));
    });

    this.cantidadEspecies = this.listaSelected.length;
    for (let e = 0; e < this.listprepayrollPaymentAdd.length; e++) {
      this.totalPreplanilla += this.listaSelected[e].precio;
    }
    // sumar el importa total del payment
    for (let i = 0; i < this.listprepayrollPaymentAdd.length; i++) {
      this.totaldeclarado += this.listprepayrollPaymentAdd[i].amount;
    }

    this.calcularTotal();

  }

}
