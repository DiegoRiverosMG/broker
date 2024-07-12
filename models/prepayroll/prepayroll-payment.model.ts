export class PrepayrollPayment {
  // id: number;
  constructor(
    public id: number,
    public currency: number,
    public amount: number,
    public paidtypeId: number,
    public bank: number,
    public bankaccount: string,
    public operationnumber: string,
    public operationdate: string,
    public reference: string,
    public state: string,
    public nuserregister: number, 
    public ncurrencytext: string,
    public nbanktext: string,
    public nbankaccounttext: string,
    public nidpaidtypetext: string,
    public selected: boolean

  /*public nidprepayrolldetail: number,
  public currency: number,
  public namount: number,
  public nidpaidtype: number,
  public nbank: number,
  public nbankaccount: number,
  public soperationnumber: string,
  public doperationdate: string,
  public sreference: string,
  public sstate: string,
  public nuserregister: number,  
  public ncurrencytext: string,
  public nbanktext: string,
  public nbankaccounttext: string,
  public nidpaidtypetext: string,
  public selected: boolean*/
){
    
  }
}
