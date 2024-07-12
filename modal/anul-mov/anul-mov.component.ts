import { Component, OnInit, Input } from '@angular/core';
import Swal from 'sweetalert2';
import { PolicyemitService } from '../../services/policy/policyemit.service';

@Component({
  selector: 'app-anul-mov',
  templateUrl: './anul-mov.component.html',
  styleUrls: ['./anul-mov.component.css']
})
export class AnulMovComponent implements OnInit {

  @Input() public reference: any;
  @Input() public itemAnul: any;
  @Input() public typeMovement: any;
  @Input() public cotizacionID: any;

  comentarioAnu = "";

  constructor(
    private policyemit: PolicyemitService

  ) { }

  ngOnInit() {
  }

  anularMovimiento() {
    if (this.comentarioAnu.trim() == "") {
      Swal.fire({
        title: "Información",
        text: "Debe ingresar un motivo de anulación",
        icon: "error",
        allowOutsideClick: false,
        confirmButtonText: 'OK'
      })
      return;
    }

    let myFormData: FormData = new FormData()
    let renovacion: any = {};
    renovacion.P_NID_COTIZACION = this.cotizacionID // nro cotizacion
    renovacion.P_DEFFECDATE = null; //Fecha Inicio
    renovacion.P_DEXPIRDAT = null; // Fecha Fin
    renovacion.P_NUSERCODE = JSON.parse(localStorage.getItem("currentUser"))["id"] // Fecha hasta
    renovacion.P_NTYPE_TRANSAC = this.typeMovement; // tipo de movimiento
    renovacion.P_NID_PROC = "" // codigo de proceso (Validar trama)
    renovacion.P_FACT_MES_VENCIDO = null // Facturacion Vencida
    renovacion.P_SFLAG_FAC_ANT = null // Facturacion Anticipada
    renovacion.P_SCOLTIMRE = null // Tipo de renovacion
    renovacion.P_NPAYFREQ = null // Frecuencia Pago
    renovacion.P_NMOV_ANUL = this.itemAnul.NRO // Movimiento de anulacion
    renovacion.P_NNULLCODE = 0 // Motivo anulacion
    renovacion.P_SCOMMENT = this.comentarioAnu == "" ? "" : this.comentarioAnu.toUpperCase() // Frecuencia Pago
    renovacion.P_NMOVEMENT_PH = this.itemAnul.NMOVEMENT_PH;
    renovacion.P_NCOT_MIXTA = this.itemAnul.NCOT_MIXTA; //AVS - INTERCONEXION SABSA
    renovacion.P_NPRODUCTO = this.itemAnul.NPRODUCT; //AVS - INTERCONEXION SABSA
    renovacion.P_NPOLICY_SALUD = this.itemAnul.NPOLICY_SALUD; //AVS - INTERCONEXION SABSA
    renovacion.P_NID_PROC = this.itemAnul.NID_PROC; //AVS - INTERCONEXION SABSA
    renovacion.P_NEPS = this.itemAnul.NCOMPANY_LNK; //AVS - INTERCONEXION SABSA
    myFormData.append("transaccionProtecta", JSON.stringify(renovacion));

    Swal.fire({
      title: "Información",
      text: "¿Deseas anular este movimiento?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Anular",
      allowOutsideClick: false,
      cancelButtonText: 'Cancelar'
    })
      .then((result) => {
        if (result.value) {
          this.policyemit.transactionPolicy(myFormData).subscribe(
            res => {
              if (res.P_COD_ERR == 0) {
                Swal.fire({
                  title: "Información",
                  text: "Se ha anulado correctamente el movimiento",
                  icon: "success",
                  confirmButtonText: 'OK',
                  allowOutsideClick: false,
                }).then((result) => {
                  this.ReverHISDETSCTR();
                    this.reference.close(this.cotizacionID)
                //   if (result.value) {
                //     this.reference.close(this.cotizacionID)
                //   }
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
            }
          );
        }
      });

  }

  async ReverHISDETSCTR(P_NID_COTIZACION?:any, P_NMOVEMENT_PH?:any, P_NID_PROC?:any) {
    await this.policyemit.ReverHISDETSCTR(P_NID_COTIZACION=this.cotizacionID, P_NMOVEMENT_PH=this.itemAnul.NMOVEMENT_PH, P_NID_PROC=this.itemAnul.NID_PROC).subscribe();
  }

}
