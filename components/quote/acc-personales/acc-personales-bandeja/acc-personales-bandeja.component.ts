import { Component } from '@angular/core';

import { QuotationService } from '../../../../services/quotation/quotation.service';
import { CommonMethods } from '../../../common-methods';

import { AccPersonalesService } from '../acc-personales.service';
import { StorageService } from '../core/services/storage.service';
import { AccPersonalesConstants } from '../core/constants/acc-personales.constants';
import { Router } from '@angular/router';
import { THIS_EXPR } from '@angular/compiler/src/output/output_ast';

@Component({
  selector: 'acc-personales-bandeja',
  templateUrl: './acc-personales-bandeja.component.html',
})
export class AccPersonalesBandejaComponent {

  filters: any = {};
  show: any = {};
  reload: any = {};
  cotizacionesParams = {};
  CONSTANTS: any = AccPersonalesConstants;

  constructor(
    public accPersonalesService: AccPersonalesService,
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
