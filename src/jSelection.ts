import { getNodeTextLength, calcBeforeNodeTextOffset, getNodeFromTextOffset } from './util'

export interface SelectionTarget {
  node: Node | null;
  offset: number;
}

interface SelectionRange {
  start: number;
  end: number;
}

interface SelectionData {
  startContainer: Node | null;
  startOffset: number;
  endContainer: Node | null;
  endOffset: number;
}

export default class jSelection {
  readonly target: HTMLElement

  constructor(target: HTMLElement) {
    if (!(target instanceof HTMLElement)) {
      throw new Error('target is not a HTMLElement!')
    }
    this.target = target
  }

  get string(): string {
    return this.getSelection.toString()
  }

  getSelection(): Selection | null {
    return window.getSelection()
  }

  getCurrentRange(selection: Selection | null = this.getSelection()): Range | null {
    if (selection) {
      const { rangeCount } = selection as Selection
      if (rangeCount > 0) {
        return selection.getRangeAt(rangeCount - 1)
      }
    }
    return null
  }

  resetRange(range: Range | null = null): void {
    const selection = this.getSelection()
    if (range && selection) {
      selection.removeAllRanges()
      selection.addRange(range)
    }
  }

  // 设置光标到指定位置
  setCursorRangePosition({
    startContainer = this.target,
    startOffset = 0,
    endContainer = this.target,
    endOffset = 0,
  }: SelectionData): void {
    if (startContainer && endContainer) {
      const newRange: Range = document.createRange()
      newRange.setStart(startContainer, startOffset)
      newRange.setEnd(endContainer, endOffset)
      this.resetRange(newRange)
    }
  }

  getCursorOffsetTextPosition(target = this.target, range = this.getCurrentRange()): SelectionRange {
    if (!(target instanceof HTMLElement)) {
      throw new Error('target is not a HTMLElement!')
    }
    if (!range) {
      return {
        start: -Infinity,
        end: -Infinity,
      }
    }

    const {
      startContainer,
      startOffset,
      endContainer,
      endOffset,
    } = range

    // if it isn't the tail node exactly, give it 0.5 offset to distinguish the position of the former node
    const modifyStartOffset: number = getNodeTextLength(startContainer) === startOffset ? 0 : 0.5
    const modifyEndOffset: number = getNodeTextLength(endContainer) === endOffset ? 0 : 0.5

    return {
      start: calcBeforeNodeTextOffset(startContainer, target) + startOffset + modifyStartOffset,
      end: calcBeforeNodeTextOffset(endContainer, target) + endOffset + modifyEndOffset,
    }
  }

  getSelectionDataFromCursorOffsetTextPostion({ start = 0, end = 0 }: SelectionRange, target: HTMLElement = this.target): SelectionData {
    if (!(target instanceof HTMLElement)) {
      throw new Error('target is not a Dom Element!')
    }
    const { node: startContainer, offset: startOffset } = getNodeFromTextOffset(+start, target)
    const { node: endContainer, offset: endOffset } = getNodeFromTextOffset(+end, target)
    return {
      startContainer,
      startOffset,
      endContainer,
      endOffset,
    }
  }

  setCursorOffsetTextPostion({ start = 0, end = 0 }: SelectionRange, target: HTMLElement = this.target): void {
    if (!(target instanceof HTMLElement)) {
      throw new Error('target is not a Dom Element!')
    }
    const selectionData = this.getSelectionDataFromCursorOffsetTextPostion({ start, end }, target)
    this.setCursorRangePosition(selectionData)
  }

  setCursorToEnd(): void {
    const { lastChild } = this.target
    if (lastChild) {
      const newRange = document.createRange()
      newRange.setStartAfter(lastChild)
      newRange.setEndAfter(lastChild)
      this.resetRange(newRange)
    }
  }
}
