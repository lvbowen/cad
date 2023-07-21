export interface Layer {
    layerName: string;
    layerType: string; //(DOM(表示影像)\DEM（表示地形）\MODEL（表示模型）\OSGB（表示倾斜）
    layerID: string;
    layerAlias: string; // 图层别名（用于显示）
    visable: boolean;
    opacity: number;
    symbolPath?:string;
    symbolId?:string;
  }