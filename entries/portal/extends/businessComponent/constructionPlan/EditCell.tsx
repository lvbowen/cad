import { Component, Prop, Ref, Vue, Watch } from 'vue-property-decorator';
import * as tsx from 'vue-tsx-support';

import Input from 'ant-design-vue/lib/input';
import 'ant-design-vue/lib/input/style/index.css';
import Utils from "../../utils";

@Component({
  name: 'EditCell'
})
export default class EditCell extends Vue {

  _tsx!: tsx.DeclareProps<Pick<EditCell, 'textKey' | 'calcKey' | 'compareKey' | 'value' | 'valueChange'>>;

  @Prop() textKey?: string;

  @Prop() calcKey?: string;

  @Prop() compareKey?: string;

  @Prop() value?: any;

  @Prop() valueChange?: Function;

  @Ref() EditInput?: HTMLInputElement;

  @Watch('value', { immediate: true, deep: true })
  valueListener (val) {
    const { textKey } = this;
    if (textKey) {
      console.log('val===>', val[textKey]);
      this.originText = val[textKey];
    }
  }

  private editable: boolean = false;

  private originText: string | null = null;

  private originTextBak:string|null = null;

  private editValue () {
    const { value } = this;
    if (value.leaf === 1) {
      this.editable = true;
      this.$nextTick().then(() => this.EditInput?.focus());
    } else {
      this.$message.warn('非叶子节点无法编辑!');
    }
  }

  private editChange (e) {
    this.originText = e.currentTarget.value;
  }

  private debounceChange = Utils.debounce((vm: EditCell) => {
    vm.saveChange();
  }, 100);

  public setOriginText(e){
    this.originText = e;
  }

  private saveChange () {
    const { value, valueChange, originText, textKey, calcKey, compareKey,originTextBak } = this;
    this.editable = false;
    valueChange?.(originText, textKey, value, calcKey, compareKey,originTextBak,this);
  }

  mounted(){
    this.originTextBak = this.originText;
  }

  render () {
    const { editable, originText, editChange, editValue, saveChange } = this;
    return (
      <div style={ { cursor: 'pointer' } } onDblclick={ editValue }>
        {
          editable &&
          <Input
            ref={ 'EditInput' }
            value={ originText }
            onChange={ e => editChange(e) }
            onBlur={ e => saveChange() }
            onPressEnter={ e => saveChange() }
          />
          ||
          <span>{ originText ?? 0 }</span>
        }
      </div>
    );
  }
}
