export const createPayer = async (
  request: FastifyRequest<{ Body: CreatePayerBody }>,
  reply: FastifyReply
) => {
  try {
    const validatedData = createPayerSchema.parse(request.body);

    const payer = await prisma.payer.create({
      data: {
        walletAddress: validatedData.walletAddress,
        name: validatedData.name,
        email: validatedData.email ?? null,
      }
    });

    return reply.code(201).send(payer);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return reply.code(400).send({
        statusCode: 400,
        error: "Bad Request",
        message: "Validation failed",
        details: error.issues,
      });
    }

    request.log.error(error);
    return reply.code(500).send({
      statusCode: 500,
      error: "Internal Server Error",
      message: "An unexpected error occurred",
    });
  }
};

