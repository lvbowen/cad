import Mock from 'mockjs';
import {AnnotationDetails, Attachment, PictureAnnotations} from "../../type";
export const exampleData = {
  data:  Mock.mock({
    'materialInfo': {
      'types|1-10': [
        {
          'type': function() {
            //@ts-ignore
            return '111'
          },
          'totalDesignValue|100-1000': 0,
          'registers|1-20': [
            {
              code: '',
              'designValue|1-1000': 1,
              materialName: '112',
              payType: '1',
              'registerId|1-1000': 1,
              specification: function() {
                //@ts-ignore
                return this.registerId<200?'111':this.registerId<500?'222':'333'
              },
              'totalQuit|1-1000': 1,
              'totalSave|1-1000': 1,
              unit: '',
            }
          ]
        }
      ],
    },
    'designTask': {
      'id|1-100': 1,
      professionName: '专业任务任务名称任务名称专业任务任务名称任务名称专业任务任务名称任务名称',
      designFlag:'需要',
      proofreadLevel: '技术总负责人',
      modelType: '市政建筑',
      countersignFlag: '需要',
      projectManagerAudit: '需要',
      designer: '李四',
      designGuider: '李四',
      auditor: '李四',
      checker: '李四',
      taskTime: '2023.04.02',
      planStartTime: '2023.04.02',
      planEndTime: '2023.04.02',
      planDuration: '24',
      workContent:'文字描述文字描述文字描述文字描述文字文字描述文字描述描述文字描述文字描述文字描述文字描述文字 文字描述文字描述描述文字描述文字描述文字描述文字描述文字文字描述文字描述描述',
      'attachmentList|1-10':[
        {
          'id|1-100': 1,
          refId: '',
          name: '文件名称.jpeg',
          fileSize: '12MB',
          traceId: '',
        }
      ]
    },
    'annotation': {
        'id|1-10': 1,
        'annotationList|5-10': [
          {
            'id|1-1000': 1,
            annotationName: '批注标题',
            annotationDesc: '批注批注说明批注说明批注说明批注说明批注说明批注说明批注说明批注说明批注说明批注说明批注说明批注说明批注说明批注说明说明',
            createdTime: '2022.03.25',
            fileName: '成果文件名称.jpeg',
            'pictureAnnotations|3-10': [
              {
                'refId|1-1000': 1,
                downloadUrl: '',
                previewUrl: "data:image/svg+xml;charset=utf-8,%3Csvg%20viewBox%3D'0%200%20120%20120'%20xmlns%3D'http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg'%20xmlns%3Axlink%3D'http%3A%2F%2Fwww.w3.org%2F1999%2Fxlink'%3E%3Cdefs%3E%3Cline%20id%3D'l'%20x1%3D'60'%20x2%3D'60'%20y1%3D'7'%20y2%3D'27'%20stroke%3D'%236c6c6c'%20stroke-width%3D'11'%20stroke-linecap%3D'round'%2F%3E%3C%2Fdefs%3E%3Cg%3E%3Cuse%20xlink%3Ahref%3D'%23l'%20opacity%3D'.27'%2F%3E%3Cuse%20xlink%3Ahref%3D'%23l'%20opacity%3D'.27'%20transform%3D'rotate(30%2060%2C60)'%2F%3E%3Cuse%20xlink%3Ahref%3D'%23l'%20opacity%3D'.27'%20transform%3D'rotate(60%2060%2C60)'%2F%3E%3Cuse%20xlink%3Ahref%3D'%23l'%20opacity%3D'.27'%20transform%3D'rotate(90%2060%2C60)'%2F%3E%3Cuse%20xlink%3Ahref%3D'%23l'%20opacity%3D'.27'%20transform%3D'rotate(120%2060%2C60)'%2F%3E%3Cuse%20xlink%3Ahref%3D'%23l'%20opacity%3D'.27'%20transform%3D'rotate(150%2060%2C60)'%2F%3E%3Cuse%20xlink%3Ahref%3D'%23l'%20opacity%3D'.37'%20transform%3D'rotate(180%2060%2C60)'%2F%3E%3Cuse%20xlink%3Ahref%3D'%23l'%20opacity%3D'.46'%20transform%3D'rotate(210%2060%2C60)'%2F%3E%3Cuse%20xlink%3Ahref%3D'%23l'%20opacity%3D'.56'%20transform%3D'rotate(240%2060%2C60)'%2F%3E%3Cuse%20xlink%3Ahref%3D'%23l'%20opacity%3D'.66'%20transform%3D'rotate(270%2060%2C60)'%2F%3E%3Cuse%20xlink%3Ahref%3D'%23l'%20opacity%3D'.75'%20transform%3D'rotate(300%2060%2C60)'%2F%3E%3Cuse%20xlink%3Ahref%3D'%23l'%20opacity%3D'.85'%20transform%3D'rotate(330%2060%2C60)'%2F%3E%3C%2Fg%3E%3C%2Fsvg%3E"
              }
            ],
            instanceName: '校核',
            thumbnail: function (){
              //@ts-ignore
              return this.id>500?'data:image/png;base64,/9j/4AAQSkZJRgABAgAAAQABAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/2wBDAQkJCQwLDBgNDRgyIRwhMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjL/wAARCAAoACgDASIAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/8QAHwEAAwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoL/8QAtREAAgECBAQDBAcFBAQAAQJ3AAECAxEEBSExBhJBUQdhcRMiMoEIFEKRobHBCSMzUvAVYnLRChYkNOEl8RcYGRomJygpKjU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6goOEhYaHiImKkpOUlZaXmJmaoqOkpaanqKmqsrO0tba3uLm6wsPExcbHyMnK0tPU1dbX2Nna4uPk5ebn6Onq8vP09fb3+Pn6/9oADAMBAAIRAxEAPwD5/ora8OeFdW8VXclvpduHMQDSSO21EB6ZPv6e1eleFvg1fWOt2l9rV3ZvBA4k8iEsxcjkAkgDGcZ61y18ZRo3Upa9jSFKc9kYH/CnNe/4R7+0vOg+1eX5v2LB34xnbnpu9v1rzqvsmvG/FPwZvb7Wru+0a8tI4J3MnkTbl2E8kAgHjOcdPSvNwWa80mq7t2/yOirhrJOB41RW14k8Kat4Uu47fVIFTzQWjkRtyOB1wfb096K9qE4zjzRd0cjTTszp/hX40tfC+p3FnqA22d8UzP8A88mGcE/7Jzz6V9DI6yIrowZGGVZTkEeor44r6v8ACFq1l4N0a3cnclnFuz2JUEj9a8DOKEItVVuztws21y9japrusaM7sFRRlmY4AHqadWN4utWvfB+sW6Ehns5duPXaSBXjQSlJJnW3ZXPEPin41tfFGp29np43WdiXxP8A89WOMkf7PHHrRXn1Ffa0aMaNNU47I8icnOXMwr0ew+Mut2GgQ6ctpayTwxiJLl852gYGV7nHf9KKKKtCnWSVRXsEZyj8LOWPjXxKdW/tP+2rv7Vn72/5cemz7uPbGK6i++Meu32gS6c9rapPNGYnukBB2kYOF6A47/pRRUzwtGbTcVoNVJrZnnNFFFbkH//Z' :''
            }
          }
        ]
    },
    'annotationDetails' : {
      'id|1-1000': 1,
      annotationName: '批注标题批注标题',
      annotationDesc: '批注说明批注说明批注说明批注说明批注说明批注说明批注说明批注说明批注说明批注说明批注说明批注说明批注说明批注说明批注说明批注说明批注说明',
      createdTime: '2022.03.25',
      fileName: '成果文件名称.jpeg',
      'pictureAnnotations|3-10': [
        {
          'refId|1-1000': 1,
          downloadUrl: '',
          previewUrl: "data:image/svg+xml;charset=utf-8,%3Csvg%20viewBox%3D'0%200%20120%20120'%20xmlns%3D'http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg'%20xmlns%3Axlink%3D'http%3A%2F%2Fwww.w3.org%2F1999%2Fxlink'%3E%3Cdefs%3E%3Cline%20id%3D'l'%20x1%3D'60'%20x2%3D'60'%20y1%3D'7'%20y2%3D'27'%20stroke%3D'%236c6c6c'%20stroke-width%3D'11'%20stroke-linecap%3D'round'%2F%3E%3C%2Fdefs%3E%3Cg%3E%3Cuse%20xlink%3Ahref%3D'%23l'%20opacity%3D'.27'%2F%3E%3Cuse%20xlink%3Ahref%3D'%23l'%20opacity%3D'.27'%20transform%3D'rotate(30%2060%2C60)'%2F%3E%3Cuse%20xlink%3Ahref%3D'%23l'%20opacity%3D'.27'%20transform%3D'rotate(60%2060%2C60)'%2F%3E%3Cuse%20xlink%3Ahref%3D'%23l'%20opacity%3D'.27'%20transform%3D'rotate(90%2060%2C60)'%2F%3E%3Cuse%20xlink%3Ahref%3D'%23l'%20opacity%3D'.27'%20transform%3D'rotate(120%2060%2C60)'%2F%3E%3Cuse%20xlink%3Ahref%3D'%23l'%20opacity%3D'.27'%20transform%3D'rotate(150%2060%2C60)'%2F%3E%3Cuse%20xlink%3Ahref%3D'%23l'%20opacity%3D'.37'%20transform%3D'rotate(180%2060%2C60)'%2F%3E%3Cuse%20xlink%3Ahref%3D'%23l'%20opacity%3D'.46'%20transform%3D'rotate(210%2060%2C60)'%2F%3E%3Cuse%20xlink%3Ahref%3D'%23l'%20opacity%3D'.56'%20transform%3D'rotate(240%2060%2C60)'%2F%3E%3Cuse%20xlink%3Ahref%3D'%23l'%20opacity%3D'.66'%20transform%3D'rotate(270%2060%2C60)'%2F%3E%3Cuse%20xlink%3Ahref%3D'%23l'%20opacity%3D'.75'%20transform%3D'rotate(300%2060%2C60)'%2F%3E%3Cuse%20xlink%3Ahref%3D'%23l'%20opacity%3D'.85'%20transform%3D'rotate(330%2060%2C60)'%2F%3E%3C%2Fg%3E%3C%2Fsvg%3E"
        },
        {
          'refId|1-1000': 1,
          downloadUrl: '',
          previewUrl: 'data:image/png;base64,/9j/4AAQSkZJRgABAgAAAQABAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/2wBDAQkJCQwLDBgNDRgyIRwhMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjL/wAARCAAoACgDASIAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/8QAHwEAAwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoL/8QAtREAAgECBAQDBAcFBAQAAQJ3AAECAxEEBSExBhJBUQdhcRMiMoEIFEKRobHBCSMzUvAVYnLRChYkNOEl8RcYGRomJygpKjU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6goOEhYaHiImKkpOUlZaXmJmaoqOkpaanqKmqsrO0tba3uLm6wsPExcbHyMnK0tPU1dbX2Nna4uPk5ebn6Onq8vP09fb3+Pn6/9oADAMBAAIRAxEAPwD5/ora8OeFdW8VXclvpduHMQDSSO21EB6ZPv6e1eleFvg1fWOt2l9rV3ZvBA4k8iEsxcjkAkgDGcZ61y18ZRo3Upa9jSFKc9kYH/CnNe/4R7+0vOg+1eX5v2LB34xnbnpu9v1rzqvsmvG/FPwZvb7Wru+0a8tI4J3MnkTbl2E8kAgHjOcdPSvNwWa80mq7t2/yOirhrJOB41RW14k8Kat4Uu47fVIFTzQWjkRtyOB1wfb096K9qE4zjzRd0cjTTszp/hX40tfC+p3FnqA22d8UzP8A88mGcE/7Jzz6V9DI6yIrowZGGVZTkEeor44r6v8ACFq1l4N0a3cnclnFuz2JUEj9a8DOKEItVVuztws21y9japrusaM7sFRRlmY4AHqadWN4utWvfB+sW6Ehns5duPXaSBXjQSlJJnW3ZXPEPin41tfFGp29np43WdiXxP8A89WOMkf7PHHrRXn1Ffa0aMaNNU47I8icnOXMwr0ew+Mut2GgQ6ctpayTwxiJLl852gYGV7nHf9KKKKtCnWSVRXsEZyj8LOWPjXxKdW/tP+2rv7Vn72/5cemz7uPbGK6i++Meu32gS6c9rapPNGYnukBB2kYOF6A47/pRRUzwtGbTcVoNVJrZnnNFFFbkH//Z'
        }
      ],
      instanceName: '校核',
      thumbnail: function (){
        //@ts-ignore
        return this.id>500?'data:image/png;base64,/9j/4AAQSkZJRgABAgAAAQABAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/2wBDAQkJCQwLDBgNDRgyIRwhMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjL/wAARCAAoACgDASIAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/8QAHwEAAwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoL/8QAtREAAgECBAQDBAcFBAQAAQJ3AAECAxEEBSExBhJBUQdhcRMiMoEIFEKRobHBCSMzUvAVYnLRChYkNOEl8RcYGRomJygpKjU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6goOEhYaHiImKkpOUlZaXmJmaoqOkpaanqKmqsrO0tba3uLm6wsPExcbHyMnK0tPU1dbX2Nna4uPk5ebn6Onq8vP09fb3+Pn6/9oADAMBAAIRAxEAPwD5/ora8OeFdW8VXclvpduHMQDSSO21EB6ZPv6e1eleFvg1fWOt2l9rV3ZvBA4k8iEsxcjkAkgDGcZ61y18ZRo3Upa9jSFKc9kYH/CnNe/4R7+0vOg+1eX5v2LB34xnbnpu9v1rzqvsmvG/FPwZvb7Wru+0a8tI4J3MnkTbl2E8kAgHjOcdPSvNwWa80mq7t2/yOirhrJOB41RW14k8Kat4Uu47fVIFTzQWjkRtyOB1wfb096K9qE4zjzRd0cjTTszp/hX40tfC+p3FnqA22d8UzP8A88mGcE/7Jzz6V9DI6yIrowZGGVZTkEeor44r6v8ACFq1l4N0a3cnclnFuz2JUEj9a8DOKEItVVuztws21y9japrusaM7sFRRlmY4AHqadWN4utWvfB+sW6Ehns5duPXaSBXjQSlJJnW3ZXPEPin41tfFGp29np43WdiXxP8A89WOMkf7PHHrRXn1Ffa0aMaNNU47I8icnOXMwr0ew+Mut2GgQ6ctpayTwxiJLl852gYGV7nHf9KKKKtCnWSVRXsEZyj8LOWPjXxKdW/tP+2rv7Vn72/5cemz7uPbGK6i++Meu32gS6c9rapPNGYnukBB2kYOF6A47/pRRUzwtGbTcVoNVJrZnnNFFFbkH//Z' :''
      },
      fileType: '图纸',
      checker: '张三',
      checkTime: '2022.03.25'
    },
    'todoWorks|1-100': [
      {
        'id': 'e1eac70ec2d04d51af02ba836be71819',
        checkerName: 'checkerName',
        engineeringName: 'engineeringName',
        professionName: 'professionName',
        professionTaskName: '中澳速度佛啊十大佛i阿松地法哦i士大夫文案微软',
        createrName: 'createrName',
        createdTime: 'createdTime',
        workflowNode:'workflowNode'
      }
    ]
  })
}
