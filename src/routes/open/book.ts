//express is the framework we're going to use to handle requests
import express, { NextFunction, Request, Response, Router } from 'express';
//Access the connection to Postgres Database
import {
    pool,
    validationFunctions,
    IBook,
    IRatings,
    IUrlIcon,
} from '../../core/utilities';

const bookRouter: Router = express.Router();

const format = (resultRow) => {
    const out: IBook = {
        isbn13: resultRow.isbn13 as number,
        authors: resultRow.authors as string,
        publication: resultRow.publication_year as number,
        original_title: resultRow.original_title as string,
        title: resultRow.title as string,
        ratings: {
            average: resultRow.rating_avg,
            count: resultRow.rating_count,
            rating_1: resultRow.rating_1_star,
            rating_2: resultRow.rating_2_star,
            rating_3: resultRow.rating_3_star,
            rating_4: resultRow.rating_4_star,
            rating_5: resultRow.rating_5_star,
        } as IRatings,
        icons: {
            large: resultRow.image_url,
            small: resultRow.image_small_url,
        } as IUrlIcon,
    };
    return out;
};

/**
 * @api {get} /book Request to retrieve all books
 *
 * @apiDescription Request to get all entries of all books
 *
 * @apiName GetAllBooks
 * @apiGroup Book
 *
 * @apiSuccess {IBook[]} entries Book entries with the following format:
 * `isbn13: <code>isbn13</code>,
 * authors: <code>authors</code>,
 * publication: <code>publication_year</code>,
 * original_title: <code>original_title</code>,
 * title: <code>title</code>,
 * ratings: {
 *     average: <code>rating_avg</code>,
 *     count: <code>rating_count</code>,
 *     rating_1: <code>rating_1_star</code>,
 *     rating_2: <code>rating_2_star</code>,
 *     rating_3: <code>rating_3_star</code>,
 *     rating_4: <code>rating_4_star</code>,
 *     rating_5: <code>rating_5_star</code>,
 * },
 * icons: {
 *     large: <code>image_url</code>
 *     small: <code>image_small_url</code>
 * },`
 */
bookRouter.get('/getAll', (request: Request, response: Response) => {
    const theQuery = 'SELECT * FROM books';
    pool.query(theQuery)
        .then((result) => {
            response.status(200).send({
                entries: result.rows.map(format),
            });
        })
        .catch((error) => {
            console.error('DB Query error on GET all');
            console.error(error);
            response.status(500).send({
                message: 'server error - contact support',
            });
        });
});

/**
 * @api {get} /book Request to retrieve books by author
 *
 * @apiDescription Request to get all entries related to the books with the provided <code>author</code>
 *
 * @apiName GetBooksByAuthor
 * @apiGroup Book
 *
 * @apiQuery {string} author The name of the author whose books to retrieve
 *
 * @apiSuccess {IBook[]} entries Book entries with the following format:
 * `isbn13: <code>isbn13</code>,
 * authors: <code>authors</code>,
 * publication: <code>publication_year</code>,
 * original_title: <code>original_title</code>,
 * title: <code>title</code>,
 * ratings: {
 *     average: <code>rating_avg</code>,
 *     count: <code>rating_count</code>,
 *     rating_1: <code>rating_1_star</code>,
 *     rating_2: <code>rating_2_star</code>,
 *     rating_3: <code>rating_3_star</code>,
 *     rating_4: <code>rating_4_star</code>,
 *     rating_5: <code>rating_5_star</code>,
 * },
 * icons: {
 *     large: <code>image_url</code>
 *     small: <code>image_small_url</code>
 * },`
 *
 * @apiError (404: no books found) {String} message "No books with this <code>author</code> were found"
 */
bookRouter.get('/:author', (request: Request, response: Response) => {
    const theQuery = 'SELECT name, message, priority FROM Books WHERE = $1';
    const author = request.query.author;
});

/**
 * @api {get} /book Request to retrieve books by rating
 *
 * @apiDescription Request to get all entries related to the books that have the provided <code>rating</code>
 *
 * @apiName GetBooksByRating
 * @apiGroup Book
 *
 * @apiQuery {int} rating The rating [0-5] of the books to retrieve
 *
 * @apiSuccess {IBook[]} entries Book entries with the following format:
 * `isbn13: <code>isbn13</code>,
 * authors: <code>authors</code>,
 * publication: <code>publication_year</code>,
 * original_title: <code>original_title</code>,
 * title: <code>title</code>,
 * ratings: {
 *     average: <code>rating_avg</code>,
 *     count: <code>rating_count</code>,
 *     rating_1: <code>rating_1_star</code>,
 *     rating_2: <code>rating_2_star</code>,
 *     rating_3: <code>rating_3_star</code>,
 *     rating_4: <code>rating_4_star</code>,
 *     rating_5: <code>rating_5_star</code>,
 * },
 * icons: {
 *     large: <code>image_url</code>
 *     small: <code>image_small_url</code>
 * },`
 */

//Riley methods start here #########################################

/**
 * @api {get} /book Request for an author's book
 *
 * @apiDescription Request for the specified book title by the specified author
 *
 * @apiName GetBooksAuthorTitle
 * @apiGroup Book
 *
 * @apiQuery {String} author The author's name
 * @apiQuery {String} title The title of the book
 *
 * @apiSuccess {IBook[]} entries Specified entries with the following format:
 * `isbn13: <code>isbn13</code>,
 * authors: <code>authors</code>,
 * publication: <code>publication_year</code>,
 * original_title: <code>original_title</code>,
 * title: <code>title</code>,
 * ratings: {
 *     average: <code>rating_avg</code>,
 *     count: <code>rating_count</code>,
 *     rating_1: <code>rating_1_star</code>,
 *     rating_2: <code>rating_2_star</code>,
 *     rating_3: <code>rating_3_star</code>,
 *     rating_4: <code>rating_4_star</code>,
 *     rating_5: <code>rating_5_star</code>,
 * },
 * icons: {
 *     large: <code>image_url</code>
 *     small: <code>image_small_url</code>
 * },`
 *
 * @apiError (404: Author does not exist) {String} message "Author does not exist."
 * @apiError (404: Book does not exist) {String} message "Book title does not exist."
 * @apiError (400: Book and Author do not match) {String} message "Book not written by specified author.""
 */
// bookRouter.get(, () => {

// })

/**
 * @api {get} /book Request for books in a range of ratings.
 *
 * @apiDescription Request for all books with an average rating between the min and max values, inclusive.
 *
 * @apiName getAvgRatingRange
 * @apiGroup Book
 *
 * @apiQuery {int} min The minimum average rating to select
 * @apiQuery {int} max The maximum average rating to select
 *
 * @apiSuccess {IBook[]} entries Specified entries with the following format:
 * `isbn13: <code>isbn13</code>,
 * authors: <code>authors</code>,
 * publication: <code>publication_year</code>,
 * original_title: <code>original_title</code>,
 * title: <code>title</code>,
 * ratings: {
 *     average: <code>rating_avg</code>,
 *     count: <code>rating_count</code>,
 *     rating_1: <code>rating_1_star</code>,
 *     rating_2: <code>rating_2_star</code>,
 *     rating_3: <code>rating_3_star</code>,
 *     rating_4: <code>rating_4_star</code>,
 *     rating_5: <code>rating_5_star</code>,
 * },
 * icons: {
 *     large: <code>image_url</code>
 *     small: <code>image_small_url</code>
 * },`
 *
 * @apiError (400: Minimum out of range) {String} message "Minimum rating is less than 0"
 * @apiError (400: Maximum out of range) {String} message "Maximum rating is greater than 5"
 */

export { bookRouter };
