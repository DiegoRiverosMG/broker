export class ReportSalesCertificate{
    constructor(
        public  NPROVINCE : string,
        public  NLOCAL: string,
        public  NMUNICIPALITY: string,
        public  NSTATUS : string,
        public  NIDPAIDTYPE : string,
        public  PREMIUM_INI : string,
        public  PREMIUM_FIN : string,
        public  NUSO : string,
        public  DISSUEDAT_INI : string,
        public  DISSUEDAT_FIN : string,
        public  NPOLICY : string,
        public  SCHANNEL_BO : string,
        public  SSALEPOINT_BO : string,
        public  ID_INPUT_TYPE: string,
        // Paginacion
        public  NPAGE : string,
        public  NRECORD_PAGE : string,
        public  SSALEPOINTLOG: string
    ){}    
}