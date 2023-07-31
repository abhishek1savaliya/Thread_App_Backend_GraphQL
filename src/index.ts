import express from 'express'
import { ApolloServer } from '@apollo/server'
import { expressMiddleware } from '@apollo/server/express4';
import { prismaClient } from './lib/db';


async function init() {
    const app = express()
    const PORT = Number(process.env.PORT) || 8000;

    app.use(express.json())

    //Create GraphQL server

    const gqlServer = new ApolloServer({
        typeDefs: `
        type Query{
            hello : String
            say(name: String):String
        }
        type Mutation {
            createUser(firstName: String!, lastName: String!, email: String!, password: String!): Boolean
          }
        `, //Schema
        resolvers: {
            Query: {
                hello: () => `Hey there, I am graphql server`,
                say: (_, { name }: { name: string },) => `hey ${name} how are you ?`
            },
            Mutation: {
                createUser: async (
                  _,
                  { firstName, lastName, email, password }: { firstName: string; lastName: string; email: string; password: string }
                ) => {
                  // Update the PrismaClient.user.create() with proper fields
                  await prismaClient.user.create({
                    data: {
                      firstName,
                      lastName,
                      email,
                      password,
                      salt: 'random_salt',
                    },
                  });
                  return true;
                },
              },
        },
    })

    //Start thr GQL Server
    await gqlServer.start()


    app.get('/', (req, res) => {
        res.json({ message: 'Server is up and running' })
    })

    app.use('/graphql', expressMiddleware(gqlServer));

    app.listen(PORT, () => {
        console.log(`SERVER IS RUNNING AT ${PORT}`)
    })
}

init()