import { Component, OnInit, Input } from '@angular/core';

// Importación de servicios
import { ClientInformationService } from '../../services/shared/client-information.service';

// Importacion de modelos
import { DocumentType } from '../../models/shared/client-information/document-type';

// SweeatAlert
import swal from 'sweetalert2';
import { CommonMethods } from '../../components/common-methods';

@Component({
    selector: 'app-add-contact',
    templateUrl: './add-contact.component.html',
    styleUrls: ['./add-contact.component.css']
})
export class AddContactComponent implements OnInit {
    @Input() public reference: any;
    @Input() public listaContactos = [];

    @Input() public itemContacto = null;
    @Input() public typeContact: any = {};

    public contactTypeList = [];
    public documentTypeList: any = [];
    public txtAccion = 'Agregar Contacto';
    public inputsContact: any = {};
    public maxlength = 8;
    inputsValidate: any = {};
    codProducto = JSON.parse(localStorage.getItem('codProducto'))['productId'];

    constructor(
        private clientInformationService: ClientInformationService
    ) { }

    ngOnInit() {
        this.getDocumentTypeList();
        if (this.typeContact.P_NIDDOC_TYPE != null && this.typeContact.P_SIDDOC != '') {
            this.getContactTypeList();
        } else {
            swal.fire('Información', 'Debe ingresar Tipo documento y Nro de documento del contratante.', 'warning');
        }

        this.inputsContact.P_SORIGEN = 'SCTR';
        this.inputsContact.P_NUSERCODE = JSON.parse(localStorage.getItem('currentUser'))['id'];

        if (this.itemContacto != null) {
            this.txtAccion = 'Guardar Contacto';
            this.inputsContact.P_NROW = Number(this.itemContacto.P_NROW);
            this.inputsContact.P_DESTICONTACTO = this.itemContacto.P_DESTICONTACTO;
            this.inputsContact.P_DESTIDOCUMENTO = this.itemContacto.P_DESTIDOCUMENTO;
            this.inputsContact.P_NIDDOC_TYPE = this.itemContacto.P_NIDDOC_TYPE == null ? '0' : Number(this.itemContacto.P_NIDDOC_TYPE);
            this.inputsContact.P_NTIPCONT = this.itemContacto.P_NTIPCONT;
            this.inputsContact.P_SE_MAIL = this.itemContacto.P_SE_MAIL;
            this.inputsContact.P_SIDDOC = this.itemContacto.P_SIDDOC;
            this.inputsContact.P_SNOMBRES = this.itemContacto.P_SNOMBRES;
            this.inputsContact.P_SAPEPAT = this.itemContacto.P_SAPEPAT;
            this.inputsContact.P_SAPEMAT = this.itemContacto.P_SAPEMAT;
            this.inputsContact.P_SPHONE = this.itemContacto.P_SPHONE;
            this.inputsContact.P_SNOMUSUARIO = this.itemContacto.P_SNOMUSUARIO;
            this.inputsContact.P_DCOMPDATE = this.itemContacto.P_DCOMPDATE;
            this.inputsContact.P_TipOper = this.itemContacto.P_TipOper;
            this.inputsContact.P_CLASS = this.itemContacto.P_CLASS;
            this.inputsContact.P_SNAMEAREA = this.itemContacto.P_SNAMEAREA;
            this.inputsContact.P_SNAMEPOSITION = this.itemContacto.P_SNAMEPOSITION;
        } else {
            this.txtAccion = 'Agregar Contacto';
            this.inputsContact.P_NROW = '';
            this.inputsContact.P_DESTICONTACTO = '';
            this.inputsContact.P_DESTIDOCUMENTO = '';
            this.inputsContact.P_NIDDOC_TYPE = '0';
            this.inputsContact.P_NTIPCONT = '0';
            this.inputsContact.P_SE_MAIL = '';
            this.inputsContact.P_SIDDOC = '';
            this.inputsContact.P_SNOMBRES = '';
            this.inputsContact.P_SAPEPAT = '';
            this.inputsContact.P_SAPEMAT = '';
            this.inputsContact.P_SPHONE = '';
            this.inputsContact.P_SNOMUSUARIO = '';
            this.inputsContact.P_DCOMPDATE = '';
            this.inputsContact.P_TipOper = '';
            this.inputsContact.P_CLASS = '';
            this.inputsContact.P_SNAMEAREA = '';
            this.inputsContact.P_SNAMEPOSITION = '';
        }

        this.inputsValidate = CommonMethods.generarCampos(25, 0)
    }

    clearValidate(idx) {
        this.inputsValidate[idx] = false;
    }
    getContactTypeList() {

        this.clientInformationService.getContactTypeList(this.typeContact).subscribe(
            res => {
                this.contactTypeList = res;

                if (this.contactTypeList.length == 1) {
                    this.inputsContact.P_NTIPCONT = this.contactTypeList[0].NCODIGO;
                    this.inputsContact.P_DESTICONTACTO = this.contactTypeList[0].SDESCRIPT;
                }
            },
            err => {
            }
        );
    }

    getDocumentTypeList() {

        this.clientInformationService.getDocumentTypeList(0).subscribe(
            res => {
                res.forEach(item => {
                    if (item.Id != 1) {
                        this.documentTypeList.push(item);
                    }
                });
            },
            err => {
            }
        );
    }

    onSelectContactType(event) {
        const selectElementText = event.target['options']
        [event.target['options'].selectedIndex].text;
        this.inputsContact.P_DESTICONTACTO = selectElementText;
        this.inputsContact.P_NTIPCONT = event.target.value;
    }

    documentNumberKeyPress(event: any) {
        CommonMethods.validarNroDocumento(event, this.inputsContact.P_NIDDOC_TYPE);
    }

    onSelectDocumentType(event) {
        const selectElementText = event.target['options']
        [event.target['options'].selectedIndex].text;

        const response = CommonMethods.selTipoDocumento(event.target.value)
        this.inputsContact.P_DESTIDOCUMENTO = selectElementText;
        this.inputsContact.P_NIDDOC_TYPE = event.target.value;
        this.maxlength = response.maxlength;
    }

    EventSave() {
        this.inputsContact.P_SNOMBRES = this.inputsContact.P_SNOMBRES == null ? '' : this.inputsContact.P_SNOMBRES.toUpperCase();
        this.inputsContact.P_SAPEPAT = this.inputsContact.P_SAPEPAT == null ? '' : this.inputsContact.P_SAPEPAT.toUpperCase();
        this.inputsContact.P_SAPEMAT = this.inputsContact.P_SAPEMAT == null ? '' : this.inputsContact.P_SAPEMAT.toUpperCase();
        this.inputsContact.P_SIDDOC = this.inputsContact.P_SIDDOC == null ? '' : this.inputsContact.P_SIDDOC.toUpperCase();
        this.inputsContact.P_SE_MAIL = this.inputsContact.P_SE_MAIL == null ? '' : this.inputsContact.P_SE_MAIL.toUpperCase();
        this.inputsContact.P_SNAMEAREA = this.inputsContact.P_SNAMEAREA == null ? '' : this.inputsContact.P_SNAMEAREA.toUpperCase();
        this.inputsContact.P_SNAMEPOSITION = this.inputsContact.P_SNAMEPOSITION == null ? '' : this.inputsContact.P_SNAMEPOSITION.toUpperCase();

        if (this.itemContacto == null) {
            let existe = 0;
            const item = this.inputsContact;
            this.listaContactos.map(function (dato) {
                if (dato.P_NIDDOC_TYPE == item.P_NIDDOC_TYPE && dato.P_SIDDOC == item.P_SIDDOC &&
                    dato.P_SNOMBRES == item.P_SNOMBRES && dato.P_SAPEPAT == item.P_SAPEPAT &&
                    dato.P_SAPEMAT == item.P_SAPEMAT && dato.P_NTIPCONT == item.P_NTIPCONT &&
                    dato.P_SNAMEAREA == item.P_SNAMEAREA && dato.P_SNAMEPOSITION == item.P_SNAMEPOSITION) {
                    existe = 1;
                }
            });

            if (existe == 0) {
                this.inputsContact.P_NROW = this.listaContactos.length + 1;
                this.ValidarContacto(this.inputsContact, '');
            } else {
                swal.fire('Información', 'El contacto ingresado ya se encuentra registrado.', 'warning');
            }

        } else {
            const num = this.inputsContact.P_NROW;
            let existe = 0;
            const item = this.inputsContact;
            this.listaContactos.map(function (dato) {
                if (dato.P_NIDDOC_TYPE == item.P_NIDDOC_TYPE && dato.P_SIDDOC == item.P_SIDDOC &&
                    dato.P_SNOMBRES == item.P_SNOMBRES && dato.P_SAPEPAT == item.P_SAPEPAT &&
                    dato.P_SAPEMAT == item.P_SAPEMAT && dato.P_NTIPCONT == item.P_NTIPCONT &&
                    dato.P_SNAMEAREA == item.P_SNAMEAREA && dato.P_SNAMEPOSITION == item.P_SNAMEPOSITION &&
                    dato.P_NROW !== num) {
                    existe = 1;
                }
            });
            if (existe === 0) {
                this.ValidarContacto(item, num);
            } else {
                swal.fire('Información', 'El contacto ingresado ya se encuentra registrado.', 'warning');
            }
        }
    }

    ValidarContacto(itemContacto, row) {
        let mensaje = '';

        // if (itemContacto.P_NTIPCONT == 0 || itemContacto.P_NTIPCONT == null) {
        //   this.inputsValidate[0] = true;
        //   mensaje += 'El tipo de contacto es requerido <br />';
        // }
        // if (itemContacto.P_SNAMEAREA.trim() == '' || itemContacto.P_SNAMEAREA == null) {
        //     this.inputsValidate[7] = true;
        //     mensaje += 'El área del contacto es requerido<br />';
        // }
        // if (itemContacto.P_SNAMEPOSITION.trim() == '' || itemContacto.P_SNAMEPOSITION == null) {
        //     this.inputsValidate[8] = true;
        //     mensaje += 'El cargo del contacto es requerido<br />';
        // }
        if (itemContacto.P_SNOMBRES.trim() == '' || itemContacto.P_SNOMBRES == null) {
            this.inputsValidate[1] = true;
            mensaje += 'El nombre del contacto es requerido<br />';
        }
        if (itemContacto.P_SAPEPAT.trim() == '' || itemContacto.P_SAPEPAT == null) {
            this.inputsValidate[2] = true;
            mensaje += 'El apellido paterno del contacto es requerido<br />';
        }

        if (this.codProducto == 6 || this.codProducto == 8) {
            if (itemContacto.P_NIDDOC_TYPE == 0 || itemContacto.P_NIDDOC_TYPE == null) {
                this.inputsValidate[3] = true;
                mensaje += 'El tipo de documento del contacto es requerido<br />';
            }
            if (itemContacto.P_SIDDOC.trim() == '' || itemContacto.P_SIDDOC == null) {
                this.inputsValidate[4] = true;
                mensaje += 'El número de documento del contacto es requerido<br />';
            }
        }

        if (itemContacto.P_SPHONE.trim() == '' || itemContacto.P_SPHONE == null) {
            this.inputsValidate[5] = true;
            mensaje += 'El teléfono del contacto es requerido<br />';

        } else {
            if (itemContacto.P_SPHONE.trim() != '' && itemContacto.P_SPHONE != null) {
                if (itemContacto.P_SPHONE.length < 6) {
                    this.inputsValidate[5] = true;
                    mensaje += 'El teléfono debe tener mínimo 6 dígitos<br />';
                }
                this.inputsValidate[6] = false;
            }
        }

        if (itemContacto.P_SE_MAIL.trim() == '' || itemContacto.P_SE_MAIL == null) {
            this.inputsValidate[6] = true;
            mensaje += 'El correo electrónico del contacto es requerido<br />';
        } else {
            if (itemContacto.P_SE_MAIL.trim() != '' && itemContacto.P_SE_MAIL != null) {
                if (/^(([^<>()[\]\.,;:\s@\']+(\.[^<>()[\]\.,;:\s@\']+)*)|(\'.+\'))@(([^<>()[\]\.,;:\s@\']+\.)+[^<>()[\]\.,;:\s@\']{2,})$/i.test(itemContacto.P_SE_MAIL) == false) {
                    this.inputsValidate[6] = true;
                    mensaje += 'El correo electrónico es inválido <br />';
                }
                this.inputsValidate[5] = false;
            }
        }

        if (mensaje != '') {
            swal.fire('Información', mensaje, 'warning');
        } else {
            this.clientInformationService.ValContact(itemContacto).subscribe(
                res => {
                    if (row == '') {
                        if (res.P_NCODE === 0) {
                            this.listaContactos.push(itemContacto);
                            this.reference.close();
                        } else {
                            swal.fire('Información', res.P_SMESSAGE, 'warning');
                        }
                    } else {
                        if (res.P_NCODE === 0) {
                            this.actualizarContacto(row);
                            this.reference.close();
                        } else {
                            swal.fire('Información', res.P_SMESSAGE, 'warning');
                        }
                    }
                },
                err => {
                }
            );
        }
    }

    actualizarContacto(row) {
        const item = this.inputsContact;
        this.listaContactos.map(function (dato) {
            if (dato.P_NROW == row) {
                dato.P_TipOper = '';
                dato.P_DESTICONTACTO = item.P_DESTICONTACTO;
                dato.P_DESTIDOCUMENTO = item.P_DESTIDOCUMENTO;
                dato.P_NIDDOC_TYPE = item.P_NIDDOC_TYPE != '0' ? item.P_NIDDOC_TYPE : null;
                dato.P_NTIPCONT = item.P_NTIPCONT;
                dato.P_SE_MAIL = item.P_SE_MAIL;
                dato.P_SIDDOC = item.P_SIDDOC;
                dato.P_SNOMBRES = item.P_SNOMBRES;
                dato.P_SAPEPAT = item.P_SAPEPAT;
                dato.P_SAPEMAT = item.P_SAPEMAT;
                dato.P_SPHONE = item.P_SPHONE;
                dato.P_SNAMEAREA = item.P_SNAMEAREA;
                dato.P_SNAMEPOSITION = item.P_SNAMEPOSITION;
            }
        });

    }

    closeContacto() {
        this.listaContactos;
        this.reference.close();
    }

    textValidate(event: any, type) {
        CommonMethods.textValidate(event, type);
    }
}
