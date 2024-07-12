import { Component, OnInit } from '@angular/core';
import swal from 'sweetalert2';
import { AtpReportService } from '../../../services/atp-reports/atp-report.service';
import { ExcelService } from '../../../services/shared/excel.service';

@Component({
  selector: 'app-atp-claim-report',
  templateUrl: './atp-claim-report.component.html',
  styleUrls: ['./atp-claim-report.component.css']
})
export class AtpClaimReportComponent implements OnInit {

  //CheckBox
  UnselectedItemMessage: any = '';
  nPolicy : any;
  sDocument : string;
  sNombre : string;


  isError: boolean = false;

  //Pantalla de carga
  isLoading: boolean = false;

  public totalItems = 0; //total de items encontrados
  public foundResults: any = [];  //Lista de registros encontrados durante la búsqueda

  warningMessage = '';
  genericErrorMessage = 'Ha ocurrido un error inesperado. Por favor contáctese con soporte.'; //Mensaje de error genérico
  notfoundMessage: string = 'No se encontraron registros';

  //Formato de la fecha
  constructor(
    private atpReportService: AtpReportService,
    private excelService: ExcelService

  ) {
    this.sDocument = "";
    this.sNombre = "";
  }

  //Funciones que se ejecutarán tras la compilación
  ngOnInit() {
  }

  //Función para procesar los reportes
  processReports() {
    this.isError = false;
    /*
    this.warningMessage = "¿Está seguro que desea generar el reporte con los siguientes filtros: ";

    if (this.sDocument != "") {
      this.warningMessage =  this.warningMessage + " N° Documento = " + this.sDocument;
    } 
    if (this.sNombre != ""){
      this.warningMessage =  this.warningMessage + " Nombres = " + this.sDocument;
      
    } else{
      this.warningMessage = "¿Está seguro que desea generar el reporte?";
    }
    */
    swal.fire({
      title: "Advertencia",
      text: "¿Está seguro que desea generar el reporte?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: 'Aceptar',
      allowOutsideClick: false,
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.value) {
        this.isLoading = true;
        let data: any = {};
        data.sDocument = this.sDocument;
        data.nPolicy = this.nPolicy;
        data.sNombres = this.sNombre.toUpperCase().trim();
        this.atpReportService.ProcessClaimReport(data).subscribe(
          res => {
            this.foundResults = res.GenericResponse;

            if (this.foundResults != null && this.foundResults.length > 0) {
              this.totalItems = res.TotalRowNumber;
              this.excelService.generateReportClaimATPExcel(this.foundResults, 'ReporteSiniestroVDP');
            }
            else {
              this.totalItems = 0;
              swal.fire('Información', this.notfoundMessage, 'warning');
            }
            this.isLoading = false;
          },
          error => {
            this.foundResults = [];
            this.totalItems = 0;
            this.isLoading = false;
            swal.fire('Información', this.genericErrorMessage, 'error');
          }
        );
      }
    });
  }
}
