// functions/api/sales.js

export async function onRequest(context) {
    const { request, env } = context;
    const method = request.method;

    if (method === "GET") {
        // Lista todas as vendas
        const list = await env.SALES_KV.list({ prefix: "sale:" });
        const sales = [];
        for (const key of list.keys) {
            const sale = await env.SALES_KV.get(key.name, "json");
            sales.push(sale);
        }
        return new Response(JSON.stringify(sales), {
            status: 200,
            headers: { "Content-Type": "application/json" }
        });
    } else if (method === "POST") {
        // Cria uma nova venda
        const body = await request.json();
        // Espera: itens (array), metodo e opcionalmente nomeFiado
        const { itens, metodo, nomeFiado } = body;
        if (!itens || !metodo) {
            return new Response(JSON.stringify({ error: "itens and metodo required" }), {
                status: 400,
                headers: { "Content-Type": "application/json" }
            });
        }
        if (metodo === "fiado") {
            if (!nomeFiado) {
                return new Response(JSON.stringify({ error: "nomeFiado required for fiado" }), {
                    status: 400,
                    headers: { "Content-Type": "application/json" }
                });
            }
            // Verifica se já existe uma venda fiada com o mesmo nome
            const list = await env.SALES_KV.list({ prefix: "sale:" });
            for (const key of list.keys) {
                const sale = await env.SALES_KV.get(key.name, "json");
                if (sale && sale.metodo === "fiado" && sale.nomeFiado === nomeFiado) {
                    return new Response(JSON.stringify({ error: "Fiado for this name already exists" }), {
                        status: 400,
                        headers: { "Content-Type": "application/json" }
                    });
                }
            }
        }
        const id = Date.now().toString() + "-" + Math.floor(Math.random() * 10000).toString();
        const sale = { id, itens, metodo, nomeFiado: nomeFiado || null, data: new Date().toISOString() };
        await env.SALES_KV.put("sale:" + id, JSON.stringify(sale));
        return new Response(JSON.stringify(sale), {
            status: 201,
            headers: { "Content-Type": "application/json" }
        });
    } else {
        return new Response("Method not allowed", { status: 405 });
    }
}