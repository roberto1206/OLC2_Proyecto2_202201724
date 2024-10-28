import { FrameVisitor } from "./frame.js";
import { ReferenciaVariable } from "../herramientas/nodos.js";
import { registers as r, floatRegisters as f } from "../RISC/constantes.js";
import { Generador } from "../RISC/generador.js";
import { BaseVisitor } from "../herramientas/visitor.js";


// Inicializa un contador fuera de la función
let switchCounter = 0;

export class CompilerVisitor extends BaseVisitor {

    constructor() {
        super();
        this.code = new Generador();

        
        this.continueLabel = null;
        this.breakLabel = null;

        this.functionMetada = {}
        this.insideFunction = false;
        this.frameDclIndex = 0;
        this.returnLabel = null;
    }

    /**
     * @type {BaseVisitor['visitExpresionStmt']}
    */
    visitExpresionStmt(node) {
        this.code.comment('Expresion Statement');
        node.exp.accept(this);
        //this.code.popObject(r.T0);
        // Determinamos si el valor en la cima de la pila es un float
        const isFloat = this.code.getTopObject().type === 'float';
        // Pop del objeto en la cima de la pila
        this.code.popObject(isFloat ? f.FA0 : r.A0);
        this.code.comment('Fin Expresion Statement');
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

        this.code.comment('Se mueven para hacer la operacion');
        const isDerFloat = this.code.getTopObject().type === 'float';
        const der = this.code.popObject(isDerFloat ? f.FT0 : r.T0); // der
        const isIzqFloat = this.code.getTopObject().type === 'float';
        const izq = this.code.popObject(isIzqFloat ? f.FT1 : r.T1); // izq
        this.code.comment('Fin de mover para hacer la operacion');

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
                this.code.comment('Operacion Suma');
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
                /*this.code.beqz(r.T0, 'handle_div_by_zero'); // Verifica si divisor (r.T0) es 0
                this.code.callBuiltin('dividirN');
                this.code.pushObject({ type: 'int', length: 4 });
                this.code.j('end_div');                     // Salta al final después de la división
                this.code.label('handle_div_by_zero');      // Manejador de la división por 0
                this.code.li(r.T0, -1);                     // Setea T0 a -1
                this.code.push(r.T0);                       // Empuja -1 al stack
                this.code.pushObject({ type: 'null', length: 4 });
                this.code.label('end_div');                 // Final de la división
                return;*/
                this.code.div(r.T1, r.T0, r.T1);
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
        this.code.comment(`Fin Operacion: ${node.op}`);
    }    


    /**
     * @type {BaseVisitor['visitOperacionUnaria']}
     */
    visitOperacionUnaria(node) {
        this.code.comment(`Operacion Unaria: ${node.op}`);
        node.exp.accept(this);

        const isFloat = this.code.getTopObject().type === 'float';
        
        if (isFloat) {
            this.code.comment('Operacion Unaria Float');
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
        this.code.comment(`Fin Operacion Unaria: ${node.op}`);
    }

    /**
     * @type {BaseVisitor['visitIncrementador']}
     */
    visitIncrementador(node) {
        this.code.comment(`Incrementador Variable: ${node.id}`);
    
        // Evaluamos la expresión para obtener el valor con el que se va a incrementar/decrementar.
        node.exp.accept(this);
        const isFloat = this.code.getTopObject().type === 'float';
        const valueObject = this.code.popObject(isFloat ? f.FA0 : r.A0);
        
        // Obtenemos el valor actual de la variable
        const [offset, variableObject] = this.code.getObject(node.id);
        this.code.addi(r.T0, r.SP, offset);
    
        // Manejo para variables flotantes
        if (variableObject.type === 'float') {
            // Cargamos el valor flotante actual de la variable en el registro flotante
            this.code.flw(f.FT0, r.T0); // FT0 tiene el valor actual de la variable 'x'
    
            // Movemos el valor de la expresión evaluada al registro flotante adecuado
            this.code.fmv(f.FT1, f.FA0); // Mueve FA0 (valor evaluado) a FT1
    
            // Dependiendo del operador, sumamos o restamos el valor flotante
            switch (node.op) {
                case '+=':
                    this.code.fadd(f.FT0, f.FT0, f.FT1); // FT0 = FT0 + FT1
                    break;
                case '-=':
                    this.code.fsub(f.FT0, f.FT0, f.FT1); // FT0 = FT0 - FT1
                    break;
            }
    
            // Guardamos el nuevo valor flotante en la variable
            this.code.addi(r.T1, r.SP, offset); 
            this.code.fsw(f.FT0, r.T1); // Guardamos el resultado en la posición de memoria de la variable
    
            // Actualizamos el tipo en el objeto de la variable
            variableObject.type = valueObject.type;
    
            // Pusheamos el resultado flotante a la pila
            this.code.pushFloat(f.FT0);
            this.code.pushObject({ type: 'float', length: 4 });
            return;
        } 
        else {
            // Si la variable es un entero, seguimos el flujo regular de enteros
            this.code.lw(r.T0, r.T0); // T0 tiene el valor actual de la variable 'x'
    
            // Dependiendo del operador, sumamos o restamos el valor
            switch (node.op) {
                case '+=':
                    this.code.add(r.T0, r.T0, r.A0); // T0 = T0 + A0
                    break;
                case '-=':
                    this.code.sub(r.T0, r.T0, r.A0); // T0 = T0 - A0
                    break;
            }
    
            // Guardamos el nuevo valor en la variable
            this.code.addi(r.T1, r.SP, offset); 
            this.code.sw(r.T0, r.T1); // Guardamos el resultado en la posición de memoria de la variable
    
            // Actualizamos el tipo en el objeto de la variable
            variableObject.type = valueObject.type;
    
            // Pusheamos el resultado a la pila
            this.code.push(r.T0);
            this.code.pushObject({ type: 'int', length: 4 });
        }
    
        this.code.comment(`Fin Incrementador Variable: ${node.id}`);
    }

    /**
     * @type {BaseVisitor['visitAgrupacion']}
     */
    visitAgrupacion(node) {
        this.code.comment('Agrupacion');
        return node.exp.accept(this);
    }

    visitPrint(node) {
        this.code.comment('Print');

        for (const valor of node.exp) {
            valor.accept(this);
            
            this.code.comment('Esta parte es del print');
            const isFloat = this.code.getTopObject().type === 'float';
            const object = this.code.popObject(isFloat ? f.FA0 : r.A0);
            this.code.comment('Fin donde esta el pop en el print');

            const tipoPrint = {
                'int': () => this.code.printInt(),
                'string': () => this.code.printString(),
                'char': () => this.code.printChar(),
                'boolean': () => this.code.printBoolean(),
                'float': () => this.code.printFloat(),
                'null': () => this.code.printNull(),
                'array': () => this.code.printArray(),
            }
            tipoPrint[object.type]();
            this.code.printEspacioBlanco();
        }
        this.code.printNewLine();
        this.code.comment('Fin Print');
    }

    /**
     * @type {BaseVisitor['visitDeclaracionVariable']}
     */
    visitDeclaracionVariable(node) {
        this.code.comment(`Declaracion Variable: ${node.id}`);
        node.exp.accept(this);
        if (this.insideFunction) {
            const localObject = this.code.getFrameLocal(this.frameDclIndex);
            const valueObj = this.code.popObject(r.T0);

            this.code.addi(r.T1, r.FP, -localObject.offset * 4);
            this.code.sw(r.T0, r.T1);

            // ! inferir el tipo
            localObject.type = valueObj.type;
            this.frameDclIndex++;

            return
        }

        this.code.tagObject(node.id);

        this.code.comment(`Fin declaracion Variable: ${node.id}`);
    }

    /**
     * @type {BaseVisitor['visitAsignacion']}
     */
    visitAsignacion(node) {
        this.code.comment(`Asignacion Variable: ${node.id}`);
    
        // Evaluamos la expresión de asignación
        node.asgn.accept(this);
    
        // Determinamos si el valor en la cima de la pila es un float o no
        const isFloat = this.code.getTopObject().type === 'float';
        
        // Pop del valor, dependiendo de si es float o no
        const valueObject = this.code.popObject(isFloat ? f.FA0 : r.A0);
    
        // Obtenemos el desplazamiento (offset) de la variable en la memoria
        const [offset, variableObject] = this.code.getObject(node.id);

        if (this.insideFunction) {
            this.code.addi(r.T1, r.FP, -variableObject.offset * 4); // ! REVISAR
            this.code.sw(r.T0, r.T1); // ! revisar
            return
        }
    
        // Almacenamos el valor dependiendo de si es float o int
        if (isFloat) {
            // Si es flotante, usamos registros y operaciones flotantes
            this.code.comment('Asignacion de tipo float');
            this.code.addi(r.T1, r.SP, offset);   // Calculamos la posición en la pila
            this.code.fsw(f.FA0, r.T1);           // Almacenamos el valor flotante en memoria
        } else {
            // Si es un entero u otro tipo, usamos el flujo regular de enteros
            this.code.comment('Asignacion de tipo int');
            this.code.addi(r.T1, r.SP, offset);   // Calculamos la posición en la pila
            this.code.sw(r.A0, r.T1);             // Almacenamos el valor entero en memoria
        }
    
        // Actualizamos el tipo del objeto de la variable
        variableObject.type = valueObject.type;
    
        // Empujamos el valor al stack nuevamente (float o int)
        if (isFloat) {
            this.code.pushFloat(f.FA0);  // Pusheamos el registro flotante
        } else {
            this.code.push(r.A0);   // Pusheamos el registro de enteros
        }
    
        // Pusheamos el objeto con la nueva información de tipo
        this.code.pushObject(valueObject);
    
        this.code.comment(`Fin Asignacion Variable: ${node.id}`);
    }

    /**
     * @type {BaseVisitor['visitReferenciaVariable']}
     */
    visitReferenciaVariable(node) {
        this.code.comment(`Referencia a variable ${node.id}: ${JSON.stringify(this.code.objectStack)}`);
        if (node.id == "typeof") {
            console.log("entra a typeof");
            const datoP = this.code.getTopObject().type;
            console.log("DatoP: ", datoP);
    
            if (datoP === 'int') {
                this.code.popObject(r.T0);
                this.code.li(r.T0, 0);
                this.code.sw(r.T0, r.SP);
                this.code.callBuiltin('typeOf');
                this.code.pushObject({ type: 'int', length: 4 });
                return;
            } else if (datoP === 'float') {
                this.code.popObject(f.FT0);
                this.code.li(r.T0, 1);
                this.code.sw(r.T0, r.SP);
                this.code.callBuiltin('typeOf');
                this.code.pushObject({ type: 'int', length: 4 });
                return;
            } else if (datoP === 'string') {
                this.code.popObject(r.T0);
                this.code.li(r.T0, 2);
                this.code.sw(r.T0, r.SP);
                this.code.callBuiltin('typeOf');
                this.code.pushObject({ type: 'int', length: 4 });
                return;
            } else if (datoP === 'boolean') {
                this.code.popObject(r.T0);
                this.code.li(r.T0, 4); // Valor específico para boolean
                this.code.sw(r.T0, r.SP);
                this.code.callBuiltin('typeOf');
                this.code.pushObject({ type: 'boolean', length: 4 });
                return;
            } else if (datoP === 'char') {
                this.code.popObject(r.T0);
                this.code.li(r.T0, 3); // Valor específico para char
                this.code.sw(r.T0, r.SP);
                this.code.callBuiltin('typeOf');
                this.code.pushObject({ type: 'int', length: 4 });
                return;
            }
        }

        const [offset, variableObject] = this.code.getObject(node.id);

        if (this.insideFunction) {
            this.code.addi(r.T1, r.FP, -variableObject.offset * 4);
            this.code.lw(r.T0, r.T1);
            this.code.push(r.T0);
            this.code.pushObject({ ...variableObject, id: undefined });
            return
        }

        this.code.addi(r.T0, r.SP, offset); // Cargar dirección de la variable en T0
        this.code.lw(r.T1, r.T0); // Cargar el valor de la variable en T1
        this.code.push(r.T1); // Empujar el valor al stack
        this.code.pushObject({ ...variableObject, id: undefined }); // Empujar el objeto de la variable sin ID
    
        if (node.expr1.length > 0) {
            for (const datos of node.expr1) {
                const valor = datos.valor;
    
                // Verificar si valor es undefined
                if (valor === undefined) {
                    break; // Salir del bucle si el valor es indefinido
                }
    
                const desplazamiento = valor * 4; // Calcular desplazamiento
                console.log("Desplazamiento multiplicado: ", desplazamiento);
                console.log("Valor de la expresión: ", valor);
    
                // Cargar el valor desde la dirección calculada
                this.code.lw(r.T1, r.T0, desplazamiento);
                this.code.push(r.T1); // Empujar el valor cargado al stack
            }
        }
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
     * @type {BaseVisitor['visitWhile']}
     */
    visitWhile(node) {
        /*
        startWhile:
            cond
        if !cond goto endWhile
            stmt
            goto startWhile
        endWhile:
        */

        const startWhileLabel = this.code.getLabel();
        const prevContinueLabel = this.continueLabel;
        this.continueLabel = startWhileLabel;

        const endWhileLabel = this.code.getLabel();
        const prevBreakLabel = this.breakLabel;
        this.breakLabel = endWhileLabel;

        this.code.addLabel(startWhileLabel);
        this.code.comment('Condicion');
        node.cond.accept(this);
        this.code.popObject(r.T0);
        this.code.comment('Fin de condicion');
        this.code.beq(r.T0, r.ZERO, endWhileLabel);
        this.code.comment('Cuerpo del while');
        node.stmt.accept(this);
        this.code.j(startWhileLabel);
        this.code.addLabel(endWhileLabel);

        this.continueLabel = prevContinueLabel;
        this.breakLabel = prevBreakLabel;
    }

    /**
     * @type {BaseVisitor['visitFor']}
     */
    visitFor(node) {
        // node.cond
        // node.inc
        // node.stmt


        /*
            {
                init()
                startFor:
                    cond
                if !cond goto endFor
                    stmt
                incrementLabel:
                    inc
                    goto startFor
                endFor:
            } 
        */

        this.code.comment('For');

        const startForLabel = this.code.getLabel();

        const endForLabel = this.code.getLabel();
        const prevBreakLabel = this.breakLabel;
        this.breakLabel = endForLabel;

        const incrementLabel = this.code.getLabel();
        const prevContinueLabel = this.continueLabel;
        this.continueLabel = incrementLabel;

        this.code.newScope();

        node.init.accept(this);

        this.code.addLabel(startForLabel);
        this.code.comment('Condicion');
        node.cond.accept(this);
        this.code.popObject(r.T0);
        this.code.comment('Fin de condicion');
        this.code.beq(r.T0, r.ZERO, endForLabel);

        this.code.comment('Cuerpo del for');
        node.stmt.accept(this);

        this.code.addLabel(incrementLabel);
        node.inc.accept(this);
        this.code.popObject(r.T0);
        this.code.j(startForLabel);

        this.code.addLabel(endForLabel);

        this.code.comment('Reduciendo la pila');
        const bytesToRemove = this.code.endScope();

        if (bytesToRemove > 0) {
            this.code.addi(r.SP, r.SP, bytesToRemove);
        }

        this.continueLabel = prevContinueLabel;
        this.breakLabel = prevBreakLabel;

        this.code.comment('Fin de For');
    }

    /**
     * @type {BaseVisitor['node']}
     */
    visitBreak(node) {
        this.code.j(this.breakLabel);
    }

    /**
     * @type {BaseVisitor['node']}
     */
    visitContinue(node) {
        this.code.j(this.continueLabel);
    }


    /**
     * @type {BaseVisitor['visitSwitch']}
     */
    visitSwitch(node) {
        // Incrementar el contador para cada llamada a visitSwitch
        switchCounter++;
        
        // Etiqueta para el fin del switch
        const endSwitchLabel = this.code.getLabel();
        const prevBreakLabel = this.breakLabel;
        this.breakLabel = endSwitchLabel;

        this.code.comment('Inicio de Switch');

        // Evaluar la condición del switch y almacenarla en r.T0
        this.code.comment('Evaluar la condición del switch');
        node.cond.accept(this);
        this.code.popObject(r.T0); // Almacenar la condición en r.T0

        this.code.comment('Inicio de las opciones del switch');

        // Generar código para cada caso
        for (let caso of node.cases) {
            for (let condicion of caso.conds) {
                // Crear la etiqueta con formato caseX_y, donde X es el valor y Y es el contador
                const singleCaseLabel = `case${condicion.valor}_${switchCounter}`; 
                this.code.comment(`Comprobar si r.T0 == ${condicion.valor}`);
                this.code.li(r.T1, condicion.valor); // Cargar el valor del caso
                this.code.beq(r.T0, r.T1, singleCaseLabel); // Si es igual, saltar a la etiqueta correspondiente
            }
        }

        this.code.comment('Fin de las opciones del switch');

        // Si ningún caso coincide, saltar al default si existe
        const hasDefault = !!node.defaults;
        if (hasDefault) {
            this.code.comment('Ningún caso coincide, saltar al default');
            const defaultLabel = `default_${switchCounter}`; // Crear etiqueta de default única
            this.code.j(defaultLabel);
        }

        // Generar las etiquetas y el código para cada caso
        this.code.comment('Generar las etiquetas y el código para cada caso');
        for (let caso of node.cases) {
            for (let condicion of caso.conds) {
                // Crear la etiqueta con formato caseX_y, donde X es el valor y Y es el contador
                const singleCaseLabel = `case${condicion.valor}_${switchCounter}`; 
                this.code.addLabel(singleCaseLabel); // Generar la etiqueta
            }
            caso.accept(this); // Procesar las declaraciones del cuerpo del caso
            this.code.j(endSwitchLabel); // Saltar al final del switch después del caso
        }

        this.code.comment('Fin de generar las etiquetas de las opciones del switch');

        // Generar el código para el default, si existe
        if (hasDefault) {
            const defaultLabel = `default_${switchCounter}`; // Crear etiqueta de default única
            this.code.addLabel(defaultLabel);
            for (let defaul of node.defaults) {
                defaul.accept(this);
            }
        }

        // Etiqueta para el final del switch
        this.code.label(endSwitchLabel);
        this.code.comment('Fin de Switch');

        // Restaurar la etiqueta de break previa
        this.breakLabel = prevBreakLabel;
    }



    /**
     * @type {BaseVisitor['visitCase']}
     */
    visitCasos(node) {
        this.code.comment('Inicio de Case');
        node.stmtCases.forEach(stmt => {
            stmt.accept(this); // Procesar cada declaración del cuerpo del case
        });

        // Manejar el break en el case, saltando a la etiqueta de fin de switch
        this.code.j(this.breakLabel); // Saltar al final del switch si hay un break
    }


    /**
     * @type {BaseVisitor['visitTernario']}
     */
    visitTernario(node) {
        this.code.comment('Ternario');

        node.cond.accept(this);
        this.code.popObject(r.T0);
        const labelFalse = this.code.getLabel();
        const labelEnd = this.code.getLabel();

        this.code.beq(r.T0, r.ZERO, labelFalse);
        node.stmtTrue.accept(this) 
        this.code.j(labelEnd);
        this.code.addLabel(labelFalse);
        node.stmtFalse.accept(this);
        this.code.addLabel(labelEnd);

        this.code.comment('Fin Ternario');
    }
    
    /**
     * @type {BaseVisitor['visitArray']}
     */
   visitArray(node) {
        this.code.comment('Array');
        this.code.comment('Inicio de Array');
        
        const valoresAceptados = [];
        for (const valor of node.exp) {
            valoresAceptados.push(valor.valor);
        }

        // Pasa el array completo a dataInicial
        this.code.dataInicial(node.id,valoresAceptados);
        
        this.code.pushObject({ type: 'array', valor: node.id, length: valoresAceptados.length * 4 });  // Empujar el id y longitud


        this.code.la(r.T0, node.id);

        this.code.tagObject(node.id);


        this.code.comment('Fin de Array');
    }
    /*visitArray(node) {
        this.code.comment('Array');
        this.code.comment('Inicio de Array');
    
        const valoresAceptados = [];
        for (const valor of node.exp) {
            valoresAceptados.push(valor.valor);
        }
    
        // Pasa el array completo a dataInicial
        this.code.dataInicial(valoresAceptados);

        
        // Reservar espacio para el array
        const size = valoresAceptados.length * 4;  // Tamaño total del array    
        this.code.pushObject({ type: 'array', valor: node.id, length: valoresAceptados.length * 4 });  // Empujar el id y longitud
        this.code.allocateSpace(size, node.id);              // Método hipotético para reservar espacio
    
        this.code.comment('Fin de declarar el espacio del array');
        this.code.comment('Fin de Array');
    }*/
    

    /*
    visitDeclaracionVariable(node) {
        this.code.comment(`Declaracion Variable: ${node.id}`);

        node.exp.accept(this);
        this.code.tagObject(node.id);

        this.code.comment(`Fin declaracion Variable: ${node.id}`);
    }
    */

    /**
     * @type {BaseVisitor['visitFuncDcl']}
     */
    visitFuncDcl(node) {
        const baseSize = 2; // | ra | fp |

        const paramSize = node.params.length; // | ra | fp | p1 | p2 | ... | pn |

        const frameVisitor = new FrameVisitor(baseSize + paramSize);
        node.bloque.accept(frameVisitor);
        const localFrame = frameVisitor.frame;
        const localSize = localFrame.length; // | ra | fp | p1 | p2 | ... | pn | l1 | l2 | ... | ln |

        const returnSize = 1; // | ra | fp | p1 | p2 | ... | pn | l1 | l2 | ... | ln | rv |

        const totalSize = baseSize + paramSize + localSize + returnSize;
        this.functionMetada[node.id] = {
            frameSize: totalSize,
            returnType: node.tipo,
        }

        const instruccionesDeMain = this.code.instrucciones;
        const instruccionesDeDeclaracionDeFuncion = []
        this.code.instrucciones = instruccionesDeDeclaracionDeFuncion;

        node.params.forEach((param, index) => {
            console.log("param", param);
            const [tipo, , id] = param;  // Desestructuramos el array
            console.log("tipo", tipo);
            console.log("id", id);
            this.code.pushObject({
                id: id,             // Obtenemos el tercer valor como el "id"
                type: tipo,         // El primer valor como el "tipo"
                length: 4,
                offset: baseSize + index
            });
        });

        localFrame.forEach(variableLocal => {
            this.code.pushObject({
                ...variableLocal,
                length: 4,
                type: 'local',
            })
        });

        this.insideFunction = node.id;
        this.frameDclIndex = 0;
        this.returnLabel = this.code.getLabel();

        this.code.comment(`Declaracion de funcion ${node.id}`);
        this.code.addLabel(node.id);

        node.bloque.accept(this);

        this.code.addLabel(this.returnLabel);

        this.code.add(r.T0, r.ZERO, r.FP);
        this.code.lw(r.RA, r.T0);
        this.code.jalr(r.ZERO, r.RA, 0);
        this.code.comment(`Fin de declaracion de funcion ${node.id}`);

        // Limpiar metadatos
        for (let i = 0; i < paramSize + localSize; i++) {
            this.code.objectStack.pop(); // ! aqui no retrocedemos el SP, hay que hacerlo más adelanto
        }

        this.code.instrucciones = instruccionesDeMain

        instruccionesDeDeclaracionDeFuncion.forEach(instruccion => {
            this.code.instrucionesDeFunciones.push(instruccion);
        });

        this.insideFunction = null;

    }

    /**
     * @type {BaseVisitor['visitLlamada']}
     */
    visitLlamada(node) {
        if (!(node.callee instanceof ReferenciaVariable)) return

        const nombreFuncion = node.callee.id;

        this.code.comment(`Llamada a funcion ${nombreFuncion}`);


        // ---- LLamadas a funcion embebidas
        const embebidas = {
            parseInt: () => {
                node.args[0].accept(this);
                this.code.popObject(r.A0);
                this.code.callBuiltin('parseInt');
                this.code.pushObject({ type: 'int', length: 4 });
            },
            parsefloat: () => {
                node.args[0].accept(this);
                this.code.popObject(r.A0);
                this.code.callBuiltin('parseFloat');
                this.code.pushObject({ type: 'float', length: 4 });
            },
            toString: () => {
                node.args[0].accept(this);
                this.code.popObject(r.A0);
                this.code.callBuiltin('parseString');
                this.code.pushObject({ type: 'string', length: 4 });   
            },
            toUpperCase: () => {
                node.args[0].accept(this);
                this.code.popObject(r.A0);
                this.code.callBuiltin('toUpperCase');
                this.code.pushObject({ type: 'string', length: 4 });
            },
            toLowerCase: () => {
                node.args[0].accept(this);
                this.code.popObject(r.A0);
                this.code.callBuiltin('toLowerCase');
                this.code.pushObject({ type: 'string', length: 4 });
            },
        }

        if (embebidas[nombreFuncion]) {
            embebidas[nombreFuncion]();
            return
        }

        // ---- LLamadas a funcion foraneas

        const etiquetaRetornoLlamada = this.code.getLabel();

        // 1. Guardar los argumentos
        this.code.addi(r.SP, r.SP, -4 * 2)
        node.args.forEach((arg) => {
            arg.accept(this)
        });
        this.code.addi(r.SP, r.SP, 4 * (node.args.length + 2))

        // Calcular la dirección del nuevo FP en T1
        this.code.addi(r.T1, r.SP, -4)

        // Guardar direccion de retorno
        this.code.la(r.T0, etiquetaRetornoLlamada)
        this.code.push(r.T0)

        // Guardar el FP
        this.code.push(r.FP)
        this.code.addi(r.FP, r.T1, 0)

        const frameSize = this.functionMetada[nombreFuncion].frameSize
        this.code.addi(r.SP, r.SP, -(frameSize - 2) * 4)


        // Saltar a la función
        this.code.j(nombreFuncion)
        this.code.addLabel(etiquetaRetornoLlamada)

        // Recuperar el valor de retorno
        const returnSize = frameSize - 1;
        this.code.addi(r.T0, r.FP, -returnSize * 4)
        this.code.lw(r.A0, r.T0)

        // Regresar el FP al contexto de ejecución anterior
        this.code.addi(r.T0, r.FP, -4)
        this.code.lw(r.FP, r.T0)

        // Regresar mi SP al contexto de ejecución anterior
        this.code.addi(r.SP, r.SP, frameSize * 4)


        this.code.push(r.A0)
        this.code.pushObject({ type: this.functionMetada[nombreFuncion].returnType, length: 4 })

        this.code.comment(`Fin de llamada a funcion ${nombreFuncion}`);
    }


    /**
     * @type {BaseVisitor['visitReturn']}
     */
    visitReturn(node) {
        this.code.comment('Inicio Return');

        if (node.exp) {
            node.exp.accept(this);
            this.code.popObject(r.A0);

            const frameSize = this.functionMetada[this.insideFunction].frameSize
            const returnOffest = frameSize - 1;
            this.code.addi(r.T0, r.FP, -returnOffest * 4)
            this.code.sw(r.A0, r.T0)
        }

        this.code.j(this.returnLabel);
        this.code.comment('Final Return');
    }
}