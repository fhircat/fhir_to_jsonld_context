# fhir_to_jsonld_context
Prototype for FHIR Shape Express JSON to JSONLD Contexts Files

### Installation
`yarn install`

### Usage
*   `yarn clean`  - Cleans the logs files in `logs` directory from previous runs.
*   `yarn generate ./shexj/r5/` - Creates JSON-LD context files in `jsonld/contexts/r5` directory, using the sources files from `shexj/r5` directory.
*   `yarn jsonld -c expand -i file [-x context]` - Expand a JSON file. context can be in the `@context` field in the file, or provided using the command line argument -x, --context
*   `yarn jsonld -c frame -i file -f frame_file` - Frame a JSON file using the frame. 
*   `babel-node src/fhir-convert.js -f test/examples-json.zip -t output`


Note: Source Shape Expression JSON files files are taken from `https://github.com/fhircat/fhir_rdf_validator/tree/master/tests/cache`.

