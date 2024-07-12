import { Component, Input, OnChanges, Output, EventEmitter, ViewChild, TemplateRef } from '@angular/core';

import { BsModalService } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { AccPersonalesConstants } from '../../core/constants/acc-personales.constants';
import { AppConfig } from './../../../../../../../app.config';

@Component({
  selector: 'panel-modal',
  templateUrl: './panel-modal.component.html',
  styleUrls: ['./panel-modal.component.css'],
})
export class PanelModalComponent implements OnChanges {

  @Input() title: string;
  @Input() size: string;
  @Input() disabled: boolean;

  @Input() btnConfirmLabel: string;
  @Input() btnConfirmIcon: string;

  @Input() btnCancelLabel: string;
  @Input() btnCancelIcon: string;

  @Input() classModal: string;
  @Input() classHeader: string;
  @Input() classBody: string;
  @Input() classFooter: string;
  @Input() classTitle: string;

  @Input() templateBody: any;
  @Input() templateFooterAntes: any;
  @Input() templateFooterDespues: any;
  @Input() tipoPago: any;
  @Input() visaDisabled: any;

  @Input() open: boolean;
  @Output() openChange: EventEmitter<boolean> = new EventEmitter();

  @Input() close: boolean;
  @Output() closeChange: EventEmitter<boolean> = new EventEmitter();

  @Output() clickConfirm: EventEmitter<any> = new EventEmitter();
  @Output() clickCancel: EventEmitter<any> = new EventEmitter();

  @Input() cotizacion: any;

  @ViewChild('modal', { static: true }) public modal: TemplateRef<any>;
  public modalRef: BsModalRef;

  CONSTANTS: any = AccPersonalesConstants;
  opened: boolean;
  confirmar: boolean;

  constructor(
    private modalService: BsModalService,
    private readonly appConfig: AppConfig,
  ) { }

  ngOnChanges(changes) {
    if (!!this.cotizacion && this.cotizacion.cerrarModal) {
      this.hideModal();
    }

    if (changes.open && changes.open.currentValue) {
      setTimeout(() => { this.openChange.emit(false); });
      this.showModal();
    }
    if (changes.close && changes.close.currentValue) {
      setTimeout(() => { this.closeChange.emit(false); });
      this.hideModal();
    }


    if (!!this.visaDisabled) {
      if (this.visaDisabled === this.CONSTANTS.PAGO_ELEGIDO.VOUCHER) {
        this.confirmar = false;
      } else {
        this.confirmar = true;
      }
    } else {
      this.confirmar = false;
    }

  }

  showModal() {
    if (!this.opened) {
      this.modalRef = this.modalService.show(this.modal, {
        class: 'panel-modal modal-' + (this.size || 'lg') + ' ' + (this.classModal || ''),
        backdrop: 'static',
        keyboard: false,
        ignoreBackdropClick: true,
      });
      this.opened = true;
    }
  }

  hideModal(isClickInCancel?) {
    if (this.opened) {
      if (this.modalRef && this.modalRef.hide) {
        this.modalRef.hide();
        this.modalRef = null;
      }

      if (isClickInCancel === true) {
        this.clickCancel.emit();
      }

      this.opened = false;
    }
  }

  confirm() {
    this.clickConfirm.emit();
    this.hideModal();
  }

  omitirClick() {
    this.hideModal(true);

    if (!!this.tipoPago) {
      this.cotizacion.poliza.pagoElegido = 'omitir';
      this.clickConfirm.emit();
    }
  }
}
