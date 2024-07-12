/**Datos de cambio de estado de la cotización */
export class QuotationTracking {
    /**Número de cotización */
    public QuotationNumber:string;
    /**Fecha de cambio de estado */
    public EventDate:Date;
    /**Usuario */
    public User:string;
    /**Estado */
    public Status:string;
    /**Comentario */
    public Comment:string;
    /**Perfil de usuario */
    public Profile:string;
    /**Lista de rutas de archivos referentes al cambio de estado */
    public FilePathList:string[];
}