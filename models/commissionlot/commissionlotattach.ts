export class CommissionLotAttach {
  constructor(
    // Parametros de entrada
    public tipoArchivo: number,
    public niD_COMMLOT: number,
    public niD_COMMLOT_ATTACH: number,
    public fileattach: File,
    public snamefile: string,
    public SCONTENTFILE: string,
    public sregister: string,
    public status: string = 'store'
  ) { }
}
