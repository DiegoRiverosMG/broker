import { Component, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { QuotationService } from '../../../../services/quotation/quotation.service';
import { FilePickerComponent } from '../../../../modal/file-picker/file-picker.component';
import { DesgravamenDevolucionService } from '../desgravamen-devolucion.service';
import { StorageService } from '../core/services/storage.service';
import swal from 'sweetalert2';
import { DesgravamenDevolucionConstants } from '../core/constants/desgravamen-devolucion.constants';
import { CommonMethods } from '../../../common-methods';

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'desgravamen-devolucion-request',
    templateUrl: './desgravamen-devolucion-request.component.html',
})
export class DesgravamenDevolucionRequestComponent {
    filters: any = {};
    show: any = {};
    reload: any = {};
    cotizacionesParams = {};
    cotizacionSeleccionada: any;
    CONSTANTS: any = DesgravamenDevolucionConstants;


    constructor(
        public DesgravamenDevolucionService: DesgravamenDevolucionService,
        public storageService: StorageService,
        public quotationService: QuotationService,
        private modalService: NgbModal,
        public cdr: ChangeDetectorRef,
        private router: Router
    ) {
        this.CONSTANTS.RAMO = CommonMethods.branchXproduct(JSON.parse(localStorage.getItem('codProducto'))['productId']);
        this.filters.contratante = {
            tipoBusqueda: {
                codigo: 'POR_DOC'
            }
        }
        this.filters.broker = {
            tipoBusqueda: {
                codigo: 'POR_DOC'
            }
        }

    }

    clickSearch() {

        let msgValidate = this.getValidations();

        if (msgValidate != '') {
            swal.fire('Información', msgValidate, 'error');
            return;
        }

        this.cotizacionesParams = {
            ProductType: (this.filters.tipoProducto || {}).COD_PRODUCT,
            Status: (this.filters.estado || {}).Id || '',
            StartDate: this.filters.fechaDesde || '',
            EndDate: this.filters.fechaHasta || '',
            QuotationNumber: this.filters.numCotizacion || '',
            ContractorSearchMode: this.typeSearch('ContractorSearchMode'),
            ContractorDocumentType:
                (this.filters.contratante.tipoDocumento || {}).Id || '',
            ContractorDocumentNumber: this.filters.contratante.numDocumento || '',
            ContractorPaternalLastName:
                this.filters.contratante.apellidoPaterno || '',
            ContractorMaternalLastName:
                this.filters.contratante.apellidoMaterno || '',
            ContractorFirstName: this.filters.contratante.nombres || '',
            ContractorLegalName: this.filters.contratante.razonSocial || '',

            BrokerSearchMode: this.typeSearch('BrokerSearchMode'),
            BrokerDocumentType: (this.filters.broker.tipoDocumento || {}).Id || '',
            BrokerDocumentNumber: this.filters.broker.numDocumento || '',
            BrokerPaternalLastName: this.filters.broker.apellidoPaterno || '',
            BrokerMaternalLastName: this.filters.broker.apellidoMaterno || '',
            BrokerFirstName: this.filters.broker.nombres || '',
            BrokerLegalName: this.filters.broker.razonSocial || '',

            CompanyLNK: null,
            Nbranch: this.CONSTANTS.RAMO,
            User: JSON.parse(localStorage.getItem('currentUser'))['id'],
            NUSERCODE: JSON.parse(localStorage.getItem('currentUser'))['id'],
        };

        this.reload.cotizaciones = true;
    }

    async clickExcel() {

        let msgValidate = this.getValidations();

        if (msgValidate != '') {
            swal.fire('Información', msgValidate, 'error');
            return;
        }

        this.cotizacionesParams = {
            ProductType: (this.filters.tipoProducto || {}).COD_PRODUCT,
            Status: (this.filters.estado || {}).Id || '',
            StartDate: this.filters.fechaDesde || '',
            EndDate: this.filters.fechaHasta || '',
            QuotationNumber: this.filters.numCotizacion || '',
            ContractorSearchMode: this.typeSearch('ContractorSearchMode'),
            ContractorDocumentType:
                (this.filters.contratante.tipoDocumento || {}).Id || '',
            ContractorDocumentNumber: this.filters.contratante.numDocumento || '',
            ContractorPaternalLastName:
                this.filters.contratante.apellidoPaterno || '',
            ContractorMaternalLastName:
                this.filters.contratante.apellidoMaterno || '',
            ContractorFirstName: this.filters.contratante.nombres || '',
            ContractorLegalName: this.filters.contratante.razonSocial || '',

            BrokerSearchMode: this.typeSearch('BrokerSearchMode'),
            BrokerDocumentType: (this.filters.broker.tipoDocumento || {}).Id || '',
            BrokerDocumentNumber: this.filters.broker.numDocumento || '',
            BrokerPaternalLastName: this.filters.broker.apellidoPaterno || '',
            BrokerMaternalLastName: this.filters.broker.apellidoMaterno || '',
            BrokerFirstName: this.filters.broker.nombres || '',
            BrokerLegalName: this.filters.broker.razonSocial || '',

            CompanyLNK: null,
            Nbranch: this.CONSTANTS.RAMO,
            User: JSON.parse(localStorage.getItem('currentUser'))['id'],
            NUSERCODE: JSON.parse(localStorage.getItem('currentUser'))['id'],
        };

        await this.getInfo();
        this.cdr.detectChanges();
    }

    async getInfo() {
        this.show.loader = true;

        await this.quotationService.GetExcelQuotationList(this.cotizacionesParams).toPromise()
            .then((res: any) => {
                if (res == "") {
                    swal.fire('Información', "Error al descargar Excel o no se encontraron resultados", 'error');
                } else {
                    const blob = this.b64toBlob(res);
                    const blobUrl = URL.createObjectURL(blob);
                    let a = document.createElement("a")
                    a.href = blobUrl
                    a.download = "Reporte_Cotizacion.xlsx"
                    a.click()
                };
                this.show.loader = false;
            },
                err => {
                    this.show.loader = false;
                    swal.fire('Información', 'Error al descargar Excel', 'warning');
                    console.log(err);
                });
    }
    b64toBlob = (b64Data, contentType = '', sliceSize = 512) => {
        const byteCharacters = atob(b64Data);
        const byteArrays = [];

        for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
            const slice = byteCharacters.slice(offset, offset + sliceSize);

            const byteNumbers = new Array(slice.length);
            for (let i = 0; i < slice.length; i++) {
                byteNumbers[i] = slice.charCodeAt(i);
            }

            const byteArray = new Uint8Array(byteNumbers);
            byteArrays.push(byteArray);
        }

        const blob = new Blob(byteArrays, { type: contentType });
        return blob;
    }

    typeSearch(type) {
        let filtroContratante = (this.filters.contratante.tipoBusqueda || {}).codigo;
        let filtroBK = (this.filters.broker.tipoBusqueda || {}).codigo;

        if (type == 'ContractorSearchMode') {
            if (filtroContratante !== '') {
                if (
                    filtroContratante == 'POR_DOC' &&
                    !!this.filters.contratante.numDocumento
                ) {
                    return '1';
                } else {
                    if (
                        (filtroContratante == 'POR_NOM' &&
                            !!this.filters.contratante.razonSocial) ||
                        (filtroContratante == 'POR_NOM' && !!this.filters.contratante.nombres)
                    ) {
                        return '2';
                    } else {
                        return '3';
                    }
                }
            } else {
                return '3';
            }
        }

        if (type == 'BrokerSearchMode') {
            if (filtroBK !== '') {
                if (
                    filtroBK == 'POR_DOC' &&
                    !!this.filters.broker.numDocumento
                ) {
                    return '1';
                } else {
                    if (
                        (filtroBK == 'POR_NOM' &&
                            !!this.filters.broker.razonSocial) ||
                        (filtroBK == 'POR_NOM' && !!this.filters.broker.nombres)
                    ) {
                        return '2';
                    } else {
                        return '3';
                    }
                }
            } else {
                return '3';
            }

        }
    }

    validarItems(items) {
        (items || []).forEach((item) => {
            if (!item.Rutas_archivo.length) {
                item.showFile = false;
            }
        });
    }

    selectCotizacion(cotizacion) {
        this.cotizacionSeleccionada = cotizacion;
        this.show.movimientos = true;
    }

    clickDetail(cotizacion) {
        let link = this.CONSTANTS.RAMO == this.CONSTANTS.RAMO_COMERCIAL.DESGRAVAMEN_DEVOLUCION ? this.CONSTANTS.BASE_URL.DES : this.CONSTANTS.BASE_URL.VG;
        this.router.navigate([
            '/extranet/' + link + '/evaluacion-cotizacion/' +
            cotizacion.QuotationNumber +
            '/' +
            cotizacion.Mode
        ],
            { queryParams: { trx: cotizacion.TypeTransac } });
    }

    clickFile(item) {
        let fileList = item.Rutas_archivo;
        if (fileList != null && fileList.length > 0) {
            const modalRef = this.modalService.open(FilePickerComponent, {
                size: 'lg',
                backdropClass: 'light-blue-backdrop',
                backdrop: 'static',
                keyboard: false,
            });
            modalRef.componentInstance.fileList = fileList;
            modalRef.componentInstance.ngbModalRef = modalRef;
        } else {
            swal.fire('Información', 'La lista de archivos está vacía.', 'warning');
        }
    }

    getValidations(): any {
        let msg = '';

        if (!!this.filters.contratante.tipoDocumento && (!!this.filters.contratante.numDocumento && this.filters.contratante.numDocumento.trim().length > 0)) {
            if (this.filters.contratante.tipoDocumento.Id === 1 && CommonMethods.validateRucAP(this.filters.contratante.numDocumento)) {
                msg += 'El número de RUC del contratante no es válido <br>';
            }
            if (this.filters.contratante.tipoDocumento.Id === 2 && CommonMethods.validateDNI(this.filters.contratante.numDocumento)) {
                msg += 'El número de DNI del contratante no es válido <br>';
            }
            if (this.filters.contratante.tipoDocumento.Id === 4 && CommonMethods.validateCE(this.filters.contratante.numDocumento)) {
                msg += 'El número de CE del contratante no es válido <br>';
            }
            if (this.filters.contratante.tipoDocumento.Id === 6 && CommonMethods.validatePass(this.filters.contratante.numDocumento)) {
                msg += 'El número de PASAPORTE del contratante no es válido <br>';
            }
        }
        if (!!this.filters.broker.tipoDocumento && (!!this.filters.broker.numDocumento && this.filters.broker.numDocumento.trim().length > 0)) {
            if (this.filters.broker.tipoDocumento.Id === 1 && CommonMethods.validateRucAP(this.filters.broker.numDocumento)) {
                msg += 'El número de RUC del broker no es válido <br>';
            }
            if (this.filters.broker.tipoDocumento.Id === 2 && CommonMethods.validateDNI(this.filters.broker.numDocumento)) {
                msg += 'El número de DNI del broker no es válido <br>';
            }
            if (this.filters.broker.tipoDocumento.Id === 4 && CommonMethods.validateCE(this.filters.broker.numDocumento)) {
                msg += 'El número de CE del broker no es válido <br>';
            }
            if (this.filters.broker.tipoDocumento.Id === 6 && CommonMethods.validatePass(this.filters.broker.numDocumento)) {
                msg += 'El número de PASAPORTE del broker no es válido <br>';
            }
        }
        return msg;
    }
}
