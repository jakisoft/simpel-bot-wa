let handler = async (m, { kiicode, participants, subject }) => {
  try {
    const groupId = m.chat
    const groupData = global.db.data.groups[groupId] || {}
    const totalChatData = groupData.totalchat || {}

    const totalChatsInGroup = participants.map(p => ({
      user: p.jid,
      count: totalChatData[p.jid] || 0
    }))

    const totalSemuaChat = totalChatsInGroup.reduce((sum, entry) => sum + entry.count, 0)

    const daftarChat = totalChatsInGroup
      .sort((a, b) => b.count - a.count)
      .map((entry, index) => `│ ${index + 1}. @${entry.user.split('@')[0]}: ${entry.count} pesan`)
      .join('\n')

    const tanggalSekarang = new Date().toLocaleDateString('id', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })

    const pesan = [
      `*「 Total Chat Grup 」*`,
      ``,
      `*Tanggal:* ${tanggalSekarang}`,
      `*Grup:* ${subject || 'Tanpa Nama'}`,
      `*Total Semua Chat:* ${totalSemuaChat.toLocaleString()}`,
      ``,
      `┌─ Daftar Total Chat:`,
      daftarChat || '│ (Belum ada data chat)',
      `└────`
    ].join('\n')

    await kiicode.sendMessage(m.chat, {
      text: pesan,
      mentions: participants.map(p => p.jid)
    }, { quoted: m })
  } catch (err) {
    console.error(err)
    await kiicode.sendMessage(m.chat, {
      text: `Gagal mengambil data total chat.\n\n${err.message}`
    }, { quoted: m })
  }
}

handler.command = /^(listtotalchat|totalchat)$/i
handler.tags = ["group"]
handler.admin = true
handler.group = true

module.exports = handler