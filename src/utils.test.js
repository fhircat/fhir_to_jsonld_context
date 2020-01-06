import {contextUrl, shorten} from "./utils";

test('shorten uri for rdf:type', () => {
    const uri = 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type'
    const s = shorten(uri)
    expect(s).toEqual({ id: 'rdf:type', attr: 'resourceType' })
})

test('shorten uri for fhir:Account', () => {
    const uri = 'http://hl7.org/fhir/Account'
    const s = shorten(uri)
    expect(s).toEqual({ id: 'fhir:Account', attr: 'Account' })
})

test('shorten uri with a unresolved prefix', () => {
    const uri = 'http://example.org/Unknown'
    const s = shorten(uri)
    expect(s).toEqual({ id: null, attr: null })
})

test('contextUri creator', () => {
    const uri = 'https://fhircat.org/fhir/contexts/r5/Account.context.jsonld'
    expect(contextUrl('Account')).toBe(uri)
})