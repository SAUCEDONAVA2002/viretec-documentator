const fs = require('fs');

try {
    const filePath = './V6.2.json';
    const workflow = JSON.parse(fs.readFileSync(filePath, 'utf8'));

    // Find the Sanitizar node
    const node = workflow.nodes.find(n => n.name === 'Sanitizar Salida IA');
    if (!node) throw new Error("Sanitizar node not found");

    // The Code to Inject
    const newCode = `const newItems = [];

function clean(str) {
  if (!str) return '';
  return str.toString()
    .replace(/[\\u{1F600}-\\u{1F6FF}]/gu, '')
    .replace(/[\\u{2700}-\\u{27BF}]/gu, '')\n    .replace(/[✔️🔴⚠️🟢⚪🟡]/g, '')
    .trim();
}

for (const item of items) {
    let output = item.json.output || item.json;
    if (typeof output !== 'object' || output === null) output = {};

    if (output['Status']) {
        let s = clean(output['Status']);
        const valid = ['Por Documentar', 'Pendiente', 'En Proceso'];
        if (s === 'Activo' || s === 'Active') s = 'En Proceso';
        if (!valid.includes(s)) s = 'Por Documentar';
        output['Status'] = s;
    }

    // --- Prioridad ---
    let prio = clean(output['Prioridad']);
    if (['Alta', 'Media', 'Baja'].includes(prio)) {
        output['Prioridad'] = prio;
    } else {
        if (prio === 'High') output['Prioridad'] = 'Alta';
        else if (prio === 'Medium') output['Prioridad'] = 'Media';
        else if (prio === 'Low') output['Prioridad'] = 'Baja';
        else output['Prioridad'] = 'Alta';
    }

    // --- Autor ---
    let a = clean(output['Autor']);
    if (['IA', 'AI', 'Gemini', 'Equipo AI-OPS'].includes(a) || !a) output['Autor'] = 'Equipo AI-OPS';
    else if (a.toLowerCase().includes('daniel')) output['Autor'] = 'Daniel Gatica';
    else if (a.toLowerCase().includes('emiliano')) output['Autor'] = 'Emiliano Saucedo';
    else output['Autor'] = 'Equipo AI-OPS';

    // --- Responsable ---
    let r = clean(output['Responsable']);
    if (r.toLowerCase().includes('daniel')) output['Responsable'] = 'Daniel Gatica';
    else if (r.toLowerCase().includes('emiliano')) output['Responsable'] = 'Emiliano Saucedo';
    else output['Responsable'] = 'Emiliano Saucedo';

    // --- Proyecto ---
    let p = clean(output['Proyecto']);
    if (p.toLowerCase().includes('n8n')) output['Proyecto'] = 'Automatizaciones N8N';
    else if (p.toLowerCase().includes('venture')) output['Proyecto'] = 'Venture Lab';
    else if (p.toLowerCase().includes('landing')) output['Proyecto'] = 'Landing Viretec';
    else if (p.toLowerCase().includes('formación') || p.toLowerCase().includes('formacion')) output['Proyecto'] = 'Formación Emiliano';
    else output['Proyecto'] = 'Automatizaciones N8N';

    output._valid = (output['Nombre del Flujo'] && output['Nombre del Flujo'].length > 0);

    const markdown = output['Contenido Markdown'] || '';
    const MAX_LENGTH = 1800;
    const chunks = [];

    if (markdown.length > 0) {
        const paragraphs = markdown.split('\\n');
        let currentChunk = '';
        for (const para of paragraphs) {
            if ((currentChunk.length + para.length + 1) > MAX_LENGTH) {
                if (currentChunk.trim().length > 0) { chunks.push(currentChunk); currentChunk = ''; }
                if (para.length > MAX_LENGTH) {
                    let temp = para;
                    while (temp.length > 0) { chunks.push(temp.substring(0, MAX_LENGTH)); temp = temp.substring(MAX_LENGTH); }
                } else { currentChunk = para + '\\n'; }
            } else { currentChunk += para + '\\n'; }
        }
        if (currentChunk.trim().length > 0) chunks.push(currentChunk);
    }
    
    for (let i = 0; i < 8; i++) {
        output[\`md_part_\${i+1}\`] = chunks[i] || ''; 
    }

    newItems.push({json: {output: output}});
}

return newItems;`;

    // Inject
    node.parameters.jsCode = newCode;
    console.log("Injected safe JS code into V6.2.json");

    // Write back
    fs.writeFileSync(filePath, JSON.stringify(workflow, null, 2));
    console.log("Saved V6.2.json");

} catch (e) {
    console.error("Error:", e.message);
    // If parse failed (because file is corrupt from previous step), we might need to overwrite it with V6.1 first?
    // But let's hope it parses or we handle it.
}
