
export abstract class Module {
  /**
   * 授权
   * @param ops
   */
  abstract empower<T>(ops: T) : T;
}
