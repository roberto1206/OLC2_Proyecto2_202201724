import { registers as r, floatRegisters as f } from "./constantes.js"
import { Generador } from "./generador.js"

/**
 * @param {Generador} code
 */
export const concatString = (code) => {
    // A0 -> dirección en heap de la primera cadena
    // A1 -> dirección en heap de la segunda cadena
    // result -> push en el stack la dirección en heap de la cadena concatenada

    code.comment('Guardando en el stack la dirección en heap de la cadena concatenada')
    code.push(r.HP);

    code.comment('Copiando la 1er cadena en el heap')
    const end1 = code.getLabel()
    const loop1 = code.addLabel()

    code.lb(r.T1, r.A0)
    code.beq(r.T1, r.ZERO, end1)
    code.sb(r.T1, r.HP)
    code.addi(r.HP, r.HP, 1)
    code.addi(r.A0, r.A0, 1)
    code.j(loop1)
    code.addLabel(end1)

    code.comment('Copiando la 2da cadena en el heap')
    const end2 = code.getLabel()
    const loop2 = code.addLabel()

    code.lb(r.T1, r.A1)
    code.beq(r.T1, r.ZERO, end2)
    code.sb(r.T1, r.HP)
    code.addi(r.HP, r.HP, 1)
    code.addi(r.A1, r.A1, 1)
    code.j(loop2)
    code.addLabel(end2)

    code.comment('Agregando el caracter nulo al final')
    code.sb(r.ZERO, r.HP)
    code.addi(r.HP, r.HP, 1)
}

/**
 * 
 * @param {Generador} code 
 */
export const lessOrEqual = (code) => {
    // t1: left operand
    // t0 -> right operand

    /*
    if (left <= right) {
        t0 = 1
        push t0
    } else {
        t0 = 0
        push t0
    }
    */
    const trueLabel = code.getLabel()
    const endLabel = code.getLabel()

    code.bge(r.T0, r.T1, trueLabel) // der >= izq
    code.li(r.T0, 0)
    code.push(r.T0)
    code.j(endLabel)
    code.addLabel(trueLabel)
    code.li(r.T0, 1)
    code.push(r.T0)
    code.addLabel(endLabel)
}

export const less = (code) => {
    // t1: left operand
    // t0 -> right operand

    /*
    if (left < right) {
        t0 = 1
        push t0
    } else {
        t0 = 0
        push t0
    }
    */
    code.comment(f.FT0);
    code.comment(f.FT1);
    const trueLabel = code.getLabel()
    const endLabel = code.getLabel()

    code.blt(r.T1, r.T0, trueLabel) // der < izq
    code.li(r.T0, 0)
    code.push(r.T0)
    code.j(endLabel)
    code.addLabel(trueLabel)
    code.li(r.T0, 1)
    code.push(r.T0)
    code.addLabel(endLabel)
}

export const moreOrEqual = (code) => {
    // t1: left operand
    // t0 -> right operand

    /*
    if (left >= right) {
        t0 = 1
        push t0
    } else {
        t0 = 0
        push t0
    }
    */
    const trueLabel = code.getLabel()
    const endLabel = code.getLabel()

    code.bge(r.T1, r.T0, trueLabel) // der <= izq
    code.li(r.T0, 0)
    code.push(r.T0)
    code.j(endLabel)
    code.addLabel(trueLabel)
    code.li(r.T0, 1)
    code.push(r.T0)
    code.addLabel(endLabel)
}

export const more = (code) => {
    // t1: left operand
    // t0 -> right operand

    /*
    if (left > right) {
        t0 = 1
        push t0
    } else {
        t0 = 0
        push t0
    }
    */
    const trueLabel = code.getLabel()
    const endLabel = code.getLabel()

    code.blt(r.T0, r.T1, trueLabel) // der > izq
    code.li(r.T0, 0)
    code.push(r.T0)
    code.j(endLabel)
    code.addLabel(trueLabel)
    code.li(r.T0, 1)
    code.push(r.T0)
    code.addLabel(endLabel)
}

export const equal = (code) => {
    // t1: left operand
    // t0 -> right operand

    /*
    if (left > right) {
        t0 = 1
        push t0
    } else {
        t0 = 0
        push t0
    }
    */
    const trueLabel = code.getLabel()
    const endLabel = code.getLabel()

    code.beq(r.T0, r.T1, trueLabel) // der > izq
    code.li(r.T0, 0)
    code.push(r.T0)
    code.j(endLabel)
    code.addLabel(trueLabel)
    code.li(r.T0, 1)
    code.push(r.T0)
    code.addLabel(endLabel)
}

export const equalStr = (code) => {
    // A0 -> dirección en heap de la primera cadena
    // A1 -> dirección en heap de la segunda cadena

    code.comment('Comparando las dos cadenas byte por byte');
    const end = code.getLabel();
    const notEqual = code.getLabel();
    const checkEnd = code.getLabel();
    const loop = code.addLabel();

    // Cargar el byte actual de cada cadena
    code.lb(r.T1, r.A0); // Cargar byte de la primera cadena
    code.lb(r.T2, r.A1); // Cargar byte de la segunda cadena

    // Comparar los bytes actuales
    code.bne(r.T1, r.T2, notEqual); // Si los bytes son diferentes, saltar a "notEqual"

    // Verificar si llegamos al final de la primera cadena (byte nulo)
    code.beq(r.T1, r.ZERO, checkEnd); // Si alcanzamos el final, verificar la segunda cadena

    // Avanzar al siguiente byte en ambas cadenas
    code.addi(r.A0, r.A0, 1); // Incrementar puntero de la primera cadena
    code.addi(r.A1, r.A1, 1); // Incrementar puntero de la segunda cadena
    code.j(loop); // Repetir el ciclo para el siguiente byte

    // Verificar si ambas cadenas terminan al mismo tiempo
    code.addLabel(checkEnd);
    code.lb(r.T2, r.A1); // Cargar el byte actual de la segunda cadena
    code.bne(r.T2, r.ZERO, notEqual); // Si la segunda cadena no ha terminado, saltar a "notEqual"

    // Las cadenas son iguales
    code.li(r.T0, 1); // Resultado: son iguales
    code.push(r.T0);
    code.j(end); // Saltar al final

    // Las cadenas no son iguales
    code.addLabel(notEqual);
    code.li(r.T0, 0); // Resultado: no son iguales
    code.push(r.T0);

    // Fin de la función
    code.addLabel(end);
}

export const notEqual = (code) => {
    const trueLabel = code.getLabel();
    const endLabel = code.getLabel();

    // Si no son iguales, empuja 1 (verdadero)
    code.bne(r.T0, r.T1, trueLabel); // der != izq
    code.li(r.T0, 0); // Asigna 0 (falso)
    code.push(r.T0);  // Empuja 0 (booleano falso)
    code.j(endLabel); // Salta al final
    
    code.addLabel(trueLabel);
    code.li(r.T0, 1); // Asigna 1 (verdadero)
    code.push(r.T0);  // Empuja 1 (booleano verdadero)
    
    code.addLabel(endLabel);
};




export const notEqualStr = (code) => {
    // A0 -> dirección en heap de la primera cadena
    // A1 -> dirección en heap de la segunda cadena

    code.comment('Comparando las dos cadenas byte por byte');
    const end = code.getLabel();
    const notEqual = code.getLabel();
    const checkEnd = code.getLabel();
    const loop = code.addLabel();

    // Cargar el byte actual de cada cadena
    code.lb(r.T1, r.A0); // Cargar byte de la primera cadena
    code.lb(r.T2, r.A1); // Cargar byte de la segunda cadena

    // Comparar los bytes actuales
    code.bne(r.T1, r.T2, notEqual); // Si los bytes son diferentes, saltar a "notEqual"

    // Verificar si llegamos al final de la primera cadena (byte nulo)
    code.beq(r.T1, r.ZERO, checkEnd); // Si alcanzamos el final, verificar la segunda cadena

    // Avanzar al siguiente byte en ambas cadenas
    code.addi(r.A0, r.A0, 1); // Incrementar puntero de la primera cadena
    code.addi(r.A1, r.A1, 1); // Incrementar puntero de la segunda cadena
    code.j(loop); // Repetir el ciclo para el siguiente byte

    // Verificar si ambas cadenas terminan al mismo tiempo
    code.addLabel(checkEnd);
    code.lb(r.T2, r.A1); // Cargar el byte actual de la segunda cadena
    code.bne(r.T2, r.ZERO, notEqual); // Si la segunda cadena no ha terminado, saltar a "notEqual"

    // Las cadenas son iguales
    code.li(r.T0, 0); // Resultado: son iguales
    code.push(r.T0);
    code.j(end); // Saltar al final

    // Las cadenas no son iguales
    code.addLabel(notEqual);
    code.li(r.T0, 1); // Resultado: no son iguales
    code.push(r.T0);

    // Fin de la función
    code.addLabel(end);
}

export const lessOrEqualF = (code) => {
    // t1: left operand (rs1)
    // t0: right operand (rs2)

    // Realizar la comparación
    code.fle(r.T0, f.FT1, f.FT0); // rd = 1 si rs1 < rs2, 0 si no

    // Push el resultado a la pila
    code.push(r.T0);
}

export const lessF = (code) => {
    // t1: left operand (rs1)
    // t0: right operand (rs2)

    // Realizar la comparación
    code.flt(r.T0, f.FT1, f.FT0); // rd = 1 si rs1 < rs2, 0 si no

    // Push el resultado a la pila
    code.push(r.T0);
}

export const moreOrEqualF = (code) => {
    // t1: left operand (rs1)
    // t0: right operand (rs2)

    // Realizar la comparación
    code.fle(r.T0, f.FT0, f.FT1); // rd = 1 si rs1 < rs2, 0 si no

    // Push el resultado a la pila
    code.push(r.T0);
}

export const moreF = (code) => {
    // t1: left operand (rs1)
    // t0: right operand (rs2)

    // Realizar la comparación
    code.flt(r.T0, f.FT0, f.FT1); // rd = 1 si rs1 < rs2, 0 si no

    // Push el resultado a la pila
    code.push(r.T0);
}

//== para floats
export const equalF = (code) => {
    // t1: left operand (rs1)
    // t0: right operand (rs2)

    // Realizar la comparación
    code.feq(r.T0, f.FT1, f.FT0); // rd = 1 si rs1 < rs2, 0 si no

    // Push el resultado a la pila
    code.push(r.T0);
}

export const notEqualF = (code) => {
    // t1: left operand (rs1)
    // t0: right operand (rs2)

    // Comprobar si son iguales
    code.feq(r.T0, f.FT0, f.FT1); // T0 = 1 si FT1 == FT0, 0 si no

    // Cargar el resultado de "no igual"
    code.li(r.T1, 1); // Cargar 1 en T1
    code.bne(r.T0, r.ZERO, 'not_equal'); // Si T0 != 0 (es decir, son iguales), saltar a "not_equal"
    
    code.li(r.T0, 1); // Si son iguales, T0 = 0
    code.j('end_not_equal'); // Saltar al final

    code.addLabel('not_equal'); // Etiqueta para el caso "no igual"
    code.li(r.T0, 0); // Si son diferentes, T0 = 1

    code.addLabel('end_not_equal'); // Fin de la lógica de comparación

    // Push el resultado a la pila
    code.push(r.T0);
}



/**
 * @param {Generador} code
 * @param {number} rd - Registro con el valor booleano a imprimir
 */
export const printBoolean = (code, rd = r.A0) => {
    code.comment('Inicio de printBoolean');
    
    // Verificar si el valor a imprimir no está en r.A0
    if (rd !== r.A0) {
        code.push(r.A0); // Guardar el valor original de r.A0 en la pila
        code.add(r.A0, rd, r.ZERO); // Copiar el valor de rd a r.A0
    }
    
    // Convertir el valor booleano a 0 o 1
    code.snez(r.A0, r.A0); // Establecer r.A0 en 1 si no es cero, de lo contrario permanece en 0
    
    // Cargar las direcciones de las cadenas
    const trueStringAddr = 'true_str';   // Dirección de la cadena "true"
    const falseStringAddr = 'false_str'; // Dirección de la cadena "false"
    
    // Verificar si r.A0 es 1 (true)
    code.li(r.T1, 1); // Cargar 1 en r.T1
    code.beq(r.A0, r.T1, 'print_true'); // Si r.A0 es igual a 1, saltar a imprimir "true"
    
    // Imprimir "false"
    code.la(r.A0, falseStringAddr); // Cargar la dirección de "false_str" en r.A0
    code.li(r.A7, 4); // Llamada al sistema para imprimir una cadena
    code.ecall(); // Imprimir "false"
    code.j('end_print_boolean'); // Saltar al final de la función
    
    // Caso para imprimir "true"
    code.addLabel('print_true');
    code.la(r.A0, trueStringAddr); // Cargar la dirección de "true_str" en r.A0
    code.li(r.A7, 4); // Llamada al sistema para imprimir una cadena
    code.ecall(); // Imprimir "true"
    
    // Fin de la función
    code.addLabel('end_print_boolean');
    if (rd !== r.A0) {
        code.pop(r.A0); // Recuperar el valor original de r.A0 si fue cambiado
    }

    code.comment('Fin de printBoolean');
};

export const printNull = (code) => {
    code.comment('Inicio de printNull');
    
    // Cargar la dirección de la cadena "null"
    const nullStringAddr = 'null_str'; // Dirección de la cadena "null"
    code.la(r.A0, nullStringAddr); // Cargar la dirección de "null_str" en r.A0
    
    // Imprimir "null"
    code.li(r.A7, 4); // Llamada al sistema para imprimir una cadena
    code.ecall(); // Imprimir "null"
    
    code.comment('Fin de printNull');
}

export const dividirN = (code) => {
    // t1: left operand
    // t0 -> right operand
    code.div(r.T1, r.T0, r.T1);
    code.push(r.T0);
    code.pushObject({ type: 'int', length: 4 });
}


export const builtins = {
    concatString,
    lessOrEqual,
    less,
    moreOrEqual,
    more,
    equal,
    equalStr,
    notEqual,
    notEqualStr,
    lessOrEqualF,
    lessF,
    moreOrEqualF,
    moreF,
    equalF,
    notEqualF,
    printBoolean,
    printNull,
    dividirN,
}