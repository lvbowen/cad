import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import * as tsx from "vue-tsx-support";

import InputNumber from 'ant-design-vue/lib/input-number';
import 'ant-design-vue/lib/input-number/style/index.css';


@Component({
    name: 'NumberInput'
})
export default class NumberInput extends Vue {

    _tsx!: tsx.DeclareProps<Pick<NumberInput, 'textKey' | 'value' | 'valueChange'>>;

    @Prop() textKey?: string;

    @Prop() value?: any;

    @Prop() valueChange?: Function;

    @Watch('value', { immediate: true, deep: true })
    valueListener(val) {
        const { textKey } = this;
        if (textKey) this.originText = val[textKey];
    }

    private editable: boolean = false;

    private originText: string | null = null;

    private editValue() {
        const { value } = this;
        this.editable = true;
    }

    private editChange(e) {
        this.originText = e;
    }

    private saveChange() {
        const { value, valueChange, originText, textKey } = this;
        this.editable = false;
        valueChange?.(originText, textKey, value);
    }

    render() {

        const { editValue, editable, originText, editChange, saveChange } = this;

        return (
            <div onDblclick={editValue}>
                {
                    editable &&
                    <InputNumber
                        style={{ width: '100%' }}
                        value={originText}
                        onChange={e => editChange(e)}
                        onBlur={e => saveChange()}
                        onPressEnter={e => saveChange()}
                    />
                    ||
                    <span>{originText ?? 0}</span>
                }
            </div>
        );
    }
}
