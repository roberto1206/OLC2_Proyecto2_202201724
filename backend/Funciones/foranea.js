import { Entorno } from "../interpretar/entorno.js";
import { Invocable } from "./invocables.js";
import { FuncDcl } from "../herramientas/nodos.js";
import { BreakException, ContinueException, ReturnException } from "../Instrucciones/transferencias.js";


export class FuncionForanea extends Invocable {


    constructor(nodo, clousure) {
        super();
        /**
         * @type {FuncDcl}
        */
        this.nodo = nodo;

        /**
         * @type {Entorno}
        */
        this.clousure = clousure;
    }

    aridad() {
        return this.nodo.params.length;
    }


    /**
    * @type {Invocable['invocar']}
    */
    invocar(interprete, args) {
        const entornoNuevo = new Entorno(this.clousure);

        console.log("parametros : " , this.nodo.params);

        this.nodo.params.forEach((param, i) => {
            const [tipo, _, nombre] = param;  // Extrae el tipo, espacio y nombre
            const valor = args[i];  // Obtén el valor pasado correspondiente
        
            // Validar tipo int
            if (tipo === "int") {
                if (Number.isInteger(valor)) {
                    entornoNuevo.set(nombre, valor);  // Almacena si es un entero
                } else {
                    throw new Error(`El valor pasado para ${nombre} no es un entero`);
                }
            }
            
            // Validar tipo float
            else if (tipo === "float") {
                if (typeof valor === 'number' && !Number.isInteger(valor)) {
                    entornoNuevo.set(nombre, valor);  // Almacena si es un número decimal
                } else {
                    throw new Error(`El valor pasado para ${nombre} no es un decimal`);
                }
            }
            
            // Validar tipo string
            else if (tipo === "string") {
                if (typeof valor === 'string') {
                    entornoNuevo.set(nombre, valor);  // Almacena si es una cadena
                } else {
                    throw new Error(`El valor pasado para ${nombre} no es una cadena`);
                }
            }
            
            // Validar tipo char
            else if (tipo === "char") {
                if (typeof valor === 'string' && valor.length === 1) {
                    entornoNuevo.set(nombre, valor);  // Almacena si es un carácter
                } else {
                    throw new Error(`El valor pasado para ${nombre} no es un carácter`);
                }
            }
            
            // Validar tipo boolean
            else if (tipo === "boolean") {
                if (typeof valor === 'boolean') {
                    entornoNuevo.set(nombre, valor);  // Almacena si es un booleano
                } else {
                    throw new Error(`El valor pasado para ${nombre} no es un booleano`);
                }
            }
            
            // Si el tipo no es reconocido
            else {
                throw new Error(`Tipo de dato desconocido para ${nombre}`);
            }
        });

        const entornoAntesDeLaLlamada = interprete.entornoActual;
        interprete.entornoActual = entornoNuevo;

        try {
            this.nodo.bloque.accept(interprete);
        } catch (error) {
            interprete.entornoActual = entornoAntesDeLaLlamada;

            if (error instanceof BreakException){
                return
            }
            
            if (error instanceof ReturnException) {
                const valor = error.value;
                const tipoIngresado = this.nodo.tipo;
                const tipoRetornado = this.getTipo(valor);

                if(this.nodo.dimension == null){

                    // Manejo de retorno nulo permitido
                    if (tipoIngresado === 'void' && valor === null) {
                        return null;
                    }

                    if(tipoIngresado != tipoRetornado){
                        throw new Error(`El tipo de dato retornado no coincide con el tipo de retorno de la función`);  
                    }
                    return valor;
                }

                if(this.nodo.dimension >= 1){
                    if(!Array.isArray(valor)){
                        throw new Error(`El valor retornado no es un arreglo`);
                    }

                    if(this.nodo.dimension != valor.length){
                        throw new Error(`El tamaño del arreglo retornado no coincide con el tamaño de la función`);
                    }
                    return valor;
                }
                return valor;
            }

            if(error instanceof ContinueException){}

            // TODO: manejar el resto de sentencias de control
            throw error;
        }

        interprete.entornoActual = entornoAntesDeLaLlamada;
        return null
    }

    getTipo(valor) {
        if (typeof valor === 'number') {
            return Number.isInteger(valor) ? 'int' : 'float';
        } else if (typeof valor === 'string') {
            return valor.length === 1 ? 'char' : 'string';
        } else if (typeof valor === 'boolean') {
            return 'boolean';
        } else {
            return 'unknown';
        }
    }
}
