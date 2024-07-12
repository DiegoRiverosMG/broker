import { Component, OnInit } from '@angular/core';
import { NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { ParameterSettingsService } from '@root/layout/broker/services/maintenance/parameter-settings.service';

@Component({
  selector: 'app-historial-porcentaje-rmv',
  templateUrl: './historial-porcentaje-rmv.component.html',
  styleUrls: ['./historial-porcentaje-rmv.component.css']
})
export class HistorialPorcentajeRmvComponent implements OnInit {

  reference: NgbModalRef;
  data: any = {};
  retroactivityList: any[] = []
  currentPage = 1; //página actual
  rotate = true; //
  maxSize = 5; // cantidad de paginas que se mostrarán en el paginado
  itemsPerPage = 5; // limite de items por página
  totalItems = 0; //total de items encontrados
  //public foundResults: any = [];  //Lista de registros encontrados durante la búsqueda
  filter: any = {}; //Objeto con datos de búsqueda que se llena en la primera búsqueda y que quedará en memoria para los cambios de página, el atributo PageNumber (Nro de página) está enlazado con el elemento de paginado del HTML y se actualiza automaticamente

  listToShow: any;

  constructor(private parameterSettingsService: ParameterSettingsService) { }

  ngOnInit(): void {
    this.getHistorial();
  }

  closeModal(json?: any) {
    this.reference.close(json);
  }

  getHistorial() {

    this.parameterSettingsService.GetHistorialPorcentajeRMV(this.data).subscribe(res => {
      this.retroactivityList = res
      if (this.retroactivityList != null && this.retroactivityList.length > 0) {
        this.totalItems = this.retroactivityList.length;
        this.listToShow = this.retroactivityList.slice(((this.currentPage - 1) * this.itemsPerPage), (this.currentPage * this.itemsPerPage));
      }
      else {
        this.totalItems = 0;
      }
    }, err => { console.log(err) })
  }

  pageChanged(page: number) {
    this.currentPage = page;
    this.listToShow = this.retroactivityList.slice(((this.currentPage - 1) * this.itemsPerPage), (this.currentPage * this.itemsPerPage));
  }

  mostrarMas() {
    this.currentPage = 1;
    this.listToShow = this.retroactivityList.slice(((this.currentPage - 1) * this.itemsPerPage), (this.currentPage * this.itemsPerPage));
  }

}