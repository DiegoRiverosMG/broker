import { Component, OnInit } from '@angular/core';
import { BsDatepickerConfig } from 'ngx-bootstrap/datepicker';
import swal from 'sweetalert2';
import { AtpReportService } from '../../../services/atp-reports/atp-report.service';
import { ExcelService } from '../../../services/shared/excel.service';
import { isEqual } from 'lodash';

export class Select {
  valor: string;
  descript: string;
}
@Component({
  selector: 'app-vdp-provision-comision-evaluacion-consulta',
  templateUrl: './vdp-provision-comision-evaluacion-consulta.component.html',
  styleUrls: ['./vdp-provision-comision-evaluacion-consulta.component.css']
})
export class VdpProvisionComisionEvaluacionConsultaComponent implements OnInit {

  //CheckBox
  UnselectedItemMessage: any = '';
  StartDateSelected: any = '';
  EndDateSelected: any = '';


  ArrayRequest: any[] = [];
  hasChanges: boolean = false;

  opcionesAuditoria: Select[] = [
    { valor: "0", descript: "Pendiente" },
    { valor: "1", descript: "OK" },
    { valor: "3", descript: "No Aplica" },
  ]
  opcionesJefe: Select[] = [
    { valor: "0", descript: "Pendiente" },
    { valor: "1", descript: "Si" },
    { valor: "2", descript: "No" },
    { valor: "3", descript: "No Aplica" },
  ]
  opcionesSupervisor: Select[] = [
    { valor: "0", descript: "Pendiente" },
    { valor: "1", descript: "Si" },
    { valor: "2", descript: "No" },
    { valor: "3", descript: "No Aplica" },
  ]

  isError: boolean = false;

  //Pantalla de carga
  isLoading: boolean = false;
  //Fechas
  bsConfig: Partial<BsDatepickerConfig>;
  bsValueIni: Date = new Date();
  bsValueFin: Date = new Date();
  bsValueFinMax: Date = new Date();
  // data: ReportAtpSearch = new ReportAtpSearch();

  public maxSize = 5; // cantidad de paginas que se mostrarán en el html del paginado
  public totalItems = 0; //total de items encontrados
  public foundResults: any = [];  //Lista de registros encontrados durante la búsqueda
  public foundResults2: any = [];
  genericErrorMessage = 'Ha ocurrido un error inesperado. Por favor contáctese con soporte.'; //Mensaje de error genérico
  notfoundMessage: string = 'No se encontraron registros';

  currentPage: number = 1; // Página actual
  itemsPerPage: number = 5; // Número de elementos por página
  listToShow: any[] = []; // Declaración de la variable listToShow

  //Formato de la fecha
  constructor(
    private AtpReportService: AtpReportService,
    private excelService: ExcelService

  ) {
    this.bsConfig = Object.assign(
      {},
      {
        dateInputFormat: "DD/MM/YYYY",
        locale: "es",
        showWeekNumbers: false
      }
    );
  }

  //Funciones que se ejecutarán tras la compilación
  ngOnInit() {
    this.bsValueIni = new Date(this.bsValueIni.getFullYear(), this.bsValueIni.getMonth(), this.bsValueIni.getDate());
  }

  //Cambio de página
  updateListToShow() {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = this.currentPage * this.itemsPerPage;
    this.listToShow = this.foundResults.slice(startIndex, endIndex);
  }

  pageChanged(page: number) {
    this.currentPage = page;
    this.updateListToShow();
  }

  ReportConsultaComisionCabeceraVDP(data, rpt_final: number = 0) {
    console.log("envio de fechas", data);
    this.ArrayRequest = [];

    this.AtpReportService.ConsultaComisionVDP(data).subscribe(
      res => {
        this.foundResults = res.genericResponse.map((result: any) => {
          result.hasChanges = false;
          return result;
        });

        this.totalItems = this.foundResults.length;
        this.updateListToShow(); // Actualizar la lista a mostrar

        if (this.foundResults.length > 0) {
          console.log("Datos tabla:", this.foundResults); // Imprimir el arreglo completo en la consola
          this.foundResults2 = JSON.parse(JSON.stringify(this.foundResults)); // Realizar una copia profunda de los objetos
        } else {
          console.log("Datos tabla:", "NO SE ENCONTRARON DATOS"); // Imprimir el arreglo completo en la consola
        }

        this.isLoading = false;
        if (rpt_final == 1) {

          swal.fire({
            title: 'Cambios guardados',
            text: 'Los cambios se han guardado exitosamente.',
            icon: 'success',
            confirmButtonText: 'Aceptar'
          });
        }
      },
      error => {
        this.foundResults = [];
        this.totalItems = 0;
        this.isLoading = false;
      }
    );
  }

  //Función para procesar los reportes
  ProcessConsultaVDP(procesovdp: number, rpt_final: number = 0): Promise<void> {
    this.isError = false;
    if (this.bsValueIni == null) {
      this.isError = true;
      this.UnselectedItemMessage = 'La fecha debe estar completa.';
    }

    if (this.isError == true) {
      swal.fire({
        title: 'Información',
        text: this.UnselectedItemMessage,
        icon: 'warning',
        confirmButtonText: 'Continuar',
        allowOutsideClick: false

      }).then((result) => {
        if (result.value) {
        }
      });
      this.isLoading = false;
      err => {
        this.isLoading = false;
      }
    } else {
      if (this.bsValueIni != null) {
        this.StartDateSelected = this.bsValueIni.getDate().toString().padStart(2, '0') + "/" + (this.bsValueIni.getMonth() + 1).toString().padStart(2, '0') + "/" + this.bsValueIni.getFullYear();
      }
      this.isLoading = true;
      let data: any = {};

      if (this.bsValueIni != null) {
        data.dStart_Date = this.bsValueIni.getFullYear() + "-" + (this.bsValueIni.getMonth() + 1).toString().padStart(2, '0') + "-" + this.bsValueIni.getDate().toString().padStart(2, '0');
      } else {
        data.dStart_Date = null;
      }
      const user = JSON.parse(localStorage.getItem('currentUser'));
      data.nusercode = user?.id;
      data.procesovdp = procesovdp;

      this.ReportConsultaComisionCabeceraVDP(data, rpt_final);
    }
    return Promise.resolve();
  }


  cambioFila(result: any) {
    const user = JSON.parse(localStorage.getItem('currentUser'));
    result.nusercode = user?.id;
    console.log("Resultado: ", result);

    const index = this.ArrayRequest.findIndex(
      x => x.poliza === result.poliza && x.num_cuota === result.num_cuota
    );

    if (index < 0) {
      this.ArrayRequest.push(JSON.parse(JSON.stringify(result)));
    } else {
      const originalResult = this.ArrayRequest[index];
      if (!isEqual(result, originalResult)) {
        result.hasChanges = true;
        this.ArrayRequest.splice(index, 1, JSON.parse(JSON.stringify(result)));
      } else {
        result.hasChanges = false;
        this.ArrayRequest.splice(index, 1);
      }
    }

    console.log("Resultado Final: ", this.ArrayRequest);
  }


  guardaCambios() {

    let hasChanges = false;
    const modifiedResults = [];


    for (let i = 0; i < this.foundResults.length; i++) {
      const originalResult = this.foundResults2[i];
      const modifiedResult = this.foundResults[i];
      const poliza = modifiedResult.poliza;

      if (
        originalResult.auditoria_control !== modifiedResult.auditoria_control ||
        originalResult.v_b_jefe !== modifiedResult.v_b_jefe ||
        originalResult.v_b_surpervisor !== modifiedResult.v_b_surpervisor
      ) {
        modifiedResult.hasChanges = true;
        hasChanges = true;

        if (modifiedResult.num_cuota > 1) {

          // Verificar cuotas consecutivas
          const cuotasConsecutivas = this.foundResults
            .slice(i + 1)
            .filter(result => result.poliza === poliza && result.num_cuota === modifiedResult.num_cuota + 1);

          const cuotasConsecutivasSinEvaluar = cuotasConsecutivas.some(
            result => result.auditoria_control === "0" || result.v_b_jefe === "0" || result.v_b_surpervisor === "0"
          );

          if (cuotasConsecutivasSinEvaluar) {
            swal.fire({
              title: 'Información',
              text: 'Existen pólizas con cuotas previas pendientes de evalución.',
              icon: 'error',
              confirmButtonText: 'Aceptar'
            });
            return;
          }

          const cuotasMenoresSinEvaluar = this.foundResults
            .slice(0, i)
            .filter(result => result.poliza === poliza && result.num_cuota < modifiedResult.num_cuota)
            .some(result => result.auditoria_control === "0" || result.v_b_jefe === "0" || result.v_b_surpervisor === "0");

          if (cuotasMenoresSinEvaluar) {
            swal.fire({
              title: 'Información',
              text: 'Existen pólizas con cuotas previas pendientes de evalución.',
              icon: 'error',
              confirmButtonText: 'Aceptar'
            });
            return;
          }
        }
        modifiedResults.push(modifiedResult);

        console.log(modifiedResult);
      } else {
        modifiedResult.hasChanges = false;
      }
    }

    if (hasChanges && modifiedResults.length > 0) {
      swal.fire({
        title: 'Confirmar guardado',
        text: '¿Estás seguro que deseas guardar los cambios?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Guardar',
        cancelButtonText: 'Cancelar'
      }).then((result) => {
        if (result.value) {
          // Realizar la lógica de guardado de los cambios aquí
          this.AtpReportService.insertarDatosConsultaComisionVDP(modifiedResults).subscribe(
            response => {
              // Restablecer la variable hasChanges en todas las filas
              this.foundResults.forEach((result: any) => {
                result.hasChanges = false;
              });
              if (response.totalRowNumber == "200") {
                this.ProcessConsultaVDP(1, 1);
              } else {
                swal.fire({
                  title: 'Error',
                  text: 'Ocurrió un error al insertar los cambios.',
                  icon: 'error',
                  confirmButtonText: 'Aceptar'
                });
              }
            },
            error => {
              swal.fire({
                title: 'Error',
                text: 'Ocurrió un error al guardar los cambios.',
                icon: 'error',
                confirmButtonText: 'Aceptar'
              });
            }
          );
        }
      });
    } else {
      swal.fire({
        title: 'No se han realizado cambios',
        text: 'No se han detectado cambios para guardar.',
        icon: 'warning',
        confirmButtonText: 'Aceptar'
      });
    }
  }


}
