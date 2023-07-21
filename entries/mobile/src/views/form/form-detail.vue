
<template>
  <div class="form-detail">
    <a-progress :percent="percent" :isAuto="true" :loadding="loadding" />
    <form-nodes-switch v-if="nodes.length > 0" :nodes="nodes" @nodesSwitch="nodesSwitch" />
    <div class="form-body" :style="{height: getComputedFormBodyHeight}" style="width: 100%">
      <!--      <div class="form-body" :class="{'hasnodes': nodes.length > 0}">-->
      <transition>
        <toptip v-show="comment">{{ comment }}</toptip>
      </transition>

      <transition>
        <toptip v-if="error" class="error">{{ error }}</toptip>
      </transition>
      <workflow-info
        v-if="workflowInstanceId"
        :id="workflowInstanceId"
        :itemId="formObj.workItemId"
        :user="creater"
        @flowTrack="flowTrack"></workflow-info>
      <mobile-form-renderer
        ref="formRenderer"
        class="form border-top"
        :controls="controls"
        :relevanceDataList="dataModalList"
        @scrollTop="onScrollTop"
        @scrollLock="onScrollLock"
        :dataItems="dataItems">
      </mobile-form-renderer>
    </div>
    <div class="print" v-show="standardPrintReady" @click="go2StandardTemplatePrint">
      <div>标准模板预览</div>
      <!--<div>标准模板下载</div>-->
    </div>
    <form-actions
      v-show="mobileActions.length > 0 && tab === 0"
      :actions="mobileActions"
      class="form-foot border-top"
      @action="onAction"></form-actions>

    <form-action-modal
      :formObj="formObj"
      ref="actionModal"
      @ok="onOk"
      @closeModal="onCloseModal"></form-action-modal>

    <a-modal
      :visible="printModalVisible"
      :title="standardFileName"
      :destroyOnClose="true"
      class="printDoc"
      :footer="null"
      @cancel="cancelPrintView"
    >
      <iframe
        ref="docView"
        class="printIframe"
        id="docView"
        :src="standardDocSvg"
      />
    </a-modal>
  </div>
</template>

<script lang="ts">
import { Component, Provide, Watch } from "vue-property-decorator";

import Progress from './progress.vue';

import { FormSheet } from 'h3-forms';

import { renderer, runtime, schema } from "@cloudpivot/form";

import * as mobileForm from "@cloudpivot/form/mobile";

import flow from "@cloudpivot/flow/mobile";

import * as FormCommentIns from "@cloudpivot/api";
import { externalLinkApi } from "@cloudpivot/api";

import common from "@cloudpivot/common/mobile";

import * as platform from "@cloudpivot/platform";

import formNodesSwitch from "./form-nodes-switch.vue"

import env from "@/config/env";

import { Modal } from "@h3/antd-vue";

import '@/config/h3-form';
import {getPrintView, getStandardTemplate} from "../../../extends/service/api";
import { StaticUtils } from '@cloudpivot/form/utils/utils';

/**
 * @Author: Fan
 * @Description: 在钉钉OA工作台 不能打开移动端页面, 需要跳转到PC端
 * @Date: 2020-01-15 00:35:49
 */
function checkRunPlatform(to) {
  if (platform.IS_DINGTALK && common.utils.Common.isPC) {
    let url = `${(window as any).config.portalHost}${to.fullPath}&access_token=${localStorage.getItem("token")}`;
    platform.service.openLink(url);
    // window.open(url,'_blank')
    return [false, url]
  }
  return [true, '']
}

Component.registerHooks([
  "beforeRouteEnter",
  "beforeRouteLeave",
  "beforeRouteUpdate"
]);

@Component({
  name: "mobile-form-detail",
  components: {
    Toptip: common.components.Toptip,
    WorkflowInfo: flow.components.WorkflowInfo,
    FormActions: mobileForm.runtime.FormActions,
    MobileFormRenderer: mobileForm.renderer.FormRenderer,
    FormActionModal: mobileForm.runtime.FormActionModal,
    AProgress: Progress,
    formNodesSwitch,
    AModal: Modal
  },

  beforeRouteEnter(to, from, next) {
    let [st, url] = checkRunPlatform(to)
    if (st) {
      next(vm => {
        (vm as MobileFormDetail).beforeLoad();
      });
    } else {
      next({
        path: `/form/empty?openBrowser=${url}`,
        replace: true,
      })
    }
  },

  beforeRouteUpdate(to, from, next) {
    const vm = this as MobileFormDetail;
    // vm.clean();
    next();
    vm.beforeLoad();
  }
})
export default class MobileFormDetail extends mobileForm.runtime.FormDetail {

  creater: any = {};

  timer: any = null;
  loadding: boolean = false;
  // todo: 待优化代码，需要监听axios的事件
  percent:number = 0;
  // timers = 0;

  error = '';
  tab: number = 0;
  formBodyHeight: string = '100%';

  @Provide()
  formTabActiveTab(tab: number){
    this.tab = tab
  }

  get isMobile() {
    return true;
  }

  mounted() {
    localStorage.removeItem('isShowEmailResquest');
    this.$nextTick(() => {
      setTimeout(() => {
        const formWrap = this.$refs.formRenderer as any;
        // const formRenderer = formWrap.$refs.formRenderer as any;
        const formRenderer = this.$refs.formRenderer as any;
        if (!formRenderer) {
          return;
        }
        this.$watch(() => (formRenderer.getErrors()), (errors: any) => {
          if (errors) {
            console.log(errors);
            const keys = Object.keys(errors);
            if (keys.length > 0) {
              const key = keys[0];
              // 防止将上一次的错误提示清空 #43219
              if (this.error === '') {
                this.error = formRenderer.getErrorMessage(key, errors[key][0])
              }
              return;
            }
          }
          this.error = '';
        }, {
          immediate: true
        });
      }, 200);
    });
  }

  // 页面销毁的时候
  destroyed() {
    clearInterval(this.timer);
  }

  get $message() {
    return {
      error: (msg: string) => {
        this.showError(msg);
      },
      success: (msg: string) => {
        this.showSuccess(msg);
      },
      loading: (msg?: string) => {
        this.showLoading(msg || "");
        return this.hideToast;
      },
      info: (msg?: string) => {
        this.showInfo(msg || "");
      }
    } as any;
  }

  get $confirm() {
    return ((opts: {
      title: string;
      content: string;
      onOk?: () => void;
      onCancel?: () => void;
    }) => {
      (this as any).$h3.modal.show({
        type: "alert",
        title: opts.title,
        content: opts.content,
        actions: [
          {
            text: (this as any).$t("cloudpivot.form.renderer.cancel").toString(),
            onPress() {
              if (opts.onCancel) {
                opts.onCancel();
              }
            }
          },
          {
            text: (this as any).$t("cloudpivot.form.renderer.ok").toString(),
            onPress() {
              if (opts.onOk) {
                opts.onOk();
              }
            }
          }
        ]
      });
    }) as any;
  }

  get mobileActions() {
    return this.actions.filter(
      ac => ac.visible !== false && ac.code !== runtime.FormAction.Print && ac.code !== runtime.FormAction.EditOwner
    );
  }

  get dataItems() {
    if (this.formObj.bizSchema && this.formObj.bizSchema.properties) {
      return this.formObj.bizSchema.properties;
    }

    return [];
  }

  /**
   * 评论模块需要判断当前表单是否提交过
  */
  get isSsubmited() {
    if (this.isWorkflowForm) {
      return !!this.formObj.workflowInstanceIsSubmit;
    }

    return this.formObj.bizObject.data.sequenceStatus === "COMPLETED";
  }

  /**
     * 根据表单配置项是否加载评论模块
     */
  get isLoadComment() {
    if (this.formObj.bizSheet) {
      return this.formObj.bizSheet.formComment;
    }

    return false;
  }


  @Provide()
  layoutTypeFn() {
    return (
      this.formObj &&
      this.formObj.bizSheet &&
      this.formObj.bizSheet.layoutType === "vertical"
    );
  }
  // @Provide()
  // message() {
  //   return this.$message
  // }

  showLoading(text: string) {
    this.$h3.toast.show({
      text,
      autoHide: false,
      iconType: "loading"
    });
  }

  showError(text: string) {
    this.$h3.toast.show({
      text,
      autoHide: true,
      iconType: text.length < 8 ? "close" : ""
    });
  }

  showSuccess(text: string) {
    this.$h3.toast.show({
      text,
      autoHide: true,
      iconType: "check",
      duration: 1000
    });
  }
  showInfo(text: string) {
    (this as any).$h3.toast.show({
      text,
      autoHide: true,
      iconType: "info",
      duration: 1000
    });
  }

  hideToast() {
    this.$h3.toast.hide();
  }

  @Watch("mobileActions")
  onMobileActionsChange(actions: runtime.FormActionButton[]) {
    // if (this.$el) {
    //   const formBody = this.getFormBody();
    //   if (formBody) {
    //     let height = '';
    //     if (actions.length > 0) {
    //       height = this.nodes.length > 0 ? "calc(100% - 88px)" : "calc(100% - 44px)";
    //     } else {
    //       height = this.nodes.length > 0 ? "calc(100% - 44px)" : "100%";
    //     }
    //     // const height = actions.length > 0 ? "calc(100% - 44px)" : "100%";
    //     console.log(height,'mobileActions-----------')
    //     formBody.style.height = height;
    //   }
    // }
  }

  standardPrintReady: boolean = false; //标准打印
  standardUUID: string | null = null;//rdp uuid
  private printModalVisible: boolean = false;
  private standardFileName: string | null = null;
  private standardDocSvg: string | null = null;
  private printSchemaCode: string = '';
  @Watch( 'formObj' )
  actionsListener( value ) {
    if ( !value ) return;
    if ( !value.formPermission ) return;
    const {
      formPermission,
      bizObject
    } = value, { actionPermission } = formPermission, { print } = actionPermission, { schemaCode } = bizObject;
    if ( print ) {
      if ( !schemaCode ) return;
      this.printSchemaCode = schemaCode;
      StaticUtils.debound(this.getStandardTemplate,100)
    }
  }
  get getComputedFormBodyHeight() {
    let num = 0;
    [this.mobileActions.length,this.nodes.length,this.standardPrintReady].map((i)=> {
      if(i) {num++}
    })
    num===0?'':num===1?this.formBodyHeight="calc(100% - 44px)":num===2?this.formBodyHeight="calc(100% - 88px)":num===3?this.formBodyHeight="calc(100% - 132px)":''
    return this.formBodyHeight;
  }
  getStandardTemplate() {
    getStandardTemplate( { schemaCode: this.printSchemaCode } ).then( res => {
      if ( res.errcode !== 0 ) return this.$message.error( res.errmsg as string );
      if ( res.data ) {
        this.standardUUID = res.data as string;
        this.standardPrintReady = true;
        } else {
        this.standardUUID = null;
        this.standardPrintReady = false;
      }
    } );
        }
  go2StandardTemplatePrint() {
    const schemaCode = this.formObj?.bizObject?.schemaCode ?? null;
    const objectId = this.formObj?.bizObject?.id ?? null;
    if ( !schemaCode || !objectId ) return this.$message.error( `缺少${ !schemaCode ? 'schemaCode' : '' } ${ !objectId ? 'objectId' : '' }!` );
    getPrintView( { schemaCode: schemaCode, id: objectId } ).then( res => {
      if ( res.errcode !== 0 ) return this.$message.error( res.errmsg as string );
      if ( res.data ) {
        this.printModalVisible = true;
        //new add
        this.$nextTick().then( () => {
          try {
            this.standardDocSvg = `${env.host}/RDP-SERVER/rdppage/main/${ this.standardUUID }?id=${ objectId }`;
            setTimeout(()=> {
              const iframeEntity = this.$refs.docView as HTMLIFrameElement;
              if(iframeEntity) {
                // @ts-ignore
                const iframeEle = iframeEntity?iframeEntity.contentWindow.document.getElementsByClassName('export'):'';
                setTimeout(()=> {
                  // @ts-ignore
                  iframeEle[0]?iframeEle[0].style.display= "none":''
                },100)
              }
            },200)
          } catch ( e ) {
            this.standardDocSvg = `${ e }`;
      }
        } );
    }
    } );
  }
  cancelPrintView() {
    this.printModalVisible = false
  }
  getFormBody() {
    return this.$el.querySelector(".form-body") as HTMLDivElement;
  }

  onScrollTop(top: number) {
    const formBody = this.getFormBody();
    if (formBody) {
      formBody.scrollTop = top;
    }
  }

  onScrollLock(lock: boolean) {
    const formBody = this.getFormBody();
    if (formBody) {
      formBody.style.overflow = lock ? "hidden" : "auto";
    }
  }

  validate(onlyUpload?: boolean) {
    let formRenderer = this.$refs.formRenderer as any;
    // formRenderer = formRenderer.$refs.formRenderer as any;

    let valid = false;

    const formControls: renderer.RendererFormControl[] = [];
    renderer.components.FormRendererHelper.findFormControl(
      this.controls,
      formControls
    );

    if (!onlyUpload) {
      if (this.approval) {
        valid = formRenderer.validate([this.approval.key]);
      } else {
        valid = formRenderer.validate();
      }

      const rowEmpty = (this as any).$t("cloudpivot.form.runtime.modal.rowEmpty");
      let isEmptyRow: boolean = formControls
        .filter(c => c.type === schema.FormControlType.Sheet && c.options.isEmptyRow)
        .some(c => {
          const ctrl = this.formRenderer.controller.findChild(
            c.key
          ) as FormSheet;
          const name = (this as any).$i18n.locale === 'zh' ? c.options.name : c.options.name_i18n ? c.options.name_i18n : 'Subtable';
          if (ctrl && ctrl.value.length === 0) {
            this.$message.error(`${name}${rowEmpty}`, 3);
            return true;
          } else if (ctrl && ctrl.value.length) {
            const isValue: boolean = ctrl.value.every((s: any) => {
              return Object.values(s).join('').length > 0
            })
            if (!isValue) {
              this.$message.error(`${name}${rowEmpty}`, 3);
              return true;
            }
          }
          return false;
        });

      if (isEmptyRow) {
        return false;
      }

      const pleaseInput = (this as any).$t('cloudpivot.form.runtime.modal.pleaseInput');

      // this.formControls = formControls;
      let isRequire: boolean = formControls
        .filter(c => c.type === renderer.FormControlType.Address)
        .some((c: any) => {
          const ctrl = this.formRenderer.controller.findChild(c.key);
          // const val: any = c.controller.value;
          if (ctrl && ctrl.required && (!ctrl.value || !ctrl.value.provinceAdcode)) {
            this.$message.error(`${pleaseInput}${c.options.name}`);
            return true;
          }

          return false;
        });


      if (!isRequire) {
        isRequire = formControls.filter(c => c.type === schema.FormControlType.Sheet && c.required)
          .some(c => {
            const ctrl = this.formRenderer.controller.findChild(c.key) as FormSheet;
            if (ctrl && ctrl.rows.length === 0) {
              this.$message.error(`${pleaseInput}${c.options.name}`);
              return true;
            }
            return false;
          })
      }

      if (isRequire) {
        return false;
      }
    }

    const formBody = this.$el.querySelector(".form-body") as HTMLDivElement;

    const scrollTo = (key: string) => {
      const el = this.$el.querySelector(`#${key}`) as HTMLDivElement;
      if (el && formBody) {
        formBody.scrollTop = el.offsetTop - el.offsetHeight;
      }
    };

    if (!onlyUpload) {
      if (!valid) {
        const errors = formRenderer.getErrors();
        if (errors) {
          let keys = Object.keys(errors);
          if (keys.length > 0) {
            let key = keys[0];

            const control = formControls.find(c => c.key === key);

            if (control && control.type === schema.FormControlType.Sheet) {
              const map = errors[key];
              keys = Object.keys(map);
              const keys2 = Object.keys(map[keys[0]]);
              const err = formRenderer.getErrorMessage(
                keys2[0],
                map[keys[0]][keys2[0]][0],
                key
              );
              this.error = err;
              key += keys[0];
            } else {
              this.error = formRenderer.getErrorMessage(key, errors[key][0]);
            }

            scrollTo(key);
            return false;
          }
        }
      }
    }

    let upload = super.findUploadBy(renderer.UploadStatus.Uploading);
    if (upload) {
      this.error = `${upload.options.name}正在上传！`;
      scrollTo(upload.key);
      return false;
    }

    upload = super.findUploadBy(renderer.UploadStatus.Error);
    if (upload) {
      this.error = `${upload.options.name}上传失败！`;
      scrollTo(upload.key);
      return false;
    }

    this.error = "";

    return true;
  }

  async beforeLoad() {
    this.onScrollLock(false);
    if (this.isWorkFlow) {
      this.nodes = await (this.getWorkFlowNodes() as any);
      this.nodes.forEach((res, index) => {
        if (index === 0) {
          res.selected = true;
        } else {
          res.selected = false;
        }
      });
      if (this.nodes.length > 0) {
        this.getNodesParams(this.nodes[0].activityCode);
      }
      this.load();
    } else {
      this.nodesParams = null;
      this.load();
    }
  }

  nodesSwitch(node: string) {
    this.getNodesParams(node);
    this.clean(true);
    this.load();
  }
  get isEL() {
    return !!(window as any).externalLinkToken;
  }

  async load(edit?: boolean) {
    // const closeLoading = (this.$message as any).loading();
    this.loadding = true;
    try {
      const res = await super.load(edit);
      const title = this.formObj.instanceName || this.formObj.bizSheet.name;
      if (platform && platform.service && platform.service.setTitle) {
        // 外链和从列表中打开的表单的新建、查看、编辑状态 移动端表单顶部 表单 去掉 #34950 迭代30
        if (this.nodes.length || this.isEL) {
          platform.service.setTitle(' ');
        } else {
          platform.service.setTitle(title);
        }
      }
      const creaters = this.formObj.bizObject.data.creater;
      if (creaters && Array.isArray(creaters)) {
        this.creater = creaters[0];
      }

      if (this.approval) {
        setTimeout(() => {
          this.approval.controller = (this.formRenderer as any).findController(
            this.approval.key
          );
        }, 500);
      }
      if (!this.isEL) {
        if(!this.$route.query.type) {
        this.getCommListNum();
      }
      }
    } catch (e) {
      if (e instanceof Error) {
        // alert(e);
        console.error(e);
      }
      if (e.errcode === 302034) {
        // this.error = "该表单未发布，请联系管理员处理";
        this.goUnpublished();
        return;
      }
      if (e.errcode === 601010 || e.errcode === 6000018 || e.errmsg.indexOf('权限') > -1) {
        this.goPermission();
        return;
      }
      this.goEmptyPage();
    } finally {
      // closeLoading();
      this.loadding = false;
    }
  }

  async onActionModalOk(ac: runtime.FormActionButton, data: any) {
    if (ac.code === runtime.FormAction.Reject && !super.validateApproval()) {
      return;
    }
    return super.onActionModalOk(ac, data);
  }

  initIframe(url: string) {
    const { bizSheet } = this.formObj;
    if (!bizSheet.mobileIsPc) {
      url = bizSheet.mobileUrl;
    }
    // console.log(`aaa: ${url}`);
    const iframe = super.initIframe(url);
    const w = iframe.contentWindow as any;
    w.env = env;
    w.config = env;
    return iframe;
  }

  onOk(ac: runtime.FormActionButton, data: any) {
    // debugger
    super.doAction(ac, data);
  }

  async onAction(ac: runtime.FormActionButton) {
    await super.onAction(ac);
  }

  async goto(ac: runtime.FormActionButton, res: Common.Data) {
    // debugger
    // switch(ac.code) {
    //   case runtime.FormAction.Save:
    // }
    // this.onScrollLock(true);
    if (ac.code === runtime.FormAction.Save) {
      if (this.isNew) {
        this.$message.success(this.$t(
          `cloudpivot.form.runtime.actionTip.${ac.code}`
        ) as string);
      } else {
        this.$message.success(this.$t(
          `cloudpivot.form.runtime.actionTip.save2`
        ) as string);
      }
      setTimeout(() => {
        this.hideToast();

        if (this.isWorkflowForm) {
          const params: any = this.$route.query;
          const workitem = res.data.workItem;
          if (workitem) {
            this.goWfForm(workitem.id, workitem.instanceId);
          } else if (params.workitemId && params.workflowInstanceId) {
            this.goWfForm(params.workitemId, params.workflowInstanceId);
          }
        } else {
          this.goBizForm();
        }
      }, 2000);
    } else if (ac.code === runtime.FormAction.Retrieve) {
      // 撤回刷新页面
      const workflowInstanceId = this.$route.query.workflowInstanceId as string;
      const workitemId = this.$route.query.workitemId as string;
      if (res.data.id === workitemId) {
        this.reload();
        this.workflowInstanceId = "";
        this.$nextTick(() => {
          this.workflowInstanceId = workflowInstanceId;
        });
      } else {
        this.goWfForm(res.data.id, workflowInstanceId);
      }

      // this.retrieveCallBack();
    } else {
      this.$message.success(this.$t(
        `cloudpivot.form.runtime.actionTip.${ac.code}`
      ) as string);

      setTimeout(() => {
        let url =
          (this.$route.query.return as string) ||
          window.sessionStorage.getItem("fullPath");

        if (url) {
          this.$router.replace({
            path: url
          });
          // this.$router.push(url)
        } else {
          this.goEmptyPage(res);
        }
      }, 1000);
    }
  }

  // retrieveCallBack() {
  //   const workflowInstanceId = this.$route.query.workflowInstanceId as string;
  //   const workitemId = this.$route.query.workitemId as string;
  //   const vm = this;
  //   this.timer = setInterval(() => {
  //       const params = {
  //           workflowInstanceId,
  //           activityCode: this.formObj.activityCode as string
  //       }
  //       workflowApi.isRetrieve(params).then(res => {
  //           if (res.errcode === 0) {
  //               if (!res.data) {
  //                   // 撤回成功获得新流程实例id 刷新表单
  //                   workflowApi.getWorkitemByInstanceid({ workflowInstanceId }).then(res => {
  //                       if (res.errcode === 0) {
  //                           vm.reload();
  //                           vm.workflowInstanceId = '';
  //                           vm.$nextTick(()=>{
  //                             vm.workflowInstanceId = workflowInstanceId;
  //                           });
  //                       }
  //                   });
  //                   clearInterval(vm.timer);
  //               }
  //           } else {
  //               this.$message.error(res.errmsg || '');
  //               clearInterval(vm.timer);
  //           }
  //       });
  //   },1000);
  // }

  goBizForm() {

    const url = this.$route.query.return as string;
    this.$router.replace({
      name: "form-detail",
      query: {
        schemaCode: this.formObj.bizSchema.code,
        sheetCode: this.formObj.bizSheet.code,
        objectId: this.formObj.bizObject.id,
        return: url,
        t: new Date().getSeconds().toString() || ''
      }
    });
    this.clean();
    // this.reload();
  }

  goWfForm(workitemId: string, workflowInstanceId: string) {

    const url = this.$route.query.return as string;
    this.$router.replace({
      name: "form-detail",
      query: {
        workitemId,
        workflowInstanceId,
        return: url,
        t: new Date().getSeconds().toString() || ''
      } as any
    });
  }

  goEmptyPage(backData?: any) {
    if ((window as any).externalLinkToken && backData) {
      const { formCode, objectId, schemaCode, workflowInstanceId } = backData.data;
      let param: any = {
        formCode,
        objectId,
        schemaCode
      }
      if ((window as any).isStartWorkflow) {
        param = { objectId, workflowInstanceId };
      }
      externalLinkApi
        .getShortCode(param)
        .then((res: any) => {
          if (res.errcode === 0) {
            this.$router.replace({
              name: "shared-success",
              params: { shortCode: res.data.pairCode }
            });
            console.log("url", (window as any).location.href);
          }
        });
    } else {
      this.$router.replace({
        name: "form-empty",
        query: {
          return: this.$route.query.return
        }
      });
    }
  }

  goUnpublished() {
    this.$router.push({
      name: "formUnpublished"
    }).catch((err: any) => {err});
  }

  goPermission() {
    // this.$router.replace({
    //   name: "permission"
    // });
    const theUrl = `${env.portalHost}/mobile/#/permission`;
    window.location.href = theUrl;
  }

  flowTrack() {
    // if(!this.formObj || !this.formObj.workItemId){
    //   this.$h3.toast.show({
    //     text: "workItemId为空！",
    //     iconType: "close"
    //   });
    //   return;
    // }

    this.$router.push({
      name: "FormApproval",
      params: {
        workflowInstanceId: this.workflowInstanceId
      },
      query: {
        return: this.$route.query.return
      }
    }).catch((err: any) => {err});
  }

  /**
   * 获取评论数
   * */
  async getCommListNum() {
    const { id, schemaCode } = this.formObj.bizObject as any;
    if (!this.formObj) return;
    const params: FormCommentIns.formCommentParams.CommentList = {
      bizObjectId: id,
      schemaCode
    }

    const res: any = await FormCommentIns.FormCommentApi.getCommentListNum(params);
    if (res.errcode === 0) {
      const { data } = res;
      if (!this.isSsubmited || !this.isLoadComment) return;
      const item: any = this.actions.find((ac: any) => ac.code === runtime.FormAction.Comment);
      if (item) {
        item.text = `${this.$t('languages.common.comment', { data: data })}`;
      } else {
        this.actions.push({
          code: runtime.FormAction.Comment,
          text: `${this.$t('languages.common.comment', { data: data })}`,
          disabled: false,
          visible: true
        })
      }
    } else {
      console.error(res.errmsg);
    }
  }

  onCloseModal(modal: string) {
    if (modal === 'FormComment') {
      const title = this.formObj.instanceName || this.formObj.bizSheet.name;
      platform.service.setTitle(title);
      this.getCommListNum();
    }
  }
}
</script>

<style lang="less" scoped>
@import "~@/styles/mixins.less";
@import "~@/styles/1px.less";

.form-detail {
  // display: flex;
  // flex-direction: column;
  height: 100%;
  position: relative;
  overflow-x: hidden;

  /deep/.h3-org-select {
    position: fixed;
  }

  /deep/ .h3-panel > .h3-panel-header {
    .px2rem(font-size, @font-size-xl);
    // .px2rem(height, 90px);
    .px2rem(padding-left, 30px);
    .px2rem(padding-right, 30px);
    .px2rem(padding-top, 20px);
    .px2rem(padding-bottom, 20px);
    .hairline("bottom", #eee);
    display: block;
    // align-items: center;
    background-color: #f7f8fc;

    & > span {
      font-size: 18px;
      font-weight: 500;
      color: rgba(0, 0, 0, 0.85);
    }
  }

  /deep/.desc {
    min-height: 2.8em;
    margin: 0.5em;
    .px2rem(margin-left, 30px);
    .px2rem(margin-right, 30px);
  }

  .print {
    height: 44px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #2970ff;
    font-size: 0.4rem;
    background-color: #fff;
    //div {
    //  width: 100%;
    //  display: flex;
    //  align-items: center;
    //  justify-content: center;
    //  position: relative;
    //}
    //div:first-child::after {
    //  content: '';
    //  height: 20px;
    //  width: 1px;
    //  background: #EEEEEE;
    //  position: absolute;
    //  right: 0;
    //}
}

}
.printDoc {
  /deep/ .ant-modal {
    height: 80% !important;
    top: 10%;
    padding: 0;
    .ant-modal-content {
      height: 100%;
      padding: 4vw 0.5vw 0.5vw 0.5vw;
      .printIframe {
        width: 100%;
        height: 98%;
        & > div[role=document] {
          .exp {
            display: none !important;
          }
        }
      }
      .ant-modal-body {
        height: 100%;
        overflow: auto;
        padding: 1vw 0 0 0;
      }
      .ant-modal-close-x {
        width: auto;
        height: auto;
        line-height: initial;
        padding-right: 1vw;
      }
    }
  }
}
.form-body {
  // flex-grow: 1;
  overflow-x: hidden;
  overflow-y: auto;
  // margin-bottom: 44px;
  //height: calc(100% - 44px);
  //&.hasnodes {
  //  height: calc(100% - 88px);
  //}
  .form {
    //border-top:0.5px solid #eee;
    background-color: #fff;
  }
}

// /deep/ .h3-swiper {
//   overflow: hidden !important;
// }
// /deep/.h3-swiper-item > div {
//   overflow-y: auto;
//   height: calc(100vh - 2.47rem) !important;
// }

.form-foot {
  // flex-shrink: 0;
  // position: fixed;
  // z-index: 10;
  // bottom: 0;
  // width: 100%;
  // height: 24px;
  // box-sizing: border-box;
}

/deep/.toptip.error {
  color: @error-color;
  position: fixed;
  z-index: 11;
  background-color: @error-bg;
}
</style>
