import { Component } from '@angular/core';

import { QuotationService } from '../../../../services/quotation/quotation.service';
import { CommonMethods } from '../../../common-methods';

import { DesgravamenDevolucionService } from '../desgravamen-devolucion.service';
import { StorageService } from '../core/services/storage.service';
import { DesgravamenDevolucionConstants } from '../core/constants/desgravamen-devolucion.constants';
import { Router } from '@angular/router';
import { THIS_EXPR } from '@angular/compiler/src/output/output_ast';

@Component({
  selector: 'desgravamen-devolucion-bandeja',
  templateUrl: './desgravamen-devolucion-bandeja.component.html',
})
export class DesgravamenDevolucionBandejaComponent {

  filters: any = {};
  show: any = {};
  reload: any = {};
  cotizacionesParams = {};
  CONSTANTS: any = DesgravamenDevolucionConstants;

  constructor(
    public DesgravamenDevolucionService: DesgravamenDevolucionService,
    public storageService: StorageService,
    public quotationService: QuotationService,
    private router: Router) {
    this.CONSTANTS.RAMO = CommonMethods.branchXproduct(JSON.parse(localStorage.getItem('codProducto'))['productId']);
  }

  clickSearch() {
    this.cotizacionesParams = {
      NPRODUCT: (this.filters.tipoProducto || {}).COD_PRODUCT,
      SSTATREGT: (this.filters.estado || {}).Id || '',
      NID_COTIZACION: this.filters.numCotizacion || '',
      DDESDE: CommonMethods.formatDate(this.filters.fechaDesde) || '',
      DHASTA: CommonMethods.formatDate(this.filters.fechaHasta) || '',
      NUSERCODE: JSON.parse(localStorage.getItem('currentUser'))['id'],
      NBRANCH: this.CONSTANTS.RAMO,
    };

    this.reload.cotizaciones = true;
  }

  selectCotizacion(cotizacion) {
    alert('selectCotizacion')
  }

  clickDetail(cotizacion) {
    let link = this.CONSTANTS.RAMO == this.CONSTANTS.RAMO_COMERCIAL.ACC_PERSONALES ? this.CONSTANTS.BASE_URL.AP : this.CONSTANTS.BASE_URL.VG;
    this.router.navigate([
      '/extranet/' + link + '/evaluacion-cotizacion/' +
      cotizacion.NUM_COTIZACION +
      '/' +
      cotizacion.MODO
    ],
      { queryParams: { trx: cotizacion.STRANSAC } });
  }
  validarItems(items) {
    (items || []).forEach((item) => {
      if (!item.Rutas_archivo.length) {
        item.showFile = false;
      }
    });
  }



}
