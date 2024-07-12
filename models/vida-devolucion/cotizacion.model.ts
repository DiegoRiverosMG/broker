export class CotizacionModel {
  years: string;
  currency: string;
  sumAssured: string;
  returnPercentage: number;
  primaMensual: number;
  typeBeneficiaries: string;
  beneficiaries: Array<any>;
  simbolCurrency: string;
  currencyDescription: string;
  primeraCuota: number;
  primaAnual: number;
  primaRetorno: number;
  primaFallecimiento: number;
  plan: number;
  idTarifario: number;
  processId: number;
  estado: {
    id: number;
    descripcion: string;
  };
  selected: boolean;

  constructor(payload: any) {
    this.years = payload.cantidadAnios;
    this.currency = null;
    this.sumAssured = payload.sumaAsegurada;
    this.returnPercentage = payload.porcentajeRetorno;
    this.primaMensual = null;
    this.typeBeneficiaries = null;
    this.beneficiaries = [];
    this.simbolCurrency = null;
    this.currencyDescription = payload.moneda;
    this.primeraCuota = null;
    this.primaAnual = null;
    this.primaRetorno = null;
    this.primaFallecimiento = null;
    this.plan = null;
    this.idTarifario = null;
    this.processId = payload.idProceso;
    this.estado = {
      id: null,
      descripcion: payload.estado
    };
    this.selected = false;
  }
}
