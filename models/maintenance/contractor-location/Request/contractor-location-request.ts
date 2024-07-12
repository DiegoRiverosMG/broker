export class ContractorLocationREQUEST { //Contratante para tabla
    public Action: string;
    public Id: number;
    public TypeId: string;
    public Description: string;
    public EconomicActivityId: string;
    public TechnicalActivityId: string;
    public StateId: string;
    public ContractorId: string;

    public Address: string;
    public DepartmentId: number;
    public ProvinceId: number;
    public DistrictId: number;

    public UserCode: number;
    public ContactList: any[];
}