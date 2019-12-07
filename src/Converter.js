import { shorten, Ns_rdf, Ns_fhsh, StupidBaseUrl, logger } from './utils'

export default class Converter {

    constructor (schema) {
        this.schema = schema
        this.visited = new Set()
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
        const found = this.schema.shapes.find(e => e.id === label)
        if (!found) {
            logger.error(Error(`${label} not found`))
            return null
        }
        if (!("expression" in found))
            logger.error(Error(`${label} has no expression`))
        return found.expression
    }

    visit (expr) {
        this.visited.add(expr.id)
        switch (expr.type) {
            case 'OneOf':
            case 'EachOf':
                return Object.assign.apply({}, expr.expressions.map(e => this.visit(e)))
            case 'TripleConstraint':
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
                    else if (expr.valueExpr.substr(Ns_fhsh.length).match(/\./)) {
                        if (this.visited.has(expr.id)) {
                            ret[attr]['@context'] = StupidBaseUrl(expr.valueExpr.substr(Ns_fhsh.length))
                        } else {
                            ret[attr]['@context'] = this.visit(this.lookup(expr.valueExpr))
                        }
                    } else {
                        ret[attr]['@context'] = StupidBaseUrl(expr.valueExpr.substr(Ns_fhsh.length))
                    }
                }
                return ret
            default:
                throw Error('what\'s a ' + JSON.stringify(expr))
        }
    }

}
