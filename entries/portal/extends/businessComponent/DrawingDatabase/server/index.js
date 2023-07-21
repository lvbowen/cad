import axios from "axios";
import env from '@/config/env';

export const getBimRdpReport = (appCode, projectName, componentCode) =>
    axios.get(
        env.apiHost + "/api/report/getBimRdpReport", {
        params: {
            appCode: appCode,
            projectName: projectName,
            componentCode: componentCode,
        }
    }
    );
export const getDrawingListIPage = (projectCode, projectName, pdbsId, pageNum, pageSize, isAllDisplay, sortType, queryKeyword) =>
    axios.get(
        env.apiHost + "/api/ebim/DrawingList/drawingListIPage", {
        params: {
            projectCode: projectCode,
            projectName: projectName,
            pdbsId: pdbsId,
            pageNum: pageNum,
            pageSize: pageSize,
            isAllDisplay: isAllDisplay,
            sortType: sortType,
            queryKeyword: queryKeyword,
        }
    }
    );
export const getLeafMbsList = (projectCode, projectName, parentMbsId, parentMbsCode, isRelated) =>
    axios.get(
        env.apiHost + "/api/ebim/FileMbsRelation/leafMbsList", {
        params: {
            projectCode: projectCode,
            projectName: projectName,
            parentMbsId: parentMbsId,
            parentMbsCode: parentMbsCode,
            isRelated: isRelated,
        }
    }
    );
export const getUploadWithToken = (file) =>
    axios.post(
        env.apiHost + "/api/ebim/DrawingList/uploadWithToken", file,
    );
export const getSystemConfig = (path) =>
    axios.get(
        env.apiHost + "/api/iconManage/getSystemConfig", {
        params: {
            path: path,
        }
    }
    );
export const getSelectedModel = (form) =>
    axios.post(
        env.apiHost + "/bim/data/getSelectedModel", form
    );

export const getBimCardData = (cmd) =>
    axios.post(
        env.apiHost + "/api/ebim/bimCardData/getBimCardData", cmd
    );
//增删改PDBS一条数据
export const getRefreshPDBS = (cmd) =>
    axios.post(
        env.apiHost + "/api/ebim/drawingLibrary/refreshPDBS", cmd
    );
//增删改PDBS一条数据
export const getmovePDBS = (cmd) =>
    axios.post(
        env.apiHost + "/api/ebim/drawingLibrary/movePDBS", cmd
    );
//增删改PDBS一条数据
export const getChangRankPDBS = (cmd) =>
    axios.post(
        env.apiHost + "/api/ebim/drawingLibrary/changRankPDBS", cmd
    );
//增删改PDBS下的图纸资料数据
export const getRefreshDrawing = (cmd) =>
    axios.post(
        env.apiHost + "/api/ebim/DrawingList/refreshDrawing", cmd
    );
//增删改PDBS下的图纸资料数据
export const getBatchUpdateFileMbsRelation = (cmd) =>
    axios.post(
        env.apiHost + "/api/ebim/FileMbsRelation/batchUpdateFileMbsRelation", cmd
    );

export const getPdbsTree = (projectCode, projectName) =>
    axios.get(
        env.apiHost + "/api/ebim/drawingLibrary/pdbsTree", {
        params: {
            projectCode: projectCode,
            projectName: projectName,
        }
    }
    );
export const getAllDrawingByPdbsid = (projectCode, projectName, pdbsId) =>
    axios.get(
        env.apiHost + "/api/ebim/DrawingList/allDrawingByPdbsid", {
        params: {
            projectCode: projectCode,
            projectName: projectName,
            pdbsId: pdbsId,
        }
    }
    );
export const getDrawingManageTreeByKeyWords = (projectCode, projectName, queryKeyword) =>
    axios.get(
        env.apiHost + "/api/ebim/drawingLibrary/drawingManageTreeByKeyWords", {
        params: {
            projectCode: projectCode,
            projectName: projectName,
            queryKeyword: queryKeyword,
        }
    }
    );
