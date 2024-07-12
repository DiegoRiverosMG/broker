export class Plan {
  nmodulec: string;
  sdescript: string;
}

export class PlanTariff {
  id: string;
  descripcion: string;
  precio: number;

  comisionBroker: number;
  comisionIntermediario: number;
  comisionPuntoVenta: number;
  precioRegular: number;
}
