import { Component, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';

import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { QuotationService } from '../../../../services/quotation/quotation.service';
import { PolicyemitService } from '../../../../services/policy/policyemit.service';
import { CommonMethods } from '../../../common-methods';

import { PolicyMovementDetailsAllComponent } from '../../../policy-all/policy-movement-details-all/policy-movement-details-all.component';

import { DesgravamenDevolucionService } from '../desgravamen-devolucion.service';
import { StorageService } from '../core/services/storage.service';
import { DesgravamenDevolucionConstants } from '../core/constants/desgravamen-devolucion.constants';

import swal from 'sweetalert2';

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush, // revisar
    selector: 'desgravamen-devolucion-policies',
    templateUrl: './desgravamen-devolucion-policies.component.html',
    styleUrls: ['./desgravamen-devolucion-policies.component.css'],
})
export class DesgravamenDevolucionPoliciesComponent {
    filters: any = {};
    limpiar: any = { filtros: false };
    show: any = {};
    reload: any = {};

    polizas: any = [];
    polizasParams = {};
    polizaSeleccionada: any;
    link: string;

    CONSTANTS: any = DesgravamenDevolucionConstants;

    constructor(
        private modalService: NgbModal,
        public DesgravamenDevolucionService: DesgravamenDevolucionService,
        public storageService: StorageService,
        public quotationService: QuotationService,
        public policyemitService: PolicyemitService,
        public cdr: ChangeDetectorRef,
        private router: Router
    ) {
        this.CONSTANTS.RAMO = CommonMethods.branchXproduct(JSON.parse(localStorage.getItem('codProducto'))['productId']);
        this.link = this.CONSTANTS.RAMO == this.CONSTANTS.RAMO_COMERCIAL.DESGRAVAMEN_DEVOLUCION ? this.CONSTANTS.BASE_URL.DES : this.CONSTANTS.BASE_URL.VG;

        this.filters.contratante = {};
        this.filters.contratante = {
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

        this.polizasParams = {
            NTYPE_HIST: this.filters.tipoTransaccion.codigo,
            NBRANCH: this.CONSTANTS.RAMO, // this.filters.ramo.codigo,
            NPRODUCT: this.filters.producto.codigo, //(this.filters.ramo || {}).COD_PRODUCT || '',
            NPOLICY: this.filters.numPoliza || null,

            NTYPE_DOC: (this.filters.contratante.tipoDocumento || {}).Id || '',
            SIDDOC: this.filters.contratante.numDocumento || '',
            SFIRSTNAME: this.filters.contratante.nombres || '',
            SLASTNAME: this.filters.contratante.apellidoPaterno || '',
            SLASTNAME2: this.filters.contratante.apellidoMaterno || '',
            SLEGALNAME: this.filters.contratante.razonSocial || '',

            DINI: CommonMethods.formatDate(this.filters.fechaDesde) || '',
            DFIN: CommonMethods.formatDate(this.filters.fechaHasta) || '',
            NUSERCODE: this.storageService.userId,
        };

        this.reload.cotizaciones = true;
    }

    async clickExcel() {
        let msgValidate = this.getValidations();

        if (msgValidate != '') {
            swal.fire('Información', msgValidate, 'error');
            return;
        }

        this.polizasParams = {
            NTYPE_HIST: this.filters.tipoTransaccion.codigo,
            NBRANCH: this.CONSTANTS.RAMO, // this.filters.ramo.codigo,
            NPRODUCT: this.filters.producto.codigo, //(this.filters.ramo || {}).COD_PRODUCT || '',
            NPOLICY: this.filters.numPoliza || null,

            NTYPE_DOC: (this.filters.contratante.tipoDocumento || {}).Id || '',
            SIDDOC: this.filters.contratante.numDocumento || '',
            SFIRSTNAME: this.filters.contratante.nombres || '',
            SLASTNAME: this.filters.contratante.apellidoPaterno || '',
            SLASTNAME2: this.filters.contratante.apellidoMaterno || '',
            SLEGALNAME: this.filters.contratante.razonSocial || '',

            DINI: CommonMethods.formatDate(this.filters.fechaDesde) || '',
            DFIN: CommonMethods.formatDate(this.filters.fechaHasta) || '',
            NUSERCODE: this.storageService.userId,
        };

        await this.getInfo();
        this.cdr.detectChanges();
    }

    async getInfo() {
        this.show.loader = true;

        await this.policyemitService.GetPolicyTransAllListExcel(this.polizasParams).toPromise()
            .then((res: any) => {
                if (res == "") {
                    swal.fire('Información', "Error al descargar Excel o no se encontraron resultados", 'error');
                } else {
                    const blob = this.b64toBlob(res);
                    const blobUrl = URL.createObjectURL(blob);
                    let a = document.createElement("a")
                    a.href = blobUrl
                    a.download = "Reporte de pólizas.xlsx"
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

    openMovimientos(poliza) {
        const modalRef = this.modalService.open(PolicyMovementDetailsAllComponent, {
            size: 'lg',
            windowClass: 'modalCustom',
            backdropClass: 'light-blue-backdrop',
            backdrop: 'static',
            keyboard: false,
        });
        modalRef.componentInstance.reference = modalRef;
        modalRef.componentInstance.itemTransaccionList = this.polizas;
        modalRef.componentInstance.NBRANCH = poliza.NBRANCH;
        modalRef.componentInstance.NPRODUCT = poliza.NPRODUCT;
        modalRef.componentInstance.NPOLICY = poliza.NPOLIZA;

        modalRef.componentInstance.SBRANCH = poliza.SRAMO;
        modalRef.componentInstance.SPRODUCT = poliza.SPRODUCTO;
        modalRef.componentInstance.SCONTRATANTE = poliza.SCONTRATANTE;
    }

    verificarPolizas() {
        this.polizas.forEach((poliza) => {
            poliza.showFile =
                poliza.NFLAG_TRAMA == this.CONSTANTS.FLAG_TRAMA.SIN_TRAMA;
        });
    }

    clickDetail(cotizacion) {
        this.router.navigate(
            [
                '/extranet/' + this.link + '/evaluacion-cotizacion/' +
                cotizacion.NID_COTIZACION +
                '/Visualizar',
            ],
            { queryParams: { trama: '1' } }
        );
    }

    clickTransac(nTransacc: any, modoVista: any) {
        if (this.polizaSeleccionada == undefined) {
            swal.fire('Información', 'Primero deberá seleccionar una póliza', 'info');
            return;
        }
        this.policyemitService
            .valTransactionPolicy(this.polizaSeleccionada.NID_COTIZACION)
            .subscribe((res) => {
                if (res.P_COD_ERR == '0') {
                    // if(this.polizaSeleccionada.NTIP_RENOV == this.polizaSeleccionada.NPAYFREQ && nTransacc == 8 || this.polizaSeleccionada.NTIP_RENOV == 6 && nTransacc == 8){
                    //swal.fire('Información', 'Endoso no permitido', 'error');
                    //} else{
                    if (
                        this.polizaSeleccionada.NFLAG_TRAMA ==
                        DesgravamenDevolucionConstants.FLAG_TRAMA.SIN_TRAMA
                    ) {
                        swal.fire('Información', 'Primero deberá adjuntar trama', 'error');
                    } else {
                        const data: any = {};
                        data.NBRANCH = this.polizaSeleccionada.NBRANCH;
                        data.NPRODUCT = this.polizaSeleccionada.NPRODUCT;
                        data.NPOLICY = this.polizaSeleccionada.NPOLIZA;
                        data.NID_COTIZACION = this.polizaSeleccionada.NID_COTIZACION;
                        data.NTYPE_TRANSAC = nTransacc;

                        this.policyemitService
                            .ValidatePolicyRenov(data)
                            .subscribe((res) => {
                                if (Number(res.P_NCODE) === 0) {
                                    this.router.navigate([
                                        '/extranet/' + this.link + '/evaluacion-poliza/' +
                                        this.polizaSeleccionada.NID_COTIZACION +
                                        '/' +
                                        modoVista,
                                    ]);
                                } else {
                                    swal.fire('Información', res.P_SMESSAGE, 'error');
                                    console.log(res);
                                }
                            });
                    }
                } else {
                    swal
                        .fire({
                            title: 'Información',
                            text: res.P_MESSAGE,
                            icon: 'error',
                            confirmButtonText: 'OK',
                            allowOutsideClick: false,
                        })
                        .then((result) => {
                            if (result.value) {
                                return;
                            }
                        });
                }
            });
    }
    getValidations(): any {
        let msg = '';

        if (
            !!this.filters.contratante.tipoDocumento &&
            !!this.filters.contratante.numDocumento &&
            this.filters.contratante.numDocumento.trim().length > 0
        ) {
            if (
                this.filters.contratante.tipoDocumento.Id === 1 &&
                CommonMethods.validateRucAP(this.filters.contratante.numDocumento)
            ) {
                msg += 'El número de RUC del contratante no es válido <br>';
            }
            if (
                this.filters.contratante.tipoDocumento.Id === 2 &&
                CommonMethods.validateDNI(this.filters.contratante.numDocumento)
            ) {
                msg += 'El número de DNI del contratante no es válido <br>';
            }
            if (
                this.filters.contratante.tipoDocumento.Id === 4 &&
                CommonMethods.validateCE(this.filters.contratante.numDocumento)
            ) {
                msg += 'El número de CE del contratante no es válido <br>';
            }
            if (
                this.filters.contratante.tipoDocumento.Id === 6 &&
                CommonMethods.validatePass(this.filters.contratante.numDocumento)
            ) {
                msg += 'El número de PASAPORTE del contratante no es válido <br>';
            }
        }

        return msg;
    }
}
