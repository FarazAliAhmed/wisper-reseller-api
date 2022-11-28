const router = require('express').Router();
const {celebrate, Joi} = require('celebrate');
const { fetchTransactions, filterTransactions } = require('../../../controllers/v2/transactions');

router.get(
    '/',
    celebrate({
        query: Joi.object().keys({
            page: Joi.string().pattern(/^[0-9]+$/).default('1'),
            limit: Joi.string().pattern(/^[0-9]+$/).default('50'),
            offset: Joi.string().pattern(/^[0-9]+$/).default('0'),
            sort: Joi.string()
        })
    }),
    fetchTransactions
);

router.post(
    '/filter',
    celebrate({
        query: Joi.object().keys({
            page: Joi.string().pattern(/^[0-9]+$/).default('1'),
            limit: Joi.string().pattern(/^[0-9]+$/).default('50'),
            offset: Joi.string().pattern(/^[0-9]+$/).default('0'),
            sort: Joi.string()
        }),
        body: Joi.object({
            date: Joi.array().length(2).items(Joi.date()),
            phone: Joi.string().max(14).pattern(/^[0-9]+$/),
            volume: Joi.number(),
            status: Joi.string().allow('failed', 'success'),
            provider: Joi.string().allow('mtn', 'airtel', 'glo', '9mobile'),
            reference: Joi.string()
        })
    }),
    filterTransactions
)

module.exports = {
    baseUrl: '/transactions',
    router
} 