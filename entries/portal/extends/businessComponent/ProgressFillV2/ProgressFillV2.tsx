import {Component, InjectReactive, Ref, Vue, Watch} from 'vue-property-decorator';
import Class from './ProgressFill.module.less';
import {ZhCNEx} from "../../locales/zh-CN-ex";
import {Icon} from '@ctesi/component';
import * as Type from "../../type";
import * as Api from '../../service/api';
import Utils from "../../utils";
import {Table as VXETable} from 'vxe-table';
import WBSTree from "./WBSTree";

import Input from 'ant-design-vue/lib/input';
import 'ant-design-vue/lib/input/style/index.css';

import Tooltip from 'ant-design-vue/lib/tooltip';
import 'ant-design-vue/lib/tooltip/style/index.css';

import Button from 'ant-design-vue/lib/button';
import 'ant-design-vue/lib/button/style/index.css';

import DatePicker from 'ant-design-vue/lib/date-picker';
import 'ant-design-vue/lib/date-picker/style/index.css';

import moment from 'moment';

import Select from 'ant-design-vue/lib/select';
import 'ant-design-vue/lib/select/style/index.css';
import number from "../../../../../modules/@h3/report/basics/utils/number";

interface ProgressCodeTree<T, V> {
  loading: boolean;
  condition: string | null;
  status: V | null;
  source: Array<T>;
  selectRow: T | null;
}

interface QuestList<T, V> {
  batchOption: boolean;
  loading: boolean;
  condition: string | null;
  status: V | null;
  source: Array<T>;
  selectRow: T | Partial<T> | null;
  selectId: string | null;
}

interface RecordList<T> {
  loading: boolean;
  source: Array<T>;
}

interface SubmitFillDetail {
  show: boolean;
  ids: Array<string>;
  reportDate: string | null;
  reportProduction: number | null;
}

// eslint-disable-next-line no-shadow
enum ProgressStatus {
  NotStarted = -1,
  Done,
  OnGoing
}

@Component({
  name: 'ProgressFill'
})
export default class ProgressFill extends Vue {

  @InjectReactive('locale')
  private locale?: typeof ZhCNEx;

  @InjectReactive('projectConfig')
  private projectConfig?: Type.ProjectConfig;

  @InjectReactive('project')
  private projectCode?: string;

  @Ref()
  private MainContainer?: HTMLElement;

  @Ref()
  private QuestListTable!: VXETable;

  @Ref()
  private MainTree?: VXETable;

  private isFromBim: boolean = false;

  private storageContent: any = null;

  private colorMap: Map<number, { front: string, backend: string }> = new Map([
    [0, {front: "#e6e6e6", backend: "#e6e6e6"}],
    [0.00001, {front: "#f0c148", backend: "#e6e6e6"}],
    [1, {front: "#00c567", backend: "#e6e6e6"}]
  ]);

  private submitData: SubmitFillDetail = {
    show: false,
    ids: [],
    reportDate: moment(new Date()).format('YYYY-MM-DD'),
    reportProduction: null
  }

  private taskQueue: Array<string> = [];

  private fullHeight: number = 0;

  private treeChild: string = 'children';

  private batchFillLoading: boolean = false;

  private enableFillRecord: boolean = false;

  private percentConfig: Array<number> = [];
  private progressCodeTree: ProgressCodeTree<Type.WBSTreeV2, ProgressStatus> = {
    status: null,
    condition: null,
    source: [],
    loading: false,
    selectRow: null,
  }
  private questList: QuestList<Type.WBSTreeV2, ProgressStatus> = {
    batchOption: false,
    status: null,
    condition: null,
    source: [],
    loading: false,
    selectRow: null,
    selectId: null
  }
  private recordList: RecordList<any> = {
    loading: false,
    source: []
  }

  private inputValue: number = 0

  @Watch('enableFillRecord', {immediate: true})
  enableFillRecordListener(record) {
    const {selectId} = this.questList, {loading} = this.recordList, {
      locale,
      projectCode
    } = this;
    if (!selectId) return;
    if (loading) return;
    this.recordList.loading = true;
    Api.getRecordWithId({
      id: selectId,
      projectCode: projectCode as string
    }).then(res => {
      this.recordList.loading = false;
      if (res.errcode !== 0) return this.$message.error(res.errmsg as string);
      if (res.data) this.recordList.source = res.data;
    })
  }

  async mounted() {
    const {calcContentHeight} = this;
    this.calcContentHeight();
    this.getPercentConfig();
    await this.getStorage();
    this.getProgressCodeTree(undefined, true);
    window.addEventListener('resize', calcContentHeight);
  }

  destroyed() {
    const {calcContentHeight} = this;
    window.removeEventListener('resize', calcContentHeight);
  }

  render() {
    const {locale, progressCodeTree, questList, submitData, recordList} = this;
    return (
      <article class={Class.main} ref={'MainContainer'}>
        <nav class={Class.nav}>
          <Icon src={'goBack'} className={Class.goBack}
                clickEvent={e => this.$router.go(-1)}/>
          <span>{locale?.Progress.FillTitle}</span>
        </nav>
        <main class={Class.mainContainer}>
          <section class={Class.container}>
            <nav>
              <span>{locale?.Progress.ProgressCodeTree}</span>
            </nav>
            <article>
              <nav class={Class.optNav}>
                <Input.Search
                  class={Class.searchInput}
                  placeholder={locale?.Progress.SearchPlaceholder}
                  loading={progressCodeTree.loading}
                  enterButton
                  onSearch={this.searchProgressCodeTree}
                />
                <Tooltip placement={'right'} overlayClassName={Class.filterContainer}
                         title={this.getFilterTip(locale as typeof ZhCNEx, 'progressCodeTree', progressCodeTree.status)}>
                  <div class={Class.filterBtn}>
                    <Icon src={'filterIcon'} className={Class.icon}/>
                  </div>
                </Tooltip>
              </nav>
              <vxe-virtual-tree
                size={'mini'}
                // align={'center'}
                border
                resizable
                showOverflow
                rowKey
                highlightCurrentRow
                ref={'MainTree'}
                rowId={'id'}
                loading={progressCodeTree.loading}
                data={progressCodeTree.source}
                columns={Utils.generateXTableColumns(this.progressCodeTreeColumns(locale))}
                height={this.fullHeight}
                treeConfig={{
                  children: this.treeChild
                }}
                // rowClassName={this.highLightInParams}
                {...{
                  on: {
                    'current-change': this.selectCodeTree
                  }
                }}
              />
            </article>
          </section>
          <section
            class={`${Class.container} ${submitData.show ? Class.middle : Class.full}`}>
            <nav>
              <span>{locale?.Progress.FillQuestTodoList}</span>
            </nav>
            <article>
              <nav class={Class.optNav}>
                <Input.Search
                  class={Class.tableSearch}
                  loading={questList.loading}
                  placeholder={locale?.Progress.SearchPlaceholder}
                  enterButton
                  onSearch={this.searchQuestList}
                />
                <Button onClick={this.oneKeyDone}>{locale?.Progress.OneKeyDone}</Button>
                <Button loading={this.batchFillLoading}
                        onClick={this.batchFill}>{locale?.Progress.BatchFill}</Button>
                <Tooltip placement={'right'} overlayClassName={Class.filterContainer}
                         title={this.getFilterTip(locale as typeof ZhCNEx, 'questList', questList.status)}>
                  <div class={Class.filterBtn}>
                    <Icon src={'filterIcon'} className={Class.icon}/>
                  </div>
                </Tooltip>
              </nav>
              {
                submitData.show && <div class={Class.mask}/>
              }
              <vxe-virtual-tree
                ref={'QuestListTable'}
                size={'mini'}
                // align={'center'}
                border
                resizable
                showOverflow
                rowKey
                highlightCurrentRow
                autoResize
                rowId={'id'}
                loading={questList.loading}
                data={questList.source}
                columns={Utils.generateXTableColumns(this.questListColumns(locale))}
                height={this.fullHeight}
                checkboxConfig={{
                  /*labelField:'id',*/
                  checkField: 'checked',
                  halfField: 'indeterminate'
                  //trigger:'row'
                }}
                {...{
                  on: {
                    'cell-click': this.cellClick,
                    'current-change': this.selectQuest,
                    'checkbox-change': this.checkQuest,
                    'checkbox-all': this.checkAllQuest
                  }
                }}
              />
            </article>
          </section>
          <section class={`${Class.container} ${submitData.show ? Class.show : Class.hide}`}>
            <nav>
              {
                questList.batchOption &&
                <span
                  class={`${Class.optionSpan} ${this.enableFillRecord && Class.deActive || Class.active}`}
                  onClick={e => this.enableFillRecordFn(false)}>{locale?.Progress.BatchFillSummary}</span>
                ||
                <span
                  class={`${Class.optionSpan} ${this.enableFillRecord && Class.deActive || Class.active}`}
                  onClick={e => this.enableFillRecordFn(false)}>{locale?.Progress.FillDetail}</span>
              }
              {
                !questList.batchOption &&
                <span
                  class={`${Class.optionSpan} ${!this.enableFillRecord && Class.deActive || Class.active}`}
                  onClick={e => this.enableFillRecordFn(true)}>{locale?.Progress.FillRecord}</span>
              }
              <span style={{marginLeft: 'auto', marginRight: '10px', cursor: 'pointer'}}
                    onClick={this.closeSubmitPanel}>X</span>
            </nav>
            {
              !this.enableFillRecord &&
              <article class={Class.planDetailContainer}>
                {/* <nav>
                  <Icon src={'title'}/>
                  <span>{locale?.Progress.BaseInfo}</span>
                </nav>
                <aside>
                  {
                    questList.batchOption &&
                    <span
                      class={Class.singleValue}>{locale?.Progress.TaskNumber}：{questList.selectRow?.taskNum}</span>
                    ||
                    <span
                      class={Class.singleValue}>{locale?.Progress.QuestName}：{questList.selectRow?.planDetailName}</span>
                  }
                </aside>
                {
                  !questList.batchOption &&
                  <aside>
                    <span>{locale?.Progress.UnitPrice}：{questList.selectRow?.planDetailUnitPrice}{locale?.Progress.ProductionUnit}</span>
                  </aside>
                }
                <aside>
                  <span>{locale?.Progress.PlanNumber}：{questList.selectRow?.planDetailAmount}</span>
                  <span>{locale?.Progress.CompleteNumber}：{questList.selectRow?.reportDetailAmount}</span>
                </aside>
                <aside>
                  <span>{locale?.Progress.PlanProduction}：{questList.selectRow?.planDetailMoney}{locale?.Progress.ProductionUnit}</span>
                  <span>{locale?.Progress.CompleteProduction}：{questList.selectRow?.reportDetailMoney}{locale?.Progress.ProductionUnit}</span>
                </aside>
                <aside>
                  <span>{locale?.Progress.ResidualProduction}：{questList.selectRow?.surplusMoney}{locale?.Progress.ProductionUnit}</span>
                  <span>{locale?.Progress.ResidualValue}：{questList.selectRow?.surplusAmount}</span>
                </aside> */}
                <nav>
                  <Icon src={'title'}/>
                  <span>{locale?.Progress.FillContent}</span>
                </nav>
                <div class={Class.planDetailRow}>
                  <span>{locale?.Progress.Filler}</span>
                  <Input disabled value={questList.selectRow?.userName}/>
                </div>
                <div class={Class.planDetailRow}>
                  <span>{locale?.Progress.FillDate}</span>
                  <DatePicker v-model={submitData.reportDate}/>
                </div>
                <div class={Class.planDetailRow}>
                  <span>{locale?.Progress.FillProduction}</span>
                  {/* <Select v-model={submitData.reportProduction}>
                    {this.percentConfig.map(item => {
                      return <Select.Option key={item}>{item}%</Select.Option>
                    })}
                  </Select> */}
                  <Input
                    v-model={this.inputValue}
                    addonAfter={"％"}
                    placeholder={"请输入1-100的百分比"}
                  />
                </div>
                <Button onClick={this.detailSubmit} class={Class.oneKeyDone}
                        type={'primary'}>{locale?.Common.Action.submit}</Button>
              </article>
              ||
              <article>
                <vxe-virtual-tree
                  size={'mini'}
                  align={'center'}
                  border
                  resizable
                  showOverflow
                  rowKey
                  highlightCurrentRow
                  autoResize
                  rowId={'id'}
                  loading={recordList.loading}
                  data={recordList.source}
                  columns={Utils.generateXTableColumns(this.recordListColumns(locale))}
                  height={this.fullHeight + 40}
                />
              </article>
            }
          </section>
        </main>
      </article>
    );
  }

  private initQuestList() {
    this.questList.batchOption = false;
    this.questList.status = null;
    this.questList.loading = false;
    this.questList.source = [];
    this.questList.selectRow = null;
    this.questList.selectId = null;
    this.questList.condition = null;
  }

  private hasTask(taskFunc: Function): boolean {
    const taskName = Utils.getFnName(taskFunc.name);
    const flag = this.taskQueue.findIndex(item => item === taskName) !== -1;
    if (!flag) {
      this.taskQueue.push(taskName);
      return false;
    } else {
      return true;
    }
  }

  private removeTask(taskFunc: Function): void {
    const taskName = Utils.getFnName(taskFunc.name);
    if (this.hasTask(taskFunc)) {
      const index = this.taskQueue.findIndex(item => item === taskName);
      this.taskQueue.splice(index, 1);
    }
  }

  private getProgressCodeTree(parentId?: string, firstLoad?: boolean) {
    if (!this.projectConfig) return;
    const {projectName} = this.projectConfig, {
      projectCode,
      progressCodeTree,
      MainTree,
      isFromBim,
      storageContent
    } = this, {wbsIds, wbsMbsIds} = Utils.GetRequest();
    this.progressCodeTree.selectRow = null;
    this.initQuestList();
    this.initSubmitData();
    Api.getWBSTreeV2({
      wbsIds: isFromBim ? storageContent.wbsIds.split(',') ?? undefined : wbsIds?.split(',') ?? undefined,
      wbsMbsIds: isFromBim ? storageContent.wbsMbsIds.split(',') ?? undefined : wbsMbsIds?.split(',') ?? undefined,
      parentId: parentId ?? undefined,
      projectCode: projectCode as string,
      projectName: projectName as string,
      reportState: progressCodeTree.status ?? undefined,
      planDetailName: progressCodeTree.condition ?? undefined,
    }).then(res => {
      this.progressCodeTree.loading = false;
      if (res.errcode !== 0) return this.$message.error(res.errmsg as string);
      if (res.data) {
        this.progressCodeTree.source = res.data;
        if (firstLoad) {
          this.selectCodeTree({row: this.progressCodeTree.source[0], rowIndex: 0})
          this.$nextTick().then(() => {
            MainTree?.setAllTreeExpand(true);
            this.getQuestList(true);
          });
        }
      }
    })
  }

  private async getStorage() {
    if (window.location.href.indexOf('mbsKey') == -1) return
    //@ts-ignore
    const mbsKey = window.location.href.split('mbsKey=') ? window.location.href.split('mbsKey=') [1] : null;
    if (mbsKey) {
      const resData: Array<any> = await new Promise((resolve) => {
        Api.getStorge({key: mbsKey}).then(res => {
          if (res.data?.indexOf('@')) return resolve(res.data.split('@'));
          return null
        })
      });
      if (!resData) return null;
      this.isFromBim = true;
      this.storageContent = {
        wbsIds: resData[0],
        wbsMbsIds: resData[1]
      }
    }
  }

  private getQuestList(firstLoad?: boolean) {
    if (!this.projectConfig) return;
    const {projectName} = this.projectConfig, {
      projectCode,
      progressCodeTree,
      questList,
      isFromBim,
      storageContent
    } = this, {wbsIds, wbsMbsIds} = Utils.GetRequest();
    Api.getFillDetailV2({
      wbsIds: isFromBim ? storageContent.wbsIds.split(',') ?? undefined : wbsIds?.split(',') ?? undefined,
      wbsMbsIds: isFromBim ? storageContent.wbsMbsIds.split(',') ?? undefined : wbsMbsIds?.split(',') ?? undefined,
      parentId: progressCodeTree.selectRow?.id ?? undefined,
      projectCode: projectCode as string,
      projectName: projectName as string,
      reportState: questList.status ?? undefined,
      planDetailName: questList.condition ?? undefined
    }).then(res => {
      this.questList.loading = false;
      this.initSubmitData();
      if (res.errcode !== 0) return this.$message.error(res.errmsg as string);
      if (res.data) {
        Utils.deepFind(res.data, item => {
          item.checked = false;
          return false;
        }, this.treeChild)
        this.questList.source = res.data;
        if (firstLoad) {
          this.autoCheckParamsQuest();
        }
      }
    })
  }

  private refreshProgressCodeTree(parentId?: string, firstLoad?: boolean) {
    if (!this.projectConfig) return;
    const {projectName} = this.projectConfig, {
      projectCode,
      progressCodeTree,
      MainTree,
      isFromBim,
      storageContent
    } = this, {wbsIds, wbsMbsIds} = Utils.GetRequest();
    Api.getWBSTreeV2({
      wbsIds: isFromBim ? storageContent.wbsIds.split(',') ?? undefined : wbsIds?.split(',') ?? undefined,
      wbsMbsIds: isFromBim ? storageContent.wbsMbsIds.split(',') ?? undefined : wbsMbsIds?.split(',') ?? undefined,
      parentId: parentId ?? undefined,
      projectCode: projectCode as string,
      projectName: projectName as string,
      reportState: progressCodeTree.status ?? undefined,
      planDetailName: progressCodeTree.condition ?? undefined,
    }).then(res => {
      this.progressCodeTree.loading = false;
      if (res.errcode !== 0) return this.$message.error(res.errmsg as string);
      if (res.data) {
        this.progressCodeTree.source = res.data;
        if (firstLoad) {
          this.$nextTick().then(() => {
            MainTree?.setAllTreeExpand(true);
            this.getQuestList();
          });
        }
      }
    })
  }

  private autoCheckParamsQuest() {
    const {QuestListTable, questList} = this;
    this.$nextTick().then(() => {
      QuestListTable.setCheckboxRow(questList.source, true);
      this.checkAllQuest({records: questList.source});
    })

  }

  private getPercentConfig() {
    if (!this.projectConfig) return;
    const {projectName} = this.projectConfig, {projectCode} = this;
    Api.getPercentConfig({
      projectCode: projectCode as string,
      projectName: projectName as string
    }).then(res => {
      if (res.errcode !== 0) return this.$message.error(res.errmsg as string);
      if (res.data) {
        this.percentConfig = res.data;
        this.submitData.reportProduction = res.data[0];
      }
    })
  }

  private initSubmitData(withOutIds?: boolean) {
    this.submitData.show = false;
    if (!withOutIds) this.submitData.ids = [];
    this.submitData.reportDate = moment(new Date()).format('YYYY-MM-DD');
    this.submitData.reportProduction = this.percentConfig[0];
  }

  private renderProgressStatus(row: Type.WBSTreeV2, locale: typeof ZhCNEx): JSX.Element {
    let vNode: JSX.Element = <span/>;
    switch (row.reportState) {
      case ProgressStatus.Done:
        vNode = <span role={'done'}>{locale.Progress.Done}</span>;
        break;
      case ProgressStatus.OnGoing:
        vNode = <span role={'onGoing'}>{locale.Progress.OnGoing}</span>;
        break;
      case ProgressStatus.NotStarted:
        vNode = <span role={'notStarted'}>{locale.Progress.NotStarted}</span>;
        break;
    }
    return vNode;
  }

  private renderProportion(row: Type.WBSTreeV2): JSX.Element {
    const {colorMap} = this;
    const percent: number = row.cumulativeReportRatio * 100;
    let percentRole: { front: string; backend: string } = {front: "#FFF", backend: "#FFF"};
    Array.from(colorMap)?.forEach((item, index) => {
      if (row.cumulativeReportRatio >= item[0]) percentRole = item[1];
    });
    return (
      <span class={Class.progressBar} style={{backgroundColor: percentRole.backend}}>
        <div class={percent < 0.13 && Class.minPercent}
             style={{width: `${percent}%`, backgroundColor: percentRole.front}}>
          <span>{percent}%</span>
        </div>
      </span>
    )

  }

  private renderRecordPercent(row: Type.WBSRecordV2): JSX.Element {
    const {colorMap} = this;
    const percent: number = row.cumulativeReportRatio * 100;
    let percentRole: { front: string; backend: string } = {front: "#FFF", backend: "#FFF"};
    Array.from(colorMap)?.forEach((item, index) => {
      if (row.cumulativeReportRatio >= item[0]) percentRole = item[1];
    });
    return <span style={{color: percentRole.front}}>{percent}%</span>
  }

  private renderRecordOption(row: Type.WBSRecordV2, locale: typeof ZhCNEx): JSX.Element {
    return <a href={'javascript:void(0)'}
              onClick={e => this.goToViewRecord(row)}>{locale.Common.Table.goToView}</a>
  }

  private progressCodeTreeColumns(locale?: typeof ZhCNEx): Array<Type.TableColumn<Type.WBSTreeV2>> {
    if (!locale) return [];
    return [
      {
        title: locale.Progress.EngineeringParts,
        dataIndex: 'planDetailName',
        key: 'header_0',
        width: 300,
        align: 'left',
        treeNode: true,
      },
      {
        title: locale.Progress.Status,
        dataIndex: 'status',
        key: 'header_1',
        width: 150,
        align: 'center',
        customRender: (r) => this.renderProgressStatus(r as Type.WBSTreeV2, locale)
      }
    ]
  }

  private questListColumns(locale?: typeof ZhCNEx): Array<Type.TableColumn<Type.WBSTreeV2>> {
    if (!locale) return [];
    return [
      {
        type: 'checkbox',
        width: 40,
        align: 'center'
      },
      {
        title: locale.Progress.QuestName,
        dataIndex: 'planDetailName',
        key: 'header_0',
        width: 300,
        align: 'left'
      },
      {
        title: locale.Progress.AccumulateProportion,
        dataIndex: 'parts',
        key: 'header_0',
        width: 300,
        align: 'center',
        customRender: (r) => this.renderProportion(r as Type.WBSTreeV2)
      },
      {
        title: locale.Progress.Status,
        dataIndex: 'status',
        key: 'header_1',
        width: 150,
        align: 'center',
        customRender: (r) => this.renderProgressStatus(r as Type.WBSTreeV2, locale)
      }
    ]
  }

  private recordListColumns(locale?: typeof ZhCNEx): Array<Type.TableColumn<Type.WBSRecordV2>> {
    if (!locale) return [];
    return [
      {
        title: locale.Progress.RecordDate,
        dataIndex: 'reportDate',
        key: 'header_0',
        width: 150,
        customRender: (r) =>
          <span>{moment((r as Type.WBSRecordV2).reportDate).format('YYYY-MM-DD')}</span>
      },
      {
        title: locale.Progress.RecordOperator,
        dataIndex: 'userName',
        key: 'header_0',
        width: 150
      },
      {
        title: locale.Progress.RecordPercent,
        dataIndex: 'percent',
        key: 'header_0',
        width: 150,
        customRender: (r) => this.renderRecordPercent(r as Type.WBSRecordV2)
      },
    //   {
    //     title: locale.Common.Action.options,
    //     dataIndex: 'percent',
    //     key: 'header_0',
    //     width: 150,
    //     customRender: (r) => this.renderRecordOption(r as Type.WBSRecordV2, locale)
    //   }
    ]
  }

  private searchProgressCodeTree(value: string) {
    this.progressCodeTree.condition = value;
    this.progressCodeTree.loading = true;
    this.getProgressCodeTree();
  }

  private searchQuestList(value: string) {
    this.questList.condition = value;
    this.questList.loading = true;
    this.getQuestList();
  }

  private oneKeyDone() {
    const {
      hasTask,
      removeTask,
      oneKeyDone,
      projectCode,
      locale
    } = this, {ids} = this.submitData;
    if (hasTask(oneKeyDone)) return;
    if (!ids.length) return this.$message.error(locale?.Progress.IdsRequired ?? "");
    this.submitData.reportDate = moment(new Date()).format('YYYY-MM-DD');
    this.submitData.reportProduction = 100;
    Api.submitFillDetail({
      idList: this.submitData.ids,
      projectCode: projectCode as string,
      ratio: this.submitData.reportProduction,
      reportDate: this.submitData.reportDate
    }).then(res => {
      removeTask(oneKeyDone);
      if (res.errcode !== 0) return this.$message.error(res.errmsg as string);
      // this.getQuestList();
      this.refreshProgressCodeTree(undefined,true);
      this.submitData.ids = [];
    });
  }

  private batchFill() {
    const {ids} = this.submitData, {locale, projectCode, batchFillLoading} = this;
    if (!ids.length) return this.$message.error(locale?.Progress.IdsRequired ?? "");
    if (batchFillLoading) return;
    this.batchFillLoading = true;
    Api.getMultipleFillDetail({
      idList: ids,
      projectCode: projectCode as string
    }).then(res => {
      this.batchFillLoading = false;
      if (res.errcode !== 0) return this.$message.error(res.errmsg as string);
      if (res.data) {
        this.questList.batchOption = true;
        this.questList.selectRow = new WBSTree({
          planDetailUnitPrice: res.data.planDetailUnitPrice,
          planDetailMoney: res.data.planDetailMoney,
          planDetailAmount: res.data.planDetailAmount,
          reportDetailAmount: res.data.reportDetailAmount,
          reportDetailMoney: res.data.reportDetailMoney,
          userName: res.data.userName,
          taskNum: res.data.taskNum
        }).instance;
        this.submitData.show = true;
      }
    })
  }

  private selectCodeTree({row, rowIndex}: { row: Type.WBSTreeV2, rowIndex: number }) {
    this.progressCodeTree.selectRow = row;
    this.questList.loading = true;
    this.getQuestList();
  }

  private selectQuest({row, rowIndex}: { row: Type.WBSTreeV2, rowIndex: number }) {
    const {submitData, questList} = this;
    if (questList.batchOption) return;
    this.questList.selectRow = row;
    this.questList.selectId = row.id;
    /*const target = submitData.ids.find(item => item === row.id);
    if (!target) this.submitData.ids.push(row.id);*/
    this.submitData.show = true;
  }

  private cellClick({
                      row,
                      rowIndex,
                      triggerCheckbox
                    }: { row: Type.WBSTreeV2, rowIndex: number, triggerCheckbox: boolean }) {
    if (triggerCheckbox) return;
    const {submitData, questList} = this;
    if (questList.batchOption) return;
    this.selectQuest({row, rowIndex});
  }

  private checkQuest(...args) {
    const collections = args[0].records;
    if (this.questList.batchOption) this.closeSubmitPanel();
    this.submitData.ids = collections.map(item => item.id);
  }

  private checkAllQuest({records}: { records: Array<Type.WBSTreeV2> }) {
    console.log('checkAllQuest===>', records);
    this.submitData.ids = records.map(item => item.id);
  }

  private setFilterNdQuery(status: number | null, dataContainer: 'progressCodeTree' | 'questList') {
    switch (dataContainer) {
      case "progressCodeTree":
        this.progressCodeTree.status = status;
        this.progressCodeTree.loading = true;
        this.getProgressCodeTree();
        break;
      case "questList":
        this.questList.status = status;
        this.questList.loading = true;
        this.getQuestList();
        break;
    }
  }

  private getFilterTip(locale: typeof ZhCNEx, dataContainer: 'progressCodeTree' | 'questList', status: ProgressStatus | null) {
    if (!locale || !dataContainer) return [];
    console.log('renderGetFilterTip====>', dataContainer);
    const {setFilterNdQuery} = this;
    return (
      <div class={Class.filterTip}>
         <span
           role={status === null && 'filterActive' || undefined}
           onClick={e => setFilterNdQuery(null, dataContainer)}>{locale.Progress.All}</span>
        <span
          role={status === ProgressStatus.OnGoing && 'filterActive' || undefined}
          onClick={e => setFilterNdQuery(ProgressStatus.OnGoing, dataContainer)}>{locale.Progress.OnGoing}</span>
        <span
          role={status === ProgressStatus.NotStarted && 'filterActive' || undefined}
          onClick={e => setFilterNdQuery(ProgressStatus.NotStarted, dataContainer)}>{locale.Progress.NotStarted}</span>
        <span
          role={status === ProgressStatus.Done && 'filterActive' || undefined}
          onClick={e => setFilterNdQuery(ProgressStatus.Done, dataContainer)}>{locale.Progress.Done}</span>
      </div>
    )
  }

  private goToViewRecord(record: Type.WBSRecordV2) {
    const {reportDate} = record;
    const date = moment(reportDate).format('YYYY-MM-DD');
    console.log('date====>', date);
    this.$router.push({
      name: 'progressSummary',
      query: {
        scheduledate: date
      }
    });
  }

  private detailSubmit() {
    const k = /^(\d|[1-9]\d|100)(\.\d{1,2})?%$/;
    const {ids, reportProduction, reportDate} = this.submitData, {
      locale,
      hasTask,
      removeTask,
      detailSubmit,
      projectCode,
      questList,
      inputValue
    } = this;
    if (k.test(inputValue + '%')) {
      if (!ids.length && questList.selectId) this.submitData.ids = [questList.selectId];
      if (!this.submitData.ids.length) return this.$message.error(locale?.Progress.IdsRequired ?? "");
      if (!reportProduction) return this.$message.error(locale?.Progress.ProductionRequired ?? "");
      if (!reportDate) return this.$message.error(locale?.Progress.DateRequired ?? "");
      if (hasTask(detailSubmit)) return;
      Api.submitFillDetail({
        idList: this.submitData.ids,
        projectCode: projectCode as string,
        ratio: inputValue,
        // ratio: reportProduction,
        reportDate: moment(reportDate).format('YYYY-MM-DD')
      }).then(res => {
        removeTask(detailSubmit);
        if (res.errcode !== 0) return this.$message.error(res.errmsg as string);
        this.initSubmitData(true);
        // this.initQuestList();
        // this.getQuestList();
        this.refreshProgressCodeTree(undefined,true);
        this.submitData.ids = [];
      });
    }else {
      this.$message.error('请输入1-100的整数或者保留两位小数的百分比');
    }
  }

  private closeSubmitPanel() {
    const {questList} = this;
    this.initSubmitData(true);
    this.enableFillRecordFn(false);
    if (questList.batchOption) this.questList.batchOption = false;
  }

  private calcContentHeight() {
    const
      Container = this.MainContainer,
      Tree = this.MainTree;
    if (!Container || !Tree) return;
    const {x, y, width, height} = Container.getClientRects()[0];
    this.fullHeight = height - 45 - 42 - 44 - 50;
    console.log('contentHeight===>', this.fullHeight);
  }

  private enableFillRecordFn(flag: boolean) {
    this.enableFillRecord = flag;
  }

  // private highLightInParams({row}) {
  //   const {wbsIds, wbsMbsIds} = Utils.GetRequest();
  //   const {isFromBim, storageContent} = this;
  //   if (!isFromBim) {
  //     if (!storageContent) return null;
  //     if (!storageContent.wbsIds || !storageContent.wbsMbsIds) return null;
  //     return storageContent.wbsIds?.split(',').includes(row.id) ? Class.hint : null;
  //   }
  //   if (!wbsIds || !wbsMbsIds) return null;
  //   return wbsIds?.split(',').includes(row.id) ? Class.hint : null;
  // }
}
