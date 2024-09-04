import { Response, Request } from "express";
import service from "../services";
import { checkIfNumber, checkIfString, getThisYear } from "../utils";
import cron from "node-cron";

export default {
	newOrder: async (req: Request, res: Response) => {
		try {
			const { orderId, customerId, totalInCents, date, customerName } = req.body;

			// validation
			if (!checkIfString(orderId)) throw new Error("orderId invalid");
			if (!checkIfString(date)) throw new Error("date invalid");
			if (!checkIfString(customerName)) throw new Error("date invalid");
			if (!checkIfNumber(customerId)) throw new Error("customerId invalid");
			if (!checkIfNumber(totalInCents)) throw new Error("totalInCents invalid");

			console.log(orderId, customerId, totalInCents, date, customerName);
			await service.customerService.newCustomer({
				customerId: customerId,
				name: customerName
			})

			const order: Order = {
				orderId: orderId,
				customerId: customerId,
				totalInCents: totalInCents,
				date: date,
				year: getThisYear(date)
			}
			await service.orderService.saveOrder(order);
			await service.customerService.addSpent(order);
			console.log("order added");
			return res.status(200).json({ status: "success" });
		} catch (err) {
			console.log("newOrder", err);
			return res.status(400).send({ status: "internal error" });
		}
	},
	getTier: async (req: Request, res: Response) => {
		try {
			const { customerId } = req.body;
			if (!checkIfNumber(customerId)) throw new Error("customerId invalid");
			const tierInfo: CustomerInfo = await service.customerService.getCustomerInfo(customerId);
			return res.status(200).json(tierInfo);
		} catch (err) {
			console.log("getTier", err);
			return res.status(400).send({ status: "internal error" });
		}
	},
	getAllCustomers: async (req: Request, res: Response) => {
		try {
			const tierInfos: CustomerInfo[] = await service.customerService.getAllCustomers();
			return res.status(200).json(tierInfos);
		} catch (err) {
			console.log("getAllCustomers", err);
			return res.status(400).send({ status: "internal error" });
		}
	},
	getOrders: async (req: Request, res: Response) => {
		try {
			const { customerId, page_number, page_size } = req.body;
			if (!checkIfNumber(customerId)) throw new Error("customerId invalid");
			if (!checkIfNumber(page_number)) throw new Error("page_number invalid");
			if (!checkIfNumber(page_size)) throw new Error("page_size invalid");

			if (page_number < 1 || page_size < 0) throw new Error("Invalid pagination parameter")
			const thisYear = getThisYear()
			const lastyear = thisYear - 1;
			const lastyearOrders: Order[] = await service.orderService.orderOfYear(customerId, lastyear);
			const thisyearOrders: Order[] = await service.orderService.orderOfYear(customerId, thisYear);

			var orders = [...lastyearOrders, ...thisyearOrders];
			orders = orders.map((order: Order) => {
				return {
					orderId: order.orderId,
					customerId: order.customerId,
					totalInCents: order.totalInCents,
					date: order.date,
					year: order.year
				}
			})
			const startId = (page_number - 1) * page_size;
			const pageOrders = orders.slice(startId, startId + page_size);
			return res.status(200).json(pageOrders);
		} catch (err) {
			console.log("getOrders", err);
			return res.status(400).send({ status: "internal error" });
		}
	}
}