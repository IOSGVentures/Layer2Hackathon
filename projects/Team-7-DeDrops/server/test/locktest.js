var MongoClient = require('mongodb').MongoClient
// var url = "mongodb://youruser:yourpassword2@localhost/yourdatabase"

async function run() {
    var conn = null
    try {
        conn = await MongoClient.connect(url, { useUnifiedTopology: true })
        var db = conn.db("ring")
        var site = db.collection("lock")
        console.log("1 数据库已连接")

        //插入多条数据
        // var myobj = [
        //     { name: "A1", balance: 0, tag:'a1', isLock:false },
        //     { name: "A2", balance: 0, tag:'a2', isLock:false },
        //     { name: "A3", balance: 0, tag:'a3', isLock:false }
        // ]
        // var res = await site.insertMany(myobj)
        // console.log("文档插入成功", res.insertedCount)

        //查询一条数据
        // var obj = await site.findOne({ name: 'A' })
        // console.log(obj)

        //查询多条数据
        //  /菜鸟/ 表示模糊查询，使用正则表达式  /^G/ 查询G开头的
        // $or表示或  {'name':'xxx', type:'cn'}表示且
        // { type: 1 }  // 按 type 字段升序
        // { type: -1 } // 按 type 字段降序
        //如果要设置指定的返回条数可以使用 limit() 方法，该方法只接受一个参数，指定了返回的条数。
        //skip(): 跳过前面两条数据，读取两条数据
        // var arr = await site.find({ $or: [{ name: /^G/ }, { name: '菜鸟工具' }] }).sort({ type: -1 }).skip(0).limit(3).toArray()
        // console.log(arr)

        //更新一条数据
        // var whereStr = {"name":'Google'}  // 查询条件
        // var updateStr = {$set: { "url" : "www" }}
        // var res = await site.updateOne(whereStr, updateStr)
        // console.log("更新数据成功", res.result)

        for (let i=0; i< 10; i++) {
            var obj = await site.updateOne({ name: 'A1', isLock: false }, {$set: { isLock: true}})
            if (!obj) {
                obj = await site.updateOne({ name: 'A1', isLock: false }, {$set: { isLock: true}})
                if (!obj) {
                    obj = await site.updateOne({ name: 'A1', isLock: false }, {$set: { isLock: true}})
                }
            }
            if (!obj) {
                console.log('1 阻塞')
                return
            }

            var obj = await site.findOne({ name: 'A1' })
            console.log('1', obj.balance)

            var res = await site.updateOne({ name: 'A1' }, {$set: { balance: obj.balance + 1, isLock: false }})
            console.log("1 更新数据成功", res.result)
        }

    } catch (err) {
        console.log("1 错误：" + err.message)
    } finally {
        if (conn != null) conn.close()
    }
}


async function run2() {
    var conn = null
    try {
        conn = await MongoClient.connect(url, { useUnifiedTopology: true })
        var db = conn.db("ring")
        var site = db.collection("lock")
        console.log("2 数据库已连接")

        for (let i=0; i< 10; i++) {
            var obj = await site.updateOne({ name: 'A1', isLock: false }, {$set: { isLock: true}})
            if (!obj) {
                obj = await site.updateOne({ name: 'A1', isLock: false }, {$set: { isLock: true}})
                if (!obj) {
                    obj = await site.updateOne({ name: 'A1', isLock: false }, {$set: { isLock: true}})
                }
            }
            if (!obj) {
                console.log('2 阻塞')
                return
            }

            var obj = await site.findOne({ name: 'A1' })
            console.log('2', obj.balance)

            var res = await site.updateOne({ name: 'A1' }, {$set: { balance: obj.balance - 1, isLock: false }})
            console.log("2 更新数据成功", res.result)
        }

    } catch (err) {
        console.log("2 错误：" + err.message)
    } finally {
        if (conn != null) conn.close()
    }
}


run()
run2()