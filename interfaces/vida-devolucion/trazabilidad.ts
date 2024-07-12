export interface ITrazabilidadResponse {
  success: boolean;
  message: string;

  listaEventos: Array<{
    idCliente: string;
    description: string;
    ejecutorEvento: string;
    fechaEvento: string;
    idEvento: number;
    propietarioProspecto: string;
    tipoEvento: string;
  }>;
}
