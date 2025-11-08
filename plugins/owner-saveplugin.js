const fs = require('fs')

let handler = async (m, { text, prefix, command }) => {
  if (!text) return m.reply(`• Example: ${prefix + command} menu`)
  if (!m.quoted || !m.quoted.text) return m.reply(`Reply message berisi kode plugin`)

  try {
    const filePath = `plugins/${text}.js`
    await fs.writeFileSync(filePath, m.quoted.text)
    m.reply(`Plugin berhasil disimpan di ${filePath}`)
  } catch (error) {
    console.log(error)
    m.reply('Gagal menyimpan plugin')
  }
}

handler.tags = ['owner']
handler.command = /^(saveplugin|sp)$/i
handler.owner = true

module.exports = handler