export class Quotation { //Datos para búsqueda de cotizaciones
    public QuotationNumber:string //Número de cotización

    public ProductName:string  //producto
    public ContractorDocumentTypeName:string   //tipo de documento - contratante
    public ContractorDocumentNumber:string   //nro de documento - contratante
    public ContractorFullName:string   //nombres - contratante

    public MinimalPremium:number   //prima mínima
    public WorkersCount:number  //cantidad de trabajadores
    public Payroll:number   //planilla
    public Rate:number   //tasa

    public BrokerDocumentTypeName:string   //tipo de documento - broker
    public BrokerDocumentNumber:string   //nro de documento - broker
    public BrokerFullName:string   //nombres - broker
    
    public Bounty:number   //comisión de broker
    public Status:string  //estado de cotización
}