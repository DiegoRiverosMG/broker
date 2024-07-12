import { Component, OnInit, Input, ViewChild } from "@angular/core";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { BsDatepickerConfig } from 'ngx-bootstrap/datepicker';
import { CommonMethods } from './../../common-methods';
import swal from "sweetalert2";
import { ClientInformationService } from '../../../services/shared/client-information.service';
import { CobranzasService } from '../../../services/cobranzas/cobranzas.service';
import * as moment from 'moment';

@Component({
  selector: 'app-credit-view',
  templateUrl: './credit-view.component.html',
  styleUrls: ['./credit-view.component.css']
})
export class CreditViewComponent implements OnInit {
  listToShow: any = [];
  bsConfig: Partial<BsDatepickerConfig>;
  branchList: any = [];
  riskList: any = [];
  productList: any = [];
  isDetail: boolean = false;
  codBranchSelected: number = 0;
  desBranchSelected: string;
  currentPage = 1;
  rotate = true;
  maxSize = 5;
  itemsPerPage = 8;
  totalItems = 0;
  isLoading: boolean = false;
  desProductSelected: string;
  codRiskSelected: number = 0;
  codProductSelected: number = 0;
  cabCreditView: any = {};
  bsValueIni: Date = new Date();
  pensionID = JSON.parse(localStorage.getItem("pensionID"))["id"]
  saludID = JSON.parse(localStorage.getItem("saludID"))["id"]
  vidaLeyID = JSON.parse(localStorage.getItem("vidaleyID"))["id"]
  perfil = JSON.parse(localStorage.getItem("perfilExterno"))
  codFlat = JSON.parse(localStorage.getItem("codigoFlat"))
  codProducto = JSON.parse(localStorage.getItem("codProducto"))["productId"]
  //epsItem = JSON.parse(sessionStorage.getItem("eps"))
  epsItem = JSON.parse(localStorage.getItem("eps"))
  lblProducto = ""
  lblFecha = ""
  variable: any = {}
  template: any = {}
  titleCredit: string;
  @Input() public reference: any;
  @Input() public contractor: any;


  constructor(private modalService: NgbModal, private clientInformationService: ClientInformationService, private CobranzasService: CobranzasService) {

    this.bsConfig = Object.assign(
      {},
      {
        dateInputFormat: 'DD/MM/YYYY',
        locale: 'es',
        showWeekNumbers: false
      }
    );

  }

  async ngOnInit() {

    // Configuracion del Template
    this.template = await CommonMethods.configuracionTemplate(this.codProducto, this.epsItem.NCODE);

    // Configuracion de las variables
    this.variable = await CommonMethods.configuracionVariables(this.codProducto, this.epsItem.NCODE);

    this.titleCredit = this.template.var_CreditView_Save;
    if (this.contractor != null) {
      this.isDetail = true;
      this.cabCreditView = this.contractor;
      let dateMomentObject = moment(this.cabCreditView.FechaEfecto, "DD/MM/YYYY");
      let dateObject = dateMomentObject.toDate();
      this.bsValueIni = dateObject;
      this.titleCredit = this.template.var_CreditView_Update;
    }


    this.getBranchList();
    this.getRiskList();

  }

  onSelectBranch() {
    this.getProductsListByBranch();

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



  getRiskList() {
    this.CobranzasService.getListRisk().subscribe(
      res => {
        this.riskList = res;
        if (this.contractor != null) {
          this.codRiskSelected = this.contractor.tipoRiesgo;
        }
      },
      err => {
      }
    );
  }


  getProductsListByBranch() {
    this.clientInformationService.getProductsListByBranch(this.codBranchSelected.toString()).subscribe(
      res => {
        this.productList = res;
        if (this.contractor != null) {
          this.codProductSelected = this.contractor.idProduct;
        }

      },
      err => {
      }
    );
  }
  textValidate(event: any, tipoTexto) {
    CommonMethods.textValidate(event, tipoTexto);
  }
  onSaveorEditCredit() {


    if (this.codBranchSelected == null || this.codBranchSelected == 0) {
      this.alertMessage('Debe seleccionar el ramo', 'warning');
      return;
    }
    if (this.codProductSelected == null || this.codProductSelected == 0) {
      this.alertMessage('Debe seleccionar el producto', 'warning');
      return;
    }
    if (this.codRiskSelected == null || this.codRiskSelected == 0) {
      this.alertMessage('Debe seleccionar el tipo de riesgo', 'warning');
      return;
    }
    if (this.cabCreditView.montoMinimo === undefined || this.cabCreditView.montoMinimo === '') {
      this.alertMessage('Debe ingresar un monto mÍnimo', 'warning');
      return;
    }
    if (this.cabCreditView.montoMaximo === undefined || this.cabCreditView.montoMaximo === '') {
      this.alertMessage('Debe ingresar un monto máximo', 'warning');
      return;
    }
    if (this.cabCreditView.diasCredito === undefined || this.cabCreditView.diasCredito === '') {
      this.alertMessage('Debe ingresar los dias de crédito', 'warning');
      return;
    }
    if (this.cabCreditView.description == null || this.cabCreditView.description == '') {
      this.alertMessage('Debe ingresar una descripción', 'warning');
      return;
    }

    let dayIni =
      this.bsValueIni.getDate() < 10
        ? "0" + this.bsValueIni.getDate()
        : this.bsValueIni.getDate();
    let monthPreviewIni = this.bsValueIni.getMonth() + 1;
    let monthIni =
      monthPreviewIni < 10 ? "0" + monthPreviewIni : monthPreviewIni;
    let yearIni = this.bsValueIni.getFullYear();

    let params: any = {};
    if (this.contractor == null) {
      params.idPolicyCredit = 0;
    } else {
      params.idPolicyCredit = this.contractor.idPolicyCredit;
    }

    params.tipoRiesgo = this.codRiskSelected;
    params.idRamo = this.codBranchSelected;
    params.idProduct = this.codProductSelected;
    params.description = this.cabCreditView.description;
    params.montoMaximo = this.cabCreditView.montoMaximo;
    params.montoMinimo = this.cabCreditView.montoMinimo;
    params.diasCredito = this.cabCreditView.diasCredito;
    params.FechaEfecto = dayIni + "/" + monthIni + "/" + yearIni;
    params.usercode = JSON.parse(localStorage.getItem("currentUser"))["id"];

    this.CobranzasService.InsertCreditPolicie(params).subscribe(
      res => {
        console.log(res);
        if (res.P_NCODE == "0") {
          swal.fire({
            title: "Información",
            text: "Se genero la política de crédito correctamente",
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

}
