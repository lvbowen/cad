<template>
  <div class="compile-model">
    <div class="model-content">
      <div class="content-top">
        <p>进度计划方案表</p>
        <div class="top-form">
          <a-form-model
            labelAlign="left"
            :model="form"
            :labelCol="labelCol"
            :wrapperCol="wrapperCol"
          >
            <a-row>
              <a-col :span="20">
                <a-form-model-item :wrapperCol="{ span: 20 }">
                  <a-button @click="formSave" :disabled="examineLook">
                    保存
                  </a-button>

                  <a-button style="margin-left: 10px;" @click="submitAudit" :disabled="examineLook">
                    提交审核
                  </a-button>

                  <a-button
                    :disabled="workflowBoolean || examineLook"
                    @click="skipDetail"
                    style="margin-left: 10px;"
                  >
                    审批过程
                  </a-button>

                  <a-dropdown style="margin-left: 10px;" :disabled="examineLook">
                    <a-menu slot="overlay" @click="handleMenuClick">
                      <a-menu-item key="1">
                        导出 WBS-Excel模板
                      </a-menu-item>

                      <a-menu-item key="2">
                        <a-upload
                          name="file"
                          :action="accountAction"
                          :multiple="false"
                          :showUploadList="false"
                          @change="uPdateList"
                        >
                          导入 WBS-Excel
                        </a-upload>
                      </a-menu-item>
                    </a-menu>
                    <a-button> WBS-Excel <a-icon type="down" /> </a-button>
                  </a-dropdown>

                  <a-dropdown style="margin-left: 10px;" :disabled="examineLook">
                    <a-menu slot="overlay" @click="handleMenuClick">
                      <a-menu-item key="3">
                        导出Excel模板
                      </a-menu-item>
                      <a-menu-item key="4">
                        <a-upload
                          name="file"
                          :action="singedAction"
                          :multiple="false"
                          :showUploadList="false"
                          @change="uPdateList"
                        >
                          导入Excel数据
                        </a-upload>
                      </a-menu-item>
                    </a-menu>
                    <a-button>关联构件-Excel <a-icon type="down" /> </a-button>
                  </a-dropdown>

                  <a-button @click="countAll" style="margin-left: 10px;" :disabled="examineLook">
                    直接计算
                  </a-button>
                </a-form-model-item>
              </a-col>
            </a-row>
            <a-row>
              <a-col :span="6">
                <a-form-model-item
                  :labelCol="{ span: 8, offset: 0 }"
                  :wrapperCol="{ span: 16 }"
                  label="计划方案名称"
                >
                  <a-input v-model="form.planschemename" :disabled="true" />
                </a-form-model-item>
              </a-col>
              <a-col :span="6">
                <a-form-model-item
                  :labelCol="{ span: 8, offset: 0 }"
                  :wrapperCol="{ span: 16 }"
                  label="合同编号"
                >
                  <!--:disabled="examineLook"-->
                  <a-select
                    v-model="form.contractnum"
                    placeholder="please select your zone"
                    :disabled="true"
                  >
                    <a-select-option :value="form.contractnum">
                      {{ form.contractnum }}
                    </a-select-option>
                  </a-select>
                </a-form-model-item>
              </a-col>
              <a-col :span="6">
                <a-form-model-item
                  :labelCol="{ span: 8, offset: 0 }"
                  :wrapperCol="{ span: 16 }"
                  label="方案所属组织"
                >
                  <a-input v-model="form.schemeorgname" :disabled="true" />
                </a-form-model-item>
              </a-col>
              <a-col :span="6">
                <a-form-model-item
                  :labelCol="{ span: 8, offset: 0 }"
                  :wrapperCol="{ span: 16 }"
                  label="方案计划开始日期"
                >
                  <a-date-picker :placeholder="form.schemeplanstart" disabled format="YYYY-MM-DD" />
                </a-form-model-item>
              </a-col>
            </a-row>

            <a-row>
              <a-col :span="6">
                <a-form-model-item
                  :labelCol="{ span: 8, offset: 0 }"
                  :wrapperCol="{ span: 16 }"
                  label="方案计划完成日期"
                >
                  <a-date-picker :placeholder="form.schemeplanend" disabled format="YYYY-MM-DD" />
                </a-form-model-item>
              </a-col>
              <a-col :span="6">
                <a-form-model-item
                  :labelCol="{ span: 8, offset: 0 }"
                  :wrapperCol="{ span: 16 }"
                  label="方案计划产值"
                >
                  <a-input v-model="form.schememoney" :disabled="true" />
                </a-form-model-item>
              </a-col>
              <a-col :span="6">
                <a-form-model-item
                  :labelCol="{ span: 8, offset: 0 }"
                  :wrapperCol="{ span: 16 }"
                  label="方案目标产值"
                >
                  <a-input v-model="form.schemetargetmoney" :disabled="true" />
                </a-form-model-item>
              </a-col>
              <a-col :span="6">
                <a-form-model-item
                  :labelCol="{ span: 8, offset: 0 }"
                  :wrapperCol="{ span: 16 }"
                  label="方案计划数量"
                >
                  <a-input v-model="form.schemeplanamount" :disabled="true" />
                </a-form-model-item>
              </a-col>
            </a-row>

            <a-row>
              <a-col :span="6">
                <a-form-model-item
                  :labelCol="{ span: 8, offset: 0 }"
                  :wrapperCol="{ span: 16 }"
                  label="编制人"
                >
                  <a-input v-model="form.ownername" :disabled="true" />
                </a-form-model-item>
              </a-col>
              <a-col :span="6">
                <a-form-model-item
                  :labelCol="{ span: 8, offset: 0 }"
                  :wrapperCol="{ span: 16 }"
                  label="编制部门"
                >
                  <a-input v-model="form.ownerdeptname" :disabled="true" />
                </a-form-model-item>
              </a-col>
            </a-row>

            <a-row>
              <a-col :span="24">
                <a-form-model-item
                  label="备注:"
                  :labelCol="{ span: 1, offset: 1 }"
                  :wrapperCol="{ span: 22 }"
                >
                  <a-input v-model="form.remarks" type="textarea" :disabled="true" />
                </a-form-model-item>
              </a-col>
            </a-row>
          </a-form-model>
        </div>
      </div>
      <div class="content-down">
        <div class="down-tit">
          <a-button
            :disabled="isShow || examineLook"
            icon="retweet-o"
            @click="tableGet"
          >刷新</a-button
          >
          <a-button
            :type="primaryColor"
            :disabled="isShow || examineLook"
            icon="save-o"
            @click="tableAmend"
          >保存</a-button
          >
          <a-button
            :disabled="isShow || examineLook"
            icon="copy-o"
            @click="handleAdd"
          >增加</a-button
          >
          <a-button
            :disabled="!SelectedLength || examineLook"
            icon="form-o"
            v-if="!editingKey"
            @click="edit"
          >修改</a-button
          >
          <div v-else>
            <a-button icon="folder-o" @click="save">保存</a-button>
            <a-popconfirm title="确认取消编辑?" @confirm="() => cancel()">
              <a-button icon="close-circle-o">取消</a-button>
            </a-popconfirm>
          </div>
          <a-button
            :disabled="!SelectedLength || isShow || examineLook"
            icon="delete-o"
            @click="deleteHandle"
          >删除</a-button
          >
        </div>
        <div class="down-table">
          <a-table
            :columns="columns"
            :data-source="data"
            :rowSelection="{
              type: 'radio',
              selectedRowKeys: selectedKey,
              onChange: selectedChange
            }"
            defaultExpandAllRows
            :customRow="customRow"
            :pagination="false"
            :indentSize="20"
            customCell="customCell"
          >
            <template slot="plandetailstart" slot-scope="text, record">
              <div v-if="record.editable">
                <a-date-picker
                  :placeholder="record.plandetailstart"
                  @change="dataChange"
                  format="YYYY-MM-DD"
                />
              </div>
              <template v-else>
                {{ text }}
              </template>
            </template>

            <template slot="plandetailend" slot-scope="text, record">
              <div v-if="record.editable">
                <a-date-picker
                  :placeholder="record.plandetailend"
                  @change="StopChange"
                  format="YYYY-MM-DD"
                />
              </div>
              <template v-else>
                {{ text }}
              </template>
            </template>

            <template
              v-for="col in [
                'wbs',
                'plandetailname',
                'plandetailunit',
                'plandetailunitprice',
                'plandetailmoney',
                'remarks'
              ]"
              :slot="col"
              slot-scope="text, record"
            >
              <div :key="col">
                <a-input
                  v-if="record.editable"
                  style="margin: -5px 0"
                  :value="text"
                  @change="e => handleChange(e.target.value, record.key, col)"
                />
                <template v-else>
                  <a-popover>
                    <template slot="content">
                      <p>{{ text }}</p>
                    </template>
                    {{ text }}
                  </a-popover>
                </template>
              </div>
            </template>

            <template slot="BS" slot-scope="text, record">
              <div class="BS">
                <span class="BS-btn" v-if="!record.editable">
                  <a @click="() => relevanceBSApi(record)">查看</a>
                </span>
              </div>
            </template>
          </a-table>
        </div>
      </div>
    </div>
    <div class="BS-modal" v-if="bsvisible">
      <a-modal
        class="BS-modals"
        id="BS-modals"
        :visible="bsvisible"
        title="关联BS"
        :mask="false"
        dialogClass="BS-modals"
        :footer="null"
        @cancel="modelConl"
      >
        <relevanceBS
          :codingItem="codingItem"
          :relevanceLook="relevanceLook"
          ref="rele"
        ></relevanceBS>
      </a-modal>
    </div>
  </div>
</template>

<script lang="ts">
import {Component, Vue, Prop, Watch, InjectReactive} from 'vue-property-decorator'
import env from '@/config/env';
import {
  Row,
  Col,
  Divider,
  Button,
  Modal,
  Table,
  Pagination,
  Checkbox,
  Icon,
  Spin,
  Tag,
  Tooltip,
  Input,
  Popconfirm,
  DatePicker,
  Select,
  FormModel,
  Dropdown,
  Menu,
  Popover
} from '@h3/antd-vue'
import relevanceBS from './relevanceBS/relevanceBS.vue'
import { compileMinute } from '../api/api.All'
// @@ 组件定义
@Component({
  name: 'compileModel',
  components: {
    ARow: Row,
    ACol: Col,
    AButton: Button,
    ATable: Table,
    AModal: Modal,
    AIcon: Icon,
    ADivider: Divider,
    ATag: Tag,
    APagination: Pagination,
    ACheckbox: Checkbox,
    ATooltip: Tooltip,
    AInput: Input,
    APopconfirm: Popconfirm,
    ADatePicker: DatePicker,
    AMonthPicker: DatePicker.MonthPicker,
    AFormModel: FormModel,
    AFormModelItem: FormModel.Item,
    // AForm: Form,
    // AFormItem: Form.Item,
    ASelect: Select,
    ASelectOption: Select.Option,
    ADropdown: Dropdown,
    AMenu: Menu,
    AMenuItem: Menu.Item,
    APopover:Popover,
    relevanceBS
  }
})
export default class compileModel extends Vue {

  @InjectReactive('project') projectCode?:string;
  // 上方form表单 布局标签
  labelCol: object = { span: 2, offset: 4 }
  // 上方form表单 布局标签
  wrapperCol: object = { span: 6 }
  // 下方树形结构 判断是否在修改状态
  editingKey: boolean = false
  // 下方树形结构 单选按钮
  selectedKey: Array<number> = []
  // 下方树形结构 判断是否在修改状态
  isShow: boolean = false
  // 下方树形结构 修改和新增的数据列表
  upDateList: Array<any> = []
  // bs详情 弹窗的判断
  bsvisible: boolean = false
  // bs详情 传过去的值
  codingItem: any = {}
  // 下方树形结构 保存按钮的颜色状态
  primaryColor: string = ''
  // 上方form表单 判断审批过程是否可点击
  workflowBoolean: boolean = true

  // startData: string = ''
  // StopData: string = ''

  // 上一页传过来的 列表数据
  @Prop() pactItem!: any
  // 上一页传过来的 是否是查看模式
  @Prop() examineLook!: boolean

  // 上方form表单 数据
  form: any = {
    name: '第一个',
    schemeplanend: '2020 - 11 - 17',
    schemeplanstart: '2020 - 11 - 17',
    region: 'shanghai',
    desc: '按时打算大所大所'
  }

  // 下方树形结构 列表表头数据格式
  columns: Array<any> = [
    {
      title: '编码',
      dataIndex: 'wbs',
      key: 'wbs',
      width: '20%',
      scopedSlots: { customRender: 'wbs' },
      ellipsis:true
    },
    {
      title: '名称',
      dataIndex: 'plandetailname',
      key: 'plandetailname',
      width: '12%',
      scopedSlots: { customRender: 'plandetailname' },
      ellipsis: true
    },
    {
      title: '子计划工期',
      dataIndex: 'plandetailperiod',
      scopedSlots: { customRender: 'plandetailperiod' }
    },
    {
      title: '子计划开始',
      dataIndex: 'plandetailstart',
      scopedSlots: { customRender: 'plandetailstart' }
    },

    {
      title: '子计划完成',
      dataIndex: 'plandetailend',
      scopedSlots: { customRender: 'plandetailend' }
    },
    {
      title: '单位',
      dataIndex: 'plandetailunit',
      scopedSlots: { customRender: 'plandetailunit' }
    },
    {
      title: '综合单价',
      dataIndex: 'plandetailunitprice',
      scopedSlots: { customRender: 'plandetailunitprice' }
    },
    {
      title: '设计数量',
      dataIndex: 'plandetailamount',
      scopedSlots: { customRender: 'plandetailamount' }
    },
    {
      title: '计划产值',
      dataIndex: 'plandetailmoney',
      scopedSlots: { customRender: 'plandetailmoney' }
    },
    {
      title: '关联BS',
      dataIndex: 'BS',
      scopedSlots: { customRender: 'BS' }
    },
    {
      title: '备注',
      dataIndex: 'remarks',

      scopedSlots: { customRender: 'remarks' }
    }
  ]

  // 下方树形结构 列表表体数据
  data: Array<any> = []

  // 下方树形结构 表体数据暂存
  cacheData: Array<any> = JSON.parse(JSON.stringify(this.data))

  // 导出 WBS-Excel 链接地址
  accountAction: string = ''

  // 导出 Excel 链接地址
  singedAction: string = ''

  // bs详情页弹窗是否是查看模式
  relevanceLook: boolean = false

  // 页面加载获取excel的下载地址以及列表数据
  created () {
    this.accountAction = `/api/api/schedule_plan_detail/upload_wbs_file?schedulePlanId=${this.pactItem.id}&projectCode=${this.projectCode}`
    this.singedAction = `/api/api/schedule_plan_detail/upload_wbs_mbs_file?schedulePlanId=${this.pactItem.id}&projectCode=${this.projectCode}`
    this.tableGet()
    if (this.pactItem.workflowinstanceid) {
      this.workflowBoolean = false
    } else {
      this.workflowBoolean = true
    }
    this.demandList()
  }

  // 下方树形结构 行点击事件
  get customRow () {
    return record => {
      return {
        on: {
          // 事件
          click: event => {
            this.selectedChange([record.key])
          }
        }
      }
    }
  }

  customCell(e){
    return record =>{
      return {
        on:{
          mouseenter:event=>{

          }
        }
      }
    }
  }
  // 下方树形结构 单选回调
  selectedChange (val) {
    console.log('val',val[0],this.selectedKey[0]);
    if(val[0]===this.selectedKey?.[0]&&!this.editingKey) return this.selectedKey = [];
    this.selectedKey = val
  }

  // 下方树形结构 修改和编辑状态下input的回调
  handleChange (value, key, column) {
    if (column == 'plandetailunitprice' || column == 'plandetailmoney') {
      value = value.replace(/[^\d^\.]+/g, '')
    }
    const newData = [...this.data]
    const target = this.getChidlren(newData, key)
    if (target) {
      //@ts-ignore
      target[column] = value
      this.data = newData
    }
  }

  // 下方树形结构 修改
  edit () {
    this.cacheData = JSON.parse(JSON.stringify(this.data))
    const key = this.selectedKey[0]
    const newData = [...this.data]
    const target = this.getChidlren(newData, key)

    if (target) {
      //@ts-ignore
      target.editable = true
      this.isShow = true
      this.editingKey = true
      this.data = newData
    }
  }

  // 递归寻找树形结构里面对应的值
  getChidlren (val, key) {
    let hasFound = false
    let result = null
    const fn = function (data) {
      if (Array.isArray(data) && !hasFound) {
        // 判断是否是数组并且没有的情况下，
        data.forEach(item => {
          if (item.key === key) {
            result = item // 返回的结果等于每一项
            hasFound = true
          } else if (item.children) {
            fn(item.children)
          }
        })
      }
    }
    fn(val)
    return result
  }

  // 下方树形结构 暂存按钮 并判断输入的值是否为空
  save () {
    const key = this.selectedKey[0];
    const newData = [...this.data]
    const newCacheData = [...this.cacheData]
    const target = this.getChidlren(newData, key)
    //@ts-ignore
    console.log('target',target);
    const targetCache = this.getChidlren(newCacheData, key)
    if (
      //@ts-ignore
      target.wbs == '' ||
      //@ts-ignore
      target.plandetailname == '' ||
      //@ts-ignore
      target.plandetailstart == '' ||
      //@ts-ignore
      target.plandetailend == '' ||
      //@ts-ignore
      target.plandetailunit == '' ||
      //@ts-ignore
      target.plandetailunitprice == '' ||
      //@ts-ignore
      target.plandetailmoney == null
    ) {
      this.$message.warning('编码, 名称, 子计划开始, 子计划完成, 单位, 综合单价, 计划产值不得为空')
      return
    }
    //TODO:selectedKey
    console.log('selectedKey',this.selectedKey,target);
    if (target && targetCache) {
      //@ts-ignore
      if (target.state == 'add') {
        //@ts-ignore
        target.state = 'add'
      } else {
        //@ts-ignore
        target.state = 'refesh'
      }
      //@ts-ignore
      target.plandetailperiod = this.dateSums(target.plandetailstart, target.plandetailend)
      //@ts-ignore
      target.plandetailamount = this.designNumber(
        //@ts-ignore
        target.plandetailmoney,
        //@ts-ignore
        target.plandetailunitprice
      )
      //@ts-ignore
      delete target.editable
      this.upDateList.push(JSON.parse(JSON.stringify(target)))
      this.data = newData
      Object.assign(targetCache, target)
      this.cacheData = newCacheData

      this.primaryColor = 'primary'
      this.selectedKey = []
    }
    this.editingKey = false
    this.isShow = false
    //fixed:直接提交保存
    this.tableAmend();
  }

  // 下方树形结构 取消按钮 如果新增就删除这个新增
  cancel () {
    const key = this.selectedKey[0]
    const newData = [...this.data]
    const target = this.getChidlren(newData, key)
    this.editingKey = false
    this.isShow = false

    let cacheItem = this.getChidlren(this.cacheData, key)
    //@ts-ignore

    if (target.state == 'add') {
      //@ts-ignore
      const index = this.data.findIndex((item)=>item.key===target?.key);
      //index <---- key
      this.data.splice(index, 1);
      //@ts-ignore
      delete target.editable
    } else if (target) {
      Object.assign(target, cacheItem)
      //@ts-ignore
      delete target.editable
      this.data = newData
    }
    this.selectedKey = []
  }

  // 上方form表单 上传 excel 的回调提醒
  uPdateList (info, aaa) {
    if (info.file.status !== 'uploading') {
      if (info.file.response.errcode === 0) {
        this.$message.success(`${info.file.name} 导入成功!`)
      } else {
        this.$message.error(`${info.file.name} 导入失败!`)
      }
    }
  }

  // 上方form表单 跳转到流程图
  skipDetail () {
    if (this.pactItem.workflowinstanceid) {
      this.$router.push(`${env.portalHost}/form/detail?workflowInstanceId=${this.form.workflowInstanceId}`)
    }
  }

  // 监听data 获取最新的下标
  @Watch('data')
  get_data (val, oldVal) {
    this.count = val.length - 1
  }

  // 判断是否可以进行删除修改操作
  get SelectedLength () {
    return this.selectedKey.length > 0
  }

  count: number = this.data.length - 1

  // 下方树形结构 新增页面
  handleAdd () {
    const { count, data } = this
    this.count += 1
    const newData = {
      key: this.count,
      plandetailname: '',
      plandetailperiod: '',
      plandetailstart: '',
      plandetailend: '',
      plandetailunit: '',
      plandetailunitprice: '',
      plandetailamount: '',
      plandetailmoney: '',
      BS: '',
      remarks: '',
      state: 'add',
      //fixed:add parentId,
      th04aPlandetailFk: this.selectedKey?.[0]??null,
      th04aPlanschemeFk: this.pactItem.id
    }

    this.data = [newData, ...data]
    this.cacheData = JSON.parse(JSON.stringify(this.data))

    const target = this.getChidlren(this.data, newData.key)
    //@ts-ignore
    target.editable = true
    this.isShow = true
    this.editingKey = true
    this.selectedKey = [newData.key]
  }

  // 下方树形结构 计算设计数量
  designNumber (day1, day2) {
    var key = day1 / day2
    if (!Number.isNaN(key)) {
      return key.toFixed(3)
    } else {
      return ''
    }
  }

  // 下方树形结构 计算子计划工期
  dateSums (day1, day2) {
    let itam1 = new Date(day1)
    let itam2 = new Date(day2)
    let one_day = 1000 * 60 * 60 * 24
    //@ts-ignore
    let dateDay = Math.abs((itam2 - itam1) / one_day)
    if (!Number.isNaN(dateDay)) {
      //@ts-ignore
      return itam2 - itam1 > 0 ? dateDay : -dateDay
    } else {
      return ''
    }
  }

  // 下方树形结构 递归对返回的数据进行添加和修改
  circulation (arr) {
    arr.forEach(item => {
      if (item.children.length == 0) {
        delete item.children
      }

      item.name = item.wbs
      item.state = ''
      item.key = item.id
      // item.plandetailperiod = this.dateSums(item.plandetailstart, item.plandetailend)
      // item.plandetailamount = this.designNumber(item.plandetailmoney, item.plandetailunitprice)

      if (item.children) {
        this.circulation(item.children)
      }
    })
    return arr
  }

  // 下方树形结构 开始时间
  dataChange (val, dateString) {
    let key = this.selectedKey[0]
    const newData = [...this.data]
    let target: any = this.getChidlren(newData, key)

    if (target) {
      target.plandetailstart = dateString
      Object.assign(newData, target)
    }
  }
  // 下方树形结构 结束时间
  StopChange (val, dateString) {
    let key = this.selectedKey[0]
    const newData = [...this.data]
    let target: any = this.getChidlren(newData, key)

    if (target) {
      target.plandetailend = dateString
      Object.assign(newData, target)
    }
  }

  // BS弹窗页 展开弹窗和修改
  relevanceBSApi (val) {
    this.bsvisible = true
    this.codingItem = val
    if (this.examineLook) {
      this.relevanceLook = true
    }
  }

  // BS弹窗页 关闭
  modelConl () {
    this.bsvisible = false
  }

  /**
   * API
   */

  // 上方form表单 数据
  demandList () {
    compileMinute
      .demandApi({
        projectCode: this.projectCode as string,
        schedulePlanId: this.pactItem.id
      })
      .then(res => {
        //@ts-ignore
        if (res.errcode == 0) {
          console.log(res)
          this.form = res.data
        } else {
          //@ts-ignore
          this.$message.error({ content: `${res.errmsg}!`, duration: 1 })
        }
      })
  }

  // 上方form表单 表单保存
  formSave () {
    this.form.projectCode = this.projectCode;
    compileMinute.formSave(this.form).then(res => {
      //@ts-ignore
      if (res.errcode == 0) {
        this.$message.success({ content: '保存成功!', duration: 1 })
      } else {
        //@ts-ignore
        this.$message.error({ content: `${res.errmsg}!`, duration: 1 })
      }
    })
  }

  // 上方form表单 excel 下载
  handleMenuClick (e) {
    let key = ''
    if (e.key == 1 || e.key == 3) {
      if (e.key == 1) {
        key = 'PLAN_WBS'
      } else if (e.key == 3) {
        key = 'PLAN_MBS'
      }

      compileMinute.handleMenuClick({ fileCode: key,projectCode:this.projectCode }).then(res => {
        console.log(res)
        let refId = res.data
        //@ts-ignore
        if (res.errcode === 0) {
          // console.log(res, '下载模板')
          //TODO:Config
          //@ts-ignore
          window.open(`${window.config.apiHost}/api/aliyun/download?refId=${res.data.refId}`, '_self')
        } else {
          //@ts-ignore
          this.$message.error({ content: `${res.errmsg}!`, duration: 1 })
        }
      })
    }
  }

  // 上方form表单 提交审核
  submitAudit () {
    compileMinute
      .submitAudit({
        projectCode: this.projectCode as string,
        schedulePlanId: this.pactItem.id
      })
      .then(res => {
        //@ts-ignore
        if (res.errcode == 0) {
          //@ts-ignore
          this.$message.info(`${res.errmsg}`)
        } else {
          //@ts-ignore
          this.$message.error({ content: `${res.errmsg}!`, duration: 1 })
        }
      })
  }

  // 下方树形结构 table列表保存
  tableAmend () {
    let id = +this.pactItem.id
    //@ts-ignore
    compileMinute
      .tableAmend({
        projectCode: this.projectCode as string,
        //@ts-ignore
        list: this.upDateList,
        listRemove: []
      })
      .then(res => {
        //@ts-ignore
        if (res.errcode == 0) {
          this.tableGet()
          this.upDateList = []
          this.primaryColor = 'white'
          this.selectedKey = []
          this.$message.success(`保存成功!`)
        } else {
          //@ts-ignore
          this.$message.error({ content: `${res.errmsg}!`, duration: 1 })
        }
      })
  }

  // 下方树形结构 计算累加
  countAll () {
    compileMinute
      .countAll({
        projectCode: this.projectCode as string,
        schedulePlanId: this.pactItem.id
      })
      .then(res => {
        console.log(res)
        //@ts-ignore
        if (res.errcode == 0) {
          this.tableGet()
          this.$message.success({ content: '操作成功!', duration: 1 })
          this.demandList()
        } else {
          //@ts-ignore
          this.$message.error({ content: `${res.errmsg}!`, duration: 1 })
        }
      })
  }

  // 下方树形结构 table列表数据
  tableGet () {
    compileMinute
      .tableGet({
        schedulePlanId: this.pactItem.id,
        projectCode: this.projectCode as string
      })
      .then(res => {
        console.log(res)
        //@ts-ignore
        if (res.errcode == 0) {
          this.data = res.data
          this.data = this.circulation(this.data)
          this.selectedKey = []
        } else {
          //@ts-ignore
          this.$message.error({ content: `${res.errmsg}!`, duration: 1 })
        }
      })
  }

  // 下方树形结构 删除页面
  deleteHandle () {
    const key = this.selectedKey[0]
    const newData = [...this.data]
    const target = this.getChidlren(newData, key)

    compileMinute
      .deleteHandle({
        projectCode: this.projectCode as string,
        list: [],
        //@ts-ignore
        listRemove: [target.id]
      })
      .then(res => {
        //@ts-ignore
        if (res.errcode == 0) {
          this.tableGet()
          this.upDateList = []
        } else {
          //@ts-ignore
          this.$message.error({ content: `${res.errmsg}!`, duration: 1 })
        }
      })
  }
}
</script>
<style lang="less" scoped>
.compile-model {
  width: 100%;
  height: 100%;
  .model-content {
    .content-top {
      // margin-top: 10px;
      padding: 14px;
      border: 14px solid #f1f1f1;
      p {
        font-size: 16px;
        font-weight: 600;
        color: #111;
        line-height: 40px;
        border-bottom: 1px dotted #e9e9e9;
      }
      .top-form {
        margin-top: 30px;
      }
    }
    .content-down {
      padding: 0 14px !important;
      border: 14px solid #f1f1f1;
      border-top: none;
      min-height: 410px;
      .down-tit {
        height: 54px;
        display: flex;
        align-items: center;
        .ant-btn {
          margin-right: 10px;
        }
      }
    }
  }
}

/deep/.ant-calendar-picker-input {
  height: 32px !important;
}
// .ant-table-row-indent {
//   padding-left: 10px !important;
// }

/deep/.ant-table-row-cell-break-word {
  .ant-table-row-spaced {
    display: inline-block;
    //display: flex !important;
    //display: none !important;
  }
}
</style>
<style lang="less" scoped>
/deep/.BS-modals {
  position: relative;
  z-index: 110;
  overflow: hidden;
  top: 0;
  overflow: auto;
  width: 100vw !important;
  height: 100vh !important;
  background-color: #fff !important;
  padding: none !important;
  padding-bottom: 0 !important;
  .ant-modal-content {
    width: 100%;
    height: 100%;
    overflow: hidden;
    box-shadow: none !important;
    .ant-modal-close {
      width: 30px;
      height: 30px;
      span {
        width: 100%;
        height: 100%;
        line-height: 38px;
      }
    }
    .ant-modal-header {
      padding: 8px 24px;
    }
    .ant-modal-body {
      width: 100%;
      height: 96%;
      padding: 0px;
      overflow: hidden;
      margin: 0 auto;
    }
    .ant-modal-footer {
      position: absolute;
      bottom: 0;
    }
  }
}

.top-form{
  & /deep/ .ant-form-item-label-left{
    text-align: right;
  }
}

td[class~=ant-table-row-cell-ellipsis]{
  display: flex;
}
</style>
<style lang="less">
.iconCenter(){
  display: inline-block;
  vertical-align: middle;
  margin: auto;
}
td[class~=ant-table-row-cell-break-word]{
  &>div{
    display: inline-block;
    vertical-align: middle;
  }
}
.ant-table-row-expanded::after{
  .iconCenter;
}
.ant-table-row-collapsed::after{
  .iconCenter;
}

</style>
