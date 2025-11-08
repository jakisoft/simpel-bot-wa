const fs = require('fs')
const path = require('path')

const handler = async (m, { text, command }) => {
  if (!text) return m.reply(`Format salah.\nContoh: .${command} path/to/file.ext`)
  const filePath = path.resolve(text)

  if (m.quoted?.mtype?.endsWith('Message') && m.quoted?.download) {
    const buffer = await m.quoted.download()
    fs.writeFileSync(filePath, buffer)
    return m.reply(`File berhasil disimpan ke: ${filePath}`)
  }

  if (m.quoted?.text) {
    const code = m.quoted.text
    fs.writeFileSync(filePath, code)
    return m.reply(`Teks berhasil disimpan ke: ${filePath}`)
  }

  return m.reply(`Reply ke pesan teks atau media untuk disimpan.`)
}

handler.command = /^(savefile|sf)$/i
handler.tags = ['owner']
handler.owner = true

module.exports = handler