<template>
  <div class="project-task-list full-height flex flex-column" :class="themeType==='dark'?'dark':'light'">
    <UserInfo @changeExpandState="changeExpandState" @init="getList" :clientId="clientId"/>
    <a-input-search
      v-model="keywords"
      placeholder="请输入关键字"
      @pressEnter="onPressEnter"
      @change="changeKeywords"
      @search="onSearch"></a-input-search>
    <a-spin
      :spinning="loading"
      size="large"
      tip="努力加载中……">
      <a-collapse :bordered="false" v-model="activeKey">
        <a-collapse-panel v-for="(i,index) in treeData" :key="i.id">
          <div slot="header" class="flex flex-space-between">
            <span @click.stop="go(i.id)">{{ i.taskName }}</span>
          </div>
          <template v-for="(p,pKey) in i.professions">
            <div :key="pKey" class="production">
              <div class="flex flex-center-align flex-space-between" v-show="p.outlineExist">
                <div class="tree-title flex flex-center-align">
                  <img v-if="themeType==='dark'" src="../../../../../src/assets/extends/CoordinateDesign/External/提纲1.png" alt="">
                  <img v-else src="../../../../../src/assets/extends/CoordinateDesign/External/提纲.png" alt="">
                  <span v-if="keywords.trim().length && p.profession.indexOf(keywords)>-1">{{ p.profession.substring(0,p.profession.indexOf(keywords)) }}<span class="keywords">{{ keywords }}</span>{{ p.profession.substring(p.profession.indexOf(keywords)+keywords.length) }}</span>
                  <span v-else>{{ p.profession }}</span>
                </div>
                <div class="flex">
                  <a-icon type="eye" title="预览专业设计提纲" v-if="p.outlinePreviewUrl" @click="openUrl('preview',p.outlinePreviewUrl)"/>
                  <a-icon type="arrow-down" title="下载专业设计提纲" v-if="p.outlineDownloadUrl" @click="openUrl('download',p.outlineDownloadUrl)"/>
                </div>
              </div>
              <div class="designs" v-if="p.designTasks.length">
                <template v-for="(d,dKey) in p.designTasks">
                  <div :key="dKey" @click="next(d.taskName,d.id,i.id)" class="flex flex-center-align flex-space-between">
                    <div class="tree-title flex flex-center-align">
                      <img v-if="themeType==='dark'" src="../../../../../src/assets/extends/CoordinateDesign/External/设计1.png" alt="">
                      <img v-else src="../../../../../src/assets/extends/CoordinateDesign/External/设计.png" alt="">
                      <span v-if="keywords.trim().length && d.taskName.indexOf(keywords)>-1">{{ d.taskName.substring(0,d.taskName.indexOf(keywords)) }}<span class="keywords">{{ keywords }}</span>{{ d.taskName.substring(d.taskName.indexOf(keywords)+keywords.length) }}</span>
                      <span v-else>{{ d.taskName }}</span>
                    </div>
                    <div class="flex flex-center-align">
                      <a-icon type="select" @click.stop="go(i.id,d.id)" title="跳转设计任务单"/>
                      <div class="design-task-state" v-if="d.state">
                        {{ d.state }}
                      </div>
                    </div>

                  </div>
                </template>
              </div>
            </div>
          </template>
        </a-collapse-panel>
      </a-collapse>
    </a-spin>
  </div>
</template>


<script lang="ts">
import {Component,Vue} from "vue-property-decorator";
import Input from 'ant-design-vue/lib/input';
import 'ant-design-vue/lib/input/style/index.css';
import Tree from 'ant-design-vue/lib/tree';
import 'ant-design-vue/lib/tree/style/index.css';
import Collapse from 'ant-design-vue/lib/collapse';
import 'ant-design-vue/lib/collapse/style/index.css';
import Icon from 'ant-design-vue/lib/icon';
import 'ant-design-vue/lib/icon/style/index.css';
import Spin from 'ant-design-vue/lib/spin';
import 'ant-design-vue/lib/spin/style/index.css';
import {exampleData} from "../../../engineeringArchives/mock";
import Utils from "../../../../utils";
import {Projects} from "../../../../type";
import UserInfo from "../components/UserInfo.vue";
import { getUserConfig,getDesignTasks } from "../../../../service/CoordinateDesign/External";
import {EventBus} from "./bus";
@Component({
  name:"ProjectTaskList",
  components: {
    AInputSearch: Input.Search,
    ATree: Tree,
    AIcon: Icon,
    ACollapse: Collapse,
    ACollapsePanel: Collapse.Panel,
    ASpin: Spin,
    UserInfo
  }
})
export default class ProjectTaskList extends Vue {
  activeKey: string[] = [];

  changeExpandState(isExpand:boolean) {
    if (isExpand) {
      this.activeKey = this.copyTreeData.map((i)=> i.id)
    }else {
      this.activeKey = [];
    }
  }
  keywords: string = '';
  loading: boolean = false;
  treeData: Projects[] = [];
  copyTreeData: Projects[] = [];
  go(productionId:string,id?:string) {
    const {origin} = location;
    const {href} = this.$router.resolve({
      name: `${!id?'ProductionTaskList':'ProfessionalDesignTask'}`,
      query: {
        projectId: productionId,
        id: id
      }
    })
    window.open(`${origin}${href}`, "_blank");
  }
  //前端搜索
  changeKeywords(e:any) {
    this.keywords = e.target.value;
    if (!this.keywords.trim().length) {
      this.activeKey = [];
      this.treeData = JSON.parse(JSON.stringify(this.copyTreeData))
    }
  }
  getTreeData() {
    this.treeData = [];
    this.loading = true;
    if (this.keywords.trim().length) {
      this.copyTreeData.map((i)=> {
        const project: Projects = {
          id: i.id,
          taskName: i.taskName,
          professions: []
        }
        if (i.professions.length) {
          i.professions.map((j,index)=> {
            if (j.outlineExist) {
              project.professions.push({
                profession: j.profession,
                outlinePreviewUrl: j.outlinePreviewUrl,
                outlineExist: j.profession.indexOf(this.keywords) !== -1,
                outlineDownloadUrl: j.outlineDownloadUrl,
                designTasks: []
              })
            }else {
              project.professions.push({
                profession: j.profession,
                outlinePreviewUrl: j.outlinePreviewUrl,
                outlineExist: j.outlineExist,
                outlineDownloadUrl: j.outlineDownloadUrl,
                designTasks: []
              })
            }
            if (j.designTasks.length) {
              j.designTasks.map((m)=> {
                if (m.taskName.indexOf(this.keywords)>-1) {
                  project.professions[index].designTasks.push(m)
                }
              })
            }
          })
        }
        if (project.professions.length) {
          this.treeData.push(project)
        }
      })
      this.changeExpandState(true);
    }else {
      this.treeData = JSON.parse(JSON.stringify(this.copyTreeData))
    }
    this.loading = false;
  }
  onPressEnter(e:any) {
    this.keywords = e.target.value;
    this.getTreeData();
  }
  onSearch(key: string) {
    this.keywords = key;
    this.getTreeData();
  }
  getList() {
    // this.treeData = exampleData.response.data.projectList;
    this.copyTreeData = [];
    this.loading = true;
    getDesignTasks({
      appCode: 'XTSJ'
    }).then((res)=> {
      if(res.errcode!==0) return this.$message.error(res.errmsg as string)
      if(!res.data) return;
      this.treeData = [];
      this.treeData = res.data;
      Utils.deepFind(this.treeData,(item)=> {
        Object.assign(item, { scopedSlots: { title: 'title'}})
        return false
      },'children')
      this.copyTreeData = JSON.parse(JSON.stringify(this.treeData))
      console.log(this.treeData)
    }).finally(()=> {
      this.loading = false
    })
  }
  openUrl(type:'preview'|'downlaod',url:string) {
    window.open(url)
    // if (type==='preview') {
    //   window.open(url)
    // }else if (type==='downlaod') {
    //   window.open(url);
    //   window.close()
    // }
  }
  next(name:string,id:string,productionId:string) {
    this.$router.push({
      name: 'ProjectItemList',
      query: {
        taskName: name,
        designTaskId: id,
        productionId: productionId,
        clientId: this.clientId
      }
    })
  }
  clientId: string ='';
  getUserConfig() {
    getUserConfig().then((res)=> {
      if(res.errcode!==0) return this.$message.error(res.errmsg as string)
      if(!res.data) return;
      sessionStorage.setItem('themeType',res.data.themeType);
      this.themeType = res.data.themeType;
      EventBus.$emit('themeType',this.themeType)
      this.clientId = res.data.clientId;
      // debugger
      // console.log(localStorage.getItem('token'))
      //@ts-ignore
      let txt = jsdesigntool.checkEnvironment(this.clientId);
      console.log(txt, 'checkEnvironment')
    })
  }
  themeType: string = '';

  created() {
    console.log(location.origin)
    this.getUserConfig();
    this.getList();
    EventBus.$on('themeType',(themeType)=> {
      this.themeType = themeType;
    })
  }
}
</script>

<style scoped lang="less">
@import '../../../../styles/public.module.less';
@import "./v2-public.less";
.bpm-container{
  min-width: unset!important;
}
.project-task-list {
  overflow: hidden;
  width: 100%;
  height: 100%;
  margin: 0 auto;
  padding: @spacing-base;
  min-width: 320px;
  .ProjectList{
    height: calc(100% - 40px);
    overflow: auto;
  }
  .ant-spin-nested-loading {
    .flex-auto;
    overflow: auto;
    .scrollbar-default;
    /deep/ .ant-collapse {
      .full-height;
      .a-hover {
        color: #0A28A9;
        .tree-title {
          border-bottom: 1px solid #909399;
        }
      }
      .ant-collapse-header {
        font-weight: bold;
        padding: @spacing-base @spacing-base @spacing-base @spacing-large;
        .ant-collapse-arrow {
          left: @spacing-base;
        }
        &:hover {
          .a-hover
        }
        >div {
          margin-left: @spacing-base;
        }
      }
      .ant-collapse-content-box {
        padding: 0 0 0 @spacing-medium !important;
      }
      .production {
        margin-bottom: @spacing-base;
        .keywords {
          color: #f4454e;
          margin: 0 1/2 * @spacing-base;
        }
        img {
          margin-right: 1/2 * @spacing-base;
        }
        .tree-title {
          margin-left: @spacing-base;
        }
        .designs {
          margin-top: @spacing-base;
          background: #EAF3FB;
          padding: @spacing-base 0;
          border-radius: 4px;
          >div {
            margin-bottom: @spacing-base;
            cursor: pointer;
            &:hover {
              .a-hover
            }

          }
        }
      }
    }
  }
}
.ant-collapse > .ant-collapse-item {
  border-bottom: none;
  padding-right: 1/ 3 * @spacing-base;
}

.anticon-eye {
  color: #FF8441;
}
.anticon-arrow-down {
  color: #1fd51c;
}
.anticon-monitor {
  color: #409eff;
}
</style>
