"use strict";
var graphql_1 = require("graphql");
var login_1 = require("./queries/login");
var logout_1 = require("./queries/logout");
var me_1 = require("./queries/me");
var subscription_1 = require("./subscription/subscription");
var user_1 = require("./queries/user");
var user_2 = require("./subscription/user");
exports.schema = new graphql_1.GraphQLSchema({
    query: new graphql_1.GraphQLObjectType({
        name: 'Query',
        fields: {
            login: login_1.LoginQuery,
            logout: logout_1.LogoutQuery,
            me: me_1.MeQuery,
            user: user_1.UserQuery,
            users: user_1.UsersQuery
        }
    }),
    subscription: new graphql_1.GraphQLObjectType({
        name: 'Subscription',
        fields: {
            subscription: subscription_1.Subscription,
            users: user_2.UsersSubscription
        }
    })
});
