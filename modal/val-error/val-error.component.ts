import { Component, OnInit, Input, AfterContentInit, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl, AbstractControl, NgForm } from "@angular/forms";
import Swal from 'sweetalert2';
import { ExcelService } from '../../services/shared/excel.service';
import { BsModalRef } from 'ngx-bootstrap/modal';

@Component({
  selector: 'app-val-error',
  templateUrl: './val-error.component.html',
  styleUrls: ['./val-error.component.css']
})
export class ValErrorComponent implements OnInit {
  @Input() public formModalReference: any; 
  @Input() public erroresList: any;
  @Input() public changeList: any;

  modalRef: BsModalRef;

  flagErrors = 0;

  flagConfirm = 0;

  constructor(private excelService: ExcelService) { }

  ngOnInit() {
    if (this.erroresList != null){
      if(this.erroresList.length > 0){
        this.flagErrors = 0;
      }
    }
    else{
      this.flagErrors = 1;
    }
  }

  GenerarReporte(){
    if (this.erroresList != null){
      if(this.erroresList.length > 0 && this.flagErrors == 0){
        this.excelService.generateErroresExcel(this.erroresList, "Errores");
        this.formModalReference.close()
      }
    }
    else{
      this.excelService.generateChangesExcel(this.changeList, "Cambios");
    }
  }

  endosarPoliza(){
    Swal.fire({
      title: 'Información',
      text: 'Confirmar los cambios de los asegurados ¿Estás seguro?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Aceptar',
      allowOutsideClick: false,
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.value) {
        this.flagConfirm = 1;
        this.formModalReference.close(this.flagConfirm);
      }
    });
    
  }
}
