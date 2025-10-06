module.exports = {
  apps: [
    {
      name: "my-app",
      script: "npm",
      args: "run serve",
      max_memory_restart: "150M",
      cron_restart: "0 0 * * *",
      env: {
        NODE_ENV: "production"
      }

    }
  ]
}
