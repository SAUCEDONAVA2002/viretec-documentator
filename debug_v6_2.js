const fs = require('fs');

try {
    const workflow = JSON.parse(fs.readFileSync('./V6.2.json', 'utf8'));
    const node = workflow.nodes.find(n => n.name === 'Sanitizar Salida IA');

    if (!node) {
        throw new Error("Node 'Sanitizar Salida IA' not found in V6.2.json");
    }

    const code = node.parameters.jsCode;
    console.log("✅ Code extracted from V6.2.json");

    // --- TEST METADATA VALIDATION ---
    console.log("\n--- TEST: Metadata Validation ---");
    const testCases = [
        {
            input: { "Proyecto": "n8n automation", "Autor": "emiliano", "Responsable": "Daniel" },
            expected: { "Proyecto": "Automatizaciones N8N", "Autor": "Emiliano Saucedo", "Responsable": "Daniel Gatica" }
        },
        {
            input: { "Proyecto": "Formacion 2024", "Autor": "IA", "Responsable": "emiliano" },
            expected: { "Proyecto": "Formación Emiliano", "Autor": "Equipo AI-OPS", "Responsable": "Emiliano Saucedo" }
        },
        {
            input: { "Proyecto": "Unknown", "Autor": "Unknown", "Responsable": "Unknown" },
            expected: { "Proyecto": "Automatizaciones N8N", "Autor": "Equipo AI-OPS", "Responsable": "Emiliano Saucedo" } // Defaults
        }
    ];

    const executeNode = new Function('items', code);

    testCases.forEach((tc, idx) => {
        const items = [{
            json: {
                output: {
                    ...tc.input,
                    "Nombre del Flujo": "Metadata Test",
                    "Status": "Por Documentar"
                }
            }
        }];
        const result = executeNode(items);
        const actual = result[0].json.output;

        let pass = true;
        ['Proyecto', 'Autor', 'Responsable'].forEach(key => {
            if (actual[key] !== tc.expected[key]) {
                console.error(`Case ${idx} [${key}]: "${actual[key]}" != "${tc.expected[key]}" ❌`);
                pass = false;
            } else {
                // console.log(`Case ${idx} [${key}]: "${actual[key]}" ✅`);
            }
        });

        if (pass) console.log(`Case ${idx}: ALL FIELDS MATCH ✅`);
        else console.error(`Case ${idx}: FAILED ❌`);
    });

} catch (e) {
    console.error("❌ ERROR:", e.message);
}
