export class LogsUsuarios {

  constructor(
    // Parametros de entrada
    public PDATEBEGIN: string,
    public PDATEEND: string,
    public P_SCODCHANNEL: string,
    public P_SIDUSER: string,
    public P_SPAGE: string,
    public P_SOPTION: string,
    public idCanal: number,
    public canal: string,

    public idUsuario: number,
    public usuario: string,
    public codPagina: string,
    public pagina: string,
    public fechaRegistro: string,
    public codEvento: string,
    public evento: string,
    public comentario: string,
    public ROWNUMBER: number,
    public NRECORD_COUNT: number,

    public NPAGE: number,
    public NRECORDPAGE: number
  ) { }
}
