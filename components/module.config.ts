export class ModuleConfig {

  public static NotFoundMessage: string = "No se encontraron registros.";
  public static GenericErrorMessage: string = "Error inesperado, contáctese con soporte.";
  public static RedirectionMessage: string = "Usted será redireccionado a la página anterior.";

  public static InvalidStartDateMessage: string = "La fecha de inicio es inválida.";
  public static InvalidEndDateMessage: string = "La fecha de fin es inválida.";
  public static InvalidStartDateOrderMessage: string = "La fecha inicio no puede ser mayor a la fecha fin.";
  public static InvalidEndDateOrderMessage: string = "La fecha fin no puede ser menor a la fecha inicio.";

  public static EndDate: Date = new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate());
  public static priorDate: Date = new Date(new Date().setDate(ModuleConfig.EndDate.getDate() - 30));
  public static StartDate: Date = new Date(ModuleConfig.priorDate.getFullYear(), ModuleConfig.priorDate.getMonth(), ModuleConfig.priorDate.getDate());
  public static StartDateTrx: Date = new Date();
  public static EndDateTrx: Date = new Date(new Date().setDate(ModuleConfig.StartDateTrx.getDate() + 30));


  public static ViewIdList = {
    contractor_location: "3",
    agency: "4",
    quotation: "5",
    quotation_request: "10",
    policy_emission: "14",
    policy_renovation: "19",
    policy_renovation_with_modification: "20",
    policy_endorsement: "21",
    policy_inclusion: "22",
    policy_exclusion: "23",
    policy_neteo: "24",
    policy_cancel: "26",
    policy_transaction_query: "35",
    transaction_report: "29",
    insured_report: "30",
    account_state: "31",
    policy_proof: "28"
  };

}
