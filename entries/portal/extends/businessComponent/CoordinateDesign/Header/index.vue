<template>
  <div class="headerWrap">
    <div class="headerContent">
      <div class="headerTitle">
        <img
          class="logo"
          src="../../../../src/assets/extends/CoordinateDesign/Index/top_logo.png"
          alt=""
        />
        <div class="headerTitleContent">
          <span>{{ projectTitle }}</span>
          <span v-if="subtitle"> - {{ subtitle }}</span>
          <div class="enTitle">Design collaborative management system</div>
        </div>
      </div>
      <div class="headerMenu">
        <div
          v-for="(item, index) in headerList"
          :key="index"
          class="menu-item flex-space-between"
          @click="menuTab(item.name)"
        >
          <div class="itemContent">
            <!-- <i class="icon aufontAll" :class="item.icon"></i> -->
            <span class="itemName" :class="{ activeBar: item.name === activeMenu }"
              ><b>{{ item.name }}</b></span
            >
          </div>
        </div>
      </div>

      <!-- 插件下载按钮开始-->
      <div class="headerDown" @click="headerDown">
        <a-icon class="fileIcon" type="download" :style="{ fontSize: '26px', color: '#fff' }" />
        <!-- 插件下载弹框 -->
        <a-modal
          title="插件下载"
          :visible="isDown"
          @cancel="cancelDown"
          @ok="addList"
          width="1000px"
        >
          <div class="clearfix">
            <!-- tab栏标题切换-->
            <div class="clearfix-tabs">
              <div
                v-for="(val, key) in allSelectArrs"
                :key="key"
                class="clearfix-tabs-item"
                :class="[oneActive == key && flagUse == true ? 'activeborder' : '']"
                @click="changeTabsNum(key)"
              >
                <img v-if="key == 'AutoCAD'" :src="val[0]['icon']" />
                <span class="clearfix-tabs-item-txts">{{ key }}</span>
              </div>
            </div>
            <!-- 版本信息下拉框-->
            <div v-if="flagUse" class="flex flex-center-align">
              <span class="search-label" style="margin-right: 10px">版本信息</span>
              <div class="version">
                <a-select v-model="selectOne" style="width: 120px" @change="selectChangeOne">
                  <a-select-option
                    v-for="item in selectArrs"
                    :key="item.version"
                    :value="item.version"
                    :title="item.version"
                  >{{ item.version }}</a-select-option
                  >
                </a-select>
              </div>
            </div>
          </div>
        </a-modal>
      </div>
      <!-- 插件下载按钮结束-->

      <div class="headerExtra">
        <ul>
          <!--          <li class="liItem">-->
          <!--            <a-badge>-->
          <!--              <a-icon type="bell" class="icon"/>-->
          <!--              <template #count>-->
          <!--                <span class="circle"></span>-->
          <!--              </template>-->
          <!--            </a-badge>-->
          <!--          </li>-->
          <li>
            <a-dropdown :trigger="['click']">
              <div class="user-info">
                <div class="avatar-box">
                  <img
                    v-if="userInfo.imgUrl && userInfo.imgUrl.includes('http')"
                    :src="userInfo.imgUrl"
                  />
                  <img v-else-if="userInfo.imgUrl" :src="getDownloadUrl(userInfo.imgUrl)" />
                  <i v-else class="icon aufontAll h-icon-all-normal_smile default-avatar"></i>
                  <span>{{ userInfo.name }}</span>
                  <img
                    src="../../../../src/assets/extends/coordinate/top_s.png"
                    style="width: 18px; height: 18px; margin-left: 5px"
                    alt=""
                  />
                </div>
              </div>
              <div class="info-box" slot="overlay">
                <ul>
                  <li class="user">
                    <div class="user-name">
                      <span>{{ userInfo.name }}</span>
                      <span class="mobile">{{ userInfo.mobile }}</span>
                    </div>
                  </li>
                  <li>
                    <a @click="toAdmin">
                      <i class="icon aufontAll h-icon-all-disassembly-o"></i>
                      {{ $t("languages.common.backStageManager") }}
                    </a>
                  </li>
                  <li v-if="isShowToggle">
                    <a @click="toggleLanguage" class="toggle-lang">
                      <i class="icon aufontAll h-icon-all-swap-o"></i>
                      {{ $t("languages.common.switch") }}
                      <span :class="$i18n.locale === 'zh' ? 'active' : ''">中</span> /
                      <span :class="$i18n.locale === 'en' ? 'active' : ''">En</span>
                    </a>
                  </li>
                  <li v-if="isShowUpdatePwdBtn">
                    <a @click="modifyPassword">
                      <i class="icon aufontAll h-icon-all-key-o"></i>
                      {{ $t("languages.common.changePwd") }}
                    </a>
                  </li>
                  <li v-if="!isDingTalk">
                    <a @click="logout">
                      <i class="icon aufontAll h-icon-all-poweroff-o"></i>
                      {{ $t("languages.common.exitSys") }}
                    </a>
                  </li>
                  <!--                  <li>-->
                  <!--                    <a @click="$router.push('/HelpDoc')">-->
                  <!--                      <i class="icon aufontAll h-icon-all-list-work"></i>-->
                  <!--                      帮助文档-->
                  <!--                    </a>-->
                  <!--                  </li>-->
                </ul>
              </div>
            </a-dropdown>
          </li>
        </ul>
      </div>
    </div>
    <!-- 修改密码 -->
    <a-modal
      v-model="showModal"
      :title="$t('languages.common.changePwd')"
      :width="422"
      :cancelText="$t('languages.common.cancel')"
      :okText="$t('languages.common.ok')"
      @ok="changePwd"
      @cancel="cancel"
      :maskClosable="false"
      :keyboard="false"
    >
      <a-row class="row-flex" :class="{ 'err-input': oldPwdErrTips }" type="flex">
        <a-col class="required" :span="5">{{ $t("languages.common.oldPwd") }}</a-col>
        <a-col :span="19">
          <a-input v-model="params.oldPwd" type="password" />
          <p class="err-tips" v-if="oldPwdErrTips">{{ oldPwdErrTips }}</p>
        </a-col>
      </a-row>
      <a-row class="row-flex" :class="{ 'err-input': newPwdErrTips }" type="flex">
        <a-col class="required" :span="5">{{ $t("languages.common.newPwd") }}</a-col>
        <a-col :span="19">
          <a-input v-model="params.newPwd" type="password" />
          <p class="err-tips" v-if="newPwdErrTips">{{ newPwdErrTips }}</p>
        </a-col>
      </a-row>
      <a-row class="row-flex" :class="{ 'err-input': surePwdErr }" type="flex">
        <a-col class="required" :span="5">{{ $t("languages.common.surePwd") }}</a-col>
        <a-col :span="19">
          <a-input v-model="params.surePwd" type="password" />
        </a-col>
      </a-row>
    </a-modal>
  </div>
</template>

<script src="./index.ts" />
<style lang="less" scoped>
@import "../../../../src/styles/themes/default.less";
@import "../../../styles/public.module.less";
@import url("./index.less");
</style>
