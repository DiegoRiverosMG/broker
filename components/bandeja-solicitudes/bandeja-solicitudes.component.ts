import { Component, ElementRef, OnInit, TemplateRef, ViewChild, ViewContainerRef } from '@angular/core';
import { BsDatepickerConfig } from 'ngx-bootstrap/datepicker';
import { AbstractControl, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { UtilsService } from '@shared/services/utils/utils.service';
import { EmisionService } from '@root/layout/client/shared/services/emision.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import * as moment from 'moment';

import { BandejaSolicitudesService } from './shared/services/bandeja-solicitudes.service';
import { ChannelSalesModel } from '@shared/models/channel-point-sales/channel-point-sale.model';
import { IResponse, Response } from '@shared/interfaces/response.interface';
import { Parameters } from '@root/layout/broker/components/bandeja-solicitudes/shared/models/request-tray.model';
import { AttachDocument, Item } from './shared/interfaces/request-tray.interface';
import { fadeAnimation } from '@shared/animations/animations';


@Component({
  selector: 'app-bandeja-solicitudes',
  templateUrl: './bandeja-solicitudes.component.html',
  styleUrls: ['./bandeja-solicitudes.component.scss'],
  animations: [fadeAnimation]
})
export class BandejaSolicitudesComponent implements OnInit {
  datePickerConfig: Partial<BsDatepickerConfig> = Object.assign(
    {},
    {
      locale: 'es',
      showWeekNumbers: false,
      maxDate: new Date(),
      dateInputFormat: 'DD/MM/YYYY',
    }
  );

  form: FormGroup = this.builder.group({
    request: ['', Validators.pattern(this.utilsService.onlyNumbers)],
    channel: [0],
    startDate: [new Date('01-01-2023')],
    endDate: [new Date()],
    licensePlate: ['', Validators.pattern(this.utilsService.alphaNumeric)],
    state: [0],
  });

  formMotiveReject: FormGroup = this.builder.group({
    motive: [null, Validators.required],
    observation: ['', Validators.required],
  });

  formAuto: FormGroup = this.builder.group({
    class: [{ value: '', disabled: true }, Validators.required],
    brand: ['', Validators.required],
    model: [{ value: '', disabled: true }, Validators.required],
    version: [{ value: '', disabled: true }, Validators.required]
  });
  authTechniqueCheckControl: FormControl = this.builder.control(false, Validators.requiredTrue);

  listBrands$: any[] = [];
  listModels$: any[] = [];
  listClasses$: any[] = [];
  listVersions$: any[] = [];

  listRequest$: any[] = [];

  requestSelected: any;

  requestInfo$: any;
  requestLogHistory$: any[] = [];

  private p: number = 1;

  channelSales$: any[] = [];
  messageResponse: Partial<{
    success: boolean,
    message: string,
    showImage: boolean
  }> = {
    success: false,
    message: '',
    showImage: false
  };
  searchAgain: boolean = false;

  listDocumentsAttach$: AttachDocument[] = [];
  listStates$: Item[] = [];
  listReasons$: Item[] = [];

  requestTypeConfirm = {
    APPROVE: 'APPROVE',
    REJECT: 'REJECT',
    CANCEL: 'CANCEL',
    SEND_TECHNIQUE: 'SEND_TECHNIQUE'
  };
  modalConfirmRequestType: 'APPROVE' | 'REJECT' | 'CANCEL' | 'SEND_TECHNIQUE';
  requestActionType = {
    VIEW: 'VIEW',
    ATTEND: 'ATTEND'
  };
  requestActionTypeSelected: 'VIEW' | 'ATTEND';

  @ViewChild('modalDetail', { static: true, read: TemplateRef })
  modalDetail: TemplateRef<ElementRef>;

  @ViewChild('modalHistory', { static: true, read: TemplateRef })
  modalHistory: TemplateRef<ElementRef>;
  @ViewChild('modalConfirm', { static: true, read: TemplateRef })
  modalConfirm: TemplateRef<ElementRef>;

  @ViewChild('modalMessage', { static: true, read: TemplateRef })
  modalMessage: TemplateRef<ElementRef>;

  @ViewChild('modalMotiveReject', { static: true, read: TemplateRef })
  modalMotiveReject: TemplateRef<ElementRef>;

  constructor(
    private readonly builder: FormBuilder,
    private readonly vcr: ViewContainerRef,
    private readonly spinner: NgxSpinnerService,
    private readonly router: Router,
    private readonly utilsService: UtilsService,
    private readonly emissionService: EmisionService,
    private readonly bandejaSolicitudesService: BandejaSolicitudesService,
  ) {
  }

  ngOnInit(): void {
    this.getParameters();
    this.getBrands();
    this.channelSales();
    this.valueChangesFormAuto();
    this.formFiltersValidations();
  }

  /**
   * The currentUser function returns the current user from local storage.
   * @return The current user
   */
  get currentUser(): any {
    return JSON.parse(localStorage.getItem('currentUser') ?? '{}');
  }

  /**
   * The isOperations function checks if the current user is an admin or a backoffice user.
   * @return True or false depending on the value of this
   */
  get isOperations(): boolean {
    return this.utilsService.adminsBackoffice.includes(+this.currentUser?.profileId);
  }

  /**
   * The currentPage function is used to set the current page of the pagination.
   * @param page: number Set the current page
   */
  set currentPage(page: number) {
    this.p = page;
    this.getRequests();
  }

  /**
   * The currentPage function returns the current page number.
   * @return The current page
   */
  get currentPage(): number {
    return this.p;
  }

  get formMotiveRejectControl(): { [key: string]: AbstractControl } {
    return this.formMotiveReject.controls;
  }

  get formAutoControl(): { [key: string]: AbstractControl } {
    return this.formAuto.controls;
  }

  get formControl(): { [key: string]: AbstractControl } {
    return this.form.controls;
  }

  formFiltersValidations(): void {
    this.formControl['licensePlate'].valueChanges.subscribe((val: string): void => {
      if (this.formControl['licensePlate'].hasError('pattern')) {
        this.formControl['licensePlate'].setValue(val.substring(0, val.length - 1));
      }
    });

    this.formControl['request'].valueChanges.subscribe((val: string): void => {
      if (this.formControl['request'].hasError('pattern')) {
        this.formControl['request'].setValue(val.substring(0, val.length - 1));
      }
    });
  }

  /**
   * The valueChangesFormAuto function is a function
   * that subscribes to the valueChanges observable of each form control in the formAutoControl object.
   * The valueChanges observably emits an event every time there is a change in the input field of any of these controls.
   * When this happens,
   * we want to clear out all other dropdown lists
   * and set their values back to null so that they can be repopulated with new data from our API call.
   */
  valueChangesFormAuto(): void {
    this.formAutoControl['brand'].valueChanges.subscribe((value: string) => {
      this.listModels$ = [];
      this.listVersions$ = [];
      this.listClasses$ = [];
      this.formAutoControl['model'].setValue('', { emitEvent: false });
      this.formAutoControl['version'].setValue('', { emitEvent: false });
      this.formAutoControl['class'].setValue('', { emitEvent: false });
      this.formAutoControl['model'].disable({ emitEvent: false });
      this.formAutoControl['version'].disable({ emitEvent: false });
      this.formAutoControl['class'].disable({ emitEvent: false });

      if (!value) {
        return;
      }

      this.getModels();
    });

    this.formAutoControl['model'].valueChanges.subscribe((value: string) => {
      this.listVersions$ = [];
      this.listClasses$ = [];
      this.formAutoControl['version'].setValue('', { emitEvent: false });
      this.formAutoControl['class'].setValue('', { emitEvent: false });
      this.formAutoControl['version'].disable({ emitEvent: false });
      this.formAutoControl['class'].disable({ emitEvent: false });

      if (!value) {
        return;
      }

      this.getVersions();
    });

    this.formAutoControl['version'].valueChanges.subscribe((value: string) => {
      this.listClasses$ = [];
      this.formAutoControl['class'].setValue('', { emitEvent: false });
      this.formAutoControl['class'].disable({ emitEvent: false });

      if (!value) {
        return;
      }

      this.getClasses();
    });
  }

  getBrands(): void {
    this.spinner.show();
    this.bandejaSolicitudesService.getBrands().subscribe({
      next: (response: IResponse): void => {
        this.listBrands$ = response.listaMarcas;
      },
      error: (error: HttpErrorResponse): void => {
        console.error(error);
        this.spinner.hide();
      },
      complete: () => this.spinner.hide()
    });
  }

  getModels(): void {
    this.spinner.show();
    const brandId = this.formAutoControl['brand'].value;
    this.bandejaSolicitudesService.getModels(brandId).subscribe({
      next: (response: IResponse): void => {
        this.listModels$ = response.listaModelos;
        this.formAutoControl['model'].enable({ emitEvent: false });
      },
      error: (error: HttpErrorResponse): void => {
        console.error(error);
        this.spinner.hide();
      },
      complete: () => this.spinner.hide()
    });
  }

  getVersions(): void {
    this.spinner.show();
    const modelId = this.formAutoControl['model'].value;
    this.bandejaSolicitudesService.getVersions(modelId).subscribe({
      next: (response: IResponse): void => {
        this.listVersions$ = response.listaVersiones;
        this.formAutoControl['version'].enable({ emitEvent: false });
      },
      error: (error: HttpErrorResponse): void => {
        console.error(error);
        this.spinner.hide();
      },
      complete: () => this.spinner.hide()
    });
  }

  getClasses(): void {
    this.spinner.show();
    const versionDesc = this.listVersions$.find(x => x.idVersion == this.formAutoControl['version'].value)?.version;

    const payload = {
      idCanal: '2015000002',
      idMarca: this.formAutoControl['brand'].value,
      modelo: versionDesc
    };
    this.bandejaSolicitudesService.getClasses(payload).subscribe({
      next: (response: IResponse): void => {
        this.listClasses$ = response.listaClases;
        this.formAutoControl['class'].enable({ emitEvent: false });
      },
      error: (error: HttpErrorResponse): void => {
        console.error(error);
        this.spinner.hide();
      },
      complete: () => this.spinner.hide()
    });
  }


  resetForm(): void {
    this.form.reset();
    this.formControl['channel'].setValue(this.channelSales$.length > 1 ? 0 : this.currentUser.canal);
    this.formControl['startDate'].setValue(new Date('01-01-2022'));
    this.formControl['endDate'].setValue(new Date());
    this.formControl['state'].setValue(0);
    this.getRequests(true);
  }

  resetAll(): void {
    this.searchAgain = false;
    this.formMotiveReject.reset();
  }

  getDetail(data, actionType): void {
    this.requestActionTypeSelected = actionType;
    this.selectRequest = data;
    this.spinner.show();
    this.bandejaSolicitudesService.getDetail(data.idSolicitud).subscribe(
      (response: any) => {
        if (response.success) {
          this.requestInfo$ = response;
          this.vcr.createEmbeddedView(this.modalDetail);
        }
        this.spinner.hide();
      },
      (error: HttpErrorResponse) => {
        console.error(error);
        this.spinner.hide();
      }
    );
  }

  closeModal(): void {
    this.vcr.remove();

    const requestTypeExcludes: string[] = [this.requestTypeConfirm.CANCEL];
    if (this.modalConfirmRequestType && !requestTypeExcludes.includes(this.modalConfirmRequestType) && !this.searchAgain) {
      this.vcr.createEmbeddedView(this.modalDetail);
      return;
    }

    if (this.searchAgain) {
      this.getRequests(true);
      this.resetAll();
      this.requestActionTypeSelected = null;
      this.modalConfirmRequestType = null;
      this.authTechniqueCheckControl.setValue(false);
      this.selectRequest = null;
      this.resetFormAuto();
    }
  }

  closeModalDetail(): void {
    this.vcr.clear();
    this.resetAll();
    this.requestActionTypeSelected = null;
    this.modalConfirmRequestType = null;
    this.authTechniqueCheckControl.setValue(false);
    this.selectRequest = null;
    this.resetFormAuto();
  }

  resetFormAuto(): void {
    this.formAuto.patchValue({
      class: '',
      brand: '',
      model: '',
      version: ''
    }, { emitEvent: false });
    this.formAuto.disable({ emitEvent: false });
    this.formAutoControl['brand'].enable({ emitEvent: false });
    this.listClasses$ = [];
    this.listModels$ = [];
    this.listVersions$ = [];
  }

  getRequests(restart: boolean = false) {
    if (restart) {
      this.p = 1;
    }

    this.spinner.show();

    this.listRequest$ = [];

    const req = {
      idSolicitud: this.formControl['request'].value || 0,
      idCanal: this.formControl['channel'].value || 0,
      placa: this.formControl['licensePlate'].value?.toUpperCase() || null,
      idEstado: this.formControl['state'].value || 0,
      fechaInicio: moment(this.formControl['startDate'].value).format('DD/MM/YYYY'),
      fechaFin: moment(this.formControl['endDate'].value).format('DD/MM/YYYY'),
      indice: this.p,
      cantidadRegistros: 10
    };
    this.bandejaSolicitudesService.getRequests(req).subscribe({
      next: (response: any): void => {
        this.spinner.hide();

        if (response.success) {
          this.listRequest$ = response.listado;
        }
      },
      error: (error: any): void => {
        console.log(error);
        this.spinner.hide();
      }
    });
  }

  private set selectRequest(data: any) {
    this.requestSelected = data;
  }

  getParameters(): void {
    this.bandejaSolicitudesService.getParameters().subscribe(
      (response: Response<Parameters>): void => {
        if (response.success) {
          this.listDocumentsAttach$ = response.data.listDocumentsAttach;
          this.listReasons$ = response.data.listReasons;
          this.listStates$ = response.data.listStates;
        }
      },
      (error: HttpErrorResponse) => {
        console.error(error);
      }
    );
  }

  channelSales(): void {
    this.utilsService.channelSales(+this.currentUser['id']).subscribe(
      (response: ChannelSalesModel) => {
        if (response.items.length) {
          this.channelSales$ = response.items;
          if (this.channelSales$.length == 1) {
            this.formControl['channel'].setValue(this.channelSales$[0].id);
          }
        }
        this.getRequests();
      },
      (error: HttpErrorResponse) => {
        console.error(error);
      }
    );
  }

  getLogHistory(data: any): void {
    this.requestSelected = data;
    this.spinner.show();
    this.bandejaSolicitudesService.getLogHistory(data.idSolicitud).subscribe({
      next: (response: any): void => {
        if (response.success) {
          this.requestLogHistory$ = response.historial ?? [];
          this.vcr.createEmbeddedView(this.modalHistory);
        }
      },
      error: (error: HttpErrorResponse): void => {
        console.error(error);
        this.spinner.hide();
      },
      complete: () => this.spinner.hide()
    });
  }

  /**
   * The downloadFileRequest function is used to download a file from the server.
   * @param data: any Receive the data that is sent from the component
   */
  downloadFileRequest(data: any): void {
    this.utilsService.downloadFile({
      fileName: `${data.nombreArchivo}`,
      fileBase64: data.archivo,
    });
  }

  /**
   * The openModalConfirm function opens a modal window that allows the user to confirm or reject a request.
   * @param data Get the data of the request that is going to be approved or rejected
   * @param type Determine the type of request that is being made
   */
  openModalConfirm(data, type): void {
    if (type == this.requestTypeConfirm.APPROVE && this.isInvalidRequestForApprove) {
      return;
    }

    this.modalConfirmRequestType = type;
    this.selectRequest = data;

    this.vcr.remove();
    if (this.modalConfirmRequestType == this.requestTypeConfirm.REJECT) {
      this.vcr.createEmbeddedView(this.modalMotiveReject);
      return;
    }
    this.vcr.createEmbeddedView(this.modalConfirm);
  }

  /**
   * The acceptConfirm function is called when the user clicks on the &quot;Yes&quot; button in a modal.
   * It calls one of four functions depending on which type of request was made:
   * approveRequest, cancelRequest, rejectRequest or sendToTechnique.
   * @return Void
   */
  acceptConfirm(): void {
    this.searchAgain = false;
    switch (this.modalConfirmRequestType) {
      case this.requestTypeConfirm.APPROVE:
        this.approveRequest();
        break;
      case this.requestTypeConfirm.CANCEL:
        this.cancelRequest();
        break;
      case this.requestTypeConfirm.REJECT:
        this.rejectRequest();
        break;
      case this.requestTypeConfirm.SEND_TECHNIQUE:
        this.sendToTechnique();
        break;
    }
  }

  private sendToTechnique(): void {
    this.spinner.show();

    const payload = {
      idSolicitud: this.requestSelected.idSolicitud,
      idUsuario: this.currentUser['id'],
    };
    this.bandejaSolicitudesService.sendToTechnique(payload).subscribe({
      next: (response: IResponse): void => {
        this.searchAgain = response.success;
        this.messageResponse = {
          success: response.success,
          message: response.success ? 'Se notificó correctamente al área técnica' : 'Ocurrió un error al notificar al área técnica',
          showImage: true
        };

        this.vcr.clear();
        this.vcr.createEmbeddedView(this.modalMessage);
      },
      error: (error: HttpErrorResponse): void => {
        console.error(error);
        this.spinner.hide();

        this.messageResponse = {
          success: false,
          message: 'Ocurrió un error al notificar al área técnica',
          showImage: true
        };

        this.vcr.clear();
        this.vcr.createEmbeddedView(this.modalMessage);
      },
      complete: () => this.spinner.hide()
    });
  }

  private cancelRequest(): void {
    const payload = {
      idSolicitud: this.requestSelected.idSolicitud,
      idUsuario: +this.currentUser['id'],
    };

    this.spinner.show();
    this.bandejaSolicitudesService.cancelRequest(payload).subscribe({
      next: (response: IResponse): void => {
        this.searchAgain = response.success;

        this.messageResponse = {
          success: response.success,
          showImage: true
        };

        if (response.success) {
          this.messageResponse.message = `Se anuló correctamente la solicitud Nro ${this.requestSelected.idSolicitud}`;
        } else {
          this.messageResponse.message = `Ocurrió un error al anular la solicitud Nro ${this.requestSelected.idSolicitud}`;
        }

        this.vcr.clear();
        this.vcr.createEmbeddedView(this.modalMessage);
      },
      error: (error: HttpErrorResponse): void => {
        console.error(error);
        this.messageResponse = {
          success: false,
          showImage: true
        };
        this.messageResponse.message = `Ocurrió un error al anular la solicitud Nro ${this.requestSelected.idSolicitud}`;
        this.vcr.clear();
        this.vcr.createEmbeddedView(this.modalMessage);
        this.spinner.hide();
      },
      complete: () => this.spinner.hide()
    });
  }

  private approveRequest(): void {
    this.spinner.show();
    const clase = this.listClasses$.find(x => x.idClase == this.formAutoControl['class'].value);
    const brand = this.listBrands$.find(x => x.idMarca == this.formAutoControl['brand'].value);
    const model = this.listModels$.find(x => x.idModelo == this.formAutoControl['model'].value);
    const version = this.listVersions$.find(x => x.idVersion == this.formAutoControl['version'].value);

    const payload = {
      idSolicitud: this.requestSelected.idSolicitud,
      idUsuario: +this.currentUser['id'],
      idMarca: brand.idMarca,
      marca: brand.marca,
      idModelo: model.idModelo,
      modelo: model.modelo,
      idVersion: version.idVersion,
      version: version.version,
      idClase: clase.idClase,
      clase: clase.clase
    };
    this.bandejaSolicitudesService.approveRequest(payload).subscribe({
      next: (response: IResponse): void => {
        this.searchAgain = response.success;

        this.messageResponse = {
          success: response.success,
          showImage: true
        };

        if (response.success) {
          this.messageResponse.message = `Se aprobó correctamente la solicitud Nro ${this.requestSelected.idSolicitud}`;
        } else {
          this.messageResponse.message = `Ocurrió un error al aprobar la solicitud Nro ${this.requestSelected.idSolicitud}`;
        }

        this.vcr.clear();
        this.vcr.createEmbeddedView(this.modalMessage);
      },
      error: (error: HttpErrorResponse): void => {
        console.error(error);
        this.messageResponse = {
          success: false,
          showImage: true
        };
        this.messageResponse.message = `Ocurrió un error al aprobar la solicitud Nro ${this.requestSelected.idSolicitud}`;

        this.vcr.clear();
        this.vcr.createEmbeddedView(this.modalMessage);
        this.spinner.hide();
      },
      complete: () => this.spinner.hide()
    });
  }

  rejectRequest(): void {
    this.spinner.show();

    const payload = {
      idSolicitud: this.requestSelected.idSolicitud,
      idUsuario: +this.currentUser['id'],
      idMotivo: this.formMotiveRejectControl['motive'].value,
      observacion: this.formMotiveRejectControl['observation'].value
    };
    this.bandejaSolicitudesService.rejectRequest(payload).subscribe({
      next: (response: IResponse): void => {
        this.searchAgain = response.success;

        this.messageResponse = {
          success: response.success,
          showImage: true
        };

        if (response.success) {
          this.messageResponse.message = `Se rechazó correctamente la solicitud Nro ${this.requestSelected.idSolicitud}`;
        } else {
          this.messageResponse.message = `Ocurrió un error al rechazar la solicitud Nro ${this.requestSelected.idSolicitud}`;
        }

        this.vcr.clear();
        this.vcr.createEmbeddedView(this.modalMessage);
      },
      error: (error: HttpErrorResponse): void => {
        console.error(error);
        this.messageResponse = {
          success: false,
          showImage: true
        };
        this.messageResponse.message = `Ocurrió un error al rechazar la solicitud Nro ${this.requestSelected.idSolicitud}`;

        this.vcr.clear();
        this.vcr.createEmbeddedView(this.modalMessage);
        this.spinner.hide();
      },
      complete: () => this.spinner.hide()
    });
  }

  get isInvalidRequestForApprove(): boolean {
    const isFormWithValues = this.formAutoControl['brand'].value &&
      this.formAutoControl['model'].value &&
      this.formAutoControl['version'].value &&
      this.formAutoControl['class'].value;

    if (this.requestSelected.idEstadoSolicitud == 1) {
      return !isFormWithValues;
    }

    return !isFormWithValues || this.authTechniqueCheckControl.invalid;
  }
}
