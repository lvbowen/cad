import {Module} from '../module';

// 基础业务模块（图表，表格等）
class ModuleC extends Module implements H3.ReportPowerModules.ModuleC {
  add: boolean = true;
  edit: boolean = true;

  empower<T>(ops: T): T{
    return {} as T;
  }
}
export default ModuleC;
