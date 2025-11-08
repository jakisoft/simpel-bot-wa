const fs = require('fs');
const path = require('path');

const handler = async (m, { text }) => {
  if (!text) return m.reply(`Format salah.\nContoh: .delfile path/to/file`);

  const filePath = path.resolve(text);
  if (!fs.existsSync(filePath)) return m.reply('File tidak ditemukan.');

  fs.unlinkSync(filePath);
  m.reply(`File dihapus: ${filePath}`);
};

handler.command = /^(delfile|df)$/i;
handler.tags = ['owner'];
handler.owner = true;

module.exports = handler;