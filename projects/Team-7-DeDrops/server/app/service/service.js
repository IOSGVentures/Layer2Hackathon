class Service {

    constructor(ctx) {
        this.ctx = ctx
        
        this.ctx.service = ctx.service || {}
        // let name = this.constructor.name
        // if (name.length > 7 && name.endsWith('Service')) {
        //     let cname = name.substring(0, name.length - 7).toLowerCase()
        //     this.ctx.service[cname] = this;
        // }
    }

    get service() {
        return this.ctx.service
    }
}

module.exports = Service