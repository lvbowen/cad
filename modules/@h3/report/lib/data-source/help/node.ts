import {
  NodeToStageType,
  NodeErrorCode,
  ModelErrorCode,
  ModelErrorMessage,
  NodeErrorMessage,
  NodeType
} from "../enum/node";

let defValidateType: string;

/**
 * 节点校验规则
 */
const nodeValidate: H3.Falls.NodesOptions = {
  [NodeToStageType.join]: {
    rule: (
      relation: H3.Falls.Relation,
      source: H3.Falls.Source,
      level: number,
      validateType: string
    ): H3.Falls.NodeValidateMessage | boolean => {
      const targetEdges = source.edges.filter((edge: H3.Falls.Edge) => edge.target === relation.id);
      const sourceEdges = source.edges.filter((edge: H3.Falls.Edge) => edge.source === relation.id);
      const msg: H3.Falls.NodeValidateMessage | boolean = true;
      if (validateType === "save") {
        if (!targetEdges || !targetEdges.length || !sourceEdges || !sourceEdges.length) {
          return {
            nodeId: relation.id,
            message: {
              key: NodeErrorCode.ISOLATEDNODE,
              message: NodeErrorMessage.ISOLATEDNODE
            }
          };
        }
      }
      if (!targetEdges || targetEdges.length < 2) {
        return {
          nodeId: relation.id,
          message: {
            key: NodeErrorCode.RELATIONTARGETEDGES,
            message: NodeErrorMessage.RELATIONTARGETEDGES
          }
        };
      }

      const repeated = getNodeModels(relation.id, source);
      if (repeated.length) {
        return {
          nodeId: relation.id,
          message: {
            key: NodeErrorCode.RELATIONREPEATEDMODEL,
            message: NodeErrorMessage.RELATIONREPEATEDMODEL
          },
          repeated
        };
      }

      if (
        level !== 1 &&
        sourceEdges &&
        sourceEdges.length &&
        !(relation.groups && relation.groups.length)
      ) {
        return {
          nodeId: relation.id,
          message: {
            key: NodeErrorCode.BEFOREGROUPS,
            message: NodeErrorMessage.BEFOREGROUPS
          }
        };
      }

      return msg;
    },
    model: (fields: Array<H3.Falls.Field>, stage: H3.Falls.Stage, level: number) => {
      return {
        fields,
        relations: null,
        level: level === 1 ? level - 1 : level
      };
    }
  },
  [NodeToStageType.input]: {
    rule: (
      model: H3.Falls.Model,
      source: H3.Falls.Source,
      level: number,
      validateType: string
    ): H3.Falls.NodeValidateMessage | boolean => {
      const sourceEdges = source.edges.filter((edge: H3.Falls.Edge) => edge.source === model.id);
      const msg: H3.Falls.NodeValidateMessage | boolean = true;
      if (validateType === "save") {
        if (!sourceEdges || !sourceEdges.length) {
          return {
            nodeId: model.id,
            message: {
              key: NodeErrorCode.ISOLATEDNODE,
              message: NodeErrorMessage.ISOLATEDNODE
            }
          };
        }
      }
      if (!model.main || !model.main.schemaCode) {
        return {
          nodeId: model.id,
          message: {
            key: NodeErrorCode.BEFOREGROUPS,
            message: NodeErrorMessage.BEFOREGROUPS
          }
        };
      }
      return msg;
    },
    model: (fields: Array<H3.Falls.Field>, stage: H3.Falls.Stage, level: number) => {
      const main = (stage as H3.Falls.Model).main;
      const sub = (stage as H3.Falls.Model).sub;
      fields.push(
        ...main.fields.map((field: H3.Falls.Field) =>
          Object.assign({}, field, {
            id: `${field.id}#${main.schemaCode}`,
            source: []
          })
        )
      );
      if (sub && sub.fields) {
        fields.push(
          ...sub.fields.map((field: H3.Falls.Field) =>
            Object.assign({}, field, {
              id: `${field.id}#${sub.schemaCode}`,
              source: []
            })
          )
        );
      }
      return {
        fields,
        relations: null,
        level
      };
    }
  },
  [NodeToStageType.union]: {
    rule: (
      merge: H3.Falls.Merge,
      source: H3.Falls.Source,
      level: number,
      validateType: string
    ): H3.Falls.NodeValidateMessage | boolean => {
      const targetEdges = source.edges.filter((edge: H3.Falls.Edge) => edge.target === merge.id);
      const sourceEdges = source.edges.filter((edge: H3.Falls.Edge) => edge.source === merge.id);

      const msg: H3.Falls.NodeValidateMessage | boolean = true;

      if (validateType === "save") {
        if (!targetEdges || !targetEdges.length || !sourceEdges || !sourceEdges.length) {
          return {
            nodeId: merge.id,
            message: {
              key: NodeErrorCode.ISOLATEDNODE,
              message: NodeErrorMessage.ISOLATEDNODE
            }
          };
        }
      }

      if (!targetEdges || targetEdges.length < 2 || targetEdges.length > 10) {
        return {
          nodeId: merge.id,
          message: {
            key: NodeErrorCode.MERGETARGETEDGES,
            message: NodeErrorMessage.MERGETARGETEDGES
          }
        };
      }
      if (level !== 1 && (!merge.groups || !merge.groups.length)) {
        return {
          nodeId: merge.id,
          message: {
            key: NodeErrorCode.BEFOREGROUPS,
            message: NodeErrorMessage.BEFOREGROUPS
          }
        };
      }
      if (level !== 1) {
        const hasUnique = merge.groups.find((item: H3.Falls.DynamicField) => {
          return Object.keys(item.source).length >= 2;
        });
        if (!hasUnique) {
          return {
            nodeId: merge.id,
            message: {
              key: NodeErrorCode.BEFOREGROUPS,
              message: NodeErrorMessage.BEFOREGROUPS
            }
          };
        }
      }
      return msg;
    },
    model: (fields: Array<H3.Falls.Field>, stage: H3.Falls.Stage, level: number) => {
      const groups =
        (stage as H3.Falls.Merge).groups && (stage as H3.Falls.Merge).groups.length
          ? (stage as H3.Falls.Merge).groups
          : [];
      const relations = {};
      groups.forEach((field: H3.Falls.DynamicField) => {
        fields.push({
          id: field.id,
          text: field.text,
          type: field.type,
          source: []
        });
        relations[field.id] = JSON.parse(JSON.stringify(field.source));
      });
      return {
        fields,
        relations,
        level
      };
    }
  },
  [NodeToStageType.compute]: {
    rule: (
      compute: H3.Falls.Compute,
      source: H3.Falls.Source,
      level: number,
      validateType: string
    ): H3.Falls.NodeValidateMessage | boolean => {
      const targetEdges = source.edges.filter((edge: H3.Falls.Edge) => edge.target === compute.id);
      const sourceEdges = source.edges.filter((edge: H3.Falls.Edge) => edge.source === compute.id);
      const msg: H3.Falls.NodeValidateMessage | boolean = true;
      if (validateType === "save") {
        if (!targetEdges || !targetEdges.length || !sourceEdges || !sourceEdges.length) {
          return {
            nodeId: compute.id,
            message: {
              key: NodeErrorCode.ISOLATEDNODE,
              message: NodeErrorMessage.ISOLATEDNODE
            }
          };
        }
      }
      if (!targetEdges || !targetEdges.length) {
        return {
          nodeId: compute.id,
          message: {
            key: NodeErrorCode.OUTPUTEMPTY,
            message: NodeErrorMessage.OUTPUTEMPTY
          }
        };
      }
      if (level !== 1 && (!compute.fields || !compute.fields.length)) {
        return {
          nodeId: compute.id,
          message: {
            key: NodeErrorCode.BEFOREGROUPS,
            message: NodeErrorMessage.BEFOREGROUPS
          }
        };
      }
      return msg;
    },
    model: (fields: Array<H3.Falls.Field>, stage: H3.Falls.Stage, level: number) => {
      const computeFields =
        (stage as H3.Falls.Compute).fields && (stage as H3.Falls.Compute).fields.length
          ? (stage as H3.Falls.Compute).fields
          : [];
      computeFields.forEach((field: H3.Falls.DynamicField) => {
        fields.push({
          id: field.id,
          text: field.text,
          type: field.type,
          source: [field.source.formula]
        });
      });
      return {
        fields,
        relations: null,
        level: level === 1 ? level - 1 : level
      };
    }
  },
  [NodeToStageType.output]: {
    rule: (
      output: H3.Falls.Stage,
      source: H3.Falls.Source,
      level: number,
      validateType: string
    ): H3.Falls.NodeValidateMessage | boolean => {
      const targetEdges = source.edges.filter((edge: H3.Falls.Edge) => edge.target === output.id);
      const msg: H3.Falls.NodeValidateMessage | boolean = true;
      if (validateType === "save") {
        if (!targetEdges || !targetEdges.length) {
          return {
            nodeId: output.id,
            message: {
              key: NodeErrorCode.ISOLATEDNODE,
              message: NodeErrorMessage.ISOLATEDNODE
            }
          };
        }
      }
      if (!targetEdges || !targetEdges.length) {
        return {
          nodeId: output.id,
          message: {
            key: NodeErrorCode.OUTPUTEMPTY,
            message: NodeErrorMessage.OUTPUTEMPTY
          }
        };
      }
      return msg;
    },
    model: () => {}
  }
};

/**
 * 获取模型
 * @param relationId
 * @param source
 * @param models
 * @param repeated
 */
function getNodeModels(
  relationId: string,
  source: H3.Falls.Source,
  models: any = {},
  repeated: { [key: string]: Array<string> } = {}
): Array<Array<string>> {
  const targetEdges = source.edges.filter((edge: H3.Falls.Edge) => edge.target === relationId);
  let modelKey: string | null;
  targetEdges.forEach((edge: H3.Falls.Edge) => {
    const nNode = source.nodes.find(
      (node: H3.Falls.Node) => node.id === edge.source
    ) as H3.Falls.Node;
    const stageType = NodeToStageType[nNode.type];
    modelKey = null;
    if (stageType !== NodeToStageType.join) {
      const stage = source[stageType].find((item: H3.Falls.Model) => item.id === nNode.id);
      if (stageType === NodeToStageType.input) {
        if ((stage as H3.Falls.Model).main && (stage as H3.Falls.Model).main.schemaCode) {
          modelKey = (stage as H3.Falls.Model).main.schemaCode;
        }
      }
      if (modelKey) {
        if (models[modelKey]) {
          repeated[modelKey] = repeated[modelKey] || [models[modelKey]];
          repeated[modelKey].push(stage.id);
        } else {
          models[modelKey] = stage.id;
        }
      }
    } else {
      getNodeModels(nNode.id, source, models, repeated);
    }
  });
  return Object.values(repeated);
}

/**
 * 生成节点关系数
 * @param nodeId
 * @param source
 * @param oSource
 * @param validateType
 * @param level
 */
function generateNodeEdge(
  nodeId: string,
  source: H3.Falls.Source,
  oSource: H3.Falls.Source,
  validateType: string,
  level = 1
): boolean | H3.Falls.NodeValidateMessage {
  const nNode = oSource.nodes.find((node: H3.Falls.Node) => node.id === nodeId) as H3.Falls.Node;
  const stageType = NodeToStageType[nNode.type];
  const stage = oSource[stageType]
    ? oSource[stageType].find((item: H3.Falls.Stage) => item.id === nNode.id)
    : { id: nodeId };
  let validate = nodeValidate[stageType].rule(stage, oSource, level, validateType);
  if (validate !== true) {
    return validate;
  }
  source.nodes = source.nodes || [];
  source.nodes.push(nNode);
  if (oSource[stageType]) {
    source[stageType] = source[stageType] || [];
    source[stageType].push(oSource[stageType].find((item: H3.Falls.Stage) => item.id === nNode.id));
  }
  const edges: Array<H3.Falls.Edge> = oSource.edges.filter(
    (edge: H3.Falls.Edge) => edge.target === nodeId
  );
  if (edges && edges.length) {
    source.edges = source.edges || [];
    source.edges.push(...edges);
    edges.forEach((edge: H3.Falls.Edge) => {
      if (validate === true) {
        validate = generateNodeEdge(edge.source, source, oSource, validateType, ++level);
      }
    });
  }
  return validate;
}

/**
 * 获取节点的模型字段
 * @param nodeId
 * @param source
 */
function getNodeFiled(nodeId: string, source: H3.Falls.Source): Array<H3.Falls.NodeRelationField> {
  const targetEdges = source.edges.filter((edge: H3.Falls.Edge) => edge.target === nodeId);
  let node: H3.Falls.Node;
  const arr: Array<H3.Falls.NodeRelationField> = [];
  targetEdges.forEach((edge: H3.Falls.Edge) => {
    node = source.nodes.find((item: H3.Falls.Node) => item.id === edge.source) as H3.Falls.Node;
    arr.push({
      id: node.id,
      text: node.text,
      type: node.type,
      fields: Array.from(new Set(handleNodeFiled(node, source)))
    });
  });
  return arr;
}

function setFieldSource(
  stage: H3.Falls.Stage,
  sourceFields?: Array<H3.Falls.Field>,
  relations?: any,
  newRelations?: any
) {
  if (sourceFields && relations) {
    Object.keys(relations).forEach((key: string) => {
      if (relations[key][stage.id]) {
        sourceFields.forEach((filed: H3.Falls.Field) => {
          if (filed.id === key) {
            if (!newRelations) {
              if (filed.source) {
                filed.source.push(relations[key][stage.id]);
              }
            } else {
              relations[key] = Object.assign(
                relations[key],
                newRelations[relations[key][stage.id]]
              );
              delete relations[key][stage.id];
            }
          }
        });
      }
    });
  }
}

/**
 * 处理节点的字段
 * @param node
 * @param source
 * @param level
 * @param sourceFields
 * @param relations
 */
function handleNodeFiled(
  node: H3.Falls.Node,
  source: H3.Falls.Source,
  level = 1,
  sourceFields: Array<H3.Falls.Field> = [],
  relations?: any
): Array<H3.Falls.Field> {
  const stage = source[NodeToStageType[node.type]].find(
    (item: H3.Falls.Stage) => item.id === node.id
  );
  const fields: Array<H3.Falls.Field> = level === 1 ? sourceFields : [];
  const res = nodeValidate[NodeToStageType[node.type]].model(fields, stage, level);
  const nowRelations: any = res.relations;
  setFieldSource(stage, sourceFields, relations, nowRelations);
  const targetEdges = source.edges.filter((edge: H3.Falls.Edge) => edge.target === node.id);
  targetEdges.forEach((edge: H3.Falls.Edge) => {
    source.nodes = source.nodes || [];
    source.nodes.forEach((item: H3.Falls.Node) => {
      if (item.id === edge.source) {
        handleNodeFiled(item, source, res.level + 1, sourceFields, relations || nowRelations);
      }
    });
  });

  return fields;
}

/**
 * 处理节点校验
 * @param nodeId
 * @param oSource
 * @param validateType
 */
export function handleNodeValidate(
  nodeId: string,
  oSource: H3.Falls.Source,
  validateType = "default"
): H3.Falls.NodeRelationResult {
  const source: H3.Falls.Source | any = {};
  defValidateType = validateType; // 校验类型 nodeValidate 验证时候需要
  const validateError: H3.Falls.NodeValidateMessage | boolean = generateNodeEdge(
    nodeId,
    source,
    oSource,
    defValidateType
  );
  if (validateError === true) {
    Object.keys(source).forEach((key: string) => {
      if (!source[key].length) {
        delete source[key];
      }
    });
    return {
      code: "success",
      ret: source
    };
  } else {
    return {
      code: "fail",
      ret: validateError as H3.Falls.NodeValidateMessage
    };
  }
}

/**
 * 获取节点模型
 * @param nodeId
 * @param source
 */
export function getNodeModel(
  nodeId: string,
  source: H3.Falls.Source
): Array<H3.Falls.NodeRelationField> {
  return getNodeFiled(nodeId, source);
}
/**
 * 清除当前节点后面连接节点的配置
 * @param node
 * @param source
 * @param isStartNext
 */
export function clearStageSetting(
  node: H3.Falls.Node,
  source: H3.Falls.Source,
  isStartNext: boolean = false
): H3.Falls.Source {
  const tmpSource = source;
  const stageType = NodeToStageType[node.type];
  if (!isStartNext && stageType !== NodeType.OUTPUT) {
    const settingIndex = tmpSource[stageType].findIndex((item: any) => {
      return item.id === node.id;
    });
    const tmpStage = {
      id: node.id
    };
    if (settingIndex > -1) {
      tmpSource[stageType].splice(settingIndex, 1, tmpStage);
    }
  }
  const sourceEdges = tmpSource.edges.filter((edge: H3.Falls.Edge) => edge.source === node.id);
  sourceEdges.forEach((edge: H3.Falls.Edge) => {
    const tmpNode = tmpSource.nodes.find(
      (item: H3.Falls.Node) => item.id === edge.target
    ) as H3.Falls.Node;
    if (tmpNode) {
      clearStageSetting(tmpNode, tmpSource);
    }
  });
  return {
    nodes: tmpSource.nodes, // 流程节点集合
    edges: tmpSource.edges, // 流程关系
    models: tmpSource.models, // 模型
    merges: tmpSource.merges, // 追加合并
    relations: tmpSource.relations, // 关联
    computes: tmpSource.computes // 字段设置
  };
}

/**
 * 校验模型异常情况
 * @param source
 * @param modelInfoList
 */
export function handleModelValidate(
  source: H3.Falls.Source,
  modelInfoList: Array<H3.DataSourceAPI.Model>
): H3.Falls.ModelRelationResult {
  let isFieldMiss: boolean = false;
  let isFormMiss: boolean = false;
  const errorIds: Array<string> = [];
  let copySource = JSON.parse(JSON.stringify(source));
  copySource.models.forEach((model: H3.Falls.Model) => {
    let subFields: Array<H3.Falls.Field> = [];
    let mainFields: Array<H3.Falls.Field> = [];
    let sub: H3.Falls.ModelGroup | null = null;
    const tmpNode = source.nodes.find((item: H3.Falls.Field) => {
      return item.id === model.id;
    });
    const stageModel = modelInfoList.find((item: H3.DataSourceAPI.Model) => {
      return model.main.schemaCode === item.main.schemaCode;
    });
    if (stageModel) {
      mainFields = model.main.fields.filter((item: H3.Falls.Field) => {
        const tmpField = (stageModel as any).main.fields.find((field: H3.DataSourceAPI.Field) => {
          return field.name === item.id;
        });
        if (!tmpField) {
          isFieldMiss = true;
          errorIds.push(model.id);
          copySource = clearStageSetting(tmpNode as any, copySource, true);
        }
        return tmpField;
      });
      model.main.fields = mainFields;
      if (model.sub) {
        if (stageModel.subs && stageModel.subs.length) {
          const tmpSub = stageModel.subs.find((item: H3.DataSourceAPI.ModelGroup) => {
            return item.schemaCode === (model.sub as any).schemaCode;
          });
          if (tmpSub) {
            subFields = model.sub.fields.filter((item: H3.Falls.Field) => {
              const tmpField = (tmpSub as any).fields.find((field: H3.DataSourceAPI.Field) => {
                return field.name === item.id;
              });
              if (!tmpField) {
                isFieldMiss = true;
                errorIds.push(model.id);
                copySource = clearStageSetting(tmpNode as any, copySource, true);
              }
              return tmpField;
            });
          }
          model.sub.fields = subFields;
        } else {
          isFieldMiss = true;
          sub = null;
        }
      }
    } else {
      isFormMiss = true;
      errorIds.push(model.id);
      copySource = clearStageSetting(tmpNode as any, copySource);
    }
  });

  if (isFormMiss) {
    return {
      code: "fail",
      res: {
        nodeIds: errorIds,
        message: {
          key: ModelErrorCode.MISSFORM,
          message: ModelErrorMessage.MISSFORM
        }
      },
      source: copySource
    };
  }

  if (isFieldMiss) {
    return {
      code: "fail",
      res: {
        nodeIds: errorIds,
        message: {
          key: ModelErrorCode.MISSFIELD,
          message: ModelErrorMessage.MISSFIELD
        }
      },
      source: copySource
    };
  }
  return {
    code: "success",
    source: source
  };
}

export default {
  handleNodeValidate,
  getNodeModel,
  handleModelValidate,
  clearStageSetting
};
