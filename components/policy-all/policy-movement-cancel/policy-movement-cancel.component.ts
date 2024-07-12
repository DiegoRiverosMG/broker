import { Component, OnInit, Input } from '@angular/core';
import swal from 'sweetalert2';
import { PolicyemitService } from '../../../services/policy/policyemit.service';
@Component({
  selector: 'app-policy-movement-cancel',
  templateUrl: './policy-movement-cancel.component.html',
  styleUrls: ['./policy-movement-cancel.component.css']
})
export class PolicyMovementCancelComponent implements OnInit {

  @Input() public reference: any;
  @Input() public itemAnul: any;
  @Input() public typeMovement: any;

  isLoading: boolean = false;

  isCorrelativeGenerated: boolean = false;
  constructor(
    private policyErmitService: PolicyemitService,
  ) { }

  ngOnInit() {

  }


  onRequired(event){
    if(event.target.checked)
      this.isCorrelativeGenerated = true;
    else 
      this.isCorrelativeGenerated = false;
  }

  anularMovimiento() {
    swal.fire({
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
          this.isLoading = true;
          let data: any = {};
          data.NIDHEADERPROC = this.itemAnul.NIDHEADERPROC;
          data.SCERTYPE = this.itemAnul.SCERTYPE;
          data.NBRANCH = this.itemAnul.NBRANCH;
          data.NPRODUCT = this.itemAnul.NPRODUCT;
          data.NPOLICY = this.itemAnul.NPOLICY;
          data.NMOVEMENT = this.itemAnul.NUM_MOVIMIENTO;
          data.NTYPE_HIST = this.itemAnul.NTYPE_HIST;
          data.NUSERCODE = JSON.parse(localStorage.getItem("currentUser"))["id"];
          data.NFLAG_AN_PROC = this.isCorrelativeGenerated == true ? 1 : 0;
          this.policyErmitService.CancelMovement(data).subscribe(
            res => {
              console.log(res);
              if(res.P_NCODE == 0){
                swal.fire("Información", res.P_SMESSAGE, "success");
                this.isLoading = false;
                this.reference.close(res.P_NCODE)
                //this.getPolicyMovement(this.NBRANCH, this.NPRODUCT, this.NPOLICY);
              }
              else{
                swal.fire("Error", res.P_SMESSAGE, "error");
              }
            },
            err => {
              console.log(err);
            }
          );
        }
      });
  }
}
