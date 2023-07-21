import {
  Component, Prop, Vue
} from 'vue-property-decorator';
import { mixins } from 'vue-class-component';
@Component
export default class ReportToolsMixins extends Vue {
  @Prop({ default: () => ({}) }) modules!: H3.ReportModules.ChartModules;
  @Prop({ default: () => ({}) }) modulesData!: H3.Report.Global;
  @Prop({ default: () => ({}) }) global!: H3.Report.Global;
  @Prop({ default: () => ({}) }) module!: H3.Report.Global;
  @Prop({ default: () => ({}) }) data!: H3.Report.Global;
}
