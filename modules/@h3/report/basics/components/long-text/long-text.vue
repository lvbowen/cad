<template>
  <div :class="[prefixCls, { 'h3-report-long-text-edit': isEdit }]" >
    <quill-editor
      ref="quillEditor"
      class="editor"
      v-if="isEdit"
      v-model="content"
      :options="editorOption"
      @change="onEditorChange($event)"
    >
    </quill-editor>
    <div class="ql-editor" v-else>
      <div class="ql-container" v-html="content"></div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch, Inject } from "vue-property-decorator";
import { Mutation, Action, State, namespace } from "vuex-class";
import { Quill, quillEditor } from "vue-quill-editor";
import "quill/dist/quill.core.css";
import "quill/dist/quill.snow.css";

@Component({
  name: "h3-report-long-text-wrap",
  components: {
    quillEditor
  }
})
export default class LongTextWrap extends Vue {
  @Prop() chart!: H3.Report.LongText;
  @Prop() global!: H3.Report.Global;
  @Prop({ default: "design" }) status!: "design" | "report" | "preview";
  @Inject({ default: () => {} }) focus?: Function;
  @Inject({ default: () => {} }) blur?: Function;
  isEdit: boolean = false;
  prefixCls: string = "h3-report-long-text-wrap";
  content: string = "";
  maxLength: number = 500;
  editorOption: any = {
    modules: {
      toolbar: [
        [{ size: ["small", false, "large", "huge"] }],
        [{ color: [] }, "link"],
        ["bold", "italic", "underline"],
        [{ align: "" }, { align: "center" }, { align: "right" }]
      ]
    },
    placeholder: "在此插入文本"
  };
  composing: boolean = false; // 是否处在合成输入阶段

  @Watch("chart.edit", { immediate: true })
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

  /**
   * 组件背景颜色设置
   */
  // get getStyles() {
    // const globalCoat = this.global.styles.elementCoat
    //     ? this.global.styles.elementCoat
    //     : null;
    //
    // return { color: this.global.styles.fontSetting.fontColor };
  // }

  created() {
    this.content = (this.chart as any).content;
    this.$emit("register-refresh", {
      data: () => {},
      view: () => {}
    });
  }

  onEditorFocus() {
    if (this.focus) {
      this.focus(this.chart);
    }
  }
  onEditorKeyDown(e) {
    const { quill } = this.$refs.quillEditor as any;
    const length = quill.getLength();
    if (e.key !== "Backspace" && e.key !== "Delete" && length > this.maxLength) {
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
    this.$set(this.chart, "content", v.html);
  }
  maxLengthLimit() {
    const { quill } = this.$refs.quillEditor as any;
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
      qlEditor.addEventListener("compositionstart", this.onEditorComposeStart, false);
      qlEditor.addEventListener("input", this.onEditorInput, false);
      qlEditor.addEventListener("compositionend", this.onEditorComposeEnd, false);
    }
  }
  updated() {
    this.addEditEvent();
  }
  mounted() {
    this.addEditEvent();
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
  .ql-snow .ql-picker-options .ql-picker-item {
    outline: none;
  }

  .ql-snow .ql-tooltip::before {
    content: "请输入链接地址:";
  }
  .ql-snow .ql-tooltip.ql-editing a.ql-action::after {
    content: "保存";
  }
  .ql-snow .ql-tooltip a.ql-action::after {
    content: "编辑";
  }
  .ql-snow .ql-tooltip a.ql-remove::before {
    content: "删除";
  }

  .ql-snow .ql-picker.ql-size .ql-picker-label::before,
  .ql-snow .ql-picker.ql-size .ql-picker-item::before {
    content: "正常";
  }
  .ql-snow .ql-picker.ql-size .ql-picker-label[data-value="small"]::before,
  .ql-snow .ql-picker.ql-size .ql-picker-item[data-value="small"]::before {
    content: "小号";
  }
  .ql-snow .ql-picker.ql-size .ql-picker-label[data-value="large"]::before,
  .ql-snow .ql-picker.ql-size .ql-picker-item[data-value="large"]::before {
    content: "大号";
  }
  .ql-snow .ql-picker.ql-size .ql-picker-label[data-value="huge"]::before,
  .ql-snow .ql-picker.ql-size .ql-picker-item[data-value="huge"]::before {
    content: "巨号";
  }
}
.h3-report-long-text-edit {
  position: relative;
  z-index: 2;
}
</style>
