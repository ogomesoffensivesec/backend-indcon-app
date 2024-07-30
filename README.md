# indcon-app

Stack: Node.js, Fastify, Prisma ORM, Cloudflare R2

## Requisitos Funcionais (RFs):

- [ ] Deve ser possível realizar novos uploads;
- [ ] Deve ser possível realizar downloads de todos arquivos
- [ ] Deve ser possível visualizar todos os uploads

## Requisitos de Negócio (RNs):

- [ ] Somente os usuários com permissão de upload de arquivos poderão realizar uploads
- [ ] Somente usuários autenticados poderão realizar visualizar os arquivos

## Requisitos não funcionais (RNFs):

- [ ] Utilização do Cloudflare R2 para upload de arquivos;
- [ ] O upload deve ser feito diretamente pelo front-end utilizando Presigned URLs¹;
- [ ] Os links para compartilhamento devem ser assinados evitando acesso público!

## Trechos de código

# Conexão com Cloudflare (AWS SDK)

```typescript
import {S3Client} from '@aws-sdk/client-s3'
  export const r2 = new S3Client({
    region: 'auto',
    endpoint: env.CLOUDFLARE_ENDPOINT,
    credentials: {
      accessKeyId: env.CLOUDFLARE_ACCESS_KEY,
      secretAccessKey: env.CLOUDFLARE_SECRET_KEY
    }
  })
```

# Upload no Cloudflare

```typescript
const signedUrl = await getSignedUrl(r2, 
  new PutObjectCommand({
    Bucket: 'bucket-name',
    Key: 'file.mp4',
    ContentType: 'video/mp4'
  }), 
  {
    expiresIn: 600
  }
)
```

# Upload no Front-end

```typescript
await axios.put(uploadURL, file, {
    headers: {
      'Content-Type': file.type
    }
  })
```
