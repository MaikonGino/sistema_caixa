// functions/api/fiados.js

export async function onRequest(context) {
    const { env } = context;
    const list = await env.SALES_KV.list({ prefix: "sale:" });
    const fiados = {};
    for (const key of list.keys) {
        const sale = await env.SALES_KV.get(key.name, "json");
        if (sale && sale.metodo === "fiado" && sale.nomeFiado) {
            const totalSale = sale.itens.reduce((acc, item) => acc + (item.preco * item.quantidade), 0);
            if (!fiados[sale.nomeFiado]) {
                fiados[sale.nomeFiado] = 0;
            }
            fiados[sale.nomeFiado] += totalSale;
        }
    }
    return new Response(JSON.stringify(fiados), {
        status: 200,
        headers: { "Content-Type": "application/json" }
    });
}