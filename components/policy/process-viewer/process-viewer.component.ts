import { Component, OnInit } from '@angular/core';
import { BsDatepickerConfig } from 'ngx-bootstrap/datepicker';
import { DatePipe } from '@angular/common';
import swal from 'sweetalert2';
import { PolicyemitService } from '../../../services/policy/policyemit.service';
import { CommonMethods } from '../../common-methods';

@Component({
  selector: 'app-process-viewer',
  templateUrl: './process-viewer.component.html',
  styleUrls: ['./process-viewer.component.css']
})
export class ProcessViewerComponent implements OnInit {
  listToShow: any = [];
  processList: any = []
  currentPage = 1; //página actual
  rotate = true; //
  maxSize = 5; // cantidad de paginas que se mostrarán en el paginado
  itemsPerPage = 5; // limite de items por página
  totalItems = 0; //total de items encontrados
  isLoading: boolean = false;
  //epsItem: any = JSON.parse(sessionStorage.getItem("eps"));
  epsItem: any = JSON.parse(localStorage.getItem("eps"));
  codProducto = JSON.parse(localStorage.getItem("codProducto"))["productId"]
	variable: any = {}

  //Datos para configurar los datepicker
  bsConfig: Partial<BsDatepickerConfig>;
  bsValueIni: Date = new Date();
  bsValueFinMax: Date = new Date();
  lblProducto: string = "";
  lblFecha: string = "";
  constructor(
    private policyemit: PolicyemitService,
    private datePipe: DatePipe,
  ) {
    this.bsConfig = Object.assign(
      {},
      {
        dateInputFormat: "DD/MM/YYYY",
        locale: "es",
        showWeekNumbers: false
      }
    );
  }

  async ngOnInit() {
    this.visualizadorProcess();

    // Configuracion de las variables
		this.variable = await CommonMethods.configuracionVariables(this.codProducto, this.epsItem.NCODE)

    this.lblProducto = CommonMethods.tituloProducto(this.variable.var_nomProducto, this.epsItem.SNAME)
    this.lblFecha = CommonMethods.tituloPantalla()
  }

  visualizadorProcess() {
    this.listToShow = [];

    this.isLoading = true;
    this.currentPage = 1; //página actual
    this.rotate = true; //
    this.maxSize = 5; // cantidad de paginas que se mostrarán en el paginado
    this.totalItems = 0; //total de items encontrados

    let dayIni = this.bsValueIni.getDate() < 10 ? "0" + this.bsValueIni.getDate() : this.bsValueIni.getDate();
    let monthPreviewIni = this.bsValueIni.getMonth() + 1;
    let monthIni = monthPreviewIni < 10 ? "0" + monthPreviewIni : monthPreviewIni;
    let yearIni = this.bsValueIni.getFullYear();


    let data: any = {};
    data.P_NUSERCODE = JSON.parse(localStorage.getItem("currentUser"))["id"]
    data.P_DEFFECDATE = dayIni + "/" + monthIni + "/" + yearIni;
    data.P_NLIMITPERPAGE = 99999
    data.P_NPAGENUM = 1
    this.policyemit.GetVisualizadorProc(data).subscribe(
      res => {
        this.isLoading = false;
        this.processList = res.listProcess;
        this.totalItems = this.processList.length;
        this.listToShow = this.processList.slice(((this.currentPage - 1) * this.itemsPerPage), (this.currentPage * this.itemsPerPage));
        if (this.processList.length == 0) {
          swal.fire({
            title: "Información",
            text: "No se encuentran procesos con la fecha ingresada.",
            icon: "error",
            confirmButtonText: 'OK',
            allowOutsideClick: false,
          }).then((result) => {
          });
        }
      },
      err => {
        this.isLoading = false;
      }
    );
  }

  mostrarMas() {
    this.visualizadorProcess();
  }

  pageChanged(currentPage) {
    this.currentPage = currentPage;
    this.listToShow = this.processList.slice(((this.currentPage - 1) * this.itemsPerPage), (this.currentPage * this.itemsPerPage));
  }
}
