import { QuotationBroker } from './quotation-broker';
import { QuotationRisk } from './quotation-risk';
import { QuotationStatusChange } from '../quotation-status-change'

/**Datos de recotización */
export class QuotationModification {
    /**Número de cotización */
    public Number: string;
    /**Rama de producto */
    public Branch: string;
    /**Usuario */
    public User: string;
    /**Cambio de estado */
    public StatusChangeData: QuotationStatusChange;
    /**Lista de riesgos y detalles */
    public RiskList: QuotationRisk[];
    /**Lista de brokers */
    public BrokerList: QuotationBroker[];
}