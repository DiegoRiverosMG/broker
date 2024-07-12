/**Datos de riesgo */
export class QuotationRisk {
    /**Id de tipo de riesgo */
    public RiskTypeId: string;
    /**Id de tipo de producto */
    public ProductTypeId: string;
    /**Tasa propuesta por riesgo y producto */
    public ProposedRate: number;
    /**Número total de trabajadores */
    public WorkersCount: number;
    /**Monto planilla */
    public PayrollAmount: number;
    /**Tasa calculada */
    public CalculatedRate: number;
    /**Prima por riesgo */
    public PremimunPerRisk: number;
    /**Prima mínima */
    public MinimunPremium: number;
    /**Prima mínima propuesta */
    public ProposedMinimunPremium: number;
    /**Prima de endoso */
    public EndorsmentPremium: number;
    /**Prima neta */
    public NetPremium: number;
    /**Prima bruta */
    public GrossPremium: number;
    /**IGV de prima */
    public PremiumIGV: number;
    /**Tasa de riesgo */
    public RiskRate: number;
    /**Descuento */
    public Discount: number;
    /**Variación */
    public Variation: number;
    /**Flag del tarifario */
    public TariffFlag: string;
}


//    P_NPREMIUM_MIN        TBL_PD_COTIZACION_DET.NPREMIUM_MIN %TYPE,
//    P_NPREMIUM_MIN_PR     TBL_PD_COTIZACION_DET.NPREMIUM_MIN_PR%TYPE,
//    P_NPREMIUM_END        TBL_PD_COTIZACION_DET.NPREMIUM_END%TYPE,
//    P_NSUM_PREMIUMN       TBL_PD_COTIZACION_DET.NSUM_PREMIUMN%TYPE,
//    P_NSUM_IGV            TBL_PD_COTIZACION_DET.NSUM_IGV%TYPE,
//    P_NSUM_PREMIUM        TBL_PD_COTIZACION_DET.NSUM_PREMIUM%TYPE,
//    P_NUSERCODE           TBL_PD_COTIZACION_DET.NUSERCODE%TYPE,
//    P_NRATE               TBL_PD_COTIZACION_DET.NRATE%TYPE,
//    P_NDISCOUNT           TBL_PD_COTIZACION_DET.NDISCOUNT%TYPE,
//    P_NACTIVITYVARIATION  TBL_PD_COTIZACION_DET.NACTIVITYVARIATION%TYPE,
//    P_FLAG                NUMBER, --0:NUEVO TARIFARIO // 1: RETARIFICACION
//    P_MESSAGE             OUT VARCHAR,
//    P_COD_ERR             OUT NUMBER,
//    P_FLAG_AUT            OUT NUMBER)