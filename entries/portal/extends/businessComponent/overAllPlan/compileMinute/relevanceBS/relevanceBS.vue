<template>
  <div class="BS-modalsItem">
    <div class="modalsItem">
      <!-- <div class="modals-tit">
          任务编码: 明细名称: 类型:
        </div> -->
      <div class="modals-body box" ref="List_table">
        <div class="body-left left" ref="List_table_left">
          <a-table
            :columns="releColumns"
            :data-source="releData"
            filterMultiple
            bordered
            defaultExpandAllRows
            :pagination="false"
            :customRow="customRow"
            @expand="expandClick"
            :indentSize="6"
          >
          </a-table>
        </div>
        <div class="resize" title="收缩侧边栏" ref="resize">
          ⋮
        </div>
        <div class="body-right mid" ref="List_table_mid">
          <div class="container-title">
            <h4 class="right-title">关联编码列表</h4>
            <div class="title-margin">
              <a-button style="margin-right: 10px;" size="small" @click="codingApi">
                刷新
              </a-button>
              <a-button
                :disabled="AddDataList.length == 0 || relevanceLook"
                style="margin-right: 10px;"
                size="small"
                @click="AddCodingApi"
              >
                保存
              </a-button>

              <a-button
                :disabled="selectedRowKeys.length == 0 || relevanceLook"
                style="margin-right: 10px;"
                size="small"
                @click="deleteCodingApi"
              >
                删除
              </a-button>

              <a-button
                :disabled="selectedRowKeys.length == 0 || AddDataList.length > 0 || relevanceLook"
                style="margin-right: 10px;"
                size="small"
                @click="showModal"
              >
                批量设置
              </a-button>
            </div>
          </div>
          <div class="table-heard">
            <div class="table-top">
              <a-checkbox :checked="checkAll" @change="onClickChange"></a-checkbox>
            </div>
            <div class="table-down">
              <!-- <div v-for="(item, index) in codingListTit" :key="index">
                {{ item.title }}
              </div> -->
              <div style="width: 10%;">序号</div>
              <div style="width: 20%;">编码值</div>
              <div style="width: 20%;">编码名称</div>
              <div style="width: 10%;">编码类别</div>
              <div style="width: 10%;">计划工期</div>
              <div style="width: 10%;">计划单位</div>
              <div style="width: 10%;">综合单价</div>
              <div style="width: 20%;">子计划开始</div>
              <div style="width: 20%;">子计划结束</div>
              <div style="width: 10%;">构件设计数量</div>
              <div style="width: 10%;">构件计划产值</div>
            </div>
          </div>
          <div
            class="container"
            ref="container"
            :style="`height:${container.height}px`"
            @scroll="test"
          >
            <a-table
              :rowSelection="{
                selectedRowKeys: selectedRowKeys,
                onChange: selectedChange
              }"
              :loading="spinloding"
              :columns="codingList"
              :data-source="showList"
              :pagination="false"
              :style="
                `height:${li.height * codingData.length + 30}px;padding-top:${li.height * pos}px`
              "
              bordered
              :showHeader="false"
            >
            </a-table>
          </div>
        </div>
        <div class="clear"></div>
      </div>
      <div class="codingData">共 {{ codingData.length }} 条</div>
    </div>

    <div class="popCol" ref="popCol" v-show="popColShow">
      <div class="popColDiv" @click="contextmenuChange">添加到右侧列表</div>
    </div>

    <div class="settingAll">
      <a-modal
        title="批量设置"
        :visible="visible"
        @ok="handleOk"
        @cancel="handleCancel"
      >
        <div>
          计划开始: &nbsp;
          <a-date-picker @change="onChangeStart" v-if="visible"/>
        </div>
        <br/>
        <div>
          计划结束: &nbsp;
          <a-date-picker @change="onChangeEnd" v-if="visible"/>
        </div>
        <br/>
        <div>
          设计数量: &nbsp;
          <a-input-number v-model="countValue" :min="0" @change="onChangeCount"/>
        </div>
        <br/>
        <div>
          计划产值: &nbsp;
          <a-input-number v-model="outputValue" :min="0" @change="onChangeOutput"/>
        </div>
      </a-modal>
    </div>
  </div>
</template>

<script lang="ts">
import {Component, Vue, Prop, Watch, InjectReactive} from 'vue-property-decorator'

import {relevance} from '../../api/api.All'
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
  InputNumber
} from '@h3/antd-vue'

// @@ 组件定义
@Component({
  name: 'BSmodals',
  components: {
    ASpin: Spin,
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
    AInputNumber: InputNumber
  }
})
export default class BSmodals extends Vue {

  @InjectReactive('project') projectCode?: string;
  // 左侧树形结构 列表表头数据格式
  releColumns: Array<any> = [
    {
      title: '编码',
      dataIndex: 'codeValue',
      key: 'codeValue',
      scopedSlots: {customRender: 'codeValue'},
      ellipsis: true
    },
    {
      title: '任务名称',
      dataIndex: 'taskName',
      key: 'taskName',
      scopedSlots: {customRender: 'taskName'},
      ellipsis: true
    }
  ]
  // 左侧树形结构 列表表体数据
  releData: Array<any> = []
  // 右侧table列表 列表表头数据格式
  codingList: Array<any> = [
    {
      title: '序号',
      dataIndex: 'index',
      scopedSlots: {customRender: 'index'},
      width: '10%',
      ellipsis: true
    },
    {
      title: '编码值',
      dataIndex: 'relatedmbs',
      scopedSlots: {customRender: 'relatedmbs'},
      width: '20%',
      ellipsis: true
    },
    {
      title: '编码名称',
      dataIndex: 'mbsname',
      scopedSlots: {customRender: 'mbsname'},
      width: '20%',
      ellipsis: true
    },
    {
      title: '编码类别',
      dataIndex: 'mbs',
      scopedSlots: {customRender: 'mbs'},
      width: '10%',
      ellipsis: true
    },
    {
      title: '计划工期',
      dataIndex: 'planperiod',
      scopedSlots: {customRender: 'planperiod'},
      width: '10%',
      ellipsis: true
    },
    {
      title: '计划单位',
      dataIndex: 'planunit',
      scopedSlots: {customRender: 'planunit'},
      width: '10%',
      ellipsis: true
    },
    {
      title: '综合单价',
      dataIndex: 'planunitprice',
      scopedSlots: {customRender: 'planunitprice'},
      width: '10%',
      ellipsis: true
    },
    {
      title: '子计划开始',
      dataIndex: 'wbsplanstart',
      scopedSlots: {customRender: 'wbsplanstart'},
      width: '20%',
      ellipsis: true
    },
    {
      title: '子计划结束',
      dataIndex: 'wbsplanend',
      scopedSlots: {customRender: 'wbsplanend'},
      width: '20%',
      ellipsis: true
    },
    {
      title: '构件设计数量',
      dataIndex: 'mbsamount',
      scopedSlots: {customRender: 'mbsamount'},
      width: '10%',
      ellipsis: true
    },
    {
      title: '构件计划产值',
      dataIndex: 'mbsmoney',
      scopedSlots: {customRender: 'mbsmoney'},
      width: '10',
      ellipsis: true
    }
  ]
  // 右侧table列表 列表表体数据
  codingData: Array<any> = [
    {
      key: 0,
      index: 1,
      relateddetailwbs: 'John Brown sr.',
      wbsname: 'New York No. 1 Lake Park',
      mbsname: 'asdasdasd',
      wbsplanstart: 'asdasdasd',
      wbsplanend: 'asdasdasd',
      mbsmoney: 'asdasdasd',
      mbsamount: 'asdasdasd'
    }
  ]
  // 右侧table列表 虚拟列表li单行高度
  li: object = {
    height: 58
  }
  // 右侧table列表 虚拟列表整体展示高度
  container: object = {
    height: 650
  }
  // 右侧table列表 虚拟列表第一排显示的元素的下标
  pos: number = 1
  //  右侧table列表 虚拟列表在容器内最多显示几个列表项
  MAX_NUM: number = 1

  // 右侧table列表 多选按钮数组
  selectedRowKeys: Array<number> = []
  // 左侧树形结构 鼠标右键整个树形结构向右侧添加时的单个数据暂存
  popColData: any = {}
  // 左侧树形结构 右键添加整个树形结构的弹窗
  popColShow: boolean = false
  // 批量设置的弹窗
  visible: boolean = false
  // 右侧table列表 批量设置的设计数量
  countValue: number = 0
  // 右侧table列表 批量设置的计划产值
  outputValue: number = 0
  // 左侧树形结构 向右侧添加数据时的所有数组暂存
  newDataList: Array<any> = []
  // 添加和修改的数据暂存
  AddDataList: Array<any> = []
  // 右侧table列表 table的loding状态
  spinloding: Boolean = false
  // 批量设置的数据对象
  settingAll: any = {}
  // 右侧table列表 多选按钮
  checkAll: Boolean = false
  // 上一页的数据
  @Prop() codingItem!: any
  // 是否是查看模式
  @Prop() relevanceLook!: boolean

  // 监听多选按钮的全选
  @Watch('selectedRowKeys')
  get_show(val, oldVal) {
    if (val.length == this.codingData.length && this.codingData.length !== 0) {
      this.checkAll = true
    } else {
      this.checkAll = false
    }
  }

  // 点击多选的回调
  selectedChange(val) {
    this.selectedRowKeys = val
  }

  // 左左侧树形结构 双击和右键事件
  get customRow() {
    return record => {
      return {
        on: {
          // 事件
          dblclick: event => {
            let val = JSON.parse(JSON.stringify(record))
            this.dblClickList(val)
          },
          contextmenu: event => {
            let aa = this.$refs.popCol
            if (event.button == 2) {
              event.preventDefault()
              this.popColShow = true
              const _x = event.clientX,
                _y = event.clientY
              //@ts-ignore
              aa.style.left = _x + 'px'
              //@ts-ignore
              aa.style.top = _y + 'px'
              this.popColData = JSON.parse(JSON.stringify(record))
              setTimeout(() => {
                this.popColShow = false
              }, 3000)
            }
          }
        }
      }
    }
  }

  // 批量设置 弹窗
  showModal() {
    this.visible = true
  }

  // 批量设置 弹窗确认操作
  handleOk(e) {
    this.codingData.forEach((item, index) => {
      this.selectedRowKeys.forEach(val => {
        if (val == item.id) {
          item.wbsplanstart = this.settingAll.wbsplanstart
          item.wbsplanend = this.settingAll.wbsplanend
          item.mbsamount = this.settingAll.mbsamount
          item.mbsmoney = this.settingAll.mbsmoney
          item.state = 'refesh'

          this.AddDataList.push(item)
        }
      })
    })
    this.countValue = 0
    this.outputValue = 0

    this.selectedRowKeys = []
    this.AddCodingApi()
    this.visible = false
  }

  // 批量设置 弹窗关闭
  handleCancel(e) {
    this.countValue = 0
    this.outputValue = 0
    this.visible = false
  }

  // 批量设置 计划开始
  onChangeStart(date, dateString) {
    this.settingAll.wbsplanstart = dateString
  }

  // 批量设置 计划结束
  onChangeEnd(date, dateString) {
    this.settingAll.wbsplanend = dateString
  }

  // 批量设置 设计数量
  onChangeCount(value) {
    this.settingAll.mbsamount = value
  }

  // 批量设置 计划产值
  onChangeOutput(value) {
    this.settingAll.mbsmoney = value
  }

  // 双击判断 将左侧树形结构传到右侧列表
  dblClickList(record) {
    this.spinloding = true
    let target = this.codingData.findIndex(item => record.id == item.id)

    if (record.children) {
      this.$message.warning('请右键直接关联')
      this.spinloding = false
      return
    } else if (target !== -1) {
      this.$message.warning('请勿重复添加')
      this.spinloding = false
      return
    } else {
      this.addList([record])
    }
  }

  // 左侧树形结构整体添加到右侧列表
  contextmenuChange() {
    this.spinloding = true
    if (this.popColData && this.popColData.childCount !== 0) {
      delete this.popColData.children
      //this.newDataList.push(this.popColData)
      this.dblClickListAPI(this.popColData).then(() => {
        this.addList(this.newDataList)
      })
      /*setTimeout(() => {

      }, 1000)*/
      this.popColShow = false
    } else {
      this.spinloding = false
      this.popColShow = false
    }
  }

  // 添加的数据增加信息
  addList(val) {
    val.forEach(item => {
      if (!item.show) {
        item.relateddetailwbs = this.codingItem.wbs
        item.wbsname = this.codingItem.plandetailname
        item.th04aPlandetailFk = this.codingItem.id

        item.wbsplanstart = this.codingItem.plandetailstart
        item.wbsplanend = this.codingItem.plandetailend
        item.relatedmbs = item.codeValue
        item.mbsname = item.taskName
        item.mbs = 'MBS'

        item.planperiod = this.codingItem.plandetailperiod
        item.planunit = this.codingItem.plandetailunit
        item.planunitprice = this.codingItem.plandetailunitprice

        item.ta01CodeFk = item.id
        item.mbsmoney = 0
        item.mbsamount = 0
        item.state = 'add'
        // item.id = ''
        item.index = this.codingData.length + 1

        this.codingData.push(item)
        this.AddDataList.push(item)
      }
    })
    this.spinloding = false
    this.newDataList = []
  }

  /**
   * API
   */
  // 循环查找子树形结构发送请求API
  dblClickListAPI(listData) {
    return relevance.dblClickList({currentId: listData.id, projectCode: this.projectCode}).then(res => {
      //@ts-ignore
      if (res.errcode == 0) {
        let _val = res.data
        console.log('====_val====', _val);
        _val.forEach(item => {
          this.codingData.forEach((val, ind) => {
            if (item.id == val.id) {
              item.show = true
            }
          })
          this.newDataList.push(item)
          // if (item.childCount !== 0) {
          //   this.dblClickListAPI(item)
          // }
        })
      } else {
        //@ts-ignore
        this.$message.error({content: `${res.errmsg}!`, duration: 1})
      }
      this.spinloding = false
    })

  }

  // 右侧table列表 获取table列表信息并添加内容API
  codingApi() {
    this.spinloding = true
    relevance.coding({id: this.codingItem.id, projectCode: this.projectCode as string}).then(res => {
      //@ts-ignore
      if (res.errcode == 0) {
        this.codingData = res.data
        this.codingData.forEach((item, index) => {
          if (item.wbsplanstart == '' || item.wbsplanend == '') {
            item.wbsplanstart = this.codingItem.plandetailstart
            item.wbsplanend = this.codingItem.plandetailend
          }

          item.planperiod = this.codingItem.plandetailperiod
          item.planunit = this.codingItem.plandetailunit
          item.planunitprice = this.codingItem.plandetailunitprice

          item.index = index + 1
          item.key = item.id
          item.mbs = 'MBS'
        })
        this.selectedRowKeys = []
        this.spinloding = false
      } else {
        //@ts-ignore
        this.$message.error({content: `${res.errmsg}!`, duration: 1})
      }
      this.spinloding = false
    })
  }

  // 左左侧树形结构 获取信息API
  leftCodingApi() {
    relevance.leftCoding({projectCode: this.projectCode as string}).then(res => {
      console.log(res)
      //@ts-ignore
      if (res.errcode == 0) {
        this.releData = res.data

        this.releData.forEach(item => {
          if (item.childCount !== 0) {
            item.children = []
          }
        })
      } else {
        //@ts-ignore
        this.$message.error({content: `${res.errmsg}!`, duration: 1})
      }
      this.spinloding = false
    })
  }

  // 左侧树形结构 点击树形结构 + 号 获取子结构内容API
  expandClick(expanded, record) {
    console.log(expanded, 'expandedexpanded')
    console.log(record, 'recordrecordrecord')
    if (expanded && record.childCount !== 0) {
      relevance.expandClick({id: record.id, projectCode: this.projectCode}).then(res => {
        //@ts-ignore
        if (res.errcode == 0) {
          let _val = res.data
          _val.forEach(item => {
            if (item.childCount !== 0) {
              item.children = []
            }
          })
          this.getChidlrens(this.releData, record.id, _val)
        } else {
          //@ts-ignore
          this.$message.error({content: `${res.errmsg}!`, duration: 1})
        }
        this.spinloding = false
      })
    }
  }

  // 右侧table列表 删除API
  deleteCodingApi() {
    //@ts-ignore
    relevance.deleteCoding({projectCode: this.projectCode, list: this.selectedRowKeys}).then(res => {
      //@ts-ignore
      if (res.errcode == 0) {
        this.codingApi()
        this.selectedRowKeys = []
        this.$message.success('操作成功!')
      } else {
        //@ts-ignore
        this.$message.error({content: `${res.errmsg}!`, duration: 1})
      }
      this.spinloding = false
    })
  }

  // 新增修改数据API
  AddCodingApi() {
    this.spinloding = true
    //@ts-ignore
    relevance.AddCoding({list: this.AddDataList, projectCode: this.projectCode})
      .then(res => {
        //@ts-ignore
        if (res.errcode == 0) {
          this.AddDataList = []
          this.codingApi()
          this.selectedRowKeys = []
          this.$message.success('操作成功!')
          this.spinloding = false
        } else {
          //@ts-ignore
          this.$message.error({content: `${res.errmsg}!`, duration: 1})
        }
        this.spinloding = false
      })
  }

  // 循环往前一个数组里面添加子数组
  getChidlrens(val, key, list) {
    var fn = function (data) {
      if (Array.isArray(data)) {
        data.forEach(item => {
          if (item.id == key) {
            item.children = [...list]
            // result = data
            return
          } else if (item.children) {
            fn(item.children)
          }
        })
      }
    }
    fn(val)
  }

  // 页面加载时获取数据
  created() {
    this.codingApi()
    this.leftCodingApi()
  }

  // dom加载后加载右侧虚拟列表的滚动和列表拖动
  mounted() {
    this.dragControllerDiv()
    this.test()
  }

  // 列表拖动
  dragControllerDiv() {
    var left: any = this.$refs.List_table_left
    var mid: any = this.$refs.List_table_mid
    var resize: any = this.$refs.resize
    var box: any = this.$refs.List_table

    // 鼠标按下事件
    resize.onmousedown = function (e) {
      resize.style.background = '#818181'
      const startX = e.clientX;
      resize.left = resize.offsetLeft

      // 鼠标拖动事件
      // eslint-disable-next-line no-shadow
      box.onmousemove = function (e) {
        const endX = e.clientX;
        let moveLen = resize.left + (endX - startX);
        const maxT = box.clientWidth - resize.offsetWidth;

        if (moveLen < 340) moveLen = 340
        if (moveLen > maxT - 340) moveLen = maxT - 340

        resize.style.left = moveLen // 设置左侧区域的宽度

        left.style.width = moveLen + 'px'
        mid.style.width = box.clientWidth - moveLen - 10 + 'px'
      }
      // 鼠标松开事件
      box.onmouseup = function (evt) {
        resize.style.background = '#d6d6d6'
        box.onmousemove = null
        box.onmouseup = null
        resize.releaseCapture && resize.releaseCapture()
      }
      resize.setCapture && resize.setCapture()
      return false
    }
  }

  // 页面销毁时 清空数组
  beforeDestroy() {
    this.codingData = []
  }

  // 虚拟列表
  test() {
    const {container, li} = this
    //@ts-ignore
    this.MAX_NUM = Math.ceil(container.height / li.height)
    //@ts-ignore
    const scrollTop = this.$refs.container.scrollTop
    //@ts-ignore
    this.pos = Math.round(scrollTop / li.height)
  }

  // 重新计算有当前数组的位数
  get showList() {
    // 根据计算出来的 第一排元素的下标,和最多显示多少个  用slice实现截取数组
    const arr = this.codingData.slice(this.pos, this.pos + this.MAX_NUM)
    return arr
  }

  // 全选按钮操作
  onClickChange(e) {
    if (e.target.checked) {
      this.selectedRowKeys = []
      this.checkAll = true
      this.codingData.forEach(item => {
        this.selectedRowKeys.push(item.id)
      })
    } else {
      this.selectedRowKeys = []
      this.checkAll = false
    }
  }
}
</script>

<style lang="less" scoped>
.BS-modalsItem {
  width: 100%;
  height: 100%;
  overflow: hidden !important;

  .modalsItem {
    width: 100%;
    height: 100%;
    overflow: hidden !important;
    padding: 14px;
    border: 14px solid #f1f1f1;
    box-sizing: border-box;

    .modals-tit {
      line-height: 30px;
      margin-bottom: 10px;
    }

    .modals-body {
      width: 100%;
      height: 95% !important;
      overflow: hidden;

      .body-left {
        height: 780px;
        overflow: auto !important;

        /deep/ .ant-table-wrapper {
          height: 100% !important;

          .ant-table-thead {
            tr {
              th {
                padding: 8px !important;
                font-size: 12px !important;
              }
            }
          }

          /deep/ .ant-table-tbody {
            .ant-table-row {
              td {
                padding: 8px;
                font-size: 12px;
              }
            }
          }
        }
      }

      .body-right {
        height: 780px;
        // overflow: auto !important;
        /deep/ .ant-table-wrapper {
          .ant-table-thead {
            tr {
              th {
                padding: 8px !important;
                font-size: 12px !important;
              }
            }
          }

          .ant-table-tbody {
            .ant-table-row {
              td {
                padding: 8px;
                font-size: 12px;
              }
            }
          }
        }
      }

      .clear {
        clear: both;
      }
    }
  }
}
</style>

<style lang="less" scoped>
/* 拖拽相关样式 */
/*包围div样式*/
.box {
  width: 100%;
  height: 100%;
  position: relative;
}

/*左侧div样式*/
.left {
  width: calc(32% - 10px); /*左侧初始化宽度*/
  height: 820px;
  background: #ffffff;
  float: left;
}

/*拖拽区div样式*/
.resize {
  cursor: col-resize;
  float: left;
  background-color: #d6d6d6;
  border-radius: 5px;
  margin-top: 20%;
  width: 6px;
  height: 100px;
  background-size: cover;
  background-position: center;
  /*z-index: 99999;*/
  line-height: 100px;
  text-indent: -4px;
  font-size: 32px;
  color: white;
}

/*拖拽区鼠标悬停样式*/
.resize:hover {
  color: #444444;
}

/*右侧div'样式*/
.mid {
  float: left;
  width: 68%; /*右侧初始化宽度*/
  height: 820px;
  background: #fff;
}

.right-title {
  font-weight: 500;
  font-size: 16px;
  color: #222;
  display: block;
}

.title-margin {
  margin-top: 10px;
}

.popCol {
  width: 160px;
  height: 40px;
  background-color: #fff;
  border-radius: 4px;
  box-shadow: 2px 0 6px #b4b4b4;
  position: absolute;
  z-index: 2;
  padding: 6px 0;

  .popColDiv {
    width: 100%;
    height: 100%;
    font-weight: 500;
    color: #333;
    text-align: center;
    line-height: 28px;

    &:hover {
      background-color: #f1f7fe;
      cursor: pointer;
    }
  }
}

.spin-content {
  border: 1px solid #91d5ff;
  background-color: #e6f7ff;
  padding: 30px;
  z-index: 99999;
}

/deep/ .ant-spin-nested-loading {
  background-color: rgba(255, 255, 255, 0.4) !important;

  .ant-spin-show-text {
    .ant-spin-text {
      margin-top: 10px;
      font-size: 16;
    }
  }
}

.codingData {
  float: right;
  font-size: 12px;
  color: #888;
  font-weight: 500;
  margin-top: 10px;
}

.container {
  overflow: scroll;
  // overflow: auto;
}

.container-title {
  padding: 10px;
  border: 1px solid #e8e8e8;
  box-sizing: border-box;
  width: 99.4%;
}

.table-heard {
  width: 99.4%;
  height: 48px;
  background-color: #fafafa;
  border-left: 1px solid #e8e8e8;
  border-right: 1px solid #e8e8e8;

  .table-top {
    float: left;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 8px;
    box-sizing: border-box;
    width: 4.5%;
    border-right: 1px solid #e8e8e8;
    height: 100%;

    div {
      height: 20px;
    }
  }

  .table-down {
    width: 95.5%;
    height: 100%;
    display: flex;
    align-items: center;
    // justify-content: space-between;
    div {
      // width: 10%;
      height: 48px;
      text-align: left;
      padding: 8px;
      border-right: 1px solid #e8e8e8;
      font-size: 12px;
      font-weight: 600;
      color: #333;
    }
  }
}
</style>
<style lang="less" scoped>
/deep/ .table-top {
  width: 50px !important;
}

/deep/ td[class=ant-table-selection-column] {
  width: 50px !important;
  display: inline-block;
}

/deep/ col[class=ant-table-selection-col] {
  width: 50px !important;
}

/deep/ .body-right {
  overflow-x: auto;
  overflow-y: hidden;

  & /deep/ .ant-table-body {
    border-right: 1px solid #eeeeee;
  }

  & > .table-heard {
    border-bottom: 1px solid #eeeeee;
  }

  & > div {
    width: 1159px !important;
    overflow: hidden;
  }

  & /deep/ colgroup {
    & > col:nth-child(1) {
      width: 50px !important;
    }

    & > col:nth-child(2) {
      width: 54px !important;
    }

    & > col:nth-child(3) {
      width: 173.5px !important;
    }

    & > col:nth-child(4) {
      width: 174px !important;
    }

    & > col:nth-child(5) {
      width: 88px !important;
    }

    & > col:nth-child(6) {
      width: 88px !important;
    }

    & > col:nth-child(7) {
      width: 88px !important;
    }

    & > col:nth-child(8) {
      width: 88px !important;
    }

    & > col:nth-child(9) {
      width: 88px !important;
    }

    & > col:nth-child(10) {
      width: 88px !important;
    }

    & > col:nth-child(11) {
      width: 88px !important;
    }

    & > col:nth-child(12) {
      width: 88px !important;
    }
  }
}

.table-down {
  & > div:nth-child(1) {
    width: 60px !important;
  }

  & > div:nth-child(2) {
    width: 200px !important;
  }

  & > div:nth-child(3) {
    width: 200px !important;
  }

  & > div:nth-child(4) {
    width: 100px !important;
  }

  & > div:nth-child(5) {
    width: 100px !important;
  }

  & > div:nth-child(6) {
    width: 100px !important;
  }

  & > div:nth-child(7) {
    width: 100px !important;
  }

  & > div:nth-child(8) {
    width: 100px !important;
  }

  & > div:nth-child(9) {
    width: 100px !important;
  }

  & > div:nth-child(10) {
    width: 100px !important;
  }

  & > div:nth-child(11) {
    width: 100px !important;
  }
}

.container {
  overflow: hidden !important;
  overflow-y: auto !important;
}
</style>
