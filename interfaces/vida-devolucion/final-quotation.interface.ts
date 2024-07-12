export interface IFinalQuotation {
  idProcess: number;
  idUsuario: number;
  dps: string;
  url: string;
  contratante: {
    telefono: string;
    correo: string;
    direccion: string;
    idEstadoCivil: string;
    fechaNacimiento: string;
    idDepartamento: string;
    idProvincia: string;
    idDistrito: string;
    idActividad: string;
    idOcupacion: string;
    obligacionFiscal: string;
  };
  scoring: {
    calcular: boolean;
    actividadEconomica: string;
    sujetoObligado: string;
    regimenDiligencia: string;
    edad: string; // Cálculo
    ingresoMensual: string;
    periodoVigencia: string;
    primaAnual: string;
    moneda: string;
    canal: string;
    tipoProducto: string;
    nacionalidad: string;
    residencia: string
  };
}
