import { useEffect, useRef, useState } from 'react'

function getTarget(target) {
  if (typeof window === 'undefined') return null
  if (!target) return window
  if (typeof target === 'function') return target()
  if (typeof target === 'object' && target !== null && 'current' in target) {
    return target.current
  }
  return target
}

function normalizeProgress(value, max) {
  if (!max || max <= 0) return 0
  return Math.max(0, Math.min(1, value / max))
}

function readWindowScroll() {
  const doc = document.documentElement
  const body = document.body

  const x = window.scrollX || window.pageXOffset || 0
  const y = window.scrollY || window.pageYOffset || 0
  const maxX = Math.max(0, Math.max(doc.scrollWidth, body.scrollWidth) - window.innerWidth)
  const maxY = Math.max(0, Math.max(doc.scrollHeight, body.scrollHeight) - window.innerHeight)

  return {
    x,
    y,
    maxX,
    maxY,
    progressX: normalizeProgress(x, maxX),
    progressY: normalizeProgress(y, maxY),
  }
}

function readElementScroll(element) {
  const x = element.scrollLeft
  const y = element.scrollTop
  const maxX = Math.max(0, element.scrollWidth - element.clientWidth)
  const maxY = Math.max(0, element.scrollHeight - element.clientHeight)

  return {
    x,
    y,
    maxX,
    maxY,
    progressX: normalizeProgress(x, maxX),
    progressY: normalizeProgress(y, maxY),
  }
}

function readScroll(target) {
  if (!target) {
    return {
      x: 0,
      y: 0,
      maxX: 0,
      maxY: 0,
      progressX: 0,
      progressY: 0,
    }
  }

  if (target === window) return readWindowScroll()
  return readElementScroll(target)
}

export function useScroll(target, options = {}) {
  const { disabled = false } = options
  const frameId = useRef(0)
  const prevY = useRef(0)
  const [scroll, setScroll] = useState(() => ({
    x: 0,
    y: 0,
    maxX: 0,
    maxY: 0,
    progressX: 0,
    progressY: 0,
    deltaY: 0,
    direction: 'up',
    isScrollingUp: false,
    isScrollingDown: false,
  }))

  useEffect(() => {
    if (disabled) return undefined

    const resolvedTarget = getTarget(target)
    if (!resolvedTarget) return undefined

    const eventTarget = resolvedTarget === window ? window : resolvedTarget

    const update = () => {
      frameId.current = 0
      const next = readScroll(resolvedTarget)
      const deltaY = next.y - prevY.current
      const direction = deltaY > 0 ? 'down' : 'up'
      prevY.current = next.y

      setScroll({
        ...next,
        deltaY,
        direction,
        isScrollingUp: deltaY < 0,
        isScrollingDown: deltaY > 0,
      })
    }

    const onScroll = () => {
      if (frameId.current) return
      frameId.current = window.requestAnimationFrame(update)
    }

    update()
    eventTarget.addEventListener('scroll', onScroll, { passive: true })

    if (resolvedTarget === window) {
      window.addEventListener('resize', onScroll)
    }

    return () => {
      eventTarget.removeEventListener('scroll', onScroll)
      if (resolvedTarget === window) {
        window.removeEventListener('resize', onScroll)
      }
      if (frameId.current) {
        window.cancelAnimationFrame(frameId.current)
      }
    }
  }, [target, disabled])

  return scroll
}

export default useScroll
