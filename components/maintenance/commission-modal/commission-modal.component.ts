export class Intermediary {
  intermedary: string;
  nintermed: number;
  tipoIntermediario: string;
}

import { Component, OnInit, Input } from '@angular/core';
import { PolicyService } from '../../../services/policy/policy.service';
import { NgbModal, ModalDismissReasons, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { AccessFilter } from './../../access-filter'
import { PolicyemitService } from '../../../services/policy/policyemit.service';
import { CommissionService } from '../../../services/maintenance/commision/commission.service';
import swal from 'sweetalert2';
import { BsDatepickerConfig } from 'ngx-bootstrap/datepicker';
import { CommonMethods } from '../../common-methods';
@Component({
  selector: 'app-commission-modal',
  templateUrl: './commission-modal.component.html',
  styleUrls: ['./commission-modal.component.css']
})
export class CommissionModalComponent implements OnInit {
  @Input() public reference: any;
  @Input() public itemBroker: any;
  @Input() public cotizacionID: any;
  @Input() public NBRANCH; NPRODUCT; NPOLICY; SBRANCH; SPRODUCT; SCONTRATANTE: any;

  listToShow: any[] = [];
  InputsPolicy: any = [];
  policyMovementList: any = [];
  listIntermedary: Array<Intermediary> = [];
  itemIntermediary: Intermediary = new Intermediary();

  currentPage = 1; //página actual
  rotate = true; //
  maxSize = 10; // cantidad de paginas que se mostrarán en el paginado
  itemsPerPage = 5; // limite de items por página
  totalItems = 0; //total de items encontrados
  bsConfig: Partial<BsDatepickerConfig>;
  bsValueIni: Date = new Date();
  bsValueFinMax: Date = new Date();
  isLoading: boolean = false;
  canCancelMovements: boolean;
  flagAnular: boolean = false;
  constructor(
    private policyErmitService: PolicyemitService,
    private modalService: NgbModal,
    private commissionService: CommissionService) {
    this.bsConfig = Object.assign(
      {},
      {
        dateInputFormat: 'DD/MM/YYYY',
        locale: "es",
        showWeekNumbers: false
      }
    );

  }

  ngOnInit() {
    this.getListIntermidary();
    this.InputsPolicy.SRAMO = null;
    if (this.itemBroker.POR_COMISION == '') {
      this.itemBroker.POR_COMISION = '0';
    }
  }


  PrintTypeIntermediary() {
    console.log(this.itemIntermediary.nintermed);
    this.listIntermedary.forEach((element) => {
      if (element.nintermed == this.itemIntermediary.nintermed) {
        this.itemIntermediary.tipoIntermediario = element.tipoIntermediario;
      }
    });
  }

  getListIntermidary() {
    const data: any = {};
    data.NBRANCH = this.itemBroker.NBRANCH;
    data.NPRODUCT = this.itemBroker.NPRODUCT;
    data.NPOLICY = this.itemBroker.POLIZA;
    this.commissionService.getListIntermidary(data).subscribe(
      res => {
        this.listIntermedary = res;
        if (this.itemBroker.NINTERMED != '') {
          this.itemIntermediary.nintermed = this.itemBroker.NINTERMED;
          this.PrintTypeIntermediary();
        } else {
          this.itemIntermediary.nintermed = 0;
        }
      },
      err => {
      }
    );
  }


  UpdateCommission() {
    var int = "1.18";
    var decimal = "1.6";
    var index = "1";
    let input: any;
    if (index == "1") {
      input = this.itemBroker.POR_COMISION;
    }
    if (input != null && input != "") {
      var result = CommonMethods.validateEnteros(int, input);
      if (result != "") {
        swal.fire({
          title: 'Información',
          text: 'Debe Ingresar una comisión valida',
          icon: 'error',
          confirmButtonText: 'OK',
          allowOutsideClick: false,
        });
        return;
      }
    }




    if (Number(this.itemBroker.POR_COMISION) > 100) {
      swal.fire({
        title: 'Información',
        text: 'El % comisión no debe ser mayor a 100',
        icon: 'error',
        confirmButtonText: 'OK',
        allowOutsideClick: false,
      });
      return;
    }

    if (this.itemIntermediary.nintermed == 0 || this.itemIntermediary.nintermed === undefined) {
      swal.fire({
        title: 'Información',
        text: 'Debe seleccionar el intermediario',
        icon: 'error',
        confirmButtonText: 'OK',
        allowOutsideClick: false,
      });
      return;
    }
    this.isLoading = true;
    const data: any = {};
    data.P_SCERTYPE = this.itemBroker.SCERTYPE;
    data.P_NBRANCH = this.itemBroker.NBRANCH;
    data.P_NPRODUCT = this.itemBroker.NPRODUCT;
    data.P_NPOLICY = this.itemBroker.POLIZA;
    data.P_NAMOUNT = Number(this.itemBroker.POR_COMISION);
    data.P_NINTERMED = this.itemIntermediary.nintermed;
    data.P_DEFFECDATE = CommonMethods.formatDate(this.bsValueIni)
    data.P_NUSERCODE = JSON.parse(localStorage.getItem('currentUser'))['id'];

    this.commissionService.updateCommission(data).subscribe(
      res => {
        this.isLoading = false;
        if (res != null) {
          swal.fire({
            title: 'Información',
            text: (res.code === 0) ? 'Se actualizo correctamente la información' : res.message,
            icon: (res.code === 0) ? 'success' : 'error',
            confirmButtonText: 'OK',
            allowOutsideClick: false,
          });
        }
      },
      err => {
        this.isLoading = false;
      }
    );
  }

  pageChanged(currentPage) {
    this.currentPage = currentPage;
    this.listToShow = this.policyMovementList.slice(((this.currentPage - 1) * this.itemsPerPage), (this.currentPage * this.itemsPerPage));
  }

  validateDecimal(int, decimal, index) {
    let input: any;
    if (index == 1) {
      input = this.itemBroker.POR_COMISION;
    }
    if (input != null && input != "") {
      var result = CommonMethods.validateDecimals(int, decimal, input);
      if (result != "") {
        swal.fire({
          title: 'Información',
          text: 'Debe Ingresar una comisión valida',
          icon: 'error',
          confirmButtonText: 'OK',
          allowOutsideClick: false,
        });
        return;
      }
    }
  }
}
