
import { Channel } from '../client-information/channel';

export class Tariff {
    public protectaTariff: PSTariff;
    public mapfreTariff: CotizarBM


}

export class PSTariff {
    public queryDate: string;
    public workers: number;
    public zipCode: string;
    public activity: string;
    public channel: Channel[];
}


export class CotizarBM {
    public cabecera: any;
    public poliza: any;
    public cotizacion: any;
    public producto: any;
    public riesgoSCTR: any;
    public cliente: any;
}
