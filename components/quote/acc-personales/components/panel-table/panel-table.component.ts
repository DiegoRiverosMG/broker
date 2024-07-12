import { Component, Input, Output, EventEmitter, OnInit, OnChanges, ViewEncapsulation } from '@angular/core';

import swal from 'sweetalert2';

import { ModuleConfig } from '../../../../module.config';

import { UtilService } from '../../core/services/util.service';

@Component({
    selector: 'panel-table',
    templateUrl: './panel-table.component.html',
    styleUrls: ['./panel-table.component.css'],
    encapsulation: ViewEncapsulation.None
})
export class PanelTableComponent implements OnInit, OnChanges {

    @Input() detail: boolean;
    @Input() header: string[] = [];
    @Input() numeration: boolean;
    @Input() slim: boolean;
    @Input() classTable: string;
    @Input() labelAccions: string;
    @Input() defaultItems: any;
    @Input() fieldDetailTitle: any;

    @Input() showDetail: boolean;
    @Input() showDelete: boolean;

    @Input() headerTemplateBefore: any;
    @Input() headerTemplateAfter: any;
    @Input() headerTemplate: any;
    @Input() bodyTemplate: any;

    @Input() reload: boolean;
    @Output() reloadChange: EventEmitter<any> = new EventEmitter();

    @Input() loader: boolean;
    @Output() loaderChange: EventEmitter<any> = new EventEmitter();

    @Input() items: any[] = [];
    @Output() itemsChange: EventEmitter<any> = new EventEmitter();

    @Input() itemSelected: any[] = [];
    @Output() itemSelectedChange: EventEmitter<any> = new EventEmitter();

    @Input() itemsSelected: any[] = [];
    @Output() itemsSelectedChange: EventEmitter<any> = new EventEmitter();

    @Input() service: any;
    @Input() method: string;
    @Input() params: any;
    @Input() fieldItems: string;

    @Input() reloadByPagination: boolean;
    @Input() pagination: any;
    @Output() paginationChange: EventEmitter<any> = new EventEmitter();

    @Output() beforeGetList: EventEmitter<any> = new EventEmitter();
    @Output() afterGetList: EventEmitter<any> = new EventEmitter();

    @Output() clickEdit: EventEmitter<any> = new EventEmitter();
    @Output() clickDelete: EventEmitter<any> = new EventEmitter();
    @Output() clickDetail: EventEmitter<any> = new EventEmitter();
    @Output() clickExpand: EventEmitter<any> = new EventEmitter();
    @Output() clickFile: EventEmitter<any> = new EventEmitter();

    @Input() tituloBtnEdit: any;
    @Input() tituloBtnDelete: any;
    @Input() tituloBtnDetail: any;
    @Input() tituloBtnExpand: any;
    @Input() tituloBtnFile: any;

    classRow: string;
    classCell: string;

    itemsPerPage: any = [];

    ngOnInit() {
        this.classRow = this.slim ? 'grid-title' : '';
        this.classCell = this.slim ? 'grid-title-item' : '';

        this.initPagination();


    }

    ngOnChanges(changes) {
        if (changes.reload && changes.reload.currentValue) {
            setTimeout(() => { this.reloadChange.emit(false); });
            this.initPagination();

            if (this.service) {
                this.getService(this.pagination);
            } else {
                this.calcItemsPerPage();
            }
        }

    }

    initPagination() {
        if (this.pagination) {
            this.pagination = {
                currentPage: 1,
                itemsPerPage: 5,
                maxSize: 5,
            };

            this.paginationChange.emit(this.pagination);
        }

    }

    getService(pagination?) {
        this.loaderChange.emit(true);

        this.pagination = Object.assign(this.pagination, pagination || {});

        const params = Object.assign(this.params || {}, {
            PageNumber: this.pagination.currentPage,
            LimitPerPage: this.pagination.itemsPerPage,
        });

        this.beforeGetList.emit();

        (this.params ?
            this.service[this.method](this.params) :
            this.service[this.method]()
        ).toPromise().then(
            (res: any = {}) => {

                this.items = this.fieldItems ? (res[this.fieldItems] || []) : (res || []);

                if (this.defaultItems) {
                    this.items = this.defaultItems;
                }

                this.itemsChange.emit(this.items);

                this.afterGetList.emit(this.items);

                if (!this.reloadByPagination) {
                    this.calcItemsPerPage();
                } else {
                    this.itemsPerPage = this.items;
                }

                if (!this.items.length) {
                    swal.fire('Información', ModuleConfig.NotFoundMessage, 'warning');
                }

                this.loaderChange.emit(false);
            },
            error => {
                this.loaderChange.emit(false);
                swal.fire('Información', ModuleConfig.GenericErrorMessage, 'error');
            }
        );
    }

    calcItemsPerPage() {
        this.itemsPerPage = (this.items || []).slice(((this.pagination.currentPage - 1) * this.pagination.itemsPerPage), (this.pagination.currentPage * this.pagination.itemsPerPage));
    }

    /**
     * Realiza la búsqueda accionada por el cambio de página en el paginador
     * @param page número de página seleccionado en el paginador
     */
    pageChanged(page: number) {
        this.pagination.currentPage = page;

        if (this.reloadByPagination) {
            if (this.service) {
                this.getService();
            }
        } else {
            this.calcItemsPerPage();
        }
        this.paginationChange.emit(this.pagination);
    }

    verifyAccions() {
        return !!this.clickEdit.observers.length ||
            !!this.clickDelete.observers.length ||
            !!this.clickExpand.observers.length ||
            !!this.clickDetail.observers.length ||
            !!this.clickFile.observers.length;
    }

    getAccitionWith() {
        const buttons: any = [];

        if (!!this.clickEdit.observers.length) {
            buttons.push(1);
        }

        if (!!this.clickDelete.observers.length) {
            buttons.push(1);
        }

        if (!!this.clickExpand.observers.length) {
            buttons.push(1);
        }

        if (!!this.clickDetail.observers.length) {
            buttons.push(1);
        }

        if (!!this.clickFile.observers.length) {
            buttons.push(1);
        }

        return 50 + 15 * (buttons.length - 1);
    }

    selectAll(selected) {
        this.items.forEach(item => item.selected = selected);
        this.itemsSelected = selected ? UtilService.copy(this.items) : [];
    }

    selecItem() {
        this.itemsSelected = UtilService.copy(this.items.filter(item => item.selected));
    }
}
