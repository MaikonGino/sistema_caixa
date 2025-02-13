// functions/api/products.js

export async function onRequest(context) {
    const { request, env } = context;
    const url = new URL(request.url);
    const method = request.method;
  
    if (method === "GET") {
      // Lista todos os produtos
      const list = await env.PRODUCTS_KV.list({ prefix: "product:" });
      const products = [];
      for (const key of list.keys) {
        const value = await env.PRODUCTS_KV.get(key.name, "json");
        products.push(value);
      }
      return new Response(JSON.stringify(products), {
        status: 200,
        headers: { "Content-Type": "application/json" }
      });
    } else if (method === "POST") {
      // Cria um novo produto com nome, preco e foto (opcional)
      const body = await request.json();
      const { nome, preco, foto } = body;
      if (!nome || typeof preco !== "number") {
        return new Response(JSON.stringify({ error: "nome and preco required" }), {
          status: 400,
          headers: { "Content-Type": "application/json" }
        });
      }
      const id = Date.now().toString() + "-" + Math.floor(Math.random() * 10000).toString();
      const product = { id, nome, preco, foto: foto || null };
      await env.PRODUCTS_KV.put("product:" + id, JSON.stringify(product));
      return new Response(JSON.stringify(product), {
        status: 201,
        headers: { "Content-Type": "application/json" }
      });
    } else if (method === "PUT") {
      // Atualiza um produto; espera o parâmetro "id" na query string
      const id = url.searchParams.get("id");
      if (!id) {
        return new Response(JSON.stringify({ error: "id is required in query parameter" }), {
          status: 400,
          headers: { "Content-Type": "application/json" }
        });
      }
      const body = await request.json();
      const { nome, preco, foto } = body;
      if (!nome || typeof preco !== "number") {
        return new Response(JSON.stringify({ error: "nome and preco required" }), {
          status: 400,
          headers: { "Content-Type": "application/json" }
        });
      }
      const product = { id, nome, preco, foto: foto || null };
      await env.PRODUCTS_KV.put("product:" + id, JSON.stringify(product));
      return new Response(JSON.stringify(product), {
        status: 200,
        headers: { "Content-Type": "application/json" }
      });
    } else if (method === "DELETE") {
      // Remove um produto; espera o parâmetro "id" na query string
      const id = url.searchParams.get("id");
      if (!id) {
        return new Response(JSON.stringify({ error: "id is required in query parameter" }), {
          status: 400,
          headers: { "Content-Type": "application/json" }
        });
      }
      await env.PRODUCTS_KV.delete("product:" + id);
      return new Response(JSON.stringify({ message: "Deleted" }), {
        status: 200,
        headers: { "Content-Type": "application/json" }
      });
    } else {
      return new Response("Method not allowed", { status: 405 });
    }
  }
  