/*! loggerProxy | MIT | https://opensource.org/licenses/MIT */
/* Copyright © 2023 hkawa90 All Rights Reserved. */

import esprima from 'esprima'
import estraverse from 'estraverse'
import ESTree, { Identifier } from 'estree'

/**
 * @description 関数呼び出しを記録するため既存ソースをProxy化したコードに変換する
 * @example
 * import { proxySource } from 'loggerproxy'
 * const source = `
 * var x = square(4)
 * `
 * proxySource(source , 'script')
 * // expected: var x = (new ProxyCall(square))(4)
 */

interface ProxyEntry {
    start: number
    end: number
    statement: string
}

type SourceType = "script" | "module"

const entries: ProxyEntry[] = []
function buildArg(argList: Array<any>) {
    if ((argList instanceof Array) && (argList.length > 0)) {
        const arg = argList.reduce((acc, cur) => {
            return acc + cur.raw + ','
        }, "")
        return arg.substring(0, arg.length - 1)
    }
    return ""
}

export function proxySource(source: string, type: SourceType) {
    let ast
    if (type === 'script') {
        ast = esprima.parseScript(source, { range: true });
    } else if (type === 'module') {
        ast = esprima.parseModule(source, { range: true });
    } else {
        throw new Error('Source type is invalid.')
    }
    estraverse.traverse(ast, {
        enter: function (node, parent) {
            if (node.type === 'NewExpression') {
                const ba = buildArg(node.arguments)
                let name = ''
                if ((parent!.type === 'CallExpression') || (parent!.type === 'VariableDeclarator')){
                    const calleeType = (node as ESTree.CallExpression).callee.type
                    if (calleeType === 'Identifier') {
                        //name = ((node as ESTree.CallExpression).callee as Identifier).name
                        name = (<Identifier>(<ESTree.CallExpression>node).callee).name
                    }
                }
                // console.log(':', node, ':', parent, ':', name)
                const st = 'new ProxyCall(new ' + name  + '(' + ba + '))'
                if ((node.range) && (node.range instanceof Array)) {
                    entries.push({
                        start: node.range[0],
                        end: node.range[1],
                        statement: st
                    })
                }
            } else if ((node.type === 'CallExpression') && ((parent!.type === 'CallExpression') || (parent!.type === 'VariableDeclarator'))) {
                const ba = buildArg(node.arguments)
                let st = ''
                let name = ''
                if ((parent!.type === 'CallExpression') || (parent!.type === 'VariableDeclarator')) {
                    const calleeType = (node as ESTree.CallExpression).callee.type
                    if (calleeType === 'Identifier') {
                        //name = ((node as ESTree.CallExpression).callee as Identifier).name
                        name = (<Identifier>(<ESTree.CallExpression>node).callee).name
                    }
                }
                if (name && ba !== 'undefined') {
                    st = '(new ProxyCall(' + name + '))(' + ba + ')'
                    if ((node.range) && (node.range instanceof Array)) {
                        entries.push({
                            start: node.range[0],
                            end: node.range[1],
                            statement: st
                        })
                    }
                }
            }
        }
    })
    // 変換済みエントリから既存コードを置換する
    entries.sort((a, b) => { return b.end - a.end }).forEach(n => {
        source = source.slice(0, n.start) + n.statement + source.slice(n.end)
    })
    return source
}
