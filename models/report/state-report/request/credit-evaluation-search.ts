export class CreditEvaluationSearch {
    /**
     * Id de cliente
     */
    public ClientId: string;
    /**
     * Calificación de evaluación crediticia
     */
    public Qualification: string;
    /**
     * Fecha límite inferior para fecha de evaluación
     */
    public StartDate: Date;
    /**
     * Fecha límite superior para fecha de evaluación
     */
    public EndDate: Date;
    /**
     * Límite de registros por página
     */
    public LimitPerPage: number;
    /**
     * Número de página a buscar
     */
    public PageNumber: number;

}