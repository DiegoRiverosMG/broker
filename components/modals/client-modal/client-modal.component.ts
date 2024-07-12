import { Component, OnInit, Input } from '@angular/core';
//Importación de servicios

import swal, { SweetAlertIcon } from 'sweetalert2';
import { RentasService } from '../../../../backoffice/services/rentas/rentas.service';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import Swal from 'sweetalert2';
import { AccPersonalesConstants } from '../../quote/acc-personales/core/constants/acc-personales.constants';

@Component({
  selector: 'app-client-modal',
  templateUrl: './client-modal.component.html',
  styleUrls: ['./client-modal.component.css'],
})
export class ClientModalComponent implements OnInit {
  @Input() public formModalReference: any; //Referencia al modal creado desde el padre de este componente para ser cerrado desde aquí
  @Input() public client: any;
  @Input() public listActions: any;
  CONSTANTS: any = AccPersonalesConstants;

  inputs: any = {};

  tipoDocumentos: any = [];
  opcionesTipoDocumentos: any = [];
  tipoPersonas: any = [];
  opcionesTipoPersonas: any = [];

  clients: any = [];

  filters: any = {};
  filteredClients: any[] = []; // Clientes filtrados por la búsqueda
  searchQuery: string = ''; // Texto de búsqueda
  currentPage: number = 1;
  pageSize: number = 10;
  totalClients: number = 0;
  displayedClients: any;
  itemsPerPage: number = 10;
  isLoading: boolean = false;
  showPagination: boolean = false;
  totalPage: number = 0;
  constructor(
    private rentasService: RentasService,
    public activeModal: NgbActiveModal
  ) {}

  ngOnInit() {
    this.inputs.P_TYPE_SEARCH = 1;
    this.inputs.P_TYPE_PERSON = 1;
    this.getTipoDocumentos();
    this.getTipoPersonas();
  }
  drop(ev) {
    ev.preventDefault();
    var data = ev.dataTransfer.getData('text');
    var draggedElement = document.getElementById(data);
    var targetElement = ev.target;
    if (
      targetElement.tagName === 'BUTTON' &&
      draggedElement instanceof HTMLButtonElement
    ) {
      if (draggedElement !== targetElement) {
        var replacedText = targetElement.innerText;
        targetElement.innerText = draggedElement.innerText;
        draggedElement.innerText = replacedText;
      }
    }
  }

  allowDrop(ev) {
    ev.preventDefault();
  }

  drag(ev) {
    ev.dataTransfer.setData('text', ev.target.id);
  }

  onSelectTypeSearch(value: number) {
    this.inputs.P_TYPE_SEARCH = value;
    if (this.inputs.P_TYPE_SEARCH == 1) {
      this.inputs.nombre = '';
      this.inputs.ApePaterno = '';
      this.inputs.ApeMaterno = '';
      this.inputs.razonSocial = '';
    } else if (this.inputs.P_TYPE_SEARCH == 2) {
      this.inputs.typeDocument.codigo = 1;
      this.inputs.NumberDocument = '';
    }
  }

  getTipoDocumentos() {
    this.rentasService.getListTipoDocumentos().subscribe({
      next: (response) => {
        this.tipoDocumentos = response.C_TABLE;

        this.opcionesTipoDocumentos = this.tipoDocumentos.map(
          (tipoDocumento) => {
            return {
              codigo: tipoDocumento.NCODE,
              valor: tipoDocumento.SDESCRIPT,
            };
          }
        );
      },
      error: (error) => {
        console.error(error);
      },
    });
  }
  getTipoPersonas() {
    this.rentasService.getListTipoPersonas().subscribe({
      next: (response) => {
        this.tipoPersonas = response.C_TABLE;

        this.opcionesTipoPersonas = this.tipoPersonas.map((tipoPersona) => {
          return {
            codigo: tipoPersona.NCODE,
            valor: tipoPersona.SDESCRIPT,
          };
        });
      },
      error: (error) => {
        console.error(error);
      },
    });
  }
  getClients(filters) {
    this.rentasService.getListClients(filters).subscribe({
      next: (response) => {
        this.clients = response.C_TABLE;
        this.totalClients = this.clients.length;
        this.filterClients();
        this.isLoading = false;
        this.showPagination = true;
      },
      error: (error) => {
        this.isLoading = false;
        console.error(error);
      },
    });
  }
  async filter() {
    const mensaje = await this.getMessage(18);
    const mensaje2 = await this.getMessage(19);
    const mensaje3 = await this.getMessage(32);
    const mensajeParts: [SweetAlertIcon, string, string] =
      this.separateString(mensaje);
    const mensajeParts2: [SweetAlertIcon, string, string] =
      this.separateString(mensaje2);
    const mensajeParts3: [SweetAlertIcon, string, string] =
      this.separateString(mensaje3);

    this.isLoading = true;
    this.isLoading = true;
    this.filters = {
      P_NTIPO_BUSQUEDA: this.inputs.P_TYPE_SEARCH,
      P_NTIPO_DOC: this.inputs.typeDocument.codigo,
      P_NNUM_DOC: this.inputs.NumberDocument,
      P_SNOMBRE: this.inputs.nombre,
      P_SAP_PATERNO: this.inputs.ApePaterno,
      P_SAP_MATERNO: this.inputs.ApeMaterno,
      P_SNOMBRE_LEGAL: this.inputs.razonSocial,
    };
    if (this.inputs.P_TYPE_SEARCH == 1) {
      this.inputs.nombre = '';
      this.inputs.ApePaterno = '';
      this.inputs.ApeMaterno = '';
      this.inputs.razonSocial = '';
      const data = {
        P_NTYPCLIENTDOC: this.inputs.typeDocument.codigo,
        P_SCLINUMDOCU: this.inputs.NumberDocument,
      };
      this.rentasService.valFormat(data).subscribe({
        next: (response) => {
          if (response.P_SVALIDA == 2) {
            swal.fire({
              icon: mensajeParts[0],
              title: mensajeParts[1],
              text: mensajeParts[2],
            });
            this.isLoading = false;
            return;
          } else {
            this.getClients(this.filters);
          }
        },
        error: (error) => {
          this.isLoading = false;
          console.error(error);
        },
      });
    } else if (this.inputs.P_TYPE_SEARCH == 2) {
      this.inputs.typeDocument.codigo = 1;
      this.inputs.NumberDocument = '';
      if (this.inputs.tipoPersona.codigo == 1) {
        this.inputs.razonSocial = '';
        let nombre = this.inputs.nombre;
        let apePaterno = this.inputs.ApePaterno;
        let apeMaterno = this.inputs.ApeMaterno;

        let camposLlenos = 0;
        if (nombre && nombre.trim() !== '') camposLlenos++;
        if (apePaterno && apePaterno.trim() !== '') camposLlenos++;
        if (apeMaterno && apeMaterno.trim() !== '') camposLlenos++;

        if (camposLlenos < 2) {
          Swal.fire({
            icon: mensajeParts2[0],
            title: mensajeParts2[1],
            text: mensajeParts2[2],
          });
          this.isLoading = false;
          return;
        } else {
          this.getClients(this.filters);
        }
      } else if (
        this.inputs.tipoPersona.codigo == 2 &&
        (this.inputs.razonSocial == '' || this.inputs.razonSocial == undefined)
      ) {
        this.inputs.nombre = '';
        this.inputs.ApePaterno = '';
        this.inputs.ApeMaterno = '';
        Swal.fire({
          icon: mensajeParts3[0],
          title: mensajeParts3[1],
          text: mensajeParts3[2],
        });
        this.isLoading = false;
        return;
      } else {
        this.getClients(this.filters);
      }
    }
  }

  filterClients() {
    const query = this.searchQuery.toLowerCase();
    this.filteredClients = this.clients.filter(
      (client) =>
        client.STYPCLIENTDOC.toLowerCase().includes(query) ||
        client.SCLINUMDOCU.toLowerCase().includes(query) ||
        client.SCLIENAME.toLowerCase().includes(query)
    );
    this.totalClients = this.filteredClients.length;
    this.currentPage = 1;
    this.paginateClients();
  }

  paginateClients() {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = Math.min(startIndex + this.pageSize, this.totalClients);
    this.displayedClients = this.filteredClients.slice(startIndex, endIndex);
    this.getTotalPages();
  }

  changePage(pageNumber: number) {
    this.currentPage = pageNumber;
    this.paginateClients();
  }

  changeItemsPerPage() {
    this.pageSize = this.itemsPerPage;
    this.currentPage = 1;
    this.paginateClients();
  }
  seleccionarCliente(client: any) {
    this.client = client;
  }
  async select() {
    const mensaje = await this.getMessage(31);
    const mensajeParts: [SweetAlertIcon, string, string] =
      this.separateString(mensaje);

    if (this.client == null || this.client == undefined || this.client == '') {
      Swal.fire({
        icon: mensajeParts[0],
        title: mensajeParts[1],
        text: mensajeParts[2],
      });
    } else {
      this.activeModal.close(this.client);
    }
  }

  changePerson() {
    if (this.inputs.tipoPersona.codigo == 1) {
      this.inputs.nombre = '';
      this.inputs.ApePaterno = '';
      this.inputs.ApeMaterno = '';
    } else if (this.inputs.tipoPersona.codigo == 2) {
      this.inputs.razonSocial = '';
    }
  }
  messageError;
  getTotalPages() {
    this.totalPage = Math.ceil(this.totalClients / this.itemsPerPage);
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
