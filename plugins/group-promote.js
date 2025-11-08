let handler = async (m, { kiicode, froms }) => {
  if (!froms) return m.reply("Tag atau balas pesan member yang ingin dijadikan admin");

  kiicode.groupParticipantsUpdate(m.chat, [froms], 'promote')
    .then(() => {
      kiicode.sendMessage(m.chat, { 
        text: `Sukses menjadikan @${froms.split('@')[0]} sebagai admin`, 
        mentions: [froms] 
      }, { quoted: m });
    })
    .catch(() => m.reply("Terjadi kesalahan saat mempromosikan admin"));
};

handler.command = /^(promote|pm)$/i;
handler.admin = true;
handler.group = true;
handler.botadmin = true;
handler.tags = ["group"];

module.exports = handler;