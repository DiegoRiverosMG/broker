import { Component, OnInit, TemplateRef, ViewChild, ViewContainerRef } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { QuoteTrayService } from '@root/layout/broker/services/vida-devolucion/quote-tray/quote-tray.service';
import { VidaDevolucionService } from '@root/layout/broker/services/vida-devolucion/vida-devolucion.service';
import { UtilsService } from '@shared/services/utils/utils.service';
import { BsDatepickerConfig } from 'ngx-bootstrap/datepicker';
import { NgxSpinnerService } from 'ngx-spinner';
import { DataProductService } from '@root/layout/broker/services/vida-devolucion/data-product/data-product.service';
import { isNullOrUndefined } from 'util';
import { ModalDirective } from 'ngx-bootstrap/modal';
import moment from 'moment';
@Component({
  selector: 'app-quote-asign',
  templateUrl: './quote-asign.component.html',
  styleUrls: ['./quote-asign.component.scss']
})
export class QuoteAsignComponent implements OnInit {
  bsConfigValidity: Partial<BsDatepickerConfig>;
  bsConfigValidityEnd: Partial<BsDatepickerConfig>;
  data: any[];
  fileUpload: File;
  snameFile: string;
  FormFilter: FormGroup;
  formFile: FormGroup;
  tipoArchivo = 0;
  validates = [
    'DNI NO VALIDOS RENIEC', 'CAMPO CORREO VACIO', 'CAMPO CELULAR VACIO', 'N° DIGITOS CELULAR INCORRECTO',
    'CAMPO ASESOR VACIO', 'PROSPECTOS ASIGNADOS ERRONEAMENTE'];
  @ViewChild('modalReasign', { static: true, read: TemplateRef })
  _modalReasign: TemplateRef<any>;
  @ViewChild('childModalInfo', { static: true }) childModalInfo: ModalDirective;
  @ViewChild('childModalValidate', { static: true, read: TemplateRef })
  childModalValidate: TemplateRef<any>;
  @ViewChild('modalUploadFile', { static: true, read: TemplateRef })
  _modalUploadFile: TemplateRef<any>;
  @ViewChild('modalChecklist', { static: true, read: TemplateRef })
  _modalChecklist: TemplateRef<any>;
  @ViewChild('modalUploadData', { static: true, read: TemplateRef })
  _modalUploadData: TemplateRef<any>;
  estados: any;
  resumen: any;
  messageinfo: string;
  filesComm: Array<File> = [];
  start: boolean;
  nameFile: string;
  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private readonly builder: FormBuilder,
    private readonly _vc: ViewContainerRef,
    private readonly _QuoteTrayService: QuoteTrayService,
    private readonly _spinner: NgxSpinnerService,
    private readonly utilsService: UtilsService,
    private readonly vidaDevolucionService: VidaDevolucionService,
    private readonly dataProduct: DataProductService,
  ) {
    this.bsConfigValidity = Object.assign(
      {},
      {
        dateInputFormat: 'DD/MM/YYYY',
        locale: 'es',
        containerClass: 'theme-dark-blue',
        showWeekNumbers: true,
        maxDate: new Date(),
      }
    );
    this.bsConfigValidityEnd = Object.assign(
      {},
      {
        dateInputFormat: 'DD/MM/YYYY',
        locale: 'es',
        containerClass: 'theme-dark-blue',
        showWeekNumbers: true,
        maxDate: new Date(),
      }
    );
    this.start = false;
    this.filesComm = [];
    this.FormFilter = this.builder.group({
      id: [0],
      validity: [new Date('01-01-2022')],
      validityEnd: [new Date()],
      state: [0],
      ejecutivo: [{ value: +this.currentUser['id'], disabled: true }],
    });
    this.formFile = this.builder.group({
      file: [null]
    });
  }
  ngOnInit(): void {
    this.getParameters();
    this.obtainData();
  }
  get f(): { [key: string]: AbstractControl } {
    return this.FormFilter.controls;
  }

  get currentUser(): any {
    const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
    return {
      ...user,
      comercial: +user['profileId'] == 191,
      soporte: +user['profileId'] == 192,
      analista: +user['profileId'] == 193,
      supervisor: +user['profileId'] == 194,
      jefeComercial: +user['profileId'] == 195,
      gerenteComercial: +user['profileId'] == 196,
      gerenteGeneral: +user['profileId'] == 197,
    };
  }
  openReasgin() {
    this._vc.clear();
    this._vc.createEmbeddedView(this._modalReasign);
  }
  openUpload() {
    this._vc.createEmbeddedView(this._modalUploadFile);
  }
  openfin() {
    this.newCargaMasiva();
    this._vc.clear();
    this._vc.createEmbeddedView(this._modalUploadData);
  }
  closeModals(): void {
    this._vc.clear();
    this.resumen = null;
    this.filesComm = [];
    this.messageinfo = '';
    this.start = false;
  }
  getParameters(): void {
    this._QuoteTrayService.getParameters().subscribe({
      next: (response: any) => {
        console.dir(response);
        // this.ejecutivos = response?.asesores;
        this.estados = response?.estados;
      },
      error: (error: any) => {
        console.error(error);
      },
    });
  }
  Checklist(data): void {
    this.resumen = data;
    this._vc.createEmbeddedView(this._modalChecklist);
  }
  obtainData() {
    const request = ({
      id: this.f['id'].value || 0,
      description: this.f['state'].value || 0,
    });
    this.dataProduct.listaMasivaMock(request).subscribe({
      next: (response: any) => {
        this.data = response;
      },
      error: (error: any) => {
        console.error(error);
      },
    });
  }
  onVotedResultFileUpload(fileupload: FileList) {
    // console.log(fileupload);
    if (!isNullOrUndefined(fileupload) && fileupload.length > 0) {
      this.fileUpload = fileupload[0];
      this.snameFile = fileupload[0].name.toString();
      this.AdjuntarDocumentos();
    }
  }
  newCargaMasiva() {
    const req = ({
      number: 11,
      tipo: 'xlsx',
      file: this.filesComm[0].name,
      fechayhora: moment(new Date()).format('DD/MM/YYYY hh:mm:ss'),
      estado:
      {
        id: 1,
        description: 'CARGADO',
      },
    });
    this.data.push(req);
    this.filesComm = [];
    this._vc.clear();
  }
  async AdjuntarDocumentos() {
    this.filesComm = [];
    this.snameFile = '';
    if (!isNullOrUndefined(this.fileUpload.name)) {
      const extensions = ['xlsx'];
      const fileExt = this.fileUpload.name.split('.').pop();
      this.snameFile = this.fileUpload.name;
      /* const fileExt = this.snameFile?.slice(this.snameFile.lastIndexOf('.') + 1, this.snameFile.length)?.toLocaleLowerCase(); */
      if (!extensions.includes(fileExt)) {
        this.messageinfo = 'Extensión de archivo no permitida, sólo se permite xlsx';
        this.start = false;
        return;
      }
      if (Math.round(this.fileUpload.size / 1000000) > 25) {
        this.messageinfo = 'El archivo supera el máximo permitido, 25MB.';
        this.start = false;
        return;
      } else {
        let suma = 0;
        for (let u = 0; u < this.filesComm.length; u++) {
          suma += this.filesComm[u].size;
        }
        suma += this.fileUpload.size;
        if (Math.round(suma / 1000000) > 25) {
          this.messageinfo = 'El archivo supera el máximo permitido, 25MB.';
          return;
        } else {
          this.filesComm.push(this.fileUpload);
          this.messageinfo = '';
        }
      }
    }
    this.nameFile = this.filesComm[0].name;
    this.start = true;
  }
}
