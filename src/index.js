require('dotenv').config()
const cron = require('node-cron')
const fs = require('fs-extra')
const { performBackup } = require('./backup')
const { fetchDataFromUnix } = require('./scp')

const BACKUP_ROOT = process.env.BACKUP_ROOT
const SOURCES = JSON.parse(process.env.SOURCES)
const LOG_FILE = process.env.LOG_FILE || `${BACKUP_ROOT}/backup.log`


const SCP_CONFIGS = JSON.parse(process.env.SCP_CONFIGS)

async function runBackupTask() {
  console.log('Start backup:', new Date().toLocaleString())

  await fetchDataFromUnix(SCP_CONFIGS, LOG_FILE)

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
