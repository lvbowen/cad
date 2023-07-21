<template>
  <div :class="[`${comPrefixCls}__side`]">
    <div
      v-for="(value, key, index) of list"
      :class="[`${comPrefixCls}__side-group`]"
      :key="index"
    >
      <label :class="[`${comPrefixCls}__side-title`]">{{ listOptions[key].title }}</label>
      <i
        v-if="listOptions[key].showHelp"
        class="h3yun_All question-circle-o"
        @click="onClickHelp(key)"
      ></i>
      <div
        v-for="item in value"
        :class="getItemClass(item)"
        :key="item.type"
        @mousedown="mousedown($event, item)"
      >
        <i :class="`h3yun_All ${item.icon}`"></i>
        {{ item.text }}
      </div>
    </div>

    <help-modal
      v-model="showHelpModal"
      :options="helpOptions"
      :title="helpTitle"
    ></help-modal>
  </div>
</template>

<script lang='ts'>
import {Component, Prop, Vue, Watch} from 'vue-property-decorator';
import { namespace } from 'vuex-class';
import { NodeType } from '@h3/report/lib/data-source/enum/node'
import HelpModal from '@h3/report/basics/components/help-modal'

@Component({
  name: 'h3-flow-side',
  components: {
    HelpModal,
  }
})
export default class H3FlowSide extends Vue {
  @Prop({
    default: 'h3-flow-designer'
  }) comPrefixCls!: string;

  @Prop({
    default: true
  }) outPutActived!: boolean;

  @Prop({
    default: null
  }) helpFunction!: Function;

  datasets: Array<H3.Falls.DragNode> = [
    {
      text: '输入',
      icon: 'input',
      type: NodeType.INPUT,
    },
    {
      text: '输出',
      icon: 'output',
      type: NodeType.OUTPUT,
    }
  ];
  processing: Array<H3.Falls.DragNode> = [
    {
      text: '合并',
      icon: 'merge-o',
      type: NodeType.UNION,
    },
    {
      text: '关联',
      icon: 'confluence-o',
      type: NodeType.JOIN,
    }
  ];
  colTransfer: Array<H3.Falls.DragNode> = [
    {
      text: '分组汇总',
      icon: 'list-o',
      type: NodeType.GROUP,
    },
  ];
  dataTransfer: Array<H3.Falls.DragNode> = [
    // {
    //   text: '过滤',
    //   icon: 'filter-o',
    //   type: NodeType.FILTER,
    // },
    // {
    //   text: '删除重复项',
    //   icon: 'delete-o',
    //   type: NodeType.UNIQ,
    // },
    {
      text: '字段设置',
      icon: 'setting-o',
      type: NodeType.COMPUTE,
    }
  ];

  list: any = {
    datasets: this.datasets,
    processing: this.processing,
    // colTransfer: this.colTransfer,
    dataTransfer: this.dataTransfer,
  };

  listOptions: any = {
    datasets : {
      title: '数据集',
      showHelp: false,
    },
    processing : {
      title: '数据处理',
      showHelp: true,
    },
    // colTransfer : {
    //   title: '列转换',
    //   showHelp: false,
    // },
    dataTransfer : {
      title: '数据转换',
      showHelp: true,
    },
  }

  LayoutTop: number = 0
  LayoutLeft: number = 0
  // copy的跟随鼠标移动的dom 本质是dom节点
  moveItem: any = null
  // 当前被选中拖拽的节点item 本质是对象
  currentMoveItem: any = null
  // 是否显示帮助弹窗
  showHelpModal: boolean = false
  // 帮助文档参数
  helpOptions: Array<any> = []
  // 帮助文档标题
  helpTitle: string = '帮助文档'

  getItemClass(item) {
    if (item.type === NodeType.OUTPUT) {
      this.$set(item, 'disabled', !this.outPutActived);
    }
    return [`${this.comPrefixCls}__side-item`, !this.outPutActived && item.type === NodeType.OUTPUT ? `${this.comPrefixCls}__side-item--disabled` : '']
  }

  /**
   * 鼠标落下事件
   */
  mousedown(e: Event, item:any) {
    if (item.disabled) return;
    (document as any).onselectstart = function () { return false; };
    this.currentMoveItem = item
    this.createMoveItem(e.target);
    this.calcDesignZone();
    window.addEventListener('mouseup', this.windowUp, false);
    document.body.addEventListener('mousemove', this.bodyMouseMove, false);
  }

  /**
   * 创建鼠标跟随浮层
   */
  createMoveItem (dom) {
    const div = dom.cloneNode(true) as HTMLElement;
    div.className = 'h3-report-move-item';
    this.moveItem = div;
    document.body.appendChild(this.moveItem);
  }

  /**
   * 计算画布位置
   */
  calcDesignZone () {
    const gridLayout = document.getElementsByClassName(`${this.comPrefixCls}__main`)[0] as HTMLDivElement;
    this.LayoutTop = gridLayout.offsetTop;
    this.LayoutLeft = gridLayout.offsetLeft;
  }

  /**
   * body 移动事件
   */
  bodyMouseMove (e) {
    this.moveItem.setAttribute('style', 'display:block;position:absolute');
    this.moveItem.style.top = e.pageY + 'px';
    this.moveItem.style.left = e.pageX + 'px';
    const inGridLayout = !this.notInGridLayout(e);
    if (inGridLayout) {
      this.$emit('bodyMouseMove', { e, data: this.currentMoveItem, inGridLayout: true });
    } 
  }

  /**
   * window 鼠标抬起事件
   */
  windowUp (e) {
    document.body.removeEventListener('mousemove', this.bodyMouseMove, false);
    window.removeEventListener('mouseup', this.windowUp, false);
    document.body.removeChild(this.moveItem);
    const inGridLayout = !this.notInGridLayout(e);

    this.$emit('windowUp', { e, inGridLayout });

    if (inGridLayout) {
      if (this.currentMoveItem.type === NodeType.OUTPUT) {
        this.$emit('addOutPut');
      }
      this.$emit('addCell', {e, node: this.currentMoveItem});
    }

    this.currentMoveItem = null;
    (document as any).onselectstart = function () { return true; };
  }

  /**
   * 计算是否在画布内
   */
  notInGridLayout (e) {
    return e.pageX > this.LayoutLeft && e.pageY < this.LayoutTop || e.pageX < this.LayoutLeft;
  }

  /**
   * 点击帮助
   */
  onClickHelp(type) {
    if (this.helpFunction) {
      this.helpFunction(type);
      return;
    }
    switch(type) {
      case 'processing':
        this.helpTitle = '数据处理';
        this.helpOptions = [{
          label: this.processing[0].text,
          value: this.processing[0].type,
          contentHtml: `<img src="${require(`@h3/report/basics/assets/data-source/union.png`)}">`,
        }, {
          label: this.processing[1].text,
          value: this.processing[1].type,
          contentHtml: `<img src="${require(`@h3/report/basics/assets/data-source/join.png`)}">`
        }];
        break;
      case 'dataTransfer':
        this.helpTitle = '数据转换';
        this.helpOptions = [{
          label: this.dataTransfer[0].text,
          value: this.dataTransfer[0].type,
          contentHtml: `<img src="${require(`@h3/report/basics/assets/data-source/compute.png`)}">`,
        }];
        break;
      default:
        break;

    }

    this.showHelpModal = true
  }
  
}
</script>

<style lang="less" scoped>
.question-circle-o{
  color: #68758E;
  margin-left: 8px;
}
.h3-report-move-item{
  width: 136px;
  height: 32px;
  line-height: 32px;
  padding: 0px 16px;
  margin-top: 8px;
  border-radius: 2px;
  color: #107FFF;
  font-size: 12px;
  z-index: 9;
  background:rgba(255,255,255,1);
  box-shadow:0px 0px 14px 0px rgba(76,107,173,0.2);
  border: 1px dashed #107FFF;
  cursor: move;
  .h3yun_All {
    color: #8893A7;
    font-size: 14px;
    margin-right: 8px;
  }
  .input{
    color: #00D495;
  }
  .output {
    color: #FFCA00;
  }
  .question-circle-o{
    color: #68758E;
    margin-left: 8px;
  }
}
</style>>
