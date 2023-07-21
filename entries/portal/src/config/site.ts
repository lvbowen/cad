import site from '../../extends/site';

const defaultSite = {
  // title: '长江航道整治工程基建系统平台',
  title: window.localStorage.getItem('projectTitle'),
  // logo: require('@/assets/images/yslogo.png'),
  logo: window.localStorage.getItem('projectLogo'),
};

const mix = Object.assign({}, defaultSite, site);

export default mix;
