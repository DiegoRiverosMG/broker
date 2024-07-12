/**
 * Objeto que contiene datos para ejecutar la evaluación crediticia
 */
export class CreditEvaluation {
    /**
     * Id de cliente que va a ser evaluado
     */
    public ClientId: string;
    /**
     * Calificación otorgada al cliente
     */
    public Qualification: string;
    /**
     * Usuario evaluador
     */
    public User: string;
}