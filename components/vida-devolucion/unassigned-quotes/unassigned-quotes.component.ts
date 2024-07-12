import {
  Component,
  OnInit,
  TemplateRef,
  ViewChild,
  ViewContainerRef,
} from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { BsDatepickerConfig } from 'ngx-bootstrap/datepicker';
import { NgxSpinnerService } from 'ngx-spinner';
import { UnassignedQuotesService } from '../../../services/vida-devolucion/unassigned-quotes/unassigned-quotes.service';

@Component({
  selector: 'app-unassigned-quotes',
  templateUrl: './unassigned-quotes.component.html',
  styleUrls: ['./unassigned-quotes.component.scss'],
})
export class UnassignedQuotesComponent implements OnInit {
  bsConfig: Partial<BsDatepickerConfig>;
  fecha: Date = new Date();
  bsValueIni: Date = new Date(this.fecha.setMonth(this.fecha.getMonth() - 6));
  bsValueFin: Date = new Date();

  FormFilter: FormGroup;
  form: FormGroup;

  data: Array<any>;
  showAction: boolean;

  /* N° DOCUMENTO */
  LimitdocumentNumber: {
    min: number;
    max: number;
  };

  general: {
    onlyNumbers: RegExp;
    onlyLetters: RegExp;
  };

  id: any;

  fExistRegistro: any = false;

  @ViewChild('modalAsignar', { static: false, read: TemplateRef })
  _modalAsignar: TemplateRef<any>;
  constructor(
    private router: Router,
    private readonly _FormBuilder: FormBuilder,
    private readonly _vc: ViewContainerRef,
    private readonly _spinner: NgxSpinnerService,
    private readonly _UnassignedQuotesService: UnassignedQuotesService
  ) {
    this.LimitdocumentNumber = {
      min: 8,
      max: 8,
    };
    this.general = {
      onlyNumbers: /^\d+$/,
      onlyLetters: /^[a-zA-ZÁÉÍÓÚÑáéíóúñ\s]+$/,
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
    this.FormFilter = _FormBuilder.group({
      type_document: [null],
      document_number: [
        null,
        Validators.compose([
          Validators.pattern(this.general.onlyNumbers),
          Validators.minLength(8),
          Validators.maxLength(12),
        ]),
      ],
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
      if (!this.general.onlyNumbers.test(_)) {
        this.f['document_number'].setValue(_?.slice(0, _.length - 1) || null, {
          emitEvent: false,
        });
      }
    });
  }

  setLimitdocumentNumber(): void {
    this.f['document_number'].setValidators(
      Validators.compose([
        Validators.pattern(this.general.onlyNumbers),
        Validators.required,
        Validators.minLength(this.LimitdocumentNumber.min),
        Validators.maxLength(this.LimitdocumentNumber.max),
      ])
    );
  }

  closeModals(): void {
    this._vc.clear();
  }

  descartar(data) {
    this._vc.createEmbeddedView(this._modalAsignar);
  }

  buscar() {
    this.data = [];
    this._spinner.show();
    this._UnassignedQuotesService.getUnassignedLeads(this.FormFilter.getRawValue()).subscribe(
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

  setViewCotizacion(data, estado) {
    this.router.navigate(['broker/vidadevolucion/resumen'], {
      queryParams: { cliente: data, showAction: estado },
    });
    window.scrollTo(0, 0);
  }

  aceptarRechazar() { }
}
