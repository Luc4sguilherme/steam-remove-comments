# Linux (ubuntu)
## 1° Update ubuntu
<pre>
  sudo apt update && sudo apt upgrade
</pre>

## 2° Install Node.js
<pre>
  curl -fsSL https://deb.nodesource.com/setup_14.x | sudo -E bash -

  sudo apt-get install -y nodejs
</pre>

## 3° Install dependencies
<pre>
  npm install --production --force
</pre>

## 4° Setting the bot
- <code>cd src/config</code>

- <code>mv main.example.js main.js</code>

- <code>vim main.js</code>

- Press the key <code>i</code>

- Fill in all empty fields

- Press the key <code>ESC</code>

- Type in keyboard <code>:wq</code>

- Press <code>Enter</code>

## 5° Starting
<pre>
  npm start
</pre>

# Windows 10
## 1° Install Node.js
<pre>
  <a href=https://nodejs.org/dist/v14.17.5/node-v14.17.5-x64.msi>https://nodejs.org/dist/v14.17.5/node-v14.17.5-x64.msi</a>
</pre>

## 2° Install dependencies
  - Unzip
  - run <code>install.bat</code> file

## 3° Setting the bot
  - Navigate to <code>src/config</code>
  - Rename the <code>main.example.js</code> file to <code>main.js</code>
  - Open the <code>main.js</code> file
  - Fill in all empty fields
  
## 4° Starting
  - run <code>start.bat</code> file
