import { entryType } from "./types"

let isProxy = Symbol("isProxy")
let entries : entryType = {}

function registEntries(func: string) {
    if (entries[func] === undefined) {
        entries[func] = {
            count: 1,
            date: [Date.now()]
        }
    } else {
        const p = entries[func]
        p.date.push(Date.now())
        entries[func] = {
            count: p.count + 1,
            date: p.date
        }
    }
}

/**
 * Proxyのハンドラ
 * @description 関数/メソッド呼び出しをトラップして、時刻と呼び出し回数を記録する
 * @type {{ apply: (target: any, thisArg: any, argumentsList?: any) => any; get: (target: any, prop: any, receiver: any) => any; }}
 */
const handler = {
    apply: function (target: any, thisArg: any, argumentsList?: Array<any>) {
        registEntries(`${target.name}`)
        return target.apply(thisArg, argumentsList)
    },
    get: function (target: any, prop: any, receiver: any) {
        /**
         * ProxyのProxy化を行わないようにする
         * @see https://stackoverflow.com/questions/36372611/how-to-test-if-an-object-is-a-proxy
         */      
        if (prop === isProxy)
            return true
        const propValue = target[prop];
        if (prop && (typeof propValue === 'function')) {
            registEntries(`${target.constructor.name}::${prop}`)
        }
        // issue: spread 引数には、組の種類を指定するか、rest パラメーターに渡す必要があります。ts(2556)
        //return Reflect.get(...arguments);
        return Reflect.get(target, prop, receiver);
    }
};

/**
 * Proxyで記録したシーケンスコールを返す
 *
 * @export
 * @returns {entryType}
 */
export function callSequence() {
    return entries
}
export function clrCallSequence() {
    entries = {}
}
export function ProxyCall(obj: any) {
    // @see https://stackoverflow.com/questions/36372611/how-to-test-if-an-object-is-a-proxy
    if (obj[isProxy]) {
        return obj
    } else {
        return new Proxy(obj, handler)
    }
}