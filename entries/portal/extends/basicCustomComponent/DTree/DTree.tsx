import { Component, Prop, Watch } from "vue-property-decorator";
import Class from './DTree.module.less';
import Tree from 'ant-design-vue/lib/tree';
import 'ant-design-vue/lib/tree/style/index.css';
import Input from 'ant-design-vue/lib/input';
import 'ant-design-vue/lib/input/style/index.css';
import { OriginData, TreeNodeProps } from "../../type";
import DTreeAbstract from "./DTreeAbstract";


@Component({
  name: 'Tree',
  components: {
    ATree: Tree,
    AInput: Input
  }
})
export default class DTree extends DTreeAbstract<OriginData> {

  @Prop() enableSearch!: boolean;

  @Prop() checkable!: boolean;

  @Prop() defaultCheckAll!: boolean;

  @Prop() originSources?: Array<OriginData>;

  @Prop() defaultSelect?: Array<string>;

  @Prop() defaultExpanded?: Array<string>;

  @Prop() className?: string;

  @Prop() receiveSelect?: Array<string>;

  @Prop() receiveCheck?: Array<string>;

  @Prop() treeSelect?: Function;

  @Prop() treeCheck?: Function;

  @Watch('originSources', { immediate: true })
  dataSourcesListener(originData: Array<OriginData>) {
    this.dataSources = super.treeDataAdapter(originData, 'name', 'key', 'children');
    if (this.defaultCheckAll) {
      this.checkedKeys = super.getAllCheckKeys(this.dataSources, 'key', 'children')
    }
  }

  @Watch('selectedKeys', { immediate: true })
  selectedListener(val: Array<string>) {
    const { treeSelect, dataSources, selectedKeys } = this;
    if (treeSelect) {
      const target = super.getTreeNodeDetailData(dataSources, val?.[0], 'children');
      if (!target) return;
      if (val?.[0] !== target.key) {
        treeSelect(val, target.children?.find(item => item.key === val[0]));
      } else {
        treeSelect(val, target);
      }
    }
  }

  @Watch('checkedKeys', { immediate: true })
  checkedKeysListener(val: Array<string>) {
    const { treeCheck, dataSources, checkedKeys } = this;
    treeCheck?.(val, checkedKeys.map(item => super.getTreeNodeDetailData(dataSources, item, 'children')))
  }

  @Watch('receiveSelect', { immediate: true })
  receiveSelectListener(val: Array<string>) {
    const { dataSources } = this;
    if (val && dataSources?.length) {
      this.expendedKeys = super.getExpendedKeysBySelect(dataSources, val[0]);
      this.selectedKeys = val;
    }
  }

  @Watch('receiveCheck', { immediate: true })
  receiveCheckListener(val: Array<string>) {
    const { dataSources } = this;
    if (val && dataSources?.length) {
      this.checkedKeys = val;
    }
  }

  dataSources: Array<TreeNodeProps> = [];

  expendedKeys: Array<string> = [];

  checkedKeys: Array<string> = [];

  selectedKeys: Array<string> = [];

  searchValue: string | null = null;

  getSelectKeys(): Array<string> {
    return this.selectedKeys;
  }

  getExpendedKeys(): Array<string> {
    return this.expendedKeys;
  }

  getCheckedKeys(): Array<string> {
    return this.checkedKeys;
  }

  conditionChange(e: InputEvent): void {
    const { dataSources } = this;
    const conditions = (e.target as HTMLInputElement)?.value;
    this.expendedKeys = super.filterTree(dataSources, (item) => item.title.includes(conditions), 'children').map(item => item.key);
    this.searchValue = conditions;
  }

  onExpand(v: Array<string>): void {
    this.expendedKeys = v;
  }

  onSelect(v: Array<string>): void {
    this.selectedKeys = v;
  }

  onCheck(v: string[]): void {
    this.checkedKeys = v;
  }

  render() {
    const {
      checkable,
      enableSearch,
      className,
      dataSources,
      defaultSelect,
      defaultExpanded,
      searchValue,
      expendedKeys,
      selectedKeys,
      checkedKeys,
      conditionChange,
      onExpand,
      onSelect,
      onCheck
    } = this;
    return (
      <article class={`${Class.main} ${className ?? ''}`}>
        {
          enableSearch &&
          <Input
            aria-search={'treeCondition'}
            placeholder="项目名称"
            value={searchValue}
            onChange={conditionChange}
            onExpand={onExpand}
          />
        }
        <Tree
          checkable={checkable}
          defaultSelectedKeys={defaultSelect}
          defaultExpandedKeys={defaultExpanded}
          autoExpandParent={true}
          treeData={dataSources}
          checkedKeys={checkedKeys}
          expandedKeys={expendedKeys}
          selectedKeys={selectedKeys}
          onExpand={onExpand}
          onSelect={onSelect}
          onCheck={onCheck}
        />
      </article>
    )
  }

}
