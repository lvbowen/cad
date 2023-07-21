<template>
  <div class="code-manage-list-page">
    <div
      class="ant-spin-nested-loading zp-page-loaging"
      v-if="pageLoading"
    >
      <div style="height: 100%;width: 100%">
        <div
          class="ant-spin ant-spin-lg ant-spin-spinning ant-spin-show-text"
          style="height: 100%; width: 100%;"
        >
          <span class="ant-spin-dot ant-spin-dot-spin">
            <i class="ant-spin-dot-item"></i>
            <i class="ant-spin-dot-item"></i>
            <i class="ant-spin-dot-item"></i>
            <i class="ant-spin-dot-item"></i>
          </span>
          <div class="ant-spin-text">正在导入编码数据，请稍等...</div>
        </div>
      </div>
    </div>
    <zgantvue
      :options="options"
      :colums="colums"
      :dataList="gantData"
      :checked="checked"
      :timelines="timelines"
      @getChildTree="getChildTree"
    >
      <template
        slot="age"
        slot-scope="record"
      >
        <span
          class="test"
          v-text="record.age"
        ></span>
      </template>
      <template slot="tool">
        <a-row>
          <a-col
            :span="23"
            style="height: 30px;padding-left: 10px;background-color: #ececec;border-bottom: 1px solid #c9c9c9"
          >
            <span style="font-size: 21px">编码管理</span>
          </a-col>
          <a-col
            :span="1"
            style="height: 30px;background-color: #ececec;border-bottom: 1px solid #c9c9c9"
          >
            <a-icon type="close" @click="close" style="float: right"></a-icon>
          </a-col>
        </a-row>
        <div style="padding: 10px">
          <a-button
            class="toool-btn"
            @click="getGantData"
          >刷新
          </a-button>
          <a-button
            v-if="checked.length===0"
            class="toool-btn"
            @click="addCode"
          >新增
          </a-button>
          <a-button
            v-if="checked.length===1"
            class="toool-btn"
            @click="addChildCode"
          >新增子数据
          </a-button>
          <a-button
            v-if="checked.length>1"
            class="toool-btn"
            :disabled="true"
          >新增
          </a-button>
          <a-button
            class="toool-btn"
            @click="edit"
            v-if="checked.length===1"
          >查看
          </a-button>
          <a-button
            class="toool-btn"
            :disabled="true"
            v-if="checked.length!==1"
          >查看
          </a-button>
          <a-button
            class="toool-btn"
            v-if="checked.length>0"
            @click="remove"
          >删除
          </a-button>
          <a-button
            class="toool-btn"
            v-if="checked.length===0"
            :disabled="true"
          >删除
          </a-button>
          <a-upload
            name="file"
            :action="action"
            :headers="headers"
            :data="dataContract"
            :multiple="false"
            :showUploadList="false"
            @change="importChange"
          >
            <a-button class="toool-btn">导入</a-button>
          </a-upload>
          <a-dropdown>
            <a-menu slot="overlay" @click="bsClick">
              <!-- 菜单遍历的开始 -->
              <template v-for="item in BSOptions">
                <!-- 如果当前遍历项没有children，视为子菜单项，注意所有的key都是path用于路由跳转，以及当前选中记录 -->
                <a-menu-item :key="item">
                  {{ item }}
                </a-menu-item>
              </template>
            </a-menu>
            <a-button class="toool-btn"> {{ BSChecked }}
              <a-icon type="down"/>
            </a-button>
          </a-dropdown>
          <!--          <div style="float: right">-->
          <!--            <span>时间单位：</span>-->
          <!--            <a-select-->
          <!--              v-model="options.timeType"-->
          <!--              @change="setTimeType"-->
          <!--            >-->
          <!--              <a-select-option :value="4">年</a-select-option>-->
          <!--              <a-select-option :value="3">月</a-select-option>-->
          <!--              <a-select-option :value="2">天</a-select-option>-->
          <!--              <a-select-option :value="1">小时</a-select-option>-->
          <!--            </a-select>-->
          <!--          </div>-->
        </div>
      </template>
    </zgantvue>
    <!--数据导入日志模态框-->
    <a-modal
      :width="700"
      v-model="errLogVisible"
      @ok="errLogVisible = false"
      :closable="true"
      title="数据导入日志"
      :footer="null"
    >
      <div class="err-log">
        <ul>
          <li
            v-for="(item, index) in errData"
            :key="index"
          >
            <div class="label-info">
              <span v-text="`【${item}】`"></span>
            </div>
          </li>
        </ul>
      </div>
    </a-modal>

  </div>
</template>

<script>
import {Component, Vue, Prop, Watch} from 'vue-property-decorator';
import axios from 'axios';
import zgantvue from "../../basicCustomComponent/zgantvue/zgantvue";

import {
  Button,
  Icon,
  Table,
  Select,
  Modal,
  Form,
  Dropdown,
  Menu
} from '@h3/antd-vue';
import ARow from "@h3/antd-vue/es/grid/Row";
import ACol from "@h3/antd-vue/es/grid/Col";
import env from '@/config/env';

@Component({
  name: 'list',
  components: {
    ACol,
    ARow,
    AIcon: Icon,
    ATable: Table,
    AButton: Button,
    zgantvue,
    AForm: Form,
    ASelect: Select,
    ASelectOption: Select.Option,
    AModal: Modal,
    ADropdown: Dropdown,
    AMenu: Menu,
    AMenuItem: Menu.Item
  }
})
export default class allProtect extends Vue {

  addCode() {
    const url = `/form/detail?sheetCode=code_manage&objectId=&schemaCode=${this.projectCode}_model_code&codeparentid=&projectId=${this.projectId}`;
    const urlReturn = `${this.$route.fullPath}&iframeAction=add`;
    this.isDingTalk?this.$router.push(`${url}&return=${encodeURIComponent(urlReturn )}`):window.open(`${env.portalHost}${url}`);
  }

  addChildCode() {
    let item = this.checked[0];
    const urlReturn = `${this.$route.fullPath}&iframeAction=add`;
    const url = `/form/detail?sheetCode=code_manage&objectId=&schemaCode=${this.projectCode}_model_code&codeparentid=${item.id}&projectId=${this.projectId}`
    this.isDingTalk?this.$router.push(`${url}&return=${encodeURIComponent(urlReturn )}`):window.open(`${env.portalHost}${url}`)
  }

  //返回主页面
  close() {
    // this.$router.push("/measurePayment");
    this.$router.go(-1);
  }

  edit() {
    if (this.checked.length === 1) {
      const url = `/form/detail?sheetCode=code_manage&schemaCode=${this.projectCode}_model_code&objectId=${this.checked[0].id}`;
      const urlReturn = `${this.$route.fullPath}&iframeAction=detail`;
      this.isDingTalk?this.$router.push(`${url}&return=${encodeURIComponent(urlReturn )}`):window.open(`${env.portalHost}${url}`)
    } else if (this.checked.length === 0) {
      this.$message.warning("请选择要修改的数据");
    } else {
      this.$message.error("只能选择一条数据进行修改");
    }
  }

  remove() {
    this.$confirm({
      title: '系统提示',
      content: '您将删除已选择的数据',
      okText: '删除',
      cancelText: '取消',
      onOk: this.removeData
    })
  }

  removeData() {
    let ids = [];
    this.checked.forEach(function (d) {
      ids.push(d.id);
    });
    console.log(ids);
    axios.post(`${env.apiHost}/codeManage/deleteByIds`,
      // axios.post(`http://10.20.105.104:8080/api/codeManage/deleteByIds`,
      {codeIds: ids, projectCode: this.projectCode}).then(res => {
      if (res.errcode === 0) {
        this.$message.success("数据删除成功");
        this.getGantData();
      } else {
        this.$message.success("数据删除失败");
      }
    })
  }

  //数据导入开始
  pageLoading = false;
  errLogVisible = false; // 错误日志详情
  errData = []; // 错误信息
  action = `${env.apiHost}/api/code_mbs/data_import`;
  // action = `http://10.20.105.104:8080/api/api/code_mbs/data_import`;
  headers = {Authorization: 'Bearer ' + localStorage.token};
  dataContract = {
    projectId: "",
    codeType: "",
    projectCode: ""
  };

  BSOptions = [];
  BSChecked = "";

  importChange(info) {

    // console.log("t fss",this.dataContract.projectId)

    if (info.file.status === 'uploading') {
      this.pageLoading = true;
    } else if (info.file.status === 'done') {
      this.pageLoading = false;
      if (info.file.response.errcode !== 0) {
        console.log(info.file.response, 'info.file.response');
        this.errData = info.file.response.data;
        this.errLogVisible = true;
        // this.$message.error(`${info.file.response.errmsg} ,导入失败.`);
      } else {
        this.$message.success(`数据导入成功`);
        this.getGantData();

      }
    } else if (info.file.status === 'error') {
      this.pageLoading = false;
      this.$message.error(`${info.file.name} 导入失败.`);
    } else {
      this.pageLoading = false;
      this.$message.error("导入异常")
    }
  }

  //数据导入结束

  checked = [];

  options = {
    style: {
      rowHeight: '35px',
    },
    tableWidth: '40%',
    toolSlot: 'tool',
    checkrow: true,
    timeType: 3
  };

  gantData = [];

  colums = [
    {
      title: "编码",
      dataIndex: "codeValue",
      treeColum: true,
      textAlign: 'center'
    },
    {
      title: "任务名称",
      dataIndex: "taskName",
      textAlign: 'center',
    },
    // {
    //   title: "前置任务",
    //   dataIndex: "preTask",
    //   textAlign: 'center',
    // },
    {
      title: "编码类别",
      dataIndex: "codeType",
      textAlign: 'center',
    },
    {
      title: "编码排序",
      dataIndex: "codeSort",
      textAlign: 'center',
    },
    {
      title: "CM唯一值",
      dataIndex: "cmCode",
      textAlign: 'center',
    },
    {
      title: "CM数据集",
      dataIndex: "cmCollection",
      textAlign: 'center',
    },
    {
      title: "CM要素类",
      dataIndex: "cmClass",
      textAlign: 'center',
    },
    {
      title: "CM要素ID",
      dataIndex: "cmId",
      textAlign: 'center',
    },
    // {
    //   title: "施工负责单位",
    //   dataIndex: "constructionOrg",
    //   textAlign: 'center',
    // },
    // {
    //   title: "开工预警时间",
    //   dataIndex: "alertStartTime",
    //   textAlign: 'center',
    // },
    // {
    //   title: "完工预警时间",
    //   dataIndex: "alertEndTime",
    //   textAlign: 'center',
    // },
    // {
    //   title: "计划工期",
    //   dataIndex: "planDuration",
    //   textAlign: 'center',
    // },
    // {
    //   title: "开始日期",
    //   dataIndex: "realStartTime",
    //   textAlign: 'center',
    // },
    // {
    //   title: "完成日期",
    //   dataIndex: "age",
    //   textAlign: 'center',
    // },
    // {
    //   title: "实际工期",
    //   dataIndex: "realDuration",
    //   textAlign: 'center',
    // },
    // {
    //   title: "实际开始日期",
    //   dataIndex: "age",
    //   textAlign: 'center',
    // },
    // {
    //   title: "实际完成日期",
    //   dataIndex: "age",
    //   textAlign: 'center',
    // }
  ];

  timelines = [
    {
      startKey: "planStartTime",
      endKey: "planEndTime",
      color: "#9ed3ff",
    },
    {
      startKey: "start2",
      endKey: "end2",
      color: "#0dF"
    }
  ];

  projectCode = "";

  projectId = "";

  getGantData() {
    this.checked = [];
    this.gantData = []
    let _this = this;
    // console.log("输入", {
    //   projectCode: this.projectCode,
    //   code: "",
    //   name: "",
    //   projectId: this.projectId,
    //   codeType:this.BSChecked
    // })
    axios.get(`${env.apiHost}/api/code_mbs/top_tree_list`, {
      params: {
        projectCode: this.projectCode,
        code: "",
        name: "",
        projectId: this.projectId,
        codeType: this.BSChecked
      }
    }).then(res => {
      // axios.get(`${env.apiHost}/codeManage/queryTree`).then(res => {
      if (res.errcode === 0) {
        _this.gantData = res.data;
      } else {
        this.$message.error("数据加载错误");
      }
    })
  }

  getChildTree(c) {
    let _this = this
    return new Promise((resolve) => {
      if (c.children != undefined && c.children != null && c.children.length != 0) { // 有值了直接渲染
        // console.log("调到了吗222")
        resolve()
        return
      }
      // 没有值根据当前父节点获取下面子节点并挂在树节点中，添加到对应父节点的children中
      axios
        .get(`${env.apiHost}/api/code_mbs/child_tree_list`, {
          params: {
            id: c.key,
            projectCode: this.projectCode,
            code: "",
            name: "",
            codeType: this.BSChecked
          },
        })
        .then((res) => {
          // console.log("调到了吗", res);
          c["children"] = res.data;
          c["childCount"] = res.data.length;
          this.editListTree(_this.gantData, c.key, c);
          // console.log("dfsf",_this.gantData)
        })
      resolve()
    })
  }

  initBS() {
    this.BSOptions = [];
    axios
      .get(
        `${env.apiHost}/api/runtime/form/load`, {
          params: {
            schemaCode: this.projectCode + "_model_code",
            perms: "edit"
          }
        })
      .then(res => {
        let resData = JSON.parse(res.data.bizSheet.publishedAttributesJson).code_type.options.options
        this.BSOptions = resData.split(';')
        this.BSChecked = this.BSOptions[0];
        this.dataContract.codeType = this.BSChecked;
        this.getGantData();
      })
      .catch(err => {
        console.log(err); //错误信息
      });
  }

  bsClick(value) {
    // console.log("bsClick",value);
    this.BSChecked = value.key;
    this.getGantData();
  }

  /**
   *遍历多棵树（编辑节点）
   *data  多棵树
   *key   关键字
   */
  editListTree(data, key, value) {
    var flag = false
    for (let i = 0; i < data.length; i++) {
      if (flag) {
        break
      } else {
        if (data[i].key === key) {
          data[i] = value;
          flag = true
          break
        } else {
          this.editTree(data[i], key, flag, value)
        }
      }
    }
  }

  /**
   *遍历多棵树（编辑节点）
   *data  单数
   *key   关键字
   */
  editTree(data, key, flag, value) {
    if (data.children && data.children.length > 0) {
      for (let i = 0; i < data.children.length; i++) {
        if (flag) {
          break
        } else {
          if (data.children[i].key === key) {
            data.children[i] = value;
            flag = true
            return
          } else {
            this.editTree(data.children[i], key, flag, value)
          }
        }
      }
    }
  }

  setTimeType(x, y) {
    console.log(x);
  }

  created() {
    this.projectCode = this.$route.query.projectCode;
    this.projectId = this.$route.query.id;
    this.dataContract.projectId = this.projectId;
    this.dataContract.projectCode = this.projectCode;

    this.initBS();

  }

  mounted() {
  }

}
</script>

<style lang="less" scoped>
.code-manage-list-page {
  height: 100%;
  width: 100%;
  background-color: white;
  border: 1px solid #ddd;
  border-radius: 5px;
  position: relative;
}

.toool-btn {
  margin-right: 10px;
}

.zp-page-loaging {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  width: 100%;
  z-index: 2000;
  background-color: rgba(255, 255, 255, 0.5);
}
</style>


