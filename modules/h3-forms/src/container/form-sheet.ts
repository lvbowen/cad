import {asyncScheduler, Observable, ReplaySubject, Subject, Subscription,} from "rxjs";
import {filter, map, observeOn} from "rxjs/operators";

import {Control, ControlOptions} from "../control";

import {ControlContainer} from "./control-container";

import {FormControl, FormControlCreateOptions, FormControlFactory, FormControlType,} from "../form-control";

import {FormArray} from "./form-array";

import {
  CellValueChange,
  ColumnValueChange,
  FormSheetLike,
  RowChange,
  RowChangeType,
  RowValue,
  RowValueChange,
} from "../form-sheet-like";

import {FormGroup} from "./form-group";

export interface FormSheetColumnOptions {
  key: string;

  type: FormControlType;

  options?: FormControlCreateOptions;
}
export interface SheetActionsOpt {
  code: string,
  text: string
}

export interface SheetAction extends SheetActionsOpt{
  visible: boolean,
  disabled: boolean
}

export interface FormSheetOptions extends ControlOptions {
  columns: FormSheetColumnOptions[];
  actions: SheetActionsOpt[]
}

export interface FormSheetCell {
  rowIndex: number;

  columnIndex: number;

  control: FormControl<any>;

  subscription?: Subscription;
}

export interface FormSheetCellSubscription {
  rowIndex: number;

  columnIndex: number;

  subscription?: Subscription;
}

export interface ActionDownParams {
  value: any[],
  h3forms: any,
  checkeds: any[]
}

export class FormSheet extends ControlContainer implements FormSheetLike {
  protected _columnOptions: FormSheetColumnOptions[];

  protected _customSheetActions: SheetAction[] = [];

  // protected _rows: FormArray[] = [];
  protected _rows: FormGroup[] = [];

  protected _cells: FormSheetCell[][] = [];

  protected _rowChangeSubject?: Subject<RowChange>;

  protected _rowChange?: Observable<RowChange>;

  protected _rowValueChangePipe?: Observable<RowValueChange>;

  protected _columnValueChangePipe?: Observable<ColumnValueChange>;

  protected _rowValueChangeMap?: {
    [key: string]: Observable<RowValueChange>;
  };

  protected _sheetActionEvents:Function[] = [];
  protected _columnValueChangeMap?: {
    [key: string]: Observable<ColumnValueChange>;
  };

  protected _cellValueChangeSubject = new ReplaySubject<CellValueChange>(1);
  protected _getCell:Function | null = null;

  constructor(options: FormSheetOptions) {
    super(options);

    if (!options) {
      throw new Error("options");
    }

    if (!Array.isArray(options.columns) || options.columns.length === 0) {
      throw new Error("options.columns");
    }
    // this._columnOptions = JSON.parse(JSON.stringify(options.columns));
    this._columnOptions = options.columns;
    this._customSheetActions = options.actions? this.toCuctomActions(options.actions) :  [];
  }

  get options() {
    return this._options as FormSheetOptions;
  }

  get customActions() {
    return this._customSheetActions;
  }

  get columnOptions() {
    return this._columnOptions;
  }

  get value() {
    // const vals = this._rows.map(row => this.toRowValue(row));
    return this._rows.map((row) => row.value);
  }

  set value(vals: any[]) {
    if (!vals || vals.length === 0) {
      const r: number[] = [];
      for (let i = 0; i < this._rows.length; i++) {
        r.push(i);
      }
      this.removeRows(r);
      return;
    }

    const firstRow =
      this._rows.length > 0 ? this._rows[0] : this.buildRow(false, 0);

    const firstVal = vals[0];
    const columnKeys = Object.keys(firstVal).filter((k) => {
      const col = firstRow.findChild(k) as FormControl<any>;
      const can = col && col.canSetValue(firstVal[k]);
      return can;
    });

    // 防止子表映射时，没匹配的值的时也会增加行数
    if (columnKeys.length === 0) {
      return;
    }

    if (this._rows.length === 0) {
      this.appendRows(vals);
    } else {
      const len = Math.min(vals.length, this._rows.length);

      for (let i = 0; i < len; i++) {
        const v: any = {};

        for (const k of columnKeys) {
          v[k] = vals[i][k];
        }

        this._rows[i].value = v;
      }

      if (len < vals.length) {
        this.appendRows(vals.slice(len));
      } else if (vals.length < this._rows.length) {
        const s: number[] = [];
        for (let i = vals.length; i < this._rows.length; i++) {
          s.push(i);
        }
        this.removeRows(s);
      }
    }
  }

  set customGetCell(fn:Function) {
    this._getCell = fn;
  }

  /**
   * 行变化
   * 新增、移除
   */
  get rowChange() {
    if (!this._rowChangeSubject) {
      this._rowChangeSubject = new Subject();
      this._rowChange = this._rowChangeSubject.pipe(observeOn(asyncScheduler));
    }
    return this._rowChange;
  }

  get rows() {
    return this._rows;
  }

  /**
   * 行模式
   */
  get children() {
    return this._rows;
  }

  /**
   * 遍历行
   * @param func
   */
  eachChildren(func: (control: Control) => void) {
    this.children.forEach(func);
  }

  getCell(rowIndex: number, columnIndex: number) {
    if (this._getCell) {
        return this._getCell(rowIndex, columnIndex);
    };
    const row = this._cells[rowIndex];
    if (!row) {
      return;
    }
    const cell = row[columnIndex];
    if (!cell) {
      return;
    }
    return cell.control;
  }

  protected emitRowChange(change: RowChange) {
    if (this._rowChangeSubject) {
      this._rowChangeSubject.next(change);
    }
  }

  protected toRowValue(row: FormArray) {
    const mapData: RowValue = {};
    this._columnOptions.forEach((col, i) => {
      mapData[col.key] = row.children[i].value;
    });
    return mapData;
  }
  protected toCuctomActions(actions: SheetActionsOpt[]): SheetAction[] {
    return actions.map(res => {
      return {
        ...res,
        visible: true,
        disabled: false
      }
    })
  }

  insertRow(index: number, value?: RowValue) {
    if (index < 0 || index > this._rows.length) {
      return;
    }

    const row = this.buildRow(true, index, value);

    const oldRow = this._rows[index];

    this._rows.splice(index, 0, row);

    if (this._root) {
      row.init(this._root, this);
    }

    this.updateOnlyOneRow(index);
    this.updateRows(index + 1, true);

    this.emitRowChange({
      index,
      type: RowChangeType.Insert,
      // oldValue: oldRow ? this.toRowValue(oldRow) : undefined,
      oldValue: oldRow ? oldRow.value : undefined,
      // value: this.toRowValue(row)
      value: row.value,
    });

    return row;
  }

  buildRow(initCell: boolean, index: number, value?: any) {
    const keys = value ? Object.keys(value) : [];

    const controls = this._columnOptions.map((col) => {
      const colOpts = col.options;

      const opts = Object.assign({}, colOpts);

      //用以支持行内字段映射
      opts.id = col.key;
      opts.inSheet = true;
      opts.rowIndex = index;

      if (value && keys.indexOf(opts.id) > -1) {
        opts.value = value[opts.id];
      }

      //值控件如果有值表达式，则不能用固定的值覆盖
      if (
        colOpts &&
        typeof colOpts.value === "string" &&
        (col.type === FormControlType.Number ||
          col.type === FormControlType.Date)
      ) {
        if (
          !colOpts.triggerComputeFormula &&
          "triggerComputeFormula" in colOpts
          ) {
          opts.originalValue = opts.value;
        }
        opts.value = colOpts.value;
      }

      const control = FormControlFactory.create(col.type, opts);

      return control as Control;
    });

    if (initCell) {
      const cells = controls.map((c, colIdx) => ({
        control: c as FormControl<any>,
        rowIndex: index,
        columnIndex: colIdx,
      }));

      this._cells.splice(index, 0, cells);

      if (
        this._rowValueChangeMap &&
        this._rowValueChangeMap[index.toString()]
      ) {
        this.subscribeCell(cells);
      }

      if (this._columnValueChangeMap) {
        const tempCells = Object.keys(this._columnValueChangeMap).map(
          (k) => cells[Number(k)]
        );
        this.subscribeCell(tempCells);
      }
    }

    // const row = new FormArray(controls);
    const row = new FormGroup(controls, {
      inSheet: true,
    });

    return row;
  }

  insertRows(index: number, values: RowValue[]) {
    if (index < 0 || index > this._rows.length || values.length === 0) {
      return;
    }

    const rows = values.map((value, i) =>
      this.buildRow(true, index + i, value)
    );

    this._rows.splice(index, 0, ...rows);

    rows.forEach((row, i) => {
      if (this._root) {
        row.init(this._root, this);
      }
    });

    this.updateRows(index);

    this.emitRowChange({
      index,
      type: RowChangeType.InsertMulti,
      insertCount: values.length,
    });
  }

  appendRow(value?: RowValue) {
    const idx = this._rows.length;
    return this.insertRow(idx, value);
  }

  appendRows(values: RowValue[]) {
    const idx = this._rows.length;
    return this.insertRows(idx, values);
  }
  updateOnlyOneRow(index: number) {
    const _row = this._rows[index];
    _row.eachChildren((c) => {
      if (c.options) {
        c.options.rowIndex = index;
      }
    });
    _row.update(false);
  }

  updateRows(index: number, noInit = false) {
    this._rows.forEach((_row, i) => {
      if (i < index) {
        return;
      }
      this._cells[i].forEach(v => {
        v.rowIndex = i
      })
      _row.eachChildren((c) => {
        if (c.options) {
          c.options.rowIndex = i;
        }
      });

      _row.update(noInit);
    });
  }

  removeRow(index: number) {
    const row = this._rows[index];
    if (!row) {
      return;
    }

    this._rows.splice(index, 1);

    this._cells.splice(index, 1);
    //     .forEach(row => {
    //         this.unsubscribeCell(row);
    //     });

    row.destroy();

    this.updateRows(index, true);

    this.emitRowChange({
      index,
      type: RowChangeType.Remove,
      // value: this.toRowValue(row)
      value: row.value,
    });
  }

  removeRows(indexs: number[]) {
    indexs = indexs
      .filter((i) => i > -1 && i < this._rows.length)
      .sort((a, b) => a - b)
      .reverse();

    if (indexs.length === 0) {
      return indexs;
    }

    const index = 0;

    for (const idx of indexs) {
      const row = this._rows[idx];
      if (row) {
        this._rows.splice(idx, 1);
        this._cells.splice(idx, 1);
        row.destroy();
      }
    }

    this.updateRows(index, true);

    this.emitRowChange({
      index,
      removeIndexs: indexs,
      type: RowChangeType.RemoveMulti,
    });
  }

  removeAllRow() {
    for (let i = this._rows.length - 1; i > -1; i--) {
      this.removeRow(i);
    }
  }

  protected subscribeCell(cells: FormSheetCell[]) {
    if (!cells) {
      return;
    }

    cells
      .filter((c) => !c.subscription)
      .forEach((cell) => {
        const next = (value: any, oldValue: any) => {
          this._cellValueChangeSubject.next({
            rowIndex: cell.rowIndex,
            columnIndex: cell.columnIndex,
            value,
            oldValue,
          });
        };

        cell.subscription = cell.control.valueChange.subscribe(
          (change) => {
            next(change.value, change.oldValue);
          },
          undefined,
          () => {
            next(undefined, cell.control.value);
          }
        );

        if (cell.control.value === null) {
          //新增行时触发列值变化事件，表单初始化时可完成统计
          next(null, null);
        }
      });
  }

  protected unsubscribeCell(cells: FormSheetCell[]) {
    if (!cells) {
      return;
    }

    cells.forEach((cell) => {
      if (cell.subscription) {
        cell.subscription.unsubscribe();
      }
    });
  }

  protected initRowValueChangePipe() {
    if (this._rowValueChangePipe) {
      return;
    }

    this._rowValueChangePipe = this._cellValueChangeSubject.pipe(
      observeOn(asyncScheduler),
      map((change) => {
        const row = this._rows[change.rowIndex];
        // const newValue = this.toRowValue(row);
        const newValue = row.value;
        const oldValue = Object.assign({}, newValue);
        oldValue[this._columnOptions[change.columnIndex].key] = change.oldValue;
        return {
          index: change.rowIndex,
          columnIndex: change.columnIndex,
          value: newValue,
          oldValue,
        };
      })
    );
  }

  protected initColumnValueChangePipe(key: string) {
    if (this._columnValueChangePipe) {
      return;
    }
    this._columnValueChangePipe = this._cellValueChangeSubject.pipe(
      observeOn(asyncScheduler),
      map((change) => {
        const newValue = this._cells.map(
          (row) => row[change.columnIndex].control.value
        );
        const oldValue = newValue.slice();
        oldValue[change.rowIndex] = change.oldValue;
        return {
          key: this.columnOptions[change.columnIndex].key,
          index: change.columnIndex,
          rowIndex: change.rowIndex,
          value: newValue,
          oldValue,
          parentKey: (this.id as string) || "",
        };
      })
    );
  }

  /**
   * 行值变化
   */
  getRowValueChange(index: number) {
    // if (index < 0 || index > this._rows.length - 1) {
    //     return;
    // }

    if (!this._rowValueChangeMap) {
      this._rowValueChangeMap = {};
    }

    const key = index.toString();
    let changePipe = this._rowValueChangeMap[key];

    if (!changePipe) {
      this.initRowValueChangePipe();

      if (this._rowValueChangePipe) {
        changePipe = this._rowValueChangePipe.pipe(
          filter((change) => change.index === index)
        );

        this._rowValueChangeMap[key] = changePipe;
      }
    }

    const cells = this._cells[index];

    this.subscribeCell(this._cells[index]);

    for (const cell of cells) {
      this._cellValueChangeSubject.next({
        rowIndex: cell.rowIndex,
        columnIndex: cell.columnIndex,
        value: cell.control.value,
      });
    }

    return changePipe;
  }

  /**
   * 列值变化
   */
  getColumnValueChange(key: string) {
    if (!key) {
      return;
    }

    const index = this._columnOptions.findIndex((c) => c.key === key);
    if (index < 0) {
      return;
    }

    if (!this._columnValueChangeMap) {
      this._columnValueChangeMap = {};
    }

    const mapKey = index.toString();
    let changePipe = this._columnValueChangeMap[mapKey];

    if (!changePipe) {
      this.initColumnValueChangePipe(key);

      if (this._columnValueChangePipe) {
        changePipe = this._columnValueChangePipe.pipe(
          filter((change) => change.index === index)
        );

        this._columnValueChangeMap[mapKey] = changePipe;
      }
    }

    const cells = this._cells.map((row) => row[index]);

    this.subscribeCell(cells);

    for (const cell of cells) {
      this._cellValueChangeSubject.next({
        rowIndex: cell.rowIndex,
        columnIndex: cell.columnIndex,
        value: cell.control.value,
      });
    }

    return changePipe;
  }
  actionDown(data:ActionDownParams) {
    const _this = data.h3forms;
    delete data.h3forms;
    this._sheetActionEvents.map((f) => f.apply(_this, [data]));
  }
  sheetActionDown(fn:Function) {
    if (fn) {
      this._sheetActionEvents.push(fn);
    }
  }

  destroy() {
    super.destroy();

    this._cells.forEach((row) => this.unsubscribeCell(row));

    if (this._rowChangeSubject) {
      this._rowChangeSubject.complete();
      this._rowChange = undefined;
    }

    if (this._cellValueChangeSubject) {
      this._cellValueChangeSubject.complete();
    }

    this._rowValueChangeMap = undefined;
    this._rowValueChangePipe = undefined;

    this._columnValueChangeMap = undefined;
    this._columnValueChangePipe = undefined;
  }
}
