import "babel-polyfill";

import "./config/axios";

import env from "@/config/env";

import * as platform from "@cloudpivot/platform";

import { formApi } from "@cloudpivot/api";

import { startup } from "./startup";
// @ts-ignore
import initFormComponent from "@cloudpivot/form/registerComponent";
import common from "@cloudpivot/common/mobile";

initFormComponent();
platform.start(env.client_id, env.scope).then((result: any) => {
  if (!result) return;
  const { query } = result;
  if (query.messageId && common.utils.Common.isPC) {
    openMessage(query.messageId);
  } else if (query.messageId && !common.utils.Common.isPC) {
    window.location.href = `${env.portalHost}/mobile/?messageId=${query.messageId}`;
  } else {
    startup(query);
    // import(/* webpackChunkName: "startup" */'./startup').then( obj => {
    //   obj.startup(query);
    // });
  }
});

/**
 * 根据消息打开页面
 * @param messageId
 */
async function openMessage(messageId: string) {
  const $app = document.getElementById("app");
  if (!$app) {
    throw new Error(`can't find #app`);
  }

  const params: OAuth.FormUrlParams = {
    messageId
  };

  const token = localStorage.getItem("token");
  if (token) {
    const res = await formApi.getMessageFormUrl(params);

    if (res.errcode === 0 && res.data) {
      // 跳转到消息地址或者第三方浏览器直接打开地址
      const { bizObjectId, workItemId, workflowInstanceId, schemaCode, sheetCode, url } = res.data;
      // alert(`结果详情：bizobjectid:${bizObjectId},workitemid:${workItemId},workflowinstanceid:${workflowInstanceId}`);
      let theUrl = "";
      if (url) {
        if (url.indexOf("?") > -1) {
          theUrl = `${url}&access_token=${token}`;
        } else {
          theUrl = `${url}?access_token=${token}`;
        }
      } else {
        theUrl = `${env.portalHost}/form/detail?`;

        if (workflowInstanceId) {
          theUrl += `workflowInstanceId=${workflowInstanceId}&workitemId=${workItemId ||
          ""}&access_token=${token}`;
        } else {
          theUrl += `objectId=${bizObjectId}&schemaCode=${schemaCode}&sheetCode=${sheetCode}&access_token=${token}`;
        }
      }

      $app.innerText = "";
      $app.style.textAlign = "center";
      $app.style.paddingTop = "20px";
      $app.style.color = "#666";
      $app.style.fontSize = "18px";

      const $a = document.createElement("a");
      $a.style.textDecoration = "underline";
      $a.href = theUrl;
      $a.target = "_blank";
      $a.innerText = "浏览器打开应用";
      $app.appendChild($a);

      // window.location.href = theUrl;
      platform.service.openLink(theUrl);
    }
  } else {
    localStorage.setItem("isShowEmailResquest", `${env.portalHost}?messageId=${messageId}`);
    const theUrl = `${env.portalHost}/login`;
    if (sessionStorage.getItem('isExternal')) {
      window.location.href = `${env.portalHost}/loginExternal`
    }else if (window.location.href.indexOf('RelayRoute')>-1){
      return
    }else if(window.location.href.indexOf('administratorLogin')>-1) {
      window.location.href = `${env.portalHost}/administratorLogin`
    }else {
      window.location.href = theUrl;
    }
  }

}
