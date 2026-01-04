import { describe, it, expect, vi } from 'vitest'
import { singleton } from './singleton'

describe('singleton utility', () => {
  describe('Basic functionality', () => {
    it('should call function only once', () => {
      const fn = vi.fn(() => 'result')
      const singletonFn = singleton(fn)

      singletonFn()
      singletonFn()
      singletonFn()

      expect(fn).toHaveBeenCalledTimes(1)
    })

    it('should return the same instance on multiple calls', () => {
      const singletonFn = singleton(() => ({ value: 42 }))

      const first = singletonFn()
      const second = singletonFn()
      const third = singletonFn()

      expect(first).toBe(second)
      expect(second).toBe(third)
    })

    it('should return the result of the function', () => {
      const singletonFn = singleton(() => 'hello world')

      const result = singletonFn()

      expect(result).toBe('hello world')
    })
  })

  describe('With different return types', () => {
    it('should work with objects', () => {
      const obj = { name: 'test', value: 123 }
      const singletonFn = singleton(() => obj)

      const result = singletonFn()

      expect(result).toBe(obj)
      expect(result.name).toBe('test')
      expect(result.value).toBe(123)
    })

    it('should work with arrays', () => {
      const arr = [1, 2, 3]
      const singletonFn = singleton(() => arr)

      const result = singletonFn()

      expect(result).toBe(arr)
      expect(result).toEqual([1, 2, 3])
    })

    it('should work with numbers', () => {
      const singletonFn = singleton(() => 42)

      expect(singletonFn()).toBe(42)
    })

    it('should work with strings', () => {
      const singletonFn = singleton(() => 'test')

      expect(singletonFn()).toBe('test')
    })

    it('should work with booleans', () => {
      const singletonFn = singleton(() => true)

      expect(singletonFn()).toBe(true)
    })

    it('should work with null', () => {
      const singletonFn = singleton(() => null)

      expect(singletonFn()).toBe(null)
    })

    it('should work with undefined', () => {
      const singletonFn = singleton(() => undefined)

      expect(singletonFn()).toBe(undefined)
    })

    it('should work with functions', () => {
      const innerFn = () => 'inner'
      const singletonFn = singleton(() => innerFn)

      const result = singletonFn()

      expect(result).toBe(innerFn)
      expect(result()).toBe('inner')
    })

    it('should work with classes', () => {
      class TestClass {
        value = 42
      }

      const singletonFn = singleton(() => new TestClass())

      const first = singletonFn()
      const second = singletonFn()

      expect(first).toBeInstanceOf(TestClass)
      expect(first).toBe(second)
      expect(first.value).toBe(42)
    })
  })

  describe('With arguments', () => {
    it('should pass arguments to the function on first call', () => {
      const fn = vi.fn((a: number, b: string) => ({ a, b }))
      const singletonFn = singleton(fn)

      const result = singletonFn(10, 'test')

      expect(fn).toHaveBeenCalledWith(10, 'test')
      expect(result).toEqual({ a: 10, b: 'test' })
    })

    it('should ignore arguments on subsequent calls', () => {
      const fn = vi.fn((x: number) => x * 2)
      const singletonFn = singleton(fn)

      const first = singletonFn(5)
      const second = singletonFn(10)
      const third = singletonFn(15)

      expect(fn).toHaveBeenCalledTimes(1)
      expect(fn).toHaveBeenCalledWith(5)
      expect(first).toBe(10)
      expect(second).toBe(10)
      expect(third).toBe(10)
    })

    it('should work with no arguments', () => {
      const fn = vi.fn(() => 'no args')
      const singletonFn = singleton(fn)

      singletonFn()
      singletonFn()

      expect(fn).toHaveBeenCalledTimes(1)
    })

    it('should work with multiple arguments', () => {
      const fn = vi.fn((a: number, b: string, c: boolean) => ({ a, b, c }))
      const singletonFn = singleton(fn)

      const result = singletonFn(42, 'hello', true)

      expect(fn).toHaveBeenCalledWith(42, 'hello', true)
      expect(result).toEqual({ a: 42, b: 'hello', c: true })
    })

    it('should work with rest parameters', () => {
      const fn = vi.fn((...nums: number[]) => nums.reduce((a, b) => a + b, 0))
      const singletonFn = singleton(fn)

      const result = singletonFn(1, 2, 3, 4, 5)

      expect(fn).toHaveBeenCalledWith(1, 2, 3, 4, 5)
      expect(result).toBe(15)
    })
  })

  describe('Side effects', () => {
    it('should only execute side effects once', () => {
      let counter = 0
      const singletonFn = singleton(() => {
        counter++
        return counter
      })

      singletonFn()
      singletonFn()
      singletonFn()

      expect(counter).toBe(1)
    })

    it('should maintain state across calls', () => {
      let callCount = 0
      const singletonFn = singleton(() => {
        callCount++
        return { callCount }
      })

      const result = singletonFn()
      callCount = 999 // Modify external state

      const result2 = singletonFn()

      expect(result).toBe(result2)
      expect(result.callCount).toBe(1) // Original value
    })
  })

  describe('Object mutations', () => {
    it('should allow mutations to the returned object', () => {
      const singletonFn = singleton(() => ({ value: 0 }))

      const obj = singletonFn()
      obj.value = 42

      const obj2 = singletonFn()

      expect(obj2.value).toBe(42)
      expect(obj).toBe(obj2)
    })

    it('should allow array mutations', () => {
      const singletonFn = singleton(() => [1, 2, 3])

      const arr = singletonFn()
      arr.push(4)

      const arr2 = singletonFn()

      expect(arr2).toEqual([1, 2, 3, 4])
      expect(arr).toBe(arr2)
    })
  })

  describe('Edge cases', () => {
    it('should handle functions that throw errors', () => {
      const fn = vi.fn(() => {
        throw new Error('Test error')
      })
      const singletonFn = singleton(fn)

      expect(() => singletonFn()).toThrow('Test error')

      // After error, singleton retries (doesn't cache errors)
      expect(() => singletonFn()).toThrow('Test error')

      // Function is called on each error (no error caching)
      expect(fn).toHaveBeenCalledTimes(2)
    })

    it('should work with expensive computations', () => {
      const fn = vi.fn(() => {
        let sum = 0
        for (let i = 0; i < 1000000; i++) {
          sum += i
        }
        return sum
      })
      const singletonFn = singleton(fn)

      const result1 = singletonFn()
      const result2 = singletonFn()

      expect(fn).toHaveBeenCalledTimes(1)
      expect(result1).toBe(result2)
    })

    it('should work with async functions', async () => {
      const fn = vi.fn(async () => {
        await new Promise((resolve) => setTimeout(resolve, 10))
        return 'async result'
      })
      const singletonFn = singleton(fn)

      const promise1 = singletonFn()
      const promise2 = singletonFn()

      // Should return the same promise instance
      expect(promise1).toBe(promise2)

      const result = await promise1

      expect(fn).toHaveBeenCalledTimes(1)
      expect(result).toBe('async result')
    })

    it('should handle falsy values correctly', () => {
      const falseFn = singleton(() => false)
      const zeroFn = singleton(() => 0)
      const emptyStringFn = singleton(() => '')

      expect(falseFn()).toBe(false)
      expect(falseFn()).toBe(false)

      expect(zeroFn()).toBe(0)
      expect(zeroFn()).toBe(0)

      expect(emptyStringFn()).toBe('')
      expect(emptyStringFn()).toBe('')
    })

    it('should work with Map', () => {
      const singletonFn = singleton(() => new Map([['key', 'value']]))

      const map1 = singletonFn()
      const map2 = singletonFn()

      expect(map1).toBe(map2)
      expect(map1.get('key')).toBe('value')
    })

    it('should work with Set', () => {
      const singletonFn = singleton(() => new Set([1, 2, 3]))

      const set1 = singletonFn()
      const set2 = singletonFn()

      expect(set1).toBe(set2)
      expect(set1.has(2)).toBe(true)
    })

    it('should work with Date', () => {
      const singletonFn = singleton(() => new Date('2024-01-01'))

      const date1 = singletonFn()
      const date2 = singletonFn()

      expect(date1).toBe(date2)
      expect(date1.getFullYear()).toBe(2024)
    })
  })

  describe('Multiple singleton instances', () => {
    it('should create independent singleton instances', () => {
      const fn1 = vi.fn(() => 'first')
      const fn2 = vi.fn(() => 'second')

      const singleton1 = singleton(fn1)
      const singleton2 = singleton(fn2)

      expect(singleton1()).toBe('first')
      expect(singleton2()).toBe('second')

      expect(fn1).toHaveBeenCalledTimes(1)
      expect(fn2).toHaveBeenCalledTimes(1)
    })

    it('should not share state between different singletons', () => {
      const createCounter = () => {
        let count = 0
        return () => ++count
      }

      const singleton1 = singleton(createCounter)
      const singleton2 = singleton(createCounter)

      const counter1 = singleton1()
      const counter2 = singleton2()

      expect(counter1()).toBe(1)
      expect(counter1()).toBe(2)
      expect(counter2()).toBe(1)
      expect(counter2()).toBe(2)
    })
  })

  describe('Type safety', () => {
    it('should preserve return type', () => {
      const singletonFn = singleton(() => ({ name: 'test', age: 25 }))

      const result = singletonFn()

      // TypeScript should infer the correct type
      expect(result.name).toBe('test')
      expect(result.age).toBe(25)
    })

    it('should preserve argument types', () => {
      const singletonFn = singleton((x: number, y: string) => ({ x, y }))

      const result = singletonFn(42, 'hello')

      expect(result.x).toBe(42)
      expect(result.y).toBe('hello')
    })
  })

  describe('Real-world use cases', () => {
    it('should work for database connection singleton', () => {
      class Database {
        connected = false
        connect() {
          this.connected = true
        }
      }

      const getDB = singleton(() => {
        const db = new Database()
        db.connect()
        return db
      })

      const db1 = getDB()
      const db2 = getDB()

      expect(db1).toBe(db2)
      expect(db1.connected).toBe(true)
    })

    it('should work for configuration singleton', () => {
      const getConfig = singleton(() => ({
        apiUrl: 'https://api.example.com',
        timeout: 5000,
        retries: 3,
      }))

      const config1 = getConfig()
      const config2 = getConfig()

      expect(config1).toBe(config2)
      expect(config1.apiUrl).toBe('https://api.example.com')
    })

    it('should work for logger singleton', () => {
      const logs: string[] = []
      const getLogger = singleton(() => ({
        log: (msg: string) => logs.push(msg),
        getLogs: () => logs,
      }))

      const logger1 = getLogger()
      const logger2 = getLogger()

      logger1.log('test1')
      logger2.log('test2')

      expect(logger1).toBe(logger2)
      expect(logger1.getLogs()).toEqual(['test1', 'test2'])
    })

    it('should work for cache singleton', () => {
      const getCache = singleton(() => new Map<string, any>())

      const cache1 = getCache()
      const cache2 = getCache()

      cache1.set('key1', 'value1')

      expect(cache2.get('key1')).toBe('value1')
      expect(cache1).toBe(cache2)
    })
  })
})
