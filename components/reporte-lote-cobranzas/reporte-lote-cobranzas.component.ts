import { HttpErrorResponse } from '@angular/common/http';
import {
  Component,
  ElementRef,
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
import moment from 'moment';
import { BsDatepickerConfig } from 'ngx-bootstrap/datepicker';
import { NgxSpinnerService } from 'ngx-spinner';
import { UtilsService } from '../../../../shared/services/utils/utils.service';
import { ReporteLoteCobranzasService } from '../../services/reporte-lote-cobranzas/reporte-lote-cobranzas.service';

@Component({
  selector: 'app-reporte-lote-cobranzas',
  templateUrl: './reporte-lote-cobranzas.component.html',
  styleUrls: ['./reporte-lote-cobranzas.component.sass'],
})
export class ReporteLoteCobranzasComponent implements OnInit {
  formReport: FormGroup = this.builder.group({
    startDate: [''],
    endDate: [''],
    branch: ['', Validators.required],
  });

  formFilter: FormGroup = this.builder.group({
    startDate: [''],
    endDate: [''],
  });

  private pageTableLotReport: number = 1;

  // Listado de Ramo
  dataListBranchs: Array<any> = [];
  // *Lista global
  dataListLots: Array<any> = [];
  // *Lista filtrada
  dataListLotsFiltered: Array<any> = [];

  proSelectComponentConfig = {
    checkboxColor: 'orange',
  };

  listRamos: Array<number> = [];
  messageInfo: string = '';

  datePickerConfig: Partial<BsDatepickerConfig>;
  dateStart: Date = new Date(new Date().setMonth(new Date().getMonth() - 3));
  valueDateFin: Date = new Date();
  valueDateInit: Date = moment('01/01/2019', 'DD/MM/YYYY').toDate();

  @ViewChild('modalMessage', { static: true, read: TemplateRef })
  modalMessage: TemplateRef<ElementRef>;

  constructor(
    private readonly builder: FormBuilder,
    private readonly utilsService: UtilsService,
    private readonly vc: ViewContainerRef,
    private readonly spinner: NgxSpinnerService,
    private readonly reporteService: ReporteLoteCobranzasService
  ) {
    this.datePickerConfig = Object.assign(
      {},
      {
        dateInputFormat: 'DD/MM/YYYY',
        locale: 'es',
        showWeekNumbers: true,
      }
    );
  }

  ngOnInit() {
    this.getListBranchs();
    this.resetFormReport();

    this.formFilterControl['startDate'].setValue(this.dateStart);
    this.formFilterControl['endDate'].setValue(new Date());
    this.listFilterReport();
  }

  get formReportControl(): { [key: string]: AbstractControl } {
    return this.formReport.controls;
  }

  get formFilterControl(): { [key: string]: AbstractControl } {
    return this.formFilter.controls;
  }

  get currentUser(): any {
    return JSON.parse(localStorage.getItem('currentUser'));
  }

  get currentPage(): number {
    return this.pageTableLotReport;
  }

  set changeCurrentPage(page: number) {
    this.pageTableLotReport = page;
  }

  resetFormReport(): void {
    this.formReportControl['startDate'].setValue(this.dateStart);
    this.formReportControl['endDate'].setValue(new Date());
    this.formReportControl['branch'].setValue('');
  }
  getListBranchs(): void {
    this.utilsService.getBranches().subscribe({
      next: (response: any) => {
        response.forEach((obj: any) => {
          this.dataListBranchs.push({
            id: obj.id,
            label: obj.description,
            checked: false,
          });
        });
      },
      error: (error: HttpErrorResponse) => {
        console.log(error);
      },
    });
  }

  listFilterReport(): void {
    this.spinner.show();

    const data = {
      fechaInicio: moment(this.formFilterControl['startDate'].value).format(
        'DD/MM/YYYY'
      ),
      fechaFin: moment(this.formFilterControl['endDate'].value).format(
        'DD/MM/YYYY'
      ),
    };

    this.reporteService.getListReport(data).subscribe({
      next: (response: any) => {
        this.dataListLotsFiltered = response.listadoCobranzas;
      },
      error: (error: HttpErrorResponse) => {
        console.log(error);
      },
      complete: () => {
        this.spinner.hide();
      },
    });
  }

  showModalMessage(): void {
    this.spinner.show();
    this.listRamos = [];
    const ramosString = this.formReportControl['branch'].value.split('(d)');

    for (const obj of this.dataListBranchs) {
      if (ramosString.includes(obj.label)) {
        this.listRamos.push(obj.id);
      }
    }

    const payload = {
      fechaInicio: moment(this.formReportControl['startDate'].value).format(
        'DD/MM/YYYY'
      ),
      fechaFin: moment(this.formReportControl['endDate'].value).format(
        'DD/MM/YYYY'
      ),
      idUsuario: this.currentUser.id,
      listadoRamos: this.listRamos,
    };

    this.reporteService.generateReport(payload).subscribe({
      next: (response: any) => {
        if (!response.success) {
          this.messageInfo =
            'Ocurrió un problema en la solicitud, inténtalo más tarde ';
          this.vc.createEmbeddedView(this.modalMessage);
          return;
        }
        this.messageInfo =
          'La solicitud de su reporte fue creada con éxito, en unos minutos le llegará la confirmación por correo electrónico.';
        this.vc.createEmbeddedView(this.modalMessage);
        this.listFilterReport();
        this.resetFormReport();
      },
      error: (error: HttpErrorResponse) => {
        console.log(error);
      },
      complete: () => {
        this.spinner.hide();
      },
    });
  }

  hideModal(): void {
    this.vc.clear();
    this.messageInfo = '';
  }

  downloadReport(idReporte: number): void {
    this.spinner.show();

    this.reporteService.downloadReport(idReporte).subscribe({
      next: (response: any) => {
        if (!response.success) {
          this.messageInfo =
            'Ocurrió un problema al intentar descargar el archivo, inténtelo más tarde.';
          this.vc.createEmbeddedView(this.modalMessage);
          return;
        }

        this.utilsService.downloadFile({
          fileName: response.nombreArchivo,
          fileBase64: response.archivo,
        });
      },
      error: (error: HttpErrorResponse) => {
        console.log(error);
      },
      complete: () => {
        this.spinner.hide();
      },
    });
  }
}
