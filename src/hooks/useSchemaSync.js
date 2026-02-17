import { useEffect } from 'react'
import useSchemaStore from '../store/schemaStore'

/**
 * Hook to coordinate synchronization between schema, diagram, and sample
 */
export function useSchemaSync() {
  const { schemaYaml, nodes, updateFromSchema, updateFromNodes } = useSchemaStore()

  // Trigger sync from schema when it changes (with debounce already handled in SchemaPanel)
  useEffect(() => {
    if (schemaYaml) {
      updateFromSchema()
    }
  }, [schemaYaml, updateFromSchema])

  return {
    syncFromSchema: updateFromSchema,
    syncFromNodes: updateFromNodes
  }
}
