module.exports = {
  apps: [
    {
      name: 'courstrompette',
      script: 'npm',
      args: 'start',
      env: {
        ...process.env,
        NODE_ENV: 'production',
        PORT: process.env.PORT || '3005',
      },
    },
  ],
};
