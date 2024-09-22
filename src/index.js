require('dotenv').config()
const cron = require('node-cron')
const fs = require('fs-extra')
const { performBackup } = require('./backup')
const { fetchDataFromFreeBSD } = require('./scp')

const BACKUP_ROOT = process.env.BACKUP_ROOT
const SOURCES = JSON.parse(process.env.SOURCES)
const LOG_FILE = process.env.LOG_FILE || `${BACKUP_ROOT}/backup.log`

const SCP_CONFIG = {
  SCP_HOST: process.env.SCP_HOST,
  SCP_PORT: process.env.SCP_PORT || 22,
  SCP_USERNAME: process.env.SCP_USERNAME,
  SCP_PASSWORD: process.env.SCP_PASSWORD,
  SCP_REMOTE_PATH: process.env.SCP_REMOTE_PATH || '/remote/path/data.tar.gz',
  BACKUP_ROOT: BACKUP_ROOT
}

async function runBackupTask() {
  console.log('Start backup:', new Date().toLocaleString())

  await fetchDataFromFreeBSD(SCP_CONFIG, LOG_FILE)

  await performBackup(SOURCES, BACKUP_ROOT, LOG_FILE)

  console.log('End backup:', new Date().toLocaleString())
}

const [hour, minute] = process.env.BACKUP_TIME.split(':')
const cronExpression = `${minute} ${hour} * * *`

cron.schedule(cronExpression, () => {
  runBackupTask()
}, {
  scheduled: true,
  timezone: "Europe/warsaw"
})

console.log(`Backup planed at ${process.env.BACKUP_TIME} everyday.`)
