const { NodeSSH } = require('node-ssh')
const ssh = new NodeSSH()
const fs = require('fs-extra')

async function fetchDataFromFreeBSD(config, logFile) {
  try {
    const privateKey = config.SCP_PRIVATE_KEY
      ? await fs.readFile(config.SCP_PRIVATE_KEY, 'utf8')
      : undefined

    await ssh.connect({
      host: config.SCP_HOST,
      port: config.SCP_PORT,
      username: config.SCP_USERNAME,
      password: config.SCP_PASSWORD || undefined,
      privateKey: privateKey || undefined
    })

    const remotePath = config.SCP_REMOTE_PATH
    const localPath = `${config.BACKUP_ROOT}/FreeBSD_Data`

    await fs.ensureDir(localPath)

    await ssh.getFile(`${localPath}/data.tar.gz`, remotePath)

    const logMessage = `SCP data fetched from ${config.SCP_HOST} on ${new Date().toLocaleString()}\n`
    await fs.appendFile(logFile, logMessage)
    console.log(logMessage)
  } catch (error) {
    console.error('SCP Error:', error)
    const errorLog = `SCP FAILED on ${new Date().toLocaleString()}: ${error}\n`
    await fs.appendFile(logFile, errorLog)
  } finally {
    ssh.dispose()
  }
}

module.exports = { fetchDataFromFreeBSD }
