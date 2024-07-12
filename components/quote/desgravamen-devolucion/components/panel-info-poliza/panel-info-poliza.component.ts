import { DesgravamenDevolucionConstants } from './../../core/constants/desgravamen-devolucion.constants';
import { Component, Input, Output, EventEmitter, OnInit, OnChanges } from '@angular/core';

import { ClientInformationService } from '../../../../../services/shared/client-information.service';
import { PolicyemitService } from '../../../../../services/policy/policyemit.service';
import { QuotationService } from '../../../../../services/quotation/quotation.service';

import { UtilService } from '../../core/services/util.service';
import { StorageService } from '../../core/services/storage.service';
import { PanelInfoPolizaService } from './panel-info-poliza.service';
import { DesgravamenDevolucionService } from '../../desgravamen-devolucion.service';
import { CommonMethods } from '../../../../common-methods';
import swal from 'sweetalert2';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'panel-info-poliza',
  templateUrl: './panel-info-poliza.component.html',
  styleUrls: ['./panel-info-poliza.component.css'],
})

export class PanelInfoPolizaComponent implements OnInit, OnChanges {
  @Input() detail: boolean;
  @Input() cotizacion: any;
  @Input() poliza: any;
  @Output() polizaChange: EventEmitter<any> = new EventEmitter();
  @Input() zeroBroker: any;
  @Input() renovEdit: any;

  @Output() cambiaDatosPoliza: EventEmitter<any> = new EventEmitter();

  codProducto = JSON.parse(localStorage.getItem('codProducto'))['productId'];
  //epsItem = JSON.parse(sessionStorage.getItem('eps'));
  epsItem = JSON.parse(localStorage.getItem('eps'));
  userId = JSON.parse(localStorage.getItem('currentUser'))['id'];

  CONSTANTS: any = DesgravamenDevolucionConstants;

  fechaActual: any = UtilService.dates.getCurrentDate();
  flagViajes: boolean = true;
  flagAforo: boolean = false;
  countFecha: number = 0;

  constructor(
    public clientInformationService: ClientInformationService,
    public policyemitService: PolicyemitService,
    public panelInfoPolizaService: PanelInfoPolizaService,
    public DesgravamenDevolucionService: DesgravamenDevolucionService,
    public storageService: StorageService,
    public quotationService: QuotationService,
    public toastr: ToastrService
  ) {
    this.CONSTANTS.RAMO = CommonMethods.branchXproduct(
      JSON.parse(localStorage.getItem('codProducto'))['productId']
    );
  }

  ngOnInit() {
    this.poliza = this.poliza || {};

    this.polizaChange.emit(this.poliza);

    if (!this.poliza.listReglas) {
      this.rulesDefault();
    }
    if (!this.poliza.listPlanes) {
      this.poliza.listPlanes = [{ codigo: '', valor: '- Seleccione -' }];
    }

    let paramprod = {
      branch: this.CONSTANTS.RAMO
    }

    this.DesgravamenDevolucionService.getProductListForBranch(paramprod).subscribe(
      (res) => {
        res.forEach(element => {
          //params.tipoProducto = element.COD_PRODUCT;
        this.poliza.tipoProducto = element.COD_PRODUCT;
        });
        
      }      
    );

    this.poliza.producto =
    {
      NBRANCH : this.CONSTANTS.RAMO
    }

    let params = {
      codBranch: this.CONSTANTS.RAMO,
      tipoProducto: this.codProducto
    };
    
    if (this.poliza.tasadesdev == "" || this.poliza.tasadesdev == undefined){
      this.poliza.tasadesdev = 0;
      this.poliza.tasasegurodesdev=0;
      this.poliza.tasaahorrodesdev=0;
    }
    
    
    this.DesgravamenDevolucionService.getEdadesValidar(params).subscribe(
      (res) => {

        if (this.poliza.edminingreso == null || this.poliza.edminingreso == undefined || this.poliza.edminingreso == "0"){
          this.poliza.edminingreso = res.edadmin_ingreso;
          this.poliza.edmaxingreso = 0;//res.edadmax_ingreso;
          this.poliza.edmaxperman = 0;//res.edadmax_permanen;
        }
        


        /*
        if (res.codError == 0) {

          this.poliza.listReglas = res.rulesList;
          this.poliza.id_tarifario = res.id_tarifario;
          this.poliza.version_tarifario = res.version_tarifario;
          this.poliza.name_tarifario = res.name_tarifario;
          this.poliza.listPlanes = res.planList;

        } else {
          this.rulesDefault();
          this.poliza.id_tarifario = null;
          this.poliza.version_tarifario = 0;
          this.poliza.name_tarifario = null;
          this.poliza.listPlanes = [{ codigo: '', valor: '- Seleccione -' }];
          swal.fire('Información', res.sMessage, 'error');
        }
        */
      },
      (err) => {
        console.log(err);
      }
    );

  }

  ngOnChanges(changes) {

    if (changes.zeroBroker && changes.zeroBroker.previousValue !== undefined) {
      this.getSegmento();
    }

    if (changes.renovEdit && changes.renovEdit.previousValue !== undefined) {
      this.getSegmento();
    }
  }

  rulesDefault() {
    this.poliza.listReglas = {
      flagComision: false,
      flagCobertura: false,
      flagAsistencia: false,
      flagBeneficio: false,
      flagSiniestralidad: false,
      flagAlcance: false,
      flagTemporalidad: false
    }
  }

  cambiarTipoProducto() {
    this.poliza.tipoPerfil = null;
    //this.poliza.tipoPlan = null;

    this.poliza.modalidad = null;
    //this.poliza.checkbox1.POL_MAT = false;
    //this.flagAforo = false;
    this.validarToast();
    this.emitirCambiarDatoPoliza();
  }

  validarToast() {
    if (!!this.poliza.tipoPoliza &&
      !!this.poliza.tipoPerfil &&
      !!this.poliza.tipoFacturacion &&
      this.CONSTANTS.RAMO == this.CONSTANTS.RAMO_COMERCIAL.DESGRAVAMEN_DEVOLUCION &&
      !this.cotizacion.modoVista) {
      if (this.poliza.tipoPoliza.id == 1 &&
        (this.poliza.tipoPerfil.NIDPLAN == 1 || this.poliza.tipoPerfil.NIDPLAN == 2) &&
        this.poliza.tipoFacturacion.id == 1) {
        this.toastr.info("El comprobante estará asociado al contratante de la cotización.",
          'INFORMACIÓN',
          { timeOut: 20000, toastClass: 'rmaClass ngx-toastr' }
        );
      } else {
        this.toastr.clear();
      }
    }
  }

  cambiarTipoPerfil() {
    // this.validarTipoRenovacion();
    // this.poliza.modalidad = null;
    // this.poliza.tipoFacturacion = null;
    this.poliza.codTipoViaje = { id: 1 };
    this.poliza.modalidad = this.poliza.tipoPoliza.codigo == 1 ? { ID: 1 } : null;
    this.flagAforo = false;
    this.poliza.checkbox1 = { POL_MAT: false, isSelected: false };
    this.poliza.temporalidad = this.verificarPerfilEstudiantil() || this.verificarPerfilAforo() ? this.poliza.temporalidad : null;
    this.poliza.tipoFacturacion = this.verificarPerfilAforo() ? { id: 1 } : null;
    this.getSegmento();
    this.validarToast();
    this.cambiarProducto();
  }

  verificarPerfilEstudiantil() {
    let flag = false;
    if (!!this.poliza.tipoPerfil) {
      if (this.CONSTANTS.RAMO == this.CONSTANTS.RAMO_COMERCIAL.DESGRAVAMEN_DEVOLUCION) {
        if (this.CONSTANTS.GRUPO_ESTUDIANTIL_AP.find(e => e == this.poliza.tipoPerfil.NIDPLAN)) {
          flag = true;
        }
      }

      if (this.CONSTANTS.RAMO == this.CONSTANTS.RAMO_COMERCIAL.VIDA_GRUPO) {
        if (this.CONSTANTS.GRUPO_RENTAS_ESTUDIANTIL.find(e => e == this.poliza.tipoPerfil.NIDPLAN)) {
          flag = true;
        }
      }
    }

    return flag;
  }

  verificarPerfilViajes() {
    let flag = false;
    if (!!this.poliza.tipoPerfil) {
      if (this.CONSTANTS.RAMO == this.CONSTANTS.RAMO_COMERCIAL.DESGRAVAMEN_DEVOLUCION) {
        if (this.CONSTANTS.GRUPO_VIAJES.find(e => e == this.poliza.tipoPerfil.NIDPLAN)) {
          flag = true;
        }
      }
    }

    return flag;
  }

  verificarPerfilAforo() {
    let flag = false;
    if (!!this.poliza.tipoPerfil) {
      if (this.CONSTANTS.RAMO == this.CONSTANTS.RAMO_COMERCIAL.DESGRAVAMEN_DEVOLUCION) {
        if (this.poliza.tipoPerfil.NIDPLAN == this.CONSTANTS.PERFIL_AFORO.DESGRAVAMEN_DEVOLUCION) {
          flag = true;
        }
      }

      if (this.CONSTANTS.RAMO == this.CONSTANTS.RAMO_COMERCIAL.VIDA_GRUPO) {
        if (this.poliza.tipoPerfil.NIDPLAN == this.CONSTANTS.PERFIL_AFORO.VIDA_GRUPO) {
          flag = true;
        }
      }
    }

    return flag;
  }

  validarTipoRenovacion() {
    if (!!this.poliza.tipoPerfil) {
      if (this.CONSTANTS.RAMO == this.CONSTANTS.RAMO_COMERCIAL.DESGRAVAMEN_DEVOLUCION) {
        if (this.CONSTANTS.GRUPO_VIAJES.find(e => e == this.poliza.tipoPerfil.NIDPLAN)) {
          this.poliza.tipoRenovacion = {
            COD_TIPO_RENOVACION: 6,
            DES_TIPO_RENOVACION: "ESPECIAL",
            text: "ESPECIAL",
            codigo: 6,
            valor: "ESPECIAL"
          };
        } else {
          this.poliza.tipoRenovacion = {
            codigo: '',
            valor: '- Seleccione -',
            text: '- Seleccione -'
          };
        }
      }
    }
    this.emitirCambiarDatoPoliza();
  }

  cambiarTipoRenovacion() {
    this.poliza.frecuenciaPago = {
      codigo: '',
      valor: '- Seleccione -',
      text: '- Seleccione -',
    };
    this.emitirCambiarDatoPoliza();
  }

  cambiarTipoFreq() {
    this.verificarInicioAseg();
    this.emitirCambiarDatoPoliza();
  }

  async cambiarProducto() {
    if (!!this.poliza.tipoPerfil) {
      if (this.CONSTANTS.RAMO == this.CONSTANTS.RAMO_COMERCIAL.DESGRAVAMEN_DEVOLUCION) {
        this.poliza.producto = {
          COD_PRODUCT: this.poliza.tipoPerfil.codigo,
          DES_PRODUCT: this.poliza.tipoPerfil.valor,
          NBRANCH: this.CONSTANTS.RAMO,
          id: this.poliza.tipoPerfil.codigo,
          codigo: this.poliza.tipoPerfil.codigo,
        };

        if (this.poliza.tipoPerfil.NIDPLAN == this.CONSTANTS.PERFIL_AFORO.DESGRAVAMEN_DEVOLUCION) {
          this.poliza.checkbox1.POL_MAT = true;
          this.flagAforo = true;
        }

      } else if (this.CONSTANTS.RAMO == this.CONSTANTS.RAMO_COMERCIAL.VIDA_GRUPO) {
        let productsList = await this.productoVidaGrupo();
        let productVG = null;
        if (this.CONSTANTS.GRUPO_VIDA_GRUPO.find(e => e == this.poliza.tipoPerfil.NIDPLAN)) {
          productVG = (productsList || []).find(product => product.COD_PRODUCT == this.CONSTANTS.PRODUCTO_VGRUPO.VIDA_GRUPO);
        }

        if (this.CONSTANTS.GRUPO_RENTAS_ESTUDIANTIL.find(e => e == this.poliza.tipoPerfil.NIDPLAN)) {
          productVG = (productsList || []).find(product => product.COD_PRODUCT == this.CONSTANTS.PRODUCTO_VGRUPO.RENTA_ESTUDIANTIL);
        }

        if (this.CONSTANTS.GRUPO_MI_FAMILIA.find(e => e == this.poliza.tipoPerfil.NIDPLAN)) {
          productVG = (productsList || []).find(product => product.COD_PRODUCT == this.CONSTANTS.PRODUCTO_VGRUPO.MI_FAMILIA);
        }

        if (productVG != null) {
          this.poliza.producto = {
            COD_PRODUCT: productVG.COD_PRODUCT,
            DES_PRODUCT: productVG.DES_PRODUCT,
            NBRANCH: this.CONSTANTS.RAMO,
            id: productVG.COD_PRODUCT,
            codigo: productVG.COD_PRODUCT,
          };
        }

        if (this.poliza.tipoPerfil.NIDPLAN == this.CONSTANTS.PERFIL_AFORO.VIDA_GRUPO) {
          this.poliza.checkbox1.POL_MAT = true;
          this.flagAforo = true;
        }
      }
    } else {
      this.poliza.producto = null;
    }

  }

  async productoVidaGrupo() {
    let response: any = null;
    let params = {
      branch: this.CONSTANTS.RAMO
    };
    await this.DesgravamenDevolucionService.getProductsListByBranch(params).toPromise().then(
      (res) => {
        response = res;
      },
      (err) => {
        response = null
      }
    );

    return response;
  }

  getSegmento() {
    if (this.cotizacion.modoVista == this.CONSTANTS.MODO_VISTA.COTIZAR ||
      this.cotizacion.modoVista == undefined ||
      (this.cotizacion.modoVista == this.CONSTANTS.MODO_VISTA.POLIZARENOVAR &&
        this.cotizacion.transac == 'RE' &&
        this.cotizacion.modoRenovacionEditar)) {

      if (!!this.poliza.tipoPerfil &&
        !!this.poliza.tipoPerfil.codigo &&
        !!this.poliza.modalidad &&
        !!this.poliza.modalidad.codigo &&
        !!this.poliza.tipoFacturacion &&
        !!this.poliza.tipoFacturacion.id &&
        this.cotizacion.brokers.length > 0
      ) {
        let params = {
          nbranch: this.CONSTANTS.RAMO,
          channel: this.cotizacion.brokers[0].COD_CANAL,
          currency: this.poliza.moneda.NCODIGINT,
          profile: this.poliza.tipoPerfil.codigo,
          policyType: this.poliza.tipoPoliza.codigo,
          collocationType: this.poliza.modalidad.codigo,
          billingType: this.poliza.tipoFacturacion.id,
        };
        this.DesgravamenDevolucionService.getTiposPlan(params).subscribe(
          (res) => {
            if (res.codError == 0) {

              this.poliza.listReglas = res.rulesList;
              this.poliza.id_tarifario = res.id_tarifario;
              this.poliza.version_tarifario = res.version_tarifario;
              this.poliza.name_tarifario = res.name_tarifario;
              this.poliza.listPlanes = res.planList;

            } else {
              this.rulesDefault();
              this.poliza.id_tarifario = null;
              this.poliza.version_tarifario = 0;
              this.poliza.name_tarifario = null;
              this.poliza.listPlanes = [{ codigo: '', valor: '- Seleccione -' }];
              swal.fire('Información', res.sMessage, 'error');
            }
          },
          (err) => {
            console.log(err);
          }
        );
      }
      else {
        this.rulesDefault();
        this.poliza.listPlanes = [{ codigo: '', valor: '- Seleccione -' }];
      }

      this.validarToast();
    }

    this.emitirCambiarDatoPoliza();
  }

  emitirCambiarDatoPoliza() {
    setTimeout(() => {
      this.cambiaDatosPoliza.emit();
    }, 100);
  }

  validarPolizaMatriz() {
    if (this.poliza.checkbox1.POL_MAT === true) {
      this.poliza.checkbox1.FAC_ANT = false;
    }
  }

  validarDeshabilitarFechaVigenciaInicio() {
    if (!this.cotizacion.modoVista) {
      // COTIZAR
      return false;
    } else if (
      this.cotizacion.modoVista === this.CONSTANTS.MODO_VISTA.POLIZARENOVAR
    ) {
      // RENOVACION
      return true;
    } else if (
      this.cotizacion.modoVista === this.CONSTANTS.MODO_VISTA.POLIZAINCLUIR
    ) {
      // INCLUSION
      return true;
    } else if (
      this.cotizacion.modoVista === this.CONSTANTS.MODO_VISTA.EXCLUIR
    ) {
      // EXCLUSION
      return true;
    } else if (this.cotizacion.modoVista === this.CONSTANTS.MODO_VISTA.ENDOSO) {
      // ENDOSO
      return true;
    } else if (
      this.cotizacion.modoVista === this.CONSTANTS.MODO_VISTA.ANULACION
    ) {
      // ANULACION
      return true;
    } else if (
      this.cotizacion.modoVista === this.CONSTANTS.MODO_VISTA.VISUALIZAR
    ) {
      // VISUALIZAR
      return true;
    } else {
      // EVALUACION
      if (
        this.cotizacion.tipoTransaccion == 0 ||
        this.cotizacion.tipoTransaccion == 1
      ) {
        return (
          !this.detail &&
          (this.CONSTANTS.PERFIL.COMERCIAl ==
            this.storageService.user.profileId ||
            this.CONSTANTS.PERFIL.OPERACIONES ==
            this.storageService.user.profileId) &&
          this.poliza.tipoRenovacion.codigo !==
          this.CONSTANTS.TIPO_RENOVACION.ESPECIAL
        );
      } else {
        return true;
      }
    }
  }

  validateMin() {
    if (this.cotizacion.tipoTransaccion == 2) {
      let now = new Date(
        new Date().getMonth() +
        1 +
        '/' +
        new Date().getDate() +
        '/' +
        new Date().getFullYear()
      );
      if (
        new Date(this.poliza.fechaInicioAsegurado).getTime() ==
        new Date(now).getTime()
      ) {
        return this.poliza.fechaInicioPoliza;
      } else {
        return this.poliza.fechaMinInicioAsegurado;
      }
    } else {
      return this.poliza.fechaInicioPoliza;
    }
  }

  verificarInicioAseg() {
    if (this.cotizacion.tipoTransaccion == 8) {
      if (
        this.poliza.frecuenciaPago.COD_TIPO_FRECUENCIA !=
        Number(this.poliza.frecuenciaPagoEndoso.COD_TIPO_FRECUENCIA)
      ) {
        let date = new Date(this.poliza.fechaFinAseguradoEn);
        date.setDate(date.getDate() + 1);
        return (this.poliza.fechaInicioAsegurado = date);
      } else {
        return (this.poliza.fechaInicioAsegurado =
          this.poliza.fechaInicioAseguradoEn);
      }
    } else {
      return this.poliza.fechaInicioAsegurado;
    }
  }

  validarInputMostrar() {
    let mostrar = false;
    if (this.cotizacion.modoVista == this.CONSTANTS.MODO_VISTA.COTIZAR ||
      this.cotizacion.modoVista == undefined) {
      mostrar = true;
    }

    return mostrar;
  }

  changeDate(tipo) {
    this.countFecha = this.countFecha + 1;
    if (this.cotizacion.modoVista == this.CONSTANTS.MODO_VISTA.COTIZAR ||
      // (this.cotizacion.modoVista == this.CONSTANTS.MODO_VISTA.POLIZARENOVAR && this.cotizacion.transac == 'RE') ||
      (this.cotizacion.modoVista == this.CONSTANTS.MODO_VISTA.EMITIR && this.countFecha > 3) ||
      (this.cotizacion.modoVista == this.CONSTANTS.MODO_VISTA.EMITIRR && this.countFecha > 3) ||
      this.cotizacion.modoVista == undefined) {
      if (tipo == 1) {
        this.poliza.fechaInicioAsegurado = this.poliza.fechaInicioPoliza;
      } else {
        this.poliza.fechaFinAsegurado = this.poliza.fechaFinPoliza;
      }

    }
  }
}
