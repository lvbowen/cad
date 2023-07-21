import axios from 'axios';
import api from './api.URL';

// 删除选中的列表内容数据格式
interface overAllDelete {
    schedulePlanId: string;
    projectCode?:string;
}

// 方案切换数据格式
interface overAllSwitc {
    schedulePlanId: string;
    projectCode?:string;
}

// 新增列表数据格式
interface overAllAddlist {
    dataList: object;
    projectCode?:string;
}

// table修改的数据格式
interface overAllSave {
    dataList: object;
    projectCode?:string;
}





export class OverAllPlanApi {
    // 页面加载时发送请求获取table数据API
    scheduleList(params: { projectCode: string,pageNum:number,pageSize:number }){
        return axios.get(api.overAll.scheduleList, {params})
    }
    // 选择合同时的弹窗,获取合同列表API
    showModal(params: { projectCode: string,pageNum:number,pageSize:number }){
        return axios.get(api.overAll.showModal,{params})
    }
    // 删除选中的列表内容API
    deleteList(params:overAllDelete){
        return axios.post(api.overAll.deleteHandle,params)
    }

    // 方案切换API
    switchover(params:overAllSwitc){
        return axios.post(api.overAll.switchover,params)
    }
    // 新增列表API
    addlist(params:overAllAddlist){
        return axios.post(api.overAll.addlist,params)
    }
    // table修改的API
    save(params:overAllSave){
        return axios.post(api.overAll.save,params)
    }


}
