let fs = require('fs')
let path = require('path')

let handler = async (m, { kiicode, text }) => {
  if (!text) return m.reply('Masukkan nama plugin yang ingin diambil!')
  
  let pluginsDir = path.join(__dirname)
  let filename = text.endsWith('.js') ? text : `${text}.js`
  let filePath = path.join(pluginsDir, filename)
  
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf-8')
    m.reply(`${content}`)
  } else {
    let files = fs.readdirSync(pluginsDir).filter(file => file.endsWith('.js'))
    let listPlugins = files.map(file => `• ${file}`).join('\n')
    m.reply(`Plugin *${filename}* tidak ditemukan!\n\nDaftar plugin yang tersedia:\n${listPlugins}`)
  }
}

handler.command = /^(getplugin|gp)$/i
handler.tags = ["owner"]
handler.owner = true

module.exports = handler