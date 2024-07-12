import { Component, OnInit, Input, AfterContentInit, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl, AbstractControl } from "@angular/forms";
import Swal from 'sweetalert2';

@Component({
  selector: 'app-search-contracting',
  templateUrl: './search-contracting.component.html',
  styleUrls: ['./search-contracting.component.css']
})
export class SearchContractingComponent implements OnInit {
  @Input() public formModalReference: any; //Referencia al modal creado desde el padre de este componente para ser cerrado desde aquí
  @Input() public EListClient: any;

  listToShow: any[] = [];

  public selectedContractor: string;
  public currentPage = 1; //página actual
  public rotate = true; //
  public maxSize = 5; // cantidad de paginas que se mostrarán en el paginado
  public itemsPerPage = 5; // limite de items por página
  public totalItems = 0; //total de items en
  searchText = "";
  codProducto = JSON.parse(localStorage.getItem("codProducto"))["productId"];

  constructor() { }

  ngOnInit() {
    this.EListClient.map(function (item) {
      let name: string = item.P_SFIRSTNAME != null ? item.P_SFIRSTNAME + " " : "";
      let lastname: string = item.P_SLASTNAME != null ? item.P_SLASTNAME + " " : "";
      let lastname2: string = item.P_SLASTNAME2 != null ? item.P_SLASTNAME2 : "";
      let legalname: string = item.P_SLEGALNAME != null ? item.P_SLEGALNAME : "";
      let nameComplete: string = "";

      if (item.P_NIDDOC_TYPE == "1") {
        nameComplete = legalname;
      } else {
        nameComplete = name + lastname + lastname2;
      }
      item.RAZON_SOCIAL = nameComplete;
    });

    this.totalItems = this.EListClient.length;

    if (this.codProducto == 3) {
      this.EListClient = this.EListClient.filter(function (obj) {
        return obj.P_NIDDOC_TYPE == "1";
      });
    }

    this.listToShow = this.EListClient.slice(((this.currentPage - 1) * this.itemsPerPage), (this.currentPage * this.itemsPerPage));
  }

  chooseContractor(selection: any) {
    if (selection == undefined) {
      Swal.fire("Información", "Ha ocurrido un error inesperado.", "error");
    } else {
      if (selection.P_SIDDOC != null) {
        this.formModalReference.close(selection);
      } else {
        Swal.fire("Información", "El contratante no cuenta con el nro de documento.", "error");
      }
    }
  }

  chooseContractorByRadioButton() {
    if (this.selectedContractor != undefined && this.selectedContractor != "") {
      this.EListClient.forEach(item => {
        let select = item.P_SIDDOC + item.P_NIDDOC_TYPE;
        if (select == this.selectedContractor) {
          this.formModalReference.close(item);
        } else {
          Swal.fire("Información", "El contratante no cuenta con el nro de documento.", "error");
        }
      });
    } else {
      Swal.fire("Información", "No ha seleccionado ningún contratante.", "error");
    }
  }
  pageChanged(currentPage) {
    this.currentPage = currentPage;
    this.listToShow = this.EListClient.slice(((this.currentPage - 1) * this.itemsPerPage), (this.currentPage * this.itemsPerPage));
    this.selectedContractor = "";
  }

  mostrarMas() {
    this.pageChanged(1);
  }

}
