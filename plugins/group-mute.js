let handler = async (m, { kiicode, args, command, db }) => {
  const option = args[0] ? args[0].toLowerCase() : ''
  const id = m.chat
  db.groups[id] = db.groups[id] || {}
  db.groups[id].mute = db.groups[id].mute || false

  if (!option)
    return m.reply(`Gunakan dengan cara: ${command} on / off`)

  if (option === 'on') {
    if (db.groups[id].mute) return m.reply('Bot sudah dalam mode mute di grup ini.')
    db.groups[id].mute = true
    m.reply('Bot sekarang dalam mode mute.\nHanya admin grup dan owner yang dapat menggunakan bot di grup ini.')
  } else if (option === 'off') {
    if (!db.groups[id].mute) return m.reply('Bot tidak dalam mode mute.')
    db.groups[id].mute = false
    m.reply('Mode mute dimatikan.\nSemua anggota grup sekarang dapat menggunakan bot.')
  } else {
    m.reply(`Gunakan dengan cara: ${command} on / off`)
  }
}

handler.tags = ['group']
handler.command = /^mute$/i
handler.group = true
handler.admin = true
handler.botAdmin = true

module.exports = handler
