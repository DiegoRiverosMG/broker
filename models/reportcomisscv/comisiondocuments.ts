export class ComisionDocument {

  constructor(
    public nidcomisiondocument: string,
    public sdocument: string, //DOC CANAL , RUC   
    public sbill: string,   // FACTURA
    public nquantity: string, //CANTIDAD DE POLIZAS ASOCIADAS
    public ntotal: string   ,  //MONTO TOTAL DE LA FACTURA
    public ddatedocument: string,
    public nuser: string ,
    public scodchannel: string  , 
    public scliename: string   ,              
    public nidstate: string   

   ) { }
  }