import { Component, OnInit, Input, ViewChild } from "@angular/core";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { ReporteSucaveService } from '../../../../services/report/reporte-sucave.service';
import { SucaveErrorComponent } from "../request-reporte-sucave-error/request-reporte-sucave-error.component";
import { BsDatepickerConfig } from 'ngx-bootstrap/datepicker';
import swal from "sweetalert2";
import * as fileSaver from "file-saver";
import { ExcelService } from "../../../../services/shared/excel.service";
import { AppConfig } from "../../../../../../../app/app.config";

@Component({
    selector: "app-request-reporte-sucave-view",
    templateUrl: "./request-reporte-sucave-view.component.html",
    styleUrls: ["./request-reporte-sucave-view.component.css"],
})
export class SucaveViewComponent implements OnInit {
    listToShow: any = [];
    fileUpload: File;
    fileTrama: any = [];
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
        private sucaveService: ReporteSucaveService,
        private excelService: ExcelService
    ) { }

    ngOnInit() {
        this.btnFacturacion = false;
        this.btnFacturar = true;
        this.GetProcessDetail();
        this.startTimer();
    }

    startTimer() {
        this.stopTimer();
        // this.interval = setInterval(() => {
        //     this.GetProcessDetail();
        // }, 2000);
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
        this.sucaveService.GetDetailProcess(data).subscribe(
            (res) => {
                this.processDetailList = res;
                if(this.processDetailList.length > 0){
                  this.processDetailList.forEach((e) => {
                    e.DIniDetail = e.DIniDetail.split(' ')[0];
                    e.DFinDetail = e.DFinDetail.split(' ')[0];
                    
                  });
                }

                this.totalItems = this.processDetailList.length;
                this.listToShow = this.processDetailList.slice(
                    (this.currentPage - 1) * this.itemsPerPage,
                    this.currentPage * this.itemsPerPage
                );
                if (this.processDetailList.length === 0) {
                    this.listToShow = [];
                    this.processDetailList = [];
                } else {                    
                    console.log(this.processDetailList);                  
                    
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
/* 
    ExportData(item: any) {
        const data: any = {};
        this.isLoading = true;
        data.IdHeaderProcess = this.contractor.IdHeaderProcess;
        data.IdFileConfig = item.IdFileConfig;
        data.table_reference = item.table_reference;
        this.sucaveService.GetDataExport(data).subscribe(
            (res) => {
                this.fileTrama = res.GenericResponse;
                if (this.fileTrama) {
                      const file = new File(
                        [this.obtenerBlobFromBase64(this.fileTrama, "")],
                        item.FileName.toLowerCase() + ".csv",
                        { type: "text/plain;charset=utf-8" }
                    );  
                    //fileSaver.saveAs(file);
                    
                } else {
                }
                this.isLoading = false;
            },
            (err) => {
                this.isLoading = false;
            }
        );
    } */
    ExportData(item): void {
        const data: any = {};
        this.isLoading = true;
        data.IdHeaderProcess = this.contractor.IdHeaderProcess;
        data.IdFileConfig = item.IdFileConfig;
        data.table_reference = item.table_reference;
        console.log(data);
        this.sucaveService.GetDataExport(data).subscribe(
            res => {
                this.fileTrama = res.Result.lista;
                if(data.IdFileConfig==1){
                    this.excelService.exportAsExcelFilesucave(this.fileTrama, 'CONTRATANTES');
                }else{
                    this.excelService.exportAsExcelFilesucave(this.fileTrama, 'EXPUESTOS');
                }
            
                this.isLoading = false;
            },
            err => { swal.fire('Información', 'Ha ocurrido un error al obtener el reporte con los Detalles de Interfaz Preliminar.', 'error'); 
            this.isLoading = false;    
            }
        )
        this.ExportDataTxt(item);
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
        const modalRef = this.modalService.open(SucaveErrorComponent, {
            size: "xl",
            backdropClass: "light-blue-backdrop",
            backdrop: "static",
            keyboard: false,
        });
        modalRef.componentInstance.reference = modalRef;
        modalRef.componentInstance.contractor = item;
    }

    GenerateFact() {
        let niddetailproc: number = 0;
        this.processDetailList.forEach((element) => {
            if (element.IdFileConfig == 21) {
                niddetailproc = element.IdDetailProcess;
            }
        });
        this.sucaveService.GenerateFact(
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
        this.sucaveService.UploadFileProcess(myFormData).subscribe(
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
       
        this.sucaveService.GetDataExportCorrect(data).subscribe(
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
                        icon: "warning",
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
    /* ExportDataCorrect(item): void {
        const data: any = {};
        this.isLoading = true;
        data.IdHeaderProcess = this.contractor.IdHeaderProcess;
        data.IdFileConfig = item.IdFileConfig;
        data.table_reference = item.table_reference;
        this.sucaveService.GetDataExportCorrect(data).subscribe(
            res => {
                this.fileTrama = res.Result.lista;
                this.excelService.exportAsExcelFile(this.fileTrama, 'EXPUESTOS');
                this.isLoading = false;
            },
            err => { swal.fire('Información', 'Ha ocurrido un error al obtener el reporte con los Detalles de Interfaz Preliminar.', 'error'); 
            this.isLoading = false;    
            }
        )
    } */
    GenerateFacturacion() {
        const data: any = {};
        this.isLoading = true;
        this.sucaveService.GenerateFacturacion(
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

    ExportDataTxt(item: any) {
        let nombre = "";
        let anhio = "";
        let mes = "";
        let dia = "";
        let fecha = "";
        const data: any = {};
        this.isLoading = true;
        data.IdHeaderProcess = this.contractor.IdHeaderProcess;
        data.IdFileConfig = item.IdFileConfig;
        data.table_reference = item.table_reference;
        if (data.IdFileConfig == 1){
            nombre = AppConfig.CONTRATANTE;
        }else{
            nombre = AppConfig.EXPUESTOS;
        }
        console.log("fechafin: " + item.DFinDetail);
        fecha = item.DFinDetail;
        anhio = fecha.substring(8,10);
        mes = fecha.substring(3,5);
        dia = fecha.substring(0,2);
       
        nombre = nombre + anhio + mes + dia + "." + AppConfig.REPORTESUCAVE;
        
        console.log(data);
        this.sucaveService.GetDataExportTxt(data).subscribe(
            (res) => {
                this.fileTrama = res.GenericResponse; 
                              
                if (this.fileTrama) {
                    const file = new File(
                        [this.obtenerBlobFromBase64(this.fileTrama, "")],
                        nombre,
                        { type: "text/plain;charset=utf-8" }
                    );
                    
                    fileSaver.saveAs(file);
                } else {
                    swal.fire({
                        title: "Información",
                        text: "No se encontraron registros a exportar ",
                        icon: "warning",
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

}
