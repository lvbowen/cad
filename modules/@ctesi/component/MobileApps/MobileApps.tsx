import {Component,Vue} from 'vue-property-decorator';
import '../declarations';
import Class from './MobileApps.less';


@Component({
    name:'MobileApps'
})
export default class MobileApps extends Vue {
    render() {
        return (
            <article class={Class.main}>

            </article>
        );
    }
}