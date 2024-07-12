import { Component, OnInit, ViewChild } from '@angular/core';
import { BsDatepickerConfig } from 'ngx-bootstrap/datepicker';
import { NgbModal, ModalDismissReasons, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { DatePipe } from '@angular/common';

//Compartido
import Swal from 'sweetalert2'
import { ClientInformationService } from '../../../services/shared/client-information.service';
import { CommissionModalComponent } from '../commission-modal/commission-modal.component';
import { CommissionService } from '../../../services/maintenance/commision/commission.service';
import { CommonMethods } from '../../common-methods';

@Component({
  selector: 'app-commission',
  templateUrl: './commission.component.html',
  styleUrls: ['./commission.component.css']
})
export class CommissionKunturComponent implements OnInit {
  @ViewChild('desde') desde: any;
  @ViewChild('hasta') hasta: any;
  userType: number = 1; //1: admin, 2:emisor, 3:comercial, 4:tecnico, 5:cobranza
  bsConfig: Partial<BsDatepickerConfig>;

  bsValueIni: Date = new Date();
  bsValueFin: Date = new Date();
  bsValueIniMax: Date = new Date();
  bsValueFinMin: Date = new Date();
  bsValueFinMax: Date = new Date();

  branchList: any = [];
  productList: any = [];
  transaccionList: any = [];
  BrokerCommissionList: any = [];
  documentTypeList: any = [];
  InputsSearch: any = {};
  listToShow: any[] = [];


  maxlength = 8;
  minlength = 8;

  stateSearch = false;
  stateSearchPolicy = false;
  stateSearchNroPolicy = false;
  blockSearch = true;
  blocksbs = false;
  blockDoc = true;
  isLoading: boolean = false;

  selectedPolicy: string;

  currentPage = 1; //página actual
  rotate = true; //
  maxSize = 10; // cantidad de paginas que se mostrarán en el paginado
  itemsPerPage = 5; // limite de items por página
  totalItems = 0; //total de items encontrados
  constructor(private clientInformationService: ClientInformationService,
    private modalService: NgbModal,
    private commissionService: CommissionService,
    private datePipe: DatePipe) {

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
    this.InputsSearch.NTYPE_HIST = '0';
    this.InputsSearch.NBRANCH = '0';

    this.InputsSearch.NPRODUCT = '0';
    this.InputsSearch.P_NIDTRANSACCION = '0';
    this.InputsSearch.NPOLICY = '';

    this.InputsSearch.NIDDOC_TYPE = '-1';
    this.InputsSearch.SIDDOC = '';
    this.InputsSearch.P_PERSON_TYPE = '1';
    this.InputsSearch.P_TYPE_SEARCH = '1';
    this.InputsSearch.SFIRSTNAME = ''
    this.InputsSearch.SLEGALNAME = ''
    this.InputsSearch.SLASTNAME = ''
    this.InputsSearch.SLASTNAME2 = ''

    this.bsValueIni = new Date();
    this.bsValueIni.setDate(this.bsValueIni.getDate() - 30);
    this.bsValueFin = new Date();
    this.bsValueIniMax = new Date();
    this.bsValueFinMin = this.bsValueIni;
    this.bsValueFinMax = new Date();

    this.getBranchList();
    this.getDocumentTypeList();
  }

  getProductsListByBranch() {
    this.clientInformationService.getProductsListByBranch(this.InputsSearch.NBRANCH).subscribe(
      res => {
        this.productList = res;
        this.InputsSearch.NPRODUCT = 0;
      },
      err => {
      }
    );
  }

  SelectBranch() {
    this.productList = null;
    if (this.InputsSearch.NBRANCH != null) {
      this.getProductsListByBranch();
    }
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



  getDocumentTypeList() {
    this.clientInformationService.getDocumentTypeList(0).subscribe(
      res => {
        this.documentTypeList = res;
      },
      err => {
      }
    );
  }

  openModal(item) {
    let modalRef: NgbModalRef;

    modalRef = this.modalService.open(CommissionModalComponent,
      { size: 'lg', windowClass: 'modalCustom', backdropClass: 'light-blue-backdrop', backdrop: 'static', keyboard: false });
    modalRef.componentInstance.reference = modalRef;
    modalRef.componentInstance.itemBroker = item;
    modalRef.componentInstance.NBRANCH = item.NBRANCH;
    modalRef.componentInstance.NPRODUCT = item.NPRODUCT;
    modalRef.componentInstance.NPOLICY = item.NPOLIZA;

    modalRef.componentInstance.SBRANCH = item.SRAMO;
    modalRef.componentInstance.SPRODUCT = item.SPRODUCTO;
    modalRef.componentInstance.SCONTRATANTE = item.SCONTRATANTE;

    modalRef.result.then(() => {
      this.BuscarBroker();

    }, (reason) => {
    });

  }

  onKeyPress(event) {
    let strError = '';
    if (this.InputsSearch.NBRANCH == '0') {
      strError = '- Seleccione un ramo';
    } else if (this.InputsSearch.NPRODUCT == '0') {
      strError += '- Seleccione un producto';
    }

    if (strError != '') {
      Swal.fire('Error', strError, 'error');
    }
  }

  onSelectTypeSearch() {
    switch (this.InputsSearch.P_TYPE_SEARCH) {
      case '1':
        this.blockSearch = true;
        this.blockDoc = true;
        this.blocksbs = false;
        this.InputsSearch.SFIRSTNAME = ''
        this.InputsSearch.SLEGALNAME = ''
        this.InputsSearch.SLASTNAME = ''
        this.InputsSearch.SLASTNAME2 = ''
        this.InputsSearch.CODSBS = ''
        break;

      case '2':
        this.blockSearch = false;
        this.blockDoc = true;
        this.blocksbs = false;
        this.InputsSearch.NIDDOC_TYPE = '-1';
        this.InputsSearch.SIDDOC = '';
        this.InputsSearch.CODSBS = '';
        break;

      case '3':
        this.blocksbs = true;
        this.blockSearch = true;
        this.InputsSearch.SFIRSTNAME = ''
        this.InputsSearch.SLEGALNAME = ''
        this.InputsSearch.SLASTNAME = ''
        this.InputsSearch.SLASTNAME2 = ''
        this.InputsSearch.NIDDOC_TYPE = '-1';
        this.InputsSearch.SIDDOC = '';
        break;
    }

    this.stateSearchNroPolicy = false;
  }

  BuscarBroker() {
    this.listToShow = [];
    this.currentPage = 1; //página actual
    this.maxSize = 10; // cantidad de paginas que se mostrarán en el paginado
    this.totalItems = 0; //total de items encontrados

    let msg: string = '';
    if (this.InputsSearch.NIDDOC_TYPE != '-1') {
      if (this.InputsSearch.SIDDOC == '') {
        msg = 'Debe llenar el número de documento'
      }
    }

    if (this.InputsSearch.SIDDOC != '') {
      if (this.InputsSearch.NIDDOC_TYPE == '-1') {
        msg = 'Debe llenar el tipo de documento'
      }
    }

    if (this.InputsSearch.NPOLICY != '') {
      if (this.InputsSearch.NBRANCH === '0')
        msg += '-Debe llenar el ramo.<br>';

      if (this.InputsSearch.NPRODUCT === '0')
        msg += '-Debe llenar el producto.';
    }


    if (this.blocksbs) {
      if (this.InputsSearch.CODSBS.trim() === '') {
        msg += 'El campo SBS no puedo estar vacio';
      }
    }

    if (msg != '') {
      Swal.fire('Información', msg, 'error');
    } else {

      this.isLoading = true;

      let data: any = {};
      data.NBRANCH = this.InputsSearch.NBRANCH;
      data.NPRODUCT = this.InputsSearch.NPRODUCT == '0' ? 0 : this.InputsSearch.NPRODUCT;
      data.NPOLICY = this.InputsSearch.NPOLICY == '0' ? 0 : this.InputsSearch.NPOLICY;
      data.NTYPE_DOC = this.InputsSearch.NIDDOC_TYPE == '-1' ? 0 : this.InputsSearch.NIDDOC_TYPE;
      data.SIDDOC = this.InputsSearch.SIDDOC;
      data.SLEGALNAME = this.InputsSearch.SLEGALNAME;
      data.CODSBS = this.InputsSearch.CODSBS;
      data.DEFECT = CommonMethods.formatDate(this.bsValueIni) //Fecha Inicio
      this.commissionService.getBrokerCommission(data).subscribe(
        res => {
          console.log(res);
          this.isLoading = false;
          this.BrokerCommissionList = res;
          this.totalItems = this.BrokerCommissionList.length;
          this.listToShow = this.BrokerCommissionList.slice(((this.currentPage - 1) *
            this.itemsPerPage), (this.currentPage * this.itemsPerPage));
          if (this.BrokerCommissionList.length == 0) {
            Swal.fire({
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

  onSelectTypeDocument() {
    let response = CommonMethods.selTipoDocumento(this.InputsSearch.P_NIDDOC_TYPE)
    this.maxlength = response.maxlength
    this.minlength = response.minlength
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
    this.listToShow = this.BrokerCommissionList.slice(((this.currentPage - 1) * this.itemsPerPage), (this.currentPage * this.itemsPerPage));
    this.selectedPolicy = '';
  }

  changeDoc(document) {
    if (document.length > 0) {
      this.stateSearchNroPolicy = true;
    }
    else {
      this.stateSearchNroPolicy = false;
    }
  }

  changeFirstName(firstname) {
    if (firstname.length > 0) {
      this.stateSearchNroPolicy = true;
    }
    else {
      if (this.InputsSearch.SLASTNAME != '' || this.InputsSearch.SLASTNAME2) {
        this.stateSearchNroPolicy = true;
      }
      else {
        this.stateSearchNroPolicy = false;
      }
    }
  }

  changeLastName(lastname) {
    if (lastname.length > 0) {
      this.stateSearchNroPolicy = true;
    }
    else {
      if (this.InputsSearch.SFIRSTNAME != '' || this.InputsSearch.SLASTNAME2) {
        this.stateSearchNroPolicy = true;
      }
      else {
        this.stateSearchNroPolicy = false;
      }
    }
  }

  changeLastName2(lastname2) {
    if (lastname2.length > 0) {
      this.stateSearchNroPolicy = true;
    }
    else {
      if (this.InputsSearch.SFIRSTNAME != '' || this.InputsSearch.SLASTNAME) {
        this.stateSearchNroPolicy = true;
      }
      else {
        this.stateSearchNroPolicy = false;
      }
    }
  }

  changeContractor(contractor) {
    if (contractor.length > 0 || this.InputsSearch.SFIRSTNAME !== '' || this.InputsSearch.SLASTNAME !== '' || this.InputsSearch.SLASTNAME2 !== '') {
      this.stateSearchNroPolicy = true;
    }
    else {
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
      this.InputsSearch.CODSBS = '';
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

}
