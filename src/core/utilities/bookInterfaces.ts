import { Response } from 'express';

interface IRatings {
    average: number;
    count: number;
    rating_1: number;
    rating_2: number;
    rating_3: number;
    rating_4: number;
    rating_5: number;
}

interface IUrlIcon {
    large: string;
    small: string;
}

interface IBook {
    isbn13: number;
    authors: string;
    publication: number;
    original_title: string;
    title: string;
    ratings: IRatings;
    icons: IUrlIcon;
}

const format = (resultRow) => {
    const out: IBook = {
        isbn13: resultRow.isbn13 as number,
        authors: resultRow.authors as string,
        publication: resultRow.publication_year as number,
        original_title: resultRow.original_title as string,
        title: resultRow.title as string,
        ratings: {
            average: resultRow.rating_avg as number,
            count: resultRow.rating_count as number,
            rating_1: resultRow.rating_1_star as number,
            rating_2: resultRow.rating_2_star as number,
            rating_3: resultRow.rating_3_star as number,
            rating_4: resultRow.rating_4_star as number,
            rating_5: resultRow.rating_5_star as number,
        } as IRatings,
        icons: {
            large: resultRow.image_url as string,
            small: resultRow.image_small_url as string,
        } as IUrlIcon,
    };
    return out;
};

export { IRatings, IUrlIcon, IBook, format };
