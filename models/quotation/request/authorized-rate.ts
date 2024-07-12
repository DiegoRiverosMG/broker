/**Datos para la inserción de la tasa autorizada */
export class AuthorizedRate {
    /**Producto */
    public ProductId: string
    /**Tasa autorizada */
    public AuthorizedRate: number
    /**Tipo de riesgo */
    public RiskTypeId: string
    /**Prima calculada con la tasa autorizada */
    public AuthorizedPremium: number
    /**Prima mínima autorizada */
    public AuthorizedMinimunPremium: number
}