# fhir_to_jsonld_context
Prototype for FHIR Shape Express JSON to JSONLD Contexts Files

### Installation
`npm install`

### Usage
*   `node src/createContext clean`  - Cleans the logs files in `logs` directory from previous runs.
*   `node src/createContext` - Creates JSON-LD context files in `jsonld/contexts` directory, using the sources files from `ShExJ` directory.

Note: Source Shape Expression JSON files files are taken from `https://github.com/fhircat/fhir_rdf_validator/tree/master/tests/cache`.

