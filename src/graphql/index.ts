import { GraphQLFileLoader } from '@graphql-tools/graphql-file-loader';
import { loadSchemaSync } from '@graphql-tools/load';
import { YogaInitialContext, createSchema, createYoga } from 'graphql-yoga';
import jwt from 'jsonwebtoken';
import { useJWT } from '@graphql-yoga/plugin-jwt';
import { useCookies } from '@whatwg-node/server-plugin-cookies';
import { useGraphQLSSE } from '@graphql-yoga/plugin-graphql-sse';
import { useDeferStream } from '@graphql-yoga/plugin-defer-stream';
import permissions from '../middleware/graphqlMiddleware';
import { applyMiddleware } from 'graphql-middleware';
import crypto from 'crypto';
import userServices from '../services/user.services';
import { access } from 'fs';
import EmailServices from '../services/email.services';
import otpServices from '../services/otp.services';
import categoryServices from '../services/category.services';
import prisma from '../handlers/prisma';
import moviesServices from '../services/movies.services';

const signingKey = 'rvGx7efcLKUVL6uK8MgR7X6cpFLUP9vg';
const issuer = 'localhost';
const typeDefs = loadSchemaSync('./**/*/*.graphql', {
  loaders: [new GraphQLFileLoader()],
});

interface GeneratePairToken {
  email: string;
  password: string;
}
const schema = createSchema({
  typeDefs: typeDefs,
  resolvers: {
    Query: {
      hello: async (root, args, ctx: YogaInitialContext) => {
        const cookies1 = await ctx.request.cookieStore?.get('refresh_token');

        const headerValue = ctx.request.headers.get('Authorization');

        console.log('day la header ' + headerValue);

        console.log('cookies' + cookies1?.value);

        // return cookies1?.value;
        return '123';
      },

      loginWithGoogle: async (root, args, ctx: YogaInitialContext) => {
        const { idToken } = args;

        let result = {};

        try {
          const userVerify = await userServices.verifyGoogle(idToken);

          if (userVerify && typeof userVerify.email === 'string') {
            const userHashed = hashId(userVerify.email, '1');
            const userInput = {
              name: userVerify.name ?? `${userVerify.email}`,
              email: userVerify.email,
              id: userHashed.id,
              avatar: userVerify.avatar ?? `${userVerify.avatar}`,
            };

            const user = await userServices.LoginWithGoole(userInput);

            const accessToken = jwt.sign(user, signingKey, {
              subject: userHashed.id,
              expiresIn: 60 * 60 * 1000,
              algorithm: 'HS256',
            });
            const refreshToken = jwt.sign(user, signingKey, {
              subject: userHashed.id,
              expiresIn: 60 * 60 * 24 * 7 * 1000,
              algorithm: 'HS256',
            });

            console.log('day la user ' + user.name);

            result = { ...user, password: undefined, access_token: accessToken };

            ctx.request.cookieStore?.set({
              name: 'refresh_token',
              sameSite: 'strict',
              secure: true,
              domain: issuer,
              expires: new Date(Date.now() + 1000 * 60 * 60 * 24),
              value: refreshToken,
              httpOnly: true,
            });
          } else {
            throw new Error();
          }
        } catch (error) {
          throw new Error('Không thể đăng nhập');
        }

        console.log(idToken);
        return result;
      },

      login: async (_, args, ctx: YogaInitialContext) => {
        const { email, password } = args;

        const userHashed = hashId(email, password);

        const user = await userServices.login(email, userHashed.hashed);

        const accessToken = jwt.sign(user, signingKey, {
          subject: user.id,
          expiresIn: 60 * 60 * 1000,
          algorithm: 'HS256',
        });
        const refreshToken = jwt.sign(user, signingKey, {
          subject: user.id,
          expiresIn: 60 * 60 * 24 * 7 * 1000,
          algorithm: 'HS256',
        });

        console.log('access: ' + accessToken + ' refresh : ' + refreshToken);
        try {
          ctx.request.cookieStore?.set({
            name: 'refresh_token',
            sameSite: 'strict',
            secure: true,
            domain: issuer,
            expires: new Date(Date.now() + 1000 * 60 * 60 * 24),
            value: refreshToken,
            httpOnly: true,
          });
        } catch (error) {
          console.error('Error setting refresh_token cookie:', error);
        }

        const userWithoutPassword = { ...user, password: undefined, access_token: accessToken };

        console.log(userWithoutPassword);

        return userWithoutPassword;
      },

      categories: async (_, args, ctx: YogaInitialContext) => {
        const listCate = await categoryServices.getListCate();

        return listCate;
      },

      newTrailers: async (_, args, ctx: YogaInitialContext) => {
        console.log('call roi');

        const listTrailer = await moviesServices.getTrailersMovie();

        return listTrailer;
      },
      year: async (_, args, ctx: YogaInitialContext) => {
        const listYear = await categoryServices.getListYear();

        return listYear;
      },
      background: async (_, args, ctx: YogaInitialContext) => {
        const background = await moviesServices.getBackground();

        return background;
      },
      getMoviesByCategory: async (_, args, ctx: YogaInitialContext) => {
        const { category_slug } = args;

        const movies = await moviesServices.getMovieByCategory(category_slug);

        return movies;
      },
    },
    Mutation: {
      sendOtp: async (_, args) => {
        const { email } = args;

        const codeGenerate = generateRandomCode(6);

        const code = otpServices.sendOtp(email, codeGenerate);

        return { code: code };
      },

      logout: async (_, args, ctx: YogaInitialContext) => {
        await ctx.request.cookieStore?.delete('refresh_token');
        return 'Đã đăng xuất thành công';
      },

      signup: async (_, args, ctx: YogaInitialContext) => {
        const { input } = args;

        const userHashed = hashId(input.email, input.password);

        const userInput = {
          id: userHashed.id,
          name: input.name,
          email: input.email,
          password: userHashed.hashed,
          avatar: input.avatar
            ? input.avatar
            : 'https://i.pinimg.com/1200x/32/6f/7c/326f7cd6429cf76c88bd4d61c20ac716.jpg',
          otp: input.otp,
        };

        const user = await userServices.createUser(userInput);

        const accessToken = jwt.sign(user, signingKey, {
          subject: user.id,
          expiresIn: 60 * 60 * 1000,
          algorithm: 'HS256',
        });
        const refreshToken = jwt.sign(user, signingKey, {
          subject: user.id,
          expiresIn: 60 * 60 * 24 * 7 * 1000,
          algorithm: 'HS256',
        });

        console.log('access: ' + accessToken + ' refresh : ' + refreshToken);
        try {
          ctx.request.cookieStore?.set({
            name: 'refresh_token',
            sameSite: 'strict',
            secure: true,
            domain: issuer,
            expires: new Date(Date.now() + 1000 * 60 * 60 * 24),
            value: refreshToken,
            httpOnly: true,
          });
        } catch (error) {
          console.error('Error setting refresh_token cookie:', error);
        }

        const userWithoutPassword = { ...user, password: undefined, access_token: accessToken };

        console.log(userWithoutPassword);

        return userWithoutPassword;
      },

      createCategory: (_, args, ctx: YogaInitialContext) => {
        const { name, slug } = args;
        return categoryServices.createCategory(name, slug);
      },

      createYear: (_, args, ctx: YogaInitialContext) => {
        const { year, slug } = args;
        return categoryServices.createYear(year, slug);
      },

      createMovie: (_, args, ctx: YogaInitialContext) => {
        const { input } = args;
        return moviesServices.createMovie(input);
      },
    },
  },
});

function generateRandomCode(length: number) {
  const characters = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let code = '';
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    code += characters.charAt(randomIndex);
  }
  return code;
}

function hashId(email: string, password: string) {
  // const salt = crypto.randomBytes(16).toString('hex'); // tạo một salt ngẫu nhiên
  const salt = '0123456789abcdef';

  const hashed = crypto
    .createHash('sha256')
    .update(password + salt)
    .digest('hex');
  const id = crypto
    .createHash('sha256')
    .update(email + salt)
    .digest('hex');

  return { id, hashed };
}

// const schemaWithMiddleware = applyMiddleware(schema, permissions);

const yoga = createYoga({
  schema: schema,
  plugins: [
    // useDeferStream(),
    useCookies(),
    // useJWT({
    //   issuer: issuer,
    //   signingKey: signingKey,
    //   algorithms: ['HS256'],
    // }),
    // useGraphQLSSE({
    //   endpoint: '/api/graphql/stream',
    //   onComplete: () => {
    //     console.log('connect complete');
    //   },
    // }),
  ],
});

export default yoga;

// use JWT của graphql tự động verify Token ở Headers
// Muốn xét được cookie thì nhớ set credentials cho fe
