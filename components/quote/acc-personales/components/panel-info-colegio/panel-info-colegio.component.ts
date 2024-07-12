import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import swal from 'sweetalert2';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { SearchSchoolComponent } from './../../../../../modal/search-school/search-school.component';
// import { SearchBrokerComponent } from '../../../../../modal/search-broker/search-broker.component';
import { StorageService } from '../../core/services/storage.service';
import { AccPersonalesConstants } from '../../core/constants/acc-personales.constants';
import { AccPersonalesService } from '../../acc-personales.service';
import { ClientInformationService } from '../../../../../services/shared/client-information.service';

@Component({
    selector: 'panel-info-colegio',
    templateUrl: './panel-info-colegio.component.html',
    styleUrls: ['./panel-info-colegio.component.css'],
})
export class PanelInfoColegioComponent implements OnInit {
    @Input() detail: boolean;
    @Input() vista: any;
    @Input() colegios: any = [];
    // @Input() brokersEndoso: any = [];
    @Output() colegioChange: EventEmitter<any> = new EventEmitter();
    @Input() initialize: boolean;
    proponerComision: boolean;
    // brokersEliminados: any = [];
    // @Input() brokersOriginales: any = [];
    CONSTANTS: any = AccPersonalesConstants;
    comisionDefault: any;

    constructor(
        private modal: NgbModal,
        public storageService: StorageService,
        public clientInformationService: ClientInformationService,
        public accPersonalesService: AccPersonalesService
    ) { }

    ngOnInit() {
        this.colegios = this.colegios || [];
        this.detail = this.detail || false;
        this.colegioChange.emit(this.colegios);
    }

    clickAdd() {
        const modalRef = this.modal.open(
            SearchSchoolComponent, {
            size: 'lg',
            backdropClass: 'light-blue-backdrop',
            backdrop: 'static',
            keyboard: false
        });

        modalRef.componentInstance.formModalReference = modalRef;
        modalRef.componentInstance.listColegios = null;

        modalRef.result.then(async (dataColegio) => {
            if (dataColegio !== undefined) {

                console.log(dataColegio);
                let colegio: any = {}
                colegio.sclient = dataColegio.P_SCLIENT;
                colegio.tipDoc = dataColegio.P_NIDDOC_TYPE;
                colegio.document = dataColegio.P_SIDDOC;
                colegio.legalName = dataColegio.P_SLEGALNAME;
                this.colegios.push(colegio);
                this.colegioChange.emit(this.colegios);
            }
        }, (reason) => {
        });
    }

    clickDelete(colegio) {
        swal
            .fire({
                title: 'Eliminar Colegio',
                text: '¿Estás seguro que deseas eliminar este colegio?',
                icon: 'info',
                showCancelButton: true,
                confirmButtonText: 'Eliminar',
                allowOutsideClick: false,
                cancelButtonText: 'Cancelar',
            })
            .then((result) => {
                if (result.value) {
                    let index = this.colegios.indexOf(colegio);
                    this.colegios.splice(index, 1);
                }

                this.colegioChange.emit(this.colegios);
            });
    }
}
