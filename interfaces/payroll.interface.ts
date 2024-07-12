export interface IPaymentListRequest {
  idMoneda: number;
  idTipo: number;
  recibos: Array<{
    numeroRecibo: number;
  }>;
}

export interface IPaymentListResponse {
  success: boolean;
  errorMessage: string;
  result: Array<{
    codigoRamo: string;
    ramo: string;
    codigoCliente: string;
    cliente: string;
    numeroOperacion: string;
    importe: string;
    fechaRegistro: string;
    idTipoPago: string;
    tipoPago: string;
  }>;
}
