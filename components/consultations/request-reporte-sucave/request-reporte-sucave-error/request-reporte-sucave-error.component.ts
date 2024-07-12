import { Component, OnInit, Input, ViewChild } from "@angular/core";
import { ReporteSucaveService } from '../../../../services/report/reporte-sucave.service';
import { BsDatepickerConfig } from 'ngx-bootstrap/datepicker';
import { NgbModalRef } from "@ng-bootstrap/ng-bootstrap";

@Component({
    selector: "app-request-reporte-sucave-error",
    templateUrl: "./request-reporte-sucave-error.component.html",
    styleUrls: ["./request-reporte-sucave-error.component.css"],
})
export class SucaveErrorComponent implements OnInit {
    listToShow: any = [];
    processlogList: any = [];
    currentPage = 1;
    rotate = true;
    maxSize = 10;
    itemsPerPage = 5;
    totalItems = 0;
    isLoading: boolean = false;
    bsConfig: Partial<BsDatepickerConfig>;
    sProcess: string;
    opcDetalle: string;
    @Input() public reference: any;
    @Input() public contractor: any;
    @Input() public formModalReference: NgbModalRef;
    constructor(private sucaveService: ReporteSucaveService) { }

    ngOnInit() {
        this.sProcess = this.contractor.FileName;
        switch (this.contractor.Opcion) {
            case "E":
                this.opcDetalle = "Error";
                break;
            case "W":
                this.opcDetalle = "Warning";
                break;
        }
        this.GetProcessDetail();
    }

    GetProcessDetail() {
        this.listToShow = [];
        this.processlogList = [];
        this.isLoading = true;
        this.currentPage = 1;
        this.rotate = true;
        this.maxSize = 10;
        this.itemsPerPage = 5;
        this.totalItems = 0;

        const data: any = this.contractor.IdDetailProcess;
        const opcion: any = this.contractor.Opcion;
        this.sucaveService.GetProcessLogError(data, opcion).subscribe(
            (res) => {
                this.processlogList = res;
                if(this.processlogList.length > 0){
                  this.processlogList.forEach((e) => {
                    e.DateRegister = e.DateRegister.split(' ')[0];
                  });
                }
                this.totalItems = this.processlogList.length;
                this.listToShow = this.processlogList.slice(
                    (this.currentPage - 1) * this.itemsPerPage,
                    this.currentPage * this.itemsPerPage
                );
                this.isLoading = false;
            },
            (err) => {
                this.isLoading = false;
            }
        );
    }
    pageChanged(currentPage) {
        this.currentPage = currentPage;
        this.listToShow = this.processlogList.slice(
            (this.currentPage - 1) * this.itemsPerPage,
            this.currentPage * this.itemsPerPage
        );
    }
}
