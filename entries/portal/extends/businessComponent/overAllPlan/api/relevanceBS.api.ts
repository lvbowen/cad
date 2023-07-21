import axios from 'axios';

import api from './api.URL';

// 向右侧列表添加数据时循环获取左边树形结构数据格式
interface RelevanceDblClickList {
    currentId:string;
    projectCode?:string;
}
// 获取右侧列表数据的数据格式
interface RelevanceCoding {
    id:string,
    projectCode: string | undefined
}

// 点击左侧树形结构展开按钮时获取子结构数据的数据格式
interface RelevanceExpandClick{
    id:string;
    projectCode?:string;
}

// 右侧列表删除数据的数据格式
interface RelevanceDeleteCoding{
    projectCode: string,
    list: string;
}
// 右侧新增后保存的数据格式
interface RelevanceAddCoding{
    list:string;
    projectCode?:string;
}


export class Relevance {
    // 向右侧列表添加数据时循环获取左边树形结构数据的API
    dblClickList(params:RelevanceDblClickList){
        return axios.get(api.Relevance.dblClickList,{params})
    }
    // 获取右侧列表数据的API
    coding(params:RelevanceCoding){
        return axios.get(api.Relevance.coding,{params})
    }
    // 获取左侧列表数据的API
    leftCoding(params:{projectCode:string}){
        return axios.get(api.Relevance.leftCoding,{params})
    }
    // 点击左侧树形结构展开按钮时获取子结构数据的API
    expandClick(params:RelevanceExpandClick){
        return axios.get(api.Relevance.expandClick,{params})
    }


    // -------------------------

    // 右侧列表删除数据的API
    deleteCoding(params:RelevanceDeleteCoding){
        return axios.post(api.Relevance.deleteCoding,params)
    }
    // 右侧新增后保存的API
    AddCoding(params:RelevanceAddCoding){
        return axios.post(api.Relevance.AddCoding,params)
    }


}
