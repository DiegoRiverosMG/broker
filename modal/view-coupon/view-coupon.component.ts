import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { QuotationService } from '../../services/quotation/quotation.service';
// GCAA INICIO 06022024
@Component({
  selector: 'app-view-coupon',
  templateUrl: './view-coupon.component.html',
  styleUrls: ['./view-coupon.component.scss']
})
export class ViewCouponComponent implements OnInit {
 @Input() public formModalReference: any; 
 @Output() enviarDatos = new EventEmitter<string>();

 @Input() public nid_proc: string;
 modalRef: BsModalRef;
 flagErrors = 0;
 flagConfirm = 0;
 CuponesList: any = [];

  constructor(
    private quotationService: QuotationService,
  ) { }

  ngOnInit(): void {
    if (this.nid_proc != null){
        this.flagErrors = 0;
    }else{
        this.flagErrors = 1;
    }

    this.getCuponesExclusion();
  }

    getCuponesExclusion() {    
    
    console.log("5555555555555555");
    console.log(this.nid_proc);
    console.log("55555555555555555");
    this.quotationService.getCuponesExclusion(this.nid_proc).toPromise().then(
        res => {
            res.forEach(element => {
                    this.CuponesList.push(element);
            });
        }
    );

    return this.CuponesList;

    }
    // GCAA 13022024
    OpcionAceptar(){
        this.formModalReference.close('1');
    }

    // GCAA 13022024
    OpcionCancelar(){
        this.formModalReference.close('0');
    }
    
}


