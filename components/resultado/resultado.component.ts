import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { EmisionService } from '../../../client/shared/services/emision.service';
import { VisaService } from '../../../../shared/services/pago/visa.service';
import { Cliente } from '../../../broker/models/cliente/cliente';
import { Autorizacion } from '../../../client/shared/models/autorizacion.model';
import { AppConfig } from '../../../../app.config';
import { Certificado } from '../../models/certificado/certificado';
import { VisaResult } from '../../models/visaresult/visaresult';
import { Contratante } from '../../../client/shared/models/contratante.model';
import { EventStrings } from '../../shared/events/events';
import { UtilsService } from '@shared/services/utils/utils.service';
import { KushkiService } from '../../../../shared/services/kushki/kushki.service';
import moment from 'moment';

@Component({
  selector: 'app-resultado',
  templateUrl: './resultado.component.html',
  styleUrls: ['./resultado.component.css'],
})
export class ResultadoComponent implements OnInit, OnDestroy {
  bLoading = true;
  bAprobado = false;
  cliente: Cliente;
  certificado: Certificado;
  autorizacion = new Autorizacion();
  resultado = new VisaResult();
  downloadPdfUrl = '';

  constructor(
    private route: ActivatedRoute,
    private emisionService: EmisionService,
    private visaService: VisaService,
    private readonly appConfig: AppConfig,
    private router: Router,
    private readonly utilsService: UtilsService,
    private readonly kushkiService: KushkiService
  ) {}

  ngOnInit() {
    window.scrollTo(0, 0);
    this.initComponent();
    // this.limpiarSessionStorage();
  }

  ngOnDestroy() {
    // destroy objects
    sessionStorage.removeItem('infoPago');
  }

  initComponent() {
    sessionStorage.setItem('pagefrom', 'LastStepComponent');
    const infoPago = JSON.parse(sessionStorage.getItem('infoPago'));
    const autoSession = JSON.parse(sessionStorage.getItem('auto'));
    const transactionKey = this.route.snapshot.paramMap.get('key') || '';
    const clienteSesion = sessionStorage.getItem('contratante');
    const resKushki = JSON.parse(sessionStorage.getItem('kushki-payload'));

    if (infoPago !== null) {
      this.bLoading = false;
      this.resultado = <VisaResult>infoPago;
      this.bAprobado = this.resultado.aprobado;
      this.downloadPdfUrl = `${AppConfig.PD_API}/pago/DownloadCustomerPdf/${this.resultado.pdfID}`;

      return;
    }

    if (clienteSesion !== null) {
      this.cliente = JSON.parse(clienteSesion);
    }

    const certificadoSession = this.utilsService.decryptStorage('certificado');

    if (certificadoSession !== null) {
      this.certificado = certificadoSession;
    }

    if (transactionKey !== '') {
      if (resKushki) {
        this.emissionProcessKushki(resKushki);
        return;
      }

      this.emissionProcessCompletePolicy(transactionKey);
    }
  }

  emissionProcessCompletePolicy(transactionKey) {
    const canal = sessionStorage.getItem('canalVentaCliente');
    const puntoDeVenta = sessionStorage.getItem('puntoVentaCliente');
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const visasession = JSON.parse(sessionStorage.getItem('visasession'));
    const contratante = new Contratante();
    contratante.p_SCLIENT_NAME = this.cliente.p_SCLIENT_NAME;
    contratante.p_SCLIENT_APPPAT = this.cliente.p_SCLIENT_APPPAT;
    contratante.p_SCLIENT_APPMAT = this.cliente.p_SCLIENT_APPMAT;
    contratante.p_SLEGALNAME = this.cliente.p_SLEGALNAME;
    contratante.p_SMAIL = this.cliente.p_SMAIL;
    contratante.p_NPERSON_TYP = this.cliente.p_NPERSON_TYP;

    this.emisionService
      .emissionProcessCompletePolicy(
        transactionKey,
        visasession.sessionToken,
        this.cliente.p_NIDPROCESS,
        '',
        AppConfig.FLUJO_BROKER, // Constante
        currentUser.id,
        '1',
        this.cliente.p_SCLIENT_NAME,
        `${this.cliente.p_SCLIENT_APPPAT} ${this.cliente.p_SCLIENT_APPMAT}`,
        this.cliente.p_SMAIL,
        this.certificado.P_NPREMIUM,
        contratante,
        canal,
        puntoDeVenta,
        '3'
      )
      .subscribe(
        (res) => {
          if (res.errorCode === '0') {
            this.bAprobado = true;
            this.resultado.authorizedAmount = res.authorizedAmount;
            this.resultado.cardNumber = res.cardNumber;
            this.resultado.orderNumber = res.orderNumber;
            this.resultado.transactionDateTime = res.transactionDateTime;
            this.resultado.fullDate = res.fullDate;
            this.resultado.email = res.pdf_Email;
            this.resultado.phoneNumber = res.pdf_PhoneNumber;
            this.resultado.customerName = res.pdf_CustomerName;
            this.resultado.id = this.cliente.p_NIDPROCESS;
            this.resultado.description = 'Seguro SOAT';
            this.resultado.quantity = 1;
            this.resultado.producto = 'SOAT';
            this.resultado.numPolicy = res.numPolicy;
            this.appConfig.pixelSaveClientID();
            const idClientTrack = sessionStorage.getItem('idClientTrack');

            this.emisionService
              .registrarTracking(
                this.cliente.p_NIDPROCESS,
                idClientTrack,
                this.certificado.P_NPREMIUM
              )
              .subscribe(
                (ct) => {},
                (err) => {
                  console.log(err);
                }
              );
          } else {
            if (res.errorCode === 'EMISION_VALIDATON') {
              sessionStorage.setItem('errorVisa', res.errorDesc);
              this.bAprobado = false;
              this.IrAResumen();
              return;
            }
            if (res.errorCode === 'PAGO_VALIDATON') {
              sessionStorage.setItem('errorVisa', res.errorDesc);
              this.bAprobado = false;
              this.IrAResumen();
              return;
            }
          }
          this.bLoading = false;
          this.emisionService
            .registrarEvento('', EventStrings.SOAT_RESUMEN_VISA)
            .subscribe();
        },
        (err) => {
          console.log(err);
          this.bLoading = false;
          this.bAprobado = false;
        }
      );
  }

  emissionProcessKushki(payload) {
    this.kushkiService.processEmission(payload).subscribe(
      (res) => {
        if (res.success) {
          this.bAprobado = true;
          const names =
            `${this.cliente.p_SCLIENT_NAME} ${this.cliente.p_SCLIENT_APPPAT} ${this.cliente.p_SCLIENT_APPMAT}`.trim();

          this.resultado = {
            ...this.resultado,
            authorizedAmount: res.montoAutorizado,
            cardNumber: res.numeroTarjeta,
            orderNumber: res.numeroOperacion,
            transactionDateTime: res.transactionDateTime,
            fullDate: moment().format('DD/MM/YYYY HH:mm'),
            email: this.cliente.p_SMAIL,
            phoneNumber: this.cliente.p_SPHONE,
            customerName:
              this.cliente.p_NDOCUMENT_TYP == 1
                ? this.cliente.p_SLEGALNAME
                : names,
            id: res.idProceso,
            description: 'Seguro SOAT',
            quantity: 1,
            producto: 'SOAT',
            numPolicy: res.numeroPoliza,
          };
        } else {
          this.bAprobado = false;
          sessionStorage.setItem('errorVisa', res.message);
          this.IrAResumen();
        }
        this.bLoading = false;
      },
      (err) => {
        console.log(err);
      }
    );
  }

  onImprimir() {
    this.emisionService.generarPolizaPdf(+this.certificado.P_NPOLICY).subscribe(
      (res) => {
        this.downloadPdf(res.fileName);
      },
      (err) => {
        console.log(err);
      }
    );
  }

  downloadPdf(fileName: string) {
    const url = `${AppConfig.PATH_PDF_FILES}/${fileName}`;
    const a = document.createElement('a');
    a.setAttribute('href', url);
    a.setAttribute('target', '_blank');
    a.setAttribute('style', 'display:none;');
    document.body.appendChild(a);
    a.click();
    a.remove();
  }

  IrPlaca(): void {
    this.limpiarSessionStorage();
    sessionStorage.removeItem('acept-terms-stepall');
    sessionStorage.removeItem('kushki-payload');
    this.router.navigate(['broker/stepAll']);
  }

  IrAResumen(): void {
    sessionStorage.setItem('pagefrom', 'BrokerEmissionComponent');
    this.router.navigate(['broker/step05']);
  }

  limpiarSessionStorage() {
    sessionStorage.removeItem('placa');
    sessionStorage.removeItem('auto');
    sessionStorage.removeItem('contratante');
    sessionStorage.removeItem('certificado');
  }
}
