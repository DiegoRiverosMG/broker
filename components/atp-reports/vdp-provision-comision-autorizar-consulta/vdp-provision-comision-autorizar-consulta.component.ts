import { Component, OnInit } from '@angular/core';
import { BsDatepickerConfig } from 'ngx-bootstrap/datepicker';
import swal from 'sweetalert2';
import { AtpReportService } from '../../../services/atp-reports/atp-report.service';
import { ExcelService } from '../../../services/shared/excel.service';

export class Select {
  valor: string;
  descript: string;
}
@Component({
  selector: 'app-vdp-provision-comision-autorizar-consulta',
  templateUrl: './vdp-provision-comision-autorizar-consulta.component.html',
  styleUrls: ['./vdp-provision-comision-autorizar-consulta.component.css']
})
export class VdpProvisionComisionAutorizarConsultaComponent implements OnInit {

  //CheckBox
  UnselectedItemMessage: any = '';
  StartDateSelected: any = '';
  EndDateSelected: any = '';
  selectedOption: number = 1; // Valor predeterminado: POR AUTORIZAR


  ArrayRequest: any[] = [];
  hasChanges: boolean = false;

  selectedRows: any[] = [];
  selectAllRows: boolean = false;

  filasSeleccionadas: any[] = [];

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
  //MOSTRAR BOTONES 
  guardarBtnDisabled: boolean = false;
  mostrarCheckboxes: boolean = true;

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

  /*   onOptionChange(event: any) {
      if (this.selectedOption == 1) {
        this.guardarBtnDisabled = false;
        this.mostrarCheckboxes = true;
      } else if (this.selectedOption == 2) {
          this.guardarBtnDisabled = true;
          this.mostrarCheckboxes = false;
      }
      console.log('mostrarCheckboxes:', this.mostrarCheckboxes);
    } */
  onOptionChange(event: any) {
    // Restablecer los valores de la tabla y las filas seleccionadas
    this.foundResults = [];
    this.totalItems = 0;
    this.isLoading = false;
    this.selectedRows = [];
    this.filasSeleccionadas = [];
    this.selectAllRows = false;

    if (this.selectedOption == 1) {
      this.guardarBtnDisabled = false;
      this.mostrarCheckboxes = true;
    } else if (this.selectedOption == 2) {
      this.guardarBtnDisabled = true;
      this.mostrarCheckboxes = false;
    }
    console.log('mostrarCheckboxes:', this.mostrarCheckboxes);
  }

  onSelectAllChange(checked: boolean) {
    this.selectAllRows = checked;
    this.selectedRows = checked ? [...this.foundResults] : [];

    // Actualizar el estado de selección en todas las filas
    this.foundResults.forEach((result: any) => {
      result.selected = checked;
    });
  }

  onRowSelectChange(row: any, checked: boolean) {
    row.selected = checked;
    const index = this.selectedRows.indexOf(row);

    if (checked && index === -1) {
      this.selectedRows.push(row);
    } else if (!checked && index !== -1) {
      this.selectedRows.splice(index, 1);
    }

    this.updateSelectAllRowsState();
  }

  updateSelectAllRowsState() {
    if (this.selectedRows.length === this.foundResults.length) {
      this.selectAllRows = true;
    } else {
      this.selectAllRows = false;
    }
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

  //Función para procesar los reportes
  ProcessConsultaVDP(procesovdp: number, rpt_final: number = 0) {
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
      /*       const user = JSON.parse(localStorage.getItem('currentUser'));
            data.nusercode = user?.id; */
      data.procesovdp = this.selectedOption;

      this.ReportConsultaComisionCabeceraVDP(data, rpt_final);

    }
    this.selectAllRows = false;
  }

  ReportConsultaComisionCabeceraVDP(data, rpt_final: number = 0) {
    // console.log(data);

    //console.log("envio de fechas", data);
    this.ArrayRequest = [];

    this.AtpReportService.ConsultaAutorizarComisionVDP(data).subscribe(
      res => {
        this.foundResults = res.genericResponse.map((result: any) => {
          result.hasChanges = false;
          return result;
        });

        this.totalItems = this.foundResults.length;
        this.updateListToShow(); // Actualizar la lista a mostrar

        if (this.foundResults.length > 0) {
          // console.log("Datos tabla:", this.foundResults); // Imprimir el arreglo completo en la consola
          this.foundResults2 = JSON.parse(JSON.stringify(this.foundResults)); // Realizar una copia profunda de los objetos
        } else {
          console.log("Datos tabla:", "NO SE ENCONTRARON DATOS"); // Imprimir el arreglo completo en la consola
        }
        this.selectedRows = [];
        this.filasSeleccionadas = [];
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




  guardaCambios() {

    const cuote_selected = this.foundResults.filter((item) => {
      if (item.selected) {
        return item;
      }
    })
    this.selectedRows = cuote_selected;


    if (this.selectedRows.length > 0) {
      let cuotasValidas = true;
      const cuotasPorPoliza = {};

      this.foundResults.forEach(result => {
        const poliza = result.poliza;
        // const cuota = parseInt(result.num_cuota);

        if (!cuotasPorPoliza[poliza]) {
          cuotasPorPoliza[poliza] = [];
        }
        // cuotasPorPoliza[poliza].push(cuota);
        cuotasPorPoliza[poliza].push(result);
      });

      for (let item_poliza in cuotasPorPoliza) {
        
        const cuotas_menores = [];

        this.selectedRows.filter((item_selected, index) => {

          if (item_poliza == item_selected.poliza) {

            if ( (this.selectedRows[index + 1]?.num_cuota == undefined && this.selectedRows[index - 1]?.num_cuota != undefined) && (this.selectedRows[index - 1]?.num_cuota == undefined && this.selectedRows[index + 1]?.num_cuota != undefined)) {}

            else {

              // console.log("Error 1");
              if ( ( (parseInt(item_selected?.num_cuota) + 1) == this.selectedRows[index + 1]?.num_cuota ) || ( (parseInt(item_selected?.num_cuota) - 1) == this.selectedRows[index - 1]?.num_cuota ) || ( cuotasPorPoliza[item_poliza].length == 1 ) || ( this.selectedRows.length == 1 ) || ( this.selectedRows[index - 1]?.num_cuota != undefined )) {

                cuotasPorPoliza[item_poliza].filter((policy_item)=>{
                  // console.log(e.num_cuota);
                  // console.log(e?.selected);

                  if (!(policy_item?.selected) && policy_item.num_cuota < this.selectedRows[index].num_cuota){
                    // console.log("Si  el elemento que se esta recorriendo NO esta seleccionado y La CUOTA del elemento es Menor a  Cuota seleccionada");
                    cuotas_menores.push(this.selectedRows[index]);
                  }

                })
                  
               }

                else {
                  // console.log("Error 2");
                for (let index = 0; index < cuotasPorPoliza[item_poliza].length; index++) {

                  if (parseInt(cuotasPorPoliza[item_poliza][index].num_cuota) < parseInt(item_selected.num_cuota) || (cuotasPorPoliza[item_poliza][index - 1]?.selected))  {
                    // console.log("Error 3");
                    cuotas_menores.push(cuotasPorPoliza[item_poliza][index]);
                  }
                }
              }

            }
          }

        });

        if (cuotas_menores.length > 0) {
          cuotasValidas = false;
          break;
        }
      }

      if (!cuotasValidas) {
        // Mostrar mensaje de error, cuotas inválidas
        swal.fire({
          title: 'Error',
          text: 'Existen pólizas con cuotas previas pendientes de autorizar',
          icon: 'error',
          confirmButtonText: 'Aceptar'
        });
      } else {
        // Mostrar el mensaje de advertencia
        swal.fire({
          title: 'Información',
          text: '¿Desea Autorizar el pago de la comisión?',
          icon: 'warning',
          showCancelButton: true,
          confirmButtonText: 'Sí, guardar cambios',
          cancelButtonText: 'Cancelar'
        }).then((result) => {
          if (result.value) {
            const user = JSON.parse(localStorage.getItem('currentUser'));
            this.filasSeleccionadas = this.selectedRows.map((row: any) => {
              return {
                poliza: row.poliza,
                num_cuota: row.num_cuota,
                nusercode: user?.id
              };
            });

            // Preparar los datos a enviar al backend
            let datos = [];
            datos = this.filasSeleccionadas
            console.log(datos);

            this.AtpReportService.GuardarAutorizarComisionVDP(datos).subscribe(
              response => {
                if (response.errors) {
                  // Mostrar mensaje de error
                  swal.fire({
                    title: 'Error',
                    text: 'Ocurrió un error al guardar los cambios.',
                    icon: 'error',
                    confirmButtonText: 'Aceptar'
                  });
                } else {
                  // Restablecer la variable hasChanges en todas las filas
                  this.selectedRows = [];
                  this.filasSeleccionadas = [];
                  this.selectAllRows = false;
                  this.foundResults.forEach((result: any) => {
                    result.selected = false;
                  });
                  this.ProcessConsultaVDP(1, 1);

                }
              },
              error => {
                // Mostrar mensaje de error
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
      }
    } else {
      // Mostrar el mensaje de error, no se han seleccionado filas
      swal.fire({
        title: 'Información',
        text: 'No se han seleccionado filas para guardar cambios.',
        icon: 'warning',
        confirmButtonText: 'Aceptar'
      });
    }
  }
}