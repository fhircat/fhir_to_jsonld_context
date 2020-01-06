import StreamZip from 'node-stream-zip'
import jsonld from "jsonld"
import fs from 'fs'
import { logger } from './utils'
import log4js from 'log4js'
import optimist from 'optimist'
import request from 'request'

log4js.configure('config/log4js.json')
const argv = optimist.argv

const zip = new StreamZip({
    file: argv.f,
    storeEntries: true
})

if (!fs.existsSync(`${argv.t}`)) {
    fs.mkdirSync(`${argv.t}`)
}
if (!fs.existsSync(`${argv.t}/json`)) {
    fs.mkdirSync(`${argv.t}/json`)
}
if (!fs.existsSync(`${argv.t}/nquads`)) {
    fs.mkdirSync(`${argv.t}/nquads`)
}

zip.on('ready', () => {
    logger.info('Entries read: ' + zip.entriesCount)
    for (const entry of Object.values(zip.entries())) {
        const desc = entry.isDirectory ? 'directory' : `${entry.size} bytes`
        logger.info(`Entry ${entry.name}: ${desc}`)
        const content = JSON.parse(zip.entryDataSync(entry).toString())
        logger.info(content.resourceType)
        const context = `https://fhircat.org/fhir/contexts/r5/${content.resourceType ? content.resourceType.toLowerCase() : content.resourceType }.context.jsonld`
        jsonld.expand(content, {expandContext: context}).then(val => {
            fs.writeFile(`${argv.t}/json/${entry.name}`, JSON.stringify(val, null, 2), err => {
                if (err) {
                    logger.error(entry.name, err)
                    return
                }
                logger.info(`file ${entry.name} created`)
            })
        })
        jsonld.toRDF(content, { expandContext: context, format: 'application/n-quads' }).then(val => {
            const filename = entry.name.replace(/\.json/, '.nq')
            fs.writeFile(`${argv.t}/nquads/${filename}`, val, err => {
                if (err) {
                    logger.error(filename, err)
                    return
                }
                logger.info(`file ${filename} created`)
            })
        })
    }
    zip.close()
})