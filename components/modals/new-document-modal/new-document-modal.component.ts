import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-new-document-modal',
  templateUrl: './new-document-modal.component.html',
  styleUrls: ['./new-document-modal.component.css'],
})
export class NewDocumentModalComponent implements OnInit {
  @Input() check_input_value;
  @Input() public reference: any;
  @Input() public formModalReference: any; //Referencia al modal creado desde el padre de este componente para ser cerrado desde aquí

  isLoading: boolean = false;
  pdfFile: File | null = null;
  errorMessage: string | null = null;

  constructor() {}

  ngOnInit(): void {
    this.isLoading = true;
  }

  onFileChange = (event: any) => {
    const fileList: FileList = event.target.files;
    if (fileList.length > 0) {
      const file: File = fileList[0];
      const fileExtension = file.name.split('.').pop().toLowerCase();
      if (fileExtension === 'pdf') {
        this.pdfFile = file;
        this.errorMessage = null;
      } else {
        this.pdfFile = null;
        this.errorMessage = 'Solo se permiten archivos PDF.';
      }
    }
  };

  onSubmit = () => {
    if (this.pdfFile) {
      let myFormData: FormData = new FormData();

      myFormData.append('objeto', JSON.stringify(this.reference.obj));
      myFormData.append('dataFile', this.pdfFile);
      this.reference.close();
      this.reference.previusStep();
    }
  };
}
