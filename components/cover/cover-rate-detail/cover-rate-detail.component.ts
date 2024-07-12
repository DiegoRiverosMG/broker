import { Component, OnInit, Input, Output } from '@angular/core';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { CoverRateComponent } from '../cover-rate/cover-rate.component';
import { CoverService } from '../../../services/maintenance/cover/cover.service';
import swal from 'sweetalert2';
import { CoverRateBM } from '../../../models/maintenance/cover/request/cover-rate-bm';
import { EventEmitter } from '@angular/core';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-cover-rate-detail',
  templateUrl: './cover-rate-detail.component.html',
  styleUrls: ['./cover-rate-detail.component.css'],
})
export class CoverRateDetailComponent implements OnInit {
  @Input() public reference: any;
  @Input() public NBRANCH;
  NPRODUCT;
  NMODULEC;
  NCOVER;
  DEFFECDATE;
  NINDEX;
  SMODEFORM;
  controlDisabled: any;
  @Output() passEntry: EventEmitter<any> = new EventEmitter();
  @Input() public dataListRateIn: Array<CoverRateBM> = [];
  listToShow: any = [];
  coverRateList: any = [];
  dataList: Array<CoverRateBM> = [];
  inputsRate: any = {};
  existResults: boolean;
  isLoading: boolean;
  currentPage = 1; // página actual
  rotate = true; //
  maxSize = 10; // cantidad de paginas que se mostrarán en el paginado
  itemsPerPage = 5; // limite de items por página
  totalItems = 0; // total de items encontrados

  constructor(
    private modalService: NgbModal,
    private coverService: CoverService,
    private datepipe: DatePipe
  ) {}

  pageChanged(currentPage) {
    if (this.inputsRate.NPOLICY > 0) {
      this.listToShow = this.dataList.filter((filter) =>
        filter.NPOLICY.toString().startsWith(this.inputsRate.NPOLICY)
      );
      this.currentPage = currentPage;
      this.listToShow = this.listToShow.slice(
        (this.currentPage - 1) * this.itemsPerPage,
        this.currentPage * this.itemsPerPage
      );
    } else {
      this.currentPage = currentPage;
      this.listToShow = this.dataList.slice(
        (this.currentPage - 1) * this.itemsPerPage,
        this.currentPage * this.itemsPerPage
      );
    }
  }

  ngOnInit() {
    this.inputsRate.NPOLICY = null;
    let data: any = {};
    data.NBRANCH = this.NBRANCH;
    data.NPRODUCT = this.NPRODUCT;
    data.NMODULEC = this.NMODULEC;
    data.NCOVER = this.NCOVER;

    if (this.dataListRateIn.length > 0) {
      this.isLoading = false;
      this.dataList = this.dataListRateIn;
      this.listToShow = this.dataListRateIn.slice(
        (this.currentPage - 1) * this.itemsPerPage,
        this.currentPage * this.itemsPerPage
      );
    } else {
      this.coverService.GetCoverRateList(data).subscribe(
        (res) => {
          this.coverRateList = res;
          this.dataList = this.coverRateList;
          this.totalItems = this.coverRateList.length;
          this.listToShow = this.coverRateList.slice(
            (this.currentPage - 1) * this.itemsPerPage,
            this.currentPage * this.itemsPerPage
          );
          if (this.coverRateList.length != 0) {
            this.existResults = true;
          }
          this.isLoading = false;
        },
        (err) => {
          this.isLoading = false;
        }
      );
    }
  }

  polizaKeyPress(event) {
    var key = event.keyCode || event.charCode;

    if (key == 8 || key == 46) {
      if (this.inputsRate.NPOLICY == 0) {
        this.listToShow = this.dataList;
        this.totalItems = this.listToShow.length;
        this.listToShow = this.listToShow.slice(
          (this.currentPage - 1) * this.itemsPerPage,
          this.currentPage * this.itemsPerPage
        );
      } else {
        if (this.inputsRate.NPOLICY > 0) {
          this.searchRate();
        }
      }
    } else {
      if (this.inputsRate.NPOLICY > 0) {
        this.searchRate();
      }
    }
  }

  searchRate() {
    this.listToShow = this.dataList.filter((filter) =>
      filter.NPOLICY.toString().startsWith(this.inputsRate.NPOLICY)
    );
    this.totalItems = this.listToShow.length;
    this.listToShow = this.listToShow.slice(
      (this.currentPage - 1) * this.itemsPerPage,
      this.currentPage * this.itemsPerPage
    );
  }

  anular(item) {
    swal
      .fire({
        title: 'Información',
        text: '¿Estás seguro de anular la tasa?',
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Anular',
        allowOutsideClick: false,
        cancelButtonText: 'Cancelar',
      })
      .then((result) => {
        if (result.value) {
          if (item.SORIGEN === 'BD') {
            for (let rate of this.listToShow) {
              if (
                item.NCOVER === rate.NCOVER &&
                item.NCODREC === rate.NCODREC &&
                item.SBYPOLICY === rate.SBYPOLICY &&
                item.NPOLICY == rate.NPOLICY
              ) {
                let index1 = this.listToShow.findIndex(
                  (value) =>
                    value.SBYPOLICY == item.SBYPOLICY &&
                    value.NPOLICY == item.NPOLICY &&
                    value.NCODREC == item.NCODREC
                );
                let index2 = this.coverRateList.findIndex(
                  (value) =>
                    value.SBYPOLICY == item.SBYPOLICY &&
                    value.NPOLICY == item.NPOLICY &&
                    value.NCODREC == item.NCODREC
                );
                rate.DNULLDATE = this.datepipe.transform(
                  new Date(),
                  'dd/MM/yyyy'
                );
                rate.SACCION = 'UPD';
                rate.EDITED = true;
                rate.SORIGEN = 'APP';
                if (item.NPOLICY === 0) rate.SBYPOLICY = 'F';
                else rate.SBYPOLICY = 'T';
                rate.NUSERCODE = JSON.parse(
                  localStorage.getItem('currentUser')
                )['id'];
                this.listToShow[index1] = rate;
                this.coverRateList[index2] = rate;
                this.listToShow.splice(index1, 1);
                break;
              }
            }
          } else {
            for (let rate of this.listToShow) {
              if (
                item.NCOVER === rate.NCOVER &&
                item.NCODREC === rate.NCODREC
              ) {
                const pos = this.listToShow
                  .map(function (e) {
                    return e.NCODREC;
                  })
                  .indexOf(item.NCODREC);
                const posRateList = this.coverRateList
                  .map(function (e) {
                    return e.NCODREC;
                  })
                  .indexOf(item.NCODREC);
                this.listToShow.splice(pos, 1);
                this.coverRateList.splice(posRateList, 1);
                this.NINDEX = pos;
              }
            }
          }
        }
      });
  }

  edit(item, accion) {
    let modalRef: NgbModalRef;
    modalRef = this.modalService.open(CoverRateComponent, {
      size: 'lg',
      windowClass: 'modalCustom',
      backdropClass: 'light-blue-backdrop',
      backdrop: 'static',
      keyboard: false,
    });
    modalRef.componentInstance.reference = modalRef;
    modalRef.componentInstance.SACCION = accion;
    modalRef.componentInstance.DEFFECDATE = this.DEFFECDATE;
    modalRef.componentInstance.NBRANCH = this.NBRANCH;
    modalRef.componentInstance.NPRODUCT = this.NPRODUCT;
    modalRef.componentInstance.NMODULEC = this.NMODULEC;
    modalRef.componentInstance.NCOVER = this.NCOVER;
    modalRef.componentInstance.NPOLICY = item.NPOLICY;
    modalRef.componentInstance.NCODREC = item.NCODREC;
    modalRef.componentInstance.NROLE = item.NROLE;
    modalRef.componentInstance.dataList = this.dataList;
    modalRef.componentInstance.controlDisabled = this.controlDisabled;
    modalRef.componentInstance.SMODEFORM = this.SMODEFORM;
    modalRef.componentInstance.SORIGEN = 'APP';

    modalRef.componentInstance.passEntry.subscribe((receivedEntry) => {
      receivedEntry.EDITED = true;
      var data = JSON.parse(JSON.stringify(this.dataList));
      this.dataList = this.dataList.filter(function (val) {
        return val !== null;
      });
      if (this.dataList.length === 0 || this.dataList[0] === null) {
        this.dataList.push(receivedEntry);
        data = JSON.parse(JSON.stringify(this.dataList));
      } else {
        for (let item of data) {
          if (item.NCOVER === receivedEntry.NCOVER) {
            let index = this.dataList.findIndex(
              (value) =>
                value.NCODREC == receivedEntry.NCODREC &&
                value.SBYPOLICY == receivedEntry.SBYPOLICY &&
                value.NPOLICY == receivedEntry.NPOLICY
            );
            if (index > -1) {
              this.dataList[index] = receivedEntry;
              break;
            } else {
              this.dataList.push(receivedEntry);
              break;
            }
          } else {
            this.dataList.push(receivedEntry);
            break;
          }
        }
      }

      let datax: any = {};
      datax.NBRANCH = receivedEntry.NBRANCH;
      datax.NPRODUCT = receivedEntry.NPRODUCT;
      datax.NMODULEC = receivedEntry.NMODULEC;
      datax.NCOVER = receivedEntry.NCOVER;
      let flag: boolean = false;
      this.coverService.GetCoverRateList(datax).subscribe((res) => {
        this.coverRateList = res;
        this.totalItems = this.coverRateList.length;

        if (this.dataList.length > 0) {
          for (let item of this.dataList) {
            if (
              this.coverRateList.length === 0 ||
              (this.coverRateList[0] === undefined && flag === false)
            ) {
              flag = true;
            }

            if (flag) {
              this.coverRateList.push(item);
            } else {
              let index = this.coverRateList.findIndex(
                (value) =>
                  value.NCOVER == item.NCOVER &&
                  value.SBYPOLICY == item.SBYPOLICY &&
                  value.NPOLICY == item.NPOLICY
              );
              if (index > -1) {
                this.coverRateList[index] = item;
              } else {
                this.coverRateList.push(item);
                if (this.dataList.length == 1) break;
              }
            }
          }
        } else {
          for (let item of data) {
            item.NBRANCH = receivedEntry.NBRANCH;
            item.NPRODUCT = receivedEntry.NPRODUCT;
            item.NMODULEC = receivedEntry.NMODULEC;
            item.NCOVER = receivedEntry.NCOVER;
            item.NCODREC = receivedEntry.NCODREC;
            item.SRECHARGETYPE = receivedEntry.SRECHARGETYPE;
            item.NMONTHI = receivedEntry.NMONTHI;
            item.NMONTHE = receivedEntry.NMONTHE;
            item.NPERCENT = receivedEntry.NPERCENT;
            item.NAMOUNT = receivedEntry.NAMOUNT;
            item.DEFFECDATE = receivedEntry.DEFFECDATE;
            item.NCURRENCY = receivedEntry.NCURRENCY;
            item.SCURRENCY = receivedEntry.SCURRENCY;
            item.SBYPOLICY = receivedEntry.SBYPOLICY;
            item.NPOLICY = receivedEntry.NPOLICY;
            item.SORIGEN = 'APP';
            for (let itemX of this.coverRateList) {
              if (item.NCODREC == itemX.NCODREC) {
                const pos = this.coverRateList
                  .map(function (e) {
                    return e.NCODREC;
                  })
                  .indexOf(item.NCODREC);
                if (pos > -1) this.coverRateList[pos] = item;
              } else {
                this.coverRateList.push(item);
                break;
              }
            }
          }
        }
        this.coverRateList = this.coverRateList.filter(function (
          elem,
          index,
          self
        ) {
          return index === self.indexOf(elem);
        });
        this.totalItems = this.coverRateList.length;
        this.listToShow = this.coverRateList.slice(
          (this.currentPage - 1) * this.itemsPerPage,
          this.currentPage * this.itemsPerPage
        );
      });
    });
  }

  eventSave() {
    this.passEntry.emit(this.coverRateList);
  }

  addRate(accion) {
    let modalRef: NgbModalRef;
    modalRef = this.modalService.open(CoverRateComponent, {
      size: 'lg',
      windowClass: 'modalCustom',
      backdropClass: 'light-blue-backdrop',
      backdrop: 'static',
      keyboard: false,
    });
    modalRef.componentInstance.reference = modalRef;
    modalRef.componentInstance.SACCION = accion;
    modalRef.componentInstance.DEFFECDATE = this.DEFFECDATE;
    modalRef.componentInstance.NBRANCH = this.NBRANCH;
    modalRef.componentInstance.NPRODUCT = this.NPRODUCT;
    modalRef.componentInstance.NMODULEC = this.NMODULEC;
    modalRef.componentInstance.NCOVER = this.NCOVER;
    modalRef.componentInstance.dataList = this.dataList;
    modalRef.componentInstance.NINDEX = this.NINDEX;
    modalRef.componentInstance.SORIGEN = '';
    this.NINDEX = -1;
    modalRef.componentInstance.passEntry.subscribe((receivedEntry) => {
      if (receivedEntry === null) {
        let datax: any = {};
        datax.NBRANCH = this.NBRANCH;
        datax.NPRODUCT = this.NPRODUCT;
        datax.NMODULEC = this.NMODULEC;
        datax.NCOVER = this.NCOVER;
        let flag: boolean = false;
        this.coverService.GetCoverRateList(datax).subscribe(
          (res) => {
            this.coverRateList = res;
            this.totalItems = this.coverRateList.length;
            this.dataList = this.dataList.filter(function (val) {
              return val !== null;
            });
            if (this.dataList.length > 0 && this.dataList[0] != null) {
              var data = JSON.parse(JSON.stringify(this.dataList));

              for (let item of data) {
                if (
                  this.coverRateList.length === 0 ||
                  (this.coverRateList[0] === undefined && flag === false)
                ) {
                  flag = true;
                }
                if (flag) {
                  this.coverRateList.push(item);
                } else {
                  for (let itemX of this.coverRateList) {
                    if (item.NCODREC == itemX.NCODREC) {
                      const pos = this.coverRateList
                        .map(function (e) {
                          return e.NCODREC;
                        })
                        .indexOf(item.NCODREC);
                      if (pos > -1) this.coverRateList[pos] = item;
                    } else {
                      this.coverRateList.push(item);
                    }
                  }
                }
              }
            }
            this.totalItems = this.coverRateList.length;
            this.listToShow = this.coverRateList.slice(
              (this.currentPage - 1) * this.itemsPerPage,
              this.currentPage * this.itemsPerPage
            );
          },
          (err) => {}
        );
      }

      var data = JSON.parse(JSON.stringify(this.dataList));
      this.dataList = this.dataList.filter(function (val) {
        return val !== null;
      });

      if (this.dataList.length === 0 || this.dataList[0] === null) {
        this.dataList.push(receivedEntry);
        data = JSON.parse(JSON.stringify(this.dataList));
      } else {
        const pos = this.dataList.findIndex(
          (value) =>
            value.NCODREC == receivedEntry.NCODREC &&
            value.NPOLICY == receivedEntry.NPOLICY
        );
        if (pos > -1) this.dataList[pos] = receivedEntry;
        else {
          this.dataList.push(receivedEntry);
        }
      }

      let datax: any = {};
      datax.NBRANCH = receivedEntry.NBRANCH;
      datax.NPRODUCT = receivedEntry.NPRODUCT;
      datax.NMODULEC = receivedEntry.NMODULEC;
      datax.NCOVER = receivedEntry.NCOVER;

      this.coverService.GetCoverRateList(datax).subscribe((res) => {
        this.coverRateList = res;
        this.totalItems = this.coverRateList.length;
        let flag: boolean = false;
        for (let item of this.dataList) {
          if (
            this.coverRateList.length === 0 ||
            (this.coverRateList[0] === null && flag === false)
          ) {
            flag = true;
          }

          if (flag) {
            this.coverRateList.push(item);
          } else {
            const pos = this.coverRateList.findIndex(
              (value) =>
                value.NCODREC == item.NCODREC && value.NPOLICY == item.NPOLICY
            );
            if (pos > -1) {
              this.coverRateList[pos] = item;
            } else {
              this.coverRateList.push(item);
            }
          }
        }

        this.coverRateList = this.coverRateList.filter(function (
          elem,
          index,
          self
        ) {
          return index === self.indexOf(elem);
        });

        this.totalItems = this.coverRateList.length;
        this.listToShow = this.coverRateList.slice(
          (this.currentPage - 1) * this.itemsPerPage,
          this.currentPage * this.itemsPerPage
        );
      });
    });

    modalRef.result.then(
      (result) => {
        if (result === 'save') {
          let data: any = {};

          data.NBRANCH = this.NBRANCH;
          data.NPRODUCT = this.NPRODUCT;
          data.NCOVER = this.NCOVER;

          this.coverService.GetCoverRateList(data).subscribe(
            (res) => {
              this.coverRateList = res;
              this.totalItems = this.coverRateList.length;
              this.listToShow = this.coverRateList.slice(
                (this.currentPage - 1) * this.itemsPerPage,
                this.currentPage * this.itemsPerPage
              );
              if (this.coverRateList.length === 0) {
              } else {
                this.existResults = true;
              }

              this.isLoading = false;
            },
            (err) => {
              this.isLoading = false;
            }
          );
        }
      },
      (reason) => {
        if (accion === 'INS') {
          if (reason === 'dismiss') {
          }
        }
      }
    );
  }
}
