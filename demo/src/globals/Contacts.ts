import type { GlobalConfig } from 'payload'

export const Contacts: GlobalConfig = {
  slug: 'contacts',
  fields: [
    {
      name: 'companyEmail',
      type: 'text',
      required: true,
    },
    {
      name: 'companyPhone',
      type: 'text',
      required: true,
    },
    {
      name: 'companyAddress',
      type: 'textarea',
      required: true,
    },
  ],
}
