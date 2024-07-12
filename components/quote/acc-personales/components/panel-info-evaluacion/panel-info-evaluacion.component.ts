import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

import swal from 'sweetalert2';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { QuotationService } from '../../../../../services/quotation/quotation.service';
import { CobranzasService } from '../../../../../services/cobranzas/cobranzas.service';
import { FilePickerComponent } from '../../../../../modal/file-picker/file-picker.component';

import { AccPersonalesService } from '../../acc-personales.service';
import { StorageService } from '../../core/services/storage.service';
import { FileService } from '../../core/services/file.service';
import { AccPersonalesConstants } from '../../core/constants/acc-personales.constants';

@Component({
    selector: 'panel-info-evaluacion',
    templateUrl: './panel-info-evaluacion.component.html',
    styleUrls: ['./panel-info-evaluacion.component.css']
})
export class PanelInfoEvaluacionComponent implements OnInit {

    @Input() detail: boolean;

    @Input() cotizacion: any;

    @Input() isLoading: boolean;
    @Output() isLoadingChange: EventEmitter<any> = new EventEmitter();

    CONSTANTS: any = AccPersonalesConstants;

    filtroEstados: any;

    constructor(
        private ngbModal: NgbModal,
        public accPersonalesService: AccPersonalesService,
        public storageService: StorageService,
        private cobranzasService: CobranzasService,
        public quotationService: QuotationService,
        public fileService: FileService) { }

    ngOnInit() {
        this.verificarFiltrosEstados();
        // console.log('cotizaixon', this.cotizacion)
    }

    openFilePicker(fileList: string[]) {
        if (fileList != null && fileList.length > 0) {
            const modalRef = this.ngbModal.open(FilePickerComponent, { size: 'lg', backdropClass: 'light-blue-backdrop', backdrop: 'static', keyboard: false });
            modalRef.componentInstance.fileList = fileList;
            modalRef.componentInstance.ngbModalRef = modalRef;
        } else {
            swal.fire('Información', 'La lista de archivos está vacía.', 'warning')
        }
    }

    getTramaFile(item: any): Promise<any> {
        this.isLoadingChange.emit(true);
        const params: any = {};
        params.idMovimiento = item.linea;
        params.idCotizacion = this.cotizacion.numeroCotizacion;
        params.documentCode = 59;
        return this.cobranzasService.getTramaFile(params).toPromise().then(
            res => {
                this.isLoadingChange.emit(false);
                if (res.indEECC === 0) {
                    const nameFile: string = item.desMov + '_' + this.cotizacion.numeroCotizacion + '.xlsx';
                    this.fileService.downloadFromBase64(res.path, nameFile, 'application/vnd.ms-excel');
                }
            },
            err => {
                this.isLoadingChange.emit(false);
                swal.fire('Información', 'Error inesperado, por favor contáctese con soporte.', 'error');
            }
        );
    }

    verificarFiltrosEstados() {
        if (this.CONSTANTS.PERFIL.TECNICA == this.storageService.user.profileId) {
            this.filtroEstados = [
                this.CONSTANTS.ESTADO.APROBADO_TECNICA,
                this.CONSTANTS.ESTADO.NO_PROCEDE
            ];
        } else {
            this.filtroEstados = [
                this.CONSTANTS.ESTADO.APROBADO,
                this.CONSTANTS.ESTADO.NO_PROCEDE
            ];
        }
    }
}
