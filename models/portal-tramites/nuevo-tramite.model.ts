export class NuevoTramiteRequest {
  idRamo: string;
  idProducto: string;
  codigoCanal: string;
  poliza: string;
  placa: string;
  idTipoTramite: string;
  idMotivo: string;
  idEstado: string;
  idUsuario: string;

  detalle: Array<{
    campo: string;
    vigente: string;
    solicitado: string;
  }>;
  adjuntos: Array<{
    IdTipoDocumento: string;
    NombreArchivo: string;
  }>;

  constructor(_: any) {
    this.idRamo = _.branchId;
    this.idProducto = _.productId;
    this.codigoCanal = _.channelCode;
    this.poliza = _.policy;
    this.placa = _.licensePlate;
    this.idTipoTramite = _.transactType;
    this.idMotivo = _.motiveId;
    this.idEstado = _.stateId;
    this.idUsuario = _.userId;

    this.detalle = _.detail.map((val) => ({
      campo: val.camp,
      vigente: val.current,
      solicitado: val.requested
    }));

    this.adjuntos = _.attachments.map((val) => ({
      IdTipoDocumento: val.documentTypeId,
      NombreArchivo: val.fileName
    }));
  }
}
