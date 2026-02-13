const fs = require('fs');

try {
    const workflow = JSON.parse(fs.readFileSync('./V6.json', 'utf8'));
    const node = workflow.nodes.find(n => n.name === 'Sanitizar Salida IA');

    if (!node) {
        throw new Error("Node 'Sanitizar Salida IA' not found in V6.json");
    }

    const code = node.parameters.jsCode;
    console.log("✅ Code extracted from V6.json");

    // --- TEST 1: STATUS VALIDATION ---
    console.log("\n--- TEST: Status Validation ---");
    const testCases = [
        { input: "Activo", expected: "En Proceso" },
        { input: "Active", expected: "En Proceso" },
        { input: "Documentado", expected: "Por Documentar" }, // fallback
        { input: "Terminado", expected: "Por Documentar" }, // fallback
        { input: "Pendiente", expected: "Pendiente" } // valid
    ];

    const executeNode = new Function('items', code);

    testCases.forEach(tc => {
        const items = [{
            json: {
                output: {
                    "Nombre del Flujo": "Status Test",
                    "Status": tc.input,
                    "Contenido Markdown": "Content"
                }
            }
        }];
        const result = executeNode(items);
        const actual = result[0].json.output.Status;

        if (actual === tc.expected) {
            console.log(`Input: "${tc.input}" -> Output: "${actual}" ✅ PASS`);
        } else {
            console.error(`Input: "${tc.input}" -> Output: "${actual}" ❌ FAIL (Expected: "${tc.expected}")`);
        }
    });

} catch (e) {
    console.error("❌ ERROR:", e.message);
}
