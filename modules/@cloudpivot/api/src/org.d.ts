/**
 * 组织
 */
declare namespace Org {

  /**
   * 组织类型
   */
  // eslint-disable-next-line no-shadow
  export enum OrgType {
    Department = '1', // 部门
    Role = '2', // 角色
    User = '3'// 用户
  }
}

declare module 'qs'
