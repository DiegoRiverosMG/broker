import {
  Component,
  OnInit,
  Input,
  HostListener,
  OnDestroy,
} from '@angular/core';

import { SweetAlertIcon } from 'sweetalert2';
import { RentasService } from '../../../../backoffice/services/rentas/rentas.service';
import Swal from 'sweetalert2';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-comentario-modal',
  templateUrl: './comentario-modal.component.html',
  styleUrls: ['./comentario-modal.component.css'],
})
export class ComentarioModalComponent implements OnInit, OnDestroy {
  @Input() public formModalReference: any; //Referencia al modal creado desde el padre de este componente para ser cerrado desde aquí
  @Input() public NUSERCODE: number;
  @Input() public NIDPROFILE: number;
  @Input() public POPUPDATA: number;
  @Input() public ticket: any;

  inputs: any = {};
  listAdj: any = [];
  tipoComentario: any[];
  opcionesTipoComentario: any[] = [];
  destinatarios: any[];
  opcionesDestinatarios: any[];
  semails: string;
  P_NCODE: Number;
  P_SMESSAGE: string[];
  constructor(
    private rentasService: RentasService,
    public activeModal: NgbActiveModal
  ) {}

  ngOnInit() {
    this.getListAdj();
    document.addEventListener('click', this.onDocumentClick.bind(this));
    this.getListTypeComments();
    this.getListDestination();
  }

  getListAdj() {
    const data = {
      P_NTICKET: this.ticket.NTICKET,
    };
    this.rentasService.getListAdj(data).subscribe({
      next: (response) => {
        this.listAdj = response.P_CURSOR;
      },
      error: (error) => {
        console.error(error);
      },
    });
  }

  updAttachmentAdj(P_NID: number, P_NTYPEATTACHMENT: number) {
    const data = {
      P_NTICKET: this.ticket.NTICKET,
      P_NTYPEATTACHMENT: P_NTYPEATTACHMENT,
      P_NID: P_NID,
    };
    this.rentasService.updAttachmentAdj(data).subscribe({
      next: (response) => {},
      error: (error) => {
        console.error(error);
      },
    });
  }

  options: Option[] = [
    { code: 0, value: '-- Seleccione --' },
    { code: 1, value: 'Cliente' },
    { code: 2, value: 'AFP' },
    { code: 3, value: 'Solucion de clientes' },
  ];
  isSelectVisible: boolean = false;
  selectedOptions: Option[] = [this.options[0]];
  selectedOptionsValue(): string {
    return this.selectedOptions.map((option) => option.value).join(', ');
  }

  onSelectChange(event: Event): void {
    const selected = (event.target as HTMLSelectElement).selectedOptions;
    this.selectedOptions = Array.from(selected).map((option) => {
      const code = option.getAttribute('value');
      return this.options.find((o) => o.code == Number(code!));
    });

    this.getEmailDestination(this.selectedOptionsCode());
  }

  selectedOptionsCode(): string {
    return this.selectedOptions.map((option) => option.code).join(',');
  }
  isOption2Selected(): boolean {
    return this.selectedOptions.some((option) => option.code == 2);
  }

  toggleSelectVisibility(): void {
    this.isSelectVisible = !this.isSelectVisible;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.container-multi-select') && this.isSelectVisible) {
      this.isSelectVisible = false;
    }
  }

  ngOnDestroy(): void {
    document.removeEventListener('click', this.onDocumentClick.bind(this));
  }

  getListTypeComments() {
    //SERVICIO PARA LISTAR LOS
    this.rentasService.getListTypeComments().subscribe({
      next: (response) => {
        this.tipoComentario = response.C_TABLE;

        this.opcionesTipoComentario = this.tipoComentario.map((motivo) => {
          return {
            codigo: motivo.NCODE,
            valor: motivo.SDESCRIPT,
          };
        });
      },
      error: (error) => {
        console.error(error);
      },
    });
  }

  getListDestination() {
    //SERVICIO PARA LISTAR LOS
    this.rentasService.getListDestination().subscribe({
      next: (response) => {
        this.destinatarios = response.C_TABLE;

        this.opcionesDestinatarios = this.destinatarios.map((motivo) => {
          return {
            code: motivo.NCODE,
            value: motivo.SDESCRIPT,
          };
        });
      },
      error: (error) => {
        console.error(error);
      },
    });
  }

  getEmailDestination(P_STYPE_DEST: string) {
    const data = {
      P_NTICKET: this.ticket.NTICKET,
      P_STYPE_DEST: P_STYPE_DEST,
    };
    //SERVICIO PARA LISTAR LOS
    this.rentasService.getEmailDestination(data).subscribe({
      next: (response) => {
        this.semails = response.C_TABLE[0].SEMAILS;
        this.P_NCODE = response.P_NCODE;
        this.P_SMESSAGE = response.P_SMESSAGE.split('||').filter(
          (part) => part.trim() !== ''
        );
      },
      error: (error) => {
        console.error(error);
      },
    });
  }

  enviar() {
    const commentData = {
      P_NTYPECOMMENT: this.inputs.NCOMMUNICATION_TYPE.codigo,
      P_SCOMMETS: this.inputs.SEMAIL_MESSAGE,
      P_NTICKET: this.ticket.NTICKET,
      P_SEMAIL_MESSAGE: this.inputs.SEMAIL_MESSAGE,
      P_SEMAIL_SUBJECT: this.inputs.SEMAIL_SUBJECT,
      P_NBRANCH: this.ticket.NRAMO,
      P_NPRODUCT: this.ticket.NPRODUCT,
      P_NMOTIV: this.ticket.NMOTIV,
      P_NSUBMOTIV: this.ticket.NSUBMOTIV,
      P_NPOLICY: this.ticket.POLIZA,
      P_NUSERCODE: this.NUSERCODE,
      P_NCOMMUNICATION_TYPE: this.inputs.NCOMMUNICATION_TYPE.codigo,
      POPUPDATA: this.POPUPDATA,
    };
    this.activeModal.close(commentData);
  }
  async validateForm() {
    const mensaje = await this.getMessage(26);
    const mensajeParts: [SweetAlertIcon, string, string] =
      this.separateString(mensaje);

    if (this.POPUPDATA === 3) {
      if (
        this.inputs.NCOMMUNICATION_TYPE.codigo == '' ||
        this.inputs.SEMAIL_SUBJECT == undefined ||
        this.inputs.SEMAIL_SUBJECT == '' ||
        this.inputs.SEMAIL_MESSAGE == undefined ||
        this.inputs.SEMAIL_MESSAGE == '' ||
        this.selectedOptions[0].code == 0
      ) {
        Swal.fire({
          icon: mensajeParts[0],
          title: mensajeParts[1],
          text: mensajeParts[2],
        });
        return;
      }
    } else {
      if (
        this.inputs.NCOMMUNICATION_TYPE.codigo == '' ||
        this.inputs.SEMAIL_MESSAGE == undefined ||
        this.inputs.SEMAIL_MESSAGE == ''
      ) {
        Swal.fire({
          icon: mensajeParts[0],
          title: mensajeParts[1],
          text: mensajeParts[2],
        });
        return;
      }
    }
    this.enviar();
  }

  async getMessage(nerror: number): Promise<string> {
    const data = {
      P_NERRORNUM: nerror,
    };
    try {
      const res = await this.rentasService.getMessage(data).toPromise();
      return res.C_TABLE[0].SMESSAGE;
    } catch (error) {
      console.error(error);
      return 'Error al obtener el mensaje';
    }
  }

  separateString(input: string): [SweetAlertIcon, string, string] {
    const delimiter = '||';
    const parts = input.split(delimiter);

    if (parts.length !== 3) {
      throw new Error(
        'El código de mensaje no se ha encontrado. Por favor, contacte con el área de TI.'
      );
    }

    const validIcons: SweetAlertIcon[] = [
      'success',
      'error',
      'warning',
      'info',
      'question',
    ];
    if (!validIcons.includes(parts[0] as SweetAlertIcon)) {
      throw new Error(
        'Icono no válido. Por favor, contacte con el área de TI.'
      );
    }
    return [parts[0] as SweetAlertIcon, parts[1], parts[2]];
  }
}
interface Option {
  code: number;
  value: string;
}
