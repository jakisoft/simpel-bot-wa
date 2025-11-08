let handler = async (m, { kiicode, froms, botNumber }) => {
  if (!froms) return m.reply("Tag atau balas pesan admin yang ingin dijadikan member biasa");
  if (froms == global.owner || froms == botNumber) return m.reply(`Tidak bisa demote ${froms == global.owner ? 'creator saya' : 'bot'}!`);

  kiicode.groupParticipantsUpdate(m.chat, [froms], 'demote')
    .then(() => {
      kiicode.sendMessage(m.chat, { 
        text: `Sukses menjadikan @${froms.split('@')[0]} sebagai member biasa`, 
        mentions: [froms] 
      }, { quoted: m });
    })
    .catch(() => m.reply("Terjadi kesalahan saat menurunkan admin"));
};

handler.command = /^(demote|dm)$/i;
handler.admin = true;
handler.group = true;
handler.botadmin = true;
handler.tags = ["group"];

module.exports = handler;