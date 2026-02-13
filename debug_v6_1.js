const fs = require('fs');

try {
    const workflow = JSON.parse(fs.readFileSync('./V6.1.json', 'utf8'));
    const node = workflow.nodes.find(n => n.name === 'Sanitizar Salida IA');

    if (!node) {
        throw new Error("Node 'Sanitizar Salida IA' not found in V6.1.json");
    }

    const code = node.parameters.jsCode;
    console.log("✅ Code extracted from V6.1.json");

    // --- TEST BATCH PROCESSING ---
    console.log("\n--- TEST: Batch Processing (Multiple Items) ---");
    const items = [
        {
            json: {
                output: {
                    "Nombre del Flujo": "Flow 1 (Activo)",
                    "Status": "Activo",
                    "Contenido Markdown": "Content 1"
                }
            }
        },
        {
            json: {
                output: {
                    "Nombre del Flujo": "Flow 2 (Documentado)",
                    "Status": "Documentado",
                    "Contenido Markdown": "Content 2"
                }
            }
        }
    ];

    const executeNode = new Function('items', code);
    const result = executeNode(items);

    console.log(`Input Items: ${items.length}`);
    console.log(`Output Items: ${result.length}`);

    if (result.length === 2) {
        console.log("✅ Batch Size Preserved");

        const r1 = result[0].json.output;
        const r2 = result[1].json.output;

        console.log(`Item 1 Status: ${r1.Status} (Expected: En Proceso) -> ${r1.Status === 'En Proceso' ? '✅' : '❌'}`);
        console.log(`Item 2 Status: ${r2.Status} (Expected: Por Documentar) -> ${r2.Status === 'Por Documentar' ? '✅' : '❌'}`);

        if (r1.Status === 'En Proceso' && r2.Status === 'Por Documentar') {
            console.log("🎉 SUCCESS: Batch processing + Status validation works!");
        } else {
            console.error("💥 ERROR: Status logic failed in batch.");
        }

    } else {
        console.error("💥 ERROR: Batch size mismatch! Only processed first item?");
    }

} catch (e) {
    console.error("❌ ERROR:", e.message);
}
