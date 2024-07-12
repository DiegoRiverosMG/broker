export class CommissionFactur {
  constructor(
    public tipocomprobante: string,
    public serie: string,
    public numero: string,
    public fechacomprobante: string,
    public montocomprobante: number,
    public ruc: string,
  ) { }
}
