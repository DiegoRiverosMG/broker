import * as moment from "moment";

export class Auto {
  p_NIDPROCESS: string; // Para el retorno a la pantalla
  p_NIDFLOW: string; // FLUJO 1: CLIENTE FINAL | 2: CANAL DE VENTA
  p_NREMINDER: string; // 1: ACTIVADO (Para Cliente siempre es 1) | 0 : DESACTIVADO (Para canal de Venta 0)
  p_SREGIST: string; // PLACA
  p_NIDCLASE: string; // IDENTIFICADOR DE LA CLASE
  p_SNAMECLASE: string; // NOMBRE DE LA CLASE
  p_NIDUSO: string; // IDENTIFICADOR DE LA USO
  p_SNAME_USO: string; // IDENTIFICADOR DE LA USO
  p_NVEHBRAND: string; // CODIGO DE MARCA
  p_SNAME_VEHBRAND: string; // NOMBRE DE LA MARCA
  p_NVEHMODEL: string; // CODIGO DE MODELO
  p_SNAME_VEHMODEL: string; // NOMBRE DE MODELO
  p_SNUMSERIE: string; // NUMERO DE SERIE
  p_SEATNUMBER: string; // NUMERO DE ASIENTOS
  p_NYEAR: string; // AÑO
  p_NAUTOZONE: string; // CODIGO DE ZONA DE CIRCULACION
  p_SNAME_AUTOZONE: string; // CODIGO DE ZONA DE CIRCULACION
  p_NUSERCODE: string; // CODIGO DE USUARIO
  p_STYPE_REGIST: string; // TIPO DE PLACA
  V_NIDPROCESS: string;
  p_NVEHMAINMODEL: string; // CODIGO DE MODELO
  p_SNAME_VEHMAINMODEL: string; // NOMBRE DE MODELO
  p_ORIGIN?: string;
  ZONA_CIRCULACION: any; // ZONA DE CIRCULACIÓN
  AceptaTerminos?: boolean;
  AceptaPrivacidad?: boolean;
  versionId?: string;
  versionName?: string;
  registrationZone?: infoUbigeo[]; 
}

export class infoUbigeo {
    idZonaRegistral: string;
    prioridad: string;
    ubigeoTarifario: string;
    zonaRegistral: string;
  }

export class ParseAuto {
  p_VALIDO: string;
  p_MENSAJE: string;
  nidcampaign: number;
  dexpirdat: string;
  nvalida: number;
  p_ORIGIN: string;
  p_NDOCUMENT_TYP: string;
  p_SDOCUMENT: string;
  p_DEXPIRDAT: string;
  p_SREGIST: string;
  p_NIDCLASE: string;
  p_SNAMECLASE: string;
  p_NIDUSO: string;
  p_SNAME_USO: string;
  p_NVEHBRAND: string;
  p_SNAME_VEHBRAND: string;
  p_NVEHMODEL: string;
  p_SNAME_VEHMODEL: string;
  p_NYEAR: string;
  p_SEATNUMBER: string;
  p_SNUMSERIE: string;
  p_NAUTOZONE: string;
  p_SNAME_AUTOZONE: string;
  p_NVEHMAINMODEL: number;
  p_SNAME_VEHMAINMODEL: string;
  p_CLIENTE: string;

  constructor(payload: any) {
    const auto = payload.vehiculo;

    if (!auto) {
      return
    }

    this.p_VALIDO = payload.success ? '1' : '0';
    this.p_MENSAJE = payload.message;
    this.dexpirdat = auto.fechaInicio ? moment(auto.fechaInicio, 'DD/MM/YYYY').toDate().toString() : null;
    this.p_ORIGIN = auto.origen;
    this.p_DEXPIRDAT = auto.fechaInicio ? moment(auto.fechaInicio, 'DD/MM/YYYY').toDate().toString() : null;
    this.p_NIDCLASE = auto.idClase;
    this.p_SNAMECLASE = auto.clase;
    this.p_NIDUSO = auto.idUso;
    this.p_SNAME_USO = auto.uso;
    this.p_NVEHBRAND = auto.idMarca;
    this.p_SNAME_VEHBRAND = auto.marca;
    this.p_NVEHMODEL = auto.idVersion;
    this.p_SNAME_VEHMODEL = auto.version;
    this.p_NYEAR = auto.anio;
    this.p_SEATNUMBER = auto.asientos;
    this.p_SNUMSERIE = auto.serie;
    this.p_NAUTOZONE = auto.idZonaCirculacion;
    this.p_SNAME_AUTOZONE = auto.zonaCirculacion;
    this.p_NVEHMAINMODEL = auto.idModelo;
    this.p_SNAME_VEHMAINMODEL = auto.modelo;
  }
}
