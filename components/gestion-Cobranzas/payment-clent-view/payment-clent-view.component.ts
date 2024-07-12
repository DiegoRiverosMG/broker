import { Component, OnInit, Input, ViewChild } from "@angular/core";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { BsDatepickerConfig } from 'ngx-bootstrap/datepicker';
import { CommonMethods } from './../../common-methods';
import swal from "sweetalert2";
import { ClientInformationService } from '../../../services/shared/client-information.service';
import { CobranzasService } from '../../../services/cobranzas/cobranzas.service';
import * as moment from 'moment';

@Component({
  selector: 'app-payment-clent-view',
  templateUrl: './payment-clent-view.component.html',
  styleUrls: ['./payment-clent-view.component.css']
})
export class PaymentClentViewComponent implements OnInit {
  public cabRestriClient: any = {};
  public isPrivilegios: boolean = false;
  public title: string;
  branchList: any = [];
  productList: any = [];
  restricList: any = [];
  privilegiosList: any = [];
  currentPage = 1;
  rotate = true;
  maxSize = 5;
  itemsPerPage = 8;
  totalItems = 0;
  isLoading: boolean = false;
  isDetail: boolean = false;
  public documentTypeList: any = [];
  codBranchSelected: number = 0;
  desBranchSelected: string;
  codTipoDocumentSelected: number;
  desProductSelected: string;
  codRestricSelected: number = 0;
  codProductSelected: number = 0;
  bsConfig: Partial<BsDatepickerConfig>;
  bsValueIni : Date = new Date();
  PagoDirecto: Boolean=false;

  @Input() public reference: any;
  @Input() public contractor: any;
  @ViewChild('desde') desde: any; //Pago directo
  @ViewChild('hasta') hasta: any; //Pago Directo

  constructor(private modalService: NgbModal, private clientInformationService: ClientInformationService,
    private CobranzasService: CobranzasService) {
      this.bsConfig = Object.assign({},{
        dateInputFormat: 'DD/MM/YYYY',
        locale: 'es',
        showWeekNumbers: false
      }
      );
     }

  ngOnInit() {


    this.cabRestriClient.chkEmision = false;
    this.cabRestriClient.chkInclusion = false;
    this.cabRestriClient.chkRenovacion = false;

    this.cabRestriClient.sinLimiteEmision = false;
    this.cabRestriClient.sinLimiteInclusion = false;
    this.cabRestriClient.sinLimiteRenovacion = false;

    if (this.contractor != null) {
      this.cabRestriClient = this.contractor;
      this.cabRestriClient.nroDocumento = this.contractor.documento;
      if (this.cabRestriClient.action === 2) {
        this.isDetail = true;
      }
      if(this.cabRestriClient.action==0){
         this.cabRestriClient.descripcion= this.contractor.razonSocial;
      }

    }
    this.getBranchList();
    this.getClientRestricList();
    this.getDocumentTypeList();
  }
  changeTypeRestric() {
    if (this.codRestricSelected == 2) {

            //console.log(this.cabRestriClient.action)
      if ((this.cabRestriClient.action == 1 || this.cabRestriClient.action == 0) && (this.contractor.idRamo == 73 || this.contractor.idRamo == 71)) {
      //console.log("entro")
          this.PagoDirecto = true;
          this.cabRestriClient.FDateInitPago = this.bsValueIni;
          this.cabRestriClient.FDateVigenPago=this.bsValueIni;
          this.cabRestriClient.chkPagoDirecto =this.PagoDirecto;
      } else{
        this.PagoDirecto=false;
      }
      if(  this.cabRestriClient.action==2 && this.contractor.idRamo==73 ){
        if(this.contractor.FInitPago!="NO APLICA" && this.contractor.FVigenPago!="NO APLICA"){
          this.PagoDirecto =true;
          let dateMomentObjectInit = moment(this.contractor.FInitPago, "DD/MM/YYYY");
          let dateObjectInit = dateMomentObjectInit.toDate();

          let dateMomentObjectVigen = moment(this.contractor.FVigenPago, "DD/MM/YYYY");
          let dateObjectVigen = dateMomentObjectVigen.toDate();

          this.cabRestriClient.FDateInitPago =dateObjectInit;
          this.cabRestriClient.FDateVigenPago=dateObjectVigen;
          this.cabRestriClient.chkPagoDirecto =this.PagoDirecto;

        } else{
          this.PagoDirecto =true;
          //this.cabRestriClient.chkPagoDirecto =this.PagoDirecto;
        }

      }
      this.isPrivilegios = true;
    } else {
      this.isPrivilegios = false;
    }

  }
  textValidate(event: any, tipoTexto) {
    CommonMethods.textValidate(event, tipoTexto);
  }

  SaveRestricClient() {
    if (this.codBranchSelected == null || this.codBranchSelected == 0) {
      this.alertMessage('Debe seleccionar el ramo', 'warning');
      return;
    }
    // if (this.codProductSelected == null || this.codProductSelected == 0) {
    //   this.alertMessage('Debe seleccionar el producto', 'warning');
    //   return;
    // } // JDD ACC PERSONALES
    if (this.codRestricSelected == null || this.codRestricSelected == 0) {
      this.alertMessage('Debe seleccionar el tipo de restricción', 'warning');
      return;
    }
    if (this.codTipoDocumentSelected == null) {
      this.alertMessage('Debe seleccionar el tipo de documento', 'warning');
      return;
    }
    if (this.cabRestriClient.nroDocumento == '' || this.cabRestriClient.nroDocumento == null) {
      this.alertMessage('Debe ingresar el numero de documento ', 'warning');
      return;
    }
    if (this.cabRestriClient.descripcion == '' || this.cabRestriClient.descripcion == null) {
       let msg = this.codBranchSelected==73 ? 'razón social':'descripción';
      this.alertMessage('Debe ingresar una ' +msg, 'warning');
      return;
    }

    if (this.codRestricSelected == 2 && this.cabRestriClient.chkRenovacion !== true && this.cabRestriClient.chkEmision !== true && this.cabRestriClient.chkInclusion !== true) {
      this.alertMessage('Debe seleccionar una transación', 'warning');
      return;
    }
    if (this.cabRestriClient.observacion == '' || this.cabRestriClient.observacion == null) {
      this.alertMessage('Debe ingresar un comentario', 'warning');
      return;
    }

    if (this.cabRestriClient.chkEmision == true) {
      if ((this.cabRestriClient.diasEmision === '' || this.cabRestriClient.diasEmision === undefined)) {
        this.alertMessage('Debe ingresar el dia de emisión ', 'warning');
        return;
      }

    }
    if (this.cabRestriClient.chkInclusion == true && (this.cabRestriClient.diasInclusion === '' || this.cabRestriClient.diasInclusion === undefined)) {
      this.alertMessage('Debe ingresar el dia de inclusión ', 'warning');
      return;
    }
    if (this.cabRestriClient.chkRenovacion == true && (this.cabRestriClient.diasRenovacion === '' || this.cabRestriClient.diasRenovacion === undefined)) {
      this.alertMessage('Debe ingresar el dia de renovación ', 'warning');
      return;
    }
   
    let params: any = {};
    params.idRamo = this.codBranchSelected;
    params.idProducto = 0; // this.codProductSelected; // JDD AP
    params.idTipoDocumento = this.codTipoDocumentSelected;
    params.nroDocumento = this.cabRestriClient.nroDocumento;
    params.descripcion = this.cabRestriClient.descripcion;
    params.observacion = this.cabRestriClient.observacion;
    params.idRestric = this.codRestricSelected;
    params.usercode = JSON.parse(localStorage.getItem("currentUser"))["id"];
    params.indEstado = this.cabRestriClient.action;
    params.daysCreditEmi = (this.cabRestriClient.chkEmision == true ? this.cabRestriClient.diasEmision : null);
    params.daysCreditInc = (this.cabRestriClient.chkInclusion == true ? this.cabRestriClient.diasInclusion : null);
    params.daysCreditRen = (this.cabRestriClient.chkRenovacion == true ? this.cabRestriClient.diasRenovacion : null);
    params.FDateInitPago = (this.cabRestriClient.chkPagoDirecto == true && this.codRestricSelected==2 ? this.cabRestriClient.FDateInitPago : null);
    params.FDateVigenPago = (this.cabRestriClient.chkPagoDirecto == true && this.codRestricSelected==2? this.cabRestriClient.FDateVigenPago : null);

    this.CobranzasService.InsertClientRestric(params).subscribe(
      res => {
        if (res.P_NCODE == "0") {
          swal.fire({
            title: "Información",
            text: "Se guardo la restricción correctamente",
            icon: "success",
            confirmButtonText: "OK",
            allowOutsideClick: false,
          }).then((result) => {
            this.reference.close();
          });
        } else {
          swal.fire({
            title: "Información",
            text: res.P_SMESSAGE,
            icon: "error",
            confirmButtonText: "OK",
            allowOutsideClick: false,
          });
        }

      },
      err => {
      }
    );


  }


  ChangeInputDias(tipo) {
    if (tipo == 3) {
      if (this.cabRestriClient.sinLimiteRenovacion == true) {
        this.cabRestriClient.diasRenovacion = 0;
      } else {
        this.cabRestriClient.diasRenovacion = '';
      }
    }
    if (tipo == 2) {
      if (this.cabRestriClient.sinLimiteInclusion == true) {
        this.cabRestriClient.diasInclusion = 0;
      } else {
        this.cabRestriClient.diasInclusion = '';
      }
    }
    if (tipo == 1) {
      if (this.cabRestriClient.sinLimiteEmision == true) {
        this.cabRestriClient.diasEmision = 0;
      } else {
        this.cabRestriClient.diasEmision = '';
      }
    }
  }
  ChangeInputInd(tipo) {
    if (tipo == 3) {
      if (this.cabRestriClient.chkRenovacion == false) {
        this.cabRestriClient.sinLimiteRenovacion = false;
        this.cabRestriClient.diasRenovacion = '';
      }
    }
    if (tipo == 2) {
      if (this.cabRestriClient.chkInclusion == false) {
        this.cabRestriClient.sinLimiteInclusion = false;
        this.cabRestriClient.diasInclusion = '';
      }
    }
    if (tipo == 1) {
      if (this.cabRestriClient.chkEmision == false) {
        this.cabRestriClient.sinLimiteEmision = false;
        this.cabRestriClient.diasEmision = '';
      }
    }
  }

  ActivarPagoDirecto(event: any){
    if (event.target.checked){

      this.cabRestriClient.chkPagoDirecto = true;
      this.cabRestriClient.FDateInitPago = this.bsValueIni;
      this.cabRestriClient.FDateVigenPago=this.bsValueIni;

    } else {
      this.cabRestriClient.chkPagoDirecto=false;
      this.cabRestriClient.FDateInitPago = null;
      this.cabRestriClient.FDateVigenPago=null;
    }
  }
  validar(event: any){

  }
  getBranchList() {
    this.clientInformationService.getBranch().subscribe(
      res => {
        this.branchList = res;
        if (this.contractor != null) {
          this.codBranchSelected = this.contractor.idRamo;
          this.getProductsListByBranch();
        }
      },
      err => {
      }
    );
  }
  getDocumentTypeList() {
    this.clientInformationService.getDocumentTypeList(0).subscribe(
      res => {
        this.documentTypeList = res;
        this.codTipoDocumentSelected = this.cabRestriClient.idTipoDocumento;
      },
      err => {
        swal.fire("Información", "Error inesperado, contáctese con soporte.", "warning");
      }
    );
  }

  getClientRestricList() {
    this.CobranzasService.getListRestric().subscribe(
      res => {
        this.restricList = res;
        if (this.contractor != null && this.contractor.action !== 0) {
          this.codRestricSelected = this.contractor.idRestriccion;
          this.changeTypeRestric();
          let params: any = {};
          if (this.codRestricSelected == 2) {
            params.idTipoDocumento = this.contractor.idTipoDocumento;
            params.nroDocumento = this.contractor.documento;
            params.idRamo = this.contractor.idRamo;
            this.CobranzasService.getPrivilegiosClient(params).subscribe(
              res => {
                this.privilegiosList = res;
                this.privilegiosList.forEach((element) => {
                  if (element.tipoDetRestric == "1") {
                    if (element.indNoLimit == "0") {
                      this.cabRestriClient.chkEmision = true;
                      this.cabRestriClient.sinLimiteEmision = true;
                      this.cabRestriClient.diasEmision = element.creditDias;
                    } else {
                      this.cabRestriClient.chkEmision = true;
                      this.cabRestriClient.diasEmision = element.creditDias;
                    }
                  }

                  if (element.tipoDetRestric == "2") {
                    if (element.indNoLimit == "0") {
                      this.cabRestriClient.chkInclusion = true;
                      this.cabRestriClient.sinLimiteInclusion = true;
                      this.cabRestriClient.diasInclusion = element.creditDias;
                    } else {
                      this.cabRestriClient.chkInclusion = true;
                      this.cabRestriClient.diasInclusion = element.creditDias;
                    }
                  }


                  if (element.tipoDetRestric == "3") {
                    if (element.indNoLimit == "0") {
                      this.cabRestriClient.chkRenovacion = true;
                      this.cabRestriClient.sinLimiteRenovacion = true;
                      this.cabRestriClient.diasRenovacion = element.creditDias;
                    } else {
                      this.cabRestriClient.chkRenovacion = true;
                      this.cabRestriClient.diasRenovacion = element.creditDias;
                    }
                  }
                });
              },
              err => {
              }
            );
          }
        }
      },
      err => {
      }
    );
  }
  onSelectBranch() {
    this.getProductsListByBranch();
    if(this.cabRestriClient.action==0 && this.codBranchSelected==73)
    {
      this.PagoDirecto=true;
      this.cabRestriClient.FDateInitPago = this.bsValueIni;
      this.cabRestriClient.FDateVigenPago=this.bsValueIni;
      this.cabRestriClient.chkPagoDirecto =this.PagoDirecto;
    }

  }


  getProductsListByBranch() {
    this.clientInformationService.getProductsListByBranch(this.codBranchSelected.toString()).subscribe(
      res => {
        this.productList = res;
        if (this.contractor != null) {
          this.codProductSelected = this.contractor.idProducto;
        }

      },
      err => {
      }
    );
  }


  alertMessage(message, type) {
    swal
      .fire({
        title: "Información",
        text: message,
        icon: type,
        confirmButtonText: "OK",
        allowOutsideClick: false,
      })
  }




}
