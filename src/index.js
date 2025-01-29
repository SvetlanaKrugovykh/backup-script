require('dotenv').config()
const cron = require('node-cron')
const fs = require('fs-extra')
const { performBackup } = require('./backup')
const { fetchDataFromUnix } = require('./scp')

const BACKUP_ROOT = process.env.BACKUP_ROOT
const SOURCES = JSON.parse(process.env.SOURCES)
const SCP_CONFIGS = JSON.parse(process.env.SCP_CONFIGS)


const LOG_DIR = process.env.LOG_DIR || 'logs'
const LOG_FILE = process.env.LOG_FILE || `${BACKUP_ROOT}/backup.log`
const Platform_OS = process.env.Platform_OS || 'FreeBSD'

function setupLogging() {
  if (!fs.existsSync(LOG_DIR)) {
    fs.mkdirSync(LOG_DIR, { recursive: true })
  }

  const logFile = path.join(LOG_DIR, LOG_FILE)
  const logStream = fs.createWriteStream(logFile, { flags: 'a' })

  console.log = (...args) => {
    const message = `${new Date().toISOString()} [INFO]: ${args.join(' ')}\n`
    process.stdout.write(message)
    logStream.write(message)
  }

  console.error = (...args) => {
    const message = `${new Date().toISOString()} [ERROR]: ${args.join(' ')}\n`
    process.stderr.write(message)
    logStream.write(message)
  }
}


async function runBackupTask() {
  console.log('Start backup:', new Date().toLocaleString())

  await fetchDataFromUnix(SCP_CONFIGS, LOG_FILE)

  await performBackup(SOURCES, BACKUP_ROOT, LOG_FILE)

  console.log('End backup:', new Date().toLocaleString())
}

const [hour, minute] = process.env.BACKUP_TIME.split(':')
const cronExpression = `${minute} ${hour} * * *`

if (Platform_OS === 'Windows') {
  setupLogging()
}

cron.schedule(cronExpression, () => {
  runBackupTask()
}, {
  scheduled: true,
  timezone: "Europe/warsaw"
})

console.log(`Backup planed at ${process.env.BACKUP_TIME} everyday.`)
