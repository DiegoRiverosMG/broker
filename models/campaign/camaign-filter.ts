export class CampaignFilter {
    constructor(
      // Parametros de entrada
      public P_DATEBEGIN: string,
      public P_DATEEND: string,
      public P_DESCRIPCION: string,
      public P_NSTATE: number,
      public P_NID_NCHANNEL: string,
      // Paginacion
      public P_NPAGE: number,
      public P_NRECORDPAGE: number,
      public P_NIDCAMPAIGNLIST: string,
      
    ) {}
}
