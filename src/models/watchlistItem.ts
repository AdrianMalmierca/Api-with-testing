import { WatchlistItem, WatchlistItemAttributes, Movie } from "../db";
import { FindAndCountOptions } from "sequelize";

export interface WatchlistItemWithMovie extends WatchlistItemAttributes {
  title: string;
}

export const WatchlistItemModel = {
  get model(): typeof WatchlistItem {
    return WatchlistItem;
  },

  async findById(id: number): Promise<WatchlistItem | null> {
    return this.model.findByPk(id);
  },

  async findByIdAndUserId(
    id: number,
    userId: number
  ): Promise<WatchlistItem | null> {
    return this.model.findOne({
      where: { id, userId },
    });
  },

  async findByUserAndMovie(
    userId: number,
    movieId: number
  ): Promise<WatchlistItem | null> {
    return this.model.findOne({
      where: { userId, movieId },
    });
  },

  async findAllByUserId(
    userId: number,
    pagination?: { page: number; limit: number }
  ): Promise<{ rows: WatchlistItemWithMovie[]; count: number }> {
    const options: FindAndCountOptions = {
      where: { userId },
      include: [
        {
          model: Movie,
          as: "movie",
          attributes: ["title"],
        },
      ],
    };

    if (pagination) {
      options.limit = pagination.limit;
      options.offset = (pagination.page - 1) * pagination.limit;;
    }

    const { rows, count } = await this.model.findAndCountAll(options);

    //Transform the rows to include the movie title in the result, 
    // we need to cast the result to a plain object to access the included movie data
    const transformedRows = rows.map((item) => {
      const plain = item.get({ plain: true }) as WatchlistItem & {
        movie?: { title: string };
      };
      return {
        id: plain.id,
        userId: plain.userId,
        movieId: plain.movieId,
        watched: plain.watched,
        createdAt: plain.createdAt,
        title: plain.movie?.title || "",
      } as WatchlistItemWithMovie;
    });

    return { rows: transformedRows, count };
  },

  async create(item: WatchlistItemAttributes): Promise<WatchlistItem> {
    return this.model.create(item);
  },

  async update(
    id: number,
    data: Partial<WatchlistItemAttributes>
  ): Promise<[number]> {
    return this.model.update(data, {
      where: { id },
    });
  },

  async delete(id: number): Promise<number> {
    return this.model.destroy({
      where: { id },
    });
  },
};