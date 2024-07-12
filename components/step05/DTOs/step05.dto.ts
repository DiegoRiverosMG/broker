export interface FilesDocumentOfUsos {
  idTipoDocumento: number;
  file: any;
}
export interface SendAprobacionDocsDto {
  idProcess: number;
  idUsuario: number;
  idUso: number;
  zonaCirculacion: number;
  codigoCanal: number;
  codigoPuntoVenta: number;
  adjuntos: {
    idTipoDocumento: number;
    nombreArchivo: any;
  }[];
}
