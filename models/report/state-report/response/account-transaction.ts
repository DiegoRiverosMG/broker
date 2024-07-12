/**Datos de transacción */
export class AccountTransaction {
    /**Producto */
    public Product: string;
    /**Número de contrato */
    public ContractNumber: string;
    /**Fecha de inicio de vigencia */
    public VigencyStartDate: Date;
    /**Fecha de fin de vigencia */
    public VigencyEndDate: Date;
    /**Código de proforma */
    public ProformaCode: string;
    /**Fecha de expiración */
    public ExpirationDate: Date;
    /**Estado de pago */
    public PaymentState: string;
    /**Código de documento legal */
    public LegalDocument: string;
    /**Monto de importe */
    public Amount: number;

}