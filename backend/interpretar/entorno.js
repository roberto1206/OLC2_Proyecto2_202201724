

export class Entorno {
    constructor(padre = undefined) {
        this.valores = {};
        this.padre = padre;
    }

    /**
     * @param {string} nombre
     * @param {any} valor
     */
    set(nombre, valor) {
        // Verifica si la variable ya existe en el entorno
        if (this.valores.hasOwnProperty(nombre)) {
            throw new Error(`Error: la variable '${nombre}' ya está definida.`);
        }
        this.valores[nombre] = valor;
    }

    /**
     * @param {string} nombre
     */
    get(nombre) {
        const valorActual = this.valores[nombre];

        if (valorActual !== undefined) return valorActual;

        if (!valorActual && this.padre) {
            return this.padre.get(nombre);
        }

        throw new Error(`Variable ${nombre} no definida`);
    }

    /**
   * @param {string} nombre
   * @param {any} valor
   */
    assign(nombre, valor) {
        const valorActual = this.valores[nombre];

        if (valorActual !== undefined) {
            this.valores[nombre] = valor;
            return;
        }

        if (!valorActual && this.padre) {
            this.padre.assign(nombre, valor);
            return;
        }

        throw new Error(`Variable ${nombre} no definida`);
    }
}