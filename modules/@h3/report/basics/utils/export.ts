import XLSX from 'xlsx';
import {dateFormat} from '@h3/report/basics/utils/date';
import getAliaValue from './alias';

let merges: Array<any> = [];

/**
 * Table导出Excel
 * @param data
 * 参数所需数据接口： headRows, headColumns, bodyRows, summary, alias, title, colWidth
 */
function exportExcel(data: any) {
  if ( !data ) return;
  merges = [];
  // eslint-disable-next-line prefer-const
  let {headRows, headColumns, bodyRows, summary, alias, title, colWidth, columns, rows, metric } = data;
  if (headColumns.length) {
    summary = new Array(headColumns[0].length - 1).fill(null).concat(summary);
  }
  summary = [['汇总'].concat(summary)];

  const workbook = { SheetNames: [], Sheets: {} };
  const wsName = 'report';

  const wsColHeadData = makeColHead(headRows, [...columns,...rows,...metric], alias);
  const wsRowHeadData = makeRowHead(headColumns, [...rows,...columns,...metric], alias, headRows.length);
  const ws = XLSX.utils.aoa_to_sheet(wsColHeadData);
  XLSX.utils.sheet_add_aoa(ws, wsRowHeadData, { origin: -1 });
  const dataOriginC = (headColumns.length && headColumns[0].length) || 0;
  const dataOriginR = headRows.length;
  XLSX.utils.sheet_add_aoa(ws, bodyRows, { origin: { r: dataOriginR, c: dataOriginC } });
  XLSX.utils.sheet_add_aoa(ws, summary, { origin: -1 });
  XLSX.utils.book_append_sheet(workbook, ws, wsName);

  // const allCollNum = wsColHeadData[0].length;
  // const headRowsNum = wsColHeadData.length;
  // const headRange = { s: { r: 0, c: 0 }, e: { r: headRowsNum - 1, c: allCollNum - 1 } };
  // setRangeSytle(headRange, ws);

  if (dataOriginC > 0) {
    const summaryR = dataOriginR + bodyRows.length;
    merges.push({ s: { r: summaryR, c: 0 }, e: { r: summaryR, c: dataOriginC - 1 } });

    // const footRange = { s: { r: summaryR, c: 0 }, e: { r: summaryR, c: allCollNum - 1 } };
    // setRangeSytle(footRange, ws);
  }

  ws['!merges'] = merges;
  // ws['!cols'] = [...new Array(allCollNum).fill({ wpx: 100 })];
  ws['!cols'] = [...colWidth.map((item) => { return { wpx: item * 1.2 } })];

  const dateStr = dateFormat(new Date(), 'YYYYMMDD');
  XLSX.writeFile(workbook, `${title}${dateStr}.xlsx`);
}

/**
 * 格式化Excel表头数据
 * @param headData
 * @param columns
 * @param alias
 */
function makeColHead(headData: Array<Array<any>>, columns:Array<H3.Report.FieldColumn> = [], alias: object = {}) {
  const res: Array<Array<string | null>> = [];
  headData.forEach((row, i) => {
    const resRow: Array<string | null> = [];
    let currentCol = 0;
    row.forEach((cell: any, j) => {
      if (typeof cell === 'object') {
        let aliaName = '';
        for (const item of columns) {
         if(cell.label ? getAliaValue(item.uid, cell.label, alias) : '') {
           aliaName = getAliaValue(item.uid, cell.label, alias);
           break
         }
        }
        resRow.push(aliaName || cell.label);
        if (cell.rowspan && cell.rowspan > 1) {
          merges.push({ s: { r: i, c: currentCol }, e: { r: i + cell.rowspan - 1, c: currentCol + cell.colspan - 1 } });
        } else if (cell.colspan && cell.colspan > 1) {
          merges.push({ s: { r: i, c: currentCol }, e: { r: i, c: currentCol + cell.colspan - 1 } });
          for (let k = 1; k < cell.colspan; k++) {
            resRow.push(null);
          }
          currentCol += cell.colspan;
        } else {
          currentCol++;
        }
      } else {
        resRow.push(alias[cell] || cell);
        currentCol++;
      }
    });
    res.push(resRow);
  });
  return res;
}

/**
 * 格式化Excel表头数据
 * @param headData
 * @param rows
 * @param alias
 * @param headRowNum
 */
function makeRowHead(headData: Array<Array<any>>, rows, alias: object = {}, headRowNum: number) {
  const res: Array<Array<string | null>> = [];
  const innerMerges: Array<object> = [];
  let preRow: Array<string | null> = [];
  headData.forEach((row, i) => {
    const resRow: Array<string | null> = [];
    row.forEach((cell, j) => {
      if (cell && preRow[j] === cell && (j === 0 || (j > 0 && row[j - 1] == preRow[j - 1]))) {
        resRow.push(null);
        addRowSpan(innerMerges, i - 1, j, cell);
      } else {
        let aliaName = '';
        for (const item of rows) {
          if(cell ? getAliaValue(item.uid, cell, alias) : '') {
            aliaName = getAliaValue(item.uid, cell, alias);
            break
          }
        }
        resRow.push(aliaName || cell);

        if (!innerMerges[i]) {
          innerMerges[i] = { [j]: { v: cell, r: i, c: j, rowspan: 1 } };
        } else {
          innerMerges[i][j] = { v: cell, r: i, c: j, rowspan: 1 };
        }
      }
    });
    res.push(resRow);
    preRow = row;
  });

  innerMerges.forEach((row) => {
    for (const i in row) {
      const cell = row[i];
      if (cell.rowspan > 1) {
        merges.push({ s: { r: cell.r + headRowNum, c: cell.c }, e: { r: cell.r + headRowNum + cell.rowspan - 1, c: cell.c } });
      }
    }
  });
  return res;
}

/**
 * 合并纵向单元格
 * @param merges
 * @param i
 * @param j
 * @param cell
 */
// eslint-disable-next-line no-shadow
function addRowSpan(merges: Array<any>, i, j, cell) {
  for (i; i >= 0; i--) {
    if (merges[i][j] && merges[i][j].v === cell) {
      merges[i][j].rowspan++;
      break;
    }
  }
}

/**
 * 转换单元格地址到Excel表示法： 如 {c: 5 列, r: 0 行} 到 A6
 * @param cell
 */
function encode_cell(cell: {c: number, r: number}) {
  function encode_row(row) { return "" + (row + 1); }
  function encode_col(col) { let s=""; for(++col; col; col=Math.floor((col-1)/26)) s = String.fromCharCode(((col-1)%26) + 65) + s; return s; }
  return encode_col(cell.c) + encode_row(cell.r);
}

/**
 * 设置区域范围内的单元格样式
 * @param range
 * @param ws
 */
function setRangeSytle(range: any, ws: any) {
  for(let R = range.s.r; R <= range.e.r; ++R) {
    for(let C = range.s.c; C <= range.e.c; ++C) {
      const _address = encode_cell({ c: C, r: R });
      if (ws[_address]) {
        ws[_address].s = {
          font: {
            color: {
              rgb: '8893A700'
            }
          },
          alignment: {
            horizontal: 'center',
            vertical: 'center',
            wrap_text: true
          },
        };
      }
    }
  }
}

export default exportExcel;

export const downloadFile = function(url, name) {
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  a.target = '_self';
  a.click();
}
