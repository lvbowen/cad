import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import * as tsx from 'vue-tsx-support';

import Select from 'ant-design-vue/lib/select';
import 'ant-design-vue/lib/select/style/index.css';

// eslint-disable-next-line no-shadow
enum TpypSelectorEnum {
    'FF' = '完成-完成（FF）',
    'FS' = '完成-开始（FS）',
    'SF' = '开始-完成（SF）',
    'SS' = '开始-开始（SS）'
}

@Component({
    name: 'TypeSelector'
})
export default class TypeSelector extends Vue {

    _tsx!: tsx.DeclareProps<Pick<TypeSelector, 'textKey' | 'value' | 'valueChange'>>;

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
            <div style={{ width: '100%' }} onDblclick={editValue}>
                {
                    editable &&
                    <Select
                        style={{ width: '100%' }}
                        value={originText}
                        onChange={e => editChange(e)}
                        onBlur={e => saveChange()}
                        onPressEnter={e => saveChange()}
                    >
                        <Select.Option value={'FF'}>完成-完成（FF）</Select.Option>
                        <Select.Option value={'FS'}>完成-开始（FS）</Select.Option>
                        <Select.Option value={'SF'}>开始-完成（SF）</Select.Option>
                        <Select.Option value={'SS'}>开始-开始（SS）</Select.Option>
                    </Select>
                    ||
                    <span>{originText ? TpypSelectorEnum[originText] : 0}</span>
                }
            </div>
        );
    }
}
