// functions/api/reports/pdf.js

import { jsPDF } from 'jspdf';

export async function onRequest(context) {
    const { env } = context;
    // Lista todas as vendas
    const list = await env.SALES_KV.list({ prefix: "sale:" });
    const sales = [];
    for (const key of list.keys) {
        const sale = await env.SALES_KV.get(key.name, "json");
        if (sale) sales.push(sale);
    }
    // Cria o PDF
    const doc = new jsPDF();
    doc.setFontSize(12);
    doc.text("Relatório de Vendas", 10, 10);
    let y = 20;
    for (const sale of sales) {
        const total = sale.itens.reduce((acc, item) => acc + (item.preco * item.quantidade), 0);
        doc.text(`Venda #${sale.id} - R$${total.toFixed(2)} - ${sale.metodo.toUpperCase()}`, 10, y);
        y += 10;
        if (y > 280) { // Se ultrapassar a página, cria uma nova
            doc.addPage();
            y = 20;
        }
    }
    const pdfOutput = doc.output(); // Pode ser em base64 ou em formato binário
    return new Response(pdfOutput, {
        headers: { "Content-Type": "application/pdf" }
    });
}