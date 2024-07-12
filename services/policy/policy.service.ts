import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { HttpClientModule} from "@angular/common/http";
import { ApiService } from '../../../../../app/shared/services/api.service';
import { AppConfig } from "../../../../app.config";
import { Observable } from 'rxjs';

@Injectable()
export class PolicyService {
    private headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    private Url = AppConfig.URL_API_SCTR;
    
    constructor(private api: ApiService, private http: HttpClient) { }

    registerVisa(dataVisa) {
        console.log(dataVisa)
        const endpoint = 'emissionproc';
        const action = 'emissionprocesscompletepolicy';
        const url = `${endpoint}/${action}`;

        const customerName =
            dataVisa.cliente.p_SCLIENT_NAME +
            ' ' +
            dataVisa.cliente.p_SCLIENT_APPPAT.trim() +
            ' ' +
            dataVisa.cliente.p_SCLIENT_APPMAT.trim();

        const data = {
            TransactionToken: dataVisa.transactionToken,
            SessionToken: dataVisa.sessionToken,
            ProcesoId: dataVisa.processId,
            PlanillaId: dataVisa.planillaId,
            FlujoId: dataVisa.flujoId,
            UserId: dataVisa.userId,
            TipoPago: dataVisa.tipoPago,
            Nombres: dataVisa.nombres,
            Apellidos: dataVisa.apellidos,
            Correo: dataVisa.correo,
            Total: dataVisa.total,
            Movement: Number(dataVisa.movement),
            Policy: Number(dataVisa.policy),
            ProductId: Number(dataVisa.productId),
            // PDF Information ---------------------
            Pdf_Email: dataVisa.cliente.p_SMAIL,
            Pdf_CustomerName: customerName,
            Pdf_PhoneNumber: dataVisa.cliente.p_SPHONE,
            CodigoCanal: dataVisa.canal,
            CodigoPuntoDeVenta: dataVisa.puntoDeVenta,
            Modalidad: dataVisa.modalidad,
            ChannelCode: sessionStorage.getItem('referenteCode')
        };
        //return;
        return this.api.post(url, data);
    }
}
