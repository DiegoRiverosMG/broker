import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

import swal from 'sweetalert2';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { QuotationService } from '../../../../../services/quotation/quotation.service';
import { CobranzasService } from '../../../../../services/cobranzas/cobranzas.service';
import { FilePickerComponent } from '../../../../../modal/file-picker/file-picker.component';

import { DesgravamenDevolucionService } from '../../desgravamen-devolucion.service';
import { StorageService } from '../../core/services/storage.service';
import { FileService } from '../../core/services/file.service';
import { DesgravamenDevolucionConstants } from '../../core/constants/desgravamen-devolucion.constants';

@Component({
  selector: 'panel-info-exclusion',
  templateUrl: './panel-info-exclusion.component.html',
  styleUrls: ['./panel-info-exclusion.component.css']
})
export class PanelInfoExclusionComponent implements OnInit {
  @Input() detail: boolean;
  @Input() cotizacion: any;
  @Input() isLoading: boolean;
  @Output() isLoadingChange: EventEmitter<any> = new EventEmitter();
  @Input() recargar: any;
  @Output() recargarChange: EventEmitter<any> = new EventEmitter();

  CONSTANTS: any = DesgravamenDevolucionConstants;

  filtroEstados: any;

  constructor(
    private ngbModal: NgbModal,
    public DesgravamenDevolucionService: DesgravamenDevolucionService,
    public storageService: StorageService,
    private cobranzasService: CobranzasService,
    public quotationService: QuotationService,
    public fileService: FileService) { }

  ngOnInit() {
    this.cotizacion.estadoDeuda = 'DEUDA';
    this.cotizacion.montoDeuda = 0;

  }

  hola (){

    this.recargarChange.emit(true)
  }






}
