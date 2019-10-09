import { SelectionTarget } from './jSelection'

export default null

export function getNodeTextLength(node: Node): number {
  if (node.textContent) {
    let { length } = node.textContent
    if (node['innerHTML']) {
      length += (node['innerHTML'].match(/<br/g) || []).length // break-line indicate 1 char
    }
    return length
  }
  return 0
}

export function calcBeforeNodeTextOffset(node: Node, target: Node): number {
  // node isn't the offspring of target
  if (!target.contains(node)) {
    return -Infinity
  }

  // node is target exactly
  if (node === target) {
    // node即为当前目标
    return 0
  }

  // node is a offspring of target
  let offsetValue: number = 0
  const childNodes: Node[] = [...target.childNodes]
  childNodes.some((child) => {
    if (child.contains(node)) {
      // node is still the offspring of this child
      offsetValue += calcBeforeNodeTextOffset(node, child)
      return true
    }
    // node isn't the offspring of the child
    offsetValue += getNodeTextLength(child)
    return false
  })
  return offsetValue
}

export function getNodeFromTextOffset(offset: number, target: Node): SelectionTarget {
  let targetNode: Node | null = null
  let remainOffset: number = offset
  const targetOffsetLength: number = getNodeTextLength(target)
  if (offset > targetOffsetLength) {
    // 偏移量超出target范围，直接将光标设置到末尾元素上
    targetNode = target
    while (targetNode.lastChild) {
      targetNode = targetNode.lastChild
    }
    remainOffset = getNodeTextLength(targetNode)
  } else if (offset < 1) {
    // 0 or 0.5
    targetNode = target
    while (targetNode.firstChild) {
      targetNode = targetNode.firstChild
    }
    remainOffset = 0
  } else if (target.nodeType === Node.TEXT_NODE) {
    targetNode = target
    remainOffset = Math.min(targetOffsetLength, offset)
  } else {
    const childNodes: Node[] = [...target.childNodes]
    childNodes.some((childNode: Node) => {
      const currentNodeOffset = getNodeTextLength(childNode)
      if (remainOffset > currentNodeOffset) {
        remainOffset -= currentNodeOffset
        return false
      }
      const { node, offset } = getNodeFromTextOffset(remainOffset, childNode)
      targetNode = node
      remainOffset = offset
      return true
    })
  }
  return {
    node: targetNode,
    offset: Math.floor(remainOffset),
  }
}
