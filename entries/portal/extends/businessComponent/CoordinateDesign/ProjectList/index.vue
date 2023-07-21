<template>
  <div class="projectListContainer">
    <div class="menu">
      <span class="menuItem" :class="{menuActived:menuIndex===0}" @click="menuClick(0)">我的项目</span>
      <span class="menuItem" :class="{menuActived:menuIndex===1}" @click="menuClick(1)">全部项目</span>
      <span class="menuItem" :class="{menuActived:menuIndex===2}" @click="menuClick(2)">我的收藏(<i>{{ favoritesCount }}</i>)</span>
    </div>
    <div class="commomContainer relative">
      <div class="left projectContainer flex flex-column">
        <div class="subMenu flex flex-space-between">
          <div class="left leftMemu flex flex-auto">
            <a-input-search
              class="searchInput"
              placeholder="请输入项目名"
              v-model="projectName"
              allowClear
              enterButton
              @search="searchProjectName" />
            <a-button @click="addProject" type="primary" v-if="isCreateProductPermission">新增</a-button>
            <div class="search flex flex-auto" v-show="listStyleIndex===1 && [0,1].includes(menuIndex)">
              <div class="flex flex-center-align">
                <span class="search-label">年份</span>
                <a-select
                  v-model="selectedYears"
                  mode="multiple"
                  placeholder="请选择年份"
                  @change="(val)=> getListByType('year',val)"
                  class="flex-auto">
                  <a-select-option v-for="y in years" :key="y" :title="y">{{ y }}</a-select-option>
                </a-select>
              </div>
              <div class="flex flex-center-align">
                <span class="search-label">地区</span>
                <a-select
                  v-model="selectedProvinces"
                  mode="multiple"
                  placeholder="请选择地区"
                  @change="(val)=> getListByType('province',val)"
                  class="flex-auto">
                  <a-select-option v-for="province in provinces" :key="province" :title="province">{{ province }}</a-select-option>
                </a-select>
              </div>
              <div class="flex flex-center-align">
                <span class="search-label">工程分类</span>
                <a-select
                  v-model="selectedIndustryTypes"
                  mode="multiple"
                  placeholder="请选择工程分类"
                  @change="(val)=> getListByType('industryType',val)"
                  class="flex-auto">
                  <a-select-option v-for="industryType in industryTypes" :key="industryType" :title="industryType">{{ industryType }}</a-select-option>
                </a-select>
              </div>
              <div class="flex flex-center-align">
                <div :class="isEveryCheck?'more-num':''" @click="isEveryCheck?showMoreCondition=true:''">
                  <a-icon type="filter" @click="showMoreCondition=true"/><span v-show="isEveryCheck">{{ isEveryCheck }}项</span>
                </div>
                <a-check-box :checked="checkedAll" @change="changeCheckState"></a-check-box>
                <span class="search-label">查看全部</span>
              </div>
              <div>
                <a-button type="primary" @click="getProjectList">查询</a-button>
                <a-button @click="resetCondition(true)">重置</a-button>
              </div>
              <div class="project-filter" v-show="showMoreCondition">
                <div class="flex flex-center-align">
                  <span class="search-label">年份</span>
                  <a-select
                    v-model="selectedYears"
                    mode="multiple"
                    placeholder="请选择年份"
                    @change="(val)=> getListByType('year',val)"
                    class="flex-auto">
                    <a-select-option v-for="y in years" :key="y" :title="y">{{ y }}</a-select-option>
                  </a-select>
                </div>
                <div class="flex flex-center-align">
                  <span class="search-label">地区</span>
                  <a-select
                    v-model="selectedProvinces"
                    mode="multiple"
                    placeholder="请选择地区"
                    @change="(val)=> getListByType('province',val)"
                    class="flex-auto">
                    <a-select-option v-for="province in provinces" :key="province" :title="province">{{ province }}</a-select-option>
                  </a-select>
                </div>
                <div class="flex flex-center-align">
                  <span class="search-label">工程分类</span>
                  <a-select
                    v-model="selectedIndustryTypes"
                    mode="multiple"
                    placeholder="请选择工程分类"
                    @change="(val)=> getListByType('industryType',val)"
                    class="flex-auto">
                    <a-select-option v-for="industryType in industryTypes" :key="industryType" :title="industryType">{{ industryType }}</a-select-option>
                  </a-select>
                </div>
                <div class="flex flex-center-align">
                  <span class="search-label">生产部门</span>
                  <a-select
                    v-model="selectedDepartments"
                    mode="multiple"
                    placeholder="请选择生产部门"
                    @change="(val)=> getListByType('departments',val)"
                    class="flex-auto">
                    <a-select-option v-for="department in departments" :key="department" :title="department">{{ department }}</a-select-option>
                  </a-select>
                </div>
                <div class="flex flex-center-align">
                  <span class="search-label">运行状态</span>
                  <a-select
                    v-model="selectedStates"
                    mode="multiple"
                    placeholder="请选择运行状态"
                    @change="(val)=> getListByType('states',val)"
                    class="flex-auto">
                    <a-select-option v-for="state in states" :key="state" :title="state">{{ state }}</a-select-option>
                  </a-select>
                </div>
                <div class="flex flex-center-align">
                  <span class="search-label">数据来源</span>
                  <base-select
                    class="flex-auto"
                    :options="['lotus','系统内']"
                    :value="selectedDataSource"
                    @changeValue="val=> getListByType('dataSource',val)"/>
                </div>
                <div class="flex flex-center-align">
                  <a-check-box :checked="checkedAll" @change="changeCheckState"></a-check-box>
                  <span class="search-label">查看全部</span>
                </div>
                <div class="btns text-center">
                  <a-button @click="showMoreCondition=false">取消</a-button>
                  <a-button type="primary" @click="getProjectList">查询</a-button>
                  <a-button @click="resetCondition(true)">重置</a-button>
                </div>
              </div>
            </div>
          </div>
          <div class="right extraMemu">
            <a-icon
              class="listStyleItem"
              :class="{listStyActived:listStyleIndex===1}"
              type="appstore"
              @click="listStyleClick(1)"/>
            <a-icon
              class="listStyleItem"
              :class="{listStyActived:listStyleIndex===0}"
              type="bars"
              @click="listStyleClick(0)"/>
          </div>
        </div>
        <div v-show="listStyleIndex===0" class="projectTable flex-auto overflow-hidden flex" ref="projectTable">
          <div class="sort full-height flex flex-column">
            <div class="sort-title flex flex-center-align">
              <a-icon type="credit-card"/>
              <span>按选择进行划分</span>
            </div>
            <div class="types flex-auto scrollbar-default">
              <div
                class="type flex flex-center-align"
                v-for="level in projectLevelSortConfig"
                :key="level.key"
                :class="dynamicColumnType===level.value?'active-style':''">
                <a-icon type="apartment"/>
                <div @click="getTreeTable(level.text,level.value)" class="full-width">{{ level.text }}</div>
              </div>
            </div>
          </div>
          <vxe-virtual-tree
            ref="MainTable"
            size="mini"
            class="flex-auto"
            :border="true"
            rowId="id"
            :resizable="true"
            :showOverflow="true"
            :rowKey="true"
            :scrollY="{enabled: false}"
            :loading="mainTable.loading"
            :data="mainTable.dataSource"
            :columns="mainTable.columns"
            :treeConfig="{
              // lazy: true,
              // rowField: mainTable.treeField,
              children: mainTable.treeField,
              hasChild: mainTable.hasChild,
              // loadMethod: this.tableLazyLoad,
              indent:12
            } "
          >
            <template #dynamicColumnHeader="{row}">
              <span v-for="(h,key) in dynamicColumnHeader.concat('-项目').split('-')" :key="key" class="dynamic-header">{{ h }}</span>
            </template>
            <template #count="{row}">
              <span class="count" v-if="!!row.count">{{ row.count }}</span>
            </template>
            <template #manufactureStatus="{ row }">
              <span
                v-if="row.manufactureStatus"
                :class="stateImg(row.manufactureStatus)"
                class="pointer"
                @click="toProductionTaskList(row.notesURL,row.id)">{{ row.manufactureStatus }}</span>
            </template>
          </vxe-virtual-tree>
          <!--          <a-table-->
          <!--            :loading="loading"-->
          <!--            :dataSource="dataSource"-->
          <!--            :columns="currentColumns"-->
          <!--            :pagination="false"-->
          <!--            :scroll="scroll"-->
          <!--            :rowClassName="rowClassName"-->
          <!--            :expandedRowKeys.sync="expandedRowKeys"-->
          <!--            :customRow="customRow"-->
          <!--            expandRowByClick-->
          <!--            :expandIcon="customExpandIcon"-->
          <!--            rowKey="key"-->
          <!--            size="small">-->
          <!--            <template #engineeringNameTitle>-->
          <!--              <span class="year">年度</span>-->
          <!--              <span class="line"></span>-->
          <!--              <span class="province">省市</span>-->
          <!--              <span class="line"></span>-->
          <!--              <span>工程分类</span>-->
          <!--              &lt;!&ndash;              <span class="line"></span>&ndash;&gt;-->
          <!--              &lt;!&ndash;              <span>生产单位</span>&ndash;&gt;-->
          <!--            </template>-->
          <!--            <template #projectRatioTitle>-->
          <!--              <span style="padding-left: 30px">项目进度</span>-->
          <!--            </template>-->
          <!--            <template slot="engineeringTitle" slot-scope="text,record">-->
          <!--              <span :class="getColor(record)">{{ text }}</span>-->
          <!--              <div v-if="!record.children" style="margin-top: 8px;">-->
          <!--                <span class="ant-table-row-indent indent-level-1" style="padding-left: 20px;"></span>-->
          <!--                <span style="padding-right: 10px;"></span>-->
          <!--                <span v-if="record.year">{{ record.year }}<span v-if="record.year">年</span></span>-->
          <!--                <span style="padding-left:10px" v-if="record.engineeringLocation">{{ record.engineeringLocation }}</span>-->
          <!--                <span style="padding-left:10px" v-if="record.industryType">{{ record.industryType }}</span>-->
          <!--                &lt;!&ndash;<span style="padding-left:10px" v-if="record.manufacturer">{{ record.manufacturer }}</span>&ndash;&gt;-->
          <!--              </div>-->
          <!--            </template>-->
          <!--            <template #manufactureStatus="text">-->
          <!--              <span :class="stateImg(text)" class="pointer">{{ text }}</span>-->
          <!--            </template>-->
          <!--            <div-->
          <!--              v-if="-->
          <!--                record.projectRatio"-->
          <!--              slot="ProgressBar"-->
          <!--              slot-scope="text,record"-->
          <!--              class="tableProgress">-->
          <!--              <a-progress-->
          <!--                class="tableProgressBar left"-->
          <!--                :class="{yellowBackgroundColor:record.projectRatio<1}"-->
          <!--                :showInfo="false"-->
          <!--                :percent="getProgressPercent(record.projectRatio)"/>-->
          <!--              <span class="tableProgressInfo right">{{ `${getProgressPercent(record.projectRatio)}%` }}</span>-->
          <!--            </div>-->
          <!--          </a-table>-->
        </div>
        <div ref="cardGroups" v-show="listStyleIndex===1" class="cardGroups flex-auto">
          <div class="cardGroup inline-block" v-for="(item, name) in cardDataSource" :key="name">
            <!--            <div class="cardGroupTitle">-->
            <!--              <span>{{ name }}</span>-->
            <!--              <a-icon :type="cardExpandState[name]?'caret-down':'caret-up'" @click="changeCardExpandState(name,!cardExpandState[name])"/>-->
            <!--            </div>-->
            <div class="projectCardsBody full">
              <div
                class="projectCard full-height flex flex-column">
                <div class="projectCardHead flex flex-column">
                  <div class="flex flex-space-between">
                    <a-tooltip :title="item.engineeringName">
                      <div class="projectCardHeadTitle left">{{ item.engineeringName }}</div>
                    </a-tooltip>
                    <div class="projectCardHeadExtra right">
                      <a-icon
                        @click.stop="favorites(item)"
                        class="star"
                        :class="{favorite:item.favorite}"
                        type="star"
                        :theme="item.favorite?'filled':'outlined'" />
                    </div>
                  </div>
                  <div class="flex flex-center-align header-card">
                    <a-icon type="environment" />
                    <span>{{ item.engineeringLocation }}</span>
                  </div>
                  <div class="flex flex-space-between flex-center-align">
                    <div class="flex flex-center-align">
                      <a-icon type="calendar" />
                      <span>{{ item.year }}<span v-if="item.year">年</span></span>
                    </div>
                    <div class="flex flex-center-align">
                      <a-icon type="tags" />
                      <span>{{ item.industryType }}</span>
                    </div>
                  </div>
                </div>
                <div class="projectCardBody flex flex-column">
                  <div class="Image flex-auto overflow-hidden">
                    <img :src="item.picUrl?item.picUrl:require('../../../../src/assets/extends/CoordinateDesign/Index/cardBgIMG.jpg')" alt="" srcset="">
                  </div>
                  <div class="projectStage scrollbar-default">
                    <template v-for="(item2,index) in item.produceTasks">
                      <em v-if="index>0" :key="`${item2.engineeringName}-${index}`">---</em>
                      <span
                        :class="setProduceTask(index)"
                        :key="index"
                        @click="item2.notesURL?toNotes(item2.notesURL):projectCardClick(item2,item.id)"
                      >{{ item2.engineeringStage|engineeringStage }}</span>
                    </template>
                  </div>
                </div>
              </div>
              <!--              <i v-for="(v,index) in 3" :key="'$'+index"></i>-->
            </div>
          <!-- <div v-else v-show="!cardLoadSpinning" class="empty">
            <img src="../../dataHome/safetyManagement/1.png" alt="">
          </div> -->
          </div>
        </div>
        <a-pagination
          v-show="projectTotal && [0,1].includes(menuIndex) && listStyleIndex===1"
          :current="pageNum"
          :pageSize="pageSize"
          :total="projectTotal"
          @change="paginationChange"
          showLessItems ></a-pagination>
      </div>
    </div>
    <a-modal
      width="70%"
      :title="modal.title"
      :centered="modal.centered"
      :visible="modal.visible"
      :maskClosable="modal.maskClosable"
      :destroyOnClose="modal.destroyOnClose"
      :confirmLoading="modal.confirmLoading"
      :afterClose="modal.afterClose"
      @cancel="modal.cancel">
      <DataForm
        ref="dataForm"
        v-model="formData"
        class="dialogClass"
        projectId=""/>
      <template #footer>
        <a-button @click="modal.cancel">取消</a-button>
        <a-tooltip v-if="!isCreateProductPermission">
          <template slot="title">当前用户暂无新增生产任务单权限，请联系管理员！</template>
          <a-button
            @click="showDialog('确定要暂存生成任务单',saveData)"
            type="primary"
            :disabled="!isCreateProductPermission"
            class="btn">暂存</a-button>
        </a-tooltip>
        <a-button v-else @click="showDialog('确定要暂存生成任务单',saveData)" type="primary">暂存</a-button>
        <a-tooltip v-if="!isCreateProductPermission">
          <template slot="title">当前用户暂无新增生产任务单权限，请联系管理员！</template>
          <a-button
            @click="showDialog('确定要提交生成任务单',submitData)"
            type="primary"
            :disabled="!isCreateProductPermission"
            class="btn">提交</a-button>
        </a-tooltip>
        <a-button v-else @click="showDialog('确定要提交生成任务单',submitData)" type="primary">提交</a-button>
      </template>
    </a-modal>
  </div>
</template>
<script src="./index.ts"/>
<style lang="less" scoped>
@import url("./index.less");
@import '../../../styles/public.module.less';
</style>
