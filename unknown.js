import fs from 'fs'

fs.readdir('output/json', (err, filenames) => {
    filenames.forEach(filename => {
        console.log(filename)
        let rawdata = fs.readFileSync(`output/json/${filename}`)
        let data = JSON.parse(rawdata)
        traverse(data, process)
    })
})

function process(key,value) {
    // console.log(key + " : "+value);
    if (key.includes("/UNKNOWN#_")) {
        console.log("[EXTENSION]: " + key + " " + value)
    } else if (key.includes("/UNKNOWN#")) {
        console.log("[OTHER]: " + key + " " + value)
    }
}

function traverse(o,func) {
    for (let i in o) {
        func.apply(this,[i, o[i]])
        if (o[i] !== null && typeof(o[i])=="object") {
            //going one step down in the object tree!!
            if (i !== 'http://hl7.org/fhir/Bundle.entry.resource' && i !== 'http://hl7.org/fhir/DomainResource.contained' && i !== 'http://hl7.org/fhir/Parameters.parameter.resource') {
                traverse(o[i], func)
            }
        }
    }
}
