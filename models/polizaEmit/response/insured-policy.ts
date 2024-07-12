export class InsuredPolicy { //Datos pólizas con asegurados para mostrar en tabla
    public Product:string //Tipo de producto
    public Movement:string   // Tipo de movimiento de póliza
    public StartDate:Date //Fecha de operación - DESDE
    public EndDate:Date //Fecha de operación - HASTA
    public PolicyNumber:string    //Número de póliza

    //Datos de asegurados
    public InsuredData:string   //Datos del asegurado
    public ContractorData:string   //Datos del asegurado
    public BrokerData:string   //Datos del asegurado
    public ContractorLocation:string   //Datos del asegurado
}