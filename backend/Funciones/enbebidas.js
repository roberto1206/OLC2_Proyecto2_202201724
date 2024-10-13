import { Invocable } from "../Funciones/invocables.js";


class FuncionNativa extends Invocable {
    constructor(aridad, func) {
        super();
        this.aridad = aridad;
        this.invocar = func;
    }
}

const pasearInt = new FuncionNativa(
    () => 1,
    (interpretar, args) => {
        if (args.length !== 1) {
            interpretar.consola += 'Error: parseInt recibe un solo argumento\n';
            return { tipo: null, valor: null };
        }
        const arg = args[0];
        const valor = parseInt(arg, 10);
        return valor
    }
);


const parsearFloat = new FuncionNativa(
    () => 1,
    (interpretar, args) => {
        if (args.length !== 1) {
            interpretar.consola += 'Error: parseInt recibe un solo argumento\n';
            return { tipo: null, valor: null };
        }
        const arg = args[0];
        let valor = parseFloat(arg, 10);
        return valor+=0.1
    }
);

const tostring = new FuncionNativa(
    () => 1,
    (interpretar, args) => {
        if (args.length !== 1) {
            interpretar.consola += 'Error: tostring recibe un solo argumento\n';
            return { tipo: null, valor: null };
        }
        const arg = args[0];

        // Verificar si el argumento tiene un método toString
        if (arg === null || arg === undefined || typeof arg.toString !== 'function') {
            interpretar.consola += 'Error: El argumento no se puede convertir a string\n';
            return { tipo: null, valor: null }; 
        }

        // Convertir el argumento a string
        let valor = arg.toString();

        // Retornar el resultado como un string
        return valor;
    }
);

const tolowerCase = new FuncionNativa(
    () => 1,
    (interpretar, args) => {
        if (args.length !== 1) {
            interpretar.consola += 'Error: tolowerCase recibe un solo argumento\n';
            return { tipo: null, valor: null };
        }
        const arg = args[0];

        // Verificar si el argumento tiene un método toString para convertirlo a string
        if (arg === null || arg === undefined || typeof arg.toString !== 'function') {
            interpretar.consola += 'Error: El argumento no se puede convertir a string\n';
            return { tipo: null, valor: null };
        }

        // Convertir el argumento a string y aplicarle toLowerCase
        let valor = arg.toString().toLowerCase();

        // Retornar el resultado como un string
        return valor;
    }
);


const toUpperCase = new FuncionNativa(
    () => 1,
    (interpretar, args) => {
        if (args.length !== 1) {
            interpretar.consola += 'Error: toUpperCase recibe un solo argumento\n';
            return { tipo: null, valor: null };
        }
        const arg = args[0];

        // Verificar si el argumento tiene un método toString para convertirlo a string
        if (arg === null || arg === undefined || typeof arg.toString !== 'function') {
            interpretar.consola += 'Error: El argumento no se puede convertir a string\n';
            return { tipo: null, valor: null };
        }

        // Convertir el argumento a string y aplicarle toUpperCase
        let valor = arg.toString().toUpperCase();

        // Retornar el resultado como un string
        return valor;
    }
);


export const embebidas = {
    'time': new FuncionNativa(() => 0, () => new Date().toISOString()),
    //'typeof': typeofFunc,
    'parseInt': pasearInt,
    'parsefloat': parsearFloat,
    'toString' : tostring,
    'toLowerCase' : tolowerCase,
    'toUpperCase' : toUpperCase,
};