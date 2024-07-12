

export class Poliza {
  npolesP_COMP: string;
  ntippoldes: string;
}
export class Policy {
  constructor(
    public placa: string,
    public policy: number,
    public contratante: string,
    public tipoDoc: string,
    public numDoc: number,
    public InicioVigencia: Date,
    public finVigencia: Date,
    public prima: number,
    public canal: string,
    public codecanal: number,
    public uso: string,
    public marca: string,
    public modelo: string,
    public clase: string,
    public año: number,
    public asientos: number,
  ) { }
}
