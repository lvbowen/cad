import {Module} from '../module';
import Type from '../prower-modules';
import ModuleC from '../moduleC';

// 业务模块（编辑区域，tools）
class ModuleB extends Module implements H3.ReportPowerModules.ModuleB {

  add: boolean = true;
  edit: boolean = true;
  [Type.MODULEC]: ModuleC;
  
  empower<T>(ops: T): T {
    
    return {} as T;
  }
}

export default ModuleB;
