import dataAccess from "../data-access";

export const orderService = {
    saveOrder: async (order: Order) => {
        await dataAccess.orderdB.create(order);
    },
    orderOfYear: async (customerId: number, year: number) => {
        return await dataAccess.orderdB.find({ customerId: customerId, year: year })
    }
}

