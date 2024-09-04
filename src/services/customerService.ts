import dataAccess from "../data-access";
import { getStartDateOfYear, getThisYear } from "../utils";
import { tierService } from "./tierService";

export const customerService = {
    /**
     * create new customer record if not exist
     * @param {Customer} _customer 
     */
    newCustomer: async (_customer: Customer) => {
        const customer = await dataAccess.customerdB.findOne({ customerId: _customer.customerId });
        if (!customer) await dataAccess.customerdB.create(_customer);
    },
    /**
     * add order spent amount to total spent of year
     * @param {Order} order 
     */
    addSpent: async (order: Order) => {
        var spentOfYear: any = await dataAccess.spentOfYeardb.findOne({
            customerId: order.customerId,
            year: order.year
        });
        if (!spentOfYear) {
            console.log("create new year record", order.customerId, order.year);
            spentOfYear = {
                customerId: order.customerId,
                year: order.year,
                totalSpent: order.totalInCents
            }
            await dataAccess.spentOfYeardb.create(spentOfYear);
            return;
        }

        // add spent amount to total amount per year
        spentOfYear.totalSpent += order.totalInCents;

        await dataAccess.spentOfYeardb.update(
            {
                customerId: order.customerId,
                year: order.year
            },
            spentOfYear
        )
    },
    /**
     * get customer info 
     * @param customerId 
     */
    getCustomerInfo: async (customerId: number): Promise<CustomerInfo> => {
        const customerData = await dataAccess.customerdB.findOne({ customerId: customerId })
        if (!customerData) throw new Error("Invalid customer Id");
        
        const thisYear = getThisYear()
        const lastyear = thisYear - 1;
        const nextyear = thisYear + 1;
        
        const thisYearSpentInCent = await customerService._getSpentOfyear(customerData,thisYear); 
        const lastYearSpentInCent = await customerService._getSpentOfyear(customerData,lastyear); 
        const { currentTier, nextTier, isMaxTier } = tierService.getTier(thisYearSpentInCent + lastYearSpentInCent);

        const nextYearTier = tierService.getTier(customerData.thisYearSpent);
        const isDowngraded = nextYearTier.currentTier.tierId != currentTier.tierId;

        return {
            customerId: customerData.customerId,
            customerName: customerData.name,
            tierName: currentTier.tierName,
            startDate: getStartDateOfYear(lastyear),
            totalSpent: thisYearSpentInCent + lastYearSpentInCent,
            amountForNextTier: isMaxTier ? 0 : nextTier.totalSpent - thisYearSpentInCent + lastYearSpentInCent,
            nextYearTier: !isDowngraded ? null : nextYearTier.currentTier.tierName,
            endDate: getStartDateOfYear(nextyear),
            amountForKeepTier: !isDowngraded ? 0 : currentTier.totalSpent - thisYearSpentInCent
        }
    },
    /**
     * get customer info list
     */
    getAllCustomers: async (): Promise<CustomerInfo[]> => {
        const customerDatas = await dataAccess.customerdB.find({})
        const tierInfos = [];
        for (let i = 0; i < customerDatas.length; i++) {
            tierInfos.push(await customerService.getCustomerInfo(customerDatas[i].customerId))
        }
        return tierInfos
    },
    /**
     * update totalSpent amount for tier calculation
     * @param customerData 
     */
    _getSpentOfyear: async (customerData: Customer, year: Number) => {
        var thisYearSpent: any = await dataAccess.spentOfYeardb.findOne({ customerId: customerData.customerId, year: year });
        if (!thisYearSpent) thisYearSpent = { totalSpent: 0 }
        return thisYearSpent.totalSpent
    },
}