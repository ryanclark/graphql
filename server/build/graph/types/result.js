"use strict";
var graphql_1 = require("graphql");
exports.ResultType = new graphql_1.GraphQLObjectType({
    name: 'Result',
    fields: {
        result: {
            type: graphql_1.GraphQLBoolean
        }
    }
});
