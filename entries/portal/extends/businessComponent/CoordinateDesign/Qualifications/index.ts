import { Component, Vue, InjectReactive,Ref,Watch } from 'vue-property-decorator';
import {Table,Button,Select,Input,Pagination,Icon, Modal, FormModel,Radio,Checkbox} from "@h3/antd-vue";
import { qualificationList,Qualification,UUID,replayToken,BizObject,submit,deleteQulifacationById,updateQualificationById } from "../../../service/CoordinateDesign/Qualifications";
import { ValidationRule } from '@h3/antd-vue/types/form-model/form';
type PaginationClass={current:number,pageSize:number,showQuickJumper:true,total:number,
  showTotal:(total:number, range)=>string,onChange:(page:number, pageSize:number)=>void};
type Columns={dataIndex?:string,align?:'left'|'right'|'center',title?:string,width?:string|number,scopedSlots?:{customRender?:string,filterDropdown?:string},
  customRender?:(text:string, record, index:number)=>string|object|void,slots?:{filterIcon?:string,title?:string},customHeaderCell?:(column)=>object}[];
type TableConfiguration={loading?:boolean,columns:Columns,pagination?:PaginationClass|false,customRow?:(record, index:number)=>object,scroll?:{x?:number|true,y?:number},
  rowClassName?:(record,index:number)=>string,expandedRowKeys?:string[]};
type TableItem = {}

import {getTableList} from "../../../service/api"
import * as Type from "../../../type";
import env from "../../../../src/config/env";
import ApplicationList from "@cloudpivot/list/src/components/pc/application-list.vue";
import staffSelector
  from "@cloudpivot/form/src/common/components/form-staff-selector/pc/staff-selector.vue";


@Component({
  name:"Qualifications",
  components:{
    [Table.name]:Table,
    [Button.name]:Button,
    [Select.name]:Select,
    [Input.name]:Input,
    [Input.Search.name]:Input.Search,
    [Pagination.name]:Pagination,
    [Icon.name]:Icon,
    [Modal.name]:Modal,
    [FormModel.name]:FormModel,
    [FormModel.Item.name]:FormModel.Item,
    [Radio.name]:Radio,
    [Radio.Group.name]:Radio.Group,
    [Checkbox.name]:Checkbox,
    [Checkbox.Group.name]:Checkbox.Group,
    ApplicationList,
    staffSelector
  }
})
export default class Qualifications extends Vue {
  @InjectReactive("project") appCode!: string;
  @Ref("basicForm") form!:FormModel;

  userInfo:{id:string,name:string,departmentId:string,imgUrl:string|null,unitType:number}={id:"",name:"",departmentId:"",imgUrl:null,unitType:0};

  //#region 测试数据
  Persons:{id:string,name:string,type:number}[]=[
    {id: "ff80808182c9b8940182cd4a2b683985", name:"黄诗阳",type: 3},
    {id: "ff80808175bb06f10175cf1da4706a07", name:"冯俊",type: 3},
    {id: "ff8080817e35b2c1017e417af2370b72", name:"汪磊",type: 3},
    {id: "ff8080817fe12294017fe8fad00178d4", name:"张慧纯",type: 3},
    {id: "ff808081809fade30180bc22f0791de4", name:"向羽",type: 3},
    {id: "ff80808175108fcc017510ad7123008c", name:"胡建政",type: 3},
    {id: "ff80808175108fcc017510ad71830090", name:"孙培栋",type: 3},
    {id: "ff80808175108fcc017510ad739500a4", name:"骆光磊",type: 3},
    {id: "ff808081799c81360179bfde56920d66", name:"柯希峰",type: 3},
    {id: "ff80808175108fcc017510ad745b00ac", name:"刘晓神",type: 3},
    {id:"ff80808175108fcc017510ad6ff70080",name:"邹艳春",type:3},
  ]

  departmentOptions: any = {
    selectOrg: true,//判断是否为组织结构选择
    selectUser: false,//判断是否为用户选择
    showModel: true,
    mulpitle: false,//判断是否为单选
    showSelect: true,
    placeholder: '',
    title: '选择部门',
    nonExistentAppCode: true
  };
  departmentObj:any=[];

  personOptions: any = {
    selectOrg: false,//判断是否为组织结构选择
    selectUser: true,//判断是否为用户选择
    showModel: true,
    mulpitle: false,//判断是否为单选
    showSelect: true,
    placeholder: '',
    title: '选择联系人',
    nonExistentAppCode: true
  };
  personObj:any=[];

  departmentPropertyValue:any=null;//所属事业部
  personPropertyValue:any=null;//员工
  jobPropertyValue:string='';//所属岗位

  @Watch('departmentObj',{deep: true})
  departmentWatch(val){
    if(val.length===0){
      this.departmentPropertyValue=null;
      this.getQualificationList();
    }
  }
  @Watch('personObj',{deep: true})
  personWatch(val){
    if(val.length===0){
      this.personPropertyValue=null;
      this.getQualificationList();
    }
  }

/*  get personOptions(){
    return this.Persons.map(item=>{
      return {
        value:item.id,
        label:item.name,
        key:item.id,
      }
    })
  }*/

  getPersonsById(id:string[]){
    return this.Persons.filter(item=>id.includes(item.id)).map(item=>{
      return {
        id:item.id,
        type:item.type,
        name:item.name,
      };
    });
  }
  manufacturers=[
    {"id":"ff80808175bb06f10175bfa5e80a7203","type":1,name:"长江航道整治工程智慧管控系统"},
    {"id":"ff8080817fe12294017fe3f0f39f2b09","type":1,name:"厦门市轨道交通3号/4号线工程"},
    {"id":"ff80808175108fcc017510a139cd0074","type":1,name:"智慧工程事业部"},
    {"id":"ff80808177fd42400177ffeb1305024d","type":1,name:"总体规划室"},
  ]
  get manufacturerOptions(){
    return this.manufacturers.map(item=>{
      return {
        value:item.id,
        label:item.name,
        key:item.id,
      }
    })
  }
  getManufacturersById(id:string[]){
    return this.manufacturers.filter(item=>id.includes(item.id)).map(item=>{
      return {
        id:item.id,
        type:item.type,
        name:item.name
      };
    });
  }

  roleTypes=[
    {label:"设计人",value:"设计人",key:"1"},
    {label:"校核人",value:"校核人",key:"2"},
    {label:"审核人",value:"审核人",key:"3"},
    {label:"项目经理",value:"项目经理",key:"4"},
    {label:"复审人",value:"复审人",key:"5"},
    {label:"审定人",value:"审定人",key:"6"},
  ]
  //#endregion

  /* 所属部门选择 */
  departmentChanged(val){
    this.departmentObj=val;
    if(val.length===0) return val=null;
    const departmentArr:any=[]
    val.forEach(item=>{
      departmentArr.push({id:item.id,unitType:item.unitType,name:item.name})
    })
    this.departmentPropertyValue=JSON.stringify(departmentArr);
    // @ts-ignore
    this.roleTable.pagination.current = 0;
    this.getQualificationList();
  }

  /* 人员选择 */
  personChanged(val){
    this.personObj=val;
    if(val.length===0) return val=null;
    const persontArr:any=[]
    val.forEach(item=>{
      persontArr.push({id:item.id,unitType:item.unitType,name:item.name})
    })
    this.personPropertyValue=JSON.stringify(persontArr);
    // @ts-ignore
    this.roleTable.pagination.current = 0;
    this.getQualificationList();
  }

  /* 所属岗位搜索 */
  onSearch(val:string){
    this.jobPropertyValue=val;
    // @ts-ignore
    this.roleTable.pagination.current = 0;
    this.getQualificationList();
  }

  /* table配置 */
  roleTable:TableConfiguration & {dataSource:any[],rowSelection:{selectedRowKeys:string[],type:"checkbox"|"radio",onChange:(selectedRowKeys, selectedRows)=>void}}={
    loading:false,
    pagination:{
      current:0,
      pageSize:20,
      showQuickJumper:true,
      total:0,
      showTotal:(total:number, range)=>`共 ${total} 条`,
      onChange:(page:number, pageSize:number)=>this.paginationChanged(page,pageSize),
    },
    columns:[
      {dataIndex:"index",align:"center",title:"序号",customHeaderCell: (column) => ({ class: "customHeaderCellA" }),
        customRender:(text:string, record, index:number)=>{
        const {pageSize,current}=this.roleTable.pagination as PaginationClass;
        return `${(current)*pageSize+index+1}`;
      },
      },
      {dataIndex:"departName",align:"center",title:"所属部门", width:130,customHeaderCell: (column) => ({ class: "customHeaderCellA" }),},
      {dataIndex:"userName",align:"center",title:"人员姓名",customHeaderCell: (column) => ({ class: "customHeaderCellA" }),},
      {dataIndex:"major",align:"center",title:"从事专业",customHeaderCell: (column) => ({ class: "customHeaderCellA" }),},
      {dataIndex:"job",align:"center",title:"所属岗位",customHeaderCell: (column) => ({ class: "customHeaderCellA" }),},
      {dataIndex:"certification",align:"center",title:"技术资格",customHeaderCell: (column) => ({ class: "customHeaderCellA" }),},
      {dataIndex:"projectManagerFlag",align:"center",title:"项目经理",customHeaderCell: (column) => ({ class: "customHeaderCellB" }),scopedSlots:{customRender:"projectManagerFlag"}},
      {dataIndex:"chiefFlag",align:"center",title:"专业负责人",customHeaderCell: (column) => ({ class: "customHeaderCellB" }),scopedSlots:{customRender:"chiefFlag"}},
      {dataIndex:"designFlag",align:"center",title:"设计",customHeaderCell: (column) => ({ class: "customHeaderCellB" }),scopedSlots:{customRender:"designFlag"}},
      {dataIndex:"checkFlag",align:"center",title:"校核",customHeaderCell: (column) => ({ class: "customHeaderCellB" }),scopedSlots:{customRender:"checkFlag"}},
      {dataIndex:"auditFlag",align:"center",title:"审核",customHeaderCell: (column) => ({ class: "customHeaderCellB" }),scopedSlots:{customRender:"auditFlag"}},
      {dataIndex:"reviewFlag",align:"center",title:"复审",customHeaderCell: (column) => ({ class: "customHeaderCellB" }),scopedSlots:{customRender:"reviewFlag"}},
      {dataIndex:"approvalFlag",align:"center",title:"审定",customHeaderCell: (column) => ({ class: "customHeaderCellB" }),scopedSlots:{customRender:"approvalFlag"}},
    ],
    rowSelection:{
      selectedRowKeys:[],
      type:"radio",
      onChange:this.onSelectChange,

    },
    dataSource:[],
  }

  /* 新增修改弹窗配置 */
  modal={
    title:"",
    centered:true,
    visible:false,
    confirmLoading:false,
    destroyOnClose:true,
    maskClosable:false,
    okText:"提交",
    afterClose:()=>{
      this.basicForm.formData={
        id:"",
        departmentId:"",
        role:[],
        userId:"",
        designFlag:false,
        checkFlag:false,
        auditFlag:false,
        projectManagerFlag:false,
        reviewFlag:false,
        validationFlag:false,
      }
    },
    cancel:()=>{
      this.modal.visible=false;
    },
    ok:this.submitQualification,
    isModify:false,
  }

  /* 表单数据配置 */
  basicForm:{formData:{departmentId:string,role:string[],userId:string,id?:string,
    designFlag:boolean,checkFlag:boolean,auditFlag:boolean,projectManagerFlag:boolean,reviewFlag:boolean,validationFlag:boolean},
    rules:{[key:string]:(ValidationRule|{trigger:'blur' | 'change' | ['change', 'blur']})[]}}={
    formData:{
      departmentId:"",
      role:[],
      userId:"",
      designFlag:false,
      checkFlag:false,
      auditFlag:false,
      projectManagerFlag:false,
      reviewFlag:false,
      validationFlag:false,
    },
    rules:{
      departmentId:[
        {required:true,message:"必须选择所属事业部",trigger:['change', 'blur']},
      ],
      role:[
        {required:true,message:"必须选择岗位角色",trigger:'change'},
      ],
      userId:[
        {required:true,message:"必须选择员工",trigger:['change', 'blur']},
      ]
    }
  }

  radioOptions=[
    {label:"是",value:"1",key:"1"},
    {label:"否",value:"0",key:'2'},
  ]

  created(){
    this.userInfo=JSON.parse(sessionStorage.getItem("user") as string);
    this.getQualificationList();
  }

  /* 查询人员任职数据 */
  async getQualificationList() {
    const {appCode,roleTable:{pagination}} = this;
    const {pageSize,current:pageNum} = pagination as PaginationClass;
    this.roleTable.loading=!this.roleTable.loading;
    try {
      let params={
        filters:[
          {
            propertyCode: "department_id",
            propertyType: 5,
            propertyValue: this.departmentPropertyValue,
            propertyValueName: ""
          },
          {
            propertyCode: "user_id",
            propertyType: 5,
            propertyValue: this.personPropertyValue,
            propertyValueName: ""
          },
          {
            propertyCode: "job",
            propertyType: 0,
            propertyValue: this.jobPropertyValue,
            propertyValueName: ""
          }
        ],
        mobile: false,
        page: pageNum,
        queryCode: `${this.appCode}_rzzg`,
        schemaCode: `${this.appCode}_rzzg`,
        size: pageSize
      }
      // @ts-ignore
      const { errcode,errmsg,data } = await getTableList(params);
      if(errcode !== 0) return this.$message.error( errmsg as string);
      (this.roleTable.pagination as PaginationClass).total=data?.totalElements??0;
      this.roleTable.dataSource=[];
      data?.content?.map(item=>{
        const dataObj =item.data;
        this.roleTable.dataSource.push({
          id:dataObj.id,
          departName:dataObj['department_id'] && dataObj['department_id'][0].name,
          userName:dataObj['user_id'] && dataObj['user_id'][0].name,
          major:dataObj['major'],
          job:dataObj['job'],
          certification:dataObj['certification'],
          projectManagerFlag:dataObj['projectManagerFlag'],
          chiefFlag:dataObj['chiefFlag'],
          designFlag:dataObj['designFlag'],
          checkFlag:dataObj['checkFlag'],
          auditFlag:dataObj['auditFlag'],
          reviewFlag:dataObj['reviewFlag'],
          approvalFlag:dataObj['approvalFlag'],
        })
      })
    } catch (error) {
      return this.$message.error(`获取人员任职资格数据异常,${error}`);
    }finally{
      this.roleTable.loading=!this.roleTable.loading;
    }
  }

  /* 表格分页 */
  paginationChanged(page:number, pageSize:number){
    (this.roleTable.pagination as PaginationClass).current=page-1;
    this.getQualificationList();
  }

  onSelectChange(selectedRowKeys, selectedRows){
    this.roleTable.rowSelection.selectedRowKeys=selectedRowKeys;
  }

  /* 新增人员任职资格 */
  addQualification(){
    // this.modal.title="新增人员任职资格";
    // this.modal.okText="新增";
    // this.modal.isModify=false;
    // this.modal.visible = true;
    window.open(`${env.host}/XTSJ/form/detail?schemaCode=XTSJ_rzzg&sheetCode=XTSJ_rzzg&queryCode=XTSJ_rzzg&return=%2Fadmin%2F%3FiframeAction%3Dadd`, "_blank");
  }

  /* 修改人员任职资格 */
  modifyQualification(){
    const { selectedRowKeys } = this.roleTable.rowSelection;
    if(selectedRowKeys.length<=0){
      return this.$message.info("请选择要修改的人员");
    }
    const modifyQualificationData = this.roleTable.dataSource.find(item=>item.id===selectedRowKeys[0]) as Qualification;
    if(!modifyQualificationData){
      return this.$message.error("无效的人员数据");
    }
    window.open(`${env.host}/XTSJ/form/detail?sheetCode=XTSJ_rzzg&objectId=${modifyQualificationData.id}&schemaCode=XTSJ_rzzg&isWorkFlow=false&return=%2Fadmin%2F%3FiframeAction%3Ddetail`,'_blank')
/*    this.basicForm.formData={
      id:modifyQualificationData.id,
      departmentId:JSON.parse(modifyQualificationData.departmentId)[0]?.id??"",
      role:modifyQualificationData.role.split(";"),
      userId:JSON.parse(modifyQualificationData.userId)[0]?.id??"",
      designFlag:modifyQualificationData.designFlag==="1"?true:false,
      checkFlag:modifyQualificationData.checkFlag==="1"?true:false,
      auditFlag:modifyQualificationData.auditFlag==="1"?true:false,
      projectManagerFlag:modifyQualificationData.projectManagerFlag==="1"?true:false,
      reviewFlag:modifyQualificationData.reviewFlag==="1"?true:false,
      validationFlag:modifyQualificationData.validationFlag==="1"?true:false,
    }
    this.modal.title="修改人员任职资格";
    this.modal.okText="修改";
    this.modal.isModify=true;
    this.modal.visible = true;*/
  }

  /* 删除人员任职资格 */
  deleteQualification(){
    const { selectedRowKeys } = this.roleTable.rowSelection;
    if(selectedRowKeys.length<=0){
      return this.$message.info("请选择要删除的人员");
    }
    const modifyQualificationData = this.roleTable.dataSource.find(item=>item.id===selectedRowKeys[0]) as Qualification;
    if(!modifyQualificationData){
      return this.$message.error("无效的人员数据");
    }
    Modal.confirm({
      title: '确认要删除此人员任职资格?',
      centered:true,
      maskClosable:true,
      onOk: ()=>{
        return deleteQulifacationById({appCode:this.appCode,id:modifyQualificationData.id}).then(res=>{
          const {errcode,errmsg,data} = res;
          if(errcode){
            return this.$message.error(`删除人员任职资格失败,${errmsg}`);
          }
          this.$message.success("删除人员任职资格成功");
          this.getQualificationList();
        }).catch(reason=>{
          this.$message.error(`删除人员任职资格异常,${reason}`);
        })
      }
    })
  }

  /* 获取重放校验码 */
  async getReplayToken(){
    try {
      const {errcode,errmsg,data} = await replayToken();
      if(errcode){
        this.$message.error(`获取重放校验码失败,${errmsg}`);
        return "";
      }
      return data;
    } catch (error) {
      this.$message.error(`获取重放校验码异常,${error}`);
      return "";
    }
  }

  /* 获取UUID */
  async getUUID(){
    try {
      const {errcode,errmsg,data} = await UUID();
      if(errcode){
        this.$message.error(`获取UUID失败,${errmsg}`);
        return "";
      }
      return data;
    } catch (error) {
      this.$message.error(`获取UUID异常,${error}`);
      return "";
    }
  }

  /* 提交 */
  async submitQualification(){
    const {getReplayToken,getUUID,userInfo:{departmentId},basicForm:{formData},getManufacturersById,getPersonsById} = this;
    this.modal.confirmLoading=!this.modal.confirmLoading;
    try {
      let validde;
      this.form.validate(valid=>{
        validde=valid;
        if(!valid) return false;
      });
      if(!validde){
        return;
      }
      //获取token与id
      if(!this.modal.isModify){
        const token = await getReplayToken();
        if(!token)return;
        const id =await getUUID();
        if(!id)return;
        const bizObject:BizObject={
          id,
          data:{
            id,
            design_flag:formData.designFlag?"1":"0",
            check_flag:formData.checkFlag?"1":"0",
            audit_flag:formData.auditFlag?"1":"0",
            project_manager_flag:formData.projectManagerFlag?"1":"0",
            review_flag:formData.reviewFlag?"1":"0",
            validation_flag:formData.validationFlag?"1":"0",
            role:formData.role.join(";"),
            department_id:getManufacturersById([formData.departmentId]),
            user_id:getPersonsById([formData.userId])
          },
          schemaCode: "XTSJ_rzzg",
          sheetCode: "XTSJ_rzzg",
          workflowInstanceId: null
        }
        const {errcode,errmsg,data} = await submit({workItemId:null,workflowInstanceId:null,replayToken:token,departmentId,bizObject});
        if(errcode){
          return this.$message.error(`${this.modal.title}异常,${errmsg}`);
        }
      }else{
        const params={
          id:formData.id as string,
          auditFlag:formData.auditFlag?"1":"0" as "0"|"1",
          checkFlag:formData.checkFlag?"1":"0" as "0"|"1",
          designFlag:formData.designFlag?"1":"0" as "0"|"1",
          projectManagerFlag:formData.projectManagerFlag?"1":"0" as "0"|"1",
          reviewFlag:formData.reviewFlag?"1":"0" as "0"|"1",
          validationFlag:formData.validationFlag?"1":"0" as "0"|"1",
          role:formData.role.join(";"),
        }
        const {errcode,errmsg,data} = await updateQualificationById(params);
        if(errcode){
          return this.$message.error(`${this.modal.title}异常,${errmsg}`);
        }
      }
      this.$message.success(`${this.modal.title}成功`);
      this.modal.visible=false;
      await this.getQualificationList();
    } catch (error) {
      return this.$message.success(`${this.modal.title}异常,${error}`)
    }finally{
      this.modal.confirmLoading=!this.modal.confirmLoading;
    }
  }
}
