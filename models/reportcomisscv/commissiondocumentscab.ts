export class ComisionDocumentCab {
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
      public nidstate: string   ,
      public bselall:string,
      public fprimaini:string,
      public fprimafin:string, 
      public fdateini:string,
      public fdatefin:string, 
      public fpoliza:string,
      public nstatus: string,
      public nidpaidtype: string,
      public schannel_bo :string,
      public ssalepoint_bo: string,
      public ssalepointlog: string,
      public mensaje:string,
      public listCommissiondesactivados= [],
      public listCommissionactivados= [],
      public LISTCOMMISSIONDETAIL= []
     ) { }
    }