import { Component, InjectReactive, Prop, Vue, Watch } from 'vue-property-decorator';
import Class from './ConstructionBase.module.less';
import * as Type from '../../type';
import * as tsx from 'vue-tsx-support';
import * as Constant from '../../constant';

import Input from 'ant-design-vue/lib/input';
import 'ant-design-vue/lib/input/style/index.css';

import InputNumber from 'ant-design-vue/lib/input-number';
import 'ant-design-vue/lib/input-number/style/index.css';

import Select from 'ant-design-vue/lib/select';
import 'ant-design-vue/lib/select/style/index.css';

import DatePicker from 'ant-design-vue/lib/date-picker';
import 'ant-design-vue/lib/date-picker/style/index.css';

@Component({
  name: 'ConstructionBase'
})
export default class ConstructionBase extends Vue {

  @InjectReactive('project') projectCode?:string;

  @InjectReactive('projectConfig') projectConfig?:Type.ProjectConfig;

  _tsx!: tsx.DeclareProps<Pick<ConstructionBase, 'baseInfo'|'className' >>

  @Prop() baseInfo?: Type.SchedulePlan;

  @Prop() className?:string;

  private projectNames: Array<string> = [];

  private formData: Type.SchedulePlan = {
    planSchemeName: "",
    projectCode: "",
    projectName: "",
    remarks: "",
    schedulePlanId: "",
    schemeMoney: 0,
    schemePeriod: 0,
    schemePlanAmount: 0,
    schemePlanEnd: "",
    schemePlanStart: "",
    state: ""
  }

  private renderProjectNames(names: Array<string>) {
    if (!Array.isArray(names)) return [];
    return names.map(item => {
      return (
        <Select.Option key={item}>{item}</Select.Option>
      )
    });
  }

  private getProjectNames(){
    // getProjectName({
    //   projectCode: this.projectCode as string
    // }).then(res => {
    //   if (res.errcode !== 0) return this.$message.error(res.errmsg as string);
    //   if (res.data) this.projectNames = res.data;
    // })
    //this.projectNames.push(window.Environment.markName)
    const { projectConfig } = this;
    if(!projectConfig) return;
    if(projectConfig?.projectLevel===Constant.ProjectLevel['项目']){
      this.projectNames = [projectConfig.projectName as string];
    }
  }

  @Watch('baseInfo', { immediate: true })
  baseInfoListener(data: Type.SchedulePlan) {
    this.formData = data;
  }

  mounted(){
    this.getProjectNames();
  }

  /*@Watch('formData',{immediate:true,deep:true})
  formDataListener(data:Type.SchedulePlan){
    console.log(data);
  }*/

  render() {
    const { formData, projectNames, renderProjectNames,className } = this;
    const readOnly = formData.businessState !== Type.SchedulePlanBizState.Unaudited;
    return (
      <article class={Class.main}>
        <nav>
          <span>基本信息</span>
        </nav>
        <main class={`${Class.container} ${className}`}>
          <aside>
            <div>
              <span>项目名称：</span>
              {/*<Input readOnly={readOnly} v-model={formData.projectName}/>*/}
              <Select
                disabled={readOnly}
                value={formData.projectName}
                onChange={e => this.formData.projectName = e}
              >
                {renderProjectNames(projectNames as Array<string>)}
              </Select>
            </div>
            <div>
              <span>计划方案名称：</span>
              <Input v-model={formData.planSchemeName}/>
              {/* <Input readOnly={readOnly} v-model={formData.planSchemeName}/> */}
            </div>
            <div>
              <span>编制人：</span>
              <Input disabled={true} value={formData.ownerName}/>
            </div>
            <div>
              <span>编制时间：</span>
              <Input disabled={true} value={formData.modifiedTime}/>
            </div>
          </aside>
          <aside>
            <div>
              <span>编制部门：</span>
              <Input disabled={true} value={formData.ownerDeptName}/>
            </div>
            <div>
              <span>计划开始时间：</span>
              <DatePicker disabled={readOnly} v-model={formData.schemePlanStart}/>
            </div>
            <div>
              <span>计划完成时间：</span>
              <DatePicker disabled={readOnly} v-model={formData.schemePlanEnd}/>
            </div>
            <div>
              <span>总工期：</span>
              <InputNumber disabled={readOnly} v-model={formData.schemePeriod}/>
            </div>
          </aside>
          <aside>
            <div>
              <span>计划产值：</span>
              <Input readOnly={readOnly} v-model={formData.schemeMoney}/>
            </div>
            <div class={Class.fullInput}>
              <span>计划方案备注：</span>
              <Input v-model={formData.remarks}/>
            </div>
          </aside>
        </main>
      </article>
    );
  }
}
