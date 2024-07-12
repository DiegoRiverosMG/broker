import { Component, OnInit, ViewChild } from '@angular/core';
import { DatePipe } from '@angular/common';
import { BsDatepickerConfig } from 'ngx-bootstrap/datepicker';
import { ClientInformationService } from '../../../services/shared/client-information.service';
import { DemandProcessService } from '../../../services/demand-process/demand-process.service';
import swal from 'sweetalert2';

@Component({
  selector: 'app-process-demand-index',
  templateUrl: './process-demand-index.component.html',
  styleUrls: ['./process-demand-index.component.css']
})
export class ProcessDemandIndexComponent implements OnInit {
  bsValueIni: Date = new Date();
  bsValueFin: Date = new Date();  //Fecha final del componente
  bsValueFinMax: Date = new Date();
  @ViewChild('bsDatepicker') bsDatepicker: any;
  bsConfig: Partial<BsDatepickerConfig>;

  inputsDemandProcess: any = {};
  valueErrorDate: string = "";

  public existResults: boolean;
  isLoading: boolean = false;
  controlDisabled: boolean;
  isFormatDateCorrect: boolean = true;
  stateSearch: boolean = false;

  branchList: any = [];
  productList: any = [];
  documentTypeSntList: any = [];
  listToShow: any = [];
  typeDocumentSunatList: any = [];

  demandProcessList: any = [];
  processHeaderList: any = [];
  currentPage = 1; // página actual
  rotate = true; //
  maxSize = 10; // cantidad de paginas que se mostrarán en el paginado
  itemsPerPage = 5; // limite de items por página
  totalItems = 0; // total de items encontrados

  constructor(
    private clientInformationService: ClientInformationService,
    private demandProcessService: DemandProcessService
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

    this.inputsDemandProcess.NBRANCH = null;
    this.inputsDemandProcess.NPRODUCT = null;
    this.inputsDemandProcess.NPOLICY = null;
    this.inputsDemandProcess.SBILLTYPE = '5';
    this.inputsDemandProcess.NINSUR_AREA = null;
    this.inputsDemandProcess.NSERIENUM = null;
    this.inputsDemandProcess.NBILLNUM = null;
    this.inputsDemandProcess.SMAIL = null;
    this.inputsDemandProcess.NDOCTYPESUNAT = "-1";
    this.getBranchList();
    this.GetDocumentTypeSntList();
    this.getDefaultMail();

  }

  getDefaultMail() {
    this.clientInformationService.getMailFE().subscribe(
      res => {
        this.inputsDemandProcess.SMAIL = res;
      },
      err => {
      });
  }

  getProductsListByBranch() {
    this.clientInformationService.getProductsListByBranch(this.inputsDemandProcess.NBRANCH).subscribe(

      res => {
        console.log(res);
        this.productList = res;

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

  GetDocumentTypeSntList() {

    this.clientInformationService.getDocumentTypeSntList().subscribe(
      res => {
        this.documentTypeSntList = res;
      },
      err => {
      }
    );
  }

  onSelectBranch() {
    this.productList = null;
    if (this.inputsDemandProcess.NBRANCH != null) {
      this.getProductsListByBranch();
    }
  }

  pageChanged(currentPage) {
    this.currentPage = currentPage;
    this.listToShow = this.demandProcessList.slice(((this.currentPage - 1) * this.itemsPerPage), (this.currentPage * this.itemsPerPage));
  }

  isValidDate() {
    var flag = true;
    // regular expression to match required date format
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

  validateEffectDate(fechaEfecto) {
    let effectDate;
    let dayIni, monthPreviewIni, monthIni, yearIni;
    if (fechaEfecto == null)
      effectDate = this.bsDatepicker.nativeElement.value;
    else {
      dayIni = fechaEfecto.getDate() < 10 ? "0" + fechaEfecto.getDate() : fechaEfecto.getDate();
      monthPreviewIni = fechaEfecto.getMonth() + 1;
      monthIni = monthPreviewIni < 10 ? "0" + monthPreviewIni : monthPreviewIni;
      yearIni = fechaEfecto.getFullYear();
      effectDate = dayIni + "/" + monthIni + "/" + yearIni;;
    }

    if (effectDate === "") {
      this.valueErrorDate = "required";
    }
    else {
      if (!this.isValidDate()) {
        this.valueErrorDate = "badFormat";
      }
      else {
        this.valueErrorDate = "";
      }
    }

    return this.isFormatDateCorrect;
  }

  selectAll(item) {
    this.listToShow.forEach(element => {
      console.log(element);
      if (item.currentTarget.checked == true) {
        if (element.chk == false)
          element.chk = true;
      }
      else {
        element.chk = false;
      }

    });

  }

  validarEmail() {
    let emailRegex = /^[-\w.%+]{1,64}@(?:[A-Z0-9-]{1,63}\.){1,125}[A-Z]{2,63}$/i;
    let correo = this.inputsDemandProcess.SMAIL;
    if (!emailRegex.test(correo)) {
      alert('correo invalido');
    }
  }

  sendSunat() {
    let count: number = 0;
    let countFlag: number = 0;
    let flag: boolean = false;
    this.isLoading = true;

    if (this.listToShow.length == 0) {
      this.isLoading = false;
      swal.fire("Error", "No ha seleccionado ningúna factura a enviar", "error");
    }
    else {
      this.listToShow.forEach(element => {
        if (element.chk == false) {
          countFlag++;
        }

        if (this.listToShow.length == countFlag) {
          this.isLoading = false;
          swal.fire("Error", "No ha seleccionado ningúna factura a enviar", "error");
        }
      });
    }


    this.listToShow.forEach(element => {
      if (element.chk) {
        let data: any = {};
        let dataDemand: any = {};
        data.BILLTYPE = element.SBILLTYPE;
        data.SBILLING = element.SBILLING;
        data.NINSUR_AREA = element.NINSUR_AREA;
        data.NBILLNUM = element.NBILLNUM;
        this.clientInformationService.getMailFE().subscribe(
          res => {
            if (this.inputsDemandProcess.SMAIL == null)
              data.OPERADOR = res;
            else
              data.OPERADOR = this.inputsDemandProcess.SMAIL.toString().trim();
            this.demandProcessService.ExecuteServiceSunat(data).subscribe(
              res => {
                console.log(res);
                console.log(res.resultado);
                if (res.resultado == "ok") {
                  count++;
                  dataDemand.SBILLTYPE = element.SBILLTYPE;
                  dataDemand.NINSUR_AREA = element.NINSUR_AREA;
                  dataDemand.NBILLNUM = element.NBILLNUM;

                  this.demandProcessService.updateDemandState(dataDemand).subscribe(
                    res => {
                      console.log(res);
                      count++;
                      if (res.P_NCODE == 1) {
                        flag = true;
                      }

                      this.demandProcessList = this.listToShow.filter(filter => filter.chk == true);
                      if (this.demandProcessList.length == count) {
                        if (flag) {
                          swal.fire("Error", res.P_SMESSAGE, "error");
                        }
                        else {
                          this.isLoading = false;
                          swal.fire("Información", res.P_SMESSAGE, "success");

                        }
                        this.searchProcess('SEND');
                      }
                    }
                  );
                }

                else
                  count = 0;

                if (count = 0) {
                  alert('error');
                }



                var data = JSON.stringify(res);
              },
              err => {
                console.log(err);
              }
            );
          }
        );

      }
    });
  }
  changeSerie(serie) {
    if (serie.length > 0) {
      this.stateSearch = true;
    }
    else {
      this.stateSearch = false;
      this.inputsDemandProcess.NBRANCH = null;
      this.inputsDemandProcess.NPRODUCT = null;
      this.inputsDemandProcess.NPOLICY = null;
    }
  }

  changeNumber(number) {
    if (number.length > 0) {
      this.stateSearch = true;
    }
    else {
      this.stateSearch = false;
    }
  }

  numberKeyPress(event) {
    if (this.inputsDemandProcess.NSERIENUM == null) {
      swal.fire("Error", "Ingrese el número de serie.", "error");
      this.stateSearch = false;
      event.preventDefault();
    }
    else {
      this.stateSearch = true;
    }

  }

  policyKeyPress(event) {
    if ((event.ctrlKey || event.metaKey) && event.keyCode == 67)
      console.log('CTRL + C');
    if ((event.ctrlKey || event.metaKey) && event.keyCode == 86)
      console.log('CTRL +  V');

    let strError = "";

    if (this.inputsDemandProcess.NBRANCH == null) {
      strError = "- Seleccione un ramo";
    }
    else if (this.inputsDemandProcess.NPRODUCT == null) {
      strError += "- Seleccione un producto";
    }

    if (strError != "")
      swal.fire("Error", strError, "error");
  }

  searchProcess(from) {
    this.isLoading = true;
    if (!this.validateEffectDate(null)) {
      return;
    }


    let data: any = {};
    data.NBRANCH = this.inputsDemandProcess.NBRANCH == null ? 0 : this.inputsDemandProcess.NBRANCH;
    data.NPRODUCT = this.inputsDemandProcess.NPRODUCT == null ? 0 : this.inputsDemandProcess.NPRODUCT;
    data.NPOLICY = this.inputsDemandProcess.NPOLICY == null ? 0 : this.inputsDemandProcess.NPOLICY;
    data.SBILLTYPE = this.inputsDemandProcess.SBILLTYPE == null ? "" : this.inputsDemandProcess.SBILLTYPE;
    let dayIni, monthPreviewIni, monthIni, yearIni;
    let dayFin, monthPreviewFin, monthFin, yearFin;
    dayIni = this.bsValueIni.getDate() < 10 ? "0" + this.bsValueIni.getDate() : this.bsValueIni.getDate();
    monthPreviewIni = this.bsValueIni.getMonth() + 1;
    monthIni = monthPreviewIni < 10 ? "0" + monthPreviewIni : monthPreviewIni;
    yearIni = this.bsValueIni.getFullYear();
    dayFin = this.bsValueFin.getDate() < 10 ? "0" + this.bsValueFin.getDate() : this.bsValueFin.getDate();
    monthPreviewFin = this.bsValueFin.getMonth() + 1;
    monthFin = monthPreviewFin < 10 ? "0" + monthPreviewFin : monthPreviewFin;
    yearFin = this.bsValueFin.getFullYear();

    data.NSERIENUM = this.inputsDemandProcess.NSERIENUM == null ? 0 : this.inputsDemandProcess.NSERIENUM;
    data.NBILLNUM = this.inputsDemandProcess.NBILLNUM == null ? 0 : this.inputsDemandProcess.NBILLNUM;
    data.DDESDE = dayIni + "/" + monthIni + "/" + yearIni;
    data.DHASTA = dayFin + "/" + monthFin + "/" + yearFin;
    this.demandProcessService.GetDemandProcessList(data).subscribe(
      res => {
        res.forEach(element => {
          element.chk = false;
        });
        this.demandProcessList = res;
        this.totalItems = this.demandProcessList.length;
        this.listToShow = this.demandProcessList;

        if (from == 'SEARCH') {
          if (this.demandProcessList.length === 0) {
            swal.fire({
              title: 'Información',
              text: 'No se encuentran las facturas con la fecha ingresada.',
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
        }
        this.isLoading = false;
      }
    );
  }
}
