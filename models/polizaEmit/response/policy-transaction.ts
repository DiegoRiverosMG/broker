export class PolicyTransaction { //Datos de transacciones de póliza para la tabla
    public ProductType: string //Tipo de producto
    public MovementType: string   // Tipo de movimiento de póliza
    public StartDate: Date //Fecha de operación - DESDE
    public EndDate: Date //Fecha de operación - HASTA
    public PolicyNumber: string    //Número de póliza

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