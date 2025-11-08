let handler = async (m, { kiicode, froms, botNumber }) => {
  if (!froms) return m.reply("Tag atau balas pesan orang yang ingin dikeluarkan!");
  if (froms == global.owner || froms == botNumber) return m.reply(`Tidak bisa kick ${froms == global.owner ? 'creator saya' : 'bot'}!`);

  var datat = await kiicode.groupParticipantsUpdate(m.chat, [froms], "remove");
  for (let ryaa of datat) {
    if (ryaa.status === '406') {
      m.reply("Gagal kick member dengan alasan: *Dia yang membuat grup ini*");
    } else {
      m.reply("Sukses kick member");
    }
  }
};

handler.command = /^kick$/i;
handler.admin = true;
handler.group = true;
handler.botadmin = true;
handler.tags = ["group"];

module.exports = handler;