import express from "express";
import controllers from "./controllers";

// run update service

const Routes = (router: express.Router) => {
	router.post("/newOrder", controllers.newOrder);
	router.get("/customers", controllers.getAllCustomers);
	router.get("/tier", controllers.getTier);
	router.get("/orders", controllers.getOrders);
};

export default Routes;