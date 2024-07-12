import { Component, OnInit, ViewChild } from '@angular/core';
import { BsDatepickerConfig } from 'ngx-bootstrap/datepicker';
import { NgbModal, ModalDismissReasons, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { Router } from '@angular/router';
import { DatePipe } from '@angular/common';

import { ClientInformationService } from '../../../services/shared/client-information.service';
import { PolicyService } from '../../../services/policy/policy.service';
import { PolicyMovementDetailsAllComponent } from '../policy-movement-details-all/policy-movement-details-all.component';
import { PolicyemitService } from '../../../services/policy/policyemit.service';
import { CommonMethods } from '../../common-methods';
import swal from 'sweetalert2';


@Component({
  selector: 'app-policy-covid',
  templateUrl: './policy-covid.component.html',
  styleUrls: ['./policy-covid.component.css']
})
export class PolicyCovidComponent implements OnInit {
  @ViewChild('desde') desde: any;
  @ViewChild('hasta') hasta: any;

  bsConfig: Partial<BsDatepickerConfig>;

  bsValueIni: Date = new Date();
  bsValueFin: Date = new Date();
  bsValueIniMax: Date = new Date();
  bsValueFinMin: Date = new Date();
  bsValueFinMax: Date = new Date();

  transaccionList: any = [];
  productList: any = [];
  InputsSearch: any = {};
  documentTypeList: any = [];
  policyList: any = [];
  listToShow: any[] = [];

  stateSearch = false;
  stateSearchPolicy = false;
  stateSearchNroPolicy = false;
  blockSearch = true;
  blockDoc = true;
  isLoading = false;
  codProducto = JSON.parse(localStorage.getItem('codProducto'))['productId'];
  //epsItem = JSON.parse(sessionStorage.getItem('eps'));
  epsItem = JSON.parse(localStorage.getItem('eps'));
  selectedPolicy: string;

  currentPage = 1;
  rotate = true;
  maxSize = 10;
  itemsPerPage = 5;
  totalItems = 0;

  maxlength = 8;
  minlength = 8;

  branch: any = '';

  constructor(
    private clientService: ClientInformationService,
    private policyService: PolicyemitService,
    private modalService: NgbModal,
    private router: Router,
    private datePipe: DatePipe
  ) {
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

    this.initialize();

    this.branch = await CommonMethods.branchXproduct(this.codProducto);
    await this.getTransaccionList();
    await this.getDocumentTypeList();
    await this.getProductList();
  }

  initialize() {
    this.InputsSearch.NTYPE_HIST = '0';
    this.InputsSearch.NBRANCH = '1';
    this.InputsSearch.NPRODUCT = '0';
    this.InputsSearch.P_NIDTRANSACCION = '0';
    this.InputsSearch.NPOLICY = '';

    this.InputsSearch.NIDDOC_TYPE = '-1';
    this.InputsSearch.SIDDOC = '';
    this.InputsSearch.P_PERSON_TYPE = '1';
    this.InputsSearch.P_TYPE_SEARCH = '1';
    this.InputsSearch.SFIRSTNAME = '';
    this.InputsSearch.SLEGALNAME = '';
    this.InputsSearch.SLASTNAME = '';
    this.InputsSearch.SLASTNAME2 = '';

    this.bsValueIni = new Date();
    this.bsValueIni.setDate(this.bsValueIni.getDate() - 30);
    this.bsValueFin = new Date();
    this.bsValueIniMax = new Date();
    this.bsValueFinMin = this.bsValueIni;
    this.bsValueFinMax = new Date();
  }

  onKeyPress(event) {

  }

  choosePolicyClk(evt, selection: any, idTipo: number) {
  }

  onSelectTypeSearch() {
    switch (this.InputsSearch.P_TYPE_SEARCH) {
      case '1':
        this.blockSearch = true;
        this.blockDoc = true;
        this.InputsSearch.SFIRSTNAME = '';
        this.InputsSearch.SLEGALNAME = '';
        this.InputsSearch.SLASTNAME = '';
        this.InputsSearch.SLASTNAME2 = '';
        break;
      case '2':
        this.blockSearch = false;
        this.blockDoc = true;
        this.InputsSearch.NIDDOC_TYPE = '-1';
        this.InputsSearch.SIDDOC = '';
        this.InputsSearch.P_PERSON_TYPE = '1';
        break;
    }

    this.stateSearchNroPolicy = false;
  }

  openModal(item) {
    const modalRef = this.modalService.open(PolicyMovementDetailsAllComponent, { size: 'lg', windowClass: 'modalCustom', backdropClass: 'light-blue-backdrop', backdrop: 'static', keyboard: false });
    modalRef.componentInstance.reference = modalRef;
    modalRef.componentInstance.itemTransaccionList = this.policyList;
    modalRef.componentInstance.NBRANCH = item.NBRANCH;
    modalRef.componentInstance.NPRODUCT = item.NPRODUCT;
    modalRef.componentInstance.NPOLICY = item.NPOLIZA;

    modalRef.componentInstance.SBRANCH = item.SRAMO;
    modalRef.componentInstance.SPRODUCT = item.SPRODUCTO;
    modalRef.componentInstance.SCONTRATANTE = item.SCONTRATANTE;
  }

  async getTransaccionList() {
    this.policyService.getTransactionAllList().subscribe(
      res => {
        this.transaccionList = res;
      }
    );
  }

  async getDocumentTypeList() {
    this.clientService.getDocumentTypeList(this.codProducto).subscribe(
      res => {
        this.documentTypeList = res;
      }
    );
  }

  async getProductList() {
    await this.clientService.getProductList(this.codProducto, this.epsItem.NCODE, this.branch).toPromise().then(
      res => {
        this.productList = res;
        if (this.productList.length === 1) {
          this.InputsSearch.NPRODUCT = this.productList[0].COD_PRODUCT;
        } else {
          this.InputsSearch.NPRODUCT = '-1';
        }
      }
    );
  }

  onSelectTypeDocument() {
    this.blockDoc = true;
    const response = CommonMethods.selTipoDocumento(this.InputsSearch.P_NIDDOC_TYPE);
    this.maxlength = response.maxlength;
    this.minlength = response.minlength;
    this.InputsSearch.SIDDOC = '';
  }

  onSelectTypePerson() {
    switch (this.InputsSearch.P_PERSON_TYPE) {
      case '1':
        this.blockDoc = true;
        break;
      case '2':
        this.blockDoc = false;
        break;
    }
  }

  pageChanged(currentPage) {
    this.currentPage = currentPage;
    this.listToShow = this.policyList.slice(((this.currentPage - 1) * this.itemsPerPage), (this.currentPage * this.itemsPerPage));
    this.selectedPolicy = '';
  }

  changeDoc(document) {
    if (document.length > 0) {
      this.stateSearchNroPolicy = true;
    } else {
      this.stateSearchNroPolicy = false;
    }
  }

  changeFirstName(firstname) {
    if (firstname.length > 0) {
      this.stateSearchNroPolicy = true;
    } else {
      if (this.InputsSearch.SLASTNAME !== '' || this.InputsSearch.SLASTNAME2) {
        this.stateSearchNroPolicy = true;
      } else {
        this.stateSearchNroPolicy = false;
      }
    }
  }

  changeLastName(lastname) {
    if (lastname.length > 0) {
      this.stateSearchNroPolicy = true;
    } else {
      if (this.InputsSearch.SFIRSTNAME !== '' || this.InputsSearch.SLASTNAME2) {
        this.stateSearchNroPolicy = true;
      } else {
        this.stateSearchNroPolicy = false;
      }
    }
  }

  changeLastName2(lastname2) {
    if (lastname2.length > 0) {
      this.stateSearchNroPolicy = true;
    } else {
      if (this.InputsSearch.SFIRSTNAME !== '' || this.InputsSearch.SLASTNAME) {
        this.stateSearchNroPolicy = true;
      } else {
        this.stateSearchNroPolicy = false;
      }
    }
  }

  changeContractor(contractor) {
    if (contractor.length > 0 || this.InputsSearch.SFIRSTNAME !== '' || this.InputsSearch.SLASTNAME !== '' || this.InputsSearch.SLASTNAME2 !== '') {
      this.stateSearchNroPolicy = true;
    } else {
      this.stateSearchNroPolicy = false;
    }
  }

  changePolicy(sdoc) {
    if (sdoc.length > 0) {
      this.stateSearch = true;
      this.stateSearchPolicy = false;
      this.InputsSearch.P_NIDPRODUCT = '0';
      this.InputsSearch.P_NIDTRANSACCION = '0';
      this.InputsSearch.NIDDOC_TYPE = '-1';
      this.InputsSearch.SIDDOC = '';
      this.InputsSearch.P_PERSON_TYPE = '1';
      this.InputsSearch.P_TYPE_SEARCH = '1';
      this.InputsSearch.SFIRSTNAME = '';
      this.InputsSearch.SLEGALNAME = '';
      this.InputsSearch.SLASTNAME = '';
      this.InputsSearch.SLASTNAME2 = '';
      this.blockDoc = true;
    } else {
      this.stateSearch = false;
    }
  }

  valInicio(event) {
    this.bsValueFinMin = new Date(this.bsValueIni);

  }
  valFin(event) {
    this.bsValueIniMax = new Date(this.bsValueFin);
  }

  documentNumberKeyPress(event: any, documentType: string) {
    if (documentType === '') { return; }
    CommonMethods.validarNroDocumento(event, documentType);
  }

  mostrarMas() {
    this.currentPage = 1;
    this.listToShow = this.policyList.slice(((this.currentPage - 1) * this.itemsPerPage), (this.currentPage * this.itemsPerPage));
    this.selectedPolicy = '';
  }

  searchPolicy() {
    this.listToShow = [];
    this.currentPage = 1;
    this.maxSize = 10;
    this.totalItems = 0;

    let msg = '';
    if (this.InputsSearch.NIDDOC_TYPE !== '-1') {
      if (this.InputsSearch.SIDDOC === '') {
        msg = 'Debe llenar el número de documento';
      }
    }

    if (this.InputsSearch.SIDDOC !== '') {
      if (this.InputsSearch.NIDDOC_TYPE === '-1') {
        msg = 'Debe llenar el tipo de documento';
      }
    }

    if (this.InputsSearch.SFIRSTNAME !== '') {
      if (this.InputsSearch.SFIRSTNAME.length < 2) {
        msg += 'El campo nombre debe contener al menos 2 caracteres <br />';
      }
    }

    if (this.InputsSearch.SLASTNAME !== '') {
      if (this.InputsSearch.SLASTNAME.length < 2) {
        msg += 'El campo apellido paterno debe contener al menos 2 caracteres';
      }
    }
    if (this.InputsSearch.NPOLICY !== '') {
      if (this.InputsSearch.NBRANCH === '0') {
        msg += '-Debe llenar el ramo.<br>';
      }

      if (this.InputsSearch.NPRODUCT === '0') {
        msg += '-Debe llenar el producto.';
      }
    }

    if (msg !== '') {
      swal.fire('Información', msg, 'error');
    } else {
      this.isLoading = true;
      const data: any = {};
      data.NTYPE_HIST = this.InputsSearch.NTYPE_HIST;
      data.NBRANCH = this.InputsSearch.NBRANCH;
      data.NPRODUCT = this.InputsSearch.NPRODUCT === '0' ? 0 : this.InputsSearch.NPRODUCT;
      data.NPOLICY = this.InputsSearch.NPOLICY === '0' ? 0 : this.InputsSearch.NPOLICY;
      data.NTYPE_DOC = this.InputsSearch.NIDDOC_TYPE === '-1' ? 0 : this.InputsSearch.NIDDOC_TYPE;
      data.SIDDOC = this.InputsSearch.SIDDOC;
      data.SFIRSTNAME = this.InputsSearch.SFIRSTNAME;
      data.SLASTNAME = this.InputsSearch.SLASTNAME;
      data.SLASTNAME2 = this.InputsSearch.SLASTNAME2;
      data.SLEGALNAME = this.InputsSearch.SLEGALNAME;
      data.DINI = CommonMethods.formatDate(this.bsValueIni);
      data.DFIN = CommonMethods.formatDate(this.bsValueFin);
      data.NUSERCODE = JSON.parse(localStorage.getItem('currentUser'))['id'];

      this.policyService.GetPolicyTransAllList(data).subscribe(
        res => {
          this.isLoading = false;
          this.policyList = res;
          this.totalItems = this.policyList.length;
          this.listToShow = this.policyList.slice(((this.currentPage - 1) * this.itemsPerPage), (this.currentPage * this.itemsPerPage));
          if (this.policyList.length === 0) {
            swal.fire({
              title: 'Información',
              text: 'No se encuentran póliza(s) con los datos ingresados',
              icon: 'error',
              confirmButtonText: 'OK',
              allowOutsideClick: false,
            }).then((result) => {
              if (result.value) {
                return;
              }
            });
          }
        },
        err => {
          this.isLoading = false;
        }
      );
    }
  }

}
