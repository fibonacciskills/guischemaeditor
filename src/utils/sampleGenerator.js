import { faker } from '@faker-js/faker'

/**
 * Generate sample JSON data from schema (OpenAPI or JSON Schema)
 */
export function generateSampleFromSchema(schema) {
  if (!schema) {
    return {}
  }

  // Extract schemas from different formats
  let schemas = null
  let mainSchema = null

  if (schema.components && schema.components.schemas) {
    // OpenAPI format
    schemas = schema.components.schemas
    const mainSchemaKey = schemas.skill ? 'skill' : Object.keys(schemas)[0]
    mainSchema = schemas[mainSchemaKey]
  } else if (schema.definitions) {
    // JSON Schema with definitions
    schemas = schema.definitions
    const mainSchemaKey = Object.keys(schemas)[0]
    mainSchema = schemas[mainSchemaKey]
  } else if (schema.properties && schema.type === 'object') {
    // Direct schema object
    mainSchema = schema
    schemas = {}
  }

  if (!mainSchema) {
    return {}
  }

  return generateObjectFromSchema(mainSchema, schemas)
}

/**
 * Recursively generate sample data based on schema definition
 */
function generateObjectFromSchema(schemaDef, allSchemas) {
  if (!schemaDef) return null

  const { type, properties, items } = schemaDef

  if (type === 'object' && properties) {
    const obj = {}
    Object.keys(properties).forEach(propName => {
      const prop = properties[propName]
      obj[propName] = generateValueFromType(prop, allSchemas)
    })
    return obj
  }

  if (type === 'array' && items) {
    // Generate 2-3 sample items
    const count = faker.number.int({ min: 2, max: 3 })
    return Array.from({ length: count }, () =>
      generateObjectFromSchema(items, allSchemas)
    )
  }

  return generateValueFromType(schemaDef, allSchemas)
}

/**
 * Generate a sample value based on property type
 */
function generateValueFromType(propDef, allSchemas) {
  const { type, format, description } = propDef

  // Handle nested objects
  if (type === 'object') {
    return generateObjectFromSchema(propDef, allSchemas)
  }

  // Handle arrays
  if (type === 'array' && propDef.items) {
    const count = faker.number.int({ min: 2, max: 3 })
    return Array.from({ length: count }, () =>
      generateObjectFromSchema(propDef.items, allSchemas)
    )
  }

  // Generate primitive values based on type
  switch (type) {
    case 'string':
      if (description && description.toLowerCase().includes('url')) {
        return faker.internet.url()
      }
      if (description && description.toLowerCase().includes('email')) {
        return faker.internet.email()
      }
      if (description && description.toLowerCase().includes('name')) {
        return faker.person.firstName()
      }
      if (description && description.toLowerCase().includes('description')) {
        return faker.lorem.sentence()
      }
      if (format === 'uri') {
        return faker.internet.url()
      }
      return faker.lorem.word()

    case 'integer':
    case 'number':
      return faker.number.int({ min: 1, max: 5 })

    case 'boolean':
      return faker.datatype.boolean()

    default:
      return faker.lorem.word()
  }
}

/**
 * Generate a sample API response with wrapper structure
 */
export function generateSampleResponse(schema) {
  const sampleData = generateSampleFromSchema(schema)

  // If generating skill data, wrap in a common API response format
  return {
    identifier: faker.internet.url() + '/jobs/JOB-' + faker.string.alphanumeric(3).toUpperCase(),
    enumType: "job",
    skill: Array.isArray(sampleData) ? sampleData : [sampleData]
  }
}
