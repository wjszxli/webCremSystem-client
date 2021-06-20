import requestHandle from 'utils/requestHandle'

export const getAllUserInfo = async () => {
    const url = 'getAllUserInfo'
    return requestHandle(url)
}

export const getWeiboData = async (pageIndex, searchItem) => {
    let url = `getWeibo?pageSize=10&pageIndex=${pageIndex}${searchItem}`
    const listData = await requestHandle(url) || []
    url = `getWeiboCount?${searchItem}`
    const [{ count }] = await requestHandle(url)
    return { listData, dataCount: count }
}

export const getOneWeiboData = async (id) => {
    const url = `getOneWeibo?id=${id}`
    return requestHandle(url)
}

export const deleteWeibo = async (id) => {
    const url = `deleteWeibo?id=${id}`
    const options = {
        method: 'POST',
    }
    return requestHandle(url, options)
}

export const saveWeibo = async (body) => {
    const url = 'saveWeibo'
    const options = { method: 'POST', body }
    return requestHandle(url, options)
}

export const addInDetail = async (body) => {
    const url = 'addInDetail'
    const options = { method: 'POST', body }
    return requestHandle(url, options)
}

export const getAllCustomer = async () => {
    const url = 'getAllCustomer'
    return requestHandle(url)
}

export const handlePlan = async (url, body) => {
    const options = {
        method: 'POST',
        body,
    }
    return requestHandle(url, options)
}

export const updateImg = async (body) => {
    const url = 'getAllCustomer'
    const options = {
        body,
        method: 'POST',
    }
    return requestHandle(url, options)
}