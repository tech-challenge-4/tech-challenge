import { FastifyReply, FastifyRequest } from 'fastify';
import { StatusCodes } from 'http-status-codes';

import logger from '@common/logger';
import { handleError } from '@driver/errorHandler';
import { Multipart, MultipartFile } from '@fastify/multipart';
import {
	CreateProductParams,
	GetProducByIdParams,
	UpdateProductParams,
} from '@ports/input/products';
import { UpdateProductResponse } from '@ports/output/products';
import { Product } from '@prisma/client';
import { ProductService } from '@services/productService';

// Função auxiliar para definir os campos do objeto sem mutação direta
function setField<T, K extends keyof T>(obj: T, key: K, value: T[K]): T {
	return {
		...obj,
		[key]: key === 'value' ? Number(value) : value,
	};
}

export class ProductController {
	private readonly productService;

	constructor(productService: ProductService) {
		this.productService = productService;
	}

	async getProducts(req: FastifyRequest, reply: FastifyReply) {
		try {
			if (req.query && Object.keys(req.query).length > 0) {
				logger.info(
					`Listing products with parameters: ${JSON.stringify(req.query)}`,
				);
			} else {
				logger.info('Listing products');
			}
			reply
				.code(StatusCodes.OK)
				.send(await this.productService.getProducts(req.query));
		} catch (error) {
			const errorMessage = 'Unexpected error when listing for products';
			logger.error(`${errorMessage}: ${error}`);
			handleError(req, reply, error);
		}
	}

	async deleteProducts(
		req: FastifyRequest<{ Params: GetProducByIdParams }>,
		reply: FastifyReply,
	): Promise<void> {
		const { id } = req.params;
		try {
			logger.info('Deleting product');
			await this.productService.deleteProducts({ id });
			reply
				.code(StatusCodes.OK)
				.send({ message: 'Product successfully deleted' });
		} catch (error) {
			const errorMessage = 'Unexpected when deleting for product';
			logger.error(`${errorMessage}: ${error}`);
			handleError(req, reply, error);
		}
	}

	async createProducts(
		req: FastifyRequest<{ Body: CreateProductParams; Files: Multipart[] }>,
		reply: FastifyReply,
	) {
		try {
			const parts = req.parts() as unknown as Multipart[];

			let data: CreateProductParams = {
				name: '',
				value: 0,
				description: '',
				categoryId: '',
				images: [],
			};

			const imageFiles: MultipartFile[] = [];

			for await (const part of parts) {
				if (part.type === 'file') {
					imageFiles.push(part);
				} else {
					data = setField(
						data,
						part.fieldname as keyof CreateProductParams,
						part.value as any,
					);
				}
			}

			data.images = imageFiles;

			logger.info(`Creating product: ${JSON.stringify(data.name)}`);

			const createdProduct = await this.productService.createProducts(data);
			reply.code(StatusCodes.CREATED).send(createdProduct);
		} catch (error) {
			const errorMessage = 'Unexpected when creating for product';
			logger.error(`${errorMessage}: ${error}`);
			handleError(req, reply, error);
		}
	}

	async updateProducts(
		req: FastifyRequest<{
			Params: Pick<Product, 'id'>;
			Body: UpdateProductParams[];
			Files: Multipart[];
		}>,
		reply: FastifyReply,
	) {
		console.log('updating product');
		try {
			logger.info('Updating product', req?.params?.id);
			const parts = req.parts() as unknown as Multipart[];
			let data: UpdateProductParams = {
				id: req?.params?.id,
			};

			const imageFiles: MultipartFile[] = [];

			for await (const part of parts) {
				if (part.type === 'file') {
					imageFiles.push(part);
				} else {
					data = setField(
						data,
						part.fieldname as keyof UpdateProductParams,
						part.value as any,
					);
				}
			}

			data.images = imageFiles;

			const product: UpdateProductResponse =
				await this.productService.updateProducts(data);
			reply.code(StatusCodes.OK).send(product);
		} catch (error) {
			logger.error(`Unexpected error when trying to update product: ${error}`);
			handleError(req, reply, error);
		}
	}
}
