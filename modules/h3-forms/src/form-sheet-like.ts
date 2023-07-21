import { Observable } from "rxjs";

import { ContainerLike } from "./container-like";

export interface RowValue {
  [key: string]: any;
}

// eslint-disable-next-line no-shadow
export enum RowChangeType {
  Insert = "insert",

  InsertMulti = "insertMulti",

  Remove = "remove",

  RemoveMulti = "removeMulti"
}

export interface CellValueChange {
  rowIndex: number;

  columnIndex: number;

  oldValue?: any;

  value?: any;
}

/**
 * 列值变化事件
 */
export interface ColumnValueChange {
  key: string;

  /**
   * 索引
   */
  index: number;

  /**
   * 行索引
   */
  rowIndex: number;

  /**
   * 列旧值
   */
  oldValue?: any[];

  /**
   * 列新值
   */
  value?: any[];

  parentKey: string; // 子表key
}

/**
 * 行值变化事件
 */
export interface RowValueChange {
  /**
   * 行索引
   */
  index: number;

  /**
   * 批量删除的行索引集合
   */
  removeIndexs?: number[];

  /**
   * 批量插入的行数
   */
  insertCount?: number;

  /**
   * 列索引
   */
  columnIndex?: number;

  /**
   * 行旧值
   */
  oldValue?: RowValue;

  /**
   * 行新值
   */
  value?: RowValue;
}

/**
 * 行变化事件
 */
export interface RowChange extends RowValueChange {
  /**
   * 类型
   */
  type: RowChangeType;
}

export interface FormSheetLike extends ContainerLike {
  getRowValueChange(index: number): Observable<RowValueChange> | undefined;

  getColumnValueChange(key: string): Observable<ColumnValueChange> | undefined;
}
