<template>
  <div class="topContainer flex flex-column">
    <!--    <div class="top"></div>-->
    <!--    <span class="double-left" @click="$router.go(-1)">-->
    <!--      <a-icon type="double-left"></a-icon>我的首页-->
    <!--    </span>-->
    <div class="back-home">
      <a-button
        shape="circle"
        icon="arrow-left"
        :style="{color:'#fafafa'}"
        @click="$router.go(-1)"></a-button>流程中心
    </div>
    <div class="menu flex">
      <a-button :type="activeMenu==='toDoWorks'?'primary':''" icon="appstore" @click="changeActiveMenu('toDoWorks')"><b>我的待办</b></a-button>
      <a-button :type="activeMenu==='doneWorks'?'primary':''" icon="calendar" @click="changeActiveMenu('doneWorks')"><b>我的已办</b></a-button>
    </div>
    <div class="taskCenterContainer flex-1 flex flex-column">
      <div class="base-search-btn flex">
        <a-input-search
          placeholder="请输入流程名称关键字"
          v-model="workflowNameKeyWords"
          @pressEnter="(e)=> enterSearch(e,'workflowName')"
          @search="(key)=> getList(key,'workflowName')"></a-input-search>
        <a-input-search
          :placeholder="activeMenu==='toDoWorks'?'请输入发起人关键字':'请输入发起人全称！'"
          v-model="originatorNameKeyWords"
          @pressEnter="(e)=> enterSearch(e,'originatorName')"
          @search="(key)=> getList(key,'originatorName')"></a-input-search>
        <div class="flex flex-center-align">
          <span>起止时间：</span>
          <a-range-picker @change="onChangeDate" :key="activeMenu"></a-range-picker>
        </div>
      </div>
      <div ref="doWrap" class="doWrap flex-1">
        <div class="floatLeft toDoWrap line-table-header table-content-scroll" v-show="activeMenu==='toDoWorks'">
          <div class="title">
            <h3 class="titleContent floatLeft">我的待办</h3>
            <div class="titlExtra floatRight">
              <div class="titlExtraItem">
                <!--                <span class="titlExtra">查看全部</span>-->
                <!--                <a-icon class="rightIcon" type="double-right" />-->
              </div>
            </div>
          </div>
          <a-table
            size="small"
            rowKey="id"
            :pagination="false"
            :rowClassName="toDoTable.rowClassName"
            :columns="toDoTable.columns"
            :dataSource="toDoTable.dataSource"
            :scroll="toDoTable.scroll"
            :customRow="toDoTable.customRow"
            :loading="toDoTable.loading">
            <template #instanceName="t,r">
              <a @click.stop="toForm(r)">{{ t }}</a>
            </template>
            <template #planEndTime="text, record">
              <span :style="{color:record.risk==='正常'?'#3BB141':record.risk==='紧急'?'#E6A23C':record.risk==='已过期'?'#DE1037':'',fontWeight:'bold'}">{{ text }}</span>
            </template>
          </a-table>
          <a-pagination
            class="pagination"
            size="small"
            :current="toDoTable.pagination.current"
            :pageSize="toDoTable.pagination.pageSize"
            :showQuickJumper="toDoTable.pagination.showQuickJumper"
            :total="toDoTable.pagination.total"
            :showTotal="toDoTable.pagination.showTotal"
            @change="toDoTable.pagination.onChange"></a-pagination>
        </div>
        <div class="floatRight doneWrap line-table-header table-content-scroll" v-show="activeMenu==='doneWorks'">
          <div class="title">
            <h3 class="titleContent floatLeft">我的已办</h3>
            <div class="titlExtra floatRight">
              <div class="titlExtraItem">
                <!--                <span class="titlExtra">查看全部</span>-->
                <!--                <a-icon class="rightIcon" type="double-right" />-->
              </div>
            </div>
          </div>
          <a-table
            size="small"
            rowKey="id"
            :pagination="false"
            :rowClassName="doneTable.rowClassName"
            :columns="doneTable.columns"
            :dataSource="doneTable.dataSource"
            :scroll="doneTable.scroll"
            :customRow="doneTable.customRow"
            :loading="doneTable.loading">
            <template #instanceName="t,r">
              <a @click.stop="toForm(r)">{{ t }}</a>
            </template>
            <template #planEndTime="text, record">
              <span :style="{color:record.risk==='正常'?'#3BB141':record.risk==='紧急'?'#E6A23C':record.risk==='已过期'?'#DE1037':'',fontWeight:'bold'}">{{ text }}</span>
            </template>
          </a-table>
          <a-pagination
            class="pagination"
            size="small"
            :current="doneTable.pagination.current"
            :pageSize="doneTable.pagination.pageSize"
            :showQuickJumper="doneTable.pagination.showQuickJumper"
            :total="doneTable.pagination.total"
            :showTotal="doneTable.pagination.showTotal"
            @change="doneTable.pagination.onChange"></a-pagination>
        </div>
      </div>
      <div class="spaceVertical"></div>
      <div ref="projectWrap" class="projectWrap" v-if="false">
        <div class="title">
          <h3 class="titleContent floatLeft">我的项目</h3>
          <div class="titlExtra floatRight">
            <div class="titlExtraItem">
              <span class="titlExtra">查看全部</span>
              <a-icon class="rightIcon" type="double-right" />
            </div>
          </div>
        </div>
        <a-table
          size="small"
          rowKey="id"
          :pagination="projectTable.pagination"
          :rowClassName="projectTable.rowClassName"
          :columns="projectTable.columns"
          :dataSource="projectTable.dataSource"
          :scroll="projectTable.scroll"
          :customRow="projectTable.customRow"
          :expandedRowKeys="projectTable.expandedRowKeys"
          :expandIconColumnIndex="1"
          :expandIcon="customExpandIcon"
          :expandRowByClick="true"
          @expand="expand"
          :loading="projectTable.loading">
          <template #projectNameTitle>
            <span class="customizationTitle">项目名称</span>
          </template>
          <template #progressTitle>
            <span class="customizationTitle">进度</span>
          </template>
          <template #progress="text,record">
            <div v-if="record.taskRatio" class="progress" :style="setProgressStyleObj(record.taskRatio)">
              <div class="progressBar" :style="setProgressBarStyleObj(record.taskRatio)"></div>
              <span class="progressNum">{{ record.taskRatio }}%</span>
            </div>
          </template>
        </a-table>
      </div>
    </div>
  </div>
</template>

<script src="./index.ts" />
<style lang="less" scoped>
@import url("./index.less");
</style>
<style lang="less" scoped>
@import '../../../styles/public.module.less';
@import '../../../styles/table.modules.less';
.back-home {
  color: white;
  font-size: 18px;
  font-weight: bold;
  margin-bottom: @spacing-medium;
  .ant-btn {
    background-color: rgba(132,169,235,0.6);
    margin-right: @spacing-base;
  }
}
.menu {
  margin-bottom: @spacing-medium;
  .ant-btn {
    margin-right: @spacing-base;
    /deep/.anticon {
      margin-right: 1/4 * @spacing-base;
    }
  }
}
/deep/ .ant-input-search {
  margin-right: @spacing-large;
}
</style>
