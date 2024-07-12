export class  PayrollPayment {

    constructor(
        // Parametros de entrada
        public nidpayrolldetail: number,
        public ncurrency: number,
        public namount: number,
        public nidpaidtype: number,
        public nbank: number,
        public nbankaccount: number,
        public soperationnumber: string,
        public doperationdate: string,
        public sreference: string,
        public sstate: string,
        public nuserregister: number,
        public ncurrencytext: string,
        public nbanktext: string,
        public nbankaccounttext: string,
        public nidpaidtypetext: string,
        public selected: boolean
    ) {}
}
