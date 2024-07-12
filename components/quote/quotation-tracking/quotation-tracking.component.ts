import { Component, OnInit, Input } from '@angular/core';
//MODELOS
import { QuotationTracking } from '../../../models/quotation/response/quotation-tracking';
import { QuotationTrackingSearch } from '../../../models/quotation/request/quotation-tracking-search';
//SERVICIOS
import { QuotationService } from '../../../services/quotation/quotation.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-quotation-tracking',
  templateUrl: './quotation-tracking.component.html',
  styleUrls: ['./quotation-tracking.component.css']
})
export class QuotationTrackingComponent implements OnInit {
  @Input() public formModalReference: any; //Referencia al modal creado desde el padre de este componente 'contractor-location-index' para ser cerrado desde aquí
  @Input() public quotationNumber: string;

  isLoading: Boolean = false;
  /*Variables de paginacion */
  currentPage = 1; //página actual
  rotate = true; //
  maxSize = 5; // cantidad de paginas que se mostrarán en el paginado
  itemsPerPage = 5; // limite de items por página
  totalItems = 0; //total de items encontrados
  foundResults: any = [];
  listToShow: any = [];

  data = new QuotationTrackingSearch();

  constructor(private quotationService: QuotationService) { }

  ngOnInit() {
    this.data.QuotationNumber = this.quotationNumber;
    this.data.PageNumber = 1;
    this.data.LimitPerPage = 5;

    this.firstSearch();
  }
  firstSearch() {
    this.data.PageNumber = 1;
    this.searchTracking();
  }
  pageChanged(currentPage) {
    this.currentPage = currentPage;
    this.listToShow = this.foundResults.slice(((this.currentPage - 1) * this.itemsPerPage), (this.currentPage * this.itemsPerPage));
  }
  searchTracking() {
    let self = this;
    this.quotationService.getTrackingList(this.data).subscribe(
      res => {
        this.isLoading = false;
        let num = 1;
        this.foundResults = res.GenericResponse;
        this.foundResults.forEach(item => {
          item.rowNum = num++;
        });
        this.listToShow = this.foundResults.slice(((this.currentPage - 1) * this.itemsPerPage), (this.currentPage * this.itemsPerPage));
        this.totalItems = this.foundResults.length;

        if (this.foundResults.length == 0) {
          this.foundResults = [];
        }
      },
      err => {
        console.log(err);
        Swal.fire("Información", "Error insperado, contáctese con soporte.", "error");
      }
    );
  }

  listToString(inputList: String[]): string {
    let output = "";
    inputList.forEach(function (item) {
      output = output + item + " <br>"
    });
    return output;
  }
}
