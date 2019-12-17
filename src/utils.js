import log4js from 'log4js'

export const Ns_rdf = 'http://www.w3.org/1999/02/22-rdf-syntax-ns#'

export const DTRegExp = RegExp('^(http://hl7.org/fhir/shape/[a-z]|http://www.w3.org/2001/XMLSchema#)')
export const Ns_fh = 'http://hl7.org/fhir/'
export const Ns_fhsh = 'http://hl7.org/fhir/shape/'
export const logger = log4js.getLogger()

export const StupidBaseUrl = r => `https://fhircat.org/fhir/contexts/r5/${r}.context.jsonld`
export const shorten = (p) => {
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

export const escape = (localName) => {
    return localName
}