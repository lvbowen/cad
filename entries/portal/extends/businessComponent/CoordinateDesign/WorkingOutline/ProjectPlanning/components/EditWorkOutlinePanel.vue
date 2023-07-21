<template>
  <a-modal
    :visible="showEditWorkOutlinePanel"
    :footer="null"
    :keyboard="false"
    :maskClosable="false"
    :closable="true"
    wrapClassName="edit-work-outline-panel"
    :destroyOnClose="true">
    <div slot="title">
      <img src="../../../../../../src/assets/extends/coordinate/组3.png"/>
      <span class="title"> {{ modalTitle }}</span>
    </div>
    <template slot="closeIcon">
      <a-button type="primary" @click="save">{{ okText }}</a-button>
      <a-button v-if="showExtendButton" type="primary" @click="extendFn">{{ extendBtnText }}</a-button>
      <a-button @click="closeEditWorkOutlinePanel" class="cancel">取消</a-button>
    </template>
    <iframe :src="editorUrl" frameborder="0"></iframe>
    <div class="source flex flex-column">
      <div class="title flex flex-center-align">
        <span></span>
        知识资源库
      </div>
      <a-input-search
        placeholder="请输入关键字搜索"
        v-model="keyword"
        @pressEnter="enterSearch"
        @search="getList"></a-input-search>
      <div class="more-search-condition flex flex-space-between">
        <div>
          更多筛选条件
          <span v-if="!showDetailsCondition.length"><a-icon :type="showMoreCondition?'funnel-plot':'funnel-plot'" @click="showMoreCondition=!showMoreCondition"></a-icon></span>
          <span class="default-condition" v-else @click="showMoreCondition=!showMoreCondition">
            <a-icon type="funnel-plot"/>
            <span v-if="showDetailsCondition.length>1">{{ showDetailsCondition.length }}项</span>
            <span v-else>{{ `${showDetailsCondition[0].text}：${showDetailsCondition[0].selected}` }}</span>
            <a-icon type="close" @click.stop="resetCondition"/>
          </span>
        </div>
        <div class="condition-list" v-show="showMoreCondition">
          <div v-for="(item,index) in conditionConfig" :key="index" class="flex flex-center-align">
            <span class="condition-label">{{ item.text }}：</span>
            <template v-if="item.type==='select'">
              <base-select
                @changeValue="(val)=>handleChange(val,item)"
                :options="item.options"
                :showSearch="item.showSearch"
                :disabled="!item.disabled?false:item.disabled"
                :value="item.selected"/>
              <!--              <a-select @change="(val)=> handleChange(val,item)" :value="item.selected">-->
              <!--                <a-select-option-->
              <!--                  v-for="i in item.options"-->
              <!--                  :key="i"-->
              <!--                  :value="i">-->
              <!--                  {{ i }}-->
              <!--                </a-select-option>-->
              <!--              </a-select>-->
            </template>
            <template v-else-if="item.type==='input'">
              <a-input v-model="item.selected"/>
            </template>
            <template v-else-if="item.type==='inputNumber'">
              <a-input-number v-model="item.selected"/>
            </template>
          </div>
        </div>
        <div>
          <span @click="resetCondition" class="reset">重置</span>
          <a-button type="link" @click="()=> {pageNum = 0;getSourceList()}">确认</a-button>
        </div>
      </div>
      <div class="source-list flex-auto overflow-hidden">
        <a-spin :spinning="sourceLoading">
          <div class="content-list">
            <div
              v-for="(item,index) in sourceList"
              :key="index"
              @mouseenter="activeIndex=index"
              @mouseleave="activeIndex=-2">
              <div class="flex flex-space-between">
                <span class="file-name">{{ item.title }}</span>
                <span class="nowrap">
                  <!--                <a @click="contentCopy(item.paragraph)" v-show="activeIndex===index">复制</a>-->

                  <span class="bussiness" :style="{backgroundColor:bgBussiness[item.bussiness]}">{{ item.bussiness }}</span>
                  <span class="project-state" :style="{backgroundColor: bgProjectState[item.projectState]}">{{ item.projectState }}</span>
                  <span class="province" v-if="item.province" :style="{backgroundColor: bgProvince[item.province]}">{{ item.province }}</span>
                </span>
              </div>
              <!--            <a-tooltip :title="item.paragraph" placement="bottom">-->
              <a
                v-if="activeIndex===index"
                class="paragraph"
                @click="previewUrl(item.previewUrl,item.title)"
                v-html="item.paragraph"></a>
              <div v-else class="paragraph" v-html="item.paragraph"></div>
              <!--            </a-tooltip>-->
            </div>
          </div>
          <a-pagination
            :current="getPageNum"
            :pageSize="pageSize"
            :total="listTotal"
            @change="paginationChange"
            showLessItems ></a-pagination>
        </a-spin>
      </div>
    </div>
    <a-drawer
      :title="copyTitle"
      :visible="showPanel"
      width="1000"
      @close="showPanel=false"
      placement="right"
      :closable="false"
      wrapClassName="panel"
      :destroyOnClose="true">
      <iframe :src="iframePreviewUrl" frameborder="0"></iframe>
    </a-drawer>
  </a-modal>
</template>

<script lang="ts">
import {Vue, Component, InjectReactive, Prop, Watch} from 'vue-property-decorator';
import Modal from 'ant-design-vue/lib/modal';
import 'ant-design-vue/lib/modal/style/index.css';
import Button from 'ant-design-vue/lib/button';
import 'ant-design-vue/lib/button/style/index.css';
import Input from 'ant-design-vue/lib/input';
import 'ant-design-vue/lib/input/style/index.css';
import Popconfirm from 'ant-design-vue/lib/popconfirm';
import 'ant-design-vue/lib/popconfirm/style/index';
import Select from 'ant-design-vue/lib/select';
import 'ant-design-vue/lib/select/style/index.css';
import Divider from 'ant-design-vue/lib/divider';
import 'ant-design-vue/lib/divider/style/index.css';
import Popover from 'ant-design-vue/lib/popover';
import 'ant-design-vue/lib/popover/style/index.css';
import Tooltip from "ant-design-vue/lib/tooltip";
import "ant-design-vue/lib/tooltip/style/index.css";
import Spin from 'ant-design-vue/lib/spin';
import 'ant-design-vue/lib/spin/style/index.css';
import Drawer from 'ant-design-vue/lib/drawer';
import 'ant-design-vue/lib/drawer/style/index.css';
import Pagination from 'ant-design-vue/lib/pagination';
import 'ant-design-vue/lib/pagination/style/index.css';
import InputNumber from 'ant-design-vue/lib/input-number';
import 'ant-design-vue/lib/input-number/style/index.css';
import Icon from 'ant-design-vue/lib/icon';
import 'ant-design-vue/lib/icon/style/index.css';
import { getContentItemRule,getWorkOutlineConfirmModel } from "../../../../../service/api";
import { searchContentItem } from '../../../../../service/CoordinateDesign/documentLibrary';
import {DefineTypes, WorkOutlineSourceList} from "../../../../../type";
import {conditionConfig,extendConditionConfig} from "../../../publicConfig";
import {exampleData} from "../../../../engineeringArchives/mock";
import BaseSelect from "../../../../deviceManagement/BaseSelect.vue";
@Component({
  name: 'EditWorkOutlinePanel',
  components: {
    AModal: Modal,
    AButton: Button,
    AInputSearch: Input.Search,
    AInput: Input,
    AInputNumber: InputNumber,
    APopconfirm: Popconfirm,
    ASelect: Select,
    ASelectOption: Select.Option,
    ADivider: Divider,
    APopover: Popover,
    ATooltip: Tooltip,
    ASpin: Spin,
    ADrawer: Drawer,
    APagination: Pagination,
    BaseSelect,
    AIcon: Icon
  }
})
export default class EditWorkOutlinePanel extends Vue {
  @InjectReactive("project") projectCode?: string;
  @Prop() workOutlineDataId!:string;
  @Prop() wProjectName!:string;
  @Prop() editorUrl!:string;
  @Prop() defaultFileType!:string;
  @Prop() defaultBussiness!:string;
  @Prop() defaultProjectType!:string;
  @Prop() defaultProjectState!:string;
  @Prop() defaultProfessionType!:string;
  @Prop() defaultTitle!:string;
  @Prop() showEditWorkOutlinePanel!:boolean;
  @Prop() modalTitle!:string;
  @Prop() okText!:string;
  @Prop() showExtendButton!: boolean;
  @Prop() extendBtnText!: string;
  @Watch('showEditWorkOutlinePanel',{ deep: true})
  showEditWorkOutlinePanelListner(val) {
    if(val) {
      this.conditionConfig.map((i)=> {
        i.selected = ''
      })
      this.getContentItemRule();
    }
  }
  closeEditWorkOutlinePanel() {
    this.$emit('closeEditWorkOutlinePanel')
  }
  defaultCloseEditWorkOutlinePanel() {
    this.$emit('defaultCloseEditWorkOutlinePanel')
  }
  save() {
    this.$emit('saveEditFile')
  }
  extendFn() {
    this.$emit('extendFn')
  }
  //search
  get showDetailsCondition() {
    return this.conditionConfig.map((i)=>{ return {selected:i.selected,text:i.text}}).filter((j)=> {return j.selected!==''})
  }
  showMoreCondition: boolean = false;
  keyword: string = '';
  enterSearch(e) {
    this.keyword = e.target.value;
    this.pageNum = 0;
    this.getSourceList();
  }
  getList(keyword) {
    this.keyword = keyword;
    this.pageNum = 0;
    this.getSourceList();
  }
  conditionConfig: DefineTypes[] = [];
  copyConditionConfig: DefineTypes[] = [];
  getContentItemRule() {
    getContentItemRule({
      appCode: this.projectCode??''
    }).then((res)=> {
      if(res.errcode!==0) return this.$message.error(res.errmsg as string)
      if(!res.data) return;
      this.copyConditionConfig.map((item)=> {
        for (const dataKey in res.data) {
          if(item.field===dataKey) {
            if (res.data && res.data[dataKey]) {
              item.options = res.data[dataKey]
            }
          }
        }
      })
      this.conditionConfig = JSON.parse(JSON.stringify(this.copyConditionConfig));
      //初始化筛选条件
      if(this.defaultFileType){this.conditionConfig.filter((i)=> i.field==='fileTypes')[0].selected=this.defaultFileType}
      if(this.defaultBussiness){
        this.handleChange(this.defaultBussiness,this.conditionConfig.filter((i)=> i.field==='bussinesses')[0])
        // this.conditionConfig.filter((i)=> i.field==='bussinesses')[0].selected=this.defaultBussiness
      }
      if(this.defaultProjectType){this.conditionConfig.filter((i)=> i.field==='projectTypes')[0].selected=this.defaultProjectType}
      if(this.defaultProjectState){this.conditionConfig.filter((i)=> i.field==='projectStates')[0].selected=this.defaultProjectState}
      if(this.defaultProfessionType){this.conditionConfig.filter((i)=> i.field==='professionTypes')[0].selected=this.defaultProfessionType}
      if(this.defaultTitle){this.conditionConfig.filter((i)=> i.field==='title')[0].selected=this.defaultTitle}
      this.getSourceList()
    })
    console.log(this.conditionConfig,'conditg')
  }
  resetCondition() {
    this.pageNum = 0;
    this.keyword = '';
    this.conditionConfig.map((item) => {
      item.selected = ''
    })
    this.getSourceList()
  }
  colorArr:{bgBussiness:string[];bgProjectState:string[];bgProvince:string[]} = {
    bgBussiness:["#00C567", "#256EFF","#E271DE", "#F8456B", "#00FFFF", "#4AEAB0",'#177cb0','#426666','#21a675','#c83c23','#801dae','#8FBC8F','#008000','#7CFC00','#FAFAD2'],
    bgProjectState:['#9A00CB','#FFAE00','#3eede7','#f36838','#bddd22','#faff72','#f00056','#a1afc9','#ffc64b','#40de5a','#2edfa3'],
    bgProvince: ['#008000','#7CFC00','#3CB371','#90EE90','#8FBC8F','#FAFAD2','#f36838','#bddd22','#faff72','#F5DEB3','#FFDEAD','#FA8072','#A52A2A']
  }
  sourceLoading: boolean = false;
  sourceList: WorkOutlineSourceList[] =[];
  bgBussiness: { [propsName: string]: string } = {};
  bgProjectState: { [propsName: string]: string } = {};
  bgProvince: { [propsName: string]: string } = {};
  pageNum: number = 0;
  pageSize: number = 10
  listTotal: number = 0;
  paginationChange(page: number, pageSize: number) {
    this.pageNum = page-1;
    this.pageSize = pageSize;
    this.getSourceList();
  }
  get getPageNum() {
    return this.pageNum+1;
  }
  getSourceList() {
    this.showMoreCondition = false;
    this.sourceList = [];
    this.sourceLoading = true;
    searchContentItem({
      appCode: this.projectCode??'',
      // workOutlineId: this.workOutlineDataId,
      // projectName: this.wProjectName,
      keyWord:this.keyword,
      bussiness: this.conditionConfig.filter((i)=> i.field==='bussinesses')[0]?.selected??'',
      projectType: this.conditionConfig.filter((i)=> i.field==='projectTypes')[0]?.selected??'',
      fileType: this.conditionConfig.filter((i)=> i.field==='fileTypes')[0]?.selected??'',
      professionType: this.conditionConfig.filter((i)=> i.field==='professionTypes')[0]?.selected??'',
      projectState: this.conditionConfig.filter((i)=> i.field==='projectStates')[0]?.selected??'',
      pageNum: this.pageNum,
      pageSize: this.pageSize,
      title: this.conditionConfig.filter((i)=> i.field==='title')[0]?.selected??'',
      department: this.conditionConfig.filter((i)=> i.field==='department')[0]?.selected??'',
      province: this.conditionConfig.filter((i)=> i.field==='province')[0]?.selected??'',
      childFlag: true,
      startYear: this.conditionConfig.filter((i)=> i.field==='startYear')[0]?.selected??undefined,
      endYear: this.conditionConfig.filter((i)=> i.field==='endYear')[0]?.selected??undefined,
    }).then((res)=> {
      if(res.errcode!==0) return this.$message.error(res.errmsg as string)
      if(!res.data) return;
      this.sourceList = res.data.records??[];
      this.listTotal = res.data.total;
      const bussiness = this.unique(this.sourceList.map((i)=> i.bussiness))
      const projectState = this.unique(this.sourceList.map((i)=> i.projectState))
      const province = this.unique(this.sourceList.map((i)=> i.province))
      bussiness.map((b,index)=> {
        this.$set(this.bgBussiness,b,this.colorArr.bgBussiness[index])
      })
      projectState.map((p, index) => {
        this.$set(this.bgProjectState,p,this.colorArr.bgProjectState[index])
      })
      province.map((p, index) => {
        this.$set(this.bgProvince,p,this.colorArr.bgProvince[index])
      })
    }).finally(()=> {
      this.sourceLoading = false
    })
  }
  unique(arr){
    let newArr = [];
    for (let i = 0; i<arr.length; i++){
      //@ts-ignore
      if(arr[i] && newArr.indexOf(arr[i])===-1){
        //@ts-ignore
        newArr.push(arr[i]);
      }
    }
    return newArr;
  }
  handleChange(val:string,item:DefineTypes) {
    this.conditionConfig.map((i) => {
      if(i.field === item.field) {
        i.selected = val;
      }
    })
    //处理工程分类和工程类型的级联关系
    if (item.field==='bussinesses'){
      const types = this.conditionConfig.filter((i)=> i.field==='projectTypes')
      if (types.length) {
        if (!val){
          types[0].disabled = true;
          types[0].selected = '';
        }else {
          types[0].disabled = false;
          types[0].selected = '';
          // @ts-ignore
          this.copyConditionConfig.map((c)=> {
            if (c.field==='projectTypes') {
              //@ts-ignore
              const options = c.options.filter(( o)=> o.name===val)
              types[0].options = JSON.parse(JSON.stringify(options[0].value))
            }
          })
        }
      }
    }
  }
  activeIndex: number = -2;
  showCopyBtn: boolean = false;
  contentCopy ( content:string ) {
    const url = `${content}`; //复制的内容
    const oInput = document.createElement( 'input' );
    oInput.value = url;
    document.body.appendChild( oInput );
    oInput.select(); // 选择对象
    document.execCommand( 'Copy' ); // 执行浏览器复制命令
    this.$message.success('复制成功')
    oInput.remove();
  }
  //url
  iframePreviewUrl: string = '';
  showPanel: boolean = false;
  copyTitle: string = '';
  timeFn: any = null;
  previewUrl(url: string,title:string) {
    this.showPanel = true;
    this.copyTitle = title;
    this.iframePreviewUrl = url;
  }
  mounted() {
    this.copyConditionConfig = (conditionConfig as DefineTypes[]).concat(extendConditionConfig);
    this.getContentItemRule()
  }
}
</script>

<style scoped lang="less">
@import '../../../../../styles/public.module.less';
/deep/ .edit-work-outline-panel {
  .ant-modal {
    width: 100% !important;
    top: 0;
    height:100%;
    .ant-modal-header {
      background-color: #EAE8E8;
      .title {
        font-weight: bold;
        margin-left: @spacing-base;
      }
    }
    .ant-modal-content {
      .full-height;
      .flex;
      .flex-column;
      .ant-modal-close-x {
        width: auto;
        height: auto;
        .ant-btn {
          margin-right: @spacing-base;
        }
      }
      .cancel {
        background-color: #808080;
        color: #FFFFFF;
      }
      .ant-modal-body {
        .full-height;
        .flex;
        .overflow-hidden;
        iframe {
          height: calc(100% - 2 * @spacing-large);
          width: 73%;
        }
        .source {
          .flex-auto;
          height: calc(100% - 2 * @spacing-large);
          margin-left: @spacing-medium;
          .more-search-condition {
            margin: @spacing-base 0;
            position: relative;
            .default-condition {
              padding: 1/2 * @spacing-base 1/2 * @spacing-base;
              color: #2970ff;
              border: 1px solid #2970ff;
              border-radius: 4px;
              cursor: pointer;
              font-size: 12px;
              .anticon-close {
                margin-left: @spacing-base;
                &:hover {
                  opacity: 0.8;
                }
              }
            }
            .reset {
              cursor: pointer;
            }
            .ant-btn {
              margin-left: @spacing-base;
            }
            .condition-list {
              position: absolute;
              z-index: 10;
              width: 100%;
              top: 40px;
              background: whitesmoke;
              border: 1px solid #d9d9d9;
              padding: @spacing-large @spacing-medium;
              >div {
                margin-bottom: @spacing-base;
                .condition-label {
                  width: 100px;
                }
              }
              .base-select {
                .flex-auto;
                .ant-select {
                  width: calc(100% - @spacing-base)
                }
              }
              .ant-select,.ant-input,.ant-input-number {
                .flex-auto;
                margin-left: @spacing-base;
              }
            }
          }
          .source-list {
            font-size: 12px;
            .ant-spin-nested-loading {
              .full-height;
            }
            .ant-spin-container {
              .full-height;
              .flex;
              .flex-column;
              .content-list {
                .flex-auto;
                overflow: auto;
                margin-bottom: @spacing-base;
              }
              .content-list>div {
                border: 2px dotted #CBCBCB;
                border-radius: 4px;
                margin-bottom: @spacing-base;
                padding: 3/2 * @spacing-base;
                .file-name {
                  font-size: 14px;
                  font-weight: bold;
                  color: #666666;
                }
                .bussiness {
                  //background-color: #1BC373;
                  color: white;
                  padding: 1/4 * @spacing-base;
                  margin-right: @spacing-base;
                  margin-left: @spacing-large;
                  border-radius: 2px;
                }
                .project-state {
                  //background-color: #CBCBCB;
                  color: white;
                  padding: 1/4 * @spacing-base;
                  border-radius: 2px;
                }
                .province {
                  color: white;
                  padding: 1/4 * @spacing-base;
                  border-radius: 2px;
                  margin-left: @spacing-base;
                }
                .paragraph {
                  margin-top: @spacing-base;
                  overflow: hidden;
                  text-overflow: ellipsis;
                  width: 100%;
                  display: -webkit-box;
                  -webkit-box-orient: vertical;
                  -webkit-line-clamp: 3;
                  word-break: break-all;
                }
              }
            }
          }
        }
        .title {
          font-size: 18px;
          font-weight: bold;
          margin-bottom: @spacing-medium;
          >span {
            height: 18px;
            background-color: #256EFF;
            padding: 1.5px;
            margin-right: @spacing-base;
          }
        }
      }
    }
  }
}
.panel {
  /deep/ .ant-drawer-wrapper-body {
    .flex;
    .flex-column;
    .ant-drawer-body {
      .flex-auto;
      .overflow-hidden;
      iframe {
        height: 100%;
        width: 100%;
      }
    }
  }
}
</style>
