import requestHandle from "utils/requestHandle";

export const getAllUserInfo = async () => {
  const url = "getAllUserInfo";
  return requestHandle(url);
};

export const getColonelData = async (pageIndex, searchItem) => {
  let url = `getColonel?pageSize=10&pageIndex=${pageIndex}${searchItem}`;
  const listData = (await requestHandle(url)) || [];
  url = `getColonelCount?${searchItem}`;
  const [{ count }] = await requestHandle(url);
  return { listData, dataCount: count };
};

export const getOneColonelData = async id => {
  const url = `getOneColonel?id=${id}`;
  return requestHandle(url);
};

export const deleteColonel = async id => {
  const url = `deleteColonel?id=${id}`;
  const options = {
    method: "POST"
  };
  return requestHandle(url, options);
};

export const saveColonel = async body => {
  const url = "saveColonel";
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
