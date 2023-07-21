<template>
  <div id="portal-form-list-container" class="app-menu">
    <div id="ApplicationList" class="application-box" ref="application">
      <div class="content-top" ref="contentTop" :class="formNames.findIndex((i)=> $route.path.indexOf(i)>-1)>-1?'collapse-header':''">
        <h2>
          <!-- 左侧logo -->
          <slot name="left"></slot>
          <!-- 1 -->
          <div
            class="list-header"
            :class="formNames.findIndex((i)=> $route.path.indexOf(i)>-1)>-1?'collapse-header-title':''"
            @click="showQueryHeaderList = !showQueryHeaderList"
          >
            <div :title="isChinese ? curTitle : curTitleNameI18n[$i18n.locale]">
              {{ isChinese ? curTitle : curTitleNameI18n[$i18n.locale] }}
            </div>
            <i
              v-show="!showQueryHeaderList && showIcon"
              class="icon aufontAll h-icon-all-down-o"
            ></i>
            <i
              v-show="showQueryHeaderList && showIcon"
              class="icon aufontAll h-icon-all-up-o"
            ></i>
          </div>

          <div class="query-header-list" v-if="showQueryHeaderList && showIcon">
            <div
              class="list-item"
              :class="{ selected: curListCode === list.code }"
              v-for="(list, index) in queryHeaderList"
              :key="index"
              @click="changeListView(list)"
            >
              <i class="icon aufontAll h-icon-all-layout-o"></i>
              <div class="item-name">
                {{ isChinese ? list.name : list.name_i18n[$i18n.locale] }}
              </div>
              <i
                class="checked icon aufontAll h-icon-all-check"
                v-show="curListCode === list.code"
              ></i>
            </div>

            <!-- 下拉框遮罩 -->
            <div class="filter-mask" @click="showQueryHeaderList = false"></div>
          </div>
        </h2>

        <!-- 操作 -->
        <div class="actions-box">
          <!-- 设置展示项 -->
          <div class="settings">
            <div
              class="settings-item"
              v-if="queryConditions && queryConditions.length > 0"
            >
              <filterCard
                @clear="clear"
                v-if="queryConditionSource.length === 1"
                :source="queryConditionSource"
              />
              <filterCard
                @item-click="toggleQueryConditions"
                @clear="clear"
                v-else-if="queryConditionSource.length > 1"
                :source="queryConditionSource"
              />
              <a-tooltip v-if="queryConditionSource.length <= 1">
                <template slot="title">
                  {{ $t("cloudpivot.list.pc.Screen") }}
                </template>
                <i
                  v-if="!isInFilter"
                  class="icon aufontAll h-icon-all-filter-o"
                  :class="{ 'high-light': isShowFilterBox }"
                  @click="toggleQueryConditions"
                ></i>
              </a-tooltip>
            </div>
            <div class="settings-item">
              <i
                class="icon aufontAll h-icon-all-filter-o"
                :class="{ 'high-light': isInFilter }"
                style="margin-right: 16px"
                v-if="isInFilter"
                @click="
                  () => {
                    this.isInFilter = false;
                    this.reload();
                  }
                "
              ></i>
              <a-tooltip>
                <template slot="title">
                  {{ $t("cloudpivot.list.pc.SetDisplayItems") }}
                </template>
                <i
                  class="icon aufontAll h-icon-all-setting-o"
                  @click="columnSetting"
                ></i>
              </a-tooltip>
            </div>
          </div>
          <!-- 其他操作按钮:新增/删除/... -->
          <div id="list-actions" ref="actions" :class="formNames.findIndex((i)=> $route.path.indexOf(i)>-1)>-1?'collapse-header-button':''">
            <!-- 技术交底专用按钮 -->
            <a-button v-if="isJsjd" @click="viewReport">查看报表</a-button>
            <a-button v-if="isJsjd" @click="QRcode">二维码</a-button>
            <!-- 自带按钮 -->
            <a-button
              v-show="dataManageCode != ''"
              @click="(e) => bulkOperationClick(e)"
            >批量修改
            </a-button>
            <a-button
              @click="
                () => {
                  this.getQueryList('reload');
                }
              "
            >刷新
            </a-button>
            <template v-for="(ac, index) in queryActions">
              <template v-if="ac.actionCode !== 'batch_print'">
                <a-button
                  v-show="ac.actionCode !== 'edit'"
                  :class="
                    (ac.attributes && ac.attributes.class) ||
                      `list-action-${ac.actionCode}`
                  "
                  :id="ac.attributes && ac.attributes.id"
                  :type="index === 0 ? 'primary' : 'default'"
                  :key="index"
                  :disabled="
                    ((!deleteDisabled && ac.actionCode === 'delete') || (ac.actionCode === 'delete' && addDisabled)) ||
                      (exportDisabled && ac.actionCode === 'export') ||
                      (!deleteDisabled && ac.actionCode === 'qr_code') ||
                      (!deleteDisabled && ac.actionCode === 'editowner') ||
                      (ac.actionCode === 'add' && addDisabled )
                  "
                  @click="(e) => actionClick(ac, e)"
                >{{ isChinese ? ac.name : ac.name_i18n[$i18n.locale] }}
                </a-button>
              </template>
              <span v-else :key="index" ref="printBatchShow">
                <a-button
                  style="margin-left: 8px"
                  :class="
                    (ac.attributes && ac.attributes.class) ||
                      `list-action-${ac.actionCode}`
                  "
                  :id="ac.attributes && ac.attributes.id"
                  :type="'default'"
                  :disabled="exportDisabled && ac.actionCode === 'batch_print'"
                  :key="index"
                  @click="(e) => actionClick(ac, e)"
                >{{
                  isChinese ? ac.name : ac.name_i18n[$i18n.locale]
                }}</a-button
                >
                <div
                  class="prints-drop-down animated fadeIn"
                  v-show="toShowPrints"
                  :style="printBtnListStyle"
                >
                  <template v-for="(i, v) in printTempList">
                    <a-tooltip placement="left" :key="v">
                      <template slot="title">
                        <span>{{ i.printTemplateName }}</span>
                      </template>
                      <div
                        class="item-print"
                        @click="handleBatchPrintHide(i.printTemplateCode)"
                      >
                        {{ i.printTemplateName }}
                      </div>
                    </a-tooltip>
                  </template>
                </div>
              </span>
            </template>
          </div>
        </div>
      </div>
      <!-- 加载状态 -->
      <PageLoading v-model="isLoading" shadeColor="#F4F6FC" :shadeOpacity="1" />
      <!-- 列表数据 -->
      <div class="table-box" v-if="isShowTableBox">
        <div
          :style="
            'width:' +
              leftWidth +
              ';float:left;padding-left:3px;background:rgb(233 249 243);height:100%'
          "
          v-show="isTreeGrid && isTreeGridOpen"
        >
          <p
            style="
              margin: 3px;
              font-size: 16px;
              padding-bottom: 3px;
              font-weight: bold;
            "
            v-show="isTreeGrid"
          >
            关联编码
          </p>
          <div v-for="(item, i) in buttonLists" :key="item.id">
            <a-button
              :class="buttonIndex == item ? 'bgcolor' : ''"
              @click="treeGridPress(item)"
              style="padding-left: 5px; float: left"
              size="small"
            >{{ item }}
            </a-button>
            <a-divider type="vertical" style="float: left; height: 24px" />
          </div>
          <a-card
            :bordered="false"
            style="
              height: 683.5px;
              overflow: auto;
              clear: both;
              background: rgb(233 249 243);
            "
          >
            <a-tree
              :key="treeKey"
              :loadData="onLoadData"
              :treeData="treeData"
              :replaceFields="replaceFields"
              @select="treeGridSelect"
            />
            <a-icon
              type="double-left"
              style="float: right; margin-top: 210px"
              @click="openOrCloseTreeGrid"
            />
          </a-card>
        </div>
        <div
          :style="{ width: `${leftWidth}` }"
          style="
            float: left;
            padding-left: 3px;
            background: rgb(233 249 243);
            height: 100%;
            position: relative;
          "
          v-show="isTreeGrid && !isTreeGridOpen"
        >
          <a-icon
            type="double-right"
            style="
              position: absolute;
              top: 50%;
              right: 0;
              font-size: 18px;
              font-weight: bold;
            "
            @click="openOrCloseTreeGrid()"
          />
        </div>
        <!-- 字典/编码树-->
        <a-card
          :style="{ width: `${isTreePro ? dicLeftWidth : leftWidth}` }"
          style="float: left; padding: 10px 8px; height: 100%"
          v-show="isTreePro && isTreeProOpen"
        >
          <a-icon
            type="double-left"
            style="float: right; font-size: 18px; font-weight: bold"
            @click="openOrCloseTreePro()"
          />
          <p
            style="
              margin: 3px;
              font-size: 16px;
              padding-bottom: 3px;
              font-weight: bold;
            "
            v-show="isTreePro"
          >
            字典树
          </p>
          <a-input-search
            placeholder="请输入关键字"
            @search="searchByName"
          ></a-input-search>
          <div class="dic-tree-active" v-if="isEditDicPermission">
            <a-button
              size="small"
              type="primary"
              @click="visibleDicDialog = true"
            >新增节点
            </a-button>
            <a-popconfirm
              title="删除后不可恢复哦，确认删除吗？"
              :visible="isShowDicPop"
              @confirm="deleteDicNode"
              @visibleChange="handleVisibleChange"
            >
              <a-button size="small">删除</a-button>
            </a-popconfirm>
          </div>
          <a-card :bordered="false" class="tree-card">
            <a-tree
              :defaultExpandedKeys="defaultExpandedKeys"
              :key="num"
              :loadedKeys="loadedKeys"
              :loadData="onLoadDataPro"
              :treeData="treeDataPro"
              :replaceFields="replaceFields"
              @select="treeProSelect"
            >
              <template slot="title" slot-scope="{ taskName }">
                <span v-if="taskName.indexOf(searchValue) > -1">
                  {{ taskName.substr(0, taskName.indexOf(searchValue)) }}
                  <span style="color: #f50">{{ searchValue }}</span>
                  {{
                    taskName.substr(
                      taskName.indexOf(searchValue) + searchValue.length
                    )
                  }}
                </span>
                <span v-else>{{ taskName }}</span>
              </template>
            </a-tree>
          </a-card>
        </a-card>
        <div
          :style="{ width: `${dicLeftWidth}` }"
          style="
            float: left;
            padding-left: 3px;
            height: 100%;
            background-color: #f4f6fc;
            position: relative;
          "
          v-show="isTreePro && !isTreeProOpen"
        >
          <a-icon
            type="double-right"
            style="
              position: absolute;
              top: 50%;
              right: 0;
              font-size: 18px;
              font-weight: bold;
            "
            @click="openOrCloseTreePro()"
          />
        </div>
        <div
          v-show="isTreePro && isTreeProOpen"
          style="width: 20px; background-color: #f4f6fc"
        ></div>
        <a-card
          :style="{
            width: `${
              isTreePro ? `calc(${dicRightWidth} - 20px)` : rightWidth
            }`,
          }"
          style="float: right; transition: all 0.5s"
          class="filter-box-wrap"
        >
          <div class="filters-box" v-show="isShowFilterBox" ref="filtersBox">
            <query-form
              ref="queryForm"
              :fields="queryConditions"
              :relevanceDataList="relevanceDataList"
              :dataItemList="dataItemList"
              @getRelevanceDataList="getRelevanceDataList"
              @setFilterData="setFilterData"
              @hide="hideQueryItem"
            />
          </div>
          <iframe
            v-if="rdpUrl"
            :src="rdpUrl"
            class="iframe_rdp"
            frameborder="0"
            scrolling="no"
          ></iframe>
          <div
            class="table"
            ref="table"
            :style="{ height: rdpUrl ? '50%' : '100%' }"
          >
            <!-- 加载状态 -->
            <PageLoading
              v-model="tableLoading"
              :shadeOpacity="0.5"
              shadeColor="#F4F6FC"
            />
            <!-- 旧版表单 -->
            <sheet
              v-if="
                tableConfig.keepInOldVersion || tableConfig.version === '1.0'
              "
              v-show="cusColumns.length > 0"
              :checkbox="canDelete"
              :checkeds="checkeds"
              :columnSlots="columnSlots"
              :columns="cusColumns"
              :rowSlots="rowSlots"
              :rows="rows"
              @check="onCheck"
              @columnResize="onResizeEnd"
            >
              <!-- checkbox -->
              <span slot="checkboxTitle" v-if="canDelete">
                <a-checkbox
                  @change.stop="selectAll"
                  v-model="isSelectAll"
                ></a-checkbox>
              </span>
              <!-- 序号 -->
              <span class="order-number-box" slot="indexTitle">
                <span>{{ $t("cloudpivot.list.pc.Number") }}</span>
              </span>
              <span slot="checkbox" v-if="canDelete" slot-scope="{ text, row }">
                <a-checkbox
                  v-model="row.isChecked"
                  @change.stop="onItemCheckboxChange"
                ></a-checkbox>
              </span>
              <span class="order-number-box" slot="index" slot-scope="{ row }">
                <span>{{ JSON.stringify(row) }}</span>
              </span>

              <!-- 自定义的列 头 -->
              <template v-for="(item, index) in cusColumns">
                <span
                  :key="index"
                  :slot="columnSlots[item.key]"
                  :title="item.vcTitle"
                  class="text-ellipsis"
                  v-show="item.isShow"
                >{{
                  isChinese ? item.vcTitle : item.name_i18n[$i18n.locale]
                }}</span
                >
              </template>

              <!-- 自定义的列 表体 :title="text" -->
              <template
                v-for="(item, index) in cusColumns"
                :slot="rowSlots[item.key]"
                slot-scope="{ column, rowIndex }"
              >
                <span
                  :key="index"
                  class="cursor text-ellipsis"
                  v-show="item.isShow"
                  @click="goForm(column, rowIndex)"
                >{{ getLabelContent(column, rowIndex) }}</span
                >
              </template>
            </sheet>
            <!-- 新版表单 -->
            <a-spin
              v-else
              wrapperClassName="spinContainer"
              :spinning="spinShow"
              size="large"
              tip="加载中"
            >
              <list-custom-template
                v-show="cusColumns.length > 0"
                ref="listCustomTemplate"
                :originalNumberData="numberData"
                :originalTableColumns="cusColumns"
                :originalTableData="dataSource"
                :pageVM="pageVM"
                :rdpUrl="rdpUrl"
                :sortConfig="
                  listConfig
                    ? listConfig.querySorts
                      ? listConfig.querySorts
                      : []
                    : []
                "
                :tableConfig="tableConfig"
                @bySortGetQueryList="bySortGetQueryList"
                @onCheck="onCheck"
                @onResizeEnd="onResizeEnd"
              >
              </list-custom-template>
            </a-spin>
            <!-- 所有列取消勾选  -->
            <div
              class="no-columns"
              v-if="
                cusColumns.length <= 0 && !isShowNoData && !isShowSearchNoData
              "
            >
              <img src="./components/no-data/images/no-data.png" alt="" />
              <p>{{ $t("cloudpivot.list.pc.chooseColumns") }}</p>
            </div>
            <div class="no-data" v-if="isShowNoData || isShowSearchNoData">
              <PageNoData
                :isShowNoData="isShowNoData"
                :isShowSearchNoData="isShowSearchNoData"
                :tipText="$t('cloudpivot.list.pc.NoData')"
              />
            </div>
          </div>
          <div
            class="pagination-box"
            ref="paginationBox"
            v-if="cusColumns.length > 0"
          >
            <a-pagination
              :current="curPage"
              :total="total"
              :showTotal="
                (total) => $t('cloudpivot.list.pc.Total', { num: total })
              "
              :pageSize="pageSize"
              :pageSizeOptions="pageSizeOptions"
              showSizeChanger
              showQuickJumper
              @change="onPaginationChange"
              @showSizeChange="onSizeChange"
            />
          </div>
        </a-card>
      </div>
      <div class="load-fail-box">
        <PageLoadFail v-model="isShowLoadFailBox" @refresh="reload" />
      </div>
    </div>
    <a-modal
      class="import-modal"
      v-model="visible"
      :title="$t('cloudpivot.list.pc.ImportData')"
      @cancel="handleCancel"
      :width="552"
      :destroyOnClose="true"
      :footer="null"
      :mask="true"
      :maskClosable="false"
      :keyboard="false"
    >
      <data-upload
        v-if="showUploadModel"
        @change="changeImportBtnStatus"
        @setFileName="setImportFileName"
        @setQueryField="setImportQueryField"
        :schemaCode="schemaCode"
        :queryCode="curListCode"
      ></data-upload>

      <data-import
        v-if="showImportModel"
        :percent="importPercent"
        @importEnd="importEnd"
      ></data-import>
      <data-import-status
        v-if="showImportStatus"
        :successNum="successNum"
        :failNum="failNum"
        :importSize="importSize"
        :status="importStatus"
        :fileName="importFileName"
        :schemaCode="schemaCode"
        :queryCode="curListCode"
      ></data-import-status>
      <div class="modal-footer">
        <a-button
          v-if="showCancelButton"
          key="back"
          @click="handleCancel"
        >{{ $t("cloudpivot.list.pc.Cancel") }}
        </a-button>
        <a-button
          v-if="showUploadModel"
          key="import"
          type="primary"
          :disabled="!canImport"
          @click="confirmImport"
        >{{ $t("cloudpivot.list.pc.StartImport") }}
        </a-button>
        <a-button
          v-if="showConfirmButton"
          key="confirm"
          type="primary"
          @click="confirm"
        >{{ $t("cloudpivot.list.pc.OK") }}
        </a-button>
        <!-- <a-button
          v-if="showReImportButton"
          key="reimport"
          type="primary"
          @click="reImport"
        >{{ $t('cloudpivot.list.pc.ReImport') }}</a-button> -->
      </div>
    </a-modal>
    <!-- 导入选人值报错时，导入错误信息弹窗 -->
    <!-- <button @click="showImportErrModal = true" style="position: absolute;top: 90px;left: 420px;z-index: 9898;">打开</button> -->
    <ImportErrModal
      v-model="showImportErrModal"
      :status="secondImportStatus"
      :successNum="secondSuccessNum"
      :failNum="secondFailNum"
      :fileName="importFileName"
      :importData="importData"
      @reloadList="getQueryList"
    ></ImportErrModal>
    <!--批量修改弹窗-->
    <a-modal
      v-model="bulkModalShow"
      title="批量修改"
      :width="400"
      :destroyOnClose="true"
      :mask="true"
      :maskClosable="false"
      :keyboard="false"
      @ok="bulkOk"
      @cancel="bulkCancel"
    >
      <a-form :labelCol="{ span: 5 }" :wrapperCol="{ span: 12 }">
        <a-form-item label="字段">
          <a-select style="width: 200px" @change="fieldChange($event)">
            <a-select-option
              v-for="d in fieldLabel"
              :key="d.value"
              :value="d.value"
            >{{ d.text }}
            </a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="值">
          <a-input style="width: 200px" v-model="dataInput" />
        </a-form-item>
        <a-form-item label="类型">
          <a-select style="width: 200px" @change="typeChange($event)">
            <a-select-option
              v-for="d in typeLabel"
              :key="d.value"
              :value="d.value"
            >{{ d.text }}
            </a-select-option>
          </a-select>
        </a-form-item>
      </a-form>
    </a-modal>
    <DataExport
      v-model="showDataExport"
      :exportFileId="exportFileId"
      :extend1="extend1"
      :queryColumns="queryColumns"
      @exportEnd="handleExportData"
    ></DataExport>
    <!-- 打印二维码弹窗 -->
    <PrintQrcode
      v-model="showPrintQrcode"
      :checkedLength="checkedLength"
      @createPrintQrCodeData="createPrintQrCodeData"
    ></PrintQrcode>

    <!-- 修改表单拥有者弹框 -->
    <ModifyOwner
      :checkeds="checkeds"
      :dataSource="dataSource"
      :pageSize="pageSize"
      :curPage="curPage"
      :schemaCode="schemaCode"
      :queryCode="curListCode"
      ref="ModifyOwner"
      @modifyOwnerClick="onModifyOwnerClick"
    ></ModifyOwner>
    <!-- 删除弹窗 -->

    <columnSetting
      v-model="showColumnSetting"
      :columns="columns"
      @confirm="reRenderTable"
      @recovery="recovery"
    />
    <div
      class="pdf-frame-div"
      v-if="pdfUrl.includes('?file=') && isShowPdf"
    ></div>
    <iframe class="pdf-frame" id="pdfFrame" :srcdoc="srcdoc"></iframe>
    <a-icon
      v-if="isShowPdf"
      @click="closePdf"
      type="close"
      class="close-previewPdf"
    />
    <!-- :options="opts" -->
    <printHtml style="height: 0px; overflow: hidden" :options="opts" />
    <template v-if="isPrintGenerateHtml">
      <GenerateHtml
        ref="printRenderer"
        :pages="draftAttributesJsonSet"
        :formdata="formdata"
      ></GenerateHtml>
    </template>
    <template v-for="(i, n) of tempPrintEleArray">
      <template v-for="(tempPrintEle, v) in i">
        <TempPrintHtml
          :key="v + n + tempPrintEle.key"
          :printEle="tempPrintEle.tempPrintEle"
          :pageSettings="tempPrintPageSettings"
          @calcResult="collectorTempPrintInfo"
        ></TempPrintHtml>
      </template>
    </template>
    <a-modal
      class="statement"
      v-model="reportShow"
      title="交底报表"
      :width="1200"
      :destroyOnClose="true"
      :mask="true"
      :footer="null"
      :maskClosable="false"
      :keyboard="true"
    >
      <div>
        <a-button @click="refreshClick">刷新</a-button>
        <div class="echarts">
          <div class="echarts_left">
            <h4>签到人数统计</h4>
            <div>
              <pie-charts
                :chartData="investmentData1"
                :id="'investment_echart1'"
              ></pie-charts>
            </div>
          </div>
          <div class="echarts_right">
            <h4>交底人数统计</h4>
            <div>
              <pie-charts
                :chartData="investmentData2"
                :id="'investment_echart2'"
              ></pie-charts>
            </div>
          </div>
        </div>
        <div>
          <h4>交底人员明细表</h4>
          <a-input-search
            placeholder="请输入关键字"
            v-model="search"
          ></a-input-search>
          <el-table
            height="300"
            :data="
              tableData.filter(
                (data) =>
                  !search ||
                  data.personName.toLowerCase().includes(search.toLowerCase())
              )
            "
            style="width: 100%"
          >
            <el-table-column align="center" type="index"></el-table-column>
            <el-table-column
              width="80"
              align="center"
              label="姓名"
              prop="personName"
            ></el-table-column>
            <el-table-column
              align="center"
              label="工种"
              prop="workType"
            ></el-table-column>
            <el-table-column
              align="center"
              label="手机号"
              prop="phone"
            ></el-table-column>
            <el-table-column
              align="center"
              label="签到时间"
              prop="checkInDate"
            ></el-table-column>
            <el-table-column width="100" align="center" label="签到状态">
              <template slot-scope="scope">
                <span
                  :style="{
                    color:
                      scope.row.signState == '已签到' ? '#00c567' : '#FF0042',
                  }"
                >
                  {{ scope.row.signState }}
                </span>
              </template>
            </el-table-column>
            <el-table-column
              align="center"
              label="完成时间"
              prop="finishDate"
            ></el-table-column>
            <el-table-column
              align="center"
              label="总交底时长"
              prop="studyTimeStr"
            ></el-table-column>
            <el-table-column width="100" align="center" label="交底状态">
              <template slot-scope="scope">
                <span
                  :style="{
                    color:
                      scope.row.finishState == '已完成'
                        ? '#00c567'
                        : scope.row.finishState == '未开始'
                          ? '#FF0042'
                          : scope.row.finishState == '进行中'
                            ? '#ffc62c'
                            : '',
                  }"
                >
                  {{ scope.row.finishState }}
                </span>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </div>
    </a-modal>
    <a-modal
      class="statement"
      v-model="qrCodeShow"
      title="二维码"
      :width="400"
      :destroyOnClose="true"
      :mask="true"
      :footer="null"
      :maskClosable="false"
      :keyboard="true"
    >
      <div id="qrcode" ref="qrcode"></div>
    </a-modal>
    <add-dic-node-dialog
      :visible="visibleDicDialog"
      :groupName="dicNodeName"
      :parentId="codeId"
      @closeDialog="closeDialog"
      @updateDicTree="getDicTree"
    />
  </div>
</template>
<script src="./scripts/application-list.ts" />
<style lang="less">
.application-box {
  .collapse-header {
    height: 24px;
    line-height: 24px;
    background-image: url("./image/title.png");
    background-size: 100% 100%;
    h2 {
      margin-bottom: 0;
    }
    .collapse-header-title {
      padding-left: 22px;
      padding-right: 60px;
      font-size: 14px;
      font-family: "Microsoft YaHei";
      color: #FFFFFF;
    }
    .collapse-header-button {
      .ant-btn {
        height: 24px;
        padding: 0 7px;
        font-size: 14px;
        border-radius: 4px;
      }
    }
  }
  .ant-card {
    .ant-card-body {
      padding: 0px;
      zoom: 1;
      height: 100%;
    }
  }

  .content-top {
    & > h2 {
      position: relative;
    }
  }

  .list-header {
    cursor: pointer;

    & > div {
      display: inline-block;
      max-width: 144px;
      overflow: hidden;
      white-space: nowrap;
      vertical-align: middle;
      text-overflow: ellipsis;
      font-family: Source Han Sans CN;
    }

    i {
      font-size: 13px;
      color: rgba(0, 0, 0, 0.65);
      margin-left: 8px;
    }
  }

  .query-header-list {
    position: absolute;
    top: 30px;
    left: 0;
    width: 480px;
    max-height: 520px;
    overflow-y: auto;
    background: #fff;
    box-shadow: 0px 2px 8px 0px rgba(30, 85, 255, 0.15);
    border-radius: 4px;
    z-index: 30;

    .list-item {
      height: 32px;
      line-height: 32px;
      padding: 0 16px;
      cursor: pointer;
      position: relative;
      z-index: 9;

      &:hover {
        background: #f0f7ff;
      }

      &.selected {
        background: #f8fbff;
      }

      i {
        color: #1890ff;
        font-size: 18px;
        float: left;
      }

      .item-name {
        font-size: 14px;
        width: 292px;
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
        margin-left: 8px;
        float: left;
      }

      .checked {
        float: right;
      }
    }
  }

  .sheet {
    .sheet__body > .sheet__row {
      position: relative;

      &.marked::after {
        content: "";
        display: block;
        width: 4px;
        height: calc(100% - 1px);
        position: absolute;
        left: 0;
        top: 0;
        background: #faad14;
      }
    }
  }

  /*ie11 css hack*/
  @media all and (-ms-high-contrast: none) {
    .sheet {
      .sheet__row.sheet__head {
        padding-right: 17px;
      }
    }
  }
}
</style>
<style lang="less" scoped>
@import "./style/index.less";

@media screen and (max-width: 1366px) {
  .application-box .table-box .no-data {
    margin-top: 50px;
  }
}

.bgcolor {
  color: #5291ff;
  background-color: #fff;
  border-color: #5291ff;
}

.modal-footer {
  height: 53px;
  line-height: 53px;
  text-align: right;
  margin-bottom: -24px;

  & button + button {
    margin-left: 8px;
    margin-bottom: 0;
  }
}

.actions-box {
  display: flex;
  align-items: center;
  justify-content: space-around;

  .settings {
    display: flex;

    .settings-item {
      margin-right: 16px;
      cursor: pointer;

      .icon:hover {
        color: @primary-color;
      }

      .high-light {
        color: @primary-color;
      }
    }
  }

  #list-actions {
    button {
      margin-right: 8px;

      &:last-of-type {
        margin-right: 0;
      }
    }
  }
}

.table-box {
  position: relative;
  min-height: 400px;
  display: flex;
  .filter-box-wrap {
    /deep/ .ant-card-body {
      position: relative;
    }
  }

  .filters-box {
    position: absolute;
    width: 100%;
    z-index: 666;
    margin-top: -8px;
  }

  .iframe_rdp {
    position: relative;
    //min-height: 400px;
    height: calc(50vh - 48px - 26px - 25px);
    width: 100%;
    margin: 0.5%;
    z-index: 99;
  }

  .table {
    /deep/ .sheet__body::-webkit-scrollbar-thumb {
      background: rgba(0, 0, 0, 0);
      box-shadow: unset;
      transition: all ease 0.3s;
    }

    & /deep/ .scrollbar .sheet__cols {
      opacity: 0;
    }

    &.active {
      display: block;

      /deep/ .sheet__body::-webkit-scrollbar-thumb {
        background: rgba(0, 0, 0, 0.45);
        box-shadow: auto;
      }

      & /deep/ .scrollbar .sheet__cols {
        opacity: 1;
      }
    }

    /deep/ .sheet .sheet__body .sheet__row {
      transition: all ease 0.3s;

      &:hover {
        background: #f0f7ff;
      }
    }

    .common-table.active .common-table__tbody-wrap::-webkit-scrollbar-thumb {
      background: rgba(0, 0, 0, 0.45);
      box-shadow: auto;
    }

    height: 100%;
    // table高度写死！！！注意后面修改
    //height: 750px;
    max-height: calc(100% - 50px);
    // position: relative;
    // overflow-y: hidden;
    /deep/ .ant-table-wrapper {
      height: 100%;
    }

    /deep/ .ant-table-body {
      max-height: calc(100vh - 95px - 52px - 160px) !important;
    }

    &.has-filterbox {
      /deep/ .ant-table-body {
        max-height: calc(100vh - 155px - 52px - 160px) !important;
      }
    }

    .order-number-box {
      .index {
        margin-left: @base4-padding-lg;
      }
    }

    .name {
      cursor: pointer;
    }

    .cursor {
      cursor: pointer;
      display: block;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;

      &:hover {
        color: @primary-color;
      }
    }

    .no-columns {
      text-align: center;
      position: absolute;
      top: 40%;
      left: 50%;
      transform: translate(-50%, -50%);
    }
  }

  .dic-tree-active {
    margin-left: 8px;

    .ant-btn {
      margin-right: @base4-padding-md;
    }
  }

  .tree-card {
    height: calc(100% - 99px);
    overflow: auto;
    clear: both;
    position: relative;
    //background: rgb(233 249 243);
  }

  /deep/ .ant-input-search {
    display: block;
    width: 97%;
    margin: 10px auto;
  }

  /*ie11 css hack*/
  @media all and (-ms-high-contrast: none) {
    *::-ms-backdrop,
    .table {
      max-height: calc(100% - 68px);
    }
  }
}

.load-fail-box {
  padding-top: 100px;
  text-align: center;
}

/deep/ .ant-pagination-total-text {
  margin-right: @base4-padding-md;
}

.pagination-box {
  margin-top: 0 !important;
}

/deep/ .ant-pagination-options {
  height: 32px;
}

.delete-title {
  color: rgba(0, 0, 0, 0.85);
  font-weight: 600;
}

.delete-content {
  margin-left: -38px;
  background: #fffbe6;
  border: 1px solid #ffe58f;
  padding: 12px;
  border-radius: 4px;
  margin-top: 12px;

  div {
    color: rgba(0, 0, 0, 0.85);
    font-size: 14px;
    line-height: 22px;

    .tip-text {
      color: rgba(0, 0, 0, 0.65);
      font-size: 12px;
    }

    span {
      font-weight: 600;
    }

    img {
      width: 5px;
      height: 5px;
      margin-right: 5px;
      margin-top: -2px;
      vertical-align: middle;
    }
  }

  .hidden {
    display: none;
  }
}

.filter-mask {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0);
  z-index: 1;
}

.prints-drop-down {
  width: 150px;
  min-height: 40px;
  max-height: 350px;
  overflow-y: auto;
  border-radius: 4px;
  box-shadow: 0 2px 8px 0 rgba(30, 85, 255, 0.15);
  background: #fff;
  position: absolute;
  top: 35px;
  z-index: 999;

  .item-print {
    text-align: left;
    height: 32px;
    line-height: 32px;
    padding: 0px 15px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;

    &:hover {
      cursor: pointer;
      background: rgba(240, 247, 255, 1);
      transition: 0.3s all;
    }

    &:last-of-type {
      margin-bottom: 10px;
    }

    &:first-of-type {
      margin-top: 5px;
    }
  }
}

.statement {
  position: relative;

  .ant-btn {
    position: absolute;
    top: 12px;
    left: 100px;
  }

  .ant-input-affix-wrapper {
    width: 20%;
  }

  h4 {
    border-left: 4px solid #2d73ff;
    padding-left: 10px;
    height: 17px;
    line-height: 16px;
    margin-bottom: 10px;
  }

  .echarts {
    display: flex;
    height: 280px;
    margin-bottom: 20px;

    .echarts_left {
      flex: 1;
      height: 100%;

      div {
        width: 100%;
        height: 98%;
      }
    }

    .echarts_right {
      flex: 1;
      height: 100%;

      div {
        width: 100%;
        height: 98%;
      }
    }
  }
}
</style>
