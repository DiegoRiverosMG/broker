export interface IListadoProspectosRequest {
  canal: number;
  ramo: number;
  producto: number;
  tipoDocumento: number;
  numeroDocumento: string;
  idCliente: number;
  idCotizacion: number;
  fechaInicio: string;
  fechaFin: string;
  estado: number;
  usuario: number;
  indice: number;
  cantidadRegistros: number;
  idTipo: number;
  nombres: string;
  primerApellido: string;
  segundoApellido: string;
  idperfil: number ;
  asegurado: boolean;
}

export interface IListadoProspectosResponse {
  success: boolean;
  message: string;
  cantidadRegistros: number;

  listadoProspectos: Array<{
    idCliente: string;
    idCotizacion: string;
    tipoDocumento: string;
    numeroDocumento: string;
    cliente: string;
    motivoRechazo: string;
    estado: string;
    usuario: string;
    origen: string;
    fechaActualizacion: string;
    indice: string;
    contratante: string;
    contratanteDocumento: string;
  }>;
}
