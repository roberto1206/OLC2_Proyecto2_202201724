
{
  const crearNodo = (tipoNodo, props) =>{
    const tipos = {
      'primitivo': nodos.Primitivo,
      'agrupacion': nodos.Agrupacion,
      'binaria': nodos.OperacionBinaria,
      'unaria': nodos.OperacionUnaria,
      'declaracionVariable': nodos.DeclaracionVariable,
      'referenciaVariable': nodos.ReferenciaVariable,
      'print': nodos.Print,
      'expresionStmt': nodos.ExpresionStmt,
      'cadena': nodos.Cadena,
      'caracter': nodos.Caracter,
      'bool':nodos.Booleanos,
      'asignacion': nodos.Asignacion,
      'bloque': nodos.Bloque,
      'if': nodos.If,
      'while': nodos.While,
      'incremento':nodos.Incrementador,
      'for': nodos.For,
      'break': nodos.Break,
      'continue': nodos.Continue,
      'return': nodos.Return,
      'ternario': nodos.Ternario,
      'switch': nodos.Switch,
      'casos': nodos.Casos,
      'arreglos':nodos.Array,
      'arreglos1':nodos.Array1,
      'arreglos2':nodos.Array2,
      'funcArray':nodos.FuncArray,
      'foreach':nodos.ForEach,
      'asingacionVec1' : nodos.AsignacionVec1,
      'matriz':nodos.Matriz,
      'matriz1':nodos.Matriz1,
      'asingacionVec2' : nodos.AsignacionVec2,
      'llamada': nodos.Llamada,
      'dclFunc': nodos.FuncDcl,
      'dclClase': nodos.ClassDcl,
      'instancia': nodos.Instancia,
      'get': nodos.Get,
      'set': nodos.Set,
      'comentario': nodos.Comentarios
    }
  
    const nodo = new tipos[tipoNodo](props)
    nodo.location = location()
    return nodo
  }
}

programa = _ dcl:Declaracion* _ { return dcl }

Declaracion = 
            dcl:ClassDcl _ { return dcl }
            / dcl:Comentarios _ { return dcl }
            / dcl:VarDcl _ { return dcl }
            / dcl:FuncDcl _ { return dcl }
            / stmt:Stmt _ { return stmt }

VarDcl = 
  tipo:tipoDato _ id:Identificador _ "=" _ exp:tiposDeclaVar _ ";" { return crearNodo('declaracionVariable', { tipo, id, exp }) }
  / tipo:tipoDato _ id:Identificador _ ";" { return crearNodo('declaracionVariable', { tipo, id }) }
  / tipo:tipoDato "[]"  _ id:Identificador _  "=" _ exp:finalArray  _ ";" {return crearNodo("arreglos", {tipo,id,exp:exp})}
  / tipo:tipoDato _ "[]" _ id:Identificador _ "=" _ "new" _ tipo1:tipoDato _ "[" exp:Expresion "]" _ ";"{return crearNodo('arreglos1', {tipo,id,tipo1,exp})}
  / tipo:tipoDato _ "[]" _ id:Identificador _ "=" _ id1:Identificador _ ";"{return crearNodo('arreglos2',{tipo,id,id1})}
  / tipo:tipoDato _ dimension:Dimensiones _ id:Identificador _ "=" _ array:finalArrayV _ ";"{return crearNodo('matriz',{tipo, dimension: dimension,id,array:array})}
  / tipo:tipoDato _ dimension:Dimensiones _ id:Identificador _ "=" _ "new" _ tipo1:tipoDato _ array:("[" _ exp:Expresion _ "]" {return exp})* _ ";" {return crearNodo('matriz1',{tipo,dimension:dimension,id,tipo1,array});}

FuncDcl = tipo:tipoDato _ dimension:Dimensiones? _ id:Identificador _ "(" _ params:Parametros? _ ")" _ bloque:Bloque { return crearNodo('dclFunc', {tipo, dimension:dimension, id, params: params || [], bloque }) }

Parametros = tipo:declaFun _ params:("," _ tipos:declaFun { return tipos })* { return [tipo, ...params] }

declaFun = decla:(tipo:tipoDato _ id:Identificador) { return decla }

ClassDcl = "struct" _ id:Identificador _ "{" _ dcls:ClassBody* _ "}" _ ";" { return crearNodo('dclClase', { id, dcls }) }

ClassBody = dcl:VarDcl _ { return dcl }

Stmt = "System.out.println(" _ exp:Imprimir _ ")" _ ";" { return crearNodo('print', { exp }) }
    / inc:Incrementador _ ";" { return inc }
    / Bloque
    / "if" _ "(" _ cond:Expresion _ ")" _ stmtTrue:Stmt 
      stmtFalse:(
        _ "else" _ stmtFalse:Stmt { return stmtFalse } 
      )? { return crearNodo('if', { cond, stmtTrue, stmtFalse }) }
    / "while" _ "(" _ cond:Expresion _ ")" _ stmt:Stmt { return crearNodo('while', { cond, stmt }) }
    / "for" _ "(" _ init:ForInit _ cond:Expresion _ ";" _ inc:actualizarFor _ ")" _ stmt:Stmt {
      return crearNodo('for', { init, cond, inc, stmt })
    }
    / ternario:Ternario { return ternario }
    / "switch" _ "(" _ cond:Expresion _ ")" _ "{"_ cases:(
      conds:("case" _ conds:Expresion  _ ":" _ {return conds})+ stmtCases:( _ stmtTrue:Stmt _ {return stmtTrue})* { return crearNodo('casos', { conds, stmtCases }) }
    )* _ defaults:(
      "default" _ ":" stmtDefault:( _ stmtFalse:Stmt _ {return stmtFalse} )* { return stmtDefault }
    )?
    _ "}" { return crearNodo('switch', { cond, cases, defaults }) }
    / "for" _ "(" _ tipo:tipoDato _ id:Identificador _ ":" _ id1:Identificador ")" _ stmt:Stmt{
      return crearNodo('foreach',{tipo,id,id1,stmt});
    }
    / "break" _ ";" { return crearNodo('break') }
    / "continue" _ ";" { return crearNodo('continue') }
    / "return" _ exp:Expresion? _ ";" { return crearNodo('return', { exp }) }
    / exp:Expresion _ ";" { return crearNodo('expresionStmt', { exp }) }

tipoDato = tipos:("int" / "float" / "string" / "boolean" / "char" / "var" / "void" ){return tipos}

Bloque = "{" _ dcls:Declaracion* _ "}" { return crearNodo('bloque', { dcls }) }

ForInit = dcl:VarDcl { return dcl }
        / exp:Expresion _ ";" { return exp }
        / ";" { return null }

Incrementador = id:Identificador _ op:("+=" / "-=" / "++" /"--") _  exp:Expresion  { return crearNodo('incremento', {id, op, exp }) }

// Regla para Imprimir, que maneja una o más expresiones
Imprimir = concac:(expr:Expresion _ datos:("," _ exp:Expresion _ {return exp})* _ {return [expr, ...datos]}){return concac;}

actualizarFor = inc:Incrementador { return inc }
  / asgn:Asignacion { return asgn }

tiposDeclaVar = ternario:Ternario { return ternario }
  / exp:Expresion { return exp }

Identificador = [_a-zA-Z][_a-zA-Z0-9]* { return text(); }

Dimensiones = ("[]")+

finalArrayV = "{" _ elemtos:ElementosMatriz _ "}" {return elemtos}

ElementosMatriz = expr:finalArray2 _ datos:("," _ exp:finalArray2 {return exp})* { return [expr, ...datos]}

// Regla recursiva para manejar la anidación de elementos, soportando dimensiones n
finalArray2 = "{" _ elementos:ElementosMatriz _ "}" { return elementos; } 
            / expr:Expresion {return expr;}

finalArray = "{" _ expr:Expresion _ datosI:("," _  exp:Expresion {return exp})* _ "}" {return [expr, ...datosI]}

Ternario = cond:Expresion _ "?" _ stmtTrue:Expresion _ ":" _ stmtFalse:Expresion  { return crearNodo('ternario', { cond, stmtTrue, stmtFalse }) }  

Cadena = "\"" texto:( ( "\\" . / [^\"] )* ) "\"" {
  let cadena = texto.join('');
  return cadena;
}

Caracter = "\'" texto:([^\'\n]) "\'"{
  return texto;
}

Expresion = Asignacion

Asignacion = asignado:Llamada _ "=" _ asgn:Asignacion 
  { 

    console.log({asignado})

    if (asignado instanceof nodos.ReferenciaVariable && asignado.expr1.length === 0) {
      return crearNodo('asignacion', { id: asignado.id, asgn })
    }

    if(asignado instanceof nodos.ReferenciaVariable && asignado.expr1.length > 0){
      return crearNodo('asingacionVec1', { id: asignado.id, exp: asignado.expr1, asgn })
    }

    if (!(asignado instanceof nodos.Get)) {
      throw new Error('Solo se pueden asignar valores a propiedades de objetos')
    }
    
    return crearNodo('set', { objetivo: asignado.objetivo, propiedad: asignado.propiedad, valor: asgn })
  }
/ OperadorOr

OperadorOr = izq:OperadorAnd expansion:(
  _ op:("||") _ der:OperadorAnd { return { tipo: op, der } }
)* { 
  return expansion.reduce(
    (operacionAnterior, operacionActual) => {
      const { tipo, der } = operacionActual
      return crearNodo('binaria', { op:tipo, izq: operacionAnterior, der })
    },
    izq
  )
}

OperadorAnd = izq:Igualdad expansion:(
  _ op:("&&") _ der:Igualdad { return { tipo: op, der } }
)* { 
  return expansion.reduce(
    (operacionAnterior, operacionActual) => {
      const { tipo, der } = operacionActual
      return crearNodo('binaria', { op:tipo, izq: operacionAnterior, der })
    },
    izq
  )
}

Igualdad = izq:Comparacion expansion:(
  _ op:("==" / "!=") _ der:Comparacion { return { tipo: op, der } }
)* { 
  return expansion.reduce(
    (operacionAnterior, operacionActual) => {
      const { tipo, der } = operacionActual
      return crearNodo('binaria', { op:tipo, izq: operacionAnterior, der })
    },
    izq
  )
}

Comparacion= izq:Suma expansion:(
  _ op:("<=" / ">=" / ">" / "<") _ der:Suma { return { tipo: op, der } }
)* { 
  return expansion.reduce(
    (operacionAnterior, operacionActual) => {
      const { tipo, der } = operacionActual
      return crearNodo('binaria', { op:tipo, izq: operacionAnterior, der })
    },
    izq
  )
}

Suma = izq:Multiplicacion expansion:(
  _ op:("+" / "-")  _ der:Multiplicacion { return { tipo: op, der } }
)* { 
  return expansion.reduce(
    (operacionAnterior, operacionActual) => {
      const { tipo, der } = operacionActual
      return crearNodo('binaria', { op:tipo, izq: operacionAnterior, der })
    },
    izq
  )
}

Multiplicacion = izq:Unaria expansion:(
  _ op:("*" / "/" / "%") _ der:Unaria { return { tipo: op, der } }
)* {
    return expansion.reduce(
      (operacionAnterior, operacionActual) => {
        const { tipo, der } = operacionActual
        return crearNodo('binaria', { op:tipo, izq: operacionAnterior, der })
      },
      izq
    )
}

Unaria = op:("-" / "!") _ num:Unaria { return crearNodo('unaria', { op , exp: num }) }
/ Llamada


Llamada = objetivoInicial:Numero operaciones:(
    ("(" _ args:Argumentos? _ ")" { return {args, tipo: 'funcCall' } })
    / ("." _ id:Identificador _ { return { id, tipo: 'get' } })
  )* 
  {
  const op =  operaciones.reduce(
    (objetivo, args) => {
      // return crearNodo('llamada', { callee, args: args || [] })
      const { tipo, id, args:argumentos } = args

      if (tipo === 'funcCall') {
        return crearNodo('llamada', { callee: objetivo, args: argumentos || [] })
      }else if (tipo === 'get') {
        return crearNodo('get', { objetivo, propiedad: id })
      }
    },
    objetivoInicial
  )
return op
}

Argumentos = arg:Expresion _ args:("," _ exp:Expresion { return exp })* { return [arg, ...args] }

Datos = exp:Expresion _ datos:("," _ expr:Expresion { return expr})* { return [exp, ...datos] }

DatosStruct = id:Identificador _ ":" _ exp:tiposDeclaVar _ ","? _ { return { id, exp } }

// { return{ tipo: "numero", valor: parseFloat(text(), 10) } }
Numero =
  [0-9]+ "." [0-9]+ {return crearNodo('primitivo', { valor: parseFloat(text(), 10), tipo:'float' }) }
  / [0-9]+ {return crearNodo('primitivo', { valor: parseFloat(text(), 10), tipo:'int' })}
  / caracter:Caracter { return crearNodo('primitivo', { valor:caracter, tipo:'char' } ) }
  / cadena:Cadena { return crearNodo('primitivo', { valor:cadena, tipo:'string' } ) }
  / "true" { return crearNodo('primitivo', { valor: true, tipo:'boolean' }) }
  / "false" { return crearNodo('primitivo', { valor: false, tipo:'boolean' }) }
  / "(" _ exp:Expresion _ ")" { return crearNodo('agrupacion', { exp }) }
  / "[" _ exp:Datos _ "]" { return crearNodo('agrupacion', { exp }) }
  / id:Identificador _ "{" _ args:DatosStruct* _ "}" { return crearNodo('instancia', { id, args: args || [] }) }
  / id:Identificador "." tipos:"length" {return crearNodo('funcArray' , {id,tipos})}
  / id:Identificador "." tipos:"indexOf" "(" _ expr1:Expresion _")" {return crearNodo('funcArray' , {id,tipos,expr1})}
  / id:Identificador "." tipos:"join" "()" {return crearNodo('funcArray' , {id,tipos})}
  / id:"Object.keys(" _ expr1:Expresion _ ")" {return crearNodo('referenciaVariable', { id, expr1 })}
  / id:"typeof" _ expr1:Expresion {return crearNodo('referenciaVariable', { id, expr1 })}
  / id:Identificador expr1:("[" _ exp:Expresion _ "]" {return exp})* {return crearNodo('referenciaVariable', { id, expr1:expr1 })}

_ = ([ \t\n\r] / Comentarios)*


Comentarios = "//" (![\n] .)*
            / "/*" (!("*/") .)* "*/"



//_ = ([ \t\n\r] / ComentarioML)*


//Comentarios = "//" (![\n] .)*{return crearNodo('comentario', {texto:text(), tipo:'string'})}
//ComentarioML = "/*" (!("*/") .)* "*/"