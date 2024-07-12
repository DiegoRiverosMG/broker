export class DocumentOfUsoAutoDto {
  idUso: number;
  idTipoDocumento: number;
  obligatorio: any;
  descripcion: string;
}
export class ResumenDocumentEmisionDto {
  idProceso: number;
  token: string;
  idUsuario: number;
  canalDeVenta: {
    idCanal: number;
    idPuntoVenta: number;
  };
  auto: {
    origen: string;
    placa: string;
    idClase: number;
    clase: string;
    idUso: number;
    uso: string;
    idMarca: number;
    marca: string;
    idModelo: number;
    modelo: string;
    idZona: number;
    zonaCirculacion: string;
    numeroSerie: string;
    numeroAsientos: number;
    anio: number;
  };
  cliente: {
    idTipoPersona: number;
    idTipoDocumento: number;
    numeroDocumento: number;
    apellidoPaterno: string;
    apellidoMaterno: string;
    nombre: string;
    razonSocial: null;
    departamento: number;
    provincia: number;
    distrito: number;
    direccion: string;
    email: string;
    telefono: number;
  };
  poliza: {
    inicioVigencia: string;
    finVigencia: string;
    numeroPoliza: number;
    prima: number;
  };
}
