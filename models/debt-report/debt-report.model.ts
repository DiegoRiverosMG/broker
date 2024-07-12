export class DebtReportModel {
  data: Array<{
    nombreCanal: string;
    certificado: string;
    contratante: string;
    placa: string;
    fechaEmision: string;
    fechaInicioVigencia: string;
    fechaFinVigencia: string;
    primaTotal: number;
    numeroPlanilla: string;
    estadoPlanilla: string;
    aplicaDeuda: string;
    comprobante: string;
  }>;

  constructor(payload: any) {
    this.data = payload.map((map) => ({
      nombreCanal: map.canal,
      certificado: map.certificado,
      contratante: map.contratante,
      placa: map.placa,
      fechaEmision: map.fechaEmision,
      fechaInicioVigencia: map.fechaInicio,
      fechaFinVigencia: map.fechaFin,
      primaTotal: map.prima,
      numeroPlanilla: map.numeroPlanilla,
      estadoPlanilla: map.estadoPlanilla,
      aplicaDeuda: map.aplicaDeuda,
      comprobante: map.comprobante
    }));
  }
}
