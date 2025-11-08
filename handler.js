require("./system/settings")
require("./lib/index")
require("./system/scrape/index")
const fs = require("fs")
const path = require("path")
const chalk = require("chalk")

const plugins = new Map()
const autoPlugins = []
const tagCategories = {}

const loadPlugins = () => {
  plugins.clear()
  autoPlugins.length = 0
  Object.keys(tagCategories).forEach(tag => tagCategories[tag] = [])

  const pluginFiles = fs.readdirSync(path.join(__dirname, "plugins")).filter(file => file.endsWith(".js"))
  for (const file of pluginFiles) {
    delete require.cache[require.resolve(`./plugins/${file}`)]
    try {
      const plugin = require(`./plugins/${file}`)
      if (plugin && plugin.command instanceof RegExp) {
        plugin.help = plugin.help || [`${plugin.command}`]
        plugin.tags = plugin.tags || ["general"]
        plugin.owner = plugin.owner || false
        plugins.set(plugin.command, plugin)
        if (plugin.tags && Array.isArray(plugin.tags)) {
          plugin.tags.forEach(tag => {
            if (!tagCategories[tag]) tagCategories[tag] = []
            tagCategories[tag].push(plugin)
          })
        }
      } else if (typeof plugin === "function" || typeof plugin.before === "function") {
        autoPlugins.push(plugin)
      }
    } catch (err) {
      console.log(chalk.red(`Gagal memuat plugin ${file}:`), err)
    }
  }

  global.plugins = Object.fromEntries(plugins.entries())
  global.autoPlugins = autoPlugins
  console.log(chalk.cyan(`Plugins Loaded: ${plugins.size} command plugins, ${autoPlugins.length} auto plugins`))
}

loadPlugins()

const dbPath = path.join(__dirname, "data", "database.json")
if (!fs.existsSync(path.dirname(dbPath))) fs.mkdirSync(path.dirname(dbPath), { recursive: true })
if (!global.db) global.db = {}
if (!global.db.data) {
  try {
    global.db.data = fs.existsSync(dbPath)
      ? JSON.parse(fs.readFileSync(dbPath, "utf-8"))
      : {}
  } catch {
    global.db.data = {}
  }
}
const db = global.db.data
db.users = db.users || {}
db.groups = db.groups || {}
db.others = db.others || {}
db.settings = db.settings || {}

const saveDB = () => {
  try {
    fs.writeFileSync(dbPath, JSON.stringify(global.db.data, null, 2))
  } catch {}
}
setInterval(saveDB, 10000)

module.exports = async (kiicode, m) => {
  try {
    if (m.key.fromMe) return

    const body =
      m.mtype === "conversation" ? m.message.conversation :
      m.mtype === "imageMessage" ? m.message.imageMessage?.caption :
      m.mtype === "videoMessage" ? m.message.videoMessage?.caption :
      m.mtype === "extendedTextMessage" ? m.message.extendedTextMessage?.text :
      m.mtype === "buttonsResponseMessage" ? m.message.buttonsResponseMessage?.selectedButtonId :
      m.mtype === "listResponseMessage" ? m.message.listResponseMessage?.singleSelectReply?.selectedRowId :
      m.mtype === "templateButtonReplyMessage" ? m.message.templateButtonReplyMessage?.selectedId :
      m.mtype === "interactiveResponseMessage"
        ? (() => {
            try {
              return JSON.parse(m.msg.nativeFlowResponseMessage?.paramsJson)?.id
            } catch {
              return ""
            }
          })()
        : m.mtype === "messageContextInfo"
          ? (m.message.buttonsResponseMessage?.selectedButtonId ||
             m.message.listResponseMessage?.singleSelectReply?.selectedRowId ||
             m.text)
          : ""

    const budy = typeof m.text == "string" ? m.text : ""
    const sender = m.sender
    const pushname = m.pushName || "-"
    const isGroup = m.isGroup
    const idGroup = isGroup ? m.chat : "-"
    const idUser = sender
    const typeChat = m.mtype
    const ownerJid = `${owner}@s.whatsapp.net`
    const botNumber = await kiicode.decodeJid(kiicode.user.id)

    const metadata = isGroup ? await kiicode.groupMetadata(m.chat).catch(() => {}) : ""
    const subject = isGroup ? metadata.subject : ""
    const participants = isGroup ? metadata.participants : []
    const groupAdmins = isGroup ? participants.filter(v => v.admin).map(v => v.jid) : []
    const isBotAdmins = isGroup ? groupAdmins.includes(botNumber) : false
    const isAdmins = isGroup ? groupAdmins.includes(sender) : false

    if (!db.users[idUser]) {
      db.users[idUser] = {
        id: idUser,
        balance: 0,
        role: "member",
        transactions: [],
        registered_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      saveDB()
    } else {
      db.users[idUser].updated_at = new Date().toISOString()
    }

    const jam = new Date().toLocaleString("en-US", { timeZone: "Asia/Jakarta" })
    const waktu = `${jam}`

    const typeInfo = /image|video|audio|sticker|document/.test(typeChat)
      ? `Media (${typeChat})`
      : `Text: ${body}`

    const logStyle = isGroup ? chalk.yellowBright.bold : chalk.greenBright.bold
    console.log(chalk.cyan.bold(`────────────────────────────`))
    console.log(logStyle(`• Waktu    : ${waktu}`))
    console.log(logStyle(`• Pengirim : ${idUser}`))
    console.log(logStyle(`• Nama     : ${pushname}`))
    console.log(logStyle(`• Grup     : ${idGroup}`))
    console.log(logStyle(`• Pesan    : ${typeInfo}`))
    console.log(chalk.cyan.bold(`────────────────────────────`))

    for (const plugin of autoPlugins) {
      if (typeof plugin === "function") {
        await plugin(m, { kiicode })
      } else if (typeof plugin.before === "function") {
        const result = await plugin.before(m, { kiicode })
        if (!result) return
      }
    }

    const usedPrefix = prefix.find(p => body.startsWith(p))
    if (!usedPrefix) return

    const args = body.slice(usedPrefix.length).trim().split(/\s+/)
    const commandName = args.shift().toLowerCase()
    const text = args.join(" ")
    const quoted = m.quoted ? m.quoted : m
    const froms = m.quoted
      ? m.quoted.sender
      : text
        ? (text.replace(/[^0-9]/g, "")
          ? text.replace(/[^0-9]/g, "") + "@s.whatsapp.net"
          : false)
        : false
    const mentionUser = [...new Set([...(m.mentionedJid || []), ...(m.quoted ? [m.quoted.sender] : [])])]
    const isQuotedViewOnce = m.message.extendedTextMessage?.contextInfo?.quotedMessage?.viewOnceMessageV2 ? true : false

    for (const [regex, plugin] of plugins.entries()) {
      if (regex.test(commandName)) {
        if (plugin.owner && sender !== ownerJid)
          return m.reply(`*[* BOT NOTICE *]*\nPerintah ini hanya khusus *Owner*!`)
        if (plugin.group && !isGroup)
          return m.reply(`*[* BOT NOTICE *]*\nPerintah ini hanya bisa digunakan di *Group*!`)
        if (plugin.admin && !isAdmins)
          return m.reply(`*[* BOT NOTICE *]*\nPerintah ini hanya bisa digunakan oleh *Admin Group*!`)
        if (plugin.botadmin && !isBotAdmins)
          return m.reply(`*[* BOT NOTICE *]*\nBot harus menjadi *Admin Group* untuk menggunakan perintah ini!`)

        await plugin(m, {
          kiicode,
          args,
          text,
          froms,
          mentionUser,
          prefix: usedPrefix,
          command: commandName,
          tagCategories,
          participants,
          pushname,
          isAdmins,
          isBotAdmins,
          isQuotedViewOnce,
          quoted,
          budy,
          botNumber,
          db,
          subject
        })
        break
      }
    }

    saveDB()
  } catch (err) {
    console.log(chalk.redBright("[ ERROR HANDLER ]"), err)
  }
}

fs.watch(path.join(__dirname, "plugins"), (eventType, filename) => {
  if (filename && filename.endsWith(".js")) {
    loadPlugins()
    console.log(chalk.green(`Plugin Updated: ${filename}`))
  }
})

const file = require.resolve(__filename)
fs.watchFile(file, () => {
  fs.unwatchFile(file)
  console.log(chalk.redBright(`Update ${__filename}`))
  delete require.cache[file]
  require(file)
})
