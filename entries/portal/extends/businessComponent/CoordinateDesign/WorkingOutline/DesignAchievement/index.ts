import { Component, Vue, InjectReactive, Prop, Ref } from 'vue-property-decorator';
import {Table,Input,Button,Icon} from "@h3/antd-vue";
import Collapse from 'ant-design-vue/lib/collapse';
import 'ant-design-vue/lib/collapse/style/index.css';
import Tooltip from 'ant-design-vue/lib/tooltip';
import 'ant-design-vue/lib/tooltip/style/index.css';
import { designAchievements } from "../../../../service/CoordinateDesign/WorkingOutline/DesignAchievement";
import {numberToChinese} from "../ProfessionalTask/ProfessionalDesignTask/numberToChinese";
import moment from 'moment';
import Utils from "../../../../utils";
import {exportDesignFile} from "../../../../service/api";
import { getFiledDesignAchievements } from "../../../../service/CoordinateDesign/base";
import { isArray } from "xe-utils";

type PaginationClass={current:number,pageSize:number,showQuickJumper:true,total:number,
  showTotal:(total:number, range)=>string,onChange:(page:number, pageSize:number)=>void};
type Columns={dataIndex?:string,align?:'left'|'right'|'center',title?:string,width?:string|number,scopedSlots?:{customRender?:string,filterDropdown?:string},
  customRender?:(text:string, record, index:number)=>string|object|void,slots?:{filterIcon?:string,title?:string},customHeaderCell?:(column)=>object}[];
type TableConfiguration={loading?:boolean,columns:Columns,pagination?:PaginationClass|false,customRow?:(record, index:number)=>object,scroll?:{x?:number|true,y?:number},
  rowClassName?:(record,index:number)=>string,expandedRowKeys?:string[]};
type tableItem = {id: string;name: string;children?: tableItem[];index?:number};
import { TableConfiguration as TableConfigurationBase,DesignAchievementsTree } from "../../../../type";

@Component({
  name:"DesignResult",
  components:{
    [Table.name]:Table,
    [Input.Search.name]:Input.Search,
    [Collapse.name]:Collapse,
    [Collapse.Panel.name]:Collapse.Panel,
    [Button.name]:Button,
    [Icon.name]:Icon,
    ATooltip: Tooltip
  }
})
export default class DesignAchievement extends Vue {
  @InjectReactive("project") appCode!: string;
  @Prop({required:true,type:String}) projectId!:string;
  @Prop()wProjectName!:string;
  @Ref()designResultContainer!:HTMLDivElement;
  /* Table ID */
  rowId=0;
  /* 搜索关键字 */
  keywords:string="";
  /* 表格配置 */
  resultTable:TableConfiguration&{dataSource:tableItem[]}={
    loading:false,
    pagination:false,
    expandedRowKeys:[],
    scroll:{
      y:650,
    },
    columns:[
      // {title:"序号",dataIndex:"index",align:"center",width:50,customHeaderCell:()=>({class:"tableTheadBackGroundColor"})},
      {title:"成果名称",dataIndex:"name",width:310,customHeaderCell:()=>({class:"tableTheadBackGroundColor"}),scopedSlots:{customRender:"name"}},
      {title:"成果编号",dataIndex:"achievementNumber",align:"center",customHeaderCell:()=>({class:"tableTheadBackGroundColor"})},
      {title:"成果版本",dataIndex:"version",align:"center",width:110,customHeaderCell:()=>({class:"tableTheadBackGroundColor"}),customRender:(text)=>text?`第${numberToChinese(+text)}版`:""},
      {title:"设计人",dataIndex:"designerName",align:"center",width:110,customHeaderCell:()=>({class:"tableTheadBackGroundColor"})},
      {title:"上传时间",dataIndex:"createdTime",align:"center",width:110,customHeaderCell:()=>({class:"tableTheadBackGroundColor"}),customRender:(text)=>text?moment(text).format("YYYY-MM-DD"):""},
      {title:"所属专业任务",dataIndex:"professionName",align:"center",customHeaderCell:()=>({class:"tableTheadBackGroundColor"})},
      {title:"所属设计任务",dataIndex:"professionTaskName",align:"center",customHeaderCell:()=>({class:"tableTheadBackGroundColor"})},
      {title:"操作",dataIndex:"actions",align:"center",width:110,customHeaderCell:()=>({class:"tableTheadBackGroundColor"}),scopedSlots:{customRender:"actions"}},
    ],
    dataSource:[]
  }
  /* 自定义Table展开Icon */
  customExpandIcon(props: any) {
    const { expanded, onExpand, record, expandable } = props;
    const h = this.$createElement;
    if (expandable) {
      return h("span", {}, [
        h("a-icon", {
          staticStyle: {
            paddingRight: "10px",
            fontSize: "20px",
            verticalAlign: "middle",
          },
          attrs: {
            type: expanded ? "caret-down" : "caret-right",
          },
          on: {
            click: (event: Event) => {
              onExpand(record, event);
            },
          },
        }),
      ]);
    } else {
      return h("span", {
        staticStyle: {
          paddingRight: "10px",
        },
      });
    }
  }
  expand(expanded:boolean,record:{id:string}){
    const {expandedRowKeys} = this.resultTable
    if(expanded){
      expandedRowKeys!.push(record.id);
    }else{
      const itemIndex = expandedRowKeys!.indexOf(record.id);
      if(itemIndex>-1){
        expandedRowKeys!.splice(itemIndex, 1)
      }
    }
  }
  created(){
    this.getFiledDesignAchievements();
    // this.getDesignAchievements();
  }
  mounted(){
    // window.addEventListener("resize",this.windowReSize);
  }
  // updated(){
  //   this.$nextTick().then(()=>{
  //     this.windowReSize();
  //   });
  // }
  // beforeDestroy(){
  //   window.removeEventListener("resize",this.windowReSize);
  // }
  /* 动态计算Table高度 */
  windowReSize(){
    if(!this.resultTable.scroll?.y) return;
    const { scroll } = this.resultTable
    const tableHeader = document.querySelector(".ant-table-header") as HTMLDivElement;
    const tableWrapper = document.querySelector(".ant-table-wrapper") as HTMLDivElement;
    const divElement = document.querySelector(".ant-table-wrapper .ant-table .ant-table-hide-scrollbar");
    scroll.y=this.designResultContainer.offsetHeight-tableHeader.offsetHeight-136;
    if(!divElement) return;
    (divElement as HTMLDivElement).style.paddingRight=this.resultTable.scroll?.y<(tableWrapper.offsetHeight-tableHeader.offsetHeight)?"6px":"0px";
  }
  async getDesignAchievements(){
    const { appCode,projectId, resultTable,keywords } = this;
    resultTable.loading=!this.resultTable.loading;
    try {
      let params;
      if(this.keywords){
        params={appCode,projectId,achievementName:keywords}
      }else{
        params={appCode,projectId}
      }
      const {errcode,errmsg,data} =  await designAchievements(params);
      if(errcode){
        return this.$message.error(`查询设计成果失败,${errmsg}`)
      }
      // const tableData: tableItem[] = [];
      // let count = 0;
      // for (const key in data) {
      //   if (Object.prototype.hasOwnProperty.call(data, key)) {
      //     const values = data[key];
      //     const names = key.split("@");
      //     tableData.push({
      //       index:count+1,
      //       id: `${this.rowId++}`,
      //       name: names[0],
      //       children: [],
      //     });
      //     for (let index = 1; index < names.length; index++){
      //       const currentItem: tableItem = {
      //         id: `${this.rowId++}`,
      //         name: names[index],
      //         children: [],
      //       };
      //       if (index === names.length - 1) {
      //         data[key].forEach(item=>{
      //           const attachmentDatas = item.attachments?.map(attachment=>{
      //             const attachmentData = {...item,...attachment};
      //             delete attachmentData.attachments;
      //             return attachmentData;
      //           })
      //           attachmentDatas&&currentItem.children?.push(...attachmentDatas);
      //         })
      //       }
      //       const children = this.findLastChildren(tableData[count]);
      //       children.push(currentItem);
      //     }
      //   }
      //   count++;
      // }

      //@ts-ignore
      resultTable.expandedRowKeys=this.expandedAllRow(data??[]);
      //@ts-ignore
      resultTable.dataSource=data??[];
    } catch (error) {
      return this.$message.error(`查询设计成果异常,${error}`)
    }finally{
      this.resultTable.loading=!this.resultTable.loading;
    }
  }
  findLastChildren(data: tableItem): tableItem[] {
    if (data.children && data.children.length <= 0) {
      return data.children;
    } else if (data.children) {
      return this.findLastChildren(data.children[0]);
    } else {
      return [];
    }
  }
  expandedAllRow(data: tableItem[]): string[] {
    const keys: string[] = [];
    for (let index = 0; index < data.length; index++) {
      const element = data[index];
      keys.push(element.id);
      if (element.children) {
        keys.push(...this.expandedAllRow(element.children));
      }
    }
    return keys;
  }
  download(record:{download:string,onlinePrewView:string}){
    window.open(record.download,"_blank")
  }
  preview(record:{download:string,onlinePrewView:string,lightweightAddress:string}){
    if (record.lightweightAddress) {
      window.open(record.lightweightAddress,"_blank")
    }else {
      window.open(record.onlinePrewView,"_blank")
    }
  }
  downloadLoading: boolean = false;
  downloadAchievments() {
    this.downloadLoading = true;
    exportDesignFile({
      appCode: this.appCode??'',
      projectId: this.projectId??''
      // projectId: '21826df81408487ebe1236e2db8575d2'
    }).then((res)=> {
      this.downloadLoading = false;
      const fileName:string = sessionStorage.getItem('exportDesignFile') as string;
      if (fileName) {
        Utils.downloadFile("zip", `${fileName}`, res);
      }
    })
  }
  defaultActiveKey: string[] = ['1']
  search(){
    this.getDesignAchievements();
  }
  //TODO 改版成果列表tree START
  professionResultTable:TableConfigurationBase<DesignAchievementsTree[]> = {
    rowKey: 'profession',
    loading: false,
    dataSource: [],
    columns: [
      {
        title: '专业名称',
        key: 'profession',
        dataIndex: 'profession'
      },
      {
        title: '专业负责人',
        key: 'professioner',
        dataIndex: 'professioner'
      }
    ],
    pagination: false,
    defaultExpandAllRows:true,
    tabKey: 1
  }
  designTypeResultTable:TableConfigurationBase<DesignAchievementsTree[]> = {
    rowKey: 'designType',
    loading: false,
    dataSource: [],
    columns: [
      {
        title: '设计任务类型',
        key: 'designType',
        dataIndex: 'designType'
      }
    ],
    pagination: false,
    defaultExpandAllRows:true,
    tabKey: 50
  }
  tasksTypeResultTable:TableConfigurationBase<DesignAchievementsTree[]> = {
    rowKey: 'taskId',
    loading: false,
    dataSource: [],
    columns: [
      {
        title: '任务名称',
        key: 'taskName',
        dataIndex: 'taskName',
        width: 250
      },
      {
        title: '任务编号',
        key: 'taskNo',
        dataIndex: 'taskNo',
        width: 200
      },
      {
        title: '设计人',
        key: 'designer',
        dataIndex: 'designer',
        width: 150
      },
      {
        title: '归档时间',
        key: 'fileTime',
        dataIndex: 'fileTime',
        width: 150
      },
      {
        title: '文件列表',
        key: 'files',
        dataIndex: 'files',
        scopedSlots: { customRender: 'files'}
      },
      {
        title: '设计任务单',
        key: 'taskId',
        dataIndex: 'taskId',
        scopedSlots: { customRender: 'taskId' },
        width: 120,
        align: 'center'
      }
    ],
    pagination: false,
    defaultExpandAllRows: true,
    tabKey: 100
  }
  getFiledDesignAchievements() {
    this.professionResultTable.dataSource = [];
    this.professionResultTable.defaultExpandKeys = [];
    this.designTypeResultTable.defaultExpandKeys = [];
    this.tasksTypeResultTable.defaultExpandKeys = [];
    this.professionResultTable.loading = true;
    getFiledDesignAchievements({
      appCode: this.appCode??'',
      projectId: this.projectId??''//'21826df81408487ebe1236e2db8575d2'
      // projectId: '21826df81408487ebe1236e2db8575d2'
    }).then((res)=> {
      if(res.errcode!==0) return this.$message.error(res.errmsg as string)
      if(!res.data) return;
      this.professionResultTable.dataSource = res.data;
      (this.professionResultTable.tabKey as number)++
    }).finally(()=> {
      this.professionResultTable.loading = false
    })
  }
  timeFn: any = null;
  previewUrl(url: string) {
    clearTimeout( this.timeFn );
    if (!url) return this.$message.warning('暂无预览地址！')
    this.timeFn = setTimeout(()=> {
      window.open(url)
    },300)
  }
  downloadUrl(url: string) {
    clearInterval( this.timeFn );
    window.open(url)
  }
  projectCode: string = ''
  toForm(taskId:string) {
    if (!taskId) return this.$message.warning('暂无！')
    this.$router.push(
      {
        name: 'ProfessionalDesignTask',
        query: {
          projectId: this.projectId,
          id: taskId,
        }
      }
    )
  }
  //TODO END
}
