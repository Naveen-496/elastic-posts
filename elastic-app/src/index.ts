import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { elasticClient } from "./elastic";

const app = new Hono();

app.get("/", (c) => {
  return c.text("Hello Hono!");
});

app.post("/posts", async (c) => {
  const post = await c.req.json();
  console.log(post);

  const saved = await elasticClient.index({
    index: "posts",
    document: {
      title: post.title,
      author: post.author,
      content: post.content,
    },
  });

  return c.json(saved);
});


app.patch("/posts/:id", async ( c) => {
   const id = c.req.param("id");
   const { title, content, author } = await c.req.json();
   const post = await elasticClient.update({
    index: "posts",
    id: id,
    doc: {
      title,
      content,
      author
    }
   });

   return c.json(post);
});

app.get("/posts", async (c) => {
  const result = await elasticClient.search({
    index: "posts",
    query: { match_all: {} },
  });

  return c.json(result.hits.hits);
});

app.get("/search", async (c) => {
  const search = c.req.query("search");
  console.log("Got Search: ", search);
  const result = await elasticClient.search({
    index: "posts",
    query: { fuzzy: { title: search } },
  });

  console.log("Search Result: ", result);
  return c.json(result);
});

app.delete("/posts/:id", async (c) => {
  const id = c.req.param("id");
  const deleted = await elasticClient.delete({
    id: id,
    index: "posts",
  });

  console.log("Deleted: ", deleted);

  return c.json({ message: "Success!" });
});

const port = 3000;
console.log(`Server is running on port ${port}`);

serve({
  fetch: app.fetch,
  port,
});
