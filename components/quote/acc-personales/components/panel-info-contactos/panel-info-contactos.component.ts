import { AddContactComponent } from './../../../../../modal/add-contact/add-contact.component';
import { Component, Input, OnInit, OnChanges, Output, EventEmitter } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import swal from 'sweetalert2';
import { ClientInformationService } from '../../../../../services/shared/client-information.service';
import { UtilService } from '../../core/services/util.service';
import { AccPersonalesConstants } from '../../core/constants/acc-personales.constants';

@Component({
    selector: 'panel-info-contactos',
    templateUrl: './panel-info-contactos.component.html',
    styleUrls: ['./panel-info-contactos.component.css'],
})
export class PanelInfoContactosComponent implements OnInit, OnChanges {
    @Input() detail: boolean;
    @Input() contactos: any;
    @Output() contactosChange: EventEmitter<any> = new EventEmitter();
    @Input() contratante: any = {};

    contacto: any = {};
    CONSTANTS: any = AccPersonalesConstants;
    modoVista = '';
    modoTrama: boolean;
    flagAdd: boolean;
    open: any = {};

    constructor(
        private route: ActivatedRoute,
        private modalService: NgbModal,
        public clientInformationService: ClientInformationService) { }

    ngOnInit() {
        this.contactos = this.contactos || [];
        if (this.route.snapshot.data.esEvaluacion === true) {
            this.modoVista = this.route.snapshot.params.mode;
            this.modoTrama = this.route.snapshot.queryParams.trama == '1';
        }
        this.detail =
            this.modoTrama === true && !this.contactos.length ? false :
                this.modoVista === this.CONSTANTS.MODO_VISTA.EVALUAR || this.modoVista === this.CONSTANTS.MODO_VISTA.COTIZA ? false :
                    this.detail;

        this.contactosChange.emit(this.contactos);
    }

    ngOnChanges(changes) {
        if (changes.contactos && changes.contactos.previousValue !== undefined) {
            this.flagAdd = (this.contratante.tipoDocumento || {}).Id !== this.CONSTANTS.TIPO_DOCUMENTO.RUC && (this.contratante.numDocumento || '').toUpperCase().substr(0, 2) == '20' ? true : !this.contactos?.length ? true : false;
            // console.log("flagAdd", this.flagAdd);
        }
    }

    clickAdd() {
        if (!this.contratante.id) {
            swal.fire('Información', 'Debe ingresar un contratante', 'error');
        } else {
            let modalRef: NgbModalRef;
            const typeContact: any = {};
            // switch (modalName) {
            // case 'add-contact':
            modalRef = this.modalService.open(AddContactComponent, { size: 'lg', backdropClass: 'light-blue-backdrop', backdrop: 'static', keyboard: false });
            modalRef.componentInstance.reference = modalRef;
            typeContact.P_NIDDOC_TYPE = this.contratante.tipoDocumento.Id;
            typeContact.P_SIDDOC = this.contratante.numDocumento;
            // let temp = this.contactos.find((o) => o.P_NTIPCONT == 8);
            // console.log(temp);
            typeContact.P_SORIGEN = this.contactos.find((o) => o.P_NTIPCONT == 8) == undefined ? 'COT' : '';
            modalRef.componentInstance.typeContact = typeContact;
            modalRef.componentInstance.listaContactos = this.contactos;
            modalRef.componentInstance.itemContacto = null;

            let countContact = this.contactos.length;
            // break;
            // }
            // this.open.contacto = true;
            modalRef.result.then((contactos) => {
                // if (countContact < this.contactos.length) {
                //     this.flagAdd = false;
                // }
                // this.brokers.push(brokerData);
            });
        }
    }

    clickEdit(item) {
        let index = this.contactos.indexOf(item);
        // this.contacto = UtilService.copy(this.contactos[0]);
        // this.open.contacto = true;

        let modalRef: NgbModalRef;
        const typeContact: any = {};
        // let itemContacto: any = {};
        modalRef = this.modalService.open(AddContactComponent, { size: 'lg', backdropClass: 'light-blue-backdrop', backdrop: 'static', keyboard: false });
        modalRef.componentInstance.reference = modalRef;
        typeContact.P_NIDDOC_TYPE = this.contratante.tipoDocumento.Id;
        typeContact.P_SIDDOC = this.contratante.numDocumento;
        typeContact.P_SORIGEN = item.P_NTIPCONT == 8 ? 'COT' : '';
        modalRef.componentInstance.typeContact = typeContact;
        const itemContacto = this.contactos[index];

        // this.contactos.map(function (dato) {
        //   if (dato.P_NROW === row) {
        //   }
        // });
        modalRef.componentInstance.itemContacto = itemContacto;
        modalRef.componentInstance.listaContactos = this.contactos;
    }

    clickDelete(item) {
        swal.fire({
            title: 'Eliminar Contacto',
            text: '¿Estás seguro que deseas eliminar esta contacto?',
            icon: 'info',
            showCancelButton: true,
            confirmButtonText: 'Eliminar',
            cancelButtonText: 'Cancelar'
        })
            .then((result) => {
                if (result.value) {
                    let index = this.contactos.indexOf(item);
                    this.contactos.splice(index, 1);
                    this.flagAdd = true;
                }
            });
    }

    // addContacto() {
    //   this.contactos[0] = this.contacto;
    //   this.contacto = {};
    // }
}
