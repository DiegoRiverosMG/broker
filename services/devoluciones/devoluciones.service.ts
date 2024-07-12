/**********************************************************************************************/
/*  NOMBRE              :   creditNote.Service.TS                                               */
/*  DESCRIPCION         :   Capa Services                                                       */
/*  AUTOR               :   MATERIAGRIS - FRANCISCO AQUIÑO RAMIREZ                              */
/*  FECHA               :   20-12-2021                                                          */
/*  VERSION             :   1.0 - Generación de NC - PD                                         */
/*************************************************************************************************/
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { HttpClient, HttpHeaders, HttpClientModule } from '@angular/common/http';
import { AppConfig } from '../../../../app.config';
import { formatDate } from '@angular/common';
import { Color, defaultColors } from 'ng2-charts';


@Injectable({
  providedIn: 'root'
})
export class DevolucionesService {
  
  private headers = new HttpHeaders({ "Content-Type": "application/json" });
  private Url = AppConfig.URL_API_SCTR;
  constructor(private http: HttpClient) {
  }

  //Obtener Combo ListarTipoDevoluciones

  public listarMotivo() : Observable<any> {
    return this.http.get<any[]>(this.Url + '/Devoluciones/ListarMotivoDev');
  };
  public listarTipoDev() : Observable<any> {
    return this.http.get<any[]>(this.Url + '/Devoluciones/ListarTipoDevoluciones');
  };

  public listarTipoDoc() : Observable<any> {
    return this.http.get<any[]>(this.Url + '/Devoluciones/ListarTipoDoc');
  };

  public listarCombosDevoluciones() : Observable<any> {
    return this.http.get<any[]>(this.Url + '/Devoluciones/ListarCombosDevoluciones');
  };
  public listarBancosCajas() : Observable<any> {
    return this.http.get<any[]>(this.Url + '/Devoluciones/ListarBancosCajas');
  };
  public EnviarCorreo() : Observable<any> {
    return this.http.get<any[]>(this.Url + '/Devoluciones/EnviarCorreo');
  };
  
  


  public vizualizarDevoluciones(idata: any): Observable<any> {
    
    const data = JSON.stringify(idata);
    return this.http.post(this.Url + '/Devoluciones/VizualizarDevoluciones',data,{headers: this.headers});
  }

  public enviarExactus(idata: any): Observable<any> {
    
    const data = JSON.stringify(idata);
    return this.http.post(this.Url + '/Devoluciones/EnviarExactus',data,{headers: this.headers});
  }
  //--------------Reversion----------------//
  public comboMetodo() : Observable<any> {
    return this.http.get<any[]>(this.Url + '/Devoluciones/ListarMetodosBusqueda');
  };
  public busquedaListarCombo(idata: any): Observable<any> {
    const data = JSON.stringify(idata);
    return this.http.post(this.Url + '/Devoluciones/ListarBusquedaCombo',data,{headers: this.headers});
  }
  public enviarCorreoReversion(idata: any): Observable<any> {
    const data = JSON.stringify(idata);
    return this.http.post(this.Url + '/Devoluciones/EnviarCorreoReversion',data,{headers: this.headers});
  }

  //--------------CORREO-------------------//

  public busquedaFechasCorreo(idata: any): Observable<any> {
    
    const data = JSON.stringify(idata);
    return this.http.post(this.Url + '/Devoluciones/BusquedaFechasCorreo',data,{headers: this.headers});
  }
  public busquedaHoraFechasCorreo(idata: any): Observable<any> {
    
    const data = JSON.stringify(idata);
    return this.http.post(this.Url + '/Devoluciones/BusquedaHoraFechasCorreo',data,{headers: this.headers});
  }
  public enviarCorreo(idata: any): Observable<any> {
    
    const data = JSON.stringify(idata);
    return this.http.post(this.Url + '/Devoluciones/EnviarCorreo',data,{headers: this.headers});
  }
  
  

 //--------------CORREO-------------------//
// en un post
/*   public pruebas(data: any): Observable<any> {
    const body = JSON.stringify(data);
    return this.http.post(this.Url + '/NoteCreditRefund/pruebas', data,{headers: this.headers});

  } */


}


