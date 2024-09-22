const fs = require('fs-extra')
const path = require('path')

async function performBackup(sources, backupRoot) {
  const date = new Date()
  const dayIndex = date.getDay() // 0 (sunday) - 6 (saturday)
  const copyNum = (dayIndex % 3) + 1 // 1, 2 or 3
  const targetFolder = path.join(backupRoot, `Backup${copyNum}`)

  try {
    await fs.remove(targetFolder)
    await fs.mkdirp(targetFolder)

    for (const source of sources) {
      const sourceName = path.basename(source)
      const destination = path.join(targetFolder, sourceName)
      await fs.copy(source, destination, { overwrite: true })
      console.log(`Copied ${source} в ${destination}`)
    }

    const logMessage = `Backup completed to ${targetFolder} on ${date.toLocaleString()}\n`
    await fs.appendFile(path.join(backupRoot, 'backup.log'), logMessage)
    console.log(logMessage)
  } catch (error) {
    console.error('Backup error:', error)
    const errorLog = `Backup FAILED on ${date.toLocaleString()}: ${error}\n`
    await fs.appendFile(path.join(backupRoot, 'backup.log'), errorLog)
  }
}

module.exports = { performBackup }
