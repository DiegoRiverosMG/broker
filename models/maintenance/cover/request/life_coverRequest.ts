import { Serializable } from './Serializable';

export class Life_coverRequest extends Serializable{
    public SACCION : string;
    public NBRANCH : number;
    public NPRODUCT : number;
    public NMODULEC : number;
    public SADDSUINI : string;
    public SADDREINI : string;
    public SADDTAXIN : string;
    public NCOVERGEN : number;
    public SMORTACOF : string;
    public SMORTACOM : string;
    public NINTEREST : number;
    public SCOVERUSE : string;
    public NCURRENCY : number;
    public SROURESER : string;
    public SCONTROL : string;
    public NUSERCODE : number;
    public NCOVER : number;
    public DNULLDATE: string;
    public SEDITABLE : string;
    public NCAPMINIM : number;
    public NCAPMAXIM : number;
    public NCACALFIX : number;
    public NCACALMUL : number;
    public NCAPBASPE : number;
    public SCHANGETYP : string;
    public NPREMIRAT : number;
    public DEFFECDATE : string;
    public SORIGEN : string;
    public SDESCRIPT_CAPITAL : string;
    public getNBRANCH() : number { return this.NBRANCH }
}