exports.internalFail = (data, message='failed') => {
    return {
        error: true,
        [data]: data,
        message
    }
}

exports.internalSuccess = (data, message='success') => {
    return {
        error: false,
        [data]: data,
        message
    }
}

exports.jsonSuccess = (res, data = {}, message = 'success', code = 200, meta = {}) => {
    return res.status(code).json({
        data,
        message,
        meta,
    })
}

exports.jsonFailed = (res, data = {}, message = 'failed', code = 400, meta = {}) => {
    return res.status(code).json({
        data,
        message,
        meta,
    })
}