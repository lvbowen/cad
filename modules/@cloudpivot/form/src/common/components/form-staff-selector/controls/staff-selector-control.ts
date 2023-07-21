/*
 * @Author: your name
 * @Date: 2020-04-22 14:11:20
 * @LastEditTime: 2020-06-11 11:36:38
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \frontend\modules\@cloudpivot\form\src\common\components\form-staff-selector\controls\staff-selector-control.ts
 */

import { Subscription } from "rxjs";
import { userApi } from "@cloudpivot/api";
import * as typings from "@cloudpivot/form/src/typings";

import { BaseControl } from "@cloudpivot/form/src/common/controls/base-control";
import * as schema from "@cloudpivot/form/src/schema";
// @ts-ignore
import isEqual from 'lodash/isEqual'

import { RadioControl } from "h3-forms";

const MAPPING_FIELD_OPERATE = "MAPPING_FIELD_OPERATE";

export abstract class StaffSelectorControl extends BaseControl<typings.StaffSelectorOptions> {
    static service: UserService;

    val: any[] = [];

    staffSelectorOpts: any = {};

    refSubscription?: Subscription;

    get text() {
        return this.val.map(x => x.name).join(";");
    }

    get isMobile() {
        const flag = navigator.userAgent.match(/(phone|pad|pod|iPhone|iPod|ios|iPad|Android|Mobile|BlackBerry|IEMobile|MQQBrowser|JUC|Fennec|wOSBrowser|BrowserNG|WebOS|Symbian|Windows Phone)/i);
        return flag;
    }

    get displayType() {
        if (this.controlOpts.displayType) {
            return this.controlOpts.displayType;
        }
        return schema.DisplayType.Tag;
    }

    setControl() {
        this.staffSelectorOpts = this.createOptions();

        this.unsubscribe();

        let key = this.controlOpts.orgRoot;

        if (
            this.controlOpts.orgRootValueType === schema.StaffSelectorValueType.Ref &&
            key &&
            typeof key === "string"
        ) {
            key = key.substr(1, key.length - 2);
            let ctrl: any = "";
            if (this.ctrl.options && this.ctrl.options.inSheet) {
                const rowIndex = this.ctrl.options.rowIndex || 0;
                ctrl = this.findController(key, rowIndex) as RadioControl;
            } else {
                ctrl = this.findController(key) as RadioControl;
            }
            if (ctrl) {
                if (ctrl.value) {
                    this.$set(this.staffSelectorOpts, "rootNode", ctrl.value);
                }

                this.refSubscription = ctrl.valueChange.subscribe(change => {
                    this.$set(this.staffSelectorOpts, "rootNode", change.value);
                });
            }
        }
        const value = this.ctrl.value;
        const isNew = (window as any).h3form
            ? !!(window as any).h3form.isNew
            : true;
        // 除了新增之外
        const isWorkflow = (window as any).h3form
            ? !!(window as any).h3form.workflowInfo
            : false;
        if (isNew || (isWorkflow && this.controlOpts.mappings)) {
            this.handleValueChange(this.ctrl.value);
        } else {
            this.val = value ? value : [];
        }
    }

    handleValueChange(value: any): void {
    // 修正在钉钉工作台中选人控件映射闪动问题
    if(!value)
    {
      return ;
    }
        if (!this.controlOpts.mappings) {
            if (value) {
                if (!isEqual(this.val, value)) {
                    this.val = value;
                }
            } else {
                // 如果当前value为null 并且当前选人控件有值，才将this.value置为空，触发onValueChange事件
                // 避免进入死循环
                if (Array.isArray(this.val) && this.val.length > 0) {
                    this.val = [];
                }
            }
        } else {
            if (value) {
                this.mappingOperate(value);
            } else {
                this.val = [];
            }
        }
    }

    async mappingOperate(val: any) {
        const _tempMappingItem = [ "departments", "partTimerDepartment", "manager", "entryDate" ];
        const self: any = this;
        let dirty = false; // val 是否被修改标记
        const userinfo = [ 'partTimerDepartment', 'mobile', 'email', 'officePhone', 'employeeNo' ];
        const mappingList = this.controlOpts.mappings
            .slice(0, -1)
            .split(";")
            .map((item: any) => item.split(":"));
        for (const _mapping of mappingList) {
            const [ mappingItem, mappingKey ] = _mapping;
            console.log(mappingItem, mappingKey)
            if (self[MAPPING_FIELD_OPERATE + mappingItem] || userinfo.includes(mappingItem)) {
                if (mappingItem === "departments" &&
                    (!val[0]["departments"] || val[0]["departments"].length > 1)
                ) {
                    dirty = true;
                    await self[`${MAPPING_FIELD_OPERATE}${mappingItem}`](val[0]);
                } else if (userinfo.includes(mappingItem) && val[0][mappingItem] === undefined) {
                    dirty = true;
                    //外链不能访问此组织接口，不支持
                    if (!self.isExternal) {
                        await self[`${MAPPING_FIELD_OPERATE}${'partTimerDepartment'}`](val[0], mappingItem);
                    }
                }

                    // else if (mappingItem === "partTimerDepartment" && !val[0]["partTimerDepartment"] ) {
                    //   dirty = true;
                    //   //外链不能访问此组织接口，不支持
                    //   if(!self.isExternal){
                    //     await self[`${MAPPING_FIELD_OPERATE}${mappingItem}`](val[0]);
                    //   }
                // }

                else if (!val[0][mappingItem] && self[`${MAPPING_FIELD_OPERATE}${mappingItem}`]) {
                    dirty = true;
                    await self[`${MAPPING_FIELD_OPERATE}${mappingItem}`](val[0]);
                }
            } else if (~mappingItem.indexOf("LEVEL")) {
                if (!val[0][mappingItem]) {
                    dirty = true;
                    await self[`${MAPPING_FIELD_OPERATE}OrganizationLevel`](
                        val[0],
                        mappingItem
                    );
                }
            } else if (!_tempMappingItem.includes(mappingItem)) {
                if (typeof this.val !== typeof val || this.val.length !== val.length) {
                    dirty = true;
                } else {
                    if (this.val[0][mappingItem] !== val[0][mappingItem]) {
                        dirty = true;
                    }
                }
            } else if (mappingItem.indexOf('entryDate') > -1) {
                if (val[0][mappingItem] && typeof val[0][mappingItem] === 'string') {
                    val[0][mappingItem] = new Date(val[0][mappingItem]);
                    dirty = true;
                }
            }
        }
        if (dirty) {
            const newVal = [ ...val ];
            this.setValue(newVal);
            if (!isEqual(this.val, val)) {
                this.val = val;
            }
        } else {
            if (!isEqual(this.val, val)) {
                this.val = val;
            }
        }
    }

    // 用户 主部门和兼职部门信息. 两种情况,1. 部门信息都在一个 departments里面,需要区分. 2. 部门信息没有需要额外请求接口
    async [MAPPING_FIELD_OPERATE + "departments"](item: any) {
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
                            ? [ mainDepartmentName ]
                            : [];
                        item["partTimerDepartment"] =
                            departmentNames && departmentNames.length ? departmentNames : [];

                    }
                } else {
                    this.$message.error(errmsg as string);
                }
                resolve(item);
            }
        });
    }

    async [MAPPING_FIELD_OPERATE + "partTimerDepartment"](item: any, key?: string) {
        return new Promise(async (resolve, reject) => {
            const res = await userApi.getUserInfo(item.id);

            const { errcode, errmsg } = res
            const data: any = res.data;

            if (errcode === 0) {
                if (data) {
                    const { mainDepartmentName, departmentNames } = data as any;

                    if (key) {
                        item[key] = data[key] ? data[key] : '';
                    }

                    item["departments"] = mainDepartmentName
                        ? [ mainDepartmentName ]
                        : [];
                    item["partTimerDepartment"] =
                        departmentNames && departmentNames.length ? departmentNames : [];
                }
            } else {
                this.$message.error(errmsg as string);
            }
            resolve(item);
        });
    }

    // 映射字段-manager-主管信息 获取
    async [MAPPING_FIELD_OPERATE + "manager"](item: any) {
        return new Promise((resolve, reject) => {
            StaffSelectorControl.service.getDeptLeader(item.id).then((data: any) => {
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
    async [MAPPING_FIELD_OPERATE + "OrganizationLevel"](
        item: any,
        levelString: any
    ) {
        return new Promise((resolve, reject) => {
            StaffSelectorControl.service.getOrganizationLevel(item.id).then(data => {
                if (this.controlOpts) {
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

    unsubscribe() {
        if (this.refSubscription) {
            this.refSubscription.unsubscribe();
        }
    }

    createOptions() {
        const opts = this.controlOpts;
        const dept = opts.deptVisible;

        const selectOrg = dept === "all" || dept === "org";
        const selectUser = dept === "all" || dept === "user";

        let root: any;

        if (
            this.controlOpts.orgRootValueType === schema.StaffSelectorValueType.None
        ) {
            if (opts.orgRoot && typeof opts.orgRoot === "string") {
                try {
                    root = JSON.parse(opts.orgRoot);
                } catch (error) {
                }
            } else if (Array.isArray(opts.orgRoot)) {
                root = opts.orgRoot;
            }
        } else if (
            this.controlOpts.orgRootValueType ===
            schema.StaffSelectorValueType.OriginatorDept
        ) {
            root = StaffSelectorControl.service.getCurrentUserDept();
        }

        if (root && !Array.isArray(root)) {
            root = [ root ];
        }

        let role: any;
        if (opts.roles && typeof opts.roles === "string") {
            role = JSON.parse(opts.roles);
        }
        let mulpitle: boolean = false;
        if (typeof this.controlOpts.multi === "string" && this.controlOpts.multi === 'false') {
            mulpitle = false;
        } else {
            mulpitle = Boolean(this.controlOpts.multi);
        }
        return {
            key: this.control.key,
            selectOrg: selectOrg,
            selectUser: selectUser,
            mulpitle,
            rootNode: root,
            role: role,
            showModel: true,
            showSelect: true,
            recursive: this.controlOpts.recursive,
            placeholder: this.placeholder
        };
    }

    destroyed() {
        super.destroyed();

        this.unsubscribe();
    }

    // setCurrentUser() {
    //     const user = StaffSelectorControl.service.getCurrentUser();
    //     if (user) {
    //         this.ctrl.value = [user];
    //     }
    // }

    // setCurrentUserDept() {
    //     const dept = StaffSelectorControl.service.getCurrentUserDept();
    //     if (dept) {
    //         this.ctrl.value = [dept];
    //     }
    // }

    // initValue() {
    //     if (!this.control.value || !this.control.value.length) {
    //         const type = this.controlOpts.defaultValueType;
    //         if (type === typings.StaffSelectorValueType.Originator) {
    //             this.setCurrentUser();
    //         } else if (type === typings.StaffSelectorValueType.OriginatorDept) {
    //             this.setCurrentUserDept();
    //         }
    //     }
    // }
}

/**
 * 机构类型
 */

// eslint-disable-next-line no-shadow
export enum OrganizationType {
    /**
     * 部门
     */
    Department = 1,

    /**
     * 角色
     */
    Role = 2,

    /**
     * 用户
     */
    User = 3
}

export interface OrganizationBase {
    id: string;

    name: string;
}

export interface DepartmentInfo extends OrganizationBase {
    /**
     * 员工数
     */
    employees: number;

    /**
     * 叶子节点
     */
    leaf: boolean;

    /**
     * 父级部门ID
     */
    parentId?: string;

    type: OrganizationType;
}

/**
 * 用户状态
 */

// eslint-disable-next-line no-shadow
export enum UserStatus {
    /**
     * 启用
     */
    Enable = "ENABLE",

    /**
     * 禁用
     */
    Disable = "DISABLE"
}

export interface UserInfo extends OrganizationBase {
    /**
     * 头像
     */
    imgUrl?: string;

    status: UserStatus;

    [key: string]: any;

    type: OrganizationType;
}

export interface UserService {
    /**
     * 当前登录用户
     */
    getCurrentUser(): UserInfo | null;

    /**
     * 当前登录用户部门
     */
    getCurrentUserDept(): DepartmentInfo | null;

    /**
     * 获取部门集合
     * @param deptId 所属部门ID，无值时获取根部门，多个时以“,”分割
     */
    getDepartmentsBy(
        depthId?:any,
        appCode?:string,
        deptIds?: string,
        filterType?: string,
        sourceType?: string,
        corpId?: string,
        excludeCorpId?: string,
        selectUserIds?: any,
        workflowInstanceId?: string,
        activityCode?: string,
        jobs?:string,
        majors?:string,
        certifications?: string
    ): Promise<{
        departments: DepartmentInfo[];
        myDepartment?: DepartmentInfo[];
    }>;

    /**
     * 获取用户集合
     * @param deptId 所属部门ID
     * @param roleId 所属角色ID
     */
    getUsersBy(
        deptId: string,
        roleId?: string,
        filterType?: string,
        sourceType?: string,
        workflowInstanceId?: string,
        activityCode?: string,
        jobs?:string,
        majors?:string,
        certifications?: string
    ): Promise<UserInfo[]>;

    /**
     * 搜索部门和用户
     * @param name 名称
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
        filterType?: string,
        sourceType?: string,
        corpId?: string,
        excludeCorpId?: string,
        workflowInstanceId?: string,
        activityCode?: string,
        selectUserIds?: string,
        jobs?:string,
        majors?:string,
        certifications?: string
    ): Promise<{
        departments?: DepartmentInfo[];
        users?: UserInfo[];
        departmentsTotal?: number;
        usersTotal?: number;
    }>;

    /**
     * 根据用户ID获取部门列表
     * @param userId
     */
    getUserDepartments(userId: string): Promise<OrganizationBase[] | null>;

    /**
     * 根据用户ID获取组织层级
     * @param userId
     */
    getOrganizationLevel(userId: string): Promise<OrganizationBase[] | null>;

    /**
     * 根据用户id获取部门主管信息
     * @param userId/用户id
     */
    getDeptLeader(userId: string): Promise<OrganizationBase[] | null>;
}
