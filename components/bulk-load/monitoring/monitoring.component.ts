import { Component, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { MonitoringViewComponent } from '../monitoring-view/monitoring-view.component';
import { LoadMassiveService } from '../../../services/LoadMassive/load-massive.service';
import { BsDatepickerConfig } from 'ngx-bootstrap/datepicker';
import swal from 'sweetalert2';
@Component({
  selector: 'app-monitoring',
  templateUrl: './monitoring.component.html',
  styleUrls: ['./monitoring.component.css'],
})
export class MonitoringComponent implements OnInit {
  listToShow: any = [];
  processHeaderList: any = [];
  listRamo: any = [];
  listProduct: any = [];
  currentPage = 1;
  rotate = true;
  idProduct: any = '';
  idRamo: any = '';
  maxSize = 10;
  itemsPerPage = 5;
  totalItems = 0;
  isLoading: boolean = false;
  bsConfig: Partial<BsDatepickerConfig>;
  bsValueIni: Date = new Date();
  bsValueFinMax: Date = new Date();
  constructor(
    private modalService: NgbModal,
    private MassiveService: LoadMassiveService
  ) {
    this.bsConfig = Object.assign(
      {},
      {
        dateInputFormat: 'DD/MM/YYYY',
        locale: 'es',
        showWeekNumbers: false,
      }
    );
  }

  ngOnInit() {
    this.getBranchList();
  }

  getBranchList() {
    this.MassiveService.GetBranchList().subscribe(
      (res) => {
        this.listRamo = res;
      },
      (err) => {}
    );
  }

  getProductsListByBranch(idRamo: any) {
    this.MassiveService.GetProductsList(idRamo).subscribe(
      (res) => {
        this.listProduct = res;
      },
      (err) => {}
    );
  }

  ChangeRamo() {
    if (this.idRamo !== '') {
      this.getProductsListByBranch(this.idRamo);
    }
  }

  OpenMovimiento(item: any) {
    const modalRef = this.modalService.open(MonitoringViewComponent, {
      size: 'xl',
      backdropClass: 'light-blue-backdrop',
      backdrop: 'static',
      keyboard: false,
    });
    modalRef.componentInstance.reference = modalRef;
    modalRef.componentInstance.contractor = item;

    modalRef.result.then(
      (Interval) => {
        this.currentPage = 1;
        clearInterval(Interval);
        this.GetProcessHeader();
      },
      (reason) => {}
    );
  }

  GetProcessHeader() {
    this.listToShow = [];
    this.processHeaderList = [];

    this.isLoading = true;
    this.currentPage = 1;
    this.rotate = true;
    this.maxSize = 5;
    this.itemsPerPage = 5;
    this.totalItems = 0;

    let data: any = {};

    let dayIni =
      this.bsValueIni.getDate() < 10
        ? '0' + this.bsValueIni.getDate()
        : this.bsValueIni.getDate();
    let monthPreviewIni = this.bsValueIni.getMonth() + 1;
    let monthIni =
      monthPreviewIni < 10 ? '0' + monthPreviewIni : monthPreviewIni;
    let yearIni = this.bsValueIni.getFullYear();

    data.P_NBRANCH = this.idRamo === '' ? 0 : this.idRamo;
    data.P_DEFFECDATE = dayIni + '/' + monthIni + '/' + yearIni;
    data.P_NPRODUCT = this.idProduct === '' ? 0 : this.idProduct;

    this.MassiveService.GetHeaderProcess(data).subscribe(
      (res) => {
        this.processHeaderList = res;
        this.totalItems = this.processHeaderList.length;
        this.listToShow = this.processHeaderList.slice(
          (this.currentPage - 1) * this.itemsPerPage,
          this.currentPage * this.itemsPerPage
        );
        if (this.processHeaderList.length === 0) {
          swal
            .fire({
              title: 'Información',
              text: 'No se encuentran procesos con la fecha ingresada.',
              icon: 'error',
              confirmButtonText: 'OK',
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

  pageChanged(currentPage) {
    this.currentPage = currentPage;
    this.listToShow = this.processHeaderList.slice(
      (this.currentPage - 1) * this.itemsPerPage,
      this.currentPage * this.itemsPerPage
    );
  }
}
