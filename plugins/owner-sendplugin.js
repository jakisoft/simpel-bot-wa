let fs = require('fs')
let path = require('path')

let handler = async (m, { kiicode, text, owner }) => {
  let target = m.mentionedJid && m.mentionedJid[0]
  if (!target && m.quoted && m.quoted.sender) target = m.quoted.sender
  if (!target) return m.reply('Tag atau balas chat teman yang ingin dikirim plugin!')

  if (!text) return m.reply('Masukkan nama plugin yang ingin dikirim!')

  let pluginsDir = path.join(__dirname)
  let filename = text.endsWith('.js') ? text : `${text}.js`
  let filePath = path.join(pluginsDir, filename)
  
  if (!fs.existsSync(filePath)) {
    return m.reply(`Plugin *${filename}* tidak ditemukan!`)
  }

  try {
    await kiicode.sendMessage(target, { 
      document: { url: filePath }, 
      mimetype: 'application/javascript',
      fileName: filename,
      caption: `Plugin ${filename} dari owner`,
    }, { mentions: [target, owner + '@s.whatsapp.net'] })

    await kiicode.sendMessage(m.chat, { 
      text: `Berhasil mengirim plugin *${filename}* ke @${target.split('@')[0]}`, 
      mentions: [target, owner + '@s.whatsapp.net'] 
    })
  } catch (e) {
    m.reply('Gagal mengirim plugin. Error: ' + e.message)
  }
}

handler.command = /^sendplugin$/i
handler.tags = ["owner"]
handler.owner = true

module.exports = handler