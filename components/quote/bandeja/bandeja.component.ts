import { BsDatepickerConfig } from 'ngx-bootstrap/datepicker';
import { Component, OnInit } from '@angular/core';
import { ClientInformationService } from '../../../services/shared/client-information.service';
import { QuotationService } from '../../../services/quotation/quotation.service';
import { isNumeric } from 'rxjs/internal-compatibility';
import { ModuleConfig } from './../../module.config';
import { AccessFilter } from './../../access-filter'
import { Router } from '@angular/router';
import { DatePipe } from '@angular/common';
import swal from 'sweetalert2';
import { CommonMethods } from '../../common-methods';
import { ParameterSettingsService } from '../../../services/maintenance/parameter-settings.service';
@Component({
  selector: 'app-bandeja',
  templateUrl: './bandeja.component.html',
  styleUrls: ['./bandeja.component.css']
})
export class BandejaComponent implements OnInit {

  bsConfig: Partial<BsDatepickerConfig>;
  bsValueIni: Date = ModuleConfig.StartDate;  //Fecha inicial del componente
  bsValueFin: Date = ModuleConfig.EndDate;  //Fecha final del componente
  bsValueFinMax: Date = new Date();
  codProducto = JSON.parse(localStorage.getItem('codProducto'))['productId'];
  vidaLeyID = JSON.parse(localStorage.getItem('vidaleyID'));
  //epsItem = JSON.parse(sessionStorage.getItem('eps'));
  epsItem = JSON.parse(localStorage.getItem('eps'));
  valueErrorDate: string = '';
  InputsBandeja: any = {};
  productTypeList: any[] = [];  //Lista de tipos de producto
  statusList: any[] = []; //Lista de estados de cotización
  listToShow: any = [];
  bandejaList: any = [];
  profile: any;
  public existResults: boolean;
  isLoading: boolean = false;
  stateSearch: boolean = false;
  nbranch: any = '';

  currentPage = 1; // página actual
  rotate = true; //
  maxSize = 10; // cantidad de paginas que se mostrarán en el paginado
  itemsPerPage = 5; // limite de items por página
  totalItems = 0; // total de items encontrados

  constructor(
    private clientInformationService: ClientInformationService,
    private quotationService: QuotationService,
    private router: Router,
    private parameterSettingsService: ParameterSettingsService
  ) { }

  async ngOnInit() {
    this.nbranch = await CommonMethods.branchXproduct(this.codProducto);
    this.getProductTypeList();
    this.getStatusList();

    this.InputsBandeja.NPRODUCT = this.vidaLeyID.id;
    this.InputsBandeja.NBRANCH = this.vidaLeyID.nbranch;
    this.InputsBandeja.NSTATE = '';
    this.profile = await this.getProfileProduct(); // 20230325;
  }

  async getProfileProduct() {
    let profile = 0;

    let _data: any = {};
    _data.nUsercode = JSON.parse(localStorage.getItem('currentUser'))['id'];
    _data.nProduct = this.codProducto;
    await this.parameterSettingsService.getProfileProduct(_data).toPromise()
      .then(
        (res) => {
          profile = res;
        },
        err => {
          console.log(err)
        }
      );

    return profile;
  }

  quotationNumberChanged(event: any) { }

  openDetails(item: any) {
    let data: any = {};
    data.QuotationNumber = item.NUM_COTIZACION;
    data.ProductId = item.ID_PRODUCTO;
    data.Status = item.DES_ESTADO;
    data.Mode = item.MODO;
    data.From = 'BANDEJA';
    data.PolicyNumber = item.POLIZA;
    data.TypeTransac = item.STRANSAC;
    sessionStorage.setItem('cs-quotation', JSON.stringify(data));
    this.router.navigate(['/extranet/quotation-evaluation']);
  }

  pageChanged(currentPage) {
    this.currentPage = currentPage;
    this.listToShow = this.bandejaList.slice(((this.currentPage - 1) * this.itemsPerPage), (this.currentPage * this.itemsPerPage));
  }

  searchProcess() {

    this.isLoading = true;
    let data: any = {};
    data.NBRANCH = this.nbranch;
    data.NPRODUCT = this.InputsBandeja.NPRODUCT == null ? 0 : this.InputsBandeja.NPRODUCT;
    data.SSTATREGT = this.InputsBandeja.NSTATE == null ? 0 : this.InputsBandeja.NSTATE;
    data.NID_COTIZACION = this.InputsBandeja.NID_COTIZACION == null ? 0 : this.InputsBandeja.NID_COTIZACION;
    let dayIni, monthPreviewIni, monthIni, yearIni;
    let dayFin, monthPreviewFin, monthFin, yearFin;
    dayIni = this.bsValueIni.getDate() < 10 ? '0' + this.bsValueIni.getDate() : this.bsValueIni.getDate();
    monthPreviewIni = this.bsValueIni.getMonth() + 1;
    monthIni = monthPreviewIni < 10 ? '0' + monthPreviewIni : monthPreviewIni;
    yearIni = this.bsValueIni.getFullYear();
    dayFin = this.bsValueFin.getDate() < 10 ? '0' + this.bsValueFin.getDate() : this.bsValueFin.getDate();
    monthPreviewFin = this.bsValueFin.getMonth() + 1;
    monthFin = monthPreviewFin < 10 ? '0' + monthPreviewFin : monthPreviewFin;
    yearFin = this.bsValueFin.getFullYear();

    data.DDESDE = dayIni + '/' + monthIni + '/' + yearIni;
    data.DHASTA = dayFin + '/' + monthFin + '/' + yearFin;
    data.NUSERCODE = JSON.parse(localStorage.getItem('currentUser'))['id'];
    this.quotationService.getBandejaList(data).subscribe(
      res => {
        this.bandejaList = res;

        this.totalItems = this.bandejaList.length;
        this.listToShow = this.bandejaList.
          slice(((this.currentPage - 1) * this.itemsPerPage), (this.currentPage * this.itemsPerPage));

        if (this.bandejaList.length > 0)
          this.existResults = true;
        else {
          this.existResults = false;
          swal.fire('Información', 'No se encontraron resultados', 'warning');
        }


        this.isLoading = false;
      },
      err => {
        this.isLoading = false;
      }

    );
  }

  mostrarMas() {
    this.currentPage = 1;
    this.listToShow = this.bandejaList.slice(((this.currentPage - 1) * this.itemsPerPage), (this.currentPage * this.itemsPerPage));
  }

  onPaste(event: ClipboardEvent) {
    let clipboardData = event.clipboardData;
    let pastedText = clipboardData.getData('text');
    if (!isNumeric(pastedText)) {
      event.preventDefault()
    }
  }
  firstSearch() {

  }

  quotationNumberPressed(event: any) {
    if (!/[0-9]/.test(event.key) && event.key != 'Backspace' && event.key != 'Delete') {
      event.preventDefault();
    }
  }

  getStatusList() {
    this.quotationService.getStatusList('3', this.codProducto).subscribe(
      res => {
        res.forEach(element => {
          if (element.Id != '5') this.statusList.push(element);
        });
      },
      error => {

      }
    );
  }

  getProductTypeList() {
    this.clientInformationService.getProductList(this.codProducto, this.epsItem.NCODE, this.nbranch).subscribe(
      res => {
        this.productTypeList = res;
        if (this.productTypeList.length == 1) {
          this.InputsBandeja.NPRODUCT = this.productTypeList[0].COD_PRODUCT;
        } else {
          this.InputsBandeja.NPRODUCT = '0';
        }
      },
      err => {
        console.log(err);
      }
    );
  }
}
