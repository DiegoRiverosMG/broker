export class PolicyTransactionSearch { //Datos para búsqueda de transacciones de póliza
    public ProductType: string //Tipo de producto
    public MovementType: string   // Tipo de movimiento de póliza
    public StartDate: Date //Fecha de operación - DESDE
    public EndDate: Date //Fecha de operación - HASTA
    public PolicyNumber: string    //Número de póliza

    //Datos de asegurados
    public ContractorSearchMode: string   //Modo de búsqueda
    public ContractorDocumentType: string   //Tipo de documento
    public ContractorDocumentNumber: string    //número de página
    public ContractorPaternalLastName: string   //Apellido paterno
    public ContractorMaternalLastName: string    //Apellido materno
    public ContractorFirstName: string //Nombres

    //Datos de paginación
    public LimitPerpage: number   //número de registros a devolver
    public PageNumber: number    //número de página
}