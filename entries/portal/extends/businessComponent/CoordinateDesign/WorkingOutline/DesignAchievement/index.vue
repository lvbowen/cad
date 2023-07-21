<template>
  <div ref="designResultContainer" class="designResultContainer">
    <a-collapse :defaultActiveKey="defaultActiveKey" :bordered="false" expandIconPosition="right">
      <a-collapse-panel key="1">
        <template #header>
          <div class="collapseHeader">
            <div class="collapseHeaderTitle floatLeft">设计成果</div>
          </div>
        </template>
        <div class="flex flex-center-align flex-end bts">
          <!--          <a-input-search-->
          <!--            v-model.trim="keywords"-->
          <!--            class="inputSearch"-->
          <!--            placeholder="请输入关键字搜索"-->
          <!--            enterButton-->
          <!--            @search="search"-->
          <!--            allowClear/>-->
          <a-button
            type="primary"
            :loading="downloadLoading"
            @click="downloadAchievments"
            v-if="professionResultTable.dataSource.length">下载</a-button>
        </div>
        <a-table
          bordered
          size="small"
          :key="professionResultTable.tabKey"
          :rowKey="professionResultTable.rowKey"
          :columns="professionResultTable.columns"
          :data-source="professionResultTable.dataSource"
          :pagination="professionResultTable.pagination"
          :loading="professionResultTable.loading"
          :defaultExpandAllRows="professionResultTable.defaultExpandAllRows"
        >
          <template slot="expandedRowRender" slot-scope="p" v-if="p.types">
            <a-table
              bordered
              size="small"
              :key="designTypeResultTable.tabKey"
              :rowKey="designTypeResultTable.rowKey"
              :columns="designTypeResultTable.columns"
              :data-source="p.types"
              :pagination="designTypeResultTable.pagination"
              :defaultExpandAllRows="designTypeResultTable.defaultExpandAllRows"
            >
              <template slot="expandedRowRender" slot-scope="p" v-if="p.tasks">
                <a-table
                  bordered
                  size="small"
                  :key="tasksTypeResultTable.tabKey"
                  :rowKey="tasksTypeResultTable.rowKey"
                  :columns="tasksTypeResultTable.columns"
                  :data-source="p.tasks"
                  :pagination="tasksTypeResultTable.pagination"
                  :defaultExpandAllRows="tasksTypeResultTable.defaultExpandAllRows"
                >
                  <template #files="t" >
                    <template v-if="Array.isArray(t) && t.length">
                      <div v-for="(file,index) in t" :key="index">
                        <a-tooltip>
                          <template slot="title">
                            单击预览<br>双击下载
                          </template>
                          <a @click="previewUrl(file.previewUrl)" @dblclick="downloadUrl(file.downloadUrl)"> {{ file.fileName }}</a>
                        </a-tooltip>
                        <a-icon type="download" @click="downloadUrl(file.downloadUrl)"></a-icon>
                      </div>
                    </template>
                  </template>
                  <template #taskId="t">
                    <a @click="toForm(t)">详情</a>
                  </template>
                </a-table>
              </template>
            </a-table>
          </template>
        </a-table>
        <!--        <a-table-->
        <!--          bordered-->
        <!--          size="small"-->
        <!--          rowKey="id"-->
        <!--          :loading="resultTable.loading"-->
        <!--          :pagination="resultTable.pagination"-->
        <!--          :columns="resultTable.columns"-->
        <!--          :dataSource="resultTable.dataSource"-->
        <!--          :expandedRowKeys="resultTable.expandedRowKeys"-->
        <!--          :expandIconColumnIndex="1"-->
        <!--          :expandRowByClick="true"-->
        <!--          :expandIcon="customExpandIcon"-->
        <!--          :scroll="resultTable.scroll"-->
        <!--          @expand="expand"-->
        <!--        >-->
        <!--          <template #name="text,record">-->
        <!--            <div>-->
        <!--              <span>{{ record.attachments[0].name }}</span>-->
        <!--            </div>-->
        <!--          </template>-->
        <!--          <template #actions="text,record">-->
        <!--            <div v-if="!record.children && Array.isArray(record.attachments) && record.attachments.length">-->
        <!--              <a-button @click.stop="download(record.attachments[0])" size="small" type="link">下载</a-button>-->
        <!--              <a-button-->
        <!--                @click.stop="preview(record.attachments[0])"-->
        <!--                size="small"-->
        <!--                type="link"-->
        <!--                v-if="record.attachments[0].onlinePrewView || record.attachments[0].lightweightAddress">预览</a-button>-->
        <!--            </div>-->
        <!--          </template>-->
        <!--        </a-table>-->
      </a-collapse-panel>
    </a-collapse>
  </div>
</template>

<script src="./index.ts"/>
<style lang="less" scoped>
@import url("./index.less");
@import '../../../../styles/public.module.less';
.anticon-download {
  margin-left: @spacing-base;
}
/deep/.ant-collapse-item {
  &:not(:last-child){
    margin-bottom: 10px;
  }
  .ant-collapse-header {
    padding: 0 0 5px 0 !important;
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
</style>
