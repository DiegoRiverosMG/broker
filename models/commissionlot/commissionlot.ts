export class CommissionLot {

  constructor(
    // Parametros de entrada
    public PDATEBEGIN: string,
    public PDATEEND: string,
    public CodigoCanal: number,
    public NIDCOMMLOTLIST: string,
    public P_NIDPAYROLL: number,
    public P_NIDCOMMLOT: number,
    public P_NSTATE: number,
    public P_NPOLICY: number,
    public P_NBRANCH: number,
    public P_NPRODUCT: number, /**jSoteldo */

    // Parametros de salida
    public NQUANTITY: number,
    public niD_COMMLOT: number,
    public nidstate: number,
    public sregister: string,
    public namounttotal: number,
    public namountneto: number,
    public namountigv: number,
    public sidcomlot: string,
    public sdescription: string,
    public nbranch: number,
    public sbranch: string,
    public nproduct: number,
    public sproduct: string,
    public ROWNUMBER: number,
    public NRECORD_COUNT: number,
    public ncurrency: number,
    public scurrency: string,
    public sshorT_CURRENCY: string,
    public NPAGE: number,
    public NRECORDPAGE: number,
    public selected: boolean,
    public namountgrossup: number,
    public sbillnum: string,
    // public channel: number,
  ) { }
}
