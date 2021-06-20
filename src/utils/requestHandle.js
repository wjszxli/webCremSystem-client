import request from 'utils/request'
import config from 'utils/config'
import { message } from 'antd';

const { apiUrl } = config

const requestHandle = async (url, options = {}) => {
    try {
        const realUrl = `${apiUrl}/${url}`
        const res = await request(realUrl, options)
        console.log('res', res)
        const { code, data, error } = res
        if (code === 0) return data
        message.error(error)
        return ""
    } catch (error) {
        console.log('error', error)
        // message.error(error)
    }

}

export default requestHandle