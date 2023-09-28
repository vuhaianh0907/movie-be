import { GraphQLError } from 'graphql';
import prisma from '../handlers/prisma';

class CategoryService {
  public async getListCate() {
    const listCate = await prisma.category.findMany();

    return listCate;
  }

  public async getListYear() {
    const listYear = await prisma.year.findMany();

    return listYear;
  }

  public async createCategory(name: string, slug: string) {
    const category = await prisma.category.create({
      data: { name: name, slug: slug },
    });
    return category;
  }

  public async createYear(year: number, slug: string) {
    const newYear = await prisma.year.create({
      data: { year: year, slug: slug },
    });
    return newYear;
  }
}

export default new CategoryService();
