/**Broker de la cotización */
export class QuotationBroker {
    /**Comisión propuesta para salud */
    public HealthProposedCommission: number;
    /**Comisión propuesta para pensión */
    public PensionProposedCommission: number;
    /**Id de tipo de canal */
    public ChannelTypeId: string;
    /**Id de canal */
    public ChannelId: string;
    /**Id de cliente */
    public ClientId: number;
    /**Comisión para Salud */
    public HealthCommission: number;
    /**Comisión para Pensión */
    public PensionCommission: number;
    /**Es un broker principal? */
    public IsPrincipal: boolean;
    /**Comisión total de todos los brokers */
    public SharedCommission: number;
}