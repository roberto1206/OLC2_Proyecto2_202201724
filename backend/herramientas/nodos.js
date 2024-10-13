
/**
 * @typedef {Object} Location
 * @property {Object} start
 * @property {number} start.offset
 * @property {number} start.line
 * @property {number} start.column
 * @property {Object} end
 * @property {number} end.offset
 * @property {number} end.line
 * @property {number} end.column
*/
    

/**
 * @typedef {import('./visitor').BaseVisitor} BaseVisitor
 */

export class Expresion  {

    /**
    * @param {Object} options
    * @param {Location|null} options.location Ubicacion del nodo en el codigo fuente
    */
    constructor() {
        
        
        /**
         * Ubicacion del nodo en el codigo fuente
         * @type {Location|null}
        */
        this.location = null;

    }

    /**
     * @param {BaseVisitor} visitor
     */
    accept(visitor) {
        return visitor.visitExpresion(this);
    }
}
    
export class OperacionBinaria extends Expresion {

    /**
    * @param {Object} options
    * @param {Expresion} options.izq Expresion izquierda de la operacion
 * @param {Expresion} options.der Expresion derecha de la operacion
 * @param {string} options.op Operador de la operacion
    */
    constructor({ izq, der, op }) {
        super();
        
        /**
         * Expresion izquierda de la operacion
         * @type {Expresion}
        */
        this.izq = izq;


        /**
         * Expresion derecha de la operacion
         * @type {Expresion}
        */
        this.der = der;


        /**
         * Operador de la operacion
         * @type {string}
        */
        this.op = op;

    }

    /**
     * @param {BaseVisitor} visitor
     */
    accept(visitor) {
        return visitor.visitOperacionBinaria(this);
    }
}
    
export class OperacionUnaria extends Expresion {

    /**
    * @param {Object} options
    * @param {Expresion} options.exp Expresion de la operacion
 * @param {string} options.op Operador de la operacion
    */
    constructor({ exp, op }) {
        super();
        
        /**
         * Expresion de la operacion
         * @type {Expresion}
        */
        this.exp = exp;


        /**
         * Operador de la operacion
         * @type {string}
        */
        this.op = op;

    }

    /**
     * @param {BaseVisitor} visitor
     */
    accept(visitor) {
        return visitor.visitOperacionUnaria(this);
    }
}
    
export class Agrupacion extends Expresion {

    /**
    * @param {Object} options
    * @param {Expresion} options.exp Expresion agrupada
    */
    constructor({ exp }) {
        super();
        
        /**
         * Expresion agrupada
         * @type {Expresion}
        */
        this.exp = exp;

    }

    /**
     * @param {BaseVisitor} visitor
     */
    accept(visitor) {
        return visitor.visitAgrupacion(this);
    }
}
    
export class Primitivo extends Expresion {

    /**
    * @param {Object} options
    * @param {number} options.valor Valor del primitivo
 * @param {string} options.tipo Tipo del primitivo
    */
    constructor({ valor, tipo }) {
        super();
        
        /**
         * Valor del primitivo
         * @type {number}
        */
        this.valor = valor;


        /**
         * Tipo del primitivo
         * @type {string}
        */
        this.tipo = tipo;

    }

    /**
     * @param {BaseVisitor} visitor
     */
    accept(visitor) {
        return visitor.visitPrimitivo(this);
    }
}
    
export class Numero extends Expresion {

    /**
    * @param {Object} options
    * @param {number} options.valor Valor del numero
    */
    constructor({ valor }) {
        super();
        
        /**
         * Valor del numero
         * @type {number}
        */
        this.valor = valor;

    }

    /**
     * @param {BaseVisitor} visitor
     */
    accept(visitor) {
        return visitor.visitNumero(this);
    }
}
    
export class DeclaracionVariable extends Expresion {

    /**
    * @param {Object} options
    * @param {string} options.tipo Tipo de la variable
 * @param {string} options.id Identificador de la variable
 * @param {Expresion} options.exp Expresion de la variable
    */
    constructor({ tipo, id, exp }) {
        super();
        
        /**
         * Tipo de la variable
         * @type {string}
        */
        this.tipo = tipo;


        /**
         * Identificador de la variable
         * @type {string}
        */
        this.id = id;


        /**
         * Expresion de la variable
         * @type {Expresion}
        */
        this.exp = exp;

    }

    /**
     * @param {BaseVisitor} visitor
     */
    accept(visitor) {
        return visitor.visitDeclaracionVariable(this);
    }
}
    
export class ReferenciaVariable extends Expresion {

    /**
    * @param {Object} options
    * @param {string} options.id Identificador de la variable
 * @param {string} options.expr1 Identificador de la variable
    */
    constructor({ id, expr1 }) {
        super();
        
        /**
         * Identificador de la variable
         * @type {string}
        */
        this.id = id;


        /**
         * Identificador de la variable
         * @type {string}
        */
        this.expr1 = expr1;

    }

    /**
     * @param {BaseVisitor} visitor
     */
    accept(visitor) {
        return visitor.visitReferenciaVariable(this);
    }
}
    
export class Print extends Expresion {

    /**
    * @param {Object} options
    * @param {Expresion} options.exp Expresion a imprimir
 * @param {string} options.operador Expresion a imprimir
    */
    constructor({ exp, operador }) {
        super();
        
        /**
         * Expresion a imprimir
         * @type {Expresion}
        */
        this.exp = exp;


        /**
         * Expresion a imprimir
         * @type {string}
        */
        this.operador = operador;

    }

    /**
     * @param {BaseVisitor} visitor
     */
    accept(visitor) {
        return visitor.visitPrint(this);
    }
}
    
export class ExpresionStmt extends Expresion {

    /**
    * @param {Object} options
    * @param {Expresion} options.exp Expresion a evaluar
    */
    constructor({ exp }) {
        super();
        
        /**
         * Expresion a evaluar
         * @type {Expresion}
        */
        this.exp = exp;

    }

    /**
     * @param {BaseVisitor} visitor
     */
    accept(visitor) {
        return visitor.visitExpresionStmt(this);
    }
}
    
export class Asignacion extends Expresion {

    /**
    * @param {Object} options
    * @param {string} options.id Identificador de la variable
 * @param {Expresion} options.asgn Expresion a asignar
    */
    constructor({ id, asgn }) {
        super();
        
        /**
         * Identificador de la variable
         * @type {string}
        */
        this.id = id;


        /**
         * Expresion a asignar
         * @type {Expresion}
        */
        this.asgn = asgn;

    }

    /**
     * @param {BaseVisitor} visitor
     */
    accept(visitor) {
        return visitor.visitAsignacion(this);
    }
}
    
export class Bloque extends Expresion {

    /**
    * @param {Object} options
    * @param {Expresion[]} options.dcls Sentencias del bloque
    */
    constructor({ dcls }) {
        super();
        
        /**
         * Sentencias del bloque
         * @type {Expresion[]}
        */
        this.dcls = dcls;

    }

    /**
     * @param {BaseVisitor} visitor
     */
    accept(visitor) {
        return visitor.visitBloque(this);
    }
}
    
export class If extends Expresion {

    /**
    * @param {Object} options
    * @param {Expresion} options.cond Condicion del if
 * @param {Expresion} options.stmtTrue Cuerpo del if
 * @param {Expresion|undefined} options.stmtFalse Cuerpo del else
    */
    constructor({ cond, stmtTrue, stmtFalse }) {
        super();
        
        /**
         * Condicion del if
         * @type {Expresion}
        */
        this.cond = cond;


        /**
         * Cuerpo del if
         * @type {Expresion}
        */
        this.stmtTrue = stmtTrue;


        /**
         * Cuerpo del else
         * @type {Expresion|undefined}
        */
        this.stmtFalse = stmtFalse;

    }

    /**
     * @param {BaseVisitor} visitor
     */
    accept(visitor) {
        return visitor.visitIf(this);
    }
}
    
export class While extends Expresion {

    /**
    * @param {Object} options
    * @param {Expresion} options.cond Condicion del while
 * @param {Expresion} options.stmt Cuerpo del while
    */
    constructor({ cond, stmt }) {
        super();
        
        /**
         * Condicion del while
         * @type {Expresion}
        */
        this.cond = cond;


        /**
         * Cuerpo del while
         * @type {Expresion}
        */
        this.stmt = stmt;

    }

    /**
     * @param {BaseVisitor} visitor
     */
    accept(visitor) {
        return visitor.visitWhile(this);
    }
}
    
export class Incrementador extends Expresion {

    /**
    * @param {Object} options
    * @param {string} options.id Identificador de la variable
 * @param {string} options.op op de la variable
 * @param {Expresion} options.exp Expresion de la variable
    */
    constructor({ id, op, exp }) {
        super();
        
        /**
         * Identificador de la variable
         * @type {string}
        */
        this.id = id;


        /**
         * op de la variable
         * @type {string}
        */
        this.op = op;


        /**
         * Expresion de la variable
         * @type {Expresion}
        */
        this.exp = exp;

    }

    /**
     * @param {BaseVisitor} visitor
     */
    accept(visitor) {
        return visitor.visitIncrementador(this);
    }
}
    
export class For extends Expresion {

    /**
    * @param {Object} options
    * @param {Expresion} options.init Inicializacion del for
 * @param {Expresion} options.cond Condicion del for
 * @param {Expresion} options.inc Incremento del for
 * @param {Expresion} options.stmt Cuerpo del for
    */
    constructor({ init, cond, inc, stmt }) {
        super();
        
        /**
         * Inicializacion del for
         * @type {Expresion}
        */
        this.init = init;


        /**
         * Condicion del for
         * @type {Expresion}
        */
        this.cond = cond;


        /**
         * Incremento del for
         * @type {Expresion}
        */
        this.inc = inc;


        /**
         * Cuerpo del for
         * @type {Expresion}
        */
        this.stmt = stmt;

    }

    /**
     * @param {BaseVisitor} visitor
     */
    accept(visitor) {
        return visitor.visitFor(this);
    }
}
    
export class Break extends Expresion {

    /**
    * @param {Object} options
    * 
    */
    constructor() {
        super();
        
    }

    /**
     * @param {BaseVisitor} visitor
     */
    accept(visitor) {
        return visitor.visitBreak(this);
    }
}
    
export class Continue extends Expresion {

    /**
    * @param {Object} options
    * 
    */
    constructor() {
        super();
        
    }

    /**
     * @param {BaseVisitor} visitor
     */
    accept(visitor) {
        return visitor.visitContinue(this);
    }
}
    
export class Return extends Expresion {

    /**
    * @param {Object} options
    * @param {Expresion|undefined} options.exp Expresion a retornar
    */
    constructor({ exp }) {
        super();
        
        /**
         * Expresion a retornar
         * @type {Expresion|undefined}
        */
        this.exp = exp;

    }

    /**
     * @param {BaseVisitor} visitor
     */
    accept(visitor) {
        return visitor.visitReturn(this);
    }
}
    
export class Ternario extends Expresion {

    /**
    * @param {Object} options
    * @param {Expresion} options.cond Condicion del if
 * @param {Expresion} options.stmtTrue Cuerpo del if
 * @param {Expresion|undefined} options.stmtFalse Cuerpo del else
    */
    constructor({ cond, stmtTrue, stmtFalse }) {
        super();
        
        /**
         * Condicion del if
         * @type {Expresion}
        */
        this.cond = cond;


        /**
         * Cuerpo del if
         * @type {Expresion}
        */
        this.stmtTrue = stmtTrue;


        /**
         * Cuerpo del else
         * @type {Expresion|undefined}
        */
        this.stmtFalse = stmtFalse;

    }

    /**
     * @param {BaseVisitor} visitor
     */
    accept(visitor) {
        return visitor.visitTernario(this);
    }
}
    
export class Switch extends Expresion {

    /**
    * @param {Object} options
    * @param {Expresion} options.cond Condicion del switch
 * @param {Expresion[] | undefined} options.cases Casos del switch
 * @param {Expresion[]} options.defaults Caso por defecto
    */
    constructor({ cond, cases, defaults }) {
        super();
        
        /**
         * Condicion del switch
         * @type {Expresion}
        */
        this.cond = cond;


        /**
         * Casos del switch
         * @type {Expresion[] | undefined}
        */
        this.cases = cases;


        /**
         * Caso por defecto
         * @type {Expresion[]}
        */
        this.defaults = defaults;

    }

    /**
     * @param {BaseVisitor} visitor
     */
    accept(visitor) {
        return visitor.visitSwitch(this);
    }
}
    
export class Casos extends Expresion {

    /**
    * @param {Object} options
    * @param {Expresion} options.conds Condicion del case
 * @param {Expresion[]} options.stmtCases Cuerpo del case
    */
    constructor({ conds, stmtCases }) {
        super();
        
        /**
         * Condicion del case
         * @type {Expresion}
        */
        this.conds = conds;


        /**
         * Cuerpo del case
         * @type {Expresion[]}
        */
        this.stmtCases = stmtCases;

    }

    /**
     * @param {BaseVisitor} visitor
     */
    accept(visitor) {
        return visitor.visitCasos(this);
    }
}
    
export class Array extends Expresion {

    /**
    * @param {Object} options
    * @param {String} options.tipo tipo del array
 * @param {String} options.id identificador del array
 * @param {Expresion[]} options.exp Cuerpo del array
    */
    constructor({ tipo, id, exp }) {
        super();
        
        /**
         * tipo del array
         * @type {String}
        */
        this.tipo = tipo;


        /**
         * identificador del array
         * @type {String}
        */
        this.id = id;


        /**
         * Cuerpo del array
         * @type {Expresion[]}
        */
        this.exp = exp;

    }

    /**
     * @param {BaseVisitor} visitor
     */
    accept(visitor) {
        return visitor.visitArray(this);
    }
}
    
export class Array1 extends Expresion {

    /**
    * @param {Object} options
    * @param {String} options.tipo tipo del array
 * @param {String} options.id identificador del array
 * @param {String} options.tipo1 Cuerpo del array
 * @param {Expresion} options.exp Cuerpo del array
    */
    constructor({ tipo, id, tipo1, exp }) {
        super();
        
        /**
         * tipo del array
         * @type {String}
        */
        this.tipo = tipo;


        /**
         * identificador del array
         * @type {String}
        */
        this.id = id;


        /**
         * Cuerpo del array
         * @type {String}
        */
        this.tipo1 = tipo1;


        /**
         * Cuerpo del array
         * @type {Expresion}
        */
        this.exp = exp;

    }

    /**
     * @param {BaseVisitor} visitor
     */
    accept(visitor) {
        return visitor.visitArray1(this);
    }
}
    
export class Array2 extends Expresion {

    /**
    * @param {Object} options
    * @param {String} options.tipo tipo del array
 * @param {String} options.id identificador del array
 * @param {String} options.id1 Cuerpo del array
    */
    constructor({ tipo, id, id1 }) {
        super();
        
        /**
         * tipo del array
         * @type {String}
        */
        this.tipo = tipo;


        /**
         * identificador del array
         * @type {String}
        */
        this.id = id;


        /**
         * Cuerpo del array
         * @type {String}
        */
        this.id1 = id1;

    }

    /**
     * @param {BaseVisitor} visitor
     */
    accept(visitor) {
        return visitor.visitArray2(this);
    }
}
    
export class FuncArray extends Expresion {

    /**
    * @param {Object} options
    * @param {Expresion} options.id Expresion que es el id
 * @param {String | undefined} options.tipos El tipo de func
 * @param {Expresion | undefined} options.expr1 Expresion que puede venir
    */
    constructor({ id, tipos, expr1 }) {
        super();
        
        /**
         * Expresion que es el id
         * @type {Expresion}
        */
        this.id = id;


        /**
         * El tipo de func
         * @type {String | undefined}
        */
        this.tipos = tipos;


        /**
         * Expresion que puede venir
         * @type {Expresion | undefined}
        */
        this.expr1 = expr1;

    }

    /**
     * @param {BaseVisitor} visitor
     */
    accept(visitor) {
        return visitor.visitFuncArray(this);
    }
}
    
export class ForEach extends Expresion {

    /**
    * @param {Object} options
    * @param {String} options.tipo Expresion que es el id
 * @param {String} options.id El tipo de func
 * @param {String} options.id1 Expresion que puede venir
 * @param {Expresiones} options.stmt Expresion que puede venir
    */
    constructor({ tipo, id, id1, stmt }) {
        super();
        
        /**
         * Expresion que es el id
         * @type {String}
        */
        this.tipo = tipo;


        /**
         * El tipo de func
         * @type {String}
        */
        this.id = id;


        /**
         * Expresion que puede venir
         * @type {String}
        */
        this.id1 = id1;


        /**
         * Expresion que puede venir
         * @type {Expresiones}
        */
        this.stmt = stmt;

    }

    /**
     * @param {BaseVisitor} visitor
     */
    accept(visitor) {
        return visitor.visitForEach(this);
    }
}
    
export class AsignacionVec1 extends Expresion {

    /**
    * @param {Object} options
    * @param {string} options.id Identificador de la variable
 * @param {string} options.exp Identificador de la variable
 * @param {Expresion} options.asgn Expresion a asignar
    */
    constructor({ id, exp, asgn }) {
        super();
        
        /**
         * Identificador de la variable
         * @type {string}
        */
        this.id = id;


        /**
         * Identificador de la variable
         * @type {string}
        */
        this.exp = exp;


        /**
         * Expresion a asignar
         * @type {Expresion}
        */
        this.asgn = asgn;

    }

    /**
     * @param {BaseVisitor} visitor
     */
    accept(visitor) {
        return visitor.visitAsignacionVec1(this);
    }
}
    
export class Matriz extends Expresion {

    /**
    * @param {Object} options
    * @param {String} options.tipo tipo del array
 * @param {String[]} options.dimension dimension de la matriz
 * @param {String} options.id identificador del array
 * @param {Expresion} options.array Cuerpo del array
    */
    constructor({ tipo, dimension, id, array }) {
        super();
        
        /**
         * tipo del array
         * @type {String}
        */
        this.tipo = tipo;


        /**
         * dimension de la matriz
         * @type {String[]}
        */
        this.dimension = dimension;


        /**
         * identificador del array
         * @type {String}
        */
        this.id = id;


        /**
         * Cuerpo del array
         * @type {Expresion}
        */
        this.array = array;

    }

    /**
     * @param {BaseVisitor} visitor
     */
    accept(visitor) {
        return visitor.visitMatriz(this);
    }
}
    
export class Matriz1 extends Expresion {

    /**
    * @param {Object} options
    * @param {String} options.tipo tipo del array
 * @param {String[]} options.dimension dimension de la matriz
 * @param {String} options.id identificador del array
 * @param {String} options.tipo1 identificador del array
 * @param {Expresion} options.array Cuerpo del array
    */
    constructor({ tipo, dimension, id, tipo1, array }) {
        super();
        
        /**
         * tipo del array
         * @type {String}
        */
        this.tipo = tipo;


        /**
         * dimension de la matriz
         * @type {String[]}
        */
        this.dimension = dimension;


        /**
         * identificador del array
         * @type {String}
        */
        this.id = id;


        /**
         * identificador del array
         * @type {String}
        */
        this.tipo1 = tipo1;


        /**
         * Cuerpo del array
         * @type {Expresion}
        */
        this.array = array;

    }

    /**
     * @param {BaseVisitor} visitor
     */
    accept(visitor) {
        return visitor.visitMatriz1(this);
    }
}
    
export class Llamada extends Expresion {

    /**
    * @param {Object} options
    * @param {Expresion} options.callee Expresion a llamar
 * @param {Expresion[]} options.args Argumentos de la llamada
    */
    constructor({ callee, args }) {
        super();
        
        /**
         * Expresion a llamar
         * @type {Expresion}
        */
        this.callee = callee;


        /**
         * Argumentos de la llamada
         * @type {Expresion[]}
        */
        this.args = args;

    }

    /**
     * @param {BaseVisitor} visitor
     */
    accept(visitor) {
        return visitor.visitLlamada(this);
    }
}
    
export class FuncDcl extends Expresion {

    /**
    * @param {Object} options
    * @param {String} options.tipo tipo del array
 * @param {String[]} options.dimension dimension de la matriz
 * @param {string} options.id Identificador de la funcion
 * @param {string[]} options.params Parametros de la funcion
 * @param {Bloque} options.bloque Cuerpo de la funcion
    */
    constructor({ tipo, dimension, id, params, bloque }) {
        super();
        
        /**
         * tipo del array
         * @type {String}
        */
        this.tipo = tipo;


        /**
         * dimension de la matriz
         * @type {String[]}
        */
        this.dimension = dimension;


        /**
         * Identificador de la funcion
         * @type {string}
        */
        this.id = id;


        /**
         * Parametros de la funcion
         * @type {string[]}
        */
        this.params = params;


        /**
         * Cuerpo de la funcion
         * @type {Bloque}
        */
        this.bloque = bloque;

    }

    /**
     * @param {BaseVisitor} visitor
     */
    accept(visitor) {
        return visitor.visitFuncDcl(this);
    }
}
    
export class ClassDcl extends Expresion {

    /**
    * @param {Object} options
    * @param {string} options.id Identificador de la clase
 * @param {Expresion[]} options.dcls Declaraciones de la clase
    */
    constructor({ id, dcls }) {
        super();
        
        /**
         * Identificador de la clase
         * @type {string}
        */
        this.id = id;


        /**
         * Declaraciones de la clase
         * @type {Expresion[]}
        */
        this.dcls = dcls;

    }

    /**
     * @param {BaseVisitor} visitor
     */
    accept(visitor) {
        return visitor.visitClassDcl(this);
    }
}
    
export class Instancia extends Expresion {

    /**
    * @param {Object} options
    * @param {string} options.id Identificador de la clase
 * @param {Expresion[]} options.args Argumentos de la instancia
    */
    constructor({ id, args }) {
        super();
        
        /**
         * Identificador de la clase
         * @type {string}
        */
        this.id = id;


        /**
         * Argumentos de la instancia
         * @type {Expresion[]}
        */
        this.args = args;

    }

    /**
     * @param {BaseVisitor} visitor
     */
    accept(visitor) {
        return visitor.visitInstancia(this);
    }
}
    
export class Get extends Expresion {

    /**
    * @param {Object} options
    * @param {Expresion} options.objetivo Objeto de la propiedad
 * @param {string} options.propiedad Identificador de la propiedad
    */
    constructor({ objetivo, propiedad }) {
        super();
        
        /**
         * Objeto de la propiedad
         * @type {Expresion}
        */
        this.objetivo = objetivo;


        /**
         * Identificador de la propiedad
         * @type {string}
        */
        this.propiedad = propiedad;

    }

    /**
     * @param {BaseVisitor} visitor
     */
    accept(visitor) {
        return visitor.visitGet(this);
    }
}
    
export class Set extends Expresion {

    /**
    * @param {Object} options
    * @param {Expresion} options.objetivo Objeto de la propiedad
 * @param {string} options.propiedad Identificador de la propiedad
 * @param {Expresion} options.valor Valor de la propiedad
    */
    constructor({ objetivo, propiedad, valor }) {
        super();
        
        /**
         * Objeto de la propiedad
         * @type {Expresion}
        */
        this.objetivo = objetivo;


        /**
         * Identificador de la propiedad
         * @type {string}
        */
        this.propiedad = propiedad;


        /**
         * Valor de la propiedad
         * @type {Expresion}
        */
        this.valor = valor;

    }

    /**
     * @param {BaseVisitor} visitor
     */
    accept(visitor) {
        return visitor.visitSet(this);
    }
}
    
export class Comentarios extends Expresion {

    /**
    * @param {Object} options
    * @param {string} options.texto texto del comentario
 * @param {string} options.tipo Tipo del primitivo
    */
    constructor({ texto, tipo }) {
        super();
        
        /**
         * texto del comentario
         * @type {string}
        */
        this.texto = texto;


        /**
         * Tipo del primitivo
         * @type {string}
        */
        this.tipo = tipo;

    }

    /**
     * @param {BaseVisitor} visitor
     */
    accept(visitor) {
        return visitor.visitComentarios(this);
    }
}
    
export default { Expresion, OperacionBinaria, OperacionUnaria, Agrupacion, Primitivo, Numero, DeclaracionVariable, ReferenciaVariable, Print, ExpresionStmt, Asignacion, Bloque, If, While, Incrementador, For, Break, Continue, Return, Ternario, Switch, Casos, Array, Array1, Array2, FuncArray, ForEach, AsignacionVec1, Matriz, Matriz1, Llamada, FuncDcl, ClassDcl, Instancia, Get, Set, Comentarios }
