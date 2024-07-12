export class ContractorForTable { //Datos de contratante y sede para tabla

    public Id: string;  //Id de contratante
    public DocumentType: string;    //Tipo de documento de contratante
    public DocumentNumber: string;  //Número de documento de contratante
    public FullName: string; //Razón social or Nombre+Apellido de contratante
    // public ContractorLocationType: string,
    // public ContractorLocationEmail: string,
    // public ContractorLocationPhone: string,
    // public ContractorLocationDescription: string
    public Email: string;   //Email de contratante
    public Phone: string;   //Teléfono de contratante
    public Address: string; //Dirección de contratante
    //Datos de sede
    public LocationType: string;    //Tipo de sede
    public LocationDescription: string;  //Descripción de sede
    public LocationStatus: string;  //Estado de sede

    /**Actividad económica de sede */
    public LocationEconomicActivity: string;
    /**Distrito de sede */
    public LocationDistrict: string;
    /**Provincia de sede */
    public LocationProvince: string;
    /**Departamento de sede */
    public LocationDepartment: string;
    /**Dirección de sede */
    public LocationAddress: string;

    /**Id de habilitación de crédito */
    public CreditEnablementId: string;
    /**Nombre de habilitación de crédito */
    public CreditEnablementName: string;
    /**Id de habilitación de movimiento */
    public MovementEnablementId: string;
    /**Nombre de habilitación de movimiento */
    public MovementEnablementName: string;
    /**Id de última evaluación crediticia */
    public LastCreditEvaluationId: string;
    /**Nombre de última evaluación crediticia */
    public LastCreditEvaluationName: string;
    /**Días de morosidad */
    public LatePaymentDays: number;

}
