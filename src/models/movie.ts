import { Movie, MovieAttributes, Rating } from "../db";
import { Sequelize, FindAndCountOptions } from "sequelize";

export interface MovieWithRating extends MovieAttributes {
  rating: number | null;
}

export const MovieModel = {
  get model(): typeof Movie {
    return Movie;
  },

  async findById(id: number): Promise<Movie | null> {
    return this.model.findByPk(id);
  },

  async findAll(pagination?: { page: number; limit: number }): Promise<{ rows: Movie[]; count: number }> {
    const options: FindAndCountOptions = {};

    if (pagination) {
      options.limit = pagination.limit;
      options.offset = (pagination.page - 1) * pagination.limit;
    }

    const { count, rows } = await this.model.findAndCountAll(options);
    return { count,rows };
  },


  //Get a movie by id with its average rating calculated
  async findByIdWithRating(id: number): Promise<MovieWithRating | null> {
    const movie = await this.model.findByPk(id, {
      include: [ //join with ratings to calculate the average rating
        {
          model: Rating,
          as: "ratings",
          attributes: [], //we don't need the individual ratings, just the average
        },
      ],
      attributes: { //we add an extra attribute "rating" which is the average of the ratings.rating column
        include: [
          [
            Sequelize.fn("AVG", Sequelize.col("ratings.rating")), "rating", //alias for the average rating
          ],
        ],
      },
      group: ["Movie.id"],
    });

    if (!movie) return null;

    return movie.get({ plain: true }) as MovieWithRating; //convert the Sequelize model instance to a plain object and cast it to MovieWithRating
  },

  //Get all movies with their average rating calculated, with pagination
  async findAllWithRating(pagination?: {
    page: number;
    limit: number;
  }): Promise<{ rows: MovieWithRating[]; count: number }> {
      const options: FindAndCountOptions = {
        include: [
          {
            model: Rating,
            as: "ratings",
            attributes: [],
          },
        ],
        attributes: {
          include: [
            [Sequelize.fn("AVG", Sequelize.col("ratings.rating")), "rating"]
          ],
        },
        group: ["Movie.id"],
        subQuery: false,
      };


    if (pagination) {
      options.limit = pagination.limit;
      options.offset = (pagination.page - 1) * pagination.limit;;
    }

    const { count: countResult, rows } = await this.model.findAndCountAll(options);
    
    //findAndCountAll with group returns count as an array of objects with the count for each group, 
    // so we need to sum them up to get the total count
    const count = Array.isArray(countResult) ? countResult.length : countResult;

    return {
      rows: rows.map((m) => m.get({ plain: true })) as MovieWithRating[],
      count,
    };
  },
};

