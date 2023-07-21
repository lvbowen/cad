<script lang="ts">
import { Component, Prop, Vue, Provide } from "vue-property-decorator";
import { CreateElement, VNode } from "vue";
import steps from "./step";

@Component({
  name: "h3-report-guide-container",
  components: {
    ...steps
  }
})
export default class ReportGuide extends Vue {
  @Prop({ default: null }) step!: number;
  @Prop({ default: null }) container!: HTMLElement;
  prefixCls = "h3-report-guide-container";

  render(h: CreateElement) {
    let children: Array<VNode> = [];
    if (this.step > 0) {
      for (let i = 1; i < 5; i++) {
        children.push(
          h(`step${i}`, {
            props: {
              visible: this.step === i,
              step: this.step
            },
            class: {},
            on: {}
          })
        );
      }
    }
    return h(
      "div",
      {
        props: {},
        class: {
          [this.prefixCls]: true
        }
      },
      children
    );
  }
}
</script>
