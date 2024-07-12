import { AttachDocument, Item } from '../interfaces/request-tray.interface';

export class Parameters {
  listDocumentsAttach: AttachDocument[];
  listStates: Item[];
  listReasons: Item[];

  constructor(payload) {
    this.listDocumentsAttach = payload.listadoDocumentos?.map((item): AttachDocument => ({
      id: +item.idTipoDocumento,
      required: item.obligatorio == 'SI',
      documentType: item.tipoDocumento,
    })) ?? [];
    this.listStates = payload.listadoEstados?.map((item): Item => ({
      id: +item.idEstado,
      label: item.estado
    })) ?? [];
    this.listReasons = payload.listadoMotivos?.map((item): Item => ({
      id: +item.idMotivo,
      label: item.motivo
    })) ?? [];
  }
}
