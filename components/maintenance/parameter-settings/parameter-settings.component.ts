import { Component, OnInit } from '@angular/core';
import { NgbModal, ModalDismissReasons, NgbModalRef, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { MaximumInsurableRemunerationDialogComponent } from '../maximum-insurable-remuneration-dialog/maximum-insurable-remuneration-dialog.component';
import { CombinationActivitiesDialogComponent } from '../combination-activities-dialog/combination-activities-dialog.component';
import { RetroactivityDialogComponent } from '../retroactivity-dialog/retroactivity-dialog.component';
import { ClientInformationService } from '../../../services/shared/client-information.service';
import { ParameterSettingsService } from '../../../services/maintenance/parameter-settings.service';

//util
import { ToastrService } from 'ngx-toastr';
import Swal from 'sweetalert2';
@Component({
    selector: 'app-parameter-settings',
    templateUrl: './parameter-settings.component.html',
    styleUrls: ['./parameter-settings.component.css']
})
export class ParameterSettingsComponent implements OnInit {
    filters: any = {
        NBRANCH: 0,
        NPRODUCT: 0,
        NTYPE_TRANSAC: 0,
        NPARAM: 0,
        NPERFIL: 0,
        SDESCRIPT_TRANSAC: "",
        USER_ACCESS: 0,
        P_SISCLIENT_GBD : "0"
    }
    branchList: any[] = []
    productList: any[] = []
    transactionList: any[] = []
    parameterList: any[] = []
    profileList: any[] = []
    parameterListToShow: any[] = []

    codProducto = JSON.parse(localStorage.getItem('codProducto'))['productId']
    //epsItem = JSON.parse(sessionStorage.getItem('eps'));
    epsItem = JSON.parse(localStorage.getItem('eps'));

    /**
   * Variables de paginación
   */
    currentPage = 1; //página actual
    rotate = true; //
    maxSize = 5; // cantidad de paginas que se mostrarán en el paginado
    itemsPerPage = 5; // limite de items por página
    totalItems = 0; //total de items encontrados
    public foundResults: any = [];  //Lista de registros encontrados durante la búsqueda
    filter: any = {}; //Objeto con datos de búsqueda que se llena en la primera búsqueda y que quedará en memoria para los cambios de página, el atributo PageNumber (Nro de página) está enlazado con el elemento de paginado del HTML y se actualiza automaticamente

    userId: number;
    profileId: number;
    showCta = false;

    constructor(
        private modalService: NgbModal,
        private clientInformationService: ClientInformationService,
        private parameterSettingsService: ParameterSettingsService
    ) {

    }

    async ngOnInit() {
        this.userId = JSON.parse(localStorage.getItem('currentUser'))['id'];
        this.profileId = await this.getProfileProduct();
        this.getBranchList();
        this.getProfiles(this.profileId);
    }

    async getProfileProduct() {
        let profile = 0;

        let _data: any = {};
        _data.nUsercode = this.userId;
        _data.nProduct = this.codProducto;
        await this.parameterSettingsService.getProfileProduct(_data).toPromise()
            .then(
                (res) => {
                    profile = res;
                },
                err => {
                    console.log(err)
                }
            );

        return profile;
    }

    openParam(param: any) {
        let modalRef: NgbModalRef;
        var componente;
        let data: any = {};
        data.SDESCRIPT_TRANSAC = param.SDESCRIPT_TRANSAC;
        data.SDESCRIPT_PERFIL = param.SDESCRIPT_PERFIL;
        data.NTYPE_TRANSAC = param.NTYPE_TRANSAC;
        data.NPERFIL = param.NPERFIL;
        data.NBRANCH = this.filters.NBRANCH;
        data.NPRODUCT = this.filters.NPRODUCT;
        data.USER_ACCESS = this.filters.USER_ACCESS;
        data.P_SISCLIENT_GBD = param.P_SISCLIENT_GBD;
        switch (param.NPARAM) {
            case 1:
                componente = MaximumInsurableRemunerationDialogComponent
                break
            case 2:
                componente = CombinationActivitiesDialogComponent
                break
            case 3:
                componente = RetroactivityDialogComponent;
                break;
        }
        modalRef = this.modalService.open(componente, {
            size: (param.NPARAM == 3 ? 'lg' : 'xl'), windowClass: 'modalParam', backdropClass: 'light-blue-backdrop', backdrop: 'static',
            keyboard: false
        });

        modalRef.componentInstance.reference = modalRef;
        modalRef.componentInstance.data = data;
    }

    pageChanged(page: number) {
        this.currentPage = page;
        this.parameterListToShow = this.foundResults.slice(((this.currentPage - 1) * this.itemsPerPage), (this.currentPage * this.itemsPerPage));
    }

    async getBranchList() {
        this.clientInformationService.getBranches(this.codProducto, this.epsItem.NCODE).subscribe(res => {
            this.branchList = res
            this.filters.NBRANCH = this.branchList[0].NBRANCH
            this.getProductListByBranch();
        }, err => { console.log(err) })
    }

    async getProductListByBranch() {
        this.clientInformationService.getProductList(this.codProducto, this.epsItem.NCODE, this.filters.NBRANCH).subscribe(
            async res => {
                this.productList = res;
                this.filters.NPRODUCT = this.productList[0].COD_PRODUCT;
                await this.getTransactionsByProduct();
                await this.getUserAccess();
            },
            err => { console.log(err) }
        )
    }

    async getTransactionsByProduct() {
        let data: any = { nBranch: this.filters.NBRANCH, nProduct: this.filters.NPRODUCT }
        this.parameterSettingsService.getTransactionsByProduct(data).subscribe(
            res => {
                this.transactionList = res
            },
            err => { console.log(err) }
        )
    }

    async getComboParametersByTransaction() {
        let data: any = { nBranch: this.filters.NBRANCH, nProduct: this.filters.NPRODUCT, nTypeTransac: this.filters.NTYPE_TRANSAC, nPerfil: this.filters.NPERFIL }
        this.parameterSettingsService.getComboParametersByTransaction(data).subscribe(
            res => {
                this.parameterList = res
            },
            err => { console.log(err) }
        )
    }

    changeParameter(){
        if(this.filters.NPARAM == 3){
            this.showCta = true
        }else{
            this.showCta = false;
        }
    }

    async search() {
        if(this.filters.NPARAM != 3) this.filters.P_SISCLIENT_GBD = "0";
        let data: any = { nBranch: this.filters.NBRANCH, nProduct: this.filters.NPRODUCT, nTypeTransac: this.filters.NTYPE_TRANSAC, nPerfil: this.filters.NPERFIL, nParam: this.filters.NPARAM, nGob: this.filters.P_SISCLIENT_GBD }
        this.parameterSettingsService.getParametersByTransaction(data).subscribe(
            res => {
                this.foundResults = res
                if (this.foundResults != null && this.foundResults.length > 0) {
                    this.totalItems = this.foundResults.length;
                    this.parameterListToShow = this.foundResults.slice(((this.currentPage - 1) * this.itemsPerPage), (this.currentPage * this.itemsPerPage));
                }
                else {
                    this.totalItems = 0;
                    Swal.fire('Información', "No se encontraron resultados", 'warning');
                }
            },
            err => { console.log(err) }
        )
    }
    mostrarMas() {
        this.currentPage = 1;
        this.parameterListToShow = this.foundResults.slice(((this.currentPage - 1) * this.itemsPerPage), (this.currentPage * this.itemsPerPage));
    }
    async getProfiles(profileId) {
        let _data: any = {};
        _data.nPerfil = profileId
        this.parameterSettingsService.getProfiles(_data).subscribe(
            res => {
                this.profileList = res
                if (this.profileList.length > 0 && this.profileId != 8) {
                    let defaultPro = this.profileList[0].NPERFIL;
                    this.filters.NPERFIL = defaultPro;
                }
            },
            err => {
                console.log(err)
            }
        )
    }

    async getUserAccess() {
        let data: any = {
            nBranch: this.filters.NBRANCH,
            nProduct: this.filters.NPRODUCT,
            nUsercode: this.userId
        }
        let userAccess = 0;
        await this.parameterSettingsService.GetUserAccess(data).toPromise().then(
            res => {
                this.filters.USER_ACCESS = res.code;
            },
            err => { console.log(err) }
        )
    }

}
