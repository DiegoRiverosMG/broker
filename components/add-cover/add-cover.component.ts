import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import swal from 'sweetalert2';
import { NgbModal, ModalDismissReasons, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { ClientInformationService } from '../../services/shared/client-information.service';
import { CoverService } from '../../services/maintenance/cover/cover.service';
import { CommonMethods } from '../common-methods'

@Component({
  selector: 'app-add-cover',
  templateUrl: './add-cover.component.html',
  styleUrls: ['./add-cover.component.css']
})
export class AddCoverComponent implements OnInit {
  isLoading: boolean = false;
  isInformated: boolean = false;
  isCapitalPremium: boolean = false;
  isPremiumCapital: boolean = false;
  isRenovable: boolean = false;
  isRevalued: boolean = false;
  isAgeReached: boolean = false;

  inputsCover: any = {};
  currencyList: any = [];
  contabilityList: any = [];
  reinsuranceList: any = [];
  clasificationList: any = [];
  genericList: any = [];
  sinisterList: any = [];
  coverTypeList: any = [];
  inputsValidate: any = {};

  controlDisabled: boolean;
  controlCapitalPrimaDisabled: boolean;
  controlSeguroDisabled: boolean;
  controlPagosDisabled: boolean;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private modalService: NgbModal,
    private clientInformationService: ClientInformationService,
    private coverService: CoverService
  ) { }

  ngOnInit() {
    let self = this

    this.inputsValidate = CommonMethods.generarCampos(20, 0);

    this.route.queryParams
      .subscribe(params => {
        this.inputsCover.SACCION = params.Accion;
        this.inputsCover.NCOVERGEN = params.NCOVERGEN;
      });

    this.inputsCover.SDESCRIPT = null;
    this.inputsCover.SSHORT_DES = null;
    this.inputsCover.SROUSURRE = null;//rescate
    this.inputsCover.SROURESER = null;//reserva matematica
    this.inputsCover.SCONDSVS = null;//condicionado
    this.inputsCover.SINFORPROV = null;//check informar a prestador de servicios
    this.inputsCover.NCURRENCY = this.inputsCover.NCURRENCY;//moneda
    this.inputsCover.NCACALFIX = null;//monto
    this.inputsCover.NCOVER_IN = null;//en cobertura
    this.inputsCover.NPREMIRAT = null;//tasa
    this.inputsCover.SCLDEATHI = null;//muerte
    this.inputsCover.SIDURAAGE = null;//edad alcanzada (seguro)
    this.inputsCover.SIDURAYEAR = null;//años (seguro)
    this.inputsCover.SIDUROPEI = null;//abierta (seguro)
    this.inputsCover.NAGEMAXI = null;//edad limite
    this.inputsCover.SROUPRCAL = null;//rutina (condiciones prima)
    this.inputsCover.SROUCHACA = null;//rutina(capital)
    this.inputsCover.SROUCHAPR = null;//rutina(primas)
    this.inputsCover.NDURATPAY = null;//cantidad pagos
    this.inputsCover.NDURATIND = null;//cantidad seguros
    this.inputsCover.SINSURINI = null; //tipo de seguro(tipo)
    this.changeStateControls(this.inputsCover.Accion);
    this.getCurrencyList();
    this.getContabilityList();
    this.getReInsuranceList();
    this.getClasificationList();
    this.getGenericList();
    this.getSinisterList();
    this.getCoverTypeList();

    let data: any = {};
    if (this.inputsCover.SACCION === "QUE")
      this.controlDisabled = true;
    else
      this.controlDisabled = false;
    if (this.inputsCover.NCOVERGEN == null || this.inputsCover.NCOVERGEN === 0) {
      this.inputsCover.NBRANCH_LED = 61;
      this.inputsCover.NBRANCH_REI = 1;
      this.inputsCover.NBRANCH_EST = 61;
      this.inputsCover.NBRANCH_GEN = 1;
      this.inputsCover.NCLA_LI_TYP = 1;
    }
    else {
      data.NCOVERGEN = this.inputsCover.NCOVERGEN;
      this.coverService.getCoverGenByCode(data).subscribe(
        res => {
          this.inputsCover.SDESCRIPT = res[0].SDESCRIPT.toString().trim();
          this.inputsCover.SSHORT_DES = res[0].SSHORT_DES.toString().trim();
          this.inputsCover.SROUSURRE = res[0].SROUSURRE.toString().trim();
          this.inputsCover.SROURESER = res[0].SROURESER.toString().trim();
          this.inputsCover.SCONDSVS = res[0].SCONDSVS.toString().trim();
          this.inputsCover.NCURRENCY = res[0].NCURRENCY;

          if (res[0].SINFORPROV === "1")
            this.isInformated = true;
          else
            this.isInformated = false;

          this.inputsCover.NBRANCH_LED = res[0].NBRANCH_LED;
          this.inputsCover.NBRANCH_REI = res[0].NBRANCH_REI;
          this.inputsCover.NBRANCH_EST = res[0].NBRANCH_EST;
          this.inputsCover.NBRANCH_GEN = res[0].NBRANCH_GEN;
          this.inputsCover.NCLA_LI_TYP = res[0].NCLA_LI_TYP;
          this.inputsCover.NCACALFIX = res[0].NCACALFIX;

          if (res[0].SCAPIPREM === "1")
            this.isCapitalPremium = true;
          else
            this.isCapitalPremium = false;

          if (res[0].SPREMCAPI === "1")
            this.isPremiumCapital = true;
          else
            this.isPremiumCapital = false;

          this.inputsCover.NCOVER_IN = res[0].NCOVER_IN;
          this.inputsCover.NPREMIRAT = res[0].NPREMIRAT;
          this.inputsCover.SCLDEATHI = res[0].SCLDEATHI.toString().trim();
          this.inputsCover.SCLACCIDI = res[0].SCLACCIDI.toString().trim();
          this.inputsCover.SCLVEHACI = res[0].SCLVEHACI.toString().trim();
          this.inputsCover.SCLSURVII = res[0].SCLSURVII.toString().trim();
          this.inputsCover.SCLINCAPI = res[0].SCLINCAPI.toString().trim();
          this.inputsCover.SCLINVALI = res[0].SCLINVALI.toString().trim();
          this.inputsCover.SINSURINI = res[0].SINSURINI === "" ? null : Number(res[0].SINSURINI);
          let cboInsurance = (<HTMLSelectElement>document.getElementById("cboInsurance"));
          let cboClasificacion = (<HTMLSelectElement>document.getElementById("cboClasificacion"));
          let cboPays = (<HTMLSelectElement>document.getElementById("cboPays"));

          if (res[0].SCOVERUSE === "1")
            cboClasificacion.selectedIndex = 1;
          else if (res[0].SCOVERUSE === "3")
            cboClasificacion.selectedIndex = 2;
          else if (res[0].SCOVERUSE === "2")
            cboClasificacion.selectedIndex = 3;
          else
            cboClasificacion.selectedIndex = 0;

          if (res[0].SIDURAAGE === "1")
            cboInsurance.selectedIndex = 2;
          else if (res[0].SIDURAYEAR === "1") {
            cboInsurance.selectedIndex = 3;
            if (this.inputsCover.SACCION !== "QUE")
              this.controlSeguroDisabled = false;
          }
          else if (res[0].SIDUROPEI === "1")
            cboInsurance.selectedIndex = 1;
          else
            cboInsurance.selectedIndex = 0;

          if (res[0].SPDURAAGE === "1")
            cboPays.selectedIndex = 2;
          else if (res[0].SPDUROPEI === "1")
            cboPays.selectedIndex = 1;
          else if (res[0].SPDURYEAR === "1") {
            cboPays.selectedIndex = 3;
            if (this.inputsCover.SACCION !== "QUE")
              this.controlPagosDisabled = false;
          }
          else
            cboPays.selectedIndex = 0;

          this.inputsCover.NAGEMAXI = res[0].NAGEMAXI;

          if (res[0].SRENEWALI === "1")
            this.isRenovable = true;
          else
            this.isRenovable = false;

          if (res[0].SREVINDEX === "1")
            this.isRevalued = true;
          else
            this.isRevalued = false;

          if (res[0].SRECHAPRI === "1")
            this.isAgeReached = true;
          else
            this.isAgeReached = false;

          let cboCapitalPrima = (<HTMLSelectElement>document.getElementById("cboCapitalPrima"));
          if (res[0].SCACALFRI === "1") {
            cboCapitalPrima.selectedIndex = 2;
            if (this.inputsCover.SACCION !== "QUE")
              this.controlCapitalPrimaDisabled = false;
          }
          else if (res[0].SCACALFRI === "2")
            cboCapitalPrima.selectedIndex = 1;
          else
            cboCapitalPrima.selectedIndex = 0;

          this.inputsCover.NDURATIND = res[0].NDURATIND;
          this.inputsCover.NDURATPAY = res[0].NDURATPAY;
          this.inputsCover.SROUPRCAL = res[0].SROUPRCAL.toString().trim();

          this.inputsCover.SROUCHACA = res[0].SROUCHACA.toString().trim();
          this.inputsCover.SROUCHAPR = res[0].SROUCHAPR.toString().trim();
          this.inputsCover.SCLILLNESS = res[0].SCLILLNESS;
        },
        err => { }
      )

    }
  }

  selectPagos() {
    let cboPays = <HTMLSelectElement>document.getElementById("cboPays");

    if (cboPays.selectedIndex === 3) {
      this.controlPagosDisabled = false;
    }
    else {
      this.inputsCover.NDURATPAY = null;
      this.controlPagosDisabled = true;
    }
  }

  selectInsurance() {
    let cboInsurance = <HTMLSelectElement>document.getElementById("cboInsurance");
    let txtCantidadInsurance = <HTMLInputElement>document.getElementById("txtCantidadInsurance");

    if (cboInsurance.selectedIndex === 3) {
      this.controlSeguroDisabled = false;
      txtCantidadInsurance.focus();
    }
    else {
      this.inputsCover.NDURATIND = null;
      this.controlSeguroDisabled = true;
    }


  }

  SelectCapitalPremium() {
    let cboCapitalPrima = <HTMLSelectElement>document.getElementById("cboCapitalPrima");
    let txtCapitalPrima = <HTMLInputElement>document.getElementById("txtCapitalPrima");

    if (cboCapitalPrima.selectedIndex === 2) {
      this.controlCapitalPrimaDisabled = false;
      txtCapitalPrima.focus();
    }
    else {
      this.inputsCover.NCACALFIX = null;
      this.controlCapitalPrimaDisabled = true;
    }
  }

  onAgeReached(event) {
    if (event.target.checked)
      this.isAgeReached = true;
    else
      this.isAgeReached = false;
  }

  onRevalued(event) {
    if (event.target.checked)
      this.isRevalued = true;
    else
      this.isRevalued = false;
  }

  onRenovable(event) {
    if (event.target.checked)
      this.isRenovable = true;
    else
      this.isRenovable = false;
  }

  onInformated(event) {
    if (event.target.checked)
      this.isInformated = true;
    else
      this.isInformated = false;
  }

  onCapitalPremium(event) {
    if (event.target.checked)
      this.isCapitalPremium = true;
    else
      this.isCapitalPremium = false;
  }

  onPremiumCapital(event) {
    if (event.target.checked)
      this.isPremiumCapital = true;
    else
      this.isPremiumCapital = false;
  }

  getCoverTypeList() {
    this.clientInformationService.getCoverTypeList().subscribe(
      res => {
        this.coverTypeList = res;
      },
      err => { }
    );
  }

  getSinisterList() {
    this.clientInformationService.getSinisterList().subscribe(
      res => {
        this.sinisterList = res;
      },
      err => { }
    );
  }

  getGenericList() {
    this.clientInformationService.getGenericList().subscribe(
      res => {
        this.genericList = res;
      },
      err => { }
    );
  }

  getClasificationList() {
    this.clientInformationService.getClasificationList().subscribe(
      res => {
        this.clasificationList = res;
      },
      err => { }
    );
  }

  getReInsuranceList() {
    this.clientInformationService.getReInsuranceList().subscribe(
      res => {
        this.reinsuranceList = res;
      },
      err => { }
    );
  }

  getContabilityList() {
    this.clientInformationService.getContabilityList().subscribe(
      res => {
        this.contabilityList = res;
      },
      err => { }
    );
  }

  getCurrencyList() {
    this.clientInformationService.getCurrencyList().subscribe(
      res => {
        this.currencyList = res;
      },
      err => { }
    );
  }

  changeStateControls(accion) {
    if (accion === "NEW" || accion === "EDI") {
      this.controlDisabled = false;
    }
    else if (accion === "QUE") {
      this.controlDisabled = true;
    }
    this.controlCapitalPrimaDisabled = true;
    this.controlSeguroDisabled = true;
    this.controlPagosDisabled = true;
  }

  back() {
    if (this.inputsCover.SACCION === "EDI" || this.inputsCover.SACCION == "INS" || this.inputsCover.SACCION === "CLO") {
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
          this.router.navigate(['/extranet/cover']);
      });
    }
    else {
      this.router.navigate(['/extranet/cover']);
    }
  }

  openModal() {
    let modalRef: NgbModalRef;

  }

  clearValidate(numInput) {
    this.inputsValidate[numInput] = false
  }

  eventSave(event) {
    let messageError: string = "";
    if (this.inputsCover.SDESCRIPT.toString().trim() === null || this.inputsCover.SDESCRIPT.toString().trim() === "") {
      this.inputsValidate[0] = true
      messageError = "- Ingrese la descripción.<br/>";
    }

    if (this.inputsCover.SSHORT_DES.toString().trim() === null || this.inputsCover.SSHORT_DES.toString().trim() === "") {
      this.inputsValidate[1] = true
      messageError += "- Ingrese la descripción abreviada.<br/>";
    }

    if (this.inputsCover.NCURRENCY == null || this.inputsCover.NCURRENCY === 0) {
      this.inputsValidate[9] = true
      messageError += "- Seleccione la moneda.<br/>";
    }


    if (this.inputsCover.NBRANCH_LED == null || this.inputsCover.NBRANCH_LED === 0) {
      this.inputsValidate[4] = true
      messageError += "- Seleccione el ramo contable.<br/>";
    }

    if (this.inputsCover.NBRANCH_REI == null || this.inputsCover.NBRANCH_REI === 0) {
      this.inputsValidate[5] = true
      messageError += "- Seleccione el ramo reaseguro.<br/>";
    }

    if (this.inputsCover.NBRANCH_EST == null || this.inputsCover.NBRANCH_EST === 0) {
      this.inputsValidate[6] = true
      messageError += "- Seleccione la clasificación SVS.<br/>";
    }

    if (this.inputsCover.NBRANCH_GEN == null || this.inputsCover.NBRANCH_GEN === 0) {
      this.inputsValidate[7] = true
      messageError += "- Seleccione el ramo genérico.<br/>";
    }

    if (this.inputsCover.NCLA_LI_TYP == null || this.inputsCover.NCLA_LI_TYP === 0) {
      this.inputsValidate[8] = true
      messageError += "- Seleccione el tipo de siniestro.<br/>";
    }

    if (this.inputsCover.SROUPRCAL == null || this.inputsCover.SROUPRCAL === "") {
      this.inputsValidate[2] = true
      messageError += "- Ingrese la rutina de capital.<br/>"
    }

    if (this.inputsCover.SROUCHACA == null || this.inputsCover.SROUCHACA === "") {
      this.inputsValidate[3] = true
      messageError += "- Ingrese la rutina de renovación."
    }

    if (messageError !== "") {
      swal.fire("Información", messageError, "error");
      return;
    }

    let msgAsk: string = "";
    let msgButton: string = "";

    if (this.inputsCover.SACCION === "INS") {
      msgAsk = "¿Estás seguro de crear la cobertura?";
      msgButton = "Crear";
    }
    else {
      msgAsk = "¿Estás seguro de actualizar la cobertura?";
      msgButton = "Actualizar";
    }

    swal.fire({
      title: "Información",
      text: msgAsk,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: msgButton,
      allowOutsideClick: false,
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.value) {
        this.inputsCover.NAGEMAXI = this.inputsCover.NAGEMAXI;
        this.inputsCover.NBRANCH_EST = this.inputsCover.NBRANCH_EST;
        this.inputsCover.NBRANCH_LED = this.inputsCover.NBRANCH_LED;
        this.inputsCover.NBRANCH_GEN = this.inputsCover.NBRANCH_GEN;
        this.inputsCover.NBRANCH_REI = this.inputsCover.NBRANCH_REI;
        this.inputsCover.NCACALFIX = this.inputsCover.NCACALFIX;
        let cboCapitalPrima = <HTMLSelectElement>document.getElementById("cboCapitalPrima");

        if (cboCapitalPrima.selectedIndex === 2)
          this.inputsCover.SCACALFRI = "1";//?
        else if (cboCapitalPrima.selectedIndex === 1)
          this.inputsCover.SCACALFRI = "2";
        else
          this.inputsCover.SCACALFRI = null;

        if (this.isCapitalPremium)
          this.inputsCover.SCAPIPREM = "1";
        else
          this.inputsCover.SCAPIPREM = "2";

        this.inputsCover.SCLACCIDI = this.inputsCover.SCLACCIDI === null || this.inputsCover.SCLACCIDI === undefined ? "" : this.inputsCover.SCLACCIDI.toString().toUpperCase();
        this.inputsCover.SCLDEATHI = this.inputsCover.SCLDEATHI === null || this.inputsCover.SCLDEATHI === undefined ? "" : this.inputsCover.SCLDEATHI.toString().toUpperCase();
        this.inputsCover.SCLINCAPI = this.inputsCover.SCLINCAPI === null || this.inputsCover.SCLINCAPI === undefined ? "" : this.inputsCover.SCLINCAPI.toString().toUpperCase();
        this.inputsCover.SCLINVALI = this.inputsCover.SCLINVALI === null || this.inputsCover.SCLINVALI === undefined ? "" : this.inputsCover.SCLINVALI.toString().toUpperCase();
        this.inputsCover.SCLSURVII = this.inputsCover.SCLSURVII === null || this.inputsCover.SCLSURVII === undefined ? "" : this.inputsCover.SCLSURVII.toString().toUpperCase();
        this.inputsCover.SCLVEHACI = this.inputsCover.SCLVEHACI === null || this.inputsCover.SCLVEHACI === undefined ? "" : this.inputsCover.SCLVEHACI.toString().toUpperCase();

        let cboClasificacion = <HTMLSelectElement>document.getElementById("cboClasificacion");

        if (cboClasificacion.selectedIndex === 1)
          this.inputsCover.SCOVERUSE = "1";
        else if (cboClasificacion.selectedIndex === 3)
          this.inputsCover.SCOVERUSE = "2";
        else if (cboClasificacion.selectedIndex === 2)
          this.inputsCover.SCOVERUSE = "3";
        else
          this.inputsCover.SCOVERUSE = "";

        this.inputsCover.NCURRENCY = this.inputsCover.NCURRENCY;
        this.inputsCover.SDESCRIPT = this.inputsCover.SDESCRIPT;

        let cboInsurance = <HTMLSelectElement>document.getElementById("cboInsurance");

        if (cboInsurance.selectedIndex === 2)
          this.inputsCover.SIDURAAGE = "1";
        else
          this.inputsCover.SIDURAAGE = "2";

        if (cboInsurance.selectedIndex === 3)
          this.inputsCover.SIDURAYEAR = "1";
        else
          this.inputsCover.SIDURAYEAR = "2";

        if (cboInsurance.selectedIndex === 1)
          this.inputsCover.SIDUROPEI = "1";
        else
          this.inputsCover.SIDUROPEI = "2";

        this.inputsCover.NCOVER_IN = this.inputsCover.NCOVER_IN;
        this.inputsCover.NPREMIRAT = this.inputsCover.NPREMIRAT;

        let cboPays = <HTMLSelectElement>document.getElementById("cboPays");

        if (cboPays.selectedIndex === 2)
          this.inputsCover.SPDURAAGE = "1";
        else
          this.inputsCover.SPDURAAGE = "2";

        if (this.isRevalued)
          this.inputsCover.SREVINDEX = "1";
        else
          this.inputsCover.SREVINDEX = "2";

        if (cboPays.selectedIndex === 1)
          this.inputsCover.SPDUROPEI = "1";
        else
          this.inputsCover.SPDUROPEI = "2";

        if (cboPays.selectedIndex === 3)
          this.inputsCover.SPDURYEAR = "1";
        else
          this.inputsCover.SPDURYEAR = "2";

        if (this.isPremiumCapital)
          this.inputsCover.SPREMCAPI = "1";
        else
          this.inputsCover.SPREMCAPI = "2";

        if (this.isAgeReached)
          this.inputsCover.SRECHAPRI = "1";
        else
          this.inputsCover.SRECHAPRI = "2";

        if (this.isRenovable)
          this.inputsCover.SRENEWALI = "1";
        else
          this.inputsCover.SRENEWALI = "2";

        this.inputsCover.SROUCHACA = this.inputsCover.SROUCHACA === null || this.inputsCover.SROUCHACA === undefined ? "" : this.inputsCover.SROUCHACA.toString().toUpperCase();
        this.inputsCover.SROUCHAPR = this.inputsCover.SROUCHAPR === null || this.inputsCover.SROUCHAPR === undefined ? "" : this.inputsCover.SROUCHAPR.toString().toUpperCase();
        this.inputsCover.SROUPRCAL = this.inputsCover.SROUPRCAL === null || this.inputsCover.SROUPRCAL === undefined ? "" : this.inputsCover.SROUPRCAL.toString().toUpperCase();
        this.inputsCover.SROURESER = this.inputsCover.SROURESER === null || this.inputsCover.SROURESER === undefined ? "" : this.inputsCover.SROURESER.toString().toUpperCase();
        this.inputsCover.SROUSURRE = this.inputsCover.SROUSURRE === null || this.inputsCover.SROUSURRE === undefined ? "" : this.inputsCover.SROUSURRE.toString().toUpperCase();
        this.inputsCover.SINSURINI = this.inputsCover.SINSURINI;
        this.inputsCover.SSHORT_DES = this.inputsCover.SSHORT_DES;
        this.inputsCover.SSTATREGT = "1";
        this.inputsCover.NUSERCODE = JSON.parse(localStorage.getItem("currentUser"))["id"];
        this.inputsCover.SCLILLNESS = this.inputsCover.SCLILLNESS;
        this.inputsCover.SCONDSVS = this.inputsCover.SCONDSVS === null || this.inputsCover.SCONDSVS === undefined ? "" : this.inputsCover.SCONDSVS.toString().toUpperCase();
        this.inputsCover.NCLA_LI_TYP = this.inputsCover.NCLA_LI_TYP;
        if (this.isInformated)
          this.inputsCover.SINFORPROV = "1";
        else
          this.inputsCover.SINFORPROV = "2";

        this.inputsCover.SPROVIDER = "";

        this.coverService.insertCoverGeneric(this.inputsCover).subscribe(
          res => {
            if (res.P_NCODE == 1) {
              swal.fire("Información", res.P_SMESSAGE, "error");
            }
            else if (res.P_NCODE != 0) {
              swal.fire("Información", res.P_SMESSAGE, "warning");
            }
          },
          err => {
            swal.fire("Información", err.statusText, "warning");
          }
        );

        let msg: string = "";

        if (this.inputsCover.SACCION === "INS")
          msg = "Se ha realizado el registro correctamente.";
        else
          msg = "Se ha realizado la actualización correctamente.";

        swal.fire("Información", msg, "success").
          then((value) => {
            this.router.navigate(['/extranet/cover']);
          });
      }
    });
  }
}
