<template>
  <div
    :class="[prefixCls, { 'h3-report-long-text-edit': isEdit }]"
  >
    <div v-if="isEdit">
      <div>
        <span style="margin-left: 0.5vw;color: #FFFFFF;background-color: darkred">组件标题</span>
        <a-input
          placeholder="Basic usage"
          size="small"
          style="width: 8vw;margin-left: 0.5vw"
          :defaultValue="titleValue"
          @change="titleChange"/>
        <span style="margin-left: 0.5vw;color: #FFFFFF;background-color: darkred">标题字号</span>
        <a-select
          size="small"
          placeholder="字号选择"
          :defaultValue="fontSize"
          style="width: 3.5vw;margin-left: 0.5vw"
          @change="fontSizeChange"
        >
          <a-select-option v-for="(v,i) in fontSizeOptions" :key="v.key">
            {{ v.name }}
          </a-select-option>
        </a-select>
      </div>
      <div style="margin-top: 5px">
        <span style="margin-left: 0.5vw;color: #FFFFFF;background-color: darkred">iframe路径</span>
        <a-input
          placeholder="iframe路径"
          size="small"
          style="width: 8vw;margin-left: 0.5vw"
          :defaultValue="srcValue"
          @change="srcChange"/>
      </div>
    </div>
    <div class="ql-editor" v-else>
      <div class="ql-container">
        <span :style="{'color': color,'height':'5%','fontSize':fontSize}" v-if="isTitle">{{ titleValue }}</span>
        <div :style="isTitle?'height: 92%':'height: 100%'">
          <iframe id="iframe" style="height: 100%;width: 100%" :src="srcValue"/>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import {Component, Prop, Vue, Watch, Inject} from "vue-property-decorator";
import {Quill, quillEditor} from "vue-quill-editor";
import "quill/dist/quill.core.css";
import "quill/dist/quill.snow.css";

@Component({
  name: "h3-report-iframe-wrap",
  components: {
    quillEditor,
  },
})
export default class IframeWrap extends Vue {
  @Prop() chart!: H3.Report.IframePlay;
  @Prop() global!: H3.Report.Global;
  @Prop({default: "design"}) status!: "design" | "report" | "preview";
  @Inject({
    default: () => {
    }
  }) focus?: Function;
  @Inject({
    default: () => {
    }
  }) blur?: Function;

  isEdit: boolean = false;
  prefixCls: string = "h3-report-long-text-wrap";
  content: string = "";
  maxLength: number = 500;
  editorOption: any = {
    modules: {
      toolbar: [
        [{size: ["small", false, "large", "huge"]}],
        [{color: []}, "link"],
        ["bold", "italic", "underline"],
        [{align: ""}, {align: "center"}, {align: "right"}],
      ],
    },
    placeholder: "在此插入文本",
  };
  composing: boolean = false; // 是否处在合成输入阶段
  fileOptions: Array<any> = [];
  videoAll: string = '';
  defaultVideo: Array<string> = [];
  videoShow: string = '';
  videoNum: number = 0;//给图片组计数

  titleValue: string = '';
  srcValue: string = '';
  fontSizeOptions: Array<any> = [{name: '小号', key: '0.8em'}, {name: '正常', key: '1em'}, {
    name: '大号',
    key: '1.5em'
  }, {name: '巨号', key: '2.5em'},];
  fontSize: string = '1em';
  isTitle: boolean = true;
  color: string = '';

  @Watch("chart.edit", {immediate: true})
  watchEdit(v) {
    if (this.status !== "design") return;
    this.isEdit = v;
    this.$nextTick(() => {
      if (this.isEdit && this.$refs.quillEditor) {
        const qlEditor = this.$el.querySelector(".ql-editor") as HTMLDivElement;
        qlEditor.focus();
      }
    });
  }

  @Watch("global.styles.fontSetting.titleColor", {immediate: true})
  watchfontSetting(v) {
    this.color = v;
  }

  /**
   * 组件背景颜色设置
   */
  // get getStyles() {
  // const globalCoat = this.global.styles.elementCoat
  //     ? this.global.styles.elementCoat
  //     : null;
  //
  // return {color: this.global.styles.fontSetting.fontColor};
  // }

  created() {
    this.content = (this.chart as any).content;
    this.$emit("register-refresh", {
      data: () => {
      },
      view: () => {
      },
    });
  }

  onEditorFocus() {
    if (this.focus) {
      this.focus(this.chart);
    }
  }

  onEditorKeyDown(e) {
    const {quill} = this.$refs.quillEditor as any;
    const length = quill.getLength();
    if (
        e.key !== "Backspace" &&
        e.key !== "Delete" &&
        length > this.maxLength
    ) {
      e.cancelBubble = true;
      e.returnValue = false;
    }
  }

  onEditorPaste() {
    setTimeout(() => {
      this.maxLengthLimit();
    }, 0);
  }

  onEditorChange(v: any) {
    let tempt = ''
    v.forEach((item, i) => {
      tempt = i == 0 ? item : tempt + '@' + item;
    })
    this.$set(this.chart, "content", tempt);
  }

  fontSizeChange(v: string) {
    this.fontSize = v;
    let tempt = this.titleValue + '@' + this.fontSize;
    this.$set(this.chart, "title", tempt);
  }

  titleChange(v: any) {
    this.isTitle = true;
    this.titleValue = v.target.value;
    let tempt = v.target.value + '@' + this.fontSize;
    this.$set(this.chart, "title", tempt);
  }

  srcChange(e: any) {
    this.srcValue = e.target.value;
    this.$set(this.chart, "content", this.srcValue);
  }

  maxLengthLimit() {
    const {quill} = this.$refs.quillEditor as any;
    const length = quill.getLength();
    if (length > this.maxLength) {
      quill.deleteText(this.maxLength, length - this.maxLength);
      // const delta = quill.getContents(0, this.maxLength);
      // quill.setContents(delta);
    }
  }

  onEditorComposeStart(e) {
    this.composing = true;
  }

  onEditorInput(e) {
    if (this.composing) {
      this.maxLengthLimit();
    }
  }

  onEditorComposeEnd(e) {
    this.composing = false;
  }

  addEditEvent() {
    const qlEditor = this.$el.querySelector(".ql-editor");
    if (qlEditor) {
      qlEditor.addEventListener("focus", this.onEditorFocus, false);
      qlEditor.addEventListener("keydown", this.onEditorKeyDown, false);
      qlEditor.addEventListener("paste", this.onEditorPaste, false);
      qlEditor.addEventListener(
          "compositionstart",
          this.onEditorComposeStart,
          false
      );
      qlEditor.addEventListener("input", this.onEditorInput, false);
      qlEditor.addEventListener(
          "compositionend",
          this.onEditorComposeEnd,
          false
      );
    }
  }

  updated() {
    // this.setDefault();
    // this.getAllFile();
    this.addEditEvent();
  }

  mounted() {
    this.addEditEvent();
    this.setDefault();
  }

  setDefault() {
    console.log('this.chart', this.chart)
    // const project: any = (this.$route.query?.projectName ?? window.Environment?.markName) ?? '';
    this.srcValue = this.chart.content;
    //处理title
    if (this.chart.title === '未命名的文本' || this.chart.title.split("@")[0] === '') return this.isTitle = false;
    const titleTempt: Array<string> = this.chart.title.split("@");
    this.titleValue = titleTempt[0];
    this.fontSize = titleTempt[1];
    this.color = this.global.styles.fontSetting.titleColor ?? "";
  }
}
</script>

<style lang="less">
.vue-grid-item.longText {
  overflow: visible;
}

.h3-report-long-text-wrap {
  height: 100%;

  .editor {
    height: 100%;
    display: flex;
    flex-direction: column;
  }

  .ql-editor {
    -webkit-user-select: text;
  }
}

.h3-report-long-text-edit {
  position: relative;
  z-index: 2;
}

.ant-carousel .slick-slider {
  height: 100%;
  width: 100%;

  .slick-list {
    height: 100%;
    width: 100%;

    .slick-track {
      height: 100%;
    }

    .slick-slide {
      height: 100%;
    }
  }
}

.ant-carousel .slick-initialized .slick-slide {
  height: 100%;
}
</style>
