import { Component, OnInit, Input, Output } from '@angular/core';
import { ClientInformationService } from '../../../services/shared/client-information.service';
import swal from 'sweetalert2';
import { CoverService } from '../../../services/maintenance/cover/cover.service';
import { EventEmitter } from '@angular/core';
import { CoverRateBM } from '../../../models/maintenance/cover/request/cover-rate-bm';
import { THIS_EXPR } from '@angular/compiler/src/output/output_ast';
import { CommonMethods } from '../../common-methods';
import { PolicyemitService } from '../../../services/policy/policyemit.service';
@Component({
  selector: 'app-cover-rate',
  templateUrl: './cover-rate.component.html',
  styleUrls: ['./cover-rate.component.css'],
})
export class CoverRateComponent implements OnInit {
  @Input() public reference: any;
  @Input() public NBRANCH;
  NPRODUCT;
  NCOVER;
  NMODULEC;
  SACCION;
  DEFFECDATE;
  NCODREC;
  NROLE;
  NPOLICY;
  NINDEX;
  SMODEFORM;
  controlDisabled;
  SORIGEN: any;
  @Input() public dataList: Array<CoverRateBM> = [];
  @Output() passEntry: EventEmitter<any> = new EventEmitter();
  rechargeType: any = [];
  currency: any = [];
  listToShow: any = [];
  coverRateList: any = [];
  inputsRate: any = {};
  inputsValidate: any = {};
  inputsValidateError: any = {};
  SRECHARGETYPE;
  SCURRENCY;
  SMESSAGE: string = '';
  isByPolicy: boolean;
  byPolicyDisabled: boolean;
  rechargeTypeDisabled: boolean;
  percentDisabled: boolean;
  amountDisabled: boolean;

  constructor(
    private clientInformationService: ClientInformationService,
    private coverService: CoverService,
    private policyService: PolicyemitService
  ) {}

  ngOnInit() {
    this.inputsValidate = CommonMethods.generarCampos(10, 0);
    this.inputsRate.NCODREC = null;
    this.inputsRate.NMONTHI = null;
    this.inputsRate.NMONTHE = null;
    this.inputsRate.NPERCENT = null;
    this.inputsRate.NCODIGINT = null;
    this.inputsRate.NAMOUNT = null;
    this.inputsRate.NPOLICY = null;

    this.byPolicyDisabled = true;
    if (this.SACCION === 'UPD') this.rechargeTypeDisabled = true;
    else this.rechargeTypeDisabled = false;

    this.getTypeRechargeList();
    this.getCurrencyList();
    this.inputsRate.NCODREC = 100;
    this.inputsRate.NCODIGINT = 1;

    this.inputsRate.NBRANCH = this.NBRANCH;
    this.inputsRate.NPRODUCT = this.NPRODUCT;
    this.inputsRate.NMODULEC = this.NMODULEC;
    this.inputsRate.NCOVER = this.NCOVER;
    this.inputsRate.NPOLICY = this.NPOLICY;

    this.inputsRate.SRECHARGETYPE = null;
    this.inputsRate.SCURRENCY = null;

    if (this.NCODREC && this.SORIGEN == 'APP') {
      if (this.dataList.length > 0) {
        for (let item of this.dataList) {
          if (item.NCODREC == this.NCODREC && item.NPOLICY == this.NPOLICY) {
            this.inputsRate.NCODREC = item.NCODREC;
            this.inputsRate.NMONTHI = item.NMONTHI;
            this.inputsRate.NMONTHE = item.NMONTHE;
            this.inputsRate.NPERCENT =
              item.NPERCENT == 0 ? null : item.NPERCENT;
            this.inputsRate.NAMOUNT = item.NAMOUNT == 0 ? null : item.NAMOUNT;
            this.inputsRate.NCODIGINT = item.NCURRENCY;

            if (
              (item.NPERCENT == 0 || item.NPERCENT == null) &&
              (item.NAMOUNT == 0 || item.NAMOUNT == null)
            ) {
              this.percentDisabled = false;
              this.amountDisabled = false;
            } else {
              if (item.NPERCENT == 0 || item.NPERCENT == null)
                this.percentDisabled = true;

              if (item.NAMOUNT == 0 || item.NAMOUNT == null)
                this.amountDisabled = true;
            }

            if (item.NPOLICY !== 0) {
              if (this.NPOLICY !== 0) {
                this.inputsRate.NPOLICY = item.NPOLICY;
                break;
              }
            } else {
              if (this.NPOLICY === 0) {
                this.inputsRate.NPOLICY = null;
                break;
              }
            }
          }
        }
      }
    } else {
      let data: any = {};
      data.NBRANCH = this.NBRANCH;
      data.NPRODUCT = this.NPRODUCT;
      data.NMODULEC = this.NMODULEC;
      data.NCOVER = this.NCOVER;
      data.NCODREC = this.NCODREC;

      if (this.NPOLICY !== 0) {
        data.SBYPOLICY = 'T';
        if (this.NPOLICY > 0) data.NPOLICY = this.NPOLICY;
        else data.NPOLICY = this.inputsRate.NPOLICY;
      }
      if (this.NINDEX > -1) {
        const pos = this.dataList
          .map(function (e) {
            return e.NCODREC;
          })
          .indexOf(this.NCODREC);
        this.dataList.splice(pos, 1);
      }

      this.coverService.getCoverRateByCode(data).subscribe(
        (res) => {
          if (res.length > 0) {
            this.inputsRate.NCODREC = res[0].NCODREC;
            this.inputsRate.NMONTHI = res[0].NMONTHI;
            this.inputsRate.NMONTHE = res[0].NMONTHE;
            this.inputsRate.NPERCENT =
              res[0].NPERCENT == 0 ? null : res[0].NPERCENT;
            this.inputsRate.NAMOUNT =
              res[0].NAMOUNT == 0 ? null : res[0].NAMOUNT;
            this.inputsRate.NCODIGINT = res[0].NCURRENCY;
            if (
              (res[0].NPERCENT == 0 || res[0].NPERCENT == null) &&
              (res[0].NAMOUNT == 0 || res[0].NAMOUNT == null)
            ) {
              this.percentDisabled = false;
              this.amountDisabled = false;
            } else {
              if (res[0].NPERCENT == 0 || res[0].NPERCENT == null)
                this.percentDisabled = true;

              if (res[0].NAMOUNT == 0 || res[0].NAMOUNT == null)
                this.amountDisabled = true;
            }

            if (res[0].NPOLICY != 0) {
              this.inputsRate.NPOLICY =
                res[0].NPOLICY == 0 ? null : res[0].NPOLICY;
            } else {
              this.inputsRate.NPOLICY = null;
            }
          }
          if (this.SMODEFORM === 'Consult') {
            this.percentDisabled = true;
            this.amountDisabled = true;
            this.byPolicyDisabled = true;
          }
        },
        (err) => {
          console.log(err);
        }
      );
    }
  }

  clearValidate(numInput) {
    this.inputsValidate[numInput] = false;
  }

  validateExistsPolicy() {
    let data: any = {};
    data.NBRANCH = this.NBRANCH;
    data.NPRODUCT = this.NPRODUCT;
    data.NPOLICY = this.inputsRate.NPOLICY;
    data.DSTARTDATE = this.DEFFECDATE;
    this.policyService.getValidateExistPolicy(data).subscribe(
      (res) => {
        var data = JSON.stringify(res);
        var json = JSON.parse(data);

        if (json.SMESSAGE == 'null') {
          this.inputsValidate[1] = false;
          this.SMESSAGE = '';
        } else {
          this.SMESSAGE = json.SMESSAGE;
          this.inputsValidate[1] = true;
        }
      },
      (err) => {
        console.log(err);
      }
    );
  }

  validateDecimal(int, decimal, index) {
    let input: any;
    if (index == 2) input = this.inputsRate.NPERCENT;
    else if (index == 3) input = this.inputsRate.NAMOUNT;

    if (input != null && input != '') {
      var result = CommonMethods.validateDecimals(int, decimal, input);
      if (result != '') {
        this.inputsValidate[index] = true;
        this.inputsValidateError[index] = result;
      } else {
        this.inputsValidate[index] = false;
        this.inputsValidateError[index] = '';
      }
    }
  }

  selectRecharge() {
    this.SRECHARGETYPE = this.inputsRate.SRECHARGETYPE;
  }

  selectCurrency() {
    this.SCURRENCY = this.inputsRate.SCURRENCY;
  }

  onAmount(event) {
    const inputChar = event.key;
    if (
      (event.keyCode >= 48 && event.keyCode <= 57) ||
      (event.keyCode >= 96 && event.keyCode <= 105) ||
      inputChar == 'Backspace'
    ) {
      let txtAmount = <HTMLInputElement>document.getElementById('txtAmount');
      let start = txtAmount.selectionStart;
      let end = txtAmount.selectionEnd;
      let flag: boolean = false;
      if (txtAmount.value.substring(start, end).length != 0) {
        flag = true;
      }
      if (
        inputChar == 'Backspace' &&
        (this.inputsRate.NAMOUNT.length == 0 ||
          this.inputsRate.NAMOUNT.length == 1 ||
          flag)
      ) {
        this.percentDisabled = false;
        this.inputsRate.NPERCENT = null;
      } else {
        if (inputChar != 'Backspace') {
          if (inputChar == '0' && this.inputsRate.NAMOUNT.length == 0) {
            this.percentDisabled = false;
            this.inputsRate.NPERCENT = null;
          } else {
            this.inputsValidate[2] = false;
            this.percentDisabled = true;
            this.inputsRate.NPERCENT = null;
          }
        }
      }
    }
  }

  onPercentage(event) {
    const inputChar = event.key;
    if (
      (event.keyCode >= 48 && event.keyCode <= 57) ||
      (event.keyCode >= 96 && event.keyCode <= 105) ||
      inputChar == 'Backspace'
    ) {
      let txtPercent = <HTMLInputElement>document.getElementById('txtPercent');
      let start = txtPercent.selectionStart;
      let end = txtPercent.selectionEnd;
      let flag: boolean = false;
      if (txtPercent.value.substring(start, end).length != 0) {
        flag = true;
      }
      if (
        inputChar == 'Backspace' &&
        (this.inputsRate.NPERCENT.length == 0 ||
          this.inputsRate.NPERCENT.length == 1 ||
          flag)
      ) {
        this.amountDisabled = false;
        this.inputsRate.NAMOUNT = null;
      } else {
        if (inputChar != 'Backspace') {
          if (inputChar == '0' && this.inputsRate.NAMOUNT.length == 0) {
            this.amountDisabled = false;
            this.inputsRate.NAMOUNT = null;
          } else {
            this.inputsValidate[3] = false;
            this.amountDisabled = true;
            this.inputsRate.NAMOUNT = null;
          }
        }
      }
    }
  }

  getTypeRechargeList() {
    this.clientInformationService.gettRechargeTypeList().subscribe(
      (res) => {
        this.rechargeType = res;
      },
      (err) => {
        console.log(err);
      }
    );
  }

  getCurrencyList() {
    this.clientInformationService.getCurrencyList().subscribe(
      (res) => {
        this.currency = res;
      },
      (err) => {
        console.log(err);
      }
    );
  }

  guardar() {
    let strError: string = '';

    if (this.inputsRate.NCODREC == 0 || this.inputsRate.NCODREC == null) {
      strError = '- Seleccione el tipo de tarifa.';
    }

    if (this.inputsRate.NMONTHI > this.inputsRate.NMONTHE) {
      strError += '- El mes final debe ser mayor al mes inicial.<br/>';
    }

    if (this.inputsRate.NMONTHE == null) {
      this.inputsValidate[0] = true;
      strError += '- Ingrese el mes final.<br/>';
    } else if (this.inputsRate.NMONTHE == 0) {
      this.inputsValidate[0] = true;
      strError += '- El mes final debe ser mayor a 0.<br/>';
    }

    if (this.inputsRate.NPOLICY == null) {
      this.inputsValidate[1] = true;
      strError += '- Ingrese la póliza.<br/>';
    }
    if (this.inputsRate.NPOLICY < 1) {
      this.inputsValidate[1] = true;
      strError += '- La póliza debe ser mayor a 0.<br/>';
    }

    if (this.amountDisabled == false) {
      if (
        Number(this.inputsRate.NAMOUNT) == 0 ||
        this.inputsRate.NAMOUNT == null
      )
        strError += '- El monto fijo debe ser mayor a 0.<br/>';
    }

    if (this.percentDisabled == false) {
      if (
        Number(this.inputsRate.NPERCENT) == 0 ||
        this.inputsRate.NPERCENT == null
      )
        strError += '- El porcentaje debe ser mayor a 0.<br/>';
    }

    if (Number(this.inputsRate.NPERCENT) > 0 && this.inputsValidate[2]) {
      this.inputsValidate[2] = true;
      strError +=
        '- Existen errores de formato de números en algunos campos.<br/>';
    } else {
      this.inputsValidate[2] = false;
    }

    if (Number(this.inputsRate.NAMOUNT) > 0 && this.inputsValidate[3]) {
      this.inputsValidate[3] = true;
      strError +=
        '- Existen errores de formato de números en algunos campos.<br/>';
    } else {
      this.inputsValidate[3] = false;
    }

    if (
      (Number(this.inputsRate.NAMOUNT) == 0 ||
        this.inputsRate.NAMOUNT == null) &&
      (Number(this.inputsRate.NPERCENT) == 0 ||
        this.inputsRate.NPERCENT == null)
    ) {
      this.inputsValidate[2] = true;
      this.inputsValidate[3] = true;
      strError += '- Debe ingresar el porcentaje o el monto fijo.<br/>';
    } else {
      this.inputsValidate[2] = false;
      this.inputsValidate[3] = false;
    }

    if (this.SMESSAGE != '') {
      strError += '- ' + this.SMESSAGE;
    }

    if (strError !== '') {
      swal.fire('Información', strError, 'error');
      return;
    }

    let msg: string = '';
    let msgButton: string = '';

    if (this.SACCION == 'UPD') {
      msg = 'Estás seguro de modificar la tasa?';
      msgButton = 'Actualizar';
    } else {
      msg = '¿Estás seguro de agregar la tasa?';
      msgButton = 'Agregar';
    }

    swal
      .fire({
        title: 'Información',
        text: msg,
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: msgButton,
        allowOutsideClick: false,
        cancelButtonText: 'Cancelar',
      })
      .then((result) => {
        if (result.value) {
          let datax: any = {};
          datax.NBRANCH = this.NBRANCH;
          datax.NPRODUCT = this.NPRODUCT;
          datax.NMODULEC = this.NMODULEC;
          datax.NCOVER = this.NCOVER;
          datax.NCODREC = this.inputsRate.NCODREC;
          this.coverService.GetCoverRateList(datax).subscribe((res) => {
            let flagListaBD,
              flagListaBDPolicy,
              flagListaMemory,
              flagListaMemoryPolicy: boolean = false;
            this.coverRateList = res;
            var dataFromBD = JSON.parse(JSON.stringify(this.coverRateList));
            var dataFromApp = JSON.parse(JSON.stringify(this.dataList));

            if (dataFromBD.length > 0 && dataFromBD[0] != null) {
              for (let item of dataFromBD) {
                if (
                  item.NCODREC === this.inputsRate.NCODREC &&
                  item.NPOLICY === 0 &&
                  this.SACCION === 'INS' &&
                  item.NPOLICY == this.inputsRate.NPOLICY
                ) {
                  if (
                    this.inputsRate.NPOLICY === 0 ||
                    this.inputsRate.NPOLICY === undefined
                  ) {
                    flagListaBD = true;
                    break;
                  } else flagListaBD = false;
                } else {
                  if (
                    item.NCODREC === this.inputsRate.NCODREC &&
                    item.NPOLICY != 0 &&
                    this.SACCION === 'INS' &&
                    item.NPOLICY == this.inputsRate.NPOLICY
                  ) {
                    if (
                      this.inputsRate.NPOLICY === 0 ||
                      this.inputsRate.NPOLICY === undefined
                    )
                      flagListaBDPolicy = false;
                    else {
                      flagListaBDPolicy = true;
                      break;
                    }
                  } else {
                    flagListaBDPolicy = false;
                  }
                }
              }
            }

            if (dataFromApp.length > 0 && dataFromApp[0] != null) {
              for (let item of dataFromApp) {
                if (
                  item.NCODREC === this.inputsRate.NCODREC &&
                  item.NPOLICY === 0 &&
                  this.SACCION === 'INS' &&
                  item.NPOLICY == this.inputsRate.NPOLICY
                ) {
                  if (
                    this.inputsRate.NPOLICY === 0 ||
                    this.inputsRate.NPOLICY === undefined
                  )
                    flagListaMemory = true;
                  else flagListaMemory = false;
                } else {
                  if (
                    item.NCODREC === this.inputsRate.NCODREC &&
                    item.NPOLICY != 0 &&
                    this.SACCION === 'INS' &&
                    item.NPOLICY == this.inputsRate.NPOLICY
                  ) {
                    if (
                      this.inputsRate.NPOLICY === 0 ||
                      this.inputsRate.NPOLICY === undefined
                    )
                      flagListaMemoryPolicy = false;
                    else flagListaMemoryPolicy = true;
                  } else {
                    flagListaMemoryPolicy = false;
                  }
                }
              }
            }

            if (
              flagListaBD ||
              flagListaMemory ||
              flagListaBDPolicy ||
              flagListaMemoryPolicy
            ) {
              swal
                .fire({
                  title: 'Información',
                  text: 'El código de recargo ya se encuentra registrado',
                  icon: 'error',
                  confirmButtonText: 'OK',
                  allowOutsideClick: false,
                })
                .then((result) => {
                  if (result.value) {
                    this.passEntry.emit(null);
                  }
                });
            } else {
              let data: any = {};
              data.NBRANCH = this.NBRANCH;
              data.NPRODUCT = this.NPRODUCT;
              data.NMODULEC = this.NMODULEC;
              data.NCOVER = this.NCOVER;
              data.NCODREC = this.NCODREC;

              if (this.NPOLICY !== 0) {
                data.SBYPOLICY = 'T';
                if (this.NPOLICY > 0) data.NPOLICY = this.NPOLICY;
                else data.NPOLICY = this.inputsRate.NPOLICY;
              }

              this.coverService.getCoverRateByCode(data).subscribe(
                (res) => {
                  let rate = new CoverRateBM();
                  rate.NBRANCH = this.NBRANCH;
                  rate.NPRODUCT = this.NPRODUCT;
                  rate.NMODULEC = this.NMODULEC;
                  rate.NCOVER = this.NCOVER;
                  if (res.length === 0) {
                    rate.SACCION = 'INS';
                  } else {
                    rate.SACCION = this.SACCION;
                  }

                  rate.NCODREC = this.inputsRate.NCODREC;
                  if (
                    this.SRECHARGETYPE === '' ||
                    this.SRECHARGETYPE === undefined
                  ) {
                    this.clientInformationService
                      .getRechargeDescription(this.inputsRate.NCODREC)
                      .subscribe((res) => {
                        rate.SRECHARGETYPE = res;
                      });
                  } else {
                    rate.SRECHARGETYPE = this.SRECHARGETYPE;
                  }

                  rate.NMONTHI = this.inputsRate.NMONTHI;
                  rate.NMONTHE = this.inputsRate.NMONTHE;
                  rate.NPERCENT = this.inputsRate.NPERCENT;
                  rate.NAMOUNT = this.inputsRate.NAMOUNT;
                  rate.DEFFECDATE = this.DEFFECDATE;

                  rate.SBYPOLICY = 'T';
                  rate.NPOLICY = this.inputsRate.NPOLICY;

                  rate.NCURRENCY = this.inputsRate.NCODIGINT;
                  if (this.SCURRENCY === '' || this.SCURRENCY === undefined) {
                    this.clientInformationService
                      .getCurrencyDescription(this.inputsRate.NCODIGINT)
                      .subscribe((res) => {
                        rate.SCURRENCY = res;
                      });
                  } else {
                    rate.SCURRENCY = this.SCURRENCY;
                  }
                  rate.NROLE =
                    this.NROLE === null || this.NROLE === undefined
                      ? 2
                      : this.NROLE;
                  rate.NUSERCODE = JSON.parse(
                    localStorage.getItem('currentUser')
                  )['id'];
                  rate.SORIGEN = 'APP';
                  this.passEntry.emit(rate);
                },
                (err) => {}
              );
            }
            this.listToShow = this.coverRateList;
          });
          this.reference.close('save');
        }
      });
  }
}
