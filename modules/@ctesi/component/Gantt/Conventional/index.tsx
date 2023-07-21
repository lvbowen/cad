import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import Class from './Conventional.module.less';
import * as tsx from 'vue-tsx-support';

import { Gantt, GanttTask } from "../Gantt";

import DatePicker from 'ant-design-vue/lib/date-picker';
import 'ant-design-vue/lib/date-picker/style/index.css';

import Input from 'ant-design-vue/lib/input';
import 'ant-design-vue/lib/input/style/index.css';

import InputNumber from 'ant-design-vue/lib/input-number';
import 'ant-design-vue/lib/input-number/style/index.css';

import Select from 'ant-design-vue/lib/select';
import 'ant-design-vue/lib/select/style/index.css';

import moment from "moment";


@Component({
    name: 'Conventional'
})
export default class Conventional<T> extends Vue {

    _tsx!: tsx.DeclareProps<Pick<Conventional<T>, 'ganttIns' | 'targetTask'>>

    @Prop() ganttIns?: Gantt<T>;

    @Prop() targetTask?: GanttTask<T>;

    private formData: GanttTask<any> = {
        Assignments: [],
        ConstraintDate: "",
        ConstraintType: 0,
        Critical: 0,
        Department: "",
        Duration: 0,
        Finish: moment(new Date()).add(1, 'days').toDate(),
        FixedDate: 0,
        ID: 0,
        Manual: 0,
        Milestone: 0,
        Name: "",
        Notes: "",
        model: {},
        OutlineLevel: 0,
        OutlineNumber: "",
        ParentTaskUID: "",
        PercentComplete: 0,
        PredecessorLink: [],
        Principal: "",
        Priority: 0,
        Start: moment(new Date()).toDate(),
        Summary: 0,
        UID: 0,
        Weight: 0,
        Work: 0,
        children: []
    };


    @Watch('targetTask', { immediate: true })
    propsListener(val: GanttTask<T>) {
        this.formData = val;
    }

    render() {
        const { ganttIns, formData } = this;
        return (
            <article class={Class.main}>
                <aside>
                    <div class={Class.row}>
                        <span>任务名称：</span>
                        <Input value={formData.Name} onChange={e => {
                            ganttIns?.updateTask(formData, {
                                Name: e.currentTarget.value
                            })
                        }} />
                    </div>
                    {/*<div class={Class.row}>
                       <span>负责人：</span>
                       <Select />
                    </div>*/}
                </aside>
                <aside>
                    <div class={Class.row}>
                        <span>完成百分比：</span>
                        <InputNumber value={formData.PercentComplete} onChange={e => {
                            ganttIns?.updateTask(formData, {
                                PercentComplete: e
                            })
                        }} />
                    </div>
                    {/*<div class={Class.row}>
                        <span>部门：</span>
                        <Select />
                    </div>*/}
                </aside>
                <aside>
                    <div class={Class.row}>
                        <span>工期：</span>
                        <InputNumber value={formData.Duration} onChange={e => {
                            ganttIns?.updateTask(formData, {
                                Duration: e
                            })
                        }} />
                    </div>
                    {/*<div class={Class.row}>
                        <span>工时：</span>
                        <InputNumber />
                    </div>*/}
                </aside>
                {/*<section class={Class.section}>
                    <nav>
                        <span>日期</span>
                    </nav>
                    <div class={Class.navLine}/>
                    <aside>
                        <div class={Class.sectionRow}>
                            <span>开始日期：</span>
                            <DatePicker allowClear={false} value={moment(formData.Start)} onChange={e=>{
                                ganttIns?.updateTask(formData,{
                                    Start:e.toDate()
                                })
                            }} />
                        </div>
                        <div class={Class.sectionRow}>
                            <span>完成日期：</span>
                            <DatePicker allowClear={false} value={moment(formData.Finish)} onChange={e=>{
                                ganttIns?.updateTask(formData,{
                                    Finish:e.toDate()
                                })
                            }} />
                        </div>
                    </aside>
                </section>*/}
                {/*<section class={Class.section}>
                    <nav>
                        <span>实际日期</span>
                    </nav>
                    <div class={Class.navLine}/>
                    <aside>
                        <div class={Class.sectionRow}>
                            <span>开始日期：</span>
                            <DatePicker />
                        </div>
                        <div class={Class.sectionRow}>
                            <span>完成日期：</span>
                            <DatePicker />
                        </div>
                    </aside>
                </section>*/}
            </article>
        );
    }
}
