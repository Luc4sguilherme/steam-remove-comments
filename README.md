# Steam Remove Comments

A CLI tool to bulk-remove comments from your Steam profile or comments you've left on other profiles.   
Built with [React Ink](https://github.com/vadimdemedes/ink) for an interactive terminal UI.

## Features

- **Remove your comments from other profiles** — Scans your comment history and deletes every comment you've posted on other users' profiles.
- **Remove comments from your profile** — Deletes comments left on your own profile, with filtering options:
  - Only comments made by others
  - Only comments made by you
  - All comments
- **Batch processing** with configurable concurrency and delay to avoid rate limiting.
- **Interactive terminal UI** with progress tracking.

## Prerequisites

- [Node.js](https://nodejs.org/) >= 20
- A Steam account with credentials (username, password, and Steam Guard secrets)

## Installation

### 1. Clone the repository

```bash
git clone https://github.com/Luc4sguilherme/steam-remove-comments.git
cd steam-remove-comments
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure your Steam account

Copy the example config and fill in your credentials:

```bash
cp src/config/main.example.js src/config/main.js
```

Edit `src/config/main.js` with your preferred editor:


## Usage

```bash
npm start
```

The interactive CLI will guide you through selecting a removal mode and filter options.

## License

MIT © [Lucas Guilherme](https://github.com/Luc4sguilherme)
