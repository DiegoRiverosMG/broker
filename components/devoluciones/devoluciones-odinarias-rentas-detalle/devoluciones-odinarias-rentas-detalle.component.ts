import { Component, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NgbModalConfig } from '@ng-bootstrap/ng-bootstrap';
import { ActivatedRoute, Router } from '@angular/router';
import { RentasService } from '../../../../backoffice/services/rentas/rentas.service';
import { OthersService } from '../../../services/shared/others.service';
import Swal, { SweetAlertIcon } from 'sweetalert2';
import { Subscription } from 'rxjs';
import { ComentarioModalComponent } from '../../modals/comentario-modal/comentario-modal.component';
import { ConfirmModalComponent } from '../../modals/confirm-modal/confirm-modal.component';

@Component({
  selector: 'app-devoluciones-odinarias-rentas-detalle',
  templateUrl: './devoluciones-odinarias-rentas-detalle.component.html',
  styleUrls: ['./devoluciones-odinarias-rentas-detalle.component.css'],
  providers: [NgbModalConfig, NgbModal],
})
export class DevolucionesOdinariasRentasDetalleComponent implements OnInit {
  P_SCODE: string;
  ticket: any = [];
  beneficiaries: any = [];
  history_pol: any = [];
  historyStatus: any = [];
  doc_enviados: any = [];
  doc_registrados: any = [];
  NUSERCODE: number;
  NIDPROFILE: number;
  productCanal: number;
  today: any;
  SCODE_JIRA: string;
  suscription: Subscription;
  items: any = [];
  listActions: any = [];
  inputs: any = [];
  edit: boolean = false;
  edit2: boolean = false;
  edit3: boolean = false;
  motivos: any[];
  opcionesMotivos: any[];
  submotivos: any[];
  opcionesSubMotivos: any[];
  newBeneficiary: any = [];
  isAddingNew = false;
  fileCant: number;
  fileSize: number;
  fileFormats: string;
  currentPage: number = 1;
  pageSize: number = 10;
  totalStatusHistory: number = 0;
  displayedStatusHistory: any;
  totalPage: number = 0;
  itemsPerPage: number = 10;
  showPagination: boolean = false;
  pestaActiva: number = 1;
  constructor(
    private router: Router,
    private rentasService: RentasService,
    private route: ActivatedRoute,
    private othersService: OthersService,
    private modalService: NgbModal
  ) {}
  async ngOnInit() {
    this.NUSERCODE = JSON.parse(localStorage.getItem('currentUser')).id;
    this.getConfFile();
    const date = new Date();
    this.today = this.formatDate(date);
    this.P_SCODE = this.route.snapshot.paramMap.get('SCODE');
    this.getTickets();
    try {
      await this.getProductCanal();
      await this.NidProfile();
      this.getListActions();
      this.getListActionsTicket(this.P_SCODE);
    } catch (error) {
      console.error(error);
    }
    this.suscription = this.rentasService.refreshDetail$.subscribe(() => {
      this.getTickets();
      this.getListActions();
      this.getListActionsTicket(this.P_SCODE);
    });
  }

  //FUNCION PARA DAR FORMATO A UNA FECHA
  formatDate(date) {
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();

    const paddedDay = day < 10 ? `0${day}` : day;
    const paddedMonth = month < 10 ? `0${month}` : month;

    return `${paddedDay}/${paddedMonth}/${year}`;
  }

  //FUNCION PARA CAMBIAR DE PESTAÑA
  cambiarPestana(pestana: number) {
    this.pestaActiva = pestana;
  }

  //FUNCION PARA RETROCEDER A LA BANDEJA
  atras() {
    this.router.navigate(['/extranet/devoluciones-odinarias-rentas']);
  }

  getTickets() {
    //SERVICIO PARA RECUPERAR EL TICKET SELECCIONADO
    this.rentasService.getListTicket({ P_SCODE: this.P_SCODE }).subscribe({
      next: (response) => {
        this.ticket = response.C_TICKET[0];
        this.beneficiaries = response.C_BENEFICIARIES;
        this.history_pol = response.C_HISTORY_POL;
        this.doc_enviados = response.C_ADJUNTOS_ENVI;
        this.doc_registrados = response.C_ADJUNTOS_REGIS;
        this.doc_registrados = response.C_ADJUNTOS_REGIS;
        this.historyStatus = response.C_HISTORY_STATUS;
        this.totalStatusHistory = this.historyStatus.length;
        this.paginateTickets();
        this.showPagination = true;


      },
      error: (error) => {
        console.error(error);
      },
    });
  }

  paginateTickets() {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = Math.min(startIndex + this.pageSize, this.totalStatusHistory);
    this.displayedStatusHistory = this.historyStatus.slice(startIndex, endIndex);
    console.log(this.displayedStatusHistory)
    this.getTotalPages();
  }

  changePage(pageNumber: number) {
    this.currentPage = pageNumber;
    this.paginateTickets();
  }

  changeItemsPerPage() {
    this.pageSize = this.itemsPerPage;
    this.currentPage = 1; // Reset to the first page
    this.paginateTickets();
  }

  getTotalPages() {
    this.totalPage = Math.ceil(this.totalStatusHistory / this.itemsPerPage);
    console.log(this.totalPage)
  }

  //FUNCION PARA DESCARGAR ARCHIVOS
  async downloadFile(filePath: string) {
    const mensaje = await this.getMessage(1);
    const mensajeParts: [SweetAlertIcon, string, string] = this.separateString(mensaje);
  
    console.log(filePath);
    this.othersService.downloadFile(filePath).subscribe(
      (res) => {
        if (res.StatusCode == 1) {
          Swal.fire('Información', this.listToString(res.ErrorMessageList), 'error');
        } else {
          const newBlob = new Blob([res], { type: 'application/pdf' });
          
          const navigator: any = window.navigator;
          if (navigator && navigator.msSaveOrOpenBlob) {
            navigator.msSaveOrOpenBlob(newBlob);
            return;
          }
  
          const data = window.URL.createObjectURL(newBlob);
  
          const link = document.createElement('a');
          link.href = data;
  
          link.download = filePath.substring(filePath.lastIndexOf('\\') + 1);
          link.dispatchEvent(new MouseEvent('click', {
            bubbles: true,
            cancelable: true,
            view: window,
          }));
  
          setTimeout(() => {
            window.URL.revokeObjectURL(data);
            link.remove();
          }, 100);
        }
      },
      (err) => {
        Swal.fire({
          icon: mensajeParts[0],
          title: mensajeParts[1],
          text: mensajeParts[2],
        });
        console.log(err);
      }
    );
  }
  

  listToString(list: String[]): string {
    let output = '';
    if (list != null) {
      list.forEach(function (item) {
        output = output + item + ' <br>';
      });
    }
    return output;
  }

  async uploadFile2(file: File) {
    const mensaje = await this.getMessage(22);
    const mensaje2 = await this.getMessage(1);
    const mensajeParts: [SweetAlertIcon, string, string] =
      this.separateString(mensaje);
    const mensajeParts2: [SweetAlertIcon, string, string] =
      this.separateString(mensaje2);

    const filePath = file.name;
    console.log(filePath);
    const fileNameWithoutExtension = file.name.substring(
      0,
      file.name.lastIndexOf('.')
    );
    const extension = file.name.substring(file.name.lastIndexOf('.'));

    // Concatenar el sufijo "-ticket" antes de la extensión
    const fileNameWithSuffix = `${fileNameWithoutExtension}-${this.P_SCODE}${extension}`;
    const formData = new FormData();
    formData.append('file', file);
    console.log(fileNameWithSuffix);
    this.rentasService.uploadFile(fileNameWithSuffix, formData).subscribe(
      (res) => {
        console.log(res);
        if (res.StatusCode === 0) {
          console.log(res.GenericResponse);
          const data = {
            P_SCODE: this.P_SCODE,
            P_NTICKET: this.ticket.NTICKET,
            P_SNAME: fileNameWithSuffix,
            P_SSIZE: `${(file.size / 1024).toFixed(2)} KB`,
            P_SPATH: res.GenericResponse,
            P_NUSERCODE: this.NUSERCODE,
          };
          const existingDoc = this.doc_registrados.find(
            (doc) => doc.SNAME === fileNameWithSuffix
          );

          existingDoc.SPATH = res.GenericResponse;

          console.log(existingDoc);
          this.rentasService.insTickAdjunt(data).subscribe(
            (res) => {
              console.log(res);
            },
            (err) => {
              Swal.fire({
                icon: mensajeParts2[0],
                title: mensajeParts2[1],
                text: mensajeParts2[2],
              });
            }
          );
          Swal.fire({
            icon: mensajeParts[0],
            title: mensajeParts[1],
            text: mensajeParts[2],
          });
        } else {
          Swal.fire('Información', res.Message, 'error');
        }
      },
      (err) => {
        Swal.fire({
          icon: mensajeParts2[0],
          title: mensajeParts2[1],
          text: mensajeParts2[2],
        });
      }
    );
  }

  async delTickAdjunt(nid: number) {
    const mensaje = await this.getMessage(11);
    const mensaje2 = await this.getMessage(1);
    const mensajeParts: [SweetAlertIcon, string, string] =
      this.separateString(mensaje);
    const mensajeParts2: [SweetAlertIcon, string, string] =
      this.separateString(mensaje2);

    const data = {
      P_NID: nid,
    };
    this.rentasService.delTickAdjunt(data).subscribe(
      (res) => {
        Swal.fire({
          icon: mensajeParts[0],
          title: mensajeParts[1],
          text: mensajeParts[2],
        });
      },
      (err) => {
        Swal.fire({
          icon: mensajeParts2[0],
          title: mensajeParts2[1],
          text: mensajeParts2[2],
        });
      }
    );
  }

  getListActionsTicket(P_SCODE: string) {
    const data = {
      P_SCODE: P_SCODE,
      P_NUSERCODE: this.NUSERCODE,
      P_NPRODUCT: this.productCanal,
      P_NIDPROFILE: this.NIDPROFILE,
    };
    //SERVICIO PARA LISTAR LAS ACCIONES DEL TICKET
    this.rentasService.getListActionsTicket(data).subscribe({
      next: (response) => {
        this.items = response.C_TABLE[0];
      },
      error: (error) => {
        console.error(error);
      },
    });
  }
  getListActions() {
    //SERVICIO PARA LISTAR LAS ACCIONES DEL USUARIO ACTUAL TENIENDO EN CUENTA EL PRODUCTO
    this.rentasService
      .getListActions({
        P_NPRODUCT: this.productCanal,
        P_NIDPROFILE: this.NIDPROFILE,
      })
      .subscribe({
        next: (response) => {
          this.listActions = response.C_TABLE[0];
        },
        error: (error) => {
          console.error(error);
        },
      });
  }

  NidProfile(): Promise<void> {
    //SERVCIO PARA PARA OBTENER EL ID DE PERFIL TENIENDO EN CUENTA EL PRODUCTO
    return new Promise((resolve, reject) => {
      this.rentasService
        .getNidProfile({
          P_NPRODUCT: this.productCanal,
          P_NIDUSER: this.NUSERCODE,
        })
        .subscribe({
          next: (response) => {
            this.NIDPROFILE = response.C_TABLE[0].NIDPROFILE;
            resolve();
          },
          error: (error) => {
            console.error(error);
            reject(error);
          },
        });
    });
  }
  getProductCanal(): Promise<void> {
    return new Promise((resolve, reject) => {
      //SERVICIO PARA RECUPERAR EL PRODUCTO
      this.rentasService.getProductCanal().subscribe({
        next: (response) => {
          this.productCanal = response.NPRODUCT;
          resolve();
        },
        error: (error) => {
          console.error(error);
          reject(error);
        },
      });
    });
  }
  popupData: number;

  updStatusTicket(P_SCODE_JIRA: string, P_SNAME_ACT: string, ticket: any) {
    const data = {
      P_NTICKET: ticket.NTICKET,
      P_SNAME_ACT: P_SNAME_ACT,
      P_NIDPROFILE: this.NIDPROFILE,
    };
    this.rentasService.getValpopup(data).subscribe({
      next: (res: any) => {
        if (res.P_NCODE == 0) {
          this.popupData = res.C_TABLE[0].NPOP_UP;
          const dataupdate = {
            P_SCODE_JIRA: P_SCODE_JIRA,
            P_NUSERCODE: this.NUSERCODE,
            P_NIDPROFILE: this.NIDPROFILE,
            P_SNAME_ACT: P_SNAME_ACT,
            P_NTYPECOMMENT: 0,
            P_SCOMMETS: '',
          };

          if (this.popupData == 1) {
            this.confirmModal(dataupdate);
          } else {
            this.Comment(ticket, this.popupData, P_SCODE_JIRA, P_SNAME_ACT);
          }
        }
      },
      error: (error) => {
        console.log(error);
      },
    });
  }
  confirmModal(dataupdate) {
    let modalRef = this.modalService.open(ConfirmModalComponent, {
      size: 'md',
      backdropClass: 'light-blue-backdrop',
      backdrop: 'static',
      keyboard: false,
    });
    modalRef.componentInstance.formModalReference = modalRef;
    modalRef.result
      .then(() => {
        this.rentasService.updStatusTicketDetail(dataupdate).subscribe({
          next: (response) => {
            const mensajeParts: [SweetAlertIcon, string, string] =
              this.separateString(response.P_SMESSAGE);
            if (response.P_NCODE == 0) {
              Swal.fire({
                icon: mensajeParts[0],
                title: mensajeParts[1],
                text: mensajeParts[2],
              });
            } else {
              Swal.fire({
                icon: mensajeParts[0],
                title: mensajeParts[1],
                text: mensajeParts[2],
              });
            }
          },
          error: (error) => {
            console.error(error);
          },
        });
      })
      .catch((error) => {
        console.log('Modal cerrado');
      });
  }

  //FUNCION PARA ABRIR EL MODAL DE COMENTARIO
  Comment(ticket, popupData, P_SCODE_JIRA, P_SNAME_ACT) {
    let modalRef = this.modalService.open(ComentarioModalComponent, {
      size: 'md',
      backdropClass: 'light-blue-backdrop',
      backdrop: 'static',
      keyboard: false,
    });
    modalRef.componentInstance.formModalReference = modalRef;
    modalRef.componentInstance.NUSERCODE = this.NUSERCODE;
    modalRef.componentInstance.NIDPROFILE = this.NIDPROFILE;
    modalRef.componentInstance.POPUPDATA = popupData;
    modalRef.componentInstance.ticket = ticket;
    modalRef.result
      .then((commentData) => {
        const dataupdate = {
          P_SCODE_JIRA: P_SCODE_JIRA,
          P_NUSERCODE: this.NUSERCODE,
          P_NIDPROFILE: this.NIDPROFILE,
          P_SNAME_ACT: P_SNAME_ACT,
          P_NTYPECOMMENT: commentData.P_NTYPECOMMENT,
          P_SCOMMETS: commentData.P_SCOMMETS,
        };
        this.rentasService.updStatusTicketDetail(dataupdate).subscribe({
          next: (response) => {
            const mensajeParts: [SweetAlertIcon, string, string] =
              this.separateString(response.P_SMESSAGE);

            if (response.P_NCODE == 0) {
              Swal.fire({
                icon: mensajeParts[0],
                title: mensajeParts[1],
                text: mensajeParts[2],
              });
            } else {
              Swal.fire({
                icon: mensajeParts[0],
                title: mensajeParts[1],
                text: mensajeParts[2],
              });
            }
          },
          error: (error) => {
            console.error(error);
          },
        });
      })
      .catch((error) => {
        console.log('Modal cerrado');
      });
  }
  //FUNCION PARAR ABIR UNA URL EN OTRA PESTAÑA
  openLink(url: string): void {
    window.open(url, '_blank');
  }

  edit_fields() {
    this.edit = true;
  }
  confirm_edit_fields() {
    this.updtTicketDescript();
    this.edit = false;
  }
  cancel_edit_fields() {
    this.edit = false;
  }

  edit_fields2() {
    this.getMotivos();
    this.opcionesSubMotivos = [
      {
        codigo: 0,
        valor: '- SELECCIONE -',
      },
    ];
    this.getSubMotivos(this.ticket.NMOTIVO);
    this.edit2 = true;
  }
  confirm_edit_fields2() {
    this.updtTicketNmotiv();
  }
  cancel_edit_fields2() {
    this.edit2 = false;
  }

  edit_fields3() {
    this.edit3 = true;
  }
  confirm_edit_fields3() {
    this.edit3 = false;
  }
  cancel_edit_fields3() {
    this.edit3 = false;
  }

  async onFileSelected(event: any, P_SCODE: string) {
    const mensaje = await this.getMessage(24);
    const mensaje2 = await this.getMessage(23);
    const mensaje3 = await this.getMessage(25);
    const mensajeParts: [SweetAlertIcon, string, string] =
      this.separateString(mensaje);
    const mensajeParts2: [SweetAlertIcon, string, string] =
      this.separateString(mensaje2);
    const mensajeParts3: [SweetAlertIcon, string, string] =
      this.separateString(mensaje3);

    const fileInput = event.target;
    const allowedExtensions = this.fileFormats.split(',');
    const file: File = fileInput.files[0];

    const extension = file.name
      .substring(file.name.lastIndexOf('.') + 1)
      .toLowerCase();

    if (!allowedExtensions.includes(extension)) {
      Swal.fire({
        icon: mensajeParts[0],
        title: mensajeParts[1],
        text: `${mensajeParts[2]} ${this.getDisplayFileFormats()}.`,
      });
      fileInput.value = ''; // Limpiar el input
      return;
    }

    if (this.doc_registrados.length >= this.fileCant) {
      Swal.fire({
        icon: mensajeParts2[0],
        title: mensajeParts2[1],
        text: mensajeParts2[2] + this.fileCant,
      });
      fileInput.value = ''; // Limpiar el input
      return;
    }

    if (file) {
      const fileSizeKB = file.size / 1024;
      if (fileSizeKB > this.fileSize) {
        Swal.fire({
          icon: mensajeParts3[0],
          title: mensajeParts3[1],
          text: `${mensajeParts3[2]} ${this.fileSize} KB.`,
        });
        fileInput.value = ''; // Limpiar el input
        return;
      }

      const fileNameWithoutExtension = file.name.substring(
        0,
        file.name.lastIndexOf('.')
      );
      const extension = file.name.substring(file.name.lastIndexOf('.'));

      // Concatenar el sufijo "-ticket" antes de la extensión
      const fileNameWithSuffix = `${fileNameWithoutExtension}-${P_SCODE}${extension}`;
      const existingDocIndex = this.doc_registrados.findIndex(
        (doc) => doc.SNAME === fileNameWithSuffix
      );
      if (existingDocIndex !== -1) {
        // Si ya existe un documento con el mismo nombre, llama a la función eliminar
        this.eliminar(this.doc_registrados[existingDocIndex]);
      }

      const newDoc = {
        file: file,
        SNAME: fileNameWithSuffix,
        SSIZE: `${fileSizeKB.toFixed(2)} KB`,
        SPATH: URL.createObjectURL(file),
        isNew: true,
      };

      this.doc_registrados.push(newDoc);
    }
    fileInput.value = '';
  }

  eliminar(doc: any) {
    // Aquí va la lógica para eliminar el documento
    this.rentasService.delTickAdjunt(doc.NID);
    const index = this.doc_registrados.indexOf(doc);
    if (index !== -1) {
      this.doc_registrados.splice(index, 1);
    }
  }

  //FUNCION PARA ELIMINAR UN DOCUMENTO
  deleteFile(doc: any) {
    const index = this.doc_registrados.indexOf(doc);
    if (index > -1) {
      this.doc_registrados.splice(index, 1);
    }
  }

  //FUNCION PARA SUBIR EL DOCUMETO
  uploadFile(doc: any) {
    doc.isNew = false;
  }

  getPolicyData(ticket: any) {
    const data = {
      NTYPE_SYSTEM: ticket.NTYPE_SYSTEM,
      P_NRAMO: ticket.SRAMO,
      P_NPRODUCTO: ticket.SPRODUCT,
      P_NPOLIZA: ticket.POLIZA,
      P_NTIPO_DOC: ticket.NTIPO_DOC,
      P_NNUM_DOC: ticket.NNUM_DOC,
    };
    this.rentasService.getPolicyData(data).subscribe({
      next: (response) => {
        // mostrar la data en la seccion de Detalle de la póliza/ contrante
      },
      error: (error) => {
        console.error(error);
      },
    });
  }
  showNewBeneficiaryForm() {
    this.isAddingNew = true;
  }
  addBeneficiary() {
    const newBeneficiary = {
      NOMBRES: this.newBeneficiary.NOMBRES,
      NRO_IDENTIDAD: this.newBeneficiary.NRO_IDENTIDAD,
      PARENTESCO: this.newBeneficiary.PARENTESCO,
      PROC_PENSION: this.newBeneficiary.PROC_PENSION,
      TIPO_PAGO: this.newBeneficiary.TIPO_PAGO?.valor,
      TIPO_CUENTA: this.newBeneficiary.TIPO_CUENTA?.valor,
      BANCO_ORIGEN: this.newBeneficiary.BANCO_ORIGEN?.valor,
      CUENTA_BANCARIA: this.newBeneficiary.CUENTA_BANCARIA,
      CCI: this.newBeneficiary.CCI,
      TITULAR_CUENTA: this.newBeneficiary.TITULAR_CUENTA,
    };
    this.beneficiaries.push(newBeneficiary);
    this.isAddingNew = false;
    this.newBeneficiary.NOMBRES = '';
    this.newBeneficiary.NRO_IDENTIDAD = '';
    this.newBeneficiary.PARENTESCO = '';
    this.newBeneficiary.TIPO_PAGO = '';
    this.newBeneficiary.TIPO_CUENTA = '';
    this.newBeneficiary.BANCO_ORIGEN = '';
    this.newBeneficiary.CUENTA_BANCARIA = '';
    this.newBeneficiary.CCI = '';
    this.newBeneficiary.TITULAR_CUENTA = '';
  }

  async calcular() {
    const mensaje = await this.getMessage(0);
    const mensaje2 = await this.getMessage(35);
    const mensajeParts: [SweetAlertIcon, string, string] =
      this.separateString(mensaje);
    const mensajeParts2: [SweetAlertIcon, string, string] =
      this.separateString(mensaje2);

    const data = {
      NTYPE_SYSTEM: this.ticket.NTYPE_SYSTEM,
      P_NRAMO: this.ticket.NRAMO,
      P_NPRODUCT: this.ticket.NPRODUCT,
      P_NPOLIZA: this.ticket.POLIZA,
      P_NTIPO_DOC: this.ticket.NTIPO_DOC,
      P_NNUM_DOC: this.ticket.NNUM_DOC,
    };
    //SERVICIO QUE RETORNA EL IMPORTE Y LA MONEDA
    this.rentasService.getCalculationAmount(data).subscribe({
      next: (response) => {
        const data2 = {
          P_SCODE_JIRA: this.ticket.SCODE_JIRA,
          P_IMPORTE: response.IMPORTE,
          P_MONEDA: response.MONEDA,
        };
        //SERVICIO QUE ACTUALIZA EL IMPORTE Y LA MONEDA DEL TICKET
        this.rentasService.updAmountTicket(data2).subscribe({
          next: (response) => {
            if (response.P_NCODE == 0) {
              Swal.fire({
                icon: mensajeParts[0],
                title: mensajeParts[1],
                text: mensajeParts[2],
              });
            } else {
              Swal.fire({
                icon: mensajeParts2[0],
                title: mensajeParts2[1],
                text: mensajeParts2[2],
              });
            }
          },
          error: (error) => {
            console.error(error);
          },
        });
      },
      error: (error) => {
        console.error(error);
      },
    });
  }

  async updtTicketDescript() {
    const mensaje2 = await this.getMessage(29);
    const mensajeParts2: [SweetAlertIcon, string, string] =
      this.separateString(mensaje2);

    const data = {
      P_NTICKET: this.ticket.NTICKET,
      P_SDESCRIPT: this.ticket.DESCRIPCION,
    };

    this.rentasService.updtTicketDescript(data).subscribe({
      next: (res) => {
        const mensajeParts: [SweetAlertIcon, string, string] =
          this.separateString(res.P_SMESSAGE);

        if (res.P_NCODE == 0) {
          Swal.fire({
            icon: mensajeParts[0],
            title: mensajeParts[1],
            text: mensajeParts[2],
          });
        } else {
          Swal.fire({
            icon: mensajeParts[0],
            title: mensajeParts[1],
            text: mensajeParts[2],
          });
        }
      },
      error: (error) => {
        console.error(error);
        Swal.fire({
          icon: mensajeParts2[0],
          title: mensajeParts2[1],
          text: mensajeParts2[2],
        });
      },
    });
  }

  getMotivos() {
    //SERVICIO PARA LISTAR LOS MOTIVOS
    this.rentasService.getListMotivos().subscribe({
      next: (response) => {
        this.motivos = response.C_TABLE;

        this.opcionesMotivos = this.motivos.map((motivo) => {
          return {
            codigo: motivo.NCODE,
            valor: motivo.SDESCRIPT,
          };
        });
      },
      error: (error) => {
        console.error(error);
      },
    });
  }

  getSubMotivos(P_NMOTIVO) {
    //SERVICIO PARA LISTAR LOS SUBMOTIVOS
    this.rentasService.getListSubMotivos({ P_NMOTIVO: P_NMOTIVO }).subscribe({
      next: (response) => {
        this.submotivos = response.C_TABLE;

        this.opcionesSubMotivos = this.submotivos.map((submotivo) => {
          return {
            codigo: submotivo.NCODE,
            valor: submotivo.SDESCRIPT,
          };
        });
        this.inputs.P_SSUBMOTIVO = {};
        this.inputs.P_SSUBMOTIVO.codigo = this.ticket.NSUBMOTIVO;
      },
      error: (error) => {
        console.error(error);
      },
    });
  }

  changeMotivo(P_NMOTIVO) {
    console.log(P_NMOTIVO);
    //SERVCIO PARA LISTAR LOS SUBMOTIVOS SEGUN EL MOTIVO SELECCIONADO
    this.getSubMotivos(P_NMOTIVO.codigo);
  }

  async updtTicketNmotiv() {
    const mensaje2 = await this.getMessage(30);
    const mensajeParts2: [SweetAlertIcon, string, string] =
      this.separateString(mensaje2);

    const data = {
      P_NTICKET: this.ticket.NTICKET,
      P_NMOTIV: this.inputs.P_NMOTIVO.codigo,
      P_NSUBMOTIV: this.inputs.P_SSUBMOTIVO.codigo,
    };
    this.rentasService.updtTicketNmotiv(data).subscribe({
      next: (res) => {
        const mensajeParts: [SweetAlertIcon, string, string] =
          this.separateString(res.P_SMESSAGE);

        if (res.P_NCODE == 0) {
          Swal.fire({
            icon: mensajeParts[0],
            title: mensajeParts[1],
            text: mensajeParts[2],
          });
          this.ticket.MOTIVO = this.inputs.P_NMOTIVO.valor;
          this.ticket.SUBMOTIVO = this.inputs.P_SSUBMOTIVO.valor;
          this.edit2 = false;
        } else {
          Swal.fire({
            icon: mensajeParts[0],
            title: mensajeParts[1],
            text: mensajeParts[2],
          });
        }
      },
      error: (error) => {
        console.error(error);
        Swal.fire({
          icon: mensajeParts2[0],
          title: mensajeParts2[1],
          text: mensajeParts2[2],
        });
      },
    });
  }

  getConfFile() {
    this.rentasService.getConfFile().subscribe({
      next: (res) => {
        this.fileCant = Number(res.C_TABLE[0].FILE_CANT_TK);
        this.fileSize = Number(res.C_TABLE[0].FILE_SIZE);
        this.fileFormats = res.C_TABLE[0].FILE_FORMATS;
      },
      error: (error) => {
        console.error(error);
      },
    });
  }
  getAcceptedFileFormats(): string {
    if (!this.fileFormats) {
      return '';
    }
    return this.fileFormats
      .split(',')
      .map((ext) => `.${ext}`)
      .join(',');
  }

  getDisplayFileFormats(): string {
    if (!this.fileFormats) {
      return '';
    }

    const formats = this.fileFormats.split(',');
    if (formats.length > 1) {
      const lastFormat = formats.pop();
      return formats.join(', ') + ' y ' + lastFormat;
    } else if (formats.length === 1) {
      return formats[0];
    } else {
      return '';
    }
  }

  async getMessage(nerror: number): Promise<string> {
    const data = {
      P_NERRORNUM: nerror,
    };
    try {
      const res = await this.rentasService.getMessage(data).toPromise();
      return res.C_TABLE[0].SMESSAGE;
    } catch (error) {
      console.error(error);
      return 'Error al obtener el mensaje';
    }
  }

  separateString(input: string): [SweetAlertIcon, string, string] {
    const delimiter = '||';
    const parts = input.split(delimiter);

    if (parts.length !== 3) {
      throw new Error(
        'El código de mensaje no se ha encontrado. Por favor, contacte con el área de TI.'
      );
    }

    const validIcons: SweetAlertIcon[] = [
      'success',
      'error',
      'warning',
      'info',
      'question',
    ];
    if (!validIcons.includes(parts[0] as SweetAlertIcon)) {
      throw new Error(
        'Icono no válido. Por favor, contacte con el área de TI.'
      );
    }
    return [parts[0] as SweetAlertIcon, parts[1], parts[2]];
  }
}
