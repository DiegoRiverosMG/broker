export class PolicyProofSearch { //Datos para búsqueda de constancia de pólizas
    public ProductType: string //Tipo de producto
    public MovementType: string   // Tipo de movimiento de póliza
    public StartDate: Date //Fecha de operación - DESDE
    public EndDate: Date //Fecha de operación - HASTA
    public ProofNumber: string    //Número de constancia

    //Datos de asegurados
    public InsuredSearchMode: string   //Modo de búsqueda
    public InsuredDocumentType: string   //Tipo de documento
    public InsuredDocumentNumber: string    //número de página
    public InsuredPaternalLastName: string   //Apellido paterno
    public InsuredMaternalLastName: string    //Apellido materno
    public InsuredFirstName: string //Nombres

    //Datos de paginación
    public LimitPerpage: number   //número de registros a devolver
    public PageNumber: number    //número de página
}