import { Component, OnInit } from '@angular/core';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { ParameterSettingsService } from '@root/layout/broker/services/maintenance/parameter-settings.service';
import { ClientInformationService } from '@root/layout/broker/services/shared/client-information.service';
import Swal from 'sweetalert2';
import { EditPorcentajeComponent } from '../edit-porcentaje/edit-porcentaje.component';
import { HistorialPorcentajeRmvComponent } from '../historial-porcentaje-rmv/historial-porcentaje-rmv.component';

@Component({
  selector: 'app-settings-rmv',
  templateUrl: './settings-rmv.component.html',
  styleUrls: ['./settings-rmv.component.css']
})
export class SettingsRmvComponent implements OnInit {

  codProducto = JSON.parse(localStorage.getItem('codProducto'))['productId'];
  epsItem = JSON.parse(localStorage.getItem('eps'));
  filters: any = {
    NBRANCH: 0,
    NPRODUCT: 0,
    NTYPE_TRANSAC: 0,
    NMODULEC: 0
  }

  branchList: any[] = []
  productList: any[] = []
  transactionList: any[] = [];
  riesgosList: any[] = [];
  parameterListToShow: any[] = []
  foundResults: any[] = [];
  currentPage = 1; //página actual
  rotate = true; //
  maxSize = 5; // cantidad de paginas que se mostrarán en el paginado
  itemsPerPage = 5; // limite de items por página
  totalItems = 0; //total de items encontrados

  constructor(private clientInformationService: ClientInformationService, private parameterSettingsService: ParameterSettingsService, private modalService: NgbModal) { }

  ngOnInit(): void {
    this.getBranchList();
  }

  async getBranchList() {
    this.clientInformationService.getBranches(this.codProducto, this.epsItem.NCODE).subscribe(res => {
      this.branchList = res
      this.filters.NBRANCH = this.branchList[0].NBRANCH
      this.getProductListByBranch();
    }, err => { console.log(err) })
  }

  async getProductListByBranch() {
    this.clientInformationService.getProductList(this.codProducto, this.epsItem.NCODE, this.filters.NBRANCH).subscribe(
      async res => {
        this.productList = res;
        this.filters.NPRODUCT = this.productList[0].COD_PRODUCT;
        await this.getTransactionsByProduct();
        // await this.getUserAccess();
      },
      err => { console.log(err) }
    )
  }
  async getTransactionsByProduct() {
    let data: any = { nBranch: this.filters.NBRANCH, nProduct: this.filters.NPRODUCT }
    this.parameterSettingsService.getTransactionsByProduct(data).subscribe(
      res => {
        //1: EMISION 2:INCLUSION 4: RENOVACION 11: DECLARACION 8:ENDOSO
        this.transactionList = res.filter(x => x.NTYPE_TRANSAC != 3 && x.NTYPE_TRANSAC != 12);
        this.getTiposRiesgo()
      },
      err => { console.log(err) }
    )
  }

  async getTiposRiesgo() {
    let data: any = { NBRANCH: this.filters.NBRANCH, NPRODUCT: this.filters.NPRODUCT }
    this.parameterSettingsService.getTiposRiesgo(data).subscribe(
      res => {
        this.riesgosList = res
      },
      err => { console.log(err) }
    )
  }

  async search() {
    let data: any = { NBRANCH: this.filters.NBRANCH, NTYPE_TRANSAC: this.filters.NTYPE_TRANSAC, NMODULEC: this.filters.NMODULEC }
    this.parameterSettingsService.GetRmvPorcentaje(data).subscribe(
      res => {
        this.foundResults = res
        if (this.foundResults != null && this.foundResults.length > 0) {
          this.totalItems = this.foundResults.length;
          this.parameterListToShow = this.foundResults.slice(((this.currentPage - 1) * this.itemsPerPage), (this.currentPage * this.itemsPerPage));
        }
        else {
          this.totalItems = 0;
          Swal.fire('Información', "No se encontraron resultados", 'warning');
          this.foundResults = [];
          this.parameterListToShow = []
        }
      },
      err => { console.log(err) }
    )
  }

  mostrarMas() {
    this.currentPage = 1;
    this.parameterListToShow = this.foundResults.slice(((this.currentPage - 1) * this.itemsPerPage), (this.currentPage * this.itemsPerPage));
  }

  pageChanged(page: number) {
    this.currentPage = page;
    this.parameterListToShow = this.foundResults.slice(((this.currentPage - 1) * this.itemsPerPage), (this.currentPage * this.itemsPerPage));
  }

  editPorcentaje(param: any) {
    let modalRef: NgbModalRef;
    let data: any = {};
    data.RAMO = param.RAMO;
    data.TIPO_TRANSACCION = param.TIPO_TRANSACCION;
    data.TIPO_TRABAJADOR = param.TIPO_TRABAJADOR;
    data.PORCENTAJE = param.PORCENTAJE;
    data.RMV = param.RMV;
    data.NBRANCH = param.NBRANCH;
    data.NTYPE_TRANSAC = param.NTYPE_TRANSAC;
    data.NMODULEC = param.NMODULEC;
    data.PORCENTAJE_RMV = param.PORCENTAJE_RMV;
    data.VALOR_PORCENTAJE = param.VALOR_PORCENTAJE;
    modalRef = this.modalService.open(EditPorcentajeComponent, {
      size: 'lg', windowClass: 'modalParam', backdropClass: 'light-blue-backdrop', backdrop: 'static',
      keyboard: false
    });

    modalRef.componentInstance.reference = modalRef;
    modalRef.componentInstance.data = data;
    modalRef.result.then((result) => {
      if(result != undefined && result != null){
        let data: any = { NBRANCH: this.filters.NBRANCH, NTYPE_TRANSAC: this.filters.NTYPE_TRANSAC, NMODULEC: this.filters.NMODULEC }
        this.parameterSettingsService.GetRmvPorcentaje(data).subscribe(
          res => {
            this.foundResults = res;
            this.totalItems = this.foundResults.length;
            this.parameterListToShow = this.foundResults.slice(((this.currentPage - 1) * this.itemsPerPage), (this.currentPage * this.itemsPerPage));
          },
          err => {
            console.log(err)
          }
        )
      }
    })
  }

  historialPorcentaje(param: any){
    let modalRef: NgbModalRef;
    let data: any = {};
    data.RAMO = param.RAMO;
    data.TIPO_TRANSACCION = param.TIPO_TRANSACCION;
    data.TIPO_TRABAJADOR = param.TIPO_TRABAJADOR;
    data.PORCENTAJE = param.PORCENTAJE;
    data.RMV = param.RMV;
    data.NBRANCH = param.NBRANCH;
    data.NTYPE_TRANSAC = param.NTYPE_TRANSAC;
    data.NMODULEC = param.NMODULEC;
    data.PORCENTAJE_RMV = param.PORCENTAJE_RMV;
    data.VALOR_PORCENTAJE = param.VALOR_PORCENTAJE;
    modalRef = this.modalService.open(HistorialPorcentajeRmvComponent, {
      size: 'lg', windowClass: 'modalParam', backdropClass: 'light-blue-backdrop', backdrop: 'static',
      keyboard: false
    });

    modalRef.componentInstance.reference = modalRef;
    modalRef.componentInstance.data = data;
  }

}