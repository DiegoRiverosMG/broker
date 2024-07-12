import { Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { ClientInformationService } from '../../../services/shared/client-information.service';
import { ModuleConfig } from '../../module.config';
import swal from 'sweetalert2';
import { ModuleService } from '../../../services/maintenance/module/module.service';
import { DatePipe } from '@angular/common';
import { BsDatepickerConfig } from 'ngx-bootstrap/datepicker';
import { CommonMethods } from '../../common-methods';

@Component({
  selector: 'app-module-index',
  templateUrl: './module-index.component.html',
  styleUrls: ['./module-index.component.css']
})
export class ModuleIndexComponent implements OnInit {
  bsValueIni: Date = new Date();
  bsValueFinMax: Date = new Date();
  @ViewChild('bsDatepicker') bsDatepicker: any;

  branchList: any = [];
  productList: any = [];
  stateList: any = [];
  moduleList: any = [];
  person = 'Mohan';
  InputsProduct: any = {};
  InputsModule: any = {};
  listSearched: any = [];

  branchCodeReceived: number;
  productCodeReceived: number;
  fechaEfectoSearched: Date;
  estadoBack: string;

  stateImageUrl;
  isLoading: boolean = false;
  isFormatDateCorrect: boolean = true;
  valueErrorDate: string = "";

  mainFormGroup: FormGroup;
  selectedBranchs;
  selectedProducts;

  public existResults: boolean;
  public foundResults: any = [];
  bsConfig: Partial<BsDatepickerConfig>;

  codBranchSelected: number;
  desBranchSelected: string;

  desProductSelected: string;
  codProductSelected: number;

  listToShow: any = [];
  processHeaderList: any = [];
  currentPage = 1; // página actual
  rotate = true; //
  maxSize = 10; // cantidad de paginas que se mostrarán en el paginado
  itemsPerPage = 5; // limite de items por página
  totalItems = 0; // total de items encontrados

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private clientInformationService: ClientInformationService,
    private moduleService: ModuleService,
    private datepipe: DatePipe
  ) {
    this.bsConfig = Object.assign(
      {},
      {
        dateInputFormat: "DD/MM/YYYY",
        locale: "es",
        showWeekNumbers: false
      }
    );
  }

  ngOnInit() {
    let self = this
    this.route.queryParams
      .subscribe(params => {
        this.listSearched = params.ListSearched,
          this.branchCodeReceived = params.BranchCode,
          this.productCodeReceived = params.ProductCode,
          this.fechaEfectoSearched = params.EffectDate,
          this.estadoBack = params.EstadoBack
      });

    if (this.listSearched != null) {
      this.listToShow = this.listSearched;
    }



    this.getBranchList();
    this.getStateList();

    this.codBranchSelected = this.InputsProduct.P_NBRANCH;
    this.InputsProduct.SDESCRIPT = null;
    this.InputsProduct.FECHAEFECTO = null;

    this.InputsProduct.P_NPRODUCT = null;
    this.InputsProduct.NCODIGINT = null;
    this.stateImageUrl = "assets/icons/anular.png";

    if (this.InputsProduct.P_NBRANCH === undefined) {

    } else {
      this.getProductsListByBranch();
    }

    if (this.estadoBack == "T") {
      if (Number(this.branchCodeReceived) != 0) {
        this.InputsProduct.P_NBRANCH = Number(this.branchCodeReceived);
        this.getProductsListByBranch();
      }

      if (Number(this.productCodeReceived) != 0 && this.productCodeReceived != undefined) {
        this.InputsProduct.P_NPRODUCT = Number(this.productCodeReceived);
        this.codProductSelected = this.InputsProduct.P_NPRODUCT;
      }
      else {
        this.InputsProduct.P_NPRODUCT = null;
      }
      if (this.fechaEfectoSearched != null)
        this.bsValueIni = new Date(this.datepipe.transform(this.fechaEfectoSearched, 'MM/dd/yyyy'));

      this.getModuleList(this.estadoBack, new Date(this.datepipe.transform(this.fechaEfectoSearched, 'MM/dd/yyyy')));
    }
  }

  changeState(codBranch, codProduct, codModule, state) {
    let msg: string = "";
    let txtButton: string = "";
    if (state === 'ACTIVO') {
      msg = "¿Está seguro de anular el módulo?";
      txtButton = "Anular";
    }
    else {
      msg = "¿Está seguro de activar el módulo?";
      txtButton = "Activar";
    }

    swal.fire({
      title: "Información",
      text: msg,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: txtButton,
      allowOutsideClick: false,
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.value) {
        this.InputsModule.SSTATE = state;
        this.InputsModule.NBRANCH = codBranch;
        this.InputsModule.NPRODUCT = codProduct;
        this.InputsModule.NMODULEC = codModule;


        var imagenAnula = document.getElementById("imagenAnula") as HTMLImageElement;

        this.moduleService.updateStateModule(this.InputsModule).subscribe(
          res => {
            if (res.P_NCODE == 0) {
              this.getModuleList("", null);
              imagenAnula.src = "assets/icons/editar.png";
            }
            else if (res.P_NCODE == 1) {
              swal.fire("Información", res.P_SMESSAGE, "error");
            }
            else {
              swal.fire("Información", res.P_SMESSAGE, "warning");
            }
          },
          err => {
            swal.fire("Información", err.statusText, "warning");
          }

        );
      }
    });
  }

  validateEffectDate(fechaEfecto) {
    let effectDate;
    let dayIni, monthPreviewIni, monthIni, yearIni;
    if (fechaEfecto == null)
      effectDate = this.bsDatepicker.nativeElement.value;
    else {
      effectDate = CommonMethods.formatDate(fechaEfecto)
    }

    if (effectDate === "") {
      this.isFormatDateCorrect = false;
      this.valueErrorDate = "required";
    }
    else {
      if (!this.isValidDate()) {
        this.isFormatDateCorrect = false;
        this.valueErrorDate = "badFormat";
      }
      else {
        this.isFormatDateCorrect = true;
        this.valueErrorDate = "";
      }
    }

    return this.isFormatDateCorrect;
  }

  isValidDate() {

    var flag = true;
    // regular expression to match required date format
    let re = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/;
    var regs;
    let effectDate = (<HTMLInputElement>document.getElementById("fechaEfecto")).value;
    if (effectDate != '') {
      if (regs = effectDate.match(re)) {
        // day value between 1 and 31
        if (regs[1] < 1 || regs[1] > 31) {
          flag = false;
          return flag;
        }
        // month value between 1 and 12
        if (regs[2] < 1 || regs[2] > 12) {
          flag = false;
          return flag;
        }
        // year value between 1902 and 2019
        if (regs[3] < 1902 || regs[3] > (new Date()).getFullYear() + 100) {
          flag = false;
          return flag;
        }
      } else {
        flag = false;
        return flag;
      }
    }

    return flag;
  }

  getModuleList(estadoback, fechaEfecto) {

    if (estadoback == "T") {
      if (!this.validateEffectDate(fechaEfecto)) {
        return;
      }
    }
    else {
      if (!this.validateEffectDate(null)) {
        return;
      }
    }


    this.listToShow = [];
    this.processHeaderList = [];

    this.isLoading = true;
    this.currentPage = 1; // página actual
    this.rotate = true; //
    this.maxSize = 10; // cantidad de paginas que se mostrarán en el paginado
    this.itemsPerPage = 5; // limite de items por página
    this.totalItems = 0; // total de items encontrados

    let data: any = {};
    let fecha = ""
    if (estadoback == "T") {
      fecha = CommonMethods.formatDate(fechaEfecto)
    }
    else {
      fecha = CommonMethods.formatDate(this.bsValueIni)
    }


    data.DSTATDATE = fecha
    data.NPRODUCT = this.codProductSelected;
    data.NBRANCH = this.InputsProduct.P_NBRANCH;

    if (this.InputsProduct.NCODIGINT == 1)
      data.NESTADO = 1;
    else if (this.InputsProduct.NCODIGINT == 4)
      data.NESTADO = 2;
    else
      data.NESTADO = 0;
    this.moduleService.GetModuleList(data).subscribe(
      res => {
        console.log(res);
        this.moduleList = res;
        this.totalItems = this.moduleList.length;
        this.listToShow = this.moduleList.
          slice(((this.currentPage - 1) * this.itemsPerPage), (this.currentPage * this.itemsPerPage));
        if (this.moduleList.length === 0) {
          swal.fire({
            title: 'Información',
            text: 'No se encuentran los módulos con la fecha ingresada.',
            icon: 'error',
            confirmButtonText: 'OK',
            allowOutsideClick: false,
          }).then((result) => {
            if (result.value) {
            }
          });
        }
        else {
          this.existResults = true;
        }

        this.isLoading = false;
      },
      err => {
        this.isLoading = false;
      }
    );
  }

  onSelectProduct(event) {
    if (event === undefined) {
      this.desProductSelected = null;
      this.codProductSelected = null;
    }
    else {
      this.desProductSelected = event.DES_PRODUCT;
      this.codProductSelected = event.COD_PRODUCT;
    }
  }

  onSelectBranch() {

    this.productList = null;
    this.InputsProduct.P_NPRODUCT = null;
    this.codProductSelected = null;
    if (this.InputsProduct.P_NBRANCH != null) {
      this.getProductsListByBranch();
    }
  }

  getStateList() {
    this.clientInformationService.getStateList().subscribe(
      res => {
        this.stateList = res;
      },
      err => {
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
    this.clientInformationService.getProductsListByBranch(this.InputsProduct.P_NBRANCH).subscribe(
      res => {
        this.productList = res;
      },
      err => {
      }
    );
  }

  pageChanged(currentPage) {
    this.currentPage = currentPage;
    this.listToShow = this.moduleList.slice(((this.currentPage - 1) * this.itemsPerPage), (this.currentPage * this.itemsPerPage));
  }

  addTagFn(name) {
    return { name: name, tag: true };
  }

  newCover(accion) {
    if (!this.validateEffectDate(null)) {
      return;
    }

    let error: string = "";

    if (this.InputsProduct.P_NBRANCH == 0 || this.InputsProduct.P_NBRANCH == null)
      error = "Seleccione un ramo.<br/>";
    if (this.codProductSelected == 0 || this.codProductSelected == null)
      error += "Seleccione un producto.";

    if (error !== "")
      swal.fire("Información", error, "warning");
    else
      this.router.navigate(['/extranet/add-module'], { queryParams: { Accion: accion, ProductDescription: this.desProductSelected, ProductCode: this.codProductSelected, BranchCode: this.InputsProduct.P_NBRANCH, BranchDescription: "", EffectDate: this.bsValueIni, ModeForm: "Create", ListSearched: this.listToShow, ProductoCodeSearched: this.codProductSelected, StateSearched: this.InputsProduct.NCODIGINT } });
  }

  openModal(accion, module, productDescription, productCode, branchCode) {
    if (accion === "EDI")
      this.router.navigate(['/extranet/add-module'], { queryParams: { Accion: accion, ModuleCode: module, ProductDescription: productDescription, ProductCode: productCode, BranchCode: branchCode, EffectDate: this.bsValueIni, ModeForm: "Edit", ListSearched: this.listToShow, ProductoCodeSearched: this.codProductSelected, StateSearched: this.InputsProduct.NCODIGINT } });
    else if (accion === "CLO")
      this.router.navigate(['/extranet/add-module'], { queryParams: { Accion: accion, ModuleCode: module, ProductDescription: productDescription, ProductCode: productCode, BranchCode: branchCode, EffectDate: this.bsValueIni, ModeForm: "Clone", ListSearched: this.listToShow, ProductoCodeSearched: this.codProductSelected, StateSearched: this.InputsProduct.NCODIGINT } });
    else
      this.router.navigate(['/extranet/add-module'], { queryParams: { Accion: accion, ModuleCode: module, ProductDescription: productDescription, ProductCode: productCode, BranchCode: branchCode, EffectDate: this.bsValueIni, ModeForm: "Consult", ListSearched: this.listToShow, ProductoCodeSearched: this.codProductSelected, StateSearched: this.InputsProduct.NCODIGINT } });
  }
}
