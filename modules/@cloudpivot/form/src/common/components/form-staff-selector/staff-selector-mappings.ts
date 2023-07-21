/*
 * @Author: your name
 * @Date: 2020-06-03 15:21:11
 * @LastEditTime: 2020-06-03 17:17:50
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \frontend\modules\@cloudpivot\form\src\common\components\form-staff-selector\staff-selector-mappings.ts
 */

import { userApi } from "@cloudpivot/api";

import { renderer } from '@cloudpivot/form';

const MAPPING_FIELD_OPERATE = "MAPPING_FIELD_OPERATE";

export abstract class StaffSelectorMapping {

  static async mappingOperate(val: any, mappings: string, vm: any) {
    const _tempMappingItem = ["departments", "partTimerDepartment", "manager"];
    const self: any = StaffSelectorMapping;
    let dirty = false; // val 是否被修改标记

    const mappingList = mappings
      .slice(0, -1)
      .split(";")
        // eslint-disable-next-line no-shadow
      .map((val: any) => val.split(":"));
    for (const _mapping of mappingList) {
      const [mappingItem, mappingKey] = _mapping;
      if (self[MAPPING_FIELD_OPERATE + mappingItem]) {
        if (mappingItem === "departments" &&
          ( !val[0]["departments"] || val[0]["departments"].length > 1)
        ) {
          dirty = true;
          await self[`${MAPPING_FIELD_OPERATE}${mappingItem}`](val[0],vm);
        } else if (mappingItem === "partTimerDepartment" && !val[0]["partTimerDepartment"] ) {
          dirty = true;
          //外链不能访问此组织接口，不支持
          if(!vm.isExternal){
            await self[`${MAPPING_FIELD_OPERATE}${mappingItem}`](val[0],vm

              );
          }
        } else if (!val[0][mappingItem]) {
            dirty = true;
            await self[`${MAPPING_FIELD_OPERATE}${mappingItem}`](val[0]);
          }
      } else if (~mappingItem.indexOf("LEVEL")) {
        if (!val[0][mappingItem]) {
          dirty = true;
          await self[`${MAPPING_FIELD_OPERATE}OrganizationLevel`](
            val[0],
            mappingItem,
            vm
          );
        }
      } else if (!_tempMappingItem.includes(mappingItem) && vm.val) {
        if (typeof vm.val !== typeof val || vm.val.length !== val.length) {
          dirty = true;
        } else {
          if (vm.val[0][mappingItem] !== val[0][mappingItem]) {
            dirty = true;
          }
        }
      }
    }
    if (dirty) {
      const newVal = JSON.parse(JSON.stringify(val));
      vm.setValue(newVal);
      vm.val && (vm.val = val);
    } else {
      vm.val && (vm.val = val);
    }
  }

  // 用户 主部门和兼职部门信息. 两种情况,1. 部门信息都在一个 departments里面,需要区分. 2. 部门信息没有需要额外请求接口
  static async [MAPPING_FIELD_OPERATE + "departments"](item: any, vm: any) {
    return new Promise(async (resolve, reject) => {
      if (item.departments && item.departments.length > 1) {
        const _department: any[] = [];
        const _partTimerDepartments: any[] = [];
        for (const dp of item.departments) {
          if (dp.id !== item.departmentId) {
            _partTimerDepartments.push(dp);
          } else {
            _department.push(dp);
          }
        }
        item["partTimerDepartment"] = _partTimerDepartments;
        item["departments"] = _department;
        resolve(item);
      } else if (!item.departments) {
        const { errcode, data, errmsg } = await userApi.getUserInfo(item.id);
        if (errcode === 0) {
          if (data) {
            const { mainDepartmentName, departmentNames } = data as any;
            item["departments"] = mainDepartmentName
              ? [mainDepartmentName]
              : [];
            item["partTimerDepartment"] =
              departmentNames && departmentNames.length ? departmentNames : [];
          }
        } else {
          vm.$message.error(errmsg);
        }
        resolve(item);
      }
    });
  }

  static async [MAPPING_FIELD_OPERATE + "partTimerDepartment"](item: any,vm: any) {
    return new Promise(async (resolve, reject) => {
      const { errcode, data, errmsg } = await userApi.getUserInfo(item.id);
      if (errcode === 0) {
        if (data) {
          const { mainDepartmentName, departmentNames } = data as any;
          item["departments"] = mainDepartmentName
            ? [mainDepartmentName]
            : [];
          item["partTimerDepartment"] =
            departmentNames && departmentNames.length ? departmentNames : [];
        }
      } else {
        vm.$message.error(errmsg);
      }
      resolve(item);
    });
  }

  // 映射字段-manager-主管信息 获取
  static async [MAPPING_FIELD_OPERATE + "manager"](item: any) {
    return new Promise((resolve, reject) => {
      renderer.StaffSelectorControl.service.getDeptLeader(item.id).then((data: any) => {
        if (Array.isArray(data)) {
          if (data.length) {
            item["manager"] = data;
          } else {
            item["manager"] = [];
          }
        } else {
          item["manager"] = [];
        }
        resolve(item);
      });
    });
  }

  // 映射字段-xxx-LEVEL,x -部门信息 获取
  static async [MAPPING_FIELD_OPERATE + "OrganizationLevel"](
    item: any,
    levelString: any,
    vm: any
  ) {
    return new Promise((resolve, reject) => {
      renderer.StaffSelectorControl.service.getOrganizationLevel(item.id).then(data => {
        if (vm.controlOpts) {
          if (data) {
            if (data.length > 0) {
              const level = levelString.split(",")[1];
              //判断当前返回的组织层级是否与映射的组织层级对应
              if (level < data.length) {
                item[levelString] = [];
                item[levelString].push(data[level]);
              } else {
                item[levelString] = [];
                item[levelString].push(data[data.length - 1]);
              }
            } else {
              item[levelString] = [];
            }
          } else {
            item[levelString] = [];
          }
        }
        resolve(true);
      });
    });
  }
}
