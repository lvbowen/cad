<template>
  <a-modal
    centered
    width="70%"
    :destroyOnClose="true"
    v-model="createDesignTaskVisible"
    :confirmLoading="confirmLoading"
    :closable="false"
    :maskClosable="false"
    :afterClose="afterClose"
    :footer="null">
    <template #title>
      <div class="clearfix">
        <div class="left">
          <span>新增设计任务单</span>
        </div>
        <div class="right designButtons">
          <template v-for="(button,index) in rightButtonLinks">
            <a-button
              v-if="formData.data[button.visibleKey]"
              class="designButton"
              :key="index"
              @click="actionButtonClick(button)"
              :type="button.type">{{ button.name }}</a-button>
          </template>
          <a-button
            type="primary"
            v-if="isUpdateDesignTask"
            @click="saveUpdateDesignTask"
            class="save-design">保存</a-button>
          <a-button @click="createDesignTaskVisible = false" class="designButton">取消</a-button>
        </div>
      </div>
    </template>
    <a-form-model
      ref="productionForm"
      :model="formData.data"
      :rules="formData.rules"
      labelAlign="left">
      <div class="dividing">任务基本信息</div>
      <div class="rowFlexWrap">
        <a-form-model-item
          v-if="itemShow('profession_task_name')"
          :colon="false"
          class="rowFlexItem"
          :label="getItemName('profession_task_name')"
          prop="profession_task_name">
          <span class="readonly" v-if="itemEdit('profession_task_name') || isUpdateDesignTask">{{ formData.data.profession_task_name }}</span>
          <a-input
            v-else
            :placeholder="placeholder('profession_task_name')"
            v-model="formData.data.profession_task_name"
            allowClear/>
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
          v-if="itemShow('engineering_stage')"
          :colon="false"
          class="rowFlexItem"
          :label="getItemName('engineering_stage')"
          prop="engineering_stage">
          <span class="readonly" v-if="itemEdit('engineering_stage')">{{ formData.data.engineering_stage }}</span>
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
            @change="changeLabelByModelTypeValue()"
            showSearch
            :getPopupContainer="trigger=>trigger.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode"
            :placeholder="placeholder('modelType')"
            :options="getOptions('modelType')"></a-select>
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
          v-if="itemShow('profession_name')"
          :colon="false"
          class="rowFlexItem"
          :label="getItemName('profession_name')"
          prop="profession_name">
          <span class="readonly" v-if="itemEdit('profession_name')">{{ formData.data.profession_name }}</span>
          <a-select
            v-else
            allowClear
            showSearch
            v-model="formData.data.profession_name"
            :mode="getMultiple('profession_name')?'multiple':'default'"
            @focus="updateOptions('profession_name')"
            :placeholder="placeholder('profession_name')"
            :options="getOptions('profession_name')"></a-select>
        </a-form-model-item>
        <a-form-model-item
          v-if="itemShow('use_software_name')"
          :colon="false"
          class="rowFlexItem"
          :label="getItemName('use_software_name')"
          prop="use_software_name">
          <span class="readonly" v-if="itemEdit('use_software_name')">{{ formData.data.use_software_name }}</span>
          <a-select
            v-else
            allowClear
            showSearch
            v-model="formData.data.use_software_name"
            :mode="getMultiple('use_software_name')?'multiple':'default'"
            @focus="updateOptions('use_software_name')"
            :placeholder="placeholder('use_software_name')"
            :options="getOptions('use_software_name')"></a-select>
        </a-form-model-item>
        <a-form-model-item
          v-if="itemShow('task_number')"
          :colon="false"
          class="rowFlexItem"
          :label="getItemName('task_number')"
          prop="task_number">
          <span class="readonly" v-if="itemEdit('task_number')">{{ formData.data.task_number }}</span>
          <a-input
            v-else
            :placeholder="placeholder('task_number')"
            v-model="formData.data.task_number"
            allowClear/>
        </a-form-model-item>
      </div>
      <div class="dividing">任务类型</div>
      <div class="rowFlexWrap">
        <a-form-model-item
          v-if="itemShow('task_type')"
          :colon="false"
          class="fullRowFlexItem"
          :label="getItemName('task_type')"
          prop="task_type">
          <span class="readonly" v-if="itemEdit('task_type') || isUpdateDesignTask">{{ formData.data.task_type }}</span>
          <a-radio-group
            :placeholder="setPlaceholder('task_type')"
            v-else
            v-model="formData.data.task_type"
            :options="getOptions('task_type',true)"></a-radio-group>
        </a-form-model-item>
      </div>
      <div class="dividing">审核设定</div>
      <div class="rowFlexWrap">
        <!--        <a-form-model-item-->
        <!--          v-if="itemShow('proofread_level')"-->
        <!--          :colon="false"-->
        <!--          class="rowFlexItem"-->
        <!--          :label="getItemName('proofread_level')"-->
        <!--          prop="proofread_level">-->
        <!--          <span class="readonly" v-if="itemEdit('proofread_level')">{{ formData.data.proofread_level }}</span>-->
        <!--          <a-radio-group-->
        <!--            :placeholder="setPlaceholder('proofread_level')"-->
        <!--            v-else-->
        <!--            v-model="formData.data.proofread_level"-->
        <!--            :options="getOptions('proofread_level',true)"></a-radio-group>-->
        <!--        </a-form-model-item>-->
        <a-form-model-item
          v-if="itemShow('proofread_level')"
          :colon="false"
          class="rowFlexItem"
          :label="getItemName('proofread_level')"
          prop="proofread_level">
          <span class="readonly" v-if="itemEdit('proofread_level')">{{ formData.data.proofread_level | formatSelector }}</span>
          <a-select
            v-else
            allowClear
            v-model="formData.data.proofread_level"
            :mode="getMultiple('proofread_level')?'multiple':'default'"
            @focus="updateOptions('proofread_level')"
            showSearch
            :getPopupContainer="trigger=>trigger.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode"
            :placeholder="placeholder('proofread_level')"
            :options="getOptions('proofread_level')"></a-select>
        </a-form-model-item>
        <a-form-model-item
          v-if="itemShow('design_guider_flag')"
          :colon="false"
          class="rowFlexItem"
          :label="getItemName('design_guider_flag')"
          prop="design_guider_flag">
          <span class="readonly" v-if="itemEdit('design_guider_flag')">{{ formData.data.design_guider_flag }}</span>
          <a-radio-group
            :placeholder="setPlaceholder('design_guider_flag')"
            v-else
            v-model="formData.data.design_guider_flag"
            :options="getOptions('design_guider_flag',true)"></a-radio-group>
        </a-form-model-item>
        <a-form-model-item
          v-if="itemShow('countersign_flag')"
          :colon="false"
          class="rowFlexItem"
          :label="getItemName('countersign_flag')"
          prop="countersign_flag">
          <span class="readonly" v-if="itemEdit('countersign_flag')">{{ formData.data.countersign_flag }}</span>
          <a-radio-group
            :placeholder="setPlaceholder('countersign_flag')"
            v-else
            v-model="formData.data.countersign_flag"
            :options="getOptions('countersign_flag',true)"></a-radio-group>
        </a-form-model-item>
        <a-form-model-item
          v-if="itemShow('project_manager_audit')"
          :colon="false"
          class="rowFlexItem"
          :label="getItemName('project_manager_audit')"
          prop="project_manager_audit">
          <span class="readonly" v-if="itemEdit('project_manager_audit')">{{ formData.data.project_manager_audit }}</span>
          <a-radio-group
            :placeholder="setPlaceholder('project_manager_audit')"
            v-else
            v-model="formData.data.project_manager_audit"
            :options="getOptions('project_manager_audit',true)"></a-radio-group>
        </a-form-model-item>
      </div>
      <div class="dividing">任务安排</div>
      <div class="rowFlexWrap">
        <a-form-model-item
          v-if="itemShow('designer')"
          :colon="false"
          class="rowFlexItem"
          :label="getItemName('designer')"
          prop="designer">
          <span class="readonly" v-if="itemEdit('designer')">{{ formData.data.designer | formatSelector }}</span>
          <staff-selector
            v-else
            :options="setStaffSelectorOptions('designer','请选择')"
            @change="(value)=>staffSelectorChange(value,'designer')"
            :value="formData.data.designer"/>
        </a-form-model-item>
        <a-form-model-item
          v-if="itemShow('design_guider')"
          :colon="false"
          class="rowFlexItem"
          :label="getItemName('design_guider')"
          prop="design_guider">
          <span class="readonly" v-if="itemEdit('design_guider')">{{ formData.data.design_guider | formatSelector }}</span>
          <staff-selector
            v-else
            :options="setStaffSelectorOptions('design_guider','请选择')"
            @change="(value)=>staffSelectorChange(value,'design_guider')"
            :value="formData.data.design_guider"/>
        </a-form-model-item>
        <a-form-model-item
          v-if="itemShow('partners')"
          :colon="false"
          class="rowFlexItem"
          :label="getItemName('partners')"
          prop="partners">
          <span class="readonly" v-if="itemEdit('partners')">{{ formData.data.partners | formatSelector }}</span>
          <staff-selector
            v-else
            :options="setStaffSelectorOptions('partners','请选择')"
            @change="(value)=>staffSelectorChange(value,'partners')"
            :value="formData.data.partners"/>
        </a-form-model-item>
        <a-form-model-item
          v-if="itemShow('checker')"
          :colon="false"
          class="rowFlexItem"
          :label="getItemName('checker')"
          prop="checker">
          <span class="readonly" v-if="itemEdit('checker')">{{ formData.data.checker | formatSelector }}</span>
          <staff-selector
            v-else
            :options="setStaffSelectorOptions('checker','请选择')"
            @change="(value)=>staffSelectorChange(value,'checker')"
            :value="formData.data.checker"/>
        </a-form-model-item>
        <a-form-model-item
          v-if="itemShow('auditor')"
          :colon="false"
          class="rowFlexItem"
          :label="getItemName('auditor')"
          prop="auditor">
          <span class="readonly" v-if="itemEdit('auditor')">{{ formData.data.auditor | formatSelector }}</span>
          <staff-selector
            v-else
            :options="setStaffSelectorOptions('auditor','请选择')"
            @change="(value)=>staffSelectorChange(value,'auditor')"
            :value="formData.data.auditor"/>
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
          v-if="itemShow('countersigned')"
          :colon="false"
          class="rowFlexItem"
          :label="getItemName('countersigned')"
          prop="countersigned">
          <span class="readonly" v-if="itemEdit('countersigned')">{{ formData.data.countersigned | formatSelector }}</span>
          <staff-selector
            v-else
            :options="setStaffSelectorOptions('countersigned','请选择')"
            @change="(value)=>staffSelectorChange(value,'countersigned')"
            :value="formData.data.countersigned"/>
        </a-form-model-item>
        <a-form-model-item
          v-if="itemShow('department_chief')"
          :colon="false"
          class="rowFlexItem"
          :label="getItemName('department_chief')"
          prop="department_chief">
          <span class="readonly" v-if="itemEdit('department_chief')">{{ formData.data.department_chief | formatSelector }}</span>
          <staff-selector
            v-else
            :options="setStaffSelectorOptions('department_chief','请选择')"
            @change="(value)=>staffSelectorChange(value,'department_chief')"
            :value="formData.data.department_chief"/>
        </a-form-model-item>
        <a-form-model-item
          v-if="itemShow('company_chief')"
          :colon="false"
          class="rowFlexItem"
          :label="getItemName('company_chief')"
          prop="company_chief">
          <span class="readonly" v-if="itemEdit('company_chief')">{{ formData.data.company_chief | formatSelector }}</span>
          <staff-selector
            v-else
            :options="setStaffSelectorOptions('company_chief','请选择')"
            @change="(value)=>staffSelectorChange(value,'company_chief')"
            :value="formData.data.company_chief"/>
        </a-form-model-item>
        <a-form-model-item
          v-if="itemShow('task_time')"
          :colon="false"
          class="rowFlexItem"
          :label="getItemName('task_time')"
          prop="task_time">
          <span class="readonly" v-if="itemEdit('task_time')">{{ formData.data.task_time | formatDate }}</span>
          <a-date-picker
            v-else
            style="width:100%"
            v-model="formData.data.task_time"
            :placeholder="setPlaceholder('task_time')"
            valueFormat="YYYY-MM-DD"/>
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
            :disabledDate="disabledEndDate"
            :placeholder="setPlaceholder('plan_end_time')"
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
            style="width:100%"
            :min="0" />
        </a-form-model-item>
      </div>
    </a-form-model>
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
      <template #title>
        <a-icon style="padding-right: 5px" type="question-circle" theme="twoTone"/>
        <span>{{ dialogModalConfiguration.title }}</span>
      </template>
    </a-modal>
  </a-modal>
</template>
<script src="./index.ts"/>
<style lang="less" scoped>
@import url("./index.less");
</style>
