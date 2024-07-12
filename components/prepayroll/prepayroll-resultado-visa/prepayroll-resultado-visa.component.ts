import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ModalDirective } from 'ngx-bootstrap/modal';
// Services
import { VisaService } from '../../../../../shared/services/pago/visa.service';
import { PrepayrollService } from '../../../services/prepayroll/prepayroll.service';
import { UtilityService } from '../../../../../shared/services/general/utility.service';
// Models
import { VisaResult } from '../../../models/visaresult/visaresult';
import { Cliente } from '../../../models/cliente/cliente';
import { AppConfig } from '../../../../../app.config';
import { Autorizacion } from '../../../../client/shared/models/autorizacion.model';
import { Parameter } from '../../../../../shared/models/parameter/parameter';
import { Prepayroll } from '../../../models/prepayroll/prepayroll.model';
import { PrepayrollPayment } from '../../../models/prepayroll/prepayroll-payment.model';

@Component({
  selector: 'app-prepayroll-resultado-visa',
  templateUrl: './prepayroll-resultado-visa.component.html',
  styleUrls: ['./prepayroll-resultado-visa.component.css'],
})
export class PrePayrollResultadoVisaComponent implements OnInit, OnDestroy {
  bLoading = true;
  bAutorizado = false;
  usuario: any;
  sessionToken = '';
  transactionToken = '';
  preplanilla: Prepayroll;
  resultado = new VisaResult();
  downloadPdfUrl = '';
  banco = '';
  cuentaBancaria = '';
  preplanillaId = 0;
  messageinfo: string;
  @ViewChild('childModal', { static: true }) childModal: ModalDirective;
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private utilityService: UtilityService,
    private visaService: VisaService,
    private prepayrollService: PrepayrollService
  ) {}

  ngOnInit() {
    this.initComponent();
  }

  ngOnDestroy() {
    sessionStorage.removeItem('pago');
  }

  initComponent() {
    const infoPrePlanilla = JSON.parse(sessionStorage.getItem('pago'));

    if (infoPrePlanilla !== null) {
      const vResult = <VisaResult>infoPrePlanilla;
      this.downloadPdfUrl = `${AppConfig.PD_API}/pago/DownloadCustomerPdf/${vResult.pdfID}`;
      this.bAutorizado = vResult.aprobado;
      this.resultado = vResult;
      this.bLoading = false;
      return;
    }

    const usuarioSesion = localStorage.getItem('currentUser');

    if (usuarioSesion != null) {
      this.usuario = JSON.parse(usuarioSesion);
    }

    const sessionTransactionKey = this.route.snapshot.paramMap.get('key') || '';

    if (sessionTransactionKey !== '') {
      this.transactionToken = sessionTransactionKey;

      const sessionSessionToken = sessionStorage.getItem('sessionToken');

      // console.log(sessionSessionToken);
      if (sessionSessionToken !== null) {
        this.sessionToken = sessionSessionToken;
      }
    }

    this.obtenerBanco();
  }

  private obtenerBanco() {
    const filter = new Parameter(
      'PLATAFORMA_DIGITAL',
      'MODULE_PAYROLL',
      'VISANET_SOLES_BANCO',
      '0',
      ''
    );

    this.utilityService.getParameter(filter).subscribe(
      (res) => {
        // console.log(res);
        this.banco = (<Parameter>res).outsvalue;
        this.obtenerCuentaBancaria();
      },
      (err) => {
        console.log(err);
      }
    );
  }

  private obtenerCuentaBancaria() {
    const filter = new Parameter(
      'PLATAFORMA_DIGITAL',
      'MODULE_PAYROLL',
      'VISANET_SOLES_CUENTA',
      '0',
      ''
    );

    this.utilityService.getParameter(filter).subscribe(
      (res) => {
        this.cuentaBancaria = (<Parameter>res).outsvalue;
        this.autorizarTransaccion();
      },
      (err) => {
        console.log(err);
      }
    );
  }

  autorizarTransaccion() {
    // this.bLoading = false;
    // this.bAutorizado = true;

    const cliente = new Cliente();

    cliente.p_SCANAL = this.usuario.desCanal;
    const RAMO = sessionStorage.getItem('P_NBRANCH');
    const PRODUCT = sessionStorage.getItem('P_NPRODUCT');
    this.visaService
      .autorizarTransaccion(
        this.transactionToken,
        this.sessionToken,
        '', // Process Id
        this.preplanillaId, // Planilla Id
        AppConfig.FLUJO_PREPLANILLA, // Flujo Id
        this.usuario.id, // Usuario Id
        cliente
      ) // datos del Cliente
      .subscribe(
        (res) => {
          // console.log('autorizarTransaccion: ', res);
          const autorizacion = <Autorizacion>res;
          // this.bLoading = false;
          this.resultado.pdfID = res.pdf_Id;
          this.resultado.authorizedAmount = res.authorizedAmount;
          this.resultado.cardNumber = res.cardNumber;
          this.resultado.customerName = res.pdf_CustomerName;
          this.resultado.email = res.pdf_Email;
          this.resultado.orderNumber = res.orderNumber;
          this.resultado.errorMessage = res.errorMessage;
          this.resultado.fullDate = res.pdf_fullDate;
          this.resultado.fullDate = res.fullDate;
          this.resultado.phoneNumber = res.pdf_PhoneNumber;
          this.resultado.transactionDateTime = res.transactionDateTime;
          this.resultado.canal = res.pdf_Canal;
          this.resultado.aprobado = autorizacion.actionCode === '000';

          this.bAutorizado = this.resultado.aprobado;

          this.downloadPdfUrl = `${AppConfig.PD_API}/pago/DownloadCustomerPdf/${this.resultado.pdfID}`;

          sessionStorage.setItem('pago', JSON.stringify(this.resultado));

          if (this.resultado.aprobado) {
            const preplanilla = JSON.parse(
              sessionStorage.getItem('preplanilla')
            );
            preplanilla.estado = 3;
            this.registrarPreplanilla(autorizacion, preplanilla);
          } else {
            // do something
            this.bLoading = false;
          }
        },
        (err) => {
          console.log(err);
          this.bLoading = false;
        }
      );
  }

  registrarPreplanilla(autorizacion: Autorizacion, preplanilla: Prepayroll) {
    // preplanilla.autorizacionid = 555555;//autorizacion.a;
    // console.log('registro planilla');
    // console.log(autorizacion);
    // console.log(preplanilla);
    const currDay = new Date();
    const dOperacion = `${currDay.getDate()}/${
      currDay.getMonth() + 1
    }/${currDay.getFullYear()}`;
    // console.log(dOperacion);
    const detallePago = new PrepayrollPayment(
      0, // IdPayRollDetail
      1, // Currency
      preplanilla.monto, // NAMOUNT
      2, // NIDPAIDTYPE // 1: Pago Efectivo;2: Pago con Visa;3: Pago con Cupon
      +this.banco, // NBANK
      this.cuentaBancaria, // NBANKACCOUNT
      autorizacion.authorizedCode, // SOPERATIONNUMBER
      dOperacion, // DOPERATION
      'Pago por Visanet', // SREFERENCE
      '1',
      this.usuario.id,
      '', // NCURRENCYTEXT
      '', // NBANKTEXT
      '', // NBANKACCOUNTTEXT
      '', // NIDPAIDTYPETEXT
      false
    ); // SELECTED
    preplanilla.pagos = [];
    preplanilla.pagos.push(detallePago);

    // console.log(preplanilla);

    this.prepayrollService.registrar(preplanilla).subscribe(
      (response) => {
        // console.log(response);
        /*console.log(response);*/
        this.preplanillaId = response.id;
        this.bLoading = false;
        this.messageinfo = 'Se generó la Planilla Nro: ' + this.preplanillaId;
        this.childModal.show();
      },
      (err) => {
        console.error(err);
      }
    );
  }

  /*registrarPreplanilla(autorizacionId) {
    const preplanilla = JSON.parse(sessionStorage.getItem('preplanilla'));
    preplanilla.autorizacionid = autorizacionId;
    console.log(preplanilla);

    this.prepayrollService
                  .registrar(preplanilla)
                  .subscribe(
                    response => {
                      console.log(response);
                      this.preplanillaId = response.id;
                      this.bLoading = false;
                    },
                    err => {
                      console.error(err);
                    }
                  );
  }*/

  aceptarmsginfo() {
    this.childModal.hide();
    // this.router.navigate(['broker/payroll']);
  }
  irAlListado() {
    this.limpiarSessionStorage();
    this.router.navigate(['broker/prepayroll']);
  }

  limpiarSessionStorage() {
    sessionStorage.removeItem('preplanilla');
    sessionStorage.removeItem('sessionToken');
  }

  Volver() {
    this.router.navigate(['broker/prepayrolladd', 'pago', 0, 0]);
    // this.router.navigate(['broker//payrolladd/add/0/0']);
  }
}
