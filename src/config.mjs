import dotenv from 'dotenv'
import process from 'process'

dotenv.config()

const config = {}

Object.assign(config, process.env)
config.rootPath = process.cwd()
config.uploadPath = `${config.rootPath}/assets/uploads`
config.uploadUrl = '/uploads'

export default config
