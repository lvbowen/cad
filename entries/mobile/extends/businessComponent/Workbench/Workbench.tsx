import { Component, Prop, Vue } from 'vue-property-decorator';
import { FlatMenu } from '@ctesi/component';

@Component( {
  name: 'workbench',
  components: {
    FlatMenu
  },
  beforeRouteLeave( to, from, next ) {
    console.log( 'beforeRouteLeave' )
    if ( from.path === '/apps/eachWorkbench' && to.path === '/apps/workbench' ) this.$props?.leaveMenu?.();
    if ( to.path === '/apps' ) this.$router.replace( { name: 'workbench' } );
    next();
  }
} )
export default class Workbench extends Vue {
  @Prop() menuData?: unknown;
  @Prop() wrapperClass?: string;
  @Prop() menuCardClass?: string;
  @Prop() cardClass?: string;
  @Prop() firstSize?: number;
  @Prop() go2Page?: Function;
  @Prop() go2Next?: Function;
  @Prop() leaveMenu?: Function;
  @Prop() onlyShowFirst?: boolean;

  render() {
    const {
      menuData,
      wrapperClass,
      menuCardClass,
      cardClass,
      firstSize,
      go2Page,
      go2Next,
      onlyShowFirst
    } = this.$props;
    return (
      <FlatMenu
        wrapper-class={ wrapperClass }
        menu-card-class={ menuCardClass }
        card-class={ cardClass }
        menu-data={ menuData }
        go2-page={ go2Page }
        go2-next={ go2Next }
        first-size={ firstSize }
        enable-first={ onlyShowFirst }
      />
    );
  }
}
