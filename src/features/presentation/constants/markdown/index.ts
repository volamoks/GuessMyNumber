import { headings } from './headings'
import { textFormatting } from './formatting'
import { lists } from './lists'
import { tables } from './tables'
import { code } from './code'
import { blockquotes, links, dividers, advanced } from './misc'

export const MARKDOWN_RULES = {
    headings,
    textFormatting,
    lists,
    tables,
    code,
    blockquotes,
    links,
    dividers,
    advanced,
} as const

export * from './examples'
