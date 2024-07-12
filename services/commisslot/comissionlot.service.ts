import { Injectable } from '@angular/core';
import { ConfigService } from '../../../../shared/services/general/config.service';
import 'rxjs/add/operator/map';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/catch';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { CommissionLot } from '../../models/commissionlot/commissionlot';
import { CommissionLotFilter } from '../../models/commissionlot/commissionlotfilter';
import { CommissionLotState } from '../../models/commissionlot/commissionlotstate';
import { CommissionState } from '../../models/commissionlot/commissionstate';
import { TableType } from '../../models/commissionlot/tabletype';
import { CommissionLotCab } from '../../models/commissionlot/commissionlotcab';
import { ApiService } from '../../../../shared/services/api.service';
import { CommissionLotExactus } from '../../models/commissionlot/commissionlotexactus';
import { CommissionLotAttach } from '../../models/commissionlot/commissionlotattach';
import { descargarExcel } from '../../models/commission-channel/commission-channel.model';
import * as XLSX from 'xlsx';
import * as FileSaver from 'file-saver';
import { AppConfig } from '../../../../app.config';
import { map } from 'rxjs/operators';
const EXCEL_EXTENSION = '.xlsx';

@Injectable()
export class CommissionLotService {
  private headers = new HttpHeaders({ 'Content-Type': 'application/json' });
  private urlApi = AppConfig.WSPD_API;
  list: any = [];
  _baseUrl = '';

  constructor(
    private http: HttpClient,
    private configService: ConfigService,
    private api: ApiService
  ) {
    this._baseUrl = configService.getWebApiURL();
  }

  getPostListCommissionLot(commissionlot: CommissionLot) {
    // console.log('ingreso a llamar al metodo');
    const body = JSON.stringify(commissionlot);
    // console.log(body);
    return this.http
      .post(this._baseUrl + '/CommissionLot/getcommissionlot', body, {
        headers: this.headers,
      })
      .map(
        (response) => response,
        (error) => {
          console.log(error);
        }
      );
  }

  GetCommissionLotGeneral(commissionLotcab: CommissionLotFilter) {
    const body = JSON.stringify(commissionLotcab);
    return this.http
      .post(this._baseUrl + '/CommissionLot/getcommissionlotgeneral', body, {
        headers: this.headers,
      })
      .map(
        (response) => response,
        (error) => {
          console.log(error);
        }
      );
  }

  getPostCertificateCommission(commissionlotFilter: CommissionLotFilter) {
    // console.log('ingreso a llamar al metodo'); prueba
    const body = JSON.stringify(commissionlotFilter);
    let endpoint = '';
    if (+commissionlotFilter.NBRANCH === 66) {
      endpoint = '/CommissionLot/getcertificatecommission';
    } else {
      endpoint = '/CommissionLot/getcertificatecommissionOther';
    }
    // console.log(body);
    return this.http
      .post(this._baseUrl + endpoint, body, {
        headers: this.headers,
      })
      .map(
        (response) => response,
        (error) => {
          console.log(error);
        }
      );
  }

  getCommissionLotHist(commissionLotfilter: CommissionLotFilter) {
    const body = JSON.stringify(commissionLotfilter);
    return this.http
      .post(this._baseUrl + '/CommissionLot/getcommissionlothist', body, {
        headers: this.headers,
      })
      .map(
        (response) => response,
        (error) => {
          console.log(error);
        }
      );
  }

  SaveCommissionLot(commissionlotcab: CommissionLotCab) {
    const formData: FormData = new FormData();
    formData.append('CAB', JSON.stringify(commissionlotcab));
    for (let i = 0; i < commissionlotcab.fileattach.length; i++) {
      formData.append(
        'fileattach',
        commissionlotcab.fileattach[i],
        commissionlotcab.fileattach[i].name
      );
    }
    return this.http.post(
      this._baseUrl + '/commissionlot/savecommission',
      formData
    );
  }

  getUploadedFile(id) {
    const url = `${id}`;
    const c = new CommissionLotFilter(
      '',
      '',
      0,
      '',
      0,
      '',
      0,
      id,
      '',
      '',
      0,
      0,
      0,
      '',
      0,
      0,
      0,
      0,
      0,
      0,
      0
    );
    const body = JSON.stringify(c);
    return this.http
      .post(this._baseUrl + '/commissionlot/dowloadfile', body)
      .map(
        (response) => response,
        (error) => {
          console.log(error);
        }
      );
  }

  generarLotePdf(numeroLote: number, type: string) {
    const endpoint = 'commissionlot';
    const action = type == 'extendido' ? 'GetDetailLotPdf' : 'GetDetailLotPdfResumido';
    const url = `${endpoint}/${action}/${numeroLote}`;
    return this.api.get(url);
  }

  downloadAttachments(id: string, type: string): Observable<any> {
    const data = {
      idLote: id,
      idTipo: type,
      noBase64: true,
    }
    const url = `${this.urlApi}/loteComisiones/descargar/archivos`;
    return this.http.post(url, data).pipe(map((response: any) => response.data));
  }


  AppendArrayCFile(form_data: FormData, values, name) {
    if (!values && name) {
      form_data.append(name, '');
    } else {
      if (typeof values === 'object') {
        for (const key in values) {
          if (key === 'fileattach') {
            form_data.append('[' + key + ']', values[key], values[key].name);
          } else {
            if (typeof values[key] === 'object') {
              this.AppendArrayCFile(
                form_data,
                values[key],
                name + '[' + key + ']'
              );
            } else {
              form_data.append('[' + key + ']', values[key]);
            }
          }
        }
      }
    }
    return form_data;
  }

  AppendArray(form_data: FormData, values, name) {
    if (!values && name) {
      console.log('dsa');
    } else {
      if (typeof values === 'object') {
        for (const key in values) {
          if (key === 'fileattach') {
            console.log(name + '[' + key + ']');
            console.log(values[key]);
            console.log(values[key].name);
          } else {
            if (typeof values[key] === 'object') {
              this.AppendArray(form_data, values[key], name + '[' + key + ']');
            } else {
              form_data.append(name + '[' + key + ']', values[key]);
            }
          }
        }
      }
    }
    return form_data;
  }

  getCommissionLotState(commissionlot: CommissionLotState) {
    const body = JSON.stringify(commissionlot);
    return this.http
      .post(this._baseUrl + '/CommissionLot/getcommissionlotstate', body, {
        headers: this.headers,
      })
      .map(
        (response) => response,
        (error) => {
          console.log(error);
        }
      );
  }

  updCommissionLotState(commissionlot: CommissionLotFilter) {
    const body = JSON.stringify(commissionlot);
    return this.http
      .post(this._baseUrl + '/CommissionLot/updcommlotstate', body, {
        headers: this.headers,
      })
      .map(
        (response) => response,
        (error) => {
          console.log(error);
        }
      );
  }

  getCommissionState(commissionlot: CommissionState) {
    const body = JSON.stringify(commissionlot);
    return this.http
      .post(this._baseUrl + '/CommissionLot/getcommissionstate', body, {
        headers: this.headers,
      })
      .map(
        (response) => response,
        (error) => {
          console.log(error);
        }
      );
  }

  getCommissionLotStateApprob(commissionlot: CommissionLotState) {
    const body = JSON.stringify(commissionlot);
    return this.http
      .post(this._baseUrl + '/CommissionLot/getcommlotstateaproba', body, {
        headers: this.headers,
      })
      .map(
        (response) => response,
        (error) => {
          console.log(error);
        }
      );
  }

  getBranch(tablet: TableType) {
    const body = JSON.stringify(tablet);
    return this.http
      .post(this._baseUrl + '/Tool/getbranch', body, { headers: this.headers })
      .map(
        (response) => response,
        (error) => {
          console.log(error);
        }
      );
  }
  getPostAnularLote(paryrollcab: CommissionLot) {
    const body = JSON.stringify(paryrollcab);
    return this.http
      .post(this._baseUrl + '/CommissionLot/anularlote', body, {
        headers: this.headers,
      })
      .map(
        (response) => response,
        (error) => {
          console.log(error);
        }
      );
  }

  getPostEnviarExactus(exactuscab: CommissionLotExactus) {
    const body = JSON.stringify(exactuscab);
    return this.http
      .post(this._baseUrl + '/CommissionLot/enviarexactus', body, {
        headers: this.headers,
      })
      .map(
        (response) => response,
        (error) => {
          console.log(error);
        }
      );
  }

  getVoucherType(tablet: TableType) {
    const body = JSON.stringify(tablet);
    return this.http
      .post(this._baseUrl + '/Tool/getvouchertype', body, {
        headers: this.headers,
      })
      .map(
        (response) => response,
        (error) => {
          console.log(error);
        }
      );
  }

  getAccountType(tablet: TableType) {
    const body = JSON.stringify(tablet);
    return this.http
      .post(this._baseUrl + '/Tool/getaccounttype', body, {
        headers: this.headers,
      })
      .map(
        (response) => response,
        (error) => {
          console.log(error);
        }
      );
  }

  deleteFileAttach(id: Number) {
    const endpoint = 'commissionlot';
    const action = 'DeleteFileAttach';
    const url = `${endpoint}/${action}/${id}`;
    return this.api.get(url);
  }

  getProduct(tablet: TableType) {
    const body = JSON.stringify(tablet);
    return (
      this.http
        // .post(this._baseUrl + '/Tool/getproducts', body, { headers: this.headers })
        .post(this._baseUrl + '/Tool/getproducts', body, {
          headers: this.headers,
        })
        .map(
          (response) => response,
          (error) => {
            console.log(error);
          }
        )
    );
  }

  getCurrency(tablet: TableType) {
    const body = JSON.stringify(tablet);
    return this.http
      .post(this._baseUrl + '/Currency/getCurrency', body, {
        headers: this.headers,
      })
      .map(
        (response) => response,
        (error) => {
          console.log(error);
        }
      );
  }

  getPayrollsPolicies(request: any) {
    const body = JSON.stringify(request);
    return this.http
      .post(this._baseUrl + '/CommissionLot/getpolicysgroup', body, {
        headers: this.headers,
      })
      .map(
        (response) => response,
        (error) => {
          console.log(error);
        }
      );
  }
  getPayrollsPoliciesNew(request: any) {
    const body = JSON.stringify(request);
    return this.http
      .post(this._baseUrl + '/Commission/listado', body, {
        headers: this.headers,
      })
      .map(
        (response) => response,
        (error) => {
          console.log(error);
        }
      );
  }

  getResultApproval(idUsuario: number): Observable<any> {
    const url = `${this.urlApi}/aprobacionComisiones/aprobacion/${idUsuario}`;
    return this.http.get(url).pipe(map((response: any) => response.data));
  }

  getAuthorizeComissions(lstcommissionAuth: any) {
    const endpoint = 'Commission/autorizacion';
    const url = `${endpoint}`;
    const data = JSON.stringify(lstcommissionAuth);
    return this.api.postHeader(url, data, this.headers);
  }

  getAuthorizeComissionsAll(lstcommissionAuth: any) {
    const endpoint = 'CommissionLot/getauthorizecomissionsall';
    const url = `${endpoint}`;
    const data = JSON.stringify(lstcommissionAuth);
    return this.api.postHeader(url, data, this.headers);
  }

  cantidadComisiones() {
    const endpoint = 'commissionlot';
    const action = 'getcountpolicys';
    const url = `${endpoint}/${action}`;
    return this.api.get(url);
  }

  getCanalTipoPago(channel: string, settings: string) {
    const endpoint = 'codechannel';
    const action = 'obtenertipopagocanal';
    const url = `/${endpoint}/${action}/${channel}/${settings}`;
    return this.http.get(this._baseUrl + url).map(
      (response) => response,
      (error) => {
        console.log(error);
      }
    );
  }

  getUpdateNotifMail(channel: string, settings: string) {
    const endpoint = 'codechannel';
    const action = 'updtipocanalnotifiMail';
    const url = `/${endpoint}/${action}/${channel}/${settings}`;
    return this.http.get(this._baseUrl + url).map(
      (response) => response,
      (error) => {
        console.log(error);
      }
    );
  }

  getMailFacturacion(canal) {
    const endpoint = 'commissionlot';
    const action = 'getmailfacturacion';
    const url = `/${endpoint}/${action}/${canal}`;
    return this.api.get(url);
  }

  updMailFacturacion(canal, mail) {
    const endpoint = 'commissionlot';
    const action = 'updmailfacturacion';
    const url = `/${endpoint}/${action}/${canal}/${mail}`;
    return this.api.get(url);
  }

  getProductDisponibilidad() {
    return (
      this.http
        // .post(this._baseUrl + '/Tool/getproducts', body, { headers: this.headers })
        .post(this._baseUrl + '/Tool/getproductsdisponibilidad', {
          headers: this.headers,
        })
    );
  }
  getCommissionFactur(commissionLotfilter) {
    const body = JSON.stringify(commissionLotfilter);

    return this.http
      .post(this._baseUrl + '/Commission/listado/detalle', body, {
        headers: this.headers,
      })
      .map(
        (response) => response,
        (error) => {
          console.log(error);
        }
      );
  }

  ValidarXML(commissionLotAttach: CommissionLotAttach): Observable<any> {
    const xml = commissionLotAttach;
    const formData: FormData = new FormData();
    formData.append('CAB', JSON.stringify(commissionLotAttach));
    formData.append('fileattach', commissionLotAttach.fileattach);

    return this.http.post(
      this._baseUrl + '/commissionlot/validarxml',
      formData
    );
  }

  validateXML(commissionLotAttach: CommissionLotAttach): Observable<any> {
    const xml = commissionLotAttach;
    const formData: FormData = new FormData();
    formData.append('CAB', JSON.stringify(commissionLotAttach));
    formData.append('fileattach', commissionLotAttach.fileattach);

    return this.http.post(
      this._baseUrl + '/commissionlot/xml/validar',
      formData
    );
  }

  getPayrollsPoliciesExport(request: any) {
    const body = JSON.stringify(request);
    return this.http
      .post(this._baseUrl + '/CommissionLot/getpolicysgroupexport', body, {
        headers: this.headers,
      })
      .map(
        (response) => response,
        (error) => {
          console.log(error);
        }
      );
  }

  deleteAllFilesAttach(id: Number) {
    const endpoint = 'commissionlot';
    const action = 'DeleteAllFilesAttach';
    const url = `${endpoint}/${action}/${id}`;
    return this.api.get(url);
  }

  descargarExcel(descargarE: descargarExcel) {
    /* const body = {
          data: btoa(JSON.stringify(descargarE)),
        }; */
    return this.http
      .post(this._baseUrl + '/Commission/detalleLote', descargarE, {
        headers: this.headers,
      })
      .map(
        (response) => response,
        (error) => {
          console.log(error);
        }
      );
  }

  exportarExcel(json: any, excelFileName: string): void {
    const ws = XLSX.utils.json_to_sheet(
      [
        {
          /* A: 'Canal',
                    B: 'Ramo',
                    C: 'Producto',
                    D: 'Nro. Lote',
                    E: 'Fecha de creación de Lote',
                    F: 'Póliza',
                    G: 'Nro. Recibo',
                    H: 'Moneda',
                    I: 'Prima total',
                    J: 'Prima neta',
                    K: 'Porcentaje de comisión',
                    L: 'Comisión Neta',
                    M: 'IGV',
                    N: 'Comisión Total',
                    O: 'Nro. Comprobante ',
                    P: 'Fecha de emisión de comprobante',
                    Q: 'Fecha de pago', */
          A: 'Nro. Lote',
          B: 'Ramo',
          C: 'Producto',
          D: 'Canal',
          E: 'Póliza',
          F: 'Fecha de creación de Lote',
          G: 'Nro. Comprobante',
          H: 'Fecha de emisión de comprobante',
          I: 'Fecha de pago',
          J: 'Prima total',
          K: 'Prima neta',
          L: 'Porcentaje de comisión',
          M: 'Comisión Neta',
          N: 'IGV',
          O: 'Comisión total',
        },
      ],
      {
        header: [
          'A',
          'B',
          'C',
          'D',
          'E',
          'F',
          'G',
          'H',
          'I',
          'J',
          'K',
          'L',
          'M',
          'N',
          'O',
          'P',
        ],
        skipHeader: true,
      }
    );

    const datosD = [];
    for (let i = 0; i < json.length; i++) {
      const object = {
        /*  A: json[i].canal,
                B: json[i].ramo,
                C: json[i].producto,
                D: json[i].idLote,
                E: json[i].fechaLote,
                F: json[i].numeroPoliza,
                G: json[i].numeroRecibo,
                H: json[i].moneda,
                I: parseFloat(json[i].primaTotal.replace(',', '.')),
                J: parseFloat(json[i].primaNeta.replace(',', '.')),
                K: parseFloat(json[i].porcentajeComision.replace(',', '.')),
                L: parseFloat(json[i].montoComisionNeta.replace(',', '.')),
                M: parseFloat(json[i].igv.replace(',', '.')),
                N: parseFloat(json[i].montoComisionTotal.replace(',', '.')),
                O: json[i].comprobante,
                P: json[i].fechaComprobante,
                Q: json[i].fechaPago, */
        A: json[i].idLote,
        B: json[i].ramo,
        C: json[i].producto,
        D: json[i].canal,
        E: json[i].numeroPoliza,
        F: json[i].fechaLote,
        G: json[i].comprobante,
        H: json[i].fechaComprobante,
        I: json[i].fechaPago, // Aun no esta
        J: parseFloat(json[i].primaTotal?.replace(',', '.')),
        K: parseFloat(json[i].primaNeta?.replace(',', '.')),
        L: parseFloat(json[i].porcentajeComision?.replace(',', '.')),
        M: parseFloat(json[i].montoComisionNeta?.replace(',', '.')),
        N: parseFloat(json[i].igv?.replace(',', '.')),
        O: parseFloat(json[i].montoComisionTotal?.replace(',', '.')),
      };
      datosD.push(object);
    }
    XLSX.utils.sheet_add_json(ws, datosD, { skipHeader: true, origin: 'A2' });
    const workbook: XLSX.WorkBook = {
      Sheets: { data: ws },
      SheetNames: ['data'],
    };
    const excelBuffer: any = XLSX.write(workbook, {
      bookType: 'xlsx',
      bookSST: false,
      type: 'array',
    });
    this.saveAsExcelFile(excelBuffer, excelFileName);
  }

  saveAsExcelFile(buffer: any, fileName: string): void {
    const data: Blob = new Blob([buffer], { type: 'application/octet-stream' });
    FileSaver.saveAs(
      data,
      fileName + '_export_' + new Date().getTime() + EXCEL_EXTENSION
    );
  }
}
