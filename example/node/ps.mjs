import { proxySource } from 'loggerproxy'

const source = `
class SumClass {
  constructor(factor) {
      this.sum = 0
      this.factor = factor
  }
  calc(arg1, arg2) {
      this.sum = (arg1 + arg2) * this.factor
      return this.sum
  }
}
function SumFunc(arg1, arg2) {
  return arg1 + arg2
}
var sumclass = new SumClass(1.0)
var sumc = sumclass.calc(2, 5)
var sumf = SumFunc(2, 5)
const square = function(number) { return number * number }
const factorial = function fac(n) { return n < 2 ? 1 : n * fac(n - 1) }

var x = square(4)
console.log(sumc, ':', sumf)
console.log(factorial(3))
console.log(square(5))
const showHello = () => 'Hello, World!'
console.log(showHello())
var c = 3 + 4
`

const source2 = proxySource(source, 'script')
console.log(source2)
