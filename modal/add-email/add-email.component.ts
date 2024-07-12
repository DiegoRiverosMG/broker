import { Component, OnInit, Input } from '@angular/core';

//Importación de servicios
import { ClientInformationService } from '../../services/shared/client-information.service';

//Importacion de modelos
import { EmailType } from '../../models/shared/client-information/email-type';

//SweeatAlert
import swal from 'sweetalert2';
import { CommonMethods } from '../../components/common-methods';

@Component({
  selector: 'app-add-email',
  templateUrl: './add-email.component.html',
  styleUrls: ['./add-email.component.css']
})
export class AddEmailComponent implements OnInit {
  @Input() public reference: any;
  @Input() public listaCorreos = [];
  @Input() public itemCorreo = null;

  emailTypeList: EmailType[];
  inputsEmail: any = {};
  txtAccion = "Agregar Correo";
  inputsValidate: any = {}
  activeBtn = false;


  constructor(
    private clientInformationService: ClientInformationService
  ) { }

  ngOnInit() {
    this.getEmailTypeList();

    this.inputsEmail.P_SORIGEN = "SCTR";
    this.inputsEmail.P_NUSERCODE = JSON.parse(localStorage.getItem("currentUser"))["id"];

    if (this.itemCorreo != null) {
      this.txtAccion = "Guardar Correo";
      this.inputsEmail.P_DESTICORREO = this.itemCorreo.P_DESTICORREO;
      this.inputsEmail.P_NROW = this.itemCorreo.P_NROW;
      this.inputsEmail.P_SE_MAIL = this.itemCorreo.P_SE_MAIL;
      this.inputsEmail.P_SRECTYPE = this.itemCorreo.P_SRECTYPE;
      this.inputsEmail.P_TipOper = this.itemCorreo.P_TipOper;
      this.inputsEmail.P_CLASS = this.itemCorreo.P_CLASS;
    } else {
      this.txtAccion = "Agregar Correo";
      this.inputsEmail.P_DESTICORREO = "";
      this.inputsEmail.P_NROW = "";
      this.inputsEmail.P_SE_MAIL = "";
      this.inputsEmail.P_SRECTYPE = "0";
      this.inputsEmail.P_TipOper = "";
      this.inputsEmail.P_CLASS = "";
    }

    this.inputsValidate = CommonMethods.generarCampos(10, 0)
  }

  getEmailTypeList() {
    this.clientInformationService.getEmailTypeList().subscribe(
      res => {
        this.emailTypeList = res;
      },
      err => {
      }
    );
  }

  onSelectEmailType(event) {

    let selectElementText = event.target['options']
    [event.target['options'].selectedIndex].text;

    if (event.target.value == null) {
      this.inputsEmail.P_DESTICORREO = "";
      this.inputsEmail.P_SRECTYPE = "0";
    } else {
      this.inputsEmail.P_DESTICORREO = selectElementText;
      this.inputsEmail.P_SRECTYPE = event.target.value;
    }
  }

  clearInputs(nroInput) {
    this.inputsValidate[nroInput] = false;
  }

  EventSave() {
    if (this.activeBtn == false) {
      this.activeBtn = true;
      this.inputsEmail.P_SE_MAIL = this.inputsEmail.P_SE_MAIL == null ? "" : this.inputsEmail.P_SE_MAIL.toUpperCase()

      if (this.itemCorreo == null) {
        let existe = 0;
        let item = this.inputsEmail;
        this.listaCorreos.map(function (dato) {
          if (dato.P_SE_MAIL == item.P_SE_MAIL && dato.P_SRECTYPE == item.P_SRECTYPE) {
            existe = 1;
          }
        });

        if (existe == 0) {
          this.inputsEmail.P_NROW = this.listaCorreos.length + 1;
          this.ValidarCorreo(this.inputsEmail, "");
        } else {
          this.activeBtn = false;
          swal.fire("Información", "El email ingresado ya se encuentra registrado.", "warning");
        }

      } else {
        let num = this.inputsEmail.P_NROW;
        let existe = 0;
        let item = this.inputsEmail;
        this.listaCorreos.map(function (dato) {
          if (dato.P_SE_MAIL == item.P_SE_MAIL && dato.P_SRECTYPE == item.P_SRECTYPE &&
            dato.P_NROW !== num) {
            existe = 1;
          }
        });
        if (existe === 0) {
          this.ValidarCorreo(item, num);
        } else {
          this.activeBtn = false;
          swal.fire("Información", "El email ingresado ya se encuentra registrado.", "warning");
        }
      }
    }
  }

  ValidarCorreo(itemCorreo, row) {
    let mensaje = "";
    if (itemCorreo.P_SRECTYPE == 0) {
      this.inputsValidate[0] = true;
      mensaje += "El tipo de correo electrónico es requerido <br />"
    }
    if (itemCorreo.P_SE_MAIL.trim() == "") {
      this.inputsValidate[1] = true;
      mensaje += "El correo electrónico es requerido <br />"
    } else {
      if (/^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i.test(itemCorreo.P_SE_MAIL) == false) {
        this.inputsValidate[1] = true;
        mensaje += "El correo electrónico es inválido <br />";
      }
    }
    if (mensaje != "") {
      this.activeBtn = false;
      swal.fire("Información", mensaje, "warning");
    } else {
      this.clientInformationService.ValEmail(itemCorreo).subscribe(
        res => {
          if (row == "") {
            if (res.P_NCODE === 0) {
              this.listaCorreos.push(itemCorreo);
              this.reference.close();
            } else {
              this.activeBtn = false;
              swal.fire("Información", res.P_SMESSAGE, "warning");
            }
          } else {
            if (res.P_NCODE === 0) {
              this.actualizarCorreo(row)
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

  actualizarCorreo(row) {
    let item = this.inputsEmail;
    this.listaCorreos.map(function (dato) {
      if (dato.P_NROW == row) {
        dato.P_TipOper = "";
        dato.P_DESTICORREO = item.P_DESTICORREO;
        dato.P_SE_MAIL = item.P_SE_MAIL;
        dato.P_SRECTYPE = item.P_SRECTYPE;
      }
    });

  }

  textValidate(event: any, type) {
    CommonMethods.textValidate(event, type)
  }

}
