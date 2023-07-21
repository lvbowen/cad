import Axios from '../axios';

import Mappings from '../api.mappings';

import { HttpResponse } from '../response';

export class OrganizationApi {

  // 错误处理
  errorHandle(res: any) {
    if (res.hasOwnProperty('errcode') && res.errcode !== 0) {
      return Promise.reject(res);
    }
    return res;
  }

  // 下一级-组织树
  getOrgTree(
    depthId:any,
    appCode:string,
    deptIds?: any,
    filterType?:string,
    sourceType?:string,
    corpId?:string,
    excludeCorpId?:string,
    selectUserIds?:string,
    workflowInstanceId?:string,
    activityCode?: string,
    jobs?:string,
    majors?:string,
    certifications?: string
  ): Promise<HttpResponse<any>>  {
    return Axios.get(Mappings.organization.departmentTree, {
      params: {
        depthId,
        appCode,
        deptIds,
        filterType,
        sourceType,
        corpId,
        excludeCorpId,
        selectUserIds,
        workflowInstanceId,
        activityCode,
        jobs,majors,certifications
      }
    }).then(this.errorHandle);
  }

  // 下一级-用户
  getUsersTree(
    deptId: string,
    roleId?: string,
    filterType?: string,
    sourceType?:string,
    workflowInstanceId?:string,
    activityCode?:string,
    jobs?:string,
    majors?:string,
    certifications?: string
  ): Promise<HttpResponse<any>>  {
    return Axios.get(Mappings.organization.departmentListUser, {
      params: {
        deptId,
        roleId,
        filterType,
        sourceType,
        workflowInstanceId,
        activityCode,
        jobs,majors,certifications
      }
    }).then(this.errorHandle);
  }

  getJobQualificationDropbox(
      appCode: string,
  ): Promise<HttpResponse<any>>  {
    return Axios.get(Mappings.organization.getJobQualificationDropbox, {
      params: {
        appCode
      }
    }).then(this.errorHandle);
  }

  /**
   * 选人控件根据名称搜索人或部门
   * @param name
   * @param deptIds 部门编码 “,”分割
   * @param roleIds 角色编码 “,”分割
   */
  search(
      appCode:string,
      keyword:string,
      depthId?:string,
      name?: string,
      deptIds?: string,
      roleIds?: string,
      filterType?:string,
      sourceType?:string,
      corpId?:string,
      excludeCorpId?:string,
      workflowInstanceId?:string,
      activityCode?:string,
      selectUserIds?: string,
      jobs?:string,
      majors?:string,
      certifications?: string
    ) {
    return Axios.get(Mappings.organization.userTreeSearch, {
      params: {
        appCode,
        keyword,
        depthId,
        name,
        deptIds,
        roleIds,
        filterType,
        sourceType,
        corpId,
        excludeCorpId,
        workflowInstanceId,
        activityCode,
        selectUserIds,
        jobs,majors,certifications
      }
    }).then(this.errorHandle);
  }

  getRoleGroupList(expandAll?: boolean) {
    return Axios.get(Mappings.organization.roleTree, {
      params: {
        expandAll: !!expandAll
      }
    })
  }
  getRoleGroupList2(params?: any) {
    params = params || {};
    return Axios.get(Mappings.organization.roleTree, {
      params
    })
  }

  getRolesByGroupid(groupId: string) {
    return Axios.get(Mappings.organization.roleUsersByGroupid, {
      params: {
        groupId,
      }
    })
  }

  searchRolesByName(params:any){
    return Axios.get(Mappings.organization.searchRoleByName, {
      params
    })
  }

  getRoleGroupByCode(roleCode: string) {
    return Axios.get(Mappings.organization.roleGroupByCode, {
      params: {
        roleCode
      }
    });
  }

  getRoleGroupById(roleId: string) {
    return Axios.get(Mappings.organization.roleGroupById, {
      params: {
        roleId
      }
    });
  }

  getRolesByGroupParams(params: any) {
    return Axios.get(Mappings.organization.getRolesByGroupParams, {
      params
    })
  }
}
