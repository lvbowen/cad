<template>
  <div class="professionalDesignOutlineWrap">
    <header class="myHeader flex flex-space-between">
      <div class="flex flex-center-align">
        <a-icon @click="back" class="headerIcon" type="left" />
        <div class="headerTitle">专业设计提纲</div>
      </div>
      <standard-template
        class="headerIcon"
        type="专业提纲"
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
    <div class="professionalDesignOutlineContent">
      <div v-if="leftButtonLinks.activeIndex===0">
        <a-form-model
          labelAlign="left"
          ref="modalForm"
          :model="formData.data"
          :rules="formData.rules">
          <a-collapse :defaultActiveKey="['2','3','4']" :bordered="false" expandIconPosition="right">
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
                  <div class="collapseHeaderTitle floatLeft">任务基本信息</div>
                </div>
              </template>
              <div class="rowFlexWrap">
                <a-form-model-item
                  v-if="itemShow('xmlb_id')"
                  :colon="false"
                  class="fullRowFlexItem"
                  :label="getItemName('xmlb_id')"
                  prop="xmlb_id">
                  <span :class="itemEdit('xmlb_id')?'disable ref-status':'ref-edit'" v-if="formData.data.xmlb_id && formData.data.xmlb_id.engineering_name" @click="goFormDetail(formData.data.xmlb_id.schemaCode,formData.data.xmlb_id.id)">{{ formData.data.xmlb_id.engineering_name }}</span>
                  <!--                  <span class="readonly" v-if="itemEdit('xmlb_id')">{{ formData.data.xmlb_id.engineering_name }}</span>-->
                  <!--                  <a-input-->
                  <!--                    v-else-->
                  <!--                    :placeholder="setPlaceholder('xmlb_id','请输入')"-->
                  <!--                    v-model="formData.data.xmlb_id.engineering_name"-->
                  <!--                    allowClear/>-->
                </a-form-model-item>
                <a-form-model-item
                  v-if="itemShow('zyrwd_id')"
                  :colon="false"
                  class="fullRowFlexItem"
                  :label="getItemName('zyrwd_id')"
                  prop="zyrwd_id">
                  <span :class="itemEdit('zyrwd_id')?'disable ref-status':'ref-edit'" v-if="formData.data.zyrwd_id && formData.data.zyrwd_id.name" @click="goFormDetail(formData.data.zyrwd_id.schemaCode,formData.data.zyrwd_id.id)">{{ formData.data.zyrwd_id.name }}</span>
                  <!--                  <span class="readonly" v-if="itemEdit('zyrwd_id')">{{ formData.data.zyrwd_id }}</span>-->
                  <!--                  <a-input-->
                  <!--                    v-else-->
                  <!--                    :placeholder="setPlaceholder('zyrwd_id','请输入')"-->
                  <!--                    v-model="formData.data.zyrwd_id"-->
                  <!--                    allowClear/>-->
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
                  v-if="itemShow('task_name')"
                  :colon="false"
                  class="rowFlexItem"
                  :label="getItemName('task_name')"
                  prop="task_name">
                  <span class="readonly" v-if="itemEdit('task_name')">{{ formData.data.task_name }}</span>
                  <a-input
                    v-else
                    :placeholder="placeholder('task_name')"
                    v-model="formData.data.task_name"
                    allowClear/>
                </a-form-model-item>
                <a-form-model-item
                  v-if="itemShow('profession_name')"
                  :colon="false"
                  class="rowFlexItem"
                  :label="getItemName('profession_name')"
                  prop="profession_name">
                  <span class="readonly" v-if="itemEdit('profession_name')">{{ formData.data.profession_name | formatSelector }}</span>
                  <a-select
                    v-else
                    allowClear
                    showSearch
                    v-model="formData.data.profession_name"
                    :mode="getMultiple('profession_name')?'multiple':'default'"
                    :placeholder="placeholder('profession_name')"
                    :options="professionOptions"></a-select>
                </a-form-model-item>
                <a-form-model-item
                  v-if="itemShow('task_type')"
                  :colon="false"
                  class="rowFlexItem"
                  :label="getItemName('task_type')"
                  prop="task_type">
                  <span class="readonly" v-if="itemEdit('task_type')">{{ formData.data.task_type }}</span>
                  <a-radio-group
                    :placeholder="setPlaceholder('task_type')"
                    v-else
                    v-model="formData.data.task_type"
                    :options="getOptions('task_type',true)"></a-radio-group>
                </a-form-model-item>
                <a-form-model-item
                  v-if="itemShow('profession_person')"
                  :colon="false"
                  class="fullRowFlexItem"
                  :label="getItemName('profession_person')"
                  prop="profession_person">
                  <span class="readonly" v-if="itemEdit('profession_person')">{{ formData.data.profession_person | formatSelector }}</span>
                  <staff-selector
                    v-else
                    :options="setStaffSelectorOptions('profession_person','请选择')"
                    @change="(value)=>staffSelectorChange(value,'profession_person')"
                    :value="formData.data.profession_person"/>
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
              </div>
            </a-collapse-panel>
            <a-collapse-panel key="3" class="collapsepanel3">
              <template #header>
                <div class="collapseHeader">
                  <div class="collapseHeaderTitle floatLeft">审核要求设定</div>
                </div>
              </template>
              <div class="rowFlexWrap">
                <a-form-model-item
                  v-if="itemShow('outline_auditor')"
                  :colon="false"
                  class="rowFlexItem"
                  :label="getItemName('outline_auditor')"
                  prop="outline_auditor">
                  <span class="readonly" v-if="itemEdit('outline_auditor')">{{ formData.data.outline_auditor | formatSelector }}</span>
                  <staff-selector
                    v-else
                    :options="setStaffSelectorOptions('outline_auditor','请选择')"
                    @change="(value)=>staffSelectorChange(value,'outline_auditor')"
                    :value="formData.data.outline_auditor"/>
                </a-form-model-item>
                <a-form-model-item
                  v-if="itemShow('company_chief_engineer_flag')"
                  :colon="false"
                  class="rowFlexItem"
                  :label="getItemName('company_chief_engineer_flag')"
                  prop="company_chief_engineer_flag">
                  <span class="readonly" v-if="itemEdit('company_chief_engineer_flag')">{{ formData.data.company_chief_engineer_flag }}</span>
                  <a-radio-group
                    :placeholder="setPlaceholder('company_chief_engineer_flag')"
                    v-else
                    v-model="formData.data.company_chief_engineer_flag"
                    :options="getOptions('company_chief_engineer_flag',true)"></a-radio-group>
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
                  v-if="itemShow('read_designer')"
                  :colon="false"
                  class="rowFlexItem"
                  :label="getItemName('read_designer')"
                  prop="read_designer">
                  <span class="readonly" v-if="itemEdit('read_designer')">{{ formData.data.read_designer | formatSelector }}</span>
                  <staff-selector
                    v-else
                    :options="setStaffSelectorOptions('read_designer','请选择')"
                    @change="(value)=>staffSelectorChange(value,'read_designer')"
                    :value="formData.data.read_designer"/>
                </a-form-model-item>
                <a-form-model-item
                  v-if="itemShow('manufacturer_chief')"
                  :colon="false"
                  class="rowFlexItem"
                  :label="getItemName('manufacturer_chief')"
                  prop="manufacturer_chief">
                  <span class="readonly" v-if="itemEdit('manufacturer_chief')">{{ formData.data.manufacturer_chief | formatSelector }}</span>
                  <staff-selector
                    v-else
                    :options="setStaffSelectorOptions('manufacturer_chief','请选择')"
                    @change="(value)=>staffSelectorChange(value,'manufacturer_chief')"
                    :value="formData.data.manufacturer_chief"/>
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
              </div>
            </a-collapse-panel>
            <a-collapse-panel key="4" class="collapsepanel4">
              <template #header>
                <div class="collapseHeader">
                  <div class="collapseHeaderTitle floatLeft">专业提纲</div>
                </div>
              </template>
              <div class="rowFlexWrap row-flex-none">
                <template v-if="!itemEdit('XTSJ_profession_para')&&!itemEdit('attachment')">
                  <a-button
                    type="primary"
                    size="small"
                    :loading="mergeLoading"
                    :disabled="!this.formData.data.id"
                    style="margin-left: 24px;"
                    @click="createWorkOutlineFile">合成章节</a-button>
                </template>
                <a-form-model-item
                  v-if="itemShow('attachment')"
                  :colon="false"
                  class="rowFlexItem fullRowFlexItem"
                  :label="getItemName('attachment')"
                  prop="attachment">
                  <!--                  <a-upload-->
                  <!--                    :disabled="itemEdit('attachment')||isUploading"-->
                  <!--                    :placeholder="setPlaceholder('attachment','请上传')"-->
                  <!--                    :fileList="uploadFileList"-->
                  <!--                    :remove="removeFile"-->
                  <!--                    :beforeUpload="beforeUpload"-->
                  <!--                    :customRequest="customUploadFile">-->
                  <!--                    <a-button :disabled="itemEdit('attachment')||isUploading"> <a-icon :type="isUploading?'loading':'upload'" /> {{ isUploading?"上传中...":"点击上传" }} </a-button>-->
                  <!--                  </a-upload>-->
                  <ul >
                    <li
                      class="clearfix fileInfos"
                      v-for="(item,index) in formData.data.attachment"
                      :key="index"
                      @click="goDetail(item)">
                      <a-icon type="paper-clip" />
                      <span>{{ item.name }}</span>
                      <div class="right fileInfo">
                        <span>{{ item.creater.name }}</span>
                        <span>{{ item.createdTime }}</span>
                        <a-tooltip title="文档编辑" v-if="item.name.indexOf('.docx')>-1 && isEditOutlineWork">
                          <a-icon
                            class="actionIcon"
                            type="form"
                            @click.stop="editFile(item.refId,item.id,'total')"/>
                        </a-tooltip>
                        <a-icon type="download" @click.stop="download(item)"/>
                        <a-icon v-if="!itemEdit('attachment')" type="delete" @click.stop="removeFile(formData.data.attachment,index)"/>
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
                    :beforeUpload="upload.beforeUpload">
                    <a-button :disabled="itemEdit('attachment')||isUploading"> <a-icon :type="isUploading?'loading':'upload'" /> {{ isUploading?"上传中...":"点击上传" }} </a-button>
                  </a-upload>
                </a-form-model-item>
                <div v-if="itemShow('XTSJ_profession_para')">
                  <a-table :data-source="formData.data.XTSJ_profession_para" :columns="workOutlineChapterColumns" :key="designParaKey">
                    <template slot="attach" slot-scope="t,r">
                      <div v-if="Array.isArray(t)">
                        <a v-for="(att,attIndex) in t" :key="attIndex" class="flex flex-center-align para">
                          <span @click.stop="goDetail(att)">{{ att.name }}</span>
                          <a-tooltip title="文档编辑" v-if="att.name.indexOf('.docx')>-1 && isEditOutlineWork">
                            <a-icon
                              class="actionIcon"
                              type="form"
                              @click.stop="editFile(att.refId,r.id,'sub',r.title)"/>
                          </a-tooltip>
                          <a-icon type="download" @click.stop="download(att)"/>
                          <a-popconfirm title="删除后不可恢复哦，确认删除吗？" @confirm="removeParaFile(r.id,att.id)">
                            <a-icon type="delete" v-if="!itemEdit('XTSJ_profession_para')"/>
                          </a-popconfirm>
                        </a>
                        <a-button size="small" @click="uploadFile(r.id)" v-if="!itemEdit('XTSJ_profession_para')">点击上传</a-button>
                      </div>
                    </template>
                  </a-table>
                </div>
              </div>
            </a-collapse-panel>
          </a-collapse>
        </a-form-model>
      </div>
      <Workflow v-else :workflowInstanceId="formData.data.workflowInstanceId" :workItemId="formData.data.workItemId"></Workflow>
    </div>
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
          <a-tag v-for="(item,index) in commonReplys.replys" :key="index" @click="tagChange(item)">{{ item }}</a-tag>
        </div>
      </div>
      <template #title>
        <a-icon style="padding-right: 5px" type="question-circle" theme="twoTone"/>
        <span>{{ dialogModalConfiguration.title }}</span>
      </template>
    </a-modal>
    <input
      class="file-input"
      ref="chapterFileInput"
      type="file"
      :key="fileKey+1"
      @change="(e) => chapterFileInput(e)"
    />
    <edit-work-outline-panel
      :showEditWorkOutlinePanel="showEditWorkOutlinePanel"
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
  </div>
</template>
<script src="./index.ts"/>
<style lang="less" scoped>
@import url("./index.less");
@import '../../common.less';
</style>
