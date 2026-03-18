"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentStatus = exports.ParcelStatus = void 0;
var ParcelStatus;
(function (ParcelStatus) {
    ParcelStatus["POSTED"] = "posted";
    ParcelStatus["ACCEPTED"] = "accepted";
    ParcelStatus["ONTHEWAY"] = "on_the_way";
    ParcelStatus["DELIVERED"] = "delivered";
})(ParcelStatus || (exports.ParcelStatus = ParcelStatus = {}));
var PaymentStatus;
(function (PaymentStatus) {
    PaymentStatus["UNPAID"] = "Unpaid";
    PaymentStatus["PAID"] = "Paid";
})(PaymentStatus || (exports.PaymentStatus = PaymentStatus = {}));
