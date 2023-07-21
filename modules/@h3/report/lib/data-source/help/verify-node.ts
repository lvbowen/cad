import { NodeType, errorMsgType } from "../enum/node";
import { errorMsg } from "../enum/error-message";

let success = true;
let message = "";

/**
 * 节点连接时公共校方法
 * @param sourceNode 连接的源节点
 * @param targetNode 连接的目标节点
 */
export const commonConnectingValidate = (sourceNode, targetNode) => {
  const isInput = targetNode.data.type === NodeType.INPUT;
  // 如果连接的是输入节点 不可连
  if (isInput) {
    return {
      success: false,
      message: errorMsg.BothInput
    };
  }
  // 如果连接的节点 已经连接过  不可连
  if (targetNode.edges && targetNode.edges.length > 0) {
    const targetEdges = targetNode.edges;
    const sameTargetNode = targetEdges.find(n => {
      return n.source.id === sourceNode.id;
    });
    if (sameTargetNode) {
      return {
        success: false,
        message: errorMsg.RepeatedConnection
      };
    }
    // 校验目标节点
    // const targetRes = verify[targetNode.data.type].validate(targetNode);
    // return targetRes
  }

  return {
    success,
    message
  };
};

/**
 * 各种类型节点的校验规则
 */
export const verify = {
  [NodeType.INPUT]: {
    validate: (sourceNode, targetNode?) => {
      success = true;
      message = "";
      if (targetNode) {
        const res = commonConnectingValidate(sourceNode, targetNode);
        if (res.success) {
          if (targetNode.data.type === NodeType.OUTPUT) {
            success = false;
            message = errorMsg.CannotConnecteOutput;
          }
        } else {
          return res;
        }
      }

      return {
        success,
        message
      };
    }
  },
  [NodeType.OUTPUT]: {
    validate: (sourceNode, targetNode?) => {
      // 如果有目标节点 直接打回去
      success = true;
      message = "";
      // 如果输出节点时源节点 报错
      if (targetNode) {
        return {
          success: false,
          message: errorMsg.CannotConnecteOutput
        };
      }
      // 连接时 有一个源 打回去
      // 保存时 超过一个 打回去
      if (
        (sourceNode.edges && !targetNode && verify.isConnecting && sourceNode.edges.length === 1) ||
        (!verify.isConnecting && sourceNode.edges && sourceNode.edges.length > 1)
      ) {
        success = false;
        message = errorMsg.OnlyOneSource;
      }

      return {
        success,
        message
      };
    }
  },
  [NodeType.UNION]: {
    validate: node => {
      success = true;
      message = "";

      return {
        success,
        message
      };
    }
  },
  [NodeType.JOIN]: {
    validate: (sourceNode, targetNode?) => {
      success = true;
      message = "";
      if (targetNode) {
        // 作为源节点时 可以发出多条连接线
        const res = commonConnectingValidate(sourceNode, targetNode);
        if (res.success) {
          console.log("res", res);
        }
        return res;
      } else {
        // 作为目标节点时 关联节点只可存在两条数据源 和一条输出源 且输入源不可为同一个输入源
        const sourceNumber = sourceNode.edges
          ? sourceNode.edges.filter(e => {
              return e.target.id === sourceNode.id;
            })
          : [];
        if (
          (sourceNumber && verify.isConnecting && sourceNumber.length === 2) ||
          (sourceNumber && !verify.isConnecting && sourceNumber.length > 2)
        ) {
          return {
            success: false,
            message: errorMsg.AtMostTwoSources
          };
        }
      }
      return {
        success,
        message
      };
    }
  },
  [NodeType.GROUP]: {
    validate: node => {
      success = true;
      message = "";
      return {
        success,
        message
      };
    }
  },
  [NodeType.FILTER]: {
    validate: node => {
      success = true;
      message = "";
      return {
        success,
        message
      };
    }
  },
  [NodeType.UNIQ]: {
    validate: node => {
      success = true;
      message = "";
      return {
        success,
        message
      };
    }
  },
  [NodeType.COMPUTE]: {
    validate: (sourceNode, targetNode?) => {
      // 如果有目标节点 直接打回去
      success = true;
      message = "";

      // 有线的情况下才需要判断
      if (sourceNode.edges) {
        // 当大于1根线时，直接返回
        if (sourceNode.edges.length > 1) {
          success = false;
          message = errorMsg.OnlyOneSource;
        }
        // 当校验目标节点
        if (verify.isConnecting) {
          if (!targetNode) {
            // 当连接线为1时，判断是否线的类型冲突
            if (
              sourceNode.edges.length === 1 &&
              sourceNode.edges[0].target &&
              sourceNode.edges[0].target == sourceNode
            ) {
              success = false;
              message = errorMsg.OnlyOneSource;
            }

            // 校验源节点
          } else if (targetNode) {
            // 当连接线为1时，需要校验是否是输出线，即edge的target是否是自己，如果不是即正确
            if (
              sourceNode.edges.length === 1 &&
              sourceNode.edges[0].source &&
              sourceNode.edges[0].source == sourceNode
            ) {
              success = false;
              message = errorMsg.OnlyOneSource;
            }
          }
        }
      }

      return {
        success,
        message
      };
    }
  },
  common: {
    validate: node => {
      // 是否有单独节点
      success = true;
      message = "";
      if (!node.edges || node.edges.length === 0) {
        return {
          success: false,
          message: errorMsg.SingleNode
        };
      }

      return {
        success,
        message
      };
    }
  },
  isConnecting: true
};

/**
 * 校验全部节点
 * @param nodes 全部节点集合
 */
export const validateNodes = (nodes): H3.Falls.ValidatedResult => {
  let errorNode: any = null;

  success = true;
  message = "";

  const hasOutput = nodes.some(i => i.data.type === NodeType.OUTPUT);
  if (!hasOutput) {
    console.log("没有输入节点");
    success = false;
    message = errorMsg.MissOutput;
  } else {
    for (const node of nodes) {
      if (!(node.data && node.data.type)) {
        success = false;
        message = errorMsg.ErrorNode;
        errorNode = node;
        break;
      }
      console.log("1");
      const commonres = verify["common"].validate(node);
      if (commonres && commonres.success) {
        const res = verify[node.data.type].validate(node);
        if (!res.success) {
          success = res.success;
          message = res.message;
          errorNode = node;
          break;
        }
      } else {
        success = commonres.success;
        message = commonres.message;
        errorNode = node;
        break;
      }
    }
  }

  return {
    success,
    message,
    errorNode
  };
};
