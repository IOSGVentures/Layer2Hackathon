const MongoClient = require('mongodb').MongoClient
const config = require('../../conf/config.js')


const Collections = {
    nft: 'nft',
    erc20claims: 'erc20claims'
}

async function createCollection(collection) {
    let conn = null
    try {
        conn = await MongoClient.connect(config.db_url(), { useUnifiedTopology: true })
        await conn.db(config.db_name).createCollection(collection)

        console.log('[db][createcollection]', obj)

    } catch (err) {
        console.log('[db][createcollection][ERROR]：' + err.message)
        throw err
    } finally {
        if (conn) conn.close()
    }
}

async function listCollections(filter) {
    let conn = null
    try {
        conn = await MongoClient.connect(config.db_url(), { useUnifiedTopology: true })
        return await conn.db(config.db_name).listCollections()
    } catch (err) {
        console.log('[db][listcollection][ERROR]：' + err.message)
        throw err
    } finally {
        if (conn) conn.close()
    }
}

async function save(collection, obj) {
    let conn = null
    try {
        conn = await MongoClient.connect(config.db_url(), { useUnifiedTopology: true })
        let dbcollection = conn.db(config.db_name).collection(collection)
        await dbcollection.insertOne(obj)
    } catch (err) {
        console.log('[db][save][ERROR]：' + err.message)
        throw err
    } finally {
        if (conn) conn.close()
    }
}

async function get(collection, obj) {
    let conn = null
    try {
        conn = await MongoClient.connect(config.db_url(), { useUnifiedTopology: true })
        let dbcollection = conn.db(config.db_name).collection(collection)
        return await dbcollection.find(obj).toArray()
    } catch (err) {
        console.log('[db][save][ERROR]：' + err.message)
        throw err
    } finally {
        if (conn) conn.close()
    }
}

async function getOnce(collection, obj) {
    let conn = null
    try {
        conn = await MongoClient.connect(config.db_url(), { useUnifiedTopology: true })
        let dbcollection = conn.db(config.db_name).collection(collection)
        return await dbcollection.findOne(collection, obj)
    } catch (err) {
        console.log('[db][save][ERROR]：' + err.message)
        throw err
    } finally {
        if (conn) conn.close()
    }
}

async function saveERC20ClaimData(obj) {
    let conn = null
    try {
        conn = await MongoClient.connect(config.db_url(), { useUnifiedTopology: true })
        let erc20claims = conn.db(config.db_name).collection(Collections.erc20claims)

        obj.time = Date.now()
        await erc20claims.deleteOne({ 'token': obj.token, 'owner': obj.owner, 'spender': obj.spender })
        await erc20claims.insertOne(obj)

        console.log('[db][saveERC20ClaimData]', obj)

    } catch (err) {
        console.log('[db][saveERC20ClaimData][ERROR]：' + err.message)
        throw err
    } finally {
        if (conn) conn.close()
    }
}


async function getERC20ClaimData(obj) {
    let conn = null
    try {
        conn = await MongoClient.connect(config.db_url(), { useUnifiedTopology: true })
        let erc20claims = conn.db(config.db_name).collection(Collections.erc20claims)

        let arr = await erc20claims.find(obj).toArray()
        return arr

    } catch (err) {
        console.log('[db][getERC20ClaimData][ERROR]：' + err.message)
        throw err
    } finally {
        if (conn) conn.close()
    }
}


module.exports = {
    Collections: Collections,
    createCollection: createCollection,
    listCollections: listCollections,
    save: save,
    get: get,
    getOnce: getOnce,
    saveERC20ClaimData: saveERC20ClaimData,
    getERC20ClaimData: getERC20ClaimData,
}