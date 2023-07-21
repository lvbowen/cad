import { Module } from '../module';
import Type from '../prower-modules';
import ModuleB from '../moduleB';


// 子系统模块（列表分析，仪表盘）
class ModuleA extends Module implements H3.ReportPowerModules.ModuleA {

  add: boolean = true;
  edit: boolean = true;
  [Type.MODULEB]: H3.ReportPowerModules.ModuleB;

  empower<T>(ops: H3.ReportPowerModules.ModuleA): T {
    if(ops.edit === true)
      this[Type.MODULEB] = new ModuleB().empower<H3.ReportPowerModules.ModuleB>({});
    return [] as any;
  }
}

export default ModuleA;
