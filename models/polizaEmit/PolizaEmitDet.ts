export class PolizaEmitDet{
	constructor(
		public  TIP_RIESGO?:any,
        public  DES_RIESGO?:any,
        public  NUM_TRABAJADORES?:any,
		public  MONTO_PLANILLA?:any,
		
		public  ID_PRODUCTO?:any,

        public  NOMBRE_PRODUCT?:any,
        public  TASA?:any,
        public  PRIMA?:any,

        public  FACTOR_IGV?:any
	){

	}
}

export class PolizaEmitDetAltoRiesgo{
	constructor(
		public  NUM_TRABAJADORESAlto?:any,
		public  MONTO_PLANILLAAlto?:any,
		public   TASAAltoStrc?:any,
        public   PrimaAltoStrc?:any,
		public   TASAAltoSalud?:any,
        public   PrimaAltoSalud?:any
	){

	}
}

export class PolizaEmitDetMedianoRiesgo{
	constructor(
		public  NUM_TRABAJADORESMediano?:any,
		public  MONTO_PLANILLAMediano?:any,
		public   TASAMedianoStrc?:any,
        public   PrimaMedianoStrc?:any,
		public   TASAMedianoSalud?:any,
        public   PrimaMedianoSalud?:any
	){

	}
}

export class PolizaEmitDetBajoRiesgo{
	constructor(
		public  NUM_TRABAJADORESBajo?:any,
		public  MONTO_PLANILLABajo?:any,
		public   TASABajoStrc?:any,
        public   PrimaBajoStrc?:any,
		public   TASABajoSalud?:any,
        public   PrimaBajoSalud?:any
	){

	}
}

