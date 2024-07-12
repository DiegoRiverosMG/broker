import { Component, OnInit, Input, Output } from '@angular/core';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { Router } from '@angular/router';
import swal from 'sweetalert2';
import { Life_coverRequest } from '../../../models/maintenance/cover/request/life_coverRequest';
import { EventEmitter } from '@angular/core';
import { ClientInformationService } from '../../../services/shared/client-information.service';
import { CoverService } from '../../../services/maintenance/cover/cover.service';
import { LifeCoverService } from '../../../services/maintenance/lifecover/lifecover.service';
import { ModuleService } from '../../../services/maintenance/module/module.service';
import { CommonMethods } from '../../common-methods';

@Component({
  selector: 'app-cover-specific-information',
  templateUrl: './cover-specific-information.component.html',
  styleUrls: ['./cover-specific-information.component.css']
})
export class CoverSpecificInformationComponent implements OnInit {
  @Input() public reference: any;
  @Input() public NBRANCH; NPRODUCT; NCOVERGEN; NMODULEC; SACCION; NCOVER; SMODEFORM; NMODULEC_LOAD; SCHANGETYP; NPREMIRAT; DEFFECDATE; controlDisabled; SORIGEN: any;
  @Output() passEntry: EventEmitter<any> = new EventEmitter();
  @Input() public dataListCoverEsp: Array<Life_coverRequest> = [];
  mortalityList: any = [];
  inputsCover: any = {};
  coverEspList: any = {};
  inputsValidate: any = {};
  inputsValidateError: any = {};

  isMainCover: boolean;
  isControlInsured: boolean;

  origen: string;

  constructor(
    private modalService: NgbModal,
    private router: Router,
    private clientInformationService: ClientInformationService,
    private coverService: CoverService,
    private lifeCoverService: LifeCoverService,
    private moduleService: ModuleService
  ) { }

  ngOnInit() {

    this.inputsValidate = CommonMethods.generarCampos(20, 0);


    this.inputsCover.P_PRODUCTO = null;
    this.inputsCover.SMORTACOF = null;
    this.inputsCover.SMORTACOM = null;
    this.inputsCover.NCAPMINIM = null;
    this.inputsCover.NCAPMAXIM = null;
    this.getMortalityList();

    let cboMoneda = (<HTMLSelectElement>document.getElementById("cboMoneda"));
    let chkMainCover = (<HTMLInputElement>document.getElementById("chkMainCover"));
    let chkControlInsured = (<HTMLInputElement>document.getElementById("chkControlInsured"));
    let cboCapital = (<HTMLSelectElement>document.getElementById("cboCapital"));
    let cboReaseguro = (<HTMLSelectElement>document.getElementById("cboReaseguro"));
    let cboImpuestos = (<HTMLSelectElement>document.getElementById("cboImpuestos"));

    if (this.NCOVER !== 0 && this.SORIGEN == "BD") {
      if (this.SMODEFORM === "")
        this.SACCION = "UPD";
      let data: any = {};

      data.NBRANCH = this.NBRANCH;
      data.NPRODUCT = this.NPRODUCT;
      data.NMODULEC = this.NMODULEC;
      data.NCOVERGEN = this.NCOVERGEN;
      data.NCOVER = this.NCOVER;
      this.coverService.getCoverEspByCover(data).subscribe(
        res => {
          if (res[0].NCURRENCY === 1)
            cboMoneda.selectedIndex = 0;
          else if (res[0].NCURRENCY === 2)
            cboMoneda.selectedIndex = 1;

          if (res[0].SCOVERUSE === "1") {
            chkMainCover.checked = true;
            this.isMainCover = true;
          }
          else {
            chkMainCover.checked = false;
            this.isMainCover = false;
          }


          if (res[0].SCONTROL === "1") {
            chkControlInsured.checked = true;
            this.isControlInsured = true;
          }
          else {
            chkControlInsured.checked = false;
            this.isControlInsured = false;
          }


          if (res[0].SADDSUINI === "1")
            cboCapital.selectedIndex = 1;
          else if (res[0].SADDSUINI === "2")
            cboCapital.selectedIndex = 3;
          else
            cboCapital.selectedIndex = 2;

          if (res[0].SADDREINI === "1")
            cboReaseguro.selectedIndex = 1;
          else if (res[0].SADDREINI === "2")
            cboReaseguro.selectedIndex = 3;
          else
            cboReaseguro.selectedIndex = 2;

          if (res[0].SADDTAXIN === "1")
            cboImpuestos.selectedIndex = 1;
          else if (res[0].SADDTAXIN === "2")
            cboImpuestos.selectedIndex = 3;
          else
            cboImpuestos.selectedIndex = 2;

          this.inputsCover.SMORTACOM = res[0].SMORTACOM === "" ? null : res[0].SMORTACOM.trim();
          this.inputsCover.SMORTACOF = res[0].SMORTACOF === "" ? null : res[0].SMORTACOF.trim();
          this.inputsCover.NINTEREST = res[0].NINTEREST == 0 ? null : res[0].NINTEREST;
          this.inputsCover.SROURESER = res[0].SROURESER;

          this.inputsCover.NCAPMINIM = res[0].NCAPMINIM == 0 ? null : res[0].NCAPMINIM;
          this.inputsCover.NCAPMAXIM = res[0].NCAPMAXIM == 0 ? null : res[0].NCAPMAXIM;
          this.inputsCover.NCACALFIX = res[0].NCACALFIX == 0 ? null : res[0].NCACALFIX;
          this.inputsCover.NCACALMUL = res[0].NCACALMUL == 0 ? null : res[0].NCACALMUL;
          this.inputsCover.NCAPBASPE = res[0].NCAPBASPE == 0 ? null : res[0].NCAPBASPE;
          this.inputsCover.SDESCRIPT_CAPITAL = res[0].SDESCRIPT_CAPITAL;
        },
        err => {
        }
      )
    }
    else {
      if (this.dataListCoverEsp.length > 0) {
        for (let item of this.dataListCoverEsp) {
          if (item.SORIGEN == "APP") {
            if (item.NCOVERGEN == this.NCOVERGEN) {
              if (item.NCURRENCY === 1)
                cboMoneda.selectedIndex = 0;
              else if (item.NCURRENCY === 2)
                cboMoneda.selectedIndex = 1;

              if (item.SCOVERUSE === "1") {
                chkMainCover.checked = true;
                this.isMainCover = true;
              }
              else {
                chkMainCover.checked = false;
                this.isMainCover = false;
              }

              if (item.SCONTROL === "1") {
                chkControlInsured.checked = true;
                this.isControlInsured = true;
              }
              else {
                chkControlInsured.checked = false;
                this.isControlInsured = false;
              }

              if (item.SADDSUINI === "1")
                cboCapital.selectedIndex = 1;
              else if (item.SADDSUINI === "2")
                cboCapital.selectedIndex = 3;
              else
                cboCapital.selectedIndex = 2;

              if (item.SADDSUINI === "1")
                cboReaseguro.selectedIndex = 1;
              else if (item.SADDSUINI === "2")
                cboReaseguro.selectedIndex = 3;
              else
                cboReaseguro.selectedIndex = 2;

              if (item.SADDTAXIN === "1")
                cboImpuestos.selectedIndex = 1;
              else if (item.SADDTAXIN === "2")
                cboImpuestos.selectedIndex = 3;
              else
                cboImpuestos.selectedIndex = 2;

              this.inputsCover.SMORTACOM = item.SMORTACOM === "" ? null : item.SMORTACOM.trim();
              this.inputsCover.SMORTACOF = item.SMORTACOF === "" ? null : item.SMORTACOF.trim();
              this.inputsCover.NINTEREST = item.NINTEREST == 0 ? null : item.NINTEREST;
              this.inputsCover.SROURESER = item.SROURESER;

              this.inputsCover.NCAPMINIM = item.NCAPMINIM == 0 ? null : item.NCAPMINIM;
              this.inputsCover.NCAPMAXIM = item.NCAPMAXIM == 0 ? null : item.NCAPMAXIM;
              this.inputsCover.NCACALFIX = item.NCACALFIX == 0 ? null : item.NCACALFIX;
              this.inputsCover.NCACALMUL = item.NCACALMUL == 0 ? null : item.NCACALMUL;
              this.inputsCover.NCAPBASPE = item.NCAPBASPE == 0 ? null : item.NCAPBASPE;

              this.origen = "APP";
              this.inputsCover.SDESCRIPT_CAPITAL = item.SDESCRIPT_CAPITAL;
            }
          }
        }
      }
    }
  }

  validateDecimal(int, decimal, index) {
    let input: any;
    if (index == 7)
      input = this.inputsCover.NINTEREST;
    else if (index == 8)
      input = this.inputsCover.NCAPMINIM;
    else if (index == 10)
      input = this.inputsCover.NCACALFIX;
    else if (index == 11)
      input = this.inputsCover.NCACALMUL;
    else if (index == 12)
      input = this.inputsCover.NCAPBASPE;

    if (input != null && input != "") {
      var result = CommonMethods.validateDecimals(int, decimal, input);
      if (result != "") {
        this.inputsValidate[index] = true;
        this.inputsValidateError[index] = result;
      }
      else {
        this.inputsValidate[index] = false;
        this.inputsValidateError[index] = "";
      }
    }
  }

  clearValidate(numInput) {
    this.inputsValidate[numInput] = false
  }

  getMortalityList() {
    this.clientInformationService.getMortalityList().subscribe(
      res => {
        this.mortalityList = res;
      },
      err => {
      }
    );
  }

  onControlInsured(event) {
    if (event.currentTarget.checked)
      this.isControlInsured = true;
    else
      this.isControlInsured = false;
  }

  onMainCover(event) {
    if (event.currentTarget.checked)
      this.isMainCover = true;
    else
      this.isMainCover = false;
  }

  guardar() {
    let coverBM: any = {};
    let ncover: number;
    let strError: string = "";

    coverBM.NBRANCH = this.NBRANCH;
    coverBM.NPRODUCT = this.NPRODUCT;
    coverBM.NMODULEC = this.NMODULEC;
    let cboCapital = (<HTMLSelectElement>document.getElementById("cboCapital"));
    let cboReaseguro = (<HTMLSelectElement>document.getElementById("cboReaseguro"));
    let cboImpuestos = (<HTMLSelectElement>document.getElementById("cboImpuestos"));
    let cboMoneda = (<HTMLSelectElement>document.getElementById("cboMoneda"));

    if (cboCapital.selectedIndex == 0) {
      this.inputsValidate[0] = "0";
      strError = "- Seleccione el capital.<br/>";
    }
    if (cboReaseguro.selectedIndex == 0) {
      this.inputsValidate[1] = "1";
      strError += "- Seleccione el reaseguro.<br/>";
    }
    if (cboImpuestos.selectedIndex == 0) {
      this.inputsValidate[2] = "2";
      strError += "- Seleccione el impuesto.<br/>";
    }

    if (this.inputsCover.SMORTACOM == null) {
      this.inputsValidate[3] = "3";
      strError += "- Seleccione la opción hombres.<br/>";
    }

    if (this.inputsCover.SMORTACOF == null) {
      this.inputsValidate[4] = "4";
      strError += "- Seleccione la opción mujeres.<br/>";
    }

    if (Number(this.inputsCover.NCAPMINIM) > Number(this.inputsCover.NCAPMAXIM)) {
      this.inputsValidate[6] = "6";
      strError += "- El capital mínimo no puede ser mayor al capital máximo"
    }

    if (this.inputsValidate[7] != "" || this.inputsValidate[8] != "" || this.inputsValidate[9] != "") {
      strError += "Existen errores de formato de números en algunos campos.<br/>";
    }

    if (strError !== "") {
      swal.fire("Información", strError, "error");
      return;
    }

    this.coverService.getCoverEspCorrelative(coverBM).subscribe(
      res => {
        var cod = JSON.stringify(res);
        var json = JSON.parse(cod);
        ncover = json.NCOVER;

        let cover = new Life_coverRequest();
        cover.SACCION = this.SACCION;
        cover.NBRANCH = this.NBRANCH;
        cover.NPRODUCT = this.NPRODUCT;
        cover.NMODULEC = this.NMODULEC;
        cover.SADDSUINI = cboCapital.options[cboCapital.selectedIndex].value;
        cover.SADDREINI = cboReaseguro.options[cboReaseguro.selectedIndex].value;
        cover.SADDTAXIN = cboImpuestos.options[cboImpuestos.selectedIndex].value;
        cover.NCOVERGEN = this.NCOVERGEN;
        cover.SMORTACOF = this.inputsCover.SMORTACOF;
        cover.SMORTACOM = this.inputsCover.SMORTACOM;
        cover.NINTEREST = this.inputsCover.NINTEREST;
        if (this.NCOVER === 0)
          cover.NCOVER = ncover;
        else
          cover.NCOVER = this.NCOVER;

        cover.NUSERCODE = JSON.parse(localStorage.getItem("currentUser"))["id"];
        cover.NCAPMINIM = this.inputsCover.NCAPMINIM;
        cover.NCAPMAXIM = this.inputsCover.NCAPMAXIM;

        cover.NCACALFIX = this.inputsCover.NCACALFIX;
        cover.NCACALMUL = this.inputsCover.NCACALMUL;
        cover.NCAPBASPE = this.inputsCover.NCAPBASPE;

        if (this.isMainCover)
          cover.SCOVERUSE = "1";
        else
          cover.SCOVERUSE = "";

        cover.NCURRENCY = Number(cboMoneda.options[cboMoneda.selectedIndex].value);
        cover.SROURESER = this.inputsCover.SROURESER;

        if (this.isControlInsured)
          cover.SCONTROL = "1";
        else
          cover.SCONTROL = "2";

        cover.NUSERCODE = JSON.parse(localStorage.getItem("currentUser"))["id"];
        cover.SCHANGETYP = this.SCHANGETYP;
        cover.NPREMIRAT = this.NPREMIRAT;
        cover.DEFFECDATE = this.DEFFECDATE;
        cover.SORIGEN = "APP";
        cover.SDESCRIPT_CAPITAL = this.inputsCover.SDESCRIPT_CAPITAL;
        let data: any = {};

        data.NBRANCH = this.NBRANCH
        data.NPRODUCT = this.NPRODUCT;

        if (this.SMODEFORM === "Clone") {
          data.NMODULEC = this.NMODULEC_LOAD;
        }
        else {
          data.NMODULEC = this.NMODULEC;
        }

        let dataX: any = {};

        dataX.NBRANCH = this.NBRANCH;
        dataX.NPRODUCT = this.NPRODUCT;
        dataX.NMODULEC = this.NMODULEC;
        dataX.NCOVERGEN = this.NCOVERGEN;
        dataX.NCOVER = this.NCOVER;

        this.coverService.getCoverEspByCover(dataX).subscribe(
          res => {
            if (res.length !== 0) {
              this.lifeCoverService.GetLifeCoverList(data).subscribe(
                res => {
                  var data = [];
                  this.coverEspList = res
                  data = JSON.parse(JSON.stringify(res));
                  for (let element of data) {
                    if (element.NCOVER === cover.NCOVER) {
                      element.SADDSUINI = cboCapital.options[cboCapital.selectedIndex].value;
                      element.SADDREINI = cboReaseguro.options[cboReaseguro.selectedIndex].value;
                      element.SADDTAXIN = cboImpuestos.options[cboImpuestos.selectedIndex].value;
                      element.SACCION = "UPD";
                      element.SMORTACOF = this.inputsCover.SMORTACOF;
                      element.SMORTACOM = this.inputsCover.SMORTACOM;
                      element.NINTEREST = this.inputsCover.NINTEREST;

                      element.NCAPMINIM = this.inputsCover.NCAPMINIM;
                      element.NCAPMAXIM = this.inputsCover.NCAPMAXIM;

                      element.NCACALFIX = this.inputsCover.NCACALFIX;
                      element.NCACALMUL = this.inputsCover.NCACALMUL;
                      element.NCAPBASPE = this.inputsCover.NCAPBASPE;

                      if (this.isMainCover)
                        element.SCOVERUSE = "1";
                      else
                        element.SCOVERUSE = "";

                      element.NCURRENCY = Number(cboMoneda.options[cboMoneda.selectedIndex].value);
                      element.SROURESER = this.inputsCover.SROURESER;

                      if (this.isControlInsured)
                        element.SCONTROL = "1";
                      else
                        element.SCONTROL = "2";

                      element.NUSERCODE = JSON.parse(localStorage.getItem("currentUser"))["id"];

                      element.SCHANGETYP = this.SCHANGETYP;
                      element.NPREMIRAT = this.NPREMIRAT;
                      element.DEFFECDATE = this.DEFFECDATE;
                      element.SORIGEN = "APP";
                      element.SDESCRIPT_CAPITAL = this.inputsCover.SDESCRIPT_CAPITAL;
                      this.passEntry.emit(element);
                      break;
                    }
                  }
                },
                err => {
                }
              );
            }
            else {
              this.passEntry.emit(cover);
            }
          },
          error => {
          }
        );
      },
      err => {

      }
    );

    this.reference.close('save');
  }
  close() {
    if (this.origen == "APP")
      this.reference.close('save');
    else
      this.reference.close();
  }

  closeX() {
    if (this.origen == "APP")
      this.reference.close('save');
    else
      this.reference.dismiss('dismiss');
  }
}
