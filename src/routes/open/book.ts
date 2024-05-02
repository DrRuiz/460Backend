//express is the framework we're going to use to handle requests
import express, { NextFunction, Request, Response, Router } from 'express';
//Access the connection to Postgres Database
import { pool, validationFunctions } from '../../core/utilities';

const bookRouter: Router = express.Router();

const format = (resultRow) =>
    `Isbn: {${resultRow.isbn13}} - Author: [${resultRow.authors}] - Publish year: [${resultRow.publication_year}]` +
    ` - Original title: [${resultRow.original_title}] - Title: [${resultRow.title}]` +
    ` - Average Rating: [${resultRow.rating_avg}] - Rating Count: [${resultRow.rating_count}]` +
    ` - 1 star ratings: - [${resultRow.rating_1_star}] - 2 star ratings: - [${resultRow.rating_2_star}]` +
    ` - 3 star ratings: - [${resultRow.rating_3_star}] - 4 star ratings: - [${resultRow.rating_4_star}]` +
    ` - 5 star ratings: - [${resultRow.rating_5_star}] - Cover (large): [${resultRow.image_url}]` +
    ` - Cover (small): [${resultRow.image_small_url}]`;

/**
 * @api {get} /book Request to retrieve all books
 *
 * @apiDescription Request to get all entries of all books
 *
 * @apiName GetAllBooks
 * @apiGroup Book
 *
 * @apiSuccess {String[]} entries Book entries with the following format:
 * "Isbn: {<code>isbn13</code>} -
 * Author: [<code>authors</code>] -
 * Publish year: [<code>publication_year</code>] -
 * Original title: [<code>original_title</code>] -
 * Title: [<code>title</code>] -
 * Average rating: [<code>rating_avg</code>] -
 * Total ratings: [<code>rating_count</code>] -
 * 1 star ratings: [<code>rating_1_star</code>] -
 * 2 star ratings: [<code>rating_2_star</code>] -
 * 3 star ratings: [<code>rating_3_star</code>] -
 * 4 star ratings: [<code>rating_4_star</code>] -
 * 5 star ratings: [<code>rating_5_star</code>] -
 * Cover (large): [<code>image_url</code>] -
 * Cover (small): [<code>image_small_url</code>]"
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
 * @apiSuccess {String[]} entries Book entries with the following format:
 * "Isbn: {<code>isbn13</code>} -
 * Author: [<code>authors</code>] -
 * Publish year: [<code>publication_year</code>] -
 * Original title: [<code>original_title</code>] -
 * Title: [<code>title</code>] -
 * Average rating: [<code>rating_avg</code>] -
 * Total ratings: [<code>rating_count</code>] -
 * 1 star ratings: [<code>rating_1_star</code>] -
 * 2 star ratings: [<code>rating_2_star</code>] -
 * 3 star ratings: [<code>rating_3_star</code>] -
 * 4 star ratings: [<code>rating_4_star</code>] -
 * 5 star ratings: [<code>rating_5_star</code>] -
 * Cover (large): [<code>image_url</code>] -
 * Cover (small): [<code>image_small_url</code>]"
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
 * @apiSuccess {String[]} entries Book entries with the following format:
 * "Isbn: {<code>isbn13</code>} -
 * Author: [<code>authors</code>] -
 * Publish year: [<code>publication_year</code>] -
 * Original title: [<code>original_title</code>] -
 * Title: [<code>title</code>] -
 * Average rating: [<code>rating_avg</code>] -
 * Total ratings: [<code>rating_count</code>] -
 * 1 star ratings: [<code>rating_1_star</code>] -
 * 2 star ratings: [<code>rating_2_star</code>] -
 * 3 star ratings: [<code>rating_3_star</code>] -
 * 4 star ratings: [<code>rating_4_star</code>] -
 * 5 star ratings: [<code>rating_5_star</code>] -
 * Cover (large): [<code>image_url</code>] -
 * Cover (small): [<code>image_small_url</code>]"
 */

/**
 * @api {delete} /book Request to remove books by author
 *
 * @apiDescription Request to remove all books with the specified <code>author</code>
 *
 * @apiName DeleteBooksAuthor
 * @apiGroup Book
 *
 * @apiQuery {String} author The author's name
 *
 * @apiSuccess {String[]} entries Removed entries with the following format:
 * "Book Title: [<code>title</code>]"
 *
 * @apiError (404: Author does not exist) {String} message "Author does not exist."
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
 * @apiSuccess {String[]} entries Specified entries with the following format:
 * "Isbn: {<code>isbn13</code>} -
 * Author: [<code>authors</code>] -
 * Publish year: [<code>publication_year</code>] -
 * Original title: [<code>original_title</code>] -
 * Title: [<code>title</code>] -
 * Average rating: [<code>rating_avg</code>] -
 * Total ratings: [<code>rating_count</code>] -
 * 1 star ratings: [<code>rating_1_star</code>] -
 * 2 star ratings: [<code>rating_2_star</code>] -
 * 3 star ratings: [<code>rating_3_star</code>] -
 * 4 star ratings: [<code>rating_4_star</code>] -
 * 5 star ratings: [<code>rating_5_star</code>] -
 * Cover (large): [<code>image_url</code>] -
 * Cover (small): [<code>image_small_url</code>]"
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
 * @apiSuccess {String[]} entries Specified entries with the following format:
 * "Isbn: {<code>isbn13</code>} -
 * Author: [<code>authors</code>] -
 * Publish year: [<code>publication_year</code>] -
 * Original title: [<code>original_title</code>] -
 * Title: [<code>title</code>] -
 * Average rating: [<code>rating_avg</code>] -
 * Total ratings: [<code>rating_count</code>] -
 * 1 star ratings: [<code>rating_1_star</code>] -
 * 2 star ratings: [<code>rating_2_star</code>] -
 * 3 star ratings: [<code>rating_3_star</code>] -
 * 4 star ratings: [<code>rating_4_star</code>] -
 * 5 star ratings: [<code>rating_5_star</code>] -
 * Cover (large): [<code>image_url</code>] -
 * Cover (small): [<code>image_small_url</code>]"
 *
 * @apiError (400: Minimum out of range) {String} message "Minimum rating is less than 0"
 * @apiError (400: Maximum out of range) {String} message "Maximum rating is greater than 5"
 */

/**
 * @api {post} /book Request to add a book.
 *
 * @apiDescription Request to add a book with author name, isbn, publication year, and book title.
 *
 * @apiName putBook
 * @apiGroup Book
 *
 * @apiBody {String} author Author's name
 * @apiBody {int} isbn ISBN13 of the book
 * @apiBody {int} publication Year of publication
 * @apiBody {String} title Book title
 *
 * @apiSuccess (Success 201) {String} entry The String:
 * "isbn: {<code>isbn</code>} - author: [<code>author</code>] -
 *  publish year: [<code>publication</code>] - title: [<code>title</code>]"
 */

export { bookRouter };
