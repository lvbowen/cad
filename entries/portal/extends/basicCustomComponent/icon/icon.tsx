import {Component, Prop, Vue} from 'vue-property-decorator';
import * as IconImg from './index';

import * as tsx from "vue-tsx-support";

@Component({
  name: 'Icon'
})
export default class Icon extends Vue {

  _tsx!: tsx.DeclareProps<Pick<Icon, 'src' | 'className' | 'external'>>

  @Prop({required: true}) src!: string;
  @Prop() external?: boolean;
  @Prop() className?: string;

  render() {
    const {src, className, external} = this;
    return (
      <i class={className}>
        <img src={!external && IconImg[src] || src} alt={''}/>
      </i>
    )
  }
}
