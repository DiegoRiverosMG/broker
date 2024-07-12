import { QuotationBroker } from './quotation-broker';
import { QuotationDetail } from './quotation-detail';

/**Datos de recotización */
export class QuotationModification {
    /**Número de cotización */
    public QuotationNumber: string;
    /**Rama de producto */
    public Branch: string;
    /**Usuario */
    public User: string;
    /**Comentario de recotización */
    public StatusChangeComment: string;
    /**Lista de detalles de cotización */
    public QuotationDetailList: [];
    //public QuotationDetailList: QuotationDetail[];
    /**Lista de brokers */
    public QuotationBrokerList: [];
    //public QuotationBrokerList: QuotationBroker[];
}