import Fs from 'fs'
import log4js from 'log4js'
import Converter from "./Converter"
import { NS_FHIR_SHAPE, logger } from "./utils"

log4js.configure('config/log4js.json')

let processedFiles = 0
let errorneousFiles = 0

function logUsage() {
  console.log('***********************************')
  console.log('Parameters are not provided...')
  console.log('Usage: babel-node src/createContext.js <directory path to shex json file>')
  console.log('***********************************\n')
}

function readFiles(dirname, onFileContent, onError) {
  logger.info('Source Directory is ' + dirname)
  Fs.readdir(dirname, function (err, filenames) {
    if (err) {
      onError(err)
      return
    }
    let i = 0, j = 0
    filenames.forEach(function (filename) {
      Fs.readFile(dirname + filename, 'utf-8', function (err, content) {
        if (err) {
          j++
          onError(err)
          return
        }
        logger.info("Content found for " + (++i) + ". " + filename)
        onFileContent(filename, content)
      })
    })
    processedFiles = i
    errorneousFiles = j
  })
}

function run(argv) {

  let av = argv.slice(2)
  if (av.length === 0) {
    logUsage()
    return
  }

  logger.info("Command line params:" + av)
  logger.info('Starting transformation')

  readFiles(av[0], function (filename, content) {
    const s = JSON.parse(content)
    const c = new Converter(s)
    const selected = filename
    if (!s.shapes) return
    const todo = s.shapes.map(
        shexpr => ({ shexpr, name: shexpr.id.substr(NS_FHIR_SHAPE.length)})
    ).filter(
        pair => pair.shexpr.type === 'Shape'
    )
    // ).filter(
    //     pair =>  selected.length
    //           ? selected.indexOf(pair.name) !== -1 // specific subset to serialize
    //           : !pair.name.match(/\./) // all that aren't nested shapes
    // )
    todo.forEach(pair => {
      const res = c.convert(pair.shexpr)
      Fs.writeFileSync(`jsonldc/contexts/r5/${pair.name.toLowerCase()}.context.jsonld`, JSON.stringify(res, null, 2))
    })
  }, function (err) {
    throw err
  })

  logger.info('Total ' + processedFiles + ' Files processed!')
  logger.info("Errors in " + errorneousFiles + " files.")
}

run(process.argv)

