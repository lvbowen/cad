import { Component } from "vue";

import ReportOptions from '@h3/report/dist/options';
import { FieldColumn } from '@h3/report';

import { schema } from '@cloudpivot/form';

import ReportStaffSelect from './report-staff-select.vue';
import ReportSelectSimple from "./report-select-simple.vue";

// 初始化表单组件配置
import "@/config/h3-form";


let inited = false;

import env from '@/config/env';

export function init() {

    if (inited) {
        return;
    }

    inited = true;

    ReportOptions.baseUrl = env.portalHost;
    console.log(ReportOptions.baseUrl);
    ReportOptions.charts = { list: { dimension: 50 } };

    ReportOptions.download.list = true;
    ReportOptions.download.pivotTable = true;

    ReportOptions.requestHeader = () => {
        const token = localStorage.getItem('token');
        if(!token){
            return null;
        }

        return {
            Authorization : 'Bearer ' + token
        }
    }

    ReportOptions.integrateComponents = (field: FieldColumn, formula: string): Component | null => {
        let components: any = null;
        switch (field.dataType) {
            case schema.DataItemType.StaffSelector:
                components = ReportStaffSelect;
                break;
        }
        switch (field.field) {
          case 'sequenceStatus':
            components = ReportSelectSimple;
            break;
        }
        return components;
    };


}

init();
