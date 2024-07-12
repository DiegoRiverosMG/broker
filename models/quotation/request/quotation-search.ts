export class QuotationSearch { //Datos para búsqueda de cotizaciones
    public QuotationNumber: string //Número de cotización
    public PolicyNumber: string //Número de poliza

    public ProductType: string  //Id tipo de producto
    public StartDate: Date   //Fecha de límite inferior
    public EndDate: Date   //Fecha de límite superior
    public Status: string   //Estado de la cotización: pendiente|aprobado|rechazado

    public ContractorSearchMode: string   //Tipo de búsqueda de contratante 3-ninguno|2-nombres|1-nro de documento
    public ContractorPersonType: string  //tipo de persona
    public ContractorDocumentType: string   //tipo de documento
    public ContractorDocumentNumber: string   //nro de documento
    public ContractorFirstName: string   //nombres
    public ContractorPaternalLastName: string   //apellido paterno
    public ContractorMaternalLastName: string   //apellido materno
    public ContractorLegalName: string   //razón social

    public BrokerSearchMode: string   //Tipo de búsqueda de broker 3-ninguno|2-nombres|1-nro de documento
    public BrokerPersonType: string  //tipo de persona 
    public BrokerDocumentType: string   //tipo de documento
    public BrokerDocumentNumber: string   //nro de documento
    public BrokerFirstName: string   //nombres
    public BrokerPaternalLastName: string   //apellido paterno
    public BrokerMaternalLastName: string   //apellido materno
    public BrokerLegalName: string   //razón social

    /**Código de usuario */
    public User: string;

    public LimitPerPage: number; //Limite de registros por página
    public PageNumber: number;   //Número de página actual

}