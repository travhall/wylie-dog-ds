import { readFileSync, writeFileSync } from 'fs'
import { convertOklchToHex } from './scripts/color-utils.js'

// Load direct tokens only
const tokens = JSON.parse(readFileSync('src/direct.json', 'utf8'))

// Generate CSS directly
const cssVariables = []

function processTokens(obj, path = []) {
  for (const [key, value] of Object.entries(obj)) {
    if (value?.$value) {
      const varName = `--${path.concat(key).join('-')}`
      
      if (value.$type === 'color' && value.$value.startsWith('oklch(')) {
        const hex = convertOklchToHex(value.$value)
        cssVariables.push(`  ${varName}: ${hex};`)
      } else {
        cssVariables.push(`  ${varName}: ${value.$value};`)
      }
    } else if (typeof value === 'object' && !value.$type) {
      processTokens(value, path.concat(key))
    }
  }
}

processTokens(tokens)

const css = `@theme {\n${cssVariables.join('\n')}\n}`
writeFileSync('dist/tokens.css', css)

console.log(`✅ Generated ${cssVariables.length} working CSS variables`)
console.log('Sample output:')
console.log(cssVariables.slice(0, 3).join('\n'))
