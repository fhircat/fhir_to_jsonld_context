# fhir_to_jsonld_context
Prototype for FHIR Shape Express JSON to JSONLD Contexts Files

### Installation
`yarn install`

### Usage
*   `yarn clean`  - Cleans the logs files in `logs` directory from previous runs.
*   `yarn generate ./shexj/r5/` - Creates JSON-LD context files in `jsonld/contexts/r5` directory, using the sources files from `shexj/r5` directory.

Note: Source Shape Expression JSON files files are taken from `https://github.com/fhircat/fhir_rdf_validator/tree/master/tests/cache`.

