# 一.Socket接口
## 1.Socket开启连接
``` js
{
    "data": "websocket_is_open"
}
```

# 二.模型接口
## 1.模型定位
``` js
{
    "methodName": "Model_Positioning",
    "data": {
        "code": "00001.00001.00001.00001.00001.00001"
    }
}
```

## 2.模型显隐
``` js
{
    "methodName": "Model_Visuality",
    "data": {
        "code": "00001.00001.00001.00003",
        "isHidden": 1
    }
}
```

## 3.模型高亮
``` js
{
    "methodName": "Model_Highlight",
    "data": {
        "code": "00001.00001.00001.00001.00001.00003",
        "isHigh": 1
    }
}
```

## 4.点击模型获得数据
``` js
{
    "data": {
        "code": ""
    }
}
```

## 5.模型取消选择
``` js
{
    "methodName": "Model_DeselectItem",
}
```

# 三.设备接口
## 1.设备展示
``` js
{
    "methodName": "Device_Show",
    "data": {
        "deviceType": 0,
        "deviceID": "00001"
    }
}
```

## 2.点击设备图标获得数据
``` js
{
    "data": {
        "deviceType": 0,
        "deviceID": "10000"
    }
}
```

## 3.设备定位
``` js
{
    "methodName": "Device_Positioning",
    "data": {
        "deviceType": 0,
        "deviceID": "00001"
    }
}
```

# 四.点数据接口
## 1.点击获得点数据
``` js
{
    "pointdata": 
    {
        "code": "",
        "position":
        {
            "x":1,
            "y":1,
            "z":1
        }
    }
}
```

## 2.点数据功能开启
``` js
{
    "methodName": "PointData_Toggle",
    "data":{
        "isOn": 1
     }
}
```

## 3.图标展示
``` js
{
    "methodName": "Icon_Show",
    "data": {
        "id":"ef9e54b3f1c1446e98e70700c039a13e",
        "iconPath":"https://standard.wisdombim.com.cn/api/api/aliyun/download?refId=05a43e4364424a26a7210ea9ba2bd5a5&name=已解决",
        "projectName":"黄石新港",
        "schemaCode":"HSGK_wtgl",
        "type":"coordinate",
        "status":null,
        "longitude":-25,
        "latitude":2097.565,
        "altitude":326.5826,
        "iconHeight":80,
        "iconWidth":40,
        "iconRotate":0,
        "name":"问题管理",
        "nameColor":"rgba(0,205,0,1)",
        "nameSize":50,
        "near":100,
        "nearValue":0.6,
        "far":3000,
        "farValue":0.8,
        "drag":0,
        "iconName":"已解决",
        "iconCode":"yjj",
        "iconType":"jpg",
        "base64ImageStr":"https://standard.wisdombim.com.cn/api/api/aliyun/download?refId=05a43e4364424a26a7210ea9ba2bd5a5&name=已解决",
        "refId":null,
        "imgHeight":80,
        "imgWidth":40,
        "imgRotate":0,
        "textName":null,
        "fontSize":50,
        "textColor":"rgba(0,205,0,1)"
    }
}
```

## 4.图标定位
``` js
{
    "methodName": "Icon_Positioning",
    "data": {
        "id":"ef9e54b3f1c1446e98e70700c039a13e",
        "iconPath":"https://standard.wisdombim.com.cn/api/api/aliyun/download?refId=05a43e4364424a26a7210ea9ba2bd5a5&name=已解决",
        "projectName":"黄石新港",
        "schemaCode":"HSGK_wtgl",
        "type":"coordinate",
        "status":null,
        "longitude":-25,
        "latitude":2097.565,
        "altitude":326.5826,
        "iconHeight":80,
        "iconWidth":40,
        "iconRotate":0,
        "name":"问题管理",
        "nameColor":"rgba(0,205,0,1)",
        "nameSize":50,
        "near":100,
        "nearValue":0.6,
        "far":3000,
        "farValue":0.8,
        "drag":0,
        "iconName":"已解决",
        "iconCode":"yjj",
        "iconType":"jpg",
        "base64ImageStr":"https://standard.wisdombim.com.cn/api/api/aliyun/download?refId=05a43e4364424a26a7210ea9ba2bd5a5&name=已解决",
        "refId":null,
        "imgHeight":80,
        "imgWidth":40,
        "imgRotate":0,
        "textName":null,
        "fontSize":50,
        "textColor":"rgba(0,205,0,1)"
    }
}
```

## 5.点击图标返回数据
``` js
{
    "icondata":
     {
        "id":"ef9e54b3f1c1446e98e70700c039a13e",
        "iconPath":"https://standard.wisdombim.com.cn/api/api/aliyun/download?refId=05a43e4364424a26a7210ea9ba2bd5a5&name=已解决",
        "projectName":"黄石新港",
        "schemaCode":"HSGK_wtgl",
        "type":"coordinate",
        "status":null,
        "longitude":115.25629576688999,
        "latitude":30.132679215420776,
        "altitude":18.136299518456536,
        "iconHeight":80,
        "iconWidth":40,
        "iconRotate":0,
        "name":"问题管理",
        "nameColor":"rgba(0,205,0,1)",
        "nameSize":50,
        "near":100,
        "nearValue":0.6,
        "far":3000,
        "farValue":0.8,
        "drag":0,
        "iconName":"已解决",
        "iconCode":"yjj",
        "iconType":"jpg",
        "base64ImageStr":"https://standard.wisdombim.com.cn/api/api/aliyun/download?refId=05a43e4364424a26a7210ea9ba2bd5a5&name=已解决",
        "refId":null,
        "imgHeight":80,
        "imgWidth":40,
        "imgRotate":0,
        "textName":null,
        "fontSize":50,
        "textColor":"rgba(0,205,0,1)"
    }
}
```

## 6.清除图标
``` js
{
    "methodName": "Icon_Clear"
    "data": {
        "id":"ef9e54b3f1c1446e98e70700c039a13e",
        "iconPath":"https://standard.wisdombim.com.cn/api/api/aliyun/download?refId=05a43e4364424a26a7210ea9ba2bd5a5&name=已解决",
        "projectName":"黄石新港",
        "schemaCode":"HSGK_wtgl",
        "type":"coordinate",
        "status":null,
        "longitude":-25,
        "latitude":2097.565,
        "altitude":326.5826,
        "iconHeight":80,
        "iconWidth":40,
        "iconRotate":0,
        "name":"问题管理",
        "nameColor":"rgba(0,205,0,1)",
        "nameSize":50,
        "near":100,
        "nearValue":0.6,
        "far":3000,
        "farValue":0.8,
        "drag":0,
        "iconName":"已解决",
        "iconCode":"yjj",
        "iconType":"jpg",
        "base64ImageStr":"https://standard.wisdombim.com.cn/api/api/aliyun/download?refId=05a43e4364424a26a7210ea9ba2bd5a5&name=已解决",
        "refId":null,
        "imgHeight":80,
        "imgWidth":40,
        "imgRotate":0,
        "textName":null,
        "fontSize":50,
        "textColor":"rgba(0,205,0,1)"
    }
}
```

## 7.显示视图栏
``` js
{
    "methodName": "CameraView_Toggle",
    "data": {
        "isOn": 1
    }
}
```

# 五.标注接口（未定）
## 1.a打开在线测绘弹窗_网页端传客户端
``` js
{
    "methodName": "OnlineMapping_Toggle",
    "data": {
        "isOn": 1
    }
}
```

## 1.b打开在线测绘弹窗_客户端传网页端
``` js
{
    "onlinemapping_Toggle":1
}
```

## 2.图片标注展示
``` js
{
    "methodName":"ImageMark_Show",
    "data":{
        "id": "30013dcc-af16-4d4e-a6c9-3f8c8f63a12f",
        "symbolId": "4856b17a624a4876b5be380cb0e703b6",
        "modelName": "点6",
        "symbolName": "点6",
        "symbolPath": "js/ctesi-bim/data/draw-online/drawHandler/point/点6.png",
        "pitch": null,
        "roll": null,
        "heading": null,
        "scale": null,
        "colorPicker": null,
        "longitude": -4.3,
        "latitude": 2106,
        "altitude": 343,
        "position": null,
        "direction": null,
        "up": null,
        "projectName": "芜湖LNG接收转运站码头工程(二期)",
        "code": "MARKER_00060006",
        "geometryType": "MARKER",
        "optionConfig": "{\"width\":\"52px\",\"height\":\"52px\",\"isShowIcon\":true,\"scale\":1,\"rotation\":0,\"verticalOrigin\":1,\"scaleByDistance\":{\"near\":0,\"nearValue\":1,\"far\":6000,\"farValue\":1.2},\"distanceDisplayCondition\":{\"_near\":0,\"_far\":6000},\"fontStyle\":{\"fontSize\":\"20px\",\"fillColor\":{\"red\":1,\"green\":1,\"blue\":1,\"alpha\":1}}}",
        "geoPositions": null,
        "listDesc": null
    }
}
```

## 3.图片标注准备创建
``` js
{
    "methodName": "ImageMark_Create_Ready",
    "data": {
        "parentId": "57fc33471a914a41b60d788590a2ccf3",
        "id": "4856b17a624a4876b5be380cb0e703b6",
        "symbolName": "点6",
        "symbolDesc": "点6",
        "symbolPath": "/point/点6.png",
        "thumbnail": "js/ctesi-bim/data/draw-online/drawHandler/point/点6.png",
        "code": "MARKER_00060006",
        "width": "52px",
        "height": "52px",
        "horizontalOrigin": "CENTER",
        "geometryType": "MARKER",
        "inputText": false,
        "orderIndex": 1,
        "enable": true,
        "symbolId": "4856b17a624a4876b5be380cb0e703b6"
    }
}
```

## 4.点击创建图片标注
``` js
{
    "imagemark_positiondata":{
        "parentId": "57fc33471a914a41b60d788590a2ccf3",
        "id": "4856b17a624a4876b5be380cb0e703b6",
        "symbolName": "点6",
        "symbolDesc": "点6",
        "symbolPath": "/point/点6.png",
        "thumbnail": "js/ctesi-bim/data/draw-online/drawHandler/point/点6.png",
        "code": "MARKER_00060006",
        "width": "52px",
        "height": "52px",
        "horizontalOrigin": "CENTER",
        "geometryType": "MARKER",
        "inputText": false,
        "orderIndex": 1,
        "enable": true,
        "symbolId": "4856b17a624a4876b5be380cb0e703b6",
        "longitude": 118.10051993,
        "latitude": 31.21390062,
        "altitude": 8.76924002
    }
}
```

## 5.图片标注定位
``` js
{
    "methodName":"ImageMark_Positioning",
    "data":{
        "id": "30013dcc-af16-4d4e-a6c9-3f8c8f63a12f",
        "symbolId": "4856b17a624a4876b5be380cb0e703b6",
        "modelName": "点6",
        "symbolName": "点6",
        "symbolPath": "js/ctesi-bim/data/draw-online/drawHandler/point/点6.png",
        "pitch": null,
        "roll": null,
        "heading": null,
        "scale": null,
        "colorPicker": null,
        "longitude": 118.10051993,
        "latitude": 31.21390062,
        "altitude": 8.76924002,
        "position": null,
        "direction": null,
        "up": null,
        "projectName": "芜湖LNG接收转运站码头工程(二期)",
        "code": "MARKER_00060006",
        "geometryType": "MARKER",
        "optionConfig": "{\"width\":\"52px\",\"height\":\"52px\",\"isShowIcon\":true,\"scale\":1,\"rotation\":0,\"verticalOrigin\":1,\"scaleByDistance\":{\"near\":0,\"nearValue\":1,\"far\":6000,\"farValue\":1.2},\"distanceDisplayCondition\":{\"_near\":0,\"_far\":6000},\"fontStyle\":{\"fontSize\":\"20px\",\"fillColor\":{\"red\":1,\"green\":1,\"blue\":1,\"alpha\":1}}}",
        "geoPositions": null,
        "listDesc": null
    }
}
```

## 6.点击图片标注返回数据(0)
``` js
{
    "imagemark_data_0":{
        "parentId": "57fc33471a914a41b60d788590a2ccf3",
        "id": "4856b17a624a4876b5be380cb0e703b6",
        "symbolName": "点6",
        "symbolDesc": "点6",
        "symbolPath": "/point/点6.png",
        "thumbnail": "js/ctesi-bim/data/draw-online/drawHandler/point/点6.png",
        "code": "MARKER_00060006",
        "width": "52px",
        "height": "52px",
        "horizontalOrigin": "CENTER",
        "geometryType": "MARKER",
        "inputText": false,
        "orderIndex": 1,
        "enable": true,
        "symbolId": "4856b17a624a4876b5be380cb0e703b6",
        "longitude": 118.10051993,
        "latitude": 31.21390062,
        "altitude": 8.76924002
    }
}
```

## 7.点击图片标注返回数据(1)
``` js
{
    "imagemark_data_1":{
        "id": "30013dcc-af16-4d4e-a6c9-3f8c8f63a12f",
        "symbolId": "4856b17a624a4876b5be380cb0e703b6",
        "modelName": "点6",
        "symbolName": "点6",
        "symbolPath": "js/ctesi-bim/data/draw-online/drawHandler/point/点6.png",
        "pitch": null,
        "roll": null,
        "heading": null,
        "scale": null,
        "colorPicker": null,
        "longitude": 118.10051993,
        "latitude": 31.21390062,
        "altitude": 8.76924002,
        "position": null,
        "direction": null,
        "up": null,
        "projectName": "芜湖LNG接收转运站码头工程(二期)",
        "code": "MARKER_00060006",
        "geometryType": "MARKER",
        "optionConfig": "{\"width\":\"52px\",\"height\":\"52px\",\"isShowIcon\":true,\"scale\":1,\"rotation\":0,\"verticalOrigin\":1,\"scaleByDistance\":{\"near\":0,\"nearValue\":1,\"far\":6000,\"farValue\":1.2},\"distanceDisplayCondition\":{\"_near\":0,\"_far\":6000},\"fontStyle\":{\"fontSize\":\"20px\",\"fillColor\":{\"red\":1,\"green\":1,\"blue\":1,\"alpha\":1}}}",
        "geoPositions": null,
        "listDesc": null
    }
}
```

## 8.删除指定图标标注
``` js
{
    "methodName":"ImageMark_Delete",
    "data":{
        "id": "30013dcc-af16-4d4e-a6c9-3f8c8f63a12f",
        "symbolId": "4856b17a624a4876b5be380cb0e703b6",
        "modelName": "点6",
        "symbolName": "点6",
        "symbolPath": "js/ctesi-bim/data/draw-online/drawHandler/point/点6.png",
        "pitch": null,
        "roll": null,
        "heading": null,
        "scale": null,
        "colorPicker": null,
        "longitude": 118.10051993,
        "latitude": 31.21390062,
        "altitude": 8.76924002,
        "position": null,
        "direction": null,
        "up": null,
        "projectName": "芜湖LNG接收转运站码头工程(二期)",
        "code": "MARKER_00060006",
        "geometryType": "MARKER",
        "optionConfig": "{\"width\":\"52px\",\"height\":\"52px\",\"isShowIcon\":true,\"scale\":1,\"rotation\":0,\"verticalOrigin\":1,\"scaleByDistance\":{\"near\":0,\"nearValue\":1,\"far\":6000,\"farValue\":1.2},\"distanceDisplayCondition\":{\"_near\":0,\"_far\":6000},\"fontStyle\":{\"fontSize\":\"20px\",\"fillColor\":{\"red\":1,\"green\":1,\"blue\":1,\"alpha\":1}}}",
        "geoPositions": null,
        "listDesc": null
    }
}
```

## 9.文本标注展示
``` js
{
    "methodName":"LabelMark_Show",
    "data":{
        "id": "3bf1097f-f208-4406-a4d1-c9572da3d349",
        "symbolId": "01517e9862944c6e9f820b8c65b16e2c",
        "modelName": "文字标注",
        "symbolName": "文字标注",
        "symbolPath": "",
        "pitch": null,
        "roll": null,
        "heading": null,
        "scale": null,
        "colorPicker": null,
        "longitude": null,
        "latitude": null,
        "altitude": null,
        "position": null,
        "direction": null,
        "up": null,
        "projectName": "芜湖LNG接收转运站码头工程(二期)",
        "code": "LABEL_00010004",
        "geometryType": "LABEL",
        "optionConfig": "{\"fontStyle\":{\"fontSize\":\"20px\",\"fontFamily\":\"Microsoft YaHei\",\"fillColor\":{\"red\":0.6039215686274509,\"green\":0.803921568627451,\"blue\":0.19607843137254902,\"alpha\":1},\"pixelOffset\":{\"x\":0,\"y\":-30}}}",
        "geoPositions": "{\"x\":-2569898.7864040546,\"y\":4811922.515739293,\"z\":3304805.420956586}",
        "listDesc": null
    }
}
```

## 10.图片标注准备创建
``` js
{
    "methodName": "LabelMark_Create_Ready",
    "data": {
        "parentId": "1b110036e0055dd4bc2b9f86ee658c89",
        "id": "01517e9862944c6e9f820b8c65b16e2c",
        "symbolName": "文字标注",
        "symbolDesc": "文字标注",
        "symbolPath": null,
        "thumbnail": "js/ctesi-bim/data/draw-online/drawHandler/label/label.png",
        "code": "LABEL_00010004",
        "width": null,
        "height": null,
        "horizontalOrigin": "CENTER",
        "geometryType": "LABEL",
        "inputText": true,
        "orderIndex": 10,
        "enable": true,
        "symbolId": "01517e9862944c6e9f820b8c65b16e2c"
    }
}
```

## 11.点击创建图片标注
``` js
{
    "labelmark_positiondata":{
        "parentId": "1b110036e0055dd4bc2b9f86ee658c89",
        "id": "01517e9862944c6e9f820b8c65b16e2c",
        "symbolName": "文字标注",
        "symbolDesc": "文字标注",
        "symbolPath": null,
        "thumbnail": "js/ctesi-bim/data/draw-online/drawHandler/label/label.png",
        "code": "LABEL_00010004",
        "width": null,
        "height": null,
        "horizontalOrigin": "CENTER",
        "geometryType": "LABEL",
        "inputText": true,
        "orderIndex": 10,
        "enable": true,
        "symbolId": "01517e9862944c6e9f820b8c65b16e2c",
        "longitude": 118.10051993,
        "latitude": 31.21390062,
        "altitude": 8.76924002
    }
}
```

## 12.图片标注定位
``` js
{
    "methodName":"LabelMark_Positioning",
    "data":{
        "id": "3bf1097f-f208-4406-a4d1-c9572da3d349",
        "symbolId": "01517e9862944c6e9f820b8c65b16e2c",
        "modelName": "文字标注",
        "symbolName": "文字标注",
        "symbolPath": "",
        "pitch": null,
        "roll": null,
        "heading": null,
        "scale": null,
        "colorPicker": null,
        "longitude": null,
        "latitude": null,
        "altitude": null,
        "position": null,
        "direction": null,
        "up": null,
        "projectName": "芜湖LNG接收转运站码头工程(二期)",
        "code": "LABEL_00010004",
        "geometryType": "LABEL",
        "optionConfig": "{\"fontStyle\":{\"fontSize\":\"20px\",\"fontFamily\":\"Microsoft YaHei\",\"fillColor\":{\"red\":0.6039215686274509,\"green\":0.803921568627451,\"blue\":0.19607843137254902,\"alpha\":1},\"pixelOffset\":{\"x\":0,\"y\":-30}}}",
        "geoPositions": "{\"x\":-2569898.7864040546,\"y\":4811922.515739293,\"z\":3304805.420956586}",
        "listDesc": null
    }
}
```

## 13.点击图片标注返回数据(0)
``` js
{
    "labelmark_data_0":{
        "parentId": "1b110036e0055dd4bc2b9f86ee658c89",
        "id": "01517e9862944c6e9f820b8c65b16e2c",
        "symbolName": "文字标注",
        "symbolDesc": "文字标注",
        "symbolPath": null,
        "thumbnail": "js/ctesi-bim/data/draw-online/drawHandler/label/label.png",
        "code": "LABEL_00010004",
        "width": null,
        "height": null,
        "horizontalOrigin": "CENTER",
        "geometryType": "LABEL",
        "inputText": true,
        "orderIndex": 10,
        "enable": true,
        "symbolId": "01517e9862944c6e9f820b8c65b16e2c"
        "longitude": 118.10051993,
        "latitude": 31.21390062,
        "altitude": 8.76924002
    }
}
```

## 14.点击图片标注返回数据(1)
``` js
{
    "labelmark_data_1":{
        "id": "3bf1097f-f208-4406-a4d1-c9572da3d349",
        "symbolId": "01517e9862944c6e9f820b8c65b16e2c",
        "modelName": "文字标注",
        "symbolName": "文字标注",
        "symbolPath": "",
        "pitch": null,
        "roll": null,
        "heading": null,
        "scale": null,
        "colorPicker": null,
        "longitude": null,
        "latitude": null,
        "altitude": null,
        "position": null,
        "direction": null,
        "up": null,
        "projectName": "芜湖LNG接收转运站码头工程(二期)",
        "code": "LABEL_00010004",
        "geometryType": "LABEL",
        "optionConfig": "{\"fontStyle\":{\"fontSize\":\"20px\",\"fontFamily\":\"Microsoft YaHei\",\"fillColor\":{\"red\":0.6039215686274509,\"green\":0.803921568627451,\"blue\":0.19607843137254902,\"alpha\":1},\"pixelOffset\":{\"x\":0,\"y\":-30}}}",
        "geoPositions": "{\"x\":-2569898.7864040546,\"y\":4811922.515739293,\"z\":3304805.420956586}",
        "listDesc": null
    }
}
```

## 15.删除指定图标标注
``` js
{
    "methodName":"LabelMark_Delete",
    "data":{
        "id": "3bf1097f-f208-4406-a4d1-c9572da3d349",
        "symbolId": "01517e9862944c6e9f820b8c65b16e2c",
        "modelName": "文字标注",
        "symbolName": "文字标注",
        "symbolPath": "",
        "pitch": null,
        "roll": null,
        "heading": null,
        "scale": null,
        "colorPicker": null,
        "longitude": null,
        "latitude": null,
        "altitude": null,
        "position": null,
        "direction": null,
        "up": null,
        "projectName": "芜湖LNG接收转运站码头工程(二期)",
        "code": "LABEL_00010004",
        "geometryType": "LABEL",
        "optionConfig": "{\"fontStyle\":{\"fontSize\":\"20px\",\"fontFamily\":\"Microsoft YaHei\",\"fillColor\":{\"red\":0.6039215686274509,\"green\":0.803921568627451,\"blue\":0.19607843137254902,\"alpha\":1},\"pixelOffset\":{\"x\":0,\"y\":-30}}}",
        "geoPositions": "{\"x\":-2569898.7864040546,\"y\":4811922.515739293,\"z\":3304805.420956586}",
        "listDesc": null
    }
}
```