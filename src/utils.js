import log4js from 'log4js'

export const NS_RDF = 'http://www.w3.org/1999/02/22-rdf-syntax-ns#'

export const DTRegExp = RegExp('^(http://hl7.org/fhir/shape/[a-z]|http://www.w3.org/2001/XMLSchema#)')
export const NS_FHIR = 'http://hl7.org/fhir/'
export const NS_FHIR_SHAPE = 'http://hl7.org/fhir/shape/'
export const logger = log4js.getLogger()

// export const contextUrl = r => `https://fhircat.org/fhir/contexts/r5/${r.toLowerCase()}.context.jsonld`
export const contextUrl = r => `${r.toLowerCase()}.context.jsonld`

// shorten an predicate URL
export const shorten = (uri) => {
    let ret = { id: null, attr: null }
    if (uri === NS_RDF + 'type') {
        ret = { id: 'rdf:type', attr: 'resourceType' }
    } else {
        const pairs = [
            { prefix: 'fhir', ns: NS_FHIR },
            { prefix: 'rdf',  ns: NS_RDF }
        ]
        const pair = pairs.find(p => uri.startsWith(p.ns))
        if (pair) {
            const localName = uri.substr(pair.ns.length)
            const n = pair.prefix + ':' + escape(localName)
            ret = { id: n, attr: localName }
        }
    }
    return ret
}

export const escape = (localName) => {
    return localName
}