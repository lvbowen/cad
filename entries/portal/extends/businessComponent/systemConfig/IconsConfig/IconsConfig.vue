<template>
  <div class="icon-config">
    <a-collapse :activeKey="activeKey" :bordered="false" expandIconPosition="right">
      <template #expandIcon="props">
        <a-icon type="caret-right" :rotate="props.isActive ? 90 : 0"/>
      </template>
      <a-collapse-panel key="1" header="图标库" class="custom-style">
        <a-button
          @click="add"
          :disabled="editingKey !== ''"
          type="primary">新增
        </a-button>
        <a-table
          bordered
          :key="num"
          :data-source="defaultPagesData"
          :columns="defaultPagesColumns"
          :customRow="rowMouseenter"
          :pagination="false">
          <template
            v-for="col in ['seqNo','name','iconUrl']"
            :slot="col"
            slot-scope="text, record, index"
          >
            <span :key="col" class="flex-1">
              <a-input
                v-if="col==='seqNo' && record.editable"
                style="margin: 5px 0;"
                :value="text"
                @change="e => handleChange(e.target.value, record.id, col)"
              />
              <a-input
                v-else-if="col==='name' && record.editable"
                style="margin: 5px 0;"
                :value="text"
                @change="e => handleChange(e.target.value, record.id, col)"
              />
              <div
                v-else-if="col==='iconUrl' && record.editable"
                class="fj_edit"
                @click="triggerUpload">
                <img :src="text" class="full"/>
                <div class="d-none">
                  <input
                    @change=" ( e ) => fileUpload( 'background', e )"
                    type="file"
                    ref="icon"
                    accept="*"
                  />
                  <span>图标库图片，大小不超过1MB</span>
                </div>
              </div>
              <div
                @mouseenter="isExitHover=true"
                @mouseleave="isExitHover=false"
                class="fj"
                v-else-if="col==='iconUrl' && !record.editable">
                <img
                  v-show="isExitHover && currentIndex===index"
                  :src="text"/>
                <a :href="text">{{ record.iconName }}</a>
              </div>
              <template v-else>
                <span>{{ text }}</span>
              </template>
            </span>
          </template>
          <template slot="operation" slot-scope="text, record, index">
            <div class="editable-row-operations">
              <span v-if="record.editable">
                <a @click="() => save(record.id,record)" :class="editingKey===record.id?'success-color':''">保存</a>
                <a @click="() => cancel(record.id,record)" :class="editingKey===record.id?'cancel-color':''">取消</a>
              </span>
              <span v-else>
                <a :disabled="editingKey !== ''" @click="() => edit(record.id,record)" :class="editingKey || editingKey.length===4?'':'base-color'">编辑</a>
                <a-popconfirm title="删除后不可恢复哦，确认删除吗？" @confirm="deleteConfig(record.id)">
                  <a :disabled="editingKey !== ''" :class="editingKey || editingKey.length===4?'':'warning-color'">删除</a>
                </a-popconfirm>
              </span>
            </div>
          </template>
        </a-table>
      </a-collapse-panel>
    </a-collapse>
  </div>
</template>

<script lang="ts">
import {Vue, Component, InjectReactive} from 'vue-property-decorator';
import Collapse from 'ant-design-vue/lib/collapse';
import 'ant-design-vue/lib/collapse/style/index.css';
import Icon from 'ant-design-vue/lib/icon';
import 'ant-design-vue/lib/icon/style/index.css';
import Table from 'ant-design-vue/lib/table';
import 'ant-design-vue/lib/table/style/index.css';
import Button from 'ant-design-vue/lib/button';
import 'ant-design-vue/lib/button/style/index.css';
import Input from 'ant-design-vue/lib/input';
import 'ant-design-vue/lib/input/style/index.css';
import Popconfirm from 'ant-design-vue/lib/popconfirm';
import 'ant-design-vue/lib/popconfirm/style/index';
import {Icons} from "../type";
import {
  getIconList,
  updateIcon,
  deleteIcon
} from "../../../service/api";

@Component({
  name: 'IconConfig',
  components: {
    ACollapse: Collapse,
    ACollapsePanel: Collapse.Panel,
    AIcon: Icon,
    ATable: Table,
    AButton: Button,
    AInput: Input,
    APopconfirm: Popconfirm
  }
})
export default class IconConfig extends Vue {
  @InjectReactive('project') projectCode!: string;
  activeKey: string[] = ['1'];
  num: number = 1;
  editingKey: string = '';
  defaultPagesData: Icons[] = [];
  defaultPagesColumns: any[] = [
    {
      title: '序号',
      dataIndex: 'index',
      key: 'index',
      align: 'center',
      width: 80,
      customRender: (text, record, index) => `${index + 1}`,
    },
    {
      title: '图标编号',
      dataIndex: 'seqNo',
      key: 'seqNo',
      width: 120,
      scopedSlots: {customRender: 'seqNo'},
    },
    {
      title: '图标名称',
      dataIndex: 'name',
      key: 'name',
      // width: 200,
      scopedSlots: {customRender: 'name'},
    },
    {
      title: '图标附件',
      dataIndex: 'iconUrl',
      key: 'iconUrl',
      // width: 200,
      scopedSlots: {customRender: 'iconUrl'},
    },
    {
      title: '操作',
      dataIndex: 'operation',
      width: 150,
      scopedSlots: {customRender: 'operation'},
    }
  ];
  cacheDefaultPagesData: Icons[] = [];
  isExitHover: boolean = false;
  currentIndex: number | null = null;
  projectTheme: FormData = new FormData();

  init() {
    this.defaultPagesData = [];
    getIconList({appCode: this.projectCode ?? ''}).then((res) => {
      if (res.errcode !== 0) return this.$message.error(res.errmsg as string);
      if (res.data) {
        this.defaultPagesData = res.data;
        this.cacheDefaultPagesData = JSON.parse(JSON.stringify(res.data));
      }
    })
  }

  rndNum(n) {
    let rnd = "";
    for (let i = 0; i < n; i++)
      rnd += Math.floor(Math.random() * 10);
    return rnd;
  }

  add() {
    const addRow: Icons = {
      id: this.rndNum(4),
      seqNo: '',
      name: '',
      iconUrl: '',
      iconName: '',
      editable: true
    }
    this.editingKey = addRow.id as string;
    this.defaultPagesData.push(addRow);
  };

  handleChange(value, key, column) {
    const newData = [...this.defaultPagesData];
    const target = newData.filter(item => key === item.id)[0];
    if (target) {
      target[column] = value;
      this.defaultPagesData = newData;
    }
  }

  cancel(key) {
    // @ts-ignore
    this.editingKey = '';
    if (key.length === 4) {
      this.defaultPagesData = this.defaultPagesData.filter((i) => {
        return i.id !== key
      });
      return
    }
    const newData = [...this.defaultPagesData];
    const target = newData.filter(item => key === item.id)[0];
    if (target) {
      Object.assign(target, this.cacheDefaultPagesData.filter(item => key === item.id)[0]);
      delete target.editable;
      this.defaultPagesData = newData;
      this.num++;
    }
  }

  save(id: string = '', row) {
    //必填验证
    // if(!row.departments.length) { return this.$message.warning('部门选择必填！')}
    // if(this.defaultCheckedValue==='') { return this.$message.warning('页面设置必填！')}
    // const params = {
    //   name: row.name,
    //   appCode: this.projectCode ?? '',
    //   seqNo: row.seqNo,
    //   file: this.projectTheme  //研究文件上传
    // }
    // //编辑参数
    // if (id.length !== 4) {
    //   Object.assign(params, {id: id});
    // }
    this.projectTheme.set('appCode', this.projectCode);
    this.projectTheme.set('name',row.name);
    this.projectTheme.set('seqNo',row.seqNo);
    if(id.length !== 4) {
      this.projectTheme.set('id',id);
    }
    updateIcon(this.projectTheme).then((res) => {
      if (res.errcode !== 0) return this.$message.error(res.errmsg as string);
      this.$message.success('修改成功！')
      this.editingKey = '';
      this.init()
    })
  }

  edit(key) {
    const newData = [...this.defaultPagesData];
    const target = newData.filter(item => key === item.id)[0];
    this.editingKey = key;
    // @ts-ignore
    if (target) {
      target.editable = true;
      this.defaultPagesData = newData;
    }
  }

  deleteConfig(id: string) {
    deleteIcon({appCode: this.projectCode ?? '', id: id}).then((res) => {
      if (res.errcode !== 0) return this.$message.error(res.errmsg as string);
      this.$message.success('删除成功！');
      this.init();
    })
  }

  rowMouseenter(record, index) {
    return {
      on: {
        mouseenter: (e) => {
          this.currentIndex = index;
        },
        mouseleave: () => {
          this.currentIndex = null;
        }
      }
    }
  };

  triggerUpload() {
    (this.$refs['icon'] as HTMLInputElement)[0]?.click();
  }

  messageHandle() {
    return this.$message;
  }
  setFile(fileForm: FormData) {
    for (const files of fileForm.entries()) {
      const [key, value] = [files[0], files[1]];
        this.projectTheme.set(key, value);
    }
  }

  private fileUpload(key: string, e) {
    const files = e.target.files, {messageHandle, setFile } = this,
      fileReader = new FileReader();
    if (files && files[0]) {
      console.log('files', files);
      const file = files[0];
      const fileFormat = file.name.slice(file.name.lastIndexOf('.') + 1).toLowerCase();
      if (['png', 'jpg', 'jpeg'].indexOf(fileFormat) === -1) return messageHandle?.()?.error?.('只能上传*.png/*.jpg/*.jpeg的图片文件!');
      if (file.size > 1024 * 1024 * 5) return messageHandle?.()?.error?.('图片大小不能超过5MB!');
      const formData = new FormData();
      formData.append( `file`, file );
      setFile?.(formData);
      fileReader.onloadend = (readerEvent) => {
        const url = (readerEvent.target?.result as string);
        const target:Icons = this.defaultPagesData.filter(item=> this.editingKey===item.id)[0];
        if (target) {
          target.iconUrl = url;
        }
      }
      fileReader.readAsDataURL(file);
    }
  }

  mounted() {
    this.init()
  }
}
</script>

<style scoped lang="less">
@import '../../../styles/public.module.less';
@import '../system.module.less';

.icon-config {
  .editable-row-operations a {
    margin-right: 8px;
  }

  .fj {
    position: relative;
    img {
      width: 50px;
      height: 50px;
      position: absolute;
      left: 40px;
      top: -25px;
    }
  }

  .fj_edit {
    width: 40px;
    height: 40px;
    &:hover {
      border-color: #0e7fe1;
    }
    img {
      display: block;
    }
    .d-none {
      display: none;
    }
  }
}
</style>
