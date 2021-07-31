var MongoClient = require('mongodb').MongoClient
// var url = "mongodb://youruser:yourpassword2@localhost/yourdatabase"

async function run() {
    var conn = null
    try {
        conn = await MongoClient.connect(url, { useUnifiedTopology: true })
        var db = conn.db("ring")
        var site = db.collection("site")
        console.log("数据库已连接")

        //插入一条数据
        // var myobj = { name: "菜鸟教程2", url: "www.runoob" }
        // await site.insertOne(myobj)
        // console.log("文档插入成功")

        //插入多条数据
        // let arr = []
        // for (let i=0; i<100000; i++) {
        //     arr.push({index:i, address:Math.random().toString(16), usdt:0})
        // }
        // var res = await site.insertMany(arr)
        // console.log("文档插入成功", res.insertedCount)

        //查询一条数据
        var arr = await site.find().toArray()
        console.log(arr.length, arr[90000])

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

        //更新多条数据
        // var whereStr = {"name":'Google'}  // 查询条件
        // var updateStr = {$set: { "url" : "www2" }}
        // var res = await site.updateMany(whereStr, updateStr)
        // console.log("更新数据成功", res.result.nModified)

        //删除一条数据
        // var whereStr = { name: 'Google' }  // 查询条件
        // await site.deleteOne(whereStr)
        // console.log("数据删除成功")

        //删除多条数据
        // var whereStr = { name: 'Facebook' }  // 查询条件
        // var res = await site.deleteMany(whereStr)
        // console.log("数据删除成功", res.result.n)

    } catch (err) {
        console.log("错误：" + err.message)
    } finally {
        if (conn != null) conn.close()
    }
}


run()