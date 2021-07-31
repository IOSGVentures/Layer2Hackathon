const schedule = require('node-schedule')

const service = require('../service/context').service

class Subscription {

    constructor(ctx) {
        this.ctx = ctx
        
        if (!ctx.service) {
            console.log('load service for schedule')
            this.ctx.service = service()
        }

        this.ctx.task = ctx.schedule || {}
        let name = this.constructor.name.toLowerCase()
        this.ctx.task[name] = this;

        this._job = schedule.scheduleJob(this.schedule, async () => this.subscribe())
    }

    get task() {
        return this.ctx.task
    }

    get service() {
        return this.ctx.service
    }

    get schedule() {
        // overwrite by subclass
        throw new Error('overwrite by subclass.')
    }

    async subscribe() {
    }

    async cancel() {
        this._job.cancel()
    }
}

module.exports = Subscription