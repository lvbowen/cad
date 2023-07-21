<template>
  <div
    ref="generateHtmlRef"
    style="position: absolute; top: 0;left: 0;z-index:-99;visibility:hidden"
  >
    <section class="content padding-20mm" v-for="(drawerElements,index) in pages" :key="index">
      <div class="header" :class="headerFooter.header.align"></div>
      <div
        style="position: absolute;"
        :style="{marginLeft:(pageSettings._pagemargin.LeftTomm+3)+'mm',marginRight:(pageSettings._pagemargin.RightTomm)+'mm', marginTop:(pageSettings._pagemargin.UpTomm)+'mm', marginBottom:(pageSettings._pagemargin.DownTomm)+'mm'}"
      >
        <div
          style="position: absolute;"
          v-for="(item, i) in drawerElements"
          :key="item.id"
          :style="`
            left: ${pxToMM(item.left)}mm;
            top: ${pxToMM(item.top)}mm;
            display: inline-flex;
            position: absolute;
            min-height: ${pxToMM(item.heightValue)}mm;
          `"
        >
          <!--type === 'column' -->
          <table
            v-if="item.eleType.includes('column')"
            :style="`border-spacing: 0; padding: 0; max-width: 100%; overflow: hidden;height: ${pxToMM(item.heightValue)}mm;`"
            style="page-break-after:always"
            width="100%"
            border="0"
            cellpadding="0"
            cellspacing="0"
          >
            <tr :style="` min-height: ${pxToMM(item.heightValue)}mm;`">
              <td
                :style="`
                  border: ${item.leftKey.borderWidthValue}px ${item.leftKey.borderTypeValue} ${item.leftKey.borderColorValue};
                  background: ${item.leftKey.fillColorValue};
                  font-size: ${item.leftKey.fontSizeValue}pt;
                  color: ${item.leftKey.fontColorValue};
                  font-weight: ${item.leftKey.fontIsWeight ? 'bold' : ''};
                  font-style: ${item.leftKey.fontIsItalic ? 'italic' : ''};
                  text-decoration: ${item.leftKey.fontIsUnderline ? 'underline' : ''};
                  text-align: ${item.leftKey.fontLCRNeat};
                  vertical-align: ${item.leftKey.fontTCBNeat};
                  word-break: break-all;
                  word-wrap: break-word;
                `"
              >
                <!-- 解决换行没对齐问题 td中加div,把td中的width移至div中 -->
                <div
                  :style="` width: ${pxToMM(item.leftKey.widthValue)}mm; `"
                >{{ item.leftKey.innerTxt }}</div>
              </td>
              <td
                :style="`
                  border: ${item.rightValue.borderWidthValue}px ${item.rightValue.borderTypeValue} ${item.rightValue.borderColorValue};
                  background: ${item.rightValue.fillColorValue};
                  font-size: ${item.rightValue.fontSizeValue}pt;
                  color: ${item.rightValue.fontColorValue};
                  font-weight: ${item.rightValue.fontIsWeight ? 'bold' : ''};
                  font-style: ${item.rightValue.fontIsItalic ? 'italic' : ''};
                  text-decoration: ${item.rightValue.fontIsUnderline ? 'underline' : ''};
                  text-align: ${item.rightValue.fontLCRNeat};
                  vertical-align: ${item.rightValue.fontTCBNeat};
                  word-break: break-all;
                  word-wrap: break-word;
                `"
              >
                <div :style="`width: ${pxToMM(item.rightValue.widthValue)}mm;`">
                  <img
                    v-if="(item.ctrlType===10 || item.ctrlType===15)&&item.picUrl"
                    :style="`height: ${pxToMM(item.heightValue)}mm; width: ${pxToMM(item.rightValue.widthValue)}mm;`"
                    :src="item.picUrl"
                    alt
                  />
                  <template
                    v-else-if="item.rightValue.renderType&&item.rightValue.renderType==='editor'"
                  >
                    <div v-html="item.rightValue.innerTxt"></div>
                  </template>
                  <template v-else>{{ item.rightValue.innerTxt }}</template>
                </div>
              </td>
            </tr>
          </table>

          <!--type === 'text' -->
          <table
            v-if="item.eleType.includes('text')"
            :style="`border-spacing: 0; padding: 0; max-width: 100%; overflow: hidden;height: ${pxToMM(item.heightValue)}mm;`"
            style="page-break-after:always"
            width="100%"
            border="0"
            cellpadding="0"
            cellspacing="0"
          >
            <tr>
              <td
                :style="`
                border: ${item.borderWidthValue}px ${item.borderTypeValue} ${item.borderColorValue};
                min-height: ${pxToMM(item.heightValue)}mm;
                background: ${item.fillColorValue};
                font-size: ${item.fontSizeValue}pt;
                color: ${item.fontColorValue};
                font-weight: ${item.fontIsWeight ? 'bold' : ''};
                font-style: ${item.fontIsItalic ? 'italic' : ''};
                text-decoration: ${item.fontIsUnderline ? 'underline' : ''};
                text-align: ${item.fontLCRNeat};
                vertical-align: ${item.fontTCBNeat};
                word-break: break-all;
                word-wrap: break-word;
                `"
              >
                <div :style="`width: ${pxToMM(item.widthValue)}mm;`">
                  <img
                    v-if="item.picUrl"
                    :style="`height: ${pxToMM(item.heightValue)}mm; width: ${pxToMM(item.widthValue)}mm;`"
                    :src="item.picUrl"
                    alt
                  />
                  <template v-else>{{ item.innerTxt }}</template>
                </div>
              </td>
            </tr>
          </table>

          <!--type === 'text' -->
          <div v-if="item.eleType.includes('leftQrcodePic')">
            <img
              :style="`height: ${pxToMM(item.heightValue)}mm; width: ${pxToMM(item.widthValue)}mm;`"
              :src="item.picUrl"
              alt
            />
          </div>
          <!--type === 'text' -->
          <div v-if="item.eleType.includes('leftBarcodePic')">
            <img
              :style="`height: ${pxToMM(item.heightValue)}mm; width: ${pxToMM(item.widthValue)}mm;`"
              :src="item.picUrl"
              alt
            />
          </div>
          <!--type === 'text' -->
          <div v-if="item.eleType.includes('topPic')">
            <img
              :style="`height: ${pxToMM(item.heightValue)}mm; width: ${pxToMM(item.widthValue)}mm;`"
              :src="item.picUrl"
              alt
            />
          </div>
          <!--type === 'text' -->
          <div v-if="item.eleType.includes('topDrawerRect')" :style="getRectStyleOf(item)"></div>
          <div
            v-if="item.eleType.includes('topDrawerLine')"
            :style="`height: ${pxToMM(item.heightValue)/1.1}mm;width: ${pxToMM(item.widthValue)}mm;background: ${item.borderColorValue};`"
          ></div>
          <table
            v-if="item.eleType === 'sheet'"
            cellspacing="0"
            cellpadding="0"
            :class="[ item.eleType ]"
            :style="`width: ${pxToMM(item.widthValue)}mm;padding: 0;
              background-color:${item.backgroundColor};
              `"
            style="page-break-after:always;"
            width="100%"
          >
            <!-- 表头每页打印 -->
            <template v-if="item.sheetHeaderPagingAttr === 'every'">
              <thead>
                <tr :style="`height:${pxToMM(item.headHeight)}mm`">
                  <td
                    v-for="(col,index) in item.columns"
                    :key="index"
                    :style="getColStyle(col,item)"
                  >{{ col.name }}</td>
                </tr>
              </thead>
            </template>
            <template v-else>
              <tr :style="`height:${pxToMM(item.headHeight)}mm`">
                <td
                  v-for="(col,index) in item.columns"
                  :key="index"
                  :style="getColStyle(col,item)"
                >{{ col.name }}</td>
              </tr>
            </template>

            <tr
              v-for="(row,index) in item.value"
              :key="index"
              :style="`min-height:${pxToMM(item.bodyHeight)}mm`"
            >
              <td
                v-for="(col,colIndex) in item.columns"
                :key="colIndex"
                :style="getRowStyle(col.rowSettings,item)"
                :class="{'picleft':col.name==='图片'}"
              >
                <template v-if="col.isSequence">{{ index + 1 }}</template>
                <template v-else-if="!col.rowSettings.bindSource">
                  <!--空白列-->
                  <span></span>
                </template>
                <template v-else-if="isString_row(row[col.rowSettings.bindSource.code])">
                  <span>{{ row[col.rowSettings.bindSource.code]===''?'&nbsp;': row[col.rowSettings.bindSource.code] }}</span>
                </template>
                <template v-else-if="isEditor_row(row[col.rowSettings.bindSource.code])">
                  <div v-html="row[col.rowSettings.bindSource.code]"></div>
                </template>
                <template v-else>
                  <span
                    v-for="(arrItem,arrItemIndex) of row[col.rowSettings.bindSource.code]"
                    :key="arrItemIndex"
                  >
                    <template v-if="isImg_row(arrItem.type)">
                      <img
                        :src="arrItem.url"
                        class="sheetImg"
                        :style="{width:`${(pxToMM(item.columns[colIndex].widthValue)-10)/2}mm`
                        }"
                      />
                    </template>
                    <label v-else-if="isAttachment_row(arrItem.type)">
                      {{ arrItem.name }}
                      <br />
                    </label>
                  </span>
                </template>
              </td>
            </tr>
          </table>
        </div>
      </div>
      <div class="footer" :class="headerFooter.footer.align"></div>
    </section>
  </div>
</template>
<script lang="ts">
import { Component, Vue, Prop } from "vue-property-decorator";
import common from "@cloudpivot/common";
import dateFormat from "@cloudpivot/common/src/utils/date";
import { renderer, schema } from "@cloudpivot/form";
const { getMmFromPx } = common.utils.BusinessFunctions;
@Component({
  name: "pre-view",
})
export default class GenerateHtml extends Vue {
  // @ts-ignore
  @Prop() pages: any[][];
  @Prop() formdata: any;
  @Prop({
    default: () => ({
      width: 210,
      height: 297,
      paddingX: 48,
      paddingY: 56,
    }),
  })
  setting!: {
    width: number;
    height: number;
    paddingX: number;
    paddingY: number;
  };
  pageSettings: any = {
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
  sheetImgs: any[] = [];
  sheetRows: Number = 0;
  isImg_row(type) {
    return (
      type === schema.FormControlType.Image ||
      type === schema.FormControlType.Signature
    );
  }
  isAttachment_row(type) {
    return type === schema.FormControlType.Attachment;
  }
  filterPage(arr) {}
  isString_row(value) {
    return (
      typeof value === "string" &&
      !value.includes("<p") &&
      !value.includes("<span") &&
      !value.includes("<img")
    );
  }

  isEditor_row(value) {
    return (
      typeof value === "string" &&
      (value.includes("<p") ||
        value.includes("<span") ||
        value.includes("<img"))
    );
  }
  pageStyle() {
    let width: string = 210 + `mm`;
    let height: string = 297 + `mm`;
    const that = this;
    console.log("this.pages", this.pages);
    this.pages.map((item: any, n: number) => {
      item.forEach((m: any, k: number) => {
        if (m.eleType === "pageSettings") {
          this.setting.width = m._papersize.widthTomm;
          this.setting.height = m._papersize.heightTomm - 16;
          this.setting.paddingX =
            m._pagemargin.LeftTomm + m._pagemargin.RightTomm;
          this.setting.paddingY = m._pagemargin.UpTomm + m._pagemargin.DownTomm;
          width = m._papersize.widthTomm + `mm`;
          height = m._papersize.heightTomm + `mm`;
          this.pageSettings = m;
          // 拼接背景图片url
          if (m.bgImg.uid !== "") {
            const file: renderer.H3File = {
              name: m.bgImg.name,
              refId: m.bgImg.uid,
              fileExtension: "",
              mimeType: "",
              storageMethod: "",
            };
            this.pageSettings.bgImg.url = renderer.UploadControl.service.getDownloadUrl(
              file
            );
          }
          m.isPrintBgImg === false
            ? (this.pageSettings.bgImg.url = "")
            : (this.pageSettings.bgImg.url = m.bgImg.url);
        }
        // 获取子表图片详细信息
        else if (m.eleType === "sheet") {
          const sheetKey: string = m.code;
          const sheetData: [] = this.formdata.bizObject.data[sheetKey];
          console.log(sheetKey, sheetData);
          // sheetData.map((data: any, d: number) => {
          //   for (let key in data) {

          //     // 只处理图片、附件类型的
          //     if (key.includes("Attachment")) {
          //       // 判断文件后缀名，非图片类型的只打印文件名称
          //       const fileType: string = ".jpg,.jpeg,.png,.gif";
          //       data[key].forEach((v: any, vIndex: number) => {
          //         if (v.name) {
          //           const checkType: string = v.name.substring(
          //             v.name.lastIndexOf(".")
          //           );
          //           if (fileType.indexOf(checkType) === -1) {
          //             v.url = "";
          //           }
          //         }
          //       });
          //       console.log('data[key] =>',data[key])
          //       m.value[d][key] = data[key];
          //     }
          //   }
          // });
        }
      });
    });
    return {
      width,
      height,
    };
  }
  get headerFooter() {
    return this.getHeaderFooter();
  }
  get formatPages() {
    console.log("this.pages----------", this.pages);
    let hasEmpty = false;
    let formatPage = this.pages.filter((item, index) => {
      if (
        Array.isArray(item) &&
        ((item.length === 0 && !hasEmpty) || item.length > 0)
      ) {
        if (item.length === 0) {
          hasEmpty = true;
        }
        return true;
      } else {
        return false;
      }
    });
    console.log("format.pages----------", formatPage);
    return formatPage;
  }
  getHeaderFooter() {
    this.pageStyle();
    const Dates = new Date();
    const headerFooter = {
      date: "",
      time: "",
      header: {},
      footer: {},
    };
    const ss = dateFormat.dateFormat(Dates, "YYYY-MM-DD HH:mm:ss");
    headerFooter.date = ss.split(" ")[0];
    headerFooter.time = ss.split(" ")[1];
    if (this.pageSettings !== null) {
      headerFooter.header = this.fillData(
        this.pageSettings._headerfooter.header
      );
      headerFooter.footer = this.fillData(
        this.pageSettings._headerfooter.footer
      );
    }
    return headerFooter;
  }
  fillData(data: any) {
    let temp = {
      align: "",
      marginTopTopx: 0,
      pagenum: false,
      total: false,
      date: false,
      time: false,
    };
    temp.marginTopTopx = data.marginTopTopx;
    temp.align = data.align;
    data.items.key.forEach((m: any) => {
      switch (m) {
        case "PageNum":
          temp.pagenum = true;
          break;
        case "Total":
          temp.total = true;
          break;
        case "Date":
          temp.date = true;
          break;
        case "Time":
          temp.time = true;
          break;
      }
    });
    return temp;
  }
  pxToMM(px: number) {
    return Math.floor((px / 72) * 2.54 * 1000000) / 100000;
    // return getMmFromPx(+px)
  }
  getHtml() {
    const tempHTML = this.$el.innerHTML;
    console.log("pages =>", JSON.stringify(this.pages));
    const htmlStr = `
        <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
        <html lang="en" xmlns="http://www.w3.org/1999/xhtml">
          <head>
            <meta charset="UTF-8"/>
            <meta name="viewport" content="initial-scale=1, maximum-scale=1, user-scalable=no, width=device-width"/>
            <title>云枢打印-自定义模板打印</title>
            <style type="text/css">
             @media print {
                body {
                    width: ${this.setting.width}mm;
                    height:${this.setting.height - 5}mm;
                    background-size: cover;
                    background-repeat: no-repeat;
                    background-image:url(${this.pageSettings.bgImg.url})
                 }
                .picleft{
                   text-align: left !important;
                   padding-left:5px;
                   padding-top:5px;
                   padding-bottom:5px;
                }
              }
              @media screen {
              body { background: #e0e0e0 }
              .content {
                  background: white;
                  box-shadow: 0 .5mm 2mm rgba(0,0,0,.3);
                  margin: 5mm auto;
                }
              }
                .picleft{
                   text-align: left !important;
                   padding-left:5px;
                   padding-top:5px;
                   padding-bottom:5px;
                }
                section{
                  width: ${this.setting.width}mm;
                  height:${this.setting.height}mm;
                  page-break-before: auto;
                  page-break-after: always;
                  background-size: cover;
                  background-repeat: no-repeat;
                  background-image:url(${
                    this.pageSettings.bgImg.url
                  }) !important;
                }
            </style>
          </head>
          <body class="A4" style="font-family: Microsoft YaHei">${tempHTML}</body>
        </html>
      `;
    return htmlStr;
  }
  getColStyle(col: any, item: any) {
    const style = this.buildStyleOf(col);
    this.handleCellStyle(item, col, style);
    return style;
  }
  getRowStyle(col: any, item: any) {
    const style = this.buildStyleOf(col.rowSettings || col);
    this.handleCellStyle(item, col, style);
    return style;
  }
  getRectStyleOf(item: any) {
    const style: any = {
      height: `${this.pxToMM(item.heightValue)}mm`,
      width: `${this.pxToMM(item.widthValue)}mm`,
      background: `${item.fillColorValue}`,
    };
    if (item.borders) {
      const bs = `${this.pxToMM(item.borderWidthValue)}mm solid ${
        item.borderColorValue
      }`;
      if (item.borders.left) {
        style["border-left"] = bs;
      }
      if (item.borders.top) {
        style["border-top"] = bs;
      }
      if (item.borders.bottom) {
        style["border-bottom"] = bs;
      }
      if (item.borders.right) {
        style["border-right"] = bs;
      }
    }
    return style;
  }
  handleCellStyle(item: any, col: any, style: any) {
    style.width = `${col.widthValue}px`;
    style.width = `${this.pxToMM(col.widthValue)}mm`;
    style.border = `${item.borderWidth}px solid ${item.borderColor}`;
    return style;
  }
  buildStyleOf(settings: any) {
    const style: any = {
      "font-size": `${settings.fontSize}pt`,
      "text-align": settings.horizontalAlign,
      "vertical-align": settings.verticalAlign,
      "word-break": "break-all",
      "word-wrap": "break-word",
      // height
    };
    if (settings.fontItalic) {
      style["font-style"] = "italic";
    }
    if (settings.fontBold) {
      style["font-weight"] = "bold";
    }
    if (settings.fontUnderline) {
      style["text-decoration"] = "underline";
    }
    if (settings.fontColor) {
      style["color"] = settings.fontColor;
    }
    if (settings.backgroundColor) {
      style["background-color"] = settings.backgroundColor;
    }
    return style;
  }
  created() {}
  mounted() {
    this.$nextTick(() => {
      console.log(234324);
      console.log("generateHtmlRef =>", this.$refs["generateHtmlRef"]);
    });
  }
  // /** 因为打印模板采用的是绝对定位， 有可能子表数据多的时候超过了其设置的top位置， 会导致数据覆盖
  //  * 这里会做一些调整，遍历item in formatPages,当遇到子表时， 当前子表的real = top值+bodyHeight*子表的length与下个item的top值做比较
  //  * 如果real <= item[index + 1].top 不调整， 反之 item[index + 1].top = item[index].top + real + 20
  //  *  */ i;
  // adjustedTop(index, i) {
  //   let currentPage: any = this.formatPages[index];
  //   let addedTop = 0;
  //   currentPage.forEach((item, x) => {
  //     if (x < i) {
  //       if (item.eleType === "sheet") {
  //         if (x !== currentPage.length - 1) {
  //           let next = currentPage[x + 1];
  //           let assign = next.top - item.top;
  //           let real = item.bodyHeight * item.value.length + item.headHeight;
  //           if (real > assign) {
  //             addedTop += real - assign + 20;
  //           }
  //         }
  //       }
  //     }
  //   });
  //   console.log("当前top值：", currentPage[i].top + addedTop, currentPage);
  //   return currentPage[i].top + addedTop;
  // }
}
</script>
