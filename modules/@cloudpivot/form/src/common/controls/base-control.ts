import { Subscription } from "rxjs";

import { debounceTime } from "rxjs/operators"

import {Vue, Watch, Prop, Inject, InjectReactive} from "vue-property-decorator";

import * as typings from "@cloudpivot/form/schema";

import { listApi, listParams } from "@cloudpivot/api";

import { recursionSearch } from "@cloudpivot/common/src/utils/utils";

import dateFormat from "@cloudpivot/common/src/utils/date";
import { FormBuilderHelper } from "@cloudpivot/form/src/renderer/controls/form-builder-helper";

const dayjs = require('dayjs')

import {
  FormControl,
    Control,
    ControlValueChange,
  ControlPropertyChange,
    FormGroup,
    FormSheet,
    PropertyNames,
} from "h3-forms";

import {
  RendererFormControl,
  DataItemLike,
  FormControlType,
  DataItemType,
  OperatorService,
  DateItemOperatorType,
} from "@cloudpivot/form/schema";

import { ControlHelper } from "./control-helper";
import { deepCopy } from "../../../utils";
// import {
//   FormControlType,
//   DataItemType,
//   OperatorService,
//   DateItemOperatorType,
// } from "../../schema";

export abstract class BaseControl<
  T extends typings.FormControlOptions
> extends Vue {
  @Prop()
  readonly control!: RendererFormControl;

  styleObj: any = {};

  @InjectReactive("project") projectCode?: string;

  get id() {
    if (this.control.parentKey) {
      return `${this.control.parentKey}-${this.control.key}`;
    }
    return this.control.key;
  }

  get ctrl() {
    if (!this.control.controller) {
      if (!this.control.parentKey) {
        const _ctrl = this.findController(this.control.key);
        this.$set(this.control, "controller", _ctrl);
        // this.$set(this.control, "edit", _ctrl.readonly === false);
        // this.control.edit = _ctrl.readonly === false;
      }
    }
    return this.control.controller as Control;
  }

  get readonly() {
    // return this.control.edit === false;
    if (this.ctrl) {
      return !!this.ctrl.readonly;
    }
    return false;
  }

  get controlOpts(): T {
    return this.control.options as T;
  }

  get style(): string {
    return this.controlOpts.style || "";
  }

  get label() {
    return ControlHelper.getControlLabel(this.control, this.$i18n.locale);
  }

  get locale() {
    return this.$i18n.locale || "zh";
  }

  get placeholder() {
    // var aa = this.locale;
    if (this.controlOpts.placeholder) {
      return this.controlOpts.placeholder;
    }

    switch (this.control.type) {
      case FormControlType.Text:
      case FormControlType.Textarea:
      case FormControlType.Number:
        return this.$t("cloudpivot.form.renderer.peleseInput");

      case FormControlType.Date:
      case FormControlType.StaffSelector:
      case FormControlType.StaffMultiSelector:
      case FormControlType.DepartmentSelector:
      case FormControlType.DepartmentMultiSelector:
      case FormControlType.Dropdown:
      case FormControlType.Checkbox:
      case FormControlType.Radio:
      case FormControlType.Address:
      case FormControlType.Location:
      case FormControlType.RelevanceForm:
      case FormControlType.RelevanceFormEx:
        return this.$t("cloudpivot.form.renderer.peleseSelect");
    }

    return "";
  }

  get readonlyFormula() {
    if (this.controlOpts.readonlyFormula) {
      return this.controlOpts.readonlyFormula;
    }
  }

  // 是否为外部用户
  get isExternal() {
    if ((window as any).isExternal) {
      return true;
    }
    return false;
  }

  @Inject()
  findController!: (key: string, obj?: any) => Control;

  @Inject()
  getController!: () => FormGroup;

  @Inject()
  getFormControls!: (keys?: string[]) => RendererFormControl[];

  @Inject()
  getScrollEl!: () => HTMLDivElement;

  @Inject()
  valChange!: (key: string, fun: Function) => void;

  @Inject()
  getDataItem!: (key: string, parentKey?: string) => DataItemLike;

  @Inject()
  getRelativeDataList!: (isList?:boolean) => [];

  @Inject()
  getSourceType!: () => string;

  setControl?(): void;

  getIsNew(): boolean {
    const isNew = (window as any).h3form ? !!(window as any).h3form.isNew : true;
    return isNew;
  }

  onChangeSubscription?: Subscription;

  propChangeSubscription?: Subscription;

  valueChangeSubscription: Subscription | null = null;

  onChangeFn: Function | null = null;

  formQueryCode: string = '';

  handleValueChange?(value: any, changeInfo: any): void;

  getPopupContainer() {
    // if (this.getScrollEl) {
    //   const scrollEl = this.getScrollEl();
    //   if (scrollEl) {
    //     return scrollEl;
    //   }
    // }
    // return triggerNode.parentNode;

    return (triggerNode: any) => {
      if (this.getScrollEl) {
        const scrollEl = this.getScrollEl();
        if (scrollEl) {
          return scrollEl;
        }
      }
      return document.body;
    };
  }

  getThisProxy() {
    return this.getController().children;
  }

  getControllerGroup() {
    return this.getController();
  }

  setValue(value: any) {
    if (this.ctrl) this.ctrl.value = value;
  }

  @Watch("control", {
    immediate: true,
  })
  onControlChange(c: RendererFormControl, oldControl: RendererFormControl) {
    // 防止 this.$set(this.control, 'controller', _ctrl) 时再次触发change
    if (c === oldControl) {
      return;
    }

    if (this.setControl) {
      this.setControl();
    }

    if (this.style) {
      this.style
        .trim()
        .split(";")
        .forEach((s) => {
          const [key, value] = s.trim().split(":");
          this.styleObj[key] = value;
        });
    } else {
      this.styleObj = {};
    }

    this.subscribeValueChange();
    this.unRefSubscription(oldControl);
    this.unRefSubscriptionTimer(oldControl);

    // const opts = this.controlOpts as any;
    // if (opts.onChange) {
    //     const _ctrl = this.ctrl as FormControl<any>;
    //     if (!this.onChangeSubscription) {
    //         const onChange = new Function('value', 'oldValue', 'form', opts.onChange);
    //         // const _this = this;
    //         const func = (change: ControlValueChange) => {
    //             const proxy = this.getThisProxy()
    //             onChange.call(proxy, change.value, change.oldValue, proxy);
    //         };
    //         this.onChangeSubscription = _ctrl.valueChange.subscribe(func);
    //     }
    // }
  }

  subscribeValueChange() {
    const ctrl = this.ctrl as FormControl<any>;
    if (!ctrl || !ctrl.valueChange) {
      return;
    }

    if (ctrl && ctrl.options && ctrl.options.hasOwnProperty("dataLinkage") ) {
      //debugger
      //@ts-ignore
      const dataLinkageOption = JSON.parse(ctrl.options.dataLinkage);
      // 解析dataLinkage, 获取condition、fillProperty、targetModel
      const { condition, fillProperty, targetModel } = dataLinkageOption;
      console.log("------------------dataLinkage-------------", ctrl.id);
      const fillPropertyArr: string[] = fillProperty ? fillProperty.split('=') : [];
      if (fillPropertyArr.length !== 2) return;
      const fillSrc = fillPropertyArr[0].substring(1, fillPropertyArr[0].length - 2);
      const fillTar = fillPropertyArr[1].substring(2, fillPropertyArr[1].length - 1);
      const condArr: string[] = condition ? condition.split('&&') : [];
      const isOnlyMainCondition: boolean = condition.indexOf('.') === -1;
      condArr.forEach(x => {
        const arr = x.split('=');
        const currentKey = arr[0].substring(1, arr[0].length - 2);
        const targetKey = arr[1].substring(2, arr[1].length - 1);
        const { key: currentKeyCode } = this.formatKey(currentKey);
        let controller: any = null;
        const idx = currentKeyCode.indexOf('.');
        if (idx > -1) {
          // 子表条件
          const rowIndex = ctrl.options.rowIndex || 0;
          const sheetKey = currentKeyCode.substring(0, idx);
          const controlKey = currentKeyCode.substr(idx + 1);
          const sheetCtrl = this.findController(sheetKey) as any;
          if (sheetCtrl) {
            const row = sheetCtrl.rows[rowIndex];
            controller = row.findChild(controlKey);
          }
        } else {
          controller = this.findController(currentKeyCode) as any;
        }
        if (controller && controller.valueChange) {
          const optimizationValChange = controller.valueChange.pipe(debounceTime(500));
          optimizationValChange.subscribe(() => {
            setTimeout(() => {
              const filterArr: any[] = [];
              const extraArr: any[] = [];
              condArr.forEach(item => {
                const innerArr = item.split('=');
                const innerCurrentKey = innerArr[0].substring(1, innerArr[0].length - 2);
                const innerTargetKey = innerArr[1].substring(2, innerArr[1].length - 1);
                const { key: innerCode } = this.formatKey(innerCurrentKey);
                // eslint-disable-next-line no-shadow
                let ctrl: any = null;
                // eslint-disable-next-line no-shadow
                const idx = innerCode.indexOf('.');
                if (idx > -1) {
                  // 子表条件
                  const rowIndex = controller.options.rowIndex || 0;
                  const sheetKey = innerCode.substring(0, idx);
                  const controlKey = innerCode.substr(idx + 1);
                  const sheetCtrl = this.findController(sheetKey) as any;
                  if (sheetCtrl) {
                    const row = sheetCtrl.rows[rowIndex];
                    ctrl = row.findChild(controlKey);
                  }
                } else {
                  ctrl = this.findController(innerCode) as any;
                }
                if (ctrl) {
                  filterArr.push({
                    key: innerTargetKey,
                    val: ctrl.value
                  })
                  extraArr.push(innerCurrentKey);
                }
              })
              //关联数据
              listApi.getListConfigData({schemaCode:targetModel}).then((res)=> {
                if(res.errcode === 0 && res.data) {
                  this.formQueryCode = res.data?.code??targetModel;
                }
              }).finally(()=> {
                this.emitOnDataLinkage({
                  filter: filterArr,
                  fillProperty: {
                    src: fillSrc,
                    target: fillTar
                  },
                  extraCond: extraArr,
                  targetModel
                })
              })
            }, 500);
          })
        }
      })
    }

    this.unsubscribeValueChange();

    this.valueChangeSubscription = ctrl.propertyChange.subscribe((change) => {
      switch (change.name) {
        case PropertyNames.Value:
          this.emitControlOnChange(change);

          if (this.handleValueChange) {
            this.handleValueChange(change.value, change);
          }
          break;

        // case PropertyNames.Readonly:
        //   this.control.edit = change.value === false;
        //   break;
      }
    });
  }

  emitControlOnChange(change: ControlValueChange) {
    const opts = this.controlOpts as any;

    if (!opts.onChange) {
      return;
    }

    if (!this.onChangeFn) {
      this.onChangeFn = new Function(
        "value",
        "oldValue",
        "form",
        opts.onChange
      );
    }
    const proxy = this.getThisProxy();

    this.onChangeFn.call(proxy, change.value, change.oldValue, proxy);
  }

  emitOnDataLinkage(params: any) {
    // 传入的参数格式key_dataItemType_fromControlType
    const isOnlyMainCondition:boolean =  params.extraCond.join('&&').indexOf('.') === -1;
    const isSheetItem:boolean = params.fillProperty.src.indexOf('.') > -1;
    const {key: srcKey} = this.formatKey(params.fillProperty.src)
    const ctrl = this.ctrl as FormControl<any>;
    let controller: any = null;
    let rowIndex: number = 0;
    const filterArr: listParams.Filters[] = [];
    const mulRelevantKeyArr: string[] = [];
    params.filter.forEach((x:any) => {
      const {key: xKey, dataItemType: xDataItemType, formControlType: xFormControlType} = this.formatKey(x.key)
      if (Number(xFormControlType) === 81) {
        mulRelevantKeyArr.push(xKey);
      }
      const filterVal = this.formatVal(x.val, Number(xFormControlType));
      filterArr.push({
        propertyCode: xKey,
        propertyType: Number(xDataItemType),
        propertyValue: filterVal,
        //@ts-ignore
        op: this.formatOp(Number(xFormControlType), filterVal)
      })
    })


    const {key: xKey, dataItemType: xDataItemType, formControlType: targetType} = this.formatKey(params.fillProperty["target"])
    const mixParams:listParams.QueryListParams = {
      filters: filterArr,
      mobile: false,
      page: 0,
      size: 20,
      // queryCode: params.targetModel,
      queryCode: this.formQueryCode.length ? this.formQueryCode: params.targetModel,
      schemaCode: params.targetModel,
      // @ts-ignore
      options:{
        // @ts-ignore
        customDisplayColumns:[xKey].concat(mulRelevantKeyArr),
        // @ts-ignore
        queryDisplayType: 1
      },
      // @ts-ignore
      customizedQuery:true
    }
    if (ctrl.options.inSheet) {
      if (isOnlyMainCondition && isSheetItem) {
        // 只有主表条件并且联动项是子表项, 需求要求将满足条件的数据项加到子表中
        if (rowIndex === 0) {
          listApi.getQueryList(mixParams).then(res => {
            const sheetKey = srcKey.substring(0, srcKey.indexOf('.'));
            const itemKey = srcKey.substring(srcKey.indexOf('.') + 1);
            const sheet = this.findController(sheetKey);
            const sheetControl = this.getFormControls([sheetKey])[0] as any;
            if(res.errcode === 0 && res.data && Array.isArray(res.data.content) && res.data.content.length > 0) {
              const rows: any[] = [];
              res.data.content.forEach((item: any) => {
                const vals: any = Object.create(null);
                vals[itemKey] = '';
                rows.push(vals);
              });
              sheet.value = rows;
              setTimeout(() => {
                // eslint-disable-next-line no-shadow
                const rows: any[] = [];
                res.data.content.forEach((item: any, index: number) => {
                  const rowData: any = Object.create(null);
                  let val: any = item.data[xKey]
                      switch(Number(targetType)) {
                        case FormControlType.Text:
                        case FormControlType.Radio:
                        case FormControlType.Dropdown:
                          if (typeof val === "string" && val.length <= 200) {
                            rowData[itemKey] = val;
                          } else if (typeof val !== "object") {
                            rowData[itemKey] = val.toString();
                          } else if (typeof val === "object") {
                            rowData[itemKey] = JSON.stringify(val);
                          }
                          break;

                        case FormControlType.SequenceNo:
                        case FormControlType.Textarea:
                        case FormControlType.Description:
                        case FormControlType.Title:
                          if (typeof val === "string") {
                            rowData[itemKey] = val;
                          }
                          break;

                        case FormControlType.Number:
                          if (val === "") {
                            rowData[itemKey] = null;
                          }
                          rowData[itemKey] = Number(val);
                          break;

                        case FormControlType.Logic:
                          rowData[itemKey] = Boolean(val);
                          break;

                        case FormControlType.Date:
                        case FormControlType.CreatedTime:
                        case FormControlType.ModifiedTime:
                          if (val instanceof Date) {
                            rowData[itemKey] = val;
                          } else if (typeof val === "string" && val) {
                            try {
                              const str = val
                                .replace(/-/g, "/") // iOS兼容
                                .replace(/T/g, " "); //修复2019-09-17T06:21:07.000字符不能new Date的问题

                              const date = new Date(str);
                              if (date.getFullYear() > 0) {
                                rowData[itemKey] = date;
                              }
                            } catch {}
                          }
                          break;

                        case FormControlType.Checkbox:
                          if (typeof val === "string") {
                            rowData[itemKey] = val.split(";").filter((x) => !!x);
                          } else if (typeof val === "object") {
                            rowData[itemKey] = [val];
                          } else if (
                            Array.isArray(val) &&
                            val.some((x) => typeof x === "string")
                          ) {
                            rowData[itemKey] = val;
                          }
                          break;

                        case FormControlType.Location:
                          if (typeof val === "string") {
                            try {
                              val = JSON.parse(val);
                            } catch {}
                          }
                          if (typeof val === "object") {
                            rowData[itemKey] = val;
                          }
                          break;

                        case FormControlType.Image:
                        case FormControlType.Attachment:
                        case FormControlType.Signature:
                        case FormControlType.StaffSelector:
                        case FormControlType.StaffMultiSelector:
                        case FormControlType.DepartmentSelector:
                        case FormControlType.DepartmentMultiSelector:
                        case FormControlType.CreateBy:
                        case FormControlType.ModifyBy:
                        case FormControlType.OwnerId:
                        case FormControlType.CreateByParentId:
                        case FormControlType.Sheet:
                          if (typeof val === "string") {
                            try {
                              val = JSON.parse(val);
                            } catch {}
                          }
                          if (Array.isArray(val) && val.some((x) => typeof x === "object")) {
                            rowData[itemKey] = val;
                          }
                          break;

                        case FormControlType.ApprovalOpinion:
                          if (typeof val === "string") {
                            rowData[itemKey] = {
                              content: val,
                            };
                          } else if (
                            typeof val === "object" &&
                            typeof val.content === "string"
                          ) {
                            rowData[itemKey] = val;
                          }
                          break;

                        case FormControlType.DateRange:
                        case FormControlType.NumberRange:
                          if (Array.isArray(val)) {
                            rowData[itemKey] = val;
                          }
                          break;

                        case FormControlType.ReverseRelevance:
                        case FormControlType.RelevanceForm:
                        case FormControlType.RelevanceFormEx:
                        case FormControlType.Address:
                          if (typeof val === "string") {
                            try {
                              val = JSON.parse(val);
                            } catch {
                            }
                          }
                          if (typeof val === "object") {
                            rowData[itemKey] = val;
                          }
                          break;
                      }
                  rows.push(rowData);
                })
                sheet.value = rows;
              }, 10)
            } else {
              sheet.value = [];
            }
          })
        }
      } else {
        const idx = srcKey.indexOf('.');
        rowIndex = ctrl.options.rowIndex || 0;
        const sheetKey = srcKey.substring(0, idx);
        const controlKey = srcKey.substr(idx + 1);
        const sheetCtrl = this.findController(sheetKey) as any;
        if (sheetCtrl) {
          const row = sheetCtrl.rows[rowIndex];
          controller = row.findChild(controlKey);
        }
        listApi.getQueryList(mixParams).then(res => {
          if (res.errcode === 0 && res.data && Array.isArray(res.data.content) && res.data.content.length > 0) {
            let val = res.data.content[0]["data"][xKey];
            //根据目标控件类型格式化值
            switch (Number(targetType)) {
              case FormControlType.Text:
              case FormControlType.Radio:
              case FormControlType.Dropdown:
                if (typeof val === "string" && val.length <= 200) {
                  controller.value = val;
                } else if (typeof val !== "object") {
                  controller.value = val.toString();
                } else if (typeof val === "object") {
                  controller.value = JSON.stringify(val);
                }
                break;

              case FormControlType.SequenceNo:
              case FormControlType.Textarea:
              case FormControlType.Description:
              case FormControlType.Title:
                if (typeof val === "string") {
                  controller.value = val;
                }
                break;

              case FormControlType.Number:
                if (val === "") {
                  controller.value = null;
                }
                controller.value = Number(val);

              case FormControlType.Logic:
                controller.value = Boolean(val);

              case FormControlType.Date:
              case FormControlType.CreatedTime:
              case FormControlType.ModifiedTime:
                if (val instanceof Date) {
                  controller.value = val;
                } else if (typeof val === "string" && val) {
                  try {
                    const str = val
                      .replace(/-/g, "/") // iOS兼容
                      .replace(/T/g, " "); //修复2019-09-17T06:21:07.000字符不能new Date的问题

                    const date = new Date(str);
                    if (date.getFullYear() > 0) {
                      controller.value = date;
                    }
                  } catch {}
                }
                break;

              case FormControlType.Checkbox:
                if (typeof val === "string") {
                  controller.value = val.split(";").filter((x) => !!x);
                } else if (typeof val === "object") {
                  controller.value = [val];
                } else if (
                  Array.isArray(val) &&
                  val.some((x) => typeof x === "string")
                ) {
                  controller.value = val;
                }
                break;

              case FormControlType.Location:
                if (typeof val === "string") {
                  try {
                    val = JSON.parse(val);
                  } catch {}
                }
                if (typeof val === "object") {
                  controller.value = val;
                }
                break;

              case FormControlType.Image:
              case FormControlType.Attachment:
              case FormControlType.Signature:
              case FormControlType.StaffSelector:
              case FormControlType.StaffMultiSelector:
              case FormControlType.DepartmentSelector:
              case FormControlType.DepartmentMultiSelector:
              case FormControlType.CreateBy:
              case FormControlType.ModifyBy:
              case FormControlType.OwnerId:
              case FormControlType.CreateByParentId:
              case FormControlType.Sheet:
                if (typeof val === "string") {
                  try {
                    val = JSON.parse(val);
                  } catch {}
                }
                if (Array.isArray(val) && val.some((x) => typeof x === "object")) {
                  controller.value = val;
                }
                break;

              case FormControlType.ApprovalOpinion:
                if (typeof val === "string") {
                  controller.value = {
                    content: val,
                  };
                } else if (
                  typeof val === "object" &&
                  typeof val.content === "string"
                ) {
                  controller.value = val;
                }
                break;

              case FormControlType.DateRange:
              case FormControlType.NumberRange:
                if (Array.isArray(val)) {
                  controller.value = val;
                }
                break;

              case FormControlType.ReverseRelevance:
              case FormControlType.RelevanceForm:
              case FormControlType.RelevanceFormEx:
              case FormControlType.Address:
                if (typeof val === "string") {
                  try {
                    val = JSON.parse(val);
                  } catch {}
                }
                if (typeof val === "object") {
                  controller.value = val;
                }
                break;
            }
          } else {
            switch(Number(targetType)) {
              case FormControlType.Date:
              case FormControlType.CreatedTime:
              case FormControlType.ModifiedTime:
              case FormControlType.Image:
              case FormControlType.Attachment:
              case FormControlType.Signature:
              case FormControlType.StaffSelector:
              case FormControlType.StaffMultiSelector:
              case FormControlType.DepartmentSelector:
              case FormControlType.DepartmentMultiSelector:
              case FormControlType.CreateBy:
              case FormControlType.ModifyBy:
              case FormControlType.OwnerId:
              case FormControlType.CreateByParentId:
              case FormControlType.Sheet:
              case FormControlType.ReverseRelevance:
              case FormControlType.RelevanceForm:
              case FormControlType.RelevanceFormEx:
              case FormControlType.Address:
              case FormControlType.Number:
              case FormControlType.Checkbox:
              case FormControlType.Logic:
                controller.value = null;
                break;
              default:
                controller.value = "";
                break;
            }
          }
        })
      }
    }else {
      controller = this.findController(srcKey);
      listApi.getQueryList(mixParams).then(res => {
        if(res.errcode === 0 && res.data && Array.isArray(res.data.content) && res.data.content.length > 0) {
          let val = res.data.content[0]["data"][xKey];
            //根据目标控件类型格式化值
            switch (Number(targetType)) {
              case FormControlType.Text:
              case FormControlType.Radio:
              case FormControlType.Dropdown:
                if (typeof val === "string" && val.length <= 200) {
                  controller.value = val;
                } else if (typeof val !== "object") {
                  controller.value = val.toString();
                } else if (typeof val === "object") {
                  controller.value = JSON.stringify(val);
                }
                break;

              case FormControlType.SequenceNo:
              case FormControlType.Textarea:
              case FormControlType.Description:
              case FormControlType.Title:
                if (typeof val === "string") {
                  controller.value = val;
                }
                break;

              case FormControlType.Number:
                if (val === "") {
                  controller.value = null;
                }
                controller.value = Number(val);

              case FormControlType.Logic:
                controller.value = Boolean(val);

              case FormControlType.Date:
              case FormControlType.CreatedTime:
              case FormControlType.ModifiedTime:
                if (val instanceof Date) {
                  controller.value = val;
                } else if (typeof val === "string" && val) {
                  try {
                    const str = val
                      .replace(/-/g, "/") // iOS兼容
                      .replace(/T/g, " "); //修复2019-09-17T06:21:07.000字符不能new Date的问题

                    const date = new Date(str);
                    if (date.getFullYear() > 0) {
                      controller.value = date;
                    }
                  } catch {}
                }
                break;

              case FormControlType.Checkbox:
                if (typeof val === "string") {
                  controller.value = val.split(";").filter((x) => !!x);
                } else if (typeof val === "object") {
                  controller.value = [val];
                } else if (
                  Array.isArray(val) &&
                  val.some((x) => typeof x === "string")
                ) {
                  controller.value = val;
                }
                break;

              case FormControlType.Location:
                if (typeof val === "string") {
                  try {
                    val = JSON.parse(val);
                  } catch {}
                }
                if (typeof val === "object") {
                  controller.value = val;
                }
                break;

              case FormControlType.Image:
              case FormControlType.Attachment:
              case FormControlType.Signature:
              case FormControlType.StaffSelector:
              case FormControlType.StaffMultiSelector:
              case FormControlType.DepartmentSelector:
              case FormControlType.DepartmentMultiSelector:
              case FormControlType.CreateBy:
              case FormControlType.ModifyBy:
              case FormControlType.OwnerId:
              case FormControlType.CreateByParentId:
              case FormControlType.Sheet:
                if (typeof val === "string") {
                  try {
                    val = JSON.parse(val);
                  } catch {}
                }
                if (Array.isArray(val) && val.some((x) => typeof x === "object")) {
                  controller.value = val;
                }
                break;

              case FormControlType.ApprovalOpinion:
                if (typeof val === "string") {
                  controller.value = {
                    content: val,
                  };
                } else if (
                  typeof val === "object" &&
                  typeof val.content === "string"
                ) {
                  controller.value = val;
                }
                break;

              case FormControlType.DateRange:
              case FormControlType.NumberRange:
                if (Array.isArray(val)) {
                  controller.value = val;
                }
                break;

              case FormControlType.ReverseRelevance:
              case FormControlType.RelevanceForm:
              case FormControlType.RelevanceFormEx:
              case FormControlType.Address:
                if (typeof val === "string") {
                  try {
                    val = JSON.parse(val);
                  } catch {}
                }
                if (typeof val === "object") {
                  controller.value = val;
                }
                break;
            }
        } else {
          switch(Number(targetType)) {
            case FormControlType.Date:
            case FormControlType.CreatedTime:
            case FormControlType.ModifiedTime:
            case FormControlType.Image:
            case FormControlType.Attachment:
            case FormControlType.Signature:
            case FormControlType.StaffSelector:
            case FormControlType.StaffMultiSelector:
            case FormControlType.DepartmentSelector:
            case FormControlType.DepartmentMultiSelector:
            case FormControlType.CreateBy:
            case FormControlType.ModifyBy:
            case FormControlType.OwnerId:
            case FormControlType.CreateByParentId:
            case FormControlType.Sheet:
            case FormControlType.ReverseRelevance:
            case FormControlType.RelevanceForm:
            case FormControlType.RelevanceFormEx:
            case FormControlType.Address:
            case FormControlType.Number:
            case FormControlType.Checkbox:
            case FormControlType.Logic:
              controller.value = null;
              break;
            default:
              controller.value = "";
              break;
          }

        }
      })
    }
  }

  // 传入的参数格式key_dataItemType_fromControlType
  formatKey(keyStr: string){
    const _lastIndex = keyStr.lastIndexOf('_');
    const _last2rdIndex = keyStr.lastIndexOf('_', _lastIndex - 1);
    const key = keyStr.substring(0, _last2rdIndex);
    const dataItemType = keyStr.substring(_last2rdIndex + 1, _lastIndex);
    const formControlType = keyStr.substr(_lastIndex + 1);
    return {
      key,
      dataItemType,
      formControlType
    }
  }

  // 根据表单控件类型去格式化值
  formatVal(val: any, type: number) {
    let propertyValue: any = null;
    if (val) {
      switch(type) {
        case 1:
        case 2:
        case 4:
        case 5:
        case 7:
        case 8:
          propertyValue = String(val);
          break;
        case 3: // 日期
          propertyValue = val instanceof Date ? dateFormat.formatter(val, "YYYY-MM-DD HH:mm:ss") : val;
          break;
        case 6: // 复选框
          propertyValue = val.join(';');
          break;
        case 14: // 地址
          if (val && Object.keys(val).length > 0) {
            propertyValue = JSON.stringify(val);
          } else {
            propertyValue = null;
          }
          break;
        case 50: // 人员单复选
        case 51:
        case 60:
        case 61:
          const tmpVal = val.map((m: any) => {
            return {
              id: m.id,
              unitType: m.unitType,
              name: m.name
            }
          })
          propertyValue = JSON.stringify(tmpVal);
          break;
        case 80:
          propertyValue = val.id;
          break;
        case 81:
          propertyValue = val.map((x: any) => x.id).join(';');
          break;
        default:
          propertyValue = String(val);
          break;
      }
    } else {
      return "";
    }
    return propertyValue;
  }

  formatOp(type: number, val: any) {
    switch(type) {
      case 6:
      case 14:
      case 80:
      case 81:
        return "Like";
      case 50:
      case 51:
      case 60:
      case 61:
        // 选人选组织控件 当没有值时 需要传Eq,有值需要传Like
        if (!val) {
          return "Eq";
        } else {
          return "Like";
        }
      default:
        return "Eq";
    }
  }

  validate() {
    (this.ctrl as FormControl<any>).validate(false);
  }

  // countLengthOf(s: string) {
  //     if (!s) {
  //         return 0;
  //     }
  //     const reg = /[\u4e00-\u9fa5]+/;
  //     let result: RegExpExecArray | null;
  //     let len = 0;
  //     while (result = reg.exec(s), result !== null) {
  //         len += result[0].length * 2;
  //         s = s.replace(reg, '');
  //     }
  //     len += s.length;
  //     return len;
  // }
  /**
   *
   * @param formControls 所有的control
   * @param exp
   */
  parseConditions(formControls: typings.RendererFormControl[], exp: string) {
    let segs: string[] = [];
    const results: any[] = [];

    if (exp.indexOf("||") > -1) {
      segs = exp.split(" || ");
    } else {
      if (exp.indexOf("&&") > -1) {
        segs = exp.split(" && ");
      } else {
        segs = [exp];
      }
    }

    for (const seg of segs) {
      const fields = seg.split(" ");
      const code = fields[2].substring(1, fields[2].length - 1);

      let ctrl: any;
      let control: typings.RendererFormControl | undefined;

      const idx = code.indexOf(".");
      if (idx > -1) {
        const parentCode = code.substring(0, idx);
        const childCode = code.substring(idx + 1);
        const sheet = (formControls.find(
          (c) => c.key === parentCode
        ) as any) as typings.FormSheet;
        if (sheet) {
          control = sheet.columns.find((c) => c.key === childCode) as any;
        }

        const sheetCtrl = this.findController(parentCode) as FormSheet;

        if (
          sheetCtrl &&
          this.ctrl.options &&
          typeof this.ctrl.options.rowIndex === "number"
        ) {
          const row = sheetCtrl.rows[this.ctrl.options.rowIndex];
          ctrl = row.findChild(childCode);
        }
      } else {
        ctrl = this.findController(code);
        control = formControls.find((c) => c.key === code);
      }

      if (!ctrl || !control) {
        continue;
      }

      const type = ControlHelper.mapToDataItemType(control.type);

      const operator = OperatorService.findByLabel(type, fields[1]);

      if (!operator) {
        continue;
      }

      // let val: any;

      // if (
      //   !(
      //     operator.value === DateItemOperatorType.IsNull ||
      //     operator.value === DateItemOperatorType.IsNotNull
      //   )
      // ) {
      //   val = fields[2];

      //   switch (type) {
      //     case DataItemType.Number:
      //       val = Number(val);
      //       break;
      //     case DataItemType.Logic:
      //       val = val === "true" ? 1 : 0;
      //       break;
      //     case DataItemType.Date:
      //     case DataItemType.ShortText:
      //     case DataItemType.LongText:
      //       val = val.substring(1, val.length - 1);
      //       break;
      //     case DataItemType.StaffSelector:
      //       if (val) {
      //         try {
      //           val = JSON.parse(val);
      //         } catch (e) {
      //           console.log("initModel", e);
      //         }
      //       }
      //       break;
      //   }
      // }

      results.push({
        code: fields[0],
        control,
        controller: ctrl,
        propertyType: type,
        operatorType: operator.value,
        // value: val
      });
    }

    return results;
  }

  countLengthOf(s: string) {
    if (!s) {
      return 0;
    }
    return s.length;
  }

  subscribePropertyChange(fn: (change: ControlPropertyChange) => void) {
    const ctrl = this.findController(this.id);

    if (!ctrl) {
      return;
    }

    if (this.propChangeSubscription) {
      this.propChangeSubscription.add(ctrl.propertyChange.subscribe(fn));
    } else {
      this.propChangeSubscription = ctrl.propertyChange.subscribe(fn);
    }
  }

  unsubscribeValueChange() {
    if (this.valueChangeSubscription) {
      this.valueChangeSubscription.unsubscribe();
    }
  }

  unsubscribe() {
    if (this.onChangeSubscription) {
      this.onChangeSubscription.unsubscribe();
    }

    if (this.propChangeSubscription) {
      this.propChangeSubscription.unsubscribe();
    }
  }

  /**
   * 取消control中注册的订阅事件
   * @param control
   */
  unRefSubscription(control: RendererFormControl) {
    if (control && control.refSubscription && control.refSubscription.length) {
      control.refSubscription.forEach((subscription) => {
        subscription.unsubscribe();
      });
    }
  }

  /**
   * 清理control中订阅事件延时器
   * @param control
   */
  unRefSubscriptionTimer(control: RendererFormControl) {
    if (control && control.refSubscriptionTimer && control.refSubscriptionTimer.length) {
      control.refSubscriptionTimer.forEach((timer) => {
        clearTimeout(timer);
      });
    }
  }

  destroyed() {
    this.unsubscribe();
    this.unsubscribeValueChange();
    this.unRefSubscription(this.control);
    this.unRefSubscriptionTimer(this.control);
  }
}
