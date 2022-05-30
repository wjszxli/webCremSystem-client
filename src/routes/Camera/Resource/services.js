import requestHandle from "utils/requestHandle";

export const getAllUserInfo = async () => {
  const url = "getAllUserInfo";
  return requestHandle(url);
};

export const getCameraData = async (pageIndex, searchItem) => {
  let url = `getCamera?pageSize=10&pageIndex=${pageIndex}${searchItem}`;
  const listData = (await requestHandle(url)) || [];
  url = `getCameraCount?${searchItem}`;
  const [{ count }] = await requestHandle(url);
  return { listData, dataCount: count };
};

export const getOneCameraData = async id => {
  const url = `getOneCamera?id=${id}`;
  return requestHandle(url);
};

export const deleteCamera = async id => {
  const url = `deleteCamera?id=${id}`;
  const options = {
    method: "POST"
  };
  return requestHandle(url, options);
};

export const saveCamera = async body => {
  const url = "saveCamera";
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
