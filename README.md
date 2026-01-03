<div align="center">

# playlists

**Spotify playlists (as a service).**

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/Node.js-20.x-green.svg)](https://nodejs.org/)
[![Spotify](https://img.shields.io/badge/Spotify-API-1DB954.svg)](https://developer.spotify.com/)

---

*Aggregate music recommendations from Reddit and RSS feeds.<br>Automatically curate and maintain your Spotify playlists.*

</div>

<br>

## ✨ Features

- 🤖 **AI-Powered Extraction** — Uses OpenAI to intelligently parse artist and track information from text
- 📡 **Multiple Sources** — Pull recommendations from Reddit communities and RSS feeds
- 🔄 **Automated Updates** — Scheduled cron jobs keep your playlists fresh
- ⚙️ **YAML Configuration** — Simple, declarative playlist definitions
- 🎛️ **CLI Interface** — Manual control when you need it

<br>

## 🚀 Quick Start

### Prerequisites

- [Node.js](https://nodejs.org/) 20.x
- [mise](https://mise.jdx.dev/) for environment management
- Spotify Developer credentials
- OpenAI API key

### Installation

```bash
# Clone the repository
git clone https://github.com/soulprovidr/playlists.git
cd playlists

# Install dependencies
npm install

# Configure environment variables
mise set OPENAI_API_KEY="your_key"
mise set SPOTIFY_CLIENT_ID="your_client_id"
mise set SPOTIFY_CLIENT_SECRET="your_client_secret"

# Run database migrations
npm run migrate:latest

# Start the server
npm run start
```

<br>

## 📖 Usage

### Server Mode

```bash
npm run start
```

Starts the API server on port 3000 with automatic playlist scheduling.

### CLI Mode

```bash
npm run cli
```

Interactive command-line interface for manual playlist operations.

<br>

## ⚙️ Configuration

Define your playlists in `config.yml`:

```yaml
spotifyUserId: "your_user_id"

playlists:
  - name: "My Playlist"
    spotifyPlaylistId: "playlist_id"
    entityType: "TRACKS"
    sources:
      reddit:
        - listentothis
        - indieheads
      rss:
        - https://pitchfork.com/feed/feed-album-reviews/rss
```

<br>

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

<br>

---

<div align="center">

Made with ♥ by [Shola Anozie](https://github.com/soulprovidr)

</div>
