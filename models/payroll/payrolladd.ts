export class PayrollAdd{

    constructor(
  
        //Parametros de entrada
        public P_DATEBEGIN: string,
        public P_DATEEND: string,
        public P_NIDPAYROLL: number,
        public P_NSTATE: number,
        public P_NPAGENUM: number,
  
        //Parametros de salida
        public NPOLICY: number,
        public NPREMIUM: number,
        public NDOCUMENTS: number,
        public SNAMECOMPLETE: string,
        public DSTARTDATE: string,
        public DEXPIRDAT: string,     
        public SREGIST: string,
        public SSALEMODE: string,
        public SSTATUS_POL: string,
        public SSTATUS_POL_DES: string,
        public selected: Boolean
    ){}


  }