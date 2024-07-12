export class Payroll {
  constructor(
    // Parametros de entrada
    public PDATEBEGIN: string,
    public PDATEEND: string,
    public P_NIDPAYROLL: number,
    public P_NSTATE: number,
    public P_NID_NCHANNELTYPE: string,
    public P_NID_NSALESPOINT: string,
    public P_NBRANCH: number,
    public P_NPRODUCT: number,
    public P_NCURRENCY: number,
    public namounttotal: number,
    public NQUANTITY: number,
    public nidpayroll: number,
    public nidstate: number,
    public splanilla: string,
    public sregister: string,
    public stype: string,
    public sdescription: string,
    public ROWNUMBER: number,
    public NRECORD_COUNT: number,
    public NBRANCH: number,
    public sbranch: string,
    public NPRODUCT: number,
    public sproduct: string,
    public NCURRENCY: number,
    public scurrency: string,
    public sshortcurrency: string,
    public NUSERCODE: number,
    // Paginacion
    public NPAGE: number,
    public NRECORDPAGE: number,
    public selected: boolean,
    public scanal: string,
    public sproducto: string,
    public nautomatic: number
  ) {}
}
