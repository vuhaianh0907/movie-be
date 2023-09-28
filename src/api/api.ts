// import jwt from 'jsonwebtoken';
// import { YogaInitialContext, createYoga } from 'graphql-yoga';
// import schema from '../graphql/index';
// import { useJWT } from '@graphql-yoga/plugin-jwt';
// import { useCookies } from '@whatwg-node/server-plugin-cookies';
// import { useGraphQLSSE } from '@graphql-yoga/plugin-graphql-sse';
// import { useDeferStream } from '@graphql-yoga/plugin-defer-stream';

// const signingKey = 'rvGx7efcLKUVL6uK8MgR7X6cpFLUP9vg';
// const issuer = 'http://localhost:3000';

// const yoga = createYoga({
//   schema: schema,
//   plugins: [
//     useDeferStream(),
//     useCookies(),
//     useJWT({
//       issuer: issuer,
//       signingKey,
//     }),
//     useGraphQLSSE({
//       endpoint: '/api/graphql/stream',
//       onComplete: () => {
//         console.log('connect complete');
//       },
//     }),
//   ],
// });

// export default yoga;
