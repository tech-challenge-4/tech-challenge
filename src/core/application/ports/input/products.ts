import { MultipartFile } from '@fastify/multipart';

export type GetProducByIdParams = {
	id: string;
};

export type UpdateProductParams = {
	id: string;
	name?: string;
	value?: number;
	description?: string;
	categoryId?: string;
	images?: MultipartFile[];
};

export type CreateProductParams = {
	name: string;
	value: number;
	description: string;
	categoryId: string;
	images?: MultipartFile[];
};
