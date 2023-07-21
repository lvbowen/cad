import {Component, InjectReactive, Vue, Watch, Prop, Ref} from "vue-property-decorator";
import { SyncVisualTable } from '@ctesi/component';
import {exampleData} from "../engineeringArchives/mock";
import Class from './modelCodeTreeModal.less';

import Input from 'ant-design-vue/lib/input';
import 'ant-design-vue/lib/input/style/index.css';

import Button from 'ant-design-vue/lib/button';
import 'ant-design-vue/lib/button/style/index.css';
import Upload from 'ant-design-vue/lib/upload';
import 'ant-design-vue/lib/upload/style/index.css';

import { getCodeTree, importPropertyValue} from "../../service/classLibrary";
import Utils from '../../utils'
import { ProjectConfig,CodeTree } from "../../type";

import env from '@/config/env';
@Component( {
  name: 'ModelCodeTree'
})

export default class ModelCodeTree extends Vue {
  @InjectReactive( 'project' )
  public projectCode?: string;

  @InjectReactive( 'projectConfig' )
  public projectConfig?: ProjectConfig;

  @Ref()
  public modelTree!: SyncVisualTable<any>;

  getCodeTree() {
    this.mbsStateCollection.dataSource = [];
    this.mbsStateCollection.loading = true;
    getCodeTree({
      appCode: this.projectCode??'',
      projectName: this.projectConfig?.projectName??'',
      taskName: this.mbsStateCollection.conditions,
      classLibraryId: ''
  }).then((res)=> {
      if(res.errcode!==0) return this.$message.error(res.errmsg as string)
      this.mbsStateCollection.dataSource = res.data
      Utils.deepFind(this.mbsStateCollection.dataSource,(item)=> {
        this.$set(item,'checked',false)
        return false
      },'children')
    }).finally(()=> {
      this.mbsStateCollection.loading = false
    })
  }

  private static stopExpendMBSTree( item: CodeTree ) {
    return !item.children.length;
  }

  getMBSTableColumn() {
    const defaultColumns:any =  [
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
        width: 120,
        customRender: (t,r)=> {
          return r.isRelated?'已关联':''
        }
      }
    ]
    return defaultColumns
  }

  private renderMBSMainNav() {
    return [
      <Input.Search
        class={ 'searchInput' }
        placeholder={ '请输入名称' }
        loading={ this.mbsStateCollection.loading }
        value={ this.mbsStateCollection.conditions }
        onChange={ e => this.mbsStateCollection.conditions = e.target.value }
        enterButton
        onSearch={ e => this.getCodeTree() }
      />,
    ]
  }
  private renderNav() {
    return [
      <Button onClick={ e =>this.exportClick()} class={'export'} type={'link'}>导入模板示例</Button>,
      <Upload
        name="file"
        beforeUpload={(file)=> this.beforeUpload(file)}
        customRequest={ (options) =>this.customRequest(options) }
        showUploadList={this.showUploadList}>
        <Button type={'primary'}>导入</Button>
      </Upload>
    ]
  }
  num: number = 0;
  mbsStateCollection: any = {
    dataSource: [],
    loading: false,
    selectKey: null,
    selectRow: null,
    conditions: '',
  }
  showUploadList:boolean=false;

  mbsClickRow({row}: {row: CodeTree}) {
    if(this.mbsStateCollection.selectKey === row.id) {return}
    this.mbsStateCollection.selectKey = row.id;
    this.$emit('setCodeValue',{codeValue:row.codeValue,codeName:row.taskName,hasChild:row.hasChild})
  }

  closeModal() {
    this.mbsStateCollection.conditions = '';
    this.mbsStateCollection.dataSource = [];
    this.$emit('closeModelCodeModal')
  }

  beforeUpload(file){
    console.log(file,'file')
    const isXlsx = file.type === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" || file.type === "application/vnd.ms-excel";
    if (!isXlsx) {
      this.$message.warning("只能上传xlsx或xls文件");
      return false;
    }
    const isLt2M = file.size / 1024 / 1024 < 6;
    if (!isLt2M) {
      this.$message.warning("上传文件大小不能超过6M");
      return false;
    }
    return isXlsx && isLt2M;
  }

  customRequest(options){
    const formData = new FormData();
    formData.append("appCode", this.projectCode??'');
    formData.append("projectName", this.projectConfig?.projectName as string);
    formData.append(options.filename,options.file);
    importPropertyValue(formData)
      .then((res) => {
        if (res.errcode === 0)  {
          this.$message.success(res.errmsg as string);
          this.getCodeTree();
        }
        if (res.errcode !== 0) return this.$message.error(res.errmsg as string)
      })
      .catch(res=>{
      this.$message.error(`上传文件失败，${res.errmsg as string}`);
    })
  }
  exportClick(){
    window.open(`${env.apiHost}/api/deliveryLibrary/exportProjectTemplate?appCode=${this.projectCode ?? ''}&projectName=${this.projectConfig?.projectName ?? ''}`)
  }

  mounted() {
    this.getCodeTree();
  }


  render() {
    const { mbsStateCollection,renderMBSMainNav,renderNav } = this
    return <article class={Class.modelTreeMain}>
      <SyncVisualTable
        ref={ 'modelTree' }
        config={ {
          wrapperClass: 'model-table-tree',
          expendAllNode: true,
          dontReloadExpandNode: true,
          stopExpendCondition: ModelCodeTree.stopExpendMBSTree,
          locale: {
            title: '新增关联项'
          },
          loading: mbsStateCollection.loading,
          navNodes: renderNav(),
          articleNavNodes: renderMBSMainNav(),
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
            cellClick: this.mbsClickRow,
          },
          lazy: false,
          columns:this.getMBSTableColumn(),
          dataSource:mbsStateCollection.dataSource,
          treeChildField: 'children',
          hasChildField: 'hasChild',
        } }
      />
    </article>
  }
}
