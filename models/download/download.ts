export class DownloadDto {
  /*
    constructor(
        // Parametros de entrada
        public niD_COMMLOT:number,
        public niD_COMMLOT_ATTACH: number,
        public fileattach : File ,
        public snamefile   : string,
        public SCONTENTFILE: string,
        public sregister: string
    ) {}
    */

  public id: String;
  public success: boolean;
  public message: String;
  public file?: string;
}
