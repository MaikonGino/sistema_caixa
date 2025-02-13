// functions/api/reports/excel.js

import * as XLSX from 'xlsx';

export async function onRequest(context) {
    const { env } = context;
    // Lista todas as vendas
    const list = await env.SALES_KV.list({ prefix: "sale:" });
    const sales = [];
    for (const key of list.keys) {
        const sale = await env.SALES_KV.get(key.name, "json");
        if (sale) sales.push(sale);
    }
    // Prepara os dados para a planilha
    const data = sales.map(sale => {
        const total = sale.itens.reduce((acc, item) => acc + (item.preco * item.quantidade), 0);
        return { id: sale.id, total, metodo: sale.metodo, data: sale.data };
    });
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Vendas");
    const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    return new Response(wbout, {
        headers: {
            "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            "Content-Disposition": "attachment; filename=relatorio.xlsx"
        }
    });
}