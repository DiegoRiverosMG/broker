export class BrokerAgencySearch { //Datos para búsqueda de broker y sus respectivos agenciamientos
    // public SearchType:string //tipo de búsqueda 1: por nombre y apellido | 2: por número de documento
    // public DocumentType:string   // tipo de documento
    // public DocumentNumber:string //número de documento
    // public FirstName:string //nombres o razón social
    // public PaternalLastName:string    //apellido paterno
    // public MaternalLastName:string   //apellido materno
    public BrokerId: string; //Id de broker
    public ChannelTypeId: string; //Id de tipo de canal de broker
    public StartDate: Date;   //fecha inferior de búsqueda de agenciamiento
    public EndDate: Date;    //fecha superior de búsqueda de agenciamiento
    public LimitPerpage: number;   //número de registros a devolver
    public PageNumber: number;    //número de página

    //Datos solo para almacenar y no para buscar
    public FullName:string; //Nombre completo de broker
    public DocumentTypeId:string;   //Id de tipo de documento
    public DocumentNumber:string;   //Número de documento
}