import { Entorno } from "./entorno.js";
import { BaseVisitor } from "../herramientas/visitor.js";
import nodos, { Expresion } from '../herramientas/nodos.js'
import { BreakException, ContinueException, ReturnException } from "../Instrucciones/transferencias.js";
import { Invocable } from "../Funciones/invocables.js";
import { embebidas } from "../Funciones/enbebidas.js";
import { FuncionForanea } from "../Funciones/foranea.js";
import { Clase } from "../Funciones/clase.js";
import { Instancia } from "../Funciones/instancia.js";


function procesarTexto(texto) {
  // Define las secuencias de escape válidas en un arreglo
  const secuenciasValidas = ['\\,r', '\\,t', '\\,\'', '\\,"', '\\,\\', '\\,n'];

  // Verifica si hay secuencias no reconocidas
  const regex = /\\,./g; // Busca todas las secuencias \, seguido de cualquier carácter
  const secuenciasEncontradas = texto.match(regex);

  if (secuenciasEncontradas) {
    for (let secuencia of secuenciasEncontradas) {
      if (!secuenciasValidas.includes(secuencia)) {
        throw new Error(`Error: la secuencia de escape '${secuencia}' no es válida.`);
      }
    }
  }

  // Reemplaza las secuencias de escape personalizadas por las reales
  return texto
    .replace(/\\,r/g, '\r')   // Reemplaza \,r por \r
    .replace(/\\,t/g, '\t')   // Reemplaza \,t por \t
    .replace(/\\,'/g, '\'')   // Reemplaza \,' por '
    .replace(/\\,"/g, '\"')   // Reemplaza \," por "
    .replace(/\\,\\/g, '\\')  // Reemplaza \,\ por \
    .replace(/\\,n/g, '\n');  // Reemplaza \,n por \n
}
  
export class InterpreterVisitor extends BaseVisitor {

    constructor() {
        super();
        this.entornoActual = new Entorno();

        // funciones embebidas
        Object.entries(embebidas).forEach(([nombre, funcion]) => {
          this.entornoActual.set(nombre, funcion);
        });

        this.salida = '';

        this.tablaSimbolos = [];

        /**
         * @type {Expresion | null}
        */
        this.prevContinue = null;
    }

    
    interpretar(nodo) {
      return nodo.accept(this);
    }
    
    
    /**
      * @type {BaseVisitor['visitOperacionBinaria']}
    */
    visitOperacionBinaria(node) {
        const izq = node.izq.accept(this);
        const der = node.der.accept(this);

        switch (node.op) {
            case '+':
              if(Number.isInteger(izq)){
                if(Number.isInteger(der)){
                  return izq + der;
                } else {
                  return izq + parseFloat(der);
                }
              } if (typeof izq === 'string') {
                if (typeof der === 'string') {
                  return izq + der;
                }
              } else {
                if(Number.isInteger(der)){
                  return parseFloat(izq) + der;
                } else {
                  return parseFloat(izq) + parseFloat(der);
                }
              }
              throw new Error("ERROR NO SE PUEDE REALIZAR LA SUMA", "en la linea: ", node.location.start.line + "en la columna: " + node.location.start.column);
              case '-':
                // Convierte ambos operandos a flotantes para garantizar una resta correcta.
                const numIzq = parseFloat(izq);
                const numDer = parseFloat(der);
              
                // Verifica si ambos valores convertidos son números válidos.
                if (!isNaN(numIzq) && !isNaN(numDer)) {
                  return numIzq - numDer;
                }
              
                // Si no se pueden convertir a números válidos, lanza un error.
                throw new Error("ERROR: No se puede realizar la resta, los valores no son numéricos.", "en la linea: ", node.location.start.line + "en la columna: " + node.location.start.column);
                case '*':
                  // Convierte ambos operandos a flotantes y realiza la multiplicación.
                  const numIzqMult = parseFloat(izq);
                  const numDerMult = parseFloat(der);
                  
                  // Verifica si los valores son numéricos.
                  if (!isNaN(numIzqMult) && !isNaN(numDerMult)) {
                    return numIzqMult * numDerMult;
                  }
                  
                  throw new Error("ERROR: No se puede realizar la multiplicación, los valores no son numéricos.", "en la linea: ", node.location.start.line + "en la columna: " + node.location.start.column);
                
                case '/':
                  // Convierte ambos operandos a flotantes y realiza la división.
                  const numIzqDiv = parseFloat(izq);
                  const numDerDiv = parseFloat(der);
                  
                  // Verifica si los valores son numéricos y si el divisor no es cero.
                  if (!isNaN(numIzqDiv) && !isNaN(numDerDiv)) {
                    if (numDerDiv === 0) {
                      //throw new Error("ERROR: División por cero no permitida.",  "en la linea: ", node.location.start.line + "en la columna: " + node.location.start.column);
                    }
                    return numIzqDiv / numDerDiv;
                  }
                  
                  throw new Error("ERROR: No se puede realizar la división, los valores no son numéricos.",  "en la linea: ", node.location.start.line + "en la columna: " + node.location.start.column);
                
                case '%':
                  // Verifica si ambos operandos son enteros.
                  if (Number.isInteger(izq) && Number.isInteger(der)) {
                    if (der === 0) {
                      //throw new Error("ERROR: División por cero no permitida en la operación de módulo.",  "en la linea: ", node.location.start.line + "en la columna: " + node.location.start.column);
                    }
                    return izq % der;
                  }
                  
                  throw new Error("ERROR: No se puede realizar el módulo, ambos valores deben ser enteros.",  "en la linea: ", node.location.start.line + "en la columna: " + node.location.start.column);                
            case ",":
              return izq + der;
            case '+=':
              return izq + der;
            case '-=':
              return izq - der;
            case '!=':
              return izq != der;
            case '==':
              return izq == der;
            case '>':
              return izq > der;
            case '<':
              return izq < der;
            case '>=':
              return izq >= der;
            case '<=':
              return izq <= der;
            case '&&':
              return izq && der;
            case '||':
              return izq || der;
            default:
              throw new Error(`Operador no soportado: ${node.op}`);

        }
    }

    /**
      * @type {BaseVisitor['visitOperacionUnaria']}
      */
    visitOperacionUnaria(node) {
        const exp = node.exp.accept(this);

        switch (node.op) {
          case '-':
            if (typeof exp === 'number') {
              return -exp; // Negación si es un número (int o float)
            } else {
              throw new Error("ERROR: La operación '-' solo se puede aplicar a valores numéricos.");
            }
          case '!':
            if(typeof exp === 'boolean'){
              return !exp;
            } else {
              throw new Error("ERROR: La operación '!' solo se puede aplicar a valores booleanos.");
            }
          default:
              throw new Error(`Operador no soportado: ${node.op}`);
        }
    }

    /**
      * @type {BaseVisitor['visitAgrupacion']}
    */
    visitAgrupacion(node) {
      if (Array.isArray(node.exp)) {
          // Si node.exp es una lista de expresiones, iteramos sobre cada una.
          return node.exp.map(exp => exp.accept(this));
      } else {
          // Si node.exp no es una lista, simplemente llamamos accept en él.
          return node.exp.accept(this);
      }
    }

    /**
      * @type {BaseVisitor['visitNumero']}
      */
    visitNumero(node) {
        return node.valor;
    }

    /**
      * @type {BaseVisitor['visitPrimitivo']}
    */
    visitPrimitivo(node) {
      return node.valor;
    }

    /**
     *  @type {BaseVisitor['visitCadena']
    */

    visitCadena(node) {
      const textoProcesado = procesarTexto(node.valor);
      return textoProcesado;
      //return node.valor;
  }

    /**
     * @param {BaseVisitor} visitor
    */
      visitCaracter(node) {
        return node.valor;
    }

    /**
     * @param {Booleanos} node
     * @returns {any}
     */
    visitBooleanos(node) {
      const valorIngresado = node.valor;
      if(valorIngresado == "true"){
        return true;
      }
      if(valorIngresado == "false"){
        return false;
      }
    throw new Error("ERROR PALABRA INVALIDA");
  }


    /**
     * @type {BaseVisitor['visitDeclaracionVariable']}
     */
    visitDeclaracionVariable(node) {
      const tipoVariable = node.tipo;
      const nombreVariable = node.id;

      if (node.exp == undefined) {
          switch (tipoVariable) {
            case "int":
              this.entornoActual.set(nombreVariable, null);
              this.tablaSimbolos.push({ID: nombreVariable, tipo:"variable",tipoDato: tipoVariable, linea: node.location.start.line, columna: node.location.start.column});
              break;
            case "float":
              this.entornoActual.set(nombreVariable, null);
              this.tablaSimbolos.push({ID: nombreVariable, tipo:"variable",tipoDato: tipoVariable, linea: node.location.start.line, columna: node.location.start.column});
              break;
            case "char":
              this.entornoActual.set(nombreVariable, null);
              this.tablaSimbolos.push({ID: nombreVariable, tipo:"variable",tipoDato: tipoVariable, linea: node.location.start.line, columna: node.location.start.column});
              break;
            case "string":
              this.entornoActual.set(nombreVariable, null);
              this.tablaSimbolos.push({ID: nombreVariable, tipo:"variable",tipoDato: tipoVariable, linea: node.location.start.line, columna: node.location.start.column});
              break;
            case "boolean":
              this.entornoActual.set(nombreVariable, null);
              this.tablaSimbolos.push({ID: nombreVariable, tipo:"variable",tipoDato: tipoVariable, linea: node.location.start.line, columna: node.location.start.column});
              break;
            case "var":
              this.entornoActual.set(nombreVariable, null);
              this.tablaSimbolos.push({ID: nombreVariable, tipo:"variable",tipoDato: tipoVariable, linea: node.location.start.line, columna: node.location.start.column});
            default:
              throw new Error(`Error: tipo de variable ${tipoVariable} no reconocido.`);
          }
      } else {
        const valorVariable = node.exp.accept(this);

        switch (tipoVariable) {
          case "int":
            // Verifica si valorVariable es un número entero
            if (Number.isInteger(valorVariable)) {
              this.entornoActual.set(nombreVariable, valorVariable);
              this.tablaSimbolos.push({ID: nombreVariable, tipo:"variable",tipoDato: tipoVariable, linea: node.location.start.line, columna: node.location.start.column});
            } else {
              this.entornoActual.set(nombreVariable, null);
              this.tablaSimbolos.push({ID: nombreVariable, tipo:"variable",tipoDato: tipoVariable, linea: node.location.start.line, columna: node.location.start.column});
            }
            break;
        
          case "float":
            // Verifica si es un número y no un entero, lo que implica que es flotante
            if (typeof valorVariable === 'number' && !Number.isInteger(valorVariable)) {
              this.entornoActual.set(nombreVariable, valorVariable);
              this.tablaSimbolos.push({ID: nombreVariable, tipo:"variable",tipoDato: tipoVariable, linea: node.location.start.line, columna: node.location.start.column});
            } else {
              this.entornoActual.set(nombreVariable, null);
              this.tablaSimbolos.push({ID: nombreVariable, tipo:"variable",tipoDato: tipoVariable, linea: node.location.start.line, columna: node.location.start.column});
            }
            break;
        
          case "char":
            // Verifica si es un string de longitud 1
            if (typeof valorVariable === 'string' && valorVariable.length === 1) {
              this.entornoActual.set(nombreVariable, valorVariable);
              this.tablaSimbolos.push({ID: nombreVariable, tipo:"variable",tipoDato: tipoVariable, linea: node.location.start.line, columna: node.location.start.column});
            } else {
              this.entornoActual.set(nombreVariable, null);
              this.tablaSimbolos.push({ID: nombreVariable, tipo:"variable",tipoDato: tipoVariable, linea: node.location.start.line, columna: node.location.start.column});
            }
            break;
        
          case "string":
            // Verifica si es un string
            if (typeof valorVariable === 'string') {
              this.entornoActual.set(nombreVariable, valorVariable);
              this.tablaSimbolos.push({ID: nombreVariable, tipo:"variable",tipoDato: tipoVariable, linea: node.location.start.line, columna: node.location.start.column});
            } else {
              this.entornoActual.set(nombreVariable, null);
              this.tablaSimbolos.push({ID: nombreVariable, tipo:"variable",tipoDato: tipoVariable, linea: node.location.start.line, columna: node.location.start.column});
            }
            break;
        
          case "var":
            // Acepta cualquier tipo de valor
            this.entornoActual.set(nombreVariable, valorVariable);
            this.tablaSimbolos.push({ID: nombreVariable, tipo:"variable",tipoDato: tipoVariable, linea: node.location.start.line, columna: node.location.start.column});
            break;
        
          case "boolean":
            // Verifica si es un booleano
            if (typeof valorVariable === 'boolean') {
              this.entornoActual.set(nombreVariable, valorVariable);
              this.tablaSimbolos.push({ID: nombreVariable, tipo:"variable",tipoDato: tipoVariable, linea: node.location.start.line, columna: node.location.start.column});
            } else {
              this.entornoActual.set(nombreVariable, null);
              this.tablaSimbolos.push({ID: nombreVariable, tipo:"variable",tipoDato: tipoVariable, linea: node.location.start.line, columna: node.location.start.column});
            }
            break;
        
          default:
            // Para cualquier tipo de variable no reconocido, se asigna null
            this.entornoActual.set(nombreVariable, null);
            this.tablaSimbolos.push({ID: nombreVariable, tipo:"variable",tipoDato: tipoVariable, linea: node.location.start.line, columna: node.location.start.column});
            break;
        }        
      }
    }
    

    /**
      * @type {BaseVisitor['visitReferenciaVariable']}
      */
    visitReferenciaVariable(node) {
      // Obtener el nombre de la variable desde el nodo
      const nombreVariable = node.id;
      const expresion = node.expr1;

      console.log("nombre de variable"+nombreVariable);

      if(nombreVariable === "typeof"){
        // Verificar si el argumento es un número
        const datoP = expresion.accept(this);
        if (typeof datoP === 'number') {
          // Identificar si es un entero o un flotante
          if (Number.isInteger(datoP)) {
              return 'int';
          } else {
              return 'float';
          }
        }
        // Verificar si el argumento es un string
        if (typeof datoP === 'string') {
          // Diferenciar entre string y char
          if (datoP.length === 1) {
              return 'char';
          } else {
              return 'string';
          }
        }
        return typeof datoP
      }

      // Lógica para manejar Object.keys()
      if (nombreVariable === "Object.keys(") {
        // Verificar si el argumento es una instancia de clase
        const objeto = expresion.accept(this);
        const propiedades = Object.keys(objeto.propiedades);
        return propiedades;
      }
      
      if(expresion.length == 0){
        return this.entornoActual.get(nombreVariable);
      }

      const valorArray =  this.entornoActual.get(nombreVariable);
      console.log("este es el valor del array: ", valorArray);

      // Verificar que `valorArray` sea un array
      if (!Array.isArray(valorArray)) {
        throw new Error(`Error: la variable no es un array`);
      }

      if(expresion.length >= 1){
      // Accede al valor en la posición especificada por `Expresion2`
      let valorActual = valorArray;

      // Recorrer los índices especificados en `Expresion2`
      for (const datos of expresion) {
        const indice = datos.accept(this);

        // Verificar que el índice sea un número válido dentro del rango
        if (typeof indice !== 'number' || indice < 0 || indice >= valorActual.length) {
          throw new Error(`Índice fuera de rango: ${indice}`);
        }

          // Navegar al siguiente nivel del array
          valorActual = valorActual[indice];
        }

        // Mostrar y retornar el valor encontrado
        console.log("Valor encontrado:", valorActual);
        return valorActual;
      }
      // Aquí puedes agregar el manejo del caso cuando expresion no está vacío
      // por ejemplo, ejecutar lógica adicional basada en el valor de expresion.
    }
     


    /**
      * @type {BaseVisitor['visitPrint']}
      */
    visitPrint(node) {
        /*const valor = node.exp.accept(this);
        this.salida += valor + '\n';*/
        for(const valores of node.exp){
          const valor = valores.accept(this);
          this.salida += valor + " " ;
        }
        this.salida += "\n";
    }


    /**
      * @type {BaseVisitor['visitExpresionStmt']}
      */
    visitExpresionStmt(node) {
        node.exp.accept(this);
    }

     /**
     * @type {BaseVisitor['visitAsignacion']}
     */
  
     visitAsignacion(node) {
      // Interpreta el valor de la asignación
      const valor = node.asgn.accept(this);
      const nombreVariable = node.id;
      
      // Obtiene el valor actual de la variable para verificar su tipo
      const valorObtenido = this.entornoActual.get(nombreVariable);
      const valorTipo = typeof valorObtenido;
      const nuevoValorTipo = typeof valor; // Tipo del valor a asignar
      
      console.log("Tipo actual de la variable: " + valorTipo);
      console.log("Tipo del nuevo valor: " + nuevoValorTipo);
      
      // Verifica si el tipo del nuevo valor coincide con el tipo de la variable existente
      if (nuevoValorTipo === valorTipo || valorTipo === "undefined") {
        // Si los tipos coinciden o si la variable no tenía un valor previo, asigna el nuevo valor
        this.entornoActual.assign(nombreVariable, valor);
      } else {
        // Si los tipos no coinciden, asigna null
        this.entornoActual.assign(nombreVariable, null);
      }
    
      return valor;
    }
    

    /**
   * @type {BaseVisitor['visitBloque']}
   */
    visitBloque(node) {
      const entornoAnterior = this.entornoActual;
      this.entornoActual = new Entorno(entornoAnterior);

      node.dcls.forEach(dcl => dcl.accept(this));

      this.entornoActual = entornoAnterior;
    }

    /**
     * @type {BaseVisitor['visitIf']}
     */
    visitIf(node) {
      const cond = node.cond.accept(this);
      if (cond) {
          node.stmtTrue.accept(this);
          return;
      }

      if (node.stmtFalse) {
          node.stmtFalse.accept(this);
      }
    }

    /**
     * @type {BaseVisitor['visitWhile']}
     */
    visitWhile(node) {
      const entornoConElQueEmpezo = this.entornoActual;

      try {
          while (node.cond.accept(this)) {
              node.stmt.accept(this);
          }
      } catch (error) {
          this.entornoActual = entornoConElQueEmpezo;

          if (error instanceof BreakException) {
              console.log('break');
              return
          }

          if (error instanceof ContinueException) {
              return this.visitWhile(node);
          }

          throw error;

      }
    }

      /**
       * @param {Incrementador} node
       * @returns {any}
       */
      visitIncrementador(node) {
        const nombreVariable = node.id;
        const operador = node.op;
        const valorActual = this.entornoActual.get(nombreVariable);
      
        if (node.exp === undefined) {
          // Maneja los operadores ++ y --
          let nuevoValor;
          switch (operador) {
            case '++':
              nuevoValor = valorActual + 1;
              this.entornoActual.assign(nombreVariable, nuevoValor);
              return nuevoValor;
            case '--':
              nuevoValor = valorActual - 1;
              this.entornoActual.assign(nombreVariable, nuevoValor);
              return nuevoValor;
            default:
              throw new Error(`Operador no soportado: ${operador}`);
          }
        } else {
          // Maneja los operadores += y -=
          const valorIncrementar = node.exp.accept(this);
          console.log("Este es el operador: ", operador);
          let nuevoValor;
      
          switch (operador) {
            case '+=':
              nuevoValor = valorActual + valorIncrementar;
              this.entornoActual.assign(nombreVariable, nuevoValor);
              return nuevoValor;
            case '-=':
              nuevoValor = valorActual - valorIncrementar;
              this.entornoActual.assign(nombreVariable, nuevoValor);
              return nuevoValor;
            default:
              throw new Error(`Operador no soportado: ${operador}`);
          }
        }
      }

      /**
       * @type {BaseVisitor['visitFor']}
       */
      visitFor(node) {
        // this.prevContinue = node.inc;
        const incrementoAnterior = this.prevContinue;
        this.prevContinue = node.inc;

        const forTraducido = new nodos.Bloque({
            dcls: [
                node.init,
                new nodos.While({
                    cond: node.cond,
                    stmt: new nodos.Bloque({
                        dcls: [
                            node.stmt,
                            node.inc
                        ]
                    })
                })
            ]
        })

        forTraducido.accept(this);

        this.prevContinue = incrementoAnterior;
    }

      /**
       * @type {BaseVisitor['visitBreak']}
      */
      visitBreak(node) {
        throw new BreakException();
      } 

    /**
     * @type {BaseVisitor['visitContinue']}
    */
    visitContinue(node) {
      if (this.prevContinue) {
          this.prevContinue.accept(this);
      }

      throw new ContinueException();
    }

    /**
     * @type {BaseVisitor['visitReturn']}
    */
    visitReturn(node) {
      let valor = null
      if (node.exp) {
          valor = node.exp.accept(this);
      }
      throw new ReturnException(valor);
    }

    /**
     * @param {Ternario} node
     * @returns {any}
    */
    visitTernario(node) {
      const cond = node.cond.accept(this);

      // Si la condición es verdadera, ejecuta y devuelve el resultado del bloque verdadero
      // Si no, ejecuta y devuelve el resultado del bloque falso
      return cond ? node.stmtTrue.accept(this) : node.stmtFalse ? node.stmtFalse.accept(this) : null;
    }

    /**
     * @param {Switch} node
     * @returns {any}
     */
    visitSwitch(node) {
      const entornoConElQueEmpezo = this.entornoActual;
    
      try {
        const cond = node.cond.accept(this); // Evaluar la condición del switch
        let casoEvaluado = false;
    
        // Recorrer cada caso y evaluar la condición
        for (let caso of node.cases) {
          // Asegurarse de que cond1 existe y es evaluable
          console.log("condicional " , caso.conds);

          for(let casos of caso.conds){
            const casoCond = casos.accept(this);
    
            if (casoCond === cond) {
              casoEvaluado = true;
              try {
                for (let stmt of caso.stmtCases) {
                  stmt.accept(this);
                }
              } catch (error) {
                this.entornoActual = entornoConElQueEmpezo;
                if (error instanceof ContinueException) {
                  // Lanza nuevamente para que el bucle for externo pueda capturarlo
                  throw error;
                }
                if (error instanceof BreakException) {
                  console.log('Se encontró un break dentro del switch, final');
                  return;
                }
                throw error; // Propagar otros errores
              }
            }
          }
        }
    
        // Si ningún caso fue evaluado, ejecutar default si existe
        if (!casoEvaluado && node.defaults) {
          for (let defaul of node.defaults) {
            defaul.accept(this);
          }
        }
    
      } catch (error) {
        this.entornoActual = entornoConElQueEmpezo;
    
        if (error instanceof BreakException) {
          console.log('Se encontró un break en el switch');
          return;
        }
    
        if (error instanceof ContinueException) {
          // Lanza nuevamente para que el bucle for externo pueda capturarlo
          throw error;
        }
        throw error;
      }
    }
    
    /**
     * @param {Casos} node
     * @returns {any}
    */
    visitCasos(node) {
      // Ejecutar cada expresión dentro de stmtCases
      const entornoConElQueEmpezo = this.entornoActual;
      try{
        for (let stmt of node.stmtCases) {
          stmt.accept(this);
        }
      } catch (error) {
        this.entornoActual = entornoConElQueEmpezo;
        if (error instanceof ContinueException) {
          // Lanza nuevamente para que el bucle for externo pueda capturarlo
          throw error;
        }
        if (error instanceof BreakException) {
          console.log('Se encontró un break dentro del switch, final');
          return;
        }
        throw error; // Propagar otros errores
      }
    }

    /**
     * @param {Array} node
     * @returns {any}
     */
    visitArray(node) {
      const tipoEntrada = node.tipo;  // tipo del array (int, float, string, boolean, char)
      const id = node.id;
      console.log("El tipo es: ", tipoEntrada);
      console.log("El id es: ", id);
    
      const valoresValidos = [];  // Array para almacenar los valores validados
    
      for (const valor of node.exp) {
        const valorAceptado = valor.accept(this);
    
        // Validar el tipo del valor aceptado con el tipo de entrada
        switch (tipoEntrada) {
          case 'int':
            if (typeof valorAceptado !== 'number' || !Number.isInteger(valorAceptado)) {
              throw new Error(`Tipo de valor incorrecto. Se esperaba int, pero se recibió ${typeof valorAceptado}.`);
            }
            break;
          case 'float':
            if (typeof valorAceptado !== 'number' || Number.isInteger(valorAceptado)) {
              throw new Error(`Tipo de valor incorrecto. Se esperaba float, pero se recibió ${typeof valorAceptado}.`);
            }
            break;
          case 'string':
            if (typeof valorAceptado !== 'string') {
              throw new Error(`Tipo de valor incorrecto. Se esperaba string, pero se recibió ${typeof valorAceptado}.`);
            }
            break;
          case 'boolean':
            if (typeof valorAceptado !== 'boolean') {
              throw new Error(`Tipo de valor incorrecto. Se esperaba boolean, pero se recibió ${typeof valorAceptado}.`);
            }
            break;
          case 'char':
            if (typeof valorAceptado !== 'string' || valorAceptado.length !== 1) {
              throw new Error(`Tipo de valor incorrecto. Se esperaba char, pero se recibió ${typeof valorAceptado}.`);
            }
            break;
          default:
            throw new Error(`Tipo de dato no reconocido: ${tipoEntrada}.`);
        }
    
        // Si el valor es válido, se agrega al array de valores válidos
        valoresValidos.push(valorAceptado);
      }
    
      // Almacenar los valores en el entorno actual
      this.entornoActual.set(id, valoresValidos);
      this.tablaSimbolos.push({ID: id, tipo:"Arreglo",tipoDato: tipoEntrada, linea: node.location.start.line, columna: node.location.start.column});
    }

    /**
     * @param {Array1} node
     * @returns {any}
     */
    visitArray1(node) {
      const tipoEntrada1 = node.tipo;  // Tipo del primer array (debe ser int)
      const tipoEntrada2 = node.tipo1; // Tipo del segundo array (debe ser int)
      
      // Validar que ambos tipos sean iguales y sean 'int'
      if (tipoEntrada1 !== tipoEntrada2) {
        throw new Error(`Los tipos de los arrays no coinciden: ${tipoEntrada1} y ${tipoEntrada2}.`);
      }
      
      if (tipoEntrada1 !== 'int' && tipoEntrada1 !== 'float' && tipoEntrada1 !== 'string' && tipoEntrada1 !== 'char' && tipoEntrada1 !== 'boolean') {
        throw new Error(`Tipo de dato incorrecto: ${tipoEntrada1}.`);
      }
      
      // Obtener el tamaño del array (suponiendo que node.exp representa el tamaño)
      const tamañoArray = node.exp.accept(this);  // Aquí se asume que node.exp proporciona el tamaño del array
      
      // Crear y llenar el array con valores predeterminados según el tipo
      const arreglo = new Array(tamañoArray);
      
      switch(tipoEntrada1) {
        case 'int':
          arreglo.fill(0);
          break;
        case 'float':
          arreglo.fill(0.0);
          break;
        case 'string':
          arreglo.fill("");
          break;
        case 'char':
          arreglo.fill('');  // En JavaScript, un char se maneja como una cadena de un solo carácter
          break;
        case 'boolean':
          arreglo.fill(false);
          break;
        default:
          throw new Error(`No se pudo hacer la asignación para el tipo: ${tipoEntrada1}`);
      }
      
      // Almacenar el array en el entorno actual
      this.entornoActual.set(node.id, arreglo);
      this.tablaSimbolos.push({ID: node.id, tipo:"Arreglo",tipoDato: tipoEntrada1, linea: node.location.start.line, columna: node.location.start.column});
    }
    /**
     * @param {Array2} node
     * @returns {any}
     */
    visitArray2(node) {
      const idVariable = node.id1;
      const valor = this.entornoActual.get(idVariable);
      
      if (Array.isArray(valor)) {
        const idVariableNueva = node.id;
        const valorNuevo = valor.slice(); // Crea una copia superficial del array
        this.entornoActual.set(idVariableNueva, valorNuevo);
        this.tablaSimbolos.push({ID: idVariableNueva, tipo:"Arreglo",tipoDato: "Array", linea: node.location.start.line, columna: node.location.start.column});
      } else {
        throw new Error(`Error: la variable ${idVariable} no es un array`);
      }
    }

    /**
     * @param {FuncArray} node
     * @returns {any}
     */
    visitFuncArray(node) {
      const idEntrada = node.id;            // Array o variable que contiene el array
      const tipoFunc = node.tipos;          // Tipo de operación a realizar (indexOf, join, length)
      const Expresion2 = node.expr1;        // Dato o índice según la operación

      console.log("esto es una entrada ", idEntrada);

      console.log(node.id);
    
      // Obtener el valor de la variable del entorno
      const valorArray = this.entornoActual.get(idEntrada);
    
      // Verificar que `valorArray` sea un array
      if (!Array.isArray(valorArray)) {
        throw new Error(`Error: la variable ${idEntrada} no es un array`);
      }
    
      // Ejecutar la operación según el tipo de función (`tipoFunc`)
      switch (tipoFunc) {
        case 'indexOf':
          const valorBuscado = Expresion2.accept(this);
          const index = valorArray.indexOf(valorBuscado);
          return index
    
        case 'join':
          // Convierte el array a un string usando el separador proporcionado o el predeterminado ','
          const datoString = valorArray.join();
          console.log(datoString,"Esto es convertido");
          return datoString;
    
        case 'length':
          // Devuelve el tamaño del array
          console.log(valorArray.length);
          return valorArray.length;

        default:
          throw new Error(`Operación no soportada: ${tipoFunc}`);
      }
    }

    /**
     * @param {ForEach} node
     * @returns {any}
     */
    visitForEach(node) {
      // Guardar el entorno actual al inicio
      const entornoConElQueEmpezo = this.entornoActual;
  
      try {
          // Obtener el array del entorno actual
           const array = this.entornoActual.get(node.id1);
  
          // Validar que el valor sea un array
          if (!Array.isArray(array)) {
              throw new Error(`El identificador ${node.id1} no es un array.`);
          }

          this.entornoActual.set(node.id, array);
          this.tablaSimbolos.push({ID: node.id, tipo:"variable",tipoDato: "Array", linea: node.location.start.line, columna: node.location.start.column});
  
          // Iterar sobre el array
          for (let elemento of array) {
  
              // Asignar el valor actual del array al identificador 'id'
              this.entornoActual.assign(node.id,elemento)
              node.stmt.accept(this);
          }

      } catch (error) {
          // Restaurar el entorno original en caso de error
          this.entornoActual = entornoConElQueEmpezo;
  
          if (error instanceof BreakException) {
              console.log('break');
              return;
          }
  
          if (error instanceof ContinueException) {
              // Continuar con el siguiente elemento de la colección
              return; // No necesitas llamar a this.visitForEach nuevamente
          }
  
          // Re-lanzar el error si no es un break o continue
          throw error;
      } 
    }

    /**
     * @param {AsignacionVec1} node
     * @returns {any}
     */
    visitAsignacionVec1(node) {
      // Obtén el nuevo valor a asignar
      const nuevoValor = node.asgn.accept(this);
      const nombreVariable = node.id;
    
      // Obtén el valor actual de la variable para verificar su tipo
      const array = this.entornoActual.get(nombreVariable);
    
      // Verifica si el valor actual es un array
      if (!Array.isArray(array)) {
        throw new Error(`${nombreVariable} no es un array.`);
      }
    
      // Obtén los índices del array desde `node.exp` y recórrelos para acceder correctamente
      const indices = node.exp; // Se espera un array de expresiones que representan los índices
      console.log("Indices: ", indices);
    
      // Inicializa el valor actual con el array completo para ir accediendo a sus niveles
      let valorActual = array;
    
      // Itera sobre cada expresión de índice para navegar en el array multidimensional
      for (let i = 0; i < indices.length - 1; i++) {
        const indice = indices[i].accept(this);
    
        // Verifica que el índice sea un número entero y esté dentro de los límites del array actual
        if (typeof indice !== 'number' || !Number.isInteger(indice) || indice < 0 || indice >= valorActual.length) {
          throw new Error(`Índice fuera de rango: ${indice}`);
        }
    
        // Actualiza el valor actual para acceder al siguiente nivel de la matriz
        valorActual = valorActual[indice];
      }
    
      // Obtén el último índice, que es donde se hará la asignación
      const ultimoIndice = indices[indices.length - 1].accept(this);
    
      // Verifica que el último índice sea válido
      if (typeof ultimoIndice !== 'number' || !Number.isInteger(ultimoIndice) || ultimoIndice < 0 || ultimoIndice >= valorActual.length) {
        throw new Error(`Índice fuera de rango: ${ultimoIndice}`);
      }
    
      // Verifica el tipo del nuevo valor con el tipo de los elementos del array
      const tipoElementoArray = typeof valorActual[0]; // Asume que todos los elementos tienen el mismo tipo
      const nuevoValorTipo = typeof nuevoValor;
    
      console.log("Tipo actual de los elementos del array: " + tipoElementoArray);
      console.log("Tipo del nuevo valor: " + nuevoValorTipo);
    
      // Verifica si el tipo del nuevo valor coincide con el tipo de los elementos del array
      if (nuevoValorTipo === tipoElementoArray || tipoElementoArray === "undefined") {
        // Si los tipos coinciden o el array no tenía un valor previo, asigna el nuevo valor
        valorActual[ultimoIndice] = nuevoValor;
      } else {
        // Si los tipos no coinciden, asigna null
        valorActual[ultimoIndice] = null;
      }
    
      // Actualiza la variable en el entorno actual
      this.entornoActual.assign(nombreVariable, array);
    
      return nuevoValor;
    }
    

    /**
     * @param {Matriz} node
     * @returns {any}
     */
    visitMatriz(node) {
      const tipoDato = node.tipo;
      const idArray = node.id;
      const dataArray = node.array;

      // Función recursiva para procesar los datos en niveles
      const procesarArray = (array) => {
        if (!Array.isArray(array)) {
          throw new Error('Se esperaba un array, pero se encontró un tipo diferente.');
        }

        const resultado = [];

        for (const item of array) {
          // Verificar si el elemento actual es un array, en cuyo caso se llama recursivamente
          if (Array.isArray(item)) {
            resultado.push(procesarArray(item)); // Llamada recursiva para niveles internos
          } else {
            // Procesar el valor si no es un array y validar su tipo
            const valorF = item.accept(this);

            // Validaciones del tipo de dato
            switch (tipoDato) {
              case 'int':
                if (typeof valorF !== 'number' || !Number.isInteger(valorF)) {
                  throw new Error(`Tipo de valor incorrecto. Se esperaba int, pero se recibió ${typeof valorF}.`);
                }
                break;
              case 'float':
                if (typeof valorF !== 'number' || Number.isInteger(valorF)) {
                  throw new Error(`Tipo de valor incorrecto. Se esperaba float, pero se recibió ${typeof valorF}.`);
                }
                break;
              case 'string':
                if (typeof valorF !== 'string') {
                  throw new Error(`Tipo de valor incorrecto. Se esperaba string, pero se recibió ${typeof valorF}.`);
                }
                break;
              case 'boolean':
                if (typeof valorF !== 'boolean') {
                  throw new Error(`Tipo de valor incorrecto. Se esperaba boolean, pero se recibió ${typeof valorF}.`);
                }
                break;
              case 'char':
                if (typeof valorF !== 'string' || valorF.length !== 1) {
                  throw new Error(`Tipo de valor incorrecto. Se esperaba char, pero se recibió ${typeof valorF}.`);
                }
                break;
              default:
                throw new Error(`Tipo de dato no reconocido: ${tipoDato}.`);
            }

            // Agregar el valor validado al resultado
            resultado.push(valorF);
          }
        }
        return resultado; // Retornar el array procesado
      };

      // Procesar el array completo de entrada
      const arrayG = procesarArray(dataArray);

      // Almacenar el array procesado en el entorno actual con el id correspondiente
      this.entornoActual.set(idArray, arrayG);
      this.tablaSimbolos.push({ID: idArray, tipo:"Matriz",tipoDato: tipoDato, linea: node.location.start.line, columna: node.location.start.column});
      console.log("Array G final: ", arrayG);
    }

    /**
     * @param {Matriz1} node
     * @returns {any}
     */
    visitMatriz1(node) {
      const tipo = node.tipo;
      const dimension = node.dimension;
      const id = node.id;
      const tipoDato = node.tipo1;
      const array = node.array;
    
      console.log("dimension", dimension);
      console.log("tipoDato", tipoDato);
      console.log("array", array);
    
      // Validación de tamaños
      if (dimension.length !== array.length) {
        throw new Error("Error los tamaños del array no son iguales");
      }
    
      // Validación de tipos
      if (tipo !== tipoDato) {
        throw new Error("Error los tipos no coinciden");
      }
    
      // Función para crear una matriz multidimensional con valores predeterminados
      const crearMatriz = (dims, valorPredeterminado) => {
        if (dims.length === 0) return valorPredeterminado;
        return new Array(dims[0]).fill(null).map(() => crearMatriz(dims.slice(1), valorPredeterminado));
      };
    
      // Determinar el valor predeterminado basado en el tipo de dato
      const obtenerValorPredeterminado = (tipoDato) => {
        switch (tipoDato) {
          case 'int': return 0;
          case 'float': return 0.1;
          case 'string': return "";
          case 'char': return '\u0000';
          case 'boolean': return false;
          default: throw new Error(`Tipo de dato no soportado: ${tipoDato}`);
        }
      };
    
      // Recolectar las dimensiones del array
      const dimensiones = [];
      for (const datos of array) {
        const valor = datos.accept(this); // Extrae el valor de dimensión
        dimensiones.push(valor); // Agrega el valor a la lista de dimensiones
      }
    
      // Verificar que las dimensiones coincidan con la declaración
      if (dimensiones.length !== dimension.length) {
        throw new Error("Error las dimensiones extraídas no coinciden con las dimensiones declaradas");
      }
    
      // Crear la matriz con los valores predeterminados
      const valorPredeterminado = obtenerValorPredeterminado(tipoDato);
      const matriz = crearMatriz(dimensiones, valorPredeterminado);
    
      // Almacenar la matriz con el id proporcionado
      // Ejemplo: this.matrices[id] = matriz;
      console.log("Matriz creada:", matriz);

      this.entornoActual.set(id,matriz);
      this.tablaSimbolos.push({ID: id, tipo:"Matriz",tipoDato: tipoDato, linea: node.location.start.line, columna: node.location.start.column});
    }
    
    /**
     * @param {Llamada} node
    */
    visitLlamada(node) {
      const funcion = node.callee.accept(this);

      const argumentos = node.args.map(arg => arg.accept(this));
      console.log("Argumentos: ", argumentos);

      if (!(funcion instanceof Invocable)) {
          throw new Error('No es invocable');
          // 1() "sdalsk"()
      }

      if (funcion.aridad() !== argumentos.length) {
          throw new Error('Aridad incorrecta');
      }

      return funcion.invocar(this, argumentos);
  }


    /**
     * @param {FuncDcl} node
    */
    visitFuncDcl(node) {
      const funcion = new FuncionForanea(node, this.entornoActual);
      this.entornoActual.set(node.id, funcion);
      this.tablaSimbolos.push({ID: node.id, tipo:"Funcion",tipoDato: "Funcion", linea: node.location.start.line, columna: node.location.start.column});
    }

    /**
    * @type {BaseVisitor['visitClassDcl']}
    */
    visitClassDcl(node) {
      const propiedades = {}

      node.dcls.forEach(dcl => {
          if (dcl instanceof nodos.DeclaracionVariable) {
            propiedades[dcl.id] = {
              tipo : dcl.tipo,
              exp : dcl.exp
            }
          }
      });

      const clase = new Clase(node.id, propiedades);

      this.entornoActual.set(node.id, clase);
      this.tablaSimbolos.push({ID: node.id, tipo:"Struct",tipoDato: "Clase", linea: node.location.start.line, columna: node.location.start.column});
    }

    /**
    * @type {BaseVisitor['visitInstancia']}
    */
    visitInstancia(node) {

        const clase = this.entornoActual.get(node.id);

        console.log("esta es la clase",clase);

        const argumentos = node.args

        console.log("argumentos", argumentos);


        if (!(clase instanceof Clase)) {
            throw new Error('No es posible instanciar algo que no es una clase');
        }

        return clase.invocar(this, argumentos);
    }


    /**
    * @type {BaseVisitor['visitGet']}
    */
    visitGet(node) {

        // var a = new Clase();
        // a.propiedad
        const instancia = node.objetivo.accept(this);
        console.log(node.objetivo);

        if (!(instancia instanceof Instancia)) {
            console.log(instancia);
            throw new Error('No es posible obtener una propiedad de algo que no es una instancia');
        }

        return instancia.get(node.propiedad);
    }

    /**
    * @type {BaseVisitor['visitSet']}
    */
    visitSet(node) {
      const instancia = node.objetivo.accept(this);

      if (!(instancia instanceof Instancia)) {
          throw new Error('No es posible asignar una propiedad de algo que no es una instancia');
      }

      const valor = node.valor.accept(this);

      instancia.set(node.propiedad, valor);

      return valor;
    }

  generarReporteHTML() {
    // Construye el contenido HTML para el reporte
    let reporteHTML = `
    <!DOCTYPE html>
    <html lang="es">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Reporte de Tabla de Símbolos</title>
        <style>
            body {
                font-family: Arial, sans-serif;
                margin: 20px;
            }
            table {
                width: 100%;
                border-collapse: collapse;
                margin-bottom: 20px;
            }
            table, th, td {
                border: 1px solid black;
            }
            th, td {
                padding: 10px;
                text-align: left;
            }
            th {
                background-color: #f2f2f2;
            }
            h1 {
                text-align: center;
            }
        </style>
    </head>
    <body>
        <h1>Reporte de Tabla de Símbolos</h1>
        <table>
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Tipo</th>
                    <th>Tipo Dato</th>
                    <th>Línea</th>
                    <th>Columna</th>
                </tr>
            </thead>
            <tbody>`;

    // Iterar sobre `this.tablaSimbolos` y agregar filas a la tabla
    this.tablaSimbolos.forEach(simbolo => {
        reporteHTML += `
        <tr>
            <td>${simbolo.ID}</td>
            <td>${simbolo.tipo}</td>
            <td>${simbolo.tipoDato}</td>
            <td>${simbolo.linea}</td>
            <td>${simbolo.columna}</td>
        </tr>`;
    });

    // Cierra la tabla y el cuerpo de la página
    reporteHTML += `
            </tbody>
        </table>
    </body>
    </html>`;

    return reporteHTML;
  }
}