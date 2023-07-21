import { Component, Prop, Vue } from 'vue-property-decorator';
import * as Type from '../../type';

@Component( {
  name: 'BIMModelListItem'
} )
export default class BIMModelListItem extends Vue {

  public static wrapperClass?: string;
  public static readonly delIcon: string = '<?xml version="1.0" encoding="utf-8"?> <!-- Generator: Adobe Illustrator 24.0.0, SVG Export Plug-In . SVG Version: 6.00 Build 0)  --> <svg version="1.1" id="图层_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 200 200" style="enable-background:new 0 0 200 200;" xml:space="preserve"> <style type="text/css"> .st0{fill:#DD0A0A;} </style> <path class="st0" d="M100,193.8c-51.8,0-93.8-42-93.8-93.8S48.2,6.3,100,6.3s93.8,42,93.8,93.8S151.8,193.8,100,193.8z M142.3,57.7 c-2.4-2.4-6.2-2.4-8.6,0l-33.6,33.6L66.6,57.6c-2.4-2.4-6.2-2.4-8.5,0c-2.4,2.4-2.4,6.2,0,8.5l33.6,33.6L58,133.4 c-2.4,2.4-2.4,6.2,0,8.6c2.4,2.4,6.2,2.4,8.6,0l33.6-33.6l33.2,33.2c2.4,2.4,6.2,2.4,8.5,0c2.4-2.4,2.4-6.2,0-8.5l-33.2-33.2 l33.6-33.6C144.7,63.9,144.7,60,142.3,57.7z"/> </svg>';
  @Prop()
  public source?: Type.ModelFIllWBSTreeNode;

  @Prop()
  public onClick?: () => {};
  @Prop()
  public delEvent?: ( id?: string ) => {};

  public mounted() {
    // console.log( 'this.source', this.source );
  }

  render() {
    const { source } = this;
    return (
      <article class={ BIMModelListItem.wrapperClass } onClick={ () => this.onClick?.() }>
        <span>{ source?.taskName }</span>
        <i onClick={ () => this.delEvent?.( source?.id ) }
           domPropsInnerHTML={ BIMModelListItem.delIcon }/>
      </article>
    );
  }
}
