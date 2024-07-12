import { Component, OnInit, Input  } from '@angular/core';

//SERVICIOS
import { QuotationService } from '../../../services/quotation/quotation.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-quotation-cover',
  templateUrl: './quotation-cover.component.html',
  styleUrls: ['./quotation-cover.component.css']
})

export class QuotationCoverComponent implements OnInit {
  @Input() public formModalReference: any; //Referencia al modal creado desde el padre de este componente 'contractor-location-index' para ser cerrado desde aquí
  @Input() public quotationNumber: string;

  isLoading: Boolean = false;
  foundResults: any = [];
  listToShow: any = [];

  constructor(private quotationService: QuotationService) { }

  QuotationNumber = '';

  ngOnInit() {
    this.QuotationNumber = this.quotationNumber;


    this.searchCovers();
  }

  searchCovers() {
    let self = this;
    this.quotationService.getQuotationCoverByNumQuotation(this.QuotationNumber).subscribe(
      res => {
        this.isLoading = false;
        console.log(res);

        this.foundResults = res;
        this.listToShow = this.foundResults;
      },
      err => {
        console.log(err);
        Swal.fire("Información", "Error insperado, contáctese con soporte.", "error");
      }
    )
  }
}
