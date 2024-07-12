export interface ITarifarioRequest {
  idTipoDocumento: number;
  fechaNacimiento: string;
  numeroDocumento: string;
}

export interface ITarifarioResponse {
  cumulus: {
    nCountPolicy: number,
    nCumulusAvailble: number,
    nTc: number,
    sExceedsCumulus: string,
    nCumulusMax: number,

  };

  success: boolean;
  idProcess: number;
  errorMessage: string;
  errorCode: string;
  idecon: {
    isIdNumber: boolean;
    isPep: boolean;
    isFamPep: boolean;
    isIdNumberFamPep: boolean;
    isOtherList: boolean
  };
  rateAges: [
    {
      edad: number;
      moneda: [
        {
          simbolo: string;
          idMoneda: number;
          sumaAsegurada: [
            {
              montoSumaAsegurada: number;
              frecuenciaPago: [
                {
                  idFrecuencia: number;
                  frecuencia: string;
                  porcentajeRetorno: [
                    {
                      montoPorcentaje: number;
                      primas: [
                        {
                          primeraCuota: number;
                          primaMensual: number;
                          primaAnual: number;
                          primaRetorno: number;
                          primaFallecimiento: number;
                          plan: number;
                          idTarifario: number;
                          codigoComercio: string;
                          descPrimeraCuota: number;
                          descPrima: number
                        }
                      ]
                    }
                  ]
                }
              ]
            }
          ]
        }
      ]
    }
  ];
  saltarIdecon: boolean;
  saltarWorldCheck: boolean;
  saltarExperian: boolean;
}




  /* idProcess: number;
  idCliente: number;
  errorMessage: string;
  errorCode: string;
  rateAges: [
    {
      edad: number;
      moneda: [
        {
          simbolo: string;
          idMoneda: number;
          sumaAsegurada: [
            {
              montoSumaAsegurada: number;
              porcentajeRetorno: [
                {
                  montoPorcentaje: number;
                  primas: [
                    {
                      primeraCuota: number;
                      primaMensual: number;
                      primaAnual: number;
                      primaRetorno: number;
                      primaFallecimiento: number;
                      plan: number;
                      idTarifario: number
                    }
                  ]
                }
              ]
            }
          ]
        }
      ]
    }
  ];
  saltarIdecon: boolean;
  saltarWorldCheck: boolean;
  saltarExperian: boolean;
  success: boolean;
   message: string; */

