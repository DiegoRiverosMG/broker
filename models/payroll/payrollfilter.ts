export class PayrollFilter {

  constructor(
    public DISSUEDAT_INI: string,
    public DISSUEDAT_FIN: string,
    public NPOLICY: number,
    public SCHANNEL_BO: string,
    public SSALEPOINT_BO: string,
    public NIDPAYROLL: number,
    public NBRANCH: number,
    public NPRODUCT: number,
    public NCURRENCY: number,
    public SCLIENT?: string
  ) {
  }
}
