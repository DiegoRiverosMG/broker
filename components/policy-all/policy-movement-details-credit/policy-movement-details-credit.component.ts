import { Component, OnInit, Input, EventEmitter, ViewChild, ElementRef } from '@angular/core';
import { PolicyService } from '../../../services/policy/policy.service';
import { NgbModal, ModalDismissReasons, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { AccessFilter } from '../../access-filter';
import Swal from 'sweetalert2';
import { PolicyemitService } from '../../../services/policy/policyemit.service';
import { PolicyDocumentsAllComponent } from '../policy-documents-all/policy-documents-all.component';
import { PolicyMovementCancelComponent } from '../policy-movement-cancel/policy-movement-cancel.component';
import { ParameterSettingsService } from '../../../services/maintenance/parameter-settings.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-policy-movement-details-credit',
  templateUrl: './policy-movement-details-credit.component.html',
  styleUrls: ['./policy-movement-details-credit.component.css']
})
export class PolicyMovementDetailsCreditComponent implements OnInit {

  @Input() public reference: any;
  @Input() public itemTransaccionList: any;
  @Input() public cotizacionID: any;
  @Input() public NBRANCH; NPRODUCT; NPOLICY; SBRANCH; SPRODUCT; SCONTRATANTE: any;
  @Input() public tittle: any;
  @Input() public type_move_credit: number;
  @Input() public data_policy: any;
  @Input() public observtion_file: any;
  @Input() public dateToday: any;
  @ViewChild("myInput") inputFile: ElementRef;
  @ViewChild('fileInput', { static: false })


  listToShow: any[] = [];
  InputsPolicy: any = [];
  policyMovementList: any = [];
  files: File[] = [];
  fileUpload: File;
  listToFileConfig: any = [];
  currentPage = 1; // página actual
  rotate = true; //
  maxSize = 10; // cantidad de paginas que se mostrarán en el paginado
  itemsPerPage = 5; // limite de items por página
  totalItems = 0; // total de items encontrados
  clickValidarArchivos = false;
  canCancelMovements: boolean;
  btnFacturarMovements: boolean;
  flagAnular = false;
  codProducto = JSON.parse(localStorage.getItem('codProducto'))['productId'];
  profile: any;
  desc_observation: string;
  isLoading: boolean = false;

  public loading: EventEmitter<any> = new EventEmitter();

  constructor(
    private policyErmitService: PolicyemitService,
    private modalService: NgbModal,
    private parameterSettingsService: ParameterSettingsService,
    private router: Router,
  ) { }

  async ngOnInit() {

    var date = new Date();
    var horaString = date.toLocaleString('es-ES');
    this.dateToday = horaString;
  }


  async getProfileProduct() {
    let profile = 0;

    let _data: any = {};
    _data.nUsercode = JSON.parse(localStorage.getItem("currentUser"))["id"]
    _data.nProduct = this.codProducto;
    await this.parameterSettingsService.getProfileProduct(_data).toPromise()
      .then(
        (res) => {
          profile = res;
        },
        err => {
          console.log(err)
        }
      );

    return profile;
  }

  anularMov(item: any, typeMovement: any) {
    if (Number(this.codProducto) === 6 || Number(this.codProducto) === 8) {
      let modalRef: NgbModalRef;
      modalRef = this.modalService.open(PolicyMovementCancelComponent, {
        size: 'lg',
        backdropClass: 'light-blue-backdrop',
        backdrop: 'static',
        keyboard: false,
      });
      modalRef.componentInstance.reference = modalRef;
      modalRef.componentInstance.itemAnul = item;
      modalRef.componentInstance.typeMovement = typeMovement;

      modalRef.result.then(
        (renovacion) => {
          if (renovacion !== undefined) {
            this.getPolicyMovement(this.NBRANCH, this.NPRODUCT, this.NPOLICY);
          }
        },
        (reason) => { }
      );
    } else {
      Swal.fire({
        title: "Información",
        text: "¿Deseas anular este movimiento?",
        icon: "question",
        showCancelButton: true,
        confirmButtonText: "Si",
        allowOutsideClick: false,
        cancelButtonText: 'No'
      })
        .then((result) => {
          if (result.value) {
            this.isLoading = true;
            this.loading.emit(true);
            let data: any = {};
            data.NIDHEADERPROC = item.NIDHEADERPROC;
            data.SCERTYPE = item.SCERTYPE;
            data.NBRANCH = item.NBRANCH;
            data.NPRODUCT = item.NPRODUCT;
            data.NPOLICY = item.NPOLICY;
            data.NMOVEMENT = item.NUM_MOVIMIENTO;
            data.NTYPE_HIST = item.NTYPE_HIST;
            data.NUSERCODE = JSON.parse(localStorage.getItem("currentUser"))["id"];
            data.NFLAG_AN_PROC = 0;
            data.NMOVEMENT_PH = item.NMOVEMENT_PH;
            this.policyErmitService.CancelMovement(data).subscribe(
              res => {
                console.log(res);
                if (res.P_NCODE == 0) {
                  Swal.fire("Información", res.P_SMESSAGE, "success");
                  this.isLoading = false;
                  this.loading.emit(false);
                  this.reference.close(res.P_NCODE)
                  //this.getPolicyMovement(this.NBRANCH, this.NPRODUCT, this.NPOLICY);
                }
                else {
                  this.isLoading = false;
                  this.loading.emit(false);
                  Swal.fire("Error", res.P_SMESSAGE, "error");
                }
                this.getPolicyMovement(this.NBRANCH, this.NPRODUCT, this.NPOLICY);
              },
              err => {
                this.isLoading = false;
                this.loading.emit(false);
                console.log(err);
              }
            );
          }
        });

    }

  }

  seleccionArchivos() {
    if (this.files.length === 0) {
      this.clickValidarArchivos = false;
    }
    this.clickValidarArchivos = true;

    if (this.files.length >= 2) {
      this.files.shift();
    }

    console.log(this.files[0]);
  }

  sendData() {

    let alert_title = "";
    let title_alert = "";
    let desc_type = "";

    if (this.type_move_credit == 0) {
      alert_title = "la aprobación ";
      title_alert = "APROBACIÓN ENDOSO";
      desc_type = "Endoso aprobado";
    }
    else if (this.type_move_credit == 1) {
      alert_title = "el rechazo ";
      title_alert = "RECHAZO ENDOSO";
      desc_type = "Endoso rechazado";

    }

    let myFormData: FormData = new FormData();
    const transaction: any = {
      NIDUSER: JSON.parse(localStorage.getItem('currentUser'))['id'],
      SUSUARIO: JSON.parse(localStorage.getItem('currentUser'))['username'].toUpperCase(),
      NIDHEADERPROC: this.data_policy[0].NIDHEADERPROC,
      DCREATE: this.dateToday,
      DINI_VIGENCIA: this.data_policy[0].DINI_VIGENCIA,
      DFIN_VIGENCIA: this.data_policy[0].DFIN_VIGENCIA,
      // SNOMBARCHIVO: "",
      NPOLICY: this.data_policy[0].NPOLICY,
      NPRODUCT: this.data_policy[0].NPRODUCT,
      SOBSERVACIONES: this.desc_observation,
      NID_COTIZACION: this.data_policy[0].NRO_COTIZACION,
      DES_NTYPE_HIST: desc_type,
      NTYPEMOVECREDIT: this.type_move_credit
    };

    myFormData.append('objeto', JSON.stringify(transaction));
    myFormData.append('dataFile', this.files[0]);

    Swal.fire({
      title: title_alert,
      text: `Desea realizar ${alert_title}?`,
      icon: 'info',
      showCancelButton: true,
      allowOutsideClick: false,
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.value) {
        this.policyErmitService.savePolicyMovementsVCF(myFormData).subscribe(
          (res) => {
            console.log(res);
            if (res.P_COD_ERR == 0) {
              console.log("Entra");
              Swal.fire('Información', res.P_MESSAGE, 'success').then((value) => {
                this.reference.close(res.P_COD_ERR); //AGF 26062023
              });
            } else {
              Swal.fire('Información', res.P_MESSAGE, 'error').then((value) => {
                this.reference.close(res.P_COD_ERR); //AGF 26062023
              });
            }
          },
          (err) => {
            console.log(err);
          }
        );
      }
    });
  }


  getPolicyMovement(nbranch, nproduct, npolicy) {
    const data: any = {};
    data.NBRANCH = nbranch;
    data.NPRODUCT = nproduct;
    data.NPOLICY = npolicy;


    this.policyErmitService.getPolicyMovementsTransAllList(data).subscribe(
      (res) => {
        this.policyMovementList = res;


        // ACPER FUNCION PARA IDENTIFICAR OBS
        this.policyMovementList.forEach(item => {
          console.log(item);
          if (!!item.SOBSERVACIONES && item.SOBSERVACIONES.includes('/')) {
            let array = item.SOBSERVACIONES.split('/');
            if (array.length > 1) {
              item.FLAG_OBSERVACIONES = 1;
            } else {
              item.FLAG_OBSERVACIONES = 0;
            }
          }
        });

        this.totalItems = this.policyMovementList.length;
        this.listToShow = this.policyMovementList.slice(
          (this.currentPage - 1) * this.itemsPerPage,
          this.currentPage * this.itemsPerPage
        );
        this.canCancelMovements =
          Number(this.codProducto) === 7 || Number(this.codProducto) === 6 || Number(this.codProducto) === 8 || Number(this.codProducto) === 4
            ? false
            : this.codProducto == 3 ? this.profile != 153 ? true : false : true;
        this.btnFacturarMovements = false;
        this.policyMovementList.forEach((item) => { });
      },
      (err) => {
        console.log(err);
      }
    );
  }


  UploadFile(archivo: File[]) {
    this.fileUpload = null;
    if (archivo.length > 0) {
      this.fileUpload = archivo[0];
    }
    console.log(archivo);
    console.log(this.fileUpload);

  }

  reimprimir(item) { }


  async verDocumentos(item: any) {
    let modalRef: NgbModalRef;
    modalRef = this.modalService.open(PolicyDocumentsAllComponent, { size: 'lg', backdropClass: 'light-blue-backdrop', backdrop: 'static', keyboard: false });
    modalRef.componentInstance.reference = modalRef;
    let documentos = item.SRUTA != null && item.SRUTA != '' ? await this.getDocuments(item.SRUTA) : item.SRUTAS_GEN;
    modalRef.componentInstance.generadosList = documentos;
  }

  async getDocuments(sruta) {
    let response: String[] = null;
    await this.policyErmitService.getDocumentsList(sruta).toPromise().then(
      async (res) => {
        response = res;
      },
      (err) => {
        console.log(err);
      }
    );

    return response;
  }

  pageChanged(currentPage) {
    this.currentPage = currentPage;
    this.listToShow = this.policyMovementList.slice(
      (this.currentPage - 1) * this.itemsPerPage,
      this.currentPage * this.itemsPerPage
    );
  }

  descargaRecibos(item, title, titleColumn) {
    let arrayCsv = [];
    if (item != '') {
      let array = item.split('/');
      for (let item of array) {

        let itemArray = {
          NRO_RECIBO: item.trim(),
        };

        let itemArrayObs = {
          OBSERVACIONES: item.trim(),
        };

        if (titleColumn == 'NRO_RECIBO') {
          arrayCsv.push(itemArray);
        } else {
          arrayCsv.push(itemArrayObs);
        }
      }
      this.downloadFile(arrayCsv, title);
    } else {
      Swal.fire('Información', 'No hay recibos para descargar', 'error');
      return;
    }
  }

  // descargar archivo csv
  downloadFile(JSONData, ReportTitle, ShowLabel = true) {
    var arrData = typeof JSONData != 'object' ? JSON.parse(JSONData) : JSONData;
    var CSV = '';

    if (ShowLabel) {
      var row = '';

      for (var index in arrData[0]) {
        row += index + ';';
      }
      row = row.slice(0, -1);
      CSV += row + '\r\n';
    }
    for (var i = 0; i < arrData.length; i++) {
      var row = '';
      for (var index in arrData[i]) {
        row += '"' + arrData[i][index] + '";';
      }
      row.slice(0, row.length - 1);
      CSV += row + '\r\n';
    }
    if (CSV == '') {
      alert('Invalid data');
      return;
    }
    var fileName = 'REPORTE_';
    fileName += ReportTitle.replace(/ /g, '_');
    var uri = 'data:text/csv;charset=utf-8,' + escape(CSV);
    var link = document.createElement('a');
    link.href = uri;
    link.download = fileName + '.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}

