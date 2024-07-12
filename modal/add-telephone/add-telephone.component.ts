import { Component, OnInit, Input } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl, AbstractControl } from "@angular/forms";

//Importación de servicios
import { ClientInformationService } from '../../services/shared/client-information.service';

//Importacion de modelos
import { PhoneType } from '../../models/shared/client-information/phone-type';
import { CityCode } from '../../models/shared/client-information/city-code';

//SweeatAlert
import swal from 'sweetalert2';
import { CommonMethods } from '../../components/common-methods';

@Component({
  selector: 'app-add-telephone',
  templateUrl: './add-telephone.component.html',
  styleUrls: ['./add-telephone.component.css']
})
export class AddTelephoneComponent implements OnInit {
  @Input() public reference: any;
  @Input() public listaTelefonos = [];
  @Input() public itemTelefono = null;

  phoneTypeList: PhoneType[];
  cityCodeList: CityCode[];
  inputsTelephone: any = {};
  blockCelular = true;
  blockAnexo = true;
  txtAccion = "Agregar Telefono";
  maxlength = 9;
  mensajeError = "";

  inputsValidate: any = {};
  activeBtn = false;

  constructor(
    private clientInformationService: ClientInformationService
  ) { }

  ngOnInit() {
    this.getPhoneTypeList();
    this.getCityCodeList();

    this.inputsTelephone.P_SORIGEN = "SCTR";
    this.inputsTelephone.P_NUSERCODE = JSON.parse(localStorage.getItem("currentUser"))["id"];

    if (this.itemTelefono != null) {
      this.txtAccion = "Guardar Teléfono";
      this.inputsTelephone.P_DESAREA = this.itemTelefono.P_DESAREA;
      this.inputsTelephone.P_DESTIPOTLF = this.itemTelefono.P_DESTIPOTLF;
      this.inputsTelephone.P_NAREA_CODE = this.itemTelefono.P_NAREA_CODE;
      this.inputsTelephone.P_NEXTENS1 = this.itemTelefono.P_NEXTENS1;
      this.inputsTelephone.P_NPHONE_TYPE = this.itemTelefono.P_NPHONE_TYPE;
      this.inputsTelephone.P_NROW = this.itemTelefono.P_NROW;
      this.inputsTelephone.P_SPHONE = this.itemTelefono.P_SPHONE;
      this.inputsTelephone.P_SNOMUSUARIO = this.itemTelefono.P_SNOMUSUARIO;
      this.inputsTelephone.P_DCOMPDATE = this.itemTelefono.P_DCOMPDATE;
      this.inputsTelephone.P_TipOper = this.itemTelefono.P_TipOper;
      this.inputsTelephone.P_CLASS = this.itemTelefono.P_CLASS;
      this.onSelectTypePhoneEdit(this.itemTelefono)
    } else {
      this.txtAccion = "Agregar Teléfono";
      this.inputsTelephone.P_DESAREA = "";
      this.inputsTelephone.P_DESTIPOTLF = "";
      this.inputsTelephone.P_NAREA_CODE = "0";
      this.inputsTelephone.P_NEXTENS1 = null;
      this.inputsTelephone.P_NPHONE_TYPE = "0";
      this.inputsTelephone.P_NROW = "";
      this.inputsTelephone.P_SPHONE = "";
      this.inputsTelephone.P_SNOMUSUARIO = "";
      this.inputsTelephone.P_DCOMPDATE = "";
      this.inputsTelephone.P_TipOper = "";
      this.inputsTelephone.P_CLASS = "";
    }

    this.inputsValidate = CommonMethods.generarCampos(10, 0)


  }

  getPhoneTypeList() {
    this.clientInformationService.getPhoneTypeList().subscribe(
      res => {
        this.phoneTypeList = res;
      },
      err => {
      }
    );
  }

  getCityCodeList() {

    this.clientInformationService.getCityCodeList().subscribe(
      res => {
        this.cityCodeList = res;
      },
      err => {
      }
    );
  }

  onSelectTypePhone(event) {
    let selectElementText = event.target['options']
    [event.target['options'].selectedIndex].text;

    switch (event.target.value) {
      case "0":
        this.blockCelular = true;
        this.blockAnexo = true;
        this.inputsTelephone.P_DESTIPOTLF = "";
        this.inputsTelephone.P_NPHONE_TYPE = event.target.value;
        this.maxlength = 7;
        this.clearDocument();
        break;
      case "1":
        this.blockCelular = false;
        this.blockAnexo = false;
        this.inputsTelephone.P_DESTIPOTLF = selectElementText;
        this.inputsTelephone.P_NPHONE_TYPE = event.target.value;
        if (this.inputsTelephone.P_NAREA_CODE == "1") {
          this.maxlength = 7;
        } else {
          this.maxlength = 6;
        }
        this.clearDocument();
        break;
      case "2":
        this.blockCelular = true;
        this.blockAnexo = true;
        this.inputsTelephone.P_DESTIPOTLF = selectElementText;
        this.inputsTelephone.P_NPHONE_TYPE = event.target.value;
        this.maxlength = 9;
        this.clearDocument();
        break;
      default:
        this.blockCelular = false;
        this.blockAnexo = true;
        this.inputsTelephone.P_DESTIPOTLF = selectElementText;
        this.inputsTelephone.P_NPHONE_TYPE = event.target.value;
        this.inputsTelephone.P_NEXTENS1 = null;
        this.maxlength = 7;
        this.clearDocument();
        break;
    }
  }

  onSelectTypePhoneEdit(item) {
    switch (item.P_NPHONE_TYPE) {
      case "1":
        this.blockCelular = false;
        this.blockAnexo = false;
        this.inputsTelephone.P_DESTIPOTLF = item.P_DESTIPOTLF;
        this.inputsTelephone.P_NPHONE_TYPE = item.P_NPHONE_TYPE;
        if (this.inputsTelephone.P_NAREA_CODE == "1") {
          this.maxlength = 7;
        } else {
          this.maxlength = 6;
        }
        break;
      case "2":
        this.blockCelular = true;
        this.blockAnexo = true;
        this.inputsTelephone.P_DESTIPOTLF = item.P_DESTIPOTLF;
        this.inputsTelephone.P_NPHONE_TYPE = item.P_NPHONE_TYPE;
        this.maxlength = 9;
        this.clearDocument();
        break;
      default:
        this.blockCelular = false;
        this.blockAnexo = true;
        this.inputsTelephone.P_DESTIPOTLF = item.P_DESTIPOTLF;
        this.inputsTelephone.P_NPHONE_TYPE = item.P_NPHONE_TYPE;
        this.inputsTelephone.P_NEXTENS1 = null;
        this.maxlength = 7;
        break;
    }
  }

  clearDocument() {
    this.inputsTelephone.P_DESAREA = "";
    this.inputsTelephone.P_NAREA_CODE = "0";
    this.inputsTelephone.P_NEXTENS1 = null;
  }

  onSelectCode(event) {

    let selectElementText = event.target['options']
    [event.target['options'].selectedIndex].text;
    this.inputsTelephone.P_DESAREA = selectElementText;
    this.inputsTelephone.P_NAREA_CODE = event.target.value;
    if (this.inputsTelephone.P_NAREA_CODE == 1) {
      this.maxlength = 7;
    } else {
      this.maxlength = 6;
    }
  }

  EventSave() {
    if (this.activeBtn == false) {
      this.activeBtn = true;
      this.inputsTelephone.P_NAREA_CODE = this.inputsTelephone.P_NAREA_CODE == "0" ? null : this.inputsTelephone.P_NAREA_CODE
      this.inputsTelephone.P_NEXTENS1 = this.inputsTelephone.P_NEXTENS1 == null ? "" : this.inputsTelephone.P_NEXTENS1

      if (this.itemTelefono == null) {
        let existe = 0;
        let item = this.inputsTelephone;
        this.listaTelefonos.map(function (dato) {
          if (dato.P_NPHONE_TYPE == item.P_NPHONE_TYPE && dato.P_SPHONE == item.P_SPHONE &&
            dato.P_NAREA_CODE == item.P_NAREA_CODE && dato.P_NEXTENS1 == item.P_NEXTENS1) {
            existe = 1;
          }
        });

        if (existe == 0) {
          this.inputsTelephone.P_NROW = this.listaTelefonos.length + 1;
          this.ValidarTelefono(this.inputsTelephone, "");
        } else {
          this.activeBtn = false;
          swal.fire("Información", "El teléfono ingresado ya se encuentra registrado.", "warning");
        }

      } else {
        let num = this.inputsTelephone.P_NROW;
        let existe = 0;
        let item = this.inputsTelephone;
        this.listaTelefonos.map(function (dato) {
          if (dato.P_NPHONE_TYPE == item.P_NPHONE_TYPE && dato.P_SPHONE == item.P_SPHONE &&
            dato.P_NAREA_CODE == item.P_NAREA_CODE && dato.P_NEXTENS1 == item.P_NEXTENS1 &&
            dato.P_NROW !== num) {
            existe = 1;
          }
        });
        if (existe === 0) {
          this.ValidarTelefono(item, num);
        } else {
          this.activeBtn = false;
          swal.fire("Información", "El teléfono ingresado ya se encuentra registrado.", "warning");
        }

      }
    }
  }

  clearInputs(nroInput) {
    this.inputsValidate[nroInput] = false;
  }

  ValidarTelefono(itemTelefono, row) {
    let mensaje = "";
    if (this.inputsTelephone.P_NPHONE_TYPE == 0) {
      this.inputsValidate[0] = true
      mensaje += "El tipo de teléfono es requerido <br>";
    }
    if (itemTelefono.P_NPHONE_TYPE == 1 || itemTelefono.P_NPHONE_TYPE == 3 || itemTelefono.P_NPHONE_TYPE == 4) {
      if (itemTelefono.P_NAREA_CODE == 0) {
        this.inputsValidate[1] = true
        mensaje += "El código de área es requerido <br>"
      } else {
        if (itemTelefono.P_SPHONE.substr(0, 1) == "0" || itemTelefono.P_SPHONE.substr(0, 1) == "1" || itemTelefono.P_SPHONE.substr(0, 1) == "8" || itemTelefono.P_SPHONE.substr(0, 1) == "9") {
          mensaje += "El télefono no puede empezar 0, 1, 8 o 9 <br>"
        }
      }
    } else if (itemTelefono.P_NPHONE_TYPE == 2 && itemTelefono.P_SPHONE != "") {
      if (itemTelefono.P_SPHONE.substr(0, 1) != "9") {
        mensaje += "El celular debe empezar 9 <br>"
      }
    }
    if (itemTelefono.P_SPHONE == "" || itemTelefono.P_SPHONE == null) {
      this.inputsValidate[2] = true
      mensaje += "El número de teléfono es requerido <br>"
    } else {
      if (this.maxlength > itemTelefono.P_SPHONE.length || this.maxlength < itemTelefono.P_SPHONE.length) {
        this.inputsValidate[2] = true
        mensaje += "El teléfono debe tener " + this.maxlength + " dígitos"
      }
    }

    if (itemTelefono.P_NEXTENS1 == null) {
      itemTelefono.P_NEXTENS1 = "";
    }

    if (mensaje != "") {
      this.activeBtn = false;
      swal.fire("Información", mensaje, "warning");
    } else {
      this.clientInformationService.valPhone(itemTelefono).subscribe(
        res => {
          if (row == "") {
            if (res.P_NCODE === 0) {
              this.listaTelefonos.push(itemTelefono);
              this.reference.close();
            } else {
              this.activeBtn = false;
              swal.fire("Información", res.P_SMESSAGE, "warning");
            }
          } else {
            if (res.P_NCODE === 0) {
              this.actualizarTelefono(row)
              this.reference.close();
            } else {
              this.activeBtn = false;
              swal.fire("Información", res.P_SMESSAGE, "warning");
            }
          }
        },
        err => {
        }
      );
    }
  }

  actualizarTelefono(row) {
    let item = this.inputsTelephone;
    this.listaTelefonos.map(function (dato) {
      if (dato.P_NROW == row) {
        dato.P_TipOper = "";
        dato.P_DESAREA = item.P_DESAREA;
        dato.P_DESTIPOTLF = item.P_DESTIPOTLF;
        dato.P_NAREA_CODE = item.P_NAREA_CODE;
        dato.P_NPHONE_TYPE = item.P_NPHONE_TYPE;
        dato.P_SPHONE = item.P_SPHONE;
        dato.P_NEXTENS1 = item.P_NEXTENS1;
      }
    });

  }

  textValidate(event: any, type) {
    CommonMethods.textValidate(event, type)
  }

}
