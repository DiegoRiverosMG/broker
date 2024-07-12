import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BsDatepickerConfig } from 'ngx-bootstrap/datepicker';
import { ModuleConfig } from '../../module.config';
import Swal from 'sweetalert2';
import { CommonMethods } from '../../common-methods';
import { ClientInformationService } from '@root/layout/broker/services/shared/client-information.service';
import { DatePipe } from '@angular/common';

@Component({
    selector: 'app-policy-create-insured',
    templateUrl: './policy-create-insured.component.html',
    styleUrls: ['./policy-create-insured.component.css']
})
export class PolicyCreateInsuredComponent implements OnInit {

    @Input() public insured: any;
    @Input() public reference: any;
    @Input() public documents: any;
    @Input() public changeUser: any;
    @Input() public insuredCreateResult: any;
    @ViewChild('fechaNacimiento') desde: any;
    bsConfig: Partial<BsDatepickerConfig>;
    bsFecNacimiento: Date = new Date();
    mainFormGroup: FormGroup;
    email = '';
    insuredCreate: any = {};
    formattedDate: any;
    yearValidate: number;
    isLoading = false;

    constructor(private mainFormBuilder: FormBuilder, private clientInformationService: ClientInformationService, private datePipe: DatePipe) {
        this.bsConfig = Object.assign(
            {},
            {
                dateInputFormat: 'DD/MM/YYYY',
                locale: 'es',
                showWeekNumbers: false
            }
        );
    }

    ngOnInit(): void {
        this.insuredCreate.EListAddresClient = [];
        this.insuredCreate.EListPhoneClient = [];
        this.insuredCreate.EListEmailClient = [];
        this.insuredCreate.EListContactClient = [];
        this.insuredCreate.EListCIIUClient = [];
        this.insuredCreate.P_TipOper = 'INS';

        this.formattedDate = this.parsearFecha(this.changeUser.fechaNacimiento);

        this.createForm();

        console.log(this.insured);

        if (this.insured.EListClient) {

            this.insuredCreate.P_SFIRSTNAME = this.insured.EListClient.P_SFIRSTNAME;
            this.insuredCreate.P_SLASTNAME = this.insured.EListClient.P_SLASTNAME;
            this.insuredCreate.P_SLASTNAME2 = this.insured.EListClient.P_SLASTNAME2;

            let date = this.parsearFecha(this.insured.EListClient.P_DBIRTHDAT);
            this.mainFormGroup.controls['fNacimiento'].setValue(date);

            this.mainFormGroup.controls['nombres'].disable();
            this.mainFormGroup.controls['apellidoP'].disable();
            this.mainFormGroup.controls['apellidoM'].disable();
            this.mainFormGroup.controls['fNacimiento'].disable();

        }
    }

    createForm() {
        this.mainFormGroup = this.mainFormBuilder.group({
            nombres: ['', [Validators.required]],
            apellidoP: ['', [Validators.required]],
            apellidoM: ['', [Validators.required]],
            fNacimiento: [this.formattedDate, [Validators.required]],
            correo: ['', [Validators.required]],
            direccion: ['', [Validators.required]],
            telefono: ['', [Validators.required]],
        })
    }

    validateForm() {
        let msj = '';
        if (this.mainFormGroup.controls['nombres'].invalid) {
            msj += 'Debe ingresar los nombres.<br/>';
        }
        if (this.mainFormGroup.controls['apellidoP'].invalid) {
            msj += 'Debe ingresar el apellido paterno. <br/>';
        }
        if (this.mainFormGroup.controls['apellidoM'].invalid) {
            msj += 'Debe ingresar el apellido materno. <br/>';
        }
        if (this.mainFormGroup.controls['correo'].invalid) {
            msj += 'Debe ingresar el correo. <br/>';
        }
        if (this.mainFormGroup.controls['direccion'].invalid) {
            msj += 'Debe ingresar la dirección. <br/>';
        }
        if (this.mainFormGroup.controls['telefono'].invalid) {
            msj += 'Debe ingresar el teléfono. <br/>';
        }
        Swal.fire('Información', msj, 'warning');
        return;
    }

    textValidate(event: any, type) {
        CommonMethods.textValidate(event, type)
    }

    createInsured() {
        if (this.mainFormGroup.invalid) {
            this.mainFormGroup.markAllAsTouched();
            this.validateForm();
            return;
        }

        if (/^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i.test(this.email) == false) {
            Swal.fire('Información', 'El correo electrónico es inválido', 'warning');
            return;
        }

        this.insuredCreate.P_DBIRTHDAT = CommonMethods.formatDate(this.bsFecNacimiento);

        this.insuredCreate.EListAddresClient = [];
        this.insuredCreate.EListPhoneClient = [];
        this.insuredCreate.EListEmailClient = [];
        this.insuredCreate.EListContactClient = [];
        this.insuredCreate.EListCIIUClient = [];
        this.insuredCreate.P_NIDDOC_TYPE = this.insured.P_NIDDOC_TYPE;
        this.insuredCreate.P_SIDDOC = this.insured.P_SIDDOC;
        this.insuredCreate.P_SLEGALNAME = this.insuredCreate.P_SFIRSTNAME + ', ' + this.insuredCreate.P_SLASTNAME + ' ' + this.insuredCreate.P_SLASTNAME2;
        this.insuredCreate.P_NNATIONALITY = 1; //PERÚ
        this.insuredCreate.P_NTITLE = '99';
        this.insuredCreate.P_NCIVILSTA = '5';
        this.insuredCreate.P_SSEXCLIEN = '3';
        this.insuredCreate.P_NSPECIALITY = '99';
        this.insuredCreate.P_SBLOCKADE = '2';
        this.insuredCreate.P_ORIGEN_DATA = 'GESTORCLIENTE';
        this.insuredCreate.P_NUSERCODE = JSON.parse(localStorage.getItem('currentUser'))['id'];

        this.insuredCreate.EListPhoneClient.push({
            P_SPHONE: this.mainFormGroup.controls['telefono'].value,
            P_NPHONE_TYPE: '2'
        });

        this.insuredCreate.EListEmailClient.push({
            P_SE_MAIL: this.mainFormGroup.controls['correo'].value,
            P_SRECTYPE: '4'
        })

        Swal.fire({
            title: 'Información',
            text: '¿Estas seguro de crear al asegurado?',
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Guardar',
            allowOutsideClick: false,
            cancelButtonText: 'Cancelar'
        }).then(async (result) => {
            if (result.value) {
                this.isLoading = true;
                this.clientInformationService.getCliente360(this.insuredCreate).subscribe(
                    res => {
                        if (res.P_NCODE === '0') {
                            this.isLoading = false;
                            Swal.fire('Información', 'Se ha realizado el registro correctamente', 'success')
                                .then((value) => {
                                    this.insuredCreateResult = res;
                                    this.reference.close(this.insuredCreateResult)
                                });
                        }
                        else if (res.P_NCODE === '1') {
                            this.isLoading = false;
                            Swal.fire('Información', res.P_SMESSAGE, 'error');
                        }
                        else {
                            this.isLoading = false;
                            Swal.fire('Información', res.P_SMESSAGE, 'warning');
                        }
                    },
                    err => {
                        this.isLoading = false;
                        Swal.fire('Información', err.statusText, 'warning');
                    }
                );
            }
        });


    }


    private parsearFecha(fechaString: string): Date {
        const partesFecha = fechaString.split('/');
        const dia = +partesFecha[0];
        const mes = +partesFecha[1] - 1;
        const año = +partesFecha[2];
        this.yearValidate = año

        return new Date(año, mes, dia);
    }

    closeModal() {
        this.reference.close(this.insuredCreateResult)
    }

}
