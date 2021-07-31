
const eth = require('./eth')
const polygon = require('./polygon')
const chainlink = require('./chainlink')
const graph = require('./graph')

const nft = require('./nft')

var _ctx

function service() {
    if (!_ctx) {
        throw new Error('service need load first.')
    }
    return _ctx.service
}

function load (ctx) {
    if (!_ctx) {
        _ctx = ctx
        _ctx.service = ctx.service || {}
    }
    if (!_ctx.service.eth) {
        _ctx.service.eth = new eth(ctx)
    }
    if (!_ctx.service.polygon) {
        _ctx.service.polygon = new polygon(ctx)
    }
    if (!_ctx.service.chainlink) {
        _ctx.service.chainlink = new chainlink(ctx)
    }
    if (!_ctx.service.graph) {
        _ctx.service.graph = new graph(ctx)
    }
    if (!_ctx.service.nft) {
        _ctx.service.nft = new nft(ctx)
    }
    console.log('load service!')
    return _ctx
}

module.exports = {
    service: service,
    load: load
}