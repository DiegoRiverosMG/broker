import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { ActivatedRoute, Router } from '@angular/router';
import { VisaService } from '../../../../shared/services/pago/visa.service';
import { AppConfig } from '../../../../app.config';
import { PayrollService } from '../../services/payroll/payroll.service';
import { PayrollCab } from '../../models/payroll/payrollcab';
import { PayrollPayment } from '../../models/payroll/payrollpayment';
import { Autorizacion } from '../../../client/shared/models/autorizacion.model';
import { Parameter } from '../../../../shared/models/parameter/parameter';
import { UtilityService } from '../../../../shared/services/general/utility.service';
import { VisaResult } from '../../models/visaresult/visaresult';
import { Cliente } from '../../models/cliente/cliente';
import { EventStrings } from '../../shared/events/events';
import { EmisionService } from '../../../client/shared/services/emision.service';
import { KushkiService } from '../../../../shared/services/kushki/kushki.service';

@Component({
  selector: 'app-payroll-resultado-visa',
  templateUrl: './payroll-resultado-visa.component.html',
  styleUrls: ['./payroll-resultado-visa.component.css'],
})
export class PayrollResultadoVisaComponent implements OnInit, OnDestroy {
  bLoading = true;
  bAutorizado = false;
  bshowreport = false;
  banco = '';
  cuentaBancaria = '';
  usuario;
  planilla: PayrollCab;
  sessionToken = '';
  transactionToken = '';
  public result: any = {};
  messageinfo: string;
  @ViewChild('childModal', { static: true }) childModal: ModalDirective;

  resultado = new VisaResult();
  downloadPdfUrl = '';
  isPaymentKushki: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private visaService: VisaService,
    private planillaService: PayrollService,
    private utilityService: UtilityService,
    private emissionService: EmisionService,
    private readonly kushkiService: KushkiService
  ) {
  }

  ngOnInit() {
    this.initComponent();
  }

  ngOnDestroy() {
    sessionStorage.removeItem('infoPago');
    sessionStorage.removeItem('kushki-payload-planilla');
  }

  initComponent() {
    const infoPlanilla = JSON.parse(sessionStorage.getItem('infoPago'));

    if (infoPlanilla !== null) {
      console.log(infoPlanilla);
      const vResult = <VisaResult>infoPlanilla;
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

      const sessionPlanilla = JSON.parse(sessionStorage.getItem('planilla'));

      // console.log(sessionPlanilla);
      if (sessionPlanilla !== null) {
        this.planilla = sessionPlanilla;
      }

      this.obtenerBanco();
    }
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
        // console.log(res);
        this.cuentaBancaria = (<Parameter>res).outsvalue;

        const resKushki = JSON.parse(
          sessionStorage.getItem('kushki-payload-planilla')
        );

        if (resKushki) {
          this.processPayKushki(resKushki);
          this.isPaymentKushki = true;
          return;
        }

        this.autorizarTransaccion();
      },
      (err) => {
        console.log(err);
      }
    );
  }

  processPayKushki(payload) {
    console.log(payload);
    this.kushkiService.processPayKushki(payload).subscribe(
      (res) => {
        console.log(res);
        if (res.success) {
          this.bAutorizado = true;

          this.resultado = {
            ...this.resultado,
            authorizedAmount: res.primaCargo,
            cardNumber: res.numeroTarjeta,
            orderNumber: res.numeroOperacion,
            transactionDateTime: res.transactionDateTime,
            fullDate: res.fullDate,
            email: payload.correo,
            phoneNumber: payload.telefono,
            customerName: payload.nombres,
            id: res.idProceso,
            description: 'Seguro SOAT',
            quantity: 1,
            producto: 'Planillas Broker',
            errorMessage: res.message,
          };

          const planilla = JSON.parse(sessionStorage.getItem('planilla'));

          this.registrarPlanillaDetallePago(
            this.resultado.orderNumber,
            planilla
          );
        } else {
          this.bAutorizado = false;
          this.resultado.errorMessage = res.message;
        }
        this.bLoading = false;
      },
      (err) => {
        console.log(err);
      }
    );
  }

  autorizarTransaccion() {
    const cliente = new Cliente();
    const sessionVisa = JSON.parse(sessionStorage.getItem('idSessionToken'));
    cliente.p_SCANAL = this.usuario.desCanal;
    this.visaService
        .autorizarTransaccion(
          this.transactionToken,
          this.sessionToken,
          '',
          sessionVisa,
          AppConfig.FLUJO_PLANILLA,
          this.usuario.id,
          cliente
        )
        .subscribe(
          (res) => {
            const autorizacion = <Autorizacion>res;
            this.isPaymentKushki = false;
            this.bLoading = false;

            this.resultado.pdfID = res.pdf_Id;
            this.resultado.authorizedAmount = res.authorizedAmount;
            this.resultado.cardNumber = res.cardNumber;
            this.resultado.customerName = res.pdf_CustomerName;
            this.resultado.email = res.pdf_Email;
            this.resultado.fullDate = res.pdf_fullDate;
            this.resultado.orderNumber = res.orderNumber;
            this.resultado.phoneNumber = res.pdf_PhoneNumber;
            this.resultado.errorMessage = res.errorMessage;
            this.resultado.fullDate = res.fullDate;
            this.resultado.transactionDateTime = res.transactionDateTime;
            this.resultado.canal = res.pdf_Canal;
            this.resultado.aprobado = autorizacion.actionCode === '000';
            this.resultado.quantity = 1;
            this.resultado.producto = 'Planillas Broker';

            this.bAutorizado = this.resultado.aprobado;

            this.downloadPdfUrl = `${AppConfig.PD_API}/pago/DownloadCustomerPdf/${this.resultado.pdfID}`;

            sessionStorage.setItem('infoPago', JSON.stringify(this.resultado));

            if (this.resultado.aprobado) {
              const planilla = JSON.parse(sessionStorage.getItem('planilla'));

              this.registrarPlanillaDetallePago(autorizacion.uniqueId, planilla);
            } else {
              // do something
            }
          },
          (err) => {
            console.log(err);
            this.bLoading = false;
          }
        );
  }

  aceptarmsginfo() {
    this.childModal.hide();
    // this.router.navigate(['broker/payroll']);
  }

  registrarPlanillaDetallePago(id: string, planilla: PayrollCab) {
    const currDay = new Date();
    const dOperacion = `${currDay.getDate()}/${
      currDay.getMonth() + 1
    }/${currDay.getFullYear()}`;
    // console.log(dOperacion);
    const detallePago = new PayrollPayment(
      0, // IdPayRollDetail
      1, // Currency
      planilla.NAMOUNTTOTAL, // NAMOUNT
      this.isPaymentKushki ? 8 : 2, // NIDPAIDTYPE // 1: Pago Efectivo;2: Pago con Visa;3: Pago con Cupon
      +this.banco, // NBANK
      +this.cuentaBancaria, // NBANKACCOUNT
      id, // SOPERATIONNUMBER
      dOperacion, // DOPERATION
      this.isPaymentKushki ? 'PASARELA/KUSHKI' : 'VISA', // SREFERENCE
      '1', // SSTATE
      this.usuario.id, // NUSERREGISTER
      '', // NCURRENCYTEXT
      '', // NBANKTEXT
      '', // NBANKACCOUNTTEXT
      '', // NIDPAIDTYPETEXT
      false
    ); // SELECTED

    planilla.NIDSTATE = 5; // 1: Pendiente; 2:Enviado
    planilla.LISTPAYROLLPAYMENT.push(detallePago);

    // console.log(planilla);

    this.planillaService.getPostGrabarPlanillaManual(planilla).subscribe(
      (res) => {
        console.log(res);
        this.result = res;
        if (this.planilla.NIDPAYROLL === 0) {
          this.messageinfo =
            'Se generó la Planilla Nro: ' + this.result.noutidpayroll;
          this.childModal.show();
        } else {
          this.messageinfo =
            'Se actualizó la Planilla Nro: ' + this.result.noutidpayroll;
          this.childModal.show();
        }
        this.resultado.description =
          'Generación de planilla ' + this.result.noutidpayroll;
        this.emissionService
            .registrarEvento(
              'VISA ' + this.resultado.description,
              EventStrings.PAYROLL_CREAR
            )
            .subscribe();
        this.resultado.id = this.result.noutidpayroll;
        this.bshowreport = true;
      },
      (err) => {
        console.log(err);
      }
    );
  }

  irAPlanillas() {
    this.limpiarSessionStorage();
    this.router.navigate(['broker/payroll']);
  }

  limpiarSessionStorage() {
    sessionStorage.removeItem('planilla');
    sessionStorage.removeItem('sessionToken');
    sessionStorage.removeItem('idSessionToken');
  }

  Volver() {
    this.router.navigate(['broker/payrolladd', 'pago', 0, 0]);
    // this.router.navigate(['broker//payrolladd/add/0/0']);
  }
}
