# Modular WhatsApp Bot

A versatile and modular WhatsApp bot built with Node.js and the `@whiskeysockets/baileys` library. This bot features a dynamic plugin system, allowing for easy addition and management of commands. It is designed for various tasks, including group administration, sticker creation, media downloading, and more, all managed through a simple JSON database.

## Features

-   **Dynamic Plugin System**: Hot-reloads plugins automatically, enabling the addition or modification of commands without restarting the bot.
-   **Comprehensive Group Management**: Includes tools for promoting/demoting admins, kicking members, toggling anti-link, setting custom welcome/goodbye messages, and performing hidetag mentions.
-   **Sticker Creation**: Easily create stickers from images and videos, with support for custom EXIF metadata (pack name and author).
-   **Media Downloader**: Scrapes and downloads media from various platforms including YouTube (Video & Audio), TikTok, Instagram, and Spotify.
-   **Customizable Lists**: Admins can create and manage custom text or media responses triggered by specific keywords within a group.
-   **Owner Commands**: Provides secure, owner-only commands to manage bot files and plugins directly from WhatsApp (e.g., get, save, delete files/plugins).
-   **Pairing Code Authentication**: Supports the latest WhatsApp pairing code authentication for a quick and secure setup process.
-   **Persistent JSON Database**: Stores user data, group settings, and other information in a simple `database.json` file.

## Tech Stack

-   **Core Framework**: Node.js
-   **WhatsApp API**: [@whiskeysockets/baileys](https://github.com/WhiskeySockets/Baileys)
-   **Media Processing**: [fluent-ffmpeg](https://github.com/fluent-ffmpeg/node-fluent-ffmpeg), [Jimp](https://github.com/jimp-dev/jimp), [node-webpmux](https://github.com/AlenSaito1/node-webpmux)
-   **HTTP & Scraping**: [axios](https://github.com/axios/axios), [cheerio](https://github.com/cheeriojs/cheerio)
-   **Utilities**: [chalk](https://github.com/chalk/chalk), [moment-timezone](https://momentjs.com/timezone/), [pino](https://github.com/pinojs/pino), [spinnies](https://github.com/jcarpanelli/spinnies)

## Getting Started

Follow these instructions to get a copy of the project up and running on your local machine.

### Prerequisites

-   Node.js (v16 or higher recommended)
-   [ffmpeg](https://ffmpeg.org/download.html) installed and added to your system's PATH. This is required for sticker creation and other media processing tasks.

### Installation

1.  **Clone the repository:**
    ```sh
    git clone https://github.com/jakisoft/simpel-bot-wa.git
    cd simpel-bot-wa
    ```

2.  **Install dependencies:**
    ```sh
    npm install
    ```

3.  **Configure the bot:**
    Open the `system/settings.js` file and update the global variables, especially the `owner` number.
    ```js
    global.owner = ["6281234567890"] // Replace with your WhatsApp number
    global.ownername = "Your Name"
    global.botname = "MyBot"
    // ... other settings
    ```

4.  **Run the bot:**
    ```sh
    npm start
    ```
    On the first run, you will be prompted to enter your WhatsApp number (with country code, e.g., 62812...). A pairing code will be generated in the terminal. Enter this code on your phone in `WhatsApp > Linked Devices > Link with phone number`.

## Usage

Once the bot is running and connected, you can interact with it using commands in any chat it is a part of. The default command prefixes are `!`, `.`, `#`, and `/`.

### General Commands

-   **Show the main menu:**
    ```
    .menu
    ```
-   **Check bot latency:**
    ```
    .ping
    ```

### Sticker Commands

-   **Create a sticker from an image/video:**
    Reply to an image or a video (max 10 seconds) with the command:
    ```
    .sticker
    ```
-   **Create a sticker with custom metadata:**
    Reply to a video with the command:
    ```
    .swm MyPack|MyAuthor
    ```

### Group Management (Admin Only)

-   **Kick a member:**
    ```
    .kick @user
    ```
-   **Promote a member to admin:**
    ```
    .promote @user
    ```
-   **Enable or disable the anti-link feature:**
    ```
    .antilink on
    .antilink off
    ```

### Owner Commands

-   **Get the code of a plugin:**
    ```
    .getplugin main-menu
    ```
-   **Save a new plugin:**
    Reply to a message containing JavaScript code with the command:
    ```
    .saveplugin new-command
    ```

## License

This project is licensed under the **ISC License**.
