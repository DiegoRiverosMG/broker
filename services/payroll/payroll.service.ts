import { Injectable } from '@angular/core';
import { ConfigService } from '../../../../shared/services/general/config.service';
import 'rxjs/add/operator/map';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/catch';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Payroll } from '../../models/payroll/payroll';
import { PayrollCab } from '../../models/payroll/payrollcab';
import { ConcPayroll } from '../../models/payroll/concpayroll';
import { PayrollFilter } from '../../models/payroll/payrollfilter';
import { PayrollDetail } from '../../models/payroll/payrolldetail';
import { TableType } from '../../models/payroll/tabletype';
import { delay, filter, map } from 'rxjs/operators';
import {
  IPaymentListRequest,
  IPaymentListResponse,
} from '../../interfaces/payroll.interface';
import { of } from 'rxjs';

@Injectable()
export class PayrollService {
  private headers = new HttpHeaders({ 'Content-Type': 'application/json' });
  list: any = [];
  _baseUrl = '';
  constructor(private http: HttpClient, private configService: ConfigService) {
    this._baseUrl = configService.getWebApiURL();
  }

  getPostGrabarPlanillaManual(paryrollcab: any): Observable<any> {
    const body = JSON.stringify(paryrollcab);
    return this.http
      .post(this._baseUrl + '/Payroll/insupdpayroll', body, {
        headers: this.headers,
      })
      .map(
        (response) => response,
        (error) => {
          console.log(error);
        }
      );
  }

  ValidarPolizaAsociadoAplanilla(paryrolldet: PayrollDetail) {
    const body = JSON.stringify(paryrolldet);
    return this.http
      .post(this._baseUrl + '/Payroll/validarpolizaasociadoaplanilla', body, {
        headers: this.headers,
      })
      .map(
        (response) => response,
        (error) => {
          console.log(error);
        }
      );
  }

  getPostDerivarPlanilla(paryrollcab: PayrollCab) {
    const body = JSON.stringify(paryrollcab);
    return this.http
      .post(this._baseUrl + '/Payroll/derivarpayroll', body, {
        headers: this.headers,
      })
      .map(
        (response) => response,
        (error) => {
          console.log(error);
        }
      );
  }

  getPostConciliarPlanilla(concparyroll: ConcPayroll) {
    const body = JSON.stringify(concparyroll);
    return this.http
      .post(this._baseUrl + '/Payroll/conciliarPayroll', body, {
        headers: this.headers,
      })
      .map(
        (response) => response,
        (error) => {
          console.log(error);
        }
      );
  }
  getPostAnularPlanilla(paryrollcab: PayrollCab) {
    const body = JSON.stringify(paryrollcab);
    return this.http
      .post(this._baseUrl + '/Payroll/anularpayroll', body, {
        headers: this.headers,
      })
      .map(
        (response) => response,
        (error) => {
          console.log(error);
        }
      );
  }

  getPostCertificado(payrollFilterCertificate: PayrollFilter) {
    const body = JSON.stringify(payrollFilterCertificate);
    return this.http
      .post(this._baseUrl + '/Payroll/getPayrollCertificados', body, {
        headers: this.headers,
      })
      .map(
        (response) => response,
        (error) => {
          console.log(error);
        }
      );
  }
  getDetailPayroll(payrollFilterCertificate: PayrollFilter) {
    const body = JSON.stringify(payrollFilterCertificate);
    return this.http
      .post(this._baseUrl + '/Payroll/getDetailPayroll', body, {
        headers: this.headers,
      })
      .map(
        (response) => response,
        (error) => {
          console.log(error);
        }
      );
  }

  GetPayRollGeneral(paryrollcab: PayrollCab) {
    const body = JSON.stringify(paryrollcab);
    return this.http
      .post(this._baseUrl + '/Payroll/getpayroll', body, {
        headers: this.headers,
      })
      .map(
        (response) => response,
        (error) => {
          console.log(error);
        }
      );
  }
  getPostListPayroll(payroll: Payroll) {
    const body = JSON.stringify(payroll);
    return this.http
      .post(this._baseUrl + '/Payroll/', body, { headers: this.headers })
      .map(
        (response) => response,
        (error) => {
          console.log(error);
        }
      );
  }

  getPostListPayrollList(payroll: Payroll) {
    const body = JSON.stringify(payroll);

    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const api = currentUser.productoPerfil.some((item: any) =>
      [20, 151, 159].includes(item.idPerfil)
    )
      ? '/Payroll/'
      : '/Payroll/getpayrolllist';

    return this.http
      .post(this._baseUrl + api, body, { headers: this.headers })
      .map(
        (response) => response,
        (error) => {
          console.log(error);
        }
      );
  }

  getComissions(request: any) {
    const body = JSON.stringify(request);
    const api = '/ventas/GetComission';

    return this.http
      .post(this._baseUrl + api, body, { headers: this.headers })
      .map(
        (response) => response,
        (error) => {
          console.log(error);
        }
      );
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

  getBranch(tablet: TableType) {
    const body = JSON.stringify(tablet);
    return this.http
      .post(this._baseUrl + '/Tool/getpayrollbranch', body, {
        headers: this.headers,
      })
      .map(
        (response) => response,
        (error) => {
          console.log(error);
        }
      );
  }

  getProduct(tablet: TableType) {
    const body = JSON.stringify(tablet);
    return this.http
      .post(this._baseUrl + '/Tool/getpayrollproducts', body, {
        headers: this.headers,
      })
      .map(
        (response) => response,
        (error) => {
          console.log(error);
        }
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

  getPayrollHist(paryrollcab: PayrollCab) {
    const body = JSON.stringify(paryrollcab);
    return this.http
      .post(this._baseUrl + '/Payroll/getpayrollhist', body, {
        headers: this.headers,
      })
      .map(
        (response) => response,
        (error) => {
          console.log(error);
        }
      );
  }

  getPaymentList(
    payload: IPaymentListRequest
  ): Observable<IPaymentListResponse> {
    /*     return of({
      'success': true,
      'errorMessage': null,
      'result': [
        {
          'codigoRamo': '73',
          'ramo': 'VIDA LEY TRABAJADORES',
          'codigoCliente': '01010754964702',
          'cliente': 'TABOADA CHANGANQUI GIANELLA',
          'idTipoPago': '4',
          'tipoPago': 'NOTA DE CRÉDITO',
          'numeroOperacion': '9007400347',
          'importe': '441.96',
          'fechaRegistro': '16/02/2022'
        },
        {
          'codigoRamo': '73',
          'ramo': 'VIDA LEY TRABAJADORES',
          'codigoCliente': '01010754964702',
          'cliente': 'TABOADA CHANGANQUI GIANELLA',
          'idTipoPago': '4',
          'tipoPago': 'NOTA DE CRÉDITO',
          'numeroOperacion': '9007400337',
          'importe': '147.19',
          'fechaRegistro': '16/02/2022'
        },
        {
          'codigoRamo': '73',
          'ramo': 'VIDA LEY TRABAJADORES',
          'codigoCliente': '01010754964702',
          'cliente': 'TABOADA CHANGANQUI GIANELLA',
          'idTipoPago': '4',
          'tipoPago': 'NOTA DE CRÉDITO',
          'numeroOperacion': '9007400334',
          'importe': '883.91',
          'fechaRegistro': '16/02/2022'
        },
        {
          'codigoRamo': '73',
          'ramo': 'VIDA LEY TRABAJADORES',
          'codigoCliente': '01010754964702',
          'cliente': 'TABOADA CHANGANQUI GIANELLA',
          'idTipoPago': '4',
          'tipoPago': 'NOTA DE CRÉDITO',
          'numeroOperacion': '9007400335',
          'importe': '171.71',
          'fechaRegistro': '16/02/2022'
        },
        {
          'codigoRamo': '73',
          'ramo': 'VIDA LEY TRABAJADORES',
          'codigoCliente': '01010754964702',
          'cliente': 'TABOADA CHANGANQUI GIANELLA',
          'idTipoPago': '4',
          'tipoPago': 'NOTA DE CRÉDITO',
          'numeroOperacion': '9007400343',
          'importe': '552.44',
          'fechaRegistro': '16/02/2022'
        }
      ]
    }).pipe(
      delay(1000),
      map((response: any) => response)
    ); */
    const url = `${this._baseUrl}/payroll/payment/list`;
    return this.http
      .post(url, payload)
      .map((response) => response as IPaymentListResponse);
  }
}
