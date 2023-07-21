import {Prop, Vue, Watch} from 'vue-property-decorator';
import {GanttClass} from "../index";
import {GanttColumn, GanttTask, GanttTimeLines} from "./Gantt";
import Class from './Gantt.module.less';
import * as tsx from 'vue-tsx-support';

/*declare global {
    interface Window {
        PlusProject: GanttClass.GanttType<any>;
        ProjectMenu: GanttClass.GanttType<any>;
        mini: GanttClass.GanttMiniUI<any>
    }
}*/

export abstract class GanttAbstract<T> extends Vue {

    _tsx!: tsx.DeclareProps<Pick<GanttAbstract<T>, 'ganttColumns' | 'readOnly' | 'enableOrderProject' | 'showCriticalPath' | 'ganttData' | 'treeField' | 'currentTask' | 'action' | 'ganttCellEditCB' | 'addMBSFn' | 'readyFn' | 'removeFn' | 'downgradeCb' | 'upgradeCb' | 'ganttCellClick' | 'preTaskFnCollection' | 'rowHeight' | 'view' | 'timeLines'>>

    @Prop() ganttColumns?: Array<GanttColumn<any>>;

    @Prop() enableOrderProject?: boolean;

    @Prop() readOnly?: boolean;

    @Prop() ganttData?: GanttClass.GanttDataType<T>;

    @Prop() treeField?: string;

    @Prop() currentTask?: GanttTask<T>;

    @Prop() action?: 'add' | 'edit' | 'view';

    @Prop() ganttCellEditCB?: Function;

    @Prop() rowHeight?: number;

    @Prop() view?: boolean;

    @Prop() timeLines?: Array<GanttTimeLines>;

    @Prop() addMBSFn?: Function;

    @Prop() readyFn?: Function;

    @Prop() removeFn?: Function;

    @Prop() downgradeCb?: Function;

    @Prop() upgradeCb?: Function;

    @Prop() ganttCellClick?: Function;

    @Prop() showCriticalPath?: boolean;

    @Prop() preTaskFnCollection?: {
        get: Function,
        add: Function,
        update: Function,
        delete: Function
    }

    public readonly name: string = 'gantt';

    protected allScriptReady: boolean = false;

    public ganttInstance: GanttClass.GanttType<T> | null = null;

    protected ganttCtxMenu: GanttClass.GanttType<T> | null = null;

    protected getScriptPath(libPath?: string): string {
        //@ts-ignore
        return `${window.config?.portalHost ?? '/'}${libPath ?? '/miniui/miniui.js'}`
    }

    protected loadPreDepends(url: string) {
        const preDepends = document.getElementById(url) as HTMLScriptElement;
        if (preDepends) document?.head.removeChild(preDepends);
        return new Promise((resolve, reject) => {
            const createdJQScript = document.createElement('script');
            createdJQScript.id = url;
            createdJQScript.src = url;
            createdJQScript.onload = e => {
                // console.log( 'preDepends load Success', e );
                resolve(e);
            };
            createdJQScript.onerror = e => {
                console.warn('preDepends load failed', e);
                reject(e);
            };
            document.head.appendChild(createdJQScript);
        })
    }

    protected loadScript(url: string) {
        const createdScript = document.getElementById(url) as HTMLScriptElement;
        if (createdScript) document?.body.removeChild(createdScript);
        return new Promise((resolve, reject) => {
            const createdGanttScript = document.createElement('script');
            createdGanttScript.id = url;
            createdGanttScript.src = url;
            createdGanttScript.onload = (e) => {
                // console.log( 'loadScript load Success', e );
                resolve(e);
            };
            createdGanttScript.onerror = (e) => {
                console.warn('loadScript Error', e);
                reject(e);
            };
            document.body.appendChild(createdGanttScript);
        })
    }

    protected removeScript(url: string, pos?: 'head' | 'body') {
        const ganttScript = document.getElementById(url) as HTMLScriptElement;
        if (ganttScript) document?.[pos ?? 'body']?.removeChild?.(ganttScript);
    }

    protected async initGanttScript() {
        const {loadPreDepends, loadScript, getScriptPath} = this;
        return loadPreDepends(getScriptPath('/lib/jquery-3.6.0.min.js')).then(preRes => {
            loadScript(getScriptPath()).then(ganttRes => {
                !this.ganttInstance ? this.ganttInstance = new window.PlusProject(this) : undefined;
                this.ganttInstance?.setContextMenu?.(new window.ProjectMenu());
                this.allScriptReady = true;
            })
        });
    }

    protected init() {
        this.initGanttScript().then(res => {
            // console.log( 'GanttReady====>', res );
        }).catch(err => console.log('GanttError====>', err));
    }

    protected destroy() {
        this.removeScript(this.getScriptPath(), 'body');
        this.removeScript(this.getScriptPath('/lib/jquery-3.6.0.min.js'), 'head');
        this.ganttInstance = null;
        this.ganttCtxMenu = null;
    }

    protected renderColHeader(name: string): string {
        return `<span class="${Class.ganttTHead}">${name}</span>`
    };

    protected generateGanttColumns(columns: Array<GanttClass.GanttColumn<T>>): Array<GanttColumn<any>> {
        if (!Array.isArray(columns)) return [];
        const {mini} = window;
        return columns.map(item => {
            if (!item.renderer) item.renderer = cell => `${cell.value}`;
            if (!item.name) item.name = item.field as string;
            if (!item.header) item.header = this.renderColHeader(item.text);
            return mini.copyTo(item);
        })
    }

    protected setDataProject(): void {
        const {ganttData, ganttInstance, treeField, enableOrderProject} = this;
        if (!ganttData || !ganttInstance) return;
        const {mini} = window;
        const decodedData = mini?.decode(ganttData);
        console.log( 'decodedData===>', decodedData );
        ganttInstance.setTreeColumn(treeField ?? 'Name');
        ganttInstance.loadData(decodedData);
        ganttInstance.allowOrderProject = enableOrderProject ?? false;
        ganttInstance.orderProject();
    }

    @Watch('ganttData', {immediate: true, deep: true})
    ganttDataListener(val) {
        this.setDataProject();
    }

    abstract readonly fnFilter?: string;

    abstract readonly evFilter?: string;

    abstract ganttGoto(): void;

    abstract ganttZoomIn(): void;

    abstract ganttZoomOut(): void;

    abstract ganttUpgrade(): void;

    abstract ganttDowngrade(): void;

    abstract ganttAdd(): void;

    abstract ganttEdit(): void;

    abstract ganttRemove(): void;

    abstract renderTimeLines(): string;

}
