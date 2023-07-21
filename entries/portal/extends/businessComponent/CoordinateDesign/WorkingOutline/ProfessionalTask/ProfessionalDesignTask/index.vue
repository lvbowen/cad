<template>
  <div class="professionalDesignTaskWrap" :key="initKey">
    <header class="designFileHead flex flex-space-between">
      <div class="flex flex-center-align">
        <a-icon @click="back" class="headerIcon" type="left" />
        <div class="headerTitle">设计任务单</div>
      </div>
      <standard-template
        class="headerIcon"
        type="设计任务单"
        :taskType="formData.data.task_type"
        :profession="formData.data.profession_name"/>
    </header>
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
            :type="button.type">{{ button.name }}</a-button>
        </template>
      </div>
    </div>
    <application-list v-show="false" class="divide"/>
    <div class="professionalDesignTaskContent">
      <div v-if="leftButtonLinks.activeIndex===0">
        <a-form-model
          :key="formKey"
          ref="productionForm"
          :model="formData.data"
          :rules="formData.rules"
          labelAlign="left">
          <a-collapse :defaultActiveKey="collapse.defaultActiveKeyFirst" :bordered="false" expandIconPosition="right">
            <a-collapse-panel key="1">
              <template #header>
                <div class="collapseHeader">
                  <div class="collapseHeaderTitle left">审批记录</div>
                  <div v-if="workFlowInfo.participants[0]" class="collapseHeaderNode collapseHeaderItem left" >当前节点:<em>{{ workFlowInfo.participants[0].activityName }}</em></div>
                  <div v-if="workFlowInfo.participants[0]" class="collapseHeaderHandle collapseHeaderItem left">当前处理人:<em v-for="(item,index) in workFlowInfo.participants[0].participants" :key="index">{{ item.name }}</em></div>
                  <div v-if="workFlowInfo.status" class="collapseHeaderWorkflow collapseHeaderItem left">流程追踪:<em>{{ getSequenceString(workFlowInfo.status) }}</em></div>
                  <div class="collapseHeaderTime collapseHeaderItem left">已用时:
                    <em v-show="usedDays>0">{{ usedDays }}天</em>
                    <em v-show="usedDays>0||usedHours>0">{{ usedHours }}小时</em>
                    <em>{{ usedMinutes }}分钟</em>
                  </div>
                </div>
              </template>
              <Approval
                v-if="formData.data.workflowInstanceId!==null||''"
                :workflowInstanceId="formData.data.workflowInstanceId">
              </Approval>
            </a-collapse-panel>
            <a-collapse-panel key="2" class="collapsepanel2">
              <template #header>
                <div class="collapseHeader">
                  <div class="collapseHeaderTitle floatLeft">
                    <span>任务基本信息</span>
                    <span class="task-name" v-if="formData.data.profession_task_name">任务名称：{{ formData.data.profession_task_name }}</span>
                  </div>
                </div>
              </template>
              <div class="rowFlexWrap">
                <a-form-model-item
                  v-if="itemShow('zyrwd_id')"
                  :colon="false"
                  class="fullRowFlexItem"
                  :label="getItemName('zyrwd_id')"
                  prop="zyrwd_id">
                  <span class="disable ref-status" v-if="formData.data.zyrwd_id && formData.data.zyrwd_id.name" @click="goFormDetail(formData.data.zyrwd_id.schemaCode,formData.data.zyrwd_id.id)">{{ formData.data.zyrwd_id.name }}</span>
                  <!--                  <span class="readonly" v-if="itemEdit('zyrwd_i                  d')">{{ formData.data.zyrwd_id }}</span>-->
                  <!--                  <a-input-->
                  <!--                    v-else-->
                  <!--                    :placeholder="setPlaceholder('zyrwd_id','请输入')"-->
                  <!--                    v-model="formData.data.zyrwd_id"-->
                  <!--                    allowClear/>-->
                </a-form-model-item>
                <a-form-model-item
                  v-if="itemShow('xmlb_id')"
                  :colon="false"
                  class="fullRowFlexItem"
                  :label="getItemName('xmlb_id')"
                  prop="xmlb_id">
                  <span class="disable ref-status" v-if="formData.data.xmlb_id && formData.data.xmlb_id.engineering_name" @click="goFormDetail(formData.data.xmlb_id.schemaCode,formData.data.xmlb_id.id)">{{ formData.data.xmlb_id.engineering_name }}</span>
                  <!--                  <span class="readonly" v-if="itemEdit('xmlb_id')">{{ formData.data.xmlb_id }}</span>-->
                  <!--                  <a-input-->
                  <!--                    v-else-->
                  <!--                    :placeholder="setPlaceholder('xmlb_id','请输入')"-->
                  <!--                    v-model="formData.data.engineering_name"-->
                  <!--                    allowClear/>-->
                </a-form-model-item>
                <a-form-model-item
                  v-if="itemShow('profession_task_name')"
                  :colon="false"
                  class="fullRowFlexItem"
                  :label="getItemName('profession_task_name')"
                  prop="profession_task_name">
                  <span class="readonly" v-if="itemEdit('profession_task_name')">{{ formData.data.profession_task_name }}</span>
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
                    :placeholder="placeholder('projectType')"
                    :options="getOptions('projectType')"></a-select>
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
                    :placeholder="placeholder('engineering_stage')"
                    :options="getOptions('engineering_stage')"></a-select>
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
                  v-if="itemShow('achievement_number')"
                  :colon="false"
                  class="rowFlexItem"
                  :label="getItemName('achievement_number')"
                  prop="achievement_number">
                  <span class="readonly" v-if="itemEdit('achievement_number')">{{ formData.data.achievement_number }}</span>
                  <a-input
                    v-else
                    :placeholder="placeholder('achievement_number')"
                    v-model="formData.data.achievement_number"
                    allowClear/>
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
            </a-collapse-panel>
            <a-collapse-panel key="3" class="collapsepanel3">
              <template #header>
                <div class="collapseHeader">
                  <div class="collapseHeaderTitle floatLeft">任务类型</div>
                </div>
              </template>
              <div class="rowFlexWrap flex">
                <a-form-model-item
                  v-if="itemShow('task_type')"
                  :colon="false"
                  class="fullRowFlexItem"
                  :label="getItemName('task_type')"
                  prop="task_type">
                  <span class="readonly" v-if="itemEdit('task_type')">{{ formData.data.task_type }}</span>
                  <a-radio-group
                    :placeholder="setPlaceholder('task_type')"
                    v-else
                    v-model="formData.data.task_type"
                    :options="getOptions('task_type',true)"></a-radio-group>
                </a-form-model-item>
              </div>
            </a-collapse-panel>
            <a-collapse-panel key="4" class="collapsepanel4">
              <template #header>
                <div class="collapseHeader">
                  <div class="collapseHeaderTitle floatLeft">审核设定</div>
                </div>
              </template>
              <div class="rowFlexWrap">
                <a-form-model-item
                  v-if="itemShow('proofread_flag')"
                  :colon="false"
                  class="rowFlexItem"
                  :label="getItemName('proofread_flag')"
                  prop="proofread_flag">
                  <span class="readonly" v-if="itemEdit('proofread_flag')">{{ formData.data.proofread_flag }}</span>
                  <a-radio-group
                    :placeholder="setPlaceholder('proofread_flag')"
                    v-else
                    v-model="formData.data.proofread_flag"
                    :options="getOptions('proofread_flag',true)"></a-radio-group>
                </a-form-model-item>

                <!--                <a-form-model-item-->
                <!--                  v-if="itemShow('proofread_level')"-->
                <!--                  :colon="false"-->
                <!--                  class="rowFlexItem"-->
                <!--                  :label="getItemName('proofread_level')"-->
                <!--                  prop="proofread_level">-->
                <!--                  <span class="readonly" v-if="itemEdit('proofread_level')">{{ formData.data.proofread_level }}</span>-->
                <!--                  <a-radio-group-->
                <!--                    :placeholder="setPlaceholder('proofread_level')"-->
                <!--                    v-else-->
                <!--                    v-model="formData.data.proofread_level"-->
                <!--                    :options="getOptions('proofread_level',true)"></a-radio-group>-->
                <!--                </a-form-model-item>-->
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
                  class="fullRowFlexItem"
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
                <a-form-model-item
                  v-if="itemShow('collaborate_flag')"
                  :colon="false"
                  class="fullRowFlexItem"
                  :label="getItemName('collaborate_flag')"
                  prop="collaborate_flag">
                  <span class="readonly" v-if="itemEdit('collaborate_flag')">{{ formData.data.collaborate_flag }}</span>
                  <a-radio-group
                    :placeholder="setPlaceholder('collaborate_flag')"
                    v-else
                    v-model="formData.data.collaborate_flag"
                    :options="getOptions('collaborate_flag',true)"></a-radio-group>
                </a-form-model-item>
              </div>
            </a-collapse-panel>
            <a-collapse-panel key="5" class="collapsepanel2">
              <template #header>
                <div class="collapseHeader">
                  <div class="collapseHeaderTitle floatLeft">任务安排</div>
                </div>
              </template>
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
                  class="fullRowFlexItem"
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
                  class="fullRowFlexItem"
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
                  class="fullRowFlexItem"
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
                  class="fullRowFlexItem"
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
                  class="fullRowFlexItem"
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
                  v-if="itemShow('sign_subject')"
                  :colon="false"
                  class="rowFlexItem"
                  :label="getItemName('sign_subject')"
                  prop="sign_subject">
                  <span class="readonly" v-if="itemEdit('sign_subject')">{{ formData.data.sign_subject | formatSelector }}</span>
                  <a-select
                    v-else
                    allowClear
                    v-model="formData.data.sign_subject"
                    :mode="getMultiple('sign_subject')?'multiple':'default'"
                    @focus="updateOptions('sign_subject')"
                    :placeholder="placeholder('sign_subject')"
                    :options="getOptions('sign_subject')">
                  </a-select>
                </a-form-model-item>
                <!--                <a-form-model-item-->
                <!--                  v-if="itemShow('sign_subject')"-->
                <!--                  :colon="false"-->
                <!--                  class="fullRowFlexItem"-->
                <!--                  :label="getItemName('sign_subject')"-->
                <!--                  prop="sign_subject">-->
                <!--                  <span class="readonly" v-if="itemEdit('sign_subject')">{{ formData.data.sign_subject }}</span>-->
                <!--                  <a-input-->
                <!--                    v-else-->
                <!--                    :placeholder="placeholder('sign_subject')"-->
                <!--                    v-model="formData.data.sign_subject"-->
                <!--                    allowClear/>-->
                <!--                </a-form-model-item>-->
                <a-form-model-item
                  v-if="itemShow('signer')"
                  :colon="false"
                  class="fullRowFlexItem"
                  :label="getItemName('signer')"
                  prop="signer">
                  <span class="readonly" v-if="itemEdit('signer')">{{ formData.data.signer | formatSelector }}</span>
                  <staff-selector
                    v-else
                    :options="setStaffSelectorOptions('signer','请选择')"
                    @change="(value)=>staffSelectorChange(value,'signer')"
                    :value="formData.data.signer"/>
                </a-form-model-item>
                <a-form-model-item
                  v-if="itemShow('add_signer_flag')"
                  :colon="false"
                  class="rowFlexItem"
                  :label="getItemName('add_signer_flag')"
                  prop="add_signer_flag">
                  <span class="readonly" v-if="itemEdit('add_signer_flag')">{{ formData.data.add_signer_flag }}</span>
                  <a-radio-group
                    :placeholder="setPlaceholder('add_signer_flag')"
                    v-else
                    v-model="formData.data.add_signer_flag"
                    :options="getOptions('add_signer_flag',true)"></a-radio-group>
                </a-form-model-item>
                <a-form-model-item
                  v-if="itemShow('add_signer')"
                  :colon="false"
                  class="rowFlexItem"
                  :label="getItemName('add_signer')"
                  prop="add_signer">
                  <span class="readonly" v-if="itemEdit('add_signer')">{{ formData.data.add_signer | formatSelector }}</span>
                  <staff-selector
                    v-else
                    :options="setStaffSelectorOptions('add_signer','请选择')"
                    @change="(value)=>staffSelectorChange(value,'add_signer')"
                    :value="formData.data.add_signer"/>
                </a-form-model-item>
              </div>
            </a-collapse-panel>
            <!--            <a-collapse-panel key="6">-->
            <!--              <template #header>-->
            <!--                <div class="collapseHeader">-->
            <!--                  <div class="collapseHeaderTitle floatLeft">任务进度信息</div>-->
            <!--                </div>-->
            <!--              </template>-->
            <!--              <div class="rowFlexWrap">-->
            <!--                <a-form-model-item-->
            <!--                  v-if="itemShow('task_ratio')"-->
            <!--                  :colon="false"-->
            <!--                  class="fullRowFlexItem ProgressItemWrap"-->
            <!--                  :label="getItemName('task_ratio')"-->
            <!--                  prop="task_ratio">-->
            <!--                  <div class="ProgressItem">-->
            <!--                    <a-input-number-->
            <!--                      :disabled="itemEdit('task_ratio')"-->
            <!--                      v-model.number="formData.data.task_ratio"-->
            <!--                      class="progressInput"-->
            <!--                      :formatter="value=>`${value}%`"-->
            <!--                      :parser="value => value.replace('%', '')"-->
            <!--                      :min="0"-->
            <!--                      :max="100"/>-->
            <!--                    <a-slider-->
            <!--                      :disabled="itemEdit('task_ratio')"-->
            <!--                      :tipFormatter="value=>`${value}%`"-->
            <!--                      :step="0.1"-->
            <!--                      v-model="formData.data.task_ratio"-->
            <!--                      class="progressSlider"></a-slider>-->
            <!--                  </div>-->
            <!--                </a-form-model-item>-->
            <!--              </div>-->
            <!--            </a-collapse-panel>-->
            <a-collapse-panel key="7" class="collapsepanel2">
              <template #header>
                <div class="collapseHeader">
                  <div class="collapseHeaderTitle floatLeft">中间资料签收</div>
                </div>
              </template>
              <div class="rowFlexWrap">
                <a-form-model-item
                  v-if="itemShow('unsigned_person')"
                  :colon="false"
                  class="fullRowFlexItem"
                  :label="getItemName('unsigned_person')"
                  prop="unsigned_person">
                  <span class="readonly" v-if="itemEdit('unsigned_person')">{{ formData.data.unsigned_person | formatSelector }}</span>
                  <staff-selector
                    v-else
                    :options="setStaffSelectorOptions('unsigned_person','请选择')"
                    @change="(value)=>staffSelectorChange(value,'unsigned_person')"
                    :value="formData.data.unsigned_person"/>
                </a-form-model-item>
                <a-form-model-item
                  v-if="itemShow('signed_person')"
                  :colon="false"
                  class="fullRowFlexItem"
                  :label="getItemName('signed_person')"
                  prop="signed_person">
                  <span class="readonly" v-if="itemEdit('signed_person')">{{ formData.data.signed_person | formatSelector }}</span>
                  <staff-selector
                    v-else
                    :options="setStaffSelectorOptions('signed_person','请选择')"
                    @change="(value)=>staffSelectorChange(value,'signed_person')"
                    :value="formData.data.signed_person"/>
                </a-form-model-item>
              </div>
            </a-collapse-panel>
<!--            <a-collapse-panel key="8" class="collapsepanel2">-->
<!--              <template #header>-->
<!--                <div class="collapseHeader">-->
<!--                  <div class="collapseHeaderTitle floatLeft">任务设计成果</div>-->
<!--                </div>-->
<!--              </template>-->
<!--              <div class="rowFlexWrap">-->
<!--                <a-form-model-item-->
<!--                  v-if="itemShow('currentStatus')"-->
<!--                  :colon="false"-->
<!--                  class="fullRowFlexItem"-->
<!--                  :label="getItemName('currentStatus')"-->
<!--                  prop="currentStatus">-->
<!--                  <span class="readonly" v-if="itemEdit('currentStatus')">{{ formData.data.currentStatus }}</span>-->
<!--                  <a-input-->
<!--                    v-else-->
<!--                    :placeholder="placeholder('currentStatus')"-->
<!--                    v-model="formData.data.currentStatus"-->
<!--                    allowClear/>-->
<!--                </a-form-model-item>-->
<!--              </div>-->
<!--            </a-collapse-panel>-->
          </a-collapse>
        </a-form-model>
        <template>
          <div class="buttonLinks verButtons">
            <a-button
              class="buttonLink"
              v-for="(button,index) in versionButtonLinks.buttonLinks"
              :key="index"
              :type="index===versionButtonLinks.activeIndex?'primary':'default'"
              @click="newVerButtonClick(index)"
              size="large">{{ button }}</a-button>
            <a-button
              v-if="formData.data.activityCode==='Activity3'"
              @click="newAddVersionButtonLinks"
              class="buttonLink"
              size="large">
              <a-icon type="plus" />
            </a-button>
          </div>
          <a-collapse :defaultActiveKey="collapse.defaultActiveKeySecond" :bordered="false" expandIconPosition="right">
            <a-collapse-panel key="1" class="greenBackgroundColor">
              <template #header>
                <div class="collapseHeader">
                  <div class="collapseHeaderTitle floatLeft">任务设计成果</div>
                </div>
              </template>
              <div class="rowFlexWrap" v-if="itemShow('currentStatus')">
                <a-form-model-item
                  v-if="itemShow('currentStatus')"
                  :colon="false"
                  class="fullRowFlexItem"
                  :label="getItemName('currentStatus')"
                  prop="currentStatus">
                  <span class="readonly" v-if="itemEdit('currentStatus')">{{ formData.data.currentStatus }}</span>
                  <a-input
                    v-else
                    :placeholder="placeholder('currentStatus')"
                    v-model="formData.data.currentStatus"
                    allowClear/>
                </a-form-model-item>
              </div>
              <a-tabs v-model="achievementTabs.activeKey">
                <a-tab-pane v-for="(pane,paneIndex) in achievementTabs.panes" :tab="pane.title" :key="pane.key">
                  <component
                    :ref="`achievement${paneIndex}`"
                    :key="initKey"
                    :activeKey="achievementTabs.activeKey"
                    :is="pane.component"
                    :sjrwdId="formData.data.id"
                    :version="pane.version"
                    :workflowInstanceId="formData.data.workflowInstanceId"
                    :personId="userInfo && userInfo.id"
                    :formDataChapter="formData.data.XTSJ_design_para"
                    :showCreateChapter="showCreateChapter"
                    :isEditOutlineWork="isEditOutlineWork"
                    :showChapter="showChapter"
                    :projectId="projectId"
                    @upBindManager="upBindManager"
                    @updateAchievement="updateAchievement"
                    @addFile="addAchievementFile"
                    @newDeleteFile="newDeleteFile"
                    @newAddFile="newAddAchievementFile"
                    :activeAchievement="versionButtonLinks.buttonLinks[achievementTabs.activeKey]"
                    :formmatConfig="formmatConfig"
                    @createDesignSpecificationSubTask="createDesignSpecificationSubTask"
                    @removeFile="removeAchievementFile"></component>
                </a-tab-pane>
              </a-tabs>
            </a-collapse-panel>
          </a-collapse>
        </template>
        <a-collapse
          class="marginTop10px"
          :defaultActiveKey="collapse.defaultActiveKeyThird"
          :bordered="false"
          expandIconPosition="right">
          <a-collapse-panel key="1" class="purpleBackgroundColor">
            <template #header>
              <div class="collapseHeader">
                <div class="collapseHeaderTitle floatLeft">模型检查标注</div>
              </div>
            </template>
            <div class="marklWrap">
              <div class="clearfix markButton">
                <div class="floatLeft">
                  <!--                  <a-input-search-->
                  <!--                    v-model="marksConfiguration.searchKeyWord">-->
                  <!--                    class="markSerach"-->
                  <!--                    placeholder="请输入关键字查询"-->
                  <!--                    enterButton-->
                  <!--                    @search="markSearch" />-->
                  <a-input-search
                    v-model="markSearchKeyWord"
                    class="markSerach"
                    placeholder="请输入关键字查询"
                    enterButton
                    @pressEnter="enterSearch"
                    @search="searchAnnotation"
                  />
                </div>
                <div class="floatRight">
                  <!--                  <a-select-->
                  <!--                    @change="checkerChange"-->
                  <!--                    class="markFilterItem"-->
                  <!--                    allowClear-->
                  <!--                    placeholder="检查人">-->
                  <!--                    <a-select-option v-for="(item,index) in this.checkerData" :key="index" :value="item.id">-->
                  <!--                      {{ item.value }}-->
                  <!--                    </a-select-option>-->
                  <!--                  </a-select>-->
                  <a-select
                    @change="newNodeChange"
                    v-model="nodeName"
                    class="markFilterItem"
                    allowClear
                    placeholder="流程节点">
                    <a-select-option v-for="(item,index) in ['全部','校核','审核']" :key="index" :value="item" :title="item">
                      {{ item }}
                    </a-select-option>
                  </a-select>
                </div>
              </div>
              <!--              <a-table-->
              <!--                rowKey="id"-->
              <!--                :loading="marksConfiguration.loading"-->
              <!--                :columns="marksConfiguration.columns"-->
              <!--                :pagination="marksConfiguration.pagination"-->
              <!--                :dataSource="marksConfiguration.dataSource"-->
              <!--                :customRow="rowClick">-->
              <!--                <template #thumbnail="record">-->
              <!--                  <template v-if="!record.engineModelId&&!record.engineProjectId&&record.thumbnail!==''">-->
              <!--                    <img-->
              <!--                      v-for="(p,index) in record.thumbnail.split(',')"-->
              <!--                      :key="index"-->
              <!--                      :src="p"-->
              <!--                      @mouseenter="showImg(record,p)"-->
              <!--                      style="width: 18px;height: 18px;cursor: pointer"-->
              <!--                      alt="">-->
              <!--                  </template>-->
              <!--                  <template v-else-if="record.thumbnail!==''">-->
              <!--                    <img-->
              <!--                      v-if="record.thumbnail!==''"-->
              <!--                      :src="record.thumbnail"-->
              <!--                      @mouseenter="showImg(record)"-->
              <!--                      style="width: 18px;height: 18px;cursor: pointer"-->
              <!--                      alt="">-->
              <!--                  </template>-->
              <!--                </template>-->
              <!--              </a-table>-->
              <a-table
                rowKey="id"
                :loading="newMarksConfiguration.loading"
                :columns="newMarksConfiguration.columns"
                :pagination="newMarksConfiguration.pagination"
                :dataSource="newMarksConfiguration.dataSource"
                :customRow="rowClick">
                <template #imgUrl="record">
                  <template v-if="record.imgUrls&&record.imgUrls.length">
                    <img
                      v-for="(p,index) in record.imgUrls"
                      :key="index"
                      :src="p"
                      @mouseenter="showImg(record,p)"
                      style="width: 18px;height: 18px;cursor: pointer"
                      alt="">
                  </template>
                </template>
              </a-table>
            </div>
          </a-collapse-panel>
        </a-collapse>
      </div>
      <Workflow v-else :workflowInstanceId="formData.data.workflowInstanceId" :workItemId="formData.data.workItemId"></Workflow>
    </div>
    <a-modal
      :afterClose="dialogModalConfiguration.afterClose"
      :okText="dialogModalConfiguration.okText"
      :cancelText="dialogModalConfiguration.cancelText"
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
            :placeholder="isCountersignedNode?'理由说明':'意见/建议'"
            v-model.trim="dialogTaskForm.formData.comment"
            allowClear
            :autoSize="{ minRows: 4, maxRows: 6 }"
          />
        </a-form-model-item>
      </a-form-model>
      <div v-if="this.commonReplys&&!isCountersignedNode">
        <div style="margin-bottom: 10px">常用意见</div>
        <div>
          <a-tag v-for="(item,index) in commonReplys.replys" :key="index" @click="tagChange(item)">{{ item }}</a-tag>
        </div>
      </div>
      <template #title>
        <a-icon style="padding-right: 5px" type="question-circle" theme="twoTone"/>
        <span>{{ dialogModalConfiguration.title }}</span>
      </template>
      <template #footer v-if="isCompanyChief">
        <a-button type="primary" @click="dialogModalConfiguration.rejectFun('驳回')" :loading="dialogModalConfiguration.confirmLoading&&dialogModalConfiguration.okText==='驳回'">驳回</a-button>
        <a-button type="primary" @click="dialogModalConfiguration.rejectFun('同意')" :loading="dialogModalConfiguration.confirmLoading&&dialogModalConfiguration.okText==='同意'">同意</a-button>
      </template>
    </a-modal>
    <transition name="fade">
      <div class="pic-wrap" v-show="picShow" @click.stop="picHide">
        <img :src="this.thumbnail" alt="">
      </div>
    </transition>
  </div>
</template>
<script src="./index.ts"/>
<style lang="less" scoped>
@import url("./index.less");
@import '../../common.less';
@import '../../../../../styles/public.module.less';
</style>
