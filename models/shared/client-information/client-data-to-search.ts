export class ClientDataToSearch { //Contratante para tabla
    public P_CodAplicacion: string;
    public P_TipOper: string;
    public P_NUSERCODE: string;
    public P_NIDDOC_TYPE: string;
    public P_SIDDOC: string;
    public P_SFIRSTNAME: string;
    public P_SLASTNAME: string;
    public P_SLASTNAME2: string;
    public P_SLEGALNAME: string

    //Datos de paginación
    public LimitPerpage: number //número de registros a devolver
    public PageNumber: number //número de página
}