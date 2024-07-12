export class PayrollCab {

  constructor(
    public NIDPAYROLL: number,
    public NIDPAYROLLLIST: string,
    public NQUANTITY: number,
    public DREGPAYROLL: string,
    public NAMOUNTTOTAL: number,
    public NIDSTATE: number,
    public NUSERREGISTER: number,
    public SCODCHANNEL: number,
    public NBRANCH: number,
    public NPRODUCT: number,
    public NCURRENCY: number,
    public LISTPAYROLLDETAIL = [],
    public LISTPAYROLLPAYMENT = [],
    public CIPNUMERO: string,
    public sobservacion: string
  ) { }
}
