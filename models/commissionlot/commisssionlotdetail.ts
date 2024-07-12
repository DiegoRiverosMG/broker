export class CommissionLotDetail {

  constructor(

    public NID_COMMLOT_DETAIL: number,
    public NPOLICY: number,
    public NCERTIF: number,
    public SCERTYPE: string,
    public NBRANCH: number,
    public NPRODUCT: number,

    public DDATE_ORIGI: string,
    public SREGIST: string,
    public SNAMECOMPLETE: string,
    public DSTARTDATE: string,
    public DEXPIRDAT: string,
    public NPREMIUM: number,
    public NDOCUMENTS: string,
    public USO: string,
    public CLASE: string,
    public TIPOEMISION: string,
    public PUNTOVENTA: string,
    public SSALEMODE: string,
    public SSTATUS_POL: string,
    public SSTATUS_POL_DES: string,
    public selected: boolean,
    public NUSERREGISTER: number,
    public amount: number

  ) { }


}
