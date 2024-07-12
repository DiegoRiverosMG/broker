export class ParametersResponse {
  parentescos: Array<{ id: number; description }>;
  nacionalidades: Array<{ id: number; description }>;
  ocupaciones: Array<{ id: number; description }>;
  estadoCivil: Array<{ id: number; description }>;
  ubigeos: any;
  constructor({
    parentescos,
    nacionalidades,
    ocupaciones,
    estadoCivil,
    ubigeos,
  }) {
    this.parentescos = parentescos.map((val) => ({
      id: val.id,
      description: val.description,
    }));
    this.nacionalidades = nacionalidades.map((val) => ({
      id: val.id,
      description: val.descripcion,
    }));
    this.ocupaciones = ocupaciones.map((val) => ({
      id: val.id,
      description: val.description,
    }));
    this.estadoCivil = estadoCivil.map((val) => ({
      id: val.id,
      description: val.description,
    }));
    this.ubigeos = ubigeos;
  }
}

export interface Person {
  id: string;
  name: string;
}
