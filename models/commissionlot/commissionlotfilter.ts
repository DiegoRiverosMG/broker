export class CommissionLotFilter {

  constructor(

    public DISSUEDAT_INI: string,
    public DISSUEDAT_FIN: string,
    public NBRANCH: number,
    public SBRANCH: string,
    public NPRODUCT: number, /**jSoteldo */
    public SPRODUCT: string,
    public NPOLICY: number,
    public NIDCOMMLOT: number,
    public SCHANNEL_BO: string,
    public SSALEPOINT_BO: string,
    public NIDPAYROLL: number,
    public NIDSTATUS: number,
    public NUSERREGISTER: number,
    public SOBSERVATION: string,
    public NCURRENCY: number,
    public NCERTIF: number,
    public NRECEIPT: number,
    public ROWNUMBER: number,
    public NRECORD_COUNT: number,
    public NPAGE: number,
    public NRECORDPAGE: number,
    public NINTERMED?: number,
    public NTYPECHANNEL?: number
  ) { }
}
