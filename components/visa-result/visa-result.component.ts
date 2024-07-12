import { Component, OnInit, Input } from '@angular/core';
import { VisaResult } from '../../models/visaresult/visaresult';
import { AppConfig } from '../../../../app.config';
import { EmisionService } from '../../../client/shared/services/emision.service';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { environment } from '../../../../../environments/environment';

@Component({
  selector: 'app-visa-result',
  templateUrl: './visa-result.component.html',
  styleUrls: ['./visa-result.component.css']
})
export class VisaResultComponent implements OnInit {
  @Input() loading: boolean; // para mostrar el componente
  @Input() resultOK: boolean; // para mostrar el componente
  @Input() result: VisaResult; // para mostrar la información en el componente
  @Input() downloadUrl: string;
  @Input() paymentUrl: string;

  verTerminos = false;

  constructor(
    private emisionService: EmisionService,
    private spinner: NgxSpinnerService,
    private router: Router) { }

  ngOnInit() { }

  mostrarTerminosCondiciones() {
    this.verTerminos = true;
  }


  descargarVoucherNiubiz() {
    this.spinner.show();
    this.emisionService.generarVoucherDigitalPdf(this.result).subscribe(
      res => {
        this.downloadDigitalPdf(res);
      },
      err => {
        this.spinner.hide();
        console.log(err);
      }
    );
  }

  // descargarConstanciaSOAT() {
  //   window.open(environment.backendapi + "/Ecommerce/soat/constancia/" + this.result.numPolicy, '_blank');
  // }

  descargarConstanciaSOAT() {
    this.spinner.show();
    const numeroPoliza = +this.result.numPolicy;

    if (this.result.numPolicy) {
      if (numeroPoliza.toString().substr(0, 1) === '7') {
        this.emisionService.generarPolizaDigitalPdf(numeroPoliza).subscribe(
          res => {
            this.downloadDigitalPdf(res);
            this.disableSpinner();
          },
          err => {
            console.log(err);
            this.disableSpinner();
          }
        );
      }
    } else {
      this.disableSpinner();
    }
  }

  disableSpinner() {
    setTimeout(() => {
      this.spinner.hide();
    }, 500);
  }

  downloadDigitalPdf(response) {
    if (response) {
      let linkSource = 'data:application/pdf;base64,';
      linkSource += response.file;
      const a = document.createElement('a');
      a.setAttribute('href', linkSource);
      a.setAttribute('download', response.id);
      a.setAttribute('target', '_blank');
      a.setAttribute('style', 'display:none;');
      document.body.appendChild(a);
      a.click();
      a.remove();
      this.spinner.hide();
    }
  }

  nuevoPago() {
    if (this.paymentUrl) {
      this.router.navigate([this.paymentUrl]);
    }
  }

  limpiarSessionStorage() {
    sessionStorage.removeItem('placa');
    sessionStorage.removeItem('auto');
    sessionStorage.removeItem('contratante');
    sessionStorage.removeItem('certificado');
  }

  IrPlaca(): void {
    this.router.navigate(['broker/step01']);
    this.limpiarSessionStorage();
  }

}
