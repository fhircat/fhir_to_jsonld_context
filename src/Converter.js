import { shorten, NS_RDF, NS_FHIR_SHAPE, contextUrl } from './utils'

export default class Converter {

    constructor (schema) {
        this.schema = schema
        this.visited = new Set()
    }

    convert (shexpr) {
        const ret = {
            '@context': Object.assign({
                '@version': 1.1,
                '@vocab': 'http://example.com/UNKNOWN#',
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
            throw Error(`${label} not found`)
        } else if (!("expression" in found)) {
            throw Error(`${label} has no expression`)
        }
        return found.expression
    }

    visit (expr) {
        this.visited.add(expr.predicate)
        let ret
        switch (expr.type) {
            case 'OneOf':
            case 'EachOf':
                ret = Object.assign.apply({}, expr.expressions.map(e => this.visit(e)))
                break
            case 'TripleConstraint':
                ret = {}
                let {id, attr} = shorten(expr.predicate)
                if (id === 'fhir:nodeRole') {
                    ret = {}
                } else if (id === 'rdf:type') {
                    ret = { "resourceType": { "@id": "rdf:type" , "@type": "@id" } }
                }  else {
                    if (typeof(attr) !== 'undefined') {
                        attr = attr.split('.').pop() // Convert "Resource.property" to "property"
                    }
                    ret[attr] = { '@id': id }
                    if (expr.predicate !== NS_RDF + 'type' /* || typeof expr.valueExpr === 'string' */) {
                        if (typeof expr.valueExpr === 'object') {
                            ret[attr]['@type'] = expr.valueExpr.datatype
                        } else if (expr.valueExpr.substr(NS_FHIR_SHAPE.length).match(/\./)) {  // valueExpr:
                            if (this.visited.has(expr.id)) {
                                ret[attr]['@context'] = contextUrl(expr.valueExpr.substr(NS_FHIR_SHAPE.length))
                            } else {
                                ret[attr]['@context'] = this.visit(this.lookup(expr.valueExpr))
                            }
                        } else {
                            ret[attr]['@context'] = contextUrl(expr.valueExpr.substr(NS_FHIR_SHAPE.length))
                        }
                    }
                }
                break
            default:
                throw Error(`Undefined expression type: ${JSON.stringify(expr)}`)
        }
        return ret
    }

}
