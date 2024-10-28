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

export const errorMemory = (code) => {
    // Manejo de errores de memoria (puedes implementar esto según tus necesidades)
    code.comment('Error: No hay suficiente memoria');
    code.halt();  // Detener la ejecución o manejar el error según corresponda
}

export const dividirN = (code) => {
    // t1: left operand
    // t0 -> right operand
    code.div(r.T1, r.T0, r.T1);
    code.push(r.T0);
    code.pushObject({ type: 'int', length: 4 });
}

export const printArray = (code) => {
    // A0 -> dirección en heap del array
    code.comment('Inicio de printArray');
    
    // Cargar la dirección de la cadena "array"
    code.mv(r.A0, r.T1); // Cargar la dirección del array en r.A0
    
    // Imprimir "array"
    code.li(r.A7, 1); // Llamada al sistema para imprimir una cadena
    code.ecall(); // Imprimir "array"
    
    code.comment('Fin de printArray');
}

// crear builtins para las funciones embebidas

//parserInt

export const parserInt = (code) => {
    // A0 -> dirección en heap de la cadena
    // result -> push en el stack el valor entero de la cadena

    code.comment('Inicio de parseInt');
    const end = code.getLabel();
    const loop = code.getLabel();
    const notDigit = code.getLabel();
    const isDecimalPoint = code.getLabel();

    // Inicializar el resultado en 0
    code.li(r.T0, 0); // Inicializar el resultado en 0

    // Bucle para recorrer cada byte de la cadena
    code.addLabel(loop);
    code.lb(r.T1, 0, r.A0); // Cargar el byte actual de la cadena en r.T1

    // Verificar si llegamos al final de la cadena o un punto decimal
    code.li(r.T2, 0); // Byte null ('\0')
    code.beq(r.T1, r.T2, end); // Si es el final de la cadena, salta al final
    code.li(r.T2, 46); // Byte del punto '.'
    code.beq(r.T1, r.T2, isDecimalPoint); // Si es un punto decimal, termina la conversión

    // Verificar si el byte es un dígito
    code.li(r.T2, 48); // Cargar el byte '0' en r.T2
    code.blt(r.T1, r.T2, notDigit); // Si el byte es menor que '0', no es un dígito
    code.li(r.T2, 57); // Cargar el byte '9' en r.T2
    code.bgt(r.T1, r.T2, notDigit); // Si el byte es mayor que '9', no es un dígito

    // Convertir el byte a un dígito
    code.li(r.T2, 48); // Cargar el byte '0' en r.T2
    code.sub(r.T1, r.T1, r.T2); // Convertir el byte a un dígito

    // Actualizar el resultado
    code.mul(r.T0, r.T0, 10); // Multiplicar el resultado por 10
    code.add(r.T0, r.T0, r.T1); // Sumar el dígito al resultado

    // Avanzar al siguiente byte en la cadena
    code.addi(r.A0, r.A0, 1); // Avanzar al siguiente byte
    code.j(loop); // Repetir el ciclo

    // Etiqueta para el caso en que el byte no es un dígito
    code.addLabel(notDigit);
    code.j(end); // Saltar al final si no es un dígito

    // Etiqueta para el caso en que es un punto decimal
    code.addLabel(isDecimalPoint);
    code.j(end); // Termina la conversión si encuentra un punto decimal

    // Etiqueta para el final de la función
    code.addLabel(end);
    code.push(r.T0); // Empujar el resultado a la pila
    code.comment('Fin de parseInt');
}

// * AQUI PONER FUNCIONES EMBEBIDAS

/**
 * 
 * @param {Generador} code 
 */
export const parseInt = (code) => {

    // A0 -> dirección en heap de la cadena

    code.comment('Buscando el inicio de la parte entera')
    code.add(r.T1, r.A0, r.ZERO)
    code.li(r.T2, 46) // ascii de "."

    const end = code.getLabel()
    const loop = code.addLabel()

    code.lb(r.T0, r.T1)
    code.beq(r.T0, r.ZERO, end) // Fin de la cadena
    code.beq(r.T0, r.T2, end) // Se encontró el punto
    code.addi(r.T1, r.T1, 1)
    code.j(loop)
    code.addLabel(end)

    code.addi(r.T1, r.T1, -1) // Retroceder para no incluir el punto o el fin de la cadena
    code.li(r.T0, 0) // Inicializar el resultado en 0
    code.li(r.T2, 1) // Inicializar el multiplicador en 1 (UNIDADES)

    const convert = code.getLabel()
    const endConvert = code.getLabel()
    const error = code.getLabel()

    code.li(r.T4, 9) // el digito máximo que se puede tener
    code.li(r.T5, 10) // base 10

    code.comment('Convirtiendo la parte entera')
    code.addLabel(convert)
    code.blt(r.T1, r.A0, endConvert) // Se terminó de convertir la parte entera
    code.lb(r.T3, r.T1)
    code.addi(r.T3, r.T3, -48) // Convertir de ascii a entero

    code.blt(r.T3, r.ZERO, error) // No es un dígito
    code.blt(r.T4, r.T3, error) // Es un dígito mayor a 9; 9 < t3

    code.mul(r.T3, r.T3, r.T5) // t0 = t0 * 10
    code.add(r.T0, r.T0, r.T3) // t0 = t0 + t3
    code.mul(r.T2, r.T2, r.T5) // t2 = t2 * 10
    code.addi(r.T1, r.T1, -1)
    code.j(convert)

    const endBuiltin = code.getLabel()

    code.addLabel(endConvert)
    code.push(r.T0)
    code.j(endBuiltin)

    code.addLabel(error)
    code.li(r.T0, 0) // NULL    
    code.push(r.T0)
    code.printStringLiteral("ERROR: No se pudo convertir a entero")

    code.addLabel(endBuiltin)
}


/**
 * 
 * @param {Generador} code 
 */
export const parseFloat = (code) => {

    code.push(r.A0)
    parseInt(code)
    code.pop(r.T0) // Parte entera
    code.pop(r.A0) // Dirección de la cadena

    code.comment('Buscando el inicio de la parte decimal')

    code.add(r.T1, r.A0, r.ZERO)
    code.lb(r.T2, r.T1) // T2 = a un caracter de la cadena
    code.li(r.T3, 46) // ascii de "."

    const initFindLabel = code.getLabel()
    const endFindLabel = code.getLabel()

    code.addLabel(initFindLabel)
    code.beq(r.T2, r.ZERO, endFindLabel) // Fin de la cadena
    code.beq(r.T2, r.T3, endFindLabel) // Se encontró el punto
    code.addi(r.T1, r.T1, 1)
    code.lb(r.T2, r.T1)
    code.j(initFindLabel)
    code.addLabel(endFindLabel)

    code.addi(r.T1, r.T1, 1) // Retroceder para no incluir el punto o el fin de la cadena
    code.add(r.A0, r.T1, r.ZERO) // A0 = Dirección de la parte decimal

    code.push(r.T0) // Guardar la parte entera
    code.push(r.T1) // Guardar la dirección de la parte decimal
    parseInt(code)
    code.pop(r.T2) // Parte decimal en formato entero
    code.pop(r.T1) // Dirección de la parte decimal
    code.pop(r.T0) // Parte entera


    code.comment('Buscando el final de la cadena')
    code.add(r.T3, r.A0, r.ZERO)

    const findEndOfString = code.getLabel()
    const endFindEndOfString = code.getLabel()

    code.lb(r.T4, r.T3)
    code.addLabel(findEndOfString)
    code.beq(r.T4, r.ZERO, endFindEndOfString) // Fin de la cadena
    code.addi(r.T3, r.T3, 1)
    code.lb(r.T4, r.T3)
    code.j(findEndOfString)
    code.addLabel(endFindEndOfString)

    // T0 = Parte entera
    // T1 = Dirección de inicio de la parte decimal
    // T2 = Parte decimal en formato entero
    // T3 = Dirección de fin de la cadena

    code.comment('Calculando la parte decimal')
    code.sub(r.T4, r.T3, r.T1) // T4 = Longitud de la parte decimal. Cuantos decimales tiene
    code.li(r.A0, 1)
    code.li(r.A1, 0)
    code.li(r.A2, 10)

    const encontrarDivisorInicio = code.getLabel()
    const encontrarDivisorFin = code.getLabel()

    code.addLabel(encontrarDivisorInicio)
    code.bge(r.A1, r.T4, encontrarDivisorFin) // Ya se encontró el divisor
    code.mul(r.A0, r.A0, r.A2)
    code.addi(r.A1, r.A1, 1)
    code.j(encontrarDivisorInicio)
    code.addLabel(encontrarDivisorFin)

    code.fcvtsw(f.FA1, r.T2) // Convertir la parte decimal a float
    code.fcvtsw(f.FA2, r.A0) // Convertir el divisor a float
    code.fdiv(f.FA1, f.FA1, f.FA2) // FA1 = FA1 / FA2

    code.fcvtsw(f.FA0, r.T0) // Convertir la parte entera a float

    code.fadd(f.FA0, f.FA0, f.FA1) // FA0 = FA0 + FA1

    code.pushFloat(f.FA0)
}

/**
 * Convierte cualquier valor en una cadena.
 * 
 * @param {Generador} code 
 */
export const parseString = (code) => {

    const error = code.getLabel() // Etiqueta para manejar errores

    // Se espera que el valor ya esté en el registro A0 (puede ser un número o booleano)
    code.comment('Convirtiendo cualquier valor a cadena')

    // Comprobamos si es un entero
    code.li(r.T0, 0) // Inicializamos el registro T0 a 0
    code.blt(r.A0, r.T0, error) // Si A0 < 0, entonces no es un entero

    code.comment('Convertir entero a cadena')

    // Aquí colocarías el código para convertir el entero en caracteres ASCII y almacenarlo en el heap

    code.comment('Escribir el valor convertido en memoria')

    // Esto dependerá de la ubicación en la que quieres almacenar la cadena (heap, stack)

    code.comment('Manejo de errores')
    code.addLabel(error)
    code.printStringLiteral("ERROR: No se pudo convertir el valor a cadena")
    code.push(r.ZERO) // Pusheamos NULL si ocurre un error
}

/**
 * Convierte todos los caracteres de una cadena a mayúsculas.
 * 
 * @param {Generador} code 
 */
export const toUpperCase = (code) => {
    code.comment("Convertir string a mayúsculas");
    
    // Guardar en el stack la dirección del nuevo string
    code.push(r.HP);
    
    const end = code.getLabel();
    const loop = code.addLabel();
    
    // Cargar un byte del string original
    code.lb(r.T1, r.A0);
    
    // Si es null (0), terminar
    code.beq(r.T1, r.ZERO, end);
    
    // Verificar si es una letra minúscula (ASCII 97-122)
    code.li(r.T2, 97);  // 'a'
    code.li(r.T3, 122); // 'z'
    
    const noConvert = code.getLabel();
    
    // Si T1 < 97 ('a'), no convertir
    code.blt(r.T1, r.T2, noConvert);
    // Si T1 > 122 ('z'), no convertir
    code.bgt(r.T1, r.T3, noConvert);
    
    // Convertir a mayúscula restando 32
    code.addi(r.T1, r.T1, -32);
    
    code.addLabel(noConvert);
    // Guardar el byte en el heap
    code.sb(r.T1, r.HP);
    
    // Incrementar los punteros
    code.addi(r.HP, r.HP, 1);
    code.addi(r.A0, r.A0, 1);
    
    // Continuar con el siguiente caracter
    code.j(loop);
    
    code.addLabel(end);
    // Añadir el terminador null
    code.sb(r.ZERO, r.HP);
    code.addi(r.HP, r.HP, 1);
}


/**
 * Convierte todos los caracteres de una cadena a minúsculas.
 * 
 * @param {Generador} code 
 */
export const toLowerCase = (code) => {
    code.comment("Convertir string a minúsculas");
    
    // Guardar en el stack la dirección del nuevo string
    code.push(r.HP);
    
    const end = code.getLabel();
    const loop = code.addLabel();
    
    // Cargar un byte del string original
    code.lb(r.T1, r.A0);
    
    // Si es null (0), terminar
    code.beq(r.T1, r.ZERO, end);
    
    // Verificar si es una letra mayúscula (ASCII 65-90)
    code.li(r.T2, 65);  // 'A'
    code.li(r.T3, 90);  // 'Z'
    
    const noConvert = code.getLabel();
    
    // Si T1 < 65 ('A'), no convertir
    code.blt(r.T1, r.T2, noConvert);
    // Si T1 > 90 ('Z'), no convertir
    code.bgt(r.T1, r.T3, noConvert);
    
    // Convertir a minúscula sumando 32
    code.addi(r.T1, r.T1, 32);
    
    code.addLabel(noConvert);
    // Guardar el byte en el heap
    code.sb(r.T1, r.HP);
    
    // Incrementar los punteros
    code.addi(r.HP, r.HP, 1);
    code.addi(r.A0, r.A0, 1);
    
    // Continuar con el siguiente caracter
    code.j(loop);
    
    code.addLabel(end);
    // Añadir el terminador null
    code.sb(r.ZERO, r.HP);
    code.addi(r.HP, r.HP, 1);
}

/**
 * Convierte todos los caracteres de una cadena a minúsculas.
 * 
 * @param {Generador} code 
 */
export const typeOf = (code) => {
    code.comment('Inicio de typeOf');

    code.push(r.T0); // Guardar el tipo en la pila

    // Cargar el tipo del objeto desde la pila
    code.lw(r.T1, r.SP);

    // Revisar tipo usando comparaciones y saltos
    code.li(r.T0, 0);
    code.beq(r.T1, r.T0, 'is_int'); // Si T1 es 0, es int
    code.li(r.T0, 1);
    code.beq(r.T1, r.T0, 'is_float'); // Si T1 es 1, es float
    code.li(r.T0, 2);
    code.beq(r.T1, r.T0, 'is_string'); // Si T1 es 2, es string
    code.li(r.T0, 3);
    code.beq(r.T1, r.T0, 'is_char'); // Si T1 es 3, es char
    code.li(r.T0, 4);
    code.beq(r.T1, r.T0, 'is_boolean'); // Si T1 es 4, es boolean

    code.j('end_typeOf'); // Saltar al final si no coincide con ningún tipo

    // Etiquetas para los diferentes tipos
    code.addLabel('is_int');
    code.la(r.A0, 'int_str'); // Cargar dirección de la cadena "int"
    code.j('print_type'); // Saltar a la impresión

    code.addLabel('is_float');
    code.la(r.A0, 'float_str'); // Cargar dirección de la cadena "float"
    code.j('print_type'); // Saltar a la impresión

    code.addLabel('is_string');
    code.la(r.A0, 'string_str'); // Cargar dirección de la cadena "string"
    code.j('print_type'); // Saltar a la impresión

    code.addLabel('is_char');
    code.la(r.A0, 'char_str'); // Cargar dirección de la cadena "char"
    code.j('print_type'); // Saltar a la impresión

    code.addLabel('is_boolean');
    code.la(r.A0, 'bool_str'); // Cargar dirección de la cadena "boolean"

    // Imprimir el tipo cargado
    code.addLabel('print_type');
    code.li(r.A7, 4); // Llamada al sistema para imprimir cadena
    code.ecall(); // Imprimir tipo
    code.j('end_typeOf'); // Saltar al final

    code.addLabel('end_typeOf');
    code.comment('Fin de typeOf');
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
    errorMemory,
    printArray,
    parseInt,
    parseFloat,
    parseString,
    toUpperCase,
    toLowerCase,
    typeOf,
}