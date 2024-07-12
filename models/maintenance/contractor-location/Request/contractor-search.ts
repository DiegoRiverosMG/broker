export class ContractorSearch { //Datos para búsqueda de contratante
    public SearchMode: string;  //Tipo de búsqueda: 1: Por Dni | 2: Por nombres

    public DocumentType: string;    //Tipo de documento
    public DocumentNumber: string;  //Número de documento

    public PersonType: string;  //Tipo de persona
    public FirstName: string;   //Primer nombre
    public PaternalLastName: string;    //Apellido paterno
    public MaternalLastName: string;    //Apellido materno
    public LegalName: string;   //Razón social

    //Variables de paginado
    public LimitPerPage: number;    //Limite de registros por página
    public PageNumber: number;  //Número de página
}