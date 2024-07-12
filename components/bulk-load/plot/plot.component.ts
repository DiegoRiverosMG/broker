import { Component, OnInit, Input, ViewChild, ElementRef } from "@angular/core";
import { LoadMassiveService } from "../../../services/LoadMassive/load-massive.service";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { MonitoringViewComponent } from "../monitoring-view/monitoring-view.component";
import swal from "sweetalert2";

@Component({
  selector: "app-plot",
  templateUrl: "./plot.component.html",
  styleUrls: ["./plot.component.css"],
})
export class PlotComponent implements OnInit {
  clickValidarArchivos = false;
  files: File[] = [];
  listToEntity: any = [];
  idEntity: any = "";
  indContador: number = 0;
  isLoading: boolean = false;
  fileUpload: File;
  listToPath: any = [];
  listToFileConfig: any = [];
  listFileConfigProcess: any = [];
  lastInvalids: any;
  idPath: any;
  maxSize: any;
  element: HTMLElement;
  // @ViewChild('fileInput') resetFilePick: ElementRef;
  @Input() public reference: any;
  @ViewChild("myInput") inputFile: ElementRef;
  constructor(
    private modalService: NgbModal,
    private MassiveService: LoadMassiveService
  ) { }

  ngOnInit() {
    this.GetEntityConfig();
  }
  GetEntityConfig() {
    this.MassiveService.GetConfigurationEntity().subscribe(
      (res) => {
        this.listToEntity = res;
      },
      (err) => { }
    );
  }
  getDetailConfig(idPath: any) {
    this.MassiveService.GetConfigurationFiles(idPath).subscribe(
      (res) => {
        this.listToFileConfig = res;
      },
      (err) => { }
    );
  }

  GetPathConfig(identity: any) {
    this.MassiveService.GetConfigurationPath(identity).subscribe(
      (res) => {
        this.listToPath = res;
        this.idPath = this.listToPath[0].IdPathConfig;
        this.getDetailConfig(this.idPath);
      },
      (err) => { }
    );
  }

  UploadFile(archivo: File[]) {
    let FlgVal: any = 0;
    // this.isLoading = true;
    this.fileUpload = null;

    if (this.listToFileConfig.length > 0) {
      for (const File of archivo) {
        this.fileUpload = File;
        let IndError: any = 0;
        if (
          this.listToFileConfig.filter(
            (x) =>
              x.FileName.toUpperCase() ===
              this.fileUpload.name.split(".")[0].toUpperCase()
          ).length <= 0
        ) {
          this.PrintMessage(
            "El nombre del archivo " +
            this.fileUpload.name +
            " del archivo tiene que tener el nombre de algun proceso",
            "error"
          );
          IndError = 1;
        }
        if (
          this.files.filter((x) => x.name === this.fileUpload.name).length > 0
        ) {
          this.PrintMessage(
            "El archivo" + this.fileUpload.name + " ya se encuentra registrado",
            "error"
          );
          IndError = 1;
        }

        if (this.fileUpload.name.split(".").pop() !== "csv") {
          this.PrintMessage(
            "El archivo " +
            this.fileUpload.name +
            " no tiene la extensión correcta,Solo se permiten archivos csv",
            "error"
          );
          IndError = 1;
        }

        if (IndError !== 1) {
          this.files.push(this.fileUpload);
          if (
            this.files.filter((x) => x.name === this.fileUpload.name).length > 0
          ) {
            this.listFileConfigProcess.push(
              this.listToFileConfig.filter(
                (x) =>
                  x.FileName.toUpperCase() ===
                  this.fileUpload.name.split(".")[0].toUpperCase()
              )[0]
            );
          }
        }
      }
    } else {
      this.PrintMessage("Debe seleccionar un producto", "error");
    }
    this.inputFile.nativeElement.value = "";
  }

  PrintMessage(message: string, type: string) {
    swal.fire({
      title: type,
      text: message,
      icon: "error",
      confirmButtonText: "OK",
      allowOutsideClick: false,
    });
  }

  ChangeEntity() {
    this.GetPathConfig(this.idEntity);
  }

  seleccionArchivos() {
    if (this.files.length === 0) {
      this.clickValidarArchivos = false;
    }
    this.clickValidarArchivos = true;
  }

  eventSave(item: any) {
    this.isLoading = true;

    if (this.idPath != null && this.files.length > 0) {
      const myFormData: FormData = new FormData();

      this.files.forEach((file) => {
        myFormData.append("dataFile", file, file.name);
      });
      myFormData.append(
        "UserCode",
        JSON.parse(localStorage.getItem("currentUser"))["id"]
      );
      myFormData.append(
        "ListFileProcess",
        JSON.stringify(this.listFileConfigProcess)
      );
      myFormData.append("IdEntity", this.idEntity);
      myFormData.append("IdProduct", this.listToPath[0].IdProduct);
      myFormData.append("IdPath", this.idPath);

      this.MassiveService.ProcessFiles(myFormData).subscribe(
        (res) => {
          this.isLoading = false;

          swal
            .fire({
              title: "Información",
              text: "Se inicio el proceso " + res,
              icon: "success",
              confirmButtonText: "OK",
              allowOutsideClick: false,
            })
            .then((result) => {
              if (result.value) {
                const item: any = {
                  IdHeaderProcess: res,
                  IdProduct: this.listToPath[0].IdProduct,
                  IdIdentity: this.idEntity,
                };
                const modalRef = this.modalService.open(
                  MonitoringViewComponent,
                  {
                    size: "xl",
                    backdropClass: "light-blue-backdrop",
                    backdrop: "static",
                    keyboard: false,
                  }
                );
                modalRef.componentInstance.reference = modalRef;
                modalRef.componentInstance.contractor = item;

                modalRef.result.then(
                  (Interval) => {
                    clearInterval(Interval);
                  },
                  (reason) => { }
                );
              }
            });

          this.files = [];
          this.listFileConfigProcess = [];
        },
        (err) => {
          this.isLoading = false;
        }
      );
    } else {
      this.isLoading = false;
      this.PrintMessage("no se encontro ningun archivo a procesar", "Error");
    }
  }

  deteleFile(item: any, index: any) {
    this.files.splice(index, 1);

    let fsse: any = this.listFileConfigProcess.filter(
      (x) => x.FileName.toUpperCase() + ".CSV" === item.name.toUpperCase()
    );

    let te = this.listFileConfigProcess.indexOf(fsse[0]);

    this.listFileConfigProcess.splice(te, 1);
  }
}
