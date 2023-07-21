<template>
  <div>
    <div class="ProjectTask">
      <UserInfo @init="queryProjectByPC"></UserInfo>
      <SearchFilter
        class="SearchFilter"
        :filterOptions="filterOptions"
        :filters="filters"
        @search="onSearch"
        @filterChange="onFilterChange"></SearchFilter>
      <ProjectList class="ProjectList" :projectList="projects" @click="projectItemClick"></ProjectList>
    </div>

  </div>
</template>

<script lang="ts">
  import { Component, Vue, InjectReactive,Watch } from 'vue-property-decorator';
  import SearchFilter from "../components/SearchFilter.vue";
  import ProjectList from "../components/ProjectList.vue";
  import UserInfo from "../components/UserInfo.vue";
  import {projectByPC} from "../../../../service/CoordinateDesign/External";

  @Component({
    name:"ProjectTask",
    components:{
      SearchFilter,
      ProjectList,
      UserInfo
    }
  })
  export default class ProjectTask extends Vue {
    @InjectReactive("project") appCode!: string;

    keywords="";

    projects:{id:string,title:string,stage:string,status:string,startTime:string,endTime:string}[]=[];

    filterOptions=[
      {label:"开始",value:"1"},
      {label:"进行中",value:"2"},
      {label:"结束",value:"3"},
    ]

    filters:string[]=[];

    created(){
      this.queryProjectByPC();
    }

    projectItemClick(record:{id:string}){
      console.log("projectItemClick",record);
      this.$router.push({
        name:"OldProjectItemList",
        query:{
          projectId:record.id,
          //@ts-ignore
          projectName:record.title
        }
      });
    }

    async queryProjectByPC(){
      const { appCode, keywords:projectName } = this;
      try {
        const { errcode,errmsg,data } = await projectByPC({appCode,projectName:projectName?projectName:null});
        if(errcode){
          return this.$message.error(`查询项目清单失败,${errmsg}`);
        }
        this.projects = data?.map(item=>{
          return{
            id:item.id,
            stage:item.engineeringStage,
            status:item.manufactureStatus,
            title:item.engineeringName,
            startTime:item.planStartTime,
            endTime:item.planEndTime
          }
        })??[]
      } catch (error) {
        return this.$message.error(`查询项目清单异常,${error}`);
      }
    }

    onSearch(keywords:string){
      this.keywords = keywords;
      this.queryProjectByPC();
    }

    onFilterChange(filters:string[]){
      console.log("onFilterChange",filters);
    }
  }
</script>

<style lang="less" scoped>
.bpm-container{
  min-width: unset!important;;
}
.ProjectTask{
  width: 100%;
  height: 100%;
  margin: 0 auto;
  padding: 10px;
  min-width: 320px;
  .ProjectList{
    height: calc(100% - 40px);
    overflow: auto;
  }
}
</style>
