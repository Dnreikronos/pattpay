import Fastify from "fastify";

const fastify = Fastify({});

const PORT = process.env.PORT || 3000;

fastify.get("/", (req, res) => {
  res.send("Hello World");
});

fastify.listen({ port: Number(PORT) }, (err, address) => {
  if (err) {
    fastify.log.error(err);
    process.exit(1);
  }

  console.log(`Server is running on http://localhost:${PORT}`);
  fastify.log.info(`Server is running on ${address}`);
});
