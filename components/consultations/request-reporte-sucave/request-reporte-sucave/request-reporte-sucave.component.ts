import { Component, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { SucaveViewComponent } from "../request-reporte-sucave-view/request-reporte-sucave-view.component";
import { ReporteSucaveService } from '../../../../services/report/reporte-sucave.service';
// import { LoadSucaveService } from '../../../services/LoadSucave/load-sucave.service';
import { BsDatepickerConfig } from 'ngx-bootstrap/datepicker';
import { GlobalValidators } from '../../../global-validators';
import Swal from 'sweetalert2';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import swal from 'sweetalert2';
@Component({
  selector: 'app-request-reporte-sucave',
  templateUrl: './request-reporte-sucave.component.html',
  styleUrls: ['./request-reporte-sucave.component.css'],
})
export class RequestReporteSucaveComponent implements OnInit {
  listToShow: any = [];
  processHeaderList: any = [];
  branchTypeList: any = [];
  productTypeList: any = [];
  currentPage = 1;
  rotate = true;
  idProduct: any = '';
  idRamo: any = '';
  maxSize = 10;
  itemsPerPage = 5;
  totalItems = 0;
  isLoading: boolean = false;
  isValidatedInClickButton: boolean = false;
  bsConfig: Partial<BsDatepickerConfig>;
  filterForm: FormGroup;
  bsValueIni: Date = new Date();
  bsValueFin: Date = new Date();
  bsValueFinMax: Date = new Date();

  constructor(
    private formBuilder: FormBuilder,
    private modalService: NgbModal,
    private reporteSucaveService: ReporteSucaveService
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
    this.createForm();
    this.initializeForm();
    this.filterForm.controls.branch.setValue(77);
    this.filterForm.controls.product.setValue(0);
    this.getBranchList();
    this.getProductsListByBranch(this.filterForm.value);

    this.bsValueIni = new Date(this.bsValueIni.getFullYear(), this.bsValueIni.getMonth(), 1);
  }

  private initializeForm(): void {
    // this.filterForm.controls.branch.setValue('66');
    this.filterForm.controls.startDate.setValue(this.bsValueIni);
    this.filterForm.controls.endDate.setValue(this.bsValueFin);
    this.filterForm.setValidators([GlobalValidators.dateSort]);
  }

  private createForm(): void {
    this.filterForm = this.formBuilder.group({
      branch: [77],
      product: [0],
      startDate: ['', [Validators.required, GlobalValidators.notValidDate, GlobalValidators.tooOldDateValidator]],
      endDate: ['', [Validators.required, GlobalValidators.notValidDate, GlobalValidators.tooOldDateValidator]]
    });
  }

  getBranchList() {
    this.reporteSucaveService.getBranchTypesList().subscribe(
      (res) => {
        this.branchTypeList = res;
      },
      (err) => {Swal.fire('Información', 'Ha ocurrido un error al traer los ramos', 'error');  }
    );
  }

  getProductsListByBranch(idRamo: any) {
    this.reporteSucaveService.getProductTypesList(idRamo).subscribe(
      (res) => {
        this.productTypeList = res;
      },
      (err) => {Swal.fire('Información', 'Ha ocurrido un error al traer los productos', 'error'); }
    );
  }

  ChangeRamo() {
    this.filterForm.controls.product.setValue(0);
    this.getProductsListByBranch(this.filterForm.value);
  }

  OpenMovimiento(item: any) {
    const modalRef = this.modalService.open(SucaveViewComponent, {
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
            (reason) => { }
    );
  }

  GetProcessHeader() {
    if(this.filterForm.value.branch == 0){
      Swal.fire('Información', 'Seleccione un Ramo', 'warning');
      return;
    }
    if(this.filterForm.value.product == 0){
      Swal.fire('Información', 'Seleccione un Producto', 'warning');
      return;
    }
    if(this.filterForm.invalid){
      return;
    }

    this.isValidatedInClickButton = true;
    this.listToShow = [];
    this.processHeaderList = [];

    this.isLoading = true;
    this.currentPage = 1;
    this.rotate = true;
    this.maxSize = 5;
    this.itemsPerPage = 5;
    this.totalItems = 0;

    this.reporteSucaveService.GetHeaderProcess(this.filterForm.value).subscribe(
      (res) => {
        this.processHeaderList = res;
        if(this.processHeaderList.length > 0){
          this.processHeaderList.forEach((e) => {
            e.DIniProcess = e.DIniProcess.split(' ')[0];
            e.DFinProcess = e.DFinProcess.split(' ')[0];
          });
        }
        this.totalItems = this.processHeaderList.length;
        this.listToShow = this.processHeaderList.slice(
          (this.currentPage - 1) * this.itemsPerPage,
          this.currentPage * this.itemsPerPage
        );
        if (this.processHeaderList.length === 0) {
          swal
            .fire({
              title: 'Información',
              text: 'No se encontraron procesos con la fecha ingresada.',
              icon: 'warning',
              confirmButtonText: 'OK',
              allowOutsideClick: false,
            })
            .then((result) => {
              if (result.value) {
              }
            });
        }
        this.isLoading = false;
        console.log(this.processHeaderList);
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
