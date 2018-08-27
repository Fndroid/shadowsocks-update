const fs = require('fs')
const rpm = require('request-promise-native')

const cwd = process.cwd()

function readConf() {
    let confFile = null
    try {
        confFile = JSON.parse(fs.readFileSync(cwd + '/update.json').toString())
    } catch (e) {
        console.error('update.json文件不存在或格式错误')
    }
    return confFile
}

function readShadowsocksConfig(path) {
    let confFile = null
    try {
        confFile = JSON.parse(fs.readFileSync(path + '/gui-config.json').toString())
    } catch (e) {
        console.error('Shadowsocks路径或配置文件（gui-config.json）格式错误')
    }
    return confFile
}

async function downloadConf(url) {
    return rpm({
        url: url
    })
}

function surgeFromConf(confFile) {
    let regex = /\[Proxy\]([\s\S]*?)\[Proxy\sGroup\]/
    if (regex.test(confFile)) {
        return RegExp.$1.split(/[\r\n]+/g).filter(i => i !== '')
    } else {
        return null
    }
}

function surge2ss(surgeURL) {
    let regex = /(.*?)\s*=\s*custom,(.*?),(.*?),(.*?),(.*?),/
    let obfsRegex = /obfs-host=(.*?)(?:,|$)/
    let res = {}
    if (regex.test(surgeURL)) {
        res.server = RegExp.$2
        res.server_port = RegExp.$3
        res.password = RegExp.$5
        res.method = RegExp.$4
        res.remarks = RegExp.$1
        res.timeout = 5
    } else {
        return null
    }
    if (obfsRegex.test(surgeURL)) {
        res.plugin = "obfs-local"
        res.plugin_opts = `obfs=http;obfs-host=${RegExp.$1}`
    } else {
        res.plugin = ""
        res.plugin_opts = ""
    }
    return res
}

let projectConf = readConf()
let ssConf = readShadowsocksConfig(cwd)
if (projectConf && ssConf) {
    console.log(`成功读取到${projectConf.providers.length}个托管配置，开始拉取...`)
    Promise.all(projectConf.providers.map(url => downloadConf(url))).then(confs => {
        console.log('拉取Surge托管成功，正在解析...')
        let ssURLs = confs.map(conf => {
            return surgeFromConf(conf).map(url => surge2ss(url)).filter(i => i !== null)
        })
        let final = ssURLs.reduce((res, pre) => res.concat(pre))
        ssConf.configs = final
        fs.writeFileSync(cwd + '/gui-config.json', JSON.stringify(ssConf))
        console.log(`Shadowsocks服务器更新完毕，合计更新${final.length}个节点！`)
        console.log('请重启Shadowsocks客户端或进入节点列表点击确定。')
    })
}
