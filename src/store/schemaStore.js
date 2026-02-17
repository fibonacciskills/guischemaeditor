import { create } from 'zustand'
import { parseSchemaToNodes, parseYamlSchema } from '../utils/schemaParser'
import { generateSampleResponse } from '../utils/sampleGenerator'
import { convertNodesToSchema } from '../utils/diagramToSchema'
import yaml from 'js-yaml'

const useSchemaStore = create((set, get) => ({
  // State
  openApiSchema: null,
  schemaYaml: '',
  nodes: [],
  edges: [],
  sampleResponse: {},
  isUpdating: false, // Flag to prevent infinite loops

  // Actions
  setSchema: (schema) => set({ openApiSchema: schema }),

  setSchemaYaml: (yaml) => {
    set({ schemaYaml: yaml })
  },

  setNodes: (nodes) => {
    set({ nodes })
  },

  setEdges: (edges) => {
    set({ edges })
  },

  setSampleResponse: (response) => set({ sampleResponse: response }),

  loadSchema: async (yamlText) => {
    try {
      set({ schemaYaml: yamlText })
      get().updateFromSchema()
    } catch (error) {
      console.error('Error loading schema:', error)
    }
  },

  updateFromSchema: () => {
    const { schemaYaml, isUpdating } = get()
    if (!schemaYaml || isUpdating) return

    try {
      set({ isUpdating: true })

      // Parse YAML to object
      const schema = parseYamlSchema(schemaYaml)
      if (!schema) {
        set({ isUpdating: false })
        return
      }

      // Update schema object
      set({ openApiSchema: schema })

      // Generate nodes and edges for flowchart
      const { nodes, edges } = parseSchemaToNodes(schemaYaml)
      set({ nodes, edges })

      // Generate sample response
      const sample = generateSampleResponse(schema)
      set({ sampleResponse: sample })

      console.log('Schema parsed:', { nodes: nodes.length, edges: edges.length })
      set({ isUpdating: false })
    } catch (error) {
      console.error('Error updating from schema:', error)
      set({ isUpdating: false })
    }
  },

  updateFromNodes: () => {
    const { nodes, edges, isUpdating } = get()
    if (nodes.length === 0 || isUpdating) return

    try {
      set({ isUpdating: true })

      // Convert nodes back to schema
      const schema = convertNodesToSchema(nodes, edges)

      // Update YAML
      const yamlText = yaml.dump(schema)

      // Only update if changed (avoid infinite loop)
      const current = get().schemaYaml
      if (current !== yamlText) {
        set({ schemaYaml: yamlText, openApiSchema: schema })

        // Generate new sample
        const sample = generateSampleResponse(schema)
        set({ sampleResponse: sample })
      }

      set({ isUpdating: false })
    } catch (error) {
      console.error('Error updating from nodes:', error)
      set({ isUpdating: false })
    }
  }
}))

export default useSchemaStore
