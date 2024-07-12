import { Component, OnInit } from '@angular/core';
import { NgbModal, ModalDismissReasons, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { ParameterSettingsService } from '@root/layout/broker/services/maintenance/parameter-settings.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-edit-porcentaje',
  templateUrl: './edit-porcentaje.component.html',
  styleUrls: ['./edit-porcentaje.component.css']
})
export class EditPorcentajeComponent implements OnInit {

  reference: NgbModalRef;
  data: any = {};
  porcentaje = 0;
  constructor(private parameterSettingsService: ParameterSettingsService) { }

  ngOnInit(): void {
    this.porcentaje = this.data.PORCENTAJE
  }

  changePorcentaje(){                                     
    let porcentaje = Number(this.data.PORCENTAJE);
    if(porcentaje > 0 && porcentaje != null && porcentaje != undefined){
      this.data.VALOR_PORCENTAJE = Number((porcentaje / 100) * Number(this.data.RMV))
    }else{
      this.data.VALOR_PORCENTAJE = 0;
    }
  }

  closeModal(json?:any) {
    this.reference.close(json);
  }

  save(){
    
    if(this.data.PORCENTAJE <= 0 || this.data.PORCENTAJE == null){
      Swal.fire('Información','Debe ingresar un porcentaje válido mayor a 0','warning');
      return;
    }

    if(this.data.PORCENTAJE >= 100){
      Swal.fire('Información', 'El porcentaje no puede ser mayor al 100%','warning');
      return;
    }

    if(this.porcentaje == this.data.PORCENTAJE){
      Swal.fire('Información','El porcentaje no ha cambiado','warning');
      return;
    }

    this.data.NUSER_CODE = JSON.parse(localStorage.getItem('currentUser'))['id'];;

    //ACTUALIZAR
    this.parameterSettingsService.UpdatePorcentajeRMV(this.data).subscribe(
      res => {
        if(res.code == 0){
          Swal.fire('Información','Actualizado correctamente','success');
          this.closeModal(res)
        }else{
          Swal.fire('Información', res.message , 'warning');
          return;
        }
      },
      err => {
        console.log(err);
        this.closeModal()
      }
    )
  }

}