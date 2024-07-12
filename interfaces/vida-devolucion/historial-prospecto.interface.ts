export interface IHistorialProspectoResponse {
  success: boolean;
  message: string;

  historial: Array<{
    idCliente: string;
    estado: string;
    usuario: string;
    origen: string;
    fechaRegistro: string;
  }>;
}
