import {InjectReactive, Prop, Vue, Watch} from "vue-property-decorator";

import { DepartmentInfo, OrganizationType, StaffSelectorControl, UserStatus, } from "./controls/staff-selector-control";

const MAPPING_FIELD_OPERATE = "MAPPING_FIELD_OPERATE_"; // 选人控件 特殊的映射字段 额外处理方法名 前缀

export abstract class StaffSelectorBase extends Vue {
  @InjectReactive('project') projectCode!: string;
  mainDepartment: any = null; // 主部门

  partTimerDepartment: any = null; // 兼职部门

  @Prop({
    default: () => { },
  })
  options!: any;
  // 过滤条件需要的参数
  @Prop({
    default: () => { },
  })
  params!: any;

  //表单列表多选控件才具有精简功能
  @Prop({
    default: false,
  })
  onlyForm!: boolean;

  @Prop({
    default: false,
  })
  disabled!: boolean;

  @Prop()
  controlOpts: any;

  org: any[] = [];

  // 是否是通过单击打开的部门（是：单击下级或路径，否：单击根目录或初始化打开选人控件）
  isClickNext: boolean =false;

  searchList: any[] = [];

  showLoading: boolean = false; // 是否展示正在搜索中

  isDisableClick: boolean = false;

  @Prop()
  value!: any[];
  @Prop({ default: "" })
  placeholder!: string;

  // 搜索数据总数
  departmentsTotal: number = 0;
  usersTotal: number = 0;

  // 转换的时候数据过来数据中 id 不一定是部门id
  // 固使用参数传递进来以判断使用哪个字段做 convert
  @Prop({ default: "id" })
  convertKey!: any;


  /**
   * 基于此bug #43245
   * 涉及子管理员组织管理范围的某些部门不可删除，但是可以查看
   * 故将不可删除的部门传进来，做删除才做时，可做判断
   * 20200507 不要John
   * */

  @Prop({ default: () => [] })
  keepDeptIds!: any[];

  selected: any = [];

  currentDept?: DepartmentInfo;
  blackList?: Array<string> = ["#/system/manager-setting"];
  isFirstLoad: boolean = true;

  @Prop({
    default: false,
  })
  appManagerFilter?: boolean;

  get locale() {
    return localStorage.getItem("locale") || "zh";
  }

  @Watch("value", {
    immediate: true,
    deep: true
  })
  setValue(vals: any[]) {
    // console.log(vals, 'vals');
    if (!vals) {
      this.selected = [];
      return;
    }

    this.selected = this.getSelectData(vals);
  }

  @Watch("options", {
    immediate: true,
  })
  handleFocus(opts: any) {
    if (!opts.showSelect && opts.showModel) {
      this.treeFocus();
    }
  }

  getSelectData(vals: any) {
    let arr:any = [];
    if (Array.isArray(vals)) {
      arr = vals;
    } else {
      arr = [vals]
    }
    return arr.map((x: any) => {
      return {
        id: (x[this.convertKey] ? x[this.convertKey] : x.id) || x.key,
        key: (x[this.convertKey] ? x[this.convertKey] : x.id) || x.key,
        name: x.name || '',
        type: Number(x.type) === 3 || Number(x.unitType) === 3 ? "user" : "org",
        source: x,
        avatar: x.imgUrl || '',
        departmentName:x.departmentName || '',
        /**
         * 基于此bug #43245 做一个拓展
         * 拓展逻辑：当前部门不在子管理员的组织管理范围内的，只可查看，不可删除
         * 故增加此字段以做删除逻辑时判断
         * 2020-05-07 by John
         * */

        operatable: x.operatable,
      };
    });
  }

  convert(x: any) {
    return {
      id: x[this.convertKey] || x.key,
      key: x[this.convertKey] || x.key,
      name: x.name,
      type: x.type === 3 ? "user" : "org",
      source: x,
      avatar: x.imgUrl,
      /**
       * 基于此bug #43245 做一个拓展
       * 拓展逻辑：当前部门不在子管理员的组织管理范围内的，只可查看，不可删除
       * 故增加此字段以做删除逻辑时判断
       * 2020-05-07 by John
       * */

      operatable: x.operatable,
    };
  }

  get rootId() {
    let id = "";
    if (
      this.options &&
      this.options.rootNode &&
      this.options.rootNode.length > 0
    ) {
      id = this.options.rootNode[0].id || "";
    }
    return id;
  }

  get rootIds() {
    let resId = "";
    if (
      this.options &&
      this.options.rootNode &&
      this.options.rootNode.length > 0
    ) {
      // resId = this.options.rootNode[0].id || '';
      resId = this.options.rootNode
        .map((node: any) => node.id as string)
        .filter((id: string) => !!id)
        .join(",");
    }
    return resId;
  }

  get roleId() {
    if (this.options && this.options.role) {
      return this.options.role.value || "";
    }
    return "";
  }

  get filterType() {
    if (this.options.appManagerFilter || this.appManagerFilter) {
      return "admin";
    } else {
      return "";
    }
  }

  treeFocus() {
    this.onClickTrunBack();
  }

  // 树-返回
  onClickTrunBack() {
    this.isClickNext = false;
    this.currentDept = undefined;
    this.getOrgsAndUsers();
  }

  // 树-下一级
  onClickNextHierarchy(val: any) {
    this.isDisableClick = true;

    if (val && val.id) {
      this.isClickNext = true;
      this.currentDept = val.source;
      this.getOrgsAndUsers();
    }
  }

  onClickBreadcrumb(val: any) {
    this.isDisableClick = true;
    if (val && val.id) {
      this.isClickNext = true;
      this.currentDept = val.source;
      this.getOrgsAndUsers();
    }
  }

  onChange(items?: any[]) {
    let selecteds: any[] = [];
    if (items && items.length > 0) {
      const ids: string[] = items.map((x) => x.key);
      selecteds = this.selected.filter(
        (item: any) => ids.indexOf(item.id) > -1
      );
    }
    let list: any[] = [];
    if (selecteds.length > 0) {
      list = selecteds.map((x) => x.source);
    }

    this.$emit("change", list);
  }

  async onOk(items: any[]) {
    //主部门、兼职部门
    items.map((item: any) => {
      if (item.source && item.source.departments) {
        //主部门的id
        this.mainDepartment = item.source.departments.filter(
          (x: any) => x.id === item.source.departmentId
        );
        //兼职部门的id
        this.partTimerDepartment = item.source.departments.filter(
          (x: any) => x.id !== item.source.departmentId
        );
      }
    });
    // 给数据设置区分主部门和兼职部门
    items.forEach((x: any) => {
      x.source.departments = this.mainDepartment;
      x.source.partTimerDepartment = this.partTimerDepartment;
    });
    items.length && (await this.onlyFormModal(items));
    if (items.length === 1) {
      this.getOrganizationLevel(items);
    } else {
      const list = items.map((x) => x.source);
      this.$emit("ok", list);
      this.$emit("change", list);
    }
  }
  // 单选模式下 ok 或 change事件需要处理的 业务
  async onlyFormModal(items: any[]) {
    await this.mappingOperate(items[0]);
  }
  // 选人控件 映射相关的业务
  async mappingOperate(item: any) {
    const self: any = this;
    const mappings = this.controlOpts ? this.controlOpts.mappings : "";
    if (mappings) {
      // 获取所有映射的 字段
      const arr_mapping = mappings
        .slice(0, -1)
        .split(";")
        .map((val: any) => val.split(":")[0]);
      for (const mapping_item of arr_mapping) {
        if (self[MAPPING_FIELD_OPERATE + mapping_item]) {
          await self[`${MAPPING_FIELD_OPERATE}${mapping_item}`](item);
        }
      }
    }
  }

  // 映射字段-manager-主管 获取信息
  async [MAPPING_FIELD_OPERATE + "manager"](item: any) {
    let params = { userId: item.id, ...this.params };
    // portal端参数处理
    if (this.controlOpts && this.controlOpts.params) {
      const opts = JSON.parse(this.controlOpts.params);
      params = { ...params, ...opts };
    }
    return new Promise((resolve, reject) => {
      StaffSelectorControl.service
        .getDeptLeader({ userId: item.id, ...params })
        .then((data: any) => {
          if (data.length) {
            item.source["manager"] = data;
          }
          // else {
          //   item.source["manager"] = [{ name: "陈总", id: 12323 }];
          // }
          resolve(item);
        });
    });

    // const list = items.map(x => x.source);
    // this.$emit("ok", list);
    // this.$emit("change", list);
  }

  onCancle() {
    this.$emit("cancel");
  }

  // 获取组织层级（部门）
  getOrganizationLevel(items: any[]) {
    StaffSelectorControl.service
      .getOrganizationLevel(items[0].id)
      .then((data) => {
        if (this.controlOpts) {
          const mappings = this.controlOpts.mappings;
          const item: any = items[0];
          if (data) {
            if (data.length > 0) {
              if (mappings) {
                if (mappings.indexOf("LEVEL") > -1) {
                  mappings.split(";").forEach((m: any) => {
                    if (m.indexOf("LEVEL") > -1) {
                      const level = m.split(":")[0];
                      //判断当前返回的组织层级是否与映射的组织层级对应
                      if (level.split(",")[1] < data.length) {
                        item.source[level] = [];
                        item.source[level].push(data[level.split(",")[1]]);
                      } else {
                        item.source[level] = [];
                        item.source[level].push(data[data.length - 1]);
                      }
                    }
                  });
                }
              }
            }
          }
        }
        const list = items.map((x) => x.source);
        this.$emit("ok", list);
        this.$emit("change", list);
      });
  }

  // 获取该级的树和用户
  getOrgsAndUsers() {
    const promises: any[] = [];
    if (this.currentDept) {
      const dept = this.currentDept;
      // if (dept.leaf && dept.employees === 0) {
      //   this.org = [];
      // } else {
      //   if (dept.leaf === false) {
      if (this.options.appManagerFilter || this.appManagerFilter) {
        promises.push(this.getDepts(dept.id, "admin"));
        promises.push(this.getUsers(dept.id, "admin"));
      } else {
        promises.push(this.getDepts(dept.id));
        promises.push(this.getUsers(dept.id));
      }

      // }
      // if (dept.employees > 0) {

      // }
      // }
    } else {
      const roots = this.options.rootNode;
      if (!roots || roots.length < 2) {
        const rootId = this.rootId;
        if (this.options.appManagerFilter || this.appManagerFilter) {
          promises.push(this.getDepts(rootId, "admin"));
        } else {
          setTimeout(()=> {
            promises.push(this.getDepts(rootId));
          },10)
        }
        if (rootId) {
          promises.push(this.getUsers(rootId));
        }
      } else if (roots && roots.length > 1) {
        promises.push(this.getDepts(this.rootIds));
      }
    }
    setTimeout(()=> {
      Promise.all(promises).then((res) => {
        let orgs: any[] = [];
        res.forEach((x) => (orgs = orgs.concat(x)));
        this.org = orgs;
        this.isDisableClick = false;
      }).catch(() => {
        this.isDisableClick = false;
      });
    },10)
  }

  async getDepts(deptIds?: string, filterType?: string, deptIdTwo?: any) {
    // 额外需要的过滤参数
    const copyParams = this.params ? JSON.parse(JSON.stringify(this.params)) : {};

    // 需要从根节点开始显示部门
    if (this.isClickNext && this.options.isDisplayRoot) {
      delete copyParams.filterType
    }

    let params = { deptIds, filterType, ...copyParams };

    // portal端参数处理
    if (this.controlOpts && this.controlOpts.params) {
      const opts = JSON.parse(this.controlOpts.params);
      params = { ...params, ...opts };
    }
    params = this.processParams(params);
    // @ts-ignore
    // console.log(this.options,params,'11')
    const res = await StaffSelectorControl.service.getDepartmentsBy(
      params.deptIds||'',
      !this.options.nonExistentAppCode?this.projectCode||sessionStorage.getItem('appCode') as string:sessionStorage.getItem('appCode') as string,//默认appCode
      params.deptIds || "",
      params.filterType || "",
      params.sourceType || "",
      params.corpId || "",
      params.excludeCorpId || "",
      params.selectUserIds || "",
      "",
      "",
      this.options.jobs || '',
      this.options.majors || '',
      this.options.certifications || '',
    );

    const nodes = res.departments;
    const orgTree = this.resetTree(nodes, []);
    //我的部门去除
    const myDepartentTree: any[] = [];
    const exitSameDepartent = true;

    // if (res.myDepartment) {
    //   const myDepartent: any = res.myDepartment;
    //   // myDepartent. = '';
    //   myDepartentTree = this.resetTree(myDepartent, []);
    //   // 增加我的部门显示
    //   myDepartentTree.forEach((res2) => {
    //     res2.copyName = "我的部门";
    //   });
    //
    //   // 判断我的部门是不是和当前部门一致 一致的话就不现实
    //   const myDepartentID = myDepartentTree[0].id;
    //   exitSameDepartent = orgTree.some((i) => i.id === myDepartentID);
    // }

    return exitSameDepartent ? orgTree : [...orgTree, ...myDepartentTree];
  }

  async getUsers(deptId: string, filterType?: string) {
    let param = {};
    if (this.params) {
      // @ts-ignore
      param = JSON.parse(JSON.stringify(this.params));
    }
    // if (param.hasOwnProperty('sourceType')) {
    //   // @ts-ignore
    //   delete param.sourceType

    // }
    const params: any = { deptId, roleId: this.roleId, filterType, ...param };
    // params = this.processParams(params);
    // @ts-ignore
    const users: any = await StaffSelectorControl.service.getUsersBy(
      params.deptId || "",
      params.roleId || "",
      params.filterType || "",
      params.sourceType || "",
      params.workflowInstanceId || "",
      params.activityCode || "",
      this.options.jobs || '',
      this.options.majors || '',
      this.options.certifications || ''
    );

    // 过滤没激活状态的用户
    const enableUsers = users.filter((u: any) => u.status === UserStatus.Enable);
    if (
      this.options &&
      this.options.filterUser &&
      this.options.filterUser.length > 0
    ) {
      //加签状态选择加签人员过滤当前处理人
      this.options.filterUser.forEach((f: any) => {
        enableUsers.forEach((e: any, i: number) => {
          if (e.id === f.id) {
            enableUsers.splice(i, 1);
          }
        });
      });
    }
    const userTree = this.resetTree(enableUsers, []);

    return userTree;
  }

  // 组装接口异步数据
  resetTree(nodes: any, orgTree: Array<any>) {
    nodes.forEach((node: any) => {
      // 是否递归为false，不让进入下级部门
      let hasChild = false;
      if (this.options.recursive === false) {
        hasChild = false;
      } else {
        hasChild = !node.leaf || (node.employees && node.employees > 0);
      }
      orgTree.push({
        id: node.id,
        name: node.name,
        avatar: node.imgUrl,
        type: node.type === OrganizationType.User ? "user" : "org",
        hasChild,
        hasPermission: node.hasPermission,
        orglist: node.parentDepartmentName || "",
        title: `${node.name} (${node.employees || 0})`,
        isLeaf: node.leaf,
        key: node.id,
        sortKey: "0", // ERROR
        parentId: node.parentId,
        children: [],
        source: node,
      });
    });
    return orgTree;
  }

  onSearch(name: string) {
    if (!name) {
      return;
    }
    let params = {
      name,
      deptIds: this.rootIds,
      roleIds: this.roleId,
      filterType: this.filterType,
      ...this.params,
    };
    // portal端参数处理
    if (this.controlOpts && this.controlOpts.params) {
      const opts = JSON.parse(this.controlOpts.params);
      params = { ...params, ...opts };
    }
    params = this.processParams(params);

    // 正在搜索的时候不执行
    if (this.showLoading) return;
    this.showLoading = true;
    // @ts-ignore
    StaffSelectorControl.service
      .search(
        this.projectCode||sessionStorage.getItem('appCode') as string,//默认appCode
        params.name || "",
        params.deptIds || "",
        params.name || "",
        params.deptIds || "",
        params.roleIds || "",
        params.filterType || "",
        params.sourceType || "",
        params.corpId || "",
        params.excludeCorpId || "",
        params.workflowInstanceId || "",
        params.activityCode || "",
        params.selectUserIds || "",
        this.options.jobs || '',
        this.options.majors || '',
        this.options.certifications || ''
      )
      .then((data: any) => {
        console.log('搜索结果出现')
        const list: any[] = [];
        if (data.departments && this.options.selectOrg) {
          this.resetTree(data.departments, list);
        }
        if (data.users && this.options.selectUser) {
          this.resetTree(data.users, list);
        }
        this.departmentsTotal = data.departmentsTotal
        this.usersTotal = data.usersTotal
        this.searchList = list;

        this.showLoading = false;
      })
  }

  /**
   * @desc 选人控件前台筛选
   * @param params 请求参数
   */
  processParams(params: any) {
    return params;

    const path = this.$route.path;
    // admin端不需要做处理
    if (path.includes("admin")) {
      return params;
    }
    let userInfo: any = sessionStorage.getItem("user");
    if (userInfo) {
      userInfo = JSON.parse(userInfo);
    }
    // 主组织可以看到关联组织的信息管理不能看到主组织的信息
    // MAIN 主
    // Re   关联组织
    if (userInfo.relatedOrgType === "MAIN") {
      // params.sourceType = 'admin'
    } else {
      delete params.sourceType;
    }
    // 表单有根节点的时候需要特殊处理
    if (this.isFirstLoad && path === "/form/detail") {
      const { deptIds } = params;
      this.isFirstLoad = false;

      // 如果说有根节点 需要删除sourceType参数
      if (deptIds) {
        delete params.sourceType;
      }
    }
    // 有根节点需要删除sourceType
    return params;
  }
}
