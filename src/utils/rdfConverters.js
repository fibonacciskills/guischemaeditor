/**
 * Lightweight JSON-LD and Turtle converters for schema sample data.
 * No external RDF libraries required.
 */

// Property name → schema.org / HROpen mapping
const SCHEMA_ORG_MAPPINGS = {
  name: 'schema:name',
  description: 'schema:description',
  identifier: 'schema:identifier',
  url: 'schema:url',
  href: 'schema:url',
  email: 'schema:email',
  skill: 'schema:skills',
  skills: 'schema:skills',
  enumType: 'schema:additionalType',
  type: 'schema:additionalType',
  title: 'schema:name',
  id: 'schema:identifier',
  image: 'schema:image',
  telephone: 'schema:telephone',
  address: 'schema:address',
  startDate: 'schema:startDate',
  endDate: 'schema:endDate',
  dateCreated: 'schema:dateCreated',
  dateModified: 'schema:dateModified',
  author: 'schema:author',
  creator: 'schema:creator',
  organization: 'schema:memberOf',
  company: 'schema:memberOf',
  proficiencyLevel: 'hr:proficiencyLevel',
  proficiencyScale: 'hr:proficiencyScale',
  codeNotation: 'hr:codeNotation',
}

// Schema name → schema.org @type
const SCHEMA_TYPE_MAPPINGS = {
  skill: 'schema:DefinedTerm',
  job: 'schema:JobPosting',
  person: 'schema:Person',
  worker: 'schema:Person',
  organization: 'schema:Organization',
  education: 'schema:EducationalOccupationalCredential',
  certificate: 'schema:EducationalOccupationalCredential',
  experience: 'schema:WorkExperience',
}

/**
 * Extract the main schema name and its properties from an OpenAPI/JSON Schema object.
 */
function extractSchemaInfo(openApiSchema) {
  if (!openApiSchema) return { schemaName: null, properties: {} }

  let schemas = null
  let schemaName = null

  if (openApiSchema.components && openApiSchema.components.schemas) {
    schemas = openApiSchema.components.schemas
    schemaName = schemas.skill ? 'skill' : Object.keys(schemas)[0]
  } else if (openApiSchema.definitions) {
    schemas = openApiSchema.definitions
    schemaName = Object.keys(schemas)[0]
  } else if (openApiSchema.properties && openApiSchema.type === 'object') {
    return { schemaName: 'Resource', properties: openApiSchema.properties }
  }

  if (!schemas || !schemaName) return { schemaName: null, properties: {} }

  const mainSchema = schemas[schemaName]
  return {
    schemaName,
    properties: mainSchema?.properties || {},
  }
}

/**
 * Build @context by scanning all property names in the data object (recursively).
 */
function buildContext(data) {
  const context = {
    schema: 'https://schema.org/',
    hr: 'https://hropenstandards.org/schema/',
  }

  function scanProperties(obj) {
    if (!obj || typeof obj !== 'object') return
    if (Array.isArray(obj)) {
      obj.forEach(item => scanProperties(item))
      return
    }
    for (const key of Object.keys(obj)) {
      if (key.startsWith('@')) continue
      if (!context[key]) {
        context[key] = SCHEMA_ORG_MAPPINGS[key] || `hr:${key}`
      }
      scanProperties(obj[key])
    }
  }

  scanProperties(data)
  return context
}

/**
 * Determine the @type for a data object based on schema info or heuristics.
 */
function deriveType(data, schemaName) {
  // Try enumType field
  if (data && data.enumType) {
    const mapped = SCHEMA_TYPE_MAPPINGS[data.enumType.toLowerCase()]
    if (mapped) return mapped
  }

  // Try schema name
  if (schemaName) {
    const mapped = SCHEMA_TYPE_MAPPINGS[schemaName.toLowerCase()]
    if (mapped) return mapped
    // Fallback: capitalize
    return `hr:${schemaName.charAt(0).toUpperCase() + schemaName.slice(1)}`
  }

  return 'schema:Thing'
}

/**
 * Determine the @id for a data object.
 */
function deriveId(data) {
  if (!data || typeof data !== 'object') return undefined
  if (data.identifier && typeof data.identifier === 'string') return data.identifier
  if (data.href && typeof data.href === 'string') return data.href
  if (data.id && typeof data.id === 'string' && data.id.startsWith('http')) return data.id
  return undefined
}

function isUri(value) {
  return typeof value === 'string' && /^https?:\/\//.test(value)
}

/**
 * Convert a plain JSON sample to JSON-LD.
 */
export function convertToJsonLd(data, openApiSchema) {
  if (!data || typeof data !== 'object') return data

  const { schemaName } = extractSchemaInfo(openApiSchema)
  const context = buildContext(data)

  function annotateObject(obj, typeName) {
    if (!obj || typeof obj !== 'object' || Array.isArray(obj)) return obj

    const result = {}
    const type = deriveType(obj, typeName)
    const id = deriveId(obj)

    result['@type'] = type
    if (id) result['@id'] = id

    for (const [key, value] of Object.entries(obj)) {
      if (Array.isArray(value)) {
        result[key] = value.map(item =>
          typeof item === 'object' && item !== null
            ? annotateObject(item, key.replace(/s$/, ''))
            : item
        )
      } else if (typeof value === 'object' && value !== null) {
        result[key] = annotateObject(value, key)
      } else {
        result[key] = value
      }
    }

    return result
  }

  const annotated = annotateObject(data, schemaName)
  return { '@context': context, ...annotated }
}

/**
 * Convert a JSON-LD object to Turtle (TTL) format.
 */
export function convertToTurtle(jsonLdData) {
  if (!jsonLdData || typeof jsonLdData !== 'object') return ''

  const context = jsonLdData['@context'] || {}
  const lines = []

  // Emit @prefix declarations
  for (const [prefix, uri] of Object.entries(context)) {
    if (typeof uri === 'string' && uri.startsWith('http')) {
      lines.push(`@prefix ${prefix}: <${uri}> .`)
    }
  }
  lines.push('')

  // Serialize a value for Turtle output
  function serializeValue(value, indent) {
    if (value === null || value === undefined) return '"null"'

    if (typeof value === 'boolean') return value.toString()
    if (typeof value === 'number') {
      return Number.isInteger(value) ? value.toString() : `${value}`
    }
    if (typeof value === 'string') {
      if (isUri(value)) return `<${value}>`
      // Escape special characters in string literals
      const escaped = value.replace(/\\/g, '\\\\').replace(/"/g, '\\"')
      return `"${escaped}"`
    }

    if (Array.isArray(value)) {
      if (value.length === 0) return '()'
      return value
        .map(item => serializeValue(item, indent))
        .join(' ,\n' + indent + '  ')
    }

    if (typeof value === 'object') {
      return serializeBlankNode(value, indent)
    }

    return `"${value}"`
  }

  // Serialize a blank node (nested object)
  function serializeBlankNode(obj, indent) {
    const nextIndent = indent + '  '
    const predicates = []

    if (obj['@type']) {
      predicates.push(`a ${obj['@type']}`)
    }

    for (const [key, value] of Object.entries(obj)) {
      if (key.startsWith('@')) continue
      const predicate = context[key] || `hr:${key}`
      const serialized = serializeValue(value, nextIndent)
      predicates.push(`${predicate} ${serialized}`)
    }

    if (predicates.length === 0) return '[]'
    return '[\n' + nextIndent + predicates.join(' ;\n' + nextIndent) + '\n' + indent + ']'
  }

  // Main subject
  const subjectId = jsonLdData['@id'] || '_:subject'
  const subject = isUri(subjectId) ? `<${subjectId}>` : subjectId
  const predicates = []

  if (jsonLdData['@type']) {
    predicates.push(`  a ${jsonLdData['@type']}`)
  }

  for (const [key, value] of Object.entries(jsonLdData)) {
    if (key.startsWith('@')) continue
    const predicate = context[key] || `hr:${key}`
    const serialized = serializeValue(value, '  ')
    predicates.push(`  ${predicate} ${serialized}`)
  }

  if (predicates.length > 0) {
    lines.push(subject)
    lines.push(predicates.join(' ;\n') + ' .')
  }

  return lines.join('\n')
}
