import { uploadImage } from '@/app/functions/upload-image'
import { db } from '@/infra/db'
import { schema } from '@/infra/db/schemas'
import { isRight, unwrapEither } from '@/shared/either'
import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { z } from 'zod'

export const uploadImageRoute: FastifyPluginAsyncZod = async server => {
  server.post(
    '/uploads',
    {
      schema: {
        summary: 'Upload an image',
        consumes: ['multipart/form-data'],
        response: {
          201: z.null().describe('Image uploaded'),
          409: z
            .object({ message: z.string() })
            .describe('Upload alredy exists.'),
        },
      },
    },
    async (request, reply) => {
      const uploadFile = await request.file({
        limits: {
          fieldSize: 1024 * 1024 * 2, // 2mb
        },
      })

      // * Inserção no banco de dados com drizzle
      // await db.insert(schema.uploads).values({
      //   name: 'teste.jpg',
      //   remoteKey: 'teste.jpg',
      //   remoteURL: 'http://teste.com',
      // })

      if (!uploadFile) {
        return reply.status(400).send({ message: 'File is required' })
      }

      const result = await uploadImage({
        fileName: uploadFile.filename,
        contentType: uploadFile.mimetype,
        contentStream: uploadFile.file,
      })

      if (uploadFile.file.truncated) {
        return reply.status(400).send({ message: 'File size limit reached' })
      }

      if (isRight(result)) {
        console.log(unwrapEither(result))
        return reply.status(201).send()
      }

      const error = unwrapEither(result)

      switch (error.constructor.name) {
        case 'InvalidFileFormat':
          return reply.status(400).send({ message: error.message })
      }
    }
  )
}
