<template>
  <div class="projectPlanningkWrap">
    <div class="clearfix">
      <div class="left buttonLinks">
        <span
          class="buttonLink"
          :class="{active:leftButtonLinks.activeIndex===index}"
          v-for="(item,index) in leftButtonLinks.buttonLinks"
          :key="index"
          @click="leftButtonClick(index)">{{ item.name }}</span>
      </div>
      <div class="right" v-if="leftButtonLinks.activeIndex===0">
        <template v-for="(button,index) in rightButtonLinks">
          <a-button
            v-if="formData.data[button.visibleKey]"
            class="buttonLink"
            :key="index"
            @click="actionButtonClick(button)"
            :type="button.type">{{ button.name }}
          </a-button>
        </template>
      </div>
      <a-popconfirm
        title="变更后，项目策划的流程节点将会回退至填写大纲节点，确认变更吗?"
        @confirm="rejectNode">
        <a-button v-if="isShowRejectBtn" type="primary" class="define-reject">变更</a-button>
      </a-popconfirm>
    </div>
    <application-list v-show="false" class="divide"/>
    <div class="projectPlanningContent">
      <div v-if="leftButtonLinks.activeIndex===0">
        <a-form-model
          labelAlign="left"
          ref="modalForm"
          :model="formData.data"
          :rules="formData.rules">
          <a-collapse
            :defaultActiveKey="['2','3','4','5','6']"
            :bordered="false"
            expandIconPosition="right">
            <!--            <a-collapse-panel key="6" class="collapsepanel4">-->
            <!--              <template #header>-->
            <!--                <div class="collapseHeader">-->
            <!--                  <div class="collapseHeaderTitle floatLeft">总工指导意见区域</div>-->
            <!--                </div>-->
            <!--              </template>-->
            <!--              <div class="rowFlexWrap">-->
            <!--                <a-form-model-item-->
            <!--                  v-if="itemShow('feedback_creater')"-->
            <!--                  :colon="false"-->
            <!--                  class="fullRowFlexItem"-->
            <!--                  :label="getItemName('feedback_creater')"-->
            <!--                  prop="feedback_creater">-->
            <!--                  <span class="readonly" v-if="itemEdit('feedback_creater')">{{ formData.data.feedback_creater }}</span>-->
            <!--                  <a-textarea-->
            <!--                    v-else-->
            <!--                    :autoSize="{minRows:3}"-->
            <!--                    :placeholder="placeholder('feedback_creater')"-->
            <!--                    v-model="formData.data.feedback_creater"-->
            <!--                    allowClear/>-->
            <!--                </a-form-model-item>-->
            <!--                <a-form-model-item-->
            <!--                  v-if="itemShow('chief_feedback')"-->
            <!--                  :colon="false"-->
            <!--                  class="fullRowFlexItem"-->
            <!--                  :label="getItemName('chief_feedback')"-->
            <!--                  prop="chief_feedback">-->
            <!--                  <span class="readonly" v-if="itemEdit('chief_feedback')">{{ formData.data.chief_feedback }}</span>-->
            <!--                  <a-textarea-->
            <!--                    v-else-->
            <!--                    :autoSize="{minRows:3}"-->
            <!--                    :placeholder="placeholder('chief_feedback')"-->
            <!--                    v-model="formData.data.chief_feedback"-->
            <!--                    allowClear/>-->
            <!--                </a-form-model-item>-->
            <!--                <a-form-model-item-->
            <!--                  v-if="itemShow('unsigned_ids')"-->
            <!--                  :colon="false"-->
            <!--                  class="fullRowFlexItem"-->
            <!--                  :label="getItemName('unsigned_ids')"-->
            <!--                  prop="unsigned_ids">-->
            <!--                  <a-tag color="#ffba00" v-for="(item,index) in formData.data.unsigned_ids" :key="index">{{ item }}</a-tag>-->
            <!--                </a-form-model-item>-->
            <!--                <a-form-model-item-->
            <!--                  v-if="itemShow('signed_ids')"-->
            <!--                  :colon="false"-->
            <!--                  class="fullRowFlexItem"-->
            <!--                  :label="getItemName('signed_ids')"-->
            <!--                  prop="signed_ids">-->
            <!--                  <a-tag color="#87d068" v-for="(item,index) in formData.data.signed_ids" :key="index">{{ item }}</a-tag>-->
            <!--                </a-form-model-item>-->
            <!--              </div>-->
            <!--            </a-collapse-panel>-->
            <a-collapse-panel key="1">
              <template #header>
                <div class="collapseHeader">
                  <div class="collapseHeaderTitle left">审批记录</div>
                  <div
                    v-if="workFlowInfo.participants[0]"
                    class="collapseHeaderNode collapseHeaderItem left">
                    当前节点:<em>{{ workFlowInfo.participants[0].activityName }}</em></div>
                  <div
                    v-if="workFlowInfo.participants[0]"
                    class="collapseHeaderHandle collapseHeaderItem left">当前处理人:<em
                      v-for="(item,index) in workFlowInfo.participants[0].participants"
                      :key="index">{{
                        item.name
                      }}</em></div>
                  <div
                    v-if="workFlowInfo.status"
                    class="collapseHeaderWorkflow collapseHeaderItem left">
                    流程追踪:<em>{{ getSequenceString(workFlowInfo.status) }}</em></div>
                  <div class="collapseHeaderTime collapseHeaderItem left">已用时<em
                    v-show="usedDays>0">{{ usedDays }}</em><i v-show="usedDays>0">天</i><em
                    v-show="usedDays>0||usedHours>0">{{ usedHours }}</em><i
                    v-show="usedDays>0||usedHours>0">小时</i><em>{{ usedMinutes }}</em><i>分钟</i>
                  </div>
                </div>
              </template>
              <Approval
                :key="approvalKey"
                v-if="formData.data.workflowInstanceId!==null||''"
                :workflowInstanceId="formData.data.workflowInstanceId">
              </Approval>
            </a-collapse-panel>
            <a-collapse-panel key="2" class="collapsepanel2">
              <template #header>
                <div class="collapseHeader">
                  <div class="collapseHeaderTitle">任务基本信息</div>
                </div>
              </template>
              <div class="rowFlexWrap">
                <a-form-model-item
                  v-if="itemShow('project_id')"
                  :colon="false"
                  class="fullRowFlexItem"
                  :label="getItemName('project_id')"
                  prop="project_id">
                  <span
                    :class="itemEdit('project_id')?'disable ref-status':'ref-edit'"
                    v-if="formData.data.project_id && formData.data.project_id.name"
                    @click="goFormDetail(formData.data.project_id.schemaCode,formData.data.project_id.id)">{{
                      formData.data.project_id.name
                    }}</span>
                  <!--                  <span class="readonly">{{ formData.data.project_id }}</span>-->
                  <!--                  <a-input-->
                  <!--                    v-else-->
                  <!--                    :placeholder="setPlaceholder('project_id','请输入')"-->
                  <!--                    v-model="formData.data.project_id"-->
                  <!--                    allowClear/>-->
                </a-form-model-item>
                <a-form-model-item
                  v-if="itemShow('engineering_name')"
                  :colon="false"
                  class="rowFlexItem"
                  :label="getItemName('engineering_name')"
                  prop="engineering_name">
                  <span class="readonly" v-if="itemEdit('engineering_name')">{{
                    formData.data.engineering_name
                  }}</span>
                  <a-input
                    v-else
                    :placeholder="placeholder('engineering_name')"
                    v-model="formData.data.engineering_name"
                    allowClear/>
                </a-form-model-item>
                <a-form-model-item
                  v-if="itemShow('engineering_number')"
                  :colon="false"
                  class="rowFlexItem"
                  :label="getItemName('engineering_number')"
                  prop="engineering_number">
                  <span class="readonly" v-if="itemEdit('engineering_number')">{{
                    formData.data.engineering_number
                  }}</span>
                  <a-input
                    v-else
                    :placeholder="placeholder('engineering_number')"
                    v-model="formData.data.engineering_number"
                    allowClear/>
                </a-form-model-item>
                <a-form-model-item
                  v-if="itemShow('engineering_location')"
                  :colon="false"
                  class="rowFlexItem"
                  :label="getItemName('engineering_location')"
                  prop="engineering_location">
                  <span class="readonly" v-if="itemEdit('engineering_location')">{{
                    formData.data.engineering_location
                  }}</span>
                  <a-select
                    v-else
                    allowClear
                    v-model="formData.data.engineering_location"
                    :mode="getMultiple('engineering_location')?'multiple':'default'"
                    @focus="updateOptions('engineering_location')"
                    :placeholder="placeholder('engineering_location')"
                    :options="getOptions('engineering_location')"></a-select>
                </a-form-model-item>
                <a-form-model-item
                  v-if="itemShow('engineeringType')"
                  :colon="false"
                  class="rowFlexItem"
                  :label="getItemName('engineeringType')"
                  prop="engineeringType">
                  <span class="readonly" v-if="itemEdit('engineeringType')">{{
                    formData.data.engineeringType | formatSelector
                  }}</span>
                  <a-select
                    v-else
                    allowClear
                    v-model="formData.data.engineeringType"
                    :mode="getMultiple('engineeringType')?'multiple':'default'"
                    @focus="updateOptions('engineeringType')"
                    :placeholder="placeholder('engineeringType')"
                    :options="getOptions('engineeringType')"></a-select>
                </a-form-model-item>
                <a-form-model-item
                  v-if="itemShow('industryType')"
                  :colon="false"
                  class="rowFlexItem"
                  :label="getItemName('industryType')"
                  prop="industryType">
                  <span class="readonly" v-if="itemEdit('industryType')">{{
                    formData.data.industryType | formatSelector
                  }}</span>
                  <a-select
                    v-else
                    allowClear
                    v-model="formData.data.industryType"
                    :mode="getMultiple('industryType')?'multiple':'default'"
                    @focus="updateOptions('industryType')"
                    :placeholder="placeholder('industryType')"
                    :options="getOptions('industryType')"></a-select>
                </a-form-model-item>
                <a-form-model-item
                  v-if="itemShow('projectType')"
                  :colon="false"
                  class="rowFlexItem"
                  :label="getItemName('projectType')"
                  prop="projectType">
                  <span class="readonly" v-if="itemEdit('projectType')">{{
                    formData.data.projectType | formatSelector
                  }}</span>
                  <a-select
                    v-else
                    allowClear
                    v-model="formData.data.projectType"
                    :mode="getMultiple('projectType')?'multiple':'default'"
                    @focus="updateOptions('projectType')"
                    :placeholder="placeholder('projectType')"
                    :options="getOptions('projectType')"></a-select>
                </a-form-model-item>
                <a-form-model-item
                  v-if="itemShow('engineering_stage')"
                  :colon="false"
                  class="rowFlexItem"
                  :label="getItemName('engineering_stage')"
                  prop="engineering_stage">
                  <span class="readonly" v-if="itemEdit('engineering_stage')">{{
                    formData.data.engineering_stage | formatSelector
                  }}</span>
                  <a-select
                    v-else
                    allowClear
                    v-model="formData.data.engineering_stage"
                    :mode="getMultiple('engineering_stage')?'multiple':'default'"
                    @focus="updateOptions('engineering_stage')"
                    :placeholder="placeholder('engineering_stage')"
                    :options="getOptions('engineering_stage')"></a-select>
                </a-form-model-item>
                <a-form-model-item
                  v-if="itemShow('task_type')"
                  :colon="false"
                  class="rowFlexItem"
                  :label="getItemName('task_type')"
                  prop="task_type">
                  <span class="readonly" v-if="itemEdit('task_type')">{{
                    formData.data.task_type
                  }}</span>
                  <a-radio-group
                    :placeholder="setPlaceholder('task_type')"
                    v-else
                    v-model="formData.data.task_type"
                    :options="getOptions('task_type',true)"></a-radio-group>
                </a-form-model-item>
                <a-form-model-item
                  v-if="itemShow('project_level')"
                  :colon="false"
                  class="rowFlexItem"
                  :label="getItemName('project_level')"
                  prop="project_level">
                  <span
                    class="readonly"
                    v-if="itemEdit('project_level')">{{ formData.data.project_level }}</span>
                  <a-radio-group
                    :placeholder="setPlaceholder('project_level')"
                    v-else
                    v-model="formData.data.project_level"
                    :options="getOptions('project_level',true)"></a-radio-group>
                </a-form-model-item>
                <a-form-model-item
                  v-if="itemShow('modelType')"
                  :colon="false"
                  class="rowFlexItem"
                  :label="getItemName('modelType')"
                  prop="modelType">
                  <span class="readonly" v-if="itemEdit('modelType')">{{
                    formData.data.modelType | formatSelector
                  }}</span>
                  <a-select
                    v-else
                    allowClear
                    v-model="formData.data.modelType"
                    :mode="getMultiple('modelType')?'multiple':'default'"
                    @focus="updateOptions('modelType')"
                    @change="changeLabelByModelTypeValue()"
                    showSearch
                    :getPopupContainer="trigger=>trigger.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode"
                    :placeholder="placeholder('modelType')"
                    :options="getOptions('modelType')"></a-select>
                </a-form-model-item>
              </div>
            </a-collapse-panel>
            <a-collapse-panel key="3" class="collapsepanel3">
              <template #header>
                <div class="collapseHeader">
                  <div class="collapseHeaderTitle">评审人员列表</div>
                </div>
              </template>
              <div class="rowFlexWrap">
                <a-form-model-item
                  v-if="itemShow('manufacturer')"
                  :colon="false"
                  class="rowFlexItem"
                  :label="getItemName('manufacturer')"
                  prop="manufacturer">
                  <span class="readonly" v-if="itemEdit('manufacturer')">{{
                    formData.data.manufacturer | formatSelector
                  }}</span>
                  <staff-selector
                    v-else
                    :options="setStaffSelectorOptions('manufacturer','请选择')"
                    @change="(value)=>staffSelectorChange(value,'manufacturer')"
                    :value="formData.data.manufacturer"/>
                </a-form-model-item>
                <a-form-model-item
                  v-if="itemShow('project_manager')"
                  :colon="false"
                  class="rowFlexItem"
                  :label="getItemName('project_manager')"
                  prop="project_manager">
                  <span class="readonly" v-if="itemEdit('project_manager')">{{
                    formData.data.project_manager | formatSelector
                  }}</span>
                  <staff-selector
                    v-else
                    :options="setStaffSelectorOptions('project_manager','请选择')"
                    @change="(value)=>staffSelectorChange(value,'project_manager')"
                    :value="formData.data.project_manager"/>
                </a-form-model-item>
                <a-form-model-item
                  v-if="itemShow('manufacturer_chief')"
                  :colon="false"
                  class="rowFlexItem"
                  :label="getItemName('manufacturer_chief')"
                  prop="manufacturer_chief">
                  <span class="readonly" v-if="itemEdit('manufacturer_chief')">{{
                    formData.data.manufacturer_chief | formatSelector
                  }}</span>
                  <staff-selector
                    v-else
                    :options="setStaffSelectorOptions('manufacturer_chief','请选择')"
                    @change="(value)=>staffSelectorChange(value,'manufacturer_chief')"
                    :value="formData.data.manufacturer_chief"/>
                </a-form-model-item>
                <a-form-model-item
                  v-if="itemShow('manufacturer_manager')"
                  :colon="false"
                  class="rowFlexItem"
                  :label="getItemName('manufacturer_manager')"
                  prop="manufacturer_manager">
                  <span class="readonly" v-if="itemEdit('manufacturer_manager')">{{
                    formData.data.manufacturer_manager | formatSelector
                  }}</span>
                  <staff-selector
                    v-else
                    :options="setStaffSelectorOptions('manufacturer_manager','请选择')"
                    @change="(value)=>staffSelectorChange(value,'manufacturer_manager')"
                    :value="formData.data.manufacturer_manager"/>
                </a-form-model-item>
                <a-form-model-item
                  v-if="itemShow('company_chief')"
                  :colon="false"
                  class="rowFlexItem"
                  :label="getItemName('company_chief')"
                  prop="company_chief">
                  <span class="readonly" v-if="itemEdit('company_chief')">{{
                    formData.data.company_chief | formatSelector
                  }}</span>
                  <staff-selector
                    v-else
                    :options="setStaffSelectorOptions('company_chief','请选择')"
                    @change="(value)=>staffSelectorChange(value,'company_chief')"
                    :value="formData.data.company_chief"/>
                </a-form-model-item>
                <a-form-model-item
                  v-if="itemShow('company_manager')"
                  :colon="false"
                  class="rowFlexItem"
                  :label="getItemName('company_manager')"
                  prop="company_manager">
                  <span class="readonly" v-if="itemEdit('company_manager')">{{
                    formData.data.company_manager | formatSelector
                  }}</span>
                  <staff-selector
                    v-else
                    :options="setStaffSelectorOptions('company_manager','请选择')"
                    @change="(value)=>staffSelectorChange(value,'company_manager')"
                    :value="formData.data.company_manager"/>
                </a-form-model-item>
              </div>
            </a-collapse-panel>
            <a-collapse-panel key="4" class="collapsepanel4">
              <template #header>
                <div class="collapseHeader">
                  <div class="collapseHeaderTitle">专业任务划分</div>
                </div>
              </template>
              <div class="rowFlexWrap">
                <a-form-model-item
                  v-if="itemShow('project_begin_time')"
                  :colon="false"
                  class="rowFlexItem"
                  :label="getItemName('project_begin_time')"
                  prop="project_begin_time">
                  <span class="readonly" v-if="itemEdit('project_begin_time')">{{
                    formData.data.project_begin_time | formatDate
                  }}</span>
                  <a-date-picker
                    v-else
                    style="width:100%"
                    v-model="formData.data.project_begin_time"
                    :disabledDate="(currentDate)=>disabledStartDate(currentDate,'project_end_time')"
                    :placeholder="setPlaceholder('project_begin_time')"
                    valueFormat="YYYY-MM-DD"/>
                </a-form-model-item>
                <a-form-model-item
                  v-if="itemShow('project_end_time')"
                  :colon="false"
                  class="rowFlexItem"
                  :label="getItemName('project_end_time')"
                  prop="project_end_time">
                  <span class="readonly" v-if="itemEdit('project_end_time')">{{
                    formData.data.project_end_time | formatDate
                  }}</span>
                  <a-date-picker
                    v-else
                    style="width:100%"
                    v-model="formData.data.project_end_time"
                    :disabledDate="(currentDate)=>disabledEndDate(currentDate,'project_begin_time')"
                    :placeholder="setPlaceholder('project_end_time')"
                    valueFormat="YYYY-MM-DD"/>
                </a-form-model-item>
              </div>
              <div v-if="itemShow('XTSJ_design_person')">
                <div>
                  <span class="subTitle">设计组人员:(参与专业数量：{{
                    taskDataTwo.length > 9 ? taskDataTwo.length : `${taskDataTwo.length}`
                  }})</span>
                  <div class="right tabButtons" v-if="!itemEdit('XTSJ_design_person')">
                    <a-button @click="showDesignPersonModal=true" type="primary">一键导入</a-button>
                    <a-button type="primary" @click="exportDesignPersonGroup">一键导出</a-button>
                    <a-button @click="OneTouch" type="primary">一键生成</a-button>
                    <a-button @click="handleAdd" type="primary">新增</a-button>
                    <!--                    <a-popconfirm-->
                    <!--                      title="确认删除吗?"-->
                    <!--                      @confirm="onDelete">-->
                    <!--                      <a-button type="danger">删除</a-button>-->
                    <!--                    </a-popconfirm>-->
                    <a-button type="danger" @click="showDeleteModal">删除</a-button>
                  </div>
                </div>
                <a-table
                  bordered
                  size="small"
                  rowKey="id"
                  :key="taskDataTwoNum"
                  :customHeaderRow="customHeaderRow"
                  :columns="columns"
                  :dataSource="taskDataTwo"
                  :rowSelection="rowSelection"
                  :customRow="taskCustomRow"
                  :pagination="false">
                  <template #project_major>
                    <span>
                      <span style="color:red">*</span>参加项目专业
                    </span>
                  </template>
                  <template #project_major-content="text, record,index">
                    <editable-cell
                      :text="text"
                      @editchange="editchange(index, record, $event)"
                      :cellEditable="!itemEdit('XTSJ_design_person')"/>
                  </template>
                  <!--                  <template #professionPermit>-->
                  <!--                    <span>-->
                  <!--                      <span style="color:red">*</span>专业负责人-->
                  <!--                    </span>-->
                  <!--                  </template>-->
                  <!--                  <template #professionPermit-content="text,record,index">-->
                  <!--                                      <div class="permit" :class="itemEdit('XTSJ_design_person')?'disable':''" @click="itemEdit('XTSJ_design_person')?'':openRelevanceTable(index,'professionPermit',record.project_major)">{{ !text?'请选择':Array.isArray(text.user_id ) && text.user_id.length?text.user_id[0].name:'请选择' }}</div>-->
                  <!--                  </template>-->
                  <!--专业负责人-->
                  <template #official_manager>
                    <span class="profession-manager">
                      <span style="color:red">*</span>专业负责人
                      <a-popover
                        placement="top"
                        v-if="!formData.data.workflowInstanceId || (formData.data.workflowInstanceId && !itemEdit('official_manager'))">
                        <template slot="content">批量修改专业负责人（请先勾选！）</template>
                        <a-icon
                          type="user"
                          class="update-person"
                          v-show="!defaultValue.length"
                          @click="openStaff"/>
                        <staff-selector
                          v-show="false"
                          ref="official-manager"
                          :options="setStaffSelectorOptions('official_manager','请选择')"
                          @change="batchUpdatePerson"
                          :value="defaultValue"/>
                      </a-popover>
                    </span>
                  </template>
                  <template #official_manager-content="text,record,index">
                    <span
                      v-if="itemShow('official_manager')">
                      <span
                        class="readonly"
                        v-if="itemEdit('official_manager')">{{ text | formatSelector }}</span>
                      <staff-selector
                        v-else
                        :options="setStaffSelectorOptions('official_manager','请选择')"
                        @change="(value)=> record['official_manager'] = parseSelectorValueCopy(value,record.id)"
                        :value="text"/>
                    </span>
                  </template>
                  <!--专业主管总工-->
                  <template #official_chief>
                    <span>
                      <span style="color:red">*</span>专业主管总工
                    </span>
                  </template>
                  <template #official_chief-content="text,record,index">
                    <span
                      v-if="itemShow('official_chief')">
                      <span
                        class="readonly"
                        v-if="itemEdit('official_chief')">{{ text | formatSelector }}</span>
                      <staff-selector
                        v-else
                        :options="setStaffSelectorOptions('official_chief','请选择')"
                        @change="(value)=> record['official_chief'] = value"
                        :value="text"/>
                    </span>
                  </template>
                  <template #plan_begin_time>
                    <span>
                      <span style="color:red">*</span>计划开始时间
                    </span>
                  </template>
                  <template #plan_begin_time-content="text,record,index">
                    <a-date-picker
                      v-model="text"
                      @change="(date, dateString)=> startTimeChangeTwo(date, dateString,index,record.id)"
                      :disabledDate="(val)=>rangeStartPicker(val,index)"
                      :disabled="itemEdit('XTSJ_design_person')"
                      valueFormat="YYYY-MM-DD"/>
                  </template>
                  <template #plan_end_time>
                    <span>
                      <span style="color:red">*</span>计划结束时间
                    </span>
                  </template>
                  <template #plan_end_time-content="text,record,index">
                    <a-date-picker
                      v-model="text"
                      @change="(date, dateString)=> endTimeChangeTwo(date, dateString,index,record.id)"
                      :disabledDate="(val)=> rangeEndPicker(val,index)"
                      :disabled="itemEdit('XTSJ_design_person')"
                      valueFormat="YYYY-MM-DD"/>
                  </template>
                  <template #plan_duration>
                    <span>
                      <span style="color:red">*</span>计划工期
                    </span>
                  </template>
                  <!--专业设计提纲-->
                  <template #offical_outline-content="text,record">
                    <a-checkbox
                      :defaultChecked="text==='是'?true:false"
                      @change="designOutlineChange(record)"
                      :disabled="itemEdit('XTSJ_design_person')">必须
                    </a-checkbox>
                  </template>
                </a-table>
              </div>
            </a-collapse-panel>
            <a-collapse-panel key="5" class="collapsepanel5">
              <template #header>
                <div class="collapseHeader">
                  <div class="collapseHeaderTitle floatLeft">工作大纲成果文件</div>
                </div>
              </template>
              <div class="rowFlexWrap">
                <a-form-model-item
                  v-if="itemShow('modelReviewFlag')"
                  :colon="false"
                  class="rowFlexItem"
                  :label="getItemName('modelReviewFlag')"
                  prop="modelReviewFlag">
                  <span class="readonly" v-if="itemEdit('modelReviewFlag')">{{
                    formData.data.modelReviewFlag | formatSelector
                  }}</span>
                  <a-select
                    v-else
                    allowClear
                    v-model="formData.data.modelReviewFlag"
                    :mode="getMultiple('modelReviewFlag')?'multiple':'default'"
                    :placeholder="placeholder('modelReviewFlag')"
                    :getPopupContainer="trigger=>trigger.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode"
                    :options="getOptions('modelReviewFlag')"></a-select>
                </a-form-model-item>
                <a-form-model-item
                  v-if="itemShow('modelers')"
                  :colon="false"
                  class="rowFlexItem"
                  :label="getItemName('modelers')"
                  prop="modelers">
                  <span class="readonly" v-if="itemEdit('modelers')">{{
                    formData.data.modelers | formatSelector
                  }}</span>
                  <staff-selector
                    v-else
                    :options="setStaffSelectorOptions('modelers','请选择')"
                    @change="(value)=>staffSelectorChange(value,'modelers')"
                    :value="formData.data.modelers"/>
                </a-form-model-item>
                <a-form-model-item
                  v-if="itemShow('modelAttachment')"
                  :colon="false"
                  class="fullRowFlexItem"
                  :label="getItemName('modelAttachment')"
                  prop="modelAttachment">
                  <!--                  <a-popconfirm title="将会覆盖原有模型附件，请确认？" v-if="formData.data.modelAttachment.length" @confirm="openUploadModel">-->
                  <!--                    <a-button icon="upload">点击上传</a-button>-->
                  <!--                  </a-popconfirm>-->
                  <a-upload
                    ref="modelAttachment"
                    v-if="!itemEdit('modelAttachment')"
                    :disabled="isUploadingModelAttachment"
                    :placeholder="setPlaceholder('modelAttachment','请上传')"
                    :headers="upload.headers"
                    :multiple="false"
                    :action="upload.action"
                    :showUploadList="upload.showUploadList"
                    @change="(info)=>upload.change(info,'modelAttachment','isUploadingModelAttachment')"
                    :beforeUpload="(file)=> upload.beforeUpload(file,'modelAttachment')">
                    <a-button :disabled="isUploadingModelAttachment">
                      <a-icon :type="isUploadingModelAttachment?'loading':'upload'"/>
                      {{ isUploadingModelAttachment ? "上传中..." : "点击上传" }}
                    </a-button>
                  </a-upload>
                  <ul>
                    <li
                      class="clearfix fileInfos"
                      v-for="(item,index) in modelAttachments"
                      :key="index">
                      <a-icon type="paper-clip"/>
                      <span>{{ item.name }}</span>
                      <span v-if="item.status">(<span :style="{color:item.status==='成功'?'#32b683':item.status==='转换中'?'#ffba00':'red'}">{{ item.status }}</span>)</span>
                      <div class="right fileInfo">
                        <span>{{ item.creater }}</span>
                        <span>{{ item.createdTime }}</span>
                        <a-icon
                          type="eye"
                          @click="previewModel(item.lightweightAddress)"
                          v-if="item.lightweightAddress"></a-icon>
                        <a-tooltip title="轻量化转换" v-if="showTransferModal(item.name) && item.status==='未转换'">
                          <a-icon
                            type="line-height"
                            :spin="transSpinType==='line-height' && transformingIndex===index"
                            @click.stop="transferModelGeneral(item,index,'line-height')"
                            class="transfer"></a-icon>
                        </a-tooltip>
                        <a-icon type="download" @click.stop="download(item)"/>
                        <a-icon
                          v-if="!itemEdit('modelAttachment')"
                          type="delete"
                          @click.stop="removeFileModelAttachment(formData.data.modelAttachment,index,item.refId)"/>
                        <a-tooltip title="刷新" v-if="showTransferModal(item.name)">
                          <a-icon
                            v-if="item.status!=='成功'"
                            type="sync"
                            @click.stop="getModelAttachment()"
                            :spin="transSpinType==='sync' && transformingIndex===index"
                            class="sync"/>
                        </a-tooltip>
                      </div>
                    </li>
                  </ul>
                  <!--                  <ul>-->
                  <!--                    <li-->
                  <!--                      class="clearfix fileInfos"-->
                  <!--                      v-for="(item,index) in formData.data.modelAttachment"-->
                  <!--                      :key="index">-->
                  <!--                      <a-icon type="paper-clip"/>-->
                  <!--                      <span>{{ item.name }}</span>-->
                  <!--                      <div class="right fileInfo">-->
                  <!--                        <span>{{ item.creater.name }}</span>-->
                  <!--                        <span>{{ item.createdTime }}</span>-->
                  <!--                        <a-icon-->
                  <!--                          type="eye"-->
                  <!--                          @click="preview"-->
                  <!--                          v-if="wProjectName==='协同平台验收演示项目'"></a-icon>-->
                  <!--                        <a-icon type="download" @click.stop="download(item)"/>-->
                  <!--                        <a-icon-->
                  <!--                          v-if="!itemEdit('modelAttachment')"-->
                  <!--                          type="delete"-->
                  <!--                          @click.stop="removeFile(formData.data.modelAttachment,index)"/>-->
                  <!--                      </div>-->
                  <!--                    </li>-->
                  <!--                  </ul>-->
                </a-form-model-item>
              </div>
              <div>
                <span class="subTitle">附件上传</span>
                <template v-if="activityCode==='edit_workoutline'&&!itemEdit('attachment')">
                  <a-button
                    type="primary"
                    size="small"
                    :loading="mergeLoading"
                    :disabled="!this.formData.data.id || !formData.data.XTSJ_workoutline_para.length"
                    style="margin-left: 24px;"
                    @click="createWorkOutlineFile">合成大纲
                  </a-button>
                  <!--                  <a-popconfirm-->
                  <!--                    title="制作完成后，将会覆盖已存在的工作大纲，请确认？"-->
                  <!--                    okText="确认"-->
                  <!--                    cancelText="取消"-->
                  <!--                    @confirm="createWorkOutlineFile"-->
                  <!--                    v-else>-->
                  <!--                    <a-button-->
                  <!--                      type="primary"-->
                  <!--                      size="small"-->
                  <!--                      style="padding: 0 4px;margin-left: 24px;">合成大纲</a-button>-->
                  <!--                  </a-popconfirm>-->
                </template>
              </div>
              <div class="rowFlexWrap">
                <a-form-model-item
                  v-if="itemShow('attachment')"
                  :colon="false"
                  class="fullRowFlexItem"
                  :label="getItemName('attachment')"
                  prop="attachment">
                  <ul>
                    <li
                      class="clearfix fileInfos"
                      v-for="(item,index) in formData.data.attachment"
                      :key="index"
                      @click="goDetail(item)">
                      <a-icon type="paper-clip"/>
                      <span>{{ item.name }}</span>
                      <div class="right fileInfo">
                        <span>{{ item.creater.name }}</span>
                        <span>{{ item.createdTime }}</span>
                        <a-tooltip
                          title="文档编辑"
                          v-if="item.name.indexOf('.docx')>-1 && isEditOutlineWork">
                          <a-icon
                            class="actionIcon"
                            type="form"
                            @click.stop="editFile(item.refId,item.id,'total')"/>
                        </a-tooltip>
                        <a-icon type="download" @click.stop="download(item)"/>
                        <a-icon
                          v-if="!itemEdit('attachment')"
                          type="delete"
                          @click.stop="removeFile(formData.data.attachment,index)"/>
                      </div>
                    </li>
                  </ul>
                  <a-upload
                    v-if="!itemEdit('attachment')"
                    :disabled="itemEdit('attachment')||isUploading"
                    :headers="upload.headers"
                    :multiple="upload.multiple"
                    :action="upload.action"
                    :showUploadList="upload.showUploadList"
                    :placeholder="setPlaceholder('attachment','请上传')"
                    @change="(info)=>upload.change(info,'attachment','isUploading')"
                    :beforeUpload="(file)=> upload.beforeUpload(file,'attachment')">
                    <a-button :disabled="itemEdit('attachment')||isUploading">
                      <a-icon :type="isUploading?'loading':'upload'"/>
                      {{ isUploading ? "上传中..." : "点击上传" }}
                    </a-button>
                  </a-upload>
                </a-form-model-item>
                <div v-if="itemShow('XTSJ_workoutline_para')">
                  <a-table
                    :data-source="formData.data.XTSJ_workoutline_para"
                    :columns="workOutlineChapterColumns"
                    :key="designParaKey">
                    <template slot="attach" slot-scope="t,r">
                      <div v-if="Array.isArray(t)">
                        <a
                          v-for="(att,attIndex) in t"
                          :key="attIndex"
                          class="flex flex-center-align para">
                          <span @click.stop="goDetail(att)">{{ att.name }}</span>
                          <a-tooltip
                            title="文档编辑"
                            v-if="att.name.indexOf('.docx')>-1 && isEditOutlineWork">
                            <a-icon
                              class="actionIcon"
                              type="form"
                              @click.stop="editFile(att.refId,r.id,'sub',r.title)"/>
                          </a-tooltip>
                          <a-icon type="download" @click.stop="download(att)"/>
                          <a-popconfirm
                            title="删除后不可恢复哦，确认删除吗？"
                            @confirm="removeParaFile(r.id,att.id)">
                            <a-icon type="delete" v-if="!itemEdit('XTSJ_workoutline_para')"/>
                          </a-popconfirm>
                        </a>
                        <a-button
                          size="small"
                          @click="uploadFile(r.id)"
                          v-if="!itemEdit('XTSJ_workoutline_para')">点击上传
                        </a-button>
                      </div>
                    </template>
                  </a-table>
                </div>
              </div>
            </a-collapse-panel>
          </a-collapse>
        </a-form-model>
      </div>
      <Workflow
        v-else-if="leftButtonLinks.activeIndex===1"
        :workflowInstanceId="formData.data.workflowInstanceId"
        :workItemId="formData.data.workItemId"></Workflow>
      <a-collapse
        v-else
        :defaultActiveKey="['6']"
        :bordered="false"
        expandIconPosition="right">
        <a-collapse-panel key="6" class="collapsepanel4 recommends full-height">
          <template #header>
            <div class="collapseHeader">
              <div class="collapseHeaderTitle floatLeft">总工指导意见区域</div>
            </div>
          </template>
          <a-timeline>
            <a-timeline-item v-for="(opinion,key) in chiefOpinions" :key="key">
              <div class="rowFlexWrap collapsepanel4 recommend">
                <div class="rowFlexItem">
                  <span class="">指导意见创建人</span>
                  <div class="ant-form-item-control-wrapper"> {{ opinion.userName }}</div>
                </div>
                <div class="rowFlexItem">
                  <span class="">岗位</span>
                  <div class="ant-form-item-control-wrapper"> {{ opinion.title }}</div>
                </div>
                <div class="rowFlexItem">
                  <span class="">意见提交时间</span>
                  <div class="ant-form-item-control-wrapper"> {{ opinion.createdTime }}</div>
                </div>
                <div class="rowFlexItem">
                  <span class="">已签收人员列表</span>
                  <div class="ant-form-item-control-wrapper">{{ opinion.signers.join(';') }}</div>
                </div>
                <div class="rowFlexItem">
                  <span class="">未签收人员列表</span>
                  <div class="ant-form-item-control-wrapper">{{ opinion.unsigners.join(';') }}</div>
                </div>
                <div class="fullRowFlexItem">
                  <span class="">总工指导意见</span>
                  <rich-text
                    class="flex-auto"
                    ref="richTextEditor"
                    :objectId="`${key}`"
                    :contentValue="opinion.opinion"
                    :disabled="true"
                  />
                  <a-button
                    type="primary"
                    v-if="opinion.signFlag"
                    @click="signChiefOpinion(opinion.id)"
                    class="sign-btn">签收
                  </a-button>
                </div>
              </div>
            </a-timeline-item>
          </a-timeline>
          <!--                <a-form-model-item-->
          <!--                  v-if="itemShow('feedback_creater')"-->
          <!--                  :colon="false"-->
          <!--                  class="fullRowFlexItem"-->
          <!--                  :label="getItemName('feedback_creater')"-->
          <!--                  prop="feedback_creater">-->
          <!--                  <span class="readonly" v-if="itemEdit('feedback_creater')">{{ formData.data.feedback_creater }}</span>-->
          <!--                  <a-textarea-->
          <!--                    v-else-->
          <!--                    :autoSize="{minRows:3}"-->
          <!--                    :placeholder="placeholder('feedback_creater')"-->
          <!--                    v-model="formData.data.feedback_creater"-->
          <!--                    allowClear/>-->
          <!--                </a-form-model-item>-->
          <!--                <a-form-model-item-->
          <!--                  v-if="itemShow('chief_feedback')"-->
          <!--                  :colon="false"-->
          <!--                  class="fullRowFlexItem"-->
          <!--                  :label="getItemName('chief_feedback')"-->
          <!--                  prop="chief_feedback">-->
          <!--                  <span class="readonly" v-if="itemEdit('chief_feedback')">{{ formData.data.chief_feedback }}</span>-->
          <!--                  <a-textarea-->
          <!--                    v-else-->
          <!--                    :autoSize="{minRows:3}"-->
          <!--                    :placeholder="placeholder('chief_feedback')"-->
          <!--                    v-model="formData.data.chief_feedback"-->
          <!--                    allowClear/>-->
          <!--                </a-form-model-item>-->
          <!--                <a-form-model-item-->
          <!--                  v-if="itemShow('unsigned_ids')"-->
          <!--                  :colon="false"-->
          <!--                  class="fullRowFlexItem"-->
          <!--                  :label="getItemName('unsigned_ids')"-->
          <!--                  prop="unsigned_ids">-->
          <!--                  <a-tag color="#ffba00" v-for="(item,index) in formData.data.unsigned_ids" :key="index">{{ item }}</a-tag>-->
          <!--                </a-form-model-item>-->
          <!--                <a-form-model-item-->
          <!--                  v-if="itemShow('signed_ids')"-->
          <!--                  :colon="false"-->
          <!--                  class="fullRowFlexItem"-->
          <!--                  :label="getItemName('signed_ids')"-->
          <!--                  prop="signed_ids">-->
          <!--                  <a-tag color="#87d068" v-for="(item,index) in formData.data.signed_ids" :key="index">{{ item }}</a-tag>-->
          <!--                </a-form-model-item>-->
        </a-collapse-panel>
      </a-collapse>
    </div>
    <a-modal
      :visible="visible"
      @ok="handleOk"
      @cancel="handleCancel"
    >
      <template v-slot:title="">
        <div class="flex flex-center-align pro-title">
          <b>项目专业</b>
          <a-input
            v-model="professionalName"
            placeholder="请输入专业名称"
            @change="filterProfessional"></a-input>
        </div>
      </template>
      <div style="width: 100%;max-height:200px;overflow: auto" class="scrollbar-default">
        <a-table
          bordered
          size="small"
          rowKey="key"
          :pagination="false"
          :customHeaderRow="customHeaderRow"
          :rowSelection="{ selectedRowKeys: selectedRowKeys, onChange: onSelectChange }"
          :columns="projectProfessionalColumns"
          :data-source="projectProfessionalList"></a-table>
      </div>
    </a-modal>
    <a-modal
      :afterClose="dialogModalConfiguration.afterClose"
      :okText="dialogModalConfiguration.okText"
      :destroyOnClose="true"
      :confirmLoading="dialogModalConfiguration.confirmLoading"
      :wrapClassName="dialogModalConfiguration.showComment?'':'modalWrap'"
      v-model="dialogModalConfiguration.visible"
      @ok="dialogModalConfiguration.OK"
      centered>
      <a-form-model ref="dialogForm" :model="dialogTaskForm.formData" :rules="dialogTaskForm.rules">
        <a-form-model-item
          v-show="dialogModalConfiguration.showComment"
          required
          prop="comment"
          class="modal-model-item">
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
          <a-tag v-for="(item,index) in commonReplys.replys" :key="index" @click="tagChange(item)">
            {{ item }}
          </a-tag>
        </div>
      </div>
      <template #title>
        <a-icon style="padding-right: 5px" type="question-circle" theme="twoTone"/>
        <span>{{ dialogModalConfiguration.title }}</span>
      </template>
    </a-modal>
    <!--    <work-outline-models-->
    <!--      :showWorkOutlineModels="showWorkOutlineModels"-->
    <!--      :workOutlineDataId="workOutlineDataId"-->
    <!--      :wProjectName="wProjectName"-->
    <!--      @eidtWorkOutlineFile="eidtWorkOutlineFile"-->
    <!--      @closeWorkOutlineModels="closeWorkOutlineModels"-->
    <!--      @openEditWorkOutlinePanel="openEditWorkOutlinePanel"/>-->
    <edit-work-outline-panel
      :workOutlineDataId="workOutlineDataId"
      :showEditWorkOutlinePanel="showEditWorkOutlinePanel"
      :wProjectName="wProjectName"
      :editorUrl="selectWorkOutlineFile.editorUrl"
      :modalTitle="modalTitle"
      :okText="okText"
      @saveEditFile="saveEditFile"
      :showExtendButton="showExtendButton"
      :extendBtnText="extendBtnText"
      @extendFn="extendFn"
      :defaultFileType="selectWorkOutlineFile.fileType"
      :defaultBussiness="selectWorkOutlineFile.bussiness"
      :defaultProjectType="selectWorkOutlineFile.projectType"
      :defaultProjectState="selectWorkOutlineFile.projectState"
      :defaultProfessionType="selectWorkOutlineFile.professionType"
      :defaultTitle="selectWorkOutlineFile.defaultTitle"
      @closeEditWorkOutlinePanel="closeEditWorkOutlinePanel"/>
    <relevance-form-modal
      :showRelevanceTable="showRelevanceTable"
      :relevanceConditions="relevanceConditions"
      @closeRelevanceModal="closeRelevanceModal"
      :relevanceFormData="formData.data"
      :selectedSubTabRowIndex="selectedRowIndex"
      :relevanceParentKey="relevanceParentKey"
      @bindPerson="bindPerson"
      :relevanceQueryCode="relevanceQueryCode"
      :relevanceCode="relevanceCode"/>
    <a-modal
      title="导入工作大纲设计人员信息"
      :visible="showDesignPersonModal"
      :keyboard="false"
      :footer="null"
      destroyOnClose
      @cancel="closeDesignPersonModal"
      :maskClosable="false">
      为确保上传数据与工作大纲设计人员信息内容匹配，请先<a @click="downloadTemplate">下载示例文件</a><br><br>
      上传本地文件：
      <a-button type="primary" :loading="uploadLoading" @click="importWorkOutlineInfoTemplate">
        点击上传
      </a-button>
    </a-modal>
    <input
      class="file-input"
      ref="fileInput"
      type="file"
      :key="fileKey"
      accept="xlsx, xls"
      @change="(e) => fileInput(e)"
    />
    <input
      class="file-input"
      ref="chapterFileInput"
      type="file"
      :key="fileKey+1"
      @change="(e) => chapterFileInput(e)"
    />
    <opinions-modal
      v-if="showOpinionModal"
      :showOpinionModal="showOpinionModal"
      :opinionTitle="opinionTitle"
      :workOutlineDataId="workOutlineDataId"
      @updateForm="updateForm"
      @closeOpinionModal="closeOpinionModal"
      :job="activityCode==='manu_cheif_audit'?'生产单位分管总工':activityCode==='company_cheif_audit'?'公司主管总工':''"/>
  </div>
</template>

<script src="./index.ts"/>
<style lang="less" scoped>
@import url("./index.less");
@import '../../../../styles/public.module.less';
@import '../common.less';
</style>
