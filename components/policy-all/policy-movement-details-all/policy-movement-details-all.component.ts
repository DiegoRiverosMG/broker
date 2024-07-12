import { Component, OnInit, Input, EventEmitter } from '@angular/core';
import { PolicyService } from '../../../services/policy/policy.service';
import { NgbModal, ModalDismissReasons, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { AccessFilter } from './../../access-filter';
import Swal from 'sweetalert2';
import { PolicyemitService } from '../../../services/policy/policyemit.service';
import { PolicyDocumentsAllComponent } from '../policy-documents-all/policy-documents-all.component';
import { PolicyMovementCancelComponent } from '../policy-movement-cancel/policy-movement-cancel.component';
import { ParameterSettingsService } from '../../../services/maintenance/parameter-settings.service';
import { PolicyMovementDetailsCreditComponent } from '../policy-movement-details-credit/policy-movement-details-credit.component';
import { PolicyChangeUserComponent } from '../policy-change-user/policy-change-user.component';
import { PolicyListInsuredComponent } from '../policy-list-insured/policy-list-insured.component';

@Component({
  selector: 'app-policy-movement-details-all',
  templateUrl: './policy-movement-details-all.component.html',
  styleUrls: ['./policy-movement-details-all.component.css']
})
export class PolicyMovementDetailsAllComponent implements OnInit {
  @Input() public reference: any;
  @Input() public itemTransaccionList: any;
  @Input() public cotizacionID: any;
  @Input() public NBRANCH; NPRODUCT; NPOLICY; SBRANCH; SPRODUCT; NID_COTIZACION; SCONTRATANTE; NIDCOTIZACION; NTYPE: any;
  @Input() public index_movements: any;

  dateToday: any;
  listToShow: any[] = [];
  InputsPolicy: any = [];
  policyMovementList: any = [];
  show_buttons: boolean = true;

  currentPage = 1; // página actual
  rotate = true; //
  maxSize = 10; // cantidad de paginas que se mostrarán en el paginado
  itemsPerPage = 5; // limite de items por página
  totalItems = 0; // total de items encontrados
  aprobado = "aprobado";
  rechazado = "rechazado";

  canCancelMovements: boolean;
  btnFacturarMovements: boolean;
  flagAnular = false;
  codProducto = JSON.parse(localStorage.getItem('codProducto'))['productId'];
  codPerfil = JSON.parse(localStorage.getItem('currentUser'))['profileId'];
  profile: any;

  valFact: any;

  isLoading: boolean = false;
  public loading: EventEmitter<any> = new EventEmitter();
  carga: boolean = false;

  constructor(
    private policyErmitService: PolicyemitService,
    private modalService: NgbModal,
    private parameterSettingsService: ParameterSettingsService
  ) { }

  async ngOnInit() {
    this.InputsPolicy.SRAMO = null;
    /*this.itemTransaccionList.forEach(item => {
      if (item.NBRANCH == this.NBRANCH && item.NPRODUCT == this.NPRODUCT && item.NPOLIZA == this.NPOLICY) {
        this.InputsPolicy.P_PRODUCTO = item.SPRODUCTO;
        this.InputsPolicy.P_POLIZA = item.NPOLIZA;
        this.InputsPolicy.P_CONTRATANTE = item.SCONTRATANTE;
        this.InputsPolicy.SRAMO = item.SRAMO;
      }
    });*/

    this.InputsPolicy.P_PRODUCTO = this.SPRODUCT;
    this.InputsPolicy.P_POLIZA = this.NPOLICY;
    this.InputsPolicy.P_CONTRATANTE = this.SCONTRATANTE;
    this.InputsPolicy.SRAMO = this.SBRANCH;

    this.profile = await this.getProfileProduct(); // 20230325

    this.getPolicyMovement(this.NBRANCH, this.NPRODUCT, this.NPOLICY);
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

    if (this.NBRANCH == 71) { // AGF 01062023 Val para VCF

      let title_alert: string = "ANULACION";
      let alert_text: string = "";
      let type_anulacion: number = 0;


      var date = new Date();
      var horaString = date.toLocaleString('es-ES');
      this.dateToday = horaString;

      if (item.NTYPEMOVECREDIT == 0) {
        alert_text = "la Aprobación?";
        type_anulacion = 2;
      }

      else {
        alert_text = "el Rechazo?";
        type_anulacion = 3;
      }

      let myFormData: FormData = new FormData();

      const transaction: any = {
        NIDUSER: JSON.parse(localStorage.getItem('currentUser'))['id'],
        SUSUARIO: JSON.parse(localStorage.getItem('currentUser'))['username'].toUpperCase(),
        NIDHEADERPROC: this.policyMovementList[0].NIDHEADERPROC,
        DCREATE: this.dateToday,
        DINI_VIGENCIA: this.policyMovementList[0].DINI_VIGENCIA,
        DFIN_VIGENCIA: this.policyMovementList[0].DFIN_VIGENCIA,
        NPOLICY: this.policyMovementList[0].NPOLICY,
        NPRODUCT: this.policyMovementList[0].NPRODUCT,
        NID_COTIZACION: this.policyMovementList[0].NRO_COTIZACION,
        DES_NTYPE_HIST: type_anulacion == 2 ? "Aprobación anulada" : "Rechazo Anulado",
        NTYPEMOVECREDIT: type_anulacion
      };

      myFormData.append('objeto', JSON.stringify(transaction));


      Swal.fire({
        title: title_alert,
        text: `Desea anular ${alert_text}`,
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
                Swal.fire('Información', res.P_MESSAGE, 'success').then((value) => {
                  this.reference.close(res.P_COD_ERR); //AGF 26062023

                });
              } else {
                Swal.fire('Información', res.P_MESSAGE, 'error');
                Swal.fire({
                  title: "Información",
                  text: res.P_MESSAGE,
                  icon: "error",
                  confirmButtonText: 'OK',
                  allowOutsideClick: false,
                })
              }
            },
            (err) => {
              console.log(err);
            }
          );
        }
      });

    }
    else {
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

  }

  facturarMov(item: any, typeMovement: any) {
    const facturacion: any = {
      P_NID_COTIZACION: item.NRO_COTIZACION
      //P_NMOVEMENT: item.NUM_MOVIMIENTO
    };

    if ([3, 6, 8].includes(this.codProducto) && this.valFact > 0) {
      facturacion.P_NMOVEMENT = item.NMOVEMENT_CT;
    } else {
      facturacion.P_NMOVEMENT = item.NUM_MOVIMIENTO;
    }

    this.policyErmitService.valBilling(facturacion).subscribe(
      (res) => {
        if (res.P_NCODE == 0) {
          this.transMov(item, typeMovement, res.P_SMESSAGE);
        } else {
          Swal.fire({
            title: 'Información',
            text: res.P_SMESSAGE,
            icon: 'error',
            confirmButtonText: 'OK',
            allowOutsideClick: false,
          });
        }
      },
      (err) => {
        console.log(err);
      }
    );
  }

  transMov(item: any, typeMovement: any, message?: any) {
    const question = message;
    const btnMov = 'Facturar';
    const response = 'Se ha facturado correctamente el movimiento';

    let myFormData: FormData = new FormData();
    const transaction: any = {
      P_NID_COTIZACION: item.NRO_COTIZACION,
      P_DEFFECDATE: null,
      P_DEXPIRDAT: null,
      P_NUSERCODE: JSON.parse(localStorage.getItem('currentUser'))['id'],
      P_NTYPE_TRANSAC: typeMovement,
      P_NID_PROC: '',
      P_FACT_MES_VENCIDO: null,
      P_SFLAG_FAC_ANT: null,
      P_SCOLTIMRE: null,
      P_NPAYFREQ: null,
      //P_NMOV_ANUL: item.NUM_MOVIMIENTO,
      P_NNULLCODE: 0,
      P_SCOMMENT: '',
      P_SCOMMENT_FACT: ''
    };

    if ([3, 6, 8].includes(this.codProducto) && this.valFact > 0) { //AVS - PRY FACTURACION 22/08/2023
      transaction.P_NMOV_ANUL = item.NMOVEMENT_CT;
    } else {
      transaction.P_NMOV_ANUL = item.NUM_MOVIMIENTO;
    }

    myFormData.append('transaccionProtecta', JSON.stringify(transaction));

    let additionalComment: string;

    if ([3, 6, 8].includes(this.codProducto) && this.valFact > 0) { //AVS - PRY FACTURACION 22/08/2023
      Swal.fire({
        title: 'Información',
        text: '¿Desea ingresar la glosa correspondiente al comprobante de pago?',
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Si',
        allowOutsideClick: false,
        cancelButtonText: 'No',
      }).then((result) => {
        if (result.value) {
          Swal.fire({
            title: 'Información',
            text: question,
            html:
              `${question}<br>` + `<br>` +// Agrega el mensaje original
              `<textarea id="additionalComment" placeholder=" Ingrese una glosa adicional" style="margin-top: 10px; width: 100%; height: 100px;"></textarea>`, // Agrega el cuadro de texto
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: btnMov,
            allowOutsideClick: false,
            cancelButtonText: 'Cancelar',
          }).then((result) => {
            if (result.value) {
              additionalComment = (<HTMLInputElement>document.getElementById('additionalComment')).value;
              transaction.P_SCOMMENT_FACT = additionalComment;
              myFormData.delete('transaccionProtecta');
              myFormData.append('transaccionProtecta', JSON.stringify(transaction));
              this.policyErmitService.transactionPolicy(myFormData).subscribe(
                (res) => {
                  if (res.P_COD_ERR == 0) {
                    this.carga = true;
                    setTimeout(() => {
                      this.carga = false;
                      Swal.fire('Información', response, 'success').then((value) => {
                        this.getPolicyMovement(
                          item.NBRANCH,
                          item.NPRODUCT,
                          item.NPOLICY
                        );
                      });
                    }, 60000);
                  } else {
                    Swal.fire('Información', 'La generación del comprobante aún se está llevando a cabo. Por favor, espere un breve momento.', 'error');
                  }
                },
                (err) => {
                  console.log(err);
                }
              );
            }
          });
        } else {
          Swal.fire({
            title: 'Información',
            text: question,
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: btnMov,
            allowOutsideClick: false,
            cancelButtonText: 'Cancelar',
          }).then((result) => {
            if (result.value) {
              this.policyErmitService.transactionPolicy(myFormData).subscribe(
                (res) => {
                  if (res.P_COD_ERR == 0) {
                    this.carga = true;
                    setTimeout(() => {
                      this.carga = false;
                      Swal.fire('Información', response, 'success').then((value) => {
                        this.getPolicyMovement(
                          item.NBRANCH,
                          item.NPRODUCT,
                          item.NPOLICY
                        );
                      });
                    }, 60000);
                  } else {
                    Swal.fire('Información', 'La generación del comprobante aún se está llevando a cabo. Por favor, espere un breve momento.', 'error');
                  }
                },
                (err) => {
                  console.log(err);
                }
              );
            }
          });
        }
      });
    } else {
      Swal.fire({
        title: 'Información',
        text: question,
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: btnMov,
        allowOutsideClick: false,
        cancelButtonText: 'Cancelar',
      }).then((result) => {
        if (result.value) {
          this.policyErmitService.transactionPolicy(myFormData).subscribe(
            (res) => {
              if (res.P_COD_ERR == 0) {
                Swal.fire('Información', response, 'success').then((value) => {
                  this.getPolicyMovement(
                    item.NBRANCH,
                    item.NPRODUCT,
                    item.NPOLICY
                  );
                });
              } else {
                Swal.fire('Información', res.P_MESSAGE, 'error');
              }
            },
            (err) => {
              console.log(err);
            }
          );
        }
      });
    }
  }

  async getPolicyMovement(nbranch, nproduct, npolicy) {
    const data: any = {};
    data.NBRANCH = nbranch;
    data.NPRODUCT = nproduct;
    data.NPOLICY = npolicy;


    const valfact: any = {};
    valfact.P_NPOLICY = npolicy;
    valfact.P_NBRANCH = nbranch;

    if (this.NBRANCH == 71) { // AGF 01062023 Val para VCF

      this.policyErmitService.getPolicyMovementsTransAllList(data).subscribe(
        (res) => {
          this.policyMovementList = res;
          const data2: any = {};
          data2.NIDUSER = JSON.parse(localStorage.getItem('currentUser'))['id'];
          data2.NPOLICY = npolicy;
          data2.NPRODUCT = nproduct;

          let my_form_data: FormData = new FormData();
          my_form_data.append('objeto', JSON.stringify(data2));


          this.policyErmitService.getPolicyMovementsVCF(my_form_data).subscribe(
            (res2) => {

              this.policyMovementList.push(...res2);
              this.index_movements = this.policyMovementList.length;
              // Si el ultimo proceso es Rechazar NO se debe mostrar los botones de aprobar anular
              // console.log(this.policyMovementList[this.index_movements - 1]);
              // console.log(this.policyMovementList[this.index_movements - 1].NTYPEMOVECREDIT);

              if (this.policyMovementList.length > 1) {

                if (this.policyMovementList[this.index_movements - 1].NTYPEMOVECREDIT == 1 || this.policyMovementList[this.index_movements - 1].NTYPEMOVECREDIT == 0 || this.policyMovementList[this.index_movements - 1]?.SSTATUS_POL == "6") {

                  this.show_buttons = false;
                }

                if (this.policyMovementList[this.index_movements - 1]?.SSTATUS_POL != "6") {
                  this.policyMovementList[this.index_movements - 1].last_element = 1;
                }
              }

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

            (err2) => {
              console.log(err2);
            });
        },
        (err) => {
          console.log(err);
        }
      );

    }
    else {
      await this.policyErmitService.getValFact(valfact).subscribe((res) => {
        this.valFact = res.P_VAL;

        this.policyErmitService.getPolicyMovementsTransAllList(data).subscribe(
          (res) => {
            this.policyMovementList = res;
            console.log(this.policyMovementList);
            // ACPER FUNCION PARA IDENTIFICAR OBS
            this.policyMovementList.forEach(item => {
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
      });
    }
  }

  reimprimir(item) { }

  async verDocumentos(item: any) {
    let modalRef: NgbModalRef;
    modalRef = this.modalService.open(PolicyDocumentsAllComponent, { size: 'lg', backdropClass: 'light-blue-backdrop', backdrop: 'static', keyboard: false });
    modalRef.componentInstance.reference = modalRef;
    let documentos = item.SRUTA != null && item.SRUTA != '' ? await this.getDocuments(item.SRUTA) : item.SRUTAS_GEN;

    if (this.NBRANCH == 71) {

      if (item.SRUTA_CONSTANCIA_ENDOSO != undefined) {

        let documentos2 = await this.getDocuments(item.SRUTA_CONSTANCIA_ENDOSO); // Nos retornar la url con un arreglo de archivos, en este caso solo hay 1 y ese nos devuelve

        if (documentos2 || documentos2 != undefined) {
          if (documentos == null) {
            documentos = [];
            documentos.push(documentos2[0]);
          }
          else {
            documentos.unshift(documentos2[0]); // Agregamos a la lista de documnetos para poder descargar si existiece algun archivo de movimiento de endoso
          }
        }

      }
    }
    modalRef.componentInstance.generadosList = documentos;
  }


  async ChangeUser(item: any) {
    if(this.NBRANCH == 73){

      item.npolicy = this.InputsPolicy.P_POLIZA
      console.log(item);
      
      this.policyErmitService.getInsuredForTransactionPolicy(item).subscribe(
        res => {
          if(res.validation == "0"){
            let modalRef: NgbModalRef;
            modalRef = this.modalService.open(PolicyListInsuredComponent, { size: 'lg', windowClass: 'modalCustom', backdropClass: 'light-blue-backdrop', backdrop: 'static', keyboard: false });
            modalRef.componentInstance.reference = modalRef;
            modalRef.componentInstance.listInsured = res.inrureds;
            modalRef.componentInstance.request = item;
          }else{
            Swal.fire('Información','No se permite hacer el cambio de asegurado, porque la fecha actual es 5 días más a la fecha de movimiento.','warning')
            return;
          }
        },
        err => {
          Swal.fire('Error',err,'error')
        }
      )
    }

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

  clickAprobar(action_type: number) {
    //  action_type 0: aprobado, 1= rechazado, 2: anulacion aprobacio, 3:anulacion rechazo
    if (action_type === 0) {
      const modalRef = this.modalService.open(PolicyMovementDetailsCreditComponent, {
        size: 'lg',
        windowClass: 'modalCustom',
        backdropClass: 'light-blue-backdrop',
        backdrop: 'static',
        keyboard: false,
      });
      modalRef.componentInstance.reference = modalRef;
      modalRef.componentInstance.tittle = "Aprobación de Endoso";
      modalRef.componentInstance.data_policy = this.policyMovementList;
      modalRef.componentInstance.type_move_credit = 0;
      //INI AGF 26062023
      modalRef.result.then((result) => {
        // if (result == 0 || result == 1 )
        this.reference.close();
      }, (error) => {
        console.log('Error al cerrar el modal:', error);
      });
      //FIN AGF 26062023
    }

    else {
      const modalRef = this.modalService.open(PolicyMovementDetailsCreditComponent, {
        size: 'lg',
        windowClass: 'modalCustom',
        backdropClass: 'light-blue-backdrop',
        backdrop: 'static',
        keyboard: false,
      });
      modalRef.componentInstance.reference = modalRef;
      modalRef.componentInstance.tittle = "Rechazo de Endoso";
      modalRef.componentInstance.data_policy = this.policyMovementList;
      modalRef.componentInstance.type_move_credit = 1;
      //INI AGF 26062023
      modalRef.result.then((result) => {
        // if (result == 0 || result == 1 )
        this.reference.close();
      }, (error) => {
        console.log('Error al cerrar el modal:', error);
      });
      //FIN AGF 26062023
    }
  }


  sendMailConstance(item: any) {

    const send_data: any = {
      NPOLICY: this.NPOLICY,
      NBRANCH: this.NBRANCH,
      NID_COTIZACION: this.NID_COTIZACION,
      NIDHEADERPROC: item.NIDHEADERPROC,
      NUM_MOVIMIENTO: item.NUM_MOVIMIENTO,
      NTYPEMOVECREDIT: item.NTYPEMOVECREDIT,
    };

    let myFormData: FormData = new FormData();

    myFormData.append('objeto', JSON.stringify(send_data));

    Swal.fire({
      title: "Información",
      text: `Deseas enviar por correo la constancia de ${item.DES_NTYPE_HIST.toLowerCase()} al contratante?`,
      icon: 'info',
      showCancelButton: true,
      allowOutsideClick: false,
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.value) {

        this.policyErmitService.sendMailMovementsVCF(myFormData).subscribe(
          (res) => {
            if (res.P_COD_ERR == 0) {

              Swal.fire({
                title: "Información",
                text: "Se envió con éxito el correo electrónico al contratante",
                icon: "success",
                confirmButtonText: 'OK',
                allowOutsideClick: false,
              })

            } else {
              Swal.fire({
                title: "Información",
                text: "No se logró enviar la constancia de rechazo, revisar el correo electrónico del contratante",
                icon: "error",
                confirmButtonText: 'OK',
                allowOutsideClick: false,
              })
            }
          },
          (err) => {
            console.log(err);
          }
        );
      }
    });

  }

  relanzarDocumento(item: any) {

    Swal.fire({
      title: 'Relanzar Documento',
      text: '¿Deseas realanzar los documentos de esta transacción?',
      icon: 'info',
      showCancelButton: true,
      confirmButtonText: 'Relanzar',
      allowOutsideClick: false,
      cancelButtonText: 'Cancelar'
    })
      .then((result) => {
        if (result.value) {
          const data: any = {
            npolicy: item.NPOLICY,
            nbranch: item.NBRANCH,
            nproduct: item.NPRODUCT,
            nidheaderproc: item.NIDHEADERPROC,
            sruta: item.SRUTA,
            suser: JSON.parse(localStorage.getItem('currentUser'))['id']
          };

          this.policyErmitService.relanzarDocumento(data).subscribe(
            (res) => {
              // console.log(res);
              if (res.P_NCODE == 0) {
                item.NENV_PRINT = 3;

                Swal.fire({
                  title: "Información",
                  text: "Los documentos de esta transacción han empezado a relanzarse",
                  icon: "success",
                  confirmButtonText: 'OK',
                  allowOutsideClick: false,
                })

              } else {
                Swal.fire({
                  title: "Información",
                  text: res.P_SMESSAGE,
                  icon: "error",
                  confirmButtonText: 'OK',
                  allowOutsideClick: false,
                })
              }
            },
            (err) => {
              console.log(err);
            }
          );
        }
      });

  }

}
