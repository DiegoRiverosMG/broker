/*************************************************************************************************/
/*  NOMBRE              :   REPORTE-TRAMAS-HISTORICAS.COMPONENT.TS                               */
/*  DESCRIPCIÓN         :   BROKER COMPONENTS                                                    */
/*  AUTOR               :   MATERIA GRIS - DIEGO ARMANDO GONZALES CHOCANO                        */
/*  FECHA               :   17-01-2023                                                           */
/*  VERSIÓN             :   1.0 - REPORTE DE TRAMAS HISTÓRICAS                                   */
/*************************************************************************************************/

import { Component, OnInit } from '@angular/core';
import { BsDatepickerConfig } from 'ngx-bootstrap/datepicker';
import { TramasHistoricasService } from '../../../../../layout/backoffice/services/tramas-historicas/tramas-historicas.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { forkJoin } from "rxjs";
import { GlobalValidators } from '../../global-validators';
import moment from 'moment';
import Swal from 'sweetalert2';
import * as FileSaver from 'file-saver';

@Component({
  selector: 'app-reporte-tramas-historicas',
  templateUrl: './reporte-tramas-historicas.component.html',
  styleUrls: ['./reporte-tramas-historicas.component.css']
})

export class ReporteTramasHistoricasComponent implements OnInit {

  diaActual = moment(new Date()).toDate();
  diaActualFormateado = moment(new Date()).format('YYYYMMDD').toString();
  bsConfig: Partial<BsDatepickerConfig>;
  submitted: boolean = false;
  filterForm: FormGroup;
  isLoading: boolean = false;

  reportes: [];
  listVisualizarResults: [];
  listToShow: any = [];
  currentPage = 1;
  itemsPerPage = 5;
  totalItems = 0;
  maxSize = 10;

  productos: [];
  endosos: [];
  cabecera: number;

  constructor(
    private formBuilder: FormBuilder,
    private tramasHistoricasService: TramasHistoricasService
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

  ngOnInit(): void {
    this.createForm();
    this.inicializarFiltros();
    this.getParams();
  }

  pageChanged(currentPage) {
    this.currentPage = currentPage;
    this.listToShow = this.listVisualizarResults.slice(
      (this.currentPage - 1) * this.itemsPerPage,
      this.currentPage * this.itemsPerPage
    );
  }

  listarReportes(): void {
    this.isLoading = true;
    this.submitted = true;
    if (this.filterForm.valid) {
      this.tramasHistoricasService.listarCabeceras(this.filterForm.value).subscribe(
        res => {
          this.currentPage = 1;
          this.reportes = res.Result.lista;
          this.listVisualizarResults = res.Result.lista;
          this.totalItems = this.listVisualizarResults.length;
          this.listToShow = this.listVisualizarResults.slice(
            (this.currentPage - 1) * this.itemsPerPage,
            this.currentPage * this.itemsPerPage
          );
          if (this.reportes.length == 0) {
            Swal.fire('Información', 'No se encontraron coincidencias en la búsqueda.', 'warning');
          }
          this.isLoading = false;
        },
        err => {
          Swal.fire('Información', 'Ha ocurrido un error al obtener los reportes.', 'error');
          this.isLoading = false;
        }
      )
    }
  }

  private createForm(): void {
    this.filterForm = this.formBuilder.group({
      P_NPRODUCT: ['', [Validators.required]],
      P_STYPE_ENDOSO: ['', [Validators.required]],
      P_DSTARTDATE: [this.diaActual, [Validators.required, GlobalValidators.notValidDate, GlobalValidators.tooOldDateValidator]],
      P_DEXPIRDAT: [this.diaActual, [Validators.required, GlobalValidators.notValidDate, GlobalValidators.tooOldDateValidator]],
      P_SCLINUMDOCU: ['', [Validators.pattern(/^[0-9]*$/), Validators.minLength(11)]],
      P_NPOLICY: ['', [Validators.pattern(/^[0-9]*$/), Validators.minLength(10)]],
      P_NRECEIPT: ['', [Validators.pattern(/^[0-9]*$/), Validators.minLength(10)]],
      P_SCOMPROBANTE: [''],
      P_NUSERCODE: [JSON.parse(localStorage.getItem('currentUser')).id],
      USER_NAME: [JSON.parse(localStorage.getItem('currentUser')).username],
      TIPO: ['', [Validators.pattern(/^[0-9]*$/)]],
      SERIE: ['', [Validators.pattern(/^[0-9]*$/)]],
      DOCUMENTO: ['', [Validators.pattern(/^[0-9]*$/)]]
    });
  }

  inicializarFiltros = () => {
    this.filterForm.controls['SERIE'].disable();
    this.filterForm.controls['DOCUMENTO'].disable();
    this.filterForm.setValidators([GlobalValidators.dateSortT]);
  }

  enabledRuc = (e) => {
    if (e == '') {
      this.filterForm.controls['P_NPOLICY'].enable();
      this.filterForm.controls['P_NRECEIPT'].enable();
      this.filterForm.controls['TIPO'].enable();
      this.filterForm.controls['SERIE'].disable();
      this.filterForm.controls['DOCUMENTO'].disable();
    } else {
      this.filterForm.controls['P_NPOLICY'].disable();
      this.filterForm.controls['P_NRECEIPT'].disable();
      this.filterForm.controls['TIPO'].disable();
      this.filterForm.controls['SERIE'].disable();
      this.filterForm.controls['DOCUMENTO'].disable();
    }
  }

  enabledPolicy = (e) => {
    if (e == '') {
      this.filterForm.controls['P_SCLINUMDOCU'].enable();
      this.filterForm.controls['P_NRECEIPT'].enable();
      this.filterForm.controls['TIPO'].enable();
      this.filterForm.controls['SERIE'].disable();
      this.filterForm.controls['DOCUMENTO'].disable();
    } else {
      this.filterForm.controls['P_SCLINUMDOCU'].disable();
      this.filterForm.controls['P_NRECEIPT'].disable();
      this.filterForm.controls['TIPO'].disable();
      this.filterForm.controls['SERIE'].disable();
      this.filterForm.controls['DOCUMENTO'].disable();
    }
  }

  enabledReceipt = (e) => {
    if (e == '') {
      this.filterForm.controls['P_SCLINUMDOCU'].enable();
      this.filterForm.controls['P_NPOLICY'].enable();
      this.filterForm.controls['TIPO'].enable();
      this.filterForm.controls['SERIE'].disable();
      this.filterForm.controls['DOCUMENTO'].disable();
    } else {
      this.filterForm.controls['P_SCLINUMDOCU'].disable();
      this.filterForm.controls['P_NPOLICY'].disable();
      this.filterForm.controls['TIPO'].disable();
      this.filterForm.controls['SERIE'].disable();
      this.filterForm.controls['DOCUMENTO'].disable();
    }
  }

  enabledVoucherTipo = (e) => {
    if (e == '') {
      this.filterForm.controls['P_SCLINUMDOCU'].enable();
      this.filterForm.controls['P_NPOLICY'].enable();
      this.filterForm.controls['P_NRECEIPT'].enable();
      this.filterForm.controls['SERIE'].disable();
    } else {
      this.filterForm.controls['P_SCLINUMDOCU'].disable();
      this.filterForm.controls['P_NPOLICY'].disable();
      this.filterForm.controls['P_NRECEIPT'].disable();
      this.filterForm.controls['SERIE'].enable();
    }
  }

  enabledVoucherSerie = (e) => {
    if (e == '') {
      this.filterForm.controls['TIPO'].enable();
      this.filterForm.controls['DOCUMENTO'].disable();
    } else {
      this.filterForm.controls['TIPO'].disable();
      this.filterForm.controls['DOCUMENTO'].enable();
    }
  }

  enabledVoucherDocumento = (e) => {
    if (e == '') {
      this.filterForm.controls['SERIE'].enable();
    } else {
      this.filterForm.controls['SERIE'].disable();
    }
  }

  soloNumeros = (e) => {
    return e.charCode >= 48 && e.charCode <= 57;
  }

  getParams = () => {
    let $productos = this.tramasHistoricasService.listarProductos();
    let $endosos = this.tramasHistoricasService.listarEndosos();
    return forkJoin([$productos, $endosos]).subscribe(
      res => {
        this.productos = res[0].Result.lista;
        this.endosos = res[1].Result.lista;
      },
      err => {
        Swal.fire('Información', 'Ha ocurrido un error al obtener los parámetros.', 'error');
      }
    )
  }

  generarCabecera = () => {
    this.submitted = true;
    if (this.filterForm.get("TIPO").value.length > 0 && this.filterForm.get("SERIE").value.length > 0 && this.filterForm.get("DOCUMENTO").value.length > 0) {
      this.filterForm.controls.P_SCOMPROBANTE.setValue(this.filterForm.get("TIPO").value + '-' + this.filterForm.get("SERIE").value + '-' + this.filterForm.get("DOCUMENTO").value);
    }
    if (this.filterForm.valid) {
      this.tramasHistoricasService.insertReportStatus(this.filterForm.value).subscribe(
        res => {
          this.cabecera = res[0].P_NID_CAB;
          Swal.fire('Información', 'Se ha generado el reporte ' + this.cabecera + '.', 'success');
          this.listarReportes();
        },
        err => {
          Swal.fire('Información', 'Ha ocurrido un error al generar la cabecera.', 'error');
        }
      )
    }
  }
  getFileReporteTramasHistoricas(idReport: number) {
    if (idReport != null && idReport != 0) {
      this.isLoading = true;
      this.tramasHistoricasService.getReporteTramasHistoricas(idReport).subscribe(
        res => {
          let _data = res;
          if (_data.response == 0) {
            if (_data.Data != null) {
              const file = new File([this.obtenerBlobFromBase64(_data.Data, '')],
              'Reporte_Tramas_Historicas_' + (JSON.parse(localStorage.getItem('currentUser')).username).toUpperCase() + '_' + this.diaActualFormateado + '_'+ idReport + '.xlsx', { type: 'text/xls' });
              FileSaver.saveAs(file);
            }
          }
          else {
            Swal.fire({
              title: 'Información',
              text: 'Ha ocurrido un error al descargar el reporte.',
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
}