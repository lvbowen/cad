import {Component, InjectReactive, Vue, Watch, Prop, Ref} from "vue-property-decorator";
import { SyncVisualTable } from '@ctesi/component';
import {exampleData} from "../engineeringArchives/mock";
import Class from './modelCodeTreeModal.less';
import Modal from "ant-design-vue/lib/modal";
import "ant-design-vue/lib/modal/style/index.css";
import Input from 'ant-design-vue/lib/input';
import 'ant-design-vue/lib/input/style/index.css';
import Button from 'ant-design-vue/lib/button';
import 'ant-design-vue/lib/button/style/index.css';
import { getCodeTree,addRelationOfClassLibrary } from "../../service/classLibrary";
import Utils from '../../utils'
import {CodeTree,ProjectConfig,AddModelRelationsParams} from "../../type";
@Component( {
  name: 'ModelCodeTreeModal'
})

export default class ModelCodeTreeModal extends Vue {
  @InjectReactive( 'project' )
  public projectCode?: string;

  @InjectReactive( 'projectConfig' )
  public projectConfig?: ProjectConfig;

  @Prop() showModalTree!:boolean;
  @Prop() classLibraryId!:string;
  @Ref()
  public modelTree!: SyncVisualTable<any>;

  @Watch('showModalTree',{deep:true})
  showModalTreeListener(val){
    if(val) {
      this.modelTreeKey++;
      this.mbsStateCollection.conditions = '';
      this.getCodeTree();
    }
  }

  getCodeTree() {
    this.mbsStateCollection.loading = true;
    this.mbsStateCollection.dataSource = [];
    getCodeTree({
      appCode: this.projectCode??'',
      projectName: this.projectConfig?.projectName??'',
      classLibraryId: this.classLibraryId,
      taskName: this.mbsStateCollection.conditions
    }).then((res)=> {
      if(res.errcode!==0) return this.$message.error(res.errmsg as string)
      this.mbsStateCollection.dataSource = res.data
      Utils.deepFind(this.mbsStateCollection.dataSource,(item)=> {
        this.$set(item,'checked',false)
        if(item.isRelated) {
          item.checked = true;
        }
        return false
      },'children')
      this.modelTreeKey++
    }).finally(()=> {
      this.mbsStateCollection.loading = false
    })
  }
  //关联：传已勾选的叶子节点
  addRelationOfClassLibrary() {
    let checkRows = this.modelTree.getCheckedRows( true );
    if ( !checkRows.length ) return this.$message.error('没有勾选节点!');
    checkRows = checkRows.filter((i)=> {
      return !i.isRelated
    })
    const addModelRelations: AddModelRelationsParams[] = [];
    checkRows.map((item) => {
      if(!item.children.length || !item.children) {
        addModelRelations.push({
          codeValue:item.codeValue,
          codeName: item.taskName
        })
      }
    })
    if(!addModelRelations.length) return this.$message.warning('不存在可勾选的叶子节点！')
    // console.log(addModelRelations,'111')
    this.mbsStateCollection.confirmLoading = true;
    addRelationOfClassLibrary({
      appCode: this.projectCode??'',
      projectName: this.projectConfig?.projectName??'',
      classLibraryId: this.classLibraryId,
      addModelRelations:addModelRelations
    }).then((res)=> {
      if(res.errcode!==0) return this.$message.error(res.errmsg as string)
      this.$message.success('关联成功！')
      this.$emit('confirmModel')
    }).finally(()=> {
      this.mbsStateCollection.confirmLoading = false;
    })
  }

  stopExpendMBSTree( item: CodeTree ) {
    return !item.children.length;
  }

  getMBSTableColumn() {
    const defaultColumns:any =  [
      {
        type: 'checkbox',
        width: 40,
        align: 'center'
      },
      {
        title: '模型编码',
        dataIndex: 'codeValue',
        key: 'codeValue',
        ellipsis: true,
        treeNode: true,
        align: 'left'
      },
      {
        title: '模型名称',
        dataIndex: 'taskName',
        key: 'taskName',
        // ellipsis: true,
      },
      {
        title: '关联状态',
        dataIndex: 'isRelated',
        key: 'isRelated',
        width: 100,
        customRender: (t,r)=> {
          return<div class={r.isRelated?Class.heightLight:''}>{r.isRelated?'已关联':''}</div>
        }
      },
      {
        title: '类库名称',
        dataIndex: 'classLibraryName',
        key: 'classLibraryName',
      }
    ]
    return defaultColumns
  }

  renderMbsTreeNav() {
    return [
      <Button type={ 'primary' } loading={ this.mbsStateCollection.confirmLoading}  onClick={ e => this.addRelationOfClassLibrary() }>确认</Button>,
      <Button type={ 'primary' }  onClick={ e => this.closeModal() }>取消</Button>
    ]
  }
  renderMBSMainNav() {
    return [
      <Input.Search
        class={'searchInput'}
        placeholder={ '请输入名称' }
        loading={ this.mbsStateCollection.loading }
        value={ this.mbsStateCollection.conditions }
        onChange={ e => this.mbsStateCollection.conditions = e.target.value }
        enterButton
        onSearch={ e => this.getCodeTree() }
      />
    ]
  }
  modelTreeKey: number = 0;
  mbsStateCollection: any = {
    dataSource: [],
    loading: false,
    confirmLoading: false,
    conditions: '',
  }

  checkboxChange({row}: {row:CodeTree}) {
    if(!row.children) return
    if(row.checked) {
      Utils.deepFind(row.children,(item)=> {
        item.checked = true
        return false
      },'children')
    }else {
      Utils.deepFind(row.children,(item)=> {
        if(!item.isRelated) {
          item.checked = false
        }
        return false
      },'children')
    }
  }

  getCheckFn( { row }: { row: CodeTree } ) {
    return !row.isRelated
  }

  closeModal() {
    this.mbsStateCollection.conditions = '';
    this.mbsStateCollection.dataSource = [];
    this.$emit('closeModelCodeModal')
  }

  render() {
    const { mbsStateCollection,renderMbsTreeNav,renderMBSMainNav,modelTreeKey } = this
    return <article class={Class.modelTreeMain}>
      <Modal
        wrapClassName={'model-code-tree-modal'}
        visible={this.showModalTree}
        width={1200}
        maskClosable={false}
        footer={null}
        closable={false}
        keyboard={false}>
        <SyncVisualTable
          key={modelTreeKey}
          ref={ 'modelTree' }
          config={ {
            wrapperClass: 'model-table-tree',
            expendAllNode: true,
            dontReloadExpandNode: true,
            //@ts-ignore
            stopExpendCondition: ModelCodeTreeModal.stopExpendMBSTree,
            locale: {
              title: '新增关联项'
            },
            loading: mbsStateCollection.loading,
            navNodes: renderMbsTreeNav(),
            // articleNavNodes: renderMBSMainNav(),
            articleNavNodes:[],
            mainTableConfig: {
              size: 'mini',
              align: 'center',
              stripe: false,
              border: true,
              resizable: true,
              showOverflow: true,
              highlightCurrentRow: true,
              autoResize: true,
              rowKey: true,
              rowId: 'id',
              checkboxChange: this.checkboxChange
            },
            lazy: false,
            columns:this.getMBSTableColumn(),
            dataSource:mbsStateCollection.dataSource,
            treeChildField: 'children',
            hasChildField: 'hasChild',
            checkConfig: {
              checkStrictly: true,
              checkField: 'checked',
              halfField: 'indeterminate',
              showHeader: false,
              checkMethod: this.getCheckFn
            }
          } }
        />
      </Modal>
    </article>
  }
}
