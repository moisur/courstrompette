const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Charger le fichier .env.production s'il existe
const envConfig = {};
if (fs.existsSync(path.join(__dirname, '.env.production'))) {
  const parsed = dotenv.parse(fs.readFileSync(path.join(__dirname, '.env.production')));
  for (const key in parsed) {
    // Doubler les dollars pour empêcher PM2 de faire de l'expansion de variable dessus
    envConfig[key] = parsed[key].replace(/\$/g, '$$$$');
  }
}

module.exports = {
  apps: [
    {
      name: 'courstrompette',
      script: 'npm',
      args: 'start',
      env: {
        ...process.env,
        ...envConfig,
        NODE_ENV: 'production',
        PORT: process.env.PORT || '3005',
      },
    },
  ],
};
