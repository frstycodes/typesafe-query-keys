import { describe, it, expect } from 'vitest'
import { dedupeBy } from './object'

describe('Object utilities', () => {
  describe('dedupeBy', () => {
    it('should remove duplicates based on key function', () => {
      const items = [
        { id: 1, name: 'Alice' },
        { id: 2, name: 'Bob' },
        { id: 1, name: 'Alice Duplicate' },
      ]

      const result = dedupeBy(items, (item) => item.id)

      expect(result).toHaveLength(2)
      expect(result[0]).toEqual({ id: 1, name: 'Alice' })
      expect(result[1]).toEqual({ id: 2, name: 'Bob' })
    })

    it('should maintain insertion order', () => {
      const items = ['a', 'b', 'c', 'a', 'b']

      const result = dedupeBy(items, (x) => x)

      expect(result).toEqual(['a', 'b', 'c'])
    })

    it('should handle empty arrays', () => {
      const result = dedupeBy([], (x) => x)
      expect(result).toEqual([])
    })

    it('should handle arrays with no duplicates', () => {
      const items = [1, 2, 3, 4, 5]

      const result = dedupeBy(items, (x) => x)

      expect(result).toEqual([1, 2, 3, 4, 5])
    })

    it('should handle all duplicates', () => {
      const items = [1, 1, 1, 1]

      const result = dedupeBy(items, (x) => x)

      expect(result).toEqual([1])
    })

    it('should work with complex key functions', () => {
      const items = [
        { user: { id: 1 }, data: 'a' },
        { user: { id: 2 }, data: 'b' },
        { user: { id: 1 }, data: 'c' },
      ]

      const result = dedupeBy(items, (item) => item.user.id)

      expect(result).toHaveLength(2)
      expect(result[0]?.data).toBe('a')
      expect(result[1]?.data).toBe('b')
    })

    it('should work with string key function', () => {
      const items = [
        { name: 'Alice', age: 30 },
        { name: 'Bob', age: 25 },
        { name: 'Alice', age: 35 },
      ]

      const result = dedupeBy(items, (item) => item.name)

      expect(result).toHaveLength(2)
      expect(result[0]?.name).toBe('Alice')
      expect(result[1]?.name).toBe('Bob')
    })

    it('should work with number key function', () => {
      const items = [10, 20, 30, 20, 10]

      const result = dedupeBy(items, (x) => x)

      expect(result).toEqual([10, 20, 30])
    })

    it('should handle single element array', () => {
      const result = dedupeBy([1], (x) => x)
      expect(result).toEqual([1])
    })

    it('should keep first occurrence when duplicates exist', () => {
      const items = [
        { id: 1, value: 'first' },
        { id: 1, value: 'second' },
        { id: 1, value: 'third' },
      ]

      const result = dedupeBy(items, (item) => item.id)

      expect(result).toHaveLength(1)
      expect(result[0]?.value).toBe('first')
    })

    it('should handle large arrays efficiently', () => {
      const items = Array.from({ length: 10000 }, (_, i) => ({
        id: i % 100,
        data: i,
      }))

      const result = dedupeBy(items, (item) => item.id)

      expect(result).toHaveLength(100)
    })

    it('should work with boolean key function', () => {
      const items = [
        { active: true, name: 'A' },
        { active: false, name: 'B' },
        { active: true, name: 'C' },
      ]

      const result = dedupeBy(items, (item) => item.active)

      expect(result).toHaveLength(2)
      expect(result[0]?.active).toBe(true)
      expect(result[1]?.active).toBe(false)
    })

    it('should work with composite keys', () => {
      const items = [
        { group: 'A', id: 1 },
        { group: 'A', id: 2 },
        { group: 'A', id: 1 },
        { group: 'B', id: 1 },
      ]

      const result = dedupeBy(items, (item) => `${item.group}-${item.id}`)

      expect(result).toHaveLength(3)
    })
  })
})
