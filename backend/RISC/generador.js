import { builtins } from "./builtins.js";
import { registers as r } from "./constantes.js";
import { stringTo1ByteArray, numberToF32 } from "./utils.js";

class Instruction {

    constructor(instruccion, rd, rs1, rs2) {
        this.instruccion = instruccion;
        this.rd = rd;
        this.rs1 = rs1;
        this.rs2 = rs2;
    }

    toString() {
        const operandos = []
        if (this.rd !== undefined) operandos.push(this.rd)
        if (this.rs1 !== undefined) operandos.push(this.rs1)
        if (this.rs2 !== undefined) operandos.push(this.rs2)
        return `${this.instruccion} ${operandos.join(', ')}`
    }

}

export class Generador {

    constructor() {
        this.instrucciones = []
        this.data = []
        this.objectStack = []
        this.depth = 0
        this._usedBuiltins = new Set()
        this._labelCounter = 0;
    }

    getLabel() {
        return `L${this._labelCounter++}`
    }

    addLabel(label) {
        label = label || this.getLabel()
        this.instrucciones.push(new Instruction(`${label}:`))
        return label
    }

    label(label) {
        this.instrucciones.push(new Instruction(`${label}:`))
    }

    add(rd, rs1, rs2) {
        this.instrucciones.push(new Instruction('add', rd, rs1, rs2))
    }

    sub(rd, rs1, rs2) {
        this.instrucciones.push(new Instruction('sub', rd, rs1, rs2))
    }

    mul(rd, rs1, rs2) {
        this.instrucciones.push(new Instruction('mul', rd, rs1, rs2))
    }

    div(rd, rs1, rs2) {
        this.instrucciones.push(new Instruction('div', rd, rs1, rs2))
    }

    addi(rd, rs1, inmediato) {
        this.instrucciones.push(new Instruction('addi', rd, rs1, inmediato))
    }

    sw(rs1, rs2, inmediato = 0) {
        this.instrucciones.push(new Instruction('sw', rs1, `${inmediato}(${rs2})`))
    }

    sb(rs1, rs2, inmediato = 0) {
        this.instrucciones.push(new Instruction('sb', rs1, `${inmediato}(${rs2})`))
    }

    lw(rd, rs1, inmediato = 0) {
        this.instrucciones.push(new Instruction('lw', rd, `${inmediato}(${rs1})`))
    }

    lb(rd, rs1, inmediato = 0) {
        this.instrucciones.push(new Instruction('lb', rd, `${inmediato}(${rs1})`))
    }

    dataInicial(datosArray){
        this.comment('Inicio de la sección de datos')
        const word = '.word';
        const finalWord = word + ' ' + datosArray.join(', ');
        this.data.push(finalWord);
    }

    /**
     * Carga datos en memoria
     * sirve para arreglos. cadenas y otras cosas en memoria
     */
    la(rd, label) {
        this.instrucciones.push(new Instruction('la', rd, label));
    }

    // --- Saltos condicionales
    /**
     * ==
     */
    beq(rs1, rs2, label) {
        this.instrucciones.push(new Instruction('beq', rs1, rs2, label))
    }

    /**
     * !=
     */
    bne(rs1, rs2, label) {
        this.instrucciones.push(new Instruction('bne', rs1, rs2, label))
    }
   
    /**
     * <
     */
    blt(rs1, rs2, label) {
        this.instrucciones.push(new Instruction('blt', rs1, rs2, label))
    }

    /**
     * >=
     */
    bge(rs1, rs2, label) {
        this.instrucciones.push(new Instruction('bge', rs1, rs2, label))
    }

    snez(rd, rs1) {
        this.instrucciones.push(new Instruction('snez', rd, rs1))
    }

    li(rd, inmediato) {
        this.instrucciones.push(new Instruction('li', rd, inmediato))
    }

    push(rd = r.T0) {
        this.comment(`Pushing ${rd}`)
        this.addi(r.SP, r.SP, -4) // 4 bytes = 32 bits
        this.sw(rd, r.SP)
    }

    pushFloat(rd = r.FT0) {
        this.addi(r.SP, r.SP, -4) // 4 bytes = 32 bits
        this.fsw(rd, r.SP)
    }

    rem(rd, rs1, rs2) {
        this.instrucciones.push(new Instruction('rem', rd, rs1, rs2))
    }

    pop(rd = r.T0) {
        this.lw(rd, r.SP)
        this.addi(r.SP, r.SP, 4)
    }

    jal(label) {
        this.instrucciones.push(new Instruction('jal', label))
    }

    j(label) {
        this.instrucciones.push(new Instruction('j', label))
    }

    ret() {
        this.instrucciones.push(new Instruction('ret'))
    }

    ecall() {
        this.instrucciones.push(new Instruction('ecall'))
    }

    callBuiltin(builtinName) {
        if (!builtins[builtinName]) {
            throw new Error(`Builtin ${builtinName} not found`)
        }
        this._usedBuiltins.add(builtinName)
        this.jal(builtinName)
    }

    printNewLine() {
        this.li(r.A0, 10);   // ASCII de '\n'
        this.li(r.A7, 11);   // System call for printing a character
        this.ecall();        // Hacer la llamada al sistema para imprimir '\n'
    }

    printEspacioBlanco(){
        this.li(r.A0, 32);   // ASCII de ' '
        this.li(r.A7, 11);   // System call for printing a character
        this.ecall();        // Hacer la llamada al sistema para imprimir ' '
    }
    
    printInt(rd = r.A0) {

        console.log('printInt')
        this.comment("Inicio de printInt");

        if (rd !== r.A0) {
            this.push(r.A0)
            this.add(r.A0, rd, r.ZERO)
        }

        this.li(r.A7, 1)
        this.ecall()

        if (rd !== r.A0) {
            this.pop(r.A0)
        }

        this.comment("Fin de printInt");

    }

    printString(rd = r.A0) {

        if (rd !== r.A0) {
            this.push(r.A0)
            this.add(r.A0, rd, r.ZERO)
        }

        this.li(r.A7, 4)
        this.ecall()

        if (rd !== r.A0) {
            this.pop(r.A0)
        }
    }

    printChar(rd = r.A0) {

        if (rd !== r.A0) {
            this.push(r.A0)
            this.add(r.A0, rd, r.ZERO)
        }
    
        this.li(r.A7, 11)  // System call for printing a character
        this.ecall()
    
        if (rd !== r.A0) {
            this.pop(r.A0)
        }
    }
    
    printFloat() {
        console.log('printFloat')
        this.li(r.A7, 2)
        this.ecall()

        // Imprimir salto de línea ('\n')
        this.printNewLine();
    }
    
    printBoolean(rd = r.A0) {
        console.log('printBoolean');
        this.callBuiltin('printBoolean');
    }
    
    printNull() {
        console.log('printNull');
        this.callBuiltin('printNull');
    }
    
    endProgram() {
        this.li(r.A7, 10)
        this.ecall()
    }

    comment(text) {
        this.instrucciones.push(new Instruction(`# ${text}`))
    }

    pushConstant(object) {
        let length = 0;

        switch (object.type) {
            case 'int':
                this.li(r.T0, object.valor);
                this.push()
                length = 4;
                break;

            case 'string':
                const stringArray = stringTo1ByteArray(object.valor);

                this.comment(`Pushing string ${object.valor}`);
                // this.addi(r.T0, r.HP, 4);
                // this.push(r.T0);
                this.push(r.HP);

                stringArray.forEach((charCode) => {
                    this.li(r.T0, charCode);
                    // this.push(r.T0);
                    // this.addi(r.HP, r.HP, 4);
                    // this.sw(r.T0, r.HP);

                    this.sb(r.T0, r.HP);
                    this.addi(r.HP, r.HP, 1);
                });

                length = 4;
                break;

            case 'char':
                this.comment(`Pushing char ${object.valor}`);
                this.li(r.T0, object.valor.charCodeAt(0));  // Cargar el valor ASCII del carácter
                this.push(r.T0);                               // Empujar a la pila
                length = 4;                                // Longitud de 1 byte para un carácter
                break;

            case 'boolean':
                this.li(r.T0, object.valor ? 1 : 0);
                this.push(r.T0);
                length = 4;
                break;

            case 'float':
                const ieee754 = numberToF32(object.valor);
                this.li(r.T0, ieee754);
                this.push(r.T0);
                length = 4;
                break;

            case 'null':
                this.comment('Pushing null');
                this.li(r.T0, -1);
                this.push(r.T0);
                length = 4;
                break;
                
            default:
                break;
        }

        this.pushObject({ type: object.type, length, depth: this.depth });
    }

    pushObject(object) {
        this.objectStack.push({
            ...object,
            depth: this.depth,
        });
    }

    popFloat(rd = r.FT0) {
        this.comment(`Popping float to ${rd}`)
        this.flw(rd, r.SP)
        this.addi(r.SP, r.SP, 4)
    }

    popObject(rd = r.T0) {
        const object = this.objectStack.pop();


        switch (object.type) {
            case 'int':
                this.pop(rd);
                break;
            case 'string':
                this.pop(rd);
                break;
            case 'char':
                this.pop(rd);
                break;
            case 'boolean':
                this.pop(rd);
                break;
            case 'float':
                this.popFloat(rd);
                break;
            case 'null':
                this.pop(rd);
                break;
            default:
                break;
        }

        return object;
    }

    getTopObject() {
        return this.objectStack[this.objectStack.length - 1];
    }

    /*
     FUNCIONES PARA ENTORNOS
    */

    newScope() {
        this.depth++
    }

    endScope() {
        let byteOffset = 0;

        for (let i = this.objectStack.length - 1; i >= 0; i--) {
            if (this.objectStack[i].depth === this.depth) {
                byteOffset += this.objectStack[i].length;
                this.objectStack.pop();
            } else {
                break;
            }
        }
        this.depth--

        return byteOffset;
    }


    tagObject(id) {
        this.objectStack[this.objectStack.length - 1].id = id;
    }

    getObject(id) {
        let byteOffset = 0;
        for (let i = this.objectStack.length - 1; i >= 0; i--) {
            if (this.objectStack[i].id === id) {
                this.comment('variable ${id} found');
                return [byteOffset, this.objectStack[i]];
            }
            byteOffset += this.objectStack[i].length;
        }

        throw new Error(`Variable ${id} not found`);
    }

    toString() {
        this.comment('Fin del programa')
        this.endProgram()
        this.comment('Builtins')

        Array.from(this._usedBuiltins).forEach(builtinName => {
            this.addLabel(builtinName)
            builtins[builtinName](this)
            this.ret()
        })

        return `.data
        false_str: .string "false" 
        true_str:  .string "true"
        null_str:  .string "null"
        ${this.data.map(d => `${d}`).join('\n')}
        heap:
.text

# inicializando el heap pointer
la ${r.HP}, heap

main:
${this.instrucciones.map(instruccion => `${instruccion}`).join('\n')}
`}

    // --- Instruciones flotantes

    fadd(rd, rs1, rs2) {
        this.instrucciones.push(new Instruction('fadd.s', rd, rs1, rs2))
    }

    fsub(rd, rs1, rs2) {
        this.instrucciones.push(new Instruction('fsub.s', rd, rs1, rs2))
    }

    fmul(rd, rs1, rs2) {
        this.instrucciones.push(new Instruction('fmul.s', rd, rs1, rs2))
    }

    fdiv(rd, rs1, rs2) {
        this.instrucciones.push(new Instruction('fdiv.s', rd, rs1, rs2))
    }

    fli(rd, inmediato) {
        this.instrucciones.push(new Instruction('fli.s', rd, inmediato))
    }

    fmv(rd, rs1) {
        this.instrucciones.push(new Instruction('fmv.s', rd, rs1))
    }

    flw(rd, rs1, inmediato = 0) {
        this.instrucciones.push(new Instruction('flw', rd, `${inmediato}(${rs1})`))
    }

    fsw(rs1, rs2, inmediato = 0) {
        this.instrucciones.push(new Instruction('fsw', rs1, `${inmediato}(${rs2})`))
    }

    fcvtsw(rd, rs1) {
        this.instrucciones.push(new Instruction('fcvt.s.w', rd, rs1))
    }

    //Relacionales flotantes 
    // <=
    fle(rd,rs1,rs2,label){
        this.instrucciones.push(new Instruction('fle.s', rd, rs1, rs2, label))
    }

    // < 
    flt(rd, rs1, rs2) {
        this.instrucciones.push(new Instruction('flt.s', rd, rs1, rs2));
    }

    // ==
    feq(rd, rs1, rs2, label){
        this.instrucciones.push(new Instruction('feq.s', rd, rs1, rs2 , label))
    }

    //-f.FT0
    fneg(rd, rs1){
        this.instrucciones.push(new Instruction('fneg.s', rd, rs1))
    }

    //mover flotantes
    fmvx(rd, rs1){
        this.instrucciones.push(new Instruction('fmv.x.w', rd, rs1))
    }

    //comprobar con 0
    beqz(rs1, label){
        this.instrucciones.push(new Instruction('beqz', rs1, label))
    }
}