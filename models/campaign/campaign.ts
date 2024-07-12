export class Campaign {
  constructor(
    public nidcampaign: number,
    public ncountperson: number,
    public scodchannel: number,
    public schanneldes: string,
    public dstartdate: Date,
    public dexpirdate: Date,
    public sdescript: string,
    public nstate: number,
    public sstatedes: string,
    public bselected: boolean,
  ) {}
}
