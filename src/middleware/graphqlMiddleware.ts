import { Request } from 'express';
import { rule, shield, and, or, not } from 'graphql-shield';
import { GraphQLError } from 'graphql';

const isAuthenticated = rule({ cache: 'contextual' })(async (parent, args, ctx, info) => {
  const headerValue = ctx.Request.headers['1'];

  console.log('day la header ' + headerValue);

  return false;
});

const isAdmin = rule({ cache: 'contextual' })(async (parent, args, ctx, info) => {
  return ctx.user.role === 'admin';
});

const isEditor = rule({ cache: 'contextual' })(async (parent, args, ctx, info) => {
  return ctx.user.role === 'editor';
});

const permissions = shield(
  {
    // Query: {
    //   hello: isAuthenticated,
    // },
    // Mutation: {
    //   addFruitToBasket: isAuthenticated,
    // },
    // Fruit: isAuthenticated,
    // Customer: isAdmin,
  },
  {
    allowExternalErrors: true,
    debug: true,
  }
);

export default permissions;
