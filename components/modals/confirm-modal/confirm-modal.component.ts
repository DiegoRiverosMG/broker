import { Component, OnInit, Input } from '@angular/core';
import { SweetAlertIcon } from 'sweetalert2';
import { RentasService } from '../../../../backoffice/services/rentas/rentas.service';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-confirm-modal',
  templateUrl: './confirm-modal.component.html',
  styleUrls: ['./confirm-modal.component.css'],
})
export class ConfirmModalComponent implements OnInit {
  @Input() public formModalReference: any; // Referencia al modal creado desde el padre de este componente para ser cerrado desde aquí
  @Input() public tickets: any;
  @Input() public NUSERCODE: number;
  @Input() public NIDPROFILE: number;

  inputs: any = {};
  mensaje: [SweetAlertIcon, string, string] | undefined;
  ejecutivos: any[] = [];
  opcionesEjecutivos: any[] = [];

  constructor(
    private rentasService: RentasService,
    public activeModal: NgbActiveModal
  ) {}

  async ngOnInit() {
    try {
      const message = await this.getMessage(21);
      this.mensaje = this.separateString(message);
    } catch (error) {
      console.error('Error en ngOnInit:', error);
      this.mensaje = ['error', 'Error', 'No se pudo cargar el mensaje.'];
    }
  }

  select() {
    this.activeModal.close();
  }

  async getMessage(nerror: number): Promise<string> {
    const data = { P_NERRORNUM: nerror };
    try {
      const res = await this.rentasService.getMessage(data).toPromise();
      return res.C_TABLE[0].SMESSAGE;
    } catch (error) {
      console.error('Error al obtener el mensaje:', error);
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
