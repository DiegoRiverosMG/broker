import { Component, OnInit } from '@angular/core';
import {
    AbstractControl,
    FormBuilder,
    FormGroup,
    Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { BsDatepickerConfig } from 'ngx-bootstrap/datepicker';
import { NgxSpinnerService } from 'ngx-spinner';

import { ApprovalsPendingService } from '../../../services/vida-devolucion/approvals-pending/approvals-pending.service';
import { RegularExpressions } from '@shared/regexp/regexp';

@Component({
    selector: 'app-approvals-pending',
    templateUrl: './approvals-pending.component.html',
    styleUrls: ['./approvals-pending.component.scss'],
})
export class ApprovalsPendingComponent implements OnInit {
    bsConfig: Partial<BsDatepickerConfig>;
    fecha: Date = new Date();
    bsValueIni: Date = new Date(this.fecha.setMonth(this.fecha.getMonth() - 6));
    bsValueFin: Date = new Date();

    FormFilter: FormGroup;

    data: Array<any>;
    dataOrdenada: Array<any>;
    fechas: Array<any>;

    /* N° DOCUMENTO */
    LimitdocumentNumber: {
        min: number;
        max: number;
    };

    showAction: boolean;

    constructor(
        private router: Router,
        private readonly _FormBuilder: FormBuilder,
        private readonly _ApprovalsPendingService: ApprovalsPendingService,
        private readonly _spinner: NgxSpinnerService
    ) {
        this.LimitdocumentNumber = {
            min: 8,
            max: 8,
        };
        this.bsConfig = Object.assign(
            {},
            {
                dateInputFormat: 'DD/MM/YYYY',
                locale: 'es',
                containerClass: 'theme-dark-blue',
                showWeekNumbers: true,
            }
        );
        this.FormFilter = this._FormBuilder.group({
            type_document: [null],
            document_number: [null],
            reason: [null],
        });
        this.showAction = false;
    }

    p = 0;

    set currentPage(p) {
        this.p = p;
        this.buscar();
    }

    get f(): { [key: string]: AbstractControl } {
        return this.FormFilter.controls;
    }

    ngOnInit(): void {
        this.f['type_document'].valueChanges.subscribe((_: string) => {
            switch (+_) {
                case 2:
                    this.LimitdocumentNumber = {
                        min: 8,
                        max: 8,
                    };
                    break;
                case 4:
                    this.LimitdocumentNumber = {
                        min: 9,
                        max: 12,
                    };
                    break;
            }
            this.f['document_number'].setValue(null, {
                emitEvent: false,
            });
            this.setLimitdocumentNumber();
        });
        this.f['document_number'].valueChanges.subscribe((_: string) => {
            if (!RegularExpressions.numbers.test(_)) {
                this.f['document_number'].setValue(_?.slice(0, _.length - 1) || null, {
                    emitEvent: false,
                });
            }
        });
    }

    setLimitdocumentNumber(): void {
        this.f['document_number'].setValidators(
            Validators.compose([
                Validators.pattern(RegularExpressions.numbers),
                Validators.required,
                Validators.minLength(this.LimitdocumentNumber.min),
                Validators.maxLength(this.LimitdocumentNumber.max),
            ])
        );
    }

    rechazar() { }

    atender(data) {
        this.router.navigate(['broker/vidadevolucion/producto'], {
            queryParams: {
                cotizacion: 1,
                validacion: 'si',
                showAction: this.showAction,
                case: data,
            },
        });
        /* VISUALIZAR NUEVA PAGINA DESDE PARTE SUPERIOR */
        window.scrollTo(0, 0);
    }

    buscar() {
        this.data = [];
        this._spinner.show();
        this._ApprovalsPendingService
            .listado(this.FormFilter.getRawValue())
            .subscribe(
                (response) => {
                    this.data = response;
                    this._spinner.hide();
                },
                (error: any) => {
                    console.log(error);
                    this._spinner.hide();
                }
            );
    }
}
