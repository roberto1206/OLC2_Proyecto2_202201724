import { InterpreterVisitor } from "../interpretar/interpreter.js";

export class Invocable {


    aridad() {
        throw new Error('No implementado');
    }

    /**
     * @param interprete {InterpreterVisitor}
     * @param args {any[]}
     */
    invocar(interprete, args) {
        throw new Error('No implementado');
    }

}