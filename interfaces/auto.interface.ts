export interface ICalculateAutoPremiumRequest {
  TarifaId: number;
  Canal: number;
  Placa: string;
  Fecha: string;
  BrokerId: number;
  IntermediaId: number;
  SalesPointId: number;
  PuntoVenta: number;
  Cliente: string;
  Departamento: number;
  IdProcess: number;
  Carroceria: number;
  ClaseId: number;
  UsoId: number;
  MarcaId: number;
  ModeloId: number;
  CantidadAsientos: number;
  Moneda: string;
  TipoPersona: number;
  CategoriaId: number;
  TipoPapel: number;
  Plan: number;
  IsPd: boolean;
}

export interface ICalculateAutoPrmeiumResponse {
  comisionBroker: number;
  comisionIntermediario: number;
  descripcion: string;
  grossUpBroker: number;
  grossUpIntermediario: number;
  id: string;
  precio: number;
  precioRegular: number;
  renovation: boolean;
}
