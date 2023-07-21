<template>
  <a-form-model
    :model="formData.data"
    :rules="formData.rules"
    ref="productionForm"
    labelAlign="left">
    <application-list v-show="false" class="divide"/>
    <a-collapse :defaultActiveKey="collapseActiveKey" :bordered="false" expandIconPosition="right">
      <a-collapse-panel key="1">
        <template #header>
          <div class="collapseHeader">
            <div class="collapseHeaderTitle left">审批记录</div>
            <div v-if="workFlowInfo.participants[0]" class="collapseHeaderNode collapseHeaderItem left">当前节点:<em>{{ workFlowInfo.participants[0].activityName }}</em></div>
            <div v-if="workFlowInfo.participants[0]" class="collapseHeaderHandle collapseHeaderItem left">当前处理人:<em v-for="(item,index) in workFlowInfo.participants[0].participants" :key="index">{{ item.name }}</em></div>
            <div v-if="workFlowInfo.status" class="collapseHeaderWorkflow collapseHeaderItem left">流程追踪:<em>{{ getSequenceString(workFlowInfo.status) }}</em></div>
            <div class="collapseHeaderTime collapseHeaderItem left">已用时<em v-show="usedDays>0">{{ usedDays }}</em><i v-show="usedDays>0">天</i><em v-show="usedDays>0||usedHours>0">{{ usedHours }}</em><i v-show="usedDays>0||usedHours>0">小时</i><em>{{ usedMinutes }}</em><i>分钟</i>
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
            <div class="collapseHeaderTitle left">项目基本信息</div>
          </div>
        </template>
        <div class="rowFlexWrap">
          <a-form-model-item
            v-if="itemShow('glid')"
            :colon="false"
            class="rowFlexItem"
            :label="getItemName('glid')"
            prop="glid">
            <div
              class="permit"
              v-if="true"
              :class="itemEdit('glid')?'disable ref-status':'ref-edit'"
              @click="itemEdit('glid')?goFormDetail(formData.data.glid.schemaCode,formData.data.glid.id):openRelevanceTable('glid')">{{ formData.data.glid && trnasDisplayFieldValue(formData.data.glid[formData.sheetConfig.glid.displayField],formData.sheetConfig.glid.displayField) }}</div>
          </a-form-model-item>
          <a-form-model-item
            v-if="itemShow('engineering_name')"
            :colon="false"
            class="rowFlexItem"
            :label="getItemName('engineering_name')"
            prop="engineering_name">
            <span class="readonly" v-if="itemEdit('engineering_name')">{{ formData.data.engineering_name }}</span>
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
            <span class="readonly" v-if="itemEdit('engineering_number')">{{ formData.data.engineering_number }}</span>
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
            <span class="readonly" v-if="itemEdit('engineering_location')">{{ formData.data.engineering_location }}</span>
            <a-select
              v-else
              allowClear
              v-model="formData.data.engineering_location"
              :mode="getMultiple('engineering_location')?'multiple':'default'"
              @focus="updateOptions('engineering_location')"
              showSearch
              :getPopupContainer="trigger=>trigger.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode"
              :filterOption="selectFilterOption"
              :placeholder="placeholder('engineering_location')"
              :options="getOptions('engineering_location')"></a-select>
          </a-form-model-item>
          <a-form-model-item
            v-if="itemShow('engineeringType')"
            :colon="false"
            class="rowFlexItem"
            :label="getItemName('engineeringType')"
            prop="engineeringType">
            <span class="readonly" v-if="itemEdit('engineeringType')">{{ formData.data.engineeringType | formatSelector }}</span>
            <a-select
              v-else
              allowClear
              v-model="formData.data.engineeringType"
              :mode="getMultiple('engineeringType')?'multiple':'default'"
              @focus="updateOptions('engineeringType')"
              showSearch
              :getPopupContainer="trigger=>trigger.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode"
              :filterOption="selectFilterOption"
              :placeholder="placeholder('engineeringType')"
              :options="getOptions('engineeringType')"></a-select>
          </a-form-model-item>
          <a-form-model-item
            v-if="itemShow('industryType')"
            :colon="false"
            class="rowFlexItem"
            :label="getItemName('industryType')"
            prop="industryType">
            <span class="readonly" v-if="itemEdit('industryType')">{{ formData.data.industryType | formatSelector }}</span>
            <a-select
              v-else
              allowClear
              v-model="formData.data.industryType"
              :mode="getMultiple('industryType')?'multiple':'default'"
              @focus="updateOptions('industryType')"
              showSearch
              :getPopupContainer="trigger=>trigger.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode"
              :filterOption="selectFilterOption"
              :placeholder="placeholder('industryType')"
              :options="getOptions('industryType')"></a-select>
          </a-form-model-item>
          <a-form-model-item
            v-if="itemShow('projectType')"
            :colon="false"
            class="rowFlexItem"
            :label="getItemName('projectType')"
            prop="projectType">
            <span class="readonly" v-if="itemEdit('projectType')">{{ formData.data.projectType | formatSelector }}</span>
            <a-select
              v-else
              allowClear
              v-model="formData.data.projectType"
              :mode="getMultiple('projectType')?'multiple':'default'"
              @focus="updateOptions('projectType')"
              showSearch
              :filterOption="selectFilterOption"
              :getPopupContainer="trigger=>trigger.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode"
              :placeholder="placeholder('projectType')"
              :options="getOptions('projectType')"></a-select>
          </a-form-model-item>
          <a-form-model-item
            v-if="itemShow('constructionPhase')"
            :colon="false"
            class="rowFlexItem"
            :label="getItemName('constructionPhase')"
            prop="constructionPhase">
            <span class="readonly" v-if="itemEdit('constructionPhase')">{{ formData.data.constructionPhase | formatSelector }}</span>
            <a-select
              v-else
              allowClear
              v-model="formData.data.constructionPhase"
              :mode="getMultiple('constructionPhase')?'multiple':'default'"
              @focus="updateOptions('constructionPhase')"
              showSearch
              :getPopupContainer="trigger=>trigger.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode"
              :filterOption="selectFilterOption"
              :placeholder="placeholder('constructionPhase')"
              :options="getOptions('constructionPhase')"></a-select>
          </a-form-model-item>
          <a-form-model-item
            v-if="itemShow('engineering_stage')"
            :colon="false"
            class="rowFlexItem"
            :label="getItemName('engineering_stage')"
            prop="engineering_stage">
            <span class="readonly" v-if="itemEdit('engineering_stage')">{{ formData.data.engineering_stage | formatSelector }}</span>
            <a-select
              v-else
              allowClear
              v-model="formData.data.engineering_stage"
              :mode="getMultiple('engineering_stage')?'multiple':'default'"
              @focus="updateOptions('engineering_stage')"
              showSearch
              :filterOption="selectFilterOption"
              :getPopupContainer="trigger=>trigger.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode"
              :placeholder="placeholder('engineering_stage')"
              :options="getOptions('engineering_stage')"></a-select>
          </a-form-model-item>
          <a-form-model-item
            v-if="itemShow('modelType')"
            :colon="false"
            class="rowFlexItem"
            :label="getItemName('modelType')"
            prop="modelType">
            <span class="readonly" v-if="itemEdit('modelType')">{{ formData.data.modelType | formatSelector }}</span>
            <a-select
              v-else
              allowClear
              v-model="formData.data.modelType"
              :mode="getMultiple('modelType')?'multiple':'default'"
              @focus="updateOptions('modelType')"
              @change="changeOptions('modelType')"
              showSearch
              :getPopupContainer="trigger=>trigger.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode"
              :placeholder="placeholder('modelType')"
              :options="getOptions('modelType')"></a-select>
          </a-form-model-item>
          <a-form-model-item
            v-if="itemShow('picture')"
            :colon="false"
            class="fullRowFlexItem"
            :label="getItemName('picture')"
            prop="picture">
            <a-upload
              v-if="!itemEdit('picture')"
              :disabled="isUploading"
              :placeholder="setPlaceholder('picture','请上传')"
              :headers="upload.headers"
              :multiple="upload.multiple"
              :action="upload.action"
              :showUploadList="upload.showUploadList"
              @change="(info)=>upload.change(info,'picture','isUploading')"
              :beforeUpload="upload.beforeUpload">
              <a-button :disabled="isUploading"> <a-icon :type="isUploading?'loading':'upload'" /> {{ isUploading?"上传中...":"点击上传" }} </a-button>
            </a-upload>
            <ul >
              <li
                class="clearfix fileInfos"
                v-for="(item,index) in formData.data.picture"
                :key="index">
                <a-icon type="paper-clip" />
                <span>{{ item.name }}</span>
                <div class="right fileInfo">
                  <span>{{ item.creater.name }}</span>
                  <span>{{ item.createdTime }}</span>
                  <a-icon type="download" @click.stop="download(item)"/>
                  <a-icon v-if="!itemEdit('picture')" type="delete" @click.stop="removeFile(formData.data.picture,index)"/>
                </div>
              </li>
            </ul>
          </a-form-model-item>
        </div>
      </a-collapse-panel>
      <a-collapse-panel key="3" class="collapsepanel3">
        <template #header>
          <div class="collapseHeader">
            <div class="collapseHeaderTitle left">相关人员信息</div>
            <div class="left subTitle">(由经营生产管理部门指定)</div>
          </div>
        </template>
        <div class="rowFlexWrap">
          <a-form-model-item
            v-if="itemShow('manufacturer_admin')"
            :colon="false"
            class="rowFlexItem"
            :label="getItemName('manufacturer_admin')"
            prop="manufacturer_admin">
            <span class="readonly" v-if="itemEdit('manufacturer_admin')">{{ formData.data.manufacturer_admin | formatSelector }}</span>
            <staff-selector
              v-else
              :options="setStaffSelectorOptions('manufacturer_admin','请选择')"
              @change="(value)=>staffSelectorChange(value,'manufacturer_admin')"
              :value="formData.data.manufacturer_admin"/>
          </a-form-model-item>
          <a-form-model-item
            v-if="itemShow('manufacturer_depart_manager')"
            :colon="false"
            class="rowFlexItem"
            :label="getItemName('manufacturer_depart_manager')"
            prop="manufacturer_depart_manager">
            <span class="readonly" v-if="itemEdit('manufacturer_depart_manager')">{{ formData.data.manufacturer_depart_manager | formatSelector }}</span>
            <staff-selector
              v-else
              :options="setStaffSelectorOptions('manufacturer_depart_manager','请选择')"
              @change="(value)=>staffSelectorChange(value,'manufacturer_depart_manager')"
              :value="formData.data.manufacturer_depart_manager"/>
          </a-form-model-item>
          <a-form-model-item
            v-if="itemShow('manufacturer')"
            :colon="false"
            class="rowFlexItem"
            :label="getItemName('manufacturer')"
            prop="manufacturer">
            <span class="readonly" v-if="itemEdit('manufacturer')">{{ formData.data.manufacturer | formatSelector }}</span>
            <staff-selector
              v-else
              :options="setStaffSelectorOptions('manufacturer','请选择')"
              @change="(value)=>staffSelectorChange(value,'manufacturer')"
              :value="formData.data.manufacturer"/>
          </a-form-model-item>
          <a-form-model-item
            v-if="itemShow('manufacturer_manager')"
            :colon="false"
            class="rowFlexItem"
            :label="getItemName('manufacturer_manager')"
            prop="manufacturer_manager">
            <span class="readonly" v-if="itemEdit('manufacturer_manager')">{{ formData.data.manufacturer_manager | formatSelector }}</span>
            <staff-selector
              v-else
              :options="setStaffSelectorOptions('manufacturer_manager','请选择')"
              @change="(value)=>staffSelectorChange(value,'manufacturer_manager')"
              :value="formData.data.manufacturer_manager"/>
          </a-form-model-item>
          <a-form-model-item
            v-if="itemShow('collaboration')"
            :colon="false"
            class="rowFlexItem"
            :label="getItemName('collaboration')"
            prop="collaboration">
            <span class="readonly" v-if="itemEdit('collaboration')">{{ formData.data.collaboration | formatSelector }}</span>
            <staff-selector
              v-else
              :options="setStaffSelectorOptions('collaboration','请选择')"
              @change="(value)=>staffSelectorChange(value,'collaboration')"
              :value="formData.data.collaboration"/>
          </a-form-model-item>
          <a-form-model-item
            v-if="itemShow('collaboration_manager')"
            :colon="false"
            class="rowFlexItem"
            :label="getItemName('collaboration_manager')"
            prop="collaboration_manager">
            <span class="readonly" v-if="itemEdit('collaboration_manager')">{{ formData.data.collaboration_manager | formatSelector }}</span>
            <staff-selector
              v-else
              :options="setStaffSelectorOptions('collaboration_manager','请选择')"
              @change="(value)=>staffSelectorChange(value,'collaboration_manager')"
              :value="formData.data.collaboration_manager"/>
          </a-form-model-item>
          <a-form-model-item
            v-if="itemShow('company_manager')"
            :colon="false"
            class="rowFlexItem"
            :label="getItemName('company_manager')"
            prop="company_manager">
            <span class="readonly" v-if="itemEdit('company_manager')">{{ formData.data.company_manager | formatSelector }}</span>
            <staff-selector
              v-else
              :options="setStaffSelectorOptions('company_manager','请选择')"
              @change="(value)=>staffSelectorChange(value,'company_manager')"
              :value="formData.data.company_manager"/>
          </a-form-model-item>
          <a-form-model-item
            v-if="itemShow('archivist')"
            :colon="false"
            class="rowFlexItem"
            :label="getItemName('archivist')"
            prop="archivist">
            <span class="readonly" v-if="itemEdit('archivist')">{{ formData.data.archivist | formatSelector }}</span>
            <staff-selector
              v-else
              :options="setStaffSelectorOptions('archivist','请选择')"
              @change="(value)=>staffSelectorChange(value,'archivist')"
              :value="formData.data.archivist"/>
          </a-form-model-item>
          <a-form-model-item
            v-if="itemShow('actual_contract_money')"
            :colon="false"
            class="rowFlexItem"
            :label="getItemName('actual_contract_money')"
            prop="actual_contract_money">
            <span class="readonly" v-if="itemEdit('actual_contract_money')">{{ formData.data.actual_contract_money }}<em v-if="formData.data.actual_contract_money"> 万元</em></span>
            <a-input-number
              v-else
              v-model="formData.data.actual_contract_money"
              :placeholder="placeholder('actual_contract_money')"
              style="width:100%"
              :min="0" />
          </a-form-model-item>
          <a-form-model-item
            v-if="itemShow('evaluation_contract_money')"
            :colon="false"
            class="rowFlexItem"
            :label="getItemName('evaluation_contract_money')"
            prop="evaluation_contract_money">
            <span class="readonly" v-if="itemEdit('evaluation_contract_money')">{{ formData.data.evaluation_contract_money }}<em v-if="formData.data.evaluation_contract_money"> 万元</em></span>
            <a-input-number
              v-else
              v-model="formData.data.evaluation_contract_money"
              :placeholder="placeholder('evaluation_contract_money')"
              style="width:100%"
              :min="0" />
          </a-form-model-item>
          <a-form-model-item
            v-if="itemShow('evaluation_contract_remark')"
            :colon="false"
            class="fullRowFlexItem"
            :label="getItemName('evaluation_contract_remark')"
            prop="evaluation_contract_remark">
            <span class="readonly" v-if="itemEdit('evaluation_contract_remark')">{{ formData.data.evaluation_contract_remark }}</span>
            <a-textarea
              v-else
              :placeholder="placeholder('evaluation_contract_remark')"
              :autoSize="{minRows:3}"
              v-model="formData.data.evaluation_contract_remark"
              allowClear/>
          </a-form-model-item>
        </div>
      </a-collapse-panel>
      <a-collapse-panel key="4" class="collapsepanel4">
        <template #header>
          <div class="collapseHeader">
            <div class="collapseHeaderTitle left">相关人员信息</div>
            <div class="left subTitle">(由经营生产管理部门分管总经理指定)</div>
          </div>
        </template>
        <a-form-model-item
          v-if="itemShow('company_chief_engineer')"
          :colon="false"
          class="rowFlexItem"
          :label="getItemName('company_chief_engineer')"
          prop="company_chief_engineer">
          <span class="readonly" v-if="itemEdit('company_chief_engineer')">{{ formData.data.company_chief_engineer | formatSelector }}</span>
          <staff-selector
            v-else
            :options="setStaffSelectorOptions('company_chief_engineer','请选择')"
            @change="(value)=>staffSelectorChange(value,'company_chief_engineer')"
            :value="formData.data.company_chief_engineer"/>
        </a-form-model-item>
        <div class="rowFlexWrap">
          <a-form-model-item
            v-if="itemShow('project_level')"
            :colon="false"
            class="rowFlexItem"
            :label="getItemName('project_level')"
            prop="project_level">
            <span class="readonly" v-if="itemEdit('project_level')">{{ formData.data.project_level }}</span>
            <a-radio-group
              :placeholder="setPlaceholder('project_level')"
              v-else
              v-model="formData.data.project_level"
              :options="getOptions('project_level',true)"></a-radio-group>
          </a-form-model-item>
          <a-form-model-item
            v-if="itemShow('company_review_flag')"
            :colon="false"
            class="rowFlexItem"
            :label="getItemName('company_review_flag')"
            prop="company_review_flag">
            <span class="readonly" v-if="itemEdit('company_review_flag')">{{ formData.data.company_review_flag }}</span>
            <a-radio-group
              :placeholder="setPlaceholder('company_review_flag')"
              v-else
              v-model="formData.data.company_review_flag"
              :options="getOptions('company_review_flag',true)"></a-radio-group>
          </a-form-model-item>
        </div>
      </a-collapse-panel>
      <a-collapse-panel key="5" class="collapsepanel5">
        <template #header>
          <div class="collapseHeader">
            <div class="collapseHeaderTitle left">相关人员信息</div>
            <div class="left subTitle">(由生产单位指定)</div>
          </div>
        </template>
        <div class="rowFlexWrap">
          <a-form-model-item
            v-if="itemShow('manufacturer_chief_engineer')"
            :colon="false"
            class="rowFlexItem"
            :label="getItemName('manufacturer_chief_engineer')"
            prop="manufacturer_chief_engineer">
            <span class="readonly" v-if="itemEdit('manufacturer_chief_engineer')">{{ formData.data.manufacturer_chief_engineer | formatSelector }}</span>
            <staff-selector
              v-else
              :options="setStaffSelectorOptions('manufacturer_chief_engineer','请选择')"
              @change="(value)=>staffSelectorChange(value,'manufacturer_chief_engineer')"
              :value="formData.data.manufacturer_chief_engineer"/>
          </a-form-model-item>
          <a-form-model-item
            v-if="itemShow('manufacturer_vice_engineer')"
            :colon="false"
            class="rowFlexItem"
            :label="getItemName('manufacturer_vice_engineer')"
            prop="manufacturer_vice_engineer">
            <span class="readonly" v-if="itemEdit('manufacturer_vice_engineer')">{{ formData.data.manufacturer_vice_engineer | formatSelector }}</span>
            <staff-selector
              v-else
              :options="setStaffSelectorOptions('manufacturer_vice_engineer','请选择')"
              @change="(value)=>staffSelectorChange(value,'manufacturer_vice_engineer')"
              :value="formData.data.manufacturer_vice_engineer"/>
          </a-form-model-item>
          <a-form-model-item
            v-if="itemShow('manufacturer_vice_manager')"
            :colon="false"
            class="rowFlexItem"
            :label="getItemName('manufacturer_vice_manager')"
            prop="manufacturer_vice_manager">
            <span class="readonly" v-if="itemEdit('manufacturer_vice_manager')">{{ formData.data.manufacturer_vice_manager | formatSelector }}</span>
            <staff-selector
              v-else
              :options="setStaffSelectorOptions('manufacturer_vice_manager','请选择')"
              @change="(value)=>staffSelectorChange(value,'manufacturer_vice_manager')"
              :value="formData.data.manufacturer_vice_manager"/>
          </a-form-model-item>
          <a-form-model-item
            v-if="itemShow('project_manager')"
            :colon="false"
            class="rowFlexItem"
            :label="getItemName('project_manager')"
            prop="project_manager">
            <span class="readonly" v-if="itemEdit('project_manager')">{{ formData.data.project_manager | formatSelector }}</span>
            <staff-selector
              v-else
              :options="setStaffSelectorOptions('project_manager','请选择')"
              @change="(value)=>staffSelectorChange(value,'project_manager')"
              :value="formData.data.project_manager"/>
          </a-form-model-item>
          <a-form-model-item
            v-if="itemShow('departHeaders')"
            :colon="false"
            class="rowFlexItem"
            :label="getItemName('departHeaders')"
            prop="departHeaders">
            <span class="readonly" v-if="itemEdit('departHeaders')">{{ formData.data.departHeaders | formatSelector }}</span>
            <staff-selector
              v-else
              :options="setStaffSelectorOptions('departHeaders','请选择')"
              @change="(value)=>staffSelectorChange(value,'departHeaders')"
              :value="formData.data.departHeaders"/>
          </a-form-model-item>
        </div>
      </a-collapse-panel>
      <a-collapse-panel key="6" class="collapsepanel6">
        <template #header>
          <div class="collapseHeader">
            <div class="collapseHeaderTitle left">项目计划信息</div>
          </div>
        </template>
        <div class="rowFlexWrap">
          <a-form-model-item
            v-if="itemShow('year')"
            :colon="false"
            class="rowFlexItem"
            :label="getItemName('year')"
            prop="year">
            <span class="readonly" v-if="itemEdit('year')">{{ formData.data.year }}</span>
            <YearPicker
              v-else
              :placeholder="placeholder('year')"
              :getCalendarContainer="trigger=>trigger.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode"
              style="width:100%"
              v-model="formData.data.year"/>
          </a-form-model-item>
          <a-form-model-item
            v-if="itemShow('quarter')"
            :colon="false"
            class="rowFlexItem"
            :mode="getMultiple('task_priority')?'multiple':'default'"
            :label="getItemName('quarter')"
            prop="quarter">
            <span class="readonly" v-if="itemEdit('quarter')">{{ formData.data.quarter | formatSelector }}</span>
            <a-select
              v-else
              allowClear
              v-model="formData.data.quarter"
              :mode="getMultiple('quarter')?'multiple':'default'"
              :getPopupContainer="trigger=>trigger.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode"
              :placeholder="placeholder('quarter')"
              :options="getOptions('quarter')"></a-select>
          </a-form-model-item>
          <a-form-model-item
            v-if="itemShow('task_priority')"
            :colon="false"
            class="rowFlexItem"
            :label="getItemName('task_priority')"
            prop="task_priority">
            <span class="readonly" v-if="itemEdit('task_priority')">{{ formData.data.task_priority | formatSelector }}</span>
            <a-select
              v-else
              allowClear
              v-model="formData.data.task_priority"
              :mode="getMultiple('task_priority')?'multiple':'default'"
              :placeholder="placeholder('task_priority')"
              :getPopupContainer="trigger=>trigger.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode"
              :options="getOptions('task_priority')"></a-select>
          </a-form-model-item>
          <a-form-model-item
            v-if="itemShow('risk_level')"
            :colon="false"
            class="rowFlexItem"
            :label="getItemName('risk_level')"
            prop="risk_level">
            <span class="readonly" v-if="itemEdit('risk_level')">{{ formData.data.risk_level | formatSelector }}</span>
            <a-select
              v-else
              allowClear
              v-model="formData.data.risk_level"
              :mode="getMultiple('risk_level')?'multiple':'default'"
              :placeholder="placeholder('risk_level')"
              :getPopupContainer="trigger=>trigger.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode"
              :options="getOptions('risk_level')"></a-select>
          </a-form-model-item>
          <a-form-model-item
            v-if="itemShow('plan_start_time')"
            :colon="false"
            class="rowFlexItem"
            :label="getItemName('plan_start_time')"
            prop="plan_start_time">
            <span class="readonly" v-if="itemEdit('plan_start_time')">{{ formData.data.plan_start_time | formatDate }}</span>
            <a-date-picker
              v-else
              style="width:100%"
              v-model="formData.data.plan_start_time"
              :disabledDate="disabledStartDate"
              :placeholder="setPlaceholder('plan_start_time')"
              @change="planChange"
              :getCalendarContainer="trigger=>trigger.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode"
              valueFormat="YYYY-MM-DD"/>
          </a-form-model-item>
          <a-form-model-item
            v-if="itemShow('plan_end_time')"
            :colon="false"
            class="rowFlexItem"
            :label="getItemName('plan_end_time')"
            prop="plan_end_time">
            <span class="readonly" v-if="itemEdit('plan_end_time')">{{ formData.data.plan_end_time | formatDate }}</span>
            <a-date-picker
              v-else
              style="width:100%"
              v-model="formData.data.plan_end_time"
              :placeholder="setPlaceholder('plan_end_time')"
              :disabledDate="disabledEndDate"
              @change="planChange"
              :getCalendarContainer="trigger=>trigger.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode"
              valueFormat="YYYY-MM-DD"/>
          </a-form-model-item>
          <a-form-model-item
            v-if="itemShow('plan_duration')"
            :colon="false"
            class="rowFlexItem"
            :label="getItemName('plan_duration')"
            prop="plan_duration">
            <span class="readonly" v-if="itemEdit('plan_duration')">{{ formData.data.plan_duration }}</span>
            <a-input-number
              v-else
              v-model="formData.data.plan_duration"
              :placeholder="placeholder('plan_duration')"
              @change="planDurationChange"
              style="width:100%"
              :min="0" />
          </a-form-model-item>
          <a-form-model-item
            v-if="itemShow('workday_duration')"
            :colon="false"
            class="rowFlexItem"
            :label="getItemName('workday_duration')"
            prop="workday_duration">
            <span class="readonly" v-if="itemEdit('workday_duration')">{{ formData.data.workday_duration }}</span>
            <a-input-number
              v-else
              v-model="formData.data.workday_duration"
              :placeholder="placeholder('workday_duration')"
              style="width:100%"
              :min="0" />
          </a-form-model-item>
          <a-form-model-item
            v-if="itemShow('actual_end_time')"
            :colon="false"
            class="rowFlexItem"
            :label="getItemName('actual_end_time')"
            prop="actual_end_time">
            <span class="readonly" v-if="itemEdit('actual_end_time')">{{ formData.data.actual_end_time | formatDate }}</span>
            <a-date-picker
              v-else
              style="width:100%"
              v-model="formData.data.actual_end_time"
              :placeholder="setPlaceholder('actual_end_time')"
              :getCalendarContainer="trigger=>trigger.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode"
              valueFormat="YYYY-MM-DD"/>
          </a-form-model-item>
          <a-form-model-item
            v-if="itemShow('warning_date1')"
            :colon="false"
            class="rowFlexItem"
            :label="getItemName('warning_date1')"
            prop="warning_date1">
            <span class="readonly" v-if="itemEdit('warning_date1')">{{ formData.data.warning_date1 | formatDate }}</span>
            <a-date-picker
              v-else
              style="width:100%"
              v-model="formData.data.warning_date1"
              :placeholder="setPlaceholder('warning_date1')"
              :getCalendarContainer="trigger=>trigger.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode"
              valueFormat="YYYY-MM-DD"/>
          </a-form-model-item>
          <a-form-model-item
            v-if="itemShow('warning_date2')"
            :colon="false"
            class="rowFlexItem"
            :label="getItemName('warning_date2')"
            prop="warning_date2">
            <span class="readonly" v-if="itemEdit('warning_date2')">{{ formData.data.warning_date2 | formatDate }}</span>
            <a-date-picker
              v-else
              style="width:100%"
              v-model="formData.data.warning_date2"
              :placeholder="setPlaceholder('warning_date2')"
              :getCalendarContainer="trigger=>trigger.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode"
              valueFormat="YYYY-MM-DD"/>
          </a-form-model-item>
          <a-form-model-item
            v-if="itemShow('work_content')"
            :colon="false"
            class="fullRowFlexItem"
            :label="getItemName('work_content')"
            prop="work_content">
            <span class="readonly" v-if="itemEdit('work_content')">{{ formData.data.work_content }}</span>
            <a-textarea
              v-else
              :autoSize="{minRows:3}"
              :placeholder="placeholder('work_content')"
              v-model="formData.data.work_content"
              allowClear/>
          </a-form-model-item>
          <a-form-model-item
            v-if="itemShow('schedule')"
            :colon="false"
            class="fullRowFlexItem"
            :label="getItemName('schedule')"
            prop="schedule">
            <span class="readonly" v-if="itemEdit('schedule')">{{ formData.data.schedule }}</span>
            <a-textarea
              v-else
              :autoSize="{minRows:3}"
              :placeholder="placeholder('schedule')"
              v-model="formData.data.schedule"
              allowClear/>
          </a-form-model-item>
          <a-form-model-item
            v-if="itemShow('scattered_contract_flag')"
            :colon="false"
            class="fullRowFlexItem scattered_contract_flag"
            :label="getItemName('scattered_contract_flag')"
            prop="scattered_contract_flag">
            <span class="readonly" v-if="itemEdit('scattered_contract_flag')">{{ formData.data.scattered_contract_flag }}</span>
            <a-radio-group
              v-else
              :placeholder="setPlaceholder('scattered_contract_flag')"
              v-model="formData.data.scattered_contract_flag"
              :options="getOptions('scattered_contract_flag',true)"></a-radio-group>
          </a-form-model-item>
          <a-form-model-item
            v-if="itemShow('manufacture_status')"
            :colon="false"
            class="fullRowFlexItem"
            :label="getItemName('manufacture_status')"
            prop="manufacture_status">
            <span class="readonly" v-if="itemEdit('manufacture_status')">{{ formData.data.manufacture_status }}</span>
            <a-radio-group
              v-else
              :placeholder="setPlaceholder('manufacture_status')"
              v-model="formData.data.manufacture_status"
              :options="getOptions('manufacture_status',true)"></a-radio-group>
          </a-form-model-item>
          <a-form-model-item
            v-if="itemShow('task_type')"
            :colon="false"
            class="fullRowFlexItem"
            :label="getItemName('task_type')"
            prop="task_type">
            <span class="readonly" v-if="itemEdit('task_type')">{{ formData.data.task_type }}</span>
            <a-input
              v-else
              :placeholder="placeholder('task_type')"
              v-model="formData.data.task_type"
              allowClear/>
          </a-form-model-item>
          <a-form-model-item
            v-if="itemShow('remark')"
            :colon="false"
            class="fullRowFlexItem"
            :label="getItemName('remark')"
            prop="remark">
            <span class="readonly" v-if="itemEdit('remark')">{{ formData.data.remark }}</span>
            <a-textarea
              v-else
              :autoSize="{minRows:3}"
              :placeholder="placeholder('remark')"
              v-model="formData.data.remark"
              allowClear/>
          </a-form-model-item>
          <a-form-model-item
            v-if="itemShow('remaining_problem')"
            :colon="false"
            class="fullRowFlexItem"
            :label="getItemName('remaining_problem')"
            prop="remaining_problem">
            <span class="readonly" v-if="itemEdit('remaining_problem')">{{ formData.data.remaining_problem }}</span>
            <a-textarea
              v-else
              :autoSize="{minRows:3}"
              :placeholder="placeholder('remaining_problem')"
              v-model="formData.data.remaining_problem"
              allowClear/>
          </a-form-model-item>
          <a-form-model-item
            v-if="itemShow('current_person')"
            :colon="false"
            class="rowFlexItem"
            :label="getItemName('current_person')"
            prop="current_person">
            <span class="readonly" v-if="itemEdit('current_person')">{{ formData.data.current_person | formatSelector }}</span>
            <staff-selector
              v-else
              :options="setStaffSelectorOptions('current_person','请选择')"
              @change="(value)=>staffSelectorChange(value,'current_person')"
              :value="formData.data.current_person"/>
          </a-form-model-item>
        </div>
      </a-collapse-panel>
    </a-collapse>
    <relevance-form-modal
      :showRelevanceTable="showRelevanceTable"
      :relevanceConditions="relevanceConditions"
      @closeRelevanceModal="closeRelevanceModal"
      :relevanceFormData="formData.data"
      :relevanceParentKey="relevanceParentKey"
      :showAddForm="true"
      :addFormQuery="addFormQuery"
      @bindPerson="bindPerson"
      :relevanceQueryCode="relevanceQueryCode"
      :relevanceCode="relevanceCode"/>
  </a-form-model>
</template>

<script src="./index.ts"/>
<style lang="less" scoped>
@import url("./index.less");
@import '../../../common.less';
</style>
