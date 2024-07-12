// import { Component, OnInit, ComponentFactoryResolver, ViewContainerRef } from '@angular/core';
import { Component, OnInit, Input, ViewContainerRef, ComponentFactoryResolver, ViewChild, ChangeDetectorRef } from '@angular/core';
import { VisaService } from '../../../../shared/services/pago/visa.service';
import { ButtonVisaComponent } from '../../../../shared/components/button-visa/button-visa.component';
import { AppConfig } from '../../../../app.config';
import { GenerarCip } from '../../../client/shared/models/generar-cip.model';
import { Auto } from '../../../client/shared/models/auto.model';
import { SessionToken } from '../../../client/shared/models/session-token.model';
import { FrameComponent } from '../../../../shared/components/frame/frame.component';
import { PolicyemitService } from '../../services/policy/policyemit.service';
import { ActivatedRoute, Route, Router } from '@angular/router';
import swal from 'sweetalert2';

@Component({
  selector: 'app-methods-payment',
  templateUrl: './methods-payment.component.html',
  styleUrls: ['./methods-payment.component.css']
})
export class MethodsPaymentComponent implements OnInit {
  @Input() public formModalReference: any;
  @Input() public configData: any;

  isLoading = false;
  @ViewChild('modalResultadoPE', { static: true }) modalResultado;

  constructor(
    public cd: ChangeDetectorRef,
    private route: ActivatedRoute,
    private router: Router,
    private policyService: PolicyemitService,
    private appConfig: AppConfig,
    private visaService: VisaService,
    private factoryResolver: ComponentFactoryResolver,
    private viewContainerRef: ViewContainerRef) { }

  ngOnInit() {
    console.log(this.configData.emitQuotation);

  }

  manageOperation(process: number) {
    switch (process) {
      case 1:
        swal.fire('Información', 'visa', 'success');
        break;
      case 2:
        swal.fire('Información', 'pago efectivo', 'success');
        break;
      case 3:
        this.emitPolicy();
        break;
    }
  }

  emitPolicy() {
    this.policyService.savePolicyEmit(this.configData.emitQuotation).toPromise().then(
      res => {
        console.log(res);
        if (Number(res.P_COD_ERR) === 0) {
          swal.fire('Información', 'Se ha generado correctamente la póliza Covid N° ' + res.P_POL_COVID, 'success');
          this.finalizar(false);
        } else {
          swal.fire('Información', res.P_MESSAGE, 'error');
          this.finalizar(false);
        }
      });
  }

  finalizar(value) {
    this.formModalReference.close();
    this.modalResultado.hide();

    if (value) {
      swal.fire('Información', this.configData.textOmitir, 'success');
    }
  }
}
