import { Component, OnInit, Input } from '@angular/core';
import { OthersService } from '../../../services/shared/others.service';
import swal from 'sweetalert2';

@Component({
  selector: 'app-policy-documents',
  templateUrl: './policy-documents.component.html',
  styleUrls: ['./policy-documents.component.css']
})
export class PolicyDocumentsComponent implements OnInit {
  @Input() public reference: any;
  @Input() public adjuntosList: any;
  @Input() public generadosList: any;
  @Input() public comentario: any;
  @Input() public motAnulacion: any;
  @Input() public codTransac: any;

  title = "";

  constructor(
    private othersService: OthersService
  ) { }

  ngOnInit() {
    if(this.codTransac == "6"){
      this.title = "Detalle - Anulación de movimiento"
    }else{
      this.title = "Documentos y Archivos adjuntos"
    }
  }

  downloadFile(filePath: string) {  //Descargar archivos de cotización
    this.othersService.downloadFile(filePath).subscribe(
      res => {
        if (res.StatusCode == 1) {
          swal.fire('Información', this.listToString(res.ErrorMessageList), 'error');
        } else {
          var newBlob = new Blob([res], { type: "application/pdf" });
          if (window.navigator && window.navigator.msSaveOrOpenBlob) {
            window.navigator.msSaveOrOpenBlob(newBlob);
            return;
          }
          const data = window.URL.createObjectURL(newBlob);

          var link = document.createElement('a');
          link.href = data;

          link.download = filePath.substring(filePath.lastIndexOf("\\") + 1);
          link.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, view: window }));

          setTimeout(function () {
            window.URL.revokeObjectURL(data);
            link.remove();
          }, 100);
        }

      },
      err => {
        swal.fire('Información', 'Error inesperado, por favor contáctese con soporte.', 'error');
        console.log(err);
      }
    );
  }

  listToString(list: String[]): string {
    let output = "";
    if (list != null) {
        list.forEach(function (item) {
            output = output + item + " <br>"
        });
    }
    return output;
}
}
