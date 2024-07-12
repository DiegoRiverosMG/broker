import { Component, OnInit, Input, ViewChild } from "@angular/core";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { LoadMassiveService } from "../../../services/LoadMassive/load-massive.service";
import { MonitoringErrorComponent } from "../monitoring-error/monitoring-error.component";
import { BsDatepickerConfig } from 'ngx-bootstrap/datepicker';
import swal from "sweetalert2";
import * as fileSaver from "file-saver";

@Component({
    selector: "app-monitoring-view",
    templateUrl: "./monitoring-view.component.html",
    styleUrls: ["./monitoring-view.component.css"],
})
export class MonitoringViewComponent implements OnInit {
    listToShow: any = [];
    fileUpload: File;
    fileTrama: string;
    lastInvalids: any;
    lstStatus: string[] = ["3", "4"];
    lstStatusCorrect: string[] = ["2", "4"];
    processDetailList: any = [];
    currentPage = 1;
    rotate = true;
    maxSize = 5;
    itemsPerPage = 8;
    totalItems = 0;
    isLoading: boolean = false;
    bsConfig: Partial<BsDatepickerConfig>;
    interval: any;
    btnFacturacion: boolean = false;
    flag: boolean = false;
    btnFacturar: boolean = false;
    @Input() public reference: any;
    @Input() public contractor: any;

    constructor(
        private modalService: NgbModal,
        private MassiveService: LoadMassiveService
    ) { }

    ngOnInit() {
        this.btnFacturacion = false;
        this.btnFacturar = true;
        this.GetProcessDetail();
        this.startTimer();
    }

    startTimer() {
        this.stopTimer();
        this.interval = setInterval(() => {
            this.GetProcessDetail();
        }, 2000);
    }

    stopTimer() {
        clearInterval(this.interval);
    }

    GetProcessDetail() {
        this.currentPage = 1;
        this.rotate = true;
        this.maxSize = 5;
        this.itemsPerPage = 5;
        this.totalItems = 0;

        const data: any = this.contractor.IdHeaderProcess;

        this.MassiveService.GetDetailProcess(data).subscribe(
            (res) => {
                this.processDetailList = res;
                this.totalItems = this.processDetailList.length;
                this.listToShow = this.processDetailList.slice(
                    (this.currentPage - 1) * this.itemsPerPage,
                    this.currentPage * this.itemsPerPage
                );
                if (this.processDetailList.length === 0) {
                    this.listToShow = [];
                    this.processDetailList = [];
                } else {
                    if (this.contractor.IdProduct == "117") {
                        let contador = 0;
                        let existFacturacion = false;
                        this.processDetailList.forEach((element) => {
                            if (element.IdFileConfig == 21) {
                                existFacturacion = true;
                            }
                            if (this.lstStatusCorrect.indexOf(element.IdStatusDetail) != -1) {
                                contador++;
                            }
                        });
                        this.btnFacturacion =
                            contador === this.processDetailList.length && !existFacturacion
                                ? true
                                : false;

                        this.processDetailList.forEach((element) => {
                            if (
                                element.IdFileConfig == 21 &&
                                this.lstStatusCorrect.indexOf(element.IdStatusDetail) == -1
                            ) {
                                this.btnFacturar = true;
                            } else if (
                                element.IdFileConfig == 21 &&
                                this.lstStatusCorrect.indexOf(element.IdStatusDetail) != -1
                            )
                                this.btnFacturar = false;
                        });
                    }
                }
            },
            (err) => { }
        );
    }

    pageChanged(currentPage) {
        this.currentPage = currentPage;
        this.listToShow = this.processDetailList.slice(
            (this.currentPage - 1) * this.itemsPerPage,
            this.currentPage * this.itemsPerPage
        );
    }

    ExportData(item: any) {
        const data: any = {};
        this.isLoading = true;
        data.IdHeaderProcess = this.contractor.IdHeaderProcess;
        data.IdFileConfig = item.IdFileConfig;
        data.table_reference = item.table_reference;
        this.MassiveService.GetDataExport(data).subscribe(
            (res) => {
                this.fileTrama = res.GenericResponse;
                if (this.fileTrama) {
                    const file = new File(
                        [this.obtenerBlobFromBase64(this.fileTrama, "")],
                        item.FileName.toLowerCase() + ".csv",
                        { type: "text/plain;charset=utf-8" }
                    );
                    fileSaver.saveAs(file);
                } else {
                }
                this.isLoading = false;
            },
            (err) => {
                this.isLoading = false;
            }
        );
    }
    obtenerBlobFromBase64(b64Data: string, contentType: string) {
        const byteCharacters = atob(b64Data);
        const byteArrays = [];
        for (let offset = 0; offset < byteCharacters.length; offset += 512) {
            const slice = byteCharacters.slice(offset, offset + 512);
            const byteNumbers = new Array(slice.length);
            for (let i = 0; i < slice.length; i++) {
                byteNumbers[i] = slice.charCodeAt(i);
            }
            const byteArray = new Uint8Array(byteNumbers);
            byteArrays.push(byteArray);
        }
        const blob = new Blob(byteArrays, { type: contentType });
        return blob;
    }
    OpenMovimiento(item: any, Opcion: any) {
        item.Opcion = Opcion;
        const modalRef = this.modalService.open(MonitoringErrorComponent, {
            size: "xl",
            backdropClass: "light-blue-backdrop",
            backdrop: "static",
            keyboard: false,
        });
        modalRef.componentInstance.reference = modalRef;
        modalRef.componentInstance.contractor = item;
    }

    GenerateFact() {
        debugger;
        let niddetailproc: number = 0;
        this.processDetailList.forEach((element) => {
            if (element.IdFileConfig == 21) {
                niddetailproc = element.IdDetailProcess;
            }
        });
        this.MassiveService.GenerateFact(
            this.contractor.IdHeaderProcess,
            niddetailproc,
            JSON.parse(localStorage.getItem("currentUser"))["id"]
        ).subscribe((res) => {
            swal.fire("Información", res.P_SMESSAGE, "success");
        });
    }

    UploadFile(archivo: File, item: any) {
        let existProcessing = 0;
        this.isLoading = true;
        this.fileUpload = null;
        if (!archivo) {
            this.fileUpload = null;
        }
        this.fileUpload = archivo;
        this.processDetailList.forEach((e) => {
            if (e.IdStatusDetail == 1) {
                swal
                    .fire({
                        title: "Información",
                        text: "El proceso de " + e.FileName + " se encuentra ejecuntando !",
                        icon: "warning",
                        confirmButtonText: "OK",
                        allowOutsideClick: false,
                    })
                    .then((result) => {
                        if (result.value) {
                        }
                    });
                existProcessing = 1;
                return;
            }
        });
        if (existProcessing === 1) {
            this.startTimer();
            this.isLoading = false;
            return;
        }
        if (this.fileUpload.name.toUpperCase() !== item.FileName + ".CSV") {
            swal.fire({
                title: "Información",
                text: "El nombre del archivo tiene que ser el mismo del proceso",
                icon: "error",
                confirmButtonText: "OK",
                allowOutsideClick: false,
            });
            this.startTimer();
            this.isLoading = false;
            return;
        }

        const myFormData: FormData = new FormData();

        myFormData.append("dataFile", this.fileUpload);
        myFormData.append(
            "UserCode",
            JSON.parse(localStorage.getItem("currentUser"))["id"]
        );
        myFormData.append("idHeaderProcess", item.IdHeaderProcess);
        myFormData.append("idDetailProcess", item.IdDetailProcess);
        myFormData.append("idFileConfig", item.IdFileConfig);
        myFormData.append("idIdentity", this.contractor.IdIdentity);
        this.MassiveService.UploadFileProcess(myFormData).subscribe(
            (res) => {
                this.isLoading = false;
                swal.fire({
                    title: "Información",
                    text: "Se comenzo el reproceso del archivo " + item.FileName,
                    icon: "success",
                    confirmButtonText: "OK",
                    allowOutsideClick: false,
                });
            },
            (err) => {
                this.isLoading = false;
                this.btnFacturar = true;
            }
        );
        this.startTimer();
    }

    ExportDataCorrect(item: any) {
        const data: any = {};
        this.isLoading = true;
        data.IdHeaderProcess = this.contractor.IdHeaderProcess;
        data.IdFileConfig = item.IdFileConfig;
        data.table_reference = item.table_reference;
        this.MassiveService.GetDataExportCorrect(data).subscribe(
            (res) => {
                this.fileTrama = res.GenericResponse;
                if (this.fileTrama) {
                    const file = new File(
                        [this.obtenerBlobFromBase64(this.fileTrama, "")],
                        "Proceso Correcto " +
                        item.FileName.toLowerCase() +
                        " - " +
                        this.contractor.IdHeaderProcess +
                        ".csv",
                        { type: "text/plain;charset=utf-8" }
                    );
                    fileSaver.saveAs(file);
                } else {
                    swal.fire({
                        title: "Información",
                        text: "No se encontraron registros a exportar ",
                        icon: "error",
                        confirmButtonText: "OK",
                        allowOutsideClick: false,
                    });
                }
                this.isLoading = false;
            },
            (err) => {
                this.isLoading = false;
            }
        );
    }

    GenerateFacturacion() {
        const data: any = {};
        this.isLoading = true;
        this.MassiveService.GenerateFacturacion(
            this.contractor.IdIdentity,
            this.contractor.IdHeaderProcess
        ).subscribe(
            (res) => {
                this.fileTrama = res.GenericResponse;
                if (this.fileTrama) {
                    const file = new File(
                        [this.obtenerBlobFromBase64(this.fileTrama, "")],
                        "Facturacion" + ".csv",
                        { type: "text/plain;charset=utf-8" }
                    );
                    fileSaver.saveAs(file);
                }
                this.isLoading = false;
            },
            (err) => {
                this.isLoading = false;
            }
        );
    }
}
