import {
  Component,
  OnInit,
  ViewContainerRef,
  TemplateRef,
  ElementRef,
  ViewChild,
} from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';

import { NgxSpinnerService } from 'ngx-spinner';

import { fadeAnimation } from '@shared/animations/animations';

import { MassiveChargeService } from '@root/layout/broker/services/vida-devolucion/massive-charge/massive-charge.service';
import { UtilsService } from '@shared/services/utils/utils.service';

@Component({
  selector: 'app-massive-charge-detail',
  templateUrl: './massive-charge-detail.component.html',
  styleUrls: ['./massive-charge-detail.component.sass'],
  animations: [fadeAnimation],
})
export class MassiveChargeDetailComponent implements OnInit {
  tab: 'detail' | 'errors';
  private processId: number | null = null;
  detail$: any = null;
  messageInfo$ = null;
  private backPageForModalMessage = false;

  currentPage = 1;
  currentPageErrors = 1;

  @ViewChild('modalMessage', { static: true, read: TemplateRef })
  private modalMessage: TemplateRef<ElementRef>;

  @ViewChild('modalConfirmCharge', { static: true, read: TemplateRef })
  private modalConfirmCharge: TemplateRef<ElementRef>;

  constructor(
    private readonly router: Router,
    private readonly activatedRoute: ActivatedRoute,
    private readonly spinner: NgxSpinnerService,
    private readonly vc: ViewContainerRef,
    private readonly massiveChargeService: MassiveChargeService,
    private readonly utilsService: UtilsService
  ) {}

  ngOnInit(): void {
    this.initComponent();
  }

  // *CARGAR DATOS DE API DETALLE O DE VALIDACIONES DE TRAMA
  initComponent(): void {
    this.processId = +this.activatedRoute.snapshot.paramMap.get('id') ?? null;
    if (!this.processId) {
      const data = JSON.parse(
        sessionStorage.getItem('vdp-massive-charge-detail')
      );
      this.tab = data.errores ? 'errors' : 'detail';
      this.detail$ = {
        errors: data?.errores || [],
        detail: data.detalleProceso || [],
        processId: +(data.detalleProceso || [])[0]?.idProceso,
        canGenerate:
          !!(data.detalleProceso || []).length && !(data.errores || []).length,
        type: this.tab,
      };
      this.processId = this.detail$?.processId;
      return;
    }
    this.getDetail();
  }

  // *OBTENER DETALLE DE CARGA MASIVA
  getDetail(): void {
    if (!this.processId) {
      return;
    }
    this.spinner.show();
    this.massiveChargeService.detail(+this.processId).subscribe({
      next: (response: any) => {
        console.dir(response);
        this.detail$ = {
          ...response,
          type: 'detail',
        };
        this.tab = 'detail';
      },
      error: (error: HttpErrorResponse) => {
        console.error(error);
        this.spinner.hide();
      },
      complete: () => {
        this.spinner.hide();
      },
    });
  }

  // *ABRIR MODAL DE CONFIRMACIÓN PARA GENERAR CARGA MASIVA
  openModalConfirmCharge(): void {
    this.vc.createEmbeddedView(this.modalConfirmCharge);
  }

  // *GENERAR CARGA MASIVA
  generateMassiveCharge(): void {
    this.spinner.show();
    this.massiveChargeService
      .generateMassiveCharge(this.detail$.processId)
      .subscribe({
        next: (response: any) => {
          console.dir(response);
          let message = response.message;
          this.backPageForModalMessage = response.success;

          if (response.success) {
            message = 'Se generó correctamente la carga masiva';
          }

          this.messageInfo$ = {
            success: response.success,
            message: message,
          };

          this.vc.clear();
          this.vc.createEmbeddedView(this.modalMessage);
        },
        error: (error: HttpErrorResponse) => {
          console.error(error);
          this.backPageForModalMessage = false;
          this.spinner.hide();
        },
        complete: () => {
          this.spinner.hide();
        },
      });
  }

  // *CERRAR MODALES
  closeModals(): void {
    this.messageInfo$ = null;
    this.vc.clear();
    if (this.backPageForModalMessage) {
      this.backPage();
    }
    this.backPageForModalMessage = false;
  }

  // *RETROCEDER DE PÁGINA
  backPage(): void {
    sessionStorage.removeItem('vdp-massive-charge-detail');
    this.router.navigate(['/extranet/vidadevolucion/carga-masiva']);
  }
}
