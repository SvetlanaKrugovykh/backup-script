# Backup Script

Backup Script

## Requirements

- Node.js .
- WinSCP

## Install

    ```bash
    npm install
    ```

## PM2:

    ```bash
    npm install -g pm2
    pm2 start src/index.js --name "backup-script"
    pm2 save
    pm2 startup
    ```

## Setup

- **BACKUP_ROOT**
- **SOURCES**
- **WINSCP_PATH**
- **SFTP\_\* параметры**
- **BACKUP_TIME**

## Logs

`...:/Backup/backup.log`.

```bash
node src/index.js
```
