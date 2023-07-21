<template>
  <div class="common-menu full-height overflow-hidden flex flex-column">
    <div class="flex inner overflow-hidden flex-auto">
      <div class="left full-height scrollbar-default" v-if="['todo','done'].includes(activeTaskKey)">
        <div>
          <div
            class="badge"
            v-for="type in taskTypes"
            :key="type.key"
            @click="changeTaskType(type.type)"
            :class="activeType===type.type?'active btn-click-active':''">
            <span class="task-name">
              {{ type.text }}
              <span class="value" v-if="type.value">{{ type.value }}</span>
            </span>
          </div>
        </div>
      </div>
      <div class="right flex-auto full-height overflow-hidden flex flex-column" :key="activeType">
        <div class="condition flex flex-space-between base-search-btn">
          <a-input-search
            v-model="keywords"
            placeholder="请输入项目名称或者任务名称"
            @pressEnter="pressEnterData"
            @search="searchData"/>
          <div class="flex flex-center">
            <!--        <span>节点名称：</span>-->
            <!--        <a-select placeholder="当前节点" @change="changeCurrentNodeName">-->
            <!--          <a-select-option v-for="(i,index) in currentNodeOptions" :key="index">{{ i }}</a-select-option>-->
            <!--        </a-select>-->
            <!--        <a-button type="primary" @click="resetCondition">重置</a-button>-->
            <!--        <base-select :options="currentNodeOptions" :value="currentNode" :showSearch="true"/>-->
          </div>
        </div>
        <to-do-works
          ref="todo"
          v-if="activeTaskKey==='todo'"
          :keywords="keywords"
          :nodeName="currentNode"
          :workflowType="activeType"/>
        <done-works
          ref="done"
          v-else-if="activeTaskKey==='done'"
          :keywords="keywords"
          :nodeName="currentNode"
          :workflowType="activeType"/>
        <doing-works
          ref="doing"
          v-else-if="activeTaskKey==='doing'"
          :keywords="keywords"
          :nodeName="currentNode"
          :workflowType="activeType"/>
      </div>
    </div>
  </div>
</template>

<script lang='ts'>
import {Vue, Component, Prop, Watch, InjectReactive} from 'vue-property-decorator';
import Input from 'ant-design-vue/lib/input';
import 'ant-design-vue/lib/input/style/index.css';
import Badge from 'ant-design-vue/lib/badge';
import 'ant-design-vue/lib/badge/style/index.css';
import Select from 'ant-design-vue/lib/select';
import 'ant-design-vue/lib/select/style/index.css';
import Button from 'ant-design-vue/lib/button';
import 'ant-design-vue/lib/button/style/index.css';
// import BaseSelect from "../../deviceManagement/BaseSelect.vue";
import { DefineTypes,WorkItemsNumber } from "../../../type";
import { taskTypes } from "../publicConfig";
import ToDoWorks from "./ToDoWorks.vue";
import DoneWorks from "./DoneWorks.vue";
import DoingWorks from "./DoingWorks.vue";
import { queryMyWorkItemsNumber,queryMyCompletedWorkNumber } from "../../../service/CoordinateDesign/myHomePage";
import {exampleData} from "../../engineeringArchives/mock";
@Component({
  name: 'CommonMenu',
  components: {
    ToDoWorks,
    DoneWorks,
    DoingWorks,
    AInputSearch: Input.Search,
    // BaseSelect,
    ABadge: Badge,
    ASelect: Select,
    ASelectOption: Select.Option,
    AButton: Button
  }
})
export default class CommonMenu extends Vue {
  @InjectReactive('project') projectCdoe!:string;
  @Prop() activeTaskKey!:string;
  @Watch('activeTaskKey', { deep: true,immediate: true})
  activeTaskKeyListener(val) {
    if (val) {
      this.keywords = '';
      this.currentNode = '';
      switch (val){
        case 'todo':
          this.activeType = JSON.parse(JSON.stringify(taskTypes.filter((i)=> (i.selected as string).indexOf('todo')>-1)))[0].type as string
          this.queryMyWorkItemsNumber();
          this.getTableData();
          break;
        case 'done':
          this.activeType = JSON.parse(JSON.stringify(taskTypes.filter((i)=> (i.selected as string).indexOf('done')>-1)))[0].type as string
          this.queryMyCompletedWorkNumber();
          this.getTableData();
          break;
        case 'doing':
          this.activeType = ''
          this.taskTypes = JSON.parse(JSON.stringify(taskTypes.filter((i)=> (i.selected as string).indexOf('doing')>-1)));
          this.getTableData();
          break;
      }
    }
  }
  //查询
  keywords: string = '';
  currentNodeOptions: string[] = [];
  currentNode: string = '';
  pressEnterData(e:any) {
    this.keywords = e.target.value;
    this.getTableData()
  }
  searchData(value:string) {
    this.keywords = value;
    this.getTableData()
  }
  // changeCurrentNodeName(key:string) {
  //   this.currentNode = key;
  //   this.getTableData();
  // }
  // resetCondition() {
  //   this.currentNode = '';
  //   this.keywords = '';
  //   this.getTableData();
  // }
  getTableData(type?:string) {
    switch (this.activeTaskKey) {
      case 'todo':
        if (type!=='menu'){
          //@ts-ignore
          if (this.$refs.todo) {
            //@ts-ignore
            this.$refs.todo.pageNum = 1;
            //@ts-ignore
            this.$refs.todo.tableKey++;
            //@ts-ignore
            this.$refs.todo.getToDoWorks()
          }
        }
        break;
      case 'done':
        if (type!=='menu'){
          //@ts-ignore
          if (this.$refs.done) {
            //@ts-ignore
            this.$refs.done.pageNum = 1;
            //@ts-ignore
            this.$refs.done.tableKey++;
            //@ts-ignore
            this.$refs.done.getDoneWorks()
          }
        }
        break;
      case 'doing':
        if (type!=='menu'){
          //@ts-ignore
          if (this.$refs.doing) {
            //@ts-ignore
            this.$refs.doing.pageNum = 1;
            //@ts-ignore
            this.$refs.doing.tableKey++;
            //@ts-ignore
            this.$refs.doing.getDoingWorks()
          }
        }
        break;
    }
  }
  changeTaskType(type:string) {
    this.activeType = type;
    this.keywords = '';
    this.getTableData('menu')
  }
  //left-menu
  activeType: string = '';//任务单类型 同DevicePositionNodes type
  taskTypes:DefineTypes[] = [];
  queryMyWorkItemsNumber() {
    this.taskTypes = JSON.parse(JSON.stringify(taskTypes.filter((i)=> (i.selected as string).indexOf('todo')>-1)))
    // const data = exampleData.response.data.myWorkItemsNumber;
    queryMyWorkItemsNumber({
      appCode: this.projectCdoe??''
    }).then((res)=> {
      if(res.errcode!==0) return this.$message.error(res.errmsg as string)
      if(!res.data) return;
      this.setWorkNumber(res.data as WorkItemsNumber)
    })
  }
  queryMyCompletedWorkNumber() {
    this.taskTypes = JSON.parse(JSON.stringify(taskTypes.filter((i)=> (i.selected as string).indexOf('done')>-1)))
    // const data = exampleData.response.data.myCompletedWorkNumber;
    queryMyCompletedWorkNumber({
      appCode: this.projectCdoe??''
    }).then((res)=> {
      if(res.errcode!==0) return this.$message.error(res.errmsg as string)
      if(!res.data) return;
      this.setWorkNumber(res.data as WorkItemsNumber)
    })
  }
  setWorkNumber(data:WorkItemsNumber) {
    for (let i = 0; i < this.taskTypes.length; i++) {
      for (const dataKey in data) {
        if (data[dataKey]&&this.taskTypes[i].field===dataKey) {
          this.taskTypes[i].value = data[dataKey]
        }
      }
    }
  }
  created() {
  }
}
</script>

<style lang='less' scoped>
@import '../../../styles/public.module.less';
.common-menu{
  >.inner {
    >.left {
      overflow: auto;
      padding:5/4 * @spacing-base 0 @spacing-base 0;
      .btn-click-active {
        & ::before {
          left: 0;
          right: 0;
        }
      }
      .badge {
        cursor: pointer;
        display: block;
        position: relative;
        //width: 200px;
        //padding:3/4 * @spacing-medium @spacing-base;
        //border: 1px solid #dcdfe6;
        //margin-bottom: 4/3 * @spacing-base;
        font-weight: bold;
        font-size: 15px;
        border-radius: 4px;
        transition: all 0.5s;
        //margin: @spacing-base 2 * @spacing-large;
        .text-center;
        border-bottom: 2px solid #ECEFF1;
        &:first-child {
          border-top: 2px solid #ECEFF1;
        }
        .task-name {
          display: block;
          margin:0 2 * @spacing-large+@spacing-medium 0 2 * @spacing-large;
          padding:@spacing-medium @spacing-base;
          position: relative;
          .value {
            position: absolute;
            right: -@spacing-base;
            top: @spacing-base;
            background: #f5222d;
            border-radius: 10px;
            box-shadow: 0 0 0 1px #fff;
            color: #fff;
            padding: 0 6px;
            font-size: 12px;
            font-weight: bold;
            white-space: nowrap;
            text-align: center;
          }
        }
      }
      .active {
        //background: linear-gradient(#409eff, #E5F1F9);
        background-color: #E5F1F9;
        color: #1890ff;
      }
    }
    >.right {
      margin-left: @spacing-base;
      >.condition {
        /deep/ .ant-input-search {
          width: 250px;
        }
      }
    }
  }
}
</style>
