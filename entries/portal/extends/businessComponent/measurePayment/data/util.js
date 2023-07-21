/**
 *遍历多棵树（增加节点）
 *data  多棵树
 *key   关键字
 */
function addListTree(data, key, newRow) {
  let flag = false
  for (let i = 0; i < data.length; i++) {
    if (flag) {
      break
    } else {
      addTree(data[i], key, newRow, flag)
    }
  }
}

/**
 *递归遍历树增加节点
 *data  树
 *key   关键字
 *newRow 子节点数据
 */
function addTree(data, key, newRow, flag) {
  if (data.id === key) {
    flag = true;
    data.children.push(newRow)
    return;
  } else {
    if (data.children && data.children.length > 0) {
      for (let i = 0; i < data.children.length; i++) {
        if (flag) {
          break
        } else {
          addTree(data.children[i], key, newRow, flag)
        }
      }
    }
  }
}

/**
 *遍历多棵树（删除节点）
 *data  多棵树
 *key   关键字
 */
function delListTree(data, key) {
  let flag = false
  for (let i = 0; i < data.length; i++) {
    if (flag) {
      break
    } else {
      if (data[i].id === key) {
        if (data[i].children && data[i].children.length > 0) {
          alert("存在子节点，不能删除！")
        } else {
          data.splice(i, 1);
        }
        break
      } else {
        delTree(data[i], key, flag)
      }
    }
  }
}

/**
 *递归遍历树删除节点
 *data  树
 *key   关键字
 */
function delTree(data, key, flag) {
  if (data.children && data.children.length > 0) {
    for (let i = 0; i < data.children.length; i++) {
      if (flag) {
        break
      } else {
        if (data.children[i].id === key) {
          if (data.children[i].children && data.children[i].children.length > 0) {
            //提示不能删
            alert("存在子节点，不能删除！");
            flag = true;
            return
          } else {
            data.children.splice(i, 1);
            flag = true;
            return
          }
        } else {
          delTree(data.children[i], key, flag)
        }
      }
    }
  }
}

/**
 *遍历多棵树（编辑节点）
 *data  多棵树
 *key   关键字
 */
function editListTree(data, key, dataIndex, value) {
  let flag = false
  for (let i = 0; i < data.length; i++) {
    if (flag) {
      break
    } else {
      if (data[i].id === key) {
        data[i][dataIndex] = value;
        flag = true
        break
      } else {
        editTree(data[i], key, flag, dataIndex, value)
      }
    }
  }
}

/**
 *遍历多棵树（编辑节点）
 *data  单数
 *key   关键字
 */
function editTree(data, key, flag, dataIndex, value) {
  if (data.children && data.children.length > 0) {
    for (let i = 0; i < data.children.length; i++) {
      if (flag) {
        break
      } else {
        if (data.children[i].id === key) {
          data.children[i][dataIndex] = value;
          flag = true
          return
        } else {
          editTree(data.children[i], key, flag, dataIndex, value)
        }
      }
    }
  }
}

/**
 *获取当前时间并处理成标准格式
 */
function timeDefault() {
  const date = new Date();
  let d = date.getDate();
  d = d < 10 ? "0" + d : d;//day如果小于10，则在前面加一个0
  let m = date.getMonth() + 1;
  m = m < 10 ? "0" + m : m;//month如果小于10，则在前面加一个0

  const s1 =
    date.getFullYear() + "-" + m + "-" + d;
  const hh = date.getHours() < 10 ? "0" + date.getHours() : date.getHours();
  const mm =
    date.getMinutes() < 10 ? "0" + date.getMinutes() : date.getMinutes();
  const ss =
    date.getSeconds() < 10 ? "0" + date.getSeconds() : date.getSeconds();

  return s1 + " " + hh + ":" + mm + ":" + ss;
}

// 定义小写字符转为大写字母的过滤器
function capitalize(value) {
  if (!value) return ''; // 当传入的value为null，则返回空字符串
  value = value.toString(); // 将传入的value转为String类型
  return value.charAt(0).toLowerCase() + value.slice(1) // 将字符串的第一个字母转为大写，后面的字符串拼接上
}

export {
  addListTree,
  delListTree,
  editListTree,
  timeDefault,
  capitalize
}
