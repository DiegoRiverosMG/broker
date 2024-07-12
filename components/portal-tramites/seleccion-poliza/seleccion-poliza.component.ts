import {
  Component,
  OnInit,
  TemplateRef,
  ViewContainerRef,
  ViewChild,
} from '@angular/core';
import {
  FormGroup,
  FormBuilder,
  Validators,
  AbstractControl,
} from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { UtilsService } from '@shared/services/utils/utils.service';
import { SeleccionPolizaService } from '../../../services/portal-tramites/seleccion-poliza.service';
import { PortalTramitesService } from '../../../services/portal-tramites/portal-tramites.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { HttpErrorResponse } from '@angular/common/http';
import { BsDatepickerConfig } from 'ngx-bootstrap/datepicker';

@Component({
  selector: 'app-seleccion-poliza',
  templateUrl: './seleccion-poliza.component.html',
  styleUrls: ['./seleccion-poliza.component.scss'],
})
export class SeleccionPolizaComponent implements OnInit {
  datePickerConfig: Partial<BsDatepickerConfig>;

  form: FormGroup;
  proceduresData$: Array<any>;

  page = +sessionStorage.getItem('current-page-sp') || 1;

  policySelected: any;
  tipoTramite: number;

  selectedPolicyData$: any;
  channelSales$: Array<any>;
  // Canal asociado por defeto
  channelDefault: string = '2015000002';

  @ViewChild('modalProcedure', { static: true, read: TemplateRef })
  _modalProcedure: TemplateRef<any>;

  maxLengthDocumentNumber: {
    min: number;
    max: number;
  } = {
    min: 8,
    max: 12,
  };

  private readonly operationProfiles: number[] = [20, 151, 155];

  constructor(
    private readonly _utilsService: UtilsService,
    private readonly _builder: FormBuilder,
    private readonly _vc: ViewContainerRef,
    private readonly _seleccionPolizaService: SeleccionPolizaService,
    private readonly _spinner: NgxSpinnerService,
    private readonly _router: Router,
    private readonly _route: ActivatedRoute,
    private readonly _portalTramitesService: PortalTramitesService
  ) {
    this.datePickerConfig = Object.assign(
      {},
      {
        locale: 'es',
        showWeekNumbers: false,
        maxDate: new Date(),
        dateInputFormat: 'DD/MM/YYYY',
      }
    );

    this.channelSales$ = new Array();
    this.proceduresData$ = new Array();
    this.form = this._builder.group({
      channelCode: [null],
      documentType: [0, Validators.pattern(this._utilsService.onlyNumbers)],
      documentNumber: [
        null,
        Validators.pattern(this._utilsService.onlyNumbers),
      ],
      policy: [null, Validators.pattern(this._utilsService.onlyNumbers)],
      licensePlate: [null, Validators.pattern(this._utilsService.alphaNumeric)],
      startDate: [new Date('01-01-2022')],
      endDate: [new Date()],
    });
  }

  ngOnInit(): void {
    this._route.queryParams.subscribe((param: any) => {
      if (param?.type) {
        this.tipoTramite = param?.type;
      }
    });
    this.getChannelSales(true);
    this.formControlValidations();
  }

  get currentUser(): any {
    return JSON.parse(localStorage.getItem('currentUser') || '{}');
  }

  get isOperaciones(): boolean {
    return this.operationProfiles.includes(+this.currentUser?.profileId);
  }

  get validateSearch(): boolean {
    if (!this.isOperaciones) {
      return true;
    }

    if (
      this.f['policy'].value ||
      this.f['documentNumber'].value ||
      this.f['licensePlate'].value
    ) {
      return true;
    } else {
      return false;
    }
  }

  get f(): { [key: string]: AbstractControl } {
    return this.form.controls;
  }

  resetForm(): void {
    this.form.reset();
    this.f['channelCode'].setValue(
      (this.channelSales$ || [])[0]?.id || this.currentUser.canal
    );
    this.f['documentType'].setValue(0);
    this.f['startDate'].setValue(new Date('01-01-2022'));
    this.f['endDate'].setValue(new Date());

    this.proceduresData$ = [];
    if (!this.isOperaciones) {
      this.listadoPolizas(true);
    }
  }

  formControlValidations(): void {
    this.f['documentType'].valueChanges.subscribe((value: string) => {
      switch (+value) {
        case 1: {
          this.maxLengthDocumentNumber = {
            min: 11,
            max: 11,
          };
          break;
        }
        case 2: {
          this.maxLengthDocumentNumber = {
            min: 8,
            max: 8,
          };
          break;
        }
        case 4: {
          this.maxLengthDocumentNumber = {
            min: 9,
            max: 12,
          };
          break;
        }
        default: {
          this.maxLengthDocumentNumber = {
            min: 8,
            max: 12,
          };
          break;
        }
      }
      this.f['documentNumber'].setValue(null, {
        emitEvent: false,
      });
      this.f['documentNumber'].setValidators(
        Validators.compose([
          Validators.pattern(this._utilsService.onlyNumbers),
          Validators.minLength(this.maxLengthDocumentNumber.min),
          Validators.maxLength(this.maxLengthDocumentNumber.max),
        ])
      );
      this.f['documentNumber'].updateValueAndValidity();
    });

    this.f['documentNumber'].valueChanges.subscribe((value: string) => {
      if (this.f['documentNumber'].hasError('pattern') && value) {
        this.f['documentNumber'].setValue(value.slice(0, value.length - 1));
      }
    });

    this.f['policy'].valueChanges.subscribe((value: string) => {
      if (this.f['policy'].hasError('pattern') && value) {
        this.f['policy'].setValue(value.slice(0, value.length - 1));
      }
    });

    this.f['licensePlate'].valueChanges.subscribe((value: string) => {
      if (this.f['licensePlate'].hasError('pattern') && value) {
        this.f['licensePlate'].setValue(value.slice(0, value.length - 1));
      }
    });
  }

  openModalProcedure(): void {
    this._vc.createEmbeddedView(this._modalProcedure);
  }

  closeModal(): void {
    this._vc.clear();
  }

  listadoPolizas(restart: boolean = false) {
    if (restart) {
      this.page = 1;
    }
    this.proceduresData$ = [];
    this.selectPolicy = null;
    this._spinner.show();
    const request = {
      ...this.form.getRawValue(),
      currentPage: this.page,
    };
    this._seleccionPolizaService.listadoPolizas(request).subscribe(
      (response: any) => {
        if (response.data.success && response.data.ventas.length) {
          this.proceduresData$ = response.data.ventas;
        }
        this._spinner.hide();
      },
      (error: any) => {
        console.log(error);
        this._spinner.hide();
      }
    );
  }

  set currentPage(p) {
    this.page = p;
    this.listadoPolizas();
  }

  setNuevoTramite() {
    sessionStorage.setItem('current-page-sp', this.page.toString());
    if (+this.policySelected.flagTramite == 0) {
      this._router.navigate(['extranet/portal-tramites/nuevo'], {
        queryParams: {
          policy: this.policySelected.poliza,
        },
        queryParamsHandling: 'merge',
      });
    }
  }

  set selectPolicy(_) {
    this.policySelected = _;
  }

  policySummary(data: any): void {
    this._spinner.show();
    this._portalTramitesService.getSummary(data.poliza).subscribe(
      (response: any) => {
        if (response.data.detallePoliza) {
          this.selectedPolicyData$ = response.data.detallePoliza;
          this._vc.createEmbeddedView(this._modalProcedure);
        }
        this._spinner.hide();
      },
      (error: HttpErrorResponse) => {
        console.error(error);
        this._spinner.hide();
      }
    );
  }

  getChannelSales(search: boolean = false): void {
    this._utilsService.channelSales(+this.currentUser['id']).subscribe(
      (response: any) => {
        if (response.items.length) {
          this.channelSales$ = response.items;
          if (this.channelSales$.length == 1) {
            this.f['channelCode'].setValue(this.channelSales$[0].id);
          }

          if (this.isOperaciones) {
            this.channelSales$ = response.items.filter(
              (item: any) => item.id == this.channelDefault
            );
            if (this.channelSales$.length == 1) {
              this.f['channelCode'].setValue(this.channelSales$[0].id);
            }
          }

          if (search && !this.isOperaciones) {
            this.listadoPolizas();
          }
        }
      },
      (error: HttpErrorResponse) => {
        console.error(error);
      }
    );
  }

  back(): void {
    this._router.navigate(['/extranet/portal-tramites']);
  }
}
