import { Prop, Vue } from 'vue-property-decorator';
import { DTreeComponent, TreeNodeProps } from "../../type";
import * as tsx from 'vue-tsx-support';
import Utils from "../../utils";

export default abstract class DTreeAbstract<T> extends Vue implements DTreeComponent<T> {

  _tsx!: tsx.DeclareProps<Pick<DTreeAbstract<T>, 'enableSearch' | 'checkable' | 'defaultCheckAll' | 'defaultSelect' | 'defaultExpanded' | 'originSources' | 'className' | 'treeSelect' | 'treeCheck' | 'receiveSelect' | 'receiveCheck'>>

  @Prop() enableSearch!: boolean;

  @Prop() checkable!: boolean;

  @Prop() defaultCheckAll!: boolean;

  @Prop() defaultSelect?: Array<string>;

  @Prop() defaultExpanded?: Array<string>;

  @Prop() originSources?: Array<T>;

  @Prop() className?: string;

  @Prop() receiveSelect?: Array<string>;

  @Prop() receiveCheck?: Array<string>;

  @Prop() treeSelect?: Function;

  @Prop() treeCheck?: Function;

  protected treeDataAdapter(originData: Array<unknown>, title: string, key?: string, childKey?: string): Array<any> {
    if (!Array.isArray(originData) || originData.length < 1) return [];
    return originData.map(item => {
      return {
        ...item,
        title: item[title ?? 'title'],
        key: item[key ?? 'key'],
        children: this.treeDataAdapter(item[childKey ?? 'children'], title, key, childKey)
      }
    });
  }

  protected filterTree(originData: Array<TreeNodeProps>, condition: (item, i, level) => boolean, children: string): Array<TreeNodeProps> {
    return Utils.deepFind(originData, condition, children);
  }

  protected getTreeNodeDetailData(originData: Array<TreeNodeProps>, key: string, childKey: string): TreeNodeProps | null {
    let target: TreeNodeProps | null = null;
    Utils.deepFind(originData, (item) => {
      if (item.key === key) {
        target = item;
        return true;
      } else {
        return false;
      }
    }, childKey);
    return target;
  }

  protected getAllCheckKeys(originData: Array<TreeNodeProps>, key: string, childKey: string): Array<string> {
    const result: Array<string> = [];
    Utils.deepFind(originData, (item) => {
      result.push(item[key ?? 'key']);
      return false
    }, childKey ?? 'children')
    return result;
  }

  protected getExpendedKeysBySelect(originData: Array<TreeNodeProps>, key: string): Array<string> {
    return Utils.deepFind(originData, item => item.key === key, 'children').map(item => item.key);
  }

  protected dataSources: Array<TreeNodeProps> = [];

  protected expendedKeys: Array<string> = [];

  protected checkedKeys: Array<string> = [];

  protected selectedKeys: Array<string> = [];

  protected searchValue: string | null = null;

  abstract getSelectKeys(): Array<string>;

  abstract getExpendedKeys(): Array<string>;

  abstract getCheckedKeys(): Array<string>;

  abstract conditionChange(e: InputEvent): void;

  abstract onExpand(v: Array<string>): void;

  abstract onSelect(v: Array<string>): void;

  abstract onCheck(v: Array<string>): void;

  //abstract render(): VueTsxSupport.JSX.Element;

}
