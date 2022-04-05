import { BinOp, Stmt, Expr } from "./ast";
import { parse } from "./parser";

// https://learnxinyminutes.com/docs/wasm/

type LocalEnv = Map<string, boolean>;

type CompileResult = {
  wasmSource: string,
};

export function compile(source: string) : CompileResult {
  var defined : Array<String> = []; 
  const ast = parse(source);
  const definedVars = new Set();
  ast.forEach(s => {
    switch(s.tag) {
      case "define":
        definedVars.add(s.name);
        break;
    }
  }); 
  const scratchVar : string = `(local $$last i32)`;
  const localDefines = [scratchVar];
  definedVars.forEach(v => {
    localDefines.push(`(local $${v} i32)`);
  })
  
  const commandGroups = ast.map((stmt) => codeGen(stmt, defined));
  const commands = localDefines.concat([].concat.apply([], commandGroups));
  console.log("Generated: ", commands.join("\n"));
  return {
    wasmSource: commands.join("\n"),
  };
}

function codeGen(stmt: Stmt, defined: Array<String>) : Array<string> {
  switch(stmt.tag) {
    case "define": 
      var valStmts = codeGenExpr(stmt.value, defined);
      defined.push(stmt.name)
      return valStmts.concat([`(local.set $${stmt.name})`]);
    case "expr":
      var exprStmts = codeGenExpr(stmt.expr, defined);
      return exprStmts.concat([`(local.set $$last)`]);
  }
}

function codeGenExpr(expr : Expr, defined: Array<String>) : Array<string> {
  switch(expr.tag) {
    case "builtin1":
      const argStmts = codeGenExpr(expr.arg, defined);
      return argStmts.concat([`(call $${expr.name})`]);
    case "builtin2":
      const argStmts1 = codeGenExpr(expr.arg1, defined);
      const argStmts2 = codeGenExpr(expr.arg2, defined );
      return [ ...argStmts1, ...argStmts2, `(call $${expr.name})`];
    case "num":
      if (!Number.isInteger(Number(expr.value)))
          throw new Error("UNSUPPORTED TYPE: only allow i32");
      return ["(i32.const " + expr.value + ")"];
    case "id":
      if (defined.indexOf(expr.name) < 0)
        throw new Error("REFERENCE ERROR: Variable Used before Dedined " )
      return [`(local.get $${expr.name})`];
    case "binexpr":
        const leftStmts = codeGenExpr(expr.left, defined);
        const rightStmts = codeGenExpr(expr.right, defined);
        const opStmt = codeGenBinOp(expr.op);
        return [...leftStmts, ...rightStmts, opStmt];
  }
}

function codeGenBinOp(op: BinOp): string {
  switch(op){

  case BinOp.Plus:
    return "(i32.add)"

  case BinOp.Minus:
    return "(i32.sub)"

  case BinOp.Mul:
    return "(i32.mul)"
  }
}
