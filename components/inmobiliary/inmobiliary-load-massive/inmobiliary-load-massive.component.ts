/************************************************************************************************/
/*  NOMBRE              :   INMOBILIARY-LOAD-MASSIVE.COMPONENT.TS                                            /
/*  DESCRIPCIÓN         :   CARGA MASIVAS INMOBILIARIA                                           /
/*  AUTOR               :   MATERIA GRIS - MARCOS MATEO QUIROZ                                   /
/*  FECHA               :   11-12-2023                                                           /
/*  VERSIÓN             :   1.0 PRY - INMOBILIARIAS                                              /
/************************************************************************************************/

import { Component, OnInit, Input, ViewChild, ElementRef } from '@angular/core';
import { InmobiliaryLoadMassiveService } from '../../../services/inmobiliaryLoadMassive/inmobiliary-load-massive.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { InmobiliaryMonitoringViewComponent } from '../inmobiliary-monitoring-view/inmobiliary-monitoring-view.component';
import swal from 'sweetalert2';

@Component({
    selector: 'app-inmobiliary-load-massive',
    templateUrl: './inmobiliary-load-massive.component.html',
    styleUrls: ['./inmobiliary-load-massive.component.css'],
})
export class InmobiliaryLoadMassiveComponent implements OnInit {

    clickValidarArchivos = false;
    files: File[] = [];
    listToEntity: any = [];
    idEntity: any = '';
    IdFileConfig: any = '';
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
    //
    
    

    // @ViewChild('fileInput') resetFilePick: ElementRef;
    @Input() public reference: any;
    @ViewChild('myInput') inputFile: ElementRef;
    constructor(
        private modalService: NgbModal,
        private MassiveService: InmobiliaryLoadMassiveService
    ) { }

    ngOnInit() {
        this.GetEntityConfig();
        this.getDetailConfig();
    }
    GetEntityConfig() {
        this.MassiveService.GetConfigurationEntity().subscribe(
            (res) => {
                this.listToEntity = res;
            },
            (err) => { }
        );
    }
    //getDetailConfig(idPath: any) {
    //    this.MassiveService.GetConfigurationFiles(idPath).subscribe(
    //        (res) => {
    //            this.listToFileConfig = res;
    //        },
    //        (err) => { }
    //    );
    //}
    getDetailConfig() {
        this.MassiveService.GetConfigurationFiles(2).subscribe(
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
                //this.getDetailConfig(this.idPath);
                this.getDetailConfig();
            },
            (err) => { }
        );
    }

    UploadFile(archivo: File[]) {
        let FlgVal: any = 0;
        
        this.files = [];
        this.fileUpload = null;        
        if (this.listToFileConfig.length > 0) {
            for (const File of archivo) {
                this.fileUpload = File;
                let IndError: any = 0;
                if (
                    this.listToFileConfig.filter(
                        (x) =>
                            x.FileName.toUpperCase() ===
                            this.fileUpload.name.split('.')[0].toUpperCase()
                    ).length <= 0
                ) 
                if (this.fileUpload.name.split('.').pop() !== 'xlsx') {
                    this.PrintMessage(
                        'El archivo ' +
                        this.fileUpload.name +
                        ' no tiene la extensión correcta,Solo se permiten archivos xlsx',
                        'error'
                    );
                    IndError = 1;
                }
           
                if (IndError !== 1) {       
                    this.fileUpload.type == 'Excel';
                    this.files.push(this.fileUpload);
                    if (this.files.filter((x) => x.size > 0)) {                        
                        for(const TipoCarga of this.listToFileConfig){
                            if(TipoCarga.IdFileConfig == this.IdFileConfig){
                                this.listFileConfigProcess.push(TipoCarga);                                    
                            }
                        }
                            
                    }
                }
            }
        } else {
            this.PrintMessage('Debe seleccionar un producto', 'error');
        }
        this.inputFile.nativeElement.value = '';
    }

    PrintMessage(message: string, type: string) {
        swal.fire({
            title: type,
            text: message,
            icon: 'error',
            confirmButtonText: 'OK',
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
                myFormData.append('dataFile', file, file.name);
            });
            myFormData.append(
                'UserCode',
                JSON.parse(localStorage.getItem('currentUser'))['id']
            );        
            myFormData.append(
                'ListFileProcess',
                JSON.stringify(this.listFileConfigProcess)
            );
            myFormData.append('IdEntity', this.idEntity);
            myFormData.append('IdProduct', this.listToPath[0].IdProduct);
            myFormData.append('IdPath', this.idPath);

            this.MassiveService.ProcessFiles(myFormData).subscribe(                
                (res) => {
                    this.isLoading = false;
                    
                    if (res != null && res > 0){
                        swal
                            .fire({
                                title: 'Información',
                                text: 'Se inicio el proceso ' + res,
                                icon: 'success',
                                confirmButtonText: 'OK',
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
                                        InmobiliaryMonitoringViewComponent,
                                        {
                                            size: 'xl',
                                            backdropClass: 'light-blue-backdrop',
                                            backdrop: 'static',
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
                    }
                    else{
                        this.isLoading = false;                          
                        swal.fire({
                                    title: 'Error',                                    
                                    text: res.MESSAGE,
                                    icon: 'error',
                                    confirmButtonText: 'OK',
                                    allowOutsideClick: false,
                        });
                    }

                },
                (err) => {  
                    this.isLoading = false;  
                    swal.fire('Error','Ocurrió un problema con el archivo seleccionado. Intente nuevamente o seleccione otro archivo.','error')                  
                }
            );
        } else {
            this.isLoading = false;
            this.PrintMessage('no se encontro ningun archivo a procesar', 'Error');
        }
    }

    deteleFile(item: any, index: any) {
        this.files.splice(index, 1);

        let fsse: any = this.listFileConfigProcess.filter(
            (x) => x.FileName.toUpperCase() + '.XLSX' === item.name.toUpperCase()
        );

        let te = this.listFileConfigProcess.indexOf(fsse[0]);

        this.listFileConfigProcess.splice(te, 1);
    }
}
