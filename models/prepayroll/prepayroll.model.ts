import { PrepayrollDetail } from './prepayroll-detail.model';
import { PrepayrollPayment } from './prepayroll-payment.model';
import { EspecieValoradaDetalle } from './especie-valorada-detalle.model';
export class Prepayroll {  
  // id: number;
  constructor(
  public id: number,
  public cantidad: number,
  public monto: number,
  public estado: number,
  public descripcionEstado:string,
  public canalcodigo: string,
  public observacion: string,
  public cipnumero: string,
  public autorizacionid: number,
  public usuarioid: string,
  public tipopago: string,
  public dregister: string,
  public detalles:  PrepayrollDetail[]=[],
  public pagos:PrepayrollPayment[]=[]  
)
  // PrepayrollPayment[])
  {}
}
