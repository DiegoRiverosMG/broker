import { Component, OnInit, Input, ɵConsole } from '@angular/core';
import { NgbModal, ModalDismissReasons, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { PolicyService } from '../../../services/policy/policy.service';
import { PolicyDocumentsComponent } from '../policy-documents/policy-documents.component'
import { ActivatedRoute, Route, Router } from '@angular/router';
import { PolicyemitService } from '../../../services/policy/policyemit.service';
import Swal from 'sweetalert2'
//Compartido
import { AccessFilter } from './../../access-filter'
import { AnulMovComponent } from '../../../modal/anul-mov/anul-mov.component';
import { CommonMethods } from '../../common-methods';

@Component({
  selector: 'app-policy-movement-details',
  templateUrl: './policy-movement-details.component.html',
  styleUrls: ['./policy-movement-details.component.css']
})
export class PolicyMovementDetailsComponent implements OnInit {
  @Input() public reference: any;
  @Input() public itemTransaccionList: any;
  @Input() public cotizacionID: any;

  inputsPolicy: any = [];
  policyMovementList: any = [];
  flagAnular: boolean = false;

  listToShow: any[] = [];
  currentPage = 1; //página actual
  rotate = true; //
  maxSize = 5; // cantidad de paginas que se mostrarán en el paginado
  itemsPerPage = 5; // limite de items por página
  totalItems = 0; //total de items encontrados

  adjuntosList: any = [];
  generadosList: any = [];
  canCancelMovements: boolean;
  template: any = {}
  //epsItem = JSON.parse(sessionStorage.getItem("eps"))
  epsItem = JSON.parse(localStorage.getItem("eps"))
  codProducto = JSON.parse(localStorage.getItem("codProducto"))["productId"];

  constructor(
    private modalService: NgbModal,
    private router: Router,
    private policyemit: PolicyemitService
  ) { }

  async ngOnInit() {
    // Configuracion del Template
    this.template = await CommonMethods.configuracionTemplate(this.codProducto, this.epsItem.NCODE)

    this.itemTransaccionList.forEach(item => {
      if (item.NRO_COTIZACION == this.cotizacionID) {
        this.inputsPolicy.P_PRODUCTO = item.NOMBRE_PRODUCT;
        this.inputsPolicy.P_POLIZA = item.POLIZA;
        this.inputsPolicy.P_CONTRATANTE = item.NOMBRE_CONTRATANTE;
        this.inputsPolicy.P_SEDE = item.SEDE;
      }
    });

    this.getPolicyMovement(this.cotizacionID);
  }
  getPolicyMovement(cotizacionID: any) {
    let data: any = {};
    data.P_NID_COTIZACION = cotizacionID;
    this.policyemit.getPolicyMovementsTransList(data).subscribe(
      res => {
        this.policyMovementList = res.C_TABLE;
        let num = 0;
        this.totalItems = this.policyMovementList.length;
        this.listToShow = this.policyMovementList.slice(((this.currentPage - 1) * this.itemsPerPage), (this.currentPage * this.itemsPerPage));

        this.canCancelMovements = AccessFilter.hasPermission("20");

        this.policyMovementList.forEach(item => {
          if (item.COD_TRANSAC == 7) {
            this.flagAnular = true;
          }
          if (item.MOV_ANULADO == 0) {
            num++;
          }
        });

        if (num == 0) {
          this.flagAnular = true;
        }
      },
      err => {
      }
    );
  }

  pageChanged(currentPage) {
    this.currentPage = currentPage;
    this.listToShow = this.policyMovementList.slice(((this.currentPage - 1) * this.itemsPerPage), (this.currentPage * this.itemsPerPage));
  }

  facturarMov(item: any, typeMovement: any) {
    let facturacion: any = {};
    facturacion.P_NID_COTIZACION = this.cotizacionID // nro cotizacion
    facturacion.P_NMOVEMENT = item.NRO // nro cotizacion

    this.policyemit.valBilling(facturacion).subscribe(
      res => {
        if (res.P_NCODE == 0) {
          this.transMov(item, typeMovement, res.P_SMESSAGE);
        } else {
          Swal.fire({
            title: "Información",
            text: res.P_SMESSAGE,
            icon: "info",
            confirmButtonText: 'OK',
            allowOutsideClick: false,
          })
        }
      },
      err => {
        console.log(err);
      }
    );

  }

  transMov(item: any, typeMovement: any, message?: any) {
    let question = "";
    let btnMov = "";
    let response = ""
    question = message
    btnMov = "Facturar"
    response = "Se ha facturado correctamente el movimiento"

    let myFormData: FormData = new FormData()
    let renovacion: any = {};
    renovacion.P_NID_COTIZACION = this.cotizacionID // nro cotizacion
    renovacion.P_DEFFECDATE = null; //Fecha Inicio
    renovacion.P_DEXPIRDAT = null; // Fecha Fin
    renovacion.P_NUSERCODE = JSON.parse(localStorage.getItem("currentUser"))["id"] // Fecha hasta
    renovacion.P_NTYPE_TRANSAC = typeMovement; // tipo de movimiento
    renovacion.P_NID_PROC = "" // codigo de proceso (Validar trama)
    renovacion.P_FACT_MES_VENCIDO = null // Facturacion Vencida
    renovacion.P_SFLAG_FAC_ANT = null // Facturacion Anticipada
    renovacion.P_SCOLTIMRE = null // Tipo de renovacion
    renovacion.P_NPAYFREQ = null // Frecuencia Pago
    renovacion.P_NMOV_ANUL = item.NRO // Movimiento de anulacion
    renovacion.P_NNULLCODE = 0 // Motivo anulacion
    renovacion.P_SCOMMENT = "" // Frecuencia Pago

    myFormData.append("transaccionProtecta", JSON.stringify(renovacion));

    Swal.fire({
      title: "Información",
      text: question,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: btnMov,
      allowOutsideClick: false,
      cancelButtonText: 'Cancelar'
    })
      .then((result) => {
        if (result.value) {
          this.policyemit.transactionPolicy(myFormData).subscribe(
            res => {
              if (res.P_COD_ERR == 0) {
                this.getPolicyMovement(this.cotizacionID);
                Swal.fire({
                  title: "Información",
                  text: response,
                  icon: "success",
                  confirmButtonText: 'OK',
                  allowOutsideClick: false,
                }).then((result) => {
                  if (result.value) {
                    if(this.codProducto == 2){
                      this.router.navigate(['/extranet/sctr/consulta-polizas']);
                    }else{
                      this.router.navigate(['/extranet/policy-transactions']);
                    }
                  }
                });
              } else {
                Swal.fire({
                  title: "Información",
                  text: res.P_MESSAGE,
                  icon: "error",
                  confirmButtonText: 'OK',
                  allowOutsideClick: false,
                })
              }
            },
            err => {
              console.log(err);
            }
          );
        }
      });
  }

  anularMov(item: any, typeMovement: any) {
    let modalRef: NgbModalRef;
    modalRef = this.modalService.open(AnulMovComponent, { size: 'lg', backdropClass: 'light-blue-backdrop', backdrop: 'static', keyboard: false });
    modalRef.componentInstance.reference = modalRef;
    modalRef.componentInstance.itemAnul = item;
    modalRef.componentInstance.typeMovement = typeMovement;
    modalRef.componentInstance.cotizacionID = this.cotizacionID;

    modalRef.result.then((renovacion) => {
      if (renovacion != undefined) {
        this.reference.close(this.cotizacionID)
        //this.getPolicyMovement(this.cotizacionID);
        if(this.codProducto == 2){
          this.router.navigate(['/extranet/sctr/consulta-polizas']);
        }else{
          this.router.navigate(['/extranet/policy-transactions']);
        }
      }
    }, (reason) => {
    });
  }

  verDocumentos(item: any) {
    let modalRef: NgbModalRef;
    modalRef = this.modalService.open(PolicyDocumentsComponent, { size: 'lg', backdropClass: 'light-blue-backdrop', backdrop: 'static', keyboard: false });
    modalRef.componentInstance.reference = modalRef;
    modalRef.componentInstance.adjuntosList = item.RUTAS;
    modalRef.componentInstance.generadosList = item.RUTAS_GEN;
    modalRef.componentInstance.comentario = item.COMENTARIO;
    modalRef.componentInstance.motAnulacion = item.MOT_ANULACION;
    modalRef.componentInstance.codTransac = item.COD_TRANSAC;
  }

}
