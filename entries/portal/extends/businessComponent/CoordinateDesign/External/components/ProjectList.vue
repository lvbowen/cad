<template>
  <div>
    <div
      v-for="item in projectList"
      :key="item.id"
      class="projectListItem"
      @click="projectItemClick(item)">
      <div class="projectListItemTitle">
        <span>{{ item.title }}</span>
        <!-- <a-icon type="caret-down" /> -->
      </div>
      <div class="projectListItemBody clearfix">
        <div class="projectListItemBodyContent">
          <em>项目阶段：</em>
          <i style="color:#07AB35">{{ item.stage }}</i>
        </div>
        <div class="projectListItemBodyContent">
          <em>当前状态：</em>
          <i style="color:#A61EC8">{{ item.status }}</i>
        </div>
        <div class="projectListItemBodyContent">
          <em>开始日期：</em>
          <i style="color:#333333">{{ item.startTime }}</i>
        </div>
        <div class="projectListItemBodyContent">
          <em>截止日期：</em>
          <i style="color:#333333">{{ item.endTime }}</i>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
  import { Component, Vue, Prop } from 'vue-property-decorator';
  import {Icon} from "@h3/antd-vue";
  type record = {id:string,title:string,stage:string,status:string,startTime:string,endTime:string}
  @Component({
    name:"ProjectList",
    components:{
      [Icon.name]:Icon,
    }
  })
  export default class ProjectList extends Vue {
    @Prop({required:false,default:()=>[]}) projectList!:record[];

    projectItemClick(item:record){
      this.$emit("click",item);
    }
  }
</script>
<style lang="less" scoped>
@media screen and (min-width: 451px){
  .projectListItemBody{
    .projectListItemBodyContent{
      float: left;
      padding: 0 5px;
    }
  }
}
@media screen and (max-width: 450px){
  .projectListItemBody{
    display: flex;
    flex-flow: row wrap;
  }
}
@media screen and (max-width: 320px){
  .projectListItemBody{
    display: flex;
    flex-flow: column nowrap;
  }
}
.projectListItem{
  cursor: pointer;
  &:not(:last-child){
    border-bottom: 1px solid #F0F0F0;
  }

  &>:last-child{
    margin-bottom: 10px;
  }
  &:not(:first-child){
    margin-top: 10px;
  }
}
.projectListItemTitle{
  font-size: 17px;
  font-family: Source Han Sans CN;
  font-weight: 700;
  color: #333333;
  span{
    display: inline-block;
    width: calc(100% - 30px);
    overflow:hidden;
    text-overflow:ellipsis;
    white-space:nowrap
  }
}
.projectListItemBody{
  .projectListItemBodyContent{
    font-size: 14px;
    font-family: Source Han Sans CN;;
    color: #82828E;
    line-height: 30px;
    flex: 50%;
  }
}
/*清除浮动*/
.left{
  float: left;
}
.right{
  float: right;
}
.clearfix:before, .clearfix:after {
  content:"";
  display:table;
}
.clearfix:after{
  clear:both;
  overflow:hidden;
}
.clearfix{
  *zoom:1;
}
</style>
