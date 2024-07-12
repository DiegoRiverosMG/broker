export class AccountTransactionSearch {
    /**
     * Id de cliente
     */
    public ClientId: string;
    /**
     * Fecha límite inferior para fecha de operación
     */
    public StartDate: Date;
    /**
     * Fecha límite inferior para fecha de operación
     */
    public EndDate: Date;
    /**
     * Tipo de producto
     */
    public Product: string;
    /**
     * Estado de pago
     */
    public PaymentState: string;
    /**
     * Límite de registros por página
     */
    public LimitPerPage: number;
    /**
     * Número de página a buscar
     */
    public PageNumber: number;
}