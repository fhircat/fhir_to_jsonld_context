import Fs from 'fs'
import Path from 'path'
import log4js from 'log4js'
import rimraf from 'rimraf'
import Shex from '@shexjs/core'

const Ns_fh = 'http://hl7.org/fhir/'
const Ns_fhsh = 'http://hl7.org/fhir/shape/'
const Ns_rdf = 'http://www.w3.org/1999/02/22-rdf-syntax-ns#'
const StupidBaseUrl = r => `http://uu3.org/fhir/${r}-R4-jsonld-1.1-context.jsonld`
const DTRegExp = RegExp('^(http://hl7.org/fhir/shape/[a-z]|http://www.w3.org/2001/XMLSchema#)')

const logger = log4js.getLogger("app");

const report = e => console.warn(e.message)

const processedFiles = 0;
const errorneousFiles = 0;
// Config
log4js.configure('config/log4js.json');

function readFiles(dirname, onFileContent, onError) {
    log('Source Directory is ' + dirname);
    Fs.readdir(dirname, function(err, filenames) {
      if (err) {
        onError(err);
        return;
      }
      let i = 0;
      let j = 0;
      filenames.forEach(function(filename) {
        Fs.readFile(dirname + filename, 'utf-8', function(err, content) {
          if (err) {
              j++;
            onError(err);
            return;
          }
          console.log("Content found for " + (++i) + ". " + filename);
          onFileContent(filename, content);
        });
      })
      processedFiles = i;
      errorneousFiles = j;
    });
  }

  class Converter {

    constructor (schema) {
      this.schema = schema;
      this.toDOs = schema
    }

    convert (shexpr) {
      const ret = {
        '@context': Object.assign({
          '@version': 1.1,
          '@vocab': 'http://janeirodigital.github.io/nhs-care-plan/flat-FHIR.ttl#',
          'xsd': 'http://www.w3.org/2001/XMLSchema#' ,
          'fhir': 'http://hl7.org/fhir/',
          'rdf': 'http://www.w3.org/1999/02/22-rdf-syntax-ns#',
        }, this.visit(shexpr.expression)) // this.lookup(from)
      }
      return ret
    }

    lookup (label) {
        if (label.indexOf('Parameter') !== -1)
            log('Label ' + label);
      const found = this.schema.shapes.find(e => e.id === label)
      if (!found) {
        report(Error(`${label} not found`))
        return null
      }
      if (!("expression" in found))
        report(Error(`${label} has no expression`))

    const index = this.toDOs.shapes.indexOf(o => o.id === label),
    removed = index !== -1 && this.toDOs.shapes.splice(index, 1);

    if (index === -1){
        // this must have been processed earlier.
        return null;
    }

    return found.expression
    }

    visit (expr) {
        if (!expr)
          return;
      //console.log("Expression:" + expr);
      log('\tProcessing (' + expr.type + ')');
      switch (expr.type) {
      case 'OneOf':
      case 'EachOf':
      log('\t\t Items (' + expr.expressions.length + ')');
        return Object.assign.apply({}, expr.expressions.map(e => this.visit(e)))
      case 'TripleConstraint':
      log('\t\Predicate (' + expr.predicate + ')');
        const {id, attr} = shorten(expr.predicate)
        if (id === 'fhir:nodeRole')
          return {}
        if (id === 'rdf:type')
          return { "resourceType": { "@id": "rdf:type" , "@type": "@id" } }
        const ret = { }
        ret[attr] = { '@id': id }
        if (expr.predicate !== Ns_rdf + 'type' /* || typeof expr.valueExpr === 'string' */) {
          // if (expr.valueExpr.match(DTRegExp))
          //   ret[attr]['@type'] = expr.valueExpr
          if (typeof expr.valueExpr === 'object')
            ret[attr]['@type'] = expr.valueExpr.datatype
          else if (expr.valueExpr.substr(Ns_fhsh.length).match(/\./))
            ret[attr]['@context'] = this.visit(this.lookup(expr.valueExpr))
          else
            ret[attr]['@context'] = StupidBaseUrl(expr.valueExpr.substr(Ns_fhsh.length))
        }
        return ret
      default:
        throw Error('what\'s a ' + JSON.stringify(expr))
      }
    }

  }

  function shorten (p) {
    if (p === Ns_rdf + 'type')
      return {id: 'rdf:type', attr: 'resourceType'}
    const pairs = [{prefix: 'fhir', ns: Ns_fh},
                   {prefix: 'rdf', ns: Ns_rdf}]
    return pairs.reduce((acc, pair) => {
      if (!p.startsWith(pair.ns))
        return acc
      const localName = p.substr(pair.ns.length) // .replace(/[a-zA-Z]+\./, '')
      const n = pair.prefix + ':' + escape(localName)
      return acc.id === null || n.length < acc.id.length ? {id: n, attr: localName} : acc
    }, {id: null, attr: null})
  }

  function escape (localName) {
    return localName
  }

/***************** BEGIN *********************/

function run (argv) {

    var av = argv.slice(2)
    if (av.length == 0){
        logUsage();
        return;
    }

    console.log("Command line params:" + av);

    if (av == 'clean'){
        clearFilesInDirectory('logs');
        clearFilesInDirectory('jsonldc/contexts/r5');
        return;
    }

    log('Starting transformation on ' + getTS());

    var data = {};

    readFiles(av[0], function(filename, content) {
        //data[filename] = content;

        const s = JSON.parse(content);
        const c = new Converter(s)
        const selected = filename;
        const todo = s.shapes.map(
          shexpr => ({ shexpr, name: shexpr.id.substr(Ns_fhsh.length)})
        ).filter(
          pair => selected.length
            ? selected.toLowerCase().indexOf(pair.name.toLowerCase()) !== -1 // specific subset to serialize
            : !pair.name.match(/\./) // all that aren't nested shapes
        )
        todo.forEach(pair => {
          const res = c.convert(pair.shexpr)
          log(pair.name);
          //console.log(pair.name, '################################\n', JSON.stringify(res, null, 2))
          Fs.writeFileSync(Path.join('jsonldc/contexts/r5', pair.name), JSON.stringify(res, null, 2))
        })
      }, function(err) {
        throw err;
      });

      log('Total ' + processedFiles + ' Files processed!');
    log("Errors in " + errorneousFiles + " files.");
}

run(process.argv);

/*********************************************/

function logUsage(){
    console.log('\n***********************************');
    console.log('\nParameters are not [correctly] provided...\n\n')
    console.log("Usage: node src/createContext.js ['directory path to shex json file' | clean]");
    console.log("\n\tclean: cleans the old log files for previous runs in 'logs' directory.");
    console.log('\n***********************************\n');
}

function clearFilesInDirectory(d)
{
    rimraf('./' + d + '/*', function () { console.log("Deleted files in directory '" + d + "'"); });
    logger = log4js.getLogger("app");
}

function getTS()
{
    var newDate = new Date();
    return "TS: " + newDate.toLocaleTimeString();
}

function log(message){
    console.log(message);
    logger.debug(message);
}
