import {parser} from "lezer-python";
import {TreeCursor} from "lezer-tree";
import {BinOp, Expr, Stmt} from "./ast";

export function traverseArgs(c: TreeCursor, s:string): Array<Expr>{
  var args : Array<Expr> = [];
  c.firstChild(); // go into arglist
  while(c.nextSibling()) { // find single argument in arglist
    args.push(traverseExpr(c, s));
    c.nextSibling()
  }
  c.parent(); // pop arglist
  return args;
}


export function traverseExpr(c : TreeCursor, s : string) : Expr {
  switch(c.type.name) {
    case "Number":
      return {
        tag: "num",
        value: Number(s.substring(c.from, c.to))
      }
    case "VariableName":
      return {
        tag: "id",
        name: s.substring(c.from, c.to)
      }
    case "CallExpression":
      c.firstChild();
      const callName = s.substring(c.from, c.to);
      c.nextSibling();
      var agrs = traverseArgs(c,s);
      if (agrs.length == 1){
        if (callName !== "abs" && callName !== "print")
          throw new Error("ParseError: unknown builtin1");
        c.parent(); // pop CallExpression
        return {
          tag: "builtin1",
          name: callName,
          arg: agrs[0]
          };
      } else if (agrs.length == 2) {
        if (callName !== "max" && callName !== "min" && callName != "pow")
          throw new Error("ParseError: unknown builtin2");
        c.parent(); // pop CallExpression
        return {
          tag: "builtin2",
          name: callName,
          arg1: agrs[0],
          arg2: agrs[1]
          };
        
        
      } 
      throw new Error("ParseError: can't make function calls with wrong number of arguments")
  
      

      case "UnaryExpression":
        c.firstChild();
        var uniOp = s.substring(c.from, c.to);
        if (uniOp !== "-" && uniOp !== "+")
          throw new Error("ParseError: Unsported Unary Operator");
        c.nextSibling();
        const num = Number(uniOp+ s.substring(c.from,c.to));
        if (isNaN(num))
          throw new Error("ParseError: unary operation failed")
        c.parent();
        return { tag: "num", value: num}
        break;
      case "BinaryExpression":
        c.firstChild();
        const left = traverseExpr(c, s);
        c.nextSibling();
        var op : BinOp;
        switch(s.substring(c.from, c.to)) {
          case "+":
            op = BinOp.Plus;
            break;
          case "-":
            op = BinOp.Minus;
            break;
          case "*":
            op = BinOp.Mul;
            break;
          default:
            throw new Error("ParseError: unknown binary operator")
        }
        c.nextSibling();
        const right = traverseExpr(c,s);
        c.parent();
        return { tag: "binexpr", op: op, left: left, right: right}

    default:
      throw new Error("ParseError: Not in grammar at " + c.from + " " + c.to + ": " + s.substring(c.from, c.to));
  }
}

export function traverseStmt(c : TreeCursor, s : string) : Stmt {
  switch(c.node.type.name) {
    case "AssignStatement":
      c.firstChild(); // go to name
      const name = s.substring(c.from, c.to);
      c.nextSibling(); // go to equals
      c.nextSibling(); // go to value
      const value = traverseExpr(c, s);
      c.parent();
      return {
        tag: "define",
        name: name,
        value: value
      }
    case "ExpressionStatement":
      c.firstChild();
      const expr = traverseExpr(c, s);
      c.parent(); // pop going into stmt
      return { tag: "expr", expr: expr }
    default:
      throw new Error("ParseError: Not in grammar Could not parse stmt at " + c.node.from + " " + c.node.to + ": " + s.substring(c.from, c.to));
  }
}

export function traverse(c : TreeCursor, s : string) : Array<Stmt> {
  switch(c.node.type.name) {
    case "Script":
      const stmts = [];
      c.firstChild();
      do {
        stmts.push(traverseStmt(c, s));
      } while(c.nextSibling())
      console.log("traversed " + stmts.length + " statements ", stmts, "stopped at " , c.node);
      return stmts;
    default:
      throw new Error("ParseError: Could not parse program at " + c.node.from + " " + c.node.to);
  }
}
export function parse(source : string) : Array<Stmt> {
  if (source.length == 0)
    throw new Error("ParseError: Empty Program");
  const t = parser.parse(source);
  return traverse(t.cursor(), source);
}
