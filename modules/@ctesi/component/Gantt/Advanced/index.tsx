import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import Class from './Advanced.module.less';
import { Gantt, GanttTask } from "../Gantt";
import * as tsx from "vue-tsx-support";

import Select from 'ant-design-vue/lib/select';
import 'ant-design-vue/lib/select/style/index.css';

import DatePicker from 'ant-design-vue/lib/date-picker';
import 'ant-design-vue/lib/date-picker/style/index.css';

import CheckBox from 'ant-design-vue/lib/checkbox';
import 'ant-design-vue/lib/checkbox/style/index.css';

import Input from 'ant-design-vue/lib/input';
import 'ant-design-vue/lib/input/style/index.css';
import moment from "moment";


@Component({
    name:'Advanced'
})
export default class Advanced<T> extends Vue {

    _tsx!: tsx.DeclareProps<Pick<Advanced<T>, 'ganttIns' | 'targetTask'>>

    @Prop() ganttIns?: Gantt<T>;

    @Prop() targetTask?: GanttTask<T>;

    @Watch('targetTask', { immediate: true })
    propsListener(val: GanttTask<T>) {
        this.formData = val;
    }

    private formData:GanttTask<any> = {
        Assignments: [],
        ConstraintDate: "",
        ConstraintType: 0,
        critical: 0,
        Department: "",
        Duration: 0,
        Finish: moment(new Date()).add(1, 'days').toDate(),
        FixedDate: 0,
        ID: 0,
        Manual: 0,
        milestone: 0,
        Name: "",
        Notes: "",
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


    render() {

        const { ganttIns, formData } = this;

        return (
            <article class={Class.main}>
                <nav>
                    <span>任务限制</span>
                </nav>
                <div class={Class.navLine}/>
                <section class={Class.section}>
                   {/* <aside>
                        <div class={Class.sectionRow}>
                            <span>限制类型：</span>
                            <Select>
                                <Select.Option key={1}>越早越好</Select.Option>
                                <Select.Option key={2}>越晚越好</Select.Option>
                                <Select.Option key={3}>必须开始于</Select.Option>
                                <Select.Option key={4}>必须完成于</Select.Option>
                                <Select.Option key={5}>不得早于...开始</Select.Option>
                                <Select.Option key={6}>不得晚于...开始</Select.Option>
                                <Select.Option key={7}>不得遭遇...完成</Select.Option>
                                <Select.Option key={8}>不得晚于...完成</Select.Option>
                            </Select>
                        </div>
                        <div class={Class.sectionRow}>
                            <span>限制日期：</span>
                            <DatePicker />
                        </div>
                    </aside>*/}
                    <aside>
                        <div class={Class.sectionRow}>
                            <CheckBox checked={!!formData.milestone} onChange={e=>{
                                console.log('console.log',!e.target.checked);
                                ganttIns?.updateTask(formData,{
                                    milestone:e.target.checked?1:0
                                })
                            }} />
                            <span>标记为里程碑</span>
                        </div>
                        {/*<div class={Class.sectionRow}>*/}
                        {/*    <CheckBox checked={!!formData.critical} onChange={e=>{*/}
                        {/*        ganttIns?.updateTask(formData,{*/}
                        {/*            critical:e.target.checked?1:0*/}
                        {/*        })*/}
                        {/*    }}/>*/}
                        {/*    <span>标记为关键路径</span>*/}
                        {/*</div>*/}
                        <div class={Class.sectionRow}>
                            <span>BS：</span>
                            <Input readOnly={true} value={formData.bs} />
                        </div>
                    </aside>
                </section>
            </article>
        );
    }
}
