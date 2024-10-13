import * as monaco from 'https://cdn.jsdelivr.net/npm/monaco-editor@0.50.0/+esm';
import { parse } from './gramatica/grammar.js';
import { InterpreterVisitor } from './interpretar/interpreter.js';
import { CompilerVisitor } from './Compilador/compiler.js';

const btn = document.getElementById('btn');
const salida = document.getElementById('salida');
let errores = [];

let tabCount = 1;
let editors = {}; // Para almacenar instancias de editores por pestaña
let activeTab = null;

// Limpiar el contenido del archivo en la pestaña activa
document.getElementById('crearArchivo').addEventListener('click', () => {
    if (activeTab) {
        editors[activeTab].setValue('');
    }
});

// Ejecutar el código fuente cuando se presiona el botón
btn.addEventListener('click', () => {
    if (!activeTab) return;

    const codigoFuente = editors[activeTab].getValue();
    try {
        const sentencias = parse(codigoFuente);

        const interprete = new InterpreterVisitor();
        sentencias.forEach(sentencia => sentencia.accept(interprete));

        if(errores.length == 0){
            const compilador = new CompilerVisitor();
            sentencias.forEach(sentencia => sentencia.accept(compilador));
            salida.innerHTML = compilador.code.toString();
        }
        
        //salida.innerHTML = interprete.salida;
        errores = []; // Limpiar la lista de errores si la ejecución es exitosa
    } catch (error) {
        console.error(error);

        salida.innerHTML = error.message;

        // Verificar si el error tiene ubicación (location), y almacenar
        errores.push({
            mensaje: error.message,
            linea: error.location?.start?.line || 'N/A',
            columna: error.location?.start?.column || 'N/A'
        });
    }
});

// Abrir archivo desde el sistema de archivos
document.getElementById('abrirArchivo').addEventListener('click', () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.oak';

    input.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (file && activeTab) {
            const reader = new FileReader();
            reader.onload = () => {
                editors[activeTab].setValue(reader.result);
            };
            reader.readAsText(file);
        }
    });

    input.click();
});

// Guardar archivo en el sistema
document.getElementById('guardarArchivo').addEventListener('click', async () => {
    if (!activeTab) return;

    const content = editors[activeTab].getValue();

    const options = {
        types: [{
            description: 'Oak Files',
            accept: {
                'text/plain': ['.oak'],
            },
        }],
        suggestedName: 'archivo.oak'
    };

    try {
        const fileHandle = await window.showSaveFilePicker(options);
        const writableStream = await fileHandle.createWritable();

        await writableStream.write(content);
        await writableStream.close();

        alert('Archivo guardado exitosamente.');
    } catch (error) {
        console.error('Error al guardar el archivo:', error);
    }
});

// Manejo de pestañas
document.getElementById('addTab').addEventListener('click', () => {
    const tabs = document.getElementById('tabs');
    const editorsContainer = document.getElementById('editors');

    const tabId = `tab-${tabCount}`;
    const tab = document.createElement('div');
    tab.className = 'tab';
    tab.innerText = `Pestaña ${tabCount}`;
    tab.dataset.id = tabId;

    tab.addEventListener('click', () => {
        document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.editor-instance').forEach(e => e.classList.remove('active'));

        tab.classList.add('active');
        const editorElement = document.getElementById(`editor-${tabId}`);
        editorElement.classList.add('active');
        editors[tabId].layout();
        activeTab = tabId;
    });

    const editorContainer = document.createElement('div');
    editorContainer.id = `editor-${tabId}`;
    editorContainer.className = 'editor-instance';

    editorsContainer.appendChild(editorContainer);
    tabs.appendChild(tab);

    // Crear una instancia de Monaco Editor para la nueva pestaña
    editors[tabId] = monaco.editor.create(editorContainer, {
        value: '',
        language: 'javascript',
        theme: 'vs-dark',
    });

    tab.click();
    tabCount++;
});

// Eliminar pestaña
document.getElementById('removeTab').addEventListener('click', () => {
    if (!activeTab) return;

    const tabs = document.getElementById('tabs');
    const editorsContainer = document.getElementById('editors');
    const activeTabElement = document.querySelector(`.tab[data-id="${activeTab}"]`);

    if (activeTabElement) {
        tabs.removeChild(activeTabElement);
        editorsContainer.removeChild(editors[activeTab].getDomNode().parentNode);

        delete editors[activeTab];

        const lastTab = tabs.lastElementChild;
        if (lastTab) {
            lastTab.click();
        } else {
            activeTab = null;
        }
    }
});

// Reporte de símbolos
document.querySelector('.ReporteSimbolo').addEventListener('click', () => {
    if (!activeTab) return;

    const codigoFuente = editors[activeTab].getValue();

    try {
        const sentencias = parse(codigoFuente);

        const interprete = new InterpreterVisitor();
        sentencias.forEach(sentencia => sentencia.accept(interprete));

        const reporteHTML = interprete.generarReporteHTML();

        // Crear un blob con el contenido HTML y ofrecerlo como descarga
        const blob = new Blob([reporteHTML], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'reporte_simbolos.html';
        link.click();
        URL.revokeObjectURL(url);
    } catch (error) {
        salida.innerHTML = error.message + ' at line ' + (error.location?.start?.line || 'N/A') + ' column ' + (error.location?.start?.column || 'N/A');
    }
});


// Generar reporte de errores
function generarReporteErroresHTML() {
    if (errores.length === 0) {
        return `
        <!DOCTYPE html>
        <html lang="es">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Reporte de Errores</title>
        </head>
        <body>
            <h1>No se encontraron errores</h1>
        </body>
        </html>`;
    }

    let reporteErroresHTML = `
    <!DOCTYPE html>
    <html lang="es">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Reporte de Errores</title>
        <style>
            body {
                font-family: Arial, sans-serif;
                margin: 20px;
            }
            table {
                width: 100%;
                border-collapse: collapse;
                margin-bottom: 20px;
            }
            table, th, td {
                border: 1px solid black;
            }
            th, td {
                padding: 10px;
                text-align: left;
            }
            th {
                background-color: #f2f2f2;
            }
            h1 {
                text-align: center;
            }
        </style>
    </head>
    <body>
        <h1>Reporte de Errores</h1>
        <table>
            <thead>
                <tr>
                    <th>Mensaje de Error</th>
                    <th>Línea</th>
                    <th>Columna</th>
                </tr>
            </thead>
            <tbody>`;

    errores.forEach(error => {
        reporteErroresHTML += `
        <tr>
            <td>${error.mensaje}</td>
            <td>${error.linea}</td>
            <td>${error.columna}</td>
        </tr>`;
    });

    reporteErroresHTML += `
            </tbody>
        </table>
    </body>
    </html>`;

    return reporteErroresHTML;
}

// Reporte de errores
document.querySelector('.ReporteError').addEventListener('click', () => {
    const reporteHTML = generarReporteErroresHTML();

    // Crear un blob con el contenido HTML y ofrecerlo como descarga
    const blob = new Blob([reporteHTML], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'reporte_errores.html';
    link.click();
    URL.revokeObjectURL(url);
});

// Guardar archivo de salida con la extensión .s
document.getElementById('guardarSalida').addEventListener('click', async () => {
    const content = salida.textContent;  // Obtener el contenido correctamente

    const options = {
        types: [{
            description: 'Assembly Files',
            accept: {
                'text/plain': ['.s'],  // Asegurar que la extensión sea .s
            },
        }],
        suggestedName: 'resultado.s'  // Nombre sugerido
    };

    try {
        const fileHandle = await window.showSaveFilePicker(options);
        const writableStream = await fileHandle.createWritable();

        await writableStream.write(content);  // Escribir el contenido correctamente
        await writableStream.close();

        alert('Archivo de salida guardado exitosamente.');
    } catch (error) {
        console.error('Error al guardar el archivo de salida:', error);
    }
});
