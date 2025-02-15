import {
	CreatePaymentOrderParams,
	GetPaymentOrderByIdParams,
	GetPaymentOrderByOrderIdParams,
} from '@application/ports/input/paymentOrders';
import { PaymentOrderRepository } from '@application/ports/repository/paymentOrderRepository';
import { PaymentOrderStatusEnum } from '@domain/enums/paymentOrderEnum';
import { prisma } from '@driven/infra/lib/prisma';
import { PaymentOrder } from '@models/paymentOrder';

export class PaymentOrderRepositoryImpl implements PaymentOrderRepository {
	async getPaymentOrders(): Promise<PaymentOrder[]> {
		const paymentOrders = await prisma.paymentOrder.findMany({
			select: {
				id: true,
				orderId: true,
				status: true,
				value: true,
				paidAt: true,
				createdAt: true,
				updatedAt: true,
			},
		});

		return paymentOrders.map((paymentOrder) => ({
			...paymentOrder,
			value: parseFloat(paymentOrder.value.toString()),
		}));
	}

	async getPaymentOrderById(
		getPaymentOrderByIdParams: GetPaymentOrderByIdParams
	): Promise<PaymentOrder | null> {
		const paymentOrder = await prisma.paymentOrder.findUnique({
			where: { id: getPaymentOrderByIdParams.id },
			select: {
				id: true,
				orderId: true,
				value: true,
				paidAt: true,
				status: true,
				createdAt: true,
				updatedAt: true,
			},
		});

		if (paymentOrder) {
			return {
				...paymentOrder,
				value: parseFloat(paymentOrder.value.toString()),
			};
		}

		return paymentOrder;
	}

	async getPaymentOrderByOrderId(
		getPaymentOrderByOrderIdParams: GetPaymentOrderByOrderIdParams
	): Promise<PaymentOrder | null> {
		const { orderId } = getPaymentOrderByOrderIdParams;

		const paymentOrder = await prisma.paymentOrder.findUnique({
			where: { orderId },
			select: {
				id: true,
				orderId: true,
				value: true,
				paidAt: true,
				status: true,
				createdAt: true,
				updatedAt: true,
			},
		});

		if (paymentOrder) {
			return {
				...paymentOrder,
				value: parseFloat(paymentOrder.value.toString()),
			};
		}

		return paymentOrder;
	}

	async createPaymentOrder(
		createPaymentOrderParams: CreatePaymentOrderParams
	): Promise<PaymentOrder> {
		const createdPaymentOrder = await prisma.paymentOrder.create({
			data: {
				orderId: createPaymentOrderParams.orderId,
				status: PaymentOrderStatusEnum.approved,
				value: createPaymentOrderParams.value,
				paidAt: new Date(),
			},
		});

		return {
			...createdPaymentOrder,
			value: parseFloat(createdPaymentOrder.value.toString()),
		};
	}
}
