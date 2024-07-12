export class Delivery {
  P_DFECHAENTREGADELIVERY: Date;
  P_STURNOENTREGADELIVERY: Date;
  P_SFORMAPAGODELIVERY: string;
  P_SDIRECCIONENTREGADELIVERY: string;
  P_SCOMENTARIODELIVERY: string;
  P_NMUNICIPALITYDELIVERY: number;
  P_NLOCATDELIVERY: number;
  P_NPROVINCEDELIVERY: number;
}

export class Turno {
  id: string;
  description: string;
  tipo: string;
}

export class FormaDePago {
  id: string;
  description: string;
  tipo: string;
}


