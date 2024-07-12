import { BsDatepickerConfig } from 'ngx-bootstrap/datepicker';
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { ChannelSalesService } from '../../../../shared/services/channelsales/channelsales.service';
import { ChannelSales } from '../../../../shared/models/channelsales/channelsales';
import { sortArray } from '../../../../shared/helpers/utils';
@Component({
    selector: 'app-plataforma-panel',
    templateUrl: './plataforma-panel.component.html',
    styleUrls: ['./plataforma-panel.component.css']
})
export class PlataformaPanelComponent implements OnInit {
    nombre = '';
    listSalesDashboard: any[] = [];
    bsRangeValue: Date[] = [];
    bsConfig: Partial<BsDatepickerConfig>;
    colorTheme = 'theme-orange';
    desde: string;
    hasta: string;
    channelSales: ChannelSales;
    ListChannelSales: any[];
    channelSalesId = '0';
    ListChannelPoint: any[];
    constructor(
        public cd: ChangeDetectorRef,
        private spinner: NgxSpinnerService,

        private channelSalesService: ChannelSalesService,
    ) {
        this.bsConfig = Object.assign({}, {
            dateInputFormat: 'DD/MM/YYYY',
            locale: 'es',
            rangeInputFormat: 'DD/MM/YYYY',
            containerClass: this.colorTheme
        });
    }

    ngOnInit() {
        this.spinner.show();
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        this.nombre = currentUser && currentUser.firstName;
        this.channelSalesId = "2015000002"; //currentUser.canal;
        this.LoadChannelSales();
        this.onSelectChannelSales(this.channelSalesId);
        this.disableSpinner();

        var date = new Date();
        var firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
        var lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);

        this.bsRangeValue[0] = firstDay;
        this.bsRangeValue[1] = lastDay;
        this.getSalesDashboard();
    }

    async getSalesDashboard() {
        this.spinner.show();

        if (this.bsRangeValue.length > 0 && this.channelSalesId !== '0') {

            this.desde = this.bsRangeValue[0].toISOString();
            this.hasta = this.bsRangeValue[1].toISOString();

            await this.channelSalesService.getSalesDashboard(+this.channelSalesId, this.desde, this.hasta).toPromise().then(
                async res => {
                    if (res !== null) {
                        const lsta = <any[]>res;
                        this.listSalesDashboard = lsta;
                        this.disableSpinner();
                    } else {
                        this.disableSpinner();
                    }
                }, () => {
                    this.disableSpinner();
                });
        } else {
            this.disableSpinner();
        }
    }

    disableSpinner() {
        setTimeout(() => {
            this.spinner.hide();
        }, 500);
    }

    LoadChannelSales(): void {
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        const nusercode = currentUser && currentUser.id;
        this.channelSales = new ChannelSales(nusercode, '0', '');
        this.channelSalesService.getPostChannelSales(this.channelSales).subscribe(
            data => {
                this.ListChannelSales = sortArray(<any[]>data, 'sdescript', 0);
            },
            error => {
                console.log(error);
            }
        );
    }

    onSelectChannelSales(channelSalesId) {
        this.channelSalesId = channelSalesId;
    }

}
