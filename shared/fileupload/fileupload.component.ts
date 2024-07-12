import { Component, ChangeDetectionStrategy, EventEmitter, OnInit, Output, Input } from '@angular/core';
//import { FileUploader } from 'ng2-file-upload/ng2-file-upload';
//'ng2-file-upload/ng2-file-upload';
import { FileUploadService } from '../../services/fileupload/fileupload.service';
const URL = 'https://evening-anchorage-3159.herokuapp.com/api/';

@Component({
  selector: 'app-fileupload',
  templateUrl: './fileupload.component.html',
  styleUrls: ['./fileupload.component.css']
})
export class FileUploadComponent implements OnInit {
  public fileToUpload: File = null;

  @Output() evResultFileUpload = new EventEmitter<File>();

  constructor(private fileUploadService: FileUploadService) { }

  ngOnInit() { }

  handleFileInput(files: FileList) {
    this.fileToUpload = files.item(0);
    this.evResultFileUpload.emit(this.fileToUpload);
  }

  /* uploadFileToActivity() {
       this.fileUploadService.postFile(this.fileToUpload).subscribe(data => {
         // do something, if upload success
         console.log(data);
         }, error => {
           console.log(error);
         });
     }
*/
  /* uploader: FileUploader = new FileUploader({
     url: URL,
     isHTML5: true
   });
   hasBaseDropZoneOver = false;
   hasAnotherDropZoneOver = false;

   fileOverBase(e: any): void {
     this.hasBaseDropZoneOver = e;
   }

   fileOverAnother(e: any): void {
     this.hasAnotherDropZoneOver = e;
   }*/
}
