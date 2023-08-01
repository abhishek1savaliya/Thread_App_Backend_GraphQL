import express from 'express'
import { expressMiddleware } from '@apollo/server/express4';
import createApolloGraphqlServer from './graphql';
import UserService from './services/user';

async function init() {
  const app = express()
  const PORT = Number(process.env.PORT) || 8000;

  app.use(express.json())

  app.get('/', (req, res) => {
    res.json({ message: 'Server is up and running' })
  })

  app.use('/graphql', expressMiddleware(await createApolloGraphqlServer(), {
    context: async ({ req }) => {
      const Token = req.headers['token'];
      try {
        const user = UserService.decodeJWTToken(Token as string);
        return { user };
      } catch (err) {
        return { error: err as string };
      }
    },
  }
  ));

  app.listen(PORT, () => {
    console.log(`SERVER IS RUNNING AT ${PORT}`)
  })
}

init();