//显示范围显隐联动关系
const areaRelation = {
  all: {
    showMore: false,
    showProvince: false,
    showCity: false
  },
  province: {
    showMore: true,
    showProvince: true,
    showCity: false
  },
  city: {
    showMore: true,
    showProvince: true,
    showCity: true
  }
};

export const getRelationByType = type => {
  if (!type || !areaRelation[type]) {
    console.log("---error", type, areaRelation);
    throw Error("error areaRelation");
  }
  return areaRelation[type];
};

export const getProvinceDataByType = () => {};

export const getCityDataByProvince = code => {};
