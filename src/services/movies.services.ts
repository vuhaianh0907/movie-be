import { GraphQLError } from 'graphql';
import prisma from '../handlers/prisma';
import emailServices from './email.services';

export interface MovieInput {
  title: string;
  seasons: number;
  release?: Date;
  forBackGround: boolean;
  imageBackground: string;
  forNews: boolean;
  category_slug: string;
  description: string;
}

class MoviesService {
  public async createMovie(input: MovieInput) {
    const movie = await prisma.movies.create({
      data: {
        title: input.title,
        seasons: input.seasons,
        imageBackground: input.imageBackground,
        forBackGround: input.forBackGround,
        forNews: input.forNews,
        description: input.description,
        category: { connect: { slug: input.category_slug } },
      },
    });
    return movie;
  }

  public async getBackground() {
    const movie = await prisma.movies.findFirst({
      where: {
        forBackGround: true,
      },
      include: {
        category: true,
      },
    });

    console.log(movie);
    return movie;
  }

  public async getTrailersMovie() {
    const movies = await prisma.movies.findMany({
      where: {
        forNews: true,
      },
    });
    return movies;
  }

  public async getMovieByCategory(category_slug: string) {
    const movies = await prisma.movies.findMany({
      where: {
        category: {
          slug: category_slug,
        },
      },
      take: 4,
    });
    return movies;
  }
}

export default new MoviesService();
