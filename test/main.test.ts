//During the test the env variable is set to test
process.env.NODE_ENV = 'test';
process.env.DATABASE = 'mongodb://localhost:27017/tier-service-test';

import chai, { expect } from 'chai';
import chaiHttp from 'chai-http';
import mongoose from "mongoose";
import server from '../src/main';
import testOrders from "./testOrders.json";

chai.use(chaiHttp);

describe('order test', () => {
    it('new order test', async () => {
        for (let i = 0; i < testOrders.length; i++) {
            await chai.request(server)
                .post('/api/newOrder').send(testOrders[i]);
        }
    });

    it('get customers test', async () => {
        const expectedCustomers = [
            {
                customerId: 1,
                customerName: 'a',
                tierName: 'Bronze',
                startDate: 'Sun, 01 Jan 2023 00:00:00 GMT',
                totalSpent: 1000,
                amountForNextTier: 11000,
                nextYearTier: null,
                endDate: 'Wed, 01 Jan 2025 00:00:00 GMT',
                amountForKeepTier: 0
            },
            {
                customerId: 2,
                customerName: 'b',
                tierName: 'Bronze',
                startDate: 'Sun, 01 Jan 2023 00:00:00 GMT',
                totalSpent: 3000,
                amountForNextTier: 13000,
                nextYearTier: null,
                endDate: 'Wed, 01 Jan 2025 00:00:00 GMT',
                amountForKeepTier: 0
            },
            {
                customerId: 3,
                customerName: 'c',
                tierName: 'Gold',
                startDate: 'Sun, 01 Jan 2023 00:00:00 GMT',
                totalSpent: 100000,
                amountForNextTier: 0,
                nextYearTier: 'Bronze',
                endDate: 'Wed, 01 Jan 2025 00:00:00 GMT',
                amountForKeepTier: 50000
            }
        ]
        var res = await chai.request(server)
            .get('/api/customers').send();
        expect(res.body).to.deep.equal(expectedCustomers);
    });

    it('get tier test', async () => {
        const expectedTier = {
            customerId: 2,
            customerName: 'b',
            tierName: 'Bronze',
            startDate: 'Sun, 01 Jan 2023 00:00:00 GMT',
            totalSpent: 3000,
            amountForNextTier: 13000,
            nextYearTier: null,
            endDate: 'Wed, 01 Jan 2025 00:00:00 GMT',
            amountForKeepTier: 0
        }
        var res = await chai.request(server)
            .get('/api/tier').send({ customerId: 2 });
        expect(res.body).to.deep.equal(expectedTier);
    });

    it('get orders test', async () => {
        const expectedOrders = [
            {
                orderId: 't12',
                customerId: 2,
                totalInCents: 1000,
                date: 'Fri Nov 17 2023 08:41:51 GMT+0300',
                year: 2023
            },
            {
                orderId: 't13',
                customerId: 2,
                totalInCents: 2000,
                date: 'Fri Nov 17 2023 08:41:51 GMT+0300',
                year: 2023
            }
        ]
        var res = await chai.request(server)
            .get('/api/orders').send({
                customerId: 2,
                page_number: 1,
                page_size: 5
            });
        expect(res.body).to.deep.equal(expectedOrders);
    });

    it('remove database', async () => {
        /* Connect to the DB */
        await mongoose.connect(process.env.DATABASE || "");
        mongoose.connection.db.dropDatabase();
        console.log("db dropped")
    })
});