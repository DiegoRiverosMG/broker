import { Component, OnInit, ViewChildren, QueryList, ElementRef, AfterContentInit, AfterViewInit, Input, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import swal from 'sweetalert2';
import { NgbModal, ModalDismissReasons, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { ModuleService } from '../../services/maintenance/module/module.service';
import { DatePipe } from '@angular/common';
import { CoverService } from '../../services/maintenance/cover/cover.service';
import { CoverSpecificInformationComponent } from '../cover/cover-specific-information/cover-specific-information.component';
import { Life_coverRequest } from '../../models/maintenance/cover/request/life_coverRequest';
import { LifeCoverService } from '../../services/maintenance/lifecover/lifecover.service';
import { CoverRateDetailComponent } from '../cover/cover-rate-detail/cover-rate-detail.component';
import { BsDatepickerConfig } from 'ngx-bootstrap/datepicker'
import { CoverRateBM } from '../../models/maintenance/cover/request/cover-rate-bm';
import { CommonMethods } from '../common-methods';
import { isNumeric } from 'rxjs/internal-compatibility'

@Component({
  selector: 'app-add-module',
  templateUrl: './add-module.component.html',
  styleUrls: ['./add-module.component.css']
})
export class AddModuleComponent {
  @ViewChildren("checkboxes") checkboxes: QueryList<ElementRef>;
  @ViewChild('fefecto') fefecto: any;
  isLoading: boolean = false;
  dataList: Array<Life_coverRequest> = [];
  dataListRate: Array<CoverRateBM> = [];
  bsConfig: Partial<BsDatepickerConfig>;
  bsValueIni: Date = new Date();

  inputsCover: any = {};
  inputsModule: any = {};
  inputsProduct: any = {};
  inputsLifeCover: any = {};
  moduleList: any = {};
  coverList: any = {};
  lifeCoverList: any = {};
  inputsValidate: any = {};
  inputsValidate_module: any = {};
  listSearched: any = [];
  listToShow: any = [];

  listChk: any = [];

  isRequired: boolean = false;
  isPreselected: boolean = false;
  isSellAllowed: boolean = false;
  isChangeAllowed: boolean = false;
  isIncreased: boolean = false;
  isDecreased: boolean = false;
  isRatedByModule: boolean = false;
  hasEspecificCover: boolean = false;
  indexEdit: number = 0;

  changeTypePremium: string;
  valueErrorDate: string = "";

  controlDisabled: boolean;
  controlAlwaysDisabled: boolean = true;
  taxByModuleDisabled: boolean = true;
  increaseDisabled: boolean = true;
  decreaseDisabled: boolean = true;
  chkIncreaseDisabled: boolean = true;
  chkDecreaseDisabled: boolean = true;
  btnSaveEnabled: boolean = false;
  isFormatDateCorrect: boolean = true;

  conta: number = 1;
  nmodulecLoad: number;
  nmodulecNew: number;
  productCodeSearched: number;
  fechaEfectoSearched: Date;
  currentPage = 1; //página actual
  rotate = true; //
  maxSize = 5; // cantidad de paginas que se mostrarán en el paginado
  itemsPerPage = 10; // limite de items por página
  totalItems = 0; //total de items encontrados

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private modalService: NgbModal,
    private moduleService: ModuleService,
    private coverService: CoverService,
    private datepipe: DatePipe,
    private lifeCoverService: LifeCoverService
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
    this.inputsValidate = CommonMethods.generarCampos(20, 0);

    this.route.queryParams
      .subscribe(params => {
        this.inputsCover.Accion = params.Accion;
        this.inputsProduct.COD_PRODUCT = params.ProductCode;
        this.inputsProduct.DES_PRODUCT = params.ProductDescription;
        this.inputsModule.NBRANCH = params.BranchCode;
        this.inputsModule.NMODULEC = params.ModuleCode;
        this.fechaEfectoSearched = params.EffectDate;
        this.inputsModule.MODEFORM = params.ModeForm;
        this.listSearched = params.ListSearched;
        this.productCodeSearched = params.ProductoCodeSearched;
      });

    this.changeStateControls(this.inputsCover.Accion);
    this.btnSaveEnabled = false;

    if (this.inputsModule.MODEFORM === "Clone") {
      let data: any = {};
      data.NBRANCH = this.inputsModule.NBRANCH;
      data.NPRODUCT = this.inputsModule.NPRODUCT;

      this.moduleService.getModuleCode(data).subscribe(
        res => {
          var data = JSON.stringify(res);
          var json = JSON.parse(data);
          this.nmodulecNew = json.NMODULEC;
        },
        err => {
        }
      );
    }

    this.nmodulecLoad = this.inputsModule.NMODULEC;
    this.inputsModule.SACCION = this.inputsCover.Accion;
    this.inputsModule.NBRANCH = this.inputsModule.NBRANCH;
    this.inputsModule.NMODULEC = this.inputsModule.NMODULEC;
    this.inputsModule.NPRODUCT = this.inputsProduct.COD_PRODUCT;
    this.inputsModule.SDESCRIPT = null;
    this.inputsModule.SSHORT_DES = null;
    this.inputsModule.SCONDSVS = null;
    this.inputsModule.NCHPRELEV = null;
    this.inputsModule.SDEFAULTI = null;
    this.inputsModule.SCHANALLO = null;
    this.inputsModule.SCHANGETYP = null;
    this.inputsModule.NRATEPREADD = null;
    this.inputsModule.NRATEPRESUB = null;
    this.inputsModule.NPREMIRAT = null;
    this.inputsModule.STYP_RAT = null;
    this.inputsModule.SVIGEN = null;
    this.inputsModule.NUSERCODE = JSON.parse(localStorage.getItem("currentUser"))["id"];

    if (this.inputsCover.Accion === "INS")
      this.loadModuleCode();
    else
      this.inputsModule.NMODULEC = this.inputsModule.NMODULEC;

    this.loadModuleInForm();

  }

  clearValidate(numInput) {
    this.inputsValidate[numInput] = false
  }


  validateEffectDate() {
    let effectDate = this.fefecto.nativeElement.value;
    if (effectDate === "") {
      this.isFormatDateCorrect = false;
      this.inputsValidate[0] = true;
    }
    else {
      if (!this.isValidDate()) {
        this.isFormatDateCorrect = false;
        this.inputsValidate[0] = true
      }
      else {
        this.isFormatDateCorrect = true;
        this.inputsValidate[0] = false;
      }
    }

    return this.isFormatDateCorrect;
  }

  isValidDate() {

    var flag = true;
    let re = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/;
    var regs;
    let effectDate = (<HTMLInputElement>document.getElementById("fechaEfecto")).value;
    if (effectDate != '') {
      if (regs = effectDate.match(re)) {
        if (regs[1] < 1 || regs[1] > 31) {
          flag = false;
          return flag;
        }
        if (regs[2] < 1 || regs[2] > 12) {
          flag = false;
          return flag;
        }
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

  addRate(item, accion, row) {
    if (!this.validateEffectDate()) {
      swal.fire("Información", "- Ingrese la fecha de efecto.", "error");
      return;
    }

    if (this.indexEdit != row) {
      let modalRef: NgbModalRef;
      let data: any = {};

      data.NBRANCH = this.inputsModule.NBRANCH;
      data.NPRODUCT = this.inputsModule.NPRODUCT;
      data.NMODULEC = this.inputsModule.NMODULEC;
      data.NCOVERGEN = item.NCOVERGEN;

      this.coverService.getCoverEspCode(data).subscribe(
        res => {
          var data = JSON.stringify(res);
          var json = JSON.parse(data);
          this.inputsCover.NCOVER = json.NCOVER;

          if (item.chk == false) {
            if (json.NCOVER === 0 || json.NCOVER == undefined) {
              swal.fire("Información", 'No puede agregar tasa sin haber seleccionado una cobertura', "error");
              return;
            }
          }

          modalRef = this.modalService.open(CoverRateDetailComponent, { size: 'lg', windowClass: "modalCustom", backdropClass: 'light-blue-backdrop', backdrop: 'static', keyboard: false });
          modalRef.componentInstance.reference = modalRef;
          modalRef.componentInstance.NBRANCH = this.inputsModule.NBRANCH;
          modalRef.componentInstance.NPRODUCT = this.inputsModule.NPRODUCT;
          modalRef.componentInstance.NMODULEC = this.inputsModule.NMODULEC;
          modalRef.componentInstance.SMODEFORM = this.inputsModule.MODEFORM;

          if (this.inputsCover.NCOVER == 0) {
            if (this.dataList.length > 0) {
              for (let cover of this.dataList) {
                if (cover.NCOVERGEN == item.NCOVERGEN)
                  modalRef.componentInstance.NCOVER = cover.NCOVER;
              }
            }
          }
          else {
            modalRef.componentInstance.NCOVER = this.inputsCover.NCOVER;
          }

          modalRef.componentInstance.DEFFECDATE = this.datepipe.transform(this.bsValueIni, 'dd/MM/yyyy');
          modalRef.componentInstance.controlDisabled = this.controlDisabled;

          modalRef.result.then((result) => {
            if (accion === "INS") {
              if (result !== "save") {
                item.chk = false;
              }
            }
          }, (reason) => {
            if (accion === "INS") {
              if (reason === "dismiss") {
                item.chk = false;
              }
            }
          });

          modalRef.componentInstance.passEntry.subscribe((receivedEntry) => {
            this.dataListRate = receivedEntry;
          })
        },
        err => { }
      )
    }
  }

  editSpecificCover(item, nbranch, accion, row) {

    if (!this.validateEffectDate()) {
      swal.fire("Información", "- Ingrese la fecha de efecto.", "error");
      return;
    }

    if (this.indexEdit != row) {
      let modalRef: NgbModalRef;
      let nCover: number;

      let data: any = {};

      data.NBRANCH = this.inputsModule.NBRANCH;
      data.NPRODUCT = this.inputsModule.NPRODUCT;
      data.NMODULEC = this.inputsModule.NMODULEC;
      data.NCOVERGEN = item.NCOVERGEN;

      this.coverService.getCoverEspCode(data).subscribe(
        res => {
          var data = JSON.stringify(res);
          var json = JSON.parse(data);
          nCover = json.NCOVER;

          if (item.chk == false) {
            item.chk = true;
          }

          modalRef = this.modalService.open(CoverSpecificInformationComponent, { size: 'lg', windowClass: "modalCustom", backdropClass: 'light-blue-backdrop', backdrop: 'static', keyboard: false });
          modalRef.componentInstance.reference = modalRef;
          modalRef.componentInstance.NCOVERGEN = item.NCOVERGEN;
          modalRef.componentInstance.NBRANCH = this.inputsModule.NBRANCH;
          modalRef.componentInstance.NPRODUCT = this.inputsModule.NPRODUCT;
          modalRef.componentInstance.NMODULEC = this.inputsModule.NMODULEC;
          modalRef.componentInstance.NCOVER = nCover;
          modalRef.componentInstance.SMODEFORM = this.inputsModule.MODEFORM;
          modalRef.componentInstance.controlDisabled = this.controlDisabled;
          if (this.inputsModule.MODEFORM === "Clone")
            modalRef.componentInstance.SACCION = "INS";
          else {
            if (nCover === 0)
              modalRef.componentInstance.SACCION = "INS";
            else
              modalRef.componentInstance.SACCION = accion;
          }

          modalRef.componentInstance.DEFFECDATE = this.datepipe.transform(this.bsValueIni, 'dd/MM/yyyy');

          if (this.isChangeAllowed == false && this.isIncreased == false && this.isDecreased == false) {
            modalRef.componentInstance.SCHANGETYP = "1";
          }
          else if (this.isChangeAllowed && this.isIncreased && this.isDecreased == false) {
            modalRef.componentInstance.SCHANGETYP = "2";
          }
          else if (this.isChangeAllowed && this.isIncreased == false && this.isDecreased) {
            modalRef.componentInstance.SCHANGETYP = "3";
          }
          else if (this.isChangeAllowed && this.isIncreased && this.isDecreased) {
            modalRef.componentInstance.SCHANGETYP = "4";
          }

          modalRef.componentInstance.NPREMIRAT = this.inputsModule.NPREMIRAT;
          modalRef.componentInstance.dataListCoverEsp = this.dataList;

          let index1 = this.dataList.findIndex((value) => value.NCOVER == nCover && value.NCOVERGEN == item.NCOVERGEN);
          if (index1 > -1)
            modalRef.componentInstance.SORIGEN = this.dataList[index1].SORIGEN;

          modalRef.result.then((result) => {
            if (nCover === 0) {
              if (result !== "save") {
                item.chk = false;
              }
            }
          }, (reason) => {
            if (nCover === 0) {
              if (reason === "dismiss") {
                item.chk = false;
              }
            }
          });
          modalRef.componentInstance.passEntry.subscribe((receivedEntry) => {
            var data = [];
            data = JSON.parse(JSON.stringify(this.dataList));

            if (this.dataList.length === 0)
              this.dataList.push(receivedEntry);
            else {
              for (let elem of data) {
                if (elem.NCOVER === receivedEntry.NCOVER && elem.NCOVERGEN === receivedEntry.NCOVERGEN) {
                  const pos = this.dataList.map(function (e) { return e.NCOVER; }).indexOf(receivedEntry.NCOVER);
                  if (pos > -1) {
                    receivedEntry.SORIGEN = "APP";
                    this.dataList[pos] = receivedEntry;
                    break;
                  }
                }
                else {
                  const pos = this.dataList.map(function (e) { return e.NCOVER; }).indexOf(receivedEntry.NCOVER);
                  if (pos > -1) {
                    receivedEntry.SORIGEN = "APP";
                    this.dataList[pos] = receivedEntry;
                    break;
                  }
                  else {
                    receivedEntry.SORIGEN = "APP";
                    this.dataList.push(receivedEntry);
                    break;
                  }
                }
              }
            }

            this.dataList = this.dataList.filter(function (elem, index, self) {
              return index === self.indexOf(elem);
            })
          })
        },
        err => { }
      )
    }
  }

  selectOne(item, nbranch, accion, row) {
    let modalRef: NgbModalRef;
    let nCover: number;
    let data: any = {};

    data.NBRANCH = this.inputsModule.NBRANCH;
    data.NPRODUCT = this.inputsModule.NPRODUCT;
    data.NMODULEC = this.inputsModule.NMODULEC;
    data.NCOVERGEN = item.NCOVERGEN;

    if (item.chk) {
      if (!this.validateEffectDate()) {
        this.fefecto.nativeElement.focus();
        item.chk = false;
        swal.fire("Información", "- Ingrese la fecha de efecto.", "error");
        return;
      }

      this.indexEdit = 0;
      this.coverService.getCoverEspCode(data).subscribe(
        res => {
          var data = JSON.stringify(res);
          var json = JSON.parse(data);
          nCover = json.NCOVER;

          modalRef = this.modalService.open(CoverSpecificInformationComponent, { size: 'lg', windowClass: "modalCustom", backdropClass: 'light-blue-backdrop', backdrop: 'static', keyboard: false });
          modalRef.componentInstance.reference = modalRef;
          modalRef.componentInstance.NCOVERGEN = item.NCOVERGEN;
          modalRef.componentInstance.NBRANCH = this.inputsModule.NBRANCH;
          modalRef.componentInstance.NPRODUCT = this.inputsModule.NPRODUCT;

          if (this.inputsModule.MODEFORM === "Clone") {
            modalRef.componentInstance.NMODULEC = this.nmodulecNew;
            modalRef.componentInstance.NMODULEC_LOAD = this.nmodulecLoad;
          }
          else {
            modalRef.componentInstance.NMODULEC = this.inputsModule.NMODULEC;
          }

          modalRef.componentInstance.NCOVER = nCover;
          modalRef.componentInstance.SACCION = accion;
          modalRef.componentInstance.SMODEFORM = this.inputsModule.MODEFORM;
          modalRef.componentInstance.DEFFECDATE = this.datepipe.transform(this.bsValueIni, 'dd/MM/yyyy');
          if (this.isChangeAllowed == false && this.isIncreased == false && this.isDecreased == false) {
            modalRef.componentInstance.SCHANGETYP = "1";
          }
          else if (this.isChangeAllowed && this.isIncreased && this.isDecreased == false) {
            modalRef.componentInstance.SCHANGETYP = "2";
          }
          else if (this.isChangeAllowed && this.isIncreased == false && this.isDecreased) {
            modalRef.componentInstance.SCHANGETYP = "3";
          }
          else if (this.isChangeAllowed && this.isIncreased && this.isDecreased) {
            modalRef.componentInstance.SCHANGETYP = "4";
          }

          modalRef.componentInstance.NPREMIRAT = this.inputsModule.NPREMIRAT;
          modalRef.componentInstance.dataListCoverEsp = this.dataList;
          modalRef.componentInstance.controlDisabled = this.controlDisabled;
          if (this.dataList.length > 0 && this.dataList[0] != undefined) {
            let index = this.dataList.findIndex((value) => value.NCOVER == nCover && value.NCOVERGEN == item.NCOVERGEN);
            if (index == 0) {
              modalRef.componentInstance.SORIGEN = this.dataList[index].SORIGEN;
            }
          }

          modalRef.result.then((result) => {
            if (nCover === 0) {
              if (result !== "save") {
                item.chk = false;
              }
            }
          }, (reason) => {
            if (nCover === 0) {
              if (reason === "dismiss") {
                item.chk = false;
              }
            }
          });

          modalRef.componentInstance.passEntry.subscribe((receivedEntry) => {
            this.dataList.push(receivedEntry);
            this.inputsLifeCover = receivedEntry;
          })

        },
        err => { }
      )
    }
    else {
      let data: any = {};
      let edit = document.getElementById("edit-" + row + 1) as HTMLHtmlElement;
      let elem: Element = document.getElementById("edit-" + row + 1)
      data.NBRANCH = this.inputsModule.NBRANCH;
      data.NPRODUCT = this.inputsModule.NPRODUCT;
      data.NMODULEC = this.inputsModule.NMODULEC;
      data.NCOVERGEN = item.NCOVERGEN;

      this.coverService.getCoverEspByCoverGen(data).subscribe(
        res => {
          var jsonDataList;
          let foo: Life_coverRequest;
          if (res.length > 0) {
            jsonDataList = JSON.stringify(res[0]);
            foo = Object.assign(new Life_coverRequest(), JSON.parse(jsonDataList));
          }

          if (this.dataList.length === 0) {
            this.dataList.push(foo);
            this.dataList.forEach(element => {
              if (element.NCOVER !== res[0].NCOVER) {
                this.dataList.push(foo);
              }
            });
          }
          else {
            for (let element of this.dataList) {
              if (element.SORIGEN == 'BD') {
                this.indexEdit = row;

                element.SACCION = 'UPD';
                element.DNULLDATE = this.datepipe.transform(new Date(), 'dd/MM/yyyy');
                const pos = this.dataList.map(function (e) { return e.NCOVER; }).indexOf(element.NCOVER);
                if (pos > -1) {
                  this.dataList[pos] = element;
                  break;
                }
              }
              else {
                const pos = this.dataList.map(function (e) { return e.NCOVER; }).indexOf(element.NCOVER);
                if (pos > -1)
                  this.dataList.splice(pos, 1);
              }
            }
          }
        },
        err => { }
      );
    }
  }

  selectAll(event) {
    if (event.currentTarget.checked) {
      this.checkboxes.forEach((element) => {
        element.nativeElement.checked = true;
      });
    }
    else {
      this.checkboxes.forEach((element) => {
        element.nativeElement.checked = false;
      });
    }
  }

  getCoverList(flag) {
    this.listToShow = [];
    this.isLoading = true;

    let data: any = {};
    data.NBRANCH = this.inputsModule.NBRANCH;
    data.NPRODUCT = this.inputsModule.NPRODUCT;
    data.NMODULEC = this.inputsModule.NMODULEC;

    this.coverService.GetCoverList(data).subscribe(
      res => {
        res.forEach(item => {
          item.chk = false;
          item.state = false;
        });

        this.coverList = res;
        this.totalItems = this.coverList.length;
        this.itemsPerPage = this.coverList.length;
        this.listToShow = this.coverList.slice(((this.currentPage - 1) * this.itemsPerPage), (this.currentPage * this.itemsPerPage));
        if (flag) {
          this.lifeCoverService.GetLifeCoverList(data).subscribe(
            res => {
              this.lifeCoverList = res;
              this.dataList = res;
              this.coverList.forEach(cov => {
                this.lifeCoverList.forEach(lif => {
                  if (cov.NCOVERGEN == lif.NCOVERGEN && lif.DNULLDATE === "") {
                    this.hasEspecificCover = true;
                    cov.chk = true;
                    cov.state = false;
                  }
                });
              });
            },
            err => { }
          );
        }

        this.isLoading = false;
      },
      err => {
        this.isLoading = false;
      }
    );
  }

  pageChanged(currentPage) {
    this.currentPage = currentPage;
    this.listToShow = this.coverList
    this.listToShow = this.coverList.slice(((this.currentPage - 1) * this.itemsPerPage), (this.currentPage * this.itemsPerPage));
  }

  loadModuleInForm() {
    let data: any = {};
    data.NBRANCH = this.inputsModule.NBRANCH;
    data.NPRODUCT = this.inputsModule.NPRODUCT;
    data.NMODULEC = this.inputsModule.NMODULEC;

    if (this.inputsCover.Accion === "EDI" || this.inputsCover.Accion === "QUE" || this.inputsCover.Accion === "CLO") {

      this.moduleService.GetModuleByCode(data).subscribe(
        res => {
          this.isLoading = false;
          this.moduleList = res;

          if (this.moduleList.length == 0) {
            swal.fire({
              title: "Información",
              text: "No se encuentran módulos con los datos ingresados",
              icon: "error",
              confirmButtonText: 'OK',
              allowOutsideClick: false,
            }).then((result) => {
              if (result.value) {
                return;
              }
            });
          }
          else {
            if (this.inputsCover.Accion === "CLO") {
              this.inputsModule.SDESCRIPT = null;
              this.inputsModule.SSHORT_DES = null;
            }
            else {
              this.inputsModule.SDESCRIPT = res[0].SDESCRIPT.trim();
              this.inputsModule.SSHORT_DES = res[0].SSHORT_DES.trim();
            }

            this.bsValueIni = new Date(this.datepipe.transform(res[0].DEFFECDATE, 'MM/dd/yyyy hh:mm:ss'));

            this.inputsModule.SCONDSVS = res[0].SCONDSVS == null ? "" : res[0].SCONDSVS.trim();
            this.inputsModule.NCHPRELEV = res[0].NCHPRELEV == 0 ? null : res[0].NCHPRELEV;

            if (res[0].SREQUIRE === "1")
              this.isRequired = true;
            else
              this.isRequired = false;

            if (res[0].SDEFAULTI === "1")
              this.isPreselected = true;
            else
              this.isPreselected = false;

            if (res[0].SVIGEN === "1")
              this.isSellAllowed = true;
            else
              this.isSellAllowed = false;

            if (res[0].SCHANGETYP === "1" && res[0].SCHANALLO === "2") {
              this.isChangeAllowed = false;
              this.isIncreased = false;
              this.isDecreased = false;
              this.increaseDisabled = true;
              this.decreaseDisabled = true;
              if (this.inputsCover.Accion === "QUE") {
                this.chkDecreaseDisabled = true;
                this.chkIncreaseDisabled = true;
              }
              else {
                this.chkDecreaseDisabled = false;
                this.chkIncreaseDisabled = false;
              }
            }
            else if (res[0].SCHANGETYP === "2" && res[0].SCHANALLO === "1") {
              this.isChangeAllowed = true;
              this.isIncreased = true;
              this.isDecreased = false;
              this.increaseDisabled = false;
              this.decreaseDisabled = true;
              if (this.inputsCover.Accion == "QUE") {
                this.chkDecreaseDisabled = true;
                this.chkIncreaseDisabled = true;
              }
              else {
                this.chkDecreaseDisabled = false;
                this.chkIncreaseDisabled = false;
              }
            }
            else if (res[0].SCHANGETYP === "3" && res[0].SCHANALLO === "1") {
              this.isChangeAllowed = true;
              this.isIncreased = false;
              this.isDecreased = true;
              if (this.inputsCover.Accion == "QUE")
                this.chkIncreaseDisabled = true;
              this.increaseDisabled = true;
              this.decreaseDisabled = false;
            }
            else if (res[0].SCHANGETYP === "4" && res[0].SCHANALLO === "1") {
              this.isChangeAllowed = true;
              this.isIncreased = true;
              this.isDecreased = true;
              this.increaseDisabled = false;
              this.decreaseDisabled = false;
              if (this.inputsCover.Accion == "QUE") {
                this.chkDecreaseDisabled = true;
                this.chkIncreaseDisabled = true;
              }
              else {
                this.chkDecreaseDisabled = false;
                this.chkIncreaseDisabled = false;
              }

            }

            this.inputsModule.NRATEPREADD = res[0].NRATEPREADD == 0 ? null : res[0].NRATEPREADD;
            this.inputsModule.NRATEPRESUB = res[0].NRATEPRESUB == 0 ? null : res[0].NRATEPRESUB;

            if (res[0].STYP_RAT === "1") {
              this.isRatedByModule = true;
              this.taxByModuleDisabled = false;
            }
            else {
              this.isRatedByModule = false;
              this.taxByModuleDisabled = true;
            }

            if (this.inputsModule.SACCION === "QUE") {
              this.increaseDisabled = true;
              this.decreaseDisabled = true;
              this.taxByModuleDisabled = true;
            }

            this.inputsModule.NPREMIRAT = res[0].NPREMIRAT == 0 ? null : res[0].NPREMIRAT;
            this.getCoverList(true);
            this.getRateList();

          }
        },
        err => {
          this.isLoading = false;
        }
      )
    }
    else {
      this.getCoverList(false);
    }
  }

  getRateList() {
    let data: any = {};

    data.NBRANCH = this.inputsModule.NBRANCH;
    data.NPRODUCT = this.inputsModule.NPRODUCT;
    data.NMODULEC = this.inputsModule.NMODULEC;

    this.coverService.GetCoverRateList(data).subscribe(
      res => {
        this.dataListRate = res;
      },
      err => {
        this.isLoading = false;
      }
    );
  }

  documentNumberKeypress(event: any) {
    CommonMethods.textValidate(event, 1)
  }

  onSellAllowed(event) {
    if (event.target.checked)
      this.isSellAllowed = true;
    else
      this.isSellAllowed = false;
  }

  onPaste(event: ClipboardEvent) {
    let clipboardData = event.clipboardData;
    let pastedText = clipboardData.getData('text');
    if (!isNumeric(pastedText)) {
      event.preventDefault()
    }
  }

  onPreselected(event) {
    if (event.target.checked)
      this.isPreselected = true;
    else
      this.isPreselected = false;
  }

  onRequired(event) {
    if (event.target.checked)
      this.isRequired = true;
    else
      this.isRequired = false;
  }

  loadModuleCode() {
    let data: any = {};
    data.NBRANCH = this.inputsModule.NBRANCH;
    data.NPRODUCT = this.inputsModule.NPRODUCT;
    this.moduleService.getModuleCode(data).subscribe(
      res => {
        var data = JSON.stringify(res);
        var json = JSON.parse(data);
        this.inputsModule.NMODULEC = json.NMODULEC;
      },
      err => {
      }
    )
  }

  onChangeAllowed(event) {
    if (event.target.checked) {
      if (this.inputsModule.SACCION === "EDI" || this.inputsModule.SACCION === "INS") {
        if (this.inputsModule.NRATEPREADD != null && this.inputsModule.NRATEPREADD != 0) {
          this.isIncreased = true;
          this.increaseDisabled = false;
        }

        if (this.inputsModule.NRATEPRESUB != null && this.inputsModule.NRATEPRESUB != 0) {
          this.isDecreased = true;
          this.decreaseDisabled = false;
        }

      }

      this.chkIncreaseDisabled = false;
      this.chkDecreaseDisabled = false;
    }
    else {
      if (this.inputsModule.SACCION === "EDI" || this.inputsModule.SACCION === "INS") {
        if (this.inputsModule.NRATEPREADD != null && this.inputsModule.NRATEPREADD != 0) {

        }

        if (this.inputsModule.NRATEPRESUB != null && this.inputsModule.NRATEPRESUB != 0) {

        }
      }
      this.isIncreased = false;
      this.isDecreased = false;
      this.increaseDisabled = true;
      this.decreaseDisabled = true;
      this.chkIncreaseDisabled = true;
      this.chkDecreaseDisabled = true;
      this.inputsModule.NRATEPREADD = null;
      this.inputsModule.NRATEPRESUB = null;
    }
  }

  onPercentChanged(event, control) {
    if (event.target.checked) {
      if (control === "rat") {
        this.isRatedByModule = true;
        this.taxByModuleDisabled = false;
      }
      else if (control === "inc") {
        this.increaseDisabled = false;
        this.isIncreased = true;
      }
      else {
        this.isDecreased = true;
        this.decreaseDisabled = false;
      }
    }
    else {
      if (control === "rat") {
        this.isRatedByModule = false;
        this.taxByModuleDisabled = true;
        this.inputsModule.NPREMIRAT = null;
      }
      else if (control === "inc") {
        this.isIncreased = false;
        this.increaseDisabled = true;
        this.inputsModule.NRATEPREADD = null;
      }
      else {
        this.isDecreased = false;
        this.decreaseDisabled = true;
        this.inputsModule.NRATEPRESUB = null;
      }
    }
  }

  changeStateControls(accion) {
    if (accion === "NEW" || accion === "EDI") {
      this.controlDisabled = false;
    }
    else if (accion === "QUE") {
      this.controlDisabled = true;
    }
  }

  back() {
    if (this.inputsCover.Accion === "EDI" || this.inputsCover.Accion == "INS" || this.inputsCover.Accion === "CLO") {
      swal.fire({
        title: "Información",
        text: "¿Estás seguro de salir del formulario?",
        icon: "question",
        showCancelButton: true,
        confirmButtonText: 'Si',
        allowOutsideClick: false,
        cancelButtonText: 'No'
      }).then((result) => {
        if (result.value)
          this.router.navigate(['/extranet/module'], { queryParams: { ListSearched: this.listSearched, BranchCode: this.inputsModule.NBRANCH, ProductCode: this.productCodeSearched, EffectDate: this.fechaEfectoSearched, EstadoBack: "T" } });
      });
    }
    else {
      this.router.navigate(['/extranet/module'], { queryParams: { ListSearched: this.listSearched, BranchCode: this.inputsModule.NBRANCH, ProductCode: this.productCodeSearched, EffectDate: this.fechaEfectoSearched, EstadoBack: "T" } });
    }
  }

  openModal() {
    let modalRef: NgbModalRef;

  }

  validateDecimal(int, decimal, index) {
    let input: any;
    if (index == 3)
      input = this.inputsModule.NRATEPREADD;
    else if (index == 4)
      input = this.inputsModule.NRATEPRESUB;
    else if (index == 5)
      input = this.inputsModule.NPREMIRAT;

    if (input != null && input != "") {
      var result = CommonMethods.validateDecimals(int, decimal, input);
      if (result != "") {
        this.inputsValidate[index] = true;
        this.inputsValidate_module[index] = result;
      }
      else {
        this.inputsValidate[index] = false;
        this.inputsValidate_module[index] = "";
      }
    }
  }

  eventSave(event) {

    let strError: string = "";
    if (!this.validateEffectDate()) {
      this.inputsValidate[0] = true;
      strError += "- Ingrese la fecha de efecto.<br/>";
    }

    if (this.inputsModule.SDESCRIPT === null || this.inputsModule.SDESCRIPT === "") {
      this.inputsValidate[1] = true
      strError = "- Ingrese la descripción.<br/>";
    }

    if (this.inputsModule.SSHORT_DES == null || this.inputsModule.SSHORT_DES === "") {
      this.inputsValidate[2] = true;
      strError += "- Ingrese la descripción abreviada.<br/>";
    }

    if (this.inputsValidate[3] || this.inputsValidate[4] || this.inputsValidate[5]) {
      strError += "Existen errores de formato de números en algunos campos.<br/>";
    }

    if (this.isChangeAllowed && this.isIncreased == false && this.isDecreased == false) {
      strError += "- Debe seleccionar almenos aumentar o disminuir e ingresar su %.<br/>";
    }

    if (this.isChangeAllowed && this.isIncreased && (this.inputsModule.NRATEPREADD == null || this.inputsModule.NRATEPREADD == 0))
      strError += "- Ingrese el % de aumento.<br/>";

    if (this.isChangeAllowed && this.isDecreased && (this.inputsModule.NRATEPRESUB == null || this.inputsModule.NRATEPRESUB == 0))
      strError += "- Ingrese el % de disminución.<br/>";

    if (this.isRatedByModule && (this.inputsModule.NPREMIRAT == null || this.inputsModule.NPREMIRAT == 0)) {
      strError += "- Ingrese la tasa.<br/>";
    }

    let flag: boolean = false;

    if ((this.dataList.length === 0 && this.hasEspecificCover == false) || this.dataList[0] == undefined) {
      strError += "- Asocie al menos una cobertura al módulo.<br/>";
    }
    else {
      for (let item of this.dataList) {
        if (item.DNULLDATE == "" || item.DNULLDATE == null)
          flag = false;
        else
          flag = true;
      }
      if (flag)
        strError += "- Asocie al menos una cobertura al módulo.<br/>";
    }


    if (strError !== "") {
      swal.fire("Información", strError, "error");
      return;
    }

    let textMsg: string = "";
    let textButton: string = "";
    let txtInfo: string = "";

    if (this.inputsModule.MODEFORM === "Clone") {
      textMsg = '¿Estás seguro de clonar el módulo?';
      textButton = "Clonar";
      txtInfo = 'Se ha realizado la clonación correctamente.';
    }
    else if (this.inputsModule.MODEFORM === "Edit") {
      textMsg = '¿Estás seguro de actualizar el módulo?';
      textButton = "Actualizar";
      txtInfo = 'Se ha realizado la actualización correctamente.';
    }
    else {
      textMsg = '¿Estás seguro de crear el módulo?';
      textButton = 'Crear';
      txtInfo = 'Se ha realizado el registro correctamente.';
    }

    swal.fire({
      title: "Información",
      text: textMsg,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: textButton,
      allowOutsideClick: false,
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.value) {


        if (this.isRequired)
          this.inputsModule.SREQUIRE = "1";
        else
          this.inputsModule.SREQUIRE = "2";

        if (this.isPreselected)
          this.inputsModule.SDEFAULTI = "1";
        else
          this.inputsModule.SDEFAULTI = "2";

        if (this.isSellAllowed)
          this.inputsModule.SVIGEN = "1";
        else
          this.inputsModule.SVIGEN = "2";

        if (this.isChangeAllowed == false && this.isIncreased == false && this.isDecreased == false) {
          this.inputsModule.SCHANGETYP = "1";
          this.inputsModule.SCHANALLO = "2";
        }
        else if (this.isChangeAllowed && this.isIncreased && this.isDecreased == false) {
          this.inputsModule.SCHANGETYP = "2";
          this.inputsModule.SCHANALLO = "1";
        }
        else if (this.isChangeAllowed && this.isIncreased == false && this.isDecreased) {
          this.inputsModule.SCHANGETYP = "3";
          this.inputsModule.SCHANALLO = "1";
        }
        else if (this.isChangeAllowed && this.isIncreased && this.isDecreased) {
          this.inputsModule.SCHANGETYP = "4";
          this.inputsModule.SCHANALLO = "1";
        }

        if (this.isRatedByModule)
          this.inputsModule.STYP_RAT = "1";
        else
          this.inputsModule.STYP_RAT = "2";

        if (this.inputsModule.SACCION === "CLO") {
          this.inputsModule.SACCION = "INS";
        }
        let data: any = {};
        data.NBRANCH = this.inputsModule.NBRANCH;
        data.NPRODUCT = this.inputsModule.NPRODUCT;
        this.moduleService.getModuleCode(data).subscribe(
          res => {
            var data = JSON.stringify(res);
            var json = JSON.parse(data);

            if (this.inputsModule.SACCION === "EDI") {
              this.inputsModule.NMODULEC = this.nmodulecLoad;
            }
            else
              this.inputsModule.NMODULEC = json.NMODULEC;

            this.inputsModule.DEFFECDATE = this.datepipe.transform(this.bsValueIni, 'dd/MM/yyyy hh:mm:ss');

            this.moduleService.updateModule(this.inputsModule).subscribe(
              res => {
                if (res.P_NCODE == 0) {
                  if (this.inputsModule.MODEFORM != "Clone") {

                    this.dataList = this.dataList.filter(function (obj) {
                      return obj.SORIGEN !== "BD";
                    });
                  }

                  var jsonDataList = JSON.stringify(this.dataList);
                  var jsonRateList = JSON.stringify(this.dataListRate);
                  let foo: Array<Life_coverRequest> = Object.assign(new Array<Life_coverRequest>(), JSON.parse(jsonDataList));
                  let rateList: Array<CoverRateBM> = Object.assign(new Array<CoverRateBM>(), JSON.parse(jsonRateList));

                  let data: any = {};
                  data.NBRANCH = this.inputsModule.NBRANCH;
                  data.NPRODUCT = this.inputsModule.NPRODUCT;
                  data.NMODULEC = this.nmodulecLoad;

                  foo.forEach(element => {
                    if (this.inputsModule.MODEFORM === "Clone") {
                      element.SACCION = "INS";
                      element.NMODULEC = json.NMODULEC;
                      element.SCHANGETYP = this.inputsModule.SCHANGETYP;
                      element.NPREMIRAT = this.inputsModule.NPREMIRAT;
                      element.DEFFECDATE = this.datepipe.transform(this.bsValueIni, 'dd/MM/yyyy');
                    }
                    this.coverService.insertModuleDetail(element).subscribe(
                      res => {
                        if (res.P_NCODE == 0) {
                          if (this.inputsModule.MODEFORM === "Clone") {
                            let data: any = {};

                            data.NBRANCH = this.inputsModule.NBRANCH;
                            data.NPRODUCT = this.inputsModule.NPRODUCT;
                            data.NMODULEC = this.nmodulecLoad;
                            data.NCOVER = element.NCOVER;

                            this.coverService.GetCoverRateList(data).subscribe(
                              res => {
                                this.dataListRate = res;
                                var jsonRateList = JSON.stringify(this.dataListRate);
                                let rateList: Array<CoverRateBM> = Object.assign(new Array<CoverRateBM>(), JSON.parse(jsonRateList));
                                rateList.forEach(elementR => {

                                  let dataX: any = {};
                                  let nCover: number;

                                  dataX.NBRANCH = this.inputsModule.NBRANCH;
                                  dataX.NPRODUCT = this.inputsModule.NPRODUCT;
                                  dataX.NMODULEC = this.inputsModule.NMODULEC;
                                  dataX.NCOVERGEN = element.NCOVERGEN;

                                  this.coverService.getCoverEspCode(dataX).subscribe(
                                    res => {
                                      var cod = JSON.stringify(res);
                                      var json = JSON.parse(cod);
                                      nCover = json.NCOVER;
                                      elementR.SACCION = 'INS';
                                      elementR.NMODULEC = element.NMODULEC;
                                      elementR.NCOVER = nCover;
                                      elementR.DEFFECDATE = this.datepipe.transform(this.bsValueIni, 'dd/MM/yyyy');
                                      this.coverService.insertRateDetail(elementR).subscribe(
                                        res => {
                                          if (res.P_NCODE == 0) {

                                          }
                                        },
                                        err => {
                                          swal.fire("Información", err.statusText, "warning");
                                        }
                                      );
                                    }
                                  );
                                })
                              },
                              err => {
                                this.isLoading = false;
                              }
                            );
                          }
                        }
                      },
                      err => {
                        swal.fire("Información", err.statusText, "warning");
                      }
                    );
                  });

                  if (this.inputsModule.MODEFORM !== "Clone") {
                    rateList = rateList.filter(function (obj) {
                      return obj.SORIGEN !== "BD";
                    });

                    rateList.forEach(element => {
                      this.coverService.insertRateDetail(element).subscribe(
                        res => {
                        },
                        err => {
                          swal.fire("Información", err.statusText, "warning");
                        }
                      );
                    })
                  }
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
          },
          err => { }
        )

        swal.fire("Información", txtInfo, "success").
          then((value) => {
            this.router.navigate(['/extranet/module']);
          });
      }
    });
  }
}
