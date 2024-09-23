const { NodeSSH } = require('node-ssh')
const ssh = new NodeSSH()
const fs = require('fs-extra')

async function fetchDataFromUnix(configs, logFile) {
  for (const config of configs) {
    try {
      if (!config.SCP_PRIVATE_KEY) {
        console.log(`Skipping ${config.SCP_HOST} due to missing private key.`)
        continue
      }

      const privateKey = await fs.readFile(config.SCP_PRIVATE_KEY, 'utf8')
      const SCP_PASSPHRASE = process.env.SCP_PASSPHRASE
      const BACKUP_ROOT = process.env.BACKUP_ROOT

      await ssh.connect({
        host: config.SCP_HOST,
        port: config.SCP_PORT,
        username: config.SCP_USERNAME,
        privateKey: privateKey || undefined,
        passphrase: SCP_PASSPHRASE || undefined
      })

      const remotePath = config.SCP_REMOTE_PATH
      const localPath = `${BACKUP_ROOT}/Unix_Data_${config.SCP_HOST}`

      await fs.ensureDir(localPath)

      const result = await ssh.execCommand(`ls ${remotePath}/*.tar`)
      const files = result.stdout.split('\n').filter(file => file.trim() !== '')

      for (const file of files) {
        const fileName = file.split('/').pop()
        await ssh.getFile(`${localPath}/${fileName}`, file)
      }

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
}

module.exports = { fetchDataFromUnix }
