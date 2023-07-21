/**
 * 颜色枚举
 */
// eslint-disable-next-line no-shadow
export enum Color {
  PAINTCOATVALUE = '#F3F5F8',
  ELEMENTCOATVALUE= '#FFFFFF',
  TITLECOLOR='#304265',
  FONTCOLOR='#304265',
  THEMEELEMENTCOATVALUE = 'RGBA(0,0,0,.4)',
  THEMETITLECOLOR = '#FFFFFF',
  THEMEFONTCOLOR = '#FFFFFF'
}



/**
 * 主题类型
 */
// eslint-disable-next-line no-shadow
export enum ThemeType {
  DEFAULT = 'default',
  THEME1 = 'theme1',
  THEME2 = 'theme2',
  THEME3 = 'theme3',
  THEME4 = 'theme4',
}

/**
 * 组件外套类型
 */
// eslint-disable-next-line no-shadow
export enum CoatType {
  BGCOLOR = 'bgColor',
  BGPICTURE = 'bgPicture',
}

export const paints = {
  default: {
    url: require('@h3/report/basics/assets/color-setting/theme/default.png'),
    themeType: ThemeType.DEFAULT,
    paintCoatType: CoatType.BGCOLOR,
    paintCoatValue: Color.PAINTCOATVALUE,
    elementCoatType: CoatType.BGCOLOR,
    elementCoatValue: Color.ELEMENTCOATVALUE,
    titleColor: Color.TITLECOLOR,
    fontColor: Color.FONTCOLOR,
  },
  theme1: {
    url: require('@h3/report/basics/assets/color-setting/theme/theme1.png'),
    themeType: ThemeType.THEME1,
    paintCoatType: CoatType.BGPICTURE,
    paintCoatValue: require('@h3/report/basics/assets/color-setting/theme/theme1-bg.png'),
    elementCoatType: CoatType.BGCOLOR,
    elementCoatValue: Color.THEMEELEMENTCOATVALUE,
    titleColor: Color.THEMETITLECOLOR,
    fontColor: Color.THEMEFONTCOLOR,
  },
  theme2: {
    url: require('@h3/report/basics/assets/color-setting/theme/theme2.png'),
    themeType: ThemeType.THEME2,
    paintCoatType: CoatType.BGPICTURE,
    paintCoatValue: require('@h3/report/basics/assets/color-setting/theme/theme2-bg.png'),
    elementCoatType: CoatType.BGCOLOR,
    elementCoatValue: Color.THEMEELEMENTCOATVALUE,
    titleColor: Color.THEMETITLECOLOR,
    fontColor: Color.THEMEFONTCOLOR,
  },
  theme3: {
    url: require('@h3/report/basics/assets/color-setting/theme/theme3.png'),
    themeType: ThemeType.THEME3,
    paintCoatType: CoatType.BGPICTURE,
    paintCoatValue: require('@h3/report/basics/assets/color-setting/theme/theme3-bg.png'),
    elementCoatType: CoatType.BGCOLOR,
    elementCoatValue: Color.THEMEELEMENTCOATVALUE,
    titleColor: Color.THEMETITLECOLOR,
    fontColor: Color.THEMEFONTCOLOR,
  },
  theme4: {
    url: require('@h3/report/basics/assets/color-setting/theme/theme4.png'),
    themeType: ThemeType.THEME4,
    paintCoatType: CoatType.BGPICTURE,
    paintCoatValue: require('@h3/report/basics/assets/color-setting/theme/theme4-bg.png'),
    elementCoatType: CoatType.BGCOLOR,
    elementCoatValue: Color.THEMEELEMENTCOATVALUE,
    titleColor: Color.THEMETITLECOLOR,
    fontColor: Color.THEMEFONTCOLOR,
  }
};

export default {
  paints
}
