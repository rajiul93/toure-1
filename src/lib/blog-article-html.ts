const TABLE_BLOCK_PLACEHOLDER = '__BLOG_TABLE_BLOCK__'

function cleanQuillHtml(html: string): string {
  return html
    .replace(/<span class="ql-ui"[^>]*><\/span>/gi, '')
    .replace(/\scontenteditable="false"/gi, '')
}

export function prepareBlogArticleHtml(html: string): string {
  if (!html) return html

  let output = cleanQuillHtml(html)

  if (output.includes('<table')) {
    const placeholders: string[] = []

    output = output.replace(/<div class="ql-table-wrapper"[\s\S]*?<\/div>/gi, (block) => {
      const index = placeholders.length
      placeholders.push(
        block.includes('blog-table-scroll')
          ? block
          : block.replace('ql-table-wrapper"', 'ql-table-wrapper blog-table-scroll"'),
      )
      return `${TABLE_BLOCK_PLACEHOLDER}${index}${TABLE_BLOCK_PLACEHOLDER}`
    })

    output = output.replace(/<table\b[\s\S]*?<\/table>/gi, (table) => {
      return `<div class="blog-table-scroll">${table}</div>`
    })

    placeholders.forEach((block, index) => {
      output = output.replace(`${TABLE_BLOCK_PLACEHOLDER}${index}${TABLE_BLOCK_PLACEHOLDER}`, block)
    })
  }

  return output
}
