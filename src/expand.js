import jsonld from 'jsonld'
import fs from 'fs'
import optimist from 'optimist'

const argv = optimist.argv

async function comp(content, context) {
    const compacted = await jsonld.compact(content, context);
    return compacted;
}

async function exp(content, options={}) {
    const expanded = await jsonld.expand(content, options)
    return expanded
}

const content = fs.readFileSync(argv.f).toString()
const options = {}
if (argv.c) {
    options['expandContext'] = argv.c
}

exp(JSON.parse(content), options).then(val => {
    console.log(JSON.stringify(val, null, 2))
})



