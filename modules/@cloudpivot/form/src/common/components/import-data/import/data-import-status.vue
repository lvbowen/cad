<template>
  <div class="data-import-status">
    <div class="data-import-status--success" v-if="getActive">
      <div class="data-importing__progress">
        <a-progress
          :percent="percent"
          strokeColor="#32B683"
          type="circle"
        ></a-progress>
        <div class="note">
          {{ $t("cloudpivot.list.pc.Importing") }}
        </div>
      </div>
      <div class="data-importing__tip">
        {{ $t("cloudpivot.list.pc.ImportTips4") }}
      </div>
    </div>
    <div class="data-import-status--success" v-if="isSuccess">
      <a-progress
        :percent="100"
        strokeColor="#32B683"
        type="circle"
      ></a-progress>
      <div class="success-text">
        {{ $t("cloudpivot.list.pc.ImportSuccess") }}
      </div>
      <template
        v-if="
          getSheetImportCount.select ||
            getSheetImportCount.radio ||
            getSheetImportCount.checkbox
        "
      >
        <div class="success-text-tip">
          <span>{{ $t("cloudpivot.list.pc.tips") }}</span>
          <span v-if="getSheetImportCount.select">{{
            $t("cloudpivot.list.pc.selectDataTips", {
              num: getSheetImportCount.select,
            })
          }}</span>
          <span
            v-if="getSheetImportCount.select && getSheetImportCount.radio"
          >、</span
          >
          <span v-if="getSheetImportCount.radio">{{
            $t("cloudpivot.list.pc.radioDataTips", {
              num: getSheetImportCount.radio,
            })
          }}</span>
          <span
            v-if="
              (getSheetImportCount.select && getSheetImportCount.checkbox) ||
                (getSheetImportCount.radio && getSheetImportCount.checkbox)
            "
          >、</span
          >
          <span v-if="getSheetImportCount.checkbox">{{
            $t("cloudpivot.list.pc.checkboxDataTips", {
              num: getSheetImportCount.checkbox,
            })
          }}</span>
          <span>{{ $t("cloudpivot.list.pc.importDataTips") }}</span>
        </div>
        <a-button @click="handleClick" class="mt-20" size="small">{{
          $t("cloudpivot.list.pc.gotIt")
        }}
        </a-button>
      </template>
      <a-button
        @click="handleClick"
        class="mt-20"
        size="small"
        v-else>{{
          $t("cloudpivot.list.pc.complete")
        }}
      </a-button>
    </div>

    <div class="data-import-status--error" v-else-if="systemError">
      <a-progress type="circle" :percent="70" status="exception"></a-progress>
      <div class="error-tip">{{ $t("cloudpivot.list.pc.ImportTips5") }}</div>
    </div>

    <div class="data-import-status--halfsuccess" v-else-if="isHalfSuccess">
      <p class="data-import-status--halfsuccess__success">
        <i class="icon aufontAll h-icon-all-check-circle"/>
        <span>{{
          $t("cloudpivot.list.pc.ImportTips6", {num: successNum})
        }}</span>
      </p>
      <p class="data-import-status--halfsuccess__error">
        <i class="icon aufontAll h-icon-all-close-circle"/>
        <span>{{
          $t("cloudpivot.list.pc.ImportTips7", {num: failNum})
        }}</span>
      </p>
      <p class="data-import-status--halfsuccess__tip">
        {{ $t("cloudpivot.list.pc.ImportTips8") }}
        <a href="javascript:" @click="exportErrorTem">{{
          $t("cloudpivot.list.pc.DownloadFailedList")
        }}</a>
      </p>
    </div>

    <div class="data-import-status--detail" v-else-if="showFailMessage">
      <p>
        <i class="icon aufontAll h-icon-all-close-circle"/>
        <span>{{ $t("cloudpivot.list.pc.ImportFailed") }}</span>
      </p>

      <p class="data-import-status--detail__message" v-if="isUnspecified">
        {{ $t("cloudpivot.form.renderer.tip.importErrorRelation") }}
      </p>

      <p class="data-import-status--detail__message" v-else-if="isTemplateEmpty">
        {{ $t("cloudpivot.form.renderer.tip.importErrorEmpty") }}
      </p>

      <p class="data-import-status--detail__message" v-else-if="!matchError">
        {{ $t("cloudpivot.list.pc.ImportTips9", {size: importSize}) }}
      </p>

      <p class="data-import-status--detail__message" v-else>
        {{ $t("cloudpivot.form.renderer.tip.importError") }}
        <!-- {{ $t('cloudpivot.list.pc.ImportTips10') }}
        <a href="javascript:;" @click="exportTemplate">{{ $t('cloudpivot.list.pc.SampleFile') }}</a>
        {{ $t('cloudpivot.list.pc.Recheck') }} -->
      </p>
    </div>

  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";
import { Button, Progress } from "@h3/antd-vue";
import { formApi, listApi as Application, listParams } from "@cloudpivot/api";

@Component({
  name: "data-import-status",
  components: {
    AProgress: Progress,
    AButton: Button,
  },
})
export default class DataImportStatus extends Vue {
  @Prop({
    type: Number,
  })
  percent!: number;

  @Prop({
    type: Number,
    default: 0,
  })
  successNum!: number;

  @Prop({
    type: Number,
    default: 0,
  })
  failNum!: number;

  @Prop({
    type: Number,
    default: 0,
  })
  status!: listParams.ImportResult;

  @Prop({
    type: String,
  }) fileName!: string;

  @Prop({
    type: String,
  }) schemaCode!: string;

  @Prop() sheetParams!: any;

  @Prop() errorFile!: string;

  @Prop({
    type: Number,
    default: 0,
  })
  importSize!: number;

  @Prop({
    type: Object,
    default: {},
  })
  getSheetImportCount!: object;

  get isHalfSuccess() {
    return this.status === listParams.ImportResult.PartialSuccess;
  }

  get showFailMessage() {
    return (
        this.status === listParams.ImportResult.DataNumExceed ||
        this.status === listParams.ImportResult.DataColumnError ||
        this.isUnspecified ||
        this.isTemplateEmpty
    );
  }

  get getActive() {
    // debugger;
    return this.status === listParams.ImportResult.None;
  }

  get matchError() {
    return this.status === listParams.ImportResult.DataColumnError;
  }

  get systemError() {
    return this.status === listParams.ImportResult.SystemError;
  }

  get isSuccess() {
    return this.status === listParams.ImportResult.Success;
  }

  get isTemplateEmpty() {
    return this.status === listParams.ImportResult.TemplateEmpty;
  }

  get isUnspecified() {
    return this.status === listParams.ImportResult.Unspecified;
  }


  exportErrorTem() {
    if (!this.errorFile) {
      return;
    }
    this.exportErrorResult(this.errorFile, "错误提示template.xlsx");
  }

  /**
   * 下载模板
   */
  exportTemplate() {
    formApi.exportTemplate(this.sheetParams).then((res: any) => {
      if (res.errcode === 0) {
        this.exportErrorResult(res.data);
      }
    });
  }

  async exportErrorResult(file: string, customName?: string) {
    // debugger
    const res = await Application.exportErrorResult(file);
    if ((res.errcode && res.errcode !== 0) || res.byteLength < 100) {
      this.$message.error(
          this.$t("cloudpivot.list.pc.DownloadFailed") as string
      );
    } else {
      const blob = new Blob([ res ], { type: "application/vnd.ms-excel" });
      const stamp = new Date().getMilliseconds();
      let fileName = "";
      if (customName) {
        fileName = customName;
      } else {
        fileName = "template.xlsx";
      }

      this.downloadFile(blob, fileName);
    }
  }

  downloadFile(blob: any, fileName: string) {
    //@ts-ignore
    if (window.navigator.msSaveOrOpenBlob) {
      navigator.msSaveBlob(blob, fileName);
    } else {
      const a = document.createElement("a");
      const url = URL.createObjectURL(blob);
      a.download = fileName;
      a.href = url;
      a.click();
      URL.revokeObjectURL(url);
    }
  }

  handleClick() {
    this.$emit("cancel");
  }
}
</script>
<style lang='less' scoped>
.mt-20 {
  margin-top: 10px;
  margin-bottom: 20px;
}

.data-import-status {
  height: 242px;
  text-align: center;

  .data-import-status--success
  /deep/
  .ant-progress-circle
  .ant-progress-text
  .anticon {
    font-size: 32px;
  }

  .data-import-status--success,
  .data-import-status--error {
    padding-top: 12px;

    div.error-tip {
      margin-top: 16px;
      line-height: @line-height-7;
      font-size: @font-size-16;
      color: rgba(0, 0, 0, 0.85);
    }

    .success-text {
      font-family: PingFangSC-Regular, PingFang SC;
      font-weight: 400;
      color: rgba(0, 0, 0, 0.85);
      margin-top: 10px;
    }

    .success-text-tip {
      font-family: PingFangSC-Regular, PingFang SC;
      font-weight: 400;
      color: rgba(0, 0, 0, 0.65);
      margin-top: 10px;
    }
  }

  .data-import-status--halfsuccess {
    text-align: left;

    p {
      line-height: @line-height-11;

      span {
        margin-left: 16px;
        font-size: @font-size-16;
        color: rgba(0, 0, 0, 0.85);
      }

      &.data-import-status--halfsuccess__tip {
        margin-top: 8px;
        padding-left: 32px;
        font-size: @font-size-14;
        color: rgba(0, 0, 0, 0.45);

        a {
          margin-left: 10px;
          color: @primary-color;

        }
      }

      &.data-import-status--halfsuccess__success {
        i {
          color: @success-color;
        }
      }

      &.data-import-status--halfsuccess__error {
        margin-top: 24px;

        i {
          color: @error-color;
        }
      }
    }
  }

  .data-import-status--detail {
    text-align: left;

    p {
      i {
        color: @error-color;
      }

      span {
        margin-left: 16px;
        font-size: @font-size-16;
        color: rgba(0, 0, 0, 0.85);
      }

      &.data-import-status--detail__message {
        margin-top: 24px;
        margin-left: 32px;
        font-size: @font-size-16;
        color: rgba(0, 0, 0, 0.85);

        a {
          color: @primary-color;
        }
      }
    }
  }

}
</style>
