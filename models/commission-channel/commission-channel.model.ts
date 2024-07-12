export class ChannelSales {
  constructor(
    public nusercode: number,
    public nchannel: string,
    public scliename: string
  ) {}
}

export class PuntoVentas {
  constructor(public spolicy: string, public nnumpoint: number) {}
}

export class Estados {
  constructor(public nidstate: number, public sdescription: string) {}
}

export class Monedas {
  constructor(
    public nid: number,
    public sdescript: string,
    public typeuser: number
  ) {}
}

export class Ramo {
  constructor(
    public nid: number,
    public sdescript: string,
    public typeuser: number
  ) {}
}

export class RamoP {
  constructor(
    public nid: number,
    public sdescript: string,
    public typeuser: number
  ) {}
}

export class Productos {
  constructor(
    public nid: number,
    public sdescript: string,
    public typeuser: number
  ) {}
}

export class ProductosP {
  constructor(
    public nid: number,
    public sdescript: string,
    public typeuser: number
  ) {}
}

export class EstadoL {
  constructor(
    public nidstate: number,
    public sdescription: string,
    public nchanneltype: number,
    public niD_ESTTABLE_ANT: number
  ) {}
}

// tslint:disable-next-line:class-name
export class descargarExcel {
  constructor(
    public idLote: string,
    public pagina: number,
    public cantidadRegistros: number
  ) {}
}

export class Listado {
  constructor(
    public codigoCanal: string,
    public disponibilidad: number, // 0: POR DISPONIBILIZAR // 1: DISPONIBILIZADO // -1 TODOS
    public fechaInicio: string,
    public fechaFin: string,
    public numeroPoliza: number,
    public idPlanilla: number,
    public pagina: number,
    public cantidadRegistros: number,
    public IdRamo: string,
    public IdProducto: string,
    public IdLote: string,
    public IdEstadoLote: string,
    public IdEstadoComision: string
  ) {}
}

export class ListadoP {
  constructor(
    public success: any,
    public message: any,
    public comisiones = []
  ) {}
}

// tslint:disable-next-line:class-name
export class datosExcel {
  constructor(
    public success: any,
    public message: any,
    public detalleLote = []
  ) {}
}
