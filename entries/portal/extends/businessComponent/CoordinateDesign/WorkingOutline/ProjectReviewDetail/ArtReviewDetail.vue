<template>
  <div class="professionalDesignOutlineWrap">
    <header class="myHeader flex flex-space-between">
      <div class="flex flex-center-align">
        <a-icon @click="back" class="headerIcon" type="left" />
        <div class="headerTitle">技术方案详情页</div>
      </div>
    </header>
    <div class="clearfix">
      <div class="left buttonLinks">
        <span
          class="buttonLink"
          :class="{ active: leftButtonLinks.activeIndex === index }"
          v-for="(item, index) in leftButtonLinks.buttonLinks"
          :key="index"
          @click="leftButtonClick(index)"
        >{{ item.name }}</span
        >
      </div>
      <div class="right" v-if="leftButtonLinks.activeIndex === 0">
        <a-button
          type="primary"
          style="margin-right: 10px"
          @click="deriveExport"
          :loading="downloadLoading"
          v-show="deriveButton">导出</a-button>
        <template v-for="(button, index) in rightButtonLinks">
          <a-button
            v-if="formData.data[button.visibleKey]"
            class="buttonLink"
            :key="index"
            @click="actionButtonClick(button)"
            :type="button.type"
          >{{ button.name }}</a-button
          >
        </template>
      </div>
      <!-- <a-button type="primary">导出</a-button> -->
    </div>
    <application-list v-show="false" class="divide" />
    <div class="professionalDesignOutlineContent">
      <div v-if="leftButtonLinks.activeIndex === 0">
        <a-form-model
          labelAlign="left"
          ref="modalForm"
          :model="formData.data"
          :rules="formData.rules"
        >
          <a-collapse
            :defaultActiveKey="['2', '3', '4']"
            :bordered="false"
            expandIconPosition="right"
          >
            <a-collapse-panel key="1">
              <template #header>
                <div class="collapseHeader">
                  <div class="collapseHeaderTitle left">审批记录</div>
                  <div
                    v-if="workFlowInfo.participants[0]"
                    class="collapseHeaderNode collapseHeaderItem left"
                  >
                    当前节点:<em>{{ workFlowInfo.participants[0].activityName }}</em>
                  </div>
                  <div
                    v-if="workFlowInfo.participants[0]"
                    class="collapseHeaderHandle collapseHeaderItem left"
                  >
                    当前处理人:<em
                      v-for="(item, index) in workFlowInfo.participants[0].participants"
                      :key="index"
                    >{{ item.name }}</em
                    >
                  </div>
                  <div
                    v-if="workFlowInfo.status"
                    class="collapseHeaderWorkflow collapseHeaderItem left"
                  >
                    流程追踪:<em>{{ getSequenceString(workFlowInfo.status) }}</em>
                  </div>
                  <div class="collapseHeaderTime collapseHeaderItem left">
                    已用时<em v-show="usedDays > 0">{{ usedDays }}</em
                    ><i v-show="usedDays > 0">天</i
                    ><em v-show="usedDays > 0 || usedHours > 0">{{ usedHours }}</em
                    ><i v-show="usedDays > 0 || usedHours > 0">小时</i><em>{{ usedMinutes }}</em
                    ><i>分钟</i>
                  </div>
                </div>
              </template>
              <!-- 审批记录流程图 -->
              <Approval
                :key="approvalKey"
                v-if="formData.data.workflowInstanceId !== null || ''"
                :workflowInstanceId="formData.data.workflowInstanceId"
              >
              </Approval>
            </a-collapse-panel>

            <a-collapse-panel key="2" class="collapsepanel3">
              <template #header>
                <div class="collapseHeader">
                  <div class="collapseHeaderTitle floatLeft">项目基本信息</div>
                </div>
              </template>
              <!-- 生产任务单 -->
              <div class="rowFlexWrap">
                <a-form-model-item
                  v-if="itemShow('projectId')"
                  :colon="false"
                  class="fullRowFlexItem"
                  :label="getItemName('projectId')"
                  prop="projectId"
                >
                  <span
                    :class="itemEdit('projectId') ? 'disable ref-status' : 'ref-edit'"
                    v-if="formData.data.projectId && formData.data.projectId.engineering_name"
                    @click="
                      goFormDetail(formData.data.projectId.schemaCode, formData.data.projectId.id)
                    "
                  >{{ formData.data.projectId.engineering_name }}</span
                  >
                </a-form-model-item>
                <!-- 生产任务单id -->
                <a-form-model-item
                  v-if="itemShow('projectIdText')"
                  :colon="false"
                  class="rowFlexItem"
                  :label="getItemName('projectIdText')"
                  prop="projectIdText"
                  v-show="false"
                >
                  <span class="readonly" v-if="itemEdit('projectIdText')">{{
                    formData.data.projectIdText
                  }}</span>
                  <a-input
                    v-else
                    :placeholder="placeholder('projectIdText')"
                    v-model="formData.data.projectIdText"
                    allowClear
                  />
                </a-form-model-item>
                <!-- 申请单位 -->
                <a-form-model-item
                  v-if="itemShow('manufacturer')"
                  :colon="false"
                  class="rowFlexItem"
                  :label="getItemName('manufacturer')"
                  prop="manufacturer"
                >
                  <span class="readonly" v-if="itemEdit('manufacturer')">{{
                    formData.data.manufacturer | formatSelector
                  }}</span>
                  <staff-selector
                    v-else
                    :options="setStaffSelectorOptions('manufacturer', '请选择')"
                    @change="(value) => staffSelectorChange(value, 'manufacturer')"
                    :value="formData.data.manufacturer"
                  />
                </a-form-model-item>
                <!-- input框  项目名称-->
                <a-form-model-item
                  v-if="itemShow('engineering_name')"
                  :colon="false"
                  class="rowFlexItem"
                  :label="getItemName('engineering_name')"
                  prop="engineering_name"
                >
                  <span class="readonly" v-if="itemEdit('engineering_name')">{{
                    formData.data.engineering_name
                  }}</span>
                  <a-input
                    v-else
                    :placeholder="placeholder('engineering_name')"
                    v-model="formData.data.engineering_name"
                    allowClear
                  />
                </a-form-model-item>
                <!-- 项目编号 -->
                <a-form-model-item
                  v-if="itemShow('engineering_number')"
                  :colon="false"
                  class="rowFlexItem"
                  :label="getItemName('engineering_number')"
                  prop="engineering_number"
                >
                  <span class="readonly" v-if="itemEdit('engineering_number')">{{
                    formData.data.engineering_number
                  }}</span>
                  <a-input
                    v-else
                    :placeholder="placeholder('engineering_number')"
                    v-model="formData.data.engineering_number"
                    allowClear
                  />
                </a-form-model-item>
                <!-- 生产任务单号 -->
                <a-form-model-item
                  v-if="itemShow('project_number')"
                  :colon="false"
                  class="rowFlexItem"
                  :label="getItemName('project_number')"
                  prop="project_number"
                >
                  <span class="readonly" v-if="itemEdit('project_number')">{{
                    formData.data.project_number
                  }}</span>
                  <a-input
                    v-else
                    :placeholder="placeholder('project_number')"
                    v-model="formData.data.project_number"
                    allowClear
                  />
                </a-form-model-item>
                <!-- 设计阶段  -->
                <a-form-model-item
                  v-if="itemShow('engineering_stage')"
                  :colon="false"
                  class="rowFlexItem"
                  :label="getItemName('engineering_stage')"
                  prop="engineering_stage"
                >
                  <span class="readonly" v-if="itemEdit('engineering_stage')">{{
                    formData.data.engineering_stage
                  }}</span>
                  <a-input
                    v-else
                    :placeholder="placeholder('engineering_stage')"
                    v-model="formData.data.engineering_stage"
                    allowClear
                  />
                </a-form-model-item>
                <!-- 申请开始时间 -->
                <a-form-model-item
                  v-if="itemShow('applicationStartTime')"
                  :colon="false"
                  class="rowFlexItem"
                  :label="getItemName('applicationStartTime')"
                  prop="applicationStartTime"
                >
                  <span class="readonly" v-if="itemEdit('applicationStartTime')">{{
                    formData.data.applicationStartTime | formatDate
                  }}</span>
                  <a-date-picker
                    v-else
                    style="width: 100%"
                    v-model="formData.data.applicationStartTime"
                    :disabledDate="(currentDate)=>disabledStartDate(currentDate,'applicationEndTime')"
                    :placeholder="setPlaceholder('applicationStartTime')"
                    valueFormat="YYYY-MM-DD"
                  />
                </a-form-model-item>
                <!-- 申请结束时间 -->
                <a-form-model-item
                  v-if="itemShow('applicationEndTime')"
                  :colon="false"
                  class="rowFlexItem"
                  :label="getItemName('applicationEndTime')"
                  prop="applicationEndTime"
                >
                  <span class="readonly" v-if="itemEdit('applicationEndTime')">{{
                    formData.data.applicationEndTime | formatDate
                  }}</span>
                  <a-date-picker
                    v-else
                    style="width: 100%"
                    v-model="formData.data.applicationEndTime"
                    :disabledDate="(currentDate)=>disabledEndDate(currentDate,'applicationStartTime')"
                    :placeholder="setPlaceholder('applicationEndTime')"
                    valueFormat="YYYY-MM-DD"
                  />
                </a-form-model-item>
                <!-- 文本框  项目简介及主要技术问题-->
                <a-form-model-item
                  v-if="itemShow('projectIntroduction')"
                  :colon="false"
                  class="fullRowFlexItem"
                  :label="getItemName('projectIntroduction')"
                  prop="projectIntroduction"
                >
                  <span class="readonly" v-if="itemEdit('projectIntroduction')">{{
                    formData.data.projectIntroduction
                  }}</span>
                  <a-textarea
                    v-else
                    :autoSize="{minRows:3}"
                    :placeholder="placeholder('projectIntroduction')"
                    v-model="formData.data.projectIntroduction"
                    allowClear/>
                </a-form-model-item>
              </div>
              <a-collapse-panel />
            </a-collapse-panel>
            <!-- 标题：评审确认内容 -->
            <a-collapse-panel key="3" class="collapsepanel3">
              <template #header>
                <div class="collapseHeader">
                  <div class="collapseHeaderTitle floatLeft">评审确认内容</div>
                </div>
              </template>
              <div class="rowFlexWrap">
                <div class="collapseHeaderTitles flex flex-center-align full-width">
                  <span class="line"></span>
                  <span class="floatLeft">由评审申请人指定:</span>
                </div>
                <!-- 选人控件 评审申请人-->
                <a-form-model-item
                  v-if="itemShow('reviewApplicants')"
                  :colon="false"
                  class="rowFlexItem"
                  :label="getItemName('reviewApplicants')"
                  prop="reviewApplicants"
                >
                  <span class="readonly" v-if="itemEdit('reviewApplicants')">{{
                    formData.data.reviewApplicants | formatSelector
                  }}</span>
                  <staff-selector
                    v-else
                    :options="setStaffSelectorOptions('reviewApplicants', '请选择')"
                    @change="(value) => staffSelectorChange(value, 'reviewApplicants')"
                    :value="formData.data.reviewApplicants"
                  />
                </a-form-model-item>
                <!-- 事业部分管经理 -->
                <a-form-model-item
                  v-if="itemShow('manufacturer_vice_manager')"
                  :colon="false"
                  class="rowFlexItem"
                  :label="getItemName('manufacturer_vice_manager')"
                  prop="manufacturer_vice_manager"
                >
                  <span class="readonly" v-if="itemEdit('manufacturer_vice_manager')">{{
                    formData.data.manufacturer_vice_manager | formatSelector
                  }}</span>
                  <staff-selector
                    v-else
                    :options="setStaffSelectorOptions('manufacturer_vice_manager', '请选择')"
                    @change="(value) => staffSelectorChange(value, 'manufacturer_vice_manager')"
                    :value="formData.data.manufacturer_vice_manager"
                  />
                </a-form-model-item>
                <!-- 由公司主管总工指定： -->
                <div class="collapseHeaderTitles flex flex-center-align full-width">
                  <span class="line"></span>
                  <span class="floatLeft">由公司主管总工指定:</span>
                </div>
                <!-- 公司主管总工 -->
                <a-form-model-item
                  v-if="itemShow('company_chief_engineer')"
                  :colon="false"
                  class="rowFlexItem"
                  :label="getItemName('company_chief_engineer')"
                  prop="company_chief_engineer"
                >
                  <span class="readonly" v-if="itemEdit('company_chief_engineer')">{{
                    formData.data.company_chief_engineer | formatSelector
                  }}</span>
                  <staff-selector
                    v-else
                    :options="setStaffSelectorOptions('company_chief_engineer', '请选择')"
                    @change="(value) => staffSelectorChange(value, 'company_chief_engineer')"
                    :value="formData.data.company_chief_engineer"
                  />
                </a-form-model-item>
                <!-- 评审形式 -->
                <a-form-model-item
                  v-if="itemShow('reviewType')"
                  :colon="false"
                  class="rowFlexItem"
                  :label="getItemName('reviewType')"
                  prop="reviewType"
                >
                  <span class="readonly" v-if="itemEdit('reviewType')">{{
                    formData.data.reviewType
                  }}</span>
                  <a-radio-group
                    :placeholder="setPlaceholder('reviewType')"
                    v-else
                    v-model="formData.data.reviewType"
                    :options="getOptions('reviewType', true)"
                  ></a-radio-group>
                </a-form-model-item>
                <!-- 新技术应用 -->
                <a-form-model-item
                  v-if="itemShow('applicationNewTechnologies')"
                  :colon="false"
                  class="rowFlexItem"
                  :label="getItemName('applicationNewTechnologies')"
                  prop="applicationNewTechnologies"
                >
                  <span class="readonly" v-if="itemEdit('applicationNewTechnologies')">{{
                    formData.data.applicationNewTechnologies
                  }}</span>
                  <a-radio-group
                    :placeholder="setPlaceholder('applicationNewTechnologies')"
                    v-else
                    v-model="formData.data.applicationNewTechnologies"
                    :options="getOptions('applicationNewTechnologies', true)"
                  ></a-radio-group>
                </a-form-model-item>
                <!-- 描述具体内容 -->
                <a-form-model-item
                  v-if="itemShow('techDescribe')"
                  :colon="false"
                  class="fullRowFlexItem"
                  :label="getItemName('techDescribe')"
                  prop="techDescribe"
                >
                  <span class="readonly" v-if="itemEdit('techDescribe')">{{
                    formData.data.techDescribe
                  }}</span>
                  <a-textarea
                    v-else
                    :autoSize="{minRows:3}"
                    :placeholder="placeholder('techDescribe')"
                    v-model="formData.data.techDescribe"
                    allowClear/>
                </a-form-model-item>
                <!-- 主管总经理 -->
                <a-form-model-item
                  v-if="itemShow('company_manager')"
                  :colon="false"
                  class="rowFlexItem"
                  :label="getItemName('company_manager')"
                  prop="company_manager"
                  v-show="false"
                >
                  <span class="readonly" v-if="itemEdit('company_manager')">{{
                    formData.data.company_manager
                  }}</span>
                  <staff-selector
                    v-else
                    :placeholder="placeholder('company_manager')"
                    v-model="formData.data.company_manager"
                    allowClear
                  />
                </a-form-model-item>
                <!-- 事业部主管总工 -->
                <a-form-model-item
                  v-if="itemShow('manufacturer_chief_engineer')"
                  :colon="false"
                  class="rowFlexItem"
                  :label="getItemName('manufacturer_chief_engineer')"
                  prop="manufacturer_chief_engineer"
                  v-show="false"
                >
                  <span class="readonly" v-if="itemEdit('manufacturer_chief_engineer')">{{
                    formData.data.manufacturer_chief_engineer
                  }}</span>
                  <staff-selector
                    v-else
                    :placeholder="placeholder('manufacturer_chief_engineer')"
                    v-model="formData.data.manufacturer_chief_engineer"
                    allowClear
                  />
                </a-form-model-item>
                <!-- 专业负责人 -->
                <a-form-model-item
                  v-if="itemShow('professionManager')"
                  :colon="false"
                  class="rowFlexItem"
                  :label="getItemName('professionManager')"
                  prop="professionManager"
                  v-show="false"
                >
                  <span class="readonly" v-if="itemEdit('professionManager')">{{
                    formData.data.professionManager
                  }}</span>
                  <staff-selector
                    v-else
                    :placeholder="placeholder('professionManager')"
                    v-model="formData.data.professionManager"
                    allowClear
                  />
                </a-form-model-item>
                <!-- 由公司总工程师指定 -->
                <div class="collapseHeaderTitles flex flex-center-align full-width">
                  <span class="line"></span>
                  <span class="floatLeft">由公司总工程师指定:</span>
                </div>
                <!-- 公司总工程师 -->
                <a-form-model-item
                  v-if="itemShow('chiefEngineer')"
                  :colon="false"
                  class="rowFlexItem"
                  :label="getItemName('chiefEngineer')"
                  prop="chiefEngineer"
                >
                  <span class="readonly" v-if="itemEdit('chiefEngineer')">{{
                    formData.data.chiefEngineer | formatSelector
                  }}</span>
                  <staff-selector
                    v-else
                    :options="setStaffSelectorOptions('chiefEngineer', '请选择')"
                    @change="(value) => staffSelectorChange(value, 'chiefEngineer')"
                    :value="formData.data.chiefEngineer"
                  />
                </a-form-model-item>
                <!-- 评审具体时间 -->
                <a-form-model-item
                  v-if="itemShow('reviewTime')"
                  :colon="false"
                  class="rowFlexItem"
                  :label="getItemName('reviewTime')"
                  prop="reviewTime"
                >
                  <span class="readonly" v-if="itemEdit('reviewTime')">{{
                    formData.data.reviewTime | formatDate
                  }}</span>
                  <a-date-picker
                    v-else
                    style="width: 100%"
                    v-model="formData.data.reviewTime"
                    :placeholder="setPlaceholder('reviewTime')"
                    valueFormat="YYYY-MM-DD"
                  />
                </a-form-model-item>
                <!-- 授权其他人 -->
                <a-form-model-item
                  v-if="itemShow('authorized')"
                  :colon="false"
                  class="rowFlexItem"
                  :label="getItemName('authorized')"
                  prop="authorized"
                >
                  <span class="readonly" v-if="itemEdit('authorized')">{{
                    formData.data.authorized
                  }}</span>
                  <a-radio-group
                    :placeholder="setPlaceholder('authorized')"
                    v-else
                    v-model="formData.data.authorized"
                    :options="getOptions('authorized', true)"
                  ></a-radio-group>
                </a-form-model-item>
                <!-- 授权人 -->
                <a-form-model-item
                  v-if="itemShow('authorizer')"
                  :colon="false"
                  class="rowFlexItem"
                  :label="getItemName('authorizer')"
                  prop="authorizer"
                >
                  <span class="readonly" style="font-weight: bold" v-if="itemEdit('authorizer')">{{
                    formData.data.authorizer | formatSelector
                  }}</span>
                  <staff-selector
                    v-else
                    :options="setStaffSelectorOptions('authorizer', '请选择')"
                    @change="(value) => staffSelectorChange(value, 'authorizer')"
                    :value="formData.data.authorizer"
                  />
                </a-form-model-item>
                <!-- 由总工办指定 -->
                <div class="collapseHeaderTitles flex flex-center-align full-width">
                  <span class="line"></span>
                  <span class="floatLeft">由总工办指定:</span>
                </div>
                <!-- 总工办主管 -->
                <a-form-model-item
                  v-if="itemShow('engineeringSupervisor')"
                  :colon="false"
                  class="rowFlexItem"
                  :label="getItemName('engineeringSupervisor')"
                  prop="engineeringSupervisor"
                >
                  <span
                    class="readonly"
                    style="font-weight: bold"
                    v-if="itemEdit('engineeringSupervisor')"
                  >{{ formData.data.engineeringSupervisor | formatSelector }}</span
                  >
                  <staff-selector
                    v-else
                    :options="setStaffSelectorOptions('engineeringSupervisor', '请选择')"
                    @change="(value) => staffSelectorChange(value, 'engineeringSupervisor')"
                    :value="formData.data.engineeringSupervisor"
                  />
                </a-form-model-item>
                <!-- 总公办助理 -->
                <a-form-model-item
                  v-if="itemShow('engineerAssistan')"
                  :colon="false"
                  class="rowFlexItem"
                  :label="getItemName('engineerAssistan')"
                  prop="engineerAssistan"
                >
                  <span
                    class="readonly"
                    style="font-weight: bold"
                    v-if="itemEdit('engineerAssistan')"
                  >{{ formData.data.engineerAssistan | formatSelector }}</span
                  >
                  <staff-selector
                    v-else
                    :options="setStaffSelectorOptions('engineerAssistan', '请选择')"
                    @change="(value) => staffSelectorChange(value, 'engineerAssistan')"
                    :value="formData.data.engineerAssistan"
                  />
                </a-form-model-item>
                <!-- 邀请专家 -->
                <a-form-model-item
                  v-if="itemShow('inviteExperts')"
                  :colon="false"
                  class="rowFlexItem"
                  :label="getItemName('inviteExperts')"
                  prop="inviteExperts"
                >
                  <span class="readonly" v-if="itemEdit('inviteExperts')">{{
                    formData.data.inviteExperts
                  }}</span>
                  <a-input
                    v-else
                    :placeholder="placeholder('inviteExperts')"
                    v-model="formData.data.inviteExperts"
                    allowClear
                  />
                </a-form-model-item>
              </div>
            </a-collapse-panel>

            <!--标题 主要评审意见 -->
            <a-collapse-panel key="4" class="collapsepanel3">
              <template #header>
                <div class="collapseHeader">
                  <div class="collapseHeaderTitle floatLeft">主要评审意见</div>
                </div>
              </template>
              <div class="mainReviewComments">
                <div class="mainReviewComments-top">
                  <!-- 新增按钮弹框 -->
                  <div class="button" v-if="itemShow('XTSJ_jsfa_psyj')">
                    <a-button
                      type="primary"
                      @click="handleAdd('add')"
                      style="margin-right: 8px"
                      :disabled="itemEdit('XTSJ_jsfa_psyj')">新增
                    </a-button>
                    <a-popconfirm title="确认删除吗？删除后不可恢复哦！" @confirm="removeComments">
                      <a-button :disabled="itemEdit('XTSJ_jsfa_psyj')">删除</a-button>
                    </a-popconfirm>
                    <a-modal
                      title="新增意见"
                      :visible="visible"
                      :confirmLoading="confirmLoading"
                      @ok="handleOk"
                      @cancel="handleCancel"
                    >
                      <div class="spanSpan" style="font-weight: bold; margin-bottom: 10px">
                        主要评审意见内容:
                      </div>
                      <div class="opinion" style="margin-bottom: 10px">
                        <a-textarea
                          v-model.trim="opinions"
                          placeholder="请填写意见内容"
                          allowClear
                          :autoSize="{ minRows: 4, maxRows: 6 }">
                        </a-textarea>
                      </div>
                      <div class="common">
                        <div class="commonSpan" style="font-weight: bold; margin-bottom: 10px">
                          常用意见推荐:
                        </div>
                        <div class="recommend">
                          <a-checkable-tag
                            v-for="(item, index) in commonReplys"
                            :key="index"
                            @change="handleChange($event, item)"
                          >
                            {{ item }}
                          </a-checkable-tag>
                        </div>
                      </div>
                    </a-modal>
                  </div>
                </div>
                <!-- 中间表格内容 -->
                <div class="mainReviewComments-content">
                  <a-table
                    bordered
                    rowKey="id"
                    :data-source="dataSource"
                    :columns="columns"
                    :pagination="false"
                    :rowSelection="rowSelection"
                  >
                    <template slot="operation" slot-scope="text, record,index">
                      <div class="operation">
                        <a
                          v-if="!itemEdit('desReviewComments')"
                          :disabled="itemEdit('desReviewComments')"
                          @click="editComment('意见内容',index,record.review)">编辑</a>
                        <a-popconfirm
                          v-if="!itemEdit('XTSJ_jsfa_psyj')"
                          title="您确定删除吗?"
                          @confirm="() => onDelete(record)"
                        >
                          <a :disabled="itemEdit('XTSJ_jsfa_psyj')">删除</a>
                        </a-popconfirm>
                        <!-- 回复按钮弹框 -->
                        <div class="revert" v-if="!itemEdit('replyReviewComments')">
                          <a
                            @click="revertModal(record)"
                            :disabled="itemEdit('replyReviewComments')">回复</a>
                          <!--                          <div class="revert">-->
                          <!--                          <a @click="revertModal(record)">回复</a>-->
                          <a-modal
                            :visible="visibility"
                            title="回复意见"
                            @ok="revertModaleOk"
                            @cancel="revertCancel"
                            style="font-weight: bold"
                          >
                            <div class="reply" style="font-weight: bold; margin-bottom: 15px">
                              主要评审意见内容:
                            </div>
                            <div class="opinions" style="font-weight: 500; margin-bottom: 15px">
                              {{ revertsObj.review }}
                            </div>
                            <div class="suggest" style="font-weight: bold; margin-bottom: 15px">
                              评审意见回复:
                            </div>
                            <div class="opinions">
                              <a-textarea
                                v-model.trim="reverts"
                                placeholder="请填写评审意见回复"
                                allowClear
                                :autoSize="{ minRows: 4, maxRows: 6 }">
                              </a-textarea>
                            </div>
                          </a-modal>
                        </div>
                        <!-- 审核弹框按钮 -->
                        <div class="internal" v-if="!itemEdit('reviewReply')">
                          <a :disabled="itemEdit('reviewReply')" @click="showConfirm(record)">审核</a>
                          <!--                          <div class="internal">-->
                          <!--                            <a @click="showConfirm(record)">审核</a>-->
                          <a-modal
                            :visible="reviewFlag"
                            @ok="handleConfirm"
                            @cancel="cancelConfirm"
                            title="审核意见"
                            style="font-weight: bold"
                          >
                            <!--                            <div class="reply" style="font-weight: bold; margin-bottom: 15px">-->
                            <!--                              <p>审核结果选择:</p>-->
                            <!--                              <div class="handle">-->
                            <!--                                <a-button-->
                            <!--                                  type="primary"-->
                            <!--                                  @click="()=> {reviewDesign='同意';reviewFlag=false;handleConfirm() }">-->
                            <!--                                  同意-->
                            <!--                                </a-button>-->
                            <!--                                <a-button-->
                            <!--                                  style="margin-left: 20px"-->
                            <!--                                  @click="()=> {reviewDesign='驳回';reviewFlag=false;handleConfirm() }">-->
                            <!--                                  驳回-->
                            <!--                                </a-button>-->
                            <!--                              </div>-->
                            <!--                            </div>-->

                            <div class="suggest" style="font-weight: bold; margin-bottom: 15px">
                              审核意见描述:
                            </div>
                            <div class="opinions">
                              <a-textarea
                                placeholder="审核回复意见"
                                v-model.trim="reviewDesign"
                                allowClear
                                :autoSize="{ minRows: 4, maxRows: 6 }">
                              </a-textarea>
                            </div>
                          </a-modal>
                        </div>
                      </div>
                    </template>
                  </a-table>
                  <div class="reviewProposer">
                    <div class="rowFlexWrap row-flex-none">
                      <!--会议签到附件-->
                      <a-form-model-item
                        v-if="itemShow('attachment')"
                        :colon="false"
                        class="rowFlexItem fullRowFlexItem"
                        :label="getItemName('attachment')"
                        prop="attachment"
                      >
                        <ul>
                          <li
                            class="clearfix fileInfos"
                            v-for="(item, index) in formData.data.attachment"
                            :key="index"
                            @click="goDetail(item)"
                          >
                            <a-icon type="paper-clip"/>
                            <span>{{ item.name }}</span>
                            <div class="right fileInfo">
                              <span>{{ item.creater.name }}</span>
                              <span>{{ item.createdTime }}</span>
                              <a-icon
                                v-if="!itemEdit('attachment')"
                                type="delete"
                                @click.stop="removeFile(formData.data.attachment, index)"
                              />
                              <a-icon type="download" @click.stop="download(item)"/>
                            </div>
                          </li>
                        </ul>
                        <a-upload
                          v-if="!itemEdit('attachment')"
                          :disabled="itemEdit('attachment') || isUploading"
                          :headers="upload.headers"
                          :multiple="upload.multiple"
                          :action="upload.action"
                          :showUploadList="upload.showUploadList"
                          :placeholder="setPlaceholder('attachment', '请上传')"
                          @change="(info) => upload.change(info, 'attachment', 'isUploading')"
                          :beforeUpload="upload.beforeUpload"
                        >
                          <a-button :disabled="itemEdit('attachment') || isUploading">
                            <a-icon :type="isUploading ? 'loading' : 'upload'"/>
                            {{ isUploading ? "上传中..." : "点击上传" }}
                          </a-button>
                        </a-upload>
                      </a-form-model-item>
                    </div>
                  </div>
                </div>
              </div>
            </a-collapse-panel>
          </a-collapse>
        </a-form-model>
      </div>
      <Workflow
        v-else
        :workflowInstanceId="formData.data.workflowInstanceId"
        :workItemId="formData.data.workItemId"
      ></Workflow>
    </div>
    <a-modal
      :afterClose="dialogModalConfiguration.afterClose"
      :okText="dialogModalConfiguration.okText"
      :destroyOnClose="true"
      :confirmLoading="dialogModalConfiguration.confirmLoading"
      :wrapClassName="dialogModalConfiguration.showComment ? '' : 'modalWrap'"
      v-model="dialogModalConfiguration.visible"
      @ok="dialogModalConfiguration.OK"
      centered
    >
      <a-form-model ref="dialogForm" :model="dialogTaskForm.formData" :rules="dialogTaskForm.rules">
        <a-form-model-item
          v-show="dialogModalConfiguration.showComment"
          required
          prop="comment"
          class="modal-model-item"
        >
          <a-textarea
            placeholder="意见/建议"
            v-model.trim="dialogTaskForm.formData.comment"
            allowClear
            :autoSize="{ minRows: 4, maxRows: 6 }"
          />
        </a-form-model-item>
      </a-form-model>
      <div v-if="this.commonReplys">
        <div style="margin-bottom: 10px">常用意见</div>
        <div>
          <a-tag
            v-for="(item, index) in commonReplys.replys"
            :key="index"
            @click="tagChange(item)"
          >{{ item }}
          </a-tag
          >
        </div>
      </div>
      <template #title>
        <a-icon style="padding-right: 5px" type="question-circle" theme="twoTone"/>
        <span>{{ dialogModalConfiguration.title }}</span>
      </template>
    </a-modal>
  </div>
</template>

<script src="./ArtReviewDetail.ts" />

<style lang="less" scoped>
@import url("./ArtReviewDetail.less");
@import "../ProfessionalTask/ProfessionalDesignOutline/index.less";
@import '../common.less';
@import './projectReview.less';
</style>
