var crypto = require('crypto')

let utils = {
    randoms(len, chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789') {
        len = len || 32
        var maxPos = chars.length
        var str = ''
        for (i = 0; i < len; i++) {
            str += chars.charAt(Math.floor(Math.random() * maxPos))
        }
        return str
    },
    md5(content) {
        const hash = crypto.createHash('md5')
        hash.update(content)
        const md5Content = hash.digest('hex')
        return md5Content;
    }
}

module.exports = utils