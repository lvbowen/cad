import "vue-router";
import "vue-i18n";

import {InjectReactive, Provide, Vue} from "vue-property-decorator";

import {form, formApi, listApi, listParams, workflow, workflowApi} from "@cloudpivot/api";

import * as platform from "@cloudpivot/platform";

import {utils} from "@cloudpivot/common";

import * as renderer from "../../renderer";
import {components, dateFormatter, FormControlApiHandler, UploadFile, UploadStatus} from "../../renderer";

import * as schema from "../../schema";
import {DropdownOptions, FormControlType, FormSheet, RendererControl, RendererFormControl} from "../../schema";

import {FormControlOptionsService} from "../../renderer/services";

import {FormActionButton, FormActionModal, FormActionModalOptions,} from "../form-action-modal";

import {LifecycleHookNames, LifecycleHooks, parseScript} from "../lifecycle";

import {FormAction} from "../form-action";

import {FormDetailService} from "../services/form-detail-service";

import axios from "axios";
import env from '@/config/env';

import {RadioControl, RowChangeType, ValueControl} from "h3-forms";
import * as Type from "../../../../../../entries/portal/extends/type";

// ie11 兼容
if ((window as any).Proxy === undefined) {
    require("../proxy.runtime");
    // (window as any).Proxy = ProxyPolyfill;
}

interface Nodes {
    activityCode: string;
    activityName: string;
    workItemsType: WorkItemsType;
    selected: boolean;
    id: string;
}

// eslint-disable-next-line no-shadow
enum WorkItemsType {
    // 代办
    WorkItem = 0,
    // 已办
    WorkItemFinished = 1,
    // 待阅
    CirculateItem = 2,
    // 已阅
    CirculateItemFinished = 3,
}

export class FormDetailProxyHandler implements ProxyHandler<FormDetail> {
    private _map: any = {};

    get(target: FormDetail, p: PropertyKey, receiver: any): any {
        if (p === "submit") {
            return () => this.doAction(target, p);
        }

        if (p === "doAction") {
            return (code: string) => this.doAction(target, code);
        }

        switch (p) {
            case "$confirm":
            case "$router":
            case "$message":
            case "$i18n":
            case "actions":
            case "workflowInfo":
            case "submited":
            case "currentUser":
            case "isNew":
            case "value":
            case "errors":
            case "validate":
                return (target as any)[p];

            case "get":
                return (target as any)[p].bind(target);
        }

        if (typeof p === "string") {
            let api = this._map[p];

            if (api) {
                return api;
            }

            const control = target.formRenderer.formControlMap[p];
            if (control) {
                if (!control.controller) {
                    control["controller"] =
                        target.formRenderer.controller.children[control.key];
                }
                api = new Proxy(control, new FormControlApiHandler());

                this._map[p] = api;

                return api;
            }
        }
    }

    doAction(target: FormDetail, code: string) {
        const ac = target.actions.find((a) => a.code === code);
        if (ac) {
            return target.onAction(ac);
        }
        target.$message.error(`没有${code}权限`);
    }
}

export abstract class FormDetail extends Vue {

    @InjectReactive('projectConfig') projectConfig?: Type.ProjectConfig;
    /**
     * 表单按钮列表
     */
    actions: FormActionButton[] = [];

    /**
     * 表单渲染器所属数据
     */
    controls: RendererControl[] = [];

    formControls: RendererFormControl[] = [];

    /**
     * 后端API返回的表单数据
     */
    formObj: form.FormObject = {} as any;

    /**
     * 流程表单节点
     */
    nodes: Nodes[] = [];

    /**
     * 根据节点不同相应不同的参数
     */
    nodesParams: any = null;

    /**
     * 转办说明
     */
    comment = "";

    /**
     * 流程实例ID
     */
    workflowInstanceId = "";

    /**
     * 表单渲染器审批意见控件
     * 移动端的审批意见需要特别处理
     */
    approval: RendererFormControl = "" as any;

    /**
     * 拥有者选人控件
     */
    owner?: RendererFormControl;

    /**
     * 事件订阅函数列表
     */
    hooks?: LifecycleHooks;

    /**
     * 自定义表单API代理
     */
    proxy?: any;

    /**
     * 加载自定义表单的iframe
     */
    iframe?: HTMLIFrameElement;
    /**
     * 表单的数据模型信息
     */
    dataModalList: any[] = [];

    /**
     * 表单按钮操作后页面跳转处理
     * @param ac
     * @param res
     */
    abstract goto(
        ac: FormActionButton,
        res: form.HttpResponse<any>
    ): Promise<void>;

    /**
     * 表单校验
     */
    abstract validate(onlyUpload?: boolean): boolean;

    /**
     * 消息组件对象
     */
    abstract $message: any;

    /**
     * 消息组件对象
     */
    abstract $confirm: any;

    /**
     * 定时器
     */
    abstract timer: any;

    /**
     * 是否是移动端
     */
    abstract isMobile: boolean;

    /**
     * URL query参数
     */
    relevanceQuery?: { [key: string]: string };

    /**
     * 是否进入编辑状态
     */
    inEdit = false;

    get formRenderer() {
        // debugger
        const el = this.$refs.formRenderer as any;
        // return el.$refs.formRenderer as any as FormRendererLike;
        return el;
        // .$refs.formRenderer
    }

    get isWorkflowForm() {
        return !!this.formObj.workflowCode;
    }

    get workflowInfo() {
        if (!this.isWorkflowForm || !this.formObj) {
            return null;
        }

        return {
            code: this.formObj.workflowCode,
            instanceId: this.formObj.workflowInstanceId,
            instanceName: this.formObj.instanceName,
            tokenId: this.formObj.workflowTokenId,
            itemId: this.formObj.workItemId,
            version: this.formObj.workflowVersion,
            activityCode: this.formObj.activityCode,
            activityName: this.formObj.activityName,
        };
    }

    @Provide()
    getScrollEl() {
        return this.$el;
    }

    /**
     * 是否已提交过
     */
    get submited() {
        if (!this.isWorkflowForm || !this.formObj) {
            return null;
        }
        if (this.isWorkflowForm) {
            return !!this.formObj.workflowInstanceIsSubmit;
        }

        return this.formObj.bizObject.data.sequenceStatus === "COMPLETED";
    }

    get currentUser() {
        const user = renderer.StaffSelectorControl.service.getCurrentUser() as any;
        return user;
    }

    get formPath() {
        if (this.hooks && this.hooks.controller) {
            return this.hooks.controller;
        }
        return undefined;
    }

    get isNew() {
        if (this.formObj && this.formObj.bizObject) {
            return this.formObj.bizObject.sequenceStatus === "";
        }
        return false;
    }

    get isWorkFlow() {
        const params = this.$route.query;
        if (params.isWorkFlow && params.isWorkFlow === "true") {
            return true;
        }
        return false;
    }

    get value() {
        const ctrl = this.getFormCtrl();
        return ctrl.value;
    }

    get errors() {
        const ctrl = this.getFormCtrl();
        return ctrl.errors;
    }

    get(key: string) {
        const control = this.formRenderer.formControlMap[key];
        if (control) {
            if (platform.IS_IE) {
                control.ctrl = true;
                control.items = true;
            }
            return new Proxy(control, new FormControlApiHandler());
        }
        return undefined;
    }

    /**
     * 获取表单控制器
     */
    getFormCtrl() {
        if (this.formRenderer) {
            return this.formRenderer.controller;
        }
    }

    isNewForm() {
        if (this.formObj && this.formObj.bizObject) {
            return this.formObj.bizObject.sequenceStatus === "";
        }
        return false;
    }

    getLocale(path: string) {
        return this.$t(`cloudpivot.form.runtime.${path}`).toString();
    }

    /**
     * 根据不同节点加载不同表单
     * @param nodes
     */
    getNodesParams(nodes: string) {
        const theNode = this.nodes.find((res) => res.activityCode === nodes);
        let str = "";
        if (theNode) {
            switch (theNode.workItemsType) {
                case WorkItemsType.WorkItem:
                    str = "unfinishedWorkitem";
                    // str = '/workflow-center/my-unfinished-workitem';
                    break;
                case WorkItemsType.WorkItemFinished:
                    str = "finishedWorkitem";
                    // str = '/workflow-center/my-finished-workitem';
                    break;
                case WorkItemsType.CirculateItem:
                    str = "unreadWorkitem";
                    // str = '/workflow-center/my-unread-workitem';
                    break;
                default:
                    str = "readWorkitem";
                    // str = '/workflow-center/my-read-workitem';
                    break;
            }
        }
        if (str && theNode) {
            this.nodesParams = {
                return: str,
                workitemId: theNode.id,
            };
        }
    }

    /**
     * 重新加载数据
     */
    reload() {
        this.clean();
        this.load();
    }

    /**
     * 清理
     */
    clean(excludeNode?: boolean) {
        this.formObj = {} as any;
        this.comment = "";
        this.controls = [];
        this.actions = [];
        this.proxy = null;
        if (excludeNode) {
            return;
        }
        this.nodesParams = null;
        this.nodes = [];
    }

    /**
     * 查找上传控件按上传状态
     */
    findUploadBy(status: UploadStatus) {
        const controls = this.formRenderer.findFormControls();

        const filterFunc = (c: RendererFormControl) =>
            c.type === FormControlType.Attachment || c.type === FormControlType.Image;

        let control = controls.filter(filterFunc).find((c) => {
            if (!c.controller) {
                return false;
            }
            const files = c.controller.value as UploadFile[];
            if (!files) {
                return false;
            }
            return files.some((f) => f.status === status);
        });

        if (control) {
            return control;
        }

        control = controls
            .filter((c) => c.type === FormControlType.Sheet)
            .find((c) => {
                if (!this.formRenderer.controller) {
                    return false;
                }
                const ctrl = this.formRenderer.controller.children[c.key];
                const vals = ctrl.value;
                if (!Array.isArray(vals) || vals.length === 0) {
                    return false;
                }
                const uploadKeys = (c as any).columns
                    .filter(filterFunc)
                    .map((col: any) => col.key) as string[];
                if (uploadKeys.length === 0) {
                    return false;
                }

                return vals.some((row) => {
                    return uploadKeys.some(
                        (k) => row[k] && row[k].some((f: UploadFile) => f.status === status)
                    );
                });
            });

        return control;
    }

    async getWorkFlowNodes() {
        const params: any = this.$route.query;
        const workflowInstanceId: string = params.workflowInstanceId;
        const res = await formApi.getWorkFlowNode(workflowInstanceId);
        if (res.errcode === 0 && res.data) {
            return res.data;
        }
        return [];
    }

    get isViewMode() {
        const params = this.$route.query;
        if (params.workflowInstanceId) {
            // 业务表单
            return false;
        }
        if (params.objectId) {
            return false;
        }
        return true;
    }

    /**
     * 表单加载入口
     */
    async load(edit?: boolean, callback?: Function) {
        let params = JSON.parse(JSON.stringify(this.$route.query));
        this.workflowInstanceId = (params.workflowInstanceId as string) || "";

        const relevanceQuery = Object.assign({}, params);
        delete relevanceQuery.return;
        delete relevanceQuery.startWorkflowCode;
        delete relevanceQuery.workItemId;
        delete relevanceQuery.workitemId;
        delete relevanceQuery.workflowInstanceId;
        delete relevanceQuery.objectId;
        delete relevanceQuery.schemaCode;
        delete relevanceQuery.sheetCode;
        delete relevanceQuery.ssc;
        delete relevanceQuery.isWorkFlow;
        this.relevanceQuery = relevanceQuery as any;
        const keys = Object.keys(relevanceQuery);
        if (keys.length > 0) {
            // keys.forEach(k => delete params[k]);
            params.relevanceInfo = JSON.stringify(relevanceQuery);
        }

        if (edit || this.$route.query.edit || this.isViewMode) {
            // 流程表单 非编辑 不要 params.perms
            params.perms = "edit";
            this.inEdit = true;
            // if (this.workflowInstanceId && !edit) {
            //   this.inEdit = false;
            //   delete params.perms
            // }
        } else {
            this.inEdit = false;
        }

        if (this.nodesParams) {
            params = Object.assign({}, params, this.nodesParams);
            // params.return = this.nodesParams.return;
        }
        if (params.workitemType) {
            params.return = params.workitemType;
        }
        if (params.workflowMock) {
            // 流程模拟load增加标识参数simulative
            params.simulative = true;
        }
        let mbsKey: string | null = null;
        if (window.location.href.indexOf('mbsKey') > -1) {
            mbsKey = window.location.href.split('&mbsKey=')[1].split('&')[0] ?? window.location.href.split('&mbsKey=')[1]
        }
        if (mbsKey) this.$set(params, 'mbsKey', mbsKey)
        const res = await formApi.load(params);
        const data = "";
        if (res.errcode === 0 && res.data && res.data.bizSheet?.publishedAttributesJson) {
            // eslint-disable-next-line no-shadow
            await this.formLoad(res.data.bizSheet.publishedAttributesJson, (data) => {
                if (res && res.data && res.data.bizSheet && res.data.bizSheet.publishedAttributesJson) {
                    res.data.bizSheet.publishedAttributesJson = data;
                    const extraProperty = callback?.();
                    if (extraProperty) {
                        if (extraProperty.name === 'bim_config') {
                            const seriData = JSON.parse(res.data.bizSheet.publishedAttributesJson);
                            const originProperty = seriData.reportCode.options.options.split(';');
                            //TODO: sort
                            seriData.reportCode.options.options = originProperty.concat(extraProperty.value).join(';');
                            const temp = new Set(seriData.reportCode.options.options.split(';'));
                            const finalStr = Array.from(temp).join(';');
                            seriData.reportCode.options.options = finalStr;
                            //@ts-ignore
                            res.data.bizSheet.publishedAttributesJson = JSON.stringify(seriData);
                        }
                        if (extraProperty.name === 'report_config') {
                            const seriData = JSON.parse(res.data.bizSheet.publishedAttributesJson);
                            const appCode = params.schemaCode.split('_')[0];
                            if (!seriData[appCode + '_report_group']) return
                            for (let i = 0; i < seriData[appCode + '_report_group'].columns.length; i++) {
                                const dataTem = seriData[appCode + '_report_group'].columns[i];
                                if (dataTem.key === 'left_report') {
                                    const originLeftProperty = dataTem.options.options.split(';');
                                    seriData[appCode + '_report_group'].columns[i].options.options = Array.from(new Set(originLeftProperty.concat(extraProperty.value).join(';').split(';'))).join(';');
                                }
                                if (dataTem.key === 'middle_report') {
                                    const originMiddleProperty = dataTem.options.options.split(';');
                                    seriData[appCode + '_report_group'].columns[i].options.options = Array.from(new Set(originMiddleProperty.concat(extraProperty.value).join(';').split(';'))).join(';');
                                }
                                if (dataTem.key === 'right_report') {
                                    const originRightProperty = dataTem.options.options.split(';');
                                    seriData[appCode + '_report_group'].columns[i].options.options = Array.from(new Set(originRightProperty.concat(extraProperty.value).join(';').split(';'))).join(';');
                                }
                                if (dataTem.key === "up_report") {
                                    const originUpProperty = dataTem.options.options.split(';');
                                    seriData[appCode + '_report_group'].columns[i].options.options = Array.from(new Set(originUpProperty.concat(extraProperty.value).join(';').split(';'))).join(';');
                                }
                            }
                            //@ts-ignore
                            res.data.bizSheet.publishedAttributesJson = JSON.stringify(seriData);
                        }
                        if (extraProperty.name === 'dataCenter_rdp') {
                            const seriData = JSON.parse(res.data.bizSheet.publishedAttributesJson);
                            const appCode = params.schemaCode.split('_')[0];
                            if (!seriData[appCode + '_rdp_group']) return
                            for (let i = 0; i < seriData[appCode + '_rdp_group'].columns.length; i++) {
                                const dataTem = seriData[appCode + '_rdp_group'].columns[i];
                                console.log(dataTem);
                                if (dataTem.key === "upRdp") {
                                    const originLeftProperty = dataTem.options.options.split(';');
                                    seriData[appCode + '_rdp_group'].columns[i].options.options = Array.from(new Set(originLeftProperty.concat(extraProperty.value).join(';').split(';'))).join(';');
                                }
                                if (dataTem.key === "rightRdp") {
                                    const originMiddleProperty = dataTem.options.options.split(';');
                                    seriData[appCode + '_rdp_group'].columns[i].options.options = Array.from(new Set(originMiddleProperty.concat(extraProperty.value).join(';').split(';'))).join(';');
                                }
                                if (dataTem.key === "allRdp") {
                                    const originRightProperty = dataTem.options.options.split(';');
                                    seriData[appCode + '_rdp_group'].columns[i].options.options = Array.from(new Set(originRightProperty.concat(extraProperty.value).join(';').split(';'))).join(';');
                                }
                                if (dataTem.key === 'routing') {
                                    const originRouteProperty = dataTem.options.options.split(';');
                                    seriData[appCode + '_rdp_group'].columns[i].options.options = Array.from(new Set(originRouteProperty.concat(extraProperty.routes).join(';').split(';'))).join(';');
                                }
                            }
                            //@ts-ignore
                            res.data.bizSheet.publishedAttributesJson = JSON.stringify(seriData);
                        }
                    }
                }
            });
        }
        if (res.errcode !== 0 || !res.data) {
            let msg = "";
            switch (res.errcode) {
                case 550005:
                    msg =
                        res.errmsg ||
                        this.$t("cloudpivot.form.runtime.tip.errTips19").toString();
                    this.$message.error(msg, 3);
                    break;
                case 550007:
                    msg = this.$t("cloudpivot.form.runtime.tip.errTips14").toString();
                    break;
                case 550008:
                    msg = this.$t("cloudpivot.form.runtime.tip.errTips15").toString();
                    break;
                case 550006:
                    msg = this.$t("cloudpivot.form.runtime.tip.errTips16").toString();
                    break;
                case 550009:
                    msg = this.$t("cloudpivot.form.runtime.tip.errTips17").toString();
                    break;
            }
            if (msg) {
                this.$message.error(msg, 3);
            }
            throw res;
        }
        FormDetailService.setReplayToken(this.formPath); // 设置 replayToken

        this.formObj = res.data;

        if (this.formObj.commentInfo) {
            const comment = this.formObj.commentInfo;
            if (comment.originator) {
                let type = "";
                if (comment.type === 1) {
                    type = "转办";
                } else if (comment.type === 2) {
                    type = "协办";
                } else if (comment.type === 3) {
                    type = "加签";
                } else if (comment.type === 4) {
                    type = "传阅";
                }
                const msg = `${comment.originator.name}${type}给你：${
                    comment.comment || ""
                }`;
                this.comment = msg;
            }
        }
        this.getDataModal(); // 获取表单数据模型信息
        // 处理关联表单读取显示字段一直为单据号的问题
        const bizSheet = this.formObj.bizSheet;

        const formData = this.formObj.bizObject.data;
        const formDefine = this.formObj.bizSheet;
        // formDefine.sheetType = 1;
        // formDefine.pcUrl = '/template1.html';

        const actionObj = this.formObj.formPermission.actionPermission;
        this.actions = this.getActions(Object.assign({}, actionObj));

        // 1自定义表单
        if (formDefine.sheetType === 1) {
            await this.loadCustomForm(formDefine.pcUrl);
        } else {
            await this.initSystemForm();
        }
    }

    async formLoad(params, callback) {
        await listApi.dataManageLoad({publishedAttributesJson: params}).then(res => {
            callback(res.data.publishedAttributesJson)
        })
    }

    initIframe(url: string) {
        const iframe = document.createElement("iframe");
        iframe.width = "0";
        iframe.height = "0";
        iframe.style.position = "absolute";
        iframe.style.top = "-100px";
        iframe.src =
            url + (url.indexOf("?") > -1 ? "&" : "?") + `t=${new Date().getTime()}`;

        this.iframe = iframe;

        this.$el.appendChild(iframe);

        if (iframe.contentWindow) {
            const iframeWindow = iframe.contentWindow as any;
            iframeWindow.axios = axios;
        }

        return iframe;
    }

    /**
     * 加载自定义表单
     * @param url
     */
    async loadCustomForm(url: string) {
        try {
            const res = await axios.get(url);
        } catch {
            throw new Error("无法加载自定义表，请检查url配置");
        }

        return new Promise<void>((resolve, reject) => {
            const _this = this;
            (window as any).initCustomForm = (tpl: any) => {
                _this.initCustomForm(tpl);
                resolve();
            };

            this.initIframe(url);
        });
    }

    /**
     * 初始化自定义表单
     * @param tpl
     */
    async initCustomForm(tpl: any) {
        if (tpl.styles) {
            tpl.styles.forEach((s: any) => this.$el.appendChild(s));
        }

        if (tpl.scripts) {
            tpl.scripts.forEach((s: any) => this.$el.appendChild(s));
        }

        if (tpl.toolbar) {
            tpl.toolbar.forEach((x: any) => {
                x.visible = true;
                x.disabled = false;
                this.actions.push(x);
            });
        }

        this.hooks = tpl.customScript;

        const controls = components.FormRendererHelper.convertTemplate(
            tpl.template
        );
        await this.initForm(controls);
    }

    /**
     * 初始化系统表单
     */
    async initSystemForm() {
        const formDefine = this.formObj.bizSheet;
        //获取数据模型中关联表单配置的字段引用信息
        const schemaCode: any = this.formObj.bizObject.schemaCode || "";
        // 获取数据模型中关联表单配置的字段引用
        const {data, errcode, errmsg} = await formApi.getRelativeQuote({
            schemaCode,
        });
        let qouteList: Array<any> = [];
        if (errcode === 0) {
            qouteList = data;
        }

        //处理日期控件默认值
        const formControls = components.FormRendererHelper.handleDataDefault(
            this.formObj.bizSchema.properties,
            JSON.parse(formDefine.publishedAttributesJson),
            qouteList
        );
        const layout = JSON.parse(formDefine.publishedViewJson) as string[][];
        this.handleApproval(formControls, layout);

        if (formDefine.publishedActionsJson) {
            const actions = JSON.parse(formDefine.publishedActionsJson);
            if (actions && actions.length > 0) {
                this.actions = this.actions.concat(actions);
            }
        }

        if (formDefine.publishedHtmlJson) {
            const els = JSON.parse(
                formDefine.publishedHtmlJson
            ) as schema.FormElement[];
            if (els && els.length > 0) {
                const scriptEl = els.find((e) => e.id === "customScript");
                if (scriptEl && scriptEl.innerHTML) {
                    this.hooks = parseScript(scriptEl.innerHTML);
                }

                const tags = ["style", "script"];

                els
                    .filter(
                        (el) => tags.indexOf(el.tagName) > -1 && el.id !== "customScript"
                    )
                    .map((el) => schema.createHTMLElement(el))
                    .filter((el) => el !== null)
                    .forEach((el) => el && this.$el.appendChild(el));
            }
        }
        const controls = components.FormRendererHelper.convertDesign(
            formControls,
            layout
        );
        await this.initForm(controls);
    }

    /**
     * 迭代20需求
     * 将表单中的审批意见控件去除，并根据操作按钮添加固定key值的审批意见
     */
    handleApproval(controls: any, layout: string[][]) {
        layout.forEach((row, ri) => {
            row
                .map((col, ci) => {
                    const c = controls[col];
                    if (c && c.type === FormControlType.ApprovalOpinion) {
                        return ci;
                    }
                    return -1;
                })
                .filter((i) => i !== -1)
                .reverse()
                .forEach((i) => row.splice(i, 1));
        });

        layout
            .map((row, i) => (row.length === 0 ? i : -1))
            .filter((i) => i !== -1)
            .reverse()
            .forEach((i) => layout.splice(i, 1));

        // 只要有驳回按钮就显示审批意见

        if (this.actions.some((ac) => ac.code === FormAction.Reject)) {
            const key = "$approval";

            if (!this.isMobile) {
                const groupControlOpts = new schema.GroupTitleOptions();
                groupControlOpts.name = this.$t(
                    "cloudpivot.form.renderer.opinion"
                ).toString();
                const groupControl = {
                    key: key + "_group",
                    options: groupControlOpts,
                    type: FormControlType.Group,
                };

                controls[groupControl.key] = groupControl;
                layout.push([groupControl.key]);
            }

            const options = new schema.ApprovalOpinionOptions();
            if (this.isMobile) {
                options.visible = false;
            }
            options.name = this.$t("cloudpivot.form.renderer.opinion").toString();
            options.limit = schema.UploadLimitType["10M"];

            const control = {
                key,
                options,
                type: FormControlType.ApprovalOpinion,
                required: false,
            };

            controls[key] = control;

            this.approval = control as any;

            // if (!this.isMobile) {
            //   layout.push([key]);
            // }

            layout.push([key]);
        }
    }

    /**
     * 初始化表单
     * @param controls
     */
    async initForm(controls: any) {
        const _this = this;
        const formControls: RendererFormControl[] = [];
        components.FormRendererHelper.findFormControl(controls, formControls);
        this.formControls = formControls;

        const titleControl = formControls.find(
            (c) => c.type === FormControlType.Title
        );
        if (titleControl && this.formObj.instanceName) {
            titleControl.options.name = this.formObj.instanceName;
            titleControl.options.name_i18n.en = this.formObj.instanceName;
        }

        const data = this.formObj.bizObject.data;

        data.schemaCode = this.formObj.bizObject.schemaCode;
        data.sheetCode = this.formObj.bizObject.sheetCode;

        (window as any).axios = axios;

        let tasks = this.callLifecycleHook(LifecycleHookNames.OnLoad, [
            this.formObj.bizObject.data,
            this.formObj.formPermission.dataPermissions,
        ]);

        if (tasks) {
            tasks = tasks.filter((r) => r && r.then);
            if (tasks.length > 0) {
                const results = await Promise.all(tasks);
                if (results[0]) {
                    this.formObj.bizObject.data = results[0];
                }
            }
        }
        const publishedAttributesJson = JSON.parse(this.formObj.bizSheet.publishedAttributesJson);
        const relativeData: Array<any> = [];
        const relativeKey: Array<string> = [];
        let pubSchemaCode: string = '';
        let pubQueryCode: string = '';
        const finalRelative: any = {};
        if (window.location.href.indexOf('add') > -1) {
            //解析找到映射字段
            Object.getOwnPropertyNames(publishedAttributesJson).forEach(function (v: any) {
                const tempt = publishedAttributesJson[v].options;
                //筛选关联到工程建设信息表的关联单选
                if (publishedAttributesJson[v].type === 80 && tempt.schemaCode.indexOf("gcjsxx_1") !== -1) {
                    pubSchemaCode = tempt.schemaCode;
                    pubQueryCode = tempt.queryCode;
                    //处理mappings格式
                    const temp1 = tempt.mappings.split("{").join("").split("}").join("").split(";");
                    temp1.forEach(function (m: string) {
                        const tempt2: Array<string> = m.split(':');
                        if (tempt2.length > 1) {
                            const tempt3: any = {};
                            _this.$set(tempt3, tempt2[0], tempt2[1]);
                            relativeData.push(tempt3);
                            relativeKey.push(tempt2[0] as string)
                        }
                    })
                }
            })
            await listApi.getQueryList({
                filters: [],
                options: {
                    customDisplayColumns: relativeKey,
                    queryDisplayType: listParams.QueryDisplayType.Append
                },
                mobile: false,
                page: 0,
                queryCode: pubQueryCode,
                schemaCode: pubSchemaCode,
                size: 9999999,
            }).then(res => {
                if (res.errcode === 0) {
                    const resContent = res.data.content;
                    resContent.forEach(function (v: any) {
                        const resData = v.data;
                        if (resData.xmjc_1 === _this.projectConfig?.projectName) {
                            relativeData.forEach(function (m) {
                                if (resData.hasOwnProperty(Object.keys(m)[0])) {
                                    _this.$set(finalRelative, m[Object.keys(m)[0]], resData[Object.keys(m)[0]])
                                }
                            })
                        }
                    })
                }
            })
            console.log('映射关系', relativeData, finalRelative)
            this.formObj.bizObject.data = Object.assign(this.formObj.bizObject.data, finalRelative);
        }
        console.log('this.formObj', this.formObj);
        this.toFormData(controls, this.formObj.bizObject.data);
        components.FormRendererHelper.synthetize(
            formControls,
            this.formObj.bizObject.data,
            this.formObj.formPermission.dataPermissions,
            this.isNew
        );
        this.controls = controls;
        this.onRendered([data]);
    }

    editing(addSave?: boolean) {
        this.$nextTick(() => {
            this.formRenderer.edit();
        });

        const btnSave = {
            code: FormAction.Save,
            disabled: true,
            visible: false,
            text: this.getLocale(`action.${FormAction.Save}`),
        };
        // 流程外链表单不追加暂存按钮
        if (this.isWorkflowForm && addSave && !(window as any).isExternal) {
            const index = this.actions.findIndex((ac) => ac.code === FormAction.Save);
            if (index === -1) {
                this.actions.splice(0, 0, btnSave);
            }
        }
    }

    onRendered(args: any) {
        setTimeout(() => {
            if (this.formRenderer) {
                if (this.isWorkflowForm) {
                    // 如果是系统管理员，所有表单控件都是可写的
                    if (this.inEdit) {
                        if (this.currentUser.isAdmin) {
                            const formControls: RendererFormControl[] = [];
                            components.FormRendererHelper.findFormControl(
                                this.controls,
                                formControls
                            );
                            for (const control of formControls) {
                                control.writable = true;
                                if (control.type === schema.FormControlType.Sheet) {
                                    (control as any).columns.forEach(
                                        (col: any) => (col.writable = true)
                                    );
                                }
                            }
                        }
                    }
                    this.editing(this.inEdit);
                } else {
                    const canEdit = this.formObj.formPermission.actionPermission[
                        FormAction.Edit
                        ];

                    if (!this.formObj.bizObject.sequenceStatus) {
                        this.editing();
                    } else if (this.inEdit && canEdit) {
                        this.editing();
                    }
                }

                const controls = this.formRenderer.findFormControls();

                setTimeout(() => {
                    if (this.relevanceQuery) {
                        const keys = Object.keys(this.relevanceQuery);

                        const rfControls = controls.filter(
                            (c) =>
                                (c.type === schema.FormControlType.RelevanceForm || c.type === schema.FormControlType.RelevanceFormEx) &&
                                keys.indexOf(c.key) > -1
                        );

                        for (const c of rfControls) {
                            const item = this.formObj.bizObject.data[c.key];
                            if (!item) {
                                continue;
                            }

                            const val = Object.assign({}, item);
                            const ctrl = c.controller as RadioControl;
                            const mappings = (ctrl.options as any).mappings;
                            if (mappings) {
                                for (const key in mappings) {
                                    if (val[key] === undefined) {
                                        continue;
                                    }
                                    const target = mappings[key];
                                    const control = controls.find(
                                        (itemObj) =>
                                            itemObj.key ===
                                            (Array.isArray(target) ? target[0] : target)
                                    );
                                    if (control) {
                                        if (
                                            control.type === schema.FormControlType.Sheet &&
                                            Array.isArray(val[key])
                                        ) {
                                            ((control as any) as schema.FormSheet).columns.forEach(
                                                (col) => {
                                                    for (const row of val[key]) {
                                                        delete row.id;
                                                        row[col.key] = this.convertFormControlValue(
                                                            key,
                                                            col,
                                                            row[col.key]
                                                        );
                                                    }
                                                }
                                            );
                                        }

                                        val[key] = this.convertFormControlValue(
                                            key,
                                            control,
                                            val[key]
                                        );
                                    }
                                }
                            }
                            ctrl.value = val;
                        }
                    }
                }, 500);

                if (this.formObj.workItemId) {
                    setTimeout(() => {
                        this.loadComment();
                    }, 500);
                }
                // 流程表单也需要执行initRelevanceForm
                if (this.inEdit || this.isNew || this.isWorkflowForm) {//编辑状态也需要对关联表单控件进行初始化动作
                    setTimeout(() => {
                        // 子表中如果有关联表单,需要等待 row构建好
                        this.initRelevanceForm(controls);
                    }, 1000);
                }

                setTimeout(() => {
                    this.callLifecycleHook(LifecycleHookNames.OnRendered, args);
                    this.actions.forEach(el => {
                        this.$set(el, 'disabled', false)
                    })
                }, 1000);
            } else {
                this.onRendered(args);
            }
        }, 50);
    }

    initRelevanceForm(controls: any[]) {
        const _tempCol: any[] = [];
        controls
            .filter(
                (c) =>
                    (c.type === schema.FormControlType.RelevanceForm || c.type === schema.FormControlType.RelevanceFormEx) &&
                    c.options.defaultVal
            )
            .forEach((c, i) => {
                // debugger;
                const ctrl = c.controller;
                ctrl &&
                ctrl.commander.next({
                    name: "init",
                    args: i
                });
            });

        controls
            .filter((c: FormSheet) => c.type === schema.FormControlType.Sheet)
            .forEach((c) => {
                const cols = c.columns.filter(
                    (col) =>
                        (col.type === schema.FormControlType.RelevanceForm || col.type === schema.FormControlType.RelevanceFormEx) &&
                        col.options.defaultVal
                );
                if (cols.length === 0) {
                    return;
                }

                const fn = (index: number) => {
                    const row = c.controller.rows[index];
                    for (const col of cols) {
                        const child = row.findChild(col.key);
                        if (child) {
                            child.commander.next({
                                name: "init",
                                args: index
                            });
                        }
                    }
                };
                if (!c.controller) {
                    _tempCol.push(c);
                }
                for (let i = 0; i < c.controller.rows.length; i++) {
                    // setTimeout(() => fn(i), 500);
                    fn(i);
                }

                c.controller.rowChange.subscribe((change) => {
                    if (change.type === RowChangeType.Insert) {
                        // setTimeout(() => fn(change.index), 500);
                        fn(change.index);
                    } else if (change.type === RowChangeType.InsertMulti) {
                        if (change.insertCount) {
                            // setTimeout(() => {
                            for (let i = 0; i < change.insertCount; i++) {
                                fn(change.index + i);
                            }
                            // }, 500);
                        }
                    }
                });
            });
        if (_tempCol.length) {
        }
    }

    convertFormControlValue(
        sourceKey: string,
        control: schema.FormControl,
        val: any
    ) {
        if (sourceKey === "sequenceStatus") {
            if (val && this.$i18n.locale === "zh") {
                const text = form.sequenceStatusZh[val];
                if (text) {
                    return text;
                }
            }
        }
        return renderer.FormControlValueService.convert(
            control.type,
            val,
            control.options.multi
        );
    }

    /**
     * 加载暂存的审批意见
     */
    async loadComment() {
        const instanceId = this.formObj.workflowInstanceId;
        const tokenId = this.formObj.workflowTokenId;
        const itemId = this.formObj.workItemId;

        if (!itemId || !instanceId || !tokenId) {
            return;
        }

        if (this.approval) {
            const res = await workflowApi.getComment({
                workflowInstanceId: instanceId,
                tokenId,
                workItemId: itemId,
            });

            if (res.errcode === 0 && res.data) {
                this.approval.controller.value = res.data;
            }
        }
    }

    /**
     * 根据表单权限创建表单按钮列表
     * @param actionObj
     */
    getActions(actionObj: any) {
        const actions: FormActionButton[] = [];

        if (!actionObj) {
            return actions;
        }

        if (actionObj[FormAction.Edit]) {
            // 流程表单不显示编辑按钮
            if (this.workflowInstanceId) {
                delete actionObj[FormAction.Edit];
            } else {
                delete actionObj[FormAction.Save];
                delete actionObj[FormAction.Submit];
            }
        }

        Object.keys(FormAction).forEach((k) => {
            const code = (FormAction as any)[k];
            if (actionObj[code]) {
                actions.push({
                    code,
                    disabled: false,
                    visible: true,
                    loading: false,
                    text: this.getLocale(`action.${code}`).toString(),
                });
            }
        });

        const sorts: any = {
            [FormAction.Submit]: 1,
            [FormAction.Agree]: 1,
            [FormAction.DisAgree]: 2,
            [FormAction.Save]: 2,
            [FormAction.Reject]: 2,
            [FormAction.Edit]: 2,
            [FormAction.Urge]: 3,
            [FormAction.Comment]: 4,
        };

        actions.sort(
            (a, b) =>
                (sorts[a.code] ? sorts[a.code] : 99) -
                (sorts[b.code] ? sorts[b.code] : 99)
        );

        return actions;
    }

    /**
     * 调用生命周期钩子
     * @param hook
     * @param argus
     */
    callLifecycleHook(hook: LifecycleHookNames, argus?: any[]) {
        if (!this.proxy) {
            if (platform.IS_IE) {
                this.proxy = this;
            } else {
                this.proxy = new Proxy(this, new FormDetailProxyHandler());
            }
            (window as any).h3form = this.proxy;
        }

        if (!this.hooks) {
            return;
        }

        const funcs = this.hooks[hook];
        if (!funcs || funcs.length === 0) {
            return;
        }

        try {
            const results = funcs.map((f) => f.apply(this.proxy, argus));
            return results;
        } catch (e) {
            console.log(`callLifecycleHook${e}`);
        }
    }

    validateApproval() {
        if (this.approval && this.approval.required) {
            const val = this.approval.controller.value;
            if (!val || !val.content) {
                const msg = this.$t(
                    "cloudpivot.form.runtime.modal.pleaseInputOpinion"
                ).toString();
                this.$message.error(msg, 3);
                return false;
            }
        }
        return true;
    }

    /**
     * 表单按钮Click事件处理
     * @param ac
     */
    async onAction(ac: FormActionButton) {
        const arrs = [FormAction.Reject, FormAction.Agree, FormAction.DisAgree];
        if (arrs.includes(ac.code)) {
            this.setApproval(ac);
        }

        if (
            ac.code === FormAction.Assist ||
            ac.code === FormAction.Circulate ||
            ac.code === FormAction.Reject ||
            ac.code === FormAction.Forward ||
            ac.code === FormAction.AdjustParticipant ||
            ac.code === FormAction.Urge ||
            ac.code === FormAction.Comment ||
            ac.code === FormAction.EditOwner
        ) {
            this.showActionModal(ac);
        } else if (
            ac.code === FormAction.Agree ||
            ac.code === FormAction.Submit ||
            ac.code === FormAction.DisAgree
        ) {
            this.disableActionBtn(ac, true);
            this.$nextTick(async () => {
                const valid = await this.doValidate(ac);
                if (valid === true) {
                    this.presubmit(ac);
                } else {
                    this.disableActionBtn(ac, false);
                }
            });
        } else if (
            ac.code === FormAction.Cancel ||
            ac.code === FormAction.Retrieve ||
            ac.code === FormAction.FinishInstance ||
            ac.code === FormAction.Delete
        ) {
            if (!this.isWorkflowForm && ac.code === FormAction.Cancel) {
                const hideLoader = this.$message.loading(false);
                this.clean();
                this.load().then(() => {
                    hideLoader();
                });
            } else {
                const okText =
                    ac.code === FormAction.Delete
                        ? this.$t("languages.common.okAndDelete")
                        : this.$t("languages.common.ok");

                const self = this;

                this.$confirm({
                    title: ac.text,
                    content: this.getLocale(`tip.${ac.code}`),
                    okText: okText.toString(),
                    cancelText: this.$t("languages.common.cancel").toString(),
                    onOk() {
                        self.doAction(ac);
                    },
                });
            }
        } else {
            const sequenceStatus = this.formObj.bizObject.data.sequenceStatus;
            ac.code === FormAction.Save && this.disableActionBtn(ac, true);
            this.$nextTick(async () => {
                if (ac.code === FormAction.Save) {
                    if (sequenceStatus && sequenceStatus !== form.SequenceStatus.Draft) {
                        const valid = await this.doValidate(ac);
                        if (valid !== true) {
                            this.disableActionBtn(ac, false);
                            return;
                        }
                    } else {
                        if (this.validate(true) === false) {
                            this.disableActionBtn(ac, false);
                            return;
                        }
                    }
                }
                this.doAction(ac);
            });
        }
    }

    // 顶部操作按钮 禁用和放开
    disableActionBtn(ac: FormActionButton, status: boolean) {
        const reloadCodeType = [FormAction.Save, FormAction.Submit, FormAction.Agree];
        const $btn: any = "";
        if (reloadCodeType.includes(ac.code)) {
            this.actions.forEach((val) => (val.disabled = status));
        }
    }

    /**
     * @desc 用户没有输入值的时候点击确认自动赋值
     * @param ac 按钮对象
     */
    setApproval(ac: any) {
        let content = ac.text;
        if (ac.code === FormAction.Reject) {
            content = "不同意";
        }

        if (
            "approval" in this &&
            typeof this.approval === "object" &&
            !this.approval.controller.value
        ) {
            if (this.isMobile) {
                // 移动端先将内容存储
                window.sessionStorage.setItem("$approval", content);
            } else {
                this.approval.controller.value = {
                    content,
                };
            }
        }
    }

    /**
     * 表单按钮Click事件处理
     * @param ac
     */
    async doAction(ac: FormActionButton, data?: any) {
        let res: any;

        try {
            const beforeReuslt = await this.beforeAction(ac);
            if (beforeReuslt === false) {
                return;
            }

            let err: any;
            const actionResult = this.executeAction(ac, data);

            // 处理 Firefox 兼容性
            if (actionResult) {
                try {
                    res = await actionResult;
                } catch (e) {
                    err = e;
                }
            }

            const afterReuslt = await this.onActionDone(ac, res, err);
            if (afterReuslt === false) {
                return;
            }
        } catch (error) {
            console.error("doAction 执行错误!", error);
            this.disableActionBtn(ac, false);
            throw error;
        } finally {
            // 暂存,提交,同意 防止重复点击;
            // this.disableActionBtn(ac, false);
        }

        if (res) {
            if (res.errcode === 0) {
                if (ac.code === FormAction.Retrieve) {
                    this.retrieveCallBack(ac);
                } else if (ac.code === FormAction.EditOwner) {
                    this.reload();
                } else {
                    this.goto(ac, res);
                }

                // 关联表单需要刷新标签页
                window.localStorage.setItem("relevanceFormAddData", "true");
            } else {
                this.handleError(res);
                setTimeout(() => {
                    this.disableActionBtn(ac, false);
                }, 1000);
            }
        }
    }

    /**
     * 表单撤回后
     */

    retrieveCallBack(ac: FormActionButton) {
        const workflowInstanceId = this.$route.query.workflowInstanceId as string;
        const vm = this;
        this.timer = setInterval(() => {
            const params = {
                workflowInstanceId,
                activityCode: this.formObj.activityCode as string,
            };
            workflowApi.isRetrieve(params).then((res) => {
                if (res.errcode === 0) {
                    if (!res.data) {
                        // 撤回成功获得新流程实例id 刷新表单
                        workflowApi
                            .getWorkitemByInstanceid({workflowInstanceId})
                            .then((result) => {
                                if (result.errcode === 0) {
                                    vm.goto(ac, result);
                                }
                            });
                        clearInterval(vm.timer);
                    }
                } else {
                    this.$message.error(res.errmsg || "", 3);
                    clearInterval(vm.timer);
                }
            });
        }, 1000);
    }

    /**
     * 构建按钮事件数据
     */
    buildActionData() {
        // const data = this.getFormValue(false);
        const formRenderer = this.formRenderer;
        const data = formRenderer.getValue();
        if (data && this.formObj && this.formObj.bizObject) {
            data.id = this.formObj.bizObject.id;
            data.schemaCode = this.formObj.bizSchema.code;
            data.sheetCode = this.formObj.bizSheet.code;
            data.sequenceStatus = this.formObj.bizObject.sequenceStatus;
            data.sequenceNo = this.formObj.bizObject.sequenceNo;
        }
        return data;
    }

    /**
     * 表单按钮操作前事件
     * @param ac
     */
    async beforeAction(ac: FormActionButton) {
        const data = this.buildActionData();

        const args = [ac, data];
        if (ac.code !== FormAction.Print) {
            const results = this.callLifecycleHook(
                LifecycleHookNames.OnPreAction,
                args
            );

            if (results) {
                if (results.some((r) => r === false)) {
                    return false;
                }

                const tasks = results.filter((r) => r instanceof Promise);
                if (tasks.length > 0) {
                    const taskResults = await Promise.all(tasks);
                    if (taskResults.some((r) => r === false)) {
                        return false;
                    }
                }
            }
        }

        return true;
    }

    /**
     * 执行表单按钮逻辑
     * @param ac
     */
    executeAction(ac: FormActionButton, data?: any): Promise<any> | any {
        if (ac.code === FormAction.Submit) {
            const isAdmin: boolean = localStorage.getItem('_isAdmin') === 'true'
            if (isAdmin) {
                this.$message.warn("拥有者没有所属部门，不能提交表单");
                return
            }
        }
        
        switch (ac.code) {
            
            case FormAction.Save:
                return this.save();

            case FormAction.Agree:
            case FormAction.Submit:
                this.disableActionBtn(ac, true);
                return this.submit(ac.code, data.deptId, true, data.trustor);

            case FormAction.DisAgree:
                this.disableActionBtn(ac, true);
                return this.submit(ac.code, data.deptId, false);

            case FormAction.Print:
                this.print(ac);
                break;

            case FormAction.Edit:
                this.edit();
                break;

            case FormAction.Cancel:
                return this.cancel();

            case FormAction.Retrieve:
                return this.retrieve();

            case FormAction.FinishInstance:
                return this.finish();

            case FormAction.Delete:
                return this.delete();

            case FormAction.Assist:
            case FormAction.Circulate:
            case FormAction.Reject:
            case FormAction.Forward:
            case FormAction.AdjustParticipant:
            case FormAction.Urge:
                return this.onActionModalOk(ac, data);
            case FormAction.EditOwner:
                return this.handleEditOwner(data);
            default:
                return this.onCustomAction(ac);
        }
    }

    // 处理修改拥有者
    async handleEditOwner(data: any) {
        const res: any = await listApi.modifyOwner(data);
        return res;
    }

    /**
     * 自定义按钮事件处理
     * @param ac
     */
    onCustomAction(ac: FormActionButton) {
        const data = this.buildActionData();
        const args = [ac, data];
        const results = this.callLifecycleHook(
            LifecycleHookNames.OnCustomAction,
            args
        );
        if (results && results.length > 0) {
            return results[0];
        }
    }

    /**
     * 表单按钮操作后事件
     * @param ac
     */
    async onActionDone(ac: FormActionButton, res: any, err: any) {
        const data = this.buildActionData();
        const args = [ac, data, res, err];
        const results = this.callLifecycleHook(
            LifecycleHookNames.OnActionDone,
            args
        );

        if (results) {
            if (results.some((r) => r === false)) {
                return false;
            }

            const tasks = results.filter((r) => r instanceof Promise);
            if (tasks.length > 0) {
                const taskResults = await Promise.all(tasks);
                if (taskResults.some((r) => r === false)) {
                    return false;
                }
            }
        }
        return true;
    }

    /**
     * 按钮弹窗
     * @param ac
     */
    async showActionModal(ac: FormActionButton) {
        let opts: FormActionModalOptions;

        if (ac.code === FormAction.Reject) {
            opts = {
                title: ac.text,
                code: ac.code,
                data: this.formObj,
                approval: this.approval,
                createrName: this.formObj.bizObject && this.formObj.bizObject.creater.name
            };
        } else {
            opts = {
                title: ac.text,
                code: ac.code,
                data: this.formObj,
                approval: this.approval
            };
        }

        const modal = (this.$refs.actionModal as any) as FormActionModal;
        modal.show(opts);
        // const data = await modal.show(opts);

        // const p = ac.code === FormAction.Reject ? this.reject(data) : this.forword(data, ac);

        // return p.then((res) => {
        //   if (res.errcode === 0) {
        //     modal.close();
        //   }
        //   return res;
        // });
    }

    async onActionModalOk(ac: FormActionButton, data: any) {
        if (ac.code === FormAction.Urge) {
            this.urgeHandler(data);
            return;
        } else {
            const p =
                ac.code === FormAction.Reject
                    ? this.reject(data)
                    : this.forword(data, ac);

            const res = await p;

            if (res.errcode === 0) {
                const modal = (this.$refs.actionModal as any) as FormActionModal;
                modal.close();
            }

            return res;
        }

        // return p.then((res) => {
        //   if (res.errcode === 0) {
        //     const modal = this.$refs.actionModal as any as FormActionModal;
        //     modal.close();
        //   }
        //   return res;
        // });
    }

    async doValidate(ac: FormActionButton) {
        // 流程模拟不做表单校验
        if (this.$route.query.workflowMock) {
            return true;
        }
        const valid = this.validate();
        if (valid === false) {
            return Promise.resolve(false);
        }

        const data = this.buildActionData();

        const args = [ac, data];
        const results = this.callLifecycleHook(LifecycleHookNames.OnValidate, args);

        if (results) {
            if (results.some((r) => r === false)) {
                return Promise.resolve(false);
            }

            const tasks = results.filter((r) => r instanceof Promise);
            if (tasks.length > 0) {
                const taskResults = await Promise.all(tasks);
                if (taskResults.some((r) => r === false)) {
                    return false;
                }
            }
        }

        return true;
    }

    /**
     * 驳回
     */
    async reject(data: any) {
        if (
            !this.approval.controller.value ||
            !(
                !!this.approval.controller.value.content ||
                !!this.approval.controller.value.resources
            )
        ) {
            this.approval.controller.value = {
                content: "不同意",
            };
        }
        const params = this.buildSaveParams() as workflow.RejectParams;
        params.rejectToActivityCode = data.rejectToActivityCode;
        params.submitToReject = data.submitToReject;
        params.formType = "1";

        return workflowApi.rejectWorkItem(params).then((res) => {
            const msg = this.$t(
                "cloudpivot.form.runtime.tip.rejectSuccess"
            ).toString();
            this.$message.success(msg, 3);
            return res;
        });
    }

    /**
     * 转办
     * @param data
     * @param ac
     */
    async forword(data: any, ac: FormActionButton) {
        const params: workflow.ForwardParams = {
            workItemId: this.formObj.workItemId,
            workflowInstanceId: this.formObj.workflowInstanceId,
            activityCode: this.formObj.activityCode,
            comment: data.comment,
            participantors: data.participantors.map((x: any) => x.id),
        } as any;

        if (ac.code === FormAction.Forward) {
            return workflowApi.forwardWorkItem(params);
        }

        const assistParams = params as workflow.AssistParams;
        // assistParams.circulateResource = '1';

        let promise: Promise<any>;
        if (ac.code === FormAction.Assist) {
            promise = workflowApi.assistWorkItem(assistParams);
        } else if (ac.code === FormAction.Circulate) {
            promise = workflowApi.circulateWorkItem(assistParams);
        } else if (ac.code === FormAction.AdjustParticipant) {
            promise = workflowApi.adjustWorkItemParticipators(assistParams);
        } else {
            throw new Error(ac.code);
        }

        return promise.then((res) => {
            if (res.errcode === 0) {
                const lang = this.$i18n.locale || "zh";
                let msg = "";
                if (lang === "zh") {
                    msg = `已成功${ac.text}给${data.participantors[0].name}等${data.participantors.length}人`;
                } else {
                    const acStraight = ac.text.toLowerCase();
                    msg = `You have ${acStraight} the task to ${data.participantors[0].name}`;
                }

                this.$message.success(msg, 3);
            }
            return res;
        });
    }

    /**
     * 打印
     * @param ac
     */
    print(ac: FormActionButton) {
        setTimeout(() => {
            window.print();
        }, 500);
    }

    /**
     * 编辑
     */
    edit() {
        if (this.isWorkflowForm) {
        } else {
            const hideLoader = this.$message.loading(false);
            this.clean();
            this.load(true).then(() => {
                hideLoader();

                const btnSave = {
                    code: FormAction.Save,
                    disabled: false,
                    visible: true,
                    text: this.getLocale(`action.${FormAction.Save}`),
                };

                const index = this.actions.findIndex((ac) => ac.code === FormAction.Edit);
                if (index > -1) {
                    this.actions.splice(index, 1, btnSave);
                }

                let code = FormAction.Submit;
                let text = "";

                if (
                    this.formObj.bizObject.sequenceStatus ===
                    form.SequenceStatus.Completed
                ) {
                    code = FormAction.Cancel;
                    btnSave.text = this.getLocale(`action.save2`);
                    // text = this.getLocale(`action.cancel2`);
                    // index++;
                } else {
                    code = FormAction.Submit;
                    text = this.getLocale(`action.${code}`);

                    this.actions.splice(index, 0, {
                        code,
                        disabled: false,
                        visible: true,
                        text,
                    });
                }
            });
        }
    }

    /**
     * 将API数据转换为表单控件数据
     * @param controls
     * @param data
     */
    toFormData(controls: RendererControl[], data: { [key: string]: any }) {
        for (const key in data) {
            if (Array.isArray(data[key])) {
                for (const item of data[key]) {
                    if (Array.isArray(item.departments)) {
                        item.parentId = item.departments
                            .filter((d: any) => d && d.id)
                            .map((d: any) => d.id);
                    }
                }
            }
        }

        const formControls: RendererFormControl[] = [];
        components.FormRendererHelper.findFormControl(controls, formControls);

        const user = renderer.StaffSelectorControl.service.getCurrentUser() as any;
        const owner = formControls.find((c) => c.type === FormControlType.OwnerId);
        // 如果没有提交过，则更改选人控件
        if (owner) {
            if (!(this as any).formObj) {
                return;
            }
            const formPermission = (this as any).formObj.formPermission;
            let edit = false;
            // || (user && user.isAdmin) permissions
            // 表单新增 或者 流程表单且表单状态为草稿，可以编辑
            if (
                this.isNew ||
                (this.isWorkflowForm &&
                    this.formObj.bizObject &&
                    this.formObj.bizObject.sequenceStatus === "DRAFT")
            ) {
                edit = true;
            } else if (
                formPermission &&
                formPermission.dataPermissions &&
                formPermission.dataPermissions.owner
            ) {
                if (formPermission.dataPermissions.owner.e && user) {
                    if (
                        user.permissions.includes("SYS_MNG") ||
                        user.permissions.includes("ADMIN")
                    ) {
                        edit = true;
                    }
                } else if (
                    this.formObj.bizObject &&
                    this.formObj.bizObject.sequenceStatus === "DRAFT" &&
                    formPermission.dataPermissions.owner.e
                ) {
                    edit = true;
                }
            }

            if (edit) {
                owner.type = FormControlType.StaffSelector;
                owner.required = true;
                owner.value = data[owner.key];
                owner.writable = false;
                owner.edit = edit;
                const options = FormControlOptionsService.buildFor(
                    owner.type,
                    owner.options
                );
                if (options) {
                    options.defaultValueType = schema.StaffSelectorValueType.Originator;
                    owner.options = options;
                }
                this.owner = owner;
            }
        }

        // debugger

        // if (this.isNew || (user && user.isAdmin)) {

        //   if (owner) {
        //     owner.type = FormControlType.StaffSelector;
        //     owner.required = true;
        //     owner.value = data[owner.key];
        //     owner.writable = false;
        //     owner.edit = this.isNew;
        //     const options = FormControlOptionsService.buildFor(
        //       owner.type,
        //       owner.options
        //     );
        //     if (options) {
        //       options.defaultValueType = schema.StaffSelectorValueType.Originator;
        //       owner.options = options;
        //     }
        //     this.owner = owner;
        //   }
        // }

        formControls
            .filter((c) => c.type === FormControlType.Sheet)
            .forEach((c) => {
                const sheetParams = {
                    id: this.formObj.bizObject.id,
                    sheetid: this.formObj.bizSheet.id,
                    formCode: this.formObj.bizSheet.code, // 表单编码
                    schemaCode: this.formObj.bizSchema.code, // 模型编码
                    objectId: this.formObj.bizObject.id, // 表单id
                    sequenceStatus: this.formObj.bizObject.sequenceStatus, // 流程状态
                    subSchemaCode: c.key,
                    workitemId: this.formObj.workItemId,
                };
                const sheetValue = data[c.key];
                c.options.sheetParams = sheetParams;
                if (Array.isArray(sheetValue)) {
                    sheetValue.sort((a, b) => a.sortKey - b.sortKey);
                    sheetValue.forEach((v) => this.toFormData((c as any).columns, v));
                }
            });

        formControls
            .filter(
                (c) =>
                    c.type === FormControlType.Attachment ||
                    c.type === FormControlType.Image
            )
            .forEach((c) => {
                const files = data[c.key];
                if (files && Array.isArray(files)) {
                    data[c.key] = files.map((f: any) => {
                        if (f.refId) {
                            return {
                                uid: f.refId,
                                name: f.name,
                                status: UploadStatus.Done,
                                size: f.fileSize,
                                response: {
                                    data: f,
                                },
                            };
                        } else if (f.uid) {
                            return f;
                        }
                    });
                }
            });

        formControls
            .filter(
                (c) =>
                    c.type === FormControlType.Checkbox ||
                    c.type === FormControlType.Dropdown
            )
            .forEach((c) => {
                const str = data[c.key] as string;
                if (
                    c.type === FormControlType.Checkbox ||
                    (c.type === FormControlType.Dropdown &&
                        (c.options as DropdownOptions).multi)
                ) {
                    if (typeof str === "string") {
                        data[c.key] = str ? str.split(";") : [];
                    }
                }
            });

        formControls
            .filter((c) => c.type === FormControlType.Location)
            .forEach((c) => {
                const str = data[c.key];
                if (str) {
                    try {
                        if (typeof str === "object") {
                            data[c.key] = str;
                        } else {
                            data[c.key] = JSON.parse(str);
                        }
                    } catch (error) {
                        console.log(error);
                    }
                }
            });

        formControls
            .filter((c) => c.type === FormControlType.Date)
            .forEach((c) => {
                let str = data[c.key];
                if (typeof str === "string") {
                    try {
                        // iOS兼容
                        str = str.replace(/-/g, "/");
                        data[c.key] = new Date(str);
                    } catch (error) {
                        console.log(error);
                    }
                }
            });

        formControls
            .filter((c) => c.type === FormControlType.Address)
            .forEach((c) => {
                const str = data[c.key];
                if (typeof str === "string") {
                    try {
                        // iOS兼容
                        data[c.key] = JSON.parse(str);
                    } catch (error) {
                        console.log(error);
                    }
                }
            });

        formControls
            .filter(
                (c) =>
                    c.type === FormControlType.RelevanceForm ||
                    c.type === FormControlType.RelevanceFormEx
            )
            .forEach((c) => {
                if (data[c.key] && !data[c.key].id) {
                    data[c.key] = {};
                }
                const sheetParams = {
                    id: this.formObj.bizObject.id,
                    sheetid: this.formObj.bizSheet.id,
                };
                c.options.sheetParams = sheetParams;
            });

        formControls
            .filter((c) => c.type === FormControlType.ReverseRelevance)
            .forEach((c) => {
                const sheetParams = {
                    id: this.formObj.bizObject.id,
                    sheetid: this.formObj.bizSheet.id,
                    formCode: this.formObj.bizSheet.code,
                    schemaCode: this.formObj.bizSheet.schemaCode,
                    sequenceStatus: this.formObj.bizObject.sequenceStatus,
                };
                c.options.sheetParams = sheetParams;
                // debugger;
                // c.value = {
                //   id: this.formObj.bizObject.id,
                //   formCode: this.formObj.bizSheet.code,
                //   schemaCode: this.formObj.bizSheet.schemaCode
                // };
            });
        //  let {
        //     str,
        //     subStr,
        //     getValue
        //   } = calcText;
        // formControls.filter(c => c.type === FormControlType.Text && c.options.shortTextStitch)
        // .forEach(c => {

        //   if (!c.value) {

        //     let { shortTextStitch } = c.options;
        //     let calcStr = shortTextStitch
        //       .replace(/substring/ig, 'subStr')
        //       .replace(/string/ig, 'str')
        //       .replace(/\{/ig, '"{')
        //       .replace(/\}/ig, '}"');

        //     c.value = (new Function('controls', `${str.toString()};${subStr.toString()}; ${getValue.toString()};return ${calcStr}`))(formControls);
        //   }

        // })
    }

    /**
     * 将表单数据转换为后端API所需数据结构
     * @param data
     * @param controls
     * @param filterSystem
     * @param agree
     */
    formDataHandle(
        data: { [key: string]: any },
        controls: RendererControl[],
        filterSystem: boolean,
        agree?: boolean
    ) {
        const formControls: RendererFormControl[] = [];
        components.FormRendererHelper.findFormControl(controls, formControls);

        if (filterSystem) {
            const systemControls = formControls.filter(
                (c) =>
                    (c.type > 99 && c.type < 200) ||
                    c.type === FormControlType.Title ||
                    c.type === FormControlType.Description ||
                    c.type === FormControlType.Group
            );

            systemControls.forEach((c) => delete data[c.key]);
        }
        // formControls = formControls.filter(c => !(c.type > 99 && c.type < 200));

        //暂存不对数值控件做处理

        if (agree) {
            formControls
                .filter((c) => c.type === FormControlType.Number)
                .forEach((c) => {
                    const ctrl = c.controller as ValueControl<number>;
                    if (data[c.key] === "") {
                        data[c.key] = null;
                    } else if (
                        ctrl &&
                        typeof ctrl.max === "number" &&
                        data[c.key] !== null && // 如果 ctrl.max是负数 且 data[c.key] 是 null 则 会将 max赋值给 data[c.key]
                        data[c.key] !== "" && // 如果 ctrl.max是负数 且 data[c.key] 是 '' 则 会将 max赋值给 data[c.key]
                        data[c.key] > ctrl.max
                    ) {
                        data[c.key] = ctrl.max;
                    }
                });
        }

        formControls
            .filter((c) => c.type === FormControlType.Date)
            .forEach((c) => {
                const val = data[c.key];
                if (val === "") {
                    data[c.key] = null;
                } else if (val instanceof Date) {
                    data[c.key] = dateFormatter(
                        val,
                        c.options.format || "YYYY-MM-DD HH:mm:ss"
                    );
                }
            });

        formControls
            .filter(
                (c) =>
                    c.type === FormControlType.Checkbox ||
                    c.type === FormControlType.Dropdown
            )
            .forEach((c) => {
                if (Array.isArray(data[c.key])) {
                    data[c.key] = data[c.key].join(";");
                }
            });

        formControls
            .filter(
                (c) =>
                    c.type === FormControlType.StaffSelector ||
                    c.type === FormControlType.StaffMultiSelector ||
                    c.type === FormControlType.DepartmentSelector ||
                    c.type === FormControlType.DepartmentMultiSelector
            )
            .forEach((c) => {
                const arr = data[c.key];
                if (Array.isArray(arr)) {
                    data[c.key] = arr.map((x) => ({
                        id: x.id,
                        type: x.unitType || x.type, // x.type === 'org' ? 1 : 3
                    }));
                }
            });

        formControls
            .filter((c) => c.type === FormControlType.Location)
            .forEach((c) => {
                const val = data[c.key];
                if (val && Object.keys(val).length > 0) {
                    data[c.key] = JSON.stringify(val);
                }
            });

        formControls
            .filter(
                (c) =>
                    c.type === FormControlType.Attachment ||
                    c.type === FormControlType.Image
            )
            .forEach((c) => {
                const files = data[c.key];
                if (files && Array.isArray(files)) {
                    data[c.key] = files
                        .map((f: any) => {
                            if (f.refId) {
                                return f;
                            }
                            if (
                                !f ||
                                !f.response ||
                                !f.response.data ||
                                !f.response.data.refId
                            ) {
                                return null;
                            }
                            return f.response.data;
                        })
                        .filter((f) => f);
                }
            });

        formControls
            .filter((c) => c.type === FormControlType.Sheet)
            .forEach((c) => {
                const sheetValue = data[c.key];
                if (Array.isArray(sheetValue)) {
                    sheetValue.forEach((v) =>
                        this.formDataHandle(v, (c as any).columns, filterSystem, agree)
                    );
                }
            });

        formControls
            .filter((c) => c.type === FormControlType.RelevanceForm)
            .forEach((c) => {
                const value = data[c.key];
                if (value) {
                    data[c.key] = value.id || "";
                }
            });

        formControls
            .filter((c) => c.type === FormControlType.RelevanceFormEx)
            .forEach((c) => {
                const value = data[c.key];
                if (Array.isArray(value) && value.length > 0) {
                    data[c.key] = value.map(item => item.id).join(";");
                }
            });

        formControls
            .filter((c) => c.type === FormControlType.ReverseRelevance)
            .forEach((c) => {
                delete data[c.key];
            });

        if (this.formObj) {
            let result: number | null = null;

            if (agree !== undefined) {
                result = agree ? 1 : 2;
            }

            formControls
                .filter((c) => c.type === FormControlType.ApprovalOpinion)
                .forEach((c) => {
                    const val = data[c.key];
                    if (val) {
                        val.workItemId = this.formObj.workItemId;
                        val.workflowInstanceId = this.formObj.workflowInstanceId;
                        val.workflowTokenId = this.formObj.workflowTokenId;
                        val.activityCode = this.formObj.activityCode;
                        val.activityName = this.formObj.activityName;
                        val.result = result;
                    }
                });
        }
    }

    getFormValue(filterSystem: boolean, agree?: boolean) {
        const formRenderer = this.formRenderer;
        const formData = formRenderer.getValue();
        if (formData) {
            for (const i in formData) {
                if (formData[i] && Array.isArray(formData[i])) {
                    formData[i].forEach((v: any) => {
                        for (const e in v) {
                            if (v[e] && typeof v[e] === "string") {
                                try {
                                    const obj = JSON.parse(v[e]);
                                    if (
                                        obj &&
                                        obj.marked &&
                                        (obj.marked === true || obj.marked === false)
                                    ) {
                                        v[e] = obj.value;
                                    }
                                } catch {
                                }
                            } else if (v[e] && Array.isArray(v[e])) {
                                v[e] = v[e].map((g: any) => {
                                    if (g.marked === true || g.marked === false) {
                                        g = g.value;
                                    }
                                    return g;
                                });
                            }
                        }
                    });
                }
            }
        }
        // console.log("formRenderer获取表单数据", JSON.stringify(formData));
        console.log("开始将表单数据转换为后端API所需数据结构");
        // debugger
        this.formDataHandle(formData, this.controls, filterSystem, agree);
        console.log("结束将表单数据转换为后端API所需数据结构");
        // console.log("formRenderer获取表单数据", JSON.stringify(formData));
        this.filterNullVal(formData);
        return formData;
    }

    /**
     * @desc 过滤子表空数据行
     * @param data 需要处理的数据
     */
    filterNullVal(data: any) {
        const contrs = this.formControls.filter((item) => item.type === 201);
        if (contrs.length <= 0) return data;
        const filterData = (key: any, columns: any) => {
            // 所有的模型类型
            const types = columns.reduce((prev: any, next: any) => {
                prev[next.key] = next.type;
                return prev;
            }, {});
            data[key] = data[key].filter((info: any) => {
                const keys = Object.keys(info);
                for (let i = 0, len = keys.length; i < len; i++) {
                    const k = keys[i];
                    // 如果有逻辑控件直接保存
                    if (types[k] === FormControlType.Logic) {
                        return true;
                    }
                    if (types[k] !== FormControlType.Logic && info[k]) {
                        return true;
                    }
                }
                return false;
            });
            return data;
        };
        contrs.map((item: any) => {
            const {key, columns} = item;
            filterData(key, columns);
        });
        return data;
    }

    /**
     * 构建表单暂存参数
     */
    buildSaveParams(agree?: boolean) {
        const formData = this.getFormValue(true, agree);
        formData.id = this.formObj.bizObject.id;

        if (this.formObj.bizObject.sequenceNo) {
            formData.sequenceNo = this.formObj.bizObject.sequenceNo;
        }

        const data: form.SaveParams = {
            workflowCode: this.formObj.workflowCode,
            workItemId: this.formObj.workItemId,
            workflowInstanceId: this.formObj.workflowInstanceId,
            bizObject: {
                id: this.formObj.bizObject.id,
                data: formData,
                schemaCode: this.formObj.bizSchema.code,
                sheetCode: this.formObj.bizSheet.code,
                workflowInstanceId: this.formObj.workflowInstanceId,
            },
        };

        if (this.approval) {
            data.approval = formData[this.approval.key];
            delete formData[this.approval.key];
        }

        return data;
    }

    /**
     * 暂存、保存
     */
    async save() {
        const hideLoader = this.$message.loading(null, 0);

        // 如果没有拥有者，或者拥用者控件没有选中用户，都取当前用户ID
        let ownerId = "";

        if (this.owner) {
            const ownerVal = this.owner.controller.value as any[];
            if (ownerVal && ownerVal.length > 0) {
                ownerId = ownerVal[0].id;
            }
        }

        if (!ownerId) {
            const user = renderer.StaffSelectorControl.service.getCurrentUser();
            if (user) {
                ownerId = user.id;
            }
        }

        const params: any = this.$route.query;

        let data = this.buildSaveParams();

        const showSuccess = () => {
            this.inEdit = false;
            hideLoader();
            const msg = this.$t("cloudpivot.form.runtime.tip.saveSuccess").toString();
            this.$message.success(msg, 3);
        };

        let res: form.HttpResponse<any>;

        try {
            data = FormDetailService.mergeReplayToken(data); // 合并 校验码
            res = await formApi.save(data, this.formPath);
            if (res.errcode === 0) {
                const workItem = res.data.workItem;
                const workflowInstanceId = res.data.workflowInstanceId;

                if (!params.startWorkflowCode || (workItem && workItem.id)) {
                    showSuccess();
                } else {
                    let workItemId: string;
                    do {
                        workItemId = await this.existWorkItem(workflowInstanceId, ownerId) as string;
                    } while (!workItemId);

                    res.data.workItem = {
                        id: (workItemId as any).data,
                        instanceId: workflowInstanceId,
                    };
                    showSuccess();
                }
            }
        } catch (e) {
            //hideLoader();
            throw e;
        }

        return res;
    }

    existWorkItem(workflowInstanceId: string, ownerId: string): Promise<string | void> {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                formApi.workItemExist(workflowInstanceId, ownerId).then(
                    (res) => {
                        if (res.errcode === 0) {
                            resolve(res.data);
                        } else {
                            resolve();
                        }
                    },
                    (res) => reject(res)
                );
            }, 1000);
        });
    }

    /**
     * 提交前业务逻辑处理
     * @param ac
     * @param agree 是否同意
     */
    async presubmit(ac: FormActionButton) {
        if (this.submited) {
            // if (this.isMobile && this.approval) {
            //     const modal = (this.$refs.actionModal as any) as FormActionModal;
            //     modal.show({
            //         title: ac.text,
            //         code: ac.code,
            //         data: [],
            //         approval: this.approval,
            //     });
            //     this.disableActionBtn(ac, false);
            // } else {
                //如果提交过，不用再选择部门
                const deptId = this.formObj.bizObject.data.ownerDeptId.id;
                this.doAction(ac, {
                    deptId,
                });
            // }
        } else {
            let depts: any[] = [];
            let trustList: any = [];
            // 流程模拟,发起流程时提交处理-预设部门为发起人部门
            if (
                this.$route.query.workflowMock &&
                this.$route.query.startWorkflowCode
            ) {
                const startWorkflowCode = `${this.$route.query.startWorkflowCode}-mock`;
                const _preMockData: any = window.sessionStorage.getItem(
                    startWorkflowCode
                );
                const mockData = JSON.parse(_preMockData);
                if (mockData && mockData.originatorDept) {
                    this.doAction(ac, {
                        deptId: mockData.originatorDept,
                    });
                    return;
                }
            }

            // 如果有拥有者控件，则取拥有者的部门列表
            // if (this.owner) {
            //   const val = this.owner.controller.value as any[];
            //   if (val && val.length > 0) {
            //     const hideLoader = (this.$message as any).loading();
            //     try {
            //       const _depts = await renderer.StaffSelectorControl.service.getUserDepartments(
            //         val[0].id
            //       );
            //       if (_depts) {
            //         depts = _depts;
            //       }
            //     } finally {
            //       hideLoader();
            //     }
            //   }
            // } else {
            //   // 如果没有拥有者控件，则取创建人的部门列表
            //   depts = this.formObj.departments;
            // }
            let ownerInfo: any = {};
            let createrInfo: any = {};
            this.formObj && this.formObj.bizObject && this.formObj.bizObject.owner
                ? (ownerInfo = this.formObj.bizObject.owner)
                : ownerInfo;
            this.formObj && this.formObj.bizObject && this.formObj.bizObject.creater
                ? (createrInfo = this.formObj.bizObject.creater)
                : createrInfo;
            let userId: string = "";
            if (
                this.formObj &&
                this.formObj.bizSheet &&
                this.formObj.bizSheet.draftAttributesJson
            ) {
                const obj = JSON.parse(this.formObj.bizSheet.draftAttributesJson);
            }
            const hideLoader = (this.$message as any).loading();
            if (this.owner) {
                const val = this.owner.controller.value as any[];
                if (val && val.length > 0) {
                    userId = val[0].id;
                }
            } else {
                // 如果没有拥有者控件，则取创建人的Id
                !ownerInfo.id
                    ? (userId = createrInfo.id || "")
                    : (userId = ownerInfo.id || "");
                // depts = this.formObj.departments;
            }
            try {
                const _depts = await renderer.StaffSelectorControl.service.getUserDepartments(
                    userId
                );
                if (_depts) {
                    depts = _depts;
                }
                const params: any = {
                    workflowCode: this.formObj.workflowCode || "",
                };
                if (this.formObj.workflowInstanceId) {
                    params.workflowInstanceId = this.formObj.workflowInstanceId;
                }
                const res = await workflowApi.getTrustOriginatorList(params);
                if (!res.errcode && Array.isArray(res.data)) {
                    trustList = res.data;
                }
            } finally {
                hideLoader();
            }

            if (!depts || depts.length === 0) {
                // 无拥有者 无创建人 loadedFromDb false 识别数据来自业务方法,不需要校验拥有者部门；
                if (!platform.IS_DEBUG) {
                    if (userId) {
                        this.$message.error(
                            this.$t("cloudpivot.form.runtime.tip.noDeptTips"),
                            3
                        );
                        return;
                    }
                }
            }

            // 如果有多个部门需要选一个
            // 移动端的审批意见需要弹页面填写
            const filterTrust = trustList.filter((tl: any) => tl.isTrustor);
            if (ac.code === "submit" && filterTrust.length) {
                // 发起委托选择委托人弹窗，当存在委托人时出现
                const modal = (this.$refs.actionModal as any) as FormActionModal;
                modal.show({
                    title: this.$t(
                        "cloudpivot.form.runtime.modal.selectIdentity"
                    ).toString(),
                    code: ac.code,
                    data: depts,
                    approval: this.approval,
                    trusts: trustList,
                    workflowName: this.formObj.workflowName,
                });
                this.disableActionBtn(ac, false);
            } else if (depts.length > 1 || (this.isMobile && this.approval)) {
                const modal = (this.$refs.actionModal as any) as FormActionModal;
                modal.show({
                    title: ac.text,
                    code: ac.code,
                    data: depts,
                    approval: this.approval,
                });
                this.disableActionBtn(ac, false);
            } else {
                this.doAction(ac, {
                    deptId: !depts[0] ? "" : depts[0].id,
                });
            }
        }
    }

    /**
     * 提交、同意、不同意
     * @param deptId
     * @param agree
     */
    async submit(
        actionCode: string,
        deptId: string,
        agree: boolean,
        trustor?: string
    ) {
        const closeLoader = (this.$message as any).loading();
        let data = this.buildSaveParams(agree) as form.SubmitParams;
        console.log('Video',this.$route.query.type)
        if(this.$route.query.type == "Video") {
         await axios.post(env.apiHost + '/api/video/base64ToImgByteArray', {base64: sessionStorage.getItem("base64")}).then(ress => {
            ress.data.base64ImageStr = sessionStorage.getItem("base64")
            data.bizObject.data.photo = [];
            data.bizObject.data.photo.push(ress.data);
          })
        }
        data.agree = agree;
        data.actionCode = actionCode;
        data.depatmentId = deptId;
        data.trustor = trustor;
        // 流程模拟，发起流程时提交处理
        if (this.$route.query.workflowMock && this.$route.query.startWorkflowCode) {
            const startWorkflowCode = `${this.$route.query.startWorkflowCode}-mock`;
            const _preMockData: any = window.sessionStorage.getItem(
                startWorkflowCode
            );
            const mockData = JSON.parse(_preMockData);
            data.simulative = true;
            if (mockData && mockData.originator && mockData.originator.length) {
                data.runMode = mockData.runMode;
                let isAdmin = false;
                if (window.sessionStorage.getItem("user")) {
                    // 当前用户为超管的话，在流程模拟时取预设人作为拥有者
                    const user: any = JSON.parse(
                        window.sessionStorage.getItem("user") as string
                    );
                    isAdmin = user.permissions.includes("ADMIN");
                }
                if (data.bizObject.data["owner"] && !isAdmin) {
                    // 如果表单设置了拥有者，流程模拟时需将部门清空，后台默认取主部门
                    data.depatmentId = "";
                } else {
                    // 如果表单未设置拥有者，流程模拟时取预设发起人作为拥有者
                    data.bizObject.data["owner"] = [
                        {id: mockData.originator[0].id, type: 3},
                    ];
                }
            }
        }
        // 1流程表单 2非流程表单
        data.formType = this.formObj.workflowCode ? "1" : "2";
        data = FormDetailService.mergeReplayToken(data); // 合并 校验码
        try {
            const res = await formApi.submit(data, this.formPath);
            // @ts-ignore
            let mbsKey: string | null = null;
            if (window.location.href.indexOf('mbsKey') > -1) {
                mbsKey = window.location.href.split('&mbsKey=')[1].split('&')[0] ?? window.location.href.split('&mbsKey=')[1]
            }
            if (mbsKey) {
                await listApi.delStorge({key: mbsKey})
            }
            return res;
        } finally {
            //closeLoader();
        }
    }

    /**
     * 处理异常信息
     * @param res
     * @param defaultMsg
     */
    handleError(res: any, defaultMsg?: string) {
        let msg: string;
        switch (res.errcode) {
            case 300004:
                msg = this.$t("cloudpivot.form.runtime.tip.errTips4").toString();
                break;
            case 300006:
                msg = this.$t("cloudpivot.form.runtime.tip.errTips5").toString();
                break;
            case 301005:
                msg = this.$t("cloudpivot.form.runtime.tip.errTips6", {
                    msg: res.errmsg,
                }).toString();
                break;
            case 304001:
                msg = this.$t("cloudpivot.form.runtime.tip.errTips7").toString();
                break;
            case 402500:
                msg = this.$t("cloudpivot.form.runtime.tip.errTips8").toString();
                break;
            case 402501:
                msg = this.$t("cloudpivot.form.runtime.tip.errTips9").toString();
                setTimeout(() => {
                    this.reload();
                }, 1000);
                break;
            case 402517:
                msg = this.$t("cloudpivot.form.runtime.tip.errTips21").toString();
                break;
            case 402509:
                msg = this.$t("cloudpivot.form.runtime.tip.errTips10").toString();
                break;
            case 402510:
                msg = this.$t("cloudpivot.form.runtime.tip.errTips11").toString();
                break;
            case 402511:
                msg = this.$t("cloudpivot.form.runtime.tip.errTips1").toString();
                break;
            case 402512:
                msg = this.$t("cloudpivot.form.runtime.tip.errTips2").toString();
                break;
            case 402515:
                msg = this.$t("cloudpivot.form.runtime.tip.errTips3").toString();
                break;
            case 402513:
                msg = this.$t("cloudpivot.form.runtime.tip.errTips12").toString();
                break;
            case 402514:
                msg = res.errmsg; //'参与者数量选择不能超过8个用户！';
                break;
            case 550010:
                let schemaName = "";
                this.$i18n.locale === "zh"
                    ? (schemaName = res.data.schemaName)
                    : (schemaName = JSON.parse(res.data.schemaName_i18n).en || "");
                msg = this.$t("cloudpivot.form.runtime.tip.errTips18", {
                    schemaName: schemaName,
                    businessRuleName: res.data.businessRuleName,
                    nodeName: res.data.nodeName,
                    propertyCode: res.data.propertyCode,
                }).toString();
                break;
            case 550006:
                let targetSchemaName = "";
                this.$i18n.locale === "zh"
                    ? (targetSchemaName = res.data.targetSchemaName)
                    : (schemaName = JSON.parse(res.data.targetSchemaName_i18n).en || "");
                msg = this.$t("cloudpivot.form.runtime.tip.errTips20", {
                    targetSchemaName: targetSchemaName,
                    nodeName: res.data.nodeName,
                }).toString();
                break;
            default:
                msg = defaultMsg || res.errmsg; //this.$t('languages.common.tip.operationFail').toString();
                break;
        }
        // 重复提交不获取 校验码,否则需要重新获取校验码
        if (res.errcode !== 100005) {
            FormDetailService.setReplayToken(this.formPath);
        }
        this.$message.error(msg, 3);
    }

    /**
     * 作废
     */
    cancel() {
        return workflowApi.abortInstance(this.workflowInstanceId);
    }

    /**
     * 删除
     */
    delete() {
        let p;
        if (this.workflowInstanceId) {
            p = workflowApi.deleteInstance(this.workflowInstanceId);
        } else {
            const params = this.$route.query as any;
            p = formApi.delete(
                {
                    schemaCode: params.schemaCode,
                    objectId: params.objectId,
                },
                this.formPath
            );
        }
        return p.then((res) => {
            const msg = this.$t(
                "cloudpivot.form.runtime.tip.deleteSuccess"
            ).toString();
            this.$message.success(msg, 3);
            return res;
        });
    }

    /**
     * 结束
     */
    finish() {
        return workflowApi.finishInstance(this.workflowInstanceId);
    }

    /**
     * 撤回
     */
    retrieve() {
        const params = {
            workflowInstanceId: this.workflowInstanceId,
            activityCode: this.formObj.activityCode,
            workItemId: this.formObj.workItemId,
        } as any;
        return workflowApi.revokeWorkItem(params).then((res) => {
            const msg = this.$t(
                "cloudpivot.form.runtime.tip.retrieveSuccess"
            ).toString();
            this.$message.success(msg, 3);
            return res;
        });
    }

    /**
     * 催办
     * 客户端调用dd接口，web端调用api接口
     * @param data { content: 催办内容, instanceId: 实例id }
     */
    urgeHandler(data: any) {
        // if (utils.Common.isDingtalk) {
        //   this.urgeHandler_dd(data)
        // } else {
        //   this.urgeHandler_common(data, 1);
        // }

        // 20190703 统一使用消息通知  待测
        const type: number = utils.Common.isDingtalk ? 0 : 1;
        this.urgeHandler_common(data, type);
    }

    /**
     * 催办通用
     * @params urgeType 0：客户端ding消息；1：web端钉钉通知
     */
    async urgeHandler_common(data: any, urgeType: number) {
        const {content, instanceId} = data;
        const params: form.SaveDingParams = {
            urgeType: urgeType,
            instanceId: instanceId,
            text: content,
        };
        const res = await formApi.saveDing(params);
        if (res.errcode === 0) {
            this.$message.success(
                this.$t("cloudpivot.form.runtime.urge.urgeSuccess"),
                3
            );
            const modal = (this.$refs.actionModal as any) as FormActionModal;
            modal.close();
        } else if (res.errcode === 10024) {
            // 当前处理人是你自己，不能催办自己
            this.$message.error(
                this.$t("cloudpivot.form.runtime.urge.cantUrgeSelf"),
                3
            );
        } else {
            this.$message.error(
                this.$t("cloudpivot.form.runtime.urge.urgeFailed"),
                3
            );
        }
    }

    /**
     * 催办钉钉客户端
     * type mobile 移动端   pc 客户端
     */
    async urgeHandler_dd(data: any) {
        const {content, instanceId, type} = data;
        const {corpId} = (window as any).Environment;
        const vm: any = this;
        const res = await formApi.getTodoUsers(instanceId);
        if (res.errcode === 0) {
            const users = res.data;
            const owner: string = this.formObj.bizObject.owner.name;
            const instanceName: string = this.formObj.instanceName as string;

            const text = `内容: ${content}\n发起人: ${owner}\n流程名称: ${instanceName}`;

            // 2.0版本接口报权限错误 故使用1.0版本 20190610
            (window as any).dd.biz.ding.post({
                users, //用户列表，userid
                corpId, //加密的企业id
                type: 1, //钉类型 1：image  2：link
                alertType: 2,
                alertDate: {format: "yyyy-MM-dd HH:mm", value: "2015-05-09 08:00"},
                attachment: {
                    images: [""], //只取第一个image
                }, //附件信息
                text, //消息体
                onSuccess: function (result: any) {
                    // tip: 点击取消也会执行这个回调，但是点击取消的时候，result为空
                    // tip: result不为空时，此时点击了发送并成功
                    // result在移动端 undefinded -> 点击取消   object -> 点击了发送
                    // result在pc端相反
                    if (type === "mobile") {
                        if (result && result.dingCreateResult) {
                            vm.urgeHandler_common(data, 0);
                        }
                    }

                    if (type === "pc") {
                        if (!result) {
                            vm.urgeHandler_common(data, 0);
                        }
                    }
                },
                onFail: function () {
                },
            });
        } else if (res.errcode === 10024) {
            // 当前处理人是你自己，不能催办自己
            this.$message.error(
                this.$t("cloudpivot.form.runtime.urge.cantUrgeSelf"),
                3
            );
        } else {
            this.$message.error(this.$t("cloudpivot.form.runtime.urge.netError"), 3);
        }
    }

    async getDataModal() {
        // const res = await listApi.getDataItemList({
        //   schemaCode: this.formObj.bizSchema.code
        // });
        // const { errcode, errmsg, data } = res;
        // if (errcode === 0) {
        // } else {
        //   this.$message.error(errmsg);
        // }
        this.dataModalList = this.formObj.bizSchema.properties;
    }

    destroyed() {
        delete (window as any).h3form;
    }
}
