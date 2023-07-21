<template>
  <div class="todo-works flex flex-column">
    <!--    <div class="header flex-center-align">-->
    <!--      <div>我的待办</div>-->
    <!--    </div>-->
    <div class="work-card base-load-more">
      <h3-scroll :loadMore="getMyDesignTaskToDoList" :pageSize="pageSize">
        <div
          v-for="(workItem,index) in todoWorks"
          :key="index"
          @click="toDesignTask(workItem.id)"
          class="work">
          <div class="form">
            <div class="flex"><span class="form-label">项目名称：</span><span class="form-value">{{ workItem.engineeringName }}</span></div>
            <div class="flex"><span class="form-label">专业名称：</span><span class="form-value">{{ workItem.professionName }}</span></div>
            <div class="flex"><span class="form-label">设计任务名称：</span><span class="form-value">{{ workItem.professionTaskName }}</span></div>
            <div class="flex"><span class="form-label">创建人：</span><span class="form-value">{{ workItem.createrName }}</span></div>
            <div class="flex"><span class="form-label">创建时间：</span><span class="form-value">{{ workItem.createdTime }}</span></div>
            <div class="flex"><span class="form-label">当前节点：</span><span class="form-value">{{ workItem.workflowNode }}</span></div>
          </div>
        </div>
        <div class="inner" v-show="!loading">
          <div class="scroll-load">{{ totol === todoWorks.length ? '' : '向上滑动加载' }}</div>
        </div>
      </h3-scroll>
    </div>
  </div>
</template>

<script lang='ts'>
import {Vue, Component, Prop, InjectReactive} from 'vue-property-decorator';
import {utils} from "@cloudpivot/common";
import { TodoWorkItem } from "../../type";
import {exampleData} from "../appMaterialManage/mock";
import { getMyDesignTaskToDoList } from "../../service/api";
import mobile from "@cloudpivot/form/src/renderer/components/mobile";
@Component({
  name: 'TodoWorks',
  components: {
    H3Scroll: mobile.H3Scroll
  }
})
export default class TodoWorks extends Vue {
  @InjectReactive('project') appCode?: string;
  todoWorks: TodoWorkItem[] = [];
  pageNum: number = 1;
  pageSize: number = 5;
  totol: number = 0;
  loading: boolean = false;
  toDesignTask(id:string) {
    this.$router.push({
      name: 'DesignTaskDetail',
      query: {
        sjrwdId: id
      }
    })
  }
  getMyDesignTaskToDoList(page, done) {
    this.loading = true;
    if (page.num===1) {
      this.todoWorks = [];
    }
    getMyDesignTaskToDoList({
      appCode: this.appCode??'',
      pageNum: page.num,
      pageSize: this.pageSize
    }).then((res)=> {
      if(res.errcode!==0) return this.$message.error(res.errmsg as string)
      if(!res.data) return;
      this.totol = res.data.total;
      if (!(this.todoWorks.length>res.data.total)) {
        this.todoWorks = this.todoWorks.concat(res.data.records)
      }
    }).finally(()=> {
      if (done && typeof done === "function") done(this.pageSize, this.totol);
      this.loading = false
    })
  }
  mounted() {
    utils.Bus.$emit('toggleNavbar',false);
  }
}
</script>

<style lang='less' scoped>
@import '~@/styles/mixins.less';
@import '~@/styles/common.less';
@import './designTask.public.less';
.todo-works{
  text-align: left;
  height: inherit;
  background: @base-bg;
  @base-bg: #EBECF0;
  overflow: hidden;
  position: relative;
  .px2rem(font-size, 26);
  .work-card {
    flex: 1;
    overflow: auto;
    position: relative;
    .mescroll {
      position: absolute;
      top: 0;
      >.work {
        background: #FFFFFF;
        border: 1px solid #D0D1D5;
        box-shadow: 0 4px 8px 0 rgba(153, 153, 153, 0.1);
        border-radius: 6px;
        .px2rem(padding,@spacing-base);
        margin: 8px 16px;
      }
    }
  }
}
</style>
