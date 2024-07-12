import { Component, OnInit } from '@angular/core';
import { BsDatepickerConfig } from 'ngx-bootstrap/datepicker';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { CurrentlyInsuredService } from '../../../services/currentlyinsured/currently-insured.service';
import Swal from 'sweetalert2';
import swal from 'sweetalert2';

@Component({
  selector: 'app-currently-insured',
  templateUrl: './currently-insured.component.html',
  styleUrls: ['./currently-insured.component.css'],
})
export class CurrentlyInsuredComponent implements OnInit {
  listToShow: any = [];
  processHeaderList: any = [];

  //Obtenemos los id de los controles
  IdPolicy: any = '';
  NameMessage: any = '';

  //Fechas
  bsValueIni: Date = new Date();
  bsValueFinMax: Date = new Date();

  //Paginación
  currentPage = 1; // página actual
  rotate = true;
  maxSize = 10; // cantidad de paginas que se mostrarán en el paginado
  itemsPerPage = 6; // limite de items por página
  totalItems: any = []; // total de items encontrados

  //Pantalla de carga
  isLoading: boolean = false;
  bsConfig: Partial<BsDatepickerConfig>;

  constructor(
    private modaService: NgbModal,
    private CurrentlyInsuredService: CurrentlyInsuredService
  ) {
    this.bsConfig = Object.assign(
      {},
      {
        dateInputFormat: 'DD/MM/YYYY',
        locale: 'es',
        showWeekNumbers: false,
      }
    );
  }

  ngOnInit() {}

  //Reporte de la búsqueda para Excel
  convertListToExcel() {
    if (this.processHeaderList != null && this.processHeaderList.length > 0) {
      this.isLoading = true;
      this.CurrentlyInsuredService.ConvertListToExcel(
        this.processHeaderList,
        'Reportes'
      );
    } else {
      Swal.fire('Información', 'No hay registros para exportar.', 'info');
    }
    this.isLoading = false;
  }

  //Reporte de la búsqueda para PDF
  convertListToPrintPDF() {
    if (this.processHeaderList != null && this.processHeaderList.length > 0) {
      this.isLoading = true;
      this.CurrentlyInsuredService.ConvertListToPrintPDF(
        this.processHeaderList
      );
    } else {
      Swal.fire('Información', 'No hay registros para exportar.', 'info');
    }
    this.isLoading = false;
  }

  //Mostrar Asegurados por proforma
  GetProcess() {
    this.isLoading = true;
    if (this.IdPolicy.length == 0) {
      if (this.IdPolicy.length == 0) {
        this.NameMessage = 'Debe ingresar obligatoriamente la póliza';
      }
      swal
        .fire({
          title: 'Información',
          text: this.NameMessage,
          icon: 'info',
          confirmButtonText: 'Continuar',
          allowOutsideClick: false,
        })
        .then((result) => {
          if (result.value) {
          }
          this.isLoading = false;
        });

      (err) => {
        this.isLoading = false;
      };
    } else {
      this.listToShow = [];
      this.processHeaderList = [];
      this.isLoading = true;
      this.currentPage = 1; // página actual
      this.rotate = true; //
      this.maxSize = 5; // cantidad de paginas que se mostrarán en el paginado
      this.itemsPerPage = 5; // limite de items por página
      this.totalItems = 0; // total de items encontrados
      let _data: any = {};
      _data.vigDate =
        this.bsValueIni.getDate().toString().padStart(2, '0') +
        '/' +
        (this.bsValueIni.getMonth() + 1).toString().padStart(2, '0') +
        '/' +
        this.bsValueIni.getFullYear();
      _data.policy = this.IdPolicy === '' ? 0 : this.IdPolicy;

      this.CurrentlyInsuredService.GetCurrentlyInsured(_data).subscribe(
        //Response del Back
        (res) => {
          if (res.P_NCODE == '0') {
            this.processHeaderList = res.listCurrentInsu;
            this.totalItems = this.processHeaderList.length;
            if (this.processHeaderList.length != 0) {
              this.listToShow = this.processHeaderList.slice(
                (this.currentPage - 1) * this.itemsPerPage,
                this.currentPage * this.itemsPerPage
              );
            } else {
              swal.fire('Información', 'No se encontraron registros', 'error');
            }
            this.isLoading = false;
          } else {
            swal.fire({
              title: 'Información',
              text: res.P_SMESSAGE,
              icon: 'warning',
              confirmButtonText: 'Continuar',
              allowOutsideClick: false,
            });
          }
          this.isLoading = false;
        }
      );

      (err) => {
        this.isLoading = false;
      };
    }
    this.isLoading = false;
  }
  //Cambio de página
  pageChanged(currentPage) {
    this.currentPage = currentPage;
    this.listToShow = this.processHeaderList.slice(
      (this.currentPage - 1) * this.itemsPerPage,
      this.currentPage * this.itemsPerPage
    );
  }
}
