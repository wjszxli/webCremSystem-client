import requestHandle from 'utils/requestHandle'

export const getAllUserInfo = async () => {
    const url = 'getAllUserInfo'
    return requestHandle(url)
}

export const getPublicNumberData = async (pageIndex, searchItem) => {
    let url = `getPublicNumber?pageSize=10&pageIndex=${pageIndex}${searchItem}`
    const listData = await requestHandle(url) || []
    url = `getPublicNumberCount?${searchItem}`
    const [{ count }] = await requestHandle(url)
    return { listData, dataCount: count }
}

export const getOnePublicNumberData = async (id) => {
    const url = `getOnePublicNumber?id=${id}`
    return requestHandle(url)
}

export const deletePublicNumber = async (id) => {
    const url = `deletePublicNumber?id=${id}`
    const options = {
        method: 'POST',
    }
    return requestHandle(url, options)
}

export const savePublicNumber = async (body) => {
    const url = 'savePublicNumber'
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