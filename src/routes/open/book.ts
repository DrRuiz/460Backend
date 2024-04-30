//express is the framework we're going to use to handle requests
import express, { NextFunction, Request, Response, Router } from 'express';
//Access the connection to Postgres Database
import { pool, validationFunctions } from '../../core/utilities';

const bookRouter: Router = express.Router();

const format = (resultRow) =>
    `isbn: {${resultRow.isbn13}} - author: [${resultRow.authors}] - publish year: [${resultRow.publication_year}]` +
    ` - original title: [${resultRow.original_title}] - title: [${resultRow.title}]` +
    ` - Average Rating: [${resultRow.rating_avg}] - Rating Count: [${resultRow.rating_count}] - Image URL: [${resultRow.image_url}]`;

/**
 * @api {get} /book Request to get all information on all books
 * @apiDescription Request to get all entries of all books
 * @apiName getAllBooks
 * @apiGroup Book
 *
 * @apiSuccess {String[]} entries Book entries with the following format:
 * "isbn: {<code>isbn</code>}
 * author: [<code>author</code>]
 * publish year: [<code>publication</code>]
 * original title: [<code>original_title</code>]
 * title: [<code>title</code>]
 * average rating: [<code>average</code>]
 * total ratings: [<code>count</code>]
 * 1 star ratings: [<code>rating_1</code>]
 * 2 star ratings: [<code>rating_2</code>]
 * 3 star ratings: [<code>rating_3</code>]
 * 4 star ratings: [<code>rating_4</code>]
 * 5 star ratings: [<code>rating_5</code>]
 * cover (large): [<code>large</code>]
 * cover (small): [<code>small</code>]"
 * 
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
 * @api {get} /book/?author=(authorName) Request to get all information related to the books with the provided author name
 * @apiDescription Request to get all entries of the books with the provided <code>author<code>
 * @apiName getAllBooksByAuthor
 * @apiGroup Book
 *
 * @apiQuery {string} auhor The name of the author whose books to retrieve
 *
 * @apiSuccess {String[]} entries Book entries with the following format:
 * "isbn: {<code>isbn</code>}
 * author: [<code>author</code>]
 * publish year: [<code>publication</code>]
 * original title: [<code>original_title</code>]
 * title: [<code>title</code>]
 * average rating: [<code>average</code>]
 * total ratings: [<code>count</code>]
 * 1 star ratings: [<code>rating_1</code>]
 * 2 star ratings: [<code>rating_2</code>]
 * 3 star ratings: [<code>rating_3</code>]
 * 4 star ratings: [<code>rating_4</code>]
 * 5 star ratings: [<code>rating_5</code>]
 * cover (large): [<code>large</code>]
 * cover (small): [<code>small</code>]"
 * 
 * @apiError (404: No messages) {String} message "No books with <code>author</code> found"
 */
// bookRouter.get(, () => {

// });

/**
 * @api {get} /book/?rating=(bookRating) Request to get all information related to the books that have the provided rating
 *
 * @apiDescription Request to get all entries of books with the provided <code>rating<code>
 *
 * @apiName getAllBooksWithTheRating
 * @apiGroup Book
 *
 * @apiQuery {int} rating The rating [0-5] of the books to retrieve
 *
 * @apiSuccess {String[]} entries Book entries with the following format:
 * "isbn: {<code>isbn</code>}
 * author: [<code>author</code>]
 * publish year: [<code>publication</code>]
 * original title: [<code>original_title</code>]
 * title: [<code>title</code>]
 * average rating: [<code>average</code>]
 * total ratings: [<code>count</code>]
 * 1 star ratings: [<code>rating_1</code>]
 * 2 star ratings: [<code>rating_2</code>]
 * 3 star ratings: [<code>rating_3</code>]
 * 4 star ratings: [<code>rating_4</code>]
 * 5 star ratings: [<code>rating_5</code>]
 * cover (large): [<code>large</code>]
 * cover (small): [<code>small</code>]"
 * 
 */

/**
 * @api {get} /book Request for an author's book
 * 
 * @apiDescription Request for the specified book title by the specified author
 * 
 * @apiQuery {String} author The author's name
 * @apiQuery {String} title The title of the book
 * 
 * @apiSuccess (Success 200) {String[]} entry Specified entry with the form: (see above format)
 * 
 * @apiError (400: Author does not exist) {String} message "Author does not exist."
 * @apiError (400: Book does not exist) {String} message "Book title does not exist."
 * @apiError (400: Book and Author do not match) {String} message "Book not written by specified author.
 */
// bookRouter.get(, () => {

// })

export { bookRouter };
