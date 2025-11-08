const { writeExifVid } = require('../lib/exif');

const handler = async (m, { text, command, quoted, kiicode }) => {
  try {
    if (!quoted || !quoted.mimetype) return m.reply(`Balas video dengan caption *${command} author* atau *${command} packname|author*`);

    let [packname, author] = ["", ""];
    if (text.includes("|")) {
      [packname, author] = text.split("|").map(t => t.trim());
    } else {
      author = text.trim();
    }

    if (!author && !packname) return m.reply(`Gunakan perintah: *${command} packname|author* atau *${command} author*`);
    if (!/image/.test(quoted.mimetype)) return m.reply("Hanya bisa memproses video.");
    if (quoted.seconds > 11) return m.reply("Maksimal durasi 10 detik!");

    const mediaBuffer = await quoted.download();
    const metadata = {
      packname,
      author,
      categories: ['sticker'],
    };

    const result = await writeExifVid(mediaBuffer, metadata);
    await kiicode.sendMessage(m.chat, { sticker: result }, { quoted: m });

  } catch (error) {
    console.error(error);
    m.reply("Terjadi kesalahan saat membuat stiker.");
  }
};

handler.command = /^(swm|wm)$/i;
handler.tags = ['sticker'];
module.exports = handler;