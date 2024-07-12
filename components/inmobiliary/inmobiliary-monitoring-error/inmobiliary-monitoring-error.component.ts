import { Component, OnInit, Input, ViewChild } from "@angular/core";
import { InmobiliaryLoadMassiveService } from "../../../services/inmobiliaryLoadMassive/inmobiliary-load-massive.service";
import { BsDatepickerConfig } from 'ngx-bootstrap/datepicker';
import { NgbModalRef } from "@ng-bootstrap/ng-bootstrap";

@Component({
    selector: "app-inmobiliary-monitoring-error",
    templateUrl: "./inmobiliary-monitoring-error.component.html",
    styleUrls: ["./inmobiliary-monitoring-error.component.css"],
})
export class InmobiliaryMonitoringErrorComponent implements OnInit {
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
    constructor(private MassiveService: InmobiliaryLoadMassiveService) { }

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
        this.MassiveService.GetProcessLogError(data, opcion).subscribe(
            (res) => {
                this.processlogList = res;
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
