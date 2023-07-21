import { Vue, Component, Prop } from 'vue-property-decorator';
import Class from './qualityModule.module.less';
import * as Type from '../../type';

import Radio from 'ant-design-vue/lib/radio';
import 'ant-design-vue/lib/radio/style/index.css';

@Component({
  name: 'qualityRadio'
})
export default class QualityRadio extends Vue {

  @Prop() source?: Type.QualityQBS;

  @Prop() unbindSelectedKeys?: Array<string>;

  @Prop() unbindSelectEvent?: Function;

  render() {
    const { unbindSelectedKeys, unbindSelectEvent, source } = this;
    return (
      <div class={Class.templateRow}>
        <Radio
          onChange={e => unbindSelectEvent?.(source?.id)}
          checked={unbindSelectedKeys?.[0] === source?.id}
        />
        <span style={{ cursor: 'pointer' }} class={Class.templateName}>{source?.bizSheetName}</span>
      </div>
    );
  }
}
