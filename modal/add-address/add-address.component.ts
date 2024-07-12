import { Component, OnInit, Input } from '@angular/core';

//Importación de servicios
import { ClientInformationService } from '../../services/shared/client-information.service';
import { AddressService } from '../../services/shared/address.service';
//Importacion de modelos
import { DirectionType } from '../../models/shared/client-information/direction-type';
import { RoadType } from '../../models/shared/client-information/road-type';
import { InteriorType } from '../../models/shared/client-information/interior-type';
import { CJHTType } from '../../models/shared/client-information/cjht-type';
import { BlockType } from '../../models/shared/client-information/block-type';
import { Country } from '../../models/shared/client-information/country';

//SweeatAlert
import swal from 'sweetalert2';
import { CommonMethods } from '../../components/common-methods';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-add-address',
  templateUrl: './add-address.component.html',
  styleUrls: ['./add-address.component.css']
})
export class AddAddressComponent implements OnInit {
  @Input() public reference: any;
  @Input() public listaDirecciones = [];
  @Input() public itemDireccion = null;
  @Input() public estadoModal = '';
  @Input() public rebillData = null;

  directionTypeList: DirectionType[];
  roadTypeList: RoadType[];
  interiorTypeList: InteriorType[];
  cjhtTypeList: CJHTType[];
  blockTypeList: BlockType[];
  countryList: Country[];
  departmentList: any[];
  provinceList: any[];
  districtList: any[];
  inputsStreet: any = {};
  blockPais = true;
  //public mensajeError = "";
  inputsValidate: any = {};


  //Construir Direccion
  prefVia = "";
  prefBloque = "";
  prefDepar = "";
  prefCJHT = "";
  sDireccion = "";
  sNumero = "";
  sBloque = "";
  sDepar = "";
  sCJHT = "";
  sEtapa = "";
  sManzana = "";
  sLote = "";
  sReferencia = "";
  sDepartamento = "";
  sProvincia = "";
  sDistrito = "";
  txtAccion = "Agregar Dirección";
  activeBtn = false;

  constructor(
    private clientInformationService: ClientInformationService,
    private addressService: AddressService,
    private datepipe: DatePipe,
  ) { }

  async ngOnInit() {
    this.getDirectionTypeList();
    this.getRoadTypeList();
    this.getInteriorTypeList();
    this.getCJHTTypeList();
    this.getBlockTypeList();
    this.getCountryList();
    await this.getDepartmentList();

    this.inputsStreet.P_SORIGEN = "SCTR";
    this.inputsStreet.P_NUSERCODE = JSON.parse(localStorage.getItem("currentUser"))["id"];

    if (this.itemDireccion != null) {
      this.txtAccion = "Guardar Dirección";
      this.inputsStreet.P_NROW = Number(this.itemDireccion.P_NROW);
      this.inputsStreet.P_SDESDIREBUSQ = this.itemDireccion.P_SDESDIREBUSQ;
      this.inputsStreet.P_SBLOCKCHALET = this.itemDireccion.P_SBLOCKCHALET;
      this.inputsStreet.P_DESDEPARTAMENTO = this.itemDireccion.P_DESDEPARTAMENTO;
      this.sDepartamento = this.itemDireccion.P_DESDEPARTAMENTO + " ";
      this.inputsStreet.P_DESDISTRITO = this.itemDireccion.P_DESDISTRITO;
      this.sDistrito = this.itemDireccion.P_DESDISTRITO + " ";
      this.inputsStreet.P_DESPROVINCIA = this.itemDireccion.P_DESPROVINCIA;
      this.sProvincia = this.itemDireccion.P_DESPROVINCIA + " ";
      this.inputsStreet.P_DESTIDIRE = this.itemDireccion.P_DESTIDIRE;
      this.inputsStreet.P_SETAPA = this.itemDireccion.P_SETAPA;
      this.inputsStreet.P_SNUM_INTERIOR = this.itemDireccion.P_SNUM_INTERIOR;
      this.inputsStreet.P_SLOTE = this.itemDireccion.P_SLOTE;
      this.inputsStreet.P_SMANZANA = this.itemDireccion.P_SMANZANA;
      this.inputsStreet.P_NCOUNTRY = Number(this.itemDireccion.P_NCOUNTRY);
      this.onSelectCountryEdit(this.itemDireccion);
      this.inputsStreet.P_NPROVINCE = this.itemDireccion.P_NPROVINCE != null ? Number(this.itemDireccion.P_NPROVINCE) : this.itemDireccion.P_NPROVINCE;
      await this.getProvinceList();
      this.inputsStreet.P_NLOCAL = this.itemDireccion.P_NLOCAL != null ? Number(this.itemDireccion.P_NLOCAL) : this.itemDireccion.P_NLOCAL;
      await this.getDistrictList();
      this.inputsStreet.P_NMUNICIPALITY = this.itemDireccion.P_NMUNICIPALITY != null ? Number(this.itemDireccion.P_NMUNICIPALITY) : this.itemDireccion.P_NMUNICIPALITY;
      this.inputsStreet.P_SNUM_DIRECCION = this.itemDireccion.P_SNUM_DIRECCION;
      this.inputsStreet.P_STI_BLOCKCHALET = this.itemDireccion.P_STI_BLOCKCHALET == "" ? null : this.itemDireccion.P_STI_BLOCKCHALET;
      this.inputsStreet.P_STI_DIRE = this.itemDireccion.P_STI_DIRE == "" ? null : this.itemDireccion.P_STI_DIRE;
      this.inputsStreet.P_STI_INTERIOR = this.itemDireccion.P_STI_INTERIOR == "" ? null : this.itemDireccion.P_STI_INTERIOR;
      this.inputsStreet.P_STI_CJHT = this.itemDireccion.P_STI_CJHT == "" ? null : this.itemDireccion.P_STI_CJHT;
      this.inputsStreet.P_SNOM_DIRECCION = this.itemDireccion.P_SNOM_DIRECCION;
      this.inputsStreet.P_SRECTYPE = Number(this.itemDireccion.P_SRECTYPE);
      this.inputsStreet.P_SREFERENCE = this.itemDireccion.P_SREFERENCE;
      this.inputsStreet.P_SNOM_CJHT = this.itemDireccion.P_SNOM_CJHT;
      this.inputsStreet.P_SNOMUSUARIO = this.itemDireccion.P_SNOMUSUARIO;
      this.inputsStreet.P_DCOMPDATE = this.itemDireccion.P_DCOMPDATE;
      this.inputsStreet.P_TipOper = "";
      this.inputsStreet.P_CLASS = this.itemDireccion.P_CLASS;
      this.prefVia = this.itemDireccion.prefVia != undefined ? this.itemDireccion.prefVia : "";
      this.prefBloque = this.itemDireccion.prefBloque != undefined ? this.itemDireccion.prefBloque : "";
      this.prefDepar = this.itemDireccion.prefDepar != undefined ? this.itemDireccion.prefDepar : "";
      this.prefCJHT = this.itemDireccion.prefCJHT != undefined ? this.itemDireccion.prefCJHT : "";
    } else {
      this.txtAccion = "Agregar Dirección";
      this.inputsStreet.P_NROW = "";
      this.inputsStreet.P_SDESDIREBUSQ = "";
      this.inputsStreet.P_SBLOCKCHALET = ""
      this.inputsStreet.P_DESDEPARTAMENTO = "";
      this.inputsStreet.P_DESDISTRITO = "";
      this.inputsStreet.P_DESPROVINCIA = "";
      this.inputsStreet.P_DESTIDIRE = "";
      this.inputsStreet.P_SETAPA = "";
      this.inputsStreet.P_SNUM_INTERIOR = "";
      this.inputsStreet.P_SLOTE = "";
      this.inputsStreet.P_SMANZANA = "";
      this.inputsStreet.P_NCOUNTRY = 1;
      this.inputsStreet.P_NLOCAL = null;
      this.inputsStreet.P_NMUNICIPALITY = null;
      this.inputsStreet.P_NPROVINCE = null;
      this.inputsStreet.P_SNUM_DIRECCION = "";
      this.inputsStreet.P_STI_BLOCKCHALET = null;
      this.inputsStreet.P_STI_DIRE = null;
      this.inputsStreet.P_STI_INTERIOR = null;
      this.inputsStreet.P_STI_CJHT = null;
      this.inputsStreet.P_SNOM_DIRECCION = "";
      this.inputsStreet.P_SRECTYPE = null;
      this.inputsStreet.P_SREFERENCE = "";
      this.inputsStreet.P_SNOM_CJHT = "";
      this.inputsStreet.P_SNOMUSUARIO = "";
      this.inputsStreet.P_DCOMPDATE = "";
      this.inputsStreet.P_TipOper = "";
      this.inputsStreet.P_CLASS = "";
    }

    this.inputsValidate = CommonMethods.generarCampos(25, 0)
  }

  clearValidate(nroInput) {
    this.inputsValidate[nroInput] = false;
  }

  onSelectDirectionType(event) {

    if (event == undefined) {
      this.inputsStreet.P_SRECTYPE = null;
      this.inputsStreet.P_DESTIDIRE = "";
    } else {
      this.inputsStreet.P_SRECTYPE = event.SRECTYPE;
      this.inputsStreet.P_DESTIDIRE = event.SDESCRIPT;
    }
  }

  onSelectRoadType(event) {
    this.clearValdateAll()
    if (event == undefined) {
      this.inputsStreet.P_STI_DIRE = null;
      this.prefVia = " ";
      this.inputsStreet.prefVia = "";
    } else {
      this.inputsStreet.P_STI_DIRE = event.STI_DIRE;
      this.prefVia = event.SDESCRIPT + " ";
      this.inputsStreet.prefVia = event.SDESCRIPT + " ";
    }
  }

  clearValdateAll() {
      this.inputsValidate =  CommonMethods.generarCampos(25, 0)
  }

  onSelectInteriorType(event) {
    if (event == undefined) {
      this.inputsStreet.P_STI_INTERIOR = null;
      this.prefDepar = "";
      this.inputsStreet.prefDepar = "";
    } else {
      this.inputsStreet.P_STI_INTERIOR = event.STI_INTERIOR;
      this.prefDepar = event.SDESCRIPT + " ";
      this.inputsStreet.prefDepar = event.SDESCRIPT + " ";
    }
  }

  onSelectCJHTType(event) {
    if (event == undefined) {
      this.inputsStreet.P_STI_CJHT = null;
      this.prefCJHT = "";
      this.inputsStreet.prefCJHT = "";
    } else {
      this.inputsStreet.P_STI_CJHT = event.STI_CJHT;
      this.prefCJHT = event.SDESCRIPT + " ";
      this.inputsStreet.prefCJHT = event.SDESCRIPT + " ";
    }
  }

  onSelectBlockType(event) {
    if (event == undefined) {
      this.inputsStreet.P_STI_BLOCKCHALET = null;
      this.prefBloque = "";
      this.inputsStreet.prefBloque = "";
    } else {
      this.inputsStreet.P_STI_BLOCKCHALET = event.STI_BLOCKCHALET;
      this.prefBloque = event.SDESCRIPT + " ";
      this.inputsStreet.prefBloque = event.SDESCRIPT + " ";
    }
  }

  onSelectConjHab(event) {
    if (event == undefined) {
      this.inputsStreet.P_STI_CJHT = null;
      this.prefBloque = "";
      this.inputsStreet.prefBloque = "";
    } else {
      this.inputsStreet.P_STI_CJHT = event.STI_CJHT;
      this.prefCJHT = event.SDESCRIPT + " ";
      this.inputsStreet.prefCJHT = event.SDESCRIPT + " ";
    }
  }

  onSelectCountry(event) {
    if (event != undefined) {
      if (event.NCOUNTRY == 1) {
        this.inputsStreet.P_NCOUNTRY = event.NCOUNTRY;
        this.blockPais = true;
      } else {
        this.inputsStreet.P_NCOUNTRY = event.NCOUNTRY;
        this.blockPais = false;
      }
    }


    this.inputsStreet.P_NPROVINCE = null;
    this.inputsStreet.P_DESDEPARTAMENTO = "";
    this.sDepartamento = "";
    this.inputsStreet.P_NLOCAL = null;
    this.inputsStreet.P_DESPROVINCIA = "";
    this.sProvincia = "";
    this.inputsStreet.P_NMUNICIPALITY = null;
    this.inputsStreet.P_DESDISTRITO = "";
    this.sDistrito = "";
    this.getProvinceList();
    this.getDistrictList();
  }

  onSelectCountryEdit(item) {
    if (item.P_NCOUNTRY == "1") {
      this.inputsStreet.P_NCOUNTRY = Number(item.P_NCOUNTRY);
      this.blockPais = true;
    } else {
      this.inputsStreet.P_NCOUNTRY = Number(item.P_NCOUNTRY);
      this.blockPais = false;
    }
  }

  onSelectDepartment(event) {
    if (event == undefined) {
      this.inputsStreet.P_NPROVINCE = null;
      this.inputsStreet.P_DESDEPARTAMENTO = "";
      this.sDepartamento = "";
    } else {
      this.inputsStreet.P_NPROVINCE = event.Id;
      this.inputsStreet.P_DESDEPARTAMENTO = event.Name;
      this.sDepartamento = event.Name + " ";
    }
    this.inputsStreet.P_NLOCAL = null;
    this.inputsStreet.P_DESPROVINCIA = "";
    this.sProvincia = "";
    this.inputsStreet.P_NMUNICIPALITY = null;
    this.inputsStreet.P_DESDISTRITO = "";
    this.sDistrito = "";
    this.getProvinceList();
    this.getDistrictList();
  }

  onSelectProvince(event) {
    if (event == undefined) {
      this.inputsStreet.P_NLOCAL = null;
      this.inputsStreet.P_DESPROVINCIA = "";
      this.sProvincia = "";
    } else {
      this.inputsStreet.P_NLOCAL = event.Id;
      this.inputsStreet.P_DESPROVINCIA = event.Name;
      this.sProvincia = event.Name + " ";
    }
    this.inputsStreet.P_NMUNICIPALITY = null;
    this.inputsStreet.P_DESDISTRITO = "";
    this.sDistrito = "";
    this.getDistrictList();

  }

  onSelectDistrict(event) {
    if (event == undefined) {
      this.inputsStreet.P_NMUNICIPALITY = null;
      this.inputsStreet.P_DESDISTRITO = "";
      this.sDistrito = "";
    } else {
      this.inputsStreet.P_NMUNICIPALITY = event.Id;
      this.inputsStreet.P_DESDISTRITO = event.Name;
      this.sDistrito = event.Name + " ";
    }
  }

  getDirectionTypeList() {
    this.clientInformationService.getDirectionTypeList().subscribe(
      res => {
        this.directionTypeList = res;
      },
      err => {
      }
    );
  }

  getRoadTypeList() {
    this.clientInformationService.getRoadTypeList().subscribe(
      res => {
        this.roadTypeList = res;
      },
      err => {
      }
    );
  }

  getInteriorTypeList() {
    this.clientInformationService.getInteriorTypeList().subscribe(
      res => {
        this.interiorTypeList = res;
      },
      err => {
      }
    );
  }

  getCJHTTypeList() {
    this.clientInformationService.getCJHTTypeList().subscribe(
      res => {
        this.cjhtTypeList = res;
      },
      err => {
      }
    );
  }

  getBlockTypeList() {
    this.clientInformationService.getBlockTypeList().subscribe(
      res => {
        this.blockTypeList = res;
      },
      err => {
      }
    );
  }

  getCountryList() {
    this.clientInformationService.getCountryList().subscribe(
      res => {
        this.countryList = res;
      },
      err => {
      }
    );
  }

  async getDepartmentList() {
    await this.addressService.getDepartmentList().toPromise().then(
      res => {
        this.departmentList = res;
      },
      err => {
      }
    );
  }

  async getProvinceList() {
    console.log(this.inputsStreet.P_NPROVINCE)
    if (this.inputsStreet.P_NPROVINCE != null) {
      return await this.addressService.getProvinceList(this.inputsStreet.P_NPROVINCE).toPromise().then(
      res => {
        this.provinceList = res;
      },
      err => {
      }
    );
    } else {
      this.provinceList = []
    }

  }

  async getDistrictList() {
    if (this.inputsStreet.P_NLOCAL != null) {
      return await this.addressService.getDistrictList(this.inputsStreet.P_NLOCAL).toPromise().then(
      res => {
        this.districtList = res;
      },
      err => {
      }
    );
    } else {
      this.districtList = []
    }

  }

  completeInfo() {
    if (this.prefVia == "") {
      this.roadTypeList.forEach(item => {
        if (item.STI_DIRE == this.inputsStreet.P_STI_DIRE) {
          this.prefVia = item.SDESCRIPT + " ";
          this.inputsStreet.prefVia = item.SDESCRIPT + " ";
        }
      });
    }

    if (this.prefDepar == "") {
      this.interiorTypeList.forEach(item => {
        if (item.STI_INTERIOR == this.inputsStreet.P_STI_INTERIOR) {
          this.prefDepar = item.SDESCRIPT + " ";
          this.inputsStreet.prefDepar = item.SDESCRIPT + " ";
        }
      });
    }

    if (this.prefCJHT == "") {
      this.cjhtTypeList.forEach(item => {
        if (item.STI_CJHT == this.inputsStreet.P_STI_CJHT) {
          this.prefCJHT = item.SDESCRIPT + " ";
          this.inputsStreet.prefCJHT = item.SDESCRIPT + " ";
        }
      });
    }

    if (this.prefBloque == "") {
      this.blockTypeList.forEach(item => {
        if (item.STI_BLOCKCHALET == this.inputsStreet.P_STI_BLOCKCHALET) {
          this.prefBloque = item.SDESCRIPT + " ";
          this.inputsStreet.prefBloque = item.SDESCRIPT + " ";
        }
      });
    }
  }

  EventSave(event) {
    if (this.activeBtn == false) {
      this.activeBtn = true;
      this.completeInfo();
      this.inputsStreet.P_SNOM_DIRECCION = this.inputsStreet.P_SNOM_DIRECCION == null ? "" : this.inputsStreet.P_SNOM_DIRECCION.toUpperCase()
      this.inputsStreet.P_SNUM_DIRECCION = this.inputsStreet.P_SNUM_DIRECCION == null ? "" : this.inputsStreet.P_SNUM_DIRECCION.toUpperCase()
      this.inputsStreet.P_SNUM_INTERIOR = this.inputsStreet.P_SNUM_INTERIOR == null ? "" : this.inputsStreet.P_SNUM_INTERIOR.toUpperCase()
      this.inputsStreet.P_SMANZANA = this.inputsStreet.P_SMANZANA == null ? "" : this.inputsStreet.P_SMANZANA.toUpperCase()
      this.inputsStreet.P_SLOTE = this.inputsStreet.P_SLOTE == null ? "" : this.inputsStreet.P_SLOTE.toUpperCase()
      this.inputsStreet.P_SETAPA = this.inputsStreet.P_SETAPA == null ? "" : this.inputsStreet.P_SETAPA.toUpperCase()
      this.inputsStreet.P_SNOM_CJHT = this.inputsStreet.P_SNOM_CJHT == null ? "" : this.inputsStreet.P_SNOM_CJHT.toUpperCase()
      this.inputsStreet.P_SBLOCKCHALET = this.inputsStreet.P_SBLOCKCHALET == null ? "" : this.inputsStreet.P_SBLOCKCHALET.toUpperCase()
      this.inputsStreet.P_SREFERENCE = this.inputsStreet.P_SREFERENCE == null ? "" : this.inputsStreet.P_SREFERENCE.toUpperCase()

      this.sDireccion = this.inputsStreet.P_SNOM_DIRECCION !== "" ? this.inputsStreet.P_SNOM_DIRECCION + " " : "";
      this.sNumero = this.inputsStreet.P_SNUM_DIRECCION !== "" ? this.inputsStreet.P_SNUM_DIRECCION + " " : "";
      this.sBloque = this.inputsStreet.P_SBLOCKCHALET !== "" ? this.inputsStreet.P_SBLOCKCHALET + " " : "";
      this.sDepar = this.inputsStreet.P_SNUM_INTERIOR !== "" ? this.inputsStreet.P_SNUM_INTERIOR + " " : "";
      this.sCJHT = this.inputsStreet.P_SNOM_CJHT !== "" ? this.inputsStreet.P_SNOM_CJHT + " " : "";
      this.sEtapa = this.inputsStreet.P_SETAPA !== "" ? "ETAPA " + this.inputsStreet.P_SETAPA + " " : "";
      this.sManzana = this.inputsStreet.P_SMANZANA !== "" ? "MZ " + this.inputsStreet.P_SMANZANA + " " : "";
      this.sLote = this.inputsStreet.P_SLOTE !== "" ? "LT " + this.inputsStreet.P_SLOTE + " " : "";
      this.sReferencia = this.inputsStreet.P_SREFERENCE !== "" ? this.inputsStreet.P_SREFERENCE + " " : "";
      this.inputsStreet.P_SDESDIREBUSQ = this.prefVia + this.sDireccion + this.sNumero + this.prefBloque + this.sBloque + this.prefDepar + this.sDepar + this.prefCJHT + this.sCJHT + this.sEtapa + this.sManzana + this.sLote + this.sReferencia + this.sDepartamento + this.sProvincia + this.sDistrito;

      if (this.itemDireccion == null) {
        let existe = 0;
        let item = this.inputsStreet;
        this.listaDirecciones.map(function (dato) {
          if (dato.P_SRECTYPE == item.P_SRECTYPE && dato.P_SDESDIREBUSQ.trim() == item.P_SDESDIREBUSQ.trim()) {
            existe = 1;
          }
        });

        if (existe == 0) {
          this.inputsStreet.P_NROW = this.listaDirecciones.length + 1;

          this.ValidarDireccion(this.inputsStreet, "");
        } else {
          this.activeBtn = false;
          swal.fire("Información", "La dirección ingresada ya se encuentra registrada.", "warning");
        }

      } else {
        let num = this.inputsStreet.P_NROW;
        let existe = 0;
        let item = this.inputsStreet;
        this.listaDirecciones.map(function (dato) {
          if (dato.P_SRECTYPE == item.P_SRECTYPE && dato.P_SDESDIREBUSQ.trim() == item.P_SDESDIREBUSQ.trim() && dato.P_NROW != num) {
            existe = 1;
          }
        });
        if (existe === 0) {
          this.ValidarDireccion(item, num);
        } else {
          this.activeBtn = false;
          swal.fire("Información", "La dirección ingresada ya se encuentra registrada.", "warning");
        }

      }
    }

  }

  ValidarDireccion(itemDireccion, row) {
    let mensaje = ""

    if (itemDireccion.P_SRECTYPE == null || itemDireccion.P_SRECTYPE == 0) {
      this.inputsValidate[0] = true
      mensaje += "El tipo de dirección es requerido <br/>"
    }
    if (itemDireccion.P_STI_DIRE == null || itemDireccion.P_STI_DIRE == 0) {
      this.inputsValidate[1] = true
      mensaje += "El tipo de vía es requerido <br/>"
    } else {
      if (itemDireccion.P_STI_DIRE == "01" || itemDireccion.P_STI_DIRE == "02" ||
        itemDireccion.P_STI_DIRE == "03" || itemDireccion.P_STI_DIRE == "04" ||
        itemDireccion.P_STI_DIRE == "05" || itemDireccion.P_STI_DIRE == "06" ||
        itemDireccion.P_STI_DIRE == "88") {
        if (itemDireccion.P_SNOM_DIRECCION.trim() == "" || itemDireccion.P_SNOM_DIRECCION == null) {
          this.inputsValidate[2] = true
          mensaje += "La dirección es requerida <br/>"
        }
        if (itemDireccion.P_SNUM_DIRECCION.trim() == "" || itemDireccion.P_SNUM_DIRECCION == null) {
          this.inputsValidate[3] = true
          mensaje += "El número de dirección es requerido <br/>"
        }
        if (itemDireccion.P_STI_CJHT != null) {
          if (itemDireccion.P_SNOM_CJHT.trim() == "" || itemDireccion.P_SNOM_CJHT == null) {
            this.inputsValidate[10] = true
            mensaje += "El nombre del conjunto habitacional es requerido <br/>"
          }
        } else {
          this.inputsValidate[10] = false
        }
        if (itemDireccion.P_STI_INTERIOR != null) {
          if (itemDireccion.P_SNUM_INTERIOR.trim() == "" || itemDireccion.P_SNUM_INTERIOR == null) {
            this.inputsValidate[5] = true
            mensaje += "El interior es requerido <br/>"
          }
        } else {
          this.inputsValidate[5] = false
        }
        if (itemDireccion.P_STI_BLOCKCHALET != null) {
          if (itemDireccion.P_SBLOCKCHALET.trim() == "" || itemDireccion.P_SBLOCKCHALET == null) {
            this.inputsValidate[12] = true
            mensaje += "El nombre del block o chalet es requerido <br/>"
          }
        } else {
          this.inputsValidate[12] = false
        }
      }
      if (itemDireccion.P_STI_DIRE == "99") {
        if (itemDireccion.P_SMANZANA.trim() == "" || itemDireccion.P_SMANZANA == null) {
          this.inputsValidate[6] = true
          mensaje += "La manzana es requerido <br/>"
        }
        if (itemDireccion.P_SLOTE.trim() == "" || itemDireccion.P_SLOTE == null) {
          this.inputsValidate[7] = true
          mensaje += "El lote es requerido <br/>"
        }
        if (itemDireccion.P_STI_CJHT == null) {
          this.inputsValidate[9] = true
          mensaje += "El tipo de conjunto habitacional es requerido <br/>"
        }
        if (itemDireccion.P_SNOM_CJHT.trim() == "" || itemDireccion.P_SNOM_CJHT == null) {
          this.inputsValidate[10] = true
          mensaje += "El nombre del conjunto habitacional es requerido <br/>"
        }
        if (itemDireccion.P_STI_INTERIOR != null) {
          if (itemDireccion.P_SNUM_INTERIOR.trim() == "" || itemDireccion.P_SNUM_INTERIOR == null) {
            this.inputsValidate[5] = true
            mensaje += "El interior es requerido <br/>"
          }
        } else {
          this.inputsValidate[5] = false
        }
        if (itemDireccion.P_STI_BLOCKCHALET != null) {
          if (itemDireccion.P_SBLOCKCHALET.trim() == "" || itemDireccion.P_SBLOCKCHALET == null) {
            this.inputsValidate[12] = true
            mensaje += "El nombre del block o chalet es requerido <br/>"
          }
        } else {
          this.inputsValidate[12] = false
        }
      }
    }

    if (itemDireccion.P_NCOUNTRY == null || itemDireccion.P_NCOUNTRY == "0") {
      this.inputsValidate[14] = true
      mensaje += "El país es requerido <br/>";
    } else {
      if (itemDireccion.P_NCOUNTRY == "1") {
        if (itemDireccion.P_NPROVINCE == "0" || itemDireccion.P_NPROVINCE == null) {
          this.inputsValidate[15] = true
          mensaje += "El departamento es requerido <br/>";
        }
        if (itemDireccion.P_NLOCAL == "0" || itemDireccion.P_NLOCAL == null) {
          this.inputsValidate[16] = true
          mensaje += "La provincia es requerida <br/>";
        }
        if (itemDireccion.P_NMUNICIPALITY == "0" || itemDireccion.P_NMUNICIPALITY == null) {
          this.inputsValidate[17] = true
          mensaje += "El distrito es requerido <br/>";
        }
      }
    }

    if (mensaje != "") {
      this.activeBtn = false;
      swal.fire("Información", mensaje, "warning");
    } else {
      //Set DEFFECDATE de recibo original
      if (this.estadoModal === 'rebill') {
        itemDireccion.P_DEFFECDATE = this.rebillData.DATEBEGIN;
      }
      this.clientInformationService.ValStreet(itemDireccion).subscribe(
        res => {
          if (row == "") {
            if (res.P_NCODE === 0) {
              this.listaDirecciones.push(itemDireccion);
              if (this.estadoModal === 'rebill') {
                this.reference.close('modificadoRebill');
              } else {
                this.reference.close();
              }
            } else {
              this.activeBtn = false;
              swal.fire("Información", res.P_SMESSAGE, "warning");
            }
          } else {
            if (res.P_NCODE === 0) {
              this.actualizarDireccion(row)
              if (this.estadoModal === 'rebill') {
                this.reference.close('modificadoRebill');
              } else {
                this.reference.close();
              }
            } else {
              this.activeBtn = false;
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

  actualizarDireccion(row) {
    let item = this.inputsStreet;
    this.listaDirecciones.map(function (dato) {
      if (dato.P_NROW == row) {
        dato.P_TipOper = "";
        dato.P_SDESDIREBUSQ = item.P_SDESDIREBUSQ;
        dato.P_SBLOCKCHALET = item.P_SBLOCKCHALET;
        dato.P_DESDEPARTAMENTO = item.P_DESDEPARTAMENTO;
        dato.P_DESDISTRITO = item.P_DESDISTRITO;
        dato.P_DESPROVINCIA = item.P_DESPROVINCIA;
        dato.P_DESTIDIRE = item.P_DESTIDIRE;
        dato.P_SETAPA = item.P_SETAPA;
        dato.P_SNUM_INTERIOR = item.P_SNUM_INTERIOR;
        dato.P_SLOTE = item.P_SLOTE;
        dato.P_SMANZANA = item.P_SMANZANA;
        dato.P_NCOUNTRY = item.P_NCOUNTRY;
        dato.P_NLOCAL = item.P_NLOCAL;
        dato.P_NMUNICIPALITY = item.P_NMUNICIPALITY;
        dato.P_NPROVINCE = item.P_NPROVINCE;
        dato.P_SNUM_DIRECCION = item.P_SNUM_DIRECCION;
        dato.P_STI_BLOCKCHALET = item.P_STI_BLOCKCHALET;
        dato.P_STI_DIRE = item.P_STI_DIRE;
        dato.P_STI_INTERIOR = item.P_STI_INTERIOR;
        dato.P_STI_CJHT = item.P_STI_CJHT;
        dato.P_SNOM_DIRECCION = item.P_SNOM_DIRECCION;
        dato.P_SRECTYPE = item.P_SRECTYPE;
        dato.P_SREFERENCE = item.P_SREFERENCE;
        dato.P_SNOM_CJHT = item.P_SNOM_CJHT;
      }
    });

  }

  textValidate(event: any, type) {
    CommonMethods.textValidate(event, type)
  }
}
