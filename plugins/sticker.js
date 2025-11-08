const fs = require("fs")
const path = require("path")
const crypto = require("crypto")
const ffmpeg = require("fluent-ffmpeg")
const { tmpdir } = require("os")
const webp = require("node-webpmux")

let handler = async (m, { kiicode, command }) => {
  try {
    const quoted = m.quoted ? m.quoted : m
    const mime = quoted?.mimetype || quoted.msg?.mimetype || ''

    if (!mime) {
      return kiicode.sendMessage(m.chat, {
        text: `Kirim atau reply gambar/video dengan caption *${command}*`,
      }, { quoted: m })
    }

    if (/image\/(jpe?g|png)/.test(mime)) {
      let img = await quoted.download()
      await kiicode.sendImageAsSticker(m.chat, img, m, {
        packname: global.packname,
        author: global.ownername,
      })
    } else if (/video/.test(mime)) {
      const duration = quoted.seconds || m.seconds || 0
      if (duration > 11) {
        return kiicode.sendMessage(m.chat, {
          text: "Maksimal durasi video adalah *10 detik!*",
        }, { quoted: m })
      }

      const media = await kiicode.downloadMediaMessage(quoted)

      const tmpFileRaw = path.join(tmpdir(), `${crypto.randomBytes(6).readUIntLE(0, 6).toString(36)}.mp4`)
      const tmpFileWebp = path.join(tmpdir(), `${crypto.randomBytes(6).readUIntLE(0, 6).toString(36)}.webp`)
      fs.writeFileSync(tmpFileRaw, media)

      await new Promise((resolve, reject) => {
        ffmpeg(tmpFileRaw)
          .on("error", reject)
          .on("end", () => resolve(true))
          .addOutputOptions([
            "-vcodec", "libwebp",
            "-vf", "scale='min(320,iw)':min'(320,ih)':force_original_aspect_ratio=decrease,fps=15, pad=320:320:-1:-1:color=white@0.0, split [a][b]; [a] palettegen=reserve_transparent=on:transparency_color=ffffff [p]; [b][p] paletteuse",
            "-loop", "0",
            "-ss", "00:00:00",
            "-t", "00:00:05",
            "-preset", "default",
            "-an",
            "-vsync", "0"
          ])
          .toFormat("webp")
          .save(tmpFileWebp)
      })

      fs.unlinkSync(tmpFileRaw)

      const metadata = {
        packname: global.packname,
        author: global.ownername
      }

      const tmpDir = path.join(__dirname, "../tmp/trash")
      const tmpFileIn = path.join(tmpDir, `${crypto.randomBytes(6).toString("hex")}.webp`)
      const tmpFileOut = path.join(tmpDir, `${crypto.randomBytes(6).toString("hex")}.webp`)
      const webpBuffer = fs.readFileSync(tmpFileWebp)
      fs.unlinkSync(tmpFileWebp)
      fs.writeFileSync(tmpFileIn, webpBuffer)

      if (metadata.packname || metadata.author) {
        const img = new webp.Image()
        const json = {
          "sticker-pack-id": "https://www.itzky.xyz",
          "sticker-pack-name": metadata.packname,
          "sticker-pack-publisher": metadata.author,
          "emojis": metadata.categories ? metadata.categories : [""]
        }

        const exifAttr = Buffer.from([
          0x49, 0x49, 0x2A, 0x00, 0x08, 0x00, 0x00, 0x00,
          0x01, 0x00, 0x41, 0x57, 0x07, 0x00, 0x00, 0x00,
          0x00, 0x00, 0x16, 0x00, 0x00, 0x00
        ])

        const jsonBuff = Buffer.from(JSON.stringify(json), "utf-8")
        const exif = Buffer.concat([exifAttr, jsonBuff])
        exif.writeUIntLE(jsonBuff.length, 14, 4)

        await img.load(tmpFileIn)
        fs.unlinkSync(tmpFileIn)
        img.exif = exif
        await img.save(tmpFileOut)

        const finalBuffer = fs.readFileSync(tmpFileOut)
        fs.unlinkSync(tmpFileOut)

        const tempPath = path.join(__dirname, "../tmp/trash", `${crypto.randomBytes(6).toString("hex")}.webp`)
        fs.writeFileSync(tempPath, finalBuffer)
        await kiicode.sendMessage(m.chat, { sticker: { url: tempPath } }, { quoted: m })
        fs.unlinkSync(tempPath)
      }
    } else {
      return kiicode.sendMessage(m.chat, {
        text: `Format tidak didukung. Kirim atau reply gambar/video dengan caption *${command}*`,
      }, { quoted: m })
    }
  } catch (err) {
    kiicode.sendMessage(m.chat, {
      text: `Gagal membuat stiker.\n\n${err}`,
    }, { quoted: m })
    console.log(err)
  }
}

handler.command = /^(sticker|stiker|s)$/i
handler.tags = ['sticker']

module.exports = handler