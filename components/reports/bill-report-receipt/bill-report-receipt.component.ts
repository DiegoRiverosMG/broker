
import { Component, OnInit, ViewChild } from '@angular/core';
import { BsDatepickerConfig } from 'ngx-bootstrap/datepicker';
import { NgbModal, ModalDismissReasons, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { Router } from '@angular/router';
import { DatePipe } from '@angular/common';

//Compartido
import { AccessFilter } from './../../access-filter'
import { ModuleConfig } from './../../module.config'
import Swal from 'sweetalert2'
import { ClientInformationService } from '../../../services/shared/client-information.service';
import { PolicyService } from '../../../services/policy/policy.service';
import { BillReportService } from '../../../services/report/bill-report.service';
import { PolicyemitService } from '../../../services/policy/policyemit.service';
import { CommonMethods } from '../../common-methods';
import { PolicyMovementDetailsAllComponent } from '../../policy-all/policy-movement-details-all/policy-movement-details-all.component';
import { BillReportReceiptColumnDialogComponent } from '../bill-report-receipt-column-dialog/bill-report-receipt-column-dialog.component';

@Component({
  selector: 'app-bill-report-receipt',
  templateUrl: './bill-report-receipt.component.html',
  styleUrls: ['./bill-report-receipt.component.css']
})
export class BillReportReceiptComponent implements OnInit {
  @ViewChild('desde') desde: any;
  @ViewChild('hasta') hasta: any;
  userType: number = 1; //1: admin, 2:emisor, 3:comercial, 4:tecnico, 5:cobranza
  bsConfig: Partial<BsDatepickerConfig>;

  bsValueIni: Date = new Date();
  bsValueFin: Date = new Date();
  bsValueIniMax: Date = new Date();
  bsValueFinMin: Date = new Date();
  bsValueFinMax: Date = new Date();

  branchList: any = [];
  productList: any = [];
  transaccionList: any = [];
  policyList: any = [];
  documentTypeList: any = [];
  InputsSearch: any = {};
  listToShow: any[] = [];
  statusList: any[] = []; //Lista de estados de cotización
  payStateList: any[] = []
  billStateList: any[] = []

  codProducto = JSON.parse(localStorage.getItem('codProducto'))['productId']
  //epsItem = JSON.parse(sessionStorage.getItem('eps'))
  epsItem = JSON.parse(localStorage.getItem('eps'))

  maxlength = 8;
  minlength = 8;

  stateSearch = false;
  stateSearchPolicy = false;
  stateSearchNroPolicy = false;
  blockSearch = true;
  blockDoc = true;
  isLoading: boolean = false;
  selectedPolicy: string;

  currentPage = 1; //página actual
  rotate = true; //
  maxSize = 10; // cantidad de paginas que se mostrarán en el paginado
  itemsPerPage = 5; // limite de items por página
  totalItems = 0; //total de items encontrados

  blockSearch_BR = true;
  blockDoc_BR = true;
  documentTypeList_BR: any = [];

    tableColumns = [
    { name: "Ramo", value: true, id: "c1" },
    { name: "Producto", value: true, id: "c2" },
    { name: "Tipo de documento", value: false, id: "c3" },
    { name: "Doc. Contratante", value: true, id: "c4" },
    { name: "Contratante", value: true, id: "c5" },
    { name: "Nro Póliza", value: true, id: "c6" },
    { name: "Tipo de Movimiento", value: false, id: "c7" },
    { name: "Recibo", value: true, id: "c8" },
    { name: "Inicio de Vigencia", value: true, id: "c9" },
    { name: "Fin de Vigencia", value: true, id: "c10" },
    { name: "Broker", value: true, id: "c11" },
    { name: "Tipo de Documento", value: false, id: "c12" },
    { name: "Serie Doc.", value: false, id: "c13" },
    { name: "Factura", value: true, id: "c14" },
    { name: "Fecha de emisión de Factura", value: true, id: "c15" },
    { name: "Fecha de Pago", value: false, id: "c16" },
    { name: "Estado", value: true, id: "c17" },
    { name: "Prima Total", value: true, id: "c18" },
    { name: "Moneda", value: true, id: "c19" },
    { name: "Tipo de Pago", value: true, id: "c20" },
    { name: "Días de Crédito", value: true, id: "c21" },
    { name: "Creador de la venta", value: true, id: "c22"},
    ]

    selectAllCheckbox: boolean = false
    searchButtonPressed: boolean = false


  canRenovate: boolean;
  canInclude: boolean;

  constructor(
    private clientInformationService: ClientInformationService,
    private billReportService: BillReportService,
    private policyErmitService: PolicyemitService,
    private modalService: NgbModal,
    private router: Router,
    private datePipe: DatePipe

  ) {
    this.bsConfig = Object.assign(
      {},
      {
        dateInputFormat: 'DD/MM/YYYY',
        locale: 'es',
        showWeekNumbers: false
      }
    );
  }


  mostrarMas() {
    this.currentPage = 1;
    this.listToShow = this.policyList.slice(((this.currentPage - 1) * this.itemsPerPage), (this.currentPage * this.itemsPerPage));
    this.selectedPolicy = '';
  }

  ngOnInit() {
    this.canRenovate = true;
    this.canInclude = true;
    this.InputsSearch.NTYPE_HIST = '0';
    this.InputsSearch.NBRANCH = '0';

    this.InputsSearch.NPRODUCT = '0';
    this.InputsSearch.P_NIDTRANSACCION = '0';
    this.InputsSearch.NPOLICY = '';

    this.InputsSearch.NIDDOC_TYPE = '0';
    this.InputsSearch.SIDDOC = '';
    this.InputsSearch.P_PERSON_TYPE = '1';
    this.InputsSearch.P_TYPE_SEARCH = '1';
    this.InputsSearch.SFIRSTNAME = ''
    this.InputsSearch.SLEGALNAME = ''
    this.InputsSearch.SLASTNAME = ''
    this.InputsSearch.SLASTNAME2 = ''

    this.InputsSearch.COD_FORMA_PAGO = '0'
    this.InputsSearch.COD_ESTADO_FACTURA = '0'

    this.bsValueIni = new Date();
    this.bsValueIni.setDate(this.bsValueIni.getDate() - 30);
    this.bsValueFin = new Date();
    this.bsValueIniMax = new Date();
    this.bsValueFinMin = this.bsValueIni;
    this.bsValueFinMax = new Date();

    this.getBranchList();
    this.getTransaccionList();
    this.getDocumentTypeList();
    // this.getStatusList();
    this.obtenerEstadosPago()
    this.obtenerEstadosFactura()

    this.InputsSearch.NIDDOC_TYPE_BR = '0';
    this.InputsSearch.SIDDOC_BR = '';
    this.InputsSearch.P_PERSON_TYPE_BR = '1';
    this.InputsSearch.P_TYPE_SEARCH_BR = '1';
    this.InputsSearch.SFIRSTNAME_BR = ''
    this.InputsSearch.SLEGALNAME_BR = ''
    this.InputsSearch.SLASTNAME_BR = ''
    this.InputsSearch.SLASTNAME2_BR = ''

  }



  documentNumberKeyPress(event: any) {
      let pattern = /[0-9]/
      const inputChar = String.fromCharCode(event.charCode)
      if (!pattern.test(inputChar)) event.preventDefault()
  }

  choosePolicyClk(evt, selection: any, idTipo: number) {
    if (selection != undefined && selection != '') {
      if (this.policyList.length > 0) {
        this.policyList.forEach(item => {
          if (item.NID_COTIZACION == selection) {
            this.policyErmitService.valTransactionPolicy(item.NID_COTIZACION).subscribe(
              res => {
                if (res.P_COD_ERR == '0') {
                  switch (idTipo) {
                    case 1: // Anular
                      this.router.navigate(['/extranet/policy/transaction/cancel'], { queryParams: { nroCotizacion: item.NID_COTIZACION } });
                      break;
                    case 2: // Incluir
                      this.router.navigate(['/extranet/policy/transaction/include'], { queryParams: { nroCotizacion: item.NID_COTIZACION } });
                      break;
                    case 3: // Exluir
                      this.router.navigate(['/extranet/policy/transaction/exclude'], { queryParams: { nroCotizacion: item.NID_COTIZACION } });
                      break;
                    case 4: // Renovar
                      let data: any = {};
                      data.NBRANCH = item.NBRANCH;
                      data.NPRODUCT = item.NPRODUCT;
                      data.NPOLICY = item.NPOLIZA;
                      data.NID_COTIZACION = item.NID_COTIZACION;
                      this.policyErmitService.ValidatePolicyRenov(data).subscribe(
                        res => {
                          if (res.P_NCODE == '0') {
                            this.router.navigate(['/extranet/policy/transaction/renew'], { queryParams: { nroCotizacion: item.NID_COTIZACION, nroPoliza: item.NPOLIZA } });
                          }
                          else {
                            Swal.fire('Información', res.P_SMESSAGE, 'error');
                          }
                        },
                        err => { }
                      )
                      break;
                    case 5: //Neteo
                      this.router.navigate(['/extranet/policy/transaction/netear'], { queryParams: { nroCotizacion: item.NID_COTIZACION } });
                      break;
                    case 6: //Endoso
                      this.router.navigate(['/extranet/policy/transaction/endosar'], { queryParams: { nroCotizacion: item.NID_COTIZACION } });
                      break;
                    case 9: //Facturacion
                      //this.recibosPoliza(item);
                      break;
                  }
                } else {
                  Swal.fire({
                    title: 'Información',
                    text: res.P_MESSAGE,
                    icon: 'error',
                    confirmButtonText: 'OK',
                    allowOutsideClick: false,
                  }).then((result) => {
                    if (result.value) {
                      return;
                    }
                  });
                }
              },
              err => {
                this.isLoading = false;
              }
            );
          }
        });
      }
    } else {
      Swal.fire({
        title: 'Información',
        text: 'Para continuar deberá elegir una póliza',
        icon: 'error',
        confirmButtonText: 'OK',
        allowOutsideClick: false,
      }).then((result) => {
        if (result.value) {
          return;
        }
      });
    }
    evt.preventDefault();
  }


   /**
   * Obtener lista de estados
   */
  // getStatusList() {
  //   this.quotationService.getStatusList('3', this.codProducto).subscribe(
  //     res => {
  //       res.forEach(element => {
  //         if (element.Id != '5') {this.statusList.push(element);}
  //       });
  //     },
  //     error => {

  //     }
  //   );
  // }

  getProductsListByBranch() {
      this.clientInformationService.getProductList(this.codProducto, this.epsItem.NCODE, this.InputsSearch.NBRANCH).subscribe(
        res => {
            this.productList = res
            this.InputsSearch.NPRODUCT = this.productList[0].COD_PRODUCT
        },
      err => { console.log(err) }
    )
  }

  SelectBranch() {
    this.productList = null;
    //this.desBranchSelected = this.InputsProduct.SDESCRIPT;
    //this.getProductsListByBranch();
    if (this.InputsSearch.NBRANCH != null) {
      this.getProductsListByBranch();
    }
  }

  getBranchList() {

    this.clientInformationService.getBranches(this.codProducto, this.epsItem.NCODE).subscribe(
      res => {
        this.branchList = res;
        this.InputsSearch.NBRANCH = this.branchList[0].NBRANCH
        this.getProductsListByBranch()
      },
      err => {
        console.log(err);
      }
    );
  }

  getTransaccionList() {
    this.policyErmitService.getTransactionAllList().subscribe(
      res => {
        this.transaccionList = res;
      },
      err => {
        console.log(err);
      }
    );
  }

  getDocumentTypeList() {
    this.clientInformationService.getDocumentTypeList(this.codProducto).subscribe(
      res => {
        if (this.codProducto == 3) {
          this.documentTypeList = res.filter(function (obj) {
            return obj.Id == 1;
          });
          this.documentTypeList_BR = res.filter(function (obj) {
            return obj.Id == 1;
          });
        } else {
          this.documentTypeList = res;
          this.documentTypeList_BR = res;
        }
      },
      err => {
        console.log(err);
      }
    );
  }

  openModal() {
    let modalRef: NgbModalRef;

    modalRef = this.modalService.open(BillReportReceiptColumnDialogComponent, { size: 'sm', windowClass: 'modalCustom', backdropClass: 'light-blue-backdrop', backdrop: 'static', keyboard: false });
    modalRef.componentInstance.reference = modalRef;
    modalRef.componentInstance.columnas = this.tableColumns
    modalRef.componentInstance.selectAllCheckbox = this.selectAllCheckbox
  }

  onKeyPress(event) {
    let strError = '';

    if (this.InputsSearch.NBRANCH == '0') {
      strError = '- Seleccione un ramo';
    }
    else if (this.InputsSearch.NPRODUCT == '0') {
      strError += '- Seleccione un producto';
    }

    if (strError != '') {
      Swal.fire('Error', strError, 'error');
    }
  }

  onSelectTypeSearch() {
    switch (this.InputsSearch.P_TYPE_SEARCH) {
      case '1':
        this.blockSearch = true;
        this.blockDoc = true;
        this.InputsSearch.SFIRSTNAME = ''
        this.InputsSearch.SLEGALNAME = ''
        this.InputsSearch.SLASTNAME = ''
        this.InputsSearch.SLASTNAME2 = ''
        break;

      case '2':
        this.blockSearch = false;
        this.blockDoc = true;
        this.InputsSearch.NIDDOC_TYPE = '0';
        this.InputsSearch.SIDDOC = '';
        this.InputsSearch.P_PERSON_TYPE = '1';
        break;

    }

    this.stateSearchNroPolicy = false;
  }

  buscarPoliza() {
    this.listToShow = [];
    this.currentPage = 1; //página actual
    this.maxSize = 10; // cantidad de paginas que se mostrarán en el paginado
    // this.itemsPerPage = 5; // limite de items por página
    this.totalItems = 0; //total de items encontrados

    let msg: string = '';
    if (this.InputsSearch.NIDDOC_TYPE != '0') {
      if (this.InputsSearch.SIDDOC == '') {
        msg = 'Debe llenar el número de documento'
      }
    }

    if (this.InputsSearch.SIDDOC != '') {
      if (this.InputsSearch.NIDDOC_TYPE == '0') {
        msg = 'Debe llenar el tipo de documento'
      }
    }

    if (this.InputsSearch.SFIRSTNAME != '') {
      if (this.InputsSearch.SFIRSTNAME.length < 2) {
        msg += 'El campo nombre debe contener al menos 2 caracteres <br />'
      }
    }

    if (this.InputsSearch.SLASTNAME != '') {
      if (this.InputsSearch.SLASTNAME.length < 2) {
        msg += 'El campo apellido paterno debe contener al menos 2 caracteres'
      }
    }
    if (this.InputsSearch.NPOLICY != '') {
      if (this.InputsSearch.NBRANCH === '0') {
        msg += '-Debe llenar el ramo.<br>';
      }

      if (this.InputsSearch.NPRODUCT === '0') {
        msg += '-Debe llenar el producto.';
      }
    }
    /* * */
    if (this.InputsSearch.P_TYPE_SEARCH_BR == '2' && this.InputsSearch.P_PERSON_TYPE_BR == '1') {
      if (this.InputsSearch.SFIRSTNAME_BR == '' || this.InputsSearch.SLASTNAME_BR == '') {
        msg = 'El campo nombre y apellido paterno son obligatorios';
      }
    }

    if (this.InputsSearch.P_TYPE_SEARCH_BR == '2' && this.InputsSearch.P_PERSON_TYPE_BR == '2') {
      if (this.InputsSearch.SLEGALNAME_BR == '') {
        msg = 'El campo razon social es obligatorio.';
      }
    }

    if (this.InputsSearch.NIDDOC_TYPE_BR != '0') {
      if (this.InputsSearch.SIDDOC_BR == '') {
        msg = 'Debe llenar el número de documento'
      }
    }

    if (this.InputsSearch.SIDDOC_BR != '') {
      if (this.InputsSearch.NIDDOC_TYPE_BR == '0') {
        msg = 'Debe llenar el tipo de documento'
      }
    }

    if (this.InputsSearch.SFIRSTNAME_BR != '') {
      if (this.InputsSearch.SFIRSTNAME_BR.length < 2) {
        msg += 'El campo nombre debe contener al menos 2 caracteres <br />'
      }
    }

    if (this.InputsSearch.SLASTNAME_BR != '') {
      if (this.InputsSearch.SLASTNAME_BR.length < 2) {
        msg += 'El campo apellido paterno debe contener al menos 2 caracteres'
      }
    }


    if (msg != '') {
      Swal.fire('Información', msg, 'error');
    } else {

        this.searchButtonPressed = true
      this.isLoading = true;
      // // Fecha Inicio
      // let dayIni = this.bsValueIni.getDate() < 10 ? "0" + this.bsValueIni.getDate() : this.bsValueIni.getDate();
      // let monthPreviewIni = this.bsValueIni.getMonth() + 1;
      // let monthIni = monthPreviewIni < 10 ? "0" + monthPreviewIni : monthPreviewIni;
      // let yearIni = this.bsValueIni.getFullYear();

      // //Fecha Fin
      // let dayFin = this.bsValueFin.getDate() < 10 ? "0" + this.bsValueFin.getDate() : this.bsValueFin.getDate();
      // let monthPreviewFin = this.bsValueFin.getMonth() + 1;
      // let monthFin = monthPreviewFin < 10 ? "0" + monthPreviewFin : monthPreviewFin;
      // let yearFin = this.bsValueFin.getFullYear();

      let data: any = {};
      data.nBranch = this.InputsSearch.NBRANCH;
      data.nProduct = this.InputsSearch.NPRODUCT == '0' ? 0 : this.InputsSearch.NPRODUCT;
      data.nPolicy = this.InputsSearch.NPOLICY == '0' ? 0 : this.InputsSearch.NPOLICY
      data.nPayType = this.InputsSearch.COD_FORMA_PAGO
      data.NTYPE_DOC = this.InputsSearch.NIDDOC_TYPE == '0' ? 0 : this.InputsSearch.NIDDOC_TYPE;
      data.sDoc = this.InputsSearch.SIDDOC;
      data.SFIRSTNAME = this.InputsSearch.SFIRSTNAME;
      data.SLASTNAME = this.InputsSearch.SLASTNAME;
      data.SLASTNAME2 = this.InputsSearch.SLASTNAME2;
      data.nState = this.InputsSearch.COD_ESTADO_FACTURA;
      data.SLEGALNAME = this.InputsSearch.SLEGALNAME;
      data.startDate = this.bsValueIni.getDate().toString().padStart(2, '0') + '/' + (this.bsValueIni.getMonth() + 1).toString().padStart(2, '0') + '/' + this.bsValueIni.getFullYear(); //Fecha Inicio
      data.endDate = this.bsValueFin.getDate().toString().padStart(2, '0') + '/' + (this.bsValueFin.getMonth() + 1).toString().padStart(2, '0') + '/' + this.bsValueFin.getFullYear(); //Fecha fin
      data.nIdDocType = this.InputsSearch.NIDDOC_TYPE

      data.SFIRSTNAME_BR = this.InputsSearch.SFIRSTNAME_BR;
      data.SLASTNAME_BR = this.InputsSearch.SLASTNAME_BR;
      data.SLASTNAME2_BR = this.InputsSearch.SLASTNAME2_BR;
      data.SLEGALNAME_BR = this.InputsSearch.SLEGALNAME_BR;
      data.sDoc_BR = this.InputsSearch.SIDDOC_BR;
      data.nIdDocType_BR = this.InputsSearch.NIDDOC_TYPE_BR;

      this.billReportService.obtenerReporteDeFacturas(data).subscribe(
        res => {
            this.isLoading = false;
            if (res.codErr > 0) {
             Swal.fire({
              title: 'Información',
              text: res.message,
              icon: 'error',
              confirmButtonText: 'OK',
              allowOutsideClick: false,
            }).then((result) => {
              if (result.value) {
                return;
              }
            });

            } else {
                this.policyList = res.lista
                this.totalItems = this.policyList.length
                this.listToShow = this.policyList.slice(((this.currentPage - 1) * this.itemsPerPage), (this.currentPage * this.itemsPerPage))

            }
          /*
          this.policyList = res;
          this.totalItems = this.policyList.length;
          this.listToShow = this.policyList.slice(((this.currentPage - 1) * this.itemsPerPage), (this.currentPage * this.itemsPerPage));
          if (this.policyList.length == 0) {
            Swal.fire({
              title: 'Información',
              text: 'No se encuentran póliza(s) con los datos ingresados',
              type: 'error',
              confirmButtonText: 'OK',
              allowOutsideClick: false,
            }).then((result) => {
              if (result.value) {
                return;
              }
            });
          }
          */
        },
        err => {
          this.isLoading = false;
          console.log(err);
          Swal.fire('Información', 'Error al consultar el reporte.', 'error');
        }
      );
    }
  }

  obtenerEstadosPago() {
    this.billReportService.obtenerEstadosPago().subscribe(res => {
        res.forEach(it => this.payStateList.push(it))
    })

  }

  obtenerEstadosFactura() {
    this.billReportService.obtenerEstadosFactura().subscribe(res => {
         res.forEach(it => this.billStateList.push(it))
      })
  }

 obtenerReporteExcel() {
      this.isLoading = true
      let data: any = {};
      data.nBranch = this.InputsSearch.NBRANCH;
      data.nProduct = this.InputsSearch.NPRODUCT == '0' ? 0 : this.InputsSearch.NPRODUCT;
      data.nPolicy = this.InputsSearch.NPOLICY == '0' ? 0 : this.InputsSearch.NPOLICY
      data.nPayType = this.InputsSearch.COD_FORMA_PAGO
      data.NTYPE_DOC = this.InputsSearch.NIDDOC_TYPE == '0' ? 0 : this.InputsSearch.NIDDOC_TYPE;
      data.sDoc = this.InputsSearch.SIDDOC;
      data.SFIRSTNAME = this.InputsSearch.SFIRSTNAME;
      data.SLASTNAME = this.InputsSearch.SLASTNAME;
      data.SLASTNAME2 = this.InputsSearch.SLASTNAME2;
      data.nState = this.InputsSearch.COD_ESTADO_FACTURA;
      data.SLEGALNAME = this.InputsSearch.SLEGALNAME;
      data.startDate = this.bsValueIni.getDate().toString().padStart(2, '0') + '/' + (this.bsValueIni.getMonth() + 1).toString().padStart(2, '0') + '/' + this.bsValueIni.getFullYear(); //Fecha Inicio
      data.endDate = this.bsValueFin.getDate().toString().padStart(2, '0') + '/' + (this.bsValueFin.getMonth() + 1).toString().padStart(2, '0') + '/' + this.bsValueFin.getFullYear(); //Fecha fin
      data.nIdDocType = this.InputsSearch.NIDDOC_TYPE
     data.searchButtonPressed = this.searchButtonPressed

     data.SFIRSTNAME_BR = this.InputsSearch.SFIRSTNAME_BR;
     data.SLASTNAME_BR = this.InputsSearch.SLASTNAME_BR;
     data.SLASTNAME2_BR = this.InputsSearch.SLASTNAME2_BR;
     data.SLEGALNAME_BR = this.InputsSearch.SLEGALNAME_BR;
     data.sDoc_BR = this.InputsSearch.SIDDOC_BR;
     data.nIdDocType_BR = this.InputsSearch.NIDDOC_TYPE_BR;

     if (this.policyList.length == 0) {
         this.isLoading = false
             Swal.fire({
              title: 'Información',
              text: 'Favor de generar primero el reporte.',
              icon: 'error',
              confirmButtonText: 'OK',
              allowOutsideClick: false,
            }).then((result) => {
              if (result.value) {
                return;
              }
            });
     } else {
         this.billReportService.obtenerReporteDeFacturasExcel(data).subscribe(res => {
           this.isLoading = false;
           const blob = this.b64toBlob(res);
           const blobUrl = URL.createObjectURL(blob);
           let a = document.createElement("a")
           a.href = blobUrl
           a.download = "reporte.xlsx"
           a.click()
        })
     }

 }

  b64toBlob = (b64Data, contentType = '', sliceSize = 512) => {
      const byteCharacters = atob(b64Data);
      const byteArrays = [];

      for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
        const slice = byteCharacters.slice(offset, offset + sliceSize);

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

    resetForm() {
        this.InputsSearch.NPOLICY = ''
        this.InputsSearch.COD_FORMA_PAGO = 0
        this.InputsSearch.NIDDOC_TYPE = 0
        this.InputsSearch.SIDDOC = ''
        this.InputsSearch.SFIRSTNAME = ''
        this.InputsSearch.SLASTNAME = ''
        this.InputsSearch.SLASTNAME2 = ''
        this.InputsSearch.COD_ESTADO_FACTURA = 0
        this.InputsSearch.SLEGALNAME = ''
        this.InputsSearch.NIDDOC_TYPE = 0
        this.stateSearch = false
        this.blockSearch = true
        this.blockDoc = true
        this.InputsSearch.P_TYPE_SEARCH = 1
        this.stateSearchNroPolicy = false
        this.policyList = []
        this.listToShow = []

        this.currentPage = 1; //página actual
        this.rotate = true; //maxSize = 10; // cantidad de paginas que se mostrarán en el paginado
        this.itemsPerPage = 5; // limite de items por página
        this.totalItems = 0; //total de items encontrados

        this.searchButtonPressed = false

        this.blockSearch_BR = true
        this.blockDoc_BR = true
        this.InputsSearch.SIDDOC_BR = ''
        this.InputsSearch.SFIRSTNAME_BR = ''
        this.InputsSearch.SLASTNAME_BR = ''
        this.InputsSearch.SLASTNAME2_BR = ''
        this.InputsSearch.SLEGALNAME_BR = ''
        this.InputsSearch.NIDDOC_TYPE_BR = 0
        this.InputsSearch.P_TYPE_SEARCH_BR = 1
    }

  onSelectTypeDocument() {
    this.blockDoc = true;
    let response = CommonMethods.selTipoDocumento(this.InputsSearch.P_NIDDOC_TYPE)
    this.maxlength = response.maxlength
    this.minlength = response.minlength
    this.InputsSearch.SIDDOC = '';
  }

  onSelectTypePerson() {
    switch (this.InputsSearch.P_PERSON_TYPE) {
      case '1':
        this.blockDoc = true;
        break;
      case '2':
        this.blockDoc = false;
        break;
    }
  }

  pageChanged(currentPage) {
    this.currentPage = currentPage;
    this.listToShow = this.policyList.slice(((this.currentPage - 1) * this.itemsPerPage), (this.currentPage * this.itemsPerPage));
    this.selectedPolicy = '';
  }

  changeDoc(document) {
    if (document.length > 0) {
      this.stateSearchNroPolicy = true;
    }    else {
      this.stateSearchNroPolicy = false;
    }
  }

  changeFirstName(firstname) {
    if (firstname.length > 0) {
      this.stateSearchNroPolicy = true;
    }    else {
      if (this.InputsSearch.SLASTNAME != '' || this.InputsSearch.SLASTNAME2) {
        this.stateSearchNroPolicy = true;
      }      else {
        this.stateSearchNroPolicy = false;
      }
    }
  }

  changeLastName(lastname) {
    if (lastname.length > 0) {
      this.stateSearchNroPolicy = true;
    }    else {
      if (this.InputsSearch.SFIRSTNAME != '' || this.InputsSearch.SLASTNAME2) {
        this.stateSearchNroPolicy = true;
      }      else {
        this.stateSearchNroPolicy = false;
      }
    }
  }

  changeLastName2(lastname2) {
    if (lastname2.length > 0) {
      this.stateSearchNroPolicy = true;
    }    else {
      if (this.InputsSearch.SFIRSTNAME != '' || this.InputsSearch.SLASTNAME) {
        this.stateSearchNroPolicy = true;
      }      else {
        this.stateSearchNroPolicy = false;
      }
    }
  }

  changeContractor(contractor) {
    if (contractor.length > 0 || this.InputsSearch.SFIRSTNAME !== '' || this.InputsSearch.SLASTNAME !== '' || this.InputsSearch.SLASTNAME2 !== '') {
      this.stateSearchNroPolicy = true;
    }    else {
      this.stateSearchNroPolicy = false;
    }
  }

  changePolicy(sdoc) {
    if (sdoc.length > 0) {
      this.stateSearch = true;
      this.stateSearchPolicy = false;
      this.InputsSearch.P_NIDPRODUCT = '0';
      this.InputsSearch.P_NIDTRANSACCION = '0';
      this.InputsSearch.NIDDOC_TYPE = '0';
      this.InputsSearch.SIDDOC = '';
      this.InputsSearch.P_PERSON_TYPE = '1';
      this.InputsSearch.P_TYPE_SEARCH = '1';
      this.InputsSearch.SFIRSTNAME = '';
      this.InputsSearch.SLEGALNAME = '';
      this.InputsSearch.SLASTNAME = '';
      this.InputsSearch.SLASTNAME2 = '';
      this.blockDoc = true;
      this.blockDoc_BR = true;
    } else {
      this.stateSearch = false;
    }
  }



  valInicio(event) {
    this.bsValueFinMin = new Date(this.bsValueIni);

  }
  valFin(event) {
    this.bsValueIniMax = new Date(this.bsValueFin);
  }
  /* BROKER */
  onSelectTypeSearch_BR() {
    switch (this.InputsSearch.P_TYPE_SEARCH_BR) {
      case '1':
        this.blockSearch_BR = true;
        this.blockDoc_BR = true;
        this.InputsSearch.SFIRSTNAME_BR = ''
        this.InputsSearch.SLEGALNAME_BR = ''
        this.InputsSearch.SLASTNAME_BR = ''
        this.InputsSearch.SLASTNAME2_BR = ''
        break;

      case '2':
        this.blockSearch_BR = false;
        this.blockDoc_BR = true;
        this.InputsSearch.NIDDOC_TYPE_BR = '0';
        this.InputsSearch.SIDDOC_BR = '';
        this.InputsSearch.P_PERSON_TYPE_BR = '1';
        break;

    }

    this.stateSearchNroPolicy = false;
  }

  onSelectTypeDocument_BR() {
    this.blockDoc_BR = true;
    let response = CommonMethods.selTipoDocumento(this.InputsSearch.NIDDOC_TYPE_BR)
    this.maxlength = response.maxlength
    this.minlength = response.minlength
    this.InputsSearch.SIDDOC_BR = '';
  }

  changeFirstName_BR(firstname) {
    if (firstname.length > 0) {
      this.stateSearchNroPolicy = true;
    }    else {
      if (this.InputsSearch.SLASTNAME_BR != '' || this.InputsSearch.SLASTNAME2_BR) {
        this.stateSearchNroPolicy = true;
      }      else {
        this.stateSearchNroPolicy = false;
      }
    }
  }

  changeContractor_BR(contractor) {
    if (contractor.length > 0 || this.InputsSearch.SFIRSTNAME_BR !== '' || this.InputsSearch.SLASTNAME_BR !== '' || this.InputsSearch.SLASTNAME2_BR !== '') {
      this.stateSearchNroPolicy = true;
    }    else {
      this.stateSearchNroPolicy = false;
    }
  }
  changeLastName_BR(lastname) {
    if (lastname.length > 0) {
      this.stateSearchNroPolicy = true;
    }    else {
      if (this.InputsSearch.SFIRSTNAME_BR != '' || this.InputsSearch.SLASTNAME2_BR) {
        this.stateSearchNroPolicy = true;
      }      else {
        this.stateSearchNroPolicy = false;
      }
    }
  }
  changeLastName2_BR(lastname2) {
    if (lastname2.length > 0) {
      this.stateSearchNroPolicy = true;
    }    else {
      if (this.InputsSearch.SFIRSTNAME_BR != '' || this.InputsSearch.SLASTNAME_BR) {
        this.stateSearchNroPolicy = true;
      }      else {
        this.stateSearchNroPolicy = false;
      }
    }
  }
  onSelectTypePerson_BR() {
    switch (this.InputsSearch.P_PERSON_TYPE_BR) {
      case '1':
        this.blockDoc_BR = true;
        this.InputsSearch.SLEGALNAME_BR = '';
        break;
      case '2':
        this.blockDoc_BR = false;
        this.InputsSearch.SFIRSTNAME_BR = '';
        this.InputsSearch.SLASTNAME_BR = '';
        this.InputsSearch.SLASTNAME2_BR = '';
        break;
    }
  }
}
