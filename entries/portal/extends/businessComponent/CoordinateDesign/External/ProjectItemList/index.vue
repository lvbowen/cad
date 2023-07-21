<template>
  <div class="projectItemListWrap">
    <UserInfo @init="loadList"></UserInfo>
    <div class="projectItemListTitle">
      <a-icon @click="back" type="left" class="back"/>
      <span class="aufontAll projectItemListTitleIcon spaceLeft">&#xe8cf;</span>
      <span class="projectItemListTitleContent" @click="go">{{ projectName }}</span>
    </div>
    <a-tree
      :treeData="treeData"
      :loadData="loadData"
      :expandedKeys="expandedKeys"
      @expand="expand"
      @select="itemSelect"
      showIcon>
      <template
        #contextTitle="{title,activityName,release,total,receiveButton,activityCode,dataRef}">
        <a-dropdown :trigger="['contextmenu']">
          <span>{{ title }} <span
            v-if="activityName"
            :class="[activityName==='完成'?'statusGreen':'statusYellow']">{{
              activityName
            }}</span></span>
          <template #overlay>
            <a-menu>
              <a-menu-item
                :disabled="!receiveButton"
                @click="receiveTask(dataRef)"
                class="menuItem"
                key="1"
              >任务签收
              </a-menu-item>
              <a-menu-item
                class="menuItem"
                @click="addFileVerFolder(dataRef)"
                key="2"
                :disabled="activityCode!=='Activity3'||total>release">新增文件版本
              </a-menu-item>
            </a-menu>
          </template>
        </a-dropdown>
      </template>
      <template #fileTitle="{title,sequenceStatus,download,dataRef}">
        <a-dropdown :trigger="['contextmenu']">
          <span>{{ title }}
            <span v-if="dataRef.status">
              (<span
                :style="{color:dataRef.status==='成功'?'#32b683':dataRef.status==='转换中'?'#ffba00':'red'}">{{
                dataRef.status
              }}</span>)
            </span>
            <a-icon
              class="spaceLeft"
              @click.stop="deleteFile(dataRef)"
              v-if="sequenceStatus!=='COMPLETED'"
              type="delete"/>
            <a-tooltip title="查看模型" v-if="dataRef.lightweightAddress">
              <a-icon
                type="eye"
                class="spaceLeft"
                @click.stop="showModel(dataRef)"/>
            </a-tooltip>
            <a-tooltip
              title="刷新"
              v-if="!dataRef.schemaCode && (dataRef.name.indexOf('.rvt')>-1 || dataRef.name.indexOf('.dwg')>-1)&&dataRef.status!=='成功'">
              <a-icon
                type="sync"
                @click.stop="syncClick(dataRef)"
                class="spaceLeft"
                :spin="dataRef.spinFlag"/>
            </a-tooltip>
          </span>
          <template #overlay>
            <a-menu>
              <a-menu-item
                :disabled="!download"
                class="menuItem"
                key="2"><a :href="download">下载读取</a></a-menu-item>
              <a-menu-item
                :disabled="dataRef.status==='转换中' || dataRef.status==='成功' || dataRef.schemaCode || (!dataRef.name.indexOf('.dwg')===-1||!dataRef.name.indexOf('.rvt')===-1)"
                class="menuItem"
                key="5"
                @click="getTransferModel(dataRef)">轻量化转换
              </a-menu-item>
              <a-menu-item
                :disabled="dataRef.schemaCode||(!dataRef.name.indexOf('.dwg')===-1||!dataRef.name.indexOf('.rvt')===-1)||!dataRef.workload"
                class="menuItem"
                @click="workLoadClick(dataRef)"
                key="6">工程量查看
              </a-menu-item>
              <a-menu-item
                :disabled="dataRef.status==='转换中' || dataRef.status==='成功' || dataRef.schemaCode || (!dataRef.name.indexOf('.dwg')===-1||!dataRef.name.indexOf('.rvt')===-1)"
                class="menuItem"
                key="7"
                @click="getLocalTransferModel(dataRef)">轻量化转换（本地）
              </a-menu-item>
            </a-menu>
          </template>
        </a-dropdown>
      </template>
      <template #listIcon>
        <span class="aufontAll listIcon">&#xe8cf;</span>
      </template>
      <template #file>
        <a-icon type="file-text"/>
      </template>
      <template #folder>
        <a-icon type="folder" style="color:#F1B500" theme="filled"/>
      </template>
      <template #folderTitle="{title,sequenceStatus,loading,children,dataRef}">
        <template v-if="sequenceStatus==='COMPLETED'">
          <span>{{ title }}<span class="statusGreen">已提交</span></span>
        </template>
        <template v-else>
          <a-dropdown :trigger="['contextmenu']" :disabled="loading">
            <span>{{ title }} <span class="statusYellow">暂存草稿</span></span>
            <template #overlay>
              <a-menu v-if="sequenceStatus!=='COMPLETED'">
                <a-menu-item
                  @click="upFileandWorks(dataRef)"
                  class="menuItem"
                  key="1">文件及工作量上传
                </a-menu-item>
                <a-menu-item class="menuItem" key="2">
                  <a-upload
                    :name="upload.name"
                    :multiple="upload.multiple"
                    :action="upload.action"
                    :showUploadList="upload.showUploadList"
                    :beforeUpload="upload.beforeUpload"
                    @change="(info)=>upload.change(info,dataRef)"
                    :headers="upload.headers">
                    <span>新增上传文件</span>
                  </a-upload>
                </a-menu-item>
                <a-menu-item
                  @click="saveFile(dataRef)"
                  :disabled="children.length<=0"
                  class="menuItem"
                  key="3">暂存草稿
                </a-menu-item>
                <a-menu-item
                  @click="submiteFile(dataRef)"
                  :disabled="children.length<=0"
                  class="menuItem"
                  key="4">保存提交
                </a-menu-item>
              </a-menu>
            </template>
          </a-dropdown>
        </template>
      </template>
      <template #notation="{title,sequenceStatus,dataRef}">
        <a-dropdown :trigger="['contextmenu']">
          <span>{{ title }}
            <a-tooltip title="查看批注">
              <a-icon
                v-if="dataRef.lightweightAddress"
                type="eye"
                class="spaceLeft"
                @click.stop="showModel(dataRef)"/>
            </a-tooltip>
          </span>
          <template #overlay>
            <a-menu>
              <a-menu-item class="menuItem" key="1" @click="pointReduction(dataRef)">视点还原
              </a-menu-item>
              <a-menu-item class="menuItem" key="2" @click="seeClick(dataRef)">查看批注</a-menu-item>
            </a-menu>
          </template>
        </a-dropdown>
      </template>
    </a-tree>
    <a-modal
      :title="notationDetails.designFileName"
      :visible="visible"
      :footer="null"
      :dialogStyle="dialogStyle"
      wrapClassName="notation-modal"
      @cancel="handleCancel"
    >
      <div class="detail-content">
        <div class="body">
          <div class="notation-img full-width">
            <img :src="notationDetails.thumbnail" alt="">
          </div>
          <p>
            <img src="../../../../../src/assets/extends/CoordinateDesign/External/人物(1).png" alt="">
            批注人：
            <span style="color: #21b148">{{ notationDetails.checkerName }}</span>
          </p>
          <p>
            <img src="../../../../../src/assets/extends/CoordinateDesign/External/时间(1).png" alt="">
            批注时间：
            <span>{{ notationDetails.checkDate }}</span>
          </p>
          <div class="flex">
            <div>
              <img src="../../../../../src/assets/extends/CoordinateDesign/External/定位.png" alt="">
              场景坐标：
            </div>
            <div>
              <p><span>x轴({{ notationDetails.position && notationDetails.position.x }})</span></p>
              <p><span>y轴({{ notationDetails.position && notationDetails.position.y }})</span></p>
              <p><span>z轴({{ notationDetails.position && notationDetails.position.z }})</span></p>
            </div>
          </div>
          <div class="flex">
            <div>批注描述：</div>
            <div class="annotationDesc">{{ notationDetails.annotationDesc }}</div>
          </div>
        </div>
      </div>
    </a-modal>
    <a-modal
      :title="'工程量查看'"
      :visible="workLoad"
      :footer="null"
      :width="300"
      :dialogStyle="dialogStyle"
      @cancel="handleCancel"
    >
      <div class="work-content" v-for="(item,index) in workloadData" :key="index">
        <div>{{ item.name }}：{{ item.amount }}</div>
      </div>
    </a-modal>
  </div>
</template>

<script lang="ts">
import {Component, Vue, Prop, InjectReactive} from 'vue-property-decorator';
import {Icon, Tree, Dropdown, Menu, Upload, Modal, Tooltip} from "@h3/antd-vue";
import UserInfo from "../components/UserInfo.vue";
import env from '@/config/env';
import {
  professionTaskRecursive,
  retainByPc,
  save,
  replayToken,
  Retain,
  SubmitData,
  designTaskSubmitData,
  submit,
  designTaskInfo,
  DesignTaskInfo
} from "../../../../service/CoordinateDesign/External";
import {
  numberToChinese
} from "../../WorkingOutline/ProfessionalTask/ProfessionalDesignTask/numberToChinese";

type treeItem = { key: string, children?: treeItem[] };
import {
  getModelTrans,
  getTransferModel,
} from "../../../../service/CoordinateDesign/WorkingOutline/ProfessionalTask/ProfessionalDesignTask";
import Utils from "../../../../utils";
import axios from "axios";

@Component({
  name: "ProjectItemList",
  components: {
    UserInfo,
    [Icon.name]: Icon,
    [Tree.name]: Tree,
    [Tree.TreeNode.name]: Tree.TreeNode,
    [Dropdown.name]: Dropdown,
    [Menu.name]: Menu,
    [Menu.Item.name]: Menu.Item,
    [Upload.name]: Upload,
    [Modal.name]: Modal,
    [Tooltip.name]: Tooltip,
  }
})
export default class ProjectItemList extends Vue {
  @InjectReactive("project") appCode!: string;
  @Prop({required: true, type: String}) projectId!: string;
  @Prop({required: true, type: String}) projectName!: string;

  sjrwdId: string = '';

  treeKey = 100;
  expandedKeys: string[] = [];

  treeData:any[] = [
    // {title: '项目策划', key: '0', class: "blueTitle", slots: {icon: "listIcon"}, isLeaf: true},
    // {
    //   title: '专业任务',
    //   key: '1',
    //   class: "blueTitle",
    //   slots: {icon: "listIcon",},
    //   parseFunctionName: "getZYRWD"
    // },
    // {title: '中间资料', key: '2', class: "blueTitle", slots: {icon: "listIcon"}, isLeaf: true},
    // {title: '设计成果', key: '3', class: "blueTitle", slots: {icon: "listIcon"}, isLeaf: true},
    // {title: '外来资料', key: '4', class: "blueTitle", slots: {icon: "listIcon"}, isLeaf: true},
    // {title: '项目成员', key: '5', class: "blueTitle", slots: {icon: "listIcon"}, isLeaf: true},
    // {title: '项目进度', key: '6', class: "blueTitle", slots: {icon: "listIcon"}, isLeaf: true},
    // {title: '项目运行', key: '7', class: "blueTitle", slots: {icon: "listIcon"}, isLeaf: true},
  ]

  upload = {
    name: "file",
    multiple: true,
    action: `${env.apiHost}/api/aliyun/upload`,
    headers: {Authorization: 'Bearer ' + localStorage.token},
    showUploadList: false,
    beforeUpload: (file: File) => {
      return new Promise((resolve, reject) => {
        const isLt100M = file.size / 1024 / 1024 <= 100;
        // if (!isLt100M) {
        //   this.$message.error("只能上传不大于100M的文件");
        //   return reject(false);
        // }
        return resolve(true);
      });
    },
    change: (info, dataRef) => this.change(info, dataRef),
  };

  notationDetails: any = {
    position: {
      x: '',
      y: '',
      z: '',
    }
  };
  visible: boolean = false;
  workLoad: boolean = false;
  workloadData: Array<any> = [];
  zyrwdId: string = '';
  dialogStyle = {}

  userId: null | string = '';

  back() {
    this.$router.back();
  }

  expand(expandedKeys: string[]) {
    this.expandedKeys = expandedKeys;
  }

  loadData(treeNode) {
    if (treeNode.dataRef.title.indexOf('版') > -1) {
      this.zyrwdId = treeNode.dataRef.refreshId;
    }
    return new Promise(async (resolve, reject) => {
      if (treeNode.dataRef.children) {
        resolve(0);
        return;
      }
      await this.queryProfessionTaskRecursive(treeNode.dataRef);
      this.treeData = [...this.treeData];
      resolve(0);
    });
  }

  async queryProfessionTaskRecursive(treeData: any) {
    const {appCode, projectId} = this;
    try {
      let params = {appCode, projectId};
      const functionName = treeData["parseFunctionName"] as string;
      if (treeData.paramsName) {
        Object.defineProperty(params, treeData.paramsName, {value: treeData.id, enumerable: true});
      }
      const {errcode, errmsg, data} = await professionTaskRecursive(params);
      if (errcode) {
        return this.$message.error(`获取项目清单失败,${errmsg}`);
      }
      const parseData = this[functionName](data, treeData.id);
      treeData.children = parseData;
    } catch (error) {
      return this.$message.error(`获取项目清单异常,${error}`);
    }
  }

  getZYRWD(data: any, selectId) {
    let children: any[] = [];
    for (const key in data) {
      if (!Object.prototype.hasOwnProperty.call(data, key)) continue;
      const dataChildren: any[] = [];
      const values = data[key];
      for (const valueKey in values) {
        if (!Object.prototype.hasOwnProperty.call(values, valueKey)) continue;
        const value = values[valueKey];
        let valueChildren = [];
        if (value){
          valueChildren = value.map(item => {
            return {
              id: item.id,
              // title: item.name.split('-').reverse()[0],
              title: valueKey,
              key: item.id,
              class: "blueTitle",
              slots: {icon: "listIcon"},
              paramsName: "zyrwdId",
              parseFunctionName: "getZYRWDItem",
              routerName: "ProfessionalTask",
              link: true,
            }
          });
        }
        const valuesChildren = {
          title: valueKey,
          key: values.length > 0 ? (values[0].id + "1") : `${this.treeKey++}`,
          class: "blueTitle",
          slots: {icon: "listIcon"},
          children: valueChildren,
        }
        dataChildren.push(...valuesChildren.children);
      }
      children.push(...dataChildren);
    }
    return children;
  }

  getZYRWDItem(data: any, selectId) {
    console.log(data,'111')
    let parseData: any[] = [];
    for (const key in data) {
      if (!Object.prototype.hasOwnProperty.call(data, key)) continue;
      let dataChildrenKey = `${this.treeKey++}`;
      const values = data[key];
      if (data['设计任务'][0]) {
        this.sjrwdId = data['设计任务'][0].id;
      }
      if (values.length > 0) {
        dataChildrenKey = `${values[0].id}0`;
      }
      const children = values.map(item => {
        let fileChildren: any[] = [];
        if (item.achievements) {
          item.achievements.forEach(element => {
            const {sequenceStatus, version} = element;
            const fileVersion = {
              ...element,
              id: `${this.treeKey++}`,
              title: `第${numberToChinese(version??'')}版`,
              key: `${element.id}-${version}${version}`,
              class: "blueTitle",
              slots: {icon: "folder"},
              loading: false,
              scopedSlots: {title: "folderTitle"},
              refreshKey: dataChildrenKey,
              refreshId: selectId,
              children: [] as any[],
            }
            fileVersion.children = element.attachment && element.attachment.map(file => ({
              ...file,
              isLeaf: true,
              key: file.id,
              title: file.name,
              spinFlag: false,
              scopedSlots: {title: "fileTitle"},
              sequenceStatus
            }));
            if (element?.annotations ?? [].length > 0) {
              element?.annotations.map(item => {
                item['isLeaf'] = true;
                item['key'] = item.id;
                item['title'] = item.designFileName;
                item['scopedSlots'] = {title: "notation"};
                item['sequenceStatus'] = sequenceStatus;
              })
              fileVersion.children.push({
                key: `${this.treeKey++}`,
                title: '模型批注',
                scopedSlots: {title: "notationTitle"},
                slots: {icon: "folder"},
                children: element.annotations,
                loading: false,
              })
            }
            fileChildren.push(fileVersion);
          });
        }
        return {
          id: item.id,
          title: key === "专业设计提纲" ? item.professionName : item.professionTaskName,
          key: item.id,
          class: "blueTitle",
          slots: {icon: "file"},
          scopedSlots: {title: "contextTitle"},
          activityCode: item.activityCode,
          activityName: item.activityName,
          receiveButton: item.receiveButton,
          retainButton: item.retainButton,
          submitButton: item.submitButton,
          achievements: item.achievements,
          total: item.total ?? 0,
          release: item.release ?? 0,
          children: fileChildren,
          routerName: key === "专业设计提纲" ? "ProfessionalDesignOutline" : "ProfessionalDesignTask",
          link: true,
          isLeaf: fileChildren.length > 0 ? false : true,
          refreshKey: dataChildrenKey,
          refreshId: selectId,
        }
      });
      const dataChildren = {
        title: key,
        key: dataChildrenKey,
        class: "blueTitle",
        slots: {icon: "listIcon"},
        children: children,
      };
      parseData.unshift(dataChildren);
    }
    return parseData;
  }

  addFileVerFolder(dataRef) {
    if (dataRef.activityCode !== "Activity3") return;
    const key = `${dataRef.id}-${dataRef.release + 1}`;
    dataRef.children.push({
      id: key,
      title: `第${numberToChinese(dataRef.release + 1)}版`,
      key: key,
      class: "blueTitle",
      slots: {icon: "folder"},
      scopedSlots: {title: "folderTitle"},
      sequenceStatus: "DRAFT",
      version: dataRef.release + 1,
      sjrwdId: dataRef.id,
      children: [] as any[],
      loading: false,
      isLeaf: true,
      refreshKey: dataRef.refreshKey,
      refreshId: dataRef.refreshId,
    });
    dataRef.total += 1;
    if (dataRef.isLeaf === true) {
      dataRef.isLeaf = false;
    }
    if (!this.expandedKeys.includes(dataRef.key)) {
      this.expandedKeys.push(dataRef.key);
    }
    this.treeData = [...this.treeData];
  }

  async change(info, dataRef) {
    if (info.file.status === 'uploading') {
      dataRef.loading = true;
    } else if (info.file.status === 'done') {
      dataRef.loading = false;
      if (info.file.response.errcode) {
        this.$message.error(`上传文件[${info.file.name}]失败`);
      } else {
        const key = `${this.treeKey++}`;
        dataRef.children.push({
          ...info.file.response.data,
          isLeaf: true,
          key,
          title: info.file.response.data.name,
          scopedSlots: {title: "fileTitle"},
          sequenceStatus: "DRAFT"
        })
        if (dataRef.isLeaf) {
          dataRef.isLeaf = false;
        }
        if (!this.expandedKeys.includes(dataRef.key)) {
          this.expandedKeys.push(dataRef.key);
        }
        this.treeData = [...this.treeData];
      }
    } else if (info.file.status === "error") {
      dataRef.loading = false;
      this.$message.error(`上传文件[${info.file.name}]失败`);
    } else {
      dataRef.loading = false;
      this.$message.error(`上传文件[${info.file.name}]失败,未知错误`);
    }
  }

  /*查看模型*/
  showModel(dataRef) {
    const {origin} = location;
    console.log(origin, 'origin', dataRef.lightweightAddress);
    window.open(origin + dataRef.lightweightAddress, '_blank');
  }

  /*刷新*/
  syncClick(dataRef) {
    getModelTrans({
      appCode: this.appCode ?? '',
      id: dataRef.id,
    }).then((res) => {
      if (res.errcode !== 0) return this.$message.error(res.errmsg as string);
      //@ts-ignore
      Utils.deepFind(
        this.treeData,
        (i) => {
          if (dataRef.id === i.id) {
            i.spinFlag = true;
            //@ts-ignore
            i['status'] = res?.data?.status;
            if (i['status'] === '成功') {
              //@ts-ignore
              i['engineProjectId'] = res?.data?.vaultId;
              //@ts-ignore
              i['engineModelId'] = res?.data?.modelId;
              //@ts-ignore
              i['lightweightAddress'] = res?.data?.lightweightAddress;
            }
          }
          return false;
        },
        "children"
      );
    })
      .finally(() => {
        setTimeout(() => {
          dataRef.spinFlag = false;
        }, 300)
      })
  }

  deleteFile(dataRef) {
    const data = this.findParentsByKey(this.treeData, dataRef.key);
    if (data) {
      const index = data.children?.findIndex(item => item.key === dataRef.key) as number;
      if (index > -1) data.children?.splice(index, 1);
      this.treeData = [...this.treeData];
    }
  }

  findParentsByKey(datas: treeItem[], key: string): treeItem | null {
    let data: treeItem | null = null;
    for (let index = 0; index < datas.length; index++) {
      const element = datas[index];
      if (element.children) {
        if (element.children.some(item => item.key === key)) {
          data = element;
        } else {
          if (element.children.length > 0) {
            data = this.findParentsByKey(element.children, key)
          }
        }
      }
      if (data) {
        break;
      }
    }
    return data;
  }

  async saveFile(dataRef) {
    const {appCode} = this;
    const {sjrwdId, children, version} = dataRef;
    try {
      const {data: token} = await replayToken();
      const {errcode, errmsg, data} = await retainByPc({appCode, sjrwdId});
      if (errcode) {
        return this.$message.error(`暂存文件失败,${errmsg}`);
      }
      const saveData = data as Retain;
      saveData.replayToken = token as string;
      saveData.bizObject.data.version = version + '';
      saveData.bizObject.data.XTSJ_design_file = children.map(item => {
        return {
          engine_file_name: item.engineFileName,
          engine_model_id: item.engineModelId,
          engine_project_id: item.engineProjectId,
          file_address: null,
          file_name: item.name,
          file_type: item.name.split('.').reverse()[0],
          id: item.id,
          lightweight_address: item.lightweightAddress === '' ? null : item.lightweightAddress,
          upload_date: null,
          attachments: [item],
          workload: item.workload,
          feature_extension: item.featureExtension,
          person_id: item.personId,
          status: item.status,
        }
      })
      const {errcode: code, errmsg: msg} = await save(saveData);
      if (code) {
        return this.$message.error(`暂存文件失败,${msg}`);
      }
      //刷新数据
      const {refreshId, refreshKey, key} = dataRef;
      const nodeData = this.findParentsByKey(this.treeData, refreshKey) as treeItem;
      const currentNode = this.findParentsByKey(this.treeData, key) as treeItem;
      delete nodeData.children;
      await this.loadData({dataRef: nodeData});
      this.$message.success("暂存文件完成");
    } catch (error) {
      return this.$message.error(`暂存文件异常,${error}`)
    }
  }

  async submiteFile(dataRef) {
    const {appCode} = this;
    const {sjrwdId, children, version} = dataRef;
    try {
      //提交文件
      const {data: token} = await replayToken();
      const {errcode, errmsg, data} = await designTaskSubmitData({appCode, sjrwdId});
      if (errcode) {
        return this.$message.error(`提交文件失败,${errmsg}`);
      }
      const submitData = data as SubmitData;
      submitData.replayToken = token as string;
      submitData.bizObject.data.version = version + '';
      submitData.bizObject.data.XTSJ_design_file = children.map(item => {
        return {
          engine_file_name: item.engineFileName,
          engine_model_id: item.engineModelId,
          engine_project_id: item.engineProjectId,
          file_address: null,
          file_name: item.name,
          file_type: item.name.split('.').reverse()[0],
          id: item.id,
          lightweight_address: null,
          upload_date: null,
          attachments: [item],
          workload: item.workload,
          feature_extension: item.featureExtension,
          person_id: item.personId,
          status: item.status,
        }
      })
      const {errcode: code, errmsg: msg} = await submit(submitData);
      if (code) {
        return this.$message.error(`提交文件失败,${msg}`);
      }
      //提交流程
      const {data: tokenNew} = await replayToken();
      const designTaskInfoResult = await designTaskInfo({appCode, sjrwdId});
      if (designTaskInfoResult.errcode) {
        return this.$message.error(`提交文件失败,${designTaskInfoResult.errmsg}`);
      }
      const submitDataNew = designTaskInfoResult.data as DesignTaskInfo;
      submitDataNew.replayToken = tokenNew as string;
      const submitResult = await submit(submitDataNew);
      if (submitResult.errcode) {
        return this.$message.error(`提交文件失败,${submitResult.errmsg}`);
      }
      //刷新数据
      const {refreshId, refreshKey, key} = dataRef;
      const nodeData = this.findParentsByKey(this.treeData, refreshKey) as treeItem;
      const currentNode = this.findParentsByKey(this.treeData, key) as treeItem;
      delete nodeData.children;
      await this.loadData({dataRef: nodeData});
      this.$message.success("提交文件完成");
    } catch (error) {
      return this.$message.error(`提交文件异常,${error}`)
    }
  }

  fileDownload(download) {
    window.open(download, "_blank");
  }

  itemSelect(selectedKeys, {node: {dataRef}}) {
    const {link, id, routerName} = dataRef;
    if (link && link === true) {
      const {origin} = location;
      if (dataRef.paramsName === 'zyrwdId') {
        const {href} = this.$router.resolve({
          name: routerName,
          query: {
            projectId: this.projectId,
          }
        })
        window.open(`${origin}${href}`, "_blank");
      } else {
        const {href} = this.$router.resolve({
          name: routerName,
          query: {
            projectId: this.projectId,
            id,
          }
        })
        window.open(`${origin}${href}`, "_blank");
      }
    }
  }

  async receiveTask(dataRef) {
    const {appCode} = this;
    const {id: sjrwdId} = dataRef;
    try {
      const {data: token} = await replayToken();
      const designTaskInfoResult = await designTaskInfo({appCode, sjrwdId});
      if (designTaskInfoResult.errcode) {
        return this.$message.error(`任务签收失败,${designTaskInfoResult.errmsg}`);
      }
      const submitDataNew = designTaskInfoResult.data as DesignTaskInfo;
      submitDataNew.replayToken = token as string;
      const submitResult = await submit(submitDataNew);
      if (submitResult.errcode) {
        return this.$message.error(`任务签收失败,${submitResult.errmsg}`);
      }
      //刷新数据
      const {refreshId, refreshKey, key} = dataRef;
      const nodeData = this.findParentsByKey(this.treeData, refreshKey) as treeItem;
      delete nodeData.children;
      await this.loadData({dataRef: nodeData});
      this.$message.success("任务签收完成");
    } catch (error) {
      return this.$message.error(`任务签收异常,${error}`)
    }
  }

  /*查看批注*/
  seeClick(item) {
    this.notationDetails = item;
    this.visible = true;
  }

  handleCancel() {
    this.visible = false;
    this.workLoad = false;
  }

  /*轻量化转换*/
  getTransferModel(item) {
    if (item.status === '转换中') return this.$message.warning('转换中');
    if (item.status === '成功') return this.$message.success('转换成功！');
    //轻量化转换
    getTransferModel({
      appCode: this.appCode ?? '',
      url: item.download,
      name: item.name,
      vaultId: this.sjrwdId,
      filed: item.id
    }).then((res) => {
      if (res.errcode !== 0) return this.$message.error(res.errmsg as string)
      if (!res.data) return;
      this.$message.success('转换成功！')
    })
  }

  /*轻量化转换（本地）*/
  getLocalTransferModel(item) {
    try {
      console.log(item, '轻量化转换（本地）')
      // axios.get( 'http://10.20.53.11:9984/Vault/CreateVault', {
      //   params: {
      //     VaultID: this.sjrwdId??'',
      //   },
      // })
      //   .then(res=>{
      //   console.log('CreateVault==>',res)
      // })
      //   .catch((error)=>{
      //     console.log(error,'error')
      //   })
      console.log('url==>', item.download);
      const posturl = `${env.host}/api/api/xtsjProject/systemManage/callBackModelV1`
      console.log('posturl==>', posturl);
      console.log('vaultId==>', this.sjrwdId);
      console.log('fileId==>', item.id);
      //@ts-ignore
      let txt = jsdesigntool.rvt2mvup(item.download, posturl, this.sjrwdId, item.id);
      console.log(txt, 'rvt2mvup')
    } catch (error) {
      console.log(`error==>${error}`)
      this.$message.warning(`本地环境缺少REVIT/CAD组件，无法操作！`)
    }
  }

  /*视点还原*/
  pointReduction(item) {
    try {
      console.log(item, '视点还原');
      console.log('url==>', item.download);
      const cameraInfo = JSON.parse(item.cameraInfo);
      console.log(cameraInfo, 'cameraInfo');
      const position: any = [];
      for (let key in cameraInfo.position) {
        console.log('position', key, ':', cameraInfo.position[key])
        position.push(cameraInfo.position[key])
      }
      const target: any = [];
      for (let key in cameraInfo.target) {
        console.log('target', key, ':', cameraInfo.target[key])
        target.push(cameraInfo.target[key])
      }
      console.log('position==>', position);
      console.log('target==>', target);
      const offset = item.featureExtension.split(",").map(item => Number(item));
      console.log('offset==>', offset)
      //@ts-ignore
      let txt = jsdesigntool.viewpointback(item.download, position, target, offset);
      console.log(txt, 'viewpointback');
    } catch (error) {
      console.log(`error==>${error}`)
      this.$message.warning(`本地环境缺少REVIT/CAD组件，无法操作！`)
    }
  }

  /*工程量查看*/
  workLoadClick(item) {
    this.workLoad = true;
    this.workloadData = item.workloadData;
  }

  /*文件及工作量上传*/
  async upFileandWorks(item) {
    try {
      const version = item.version.toString()
      console.log(item, '文件及工作量上传');
      console.log(`url==>${env.host}/api/api/xtsjProject/systemManage/uploadAchievementWithWorkload`,)
      console.log('version==>', version)
      console.log('sjrwdId==>', item.sjrwdId)
      console.log('userId==>', this.userId)
      //@ts-ignore
      let txt = jsdesigntool.upfileandworks(`${env.host}/api/api/xtsjProject/systemManage/uploadAchievementWithWorkload`, false, version, item.sjrwdId, this.userId)
      console.log(txt, 'upfileandworks');
      //刷新数据
      const {refreshId, refreshKey, key} = item;
      const nodeData = this.findParentsByKey(this.treeData, refreshKey) as treeItem;
      const currentNode = this.findParentsByKey(this.treeData, key) as treeItem;
      delete nodeData.children;
      await this.loadData({dataRef: nodeData});
    } catch (error) {
      console.log(`error==>${error}`)
      this.$message.warning(`本地环境缺少REVIT/CAD组件，无法操作！`)
    }
  }

  go() {
    const {origin} = location;
    const {href} = this.$router.resolve({
      name: 'ProductionTaskList',
      query: {
        projectId: this.projectId,
      }
    })
    window.open(`${origin}${href}`, "_blank");
  }

  mounted() {
    this.init()
  }
  loadList() {
    window.location.reload()
  }

  async init() {
    this.treeData = [];
    const user = sessionStorage.getItem("user")
    if (user) {
      this.userId = JSON.parse(user).id ?? "";
    }
    const {data, errcode, errmsg} = await professionTaskRecursive({
      appCode: this.appCode,
      projectId: this.projectId ?? ''
    })
    if(errcode!==0) return this.$message.error(errmsg as string)
    if(!data) return;
    this.treeData = this.getZYRWD(data,'');
  }
}
</script>

<style lang="less" scoped>
@import "../../../../styles/public.module.less";
@import url("../../../../../src/assets/icons/iconfont.css");
/deep/ .notation-modal {
  .ant-modal {
    width: 1200px !important;
    overflow: hidden;
    .notation-img {
      overflow: auto;
    }
    .ant-modal-body {
      height: 700px;
      overflow: auto;
    }
  }
}
.bpm-container {
  min-width: unset !important;;
}

.projectItemListWrap {
  padding: 10px
}

.projectItemListTitle {
  color: #333333;

  .projectItemListTitleIcon {
    vertical-align: middle;
  }

  .projectItemListTitleContent {
    font-size: 14px;
    font-weight: 700;
    font-family: Source Han Sans CN;
    color: #333333;
    cursor: pointer;
    &:hover {
      opacity: 0.9;
      border-bottom: 1px solid #303133;
    }
  }
}

.listIcon {
  color: #0A28A9;
}

/deep/ .blueTitle {
  .ant-tree-title {
    color: #0A28A9;

  }


}

.menuItem {
  font-family: "Source Han Sans CN";
  line-height: 24px;
}

.statusGreen,
.statusYellow {
  padding: 1px 2px;
  .spaceLeft
}

.statusGreen {
  background-color: #03AB23;
}

.statusYellow {
  background-color: #FFBA00;
}

.spaceLeft {
  margin-left: 10px;
}

.back {
  cursor: pointer;

  &:hover {
    color: #5291ff;
  }
}

.detail-content {
  position: relative;
  width: 100%;
  min-height: 30vh;

  .body {
    //position: absolute;
    //top: 0;
    //left: 0;
    //bottom: 0;
    //right: 0;
    //margin: auto;
  }

  p {
    line-height: 26px;
  }


  span {
    font-weight: bold;
  }

  .annotationDesc {
    width: 200px;
    font-weight: bold;
    line-height: 26px;
  }
}

.work-content {
  width: 100%;
  max-height: 30vh;
  overflow: auto;
  .scrollbar-default;
}

/deep/ .ant-modal-header {
  background-color: #ececec;
}
</style>
