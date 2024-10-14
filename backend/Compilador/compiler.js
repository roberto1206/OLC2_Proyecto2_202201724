import { registers as r, floatRegisters as f } from "../RISC/constantes.js";
import { Generador } from "../RISC/generador.js";
import { BaseVisitor } from "../herramientas/visitor.js";

export class CompilerVisitor extends BaseVisitor {

    constructor() {
        super();
        this.code = new Generador();
    }

    /**
     * @type {BaseVisitor['visitExpresionStmt']}
    */
    visitExpresionStmt(node) {
        node.exp.accept(this);
        this.code.popObject(r.T0);
    }

    /**
     * @type {BaseVisitor['visitPrimitivo']}
     */
    visitPrimitivo(node) {
        this.code.comment(`Primitivo: ${node.valor}`);
        this.code.pushConstant({ type: node.tipo, valor: node.valor });
        this.code.comment(`Fin Primitivo: ${node.valor}`);
    }

    /**
     * @type {BaseVisitor['visitOperacionBinaria']}
     */
    visitOperacionBinaria(node) {
        this.code.comment(`Operacion: ${node.op}`);

        if (node.op === '&&') {
            node.izq.accept(this); // izq
            this.code.popObject(r.T0); // izq

            const labelFalse = this.code.getLabel();
            const labelEnd = this.code.getLabel();

            this.code.beq(r.T0, r.ZERO, labelFalse); // if (!izq) goto labelFalse
            node.der.accept(this); // der
            this.code.popObject(r.T0); // der
            this.code.beq(r.T0, r.ZERO, labelFalse); // if (!der) goto labelFalse

            this.code.li(r.T0, 1);
            this.code.push(r.T0);
            this.code.j(labelEnd);
            this.code.addLabel(labelFalse);
            this.code.li(r.T0, 0);
            this.code.push(r.T0);

            this.code.addLabel(labelEnd);
            this.code.pushObject({ type: 'boolean', length: 4 });
            return
        }

        if (node.op === '||') {
            node.izq.accept(this); // izq
            this.code.popObject(r.T0); // izq

            const labelTrue = this.code.getLabel();
            const labelEnd = this.code.getLabel();

            this.code.bne(r.T0, r.ZERO, labelTrue); // if (izq) goto labelTrue
            node.der.accept(this); // der
            this.code.popObject(r.T0); // der
            this.code.bne(r.T0, r.ZERO, labelTrue); // if (der) goto labelTrue

            this.code.li(r.T0, 0);
            this.code.push(r.T0);

            this.code.j(labelEnd);
            this.code.addLabel(labelTrue);
            this.code.li(r.T0, 1);
            this.code.push(r.T0);

            this.code.addLabel(labelEnd);
            this.code.pushObject({ type: 'boolean', length: 4 });
            return
        }

        node.izq.accept(this); // izq
        node.der.accept(this); // der

        console.log(node.izq);
        console.log(node.izq.valor);

        const isDerFloat = this.code.getTopObject().type === 'float';
        const der = this.code.popObject(isDerFloat ? f.FT0 : r.T0); // der
        const isIzqFloat = this.code.getTopObject().type === 'float';
        const izq = this.code.popObject(isIzqFloat ? f.FT1 : r.T1); // izq

        if (isIzqFloat || isDerFloat) {
            if (!isIzqFloat) this.code.fcvtsw(f.FT1, r.T1);
            if (!isDerFloat) this.code.fcvtsw(f.FT0, r.T0);

            switch (node.op) {
                case '+':
                    this.code.fadd(f.FT0, f.FT1, f.FT0);
                    break;
                case '-':
                    this.code.fsub(f.FT0, f.FT1, f.FT0);
                    break;
                case '*':
                    this.code.fmul(f.FT0, f.FT1, f.FT0);
                    break;
                case '/':
                    this.code.fdiv(f.FT0, f.FT1, f.FT0);
                    break;
                case '<=':
                    this.code.callBuiltin('lessOrEqualF');
                    this.code.pushObject({ type: 'boolean', length: 4 });
                    return
                case '<':
                    this.code.callBuiltin('lessF');
                    this.code.pushObject({ type: 'boolean', length: 4 });
                    return
                case '>=':
                    this.code.callBuiltin('moreOrEqualF');
                    this.code.pushObject({ type: 'boolean', length: 4 });
                    return
                case '>':
                    this.code.callBuiltin('moreF');
                    this.code.pushObject({ type: 'boolean', length: 4 });
                    return
                case '==':
                    this.code.callBuiltin('equalF');
                    this.code.pushObject({ type: 'boolean', length: 4 });
                    return
                case '!=':
                    this.code.callBuiltin('notEqualF');
                    this.code.pushObject({ type: 'boolean', length: 4 });
                    return
            }

            this.code.pushFloat(f.FT0);
            this.code.pushObject({ type: 'float', length: 4 });
            return;
        }

        switch (node.op) {
            case '+':
                if(izq.type==='int' && der.type==='int') {
                    this.code.add(r.T0, r.T1, r.T0);
                    this.code.push(r.T0);
                    break;

                }
                if (izq.type === 'string' && der.type === 'string') {
                    this.code.add(r.A0, r.ZERO, r.T1);
                    this.code.add(r.A1, r.ZERO, r.T0);
                    this.code.callBuiltin('concatString');
                    this.code.pushObject({ type: 'string', length: 4 });
                    return;
                }
            case '-':
                this.code.sub(r.T0, r.T1, r.T0);
                this.code.push(r.T0);
                break;
            case '*':
                this.code.mul(r.T0, r.T0, r.T1);
                this.code.push(r.T0);
                break;
            case '/':
                this.code.div(r.T0, r.T1, r.T0);
                this.code.push(r.T0);
                break;
            case '%':
                this.code.rem(r.T0, r.T1, r.T0);
                this.code.push(r.T0);
                break;
            case '<=':
                this.code.callBuiltin('lessOrEqual');
                this.code.pushObject({ type: 'boolean', length: 4 });
                return
            case '<':
                this.code.callBuiltin('less');
                this.code.pushObject({ type: 'boolean', length: 4 });
                return
            case '>=':
                this.code.callBuiltin('moreOrEqual');
                this.code.pushObject({ type: 'boolean', length: 4 });
                return
            case '>':
                this.code.callBuiltin('more');
                this.code.pushObject({ type: 'boolean', length: 4 });
                return
            case '==':
                if (izq.type === 'string' && der.type === 'string') {
                    this.code.add(r.A0, r.ZERO, r.T1);
                    this.code.add(r.A1, r.ZERO, r.T0);
                    this.code.callBuiltin('equalStr');
                    this.code.pushObject({ type: 'boolean', length: 4 });
                    return;
                }
                this.code.callBuiltin('equal');
                this.code.pushObject({ type: 'boolean', length: 4 });
                return
            case '!=':
                console.log("entra a != ");
                if (izq.type === 'string' && der.type === 'string') {
                    console.log("entra a != string");
                    this.code.add(r.A0, r.ZERO, r.T1);
                    this.code.add(r.A1, r.ZERO, r.T0);
                    this.code.callBuiltin('notEqualStr');
                    this.code.pushObject({ type: 'boolean', length: 4 });
                    return;
                }
                console.log("entra a != no string");
                this.code.callBuiltin('notEqual');
                this.code.pushObject({ type: 'boolean', length: 4 });
                return
        }
        this.code.pushObject({ type: 'int', length: 4 });
        
    }    

    /**
     * @type {BaseVisitor['visitOperacionUnaria']}
     */
    visitOperacionUnaria(node) {
        node.exp.accept(this);

        const isFloat = this.code.getTopObject().type === 'float';
        
        if (isFloat) {
            this.code.popObject(f.FT0); // Sacar el operando flotante

            switch (node.op) {
                case '-':
                    this.code.fneg(f.FT0, f.FT0); // Negar el flotante
                    this.code.pushFloat(f.FT0); // Empujar el resultado flotante
                    this.code.pushObject({ type: 'float', length: 4 }); // Indicar tipo flotante
                    break;
            }
        } else {
            this.code.popObject(r.T0); // Sacar el operando entero

            switch (node.op) {
                case '-':
                    this.code.li(r.T1, 0);
                    this.code.sub(r.T0, r.T1, r.T0); // Negar el entero
                    this.code.push(r.T0); // Empujar el resultado entero
                    this.code.pushObject({ type: 'int', length: 4 }); // Indicar tipo entero
                    break;
            }
        }

        if (node.op === '!') {
            node.exp.accept(this); // Aceptar la expresión
            this.code.popObject(r.T0); // Sacar el valor booleano
        
            const labelFalse = this.code.getLabel();
            const labelEnd = this.code.getLabel();
        
            this.code.beq(r.T0, r.ZERO, labelFalse); // Si el valor es verdadero, ir a labelFalse (es 1)
            
            // Si el valor es verdadero (1)
            this.code.li(r.T0, 0); // Asignar 0 (falso)
            this.code.push(r.T0); // Empujar el resultado en la pila
            this.code.j(labelEnd); // Ir al final
        
            this.code.addLabel(labelFalse); 
            // Si el valor es falso (0)
            this.code.li(r.T0, 1); // Asignar 1 (verdadero)
            this.code.push(r.T0); // Empujar el resultado en la pila
        
            this.code.addLabel(labelEnd);
            this.code.pushObject({ type: 'boolean', length: 4 }); // Indicar tipo booleano
            return;
        }
        
    }


    /**
     * @type {BaseVisitor['visitAgrupacion']}
     */
    visitAgrupacion(node) {
        return node.exp.accept(this);
    }

    visitPrint(node) {
        this.code.comment('Print');

        for (const valor of node.exp) {
            valor.accept(this);
            
            const isFloat = this.code.getTopObject().type === 'float';
            const object = this.code.popObject(isFloat ? f.FA0 : r.A0);

            const tipoPrint = {
                'int': () => this.code.printInt(),
                'string': () => this.code.printString(),
                'char': () => this.code.printChar(),
                'boolean': () => this.code.printBoolean(),
                'float': () => this.code.printFloat(),
            }
    
            tipoPrint[object.type]();
        }
    }

    /**
     * @type {BaseVisitor['visitDeclaracionVariable']}
     */
    visitDeclaracionVariable(node) {
        this.code.comment(`Declaracion Variable: ${node.id}`);

        node.exp.accept(this);
        this.code.tagObject(node.id);

        this.code.comment(`Fin declaracion Variable: ${node.id}`);
    }

    /**
     * @type {BaseVisitor['visitAsignacion']}
     */
    visitAsignacion(node) {
        this.code.comment(`Asignacion Variable: ${node.id}`);

        node.asgn.accept(this);
        const valueObject = this.code.popObject(r.T0);
        const [offset, variableObject] = this.code.getObject(node.id);

        this.code.addi(r.T1, r.SP, offset);
        this.code.sw(r.T0, r.T1);

        variableObject.type = valueObject.type;

        this.code.push(r.T0);
        this.code.pushObject(valueObject);

        this.code.comment(`Fin Asignacion Variable: ${node.id}`);
    }


    /**
     * @type {BaseVisitor['visitReferenciaVariable']}
     */
    visitReferenciaVariable(node) {
        this.code.comment(`Referencia a variable ${node.id}: ${JSON.stringify(this.code.objectStack)}`);


        const [offset, variableObject] = this.code.getObject(node.id);
        this.code.addi(r.T0, r.SP, offset);
        this.code.lw(r.T1, r.T0);
        this.code.push(r.T1);
        this.code.pushObject({ ...variableObject, id: undefined });

        // this.code.comment(`Fin Referencia Variable: ${node.id}`);
        this.code.comment(`Fin referencia de variable ${node.id}: ${JSON.stringify(this.code.objectStack)}`);
    }


    /**
     * @type {BaseVisitor['visitBloque']}
     */
    visitBloque(node) {
        this.code.comment('Inicio de bloque');

        this.code.newScope();

        node.dcls.forEach(d => d.accept(this));

        this.code.comment('Reduciendo la pila');
        const bytesToRemove = this.code.endScope();

        if (bytesToRemove > 0) {
            this.code.addi(r.SP, r.SP, bytesToRemove);
        }

        this.code.comment('Fin de bloque');
    }


    /**
     * @type {BaseVisitor['visitIf']}
     */
    visitIf(node) {
        this.code.comment('Inicio de If');

        this.code.comment('Condicion');
        node.cond.accept(this);
        this.code.popObject(r.T0);
        this.code.comment('Fin de condicion');
        /*
        // no else
        if (!cond) goto endIf
            ...
        endIf:

        // else
        if (!cond) goto else
            ...
        goto endIf
        else:
            ...
        endIf:

        */

        const hasElse = !!node.stmtFalse

        if (hasElse) {
            const elseLabel = this.code.getLabel();
            const endIfLabel = this.code.getLabel();

            this.code.beq(r.T0, r.ZERO, elseLabel);
            this.code.comment('Rama verdadera');
            node.stmtTrue.accept(this);
            this.code.j(endIfLabel);
            this.code.addLabel(elseLabel);
            this.code.comment('Rama falsa');
            node.stmtFalse.accept(this);
            this.code.addLabel(endIfLabel);
        } else {
            const endIfLabel = this.code.getLabel();
            this.code.beq(r.T0, r.ZERO, endIfLabel);
            this.code.comment('Rama verdadera');
            node.stmtTrue.accept(this);
            this.code.addLabel(endIfLabel);
        }

        this.code.comment('Fin del If');
    }

    /**
     * @param {Comentarios} node
     * @returns {any}
     */
    visitComentarios(node) {
        // Verifica si el texto del nodo comienza con "//"
        if (node.texto.startsWith('//')) {
            // Almacenar el comentario omitiendo los dos primeros caracteres "//"
            const comentario = node.texto.substring(2).trim();
    
            // Aquí puedes usar la variable comentario de la manera que necesites
            console.log('Comentario encontrado (sin //):', comentario);
            this.code.comment(comentario);
    
            // Puedes realizar otras acciones con el comentario almacenado
        }

        //throw new Error('Comnetario no valido');
    }
    

}