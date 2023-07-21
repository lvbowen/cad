import { Component, Vue,VModel,InjectReactive,Emit } from 'vue-property-decorator';
import {Modal,Checkbox} from "@h3/antd-vue";
import Utils from "../../../../../../utils";
import Tooltip from 'ant-design-vue/lib/tooltip';
import 'ant-design-vue/lib/tooltip/style/index.css';
import Icon from 'ant-design-vue/lib/icon';
import 'ant-design-vue/lib/icon/style/index.css';
@Component({
  name:"ItemSelect",
  components:{
    [Modal.name]:Modal,
    [Checkbox.name]:Checkbox,
    [Checkbox.Group.name]:Checkbox.Group,
    ATooltip: Tooltip,
    AIcon: Icon
  }
})
export default class ItemSelect extends Vue {
  @InjectReactive("project") appCode!: string;
  @VModel({type:Boolean}) itemVisible!:boolean;

  values:string[] = [];
  indeterminate = false;
  checkAll = false;

  options:{label:string,value:string}[] = [
    // {label:"模式",value:"modelType"},
    {label:"校审级别",value:"proofread_level"},
    {label:"是否需要设计指导",value:"design_guider_flag"},
    {label:"是否需要会签",value:"countersign_flag"},
    {label:"项目经理审核",value:"project_manager_audit"},
    {label:"设计人",value:"designer"},
    {label:"设计指导",value:"design_guider"},
    {label:"校核人",value:"checker"},
    {label:"审核人",value:"auditor"},
    {label:"项目经理",value:"project_manager"},
    {label:"会签人",value:"countersigned"},
    {label:"部门主管总工",value:"department_chief"},
    {label:"院主管总工",value:"company_chief"},
    // {label:"任务下达时间",value:"task_time"},
    {label:"计划开始时间",value:"plan_start_time"},
    {label:"计划结束时间",value:"plan_end_time"},
  ];

  afterClose(){
    // this.values = this.options.map(item=>item.value);
    this.checkAll = false;
    this.values = [];
    this.indeterminate = false;
  }

  created(){
    // this.values = this.options.map(item=>item.value);
    // this.checkAll = true;
  }

  onCheckAllChange(e) {
    Object.assign(this, {
      values: e.target.checked ? this.options.map(item=>item.value) : [],
      indeterminate: false,
      checkAll: e.target.checked,
    });
  }

  onChange(checkedList) {
    this.indeterminate = !!checkedList.length && checkedList.length < this.options.length;
    this.checkAll = checkedList.length === this.options.length;
  }
  //TODO 勾选关联处理
  onChangeItem(e:any) {
    if (e.target.value==='proofread_level' && e.target.checked) {
      this.values.push('department_chief','company_chief','project_manager','project_manager_audit')
      this.values = Utils.simpleUnique(this.values)
      return
    }
    if (e.target.value==='design_guider_flag' && e.target.checked) {
      this.values.push('design_guider')
      this.values = Utils.simpleUnique(this.values)
      return
    }
    if (e.target.value==='countersign_flag' && e.target.checked) {
      this.values.push('countersigned')
      this.values = Utils.simpleUnique(this.values)
      return
    }
    if (e.target.value==='project_manager_audit' && e.target.checked) {
      this.values.push('project_manager')
      this.values = Utils.simpleUnique(this.values)
      return
    }
    if (e.target.value==='department_chief' && e.target.checked) {
      this.values.push('company_chief','project_manager','project_manager_audit','proofread_level')
      this.values = Utils.simpleUnique(this.values)
      return
    }
    if (e.target.value==='project_manager' && e.target.checked) {
      this.values.push('project_manager_audit')
      this.values = Utils.simpleUnique(this.values)
      return
    }
    if (e.target.value==='design_guider' && e.target.checked) {
      this.values.push('design_guider_flag')
      this.values = Utils.simpleUnique(this.values)
      return
    }
    if (e.target.value==='countersigned' && e.target.checked) {
      this.values.push('countersign_flag')
      this.values = Utils.simpleUnique(this.values)
      return
    }
    if (e.target.value==='company_chief' && e.target.checked) {
      this.values.push('proofread_level')
      this.values = Utils.simpleUnique(this.values)
      return
    }
  }

  @Emit("affterItemSelect")
  selectValues(){
    return this.values
  }












}
