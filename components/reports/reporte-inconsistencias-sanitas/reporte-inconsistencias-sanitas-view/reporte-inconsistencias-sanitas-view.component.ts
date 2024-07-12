import { Component, OnInit, Input, ViewChild } from "@angular/core";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { BsDatepickerConfig } from 'ngx-bootstrap/datepicker';
import { ExcelService } from '../../../../../../shared/services/excel/excel.service';
import swal from "sweetalert2";
import * as fileSaver from "file-saver";

@Component({
    selector: "app-reporte-inconsistencias-sanitas-view",
    templateUrl: "./reporte-inconsistencias-sanitas-view.component.html",
    styleUrls: ["./reporte-inconsistencias-sanitas-view.component.css"],
})

export class ReporteInconsistenciasSanitasViewComponent implements OnInit {
    listToShow: any = [];
    fileUpload: File;
    // fileTrama: string;
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
    flag: boolean = false;
    tipoId: number = 0;     
    tipoInconsistencia: any = null;

    @Input() public reference: any;
    @Input() public contractor: any;  
    @Input() public listAse: any; 
    @Input() public listDif: any; 
    @Input() public listDup: any; 

    constructor(
        private modalService: NgbModal,
        private excelService: ExcelService
    ) { }

    ngOnInit() {
        this.tipoId = this.contractor.ID;
        this.tipoInconsistencia = this.contractor.TIPO_INCONSISTENCIA.replace(/\s+/g, '');
        this.getProcessDetail();
        //this.startTimer();
    }    

    startTimer() {
        this.stopTimer();
        this.interval = setInterval(() => {
            this.getProcessDetail();
        }, 2000);
    }

    stopTimer() {
        clearInterval(this.interval);
    }

    getProcessDetail() {
        this.currentPage = 1;
        this.rotate = true;
        this.maxSize = 10;
        this.itemsPerPage = 10;
        this.totalItems = 0;
        
        if (this.tipoId == 1 || this.tipoId == 3){
            this.processDetailList = this.listAse;
        }

        if (this.tipoId == 2){
            this.processDetailList = this.listDif;
        }

        if (this.tipoId == 3){
            this.processDetailList = this.listDup;
        }

        this.totalItems = this.processDetailList.length;
        this.listToShow = this.processDetailList.slice(
            (this.currentPage - 1) * this.itemsPerPage,
            this.currentPage * this.itemsPerPage
        );
        if (this.processDetailList.length === 0) {
            this.listToShow = [];
            this.processDetailList = [];
        }
    }

    pageChanged(currentPage) {
        this.currentPage = currentPage;
        this.listToShow = this.processDetailList.slice(
            (this.currentPage - 1) * this.itemsPerPage,
            this.currentPage * this.itemsPerPage
        );
    }

    exportData() {
        this.isLoading = true;

        this.fileTrama = this.processDetailList;
        
        if (this.fileTrama.length > 0) {
            this.excelService.exportAsExcelFileTrama(this.fileTrama, this.tipoInconsistencia);

            /*const file = new File(
                        [this.obtenerBlobFromBase64(this.fileTrama, "")],
                        this.tipoInconsistencia.FileName.toLowerCase() + ".csv",
                        { type: "text/plain;charset=utf-8" }
                    );
                    fileSaver.saveAs(file);*/
        } else {
        }
        
        this.isLoading = false;
    }
    /*
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
    */
}
