import requestHandle from 'utils/requestHandle'

export const getAllUserInfo = async () => {
    const url = 'getAllUserInfo'
    return requestHandle(url)
}

export const getNotificationData = async (pageIndex, searchItem) => {
    let url = `getNotification?pageSize=10&pageIndex=${pageIndex}${searchItem}`
    const listData = await requestHandle(url) || []
    url = `getNotificationCount?${searchItem}`
    const [{ count }] = await requestHandle(url)
    return { listData, dataCount: count }
}

export const getOneNotificationData = async (id) => {
    const url = `getOneNotification?id=${id}`
    return requestHandle(url)
}

export const deleteNotification = async (id) => {
    const url = `deleteNotification?id=${id}`
    const options = {
        method: 'POST',
    }
    return requestHandle(url, options)
}

export const saveNotification = async (body) => {
    const url = 'saveNotification'
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