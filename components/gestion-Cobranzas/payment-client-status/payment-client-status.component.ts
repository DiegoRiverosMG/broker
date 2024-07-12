import { Component, OnInit } from '@angular/core';
import { CreditViewComponent } from '../credit-view/credit-view.component';
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { BsDatepickerConfig } from 'ngx-bootstrap/datepicker';
import { ClientInformationService } from '../../../services/shared/client-information.service';
import { CobranzasService } from '../../../services/cobranzas/cobranzas.service';
import { PaymentClentViewComponent } from '../../../components/gestion-Cobranzas/payment-clent-view/payment-clent-view.component'
import swal from "sweetalert2";
import { CommonMethods } from './../../common-methods';

@Component({
  selector: 'app-payment-client-status',
  templateUrl: './payment-client-status.component.html',
  styleUrls: ['./payment-client-status.component.css']
})
export class PaymentClientStatusComponent implements OnInit {
  contractorDocumentMaxLength: number;
  listToShow: any = [];
  branchList: any = [];
  productList: any = [];
  listClientRestric: any = [];
  public documentTypeList: any = [];
  currentPage = 1;
  rotate = true;
  maxSize = 5;
  itemsPerPage = 8;
  maxlength: number = 11;
  minlength: number = 11;
  codProducto = JSON.parse(localStorage.getItem('codProducto'))['productId']
  totalItems = 0;
  isLoading: boolean = false;
  codBranchSelected: number = 0;
  codTipoDocumentSelected: number = 0;
  nroDocumento: string;
  desBranchSelected: string;
  desProductSelected: string;
  codProductSelected: number = 0;
  constructor(private modalService: NgbModal,
    private clientInformationService: ClientInformationService, private CobranzasService: CobranzasService) { }

  ngOnInit() {
    this.getBranchList();
    this.getDocumentTypeList();
  }
  getDocumentTypeList() {
    this.clientInformationService.getDocumentTypeList(0).subscribe(
      res => {
        this.documentTypeList = res;
      },
      err => {
        swal.fire("Información", "Error inesperado, contáctese con soporte.", "warning");
      }
    );
  }

  pageChanged(currentPage) {
    this.currentPage = currentPage;
    this.listToShow = this.listClientRestric
      .slice(
        (this.currentPage - 1) * this.itemsPerPage,
        this.currentPage * this.itemsPerPage
      );
  }

  onDeleteRestricClient(item) {
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
          this.isLoading = true;
          let params: any = {};
          params.idRamo = item.idRamo;
          params.idProducto = item.idProducto;
          params.idTipoDocumento = item.idTipoDocumento;
          params.nroDocumento = item.documento.toUpperCase();
          params.idRestric = item.idRestriccion;
          params.usercode = JSON.parse(localStorage.getItem("currentUser"))["id"];
          params.indEstado = 4;

          this.CobranzasService.InsertClientRestric(params).subscribe(
            res => {
              this.isLoading = false;
              if (res.P_NCODE == "0") {
                swal.fire({
                  title: "Información",
                  text: "Se eliminó correctamente el registro",
                  icon: "success",
                  confirmButtonText: "OK",
                  allowOutsideClick: false,
                }).then((result) => {
                  this.ListClientRestric();
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
              this.isLoading = false;
            }
          );

        }
      });
  }

  ListClientRestric() {

    if (this.codBranchSelected == null) {
      this.alertMessage('Debe seleccionar el ramo', 'error');
      return;
    }
    if (this.codProductSelected == null) {
      this.alertMessage('Debe seleccionar el producto', 'error');
      return;
    }
    if (this.codTipoDocumentSelected == null || this.codTipoDocumentSelected == 0) {
      this.alertMessage('Debe seleccionar el tipo de documento', 'error');
      return;
    }
    if (this.nroDocumento != undefined && this.nroDocumento != '' &&
    this.nroDocumento.length < this.minlength) {
      this.alertMessage('El número de documento debe tener mínimo ' + this.minlength + ' carácteres', 'error');
      return;
    }

    let params: any = {};
    params.idRamo = this.codBranchSelected;
    this.isLoading = true;
    params.idProducto = this.codProductSelected;
    params.idTipoDocumento = this.codTipoDocumentSelected;
    params.nroDocumento = this.nroDocumento;

    this.CobranzasService.getListClientRestric(params).subscribe(
      (res) => {
        this.isLoading = false;
        this.listClientRestric = res;
        if (res.length == 0 && this.nroDocumento != undefined) {
          if (this.nroDocumento.length > 0) { this.CreatClientRestric(); }
        } else {
          if (res.length > 0) {

            this.totalItems = this.listClientRestric.length;
            this.listToShow = this.listClientRestric.slice(
              (this.currentPage - 1) * this.itemsPerPage,
              this.currentPage * this.itemsPerPage
            );
          } else {
            this.alertMessage('No se encontró resultados', 'warning');
          }
        }


      },
      (err) => {
        this.isLoading = false;
      }
    );

  }

  openModalCreditView(item: any, action: number) {
    item.action = action;
    const modalRef = this.modalService.open(PaymentClentViewComponent, {
      size: "xl",
      backdropClass: "light-blue-backdrop",
      backdrop: "static",
      keyboard: false,
    });
    modalRef.componentInstance.reference = modalRef;
    modalRef.componentInstance.contractor = item;

    modalRef.result.then(
      () => {
        this.ListClientRestric();
      },
      (reason) => { }
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


  CreatClientRestric() {
    swal.fire({
      title: "Información",
      text: "¿No se encontro el documento ingresado, desea registrarlo?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: 'Sí',
      allowOutsideClick: false,
      cancelButtonText: 'No'
    })
      .then((result) => {
        if (result.value) {
          let item: any = {};
          item.idTipoDocumento = this.codTipoDocumentSelected;
          item.documento = this.nroDocumento;
          item.idRamo = this.codBranchSelected;
          this.isLoading=true;

        this.CobranzasService.getClientInfoList(item).subscribe(
           (res) =>{
              this.isLoading=false;
               item.razonSocial=res[0].razonSocial;
              this.openModalCreditView(item, 0);
            },

            (err) => {

              this.isLoading = false;
            }
          );
        }
      });
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
  onSelectBranch() {
    this.getProductsListByBranch();
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

  textValidate(event: any, tipoTexto) {
    CommonMethods.textValidate(event, tipoTexto);
  }

  seltipoDocumento() {
    this.nroDocumento = "";
    const response = CommonMethods.selTipoDocumento(this.codTipoDocumentSelected);
    this.maxlength = response.maxlength;
    this.minlength = response.minlength;
  }
  validarNroDocumento(event: any, tipoDocumento) {
    CommonMethods.validarNroDocumento(event, tipoDocumento);
  }


}
