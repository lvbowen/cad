import modules, {Type, Module} from './modules';

export abstract class Power {
  modules!: {[key in Type]: Module};

  /**
   * 注册
   * @param moduleType
   * @param permission
   */
  registerPower(moduleType: Type, permission: H3.ReportPower.Power) {
    return this.modules[moduleType].empower(permission);
  }

  /**
   * 
   */
  unRegisterPower() {
    
  }
  update(){
    
  }
}

