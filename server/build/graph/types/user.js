"use strict";
var graphql_1 = require("graphql");
exports.UserType = new graphql_1.GraphQLObjectType({
    name: 'User',
    fields: {
        id: {
            type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLID)
        },
        email: {
            type: graphql_1.GraphQLString
        },
        first_name: {
            type: graphql_1.GraphQLString
        },
        last_name: {
            type: graphql_1.GraphQLString
        },
        password: {
            type: graphql_1.GraphQLString
        },
        subscription_token: {
            type: graphql_1.GraphQLString
        }
    }
});
