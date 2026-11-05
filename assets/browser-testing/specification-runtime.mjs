#!/usr/bin/env node
// Bundled by Project Agent Factory. Includes MIT-licensed Cucumber and Ajv runtime; see docs/browser-testing.md.
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// node_modules/ajv/dist/compile/codegen/code.js
var require_code = __commonJS({
  "node_modules/ajv/dist/compile/codegen/code.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.regexpCode = exports.getEsmExportName = exports.getProperty = exports.safeStringify = exports.stringify = exports.strConcat = exports.addCodeArg = exports.str = exports._ = exports.nil = exports._Code = exports.Name = exports.IDENTIFIER = exports._CodeOrName = void 0;
    var _CodeOrName = class {
    };
    exports._CodeOrName = _CodeOrName;
    exports.IDENTIFIER = /^[a-z$_][a-z$_0-9]*$/i;
    var Name = class extends _CodeOrName {
      constructor(s) {
        super();
        if (!exports.IDENTIFIER.test(s))
          throw new Error("CodeGen: name must be a valid identifier");
        this.str = s;
      }
      toString() {
        return this.str;
      }
      emptyStr() {
        return false;
      }
      get names() {
        return { [this.str]: 1 };
      }
    };
    exports.Name = Name;
    var _Code = class extends _CodeOrName {
      constructor(code) {
        super();
        this._items = typeof code === "string" ? [code] : code;
      }
      toString() {
        return this.str;
      }
      emptyStr() {
        if (this._items.length > 1)
          return false;
        const item = this._items[0];
        return item === "" || item === '""';
      }
      get str() {
        var _a;
        return (_a = this._str) !== null && _a !== void 0 ? _a : this._str = this._items.reduce((s, c) => `${s}${c}`, "");
      }
      get names() {
        var _a;
        return (_a = this._names) !== null && _a !== void 0 ? _a : this._names = this._items.reduce((names, c) => {
          if (c instanceof Name)
            names[c.str] = (names[c.str] || 0) + 1;
          return names;
        }, {});
      }
    };
    exports._Code = _Code;
    exports.nil = new _Code("");
    function _(strs, ...args) {
      const code = [strs[0]];
      let i = 0;
      while (i < args.length) {
        addCodeArg(code, args[i]);
        code.push(strs[++i]);
      }
      return new _Code(code);
    }
    exports._ = _;
    var plus = new _Code("+");
    function str(strs, ...args) {
      const expr = [safeStringify(strs[0])];
      let i = 0;
      while (i < args.length) {
        expr.push(plus);
        addCodeArg(expr, args[i]);
        expr.push(plus, safeStringify(strs[++i]));
      }
      optimize(expr);
      return new _Code(expr);
    }
    exports.str = str;
    function addCodeArg(code, arg) {
      if (arg instanceof _Code)
        code.push(...arg._items);
      else if (arg instanceof Name)
        code.push(arg);
      else
        code.push(interpolate(arg));
    }
    exports.addCodeArg = addCodeArg;
    function optimize(expr) {
      let i = 1;
      while (i < expr.length - 1) {
        if (expr[i] === plus) {
          const res = mergeExprItems(expr[i - 1], expr[i + 1]);
          if (res !== void 0) {
            expr.splice(i - 1, 3, res);
            continue;
          }
          expr[i++] = "+";
        }
        i++;
      }
    }
    function mergeExprItems(a, b) {
      if (b === '""')
        return a;
      if (a === '""')
        return b;
      if (typeof a == "string") {
        if (b instanceof Name || a[a.length - 1] !== '"')
          return;
        if (typeof b != "string")
          return `${a.slice(0, -1)}${b}"`;
        if (b[0] === '"')
          return a.slice(0, -1) + b.slice(1);
        return;
      }
      if (typeof b == "string" && b[0] === '"' && !(a instanceof Name))
        return `"${a}${b.slice(1)}`;
      return;
    }
    function strConcat(c1, c2) {
      return c2.emptyStr() ? c1 : c1.emptyStr() ? c2 : str`${c1}${c2}`;
    }
    exports.strConcat = strConcat;
    function interpolate(x) {
      return typeof x == "number" || typeof x == "boolean" || x === null ? x : safeStringify(Array.isArray(x) ? x.join(",") : x);
    }
    function stringify(x) {
      return new _Code(safeStringify(x));
    }
    exports.stringify = stringify;
    function safeStringify(x) {
      return JSON.stringify(x).replace(/\u2028/g, "\\u2028").replace(/\u2029/g, "\\u2029");
    }
    exports.safeStringify = safeStringify;
    function getProperty(key) {
      return typeof key == "string" && exports.IDENTIFIER.test(key) ? new _Code(`.${key}`) : _`[${key}]`;
    }
    exports.getProperty = getProperty;
    function getEsmExportName(key) {
      if (typeof key == "string" && exports.IDENTIFIER.test(key)) {
        return new _Code(`${key}`);
      }
      throw new Error(`CodeGen: invalid export name: ${key}, use explicit $id name mapping`);
    }
    exports.getEsmExportName = getEsmExportName;
    function regexpCode(rx) {
      return new _Code(rx.toString());
    }
    exports.regexpCode = regexpCode;
  }
});

// node_modules/ajv/dist/compile/codegen/scope.js
var require_scope = __commonJS({
  "node_modules/ajv/dist/compile/codegen/scope.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ValueScope = exports.ValueScopeName = exports.Scope = exports.varKinds = exports.UsedValueState = void 0;
    var code_1 = require_code();
    var ValueError = class extends Error {
      constructor(name) {
        super(`CodeGen: "code" for ${name} not defined`);
        this.value = name.value;
      }
    };
    var UsedValueState;
    (function(UsedValueState2) {
      UsedValueState2[UsedValueState2["Started"] = 0] = "Started";
      UsedValueState2[UsedValueState2["Completed"] = 1] = "Completed";
    })(UsedValueState || (exports.UsedValueState = UsedValueState = {}));
    exports.varKinds = {
      const: new code_1.Name("const"),
      let: new code_1.Name("let"),
      var: new code_1.Name("var")
    };
    var Scope = class {
      constructor({ prefixes, parent } = {}) {
        this._names = {};
        this._prefixes = prefixes;
        this._parent = parent;
      }
      toName(nameOrPrefix) {
        return nameOrPrefix instanceof code_1.Name ? nameOrPrefix : this.name(nameOrPrefix);
      }
      name(prefix) {
        return new code_1.Name(this._newName(prefix));
      }
      _newName(prefix) {
        const ng = this._names[prefix] || this._nameGroup(prefix);
        return `${prefix}${ng.index++}`;
      }
      _nameGroup(prefix) {
        var _a, _b;
        if (((_b = (_a = this._parent) === null || _a === void 0 ? void 0 : _a._prefixes) === null || _b === void 0 ? void 0 : _b.has(prefix)) || this._prefixes && !this._prefixes.has(prefix)) {
          throw new Error(`CodeGen: prefix "${prefix}" is not allowed in this scope`);
        }
        return this._names[prefix] = { prefix, index: 0 };
      }
    };
    exports.Scope = Scope;
    var ValueScopeName = class extends code_1.Name {
      constructor(prefix, nameStr) {
        super(nameStr);
        this.prefix = prefix;
      }
      setValue(value, { property, itemIndex }) {
        this.value = value;
        this.scopePath = (0, code_1._)`.${new code_1.Name(property)}[${itemIndex}]`;
      }
    };
    exports.ValueScopeName = ValueScopeName;
    var line = (0, code_1._)`\n`;
    var ValueScope = class extends Scope {
      constructor(opts) {
        super(opts);
        this._values = {};
        this._scope = opts.scope;
        this.opts = { ...opts, _n: opts.lines ? line : code_1.nil };
      }
      get() {
        return this._scope;
      }
      name(prefix) {
        return new ValueScopeName(prefix, this._newName(prefix));
      }
      value(nameOrPrefix, value) {
        var _a;
        if (value.ref === void 0)
          throw new Error("CodeGen: ref must be passed in value");
        const name = this.toName(nameOrPrefix);
        const { prefix } = name;
        const valueKey = (_a = value.key) !== null && _a !== void 0 ? _a : value.ref;
        let vs = this._values[prefix];
        if (vs) {
          const _name = vs.get(valueKey);
          if (_name)
            return _name;
        } else {
          vs = this._values[prefix] = /* @__PURE__ */ new Map();
        }
        vs.set(valueKey, name);
        const s = this._scope[prefix] || (this._scope[prefix] = []);
        const itemIndex = s.length;
        s[itemIndex] = value.ref;
        name.setValue(value, { property: prefix, itemIndex });
        return name;
      }
      getValue(prefix, keyOrRef) {
        const vs = this._values[prefix];
        if (!vs)
          return;
        return vs.get(keyOrRef);
      }
      scopeRefs(scopeName, values = this._values) {
        return this._reduceValues(values, (name) => {
          if (name.scopePath === void 0)
            throw new Error(`CodeGen: name "${name}" has no value`);
          return (0, code_1._)`${scopeName}${name.scopePath}`;
        });
      }
      scopeCode(values = this._values, usedValues, getCode) {
        return this._reduceValues(values, (name) => {
          if (name.value === void 0)
            throw new Error(`CodeGen: name "${name}" has no value`);
          return name.value.code;
        }, usedValues, getCode);
      }
      _reduceValues(values, valueCode, usedValues = {}, getCode) {
        let code = code_1.nil;
        for (const prefix in values) {
          const vs = values[prefix];
          if (!vs)
            continue;
          const nameSet = usedValues[prefix] = usedValues[prefix] || /* @__PURE__ */ new Map();
          vs.forEach((name) => {
            if (nameSet.has(name))
              return;
            nameSet.set(name, UsedValueState.Started);
            let c = valueCode(name);
            if (c) {
              const def = this.opts.es5 ? exports.varKinds.var : exports.varKinds.const;
              code = (0, code_1._)`${code}${def} ${name} = ${c};${this.opts._n}`;
            } else if (c = getCode === null || getCode === void 0 ? void 0 : getCode(name)) {
              code = (0, code_1._)`${code}${c}${this.opts._n}`;
            } else {
              throw new ValueError(name);
            }
            nameSet.set(name, UsedValueState.Completed);
          });
        }
        return code;
      }
    };
    exports.ValueScope = ValueScope;
  }
});

// node_modules/ajv/dist/compile/codegen/index.js
var require_codegen = __commonJS({
  "node_modules/ajv/dist/compile/codegen/index.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.or = exports.and = exports.not = exports.CodeGen = exports.operators = exports.varKinds = exports.ValueScopeName = exports.ValueScope = exports.Scope = exports.Name = exports.regexpCode = exports.stringify = exports.getProperty = exports.nil = exports.strConcat = exports.str = exports._ = void 0;
    var code_1 = require_code();
    var scope_1 = require_scope();
    var code_2 = require_code();
    Object.defineProperty(exports, "_", { enumerable: true, get: function() {
      return code_2._;
    } });
    Object.defineProperty(exports, "str", { enumerable: true, get: function() {
      return code_2.str;
    } });
    Object.defineProperty(exports, "strConcat", { enumerable: true, get: function() {
      return code_2.strConcat;
    } });
    Object.defineProperty(exports, "nil", { enumerable: true, get: function() {
      return code_2.nil;
    } });
    Object.defineProperty(exports, "getProperty", { enumerable: true, get: function() {
      return code_2.getProperty;
    } });
    Object.defineProperty(exports, "stringify", { enumerable: true, get: function() {
      return code_2.stringify;
    } });
    Object.defineProperty(exports, "regexpCode", { enumerable: true, get: function() {
      return code_2.regexpCode;
    } });
    Object.defineProperty(exports, "Name", { enumerable: true, get: function() {
      return code_2.Name;
    } });
    var scope_2 = require_scope();
    Object.defineProperty(exports, "Scope", { enumerable: true, get: function() {
      return scope_2.Scope;
    } });
    Object.defineProperty(exports, "ValueScope", { enumerable: true, get: function() {
      return scope_2.ValueScope;
    } });
    Object.defineProperty(exports, "ValueScopeName", { enumerable: true, get: function() {
      return scope_2.ValueScopeName;
    } });
    Object.defineProperty(exports, "varKinds", { enumerable: true, get: function() {
      return scope_2.varKinds;
    } });
    exports.operators = {
      GT: new code_1._Code(">"),
      GTE: new code_1._Code(">="),
      LT: new code_1._Code("<"),
      LTE: new code_1._Code("<="),
      EQ: new code_1._Code("==="),
      NEQ: new code_1._Code("!=="),
      NOT: new code_1._Code("!"),
      OR: new code_1._Code("||"),
      AND: new code_1._Code("&&"),
      ADD: new code_1._Code("+")
    };
    var Node = class {
      optimizeNodes() {
        return this;
      }
      optimizeNames(_names, _constants) {
        return this;
      }
    };
    var Def = class extends Node {
      constructor(varKind, name, rhs) {
        super();
        this.varKind = varKind;
        this.name = name;
        this.rhs = rhs;
      }
      render({ es5, _n }) {
        const varKind = es5 ? scope_1.varKinds.var : this.varKind;
        const rhs = this.rhs === void 0 ? "" : ` = ${this.rhs}`;
        return `${varKind} ${this.name}${rhs};` + _n;
      }
      optimizeNames(names, constants) {
        if (!names[this.name.str])
          return;
        if (this.rhs)
          this.rhs = optimizeExpr(this.rhs, names, constants);
        return this;
      }
      get names() {
        return this.rhs instanceof code_1._CodeOrName ? this.rhs.names : {};
      }
    };
    var Assign = class extends Node {
      constructor(lhs, rhs, sideEffects) {
        super();
        this.lhs = lhs;
        this.rhs = rhs;
        this.sideEffects = sideEffects;
      }
      render({ _n }) {
        return `${this.lhs} = ${this.rhs};` + _n;
      }
      optimizeNames(names, constants) {
        if (this.lhs instanceof code_1.Name && !names[this.lhs.str] && !this.sideEffects)
          return;
        this.rhs = optimizeExpr(this.rhs, names, constants);
        return this;
      }
      get names() {
        const names = this.lhs instanceof code_1.Name ? {} : { ...this.lhs.names };
        return addExprNames(names, this.rhs);
      }
    };
    var AssignOp = class extends Assign {
      constructor(lhs, op, rhs, sideEffects) {
        super(lhs, rhs, sideEffects);
        this.op = op;
      }
      render({ _n }) {
        return `${this.lhs} ${this.op}= ${this.rhs};` + _n;
      }
    };
    var Label = class extends Node {
      constructor(label) {
        super();
        this.label = label;
        this.names = {};
      }
      render({ _n }) {
        return `${this.label}:` + _n;
      }
    };
    var Break = class extends Node {
      constructor(label) {
        super();
        this.label = label;
        this.names = {};
      }
      render({ _n }) {
        const label = this.label ? ` ${this.label}` : "";
        return `break${label};` + _n;
      }
    };
    var Throw = class extends Node {
      constructor(error) {
        super();
        this.error = error;
      }
      render({ _n }) {
        return `throw ${this.error};` + _n;
      }
      get names() {
        return this.error.names;
      }
    };
    var AnyCode = class extends Node {
      constructor(code) {
        super();
        this.code = code;
      }
      render({ _n }) {
        return `${this.code};` + _n;
      }
      optimizeNodes() {
        return `${this.code}` ? this : void 0;
      }
      optimizeNames(names, constants) {
        this.code = optimizeExpr(this.code, names, constants);
        return this;
      }
      get names() {
        return this.code instanceof code_1._CodeOrName ? this.code.names : {};
      }
    };
    var ParentNode = class extends Node {
      constructor(nodes = []) {
        super();
        this.nodes = nodes;
      }
      render(opts) {
        return this.nodes.reduce((code, n) => code + n.render(opts), "");
      }
      optimizeNodes() {
        const { nodes } = this;
        let i = nodes.length;
        while (i--) {
          const n = nodes[i].optimizeNodes();
          if (Array.isArray(n))
            nodes.splice(i, 1, ...n);
          else if (n)
            nodes[i] = n;
          else
            nodes.splice(i, 1);
        }
        return nodes.length > 0 ? this : void 0;
      }
      optimizeNames(names, constants) {
        const { nodes } = this;
        let i = nodes.length;
        while (i--) {
          const n = nodes[i];
          if (n.optimizeNames(names, constants))
            continue;
          subtractNames(names, n.names);
          nodes.splice(i, 1);
        }
        return nodes.length > 0 ? this : void 0;
      }
      get names() {
        return this.nodes.reduce((names, n) => addNames(names, n.names), {});
      }
    };
    var BlockNode = class extends ParentNode {
      render(opts) {
        return "{" + opts._n + super.render(opts) + "}" + opts._n;
      }
    };
    var Root = class extends ParentNode {
    };
    var Else = class extends BlockNode {
    };
    Else.kind = "else";
    var If = class _If extends BlockNode {
      constructor(condition, nodes) {
        super(nodes);
        this.condition = condition;
      }
      render(opts) {
        let code = `if(${this.condition})` + super.render(opts);
        if (this.else)
          code += "else " + this.else.render(opts);
        return code;
      }
      optimizeNodes() {
        super.optimizeNodes();
        const cond = this.condition;
        if (cond === true)
          return this.nodes;
        let e = this.else;
        if (e) {
          const ns = e.optimizeNodes();
          e = this.else = Array.isArray(ns) ? new Else(ns) : ns;
        }
        if (e) {
          if (cond === false)
            return e instanceof _If ? e : e.nodes;
          if (this.nodes.length)
            return this;
          return new _If(not(cond), e instanceof _If ? [e] : e.nodes);
        }
        if (cond === false || !this.nodes.length)
          return void 0;
        return this;
      }
      optimizeNames(names, constants) {
        var _a;
        this.else = (_a = this.else) === null || _a === void 0 ? void 0 : _a.optimizeNames(names, constants);
        if (!(super.optimizeNames(names, constants) || this.else))
          return;
        this.condition = optimizeExpr(this.condition, names, constants);
        return this;
      }
      get names() {
        const names = super.names;
        addExprNames(names, this.condition);
        if (this.else)
          addNames(names, this.else.names);
        return names;
      }
    };
    If.kind = "if";
    var For = class extends BlockNode {
    };
    For.kind = "for";
    var ForLoop = class extends For {
      constructor(iteration) {
        super();
        this.iteration = iteration;
      }
      render(opts) {
        return `for(${this.iteration})` + super.render(opts);
      }
      optimizeNames(names, constants) {
        if (!super.optimizeNames(names, constants))
          return;
        this.iteration = optimizeExpr(this.iteration, names, constants);
        return this;
      }
      get names() {
        return addNames(super.names, this.iteration.names);
      }
    };
    var ForRange = class extends For {
      constructor(varKind, name, from, to) {
        super();
        this.varKind = varKind;
        this.name = name;
        this.from = from;
        this.to = to;
      }
      render(opts) {
        const varKind = opts.es5 ? scope_1.varKinds.var : this.varKind;
        const { name, from, to } = this;
        return `for(${varKind} ${name}=${from}; ${name}<${to}; ${name}++)` + super.render(opts);
      }
      get names() {
        const names = addExprNames(super.names, this.from);
        return addExprNames(names, this.to);
      }
    };
    var ForIter = class extends For {
      constructor(loop, varKind, name, iterable) {
        super();
        this.loop = loop;
        this.varKind = varKind;
        this.name = name;
        this.iterable = iterable;
      }
      render(opts) {
        return `for(${this.varKind} ${this.name} ${this.loop} ${this.iterable})` + super.render(opts);
      }
      optimizeNames(names, constants) {
        if (!super.optimizeNames(names, constants))
          return;
        this.iterable = optimizeExpr(this.iterable, names, constants);
        return this;
      }
      get names() {
        return addNames(super.names, this.iterable.names);
      }
    };
    var Func = class extends BlockNode {
      constructor(name, args, async) {
        super();
        this.name = name;
        this.args = args;
        this.async = async;
      }
      render(opts) {
        const _async = this.async ? "async " : "";
        return `${_async}function ${this.name}(${this.args})` + super.render(opts);
      }
    };
    Func.kind = "func";
    var Return = class extends ParentNode {
      render(opts) {
        return "return " + super.render(opts);
      }
    };
    Return.kind = "return";
    var Try = class extends BlockNode {
      render(opts) {
        let code = "try" + super.render(opts);
        if (this.catch)
          code += this.catch.render(opts);
        if (this.finally)
          code += this.finally.render(opts);
        return code;
      }
      optimizeNodes() {
        var _a, _b;
        super.optimizeNodes();
        (_a = this.catch) === null || _a === void 0 ? void 0 : _a.optimizeNodes();
        (_b = this.finally) === null || _b === void 0 ? void 0 : _b.optimizeNodes();
        return this;
      }
      optimizeNames(names, constants) {
        var _a, _b;
        super.optimizeNames(names, constants);
        (_a = this.catch) === null || _a === void 0 ? void 0 : _a.optimizeNames(names, constants);
        (_b = this.finally) === null || _b === void 0 ? void 0 : _b.optimizeNames(names, constants);
        return this;
      }
      get names() {
        const names = super.names;
        if (this.catch)
          addNames(names, this.catch.names);
        if (this.finally)
          addNames(names, this.finally.names);
        return names;
      }
    };
    var Catch = class extends BlockNode {
      constructor(error) {
        super();
        this.error = error;
      }
      render(opts) {
        return `catch(${this.error})` + super.render(opts);
      }
    };
    Catch.kind = "catch";
    var Finally = class extends BlockNode {
      render(opts) {
        return "finally" + super.render(opts);
      }
    };
    Finally.kind = "finally";
    var CodeGen = class {
      constructor(extScope, opts = {}) {
        this._values = {};
        this._blockStarts = [];
        this._constants = {};
        this.opts = { ...opts, _n: opts.lines ? "\n" : "" };
        this._extScope = extScope;
        this._scope = new scope_1.Scope({ parent: extScope });
        this._nodes = [new Root()];
      }
      toString() {
        return this._root.render(this.opts);
      }
      // returns unique name in the internal scope
      name(prefix) {
        return this._scope.name(prefix);
      }
      // reserves unique name in the external scope
      scopeName(prefix) {
        return this._extScope.name(prefix);
      }
      // reserves unique name in the external scope and assigns value to it
      scopeValue(prefixOrName, value) {
        const name = this._extScope.value(prefixOrName, value);
        const vs = this._values[name.prefix] || (this._values[name.prefix] = /* @__PURE__ */ new Set());
        vs.add(name);
        return name;
      }
      getScopeValue(prefix, keyOrRef) {
        return this._extScope.getValue(prefix, keyOrRef);
      }
      // return code that assigns values in the external scope to the names that are used internally
      // (same names that were returned by gen.scopeName or gen.scopeValue)
      scopeRefs(scopeName) {
        return this._extScope.scopeRefs(scopeName, this._values);
      }
      scopeCode() {
        return this._extScope.scopeCode(this._values);
      }
      _def(varKind, nameOrPrefix, rhs, constant) {
        const name = this._scope.toName(nameOrPrefix);
        if (rhs !== void 0 && constant)
          this._constants[name.str] = rhs;
        this._leafNode(new Def(varKind, name, rhs));
        return name;
      }
      // `const` declaration (`var` in es5 mode)
      const(nameOrPrefix, rhs, _constant) {
        return this._def(scope_1.varKinds.const, nameOrPrefix, rhs, _constant);
      }
      // `let` declaration with optional assignment (`var` in es5 mode)
      let(nameOrPrefix, rhs, _constant) {
        return this._def(scope_1.varKinds.let, nameOrPrefix, rhs, _constant);
      }
      // `var` declaration with optional assignment
      var(nameOrPrefix, rhs, _constant) {
        return this._def(scope_1.varKinds.var, nameOrPrefix, rhs, _constant);
      }
      // assignment code
      assign(lhs, rhs, sideEffects) {
        return this._leafNode(new Assign(lhs, rhs, sideEffects));
      }
      // `+=` code
      add(lhs, rhs) {
        return this._leafNode(new AssignOp(lhs, exports.operators.ADD, rhs));
      }
      // appends passed SafeExpr to code or executes Block
      code(c) {
        if (typeof c == "function")
          c();
        else if (c !== code_1.nil)
          this._leafNode(new AnyCode(c));
        return this;
      }
      // returns code for object literal for the passed argument list of key-value pairs
      object(...keyValues) {
        const code = ["{"];
        for (const [key, value] of keyValues) {
          if (code.length > 1)
            code.push(",");
          code.push(key);
          if (key !== value || this.opts.es5) {
            code.push(":");
            (0, code_1.addCodeArg)(code, value);
          }
        }
        code.push("}");
        return new code_1._Code(code);
      }
      // `if` clause (or statement if `thenBody` and, optionally, `elseBody` are passed)
      if(condition, thenBody, elseBody) {
        this._blockNode(new If(condition));
        if (thenBody && elseBody) {
          this.code(thenBody).else().code(elseBody).endIf();
        } else if (thenBody) {
          this.code(thenBody).endIf();
        } else if (elseBody) {
          throw new Error('CodeGen: "else" body without "then" body');
        }
        return this;
      }
      // `else if` clause - invalid without `if` or after `else` clauses
      elseIf(condition) {
        return this._elseNode(new If(condition));
      }
      // `else` clause - only valid after `if` or `else if` clauses
      else() {
        return this._elseNode(new Else());
      }
      // end `if` statement (needed if gen.if was used only with condition)
      endIf() {
        return this._endBlockNode(If, Else);
      }
      _for(node, forBody) {
        this._blockNode(node);
        if (forBody)
          this.code(forBody).endFor();
        return this;
      }
      // a generic `for` clause (or statement if `forBody` is passed)
      for(iteration, forBody) {
        return this._for(new ForLoop(iteration), forBody);
      }
      // `for` statement for a range of values
      forRange(nameOrPrefix, from, to, forBody, varKind = this.opts.es5 ? scope_1.varKinds.var : scope_1.varKinds.let) {
        const name = this._scope.toName(nameOrPrefix);
        return this._for(new ForRange(varKind, name, from, to), () => forBody(name));
      }
      // `for-of` statement (in es5 mode replace with a normal for loop)
      forOf(nameOrPrefix, iterable, forBody, varKind = scope_1.varKinds.const) {
        const name = this._scope.toName(nameOrPrefix);
        if (this.opts.es5) {
          const arr = iterable instanceof code_1.Name ? iterable : this.var("_arr", iterable);
          return this.forRange("_i", 0, (0, code_1._)`${arr}.length`, (i) => {
            this.var(name, (0, code_1._)`${arr}[${i}]`);
            forBody(name);
          });
        }
        return this._for(new ForIter("of", varKind, name, iterable), () => forBody(name));
      }
      // `for-in` statement.
      // With option `ownProperties` replaced with a `for-of` loop for object keys
      forIn(nameOrPrefix, obj, forBody, varKind = this.opts.es5 ? scope_1.varKinds.var : scope_1.varKinds.const) {
        if (this.opts.ownProperties) {
          return this.forOf(nameOrPrefix, (0, code_1._)`Object.keys(${obj})`, forBody);
        }
        const name = this._scope.toName(nameOrPrefix);
        return this._for(new ForIter("in", varKind, name, obj), () => forBody(name));
      }
      // end `for` loop
      endFor() {
        return this._endBlockNode(For);
      }
      // `label` statement
      label(label) {
        return this._leafNode(new Label(label));
      }
      // `break` statement
      break(label) {
        return this._leafNode(new Break(label));
      }
      // `return` statement
      return(value) {
        const node = new Return();
        this._blockNode(node);
        this.code(value);
        if (node.nodes.length !== 1)
          throw new Error('CodeGen: "return" should have one node');
        return this._endBlockNode(Return);
      }
      // `try` statement
      try(tryBody, catchCode, finallyCode) {
        if (!catchCode && !finallyCode)
          throw new Error('CodeGen: "try" without "catch" and "finally"');
        const node = new Try();
        this._blockNode(node);
        this.code(tryBody);
        if (catchCode) {
          const error = this.name("e");
          this._currNode = node.catch = new Catch(error);
          catchCode(error);
        }
        if (finallyCode) {
          this._currNode = node.finally = new Finally();
          this.code(finallyCode);
        }
        return this._endBlockNode(Catch, Finally);
      }
      // `throw` statement
      throw(error) {
        return this._leafNode(new Throw(error));
      }
      // start self-balancing block
      block(body, nodeCount) {
        this._blockStarts.push(this._nodes.length);
        if (body)
          this.code(body).endBlock(nodeCount);
        return this;
      }
      // end the current self-balancing block
      endBlock(nodeCount) {
        const len = this._blockStarts.pop();
        if (len === void 0)
          throw new Error("CodeGen: not in self-balancing block");
        const toClose = this._nodes.length - len;
        if (toClose < 0 || nodeCount !== void 0 && toClose !== nodeCount) {
          throw new Error(`CodeGen: wrong number of nodes: ${toClose} vs ${nodeCount} expected`);
        }
        this._nodes.length = len;
        return this;
      }
      // `function` heading (or definition if funcBody is passed)
      func(name, args = code_1.nil, async, funcBody) {
        this._blockNode(new Func(name, args, async));
        if (funcBody)
          this.code(funcBody).endFunc();
        return this;
      }
      // end function definition
      endFunc() {
        return this._endBlockNode(Func);
      }
      optimize(n = 1) {
        while (n-- > 0) {
          this._root.optimizeNodes();
          this._root.optimizeNames(this._root.names, this._constants);
        }
      }
      _leafNode(node) {
        this._currNode.nodes.push(node);
        return this;
      }
      _blockNode(node) {
        this._currNode.nodes.push(node);
        this._nodes.push(node);
      }
      _endBlockNode(N1, N2) {
        const n = this._currNode;
        if (n instanceof N1 || N2 && n instanceof N2) {
          this._nodes.pop();
          return this;
        }
        throw new Error(`CodeGen: not in block "${N2 ? `${N1.kind}/${N2.kind}` : N1.kind}"`);
      }
      _elseNode(node) {
        const n = this._currNode;
        if (!(n instanceof If)) {
          throw new Error('CodeGen: "else" without "if"');
        }
        this._currNode = n.else = node;
        return this;
      }
      get _root() {
        return this._nodes[0];
      }
      get _currNode() {
        const ns = this._nodes;
        return ns[ns.length - 1];
      }
      set _currNode(node) {
        const ns = this._nodes;
        ns[ns.length - 1] = node;
      }
    };
    exports.CodeGen = CodeGen;
    function addNames(names, from) {
      for (const n in from)
        names[n] = (names[n] || 0) + (from[n] || 0);
      return names;
    }
    function addExprNames(names, from) {
      return from instanceof code_1._CodeOrName ? addNames(names, from.names) : names;
    }
    function optimizeExpr(expr, names, constants) {
      if (expr instanceof code_1.Name)
        return replaceName(expr);
      if (!canOptimize(expr))
        return expr;
      return new code_1._Code(expr._items.reduce((items, c) => {
        if (c instanceof code_1.Name)
          c = replaceName(c);
        if (c instanceof code_1._Code)
          items.push(...c._items);
        else
          items.push(c);
        return items;
      }, []));
      function replaceName(n) {
        const c = constants[n.str];
        if (c === void 0 || names[n.str] !== 1)
          return n;
        delete names[n.str];
        return c;
      }
      function canOptimize(e) {
        return e instanceof code_1._Code && e._items.some((c) => c instanceof code_1.Name && names[c.str] === 1 && constants[c.str] !== void 0);
      }
    }
    function subtractNames(names, from) {
      for (const n in from)
        names[n] = (names[n] || 0) - (from[n] || 0);
    }
    function not(x) {
      return typeof x == "boolean" || typeof x == "number" || x === null ? !x : (0, code_1._)`!${par(x)}`;
    }
    exports.not = not;
    var andCode = mappend(exports.operators.AND);
    function and(...args) {
      return args.reduce(andCode);
    }
    exports.and = and;
    var orCode = mappend(exports.operators.OR);
    function or(...args) {
      return args.reduce(orCode);
    }
    exports.or = or;
    function mappend(op) {
      return (x, y) => x === code_1.nil ? y : y === code_1.nil ? x : (0, code_1._)`${par(x)} ${op} ${par(y)}`;
    }
    function par(x) {
      return x instanceof code_1.Name ? x : (0, code_1._)`(${x})`;
    }
  }
});

// node_modules/ajv/dist/compile/util.js
var require_util = __commonJS({
  "node_modules/ajv/dist/compile/util.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.checkStrictMode = exports.getErrorPath = exports.Type = exports.useFunc = exports.setEvaluated = exports.evaluatedPropsToName = exports.mergeEvaluated = exports.eachItem = exports.unescapeJsonPointer = exports.escapeJsonPointer = exports.escapeFragment = exports.unescapeFragment = exports.schemaRefOrVal = exports.schemaHasRulesButRef = exports.schemaHasRules = exports.checkUnknownRules = exports.alwaysValidSchema = exports.toHash = void 0;
    var codegen_1 = require_codegen();
    var code_1 = require_code();
    function toHash(arr) {
      const hash2 = {};
      for (const item of arr)
        hash2[item] = true;
      return hash2;
    }
    exports.toHash = toHash;
    function alwaysValidSchema(it, schema) {
      if (typeof schema == "boolean")
        return schema;
      if (Object.keys(schema).length === 0)
        return true;
      checkUnknownRules(it, schema);
      return !schemaHasRules(schema, it.self.RULES.all);
    }
    exports.alwaysValidSchema = alwaysValidSchema;
    function checkUnknownRules(it, schema = it.schema) {
      const { opts, self: self2 } = it;
      if (!opts.strictSchema)
        return;
      if (typeof schema === "boolean")
        return;
      const rules = self2.RULES.keywords;
      for (const key in schema) {
        if (!rules[key])
          checkStrictMode(it, `unknown keyword: "${key}"`);
      }
    }
    exports.checkUnknownRules = checkUnknownRules;
    function schemaHasRules(schema, rules) {
      if (typeof schema == "boolean")
        return !schema;
      for (const key in schema)
        if (rules[key])
          return true;
      return false;
    }
    exports.schemaHasRules = schemaHasRules;
    function schemaHasRulesButRef(schema, RULES) {
      if (typeof schema == "boolean")
        return !schema;
      for (const key in schema)
        if (key !== "$ref" && RULES.all[key])
          return true;
      return false;
    }
    exports.schemaHasRulesButRef = schemaHasRulesButRef;
    function schemaRefOrVal({ topSchemaRef, schemaPath }, schema, keyword, $data) {
      if (!$data) {
        if (typeof schema == "number" || typeof schema == "boolean")
          return schema;
        if (typeof schema == "string")
          return (0, codegen_1._)`${schema}`;
      }
      return (0, codegen_1._)`${topSchemaRef}${schemaPath}${(0, codegen_1.getProperty)(keyword)}`;
    }
    exports.schemaRefOrVal = schemaRefOrVal;
    function unescapeFragment(str) {
      return unescapeJsonPointer(decodeURIComponent(str));
    }
    exports.unescapeFragment = unescapeFragment;
    function escapeFragment(str) {
      return encodeURIComponent(escapeJsonPointer(str));
    }
    exports.escapeFragment = escapeFragment;
    function escapeJsonPointer(str) {
      if (typeof str == "number")
        return `${str}`;
      return str.replace(/~/g, "~0").replace(/\//g, "~1");
    }
    exports.escapeJsonPointer = escapeJsonPointer;
    function unescapeJsonPointer(str) {
      return str.replace(/~1/g, "/").replace(/~0/g, "~");
    }
    exports.unescapeJsonPointer = unescapeJsonPointer;
    function eachItem(xs, f) {
      if (Array.isArray(xs)) {
        for (const x of xs)
          f(x);
      } else {
        f(xs);
      }
    }
    exports.eachItem = eachItem;
    function makeMergeEvaluated({ mergeNames, mergeToName, mergeValues, resultToName }) {
      return (gen, from, to, toName) => {
        const res = to === void 0 ? from : to instanceof codegen_1.Name ? (from instanceof codegen_1.Name ? mergeNames(gen, from, to) : mergeToName(gen, from, to), to) : from instanceof codegen_1.Name ? (mergeToName(gen, to, from), from) : mergeValues(from, to);
        return toName === codegen_1.Name && !(res instanceof codegen_1.Name) ? resultToName(gen, res) : res;
      };
    }
    exports.mergeEvaluated = {
      props: makeMergeEvaluated({
        mergeNames: (gen, from, to) => gen.if((0, codegen_1._)`${to} !== true && ${from} !== undefined`, () => {
          gen.if((0, codegen_1._)`${from} === true`, () => gen.assign(to, true), () => gen.assign(to, (0, codegen_1._)`${to} || {}`).code((0, codegen_1._)`Object.assign(${to}, ${from})`));
        }),
        mergeToName: (gen, from, to) => gen.if((0, codegen_1._)`${to} !== true`, () => {
          if (from === true) {
            gen.assign(to, true);
          } else {
            gen.assign(to, (0, codegen_1._)`${to} || {}`);
            setEvaluated(gen, to, from);
          }
        }),
        mergeValues: (from, to) => from === true ? true : { ...from, ...to },
        resultToName: evaluatedPropsToName
      }),
      items: makeMergeEvaluated({
        mergeNames: (gen, from, to) => gen.if((0, codegen_1._)`${to} !== true && ${from} !== undefined`, () => gen.assign(to, (0, codegen_1._)`${from} === true ? true : ${to} > ${from} ? ${to} : ${from}`)),
        mergeToName: (gen, from, to) => gen.if((0, codegen_1._)`${to} !== true`, () => gen.assign(to, from === true ? true : (0, codegen_1._)`${to} > ${from} ? ${to} : ${from}`)),
        mergeValues: (from, to) => from === true ? true : Math.max(from, to),
        resultToName: (gen, items) => gen.var("items", items)
      })
    };
    function evaluatedPropsToName(gen, ps) {
      if (ps === true)
        return gen.var("props", true);
      const props = gen.var("props", (0, codegen_1._)`{}`);
      if (ps !== void 0)
        setEvaluated(gen, props, ps);
      return props;
    }
    exports.evaluatedPropsToName = evaluatedPropsToName;
    function setEvaluated(gen, props, ps) {
      Object.keys(ps).forEach((p) => gen.assign((0, codegen_1._)`${props}${(0, codegen_1.getProperty)(p)}`, true));
    }
    exports.setEvaluated = setEvaluated;
    var snippets = {};
    function useFunc(gen, f) {
      return gen.scopeValue("func", {
        ref: f,
        code: snippets[f.code] || (snippets[f.code] = new code_1._Code(f.code))
      });
    }
    exports.useFunc = useFunc;
    var Type2;
    (function(Type3) {
      Type3[Type3["Num"] = 0] = "Num";
      Type3[Type3["Str"] = 1] = "Str";
    })(Type2 || (exports.Type = Type2 = {}));
    function getErrorPath(dataProp, dataPropType, jsPropertySyntax) {
      if (dataProp instanceof codegen_1.Name) {
        const isNumber = dataPropType === Type2.Num;
        return jsPropertySyntax ? isNumber ? (0, codegen_1._)`"[" + ${dataProp} + "]"` : (0, codegen_1._)`"['" + ${dataProp} + "']"` : isNumber ? (0, codegen_1._)`"/" + ${dataProp}` : (0, codegen_1._)`"/" + ${dataProp}.replace(/~/g, "~0").replace(/\\//g, "~1")`;
      }
      return jsPropertySyntax ? (0, codegen_1.getProperty)(dataProp).toString() : "/" + escapeJsonPointer(dataProp);
    }
    exports.getErrorPath = getErrorPath;
    function checkStrictMode(it, msg, mode = it.opts.strictSchema) {
      if (!mode)
        return;
      msg = `strict mode: ${msg}`;
      if (mode === true)
        throw new Error(msg);
      it.self.logger.warn(msg);
    }
    exports.checkStrictMode = checkStrictMode;
  }
});

// node_modules/ajv/dist/compile/names.js
var require_names = __commonJS({
  "node_modules/ajv/dist/compile/names.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var codegen_1 = require_codegen();
    var names = {
      // validation function arguments
      data: new codegen_1.Name("data"),
      // data passed to validation function
      // args passed from referencing schema
      valCxt: new codegen_1.Name("valCxt"),
      // validation/data context - should not be used directly, it is destructured to the names below
      instancePath: new codegen_1.Name("instancePath"),
      parentData: new codegen_1.Name("parentData"),
      parentDataProperty: new codegen_1.Name("parentDataProperty"),
      rootData: new codegen_1.Name("rootData"),
      // root data - same as the data passed to the first/top validation function
      dynamicAnchors: new codegen_1.Name("dynamicAnchors"),
      // used to support recursiveRef and dynamicRef
      // function scoped variables
      vErrors: new codegen_1.Name("vErrors"),
      // null or array of validation errors
      errors: new codegen_1.Name("errors"),
      // counter of validation errors
      this: new codegen_1.Name("this"),
      // "globals"
      self: new codegen_1.Name("self"),
      scope: new codegen_1.Name("scope"),
      // JTD serialize/parse name for JSON string and position
      json: new codegen_1.Name("json"),
      jsonPos: new codegen_1.Name("jsonPos"),
      jsonLen: new codegen_1.Name("jsonLen"),
      jsonPart: new codegen_1.Name("jsonPart")
    };
    exports.default = names;
  }
});

// node_modules/ajv/dist/compile/errors.js
var require_errors = __commonJS({
  "node_modules/ajv/dist/compile/errors.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.extendErrors = exports.resetErrorsCount = exports.reportExtraError = exports.reportError = exports.keyword$DataError = exports.keywordError = void 0;
    var codegen_1 = require_codegen();
    var util_1 = require_util();
    var names_1 = require_names();
    exports.keywordError = {
      message: ({ keyword }) => (0, codegen_1.str)`must pass "${keyword}" keyword validation`
    };
    exports.keyword$DataError = {
      message: ({ keyword, schemaType }) => schemaType ? (0, codegen_1.str)`"${keyword}" keyword must be ${schemaType} ($data)` : (0, codegen_1.str)`"${keyword}" keyword is invalid ($data)`
    };
    function reportError(cxt, error = exports.keywordError, errorPaths, overrideAllErrors) {
      const { it } = cxt;
      const { gen, compositeRule, allErrors } = it;
      const errObj = errorObjectCode(cxt, error, errorPaths);
      if (overrideAllErrors !== null && overrideAllErrors !== void 0 ? overrideAllErrors : compositeRule || allErrors) {
        addError(gen, errObj);
      } else {
        returnErrors(it, (0, codegen_1._)`[${errObj}]`);
      }
    }
    exports.reportError = reportError;
    function reportExtraError(cxt, error = exports.keywordError, errorPaths) {
      const { it } = cxt;
      const { gen, compositeRule, allErrors } = it;
      const errObj = errorObjectCode(cxt, error, errorPaths);
      addError(gen, errObj);
      if (!(compositeRule || allErrors)) {
        returnErrors(it, names_1.default.vErrors);
      }
    }
    exports.reportExtraError = reportExtraError;
    function resetErrorsCount(gen, errsCount) {
      gen.assign(names_1.default.errors, errsCount);
      gen.if((0, codegen_1._)`${names_1.default.vErrors} !== null`, () => gen.if(errsCount, () => gen.assign((0, codegen_1._)`${names_1.default.vErrors}.length`, errsCount), () => gen.assign(names_1.default.vErrors, null)));
    }
    exports.resetErrorsCount = resetErrorsCount;
    function extendErrors({ gen, keyword, schemaValue, data, errsCount, it }) {
      if (errsCount === void 0)
        throw new Error("ajv implementation error");
      const err = gen.name("err");
      gen.forRange("i", errsCount, names_1.default.errors, (i) => {
        gen.const(err, (0, codegen_1._)`${names_1.default.vErrors}[${i}]`);
        gen.if((0, codegen_1._)`${err}.instancePath === undefined`, () => gen.assign((0, codegen_1._)`${err}.instancePath`, (0, codegen_1.strConcat)(names_1.default.instancePath, it.errorPath)));
        gen.assign((0, codegen_1._)`${err}.schemaPath`, (0, codegen_1.str)`${it.errSchemaPath}/${keyword}`);
        if (it.opts.verbose) {
          gen.assign((0, codegen_1._)`${err}.schema`, schemaValue);
          gen.assign((0, codegen_1._)`${err}.data`, data);
        }
      });
    }
    exports.extendErrors = extendErrors;
    function addError(gen, errObj) {
      const err = gen.const("err", errObj);
      gen.if((0, codegen_1._)`${names_1.default.vErrors} === null`, () => gen.assign(names_1.default.vErrors, (0, codegen_1._)`[${err}]`), (0, codegen_1._)`${names_1.default.vErrors}.push(${err})`);
      gen.code((0, codegen_1._)`${names_1.default.errors}++`);
    }
    function returnErrors(it, errs) {
      const { gen, validateName, schemaEnv } = it;
      if (schemaEnv.$async) {
        gen.throw((0, codegen_1._)`new ${it.ValidationError}(${errs})`);
      } else {
        gen.assign((0, codegen_1._)`${validateName}.errors`, errs);
        gen.return(false);
      }
    }
    var E = {
      keyword: new codegen_1.Name("keyword"),
      schemaPath: new codegen_1.Name("schemaPath"),
      // also used in JTD errors
      params: new codegen_1.Name("params"),
      propertyName: new codegen_1.Name("propertyName"),
      message: new codegen_1.Name("message"),
      schema: new codegen_1.Name("schema"),
      parentSchema: new codegen_1.Name("parentSchema")
    };
    function errorObjectCode(cxt, error, errorPaths) {
      const { createErrors } = cxt.it;
      if (createErrors === false)
        return (0, codegen_1._)`{}`;
      return errorObject(cxt, error, errorPaths);
    }
    function errorObject(cxt, error, errorPaths = {}) {
      const { gen, it } = cxt;
      const keyValues = [
        errorInstancePath(it, errorPaths),
        errorSchemaPath(cxt, errorPaths)
      ];
      extraErrorProps(cxt, error, keyValues);
      return gen.object(...keyValues);
    }
    function errorInstancePath({ errorPath }, { instancePath }) {
      const instPath = instancePath ? (0, codegen_1.str)`${errorPath}${(0, util_1.getErrorPath)(instancePath, util_1.Type.Str)}` : errorPath;
      return [names_1.default.instancePath, (0, codegen_1.strConcat)(names_1.default.instancePath, instPath)];
    }
    function errorSchemaPath({ keyword, it: { errSchemaPath } }, { schemaPath, parentSchema }) {
      let schPath = parentSchema ? errSchemaPath : (0, codegen_1.str)`${errSchemaPath}/${keyword}`;
      if (schemaPath) {
        schPath = (0, codegen_1.str)`${schPath}${(0, util_1.getErrorPath)(schemaPath, util_1.Type.Str)}`;
      }
      return [E.schemaPath, schPath];
    }
    function extraErrorProps(cxt, { params, message }, keyValues) {
      const { keyword, data, schemaValue, it } = cxt;
      const { opts, propertyName, topSchemaRef, schemaPath } = it;
      keyValues.push([E.keyword, keyword], [E.params, typeof params == "function" ? params(cxt) : params || (0, codegen_1._)`{}`]);
      if (opts.messages) {
        keyValues.push([E.message, typeof message == "function" ? message(cxt) : message]);
      }
      if (opts.verbose) {
        keyValues.push([E.schema, schemaValue], [E.parentSchema, (0, codegen_1._)`${topSchemaRef}${schemaPath}`], [names_1.default.data, data]);
      }
      if (propertyName)
        keyValues.push([E.propertyName, propertyName]);
    }
  }
});

// node_modules/ajv/dist/compile/validate/boolSchema.js
var require_boolSchema = __commonJS({
  "node_modules/ajv/dist/compile/validate/boolSchema.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.boolOrEmptySchema = exports.topBoolOrEmptySchema = void 0;
    var errors_1 = require_errors();
    var codegen_1 = require_codegen();
    var names_1 = require_names();
    var boolError = {
      message: "boolean schema is false"
    };
    function topBoolOrEmptySchema(it) {
      const { gen, schema, validateName } = it;
      if (schema === false) {
        falseSchemaError(it, false);
      } else if (typeof schema == "object" && schema.$async === true) {
        gen.return(names_1.default.data);
      } else {
        gen.assign((0, codegen_1._)`${validateName}.errors`, null);
        gen.return(true);
      }
    }
    exports.topBoolOrEmptySchema = topBoolOrEmptySchema;
    function boolOrEmptySchema(it, valid) {
      const { gen, schema } = it;
      if (schema === false) {
        gen.var(valid, false);
        falseSchemaError(it);
      } else {
        gen.var(valid, true);
      }
    }
    exports.boolOrEmptySchema = boolOrEmptySchema;
    function falseSchemaError(it, overrideAllErrors) {
      const { gen, data } = it;
      const cxt = {
        gen,
        keyword: "false schema",
        data,
        schema: false,
        schemaCode: false,
        schemaValue: false,
        params: {},
        it
      };
      (0, errors_1.reportError)(cxt, boolError, void 0, overrideAllErrors);
    }
  }
});

// node_modules/ajv/dist/compile/rules.js
var require_rules = __commonJS({
  "node_modules/ajv/dist/compile/rules.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.getRules = exports.isJSONType = void 0;
    var _jsonTypes = ["string", "number", "integer", "boolean", "null", "object", "array"];
    var jsonTypes = new Set(_jsonTypes);
    function isJSONType(x) {
      return typeof x == "string" && jsonTypes.has(x);
    }
    exports.isJSONType = isJSONType;
    function getRules() {
      const groups = {
        number: { type: "number", rules: [] },
        string: { type: "string", rules: [] },
        array: { type: "array", rules: [] },
        object: { type: "object", rules: [] }
      };
      return {
        types: { ...groups, integer: true, boolean: true, null: true },
        rules: [{ rules: [] }, groups.number, groups.string, groups.array, groups.object],
        post: { rules: [] },
        all: {},
        keywords: {}
      };
    }
    exports.getRules = getRules;
  }
});

// node_modules/ajv/dist/compile/validate/applicability.js
var require_applicability = __commonJS({
  "node_modules/ajv/dist/compile/validate/applicability.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.shouldUseRule = exports.shouldUseGroup = exports.schemaHasRulesForType = void 0;
    function schemaHasRulesForType({ schema, self: self2 }, type) {
      const group = self2.RULES.types[type];
      return group && group !== true && shouldUseGroup(schema, group);
    }
    exports.schemaHasRulesForType = schemaHasRulesForType;
    function shouldUseGroup(schema, group) {
      return group.rules.some((rule) => shouldUseRule(schema, rule));
    }
    exports.shouldUseGroup = shouldUseGroup;
    function shouldUseRule(schema, rule) {
      var _a;
      return schema[rule.keyword] !== void 0 || ((_a = rule.definition.implements) === null || _a === void 0 ? void 0 : _a.some((kwd) => schema[kwd] !== void 0));
    }
    exports.shouldUseRule = shouldUseRule;
  }
});

// node_modules/ajv/dist/compile/validate/dataType.js
var require_dataType = __commonJS({
  "node_modules/ajv/dist/compile/validate/dataType.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.reportTypeError = exports.checkDataTypes = exports.checkDataType = exports.coerceAndCheckDataType = exports.getJSONTypes = exports.getSchemaTypes = exports.DataType = void 0;
    var rules_1 = require_rules();
    var applicability_1 = require_applicability();
    var errors_1 = require_errors();
    var codegen_1 = require_codegen();
    var util_1 = require_util();
    var DataType;
    (function(DataType2) {
      DataType2[DataType2["Correct"] = 0] = "Correct";
      DataType2[DataType2["Wrong"] = 1] = "Wrong";
    })(DataType || (exports.DataType = DataType = {}));
    function getSchemaTypes(schema) {
      const types = getJSONTypes(schema.type);
      const hasNull = types.includes("null");
      if (hasNull) {
        if (schema.nullable === false)
          throw new Error("type: null contradicts nullable: false");
      } else {
        if (!types.length && schema.nullable !== void 0) {
          throw new Error('"nullable" cannot be used without "type"');
        }
        if (schema.nullable === true)
          types.push("null");
      }
      return types;
    }
    exports.getSchemaTypes = getSchemaTypes;
    function getJSONTypes(ts) {
      const types = Array.isArray(ts) ? ts : ts ? [ts] : [];
      if (types.every(rules_1.isJSONType))
        return types;
      throw new Error("type must be JSONType or JSONType[]: " + types.join(","));
    }
    exports.getJSONTypes = getJSONTypes;
    function coerceAndCheckDataType(it, types) {
      const { gen, data, opts } = it;
      const coerceTo = coerceToTypes(types, opts.coerceTypes);
      const checkTypes = types.length > 0 && !(coerceTo.length === 0 && types.length === 1 && (0, applicability_1.schemaHasRulesForType)(it, types[0]));
      if (checkTypes) {
        const wrongType = checkDataTypes(types, data, opts.strictNumbers, DataType.Wrong);
        gen.if(wrongType, () => {
          if (coerceTo.length)
            coerceData(it, types, coerceTo);
          else
            reportTypeError(it);
        });
      }
      return checkTypes;
    }
    exports.coerceAndCheckDataType = coerceAndCheckDataType;
    var COERCIBLE = /* @__PURE__ */ new Set(["string", "number", "integer", "boolean", "null"]);
    function coerceToTypes(types, coerceTypes) {
      return coerceTypes ? types.filter((t) => COERCIBLE.has(t) || coerceTypes === "array" && t === "array") : [];
    }
    function coerceData(it, types, coerceTo) {
      const { gen, data, opts } = it;
      const dataType = gen.let("dataType", (0, codegen_1._)`typeof ${data}`);
      const coerced = gen.let("coerced", (0, codegen_1._)`undefined`);
      if (opts.coerceTypes === "array") {
        gen.if((0, codegen_1._)`${dataType} == 'object' && Array.isArray(${data}) && ${data}.length == 1`, () => gen.assign(data, (0, codegen_1._)`${data}[0]`).assign(dataType, (0, codegen_1._)`typeof ${data}`).if(checkDataTypes(types, data, opts.strictNumbers), () => gen.assign(coerced, data)));
      }
      gen.if((0, codegen_1._)`${coerced} !== undefined`);
      for (const t of coerceTo) {
        if (COERCIBLE.has(t) || t === "array" && opts.coerceTypes === "array") {
          coerceSpecificType(t);
        }
      }
      gen.else();
      reportTypeError(it);
      gen.endIf();
      gen.if((0, codegen_1._)`${coerced} !== undefined`, () => {
        gen.assign(data, coerced);
        assignParentData(it, coerced);
      });
      function coerceSpecificType(t) {
        switch (t) {
          case "string":
            gen.elseIf((0, codegen_1._)`${dataType} == "number" || ${dataType} == "boolean"`).assign(coerced, (0, codegen_1._)`"" + ${data}`).elseIf((0, codegen_1._)`${data} === null`).assign(coerced, (0, codegen_1._)`""`);
            return;
          case "number":
            gen.elseIf((0, codegen_1._)`${dataType} == "boolean" || ${data} === null
              || (${dataType} == "string" && ${data} && ${data} == +${data})`).assign(coerced, (0, codegen_1._)`+${data}`);
            return;
          case "integer":
            gen.elseIf((0, codegen_1._)`${dataType} === "boolean" || ${data} === null
              || (${dataType} === "string" && ${data} && ${data} == +${data} && !(${data} % 1))`).assign(coerced, (0, codegen_1._)`+${data}`);
            return;
          case "boolean":
            gen.elseIf((0, codegen_1._)`${data} === "false" || ${data} === 0 || ${data} === null`).assign(coerced, false).elseIf((0, codegen_1._)`${data} === "true" || ${data} === 1`).assign(coerced, true);
            return;
          case "null":
            gen.elseIf((0, codegen_1._)`${data} === "" || ${data} === 0 || ${data} === false`);
            gen.assign(coerced, null);
            return;
          case "array":
            gen.elseIf((0, codegen_1._)`${dataType} === "string" || ${dataType} === "number"
              || ${dataType} === "boolean" || ${data} === null`).assign(coerced, (0, codegen_1._)`[${data}]`);
        }
      }
    }
    function assignParentData({ gen, parentData, parentDataProperty }, expr) {
      gen.if((0, codegen_1._)`${parentData} !== undefined`, () => gen.assign((0, codegen_1._)`${parentData}[${parentDataProperty}]`, expr));
    }
    function checkDataType(dataType, data, strictNums, correct = DataType.Correct) {
      const EQ = correct === DataType.Correct ? codegen_1.operators.EQ : codegen_1.operators.NEQ;
      let cond;
      switch (dataType) {
        case "null":
          return (0, codegen_1._)`${data} ${EQ} null`;
        case "array":
          cond = (0, codegen_1._)`Array.isArray(${data})`;
          break;
        case "object":
          cond = (0, codegen_1._)`${data} && typeof ${data} == "object" && !Array.isArray(${data})`;
          break;
        case "integer":
          cond = numCond((0, codegen_1._)`!(${data} % 1) && !isNaN(${data})`);
          break;
        case "number":
          cond = numCond();
          break;
        default:
          return (0, codegen_1._)`typeof ${data} ${EQ} ${dataType}`;
      }
      return correct === DataType.Correct ? cond : (0, codegen_1.not)(cond);
      function numCond(_cond = codegen_1.nil) {
        return (0, codegen_1.and)((0, codegen_1._)`typeof ${data} == "number"`, _cond, strictNums ? (0, codegen_1._)`isFinite(${data})` : codegen_1.nil);
      }
    }
    exports.checkDataType = checkDataType;
    function checkDataTypes(dataTypes, data, strictNums, correct) {
      if (dataTypes.length === 1) {
        return checkDataType(dataTypes[0], data, strictNums, correct);
      }
      let cond;
      const types = (0, util_1.toHash)(dataTypes);
      if (types.array && types.object) {
        const notObj = (0, codegen_1._)`typeof ${data} != "object"`;
        cond = types.null ? notObj : (0, codegen_1._)`!${data} || ${notObj}`;
        delete types.null;
        delete types.array;
        delete types.object;
      } else {
        cond = codegen_1.nil;
      }
      if (types.number)
        delete types.integer;
      for (const t in types)
        cond = (0, codegen_1.and)(cond, checkDataType(t, data, strictNums, correct));
      return cond;
    }
    exports.checkDataTypes = checkDataTypes;
    var typeError = {
      message: ({ schema }) => `must be ${schema}`,
      params: ({ schema, schemaValue }) => typeof schema == "string" ? (0, codegen_1._)`{type: ${schema}}` : (0, codegen_1._)`{type: ${schemaValue}}`
    };
    function reportTypeError(it) {
      const cxt = getTypeErrorContext(it);
      (0, errors_1.reportError)(cxt, typeError);
    }
    exports.reportTypeError = reportTypeError;
    function getTypeErrorContext(it) {
      const { gen, data, schema } = it;
      const schemaCode = (0, util_1.schemaRefOrVal)(it, schema, "type");
      return {
        gen,
        keyword: "type",
        data,
        schema: schema.type,
        schemaCode,
        schemaValue: schemaCode,
        parentSchema: schema,
        params: {},
        it
      };
    }
  }
});

// node_modules/ajv/dist/compile/validate/defaults.js
var require_defaults = __commonJS({
  "node_modules/ajv/dist/compile/validate/defaults.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.assignDefaults = void 0;
    var codegen_1 = require_codegen();
    var util_1 = require_util();
    function assignDefaults(it, ty) {
      const { properties, items } = it.schema;
      if (ty === "object" && properties) {
        for (const key in properties) {
          assignDefault(it, key, properties[key].default);
        }
      } else if (ty === "array" && Array.isArray(items)) {
        items.forEach((sch, i) => assignDefault(it, i, sch.default));
      }
    }
    exports.assignDefaults = assignDefaults;
    function assignDefault(it, prop, defaultValue) {
      const { gen, compositeRule, data, opts } = it;
      if (defaultValue === void 0)
        return;
      const childData = (0, codegen_1._)`${data}${(0, codegen_1.getProperty)(prop)}`;
      if (compositeRule) {
        (0, util_1.checkStrictMode)(it, `default is ignored for: ${childData}`);
        return;
      }
      let condition = (0, codegen_1._)`${childData} === undefined`;
      if (opts.useDefaults === "empty") {
        condition = (0, codegen_1._)`${condition} || ${childData} === null || ${childData} === ""`;
      }
      gen.if(condition, (0, codegen_1._)`${childData} = ${(0, codegen_1.stringify)(defaultValue)}`);
    }
  }
});

// node_modules/ajv/dist/vocabularies/code.js
var require_code2 = __commonJS({
  "node_modules/ajv/dist/vocabularies/code.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.validateUnion = exports.validateArray = exports.usePattern = exports.callValidateCode = exports.schemaProperties = exports.allSchemaProperties = exports.noPropertyInData = exports.propertyInData = exports.isOwnProperty = exports.hasPropFunc = exports.reportMissingProp = exports.checkMissingProp = exports.checkReportMissingProp = void 0;
    var codegen_1 = require_codegen();
    var util_1 = require_util();
    var names_1 = require_names();
    var util_2 = require_util();
    function checkReportMissingProp(cxt, prop) {
      const { gen, data, it } = cxt;
      gen.if(noPropertyInData(gen, data, prop, it.opts.ownProperties), () => {
        cxt.setParams({ missingProperty: (0, codegen_1._)`${prop}` }, true);
        cxt.error();
      });
    }
    exports.checkReportMissingProp = checkReportMissingProp;
    function checkMissingProp({ gen, data, it: { opts } }, properties, missing) {
      return (0, codegen_1.or)(...properties.map((prop) => (0, codegen_1.and)(noPropertyInData(gen, data, prop, opts.ownProperties), (0, codegen_1._)`${missing} = ${prop}`)));
    }
    exports.checkMissingProp = checkMissingProp;
    function reportMissingProp(cxt, missing) {
      cxt.setParams({ missingProperty: missing }, true);
      cxt.error();
    }
    exports.reportMissingProp = reportMissingProp;
    function hasPropFunc(gen) {
      return gen.scopeValue("func", {
        // eslint-disable-next-line @typescript-eslint/unbound-method
        ref: Object.prototype.hasOwnProperty,
        code: (0, codegen_1._)`Object.prototype.hasOwnProperty`
      });
    }
    exports.hasPropFunc = hasPropFunc;
    function isOwnProperty(gen, data, property) {
      return (0, codegen_1._)`${hasPropFunc(gen)}.call(${data}, ${property})`;
    }
    exports.isOwnProperty = isOwnProperty;
    function propertyInData(gen, data, property, ownProperties) {
      const cond = (0, codegen_1._)`${data}${(0, codegen_1.getProperty)(property)} !== undefined`;
      return ownProperties ? (0, codegen_1._)`${cond} && ${isOwnProperty(gen, data, property)}` : cond;
    }
    exports.propertyInData = propertyInData;
    function noPropertyInData(gen, data, property, ownProperties) {
      const cond = (0, codegen_1._)`${data}${(0, codegen_1.getProperty)(property)} === undefined`;
      return ownProperties ? (0, codegen_1.or)(cond, (0, codegen_1.not)(isOwnProperty(gen, data, property))) : cond;
    }
    exports.noPropertyInData = noPropertyInData;
    function allSchemaProperties(schemaMap) {
      return schemaMap ? Object.keys(schemaMap).filter((p) => p !== "__proto__") : [];
    }
    exports.allSchemaProperties = allSchemaProperties;
    function schemaProperties(it, schemaMap) {
      return allSchemaProperties(schemaMap).filter((p) => !(0, util_1.alwaysValidSchema)(it, schemaMap[p]));
    }
    exports.schemaProperties = schemaProperties;
    function callValidateCode({ schemaCode, data, it: { gen, topSchemaRef, schemaPath, errorPath }, it }, func, context, passSchema) {
      const dataAndSchema = passSchema ? (0, codegen_1._)`${schemaCode}, ${data}, ${topSchemaRef}${schemaPath}` : data;
      const valCxt = [
        [names_1.default.instancePath, (0, codegen_1.strConcat)(names_1.default.instancePath, errorPath)],
        [names_1.default.parentData, it.parentData],
        [names_1.default.parentDataProperty, it.parentDataProperty],
        [names_1.default.rootData, names_1.default.rootData]
      ];
      if (it.opts.dynamicRef)
        valCxt.push([names_1.default.dynamicAnchors, names_1.default.dynamicAnchors]);
      const args = (0, codegen_1._)`${dataAndSchema}, ${gen.object(...valCxt)}`;
      return context !== codegen_1.nil ? (0, codegen_1._)`${func}.call(${context}, ${args})` : (0, codegen_1._)`${func}(${args})`;
    }
    exports.callValidateCode = callValidateCode;
    var newRegExp = (0, codegen_1._)`new RegExp`;
    function usePattern({ gen, it: { opts } }, pattern) {
      const u = opts.unicodeRegExp ? "u" : "";
      const { regExp } = opts.code;
      const rx = regExp(pattern, u);
      return gen.scopeValue("pattern", {
        key: rx.toString(),
        ref: rx,
        code: (0, codegen_1._)`${regExp.code === "new RegExp" ? newRegExp : (0, util_2.useFunc)(gen, regExp)}(${pattern}, ${u})`
      });
    }
    exports.usePattern = usePattern;
    function validateArray(cxt) {
      const { gen, data, keyword, it } = cxt;
      const valid = gen.name("valid");
      if (it.allErrors) {
        const validArr = gen.let("valid", true);
        validateItems(() => gen.assign(validArr, false));
        return validArr;
      }
      gen.var(valid, true);
      validateItems(() => gen.break());
      return valid;
      function validateItems(notValid) {
        const len = gen.const("len", (0, codegen_1._)`${data}.length`);
        gen.forRange("i", 0, len, (i) => {
          cxt.subschema({
            keyword,
            dataProp: i,
            dataPropType: util_1.Type.Num
          }, valid);
          gen.if((0, codegen_1.not)(valid), notValid);
        });
      }
    }
    exports.validateArray = validateArray;
    function validateUnion(cxt) {
      const { gen, schema, keyword, it } = cxt;
      if (!Array.isArray(schema))
        throw new Error("ajv implementation error");
      const alwaysValid = schema.some((sch) => (0, util_1.alwaysValidSchema)(it, sch));
      if (alwaysValid && !it.opts.unevaluated)
        return;
      const valid = gen.let("valid", false);
      const schValid = gen.name("_valid");
      gen.block(() => schema.forEach((_sch, i) => {
        const schCxt = cxt.subschema({
          keyword,
          schemaProp: i,
          compositeRule: true
        }, schValid);
        gen.assign(valid, (0, codegen_1._)`${valid} || ${schValid}`);
        const merged = cxt.mergeValidEvaluated(schCxt, schValid);
        if (!merged)
          gen.if((0, codegen_1.not)(valid));
      }));
      cxt.result(valid, () => cxt.reset(), () => cxt.error(true));
    }
    exports.validateUnion = validateUnion;
  }
});

// node_modules/ajv/dist/compile/validate/keyword.js
var require_keyword = __commonJS({
  "node_modules/ajv/dist/compile/validate/keyword.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.validateKeywordUsage = exports.validSchemaType = exports.funcKeywordCode = exports.macroKeywordCode = void 0;
    var codegen_1 = require_codegen();
    var names_1 = require_names();
    var code_1 = require_code2();
    var errors_1 = require_errors();
    function macroKeywordCode(cxt, def) {
      const { gen, keyword, schema, parentSchema, it } = cxt;
      const macroSchema = def.macro.call(it.self, schema, parentSchema, it);
      const schemaRef = useKeyword(gen, keyword, macroSchema);
      if (it.opts.validateSchema !== false)
        it.self.validateSchema(macroSchema, true);
      const valid = gen.name("valid");
      cxt.subschema({
        schema: macroSchema,
        schemaPath: codegen_1.nil,
        errSchemaPath: `${it.errSchemaPath}/${keyword}`,
        topSchemaRef: schemaRef,
        compositeRule: true
      }, valid);
      cxt.pass(valid, () => cxt.error(true));
    }
    exports.macroKeywordCode = macroKeywordCode;
    function funcKeywordCode(cxt, def) {
      var _a;
      const { gen, keyword, schema, parentSchema, $data, it } = cxt;
      checkAsyncKeyword(it, def);
      const validate = !$data && def.compile ? def.compile.call(it.self, schema, parentSchema, it) : def.validate;
      const validateRef = useKeyword(gen, keyword, validate);
      const valid = gen.let("valid");
      cxt.block$data(valid, validateKeyword);
      cxt.ok((_a = def.valid) !== null && _a !== void 0 ? _a : valid);
      function validateKeyword() {
        if (def.errors === false) {
          assignValid();
          if (def.modifying)
            modifyData(cxt);
          reportErrs(() => cxt.error());
        } else {
          const ruleErrs = def.async ? validateAsync() : validateSync();
          if (def.modifying)
            modifyData(cxt);
          reportErrs(() => addErrs(cxt, ruleErrs));
        }
      }
      function validateAsync() {
        const ruleErrs = gen.let("ruleErrs", null);
        gen.try(() => assignValid((0, codegen_1._)`await `), (e) => gen.assign(valid, false).if((0, codegen_1._)`${e} instanceof ${it.ValidationError}`, () => gen.assign(ruleErrs, (0, codegen_1._)`${e}.errors`), () => gen.throw(e)));
        return ruleErrs;
      }
      function validateSync() {
        const validateErrs = (0, codegen_1._)`${validateRef}.errors`;
        gen.assign(validateErrs, null);
        assignValid(codegen_1.nil);
        return validateErrs;
      }
      function assignValid(_await = def.async ? (0, codegen_1._)`await ` : codegen_1.nil) {
        const passCxt = it.opts.passContext ? names_1.default.this : names_1.default.self;
        const passSchema = !("compile" in def && !$data || def.schema === false);
        gen.assign(valid, (0, codegen_1._)`${_await}${(0, code_1.callValidateCode)(cxt, validateRef, passCxt, passSchema)}`, def.modifying);
      }
      function reportErrs(errors) {
        var _a2;
        gen.if((0, codegen_1.not)((_a2 = def.valid) !== null && _a2 !== void 0 ? _a2 : valid), errors);
      }
    }
    exports.funcKeywordCode = funcKeywordCode;
    function modifyData(cxt) {
      const { gen, data, it } = cxt;
      gen.if(it.parentData, () => gen.assign(data, (0, codegen_1._)`${it.parentData}[${it.parentDataProperty}]`));
    }
    function addErrs(cxt, errs) {
      const { gen } = cxt;
      gen.if((0, codegen_1._)`Array.isArray(${errs})`, () => {
        gen.assign(names_1.default.vErrors, (0, codegen_1._)`${names_1.default.vErrors} === null ? ${errs} : ${names_1.default.vErrors}.concat(${errs})`).assign(names_1.default.errors, (0, codegen_1._)`${names_1.default.vErrors}.length`);
        (0, errors_1.extendErrors)(cxt);
      }, () => cxt.error());
    }
    function checkAsyncKeyword({ schemaEnv }, def) {
      if (def.async && !schemaEnv.$async)
        throw new Error("async keyword in sync schema");
    }
    function useKeyword(gen, keyword, result) {
      if (result === void 0)
        throw new Error(`keyword "${keyword}" failed to compile`);
      return gen.scopeValue("keyword", typeof result == "function" ? { ref: result } : { ref: result, code: (0, codegen_1.stringify)(result) });
    }
    function validSchemaType(schema, schemaType, allowUndefined = false) {
      return !schemaType.length || schemaType.some((st) => st === "array" ? Array.isArray(schema) : st === "object" ? schema && typeof schema == "object" && !Array.isArray(schema) : typeof schema == st || allowUndefined && typeof schema == "undefined");
    }
    exports.validSchemaType = validSchemaType;
    function validateKeywordUsage({ schema, opts, self: self2, errSchemaPath }, def, keyword) {
      if (Array.isArray(def.keyword) ? !def.keyword.includes(keyword) : def.keyword !== keyword) {
        throw new Error("ajv implementation error");
      }
      const deps = def.dependencies;
      if (deps === null || deps === void 0 ? void 0 : deps.some((kwd) => !Object.prototype.hasOwnProperty.call(schema, kwd))) {
        throw new Error(`parent schema must have dependencies of ${keyword}: ${deps.join(",")}`);
      }
      if (def.validateSchema) {
        const valid = def.validateSchema(schema[keyword]);
        if (!valid) {
          const msg = `keyword "${keyword}" value is invalid at path "${errSchemaPath}": ` + self2.errorsText(def.validateSchema.errors);
          if (opts.validateSchema === "log")
            self2.logger.error(msg);
          else
            throw new Error(msg);
        }
      }
    }
    exports.validateKeywordUsage = validateKeywordUsage;
  }
});

// node_modules/ajv/dist/compile/validate/subschema.js
var require_subschema = __commonJS({
  "node_modules/ajv/dist/compile/validate/subschema.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.extendSubschemaMode = exports.extendSubschemaData = exports.getSubschema = void 0;
    var codegen_1 = require_codegen();
    var util_1 = require_util();
    function getSubschema(it, { keyword, schemaProp, schema, schemaPath, errSchemaPath, topSchemaRef }) {
      if (keyword !== void 0 && schema !== void 0) {
        throw new Error('both "keyword" and "schema" passed, only one allowed');
      }
      if (keyword !== void 0) {
        const sch = it.schema[keyword];
        return schemaProp === void 0 ? {
          schema: sch,
          schemaPath: (0, codegen_1._)`${it.schemaPath}${(0, codegen_1.getProperty)(keyword)}`,
          errSchemaPath: `${it.errSchemaPath}/${keyword}`
        } : {
          schema: sch[schemaProp],
          schemaPath: (0, codegen_1._)`${it.schemaPath}${(0, codegen_1.getProperty)(keyword)}${(0, codegen_1.getProperty)(schemaProp)}`,
          errSchemaPath: `${it.errSchemaPath}/${keyword}/${(0, util_1.escapeFragment)(schemaProp)}`
        };
      }
      if (schema !== void 0) {
        if (schemaPath === void 0 || errSchemaPath === void 0 || topSchemaRef === void 0) {
          throw new Error('"schemaPath", "errSchemaPath" and "topSchemaRef" are required with "schema"');
        }
        return {
          schema,
          schemaPath,
          topSchemaRef,
          errSchemaPath
        };
      }
      throw new Error('either "keyword" or "schema" must be passed');
    }
    exports.getSubschema = getSubschema;
    function extendSubschemaData(subschema, it, { dataProp, dataPropType: dpType, data, dataTypes, propertyName }) {
      if (data !== void 0 && dataProp !== void 0) {
        throw new Error('both "data" and "dataProp" passed, only one allowed');
      }
      const { gen } = it;
      if (dataProp !== void 0) {
        const { errorPath, dataPathArr, opts } = it;
        const nextData = gen.let("data", (0, codegen_1._)`${it.data}${(0, codegen_1.getProperty)(dataProp)}`, true);
        dataContextProps(nextData);
        subschema.errorPath = (0, codegen_1.str)`${errorPath}${(0, util_1.getErrorPath)(dataProp, dpType, opts.jsPropertySyntax)}`;
        subschema.parentDataProperty = (0, codegen_1._)`${dataProp}`;
        subschema.dataPathArr = [...dataPathArr, subschema.parentDataProperty];
      }
      if (data !== void 0) {
        const nextData = data instanceof codegen_1.Name ? data : gen.let("data", data, true);
        dataContextProps(nextData);
        if (propertyName !== void 0)
          subschema.propertyName = propertyName;
      }
      if (dataTypes)
        subschema.dataTypes = dataTypes;
      function dataContextProps(_nextData) {
        subschema.data = _nextData;
        subschema.dataLevel = it.dataLevel + 1;
        subschema.dataTypes = [];
        it.definedProperties = /* @__PURE__ */ new Set();
        subschema.parentData = it.data;
        subschema.dataNames = [...it.dataNames, _nextData];
      }
    }
    exports.extendSubschemaData = extendSubschemaData;
    function extendSubschemaMode(subschema, { jtdDiscriminator, jtdMetadata, compositeRule, createErrors, allErrors }) {
      if (compositeRule !== void 0)
        subschema.compositeRule = compositeRule;
      if (createErrors !== void 0)
        subschema.createErrors = createErrors;
      if (allErrors !== void 0)
        subschema.allErrors = allErrors;
      subschema.jtdDiscriminator = jtdDiscriminator;
      subschema.jtdMetadata = jtdMetadata;
    }
    exports.extendSubschemaMode = extendSubschemaMode;
  }
});

// node_modules/fast-deep-equal/index.js
var require_fast_deep_equal = __commonJS({
  "node_modules/fast-deep-equal/index.js"(exports, module) {
    "use strict";
    module.exports = function equal(a, b) {
      if (a === b) return true;
      if (a && b && typeof a == "object" && typeof b == "object") {
        if (a.constructor !== b.constructor) return false;
        var length, i, keys;
        if (Array.isArray(a)) {
          length = a.length;
          if (length != b.length) return false;
          for (i = length; i-- !== 0; )
            if (!equal(a[i], b[i])) return false;
          return true;
        }
        if (a.constructor === RegExp) return a.source === b.source && a.flags === b.flags;
        if (a.valueOf !== Object.prototype.valueOf) return a.valueOf() === b.valueOf();
        if (a.toString !== Object.prototype.toString) return a.toString() === b.toString();
        keys = Object.keys(a);
        length = keys.length;
        if (length !== Object.keys(b).length) return false;
        for (i = length; i-- !== 0; )
          if (!Object.prototype.hasOwnProperty.call(b, keys[i])) return false;
        for (i = length; i-- !== 0; ) {
          var key = keys[i];
          if (!equal(a[key], b[key])) return false;
        }
        return true;
      }
      return a !== a && b !== b;
    };
  }
});

// node_modules/json-schema-traverse/index.js
var require_json_schema_traverse = __commonJS({
  "node_modules/json-schema-traverse/index.js"(exports, module) {
    "use strict";
    var traverse = module.exports = function(schema, opts, cb) {
      if (typeof opts == "function") {
        cb = opts;
        opts = {};
      }
      cb = opts.cb || cb;
      var pre = typeof cb == "function" ? cb : cb.pre || function() {
      };
      var post = cb.post || function() {
      };
      _traverse(opts, pre, post, schema, "", schema);
    };
    traverse.keywords = {
      additionalItems: true,
      items: true,
      contains: true,
      additionalProperties: true,
      propertyNames: true,
      not: true,
      if: true,
      then: true,
      else: true
    };
    traverse.arrayKeywords = {
      items: true,
      allOf: true,
      anyOf: true,
      oneOf: true
    };
    traverse.propsKeywords = {
      $defs: true,
      definitions: true,
      properties: true,
      patternProperties: true,
      dependencies: true
    };
    traverse.skipKeywords = {
      default: true,
      enum: true,
      const: true,
      required: true,
      maximum: true,
      minimum: true,
      exclusiveMaximum: true,
      exclusiveMinimum: true,
      multipleOf: true,
      maxLength: true,
      minLength: true,
      pattern: true,
      format: true,
      maxItems: true,
      minItems: true,
      uniqueItems: true,
      maxProperties: true,
      minProperties: true
    };
    function _traverse(opts, pre, post, schema, jsonPtr, rootSchema, parentJsonPtr, parentKeyword, parentSchema, keyIndex) {
      if (schema && typeof schema == "object" && !Array.isArray(schema)) {
        pre(schema, jsonPtr, rootSchema, parentJsonPtr, parentKeyword, parentSchema, keyIndex);
        for (var key in schema) {
          var sch = schema[key];
          if (Array.isArray(sch)) {
            if (key in traverse.arrayKeywords) {
              for (var i = 0; i < sch.length; i++)
                _traverse(opts, pre, post, sch[i], jsonPtr + "/" + key + "/" + i, rootSchema, jsonPtr, key, schema, i);
            }
          } else if (key in traverse.propsKeywords) {
            if (sch && typeof sch == "object") {
              for (var prop in sch)
                _traverse(opts, pre, post, sch[prop], jsonPtr + "/" + key + "/" + escapeJsonPtr(prop), rootSchema, jsonPtr, key, schema, prop);
            }
          } else if (key in traverse.keywords || opts.allKeys && !(key in traverse.skipKeywords)) {
            _traverse(opts, pre, post, sch, jsonPtr + "/" + key, rootSchema, jsonPtr, key, schema);
          }
        }
        post(schema, jsonPtr, rootSchema, parentJsonPtr, parentKeyword, parentSchema, keyIndex);
      }
    }
    function escapeJsonPtr(str) {
      return str.replace(/~/g, "~0").replace(/\//g, "~1");
    }
  }
});

// node_modules/ajv/dist/compile/resolve.js
var require_resolve = __commonJS({
  "node_modules/ajv/dist/compile/resolve.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.getSchemaRefs = exports.resolveUrl = exports.normalizeId = exports._getFullPath = exports.getFullPath = exports.inlineRef = void 0;
    var util_1 = require_util();
    var equal = require_fast_deep_equal();
    var traverse = require_json_schema_traverse();
    var SIMPLE_INLINED = /* @__PURE__ */ new Set([
      "type",
      "format",
      "pattern",
      "maxLength",
      "minLength",
      "maxProperties",
      "minProperties",
      "maxItems",
      "minItems",
      "maximum",
      "minimum",
      "uniqueItems",
      "multipleOf",
      "required",
      "enum",
      "const"
    ]);
    function inlineRef(schema, limit = true) {
      if (typeof schema == "boolean")
        return true;
      if (limit === true)
        return !hasRef(schema);
      if (!limit)
        return false;
      return countKeys(schema) <= limit;
    }
    exports.inlineRef = inlineRef;
    var REF_KEYWORDS = /* @__PURE__ */ new Set([
      "$ref",
      "$recursiveRef",
      "$recursiveAnchor",
      "$dynamicRef",
      "$dynamicAnchor"
    ]);
    function hasRef(schema) {
      for (const key in schema) {
        if (REF_KEYWORDS.has(key))
          return true;
        const sch = schema[key];
        if (Array.isArray(sch) && sch.some(hasRef))
          return true;
        if (typeof sch == "object" && hasRef(sch))
          return true;
      }
      return false;
    }
    function countKeys(schema) {
      let count = 0;
      for (const key in schema) {
        if (key === "$ref")
          return Infinity;
        count++;
        if (SIMPLE_INLINED.has(key))
          continue;
        if (typeof schema[key] == "object") {
          (0, util_1.eachItem)(schema[key], (sch) => count += countKeys(sch));
        }
        if (count === Infinity)
          return Infinity;
      }
      return count;
    }
    function getFullPath(resolver, id = "", normalize) {
      if (normalize !== false)
        id = normalizeId(id);
      const p = resolver.parse(id);
      return _getFullPath(resolver, p);
    }
    exports.getFullPath = getFullPath;
    function _getFullPath(resolver, p) {
      const serialized = resolver.serialize(p);
      return serialized.split("#")[0] + "#";
    }
    exports._getFullPath = _getFullPath;
    var TRAILING_SLASH_HASH = /#\/?$/;
    function normalizeId(id) {
      return id ? id.replace(TRAILING_SLASH_HASH, "") : "";
    }
    exports.normalizeId = normalizeId;
    function resolveUrl(resolver, baseId, id) {
      id = normalizeId(id);
      return resolver.resolve(baseId, id);
    }
    exports.resolveUrl = resolveUrl;
    var ANCHOR = /^[a-z_][-a-z0-9._]*$/i;
    function getSchemaRefs(schema, baseId) {
      if (typeof schema == "boolean")
        return {};
      const { schemaId, uriResolver } = this.opts;
      const schId = normalizeId(schema[schemaId] || baseId);
      const baseIds = { "": schId };
      const pathPrefix = getFullPath(uriResolver, schId, false);
      const localRefs = {};
      const schemaRefs = /* @__PURE__ */ new Set();
      traverse(schema, { allKeys: true }, (sch, jsonPtr, _, parentJsonPtr) => {
        if (parentJsonPtr === void 0)
          return;
        const fullPath = pathPrefix + jsonPtr;
        let innerBaseId = baseIds[parentJsonPtr];
        if (typeof sch[schemaId] == "string")
          innerBaseId = addRef.call(this, sch[schemaId]);
        addAnchor.call(this, sch.$anchor);
        addAnchor.call(this, sch.$dynamicAnchor);
        baseIds[jsonPtr] = innerBaseId;
        function addRef(ref) {
          const _resolve = this.opts.uriResolver.resolve;
          ref = normalizeId(innerBaseId ? _resolve(innerBaseId, ref) : ref);
          if (schemaRefs.has(ref))
            throw ambiguos(ref);
          schemaRefs.add(ref);
          let schOrRef = this.refs[ref];
          if (typeof schOrRef == "string")
            schOrRef = this.refs[schOrRef];
          if (typeof schOrRef == "object") {
            checkAmbiguosRef(sch, schOrRef.schema, ref);
          } else if (ref !== normalizeId(fullPath)) {
            if (ref[0] === "#") {
              checkAmbiguosRef(sch, localRefs[ref], ref);
              localRefs[ref] = sch;
            } else {
              this.refs[ref] = fullPath;
            }
          }
          return ref;
        }
        function addAnchor(anchor) {
          if (typeof anchor == "string") {
            if (!ANCHOR.test(anchor))
              throw new Error(`invalid anchor "${anchor}"`);
            addRef.call(this, `#${anchor}`);
          }
        }
      });
      return localRefs;
      function checkAmbiguosRef(sch1, sch2, ref) {
        if (sch2 !== void 0 && !equal(sch1, sch2))
          throw ambiguos(ref);
      }
      function ambiguos(ref) {
        return new Error(`reference "${ref}" resolves to more than one schema`);
      }
    }
    exports.getSchemaRefs = getSchemaRefs;
  }
});

// node_modules/ajv/dist/compile/validate/index.js
var require_validate = __commonJS({
  "node_modules/ajv/dist/compile/validate/index.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.getData = exports.KeywordCxt = exports.validateFunctionCode = void 0;
    var boolSchema_1 = require_boolSchema();
    var dataType_1 = require_dataType();
    var applicability_1 = require_applicability();
    var dataType_2 = require_dataType();
    var defaults_1 = require_defaults();
    var keyword_1 = require_keyword();
    var subschema_1 = require_subschema();
    var codegen_1 = require_codegen();
    var names_1 = require_names();
    var resolve_1 = require_resolve();
    var util_1 = require_util();
    var errors_1 = require_errors();
    function validateFunctionCode(it) {
      if (isSchemaObj(it)) {
        checkKeywords(it);
        if (schemaCxtHasRules(it)) {
          topSchemaObjCode(it);
          return;
        }
      }
      validateFunction(it, () => (0, boolSchema_1.topBoolOrEmptySchema)(it));
    }
    exports.validateFunctionCode = validateFunctionCode;
    function validateFunction({ gen, validateName, schema, schemaEnv, opts }, body) {
      if (opts.code.es5) {
        gen.func(validateName, (0, codegen_1._)`${names_1.default.data}, ${names_1.default.valCxt}`, schemaEnv.$async, () => {
          gen.code((0, codegen_1._)`"use strict"; ${funcSourceUrl(schema, opts)}`);
          destructureValCxtES5(gen, opts);
          gen.code(body);
        });
      } else {
        gen.func(validateName, (0, codegen_1._)`${names_1.default.data}, ${destructureValCxt(opts)}`, schemaEnv.$async, () => gen.code(funcSourceUrl(schema, opts)).code(body));
      }
    }
    function destructureValCxt(opts) {
      return (0, codegen_1._)`{${names_1.default.instancePath}="", ${names_1.default.parentData}, ${names_1.default.parentDataProperty}, ${names_1.default.rootData}=${names_1.default.data}${opts.dynamicRef ? (0, codegen_1._)`, ${names_1.default.dynamicAnchors}={}` : codegen_1.nil}}={}`;
    }
    function destructureValCxtES5(gen, opts) {
      gen.if(names_1.default.valCxt, () => {
        gen.var(names_1.default.instancePath, (0, codegen_1._)`${names_1.default.valCxt}.${names_1.default.instancePath}`);
        gen.var(names_1.default.parentData, (0, codegen_1._)`${names_1.default.valCxt}.${names_1.default.parentData}`);
        gen.var(names_1.default.parentDataProperty, (0, codegen_1._)`${names_1.default.valCxt}.${names_1.default.parentDataProperty}`);
        gen.var(names_1.default.rootData, (0, codegen_1._)`${names_1.default.valCxt}.${names_1.default.rootData}`);
        if (opts.dynamicRef)
          gen.var(names_1.default.dynamicAnchors, (0, codegen_1._)`${names_1.default.valCxt}.${names_1.default.dynamicAnchors}`);
      }, () => {
        gen.var(names_1.default.instancePath, (0, codegen_1._)`""`);
        gen.var(names_1.default.parentData, (0, codegen_1._)`undefined`);
        gen.var(names_1.default.parentDataProperty, (0, codegen_1._)`undefined`);
        gen.var(names_1.default.rootData, names_1.default.data);
        if (opts.dynamicRef)
          gen.var(names_1.default.dynamicAnchors, (0, codegen_1._)`{}`);
      });
    }
    function topSchemaObjCode(it) {
      const { schema, opts, gen } = it;
      validateFunction(it, () => {
        if (opts.$comment && schema.$comment)
          commentKeyword(it);
        checkNoDefault(it);
        gen.let(names_1.default.vErrors, null);
        gen.let(names_1.default.errors, 0);
        if (opts.unevaluated)
          resetEvaluated(it);
        typeAndKeywords(it);
        returnResults(it);
      });
      return;
    }
    function resetEvaluated(it) {
      const { gen, validateName } = it;
      it.evaluated = gen.const("evaluated", (0, codegen_1._)`${validateName}.evaluated`);
      gen.if((0, codegen_1._)`${it.evaluated}.dynamicProps`, () => gen.assign((0, codegen_1._)`${it.evaluated}.props`, (0, codegen_1._)`undefined`));
      gen.if((0, codegen_1._)`${it.evaluated}.dynamicItems`, () => gen.assign((0, codegen_1._)`${it.evaluated}.items`, (0, codegen_1._)`undefined`));
    }
    function funcSourceUrl(schema, opts) {
      const schId = typeof schema == "object" && schema[opts.schemaId];
      return schId && (opts.code.source || opts.code.process) ? (0, codegen_1._)`/*# sourceURL=${schId} */` : codegen_1.nil;
    }
    function subschemaCode(it, valid) {
      if (isSchemaObj(it)) {
        checkKeywords(it);
        if (schemaCxtHasRules(it)) {
          subSchemaObjCode(it, valid);
          return;
        }
      }
      (0, boolSchema_1.boolOrEmptySchema)(it, valid);
    }
    function schemaCxtHasRules({ schema, self: self2 }) {
      if (typeof schema == "boolean")
        return !schema;
      for (const key in schema)
        if (self2.RULES.all[key])
          return true;
      return false;
    }
    function isSchemaObj(it) {
      return typeof it.schema != "boolean";
    }
    function subSchemaObjCode(it, valid) {
      const { schema, gen, opts } = it;
      if (opts.$comment && schema.$comment)
        commentKeyword(it);
      updateContext(it);
      checkAsyncSchema(it);
      const errsCount = gen.const("_errs", names_1.default.errors);
      typeAndKeywords(it, errsCount);
      gen.var(valid, (0, codegen_1._)`${errsCount} === ${names_1.default.errors}`);
    }
    function checkKeywords(it) {
      (0, util_1.checkUnknownRules)(it);
      checkRefsAndKeywords(it);
    }
    function typeAndKeywords(it, errsCount) {
      if (it.opts.jtd)
        return schemaKeywords(it, [], false, errsCount);
      const types = (0, dataType_1.getSchemaTypes)(it.schema);
      const checkedTypes = (0, dataType_1.coerceAndCheckDataType)(it, types);
      schemaKeywords(it, types, !checkedTypes, errsCount);
    }
    function checkRefsAndKeywords(it) {
      const { schema, errSchemaPath, opts, self: self2 } = it;
      if (schema.$ref && opts.ignoreKeywordsWithRef && (0, util_1.schemaHasRulesButRef)(schema, self2.RULES)) {
        self2.logger.warn(`$ref: keywords ignored in schema at path "${errSchemaPath}"`);
      }
    }
    function checkNoDefault(it) {
      const { schema, opts } = it;
      if (schema.default !== void 0 && opts.useDefaults && opts.strictSchema) {
        (0, util_1.checkStrictMode)(it, "default is ignored in the schema root");
      }
    }
    function updateContext(it) {
      const schId = it.schema[it.opts.schemaId];
      if (schId)
        it.baseId = (0, resolve_1.resolveUrl)(it.opts.uriResolver, it.baseId, schId);
    }
    function checkAsyncSchema(it) {
      if (it.schema.$async && !it.schemaEnv.$async)
        throw new Error("async schema in sync schema");
    }
    function commentKeyword({ gen, schemaEnv, schema, errSchemaPath, opts }) {
      const msg = schema.$comment;
      if (opts.$comment === true) {
        gen.code((0, codegen_1._)`${names_1.default.self}.logger.log(${msg})`);
      } else if (typeof opts.$comment == "function") {
        const schemaPath = (0, codegen_1.str)`${errSchemaPath}/$comment`;
        const rootName = gen.scopeValue("root", { ref: schemaEnv.root });
        gen.code((0, codegen_1._)`${names_1.default.self}.opts.$comment(${msg}, ${schemaPath}, ${rootName}.schema)`);
      }
    }
    function returnResults(it) {
      const { gen, schemaEnv, validateName, ValidationError, opts } = it;
      if (schemaEnv.$async) {
        gen.if((0, codegen_1._)`${names_1.default.errors} === 0`, () => gen.return(names_1.default.data), () => gen.throw((0, codegen_1._)`new ${ValidationError}(${names_1.default.vErrors})`));
      } else {
        gen.assign((0, codegen_1._)`${validateName}.errors`, names_1.default.vErrors);
        if (opts.unevaluated)
          assignEvaluated(it);
        gen.return((0, codegen_1._)`${names_1.default.errors} === 0`);
      }
    }
    function assignEvaluated({ gen, evaluated, props, items }) {
      if (props instanceof codegen_1.Name)
        gen.assign((0, codegen_1._)`${evaluated}.props`, props);
      if (items instanceof codegen_1.Name)
        gen.assign((0, codegen_1._)`${evaluated}.items`, items);
    }
    function schemaKeywords(it, types, typeErrors, errsCount) {
      const { gen, schema, data, allErrors, opts, self: self2 } = it;
      const { RULES } = self2;
      if (schema.$ref && (opts.ignoreKeywordsWithRef || !(0, util_1.schemaHasRulesButRef)(schema, RULES))) {
        gen.block(() => keywordCode(it, "$ref", RULES.all.$ref.definition));
        return;
      }
      if (!opts.jtd)
        checkStrictTypes(it, types);
      gen.block(() => {
        for (const group of RULES.rules)
          groupKeywords(group);
        groupKeywords(RULES.post);
      });
      function groupKeywords(group) {
        if (!(0, applicability_1.shouldUseGroup)(schema, group))
          return;
        if (group.type) {
          gen.if((0, dataType_2.checkDataType)(group.type, data, opts.strictNumbers));
          iterateKeywords(it, group);
          if (types.length === 1 && types[0] === group.type && typeErrors) {
            gen.else();
            (0, dataType_2.reportTypeError)(it);
          }
          gen.endIf();
        } else {
          iterateKeywords(it, group);
        }
        if (!allErrors)
          gen.if((0, codegen_1._)`${names_1.default.errors} === ${errsCount || 0}`);
      }
    }
    function iterateKeywords(it, group) {
      const { gen, schema, opts: { useDefaults } } = it;
      if (useDefaults)
        (0, defaults_1.assignDefaults)(it, group.type);
      gen.block(() => {
        for (const rule of group.rules) {
          if ((0, applicability_1.shouldUseRule)(schema, rule)) {
            keywordCode(it, rule.keyword, rule.definition, group.type);
          }
        }
      });
    }
    function checkStrictTypes(it, types) {
      if (it.schemaEnv.meta || !it.opts.strictTypes)
        return;
      checkContextTypes(it, types);
      if (!it.opts.allowUnionTypes)
        checkMultipleTypes(it, types);
      checkKeywordTypes(it, it.dataTypes);
    }
    function checkContextTypes(it, types) {
      if (!types.length)
        return;
      if (!it.dataTypes.length) {
        it.dataTypes = types;
        return;
      }
      types.forEach((t) => {
        if (!includesType(it.dataTypes, t)) {
          strictTypesError(it, `type "${t}" not allowed by context "${it.dataTypes.join(",")}"`);
        }
      });
      narrowSchemaTypes(it, types);
    }
    function checkMultipleTypes(it, ts) {
      if (ts.length > 1 && !(ts.length === 2 && ts.includes("null"))) {
        strictTypesError(it, "use allowUnionTypes to allow union type keyword");
      }
    }
    function checkKeywordTypes(it, ts) {
      const rules = it.self.RULES.all;
      for (const keyword in rules) {
        const rule = rules[keyword];
        if (typeof rule == "object" && (0, applicability_1.shouldUseRule)(it.schema, rule)) {
          const { type } = rule.definition;
          if (type.length && !type.some((t) => hasApplicableType(ts, t))) {
            strictTypesError(it, `missing type "${type.join(",")}" for keyword "${keyword}"`);
          }
        }
      }
    }
    function hasApplicableType(schTs, kwdT) {
      return schTs.includes(kwdT) || kwdT === "number" && schTs.includes("integer");
    }
    function includesType(ts, t) {
      return ts.includes(t) || t === "integer" && ts.includes("number");
    }
    function narrowSchemaTypes(it, withTypes) {
      const ts = [];
      for (const t of it.dataTypes) {
        if (includesType(withTypes, t))
          ts.push(t);
        else if (withTypes.includes("integer") && t === "number")
          ts.push("integer");
      }
      it.dataTypes = ts;
    }
    function strictTypesError(it, msg) {
      const schemaPath = it.schemaEnv.baseId + it.errSchemaPath;
      msg += ` at "${schemaPath}" (strictTypes)`;
      (0, util_1.checkStrictMode)(it, msg, it.opts.strictTypes);
    }
    var KeywordCxt = class {
      constructor(it, def, keyword) {
        (0, keyword_1.validateKeywordUsage)(it, def, keyword);
        this.gen = it.gen;
        this.allErrors = it.allErrors;
        this.keyword = keyword;
        this.data = it.data;
        this.schema = it.schema[keyword];
        this.$data = def.$data && it.opts.$data && this.schema && this.schema.$data;
        this.schemaValue = (0, util_1.schemaRefOrVal)(it, this.schema, keyword, this.$data);
        this.schemaType = def.schemaType;
        this.parentSchema = it.schema;
        this.params = {};
        this.it = it;
        this.def = def;
        if (this.$data) {
          this.schemaCode = it.gen.const("vSchema", getData(this.$data, it));
        } else {
          this.schemaCode = this.schemaValue;
          if (!(0, keyword_1.validSchemaType)(this.schema, def.schemaType, def.allowUndefined)) {
            throw new Error(`${keyword} value must be ${JSON.stringify(def.schemaType)}`);
          }
        }
        if ("code" in def ? def.trackErrors : def.errors !== false) {
          this.errsCount = it.gen.const("_errs", names_1.default.errors);
        }
      }
      result(condition, successAction, failAction) {
        this.failResult((0, codegen_1.not)(condition), successAction, failAction);
      }
      failResult(condition, successAction, failAction) {
        this.gen.if(condition);
        if (failAction)
          failAction();
        else
          this.error();
        if (successAction) {
          this.gen.else();
          successAction();
          if (this.allErrors)
            this.gen.endIf();
        } else {
          if (this.allErrors)
            this.gen.endIf();
          else
            this.gen.else();
        }
      }
      pass(condition, failAction) {
        this.failResult((0, codegen_1.not)(condition), void 0, failAction);
      }
      fail(condition) {
        if (condition === void 0) {
          this.error();
          if (!this.allErrors)
            this.gen.if(false);
          return;
        }
        this.gen.if(condition);
        this.error();
        if (this.allErrors)
          this.gen.endIf();
        else
          this.gen.else();
      }
      fail$data(condition) {
        if (!this.$data)
          return this.fail(condition);
        const { schemaCode } = this;
        this.fail((0, codegen_1._)`${schemaCode} !== undefined && (${(0, codegen_1.or)(this.invalid$data(), condition)})`);
      }
      error(append, errorParams, errorPaths) {
        if (errorParams) {
          this.setParams(errorParams);
          this._error(append, errorPaths);
          this.setParams({});
          return;
        }
        this._error(append, errorPaths);
      }
      _error(append, errorPaths) {
        ;
        (append ? errors_1.reportExtraError : errors_1.reportError)(this, this.def.error, errorPaths);
      }
      $dataError() {
        (0, errors_1.reportError)(this, this.def.$dataError || errors_1.keyword$DataError);
      }
      reset() {
        if (this.errsCount === void 0)
          throw new Error('add "trackErrors" to keyword definition');
        (0, errors_1.resetErrorsCount)(this.gen, this.errsCount);
      }
      ok(cond) {
        if (!this.allErrors)
          this.gen.if(cond);
      }
      setParams(obj, assign) {
        if (assign)
          Object.assign(this.params, obj);
        else
          this.params = obj;
      }
      block$data(valid, codeBlock, $dataValid = codegen_1.nil) {
        this.gen.block(() => {
          this.check$data(valid, $dataValid);
          codeBlock();
        });
      }
      check$data(valid = codegen_1.nil, $dataValid = codegen_1.nil) {
        if (!this.$data)
          return;
        const { gen, schemaCode, schemaType, def } = this;
        gen.if((0, codegen_1.or)((0, codegen_1._)`${schemaCode} === undefined`, $dataValid));
        if (valid !== codegen_1.nil)
          gen.assign(valid, true);
        if (schemaType.length || def.validateSchema) {
          gen.elseIf(this.invalid$data());
          this.$dataError();
          if (valid !== codegen_1.nil)
            gen.assign(valid, false);
        }
        gen.else();
      }
      invalid$data() {
        const { gen, schemaCode, schemaType, def, it } = this;
        return (0, codegen_1.or)(wrong$DataType(), invalid$DataSchema());
        function wrong$DataType() {
          if (schemaType.length) {
            if (!(schemaCode instanceof codegen_1.Name))
              throw new Error("ajv implementation error");
            const st = Array.isArray(schemaType) ? schemaType : [schemaType];
            return (0, codegen_1._)`${(0, dataType_2.checkDataTypes)(st, schemaCode, it.opts.strictNumbers, dataType_2.DataType.Wrong)}`;
          }
          return codegen_1.nil;
        }
        function invalid$DataSchema() {
          if (def.validateSchema) {
            const validateSchemaRef = gen.scopeValue("validate$data", { ref: def.validateSchema });
            return (0, codegen_1._)`!${validateSchemaRef}(${schemaCode})`;
          }
          return codegen_1.nil;
        }
      }
      subschema(appl, valid) {
        const subschema = (0, subschema_1.getSubschema)(this.it, appl);
        (0, subschema_1.extendSubschemaData)(subschema, this.it, appl);
        (0, subschema_1.extendSubschemaMode)(subschema, appl);
        const nextContext = { ...this.it, ...subschema, items: void 0, props: void 0 };
        subschemaCode(nextContext, valid);
        return nextContext;
      }
      mergeEvaluated(schemaCxt, toName) {
        const { it, gen } = this;
        if (!it.opts.unevaluated)
          return;
        if (it.props !== true && schemaCxt.props !== void 0) {
          it.props = util_1.mergeEvaluated.props(gen, schemaCxt.props, it.props, toName);
        }
        if (it.items !== true && schemaCxt.items !== void 0) {
          it.items = util_1.mergeEvaluated.items(gen, schemaCxt.items, it.items, toName);
        }
      }
      mergeValidEvaluated(schemaCxt, valid) {
        const { it, gen } = this;
        if (it.opts.unevaluated && (it.props !== true || it.items !== true)) {
          gen.if(valid, () => this.mergeEvaluated(schemaCxt, codegen_1.Name));
          return true;
        }
      }
    };
    exports.KeywordCxt = KeywordCxt;
    function keywordCode(it, keyword, def, ruleType) {
      const cxt = new KeywordCxt(it, def, keyword);
      if ("code" in def) {
        def.code(cxt, ruleType);
      } else if (cxt.$data && def.validate) {
        (0, keyword_1.funcKeywordCode)(cxt, def);
      } else if ("macro" in def) {
        (0, keyword_1.macroKeywordCode)(cxt, def);
      } else if (def.compile || def.validate) {
        (0, keyword_1.funcKeywordCode)(cxt, def);
      }
    }
    var JSON_POINTER = /^\/(?:[^~]|~0|~1)*$/;
    var RELATIVE_JSON_POINTER = /^([0-9]+)(#|\/(?:[^~]|~0|~1)*)?$/;
    function getData($data, { dataLevel, dataNames, dataPathArr }) {
      let jsonPointer;
      let data;
      if ($data === "")
        return names_1.default.rootData;
      if ($data[0] === "/") {
        if (!JSON_POINTER.test($data))
          throw new Error(`Invalid JSON-pointer: ${$data}`);
        jsonPointer = $data;
        data = names_1.default.rootData;
      } else {
        const matches = RELATIVE_JSON_POINTER.exec($data);
        if (!matches)
          throw new Error(`Invalid JSON-pointer: ${$data}`);
        const up = +matches[1];
        jsonPointer = matches[2];
        if (jsonPointer === "#") {
          if (up >= dataLevel)
            throw new Error(errorMsg("property/index", up));
          return dataPathArr[dataLevel - up];
        }
        if (up > dataLevel)
          throw new Error(errorMsg("data", up));
        data = dataNames[dataLevel - up];
        if (!jsonPointer)
          return data;
      }
      let expr = data;
      const segments = jsonPointer.split("/");
      for (const segment of segments) {
        if (segment) {
          data = (0, codegen_1._)`${data}${(0, codegen_1.getProperty)((0, util_1.unescapeJsonPointer)(segment))}`;
          expr = (0, codegen_1._)`${expr} && ${data}`;
        }
      }
      return expr;
      function errorMsg(pointerType, up) {
        return `Cannot access ${pointerType} ${up} levels up, current level is ${dataLevel}`;
      }
    }
    exports.getData = getData;
  }
});

// node_modules/ajv/dist/runtime/validation_error.js
var require_validation_error = __commonJS({
  "node_modules/ajv/dist/runtime/validation_error.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var ValidationError = class extends Error {
      constructor(errors) {
        super("validation failed");
        this.errors = errors;
        this.ajv = this.validation = true;
      }
    };
    exports.default = ValidationError;
  }
});

// node_modules/ajv/dist/compile/ref_error.js
var require_ref_error = __commonJS({
  "node_modules/ajv/dist/compile/ref_error.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var resolve_1 = require_resolve();
    var MissingRefError = class extends Error {
      constructor(resolver, baseId, ref, msg) {
        super(msg || `can't resolve reference ${ref} from id ${baseId}`);
        this.missingRef = (0, resolve_1.resolveUrl)(resolver, baseId, ref);
        this.missingSchema = (0, resolve_1.normalizeId)((0, resolve_1.getFullPath)(resolver, this.missingRef));
      }
    };
    exports.default = MissingRefError;
  }
});

// node_modules/ajv/dist/compile/index.js
var require_compile = __commonJS({
  "node_modules/ajv/dist/compile/index.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.resolveSchema = exports.getCompilingSchema = exports.resolveRef = exports.compileSchema = exports.SchemaEnv = void 0;
    var codegen_1 = require_codegen();
    var validation_error_1 = require_validation_error();
    var names_1 = require_names();
    var resolve_1 = require_resolve();
    var util_1 = require_util();
    var validate_1 = require_validate();
    var SchemaEnv = class {
      constructor(env) {
        var _a;
        this.refs = {};
        this.dynamicAnchors = {};
        let schema;
        if (typeof env.schema == "object")
          schema = env.schema;
        this.schema = env.schema;
        this.schemaId = env.schemaId;
        this.root = env.root || this;
        this.baseId = (_a = env.baseId) !== null && _a !== void 0 ? _a : (0, resolve_1.normalizeId)(schema === null || schema === void 0 ? void 0 : schema[env.schemaId || "$id"]);
        this.schemaPath = env.schemaPath;
        this.localRefs = env.localRefs;
        this.meta = env.meta;
        this.$async = schema === null || schema === void 0 ? void 0 : schema.$async;
        this.refs = {};
      }
    };
    exports.SchemaEnv = SchemaEnv;
    function compileSchema(sch) {
      const _sch = getCompilingSchema.call(this, sch);
      if (_sch)
        return _sch;
      const rootId = (0, resolve_1.getFullPath)(this.opts.uriResolver, sch.root.baseId);
      const { es5, lines } = this.opts.code;
      const { ownProperties } = this.opts;
      const gen = new codegen_1.CodeGen(this.scope, { es5, lines, ownProperties });
      let _ValidationError;
      if (sch.$async) {
        _ValidationError = gen.scopeValue("Error", {
          ref: validation_error_1.default,
          code: (0, codegen_1._)`require("ajv/dist/runtime/validation_error").default`
        });
      }
      const validateName = gen.scopeName("validate");
      sch.validateName = validateName;
      const schemaCxt = {
        gen,
        allErrors: this.opts.allErrors,
        data: names_1.default.data,
        parentData: names_1.default.parentData,
        parentDataProperty: names_1.default.parentDataProperty,
        dataNames: [names_1.default.data],
        dataPathArr: [codegen_1.nil],
        // TODO can its length be used as dataLevel if nil is removed?
        dataLevel: 0,
        dataTypes: [],
        definedProperties: /* @__PURE__ */ new Set(),
        topSchemaRef: gen.scopeValue("schema", this.opts.code.source === true ? { ref: sch.schema, code: (0, codegen_1.stringify)(sch.schema) } : { ref: sch.schema }),
        validateName,
        ValidationError: _ValidationError,
        schema: sch.schema,
        schemaEnv: sch,
        rootId,
        baseId: sch.baseId || rootId,
        schemaPath: codegen_1.nil,
        errSchemaPath: sch.schemaPath || (this.opts.jtd ? "" : "#"),
        errorPath: (0, codegen_1._)`""`,
        opts: this.opts,
        self: this
      };
      let sourceCode;
      try {
        this._compilations.add(sch);
        (0, validate_1.validateFunctionCode)(schemaCxt);
        gen.optimize(this.opts.code.optimize);
        const validateCode = gen.toString();
        sourceCode = `${gen.scopeRefs(names_1.default.scope)}return ${validateCode}`;
        if (this.opts.code.process)
          sourceCode = this.opts.code.process(sourceCode, sch);
        const makeValidate = new Function(`${names_1.default.self}`, `${names_1.default.scope}`, sourceCode);
        const validate = makeValidate(this, this.scope.get());
        this.scope.value(validateName, { ref: validate });
        validate.errors = null;
        validate.schema = sch.schema;
        validate.schemaEnv = sch;
        if (sch.$async)
          validate.$async = true;
        if (this.opts.code.source === true) {
          validate.source = { validateName, validateCode, scopeValues: gen._values };
        }
        if (this.opts.unevaluated) {
          const { props, items } = schemaCxt;
          validate.evaluated = {
            props: props instanceof codegen_1.Name ? void 0 : props,
            items: items instanceof codegen_1.Name ? void 0 : items,
            dynamicProps: props instanceof codegen_1.Name,
            dynamicItems: items instanceof codegen_1.Name
          };
          if (validate.source)
            validate.source.evaluated = (0, codegen_1.stringify)(validate.evaluated);
        }
        sch.validate = validate;
        return sch;
      } catch (e) {
        delete sch.validate;
        delete sch.validateName;
        if (sourceCode)
          this.logger.error("Error compiling schema, function code:", sourceCode);
        throw e;
      } finally {
        this._compilations.delete(sch);
      }
    }
    exports.compileSchema = compileSchema;
    function resolveRef(root, baseId, ref) {
      var _a;
      ref = (0, resolve_1.resolveUrl)(this.opts.uriResolver, baseId, ref);
      const schOrFunc = root.refs[ref];
      if (schOrFunc)
        return schOrFunc;
      let _sch = resolve.call(this, root, ref);
      if (_sch === void 0) {
        const schema = (_a = root.localRefs) === null || _a === void 0 ? void 0 : _a[ref];
        const { schemaId } = this.opts;
        if (schema)
          _sch = new SchemaEnv({ schema, schemaId, root, baseId });
      }
      if (_sch === void 0)
        return;
      return root.refs[ref] = inlineOrCompile.call(this, _sch);
    }
    exports.resolveRef = resolveRef;
    function inlineOrCompile(sch) {
      if ((0, resolve_1.inlineRef)(sch.schema, this.opts.inlineRefs))
        return sch.schema;
      return sch.validate ? sch : compileSchema.call(this, sch);
    }
    function getCompilingSchema(schEnv) {
      for (const sch of this._compilations) {
        if (sameSchemaEnv(sch, schEnv))
          return sch;
      }
    }
    exports.getCompilingSchema = getCompilingSchema;
    function sameSchemaEnv(s1, s2) {
      return s1.schema === s2.schema && s1.root === s2.root && s1.baseId === s2.baseId;
    }
    function resolve(root, ref) {
      let sch;
      while (typeof (sch = this.refs[ref]) == "string")
        ref = sch;
      return sch || this.schemas[ref] || resolveSchema.call(this, root, ref);
    }
    function resolveSchema(root, ref) {
      const p = this.opts.uriResolver.parse(ref);
      const refPath = (0, resolve_1._getFullPath)(this.opts.uriResolver, p);
      let baseId = (0, resolve_1.getFullPath)(this.opts.uriResolver, root.baseId, void 0);
      if (Object.keys(root.schema).length > 0 && refPath === baseId) {
        return getJsonPointer.call(this, p, root);
      }
      const id = (0, resolve_1.normalizeId)(refPath);
      const schOrRef = this.refs[id] || this.schemas[id];
      if (typeof schOrRef == "string") {
        const sch = resolveSchema.call(this, root, schOrRef);
        if (typeof (sch === null || sch === void 0 ? void 0 : sch.schema) !== "object")
          return;
        return getJsonPointer.call(this, p, sch);
      }
      if (typeof (schOrRef === null || schOrRef === void 0 ? void 0 : schOrRef.schema) !== "object")
        return;
      if (!schOrRef.validate)
        compileSchema.call(this, schOrRef);
      if (id === (0, resolve_1.normalizeId)(ref)) {
        const { schema } = schOrRef;
        const { schemaId } = this.opts;
        const schId = schema[schemaId];
        if (schId)
          baseId = (0, resolve_1.resolveUrl)(this.opts.uriResolver, baseId, schId);
        return new SchemaEnv({ schema, schemaId, root, baseId });
      }
      return getJsonPointer.call(this, p, schOrRef);
    }
    exports.resolveSchema = resolveSchema;
    var PREVENT_SCOPE_CHANGE = /* @__PURE__ */ new Set([
      "properties",
      "patternProperties",
      "enum",
      "dependencies",
      "definitions"
    ]);
    function getJsonPointer(parsedRef, { baseId, schema, root }) {
      var _a;
      if (((_a = parsedRef.fragment) === null || _a === void 0 ? void 0 : _a[0]) !== "/")
        return;
      for (const part of parsedRef.fragment.slice(1).split("/")) {
        if (typeof schema === "boolean")
          return;
        const partSchema = schema[(0, util_1.unescapeFragment)(part)];
        if (partSchema === void 0)
          return;
        schema = partSchema;
        const schId = typeof schema === "object" && schema[this.opts.schemaId];
        if (!PREVENT_SCOPE_CHANGE.has(part) && schId) {
          baseId = (0, resolve_1.resolveUrl)(this.opts.uriResolver, baseId, schId);
        }
      }
      let env;
      if (typeof schema != "boolean" && schema.$ref && !(0, util_1.schemaHasRulesButRef)(schema, this.RULES)) {
        const $ref = (0, resolve_1.resolveUrl)(this.opts.uriResolver, baseId, schema.$ref);
        env = resolveSchema.call(this, root, $ref);
      }
      const { schemaId } = this.opts;
      env = env || new SchemaEnv({ schema, schemaId, root, baseId });
      if (env.schema !== env.root.schema)
        return env;
      return void 0;
    }
  }
});

// node_modules/ajv/dist/refs/data.json
var require_data = __commonJS({
  "node_modules/ajv/dist/refs/data.json"(exports, module) {
    module.exports = {
      $id: "https://raw.githubusercontent.com/ajv-validator/ajv/master/lib/refs/data.json#",
      description: "Meta-schema for $data reference (JSON AnySchema extension proposal)",
      type: "object",
      required: ["$data"],
      properties: {
        $data: {
          type: "string",
          anyOf: [{ format: "relative-json-pointer" }, { format: "json-pointer" }]
        }
      },
      additionalProperties: false
    };
  }
});

// node_modules/fast-uri/lib/utils.js
var require_utils = __commonJS({
  "node_modules/fast-uri/lib/utils.js"(exports, module) {
    "use strict";
    var isUUID = RegExp.prototype.test.bind(/^[\da-f]{8}-[\da-f]{4}-[\da-f]{4}-[\da-f]{4}-[\da-f]{12}$/iu);
    var isIPv4 = RegExp.prototype.test.bind(/^(?:(?:25[0-5]|2[0-4]\d|1\d{2}|[1-9]\d|\d)\.){3}(?:25[0-5]|2[0-4]\d|1\d{2}|[1-9]\d|\d)$/u);
    var isPort = RegExp.prototype.test.bind(/^\d*$/u);
    var isHexPair = RegExp.prototype.test.bind(/^[\da-f]{2}$/iu);
    var isUnreserved = RegExp.prototype.test.bind(/^[\da-z\-._~]$/iu);
    var isPathCharacter = RegExp.prototype.test.bind(/^[A-Za-z0-9\-._~!$&'()*+,;=:@/]$/u);
    var isQueryFragmentCharacter = RegExp.prototype.test.bind(/^[A-Za-z0-9\-._~!$&'()*+,;=:@/?]$/u);
    var isUserinfoCharacter = RegExp.prototype.test.bind(/^[A-Za-z0-9\-._~!$&'()*+,;=:]$/u);
    var BYTE_HEX = new Array(256);
    {
      const HEX_DIGITS = "0123456789ABCDEF";
      for (let i = 0; i < 256; i++) {
        BYTE_HEX[i] = "%" + HEX_DIGITS[i >> 4] + HEX_DIGITS[i & 15];
      }
    }
    function percentEncodeNonAscii(cp) {
      if (cp < 2048) {
        return BYTE_HEX[192 | cp >> 6] + BYTE_HEX[128 | cp & 63];
      }
      if (cp < 65536) {
        return BYTE_HEX[224 | cp >> 12] + BYTE_HEX[128 | cp >> 6 & 63] + BYTE_HEX[128 | cp & 63];
      }
      return BYTE_HEX[240 | cp >> 18] + BYTE_HEX[128 | cp >> 12 & 63] + BYTE_HEX[128 | cp >> 6 & 63] + BYTE_HEX[128 | cp & 63];
    }
    function stringArrayToHexStripped(input) {
      let acc = "";
      let code = 0;
      let i = 0;
      for (i = 0; i < input.length; i++) {
        code = input[i].charCodeAt(0);
        if (code === 48) {
          continue;
        }
        if (!(code >= 48 && code <= 57 || code >= 65 && code <= 70 || code >= 97 && code <= 102)) {
          return "";
        }
        acc += input[i];
        break;
      }
      for (i += 1; i < input.length; i++) {
        code = input[i].charCodeAt(0);
        if (!(code >= 48 && code <= 57 || code >= 65 && code <= 70 || code >= 97 && code <= 102)) {
          return "";
        }
        acc += input[i];
      }
      return acc;
    }
    var isHextet = RegExp.prototype.test.bind(/^[\dA-Fa-f]{1,4}$/);
    var isIPvFuture = RegExp.prototype.test.bind(/^[vV][\dA-Fa-f]+\.[A-Za-z\d\-._~!$&'()*+,;=:]+$/);
    var isZoneCharacter = RegExp.prototype.test.bind(/^[A-Za-z\d\-._~]$/);
    var nonSimpleDomain = RegExp.prototype.test.bind(/[^!"$&'()*+,\-.;=_`a-z{}~]/u);
    function isZoneIdentifier(zone) {
      if (zone.length === 0) return false;
      for (let i = 0; i < zone.length; i++) {
        if (isZoneCharacter(zone[i])) continue;
        if (zone[i] === "%" && i + 2 < zone.length && isHexPair(zone.slice(i + 1, i + 3))) {
          i += 2;
          continue;
        }
        return false;
      }
      return true;
    }
    function compressIPv6ZeroRun(hextets) {
      let bestStart = -1;
      let bestLength = 0;
      let runStart = -1;
      let runLength = 0;
      for (let i = 0; i < hextets.length; i++) {
        if (hextets[i] === "0") {
          if (runStart === -1) runStart = i;
          runLength++;
          if (runLength > bestLength) {
            bestLength = runLength;
            bestStart = runStart;
          }
        } else {
          runStart = -1;
          runLength = 0;
        }
      }
      if (bestLength < 2) return hextets.join(":");
      const head = hextets.slice(0, bestStart).join(":");
      const tail = hextets.slice(bestStart + bestLength).join(":");
      return head + "::" + tail;
    }
    function normalizeIPv6Address(input) {
      const compression = input.indexOf("::");
      if (compression !== -1 && input.indexOf("::", compression + 1) !== -1) return void 0;
      const left = compression === -1 ? input.split(":") : input.slice(0, compression).split(":");
      const right = compression === -1 ? [] : input.slice(compression + 2).split(":");
      if (compression !== -1) {
        if (left.length === 1 && left[0] === "") left.length = 0;
        if (right.length === 1 && right[0] === "") right.length = 0;
      }
      const parts = left.concat(right);
      let hextetCount = 0;
      for (let i = 0; i < parts.length; i++) {
        const part = parts[i];
        if (part === "") return void 0;
        if (part.indexOf(".") !== -1) {
          if (i !== parts.length - 1 || compression !== -1 && right.length === 0 || !isIPv4(part)) return void 0;
          hextetCount += 2;
          continue;
        }
        if (!isHextet(part)) return void 0;
        parts[i] = parseInt(part, 16).toString(16);
        hextetCount++;
      }
      if (compression === -1) {
        if (hextetCount !== 8) return void 0;
        return compressIPv6ZeroRun(parts);
      }
      if (hextetCount >= 8) return void 0;
      const expanded = parts.slice(0, left.length);
      for (let i = hextetCount; i < 8; i++) expanded.push("0");
      for (let i = left.length; i < parts.length; i++) expanded.push(parts[i]);
      return compressIPv6ZeroRun(expanded);
    }
    function normalizeIPv6(host) {
      const bracketed = host[0] === "[" && host[host.length - 1] === "]";
      const hasBracket = host[0] === "[" || host[host.length - 1] === "]";
      if (hasBracket && !bracketed) return { host, isIPV6: false, error: true };
      let input = bracketed ? host.slice(1, -1) : host;
      if (bracketed && isIPvFuture(input)) {
        input = input.toLowerCase();
        return { host: `[${input}]`, escapedHost: input, isIPV6: false, isIPVFuture: true };
      }
      if (findToken(input, ":") < 2) {
        return { host, isIPV6: false, error: bracketed };
      }
      let zoneIdentifier = "";
      const zoneSeparator = input.indexOf("%");
      if (zoneSeparator !== -1) {
        const separatorLength = input.slice(zoneSeparator, zoneSeparator + 3).toLowerCase() === "%25" ? 3 : 1;
        zoneIdentifier = input.slice(zoneSeparator + separatorLength);
        if (!isZoneIdentifier(zoneIdentifier)) return { host, isIPV6: false, error: true };
        input = input.slice(0, zoneSeparator);
      }
      const address = normalizeIPv6Address(input);
      if (address === void 0) return { host, isIPV6: false, error: true };
      return {
        host: address + (zoneIdentifier ? "%" + zoneIdentifier : ""),
        escapedHost: address + (zoneIdentifier ? "%25" + zoneIdentifier : ""),
        isIPV6: true
      };
    }
    function findToken(str, token) {
      let ind = 0;
      for (let i = 0; i < str.length; i++) {
        if (str[i] === token) ind++;
      }
      return ind;
    }
    function removeDotSegments(path2) {
      let input = path2;
      const output = [];
      let nextSlash = -1;
      let len = 0;
      while (len = input.length) {
        if (len === 1) {
          if (input === ".") {
            break;
          } else if (input === "/") {
            output.push("/");
            break;
          } else {
            output.push(input);
            break;
          }
        } else if (len === 2) {
          if (input[0] === ".") {
            if (input[1] === ".") {
              break;
            } else if (input[1] === "/") {
              input = input.slice(2);
              continue;
            }
          } else if (input[0] === "/") {
            if (input[1] === "." || input[1] === "/") {
              output.push("/");
              break;
            }
          }
        } else if (len === 3) {
          if (input === "/..") {
            if (output.length !== 0) {
              output.pop();
            }
            output.push("/");
            break;
          }
        }
        if (input[0] === ".") {
          if (input[1] === ".") {
            if (input[2] === "/") {
              input = input.slice(3);
              continue;
            }
          } else if (input[1] === "/") {
            input = input.slice(2);
            continue;
          }
        } else if (input[0] === "/") {
          if (input[1] === ".") {
            if (input[2] === "/") {
              input = input.slice(2);
              continue;
            } else if (input[2] === ".") {
              if (input[3] === "/") {
                input = input.slice(3);
                if (output.length !== 0) {
                  output.pop();
                }
                continue;
              }
            }
          }
        }
        if ((nextSlash = input.indexOf("/", 1)) === -1) {
          output.push(input);
          break;
        } else {
          output.push(input.slice(0, nextSlash));
          input = input.slice(nextSlash);
        }
      }
      return output.join("");
    }
    function removeDotSegmentsRelative(path2) {
      if (path2 === "" || path2[0] === "/") {
        return removeDotSegments(path2);
      }
      const segments = path2.split("/");
      const last = segments.length - 1;
      const output = [];
      let trailingDirectory = false;
      for (let i = 0; i <= last; i++) {
        const segment = segments[i];
        if (segment === "." || segment === "..") {
          if (segment === "..") {
            if (output.length !== 0 && output[output.length - 1] !== "..") {
              output.pop();
            } else {
              output.push("..");
            }
          }
          trailingDirectory = i === last;
        } else {
          output.push(segment);
        }
      }
      if (trailingDirectory && output[output.length - 1] !== "..") {
        output.push("");
      }
      if (output.length === 0 || output[0] === "" || output[0].includes(":")) {
        output.unshift(".");
      }
      return output.join("/");
    }
    var HOST_DELIMS = { "@": "%40", "/": "%2F", "?": "%3F", "#": "%23", ":": "%3A" };
    var HOST_DELIM_RE = /[@/?#:]/g;
    var HOST_DELIM_NO_COLON_RE = /[@/?#]/g;
    function reescapeHostDelimiters(host, isIP) {
      const re = isIP ? HOST_DELIM_NO_COLON_RE : HOST_DELIM_RE;
      re.lastIndex = 0;
      return host.replace(re, (ch) => HOST_DELIMS[ch]);
    }
    function normalizePercentEncoding(input, decodeUnreserved = false) {
      if (input.indexOf("%") === -1) {
        return input;
      }
      let output = "";
      for (let i = 0; i < input.length; i++) {
        if (input[i] === "%" && i + 2 < input.length) {
          const hex = input.slice(i + 1, i + 3);
          if (isHexPair(hex)) {
            const normalizedHex = hex.toUpperCase();
            const decoded = String.fromCharCode(parseInt(normalizedHex, 16));
            if (decodeUnreserved && isUnreserved(decoded)) {
              output += decoded;
            } else {
              output += "%" + normalizedHex;
            }
            i += 2;
            continue;
          }
        }
        output += input[i];
      }
      return output;
    }
    function normalizePathEncoding(input) {
      let output = "";
      for (let i = 0; i < input.length; i++) {
        const ch = input[i];
        if (ch === "%" && i + 2 < input.length) {
          const hex = input.slice(i + 1, i + 3);
          if (isHexPair(hex)) {
            const normalizedHex = hex.toUpperCase();
            const decoded = String.fromCharCode(parseInt(normalizedHex, 16));
            if (decoded !== "." && isUnreserved(decoded)) {
              output += decoded;
            } else {
              output += "%" + normalizedHex;
            }
            i += 2;
            continue;
          }
        }
        if (isPathCharacter(ch)) {
          output += ch;
        } else {
          const code = input.charCodeAt(i);
          if (code < 128) {
            output += isEscapeSafe(code) ? ch : BYTE_HEX[code];
          } else if (code < 55296 || code > 57343) {
            output += percentEncodeNonAscii(code);
          } else if (code <= 56319 && i + 1 < input.length) {
            const low = input.charCodeAt(i + 1);
            if (low >= 56320 && low <= 57343) {
              output += percentEncodeNonAscii(65536 + (code - 55296 << 10) + (low - 56320));
              i++;
            } else {
              output += percentEncodeNonAscii(65533);
            }
          } else {
            output += percentEncodeNonAscii(65533);
          }
        }
      }
      return output;
    }
    function serializePathEncoding(input, pathNoScheme = false) {
      let output = "";
      let firstSegment = pathNoScheme && input[0] !== "/";
      for (let i = 0; i < input.length; i++) {
        const ch = input[i];
        if (ch === "%" && i + 2 < input.length) {
          const hex = input.slice(i + 1, i + 3);
          if (isHexPair(hex)) {
            output += "%" + hex.toUpperCase();
            i += 2;
            continue;
          }
        }
        if (ch === "/") {
          firstSegment = false;
        }
        if (isPathCharacter(ch) && (ch !== ":" || !firstSegment)) {
          output += ch;
        } else {
          const code = input.charCodeAt(i);
          if (code < 128) {
            output += BYTE_HEX[code];
          } else if (code < 55296 || code > 57343) {
            output += percentEncodeNonAscii(code);
          } else if (code <= 56319 && i + 1 < input.length) {
            const low = input.charCodeAt(i + 1);
            if (low >= 56320 && low <= 57343) {
              output += percentEncodeNonAscii(65536 + (code - 55296 << 10) + (low - 56320));
              i++;
            } else {
              output += percentEncodeNonAscii(65533);
            }
          } else {
            output += percentEncodeNonAscii(65533);
          }
        }
      }
      return output;
    }
    function encodeComponent(input, isAllowed) {
      let output = "";
      for (let i = 0; i < input.length; i++) {
        const ch = input[i];
        if (ch === "%" && i + 2 < input.length) {
          const hex = input.slice(i + 1, i + 3);
          if (isHexPair(hex)) {
            output += "%" + hex.toUpperCase();
            i += 2;
            continue;
          }
        }
        if (isAllowed(ch)) {
          output += ch;
        } else {
          const code = input.charCodeAt(i);
          if (code < 128) {
            output += BYTE_HEX[code];
          } else if (code < 55296 || code > 57343) {
            output += percentEncodeNonAscii(code);
          } else if (code <= 56319 && i + 1 < input.length) {
            const low = input.charCodeAt(i + 1);
            if (low >= 56320 && low <= 57343) {
              output += percentEncodeNonAscii(65536 + (code - 55296 << 10) + (low - 56320));
              i++;
            } else {
              output += percentEncodeNonAscii(65533);
            }
          } else {
            output += percentEncodeNonAscii(65533);
          }
        }
      }
      return output;
    }
    function encodeUserinfo(input) {
      return encodeComponent(input, isUserinfoCharacter);
    }
    function encodeQuery(input) {
      return encodeComponent(input, isQueryFragmentCharacter);
    }
    function encodeFragment(input) {
      return encodeComponent(input, isQueryFragmentCharacter);
    }
    function isEscapeSafe(cp) {
      return cp >= 48 && cp <= 57 || cp >= 65 && cp <= 90 || cp >= 97 && cp <= 122 || cp === 42 || cp === 43 || cp === 45 || cp === 46 || cp === 47 || cp === 64 || cp === 95;
    }
    function normalizeQueryFragmentEncoding(input) {
      let output = "";
      for (let i = 0; i < input.length; i++) {
        const ch = input[i];
        if (ch === "%" && i + 2 < input.length) {
          const hex = input.slice(i + 1, i + 3);
          if (isHexPair(hex)) {
            const normalizedHex = hex.toUpperCase();
            const decoded = String.fromCharCode(parseInt(normalizedHex, 16));
            if (isUnreserved(decoded)) {
              output += decoded;
            } else {
              output += "%" + normalizedHex;
            }
            i += 2;
            continue;
          }
        }
        if (isQueryFragmentCharacter(ch)) {
          output += ch;
        } else {
          const code = input.charCodeAt(i);
          if (code < 128) {
            output += isEscapeSafe(code) ? ch : BYTE_HEX[code];
          } else if (code < 55296 || code > 57343) {
            output += percentEncodeNonAscii(code);
          } else if (code <= 56319 && i + 1 < input.length) {
            const low = input.charCodeAt(i + 1);
            if (low >= 56320 && low <= 57343) {
              output += percentEncodeNonAscii(65536 + (code - 55296 << 10) + (low - 56320));
              i++;
            } else {
              output += percentEncodeNonAscii(65533);
            }
          } else {
            output += percentEncodeNonAscii(65533);
          }
        }
      }
      return output;
    }
    function escapePreservingEscapes(input) {
      let output = "";
      for (let i = 0; i < input.length; i++) {
        if (input[i] === "%" && i + 2 < input.length) {
          const hex = input.slice(i + 1, i + 3);
          if (isHexPair(hex)) {
            output += "%" + hex.toUpperCase();
            i += 2;
            continue;
          }
        }
        output += escape(input[i]);
      }
      return output;
    }
    function recomposeAuthority(component) {
      const uriTokens = [];
      if (component.userinfo !== void 0) {
        uriTokens.push(encodeUserinfo(component.userinfo));
        uriTokens.push("@");
      }
      if (component.host !== void 0) {
        let host = component.host;
        if (!isIPv4(host)) {
          let ipV6res = normalizeIPv6(host);
          if (ipV6res.isIPV6 !== true && ipV6res.isIPVFuture !== true) {
            host = normalizePercentEncoding(host, true);
            ipV6res = normalizeIPv6(host);
          }
          if (ipV6res.isIPV6 === true || ipV6res.isIPVFuture === true) {
            host = `[${ipV6res.escapedHost}]`;
          } else {
            host = reescapeHostDelimiters(host, false);
          }
        }
        uriTokens.push(host);
      }
      if (typeof component.port === "number" || typeof component.port === "string") {
        const port = String(component.port);
        if (!isPort(port)) {
          throw new TypeError("URI port is malformed.");
        }
        uriTokens.push(":");
        uriTokens.push(port);
      }
      return uriTokens.length ? uriTokens.join("") : void 0;
    }
    module.exports = {
      nonSimpleDomain,
      recomposeAuthority,
      reescapeHostDelimiters,
      normalizePercentEncoding,
      normalizePathEncoding,
      serializePathEncoding,
      normalizeQueryFragmentEncoding,
      encodeUserinfo,
      encodeQuery,
      encodeFragment,
      escapePreservingEscapes,
      removeDotSegments,
      removeDotSegmentsRelative,
      isIPv4,
      isUUID,
      normalizeIPv6,
      stringArrayToHexStripped
    };
  }
});

// node_modules/fast-uri/lib/schemes.js
var require_schemes = __commonJS({
  "node_modules/fast-uri/lib/schemes.js"(exports, module) {
    "use strict";
    var { isUUID } = require_utils();
    var URN_REG = /^([\da-z][\d\-a-z]{0,31}):((?:[\w!$'()*+,\-./:;=@]|%[\da-f]{2})+)$/iu;
    var supportedSchemeNames = (
      /** @type {const} */
      [
        "http",
        "https",
        "ws",
        "wss",
        "urn",
        "urn:uuid"
      ]
    );
    function isValidSchemeName(name) {
      return supportedSchemeNames.indexOf(
        /** @type {*} */
        name
      ) !== -1;
    }
    function wsIsSecure(wsComponent) {
      if (wsComponent.secure === true) {
        return true;
      } else if (wsComponent.secure === false) {
        return false;
      } else if (wsComponent.scheme) {
        return wsComponent.scheme.length === 3 && (wsComponent.scheme[0] === "w" || wsComponent.scheme[0] === "W") && (wsComponent.scheme[1] === "s" || wsComponent.scheme[1] === "S") && (wsComponent.scheme[2] === "s" || wsComponent.scheme[2] === "S");
      } else {
        return false;
      }
    }
    function httpParse(component) {
      if (!component.host) {
        component.error = component.error || "HTTP URIs must have a host.";
      }
      return component;
    }
    function httpSerialize(component) {
      const secure = String(component.scheme).toLowerCase() === "https";
      if (component.port === (secure ? 443 : 80) || component.port === "") {
        component.port = void 0;
      }
      if (!component.path) {
        component.path = "/";
      }
      return component;
    }
    function wsParse(wsComponent) {
      wsComponent.secure = wsIsSecure(wsComponent);
      wsComponent.resourceName = (wsComponent.path || "/") + (wsComponent.query ? "?" + wsComponent.query : "");
      wsComponent.path = void 0;
      wsComponent.query = void 0;
      return wsComponent;
    }
    function wsSerialize(wsComponent) {
      if (wsComponent.port === (wsIsSecure(wsComponent) ? 443 : 80) || wsComponent.port === "") {
        wsComponent.port = void 0;
      }
      if (typeof wsComponent.secure === "boolean") {
        wsComponent.scheme = wsComponent.secure ? "wss" : "ws";
        wsComponent.secure = void 0;
      }
      if (wsComponent.resourceName) {
        const queryIndex = wsComponent.resourceName.indexOf("?");
        const path2 = queryIndex === -1 ? wsComponent.resourceName : wsComponent.resourceName.slice(0, queryIndex);
        wsComponent.path = path2 && path2 !== "/" ? path2 : void 0;
        wsComponent.query = queryIndex === -1 ? void 0 : wsComponent.resourceName.slice(queryIndex + 1);
        wsComponent.resourceName = void 0;
      }
      wsComponent.fragment = void 0;
      return wsComponent;
    }
    function urnParse(urnComponent, options) {
      if (!urnComponent.path) {
        urnComponent.error = "URN can not be parsed";
        return urnComponent;
      }
      const matches = urnComponent.path.match(URN_REG);
      if (matches && matches[0] === urnComponent.path) {
        const scheme = options.scheme || urnComponent.scheme || "urn";
        urnComponent.nid = matches[1].toLowerCase();
        urnComponent.nss = matches[2];
        const urnScheme = `${scheme}:${options.nid || urnComponent.nid}`;
        const schemeHandler = getSchemeHandler(urnScheme);
        urnComponent.path = void 0;
        if (schemeHandler) {
          urnComponent = schemeHandler.parse(urnComponent, options);
        }
      } else {
        urnComponent.error = urnComponent.error || "URN can not be parsed.";
      }
      return urnComponent;
    }
    function urnSerialize(urnComponent, options) {
      if (urnComponent.nid === void 0) {
        throw new Error("URN without nid cannot be serialized");
      }
      const scheme = options.scheme || urnComponent.scheme || "urn";
      const nid = urnComponent.nid.toLowerCase();
      const urnScheme = `${scheme}:${options.nid || nid}`;
      const schemeHandler = getSchemeHandler(urnScheme);
      if (schemeHandler) {
        urnComponent = schemeHandler.serialize(urnComponent, options);
      }
      const uriComponent = urnComponent;
      const nss = urnComponent.nss;
      uriComponent.path = `${nid || options.nid}:${nss}`;
      options.skipEscape = true;
      return uriComponent;
    }
    function urnuuidParse(urnComponent, options) {
      const uuidComponent = urnComponent;
      uuidComponent.uuid = uuidComponent.nss;
      uuidComponent.nss = void 0;
      if (!options.tolerant && (!uuidComponent.uuid || !isUUID(uuidComponent.uuid))) {
        uuidComponent.error = uuidComponent.error || "UUID is not valid.";
      }
      return uuidComponent;
    }
    function urnuuidSerialize(uuidComponent) {
      const urnComponent = uuidComponent;
      urnComponent.nss = (uuidComponent.uuid || "").toLowerCase();
      return urnComponent;
    }
    var http = (
      /** @type {SchemeHandler} */
      {
        scheme: "http",
        domainHost: true,
        parse: httpParse,
        serialize: httpSerialize
      }
    );
    var https = (
      /** @type {SchemeHandler} */
      {
        scheme: "https",
        domainHost: http.domainHost,
        parse: httpParse,
        serialize: httpSerialize
      }
    );
    var ws = (
      /** @type {SchemeHandler} */
      {
        scheme: "ws",
        domainHost: true,
        parse: wsParse,
        serialize: wsSerialize
      }
    );
    var wss = (
      /** @type {SchemeHandler} */
      {
        scheme: "wss",
        domainHost: ws.domainHost,
        parse: ws.parse,
        serialize: ws.serialize
      }
    );
    var urn = (
      /** @type {SchemeHandler} */
      {
        scheme: "urn",
        parse: urnParse,
        serialize: urnSerialize,
        skipNormalize: true
      }
    );
    var urnuuid = (
      /** @type {SchemeHandler} */
      {
        scheme: "urn:uuid",
        parse: urnuuidParse,
        serialize: urnuuidSerialize,
        skipNormalize: true
      }
    );
    var SCHEMES = (
      /** @type {Record<SchemeName, SchemeHandler>} */
      {
        http,
        https,
        ws,
        wss,
        urn,
        "urn:uuid": urnuuid
      }
    );
    Object.setPrototypeOf(SCHEMES, null);
    function getSchemeHandler(scheme) {
      return scheme && (SCHEMES[
        /** @type {SchemeName} */
        scheme
      ] || SCHEMES[
        /** @type {SchemeName} */
        scheme.toLowerCase()
      ]) || void 0;
    }
    module.exports = {
      wsIsSecure,
      SCHEMES,
      isValidSchemeName,
      getSchemeHandler
    };
  }
});

// node_modules/fast-uri/index.js
var require_fast_uri = __commonJS({
  "node_modules/fast-uri/index.js"(exports, module) {
    "use strict";
    var { normalizeIPv6, removeDotSegments, removeDotSegmentsRelative, recomposeAuthority, normalizePercentEncoding, normalizePathEncoding, serializePathEncoding, normalizeQueryFragmentEncoding, encodeQuery, encodeFragment, reescapeHostDelimiters, isIPv4, nonSimpleDomain } = require_utils();
    var { SCHEMES, getSchemeHandler } = require_schemes();
    var VALID_SCHEME = /^[A-Za-z][A-Za-z0-9+.-]*$/u;
    var MALFORMED_SCHEME_ERROR = "URI scheme is malformed.";
    var MALFORMED_HOST_ERROR = "URI host is malformed.";
    var FORBIDDEN_DOMAIN_HOST_CHARACTER = /[\0-\x20"#/:<>?@[\\\]^`{|}\x7F]/u;
    function validateScheme(scheme) {
      const stringScheme = String(scheme);
      if (!VALID_SCHEME.test(stringScheme)) {
        throw new TypeError(MALFORMED_SCHEME_ERROR);
      }
      return stringScheme;
    }
    function normalize(uri, options) {
      if (typeof uri === "string") {
        uri = /** @type {T} */
        normalizeString(uri, options);
      } else if (typeof uri === "object") {
        uri = /** @type {T} */
        parse(serialize(uri, options), options);
      }
      return uri;
    }
    function resolve(baseURI, relativeURI, options) {
      const schemelessOptions = options ? Object.assign({ scheme: "null" }, options) : { scheme: "null" };
      const {
        parsed: baseParsed,
        malformedAuthorityOrPort: baseMalformed,
        malformedPercentEncoding: baseMalformedPercentEncoding,
        malformedSchemeSpecific: baseMalformedSchemeSpecific,
        malformedHost: baseMalformedHost,
        malformedScheme: baseMalformedScheme
      } = parseWithStatus(baseURI, schemelessOptions);
      const {
        parsed: relativeParsed,
        malformedAuthorityOrPort: relativeMalformed,
        malformedPercentEncoding: relativeMalformedPercentEncoding,
        malformedSchemeSpecific: relativeMalformedSchemeSpecific,
        malformedHost: relativeMalformedHost,
        malformedScheme: relativeMalformedScheme
      } = parseWithStatus(relativeURI, schemelessOptions);
      if (baseMalformed || relativeMalformed || baseMalformedPercentEncoding || relativeMalformedPercentEncoding || baseMalformedSchemeSpecific || relativeMalformedSchemeSpecific || baseMalformedHost || relativeMalformedHost || baseMalformedScheme || relativeMalformedScheme) {
        throw new Error(baseParsed.error || relativeParsed.error || "URI is malformed.");
      }
      const resolved = resolveComponent(baseParsed, relativeParsed, schemelessOptions, true);
      const resolvedSchemeHandler = getSchemeHandler(options && options.scheme || resolved.scheme);
      const resolvedHost = resolved.host;
      const resolvedHostIsIP = resolvedHost !== void 0 && resolvedHost !== "" && (isIPv4(resolvedHost) || normalizeIPv6(resolvedHost).isIPV6);
      if (hasForbiddenDomainHost(resolved, options || {}, resolvedSchemeHandler, resolvedHostIsIP)) {
        throw new Error(MALFORMED_HOST_ERROR);
      }
      canonicalizeHost(resolved, options || {}, resolvedSchemeHandler, resolvedHostIsIP);
      const encodedASCIIHost = resolvedHost && resolvedHost.indexOf("%") !== -1 && !new RegExp("\\P{ASCII}", "u").test(resolvedHost);
      if (resolved.error && !encodedASCIIHost) {
        throw new Error(resolved.error);
      }
      schemelessOptions.skipEscape = true;
      return serialize(resolved, schemelessOptions);
    }
    function resolveComponent(base, relative, options, skipNormalization) {
      const target = {};
      if (!skipNormalization) {
        base = parse(serialize(base, options), options);
        relative = parse(serialize(relative, options), options);
      }
      options = options || {};
      if (!options.tolerant && relative.scheme) {
        target.scheme = relative.scheme;
        target.userinfo = relative.userinfo;
        target.host = relative.host;
        target.port = relative.port;
        target.path = removeDotSegments(relative.path || "");
        target.query = relative.query;
      } else {
        if (relative.userinfo !== void 0 || relative.host !== void 0 || relative.port !== void 0) {
          target.userinfo = relative.userinfo;
          target.host = relative.host;
          target.port = relative.port;
          target.path = removeDotSegments(relative.path || "");
          target.query = relative.query;
        } else {
          if (!relative.path) {
            target.path = base.path;
            if (relative.query !== void 0) {
              target.query = relative.query;
            } else {
              target.query = base.query;
            }
          } else {
            if (relative.path[0] === "/") {
              target.path = removeDotSegments(relative.path);
            } else {
              const baseHasAuthority = base.userinfo !== void 0 || base.host !== void 0 || base.port !== void 0;
              if (baseHasAuthority && !base.path) {
                target.path = "/" + relative.path;
              } else if (!base.path) {
                target.path = relative.path;
              } else {
                target.path = base.path.slice(0, base.path.lastIndexOf("/") + 1) + relative.path;
              }
              target.path = base.scheme === void 0 && !baseHasAuthority && target.path[0] !== "/" ? removeDotSegmentsRelative(target.path) : removeDotSegments(target.path);
            }
            target.query = relative.query;
          }
          target.userinfo = base.userinfo;
          target.host = base.host;
          target.port = base.port;
        }
        target.scheme = base.scheme;
      }
      target.fragment = relative.fragment;
      return target;
    }
    function equal(uriA, uriB, options) {
      const normalizedA = normalizeComparableURI(uriA, options);
      const normalizedB = normalizeComparableURI(uriB, options);
      return normalizedA !== void 0 && normalizedB !== void 0 && normalizedA === normalizedB;
    }
    function serialize(cmpts, opts) {
      const component = {
        host: cmpts.host,
        scheme: cmpts.scheme,
        userinfo: cmpts.userinfo,
        port: cmpts.port,
        path: cmpts.path,
        query: cmpts.query,
        nid: cmpts.nid,
        nss: cmpts.nss,
        uuid: cmpts.uuid,
        fragment: cmpts.fragment,
        reference: cmpts.reference,
        resourceName: cmpts.resourceName,
        secure: cmpts.secure,
        error: ""
      };
      const options = Object.assign({}, opts);
      const uriTokens = [];
      if (component.scheme) {
        component.scheme = validateScheme(component.scheme);
      }
      const schemeHandler = getSchemeHandler(options.scheme || component.scheme);
      if (schemeHandler && schemeHandler.serialize) schemeHandler.serialize(component, options);
      const hasAuthority = component.userinfo !== void 0 || component.host !== void 0 || component.port !== void 0;
      const schemelessReference = (component.scheme === void 0 || options.reference === "suffix") && !hasAuthority;
      const pathNoScheme = !options.skipEscape && schemelessReference;
      if (component.path !== void 0) {
        if (!options.skipEscape) {
          component.path = serializePathEncoding(component.path, pathNoScheme);
        } else {
          component.path = normalizePercentEncoding(component.path);
        }
      }
      if (options.reference !== "suffix" && component.scheme) {
        component.scheme = validateScheme(component.scheme);
        uriTokens.push(component.scheme, ":");
      }
      const authority = recomposeAuthority(component);
      if (authority !== void 0) {
        if (options.reference !== "suffix") {
          uriTokens.push("//");
        }
        uriTokens.push(authority);
        if (component.path && component.path[0] !== "/") {
          uriTokens.push("/");
        }
      }
      if (component.path !== void 0) {
        let s = component.path;
        if (!options.absolutePath && (!schemeHandler || !schemeHandler.absolutePath)) {
          s = schemelessReference && s[0] !== "/" ? removeDotSegmentsRelative(s) : removeDotSegments(s);
        }
        if (schemelessReference) {
          s = serializePathEncoding(s, true);
        }
        if (authority === void 0 && s[0] === "/" && s[1] === "/") {
          s = "/%2F" + s.slice(2);
        }
        uriTokens.push(s);
      }
      if (component.query !== void 0) {
        uriTokens.push("?", encodeQuery(component.query));
      }
      if (component.fragment !== void 0) {
        uriTokens.push("#", encodeFragment(component.fragment));
      }
      return uriTokens.join("");
    }
    var URI_PARSE = /^(?:([^#/:?]+):)?(?:\/\/((?:([^#/?@]*)@)?(\[[^#/?\]]+\]|[^#/:?]*)(?::(\d*))?))?([^#?]*)(?:\?([^#]*))?(?:#((?:.|[\n\r])*))?/u;
    var AUTHORITY_PREFIX = /^(?:[^#/:?]+:)?\/\/([^/?#]*)/;
    var AUTHORITY_INTRODUCER_REGION = /^(?:[^#/:?]+:)?([/\\\t\n\r]*)/;
    function getParseError(parsed, matches) {
      if (matches[2] !== void 0 && parsed.path && parsed.path[0] !== "/") {
        return 'URI path must start with "/" when authority is present.';
      }
      if (typeof parsed.port === "number" && (parsed.port < 0 || parsed.port > 65535)) {
        return "URI port is malformed.";
      }
      return void 0;
    }
    function hasMalformedPercentEncoding(component) {
      if (component === void 0) return false;
      let percent = component.indexOf("%");
      while (percent !== -1) {
        if (percent + 2 >= component.length || !/^[\da-f]{2}$/iu.test(component.slice(percent + 1, percent + 3))) {
          return true;
        }
        percent = component.indexOf("%", percent + 3);
      }
      return false;
    }
    function isIPLiteral(host) {
      return host[0] === "[" && host[host.length - 1] === "]";
    }
    function hasMalformedComponentPercentEncoding(matches) {
      const host = matches[4];
      return hasMalformedPercentEncoding(matches[3]) || host !== void 0 && !isIPLiteral(host) && hasMalformedPercentEncoding(host) || hasMalformedPercentEncoding(matches[6]) || hasMalformedPercentEncoding(matches[7]) || hasMalformedPercentEncoding(matches[8]);
    }
    function canonicalizeHost(parsed, options, schemeHandler, isIP) {
      if (hasForbiddenDomainHost(parsed, options, schemeHandler, isIP)) {
        parsed.error = parsed.error || MALFORMED_HOST_ERROR;
        return true;
      }
      if (!options.unicodeSupport && (!schemeHandler || !schemeHandler.unicodeSupport) && parsed.host && !isIPLiteral(parsed.host) && (options.domainHost || schemeHandler && schemeHandler.domainHost) && isIP === false && nonSimpleDomain(parsed.host)) {
        let url;
        try {
          url = new URL("http://" + parsed.host);
        } catch (e) {
          parsed.error = parsed.error || "Host's domain name can not be converted to ASCII: " + e;
          return true;
        }
        if (!isHostOnlyURL(url)) {
          parsed.error = parsed.error || MALFORMED_HOST_ERROR;
          return true;
        }
        parsed.host = url.hostname;
      }
      return false;
    }
    function hasForbiddenDomainHost(parsed, options, schemeHandler, isIP) {
      return Boolean(
        parsed.host && isIP === false && !isIPLiteral(parsed.host) && (options.domainHost || schemeHandler && schemeHandler.domainHost) && FORBIDDEN_DOMAIN_HOST_CHARACTER.test(parsed.host)
      );
    }
    function isHostOnlyURL(url) {
      return url.username === "" && url.password === "" && url.port === "" && url.pathname === "/" && url.search === "" && url.hash === "" && url.hostname !== "";
    }
    function parseWithStatus(uri, opts) {
      const options = Object.assign({}, opts);
      const parsed = {
        scheme: void 0,
        userinfo: void 0,
        host: "",
        port: void 0,
        path: "",
        query: void 0,
        fragment: void 0
      };
      let malformedAuthorityOrPort = false;
      let malformedPercentEncoding = false;
      let malformedSchemeSpecific = false;
      let malformedHost = false;
      let malformedIPLiteral = false;
      let malformedScheme = false;
      let isIP = false;
      if (options.reference === "suffix") {
        if (options.scheme) {
          uri = options.scheme + ":" + uri;
        } else {
          uri = "//" + uri;
        }
      }
      const authorityMatch = uri.match(AUTHORITY_PREFIX);
      if (authorityMatch !== null && authorityMatch[1].indexOf("\\") !== -1) {
        parsed.error = "URI authority must not contain a literal backslash.";
        malformedAuthorityOrPort = true;
      }
      const introducerMatch = uri.match(AUTHORITY_INTRODUCER_REGION);
      if (introducerMatch !== null) {
        const region = introducerMatch[1];
        const normalizedRegion = region.replace(/[\t\n\r]/g, "");
        if (normalizedRegion.length >= 2) {
          if (normalizedRegion.slice(0, 2) !== "//") {
            parsed.error = parsed.error || "URI authority must not contain a literal backslash.";
            malformedAuthorityOrPort = true;
          } else if (region.length !== normalizedRegion.length) {
            parsed.error = parsed.error || "URI authority introducer must not contain whitespace.";
            malformedAuthorityOrPort = true;
          }
        }
      }
      const matches = uri.match(URI_PARSE);
      if (matches) {
        parsed.scheme = matches[1];
        parsed.userinfo = matches[3];
        parsed.host = matches[4];
        parsed.port = parseInt(matches[5], 10);
        parsed.path = matches[6] || "";
        parsed.query = matches[7];
        parsed.fragment = matches[8];
        if (parsed.scheme !== void 0) {
          if (VALID_SCHEME.test(parsed.scheme)) {
            parsed.scheme = parsed.scheme.toLowerCase();
          } else {
            parsed.error = parsed.error || MALFORMED_SCHEME_ERROR;
            malformedScheme = true;
          }
        }
        malformedPercentEncoding = hasMalformedComponentPercentEncoding(matches);
        if (malformedPercentEncoding) {
          parsed.error = parsed.error || "URI contains malformed percent-encoding.";
        }
        if (isNaN(parsed.port)) {
          parsed.port = matches[5];
        }
        const parseError = getParseError(parsed, matches);
        if (parseError !== void 0) {
          parsed.error = parsed.error || parseError;
          malformedAuthorityOrPort = true;
        }
        if (parsed.host) {
          const ipv4result = isIPv4(parsed.host);
          if (ipv4result === false) {
            const bracketedIPLiteral = isIPLiteral(parsed.host);
            const hasIPLiteralBracket = parsed.host.indexOf("[") !== -1 || parsed.host.indexOf("]") !== -1;
            const ipv6result = normalizeIPv6(parsed.host);
            isIP = ipv6result.isIPV6 || ipv6result.isIPVFuture === true;
            malformedIPLiteral = hasIPLiteralBracket && (!bracketedIPLiteral || ipv6result.error === true);
            parsed.host = isIP ? ipv6result.host : ipv6result.host.toLowerCase();
            if (malformedIPLiteral) {
              parsed.error = parsed.error || MALFORMED_HOST_ERROR;
              malformedAuthorityOrPort = true;
            }
          } else {
            isIP = true;
          }
        }
        if (parsed.scheme === void 0 && parsed.userinfo === void 0 && parsed.host === void 0 && parsed.port === void 0 && parsed.query === void 0 && !parsed.path) {
          parsed.reference = "same-document";
        } else if (parsed.scheme === void 0) {
          parsed.reference = "relative";
        } else if (parsed.fragment === void 0) {
          parsed.reference = "absolute";
        } else {
          parsed.reference = "uri";
        }
        if (options.reference && options.reference !== "suffix" && options.reference !== parsed.reference) {
          parsed.error = parsed.error || "URI is not a " + options.reference + " reference.";
        }
        const schemeHandler = getSchemeHandler(options.scheme || parsed.scheme);
        if (!malformedIPLiteral) {
          malformedHost = canonicalizeHost(parsed, options, schemeHandler, isIP);
        }
        if (uri.indexOf("%") !== -1 && parsed.host !== void 0 && !malformedIPLiteral) {
          let host = isIP ? parsed.host : normalizePercentEncoding(parsed.host, true);
          if (!isIP) {
            host = normalizePercentEncoding(host.toLowerCase());
          }
          parsed.host = isIP || options.scheme !== "null" ? reescapeHostDelimiters(host, isIP) : host;
        }
        if (!schemeHandler || schemeHandler && !schemeHandler.skipNormalize) {
          if (parsed.path) {
            parsed.path = normalizePathEncoding(parsed.path);
          }
          if (parsed.query) {
            parsed.query = normalizeQueryFragmentEncoding(parsed.query);
          }
          if (parsed.fragment) {
            parsed.fragment = normalizeQueryFragmentEncoding(parsed.fragment);
          }
        }
        if (schemeHandler && schemeHandler.parse) {
          schemeHandler.parse(parsed, options);
          if (schemeHandler === SCHEMES.urn && parsed.nid === void 0) {
            malformedSchemeSpecific = true;
          }
        }
      } else {
        parsed.error = parsed.error || "URI can not be parsed.";
      }
      return { parsed, malformedAuthorityOrPort, malformedPercentEncoding, malformedSchemeSpecific, malformedHost, malformedScheme };
    }
    function parse(uri, opts) {
      return parseWithStatus(uri, opts).parsed;
    }
    function normalizeString(uri, opts) {
      return normalizeStringWithStatus(uri, opts).normalized;
    }
    function normalizeStringWithStatus(uri, opts) {
      const { parsed, malformedAuthorityOrPort, malformedPercentEncoding, malformedSchemeSpecific, malformedHost, malformedScheme } = parseWithStatus(uri, opts);
      return {
        normalized: malformedAuthorityOrPort || malformedPercentEncoding || malformedSchemeSpecific || malformedHost || malformedScheme ? uri : serialize(parsed, opts),
        malformedAuthorityOrPort,
        malformedPercentEncoding,
        malformedSchemeSpecific,
        malformedHost,
        malformedScheme
      };
    }
    function normalizeComparableURI(uri, opts) {
      if (typeof uri !== "string" && typeof uri !== "object") {
        return void 0;
      }
      let value;
      try {
        value = typeof uri === "string" ? uri : serialize(uri, opts);
      } catch {
        return void 0;
      }
      const { normalized, malformedAuthorityOrPort, malformedPercentEncoding, malformedSchemeSpecific, malformedHost, malformedScheme } = normalizeStringWithStatus(value, opts);
      return malformedAuthorityOrPort || malformedPercentEncoding || malformedSchemeSpecific || malformedHost || malformedScheme ? void 0 : normalized;
    }
    var fastUri = {
      SCHEMES,
      normalize,
      resolve,
      resolveComponent,
      equal,
      serialize,
      parse
    };
    module.exports = fastUri;
    module.exports.default = fastUri;
    module.exports.fastUri = fastUri;
  }
});

// node_modules/ajv/dist/runtime/uri.js
var require_uri = __commonJS({
  "node_modules/ajv/dist/runtime/uri.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var uri = require_fast_uri();
    uri.code = 'require("ajv/dist/runtime/uri").default';
    exports.default = uri;
  }
});

// node_modules/ajv/dist/core.js
var require_core = __commonJS({
  "node_modules/ajv/dist/core.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.CodeGen = exports.Name = exports.nil = exports.stringify = exports.str = exports._ = exports.KeywordCxt = void 0;
    var validate_1 = require_validate();
    Object.defineProperty(exports, "KeywordCxt", { enumerable: true, get: function() {
      return validate_1.KeywordCxt;
    } });
    var codegen_1 = require_codegen();
    Object.defineProperty(exports, "_", { enumerable: true, get: function() {
      return codegen_1._;
    } });
    Object.defineProperty(exports, "str", { enumerable: true, get: function() {
      return codegen_1.str;
    } });
    Object.defineProperty(exports, "stringify", { enumerable: true, get: function() {
      return codegen_1.stringify;
    } });
    Object.defineProperty(exports, "nil", { enumerable: true, get: function() {
      return codegen_1.nil;
    } });
    Object.defineProperty(exports, "Name", { enumerable: true, get: function() {
      return codegen_1.Name;
    } });
    Object.defineProperty(exports, "CodeGen", { enumerable: true, get: function() {
      return codegen_1.CodeGen;
    } });
    var validation_error_1 = require_validation_error();
    var ref_error_1 = require_ref_error();
    var rules_1 = require_rules();
    var compile_1 = require_compile();
    var codegen_2 = require_codegen();
    var resolve_1 = require_resolve();
    var dataType_1 = require_dataType();
    var util_1 = require_util();
    var $dataRefSchema = require_data();
    var uri_1 = require_uri();
    var defaultRegExp = (str, flags) => new RegExp(str, flags);
    defaultRegExp.code = "new RegExp";
    var META_IGNORE_OPTIONS = ["removeAdditional", "useDefaults", "coerceTypes"];
    var EXT_SCOPE_NAMES = /* @__PURE__ */ new Set([
      "validate",
      "serialize",
      "parse",
      "wrapper",
      "root",
      "schema",
      "keyword",
      "pattern",
      "formats",
      "validate$data",
      "func",
      "obj",
      "Error"
    ]);
    var removedOptions = {
      errorDataPath: "",
      format: "`validateFormats: false` can be used instead.",
      nullable: '"nullable" keyword is supported by default.',
      jsonPointers: "Deprecated jsPropertySyntax can be used instead.",
      extendRefs: "Deprecated ignoreKeywordsWithRef can be used instead.",
      missingRefs: "Pass empty schema with $id that should be ignored to ajv.addSchema.",
      processCode: "Use option `code: {process: (code, schemaEnv: object) => string}`",
      sourceCode: "Use option `code: {source: true}`",
      strictDefaults: "It is default now, see option `strict`.",
      strictKeywords: "It is default now, see option `strict`.",
      uniqueItems: '"uniqueItems" keyword is always validated.',
      unknownFormats: "Disable strict mode or pass `true` to `ajv.addFormat` (or `formats` option).",
      cache: "Map is used as cache, schema object as key.",
      serialize: "Map is used as cache, schema object as key.",
      ajvErrors: "It is default now."
    };
    var deprecatedOptions = {
      ignoreKeywordsWithRef: "",
      jsPropertySyntax: "",
      unicode: '"minLength"/"maxLength" account for unicode characters by default.'
    };
    var MAX_EXPRESSION = 200;
    function requiredOptions(o) {
      var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x, _y, _z, _0;
      const s = o.strict;
      const _optz = (_a = o.code) === null || _a === void 0 ? void 0 : _a.optimize;
      const optimize = _optz === true || _optz === void 0 ? 1 : _optz || 0;
      const regExp = (_c = (_b = o.code) === null || _b === void 0 ? void 0 : _b.regExp) !== null && _c !== void 0 ? _c : defaultRegExp;
      const uriResolver = (_d = o.uriResolver) !== null && _d !== void 0 ? _d : uri_1.default;
      return {
        strictSchema: (_f = (_e = o.strictSchema) !== null && _e !== void 0 ? _e : s) !== null && _f !== void 0 ? _f : true,
        strictNumbers: (_h = (_g = o.strictNumbers) !== null && _g !== void 0 ? _g : s) !== null && _h !== void 0 ? _h : true,
        strictTypes: (_k = (_j = o.strictTypes) !== null && _j !== void 0 ? _j : s) !== null && _k !== void 0 ? _k : "log",
        strictTuples: (_m = (_l = o.strictTuples) !== null && _l !== void 0 ? _l : s) !== null && _m !== void 0 ? _m : "log",
        strictRequired: (_p = (_o = o.strictRequired) !== null && _o !== void 0 ? _o : s) !== null && _p !== void 0 ? _p : false,
        code: o.code ? { ...o.code, optimize, regExp } : { optimize, regExp },
        loopRequired: (_q = o.loopRequired) !== null && _q !== void 0 ? _q : MAX_EXPRESSION,
        loopEnum: (_r = o.loopEnum) !== null && _r !== void 0 ? _r : MAX_EXPRESSION,
        meta: (_s = o.meta) !== null && _s !== void 0 ? _s : true,
        messages: (_t = o.messages) !== null && _t !== void 0 ? _t : true,
        inlineRefs: (_u = o.inlineRefs) !== null && _u !== void 0 ? _u : true,
        schemaId: (_v = o.schemaId) !== null && _v !== void 0 ? _v : "$id",
        addUsedSchema: (_w = o.addUsedSchema) !== null && _w !== void 0 ? _w : true,
        validateSchema: (_x = o.validateSchema) !== null && _x !== void 0 ? _x : true,
        validateFormats: (_y = o.validateFormats) !== null && _y !== void 0 ? _y : true,
        unicodeRegExp: (_z = o.unicodeRegExp) !== null && _z !== void 0 ? _z : true,
        int32range: (_0 = o.int32range) !== null && _0 !== void 0 ? _0 : true,
        uriResolver
      };
    }
    var Ajv2 = class {
      constructor(opts = {}) {
        this.schemas = {};
        this.refs = {};
        this.formats = /* @__PURE__ */ Object.create(null);
        this._compilations = /* @__PURE__ */ new Set();
        this._loading = {};
        this._cache = /* @__PURE__ */ new Map();
        opts = this.opts = { ...opts, ...requiredOptions(opts) };
        const { es5, lines } = this.opts.code;
        this.scope = new codegen_2.ValueScope({ scope: {}, prefixes: EXT_SCOPE_NAMES, es5, lines });
        this.logger = getLogger(opts.logger);
        const formatOpt = opts.validateFormats;
        opts.validateFormats = false;
        this.RULES = (0, rules_1.getRules)();
        checkOptions.call(this, removedOptions, opts, "NOT SUPPORTED");
        checkOptions.call(this, deprecatedOptions, opts, "DEPRECATED", "warn");
        this._metaOpts = getMetaSchemaOptions.call(this);
        if (opts.formats)
          addInitialFormats.call(this);
        this._addVocabularies();
        this._addDefaultMetaSchema();
        if (opts.keywords)
          addInitialKeywords.call(this, opts.keywords);
        if (typeof opts.meta == "object")
          this.addMetaSchema(opts.meta);
        addInitialSchemas.call(this);
        opts.validateFormats = formatOpt;
      }
      _addVocabularies() {
        this.addKeyword("$async");
      }
      _addDefaultMetaSchema() {
        const { $data, meta, schemaId } = this.opts;
        let _dataRefSchema = $dataRefSchema;
        if (schemaId === "id") {
          _dataRefSchema = { ...$dataRefSchema };
          _dataRefSchema.id = _dataRefSchema.$id;
          delete _dataRefSchema.$id;
        }
        if (meta && $data)
          this.addMetaSchema(_dataRefSchema, _dataRefSchema[schemaId], false);
      }
      defaultMeta() {
        const { meta, schemaId } = this.opts;
        return this.opts.defaultMeta = typeof meta == "object" ? meta[schemaId] || meta : void 0;
      }
      validate(schemaKeyRef, data) {
        let v;
        if (typeof schemaKeyRef == "string") {
          v = this.getSchema(schemaKeyRef);
          if (!v)
            throw new Error(`no schema with key or ref "${schemaKeyRef}"`);
        } else {
          v = this.compile(schemaKeyRef);
        }
        const valid = v(data);
        if (!("$async" in v))
          this.errors = v.errors;
        return valid;
      }
      compile(schema, _meta) {
        const sch = this._addSchema(schema, _meta);
        return sch.validate || this._compileSchemaEnv(sch);
      }
      compileAsync(schema, meta) {
        if (typeof this.opts.loadSchema != "function") {
          throw new Error("options.loadSchema should be a function");
        }
        const { loadSchema } = this.opts;
        return runCompileAsync.call(this, schema, meta);
        async function runCompileAsync(_schema, _meta) {
          await loadMetaSchema.call(this, _schema.$schema);
          const sch = this._addSchema(_schema, _meta);
          return sch.validate || _compileAsync.call(this, sch);
        }
        async function loadMetaSchema($ref) {
          if ($ref && !this.getSchema($ref)) {
            await runCompileAsync.call(this, { $ref }, true);
          }
        }
        async function _compileAsync(sch) {
          try {
            return this._compileSchemaEnv(sch);
          } catch (e) {
            if (!(e instanceof ref_error_1.default))
              throw e;
            checkLoaded.call(this, e);
            await loadMissingSchema.call(this, e.missingSchema);
            return _compileAsync.call(this, sch);
          }
        }
        function checkLoaded({ missingSchema: ref, missingRef }) {
          if (this.refs[ref]) {
            throw new Error(`AnySchema ${ref} is loaded but ${missingRef} cannot be resolved`);
          }
        }
        async function loadMissingSchema(ref) {
          const _schema = await _loadSchema.call(this, ref);
          if (!this.refs[ref])
            await loadMetaSchema.call(this, _schema.$schema);
          if (!this.refs[ref])
            this.addSchema(_schema, ref, meta);
        }
        async function _loadSchema(ref) {
          const p = this._loading[ref];
          if (p)
            return p;
          try {
            return await (this._loading[ref] = loadSchema(ref));
          } finally {
            delete this._loading[ref];
          }
        }
      }
      // Adds schema to the instance
      addSchema(schema, key, _meta, _validateSchema = this.opts.validateSchema) {
        if (Array.isArray(schema)) {
          for (const sch of schema)
            this.addSchema(sch, void 0, _meta, _validateSchema);
          return this;
        }
        let id;
        if (typeof schema === "object") {
          const { schemaId } = this.opts;
          id = schema[schemaId];
          if (id !== void 0 && typeof id != "string") {
            throw new Error(`schema ${schemaId} must be string`);
          }
        }
        key = (0, resolve_1.normalizeId)(key || id);
        this._checkUnique(key);
        this.schemas[key] = this._addSchema(schema, _meta, key, _validateSchema, true);
        return this;
      }
      // Add schema that will be used to validate other schemas
      // options in META_IGNORE_OPTIONS are alway set to false
      addMetaSchema(schema, key, _validateSchema = this.opts.validateSchema) {
        this.addSchema(schema, key, true, _validateSchema);
        return this;
      }
      //  Validate schema against its meta-schema
      validateSchema(schema, throwOrLogError) {
        if (typeof schema == "boolean")
          return true;
        let $schema;
        $schema = schema.$schema;
        if ($schema !== void 0 && typeof $schema != "string") {
          throw new Error("$schema must be a string");
        }
        $schema = $schema || this.opts.defaultMeta || this.defaultMeta();
        if (!$schema) {
          this.logger.warn("meta-schema not available");
          this.errors = null;
          return true;
        }
        const valid = this.validate($schema, schema);
        if (!valid && throwOrLogError) {
          const message = "schema is invalid: " + this.errorsText();
          if (this.opts.validateSchema === "log")
            this.logger.error(message);
          else
            throw new Error(message);
        }
        return valid;
      }
      // Get compiled schema by `key` or `ref`.
      // (`key` that was passed to `addSchema` or full schema reference - `schema.$id` or resolved id)
      getSchema(keyRef) {
        let sch;
        while (typeof (sch = getSchEnv.call(this, keyRef)) == "string")
          keyRef = sch;
        if (sch === void 0) {
          const { schemaId } = this.opts;
          const root = new compile_1.SchemaEnv({ schema: {}, schemaId });
          sch = compile_1.resolveSchema.call(this, root, keyRef);
          if (!sch)
            return;
          this.refs[keyRef] = sch;
        }
        return sch.validate || this._compileSchemaEnv(sch);
      }
      // Remove cached schema(s).
      // If no parameter is passed all schemas but meta-schemas are removed.
      // If RegExp is passed all schemas with key/id matching pattern but meta-schemas are removed.
      // Even if schema is referenced by other schemas it still can be removed as other schemas have local references.
      removeSchema(schemaKeyRef) {
        if (schemaKeyRef instanceof RegExp) {
          this._removeAllSchemas(this.schemas, schemaKeyRef);
          this._removeAllSchemas(this.refs, schemaKeyRef);
          return this;
        }
        switch (typeof schemaKeyRef) {
          case "undefined":
            this._removeAllSchemas(this.schemas);
            this._removeAllSchemas(this.refs);
            this._cache.clear();
            return this;
          case "string": {
            const sch = getSchEnv.call(this, schemaKeyRef);
            if (typeof sch == "object")
              this._cache.delete(sch.schema);
            delete this.schemas[schemaKeyRef];
            delete this.refs[schemaKeyRef];
            return this;
          }
          case "object": {
            const cacheKey = schemaKeyRef;
            this._cache.delete(cacheKey);
            let id = schemaKeyRef[this.opts.schemaId];
            if (id) {
              id = (0, resolve_1.normalizeId)(id);
              delete this.schemas[id];
              delete this.refs[id];
            }
            return this;
          }
          default:
            throw new Error("ajv.removeSchema: invalid parameter");
        }
      }
      // add "vocabulary" - a collection of keywords
      addVocabulary(definitions) {
        for (const def of definitions)
          this.addKeyword(def);
        return this;
      }
      addKeyword(kwdOrDef, def) {
        let keyword;
        if (typeof kwdOrDef == "string") {
          keyword = kwdOrDef;
          if (typeof def == "object") {
            this.logger.warn("these parameters are deprecated, see docs for addKeyword");
            def.keyword = keyword;
          }
        } else if (typeof kwdOrDef == "object" && def === void 0) {
          def = kwdOrDef;
          keyword = def.keyword;
          if (Array.isArray(keyword) && !keyword.length) {
            throw new Error("addKeywords: keyword must be string or non-empty array");
          }
        } else {
          throw new Error("invalid addKeywords parameters");
        }
        checkKeyword.call(this, keyword, def);
        if (!def) {
          (0, util_1.eachItem)(keyword, (kwd) => addRule.call(this, kwd));
          return this;
        }
        keywordMetaschema.call(this, def);
        const definition = {
          ...def,
          type: (0, dataType_1.getJSONTypes)(def.type),
          schemaType: (0, dataType_1.getJSONTypes)(def.schemaType)
        };
        (0, util_1.eachItem)(keyword, definition.type.length === 0 ? (k) => addRule.call(this, k, definition) : (k) => definition.type.forEach((t) => addRule.call(this, k, definition, t)));
        return this;
      }
      getKeyword(keyword) {
        const rule = this.RULES.all[keyword];
        return typeof rule == "object" ? rule.definition : !!rule;
      }
      // Remove keyword
      removeKeyword(keyword) {
        const { RULES } = this;
        delete RULES.keywords[keyword];
        delete RULES.all[keyword];
        for (const group of RULES.rules) {
          const i = group.rules.findIndex((rule) => rule.keyword === keyword);
          if (i >= 0)
            group.rules.splice(i, 1);
        }
        return this;
      }
      // Add format
      addFormat(name, format) {
        if (typeof format == "string")
          format = new RegExp(format);
        this.formats[name] = format;
        return this;
      }
      errorsText(errors = this.errors, { separator = ", ", dataVar = "data" } = {}) {
        if (!errors || errors.length === 0)
          return "No errors";
        return errors.map((e) => `${dataVar}${e.instancePath} ${e.message}`).reduce((text, msg) => text + separator + msg);
      }
      $dataMetaSchema(metaSchema, keywordsJsonPointers) {
        const rules = this.RULES.all;
        metaSchema = JSON.parse(JSON.stringify(metaSchema));
        for (const jsonPointer of keywordsJsonPointers) {
          const segments = jsonPointer.split("/").slice(1);
          let keywords = metaSchema;
          for (const seg of segments)
            keywords = keywords[seg];
          for (const key in rules) {
            const rule = rules[key];
            if (typeof rule != "object")
              continue;
            const { $data } = rule.definition;
            const schema = keywords[key];
            if ($data && schema)
              keywords[key] = schemaOrData(schema);
          }
        }
        return metaSchema;
      }
      _removeAllSchemas(schemas, regex) {
        for (const keyRef in schemas) {
          const sch = schemas[keyRef];
          if (!regex || regex.test(keyRef)) {
            if (typeof sch == "string") {
              delete schemas[keyRef];
            } else if (sch && !sch.meta) {
              this._cache.delete(sch.schema);
              delete schemas[keyRef];
            }
          }
        }
      }
      _addSchema(schema, meta, baseId, validateSchema = this.opts.validateSchema, addSchema = this.opts.addUsedSchema) {
        let id;
        const { schemaId } = this.opts;
        if (typeof schema == "object") {
          id = schema[schemaId];
        } else {
          if (this.opts.jtd)
            throw new Error("schema must be object");
          else if (typeof schema != "boolean")
            throw new Error("schema must be object or boolean");
        }
        let sch = this._cache.get(schema);
        if (sch !== void 0)
          return sch;
        baseId = (0, resolve_1.normalizeId)(id || baseId);
        const localRefs = resolve_1.getSchemaRefs.call(this, schema, baseId);
        sch = new compile_1.SchemaEnv({ schema, schemaId, meta, baseId, localRefs });
        this._cache.set(sch.schema, sch);
        if (addSchema && !baseId.startsWith("#")) {
          if (baseId)
            this._checkUnique(baseId);
          this.refs[baseId] = sch;
        }
        if (validateSchema)
          this.validateSchema(schema, true);
        return sch;
      }
      _checkUnique(id) {
        if (this.schemas[id] || this.refs[id]) {
          throw new Error(`schema with key or id "${id}" already exists`);
        }
      }
      _compileSchemaEnv(sch) {
        if (sch.meta)
          this._compileMetaSchema(sch);
        else
          compile_1.compileSchema.call(this, sch);
        if (!sch.validate)
          throw new Error("ajv implementation error");
        return sch.validate;
      }
      _compileMetaSchema(sch) {
        const currentOpts = this.opts;
        this.opts = this._metaOpts;
        try {
          compile_1.compileSchema.call(this, sch);
        } finally {
          this.opts = currentOpts;
        }
      }
    };
    Ajv2.ValidationError = validation_error_1.default;
    Ajv2.MissingRefError = ref_error_1.default;
    exports.default = Ajv2;
    function checkOptions(checkOpts, options, msg, log = "error") {
      for (const key in checkOpts) {
        const opt = key;
        if (opt in options)
          this.logger[log](`${msg}: option ${key}. ${checkOpts[opt]}`);
      }
    }
    function getSchEnv(keyRef) {
      keyRef = (0, resolve_1.normalizeId)(keyRef);
      return this.schemas[keyRef] || this.refs[keyRef];
    }
    function addInitialSchemas() {
      const optsSchemas = this.opts.schemas;
      if (!optsSchemas)
        return;
      if (Array.isArray(optsSchemas))
        this.addSchema(optsSchemas);
      else
        for (const key in optsSchemas)
          this.addSchema(optsSchemas[key], key);
    }
    function addInitialFormats() {
      for (const name in this.opts.formats) {
        const format = this.opts.formats[name];
        if (format)
          this.addFormat(name, format);
      }
    }
    function addInitialKeywords(defs) {
      if (Array.isArray(defs)) {
        this.addVocabulary(defs);
        return;
      }
      this.logger.warn("keywords option as map is deprecated, pass array");
      for (const keyword in defs) {
        const def = defs[keyword];
        if (!def.keyword)
          def.keyword = keyword;
        this.addKeyword(def);
      }
    }
    function getMetaSchemaOptions() {
      const metaOpts = { ...this.opts };
      for (const opt of META_IGNORE_OPTIONS)
        delete metaOpts[opt];
      return metaOpts;
    }
    var noLogs = { log() {
    }, warn() {
    }, error() {
    } };
    function getLogger(logger) {
      if (logger === false)
        return noLogs;
      if (logger === void 0)
        return console;
      if (logger.log && logger.warn && logger.error)
        return logger;
      throw new Error("logger must implement log, warn and error methods");
    }
    var KEYWORD_NAME = /^[a-z_$][a-z0-9_$:-]*$/i;
    function checkKeyword(keyword, def) {
      const { RULES } = this;
      (0, util_1.eachItem)(keyword, (kwd) => {
        if (RULES.keywords[kwd])
          throw new Error(`Keyword ${kwd} is already defined`);
        if (!KEYWORD_NAME.test(kwd))
          throw new Error(`Keyword ${kwd} has invalid name`);
      });
      if (!def)
        return;
      if (def.$data && !("code" in def || "validate" in def)) {
        throw new Error('$data keyword must have "code" or "validate" function');
      }
    }
    function addRule(keyword, definition, dataType) {
      var _a;
      const post = definition === null || definition === void 0 ? void 0 : definition.post;
      if (dataType && post)
        throw new Error('keyword with "post" flag cannot have "type"');
      const { RULES } = this;
      let ruleGroup = post ? RULES.post : RULES.rules.find(({ type: t }) => t === dataType);
      if (!ruleGroup) {
        ruleGroup = { type: dataType, rules: [] };
        RULES.rules.push(ruleGroup);
      }
      RULES.keywords[keyword] = true;
      if (!definition)
        return;
      const rule = {
        keyword,
        definition: {
          ...definition,
          type: (0, dataType_1.getJSONTypes)(definition.type),
          schemaType: (0, dataType_1.getJSONTypes)(definition.schemaType)
        }
      };
      if (definition.before)
        addBeforeRule.call(this, ruleGroup, rule, definition.before);
      else
        ruleGroup.rules.push(rule);
      RULES.all[keyword] = rule;
      (_a = definition.implements) === null || _a === void 0 ? void 0 : _a.forEach((kwd) => this.addKeyword(kwd));
    }
    function addBeforeRule(ruleGroup, rule, before) {
      const i = ruleGroup.rules.findIndex((_rule) => _rule.keyword === before);
      if (i >= 0) {
        ruleGroup.rules.splice(i, 0, rule);
      } else {
        ruleGroup.rules.push(rule);
        this.logger.warn(`rule ${before} is not defined`);
      }
    }
    function keywordMetaschema(def) {
      let { metaSchema } = def;
      if (metaSchema === void 0)
        return;
      if (def.$data && this.opts.$data)
        metaSchema = schemaOrData(metaSchema);
      def.validateSchema = this.compile(metaSchema, true);
    }
    var $dataRef = {
      $ref: "https://raw.githubusercontent.com/ajv-validator/ajv/master/lib/refs/data.json#"
    };
    function schemaOrData(schema) {
      return { anyOf: [schema, $dataRef] };
    }
  }
});

// node_modules/ajv/dist/vocabularies/core/id.js
var require_id = __commonJS({
  "node_modules/ajv/dist/vocabularies/core/id.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var def = {
      keyword: "id",
      code() {
        throw new Error('NOT SUPPORTED: keyword "id", use "$id" for schema ID');
      }
    };
    exports.default = def;
  }
});

// node_modules/ajv/dist/vocabularies/core/ref.js
var require_ref = __commonJS({
  "node_modules/ajv/dist/vocabularies/core/ref.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.callRef = exports.getValidate = void 0;
    var ref_error_1 = require_ref_error();
    var code_1 = require_code2();
    var codegen_1 = require_codegen();
    var names_1 = require_names();
    var compile_1 = require_compile();
    var util_1 = require_util();
    var def = {
      keyword: "$ref",
      schemaType: "string",
      code(cxt) {
        const { gen, schema: $ref, it } = cxt;
        const { baseId, schemaEnv: env, validateName, opts, self: self2 } = it;
        const { root } = env;
        if (($ref === "#" || $ref === "#/") && baseId === root.baseId)
          return callRootRef();
        const schOrEnv = compile_1.resolveRef.call(self2, root, baseId, $ref);
        if (schOrEnv === void 0)
          throw new ref_error_1.default(it.opts.uriResolver, baseId, $ref);
        if (schOrEnv instanceof compile_1.SchemaEnv)
          return callValidate(schOrEnv);
        return inlineRefSchema(schOrEnv);
        function callRootRef() {
          if (env === root)
            return callRef(cxt, validateName, env, env.$async);
          const rootName = gen.scopeValue("root", { ref: root });
          return callRef(cxt, (0, codegen_1._)`${rootName}.validate`, root, root.$async);
        }
        function callValidate(sch) {
          const v = getValidate(cxt, sch);
          callRef(cxt, v, sch, sch.$async);
        }
        function inlineRefSchema(sch) {
          const schName = gen.scopeValue("schema", opts.code.source === true ? { ref: sch, code: (0, codegen_1.stringify)(sch) } : { ref: sch });
          const valid = gen.name("valid");
          const schCxt = cxt.subschema({
            schema: sch,
            dataTypes: [],
            schemaPath: codegen_1.nil,
            topSchemaRef: schName,
            errSchemaPath: $ref
          }, valid);
          cxt.mergeEvaluated(schCxt);
          cxt.ok(valid);
        }
      }
    };
    function getValidate(cxt, sch) {
      const { gen } = cxt;
      return sch.validate ? gen.scopeValue("validate", { ref: sch.validate }) : (0, codegen_1._)`${gen.scopeValue("wrapper", { ref: sch })}.validate`;
    }
    exports.getValidate = getValidate;
    function callRef(cxt, v, sch, $async) {
      const { gen, it } = cxt;
      const { allErrors, schemaEnv: env, opts } = it;
      const passCxt = opts.passContext ? names_1.default.this : codegen_1.nil;
      if ($async)
        callAsyncRef();
      else
        callSyncRef();
      function callAsyncRef() {
        if (!env.$async)
          throw new Error("async schema referenced by sync schema");
        const valid = gen.let("valid");
        gen.try(() => {
          gen.code((0, codegen_1._)`await ${(0, code_1.callValidateCode)(cxt, v, passCxt)}`);
          addEvaluatedFrom(v);
          if (!allErrors)
            gen.assign(valid, true);
        }, (e) => {
          gen.if((0, codegen_1._)`!(${e} instanceof ${it.ValidationError})`, () => gen.throw(e));
          addErrorsFrom(e);
          if (!allErrors)
            gen.assign(valid, false);
        });
        cxt.ok(valid);
      }
      function callSyncRef() {
        cxt.result((0, code_1.callValidateCode)(cxt, v, passCxt), () => addEvaluatedFrom(v), () => addErrorsFrom(v));
      }
      function addErrorsFrom(source) {
        const errs = (0, codegen_1._)`${source}.errors`;
        gen.assign(names_1.default.vErrors, (0, codegen_1._)`${names_1.default.vErrors} === null ? ${errs} : ${names_1.default.vErrors}.concat(${errs})`);
        gen.assign(names_1.default.errors, (0, codegen_1._)`${names_1.default.vErrors}.length`);
      }
      function addEvaluatedFrom(source) {
        var _a;
        if (!it.opts.unevaluated)
          return;
        const schEvaluated = (_a = sch === null || sch === void 0 ? void 0 : sch.validate) === null || _a === void 0 ? void 0 : _a.evaluated;
        if (it.props !== true) {
          if (schEvaluated && !schEvaluated.dynamicProps) {
            if (schEvaluated.props !== void 0) {
              it.props = util_1.mergeEvaluated.props(gen, schEvaluated.props, it.props);
            }
          } else {
            const props = gen.var("props", (0, codegen_1._)`${source}.evaluated.props`);
            it.props = util_1.mergeEvaluated.props(gen, props, it.props, codegen_1.Name);
          }
        }
        if (it.items !== true) {
          if (schEvaluated && !schEvaluated.dynamicItems) {
            if (schEvaluated.items !== void 0) {
              it.items = util_1.mergeEvaluated.items(gen, schEvaluated.items, it.items);
            }
          } else {
            const items = gen.var("items", (0, codegen_1._)`${source}.evaluated.items`);
            it.items = util_1.mergeEvaluated.items(gen, items, it.items, codegen_1.Name);
          }
        }
      }
    }
    exports.callRef = callRef;
    exports.default = def;
  }
});

// node_modules/ajv/dist/vocabularies/core/index.js
var require_core2 = __commonJS({
  "node_modules/ajv/dist/vocabularies/core/index.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var id_1 = require_id();
    var ref_1 = require_ref();
    var core = [
      "$schema",
      "$id",
      "$defs",
      "$vocabulary",
      { keyword: "$comment" },
      "definitions",
      id_1.default,
      ref_1.default
    ];
    exports.default = core;
  }
});

// node_modules/ajv/dist/vocabularies/validation/limitNumber.js
var require_limitNumber = __commonJS({
  "node_modules/ajv/dist/vocabularies/validation/limitNumber.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var codegen_1 = require_codegen();
    var ops = codegen_1.operators;
    var KWDs = {
      maximum: { okStr: "<=", ok: ops.LTE, fail: ops.GT },
      minimum: { okStr: ">=", ok: ops.GTE, fail: ops.LT },
      exclusiveMaximum: { okStr: "<", ok: ops.LT, fail: ops.GTE },
      exclusiveMinimum: { okStr: ">", ok: ops.GT, fail: ops.LTE }
    };
    var error = {
      message: ({ keyword, schemaCode }) => (0, codegen_1.str)`must be ${KWDs[keyword].okStr} ${schemaCode}`,
      params: ({ keyword, schemaCode }) => (0, codegen_1._)`{comparison: ${KWDs[keyword].okStr}, limit: ${schemaCode}}`
    };
    var def = {
      keyword: Object.keys(KWDs),
      type: "number",
      schemaType: "number",
      $data: true,
      error,
      code(cxt) {
        const { keyword, data, schemaCode } = cxt;
        cxt.fail$data((0, codegen_1._)`${data} ${KWDs[keyword].fail} ${schemaCode} || isNaN(${data})`);
      }
    };
    exports.default = def;
  }
});

// node_modules/ajv/dist/vocabularies/validation/multipleOf.js
var require_multipleOf = __commonJS({
  "node_modules/ajv/dist/vocabularies/validation/multipleOf.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var codegen_1 = require_codegen();
    var error = {
      message: ({ schemaCode }) => (0, codegen_1.str)`must be multiple of ${schemaCode}`,
      params: ({ schemaCode }) => (0, codegen_1._)`{multipleOf: ${schemaCode}}`
    };
    var def = {
      keyword: "multipleOf",
      type: "number",
      schemaType: "number",
      $data: true,
      error,
      code(cxt) {
        const { gen, data, schemaCode, it } = cxt;
        const prec = it.opts.multipleOfPrecision;
        const res = gen.let("res");
        const invalid = prec ? (0, codegen_1._)`Math.abs(Math.round(${res}) - ${res}) > 1e-${prec}` : (0, codegen_1._)`${res} !== parseInt(${res})`;
        cxt.fail$data((0, codegen_1._)`(${schemaCode} === 0 || (${res} = ${data}/${schemaCode}, ${invalid}))`);
      }
    };
    exports.default = def;
  }
});

// node_modules/ajv/dist/runtime/ucs2length.js
var require_ucs2length = __commonJS({
  "node_modules/ajv/dist/runtime/ucs2length.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function ucs2length(str) {
      const len = str.length;
      let length = 0;
      let pos = 0;
      let value;
      while (pos < len) {
        length++;
        value = str.charCodeAt(pos++);
        if (value >= 55296 && value <= 56319 && pos < len) {
          value = str.charCodeAt(pos);
          if ((value & 64512) === 56320)
            pos++;
        }
      }
      return length;
    }
    exports.default = ucs2length;
    ucs2length.code = 'require("ajv/dist/runtime/ucs2length").default';
  }
});

// node_modules/ajv/dist/vocabularies/validation/limitLength.js
var require_limitLength = __commonJS({
  "node_modules/ajv/dist/vocabularies/validation/limitLength.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var codegen_1 = require_codegen();
    var util_1 = require_util();
    var ucs2length_1 = require_ucs2length();
    var error = {
      message({ keyword, schemaCode }) {
        const comp = keyword === "maxLength" ? "more" : "fewer";
        return (0, codegen_1.str)`must NOT have ${comp} than ${schemaCode} characters`;
      },
      params: ({ schemaCode }) => (0, codegen_1._)`{limit: ${schemaCode}}`
    };
    var def = {
      keyword: ["maxLength", "minLength"],
      type: "string",
      schemaType: "number",
      $data: true,
      error,
      code(cxt) {
        const { keyword, data, schemaCode, it } = cxt;
        const op = keyword === "maxLength" ? codegen_1.operators.GT : codegen_1.operators.LT;
        const len = it.opts.unicode === false ? (0, codegen_1._)`${data}.length` : (0, codegen_1._)`${(0, util_1.useFunc)(cxt.gen, ucs2length_1.default)}(${data})`;
        cxt.fail$data((0, codegen_1._)`${len} ${op} ${schemaCode}`);
      }
    };
    exports.default = def;
  }
});

// node_modules/ajv/dist/vocabularies/validation/pattern.js
var require_pattern = __commonJS({
  "node_modules/ajv/dist/vocabularies/validation/pattern.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var code_1 = require_code2();
    var util_1 = require_util();
    var codegen_1 = require_codegen();
    var error = {
      message: ({ schemaCode }) => (0, codegen_1.str)`must match pattern "${schemaCode}"`,
      params: ({ schemaCode }) => (0, codegen_1._)`{pattern: ${schemaCode}}`
    };
    var def = {
      keyword: "pattern",
      type: "string",
      schemaType: "string",
      $data: true,
      error,
      code(cxt) {
        const { gen, data, $data, schema, schemaCode, it } = cxt;
        const u = it.opts.unicodeRegExp ? "u" : "";
        if ($data) {
          const { regExp } = it.opts.code;
          const regExpCode = regExp.code === "new RegExp" ? (0, codegen_1._)`new RegExp` : (0, util_1.useFunc)(gen, regExp);
          const valid = gen.let("valid");
          gen.try(() => gen.assign(valid, (0, codegen_1._)`${regExpCode}(${schemaCode}, ${u}).test(${data})`), () => gen.assign(valid, false));
          cxt.fail$data((0, codegen_1._)`!${valid}`);
        } else {
          const regExp = (0, code_1.usePattern)(cxt, schema);
          cxt.fail$data((0, codegen_1._)`!${regExp}.test(${data})`);
        }
      }
    };
    exports.default = def;
  }
});

// node_modules/ajv/dist/vocabularies/validation/limitProperties.js
var require_limitProperties = __commonJS({
  "node_modules/ajv/dist/vocabularies/validation/limitProperties.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var codegen_1 = require_codegen();
    var error = {
      message({ keyword, schemaCode }) {
        const comp = keyword === "maxProperties" ? "more" : "fewer";
        return (0, codegen_1.str)`must NOT have ${comp} than ${schemaCode} properties`;
      },
      params: ({ schemaCode }) => (0, codegen_1._)`{limit: ${schemaCode}}`
    };
    var def = {
      keyword: ["maxProperties", "minProperties"],
      type: "object",
      schemaType: "number",
      $data: true,
      error,
      code(cxt) {
        const { keyword, data, schemaCode } = cxt;
        const op = keyword === "maxProperties" ? codegen_1.operators.GT : codegen_1.operators.LT;
        cxt.fail$data((0, codegen_1._)`Object.keys(${data}).length ${op} ${schemaCode}`);
      }
    };
    exports.default = def;
  }
});

// node_modules/ajv/dist/vocabularies/validation/required.js
var require_required = __commonJS({
  "node_modules/ajv/dist/vocabularies/validation/required.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var code_1 = require_code2();
    var codegen_1 = require_codegen();
    var util_1 = require_util();
    var error = {
      message: ({ params: { missingProperty } }) => (0, codegen_1.str)`must have required property '${missingProperty}'`,
      params: ({ params: { missingProperty } }) => (0, codegen_1._)`{missingProperty: ${missingProperty}}`
    };
    var def = {
      keyword: "required",
      type: "object",
      schemaType: "array",
      $data: true,
      error,
      code(cxt) {
        const { gen, schema, schemaCode, data, $data, it } = cxt;
        const { opts } = it;
        if (!$data && schema.length === 0)
          return;
        const useLoop = schema.length >= opts.loopRequired;
        if (it.allErrors)
          allErrorsMode();
        else
          exitOnErrorMode();
        if (opts.strictRequired) {
          const props = cxt.parentSchema.properties;
          const { definedProperties } = cxt.it;
          for (const requiredKey of schema) {
            if ((props === null || props === void 0 ? void 0 : props[requiredKey]) === void 0 && !definedProperties.has(requiredKey)) {
              const schemaPath = it.schemaEnv.baseId + it.errSchemaPath;
              const msg = `required property "${requiredKey}" is not defined at "${schemaPath}" (strictRequired)`;
              (0, util_1.checkStrictMode)(it, msg, it.opts.strictRequired);
            }
          }
        }
        function allErrorsMode() {
          if (useLoop || $data) {
            cxt.block$data(codegen_1.nil, loopAllRequired);
          } else {
            for (const prop of schema) {
              (0, code_1.checkReportMissingProp)(cxt, prop);
            }
          }
        }
        function exitOnErrorMode() {
          const missing = gen.let("missing");
          if (useLoop || $data) {
            const valid = gen.let("valid", true);
            cxt.block$data(valid, () => loopUntilMissing(missing, valid));
            cxt.ok(valid);
          } else {
            gen.if((0, code_1.checkMissingProp)(cxt, schema, missing));
            (0, code_1.reportMissingProp)(cxt, missing);
            gen.else();
          }
        }
        function loopAllRequired() {
          gen.forOf("prop", schemaCode, (prop) => {
            cxt.setParams({ missingProperty: prop });
            gen.if((0, code_1.noPropertyInData)(gen, data, prop, opts.ownProperties), () => cxt.error());
          });
        }
        function loopUntilMissing(missing, valid) {
          cxt.setParams({ missingProperty: missing });
          gen.forOf(missing, schemaCode, () => {
            gen.assign(valid, (0, code_1.propertyInData)(gen, data, missing, opts.ownProperties));
            gen.if((0, codegen_1.not)(valid), () => {
              cxt.error();
              gen.break();
            });
          }, codegen_1.nil);
        }
      }
    };
    exports.default = def;
  }
});

// node_modules/ajv/dist/vocabularies/validation/limitItems.js
var require_limitItems = __commonJS({
  "node_modules/ajv/dist/vocabularies/validation/limitItems.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var codegen_1 = require_codegen();
    var error = {
      message({ keyword, schemaCode }) {
        const comp = keyword === "maxItems" ? "more" : "fewer";
        return (0, codegen_1.str)`must NOT have ${comp} than ${schemaCode} items`;
      },
      params: ({ schemaCode }) => (0, codegen_1._)`{limit: ${schemaCode}}`
    };
    var def = {
      keyword: ["maxItems", "minItems"],
      type: "array",
      schemaType: "number",
      $data: true,
      error,
      code(cxt) {
        const { keyword, data, schemaCode } = cxt;
        const op = keyword === "maxItems" ? codegen_1.operators.GT : codegen_1.operators.LT;
        cxt.fail$data((0, codegen_1._)`${data}.length ${op} ${schemaCode}`);
      }
    };
    exports.default = def;
  }
});

// node_modules/ajv/dist/runtime/equal.js
var require_equal = __commonJS({
  "node_modules/ajv/dist/runtime/equal.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var equal = require_fast_deep_equal();
    equal.code = 'require("ajv/dist/runtime/equal").default';
    exports.default = equal;
  }
});

// node_modules/ajv/dist/vocabularies/validation/uniqueItems.js
var require_uniqueItems = __commonJS({
  "node_modules/ajv/dist/vocabularies/validation/uniqueItems.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var dataType_1 = require_dataType();
    var codegen_1 = require_codegen();
    var util_1 = require_util();
    var equal_1 = require_equal();
    var error = {
      message: ({ params: { i, j } }) => (0, codegen_1.str)`must NOT have duplicate items (items ## ${j} and ${i} are identical)`,
      params: ({ params: { i, j } }) => (0, codegen_1._)`{i: ${i}, j: ${j}}`
    };
    var def = {
      keyword: "uniqueItems",
      type: "array",
      schemaType: "boolean",
      $data: true,
      error,
      code(cxt) {
        const { gen, data, $data, schema, parentSchema, schemaCode, it } = cxt;
        if (!$data && !schema)
          return;
        const valid = gen.let("valid");
        const itemTypes = parentSchema.items ? (0, dataType_1.getSchemaTypes)(parentSchema.items) : [];
        cxt.block$data(valid, validateUniqueItems, (0, codegen_1._)`${schemaCode} === false`);
        cxt.ok(valid);
        function validateUniqueItems() {
          const i = gen.let("i", (0, codegen_1._)`${data}.length`);
          const j = gen.let("j");
          cxt.setParams({ i, j });
          gen.assign(valid, true);
          gen.if((0, codegen_1._)`${i} > 1`, () => (canOptimize() ? loopN : loopN2)(i, j));
        }
        function canOptimize() {
          return itemTypes.length > 0 && !itemTypes.some((t) => t === "object" || t === "array");
        }
        function loopN(i, j) {
          const item = gen.name("item");
          const wrongType = (0, dataType_1.checkDataTypes)(itemTypes, item, it.opts.strictNumbers, dataType_1.DataType.Wrong);
          const indices = gen.const("indices", (0, codegen_1._)`{}`);
          gen.for((0, codegen_1._)`;${i}--;`, () => {
            gen.let(item, (0, codegen_1._)`${data}[${i}]`);
            gen.if(wrongType, (0, codegen_1._)`continue`);
            if (itemTypes.length > 1)
              gen.if((0, codegen_1._)`typeof ${item} == "string"`, (0, codegen_1._)`${item} += "_"`);
            gen.if((0, codegen_1._)`typeof ${indices}[${item}] == "number"`, () => {
              gen.assign(j, (0, codegen_1._)`${indices}[${item}]`);
              cxt.error();
              gen.assign(valid, false).break();
            }).code((0, codegen_1._)`${indices}[${item}] = ${i}`);
          });
        }
        function loopN2(i, j) {
          const eql = (0, util_1.useFunc)(gen, equal_1.default);
          const outer = gen.name("outer");
          gen.label(outer).for((0, codegen_1._)`;${i}--;`, () => gen.for((0, codegen_1._)`${j} = ${i}; ${j}--;`, () => gen.if((0, codegen_1._)`${eql}(${data}[${i}], ${data}[${j}])`, () => {
            cxt.error();
            gen.assign(valid, false).break(outer);
          })));
        }
      }
    };
    exports.default = def;
  }
});

// node_modules/ajv/dist/vocabularies/validation/const.js
var require_const = __commonJS({
  "node_modules/ajv/dist/vocabularies/validation/const.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var codegen_1 = require_codegen();
    var util_1 = require_util();
    var equal_1 = require_equal();
    var error = {
      message: "must be equal to constant",
      params: ({ schemaCode }) => (0, codegen_1._)`{allowedValue: ${schemaCode}}`
    };
    var def = {
      keyword: "const",
      $data: true,
      error,
      code(cxt) {
        const { gen, data, $data, schemaCode, schema } = cxt;
        if ($data || schema && typeof schema == "object") {
          cxt.fail$data((0, codegen_1._)`!${(0, util_1.useFunc)(gen, equal_1.default)}(${data}, ${schemaCode})`);
        } else {
          cxt.fail((0, codegen_1._)`${schema} !== ${data}`);
        }
      }
    };
    exports.default = def;
  }
});

// node_modules/ajv/dist/vocabularies/validation/enum.js
var require_enum = __commonJS({
  "node_modules/ajv/dist/vocabularies/validation/enum.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var codegen_1 = require_codegen();
    var util_1 = require_util();
    var equal_1 = require_equal();
    var error = {
      message: "must be equal to one of the allowed values",
      params: ({ schemaCode }) => (0, codegen_1._)`{allowedValues: ${schemaCode}}`
    };
    var def = {
      keyword: "enum",
      schemaType: "array",
      $data: true,
      error,
      code(cxt) {
        const { gen, data, $data, schema, schemaCode, it } = cxt;
        if (!$data && schema.length === 0)
          throw new Error("enum must have non-empty array");
        const useLoop = schema.length >= it.opts.loopEnum;
        let eql;
        const getEql = () => eql !== null && eql !== void 0 ? eql : eql = (0, util_1.useFunc)(gen, equal_1.default);
        let valid;
        if (useLoop || $data) {
          valid = gen.let("valid");
          cxt.block$data(valid, loopEnum);
        } else {
          if (!Array.isArray(schema))
            throw new Error("ajv implementation error");
          const vSchema = gen.const("vSchema", schemaCode);
          valid = (0, codegen_1.or)(...schema.map((_x, i) => equalCode(vSchema, i)));
        }
        cxt.pass(valid);
        function loopEnum() {
          gen.assign(valid, false);
          gen.forOf("v", schemaCode, (v) => gen.if((0, codegen_1._)`${getEql()}(${data}, ${v})`, () => gen.assign(valid, true).break()));
        }
        function equalCode(vSchema, i) {
          const sch = schema[i];
          return typeof sch === "object" && sch !== null ? (0, codegen_1._)`${getEql()}(${data}, ${vSchema}[${i}])` : (0, codegen_1._)`${data} === ${sch}`;
        }
      }
    };
    exports.default = def;
  }
});

// node_modules/ajv/dist/vocabularies/validation/index.js
var require_validation = __commonJS({
  "node_modules/ajv/dist/vocabularies/validation/index.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var limitNumber_1 = require_limitNumber();
    var multipleOf_1 = require_multipleOf();
    var limitLength_1 = require_limitLength();
    var pattern_1 = require_pattern();
    var limitProperties_1 = require_limitProperties();
    var required_1 = require_required();
    var limitItems_1 = require_limitItems();
    var uniqueItems_1 = require_uniqueItems();
    var const_1 = require_const();
    var enum_1 = require_enum();
    var validation = [
      // number
      limitNumber_1.default,
      multipleOf_1.default,
      // string
      limitLength_1.default,
      pattern_1.default,
      // object
      limitProperties_1.default,
      required_1.default,
      // array
      limitItems_1.default,
      uniqueItems_1.default,
      // any
      { keyword: "type", schemaType: ["string", "array"] },
      { keyword: "nullable", schemaType: "boolean" },
      const_1.default,
      enum_1.default
    ];
    exports.default = validation;
  }
});

// node_modules/ajv/dist/vocabularies/applicator/additionalItems.js
var require_additionalItems = __commonJS({
  "node_modules/ajv/dist/vocabularies/applicator/additionalItems.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.validateAdditionalItems = void 0;
    var codegen_1 = require_codegen();
    var util_1 = require_util();
    var error = {
      message: ({ params: { len } }) => (0, codegen_1.str)`must NOT have more than ${len} items`,
      params: ({ params: { len } }) => (0, codegen_1._)`{limit: ${len}}`
    };
    var def = {
      keyword: "additionalItems",
      type: "array",
      schemaType: ["boolean", "object"],
      before: "uniqueItems",
      error,
      code(cxt) {
        const { parentSchema, it } = cxt;
        const { items } = parentSchema;
        if (!Array.isArray(items)) {
          (0, util_1.checkStrictMode)(it, '"additionalItems" is ignored when "items" is not an array of schemas');
          return;
        }
        validateAdditionalItems(cxt, items);
      }
    };
    function validateAdditionalItems(cxt, items) {
      const { gen, schema, data, keyword, it } = cxt;
      it.items = true;
      const len = gen.const("len", (0, codegen_1._)`${data}.length`);
      if (schema === false) {
        cxt.setParams({ len: items.length });
        cxt.pass((0, codegen_1._)`${len} <= ${items.length}`);
      } else if (typeof schema == "object" && !(0, util_1.alwaysValidSchema)(it, schema)) {
        const valid = gen.var("valid", (0, codegen_1._)`${len} <= ${items.length}`);
        gen.if((0, codegen_1.not)(valid), () => validateItems(valid));
        cxt.ok(valid);
      }
      function validateItems(valid) {
        gen.forRange("i", items.length, len, (i) => {
          cxt.subschema({ keyword, dataProp: i, dataPropType: util_1.Type.Num }, valid);
          if (!it.allErrors)
            gen.if((0, codegen_1.not)(valid), () => gen.break());
        });
      }
    }
    exports.validateAdditionalItems = validateAdditionalItems;
    exports.default = def;
  }
});

// node_modules/ajv/dist/vocabularies/applicator/items.js
var require_items = __commonJS({
  "node_modules/ajv/dist/vocabularies/applicator/items.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.validateTuple = void 0;
    var codegen_1 = require_codegen();
    var util_1 = require_util();
    var code_1 = require_code2();
    var def = {
      keyword: "items",
      type: "array",
      schemaType: ["object", "array", "boolean"],
      before: "uniqueItems",
      code(cxt) {
        const { schema, it } = cxt;
        if (Array.isArray(schema))
          return validateTuple(cxt, "additionalItems", schema);
        it.items = true;
        if ((0, util_1.alwaysValidSchema)(it, schema))
          return;
        cxt.ok((0, code_1.validateArray)(cxt));
      }
    };
    function validateTuple(cxt, extraItems, schArr = cxt.schema) {
      const { gen, parentSchema, data, keyword, it } = cxt;
      checkStrictTuple(parentSchema);
      if (it.opts.unevaluated && schArr.length && it.items !== true) {
        it.items = util_1.mergeEvaluated.items(gen, schArr.length, it.items);
      }
      const valid = gen.name("valid");
      const len = gen.const("len", (0, codegen_1._)`${data}.length`);
      schArr.forEach((sch, i) => {
        if ((0, util_1.alwaysValidSchema)(it, sch))
          return;
        gen.if((0, codegen_1._)`${len} > ${i}`, () => cxt.subschema({
          keyword,
          schemaProp: i,
          dataProp: i
        }, valid));
        cxt.ok(valid);
      });
      function checkStrictTuple(sch) {
        const { opts, errSchemaPath } = it;
        const l = schArr.length;
        const fullTuple = l === sch.minItems && (l === sch.maxItems || sch[extraItems] === false);
        if (opts.strictTuples && !fullTuple) {
          const msg = `"${keyword}" is ${l}-tuple, but minItems or maxItems/${extraItems} are not specified or different at path "${errSchemaPath}"`;
          (0, util_1.checkStrictMode)(it, msg, opts.strictTuples);
        }
      }
    }
    exports.validateTuple = validateTuple;
    exports.default = def;
  }
});

// node_modules/ajv/dist/vocabularies/applicator/prefixItems.js
var require_prefixItems = __commonJS({
  "node_modules/ajv/dist/vocabularies/applicator/prefixItems.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var items_1 = require_items();
    var def = {
      keyword: "prefixItems",
      type: "array",
      schemaType: ["array"],
      before: "uniqueItems",
      code: (cxt) => (0, items_1.validateTuple)(cxt, "items")
    };
    exports.default = def;
  }
});

// node_modules/ajv/dist/vocabularies/applicator/items2020.js
var require_items2020 = __commonJS({
  "node_modules/ajv/dist/vocabularies/applicator/items2020.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var codegen_1 = require_codegen();
    var util_1 = require_util();
    var code_1 = require_code2();
    var additionalItems_1 = require_additionalItems();
    var error = {
      message: ({ params: { len } }) => (0, codegen_1.str)`must NOT have more than ${len} items`,
      params: ({ params: { len } }) => (0, codegen_1._)`{limit: ${len}}`
    };
    var def = {
      keyword: "items",
      type: "array",
      schemaType: ["object", "boolean"],
      before: "uniqueItems",
      error,
      code(cxt) {
        const { schema, parentSchema, it } = cxt;
        const { prefixItems } = parentSchema;
        it.items = true;
        if ((0, util_1.alwaysValidSchema)(it, schema))
          return;
        if (prefixItems)
          (0, additionalItems_1.validateAdditionalItems)(cxt, prefixItems);
        else
          cxt.ok((0, code_1.validateArray)(cxt));
      }
    };
    exports.default = def;
  }
});

// node_modules/ajv/dist/vocabularies/applicator/contains.js
var require_contains = __commonJS({
  "node_modules/ajv/dist/vocabularies/applicator/contains.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var codegen_1 = require_codegen();
    var util_1 = require_util();
    var error = {
      message: ({ params: { min, max } }) => max === void 0 ? (0, codegen_1.str)`must contain at least ${min} valid item(s)` : (0, codegen_1.str)`must contain at least ${min} and no more than ${max} valid item(s)`,
      params: ({ params: { min, max } }) => max === void 0 ? (0, codegen_1._)`{minContains: ${min}}` : (0, codegen_1._)`{minContains: ${min}, maxContains: ${max}}`
    };
    var def = {
      keyword: "contains",
      type: "array",
      schemaType: ["object", "boolean"],
      before: "uniqueItems",
      trackErrors: true,
      error,
      code(cxt) {
        const { gen, schema, parentSchema, data, it } = cxt;
        let min;
        let max;
        const { minContains, maxContains } = parentSchema;
        if (it.opts.next) {
          min = minContains === void 0 ? 1 : minContains;
          max = maxContains;
        } else {
          min = 1;
        }
        const len = gen.const("len", (0, codegen_1._)`${data}.length`);
        cxt.setParams({ min, max });
        if (max === void 0 && min === 0) {
          (0, util_1.checkStrictMode)(it, `"minContains" == 0 without "maxContains": "contains" keyword ignored`);
          return;
        }
        if (max !== void 0 && min > max) {
          (0, util_1.checkStrictMode)(it, `"minContains" > "maxContains" is always invalid`);
          cxt.fail();
          return;
        }
        if ((0, util_1.alwaysValidSchema)(it, schema)) {
          let cond = (0, codegen_1._)`${len} >= ${min}`;
          if (max !== void 0)
            cond = (0, codegen_1._)`${cond} && ${len} <= ${max}`;
          cxt.pass(cond);
          return;
        }
        it.items = true;
        const valid = gen.name("valid");
        if (max === void 0 && min === 1) {
          validateItems(valid, () => gen.if(valid, () => gen.break()));
        } else if (min === 0) {
          gen.let(valid, true);
          if (max !== void 0)
            gen.if((0, codegen_1._)`${data}.length > 0`, validateItemsWithCount);
        } else {
          gen.let(valid, false);
          validateItemsWithCount();
        }
        cxt.result(valid, () => cxt.reset());
        function validateItemsWithCount() {
          const schValid = gen.name("_valid");
          const count = gen.let("count", 0);
          validateItems(schValid, () => gen.if(schValid, () => checkLimits(count)));
        }
        function validateItems(_valid, block) {
          gen.forRange("i", 0, len, (i) => {
            cxt.subschema({
              keyword: "contains",
              dataProp: i,
              dataPropType: util_1.Type.Num,
              compositeRule: true
            }, _valid);
            block();
          });
        }
        function checkLimits(count) {
          gen.code((0, codegen_1._)`${count}++`);
          if (max === void 0) {
            gen.if((0, codegen_1._)`${count} >= ${min}`, () => gen.assign(valid, true).break());
          } else {
            gen.if((0, codegen_1._)`${count} > ${max}`, () => gen.assign(valid, false).break());
            if (min === 1)
              gen.assign(valid, true);
            else
              gen.if((0, codegen_1._)`${count} >= ${min}`, () => gen.assign(valid, true));
          }
        }
      }
    };
    exports.default = def;
  }
});

// node_modules/ajv/dist/vocabularies/applicator/dependencies.js
var require_dependencies = __commonJS({
  "node_modules/ajv/dist/vocabularies/applicator/dependencies.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.validateSchemaDeps = exports.validatePropertyDeps = exports.error = void 0;
    var codegen_1 = require_codegen();
    var util_1 = require_util();
    var code_1 = require_code2();
    exports.error = {
      message: ({ params: { property, depsCount, deps } }) => {
        const property_ies = depsCount === 1 ? "property" : "properties";
        return (0, codegen_1.str)`must have ${property_ies} ${deps} when property ${property} is present`;
      },
      params: ({ params: { property, depsCount, deps, missingProperty } }) => (0, codegen_1._)`{property: ${property},
    missingProperty: ${missingProperty},
    depsCount: ${depsCount},
    deps: ${deps}}`
      // TODO change to reference
    };
    var def = {
      keyword: "dependencies",
      type: "object",
      schemaType: "object",
      error: exports.error,
      code(cxt) {
        const [propDeps, schDeps] = splitDependencies(cxt);
        validatePropertyDeps(cxt, propDeps);
        validateSchemaDeps(cxt, schDeps);
      }
    };
    function splitDependencies({ schema }) {
      const propertyDeps = {};
      const schemaDeps = {};
      for (const key in schema) {
        if (key === "__proto__")
          continue;
        const deps = Array.isArray(schema[key]) ? propertyDeps : schemaDeps;
        deps[key] = schema[key];
      }
      return [propertyDeps, schemaDeps];
    }
    function validatePropertyDeps(cxt, propertyDeps = cxt.schema) {
      const { gen, data, it } = cxt;
      if (Object.keys(propertyDeps).length === 0)
        return;
      const missing = gen.let("missing");
      for (const prop in propertyDeps) {
        const deps = propertyDeps[prop];
        if (deps.length === 0)
          continue;
        const hasProperty = (0, code_1.propertyInData)(gen, data, prop, it.opts.ownProperties);
        cxt.setParams({
          property: prop,
          depsCount: deps.length,
          deps: deps.join(", ")
        });
        if (it.allErrors) {
          gen.if(hasProperty, () => {
            for (const depProp of deps) {
              (0, code_1.checkReportMissingProp)(cxt, depProp);
            }
          });
        } else {
          gen.if((0, codegen_1._)`${hasProperty} && (${(0, code_1.checkMissingProp)(cxt, deps, missing)})`);
          (0, code_1.reportMissingProp)(cxt, missing);
          gen.else();
        }
      }
    }
    exports.validatePropertyDeps = validatePropertyDeps;
    function validateSchemaDeps(cxt, schemaDeps = cxt.schema) {
      const { gen, data, keyword, it } = cxt;
      const valid = gen.name("valid");
      for (const prop in schemaDeps) {
        if ((0, util_1.alwaysValidSchema)(it, schemaDeps[prop]))
          continue;
        gen.if(
          (0, code_1.propertyInData)(gen, data, prop, it.opts.ownProperties),
          () => {
            const schCxt = cxt.subschema({ keyword, schemaProp: prop }, valid);
            cxt.mergeValidEvaluated(schCxt, valid);
          },
          () => gen.var(valid, true)
          // TODO var
        );
        cxt.ok(valid);
      }
    }
    exports.validateSchemaDeps = validateSchemaDeps;
    exports.default = def;
  }
});

// node_modules/ajv/dist/vocabularies/applicator/propertyNames.js
var require_propertyNames = __commonJS({
  "node_modules/ajv/dist/vocabularies/applicator/propertyNames.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var codegen_1 = require_codegen();
    var util_1 = require_util();
    var error = {
      message: "property name must be valid",
      params: ({ params }) => (0, codegen_1._)`{propertyName: ${params.propertyName}}`
    };
    var def = {
      keyword: "propertyNames",
      type: "object",
      schemaType: ["object", "boolean"],
      error,
      code(cxt) {
        const { gen, schema, data, it } = cxt;
        if ((0, util_1.alwaysValidSchema)(it, schema))
          return;
        const valid = gen.name("valid");
        gen.forIn("key", data, (key) => {
          cxt.setParams({ propertyName: key });
          cxt.subschema({
            keyword: "propertyNames",
            data: key,
            dataTypes: ["string"],
            propertyName: key,
            compositeRule: true
          }, valid);
          gen.if((0, codegen_1.not)(valid), () => {
            cxt.error(true);
            if (!it.allErrors)
              gen.break();
          });
        });
        cxt.ok(valid);
      }
    };
    exports.default = def;
  }
});

// node_modules/ajv/dist/vocabularies/applicator/additionalProperties.js
var require_additionalProperties = __commonJS({
  "node_modules/ajv/dist/vocabularies/applicator/additionalProperties.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var code_1 = require_code2();
    var codegen_1 = require_codegen();
    var names_1 = require_names();
    var util_1 = require_util();
    var error = {
      message: "must NOT have additional properties",
      params: ({ params }) => (0, codegen_1._)`{additionalProperty: ${params.additionalProperty}}`
    };
    var def = {
      keyword: "additionalProperties",
      type: ["object"],
      schemaType: ["boolean", "object"],
      allowUndefined: true,
      trackErrors: true,
      error,
      code(cxt) {
        const { gen, schema, parentSchema, data, errsCount, it } = cxt;
        if (!errsCount)
          throw new Error("ajv implementation error");
        const { allErrors, opts } = it;
        it.props = true;
        if (opts.removeAdditional !== "all" && (0, util_1.alwaysValidSchema)(it, schema))
          return;
        const props = (0, code_1.allSchemaProperties)(parentSchema.properties);
        const patProps = (0, code_1.allSchemaProperties)(parentSchema.patternProperties);
        checkAdditionalProperties();
        cxt.ok((0, codegen_1._)`${errsCount} === ${names_1.default.errors}`);
        function checkAdditionalProperties() {
          gen.forIn("key", data, (key) => {
            if (!props.length && !patProps.length)
              additionalPropertyCode(key);
            else
              gen.if(isAdditional(key), () => additionalPropertyCode(key));
          });
        }
        function isAdditional(key) {
          let definedProp;
          if (props.length > 8) {
            const propsSchema = (0, util_1.schemaRefOrVal)(it, parentSchema.properties, "properties");
            definedProp = (0, code_1.isOwnProperty)(gen, propsSchema, key);
          } else if (props.length) {
            definedProp = (0, codegen_1.or)(...props.map((p) => (0, codegen_1._)`${key} === ${p}`));
          } else {
            definedProp = codegen_1.nil;
          }
          if (patProps.length) {
            definedProp = (0, codegen_1.or)(definedProp, ...patProps.map((p) => (0, codegen_1._)`${(0, code_1.usePattern)(cxt, p)}.test(${key})`));
          }
          return (0, codegen_1.not)(definedProp);
        }
        function deleteAdditional(key) {
          gen.code((0, codegen_1._)`delete ${data}[${key}]`);
        }
        function additionalPropertyCode(key) {
          if (opts.removeAdditional === "all" || opts.removeAdditional && schema === false) {
            deleteAdditional(key);
            return;
          }
          if (schema === false) {
            cxt.setParams({ additionalProperty: key });
            cxt.error();
            if (!allErrors)
              gen.break();
            return;
          }
          if (typeof schema == "object" && !(0, util_1.alwaysValidSchema)(it, schema)) {
            const valid = gen.name("valid");
            if (opts.removeAdditional === "failing") {
              applyAdditionalSchema(key, valid, false);
              gen.if((0, codegen_1.not)(valid), () => {
                cxt.reset();
                deleteAdditional(key);
              });
            } else {
              applyAdditionalSchema(key, valid);
              if (!allErrors)
                gen.if((0, codegen_1.not)(valid), () => gen.break());
            }
          }
        }
        function applyAdditionalSchema(key, valid, errors) {
          const subschema = {
            keyword: "additionalProperties",
            dataProp: key,
            dataPropType: util_1.Type.Str
          };
          if (errors === false) {
            Object.assign(subschema, {
              compositeRule: true,
              createErrors: false,
              allErrors: false
            });
          }
          cxt.subschema(subschema, valid);
        }
      }
    };
    exports.default = def;
  }
});

// node_modules/ajv/dist/vocabularies/applicator/properties.js
var require_properties = __commonJS({
  "node_modules/ajv/dist/vocabularies/applicator/properties.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var validate_1 = require_validate();
    var code_1 = require_code2();
    var util_1 = require_util();
    var additionalProperties_1 = require_additionalProperties();
    var def = {
      keyword: "properties",
      type: "object",
      schemaType: "object",
      code(cxt) {
        const { gen, schema, parentSchema, data, it } = cxt;
        if (it.opts.removeAdditional === "all" && parentSchema.additionalProperties === void 0) {
          additionalProperties_1.default.code(new validate_1.KeywordCxt(it, additionalProperties_1.default, "additionalProperties"));
        }
        const allProps = (0, code_1.allSchemaProperties)(schema);
        for (const prop of allProps) {
          it.definedProperties.add(prop);
        }
        if (it.opts.unevaluated && allProps.length && it.props !== true) {
          it.props = util_1.mergeEvaluated.props(gen, (0, util_1.toHash)(allProps), it.props);
        }
        const properties = allProps.filter((p) => !(0, util_1.alwaysValidSchema)(it, schema[p]));
        if (properties.length === 0)
          return;
        const valid = gen.name("valid");
        for (const prop of properties) {
          if (hasDefault(prop)) {
            applyPropertySchema(prop);
          } else {
            gen.if((0, code_1.propertyInData)(gen, data, prop, it.opts.ownProperties));
            applyPropertySchema(prop);
            if (!it.allErrors)
              gen.else().var(valid, true);
            gen.endIf();
          }
          cxt.it.definedProperties.add(prop);
          cxt.ok(valid);
        }
        function hasDefault(prop) {
          return it.opts.useDefaults && !it.compositeRule && schema[prop].default !== void 0;
        }
        function applyPropertySchema(prop) {
          cxt.subschema({
            keyword: "properties",
            schemaProp: prop,
            dataProp: prop
          }, valid);
        }
      }
    };
    exports.default = def;
  }
});

// node_modules/ajv/dist/vocabularies/applicator/patternProperties.js
var require_patternProperties = __commonJS({
  "node_modules/ajv/dist/vocabularies/applicator/patternProperties.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var code_1 = require_code2();
    var codegen_1 = require_codegen();
    var util_1 = require_util();
    var util_2 = require_util();
    var def = {
      keyword: "patternProperties",
      type: "object",
      schemaType: "object",
      code(cxt) {
        const { gen, schema, data, parentSchema, it } = cxt;
        const { opts } = it;
        const patterns = (0, code_1.allSchemaProperties)(schema);
        const alwaysValidPatterns = patterns.filter((p) => (0, util_1.alwaysValidSchema)(it, schema[p]));
        if (patterns.length === 0 || alwaysValidPatterns.length === patterns.length && (!it.opts.unevaluated || it.props === true)) {
          return;
        }
        const checkProperties = opts.strictSchema && !opts.allowMatchingProperties && parentSchema.properties;
        const valid = gen.name("valid");
        if (it.props !== true && !(it.props instanceof codegen_1.Name)) {
          it.props = (0, util_2.evaluatedPropsToName)(gen, it.props);
        }
        const { props } = it;
        validatePatternProperties();
        function validatePatternProperties() {
          for (const pat of patterns) {
            if (checkProperties)
              checkMatchingProperties(pat);
            if (it.allErrors) {
              validateProperties(pat);
            } else {
              gen.var(valid, true);
              validateProperties(pat);
              gen.if(valid);
            }
          }
        }
        function checkMatchingProperties(pat) {
          for (const prop in checkProperties) {
            if (new RegExp(pat).test(prop)) {
              (0, util_1.checkStrictMode)(it, `property ${prop} matches pattern ${pat} (use allowMatchingProperties)`);
            }
          }
        }
        function validateProperties(pat) {
          gen.forIn("key", data, (key) => {
            gen.if((0, codegen_1._)`${(0, code_1.usePattern)(cxt, pat)}.test(${key})`, () => {
              const alwaysValid = alwaysValidPatterns.includes(pat);
              if (!alwaysValid) {
                cxt.subschema({
                  keyword: "patternProperties",
                  schemaProp: pat,
                  dataProp: key,
                  dataPropType: util_2.Type.Str
                }, valid);
              }
              if (it.opts.unevaluated && props !== true) {
                gen.assign((0, codegen_1._)`${props}[${key}]`, true);
              } else if (!alwaysValid && !it.allErrors) {
                gen.if((0, codegen_1.not)(valid), () => gen.break());
              }
            });
          });
        }
      }
    };
    exports.default = def;
  }
});

// node_modules/ajv/dist/vocabularies/applicator/not.js
var require_not = __commonJS({
  "node_modules/ajv/dist/vocabularies/applicator/not.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var util_1 = require_util();
    var def = {
      keyword: "not",
      schemaType: ["object", "boolean"],
      trackErrors: true,
      code(cxt) {
        const { gen, schema, it } = cxt;
        if ((0, util_1.alwaysValidSchema)(it, schema)) {
          cxt.fail();
          return;
        }
        const valid = gen.name("valid");
        cxt.subschema({
          keyword: "not",
          compositeRule: true,
          createErrors: false,
          allErrors: false
        }, valid);
        cxt.failResult(valid, () => cxt.reset(), () => cxt.error());
      },
      error: { message: "must NOT be valid" }
    };
    exports.default = def;
  }
});

// node_modules/ajv/dist/vocabularies/applicator/anyOf.js
var require_anyOf = __commonJS({
  "node_modules/ajv/dist/vocabularies/applicator/anyOf.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var code_1 = require_code2();
    var def = {
      keyword: "anyOf",
      schemaType: "array",
      trackErrors: true,
      code: code_1.validateUnion,
      error: { message: "must match a schema in anyOf" }
    };
    exports.default = def;
  }
});

// node_modules/ajv/dist/vocabularies/applicator/oneOf.js
var require_oneOf = __commonJS({
  "node_modules/ajv/dist/vocabularies/applicator/oneOf.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var codegen_1 = require_codegen();
    var util_1 = require_util();
    var error = {
      message: "must match exactly one schema in oneOf",
      params: ({ params }) => (0, codegen_1._)`{passingSchemas: ${params.passing}}`
    };
    var def = {
      keyword: "oneOf",
      schemaType: "array",
      trackErrors: true,
      error,
      code(cxt) {
        const { gen, schema, parentSchema, it } = cxt;
        if (!Array.isArray(schema))
          throw new Error("ajv implementation error");
        if (it.opts.discriminator && parentSchema.discriminator)
          return;
        const schArr = schema;
        const valid = gen.let("valid", false);
        const passing = gen.let("passing", null);
        const schValid = gen.name("_valid");
        cxt.setParams({ passing });
        gen.block(validateOneOf);
        cxt.result(valid, () => cxt.reset(), () => cxt.error(true));
        function validateOneOf() {
          schArr.forEach((sch, i) => {
            let schCxt;
            if ((0, util_1.alwaysValidSchema)(it, sch)) {
              gen.var(schValid, true);
            } else {
              schCxt = cxt.subschema({
                keyword: "oneOf",
                schemaProp: i,
                compositeRule: true
              }, schValid);
            }
            if (i > 0) {
              gen.if((0, codegen_1._)`${schValid} && ${valid}`).assign(valid, false).assign(passing, (0, codegen_1._)`[${passing}, ${i}]`).else();
            }
            gen.if(schValid, () => {
              gen.assign(valid, true);
              gen.assign(passing, i);
              if (schCxt)
                cxt.mergeEvaluated(schCxt, codegen_1.Name);
            });
          });
        }
      }
    };
    exports.default = def;
  }
});

// node_modules/ajv/dist/vocabularies/applicator/allOf.js
var require_allOf = __commonJS({
  "node_modules/ajv/dist/vocabularies/applicator/allOf.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var util_1 = require_util();
    var def = {
      keyword: "allOf",
      schemaType: "array",
      code(cxt) {
        const { gen, schema, it } = cxt;
        if (!Array.isArray(schema))
          throw new Error("ajv implementation error");
        const valid = gen.name("valid");
        schema.forEach((sch, i) => {
          if ((0, util_1.alwaysValidSchema)(it, sch))
            return;
          const schCxt = cxt.subschema({ keyword: "allOf", schemaProp: i }, valid);
          cxt.ok(valid);
          cxt.mergeEvaluated(schCxt);
        });
      }
    };
    exports.default = def;
  }
});

// node_modules/ajv/dist/vocabularies/applicator/if.js
var require_if = __commonJS({
  "node_modules/ajv/dist/vocabularies/applicator/if.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var codegen_1 = require_codegen();
    var util_1 = require_util();
    var error = {
      message: ({ params }) => (0, codegen_1.str)`must match "${params.ifClause}" schema`,
      params: ({ params }) => (0, codegen_1._)`{failingKeyword: ${params.ifClause}}`
    };
    var def = {
      keyword: "if",
      schemaType: ["object", "boolean"],
      trackErrors: true,
      error,
      code(cxt) {
        const { gen, parentSchema, it } = cxt;
        if (parentSchema.then === void 0 && parentSchema.else === void 0) {
          (0, util_1.checkStrictMode)(it, '"if" without "then" and "else" is ignored');
        }
        const hasThen = hasSchema(it, "then");
        const hasElse = hasSchema(it, "else");
        if (!hasThen && !hasElse)
          return;
        const valid = gen.let("valid", true);
        const schValid = gen.name("_valid");
        validateIf();
        cxt.reset();
        if (hasThen && hasElse) {
          const ifClause = gen.let("ifClause");
          cxt.setParams({ ifClause });
          gen.if(schValid, validateClause("then", ifClause), validateClause("else", ifClause));
        } else if (hasThen) {
          gen.if(schValid, validateClause("then"));
        } else {
          gen.if((0, codegen_1.not)(schValid), validateClause("else"));
        }
        cxt.pass(valid, () => cxt.error(true));
        function validateIf() {
          const schCxt = cxt.subschema({
            keyword: "if",
            compositeRule: true,
            createErrors: false,
            allErrors: false
          }, schValid);
          cxt.mergeEvaluated(schCxt);
        }
        function validateClause(keyword, ifClause) {
          return () => {
            const schCxt = cxt.subschema({ keyword }, schValid);
            gen.assign(valid, schValid);
            cxt.mergeValidEvaluated(schCxt, valid);
            if (ifClause)
              gen.assign(ifClause, (0, codegen_1._)`${keyword}`);
            else
              cxt.setParams({ ifClause: keyword });
          };
        }
      }
    };
    function hasSchema(it, keyword) {
      const schema = it.schema[keyword];
      return schema !== void 0 && !(0, util_1.alwaysValidSchema)(it, schema);
    }
    exports.default = def;
  }
});

// node_modules/ajv/dist/vocabularies/applicator/thenElse.js
var require_thenElse = __commonJS({
  "node_modules/ajv/dist/vocabularies/applicator/thenElse.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var util_1 = require_util();
    var def = {
      keyword: ["then", "else"],
      schemaType: ["object", "boolean"],
      code({ keyword, parentSchema, it }) {
        if (parentSchema.if === void 0)
          (0, util_1.checkStrictMode)(it, `"${keyword}" without "if" is ignored`);
      }
    };
    exports.default = def;
  }
});

// node_modules/ajv/dist/vocabularies/applicator/index.js
var require_applicator = __commonJS({
  "node_modules/ajv/dist/vocabularies/applicator/index.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var additionalItems_1 = require_additionalItems();
    var prefixItems_1 = require_prefixItems();
    var items_1 = require_items();
    var items2020_1 = require_items2020();
    var contains_1 = require_contains();
    var dependencies_1 = require_dependencies();
    var propertyNames_1 = require_propertyNames();
    var additionalProperties_1 = require_additionalProperties();
    var properties_1 = require_properties();
    var patternProperties_1 = require_patternProperties();
    var not_1 = require_not();
    var anyOf_1 = require_anyOf();
    var oneOf_1 = require_oneOf();
    var allOf_1 = require_allOf();
    var if_1 = require_if();
    var thenElse_1 = require_thenElse();
    function getApplicator(draft2020 = false) {
      const applicator = [
        // any
        not_1.default,
        anyOf_1.default,
        oneOf_1.default,
        allOf_1.default,
        if_1.default,
        thenElse_1.default,
        // object
        propertyNames_1.default,
        additionalProperties_1.default,
        dependencies_1.default,
        properties_1.default,
        patternProperties_1.default
      ];
      if (draft2020)
        applicator.push(prefixItems_1.default, items2020_1.default);
      else
        applicator.push(additionalItems_1.default, items_1.default);
      applicator.push(contains_1.default);
      return applicator;
    }
    exports.default = getApplicator;
  }
});

// node_modules/ajv/dist/vocabularies/dynamic/dynamicAnchor.js
var require_dynamicAnchor = __commonJS({
  "node_modules/ajv/dist/vocabularies/dynamic/dynamicAnchor.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.dynamicAnchor = void 0;
    var codegen_1 = require_codegen();
    var names_1 = require_names();
    var compile_1 = require_compile();
    var ref_1 = require_ref();
    var def = {
      keyword: "$dynamicAnchor",
      schemaType: "string",
      code: (cxt) => dynamicAnchor(cxt, cxt.schema)
    };
    function dynamicAnchor(cxt, anchor) {
      const { gen, it } = cxt;
      it.schemaEnv.root.dynamicAnchors[anchor] = true;
      const v = (0, codegen_1._)`${names_1.default.dynamicAnchors}${(0, codegen_1.getProperty)(anchor)}`;
      const validate = it.errSchemaPath === "#" ? it.validateName : _getValidate(cxt);
      gen.if((0, codegen_1._)`!${v}`, () => gen.assign(v, validate));
    }
    exports.dynamicAnchor = dynamicAnchor;
    function _getValidate(cxt) {
      const { schemaEnv, schema, self: self2 } = cxt.it;
      const { root, baseId, localRefs, meta } = schemaEnv.root;
      const { schemaId } = self2.opts;
      const sch = new compile_1.SchemaEnv({ schema, schemaId, root, baseId, localRefs, meta });
      compile_1.compileSchema.call(self2, sch);
      return (0, ref_1.getValidate)(cxt, sch);
    }
    exports.default = def;
  }
});

// node_modules/ajv/dist/vocabularies/dynamic/dynamicRef.js
var require_dynamicRef = __commonJS({
  "node_modules/ajv/dist/vocabularies/dynamic/dynamicRef.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.dynamicRef = void 0;
    var codegen_1 = require_codegen();
    var names_1 = require_names();
    var ref_1 = require_ref();
    var def = {
      keyword: "$dynamicRef",
      schemaType: "string",
      code: (cxt) => dynamicRef(cxt, cxt.schema)
    };
    function dynamicRef(cxt, ref) {
      const { gen, keyword, it } = cxt;
      if (ref[0] !== "#")
        throw new Error(`"${keyword}" only supports hash fragment reference`);
      const anchor = ref.slice(1);
      if (it.allErrors) {
        _dynamicRef();
      } else {
        const valid = gen.let("valid", false);
        _dynamicRef(valid);
        cxt.ok(valid);
      }
      function _dynamicRef(valid) {
        if (it.schemaEnv.root.dynamicAnchors[anchor]) {
          const v = gen.let("_v", (0, codegen_1._)`${names_1.default.dynamicAnchors}${(0, codegen_1.getProperty)(anchor)}`);
          gen.if(v, _callRef(v, valid), _callRef(it.validateName, valid));
        } else {
          _callRef(it.validateName, valid)();
        }
      }
      function _callRef(validate, valid) {
        return valid ? () => gen.block(() => {
          (0, ref_1.callRef)(cxt, validate);
          gen.let(valid, true);
        }) : () => (0, ref_1.callRef)(cxt, validate);
      }
    }
    exports.dynamicRef = dynamicRef;
    exports.default = def;
  }
});

// node_modules/ajv/dist/vocabularies/dynamic/recursiveAnchor.js
var require_recursiveAnchor = __commonJS({
  "node_modules/ajv/dist/vocabularies/dynamic/recursiveAnchor.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var dynamicAnchor_1 = require_dynamicAnchor();
    var util_1 = require_util();
    var def = {
      keyword: "$recursiveAnchor",
      schemaType: "boolean",
      code(cxt) {
        if (cxt.schema)
          (0, dynamicAnchor_1.dynamicAnchor)(cxt, "");
        else
          (0, util_1.checkStrictMode)(cxt.it, "$recursiveAnchor: false is ignored");
      }
    };
    exports.default = def;
  }
});

// node_modules/ajv/dist/vocabularies/dynamic/recursiveRef.js
var require_recursiveRef = __commonJS({
  "node_modules/ajv/dist/vocabularies/dynamic/recursiveRef.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var dynamicRef_1 = require_dynamicRef();
    var def = {
      keyword: "$recursiveRef",
      schemaType: "string",
      code: (cxt) => (0, dynamicRef_1.dynamicRef)(cxt, cxt.schema)
    };
    exports.default = def;
  }
});

// node_modules/ajv/dist/vocabularies/dynamic/index.js
var require_dynamic = __commonJS({
  "node_modules/ajv/dist/vocabularies/dynamic/index.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var dynamicAnchor_1 = require_dynamicAnchor();
    var dynamicRef_1 = require_dynamicRef();
    var recursiveAnchor_1 = require_recursiveAnchor();
    var recursiveRef_1 = require_recursiveRef();
    var dynamic = [dynamicAnchor_1.default, dynamicRef_1.default, recursiveAnchor_1.default, recursiveRef_1.default];
    exports.default = dynamic;
  }
});

// node_modules/ajv/dist/vocabularies/validation/dependentRequired.js
var require_dependentRequired = __commonJS({
  "node_modules/ajv/dist/vocabularies/validation/dependentRequired.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var dependencies_1 = require_dependencies();
    var def = {
      keyword: "dependentRequired",
      type: "object",
      schemaType: "object",
      error: dependencies_1.error,
      code: (cxt) => (0, dependencies_1.validatePropertyDeps)(cxt)
    };
    exports.default = def;
  }
});

// node_modules/ajv/dist/vocabularies/applicator/dependentSchemas.js
var require_dependentSchemas = __commonJS({
  "node_modules/ajv/dist/vocabularies/applicator/dependentSchemas.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var dependencies_1 = require_dependencies();
    var def = {
      keyword: "dependentSchemas",
      type: "object",
      schemaType: "object",
      code: (cxt) => (0, dependencies_1.validateSchemaDeps)(cxt)
    };
    exports.default = def;
  }
});

// node_modules/ajv/dist/vocabularies/validation/limitContains.js
var require_limitContains = __commonJS({
  "node_modules/ajv/dist/vocabularies/validation/limitContains.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var util_1 = require_util();
    var def = {
      keyword: ["maxContains", "minContains"],
      type: "array",
      schemaType: "number",
      code({ keyword, parentSchema, it }) {
        if (parentSchema.contains === void 0) {
          (0, util_1.checkStrictMode)(it, `"${keyword}" without "contains" is ignored`);
        }
      }
    };
    exports.default = def;
  }
});

// node_modules/ajv/dist/vocabularies/next.js
var require_next = __commonJS({
  "node_modules/ajv/dist/vocabularies/next.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var dependentRequired_1 = require_dependentRequired();
    var dependentSchemas_1 = require_dependentSchemas();
    var limitContains_1 = require_limitContains();
    var next = [dependentRequired_1.default, dependentSchemas_1.default, limitContains_1.default];
    exports.default = next;
  }
});

// node_modules/ajv/dist/vocabularies/unevaluated/unevaluatedProperties.js
var require_unevaluatedProperties = __commonJS({
  "node_modules/ajv/dist/vocabularies/unevaluated/unevaluatedProperties.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var codegen_1 = require_codegen();
    var util_1 = require_util();
    var names_1 = require_names();
    var error = {
      message: "must NOT have unevaluated properties",
      params: ({ params }) => (0, codegen_1._)`{unevaluatedProperty: ${params.unevaluatedProperty}}`
    };
    var def = {
      keyword: "unevaluatedProperties",
      type: "object",
      schemaType: ["boolean", "object"],
      trackErrors: true,
      error,
      code(cxt) {
        const { gen, schema, data, errsCount, it } = cxt;
        if (!errsCount)
          throw new Error("ajv implementation error");
        const { allErrors, props } = it;
        if (props instanceof codegen_1.Name) {
          gen.if((0, codegen_1._)`${props} !== true`, () => gen.forIn("key", data, (key) => gen.if(unevaluatedDynamic(props, key), () => unevaluatedPropCode(key))));
        } else if (props !== true) {
          gen.forIn("key", data, (key) => props === void 0 ? unevaluatedPropCode(key) : gen.if(unevaluatedStatic(props, key), () => unevaluatedPropCode(key)));
        }
        it.props = true;
        cxt.ok((0, codegen_1._)`${errsCount} === ${names_1.default.errors}`);
        function unevaluatedPropCode(key) {
          if (schema === false) {
            cxt.setParams({ unevaluatedProperty: key });
            cxt.error();
            if (!allErrors)
              gen.break();
            return;
          }
          if (!(0, util_1.alwaysValidSchema)(it, schema)) {
            const valid = gen.name("valid");
            cxt.subschema({
              keyword: "unevaluatedProperties",
              dataProp: key,
              dataPropType: util_1.Type.Str
            }, valid);
            if (!allErrors)
              gen.if((0, codegen_1.not)(valid), () => gen.break());
          }
        }
        function unevaluatedDynamic(evaluatedProps, key) {
          return (0, codegen_1._)`!${evaluatedProps} || !${evaluatedProps}[${key}]`;
        }
        function unevaluatedStatic(evaluatedProps, key) {
          const ps = [];
          for (const p in evaluatedProps) {
            if (evaluatedProps[p] === true)
              ps.push((0, codegen_1._)`${key} !== ${p}`);
          }
          return (0, codegen_1.and)(...ps);
        }
      }
    };
    exports.default = def;
  }
});

// node_modules/ajv/dist/vocabularies/unevaluated/unevaluatedItems.js
var require_unevaluatedItems = __commonJS({
  "node_modules/ajv/dist/vocabularies/unevaluated/unevaluatedItems.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var codegen_1 = require_codegen();
    var util_1 = require_util();
    var error = {
      message: ({ params: { len } }) => (0, codegen_1.str)`must NOT have more than ${len} items`,
      params: ({ params: { len } }) => (0, codegen_1._)`{limit: ${len}}`
    };
    var def = {
      keyword: "unevaluatedItems",
      type: "array",
      schemaType: ["boolean", "object"],
      error,
      code(cxt) {
        const { gen, schema, data, it } = cxt;
        const items = it.items || 0;
        if (items === true)
          return;
        const len = gen.const("len", (0, codegen_1._)`${data}.length`);
        if (schema === false) {
          cxt.setParams({ len: items });
          cxt.fail((0, codegen_1._)`${len} > ${items}`);
        } else if (typeof schema == "object" && !(0, util_1.alwaysValidSchema)(it, schema)) {
          const valid = gen.var("valid", (0, codegen_1._)`${len} <= ${items}`);
          gen.if((0, codegen_1.not)(valid), () => validateItems(valid, items));
          cxt.ok(valid);
        }
        it.items = true;
        function validateItems(valid, from) {
          gen.forRange("i", from, len, (i) => {
            cxt.subschema({ keyword: "unevaluatedItems", dataProp: i, dataPropType: util_1.Type.Num }, valid);
            if (!it.allErrors)
              gen.if((0, codegen_1.not)(valid), () => gen.break());
          });
        }
      }
    };
    exports.default = def;
  }
});

// node_modules/ajv/dist/vocabularies/unevaluated/index.js
var require_unevaluated = __commonJS({
  "node_modules/ajv/dist/vocabularies/unevaluated/index.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var unevaluatedProperties_1 = require_unevaluatedProperties();
    var unevaluatedItems_1 = require_unevaluatedItems();
    var unevaluated = [unevaluatedProperties_1.default, unevaluatedItems_1.default];
    exports.default = unevaluated;
  }
});

// node_modules/ajv/dist/vocabularies/format/format.js
var require_format = __commonJS({
  "node_modules/ajv/dist/vocabularies/format/format.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var codegen_1 = require_codegen();
    var error = {
      message: ({ schemaCode }) => (0, codegen_1.str)`must match format "${schemaCode}"`,
      params: ({ schemaCode }) => (0, codegen_1._)`{format: ${schemaCode}}`
    };
    var def = {
      keyword: "format",
      type: ["number", "string"],
      schemaType: "string",
      $data: true,
      error,
      code(cxt, ruleType) {
        const { gen, data, $data, schema, schemaCode, it } = cxt;
        const { opts, errSchemaPath, schemaEnv, self: self2 } = it;
        if (!opts.validateFormats)
          return;
        if ($data)
          validate$DataFormat();
        else
          validateFormat();
        function validate$DataFormat() {
          const fmts = gen.scopeValue("formats", {
            ref: self2.formats,
            code: opts.code.formats
          });
          const fDef = gen.const("fDef", (0, codegen_1._)`${fmts}[${schemaCode}]`);
          const fType = gen.let("fType");
          const format = gen.let("format");
          gen.if((0, codegen_1._)`typeof ${fDef} == "object" && !(${fDef} instanceof RegExp)`, () => gen.assign(fType, (0, codegen_1._)`${fDef}.type || "string"`).assign(format, (0, codegen_1._)`${fDef}.validate`), () => gen.assign(fType, (0, codegen_1._)`"string"`).assign(format, fDef));
          cxt.fail$data((0, codegen_1.or)(unknownFmt(), invalidFmt()));
          function unknownFmt() {
            if (opts.strictSchema === false)
              return codegen_1.nil;
            return (0, codegen_1._)`${schemaCode} && !${format}`;
          }
          function invalidFmt() {
            const callFormat = schemaEnv.$async ? (0, codegen_1._)`(${fDef}.async ? await ${format}(${data}) : ${format}(${data}))` : (0, codegen_1._)`${format}(${data})`;
            const validData = (0, codegen_1._)`(typeof ${format} == "function" ? ${callFormat} : ${format}.test(${data}))`;
            return (0, codegen_1._)`${format} && ${format} !== true && ${fType} === ${ruleType} && !${validData}`;
          }
        }
        function validateFormat() {
          const formatDef = self2.formats[schema];
          if (!formatDef) {
            unknownFormat();
            return;
          }
          if (formatDef === true)
            return;
          const [fmtType, format, fmtRef] = getFormat(formatDef);
          if (fmtType === ruleType)
            cxt.pass(validCondition());
          function unknownFormat() {
            if (opts.strictSchema === false) {
              self2.logger.warn(unknownMsg());
              return;
            }
            throw new Error(unknownMsg());
            function unknownMsg() {
              return `unknown format "${schema}" ignored in schema at path "${errSchemaPath}"`;
            }
          }
          function getFormat(fmtDef) {
            const code = fmtDef instanceof RegExp ? (0, codegen_1.regexpCode)(fmtDef) : opts.code.formats ? (0, codegen_1._)`${opts.code.formats}${(0, codegen_1.getProperty)(schema)}` : void 0;
            const fmt = gen.scopeValue("formats", { key: schema, ref: fmtDef, code });
            if (typeof fmtDef == "object" && !(fmtDef instanceof RegExp)) {
              return [fmtDef.type || "string", fmtDef.validate, (0, codegen_1._)`${fmt}.validate`];
            }
            return ["string", fmtDef, fmt];
          }
          function validCondition() {
            if (typeof formatDef == "object" && !(formatDef instanceof RegExp) && formatDef.async) {
              if (!schemaEnv.$async)
                throw new Error("async format in sync schema");
              return (0, codegen_1._)`await ${fmtRef}(${data})`;
            }
            return typeof format == "function" ? (0, codegen_1._)`${fmtRef}(${data})` : (0, codegen_1._)`${fmtRef}.test(${data})`;
          }
        }
      }
    };
    exports.default = def;
  }
});

// node_modules/ajv/dist/vocabularies/format/index.js
var require_format2 = __commonJS({
  "node_modules/ajv/dist/vocabularies/format/index.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var format_1 = require_format();
    var format = [format_1.default];
    exports.default = format;
  }
});

// node_modules/ajv/dist/vocabularies/metadata.js
var require_metadata = __commonJS({
  "node_modules/ajv/dist/vocabularies/metadata.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.contentVocabulary = exports.metadataVocabulary = void 0;
    exports.metadataVocabulary = [
      "title",
      "description",
      "default",
      "deprecated",
      "readOnly",
      "writeOnly",
      "examples"
    ];
    exports.contentVocabulary = [
      "contentMediaType",
      "contentEncoding",
      "contentSchema"
    ];
  }
});

// node_modules/ajv/dist/vocabularies/draft2020.js
var require_draft2020 = __commonJS({
  "node_modules/ajv/dist/vocabularies/draft2020.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var core_1 = require_core2();
    var validation_1 = require_validation();
    var applicator_1 = require_applicator();
    var dynamic_1 = require_dynamic();
    var next_1 = require_next();
    var unevaluated_1 = require_unevaluated();
    var format_1 = require_format2();
    var metadata_1 = require_metadata();
    var draft2020Vocabularies = [
      dynamic_1.default,
      core_1.default,
      validation_1.default,
      (0, applicator_1.default)(true),
      format_1.default,
      metadata_1.metadataVocabulary,
      metadata_1.contentVocabulary,
      next_1.default,
      unevaluated_1.default
    ];
    exports.default = draft2020Vocabularies;
  }
});

// node_modules/ajv/dist/vocabularies/discriminator/types.js
var require_types = __commonJS({
  "node_modules/ajv/dist/vocabularies/discriminator/types.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.DiscrError = void 0;
    var DiscrError;
    (function(DiscrError2) {
      DiscrError2["Tag"] = "tag";
      DiscrError2["Mapping"] = "mapping";
    })(DiscrError || (exports.DiscrError = DiscrError = {}));
  }
});

// node_modules/ajv/dist/vocabularies/discriminator/index.js
var require_discriminator = __commonJS({
  "node_modules/ajv/dist/vocabularies/discriminator/index.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var codegen_1 = require_codegen();
    var types_1 = require_types();
    var compile_1 = require_compile();
    var ref_error_1 = require_ref_error();
    var util_1 = require_util();
    var error = {
      message: ({ params: { discrError, tagName } }) => discrError === types_1.DiscrError.Tag ? `tag "${tagName}" must be string` : `value of tag "${tagName}" must be in oneOf`,
      params: ({ params: { discrError, tag, tagName } }) => (0, codegen_1._)`{error: ${discrError}, tag: ${tagName}, tagValue: ${tag}}`
    };
    var def = {
      keyword: "discriminator",
      type: "object",
      schemaType: "object",
      error,
      code(cxt) {
        const { gen, data, schema, parentSchema, it } = cxt;
        const { oneOf } = parentSchema;
        if (!it.opts.discriminator) {
          throw new Error("discriminator: requires discriminator option");
        }
        const tagName = schema.propertyName;
        if (typeof tagName != "string")
          throw new Error("discriminator: requires propertyName");
        if (schema.mapping)
          throw new Error("discriminator: mapping is not supported");
        if (!oneOf)
          throw new Error("discriminator: requires oneOf keyword");
        const valid = gen.let("valid", false);
        const tag = gen.const("tag", (0, codegen_1._)`${data}${(0, codegen_1.getProperty)(tagName)}`);
        gen.if((0, codegen_1._)`typeof ${tag} == "string"`, () => validateMapping(), () => cxt.error(false, { discrError: types_1.DiscrError.Tag, tag, tagName }));
        cxt.ok(valid);
        function validateMapping() {
          const mapping = getMapping();
          gen.if(false);
          for (const tagValue in mapping) {
            gen.elseIf((0, codegen_1._)`${tag} === ${tagValue}`);
            gen.assign(valid, applyTagSchema(mapping[tagValue]));
          }
          gen.else();
          cxt.error(false, { discrError: types_1.DiscrError.Mapping, tag, tagName });
          gen.endIf();
        }
        function applyTagSchema(schemaProp) {
          const _valid = gen.name("valid");
          const schCxt = cxt.subschema({ keyword: "oneOf", schemaProp }, _valid);
          cxt.mergeEvaluated(schCxt, codegen_1.Name);
          return _valid;
        }
        function getMapping() {
          var _a;
          const oneOfMapping = {};
          const topRequired = hasRequired(parentSchema);
          let tagRequired = true;
          for (let i = 0; i < oneOf.length; i++) {
            let sch = oneOf[i];
            if ((sch === null || sch === void 0 ? void 0 : sch.$ref) && !(0, util_1.schemaHasRulesButRef)(sch, it.self.RULES)) {
              const ref = sch.$ref;
              sch = compile_1.resolveRef.call(it.self, it.schemaEnv.root, it.baseId, ref);
              if (sch instanceof compile_1.SchemaEnv)
                sch = sch.schema;
              if (sch === void 0)
                throw new ref_error_1.default(it.opts.uriResolver, it.baseId, ref);
            }
            const propSch = (_a = sch === null || sch === void 0 ? void 0 : sch.properties) === null || _a === void 0 ? void 0 : _a[tagName];
            if (typeof propSch != "object") {
              throw new Error(`discriminator: oneOf subschemas (or referenced schemas) must have "properties/${tagName}"`);
            }
            tagRequired = tagRequired && (topRequired || hasRequired(sch));
            addMappings(propSch, i);
          }
          if (!tagRequired)
            throw new Error(`discriminator: "${tagName}" must be required`);
          return oneOfMapping;
          function hasRequired({ required }) {
            return Array.isArray(required) && required.includes(tagName);
          }
          function addMappings(sch, i) {
            if (sch.const) {
              addMapping(sch.const, i);
            } else if (sch.enum) {
              for (const tagValue of sch.enum) {
                addMapping(tagValue, i);
              }
            } else {
              throw new Error(`discriminator: "properties/${tagName}" must have "const" or "enum"`);
            }
          }
          function addMapping(tagValue, i) {
            if (typeof tagValue != "string" || tagValue in oneOfMapping) {
              throw new Error(`discriminator: "${tagName}" values must be unique strings`);
            }
            oneOfMapping[tagValue] = i;
          }
        }
      }
    };
    exports.default = def;
  }
});

// node_modules/ajv/dist/refs/json-schema-2020-12/schema.json
var require_schema = __commonJS({
  "node_modules/ajv/dist/refs/json-schema-2020-12/schema.json"(exports, module) {
    module.exports = {
      $schema: "https://json-schema.org/draft/2020-12/schema",
      $id: "https://json-schema.org/draft/2020-12/schema",
      $vocabulary: {
        "https://json-schema.org/draft/2020-12/vocab/core": true,
        "https://json-schema.org/draft/2020-12/vocab/applicator": true,
        "https://json-schema.org/draft/2020-12/vocab/unevaluated": true,
        "https://json-schema.org/draft/2020-12/vocab/validation": true,
        "https://json-schema.org/draft/2020-12/vocab/meta-data": true,
        "https://json-schema.org/draft/2020-12/vocab/format-annotation": true,
        "https://json-schema.org/draft/2020-12/vocab/content": true
      },
      $dynamicAnchor: "meta",
      title: "Core and Validation specifications meta-schema",
      allOf: [
        { $ref: "meta/core" },
        { $ref: "meta/applicator" },
        { $ref: "meta/unevaluated" },
        { $ref: "meta/validation" },
        { $ref: "meta/meta-data" },
        { $ref: "meta/format-annotation" },
        { $ref: "meta/content" }
      ],
      type: ["object", "boolean"],
      $comment: "This meta-schema also defines keywords that have appeared in previous drafts in order to prevent incompatible extensions as they remain in common use.",
      properties: {
        definitions: {
          $comment: '"definitions" has been replaced by "$defs".',
          type: "object",
          additionalProperties: { $dynamicRef: "#meta" },
          deprecated: true,
          default: {}
        },
        dependencies: {
          $comment: '"dependencies" has been split and replaced by "dependentSchemas" and "dependentRequired" in order to serve their differing semantics.',
          type: "object",
          additionalProperties: {
            anyOf: [{ $dynamicRef: "#meta" }, { $ref: "meta/validation#/$defs/stringArray" }]
          },
          deprecated: true,
          default: {}
        },
        $recursiveAnchor: {
          $comment: '"$recursiveAnchor" has been replaced by "$dynamicAnchor".',
          $ref: "meta/core#/$defs/anchorString",
          deprecated: true
        },
        $recursiveRef: {
          $comment: '"$recursiveRef" has been replaced by "$dynamicRef".',
          $ref: "meta/core#/$defs/uriReferenceString",
          deprecated: true
        }
      }
    };
  }
});

// node_modules/ajv/dist/refs/json-schema-2020-12/meta/applicator.json
var require_applicator2 = __commonJS({
  "node_modules/ajv/dist/refs/json-schema-2020-12/meta/applicator.json"(exports, module) {
    module.exports = {
      $schema: "https://json-schema.org/draft/2020-12/schema",
      $id: "https://json-schema.org/draft/2020-12/meta/applicator",
      $vocabulary: {
        "https://json-schema.org/draft/2020-12/vocab/applicator": true
      },
      $dynamicAnchor: "meta",
      title: "Applicator vocabulary meta-schema",
      type: ["object", "boolean"],
      properties: {
        prefixItems: { $ref: "#/$defs/schemaArray" },
        items: { $dynamicRef: "#meta" },
        contains: { $dynamicRef: "#meta" },
        additionalProperties: { $dynamicRef: "#meta" },
        properties: {
          type: "object",
          additionalProperties: { $dynamicRef: "#meta" },
          default: {}
        },
        patternProperties: {
          type: "object",
          additionalProperties: { $dynamicRef: "#meta" },
          propertyNames: { format: "regex" },
          default: {}
        },
        dependentSchemas: {
          type: "object",
          additionalProperties: { $dynamicRef: "#meta" },
          default: {}
        },
        propertyNames: { $dynamicRef: "#meta" },
        if: { $dynamicRef: "#meta" },
        then: { $dynamicRef: "#meta" },
        else: { $dynamicRef: "#meta" },
        allOf: { $ref: "#/$defs/schemaArray" },
        anyOf: { $ref: "#/$defs/schemaArray" },
        oneOf: { $ref: "#/$defs/schemaArray" },
        not: { $dynamicRef: "#meta" }
      },
      $defs: {
        schemaArray: {
          type: "array",
          minItems: 1,
          items: { $dynamicRef: "#meta" }
        }
      }
    };
  }
});

// node_modules/ajv/dist/refs/json-schema-2020-12/meta/unevaluated.json
var require_unevaluated2 = __commonJS({
  "node_modules/ajv/dist/refs/json-schema-2020-12/meta/unevaluated.json"(exports, module) {
    module.exports = {
      $schema: "https://json-schema.org/draft/2020-12/schema",
      $id: "https://json-schema.org/draft/2020-12/meta/unevaluated",
      $vocabulary: {
        "https://json-schema.org/draft/2020-12/vocab/unevaluated": true
      },
      $dynamicAnchor: "meta",
      title: "Unevaluated applicator vocabulary meta-schema",
      type: ["object", "boolean"],
      properties: {
        unevaluatedItems: { $dynamicRef: "#meta" },
        unevaluatedProperties: { $dynamicRef: "#meta" }
      }
    };
  }
});

// node_modules/ajv/dist/refs/json-schema-2020-12/meta/content.json
var require_content = __commonJS({
  "node_modules/ajv/dist/refs/json-schema-2020-12/meta/content.json"(exports, module) {
    module.exports = {
      $schema: "https://json-schema.org/draft/2020-12/schema",
      $id: "https://json-schema.org/draft/2020-12/meta/content",
      $vocabulary: {
        "https://json-schema.org/draft/2020-12/vocab/content": true
      },
      $dynamicAnchor: "meta",
      title: "Content vocabulary meta-schema",
      type: ["object", "boolean"],
      properties: {
        contentEncoding: { type: "string" },
        contentMediaType: { type: "string" },
        contentSchema: { $dynamicRef: "#meta" }
      }
    };
  }
});

// node_modules/ajv/dist/refs/json-schema-2020-12/meta/core.json
var require_core3 = __commonJS({
  "node_modules/ajv/dist/refs/json-schema-2020-12/meta/core.json"(exports, module) {
    module.exports = {
      $schema: "https://json-schema.org/draft/2020-12/schema",
      $id: "https://json-schema.org/draft/2020-12/meta/core",
      $vocabulary: {
        "https://json-schema.org/draft/2020-12/vocab/core": true
      },
      $dynamicAnchor: "meta",
      title: "Core vocabulary meta-schema",
      type: ["object", "boolean"],
      properties: {
        $id: {
          $ref: "#/$defs/uriReferenceString",
          $comment: "Non-empty fragments not allowed.",
          pattern: "^[^#]*#?$"
        },
        $schema: { $ref: "#/$defs/uriString" },
        $ref: { $ref: "#/$defs/uriReferenceString" },
        $anchor: { $ref: "#/$defs/anchorString" },
        $dynamicRef: { $ref: "#/$defs/uriReferenceString" },
        $dynamicAnchor: { $ref: "#/$defs/anchorString" },
        $vocabulary: {
          type: "object",
          propertyNames: { $ref: "#/$defs/uriString" },
          additionalProperties: {
            type: "boolean"
          }
        },
        $comment: {
          type: "string"
        },
        $defs: {
          type: "object",
          additionalProperties: { $dynamicRef: "#meta" }
        }
      },
      $defs: {
        anchorString: {
          type: "string",
          pattern: "^[A-Za-z_][-A-Za-z0-9._]*$"
        },
        uriString: {
          type: "string",
          format: "uri"
        },
        uriReferenceString: {
          type: "string",
          format: "uri-reference"
        }
      }
    };
  }
});

// node_modules/ajv/dist/refs/json-schema-2020-12/meta/format-annotation.json
var require_format_annotation = __commonJS({
  "node_modules/ajv/dist/refs/json-schema-2020-12/meta/format-annotation.json"(exports, module) {
    module.exports = {
      $schema: "https://json-schema.org/draft/2020-12/schema",
      $id: "https://json-schema.org/draft/2020-12/meta/format-annotation",
      $vocabulary: {
        "https://json-schema.org/draft/2020-12/vocab/format-annotation": true
      },
      $dynamicAnchor: "meta",
      title: "Format vocabulary meta-schema for annotation results",
      type: ["object", "boolean"],
      properties: {
        format: { type: "string" }
      }
    };
  }
});

// node_modules/ajv/dist/refs/json-schema-2020-12/meta/meta-data.json
var require_meta_data = __commonJS({
  "node_modules/ajv/dist/refs/json-schema-2020-12/meta/meta-data.json"(exports, module) {
    module.exports = {
      $schema: "https://json-schema.org/draft/2020-12/schema",
      $id: "https://json-schema.org/draft/2020-12/meta/meta-data",
      $vocabulary: {
        "https://json-schema.org/draft/2020-12/vocab/meta-data": true
      },
      $dynamicAnchor: "meta",
      title: "Meta-data vocabulary meta-schema",
      type: ["object", "boolean"],
      properties: {
        title: {
          type: "string"
        },
        description: {
          type: "string"
        },
        default: true,
        deprecated: {
          type: "boolean",
          default: false
        },
        readOnly: {
          type: "boolean",
          default: false
        },
        writeOnly: {
          type: "boolean",
          default: false
        },
        examples: {
          type: "array",
          items: true
        }
      }
    };
  }
});

// node_modules/ajv/dist/refs/json-schema-2020-12/meta/validation.json
var require_validation2 = __commonJS({
  "node_modules/ajv/dist/refs/json-schema-2020-12/meta/validation.json"(exports, module) {
    module.exports = {
      $schema: "https://json-schema.org/draft/2020-12/schema",
      $id: "https://json-schema.org/draft/2020-12/meta/validation",
      $vocabulary: {
        "https://json-schema.org/draft/2020-12/vocab/validation": true
      },
      $dynamicAnchor: "meta",
      title: "Validation vocabulary meta-schema",
      type: ["object", "boolean"],
      properties: {
        type: {
          anyOf: [
            { $ref: "#/$defs/simpleTypes" },
            {
              type: "array",
              items: { $ref: "#/$defs/simpleTypes" },
              minItems: 1,
              uniqueItems: true
            }
          ]
        },
        const: true,
        enum: {
          type: "array",
          items: true
        },
        multipleOf: {
          type: "number",
          exclusiveMinimum: 0
        },
        maximum: {
          type: "number"
        },
        exclusiveMaximum: {
          type: "number"
        },
        minimum: {
          type: "number"
        },
        exclusiveMinimum: {
          type: "number"
        },
        maxLength: { $ref: "#/$defs/nonNegativeInteger" },
        minLength: { $ref: "#/$defs/nonNegativeIntegerDefault0" },
        pattern: {
          type: "string",
          format: "regex"
        },
        maxItems: { $ref: "#/$defs/nonNegativeInteger" },
        minItems: { $ref: "#/$defs/nonNegativeIntegerDefault0" },
        uniqueItems: {
          type: "boolean",
          default: false
        },
        maxContains: { $ref: "#/$defs/nonNegativeInteger" },
        minContains: {
          $ref: "#/$defs/nonNegativeInteger",
          default: 1
        },
        maxProperties: { $ref: "#/$defs/nonNegativeInteger" },
        minProperties: { $ref: "#/$defs/nonNegativeIntegerDefault0" },
        required: { $ref: "#/$defs/stringArray" },
        dependentRequired: {
          type: "object",
          additionalProperties: {
            $ref: "#/$defs/stringArray"
          }
        }
      },
      $defs: {
        nonNegativeInteger: {
          type: "integer",
          minimum: 0
        },
        nonNegativeIntegerDefault0: {
          $ref: "#/$defs/nonNegativeInteger",
          default: 0
        },
        simpleTypes: {
          enum: ["array", "boolean", "integer", "null", "number", "object", "string"]
        },
        stringArray: {
          type: "array",
          items: { type: "string" },
          uniqueItems: true,
          default: []
        }
      }
    };
  }
});

// node_modules/ajv/dist/refs/json-schema-2020-12/index.js
var require_json_schema_2020_12 = __commonJS({
  "node_modules/ajv/dist/refs/json-schema-2020-12/index.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var metaSchema = require_schema();
    var applicator = require_applicator2();
    var unevaluated = require_unevaluated2();
    var content = require_content();
    var core = require_core3();
    var format = require_format_annotation();
    var metadata = require_meta_data();
    var validation = require_validation2();
    var META_SUPPORT_DATA = ["/properties"];
    function addMetaSchema2020($data) {
      ;
      [
        metaSchema,
        applicator,
        unevaluated,
        content,
        core,
        with$data(this, format),
        metadata,
        with$data(this, validation)
      ].forEach((sch) => this.addMetaSchema(sch, void 0, false));
      return this;
      function with$data(ajv, sch) {
        return $data ? ajv.$dataMetaSchema(sch, META_SUPPORT_DATA) : sch;
      }
    }
    exports.default = addMetaSchema2020;
  }
});

// node_modules/ajv/dist/2020.js
var require__ = __commonJS({
  "node_modules/ajv/dist/2020.js"(exports, module) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.MissingRefError = exports.ValidationError = exports.CodeGen = exports.Name = exports.nil = exports.stringify = exports.str = exports._ = exports.KeywordCxt = exports.Ajv2020 = void 0;
    var core_1 = require_core();
    var draft2020_1 = require_draft2020();
    var discriminator_1 = require_discriminator();
    var json_schema_2020_12_1 = require_json_schema_2020_12();
    var META_SCHEMA_ID = "https://json-schema.org/draft/2020-12/schema";
    var Ajv2020 = class extends core_1.default {
      constructor(opts = {}) {
        super({
          ...opts,
          dynamicRef: true,
          next: true,
          unevaluated: true
        });
      }
      _addVocabularies() {
        super._addVocabularies();
        draft2020_1.default.forEach((v) => this.addVocabulary(v));
        if (this.opts.discriminator)
          this.addKeyword(discriminator_1.default);
      }
      _addDefaultMetaSchema() {
        super._addDefaultMetaSchema();
        const { $data, meta } = this.opts;
        if (!meta)
          return;
        json_schema_2020_12_1.default.call(this, $data);
        this.refs["http://json-schema.org/schema"] = META_SCHEMA_ID;
      }
      defaultMeta() {
        return this.opts.defaultMeta = super.defaultMeta() || (this.getSchema(META_SCHEMA_ID) ? META_SCHEMA_ID : void 0);
      }
    };
    exports.Ajv2020 = Ajv2020;
    module.exports = exports = Ajv2020;
    module.exports.Ajv2020 = Ajv2020;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = Ajv2020;
    var validate_1 = require_validate();
    Object.defineProperty(exports, "KeywordCxt", { enumerable: true, get: function() {
      return validate_1.KeywordCxt;
    } });
    var codegen_1 = require_codegen();
    Object.defineProperty(exports, "_", { enumerable: true, get: function() {
      return codegen_1._;
    } });
    Object.defineProperty(exports, "str", { enumerable: true, get: function() {
      return codegen_1.str;
    } });
    Object.defineProperty(exports, "stringify", { enumerable: true, get: function() {
      return codegen_1.stringify;
    } });
    Object.defineProperty(exports, "nil", { enumerable: true, get: function() {
      return codegen_1.nil;
    } });
    Object.defineProperty(exports, "Name", { enumerable: true, get: function() {
      return codegen_1.Name;
    } });
    Object.defineProperty(exports, "CodeGen", { enumerable: true, get: function() {
      return codegen_1.CodeGen;
    } });
    var validation_error_1 = require_validation_error();
    Object.defineProperty(exports, "ValidationError", { enumerable: true, get: function() {
      return validation_error_1.default;
    } });
    var ref_error_1 = require_ref_error();
    Object.defineProperty(exports, "MissingRefError", { enumerable: true, get: function() {
      return ref_error_1.default;
    } });
  }
});

// node_modules/class-transformer/cjs/enums/transformation-type.enum.js
var require_transformation_type_enum = __commonJS({
  "node_modules/class-transformer/cjs/enums/transformation-type.enum.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.TransformationType = void 0;
    var TransformationType;
    (function(TransformationType2) {
      TransformationType2[TransformationType2["PLAIN_TO_CLASS"] = 0] = "PLAIN_TO_CLASS";
      TransformationType2[TransformationType2["CLASS_TO_PLAIN"] = 1] = "CLASS_TO_PLAIN";
      TransformationType2[TransformationType2["CLASS_TO_CLASS"] = 2] = "CLASS_TO_CLASS";
    })(TransformationType = exports.TransformationType || (exports.TransformationType = {}));
  }
});

// node_modules/class-transformer/cjs/enums/index.js
var require_enums = __commonJS({
  "node_modules/class-transformer/cjs/enums/index.js"(exports) {
    "use strict";
    var __createBinding = exports && exports.__createBinding || (Object.create ? (function(o, m, k, k2) {
      if (k2 === void 0) k2 = k;
      Object.defineProperty(o, k2, { enumerable: true, get: function() {
        return m[k];
      } });
    }) : (function(o, m, k, k2) {
      if (k2 === void 0) k2 = k;
      o[k2] = m[k];
    }));
    var __exportStar = exports && exports.__exportStar || function(m, exports2) {
      for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports2, p)) __createBinding(exports2, m, p);
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    __exportStar(require_transformation_type_enum(), exports);
  }
});

// node_modules/class-transformer/cjs/MetadataStorage.js
var require_MetadataStorage = __commonJS({
  "node_modules/class-transformer/cjs/MetadataStorage.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.MetadataStorage = void 0;
    var enums_1 = require_enums();
    var MetadataStorage = class {
      constructor() {
        this._typeMetadatas = /* @__PURE__ */ new Map();
        this._transformMetadatas = /* @__PURE__ */ new Map();
        this._exposeMetadatas = /* @__PURE__ */ new Map();
        this._excludeMetadatas = /* @__PURE__ */ new Map();
        this._ancestorsMap = /* @__PURE__ */ new Map();
      }
      // -------------------------------------------------------------------------
      // Adder Methods
      // -------------------------------------------------------------------------
      addTypeMetadata(metadata) {
        if (!this._typeMetadatas.has(metadata.target)) {
          this._typeMetadatas.set(metadata.target, /* @__PURE__ */ new Map());
        }
        this._typeMetadatas.get(metadata.target).set(metadata.propertyName, metadata);
      }
      addTransformMetadata(metadata) {
        if (!this._transformMetadatas.has(metadata.target)) {
          this._transformMetadatas.set(metadata.target, /* @__PURE__ */ new Map());
        }
        if (!this._transformMetadatas.get(metadata.target).has(metadata.propertyName)) {
          this._transformMetadatas.get(metadata.target).set(metadata.propertyName, []);
        }
        this._transformMetadatas.get(metadata.target).get(metadata.propertyName).push(metadata);
      }
      addExposeMetadata(metadata) {
        if (!this._exposeMetadatas.has(metadata.target)) {
          this._exposeMetadatas.set(metadata.target, /* @__PURE__ */ new Map());
        }
        this._exposeMetadatas.get(metadata.target).set(metadata.propertyName, metadata);
      }
      addExcludeMetadata(metadata) {
        if (!this._excludeMetadatas.has(metadata.target)) {
          this._excludeMetadatas.set(metadata.target, /* @__PURE__ */ new Map());
        }
        this._excludeMetadatas.get(metadata.target).set(metadata.propertyName, metadata);
      }
      // -------------------------------------------------------------------------
      // Public Methods
      // -------------------------------------------------------------------------
      findTransformMetadatas(target, propertyName, transformationType) {
        return this.findMetadatas(this._transformMetadatas, target, propertyName).filter((metadata) => {
          if (!metadata.options)
            return true;
          if (metadata.options.toClassOnly === true && metadata.options.toPlainOnly === true)
            return true;
          if (metadata.options.toClassOnly === true) {
            return transformationType === enums_1.TransformationType.CLASS_TO_CLASS || transformationType === enums_1.TransformationType.PLAIN_TO_CLASS;
          }
          if (metadata.options.toPlainOnly === true) {
            return transformationType === enums_1.TransformationType.CLASS_TO_PLAIN;
          }
          return true;
        });
      }
      findExcludeMetadata(target, propertyName) {
        return this.findMetadata(this._excludeMetadatas, target, propertyName);
      }
      findExposeMetadata(target, propertyName) {
        return this.findMetadata(this._exposeMetadatas, target, propertyName);
      }
      findExposeMetadataByCustomName(target, name) {
        return this.getExposedMetadatas(target).find((metadata) => {
          return metadata.options && metadata.options.name === name;
        });
      }
      findTypeMetadata(target, propertyName) {
        return this.findMetadata(this._typeMetadatas, target, propertyName);
      }
      getStrategy(target) {
        const excludeMap = this._excludeMetadatas.get(target);
        const exclude = excludeMap && excludeMap.get(void 0);
        const exposeMap = this._exposeMetadatas.get(target);
        const expose = exposeMap && exposeMap.get(void 0);
        if (exclude && expose || !exclude && !expose)
          return "none";
        return exclude ? "excludeAll" : "exposeAll";
      }
      getExposedMetadatas(target) {
        return this.getMetadata(this._exposeMetadatas, target);
      }
      getExcludedMetadatas(target) {
        return this.getMetadata(this._excludeMetadatas, target);
      }
      getExposedProperties(target, transformationType) {
        return this.getExposedMetadatas(target).filter((metadata) => {
          if (!metadata.options)
            return true;
          if (metadata.options.toClassOnly === true && metadata.options.toPlainOnly === true)
            return true;
          if (metadata.options.toClassOnly === true) {
            return transformationType === enums_1.TransformationType.CLASS_TO_CLASS || transformationType === enums_1.TransformationType.PLAIN_TO_CLASS;
          }
          if (metadata.options.toPlainOnly === true) {
            return transformationType === enums_1.TransformationType.CLASS_TO_PLAIN;
          }
          return true;
        }).map((metadata) => metadata.propertyName);
      }
      getExcludedProperties(target, transformationType) {
        return this.getExcludedMetadatas(target).filter((metadata) => {
          if (!metadata.options)
            return true;
          if (metadata.options.toClassOnly === true && metadata.options.toPlainOnly === true)
            return true;
          if (metadata.options.toClassOnly === true) {
            return transformationType === enums_1.TransformationType.CLASS_TO_CLASS || transformationType === enums_1.TransformationType.PLAIN_TO_CLASS;
          }
          if (metadata.options.toPlainOnly === true) {
            return transformationType === enums_1.TransformationType.CLASS_TO_PLAIN;
          }
          return true;
        }).map((metadata) => metadata.propertyName);
      }
      clear() {
        this._typeMetadatas.clear();
        this._exposeMetadatas.clear();
        this._excludeMetadatas.clear();
        this._ancestorsMap.clear();
      }
      // -------------------------------------------------------------------------
      // Private Methods
      // -------------------------------------------------------------------------
      getMetadata(metadatas, target) {
        const metadataFromTargetMap = metadatas.get(target);
        let metadataFromTarget;
        if (metadataFromTargetMap) {
          metadataFromTarget = Array.from(metadataFromTargetMap.values()).filter((meta) => meta.propertyName !== void 0);
        }
        const metadataFromAncestors = [];
        for (const ancestor of this.getAncestors(target)) {
          const ancestorMetadataMap = metadatas.get(ancestor);
          if (ancestorMetadataMap) {
            const metadataFromAncestor = Array.from(ancestorMetadataMap.values()).filter((meta) => meta.propertyName !== void 0);
            metadataFromAncestors.push(...metadataFromAncestor);
          }
        }
        return metadataFromAncestors.concat(metadataFromTarget || []);
      }
      findMetadata(metadatas, target, propertyName) {
        const metadataFromTargetMap = metadatas.get(target);
        if (metadataFromTargetMap) {
          const metadataFromTarget = metadataFromTargetMap.get(propertyName);
          if (metadataFromTarget) {
            return metadataFromTarget;
          }
        }
        for (const ancestor of this.getAncestors(target)) {
          const ancestorMetadataMap = metadatas.get(ancestor);
          if (ancestorMetadataMap) {
            const ancestorResult = ancestorMetadataMap.get(propertyName);
            if (ancestorResult) {
              return ancestorResult;
            }
          }
        }
        return void 0;
      }
      findMetadatas(metadatas, target, propertyName) {
        const metadataFromTargetMap = metadatas.get(target);
        let metadataFromTarget;
        if (metadataFromTargetMap) {
          metadataFromTarget = metadataFromTargetMap.get(propertyName);
        }
        const metadataFromAncestorsTarget = [];
        for (const ancestor of this.getAncestors(target)) {
          const ancestorMetadataMap = metadatas.get(ancestor);
          if (ancestorMetadataMap) {
            if (ancestorMetadataMap.has(propertyName)) {
              metadataFromAncestorsTarget.push(...ancestorMetadataMap.get(propertyName));
            }
          }
        }
        return metadataFromAncestorsTarget.slice().reverse().concat((metadataFromTarget || []).slice().reverse());
      }
      getAncestors(target) {
        if (!target)
          return [];
        if (!this._ancestorsMap.has(target)) {
          const ancestors = [];
          for (let baseClass = Object.getPrototypeOf(target.prototype.constructor); typeof baseClass.prototype !== "undefined"; baseClass = Object.getPrototypeOf(baseClass.prototype.constructor)) {
            ancestors.push(baseClass);
          }
          this._ancestorsMap.set(target, ancestors);
        }
        return this._ancestorsMap.get(target);
      }
    };
    exports.MetadataStorage = MetadataStorage;
  }
});

// node_modules/class-transformer/cjs/storage.js
var require_storage = __commonJS({
  "node_modules/class-transformer/cjs/storage.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.defaultMetadataStorage = void 0;
    var MetadataStorage_1 = require_MetadataStorage();
    exports.defaultMetadataStorage = new MetadataStorage_1.MetadataStorage();
  }
});

// node_modules/class-transformer/cjs/utils/get-global.util.js
var require_get_global_util = __commonJS({
  "node_modules/class-transformer/cjs/utils/get-global.util.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.getGlobal = void 0;
    function getGlobal() {
      if (typeof globalThis !== "undefined") {
        return globalThis;
      }
      if (typeof global !== "undefined") {
        return global;
      }
      if (typeof window !== "undefined") {
        return window;
      }
      if (typeof self !== "undefined") {
        return self;
      }
    }
    exports.getGlobal = getGlobal;
  }
});

// node_modules/class-transformer/cjs/utils/is-promise.util.js
var require_is_promise_util = __commonJS({
  "node_modules/class-transformer/cjs/utils/is-promise.util.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.isPromise = void 0;
    function isPromise(p) {
      return p !== null && typeof p === "object" && typeof p.then === "function";
    }
    exports.isPromise = isPromise;
  }
});

// node_modules/class-transformer/cjs/utils/index.js
var require_utils2 = __commonJS({
  "node_modules/class-transformer/cjs/utils/index.js"(exports) {
    "use strict";
    var __createBinding = exports && exports.__createBinding || (Object.create ? (function(o, m, k, k2) {
      if (k2 === void 0) k2 = k;
      Object.defineProperty(o, k2, { enumerable: true, get: function() {
        return m[k];
      } });
    }) : (function(o, m, k, k2) {
      if (k2 === void 0) k2 = k;
      o[k2] = m[k];
    }));
    var __exportStar = exports && exports.__exportStar || function(m, exports2) {
      for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports2, p)) __createBinding(exports2, m, p);
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    __exportStar(require_get_global_util(), exports);
    __exportStar(require_is_promise_util(), exports);
  }
});

// node_modules/class-transformer/cjs/TransformOperationExecutor.js
var require_TransformOperationExecutor = __commonJS({
  "node_modules/class-transformer/cjs/TransformOperationExecutor.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.TransformOperationExecutor = void 0;
    var storage_1 = require_storage();
    var enums_1 = require_enums();
    var utils_1 = require_utils2();
    function instantiateArrayType(arrayType) {
      const array = new arrayType();
      if (!(array instanceof Set) && !("push" in array)) {
        return [];
      }
      return array;
    }
    var TransformOperationExecutor = class {
      // -------------------------------------------------------------------------
      // Constructor
      // -------------------------------------------------------------------------
      constructor(transformationType, options) {
        this.transformationType = transformationType;
        this.options = options;
        this.recursionStack = /* @__PURE__ */ new Set();
      }
      // -------------------------------------------------------------------------
      // Public Methods
      // -------------------------------------------------------------------------
      transform(source, value, targetType, arrayType, isMap, level = 0) {
        if (Array.isArray(value) || value instanceof Set) {
          const newValue = arrayType && this.transformationType === enums_1.TransformationType.PLAIN_TO_CLASS ? instantiateArrayType(arrayType) : [];
          value.forEach((subValue, index) => {
            const subSource = source ? source[index] : void 0;
            if (!this.options.enableCircularCheck || !this.isCircular(subValue)) {
              let realTargetType;
              if (typeof targetType !== "function" && targetType && targetType.options && targetType.options.discriminator && targetType.options.discriminator.property && targetType.options.discriminator.subTypes) {
                if (this.transformationType === enums_1.TransformationType.PLAIN_TO_CLASS) {
                  realTargetType = targetType.options.discriminator.subTypes.find((subType) => subType.name === subValue[targetType.options.discriminator.property]);
                  const options = { newObject: newValue, object: subValue, property: void 0 };
                  const newType = targetType.typeFunction(options);
                  realTargetType === void 0 ? realTargetType = newType : realTargetType = realTargetType.value;
                  if (!targetType.options.keepDiscriminatorProperty)
                    delete subValue[targetType.options.discriminator.property];
                }
                if (this.transformationType === enums_1.TransformationType.CLASS_TO_CLASS) {
                  realTargetType = subValue.constructor;
                }
                if (this.transformationType === enums_1.TransformationType.CLASS_TO_PLAIN) {
                  subValue[targetType.options.discriminator.property] = targetType.options.discriminator.subTypes.find((subType) => subType.value === subValue.constructor).name;
                }
              } else {
                realTargetType = targetType;
              }
              const value2 = this.transform(subSource, subValue, realTargetType, void 0, subValue instanceof Map, level + 1);
              if (newValue instanceof Set) {
                newValue.add(value2);
              } else {
                newValue.push(value2);
              }
            } else if (this.transformationType === enums_1.TransformationType.CLASS_TO_CLASS) {
              if (newValue instanceof Set) {
                newValue.add(subValue);
              } else {
                newValue.push(subValue);
              }
            }
          });
          return newValue;
        } else if (targetType === String && !isMap) {
          if (value === null || value === void 0)
            return value;
          return String(value);
        } else if (targetType === Number && !isMap) {
          if (value === null || value === void 0)
            return value;
          return Number(value);
        } else if (targetType === Boolean && !isMap) {
          if (value === null || value === void 0)
            return value;
          return Boolean(value);
        } else if ((targetType === Date || value instanceof Date) && !isMap) {
          if (value instanceof Date) {
            return new Date(value.valueOf());
          }
          if (value === null || value === void 0)
            return value;
          return new Date(value);
        } else if (!!(0, utils_1.getGlobal)().Buffer && (targetType === Buffer || value instanceof Buffer) && !isMap) {
          if (value === null || value === void 0)
            return value;
          return Buffer.from(value);
        } else if ((0, utils_1.isPromise)(value) && !isMap) {
          return new Promise((resolve, reject) => {
            value.then((data) => resolve(this.transform(void 0, data, targetType, void 0, void 0, level + 1)), reject);
          });
        } else if (!isMap && value !== null && typeof value === "object" && typeof value.then === "function") {
          return value;
        } else if (typeof value === "object" && value !== null) {
          if (!targetType && value.constructor !== Object)
            if (!Array.isArray(value) && value.constructor === Array) {
            } else {
              targetType = value.constructor;
            }
          if (!targetType && source)
            targetType = source.constructor;
          if (this.options.enableCircularCheck) {
            this.recursionStack.add(value);
          }
          const keys = this.getKeys(targetType, value, isMap);
          let newValue = source ? source : {};
          if (!source && (this.transformationType === enums_1.TransformationType.PLAIN_TO_CLASS || this.transformationType === enums_1.TransformationType.CLASS_TO_CLASS)) {
            if (isMap) {
              newValue = /* @__PURE__ */ new Map();
            } else if (targetType) {
              newValue = new targetType();
            } else {
              newValue = {};
            }
          }
          for (const key of keys) {
            if (key === "__proto__" || key === "constructor") {
              continue;
            }
            const valueKey = key;
            let newValueKey = key, propertyName = key;
            if (!this.options.ignoreDecorators && targetType) {
              if (this.transformationType === enums_1.TransformationType.PLAIN_TO_CLASS) {
                const exposeMetadata = storage_1.defaultMetadataStorage.findExposeMetadataByCustomName(targetType, key);
                if (exposeMetadata) {
                  propertyName = exposeMetadata.propertyName;
                  newValueKey = exposeMetadata.propertyName;
                }
              } else if (this.transformationType === enums_1.TransformationType.CLASS_TO_PLAIN || this.transformationType === enums_1.TransformationType.CLASS_TO_CLASS) {
                const exposeMetadata = storage_1.defaultMetadataStorage.findExposeMetadata(targetType, key);
                if (exposeMetadata && exposeMetadata.options && exposeMetadata.options.name) {
                  newValueKey = exposeMetadata.options.name;
                }
              }
            }
            let subValue = void 0;
            if (this.transformationType === enums_1.TransformationType.PLAIN_TO_CLASS) {
              subValue = value[valueKey];
            } else {
              if (value instanceof Map) {
                subValue = value.get(valueKey);
              } else if (value[valueKey] instanceof Function) {
                subValue = value[valueKey]();
              } else {
                subValue = value[valueKey];
              }
            }
            let type = void 0, isSubValueMap = subValue instanceof Map;
            if (targetType && isMap) {
              type = targetType;
            } else if (targetType) {
              const metadata = storage_1.defaultMetadataStorage.findTypeMetadata(targetType, propertyName);
              if (metadata) {
                const options = { newObject: newValue, object: value, property: propertyName };
                const newType = metadata.typeFunction ? metadata.typeFunction(options) : metadata.reflectedType;
                if (metadata.options && metadata.options.discriminator && metadata.options.discriminator.property && metadata.options.discriminator.subTypes) {
                  if (!(value[valueKey] instanceof Array)) {
                    if (this.transformationType === enums_1.TransformationType.PLAIN_TO_CLASS) {
                      type = metadata.options.discriminator.subTypes.find((subType) => {
                        if (subValue && subValue instanceof Object && metadata.options.discriminator.property in subValue) {
                          return subType.name === subValue[metadata.options.discriminator.property];
                        }
                      });
                      type === void 0 ? type = newType : type = type.value;
                      if (!metadata.options.keepDiscriminatorProperty) {
                        if (subValue && subValue instanceof Object && metadata.options.discriminator.property in subValue) {
                          delete subValue[metadata.options.discriminator.property];
                        }
                      }
                    }
                    if (this.transformationType === enums_1.TransformationType.CLASS_TO_CLASS) {
                      type = subValue.constructor;
                    }
                    if (this.transformationType === enums_1.TransformationType.CLASS_TO_PLAIN) {
                      if (subValue) {
                        subValue[metadata.options.discriminator.property] = metadata.options.discriminator.subTypes.find((subType) => subType.value === subValue.constructor).name;
                      }
                    }
                  } else {
                    type = metadata;
                  }
                } else {
                  type = newType;
                }
                isSubValueMap = isSubValueMap || metadata.reflectedType === Map;
              } else if (this.options.targetMaps) {
                this.options.targetMaps.filter((map) => map.target === targetType && !!map.properties[propertyName]).forEach((map) => type = map.properties[propertyName]);
              } else if (this.options.enableImplicitConversion && this.transformationType === enums_1.TransformationType.PLAIN_TO_CLASS) {
                const reflectedType = Reflect.getMetadata("design:type", targetType.prototype, propertyName);
                if (reflectedType) {
                  type = reflectedType;
                }
              }
            }
            const arrayType2 = Array.isArray(value[valueKey]) ? this.getReflectedType(targetType, propertyName) : void 0;
            const subSource = source ? source[valueKey] : void 0;
            if (newValue.constructor.prototype) {
              const descriptor = Object.getOwnPropertyDescriptor(newValue.constructor.prototype, newValueKey);
              if ((this.transformationType === enums_1.TransformationType.PLAIN_TO_CLASS || this.transformationType === enums_1.TransformationType.CLASS_TO_CLASS) && // eslint-disable-next-line @typescript-eslint/unbound-method
              (descriptor && !descriptor.set || newValue[newValueKey] instanceof Function))
                continue;
            }
            if (!this.options.enableCircularCheck || !this.isCircular(subValue)) {
              const transformKey = this.transformationType === enums_1.TransformationType.PLAIN_TO_CLASS ? newValueKey : key;
              let finalValue;
              if (this.transformationType === enums_1.TransformationType.CLASS_TO_PLAIN) {
                finalValue = value[transformKey];
                finalValue = this.applyCustomTransformations(finalValue, targetType, transformKey, value, this.transformationType);
                finalValue = value[transformKey] === finalValue ? subValue : finalValue;
                finalValue = this.transform(subSource, finalValue, type, arrayType2, isSubValueMap, level + 1);
              } else {
                if (subValue === void 0 && this.options.exposeDefaultValues) {
                  finalValue = newValue[newValueKey];
                } else {
                  finalValue = this.transform(subSource, subValue, type, arrayType2, isSubValueMap, level + 1);
                  finalValue = this.applyCustomTransformations(finalValue, targetType, transformKey, value, this.transformationType);
                }
              }
              if (finalValue !== void 0 || this.options.exposeUnsetFields) {
                if (newValue instanceof Map) {
                  newValue.set(newValueKey, finalValue);
                } else {
                  newValue[newValueKey] = finalValue;
                }
              }
            } else if (this.transformationType === enums_1.TransformationType.CLASS_TO_CLASS) {
              let finalValue = subValue;
              finalValue = this.applyCustomTransformations(finalValue, targetType, key, value, this.transformationType);
              if (finalValue !== void 0 || this.options.exposeUnsetFields) {
                if (newValue instanceof Map) {
                  newValue.set(newValueKey, finalValue);
                } else {
                  newValue[newValueKey] = finalValue;
                }
              }
            }
          }
          if (this.options.enableCircularCheck) {
            this.recursionStack.delete(value);
          }
          return newValue;
        } else {
          return value;
        }
      }
      applyCustomTransformations(value, target, key, obj, transformationType) {
        let metadatas = storage_1.defaultMetadataStorage.findTransformMetadatas(target, key, this.transformationType);
        if (this.options.version !== void 0) {
          metadatas = metadatas.filter((metadata) => {
            if (!metadata.options)
              return true;
            return this.checkVersion(metadata.options.since, metadata.options.until);
          });
        }
        if (this.options.groups && this.options.groups.length) {
          metadatas = metadatas.filter((metadata) => {
            if (!metadata.options)
              return true;
            return this.checkGroups(metadata.options.groups);
          });
        } else {
          metadatas = metadatas.filter((metadata) => {
            return !metadata.options || !metadata.options.groups || !metadata.options.groups.length;
          });
        }
        metadatas.forEach((metadata) => {
          value = metadata.transformFn({ value, key, obj, type: transformationType, options: this.options });
        });
        return value;
      }
      // preventing circular references
      isCircular(object) {
        return this.recursionStack.has(object);
      }
      getReflectedType(target, propertyName) {
        if (!target)
          return void 0;
        const meta = storage_1.defaultMetadataStorage.findTypeMetadata(target, propertyName);
        return meta ? meta.reflectedType : void 0;
      }
      getKeys(target, object, isMap) {
        let strategy = storage_1.defaultMetadataStorage.getStrategy(target);
        if (strategy === "none")
          strategy = this.options.strategy || "exposeAll";
        let keys = [];
        if (strategy === "exposeAll" || isMap) {
          if (object instanceof Map) {
            keys = Array.from(object.keys());
          } else {
            keys = Object.keys(object);
          }
        }
        if (isMap) {
          return keys;
        }
        if (this.options.ignoreDecorators && this.options.excludeExtraneousValues && target) {
          const exposedProperties = storage_1.defaultMetadataStorage.getExposedProperties(target, this.transformationType);
          const excludedProperties = storage_1.defaultMetadataStorage.getExcludedProperties(target, this.transformationType);
          keys = [...exposedProperties, ...excludedProperties];
        }
        if (!this.options.ignoreDecorators && target) {
          let exposedProperties = storage_1.defaultMetadataStorage.getExposedProperties(target, this.transformationType);
          if (this.transformationType === enums_1.TransformationType.PLAIN_TO_CLASS) {
            exposedProperties = exposedProperties.map((key) => {
              const exposeMetadata = storage_1.defaultMetadataStorage.findExposeMetadata(target, key);
              if (exposeMetadata && exposeMetadata.options && exposeMetadata.options.name) {
                return exposeMetadata.options.name;
              }
              return key;
            });
          }
          if (this.options.excludeExtraneousValues) {
            keys = exposedProperties;
          } else {
            keys = keys.concat(exposedProperties);
          }
          const excludedProperties = storage_1.defaultMetadataStorage.getExcludedProperties(target, this.transformationType);
          if (excludedProperties.length > 0) {
            keys = keys.filter((key) => {
              return !excludedProperties.includes(key);
            });
          }
          if (this.options.version !== void 0) {
            keys = keys.filter((key) => {
              const exposeMetadata = storage_1.defaultMetadataStorage.findExposeMetadata(target, key);
              if (!exposeMetadata || !exposeMetadata.options)
                return true;
              return this.checkVersion(exposeMetadata.options.since, exposeMetadata.options.until);
            });
          }
          if (this.options.groups && this.options.groups.length) {
            keys = keys.filter((key) => {
              const exposeMetadata = storage_1.defaultMetadataStorage.findExposeMetadata(target, key);
              if (!exposeMetadata || !exposeMetadata.options)
                return true;
              return this.checkGroups(exposeMetadata.options.groups);
            });
          } else {
            keys = keys.filter((key) => {
              const exposeMetadata = storage_1.defaultMetadataStorage.findExposeMetadata(target, key);
              return !exposeMetadata || !exposeMetadata.options || !exposeMetadata.options.groups || !exposeMetadata.options.groups.length;
            });
          }
        }
        if (this.options.excludePrefixes && this.options.excludePrefixes.length) {
          keys = keys.filter((key) => this.options.excludePrefixes.every((prefix) => {
            return key.substr(0, prefix.length) !== prefix;
          }));
        }
        keys = keys.filter((key, index, self2) => {
          return self2.indexOf(key) === index;
        });
        return keys;
      }
      checkVersion(since, until) {
        let decision = true;
        if (decision && since)
          decision = this.options.version >= since;
        if (decision && until)
          decision = this.options.version < until;
        return decision;
      }
      checkGroups(groups) {
        if (!groups)
          return true;
        return this.options.groups.some((optionGroup) => groups.includes(optionGroup));
      }
    };
    exports.TransformOperationExecutor = TransformOperationExecutor;
  }
});

// node_modules/class-transformer/cjs/constants/default-options.constant.js
var require_default_options_constant = __commonJS({
  "node_modules/class-transformer/cjs/constants/default-options.constant.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.defaultOptions = void 0;
    exports.defaultOptions = {
      enableCircularCheck: false,
      enableImplicitConversion: false,
      excludeExtraneousValues: false,
      excludePrefixes: void 0,
      exposeDefaultValues: false,
      exposeUnsetFields: true,
      groups: void 0,
      ignoreDecorators: false,
      strategy: void 0,
      targetMaps: void 0,
      version: void 0
    };
  }
});

// node_modules/class-transformer/cjs/ClassTransformer.js
var require_ClassTransformer = __commonJS({
  "node_modules/class-transformer/cjs/ClassTransformer.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ClassTransformer = void 0;
    var TransformOperationExecutor_1 = require_TransformOperationExecutor();
    var enums_1 = require_enums();
    var default_options_constant_1 = require_default_options_constant();
    var ClassTransformer = class {
      instanceToPlain(object, options) {
        const executor = new TransformOperationExecutor_1.TransformOperationExecutor(enums_1.TransformationType.CLASS_TO_PLAIN, {
          ...default_options_constant_1.defaultOptions,
          ...options
        });
        return executor.transform(void 0, object, void 0, void 0, void 0, void 0);
      }
      classToPlainFromExist(object, plainObject, options) {
        const executor = new TransformOperationExecutor_1.TransformOperationExecutor(enums_1.TransformationType.CLASS_TO_PLAIN, {
          ...default_options_constant_1.defaultOptions,
          ...options
        });
        return executor.transform(plainObject, object, void 0, void 0, void 0, void 0);
      }
      plainToInstance(cls, plain, options) {
        const executor = new TransformOperationExecutor_1.TransformOperationExecutor(enums_1.TransformationType.PLAIN_TO_CLASS, {
          ...default_options_constant_1.defaultOptions,
          ...options
        });
        return executor.transform(void 0, plain, cls, void 0, void 0, void 0);
      }
      plainToClassFromExist(clsObject, plain, options) {
        const executor = new TransformOperationExecutor_1.TransformOperationExecutor(enums_1.TransformationType.PLAIN_TO_CLASS, {
          ...default_options_constant_1.defaultOptions,
          ...options
        });
        return executor.transform(clsObject, plain, void 0, void 0, void 0, void 0);
      }
      instanceToInstance(object, options) {
        const executor = new TransformOperationExecutor_1.TransformOperationExecutor(enums_1.TransformationType.CLASS_TO_CLASS, {
          ...default_options_constant_1.defaultOptions,
          ...options
        });
        return executor.transform(void 0, object, void 0, void 0, void 0, void 0);
      }
      classToClassFromExist(object, fromObject, options) {
        const executor = new TransformOperationExecutor_1.TransformOperationExecutor(enums_1.TransformationType.CLASS_TO_CLASS, {
          ...default_options_constant_1.defaultOptions,
          ...options
        });
        return executor.transform(fromObject, object, void 0, void 0, void 0, void 0);
      }
      serialize(object, options) {
        return JSON.stringify(this.instanceToPlain(object, options));
      }
      /**
       * Deserializes given JSON string to a object of the given class.
       */
      deserialize(cls, json, options) {
        const jsonObject = JSON.parse(json);
        return this.plainToInstance(cls, jsonObject, options);
      }
      /**
       * Deserializes given JSON string to an array of objects of the given class.
       */
      deserializeArray(cls, json, options) {
        const jsonObject = JSON.parse(json);
        return this.plainToInstance(cls, jsonObject, options);
      }
    };
    exports.ClassTransformer = ClassTransformer;
  }
});

// node_modules/class-transformer/cjs/decorators/exclude.decorator.js
var require_exclude_decorator = __commonJS({
  "node_modules/class-transformer/cjs/decorators/exclude.decorator.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Exclude = void 0;
    var storage_1 = require_storage();
    function Exclude(options = {}) {
      return function(object, propertyName) {
        storage_1.defaultMetadataStorage.addExcludeMetadata({
          target: object instanceof Function ? object : object.constructor,
          propertyName,
          options
        });
      };
    }
    exports.Exclude = Exclude;
  }
});

// node_modules/class-transformer/cjs/decorators/expose.decorator.js
var require_expose_decorator = __commonJS({
  "node_modules/class-transformer/cjs/decorators/expose.decorator.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Expose = void 0;
    var storage_1 = require_storage();
    function Expose(options = {}) {
      return function(object, propertyName) {
        storage_1.defaultMetadataStorage.addExposeMetadata({
          target: object instanceof Function ? object : object.constructor,
          propertyName,
          options
        });
      };
    }
    exports.Expose = Expose;
  }
});

// node_modules/class-transformer/cjs/decorators/transform-instance-to-instance.decorator.js
var require_transform_instance_to_instance_decorator = __commonJS({
  "node_modules/class-transformer/cjs/decorators/transform-instance-to-instance.decorator.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.TransformInstanceToInstance = void 0;
    var ClassTransformer_1 = require_ClassTransformer();
    function TransformInstanceToInstance(params) {
      return function(target, propertyKey, descriptor) {
        const classTransformer = new ClassTransformer_1.ClassTransformer();
        const originalMethod = descriptor.value;
        descriptor.value = function(...args) {
          const result = originalMethod.apply(this, args);
          const isPromise = !!result && (typeof result === "object" || typeof result === "function") && typeof result.then === "function";
          return isPromise ? result.then((data) => classTransformer.instanceToInstance(data, params)) : classTransformer.instanceToInstance(result, params);
        };
      };
    }
    exports.TransformInstanceToInstance = TransformInstanceToInstance;
  }
});

// node_modules/class-transformer/cjs/decorators/transform-instance-to-plain.decorator.js
var require_transform_instance_to_plain_decorator = __commonJS({
  "node_modules/class-transformer/cjs/decorators/transform-instance-to-plain.decorator.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.TransformInstanceToPlain = void 0;
    var ClassTransformer_1 = require_ClassTransformer();
    function TransformInstanceToPlain(params) {
      return function(target, propertyKey, descriptor) {
        const classTransformer = new ClassTransformer_1.ClassTransformer();
        const originalMethod = descriptor.value;
        descriptor.value = function(...args) {
          const result = originalMethod.apply(this, args);
          const isPromise = !!result && (typeof result === "object" || typeof result === "function") && typeof result.then === "function";
          return isPromise ? result.then((data) => classTransformer.instanceToPlain(data, params)) : classTransformer.instanceToPlain(result, params);
        };
      };
    }
    exports.TransformInstanceToPlain = TransformInstanceToPlain;
  }
});

// node_modules/class-transformer/cjs/decorators/transform-plain-to-instance.decorator.js
var require_transform_plain_to_instance_decorator = __commonJS({
  "node_modules/class-transformer/cjs/decorators/transform-plain-to-instance.decorator.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.TransformPlainToInstance = void 0;
    var ClassTransformer_1 = require_ClassTransformer();
    function TransformPlainToInstance(classType, params) {
      return function(target, propertyKey, descriptor) {
        const classTransformer = new ClassTransformer_1.ClassTransformer();
        const originalMethod = descriptor.value;
        descriptor.value = function(...args) {
          const result = originalMethod.apply(this, args);
          const isPromise = !!result && (typeof result === "object" || typeof result === "function") && typeof result.then === "function";
          return isPromise ? result.then((data) => classTransformer.plainToInstance(classType, data, params)) : classTransformer.plainToInstance(classType, result, params);
        };
      };
    }
    exports.TransformPlainToInstance = TransformPlainToInstance;
  }
});

// node_modules/class-transformer/cjs/decorators/transform.decorator.js
var require_transform_decorator = __commonJS({
  "node_modules/class-transformer/cjs/decorators/transform.decorator.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Transform = void 0;
    var storage_1 = require_storage();
    function Transform(transformFn, options = {}) {
      return function(target, propertyName) {
        storage_1.defaultMetadataStorage.addTransformMetadata({
          target: target.constructor,
          propertyName,
          transformFn,
          options
        });
      };
    }
    exports.Transform = Transform;
  }
});

// node_modules/class-transformer/cjs/decorators/type.decorator.js
var require_type_decorator = __commonJS({
  "node_modules/class-transformer/cjs/decorators/type.decorator.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Type = void 0;
    var storage_1 = require_storage();
    function Type2(typeFunction, options = {}) {
      return function(target, propertyName) {
        const reflectedType = Reflect.getMetadata("design:type", target, propertyName);
        storage_1.defaultMetadataStorage.addTypeMetadata({
          target: target.constructor,
          propertyName,
          reflectedType,
          typeFunction,
          options
        });
      };
    }
    exports.Type = Type2;
  }
});

// node_modules/class-transformer/cjs/decorators/index.js
var require_decorators = __commonJS({
  "node_modules/class-transformer/cjs/decorators/index.js"(exports) {
    "use strict";
    var __createBinding = exports && exports.__createBinding || (Object.create ? (function(o, m, k, k2) {
      if (k2 === void 0) k2 = k;
      Object.defineProperty(o, k2, { enumerable: true, get: function() {
        return m[k];
      } });
    }) : (function(o, m, k, k2) {
      if (k2 === void 0) k2 = k;
      o[k2] = m[k];
    }));
    var __exportStar = exports && exports.__exportStar || function(m, exports2) {
      for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports2, p)) __createBinding(exports2, m, p);
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    __exportStar(require_exclude_decorator(), exports);
    __exportStar(require_expose_decorator(), exports);
    __exportStar(require_transform_instance_to_instance_decorator(), exports);
    __exportStar(require_transform_instance_to_plain_decorator(), exports);
    __exportStar(require_transform_plain_to_instance_decorator(), exports);
    __exportStar(require_transform_decorator(), exports);
    __exportStar(require_type_decorator(), exports);
  }
});

// node_modules/class-transformer/cjs/interfaces/decorator-options/expose-options.interface.js
var require_expose_options_interface = __commonJS({
  "node_modules/class-transformer/cjs/interfaces/decorator-options/expose-options.interface.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
  }
});

// node_modules/class-transformer/cjs/interfaces/decorator-options/exclude-options.interface.js
var require_exclude_options_interface = __commonJS({
  "node_modules/class-transformer/cjs/interfaces/decorator-options/exclude-options.interface.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
  }
});

// node_modules/class-transformer/cjs/interfaces/decorator-options/transform-options.interface.js
var require_transform_options_interface = __commonJS({
  "node_modules/class-transformer/cjs/interfaces/decorator-options/transform-options.interface.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
  }
});

// node_modules/class-transformer/cjs/interfaces/decorator-options/type-discriminator-descriptor.interface.js
var require_type_discriminator_descriptor_interface = __commonJS({
  "node_modules/class-transformer/cjs/interfaces/decorator-options/type-discriminator-descriptor.interface.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
  }
});

// node_modules/class-transformer/cjs/interfaces/decorator-options/type-options.interface.js
var require_type_options_interface = __commonJS({
  "node_modules/class-transformer/cjs/interfaces/decorator-options/type-options.interface.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
  }
});

// node_modules/class-transformer/cjs/interfaces/metadata/exclude-metadata.interface.js
var require_exclude_metadata_interface = __commonJS({
  "node_modules/class-transformer/cjs/interfaces/metadata/exclude-metadata.interface.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
  }
});

// node_modules/class-transformer/cjs/interfaces/metadata/expose-metadata.interface.js
var require_expose_metadata_interface = __commonJS({
  "node_modules/class-transformer/cjs/interfaces/metadata/expose-metadata.interface.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
  }
});

// node_modules/class-transformer/cjs/interfaces/metadata/transform-metadata.interface.js
var require_transform_metadata_interface = __commonJS({
  "node_modules/class-transformer/cjs/interfaces/metadata/transform-metadata.interface.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
  }
});

// node_modules/class-transformer/cjs/interfaces/metadata/transform-fn-params.interface.js
var require_transform_fn_params_interface = __commonJS({
  "node_modules/class-transformer/cjs/interfaces/metadata/transform-fn-params.interface.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
  }
});

// node_modules/class-transformer/cjs/interfaces/metadata/type-metadata.interface.js
var require_type_metadata_interface = __commonJS({
  "node_modules/class-transformer/cjs/interfaces/metadata/type-metadata.interface.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
  }
});

// node_modules/class-transformer/cjs/interfaces/class-constructor.type.js
var require_class_constructor_type = __commonJS({
  "node_modules/class-transformer/cjs/interfaces/class-constructor.type.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
  }
});

// node_modules/class-transformer/cjs/interfaces/class-transformer-options.interface.js
var require_class_transformer_options_interface = __commonJS({
  "node_modules/class-transformer/cjs/interfaces/class-transformer-options.interface.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
  }
});

// node_modules/class-transformer/cjs/interfaces/target-map.interface.js
var require_target_map_interface = __commonJS({
  "node_modules/class-transformer/cjs/interfaces/target-map.interface.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
  }
});

// node_modules/class-transformer/cjs/interfaces/type-help-options.interface.js
var require_type_help_options_interface = __commonJS({
  "node_modules/class-transformer/cjs/interfaces/type-help-options.interface.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
  }
});

// node_modules/class-transformer/cjs/interfaces/index.js
var require_interfaces = __commonJS({
  "node_modules/class-transformer/cjs/interfaces/index.js"(exports) {
    "use strict";
    var __createBinding = exports && exports.__createBinding || (Object.create ? (function(o, m, k, k2) {
      if (k2 === void 0) k2 = k;
      Object.defineProperty(o, k2, { enumerable: true, get: function() {
        return m[k];
      } });
    }) : (function(o, m, k, k2) {
      if (k2 === void 0) k2 = k;
      o[k2] = m[k];
    }));
    var __exportStar = exports && exports.__exportStar || function(m, exports2) {
      for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports2, p)) __createBinding(exports2, m, p);
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    __exportStar(require_expose_options_interface(), exports);
    __exportStar(require_exclude_options_interface(), exports);
    __exportStar(require_transform_options_interface(), exports);
    __exportStar(require_type_discriminator_descriptor_interface(), exports);
    __exportStar(require_type_options_interface(), exports);
    __exportStar(require_exclude_metadata_interface(), exports);
    __exportStar(require_expose_metadata_interface(), exports);
    __exportStar(require_transform_metadata_interface(), exports);
    __exportStar(require_transform_fn_params_interface(), exports);
    __exportStar(require_type_metadata_interface(), exports);
    __exportStar(require_class_constructor_type(), exports);
    __exportStar(require_class_transformer_options_interface(), exports);
    __exportStar(require_target_map_interface(), exports);
    __exportStar(require_type_help_options_interface(), exports);
  }
});

// node_modules/class-transformer/cjs/index.js
var require_cjs = __commonJS({
  "node_modules/class-transformer/cjs/index.js"(exports) {
    "use strict";
    var __createBinding = exports && exports.__createBinding || (Object.create ? (function(o, m, k, k2) {
      if (k2 === void 0) k2 = k;
      Object.defineProperty(o, k2, { enumerable: true, get: function() {
        return m[k];
      } });
    }) : (function(o, m, k, k2) {
      if (k2 === void 0) k2 = k;
      o[k2] = m[k];
    }));
    var __exportStar = exports && exports.__exportStar || function(m, exports2) {
      for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports2, p)) __createBinding(exports2, m, p);
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.deserializeArray = exports.deserialize = exports.serialize = exports.classToClassFromExist = exports.instanceToInstance = exports.plainToClassFromExist = exports.plainToInstance = exports.plainToClass = exports.classToPlainFromExist = exports.instanceToPlain = exports.classToPlain = exports.ClassTransformer = void 0;
    var ClassTransformer_1 = require_ClassTransformer();
    var ClassTransformer_2 = require_ClassTransformer();
    Object.defineProperty(exports, "ClassTransformer", { enumerable: true, get: function() {
      return ClassTransformer_2.ClassTransformer;
    } });
    __exportStar(require_decorators(), exports);
    __exportStar(require_interfaces(), exports);
    __exportStar(require_enums(), exports);
    var classTransformer = new ClassTransformer_1.ClassTransformer();
    function classToPlain(object, options) {
      return classTransformer.instanceToPlain(object, options);
    }
    exports.classToPlain = classToPlain;
    function instanceToPlain(object, options) {
      return classTransformer.instanceToPlain(object, options);
    }
    exports.instanceToPlain = instanceToPlain;
    function classToPlainFromExist(object, plainObject, options) {
      return classTransformer.classToPlainFromExist(object, plainObject, options);
    }
    exports.classToPlainFromExist = classToPlainFromExist;
    function plainToClass(cls, plain, options) {
      return classTransformer.plainToInstance(cls, plain, options);
    }
    exports.plainToClass = plainToClass;
    function plainToInstance(cls, plain, options) {
      return classTransformer.plainToInstance(cls, plain, options);
    }
    exports.plainToInstance = plainToInstance;
    function plainToClassFromExist(clsObject, plain, options) {
      return classTransformer.plainToClassFromExist(clsObject, plain, options);
    }
    exports.plainToClassFromExist = plainToClassFromExist;
    function instanceToInstance(object, options) {
      return classTransformer.instanceToInstance(object, options);
    }
    exports.instanceToInstance = instanceToInstance;
    function classToClassFromExist(object, fromObject, options) {
      return classTransformer.classToClassFromExist(object, fromObject, options);
    }
    exports.classToClassFromExist = classToClassFromExist;
    function serialize(object, options) {
      return classTransformer.serialize(object, options);
    }
    exports.serialize = serialize;
    function deserialize(cls, json, options) {
      return classTransformer.deserialize(cls, json, options);
    }
    exports.deserialize = deserialize;
    function deserializeArray(cls, json, options) {
      return classTransformer.deserializeArray(cls, json, options);
    }
    exports.deserializeArray = deserializeArray;
  }
});

// node_modules/reflect-metadata/Reflect.js
var require_Reflect = __commonJS({
  "node_modules/reflect-metadata/Reflect.js"() {
    var Reflect2;
    (function(Reflect3) {
      (function(factory) {
        var root = typeof globalThis === "object" ? globalThis : typeof global === "object" ? global : typeof self === "object" ? self : typeof this === "object" ? this : sloppyModeThis();
        var exporter = makeExporter(Reflect3);
        if (typeof root.Reflect !== "undefined") {
          exporter = makeExporter(root.Reflect, exporter);
        }
        factory(exporter, root);
        if (typeof root.Reflect === "undefined") {
          root.Reflect = Reflect3;
        }
        function makeExporter(target, previous) {
          return function(key, value) {
            Object.defineProperty(target, key, { configurable: true, writable: true, value });
            if (previous)
              previous(key, value);
          };
        }
        function functionThis() {
          try {
            return Function("return this;")();
          } catch (_) {
          }
        }
        function indirectEvalThis() {
          try {
            return (void 0, eval)("(function() { return this; })()");
          } catch (_) {
          }
        }
        function sloppyModeThis() {
          return functionThis() || indirectEvalThis();
        }
      })(function(exporter, root) {
        var hasOwn = Object.prototype.hasOwnProperty;
        var supportsSymbol = typeof Symbol === "function";
        var toPrimitiveSymbol = supportsSymbol && typeof Symbol.toPrimitive !== "undefined" ? Symbol.toPrimitive : "@@toPrimitive";
        var iteratorSymbol = supportsSymbol && typeof Symbol.iterator !== "undefined" ? Symbol.iterator : "@@iterator";
        var supportsCreate = typeof Object.create === "function";
        var supportsProto = { __proto__: [] } instanceof Array;
        var downLevel = !supportsCreate && !supportsProto;
        var HashMap = {
          // create an object in dictionary mode (a.k.a. "slow" mode in v8)
          create: supportsCreate ? function() {
            return MakeDictionary(/* @__PURE__ */ Object.create(null));
          } : supportsProto ? function() {
            return MakeDictionary({ __proto__: null });
          } : function() {
            return MakeDictionary({});
          },
          has: downLevel ? function(map, key) {
            return hasOwn.call(map, key);
          } : function(map, key) {
            return key in map;
          },
          get: downLevel ? function(map, key) {
            return hasOwn.call(map, key) ? map[key] : void 0;
          } : function(map, key) {
            return map[key];
          }
        };
        var functionPrototype = Object.getPrototypeOf(Function);
        var _Map = typeof Map === "function" && typeof Map.prototype.entries === "function" ? Map : CreateMapPolyfill();
        var _Set = typeof Set === "function" && typeof Set.prototype.entries === "function" ? Set : CreateSetPolyfill();
        var _WeakMap = typeof WeakMap === "function" ? WeakMap : CreateWeakMapPolyfill();
        var registrySymbol = supportsSymbol ? Symbol.for("@reflect-metadata:registry") : void 0;
        var metadataRegistry = GetOrCreateMetadataRegistry();
        var metadataProvider = CreateMetadataProvider(metadataRegistry);
        function decorate(decorators, target, propertyKey, attributes) {
          if (!IsUndefined(propertyKey)) {
            if (!IsArray(decorators))
              throw new TypeError();
            if (!IsObject(target))
              throw new TypeError();
            if (!IsObject(attributes) && !IsUndefined(attributes) && !IsNull(attributes))
              throw new TypeError();
            if (IsNull(attributes))
              attributes = void 0;
            propertyKey = ToPropertyKey(propertyKey);
            return DecorateProperty(decorators, target, propertyKey, attributes);
          } else {
            if (!IsArray(decorators))
              throw new TypeError();
            if (!IsConstructor(target))
              throw new TypeError();
            return DecorateConstructor(decorators, target);
          }
        }
        exporter("decorate", decorate);
        function metadata(metadataKey, metadataValue) {
          function decorator(target, propertyKey) {
            if (!IsObject(target))
              throw new TypeError();
            if (!IsUndefined(propertyKey) && !IsPropertyKey(propertyKey))
              throw new TypeError();
            OrdinaryDefineOwnMetadata(metadataKey, metadataValue, target, propertyKey);
          }
          return decorator;
        }
        exporter("metadata", metadata);
        function defineMetadata(metadataKey, metadataValue, target, propertyKey) {
          if (!IsObject(target))
            throw new TypeError();
          if (!IsUndefined(propertyKey))
            propertyKey = ToPropertyKey(propertyKey);
          return OrdinaryDefineOwnMetadata(metadataKey, metadataValue, target, propertyKey);
        }
        exporter("defineMetadata", defineMetadata);
        function hasMetadata(metadataKey, target, propertyKey) {
          if (!IsObject(target))
            throw new TypeError();
          if (!IsUndefined(propertyKey))
            propertyKey = ToPropertyKey(propertyKey);
          return OrdinaryHasMetadata(metadataKey, target, propertyKey);
        }
        exporter("hasMetadata", hasMetadata);
        function hasOwnMetadata(metadataKey, target, propertyKey) {
          if (!IsObject(target))
            throw new TypeError();
          if (!IsUndefined(propertyKey))
            propertyKey = ToPropertyKey(propertyKey);
          return OrdinaryHasOwnMetadata(metadataKey, target, propertyKey);
        }
        exporter("hasOwnMetadata", hasOwnMetadata);
        function getMetadata(metadataKey, target, propertyKey) {
          if (!IsObject(target))
            throw new TypeError();
          if (!IsUndefined(propertyKey))
            propertyKey = ToPropertyKey(propertyKey);
          return OrdinaryGetMetadata(metadataKey, target, propertyKey);
        }
        exporter("getMetadata", getMetadata);
        function getOwnMetadata(metadataKey, target, propertyKey) {
          if (!IsObject(target))
            throw new TypeError();
          if (!IsUndefined(propertyKey))
            propertyKey = ToPropertyKey(propertyKey);
          return OrdinaryGetOwnMetadata(metadataKey, target, propertyKey);
        }
        exporter("getOwnMetadata", getOwnMetadata);
        function getMetadataKeys(target, propertyKey) {
          if (!IsObject(target))
            throw new TypeError();
          if (!IsUndefined(propertyKey))
            propertyKey = ToPropertyKey(propertyKey);
          return OrdinaryMetadataKeys(target, propertyKey);
        }
        exporter("getMetadataKeys", getMetadataKeys);
        function getOwnMetadataKeys(target, propertyKey) {
          if (!IsObject(target))
            throw new TypeError();
          if (!IsUndefined(propertyKey))
            propertyKey = ToPropertyKey(propertyKey);
          return OrdinaryOwnMetadataKeys(target, propertyKey);
        }
        exporter("getOwnMetadataKeys", getOwnMetadataKeys);
        function deleteMetadata(metadataKey, target, propertyKey) {
          if (!IsObject(target))
            throw new TypeError();
          if (!IsUndefined(propertyKey))
            propertyKey = ToPropertyKey(propertyKey);
          if (!IsObject(target))
            throw new TypeError();
          if (!IsUndefined(propertyKey))
            propertyKey = ToPropertyKey(propertyKey);
          var provider = GetMetadataProvider(
            target,
            propertyKey,
            /*Create*/
            false
          );
          if (IsUndefined(provider))
            return false;
          return provider.OrdinaryDeleteMetadata(metadataKey, target, propertyKey);
        }
        exporter("deleteMetadata", deleteMetadata);
        function DecorateConstructor(decorators, target) {
          for (var i = decorators.length - 1; i >= 0; --i) {
            var decorator = decorators[i];
            var decorated = decorator(target);
            if (!IsUndefined(decorated) && !IsNull(decorated)) {
              if (!IsConstructor(decorated))
                throw new TypeError();
              target = decorated;
            }
          }
          return target;
        }
        function DecorateProperty(decorators, target, propertyKey, descriptor) {
          for (var i = decorators.length - 1; i >= 0; --i) {
            var decorator = decorators[i];
            var decorated = decorator(target, propertyKey, descriptor);
            if (!IsUndefined(decorated) && !IsNull(decorated)) {
              if (!IsObject(decorated))
                throw new TypeError();
              descriptor = decorated;
            }
          }
          return descriptor;
        }
        function OrdinaryHasMetadata(MetadataKey, O, P) {
          var hasOwn2 = OrdinaryHasOwnMetadata(MetadataKey, O, P);
          if (hasOwn2)
            return true;
          var parent = OrdinaryGetPrototypeOf(O);
          if (!IsNull(parent))
            return OrdinaryHasMetadata(MetadataKey, parent, P);
          return false;
        }
        function OrdinaryHasOwnMetadata(MetadataKey, O, P) {
          var provider = GetMetadataProvider(
            O,
            P,
            /*Create*/
            false
          );
          if (IsUndefined(provider))
            return false;
          return ToBoolean(provider.OrdinaryHasOwnMetadata(MetadataKey, O, P));
        }
        function OrdinaryGetMetadata(MetadataKey, O, P) {
          var hasOwn2 = OrdinaryHasOwnMetadata(MetadataKey, O, P);
          if (hasOwn2)
            return OrdinaryGetOwnMetadata(MetadataKey, O, P);
          var parent = OrdinaryGetPrototypeOf(O);
          if (!IsNull(parent))
            return OrdinaryGetMetadata(MetadataKey, parent, P);
          return void 0;
        }
        function OrdinaryGetOwnMetadata(MetadataKey, O, P) {
          var provider = GetMetadataProvider(
            O,
            P,
            /*Create*/
            false
          );
          if (IsUndefined(provider))
            return;
          return provider.OrdinaryGetOwnMetadata(MetadataKey, O, P);
        }
        function OrdinaryDefineOwnMetadata(MetadataKey, MetadataValue, O, P) {
          var provider = GetMetadataProvider(
            O,
            P,
            /*Create*/
            true
          );
          provider.OrdinaryDefineOwnMetadata(MetadataKey, MetadataValue, O, P);
        }
        function OrdinaryMetadataKeys(O, P) {
          var ownKeys = OrdinaryOwnMetadataKeys(O, P);
          var parent = OrdinaryGetPrototypeOf(O);
          if (parent === null)
            return ownKeys;
          var parentKeys = OrdinaryMetadataKeys(parent, P);
          if (parentKeys.length <= 0)
            return ownKeys;
          if (ownKeys.length <= 0)
            return parentKeys;
          var set = new _Set();
          var keys = [];
          for (var _i = 0, ownKeys_1 = ownKeys; _i < ownKeys_1.length; _i++) {
            var key = ownKeys_1[_i];
            var hasKey = set.has(key);
            if (!hasKey) {
              set.add(key);
              keys.push(key);
            }
          }
          for (var _a = 0, parentKeys_1 = parentKeys; _a < parentKeys_1.length; _a++) {
            var key = parentKeys_1[_a];
            var hasKey = set.has(key);
            if (!hasKey) {
              set.add(key);
              keys.push(key);
            }
          }
          return keys;
        }
        function OrdinaryOwnMetadataKeys(O, P) {
          var provider = GetMetadataProvider(
            O,
            P,
            /*create*/
            false
          );
          if (!provider) {
            return [];
          }
          return provider.OrdinaryOwnMetadataKeys(O, P);
        }
        function Type2(x) {
          if (x === null)
            return 1;
          switch (typeof x) {
            case "undefined":
              return 0;
            case "boolean":
              return 2;
            case "string":
              return 3;
            case "symbol":
              return 4;
            case "number":
              return 5;
            case "object":
              return x === null ? 1 : 6;
            default:
              return 6;
          }
        }
        function IsUndefined(x) {
          return x === void 0;
        }
        function IsNull(x) {
          return x === null;
        }
        function IsSymbol(x) {
          return typeof x === "symbol";
        }
        function IsObject(x) {
          return typeof x === "object" ? x !== null : typeof x === "function";
        }
        function ToPrimitive(input, PreferredType) {
          switch (Type2(input)) {
            case 0:
              return input;
            case 1:
              return input;
            case 2:
              return input;
            case 3:
              return input;
            case 4:
              return input;
            case 5:
              return input;
          }
          var hint = PreferredType === 3 ? "string" : PreferredType === 5 ? "number" : "default";
          var exoticToPrim = GetMethod(input, toPrimitiveSymbol);
          if (exoticToPrim !== void 0) {
            var result = exoticToPrim.call(input, hint);
            if (IsObject(result))
              throw new TypeError();
            return result;
          }
          return OrdinaryToPrimitive(input, hint === "default" ? "number" : hint);
        }
        function OrdinaryToPrimitive(O, hint) {
          if (hint === "string") {
            var toString_1 = O.toString;
            if (IsCallable(toString_1)) {
              var result = toString_1.call(O);
              if (!IsObject(result))
                return result;
            }
            var valueOf = O.valueOf;
            if (IsCallable(valueOf)) {
              var result = valueOf.call(O);
              if (!IsObject(result))
                return result;
            }
          } else {
            var valueOf = O.valueOf;
            if (IsCallable(valueOf)) {
              var result = valueOf.call(O);
              if (!IsObject(result))
                return result;
            }
            var toString_2 = O.toString;
            if (IsCallable(toString_2)) {
              var result = toString_2.call(O);
              if (!IsObject(result))
                return result;
            }
          }
          throw new TypeError();
        }
        function ToBoolean(argument) {
          return !!argument;
        }
        function ToString(argument) {
          return "" + argument;
        }
        function ToPropertyKey(argument) {
          var key = ToPrimitive(
            argument,
            3
            /* String */
          );
          if (IsSymbol(key))
            return key;
          return ToString(key);
        }
        function IsArray(argument) {
          return Array.isArray ? Array.isArray(argument) : argument instanceof Object ? argument instanceof Array : Object.prototype.toString.call(argument) === "[object Array]";
        }
        function IsCallable(argument) {
          return typeof argument === "function";
        }
        function IsConstructor(argument) {
          return typeof argument === "function";
        }
        function IsPropertyKey(argument) {
          switch (Type2(argument)) {
            case 3:
              return true;
            case 4:
              return true;
            default:
              return false;
          }
        }
        function SameValueZero(x, y) {
          return x === y || x !== x && y !== y;
        }
        function GetMethod(V, P) {
          var func = V[P];
          if (func === void 0 || func === null)
            return void 0;
          if (!IsCallable(func))
            throw new TypeError();
          return func;
        }
        function GetIterator(obj) {
          var method = GetMethod(obj, iteratorSymbol);
          if (!IsCallable(method))
            throw new TypeError();
          var iterator = method.call(obj);
          if (!IsObject(iterator))
            throw new TypeError();
          return iterator;
        }
        function IteratorValue(iterResult) {
          return iterResult.value;
        }
        function IteratorStep(iterator) {
          var result = iterator.next();
          return result.done ? false : result;
        }
        function IteratorClose(iterator) {
          var f = iterator["return"];
          if (f)
            f.call(iterator);
        }
        function OrdinaryGetPrototypeOf(O) {
          var proto = Object.getPrototypeOf(O);
          if (typeof O !== "function" || O === functionPrototype)
            return proto;
          if (proto !== functionPrototype)
            return proto;
          var prototype = O.prototype;
          var prototypeProto = prototype && Object.getPrototypeOf(prototype);
          if (prototypeProto == null || prototypeProto === Object.prototype)
            return proto;
          var constructor = prototypeProto.constructor;
          if (typeof constructor !== "function")
            return proto;
          if (constructor === O)
            return proto;
          return constructor;
        }
        function CreateMetadataRegistry() {
          var fallback;
          if (!IsUndefined(registrySymbol) && typeof root.Reflect !== "undefined" && !(registrySymbol in root.Reflect) && typeof root.Reflect.defineMetadata === "function") {
            fallback = CreateFallbackProvider(root.Reflect);
          }
          var first;
          var second;
          var rest;
          var targetProviderMap = new _WeakMap();
          var registry = {
            registerProvider,
            getProvider,
            setProvider
          };
          return registry;
          function registerProvider(provider) {
            if (!Object.isExtensible(registry)) {
              throw new Error("Cannot add provider to a frozen registry.");
            }
            switch (true) {
              case fallback === provider:
                break;
              case IsUndefined(first):
                first = provider;
                break;
              case first === provider:
                break;
              case IsUndefined(second):
                second = provider;
                break;
              case second === provider:
                break;
              default:
                if (rest === void 0)
                  rest = new _Set();
                rest.add(provider);
                break;
            }
          }
          function getProviderNoCache(O, P) {
            if (!IsUndefined(first)) {
              if (first.isProviderFor(O, P))
                return first;
              if (!IsUndefined(second)) {
                if (second.isProviderFor(O, P))
                  return first;
                if (!IsUndefined(rest)) {
                  var iterator = GetIterator(rest);
                  while (true) {
                    var next = IteratorStep(iterator);
                    if (!next) {
                      return void 0;
                    }
                    var provider = IteratorValue(next);
                    if (provider.isProviderFor(O, P)) {
                      IteratorClose(iterator);
                      return provider;
                    }
                  }
                }
              }
            }
            if (!IsUndefined(fallback) && fallback.isProviderFor(O, P)) {
              return fallback;
            }
            return void 0;
          }
          function getProvider(O, P) {
            var providerMap = targetProviderMap.get(O);
            var provider;
            if (!IsUndefined(providerMap)) {
              provider = providerMap.get(P);
            }
            if (!IsUndefined(provider)) {
              return provider;
            }
            provider = getProviderNoCache(O, P);
            if (!IsUndefined(provider)) {
              if (IsUndefined(providerMap)) {
                providerMap = new _Map();
                targetProviderMap.set(O, providerMap);
              }
              providerMap.set(P, provider);
            }
            return provider;
          }
          function hasProvider(provider) {
            if (IsUndefined(provider))
              throw new TypeError();
            return first === provider || second === provider || !IsUndefined(rest) && rest.has(provider);
          }
          function setProvider(O, P, provider) {
            if (!hasProvider(provider)) {
              throw new Error("Metadata provider not registered.");
            }
            var existingProvider = getProvider(O, P);
            if (existingProvider !== provider) {
              if (!IsUndefined(existingProvider)) {
                return false;
              }
              var providerMap = targetProviderMap.get(O);
              if (IsUndefined(providerMap)) {
                providerMap = new _Map();
                targetProviderMap.set(O, providerMap);
              }
              providerMap.set(P, provider);
            }
            return true;
          }
        }
        function GetOrCreateMetadataRegistry() {
          var metadataRegistry2;
          if (!IsUndefined(registrySymbol) && IsObject(root.Reflect) && Object.isExtensible(root.Reflect)) {
            metadataRegistry2 = root.Reflect[registrySymbol];
          }
          if (IsUndefined(metadataRegistry2)) {
            metadataRegistry2 = CreateMetadataRegistry();
          }
          if (!IsUndefined(registrySymbol) && IsObject(root.Reflect) && Object.isExtensible(root.Reflect)) {
            Object.defineProperty(root.Reflect, registrySymbol, {
              enumerable: false,
              configurable: false,
              writable: false,
              value: metadataRegistry2
            });
          }
          return metadataRegistry2;
        }
        function CreateMetadataProvider(registry) {
          var metadata2 = new _WeakMap();
          var provider = {
            isProviderFor: function(O, P) {
              var targetMetadata = metadata2.get(O);
              if (IsUndefined(targetMetadata))
                return false;
              return targetMetadata.has(P);
            },
            OrdinaryDefineOwnMetadata: OrdinaryDefineOwnMetadata2,
            OrdinaryHasOwnMetadata: OrdinaryHasOwnMetadata2,
            OrdinaryGetOwnMetadata: OrdinaryGetOwnMetadata2,
            OrdinaryOwnMetadataKeys: OrdinaryOwnMetadataKeys2,
            OrdinaryDeleteMetadata
          };
          metadataRegistry.registerProvider(provider);
          return provider;
          function GetOrCreateMetadataMap(O, P, Create) {
            var targetMetadata = metadata2.get(O);
            var createdTargetMetadata = false;
            if (IsUndefined(targetMetadata)) {
              if (!Create)
                return void 0;
              targetMetadata = new _Map();
              metadata2.set(O, targetMetadata);
              createdTargetMetadata = true;
            }
            var metadataMap = targetMetadata.get(P);
            if (IsUndefined(metadataMap)) {
              if (!Create)
                return void 0;
              metadataMap = new _Map();
              targetMetadata.set(P, metadataMap);
              if (!registry.setProvider(O, P, provider)) {
                targetMetadata.delete(P);
                if (createdTargetMetadata) {
                  metadata2.delete(O);
                }
                throw new Error("Wrong provider for target.");
              }
            }
            return metadataMap;
          }
          function OrdinaryHasOwnMetadata2(MetadataKey, O, P) {
            var metadataMap = GetOrCreateMetadataMap(
              O,
              P,
              /*Create*/
              false
            );
            if (IsUndefined(metadataMap))
              return false;
            return ToBoolean(metadataMap.has(MetadataKey));
          }
          function OrdinaryGetOwnMetadata2(MetadataKey, O, P) {
            var metadataMap = GetOrCreateMetadataMap(
              O,
              P,
              /*Create*/
              false
            );
            if (IsUndefined(metadataMap))
              return void 0;
            return metadataMap.get(MetadataKey);
          }
          function OrdinaryDefineOwnMetadata2(MetadataKey, MetadataValue, O, P) {
            var metadataMap = GetOrCreateMetadataMap(
              O,
              P,
              /*Create*/
              true
            );
            metadataMap.set(MetadataKey, MetadataValue);
          }
          function OrdinaryOwnMetadataKeys2(O, P) {
            var keys = [];
            var metadataMap = GetOrCreateMetadataMap(
              O,
              P,
              /*Create*/
              false
            );
            if (IsUndefined(metadataMap))
              return keys;
            var keysObj = metadataMap.keys();
            var iterator = GetIterator(keysObj);
            var k = 0;
            while (true) {
              var next = IteratorStep(iterator);
              if (!next) {
                keys.length = k;
                return keys;
              }
              var nextValue = IteratorValue(next);
              try {
                keys[k] = nextValue;
              } catch (e) {
                try {
                  IteratorClose(iterator);
                } finally {
                  throw e;
                }
              }
              k++;
            }
          }
          function OrdinaryDeleteMetadata(MetadataKey, O, P) {
            var metadataMap = GetOrCreateMetadataMap(
              O,
              P,
              /*Create*/
              false
            );
            if (IsUndefined(metadataMap))
              return false;
            if (!metadataMap.delete(MetadataKey))
              return false;
            if (metadataMap.size === 0) {
              var targetMetadata = metadata2.get(O);
              if (!IsUndefined(targetMetadata)) {
                targetMetadata.delete(P);
                if (targetMetadata.size === 0) {
                  metadata2.delete(targetMetadata);
                }
              }
            }
            return true;
          }
        }
        function CreateFallbackProvider(reflect) {
          var defineMetadata2 = reflect.defineMetadata, hasOwnMetadata2 = reflect.hasOwnMetadata, getOwnMetadata2 = reflect.getOwnMetadata, getOwnMetadataKeys2 = reflect.getOwnMetadataKeys, deleteMetadata2 = reflect.deleteMetadata;
          var metadataOwner = new _WeakMap();
          var provider = {
            isProviderFor: function(O, P) {
              var metadataPropertySet = metadataOwner.get(O);
              if (!IsUndefined(metadataPropertySet) && metadataPropertySet.has(P)) {
                return true;
              }
              if (getOwnMetadataKeys2(O, P).length) {
                if (IsUndefined(metadataPropertySet)) {
                  metadataPropertySet = new _Set();
                  metadataOwner.set(O, metadataPropertySet);
                }
                metadataPropertySet.add(P);
                return true;
              }
              return false;
            },
            OrdinaryDefineOwnMetadata: defineMetadata2,
            OrdinaryHasOwnMetadata: hasOwnMetadata2,
            OrdinaryGetOwnMetadata: getOwnMetadata2,
            OrdinaryOwnMetadataKeys: getOwnMetadataKeys2,
            OrdinaryDeleteMetadata: deleteMetadata2
          };
          return provider;
        }
        function GetMetadataProvider(O, P, Create) {
          var registeredProvider = metadataRegistry.getProvider(O, P);
          if (!IsUndefined(registeredProvider)) {
            return registeredProvider;
          }
          if (Create) {
            if (metadataRegistry.setProvider(O, P, metadataProvider)) {
              return metadataProvider;
            }
            throw new Error("Illegal state.");
          }
          return void 0;
        }
        function CreateMapPolyfill() {
          var cacheSentinel = {};
          var arraySentinel = [];
          var MapIterator = (
            /** @class */
            (function() {
              function MapIterator2(keys, values, selector) {
                this._index = 0;
                this._keys = keys;
                this._values = values;
                this._selector = selector;
              }
              MapIterator2.prototype["@@iterator"] = function() {
                return this;
              };
              MapIterator2.prototype[iteratorSymbol] = function() {
                return this;
              };
              MapIterator2.prototype.next = function() {
                var index = this._index;
                if (index >= 0 && index < this._keys.length) {
                  var result = this._selector(this._keys[index], this._values[index]);
                  if (index + 1 >= this._keys.length) {
                    this._index = -1;
                    this._keys = arraySentinel;
                    this._values = arraySentinel;
                  } else {
                    this._index++;
                  }
                  return { value: result, done: false };
                }
                return { value: void 0, done: true };
              };
              MapIterator2.prototype.throw = function(error) {
                if (this._index >= 0) {
                  this._index = -1;
                  this._keys = arraySentinel;
                  this._values = arraySentinel;
                }
                throw error;
              };
              MapIterator2.prototype.return = function(value) {
                if (this._index >= 0) {
                  this._index = -1;
                  this._keys = arraySentinel;
                  this._values = arraySentinel;
                }
                return { value, done: true };
              };
              return MapIterator2;
            })()
          );
          var Map2 = (
            /** @class */
            (function() {
              function Map3() {
                this._keys = [];
                this._values = [];
                this._cacheKey = cacheSentinel;
                this._cacheIndex = -2;
              }
              Object.defineProperty(Map3.prototype, "size", {
                get: function() {
                  return this._keys.length;
                },
                enumerable: true,
                configurable: true
              });
              Map3.prototype.has = function(key) {
                return this._find(
                  key,
                  /*insert*/
                  false
                ) >= 0;
              };
              Map3.prototype.get = function(key) {
                var index = this._find(
                  key,
                  /*insert*/
                  false
                );
                return index >= 0 ? this._values[index] : void 0;
              };
              Map3.prototype.set = function(key, value) {
                var index = this._find(
                  key,
                  /*insert*/
                  true
                );
                this._values[index] = value;
                return this;
              };
              Map3.prototype.delete = function(key) {
                var index = this._find(
                  key,
                  /*insert*/
                  false
                );
                if (index >= 0) {
                  var size = this._keys.length;
                  for (var i = index + 1; i < size; i++) {
                    this._keys[i - 1] = this._keys[i];
                    this._values[i - 1] = this._values[i];
                  }
                  this._keys.length--;
                  this._values.length--;
                  if (SameValueZero(key, this._cacheKey)) {
                    this._cacheKey = cacheSentinel;
                    this._cacheIndex = -2;
                  }
                  return true;
                }
                return false;
              };
              Map3.prototype.clear = function() {
                this._keys.length = 0;
                this._values.length = 0;
                this._cacheKey = cacheSentinel;
                this._cacheIndex = -2;
              };
              Map3.prototype.keys = function() {
                return new MapIterator(this._keys, this._values, getKey);
              };
              Map3.prototype.values = function() {
                return new MapIterator(this._keys, this._values, getValue);
              };
              Map3.prototype.entries = function() {
                return new MapIterator(this._keys, this._values, getEntry);
              };
              Map3.prototype["@@iterator"] = function() {
                return this.entries();
              };
              Map3.prototype[iteratorSymbol] = function() {
                return this.entries();
              };
              Map3.prototype._find = function(key, insert) {
                if (!SameValueZero(this._cacheKey, key)) {
                  this._cacheIndex = -1;
                  for (var i = 0; i < this._keys.length; i++) {
                    if (SameValueZero(this._keys[i], key)) {
                      this._cacheIndex = i;
                      break;
                    }
                  }
                }
                if (this._cacheIndex < 0 && insert) {
                  this._cacheIndex = this._keys.length;
                  this._keys.push(key);
                  this._values.push(void 0);
                }
                return this._cacheIndex;
              };
              return Map3;
            })()
          );
          return Map2;
          function getKey(key, _) {
            return key;
          }
          function getValue(_, value) {
            return value;
          }
          function getEntry(key, value) {
            return [key, value];
          }
        }
        function CreateSetPolyfill() {
          var Set2 = (
            /** @class */
            (function() {
              function Set3() {
                this._map = new _Map();
              }
              Object.defineProperty(Set3.prototype, "size", {
                get: function() {
                  return this._map.size;
                },
                enumerable: true,
                configurable: true
              });
              Set3.prototype.has = function(value) {
                return this._map.has(value);
              };
              Set3.prototype.add = function(value) {
                return this._map.set(value, value), this;
              };
              Set3.prototype.delete = function(value) {
                return this._map.delete(value);
              };
              Set3.prototype.clear = function() {
                this._map.clear();
              };
              Set3.prototype.keys = function() {
                return this._map.keys();
              };
              Set3.prototype.values = function() {
                return this._map.keys();
              };
              Set3.prototype.entries = function() {
                return this._map.entries();
              };
              Set3.prototype["@@iterator"] = function() {
                return this.keys();
              };
              Set3.prototype[iteratorSymbol] = function() {
                return this.keys();
              };
              return Set3;
            })()
          );
          return Set2;
        }
        function CreateWeakMapPolyfill() {
          var UUID_SIZE = 16;
          var keys = HashMap.create();
          var rootKey = CreateUniqueKey();
          return (
            /** @class */
            (function() {
              function WeakMap2() {
                this._key = CreateUniqueKey();
              }
              WeakMap2.prototype.has = function(target) {
                var table = GetOrCreateWeakMapTable(
                  target,
                  /*create*/
                  false
                );
                return table !== void 0 ? HashMap.has(table, this._key) : false;
              };
              WeakMap2.prototype.get = function(target) {
                var table = GetOrCreateWeakMapTable(
                  target,
                  /*create*/
                  false
                );
                return table !== void 0 ? HashMap.get(table, this._key) : void 0;
              };
              WeakMap2.prototype.set = function(target, value) {
                var table = GetOrCreateWeakMapTable(
                  target,
                  /*create*/
                  true
                );
                table[this._key] = value;
                return this;
              };
              WeakMap2.prototype.delete = function(target) {
                var table = GetOrCreateWeakMapTable(
                  target,
                  /*create*/
                  false
                );
                return table !== void 0 ? delete table[this._key] : false;
              };
              WeakMap2.prototype.clear = function() {
                this._key = CreateUniqueKey();
              };
              return WeakMap2;
            })()
          );
          function CreateUniqueKey() {
            var key;
            do
              key = "@@WeakMap@@" + CreateUUID();
            while (HashMap.has(keys, key));
            keys[key] = true;
            return key;
          }
          function GetOrCreateWeakMapTable(target, create) {
            if (!hasOwn.call(target, rootKey)) {
              if (!create)
                return void 0;
              Object.defineProperty(target, rootKey, { value: HashMap.create() });
            }
            return target[rootKey];
          }
          function FillRandomBytes(buffer, size) {
            for (var i = 0; i < size; ++i)
              buffer[i] = Math.random() * 255 | 0;
            return buffer;
          }
          function GenRandomBytes(size) {
            if (typeof Uint8Array === "function") {
              var array = new Uint8Array(size);
              if (typeof crypto !== "undefined") {
                crypto.getRandomValues(array);
              } else if (typeof msCrypto !== "undefined") {
                msCrypto.getRandomValues(array);
              } else {
                FillRandomBytes(array, size);
              }
              return array;
            }
            return FillRandomBytes(new Array(size), size);
          }
          function CreateUUID() {
            var data = GenRandomBytes(UUID_SIZE);
            data[6] = data[6] & 79 | 64;
            data[8] = data[8] & 191 | 128;
            var result = "";
            for (var offset = 0; offset < UUID_SIZE; ++offset) {
              var byte = data[offset];
              if (offset === 4 || offset === 6 || offset === 8)
                result += "-";
              if (byte < 16)
                result += "0";
              result += byte.toString(16).toLowerCase();
            }
            return result;
          }
        }
        function MakeDictionary(obj) {
          obj.__ = void 0;
          delete obj.__;
          return obj;
        }
      });
    })(Reflect2 || (Reflect2 = {}));
  }
});

// scripts/testing/spec-cli.mjs
var import__ = __toESM(require__(), 1);
import { createHash as createHash2 } from "node:crypto";
import { realpathSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

// assets/browser-testing/specification-manifest.schema.json
var specification_manifest_schema_default = {
  $schema: "https://json-schema.org/draft/2020-12/schema",
  $id: "https://project-agent-factory.local/schemas/specification-manifest.schema.json",
  type: "object",
  required: ["schemaVersion", "runtimeVersion", "gitlab", "approval", "sources", "scenarios", "diagnostics", "specReady", "artifacts"],
  properties: {
    schemaVersion: { const: 1 },
    runtimeVersion: { type: "string", pattern: "^[0-9]+\\.[0-9]+\\.[0-9]+$" },
    gitlab: {
      type: "object",
      required: ["projectPath", "commitSha", "bundlePath"],
      properties: {
        projectPath: { type: "string", pattern: "^[a-zA-Z0-9_.-]+(?:/[a-zA-Z0-9_.-]+)+$" },
        commitSha: { type: "string", pattern: "^[0-9a-f]{40}$" },
        bundlePath: { type: "string", minLength: 1 },
        mergeRequest: {
          type: "object",
          required: ["iid", "url"],
          properties: { iid: { type: "integer", minimum: 1 }, url: { type: "string", format: "uri" } },
          additionalProperties: false
        }
      },
      additionalProperties: false
    },
    approval: {
      type: "object",
      required: ["owner", "status"],
      properties: {
        owner: { type: "string", minLength: 1 },
        status: { enum: ["draft", "in-review", "approved", "rejected"] },
        approvedAt: { type: "string", format: "date-time" }
      },
      additionalProperties: false
    },
    sources: {
      type: "array",
      items: {
        type: "object",
        required: ["path", "sha256"],
        properties: { path: { type: "string", minLength: 1 }, sha256: { $ref: "#/$defs/hash" } },
        additionalProperties: false
      }
    },
    scenarios: {
      type: "array",
      minItems: 1,
      items: {
        type: "object",
        required: ["id", "signature"],
        properties: { id: { type: "string", pattern: "^bdd-[0-9a-f]{12}$" }, signature: { $ref: "#/$defs/hash" } },
        additionalProperties: false
      }
    },
    diagnostics: {
      type: "object",
      required: ["errors", "warnings", "infos", "unresolved"],
      properties: {
        errors: { type: "integer", minimum: 0 },
        warnings: { type: "integer", minimum: 0 },
        infos: { type: "integer", minimum: 0 },
        unresolved: { type: "integer", minimum: 0 }
      },
      additionalProperties: false
    },
    specReady: { type: "boolean" },
    artifacts: {
      type: "array",
      minItems: 3,
      items: {
        type: "object",
        required: ["path", "kind", "sha256"],
        properties: {
          path: { type: "string", minLength: 1 },
          kind: { enum: ["feature", "registry", "diagnostics", "supporting"] },
          sha256: { $ref: "#/$defs/hash" }
        },
        additionalProperties: false
      }
    }
  },
  $defs: { hash: { type: "string", pattern: "^[0-9a-f]{64}$" } },
  allOf: [
    {
      if: { properties: { specReady: { const: true } }, required: ["specReady"] },
      then: {
        properties: {
          approval: { properties: { status: { const: "approved" } } },
          diagnostics: { properties: { errors: { const: 0 }, unresolved: { const: 0 } } }
        }
      }
    },
    {
      if: { properties: { approval: { properties: { status: { const: "approved" } }, required: ["status"] } } },
      then: { properties: { approval: { required: ["approvedAt"] } } }
    }
  ],
  additionalProperties: false
};

// assets/browser-testing/bdd-registry.schema.json
var bdd_registry_schema_default = {
  $schema: "https://json-schema.org/draft/2020-12/schema",
  title: "BDD source registry",
  type: "object",
  required: [
    "schemaVersion",
    "scenarios",
    "issues",
    "drafts"
  ],
  properties: {
    schemaVersion: {
      const: 1
    },
    scenarios: {
      type: "array",
      items: {
        $schema: "https://json-schema.org/draft/2020-12/schema",
        title: "Scenario",
        type: "object",
        required: [
          "id",
          "key",
          "feature",
          "title",
          "review",
          "conflict",
          "variants",
          "expectedInstances"
        ],
        properties: {
          id: {
            type: "string",
            pattern: "^bdd-[a-f0-9]{12}$"
          },
          key: {
            type: "string",
            minLength: 1
          },
          feature: {
            type: "string"
          },
          title: {
            type: "string"
          },
          review: {
            const: "needs-review"
          },
          conflict: {
            type: "boolean"
          },
          variants: {
            type: "array",
            items: {
              $schema: "https://json-schema.org/draft/2020-12/schema",
              title: "Scenario variant",
              type: "object",
              required: [
                "signature",
                "steps",
                "expectations",
                "sources"
              ],
              properties: {
                signature: {
                  type: "string",
                  pattern: "^[a-f0-9]{64}$"
                },
                steps: {
                  type: "array",
                  items: {
                    $schema: "https://json-schema.org/draft/2020-12/schema",
                    title: "Step",
                    type: "object",
                    required: [
                      "keyword",
                      "text",
                      "line"
                    ],
                    properties: {
                      keyword: {
                        type: "string",
                        minLength: 1
                      },
                      text: {
                        type: "string"
                      },
                      line: {
                        type: "integer",
                        minimum: 1
                      },
                      table: {
                        type: "array",
                        items: {
                          type: "array",
                          items: {
                            type: "string"
                          }
                        }
                      },
                      docString: {
                        type: "string"
                      },
                      details: {
                        type: "array",
                        items: {
                          type: "string"
                        }
                      }
                    },
                    additionalProperties: false
                  }
                },
                expectations: {
                  type: "array",
                  items: {
                    $schema: "https://json-schema.org/draft/2020-12/schema",
                    title: "Expected outcome",
                    type: "object",
                    required: [
                      "id",
                      "text",
                      "line"
                    ],
                    properties: {
                      id: {
                        type: "string",
                        minLength: 1
                      },
                      text: {
                        type: "string"
                      },
                      line: {
                        type: "integer",
                        minimum: 1
                      }
                    },
                    additionalProperties: false
                  }
                },
                sources: {
                  type: "array",
                  items: {
                    $schema: "https://json-schema.org/draft/2020-12/schema",
                    title: "Source",
                    type: "object",
                    required: [
                      "path",
                      "line",
                      "sha256"
                    ],
                    properties: {
                      path: {
                        type: "string",
                        minLength: 1
                      },
                      line: {
                        type: "integer",
                        minimum: 1
                      },
                      sha256: {
                        type: "string",
                        pattern: "^[a-f0-9]{64}$"
                      }
                    },
                    additionalProperties: false
                  },
                  minItems: 1
                }
              },
              additionalProperties: false
            },
            minItems: 1
          },
          expectedInstances: {
            type: "integer",
            minimum: 0
          },
          rules: {
            type: "array",
            items: {
              type: "string"
            }
          }
        },
        additionalProperties: false
      }
    },
    issues: {
      type: "array",
      items: {
        $schema: "https://json-schema.org/draft/2020-12/schema",
        title: "Diagnostic",
        type: "object",
        required: [
          "source",
          "line",
          "code"
        ],
        properties: {
          source: {
            type: "string",
            minLength: 1
          },
          line: {
            type: "integer",
            minimum: 1
          },
          code: {
            type: "string",
            minLength: 1
          },
          message: {
            type: "string",
            minLength: 1
          }
        },
        additionalProperties: false
      }
    },
    drafts: {
      type: "array",
      items: {
        $schema: "https://json-schema.org/draft/2020-12/schema",
        title: "Draft",
        type: "object",
        required: [
          "source",
          "feature",
          "text"
        ],
        properties: {
          source: {
            type: "string",
            minLength: 1
          },
          feature: {
            type: "string"
          },
          text: {
            type: "string",
            minLength: 1
          }
        },
        additionalProperties: false
      }
    }
  },
  additionalProperties: false,
  $id: "https://project-agent-factory.local/schemas/bdd-registry.schema.json"
};

// scripts/testing/bdd.mjs
import { createHash } from "node:crypto";

// node_modules/@cucumber/gherkin/dist/AstNode.js
var AstNode = class {
  ruleType;
  // biome-ignore lint/suspicious/noExplicitAny: keys and values are heterogeneous AST entries
  subItems = /* @__PURE__ */ new Map();
  constructor(ruleType) {
    this.ruleType = ruleType;
  }
  // biome-ignore lint/suspicious/noExplicitAny: keys and values are heterogeneous AST entries
  add(type, obj) {
    let items = this.subItems.get(type);
    if (items === void 0) {
      items = [];
      this.subItems.set(type, items);
    }
    items.push(obj);
  }
  getSingle(ruleType) {
    return (this.subItems.get(ruleType) || [])[0];
  }
  getItems(ruleType) {
    return this.subItems.get(ruleType) || [];
  }
  getToken(tokenType) {
    return (this.subItems.get(tokenType) || [])[0];
  }
  getTokens(tokenType) {
    return this.subItems.get(tokenType) || [];
  }
};

// node_modules/@cucumber/gherkin/dist/Errors.js
var GherkinException = class extends Error {
  errors;
  location;
  constructor(message) {
    super(message);
    const actualProto = new.target.prototype;
    if (Object.setPrototypeOf) {
      Object.setPrototypeOf(this, actualProto);
    } else {
      this.__proto__ = actualProto;
    }
  }
  static _create(message, location) {
    const column = location != null ? location.column || 0 : -1;
    const line = location != null ? location.line || 0 : -1;
    const m = `(${line}:${column}): ${message}`;
    const err = new this(m);
    err.location = location;
    return err;
  }
};
var ParserException = class _ParserException extends GherkinException {
  static create(message, line, column) {
    const err = new _ParserException(`(${line}:${column}): ${message}`);
    err.location = { line, column };
    return err;
  }
};
var CompositeParserException = class _CompositeParserException extends GherkinException {
  static create(errors) {
    const message = `Parser errors:
${errors.map((e) => e.message).join("\n")}`;
    const err = new _CompositeParserException(message);
    err.errors = errors;
    return err;
  }
};
var AstBuilderException = class _AstBuilderException extends GherkinException {
  static create(message, location) {
    return _AstBuilderException._create(message, location);
  }
};
var NoSuchLanguageException = class _NoSuchLanguageException extends GherkinException {
  static create(language, location) {
    const message = `Language not supported: ${language}`;
    return _NoSuchLanguageException._create(message, location);
  }
};

// node_modules/@cucumber/gherkin/dist/TokenExceptions.js
var UnexpectedTokenException = class _UnexpectedTokenException extends GherkinException {
  static create(token, expectedTokenTypes) {
    const message = `expected: ${expectedTokenTypes.join(", ")}, got '${token.getTokenValue().trim()}'`;
    const location = tokenLocation(token);
    return _UnexpectedTokenException._create(message, location);
  }
};
var UnexpectedEOFException = class _UnexpectedEOFException extends GherkinException {
  static create(token, expectedTokenTypes) {
    const message = `unexpected end of file, expected: ${expectedTokenTypes.join(", ")}`;
    const location = tokenLocation(token);
    return _UnexpectedEOFException._create(message, location);
  }
};
function tokenLocation(token) {
  return token.location?.line && token.line && token.line.indent !== void 0 ? {
    line: token.location.line,
    column: token.line.indent + 1
  } : token.location;
}

// node_modules/@cucumber/gherkin/dist/TokenScanner.js
var TokenScanner = class {
  makeToken;
  lineNumber = 0;
  lines;
  constructor(source, makeToken) {
    this.makeToken = makeToken;
    this.lines = source.split(/\r?\n/);
    if (this.lines.length > 0 && this.lines[this.lines.length - 1].trim() === "") {
      this.lines.pop();
    }
  }
  read() {
    const line = this.lines[this.lineNumber++];
    const location = {
      line: this.lineNumber
    };
    return this.makeToken(line, location);
  }
};

// node_modules/@cucumber/gherkin/dist/countSymbols.js
var regexAstralSymbols = /[\uD800-\uDBFF][\uDC00-\uDFFF]/g;
function countSymbols(s) {
  return s.replace(regexAstralSymbols, "_").length;
}

// node_modules/@cucumber/gherkin/dist/GherkinLine.js
var GherkinLine = class {
  lineText;
  lineNumber;
  trimmedLineText;
  isEmpty;
  indent;
  column;
  text;
  constructor(lineText, lineNumber) {
    this.lineText = lineText;
    this.lineNumber = lineNumber;
    this.trimmedLineText = lineText.replace(/^\s+/g, "");
    this.isEmpty = this.trimmedLineText.length === 0;
    this.indent = countSymbols(lineText) - countSymbols(this.trimmedLineText);
  }
  startsWith(prefix) {
    return this.trimmedLineText.indexOf(prefix) === 0;
  }
  startsWithTitleKeyword(keyword) {
    return this.startsWith(`${keyword}:`);
  }
  match(regexp) {
    return this.trimmedLineText.match(regexp);
  }
  getLineText(indentToRemove) {
    if (indentToRemove < 0 || indentToRemove > this.indent) {
      return this.trimmedLineText;
    } else {
      return this.lineText.substring(indentToRemove);
    }
  }
  getRestTrimmed(length) {
    return this.trimmedLineText.substring(length).trim();
  }
  getTableCells() {
    const cells = [];
    let col = 0;
    let startCol = col + 1;
    let cell = "";
    let firstCell = true;
    while (col < this.trimmedLineText.length) {
      let chr = this.trimmedLineText[col];
      col++;
      if (chr === "|") {
        if (firstCell) {
          firstCell = false;
        } else {
          const trimmedLeft = cell.replace(/^[ \t\v\f\r\u0085\u00A0]*/g, "");
          const trimmed = trimmedLeft.replace(/[ \t\v\f\r\u0085\u00A0]*$/g, "");
          const cellIndent = cell.length - trimmedLeft.length;
          const span = {
            column: this.indent + startCol + cellIndent,
            text: trimmed
          };
          cells.push(span);
        }
        cell = "";
        startCol = col + 1;
      } else if (chr === "\\") {
        chr = this.trimmedLineText[col];
        col += 1;
        if (chr === "n") {
          cell += "\n";
        } else {
          if (chr !== "|" && chr !== "\\") {
            cell += "\\";
          }
          cell += chr;
        }
      } else {
        cell += chr;
      }
    }
    return cells;
  }
};

// node_modules/@cucumber/gherkin/dist/Parser.js
var Token = class {
  line;
  location;
  isEof;
  matchedText;
  matchedType;
  matchedItems;
  matchedKeyword;
  matchedIndent;
  matchedGherkinDialect;
  matchedKeywordType;
  constructor(line, location) {
    this.line = line;
    this.location = location;
    this.isEof = !line;
  }
  getTokenValue() {
    return this.isEof ? "EOF" : this.line.getLineText(-1);
  }
};
var TokenType;
(function(TokenType2) {
  TokenType2[TokenType2["None"] = 0] = "None";
  TokenType2[TokenType2["EOF"] = 1] = "EOF";
  TokenType2[TokenType2["Empty"] = 2] = "Empty";
  TokenType2[TokenType2["Comment"] = 3] = "Comment";
  TokenType2[TokenType2["TagLine"] = 4] = "TagLine";
  TokenType2[TokenType2["FeatureLine"] = 5] = "FeatureLine";
  TokenType2[TokenType2["RuleLine"] = 6] = "RuleLine";
  TokenType2[TokenType2["BackgroundLine"] = 7] = "BackgroundLine";
  TokenType2[TokenType2["ScenarioLine"] = 8] = "ScenarioLine";
  TokenType2[TokenType2["ExamplesLine"] = 9] = "ExamplesLine";
  TokenType2[TokenType2["StepLine"] = 10] = "StepLine";
  TokenType2[TokenType2["DocStringSeparator"] = 11] = "DocStringSeparator";
  TokenType2[TokenType2["TableRow"] = 12] = "TableRow";
  TokenType2[TokenType2["Language"] = 13] = "Language";
  TokenType2[TokenType2["Other"] = 14] = "Other";
})(TokenType || (TokenType = {}));
var RuleType;
(function(RuleType2) {
  RuleType2[RuleType2["None"] = 0] = "None";
  RuleType2[RuleType2["_EOF"] = 1] = "_EOF";
  RuleType2[RuleType2["_Empty"] = 2] = "_Empty";
  RuleType2[RuleType2["_Comment"] = 3] = "_Comment";
  RuleType2[RuleType2["_TagLine"] = 4] = "_TagLine";
  RuleType2[RuleType2["_FeatureLine"] = 5] = "_FeatureLine";
  RuleType2[RuleType2["_RuleLine"] = 6] = "_RuleLine";
  RuleType2[RuleType2["_BackgroundLine"] = 7] = "_BackgroundLine";
  RuleType2[RuleType2["_ScenarioLine"] = 8] = "_ScenarioLine";
  RuleType2[RuleType2["_ExamplesLine"] = 9] = "_ExamplesLine";
  RuleType2[RuleType2["_StepLine"] = 10] = "_StepLine";
  RuleType2[RuleType2["_DocStringSeparator"] = 11] = "_DocStringSeparator";
  RuleType2[RuleType2["_TableRow"] = 12] = "_TableRow";
  RuleType2[RuleType2["_Language"] = 13] = "_Language";
  RuleType2[RuleType2["_Other"] = 14] = "_Other";
  RuleType2[RuleType2["GherkinDocument"] = 15] = "GherkinDocument";
  RuleType2[RuleType2["Feature"] = 16] = "Feature";
  RuleType2[RuleType2["FeatureHeader"] = 17] = "FeatureHeader";
  RuleType2[RuleType2["Rule"] = 18] = "Rule";
  RuleType2[RuleType2["RuleHeader"] = 19] = "RuleHeader";
  RuleType2[RuleType2["Background"] = 20] = "Background";
  RuleType2[RuleType2["ScenarioDefinition"] = 21] = "ScenarioDefinition";
  RuleType2[RuleType2["Scenario"] = 22] = "Scenario";
  RuleType2[RuleType2["ExamplesDefinition"] = 23] = "ExamplesDefinition";
  RuleType2[RuleType2["Examples"] = 24] = "Examples";
  RuleType2[RuleType2["ExamplesTable"] = 25] = "ExamplesTable";
  RuleType2[RuleType2["Step"] = 26] = "Step";
  RuleType2[RuleType2["StepArg"] = 27] = "StepArg";
  RuleType2[RuleType2["DataTableAndMaybeDocString"] = 28] = "DataTableAndMaybeDocString";
  RuleType2[RuleType2["DocStringAndMaybeDataTable"] = 29] = "DocStringAndMaybeDataTable";
  RuleType2[RuleType2["DataTable"] = 30] = "DataTable";
  RuleType2[RuleType2["DocString"] = 31] = "DocString";
  RuleType2[RuleType2["Tags"] = 32] = "Tags";
  RuleType2[RuleType2["DescriptionHelper"] = 33] = "DescriptionHelper";
  RuleType2[RuleType2["Description"] = 34] = "Description";
})(RuleType || (RuleType = {}));
var Parser = class {
  builder;
  tokenMatcher;
  stopAtFirstError = false;
  context;
  constructor(builder, tokenMatcher) {
    this.builder = builder;
    this.tokenMatcher = tokenMatcher;
  }
  parse(gherkinSource) {
    const tokenScanner = new TokenScanner(gherkinSource, (line, location) => {
      const gherkinLine = line === null || line === void 0 ? null : new GherkinLine(line, location.line);
      return new Token(gherkinLine, location);
    });
    this.builder.reset();
    this.tokenMatcher.reset();
    this.context = {
      tokenScanner,
      tokenQueue: [],
      errors: []
    };
    this.startRule(this.context, RuleType.GherkinDocument);
    let state = 0;
    let token = null;
    while (true) {
      token = this.readToken(this.context);
      state = this.matchToken(state, token, this.context);
      if (token.isEof)
        break;
    }
    this.endRule(this.context);
    if (this.context.errors.length > 0) {
      throw CompositeParserException.create(this.context.errors);
    }
    return this.getResult();
  }
  addError(context, error) {
    if (!context.errors.map((e) => {
      return e.message;
    }).includes(error.message)) {
      context.errors.push(error);
      if (context.errors.length > 10)
        throw CompositeParserException.create(context.errors);
    }
  }
  startRule(context, ruleType) {
    this.handleAstError(context, () => this.builder.startRule(ruleType));
  }
  endRule(context) {
    this.handleAstError(context, () => this.builder.endRule());
  }
  build(context, token) {
    this.handleAstError(context, () => this.builder.build(token));
  }
  getResult() {
    return this.builder.getResult();
  }
  handleAstError(context, action) {
    this.handleExternalError(context, true, action);
  }
  handleExternalError(context, defaultValue, action) {
    if (this.stopAtFirstError)
      return action();
    try {
      return action();
    } catch (e) {
      if (e instanceof CompositeParserException) {
        e.errors.forEach((error) => this.addError(context, error));
      } else if (e instanceof ParserException || e instanceof AstBuilderException || e instanceof UnexpectedTokenException || e instanceof NoSuchLanguageException) {
        this.addError(context, e);
      } else {
        throw e;
      }
    }
    return defaultValue;
  }
  readToken(context) {
    return context.tokenQueue.length > 0 ? context.tokenQueue.shift() : context.tokenScanner.read();
  }
  matchToken(state, token, context) {
    switch (state) {
      case 0:
        return this.matchTokenAt_0(token, context);
      case 1:
        return this.matchTokenAt_1(token, context);
      case 2:
        return this.matchTokenAt_2(token, context);
      case 3:
        return this.matchTokenAt_3(token, context);
      case 4:
        return this.matchTokenAt_4(token, context);
      case 5:
        return this.matchTokenAt_5(token, context);
      case 6:
        return this.matchTokenAt_6(token, context);
      case 7:
        return this.matchTokenAt_7(token, context);
      case 8:
        return this.matchTokenAt_8(token, context);
      case 9:
        return this.matchTokenAt_9(token, context);
      case 10:
        return this.matchTokenAt_10(token, context);
      case 11:
        return this.matchTokenAt_11(token, context);
      case 12:
        return this.matchTokenAt_12(token, context);
      case 13:
        return this.matchTokenAt_13(token, context);
      case 14:
        return this.matchTokenAt_14(token, context);
      case 15:
        return this.matchTokenAt_15(token, context);
      case 16:
        return this.matchTokenAt_16(token, context);
      case 17:
        return this.matchTokenAt_17(token, context);
      case 18:
        return this.matchTokenAt_18(token, context);
      case 19:
        return this.matchTokenAt_19(token, context);
      case 20:
        return this.matchTokenAt_20(token, context);
      case 21:
        return this.matchTokenAt_21(token, context);
      case 22:
        return this.matchTokenAt_22(token, context);
      case 23:
        return this.matchTokenAt_23(token, context);
      case 24:
        return this.matchTokenAt_24(token, context);
      case 25:
        return this.matchTokenAt_25(token, context);
      case 26:
        return this.matchTokenAt_26(token, context);
      case 27:
        return this.matchTokenAt_27(token, context);
      case 28:
        return this.matchTokenAt_28(token, context);
      case 29:
        return this.matchTokenAt_29(token, context);
      case 30:
        return this.matchTokenAt_30(token, context);
      case 31:
        return this.matchTokenAt_31(token, context);
      case 32:
        return this.matchTokenAt_32(token, context);
      case 33:
        return this.matchTokenAt_33(token, context);
      case 34:
        return this.matchTokenAt_34(token, context);
      case 35:
        return this.matchTokenAt_35(token, context);
      case 36:
        return this.matchTokenAt_36(token, context);
      case 37:
        return this.matchTokenAt_37(token, context);
      case 38:
        return this.matchTokenAt_38(token, context);
      case 39:
        return this.matchTokenAt_39(token, context);
      case 40:
        return this.matchTokenAt_40(token, context);
      case 41:
        return this.matchTokenAt_41(token, context);
      case 43:
        return this.matchTokenAt_43(token, context);
      case 44:
        return this.matchTokenAt_44(token, context);
      case 45:
        return this.matchTokenAt_45(token, context);
      case 46:
        return this.matchTokenAt_46(token, context);
      case 47:
        return this.matchTokenAt_47(token, context);
      case 48:
        return this.matchTokenAt_48(token, context);
      case 49:
        return this.matchTokenAt_49(token, context);
      case 50:
        return this.matchTokenAt_50(token, context);
      case 51:
        return this.matchTokenAt_51(token, context);
      case 52:
        return this.matchTokenAt_52(token, context);
      case 53:
        return this.matchTokenAt_53(token, context);
      case 54:
        return this.matchTokenAt_54(token, context);
      default:
        throw new Error("Unknown state: " + state);
    }
  }
  // Start
  matchTokenAt_0(token, context) {
    if (this.match_EOF(context, token)) {
      this.build(context, token);
      return 42;
    }
    if (this.match_Language(context, token)) {
      this.startRule(context, RuleType.Feature);
      this.startRule(context, RuleType.FeatureHeader);
      this.build(context, token);
      return 1;
    }
    if (this.match_TagLine(context, token)) {
      this.startRule(context, RuleType.Feature);
      this.startRule(context, RuleType.FeatureHeader);
      this.startRule(context, RuleType.Tags);
      this.build(context, token);
      return 2;
    }
    if (this.match_FeatureLine(context, token)) {
      this.startRule(context, RuleType.Feature);
      this.startRule(context, RuleType.FeatureHeader);
      this.build(context, token);
      return 3;
    }
    if (this.match_Comment(context, token)) {
      this.build(context, token);
      return 0;
    }
    if (this.match_Empty(context, token)) {
      this.build(context, token);
      return 0;
    }
    const expectedTokens = ["#EOF", "#Language", "#TagLine", "#FeatureLine", "#Comment", "#Empty"];
    const error = token.isEof ? UnexpectedEOFException.create(token, expectedTokens) : UnexpectedTokenException.create(token, expectedTokens);
    if (this.stopAtFirstError)
      throw error;
    this.addError(context, error);
    return 0;
  }
  // GherkinDocument:0>Feature:0>FeatureHeader:0>#Language:0
  matchTokenAt_1(token, context) {
    if (this.match_TagLine(context, token)) {
      this.startRule(context, RuleType.Tags);
      this.build(context, token);
      return 2;
    }
    if (this.match_FeatureLine(context, token)) {
      this.build(context, token);
      return 3;
    }
    if (this.match_Comment(context, token)) {
      this.build(context, token);
      return 1;
    }
    if (this.match_Empty(context, token)) {
      this.build(context, token);
      return 1;
    }
    const expectedTokens = ["#TagLine", "#FeatureLine", "#Comment", "#Empty"];
    const error = token.isEof ? UnexpectedEOFException.create(token, expectedTokens) : UnexpectedTokenException.create(token, expectedTokens);
    if (this.stopAtFirstError)
      throw error;
    this.addError(context, error);
    return 1;
  }
  // GherkinDocument:0>Feature:0>FeatureHeader:1>Tags:0>#TagLine:0
  matchTokenAt_2(token, context) {
    if (this.match_TagLine(context, token)) {
      this.build(context, token);
      return 2;
    }
    if (this.match_FeatureLine(context, token)) {
      this.endRule(context);
      this.build(context, token);
      return 3;
    }
    if (this.match_Comment(context, token)) {
      this.build(context, token);
      return 2;
    }
    if (this.match_Empty(context, token)) {
      this.build(context, token);
      return 2;
    }
    const expectedTokens = ["#TagLine", "#FeatureLine", "#Comment", "#Empty"];
    const error = token.isEof ? UnexpectedEOFException.create(token, expectedTokens) : UnexpectedTokenException.create(token, expectedTokens);
    if (this.stopAtFirstError)
      throw error;
    this.addError(context, error);
    return 2;
  }
  // GherkinDocument:0>Feature:0>FeatureHeader:2>#FeatureLine:0
  matchTokenAt_3(token, context) {
    if (this.match_EOF(context, token)) {
      this.endRule(context);
      this.endRule(context);
      this.build(context, token);
      return 42;
    }
    if (this.match_Empty(context, token)) {
      this.build(context, token);
      return 3;
    }
    if (this.match_Comment(context, token)) {
      this.startRule(context, RuleType.Description);
      this.build(context, token);
      return 4;
    }
    if (this.match_BackgroundLine(context, token)) {
      this.endRule(context);
      this.startRule(context, RuleType.Background);
      this.build(context, token);
      return 5;
    }
    if (this.match_TagLine(context, token)) {
      if (this.lookahead_0(context, token)) {
        this.endRule(context);
        this.startRule(context, RuleType.ScenarioDefinition);
        this.startRule(context, RuleType.Tags);
        this.build(context, token);
        return 11;
      }
    }
    if (this.match_TagLine(context, token)) {
      this.endRule(context);
      this.startRule(context, RuleType.Rule);
      this.startRule(context, RuleType.RuleHeader);
      this.startRule(context, RuleType.Tags);
      this.build(context, token);
      return 22;
    }
    if (this.match_ScenarioLine(context, token)) {
      this.endRule(context);
      this.startRule(context, RuleType.ScenarioDefinition);
      this.startRule(context, RuleType.Scenario);
      this.build(context, token);
      return 12;
    }
    if (this.match_RuleLine(context, token)) {
      this.endRule(context);
      this.startRule(context, RuleType.Rule);
      this.startRule(context, RuleType.RuleHeader);
      this.build(context, token);
      return 23;
    }
    if (this.match_Other(context, token)) {
      this.startRule(context, RuleType.Description);
      this.build(context, token);
      return 4;
    }
    const expectedTokens = ["#EOF", "#Empty", "#Comment", "#BackgroundLine", "#TagLine", "#ScenarioLine", "#RuleLine", "#Other"];
    const error = token.isEof ? UnexpectedEOFException.create(token, expectedTokens) : UnexpectedTokenException.create(token, expectedTokens);
    if (this.stopAtFirstError)
      throw error;
    this.addError(context, error);
    return 3;
  }
  // GherkinDocument:0>Feature:0>FeatureHeader:3>DescriptionHelper:1>Description:0>__alt1:0>#Other:0
  matchTokenAt_4(token, context) {
    if (this.match_EOF(context, token)) {
      this.endRule(context);
      this.endRule(context);
      this.endRule(context);
      this.build(context, token);
      return 42;
    }
    if (this.match_Comment(context, token)) {
      this.build(context, token);
      return 4;
    }
    if (this.match_BackgroundLine(context, token)) {
      this.endRule(context);
      this.endRule(context);
      this.startRule(context, RuleType.Background);
      this.build(context, token);
      return 5;
    }
    if (this.match_TagLine(context, token)) {
      if (this.lookahead_0(context, token)) {
        this.endRule(context);
        this.endRule(context);
        this.startRule(context, RuleType.ScenarioDefinition);
        this.startRule(context, RuleType.Tags);
        this.build(context, token);
        return 11;
      }
    }
    if (this.match_TagLine(context, token)) {
      this.endRule(context);
      this.endRule(context);
      this.startRule(context, RuleType.Rule);
      this.startRule(context, RuleType.RuleHeader);
      this.startRule(context, RuleType.Tags);
      this.build(context, token);
      return 22;
    }
    if (this.match_ScenarioLine(context, token)) {
      this.endRule(context);
      this.endRule(context);
      this.startRule(context, RuleType.ScenarioDefinition);
      this.startRule(context, RuleType.Scenario);
      this.build(context, token);
      return 12;
    }
    if (this.match_RuleLine(context, token)) {
      this.endRule(context);
      this.endRule(context);
      this.startRule(context, RuleType.Rule);
      this.startRule(context, RuleType.RuleHeader);
      this.build(context, token);
      return 23;
    }
    if (this.match_Other(context, token)) {
      this.build(context, token);
      return 4;
    }
    const expectedTokens = ["#EOF", "#Comment", "#BackgroundLine", "#TagLine", "#ScenarioLine", "#RuleLine", "#Other"];
    const error = token.isEof ? UnexpectedEOFException.create(token, expectedTokens) : UnexpectedTokenException.create(token, expectedTokens);
    if (this.stopAtFirstError)
      throw error;
    this.addError(context, error);
    return 4;
  }
  // GherkinDocument:0>Feature:1>Background:0>#BackgroundLine:0
  matchTokenAt_5(token, context) {
    if (this.match_EOF(context, token)) {
      this.endRule(context);
      this.endRule(context);
      this.build(context, token);
      return 42;
    }
    if (this.match_Empty(context, token)) {
      this.build(context, token);
      return 5;
    }
    if (this.match_Comment(context, token)) {
      this.startRule(context, RuleType.Description);
      this.build(context, token);
      return 6;
    }
    if (this.match_StepLine(context, token)) {
      this.startRule(context, RuleType.Step);
      this.build(context, token);
      return 7;
    }
    if (this.match_TagLine(context, token)) {
      if (this.lookahead_0(context, token)) {
        this.endRule(context);
        this.startRule(context, RuleType.ScenarioDefinition);
        this.startRule(context, RuleType.Tags);
        this.build(context, token);
        return 11;
      }
    }
    if (this.match_TagLine(context, token)) {
      this.endRule(context);
      this.startRule(context, RuleType.Rule);
      this.startRule(context, RuleType.RuleHeader);
      this.startRule(context, RuleType.Tags);
      this.build(context, token);
      return 22;
    }
    if (this.match_ScenarioLine(context, token)) {
      this.endRule(context);
      this.startRule(context, RuleType.ScenarioDefinition);
      this.startRule(context, RuleType.Scenario);
      this.build(context, token);
      return 12;
    }
    if (this.match_RuleLine(context, token)) {
      this.endRule(context);
      this.startRule(context, RuleType.Rule);
      this.startRule(context, RuleType.RuleHeader);
      this.build(context, token);
      return 23;
    }
    if (this.match_Other(context, token)) {
      this.startRule(context, RuleType.Description);
      this.build(context, token);
      return 6;
    }
    const expectedTokens = ["#EOF", "#Empty", "#Comment", "#StepLine", "#TagLine", "#ScenarioLine", "#RuleLine", "#Other"];
    const error = token.isEof ? UnexpectedEOFException.create(token, expectedTokens) : UnexpectedTokenException.create(token, expectedTokens);
    if (this.stopAtFirstError)
      throw error;
    this.addError(context, error);
    return 5;
  }
  // GherkinDocument:0>Feature:1>Background:1>DescriptionHelper:1>Description:0>__alt1:0>#Other:0
  matchTokenAt_6(token, context) {
    if (this.match_EOF(context, token)) {
      this.endRule(context);
      this.endRule(context);
      this.endRule(context);
      this.build(context, token);
      return 42;
    }
    if (this.match_Comment(context, token)) {
      this.build(context, token);
      return 6;
    }
    if (this.match_StepLine(context, token)) {
      this.endRule(context);
      this.startRule(context, RuleType.Step);
      this.build(context, token);
      return 7;
    }
    if (this.match_TagLine(context, token)) {
      if (this.lookahead_0(context, token)) {
        this.endRule(context);
        this.endRule(context);
        this.startRule(context, RuleType.ScenarioDefinition);
        this.startRule(context, RuleType.Tags);
        this.build(context, token);
        return 11;
      }
    }
    if (this.match_TagLine(context, token)) {
      this.endRule(context);
      this.endRule(context);
      this.startRule(context, RuleType.Rule);
      this.startRule(context, RuleType.RuleHeader);
      this.startRule(context, RuleType.Tags);
      this.build(context, token);
      return 22;
    }
    if (this.match_ScenarioLine(context, token)) {
      this.endRule(context);
      this.endRule(context);
      this.startRule(context, RuleType.ScenarioDefinition);
      this.startRule(context, RuleType.Scenario);
      this.build(context, token);
      return 12;
    }
    if (this.match_RuleLine(context, token)) {
      this.endRule(context);
      this.endRule(context);
      this.startRule(context, RuleType.Rule);
      this.startRule(context, RuleType.RuleHeader);
      this.build(context, token);
      return 23;
    }
    if (this.match_Other(context, token)) {
      this.build(context, token);
      return 6;
    }
    const expectedTokens = ["#EOF", "#Comment", "#StepLine", "#TagLine", "#ScenarioLine", "#RuleLine", "#Other"];
    const error = token.isEof ? UnexpectedEOFException.create(token, expectedTokens) : UnexpectedTokenException.create(token, expectedTokens);
    if (this.stopAtFirstError)
      throw error;
    this.addError(context, error);
    return 6;
  }
  // GherkinDocument:0>Feature:1>Background:2>Step:0>#StepLine:0
  matchTokenAt_7(token, context) {
    if (this.match_EOF(context, token)) {
      this.endRule(context);
      this.endRule(context);
      this.endRule(context);
      this.build(context, token);
      return 42;
    }
    if (this.match_TableRow(context, token)) {
      this.startRule(context, RuleType.DataTable);
      this.build(context, token);
      return 8;
    }
    if (this.match_DocStringSeparator(context, token)) {
      this.startRule(context, RuleType.DocString);
      this.build(context, token);
      return 52;
    }
    if (this.match_StepLine(context, token)) {
      this.endRule(context);
      this.startRule(context, RuleType.Step);
      this.build(context, token);
      return 7;
    }
    if (this.match_TagLine(context, token)) {
      if (this.lookahead_0(context, token)) {
        this.endRule(context);
        this.endRule(context);
        this.startRule(context, RuleType.ScenarioDefinition);
        this.startRule(context, RuleType.Tags);
        this.build(context, token);
        return 11;
      }
    }
    if (this.match_TagLine(context, token)) {
      this.endRule(context);
      this.endRule(context);
      this.startRule(context, RuleType.Rule);
      this.startRule(context, RuleType.RuleHeader);
      this.startRule(context, RuleType.Tags);
      this.build(context, token);
      return 22;
    }
    if (this.match_ScenarioLine(context, token)) {
      this.endRule(context);
      this.endRule(context);
      this.startRule(context, RuleType.ScenarioDefinition);
      this.startRule(context, RuleType.Scenario);
      this.build(context, token);
      return 12;
    }
    if (this.match_RuleLine(context, token)) {
      this.endRule(context);
      this.endRule(context);
      this.startRule(context, RuleType.Rule);
      this.startRule(context, RuleType.RuleHeader);
      this.build(context, token);
      return 23;
    }
    if (this.match_Comment(context, token)) {
      this.build(context, token);
      return 7;
    }
    if (this.match_Empty(context, token)) {
      this.build(context, token);
      return 7;
    }
    const expectedTokens = ["#EOF", "#TableRow", "#DocStringSeparator", "#StepLine", "#TagLine", "#ScenarioLine", "#RuleLine", "#Comment", "#Empty"];
    const error = token.isEof ? UnexpectedEOFException.create(token, expectedTokens) : UnexpectedTokenException.create(token, expectedTokens);
    if (this.stopAtFirstError)
      throw error;
    this.addError(context, error);
    return 7;
  }
  // GherkinDocument:0>Feature:1>Background:2>Step:1>StepArg:0>__alt0:0>DataTableAndMaybeDocString:0>DataTable:0>#TableRow:0
  matchTokenAt_8(token, context) {
    if (this.match_EOF(context, token)) {
      this.endRule(context);
      this.endRule(context);
      this.endRule(context);
      this.endRule(context);
      this.build(context, token);
      return 42;
    }
    if (this.match_TableRow(context, token)) {
      this.build(context, token);
      return 8;
    }
    if (this.match_DocStringSeparator(context, token)) {
      this.endRule(context);
      this.startRule(context, RuleType.DocString);
      this.build(context, token);
      return 9;
    }
    if (this.match_StepLine(context, token)) {
      this.endRule(context);
      this.endRule(context);
      this.startRule(context, RuleType.Step);
      this.build(context, token);
      return 7;
    }
    if (this.match_TagLine(context, token)) {
      if (this.lookahead_0(context, token)) {
        this.endRule(context);
        this.endRule(context);
        this.endRule(context);
        this.startRule(context, RuleType.ScenarioDefinition);
        this.startRule(context, RuleType.Tags);
        this.build(context, token);
        return 11;
      }
    }
    if (this.match_TagLine(context, token)) {
      this.endRule(context);
      this.endRule(context);
      this.endRule(context);
      this.startRule(context, RuleType.Rule);
      this.startRule(context, RuleType.RuleHeader);
      this.startRule(context, RuleType.Tags);
      this.build(context, token);
      return 22;
    }
    if (this.match_ScenarioLine(context, token)) {
      this.endRule(context);
      this.endRule(context);
      this.endRule(context);
      this.startRule(context, RuleType.ScenarioDefinition);
      this.startRule(context, RuleType.Scenario);
      this.build(context, token);
      return 12;
    }
    if (this.match_RuleLine(context, token)) {
      this.endRule(context);
      this.endRule(context);
      this.endRule(context);
      this.startRule(context, RuleType.Rule);
      this.startRule(context, RuleType.RuleHeader);
      this.build(context, token);
      return 23;
    }
    if (this.match_Comment(context, token)) {
      this.build(context, token);
      return 8;
    }
    if (this.match_Empty(context, token)) {
      this.build(context, token);
      return 8;
    }
    const expectedTokens = ["#EOF", "#TableRow", "#DocStringSeparator", "#StepLine", "#TagLine", "#ScenarioLine", "#RuleLine", "#Comment", "#Empty"];
    const error = token.isEof ? UnexpectedEOFException.create(token, expectedTokens) : UnexpectedTokenException.create(token, expectedTokens);
    if (this.stopAtFirstError)
      throw error;
    this.addError(context, error);
    return 8;
  }
  // GherkinDocument:0>Feature:1>Background:2>Step:1>StepArg:0>__alt0:0>DataTableAndMaybeDocString:1>DocString:0>#DocStringSeparator:0
  matchTokenAt_9(token, context) {
    if (this.match_DocStringSeparator(context, token)) {
      this.build(context, token);
      return 10;
    }
    if (this.match_Other(context, token)) {
      this.build(context, token);
      return 9;
    }
    const expectedTokens = ["#DocStringSeparator", "#Other"];
    const error = token.isEof ? UnexpectedEOFException.create(token, expectedTokens) : UnexpectedTokenException.create(token, expectedTokens);
    if (this.stopAtFirstError)
      throw error;
    this.addError(context, error);
    return 9;
  }
  // GherkinDocument:0>Feature:1>Background:2>Step:1>StepArg:0>__alt0:0>DataTableAndMaybeDocString:1>DocString:2>#DocStringSeparator:0
  matchTokenAt_10(token, context) {
    if (this.match_EOF(context, token)) {
      this.endRule(context);
      this.endRule(context);
      this.endRule(context);
      this.endRule(context);
      this.build(context, token);
      return 42;
    }
    if (this.match_StepLine(context, token)) {
      this.endRule(context);
      this.endRule(context);
      this.startRule(context, RuleType.Step);
      this.build(context, token);
      return 7;
    }
    if (this.match_TagLine(context, token)) {
      if (this.lookahead_0(context, token)) {
        this.endRule(context);
        this.endRule(context);
        this.endRule(context);
        this.startRule(context, RuleType.ScenarioDefinition);
        this.startRule(context, RuleType.Tags);
        this.build(context, token);
        return 11;
      }
    }
    if (this.match_TagLine(context, token)) {
      this.endRule(context);
      this.endRule(context);
      this.endRule(context);
      this.startRule(context, RuleType.Rule);
      this.startRule(context, RuleType.RuleHeader);
      this.startRule(context, RuleType.Tags);
      this.build(context, token);
      return 22;
    }
    if (this.match_ScenarioLine(context, token)) {
      this.endRule(context);
      this.endRule(context);
      this.endRule(context);
      this.startRule(context, RuleType.ScenarioDefinition);
      this.startRule(context, RuleType.Scenario);
      this.build(context, token);
      return 12;
    }
    if (this.match_RuleLine(context, token)) {
      this.endRule(context);
      this.endRule(context);
      this.endRule(context);
      this.startRule(context, RuleType.Rule);
      this.startRule(context, RuleType.RuleHeader);
      this.build(context, token);
      return 23;
    }
    if (this.match_Comment(context, token)) {
      this.build(context, token);
      return 10;
    }
    if (this.match_Empty(context, token)) {
      this.build(context, token);
      return 10;
    }
    const expectedTokens = ["#EOF", "#StepLine", "#TagLine", "#ScenarioLine", "#RuleLine", "#Comment", "#Empty"];
    const error = token.isEof ? UnexpectedEOFException.create(token, expectedTokens) : UnexpectedTokenException.create(token, expectedTokens);
    if (this.stopAtFirstError)
      throw error;
    this.addError(context, error);
    return 10;
  }
  // GherkinDocument:0>Feature:2>ScenarioDefinition:0>Tags:0>#TagLine:0
  matchTokenAt_11(token, context) {
    if (this.match_TagLine(context, token)) {
      this.build(context, token);
      return 11;
    }
    if (this.match_ScenarioLine(context, token)) {
      this.endRule(context);
      this.startRule(context, RuleType.Scenario);
      this.build(context, token);
      return 12;
    }
    if (this.match_Comment(context, token)) {
      this.build(context, token);
      return 11;
    }
    if (this.match_Empty(context, token)) {
      this.build(context, token);
      return 11;
    }
    const expectedTokens = ["#TagLine", "#ScenarioLine", "#Comment", "#Empty"];
    const error = token.isEof ? UnexpectedEOFException.create(token, expectedTokens) : UnexpectedTokenException.create(token, expectedTokens);
    if (this.stopAtFirstError)
      throw error;
    this.addError(context, error);
    return 11;
  }
  // GherkinDocument:0>Feature:2>ScenarioDefinition:1>Scenario:0>#ScenarioLine:0
  matchTokenAt_12(token, context) {
    if (this.match_EOF(context, token)) {
      this.endRule(context);
      this.endRule(context);
      this.endRule(context);
      this.build(context, token);
      return 42;
    }
    if (this.match_Empty(context, token)) {
      this.build(context, token);
      return 12;
    }
    if (this.match_Comment(context, token)) {
      this.startRule(context, RuleType.Description);
      this.build(context, token);
      return 13;
    }
    if (this.match_StepLine(context, token)) {
      this.startRule(context, RuleType.Step);
      this.build(context, token);
      return 14;
    }
    if (this.match_TagLine(context, token)) {
      if (this.lookahead_1(context, token)) {
        this.startRule(context, RuleType.ExamplesDefinition);
        this.startRule(context, RuleType.Tags);
        this.build(context, token);
        return 18;
      }
    }
    if (this.match_TagLine(context, token)) {
      if (this.lookahead_0(context, token)) {
        this.endRule(context);
        this.endRule(context);
        this.startRule(context, RuleType.ScenarioDefinition);
        this.startRule(context, RuleType.Tags);
        this.build(context, token);
        return 11;
      }
    }
    if (this.match_TagLine(context, token)) {
      this.endRule(context);
      this.endRule(context);
      this.startRule(context, RuleType.Rule);
      this.startRule(context, RuleType.RuleHeader);
      this.startRule(context, RuleType.Tags);
      this.build(context, token);
      return 22;
    }
    if (this.match_ExamplesLine(context, token)) {
      this.startRule(context, RuleType.ExamplesDefinition);
      this.startRule(context, RuleType.Examples);
      this.build(context, token);
      return 19;
    }
    if (this.match_ScenarioLine(context, token)) {
      this.endRule(context);
      this.endRule(context);
      this.startRule(context, RuleType.ScenarioDefinition);
      this.startRule(context, RuleType.Scenario);
      this.build(context, token);
      return 12;
    }
    if (this.match_RuleLine(context, token)) {
      this.endRule(context);
      this.endRule(context);
      this.startRule(context, RuleType.Rule);
      this.startRule(context, RuleType.RuleHeader);
      this.build(context, token);
      return 23;
    }
    if (this.match_Other(context, token)) {
      this.startRule(context, RuleType.Description);
      this.build(context, token);
      return 13;
    }
    const expectedTokens = ["#EOF", "#Empty", "#Comment", "#StepLine", "#TagLine", "#ExamplesLine", "#ScenarioLine", "#RuleLine", "#Other"];
    const error = token.isEof ? UnexpectedEOFException.create(token, expectedTokens) : UnexpectedTokenException.create(token, expectedTokens);
    if (this.stopAtFirstError)
      throw error;
    this.addError(context, error);
    return 12;
  }
  // GherkinDocument:0>Feature:2>ScenarioDefinition:1>Scenario:1>DescriptionHelper:1>Description:0>__alt1:0>#Other:0
  matchTokenAt_13(token, context) {
    if (this.match_EOF(context, token)) {
      this.endRule(context);
      this.endRule(context);
      this.endRule(context);
      this.endRule(context);
      this.build(context, token);
      return 42;
    }
    if (this.match_Comment(context, token)) {
      this.build(context, token);
      return 13;
    }
    if (this.match_StepLine(context, token)) {
      this.endRule(context);
      this.startRule(context, RuleType.Step);
      this.build(context, token);
      return 14;
    }
    if (this.match_TagLine(context, token)) {
      if (this.lookahead_1(context, token)) {
        this.endRule(context);
        this.startRule(context, RuleType.ExamplesDefinition);
        this.startRule(context, RuleType.Tags);
        this.build(context, token);
        return 18;
      }
    }
    if (this.match_TagLine(context, token)) {
      if (this.lookahead_0(context, token)) {
        this.endRule(context);
        this.endRule(context);
        this.endRule(context);
        this.startRule(context, RuleType.ScenarioDefinition);
        this.startRule(context, RuleType.Tags);
        this.build(context, token);
        return 11;
      }
    }
    if (this.match_TagLine(context, token)) {
      this.endRule(context);
      this.endRule(context);
      this.endRule(context);
      this.startRule(context, RuleType.Rule);
      this.startRule(context, RuleType.RuleHeader);
      this.startRule(context, RuleType.Tags);
      this.build(context, token);
      return 22;
    }
    if (this.match_ExamplesLine(context, token)) {
      this.endRule(context);
      this.startRule(context, RuleType.ExamplesDefinition);
      this.startRule(context, RuleType.Examples);
      this.build(context, token);
      return 19;
    }
    if (this.match_ScenarioLine(context, token)) {
      this.endRule(context);
      this.endRule(context);
      this.endRule(context);
      this.startRule(context, RuleType.ScenarioDefinition);
      this.startRule(context, RuleType.Scenario);
      this.build(context, token);
      return 12;
    }
    if (this.match_RuleLine(context, token)) {
      this.endRule(context);
      this.endRule(context);
      this.endRule(context);
      this.startRule(context, RuleType.Rule);
      this.startRule(context, RuleType.RuleHeader);
      this.build(context, token);
      return 23;
    }
    if (this.match_Other(context, token)) {
      this.build(context, token);
      return 13;
    }
    const expectedTokens = ["#EOF", "#Comment", "#StepLine", "#TagLine", "#ExamplesLine", "#ScenarioLine", "#RuleLine", "#Other"];
    const error = token.isEof ? UnexpectedEOFException.create(token, expectedTokens) : UnexpectedTokenException.create(token, expectedTokens);
    if (this.stopAtFirstError)
      throw error;
    this.addError(context, error);
    return 13;
  }
  // GherkinDocument:0>Feature:2>ScenarioDefinition:1>Scenario:2>Step:0>#StepLine:0
  matchTokenAt_14(token, context) {
    if (this.match_EOF(context, token)) {
      this.endRule(context);
      this.endRule(context);
      this.endRule(context);
      this.endRule(context);
      this.build(context, token);
      return 42;
    }
    if (this.match_TableRow(context, token)) {
      this.startRule(context, RuleType.DataTable);
      this.build(context, token);
      return 15;
    }
    if (this.match_DocStringSeparator(context, token)) {
      this.startRule(context, RuleType.DocString);
      this.build(context, token);
      return 49;
    }
    if (this.match_StepLine(context, token)) {
      this.endRule(context);
      this.startRule(context, RuleType.Step);
      this.build(context, token);
      return 14;
    }
    if (this.match_TagLine(context, token)) {
      if (this.lookahead_1(context, token)) {
        this.endRule(context);
        this.startRule(context, RuleType.ExamplesDefinition);
        this.startRule(context, RuleType.Tags);
        this.build(context, token);
        return 18;
      }
    }
    if (this.match_TagLine(context, token)) {
      if (this.lookahead_0(context, token)) {
        this.endRule(context);
        this.endRule(context);
        this.endRule(context);
        this.startRule(context, RuleType.ScenarioDefinition);
        this.startRule(context, RuleType.Tags);
        this.build(context, token);
        return 11;
      }
    }
    if (this.match_TagLine(context, token)) {
      this.endRule(context);
      this.endRule(context);
      this.endRule(context);
      this.startRule(context, RuleType.Rule);
      this.startRule(context, RuleType.RuleHeader);
      this.startRule(context, RuleType.Tags);
      this.build(context, token);
      return 22;
    }
    if (this.match_ExamplesLine(context, token)) {
      this.endRule(context);
      this.startRule(context, RuleType.ExamplesDefinition);
      this.startRule(context, RuleType.Examples);
      this.build(context, token);
      return 19;
    }
    if (this.match_ScenarioLine(context, token)) {
      this.endRule(context);
      this.endRule(context);
      this.endRule(context);
      this.startRule(context, RuleType.ScenarioDefinition);
      this.startRule(context, RuleType.Scenario);
      this.build(context, token);
      return 12;
    }
    if (this.match_RuleLine(context, token)) {
      this.endRule(context);
      this.endRule(context);
      this.endRule(context);
      this.startRule(context, RuleType.Rule);
      this.startRule(context, RuleType.RuleHeader);
      this.build(context, token);
      return 23;
    }
    if (this.match_Comment(context, token)) {
      this.build(context, token);
      return 14;
    }
    if (this.match_Empty(context, token)) {
      this.build(context, token);
      return 14;
    }
    const expectedTokens = ["#EOF", "#TableRow", "#DocStringSeparator", "#StepLine", "#TagLine", "#ExamplesLine", "#ScenarioLine", "#RuleLine", "#Comment", "#Empty"];
    const error = token.isEof ? UnexpectedEOFException.create(token, expectedTokens) : UnexpectedTokenException.create(token, expectedTokens);
    if (this.stopAtFirstError)
      throw error;
    this.addError(context, error);
    return 14;
  }
  // GherkinDocument:0>Feature:2>ScenarioDefinition:1>Scenario:2>Step:1>StepArg:0>__alt0:0>DataTableAndMaybeDocString:0>DataTable:0>#TableRow:0
  matchTokenAt_15(token, context) {
    if (this.match_EOF(context, token)) {
      this.endRule(context);
      this.endRule(context);
      this.endRule(context);
      this.endRule(context);
      this.endRule(context);
      this.build(context, token);
      return 42;
    }
    if (this.match_TableRow(context, token)) {
      this.build(context, token);
      return 15;
    }
    if (this.match_DocStringSeparator(context, token)) {
      this.endRule(context);
      this.startRule(context, RuleType.DocString);
      this.build(context, token);
      return 16;
    }
    if (this.match_StepLine(context, token)) {
      this.endRule(context);
      this.endRule(context);
      this.startRule(context, RuleType.Step);
      this.build(context, token);
      return 14;
    }
    if (this.match_TagLine(context, token)) {
      if (this.lookahead_1(context, token)) {
        this.endRule(context);
        this.endRule(context);
        this.startRule(context, RuleType.ExamplesDefinition);
        this.startRule(context, RuleType.Tags);
        this.build(context, token);
        return 18;
      }
    }
    if (this.match_TagLine(context, token)) {
      if (this.lookahead_0(context, token)) {
        this.endRule(context);
        this.endRule(context);
        this.endRule(context);
        this.endRule(context);
        this.startRule(context, RuleType.ScenarioDefinition);
        this.startRule(context, RuleType.Tags);
        this.build(context, token);
        return 11;
      }
    }
    if (this.match_TagLine(context, token)) {
      this.endRule(context);
      this.endRule(context);
      this.endRule(context);
      this.endRule(context);
      this.startRule(context, RuleType.Rule);
      this.startRule(context, RuleType.RuleHeader);
      this.startRule(context, RuleType.Tags);
      this.build(context, token);
      return 22;
    }
    if (this.match_ExamplesLine(context, token)) {
      this.endRule(context);
      this.endRule(context);
      this.startRule(context, RuleType.ExamplesDefinition);
      this.startRule(context, RuleType.Examples);
      this.build(context, token);
      return 19;
    }
    if (this.match_ScenarioLine(context, token)) {
      this.endRule(context);
      this.endRule(context);
      this.endRule(context);
      this.endRule(context);
      this.startRule(context, RuleType.ScenarioDefinition);
      this.startRule(context, RuleType.Scenario);
      this.build(context, token);
      return 12;
    }
    if (this.match_RuleLine(context, token)) {
      this.endRule(context);
      this.endRule(context);
      this.endRule(context);
      this.endRule(context);
      this.startRule(context, RuleType.Rule);
      this.startRule(context, RuleType.RuleHeader);
      this.build(context, token);
      return 23;
    }
    if (this.match_Comment(context, token)) {
      this.build(context, token);
      return 15;
    }
    if (this.match_Empty(context, token)) {
      this.build(context, token);
      return 15;
    }
    const expectedTokens = ["#EOF", "#TableRow", "#DocStringSeparator", "#StepLine", "#TagLine", "#ExamplesLine", "#ScenarioLine", "#RuleLine", "#Comment", "#Empty"];
    const error = token.isEof ? UnexpectedEOFException.create(token, expectedTokens) : UnexpectedTokenException.create(token, expectedTokens);
    if (this.stopAtFirstError)
      throw error;
    this.addError(context, error);
    return 15;
  }
  // GherkinDocument:0>Feature:2>ScenarioDefinition:1>Scenario:2>Step:1>StepArg:0>__alt0:0>DataTableAndMaybeDocString:1>DocString:0>#DocStringSeparator:0
  matchTokenAt_16(token, context) {
    if (this.match_DocStringSeparator(context, token)) {
      this.build(context, token);
      return 17;
    }
    if (this.match_Other(context, token)) {
      this.build(context, token);
      return 16;
    }
    const expectedTokens = ["#DocStringSeparator", "#Other"];
    const error = token.isEof ? UnexpectedEOFException.create(token, expectedTokens) : UnexpectedTokenException.create(token, expectedTokens);
    if (this.stopAtFirstError)
      throw error;
    this.addError(context, error);
    return 16;
  }
  // GherkinDocument:0>Feature:2>ScenarioDefinition:1>Scenario:2>Step:1>StepArg:0>__alt0:0>DataTableAndMaybeDocString:1>DocString:2>#DocStringSeparator:0
  matchTokenAt_17(token, context) {
    if (this.match_EOF(context, token)) {
      this.endRule(context);
      this.endRule(context);
      this.endRule(context);
      this.endRule(context);
      this.endRule(context);
      this.build(context, token);
      return 42;
    }
    if (this.match_StepLine(context, token)) {
      this.endRule(context);
      this.endRule(context);
      this.startRule(context, RuleType.Step);
      this.build(context, token);
      return 14;
    }
    if (this.match_TagLine(context, token)) {
      if (this.lookahead_1(context, token)) {
        this.endRule(context);
        this.endRule(context);
        this.startRule(context, RuleType.ExamplesDefinition);
        this.startRule(context, RuleType.Tags);
        this.build(context, token);
        return 18;
      }
    }
    if (this.match_TagLine(context, token)) {
      if (this.lookahead_0(context, token)) {
        this.endRule(context);
        this.endRule(context);
        this.endRule(context);
        this.endRule(context);
        this.startRule(context, RuleType.ScenarioDefinition);
        this.startRule(context, RuleType.Tags);
        this.build(context, token);
        return 11;
      }
    }
    if (this.match_TagLine(context, token)) {
      this.endRule(context);
      this.endRule(context);
      this.endRule(context);
      this.endRule(context);
      this.startRule(context, RuleType.Rule);
      this.startRule(context, RuleType.RuleHeader);
      this.startRule(context, RuleType.Tags);
      this.build(context, token);
      return 22;
    }
    if (this.match_ExamplesLine(context, token)) {
      this.endRule(context);
      this.endRule(context);
      this.startRule(context, RuleType.ExamplesDefinition);
      this.startRule(context, RuleType.Examples);
      this.build(context, token);
      return 19;
    }
    if (this.match_ScenarioLine(context, token)) {
      this.endRule(context);
      this.endRule(context);
      this.endRule(context);
      this.endRule(context);
      this.startRule(context, RuleType.ScenarioDefinition);
      this.startRule(context, RuleType.Scenario);
      this.build(context, token);
      return 12;
    }
    if (this.match_RuleLine(context, token)) {
      this.endRule(context);
      this.endRule(context);
      this.endRule(context);
      this.endRule(context);
      this.startRule(context, RuleType.Rule);
      this.startRule(context, RuleType.RuleHeader);
      this.build(context, token);
      return 23;
    }
    if (this.match_Comment(context, token)) {
      this.build(context, token);
      return 17;
    }
    if (this.match_Empty(context, token)) {
      this.build(context, token);
      return 17;
    }
    const expectedTokens = ["#EOF", "#StepLine", "#TagLine", "#ExamplesLine", "#ScenarioLine", "#RuleLine", "#Comment", "#Empty"];
    const error = token.isEof ? UnexpectedEOFException.create(token, expectedTokens) : UnexpectedTokenException.create(token, expectedTokens);
    if (this.stopAtFirstError)
      throw error;
    this.addError(context, error);
    return 17;
  }
  // GherkinDocument:0>Feature:2>ScenarioDefinition:1>Scenario:3>ExamplesDefinition:0>Tags:0>#TagLine:0
  matchTokenAt_18(token, context) {
    if (this.match_TagLine(context, token)) {
      this.build(context, token);
      return 18;
    }
    if (this.match_ExamplesLine(context, token)) {
      this.endRule(context);
      this.startRule(context, RuleType.Examples);
      this.build(context, token);
      return 19;
    }
    if (this.match_Comment(context, token)) {
      this.build(context, token);
      return 18;
    }
    if (this.match_Empty(context, token)) {
      this.build(context, token);
      return 18;
    }
    const expectedTokens = ["#TagLine", "#ExamplesLine", "#Comment", "#Empty"];
    const error = token.isEof ? UnexpectedEOFException.create(token, expectedTokens) : UnexpectedTokenException.create(token, expectedTokens);
    if (this.stopAtFirstError)
      throw error;
    this.addError(context, error);
    return 18;
  }
  // GherkinDocument:0>Feature:2>ScenarioDefinition:1>Scenario:3>ExamplesDefinition:1>Examples:0>#ExamplesLine:0
  matchTokenAt_19(token, context) {
    if (this.match_EOF(context, token)) {
      this.endRule(context);
      this.endRule(context);
      this.endRule(context);
      this.endRule(context);
      this.endRule(context);
      this.build(context, token);
      return 42;
    }
    if (this.match_Empty(context, token)) {
      this.build(context, token);
      return 19;
    }
    if (this.match_Comment(context, token)) {
      this.startRule(context, RuleType.Description);
      this.build(context, token);
      return 20;
    }
    if (this.match_TableRow(context, token)) {
      this.startRule(context, RuleType.ExamplesTable);
      this.build(context, token);
      return 21;
    }
    if (this.match_TagLine(context, token)) {
      if (this.lookahead_1(context, token)) {
        this.endRule(context);
        this.endRule(context);
        this.startRule(context, RuleType.ExamplesDefinition);
        this.startRule(context, RuleType.Tags);
        this.build(context, token);
        return 18;
      }
    }
    if (this.match_TagLine(context, token)) {
      if (this.lookahead_0(context, token)) {
        this.endRule(context);
        this.endRule(context);
        this.endRule(context);
        this.endRule(context);
        this.startRule(context, RuleType.ScenarioDefinition);
        this.startRule(context, RuleType.Tags);
        this.build(context, token);
        return 11;
      }
    }
    if (this.match_TagLine(context, token)) {
      this.endRule(context);
      this.endRule(context);
      this.endRule(context);
      this.endRule(context);
      this.startRule(context, RuleType.Rule);
      this.startRule(context, RuleType.RuleHeader);
      this.startRule(context, RuleType.Tags);
      this.build(context, token);
      return 22;
    }
    if (this.match_ExamplesLine(context, token)) {
      this.endRule(context);
      this.endRule(context);
      this.startRule(context, RuleType.ExamplesDefinition);
      this.startRule(context, RuleType.Examples);
      this.build(context, token);
      return 19;
    }
    if (this.match_ScenarioLine(context, token)) {
      this.endRule(context);
      this.endRule(context);
      this.endRule(context);
      this.endRule(context);
      this.startRule(context, RuleType.ScenarioDefinition);
      this.startRule(context, RuleType.Scenario);
      this.build(context, token);
      return 12;
    }
    if (this.match_RuleLine(context, token)) {
      this.endRule(context);
      this.endRule(context);
      this.endRule(context);
      this.endRule(context);
      this.startRule(context, RuleType.Rule);
      this.startRule(context, RuleType.RuleHeader);
      this.build(context, token);
      return 23;
    }
    if (this.match_Other(context, token)) {
      this.startRule(context, RuleType.Description);
      this.build(context, token);
      return 20;
    }
    const expectedTokens = ["#EOF", "#Empty", "#Comment", "#TableRow", "#TagLine", "#ExamplesLine", "#ScenarioLine", "#RuleLine", "#Other"];
    const error = token.isEof ? UnexpectedEOFException.create(token, expectedTokens) : UnexpectedTokenException.create(token, expectedTokens);
    if (this.stopAtFirstError)
      throw error;
    this.addError(context, error);
    return 19;
  }
  // GherkinDocument:0>Feature:2>ScenarioDefinition:1>Scenario:3>ExamplesDefinition:1>Examples:1>DescriptionHelper:1>Description:0>__alt1:0>#Other:0
  matchTokenAt_20(token, context) {
    if (this.match_EOF(context, token)) {
      this.endRule(context);
      this.endRule(context);
      this.endRule(context);
      this.endRule(context);
      this.endRule(context);
      this.endRule(context);
      this.build(context, token);
      return 42;
    }
    if (this.match_Comment(context, token)) {
      this.build(context, token);
      return 20;
    }
    if (this.match_TableRow(context, token)) {
      this.endRule(context);
      this.startRule(context, RuleType.ExamplesTable);
      this.build(context, token);
      return 21;
    }
    if (this.match_TagLine(context, token)) {
      if (this.lookahead_1(context, token)) {
        this.endRule(context);
        this.endRule(context);
        this.endRule(context);
        this.startRule(context, RuleType.ExamplesDefinition);
        this.startRule(context, RuleType.Tags);
        this.build(context, token);
        return 18;
      }
    }
    if (this.match_TagLine(context, token)) {
      if (this.lookahead_0(context, token)) {
        this.endRule(context);
        this.endRule(context);
        this.endRule(context);
        this.endRule(context);
        this.endRule(context);
        this.startRule(context, RuleType.ScenarioDefinition);
        this.startRule(context, RuleType.Tags);
        this.build(context, token);
        return 11;
      }
    }
    if (this.match_TagLine(context, token)) {
      this.endRule(context);
      this.endRule(context);
      this.endRule(context);
      this.endRule(context);
      this.endRule(context);
      this.startRule(context, RuleType.Rule);
      this.startRule(context, RuleType.RuleHeader);
      this.startRule(context, RuleType.Tags);
      this.build(context, token);
      return 22;
    }
    if (this.match_ExamplesLine(context, token)) {
      this.endRule(context);
      this.endRule(context);
      this.endRule(context);
      this.startRule(context, RuleType.ExamplesDefinition);
      this.startRule(context, RuleType.Examples);
      this.build(context, token);
      return 19;
    }
    if (this.match_ScenarioLine(context, token)) {
      this.endRule(context);
      this.endRule(context);
      this.endRule(context);
      this.endRule(context);
      this.endRule(context);
      this.startRule(context, RuleType.ScenarioDefinition);
      this.startRule(context, RuleType.Scenario);
      this.build(context, token);
      return 12;
    }
    if (this.match_RuleLine(context, token)) {
      this.endRule(context);
      this.endRule(context);
      this.endRule(context);
      this.endRule(context);
      this.endRule(context);
      this.startRule(context, RuleType.Rule);
      this.startRule(context, RuleType.RuleHeader);
      this.build(context, token);
      return 23;
    }
    if (this.match_Other(context, token)) {
      this.build(context, token);
      return 20;
    }
    const expectedTokens = ["#EOF", "#Comment", "#TableRow", "#TagLine", "#ExamplesLine", "#ScenarioLine", "#RuleLine", "#Other"];
    const error = token.isEof ? UnexpectedEOFException.create(token, expectedTokens) : UnexpectedTokenException.create(token, expectedTokens);
    if (this.stopAtFirstError)
      throw error;
    this.addError(context, error);
    return 20;
  }
  // GherkinDocument:0>Feature:2>ScenarioDefinition:1>Scenario:3>ExamplesDefinition:1>Examples:2>ExamplesTable:0>#TableRow:0
  matchTokenAt_21(token, context) {
    if (this.match_EOF(context, token)) {
      this.endRule(context);
      this.endRule(context);
      this.endRule(context);
      this.endRule(context);
      this.endRule(context);
      this.endRule(context);
      this.build(context, token);
      return 42;
    }
    if (this.match_TableRow(context, token)) {
      this.build(context, token);
      return 21;
    }
    if (this.match_TagLine(context, token)) {
      if (this.lookahead_1(context, token)) {
        this.endRule(context);
        this.endRule(context);
        this.endRule(context);
        this.startRule(context, RuleType.ExamplesDefinition);
        this.startRule(context, RuleType.Tags);
        this.build(context, token);
        return 18;
      }
    }
    if (this.match_TagLine(context, token)) {
      if (this.lookahead_0(context, token)) {
        this.endRule(context);
        this.endRule(context);
        this.endRule(context);
        this.endRule(context);
        this.endRule(context);
        this.startRule(context, RuleType.ScenarioDefinition);
        this.startRule(context, RuleType.Tags);
        this.build(context, token);
        return 11;
      }
    }
    if (this.match_TagLine(context, token)) {
      this.endRule(context);
      this.endRule(context);
      this.endRule(context);
      this.endRule(context);
      this.endRule(context);
      this.startRule(context, RuleType.Rule);
      this.startRule(context, RuleType.RuleHeader);
      this.startRule(context, RuleType.Tags);
      this.build(context, token);
      return 22;
    }
    if (this.match_ExamplesLine(context, token)) {
      this.endRule(context);
      this.endRule(context);
      this.endRule(context);
      this.startRule(context, RuleType.ExamplesDefinition);
      this.startRule(context, RuleType.Examples);
      this.build(context, token);
      return 19;
    }
    if (this.match_ScenarioLine(context, token)) {
      this.endRule(context);
      this.endRule(context);
      this.endRule(context);
      this.endRule(context);
      this.endRule(context);
      this.startRule(context, RuleType.ScenarioDefinition);
      this.startRule(context, RuleType.Scenario);
      this.build(context, token);
      return 12;
    }
    if (this.match_RuleLine(context, token)) {
      this.endRule(context);
      this.endRule(context);
      this.endRule(context);
      this.endRule(context);
      this.endRule(context);
      this.startRule(context, RuleType.Rule);
      this.startRule(context, RuleType.RuleHeader);
      this.build(context, token);
      return 23;
    }
    if (this.match_Comment(context, token)) {
      this.build(context, token);
      return 21;
    }
    if (this.match_Empty(context, token)) {
      this.build(context, token);
      return 21;
    }
    const expectedTokens = ["#EOF", "#TableRow", "#TagLine", "#ExamplesLine", "#ScenarioLine", "#RuleLine", "#Comment", "#Empty"];
    const error = token.isEof ? UnexpectedEOFException.create(token, expectedTokens) : UnexpectedTokenException.create(token, expectedTokens);
    if (this.stopAtFirstError)
      throw error;
    this.addError(context, error);
    return 21;
  }
  // GherkinDocument:0>Feature:3>Rule:0>RuleHeader:0>Tags:0>#TagLine:0
  matchTokenAt_22(token, context) {
    if (this.match_TagLine(context, token)) {
      this.build(context, token);
      return 22;
    }
    if (this.match_RuleLine(context, token)) {
      this.endRule(context);
      this.build(context, token);
      return 23;
    }
    if (this.match_Comment(context, token)) {
      this.build(context, token);
      return 22;
    }
    if (this.match_Empty(context, token)) {
      this.build(context, token);
      return 22;
    }
    const expectedTokens = ["#TagLine", "#RuleLine", "#Comment", "#Empty"];
    const error = token.isEof ? UnexpectedEOFException.create(token, expectedTokens) : UnexpectedTokenException.create(token, expectedTokens);
    if (this.stopAtFirstError)
      throw error;
    this.addError(context, error);
    return 22;
  }
  // GherkinDocument:0>Feature:3>Rule:0>RuleHeader:1>#RuleLine:0
  matchTokenAt_23(token, context) {
    if (this.match_EOF(context, token)) {
      this.endRule(context);
      this.endRule(context);
      this.endRule(context);
      this.build(context, token);
      return 42;
    }
    if (this.match_Empty(context, token)) {
      this.build(context, token);
      return 23;
    }
    if (this.match_Comment(context, token)) {
      this.startRule(context, RuleType.Description);
      this.build(context, token);
      return 24;
    }
    if (this.match_BackgroundLine(context, token)) {
      this.endRule(context);
      this.startRule(context, RuleType.Background);
      this.build(context, token);
      return 25;
    }
    if (this.match_TagLine(context, token)) {
      if (this.lookahead_0(context, token)) {
        this.endRule(context);
        this.startRule(context, RuleType.ScenarioDefinition);
        this.startRule(context, RuleType.Tags);
        this.build(context, token);
        return 31;
      }
    }
    if (this.match_TagLine(context, token)) {
      this.endRule(context);
      this.endRule(context);
      this.startRule(context, RuleType.Rule);
      this.startRule(context, RuleType.RuleHeader);
      this.startRule(context, RuleType.Tags);
      this.build(context, token);
      return 22;
    }
    if (this.match_ScenarioLine(context, token)) {
      this.endRule(context);
      this.startRule(context, RuleType.ScenarioDefinition);
      this.startRule(context, RuleType.Scenario);
      this.build(context, token);
      return 32;
    }
    if (this.match_RuleLine(context, token)) {
      this.endRule(context);
      this.endRule(context);
      this.startRule(context, RuleType.Rule);
      this.startRule(context, RuleType.RuleHeader);
      this.build(context, token);
      return 23;
    }
    if (this.match_Other(context, token)) {
      this.startRule(context, RuleType.Description);
      this.build(context, token);
      return 24;
    }
    const expectedTokens = ["#EOF", "#Empty", "#Comment", "#BackgroundLine", "#TagLine", "#ScenarioLine", "#RuleLine", "#Other"];
    const error = token.isEof ? UnexpectedEOFException.create(token, expectedTokens) : UnexpectedTokenException.create(token, expectedTokens);
    if (this.stopAtFirstError)
      throw error;
    this.addError(context, error);
    return 23;
  }
  // GherkinDocument:0>Feature:3>Rule:0>RuleHeader:2>DescriptionHelper:1>Description:0>__alt1:0>#Other:0
  matchTokenAt_24(token, context) {
    if (this.match_EOF(context, token)) {
      this.endRule(context);
      this.endRule(context);
      this.endRule(context);
      this.endRule(context);
      this.build(context, token);
      return 42;
    }
    if (this.match_Comment(context, token)) {
      this.build(context, token);
      return 24;
    }
    if (this.match_BackgroundLine(context, token)) {
      this.endRule(context);
      this.endRule(context);
      this.startRule(context, RuleType.Background);
      this.build(context, token);
      return 25;
    }
    if (this.match_TagLine(context, token)) {
      if (this.lookahead_0(context, token)) {
        this.endRule(context);
        this.endRule(context);
        this.startRule(context, RuleType.ScenarioDefinition);
        this.startRule(context, RuleType.Tags);
        this.build(context, token);
        return 31;
      }
    }
    if (this.match_TagLine(context, token)) {
      this.endRule(context);
      this.endRule(context);
      this.endRule(context);
      this.startRule(context, RuleType.Rule);
      this.startRule(context, RuleType.RuleHeader);
      this.startRule(context, RuleType.Tags);
      this.build(context, token);
      return 22;
    }
    if (this.match_ScenarioLine(context, token)) {
      this.endRule(context);
      this.endRule(context);
      this.startRule(context, RuleType.ScenarioDefinition);
      this.startRule(context, RuleType.Scenario);
      this.build(context, token);
      return 32;
    }
    if (this.match_RuleLine(context, token)) {
      this.endRule(context);
      this.endRule(context);
      this.endRule(context);
      this.startRule(context, RuleType.Rule);
      this.startRule(context, RuleType.RuleHeader);
      this.build(context, token);
      return 23;
    }
    if (this.match_Other(context, token)) {
      this.build(context, token);
      return 24;
    }
    const expectedTokens = ["#EOF", "#Comment", "#BackgroundLine", "#TagLine", "#ScenarioLine", "#RuleLine", "#Other"];
    const error = token.isEof ? UnexpectedEOFException.create(token, expectedTokens) : UnexpectedTokenException.create(token, expectedTokens);
    if (this.stopAtFirstError)
      throw error;
    this.addError(context, error);
    return 24;
  }
  // GherkinDocument:0>Feature:3>Rule:1>Background:0>#BackgroundLine:0
  matchTokenAt_25(token, context) {
    if (this.match_EOF(context, token)) {
      this.endRule(context);
      this.endRule(context);
      this.endRule(context);
      this.build(context, token);
      return 42;
    }
    if (this.match_Empty(context, token)) {
      this.build(context, token);
      return 25;
    }
    if (this.match_Comment(context, token)) {
      this.startRule(context, RuleType.Description);
      this.build(context, token);
      return 26;
    }
    if (this.match_StepLine(context, token)) {
      this.startRule(context, RuleType.Step);
      this.build(context, token);
      return 27;
    }
    if (this.match_TagLine(context, token)) {
      if (this.lookahead_0(context, token)) {
        this.endRule(context);
        this.startRule(context, RuleType.ScenarioDefinition);
        this.startRule(context, RuleType.Tags);
        this.build(context, token);
        return 31;
      }
    }
    if (this.match_TagLine(context, token)) {
      this.endRule(context);
      this.endRule(context);
      this.startRule(context, RuleType.Rule);
      this.startRule(context, RuleType.RuleHeader);
      this.startRule(context, RuleType.Tags);
      this.build(context, token);
      return 22;
    }
    if (this.match_ScenarioLine(context, token)) {
      this.endRule(context);
      this.startRule(context, RuleType.ScenarioDefinition);
      this.startRule(context, RuleType.Scenario);
      this.build(context, token);
      return 32;
    }
    if (this.match_RuleLine(context, token)) {
      this.endRule(context);
      this.endRule(context);
      this.startRule(context, RuleType.Rule);
      this.startRule(context, RuleType.RuleHeader);
      this.build(context, token);
      return 23;
    }
    if (this.match_Other(context, token)) {
      this.startRule(context, RuleType.Description);
      this.build(context, token);
      return 26;
    }
    const expectedTokens = ["#EOF", "#Empty", "#Comment", "#StepLine", "#TagLine", "#ScenarioLine", "#RuleLine", "#Other"];
    const error = token.isEof ? UnexpectedEOFException.create(token, expectedTokens) : UnexpectedTokenException.create(token, expectedTokens);
    if (this.stopAtFirstError)
      throw error;
    this.addError(context, error);
    return 25;
  }
  // GherkinDocument:0>Feature:3>Rule:1>Background:1>DescriptionHelper:1>Description:0>__alt1:0>#Other:0
  matchTokenAt_26(token, context) {
    if (this.match_EOF(context, token)) {
      this.endRule(context);
      this.endRule(context);
      this.endRule(context);
      this.endRule(context);
      this.build(context, token);
      return 42;
    }
    if (this.match_Comment(context, token)) {
      this.build(context, token);
      return 26;
    }
    if (this.match_StepLine(context, token)) {
      this.endRule(context);
      this.startRule(context, RuleType.Step);
      this.build(context, token);
      return 27;
    }
    if (this.match_TagLine(context, token)) {
      if (this.lookahead_0(context, token)) {
        this.endRule(context);
        this.endRule(context);
        this.startRule(context, RuleType.ScenarioDefinition);
        this.startRule(context, RuleType.Tags);
        this.build(context, token);
        return 31;
      }
    }
    if (this.match_TagLine(context, token)) {
      this.endRule(context);
      this.endRule(context);
      this.endRule(context);
      this.startRule(context, RuleType.Rule);
      this.startRule(context, RuleType.RuleHeader);
      this.startRule(context, RuleType.Tags);
      this.build(context, token);
      return 22;
    }
    if (this.match_ScenarioLine(context, token)) {
      this.endRule(context);
      this.endRule(context);
      this.startRule(context, RuleType.ScenarioDefinition);
      this.startRule(context, RuleType.Scenario);
      this.build(context, token);
      return 32;
    }
    if (this.match_RuleLine(context, token)) {
      this.endRule(context);
      this.endRule(context);
      this.endRule(context);
      this.startRule(context, RuleType.Rule);
      this.startRule(context, RuleType.RuleHeader);
      this.build(context, token);
      return 23;
    }
    if (this.match_Other(context, token)) {
      this.build(context, token);
      return 26;
    }
    const expectedTokens = ["#EOF", "#Comment", "#StepLine", "#TagLine", "#ScenarioLine", "#RuleLine", "#Other"];
    const error = token.isEof ? UnexpectedEOFException.create(token, expectedTokens) : UnexpectedTokenException.create(token, expectedTokens);
    if (this.stopAtFirstError)
      throw error;
    this.addError(context, error);
    return 26;
  }
  // GherkinDocument:0>Feature:3>Rule:1>Background:2>Step:0>#StepLine:0
  matchTokenAt_27(token, context) {
    if (this.match_EOF(context, token)) {
      this.endRule(context);
      this.endRule(context);
      this.endRule(context);
      this.endRule(context);
      this.build(context, token);
      return 42;
    }
    if (this.match_TableRow(context, token)) {
      this.startRule(context, RuleType.DataTable);
      this.build(context, token);
      return 28;
    }
    if (this.match_DocStringSeparator(context, token)) {
      this.startRule(context, RuleType.DocString);
      this.build(context, token);
      return 46;
    }
    if (this.match_StepLine(context, token)) {
      this.endRule(context);
      this.startRule(context, RuleType.Step);
      this.build(context, token);
      return 27;
    }
    if (this.match_TagLine(context, token)) {
      if (this.lookahead_0(context, token)) {
        this.endRule(context);
        this.endRule(context);
        this.startRule(context, RuleType.ScenarioDefinition);
        this.startRule(context, RuleType.Tags);
        this.build(context, token);
        return 31;
      }
    }
    if (this.match_TagLine(context, token)) {
      this.endRule(context);
      this.endRule(context);
      this.endRule(context);
      this.startRule(context, RuleType.Rule);
      this.startRule(context, RuleType.RuleHeader);
      this.startRule(context, RuleType.Tags);
      this.build(context, token);
      return 22;
    }
    if (this.match_ScenarioLine(context, token)) {
      this.endRule(context);
      this.endRule(context);
      this.startRule(context, RuleType.ScenarioDefinition);
      this.startRule(context, RuleType.Scenario);
      this.build(context, token);
      return 32;
    }
    if (this.match_RuleLine(context, token)) {
      this.endRule(context);
      this.endRule(context);
      this.endRule(context);
      this.startRule(context, RuleType.Rule);
      this.startRule(context, RuleType.RuleHeader);
      this.build(context, token);
      return 23;
    }
    if (this.match_Comment(context, token)) {
      this.build(context, token);
      return 27;
    }
    if (this.match_Empty(context, token)) {
      this.build(context, token);
      return 27;
    }
    const expectedTokens = ["#EOF", "#TableRow", "#DocStringSeparator", "#StepLine", "#TagLine", "#ScenarioLine", "#RuleLine", "#Comment", "#Empty"];
    const error = token.isEof ? UnexpectedEOFException.create(token, expectedTokens) : UnexpectedTokenException.create(token, expectedTokens);
    if (this.stopAtFirstError)
      throw error;
    this.addError(context, error);
    return 27;
  }
  // GherkinDocument:0>Feature:3>Rule:1>Background:2>Step:1>StepArg:0>__alt0:0>DataTableAndMaybeDocString:0>DataTable:0>#TableRow:0
  matchTokenAt_28(token, context) {
    if (this.match_EOF(context, token)) {
      this.endRule(context);
      this.endRule(context);
      this.endRule(context);
      this.endRule(context);
      this.endRule(context);
      this.build(context, token);
      return 42;
    }
    if (this.match_TableRow(context, token)) {
      this.build(context, token);
      return 28;
    }
    if (this.match_DocStringSeparator(context, token)) {
      this.endRule(context);
      this.startRule(context, RuleType.DocString);
      this.build(context, token);
      return 29;
    }
    if (this.match_StepLine(context, token)) {
      this.endRule(context);
      this.endRule(context);
      this.startRule(context, RuleType.Step);
      this.build(context, token);
      return 27;
    }
    if (this.match_TagLine(context, token)) {
      if (this.lookahead_0(context, token)) {
        this.endRule(context);
        this.endRule(context);
        this.endRule(context);
        this.startRule(context, RuleType.ScenarioDefinition);
        this.startRule(context, RuleType.Tags);
        this.build(context, token);
        return 31;
      }
    }
    if (this.match_TagLine(context, token)) {
      this.endRule(context);
      this.endRule(context);
      this.endRule(context);
      this.endRule(context);
      this.startRule(context, RuleType.Rule);
      this.startRule(context, RuleType.RuleHeader);
      this.startRule(context, RuleType.Tags);
      this.build(context, token);
      return 22;
    }
    if (this.match_ScenarioLine(context, token)) {
      this.endRule(context);
      this.endRule(context);
      this.endRule(context);
      this.startRule(context, RuleType.ScenarioDefinition);
      this.startRule(context, RuleType.Scenario);
      this.build(context, token);
      return 32;
    }
    if (this.match_RuleLine(context, token)) {
      this.endRule(context);
      this.endRule(context);
      this.endRule(context);
      this.endRule(context);
      this.startRule(context, RuleType.Rule);
      this.startRule(context, RuleType.RuleHeader);
      this.build(context, token);
      return 23;
    }
    if (this.match_Comment(context, token)) {
      this.build(context, token);
      return 28;
    }
    if (this.match_Empty(context, token)) {
      this.build(context, token);
      return 28;
    }
    const expectedTokens = ["#EOF", "#TableRow", "#DocStringSeparator", "#StepLine", "#TagLine", "#ScenarioLine", "#RuleLine", "#Comment", "#Empty"];
    const error = token.isEof ? UnexpectedEOFException.create(token, expectedTokens) : UnexpectedTokenException.create(token, expectedTokens);
    if (this.stopAtFirstError)
      throw error;
    this.addError(context, error);
    return 28;
  }
  // GherkinDocument:0>Feature:3>Rule:1>Background:2>Step:1>StepArg:0>__alt0:0>DataTableAndMaybeDocString:1>DocString:0>#DocStringSeparator:0
  matchTokenAt_29(token, context) {
    if (this.match_DocStringSeparator(context, token)) {
      this.build(context, token);
      return 30;
    }
    if (this.match_Other(context, token)) {
      this.build(context, token);
      return 29;
    }
    const expectedTokens = ["#DocStringSeparator", "#Other"];
    const error = token.isEof ? UnexpectedEOFException.create(token, expectedTokens) : UnexpectedTokenException.create(token, expectedTokens);
    if (this.stopAtFirstError)
      throw error;
    this.addError(context, error);
    return 29;
  }
  // GherkinDocument:0>Feature:3>Rule:1>Background:2>Step:1>StepArg:0>__alt0:0>DataTableAndMaybeDocString:1>DocString:2>#DocStringSeparator:0
  matchTokenAt_30(token, context) {
    if (this.match_EOF(context, token)) {
      this.endRule(context);
      this.endRule(context);
      this.endRule(context);
      this.endRule(context);
      this.endRule(context);
      this.build(context, token);
      return 42;
    }
    if (this.match_StepLine(context, token)) {
      this.endRule(context);
      this.endRule(context);
      this.startRule(context, RuleType.Step);
      this.build(context, token);
      return 27;
    }
    if (this.match_TagLine(context, token)) {
      if (this.lookahead_0(context, token)) {
        this.endRule(context);
        this.endRule(context);
        this.endRule(context);
        this.startRule(context, RuleType.ScenarioDefinition);
        this.startRule(context, RuleType.Tags);
        this.build(context, token);
        return 31;
      }
    }
    if (this.match_TagLine(context, token)) {
      this.endRule(context);
      this.endRule(context);
      this.endRule(context);
      this.endRule(context);
      this.startRule(context, RuleType.Rule);
      this.startRule(context, RuleType.RuleHeader);
      this.startRule(context, RuleType.Tags);
      this.build(context, token);
      return 22;
    }
    if (this.match_ScenarioLine(context, token)) {
      this.endRule(context);
      this.endRule(context);
      this.endRule(context);
      this.startRule(context, RuleType.ScenarioDefinition);
      this.startRule(context, RuleType.Scenario);
      this.build(context, token);
      return 32;
    }
    if (this.match_RuleLine(context, token)) {
      this.endRule(context);
      this.endRule(context);
      this.endRule(context);
      this.endRule(context);
      this.startRule(context, RuleType.Rule);
      this.startRule(context, RuleType.RuleHeader);
      this.build(context, token);
      return 23;
    }
    if (this.match_Comment(context, token)) {
      this.build(context, token);
      return 30;
    }
    if (this.match_Empty(context, token)) {
      this.build(context, token);
      return 30;
    }
    const expectedTokens = ["#EOF", "#StepLine", "#TagLine", "#ScenarioLine", "#RuleLine", "#Comment", "#Empty"];
    const error = token.isEof ? UnexpectedEOFException.create(token, expectedTokens) : UnexpectedTokenException.create(token, expectedTokens);
    if (this.stopAtFirstError)
      throw error;
    this.addError(context, error);
    return 30;
  }
  // GherkinDocument:0>Feature:3>Rule:2>ScenarioDefinition:0>Tags:0>#TagLine:0
  matchTokenAt_31(token, context) {
    if (this.match_TagLine(context, token)) {
      this.build(context, token);
      return 31;
    }
    if (this.match_ScenarioLine(context, token)) {
      this.endRule(context);
      this.startRule(context, RuleType.Scenario);
      this.build(context, token);
      return 32;
    }
    if (this.match_Comment(context, token)) {
      this.build(context, token);
      return 31;
    }
    if (this.match_Empty(context, token)) {
      this.build(context, token);
      return 31;
    }
    const expectedTokens = ["#TagLine", "#ScenarioLine", "#Comment", "#Empty"];
    const error = token.isEof ? UnexpectedEOFException.create(token, expectedTokens) : UnexpectedTokenException.create(token, expectedTokens);
    if (this.stopAtFirstError)
      throw error;
    this.addError(context, error);
    return 31;
  }
  // GherkinDocument:0>Feature:3>Rule:2>ScenarioDefinition:1>Scenario:0>#ScenarioLine:0
  matchTokenAt_32(token, context) {
    if (this.match_EOF(context, token)) {
      this.endRule(context);
      this.endRule(context);
      this.endRule(context);
      this.endRule(context);
      this.build(context, token);
      return 42;
    }
    if (this.match_Empty(context, token)) {
      this.build(context, token);
      return 32;
    }
    if (this.match_Comment(context, token)) {
      this.startRule(context, RuleType.Description);
      this.build(context, token);
      return 33;
    }
    if (this.match_StepLine(context, token)) {
      this.startRule(context, RuleType.Step);
      this.build(context, token);
      return 34;
    }
    if (this.match_TagLine(context, token)) {
      if (this.lookahead_1(context, token)) {
        this.startRule(context, RuleType.ExamplesDefinition);
        this.startRule(context, RuleType.Tags);
        this.build(context, token);
        return 38;
      }
    }
    if (this.match_TagLine(context, token)) {
      if (this.lookahead_0(context, token)) {
        this.endRule(context);
        this.endRule(context);
        this.startRule(context, RuleType.ScenarioDefinition);
        this.startRule(context, RuleType.Tags);
        this.build(context, token);
        return 31;
      }
    }
    if (this.match_TagLine(context, token)) {
      this.endRule(context);
      this.endRule(context);
      this.endRule(context);
      this.startRule(context, RuleType.Rule);
      this.startRule(context, RuleType.RuleHeader);
      this.startRule(context, RuleType.Tags);
      this.build(context, token);
      return 22;
    }
    if (this.match_ExamplesLine(context, token)) {
      this.startRule(context, RuleType.ExamplesDefinition);
      this.startRule(context, RuleType.Examples);
      this.build(context, token);
      return 39;
    }
    if (this.match_ScenarioLine(context, token)) {
      this.endRule(context);
      this.endRule(context);
      this.startRule(context, RuleType.ScenarioDefinition);
      this.startRule(context, RuleType.Scenario);
      this.build(context, token);
      return 32;
    }
    if (this.match_RuleLine(context, token)) {
      this.endRule(context);
      this.endRule(context);
      this.endRule(context);
      this.startRule(context, RuleType.Rule);
      this.startRule(context, RuleType.RuleHeader);
      this.build(context, token);
      return 23;
    }
    if (this.match_Other(context, token)) {
      this.startRule(context, RuleType.Description);
      this.build(context, token);
      return 33;
    }
    const expectedTokens = ["#EOF", "#Empty", "#Comment", "#StepLine", "#TagLine", "#ExamplesLine", "#ScenarioLine", "#RuleLine", "#Other"];
    const error = token.isEof ? UnexpectedEOFException.create(token, expectedTokens) : UnexpectedTokenException.create(token, expectedTokens);
    if (this.stopAtFirstError)
      throw error;
    this.addError(context, error);
    return 32;
  }
  // GherkinDocument:0>Feature:3>Rule:2>ScenarioDefinition:1>Scenario:1>DescriptionHelper:1>Description:0>__alt1:0>#Other:0
  matchTokenAt_33(token, context) {
    if (this.match_EOF(context, token)) {
      this.endRule(context);
      this.endRule(context);
      this.endRule(context);
      this.endRule(context);
      this.endRule(context);
      this.build(context, token);
      return 42;
    }
    if (this.match_Comment(context, token)) {
      this.build(context, token);
      return 33;
    }
    if (this.match_StepLine(context, token)) {
      this.endRule(context);
      this.startRule(context, RuleType.Step);
      this.build(context, token);
      return 34;
    }
    if (this.match_TagLine(context, token)) {
      if (this.lookahead_1(context, token)) {
        this.endRule(context);
        this.startRule(context, RuleType.ExamplesDefinition);
        this.startRule(context, RuleType.Tags);
        this.build(context, token);
        return 38;
      }
    }
    if (this.match_TagLine(context, token)) {
      if (this.lookahead_0(context, token)) {
        this.endRule(context);
        this.endRule(context);
        this.endRule(context);
        this.startRule(context, RuleType.ScenarioDefinition);
        this.startRule(context, RuleType.Tags);
        this.build(context, token);
        return 31;
      }
    }
    if (this.match_TagLine(context, token)) {
      this.endRule(context);
      this.endRule(context);
      this.endRule(context);
      this.endRule(context);
      this.startRule(context, RuleType.Rule);
      this.startRule(context, RuleType.RuleHeader);
      this.startRule(context, RuleType.Tags);
      this.build(context, token);
      return 22;
    }
    if (this.match_ExamplesLine(context, token)) {
      this.endRule(context);
      this.startRule(context, RuleType.ExamplesDefinition);
      this.startRule(context, RuleType.Examples);
      this.build(context, token);
      return 39;
    }
    if (this.match_ScenarioLine(context, token)) {
      this.endRule(context);
      this.endRule(context);
      this.endRule(context);
      this.startRule(context, RuleType.ScenarioDefinition);
      this.startRule(context, RuleType.Scenario);
      this.build(context, token);
      return 32;
    }
    if (this.match_RuleLine(context, token)) {
      this.endRule(context);
      this.endRule(context);
      this.endRule(context);
      this.endRule(context);
      this.startRule(context, RuleType.Rule);
      this.startRule(context, RuleType.RuleHeader);
      this.build(context, token);
      return 23;
    }
    if (this.match_Other(context, token)) {
      this.build(context, token);
      return 33;
    }
    const expectedTokens = ["#EOF", "#Comment", "#StepLine", "#TagLine", "#ExamplesLine", "#ScenarioLine", "#RuleLine", "#Other"];
    const error = token.isEof ? UnexpectedEOFException.create(token, expectedTokens) : UnexpectedTokenException.create(token, expectedTokens);
    if (this.stopAtFirstError)
      throw error;
    this.addError(context, error);
    return 33;
  }
  // GherkinDocument:0>Feature:3>Rule:2>ScenarioDefinition:1>Scenario:2>Step:0>#StepLine:0
  matchTokenAt_34(token, context) {
    if (this.match_EOF(context, token)) {
      this.endRule(context);
      this.endRule(context);
      this.endRule(context);
      this.endRule(context);
      this.endRule(context);
      this.build(context, token);
      return 42;
    }
    if (this.match_TableRow(context, token)) {
      this.startRule(context, RuleType.DataTable);
      this.build(context, token);
      return 35;
    }
    if (this.match_DocStringSeparator(context, token)) {
      this.startRule(context, RuleType.DocString);
      this.build(context, token);
      return 43;
    }
    if (this.match_StepLine(context, token)) {
      this.endRule(context);
      this.startRule(context, RuleType.Step);
      this.build(context, token);
      return 34;
    }
    if (this.match_TagLine(context, token)) {
      if (this.lookahead_1(context, token)) {
        this.endRule(context);
        this.startRule(context, RuleType.ExamplesDefinition);
        this.startRule(context, RuleType.Tags);
        this.build(context, token);
        return 38;
      }
    }
    if (this.match_TagLine(context, token)) {
      if (this.lookahead_0(context, token)) {
        this.endRule(context);
        this.endRule(context);
        this.endRule(context);
        this.startRule(context, RuleType.ScenarioDefinition);
        this.startRule(context, RuleType.Tags);
        this.build(context, token);
        return 31;
      }
    }
    if (this.match_TagLine(context, token)) {
      this.endRule(context);
      this.endRule(context);
      this.endRule(context);
      this.endRule(context);
      this.startRule(context, RuleType.Rule);
      this.startRule(context, RuleType.RuleHeader);
      this.startRule(context, RuleType.Tags);
      this.build(context, token);
      return 22;
    }
    if (this.match_ExamplesLine(context, token)) {
      this.endRule(context);
      this.startRule(context, RuleType.ExamplesDefinition);
      this.startRule(context, RuleType.Examples);
      this.build(context, token);
      return 39;
    }
    if (this.match_ScenarioLine(context, token)) {
      this.endRule(context);
      this.endRule(context);
      this.endRule(context);
      this.startRule(context, RuleType.ScenarioDefinition);
      this.startRule(context, RuleType.Scenario);
      this.build(context, token);
      return 32;
    }
    if (this.match_RuleLine(context, token)) {
      this.endRule(context);
      this.endRule(context);
      this.endRule(context);
      this.endRule(context);
      this.startRule(context, RuleType.Rule);
      this.startRule(context, RuleType.RuleHeader);
      this.build(context, token);
      return 23;
    }
    if (this.match_Comment(context, token)) {
      this.build(context, token);
      return 34;
    }
    if (this.match_Empty(context, token)) {
      this.build(context, token);
      return 34;
    }
    const expectedTokens = ["#EOF", "#TableRow", "#DocStringSeparator", "#StepLine", "#TagLine", "#ExamplesLine", "#ScenarioLine", "#RuleLine", "#Comment", "#Empty"];
    const error = token.isEof ? UnexpectedEOFException.create(token, expectedTokens) : UnexpectedTokenException.create(token, expectedTokens);
    if (this.stopAtFirstError)
      throw error;
    this.addError(context, error);
    return 34;
  }
  // GherkinDocument:0>Feature:3>Rule:2>ScenarioDefinition:1>Scenario:2>Step:1>StepArg:0>__alt0:0>DataTableAndMaybeDocString:0>DataTable:0>#TableRow:0
  matchTokenAt_35(token, context) {
    if (this.match_EOF(context, token)) {
      this.endRule(context);
      this.endRule(context);
      this.endRule(context);
      this.endRule(context);
      this.endRule(context);
      this.endRule(context);
      this.build(context, token);
      return 42;
    }
    if (this.match_TableRow(context, token)) {
      this.build(context, token);
      return 35;
    }
    if (this.match_DocStringSeparator(context, token)) {
      this.endRule(context);
      this.startRule(context, RuleType.DocString);
      this.build(context, token);
      return 36;
    }
    if (this.match_StepLine(context, token)) {
      this.endRule(context);
      this.endRule(context);
      this.startRule(context, RuleType.Step);
      this.build(context, token);
      return 34;
    }
    if (this.match_TagLine(context, token)) {
      if (this.lookahead_1(context, token)) {
        this.endRule(context);
        this.endRule(context);
        this.startRule(context, RuleType.ExamplesDefinition);
        this.startRule(context, RuleType.Tags);
        this.build(context, token);
        return 38;
      }
    }
    if (this.match_TagLine(context, token)) {
      if (this.lookahead_0(context, token)) {
        this.endRule(context);
        this.endRule(context);
        this.endRule(context);
        this.endRule(context);
        this.startRule(context, RuleType.ScenarioDefinition);
        this.startRule(context, RuleType.Tags);
        this.build(context, token);
        return 31;
      }
    }
    if (this.match_TagLine(context, token)) {
      this.endRule(context);
      this.endRule(context);
      this.endRule(context);
      this.endRule(context);
      this.endRule(context);
      this.startRule(context, RuleType.Rule);
      this.startRule(context, RuleType.RuleHeader);
      this.startRule(context, RuleType.Tags);
      this.build(context, token);
      return 22;
    }
    if (this.match_ExamplesLine(context, token)) {
      this.endRule(context);
      this.endRule(context);
      this.startRule(context, RuleType.ExamplesDefinition);
      this.startRule(context, RuleType.Examples);
      this.build(context, token);
      return 39;
    }
    if (this.match_ScenarioLine(context, token)) {
      this.endRule(context);
      this.endRule(context);
      this.endRule(context);
      this.endRule(context);
      this.startRule(context, RuleType.ScenarioDefinition);
      this.startRule(context, RuleType.Scenario);
      this.build(context, token);
      return 32;
    }
    if (this.match_RuleLine(context, token)) {
      this.endRule(context);
      this.endRule(context);
      this.endRule(context);
      this.endRule(context);
      this.endRule(context);
      this.startRule(context, RuleType.Rule);
      this.startRule(context, RuleType.RuleHeader);
      this.build(context, token);
      return 23;
    }
    if (this.match_Comment(context, token)) {
      this.build(context, token);
      return 35;
    }
    if (this.match_Empty(context, token)) {
      this.build(context, token);
      return 35;
    }
    const expectedTokens = ["#EOF", "#TableRow", "#DocStringSeparator", "#StepLine", "#TagLine", "#ExamplesLine", "#ScenarioLine", "#RuleLine", "#Comment", "#Empty"];
    const error = token.isEof ? UnexpectedEOFException.create(token, expectedTokens) : UnexpectedTokenException.create(token, expectedTokens);
    if (this.stopAtFirstError)
      throw error;
    this.addError(context, error);
    return 35;
  }
  // GherkinDocument:0>Feature:3>Rule:2>ScenarioDefinition:1>Scenario:2>Step:1>StepArg:0>__alt0:0>DataTableAndMaybeDocString:1>DocString:0>#DocStringSeparator:0
  matchTokenAt_36(token, context) {
    if (this.match_DocStringSeparator(context, token)) {
      this.build(context, token);
      return 37;
    }
    if (this.match_Other(context, token)) {
      this.build(context, token);
      return 36;
    }
    const expectedTokens = ["#DocStringSeparator", "#Other"];
    const error = token.isEof ? UnexpectedEOFException.create(token, expectedTokens) : UnexpectedTokenException.create(token, expectedTokens);
    if (this.stopAtFirstError)
      throw error;
    this.addError(context, error);
    return 36;
  }
  // GherkinDocument:0>Feature:3>Rule:2>ScenarioDefinition:1>Scenario:2>Step:1>StepArg:0>__alt0:0>DataTableAndMaybeDocString:1>DocString:2>#DocStringSeparator:0
  matchTokenAt_37(token, context) {
    if (this.match_EOF(context, token)) {
      this.endRule(context);
      this.endRule(context);
      this.endRule(context);
      this.endRule(context);
      this.endRule(context);
      this.endRule(context);
      this.build(context, token);
      return 42;
    }
    if (this.match_StepLine(context, token)) {
      this.endRule(context);
      this.endRule(context);
      this.startRule(context, RuleType.Step);
      this.build(context, token);
      return 34;
    }
    if (this.match_TagLine(context, token)) {
      if (this.lookahead_1(context, token)) {
        this.endRule(context);
        this.endRule(context);
        this.startRule(context, RuleType.ExamplesDefinition);
        this.startRule(context, RuleType.Tags);
        this.build(context, token);
        return 38;
      }
    }
    if (this.match_TagLine(context, token)) {
      if (this.lookahead_0(context, token)) {
        this.endRule(context);
        this.endRule(context);
        this.endRule(context);
        this.endRule(context);
        this.startRule(context, RuleType.ScenarioDefinition);
        this.startRule(context, RuleType.Tags);
        this.build(context, token);
        return 31;
      }
    }
    if (this.match_TagLine(context, token)) {
      this.endRule(context);
      this.endRule(context);
      this.endRule(context);
      this.endRule(context);
      this.endRule(context);
      this.startRule(context, RuleType.Rule);
      this.startRule(context, RuleType.RuleHeader);
      this.startRule(context, RuleType.Tags);
      this.build(context, token);
      return 22;
    }
    if (this.match_ExamplesLine(context, token)) {
      this.endRule(context);
      this.endRule(context);
      this.startRule(context, RuleType.ExamplesDefinition);
      this.startRule(context, RuleType.Examples);
      this.build(context, token);
      return 39;
    }
    if (this.match_ScenarioLine(context, token)) {
      this.endRule(context);
      this.endRule(context);
      this.endRule(context);
      this.endRule(context);
      this.startRule(context, RuleType.ScenarioDefinition);
      this.startRule(context, RuleType.Scenario);
      this.build(context, token);
      return 32;
    }
    if (this.match_RuleLine(context, token)) {
      this.endRule(context);
      this.endRule(context);
      this.endRule(context);
      this.endRule(context);
      this.endRule(context);
      this.startRule(context, RuleType.Rule);
      this.startRule(context, RuleType.RuleHeader);
      this.build(context, token);
      return 23;
    }
    if (this.match_Comment(context, token)) {
      this.build(context, token);
      return 37;
    }
    if (this.match_Empty(context, token)) {
      this.build(context, token);
      return 37;
    }
    const expectedTokens = ["#EOF", "#StepLine", "#TagLine", "#ExamplesLine", "#ScenarioLine", "#RuleLine", "#Comment", "#Empty"];
    const error = token.isEof ? UnexpectedEOFException.create(token, expectedTokens) : UnexpectedTokenException.create(token, expectedTokens);
    if (this.stopAtFirstError)
      throw error;
    this.addError(context, error);
    return 37;
  }
  // GherkinDocument:0>Feature:3>Rule:2>ScenarioDefinition:1>Scenario:3>ExamplesDefinition:0>Tags:0>#TagLine:0
  matchTokenAt_38(token, context) {
    if (this.match_TagLine(context, token)) {
      this.build(context, token);
      return 38;
    }
    if (this.match_ExamplesLine(context, token)) {
      this.endRule(context);
      this.startRule(context, RuleType.Examples);
      this.build(context, token);
      return 39;
    }
    if (this.match_Comment(context, token)) {
      this.build(context, token);
      return 38;
    }
    if (this.match_Empty(context, token)) {
      this.build(context, token);
      return 38;
    }
    const expectedTokens = ["#TagLine", "#ExamplesLine", "#Comment", "#Empty"];
    const error = token.isEof ? UnexpectedEOFException.create(token, expectedTokens) : UnexpectedTokenException.create(token, expectedTokens);
    if (this.stopAtFirstError)
      throw error;
    this.addError(context, error);
    return 38;
  }
  // GherkinDocument:0>Feature:3>Rule:2>ScenarioDefinition:1>Scenario:3>ExamplesDefinition:1>Examples:0>#ExamplesLine:0
  matchTokenAt_39(token, context) {
    if (this.match_EOF(context, token)) {
      this.endRule(context);
      this.endRule(context);
      this.endRule(context);
      this.endRule(context);
      this.endRule(context);
      this.endRule(context);
      this.build(context, token);
      return 42;
    }
    if (this.match_Empty(context, token)) {
      this.build(context, token);
      return 39;
    }
    if (this.match_Comment(context, token)) {
      this.startRule(context, RuleType.Description);
      this.build(context, token);
      return 40;
    }
    if (this.match_TableRow(context, token)) {
      this.startRule(context, RuleType.ExamplesTable);
      this.build(context, token);
      return 41;
    }
    if (this.match_TagLine(context, token)) {
      if (this.lookahead_1(context, token)) {
        this.endRule(context);
        this.endRule(context);
        this.startRule(context, RuleType.ExamplesDefinition);
        this.startRule(context, RuleType.Tags);
        this.build(context, token);
        return 38;
      }
    }
    if (this.match_TagLine(context, token)) {
      if (this.lookahead_0(context, token)) {
        this.endRule(context);
        this.endRule(context);
        this.endRule(context);
        this.endRule(context);
        this.startRule(context, RuleType.ScenarioDefinition);
        this.startRule(context, RuleType.Tags);
        this.build(context, token);
        return 31;
      }
    }
    if (this.match_TagLine(context, token)) {
      this.endRule(context);
      this.endRule(context);
      this.endRule(context);
      this.endRule(context);
      this.endRule(context);
      this.startRule(context, RuleType.Rule);
      this.startRule(context, RuleType.RuleHeader);
      this.startRule(context, RuleType.Tags);
      this.build(context, token);
      return 22;
    }
    if (this.match_ExamplesLine(context, token)) {
      this.endRule(context);
      this.endRule(context);
      this.startRule(context, RuleType.ExamplesDefinition);
      this.startRule(context, RuleType.Examples);
      this.build(context, token);
      return 39;
    }
    if (this.match_ScenarioLine(context, token)) {
      this.endRule(context);
      this.endRule(context);
      this.endRule(context);
      this.endRule(context);
      this.startRule(context, RuleType.ScenarioDefinition);
      this.startRule(context, RuleType.Scenario);
      this.build(context, token);
      return 32;
    }
    if (this.match_RuleLine(context, token)) {
      this.endRule(context);
      this.endRule(context);
      this.endRule(context);
      this.endRule(context);
      this.endRule(context);
      this.startRule(context, RuleType.Rule);
      this.startRule(context, RuleType.RuleHeader);
      this.build(context, token);
      return 23;
    }
    if (this.match_Other(context, token)) {
      this.startRule(context, RuleType.Description);
      this.build(context, token);
      return 40;
    }
    const expectedTokens = ["#EOF", "#Empty", "#Comment", "#TableRow", "#TagLine", "#ExamplesLine", "#ScenarioLine", "#RuleLine", "#Other"];
    const error = token.isEof ? UnexpectedEOFException.create(token, expectedTokens) : UnexpectedTokenException.create(token, expectedTokens);
    if (this.stopAtFirstError)
      throw error;
    this.addError(context, error);
    return 39;
  }
  // GherkinDocument:0>Feature:3>Rule:2>ScenarioDefinition:1>Scenario:3>ExamplesDefinition:1>Examples:1>DescriptionHelper:1>Description:0>__alt1:0>#Other:0
  matchTokenAt_40(token, context) {
    if (this.match_EOF(context, token)) {
      this.endRule(context);
      this.endRule(context);
      this.endRule(context);
      this.endRule(context);
      this.endRule(context);
      this.endRule(context);
      this.endRule(context);
      this.build(context, token);
      return 42;
    }
    if (this.match_Comment(context, token)) {
      this.build(context, token);
      return 40;
    }
    if (this.match_TableRow(context, token)) {
      this.endRule(context);
      this.startRule(context, RuleType.ExamplesTable);
      this.build(context, token);
      return 41;
    }
    if (this.match_TagLine(context, token)) {
      if (this.lookahead_1(context, token)) {
        this.endRule(context);
        this.endRule(context);
        this.endRule(context);
        this.startRule(context, RuleType.ExamplesDefinition);
        this.startRule(context, RuleType.Tags);
        this.build(context, token);
        return 38;
      }
    }
    if (this.match_TagLine(context, token)) {
      if (this.lookahead_0(context, token)) {
        this.endRule(context);
        this.endRule(context);
        this.endRule(context);
        this.endRule(context);
        this.endRule(context);
        this.startRule(context, RuleType.ScenarioDefinition);
        this.startRule(context, RuleType.Tags);
        this.build(context, token);
        return 31;
      }
    }
    if (this.match_TagLine(context, token)) {
      this.endRule(context);
      this.endRule(context);
      this.endRule(context);
      this.endRule(context);
      this.endRule(context);
      this.endRule(context);
      this.startRule(context, RuleType.Rule);
      this.startRule(context, RuleType.RuleHeader);
      this.startRule(context, RuleType.Tags);
      this.build(context, token);
      return 22;
    }
    if (this.match_ExamplesLine(context, token)) {
      this.endRule(context);
      this.endRule(context);
      this.endRule(context);
      this.startRule(context, RuleType.ExamplesDefinition);
      this.startRule(context, RuleType.Examples);
      this.build(context, token);
      return 39;
    }
    if (this.match_ScenarioLine(context, token)) {
      this.endRule(context);
      this.endRule(context);
      this.endRule(context);
      this.endRule(context);
      this.endRule(context);
      this.startRule(context, RuleType.ScenarioDefinition);
      this.startRule(context, RuleType.Scenario);
      this.build(context, token);
      return 32;
    }
    if (this.match_RuleLine(context, token)) {
      this.endRule(context);
      this.endRule(context);
      this.endRule(context);
      this.endRule(context);
      this.endRule(context);
      this.endRule(context);
      this.startRule(context, RuleType.Rule);
      this.startRule(context, RuleType.RuleHeader);
      this.build(context, token);
      return 23;
    }
    if (this.match_Other(context, token)) {
      this.build(context, token);
      return 40;
    }
    const expectedTokens = ["#EOF", "#Comment", "#TableRow", "#TagLine", "#ExamplesLine", "#ScenarioLine", "#RuleLine", "#Other"];
    const error = token.isEof ? UnexpectedEOFException.create(token, expectedTokens) : UnexpectedTokenException.create(token, expectedTokens);
    if (this.stopAtFirstError)
      throw error;
    this.addError(context, error);
    return 40;
  }
  // GherkinDocument:0>Feature:3>Rule:2>ScenarioDefinition:1>Scenario:3>ExamplesDefinition:1>Examples:2>ExamplesTable:0>#TableRow:0
  matchTokenAt_41(token, context) {
    if (this.match_EOF(context, token)) {
      this.endRule(context);
      this.endRule(context);
      this.endRule(context);
      this.endRule(context);
      this.endRule(context);
      this.endRule(context);
      this.endRule(context);
      this.build(context, token);
      return 42;
    }
    if (this.match_TableRow(context, token)) {
      this.build(context, token);
      return 41;
    }
    if (this.match_TagLine(context, token)) {
      if (this.lookahead_1(context, token)) {
        this.endRule(context);
        this.endRule(context);
        this.endRule(context);
        this.startRule(context, RuleType.ExamplesDefinition);
        this.startRule(context, RuleType.Tags);
        this.build(context, token);
        return 38;
      }
    }
    if (this.match_TagLine(context, token)) {
      if (this.lookahead_0(context, token)) {
        this.endRule(context);
        this.endRule(context);
        this.endRule(context);
        this.endRule(context);
        this.endRule(context);
        this.startRule(context, RuleType.ScenarioDefinition);
        this.startRule(context, RuleType.Tags);
        this.build(context, token);
        return 31;
      }
    }
    if (this.match_TagLine(context, token)) {
      this.endRule(context);
      this.endRule(context);
      this.endRule(context);
      this.endRule(context);
      this.endRule(context);
      this.endRule(context);
      this.startRule(context, RuleType.Rule);
      this.startRule(context, RuleType.RuleHeader);
      this.startRule(context, RuleType.Tags);
      this.build(context, token);
      return 22;
    }
    if (this.match_ExamplesLine(context, token)) {
      this.endRule(context);
      this.endRule(context);
      this.endRule(context);
      this.startRule(context, RuleType.ExamplesDefinition);
      this.startRule(context, RuleType.Examples);
      this.build(context, token);
      return 39;
    }
    if (this.match_ScenarioLine(context, token)) {
      this.endRule(context);
      this.endRule(context);
      this.endRule(context);
      this.endRule(context);
      this.endRule(context);
      this.startRule(context, RuleType.ScenarioDefinition);
      this.startRule(context, RuleType.Scenario);
      this.build(context, token);
      return 32;
    }
    if (this.match_RuleLine(context, token)) {
      this.endRule(context);
      this.endRule(context);
      this.endRule(context);
      this.endRule(context);
      this.endRule(context);
      this.endRule(context);
      this.startRule(context, RuleType.Rule);
      this.startRule(context, RuleType.RuleHeader);
      this.build(context, token);
      return 23;
    }
    if (this.match_Comment(context, token)) {
      this.build(context, token);
      return 41;
    }
    if (this.match_Empty(context, token)) {
      this.build(context, token);
      return 41;
    }
    const expectedTokens = ["#EOF", "#TableRow", "#TagLine", "#ExamplesLine", "#ScenarioLine", "#RuleLine", "#Comment", "#Empty"];
    const error = token.isEof ? UnexpectedEOFException.create(token, expectedTokens) : UnexpectedTokenException.create(token, expectedTokens);
    if (this.stopAtFirstError)
      throw error;
    this.addError(context, error);
    return 41;
  }
  // GherkinDocument:0>Feature:3>Rule:2>ScenarioDefinition:1>Scenario:2>Step:1>StepArg:0>__alt0:1>DocStringAndMaybeDataTable:0>DocString:0>#DocStringSeparator:0
  matchTokenAt_43(token, context) {
    if (this.match_DocStringSeparator(context, token)) {
      this.build(context, token);
      return 44;
    }
    if (this.match_Other(context, token)) {
      this.build(context, token);
      return 43;
    }
    const expectedTokens = ["#DocStringSeparator", "#Other"];
    const error = token.isEof ? UnexpectedEOFException.create(token, expectedTokens) : UnexpectedTokenException.create(token, expectedTokens);
    if (this.stopAtFirstError)
      throw error;
    this.addError(context, error);
    return 43;
  }
  // GherkinDocument:0>Feature:3>Rule:2>ScenarioDefinition:1>Scenario:2>Step:1>StepArg:0>__alt0:1>DocStringAndMaybeDataTable:0>DocString:2>#DocStringSeparator:0
  matchTokenAt_44(token, context) {
    if (this.match_EOF(context, token)) {
      this.endRule(context);
      this.endRule(context);
      this.endRule(context);
      this.endRule(context);
      this.endRule(context);
      this.endRule(context);
      this.build(context, token);
      return 42;
    }
    if (this.match_TableRow(context, token)) {
      this.endRule(context);
      this.startRule(context, RuleType.DataTable);
      this.build(context, token);
      return 45;
    }
    if (this.match_StepLine(context, token)) {
      this.endRule(context);
      this.endRule(context);
      this.startRule(context, RuleType.Step);
      this.build(context, token);
      return 34;
    }
    if (this.match_TagLine(context, token)) {
      if (this.lookahead_1(context, token)) {
        this.endRule(context);
        this.endRule(context);
        this.startRule(context, RuleType.ExamplesDefinition);
        this.startRule(context, RuleType.Tags);
        this.build(context, token);
        return 38;
      }
    }
    if (this.match_TagLine(context, token)) {
      if (this.lookahead_0(context, token)) {
        this.endRule(context);
        this.endRule(context);
        this.endRule(context);
        this.endRule(context);
        this.startRule(context, RuleType.ScenarioDefinition);
        this.startRule(context, RuleType.Tags);
        this.build(context, token);
        return 31;
      }
    }
    if (this.match_TagLine(context, token)) {
      this.endRule(context);
      this.endRule(context);
      this.endRule(context);
      this.endRule(context);
      this.endRule(context);
      this.startRule(context, RuleType.Rule);
      this.startRule(context, RuleType.RuleHeader);
      this.startRule(context, RuleType.Tags);
      this.build(context, token);
      return 22;
    }
    if (this.match_ExamplesLine(context, token)) {
      this.endRule(context);
      this.endRule(context);
      this.startRule(context, RuleType.ExamplesDefinition);
      this.startRule(context, RuleType.Examples);
      this.build(context, token);
      return 39;
    }
    if (this.match_ScenarioLine(context, token)) {
      this.endRule(context);
      this.endRule(context);
      this.endRule(context);
      this.endRule(context);
      this.startRule(context, RuleType.ScenarioDefinition);
      this.startRule(context, RuleType.Scenario);
      this.build(context, token);
      return 32;
    }
    if (this.match_RuleLine(context, token)) {
      this.endRule(context);
      this.endRule(context);
      this.endRule(context);
      this.endRule(context);
      this.endRule(context);
      this.startRule(context, RuleType.Rule);
      this.startRule(context, RuleType.RuleHeader);
      this.build(context, token);
      return 23;
    }
    if (this.match_Comment(context, token)) {
      this.build(context, token);
      return 44;
    }
    if (this.match_Empty(context, token)) {
      this.build(context, token);
      return 44;
    }
    const expectedTokens = ["#EOF", "#TableRow", "#StepLine", "#TagLine", "#ExamplesLine", "#ScenarioLine", "#RuleLine", "#Comment", "#Empty"];
    const error = token.isEof ? UnexpectedEOFException.create(token, expectedTokens) : UnexpectedTokenException.create(token, expectedTokens);
    if (this.stopAtFirstError)
      throw error;
    this.addError(context, error);
    return 44;
  }
  // GherkinDocument:0>Feature:3>Rule:2>ScenarioDefinition:1>Scenario:2>Step:1>StepArg:0>__alt0:1>DocStringAndMaybeDataTable:1>DataTable:0>#TableRow:0
  matchTokenAt_45(token, context) {
    if (this.match_EOF(context, token)) {
      this.endRule(context);
      this.endRule(context);
      this.endRule(context);
      this.endRule(context);
      this.endRule(context);
      this.endRule(context);
      this.build(context, token);
      return 42;
    }
    if (this.match_TableRow(context, token)) {
      this.build(context, token);
      return 45;
    }
    if (this.match_StepLine(context, token)) {
      this.endRule(context);
      this.endRule(context);
      this.startRule(context, RuleType.Step);
      this.build(context, token);
      return 34;
    }
    if (this.match_TagLine(context, token)) {
      if (this.lookahead_1(context, token)) {
        this.endRule(context);
        this.endRule(context);
        this.startRule(context, RuleType.ExamplesDefinition);
        this.startRule(context, RuleType.Tags);
        this.build(context, token);
        return 38;
      }
    }
    if (this.match_TagLine(context, token)) {
      if (this.lookahead_0(context, token)) {
        this.endRule(context);
        this.endRule(context);
        this.endRule(context);
        this.endRule(context);
        this.startRule(context, RuleType.ScenarioDefinition);
        this.startRule(context, RuleType.Tags);
        this.build(context, token);
        return 31;
      }
    }
    if (this.match_TagLine(context, token)) {
      this.endRule(context);
      this.endRule(context);
      this.endRule(context);
      this.endRule(context);
      this.endRule(context);
      this.startRule(context, RuleType.Rule);
      this.startRule(context, RuleType.RuleHeader);
      this.startRule(context, RuleType.Tags);
      this.build(context, token);
      return 22;
    }
    if (this.match_ExamplesLine(context, token)) {
      this.endRule(context);
      this.endRule(context);
      this.startRule(context, RuleType.ExamplesDefinition);
      this.startRule(context, RuleType.Examples);
      this.build(context, token);
      return 39;
    }
    if (this.match_ScenarioLine(context, token)) {
      this.endRule(context);
      this.endRule(context);
      this.endRule(context);
      this.endRule(context);
      this.startRule(context, RuleType.ScenarioDefinition);
      this.startRule(context, RuleType.Scenario);
      this.build(context, token);
      return 32;
    }
    if (this.match_RuleLine(context, token)) {
      this.endRule(context);
      this.endRule(context);
      this.endRule(context);
      this.endRule(context);
      this.endRule(context);
      this.startRule(context, RuleType.Rule);
      this.startRule(context, RuleType.RuleHeader);
      this.build(context, token);
      return 23;
    }
    if (this.match_Comment(context, token)) {
      this.build(context, token);
      return 45;
    }
    if (this.match_Empty(context, token)) {
      this.build(context, token);
      return 45;
    }
    const expectedTokens = ["#EOF", "#TableRow", "#StepLine", "#TagLine", "#ExamplesLine", "#ScenarioLine", "#RuleLine", "#Comment", "#Empty"];
    const error = token.isEof ? UnexpectedEOFException.create(token, expectedTokens) : UnexpectedTokenException.create(token, expectedTokens);
    if (this.stopAtFirstError)
      throw error;
    this.addError(context, error);
    return 45;
  }
  // GherkinDocument:0>Feature:3>Rule:1>Background:2>Step:1>StepArg:0>__alt0:1>DocStringAndMaybeDataTable:0>DocString:0>#DocStringSeparator:0
  matchTokenAt_46(token, context) {
    if (this.match_DocStringSeparator(context, token)) {
      this.build(context, token);
      return 47;
    }
    if (this.match_Other(context, token)) {
      this.build(context, token);
      return 46;
    }
    const expectedTokens = ["#DocStringSeparator", "#Other"];
    const error = token.isEof ? UnexpectedEOFException.create(token, expectedTokens) : UnexpectedTokenException.create(token, expectedTokens);
    if (this.stopAtFirstError)
      throw error;
    this.addError(context, error);
    return 46;
  }
  // GherkinDocument:0>Feature:3>Rule:1>Background:2>Step:1>StepArg:0>__alt0:1>DocStringAndMaybeDataTable:0>DocString:2>#DocStringSeparator:0
  matchTokenAt_47(token, context) {
    if (this.match_EOF(context, token)) {
      this.endRule(context);
      this.endRule(context);
      this.endRule(context);
      this.endRule(context);
      this.endRule(context);
      this.build(context, token);
      return 42;
    }
    if (this.match_TableRow(context, token)) {
      this.endRule(context);
      this.startRule(context, RuleType.DataTable);
      this.build(context, token);
      return 48;
    }
    if (this.match_StepLine(context, token)) {
      this.endRule(context);
      this.endRule(context);
      this.startRule(context, RuleType.Step);
      this.build(context, token);
      return 27;
    }
    if (this.match_TagLine(context, token)) {
      if (this.lookahead_0(context, token)) {
        this.endRule(context);
        this.endRule(context);
        this.endRule(context);
        this.startRule(context, RuleType.ScenarioDefinition);
        this.startRule(context, RuleType.Tags);
        this.build(context, token);
        return 31;
      }
    }
    if (this.match_TagLine(context, token)) {
      this.endRule(context);
      this.endRule(context);
      this.endRule(context);
      this.endRule(context);
      this.startRule(context, RuleType.Rule);
      this.startRule(context, RuleType.RuleHeader);
      this.startRule(context, RuleType.Tags);
      this.build(context, token);
      return 22;
    }
    if (this.match_ScenarioLine(context, token)) {
      this.endRule(context);
      this.endRule(context);
      this.endRule(context);
      this.startRule(context, RuleType.ScenarioDefinition);
      this.startRule(context, RuleType.Scenario);
      this.build(context, token);
      return 32;
    }
    if (this.match_RuleLine(context, token)) {
      this.endRule(context);
      this.endRule(context);
      this.endRule(context);
      this.endRule(context);
      this.startRule(context, RuleType.Rule);
      this.startRule(context, RuleType.RuleHeader);
      this.build(context, token);
      return 23;
    }
    if (this.match_Comment(context, token)) {
      this.build(context, token);
      return 47;
    }
    if (this.match_Empty(context, token)) {
      this.build(context, token);
      return 47;
    }
    const expectedTokens = ["#EOF", "#TableRow", "#StepLine", "#TagLine", "#ScenarioLine", "#RuleLine", "#Comment", "#Empty"];
    const error = token.isEof ? UnexpectedEOFException.create(token, expectedTokens) : UnexpectedTokenException.create(token, expectedTokens);
    if (this.stopAtFirstError)
      throw error;
    this.addError(context, error);
    return 47;
  }
  // GherkinDocument:0>Feature:3>Rule:1>Background:2>Step:1>StepArg:0>__alt0:1>DocStringAndMaybeDataTable:1>DataTable:0>#TableRow:0
  matchTokenAt_48(token, context) {
    if (this.match_EOF(context, token)) {
      this.endRule(context);
      this.endRule(context);
      this.endRule(context);
      this.endRule(context);
      this.endRule(context);
      this.build(context, token);
      return 42;
    }
    if (this.match_TableRow(context, token)) {
      this.build(context, token);
      return 48;
    }
    if (this.match_StepLine(context, token)) {
      this.endRule(context);
      this.endRule(context);
      this.startRule(context, RuleType.Step);
      this.build(context, token);
      return 27;
    }
    if (this.match_TagLine(context, token)) {
      if (this.lookahead_0(context, token)) {
        this.endRule(context);
        this.endRule(context);
        this.endRule(context);
        this.startRule(context, RuleType.ScenarioDefinition);
        this.startRule(context, RuleType.Tags);
        this.build(context, token);
        return 31;
      }
    }
    if (this.match_TagLine(context, token)) {
      this.endRule(context);
      this.endRule(context);
      this.endRule(context);
      this.endRule(context);
      this.startRule(context, RuleType.Rule);
      this.startRule(context, RuleType.RuleHeader);
      this.startRule(context, RuleType.Tags);
      this.build(context, token);
      return 22;
    }
    if (this.match_ScenarioLine(context, token)) {
      this.endRule(context);
      this.endRule(context);
      this.endRule(context);
      this.startRule(context, RuleType.ScenarioDefinition);
      this.startRule(context, RuleType.Scenario);
      this.build(context, token);
      return 32;
    }
    if (this.match_RuleLine(context, token)) {
      this.endRule(context);
      this.endRule(context);
      this.endRule(context);
      this.endRule(context);
      this.startRule(context, RuleType.Rule);
      this.startRule(context, RuleType.RuleHeader);
      this.build(context, token);
      return 23;
    }
    if (this.match_Comment(context, token)) {
      this.build(context, token);
      return 48;
    }
    if (this.match_Empty(context, token)) {
      this.build(context, token);
      return 48;
    }
    const expectedTokens = ["#EOF", "#TableRow", "#StepLine", "#TagLine", "#ScenarioLine", "#RuleLine", "#Comment", "#Empty"];
    const error = token.isEof ? UnexpectedEOFException.create(token, expectedTokens) : UnexpectedTokenException.create(token, expectedTokens);
    if (this.stopAtFirstError)
      throw error;
    this.addError(context, error);
    return 48;
  }
  // GherkinDocument:0>Feature:2>ScenarioDefinition:1>Scenario:2>Step:1>StepArg:0>__alt0:1>DocStringAndMaybeDataTable:0>DocString:0>#DocStringSeparator:0
  matchTokenAt_49(token, context) {
    if (this.match_DocStringSeparator(context, token)) {
      this.build(context, token);
      return 50;
    }
    if (this.match_Other(context, token)) {
      this.build(context, token);
      return 49;
    }
    const expectedTokens = ["#DocStringSeparator", "#Other"];
    const error = token.isEof ? UnexpectedEOFException.create(token, expectedTokens) : UnexpectedTokenException.create(token, expectedTokens);
    if (this.stopAtFirstError)
      throw error;
    this.addError(context, error);
    return 49;
  }
  // GherkinDocument:0>Feature:2>ScenarioDefinition:1>Scenario:2>Step:1>StepArg:0>__alt0:1>DocStringAndMaybeDataTable:0>DocString:2>#DocStringSeparator:0
  matchTokenAt_50(token, context) {
    if (this.match_EOF(context, token)) {
      this.endRule(context);
      this.endRule(context);
      this.endRule(context);
      this.endRule(context);
      this.endRule(context);
      this.build(context, token);
      return 42;
    }
    if (this.match_TableRow(context, token)) {
      this.endRule(context);
      this.startRule(context, RuleType.DataTable);
      this.build(context, token);
      return 51;
    }
    if (this.match_StepLine(context, token)) {
      this.endRule(context);
      this.endRule(context);
      this.startRule(context, RuleType.Step);
      this.build(context, token);
      return 14;
    }
    if (this.match_TagLine(context, token)) {
      if (this.lookahead_1(context, token)) {
        this.endRule(context);
        this.endRule(context);
        this.startRule(context, RuleType.ExamplesDefinition);
        this.startRule(context, RuleType.Tags);
        this.build(context, token);
        return 18;
      }
    }
    if (this.match_TagLine(context, token)) {
      if (this.lookahead_0(context, token)) {
        this.endRule(context);
        this.endRule(context);
        this.endRule(context);
        this.endRule(context);
        this.startRule(context, RuleType.ScenarioDefinition);
        this.startRule(context, RuleType.Tags);
        this.build(context, token);
        return 11;
      }
    }
    if (this.match_TagLine(context, token)) {
      this.endRule(context);
      this.endRule(context);
      this.endRule(context);
      this.endRule(context);
      this.startRule(context, RuleType.Rule);
      this.startRule(context, RuleType.RuleHeader);
      this.startRule(context, RuleType.Tags);
      this.build(context, token);
      return 22;
    }
    if (this.match_ExamplesLine(context, token)) {
      this.endRule(context);
      this.endRule(context);
      this.startRule(context, RuleType.ExamplesDefinition);
      this.startRule(context, RuleType.Examples);
      this.build(context, token);
      return 19;
    }
    if (this.match_ScenarioLine(context, token)) {
      this.endRule(context);
      this.endRule(context);
      this.endRule(context);
      this.endRule(context);
      this.startRule(context, RuleType.ScenarioDefinition);
      this.startRule(context, RuleType.Scenario);
      this.build(context, token);
      return 12;
    }
    if (this.match_RuleLine(context, token)) {
      this.endRule(context);
      this.endRule(context);
      this.endRule(context);
      this.endRule(context);
      this.startRule(context, RuleType.Rule);
      this.startRule(context, RuleType.RuleHeader);
      this.build(context, token);
      return 23;
    }
    if (this.match_Comment(context, token)) {
      this.build(context, token);
      return 50;
    }
    if (this.match_Empty(context, token)) {
      this.build(context, token);
      return 50;
    }
    const expectedTokens = ["#EOF", "#TableRow", "#StepLine", "#TagLine", "#ExamplesLine", "#ScenarioLine", "#RuleLine", "#Comment", "#Empty"];
    const error = token.isEof ? UnexpectedEOFException.create(token, expectedTokens) : UnexpectedTokenException.create(token, expectedTokens);
    if (this.stopAtFirstError)
      throw error;
    this.addError(context, error);
    return 50;
  }
  // GherkinDocument:0>Feature:2>ScenarioDefinition:1>Scenario:2>Step:1>StepArg:0>__alt0:1>DocStringAndMaybeDataTable:1>DataTable:0>#TableRow:0
  matchTokenAt_51(token, context) {
    if (this.match_EOF(context, token)) {
      this.endRule(context);
      this.endRule(context);
      this.endRule(context);
      this.endRule(context);
      this.endRule(context);
      this.build(context, token);
      return 42;
    }
    if (this.match_TableRow(context, token)) {
      this.build(context, token);
      return 51;
    }
    if (this.match_StepLine(context, token)) {
      this.endRule(context);
      this.endRule(context);
      this.startRule(context, RuleType.Step);
      this.build(context, token);
      return 14;
    }
    if (this.match_TagLine(context, token)) {
      if (this.lookahead_1(context, token)) {
        this.endRule(context);
        this.endRule(context);
        this.startRule(context, RuleType.ExamplesDefinition);
        this.startRule(context, RuleType.Tags);
        this.build(context, token);
        return 18;
      }
    }
    if (this.match_TagLine(context, token)) {
      if (this.lookahead_0(context, token)) {
        this.endRule(context);
        this.endRule(context);
        this.endRule(context);
        this.endRule(context);
        this.startRule(context, RuleType.ScenarioDefinition);
        this.startRule(context, RuleType.Tags);
        this.build(context, token);
        return 11;
      }
    }
    if (this.match_TagLine(context, token)) {
      this.endRule(context);
      this.endRule(context);
      this.endRule(context);
      this.endRule(context);
      this.startRule(context, RuleType.Rule);
      this.startRule(context, RuleType.RuleHeader);
      this.startRule(context, RuleType.Tags);
      this.build(context, token);
      return 22;
    }
    if (this.match_ExamplesLine(context, token)) {
      this.endRule(context);
      this.endRule(context);
      this.startRule(context, RuleType.ExamplesDefinition);
      this.startRule(context, RuleType.Examples);
      this.build(context, token);
      return 19;
    }
    if (this.match_ScenarioLine(context, token)) {
      this.endRule(context);
      this.endRule(context);
      this.endRule(context);
      this.endRule(context);
      this.startRule(context, RuleType.ScenarioDefinition);
      this.startRule(context, RuleType.Scenario);
      this.build(context, token);
      return 12;
    }
    if (this.match_RuleLine(context, token)) {
      this.endRule(context);
      this.endRule(context);
      this.endRule(context);
      this.endRule(context);
      this.startRule(context, RuleType.Rule);
      this.startRule(context, RuleType.RuleHeader);
      this.build(context, token);
      return 23;
    }
    if (this.match_Comment(context, token)) {
      this.build(context, token);
      return 51;
    }
    if (this.match_Empty(context, token)) {
      this.build(context, token);
      return 51;
    }
    const expectedTokens = ["#EOF", "#TableRow", "#StepLine", "#TagLine", "#ExamplesLine", "#ScenarioLine", "#RuleLine", "#Comment", "#Empty"];
    const error = token.isEof ? UnexpectedEOFException.create(token, expectedTokens) : UnexpectedTokenException.create(token, expectedTokens);
    if (this.stopAtFirstError)
      throw error;
    this.addError(context, error);
    return 51;
  }
  // GherkinDocument:0>Feature:1>Background:2>Step:1>StepArg:0>__alt0:1>DocStringAndMaybeDataTable:0>DocString:0>#DocStringSeparator:0
  matchTokenAt_52(token, context) {
    if (this.match_DocStringSeparator(context, token)) {
      this.build(context, token);
      return 53;
    }
    if (this.match_Other(context, token)) {
      this.build(context, token);
      return 52;
    }
    const expectedTokens = ["#DocStringSeparator", "#Other"];
    const error = token.isEof ? UnexpectedEOFException.create(token, expectedTokens) : UnexpectedTokenException.create(token, expectedTokens);
    if (this.stopAtFirstError)
      throw error;
    this.addError(context, error);
    return 52;
  }
  // GherkinDocument:0>Feature:1>Background:2>Step:1>StepArg:0>__alt0:1>DocStringAndMaybeDataTable:0>DocString:2>#DocStringSeparator:0
  matchTokenAt_53(token, context) {
    if (this.match_EOF(context, token)) {
      this.endRule(context);
      this.endRule(context);
      this.endRule(context);
      this.endRule(context);
      this.build(context, token);
      return 42;
    }
    if (this.match_TableRow(context, token)) {
      this.endRule(context);
      this.startRule(context, RuleType.DataTable);
      this.build(context, token);
      return 54;
    }
    if (this.match_StepLine(context, token)) {
      this.endRule(context);
      this.endRule(context);
      this.startRule(context, RuleType.Step);
      this.build(context, token);
      return 7;
    }
    if (this.match_TagLine(context, token)) {
      if (this.lookahead_0(context, token)) {
        this.endRule(context);
        this.endRule(context);
        this.endRule(context);
        this.startRule(context, RuleType.ScenarioDefinition);
        this.startRule(context, RuleType.Tags);
        this.build(context, token);
        return 11;
      }
    }
    if (this.match_TagLine(context, token)) {
      this.endRule(context);
      this.endRule(context);
      this.endRule(context);
      this.startRule(context, RuleType.Rule);
      this.startRule(context, RuleType.RuleHeader);
      this.startRule(context, RuleType.Tags);
      this.build(context, token);
      return 22;
    }
    if (this.match_ScenarioLine(context, token)) {
      this.endRule(context);
      this.endRule(context);
      this.endRule(context);
      this.startRule(context, RuleType.ScenarioDefinition);
      this.startRule(context, RuleType.Scenario);
      this.build(context, token);
      return 12;
    }
    if (this.match_RuleLine(context, token)) {
      this.endRule(context);
      this.endRule(context);
      this.endRule(context);
      this.startRule(context, RuleType.Rule);
      this.startRule(context, RuleType.RuleHeader);
      this.build(context, token);
      return 23;
    }
    if (this.match_Comment(context, token)) {
      this.build(context, token);
      return 53;
    }
    if (this.match_Empty(context, token)) {
      this.build(context, token);
      return 53;
    }
    const expectedTokens = ["#EOF", "#TableRow", "#StepLine", "#TagLine", "#ScenarioLine", "#RuleLine", "#Comment", "#Empty"];
    const error = token.isEof ? UnexpectedEOFException.create(token, expectedTokens) : UnexpectedTokenException.create(token, expectedTokens);
    if (this.stopAtFirstError)
      throw error;
    this.addError(context, error);
    return 53;
  }
  // GherkinDocument:0>Feature:1>Background:2>Step:1>StepArg:0>__alt0:1>DocStringAndMaybeDataTable:1>DataTable:0>#TableRow:0
  matchTokenAt_54(token, context) {
    if (this.match_EOF(context, token)) {
      this.endRule(context);
      this.endRule(context);
      this.endRule(context);
      this.endRule(context);
      this.build(context, token);
      return 42;
    }
    if (this.match_TableRow(context, token)) {
      this.build(context, token);
      return 54;
    }
    if (this.match_StepLine(context, token)) {
      this.endRule(context);
      this.endRule(context);
      this.startRule(context, RuleType.Step);
      this.build(context, token);
      return 7;
    }
    if (this.match_TagLine(context, token)) {
      if (this.lookahead_0(context, token)) {
        this.endRule(context);
        this.endRule(context);
        this.endRule(context);
        this.startRule(context, RuleType.ScenarioDefinition);
        this.startRule(context, RuleType.Tags);
        this.build(context, token);
        return 11;
      }
    }
    if (this.match_TagLine(context, token)) {
      this.endRule(context);
      this.endRule(context);
      this.endRule(context);
      this.startRule(context, RuleType.Rule);
      this.startRule(context, RuleType.RuleHeader);
      this.startRule(context, RuleType.Tags);
      this.build(context, token);
      return 22;
    }
    if (this.match_ScenarioLine(context, token)) {
      this.endRule(context);
      this.endRule(context);
      this.endRule(context);
      this.startRule(context, RuleType.ScenarioDefinition);
      this.startRule(context, RuleType.Scenario);
      this.build(context, token);
      return 12;
    }
    if (this.match_RuleLine(context, token)) {
      this.endRule(context);
      this.endRule(context);
      this.endRule(context);
      this.startRule(context, RuleType.Rule);
      this.startRule(context, RuleType.RuleHeader);
      this.build(context, token);
      return 23;
    }
    if (this.match_Comment(context, token)) {
      this.build(context, token);
      return 54;
    }
    if (this.match_Empty(context, token)) {
      this.build(context, token);
      return 54;
    }
    const expectedTokens = ["#EOF", "#TableRow", "#StepLine", "#TagLine", "#ScenarioLine", "#RuleLine", "#Comment", "#Empty"];
    const error = token.isEof ? UnexpectedEOFException.create(token, expectedTokens) : UnexpectedTokenException.create(token, expectedTokens);
    if (this.stopAtFirstError)
      throw error;
    this.addError(context, error);
    return 54;
  }
  match_EOF(context, token) {
    return this.handleExternalError(context, false, () => this.tokenMatcher.match_EOF(token));
  }
  match_Empty(context, token) {
    if (token.isEof)
      return false;
    return this.handleExternalError(context, false, () => this.tokenMatcher.match_Empty(token));
  }
  match_Comment(context, token) {
    if (token.isEof)
      return false;
    return this.handleExternalError(context, false, () => this.tokenMatcher.match_Comment(token));
  }
  match_TagLine(context, token) {
    if (token.isEof)
      return false;
    return this.handleExternalError(context, false, () => this.tokenMatcher.match_TagLine(token));
  }
  match_FeatureLine(context, token) {
    if (token.isEof)
      return false;
    return this.handleExternalError(context, false, () => this.tokenMatcher.match_FeatureLine(token));
  }
  match_RuleLine(context, token) {
    if (token.isEof)
      return false;
    return this.handleExternalError(context, false, () => this.tokenMatcher.match_RuleLine(token));
  }
  match_BackgroundLine(context, token) {
    if (token.isEof)
      return false;
    return this.handleExternalError(context, false, () => this.tokenMatcher.match_BackgroundLine(token));
  }
  match_ScenarioLine(context, token) {
    if (token.isEof)
      return false;
    return this.handleExternalError(context, false, () => this.tokenMatcher.match_ScenarioLine(token));
  }
  match_ExamplesLine(context, token) {
    if (token.isEof)
      return false;
    return this.handleExternalError(context, false, () => this.tokenMatcher.match_ExamplesLine(token));
  }
  match_StepLine(context, token) {
    if (token.isEof)
      return false;
    return this.handleExternalError(context, false, () => this.tokenMatcher.match_StepLine(token));
  }
  match_DocStringSeparator(context, token) {
    if (token.isEof)
      return false;
    return this.handleExternalError(context, false, () => this.tokenMatcher.match_DocStringSeparator(token));
  }
  match_TableRow(context, token) {
    if (token.isEof)
      return false;
    return this.handleExternalError(context, false, () => this.tokenMatcher.match_TableRow(token));
  }
  match_Language(context, token) {
    if (token.isEof)
      return false;
    return this.handleExternalError(context, false, () => this.tokenMatcher.match_Language(token));
  }
  match_Other(context, token) {
    if (token.isEof)
      return false;
    return this.handleExternalError(context, false, () => this.tokenMatcher.match_Other(token));
  }
  lookahead_0(context, currentToken) {
    let token;
    const queue = [];
    let match = false;
    do {
      token = this.readToken(this.context);
      queue.push(token);
      if (this.match_ScenarioLine(context, token)) {
        match = true;
        break;
      }
    } while (this.match_Empty(context, token) || this.match_Comment(context, token) || this.match_TagLine(context, token));
    context.tokenQueue = context.tokenQueue.concat(queue);
    return match;
  }
  lookahead_1(context, currentToken) {
    let token;
    const queue = [];
    let match = false;
    do {
      token = this.readToken(this.context);
      queue.push(token);
      if (this.match_ExamplesLine(context, token)) {
        match = true;
        break;
      }
    } while (this.match_Empty(context, token) || this.match_Comment(context, token) || this.match_TagLine(context, token));
    context.tokenQueue = context.tokenQueue.concat(queue);
    return match;
  }
};

// node_modules/@cucumber/gherkin/dist/AstBuilder.js
var AstBuilder = class {
  stack;
  comments;
  newId;
  constructor(newId) {
    this.newId = newId;
    if (!newId) {
      throw new Error("No newId");
    }
    this.reset();
  }
  reset() {
    this.stack = [new AstNode(RuleType.None)];
    this.comments = [];
  }
  startRule(ruleType) {
    this.stack.push(new AstNode(ruleType));
  }
  endRule() {
    const node = this.stack.pop();
    const transformedNode = this.transformNode(node);
    this.currentNode().add(node.ruleType, transformedNode);
  }
  build(token) {
    if (token.matchedType === TokenType.Comment) {
      this.comments.push({
        location: this.getLocation(token),
        text: token.matchedText
      });
    } else {
      this.currentNode().add(token.matchedType, token);
    }
  }
  getResult() {
    return this.currentNode().getSingle(RuleType.GherkinDocument);
  }
  currentNode() {
    return this.stack[this.stack.length - 1];
  }
  getLocation(token, column) {
    return !column ? token.location : { line: token.location.line, column };
  }
  getTags(node) {
    const tags = [];
    const tagsNode = node.getSingle(RuleType.Tags);
    if (!tagsNode) {
      return tags;
    }
    const tokens = tagsNode.getTokens(TokenType.TagLine);
    for (const token of tokens) {
      for (const tagItem of token.matchedItems) {
        tags.push({
          location: this.getLocation(token, tagItem.column),
          name: tagItem.text,
          id: this.newId()
        });
      }
    }
    return tags;
  }
  getCells(tableRowToken) {
    return tableRowToken.matchedItems.map((cellItem) => ({
      location: this.getLocation(tableRowToken, cellItem.column),
      value: cellItem.text
    }));
  }
  getDescription(node) {
    return node.getSingle(RuleType.Description) || "";
  }
  getSteps(node) {
    return node.getItems(RuleType.Step);
  }
  getTableRows(node) {
    const rows = node.getTokens(TokenType.TableRow).map((token) => ({
      id: this.newId(),
      location: this.getLocation(token),
      cells: this.getCells(token)
    }));
    this.ensureCellCount(rows);
    return rows.length === 0 ? [] : rows;
  }
  ensureCellCount(rows) {
    if (rows.length === 0) {
      return;
    }
    const cellCount = rows[0].cells.length;
    rows.forEach((row) => {
      if (row.cells.length !== cellCount) {
        throw AstBuilderException.create("inconsistent cell count within the table", row.location);
      }
    });
  }
  transformNode(node) {
    switch (node.ruleType) {
      case RuleType.Step: {
        const stepLine = node.getToken(TokenType.StepLine);
        const dataTable = node.getSingle(RuleType.DataTable);
        const docString = node.getSingle(RuleType.DocString);
        const location = this.getLocation(stepLine);
        const step = {
          id: this.newId(),
          location,
          keyword: stepLine.matchedKeyword,
          keywordType: stepLine.matchedKeywordType,
          text: stepLine.matchedText,
          dataTable,
          docString
        };
        return step;
      }
      case RuleType.DocString: {
        const separatorToken = node.getTokens(TokenType.DocStringSeparator)[0];
        const mediaType = separatorToken.matchedText.length > 0 ? separatorToken.matchedText : void 0;
        const lineTokens = node.getTokens(TokenType.Other);
        const content = lineTokens.map((t) => t.matchedText).join("\n");
        const result = {
          location: this.getLocation(separatorToken),
          content,
          delimiter: separatorToken.matchedKeyword
        };
        if (mediaType) {
          result.mediaType = mediaType;
        }
        return result;
      }
      case RuleType.DataTable: {
        const rows = this.getTableRows(node);
        const dataTable = {
          location: rows[0].location,
          rows
        };
        return dataTable;
      }
      case RuleType.Background: {
        const backgroundLine = node.getToken(TokenType.BackgroundLine);
        const description = this.getDescription(node);
        const steps = this.getSteps(node);
        const background = {
          id: this.newId(),
          location: this.getLocation(backgroundLine),
          keyword: backgroundLine.matchedKeyword,
          name: backgroundLine.matchedText,
          description,
          steps
        };
        return background;
      }
      case RuleType.ScenarioDefinition: {
        const tags = this.getTags(node);
        const scenarioNode = node.getSingle(RuleType.Scenario);
        const scenarioLine = scenarioNode.getToken(TokenType.ScenarioLine);
        const description = this.getDescription(scenarioNode);
        const steps = this.getSteps(scenarioNode);
        const examples = scenarioNode.getItems(RuleType.ExamplesDefinition);
        const scenario = {
          id: this.newId(),
          tags,
          location: this.getLocation(scenarioLine),
          keyword: scenarioLine.matchedKeyword,
          name: scenarioLine.matchedText,
          description,
          steps,
          examples
        };
        return scenario;
      }
      case RuleType.ExamplesDefinition: {
        const tags = this.getTags(node);
        const examplesNode = node.getSingle(RuleType.Examples);
        const examplesLine = examplesNode.getToken(TokenType.ExamplesLine);
        const description = this.getDescription(examplesNode);
        const examplesTable = examplesNode.getSingle(RuleType.ExamplesTable);
        const examples = {
          id: this.newId(),
          tags,
          location: this.getLocation(examplesLine),
          keyword: examplesLine.matchedKeyword,
          name: examplesLine.matchedText,
          description,
          tableHeader: examplesTable ? examplesTable[0] : void 0,
          tableBody: examplesTable ? examplesTable.slice(1) : []
        };
        return examples;
      }
      case RuleType.ExamplesTable: {
        return this.getTableRows(node);
      }
      case RuleType.Description: {
        let lineTokens = node.getTokens(TokenType.Other);
        let end = lineTokens.length;
        while (end > 0 && lineTokens[end - 1].line.trimmedLineText === "") {
          end--;
        }
        lineTokens = lineTokens.slice(0, end);
        return lineTokens.map((token) => token.matchedText).join("\n");
      }
      case RuleType.Feature: {
        const header = node.getSingle(RuleType.FeatureHeader);
        if (!header) {
          return null;
        }
        const tags = this.getTags(header);
        const featureLine = header.getToken(TokenType.FeatureLine);
        if (!featureLine) {
          return null;
        }
        const children = [];
        const background = node.getSingle(RuleType.Background);
        if (background) {
          children.push({
            background
          });
        }
        for (const scenario of node.getItems(RuleType.ScenarioDefinition)) {
          children.push({
            scenario
          });
        }
        for (const rule of node.getItems(RuleType.Rule)) {
          children.push({
            rule
          });
        }
        const description = this.getDescription(header);
        const language = featureLine.matchedGherkinDialect;
        const feature = {
          tags,
          location: this.getLocation(featureLine),
          language,
          keyword: featureLine.matchedKeyword,
          name: featureLine.matchedText,
          description,
          children
        };
        return feature;
      }
      case RuleType.Rule: {
        const header = node.getSingle(RuleType.RuleHeader);
        if (!header) {
          return null;
        }
        const ruleLine = header.getToken(TokenType.RuleLine);
        if (!ruleLine) {
          return null;
        }
        const tags = this.getTags(header);
        const children = [];
        const background = node.getSingle(RuleType.Background);
        if (background) {
          children.push({
            background
          });
        }
        for (const scenario of node.getItems(RuleType.ScenarioDefinition)) {
          children.push({
            scenario
          });
        }
        const description = this.getDescription(header);
        const rule = {
          id: this.newId(),
          location: this.getLocation(ruleLine),
          keyword: ruleLine.matchedKeyword,
          name: ruleLine.matchedText,
          description,
          children,
          tags
        };
        return rule;
      }
      case RuleType.GherkinDocument: {
        const feature = node.getSingle(RuleType.Feature);
        const gherkinDocument = {
          feature,
          comments: this.comments
        };
        return gherkinDocument;
      }
      default:
        return node;
    }
  }
};

// node_modules/@cucumber/gherkin/node_modules/@cucumber/messages/dist/messages.js
var AttachmentContentEncoding;
(function(AttachmentContentEncoding3) {
  AttachmentContentEncoding3["IDENTITY"] = "IDENTITY";
  AttachmentContentEncoding3["BASE64"] = "BASE64";
})(AttachmentContentEncoding || (AttachmentContentEncoding = {}));
var HookType;
(function(HookType3) {
  HookType3["BEFORE_TEST_RUN"] = "BEFORE_TEST_RUN";
  HookType3["AFTER_TEST_RUN"] = "AFTER_TEST_RUN";
  HookType3["BEFORE_TEST_CASE"] = "BEFORE_TEST_CASE";
  HookType3["AFTER_TEST_CASE"] = "AFTER_TEST_CASE";
  HookType3["BEFORE_TEST_STEP"] = "BEFORE_TEST_STEP";
  HookType3["AFTER_TEST_STEP"] = "AFTER_TEST_STEP";
})(HookType || (HookType = {}));
var PickleStepType;
(function(PickleStepType3) {
  PickleStepType3["UNKNOWN"] = "Unknown";
  PickleStepType3["CONTEXT"] = "Context";
  PickleStepType3["ACTION"] = "Action";
  PickleStepType3["OUTCOME"] = "Outcome";
})(PickleStepType || (PickleStepType = {}));
var SourceMediaType;
(function(SourceMediaType3) {
  SourceMediaType3["TEXT_X_CUCUMBER_GHERKIN_PLAIN"] = "text/x.cucumber.gherkin+plain";
  SourceMediaType3["TEXT_X_CUCUMBER_GHERKIN_MARKDOWN"] = "text/x.cucumber.gherkin+markdown";
})(SourceMediaType || (SourceMediaType = {}));
var StepDefinitionPatternType;
(function(StepDefinitionPatternType3) {
  StepDefinitionPatternType3["CUCUMBER_EXPRESSION"] = "CUCUMBER_EXPRESSION";
  StepDefinitionPatternType3["REGULAR_EXPRESSION"] = "REGULAR_EXPRESSION";
})(StepDefinitionPatternType || (StepDefinitionPatternType = {}));
var StepKeywordType;
(function(StepKeywordType3) {
  StepKeywordType3["UNKNOWN"] = "Unknown";
  StepKeywordType3["CONTEXT"] = "Context";
  StepKeywordType3["ACTION"] = "Action";
  StepKeywordType3["OUTCOME"] = "Outcome";
  StepKeywordType3["CONJUNCTION"] = "Conjunction";
})(StepKeywordType || (StepKeywordType = {}));
var TestStepResultStatus;
(function(TestStepResultStatus3) {
  TestStepResultStatus3["UNKNOWN"] = "UNKNOWN";
  TestStepResultStatus3["PASSED"] = "PASSED";
  TestStepResultStatus3["SKIPPED"] = "SKIPPED";
  TestStepResultStatus3["PENDING"] = "PENDING";
  TestStepResultStatus3["UNDEFINED"] = "UNDEFINED";
  TestStepResultStatus3["AMBIGUOUS"] = "AMBIGUOUS";
  TestStepResultStatus3["FAILED"] = "FAILED";
})(TestStepResultStatus || (TestStepResultStatus = {}));

// node_modules/@cucumber/gherkin/dist/compareStepKeywords.js
function compareStepKeywords(a, b) {
  return b.length - a.length;
}

// node_modules/@cucumber/gherkin/dist/gherkin-languages.json
var gherkin_languages_default = {
  af: {
    and: [
      "* ",
      "En "
    ],
    background: [
      "Agtergrond"
    ],
    but: [
      "* ",
      "Maar "
    ],
    examples: [
      "Voorbeelde"
    ],
    feature: [
      "Funksie",
      "Besigheid Behoefte",
      "Vermo\xEB"
    ],
    given: [
      "* ",
      "Gegewe "
    ],
    name: "Afrikaans",
    native: "Afrikaans",
    rule: [
      "Re\xEBl",
      "Reel"
    ],
    scenario: [
      "Voorbeeld",
      "Situasie"
    ],
    scenarioOutline: [
      "Situasie Uiteensetting"
    ],
    then: [
      "* ",
      "Dan "
    ],
    when: [
      "* ",
      "Wanneer "
    ]
  },
  am: {
    and: [
      "* ",
      "\u0535\u057E "
    ],
    background: [
      "\u053F\u0578\u0576\u057F\u0565\u0584\u057D\u057F"
    ],
    but: [
      "* ",
      "\u0532\u0561\u0575\u0581 "
    ],
    examples: [
      "\u0555\u0580\u056B\u0576\u0561\u056F\u0576\u0565\u0580"
    ],
    feature: [
      "\u0556\u0578\u0582\u0576\u056F\u0581\u056B\u0578\u0576\u0561\u056C\u0578\u0582\u0569\u0575\u0578\u0582\u0576",
      "\u0540\u0561\u057F\u056F\u0578\u0582\u0569\u0575\u0578\u0582\u0576"
    ],
    given: [
      "* ",
      "\u0534\u056B\u0581\u0578\u0582\u0584 "
    ],
    name: "Armenian",
    native: "\u0570\u0561\u0575\u0565\u0580\u0565\u0576",
    rule: [
      "Rule"
    ],
    scenario: [
      "\u0555\u0580\u056B\u0576\u0561\u056F",
      "\u054D\u0581\u0565\u0576\u0561\u0580"
    ],
    scenarioOutline: [
      "\u054D\u0581\u0565\u0576\u0561\u0580\u056B \u056F\u0561\u057C\u0578\u0582\u0581\u057E\u0561\u0581\u0584\u0568"
    ],
    then: [
      "* ",
      "\u0531\u057A\u0561 "
    ],
    when: [
      "* ",
      "\u0535\u0569\u0565 ",
      "\u0535\u0580\u0562 "
    ]
  },
  an: {
    and: [
      "* ",
      "Y ",
      "E "
    ],
    background: [
      "Antecedents"
    ],
    but: [
      "* ",
      "Pero "
    ],
    examples: [
      "Eixemplos"
    ],
    feature: [
      "Caracteristica"
    ],
    given: [
      "* ",
      "Dau ",
      "Dada ",
      "Daus ",
      "Dadas "
    ],
    name: "Aragonese",
    native: "Aragon\xE9s",
    rule: [
      "Rule"
    ],
    scenario: [
      "Eixemplo",
      "Caso"
    ],
    scenarioOutline: [
      "Esquema del caso"
    ],
    then: [
      "* ",
      "Alavez ",
      "Allora ",
      "Antonces "
    ],
    when: [
      "* ",
      "Cuan "
    ]
  },
  ar: {
    and: [
      "* ",
      "\u0648 "
    ],
    background: [
      "\u0627\u0644\u062E\u0644\u0641\u064A\u0629"
    ],
    but: [
      "* ",
      "\u0644\u0643\u0646 "
    ],
    examples: [
      "\u0627\u0645\u062B\u0644\u0629"
    ],
    feature: [
      "\u062E\u0627\u0635\u064A\u0629"
    ],
    given: [
      "* ",
      "\u0628\u0641\u0631\u0636 "
    ],
    name: "Arabic",
    native: "\u0627\u0644\u0639\u0631\u0628\u064A\u0629",
    rule: [
      "Rule"
    ],
    scenario: [
      "\u0645\u062B\u0627\u0644",
      "\u0633\u064A\u0646\u0627\u0631\u064A\u0648"
    ],
    scenarioOutline: [
      "\u0633\u064A\u0646\u0627\u0631\u064A\u0648 \u0645\u062E\u0637\u0637"
    ],
    then: [
      "* ",
      "\u0627\u0630\u0627\u064B ",
      "\u062B\u0645 "
    ],
    when: [
      "* ",
      "\u0645\u062A\u0649 ",
      "\u0639\u0646\u062F\u0645\u0627 "
    ]
  },
  ast: {
    and: [
      "* ",
      "Y ",
      "Ya "
    ],
    background: [
      "Antecedentes"
    ],
    but: [
      "* ",
      "Peru "
    ],
    examples: [
      "Exemplos"
    ],
    feature: [
      "Carauter\xEDstica"
    ],
    given: [
      "* ",
      "D\xE1u ",
      "Dada ",
      "Daos ",
      "Daes "
    ],
    name: "Asturian",
    native: "asturianu",
    rule: [
      "Rule"
    ],
    scenario: [
      "Exemplo",
      "Casu"
    ],
    scenarioOutline: [
      "Esbozu del casu"
    ],
    then: [
      "* ",
      "Ent\xF3s "
    ],
    when: [
      "* ",
      "Cuando "
    ]
  },
  az: {
    and: [
      "* ",
      "V\u0259 ",
      "H\u0259m "
    ],
    background: [
      "Ke\xE7mi\u015F",
      "Kontekst"
    ],
    but: [
      "* ",
      "Amma ",
      "Ancaq "
    ],
    examples: [
      "N\xFCmun\u0259l\u0259r"
    ],
    feature: [
      "\xD6z\u0259llik"
    ],
    given: [
      "* ",
      "Tutaq ki ",
      "Verilir "
    ],
    name: "Azerbaijani",
    native: "Az\u0259rbaycanca",
    rule: [
      "Rule"
    ],
    scenario: [
      "N\xFCmun\u0259",
      "Ssenari"
    ],
    scenarioOutline: [
      "Ssenarinin strukturu"
    ],
    then: [
      "* ",
      "O halda "
    ],
    when: [
      "* ",
      "\u018Fg\u0259r ",
      "N\u0259 vaxt ki "
    ]
  },
  be: {
    and: [
      "* ",
      "I ",
      "\u0414\u044B ",
      "\u0422\u0430\u043A\u0441\u0430\u043C\u0430 "
    ],
    background: [
      "\u041A\u0430\u043D\u0442\u044D\u043A\u0441\u0442"
    ],
    but: [
      "* ",
      "\u0410\u043B\u0435 ",
      "\u0406\u043D\u0430\u043A\u0448 "
    ],
    examples: [
      "\u041F\u0440\u044B\u043A\u043B\u0430\u0434\u044B"
    ],
    feature: [
      "\u0424\u0443\u043D\u043A\u0446\u044B\u044F\u043D\u0430\u043B\u044C\u043D\u0430\u0441\u0446\u044C",
      "\u0424\u0456\u0447\u0430"
    ],
    given: [
      "* ",
      "\u041D\u044F\u0445\u0430\u0439 ",
      "\u0414\u0430\u0434\u0437\u0435\u043D\u0430 "
    ],
    name: "Belarusian",
    native: "\u0411\u0435\u043B\u0430\u0440\u0443\u0441\u043A\u0430\u044F",
    rule: [
      "\u041F\u0440\u0430\u0432\u0456\u043B\u044B"
    ],
    scenario: [
      "\u0421\u0446\u044D\u043D\u0430\u0440\u044B\u0439",
      "C\u0446\u044D\u043D\u0430\u0440"
    ],
    scenarioOutline: [
      "\u0428\u0430\u0431\u043B\u043E\u043D \u0441\u0446\u044D\u043D\u0430\u0440\u044B\u044F",
      "\u0423\u0437\u043E\u0440 \u0441\u0446\u044D\u043D\u0430\u0440\u0430"
    ],
    then: [
      "* ",
      "\u0422\u0430\u0434\u044B "
    ],
    when: [
      "* ",
      "\u041A\u0430\u043B\u0456 "
    ]
  },
  bg: {
    and: [
      "* ",
      "\u0418 "
    ],
    background: [
      "\u041F\u0440\u0435\u0434\u0438\u0441\u0442\u043E\u0440\u0438\u044F"
    ],
    but: [
      "* ",
      "\u041D\u043E "
    ],
    examples: [
      "\u041F\u0440\u0438\u043C\u0435\u0440\u0438"
    ],
    feature: [
      "\u0424\u0443\u043D\u043A\u0446\u0438\u043E\u043D\u0430\u043B\u043D\u043E\u0441\u0442"
    ],
    given: [
      "* ",
      "\u0414\u0430\u0434\u0435\u043D\u043E "
    ],
    name: "Bulgarian",
    native: "\u0431\u044A\u043B\u0433\u0430\u0440\u0441\u043A\u0438",
    rule: [
      "\u041F\u0440\u0430\u0432\u0438\u043B\u043E"
    ],
    scenario: [
      "\u041F\u0440\u0438\u043C\u0435\u0440",
      "\u0421\u0446\u0435\u043D\u0430\u0440\u0438\u0439"
    ],
    scenarioOutline: [
      "\u0420\u0430\u043C\u043A\u0430 \u043D\u0430 \u0441\u0446\u0435\u043D\u0430\u0440\u0438\u0439"
    ],
    then: [
      "* ",
      "\u0422\u043E "
    ],
    when: [
      "* ",
      "\u041A\u043E\u0433\u0430\u0442\u043E "
    ]
  },
  bm: {
    and: [
      "* ",
      "Dan "
    ],
    background: [
      "Latar Belakang"
    ],
    but: [
      "* ",
      "Tetapi ",
      "Tapi "
    ],
    examples: [
      "Contoh"
    ],
    feature: [
      "Fungsi"
    ],
    given: [
      "* ",
      "Diberi ",
      "Bagi "
    ],
    name: "Malay",
    native: "Bahasa Melayu",
    rule: [
      "Rule"
    ],
    scenario: [
      "Senario",
      "Situasi",
      "Keadaan"
    ],
    scenarioOutline: [
      "Kerangka Senario",
      "Kerangka Situasi",
      "Kerangka Keadaan",
      "Garis Panduan Senario"
    ],
    then: [
      "* ",
      "Maka ",
      "Kemudian "
    ],
    when: [
      "* ",
      "Apabila "
    ]
  },
  bs: {
    and: [
      "* ",
      "I ",
      "A "
    ],
    background: [
      "Pozadina"
    ],
    but: [
      "* ",
      "Ali "
    ],
    examples: [
      "Primjeri"
    ],
    feature: [
      "Karakteristika"
    ],
    given: [
      "* ",
      "Dato "
    ],
    name: "Bosnian",
    native: "Bosanski",
    rule: [
      "Rule"
    ],
    scenario: [
      "Primjer",
      "Scenariju",
      "Scenario"
    ],
    scenarioOutline: [
      "Scenariju-obris",
      "Scenario-outline"
    ],
    then: [
      "* ",
      "Zatim "
    ],
    when: [
      "* ",
      "Kada "
    ]
  },
  ca: {
    and: [
      "* ",
      "I "
    ],
    background: [
      "Rerefons",
      "Antecedents"
    ],
    but: [
      "* ",
      "Per\xF2 "
    ],
    examples: [
      "Exemples"
    ],
    feature: [
      "Caracter\xEDstica",
      "Funcionalitat"
    ],
    given: [
      "* ",
      "Donat ",
      "Donada ",
      "At\xE8s ",
      "Atesa "
    ],
    name: "Catalan",
    native: "catal\xE0",
    rule: [
      "Rule"
    ],
    scenario: [
      "Exemple",
      "Escenari"
    ],
    scenarioOutline: [
      "Esquema de l'escenari"
    ],
    then: [
      "* ",
      "Aleshores ",
      "Cal "
    ],
    when: [
      "* ",
      "Quan "
    ]
  },
  cs: {
    and: [
      "* ",
      "A tak\xE9 ",
      "A "
    ],
    background: [
      "Pozad\xED",
      "Kontext"
    ],
    but: [
      "* ",
      "Ale "
    ],
    examples: [
      "P\u0159\xEDklady"
    ],
    feature: [
      "Po\u017Eadavek"
    ],
    given: [
      "* ",
      "Pokud ",
      "Za p\u0159edpokladu "
    ],
    name: "Czech",
    native: "\u010Cesky",
    rule: [
      "Pravidlo"
    ],
    scenario: [
      "P\u0159\xEDklad",
      "Sc\xE9n\xE1\u0159"
    ],
    scenarioOutline: [
      "N\xE1\u010Drt Sc\xE9n\xE1\u0159e",
      "Osnova sc\xE9n\xE1\u0159e"
    ],
    then: [
      "* ",
      "Pak "
    ],
    when: [
      "* ",
      "Kdy\u017E "
    ]
  },
  "cy-GB": {
    and: [
      "* ",
      "A "
    ],
    background: [
      "Cefndir"
    ],
    but: [
      "* ",
      "Ond "
    ],
    examples: [
      "Enghreifftiau"
    ],
    feature: [
      "Arwedd"
    ],
    given: [
      "* ",
      "Anrhegedig a "
    ],
    name: "Welsh",
    native: "Cymraeg",
    rule: [
      "Rule"
    ],
    scenario: [
      "Enghraifft",
      "Scenario"
    ],
    scenarioOutline: [
      "Scenario Amlinellol"
    ],
    then: [
      "* ",
      "Yna "
    ],
    when: [
      "* ",
      "Pryd "
    ]
  },
  da: {
    and: [
      "* ",
      "Og "
    ],
    background: [
      "Baggrund"
    ],
    but: [
      "* ",
      "Men "
    ],
    examples: [
      "Eksempler"
    ],
    feature: [
      "Egenskab"
    ],
    given: [
      "* ",
      "Givet "
    ],
    name: "Danish",
    native: "dansk",
    rule: [
      "Regel"
    ],
    scenario: [
      "Eksempel",
      "Scenarie"
    ],
    scenarioOutline: [
      "Abstrakt Scenario"
    ],
    then: [
      "* ",
      "S\xE5 "
    ],
    when: [
      "* ",
      "N\xE5r "
    ]
  },
  de: {
    and: [
      "* ",
      "Und "
    ],
    background: [
      "Grundlage",
      "Hintergrund",
      "Voraussetzungen",
      "Vorbedingungen"
    ],
    but: [
      "* ",
      "Aber "
    ],
    examples: [
      "Beispiele"
    ],
    feature: [
      "Funktionalit\xE4t",
      "Funktion"
    ],
    given: [
      "* ",
      "Angenommen ",
      "Gegeben sei ",
      "Gegeben seien "
    ],
    name: "German",
    native: "Deutsch",
    rule: [
      "Rule",
      "Regel"
    ],
    scenario: [
      "Beispiel",
      "Szenario"
    ],
    scenarioOutline: [
      "Szenariogrundriss",
      "Szenarien"
    ],
    then: [
      "* ",
      "Dann "
    ],
    when: [
      "* ",
      "Wenn "
    ]
  },
  el: {
    and: [
      "* ",
      "\u039A\u03B1\u03B9 "
    ],
    background: [
      "\u03A5\u03C0\u03CC\u03B2\u03B1\u03B8\u03C1\u03BF"
    ],
    but: [
      "* ",
      "\u0391\u03BB\u03BB\u03AC "
    ],
    examples: [
      "\u03A0\u03B1\u03C1\u03B1\u03B4\u03B5\u03AF\u03B3\u03BC\u03B1\u03C4\u03B1",
      "\u03A3\u03B5\u03BD\u03AC\u03C1\u03B9\u03B1"
    ],
    feature: [
      "\u0394\u03C5\u03BD\u03B1\u03C4\u03CC\u03C4\u03B7\u03C4\u03B1",
      "\u039B\u03B5\u03B9\u03C4\u03BF\u03C5\u03C1\u03B3\u03AF\u03B1"
    ],
    given: [
      "* ",
      "\u0394\u03B5\u03B4\u03BF\u03BC\u03AD\u03BD\u03BF\u03C5 "
    ],
    name: "Greek",
    native: "\u0395\u03BB\u03BB\u03B7\u03BD\u03B9\u03BA\u03AC",
    rule: [
      "Rule"
    ],
    scenario: [
      "\u03A0\u03B1\u03C1\u03AC\u03B4\u03B5\u03B9\u03B3\u03BC\u03B1",
      "\u03A3\u03B5\u03BD\u03AC\u03C1\u03B9\u03BF"
    ],
    scenarioOutline: [
      "\u03A0\u03B5\u03C1\u03B9\u03B3\u03C1\u03B1\u03C6\u03AE \u03A3\u03B5\u03BD\u03B1\u03C1\u03AF\u03BF\u03C5",
      "\u03A0\u03B5\u03C1\u03AF\u03B3\u03C1\u03B1\u03BC\u03BC\u03B1 \u03A3\u03B5\u03BD\u03B1\u03C1\u03AF\u03BF\u03C5"
    ],
    then: [
      "* ",
      "\u03A4\u03CC\u03C4\u03B5 "
    ],
    when: [
      "* ",
      "\u038C\u03C4\u03B1\u03BD "
    ]
  },
  em: {
    and: [
      "* ",
      "\u{1F602}"
    ],
    background: [
      "\u{1F4A4}"
    ],
    but: [
      "* ",
      "\u{1F614}"
    ],
    examples: [
      "\u{1F4D3}"
    ],
    feature: [
      "\u{1F4DA}"
    ],
    given: [
      "* ",
      "\u{1F610}"
    ],
    name: "Emoji",
    native: "\u{1F600}",
    rule: [
      "Rule"
    ],
    scenario: [
      "\u{1F952}",
      "\u{1F4D5}"
    ],
    scenarioOutline: [
      "\u{1F4D6}"
    ],
    then: [
      "* ",
      "\u{1F64F}"
    ],
    when: [
      "* ",
      "\u{1F3AC}"
    ]
  },
  en: {
    and: [
      "* ",
      "And "
    ],
    background: [
      "Background"
    ],
    but: [
      "* ",
      "But "
    ],
    examples: [
      "Examples",
      "Scenarios"
    ],
    feature: [
      "Feature",
      "Business Need",
      "Ability"
    ],
    given: [
      "* ",
      "Given "
    ],
    name: "English",
    native: "English",
    rule: [
      "Rule"
    ],
    scenario: [
      "Example",
      "Scenario"
    ],
    scenarioOutline: [
      "Scenario Outline",
      "Scenario Template"
    ],
    then: [
      "* ",
      "Then "
    ],
    when: [
      "* ",
      "When "
    ]
  },
  "en-Scouse": {
    and: [
      "* ",
      "An "
    ],
    background: [
      "Dis is what went down"
    ],
    but: [
      "* ",
      "Buh "
    ],
    examples: [
      "Examples"
    ],
    feature: [
      "Feature"
    ],
    given: [
      "* ",
      "Givun ",
      "Youse know when youse got "
    ],
    name: "Scouse",
    native: "Scouse",
    rule: [
      "Rule"
    ],
    scenario: [
      "The thing of it is"
    ],
    scenarioOutline: [
      "Wharrimean is"
    ],
    then: [
      "* ",
      "Dun ",
      "Den youse gotta "
    ],
    when: [
      "* ",
      "Wun ",
      "Youse know like when "
    ]
  },
  "en-au": {
    and: [
      "* ",
      "Too right "
    ],
    background: [
      "First off"
    ],
    but: [
      "* ",
      "Yeah nah "
    ],
    examples: [
      "You'll wanna"
    ],
    feature: [
      "Pretty much"
    ],
    given: [
      "* ",
      "Y'know "
    ],
    name: "Australian",
    native: "Australian",
    rule: [
      "Rule"
    ],
    scenario: [
      "Awww, look mate"
    ],
    scenarioOutline: [
      "Reckon it's like"
    ],
    then: [
      "* ",
      "But at the end of the day I reckon "
    ],
    when: [
      "* ",
      "It's just unbelievable "
    ]
  },
  "en-lol": {
    and: [
      "* ",
      "AN "
    ],
    background: [
      "B4"
    ],
    but: [
      "* ",
      "BUT "
    ],
    examples: [
      "EXAMPLZ"
    ],
    feature: [
      "OH HAI"
    ],
    given: [
      "* ",
      "I CAN HAZ "
    ],
    name: "LOLCAT",
    native: "LOLCAT",
    rule: [
      "Rule"
    ],
    scenario: [
      "MISHUN"
    ],
    scenarioOutline: [
      "MISHUN SRSLY"
    ],
    then: [
      "* ",
      "DEN "
    ],
    when: [
      "* ",
      "WEN "
    ]
  },
  "en-old": {
    and: [
      "* ",
      "Ond ",
      "7 "
    ],
    background: [
      "Aer",
      "\xC6r"
    ],
    but: [
      "* ",
      "Ac "
    ],
    examples: [
      "Se the",
      "Se \xFEe",
      "Se \xF0e"
    ],
    feature: [
      "Hwaet",
      "Hw\xE6t"
    ],
    given: [
      "* ",
      "Thurh ",
      "\xDEurh ",
      "\xD0urh "
    ],
    name: "Old English",
    native: "Englisc",
    rule: [
      "Rule"
    ],
    scenario: [
      "Swa"
    ],
    scenarioOutline: [
      "Swa hwaer swa",
      "Swa hw\xE6r swa"
    ],
    then: [
      "* ",
      "Tha ",
      "\xDEa ",
      "\xD0a ",
      "Tha the ",
      "\xDEa \xFEe ",
      "\xD0a \xF0e "
    ],
    when: [
      "* ",
      "B\xE6\xFEsealf ",
      "B\xE6\xFEsealfa ",
      "B\xE6\xFEsealfe ",
      "Ciric\xE6w ",
      "Ciric\xE6we ",
      "Ciric\xE6wa "
    ]
  },
  "en-pirate": {
    and: [
      "* ",
      "Aye "
    ],
    background: [
      "Yo-ho-ho"
    ],
    but: [
      "* ",
      "Avast! "
    ],
    examples: [
      "Dead men tell no tales"
    ],
    feature: [
      "Ahoy matey!"
    ],
    given: [
      "* ",
      "Gangway! "
    ],
    name: "Pirate",
    native: "Pirate",
    rule: [
      "Rule"
    ],
    scenario: [
      "Heave to"
    ],
    scenarioOutline: [
      "Shiver me timbers"
    ],
    then: [
      "* ",
      "Let go and haul "
    ],
    when: [
      "* ",
      "Blimey! "
    ]
  },
  "en-tx": {
    and: [
      "Come hell or high water "
    ],
    background: [
      "Lemme tell y'all a story"
    ],
    but: [
      "Well now hold on, I'll you what "
    ],
    examples: [
      "Now that's a story longer than a cattle drive in July"
    ],
    feature: [
      "This ain\u2019t my first rodeo",
      "All gussied up"
    ],
    given: [
      "Fixin' to ",
      "All git out "
    ],
    name: "Texas",
    native: "Texas",
    rule: [
      "Rule "
    ],
    scenario: [
      "All hat and no cattle"
    ],
    scenarioOutline: [
      "Serious as a snake bite",
      "Busy as a hound in flea season"
    ],
    then: [
      "There\u2019s no tree but bears some fruit "
    ],
    when: [
      "Quick out of the chute "
    ]
  },
  eo: {
    and: [
      "* ",
      "Kaj "
    ],
    background: [
      "Fono"
    ],
    but: [
      "* ",
      "Sed "
    ],
    examples: [
      "Ekzemploj"
    ],
    feature: [
      "Trajto"
    ],
    given: [
      "* ",
      "Donita\u0135o ",
      "Komence "
    ],
    name: "Esperanto",
    native: "Esperanto",
    rule: [
      "Regulo"
    ],
    scenario: [
      "Ekzemplo",
      "Scenaro",
      "Kazo"
    ],
    scenarioOutline: [
      "Konturo de la scenaro",
      "Skizo",
      "Kazo-skizo"
    ],
    then: [
      "* ",
      "Do "
    ],
    when: [
      "* ",
      "Se "
    ]
  },
  es: {
    and: [
      "* ",
      "Y ",
      "E "
    ],
    background: [
      "Antecedentes"
    ],
    but: [
      "* ",
      "Pero "
    ],
    examples: [
      "Ejemplos"
    ],
    feature: [
      "Caracter\xEDstica",
      "Necesidad del negocio",
      "Requisito"
    ],
    given: [
      "* ",
      "Dado ",
      "Dada ",
      "Dados ",
      "Dadas "
    ],
    name: "Spanish",
    native: "espa\xF1ol",
    rule: [
      "Regla",
      "Regla de negocio"
    ],
    scenario: [
      "Ejemplo",
      "Escenario"
    ],
    scenarioOutline: [
      "Esquema del escenario"
    ],
    then: [
      "* ",
      "Entonces "
    ],
    when: [
      "* ",
      "Cuando "
    ]
  },
  et: {
    and: [
      "* ",
      "Ja "
    ],
    background: [
      "Taust"
    ],
    but: [
      "* ",
      "Kuid "
    ],
    examples: [
      "Juhtumid"
    ],
    feature: [
      "Omadus"
    ],
    given: [
      "* ",
      "Eeldades "
    ],
    name: "Estonian",
    native: "eesti keel",
    rule: [
      "Reegel"
    ],
    scenario: [
      "Juhtum",
      "Stsenaarium"
    ],
    scenarioOutline: [
      "Raamjuhtum",
      "Raamstsenaarium"
    ],
    then: [
      "* ",
      "Siis "
    ],
    when: [
      "* ",
      "Kui "
    ]
  },
  fa: {
    and: [
      "* ",
      "\u0648 "
    ],
    background: [
      "\u0632\u0645\u06CC\u0646\u0647",
      "\u067E\u06CC\u0634 \u0632\u0645\u06CC\u0646\u0647",
      "\u0645\u0642\u062F\u0645\u0627\u062A"
    ],
    but: [
      "* ",
      "\u0627\u0645\u0627 "
    ],
    examples: [
      "\u0646\u0645\u0648\u0646\u0647 \u0647\u0627"
    ],
    feature: [
      "\u0648\u06CC\u0698\u06AF\u06CC",
      "\u0642\u0627\u0628\u0644\u06CC\u062A"
    ],
    given: [
      "* ",
      "\u0628\u0627 \u0641\u0631\u0636 ",
      "\u0641\u0631\u0636 \u06A9\u0646\u06CC\u062F ",
      "\u0628\u0627 \u062F\u0631 \u0646\u0638\u0631 \u06AF\u0631\u0641\u062A\u0646 "
    ],
    name: "Persian",
    native: "\u0641\u0627\u0631\u0633\u06CC",
    rule: [
      "\u0642\u0627\u0646\u0648\u0646"
    ],
    scenario: [
      "\u0645\u062B\u0627\u0644",
      "\u0633\u0646\u0627\u0631\u06CC\u0648"
    ],
    scenarioOutline: [
      "\u0627\u0644\u06AF\u0648\u06CC \u0633\u0646\u0627\u0631\u06CC\u0648"
    ],
    then: [
      "* ",
      "\u0622\u0646\u06AF\u0627\u0647 ",
      "\u0633\u067E\u0633 ",
      "\u0627\u0646\u062A\u0638\u0627\u0631 \u0645\u06CC \u0631\u0648\u062F "
    ],
    when: [
      "* ",
      "\u0647\u0646\u06AF\u0627\u0645\u06CC ",
      "\u0648\u0642\u062A\u06CC "
    ]
  },
  fi: {
    and: [
      "* ",
      "Ja "
    ],
    background: [
      "Tausta"
    ],
    but: [
      "* ",
      "Mutta "
    ],
    examples: [
      "Tapaukset"
    ],
    feature: [
      "Ominaisuus"
    ],
    given: [
      "* ",
      "Oletetaan "
    ],
    name: "Finnish",
    native: "suomi",
    rule: [
      "Rule"
    ],
    scenario: [
      "Tapaus"
    ],
    scenarioOutline: [
      "Tapausaihio"
    ],
    then: [
      "* ",
      "Niin "
    ],
    when: [
      "* ",
      "Kun "
    ]
  },
  fr: {
    and: [
      "* ",
      "Et que ",
      "Et qu'",
      "Et "
    ],
    background: [
      "Contexte"
    ],
    but: [
      "* ",
      "Mais que ",
      "Mais qu'",
      "Mais "
    ],
    examples: [
      "Exemples"
    ],
    feature: [
      "Fonctionnalit\xE9"
    ],
    given: [
      "* ",
      "Soit ",
      "Sachant que ",
      "Sachant qu'",
      "Sachant ",
      "Etant donn\xE9 que ",
      "Etant donn\xE9 qu'",
      "Etant donn\xE9 ",
      "Etant donn\xE9e ",
      "Etant donn\xE9s ",
      "Etant donn\xE9es ",
      "\xC9tant donn\xE9 que ",
      "\xC9tant donn\xE9 qu'",
      "\xC9tant donn\xE9 ",
      "\xC9tant donn\xE9e ",
      "\xC9tant donn\xE9s ",
      "\xC9tant donn\xE9es "
    ],
    name: "French",
    native: "fran\xE7ais",
    rule: [
      "R\xE8gle"
    ],
    scenario: [
      "Exemple",
      "Sc\xE9nario"
    ],
    scenarioOutline: [
      "Plan du sc\xE9nario",
      "Plan du Sc\xE9nario"
    ],
    then: [
      "* ",
      "Alors ",
      "Donc "
    ],
    when: [
      "* ",
      "Quand ",
      "Lorsque ",
      "Lorsqu'"
    ]
  },
  ga: {
    and: [
      "* ",
      "Agus "
    ],
    background: [
      "C\xFAlra"
    ],
    but: [
      "* ",
      "Ach "
    ],
    examples: [
      "Sampla\xED"
    ],
    feature: [
      "Gn\xE9"
    ],
    given: [
      "* ",
      "Cuir i gc\xE1s go ",
      "Cuir i gc\xE1s nach ",
      "Cuir i gc\xE1s gur ",
      "Cuir i gc\xE1s n\xE1r "
    ],
    name: "Irish",
    native: "Gaeilge",
    rule: [
      "Riail"
    ],
    scenario: [
      "Sampla",
      "C\xE1s"
    ],
    scenarioOutline: [
      "C\xE1s Achomair"
    ],
    then: [
      "* ",
      "Ansin "
    ],
    when: [
      "* ",
      "Nuair a ",
      "Nuair nach ",
      "Nuair ba ",
      "Nuair n\xE1r "
    ]
  },
  gj: {
    and: [
      "* ",
      "\u0A85\u0AA8\u0AC7 "
    ],
    background: [
      "\u0AAC\u0AC7\u0A95\u0A97\u0ACD\u0AB0\u0ABE\u0A89\u0AA8\u0ACD\u0AA1"
    ],
    but: [
      "* ",
      "\u0AAA\u0AA3 "
    ],
    examples: [
      "\u0A89\u0AA6\u0ABE\u0AB9\u0AB0\u0AA3\u0ACB"
    ],
    feature: [
      "\u0AB2\u0A95\u0ACD\u0AB7\u0AA3",
      "\u0AB5\u0ACD\u0AAF\u0ABE\u0AAA\u0ABE\u0AB0 \u0A9C\u0AB0\u0AC2\u0AB0",
      "\u0A95\u0ACD\u0AB7\u0AAE\u0AA4\u0ABE"
    ],
    given: [
      "* ",
      "\u0A86\u0AAA\u0AC7\u0AB2 \u0A9B\u0AC7 "
    ],
    name: "Gujarati",
    native: "\u0A97\u0AC1\u0A9C\u0AB0\u0ABE\u0AA4\u0AC0",
    rule: [
      "\u0AA8\u0ABF\u0AAF\u0AAE"
    ],
    scenario: [
      "\u0A89\u0AA6\u0ABE\u0AB9\u0AB0\u0AA3",
      "\u0AB8\u0ACD\u0AA5\u0ABF\u0AA4\u0ABF"
    ],
    scenarioOutline: [
      "\u0AAA\u0AB0\u0ABF\u0AA6\u0ACD\u0AA6\u0AB6\u0ACD\u0AAF \u0AB0\u0AC2\u0AAA\u0AB0\u0AC7\u0A96\u0ABE",
      "\u0AAA\u0AB0\u0ABF\u0AA6\u0ACD\u0AA6\u0AB6\u0ACD\u0AAF \u0AA2\u0ABE\u0A82\u0A9A\u0ACB"
    ],
    then: [
      "* ",
      "\u0AAA\u0A9B\u0AC0 "
    ],
    when: [
      "* ",
      "\u0A95\u0ACD\u0AAF\u0ABE\u0AB0\u0AC7 "
    ]
  },
  gl: {
    and: [
      "* ",
      "E "
    ],
    background: [
      "Contexto"
    ],
    but: [
      "* ",
      "Mais ",
      "Pero "
    ],
    examples: [
      "Exemplos"
    ],
    feature: [
      "Caracter\xEDstica"
    ],
    given: [
      "* ",
      "Dado ",
      "Dada ",
      "Dados ",
      "Dadas "
    ],
    name: "Galician",
    native: "galego",
    rule: [
      "Rule"
    ],
    scenario: [
      "Exemplo",
      "Escenario"
    ],
    scenarioOutline: [
      "Esbozo do escenario"
    ],
    then: [
      "* ",
      "Ent\xF3n ",
      "Logo "
    ],
    when: [
      "* ",
      "Cando "
    ]
  },
  he: {
    and: [
      "* ",
      "\u05D5\u05D2\u05DD "
    ],
    background: [
      "\u05E8\u05E7\u05E2"
    ],
    but: [
      "* ",
      "\u05D0\u05D1\u05DC "
    ],
    examples: [
      "\u05D3\u05D5\u05D2\u05DE\u05D0\u05D5\u05EA"
    ],
    feature: [
      "\u05EA\u05DB\u05D5\u05E0\u05D4"
    ],
    given: [
      "* ",
      "\u05D1\u05D4\u05D9\u05E0\u05EA\u05DF "
    ],
    name: "Hebrew",
    native: "\u05E2\u05D1\u05E8\u05D9\u05EA",
    rule: [
      "\u05DB\u05DC\u05DC"
    ],
    scenario: [
      "\u05D3\u05D5\u05D2\u05DE\u05D0",
      "\u05EA\u05E8\u05D7\u05D9\u05E9"
    ],
    scenarioOutline: [
      "\u05EA\u05D1\u05E0\u05D9\u05EA \u05EA\u05E8\u05D7\u05D9\u05E9"
    ],
    then: [
      "* ",
      "\u05D0\u05D6 ",
      "\u05D0\u05D6\u05D9 "
    ],
    when: [
      "* ",
      "\u05DB\u05D0\u05E9\u05E8 "
    ]
  },
  hi: {
    and: [
      "* ",
      "\u0914\u0930 ",
      "\u0924\u0925\u093E "
    ],
    background: [
      "\u092A\u0943\u0937\u094D\u0920\u092D\u0942\u092E\u093F"
    ],
    but: [
      "* ",
      "\u092A\u0930 ",
      "\u092A\u0930\u0928\u094D\u0924\u0941 ",
      "\u0915\u093F\u0928\u094D\u0924\u0941 "
    ],
    examples: [
      "\u0909\u0926\u093E\u0939\u0930\u0923"
    ],
    feature: [
      "\u0930\u0942\u092A \u0932\u0947\u0916"
    ],
    given: [
      "* ",
      "\u0905\u0917\u0930 ",
      "\u092F\u0926\u093F ",
      "\u091A\u0942\u0902\u0915\u093F "
    ],
    name: "Hindi",
    native: "\u0939\u093F\u0902\u0926\u0940",
    rule: [
      "\u0928\u093F\u092F\u092E"
    ],
    scenario: [
      "\u092A\u0930\u093F\u0926\u0943\u0936\u094D\u092F"
    ],
    scenarioOutline: [
      "\u092A\u0930\u093F\u0926\u0943\u0936\u094D\u092F \u0930\u0942\u092A\u0930\u0947\u0916\u093E"
    ],
    then: [
      "* ",
      "\u0924\u092C ",
      "\u0924\u0926\u093E "
    ],
    when: [
      "* ",
      "\u091C\u092C ",
      "\u0915\u0926\u093E "
    ]
  },
  hr: {
    and: [
      "* ",
      "I "
    ],
    background: [
      "Pozadina"
    ],
    but: [
      "* ",
      "Ali "
    ],
    examples: [
      "Primjeri",
      "Scenariji"
    ],
    feature: [
      "Osobina",
      "Mogu\u0107nost",
      "Mogucnost"
    ],
    given: [
      "* ",
      "Zadan ",
      "Zadani ",
      "Zadano ",
      "Ukoliko "
    ],
    name: "Croatian",
    native: "hrvatski",
    rule: [
      "Rule"
    ],
    scenario: [
      "Primjer",
      "Scenarij"
    ],
    scenarioOutline: [
      "Skica",
      "Koncept"
    ],
    then: [
      "* ",
      "Onda "
    ],
    when: [
      "* ",
      "Kada ",
      "Kad "
    ]
  },
  ht: {
    and: [
      "* ",
      "Ak ",
      "Epi ",
      "E "
    ],
    background: [
      "Kont\xE8ks",
      "Istorik"
    ],
    but: [
      "* ",
      "Men "
    ],
    examples: [
      "Egzanp"
    ],
    feature: [
      "Karakteristik",
      "Mak",
      "Fonksyonalite"
    ],
    given: [
      "* ",
      "Sipoze ",
      "Sipoze ke ",
      "Sipoze Ke "
    ],
    name: "Creole",
    native: "krey\xF2l",
    rule: [
      "Rule"
    ],
    scenario: [
      "Senaryo"
    ],
    scenarioOutline: [
      "Plan senaryo",
      "Plan Senaryo",
      "Senaryo deskripsyon",
      "Senaryo Deskripsyon",
      "Dyagram senaryo",
      "Dyagram Senaryo"
    ],
    then: [
      "* ",
      "L\xE8 sa a ",
      "Le sa a "
    ],
    when: [
      "* ",
      "L\xE8 ",
      "Le "
    ]
  },
  hu: {
    and: [
      "* ",
      "\xC9s "
    ],
    background: [
      "H\xE1tt\xE9r"
    ],
    but: [
      "* ",
      "De "
    ],
    examples: [
      "P\xE9ld\xE1k"
    ],
    feature: [
      "Jellemz\u0151"
    ],
    given: [
      "* ",
      "Amennyiben ",
      "Adott "
    ],
    name: "Hungarian",
    native: "magyar",
    rule: [
      "Szab\xE1ly"
    ],
    scenario: [
      "P\xE9lda",
      "Forgat\xF3k\xF6nyv"
    ],
    scenarioOutline: [
      "Forgat\xF3k\xF6nyv v\xE1zlat"
    ],
    then: [
      "* ",
      "Akkor "
    ],
    when: [
      "* ",
      "Majd ",
      "Ha ",
      "Amikor "
    ]
  },
  id: {
    and: [
      "* ",
      "Dan "
    ],
    background: [
      "Dasar",
      "Latar Belakang"
    ],
    but: [
      "* ",
      "Tapi ",
      "Tetapi "
    ],
    examples: [
      "Contoh",
      "Misal"
    ],
    feature: [
      "Fitur"
    ],
    given: [
      "* ",
      "Dengan ",
      "Diketahui ",
      "Diasumsikan ",
      "Bila ",
      "Jika "
    ],
    name: "Indonesian",
    native: "Bahasa Indonesia",
    rule: [
      "Rule",
      "Aturan"
    ],
    scenario: [
      "Skenario"
    ],
    scenarioOutline: [
      "Skenario konsep",
      "Garis-Besar Skenario"
    ],
    then: [
      "* ",
      "Maka ",
      "Kemudian "
    ],
    when: [
      "* ",
      "Ketika "
    ]
  },
  is: {
    and: [
      "* ",
      "Og "
    ],
    background: [
      "Bakgrunnur"
    ],
    but: [
      "* ",
      "En "
    ],
    examples: [
      "D\xE6mi",
      "Atbur\xF0ar\xE1sir"
    ],
    feature: [
      "Eiginleiki"
    ],
    given: [
      "* ",
      "Ef "
    ],
    name: "Icelandic",
    native: "\xCDslenska",
    rule: [
      "Rule"
    ],
    scenario: [
      "Atbur\xF0ar\xE1s"
    ],
    scenarioOutline: [
      "L\xFDsing Atbur\xF0ar\xE1sar",
      "L\xFDsing D\xE6ma"
    ],
    then: [
      "* ",
      "\xDE\xE1 "
    ],
    when: [
      "* ",
      "\xDEegar "
    ]
  },
  it: {
    and: [
      "* ",
      "E ",
      "Ed "
    ],
    background: [
      "Contesto"
    ],
    but: [
      "* ",
      "Ma "
    ],
    examples: [
      "Esempi"
    ],
    feature: [
      "Funzionalit\xE0",
      "Esigenza di Business",
      "Abilit\xE0"
    ],
    given: [
      "* ",
      "Dato ",
      "Data ",
      "Dati ",
      "Date "
    ],
    name: "Italian",
    native: "italiano",
    rule: [
      "Regola"
    ],
    scenario: [
      "Esempio",
      "Scenario"
    ],
    scenarioOutline: [
      "Schema dello scenario"
    ],
    then: [
      "* ",
      "Allora "
    ],
    when: [
      "* ",
      "Quando "
    ]
  },
  ja: {
    and: [
      "* ",
      "\u4E14\u3064",
      "\u304B\u3064"
    ],
    background: [
      "\u80CC\u666F"
    ],
    but: [
      "* ",
      "\u7136\u3057",
      "\u3057\u304B\u3057",
      "\u4F46\u3057",
      "\u305F\u3060\u3057"
    ],
    examples: [
      "\u4F8B",
      "\u30B5\u30F3\u30D7\u30EB"
    ],
    feature: [
      "\u30D5\u30A3\u30FC\u30C1\u30E3",
      "\u6A5F\u80FD"
    ],
    given: [
      "* ",
      "\u524D\u63D0"
    ],
    name: "Japanese",
    native: "\u65E5\u672C\u8A9E",
    rule: [
      "\u30EB\u30FC\u30EB"
    ],
    scenario: [
      "\u30B7\u30CA\u30EA\u30AA"
    ],
    scenarioOutline: [
      "\u30B7\u30CA\u30EA\u30AA\u30A2\u30A6\u30C8\u30E9\u30A4\u30F3",
      "\u30B7\u30CA\u30EA\u30AA\u30C6\u30F3\u30D7\u30EC\u30FC\u30C8",
      "\u30C6\u30F3\u30D7\u30EC",
      "\u30B7\u30CA\u30EA\u30AA\u30C6\u30F3\u30D7\u30EC"
    ],
    then: [
      "* ",
      "\u306A\u3089\u3070"
    ],
    when: [
      "* ",
      "\u3082\u3057"
    ]
  },
  jv: {
    and: [
      "* ",
      "Lan "
    ],
    background: [
      "Dasar"
    ],
    but: [
      "* ",
      "Tapi ",
      "Nanging ",
      "Ananging "
    ],
    examples: [
      "Conto",
      "Contone"
    ],
    feature: [
      "Fitur"
    ],
    given: [
      "* ",
      "Nalika ",
      "Nalikaning "
    ],
    name: "Javanese",
    native: "Basa Jawa",
    rule: [
      "Rule"
    ],
    scenario: [
      "Skenario"
    ],
    scenarioOutline: [
      "Konsep skenario"
    ],
    then: [
      "* ",
      "Njuk ",
      "Banjur "
    ],
    when: [
      "* ",
      "Manawa ",
      "Menawa "
    ]
  },
  ka: {
    and: [
      "* ",
      "\u10D3\u10D0 ",
      "\u10D0\u10E1\u10D4\u10D5\u10D4 "
    ],
    background: [
      "\u10D9\u10DD\u10DC\u10E2\u10D4\u10E5\u10E1\u10E2\u10D8"
    ],
    but: [
      "* ",
      "\u10DB\u10D0\u10D2\u10E0\u10D0\u10DB ",
      "\u10D7\u10E3\u10DB\u10EA\u10D0 "
    ],
    examples: [
      "\u10DB\u10D0\u10D2\u10D0\u10DA\u10D8\u10D7\u10D4\u10D1\u10D8"
    ],
    feature: [
      "\u10D7\u10D5\u10D8\u10E1\u10D4\u10D1\u10D0",
      "\u10DB\u10DD\u10D7\u10EE\u10DD\u10D5\u10DC\u10D0"
    ],
    given: [
      "* ",
      "\u10DB\u10DD\u10EA\u10D4\u10DB\u10E3\u10DA\u10D8 ",
      "\u10DB\u10DD\u10EA\u10D4\u10DB\u10E3\u10DA\u10D8\u10D0 ",
      "\u10D5\u10D7\u10E5\u10D5\u10D0\u10D7 "
    ],
    name: "Georgian",
    native: "\u10E5\u10D0\u10E0\u10D7\u10E3\u10DA\u10D8",
    rule: [
      "\u10EC\u10D4\u10E1\u10D8"
    ],
    scenario: [
      "\u10DB\u10D0\u10D2\u10D0\u10DA\u10D8\u10D7\u10D0\u10D3",
      "\u10DB\u10D0\u10D2\u10D0\u10DA\u10D8\u10D7\u10D8",
      "\u10DB\u10D0\u10D2",
      "\u10E1\u10EA\u10D4\u10DC\u10D0\u10E0\u10D8"
    ],
    scenarioOutline: [
      "\u10E1\u10EA\u10D4\u10DC\u10D0\u10E0\u10D8\u10E1 \u10DC\u10D8\u10DB\u10E3\u10E8\u10D8",
      "\u10E1\u10EA\u10D4\u10DC\u10D0\u10E0\u10D8\u10E1 \u10E8\u10D0\u10D1\u10DA\u10DD\u10DC\u10D8",
      "\u10DC\u10D8\u10DB\u10E3\u10E8\u10D8",
      "\u10E8\u10D0\u10D1\u10DA\u10DD\u10DC\u10D8"
    ],
    then: [
      "* ",
      "\u10DB\u10D0\u10E8\u10D8\u10DC "
    ],
    when: [
      "* ",
      "\u10E0\u10DD\u10D3\u10D4\u10E1\u10D0\u10EA ",
      "\u10E0\u10DD\u10EA\u10D0 ",
      "\u10E0\u10DD\u10D2\u10DD\u10E0\u10EA \u10D9\u10D8 ",
      "\u10D7\u10E3 "
    ]
  },
  kn: {
    and: [
      "* ",
      "\u0CAE\u0CA4\u0CCD\u0CA4\u0CC1 "
    ],
    background: [
      "\u0CB9\u0CBF\u0CA8\u0CCD\u0CA8\u0CC6\u0CB2\u0CC6"
    ],
    but: [
      "* ",
      "\u0C86\u0CA6\u0CB0\u0CC6 "
    ],
    examples: [
      "\u0C89\u0CA6\u0CBE\u0CB9\u0CB0\u0CA3\u0CC6\u0C97\u0CB3\u0CC1"
    ],
    feature: [
      "\u0CB9\u0CC6\u0C9A\u0CCD\u0C9A\u0CB3"
    ],
    given: [
      "* ",
      "\u0CA8\u0CBF\u0CD5\u0CA1\u0CBF\u0CA6 "
    ],
    name: "Kannada",
    native: "\u0C95\u0CA8\u0CCD\u0CA8\u0CA1",
    rule: [
      "Rule"
    ],
    scenario: [
      "\u0C89\u0CA6\u0CBE\u0CB9\u0CB0\u0CA3\u0CC6",
      "\u0C95\u0CA5\u0CBE\u0CB8\u0CBE\u0CB0\u0CBE\u0C82\u0CB6"
    ],
    scenarioOutline: [
      "\u0CB5\u0CBF\u0CB5\u0CB0\u0CA3\u0CC6"
    ],
    then: [
      "* ",
      "\u0CA8\u0C82\u0CA4\u0CB0 "
    ],
    when: [
      "* ",
      "\u0CB8\u0CCD\u0CA5\u0CBF\u0CA4\u0CBF\u0CAF\u0CA8\u0CCD\u0CA8\u0CC1 "
    ]
  },
  ko: {
    and: [
      "* ",
      "\uADF8\uB9AC\uACE0 "
    ],
    background: [
      "\uBC30\uACBD"
    ],
    but: [
      "* ",
      "\uD558\uC9C0\uB9CC ",
      "\uB2E8 "
    ],
    examples: [
      "\uC608"
    ],
    feature: [
      "\uAE30\uB2A5"
    ],
    given: [
      "* ",
      "\uC870\uAC74 ",
      "\uBA3C\uC800 "
    ],
    name: "Korean",
    native: "\uD55C\uAD6D\uC5B4",
    rule: [
      "\uADDC\uCE59"
    ],
    scenario: [
      "\uC2DC\uB098\uB9AC\uC624"
    ],
    scenarioOutline: [
      "\uC2DC\uB098\uB9AC\uC624 \uAC1C\uC694"
    ],
    then: [
      "* ",
      "\uADF8\uB7EC\uBA74 "
    ],
    when: [
      "* ",
      "\uB9CC\uC77C ",
      "\uB9CC\uC57D "
    ]
  },
  lt: {
    and: [
      "* ",
      "Ir "
    ],
    background: [
      "Kontekstas"
    ],
    but: [
      "* ",
      "Bet "
    ],
    examples: [
      "Pavyzd\u017Eiai",
      "Scenarijai",
      "Variantai"
    ],
    feature: [
      "Savyb\u0117"
    ],
    given: [
      "* ",
      "Duota "
    ],
    name: "Lithuanian",
    native: "lietuvi\u0173 kalba",
    rule: [
      "Rule"
    ],
    scenario: [
      "Pavyzdys",
      "Scenarijus"
    ],
    scenarioOutline: [
      "Scenarijaus \u0161ablonas"
    ],
    then: [
      "* ",
      "Tada "
    ],
    when: [
      "* ",
      "Kai "
    ]
  },
  lu: {
    and: [
      "* ",
      "an ",
      "a "
    ],
    background: [
      "Hannergrond"
    ],
    but: [
      "* ",
      "awer ",
      "m\xE4 "
    ],
    examples: [
      "Beispiller"
    ],
    feature: [
      "Funktionalit\xE9it"
    ],
    given: [
      "* ",
      "ugeholl "
    ],
    name: "Luxemburgish",
    native: "L\xEBtzebuergesch",
    rule: [
      "Rule"
    ],
    scenario: [
      "Beispill",
      "Szenario"
    ],
    scenarioOutline: [
      "Plang vum Szenario"
    ],
    then: [
      "* ",
      "dann "
    ],
    when: [
      "* ",
      "wann "
    ]
  },
  lv: {
    and: [
      "* ",
      "Un "
    ],
    background: [
      "Konteksts",
      "Situ\u0101cija"
    ],
    but: [
      "* ",
      "Bet "
    ],
    examples: [
      "Piem\u0113ri",
      "Paraugs"
    ],
    feature: [
      "Funkcionalit\u0101te",
      "F\u012B\u010Da"
    ],
    given: [
      "* ",
      "Kad "
    ],
    name: "Latvian",
    native: "latvie\u0161u",
    rule: [
      "Rule"
    ],
    scenario: [
      "Piem\u0113rs",
      "Scen\u0101rijs"
    ],
    scenarioOutline: [
      "Scen\u0101rijs p\u0113c parauga"
    ],
    then: [
      "* ",
      "Tad "
    ],
    when: [
      "* ",
      "Ja "
    ]
  },
  "mk-Cyrl": {
    and: [
      "* ",
      "\u0418 "
    ],
    background: [
      "\u041A\u043E\u043D\u0442\u0435\u043A\u0441\u0442",
      "\u0421\u043E\u0434\u0440\u0436\u0438\u043D\u0430"
    ],
    but: [
      "* ",
      "\u041D\u043E "
    ],
    examples: [
      "\u041F\u0440\u0438\u043C\u0435\u0440\u0438",
      "\u0421\u0446\u0435\u043D\u0430\u0440\u0438\u0458\u0430"
    ],
    feature: [
      "\u0424\u0443\u043D\u043A\u0446\u0438\u043E\u043D\u0430\u043B\u043D\u043E\u0441\u0442",
      "\u0411\u0438\u0437\u043D\u0438\u0441 \u043F\u043E\u0442\u0440\u0435\u0431\u0430",
      "\u041C\u043E\u0436\u043D\u043E\u0441\u0442"
    ],
    given: [
      "* ",
      "\u0414\u0430\u0434\u0435\u043D\u043E ",
      "\u0414\u0430\u0434\u0435\u043D\u0430 "
    ],
    name: "Macedonian",
    native: "\u041C\u0430\u043A\u0435\u0434\u043E\u043D\u0441\u043A\u0438",
    rule: [
      "Rule"
    ],
    scenario: [
      "\u041F\u0440\u0438\u043C\u0435\u0440",
      "\u0421\u0446\u0435\u043D\u0430\u0440\u0438\u043E",
      "\u041D\u0430 \u043F\u0440\u0438\u043C\u0435\u0440"
    ],
    scenarioOutline: [
      "\u041F\u0440\u0435\u0433\u043B\u0435\u0434 \u043D\u0430 \u0441\u0446\u0435\u043D\u0430\u0440\u0438\u0458\u0430",
      "\u0421\u043A\u0438\u0446\u0430",
      "\u041A\u043E\u043D\u0446\u0435\u043F\u0442"
    ],
    then: [
      "* ",
      "\u0422\u043E\u0433\u0430\u0448 "
    ],
    when: [
      "* ",
      "\u041A\u043E\u0433\u0430 "
    ]
  },
  "mk-Latn": {
    and: [
      "* ",
      "I "
    ],
    background: [
      "Kontekst",
      "Sodrzhina"
    ],
    but: [
      "* ",
      "No "
    ],
    examples: [
      "Primeri",
      "Scenaria"
    ],
    feature: [
      "Funkcionalnost",
      "Biznis potreba",
      "Mozhnost"
    ],
    given: [
      "* ",
      "Dadeno ",
      "Dadena "
    ],
    name: "Macedonian (Latin)",
    native: "Makedonski (Latinica)",
    rule: [
      "Rule"
    ],
    scenario: [
      "Scenario",
      "Na primer"
    ],
    scenarioOutline: [
      "Pregled na scenarija",
      "Skica",
      "Koncept"
    ],
    then: [
      "* ",
      "Togash "
    ],
    when: [
      "* ",
      "Koga "
    ]
  },
  mn: {
    and: [
      "* ",
      "\u041C\u04E9\u043D ",
      "\u0422\u044D\u0433\u044D\u044D\u0434 "
    ],
    background: [
      "\u0410\u0433\u0443\u0443\u043B\u0433\u0430"
    ],
    but: [
      "* ",
      "\u0413\u044D\u0445\u0434\u044D\u044D ",
      "\u0425\u0430\u0440\u0438\u043D "
    ],
    examples: [
      "\u0422\u0443\u0445\u0430\u0439\u043B\u0431\u0430\u043B"
    ],
    feature: [
      "\u0424\u0443\u043D\u043A\u0446",
      "\u0424\u0443\u043D\u043A\u0446\u0438\u043E\u043D\u0430\u043B"
    ],
    given: [
      "* ",
      "\u04E8\u0433\u04E9\u0433\u0434\u0441\u04E9\u043D \u043D\u044C ",
      "\u0410\u043D\u0445 "
    ],
    name: "Mongolian",
    native: "\u043C\u043E\u043D\u0433\u043E\u043B",
    rule: [
      "Rule"
    ],
    scenario: [
      "\u0421\u0446\u0435\u043D\u0430\u0440"
    ],
    scenarioOutline: [
      "\u0421\u0446\u0435\u043D\u0430\u0440\u044B\u043D \u0442\u04E9\u043B\u04E9\u0432\u043B\u04E9\u0433\u04E9\u04E9"
    ],
    then: [
      "* ",
      "\u0422\u044D\u0433\u044D\u0445\u044D\u0434 ",
      "\u04AE\u04AF\u043D\u0438\u0439 \u0434\u0430\u0440\u0430\u0430 "
    ],
    when: [
      "* ",
      "\u0425\u044D\u0440\u044D\u0432 "
    ]
  },
  ne: {
    and: [
      "* ",
      "\u0930 ",
      "\u0905\u0928\u093F "
    ],
    background: [
      "\u092A\u0943\u0937\u094D\u0920\u092D\u0942\u092E\u0940"
    ],
    but: [
      "* ",
      "\u0924\u0930 "
    ],
    examples: [
      "\u0909\u0926\u093E\u0939\u0930\u0923",
      "\u0909\u0926\u093E\u0939\u0930\u0923\u0939\u0930\u0941"
    ],
    feature: [
      "\u0938\u0941\u0935\u093F\u0927\u093E",
      "\u0935\u093F\u0936\u0947\u0937\u0924\u093E"
    ],
    given: [
      "* ",
      "\u0926\u093F\u0907\u090F\u0915\u094B ",
      "\u0926\u093F\u090F\u0915\u094B ",
      "\u092F\u0926\u093F "
    ],
    name: "Nepali",
    native: "\u0928\u0947\u092A\u093E\u0932\u0940",
    rule: [
      "\u0928\u093F\u092F\u092E"
    ],
    scenario: [
      "\u092A\u0930\u093F\u0926\u0943\u0936\u094D\u092F"
    ],
    scenarioOutline: [
      "\u092A\u0930\u093F\u0926\u0943\u0936\u094D\u092F \u0930\u0942\u092A\u0930\u0947\u0916\u093E"
    ],
    then: [
      "* ",
      "\u0924\u094D\u092F\u0938\u092A\u091B\u093F ",
      "\u0905\u0928\u0940 "
    ],
    when: [
      "* ",
      "\u091C\u092C "
    ]
  },
  nl: {
    and: [
      "* ",
      "En "
    ],
    background: [
      "Achtergrond"
    ],
    but: [
      "* ",
      "Maar "
    ],
    examples: [
      "Voorbeelden"
    ],
    feature: [
      "Functionaliteit"
    ],
    given: [
      "* ",
      "Gegeven ",
      "Stel "
    ],
    name: "Dutch",
    native: "Nederlands",
    rule: [
      "Regel"
    ],
    scenario: [
      "Voorbeeld",
      "Scenario"
    ],
    scenarioOutline: [
      "Abstract Scenario"
    ],
    then: [
      "* ",
      "Dan "
    ],
    when: [
      "* ",
      "Als ",
      "Wanneer "
    ]
  },
  no: {
    and: [
      "* ",
      "Og "
    ],
    background: [
      "Bakgrunn"
    ],
    but: [
      "* ",
      "Men "
    ],
    examples: [
      "Eksempler"
    ],
    feature: [
      "Egenskap"
    ],
    given: [
      "* ",
      "Gitt "
    ],
    name: "Norwegian",
    native: "norsk",
    rule: [
      "Regel"
    ],
    scenario: [
      "Eksempel",
      "Scenario"
    ],
    scenarioOutline: [
      "Scenariomal",
      "Abstrakt Scenario"
    ],
    then: [
      "* ",
      "S\xE5 "
    ],
    when: [
      "* ",
      "N\xE5r "
    ]
  },
  pa: {
    and: [
      "* ",
      "\u0A05\u0A24\u0A47 "
    ],
    background: [
      "\u0A2A\u0A3F\u0A1B\u0A4B\u0A15\u0A5C"
    ],
    but: [
      "* ",
      "\u0A2A\u0A30 "
    ],
    examples: [
      "\u0A09\u0A26\u0A3E\u0A39\u0A30\u0A28\u0A3E\u0A02"
    ],
    feature: [
      "\u0A16\u0A3E\u0A38\u0A40\u0A05\u0A24",
      "\u0A2E\u0A41\u0A39\u0A3E\u0A02\u0A26\u0A30\u0A3E",
      "\u0A28\u0A15\u0A36 \u0A28\u0A41\u0A39\u0A3E\u0A30"
    ],
    given: [
      "* ",
      "\u0A1C\u0A47\u0A15\u0A30 ",
      "\u0A1C\u0A3F\u0A35\u0A47\u0A02 \u0A15\u0A3F "
    ],
    name: "Panjabi",
    native: "\u0A2A\u0A70\u0A1C\u0A3E\u0A2C\u0A40",
    rule: [
      "Rule"
    ],
    scenario: [
      "\u0A09\u0A26\u0A3E\u0A39\u0A30\u0A28",
      "\u0A2A\u0A1F\u0A15\u0A25\u0A3E"
    ],
    scenarioOutline: [
      "\u0A2A\u0A1F\u0A15\u0A25\u0A3E \u0A22\u0A3E\u0A02\u0A1A\u0A3E",
      "\u0A2A\u0A1F\u0A15\u0A25\u0A3E \u0A30\u0A42\u0A2A \u0A30\u0A47\u0A16\u0A3E"
    ],
    then: [
      "* ",
      "\u0A24\u0A26 "
    ],
    when: [
      "* ",
      "\u0A1C\u0A26\u0A4B\u0A02 "
    ]
  },
  pl: {
    and: [
      "* ",
      "Oraz ",
      "I "
    ],
    background: [
      "Za\u0142o\u017Cenia"
    ],
    but: [
      "* ",
      "Ale "
    ],
    examples: [
      "Przyk\u0142ady"
    ],
    feature: [
      "W\u0142a\u015Bciwo\u015B\u0107",
      "Funkcja",
      "Aspekt",
      "Potrzeba biznesowa"
    ],
    given: [
      "* ",
      "Zak\u0142adaj\u0105c ",
      "Maj\u0105c ",
      "Zak\u0142adaj\u0105c, \u017Ce "
    ],
    name: "Polish",
    native: "polski",
    rule: [
      "Zasada",
      "Regu\u0142a"
    ],
    scenario: [
      "Przyk\u0142ad",
      "Scenariusz"
    ],
    scenarioOutline: [
      "Szablon scenariusza"
    ],
    then: [
      "* ",
      "Wtedy "
    ],
    when: [
      "* ",
      "Je\u017Celi ",
      "Je\u015Bli ",
      "Gdy ",
      "Kiedy "
    ]
  },
  pt: {
    and: [
      "* ",
      "E "
    ],
    background: [
      "Contexto",
      "Cen\xE1rio de Fundo",
      "Cenario de Fundo",
      "Fundo"
    ],
    but: [
      "* ",
      "Mas "
    ],
    examples: [
      "Exemplos",
      "Cen\xE1rios",
      "Cenarios"
    ],
    feature: [
      "Funcionalidade",
      "Caracter\xEDstica",
      "Caracteristica"
    ],
    given: [
      "* ",
      "Dado ",
      "Dada ",
      "Dados ",
      "Dadas "
    ],
    name: "Portuguese",
    native: "portugu\xEAs",
    rule: [
      "Regra"
    ],
    scenario: [
      "Exemplo",
      "Cen\xE1rio",
      "Cenario"
    ],
    scenarioOutline: [
      "Esquema do Cen\xE1rio",
      "Esquema do Cenario",
      "Delinea\xE7\xE3o do Cen\xE1rio",
      "Delineacao do Cenario"
    ],
    then: [
      "* ",
      "Ent\xE3o ",
      "Entao "
    ],
    when: [
      "* ",
      "Quando "
    ]
  },
  ro: {
    and: [
      "* ",
      "Si ",
      "\u0218i ",
      "\u015Ei "
    ],
    background: [
      "Context"
    ],
    but: [
      "* ",
      "Dar "
    ],
    examples: [
      "Exemple"
    ],
    feature: [
      "Functionalitate",
      "Func\u021Bionalitate",
      "Func\u0163ionalitate"
    ],
    given: [
      "* ",
      "Date fiind ",
      "Dat fiind ",
      "Dat\u0103 fiind",
      "Dati fiind ",
      "Da\u021Bi fiind ",
      "Da\u0163i fiind "
    ],
    name: "Romanian",
    native: "rom\xE2n\u0103",
    rule: [
      "Rule"
    ],
    scenario: [
      "Exemplu",
      "Scenariu"
    ],
    scenarioOutline: [
      "Structura scenariu",
      "Structur\u0103 scenariu"
    ],
    then: [
      "* ",
      "Atunci "
    ],
    when: [
      "* ",
      "Cand ",
      "C\xE2nd "
    ]
  },
  ru: {
    and: [
      "* ",
      "\u0418 ",
      "\u041A \u0442\u043E\u043C\u0443 \u0436\u0435 ",
      "\u0422\u0430\u043A\u0436\u0435 "
    ],
    background: [
      "\u041F\u0440\u0435\u0434\u044B\u0441\u0442\u043E\u0440\u0438\u044F",
      "\u041A\u043E\u043D\u0442\u0435\u043A\u0441\u0442"
    ],
    but: [
      "* ",
      "\u041D\u043E ",
      "\u0410 ",
      "\u0418\u043D\u0430\u0447\u0435 "
    ],
    examples: [
      "\u041F\u0440\u0438\u043C\u0435\u0440\u044B",
      "\u0417\u043D\u0430\u0447\u0435\u043D\u0438\u044F"
    ],
    feature: [
      "\u0424\u0443\u043D\u043A\u0446\u0438\u044F",
      "\u0424\u0443\u043D\u043A\u0446\u0438\u043E\u043D\u0430\u043B\u044C\u043D\u043E\u0441\u0442\u044C",
      "\u0424\u0443\u043D\u043A\u0446\u0438\u043E\u043D\u0430\u043B",
      "\u0421\u0432\u043E\u0439\u0441\u0442\u0432\u043E",
      "\u0424\u0438\u0447\u0430"
    ],
    given: [
      "* ",
      "\u0414\u043E\u043F\u0443\u0441\u0442\u0438\u043C ",
      "\u0414\u0430\u043D\u043E ",
      "\u041F\u0443\u0441\u0442\u044C "
    ],
    name: "Russian",
    native: "\u0440\u0443\u0441\u0441\u043A\u0438\u0439",
    rule: [
      "\u041F\u0440\u0430\u0432\u0438\u043B\u043E"
    ],
    scenario: [
      "\u041F\u0440\u0438\u043C\u0435\u0440",
      "\u0421\u0446\u0435\u043D\u0430\u0440\u0438\u0439"
    ],
    scenarioOutline: [
      "\u0421\u0442\u0440\u0443\u043A\u0442\u0443\u0440\u0430 \u0441\u0446\u0435\u043D\u0430\u0440\u0438\u044F",
      "\u0428\u0430\u0431\u043B\u043E\u043D \u0441\u0446\u0435\u043D\u0430\u0440\u0438\u044F"
    ],
    then: [
      "* ",
      "\u0422\u043E ",
      "\u0417\u0430\u0442\u0435\u043C ",
      "\u0422\u043E\u0433\u0434\u0430 "
    ],
    when: [
      "* ",
      "\u041A\u043E\u0433\u0434\u0430 ",
      "\u0415\u0441\u043B\u0438 "
    ]
  },
  sk: {
    and: [
      "* ",
      "A ",
      "A tie\u017E ",
      "A taktie\u017E ",
      "A z\xE1rove\u0148 "
    ],
    background: [
      "Pozadie"
    ],
    but: [
      "* ",
      "Ale "
    ],
    examples: [
      "Pr\xEDklady"
    ],
    feature: [
      "Po\u017Eiadavka",
      "Funkcia",
      "Vlastnos\u0165"
    ],
    given: [
      "* ",
      "Pokia\u013E ",
      "Za predpokladu "
    ],
    name: "Slovak",
    native: "Slovensky",
    rule: [
      "Rule"
    ],
    scenario: [
      "Pr\xEDklad",
      "Scen\xE1r"
    ],
    scenarioOutline: [
      "N\xE1\u010Drt Scen\xE1ru",
      "N\xE1\u010Drt Scen\xE1ra",
      "Osnova Scen\xE1ra"
    ],
    then: [
      "* ",
      "Tak ",
      "Potom "
    ],
    when: [
      "* ",
      "Ke\u010F ",
      "Ak "
    ]
  },
  sl: {
    and: [
      "In ",
      "Ter "
    ],
    background: [
      "Kontekst",
      "Osnova",
      "Ozadje"
    ],
    but: [
      "Toda ",
      "Ampak ",
      "Vendar "
    ],
    examples: [
      "Primeri",
      "Scenariji"
    ],
    feature: [
      "Funkcionalnost",
      "Funkcija",
      "Mo\u017Enosti",
      "Moznosti",
      "Lastnost",
      "Zna\u010Dilnost"
    ],
    given: [
      "Dano ",
      "Podano ",
      "Zaradi ",
      "Privzeto "
    ],
    name: "Slovenian",
    native: "Slovenski",
    rule: [
      "Rule"
    ],
    scenario: [
      "Primer",
      "Scenarij"
    ],
    scenarioOutline: [
      "Struktura scenarija",
      "Skica",
      "Koncept",
      "Oris scenarija",
      "Osnutek"
    ],
    then: [
      "Nato ",
      "Potem ",
      "Takrat "
    ],
    when: [
      "Ko ",
      "Ce ",
      "\u010Ce ",
      "Kadar "
    ]
  },
  "sr-Cyrl": {
    and: [
      "* ",
      "\u0418 "
    ],
    background: [
      "\u041A\u043E\u043D\u0442\u0435\u043A\u0441\u0442",
      "\u041E\u0441\u043D\u043E\u0432\u0430",
      "\u041F\u043E\u0437\u0430\u0434\u0438\u043D\u0430"
    ],
    but: [
      "* ",
      "\u0410\u043B\u0438 "
    ],
    examples: [
      "\u041F\u0440\u0438\u043C\u0435\u0440\u0438",
      "\u0421\u0446\u0435\u043D\u0430\u0440\u0438\u0458\u0438"
    ],
    feature: [
      "\u0424\u0443\u043D\u043A\u0446\u0438\u043E\u043D\u0430\u043B\u043D\u043E\u0441\u0442",
      "\u041C\u043E\u0433\u0443\u045B\u043D\u043E\u0441\u0442",
      "\u041E\u0441\u043E\u0431\u0438\u043D\u0430"
    ],
    given: [
      "* ",
      "\u0417\u0430 \u0434\u0430\u0442\u043E ",
      "\u0417\u0430 \u0434\u0430\u0442\u0435 ",
      "\u0417\u0430 \u0434\u0430\u0442\u0438 "
    ],
    name: "Serbian",
    native: "\u0421\u0440\u043F\u0441\u043A\u0438",
    rule: [
      "\u041F\u0440\u0430\u0432\u0438\u043B\u043E"
    ],
    scenario: [
      "\u0421\u0446\u0435\u043D\u0430\u0440\u0438\u043E",
      "\u041F\u0440\u0438\u043C\u0435\u0440"
    ],
    scenarioOutline: [
      "\u0421\u0442\u0440\u0443\u043A\u0442\u0443\u0440\u0430 \u0441\u0446\u0435\u043D\u0430\u0440\u0438\u0458\u0430",
      "\u0421\u043A\u0438\u0446\u0430",
      "\u041A\u043E\u043D\u0446\u0435\u043F\u0442"
    ],
    then: [
      "* ",
      "\u041E\u043D\u0434\u0430 "
    ],
    when: [
      "* ",
      "\u041A\u0430\u0434\u0430 ",
      "\u041A\u0430\u0434 "
    ]
  },
  "sr-Latn": {
    and: [
      "* ",
      "I "
    ],
    background: [
      "Kontekst",
      "Osnova",
      "Pozadina"
    ],
    but: [
      "* ",
      "Ali "
    ],
    examples: [
      "Primeri",
      "Scenariji"
    ],
    feature: [
      "Funkcionalnost",
      "Mogu\u0107nost",
      "Mogucnost",
      "Osobina"
    ],
    given: [
      "* ",
      "Za dato ",
      "Za date ",
      "Za dati "
    ],
    name: "Serbian (Latin)",
    native: "Srpski (Latinica)",
    rule: [
      "Pravilo"
    ],
    scenario: [
      "Scenario",
      "Primer"
    ],
    scenarioOutline: [
      "Struktura scenarija",
      "Skica",
      "Koncept"
    ],
    then: [
      "* ",
      "Onda "
    ],
    when: [
      "* ",
      "Kada ",
      "Kad "
    ]
  },
  sv: {
    and: [
      "* ",
      "Och "
    ],
    background: [
      "Bakgrund"
    ],
    but: [
      "* ",
      "Men "
    ],
    examples: [
      "Exempel"
    ],
    feature: [
      "Egenskap"
    ],
    given: [
      "* ",
      "Givet "
    ],
    name: "Swedish",
    native: "Svenska",
    rule: [
      "Regel"
    ],
    scenario: [
      "Scenario"
    ],
    scenarioOutline: [
      "Abstrakt Scenario",
      "Scenariomall"
    ],
    then: [
      "* ",
      "S\xE5 "
    ],
    when: [
      "* ",
      "N\xE4r "
    ]
  },
  ta: {
    and: [
      "* ",
      "\u0BAE\u0BC7\u0BB2\u0BC1\u0BAE\u0BCD ",
      "\u0BAE\u0BB1\u0BCD\u0BB1\u0BC1\u0BAE\u0BCD "
    ],
    background: [
      "\u0BAA\u0BBF\u0BA9\u0BCD\u0BA9\u0BA3\u0BBF"
    ],
    but: [
      "* ",
      "\u0B86\u0BA9\u0BBE\u0BB2\u0BCD "
    ],
    examples: [
      "\u0B8E\u0B9F\u0BC1\u0BA4\u0BCD\u0BA4\u0BC1\u0B95\u0BCD\u0B95\u0BBE\u0B9F\u0BCD\u0B9F\u0BC1\u0B95\u0BB3\u0BCD",
      "\u0B95\u0BBE\u0B9F\u0BCD\u0B9A\u0BBF\u0B95\u0BB3\u0BCD",
      "\u0BA8\u0BBF\u0BB2\u0BC8\u0BAE\u0BC8\u0B95\u0BB3\u0BBF\u0BB2\u0BCD"
    ],
    feature: [
      "\u0B85\u0BAE\u0BCD\u0B9A\u0BAE\u0BCD",
      "\u0BB5\u0BA3\u0BBF\u0B95 \u0BA4\u0BC7\u0BB5\u0BC8",
      "\u0BA4\u0BBF\u0BB1\u0BA9\u0BCD"
    ],
    given: [
      "* ",
      "\u0B95\u0BC6\u0BBE\u0B9F\u0BC1\u0B95\u0BCD\u0B95\u0BAA\u0BCD\u0BAA\u0B9F\u0BCD\u0B9F "
    ],
    name: "Tamil",
    native: "\u0BA4\u0BAE\u0BBF\u0BB4\u0BCD",
    rule: [
      "Rule"
    ],
    scenario: [
      "\u0B89\u0BA4\u0BBE\u0BB0\u0BA3\u0BAE\u0BBE\u0B95",
      "\u0B95\u0BBE\u0B9F\u0BCD\u0B9A\u0BBF"
    ],
    scenarioOutline: [
      "\u0B95\u0BBE\u0B9F\u0BCD\u0B9A\u0BBF \u0B9A\u0BC1\u0BB0\u0BC1\u0B95\u0BCD\u0B95\u0BAE\u0BCD",
      "\u0B95\u0BBE\u0B9F\u0BCD\u0B9A\u0BBF \u0BB5\u0BBE\u0BB0\u0BCD\u0BAA\u0BCD\u0BAA\u0BC1\u0BB0\u0BC1"
    ],
    then: [
      "* ",
      "\u0B85\u0BAA\u0BCD\u0BAA\u0BC6\u0BBE\u0BB4\u0BC1\u0BA4\u0BC1 "
    ],
    when: [
      "* ",
      "\u0B8E\u0BAA\u0BCD\u0BAA\u0BC7\u0BBE\u0BA4\u0BC1 "
    ]
  },
  th: {
    and: [
      "* ",
      "\u0E41\u0E25\u0E30 "
    ],
    background: [
      "\u0E41\u0E19\u0E27\u0E04\u0E34\u0E14"
    ],
    but: [
      "* ",
      "\u0E41\u0E15\u0E48 "
    ],
    examples: [
      "\u0E0A\u0E38\u0E14\u0E02\u0E2D\u0E07\u0E15\u0E31\u0E27\u0E2D\u0E22\u0E48\u0E32\u0E07",
      "\u0E0A\u0E38\u0E14\u0E02\u0E2D\u0E07\u0E40\u0E2B\u0E15\u0E38\u0E01\u0E32\u0E23\u0E13\u0E4C"
    ],
    feature: [
      "\u0E42\u0E04\u0E23\u0E07\u0E2B\u0E25\u0E31\u0E01",
      "\u0E04\u0E27\u0E32\u0E21\u0E15\u0E49\u0E2D\u0E07\u0E01\u0E32\u0E23\u0E17\u0E32\u0E07\u0E18\u0E38\u0E23\u0E01\u0E34\u0E08",
      "\u0E04\u0E27\u0E32\u0E21\u0E2A\u0E32\u0E21\u0E32\u0E23\u0E16"
    ],
    given: [
      "* ",
      "\u0E01\u0E33\u0E2B\u0E19\u0E14\u0E43\u0E2B\u0E49 "
    ],
    name: "Thai",
    native: "\u0E44\u0E17\u0E22",
    rule: [
      "Rule"
    ],
    scenario: [
      "\u0E40\u0E2B\u0E15\u0E38\u0E01\u0E32\u0E23\u0E13\u0E4C"
    ],
    scenarioOutline: [
      "\u0E2A\u0E23\u0E38\u0E1B\u0E40\u0E2B\u0E15\u0E38\u0E01\u0E32\u0E23\u0E13\u0E4C",
      "\u0E42\u0E04\u0E23\u0E07\u0E2A\u0E23\u0E49\u0E32\u0E07\u0E02\u0E2D\u0E07\u0E40\u0E2B\u0E15\u0E38\u0E01\u0E32\u0E23\u0E13\u0E4C"
    ],
    then: [
      "* ",
      "\u0E14\u0E31\u0E07\u0E19\u0E31\u0E49\u0E19 "
    ],
    when: [
      "* ",
      "\u0E40\u0E21\u0E37\u0E48\u0E2D "
    ]
  },
  te: {
    and: [
      "* ",
      "\u0C2E\u0C30\u0C3F\u0C2F\u0C41 "
    ],
    background: [
      "\u0C28\u0C47\u0C2A\u0C25\u0C4D\u0C2F\u0C02"
    ],
    but: [
      "* ",
      "\u0C15\u0C3E\u0C28\u0C3F "
    ],
    examples: [
      "\u0C09\u0C26\u0C3E\u0C39\u0C30\u0C23\u0C32\u0C41"
    ],
    feature: [
      "\u0C17\u0C41\u0C23\u0C2E\u0C41"
    ],
    given: [
      "* ",
      "\u0C1A\u0C46\u0C2A\u0C4D\u0C2A\u0C2C\u0C21\u0C3F\u0C28\u0C26\u0C3F "
    ],
    name: "Telugu",
    native: "\u0C24\u0C46\u0C32\u0C41\u0C17\u0C41",
    rule: [
      "Rule"
    ],
    scenario: [
      "\u0C09\u0C26\u0C3E\u0C39\u0C30\u0C23",
      "\u0C38\u0C28\u0C4D\u0C28\u0C3F\u0C35\u0C47\u0C36\u0C02"
    ],
    scenarioOutline: [
      "\u0C15\u0C25\u0C28\u0C02"
    ],
    then: [
      "* ",
      "\u0C05\u0C2A\u0C4D\u0C2A\u0C41\u0C21\u0C41 "
    ],
    when: [
      "* ",
      "\u0C08 \u0C2A\u0C30\u0C3F\u0C38\u0C4D\u0C25\u0C3F\u0C24\u0C3F\u0C32\u0C4B "
    ]
  },
  tlh: {
    and: [
      "* ",
      "'ej ",
      "latlh "
    ],
    background: [
      "mo'"
    ],
    but: [
      "* ",
      "'ach ",
      "'a "
    ],
    examples: [
      "ghantoH",
      "lutmey"
    ],
    feature: [
      "Qap",
      "Qu'meH 'ut",
      "perbogh",
      "poQbogh malja'",
      "laH"
    ],
    given: [
      "* ",
      "ghu' noblu' ",
      "DaH ghu' bejlu' "
    ],
    name: "Klingon",
    native: "tlhIngan",
    rule: [
      "Rule"
    ],
    scenario: [
      "lut"
    ],
    scenarioOutline: [
      "lut chovnatlh"
    ],
    then: [
      "* ",
      "vaj "
    ],
    when: [
      "* ",
      "qaSDI' "
    ]
  },
  tr: {
    and: [
      "* ",
      "Ve ",
      "Hem de ",
      "Bir de ",
      "Ayr\u0131ca ",
      "\u0130laveten ",
      "Buna ek olarak "
    ],
    background: [
      "Ge\xE7mi\u015F",
      "Arka Plan",
      "\xD6n Ko\u015Ful",
      "\xD6nko\u015Ful",
      "\xD6nceki Durum",
      "Giri\u015F",
      "Mukaddime",
      "Mevcut Durum"
    ],
    but: [
      "* ",
      "Fakat ",
      "Ama ",
      "Ancak ",
      "Yaln\u0131z ",
      "Lakin ",
      "Me\u011Fer ki ",
      "Buna mukabil ",
      "Aksi halde "
    ],
    examples: [
      "\xD6rnekler",
      "De\u011Ferler"
    ],
    feature: [
      "\xD6zellik",
      "\u0130\u015F Gereksinimi",
      "Gereksinim",
      "\u0130\u015Flev",
      "Kullan\u0131c\u0131 Hikayesi",
      "Yetenek",
      "Teknik Gereksinim"
    ],
    given: [
      "* ",
      "Mevcut ",
      "\xD6nceden ",
      "Ge\xE7mi\u015Fte ",
      "Daha \xF6nce ",
      "Halihaz\u0131rda ",
      "Zaten ",
      "Sistemde ",
      "Diyelim ki ",
      "Varsayal\u0131m ki ",
      "Farz edelim ki ",
      "Kabul edelim ki ",
      "Ba\u015Flang\u0131\xE7ta ",
      "Varsay\u0131lan olarak ",
      "Biliniyor ki "
    ],
    name: "Turkish",
    native: "T\xFCrk\xE7e",
    rule: [
      "Kural",
      "\u0130\u015F Kural\u0131",
      "Kaide",
      "H\xFCk\xFCm",
      "Madde"
    ],
    scenario: [
      "\xD6rnek",
      "Senaryo",
      "Durum",
      "Vaka"
    ],
    scenarioOutline: [
      "Senaryo tasla\u011F\u0131",
      "Senaryo \u015Fablonu"
    ],
    then: [
      "* ",
      "Beklenen ",
      "O zaman ",
      "Sonu\xE7 olarak ",
      "B\xF6ylece ",
      "Bunun \xFCzerine ",
      "Bu durumda ",
      "O takdirde ",
      "\u015Eu halde ",
      "Netice itibariyle ",
      "Buna binaen "
    ],
    when: [
      "* ",
      "E\u011Fer ",
      "E\u011Fer ki ",
      "Ne zaman ",
      "Ne zaman ki ",
      "\u015Eayet "
    ]
  },
  tt: {
    and: [
      "* ",
      "\u04BA\u04D9\u043C ",
      "\u0412\u04D9 "
    ],
    background: [
      "\u041A\u0435\u0440\u0435\u0448"
    ],
    but: [
      "* ",
      "\u041B\u04D9\u043A\u0438\u043D ",
      "\u04D8\u043C\u043C\u0430 "
    ],
    examples: [
      "\u04AE\u0440\u043D\u04D9\u043A\u043B\u04D9\u0440",
      "\u041C\u0438\u0441\u0430\u043B\u043B\u0430\u0440"
    ],
    feature: [
      "\u041C\u04E9\u043C\u043A\u0438\u043D\u043B\u0435\u043A",
      "\u04AE\u0437\u0435\u043D\u0447\u04D9\u043B\u0435\u043A\u043B\u0435\u043B\u0435\u043A"
    ],
    given: [
      "* ",
      "\u04D8\u0439\u0442\u0438\u043A "
    ],
    name: "Tatar",
    native: "\u0422\u0430\u0442\u0430\u0440\u0447\u0430",
    rule: [
      "Rule"
    ],
    scenario: [
      "\u0421\u0446\u0435\u043D\u0430\u0440\u0438\u0439"
    ],
    scenarioOutline: [
      "\u0421\u0446\u0435\u043D\u0430\u0440\u0438\u0439\u043D\u044B\u04A3 \u0442\u04E9\u0437\u0435\u043B\u0435\u0448\u0435"
    ],
    then: [
      "* ",
      "\u041D\u04D9\u0442\u0438\u0497\u04D9\u0434\u04D9 "
    ],
    when: [
      "* ",
      "\u04D8\u0433\u04D9\u0440 "
    ]
  },
  uk: {
    and: [
      "* ",
      "\u0406 ",
      "\u0410 \u0442\u0430\u043A\u043E\u0436 ",
      "\u0422\u0430 "
    ],
    background: [
      "\u041F\u0435\u0440\u0435\u0434\u0443\u043C\u043E\u0432\u0430"
    ],
    but: [
      "* ",
      "\u0410\u043B\u0435 "
    ],
    examples: [
      "\u041F\u0440\u0438\u043A\u043B\u0430\u0434\u0438"
    ],
    feature: [
      "\u0424\u0443\u043D\u043A\u0446\u0456\u043E\u043D\u0430\u043B"
    ],
    given: [
      "* ",
      "\u041F\u0440\u0438\u043F\u0443\u0441\u0442\u0438\u043C\u043E ",
      "\u041F\u0440\u0438\u043F\u0443\u0441\u0442\u0438\u043C\u043E, \u0449\u043E ",
      "\u041D\u0435\u0445\u0430\u0439 ",
      "\u0414\u0430\u043D\u043E "
    ],
    name: "Ukrainian",
    native: "\u0423\u043A\u0440\u0430\u0457\u043D\u0441\u044C\u043A\u0430",
    rule: [
      "Rule"
    ],
    scenario: [
      "\u041F\u0440\u0438\u043A\u043B\u0430\u0434",
      "\u0421\u0446\u0435\u043D\u0430\u0440\u0456\u0439"
    ],
    scenarioOutline: [
      "\u0421\u0442\u0440\u0443\u043A\u0442\u0443\u0440\u0430 \u0441\u0446\u0435\u043D\u0430\u0440\u0456\u044E"
    ],
    then: [
      "* ",
      "\u0422\u043E ",
      "\u0422\u043E\u0434\u0456 "
    ],
    when: [
      "* ",
      "\u042F\u043A\u0449\u043E ",
      "\u041A\u043E\u043B\u0438 "
    ]
  },
  ur: {
    and: [
      "* ",
      "\u0627\u0648\u0631 "
    ],
    background: [
      "\u067E\u0633 \u0645\u0646\u0638\u0631"
    ],
    but: [
      "* ",
      "\u0644\u06CC\u06A9\u0646 "
    ],
    examples: [
      "\u0645\u062B\u0627\u0644\u06CC\u06BA"
    ],
    feature: [
      "\u0635\u0644\u0627\u062D\u06CC\u062A",
      "\u06A9\u0627\u0631\u0648\u0628\u0627\u0631 \u06A9\u06CC \u0636\u0631\u0648\u0631\u062A",
      "\u062E\u0635\u0648\u0635\u06CC\u062A"
    ],
    given: [
      "* ",
      "\u0627\u06AF\u0631 ",
      "\u0628\u0627\u0644\u0641\u0631\u0636 ",
      "\u0641\u0631\u0636 \u06A9\u06CC\u0627 "
    ],
    name: "Urdu",
    native: "\u0627\u0631\u062F\u0648",
    rule: [
      "Rule"
    ],
    scenario: [
      "\u0645\u0646\u0638\u0631\u0646\u0627\u0645\u06C1"
    ],
    scenarioOutline: [
      "\u0645\u0646\u0638\u0631 \u0646\u0627\u0645\u06D2 \u06A9\u0627 \u062E\u0627\u06A9\u06C1"
    ],
    then: [
      "* ",
      "\u067E\u06BE\u0631 ",
      "\u062A\u0628 "
    ],
    when: [
      "* ",
      "\u062C\u0628 "
    ]
  },
  uz: {
    and: [
      "* ",
      "\u0412\u0430 "
    ],
    background: [
      "\u0422\u0430\u0440\u0438\u0445"
    ],
    but: [
      "* ",
      "\u041B\u0435\u043A\u0438\u043D ",
      "\u0411\u0438\u0440\u043E\u043A ",
      "\u0410\u043C\u043C\u043E "
    ],
    examples: [
      "\u041C\u0438\u0441\u043E\u043B\u043B\u0430\u0440"
    ],
    feature: [
      "\u0424\u0443\u043D\u043A\u0446\u0438\u043E\u043D\u0430\u043B"
    ],
    given: [
      "* ",
      "Belgilangan "
    ],
    name: "Uzbek",
    native: "\u0423\u0437\u0431\u0435\u043A\u0447\u0430",
    rule: [
      "Rule"
    ],
    scenario: [
      "\u0421\u0446\u0435\u043D\u0430\u0440\u0438\u0439"
    ],
    scenarioOutline: [
      "\u0421\u0446\u0435\u043D\u0430\u0440\u0438\u0439 \u0441\u0442\u0440\u0443\u043A\u0442\u0443\u0440\u0430\u0441\u0438"
    ],
    then: [
      "* ",
      "\u0423\u043D\u0434\u0430 "
    ],
    when: [
      "* ",
      "\u0410\u0433\u0430\u0440 "
    ]
  },
  vi: {
    and: [
      "* ",
      "V\xE0 "
    ],
    background: [
      "B\u1ED1i c\u1EA3nh"
    ],
    but: [
      "* ",
      "Nh\u01B0ng "
    ],
    examples: [
      "D\u1EEF li\u1EC7u"
    ],
    feature: [
      "T\xEDnh n\u0103ng"
    ],
    given: [
      "* ",
      "Bi\u1EBFt ",
      "Cho "
    ],
    name: "Vietnamese",
    native: "Ti\u1EBFng Vi\u1EC7t",
    rule: [
      "Quy t\u1EAFc"
    ],
    scenario: [
      "T\xECnh hu\u1ED1ng",
      "K\u1ECBch b\u1EA3n"
    ],
    scenarioOutline: [
      "Khung t\xECnh hu\u1ED1ng",
      "Khung k\u1ECBch b\u1EA3n"
    ],
    then: [
      "* ",
      "Th\xEC "
    ],
    when: [
      "* ",
      "Khi "
    ]
  },
  "zh-CN": {
    and: [
      "* ",
      "\u800C\u4E14",
      "\u5E76\u4E14",
      "\u540C\u65F6"
    ],
    background: [
      "\u80CC\u666F"
    ],
    but: [
      "* ",
      "\u4F46\u662F"
    ],
    examples: [
      "\u4F8B\u5B50"
    ],
    feature: [
      "\u529F\u80FD"
    ],
    given: [
      "* ",
      "\u5047\u5982",
      "\u5047\u8BBE",
      "\u5047\u5B9A"
    ],
    name: "Chinese simplified",
    native: "\u7B80\u4F53\u4E2D\u6587",
    rule: [
      "Rule",
      "\u89C4\u5219"
    ],
    scenario: [
      "\u573A\u666F",
      "\u5267\u672C"
    ],
    scenarioOutline: [
      "\u573A\u666F\u5927\u7EB2",
      "\u5267\u672C\u5927\u7EB2"
    ],
    then: [
      "* ",
      "\u90A3\u4E48"
    ],
    when: [
      "* ",
      "\u5F53"
    ]
  },
  ml: {
    and: [
      "* ",
      "\u0D12\u0D2A\u0D4D\u0D2A\u0D02"
    ],
    background: [
      "\u0D2A\u0D36\u0D4D\u0D1A\u0D3E\u0D24\u0D4D\u0D24\u0D32\u0D02"
    ],
    but: [
      "* ",
      "\u0D2A\u0D15\u0D4D\u0D37\u0D47"
    ],
    examples: [
      "\u0D09\u0D26\u0D3E\u0D39\u0D30\u0D23\u0D19\u0D4D\u0D19\u0D7E"
    ],
    feature: [
      "\u0D38\u0D35\u0D3F\u0D36\u0D47\u0D37\u0D24"
    ],
    given: [
      "* ",
      "\u0D28\u0D7D\u0D15\u0D3F\u0D2F\u0D24\u0D4D"
    ],
    name: "Malayalam",
    native: "\u0D2E\u0D32\u0D2F\u0D3E\u0D33\u0D02",
    rule: [
      "\u0D28\u0D3F\u0D2F\u0D2E\u0D02"
    ],
    scenario: [
      "\u0D30\u0D02\u0D17\u0D02"
    ],
    scenarioOutline: [
      "\u0D38\u0D3E\u0D39\u0D1A\u0D30\u0D4D\u0D2F\u0D24\u0D4D\u0D24\u0D3F\u0D28\u0D4D\u0D31\u0D46 \u0D30\u0D42\u0D2A\u0D30\u0D47\u0D16"
    ],
    then: [
      "* ",
      "\u0D2A\u0D3F\u0D28\u0D4D\u0D28\u0D46"
    ],
    when: [
      "\u0D0E\u0D2A\u0D4D\u0D2A\u0D47\u0D3E\u0D7E"
    ]
  },
  "zh-TW": {
    and: [
      "* ",
      "\u800C\u4E14",
      "\u4E26\u4E14",
      "\u540C\u6642"
    ],
    background: [
      "\u80CC\u666F"
    ],
    but: [
      "* ",
      "\u4F46\u662F"
    ],
    examples: [
      "\u4F8B\u5B50"
    ],
    feature: [
      "\u529F\u80FD"
    ],
    given: [
      "* ",
      "\u5047\u5982",
      "\u5047\u8A2D",
      "\u5047\u5B9A"
    ],
    name: "Chinese traditional",
    native: "\u7E41\u9AD4\u4E2D\u6587",
    rule: [
      "Rule"
    ],
    scenario: [
      "\u5834\u666F",
      "\u5287\u672C"
    ],
    scenarioOutline: [
      "\u5834\u666F\u5927\u7DB1",
      "\u5287\u672C\u5927\u7DB1"
    ],
    then: [
      "* ",
      "\u90A3\u9EBC"
    ],
    when: [
      "* ",
      "\u7576"
    ]
  },
  mr: {
    and: [
      "* ",
      "\u0906\u0923\u093F ",
      "\u0924\u0938\u0947\u091A "
    ],
    background: [
      "\u092A\u093E\u0930\u094D\u0936\u094D\u0935\u092D\u0942\u092E\u0940"
    ],
    but: [
      "* ",
      "\u092A\u0923 ",
      "\u092A\u0930\u0902\u0924\u0941 "
    ],
    examples: [
      "\u0909\u0926\u093E\u0939\u0930\u0923"
    ],
    feature: [
      "\u0935\u0948\u0936\u093F\u0937\u094D\u091F\u094D\u092F",
      "\u0938\u0941\u0935\u093F\u0927\u093E"
    ],
    given: [
      "* ",
      "\u091C\u0930",
      "\u0926\u093F\u0932\u0947\u0932\u094D\u092F\u093E \u092A\u094D\u0930\u092E\u093E\u0923\u0947 "
    ],
    name: "Marathi",
    native: "\u092E\u0930\u093E\u0920\u0940",
    rule: [
      "\u0928\u093F\u092F\u092E"
    ],
    scenario: [
      "\u092A\u0930\u093F\u0926\u0943\u0936\u094D\u092F"
    ],
    scenarioOutline: [
      "\u092A\u0930\u093F\u0926\u0943\u0936\u094D\u092F \u0930\u0942\u092A\u0930\u0947\u0916\u093E"
    ],
    then: [
      "* ",
      "\u092E\u0917 ",
      "\u0924\u0947\u0935\u094D\u0939\u093E "
    ],
    when: [
      "* ",
      "\u091C\u0947\u0935\u094D\u0939\u093E "
    ]
  },
  amh: {
    and: [
      "* ",
      "\u12A5\u1293 "
    ],
    background: [
      "\u1245\u12F5\u1218 \u1201\u1294\u1273",
      "\u1218\u1290\u123B",
      "\u1218\u1290\u123B \u1200\u1233\u1265"
    ],
    but: [
      "* ",
      "\u130D\u1295 "
    ],
    examples: [
      "\u121D\u1233\u120C\u12CE\u127D",
      "\u1201\u1293\u1274\u12CE\u127D"
    ],
    feature: [
      "\u1235\u122B",
      "\u12E8\u1270\u1348\u1208\u1308\u12CD \u1235\u122B",
      "\u12E8\u121A\u1348\u1208\u1308\u12CD \u12F5\u122D\u130A\u1275"
    ],
    given: [
      "* ",
      "\u12E8\u1270\u1230\u1320 "
    ],
    name: "Amharic",
    native: "\u12A0\u121B\u122D\u129B",
    rule: [
      "\u1205\u130D"
    ],
    scenario: [
      "\u121D\u1233\u120C",
      "\u1201\u1293\u1274"
    ],
    scenarioOutline: [
      "\u1201\u1293\u1274 \u12DD\u122D\u12DD\u122D",
      "\u1201\u1293\u1274 \u12A0\u1265\u1290\u1275"
    ],
    then: [
      "* ",
      "\u12A8\u12DA\u12EB "
    ],
    when: [
      "* ",
      "\u1218\u127C "
    ]
  }
};

// node_modules/@cucumber/gherkin/dist/GherkinClassicTokenMatcher.js
var DIALECT_DICT = gherkin_languages_default;
var LANGUAGE_PATTERN = /^\s*#\s*language\s*:\s*([a-zA-Z\-_]+)\s*$/;
function addKeywordTypeMappings(h, keywords, keywordType) {
  for (const k of keywords) {
    if (!(k in h)) {
      h[k] = [];
    }
    h[k].push(keywordType);
  }
}
var GherkinClassicTokenMatcher = class {
  defaultDialectName;
  dialect;
  dialectName;
  activeDocStringSeparator;
  indentToRemove;
  keywordTypesMap;
  sortedStepKeywords;
  constructor(defaultDialectName = "en") {
    this.defaultDialectName = defaultDialectName;
    this.reset();
  }
  changeDialect(newDialectName, location) {
    const newDialect = DIALECT_DICT[newDialectName];
    if (!newDialect) {
      throw NoSuchLanguageException.create(newDialectName, location);
    }
    this.dialectName = newDialectName;
    this.dialect = newDialect;
    this.initializeKeywordTypes();
    this.initializeSortedStepKeywords();
  }
  reset() {
    if (this.dialectName !== this.defaultDialectName) {
      this.changeDialect(this.defaultDialectName);
    }
    this.activeDocStringSeparator = null;
    this.indentToRemove = 0;
  }
  initializeKeywordTypes() {
    this.keywordTypesMap = {};
    addKeywordTypeMappings(this.keywordTypesMap, this.dialect.given, StepKeywordType.CONTEXT);
    addKeywordTypeMappings(this.keywordTypesMap, this.dialect.when, StepKeywordType.ACTION);
    addKeywordTypeMappings(this.keywordTypesMap, this.dialect.then, StepKeywordType.OUTCOME);
    addKeywordTypeMappings(this.keywordTypesMap, [].concat(this.dialect.and).concat(this.dialect.but), StepKeywordType.CONJUNCTION);
  }
  initializeSortedStepKeywords() {
    this.sortedStepKeywords = [].concat(this.dialect.given).concat(this.dialect.when).concat(this.dialect.then).concat(this.dialect.and).concat(this.dialect.but).sort(compareStepKeywords);
  }
  match_TagLine(token) {
    if (token.line.startsWith("@")) {
      this.setTokenMatched(token, TokenType.TagLine, null, null, null, null, this.getTags(token.line));
      return true;
    }
    return false;
  }
  match_FeatureLine(token) {
    return this.matchTitleLine(token, TokenType.FeatureLine, this.dialect.feature);
  }
  match_ScenarioLine(token) {
    return this.matchTitleLine(token, TokenType.ScenarioLine, this.dialect.scenario) || this.matchTitleLine(token, TokenType.ScenarioLine, this.dialect.scenarioOutline);
  }
  match_BackgroundLine(token) {
    return this.matchTitleLine(token, TokenType.BackgroundLine, this.dialect.background);
  }
  match_ExamplesLine(token) {
    return this.matchTitleLine(token, TokenType.ExamplesLine, this.dialect.examples);
  }
  match_RuleLine(token) {
    return this.matchTitleLine(token, TokenType.RuleLine, this.dialect.rule);
  }
  match_TableRow(token) {
    if (token.line.startsWith("|")) {
      this.setTokenMatched(token, TokenType.TableRow, null, null, null, null, token.line.getTableCells());
      return true;
    }
    return false;
  }
  match_Empty(token) {
    if (token.line.isEmpty) {
      this.setTokenMatched(token, TokenType.Empty, null, null, 0);
      return true;
    }
    return false;
  }
  match_Comment(token) {
    if (token.line.startsWith("#")) {
      const text = token.line.getLineText(0);
      this.setTokenMatched(token, TokenType.Comment, text, null, 0);
      return true;
    }
    return false;
  }
  match_Language(token) {
    const match = token.line.trimmedLineText.match(LANGUAGE_PATTERN);
    if (match) {
      const newDialectName = match[1];
      this.setTokenMatched(token, TokenType.Language, newDialectName);
      this.changeDialect(newDialectName, token.location);
      return true;
    }
    return false;
  }
  match_DocStringSeparator(token) {
    return this.activeDocStringSeparator == null ? (
      // open
      this._match_DocStringSeparator(token, '"""', true) || this._match_DocStringSeparator(token, "```", true)
    ) : (
      // close
      this._match_DocStringSeparator(token, this.activeDocStringSeparator, false)
    );
  }
  _match_DocStringSeparator(token, separator, isOpen) {
    if (token.line.startsWith(separator)) {
      let mediaType = null;
      if (isOpen) {
        mediaType = token.line.getRestTrimmed(separator.length);
        this.activeDocStringSeparator = separator;
        this.indentToRemove = token.line.indent;
      } else {
        this.activeDocStringSeparator = null;
        this.indentToRemove = 0;
      }
      this.setTokenMatched(token, TokenType.DocStringSeparator, mediaType, separator);
      return true;
    }
    return false;
  }
  match_EOF(token) {
    if (token.isEof) {
      this.setTokenMatched(token, TokenType.EOF);
      return true;
    }
    return false;
  }
  match_StepLine(token) {
    for (const keyword of this.sortedStepKeywords) {
      if (token.line.startsWith(keyword)) {
        const title = token.line.getRestTrimmed(keyword.length);
        const keywordTypes = this.keywordTypesMap[keyword];
        let keywordType = keywordTypes[0];
        if (keywordTypes.length > 1) {
          keywordType = StepKeywordType.UNKNOWN;
        }
        this.setTokenMatched(token, TokenType.StepLine, title, keyword, null, keywordType);
        return true;
      }
    }
    return false;
  }
  match_Other(token) {
    const text = token.line.getLineText(this.indentToRemove);
    this.setTokenMatched(token, TokenType.Other, this.unescapeDocString(text), null, 0);
    return true;
  }
  getTags(line) {
    const uncommentedLine = line.trimmedLineText.split(/\s#/g, 2)[0];
    let column = line.indent + 1;
    const items = uncommentedLine.split("@");
    const tags = [];
    for (let i = 0; i < items.length; i++) {
      const item = items[i].trimRight();
      if (item.length === 0) {
        continue;
      }
      if (!item.match(/^\S+$/)) {
        throw ParserException.create("A tag may not contain whitespace", line.lineNumber, column);
      }
      const span = { column, text: `@${item}` };
      tags.push(span);
      column += countSymbols(items[i]) + 1;
    }
    return tags;
  }
  matchTitleLine(token, tokenType, keywords) {
    for (const keyword of keywords) {
      if (token.line.startsWithTitleKeyword(keyword)) {
        const title = token.line.getRestTrimmed(keyword.length + ":".length);
        this.setTokenMatched(token, tokenType, title, keyword);
        return true;
      }
    }
    return false;
  }
  setTokenMatched(token, matchedType, text, keyword, indent, keywordType, items) {
    token.matchedType = matchedType;
    token.matchedText = text;
    token.matchedKeyword = keyword;
    token.matchedKeywordType = keywordType;
    token.matchedIndent = typeof indent === "number" ? indent : token.line == null ? 0 : token.line.indent;
    token.matchedItems = items || [];
    token.location.column = token.matchedIndent + 1;
    token.matchedGherkinDialect = this.dialectName;
  }
  unescapeDocString(text) {
    if (this.activeDocStringSeparator === '"""') {
      return text.replace('\\"\\"\\"', '"""');
    }
    if (this.activeDocStringSeparator === "```") {
      return text.replace("\\`\\`\\`", "```");
    }
    return text;
  }
};

// node_modules/@cucumber/gherkin/dist/GherkinInMarkdownTokenMatcher.js
var KeywordPrefix;
(function(KeywordPrefix2) {
  KeywordPrefix2["BULLET"] = "^(\\s*[*+-]\\s*)";
  KeywordPrefix2["HEADER"] = "^(#{1,6}\\s)";
})(KeywordPrefix || (KeywordPrefix = {}));

// node_modules/@cucumber/gherkin/dist/pickles/compile.js
var pickleStepTypeFromKeyword = {
  [StepKeywordType.UNKNOWN]: PickleStepType.UNKNOWN,
  [StepKeywordType.CONTEXT]: PickleStepType.CONTEXT,
  [StepKeywordType.ACTION]: PickleStepType.ACTION,
  [StepKeywordType.OUTCOME]: PickleStepType.OUTCOME,
  [StepKeywordType.CONJUNCTION]: null
};

// node_modules/@cucumber/messages/dist/esm/src/IdGenerator.js
var IdGenerator_exports = {};
__export(IdGenerator_exports, {
  incrementing: () => incrementing,
  uuid: () => uuid
});
function uuid() {
  return () => crypto.randomUUID();
}
function incrementing() {
  let next = 0;
  return () => (next++).toString();
}

// node_modules/@cucumber/messages/dist/esm/src/messages.js
var import_class_transformer = __toESM(require_cjs(), 1);
var import_reflect_metadata = __toESM(require_Reflect(), 1);
var __decorate = function(decorators, target, key, desc) {
  var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
  if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
  else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
  return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var Attachment = class {
  constructor() {
    this.body = "";
    this.contentEncoding = AttachmentContentEncoding2.IDENTITY;
    this.mediaType = "";
  }
};
__decorate([
  (0, import_class_transformer.Type)(() => Source)
], Attachment.prototype, "source", void 0);
__decorate([
  (0, import_class_transformer.Type)(() => Timestamp)
], Attachment.prototype, "timestamp", void 0);
var Duration = class {
  constructor() {
    this.seconds = 0;
    this.nanos = 0;
  }
};
var Envelope = class {
};
__decorate([
  (0, import_class_transformer.Type)(() => Attachment)
], Envelope.prototype, "attachment", void 0);
__decorate([
  (0, import_class_transformer.Type)(() => ExternalAttachment)
], Envelope.prototype, "externalAttachment", void 0);
__decorate([
  (0, import_class_transformer.Type)(() => GherkinDocument)
], Envelope.prototype, "gherkinDocument", void 0);
__decorate([
  (0, import_class_transformer.Type)(() => Hook)
], Envelope.prototype, "hook", void 0);
__decorate([
  (0, import_class_transformer.Type)(() => Meta)
], Envelope.prototype, "meta", void 0);
__decorate([
  (0, import_class_transformer.Type)(() => ParameterType)
], Envelope.prototype, "parameterType", void 0);
__decorate([
  (0, import_class_transformer.Type)(() => ParseError)
], Envelope.prototype, "parseError", void 0);
__decorate([
  (0, import_class_transformer.Type)(() => Pickle)
], Envelope.prototype, "pickle", void 0);
__decorate([
  (0, import_class_transformer.Type)(() => Suggestion)
], Envelope.prototype, "suggestion", void 0);
__decorate([
  (0, import_class_transformer.Type)(() => Source)
], Envelope.prototype, "source", void 0);
__decorate([
  (0, import_class_transformer.Type)(() => StepDefinition)
], Envelope.prototype, "stepDefinition", void 0);
__decorate([
  (0, import_class_transformer.Type)(() => TestCase)
], Envelope.prototype, "testCase", void 0);
__decorate([
  (0, import_class_transformer.Type)(() => TestCaseFinished)
], Envelope.prototype, "testCaseFinished", void 0);
__decorate([
  (0, import_class_transformer.Type)(() => TestCaseStarted)
], Envelope.prototype, "testCaseStarted", void 0);
__decorate([
  (0, import_class_transformer.Type)(() => TestRunFinished)
], Envelope.prototype, "testRunFinished", void 0);
__decorate([
  (0, import_class_transformer.Type)(() => TestRunStarted)
], Envelope.prototype, "testRunStarted", void 0);
__decorate([
  (0, import_class_transformer.Type)(() => TestStepFinished)
], Envelope.prototype, "testStepFinished", void 0);
__decorate([
  (0, import_class_transformer.Type)(() => TestStepStarted)
], Envelope.prototype, "testStepStarted", void 0);
__decorate([
  (0, import_class_transformer.Type)(() => TestRunHookStarted)
], Envelope.prototype, "testRunHookStarted", void 0);
__decorate([
  (0, import_class_transformer.Type)(() => TestRunHookFinished)
], Envelope.prototype, "testRunHookFinished", void 0);
__decorate([
  (0, import_class_transformer.Type)(() => UndefinedParameterType)
], Envelope.prototype, "undefinedParameterType", void 0);
var Exception = class {
  constructor() {
    this.type = "";
  }
};
var ExternalAttachment = class {
  constructor() {
    this.url = "";
    this.mediaType = "";
  }
};
__decorate([
  (0, import_class_transformer.Type)(() => Timestamp)
], ExternalAttachment.prototype, "timestamp", void 0);
var GherkinDocument = class {
  constructor() {
    this.comments = [];
  }
};
__decorate([
  (0, import_class_transformer.Type)(() => Feature)
], GherkinDocument.prototype, "feature", void 0);
__decorate([
  (0, import_class_transformer.Type)(() => Comment)
], GherkinDocument.prototype, "comments", void 0);
var Background = class {
  constructor() {
    this.location = new Location();
    this.keyword = "";
    this.name = "";
    this.description = "";
    this.steps = [];
    this.id = "";
  }
};
__decorate([
  (0, import_class_transformer.Type)(() => Location)
], Background.prototype, "location", void 0);
__decorate([
  (0, import_class_transformer.Type)(() => Step)
], Background.prototype, "steps", void 0);
var Comment = class {
  constructor() {
    this.location = new Location();
    this.text = "";
  }
};
__decorate([
  (0, import_class_transformer.Type)(() => Location)
], Comment.prototype, "location", void 0);
var DataTable = class {
  constructor() {
    this.location = new Location();
    this.rows = [];
  }
};
__decorate([
  (0, import_class_transformer.Type)(() => Location)
], DataTable.prototype, "location", void 0);
__decorate([
  (0, import_class_transformer.Type)(() => TableRow)
], DataTable.prototype, "rows", void 0);
var DocString = class {
  constructor() {
    this.location = new Location();
    this.content = "";
    this.delimiter = "";
  }
};
__decorate([
  (0, import_class_transformer.Type)(() => Location)
], DocString.prototype, "location", void 0);
var Examples = class {
  constructor() {
    this.location = new Location();
    this.tags = [];
    this.keyword = "";
    this.name = "";
    this.description = "";
    this.tableBody = [];
    this.id = "";
  }
};
__decorate([
  (0, import_class_transformer.Type)(() => Location)
], Examples.prototype, "location", void 0);
__decorate([
  (0, import_class_transformer.Type)(() => Tag)
], Examples.prototype, "tags", void 0);
__decorate([
  (0, import_class_transformer.Type)(() => TableRow)
], Examples.prototype, "tableHeader", void 0);
__decorate([
  (0, import_class_transformer.Type)(() => TableRow)
], Examples.prototype, "tableBody", void 0);
var Feature = class {
  constructor() {
    this.location = new Location();
    this.tags = [];
    this.language = "";
    this.keyword = "";
    this.name = "";
    this.description = "";
    this.children = [];
  }
};
__decorate([
  (0, import_class_transformer.Type)(() => Location)
], Feature.prototype, "location", void 0);
__decorate([
  (0, import_class_transformer.Type)(() => Tag)
], Feature.prototype, "tags", void 0);
__decorate([
  (0, import_class_transformer.Type)(() => FeatureChild)
], Feature.prototype, "children", void 0);
var FeatureChild = class {
};
__decorate([
  (0, import_class_transformer.Type)(() => Rule)
], FeatureChild.prototype, "rule", void 0);
__decorate([
  (0, import_class_transformer.Type)(() => Background)
], FeatureChild.prototype, "background", void 0);
__decorate([
  (0, import_class_transformer.Type)(() => Scenario)
], FeatureChild.prototype, "scenario", void 0);
var Rule = class {
  constructor() {
    this.location = new Location();
    this.tags = [];
    this.keyword = "";
    this.name = "";
    this.description = "";
    this.children = [];
    this.id = "";
  }
};
__decorate([
  (0, import_class_transformer.Type)(() => Location)
], Rule.prototype, "location", void 0);
__decorate([
  (0, import_class_transformer.Type)(() => Tag)
], Rule.prototype, "tags", void 0);
__decorate([
  (0, import_class_transformer.Type)(() => RuleChild)
], Rule.prototype, "children", void 0);
var RuleChild = class {
};
__decorate([
  (0, import_class_transformer.Type)(() => Background)
], RuleChild.prototype, "background", void 0);
__decorate([
  (0, import_class_transformer.Type)(() => Scenario)
], RuleChild.prototype, "scenario", void 0);
var Scenario = class {
  constructor() {
    this.location = new Location();
    this.tags = [];
    this.keyword = "";
    this.name = "";
    this.description = "";
    this.steps = [];
    this.examples = [];
    this.id = "";
  }
};
__decorate([
  (0, import_class_transformer.Type)(() => Location)
], Scenario.prototype, "location", void 0);
__decorate([
  (0, import_class_transformer.Type)(() => Tag)
], Scenario.prototype, "tags", void 0);
__decorate([
  (0, import_class_transformer.Type)(() => Step)
], Scenario.prototype, "steps", void 0);
__decorate([
  (0, import_class_transformer.Type)(() => Examples)
], Scenario.prototype, "examples", void 0);
var Step = class {
  constructor() {
    this.location = new Location();
    this.keyword = "";
    this.text = "";
    this.id = "";
  }
};
__decorate([
  (0, import_class_transformer.Type)(() => Location)
], Step.prototype, "location", void 0);
__decorate([
  (0, import_class_transformer.Type)(() => DocString)
], Step.prototype, "docString", void 0);
__decorate([
  (0, import_class_transformer.Type)(() => DataTable)
], Step.prototype, "dataTable", void 0);
var TableCell = class {
  constructor() {
    this.location = new Location();
    this.value = "";
  }
};
__decorate([
  (0, import_class_transformer.Type)(() => Location)
], TableCell.prototype, "location", void 0);
var TableRow = class {
  constructor() {
    this.location = new Location();
    this.cells = [];
    this.id = "";
  }
};
__decorate([
  (0, import_class_transformer.Type)(() => Location)
], TableRow.prototype, "location", void 0);
__decorate([
  (0, import_class_transformer.Type)(() => TableCell)
], TableRow.prototype, "cells", void 0);
var Tag = class {
  constructor() {
    this.location = new Location();
    this.name = "";
    this.id = "";
  }
};
__decorate([
  (0, import_class_transformer.Type)(() => Location)
], Tag.prototype, "location", void 0);
var Hook = class {
  constructor() {
    this.id = "";
    this.sourceReference = new SourceReference();
  }
};
__decorate([
  (0, import_class_transformer.Type)(() => SourceReference)
], Hook.prototype, "sourceReference", void 0);
var Location = class {
  constructor() {
    this.line = 0;
  }
};
var Meta = class {
  constructor() {
    this.protocolVersion = "";
    this.implementation = new Product();
    this.runtime = new Product();
    this.os = new Product();
    this.cpu = new Product();
  }
};
__decorate([
  (0, import_class_transformer.Type)(() => Product)
], Meta.prototype, "implementation", void 0);
__decorate([
  (0, import_class_transformer.Type)(() => Product)
], Meta.prototype, "runtime", void 0);
__decorate([
  (0, import_class_transformer.Type)(() => Product)
], Meta.prototype, "os", void 0);
__decorate([
  (0, import_class_transformer.Type)(() => Product)
], Meta.prototype, "cpu", void 0);
__decorate([
  (0, import_class_transformer.Type)(() => Ci)
], Meta.prototype, "ci", void 0);
var Ci = class {
  constructor() {
    this.name = "";
  }
};
__decorate([
  (0, import_class_transformer.Type)(() => Git)
], Ci.prototype, "git", void 0);
var Git = class {
  constructor() {
    this.remote = "";
    this.revision = "";
  }
};
var Product = class {
  constructor() {
    this.name = "";
  }
};
var ParameterType = class {
  constructor() {
    this.name = "";
    this.regularExpressions = [];
    this.preferForRegularExpressionMatch = false;
    this.useForSnippets = false;
    this.id = "";
  }
};
__decorate([
  (0, import_class_transformer.Type)(() => SourceReference)
], ParameterType.prototype, "sourceReference", void 0);
var ParseError = class {
  constructor() {
    this.source = new SourceReference();
    this.message = "";
  }
};
__decorate([
  (0, import_class_transformer.Type)(() => SourceReference)
], ParseError.prototype, "source", void 0);
var Pickle = class {
  constructor() {
    this.id = "";
    this.uri = "";
    this.name = "";
    this.language = "";
    this.steps = [];
    this.tags = [];
    this.astNodeIds = [];
  }
};
__decorate([
  (0, import_class_transformer.Type)(() => Location)
], Pickle.prototype, "location", void 0);
__decorate([
  (0, import_class_transformer.Type)(() => PickleStep)
], Pickle.prototype, "steps", void 0);
__decorate([
  (0, import_class_transformer.Type)(() => PickleTag)
], Pickle.prototype, "tags", void 0);
var PickleDocString = class {
  constructor() {
    this.content = "";
  }
};
var PickleStep = class {
  constructor() {
    this.astNodeIds = [];
    this.id = "";
    this.text = "";
  }
};
__decorate([
  (0, import_class_transformer.Type)(() => PickleStepArgument)
], PickleStep.prototype, "argument", void 0);
var PickleStepArgument = class {
};
__decorate([
  (0, import_class_transformer.Type)(() => PickleDocString)
], PickleStepArgument.prototype, "docString", void 0);
__decorate([
  (0, import_class_transformer.Type)(() => PickleTable)
], PickleStepArgument.prototype, "dataTable", void 0);
var PickleTable = class {
  constructor() {
    this.rows = [];
  }
};
__decorate([
  (0, import_class_transformer.Type)(() => PickleTableRow)
], PickleTable.prototype, "rows", void 0);
var PickleTableCell = class {
  constructor() {
    this.value = "";
  }
};
var PickleTableRow = class {
  constructor() {
    this.cells = [];
  }
};
__decorate([
  (0, import_class_transformer.Type)(() => PickleTableCell)
], PickleTableRow.prototype, "cells", void 0);
var PickleTag = class {
  constructor() {
    this.name = "";
    this.astNodeId = "";
  }
};
var Source = class {
  constructor() {
    this.uri = "";
    this.data = "";
    this.mediaType = SourceMediaType2.TEXT_X_CUCUMBER_GHERKIN_PLAIN;
  }
};
var SourceReference = class {
};
__decorate([
  (0, import_class_transformer.Type)(() => JavaMethod)
], SourceReference.prototype, "javaMethod", void 0);
__decorate([
  (0, import_class_transformer.Type)(() => JavaStackTraceElement)
], SourceReference.prototype, "javaStackTraceElement", void 0);
__decorate([
  (0, import_class_transformer.Type)(() => Location)
], SourceReference.prototype, "location", void 0);
var JavaMethod = class {
  constructor() {
    this.className = "";
    this.methodName = "";
    this.methodParameterTypes = [];
  }
};
var JavaStackTraceElement = class {
  constructor() {
    this.className = "";
    this.fileName = "";
    this.methodName = "";
  }
};
var StepDefinition = class {
  constructor() {
    this.id = "";
    this.pattern = new StepDefinitionPattern();
    this.sourceReference = new SourceReference();
  }
};
__decorate([
  (0, import_class_transformer.Type)(() => StepDefinitionPattern)
], StepDefinition.prototype, "pattern", void 0);
__decorate([
  (0, import_class_transformer.Type)(() => SourceReference)
], StepDefinition.prototype, "sourceReference", void 0);
var StepDefinitionPattern = class {
  constructor() {
    this.source = "";
    this.type = StepDefinitionPatternType2.CUCUMBER_EXPRESSION;
  }
};
var Suggestion = class {
  constructor() {
    this.id = "";
    this.pickleStepId = "";
    this.snippets = [];
  }
};
__decorate([
  (0, import_class_transformer.Type)(() => Snippet)
], Suggestion.prototype, "snippets", void 0);
var Snippet = class {
  constructor() {
    this.language = "";
    this.code = "";
  }
};
var TestCase = class {
  constructor() {
    this.id = "";
    this.pickleId = "";
    this.testSteps = [];
  }
};
__decorate([
  (0, import_class_transformer.Type)(() => TestStep)
], TestCase.prototype, "testSteps", void 0);
var Group = class {
};
__decorate([
  (0, import_class_transformer.Type)(() => Group)
], Group.prototype, "children", void 0);
var StepMatchArgument = class {
  constructor() {
    this.group = new Group();
  }
};
__decorate([
  (0, import_class_transformer.Type)(() => Group)
], StepMatchArgument.prototype, "group", void 0);
var StepMatchArgumentsList = class {
  constructor() {
    this.stepMatchArguments = [];
  }
};
__decorate([
  (0, import_class_transformer.Type)(() => StepMatchArgument)
], StepMatchArgumentsList.prototype, "stepMatchArguments", void 0);
var TestStep = class {
  constructor() {
    this.id = "";
  }
};
__decorate([
  (0, import_class_transformer.Type)(() => StepMatchArgumentsList)
], TestStep.prototype, "stepMatchArgumentsLists", void 0);
var TestCaseFinished = class {
  constructor() {
    this.testCaseStartedId = "";
    this.timestamp = new Timestamp();
    this.willBeRetried = false;
  }
};
__decorate([
  (0, import_class_transformer.Type)(() => Timestamp)
], TestCaseFinished.prototype, "timestamp", void 0);
var TestCaseStarted = class {
  constructor() {
    this.attempt = 0;
    this.id = "";
    this.testCaseId = "";
    this.timestamp = new Timestamp();
  }
};
__decorate([
  (0, import_class_transformer.Type)(() => Timestamp)
], TestCaseStarted.prototype, "timestamp", void 0);
var TestRunFinished = class {
  constructor() {
    this.success = false;
    this.timestamp = new Timestamp();
  }
};
__decorate([
  (0, import_class_transformer.Type)(() => Timestamp)
], TestRunFinished.prototype, "timestamp", void 0);
__decorate([
  (0, import_class_transformer.Type)(() => Exception)
], TestRunFinished.prototype, "exception", void 0);
var TestRunHookFinished = class {
  constructor() {
    this.testRunHookStartedId = "";
    this.result = new TestStepResult();
    this.timestamp = new Timestamp();
  }
};
__decorate([
  (0, import_class_transformer.Type)(() => TestStepResult)
], TestRunHookFinished.prototype, "result", void 0);
__decorate([
  (0, import_class_transformer.Type)(() => Timestamp)
], TestRunHookFinished.prototype, "timestamp", void 0);
var TestRunHookStarted = class {
  constructor() {
    this.id = "";
    this.testRunStartedId = "";
    this.hookId = "";
    this.timestamp = new Timestamp();
  }
};
__decorate([
  (0, import_class_transformer.Type)(() => Timestamp)
], TestRunHookStarted.prototype, "timestamp", void 0);
var TestRunStarted = class {
  constructor() {
    this.timestamp = new Timestamp();
  }
};
__decorate([
  (0, import_class_transformer.Type)(() => Timestamp)
], TestRunStarted.prototype, "timestamp", void 0);
var TestStepFinished = class {
  constructor() {
    this.testCaseStartedId = "";
    this.testStepId = "";
    this.testStepResult = new TestStepResult();
    this.timestamp = new Timestamp();
  }
};
__decorate([
  (0, import_class_transformer.Type)(() => TestStepResult)
], TestStepFinished.prototype, "testStepResult", void 0);
__decorate([
  (0, import_class_transformer.Type)(() => Timestamp)
], TestStepFinished.prototype, "timestamp", void 0);
var TestStepResult = class {
  constructor() {
    this.duration = new Duration();
    this.status = TestStepResultStatus2.UNKNOWN;
  }
};
__decorate([
  (0, import_class_transformer.Type)(() => Duration)
], TestStepResult.prototype, "duration", void 0);
__decorate([
  (0, import_class_transformer.Type)(() => Exception)
], TestStepResult.prototype, "exception", void 0);
var TestStepStarted = class {
  constructor() {
    this.testCaseStartedId = "";
    this.testStepId = "";
    this.timestamp = new Timestamp();
  }
};
__decorate([
  (0, import_class_transformer.Type)(() => Timestamp)
], TestStepStarted.prototype, "timestamp", void 0);
var Timestamp = class {
  constructor() {
    this.seconds = 0;
    this.nanos = 0;
  }
};
var UndefinedParameterType = class {
  constructor() {
    this.expression = "";
    this.name = "";
  }
};
var AttachmentContentEncoding2;
(function(AttachmentContentEncoding3) {
  AttachmentContentEncoding3["IDENTITY"] = "IDENTITY";
  AttachmentContentEncoding3["BASE64"] = "BASE64";
})(AttachmentContentEncoding2 || (AttachmentContentEncoding2 = {}));
var HookType2;
(function(HookType3) {
  HookType3["BEFORE_TEST_RUN"] = "BEFORE_TEST_RUN";
  HookType3["AFTER_TEST_RUN"] = "AFTER_TEST_RUN";
  HookType3["BEFORE_TEST_CASE"] = "BEFORE_TEST_CASE";
  HookType3["AFTER_TEST_CASE"] = "AFTER_TEST_CASE";
  HookType3["BEFORE_TEST_STEP"] = "BEFORE_TEST_STEP";
  HookType3["AFTER_TEST_STEP"] = "AFTER_TEST_STEP";
})(HookType2 || (HookType2 = {}));
var PickleStepType2;
(function(PickleStepType3) {
  PickleStepType3["UNKNOWN"] = "Unknown";
  PickleStepType3["CONTEXT"] = "Context";
  PickleStepType3["ACTION"] = "Action";
  PickleStepType3["OUTCOME"] = "Outcome";
})(PickleStepType2 || (PickleStepType2 = {}));
var SourceMediaType2;
(function(SourceMediaType3) {
  SourceMediaType3["TEXT_X_CUCUMBER_GHERKIN_PLAIN"] = "text/x.cucumber.gherkin+plain";
  SourceMediaType3["TEXT_X_CUCUMBER_GHERKIN_MARKDOWN"] = "text/x.cucumber.gherkin+markdown";
})(SourceMediaType2 || (SourceMediaType2 = {}));
var StepDefinitionPatternType2;
(function(StepDefinitionPatternType3) {
  StepDefinitionPatternType3["CUCUMBER_EXPRESSION"] = "CUCUMBER_EXPRESSION";
  StepDefinitionPatternType3["REGULAR_EXPRESSION"] = "REGULAR_EXPRESSION";
})(StepDefinitionPatternType2 || (StepDefinitionPatternType2 = {}));
var StepKeywordType2;
(function(StepKeywordType3) {
  StepKeywordType3["UNKNOWN"] = "Unknown";
  StepKeywordType3["CONTEXT"] = "Context";
  StepKeywordType3["ACTION"] = "Action";
  StepKeywordType3["OUTCOME"] = "Outcome";
  StepKeywordType3["CONJUNCTION"] = "Conjunction";
})(StepKeywordType2 || (StepKeywordType2 = {}));
var TestStepResultStatus2;
(function(TestStepResultStatus3) {
  TestStepResultStatus3["UNKNOWN"] = "UNKNOWN";
  TestStepResultStatus3["PASSED"] = "PASSED";
  TestStepResultStatus3["SKIPPED"] = "SKIPPED";
  TestStepResultStatus3["PENDING"] = "PENDING";
  TestStepResultStatus3["UNDEFINED"] = "UNDEFINED";
  TestStepResultStatus3["AMBIGUOUS"] = "AMBIGUOUS";
  TestStepResultStatus3["FAILED"] = "FAILED";
})(TestStepResultStatus2 || (TestStepResultStatus2 = {}));

// scripts/testing/bdd.mjs
var hash = (value) => createHash("sha256").update(value).digest("hex");
var clean = (text) => text.replace(/\u00a0/g, " ").trim();
var identity = (text) => clean(text).replace(/\s+/g, " ").toLowerCase();
function parseGherkin(text) {
  return new Parser(new AstBuilder(IdGenerator_exports.incrementing()), new GherkinClassicTokenMatcher()).parse(text);
}
function normalizeMarkdown(text) {
  const output = [];
  const lines = text.split(/\r?\n/);
  const issues = [];
  const sourceLines = [];
  const details = {};
  let lastStepLine = null;
  let active = false;
  let inBackground = false;
  let stepSeen = false;
  let skipCredentials = false;
  const emit = (line, index) => {
    output.push(line);
    sourceLines.push(index + 1);
  };
  for (let index = 0; index < lines.length; index++) {
    const line = clean(lines[index]);
    if (/^```|^~~~/.test(line)) continue;
    if (/^#{1,6}\s/.test(line) && !/^# language:/.test(line)) {
      active = false;
      stepSeen = false;
      continue;
    }
    const heading = line.match(/^(Feature|Функционал|Функция|Свойство)\s*:?\s+(.+)$/i);
    if (heading) {
      active = true;
      stepSeen = false;
      skipCredentials = false;
      emit(`Feature: ${heading[2]}`, index);
      continue;
    }
    if (!active) {
      if (/^(Given|When|Then|And|Допустим|Когда|Тогда|И)\s*$/.test(line)) issues.push({ line: index + 1, code: "orphan-empty-step" });
      continue;
    }
    if (/password|пароль/i.test(line) && line.startsWith("|")) {
      skipCredentials = true;
      issues.push({ line: index + 1, code: "credential-table", message: "Resolve account roles separately; credentials are omitted." });
      continue;
    }
    if (skipCredentials && line.startsWith("|")) continue;
    if (line) skipCredentials = false;
    const background = line.match(/^Background\s*:?\s*(.*)$/i);
    if (background) {
      emit("Background:", index);
      inBackground = true;
      stepSeen = false;
      if (background[1]) {
        emit(`  Given ${background[1]}`, index);
        stepSeen = true;
      }
      continue;
    }
    const scenario = line.match(/^(Scenario Outline|Scenario Template|Scenarios|Scenario)\s*:?\s*(.*)$/i);
    if (scenario) {
      const keyword = /outline|template/i.test(scenario[1]) ? "Scenario Outline" : "Scenario";
      emit(`${keyword}: ${scenario[2] || "Untitled scenario"}`, index);
      inBackground = false;
      stepSeen = false;
      continue;
    }
    const step = line.match(/^(Given|When|Then|And|But)\b\s*(.*)$/i);
    if (step) {
      emit(`  ${step[1][0].toUpperCase() + step[1].slice(1).toLowerCase()} ${step[2]}`, index);
      if (!step[2]) issues.push({ line: index + 1, code: "empty-step" });
      lastStepLine = index + 1;
      stepSeen = true;
      continue;
    }
    if (/^Examples\s*:/.test(line) || line.startsWith("@") || /^# language:/.test(line)) {
      emit(line, index);
      continue;
    }
    if (line.startsWith("|")) {
      emit(`    ${line}`, index);
      continue;
    }
    if (!line) {
      emit("", index);
      continue;
    }
    if (stepSeen) {
      emit(`    # Source detail: ${line}`, index);
      if (lastStepLine !== null) (details[lastStepLine] ??= []).push(line);
      issues.push({ line: index + 1, code: "unstructured-detail", message: "Convert this detail into explicit steps or a DataTable before approval." });
    } else if (!inBackground) emit(`  ${line}`, index);
    else issues.push({ line: index + 1, code: "unstructured-background" });
  }
  return { text: output.join("\n") + "\n", sourceLines, issues, details };
}
function inspectSources(sources, previous = null) {
  const records = /* @__PURE__ */ new Map();
  const issues = [];
  const drafts = [];
  const usedIds = /* @__PURE__ */ new Set();
  for (const source of sources) {
    if (Buffer.byteLength(source.text) > 1024 * 1024) throw new Error("BDD source exceeds 1 MiB");
    const strict = /\.feature$/i.test(source.path);
    const normalized = strict ? { text: source.text, sourceLines: source.text.split("\n").map((_, i) => i + 1), issues: [] } : normalizeMarkdown(source.text);
    issues.push(...normalized.issues.map((issue) => ({ source: source.path, ...issue })));
    const blocks = strict ? [normalized.text] : normalized.text.split(/(?=^Feature:)/m).filter((part) => part.trim());
    if (!blocks.length) issues.push({ source: source.path, line: 1, code: "no-feature" });
    let offset = 0;
    for (const block of blocks) {
      let ast;
      try {
        ast = parseGherkin(block);
      } catch (error) {
        issues.push({ source: source.path, line: normalized.sourceLines[offset] ?? 1, code: "invalid-gherkin", message: error.message });
        offset += block.split("\n").length - 1;
        continue;
      }
      const feature = ast.feature;
      if (!feature) {
        issues.push({ source: source.path, line: 1, code: "no-feature" });
        continue;
      }
      drafts.push({ source: source.path, feature: feature.name, text: block });
      const collect = (children, inherited = [], rules = []) => {
        const background = children.filter((child) => child.background).flatMap((child) => child.background.steps);
        for (const child of children) {
          if (child.rule) {
            collect(child.rule.children, [...inherited, ...background], [...rules, { name: child.rule.name, description: child.rule.description, tags: child.rule.tags.map((tag) => tag.name) }]);
            continue;
          }
          if (!child.scenario) continue;
          const scenario = child.scenario;
          const explicitId = scenario.tags.find((tag) => /^@bdd-[a-f0-9]{12}$/.test(tag.name))?.name.slice(1);
          const key = explicitId ?? identity([feature.name, ...rules.map((rule) => rule.name), scenario.name].join("::"));
          const steps = [...inherited, ...background, ...scenario.steps].map((step) => ({
            keyword: step.keyword.trim(),
            text: step.text,
            line: normalized.sourceLines[offset + step.location.line - 1] ?? step.location.line,
            ...normalized.details?.[normalized.sourceLines[offset + step.location.line - 1]] ? { details: normalized.details[normalized.sourceLines[offset + step.location.line - 1]] } : {},
            ...step.dataTable ? { table: step.dataTable.rows.map((row) => row.cells.map((cell) => cell.value)) } : {},
            ...step.docString ? { docString: step.docString.content } : {}
          }));
          const signature = hash(JSON.stringify({ feature: feature.name, featureDescription: feature.description, rules, title: scenario.name, description: scenario.description, steps: steps.map(({ line, ...step }) => step), examples: scenario.examples.map((example) => ({ name: example.name, tags: example.tags.map((tag) => tag.name), header: example.tableHeader?.cells.map((cell) => cell.value), rows: example.tableBody.map((row) => row.cells.map((cell) => cell.value)) })), tags: [...feature.tags, ...scenario.tags].map((tag) => tag.name) }));
          const prior = previous?.scenarios?.find((item) => item.key === key);
          const id = explicitId ?? prior?.id ?? `bdd-${hash(key).slice(0, 12)}`;
          if (!records.has(key) && usedIds.has(id)) throw new Error("Duplicate scenario ID in previous registry");
          usedIds.add(id);
          let phase = "";
          const expectations = [];
          for (const step of steps) {
            if (/^(Then|Тогда|То)$/i.test(step.keyword)) phase = "then";
            else if (!/^(And|But|И|Но|А)$/i.test(step.keyword)) phase = "other";
            if (phase === "then") expectations.push({ id: `${id}-e${expectations.length + 1}`, text: step.text, line: step.line });
          }
          const origin = { path: source.path, line: normalized.sourceLines[offset + scenario.location.line - 1] ?? scenario.location.line, sha256: hash(source.text) };
          const variant = { signature, steps, expectations, sources: [origin] };
          if (records.has(key)) {
            const record = records.get(key);
            const same = record.variants.find((entry) => entry.signature === signature);
            if (same) same.sources.push(origin);
            else {
              record.variants.push(variant);
              record.conflict = true;
            }
          } else records.set(key, { id, key, feature: feature.name, rules: rules.map((rule) => rule.name), title: scenario.name, expectedInstances: scenario.examples.length ? scenario.examples.reduce((total, example) => total + example.tableBody.length, 0) : 1, review: "needs-review", conflict: false, variants: [variant] });
        }
      };
      collect(feature.children);
      offset += block.split("\n").length - 1;
    }
  }
  return { schemaVersion: 1, scenarios: [...records.values()], issues, drafts };
}
function checkCoverage(registry, mapping, run = null) {
  const results = registry.scenarios.map((scenario) => {
    const entry = mapping.scenarios?.find((item) => item.id === scenario.id);
    const signature = scenario.variants[0].signature;
    const expected = scenario.variants[0].expectations;
    const covered = expected.filter((item) => entry?.assertions?.some((assertion) => assertion.expectationId === item.id && assertion.file && assertion.symbol));
    const complete = !scenario.conflict && entry?.approvedSignature === signature && expected.length > 0 && covered.length === expected.length;
    const executions = run?.scenarios?.filter((item) => item.id === scenario.id && item.signature === signature) ?? [];
    const projects = mapping.projects ?? [];
    const fullScope = projects.length > 0 && projects.every((project) => {
      const instances = executions.filter((item) => item.project === project);
      return instances.length === scenario.expectedInstances && new Set(instances.map((item) => item.instance)).size === scenario.expectedInstances;
    });
    const execution = !complete || !executions.length ? "not-run" : !fullScope ? "blocked" : executions.every((item) => item.status === "passed") ? "passed" : executions.some((item) => item.status === "failed") ? "failed" : "blocked";
    return { id: scenario.id, specification: scenario.conflict ? "conflict" : entry?.approvedSignature === signature ? "approved" : "needs-review", coverage: complete ? "complete" : "incomplete", expected: expected.length, covered: covered.length, execution };
  });
  const unresolved = (registry.issues ?? []).map(({ source, line, code }) => ({ source, line, code }));
  return { schemaVersion: 1, unresolved, valid: unresolved.length === 0 && results.length > 0 && results.every((item) => item.coverage === "complete" && item.execution === "passed"), scenarios: results, note: "Assertion mappings and run evidence require review; metadata alone does not prove semantic correctness." };
}

// scripts/testing/spec-cli.mjs
var sha256 = (content) => createHash2("sha256").update(content).digest("hex");
var stableJson = (value) => `${JSON.stringify(value, null, 2)}
`;
var validators = /* @__PURE__ */ new Map();
var validateSpecificationData = (type, value) => {
  const schema = type === "specification-manifest" ? specification_manifest_schema_default : type === "bdd-registry" ? bdd_registry_schema_default : null;
  if (!schema) throw new Error(`Unsupported specification data type: ${type}`);
  if (!validators.has(type)) validators.set(type, new import__.default({
    strict: false,
    formats: { uri: true, "date-time": true }
  }).compile(schema));
  const validate = validators.get(type);
  return { valid: validate(value), errors: validate.errors ?? [] };
};
var validateGitLabReference = (reference) => {
  const errors = [];
  if (!reference || typeof reference !== "object") errors.push("Reference must be an object");
  else {
    if (!/^[a-zA-Z0-9_.-]+(?:\/[a-zA-Z0-9_.-]+)+$/.test(reference.projectPath ?? "")) errors.push("projectPath must identify a GitLab namespace/project, not a URL or mutable ref");
    if (!/^[0-9a-f]{40}$/.test(reference.commitSha ?? "")) errors.push("commitSha must be a full 40-character immutable SHA");
    if (typeof reference.bundlePath !== "string" || !reference.bundlePath || path.isAbsolute(reference.bundlePath) || /^[a-zA-Z]:[\\/]/.test(reference.bundlePath) || reference.bundlePath.split(/[\\/]/).includes("..")) errors.push("bundlePath must be a safe project-relative path");
    if (reference.branch || reference.tag || reference.ref) errors.push("Mutable branch, tag and ref fields are not approved handoff inputs");
  }
  return { valid: errors.length === 0, errors };
};
var artifactKind = (relativePath) => relativePath.endsWith(".feature") ? "feature" : relativePath.endsWith("registry.json") ? "registry" : relativePath.endsWith("diagnostics.json") ? "diagnostics" : "supporting";
var compareFeatureRegistry = (features, registry) => {
  const inspected = inspectSources(features.map((feature) => ({ path: feature.path, text: feature.content })));
  const errors = inspected.issues.map((issue) => `${issue.source}:${issue.line} ${issue.code}`);
  const expected = new Map(registry.scenarios.map((scenario) => [scenario.id, scenario.variants[0]?.signature]));
  const actual = new Map(inspected.scenarios.map((scenario) => [scenario.id, scenario.variants[0]?.signature]));
  if (expected.size !== registry.scenarios.length) errors.push("Registry contains duplicate scenario IDs");
  if (actual.size !== inspected.scenarios.length) errors.push("Feature set contains duplicate scenario IDs");
  for (const [id, signature] of expected) {
    if (!actual.has(id)) errors.push(`Feature set is missing ${id}`);
    else if (actual.get(id) !== signature) errors.push(`Feature signature mismatch: ${id}`);
  }
  for (const id of actual.keys()) if (!expected.has(id)) errors.push(`Feature set has unregistered scenario: ${id}`);
  return errors;
};
var prepareSpecificationBundle = async ({ metadata, registry, features, diagnostics, outputRoot }) => {
  const bundleRoot = path.resolve(outputRoot);
  const registryCheck = validateSpecificationData("bdd-registry", registry);
  if (!registryCheck.valid) throw new Error(`Invalid registry: ${JSON.stringify(registryCheck.errors)}`);
  if (!features.length) throw new Error("At least one normalized .feature is required");
  const referenceCheck = validateGitLabReference(metadata.gitlab);
  if (!referenceCheck.valid) throw new Error(`Invalid GitLab handoff: ${referenceCheck.errors.join("; ")}`);
  const featureErrors = compareFeatureRegistry(features, registry);
  if (featureErrors.length) throw new Error(`Feature/registry mismatch: ${featureErrors.join("; ")}`);
  const registryIssues = registry.issues ?? [];
  const conflicts = registry.scenarios.filter((scenario) => scenario.conflict).length;
  const files = [
    { path: "registry.json", content: stableJson(registry) },
    { path: "diagnostics.json", content: stableJson({ ...diagnostics, issues: registryIssues, conflicts }) },
    ...features.map((feature, index) => ({ path: feature.path || `features/specification-${index + 1}.feature`, content: feature.content }))
  ];
  const structuralErrors = registryIssues.filter((issue) => ["invalid-gherkin", "no-feature"].includes(issue.code)).length;
  const missingOutcomes = registry.scenarios.filter((scenario) => !scenario.variants[0]?.expectations?.length).length;
  const unresolvedIssues = registryIssues.filter((issue) => issue.code !== "credential-table").length + conflicts + missingOutcomes;
  const diagnosticSummary = {
    errors: Math.max(Number(diagnostics.errors ?? 0), structuralErrors),
    warnings: Number(diagnostics.warnings ?? 0),
    infos: Number(diagnostics.infos ?? 0),
    unresolved: Math.max(Number(diagnostics.unresolved ?? 0), unresolvedIssues)
  };
  const approved = metadata.approval?.status === "approved";
  const manifest = {
    schemaVersion: 1,
    runtimeVersion: "1.0.0",
    gitlab: metadata.gitlab,
    approval: metadata.approval,
    sources: metadata.sources,
    scenarios: registry.scenarios.map((scenario) => ({
      id: scenario.id,
      signature: scenario.variants[0]?.signature
    })),
    diagnostics: diagnosticSummary,
    specReady: approved && diagnosticSummary.errors === 0 && diagnosticSummary.unresolved === 0,
    artifacts: files.map((file) => ({ path: file.path, kind: artifactKind(file.path), sha256: sha256(file.content) }))
  };
  const check = validateSpecificationData("specification-manifest", manifest);
  if (!check.valid) throw new Error(`Invalid specification manifest: ${JSON.stringify(check.errors)}`);
  const pending = [...files, { path: "manifest.json", content: stableJson(manifest) }];
  for (const file of pending) {
    const target = path.resolve(bundleRoot, file.path);
    if (path.relative(bundleRoot, target).startsWith("..")) throw new Error(`Unsafe bundle path: ${file.path}`);
    try {
      const current = await readFile(target, "utf8");
      if (current !== file.content) throw new Error(`Refusing to overwrite project-owned bundle artifact: ${file.path}`);
    } catch (error) {
      if (error.code !== "ENOENT") throw error;
    }
  }
  for (const file of pending) {
    const target = path.resolve(bundleRoot, file.path);
    await mkdir(path.dirname(target), { recursive: true });
    await writeFile(target, file.content, "utf8");
  }
  return manifest;
};
var validateSpecificationBundle = async (root) => {
  const bundleRoot = path.resolve(root);
  const manifest = JSON.parse(await readFile(path.join(bundleRoot, "manifest.json"), "utf8"));
  const check = validateSpecificationData("specification-manifest", manifest);
  const errors = check.errors.map((error) => `${error.instancePath || "/"} ${error.message}`);
  const featureSources = [];
  let registry = null;
  for (const artifact of manifest.artifacts ?? []) {
    const target = path.resolve(bundleRoot, artifact.path);
    if (path.relative(bundleRoot, target).startsWith("..")) errors.push(`Unsafe artifact path: ${artifact.path}`);
    else {
      try {
        const content = await readFile(target);
        if (sha256(content) !== artifact.sha256) errors.push(`Hash mismatch: ${artifact.path}`);
        else if (artifact.kind === "feature") featureSources.push({ path: artifact.path, content: content.toString("utf8") });
        else if (artifact.kind === "registry") registry = JSON.parse(content.toString("utf8"));
      } catch (error) {
        errors.push(`Cannot read ${artifact.path}: ${error.message}`);
      }
    }
  }
  if (registry && featureSources.length) errors.push(...compareFeatureRegistry(featureSources, registry));
  else errors.push("Bundle must contain registry and feature artifacts");
  if (manifest.gitlab && !validateGitLabReference(manifest.gitlab).valid) errors.push(...validateGitLabReference(manifest.gitlab).errors);
  return { valid: errors.length === 0 && manifest.specReady === true, specReady: manifest.specReady === true, errors, manifest };
};
var parseArgs = (argv) => {
  const [command, ...args] = argv;
  const options = { input: [], feature: [] };
  for (let index = 0; index < args.length; index += 1) {
    const flag = args[index];
    if (flag === "--write") {
      options.write = true;
      continue;
    }
    if (!["--input", "--previous", "--type", "--bundle", "--metadata", "--registry", "--diagnostics", "--feature", "--output"].includes(flag) || !args[index + 1] || args[index + 1].startsWith("--")) throw new Error(`Invalid argument ${flag}`);
    const key = flag.slice(2);
    if (key === "input" || key === "feature") options[key].push(args[++index]);
    else options[key] = args[++index];
  }
  return { command, options };
};
async function main(argv = process.argv.slice(2)) {
  const { command, options } = parseArgs(argv);
  const json = async (file) => JSON.parse(await readFile(file, "utf8"));
  let result;
  if (command === "inspect-bdd") {
    if (!options.input.length) throw new Error("Provide at least one --input");
    const sources = await Promise.all(options.input.map(async (file) => ({ path: file, text: await readFile(file, "utf8") })));
    result = inspectSources(sources, options.previous ? await json(options.previous) : null);
  } else if (command === "validate-data") {
    if (options.input.length !== 1) throw new Error("Provide one --input");
    result = validateSpecificationData(options.type, await json(options.input[0]));
  } else if (command === "validate-gitlab-ref") {
    if (options.input.length !== 1) throw new Error("Provide one --input");
    result = validateGitLabReference(await json(options.input[0]));
  } else if (command === "validate-bundle") {
    if (!options.bundle) throw new Error("Provide --bundle");
    result = await validateSpecificationBundle(path.resolve(options.bundle));
  } else if (command === "prepare-bundle") {
    if (!options.write || !options.metadata || !options.registry || !options.diagnostics || !options.feature.length || !options.output) throw new Error("prepare-bundle requires --metadata, --registry, --diagnostics, --feature, --output and explicit --write");
    result = await prepareSpecificationBundle({
      metadata: await json(options.metadata),
      registry: await json(options.registry),
      diagnostics: await json(options.diagnostics),
      features: await Promise.all(options.feature.map(async (file) => ({ path: `features/${path.basename(file)}`, content: await readFile(file, "utf8") }))),
      outputRoot: path.resolve(options.output)
    });
  } else throw new Error("Usage: specification CLI <inspect-bdd|validate-data|validate-gitlab-ref|prepare-bundle|validate-bundle>");
  process.stdout.write(stableJson(result));
  if (result.valid === false) process.exitCode = 1;
  return result;
}
if (process.argv[1] && realpathSync(process.argv[1]) === realpathSync(fileURLToPath(import.meta.url))) {
  main().catch((error) => {
    process.stderr.write(`[bdd-specification] ${error.message}
`);
    process.exitCode = 1;
  });
}
export {
  checkCoverage,
  inspectSources,
  main,
  prepareSpecificationBundle,
  validateGitLabReference,
  validateSpecificationBundle,
  validateSpecificationData
};
/*! Bundled license information:

reflect-metadata/Reflect.js:
  (*! *****************************************************************************
  Copyright (C) Microsoft. All rights reserved.
  Licensed under the Apache License, Version 2.0 (the "License"); you may not use
  this file except in compliance with the License. You may obtain a copy of the
  License at http://www.apache.org/licenses/LICENSE-2.0

  THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
  KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
  WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
  MERCHANTABLITY OR NON-INFRINGEMENT.

  See the Apache Version 2.0 License for specific language governing permissions
  and limitations under the License.
  ***************************************************************************** *)
*/
