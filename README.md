# loggerProxy
Logger using Proxy API

## 誰のため

将来の自分。もしくはJSの初心者のための反面教師として。

## 何をするもの

### proxySource

[Esprima](https://esprima.org/), [estools/estraverse: ECMAScript JS AST traversal functions](https://github.com/estools/estraverse)で、Javascriptコードを読み込み, Proxy APIでwrapしたコードを生成する。下記のようにコード`var x = square(4)`から`var x = (new ProxyCall(square))(4)`へ変換して出力する。

```javascirpt
import { proxySource } from 'loggerproxy'
const source = `
var x = square(4)
`
proxySource(source , 'script')
// expected: var x = (new ProxyCall(square))(4)
```

### ProxyCall

Proxy APIを使って関数/メソッドコールの呼び出し回数と時刻を記録する。実行後、`callSequence()`で記録を読み取ることができる。

## Install / Build

```shell
pnpm install
pnpm build
```

## 使い方

下記サンプル参照

ソースコードからProxy APIでwrapしたコードに変換する。

```javascript
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
`
const source2 = proxySource(source , 'script')
console.log(source2)
```

変換コードの実行と、呼び出し回数と時刻の記録を行い、結果を表示する。

```javascript
import { ProxyCall, clrCallSequence, callSequence } from 'loggerproxy'

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
var sumclass = new ProxyCall(new SumClass(1.0))
var sumc = sumclass.calc(2, 5)
var sumf = (new ProxyCall(SumFunc))(2,5)
const square = function(number) { return number * number }
const factorial = function fac(n) { return n < 2 ? 1 : n * fac(n - 1) }

var x = (new ProxyCall(square))(4)
console.log(sumc, ':', sumf)
console.log((new ProxyCall(factorial))(3))
console.log((new ProxyCall(square))(5))
const showHello = () => 'Hello, World!'
console.log((new ProxyCall(showHello))())
console.log((new ProxyCall(showHello))())

//-------------------------
console.log(callSequence())
clrCallSequence()
console.log((new ProxyCall(showHello))())
console.log(callSequence())
```