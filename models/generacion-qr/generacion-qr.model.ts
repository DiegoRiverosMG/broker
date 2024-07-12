export interface IlistadoQRRequest {
  idProceso: string;
  fechaInicio: string;
  fechaFin: string;
  idEstado: string;
}

export interface IlistadoQRResponse {
  listado: Array<any>;
}

export interface IhistorialResponse {
  historial: Array<any>;
}

export interface IanularQRResquest {
  idProceso: string;
  idEstado: string;
  idUsuario: string;
}

export interface IanularQRResponse {
  archivo: string;
  nombreArchivo: string;
}

export interface IdescargarReporteReponse {
  success: boolean;
  archivo: string;
  nombre: string;
}

export class QRIndividualRequest {
  nombres: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
  telefono: string;
  anexo: string;
  celular: string;
  correo: string;
  cargo: string;

  constructor(data: any) {
    this.nombres = data.nombres;
    this.apellidoPaterno = data.apellido_paterno;
    this.apellidoMaterno = data.apellido_materno;
    this.telefono = data.telefono_fijo;
    this.anexo = data.anexo;
    this.celular = data.telefono_celular;
    this.correo = data.email;
    this.cargo = data.cargo;
  }
}

export interface QRIndividualResponse {
  success: boolean;
  mensaje: string;
}

export interface IdescargarQRResponse {
  success: boolean;
  archivo: string;
  nombreArchivo: string;
}

export interface IgenerarQRResponse {
  success: boolean;
  mensaje: string;
  idProceso: string;
  errores: Array<Validacion>;
}

export interface Validacion {
  registro: string;
  mensaje: string;
  mensajeError: string;
}
