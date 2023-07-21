import { Component, Vue, InjectReactive } from 'vue-property-decorator';
import Class from './MyIndex.module.less';

import pwd from '@/assets/extends/myIndexPwd.png';

import API from '@/views/login/oauth-api';
import { userInfo as userInfoType } from "../../type";

import defaultAvatar from '@/assets/extends/defaultAvatar.png';
import { getMyProjectMoment } from "../service/index.js"
import env from "@/config/env";
import { getInfo_login } from "../service/index"
import { ImagePreview } from 'vant';
import imgUser from "../../Img/img/user.png"
// eslint-disable-next-line no-shadow
enum gender {
  "OTHER" = "其他",
  "MALE" = "男",
  "FEMALE" = "女",
}


@Component({
  name: 'MyIndex',
  components: {
    [ImagePreview.Component.name]: ImagePreview.Component,
  }
})
export default class MyIndex extends Vue {

  private userInfo: userInfoType | null = null;
  private userId: string = "";
  private userImg: string = "";
  private projectName: string = "";
  private projectCode: string = "";
  private IMGURL: string = `${env.apiHost}`;
  private Lists: Array<any> = [];


  @InjectReactive("projectConfig") projectConfig;

  public exit() {
    this.$router.push({
      name: 'setUp'
    })
    // this.$router.push({
    //   name: 'login'
    // }).then(res => {
    //   localStorage.clear();
    // });
  }

  public showImgClick(val, index) {
    const arrImg = []
    val.forEach(element => {
      arrImg.push(this.IMGURL + element as never)
    });
    ImagePreview({
      images: arrImg,
      startPosition: index,
    });
  }
  toformdetail() {
    this.$router.push({
      name: "form-detail",
      query: {
        // startWorkflowCode: this.projectCode + "_project_moment",
        schemaCode: `${this.projectCode}_project_moment`,
        // sheetCode: null,
        queryCode: `${this.projectCode}_project_moment`,
        projectName: this.projectConfig?.projectName,
        return: `${this.$route.fullPath}&iframeAction=add`,
        iframeAction: 'add'
      },
    });
  }

  judgeClassName(val) {
    if (val.length == 1) {
      return Class.width100
    }
    if (val.length == 2 || val.length == 4) {
      return Class.width50
    }
    if (val.length == 3 || val.length > 4) {
      return Class.width30
    }
  }

  mounted() {
    // this.userId = JSON.parse(window.sessionStorage.getItem("user") as string).id;
    this.projectName = this.projectConfig?.projectName ?? "";
    this.projectCode = `${env.project}`;
    getInfo_login().then((res) => {
      this.userId = res.data.id;
      // eslint-disable-next-line no-shadow
      getMyProjectMoment(this.projectCode, this.projectName, 0,99999).then(res => {
        this.Lists = res.data.records
      })
    });
    API.getUserInfo().then(res => {
      if (res.errcode !== 0) return this.$message.error(res.errmsg);
      this.userInfo = res.data;
      if (res.data.imgUrl) {
        if (res.data.imgUrl?.indexOf("https") !== -1) {
          this.userImg = res.data.imgUrl
        } else {
          this.userImg = this.IMGURL + '/api/aliyun/download?refId=' + res.data.imgUrl
        }
      } else {
          this.userImg = defaultAvatar
      }
    });

  }

  render() {
    const { userInfo, exit, IMGURL, toformdetail } = this;
    return (
      <article class={Class.main}>
        <section class={Class.navSection}>
          <div class={Class.phone_title}>
            <span></span>
            {/* <span>我的</span> */}
            <div onClick={() => exit()}>
              <img src={require('../../Img/img/my_icon1.png')} alt="" />
            </div>
          </div>
          <nav>
            <div class={Class.avatar}>
              <img src={this.userImg} alt={""} />
            </div>
            <span class={Class.name}>{userInfo?.name}</span>
            {/*<aside class={Class.changePwd}>
              <img src={pwd} alt=""/>
            </aside>*/}
          </nav>
          <main class={Class.post}>
            <div>
              <span></span>
              <span></span>
              {/* <span>{gender[`${userInfo?.gender}`]}</span>
              <span>性别</span> */}
            </div>
            {/*<div>
              <span>54</span>
              <span>年龄</span>
            </div>
            <div>
              <span>6</span>
              <span>公司</span>
            </div>*/}
          </main>
        </section>
        <div class={Class.workCard}>
          <nav>基本信息</nav>
          <aside class={Class.detail}>
            <span>关联信息：</span>
            <span />
            {/*<span>这是关联信息这是关联信息这是关联信息这是关联信息这是关联信息这是关联信息</span>*/}
          </aside>
          <aside class={Class.detail}>
            <span>所属部门：</span>
            <span>{userInfo?.departmentName}</span>
          </aside>
          <aside class={Class.detail}>
            <span>岗位角色：</span>
            <span>{userInfo?.roleName}</span>
          </aside>
        </div>
        <div class={Class.project_moments}>
          <div class={Class.public_title} >
            <div>
              <span>我的项目圈</span>
              <img src={require("../../Img/home/pyq.png")} alt="" onClick={() => toformdetail()}/>
            </div>
          </div>
          {
            this.Lists.map(item => {
              return <div class={Class.moments_content} >
                <div class={Class.name_Time} >
                  <div>
                    <img src={item.userInfo.userPicture || imgUser} alt="" />
                  </div>
                  <div>
                    <p>{item.userInfo.userName}</p>
                    <p>{item.userInfo.department}</p>
                  </div>
                  <div>{item.date}</div>
                </div>
                <div class={Class.imageText} >
                  <div >
                    {item.dynamicContent}
                  </div>
                  <div>
                    {
                      (item.imageList.concat(item.videoList)).map((videoImgItem,videoImgKey)=> {
                        return <div class={`${ Class.imageVideo} ${this.judgeClassName(item.imageList.concat(item.videoList))}`} style={{maxHeight: item.imageList.concat(item.videoList).length === 1? '999px':'115px'}}>
                          {
                            !videoImgItem.match(/.mp4/g)? <img src={IMGURL + videoImgItem} style={{maxHeight: item.imageList.concat(item.videoList).length === 1? '999px':'115px'}} onClick={() => this.showImgClick(item.imageList, videoImgKey)}/>: <video controls muted autoplay={false} class={`${this.judgeClassName(item.imageList.concat(item.videoList))}`}>
                              <source src={IMGURL + videoImgItem} type={'video/mp4'}></source>
                            </video>
                          }
                        </div>
                      })
                    }
                    {/*{*/}
                    {/*  item.imageList.map((imgitem, imgindex) => {*/}
                    {/*    return <img onClick={() => this.showImgClick(item.imageList, imgindex)} style={{maxHeight: (item.imageList.length == 1)? "999px":"115px"} }class={this.judgeClassName(item.imageList)} src={IMGURL + imgitem} alt="" />*/}
                    {/*  })*/}
                    {/*}*/}
                  </div>
                </div>
                <div class={Class.location}>
                  {item.businessSegments && <div>动态分类：{item.businessSegments}</div>}
                  {
                    item.position &&
                    <div>
                      <img src={require("../../Img/img/wechat_icon3.png")} alt="" />
                      <span>
                        {item.position.districtName}{item.position.address}
                      </span>
                    </div>
                  }
                </div>
                {
                  item.handlingOpinions &&
                  <div class={Class.reply_message}>
                    <div>
                      <h4>{item.handler}</h4>
                      <p>回复</p>
                      <h4>{item.userInfo.userName}</h4>
                      <p>：</p>
                    </div>
                    <div>{item.handlingOpinions} </div>
                    {item.sequenceStatus == 'COMPLETED' && <img src={require("../../Img/img/wechat_icon1.png")} alt="" />}
                    {item.sequenceStatus == 'PROCESSING' && <img src={require("../../Img/img/wechat_icon2.png")} alt="" />}
                  </div>
                }
              </div>
            })
          }
        </div >
        {/* <button onClick={() => exit()} class={Class.exitBtn}>
          <span>退出</span>
        </button> */}
      </article >
    );
  }
}
