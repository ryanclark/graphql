"use strict";
var graphql_1 = require("graphql");
exports.SubscriptionType = new graphql_1.GraphQLObjectType({
    name: 'SubscriptionResponse',
    fields: {
        token: {
            type: graphql_1.GraphQLString
        }
    }
});
