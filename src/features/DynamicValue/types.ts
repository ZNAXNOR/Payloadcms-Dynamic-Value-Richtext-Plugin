import type { CollectionSlug, Field, GlobalSlug } from 'payload'

export type DynamicValueOption = {
  label: string
  value: string
}

export type DynamicValueConfig = {
  /**
   * Directly provided fields for dynamic values
   */
  fields?: Field[]
  /**
   * Collections to pull fields from
   */
  collections?: CollectionSlug[]
  /**
   * Globals to pull fields from
   */
  globals?: GlobalSlug[]
  /**
   * The trigger character to use in the editor. Defaults to '@'
   */
  trigger?: string
}
