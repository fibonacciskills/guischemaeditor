/**
 * Convert ReactFlow nodes/edges back to OpenAPI schema
 * This will be implemented when we need diagram -> schema sync
 */
export function convertNodesToSchema(nodes, edges) {
  // Group nodes by type
  const schemaNodes = nodes.filter(n => n.type === 'schemaNode')
  const propertyNodes = nodes.filter(n => n.type === 'propertyNode')

  const schemas = {}

  schemaNodes.forEach(schemaNode => {
    const schemaName = schemaNode.data.schemaName

    // Find all property nodes connected to this schema
    const connectedEdges = edges.filter(e => e.source === schemaNode.id)
    const properties = {}

    connectedEdges.forEach(edge => {
      const propNode = propertyNodes.find(n => n.id === edge.target)
      if (propNode) {
        properties[propNode.data.propertyName] = {
          type: propNode.data.type,
          description: propNode.data.description,
          required: propNode.data.required
        }
      }
    })

    schemas[schemaName] = {
      type: schemaNode.data.type,
      description: schemaNode.data.description,
      properties: properties
    }
  })

  // Return minimal OpenAPI structure
  return {
    openapi: '3.1.0',
    info: {
      title: 'Generated Schema',
      version: '1.0'
    },
    paths: {},
    components: {
      schemas: schemas
    }
  }
}
