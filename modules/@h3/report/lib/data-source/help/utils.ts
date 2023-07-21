/**
 * 查找当前节点的上一层节点
 * @param source
 * @param node
 */
export function getLastNode(source: H3.Falls.Source,node: H3.Falls.Node) {
  const lastNodeList:Array<any> = [];
  source.nodes.forEach((item:H3.Falls.Node) => {
    source.edges.forEach((edge:H3.Falls.Edge)=>{
      if(edge.target === node.id && edge.source === item.id) {
        lastNodeList.push(item);
      }
    })
  });
  return lastNodeList;
}

/**
 * 查找当前节点前面关联的所有节点
 * @param source
 * @param node
 * @param beforeList 
 */
export function getBeforeNode(source: H3.Falls.Source,node: H3.Falls.Node,beforeList) {
  source.nodes.forEach((item:H3.Falls.Node) => {
    source.edges.forEach((edge:H3.Falls.Edge)=>{
      if(edge.target === node.id && edge.source === item.id) {
        beforeList.push(item);
        getBeforeNode(source,item,beforeList);
      }
    })
  });
  return beforeList
}

/**
 * 获取节点字段集合（关联节点的字段集合会过滤被合并字段）
 * @param source
 * @param node
 * @param fieldList 自定义字段集合列表
 * @param mergeList 被合并字段id集合
 */
export function getNodeField(source: H3.Falls.Source,node: H3.Falls.Node,fieldList:Array<any>=[],mergeList?: Array<string>) {
  switch (node.type) {
      case 'input':
        const model = source.models.find((param)=>{
          return  param.id === node.id
        });
        if(model) {
          const tmpFields = (model.sub? model.main.fields.concat(model.sub.fields) : model.main.fields).map((field: H3.Falls.Field)=>{
            return {
              id: `${field.id}#${node.id}`,
              text: field.text,
              type: field.type
            }
         });
          tmpFields.forEach((item)=> {
            if(mergeList) {
              mergeList.forEach((param) => {
                if(param ===  item.id) {
                  fieldList.push(item);
                }
              });
            } else {
              fieldList.push(item);
            }
          })
        }
        break;
      case 'union':
        const merge = source.merges.find((param)=>{
          return  param.id === node.id
        });
        // 先判断有没有设置
        if(merge) {
          const tmpFields = merge.groups.map((field: H3.Falls.DynamicField) => {
            return {
              id: `${field.id}`,
              text: field.text,
              type: field.type
            }
          });
          fieldList.splice(0,fieldList.length-1,...tmpFields);
        }
        break;
      case 'join':
        const relation = source.relations.find((param)=>{
          return  param.id === node.id
        });
        let mergeFieldList:Array<string> = [];
        // todo 
        getLastNode(source,node).forEach((item,index) => {
          if(relation) {
          // 被合并的字段的集合
            if(relation.join ==="right" && index === 0) {
              mergeFieldList = relation.groups.map(param=> {
                return param.source[item.id]
              })
            } else {
              mergeFieldList = relation.groups.map(param=> {
                return param.source[item.id]
              })
            }
        }
          getNodeField(source,item,fieldList,mergeFieldList);
        });
        break;
      case 'group':
        break; // 分组汇总
      case 'filter':
        break;
      default:
    }
  return fieldList;
}




