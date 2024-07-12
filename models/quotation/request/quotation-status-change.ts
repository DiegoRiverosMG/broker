import { AuthorizedRate } from './authorized-rate';
import { BrokerProduct } from './broker-product';
import { Broker } from './broker';

export class QuotationStatusChange { //Datos de evaluación de cotización
    public QuotationNumber: string //Número de cotización

    public Status: string;   //nuevo estado de cotización
    public Reason: string;   //Motivo de cambio de estado
    public Comment: string;  //Comentario sobre el cambio de estado

    public User: number; //Usuario
    public Product: string;  //Producto

    public saludAuthorizedRateList: AuthorizedRate[];    //lista de inserciones de tasa autorizada para realizar
    public pensionAuthorizedRateList: AuthorizedRate[];  //lista de inserciones de tasa autorizada para realizar

    public BrokerList: Broker[]; //Lista de brokers
    public Flag: number;

}