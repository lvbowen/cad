import {WBSreport} from "./type";

export interface MergeWBSStructure extends WBSreport{
  children?:Array<MergeWBSStructure>,
  wbs?:string;
  plandetailname?:string;
  plandetailunit?:string;
  plandetailunitprice?:number;
  plandetailamount?:number;
  plandetailmoney?:number;
  tempData?:boolean;
}
export class WBSStructure {
  public constructor(public props: MergeWBSStructure) {
  }
}
