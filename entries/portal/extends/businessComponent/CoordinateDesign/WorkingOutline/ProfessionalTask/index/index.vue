<template>
  <div class="wrap">
    <a-collapse
      v-model="activeKey"
      expandIconPosition="right"
      :bordered="false"
      @change="changeActiveKey"
    >
      <a-collapse-panel key="1" :showArrow="false">
        <template #header>
          <div class="flex" style="width: 100%">
            <div class="header-title flex flex-center-align flex-space-between">
              <span>专业任务单</span>
              <div class="flex flex-center-align all-box">
                <a-checkbox :checked="checkedAll" @change="changeCheckState"></a-checkbox>
                <span class="search-label"><b>查看全部</b></span>
                <a-tooltip>
                  <template slot="title"
                    >注意：默认只显示当前用户的专业任务单，勾选“查看全部”可查看此项目所有专业任务单！</template
                  >
                  <a-icon type="question-circle"></a-icon>
                </a-tooltip>
              </div>
            </div>
          </div>
        </template>
        <!-- <a-button type="primary" @click="OneTouch" :disabled="!designTaskPermissions.create">一键生成</a-button> -->
        <a-table
          class="zyrwTable"
          :locale="{
            emptyText: !checkedAll
              ? '当前用户暂无专业任务单，若想查看此项目所有专业任务单，请勾选“查看全部”！！！'
              : '暂无数据！',
          }"
          rowKey="id"
          size="small"
          :columns="ProfessionalTaskColumns"
          :dataSource="ProfessionalTaskList"
          :pagination="pagination"
          :rowClassName="rowClassName"
          :customRow="customRow"
          bordered
        >
          <template #ProfessionalName="text, record">
            <a-button :class="{ colorWhite: record.id === selectId }" type="link">{{
              text
            }}</a-button>
          </template>
          <template #CurrentState="text, record">
            <span :class="[record.id === selectId ? 'colorWhite' : 'colorRed']">{{ text }}</span>
          </template>
          <template #ProfessionalOutline="text, record">
            <a-checkbox
              :class="{ colorWhite: record.id === selectId }"
              :checked="record.outlineFlag === 'true'"
              >必须</a-checkbox
            >
          </template>
          <template #calculation="text, record">
            <a-checkbox
              :class="{ colorWhite: record.id === selectId }"
              :checked="record.calculationFlag === 'true'"
              >必须</a-checkbox
            >
          </template>
          <template #actions="text, record">
            <div>
              <a-button
                v-if="record.submitButton"
                @click.stop="actionClick(record, 0)"
                class="action"
                :class="{ colorWhite: record.id === selectId }"
                type="link"
                >提交</a-button
              >
              <a-button
                v-if="record.receiveButton"
                @click.stop="actionClick(record, 1)"
                class="action"
                :class="{ colorWhite: record.id === selectId }"
                type="link"
                >接收</a-button
              >
              <a-button
                v-if="record.rejectButton"
                @click.stop="actionClick(record, 2)"
                class="action"
                :class="{ colorWhite: record.id === selectId }"
                type="link"
                >驳回</a-button
              >
            </div>
          </template>
        </a-table>
      </a-collapse-panel>
      <a-collapse-panel key="2">
        <template #header>
          <div class="flex header-menu" style="width: 100%">
            <div
              class="menu-item"
              @click.stop="menuClick(1)"
              :class="activeMen === 1 ? 'activeMenColor' : ''"
            >
              <div>设计任务单</div>
              <div class="bottom-border"></div>
            </div>
            <div
              class="menu-item"
              @click.stop="menuClick(0)"
              :class="activeMen === 0 ? 'activeMenColor' : ''"
            >
              <div>专业设计提纲</div>
              <div class="bottom-border"></div>
            </div>
          </div>
        </template>
        <a-tabs v-model="tabsActiveKey">
          <a-tab-pane key="tab0" tab="Tab1">
            <div class="flex" style="padding: 10px 0">
              <div>
                <a-button
                  :disabled="data.length > 0 || !designOutlinePermissions.create"
                  type="primary"
                  style="width: 60px"
                  @click="professionalDesignOutlineAdd"
                  >新增</a-button
                >
                <!-- <a-button style="width: 60px; margin: 0 10px">导入</a-button> -->
              </div>
              <!-- <div class="before-fgx">
                <a-button style="width: 60px">分派</a-button>
                <a-button style="width: 80px; margin: 0 10px">批量下达</a-button>
                <a-button style="width: 80px">修改任务</a-button>
              </div> -->
            </div>
            <a-table
              rowKey="id"
              :bordered="true"
              :pagination="false"
              :columns="columns"
              :dataSource="data"
              :expandedRowKeys="expandedRowKeys"
              @expand="(expanded, record) => expand(expanded, record, 'expandedRowKeys')"
              :expandIcon="customExpandIcon"
              :customRow="customRowDesignOutline"
              :scroll="{ y: 440 }"
            >
              <template #DesignTaskName="text">
                <span style="color: red">{{ text }}</span>
              </template>
            </a-table>
          </a-tab-pane>
          <a-tab-pane key="tab1" tab="Tab2">
            <div class="flex-space-between" style="padding: 10px 0">
              <div class="designButtons">
                <a-button
                  @click="createDesignTask"
                  type="primary"
                  :disabled="!designTaskPermissions.create"
                  class="designButton"
                  >新增</a-button
                >
                <a-button
                  @click="batchCreateDesignTask"
                  type="primary"
                  :disabled="batchCreateStatus"
                  class="designButton"
                  >一键生成</a-button
                >
                <a-button
                  type="primary"
                  :disabled="!designTaskPermissions.create"
                  class="designButton"
                  @click="showDesignTaskModal = true"
                >
                  一键导入
                </a-button>
                <a-button
                  type="primary"
                  @click="exportDesignTask"
                  :loading="exportLoading"
                  :disabled="!designTaskPermissions.create"
                  class="designButton"
                  >一键导出</a-button
                >
                <a-button
                  @click="batchCreate"
                  type="primary"
                  :disabled="!designTaskPermissions.create"
                  class="designButton"
                  >一键下达</a-button
                >
                <a-button
                  @click="batchModify"
                  type="primary"
                  :disabled="!designTaskPermissions.create"
                  class="designButton"
                >
                  批量修改
                </a-button>
                <a-tooltip overlayClassName="overlayClassName">
                  <template slot="title">
                    批量修改必填提示: 设计人、校核人、审核人为必填项；<br />
                    需要设计指导时，设计指导必填；<br />
                    需要会签时，会签人必填；<br />
                    校审级别为部门主管总工时，部门主管总工必填；<br />
                    校审级别为院主管总工时，部门主管总工、院主管总工必填；<br />
                    需要项目经理审核，项目经理必填。
                  </template>
                  <a-icon type="exclamation-circle"></a-icon>
                </a-tooltip>
                <span class="line"></span>
                <a-button
                  @click="batchDelete"
                  type="primary"
                  :disabled="!designTaskPermissions.create"
                  class="designButton"
                  >批量删除</a-button
                >
              </div>
              <div class="flex flex-center-align">
                <a-input-search
                  placeholder="请输入关键字搜索"
                  enterButton
                  @search="onSearchDesignTask"
                />
                <a-select
                  v-model="designStatus"
                  allowClear
                  :options="options"
                  style="width: 200px; margin: 0 10px"
                ></a-select>
                <a-icon
                  type="fullscreen"
                  @click="
                    () => {
                      fullTable = true;
                      scrollTableX = 850;
                      scrollTableY = 750;
                    }
                  "
                ></a-icon>
              </div>
            </div>
            <a-table
              :class="!fullTable ? 'myTable' : 'myTable full-my-table'"
              rowKey="id"
              bordered
              :pagination="false"
              :columns="designTaskColumns"
              :dataSource="designTaskDataFilter"
              :expandIcon="customExpandIcon"
              :expandedRowKeys="designTaskExpandedRowKeys"
              :rowSelection="designTaskRowSelection"
              :key="designTaskKey"
              :loading="designTaskLoading"
              @expand="(expanded, record) => expand(expanded, record, 'designTaskExpandedRowKeys')"
              :customRow="customRowDesignTask"
              :scroll="{ y: scrollTableY, x: scrollTableX }"
            >
              <template v-slot:title v-if="fullTable">
                <a-icon
                  type="fullscreen-exit"
                  @click="
                    () => {
                      fullTable = false;
                      scrollTableX = 1800;
                      scrollTableY = 440;
                    }
                  "
                ></a-icon>
              </template>
              <template #taskName="text, record">
                <span :title="text" v-if="record.children" style="color: #5e93ff">{{ text }}</span>
                <span :title="text" v-else style="color: red; cursor: pointer">{{ text }}</span>
                <!-- <span v-if="record.children" :title="text" style="width:100%;text-overflow:ellipsis;overflow: hidden;white-space:nowrap;color:#5e93ff">{{ text }}</span>
                <span v-else :title="text" style="width:100%;text-overflow:ellipsis;overflow: hidden;white-space:nowrap;color:red">{{ text }}</span> -->
              </template>
              <template #state="text">
                <span style="color: #64b7ee" v-if="text == '生成中' || text == '待接收 '">{{
                  text
                }}</span>
                <span style="color: #49db52" v-else-if="text == '已归档'">{{ text }}</span>
                <span style="color: #d0cf32" v-else>{{ text }}</span>
              </template>
              <template
                v-for="col in [
                  'designer',
                  'designGuider',
                  'checkor',
                  'auditor',
                  'projectManager',
                  'countersigned',
                ]"
                :slot="col"
                slot-scope="text, record, index"
              >
                <span
                  v-if="text && Array.isArray(text) && text.length > 1"
                  style="color: yellow"
                  :key="col"
                >
                  <staff-selector
                    :options="personOptionsSingle"
                    :disabled="false"
                    @change="(val) => onValueChangePerson(val, record.id, col)"
                    :value="text"
                  />
                </span>
                <span v-else :key="col">{{ formatSelector(record[col]) }} </span>
              </template>
              <template #action="text, record">
                <a-button
                  @click="designTaskView(record.id)"
                  v-show="!record.children && !record.editable"
                  size="small"
                  type="link"
                  >查看</a-button
                >
                <a-button
                  v-show="!record.children && record.editable"
                  @click="designTaskDelete(record.id, record)"
                  size="small"
                  type="link"
                  >删除</a-button
                >
              </template>
            </a-table>
          </a-tab-pane>
        </a-tabs>
      </a-collapse-panel>
    </a-collapse>
    <a-modal
      :afterClose="afterClose"
      :okText="okText"
      :destroyOnClose="true"
      :confirmLoading="confirmLoading"
      :wrapClassName="selectRecord && selectRecord.actionIndex !== 1 ? '' : 'modalWrap'"
      v-model="visible"
      @ok="modalOK"
      centered
    >
      <a-form-model
        v-if="selectRecord && selectRecord.actionIndex !== 1"
        ref="modalForm"
        :model="modalForm"
        :rules="modalRules"
      >
        <a-form-model-item required prop="comment">
          <a-textarea
            placeholder="意见/建议"
            v-model.trim="modalForm.comment"
            allowClear
            :autoSize="{ minRows: 4, maxRows: 6 }"
          />
        </a-form-model-item>
      </a-form-model>
      <div v-if="this.commonReplys && selectRecord && selectRecord.actionIndex !== 1">
        <div style="margin-bottom: 10px">常用意见</div>
        <div>
          <a-tag
            v-for="(item, index) in commonReplys.replys"
            :key="index"
            @click="tagChange(item)"
            style="margin-right: 10px; padding: 0 10px"
            >{{ item }}</a-tag
          >
        </div>
      </div>
      <template #title>
        <a-icon style="padding-right: 5px" type="question-circle" theme="twoTone" />
        <span>{{ modalTitle }}</span>
      </template>
    </a-modal>
    <AddDesignTask
      @batchModify="batchModifyAction"
      v-model="addDesignTaskVisible"
      :projectId="projectId"
      :showItems="showItems"
      :totalCount="totalCount"
      :selectItemNames="selectItemNames"
      :sjrwdId="selectId"
    ></AddDesignTask>
    <CreateDesignTask
      @affterCreated="affterCreatedDesignTask"
      @closeAddDesignModal="closeAddDesignModal"
      v-model="createDesignTaskVisible"
      :renderFormData="updateDesignTaskForm"
      @updateDesignTask="updateDesignTask"
      :projectId="projectId"
      :sjrwdId="selectId"
    ></CreateDesignTask>
    <ItemSelect @affterItemSelect="affterItemSelect" v-model="itemSelectVisible"></ItemSelect>
    <a-modal
      title="导入设计任务单信息"
      v-model="showDesignTaskModal"
      :keyboard="false"
      :footer="null"
      destroyOnClose
      @cancel="closeDesignTaskModal"
      :maskClosable="false"
    >
      为确保上传数据与导入设计任务单信息内容匹配，请先<a @click="downloadTemplate">下载示例文件</a
      ><br /><br />
      上传本地文件：
      <a-button type="primary" :loading="uploadLoading" @click="importDesignTaskInfoTemplate"
        >点击上传</a-button
      >
    </a-modal>
    <input
      class="file-input"
      ref="fileInput"
      :key="inputKey"
      type="file"
      accept="xlsx,xls"
      @change="(e) => fileInput(e)"
    />
    <a-modal
      v-model="showErrorMes"
      title="存在必填项未填写，请按照提示修改之后再重新一键下达！"
      wrapClassName="err-modal"
      :destroyOnClose="true"
      :footer="null"
    >
      <a-table :dataSource="errorDesignTask" :columns="errorDesignTaskColumns">
        <template #index="t, r, index">{{ index + 1 }}</template>
        <template #errorMsg="t, r">
          <template v-if="t && Array.isArray(t)">
            <div
              v-for="(i, index) in t"
              :key="index"
              :class="(index + 1) % 4 ? 'inline-block' : ''"
            >
              <span class="err-class">{{ i }}</span
              >；
            </div>
          </template>
        </template>
      </a-table>
    </a-modal>
  </div>
</template>
<script src="./index.ts" />
<style lang="less" scoped>
@import url("./index.less");
@import "../../../../../styles/table.modules.less";
</style>
<style>
.overlayClassName {
  min-width: 400px;
}
</style>
