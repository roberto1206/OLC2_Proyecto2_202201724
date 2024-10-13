import { FuncionForanea } from "./foranea.js";
import { Instancia } from "./instancia.js";
import { Invocable } from "./invocables.js";
import { Expresion } from "../herramientas/nodos.js";


export class Clase extends Invocable {

    constructor(nombre, propiedades) {
        super();

        /**
         * @type {string}
         */
        this.nombre = nombre;

        /**
         * @type {Object.<string, Expresion>}
        */
        this.propiedades = propiedades;
    }

    /**
    * @param {string} nombre
    * @returns {FuncionForanea | null}
    */
    buscarMetodo(nombre) {
        if (this.propiedades.hasOwnProperty(nombre)) {
            return this.metodos[nombre];
        }
        return null;
    }

    aridad() {
        const constructor = this.buscarMetodo('constructor');

        if (constructor) {
            return constructor.aridad();
        }

        return 0;
    }


    /**
    * @type {Invocable['invocar']}
    */
    invocar(interprete, args) {
        const nuevaIntancia = new Instancia(this);
    
        // Valores por defecto
        Object.entries(this.propiedades).forEach(([nombre, valor]) => {
            let valorFinal;
    
            // Si el valor es undefined
            if (valor.exp === undefined) {
                switch (valor.tipo) {
                    case "int":
                        valorFinal = 0;
                        break;
                    case "float":
                        valorFinal = 0.1;
                        break;
                    case "string":
                        valorFinal = "";
                        break;
                    case "char":
                        valorFinal = '\u0000';
                        break;
                    default:
                        valorFinal = null;
                }
                console.log(`Variable ${nombre} es indefinida, asignando valor por defecto: ${valorFinal}`);
            } else {
                // Evaluar la expresión si no es undefined
                valorFinal = valor.exp.accept(interprete);
    
                // Verificar el tipo esperado
                switch (valor.tipo) {
                    case "int":
                        if (typeof valorFinal !== "number" || !Number.isInteger(valorFinal)) {
                            throw new Error(`Tipo incorrecto para ${nombre}: se esperaba int`);
                        }
                        break;
                    case "float":
                        if (typeof valorFinal !== "number") {
                            throw new Error(`Tipo incorrecto para ${nombre}: se esperaba float`);
                        }
                        break;
                    case "string":
                        if (typeof valorFinal !== "string") {
                            throw new Error(`Tipo incorrecto para ${nombre}: se esperaba string`);
                        }
                        break;
                    case "char":
                        if (typeof valorFinal !== "string" || valorFinal.length !== 1) {
                            throw new Error(`Tipo incorrecto para ${nombre}: se esperaba char`);
                        }
                        break;
                    default:
                        if (valorFinal === null) {
                            throw new Error(`Tipo incorrecto para ${nombre}: se esperaba un valor no nulo`);
                        }
                }
            }
    
            nuevaIntancia.set(nombre, valorFinal);
        });
    
        // Verificar los argumentos pasados (id y exp)
        if (args) {
            args.forEach((arg) => {
                const { id, exp } = arg; // Extracción del id y la expresión del argumento
    
                // Verificar si el id existe en las propiedades del struct
                if (this.propiedades.hasOwnProperty(id)) {
                    const propiedad = this.propiedades[id];
    
                    // Evaluar la expresión
                    const valorArgumento = exp.accept(interprete);
    
                    // Verificar si el tipo del argumento coincide con el tipo de la propiedad
                    switch (propiedad.tipo) {
                        case "int":
                            if (typeof valorArgumento !== "number" || !Number.isInteger(valorArgumento)) {
                                throw new Error(`Tipo incorrecto para ${id}: se esperaba int`);
                            }
                            break;
                        case "float":
                            if (typeof valorArgumento !== "number") {
                                throw new Error(`Tipo incorrecto para ${id}: se esperaba float`);
                            }
                            break;
                        case "string":
                            if (typeof valorArgumento !== "string") {
                                throw new Error(`Tipo incorrecto para ${id}: se esperaba string`);
                            }
                            break;
                        case "char":
                            if (typeof valorArgumento !== "string" || valorArgumento.length !== 1) {
                                throw new Error(`Tipo incorrecto para ${id}: se esperaba char`);
                            }
                            break;
                        default:
                            if (valorArgumento === null) {
                                throw new Error(`Tipo incorrecto para ${id}: se esperaba un valor no nulo`);
                            }
                    }
    
                    // Si todo es correcto, actualizar la propiedad en la instancia
                    nuevaIntancia.set(id, valorArgumento);
                } else {
                    throw new Error(`Propiedad ${id} no existe en el struct ${this.nombre}`);
                }
            });
        }
    
        const constructor = this.buscarMetodo('constructor');
        if (constructor) {
            constructor.atar(nuevaIntancia).invocar(interprete, args);
        }
    
        return nuevaIntancia;
    }    
}