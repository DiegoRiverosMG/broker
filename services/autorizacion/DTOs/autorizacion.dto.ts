export class DocumentHistoryDto {
  nombreEstado: string;
  fechaRegistro: string;
  usuario: string;
  comentario: string;
}
export class DocumentUsosDto {
  idProceso: number;
  cantidadAdjuntos: number;
  codigoCanal: number;
  nombreCanal: string;
  codigoPuntoVenta: number;
  nombrePuntoVenta: string;
  codigoTipoCanal: number;
  nombreTipoCanal: string;
  codigoUso: number;
  nombreUso: string;
  usuario: string;
  estado: string;
  segmento: string;
  sla: string;
  fechaSolicitud: string;
  fechaExpiracion: string;
  placa: string;
}
export class DocumentosSubidosDto {
  idProceso: number;
  codigoTipoDocumento: number;
  nombreTipoDocumento: string;
  nombreArchivo: string;
  archivo: string;
}
