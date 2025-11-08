const fs = require('fs');
const path = require('path');
const mime = require('mime-types');

const handler = async (m, { kiicode, text }) => {
  if (!text) return m.reply(`Format salah.\nContoh: .getfile path/to/file`);

  const filePath = path.resolve(text);
  if (!fs.existsSync(filePath)) return m.reply('File tidak ditemukan.');

  const mimeType = mime.lookup(filePath) || 'application/octet-stream';
  const buffer = fs.readFileSync(filePath);

  let type;
  if (/image/.test(mimeType)) type = 'image';
  else if (/video/.test(mimeType)) type = 'video';
  else if (/audio/.test(mimeType)) type = 'audio';
  else type = 'document';

  await m.reply(`Mengirim file: ${filePath}`);
  await kiicode.sendMessage(m.chat, {
    [type]: buffer,
    mimetype: mimeType,
    fileName: path.basename(filePath)
  }, { quoted: m });
};

handler.command = /^(getfile|gf)$/i;
handler.tags = ['owner'];
handler.owner = true;

module.exports = handler;