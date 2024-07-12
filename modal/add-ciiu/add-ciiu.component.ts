import { Component, OnInit, Input } from '@angular/core';

//Importación de servicios
import { ClientInformationService } from '../../services/shared/client-information.service';

//SweeatAlert
import swal from 'sweetalert2';
import { CommonMethods } from '../../components/common-methods';

@Component({
  selector: 'app-add-ciiu',
  templateUrl: './add-ciiu.component.html',
  styleUrls: ['./add-ciiu.component.css']
})
export class AddCiiuComponent implements OnInit {
  @Input() public reference: any;
  @Input() public listaCiiu = [];
  @Input() public itemCiiu = null;

  public ciiuList: any = [];
  public inputsCiiu: any = {};
  public txtAccion = "Agregar Ciiu";
  inputsValidate: any = {}
  constructor(
    private clientInformationService: ClientInformationService
  ) { }

  ngOnInit() {

    this.getCiiuList();

    this.inputsCiiu.P_SORIGEN = "SCTR";
    this.inputsCiiu.P_NUSERCODE = JSON.parse(localStorage.getItem("currentUser"))["id"];

    if (this.itemCiiu != null) {
      this.txtAccion = "Guardar Ciiu";
      this.inputsCiiu.P_SDESCIIU = this.itemCiiu.P_SDESCIIU;
      this.inputsCiiu.P_NROW = this.itemCiiu.P_NROW;
      this.inputsCiiu.P_SCIIU = this.itemCiiu.P_SCIIU;
      this.inputsCiiu.P_TipOper = this.itemCiiu.P_TipOper;
      this.inputsCiiu.P_CLASS = this.itemCiiu.P_CLASS;
    } else {
      this.txtAccion = "Agregar Ciiu";
      this.inputsCiiu.P_SDESCIIU = "";
      this.inputsCiiu.P_NROW = "";
      this.inputsCiiu.P_SCIIU = null;
      this.inputsCiiu.P_TipOper = "";
      this.inputsCiiu.P_CLASS = "";
    }

    this.inputsValidate = CommonMethods.generarCampos(10, 0)
  }

  getCiiuList() {
    this.clientInformationService.getCiiuList().subscribe(
      res => {
        this.ciiuList = res;
      },
      err => {
        console.log(err);
      }
    );
  }

  onSelectCiiu(event) {
    if (event == undefined) {
      this.inputsCiiu.P_SDESCIIU = "";
      this.inputsCiiu.P_SCIIU = null;
    } else {
      this.inputsCiiu.P_SDESCIIU = event.SDESCRIPT;
      this.inputsCiiu.P_SCIIU = event.P_SCIIU;
    }
  }

  EventSave() {
    if (this.itemCiiu == null) {
      let existe = 0;
      let item = this.inputsCiiu;
      this.listaCiiu.map(function (dato) {
        if (dato.P_SCIIU == item.P_SCIIU) {
          existe = 1;
        }
      });

      if (existe == 0) {
        this.inputsCiiu.P_NROW = this.listaCiiu.length + 1;
        this.ValidarCiiu(this.inputsCiiu, "");
      } else {
        swal.fire("Información", "El ciiu ingresado ya se encuentra registrado.", "warning");
      }

    } else {
      let num = this.inputsCiiu.P_NROW;
      let existe = 0;
      let item = this.inputsCiiu;
      this.listaCiiu.map(function (dato) {
        if (dato.P_SCIIU == item.P_SCIIU &&
          dato.P_NROW !== num) {
          existe = 1;
        }
      });
      if (existe === 0) {
        this.ValidarCiiu(item, num);
      } else {
        swal.fire("Información", "El ciiu ingresado ya se encuentra registrado.", "warning");
      }
    }
  }
  
  clearValidate(nroInput) {
    this.inputsValidate[nroInput] = false
  }

  ValidarCiiu(itemCiiu, row) {
    let mensaje = ""
  
    if (itemCiiu.P_SCIIU == null || itemCiiu.P_SCIIU == 0) {
      this.inputsValidate[0] = true
      mensaje = "La actividad económica es requerido"
    }
    if (mensaje != "") {
      swal.fire("Información", mensaje, "warning");
    } else {
      this.clientInformationService.ValCiiu(itemCiiu).subscribe(
        res => {
          if (row == "") {
            if (res.P_NCODE === 0) {
              this.listaCiiu.push(itemCiiu);
              this.reference.close();
            } else {
              swal.fire("Información", res.P_SMESSAGE, "warning");
            }
          } else {
            if (res.P_NCODE === 0) {
              this.actualizarCiiu(row)
              this.reference.close();
            } else {
              swal.fire("Información", res.P_SMESSAGE, "warning");
            }
          }
        },
        err => {
          console.log(err);
        }
      );
    }
  }

  actualizarCiiu(row) {
    let item = this.inputsCiiu;
    this.listaCiiu.map(function (dato) {
      if (dato.P_NROW == row) {
        dato.P_TipOper = "";
        dato.P_SDESCIIU = item.P_SDESCIIU;
        dato.P_SCIIU = item.P_SCIIU;
      }
    });

  }


}
