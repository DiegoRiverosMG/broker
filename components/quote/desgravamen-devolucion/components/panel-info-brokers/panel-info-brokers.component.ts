import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import swal from 'sweetalert2';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { SearchBrokerComponent } from '../../../../../modal/search-broker/search-broker.component';
import { StorageService } from '../../core/services/storage.service';
import { DesgravamenDevolucionConstants } from '../../core/constants/desgravamen-devolucion.constants';
import { DesgravamenDevolucionService } from '../../desgravamen-devolucion.service';


import { ServicebrokerService } from '../../core/services/servicebroker.service';
import { data } from 'jquery';

@Component({
  selector: 'panel-info-brokers',
  templateUrl: './panel-info-brokers.component.html',
  styleUrls: ['./panel-info-brokers.component.css'],
})
export class PanelInfoBrokersComponent implements OnInit {
  @Input() detail: boolean;
  @Input() vista: any;
  @Input() brokers: any = [];
  @Input() brokersEndoso: any = [];
  @Output() brokersChange: EventEmitter<any> = new EventEmitter();
  @Input() initialize: boolean;
  proponerComision: boolean;
  brokersEliminados: any = [];
  @Input() brokersOriginales: any = [];
  CONSTANTS: any = DesgravamenDevolucionConstants;
  comisionDefault: any;

    //salidaBroker: any;  
    salidaBroker: any = [];

  constructor(
    private modal: NgbModal,
    public storageService: StorageService,
    public DesgravamenDevolucionService: DesgravamenDevolucionService,
    private serviciobroker:  ServicebrokerService
    ) { }

  ngOnInit() {
    this.brokers = this.brokers || [];
    this.detail = this.detail || false;
    this.brokersChange.emit(this.brokers);
    if (this.initialize) {
      if (
        this.storageService.esPerfilExterno ||
        this.storageService.template.ins_iniciarBroker
      ) {
        this.setBrokerByDefault();
      }
    }

    if (this.vista.modoVista == this.CONSTANTS.MODO_VISTA.COTIZAR ||
      this.vista.modoVista == undefined) {
      this.obtenerComision();
    }
  }

  obtenerComision() {
    //this.DesgravamenDevolucionService.getTiposComision().subscribe((res) => {
    //this.comisionDefault = res.nroComision;
    this.brokers.forEach((item) => {
      item.P_COM_SALUD = !!this.vista.trama ? this.vista.trama.COMISION_BROKER : 0;
      //});
    });
  }

  setBrokerByDefault() {
    // Datos del comercializador
    const broker: any = {
      NTYPECHANNEL: this.storageService.user['tipoCanal'],
      COD_CANAL: this.storageService.user['canal'],
      NCORREDOR: this.storageService.user['brokerId'],
      NTIPDOC: this.storageService.user['sclient'].substr(1, 1),
      NNUMDOC: this.storageService.user['sclient'].substr(3),
      RAZON_SOCIAL: this.storageService.user['desCanal'],
      PROFILE: this.storageService.user['profileId'],
      SCLIENT: this.storageService.user['sclient'],
      P_NPRINCIPAL: 0,
      P_COM_SALUD: this.storageService.user['canal'] != this.CONSTANTS.BKDIRECTO ? this.comisionDefault : 0,
      P_COM_SALUD_PRO: 0,
      P_SEDIT: 'I',
      valItemPen: false,
      valItemSal: false,
      showDelete: !this.storageService.esPerfilExterno,
      editarTasa: false,
      flag : 0,
    };
    this.brokers.push(broker);
    this.serviciobroker.actualizaBroker.subscribe(databroker => {
      //console.log('Recibiendo Data ...',databroker);
      this.clickDeletebroker();

      const broker: any = {
        NTYPECHANNEL: this.storageService.user['tipoCanal'],
        COD_CANAL: this.storageService.user['canal'],
        NCORREDOR: this.storageService.user['brokerId'],
        NTIPDOC: this.storageService.user['sclient'].substr(1, 1),
        NNUMDOC: this.storageService.user['sclient'].substr(3),
        RAZON_SOCIAL: this.storageService.user['desCanal'],
        PROFILE: this.storageService.user['profileId'],
        SCLIENT: this.storageService.user['sclient'],
        P_NPRINCIPAL: 0,
        P_COM_SALUD: this.storageService.user['canal'] != this.CONSTANTS.BKDIRECTO ? this.comisionDefault : 0,
        P_COM_SALUD_PRO: 0,
        P_SEDIT: 'I',
        valItemPen: false,
        valItemSal: false,
        showDelete: !this.storageService.esPerfilExterno,
        editarTasa: false,
        flag : 0,
      };
      this.brokers.push(broker);

      const broker2: any = {
        NTYPECHANNEL: databroker.data.NTYPECHANNEL,
        COD_CANAL: databroker.data.COD_CANAL,
        NCORREDOR: databroker.data.NCORREDOR,
        NTIPDOC: databroker.data.NTIPDOC,
        NNUMDOC: databroker.data.NNUMDOC,
        RAZON_SOCIAL: databroker.data.RAZON_SOCIAL,
        PROFILE: databroker.data.PROFILE,
        SCLIENT: databroker.data.SCLIENT,
        P_NPRINCIPAL: 0,
        P_COM_SALUD: 0,
        P_COM_SALUD_PRO: 0,
        P_SEDIT: 'I',
        valItemPen: false,
        valItemSal: false,
        showDelete: this.storageService.esPerfilExterno,
        editarTasa: false,
        flag : 1,
      };
      this.brokers.push(broker2);
    })    
    this.brokersChange.emit(this.brokers);
  }

  limpiarComision() {
    this.brokers.forEach((item) => {
      item.P_COM_SALUD_PRO = 0;
    });
  }

  clickAdd() {
    const modalRef = this.modal.open(SearchBrokerComponent, {
      size: 'lg',
      backdropClass: 'light-blue-backdrop',
      backdrop: 'static',
      keyboard: false,
    });
    modalRef.componentInstance.formModalReference = modalRef;
    modalRef.componentInstance.listaBroker = this.brokers;
    // modalRef.componentInstance.brokerMain = this.inputsCovid.P_SIDDOC_COM;
    modalRef.result.then((brokerData) => {
      brokerData.P_COM_SALUD = brokerData.COD_CANAL != this.CONSTANTS.BKDIRECTO ? this.comisionDefault : 0;
      brokerData.P_COM_SALUD_PRO = 0;
      brokerData.PROFILE = this.storageService.userId;
      brokerData.NCORREDOR = brokerData.NCORREDOR || brokerData.COD_CANAL;
      brokerData.BLOCK = true;
      brokerData.valItemPen = false;
      brokerData.valItemSal = false;
      brokerData.P_SEDIT = 'I';
      brokerData.P_NPRINCIPAL = 0;
      this.brokers.push(brokerData);
      this.brokersChange.emit(this.brokers);
    });
  }

  clickDeletebroker() {
    this.brokers.splice(0, 2);
    this.brokersEliminados = [];
    let arrayDelete = [];
    arrayDelete.push();
    this.brokersEliminados.push();
    this.brokersChange.emit(this.brokers);
  }
  

  clickDelete(broker) {
    swal
      .fire({
        title: 'Eliminar Broker',
        text: '¿Estás seguro que deseas eliminar este broker?',
        icon: 'info',
        showCancelButton: true,
        confirmButtonText: 'Eliminar',
        allowOutsideClick: false,
        cancelButtonText: 'Cancelar',
      })
      .then((result) => {
        if (result.value) {
          let index = this.brokers.indexOf(broker);
          this.brokers.splice(index, 1);

          if (this.detail) {
            this.brokersEliminados = [];
            let arrayDelete = [];

            arrayDelete.push(broker);

            (arrayDelete || []).forEach((broker) => {
              this.brokersEliminados.push({
                COD_CANAL: broker.COD_CANAL,
                NNUMDOC: broker.NNUMDOC,
                NTIPDOC: broker.NTIPDOC,
                NTYPECHANNEL: broker.NTYPECHANNEL,
                P_COM_SALUD: broker.P_COM_SALUD,
                P_COM_SALUD_PRO: broker.P_COM_SALUD_PRO,
                P_NPRINCIPAL: broker.P_NPRINCIPAL,
                P_SEDIT: 'D',
                RAZON_SOCIAL: broker.RAZON_SOCIAL,
                SCLIENT: broker.SCLIENT,
              });
            });

            (this.brokers || []).forEach((brokers) => {
              this.brokersEndoso.push(brokers);
            });

            (this.brokersOriginales || []).forEach((broker) => {
              (this.brokersEliminados || []).forEach((broker1) => {
                if (broker.NNUMDOC == broker1.NNUMDOC) {
                  this.brokersEndoso.push(broker1);
                }
                (this.brokersEndoso || []).forEach((broker2) => {
                  if (
                    broker1.NNUMDOC == broker2.NNUMDOC &&
                    broker2.P_SEDIT == 'U'
                  ) {
                    let index = this.brokersEndoso.indexOf(broker2);
                    this.brokersEndoso.splice(index, 1);
                  }
                });
              });
            });

          }
        }

        this.brokersChange.emit(this.brokers);

        // if (this.brokers.length == 0) {
        //   // this.vista.poliza.listPlanes = [{ codigo: '', valor: '- Seleccione -' }];
        //   // // this.vista.poliza.tipoFacturacion = [{ codigo: '', valor: '- Seleccione -' }];
        //   // this.vista.poliza.listReglas = {
        //   //   flagComision: false,
        //   //   flagCobertura: false,
        //   //   flagAsistencia: false,
        //   //   flagBeneficio: false,
        //   //   flagSiniestralidad: false,
        //   //   flagAlcance: false,
        //   //   flagTemporalidad: false
        //   // };

        //   // this.limpiarCotizador();
        // }
      });


  }

  // limpiarCotizador() {
  //   this.vista.trama.validado = false;
  //   this.vista.trama.TOT_ASEGURADOS = '';
  //   this.vista.trama.MONT_PLANILLA = 0;
  //   this.vista.trama.PRIMA = this.vista.trama.PRIMA_DEFAULT;
  //   this.vista.trama.SUM_ASEGURADA = 0;
  //   this.vista.cotizador.calculado = false;
  //   this.vista.coberturas = [];
  //   this.vista.primaNeta = this.vista.trama.PRIMA_DEFAULT;
  // }
}
