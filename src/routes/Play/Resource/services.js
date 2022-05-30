import requestHandle from "utils/requestHandle";

export const getAllUserInfo = async () => {
  const url = "getAllUserInfo";
  return requestHandle(url);
};

export const getPlayData = async (pageIndex, searchItem) => {
  let url = `getPlay?pageSize=10&pageIndex=${pageIndex}${searchItem}`;
  const listData = (await requestHandle(url)) || [];
  url = `getPlayCount?${searchItem}`;
  const [{ count }] = await requestHandle(url);
  return { listData, dataCount: count };
};

export const getOnePlayData = async id => {
  const url = `getOnePlay?id=${id}`;
  return requestHandle(url);
};

export const deletePlay = async id => {
  const url = `deletePlay?id=${id}`;
  const options = {
    method: "POST"
  };
  return requestHandle(url, options);
};

export const savePlay = async body => {
  const url = "savePlay";
  const options = { method: "POST", body };
  return requestHandle(url, options);
};

export const addInDetail = async body => {
  const url = "addInDetail";
  const options = { method: "POST", body };
  return requestHandle(url, options);
};

export const getAllCustomer = async () => {
  const url = "getAllCustomer";
  return requestHandle(url);
};

export const handlePlan = async (url, body) => {
  const options = {
    method: "POST",
    body
  };
  return requestHandle(url, options);
};

export const updateImg = async body => {
  const url = "getAllCustomer";
  const options = {
    body,
    method: "POST"
  };
  return requestHandle(url, options);
};
