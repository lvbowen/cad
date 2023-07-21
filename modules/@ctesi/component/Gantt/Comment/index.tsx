import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import Class from './Comment.module.less';
import * as tsx from "vue-tsx-support";
import { Gantt, GanttTask } from "../Gantt";
import moment from "moment";

import Input from 'ant-design-vue/lib/input';
import 'ant-design-vue/lib/input/style/index.css';


@Component({
    name: 'Comment'
})
export default class Comment<T> extends Vue {

    _tsx!: tsx.DeclareProps<Pick<Comment<T>, 'ganttIns' | 'targetTask'>>

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
        children: [],
        remarks: ""
    };

    @Watch('targetTask', { immediate: true })
    propsListener(val: GanttTask<T>) {
        this.formData = val;
        console.log('val====>',val);
    }

    render() {
        const { ganttIns, formData } = this;
        return (
            <article class={Class.main}>
                <Input.TextArea value={formData.remarks} onChange={e=>{
                    ganttIns?.updateTask(formData,{
                        remarks:e.currentTarget.value
                    })
                }}/>
            </article>
        );
    }
}
