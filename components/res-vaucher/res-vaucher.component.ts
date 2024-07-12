import { Component, OnInit } from '@angular/core';
import { Cliente } from '../../../broker/models/cliente/cliente';
import { EmisionService } from '../../../client/shared/services/emision.service';
import { Certificado } from '../../models/certificado/certificado';
import { AppConfig } from '../../../../app.config';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { UtilsService } from '@shared/services/utils/utils.service';

@Component({
  selector: 'app-res-vaucher',
  templateUrl: './res-vaucher.component.html',
  styleUrls: ['./res-vaucher.component.css'],
})
export class ResVaucherComponent implements OnInit {
  bLoading = false;
  bAprobado = true;
  cliente: Cliente;
  certificado: Certificado;
  Modalidad: any;
  numeroPoliza = 0;
  constructor(
    private emisionService: EmisionService,
    private spinner: NgxSpinnerService,
    private router: Router,
    private readonly utilsService: UtilsService
  ) {}

  ngOnInit() {
    sessionStorage.setItem('pagefrom', 'LastStepComponent');
    const clienteSesion = sessionStorage.getItem('contratante');
    this.numeroPoliza = +sessionStorage.getItem('processResult');
    if (clienteSesion !== null) {
      this.cliente = JSON.parse(clienteSesion);
    }

    const certificadoSession = this.utilsService.decryptStorage('certificado');

    if (certificadoSession !== null) {
      this.certificado = certificadoSession;
      // console.log(this.certificado);
    }

    this.Modalidad = JSON.parse(sessionStorage.getItem('Modalidad'));

    this.limpiarSessionStorage();
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

  limpiarSessionStorage() {
    sessionStorage.removeItem('placa');
    sessionStorage.removeItem('auto');
    sessionStorage.removeItem('contratante');
    sessionStorage.removeItem('certificado');
    sessionStorage.removeItem('acept-terms-stepall');
  }

  IrPlaca(): void {
    this.limpiarSessionStorage();
    this.router.navigate(['broker/stepAll']);
  }

  // descargarConstanciaSOAT() {
  //   window.open(environment.backendapi + "/Ecommerce/soat/constancia/" + this.numeroPoliza, '_blank');
  // }

  descargarConstanciaSOAT() {
    this.spinner.show();
    const numeroPoliza = +this.numeroPoliza;

    if (this.numeroPoliza) {
      if (numeroPoliza.toString().substr(0, 1) === '7') {
        this.emisionService.generarPolizaDigitalPdf(numeroPoliza).subscribe(
          (res) => {
            this.downloadDigitalPdf(res);
            this.disableSpinner();
          },
          (err) => {
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
}
