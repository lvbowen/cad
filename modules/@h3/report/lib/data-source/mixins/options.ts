import { Vue, Component, Prop } from 'vue-property-decorator';
import { ReportMutation, ReportAction } from '@h3/report/basics/store/data-source/types';
import { dataSourceState } from '@h3/report/basics/store/data-source';
import { namespace } from 'vuex-class';
import { dataSourceApi } from '@h3/report/basics/service/data-source';

const ReportDataSource = namespace('dataSource');

@Component({})
export default class TableMixin extends Vue {
  @Prop({ default: null }) corpId!: string; // 公司Id
  @Prop({ default: null }) dataSourceId !: string; // 数据源Id
  @Prop({ default: null }) groupId !: string; // 数据源分组Id
  @Prop({ default: () => ({}) }) config !: any; // 业务配置
  @ReportDataSource.Mutation(ReportMutation.SETDATASOURCEOPTIONS) setDataSourceOptions!: Function;
  @ReportDataSource.Mutation(ReportMutation.INITDATESOURCE) initDateSource!: Function;

  initDataSourceOptions() {
    const dataSourceOptions: any = {};
    if (this.corpId) {
      dataSourceOptions.corpId = this.corpId;
    }
    if (this.config) {
      dataSourceOptions.config = this.config;
    }
    if(this.dataSourceId) {
      dataSourceOptions.dataSourceId = this.dataSourceId;
    }
    if(this.groupId) {
      dataSourceOptions.groupId = this.groupId;
    }
    this.setDataSourceOptions(dataSourceOptions);
  }
  
  created() {
    dataSourceApi.setConfig({
      corpId: this.corpId,
      config: this.config
    });
    if (!this.$store.state.dataSource) {
      this.$store.registerModule('dataSource', dataSourceState);
    } else {
      this.initDateSource();
    }
    this.initDataSourceOptions();
  }
}
