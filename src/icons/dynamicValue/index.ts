import type { DynamicValueIconType, IconDefinition } from './types.js'

import { boldIcon } from './bold.js'
import { italicIcon } from './italic.js'
import { linkIcon } from './link.js'
import { strikethroughIcon } from './strikethrough.js'
import { underlineIcon } from './underline.js'

export type { DynamicValueIconType, IconDefinition } from './types.js'

export const dynamicValueIcons: Record<DynamicValueIconType, IconDefinition> = {
  bold: boldIcon,
  italic: italicIcon,
  link: linkIcon,
  strikethrough: strikethroughIcon,
  underline: underlineIcon,
}
