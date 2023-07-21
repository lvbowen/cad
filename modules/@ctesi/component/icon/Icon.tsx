import { Component, Prop, PropSync, Vue } from 'vue-property-decorator';
import * as IconImg from './index';
import * as SvgIcon from './svg/index';
import * as tsx from 'vue-tsx-support';

@Component({
    name: 'Icon'
})
export default class Icon extends Vue {

    _tsx!: tsx.DeclareProps<Pick<Icon, 'src' | 'external' | 'className' | 'clickEvent'>>

    @Prop() src!: string;
    @Prop() external?: boolean;
    @Prop() className?: string;
    @Prop() clickEvent?: Function;

    render() {
        const { src, className, external, clickEvent } = this;
        const defaultImg = `<img src=${!external && IconImg[src] || src}  alt=""/>`;
        return (
            <i class={className} onClick={e => clickEvent?.()} domPropsInnerHTML={SvgIcon[src] ?? defaultImg}>
                {/*<img src={!external && IconImg[src] || src} alt={''}/>*/}
            </i>
        )
    }
}
