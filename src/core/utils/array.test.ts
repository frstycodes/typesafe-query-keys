import { describe, it, expect } from 'vitest'
import { areArraysEqual } from './array'

describe('Array utilities', () => {
  describe('areArraysEqual', () => {
    it('should return true for identical arrays', () => {
      expect(areArraysEqual([1, 2, 3], [1, 2, 3])).toBe(true)
    })

    it('should return true for arrays with same elements in different order', () => {
      expect(areArraysEqual([1, 2, 3], [3, 2, 1])).toBe(true)
    })

    it('should return false for arrays with different elements', () => {
      expect(areArraysEqual([1, 2, 3], [1, 2, 4])).toBe(false)
    })

    it('should return false for arrays of different lengths', () => {
      expect(areArraysEqual([1, 2], [1, 2, 3])).toBe(false)
    })

    it('should return true for empty arrays', () => {
      expect(areArraysEqual([], [])).toBe(true)
    })

    it('should handle arrays with duplicates correctly', () => {
      // Note: areArraysEqual uses Set which doesn't track counts
      // So [1,1,2] and [1,2,2] are considered equal (both have 1 and 2)
      expect(areArraysEqual([1, 1, 2], [1, 2, 2])).toBe(true) // Both contain 1 and 2
      expect(areArraysEqual([1, 1, 2], [2, 1, 1])).toBe(true) // Both contain 1 and 2

      // Different elements would still fail
      expect(areArraysEqual([1, 1, 2], [1, 3, 3])).toBe(false)
    })

    it('should work with string arrays', () => {
      expect(areArraysEqual(['a', 'b', 'c'], ['c', 'b', 'a'])).toBe(true)
      expect(areArraysEqual(['a', 'b'], ['a', 'c'])).toBe(false)
    })

    it('should handle single element arrays', () => {
      expect(areArraysEqual([1], [1])).toBe(true)
      expect(areArraysEqual([1], [2])).toBe(false)
    })

    it('should return false when one array is empty', () => {
      expect(areArraysEqual([], [1])).toBe(false)
      expect(areArraysEqual([1], [])).toBe(false)
    })

    it('should handle arrays with many elements', () => {
      const arr1 = Array.from({ length: 1000 }, (_, i) => i)
      const arr2 = Array.from({ length: 1000 }, (_, i) => 999 - i)
      expect(areArraysEqual(arr1, arr2)).toBe(true)
    })
  })
})
