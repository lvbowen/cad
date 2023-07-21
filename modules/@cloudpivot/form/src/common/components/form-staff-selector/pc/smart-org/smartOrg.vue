<template>
  <div class="h3-organization" :class="prefixCls" :style="prefixStyle">
    <div
      v-if="showSelect"
      class="h3-organization__label"
      :class="{ disabled:disabled, 'show-select': showSelect,'has-val':hasValue}"
      @click="focus"
      tabindex="1"
    >
      <span v-show="showSelect && !hasValue">{{ selectPlaceholder }}</span>
      <!-- 展示所有列表信息 -->
      <div v-if="!visiblePart">
        <div
          v-for="o in selectValue"
          :key="o.key"
          class="h3-organization-selected"
        >
          <i
            class="aufontAll"
            :class="[o.type === 'org' ? 'h-icon-all-team-o' : 'h-icon-all-user-o']"
          ></i>
          <div
            class="h3-organization-selected-name"
            :title="`${o.name}${o.departmentName?'-':''}${ o.departmentName }`"
          ><div>{{ o.name.length > 12 ? o.name.substr(0,12) + '...' : o.name }}</div><div class="department" v-if="o.departmentName">({{ o.departmentName }})</div></div>
          <template v-if="!checkExist(o.id)">
            <i v-show="!disabled" class="aufontAll h-icon-all-close" @click.stop="deleteItem(o)"></i>
          </template>
        </div>
      </div>
      <!-- 展示精简信息 -->
      <div v-if="visiblePart">
        <div class="h3-organization-selected showPartFont">
          <i class="aufontAll" :class="[ selectOrg ? 'h-icon-all-team-o' : 'h-icon-all-user-o']"></i>
          <div class="h3-organization-selected-name">已选择{{ selectValue.length }}个</div>
        </div>
      </div>

      <a-icon
        @click.stop="clear"
        type="close-circle delete"
        v-show="hover && hasValue && !disabled"
      />
    </div>
    <!-- <a-select
      v-show="showSelect"
      mode="multiple"
      :placeholder="selectPlaceholder"
      v-model="selectValue"
      :style="selectStyle"
      :allowClear="true"
      style="width:100%"

      @deselect="onDeselect"
      ref="select"
      :labelInValue="true"
      dropdownClassName="dropdownClassName"
    >
      <span slot="suffixIcon" class="aufontAll h-icon-all-department-o"></span>
      <a-select-option v-for="i in selectedData" :key="i.key">
        <i class="aufontAll h3-organization-select" :class="[i.type === 'org' ? 'h-icon-all-team-o' : 'h-icon-all-user-o']"></i>
        {{ i.name }}
      </a-select-option>
    </a-select>-->

    <a-modal
      v-model="visible"
      width="700px"
      :bodyStyle="{ padding: 0 }"
      :title="title !=='' ? title : defaultTitle"
      @cancel="onClickCancle"
      centered  
      :maskClosable="false"
      :keyboard="true"
    >
      <!-- 主体-->
      <div class="h3-organization-body" @click="hidePanel">
        <!--左边 选中组织区域-->
        <div class="h3-organization-body-left">
          <div class="role" v-if="selectUser">
            <span>专业</span>
            <a-select
              v-model="selectedMajors"
              mode="tags"
              showSearch
              @change="(val)=> changeValue('majors',val)"
              @mouseenter="isShowClearIcon=true"
              @mouseleave="isShowClearIcon=false">
              <template slot="suffixIcon">
                <a-icon type="down" v-if="!isShowClearIcon"/>
                <a-icon type="close" v-else @click="()=> changeValue('majors',[])"/>
              </template>
              <a-select-option v-for="major in majorsOptions" :key="major">
                <a-tooltip>
                  <template slot="title">
                    {{ major }}
                  </template>
                  {{ major }}
                </a-tooltip>
              </a-select-option>
            </a-select>
            <span>资格</span>
            <a-select
              v-model="selectedCertifications"
              mode="tags"
              showSearch
              @change="(val)=> changeValue('certifications',val)"
              @mouseenter="isShowClearIcon=true"
              @mouseleave="isShowClearIcon=false">
              <template slot="suffixIcon">
                <a-icon type="down" v-if="!isShowClearIcon"/>
                <a-icon type="close" v-else @click="()=> changeValue('certifications',[])"/>
              </template>
              <a-select-option v-for="qualification in certificationsOptions" :key="qualification">
                <a-tooltip>
                  <template slot="title">
                    {{ qualification }}
                  </template>
                  {{ qualification }}
                </a-tooltip>
              </a-select-option>
            </a-select>
            <a-button type="primary" size="small" @click="()=> {changeValue('majors',[]);changeValue('certifications',[])}">重置</a-button>
          </div>
          <!--搜索框 -->
          <div class="h3-organization-body-search">
            <a-icon type="search" class="h3-organization-body-search_icon" @click="onSearch" />

            <input
              ref="searchInput"
              v-model="searchKey"
              :placeholder="placeholder || `${t.SearchOrgUserRole}`"
              class="h3-organization-body-search_input"
              maxlength="200"
              @focus="searchFocus"
              @input="onSearch"
            />

            <a-icon
              style="color: #d4d4d4;"
              v-if="searchKey!=''"
              @click="clearInput()"
              type="close-circle"
              class="h3-organization-body-close-circle-icon"
            />

            <div
              v-if="searchList.length > 0 && !showLoading"
              id="myPanel"
              class="h3-organization-body-search-result"
            >
              <div
                :title="locale === 'zh' ? `符合查询条件的记录${total}条，返回${searchList.length}条` : `There are ${total} records that meet the query criteria, Return ${searchList.length} records`"
                class="h3-organization-search-title">
                <template v-if="locale === 'zh'">
                  符合查询条件的记录{{ total }}条，返回{{ searchList.length }}条
                </template>
                <template v-else>
                  There are {{ total }} records that meet the query criteria, and the first {{ searchList.length }}
                  records are returned
                </template>
                <!-- <span>{{locale}}{{ `${t.SearchResult}: ${searchUserNum}${t.Users}` }}，{{ `${searchOrgNum}${t.Orgs}` }}</span>
                <span>{{ `${searchList.length} ${t.ResultNum}` }}</span> -->
              </div>
              <div class="h3-organization-search-content" @scroll.passive="onScrollSearch">
                <div
                  v-for="item in searchList"
                  :key="item.key"
                  class="h3-organization-search-content-item"
                  @click="onSelecte(item)"
                >
                  <div class="h3-organization-search-content-item_checkbox">
                    <a-checkbox :checked="!!item.isSelected"></a-checkbox>
                  </div>
                  <div class="h3-organization-search-item-info">
                    <span
                      v-if="item.type === 'user'"
                      class="h3-organization-search-item-info_avatar"
                    >
                      <a-avatar
                        :size="24"
                        v-if="!!item.avatar && item.avatar.includes('http')"
                        :src="item.avatar"
                      />

                      <a-avatar
                        :size="20"
                        v-else-if="!!item.avatar"
                        :src="getDownloadUrl(item.avatar)"
                      />
                      <template v-else>{{ item.name.substr(item.name.length-1,1) }}</template>
                    </span>
                    <div class="h3-organization-search-item-info-main">
                      <span>{{ item.name }}</span>
                      <span :title="item.orglist">{{ item.orglist }}</span>
                    </div>
                  </div>
                </div>
                <slot name="searchFooter"></slot>
              </div>
            </div>

            <div
              v-if="showLoading"
              class="h3-organization-body-search-result h3-organization-body-search-result--nodata"
              style="zIndex: 99; paddingTop: 16px"
            >
              <a-icon type="loading" />
              <p>努力加载中...</p>
            </div>
            <div
              v-if="isSearching && showNosearchInfo"
              class="h3-organization-body-search-result h3-organization-body-search-result--nodata"
            >{{ t.NoInformations }}</div>
          </div>
          <!-- 组织树-->
          <div class="h3-organization-body-org">
            <!-- 面包屑导航-->
            <div class="h3-organization-body-org-breadcrumb">
              <div class="ant-breadcrumb">
                <span class="h3-organization-breadcrumb-item" @click="onClickTrunBack">
                  <span class="ant-breadcrumb-link">
                    <i class="aufontAll h-icon-all-rollback-o"></i>
                    {{ t.TurnBack }}
                  </span>
                  <span class="ant-breadcrumb-separator">/</span>
                </span>
                <span
                  class="h3-organization-breadcrumb-item"
                  v-for="(breadcrumb, index) in breadcrumbList"
                  :key="index"
                  @click="onClickBreadcrumb(breadcrumb)"
                >
                  <span class="ant-breadcrumb-link">{{ breadcrumb.name }}</span>
                  <span class="ant-breadcrumb-separator">/</span>
                </span>
              </div>
            </div>
            <!-- 组织树本树-->
            <div class="h3-organization-body-org-tree" @scroll.passive="onScrollChanged">
              <a-checkbox
                :indeterminate="indeterminate"
                @change="onCheckAllChange"
                :checked="checkAll"
                v-if="isMulpitle && showCheckAll"
              >{{ t.CheckAll }}</a-checkbox>
              <div v-for="o in currentPageOrg" :key="o.key" class="h3-organization-tree-item">
                <div class="h3-organization-tree-item_checkbox" :title="o.copyName || o.name">
                  <a-checkbox
                    :disabled="!o.hasPermission && isExport"
                    :checked="!!o.isSelected"
                    @change="onSelecte(o, arguments)"
                    v-if="o.type === 'org' && selectOrg"
                  >{{ o.copyName || o.name }}</a-checkbox>
                  <div
                    v-if="o.type === 'org' && !selectOrg"
                    class="ellipsis"
                  >{{ o.copyName || o.name }}</div>
                  <a-checkbox
                    :disabled="!o.hasPermission && isExport"
                    :checked="!!o.isSelected"
                    @change="onSelecte(o, arguments)"
                    v-if="o.type === 'user' && selectUser"
                  >
                    <a-avatar
                      :size="20"
                      v-if="!!o.avatar && o.avatar.includes('http')"
                      :src="o.avatar"
                    />

                    <a-avatar :size="20" v-else-if="!!o.avatar" :src="getDownloadUrl(o.avatar)" />
                    <a-avatar
                      v-else
                      icon="smile"
                      style="backgroundColor:#87d068;font-size:20px;width:20px;height:20px;line-height:20px;"
                    />
                    {{ o.copyName || o.name }}
                  </a-checkbox>
                </div>
                <div
                  v-if="o.type === 'org' && o.hasChild && !(o.isLeaf&&selectOrg&&!selectUser)"
                  :class="[!!o.isSelected && !allowRecursion ? 'h3-organization-tree-item_child--selected' : '', o.isLeaf&&selectOrg&&!selectUser?'h3-organization-tree-item_child--nochildren':'']"
                  class="h3-organization-tree-item_child"
                  @click="onClickNextHierarchy(o)"
                >
                  <i class="aufontAll h-icon-all-subordinate-o"></i>
                  {{ t.Subordinate }}
                </div>
              </div>
              <slot name="orgTreeFooter"></slot>
            </div>
          </div>
        </div>
        <!--右边 显示已选中的数据区域-->
        <div class="h3-organization-body-right">
          <div
            v-for="o in selectedList"
            :key="o.key"
            class="h3-organization-selected"
          >
            <i
              class="aufontAll"
              :class="[o.type === 'org' ? 'h-icon-all-team-o' : 'h-icon-all-user-o']"
            ></i>
            <div class="h3-organization-selected-name" :title="`${o.name}${o.departmentName?'-':''}${ o.departmentName }`"><div>{{ o.name }}</div><div class="department" v-if="o.departmentName">({{ o.departmentName.slice(0,1) }})</div></div>
            <template v-if="!checkExist(o.id)">
              <i class="aufontAll h-icon-all-close" @click="onDelectItem(o)"></i>
            </template>
          </div>
        </div>
        <!-- 自己创建的分组 -->
        <div class="myGroup" v-show="selectUser && breadcrumbList.length == []">
          <h3>我的分组</h3>
          <div class="addDelBtn">
            <a-button type="primary" @click="addMyGroup">新增分组</a-button>
            <a-button type="danger" @click="delMyGroup">{{ delImgText }}</a-button>
          </div>
          <a-tree
            :treeData="treeData"
            checkable
            v-model="isCheckedKeys"
            :replaceFields="defaultProps"
            @check= "treeCheck">
            <template slot="custome" slot-scope="item">
              <span>{{ item.name }}</span>
              <img
                v-if="delImgShow"
                @click="delClick(item)"
                class="iconImg"
                src="./img/del.png"
                alt="">
            </template>
          </a-tree>
        </div>
      </div>
      <!-- 尾部统计和按钮事件-->
      <div slot="footer" class="h3-organization-footer">
        <div>
          <a-button v-show="selectUser && breadcrumbList.length == []" type="primary" @click="selectMyGroup">添加至我的分组</a-button>
          <a-button type="default" @click="onClickCancle">{{ t.Cancel }}</a-button>
          <a-button type="primary" @click="ok">{{ t.Confirm }}</a-button>
        </div>
        <div v-if="selectedList.length > 0">{{ t.HasBeenselected }} {{ selectText }}</div>
      </div>
    </a-modal>
    <!-- 新增分组 -->
    <a-modal
      class="addGroup"
      @ok="addGroupOk"
      v-model="inputGroupShow"
      title="请输入分组名称">
      <input type="text" v-model="inputGroupName">
    </a-modal>
    <!-- 选择分组 -->
    <a-modal
      class="addGroup"
      @ok="selectGroupOk"
      v-model="selectGroupShow"
      title="请选择分组">
      <el-select v-model="groupValue" filterable placeholder="请选择分组">
        <el-option
          v-for="item in options"
          :key="item.value"
          :label="item.label"
          :value="item.value">
        </el-option>
      </el-select>
    </a-modal>
  </div>
</template>

<script lang="ts">
import { Component, Emit, Prop, Vue, Watch,InjectReactive } from 'vue-property-decorator';
import languages from './locale/index';
// @ts-ignore
import cloneDeep from 'lodash/cloneDeep'
import { Avatar, Button, Checkbox, Icon, Modal, Select,Tooltip } from '@h3/antd-vue';

import { StaticUtils } from '@cloudpivot/form/utils/utils';

import axios from "axios";
import Option from "element-ui/lib/option";
import ElSelect from "element-ui/lib/select";
import { Tree } from "@h3/antd-vue";
import env from '@/config/env'
import { Utils } from "@ctesi/core";
import {HttpResponse} from "@cloudpivot/api/src/response";
import { organizationApi } from "@cloudpivot/api";
@Component({
  name: 'SmartOrg',
  components: {
    AAvatar: Avatar,
    AIcon: Icon,
    AButton: Button,
    AModal: Modal,
    ASelect: Select,
    ASelectOption: Select.Option,
    ACheckbox: Checkbox,
    ATree: Tree,
    ElSelect: ElSelect,
    ElOption: Option,
    ATooltip: Tooltip
  },
})
export default class SmartOrg extends Vue {
  // prop接口
  @InjectReactive("project") appCode!: string;
  @Prop() prefixCls!: string;
  @Prop() prefixStyle!: string;
  @Prop() selectStyle!: any;

  @Prop({required:false,default:""}) projectId!:string;

  @Prop({
    type: Boolean,
    default: true,
  })
  showSelect!: boolean;
  @Prop({
    type: Boolean,
    default: false,
  })
  showModel!: boolean;

  @Prop({
    type: Boolean,
    default: false,
  })
  isExport!: boolean;

  @Prop({
    type: Boolean,
    default: false,
  })
  isDisplayRoot!: boolean;

  // 多选精简显示
  @Prop({
    type: Boolean,
    default: false,
  })
  showPart!: boolean;

  @Prop({
    type: String,
    default: '',
  })
  title!: string;
  @Prop({
    type: String,
    default: '',
  })
  placeholder!: string;
  @Prop({
    type: String,
    default: '',
  })
  orgName!: string;
  @Prop({
    type: String,
    default: '',
  })
  selectPlaceholder!: string;
  @Prop({
    type: Array,
    default: [],
  })
  org!: Array<any>;
  @Prop({
    type: Array,
    default: [],
  })
  searchData!: Array<any>;
  @Prop({
    type: Array,
    default: [],
  })
  selectedData!: Array<any>;
  @Prop({
    type: String,
    default: 'zh',
  })
  locale!: string;
  @Prop({
    type: Boolean,
    default: true,
  })
  isMulpitle!: boolean;
  @Prop({
    type: Boolean,
    default: true,
  })
  selectUser!: boolean;
  @Prop({
    type: Boolean,
    default: true,
  })
  selectOrg!: boolean;
  @Prop({
    type: Boolean,
    default: true,
  })
  allowRecursion!: boolean;

  @Prop({
    default: false,
  })
  disabled!: boolean;

  @Prop({ default: () => [] })
  keepDeptIds!: any[];

  @Prop({
    default: false,
  })
  showLoading!: boolean;

  @Prop({
    default: true,
  })
  isDisableClick!: boolean;


  visible: boolean = false;
  searchKey: any = '';
  checkAll: boolean = false;
  language: any = languages;

  breadcrumbList: Array<any> = [];
  selectedList: Array<any> = [];
  orgTreeList: Array<any> = [];
  currentPageOrg: Array<any> = [];
  searchList: Array<any> = [];
  isCheckedKeys: Array<any> = [];
  isSearching: boolean = false;
  hover: boolean = false;

  searchTaskRef: any;
  searchTaskRef2: any;

  showNosearchInfo: boolean = false;

  visiblePart: boolean = false; //显示精简列表

  // 搜索分页
  page: number = 0;
  size: number = 50;
  @Prop({
    type: Number,
    default: 0,
  })
  departmentsTotal!: number;
  @Prop({
    type: Number,
    default: 0,
  })
  usersTotal!: number;

  treeData: Array<any> = []

  defaultProps: Object = {
     children: 'users',
     key: 'id',
     title: 'name'
   }

   inputGroupName: string = ""
   groupValue: string = ""
   delImgText: string = "删除分组"
   inputGroupShow: boolean = false
   selectGroupShow: boolean = false
   delImgShow: boolean = false
   options: Array<any> = []
   userIdList: Array<any> = []
   IP: string = env.apiHost

   slotAdapter(datas) {
    if (!Array.isArray(datas)) return;
    Utils.deepFind(
      datas,
      (item) => {
        item.scopedSlots = { title: "custome" };
        return false;
      },
      "users"
    );
  }

   treeCheck(val,vals){
     this.userIdList = val
     const info = vals.node.$vnode.data.props;
     if(!info.groupName) {
       const obj = {
        id: info.id,
        key: info.id,
        name: info.name,
        source: info,
        isSelected: !vals.checked,
        type: "user"
      }
      this.onSelecte(obj, 1)
     }else {
      info.users.forEach(e => {
        e.key = e.id
      });
      const arr = this.filterSelect(info.users,this.selectedList);
      if(vals.checked) {
        arr.forEach(e => {
        const a = {
          id: e.id,
          key: e.id,
          name: e.name,
          source: e,
          isSelected: !vals.checked,
          type: "user"
        }
        this.onSelecte(a, 1)
        });
      }else {
        info.users.forEach((item: any) => {
          this.delectItem(item, this.selectedList);
        });
      }
     }
   }

   selectMyGroup(){
     if(this.selectedList.length == 0) return this.$message.warning("请先添加人员")
     this.selectGroupShow = true
   }

   selectGroupOk(){
     const userIds = []
     this.selectedList?.forEach(e => {
     // @ts-ignore
       userIds.push(e.id)
     });
     const cmd = {
       id: this.groupValue,
       userIds: userIds
     }
     axios.put( this.IP + '/api/define/department/addMyGroupUsers', cmd)
      .then(res => {
        if(res.data == "成功") {
          this.$message.success('成功添加');
          this.selectGroupShow = false
          this.getTreeData()
        }
      })
   }

   addMyGroup(){
     this.inputGroupShow = true
   }

   delClick(val){
    if(val.dataRef.groupId) {
      //删人
      const cmd = {
        groupId: val.dataRef.groupId,
        userId: val.dataRef.id,
      }
      axios.post( this.IP + '/api/define/department/delMyUserGroup',cmd)
      .then(res => {
        this.getTreeData()
      })
    }else {
      //删组
      const cmd = {
        groupId: val.dataRef.id,
      }
      axios.post( this.IP + '/api/define/department/delMyUserGroup',cmd)
      .then(res => {
        this.getTreeData()
      })
    }
   }
   
   delMyGroup(){
     if(this.delImgText == "删除分组") {
       this.delImgShow = true
       this.delImgText = "取消删除"
     }else {
       this.delImgShow = false
       this.delImgText = "删除分组"
     }
   }

   addGroupOk(){
     if(!this.inputGroupName) return
     axios.post( this.IP + '/api/define/department/addMyUserGroup', {
          appCode: this.appCode??sessionStorage.getItem('appCode') as string,
          groupName: this.inputGroupName
      })
      .then(res => {
        this.inputGroupShow = false
        this.getTreeData()
      })
   }

   getTreeData(){
    this.treeData = [];
    axios.get( this.IP + '/api/define/department/getMyUserGroups', {
       params: {
         appCode: this.appCode??sessionStorage.getItem('appCode') as string,

       }
     })
     .then(res => {
       res.data.forEach(e => {
         e.name = e.groupName
         if(!this.isMulpitle) {
           e.disabled = true
         }
       });
       this.slotAdapter(res.data);
      //  this.treeData = res.data
       this.treeData.push(...res.data);
       //设置选择项
       this.selectedList.forEach(e => {
         this.isCheckedKeys.push(e.id)
       });
       //分组名称集合
       this.options = res.data.map((item=>{
         return {
           value: item.id, label: item.name
         }
       }))
     })
     if(this.projectId) this.getTreeData2();
   }

   async getTreeData2(){
    try {
      const {errcode,errmsg,data} = await axios.get<HttpResponse<any>>( this.IP + '/api/xtsjProject/projectMember/getMyUserGroups', {params: {appCode: this.appCode??sessionStorage.getItem('appCode') as string,projectId:this.projectId,role:""}}) as HttpResponse<any>;
      if(errcode){
        return this.$message.error(`获取项目人员分组失败,${errmsg}`);
      }
      data.forEach(e=>{
        e.name = e.groupName
        if(!this.isMulpitle) {
          e.disabled = true
        }
      });
      this.treeData.unshift(...data);
    } catch (error) {
      return this.$message.error(`获取项目人员分组异常,${error}`);
    }
   }

  mounted() {
    this.currentPageOrg = this.deepClone(this.org);
    this.selectedList = this.deepClone(this.selectedData);
    this.initSelectItem(this.currentPageTarget);
    this.visiblePart = false;
    this.handleShowPartData();
    // 有默认值和映射关系
    this.$emit('change', this.selectedList);
  }

  get t(): any {
    return (languages as any)[this.locale];
  }

  get hasValue() {
    return this.selectedData && this.selectedData.length > 0;
  }

  get selectValue(): any {
    return this.selectedData;
  }
  set selectValue(val: any) {
    this.$emit('change', val);
  }
  get indeterminate(): boolean {
    const hasSelectItem =
      this.currentPageTarget.filter((i: any) => i.isSelected) || [];
    return (
      hasSelectItem.length > 0 &&
      hasSelectItem.length < this.currentPageTarget.length
    );
  }
  get selectedOrgNum(): number | string {
    return this.countNumber(this.selectedList, 'org');
  }
  get selectedUserNum(): number | string {
    return this.countNumber(this.selectedList, 'user');
  }
  get searchOrgNum(): number | string {
    if (this.departmentsTotal > 0) {
      return this.departmentsTotal > 999
          ? `${this.departmentsTotal / 10000}万`
          : this.departmentsTotal;
    } else {
      return this.countNumber(this.searchList, 'org');
    }
  }
  get searchUserNum(): number | string {
    if (this.usersTotal > 0) {
      return this.usersTotal > 999
          ? `${this.usersTotal / 10000}万`
          : this.usersTotal;
    } else {
      return this.countNumber(this.searchList, 'user');
    }
  }
  get defaultTitle(): string {
    return this.selectUser
      ? this.selectOrg
        ? this.t.UserAndOrg
        : this.t.SelectUser
      : this.t.SelectOrg;
  }
  get currentPageUsers(): any {
    return this.currentPageOrg.filter((i) => i.type === 'user');
  }
  get currentPageDepartment(): any {
    return this.currentPageOrg.filter((i) => i.type === 'org');
  }
  get currentPageTarget(): any {
    if (this.selectUser && !this.selectOrg) {
      return this.currentPageUsers;
    } else if (!this.selectUser && this.selectOrg) {
      return this.currentPageDepartment;
    } else if (this.selectUser && this.selectOrg) {
      return this.currentPageOrg;
    }
    return [];
  }

  get selectText() {
    let text = '';
    if (this.selectOrg) {
      text = `${this.selectedOrgNum} ${this.t.Orgs}`;
    }
    if (this.selectUser) {
      if (text.length > 0) {
        text += ', ';
      }
      text += `${this.selectedUserNum} ${this.t.Users}`;
    }
    return text;
  }

  get apiHost() {
    return (window as any).config.apiHost;
  }

  get token() {
    return window.localStorage.getItem('token');
  }

  //是否显示全选框，若当前页没有可选数据，则隐藏
  get showCheckAll() {
    const checkboxList: any = this.currentPageOrg.filter(
      (item) =>
        (item.type === 'org' && this.selectOrg) ||
        (item.type === 'user' && this.selectUser)
    );

    return !!checkboxList.length;
  }

  getDownloadUrl(refId: string) {
    let url = `${this.apiHost}/api/aliyun/download?refId=${refId}`;
    if (this.token) {
      url += '&access_token=' + this.token;
    }
    return url;
  }

  // 总条数
  get total() {
    if (this.selectUser && this.selectOrg) {
      return this.departmentsTotal + this.usersTotal
    } else {
      if (this.selectUser) {
        return this.usersTotal
      }
      if (this.selectOrg) {
        return this.departmentsTotal
      }
    }
    return '0'
  }

  // 点击人员搜索结果外的空白区域隐藏浮层
  hidePanel(event: any) {
    var sp = document.getElementById('myPanel');
    if (sp) {
      if (!sp.contains(event.target)) {
        this.searchList = [];
        this.isSearching = false;
      }
    }
  }
  
  //调用精简显示操作函数
  handleShowPartData() {
    if (this.showPart) {
      this.$nextTick(() => {
        if (this.selectedList.length > 1) {
          this.visiblePart = true;
        } else {
          this.visiblePart = false;
        }
      });
    } else {
      this.visiblePart = false;
    }
  }

  @Watch('selectValue')
  onselectValueChange() {
    this.handleShowPartData();
  }

  @Watch('showPart')
  onShowPartChange() {
    this.handleShowPartData();
  }
  /**
   * 清楚操作
   */
  clear() {
    // this.selectValue = [];
    // this.selectedList = [];
    this.visiblePart = false;
    this.selectValue = [];
    // this.$emit('change', this.selectValue);
  }
  clearInput() {
    this.searchKey = '';
  }

  checkExist(id: string): boolean {
    const { keepDeptIds } = this;
    return keepDeptIds.includes(id);
  }

  deleteItem(item: any) {
    if (this.disabled) {
      return;
    }

    const isExist: boolean = this.checkExist(item.id);
    if (isExist) return;

    this.visiblePart = false;
    this.selectValue = this.selectValue.filter((res: any) => {
      return res.key !== item.key;
    });
    this.handleShowPartData();
    // this.$emit('change', this.selectValue);
    // debugger
  }
  // 工具函数
  deepClone(obj: any) {
    // const objClone: any = Array.isArray(obj) ? [] : {};
    // if (obj && typeof obj === 'object') {
    //   for (const key in obj) {
    //     if (obj.hasOwnProperty(key)) {
    //       if (obj[key] && typeof obj[key] === 'object') {
    //         objClone[key] = this.deepClone(obj[key]);
    //       } else {
    //         objClone[key] = obj[key];
    //       }
    //     }
    //   }
    // }
    // return objClone;
    return cloneDeep(obj);
  }
  filterSelect(pushObj: any, targetObj: any = this.selectedList) {
    return pushObj.filter((pushItem: any) => {
      if (this.isExport) {
        return (
          !targetObj.some((item: any) => item.key === pushItem.key) &&
          pushItem.hasPermission
        );
      } else {
        return !targetObj.some((item: any) => item.key === pushItem.key);
      }
    });
  }
  setSelectList(targetObj: any, push: boolean = true) {
    if (push) {
      const pushItem = this.filterSelect(this.deepClone(targetObj));
      this.selectedList = [...this.selectedList, ...pushItem];
    } else {
      targetObj.forEach((item: any) => {
        this.delectItem(item, this.selectedList);
      });
    }
    targetObj.forEach((i: any) => (i.isSelected = push));
  }
  setSingleItem(item: any) {
    this.selectedList.every((i: any) => (i.isSelected = false));
    this.onDeselect(
      this.currentPageTarget.find(
        (o: any) => !!o.isSelected && o.key !== item.key
      )
    );
    this.selectedList = [item];
  }
  delectItem(
    item: any,
    list: Array<any> = [],
    length = 1,
    above: boolean = false
  ) {
    if (list.length === 0) return;
    const index = list.findIndex((i: any) => i.key === item.key);
    const end = list.length - index;
    if (above) {
      list.splice(index + 1, end);
    } else {
      list.splice(index, length);
    }
    this.isCheckedKeys = []
    this.selectedList.forEach(e => {
      this.isCheckedKeys.push(e.id)
    });
  }
  countNumber(targetList: Array<any> = [], type: string) {
    const num = targetList.filter((i: any) => i.type === type).length;
    if (num > 999) {
      return `${num / 10000}万`;
    }
    return num;
  }
  initSelectItem(targetList: Array<any> = []) {
    targetList.forEach((i: any) => {
      const selected = this.selectedList.some((o: any) => o.key === i.key);
      if (selected) {
        this.$set(i, 'isSelected', true);
      } else {
        this.$set(i, 'isSelected', false);
      }
    });
  }

  // 销毁时重置搜索
  distory() {
    this.isSearching = false;
    this.searchKey = '';
    this.searchList = [];
  }
  // Dom操作绑定函数
  focus() {
    if (this.selectUser) {
      this.getJobQualificationDropbox();
    }
    if (this.disabled) {
      return;
    }

    this.$emit('focus', this.orgName);
    // this.$emit('focus', this.$refs.select);
    this.visible = true;

    if(this.selectUser) {
      this.getTreeData()
    }
    // eslint-disable-next-line
    // (this.$refs.select as any).blur();
  }

  // test() {
  //   debugger
  //   this.visible = true;
  // }

  //删除已选中的目标时同时更新搜索和当前页的list
  onDeselect(value: any) {
    if (!value) return;
    const deselectItem = this.currentPageTarget.find(
      (o: any) => value.key === o.key
    );
    const deselectItemSearch = this.searchList.find(
      (o: any) => value.key === o.key
    );
    if (deselectItem) {
      deselectItem.isSelected = false;
    }
    if (deselectItemSearch) {
      deselectItemSearch.isSelected = false;
    }
  }
  onCheckAllChange(value: any) {
    this.checkAll = value.target.checked;
    if (this.checkAll) {
      this.setSelectList(this.currentPageTarget);
    } else {
      this.setSelectList(this.currentPageTarget, false);
    }
  }
  onSelecte(item: any, val: any) {
    if (item.isSelected) {
      this.$set(item, 'isSelected', false);
      this.delectItem(item, this.selectedList);
    } else {
      if (this.isMulpitle){
        this.selectedList.push(item);
      } else {
        this.searchList.forEach((x: any) => (x.isSelected = false));
        this.setSingleItem(item);
      }
      this.isCheckedKeys = []
      this.selectedList.forEach(e => {
        this.isCheckedKeys.push(e.id)
      });
      this.$set(item, 'isSelected', true);
    }
    this.checkAll = this.currentPageTarget.every((i: any) => i.isSelected);
  }
  onDelectItem(item: any) {
    const isExist: boolean = this.checkExist(item.id);
    if (isExist) return;
    this.delectItem(item, this.selectedList);
    this.onDeselect(item);
    this.checkAll = this.currentPageTarget.every((i: any) => i.isSelected);
  }

  // 接口事件
  @Emit('searchFocus')
  searchFocus(val: any) {
    return val;
  }
  // @Emit('searchChange')
  // searchChange(val: any) {
  //   if (this.searchKey === '') {
  //     this.searchList = [];
  //   }
  //   this.$emit('searchChange', this.searchKey);
  //   // return this.searchKey;
  // }
  // @Emit('onSearch')

  onSearch() {
    StaticUtils.debound(() => {
      clearTimeout(this.searchTaskRef);

      if (this.searchKey === '') {
        this.searchList = [];
        return;
      }

      if (this.showLoading) return;

      this.searchTaskRef = setTimeout(() => {
        this.isSearching = true;
        this.$emit('onSearch', this.searchKey);
      }, 500);
    }, 1000);
    // return this.searchKey;
  }
  // @Emit('searchBlur')
  // searchBlur(val: any) {
  //   // this.isSearching = false;
  //   return val;
  // }
  @Emit('cancle')
  onClickCancle() {
    this.breadcrumbList = [];
    this.visible = false;
    this.distory();
    this.selectedList = this.deepClone(this.selectedData);
    this.isCheckedKeys = []
    this.selectedList.forEach(e => {
      this.isCheckedKeys.push(e.id)
    });
    this.initSelectItem(this.currentPageTarget);
  }
  // @Emit('ok')
  ok() {
    this.breadcrumbList = [];
    this.visible = false;
    this.distory();
    this.$emit('ok', this.selectedList);
    this.visiblePart = false;
    this.handleShowPartData();
    // return this.selectedList;
  }
  @Emit('onClickTrunBack')
  onClickTrunBack() {
    this.breadcrumbList = [];
  }
  // @Emit('onClickBreadcrumb')
  onClickBreadcrumb(item: any) {
    if (this.isDisableClick === true) {
      this.$message.error('请等待数据返回');
      return;
    }
    this.delectItem(
      item,
      this.breadcrumbList,
      this.breadcrumbList.length,
      true
    );
    this.$emit('onClickBreadcrumb', item);
    return item;
  }

  @Emit('onOrgTreeScroll')
  onScrollChanged(val: any) {
  }

  @Emit('onSearchListScroll')
  onScrollSearch(e: any) {

  }

  // @Emit('onClickNextHierarchy')
  onClickNextHierarchy(val: any) {
    // debugger
    // debugger
    // this.t
    if (this.isDisableClick === true) {
      this.$message.error('请等待数据返回');
      return;
    }
    if (val.isLeaf && this.selectOrg && !this.selectUser) return;

    // console.log('rrrrrr',val)
    // 如果设置允许递归则展示
    if (!this.allowRecursion && val.isSelected) return;

    if (this.breadcrumbList.length > 0) {
      const last = this.breadcrumbList[this.breadcrumbList.length - 1];
      if (last.key === val.key) {
        return;
      }
    }

    this.breadcrumbList.push(val);
    this.$emit('onClickNextHierarchy', val);
    // return val;
  }

  @Watch('org')
  onOrgChanged(val: any, oldVal: any) {
    this.currentPageOrg = this.deepClone(val);
    this.initSelectItem(this.currentPageTarget);
  }

  @Watch('searchData')
  onSearchListChanged(val: any, oldVal: any) {
    this.searchList = this.deepClone(val);
    if (this.searchList.length === 0) {
      this.showNosearchInfo = true;
    } else {
      this.showNosearchInfo = false;
    }
    // 在改变之前筛选已经被选中的元素 设置isSelecte
    this.initSelectItem(this.searchList);
  }
  @Watch('selectedData')
  initSelectedList(val: any, oldVal: any) {
    this.selectedList = this.deepClone(val);
    this.isCheckedKeys = []
    this.selectedList.forEach(e => {
      this.isCheckedKeys.push(e.id)
    });
  }
  @Watch('showModel')
  changeModelStatus(val: any, oldVal: any) {
    this.visible = val;
    if (val) {
      this.focus();
    }
  }
  @Watch('currentPageOrg')
  selectAll(val: any, oldVal: any) {
    // if(this.selectUser) {
    //   this.getTreeData()
    // }
    let isSelectAll = false;
    let temData: any[] = [];
    // 解决 添加子管理员时，部门列表为空时，也全选上的问题（负责人：周龙秋）20200515
    // 解决全选问题 （负责人：郑传强）20200602
    if (val.length) {
      const { selectOrg, selectUser } = this;
      if (selectOrg && !selectUser) {
        // 只选组织org
        temData = val.filter((v:any) => v.type === 'org');
      } else if (!selectOrg && selectUser) { // 只选人 user
        temData = val.filter((v:any) => v.type === 'user');
      } else {
        // 两者均选
        temData = val;
      }
      isSelectAll = temData.every((item: any) => item.isSelected);
    }

    if (temData.length <= 0) {
      isSelectAll = false;
    }
    this.checkAll = isSelectAll;
  }
  @Watch('searchKey')
  clearSearchKey(val: any, oldVal: any) {
    if (val === '') this.distory();
  }
  //TODO 任职资格 start
  @Prop() majors!:string;
  @Prop() certifications!:string;
  selectedMajors: string[] = [];
  majorsOptions: string[] = [];
  selectedCertifications: string[] = [];
  certificationsOptions: string[] = [];
  isShowClearIcon: boolean = false;
  getJobQualificationDropbox() {
    this.selectedMajors = [];
    this.majorsOptions = [];
    this.selectedCertifications = [];
    this.certificationsOptions = [];
    organizationApi.getJobQualificationDropbox(this.appCode??sessionStorage.getItem('appCode') as string).then((res)=> {
      if(res.errcode!==0) return this.$message.error(res.errmsg as string)
      if(!res.data) return;
      this.majorsOptions = res.data.majors;
      this.certificationsOptions = res.data.certifications;
      this.majors?this.selectedMajors = this.majors.split(','):''
      this.certifications?this.selectedCertifications = this.certifications.split(','):''
    })
  }
  changeValue(type:string,value:any[]|string) {
    switch (type) {
      case 'majors':
        this.selectedMajors = value as string[];
        this.$emit('changeRoles',{ majors: this.selectedMajors.join(',')});
        this.onClickTrunBack()
        break;
      case 'certifications':
        this.selectedCertifications = value as string[];
        this.$emit('changeRoles',{ certifications: this.selectedCertifications.join(',')});
        this.onClickTrunBack()
        break;
    }
  }
  //TODO end
}
</script>

<style lang="less">
@import './style/index.less';
</style>
<style lang="less" scoped>
/deep/.h3-organization-selected {
  color: rgba(0, 0, 0, 0.65);
  .department {
    font-size: 12px;
    opacity: 0.8;
    display: inline-block;
    width: auto;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    color: rgba(0, 0, 0, 0.65);
  }
}
/deep/ .h3-organization-selected-name {
  display: flex !important;
  align-items: center;
}
/deep/.showPartFont {
  padding: 0 8px;
}

/deep/ .h3-organization-body-left .h3-organization-body-search-result .h3-organization-search-title {
  width: 100%;
  height: 35px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/deep/ .h3-organization-body-left .h3-organization-body-org-tree {
  .ellipsis {
    display: inline-block;
    max-width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .ant-checkbox-wrapper {
    width: 100%;
  }
  .h3-organization-tree-item_checkbox .ant-checkbox + span {
    vertical-align: middle;
    line-height: 1.2;
    top: -0.09em;
    position: relative;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    width: 100%;
    display: inline-block;
  }
}
.myGroup {
  width: 30%;
  padding: 10px;
  .addDelBtn {
    display: flex;
    justify-content: space-around;
    margin-bottom: 10px;
    /deep/.ant-btn{
      font-size: 12px;
      padding: 0 7px;
      height: 28px;
    }
  }
  /deep/.ant-tree {
    height: 360px;
    overflow-y: auto;
  }
  .iconImg {
    width: 16px;
    height: 16px;
    display: inline-block;
    margin-left: 5px;
    cursor: pointer;
  }
}
/deep/.ant-modal-content {
  width: 900px;
}
.addGroup {
  input {
    box-sizing: border-box;
    margin: 0;
    font-variant: tabular-nums;
    list-style: none;
    font-feature-settings: "tnum";
    position: relative;
    display: inline-block;
    width: 100%;
    height: 32px;
    padding: 4px 11px;
    color: rgba(0,0,0,.65);
    font-size: 14px;
    line-height: 1.5;
    background-color: #fff;
    background-image: none;
    border: 1px solid #d9d9d9;
    border-radius: 4px;
    transition: all .3s;
  }
  /deep/.ant-modal-content {
    width: 520px;
  }
  /deep/.ant-modal {
    left: 100px;
    top: 375px;
  }
}
.role {
  padding: 8px 0 0 24px;
  display: flex;
  align-items: center;
  > .ant-select {
    width: 100px;
    margin-left: 8px;
    margin-right: 16px;
    /deep/ .ant-select-selection {
      height: 32px;
      overflow: auto;
    }
  }
}
</style>
