import { formApi } from "@cloudpivot/api";
import env from "@cloudpivot/list/env";
import common from "@cloudpivot/common";
const { replaceValueData } = common.utils.BusinessFunctions;
import { recursionSearch } from "@cloudpivot/common/src/utils/utils";
import { schema, renderer } from "@cloudpivot/form";
import { ControlHelper } from "@cloudpivot/form/src/common/controls/control-helper";
import {
  textDataItemOperators,
  numberDataItemOperators,
  logicDataItemOperators,
  DateItemOperatorType,
  sequenceStatusOperators,
  staffDataItemOperators,
} from "@cloudpivot/form/src/common/data-item/data-item2";

const pageSettings: any = {
  eleType: "pageSettings",
  direction: 1,
  _papersize: {
    id: 1,
    scale: "A4",
    widthTomm: 210,
    heightTomm: 297,
    widthTopx: "595",
    heightTopx: "842",
  },
  _pagemargin: {
    UpTomm: 20,
    DownTomm: 20,
    LeftTomm: 17,
    RightTomm: 17,
    UpTopx: 57,
    DownTopx: 57,
    LeftTopx: 48,
    RightTopx: 48,
  },
  _headerfooter: {
    header: {
      marginTopTomm: 10,
      marginTopTopx: 28,
      align: "",
      items: { key: [], value: [] },
    },
    footer: {
      marginTopTomm: 10,
      marginTopTopx: 28,
      align: "",
      items: { key: [], value: [] },
    },
  },
  bgImg: {
    uid: "",
    name: "",
    status: "",
    url: "",
  },
  isPrintBgImg: false,
};

export default {
  async printBatchForm(vm: any, list: any, sheetCode: string) {
    const { schemaCode } = vm.$route.params;
    const arrList: any = [];
    const tempList: any = [];
    const { data, errcode, errmsg } = await formApi.getPrintAttributesJson({
      sheetCode,
      schemaCode,
    });
    if (errcode !== 0) {
      vm.$message.error(errmsg, 3);
      return;
    }
    for (let i = 0; i < list.arr.length; i++) {
      const arr: any = await this.printFormCode(
        vm,
          {
            arr: list.arr[i],
            changeArr: list.changeArr[i].map,
            formControls: list.changeArr[i].formControls,
          },
        data
      );
      arr.draftAttributesJson.length && arrList.push(arr.draftAttributesJson);
      arr.tempPrientList.length && tempList.push(arr.tempPrientList);
    }
    vm.tempPrintEleArray = tempList;
    vm.draftAttributesJsonSet = arrList;
    if (!tempList.length) {
      this._startPrintHtml(vm);
    }
  },
  /*
   * 构建打印表单
   */
  async printFormCode(
      vm: any,
      { arr, changeArr, formControls }: any,
      data: any
  ) {
    vm.formdata = arr;
    vm.formControls = formControls || [];

    vm.printHtmlCloseLoading = (vm.$message as any).loading(
      vm.$t("cloudpivot.list.pc.loading").toString(),
      0
    );
    if (
      !data.draftAttributesJson ||
      !JSON.parse(data.draftAttributesJson).length
    ) {
      vm.$message.warning("打印模板内容为空！", 3);
      return;
    }
    vm.formObj = arr;
    // @ts-ignore
    vm.draftAttributesJson = replaceValueData(
      env,
      JSON.parse(data.draftAttributesJson) || [],
      "real",
      vm
    );
    findPageSettingInfo: for (const pages of vm.draftAttributesJson) {
      for (const item of pages) {
        if (item.eleType === "pageSettings") {
          item.top = -999;
          vm.tempPrintPageSettings = item;
          break findPageSettingInfo;
        }
      }
    }
    // 为了兼容老数据，pageSettings需要给默认值
    vm.tempPrintPageSettings === ""
      ? (vm.tempPrintPageSettings = pageSettings)
      : vm.tempPrintPageSettings;
    for (const page of vm.draftAttributesJson) {
      page.sort((a, b) => a.top - b.top);
    }
    const publishedAttributesJson = arr.bizSheet.publishedAttributesJson;
    let publishObjJSON = null;
    if (publishedAttributesJson) {
      publishObjJSON = JSON.parse(publishedAttributesJson);
    }
    const formDataVal: any = arr.bizObject.data;
    for (const page of vm.draftAttributesJson) {
      for (let ii = page.length - 1; ii >= 0; ii--) {
        const y = page[ii];
        const isCheckVisible = this.checkVisible(y, publishObjJSON, formDataVal);
        if (!isCheckVisible) {
          page.splice(ii, 1);
        }
        if (y.eleType !== "sheet") continue;
        const value = arr.bizObject.data[y.code];
        if (value && value.length > 0) {
          const valueCopy = JSON.parse(JSON.stringify(value));

          const controls = this.findFormControls(changeArr, [y.code]);
          if (controls && controls.length > 0) {
            const control = (controls[0] as any) as schema.FormSheet;
            if (control) {
              const map: any = {};
              control.columns.map((c) => (map[c.key] = c));

              for (const row of valueCopy) {
                for (const key of Object.keys(row)) {
                  if (map[key]) {
                    if (
                      map[key].type !== schema.FormControlType.Attachment &&
                      map[key].type !== schema.FormControlType.Image &&
                      map[key].type !== schema.FormControlType.RelevanceForm &&
                      map[key].type !==
                        schema.FormControlType.RelevanceFormEx &&
                      map[key].type !== schema.FormControlType.Signature
                    ) {
                      row[key] = renderer.FormControlValueService.format(
                        map[key],
                        row[key]
                      );
                    } else {
                      if (
                        map[key].type ===
                          schema.FormControlType.RelevanceForm ||
                        map[key].type === schema.FormControlType.RelevanceFormEx
                      ) {
                        let str: any = "";

                        row[key] && row[key][row[key]["displayCode"]]
                          ? (str = row[key][row[key]["displayCode"]])
                          : str;
                        // 逻辑
                        if (row[key] && row[key].propertyType === 4) {
                          str === true ? (str = "是") : (str = "否");
                        }

                        // 地址处理
                        if (row[key] && row[key].propertyType === 10 && str) {
                          const obj = JSON.parse(str);
                          if (
                            obj &&
                            (obj.hasOwnProperty("provinceName") ||
                              obj.hasOwnProperty("cityName") ||
                              obj.hasOwnProperty("districtName") ||
                              obj.hasOwnProperty("address"))
                          ) {
                            // @ts-ignore
                            str = `${obj.provinceName || ""}${
                              obj.cityName || ""
                            }${obj.districtName || ""}${obj.address || ""}`;
                          }
                        }
                        // 选人控件处理
                        if (row[key] && row[key].propertyType === 5 && str) {
                          let arrStr: string = "";
                          // eslint-disable-next-line no-shadow
                          str.map((arr: any) => {
                            arrStr === ""
                              ? (arrStr = arr.name)
                              : (arrStr += `、` + arr.name);
                          });
                          str = arrStr;
                        }

                        switch (str) {
                          case "DRAFT":
                            str = "草稿";
                            break;
                          case "PROCESSING":
                            str = "进行中";
                            break;
                          case "COMPLETED":
                            str = "已完成";
                            break;
                          case "CANCELED":
                            str = "已作废";
                            break;
                        }
                        row[key] = str.toString();
                      }
                      // 手写签名
                      else if (
                        map[key].type === schema.FormControlType.Signature
                      ) {
                        let signature: any = {};
                        Array.isArray(row[key]) && row[key].length > 0
                          ? (signature = row[key][0])
                          : (signature = []);
                        if (signature && signature.refId) {
                          const url = renderer.UploadControl.service.getDownloadUrl(
                            signature
                          );
                          row[key][0].url = url;
                          row[key][0].type = map[key].type;
                        }
                      } else {
                        row[key].forEach((v) => (v.type = map[key].type));
                      }
                    }

                    // 修改当表为‘逻辑’时 对应的值显示
                    if (map[key].key.includes("Logic")) {
                      row[key] = row[key] === "true" ? "是" : "否";
                    }
                  } else {
                    const val = row[key];
                    if (Array.isArray(val)) {
                      row[key] = val
                        .map((v: any) => v.name)
                        .filter((f) => !!f)
                        .join(";");
                    } else if (typeof val === "object" && val) {
                      if (val.name) {
                        row[key] = val.name;
                      } else if (val.provinceName && val.cityName) {
                        row[
                          key
                        ] = `${val.provinceName} ${val.cityName} ${val.districtName} ${val.address}`;
                      } else if (val.address) {
                        row[key] = val.address;
                      } else {
                        row[key] = "";
                      }
                    }
                  }
                }
              }
            }
          }
          y.value = valueCopy;
        } else {
          // 如果字表无内容则不打印字表
          page.splice(ii, 1);
        }
      }
    }
    const tempPrientList: any = [];
    for (let i = 0; i < vm.draftAttributesJson.length; i++) {
      const page = vm.draftAttributesJson[i];
      for (let j = 0; j < page.length; j++) {
        const ele = page[j];
        if (ele.eleType === "column" && ele.rightValue && ele.rightValue.code) {
          const code = ele.rightValue.code.split("#_#")[0];
          const [ctrl] = this.findFormControls(changeArr, [code]);
          if (!ctrl) continue;
          if (!!ctrl) {
            ele.ctrlType = ctrl.type;
            ele.ctrlValue = ctrl.value;
          }
          if (ctrl.type === schema.FormControlType.Textarea) {
            ++vm.tempPrintEleNumber;
            tempPrientList.push({
              tempPrintEle: ele,
              isShowTempPrintHtmlEle: true,
              key: `${code}_${i}_${j}`,
            });

            // 兼容富文本打印
            if (
              ctrl.options &&
              ctrl.options.textAreaType &&
              ctrl.options.textAreaType === "current"
            ) {
              ele.rightValue.renderType = "editor";
            }
          } else if (ctrl.type === schema.FormControlType.Image) {
            ++vm.tempPrintEleNumber;
            tempPrientList.push({
              tempPrintEle: ele,
              isShowTempPrintHtmlEle: true,
              key: `${code}_${i}_${j}`,
            });
          }
        } else if (ele.eleType === "sheet") {
          const code = ele.code;
          ++vm.tempPrintEleNumber;
          tempPrientList.push({
            tempPrintEle: ele,
            isShowTempPrintHtmlEle: true,
            key: `${code}_${i}_${j}`,
          });
        }
      }
    }
    console.log(tempPrientList, "tempPrintEleArray", vm.tempPrintEleNumber);
    return { tempPrientList, draftAttributesJson: vm.draftAttributesJson };
  },
  _findPrintEleIndex(id: any, value, vm: any) {
    let num = [-1, -1, -1];
    vm.draftAttributesJsonSet.forEach((e: any, c: number) => {
      e.forEach((i: any, v: number) => {
        i.forEach((n: any, k: number) => {
          const a = JSON.stringify(n.value);
          const b = JSON.stringify(value);
          if (
              n.id === id &&
              ((n.value && a === b) || !value)
          ) {
            num = [c, v, k];
          }
        });
      });
    });
    return num;
  },
  // 临时打印元素 返回的计算结果
  collectorTempPrintInfo({ id, calcDiff, value, ...other }, vm: any) {
    if (!("_num" in vm.collectorTempPrintContainer)) {
      vm.collectorTempPrintContainer._num = 0;
    }
    ++vm.collectorTempPrintContainer._num;

    const [aIndex, pIndex, sIndex] = this._findPrintEleIndex(id, value, vm);
    if (!vm.collectorTempPrintContainer[aIndex]) {
      vm.collectorTempPrintContainer[aIndex] = {};
    }
    if (!vm.collectorTempPrintContainer[aIndex][pIndex]) {
      vm.collectorTempPrintContainer[aIndex][pIndex] = {};
    }
    vm.collectorTempPrintContainer[aIndex][pIndex][sIndex] = {
      id,
      calcDiff,
      ...other,
    };
    this.printPageAlgorithm(vm, value, aIndex, pIndex, sIndex);
  },
  printPageAlgorithm(vm: any, value: any, page: any, p: any, eleIndex: any) {
    console.log(
      "PcFormDetail -> printPageAlgorithm -> vm.collectorTempPrintContainer",
      vm.collectorTempPrintContainer
    );
    const eleInfo = vm.collectorTempPrintContainer[page][p][eleIndex];
    if (eleInfo.calcDiff) {
      const [aIndex, pIndex, sIndex] = this._findPrintEleIndex(
        eleInfo.id,
        value,
        vm
      ); // 根据id获取元素当前位置, 因为在for中会操作draftAttributesJson
      const ele = vm.draftAttributesJsonSet[aIndex][pIndex][sIndex];
      let eleContentWidth = "";
      let eleMinWidth = "";
      let eleMaxWidth = "";
      const eleDefaultBottomHeight = ele.top + ele.heightValue;
      let newPageNum = 0; // ele 分页数量
      let eleBottomToTop = 0; // ele 不分页情况下, 最低部距离页头距离
      let lastPageHeight = 0; // ele分页,最后一页占用的高度
      if (
        ele.top + eleInfo.eleContentHeight + eleInfo.pageUpToPx >
        eleInfo.PageHeightPx
      ) {
        newPageNum = Math.ceil(
          Math.abs(
                (eleInfo.eleContentHeight) -
              (eleInfo.PageHeightPx - ele.top - eleInfo.pageUpToPx)
            ) / (eleInfo.PageHeightPx + eleInfo.pageUpToPx + eleInfo.downTopx)
        );
        lastPageHeight = Math.ceil(
            (eleInfo.eleContentHeight) -
            (eleInfo.PageHeightPx - ele.top - eleInfo.pageUpToPx) -
            (newPageNum - 1) * (eleInfo.PageHeightPx + eleInfo.pageUpToPx + eleInfo.downTopx)
        );
        // 如果支持 子表表头分页,则新的一页需要增加一行表头高度
        if (eleInfo.sheetHeaderPagingAttr) {
          lastPageHeight = lastPageHeight + newPageNum * eleInfo.headerHeight;
        }
      } else {
        eleBottomToTop = ele.top + eleInfo.eleContentHeight;
      }
      if (ele.eleType === "column") {
        eleContentWidth = ele.leftKey.widthValue + ele.rightValue.widthValue;
        eleMinWidth = ele.left;
        eleMaxWidth = ele.left + eleContentWidth;
      } else if (ele.eleType === "sheet") {
        eleContentWidth = ele.widthValue;
        eleMinWidth = ele.left;
        eleMaxWidth = ele.left + eleContentWidth;
      }
      const eleSibling: any = [];
      const eleSiblingIndex: number[] = [];
      const passivity_eleSibling: any = []; // 被动 分页的元素. 计算元素自己没有分页,但因为它的高度增加使用空间,导致它下面的元素出现分页情况.
      const passivity_eleSiblingIndex: any = []; // 被动 分页的元素的坐标
      let passivity_newPageNum: any = 0; // 被动 分页的元素.产生的分页数量. 理论上只会是1或0
      const _widthValueEleType = ["leftBarcodePic", "leftQrcodePic", "sheet"];
      // 获取那些元素在 变化高度元素下面.
      console.log(
        vm.draftAttributesJsonSet[aIndex][pIndex].length > sIndex + 1,
        "dd",
        vm.draftAttributesJsonSet[aIndex][pIndex]
      );

      if (vm.draftAttributesJsonSet[aIndex][pIndex].length > sIndex + 1) {
        const l = vm.draftAttributesJsonSet[aIndex][pIndex].length;
        for (let i = sIndex + 1; i < l; i++) {
          const tItem = vm.draftAttributesJsonSet[aIndex][pIndex][i];
          if (tItem.eleType === "pageSettings") continue;
          let tItemContentWidth: any = "";
          if (
            tItem.eleType === "column" ||
            (tItem.leftKey &&
              (tItem.leftKey.widthValue || tItem.leftKey.widthValue == "0") &&
              tItem.rightValue &&
              (tItem.rightValue.widthValue ||
                tItem.rightValue.widthValue == "0"))
          ) {
            tItemContentWidth =
              tItem.leftKey.widthValue + tItem.rightValue.widthValue;
          } else if (_widthValueEleType.includes(tItem.eleType)) {
            tItemContentWidth = tItem.widthValue;
          }
          const diffTop = tItem.top - ele.top - ele.heightValue;
          if (
            !(
              tItem.left + tItemContentWidth <= eleMinWidth ||
              tItem.left >= eleMaxWidth
            ) ||
            diffTop >= 0
          ) {
            // 如果 元素和 下面的元素在 X轴有交集 或 所以在它下放的元素,即使没有X轴交集
            if (newPageNum) {
              // 如果元素会自己分页. 最后一个页的占用的高度加上两个元素 高度差
              tItem.top = lastPageHeight + diffTop;
            } else {
              // 元素自己不分页
              tItem.top = diffTop + eleBottomToTop;
              if (tItem.top > eleInfo.PageHeightPx) {
                tItem.top = tItem.top - eleInfo.PageHeightPx;
                passivity_eleSiblingIndex.push(i);
                passivity_newPageNum = 1;
              }
            }
            console.log(diffTop, tItem.top);
            eleSiblingIndex.push(i);
          }
        }
        // 如果元素自己分页,则需要将当前也下面的元素移除掉
        if (eleSiblingIndex.length && newPageNum) {
          for (let i = 0; i < eleSiblingIndex.length; i++) {
            const [s] = vm.draftAttributesJsonSet[aIndex][pIndex].splice(
              eleSiblingIndex[i] - i,
              1
            );
            eleSibling.push(s);
          }
        } else if (passivity_eleSiblingIndex.length && passivity_newPageNum) {
          for (let i = 0; i < passivity_eleSiblingIndex.length; i++) {
            const [s] = vm.draftAttributesJsonSet[aIndex][pIndex].splice(
              passivity_eleSiblingIndex[i] - i,
              1
            );
            passivity_eleSibling.push(s);
          }
        }
      }
      const tempPage: any = [];
      for (let i = 0; i < newPageNum; i++) {
        tempPage.push([]);
      }
      if (newPageNum) {
        // 元素自己会分页情况
        if (eleSibling.length) {
          // 需要移动的元素
          tempPage[tempPage.length - 1] = [...eleSibling];
        }
        vm.draftAttributesJsonSet[aIndex].splice(pIndex + 1, 0, ...tempPage);
      } else {
        // 元素自己不分页的情况
        if (passivity_newPageNum && passivity_eleSiblingIndex.length) {
          for (let i = 0; i < passivity_newPageNum; i++) {
            tempPage.push([]);
          }
          tempPage[tempPage.length - 1] = [...passivity_eleSibling];
          vm.draftAttributesJsonSet[aIndex].splice(pIndex + 1, 0, ...tempPage);
        }
      }
    }
    console.log(
      "PcFormDetail -> printPageAlgorithm -> this.draftAttributesJson",
      vm.draftAttributesJsonSet
    );
    if (vm.tempPrintEleNumber === vm.collectorTempPrintContainer._num) {
      vm.tempPrintEleArray = [];
      vm.tempPrintEleNumber = 0;
      delete vm.collectorTempPrintContainer._num;
      vm.$nextTick(() => {
        this._startPrintHtml(vm);
      });
    }
  },
  _startPrintHtml(vm: any) {
    vm.isPrintGenerateHtml = true;
    setTimeout(async () => {
      // 延迟等待数据渲染成功，拿到html文件
      await this.waitPrintRender(vm);
    }, 2000);
  },
  async waitPrintRender(vm: any) {
    const printRenderer = vm.$refs.printRenderer as any;
    if (printRenderer) {
      // isEdage  针对兼容Edage浏览器  Edge浏览器不识别onload 故不会执行调起
      const isEdage: boolean =
        window.navigator.userAgent.indexOf("Edge") !== -1;
      if (
        isEdage ||
        !!(window as any).ActiveXObject ||
        "ActiveXObject" in window
      ) {
        // const iframe: any = document.getElementById("pdfFrame");
        // this.$nextTick(() => {
        //   this.srcdoc = printRenderer.getHtml();
        //   console.log(this.srcdoc);
        //   iframe.contentWindow.document.body.innerHTML = this.srcdoc;
        //   iframe.contentWindow.print();
        // });
        const newWindow: any = window.open();
        newWindow.document.write(printRenderer.getHtml());
        newWindow.document.close();
        newWindow.focus();
        newWindow.print();
        newWindow.close();
        vm.printHtmlCloseLoading();
      } else {
        const isTrident: boolean =
          window.navigator.userAgent.indexOf("Trident") !== -1;
        setTimeout(async () => {
          vm.$nextTick(() => {
            vm.srcdoc = printRenderer.getHtml();
            console.log("print html:", vm.srcdoc);
            const iframe: any = document.getElementById("pdfFrame");
            vm.isPrintGenerateHtml = false;
            iframe.onload = () => {
              vm.printHtmlCloseLoading();
              setTimeout(() => {
                if (!vm.srcdoc) return;
                if (isTrident) {
                  iframe.contentWindow.document.execCommand(
                    "print",
                    false,
                    null
                  );
                } else {
                  iframe.contentWindow.print();
                }
                vm.srcdoc = "";
              }, 300);
            };
            if (isTrident) {
              iframe.onload();
            }
          });
        }, 1800);
      }
    } else {
      setTimeout(() => {
        this.waitPrintRender(vm.printHtmlCloseLoading());
      }, 500);
    }
  },
  findFormControls(formControlMap: any, keys?: string[]) {
    return Object.keys(formControlMap)
      .filter((k) => {
        if (keys) {
          return keys.indexOf(k) > -1;
        }
        return true;
      })
      .map((k) => formControlMap[k]);
  },
  /*
   * 根据控件设置的显示条件是否满足决定是否打印该控件
   */
  checkVisible(ele, publishedJSONObj, formDataVal) {
    const isVisible = true;
    let tplEle: any = null;
    if (ele.eleType === "column" && ele.rightValue && ele.rightValue.code) {
      const code = ele.rightValue.code.split("#_#")[0];
      tplEle = recursionSearch(publishedJSONObj, code);
    } else if (ele.eleType === "sheet") {
      tplEle = recursionSearch(publishedJSONObj, ele.code);
    }
    if (tplEle && tplEle.options) {
      const displayFormula = tplEle.options.displayFormula;
      if (displayFormula) {
        if (displayFormula.indexOf("&&") > -1) {
          // 多个And条件解析 判断isShow
          const andArr: any[] = displayFormula.split("&&");
          return andArr.every((item) => {
            return this.checkCondition(item, publishedJSONObj, formDataVal);
          });
        } else if (displayFormula.indexOf("||") > -1) {
          // 多个Or条件解析 判断isVisible
          const orArr: any[] = displayFormula.split("||");
          return orArr.some((item) => {
            return this.checkCondition(item, publishedJSONObj, formDataVal);
          });
        } else {
          // 只有一个条件解析 判断isVisible
          return this.checkCondition(
            displayFormula,
            publishedJSONObj,
            formDataVal
          );
        }
      } else {
        return isVisible;
      }
    }
    return isVisible;
  },

  checkCondition(tplStr: string, publishedJSONObj: any, formDataVal: any) {
    const isCheck = true;
    const factors = tplStr.split(" ");
    if (Array.isArray(factors) && factors.length > 1) {
      const propertyCode = factors[0].substring(1, factors[0].length - 1);
      const propertyVal = recursionSearch(formDataVal, propertyCode);
      const operator = factors[1];
      let val: any = null;
      if (factors.length > 2) {
        val = factors[2];
      }
      const condElement = recursionSearch(publishedJSONObj, propertyCode);
      if (condElement) {
        // 将控件类型映射到非系统数据项类型, 根据factor[1]与操作比较
        const type = ControlHelper.mapToDataItemType(condElement.type);
        let op: any = null;
        switch (type) {
          case schema.DataItemType.Number:
          case schema.DataItemType.Date:
            op = numberDataItemOperators.find((item) => {
              return item.label === operator;
            });
            if (op) {
              switch (op.value) {
                case DateItemOperatorType.IsNull:
                  return propertyVal == null;
                case DateItemOperatorType.IsNotNull:
                  return propertyVal != null;
                case DateItemOperatorType.Equal:
                  return propertyVal == val;
                case DateItemOperatorType.NotEqual:
                  return propertyVal != val;
                case DateItemOperatorType.GreaterThan:
                  return propertyVal > val;
                case DateItemOperatorType.GreaterThanOrEqual:
                  return propertyVal >= val;
                case DateItemOperatorType.LessThan:
                  return propertyVal < val;
                case DateItemOperatorType.LessThanOrEqual:
                  return propertyVal <= val;
                default:
                  return false;
              }
            } else {
              return false;
            }

          case schema.DataItemType.Logic:
            op = logicDataItemOperators.find((item) => {
              return item.label === operator;
            });
            if (op) {
              switch (op.value) {
                case DateItemOperatorType.Equal:
                  return propertyVal == val;
                default:
                  return false;
              }
            } else {
              return false;
            }

          case schema.DataItemType.ShortText:
          case schema.DataItemType.LongText:
            if (condElement.type === schema.FormControlType.SequenceStatus) {
              op = sequenceStatusOperators.find((item) => {
                return item.label === operator;
              });
              if (op) {
                switch (op.value) {
                  case DateItemOperatorType.IsNull:
                    return propertyVal == null;
                  case DateItemOperatorType.IsNotNull:
                    return propertyCode != null;
                  case DateItemOperatorType.Equal:
                    return propertyVal == val;
                  case DateItemOperatorType.NotEqual:
                    return propertyVal != val;
                  default:
                    return false;
                }
              } else {
                return false;
              }
            } else {
              op = textDataItemOperators.find((item) => {
                return item.label === operator;
              });
              if (op) {
                switch (op.value) {
                  case DateItemOperatorType.IsNull:
                    return propertyVal == null;
                  case DateItemOperatorType.IsNotNull:
                    return propertyCode != null;
                  case DateItemOperatorType.Equal:
                    return propertyVal == val.substring(1, val.length - 1);
                  case DateItemOperatorType.NotEqual:
                    return propertyVal != val.substring(1, val.length - 1);
                  case DateItemOperatorType.Contains:
                    return propertyVal.indexOf(val) > -1;
                  case DateItemOperatorType.NotEqual:
                    return propertyVal.indexOf(val) === -1;
                  case DateItemOperatorType.In:
                    return val.indexOf(propertyVal) > -1;
                  case DateItemOperatorType.NotIn:
                    return val.indexOf(propertyVal) === -1;
                  default:
                    return false;
                }
              } else {
                return false;
              }
            }

          case schema.DataItemType.StaffSelector:
            op = staffDataItemOperators.find((item) => {
              return item.label === operator;
            });
            const valJSONObj = val ? JSON.parse(val) : null;
            if (op) {
              switch (op.value) {
                case DateItemOperatorType.IsNull:
                  return propertyVal == null;
                case DateItemOperatorType.IsNotNull:
                  return propertyVal != null;
                case DateItemOperatorType.Contains:
                case DateItemOperatorType.Have:
                  return propertyVal.every((item) => {
                    return (
                      valJSONObj.findIndex((x) => {
                        return x.parentId === item.id || x.id === item.id;
                      }) > -1
                    );
                  });
                case DateItemOperatorType.NotContains:
                case DateItemOperatorType.NotHave:
                  return propertyVal.every((item) => {
                    return (
                      valJSONObj.findIndex((x) => {
                        return x.parentId === item.id || x.id === item.id;
                      }) === -1
                    );
                  });

                case DateItemOperatorType.Of:
                case DateItemOperatorType.In:
                  return propertyVal.every((item) => {
                    return (
                      valJSONObj.findIndex((x) => {
                        return x.id === item.parentId || x.id === item.id;
                      }) > -1
                    );
                  });
                case DateItemOperatorType.NotOf:
                case DateItemOperatorType.NotIn:
                  return propertyVal.every((item) => {
                    return (
                      valJSONObj.findIndex((x) => {
                        return x.id === item.parentId || x.id === item.id;
                      }) === -1
                    );
                  });
                default:
                  return false;
              }
            } else {
              return false;
            }

          case schema.DataItemType.RelevanceForm:
            // todo
            return true;
        }
      }
    }
    return isCheck;
  },
};
