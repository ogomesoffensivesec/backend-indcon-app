import { GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import fastify from "fastify";
import { r2 } from "../lib/cloudflare";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { z } from "zod";
import { randomUUID } from "crypto";
import { PrismaClient } from '@prisma/client'
import { fastifyCors } from '@fastify/cors'

const app = fastify()

app.register(fastifyCors, {
  origin: 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
});
const prisma = new PrismaClient()


app.get('/', () => {
  return 'Hello World'
})



app.post('/uploads', async (req) => {
  //Validação dos dados de acordo com seus tipos. Usanog regex para validar tipos de conteúdo de arquivos de video e imagens
  const uploadBodySchema = z.object({
    name: z.string().min(1),
    contentType: z.string().regex(/\w+\/[-+.\w]+/)
  })
  const { name, contentType } = uploadBodySchema.parse(req.body) //Valida o corpo da requisição e retorna o nome e tipo de conteúdo


  //Estratégia para criar um uuid random e concatenar (adicionar) ao nome do arquivo, separando-os com '-'
  const fileKey = randomUUID().concat('-').concat(name)

  const signedUrl = await getSignedUrl(r2,
    new PutObjectCommand({
      Bucket: 'indcon-app-dev',
      Key: fileKey,
      ContentType: contentType
    }),
    {
      expiresIn: 600
    }
  )

  const file = await prisma.file.create({
    data: {
      name,
      contentType,
      key: fileKey
    }
  })
  return { signedUrl, fileId: file.id }
})


app.get('/uploads/:id', async (req) => {
  const getFileParamsSchema = z.object({
    id: z.string().cuid(),
  })
  const { id } = getFileParamsSchema.parse(req.params)

  const file = await prisma.file.findFirstOrThrow({
    where: { id },
  })

  const signedUrl = await getSignedUrl(r2,
    new GetObjectCommand({
      Bucket: 'indcon-app-dev',
      Key: file.key,
    }),
    {
      expiresIn: 600
    }
  )

  return { signedUrl }
})



app.listen({
  port: 3333,
  host: '0.0.0.0'
}).then(() => {
  console.log('🔥 HTTP server running')
})