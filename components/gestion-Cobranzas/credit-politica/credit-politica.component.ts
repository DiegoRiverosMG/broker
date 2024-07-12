import { Component, OnInit } from '@angular/core';
import { CreditViewComponent } from '../credit-view/credit-view.component';
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { ClientInformationService } from '../../../services/shared/client-information.service';
import { CobranzasService } from '../../../services/cobranzas/cobranzas.service';
import { BsDatepickerConfig } from 'ngx-bootstrap/datepicker';
import * as moment from 'moment';
import swal from "sweetalert2";
@Component({
  selector: 'app-credit-politica',
  templateUrl: './credit-politica.component.html',
  styleUrls: ['./credit-politica.component.css']
})
export class CreditPoliticaComponent implements OnInit {
  listToShow: any = [];
  branchList: any = [];
  productList: any = [];
  currentPage = 1;
  rotate = true;
  maxSize = 5;
  itemsPerPage = 8;
  bsConfig: Partial<BsDatepickerConfig>;
  totalItems = 0;
  isLoading: boolean = false;
  bsValueIni: Date = new Date();
  listPolicieCredit: any = [];
  codBranchSelected: number = 0;
  desBranchSelected: string;
  desProductSelected: string;
  codProductSelected: number = 0;
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

  ngOnInit() {
    this.getBranchList();
  }

  onSelectBranch() {
    this.getProductsListByBranch();
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


  DeleteCredit(item) {

    swal.fire({
      title: "Información",
      text: "¿Esta seguro de eliminar el registro?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: 'Sí',
      allowOutsideClick: false,
      cancelButtonText: 'No'
    })
      .then((result) => {
        if (result.value) {
          let params: any = {};
          params.idPolicyCredit = item.idPolicyCredit;
          params.fechaAnulacion = moment(new Date()).format('DD/MM/YYYY');
          params.usercode = JSON.parse(localStorage.getItem("currentUser"))["id"];
          params.montoMinimo = item.montoMinimo;
          params.montoMaximo = item.montoMaximo;
          params.idRamo = item.idRamo;
          params.idProduct = item.idProduct;
          this.CobranzasService.InsertCreditPolicie(params).subscribe(
            res => {
              if (res.P_NCODE == "0") {
                swal.fire({
                  title: "Información",
                  text: "Se elimino correctamente el registro",
                  icon: "success",
                  confirmButtonText: "OK",
                  allowOutsideClick: false,
                }).then((result) => {
                  this.GetListPolicieCredit();
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
      );
  }

  GetListPolicieCredit() {
        if (this.codBranchSelected == null) {
      this.alertMessage('Debe seleccionar el ramo', 'error');
      return;
    }
        if (this.codProductSelected == null) {
      this.alertMessage('Debe seleccionar el producto', 'error');
      return;
    }

    this.listToShow = [];
    this.listPolicieCredit = [];

    this.isLoading = true;
    this.currentPage = 1;
    this.rotate = true;
    this.maxSize = 5;
    this.itemsPerPage = 5;
    this.totalItems = 0;

    let data: any = {};

    let dayIni =
      this.bsValueIni.getDate() < 10
        ? "0" + this.bsValueIni.getDate()
        : this.bsValueIni.getDate();
    let monthPreviewIni = this.bsValueIni.getMonth() + 1;
    let monthIni =
      monthPreviewIni < 10 ? "0" + monthPreviewIni : monthPreviewIni;
    let yearIni = this.bsValueIni.getFullYear();

    let params: any = {};
    params.idPolicyCredit = 0;
    params.idRamo = this.codBranchSelected;
    params.idProducto = this.codProductSelected;
    params.fechaEfecto = dayIni + "/" + monthIni + "/" + yearIni;
    params.usercode = JSON.parse(localStorage.getItem("currentUser"))["id"];


    this.CobranzasService.getListCreditPolicie(params).subscribe(
      (res) => {
        this.listPolicieCredit = res;
        this.totalItems = this.listPolicieCredit.length;
        this.listToShow = this.listPolicieCredit.slice(
          (this.currentPage - 1) * this.itemsPerPage,
          this.currentPage * this.itemsPerPage
        );
        if (this.listPolicieCredit.length === 0) {
          swal
            .fire({
              title: "Información",
              text: "No se encuentran politicas de crédito",
              icon: "error",
              confirmButtonText: "OK",
              allowOutsideClick: false,
            })
            .then((result) => {
              if (result.value) {
              }
            });
        }
        this.isLoading = false;
      },
      (err) => {
        this.isLoading = false;
      }
    );
  }

  getBranchList() {
    this.clientInformationService.getBranch().subscribe(
      res => {
        this.branchList = res;
      },
      err => {
      }
    );
  }

  getProductsListByBranch() {
    this.clientInformationService.getProductsListByBranch(this.codBranchSelected.toString()).subscribe(
      res => {
        this.productList = res;
      },
      err => {
      }
    );
  }

  pageChanged(currentPage) {
    this.currentPage = currentPage;
    this.listToShow = this.listPolicieCredit.slice(
      (this.currentPage - 1) * this.itemsPerPage,
      this.currentPage * this.itemsPerPage
    );
  }

  openModalCreditView(item: any) {
    const modalRef = this.modalService.open(CreditViewComponent, {
      size: "xl",
      backdropClass: "light-blue-backdrop",
      backdrop: "static",
      keyboard: false,
    });
    modalRef.componentInstance.reference = modalRef;
    modalRef.componentInstance.contractor = item;

    modalRef.result.then(
      () => {
        this.GetListPolicieCredit();
      },
      (reason) => { }
    );
  }



}
