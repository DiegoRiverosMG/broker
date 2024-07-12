export class GenericResponse { 
    public StatusCode: number //1: error, 0:operación exitosa
    public Message:string 
    public GenericResponse:any   // Respuesta genérica, puede ser una tabla, string, etc.
    public TotalRowNumber:number //Si es una búsqueda con paginado, devolvemos el número total de registros 
}