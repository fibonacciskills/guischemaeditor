import yaml from 'js-yaml'

/**
 * Parse schema (OpenAPI or JSON Schema) to generate nodes and edges for ReactFlow
 */
export function parseSchemaToNodes(yamlText) {
  try {
    const schema = yaml.load(yamlText)
    const nodes = []
    const edges = []
    let nodeIdCounter = 0

    // Extract schemas from different formats
    const schemas = extractSchemas(schema)

    if (!schemas || Object.keys(schemas).length === 0) {
      return { nodes, edges }
    }

    const schemaKeys = Object.keys(schemas)

    // Position configuration for layout
    const startX = 50
    const startY = 50
    const verticalSpacing = 250
    const horizontalSpacing = 350

    // Create nodes for each schema object
    schemaKeys.forEach((schemaName, index) => {
      const schemaObj = schemas[schemaName]
      const nodeId = `schema-${nodeIdCounter++}`
      const baseY = startY + (index * verticalSpacing)

      // Main schema node
      nodes.push({
        id: nodeId,
        type: 'schemaNode',
        position: {
          x: startX,
          y: baseY
        },
        data: {
          label: schemaName,
          schemaName: schemaName,
          description: schemaObj.description || schemaObj.title || '',
          type: schemaObj.type || 'object',
          properties: schemaObj.properties || {}
        }
      })

      // Create property nodes for each property
      if (schemaObj.properties) {
        const propertyKeys = Object.keys(schemaObj.properties)
        propertyKeys.forEach((propName, propIndex) => {
          const prop = schemaObj.properties[propName]
          const propNodeId = `prop-${nodeIdCounter++}`

          // Determine if this property is required
          const isRequired = schemaObj.required && schemaObj.required.includes(propName)

          // Handle nested objects and arrays
          let displayType = prop.type || 'string'
          let description = prop.description || ''

          if (prop.type === 'array' && prop.items) {
            if (prop.items.type) {
              displayType = `array<${prop.items.type}>`
            } else if (prop.items.properties) {
              displayType = 'array<object>'
            }
          } else if (prop.type === 'object' && prop.properties) {
            displayType = 'object{}'
          } else if (prop.$ref) {
            displayType = 'ref: ' + prop.$ref.split('/').pop()
          }

          nodes.push({
            id: propNodeId,
            type: 'propertyNode',
            position: {
              x: startX + horizontalSpacing,
              y: baseY + (propIndex * 70)
            },
            data: {
              label: propName,
              propertyName: propName,
              type: displayType,
              required: isRequired,
              description: description
            }
          })

          // Create edge from schema to property
          edges.push({
            id: `edge-${nodeId}-${propNodeId}`,
            source: nodeId,
            target: propNodeId,
            type: 'smoothstep'
          })

          // If property is a nested object with properties, create sub-nodes
          if (prop.type === 'object' && prop.properties) {
            const nestedProps = Object.keys(prop.properties)
            nestedProps.slice(0, 5).forEach((nestedPropName, nestedIdx) => {
              const nestedProp = prop.properties[nestedPropName]
              const nestedNodeId = `prop-${nodeIdCounter++}`

              nodes.push({
                id: nestedNodeId,
                type: 'propertyNode',
                position: {
                  x: startX + horizontalSpacing * 2,
                  y: baseY + (propIndex * 70) + (nestedIdx * 40)
                },
                data: {
                  label: nestedPropName,
                  propertyName: nestedPropName,
                  type: nestedProp.type || 'string',
                  required: false,
                  description: nestedProp.description || ''
                }
              })

              edges.push({
                id: `edge-${propNodeId}-${nestedNodeId}`,
                source: propNodeId,
                target: nestedNodeId,
                type: 'smoothstep'
              })
            })
          }

          // If property is an array with object items, create sub-nodes
          if (prop.type === 'array' && prop.items && prop.items.properties) {
            const arrayProps = Object.keys(prop.items.properties)
            arrayProps.slice(0, 5).forEach((arrayPropName, arrayIdx) => {
              const arrayProp = prop.items.properties[arrayPropName]
              const arrayNodeId = `prop-${nodeIdCounter++}`

              nodes.push({
                id: arrayNodeId,
                type: 'propertyNode',
                position: {
                  x: startX + horizontalSpacing * 2,
                  y: baseY + (propIndex * 70) + (arrayIdx * 40)
                },
                data: {
                  label: arrayPropName,
                  propertyName: arrayPropName,
                  type: arrayProp.type || 'string',
                  required: false,
                  description: arrayProp.description || ''
                }
              })

              edges.push({
                id: `edge-${propNodeId}-${arrayNodeId}`,
                source: propNodeId,
                target: arrayNodeId,
                type: 'smoothstep'
              })
            })
          }
        })
      }
    })

    return { nodes, edges }
  } catch (error) {
    console.error('Error parsing schema:', error)
    return { nodes: [], edges: [] }
  }
}

/**
 * Extract schemas from different formats:
 * - OpenAPI 3.x: components.schemas
 * - JSON Schema: definitions
 * - Direct schema object
 */
function extractSchemas(schema) {
  // OpenAPI format
  if (schema.components && schema.components.schemas) {
    return schema.components.schemas
  }

  // JSON Schema with definitions
  if (schema.definitions) {
    return schema.definitions
  }

  // Direct schema object (has properties at root)
  if (schema.properties && schema.type === 'object') {
    // Treat the root as a single schema
    return { 'RootSchema': schema }
  }

  // JSON Schema with $defs (newer format)
  if (schema.$defs) {
    return schema.$defs
  }

  return null
}

/**
 * Get the parsed schema object from YAML/JSON text
 */
export function parseYamlSchema(yamlText) {
  try {
    return yaml.load(yamlText)
  } catch (error) {
    console.error('Error parsing YAML:', error)
    return null
  }
}
