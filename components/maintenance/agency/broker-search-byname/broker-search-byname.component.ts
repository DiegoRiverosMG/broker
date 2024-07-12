import { Component, OnInit, Input, AfterContentInit } from '@angular/core';
import { FormGroup, FormBuilder, FormControl, Validators, AbstractControl } from '@angular/forms';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-broker-search-byname',
  templateUrl: './broker-search-byname.component.html',
  styleUrls: ['./broker-search-byname.component.css']
})
export class BrokerSearchBynameComponent implements OnInit {
  @Input() public formModalReference: any; //Referencia al modal creado desde el padre de este componente para ser cerrado desde aquí
  @Input() public foundResults: any[]; //
  listToShow: any[] = [];
  isLoading: boolean = false;
  searchText = "";
  public selectedBroker: string;
  public currentPage = 1; //página actual
  public rotate = true; //
  public maxSize = 5; // cantidad de paginas que se mostrarán en el paginado
  public itemsPerPage = 5; // limite de items por página
  public totalItems = 0; //total de items en

  constructor() { }

  ngOnInit() {
    this.isLoading = true;
    this.totalItems = this.foundResults.length;
    this.listToShow = this.foundResults.slice(((this.currentPage - 1) * this.itemsPerPage), (this.currentPage * this.itemsPerPage));
    this.isLoading = false;
  }

  chooseBroker(selection: any) {
    if (selection === undefined) {
      Swal.fire("Información", "Ha ocurrido un error inesperado.", "error");
    } else {
      this.formModalReference.close(selection);
    }
  }
  chooseBrokerByRadioButton(selection: any) {
    if (selection != undefined && selection != "") {
      this.foundResults.forEach(item => {
        if (item.NNUMDOC == selection) {
          this.formModalReference.close(item);
        }
      });
    } else {
      Swal.fire("Información", "No ha seleccionado ningún broker.", "error");
    }

  }
  pageChanged(currentPage) {
    this.currentPage = currentPage;
    this.listToShow = this.foundResults.slice(((this.currentPage - 1) * this.itemsPerPage), (this.currentPage * this.itemsPerPage));

  }

  mostrarMas() {
    this.pageChanged(1);
  }
}
