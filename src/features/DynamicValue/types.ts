import type { CollectionSlug, Field, GlobalSlug } from 'payload'

export type DynamicValueOption = {
  label: string
  value: string
}

export type DynamicValueConfig = {
  /**
   * Collections to pull fields from
   */
  collections?: CollectionSlug[]
  /**
   * Directly provided fields for dynamic values
   */
  fields?: Field[]
  /**
   * Globals to pull fields from
   */
  globals?: GlobalSlug[]
  /**
   * The trigger character to use in the editor. Defaults to '@'
   */
  trigger?: string
}
