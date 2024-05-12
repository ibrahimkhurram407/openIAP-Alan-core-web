export function repositionableColumn(node, column) {
  function handleDragStart(event) {
    if (column.repositionable === false || !event.dataTransfer) return
    const data = { column: column.id }
    event.dataTransfer.setData('text/plain', JSON.stringify(data))
  }

  function handleDragOver(event) {
    if (column.repositionable === false) return
    event.preventDefault()
  }

  function handleDrop(event) {
    if (!event.dataTransfer) return
    event.preventDefault()
    try {
      const json = event.dataTransfer?.getData('text/plain')
      const data = JSON.parse(json)
      if(data.column == null || data.column == "") return
      if(data.column === column.id) return
      node.dispatchEvent(
        new CustomEvent('move', {
          detail: { from: data.column, to: column.id },
        })
      )
    } catch (e) {
      console.error(e)
    }
  }

  node.addEventListener('dragstart', handleDragStart, true)
  node.addEventListener('dragover', handleDragOver, true)
  node.addEventListener('drop', handleDrop, true)

  return {
    destroy() {
      node.removeEventListener('dragstart', handleDragStart, true)
      node.removeEventListener('dragover', handleDragOver, true)
      node.removeEventListener('drop', handleDrop, true)
    },
  }
}
