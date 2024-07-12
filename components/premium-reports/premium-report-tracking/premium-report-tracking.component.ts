import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { NgbModal, ModalDismissReasons, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { BsDatepickerConfig } from 'ngx-bootstrap/datepicker';
import swal from 'sweetalert2';
import * as FileSaver from 'file-saver';
import { PremiumReportService } from '../../../services/premiumReports/premium-report.service';
import { Subject } from 'rxjs/Subject';
import Swal from 'sweetalert2';


@Component({
  selector: 'app-premium-report-tracking',
  templateUrl: './premium-report-tracking.component.html',
  styleUrls: ['./premium-report-tracking.component.css']
})
export class PremiumReportTrackingComponent implements OnInit {

  listToShow: any = [];
  processHeaderList: any = [];
  //Llenamos los combos
  ListBranch: any = [];
  ListProduct: any = [];
  ListState: any = [];
  //Listamos la data que llenaremos
  IdBranch: any = '';
  IdProduct: any = '';
  IdState: any = '';
  PTipo: any = '';

  //Paginación
  currentPage = 1; // página actual
  rotate = true;
  maxSize = 10; // cantidad de paginas que se mostrarán en el paginado
  itemsPerPage = 6; // limite de items por página
  totalItems: any = []; // total de items encontrados
  //Pantalla de carga
  isLoading: boolean = false;
  bsConfig: Partial<BsDatepickerConfig>;
  //Fechas
  bsValueIni: Date = new Date();
  bsValueFin: Date = new Date();
  bsValueFinMax: Date = new Date();
  UnselectedItemMessage: any = '';
  IdReport: any = '';
  SearchType: any = '';
  SearchActivated = false;
  BranchOff = false;
  StateOff = false;
  StartDateOff = false;
  EndDateOff = false;
  IdReportOff = false;
  NameMessage: any = '';
  BranchName: any = '';

  //Formato de la fecha
  constructor(private modalService: NgbModal, private PremiumReportService: PremiumReportService) {
    this.bsConfig = Object.assign(
      {},
      {
        dateInputFormat: "DD/MM/YYYY",
        locale: "es",
        showWeekNumbers: false
      }
    );
  }

  //Funciones que se ejecutarán tras la compilación
  ngOnInit() {
    this.PTipo = 'M';
    this.getBranchesPremiumReport(this.PTipo);
    this.getStatusPremiumReport();
    this.IdBranch = "-1"
    this.IdProduct = "-1"
    this.IdState = "-1"
    this.ListProduct = "-1";
    this.BranchOff = false;
    this.StateOff = false;
    this.StartDateOff = false;
    this.EndDateOff = false;
    this.IdReportOff = true;
    this.SearchActivated = false;
    this.bsValueIni = new Date(this.bsValueIni.getFullYear(), this.bsValueIni.getMonth(), 1);
  }
  //Método para obtener los ramos
  getBranchesPremiumReport(data: any) {
    this.PremiumReportService.GetBranchesPremiumReport(data).subscribe(
      res => {
        this.ListBranch = res;
      },
      err => {

      }
    );
  }
  //Función para obtener los estados
  getStatusPremiumReport() {
    this.PremiumReportService.GetStatusPremiumReport().subscribe(
      res => {
        this.ListState = res;
      },
      err => {

      }
    );
  }

  //Checkbox para habilitar y deshabilitar controles
  setControlsForProcess(event) {
    if (event.target.checked) {
      this.SearchActivated = true;
    }
    else {
      this.SearchActivated = false;
    }
    if (this.SearchActivated == true) {

      this.IdReportOff = false;
      this.BranchOff = true;
      this.StateOff = true;
      this.StartDateOff = true;
      this.EndDateOff = true;

    }
    else {
      this.SearchActivated = false;
      this.IdReportOff = true;
      this.BranchOff = false;
      this.StateOff = false;
      this.StartDateOff = false;
      this.EndDateOff = false;
    }
  }
  //Reporte de la búsqueda para Excel
  convertListToExcel() {
    if (this.processHeaderList != null && this.processHeaderList.length > 0) {
      this.isLoading = true;
      this.PremiumReportService.ConvertListToExcel(this.processHeaderList, "Reportes");
    }
    else {
      Swal.fire("Información", "No hay registros para exportar.", "info")
    }
    this.isLoading = false;

  }

  //Reporte de la búsqueda para PDF
  convertListToPrintPDF() {
    if (this.processHeaderList != null && this.processHeaderList.length > 0) {
      this.isLoading = true;
      this.PremiumReportService.ConvertListToPrintPDF(this.processHeaderList);
    }
    else {
      Swal.fire("Información", "No hay registros para exportar.", "info")
    }
    this.isLoading = false;
  }
  //Función que ejecuta el botón Visualizar
  GetProcess() {

    if (new Date(this.bsValueIni) > new Date(this.bsValueFin) && this.IdReportOff == true) {
      //Validacion Fechas
      if (new Date(this.bsValueIni) > new Date(this.bsValueFin)) {
        this.NameMessage = "La fecha inicial no debe ser mayor a la fecha final";
      }
      swal.fire({
        title: 'Información',
        text: this.NameMessage,
        icon: 'info',
        confirmButtonText: 'Continuar',
        allowOutsideClick: false

      }).then((result) => {
        if (result.value) {
        }
      });
      this.isLoading = false;
      err => {
        this.isLoading = false;
      }
    }

    //Valida Textbox
    else if (this.SearchActivated == true && this.IdReport.length == 0) {
      if (this.IdReport.length == 0) {
        this.NameMessage = "Debe ingresar obligatoriamente el ID del reporte";
      }
      swal.fire({
        title: 'Información',
        text: this.NameMessage,
        icon: 'info',
        confirmButtonText: 'Continuar',
        allowOutsideClick: false

      }).then((result) => {
        if (result.value) {

        }
      });
      this.isLoading = false;
      err => {
        this.isLoading = false;

      }
    }

    else {

      if (this.SearchActivated == true) {
        this.SearchType = "1";
        this.isLoading = true;
      }
      else if (this.SearchActivated == false) {
        this.SearchType = "0";
        this.isLoading = true;
      }



      this.listToShow = [];
      this.processHeaderList = [];
      this.currentPage = 1; // página actual
      this.rotate = true; //
      this.maxSize = 5; // cantidad de paginas que se mostrarán en el paginado
      this.itemsPerPage = 6; // limite de items por página
      this.totalItems = 0; // total de items encontrados


      let _data: any = {};
      //Parámetros de Entrada
      _data.fecInicio = this.bsValueIni.getDate().toString().padStart(2, '0') + "/" + (this.bsValueIni.getMonth() + 1).toString().padStart(2, '0') + "/" + this.bsValueIni.getFullYear()
      _data.fecFin = this.bsValueFin.getDate().toString().padStart(2, '0') + "/" + (this.bsValueFin.getMonth() + 1).toString().padStart(2, '0') + "/" + this.bsValueFin.getFullYear()
      _data.codUsuario = JSON.parse(localStorage.getItem("currentUser"))["id"];
      _data.codProducto = this.IdProduct === '' ? 0 : this.IdProduct;
      _data.codEstado = this.IdState === '' ? 0 : this.IdState;
      _data.codRamo = this.IdBranch === '' ? 0 : this.IdBranch;
      _data.codReporte = this.IdReport === '' ? 0 : this.IdReport;
      _data.codTipoBus = this.SearchType === '' ? 0 : this.SearchType;

      this.PremiumReportService.GetListReports(_data).subscribe(
        //Response del Back
        res => {
          this.processHeaderList = res;
          this.totalItems = this.processHeaderList.length;
          if (this.processHeaderList.length != 0) {
            this.listToShow = this.processHeaderList.
              slice(((this.currentPage - 1) * this.itemsPerPage), (this.currentPage * this.itemsPerPage))
          }
          else {
            swal.fire({
              title: 'Información',
              text: 'No se encontraron registros con los parámetros ingresados.',
              icon: 'error',
              confirmButtonText: 'Aceptar',
              allowOutsideClick: false
            })
          }
          this.isLoading = false;
        });

      this.isLoading = false;
      err => {
        this.isLoading = false;
      }
    }
  }
  //Función para descargar archivo
  getFilePremiumReport(id: any) {
    if (id != null && id != 0) {
      this.isLoading = true;
      this.PremiumReportService.GetFilePremiumReport(id.trim()).subscribe(
        //Respuesta del servicio
        res => {
          let _data = res;
          if (_data.response == 0) {
            if (_data.Data != null) {
              const file = new File([this.obtenerBlobFromBase64(_data.Data, '')],
                id.toLowerCase() + '-CABECERA' + '.xlsx', { type: 'text/xls' });
              FileSaver.saveAs(file);
            }
            if (_data.Data2 != null) {
              const file2 = new File([this.obtenerBlobFromBase64(_data.Data2, '')],
                id.toLowerCase() + '-DETALLE' + '.xlsx', { type: 'text/xls' });
              FileSaver.saveAs(file2);
            }
          }
          else {
            swal.fire({
              title: 'Información',
              text: 'El reporte no se encuentra disponible en este momento.',
              icon: 'error',
              confirmButtonText: 'Continuar',
              allowOutsideClick: false
            })
          }
          this.isLoading = false;
        },
        err => {
          this.isLoading = false;
        }
      );
    }
  }
  //Decodifica el archivo de base64 a String en nuestro caso a Excel
  obtenerBlobFromBase64(b64Data: string, contentType: string) {
    const byteCharacters = atob(b64Data);
    const byteArrays = [];
    for (let offset = 0; offset < byteCharacters.length; offset += 512) {
      const slice = byteCharacters.slice(offset, offset + 512);
      const byteNumbers = new Array(slice.length);
      for (let i = 0; i < slice.length; i++) {
        byteNumbers[i] = slice.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      byteArrays.push(byteArray);
    }
    const blob = new Blob(byteArrays, { type: contentType });
    return blob;
  }

  //Cambio de página
  pageChanged(currentPage) {
    this.currentPage = currentPage;
    this.listToShow = this.processHeaderList.slice(((this.currentPage - 1) * this.itemsPerPage), (this.currentPage * this.itemsPerPage));
  }
}

