import requestHandle from "utils/requestHandle";

// export const getAllUserInfo = async () => {
//     const url = 'getAllUserInfo'
//     return requestHandle(url)
// }

export const getPlan = async (pageIndex, searchItem) => {
  const url = `getPlan?pageSize=10&isDelete=0&model=5&pageIndex=${pageIndex}${searchItem}`;
  return requestHandle(url);
};

export const getPlanCount = async searchItem => {
  const url = `getPlanCount?isDelete=0&model=5${searchItem}`;
  return requestHandle(url);
};

// export const getPlanAllSum = async (searchItem) => {
//     const url = `getPlanAllSum?isDelete=0${searchItem}`
//     return requestHandle(url)
// }

// export const deletePlan = async (body) => {
//     const url = 'deletePlan'
//     const options = {
//         method: 'POST',
//         body,
//     }
//     return requestHandle(url, options)
// }

// export const updatePlan = async (url, body) => {
//     const options = {
//         method: 'POST',
//         body,
//     }
//     return requestHandle(url, options)
// }

// export const getOnePlan = async (rowKeys) => {
//     const url = `getOnePlan?id=${rowKeys}`
//     return requestHandle(url)
// }
