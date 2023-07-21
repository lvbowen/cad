<template>
  <div>
    <div class="wrap">
      <div class="flex-space-between" style="margin-bottom: 20px">
        <div>
          <a
            :type="tabName==='任务详情'?'primary':''"
            class="button"
            :class="{select:tabName==='任务详情'}"
            style="width: 80px;height: 30px;margin-right:20px;"
            @click="goTaskDetail">任务详情</a>
          <a
            :type="tabName==='流程记录'?'primary':''"
            class="button"
            :class="{select:tabName==='流程记录'}"
            style="width: 80px;"
            @click="goflowTrackLogs">流程记录</a>
        </div>
        <div v-if="tabName==='任务详情'">
          <a-button
            v-show="createButton"
            @click="createClick"
            type="primary"
            style="width: 60px;margin: 0 10px;">新建</a-button>
          <a-button
            v-show="editButton"
            @click="editClick"
            type="primary"
            style="width: 60px;margin: 0 10px;">编辑</a-button>
          <a-button
            v-show="reciveButton"
            @click="reciveClick"
            type="primary"
            style="width: 60px;margin: 0 10px;">签收</a-button>
          <a-button
            v-show="rejectButton"
            @click="rejectClick"
            type="primary"
            style="width: 60px;margin: 0 10px;">驳回</a-button>
          <a-button
            v-show="saveButton"
            @click="saveClick"
            type="primary"
            style="width: 60px;margin: 0 10px;">暂存</a-button>
          <a-button
            v-show="agreeButton"
            @click="agreeClick"
            type="primary"
            style="width: 60px;margin: 0 10px;">同意</a-button>
          <a-button
            v-show="submitButton"
            @click="submitClick"
            type="primary"
            style="width: 60px;margin-left: 10px;">提交</a-button>
        </div>
      </div>
      <div v-if="tabName==='任务详情'">
        <a-collapse
          v-model="activeKey"
          expandIconPosition="right"
          :bordered="false">
          <a-collapse-panel key="6">
            <template #header>
              <div class="flex  header-title">
                <div class="flex" style="width: 8%">
                  <div >审批记录</div>
                </div>
                <div class="process flex">
                  <div>
                    <span>当前节点：</span>
                    <span style="color: #009924">{{ processObj.activityName }}</span>
                  </div>
                  <div>
                    <span>当前处理人：</span>
                    <span style="color:#2970ff" v-for="(item,index) in processObj.participants" :key="index">
                      <span style="padding:0 5px">{{ item.name }}</span>
                    </span>
                  </div>
                  <div>
                    <span>流程跟踪：</span>
                    <span style="color: #fd9900">{{ status }}</span>
                  </div>
                  <div>
                    <span>已用时：</span>
                    <span style="color: #999">{{ usedTime }}</span>
                  </div>
                </div>
              </div>
            </template>
            <Approval
              :key="approvalKey"
              v-if="workflowInstanceId!==null||''"
              class="a-pproval"
              :workflowInstanceId="workflowInstanceId"
            ></Approval>
          </a-collapse-panel>
          <a-collapse-panel key="1">
            <template #header>
              <div class="flex" style="width: 100%">
                <div class="header-title">工程基本信息</div>
              </div>
            </template>
            <div class="flex" style="width: 100%">
              <div style="width: 50%;margin-left: 10px">
                <a-form-model
                  ref="ruleForm1"
                  :model="form"
                  :rules="rules"
                  :labelCol="labelCol"
                  :wrapperCol="wrapperCol"
                >
                  <a-form-model-item ref="projectName" label="工程名称" prop="projectName">
                    <a-input v-model="form.projectName" :disabled="disabledOnetwo" v-if="showInput"/>
                    <span v-else>{{ form.projectName }}</span>
                  </a-form-model-item>
                  <a-form-model-item ref="engineeringStage" label="工程阶段" prop="engineeringStage">
                    <a-input v-model="form.engineeringStage" :disabled="disabledOnetwo" v-if="showInput"/>
                    <span v-else>{{ form.engineeringStage }}</span>
                  </a-form-model-item>
                  <a-form-model-item ref="taskNumber" label="任务编号" prop="taskNumber">
                    <a-input v-model="form.taskNumber" :disabled="baseData" v-if="showInput"/>
                    <span v-else>{{ form.taskNumber }}</span>
                  </a-form-model-item>
                  <a-form-model-item ref="specialNumber" label="特殊编号" prop="baseData">
                    <a-input v-model="form.specialNumber" :disabled="baseData" v-if="showInput"/>
                    <span v-else>{{ form.specialNumber }}</span>
                  </a-form-model-item>
                  <a-form-model-item ref="taskType" label="任务类型" prop="taskType">
                    <a-checkbox v-model="form.taskTypeVal" @change="taskTypeChange" :disabled="disabledOnetwo">
                      工作大纲
                    </a-checkbox>
                  </a-form-model-item>
                </a-form-model>
              </div>
              <div style="width: 50%;padding-left: 50px">
                <a-form-model
                  ref="ruleForm2"
                  :model="form"
                  :rules="rules"
                  :labelCol="labelCol"
                  :wrapperCol="wrapperCol">
                  <a-form-model-item ref="constructionSite" label="工程建设地点" prop="constructionSite">
                    <a-input v-model="form.constructionSite" :disabled="disabledOnetwo" v-if="showInput"/>
                    <span v-else>{{ form.constructionSite }}</span>
                  </a-form-model-item>
                  <a-form-model-item ref="projectNumber" label="工程编号" prop="projectNumber">
                    <a-input v-model="form.projectNumber" :disabled="disabledOnetwo" v-if="showInput"/>
                    <span v-else>{{ form.projectNumber }}</span>
                  </a-form-model-item>
                  <a-form-model-item ref="resultNumber" label="自动成果编号" prop="taskNumber">
                    <a-input v-model="form.resultNumber" :disabled="baseData" v-if="showInput"/>
                    <span v-else>{{ form.resultNumber }}</span>
                  </a-form-model-item>
                  <a-form-model-item ref="versionNumber" label="版本编号" prop="versionNumber">
                    <a-input v-model="form.versionNumber" :disabled="baseData" v-if="showInput"/>
                    <span v-else>{{ form.versionNumber }}</span>
                  </a-form-model-item>
                  <a-form-model-item ref="projectLevel" label="项目级别" prop="projectLevel">
                    <a-checkbox v-model="form.oneTypeVal" @change="oneTypeChange" :disabled="disabledOnetwo">
                      一类项目
                    </a-checkbox>
                    <a-checkbox v-model="form.twoTypeVal" @change="twoTypeChange" :disabled="disabledOnetwo">
                      二类项目
                    </a-checkbox>
                  </a-form-model-item>
                </a-form-model>
              </div>
            </div>
          </a-collapse-panel>
          <a-collapse-panel key="2">
            <template #header>
              <div class="flex" style="width: 100%">
                <div class="header-title">评审人员列表</div>
              </div>
            </template>
            <div class="flex" style="width: 100%">
              <div style="width: 50%">
                <a-form-model
                  ref="ruleForm3"
                  :model="form"
                  :rules="rules"
                  :labelCol="labelCol"
                  :wrapperCol="wrapperCol">
                  <a-form-model-item ref="productionUnit" label="生产单位" prop="productionUnit">
                    <a-input v-model="form.productionUnit" :disabled="disabledOnetwo" v-if="showInput"/>
                    <span v-else>{{ form.productionUnit }}</span>
                  </a-form-model-item>
                  <a-form-model-item ref="chiefEngineer" label="生产单位分管总工" prop="chiefEngineer">
                    <a-input v-model="form.chiefEngineer" :disabled="disabledOnetwo" v-if="showInput"/>
                    <span v-else>{{ form.chiefEngineer }}</span>
                  </a-form-model-item>
                  <a-form-model-item ref="companyChiefEngineer" label="公司主管总工" prop="companyChiefEngineer">
                    <a-input v-model="form.companyChiefEngineer" :disabled="disabledOnetwo" v-if="showInput"/>
                    <span v-else>{{ form.companyChiefEngineer }}</span>
                  </a-form-model-item>
                </a-form-model>
              </div>
              <div style="width: 50%;padding-left: 50px">
                <a-form-model
                  ref="ruleForm4"
                  :model="form"
                  :rules="rules"
                  :labelCol="labelCol"
                  :wrapperCol="wrapperCol">
                  <a-form-model-item ref="projectManager" label="项目经理" prop="projectManager">
                    <a-input v-model="form.projectManager" :disabled="disabledOnetwo" v-if="showInput"/>
                    <span v-else>{{ form.projectManager }}</span>
                  </a-form-model-item>
                  <a-form-model-item ref="chargeManager" label="生产单位经理" prop="chargeManager">
                    <a-input v-model="form.chargeManager" :disabled="disabledOnetwo" v-if="showInput"/>
                    <span v-else>{{ form.chargeManager }}</span>
                  </a-form-model-item>
                  <a-form-model-item ref="generalManager" label="公司主管总经理" prop="generalManager">
                    <a-input v-model="form.generalManager" :disabled="disabledOnetwo" v-if="showInput"/>
                    <span v-else>{{ form.generalManager }}</span>
                  </a-form-model-item>
                </a-form-model>
              </div>
            </div>
          </a-collapse-panel>
          <a-collapse-panel key="3">
            <template #header>
              <div class="flex" style="width: 100%">
                <div class="header-title">专业任务划分</div>
              </div>
            </template>
            <div class="flex">
              <div style="width: 50%;color: #333">
                <span style="color: red">*</span>工作大纲计划开始时间
                <a-date-picker
                  v-model="taskDataOne[0].startTime"
                  @change="startTimeChangeOne"
                  :disabled="professionTask"
                  style="width:15.625vw;margin-left: 1.042vw" />
              </div>
              <div style="width: 50%;color: #333">
                <span style="color: red">*</span>工作大纲计划结束时间
                <a-date-picker
                  v-model="taskDataOne[0].endTime"
                  @change="endTimeChangeOne"
                  :disabled="professionTask"
                  style="width:15.625vw;margin-left: 1.042vw" />
              </div>
            </div>
            <div class="flex-space-between">
              <div class="left-title">
                设计组人员：（参加专业数量：{{ taskDataTwo.length<10?'0'+taskDataTwo.length:taskDataTwo.length }}）
              </div>
              <div>
                <a-button
                  @click="OneTouch"
                  type="primary"
                  size="small"
                  style="padding:0 4px;margin-bottom: 10px;margin-right: 20px"
                  :disabled="professionTask">一键生成</a-button>
                <a-button
                  @click="handleAdd"
                  type="primary"
                  size="small"
                  style="padding:0 4px;margin-bottom: 10px;margin-right: 20px"
                  :disabled="professionTask">新增</a-button>
                <a-popconfirm
                  title="删除后不可恢复哦，确认删除吗？"
                  :disabled="professionTask"
                  @confirm="onDelete"
                >
                  <a-button
                    type="danger"
                    size="small"
                    style="padding:0 4px;margin-bottom: 10px "
                    :disabled="professionTask">删除</a-button>
                </a-popconfirm>
              </div>
            </div>
            <a-table
              bordered
              size="small"
              rowKey="id"
              :key="taskDataTwoNum"
              :customHeaderRow="customHeaderRow"
              :columns="taskColumnsTwo"
              :data-source="taskDataTwo"
              :customRow="taskRowClick"
              :rowSelection="rowSelection"
              :pagination="false">
              <!--参加项目专业-->
              <template #project_major>
                <span>
                  <span style="color:red">*</span>参加项目专业
                </span>
              </template>
              <template #project_major-content="text, record,index">
                <editable-cell
                  :text="text"
                  @editchange="editchange(index, record, $event)"
                  :cellEditable="!professionTask"/>
              </template>
              <!--专业负责人-->
              <!--                            <template #official_manager>-->
              <!--                              <span>-->
              <!--                                <span style="color:red">*</span>专业负责人-映射-->
              <!--                              </span>-->
              <!--                            </template>-->
              <!--                            <template #official_manager-content="text,record,index">-->
              <!--                              <staff-selector-->
              <!--                                :options="personOptions"-->
              <!--                                :disabled="professionTask"-->
              <!--                                @change="onValueChange1(index, record, $event)"-->
              <!--                                :value="text===null?[]:text"/>-->
              <!--                            </template>-->
              <template #professionPermit>
                <span>
                  <span style="color:red">*</span>专业负责人
                </span>
              </template>
              <template #professionPermit-content="text,record,index">
                <div class="permit" :class="professionTask?'disable':''" @click="professionTask?'':openRelevanceTable(index,'professionPermit',record.project_major)">{{ !text?'请选择':Array.isArray(text.user_id ) && text.user_id.length?text.user_id[0].name:'请选择' }}</div>
              </template>
              <!--专业主管总工-->
              <!--                            <template #official_chief>-->
              <!--                              <span>-->
              <!--                                <span style="color:red">*</span>专业主管总工-映射-->
              <!--                              </span>-->
              <!--                            </template>-->
              <!--                            <template #official_chief-content="text,record,index">-->
              <!--                              <staff-selector-->
              <!--                                :options="personOptions"-->
              <!--                                :disabled="professionTask"-->
              <!--                                @change="onValueChange(index, record, $event)"-->
              <!--                                :value="text===null?[]:text"/>-->
              <!--                            </template>-->
              <template #professionManagePermit>
                <span>
                  <span style="color:red">*</span>专业主管总工
                </span>
              </template>
              <template #professionManagePermit-content="text,record,index">
                <div class="permit" :class="professionTask?'disable':''" @click="professionTask?'':openRelevanceTable(index,'professionManagePermit',record.project_major)">{{ !text?'请选择':Array.isArray(text.user_id ) && text.user_id.length?text.user_id[0].name:'请选择' }}</div>
              </template>
              <!--计划开始时间-->
              <template #plan_begin_time>
                <span>
                  <span style="color:red">*</span>计划开始时间
                </span>
              </template>
              <template #plan_begin_time-content="text,record">
                <a-date-picker v-model="text" @change="startTimeChangeTwo" :disabled="professionTask" />
              </template>
              <!--计划结束时间-->
              <template #plan_end_time>
                <span>
                  <span style="color:red">*</span>计划结束时间
                </span>
              </template>
              <template #plan_end_time-content="text,record">
                <a-date-picker v-model="text" @change="endTimeChangeTwo" :disabled="professionTask" />
              </template>
              <!--计划工期-->
              <template #plan_duration>
                <span>
                  <span style="color:red">*</span>计划工期
                </span>
              </template>
              <!--专业设计提纲-->
              <template #offical_outline-content="text,record">
                <a-checkbox :defaultChecked="text==='是'?true:false" @change="designOutlineChange(record)" :disabled="professionTask">必须</a-checkbox>
              </template>
              <!--是否公司总工审核-->
              <template #chief_audit_flag-content="text,record">
                <a-checkbox :defaultChecked="text==='是'?true:false" @change="auditChange(record)" :disabled="professionTask">必须</a-checkbox>
              </template>
              <!--计算书-->
              <template #calculation-content="text,record">
                <a-checkbox :defaultChecked="text==='是'?true:false" @change="calculationBookChange(record)" :disabled="professionTask">必须</a-checkbox>
              </template>
            </a-table>
          </a-collapse-panel>
          <a-collapse-panel key="4">
            <template #header>
              <div class="flex" style="width: 100%">
                <div class="header-title">工作大纲成果文件</div>
              </div>
            </template>
            <div class="left-title" style="padding-top:0">
              附件上传
              <template v-if="activityCode==='edit_workoutline'">
                <a-button
                  v-if="!this.defaultFileList.length"
                  type="primary"
                  size="small"
                  :disabled="!workOutlineDataId"
                  style="padding: 0 4px;margin-left: 24px;"
                  @click="createWorkOutlineFile">一键生成</a-button>
                <a-popconfirm
                  title="制作完成后，将会覆盖已存在的工作大纲，请确认？"
                  okText="确认"
                  cancelText="取消"
                  @confirm="createWorkOutlineFile"
                  v-else>
                  <a-button
                    type="primary"
                    size="small"
                    style="padding: 0 4px;margin-left: 24px;">一键生成</a-button>
                </a-popconfirm>
              </template>
            </div>
            <div class="flex-center-align">
              工作大纲：
              <a-upload
                name="file"
                :multiple="true"
                :action="action"
                :headers="headers"
                :beforeUpload="beforeUpload"
                @change="fileUpload"
                :disabled="professionTask"
                :showUploadList="showUploadListShow"
              >
                <a-button style="width: 200px;margin-right:20px;" :disabled="professionTask"> <a-icon type="upload" />上传附件</a-button>
              </a-upload>
            </div>
            <div style="padding-top:1.852vh;cursor: pointer">
              <div v-for="(item,index) in defaultFileList" :key="index" class="flex-space-between">
                <div class="flex-center-align" style="margin-right: 1.5vw;" @click="goDetail(item)">
                  <i data-v-63061980="" aria-label="图标: paper-clip" class="anticon anticon-paper-clip">
                    <svg
                      viewBox="64 64 896 896"
                      data-icon="paper-clip"
                      width="1em"
                      height="1em"
                      fill="currentColor"
                      aria-hidden="true"
                      focusable="false"
                      class="">
                      <path :d="svg"></path>
                    </svg>
                  </i>
                  <div style="margin-left: 0.521vw">{{ item.name }}</div>
                </div>
                <div @click="download(item)">
                  <span>{{ item.creater.name }}</span>
                  <span style="margin: 0 0.521vw">{{ item.createdTime }}</span>
                  <a-icon type="download" />
                </div>
              </div>
            </div>
          </a-collapse-panel>
        </a-collapse>
        <div class="bottom-collapse">
          <a-collapse v-model="activeKey" expandIconPosition="right" :bordered="false">
            <a-collapse-panel key="5">
              <template #header>
                <div class="flex" style="width: 100%">
                  <div class="header-title">总工指导意见区域</div>
                </div>
              </template>
              <a-form-model
                ref="ruleForm5"
                :model="form"
                :rules="rules"
                :labelCol="labelCol"
                :wrapperCol="wrapperCol"
              >
                <a-form-model-item ref="opinionCreator" label="指导意见创建人" prop="opinionCreator">
                  <a-input v-model="form.opinionCreator" :disabled="cheifInstruction" v-if="showInput"/>
                  <span v-else>{{ form.opinionCreator }}</span>
                </a-form-model-item>
              </a-form-model>
              <div class="flex" style="margin-top:10px;margin-bottom: 20px">
                <div class="instructions">输入或附件（文档）<br />总工指导意见：</div>
                <a-textarea v-model="instructions" :disabled="cheifInstruction" v-if="showInput"/>
                <span v-else>{{ instructions }}</span>
              </div>
              <a-table
                bordered
                size="small"
                rowKey="key"
                :columns="personnelListColumn"
                :data-source="personnelList"
                :customHeaderRow="customHeaderRow"
                :pagination="false">
                <template #unsignPersonnelList="text,record">
                  <span v-for="(item,index) in text" :key="index">
                    <span>{{ item }},</span>
                  </span>
                </template>
                <template #signPersonnelList="text,record">
                  <span v-for="(item,index) in text" :key="index">
                    <span>{{ item }},</span>
                  </span>
                </template>
              </a-table>
            </a-collapse-panel>
          </a-collapse>
        </div>
      </div>
      <Workflow v-else :workflowInstanceId="workflowInstanceId" :workItemId="workitemFinishId"></Workflow>
      <a-modal
        title="项目专业"
        :visible="visible"
        @ok="handleOk"
        @cancel="handleCancel"
      >
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
        title="请输入审批意见"
        :visible="showComment"
        @ok="CommentOk"
        @cancel="handleCancel"
      >
        <a-textarea v-model="approvalComments" placeholder="请输入内容"/>
        <div v-if="this.commonReplys">
          <div style="margin:10px 0">常用意见</div>
          <div>
            <a-tag
              v-for="(item,index) in commonReplys.replys"
              :key="index"
              @click="tagChange(item)"
              style="margin-right: 10px;padding:0 10px;">{{ item }}</a-tag>
          </div>
        </div>
      </a-modal>
    </div>
    <application-list v-show="false" class="divide    "/>
    <work-outline-models
      :showWorkOutlineModels="showWorkOutlineModels"
      :workOutlineDataId="workOutlineDataId"
      :wProjectName="wProjectName"
      @eidtWorkOutlineFile="eidtWorkOutlineFile"
      @closeWorkOutlineModels="closeWorkOutlineModels"
      @openEditWorkOutlinePanel="openEditWorkOutlinePanel"/>
    <edit-work-outline-panel
      :workOutlineDataId="workOutlineDataId"
      :showEditWorkOutlinePanel="showEditWorkOutlinePanel"
      :wProjectName="wProjectName"
      :editorUrl="editorUrl"
      :defaultFileType="defaultFileType"
      :defaultBussiness="defaultBussiness"
      :defaultProjectState="defaultProjectState"
      :defaultProfessionType="defaultProfessionType"
      @refreshAttachment="refreshAttachment"
      @closeEditWorkOutlinePanel="closeEditWorkOutlinePanel"/>
    <relevance-table
      :showRelevanceTable="showRelevanceTable"
      :searchProjectMajor="searchProjectMajor"
      :workOutlineDataManufacturer= "bizObject.data['manufacturer']"
      @closeRelevanceModal="closeRelevanceModal"
      @bindPerson="bindPerson"/>
  </div>
</template>
<script src="./index.ts"></script>
<style lang="less" scoped>
@import "../../../../styles/public.module.less";
@import "../index/index.less";
.wrap{
  background-color: #fff;
  padding: 10px;
  .button{
    color:#B1B1B1 ;
    font-size: 16px;
  }
  .select{
    color: #666666 ;
    font-size: 16px;
    font-weight: bold;
    border-bottom: 3px solid  #3293FF;
    padding-bottom: 8px;
  }
  .header-title{
    height: 24px;
    width: 100%;
    padding: 3px 0 0 22px ;
    background:url("../../../../../src/assets/extends/CoordinateDesign/ProductionTaskList/title.png") no-repeat;
    background-size: 100% 100%;
    color: #FFFFFF;
    //font-weight: bold;
    font-size: 13px;
  }
  .left-title{
    font-weight: bold;
    font-size: 14px;
    color: #333;
    position:relative;
    margin-left:15px;
    padding: 24px 0px 18px 0;
    &::before{
      content: "";
      display: block;
      width:3px;
      height:20px;
      background-color: #2970ff;
      position: absolute;
      left: -15px;
      bottom: 18px;
    }
  }
  .bottom-collapse{
    .instructions{
      width: 156px;
      color: rgba(0, 0, 0, 0.85);
      font-size: 14px;
    }
  }
  .a-pproval{
    /deep/.ant-collapse-borderless > .ant-collapse-item {
      border-bottom:none;
    }
  }
  .process{
    color: #575859;
    div:nth-child(2) {
      margin: 0 20px;
    }
    div:nth-child(3) {
      margin-right: 20px;
    }
  }
  .process::before{
    content: "";
    display: block;
    width: 3px;
    height:25px;
    border-radius: 2px;
    margin-right: 20px;
    //background-image: url("../../../../../src/assets/extends/coordinate/fgx.png");
    background-size: 100% 100%;
  }
  .divide {
    position: absolute;
    left: -9999px;
  }
}
.permit {
  border: 1px solid #d9d9d9;
  min-height: 32px;
  border-radius: 4px;
  position: relative;
  padding: 3px 5px 0 5px;
  line-height: 1.4em;
  color: rgba(0, 0, 0, 0.25);
  .flex;
  .flex-center-align;
  .flex-center-justify;
  cursor: pointer;
}
</style>
<style lang="less" scoped>
/deep/.ant-col-14{
  margin-left: 10px;
}
/deep/.ant-form-item-label{
  text-align: left;
  width: 6.771vw
}
/deep/.ant-form-item-control{
  width:25vw;
}

/deep/.ant-input{
  padding-left:10px;
}

/deep/.ant-collapse-icon-position-right > .ant-collapse-item > .ant-collapse-header{
  //background-color: #F3F3F3;
  padding: 0;
}

/deep/.ant-collapse-item{
  border: 1px solid #F3F3F3;
  margin-bottom: 10px;
}

/deep/.ant-collapse-borderless > .ant-collapse-item > .ant-collapse-content > .ant-collapse-content-box {
  padding-top: 24px;
  padding-left: 45px;
  padding-right: 45px;
}
/deep/ .ant-table-small > .ant-table-content > .ant-table-body > table > .ant-table-thead > tr > th{
  padding:11px 8px;
  font-size: 13px;
}
/deep/.ant-table-small > .ant-table-content > .ant-table-body > table > .ant-table-tbody > tr > td{
  padding:11px 8px;
  font-size: 13px;
}
/deep/.form-header{
  display: none !important;
}
/deep/.ant-collapse-item {
  &:not(:last-child){
    margin-bottom: 10px;
  }
  .ant-collapse-header {
    padding: unset!important;;
  }

  .ant-collapse-content-box {
    margin-top: 3px;
    background-color: #fff;
    padding: 16px !important;
    border-radius: 0px 0px 4px 4px;
    border: 1px solid #E2EAFF;
    box-shadow: 0px 4px 8px 0px rgba(125,173,239,0.1);
    &:hover{
      border: 1px solid #7DADEF;
      box-shadow: 0px 4px 8px 0px rgba(125,173,239,0.3);
      border-radius: 0px 0px 4px 4px;
    }

    .ant-form-item:last-child {
      margin-bottom: unset;
    }

    .subItem:last-child {
      margin-bottom: unset;
    }
  }
}
/deep/.ant-form-item-required{
  margin-left: -12px;
}
/deep/.ant-col.ant-col-1.ant-form-item-label{
  overflow: visible;
}
// 设置默认的颜色
/deep/.ant-checkbox{
  .ant-checkbox-inner{
    border: 1px solid #595959;
  }
}
// 设置选中的颜色
/deep/.ant-checkbox-checked .ant-checkbox-inner,
/deep/.ant-checkbox-indeterminate .ant-checkbox-inner {
  border: 1px solid #d9d9d9;
}
</style>
