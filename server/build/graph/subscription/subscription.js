"use strict";
var subscription_1 = require("../types/subscription");
exports.Subscription = {
    type: subscription_1.SubscriptionType,
    args: {},
    resolve: function (root, params, _, info) {
        return {
            token: root.session_token
        };
    }
};
