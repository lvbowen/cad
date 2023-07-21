import axios from 'axios';
import api from './api.URL';

// 获取下方树形结构数据的数据格式
interface CompileMinuteTableGet {
    schedulePlanId:string,
    projectCode:string
}
// 树形结构数据修改和添加的数据格式
interface CompileMinuteTableAmend {
    projectCode: string,
    list: string,
    listRemove: Array<any>
}
// 计算累加的数据格式
interface CompileMinuteCountAll{
    projectCode: string,
    schedulePlanId: string
}

// 下载Excel的数据格式
interface CompileMinuteHandle{
    fileCode: string;
    projectCode?:string;
}

// 上方form表单提交审核的数据格式
interface CompileMinuteSubmit{
    projectCode: string,
    schedulePlanId: string
}

// 下方树形删除数据的数据格式
interface CompileMinuteDelete{
    projectCode: string,
    list: Array<any>,
    listRemove: Array<string>
}

// 上方form表单计划方案表单保存的数据格式
interface CompileMinuteFormSave{
    DataList:object;
    projectCode?:string;
}

// 获取上方form表单的数据格式
interface CompileMinuteDemand{
    projectCode: string,
    schedulePlanId: string
}



export class CompileMinute {
    // 获取下方树形结构数据的API
    tableGet(params:CompileMinuteTableGet){
        return axios.get(api.compileMinute.tableGet,{params})
    }
    // 下载Excel的API
    handleMenuClick(params:CompileMinuteHandle){
        return axios.get(api.compileMinute.handleMenuClick,{params})
    }
    // 获取上方form表单的数据的API
    demandApi(params:CompileMinuteDemand){
        return axios.get(api.compileMinute.demand,{params})
    }

    // ------------------------

    // 树形结构数据修改和添加的API
    tableAmend(params:CompileMinuteTableAmend){
        return axios.post(api.compileMinute.tableAmend,params)
    }
    // 计算累加的API
    countAll(params:CompileMinuteCountAll){
        return axios.post(api.compileMinute.countAll,params)
    }
    // 上方form表单计划方案表单保存的API
    formSave(params:CompileMinuteFormSave){
        return axios.post(api.compileMinute.formSave,params)
    }
    // 上方form表单提交审核的API
    submitAudit(params:CompileMinuteSubmit){
        return axios.post(api.compileMinute.submitAudit,params)
    }
    // 下方树形删除数据的API
    deleteHandle(params:CompileMinuteDelete){
        return axios.post(api.compileMinute.deleteHandle,params)
    }
}
