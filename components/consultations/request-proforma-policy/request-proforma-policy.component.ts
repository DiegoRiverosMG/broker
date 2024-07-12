import { Component, OnInit } from '@angular/core';
import { BsDatepickerConfig } from 'ngx-bootstrap/datepicker';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { RequestProformaService } from '../../../services/requestproforma/request-proforma.service';
import swal from 'sweetalert2';
import Swal from 'sweetalert2';
import { RequestProformaPolicyViewComponent } from '../request-proforma-policy-view/request-proforma-policy-view.component';

@Component({
  selector: 'app-request-proforma-policy',
  templateUrl: './request-proforma-policy.component.html',
  styleUrls: ['./request-proforma-policy.component.css'],
})
export class RequestProformaPolicyComponent implements OnInit {
  listToShow: any = [];
  processHeaderList: any = [];

  //Llenamos los combos
  ListBillType: any = [];
  ListSerieNumber: any = [];
  ListDocumentType: any = [];

  //Obtenemos los id de los controles
  IdPolicy: any = '';
  IdBillType: any = '';
  IdSerieNumber: any = '';
  IdBill: any = '';
  IdDocType: any = '';
  IdDocument: any = '';

  //Fechas
  bsValueIni: Date = new Date();
  bsValueFin: Date = new Date();
  bsValueFinMax: Date = new Date();

  //Checkbox
  SearchType: any = '';
  SearchByFiltersActivated = false;
  SearchByBillActivated = false;
  DocTypeOff = false;
  IdDocumentOff = false;
  StartDateOff = false;
  EndDateOff = false;
  IdPolicyOff = false;
  BillTypeOff = false;
  SerieNumberOff = false;
  IdBillOff = false;
  NameMessage: any = '';

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
    private modalService: NgbModal,
    private ProformaService: RequestProformaService
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

  ngOnInit() {
    this.getDocumentType();
    this.getBillType();
    this.getSerieNumber();
    this.bsValueIni = new Date(
      this.bsValueIni.getFullYear(),
      this.bsValueIni.getMonth(),
      1
    );
    this.IdDocType = '0';
    this.IdBillType = '0';
    this.IdSerieNumber = '0';
    this.IdPolicyOff = false;
    this.SearchByBillActivated = false;
    this.BillTypeOff = true;
    this.SerieNumberOff = true;
    this.IdBillOff = true;
    this.SearchByFiltersActivated = false;
    this.DocTypeOff = true;
    this.IdDocumentOff = true;
    this.StartDateOff = true;
    this.EndDateOff = true;
  }

  //Método para obtener los tipos de comprobantes
  getBillType() {
    this.ProformaService.GetBillType().subscribe(
      (res) => {
        this.ListBillType = res;
      },
      (err) => {}
    );
  }

  //Método para obtener serie
  getSerieNumber() {
    this.ProformaService.GetSerieNumber().subscribe(
      (res) => {
        this.ListSerieNumber = res;
      },
      (err) => {}
    );
  }

  //Método para obtener los tipos de doc
  getDocumentType() {
    this.ProformaService.GetDocumentType().subscribe(
      (res) => {
        this.ListDocumentType = res;
      },
      (err) => {}
    );
  }

  //Checkbox para habilitar y deshabilitar búsqueda por factura
  setControlsForBill(event) {
    if (event.target.checked) {
      this.SearchByBillActivated = true;
    } else {
      this.SearchByBillActivated = false;
    }
    if (this.SearchByBillActivated == true) {
      this.SearchByFiltersActivated = false;
      this.BillTypeOff = false;
      this.SerieNumberOff = false;
      this.IdBillOff = false;
      this.StartDateOff = false;
      this.EndDateOff = false;
      this.DocTypeOff = true;
      this.IdDocumentOff = true;
      this.IdPolicyOff = true;
    } else {
      this.SearchByBillActivated == false;
      this.BillTypeOff = true;
      this.SerieNumberOff = true;
      this.IdBillOff = true;
      this.StartDateOff = true;
      this.EndDateOff = true;
      this.DocTypeOff = true;
      this.IdDocumentOff = true;
      this.IdPolicyOff = false;
    }
  }

  //Checkbox para habilitar y deshabilitar búsqueda por filtros
  setControlsForFilters(event) {
    if (event.target.checked) {
      this.SearchByFiltersActivated = true;
    } else {
      this.SearchByFiltersActivated = false;
    }
    if (this.SearchByFiltersActivated == true) {
      this.SearchByBillActivated = false;
      this.BillTypeOff = true;
      this.SerieNumberOff = true;
      this.IdBillOff = true;
      this.StartDateOff = false;
      this.EndDateOff = false;
      this.DocTypeOff = false;
      this.IdDocumentOff = false;
      this.IdPolicyOff = true;
    } else {
      this.SearchByFiltersActivated == false;
      this.BillTypeOff = true;
      this.SerieNumberOff = true;
      this.IdBillOff = true;
      this.StartDateOff = true;
      this.EndDateOff = true;
      this.DocTypeOff = true;
      this.IdDocumentOff = true;
      this.IdPolicyOff = false;
    }
  }

  //Reporte de la búsqueda para Excel
  convertListToExcel() {
    if (this.processHeaderList != null && this.processHeaderList.length > 0) {
      this.isLoading = true;
      this.ProformaService.ConvertListToExcel(
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
      this.ProformaService.ConvertListToPrintPDF(this.processHeaderList);
    } else {
      Swal.fire('Información', 'No hay registros para exportar.', 'info');
    }
    this.isLoading = false;
  }

  //Mostrar modal de asegurados
  ViewInsureds(item: any) {
    const modalRef = this.modalService.open(
      RequestProformaPolicyViewComponent,
      {
        size: 'xl',
        backdropClass: 'light-blue-backdrop',
        backdrop: 'static',
        keyboard: false,
      }
    );
    modalRef.componentInstance.reference = modalRef;
    modalRef.componentInstance.proforma = item;
    modalRef.result.then(
      (Interval) => {
        this.currentPage = 1;
        this.rotate = true; //
        this.maxSize = 2; // cantidad de paginas que se mostrarán en el paginado
        this.itemsPerPage = 3; // limite de items por página
        this.totalItems = 0;
        clearInterval(Interval);

        this.GetProcess();
      },
      (reason) => {
        this.isLoading = false;
      }
    );
  }

  //Listar proforma en base a los datos
  GetProcess() {
    //Validación de Búsqueda por Póliza
    if (
      (this.SearchByFiltersActivated == false &&
        this.SearchByBillActivated == false &&
        this.IdPolicy.length === 0) ||
      (this.SearchByFiltersActivated == false && this.IdPolicy.length == null)
    ) {
      if (this.IdPolicy.length === 0 || this.IdPolicy.length < 0) {
        this.NameMessage = 'Debe ingresar obligatoriamente el Número de Póliza';
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
        });
      (err) => {
        this.isLoading = false;
      };
    }

    //Validación de Búsqueda por Contratante
    else if (
      (new Date(this.bsValueIni) > new Date(this.bsValueFin) &&
        this.IdPolicyOff == true &&
        this.BillTypeOff == true &&
        this.SerieNumberOff == true &&
        this.IdBillOff == true) ||
      (this.IdDocType === '0' &&
        this.IdPolicyOff == true &&
        this.BillTypeOff == true &&
        this.SerieNumberOff == true &&
        this.IdBillOff == true) ||
      (this.IdDocument.length == 0 &&
        this.IdPolicyOff == true &&
        this.BillTypeOff == true &&
        this.SerieNumberOff == true &&
        this.IdBillOff == true)
    ) {
      if (this.IdDocType === '0' && this.IdDocument.length == 0) {
        this.NameMessage =
          'Debe seleccionar obligatoriamente el TIPO DE DOCUMENTO e ingresar el NUMERO DE DOCUMENTO';
      }
      if (this.IdDocType === '0' && this.IdDocument.length != 0) {
        this.NameMessage =
          'Debe seleccionar obligatoriamente el TIPO DE DOCUMENTO';
      }
      if (this.IdDocType != 0 && this.IdDocument.length == 0) {
        this.NameMessage =
          'Debe ingresar obligatoriamente el NUMERO DE DOCUMENTO';
      }
      if (
        new Date(this.bsValueIni) > new Date(this.bsValueFin) &&
        this.IdDocType != 0 &&
        this.IdDocument.length != 0
      ) {
        this.NameMessage =
          'La fecha inicial no puede ser mayor a la fecha final';
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
        });
      (err) => {
        this.isLoading = false;
      };
    }

    //Validación de Búsqueda por Comprobante
    else if (
      (new Date(this.bsValueIni) > new Date(this.bsValueFin) &&
        this.IdPolicyOff == true &&
        this.DocTypeOff == true &&
        this.IdDocumentOff == true) ||
      (this.IdBillType === '0' &&
        this.IdPolicyOff == true &&
        this.DocTypeOff == true &&
        this.IdDocumentOff == true) ||
      (this.IdSerieNumber === '0' &&
        this.IdPolicyOff == true &&
        this.DocTypeOff == true &&
        this.IdDocumentOff == true) ||
      (this.IdBill.length == 0 &&
        this.IdPolicyOff == true &&
        this.DocTypeOff == true &&
        this.IdDocumentOff == true)
    ) {
      if (
        this.IdBillType === '0' &&
        this.IdSerieNumber === '0' &&
        this.IdBill.length == 0
      ) {
        this.NameMessage =
          'Debe seleccionar obligatoriamente el tipo de comprobante, seleccionar el número de serie e ingresar el número de comprobante';
      }
      if (
        this.IdBillType === '0' &&
        this.IdSerieNumber === '0' &&
        this.IdBill.length != 0
      ) {
        this.NameMessage =
          'Debe seleccionar obligatoriamente el tipo de comprobante y seleccionar el número de serie';
      }
      if (
        this.IdBillType != 0 &&
        this.IdSerieNumber === '0' &&
        this.IdBill.length == 0
      ) {
        this.NameMessage =
          'Debe seleccionar obligatoriamente el número de serie e ingresar el número del comprobante';
      }
      if (
        this.IdBillType === '0' &&
        this.IdSerieNumber != 0 &&
        this.IdBill.length == 0
      ) {
        this.NameMessage =
          'Debe seleccionar obligatoriamente el tipo de comprobante e ingresar el número del comprobante';
      }
      if (
        this.IdBillType === '0' &&
        this.IdSerieNumber != 0 &&
        this.IdBill.length != 0
      ) {
        this.NameMessage =
          'Debe seleccionar obligatoriamente el tipo de comprobante';
      }
      if (
        this.IdBillType != 0 &&
        this.IdSerieNumber === '0' &&
        this.IdBill.length != 0
      ) {
        this.NameMessage = 'Debe ingresar obligatoriamente el número de serie';
      }
      if (
        this.IdBillType != 0 &&
        this.IdSerieNumber != 0 &&
        this.IdBill.length == 0
      ) {
        this.NameMessage =
          'Debe ingresar obligatoriamente el número de comprobante';
      }
      if (
        new Date(this.bsValueIni) > new Date(this.bsValueFin) &&
        this.IdBillType != 0 &&
        this.IdSerieNumber != 0 &&
        this.IdBill.length != 0
      ) {
        this.NameMessage =
          'La fecha inicial no puede ser mayor a la fecha final';
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
        });
      (err) => {
        this.isLoading = false;
      };
    } else {
      if (
        this.SearchByFiltersActivated == false &&
        this.SearchByBillActivated == false
      ) {
        this.isLoading = true;
        this.SearchType = '0';
      } else if (
        this.SearchByFiltersActivated == true &&
        this.SearchByBillActivated == false
      ) {
        this.isLoading = true;
        this.SearchType = '1';
      } else if (
        this.SearchByFiltersActivated == false &&
        this.SearchByBillActivated == true
      ) {
        this.isLoading = true;
        this.SearchType = '2';
      }

      this.listToShow = [];
      this.processHeaderList = [];

      this.currentPage = 1; // página actual
      this.rotate = true; //
      this.maxSize = 5; // cantidad de paginas que se mostrarán en el paginado
      this.itemsPerPage = 5; // limite de items por página
      this.totalItems = 0; // total de items encontrados

      let _data: any = {};
      _data.startDate =
        this.bsValueIni.getDate().toString().padStart(2, '0') +
        '/' +
        (this.bsValueIni.getMonth() + 1).toString().padStart(2, '0') +
        '/' +
        this.bsValueIni.getFullYear();
      _data.endDate =
        this.bsValueFin.getDate().toString().padStart(2, '0') +
        '/' +
        (this.bsValueFin.getMonth() + 1).toString().padStart(2, '0') +
        '/' +
        this.bsValueFin.getFullYear();
      _data.idDocType = this.IdDocType === '' ? 0 : this.IdDocType;
      _data.idDocument = this.IdDocument === '' ? 0 : this.IdDocument;
      _data.idPolicy = this.IdPolicy === '' ? 0 : this.IdPolicy;
      _data.idBillType = this.IdBillType === '' ? 0 : this.IdBillType;
      _data.idSerieNumber = this.IdSerieNumber === '' ? 0 : this.IdSerieNumber;
      _data.idBill = this.IdBill === '' ? 0 : this.IdBill;
      _data.searchType = this.SearchType === '' ? 0 : this.SearchType;
      this.ProformaService.GetListProformas(_data).subscribe(
        //Response del Back
        (res) => {
          if (res.P_NCODE == '0') {
            this.processHeaderList = res.listProf;
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
            this.isLoading = false;
          }
        }
      );
      (err) => {
        this.isLoading = false;
      };
    }
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
