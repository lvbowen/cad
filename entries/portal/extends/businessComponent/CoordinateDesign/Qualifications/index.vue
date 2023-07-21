<template>
  <div class="qualificationsWrap flex flex-column">
    <div class="headerTitle">
      <img src="../../../../src/assets/extends/coordinate/项目信息.png" style="padding: 0 10px" alt="">
      <span>任职资格</span>
    </div>
    <div class="qualificationsContent flex-1 flex flex-column">
      <div class="qualificationsContentHeader clearfix">
        <div class="actions left">
          <a-button @click="addQualification" class="button" type="primary">新增</a-button>
          <a-button @click="modifyQualification" class="button" type="primary">修改</a-button>
          <a-button @click="deleteQualification" class="button" type="danger">删除</a-button>
          <!--          <a-button @click="deleteQualification" class="button" type="primary">导入</a-button>-->
        </div>
        <div class="right extra flex">
          <div class="flex-center-align">
            <span>所属部门</span>
            <staff-selector
              class="staff-selector"
              :options="departmentOptions"
              :disabled="false"
              @change="departmentChanged"
              :value="departmentObj"/>
          </div>
          <div class="flex-center-align">
            <span>人员姓名</span>
            <staff-selector
              class="staff-selector"
              :options="personOptions"
              :disabled="false"
              @change="personChanged"
              :value="personObj"/>
          </div>
          <a-input-search
            allowClear
            class="search"
            placeholder="请输入所属岗位名称"
            enterButton
            @search="onSearch"/>
        </div>
      </div>
      <div class="clearfix flex-1 flex flex-column">
        <a-table
          size="small"
          rowKey="id"
          class="table-content-scroll"
          :rowSelection="roleTable.rowSelection"
          :pagination="false"
          :scroll="{ y: 750 }"
          :loading="roleTable.loading"
          :columns="roleTable.columns"
          :dataSource="roleTable.dataSource"
          bordered>
          <template #projectManagerFlag="text, record"><span v-if="text===true" style="color:red">√</span></template>
          <template #chiefFlag="text, record"><span v-if="text===true" style="color:red">√</span></template>
          <template #designFlag="text, record"><span v-if="text===true" style="color:red">√</span></template>
          <template #checkFlag="text, record"><span v-if="text===true" style="color:red">√</span></template>
          <template #auditFlag="text, record"><span v-if="text===true" style="color:red">√</span></template>
          <template #reviewFlag="text, record"><span v-if="text===true" style="color:red">√</span></template>
          <template #approvalFlag="text, record"><span v-if="text===true" style="color:red">√</span></template>
        </a-table>
        <a-pagination
          class="right"
          size="small"
          :current="roleTable.pagination.current+1"
          @change="roleTable.pagination.onChange"
          :pageSize="roleTable.pagination.pageSize"
          :showQuickJumper="roleTable.pagination.showQuickJumper"
          :showTotal="roleTable.pagination.showTotal"
          :total="roleTable.pagination.total"/>
      </div>
    </div>
    <!--    <a-modal
      :title="modal.title"
      :centered="modal.centered"
      :visible="modal.visible"
      :okText="modal.okText"
      :maskClosable="modal.maskClosable"
      :destroyOnClose="modal.destroyOnClose"
      :confirmLoading="modal.confirmLoading"
      :afterClose="modal.afterClose"
      @cancel="modal.cancel"
      @ok="modal.ok">
      <a-form-model
        ref="basicForm"
        :model="basicForm.formData"
        :rules="basicForm.rules"
        labelAlign="left">
        <a-form-model-item label="所属部门" prop="departmentId" required >
          <a-select :disabled="modal.isModify" v-model="basicForm.formData.departmentId" :options="manufacturerOptions"></a-select>
        </a-form-model-item>
        <a-form-model-item label="人员姓名" prop="role" required>
&lt;!&ndash;          <a-checkbox-group v-model="basicForm.formData.role" :options="roleTypes"></a-checkbox-group>&ndash;&gt;
        </a-form-model-item>
        <a-form-model-item label="员工" prop="userId" required >
          <a-select :disabled="modal.isModify" v-model="basicForm.formData.userId" :options="personOptions"></a-select>
        </a-form-model-item>
        <a-form-model-item label="设计" prop="designFlag">
          <a-checkbox v-model="basicForm.formData.designFlag">是</a-checkbox>
        </a-form-model-item>
        <a-form-model-item label="校核" prop="checkFlag">
          <a-checkbox v-model="basicForm.formData.checkFlag">是</a-checkbox>
        </a-form-model-item>
        <a-form-model-item label="审核" prop="auditFlag">
          <a-checkbox v-model="basicForm.formData.auditFlag">是</a-checkbox>
        </a-form-model-item>
        <a-form-model-item label="项目经理" prop="projectManagerFlag">
          <a-checkbox v-model="basicForm.formData.projectManagerFlag">是</a-checkbox>
        </a-form-model-item>
        <a-form-model-item label="复审" prop="reviewFlag">
          <a-checkbox v-model="basicForm.formData.reviewFlag">是</a-checkbox>
        </a-form-model-item>
        <a-form-model-item label="审定" prop="validationFlag">
          <a-checkbox v-model="basicForm.formData.validationFlag">是</a-checkbox>
        </a-form-model-item>
      </a-form-model>
    </a-modal>-->
    <application-list v-show="false" class="divide"/>
  </div>
</template>

<script src="./index.ts"/>
<style lang="less" scoped>
@import "../../../styles/public.module.less";
@import url("./index.less");
@import "../../../styles/table.modules.less";
/deep/ .ant-pagination {
  text-align: right;
  margin-top: @spacing-base;
}
</style>
